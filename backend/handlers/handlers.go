package handlers

import (
	"net/http"
	"strconv"

	"url_analyzer/backend/repository"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	repo *repository.DBRepository
}

func NewHandler(repo *repository.DBRepository) *Handler {
	return &Handler{repo: repo}
}

func (h *Handler) SubmitURL(c *gin.Context) {
	var request struct {
		URL string `json:"url" binding:"required,url"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	crawlRequest, err := h.repo.CreateCrawlRequest(request.URL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create crawl request"})
		return
	}

	c.JSON(http.StatusCreated, crawlRequest)
}

func (h *Handler) GetResults(c *gin.Context) {
	// Parse pagination parameters with defaults
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

	// Validate parameters
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	// Get paginated results from repository
	results, totalItems, totalPages, err := h.repo.GetPaginatedResults(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch results"})
		return
	}

	// Return response with pagination metadata
	c.JSON(http.StatusOK, gin.H{
		"data": results,
		"pagination": gin.H{
			"currentPage": page,
			"pageSize":    pageSize,
			"totalItems":  totalItems,
			"totalPages":  totalPages,
			"hasNext":     page < int(totalPages),
			"hasPrev":     page > 1,
		},
	})
}
