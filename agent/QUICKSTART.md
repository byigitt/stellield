# Quick Start - Get Running in 2 Minutes! ⚡

The fastest way to get AI-powered yield recommendations.

## Prerequisites

- Python 3.10+
- Gemini API Key ([Get one free!](https://makersuite.google.com/app/apikey))

## 🚀 Installation (30 seconds)

### Option 1: UV (Blazing Fast ⚡)

```bash
# Install UV
# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Setup project (3-5 seconds!)
cd agent
uv venv
uv pip install -e .
```

### Option 2: pip (Traditional)

```bash
cd agent
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

## 🔑 Configure (10 seconds)

```bash
# Copy template
cp .env.example .env

# Add your Gemini API key to .env
GEMINI_API_KEY=your_key_here
```

## ✅ Test (30 seconds)

### Activate Environment

```bash
# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate
```

### Verify Installation

```bash
# Quick test (no API key needed)
python test_install.py
```

You should see:
```
Testing Stellar Yield Agent Installation...

1. Testing module imports...
   ✓ All core modules imported successfully
...
✅ Installation verification complete!
```

### Run Example (Requires GEMINI_API_KEY)

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

## 🎯 Basic Usage

### CLI Commands

```bash
# Get recommendation for $5,000 with medium risk
python -m src.main recommend --amount 5000 --risk medium

# Stellar-only, low risk
python -m src.main recommend --amount 10000 --risk low --chains Stellar

# High risk, multiple chains
python -m src.main recommend --amount 20000 --risk high --chains Stellar Ethereum

# Save to JSON
python -m src.main recommend --amount 10000 --output my_rec.json
```

### Python Code

Create `my_agent.py`:

```python
import asyncio
from src.agent.recommendation_engine import RecommendationEngine

async def main():
    async with RecommendationEngine() as engine:
        response = await engine.recommend(
            amount_usd=10000,
            risk_tolerance="medium",
            preferred_chains=["Stellar", "Ethereum"]
        )
        
        if response.success:
            rec = response.recommendation
            print(f"Expected APY: {rec.weighted_expected_apy:.2f}%")
            print(f"Risk Grade: {rec.overall_risk_grade}")
            print(f"\nAllocations:")
            for alloc in rec.allocations:
                print(f"  • {alloc.opportunity.project}: {alloc.allocation_percentage}%")

asyncio.run(main())
```

Run it:
```bash
python my_agent.py
```

## 🎓 Examples

All examples are in `examples/` directory:

1. **simple_recommendation.py** - Basic usage
2. **portfolio_optimization.py** - Compare risk profiles

Run any example:
```bash
python examples/simple_recommendation.py
python examples/portfolio_optimization.py
```

## 📊 What You Get

Every recommendation includes:

- **Portfolio Allocations**: 3-5 optimized opportunities
- **Expected Returns**: Projections for 1d, 7d, 30d, 365d
- **Risk Analysis**: Tier classification (A-D) and grade
- **Fee Estimates**: Bridge, swap, and gas costs
- **AI Explanations**: Natural language reasoning
- **Confidence Score**: AI's confidence (0-100%)

## 🔧 Customization

```bash
# Lower minimum liquidity for more options
python -m src.main recommend --amount 5000 --min-liquidity 10000

# Set minimum APY
python -m src.main recommend --amount 10000 --min-apy 5

# More opportunities to consider
python -m src.main recommend --amount 10000 --max-opportunities 30

# Debug mode
python -m src.main recommend --amount 5000 --log-level DEBUG
```

## 🐛 Troubleshooting

### Issue: No module named 'google.generativeai'

```bash
# Make sure you're in the venv
which python  # Should show .venv path

# Reinstall
uv pip install -e .  # or pip install -r requirements.txt
```

### Issue: Gemini API key error

```bash
# Check .env file exists
cat .env  # macOS/Linux
type .env  # Windows

# Should contain:
# GEMINI_API_KEY=your_actual_key
```

### Issue: No opportunities found

Try relaxing filters:
```bash
python -m src.main recommend \
  --amount 1000 \
  --risk high \
  --min-liquidity 1000
```

## 📚 Next Steps

1. ✅ Got it working? Awesome!
2. 📖 Read the [full README](README.md) for advanced usage
3. 🔬 Check [SETUP.md](SETUP.md) for detailed configuration
4. 🧪 Run tests: `pytest tests/`
5. 🚀 Build something cool!

## 💡 Pro Tips

1. **Use UV**: 10-100x faster than pip!
2. **Cache Results**: First request is slow, subsequent ones are fast
3. **Adjust Filters**: Play with `--min-liquidity` and `--risk` to get different results
4. **Save Outputs**: Use `--output` to save recommendations as JSON
5. **Compare Profiles**: Run `examples/portfolio_optimization.py` to see different strategies

## 🎉 You're Ready!

Start getting AI-powered yield recommendations:

```bash
python -m src.main recommend --amount 10000 --risk medium
```

Happy yielding! 🚀
