package scrapers

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/stellar-hackathon/scraper/internal/models"
	"github.com/stellar-hackathon/scraper/internal/utils"
)

const aggreLendURL = "https://app.aggrelend.com/api/get-apy-list"

// AggreLendScraper scrapes data from AggreLend API
type AggreLendScraper struct {
	client *utils.HTTPClient
	tokens []string
}

// NewAggreLendScraper creates a new AggreLend scraper
func NewAggreLendScraper(tokens []string) *AggreLendScraper {
	if len(tokens) == 0 {
		tokens = []string{"SOL", "USDC", "ETH"}
	}

	return &AggreLendScraper{
		client: utils.NewHTTPClient(5, 3),
		tokens: tokens,
	}
}

// Name returns the scraper name
func (s *AggreLendScraper) Name() string {
	return "AggreLend"
}

// ScrapeRates fetches lending rates for all configured tokens
func (s *AggreLendScraper) ScrapeRates() ([]models.AggreLendFlatEntry, error) {
	utils.Logger.Infof("Scraping AggreLend rates for %d tokens...", len(s.tokens))
	ctx := context.Background()

	var allEntries []models.AggreLendFlatEntry

	for _, token := range s.tokens {
		url := fmt.Sprintf("%s?token=%s&includeMeta=true", aggreLendURL, token)
		body, err := s.client.Get(ctx, url)
		if err != nil {
			utils.Logger.Warnf("Failed to fetch rates for %s: %v", token, err)
			continue
		}

		var response models.AggreLendResponse
		if err := json.Unmarshal(body, &response); err != nil {
			utils.Logger.Warnf("Failed to parse rates for %s: %v", token, err)
			continue
		}

		// Flatten the nested structure
		for coinName, coinData := range response.Coins {
			for _, entry := range coinData.Apy {
				allEntries = append(allEntries, models.AggreLendFlatEntry{
					Coin:        coinName,
					Market:      entry.Market,
					Apy:         entry.Apy,
					BestApy:     coinData.BestApy,
					BestMarket:  coinData.BestMarket,
					LastUpdated: coinData.LastUpdated,
					Timestamp:   response.Timestamp,
				})
			}
		}
	}

	utils.Logger.Infof("Scraped %d lending rate entries from AggreLend", len(allEntries))
	return allEntries, nil
}

// Scrape implements the Scraper interface
func (s *AggreLendScraper) Scrape() (interface{}, error) {
	return s.ScrapeRates()
}
