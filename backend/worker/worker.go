package worker

import (
	"context"
	"fmt"
	"sync"
	"time"

	"url_analyzer/backend/crawler"
	"url_analyzer/backend/models"
	"url_analyzer/backend/repository"

	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

// Worker processes crawl requests from the database.
type Worker struct {
	repo    *repository.DBRepository
	crawler *crawler.Crawler
	ctx     context.Context
	cancel  context.CancelFunc
	wg      sync.WaitGroup
}

// Config holds worker configuration settings.
type Config struct {
	PollInterval time.Duration // Interval to check for new queued requests
}

// NewWorker creates a new Worker with the provided repository and default configuration.
func NewWorker(repo *repository.DBRepository, cfg *Config) *Worker {
	if cfg == nil {
		cfg = &Config{
			PollInterval: 5 * time.Second,
		}
	}
	ctx, cancel := context.WithCancel(context.Background())
	return &Worker{
		repo:    repo,
		crawler: crawler.NewCrawler(),
		ctx:     ctx,
		cancel:  cancel,
	}
}

// Start begins processing crawl requests in a loop until stopped.
func (w *Worker) Start() error {
	w.wg.Add(1)
	go func() {
		defer w.wg.Done()
		ticker := time.NewTicker(5 * time.Second) // Use config.PollInterval in a real implementation
		defer ticker.Stop()

		for {
			select {
			case <-w.ctx.Done():
				log.Info().Msg("Worker stopped")
				return
			case <-ticker.C:
				if err := w.processNextRequest(); err != nil {
					log.Error().Err(err).Msg("Failed to process next request")
				}
			}
		}
	}()
	log.Info().Msg("Worker started")
	return nil
}

// Stop gracefully shuts down the worker.
func (w *Worker) Stop() {
	w.cancel()
	w.wg.Wait()
	log.Info().Msg("Worker shutdown complete")
}

// processNextRequest retrieves and processes the next queued crawl request.
func (w *Worker) processNextRequest() error {
	var request models.CrawlRequest
	err := w.repo.DB.WithContext(w.ctx).
		Where("status = ?", repository.StatusQueued).
		First(&request).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Debug().Msg("No queued crawl requests found")
			return nil // No queued requests, silently return
		}
		return fmt.Errorf("failed to fetch queued request: %w", err)
	}

	return w.processRequest(w.ctx, &request)
}

// processRequest processes a single crawl request.
func (w *Worker) processRequest(ctx context.Context, request *models.CrawlRequest) error {
	// Update status to processing
	if err := w.repo.UpdateCrawlRequestStatus(ctx, request.ID, repository.StatusProcessing); err != nil {
		return fmt.Errorf("failed to update status to processing for request ID %d: %w", request.ID, err)
	}

	// Crawl the URL
	data, err := w.crawler.Crawl(request.URL)
	if err != nil {
		log.Error().Err(err).Str("url", request.URL).Msg("Failed to crawl URL")
		if updateErr := w.repo.UpdateCrawlRequestStatus(ctx, request.ID, repository.StatusFailed); updateErr != nil {
			log.Error().Err(updateErr).Uint("request_id", request.ID).Msg("Failed to update status to failed")
		}
		return fmt.Errorf("failed to crawl URL %s: %w", request.URL, err)
	}

	// Save results
	result := &models.CrawlResult{
		CrawlRequestID: request.ID,
		HTMLVersion:    data.HTMLVersion,
		Title:          data.Title,
		H1Count:        data.H1Count,
		H2Count:        data.H2Count,
		H3Count:        data.H3Count,
		H4Count:        data.H4Count,
		H5Count:        data.H5Count,
		H6Count:        data.H6Count,
		InternalLinks:  data.InternalLinks,
		ExternalLinks:  data.ExternalLinks,
		BrokenLinks:    data.BrokenLinks,
		HasLoginForm:   data.HasLoginForm,
		ProcessingTime: data.ProcessingTime,
		CreatedAt:      time.Now(),
	}

	if err := w.repo.SaveCrawlResult(ctx, result); err != nil {
		log.Error().Err(err).Str("url", request.URL).Msg("Failed to save crawl result")
		if updateErr := w.repo.UpdateCrawlRequestStatus(ctx, request.ID, repository.StatusFailed); updateErr != nil {
			log.Error().Err(updateErr).Uint("request_id", request.ID).Msg("Failed to update status to failed")
		}
		return fmt.Errorf("failed to save crawl result for URL %s: %w", request.URL, err)
	}

	// Update status to completed
	if err := w.repo.UpdateCrawlRequestStatus(ctx, request.ID, repository.StatusCompleted); err != nil {
		log.Error().Err(err).Uint("request_id", request.ID).Msg("Failed to update status to completed")
		return fmt.Errorf("failed to update status to completed for request ID %d: %w", request.ID, err)
	}

	log.Info().
		Str("url", request.URL).
		Uint("request_id", request.ID).
		Msg("Successfully processed crawl request")
	return nil
}
