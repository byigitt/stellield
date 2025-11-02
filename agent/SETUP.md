# Setup Guide - Stellar Yield Agent

Complete setup instructions for the AI-powered yield recommendation system.

## Prerequisites

- **Python 3.10+** (3.11 or 3.12 recommended)
- **Gemini API Key** - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Git** (for cloning the repository)

## Installation Methods

### Method 1: UV (Recommended ⚡)

UV is an extremely fast Python package installer and resolver written in Rust. It's 10-100x faster than pip!

#### Step 1: Install UV

**Windows (PowerShell)**
```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**macOS/Linux**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Alternative: Using pip**
```bash
pip install uv
```

#### Step 2: Setup Project

```bash
# Navigate to agent directory
cd stellar-hackathon/agent

# Create virtual environment
uv venv

# Activate virtual environment
# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Windows (CMD)
.venv\Scripts\activate.bat

# macOS/Linux
source .venv/bin/activate

# Install all dependencies (fast!)
uv pip install -e .

# Or install with dev dependencies
uv pip install -e ".[dev]"
```

**Note for Windows PowerShell users**: If you get an execution policy error when activating, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Step 3: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file and add your Gemini API key
# Windows
notepad .env

# macOS/Linux
nano .env
```

Add your API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

#### Step 4: Verify Installation

```bash
# Test installation
python -c "import google.generativeai; print('Gemini SDK installed')"
python -c "from src.agent import RecommendationEngine; print('Agent module loaded')"

# Run example (requires GEMINI_API_KEY in .env)
python examples/simple_recommendation.py
```

**Windows Note**: Make sure you're using the venv Python:
```powershell
.\.venv\Scripts\python.exe -c "from src import RecommendationEngine; print('OK')"
```

---

### Method 2: Traditional pip

#### Step 1: Create Virtual Environment

```bash
# Navigate to agent directory
cd stellar-hackathon/agent

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell)
venv\Scripts\Activate.ps1

# Windows (CMD)
venv\Scripts\activate.bat

# macOS/Linux
source venv/bin/activate
```

#### Step 2: Install Dependencies

```bash
# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Or install in editable mode
pip install -e .
```

#### Step 3: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your Gemini API key
```

#### Step 4: Verify Installation

```bash
# Test installation
python -c "import google.generativeai; print('✓ Gemini SDK installed')"

# Run example
python examples/simple_recommendation.py
```

---

## Configuration

### Required Environment Variables

Create a `.env` file in the `agent/` directory:

```env
# Gemini AI API Key (REQUIRED)
GEMINI_API_KEY=your_gemini_api_key_here
```

### Optional Environment Variables

```env
# Data Source URLs
DEFILLAMA_YIELD_URL=https://yields.llama.fi/pools
HORIZON_API_URL=https://horizon.stellar.org
VALIDATION_CLOUD_API_KEY=optional_key_here

# Caching
CACHE_TTL_SECONDS=600
ENABLE_REDIS_CACHE=false
REDIS_URL=redis://localhost:6379/0

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/agent.log

# API Server (if using FastAPI)
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4

# Recommendation Settings
DEFAULT_RISK_TOLERANCE=medium
MIN_LIQUIDITY_USD=50000
MAX_RECOMMENDATIONS=5
```

## Getting a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy the key and add it to your `.env` file

**Note**: Gemini API has a free tier with generous limits:
- 60 requests per minute
- 1,500 requests per day
- Perfect for development and testing!

## Quick Test

### Test 1: Simple Recommendation

```bash
python examples/simple_recommendation.py
```

Expected output:
```
🤖 Stellar Yield Agent - Simple Recommendation Example

Initializing recommendation engine...
Generating recommendation for $10,000 USD...

✅ Recommendation successful!
...
```

### Test 2: CLI Command

```bash
# Basic recommendation
python -m src.main recommend --amount 1000 --risk medium

