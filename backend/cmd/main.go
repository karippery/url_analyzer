package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"url_analyzer/backend/auth"
	"url_analyzer/backend/handlers"
	"url_analyzer/backend/models"
	"url_analyzer/backend/repository"
	"url_analyzer/backend/worker"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
<<<<<<< HEAD

	"time"

=======
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
>>>>>>> 9d074d4dc77437dd54d70b912e8bb856a34fa6e7
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// Config holds application configuration.
type Config struct {
	DatabaseDSN        string
	ServerAddress      string
	WorkerPollInterval time.Duration
}

// loadConfig loads configuration from environment variables.
func loadConfig() (*Config, error) {
	// Construct DATABASE_DSN from individual environment variables
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")
	if dbUser == "" || dbPassword == "" || dbHost == "" || dbPort == "" || dbName == "" {
		return nil, fmt.Errorf("missing required database environment variables (DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME)")
	}
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPassword, dbHost, dbPort, dbName)

	addr := os.Getenv("SERVER_ADDRESS")
	if addr == "" {
		addr = ":8080"
	}

	pollIntervalStr := os.Getenv("WORKER_POLL_INTERVAL")
	pollInterval, err := time.ParseDuration(pollIntervalStr)
	if err != nil || pollIntervalStr == "" {
		pollInterval = 5 * time.Second
	}

	return &Config{
		DatabaseDSN:        dsn,
		ServerAddress:      addr,
		WorkerPollInterval: pollInterval,
	}, nil
}

// main initializes and runs the URL analyzer application.
func main() {
	// Initialize zerolog
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = zerolog.New(os.Stdout).With().Timestamp().Logger()

	// Load configuration
	cfg, err := loadConfig()
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to load configuration")
	}

	// Set up context for graceful shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Set up signal handling
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Database setup
	db, err := gorm.Open(mysql.Open(cfg.DatabaseDSN), &gorm.Config{})
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to database")
	}

	// Migrate models
	if err := db.WithContext(ctx).AutoMigrate(&models.User{}, &models.TokenPair{}, &models.CrawlRequest{}, &models.CrawlResult{}); err != nil {
		log.Fatal().Err(err).Msg("Failed to migrate database models")
	}

	// Initialize services
	authService := auth.NewAuthService()
	repo := repository.NewDBRepository(db)
	workerCfg := &worker.Config{PollInterval: cfg.WorkerPollInterval}
	workerInstance := worker.NewWorker(repo, workerCfg)

	// Start worker
	if err := workerInstance.Start(); err != nil {
		log.Fatal().Err(err).Msg("Failed to start worker")
	}

	// Initialize handlers
	mainHandler := handlers.NewHandler(repo)
	authHandler := handlers.NewAuthHandler(db, authService)

	// Create router
	r := gin.Default()

	// Configure CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Auth routes
	r.POST("/api/register", authHandler.Register)
	r.POST("/api/login", authHandler.Login)
	r.POST("/api/refresh", authHandler.Refresh)

	// Protected routes
	protected := r.Group("/api")
	protected.Use(auth.JWTMiddleware(authService))
	{
		protected.POST("/crawl", mainHandler.SubmitURL)
		protected.GET("/results", mainHandler.GetResults)
	}

	// Start server in a goroutine
	srv := &http.Server{
		Addr:    cfg.ServerAddress,
		Handler: r,
	}

	go func() {
		log.Info().Str("address", cfg.ServerAddress).Msg("Starting server")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("Failed to start server")
		}
	}()

	// Wait for shutdown signal
	<-sigChan
	log.Info().Msg("Received shutdown signal, stopping application")

	// Graceful shutdown
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	// Stop worker
	workerInstance.Stop()

	// Shutdown server
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Error().Err(err).Msg("Failed to shutdown server gracefully")
	}

	log.Info().Msg("Application shutdown complete")
}
