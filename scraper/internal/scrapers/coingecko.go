package scrapers

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/stellar-hackathon/scraper/internal/models"
	"github.com/stellar-hackathon/scraper/internal/utils"
)

const coinGeckoURL = "https://api.coingecko.com/api/v3/simple/price"

// CoinGeckoScraper scrapes price data from CoinGecko
type CoinGeckoScraper struct {
	client  *utils.HTTPClient
	assetIDs []string
}

// NewCoinGeckoScraper creates a new CoinGecko scraper
func NewCoinGeckoScraper(assetIDs []string) *CoinGeckoScraper {
	if len(assetIDs) == 0 {
		// Default to popular crypto assets
		assetIDs = []string{"ethereum", "bitcoin", "solana", "stellar", "polygon"}
	}

	return &CoinGeckoScraper{
		client:   utils.NewHTTPClient(10, 3), // CoinGecko free tier: ~50 req/min
		assetIDs: assetIDs,
	}
}

// Name returns the scraper name
func (s *CoinGeckoScraper) Name() string {
	return "CoinGecko"
}

// ScrapePrices fetches current prices for configured assets
func (s *CoinGeckoScraper) ScrapePrices() ([]models.CoinGeckoPrice, error) {
	utils.Logger.Infof("Scraping CoinGecko prices for %d assets...", len(s.assetIDs))
	ctx := context.Background()

	// CoinGecko allows up to 250 ids per request
	url := fmt.Sprintf("%s?ids=%s&vs_currencies=usd", coinGeckoURL, strings.Join(s.assetIDs, ","))
	
	body, err := s.client.Get(ctx, url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch prices: %w", err)
	}

	var response models.CoinGeckoPriceResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return nil, fmt.Errorf("failed to parse prices: %w", err)
	}

	timestamp := time.Now().Format(time.RFC3339)
	var prices []models.CoinGeckoPrice
	for assetID, priceData := range response {
		prices = append(prices, models.CoinGeckoPrice{
			AssetID:   assetID,
			UsdPrice:  priceData.Usd,
			Timestamp: timestamp,
		})
	}

	utils.Logger.Infof("Scraped %d prices from CoinGecko", len(prices))
	return prices, nil
}

// Scrape implements the Scraper interface
func (s *CoinGeckoScraper) Scrape() (interface{}, error) {
	return s.ScrapePrices()
}
