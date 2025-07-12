package main

import (
	"log"
	"url_analyzer/backend/auth"
	"url_analyzer/backend/handlers"
	"url_analyzer/backend/models"
	"url_analyzer/backend/repository"
	"url_analyzer/backend/worker"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	// Database setup
	dsn := "user:password@tcp(db:3306)/url_analyzer?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Migrate models
	db.AutoMigrate(&models.User{}, &models.TokenPair{}, &models.CrawlRequest{}, &models.CrawlResult{})

	// Initialize services
	authService := auth.NewAuthService()
	repo := repository.NewDBRepository(db)
	worker := worker.NewWorker(repo)
	worker.Start()

	// Initialize handlers
	mainHandler := handlers.NewHandler(repo)
	authHandler := handlers.NewAuthHandler(db, authService)

	// Create router
	r := gin.Default()

	// Auth routes
	r.POST("/api/register", authHandler.Register)
	r.POST("/api/login", authHandler.Login)
	r.POST("/api/refresh", authHandler.Refresh)

	// Protected routes
	protected := r.Group("/api")
	protected.Use(auth.JWTMiddleware(authService)) // Your JWT middleware
	{
		protected.POST("/crawl", mainHandler.SubmitURL)
		protected.GET("/results", mainHandler.GetResults)
	}

	// Start server
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
