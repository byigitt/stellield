package models

// StellarReserve represents a liquidity pool reserve
type StellarReserve struct {
	Asset  string `json:"asset" csv:"asset"`
	Amount string `json:"amount" csv:"amount"`
}

// StellarLiquidityPool represents a Stellar liquidity pool
type StellarLiquidityPool struct {
	ID                string           `json:"id" csv:"id"`
	FeeBreakdownPoints int             `json:"fee_bp" csv:"fee_bp"`
	Type              string           `json:"type" csv:"type"`
	TotalTrustlines   string           `json:"total_trustlines" csv:"total_trustlines"`
	TotalShares       string           `json:"total_shares" csv:"total_shares"`
	Reserves          []StellarReserve `json:"reserves" csv:"-"`
	Reserve0Asset     string           `json:"-" csv:"reserve_0_asset"`
	Reserve0Amount    string           `json:"-" csv:"reserve_0_amount"`
	Reserve1Asset     string           `json:"-" csv:"reserve_1_asset"`
	Reserve1Amount    string           `json:"-" csv:"reserve_1_amount"`
	LastModifiedTime  string           `json:"last_modified_time" csv:"last_modified_time"`
}

// StellarLiquidityResponse wraps the Horizon API response
type StellarLiquidityResponse struct {
	Embedded struct {
		Records []StellarLiquidityPool `json:"records"`
	} `json:"_embedded"`
}

// FlattenReserves prepares the pool for CSV export by flattening reserves
func (p *StellarLiquidityPool) FlattenReserves() {
	if len(p.Reserves) >= 1 {
		p.Reserve0Asset = p.Reserves[0].Asset
		p.Reserve0Amount = p.Reserves[0].Amount
	}
	if len(p.Reserves) >= 2 {
		p.Reserve1Asset = p.Reserves[1].Asset
		p.Reserve1Amount = p.Reserves[1].Amount
	}
}
