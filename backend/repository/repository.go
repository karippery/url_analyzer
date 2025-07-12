package repository

import (
	"context"
	"fmt"
	"time"

	"url_analyzer/backend/models"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// Status constants for CrawlRequest
const (
	StatusQueued     = "queued"
	StatusProcessing = "processing"
	StatusCompleted  = "completed"
	StatusFailed     = "failed"
)

// Pagination constants
const (
	DefaultPage     = 1
	DefaultPageSize = 10
	MaxPageSize     = 100
)

// DBRepository handles database operations for crawl requests and results.
type DBRepository struct {
	DB *gorm.DB
}

// NewDBRepository creates a new DBRepository with the provided GORM DB instance.
func NewDBRepository(db *gorm.DB) *DBRepository {
	return &DBRepository{DB: db}
}

// CreateCrawlRequest creates a new crawl request with the given URL.
func (r *DBRepository) CreateCrawlRequest(ctx context.Context, url string) (*models.CrawlRequest, error) {
	request := &models.CrawlRequest{
		URL:       url,
		Status:    StatusQueued,
		CreatedAt: time.Now(),
	}
	return request, r.DB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		return tx.Create(request).Error
	})
}

// GetCrawlRequest retrieves a crawl request by ID.
func (r *DBRepository) GetCrawlRequest(ctx context.Context, id uint) (*models.CrawlRequest, error) {
	var request models.CrawlRequest
	if err := r.DB.WithContext(ctx).First(&request, id).Error; err != nil {
		return nil, fmt.Errorf("failed to get crawl request with ID %d: %w", id, err)
	}
	return &request, nil
}

// UpdateCrawlRequestStatus updates the status of a crawl request.
func (r *DBRepository) UpdateCrawlRequestStatus(ctx context.Context, id uint, status string) error {
	if err := r.DB.WithContext(ctx).Model(&models.CrawlRequest{}).
		Where("id = ?", id).
		Update("status", status).Error; err != nil {
		return fmt.Errorf("failed to update crawl request status for ID %d: %w", id, err)
	}
	return nil
}

// SaveCrawlResult saves a crawl result to the database.
func (r *DBRepository) SaveCrawlResult(ctx context.Context, result *models.CrawlResult) error {
	return r.DB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		return tx.Create(result).Error
	})
}

// GetPaginatedResults retrieves paginated crawl results with metadata.
func (r *DBRepository) GetPaginatedResults(ctx context.Context, page, pageSize int) ([]models.CrawlResult, int64, int64, error) {
	// Validate pagination parameters
	if page < 1 {
		page = DefaultPage
	}
	if pageSize < 1 || pageSize > MaxPageSize {
		pageSize = DefaultPageSize
	}

	var results []models.CrawlResult
	var totalItems int64

	// Count total records
	if err := r.DB.WithContext(ctx).Model(&models.CrawlResult{}).Count(&totalItems).Error; err != nil {
		return nil, 0, 0, fmt.Errorf("failed to count crawl results: %w", err)
	}

	// Calculate total pages
	totalPages := totalItems / int64(pageSize)
	if totalItems%int64(pageSize) != 0 {
		totalPages++
	}

	// Get paginated results
	offset := (page - 1) * pageSize
	if err := r.DB.WithContext(ctx).
		Preload(clause.Associations).
		Offset(offset).
		Limit(pageSize).
		Order("created_at DESC").
		Find(&results).Error; err != nil {
		return nil, 0, 0, fmt.Errorf("failed to fetch paginated results: %w", err)
	}

	return results, totalItems, totalPages, nil
}
