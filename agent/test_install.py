"""Quick installation verification script."""

import sys
import os

# Fix encoding for Windows
if os.name == 'nt':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

print("Testing Stellar Yield Agent Installation...\n")

# Test 1: Import core modules
print("1. Testing module imports...")
try:
    from src.agent import RecommendationEngine, GeminiClient
    from src.data import RiskScorer, DataAggregator
    from src.models import YieldOpportunity, RiskTier, Recommendation
    print("   ✓ All core modules imported successfully")
except ImportError as e:
    print(f"   ✗ Import error: {e}")
    sys.exit(1)

# Test 2: Create sample yield opportunity
print("\n2. Testing data models...")
try:
    opp = YieldOpportunity(
        chain="Ethereum",
        project="Aave",
        symbol="USDC",
        apy=5.5,
        tvlUsd=10000000,
        stablecoin=True,
        ilRisk="no",
    )
    print(f"   ✓ Created YieldOpportunity: {opp.project} - {opp.symbol}")
    print(f"     Chain: {opp.chain}, APY: {opp.apy}%")
except Exception as e:
    print(f"   ✗ Model creation error: {e}")
    sys.exit(1)

# Test 3: Test risk scoring
print("\n3. Testing risk scoring...")
try:
    from src.data.risk_scorer import RiskScorer
    
    score = RiskScorer.calculate_risk_score(opp)
    tier = RiskScorer.classify_risk_tier(opp)
    
    print(f"   ✓ Risk score calculated: {score:.2f}")
    print(f"   ✓ Risk tier: {tier.value}")
except Exception as e:
    print(f"   ✗ Risk scoring error: {e}")
    sys.exit(1)

# Test 4: Test risk distribution
print("\n4. Testing risk distribution...")
try:
    from src.data.risk_scorer import compute_risk_distribution
    
    pools = [
        YieldOpportunity(
            chain="Ethereum", project="Aave", symbol="USDC",
            apy=5.0, tvlUsd=10000000, stablecoin=True, ilRisk="no"
        ),
        YieldOpportunity(
            chain="Ethereum", project="Compound", symbol="USDT",
            apy=4.5, tvlUsd=5000000, stablecoin=True, ilRisk="no"
        ),
        YieldOpportunity(
            chain="BSC", project="Venus", symbol="BNB",
            apy=15.0, tvlUsd=1000000, stablecoin=False, ilRisk="yes"
        ),
    ]
    
    distribution = compute_risk_distribution(pools)
    
    print(f"   ✓ Distribution calculated")
    print(f"     Total pools: {distribution.total}")
    print(f"     Overall grade: {distribution.grade}")
    for metric in distribution.distribution:
        if metric.count > 0:
            print(f"     Tier {metric.tier.value}: {metric.count} pools ({metric.percentage}%)")
except Exception as e:
    print(f"   ✗ Distribution error: {e}")
    sys.exit(1)

# Test 5: Check environment
print("\n5. Checking environment...")
try:
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        print("   ✓ GEMINI_API_KEY found in environment")
    else:
        print("   ⚠ GEMINI_API_KEY not set (required for AI features)")
        print("     Add to .env file: GEMINI_API_KEY=your_key_here")
except Exception as e:
    print(f"   ✗ Environment check error: {e}")

# Summary
print("\n" + "="*60)
print("Installation Test Summary")
print("="*60)
print("✓ Core modules: OK")
print("✓ Data models: OK")
print("✓ Risk scoring: OK")
print("✓ Risk distribution: OK")

if not gemini_key:
    print("⚠ Gemini API key: NOT SET (add to .env)")
else:
    print("✓ Gemini API key: SET")

print("\n✅ Installation verification complete!")
print("\nNext steps:")
print("1. Add GEMINI_API_KEY to .env file (if not set)")
print("2. Run: python examples/simple_recommendation.py")
print("3. Or use CLI: python -m src.main recommend --amount 10000 --risk medium")
print("\nSee README.md for full documentation.")
