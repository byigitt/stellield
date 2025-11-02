# Quick Usage Guide

## Running the Scraper

### 1. Build (First Time)
```bash
go build -o scraper.exe ./cmd/scraper
```

### 2. Run All Scrapers
```bash
./scraper.exe
```

This will scrape:
- DeFiLlama yield pools (all configured chains)
- DeFiLlama TVL history (Stellar, Ethereum, Solana, Polygon)
- DeFiLlama DEX stats (Stellar, Ethereum, Solana, Polygon)
- Stellar liquidity pools
- CoinGecko token prices
- Marinade Finance APY & TVL
- AggreLend lending rates

### 3. Run Specific Scrapers

#### Just Prices
```bash
./scraper.exe --scrapers=coingecko
```

#### DeFi Yield Data
```bash
./scraper.exe --scrapers=defillama
```

#### Stellar Only
```bash
./scraper.exe --scrapers=stellar
```

#### Multiple Scrapers
```bash
./scraper.exe --scrapers=defillama,stellar,coingecko
```

### 4. Custom Output Directory

#### Today's Data
```bash
./scraper.exe --output-dir=./datasets/2025-11-02
```

#### Windows PowerShell
```powershell
$date = Get-Date -Format "yyyy-MM-dd"
./scraper.exe --output-dir="./datasets/$date"
```

### 5. Debug Mode
```bash
./scraper.exe --log-level=debug --scrapers=stellar
```

## Expected Outputs

After running `./scraper.exe`, you should see files like:

```
output/
├── defillama_yields_2025-11-02_10-30-45.csv
├── defillama_tvl_stellar_2025-11-02_10-30-46.csv
├── defillama_tvl_ethereum_2025-11-02_10-30-47.csv
├── defillama_tvl_solana_2025-11-02_10-30-48.csv
├── defillama_tvl_polygon_2025-11-02_10-30-49.csv
├── defillama_dex_stellar_2025-11-02_10-30-50.csv
├── defillama_dex_ethereum_2025-11-02_10-30-51.csv
├── defillama_dex_solana_2025-11-02_10-30-52.csv
├── defillama_dex_polygon_2025-11-02_10-30-53.csv
├── stellar_liquidity_pools_2025-11-02_10-30-54.csv
├── coingecko_prices_2025-11-02_10-30-55.csv
├── marinade_apy_2025-11-02_10-30-56.csv
├── marinade_tvl_2025-11-02_10-30-57.csv
└── aggrelend_rates_2025-11-02_10-30-58.csv
```

## Understanding the Output

### Record Counts
Typical record counts per dataset:

- **defillama_yields**: 500-2000 pools (depends on chains)
- **defillama_tvl**: 100-500 data points per chain
- **defillama_dex**: 1 record per chain
- **stellar_liquidity_pools**: 50-200 pools
- **coingecko_prices**: 5-10 tokens
- **marinade_apy**: 1 record
- **marinade_tvl**: 1 record
- **aggrelend_rates**: 10-50 entries

### Summary Output
```
============================================================
📊 SCRAPING SUMMARY
============================================================
✅ defillama_yields: 1234 records
✅ stellar_pools: 89 records
✅ coingecko_prices: 7 records
✅ marinade_apy: 1 records
...
------------------------------------------------------------
Total Datasets: 14
Successful: 14
Failed: 0
Total Records: 2456
Duration: 1m23s
============================================================
```

## Troubleshooting

### Issue: "connection timeout"
**Solution**: Check your internet connection or try again (APIs may be temporarily down)

### Issue: "rate limited (429)"
**Solution**: Wait a few minutes. The scraper will auto-retry with backoff.

### Issue: "Failed to scrape..."
**Solution**: Run with debug logging to see details:
```bash
./scraper.exe --log-level=debug --scrapers=stellar
```

### Issue: No output files
**Solution**: Check the output directory exists and you have write permissions:
```bash
mkdir output
./scraper.exe
```

## Automation

### Daily Scraping (Windows Task Scheduler)

Create a batch file `daily-scrape.bat`:
```batch
@echo off
cd C:\Users\user\Desktop\Projects\stellar-hackathon\scraper
set DATE=%date:~10,4%-%date:~4,2%-%date:~7,2%
./scraper.exe --output-dir=datasets/%DATE%
```

Schedule it to run daily at 2 AM.

### Weekly Dataset Collection (PowerShell)

Create `weekly-scrape.ps1`:
```powershell
$week = Get-Date -UFormat "%Y-W%V"
$dir = "datasets/$week"
New-Item -ItemType Directory -Force -Path $dir
./scraper.exe --output-dir=$dir
```

## Data Processing for ML

### Combining Multiple Runs

If you collect data daily, you can combine them:

```powershell
# PowerShell: Combine all DeFiLlama yields
Get-Content datasets/*/defillama_yields_*.csv | 
    Select-Object -Unique | 
    Out-File combined_yields.csv
```

### Loading in Python

```python
import pandas as pd

# Load yield data
yields_df = pd.read_csv('output/defillama_yields_2025-11-02_10-30-45.csv')
print(yields_df.head())
print(yields_df.describe())

# Load prices
prices_df = pd.read_csv('output/coingecko_prices_2025-11-02_10-30-55.csv')
```

### Data Cleaning

```python
# Remove null APY values
clean_yields = yields_df[yields_df['apy'].notna()]

# Filter high TVL pools
high_tvl = yields_df[yields_df['tvl_usd'] > 1000000]

# Get only stablecoins
stables = yields_df[yields_df['stablecoin'] == True]
```

## Performance Tips

1. **Run specific scrapers** when you don't need all data
2. **Use rate limits wisely** - APIs have free tier limits
3. **Schedule during off-peak** hours to avoid rate limits
4. **Monitor disk space** - daily scraping accumulates data

## Next Steps

1. ✅ Run your first scrape
2. ✅ Verify CSV outputs
3. ✅ Load data into Python/Pandas
4. ✅ Train your ML models
5. ✅ Automate daily collection
