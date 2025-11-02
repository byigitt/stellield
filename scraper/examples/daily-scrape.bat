@echo off
REM Daily Data Scraping Script for Stellar Hackathon
REM Schedule this with Windows Task Scheduler

echo ========================================
echo Stellar Hackathon Data Scraper
echo Daily Run: %date% %time%
echo ========================================

REM Navigate to scraper directory
cd /d "%~dp0\.."

REM Create dated output directory
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
set OUTPUT_DIR=datasets\%mydate%
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

echo Output directory: %OUTPUT_DIR%
echo.

REM Run the scraper
echo Starting scraper...
scraper.exe --output-dir=%OUTPUT_DIR% --log-level=info

REM Check exit code
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Scraping completed.
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ERROR! Scraping failed with code %ERRORLEVEL%
    echo ========================================
    exit /b %ERRORLEVEL%
)

REM Count files created
echo.
echo Files created:
dir /b "%OUTPUT_DIR%\*.csv" 2>nul | find /c ".csv"

echo.
echo Done! Check %OUTPUT_DIR% for results.
pause
