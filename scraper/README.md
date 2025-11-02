# Stellar Hackathon Data Scraper

A comprehensive Go-based web scraper that extracts DeFi data from multiple APIs and exports them to CSV files for machine learning dataset generation.

## 🎯 Overview

This scraper collects data from various DeFi platforms and APIs used in the Stellar Hackathon project:

- **DeFiLlama**: Yield pools, bridge statistics, chain TVL, DEX data
- **Stellar Horizon**: Liquidity pools
- **CoinGecko**: Token prices
- **Marinade Finance**: Solana staking APY and TVL
- **AggreLend**: Lending protocol rates

All data is exported to separate CSV files with timestamps for easy ML training and analysis.

## 📊 Data Sources

### DeFiLlama APIs
- **Yield Pools**: `https://yields.llama.fi/pools`
  - Comprehensive DeFi yield opportunities across chains
  - Includes APY, TVL, risk metrics, predictions
- **Chain TVL**: `https://api.llama.fi/v2/historicalChainTvl/{chain}`
  - Historical total value locked data per blockchain
- **DEX Overview**: `https://api.llama.fi/overview/dexs/{chain}`
  - DEX trading volume and statistics

### Stellar Network
- **Horizon API**: `https://horizon.stellar.org/liquidity_pools`
  - Stellar liquidity pool data with reserves and fees

### Price & Market Data
- **CoinGecko**: `https://api.coingecko.com/api/v3/simple/price`
  - Real-time cryptocurrency prices
- **Marinade Finance**: `https://api.marinade.finance`
  - Solana liquid staking metrics

### Lending Protocols
- **AggreLend**: `https://app.aggrelend.com/api/get-apy-list`
  - Aggregated lending rates across protocols

## 🚀 Quick Start

### Prerequisites

- Go 1.21 or higher
- Internet connection for API access

### Installation

```bash
# Clone the repository (if not already in the project)
cd stellar-hackathon/scraper

# Install dependencies
go mod download

# Build the scraper
go build -o scraper.exe ./cmd/scraper
```

### Basic Usage

```bash
# Run all scrapers (default)
./scraper.exe

# Run specific scrapers
./scraper.exe --scrapers=defillama,stellar

# Custom output directory
./scraper.exe --output-dir=./datasets

# Enable debug logging
./scraper.exe --log-level=debug
```

## 📁 Project Structure

```
scraper/
├── cmd/
│   └── scraper/
│       └── main.go              # CLI entry point
├── internal/
│   ├── scrapers/
│   │   ├── defillama.go         # DeFiLlama API scraper
│   │   ├── stellar.go           # Stellar Horizon scraper
│   │   ├── coingecko.go         # CoinGecko scraper
│   │   ├── marinade.go          # Marinade Finance scraper
│   │   └── aggrelend.go         # AggreLend scraper
│   ├── models/
│   │   ├── common.go            # Shared interfaces
│   │   ├── defillama.go         # DeFiLlama data models
│   │   ├── stellar.go           # Stellar data models
│   │   └── prices.go            # Price/lending models
│   ├── export/
│   │   └── csv.go               # CSV export engine
│   └── utils/
│       ├── http.go              # HTTP client with retry & rate limiting
│       └── logger.go            # Structured logging
├── configs/
│   └── config.yaml              # Configuration file
├── output/                       # CSV output directory
├── go.mod
├── go.sum
└── README.md
```

## 📄 CSV Output Files

The scraper generates timestamped CSV files for each data source:

### DeFiLlama Outputs
- `defillama_yields_{timestamp}.csv` - Yield pool opportunities
- `defillama_tvl_stellar_{timestamp}.csv` - Stellar chain TVL history
- `defillama_tvl_ethereum_{timestamp}.csv` - Ethereum chain TVL history
- `defillama_tvl_solana_{timestamp}.csv` - Solana chain TVL history
- `defillama_tvl_polygon_{timestamp}.csv` - Polygon chain TVL history
- `defillama_dex_stellar_{timestamp}.csv` - Stellar DEX statistics
- `defillama_dex_ethereum_{timestamp}.csv` - Ethereum DEX statistics
- `defillama_dex_solana_{timestamp}.csv` - Solana DEX statistics
- `defillama_dex_polygon_{timestamp}.csv` - Polygon DEX statistics

### Other Outputs
- `stellar_liquidity_pools_{timestamp}.csv` - Stellar liquidity pools
- `coingecko_prices_{timestamp}.csv` - Token prices
- `marinade_apy_{timestamp}.csv` - Marinade staking APY
- `marinade_tvl_{timestamp}.csv` - Marinade TVL
- `aggrelend_rates_{timestamp}.csv` - Lending rates

## 🔧 Configuration

Edit `configs/config.yaml` to customize scraper behavior:

```yaml
scrapers:
  defillama:
    enabled: true
    chains:
      - Stellar
      - Ethereum
      - Solana
      - Polygon
  
  stellar:
    enabled: true
    horizon_url: "https://horizon.stellar.org"
    limit: 200
  
  coingecko:
    enabled: true
    asset_ids:
      - ethereum
      - bitcoin
      - solana
      - stellar

output:
  directory: "./output"

logging:
  level: "info"
```

