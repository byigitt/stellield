"""Portfolio optimization example comparing different risk profiles."""

import asyncio
import json
from pathlib import Path
import sys
import io

# Fix Windows console encoding for emoji support
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

from src.agent.recommendation_engine import RecommendationEngine


async def compare_risk_profiles(amount: float = 10000):
    """Compare recommendations across different risk profiles."""
    
    print("🤖 Stellar Yield Agent - Portfolio Optimization Example\n")
    print(f"Comparing recommendations for ${amount:,.2f} across risk profiles...\n")
    
    risk_profiles = ["low", "medium", "high"]
    results = {}
    
    async with RecommendationEngine() as engine:
        
        for risk in risk_profiles:
            print(f"🔍 Analyzing {risk.upper()} risk profile...")
            
            response = await engine.recommend(
                amount_usd=amount,
                risk_tolerance=risk,
                preferred_chains=["Stellar", "Ethereum"],
                max_opportunities=20
            )
            
            if response.success:
                results[risk] = response.recommendation
                print(f"  ✅ APY: {response.recommendation.weighted_expected_apy:.2f}%")
                print(f"  ✅ Risk Grade: {response.recommendation.overall_risk_grade}")
                print(f"  ✅ Allocations: {len(response.recommendation.allocations)}")
            else:
                print(f"  ❌ Failed: {response.error}")
            
            print()
    
    # Compare results
    print("="*80)
    print("COMPARISON SUMMARY")
    print("="*80)
    
    print(f"\n{'Risk Profile':<15} {'APY':<10} {'Grade':<10} {'Div Score':<15} {'Confidence'}")
    print("-"*80)
    
    for risk in risk_profiles:
        if risk in results:
            rec = results[risk]
            print(
                f"{risk.upper():<15} "
                f"{rec.weighted_expected_apy:<10.2f} "
                f"{rec.overall_risk_grade:<10} "
                f"{rec.diversification_score:<15.0f} "
                f"{rec.confidence_score:.0f}%"
            )
    
    print("\n" + "="*80)
    print("DETAILED BREAKDOWN")
    print("="*80)
    
    for risk in risk_profiles:
        if risk in results:
            rec = results[risk]
            print(f"\n🎯 {risk.upper()} RISK PROFILE")
            print(f"  Summary: {rec.summary}")
            print(f"\n  Allocations:")
            for alloc in rec.allocations:
                print(
                    f"    • {alloc.opportunity.project} ({alloc.opportunity.chain}): "
                    f"{alloc.allocation_percentage:.1f}% @ {alloc.expected_apy:.2f}% APY"
                )
            
            print(f"\n  Projected Annual Return: ${rec.projected_returns.get('365d', 0):,.2f}")
            print(f"  Key Risk: {rec.key_risks[0] if rec.key_risks else 'N/A'}")
    
    print("\n" + "="*80)


if __name__ == "__main__":
    asyncio.run(compare_risk_profiles(10000))
