"""Simple recommendation example."""

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


async def main():
    """Run a simple recommendation example."""
    
    print("🤖 Stellar Yield Agent - Simple Recommendation Example\n")
    
    # Initialize engine
    print("Initializing recommendation engine...")
    async with RecommendationEngine() as engine:
        
        # Get recommendation
        print("\nGenerating recommendation for $10,000 USD with medium risk tolerance...\n")
        
        response = await engine.recommend(
            amount_usd=10000,
            risk_tolerance="medium",
            preferred_chains=["Stellar", "Ethereum"],
            min_liquidity_usd=50000,
            max_opportunities=15
        )
        
        if response.success:
            rec = response.recommendation
            
            print("✅ Recommendation successful!\n")
            print("="*80)
            print(f"SUMMARY: {rec.summary}")
            print("="*80)
            
            print(f"\n💰 Portfolio Metrics:")
            print(f"  • Total Allocated: ${rec.total_allocated_usd:,.2f}")
            print(f"  • Weighted APY: {rec.weighted_expected_apy:.2f}%")
            print(f"  • Risk Grade: {rec.overall_risk_grade}")
            print(f"  • Diversification Score: {rec.diversification_score:.0f}/100")
            print(f"  • Confidence: {rec.confidence_score:.0f}%")
            
            print(f"\n📊 Allocations ({len(rec.allocations)}):")
            for i, alloc in enumerate(rec.allocations, 1):
                print(f"  {i}. {alloc.opportunity.project} ({alloc.opportunity.chain})")
                print(f"     • {alloc.allocation_percentage:.1f}% → ${alloc.allocation_usd:,.2f}")
                print(f"     • APY: {alloc.expected_apy:.2f}%")
                print(f"     • Risk: {alloc.risk_tier.value}")
            
            print(f"\n📈 Projected Returns:")
            for period, amount in rec.projected_returns.items():
                pct = (amount / rec.total_allocated_usd) * 100
                print(f"  • {period}: ${amount:,.2f} ({pct:.2f}%)")
            
            print(f"\n⚠️  Top Risks:")
            for i, risk in enumerate(rec.key_risks[:3], 1):
                print(f"  {i}. {risk}")
            
            print(f"\n✨ Top Opportunities:")
            for i, opp in enumerate(rec.opportunities[:3], 1):
                print(f"  {i}. {opp}")
            
            print(f"\n⏱️  Execution time: {response.execution_time_ms:.0f}ms")
            print("="*80)
            
        else:
            print(f"❌ Recommendation failed: {response.error}")


if __name__ == "__main__":
    asyncio.run(main())
