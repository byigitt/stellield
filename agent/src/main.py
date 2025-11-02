"""CLI entry point for the yield recommendation agent."""

import asyncio
import json
import argparse
from pathlib import Path
from typing import Optional
from loguru import logger

from .agent.recommendation_engine import RecommendationEngine
from .utils.logger import setup_logger


async def recommend_command(args):
    """Execute recommend command."""
    logger.info(f"Running recommendation for ${args.amount} USD")
    
    async with RecommendationEngine() as engine:
        response = await engine.recommend(
            amount_usd=args.amount,
            risk_tolerance=args.risk,
            preferred_chains=args.chains,
            min_liquidity_usd=args.min_liquidity,
            min_apy=args.min_apy,
            max_opportunities=args.max_opportunities
        )
        
        if response.success:
            recommendation = response.recommendation
            
            # Print summary
            print("\n" + "="*80)
            print(f"YIELD RECOMMENDATION - ${args.amount:,.2f} USD")
            print("="*80)
            
            print(f"\n📊 SUMMARY")
            print(f"{recommendation.summary}")
            
            print(f"\n💰 PORTFOLIO ALLOCATIONS")
            print(f"Total Allocated: ${recommendation.total_allocated_usd:,.2f}")
            print(f"Weighted APY: {recommendation.weighted_expected_apy:.2f}%")
            print(f"Risk Grade: {recommendation.overall_risk_grade}")
            print(f"Diversification: {recommendation.diversification_score:.0f}/100")
            
            for i, alloc in enumerate(recommendation.allocations, 1):
                print(f"\n  {i}. {alloc.opportunity.project} - {alloc.opportunity.symbol}")
                print(f"     Chain: {alloc.opportunity.chain}")
                print(f"     Allocation: {alloc.allocation_percentage:.1f}% (${alloc.allocation_usd:,.2f})")
                print(f"     Expected APY: {alloc.expected_apy:.2f}%")
                print(f"     Risk Tier: {alloc.risk_tier.value}")
                print(f"     TVL: ${alloc.opportunity.tvl_usd:,.0f}")
                print(f"     Reasoning: {alloc.reasoning}")
            
            print(f"\n📈 PROJECTED RETURNS")
            for period, amount in recommendation.projected_returns.items():
                print(f"  {period}: ${amount:,.2f}")
            
            print(f"\n💸 ESTIMATED FEES")
            for fee_type, amount in recommendation.estimated_fees.items():
                print(f"  {fee_type}: ${amount:,.2f}")
            
            print(f"\n⚠️  KEY RISKS")
            for i, risk in enumerate(recommendation.key_risks, 1):
                print(f"  {i}. {risk}")
            
            print(f"\n✨ OPPORTUNITIES")
            for i, opp in enumerate(recommendation.opportunities, 1):
                print(f"  {i}. {opp}")
            
            print(f"\n🧠 STRATEGY RATIONALE")
            print(f"{recommendation.rationale}")
            
            print(f"\n📊 CONFIDENCE: {recommendation.confidence_score:.1f}/100")
            print(f"⏱️  Execution Time: {response.execution_time_ms:.0f}ms")
            print("="*80 + "\n")
            
            # Save to file if requested
            if args.output:
                output_path = Path(args.output)
                with output_path.open('w') as f:
                    json.dump(response.dict(), f, indent=2, default=str)
                print(f"✅ Recommendation saved to: {args.output}")
        
        else:
            print(f"\n❌ Recommendation failed: {response.error}")
            logger.error(f"Recommendation failed: {response.error}")


async def analyze_command(args):
    """Execute analyze command."""
    logger.info(f"Analyzing {args.protocol} on {args.chain}")
    
    # TODO: Implement detailed protocol analysis
    print(f"Analyzing {args.protocol} on {args.chain}...")
    print("Coming soon!")


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="AI-powered yield recommendations for DeFi",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Basic recommendation
  python -m agent recommend --amount 10000 --risk medium
  
  # Stellar-focused recommendation
  python -m agent recommend --amount 5000 --risk low --chains Stellar
  
  # Multi-chain with custom settings
  python -m agent recommend --amount 20000 --risk high --chains Stellar Ethereum --min-liquidity 100000
  
  # Save to file
  python -m agent recommend --amount 10000 --output recommendation.json
        """
    )
    
    parser.add_argument(
        "--log-level",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        default="INFO",
        help="Logging level"
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Recommend command
    recommend_parser = subparsers.add_parser(
        "recommend",
        help="Get personalized yield recommendations"
    )
    recommend_parser.add_argument(
        "--amount",
        type=float,
        required=True,
        help="Investment amount in USD"
    )
    recommend_parser.add_argument(
        "--risk",
        choices=["low", "medium", "high"],
        default="medium",
        help="Risk tolerance (default: medium)"
    )
    recommend_parser.add_argument(
        "--chains",
        nargs="+",
        help="Preferred blockchains (e.g., Stellar Ethereum)"
    )
    recommend_parser.add_argument(
        "--min-liquidity",
        type=float,
        default=50000,
        help="Minimum TVL in USD (default: 50000)"
    )
    recommend_parser.add_argument(
        "--min-apy",
        type=float,
        help="Minimum APY percentage"
    )
    recommend_parser.add_argument(
        "--max-opportunities",
        type=int,
        default=20,
        help="Maximum opportunities to consider (default: 20)"
    )
    recommend_parser.add_argument(
        "--output", "-o",
        help="Save recommendation to JSON file"
    )
    
    # Analyze command
    analyze_parser = subparsers.add_parser(
        "analyze",
        help="Analyze a specific protocol"
    )
    analyze_parser.add_argument(
        "--protocol",
        required=True,
        help="Protocol name (e.g., aave, compound)"
    )
    analyze_parser.add_argument(
        "--chain",
        required=True,
        help="Blockchain (e.g., Stellar, Ethereum)"
    )
    
    args = parser.parse_args()
    
    # Setup logger
    setup_logger(log_level=args.log_level)
    
    # Execute command
    if args.command == "recommend":
        asyncio.run(recommend_command(args))
    elif args.command == "analyze":
        asyncio.run(analyze_command(args))
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