# Stellar-focused
python -m src.main recommend --amount 5000 --risk low --chains Stellar

# Save to file
python -m src.main recommend --amount 10000 --output my_recommendation.json
```

### Test 3: Python Library

Create a test script `test_agent.py`:

```python
import asyncio
from src.agent.recommendation_engine import RecommendationEngine

async def test():
    async with RecommendationEngine() as engine:
        response = await engine.recommend(
            amount_usd=1000,
            risk_tolerance="medium"
        )
        
        if response.success:
            print(f"✓ Success! APY: {response.recommendation.weighted_expected_apy:.2f}%")
        else:
            print(f"✗ Error: {response.error}")

asyncio.run(test())
```

Run it:
```bash
python test_agent.py
```

## Development Setup

### Install Dev Dependencies

**With UV:**
```bash
uv pip install -e ".[dev]"
```

**With pip:**
```bash
pip install -e ".[dev]"
```

### Run Tests

```bash
# Run all tests
pytest

# With coverage
pytest --cov=src --cov-report=html

# Specific test file
pytest tests/test_risk_scorer.py

# Verbose output
pytest -v
```

### Code Quality Tools

```bash
# Format code with Black
black src/ tests/ examples/

# Lint with Ruff
ruff check src/ tests/ examples/

# Type checking with mypy
mypy src/
```

## Troubleshooting

### Issue: UV not found after installation

**Solution**: Restart your terminal or add UV to PATH:

**Windows:**
```powershell
$env:Path += ";$env:USERPROFILE\.cargo\bin"
```

**macOS/Linux:**
```bash
export PATH="$HOME/.cargo/bin:$PATH"
```

### Issue: Import errors

```
ModuleNotFoundError: No module named 'google.generativeai'
```

**Solution**: Make sure virtual environment is activated and dependencies are installed:
```bash
# Check if venv is activated (you should see (.venv) or (venv) in prompt)
which python  # macOS/Linux
where python  # Windows

# Reinstall dependencies
uv pip install -e .  # or pip install -r requirements.txt
```

### Issue: Gemini API errors

```
Error: Gemini API key required
```

**Solution**: Check your `.env` file:
```bash
# Verify .env exists
ls -la .env  # macOS/Linux
dir .env     # Windows

# Check content
cat .env     # macOS/Linux
type .env    # Windows

# Make sure it contains:
# GEMINI_API_KEY=your_actual_key_here
```

### Issue: No opportunities found

```
ValueError: No opportunities found matching the criteria
```

**Solution**: Try relaxing filters:
```bash
python -m src.main recommend \
  --amount 1000 \
  --risk high \
  --min-liquidity 10000 \
  --max-opportunities 30
```

### Issue: Slow API responses

**Solution**: Check your internet connection and DeFiLlama API status. The first request may be slow due to data fetching. Subsequent requests will be faster with caching.

## Performance Tips

### UV vs pip Speed Comparison

Installing all dependencies:
- **UV**: ~2-5 seconds ⚡
- **pip**: ~30-60 seconds 🐢

UV is 10-100x faster!

### Caching

Enable caching for faster repeated requests:

```python
from src.utils.cache import get_cache

cache = get_cache()
# Cache is automatically used by data fetchers
```

### Parallel Data Fetching

The agent fetches data from multiple sources in parallel for maximum speed.

## Next Steps

1. ✅ Complete installation
2. ✅ Configure `.env` with API key
3. ✅ Run example scripts
4. 📚 Read the [main README](README.md) for usage examples
5. 🚀 Start building with the agent!

## Resources

- [UV Documentation](https://github.com/astral-sh/uv)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [DeFiLlama API](https://defillama.com/docs/api)
- [Stellar Horizon API](https://developers.stellar.org/api)

## Support

For issues or questions:
1. Check this setup guide
2. Review the [main README](README.md)
3. Check existing GitHub issues
4. Create a new issue with detailed error messages

---

**Happy yielding! 🚀**
