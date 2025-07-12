package models

import "time"

type CrawlRequest struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	URL       string    `json:"url" gorm:"not null"`
	Status    string    `json:"status"` // queued, running, done, error
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CrawlResult struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	CrawlRequestID  uint      `json:"crawl_request_id" gorm:"not null"`
	CrawlRequest    CrawlRequest `json:"-"`
	HTMLVersion     string    `json:"html_version"`
	Title           string    `json:"title"`
	H1Count         int       `json:"h1_count"`
	H2Count         int       `json:"h2_count"`
	H3Count         int       `json:"h3_count"`
	H4Count         int       `json:"h4_count"`
	H5Count         int       `json:"h5_count"`
	H6Count         int       `json:"h6_count"`
	InternalLinks   int       `json:"internal_links"`
	ExternalLinks   int       `json:"external_links"`
	BrokenLinks     int       `json:"broken_links"`
	HasLoginForm    bool      `json:"has_login_form"`
	ProcessingTime  float64   `json:"processing_time"` // in seconds
	CreatedAt       time.Time `json:"created_at"`
}