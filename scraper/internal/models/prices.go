package models

// CoinGeckoPrice represents a token price from CoinGecko
type CoinGeckoPrice struct {
	AssetID   string  `json:"asset_id" csv:"asset_id"`
	UsdPrice  float64 `json:"usd_price" csv:"usd_price"`
	Timestamp string  `json:"timestamp" csv:"timestamp"`
}

// CoinGeckoPriceResponse wraps the API response
type CoinGeckoPriceResponse map[string]struct {
	Usd float64 `json:"usd"`
}

// MarinadeAPY represents Marinade staking APY
type MarinadeAPY struct {
	Value      float64 `json:"value" csv:"value"`
	EndTime    string  `json:"end_time" csv:"end_time"`
	EndPrice   float64 `json:"end_price" csv:"end_price"`
	StartTime  string  `json:"start_time" csv:"start_time"`
	StartPrice float64 `json:"start_price" csv:"start_price"`
}

// MarinadeTVL represents Marinade total value locked
type MarinadeTVL struct {
	TotalUsd float64 `json:"total_usd" csv:"total_usd"`
	TotalSol float64 `json:"total_sol" csv:"total_sol"`
}

// AggreLendEntry represents a lending market entry
type AggreLendEntry struct {
	Apy    string `json:"apy" csv:"apy"`
	Market string `json:"market" csv:"market"`
}

// AggreLendCoinData represents lending data for a coin
type AggreLendCoinData struct {
	Apy         []AggreLendEntry `json:"apy"`
	BestApy     string           `json:"bestApy"`
	BestMarket  string           `json:"bestMarket"`
	LastUpdated string           `json:"lastUpdated"`
}

// AggreLendResponse wraps the API response
type AggreLendResponse struct {
	Timestamp string                       `json:"timestamp"`
	Coins     map[string]AggreLendCoinData `json:"coins"`
}

// AggreLendFlatEntry represents a flattened entry for CSV export
type AggreLendFlatEntry struct {
	Coin        string `csv:"coin"`
	Market      string `csv:"market"`
	Apy         string `csv:"apy"`
	BestApy     string `csv:"best_apy"`
	BestMarket  string `csv:"best_market"`
	LastUpdated string `csv:"last_updated"`
	Timestamp   string `csv:"timestamp"`
}
