package scrapers

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/stellar-hackathon/scraper/internal/models"
	"github.com/stellar-hackathon/scraper/internal/utils"
)

const marinadeBaseURL = "https://api.marinade.finance"

// MarinadeScraper scrapes data from Marinade Finance API
type MarinadeScraper struct {
	client *utils.HTTPClient
}

// NewMarinadeScraper creates a new Marinade scraper
func NewMarinadeScraper() *MarinadeScraper {
	return &MarinadeScraper{
		client: utils.NewHTTPClient(5, 3),
	}
}

// Name returns the scraper name
func (s *MarinadeScraper) Name() string {
	return "Marinade"
}

// ScrapeAPY fetches 7-day APY data
func (s *MarinadeScraper) ScrapeAPY() (*models.MarinadeAPY, error) {
	utils.Logger.Info("Scraping Marinade APY data...")
	ctx := context.Background()

	url := fmt.Sprintf("%s/msol/apy/7d", marinadeBaseURL)
	body, err := s.client.Get(ctx, url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch APY: %w", err)
	}

	var apy models.MarinadeAPY
	if err := json.Unmarshal(body, &apy); err != nil {
		return nil, fmt.Errorf("failed to parse APY: %w", err)
	}

	utils.Logger.Infof("Scraped Marinade APY: %.2f%%", apy.Value)
	return &apy, nil
}

// ScrapeTVL fetches total value locked
func (s *MarinadeScraper) ScrapeTVL() (*models.MarinadeTVL, error) {
	utils.Logger.Info("Scraping Marinade TVL data...")
	ctx := context.Background()

	url := fmt.Sprintf("%s/tlv", marinadeBaseURL)
	body, err := s.client.Get(ctx, url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch TVL: %w", err)
	}

	var tvl models.MarinadeTVL
	if err := json.Unmarshal(body, &tvl); err != nil {
		return nil, fmt.Errorf("failed to parse TVL: %w", err)
	}

	utils.Logger.Infof("Scraped Marinade TVL: $%.2f (%.2f SOL)", tvl.TotalUsd, tvl.TotalSol)
	return &tvl, nil
}

// Scrape implements the Scraper interface
func (s *MarinadeScraper) Scrape() (interface{}, error) {
	apy, err := s.ScrapeAPY()
	if err != nil {
		return nil, err
	}
	return []models.MarinadeAPY{*apy}, nil
}
