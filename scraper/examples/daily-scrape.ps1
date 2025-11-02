# Daily Data Scraping Script for Stellar Hackathon
# Schedule this with Windows Task Scheduler or run manually

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Stellar Hackathon Data Scraper" -ForegroundColor Cyan
Write-Host "Daily Run: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to scraper directory
$ScriptDir = Split-Path -Parent $PSCommandPath
Set-Location (Join-Path $ScriptDir "..")

# Create dated output directory
$Date = Get-Date -Format "yyyy-MM-dd"
$OutputDir = "datasets\$Date"
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

Write-Host "Output directory: $OutputDir" -ForegroundColor Yellow
Write-Host ""

# Run the scraper
Write-Host "Starting scraper..." -ForegroundColor Green
& ".\scraper.exe" --output-dir=$OutputDir --log-level=info

# Check exit code
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SUCCESS! Scraping completed." -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    
    # Count files created
    $FileCount = (Get-ChildItem -Path $OutputDir -Filter "*.csv").Count
    Write-Host ""
    Write-Host "Files created: $FileCount CSV files" -ForegroundColor Cyan
    
    # Show file sizes
    Write-Host ""
    Write-Host "Dataset sizes:" -ForegroundColor Cyan
    Get-ChildItem -Path $OutputDir -Filter "*.csv" | ForEach-Object {
        $size = "{0:N2} KB" -f ($_.Length / 1KB)
        Write-Host "  $($_.Name): $size" -ForegroundColor Gray
    }
    
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "ERROR! Scraping failed with code $LASTEXITCODE" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Done! Check $OutputDir for results." -ForegroundColor Green
