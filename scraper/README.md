# Scraper · Data Ingestion CLI

Go-based toolchain that gathers DeFi metrics for Stellield's AI engine and analytics.

## Data Sources
- DeFiLlama yields, chain TVL, DEX stats
- Stellar Horizon liquidity pools
- CoinGecko prices, Marinade staking, AggreLend rates

## Build & Run
```bash
cd scraper
go build -o scraper ./cmd/scraper
./scraper --scrapers=defillama,stellar --output-dir=./output
```

Adjust behavior via `configs/config.yaml` or CLI flags (`--log-level`, `--scrapers`, `--output-dir`). Dataset CSVs are timestamped for ML workflows.
