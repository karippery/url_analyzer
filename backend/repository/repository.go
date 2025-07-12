package repository

import (
	"url_analyzer/backend/models"

	"gorm.io/gorm"
)

type DBRepository struct {
	DB *gorm.DB
}

func NewDBRepository(db *gorm.DB) *DBRepository {
	return &DBRepository{DB: db}
}

func (r *DBRepository) CreateCrawlRequest(url string) (*models.CrawlRequest, error) {
	request := &models.CrawlRequest{
		URL:    url,
		Status: "queued",
	}
	result := r.DB.Create(request)
	return request, result.Error
}

func (r *DBRepository) GetCrawlRequest(id uint) (*models.CrawlRequest, error) {
	var request models.CrawlRequest
	result := r.DB.First(&request, id)
	return &request, result.Error
}

func (r *DBRepository) GetCrawlResults(page, pageSize int) ([]models.CrawlResult, error) {
	var results []models.CrawlResult
	offset := (page - 1) * pageSize
	result := r.DB.Preload("CrawlRequest").Offset(offset).Limit(pageSize).Find(&results)
	return results, result.Error
}

func (r *DBRepository) UpdateCrawlRequestStatus(id uint, status string) error {
	return r.DB.Model(&models.CrawlRequest{}).Where("id = ?", id).Update("status", status).Error
}

func (r *DBRepository) SaveCrawlResult(result *models.CrawlResult) error {
	return r.DB.Create(result).Error
}

func (r *DBRepository) GetPaginatedResults(page, pageSize int) ([]models.CrawlResult, int64, int64, error) {
	var results []models.CrawlResult
	var totalItems int64

	// Count total records
	if err := r.DB.Model(&models.CrawlResult{}).Count(&totalItems).Error; err != nil {
		return nil, 0, 0, err
	}

	// Calculate total pages
	totalPages := totalItems / int64(pageSize)
	if totalItems%int64(pageSize) != 0 {
		totalPages++
	}

	// Get paginated results
	offset := (page - 1) * pageSize
	if err := r.DB.Preload("CrawlRequest").
		Offset(offset).
		Limit(pageSize).
		Order("created_at DESC").
		Find(&results).Error; err != nil {
		return nil, 0, 0, err
	}

	return results, totalItems, totalPages, nil
}
