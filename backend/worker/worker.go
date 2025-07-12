package worker

import (
	"log"
	"time"

	"url_analyzer/backend/crawler"
	"url_analyzer/backend/models"
	"url_analyzer/backend/repository"
)

type Worker struct {
	repo    *repository.DBRepository
	crawler *crawler.Crawler
}

func NewWorker(repo *repository.DBRepository) *Worker {
	return &Worker{
		repo:    repo,
		crawler: crawler.NewCrawler(),
	}
}

func (w *Worker) Start() {
	go func() {
		for {
			// Get next queued request
			var request models.CrawlRequest
			if err := w.repo.DB.Where("status = ?", "queued").First(&request).Error; err == nil {
				// Process the request
				w.processRequest(&request)
			} else {
				// No queued requests, sleep for a while
				time.Sleep(5 * time.Second)
			}
		}
	}()
}

func (w *Worker) processRequest(request *models.CrawlRequest) {
	// Update status to running
	w.repo.UpdateCrawlRequestStatus(request.ID, "running")

	// Process the URL
	data, err := w.crawler.Crawl(request.URL)
	if err != nil {
		log.Printf("Error crawling %s: %v", request.URL, err)
		w.repo.UpdateCrawlRequestStatus(request.ID, "error")
		return
	}

	// Save results
	result := models.CrawlResult{
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
	}

	if err := w.repo.SaveCrawlResult(&result); err != nil {
		log.Printf("Error saving results for %s: %v", request.URL, err)
		w.repo.UpdateCrawlRequestStatus(request.ID, "error")
		return
	}

	// Update status to done
	w.repo.UpdateCrawlRequestStatus(request.ID, "done")
}
