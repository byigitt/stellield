package models

// DefiLlamaPool represents a yield pool from DeFiLlama
type DefiLlamaPool struct {
	Chain              string   `json:"chain" csv:"chain"`
	Project            string   `json:"project" csv:"project"`
	Symbol             string   `json:"symbol" csv:"symbol"`
	Pool               string   `json:"pool" csv:"pool"`
	TvlUsd             *float64 `json:"tvlUsd" csv:"tvl_usd"`
	Apy                *float64 `json:"apy" csv:"apy"`
	ApyBase            *float64 `json:"apyBase" csv:"apy_base"`
	ApyReward          *float64 `json:"apyReward" csv:"apy_reward"`
	ApyMean30d         *float64 `json:"apyMean30d" csv:"apy_mean_30d"`
	ApyPct7D           *float64 `json:"apyPct7D" csv:"apy_pct_7d"`
	PoolMeta           *string  `json:"poolMeta" csv:"pool_meta"`
	Exposure           *string  `json:"exposure" csv:"exposure"`
	IlRisk             *string  `json:"ilRisk" csv:"il_risk"`
	RewardTokens       []string `json:"rewardTokens" csv:"-"`
	UnderlyingTokens   []string `json:"underlyingTokens" csv:"-"`
	Stablecoin         *bool    `json:"stablecoin" csv:"stablecoin"`
	PredictedClass     *string  `json:"predictedClass" csv:"predicted_class"`
	PredictedProbability *float64 `json:"predictedProbability" csv:"predicted_probability"`
	BinnedConfidence   *int     `json:"binnedConfidence" csv:"binned_confidence"`
}

// DefiLlamaPoolsResponse wraps the API response
type DefiLlamaPoolsResponse struct {
	Status string          `json:"status"`
	Data   []DefiLlamaPool `json:"data"`
}

// BridgeStats represents cross-chain bridge statistics
type BridgeStats struct {
	ID                 int     `json:"id" csv:"id"`
	Name               string  `json:"name" csv:"name"`
	DisplayName        string  `json:"displayName" csv:"display_name"`
	LastDailyVolume    float64 `json:"lastDailyVolume" csv:"last_daily_volume"`
	WeeklyVolume       float64 `json:"weeklyVolume" csv:"weekly_volume"`
	MonthlyVolume      float64 `json:"monthlyVolume" csv:"monthly_volume"`
	LastHourlyVolume   float64 `json:"lastHourlyVolume" csv:"last_hourly_volume"`
	CurrentDayVolume   float64 `json:"currentDayVolume" csv:"current_day_volume"`
}

// ChainTvlDatum represents TVL data point for a chain
type ChainTvlDatum struct {
	Date  int64   `json:"date" csv:"date"`
	Tvl   float64 `json:"tvl" csv:"tvl"`
	Chain string  `json:"-" csv:"chain"` // Set manually
}

// DexOverview represents DEX statistics for a chain
type DexOverview struct {
	Chain    string   `json:"chain" csv:"chain"`
	Total24h float64  `json:"total24h" csv:"total_24h"`
	Total7d  float64  `json:"total7d" csv:"total_7d"`
	Total30d float64  `json:"total30d" csv:"total_30d"`
	Change1d *float64 `json:"change_1d" csv:"change_1d"`
	Change7d *float64 `json:"change_7d" csv:"change_7d"`
	Change1m *float64 `json:"change_1m" csv:"change_1m"`
}