## 🎛️ Command-Line Flags

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `--output-dir` | Output directory for CSV files | `./output` | `--output-dir=./datasets` |
| `--scrapers` | Comma-separated list of scrapers | `all` | `--scrapers=defillama,stellar` |
| `--log-level` | Logging level | `info` | `--log-level=debug` |

### Available Scrapers

- `all` - Run all scrapers (default)
- `defillama` - DeFiLlama yield pools, TVL, and DEX data
- `stellar` - Stellar Horizon liquidity pools
- `coingecko` - CoinGecko token prices
- `marinade` - Marinade Finance metrics
- `aggrelend` - AggreLend lending rates

## 💡 Usage Examples

### Example 1: Scrape All Data
```bash
./scraper.exe
```

### Example 2: Only DeFiLlama and Stellar Data
```bash
./scraper.exe --scrapers=defillama,stellar
```

### Example 3: Custom Output with Debug Logging
```bash
./scraper.exe --output-dir=./ml-datasets --log-level=debug
```

### Example 4: Daily Dataset Collection
```bash
# Create a dated directory and scrape
mkdir datasets/$(date +%Y-%m-%d)
./scraper.exe --output-dir=datasets/$(date +%Y-%m-%d)
```

## 🛠️ Features

### Robust HTTP Client
- **Retry Logic**: Exponential backoff with 3 retry attempts
- **Rate Limiting**: Respects API rate limits (configurable per scraper)
- **Error Handling**: Graceful handling of 429, 5xx errors
- **Timeouts**: 30-second request timeout

### CSV Export
- **Automatic Headers**: Extracted from struct tags
- **Timestamp Generation**: Each file includes timestamp in filename
- **UTF-8 Encoding**: Proper encoding for special characters
- **Null Handling**: Graceful handling of nil pointers

### Logging
- **Structured Logging**: Using logrus for consistent output
- **Levels**: debug, info, warn, error
- **Color Output**: Enhanced readability in terminal

## 📈 Data Schema Examples

### DeFiLlama Yield Pool
```csv
chain,project,symbol,pool,tvl_usd,apy,apy_base,apy_reward,exposure,il_risk,stablecoin
Stellar,AaveV3,USDC,0x123...,1000000,5.25,3.5,1.75,single,no,true
```

### Stellar Liquidity Pool
```csv
id,fee_bp,type,total_trustlines,total_shares,reserve_0_asset,reserve_0_amount,reserve_1_asset,reserve_1_amount
abc123...,30,constant_product,150,1000000,native,500000,USDC:GA...,500000
```

### CoinGecko Price
```csv
asset_id,usd_price,timestamp
ethereum,2500.50,2025-11-02T10:30:00Z
```

## 🔍 Error Handling

The scraper continues execution even if individual scrapers fail:

- **Network Errors**: Retried with exponential backoff
- **Rate Limits**: Respects Retry-After headers
- **Invalid Data**: Skipped with warning logs
- **Final Report**: Summary shows successes and failures

Example output:
```
✅ defillama_yields: 1234 records
✅ stellar_pools: 89 records
❌ marinade_apy: FAILED - connection timeout
---
Total Datasets: 3
Successful: 2
Failed: 1
Total Records: 1323
Duration: 45s
```

## 🚦 Rate Limits

| API | Requests/Second | Free Tier Limit |
|-----|----------------|-----------------|
| DeFiLlama | 10 | No strict limit |
| Stellar Horizon | 5 | ~72,000/day |
| CoinGecko | 10 | 50 calls/minute |
| Marinade | 5 | No strict limit |
| AggreLend | 5 | No strict limit |

## 🧪 Testing

```bash
# Build
go build -o scraper.exe ./cmd/scraper

# Test run with debug logging
./scraper.exe --log-level=debug --scrapers=coingecko

# Check output
ls output/
```

## 📦 Dependencies

- `github.com/sirupsen/logrus` - Structured logging
- `golang.org/x/time/rate` - Rate limiting
- Standard library: `encoding/csv`, `encoding/json`, `net/http`

## 🔮 Future Enhancements

- [ ] Incremental scraping (delta updates)
- [ ] PostgreSQL export option
- [ ] Parallel scraping with goroutines
- [ ] Prometheus metrics
- [ ] Docker containerization
- [ ] Scheduled cron execution
- [ ] Data validation and cleaning
- [ ] Compression for large datasets

## 📝 License

Part of the Stellar Hackathon project.

## 🤝 Contributing

This scraper is designed to be easily extensible. To add a new data source:

1. Create a new scraper in `internal/scrapers/`
2. Define data models in `internal/models/`
3. Implement the `Scraper` interface
4. Add to main CLI in `cmd/scraper/main.go`
5. Update this README

## 📞 Support

For issues or questions, refer to the main Stellar Hackathon project documentation.

---

**Happy Scraping! 🚀📊**
