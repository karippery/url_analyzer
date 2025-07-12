package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"url_analyzer/backend/repository"

	"github.com/gin-gonic/gin"
)

// Handler manages HTTP request handling for crawl operations.
type Handler struct {
	repo *repository.DBRepository
}

// NewHandler creates a new Handler with the provided repository.
func NewHandler(repo *repository.DBRepository) *Handler {
	return &Handler{repo: repo}
}

// SubmitURL handles the submission of a URL for crawling.
func (h *Handler) SubmitURL(c *gin.Context) {
	var request struct {
		URL string `json:"url" binding:"required,url"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid URL format"})
		return
	}

	ctx := c.Request.Context()
	crawlRequest, err := h.repo.CreateCrawlRequest(ctx, request.URL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create crawl request"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data":    crawlRequest,
		"message": "URL submitted successfully",
	})
}

// GetResults handles retrieval of paginated crawl results.
func (h *Handler) GetResults(c *gin.Context) {
	page, err := parseQueryInt(c, "page", repository.DefaultPage)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid page parameter"})
		return
	}

	pageSize, err := parseQueryInt(c, "pageSize", repository.DefaultPageSize)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid pageSize parameter"})
		return
	}

	ctx := c.Request.Context()
	results, totalItems, totalPages, err := h.repo.GetPaginatedResults(ctx, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch results"})
		return
	}

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
		"message": "Results fetched successfully",
	})
}

// parseQueryInt parses an integer query parameter with a default value.
func parseQueryInt(c *gin.Context, key string, defaultValue int) (int, error) {
	valueStr := c.DefaultQuery(key, strconv.Itoa(defaultValue))
	value, err := strconv.Atoi(valueStr)
	if err != nil || value < 1 {
		return defaultValue, fmt.Errorf("invalid %s parameter", key)
	}
	if key == "pageSize" && value > repository.MaxPageSize {
		return repository.MaxPageSize, nil
	}
	return value, nil
}
