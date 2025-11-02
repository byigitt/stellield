package models

import "time"

// Scraper interface defines common methods for all scrapers
type Scraper interface {
	Name() string
	Scrape() (interface{}, error)
}

// ScraperResult wraps scraper output with metadata
type ScraperResult struct {
	Name      string
	Data      interface{}
	Timestamp time.Time
	Error     error
	RecordCount int
}
