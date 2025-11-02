package scrapers

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/stellar-hackathon/scraper/internal/models"
	"github.com/stellar-hackathon/scraper/internal/utils"
)

// StellarScraper scrapes data from Stellar Horizon API
type StellarScraper struct {
	client     *utils.HTTPClient
	horizonURL string
	limit      int
}

// NewStellarScraper creates a new Stellar scraper
func NewStellarScraper(horizonURL string, limit int) *StellarScraper {
	if horizonURL == "" {
		horizonURL = "https://horizon.stellar.org"
	}
	if limit == 0 {
		limit = 200
	}

	return &StellarScraper{
		client:     utils.NewHTTPClient(5, 3), // 5 requests/sec, 3 retries
		horizonURL: horizonURL,
		limit:      limit,
	}
}

// Name returns the scraper name
func (s *StellarScraper) Name() string {
	return "Stellar"
}

// ScrapeLiquidityPools fetches Stellar liquidity pools
func (s *StellarScraper) ScrapeLiquidityPools() ([]models.StellarLiquidityPool, error) {
	utils.Logger.Infof("Scraping Stellar liquidity pools from %s...", s.horizonURL)
	ctx := context.Background()

	url := fmt.Sprintf("%s/liquidity_pools?limit=%d&order=desc", s.horizonURL, s.limit)
	body, err := s.client.Get(ctx, url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch liquidity pools: %w", err)
	}

	var response models.StellarLiquidityResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return nil, fmt.Errorf("failed to parse liquidity pools: %w", err)
	}

	pools := response.Embedded.Records

	// Flatten reserves for CSV export
	for i := range pools {
		pools[i].FlattenReserves()
	}

	utils.Logger.Infof("Scraped %d Stellar liquidity pools", len(pools))
	return pools, nil
}

// Scrape implements the Scraper interface
func (s *StellarScraper) Scrape() (interface{}, error) {
	return s.ScrapeLiquidityPools()
}
