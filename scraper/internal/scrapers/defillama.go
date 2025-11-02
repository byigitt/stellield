package scrapers

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/stellar-hackathon/scraper/internal/models"
	"github.com/stellar-hackathon/scraper/internal/utils"
)

const (
	defiLlamaYieldURL  = "https://yields.llama.fi/pools"
	defiLlamaBridgeURL = "https://bridges.llama.fi/bridge"
	defiLlamaChainTVL  = "https://api.llama.fi/v2/historicalChainTvl"
	defiLlamaDexURL    = "https://api.llama.fi/overview/dexs"
)

// DefiLlamaScraper scrapes data from DeFiLlama APIs
type DefiLlamaScraper struct {
	client *utils.HTTPClient
	chains []string
}

// NewDefiLlamaScraper creates a new DeFiLlama scraper
func NewDefiLlamaScraper(chains []string) *DefiLlamaScraper {
	return &DefiLlamaScraper{
		client: utils.NewHTTPClient(10, 3), // 10 requests/sec, 3 retries
		chains: chains,
	}
}

// Name returns the scraper name
func (s *DefiLlamaScraper) Name() string {
	return "DeFiLlama"
}

// ScrapeYieldPools fetches all yield pools
func (s *DefiLlamaScraper) ScrapeYieldPools() ([]models.DefiLlamaPool, error) {
	utils.Logger.Info("Scraping DeFiLlama yield pools...")
	ctx := context.Background()

	body, err := s.client.Get(ctx, defiLlamaYieldURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch yield pools: %w", err)
	}

	var response models.DefiLlamaPoolsResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return nil, fmt.Errorf("failed to parse yield pools: %w", err)
	}

	// Filter pools with valid data
	var validPools []models.DefiLlamaPool
	for _, pool := range response.Data {
		// Skip pools without essential metrics
		if pool.TvlUsd == nil || pool.Apy == nil {
			continue
		}

		// Filter by chains if specified
		if len(s.chains) > 0 && !contains(s.chains, pool.Chain) {
			continue
		}

		// Handle nested predictions
		if pool.PredictedClass == nil {
			// Try to parse from poolMeta or other fields if available
		}

		validPools = append(validPools, pool)
	}

	utils.Logger.Infof("Scraped %d valid yield pools from DeFiLlama", len(validPools))
	return validPools, nil
}

// ScrapeBridgeStats fetches bridge statistics for given IDs
func (s *DefiLlamaScraper) ScrapeBridgeStats(bridgeIDs []int) ([]models.BridgeStats, error) {
	utils.Logger.Infof("Scraping DeFiLlama bridge stats for %d bridges...", len(bridgeIDs))
	ctx := context.Background()

	var bridges []models.BridgeStats
	for _, id := range bridgeIDs {
		url := fmt.Sprintf("%s/%d", defiLlamaBridgeURL, id)
		body, err := s.client.Get(ctx, url)
		if err != nil {
			utils.Logger.Warnf("Failed to fetch bridge %d: %v", id, err)
			continue
		}

		var bridge models.BridgeStats
		if err := json.Unmarshal(body, &bridge); err != nil {
			utils.Logger.Warnf("Failed to parse bridge %d: %v", id, err)
			continue
		}

		bridges = append(bridges, bridge)
	}

	utils.Logger.Infof("Scraped %d bridge stats from DeFiLlama", len(bridges))
	return bridges, nil
}

// ScrapeChainTVL fetches historical TVL for a chain
func (s *DefiLlamaScraper) ScrapeChainTVL(chain string) ([]models.ChainTvlDatum, error) {
	utils.Logger.Infof("Scraping DeFiLlama TVL history for %s...", chain)
	ctx := context.Background()

	url := fmt.Sprintf("%s/%s", defiLlamaChainTVL, chain)
	body, err := s.client.Get(ctx, url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch chain TVL: %w", err)
	}

	var tvlData []models.ChainTvlDatum
	if err := json.Unmarshal(body, &tvlData); err != nil {
		return nil, fmt.Errorf("failed to parse chain TVL: %w", err)
	}

	// Set chain name for each datum
	for i := range tvlData {
		tvlData[i].Chain = chain
	}

	utils.Logger.Infof("Scraped %d TVL data points for %s", len(tvlData), chain)
	return tvlData, nil
}

// ScrapeDexOverview fetches DEX statistics for a chain
func (s *DefiLlamaScraper) ScrapeDexOverview(chain string) (*models.DexOverview, error) {
	utils.Logger.Infof("Scraping DeFiLlama DEX overview for %s...", chain)
	ctx := context.Background()

	url := fmt.Sprintf("%s/%s?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true", defiLlamaDexURL, chain)
	body, err := s.client.Get(ctx, url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch DEX overview: %w", err)
	}

	var dexOverview models.DexOverview
	if err := json.Unmarshal(body, &dexOverview); err != nil {
		return nil, fmt.Errorf("failed to parse DEX overview: %w", err)
	}

	utils.Logger.Infof("Scraped DEX overview for %s", chain)
	return &dexOverview, nil
}

// Scrape implements the Scraper interface - scrapes all DeFiLlama data
func (s *DefiLlamaScraper) Scrape() (interface{}, error) {
	// For now, just scrape yield pools as the main dataset
	return s.ScrapeYieldPools()
}

// contains checks if a string is in a slice
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}
