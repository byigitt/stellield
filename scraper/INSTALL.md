# Installation & Setup Guide

## Prerequisites

### Required
- **Go 1.21+** - [Download Go](https://go.dev/dl/)
- **Internet connection** - For API access

### Optional
- **Python 3.8+** - For data analysis examples
- **Pandas** - `pip install pandas`

## Installation Steps

### 1. Verify Go Installation

```bash
go version
```

Expected output: `go version go1.21.x windows/amd64` (or your OS)

### 2. Navigate to Scraper Directory

```bash
cd C:\Users\user\Desktop\Projects\stellar-hackathon\scraper
```

Or from project root:
```bash
cd scraper
```

### 3. Install Dependencies

```bash
go mod download
```

This will install:
- `github.com/sirupsen/logrus` - Structured logging
- `golang.org/x/time/rate` - Rate limiting

### 4. Build the Application

```bash
go build -o scraper.exe ./cmd/scraper
```

On Linux/Mac:
```bash
go build -o scraper ./cmd/scraper
```

### 5. Verify Installation

```bash
./scraper.exe --help
```

Or run a quick test:
```bash
./scraper.exe --scrapers=coingecko
```

## Directory Structure After Installation

```
scraper/
├── scraper.exe              ← Built executable
├── cmd/
├── internal/
├── configs/
│   └── config.yaml
├── output/                   ← CSV outputs will go here
├── examples/
│   ├── daily-scrape.bat
│   ├── daily-scrape.ps1
│   └── analyze-data.py
├── go.mod
├── go.sum
└── README.md
```

## First Run

### Test with CoinGecko (Fast)
```bash
./scraper.exe --scrapers=coingecko
```

Expected output:
```
INFO Starting Stellar Hackathon Data Scraper
INFO === Running CoinGecko Scraper ===
INFO Scraped 6 prices from CoinGecko
INFO ✓ Exported CoinGecko prices to output\coingecko_prices_...csv
✅ coingecko_prices: 6 records
Total Datasets: 1
Successful: 1
Failed: 0
```

### Test with Stellar (Moderate)
```bash
./scraper.exe --scrapers=stellar
```

Expected: ~200 liquidity pools scraped

### Full Scrape (Slow - 2-5 minutes)
```bash
./scraper.exe
```

Expected: 14 CSV files with thousands of records

## Verifying Output

### Check CSV Files
```bash
# Windows PowerShell
Get-ChildItem output\*.csv

# Linux/Mac
ls -lh output/*.csv
```

### View CSV Content
```bash
# Windows PowerShell
Get-Content output\coingecko_prices_*.csv | Select-Object -First 5

# Linux/Mac
head -5 output/coingecko_prices_*.csv
```

## Configuration

### Edit Config File

Edit `configs/config.yaml` to customize:

```yaml
scrapers:
  defillama:
    enabled: true
    chains:
      - Stellar
      - Ethereum
      # Add more chains: Solana, Polygon, Arbitrum, etc.
  
  coingecko:
    enabled: true
    asset_ids:
      - ethereum
      - bitcoin
      # Add more assets
```

### Environment Variables (Optional)

You can override config with environment variables:

```bash
# Windows PowerShell
$env:LOG_LEVEL="debug"
./scraper.exe

# Linux/Mac
LOG_LEVEL=debug ./scraper
```

## Troubleshooting

### Issue: "go: command not found"
**Solution**: Install Go from https://go.dev/dl/

### Issue: "cannot find module"
**Solution**: Run `go mod download` and `go mod tidy`

### Issue: "Permission denied" (Linux/Mac)
**Solution**: Make executable: `chmod +x scraper`

### Issue: "Cannot create output directory"
**Solution**: Create manually: `mkdir output`

### Issue: API request failures
**Solution**: 
1. Check internet connection
2. Verify APIs are accessible (some may have regional restrictions)
3. Run with debug logging: `./scraper.exe --log-level=debug`

### Issue: Rate limit errors (429)
**Solution**: The scraper auto-retries with backoff. If persistent:
1. Reduce concurrent requests
2. Run scrapers separately: `--scrapers=coingecko` then `--scrapers=stellar`
3. Wait a few minutes between runs

## Automation Setup

### Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Name: "Stellar Scraper Daily"
4. Trigger: Daily at 2:00 AM
5. Action: Start a program
   - Program: `C:\Users\user\Desktop\Projects\stellar-hackathon\scraper\scraper.exe`
   - Arguments: `--output-dir=datasets\%date:~10,4%-%date:~4,2%-%date:~7,2%`
   - Start in: `C:\Users\user\Desktop\Projects\stellar-hackathon\scraper`

Or use the provided script:
```bash
.\examples\daily-scrape.bat
```

### Linux/Mac Cron Job

Add to crontab (`crontab -e`):

```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/scraper && ./scraper --output-dir=datasets/$(date +\%Y-\%m-\%d) >> logs/scraper.log 2>&1
```

Or use the provided script:
```bash
chmod +x examples/daily-scrape.ps1
./examples/daily-scrape.ps1
```

## Data Analysis Setup (Optional)

### Install Python Dependencies
```bash
pip install pandas numpy matplotlib seaborn
```

### Run Analysis
```bash
python examples/analyze-data.py
```

This will:
- Load all CSV files
- Generate statistics
- Create ML-ready dataset
- Show correlations and insights

## Performance Tips

1. **Run specific scrapers** when you don't need all data:
   ```bash
   ./scraper.exe --scrapers=defillama
   ```

2. **Use custom output directories** to organize data:
   ```bash
   ./scraper.exe --output-dir=datasets/2025-11-02
   ```

3. **Enable debug logging** to diagnose issues:
   ```bash
   ./scraper.exe --log-level=debug
   ```

4. **Schedule during off-peak hours** to avoid API rate limits

## Updating

### Pull Latest Code
```bash
git pull origin main
```

### Rebuild
```bash
go build -o scraper.exe ./cmd/scraper
```

### Update Dependencies
```bash
go get -u ./...
go mod tidy
```

## Uninstallation

Simply delete the scraper directory:
```bash
# Windows
rmdir /s scraper

# Linux/Mac
rm -rf scraper
```

## Support

### Check Logs
Run with debug logging to see detailed output:
```bash
./scraper.exe --log-level=debug
```

### Common Solutions
1. **Network issues**: Check firewall, proxy settings
2. **Rate limits**: Space out requests or use `--scrapers` flag
3. **Disk space**: Ensure sufficient space in `output/` directory
4. **Permissions**: Run with appropriate user permissions

### Getting Help
1. Check README.md for detailed documentation
2. Review USAGE.md for examples
3. See PROJECT_SUMMARY.md for architecture overview

## Next Steps

After successful installation:

1. ✅ Run test scrape: `./scraper.exe --scrapers=coingecko`
2. ✅ Verify CSV outputs in `output/` directory
3. ✅ Run full scrape: `./scraper.exe`
4. ✅ Set up automation (optional)
5. ✅ Analyze data with Python (optional)
6. ✅ Train ML models with datasets

---

**Happy Scraping! 🚀**
