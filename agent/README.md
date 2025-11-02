# Stellar Yield Agent 🤖

AI-powered yield recommendation system using Google Gemini 2.0 Flash for intelligent DeFi yield analysis and portfolio optimization.

## Features

- 🤖 **Agentic AI**: Uses Gemini 2.0 Flash for multi-step reasoning and personalized recommendations
- 📊 **Data Aggregation**: Combines DeFiLlama, Stellar Horizon, and other data sources
- ⚖️ **Risk Scoring**: Advanced risk classification (A-D tiers) ported from TypeScript logic
- 💼 **Portfolio Optimization**: Generate balanced allocations based on risk tolerance
- 🔮 **Projections**: Approximate return calculations over multiple timeframes
- 💸 **Fee Estimation**: Bridge, swap, and gas fee approximations
- 🎯 **Explainable AI**: Natural language explanations for every recommendation

## Quick Start

### 1. Installation

#### Option A: Using UV (Recommended ⚡)

[UV](https://github.com/astral-sh/uv) is an extremely fast Python package installer and resolver.

```bash
# Install UV (if not already installed)
# Windows (PowerShell)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Navigate to agent directory
cd agent

# Create virtual environment and install dependencies (blazing fast!)
uv venv
uv pip install -e .

# Activate virtual environment
# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate
```

#### Option B: Using pip

```bash
cd agent

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Unix/MacOS)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your Gemini API key
# Get API key from: https://makersuite.google.com/app/apikey
```

Required environment variables:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Verify Installation

```bash
# Quick installation test
python test_install.py
```

Expected output:
```
Testing Stellar Yield Agent Installation...

1. Testing module imports...
   ✓ All core modules imported successfully

2. Testing data models...
   ✓ Created YieldOpportunity: Aave - USDC
...
✅ Installation verification complete!
```

### 4. Run Examples

```bash
# Simple recommendation (requires GEMINI_API_KEY)
python examples/simple_recommendation.py

# Compare risk profiles
python examples/portfolio_optimization.py
```

### 4. CLI Usage

```bash
# Basic recommendation
python -m src.main recommend --amount 10000 --risk medium

# Stellar-focused
python -m src.main recommend --amount 5000 --risk low --chains Stellar

# Multi-chain with custom settings
python -m src.main recommend \
  --amount 20000 \
  --risk high \
  --chains Stellar Ethereum \
  --min-liquidity 100000 \
  --min-apy 5

# Save to file
python -m src.main recommend --amount 10000 --output recommendation.json
```

## Usage as Python Library

```python
import asyncio
from src.agent.recommendation_engine import RecommendationEngine

async def get_recommendation():
    async with RecommendationEngine() as engine:
        response = await engine.recommend(
            amount_usd=10000,
            risk_tolerance="medium",
            preferred_chains=["Stellar", "Ethereum"],
            min_liquidity_usd=50000,
            max_opportunities=20
        )
        
        if response.success:
            rec = response.recommendation
            print(f"Expected APY: {rec.weighted_expected_apy:.2f}%")
            print(f"Risk Grade: {rec.overall_risk_grade}")
            
            for alloc in rec.allocations:
                print(f"{alloc.opportunity.project}: {alloc.allocation_percentage}%")

asyncio.run(get_recommendation())
```

## Architecture

```
agent/
├── src/
│   ├── agent/              # AI recommendation engine
│   │   ├── gemini_client.py         # Gemini 2.0 Flash integration
│   │   └── recommendation_engine.py  # Main orchestration
│   ├── data/               # Data fetching & processing
│   │   ├── defillama_fetcher.py     # DeFiLlama API client
│   │   ├── stellar_fetcher.py       # Stellar Horizon API client
│   │   ├── aggregator.py            # Multi-source aggregation
│   │   └── risk_scorer.py           # Risk scoring algorithm
│   ├── models/             # Pydantic data models
│   │   ├── yield_opportunity.py     # Yield data structures
│   │   └── recommendation.py        # Recommendation structures
│   └── utils/              # Utilities
│       ├── logger.py                # Logging configuration
│       └── cache.py                 # Simple caching
├── examples/               # Example scripts
├── tests/                  # Unit tests
└── README.md
```

## How It Works

### 1. Data Collection
- Fetches yield opportunities from DeFiLlama API
- Retrieves Stellar DEX pools from Horizon API
- Aggregates and normalizes data from multiple sources

### 2. Risk Analysis
- Calculates risk scores based on:
  - APY stability and volatility
  - Impermanent loss risk
  - Liquidity depth (TVL)
  - Protocol predictions
  - Stablecoin status
- Classifies into risk tiers (A=Low, B=Medium, C=Higher, D=High)

### 3. AI Recommendation
- Sends opportunities to Gemini 2.0 Flash
- AI performs multi-step reasoning:
  1. Analyzes user context (amount, risk tolerance, preferences)
  2. Evaluates each opportunity's risk/reward
  3. Generates diversified portfolio allocation
  4. Calculates projections and fees
  5. Explains reasoning in natural language

### 4. Output
- Structured recommendation with allocations
- Projected returns over multiple timeframes
- Risk assessment and mitigation strategies
- Confidence scores and explanations

## Risk Scoring Algorithm

The risk scoring system (ported from TypeScript `metrics.ts`):

**Positive Factors** (safer):
- Prediction: "stable/up"
- High prediction confidence (>85%)
- No impermanent loss risk
- Stablecoin pools
- Low APY volatility

**Negative Factors** (riskier):
- Very high APY (>20%)
- Multi-token exposure
- High volatility (>5% weekly)
- Impermanent loss risk
- Downward predictions

**Risk Tiers**:
- **A** (Low): Score ≥ 3.0 - Safest opportunities
- **B** (Medium): Score ≥ 1.0 - Balanced risk/reward
- **C** (Higher): Score ≥ -1.5 - Higher risk
- **D** (High): Score < -1.5 - Highest risk

## CLI Commands

### Recommend
Generate personalized yield recommendations:

```bash
python -m src.main recommend [OPTIONS]

Options:
  --amount FLOAT          Investment amount in USD (required)
  --risk CHOICE          Risk tolerance: low, medium, high (default: medium)
  --chains CHAIN [...]   Preferred blockchains (e.g., Stellar Ethereum)
  --min-liquidity FLOAT  Minimum TVL in USD (default: 50000)
  --min-apy FLOAT        Minimum APY percentage
  --max-opportunities N  Max opportunities to consider (default: 20)
  --output FILE          Save to JSON file
  --log-level LEVEL      Logging level: DEBUG, INFO, WARNING, ERROR
```

### Analyze (Coming Soon)
Detailed analysis of specific protocols:

```bash
python -m src.main analyze --protocol aave --chain Ethereum
```

## Data Sources

- **DeFiLlama**: Yield pools, TVL, APY data for multiple chains
- **Stellar Horizon**: Native Stellar DEX liquidity pools
- **Risk Predictions**: AI-generated predictions from DeFiLlama
- **Price Data**: Asset prices for TVL calculations

## API Response Format

```json
{
  "success": true,
  "recommendation": {
    "requested_amount_usd": 10000,
    "risk_tolerance": "medium",
    "allocations": [
      {
        "opportunity": {...},
        "allocation_percentage": 40,
        "allocation_usd": 4000,
        "expected_apy": 8.5,
        "risk_tier": "B",
        "reasoning": "..."
      }
    ],
    "weighted_expected_apy": 9.2,
    "overall_risk_grade": "B+",
    "diversification_score": 85,
    "summary": "Balanced portfolio...",
    "key_risks": ["...", "...", "..."],
    "opportunities": ["...", "...", "..."],
    "rationale": "...",
    "projected_returns": {
      "1d": 2.52,
      "7d": 17.67,
      "30d": 75.34,
      "365d": 920.00
    },
    "estimated_fees": {
      "bridge": 5.00,
      "swap": 10.00,
      "gas": 15.00,
      "total": 30.00
    },
    "confidence_score": 87.5,
    "timestamp": "2025-11-02T08:00:00",
    "data_freshness_seconds": 0
  },
  "execution_time_ms": 2345.67
}
```

## Environment Variables

```env
# Required
GEMINI_API_KEY=your_api_key

# Optional
DEFILLAMA_YIELD_URL=https://yields.llama.fi/pools
HORIZON_API_URL=https://horizon.stellar.org
CACHE_TTL_SECONDS=600
LOG_LEVEL=INFO
LOG_FILE=logs/agent.log
```

## Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=src --cov-report=html

# Specific test
pytest tests/test_risk_scorer.py
```

## Examples Output

### Simple Recommendation
```
🤖 Stellar Yield Agent - Simple Recommendation Example

Initializing recommendation engine...
Generating recommendation for $10,000 USD with medium risk tolerance...

✅ Recommendation successful!

================================================================================
SUMMARY: Balanced portfolio focused on stablecoin yields with medium risk
================================================================================

💰 Portfolio Metrics:
  • Total Allocated: $10,000.00
  • Weighted APY: 9.25%
  • Risk Grade: B+
  • Diversification Score: 85/100
  • Confidence: 88%

📊 Allocations (4):
  1. Aave V3 (Ethereum)
     • 35.0% → $3,500.00
     • APY: 8.50%
     • Risk: B
  2. Stellar AMM (Stellar)
     • 30.0% → $3,000.00
     • APY: 7.20%
     • Risk: A
  ...
```

## Troubleshooting

### Missing API Key
```
Error: Gemini API key required
```
→ Set `GEMINI_API_KEY` in `.env` file

### No Opportunities Found
```
Error: No opportunities found matching the criteria
```
→ Try relaxing filters (`--min-liquidity`, `--min-apy`)

### Import Errors
```
ImportError: No module named 'google.generativeai'
```
→ Run `pip install -r requirements.txt`

## Roadmap

- [ ] FastAPI REST API server
- [ ] Redis caching for production
- [ ] Historical backtesting
- [ ] Portfolio rebalancing alerts
- [ ] Integration with main web app via tRPC
- [ ] Advanced ML models for yield prediction
- [ ] Real-time monitoring dashboard

## Contributing

This is part of the Stellar Hackathon project. See main README for contribution guidelines.

## License

MIT License - See LICENSE file

## Acknowledgments

- Google Gemini 2.0 Flash for AI capabilities
- DeFiLlama for yield data
- Stellar Development Foundation
- ValidationCloud for infrastructure

---

**Note**: This is a proof-of-concept for educational purposes. Always conduct your own research before investing.
