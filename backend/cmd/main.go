package main

import (
	"log"
	"url_analyzer/backend/handlers"
	"url_analyzer/backend/models"
	"url_analyzer/backend/repository"
	"url_analyzer/backend/worker"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)


func main() {
	// Initialize database
	dsn := "user:password@tcp(db:3306)/url_analyzer?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Migrate the schema
	if err := db.AutoMigrate(&models.CrawlRequest{}, &models.CrawlResult{}); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Initialize repository
	repo := repository.NewDBRepository(db)

	// Initialize and start worker
	worker := worker.NewWorker(repo)
	worker.Start()

	// Initialize HTTP server
	handler := handlers.NewHandler(repo)

	r := gin.Default()

	r.POST("/api/crawl", handler.SubmitURL)
	r.GET("/api/results", handler.GetResults)

	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
