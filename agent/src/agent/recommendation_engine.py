"""Recommendation engine orchestrating data fetching and AI analysis."""

import time
from datetime import datetime
from typing import List, Optional, Dict, Any
from loguru import logger

from ..models.yield_opportunity import YieldOpportunity, RiskTier
from ..models.recommendation import (
    Recommendation,
    PortfolioAllocation,
    RecommendationResponse,
)
from ..data.aggregator import DataAggregator
from ..data.risk_scorer import compute_risk_distribution
from .gemini_client import GeminiClient


class RecommendationEngine:
    """Main recommendation engine combining data and AI."""
    
    def __init__(
        self,
        gemini_api_key: Optional[str] = None,
        horizon_url: Optional[str] = None
    ):
        """
        Initialize recommendation engine.
        
        Args:
            gemini_api_key: Optional Gemini API key
            horizon_url: Optional custom Horizon API URL
        """
        self.aggregator = DataAggregator(horizon_url=horizon_url)
        self.gemini = GeminiClient(api_key=gemini_api_key)
        
        logger.info("Recommendation engine initialized")
    
    async def recommend(
        self,
        amount_usd: float,
        risk_tolerance: str = "medium",
        preferred_chains: Optional[List[str]] = None,
        min_liquidity_usd: Optional[float] = 50000,
        min_apy: Optional[float] = None,
        max_opportunities: int = 20,
        ranking_strategy: str = "risk_adjusted"
    ) -> RecommendationResponse:
        """
        Generate personalized yield recommendations.
        
        Args:
            amount_usd: Investment amount in USD
            risk_tolerance: User's risk tolerance (low/medium/high)
            preferred_chains: Optional list of preferred blockchains
            min_liquidity_usd: Minimum TVL requirement
            min_apy: Minimum APY requirement
            max_opportunities: Maximum opportunities to consider
            ranking_strategy: How to rank opportunities
            
        Returns:
            RecommendationResponse with allocations and analysis
        """
        start_time = time.time()
        
        try:
            logger.info(
                f"Generating recommendation: amount=${amount_usd}, "
                f"risk={risk_tolerance}, chains={preferred_chains}"
            )
            
            # Step 1: Determine risk tier filter based on tolerance
            max_risk_tier = self._risk_tolerance_to_tier(risk_tolerance)
            
            # Step 2: Fetch and filter opportunities
            logger.info("Fetching yield opportunities from all sources...")
            opportunities = await self.aggregator.fetch_all_opportunities(
                chains=preferred_chains,
                min_tvl_usd=min_liquidity_usd,
                min_apy=min_apy,
                max_risk_tier=max_risk_tier,
                include_stellar_native=True
            )
            
            if not opportunities:
                raise ValueError(
                    "No opportunities found matching the criteria. "
                    "Try relaxing filters."
                )
            
            logger.info(f"Found {len(opportunities)} matching opportunities")
            
            # Step 3: Rank opportunities
            ranked_opportunities = self.aggregator.rank_opportunities(
                opportunities,
                strategy=ranking_strategy
            )
            
            # Limit to top N
            top_opportunities = ranked_opportunities[:max_opportunities]
            
            # Step 4: Compute risk distribution
            risk_distribution = compute_risk_distribution(top_opportunities)
            
            logger.info(
                f"Risk distribution: {risk_distribution.grade} "
                f"({len(top_opportunities)} opportunities)"
            )
            
            # Step 5: Get AI recommendation
            logger.info("Requesting AI analysis from Gemini...")
            ai_response = await self.gemini.get_recommendation(
                opportunities=top_opportunities,
                amount_usd=amount_usd,
                risk_tolerance=risk_tolerance,
                preferred_chains=preferred_chains,
                min_liquidity_usd=min_liquidity_usd,
                risk_distribution=risk_distribution
            )
            
            # Step 6: Build recommendation object
            recommendation = self._build_recommendation(
                ai_response=ai_response,
                opportunities=top_opportunities,
                amount_usd=amount_usd,
                risk_tolerance=risk_tolerance,
                preferred_chains=preferred_chains,
                min_liquidity_usd=min_liquidity_usd,
                data_age_seconds=0  # Real-time for now
            )
            
            execution_time = (time.time() - start_time) * 1000
            
            logger.info(
                f"Recommendation generated successfully in {execution_time:.0f}ms: "
                f"{len(recommendation.allocations)} allocations, "
                f"confidence={recommendation.confidence_score}%"
            )
            
            return RecommendationResponse(
                success=True,
                recommendation=recommendation,
                error=None,
                execution_time_ms=execution_time
            )
            
        except Exception as e:
            execution_time = (time.time() - start_time) * 1000
            logger.error(f"Recommendation failed: {e}")
            
            return RecommendationResponse(
                success=False,
                recommendation=None,
                error=str(e),
                execution_time_ms=execution_time
            )
    
    def _risk_tolerance_to_tier(self, tolerance: str) -> RiskTier:
        """Convert risk tolerance string to max risk tier."""
        tolerance = tolerance.lower()
        
        if tolerance in ["low", "conservative"]:
            return RiskTier.A
        elif tolerance in ["medium", "moderate", "balanced"]:
            return RiskTier.B
        elif tolerance in ["high", "aggressive"]:
            return RiskTier.C
        else:
            return RiskTier.B  # Default to medium
    
    def _build_recommendation(
        self,
        ai_response: Dict[str, Any],
        opportunities: List[YieldOpportunity],
        amount_usd: float,
        risk_tolerance: str,
        preferred_chains: Optional[List[str]],
        min_liquidity_usd: Optional[float],
        data_age_seconds: int
    ) -> Recommendation:
        """Build Recommendation object from AI response."""
        
        # Create opportunity lookup with multiple strategies
        opp_lookup = {}
        
        for opp in opportunities:
            # Strategy 1: pool ID (if available)
            if opp.pool:
                opp_lookup[opp.pool] = opp
            
            # Strategy 2: project-symbol combination
            key = f"{opp.project}-{opp.symbol}"
            opp_lookup[key] = opp
            
            # Strategy 3: lowercase variations for fuzzy matching
            opp_lookup[key.lower()] = opp
            opp_lookup[opp.project.lower()] = opp
            opp_lookup[opp.symbol.lower()] = opp
        
        # Parse allocations
        allocations = []
        for alloc_data in ai_response.get("allocations", []):
            # Find matching opportunity
            pool_id = alloc_data.get("pool_id", "")
            project = alloc_data.get("project", "")
            symbol = alloc_data.get("symbol", "")
            
            # Try different lookup strategies in order of specificity
            opportunity = None
            
            # 1. Try exact pool_id
            if pool_id and pool_id in opp_lookup:
                opportunity = opp_lookup[pool_id]
            
            # 2. Try project-symbol combo
            if not opportunity and project and symbol:
                key = f"{project}-{symbol}"
                opportunity = opp_lookup.get(key) or opp_lookup.get(key.lower())
            
            # 3. Try case-insensitive project match
            if not opportunity and project:
                opportunity = opp_lookup.get(project.lower())
            
            # 4. Fuzzy search through all opportunities
            if not opportunity:
                for opp in opportunities:
                    if (project and symbol and 
                        opp.project.lower() == project.lower() and 
                        opp.symbol.lower() == symbol.lower()):
                        opportunity = opp
                        break
                    elif project and opp.project.lower() == project.lower():
                        opportunity = opp
                        break
            
            if not opportunity:
                logger.warning(
                    f"Could not find opportunity for allocation: "
                    f"pool_id={pool_id}, project={project}, symbol={symbol}"
                )
                continue
            
            allocation = PortfolioAllocation(
                opportunity=opportunity,
                allocation_percentage=alloc_data.get("allocation_percentage", 0),
                allocation_usd=alloc_data.get("allocation_usd", 0),
                expected_apy=alloc_data.get("expected_apy", 0),
                risk_tier=RiskTier(alloc_data.get("risk_tier", "B")),
                reasoning=alloc_data.get("reasoning", "")
            )
            
            allocations.append(allocation)
        
        # Build recommendation
        return Recommendation(
            requested_amount_usd=amount_usd,
            risk_tolerance=risk_tolerance,
            preferred_chains=preferred_chains,
            min_liquidity_usd=min_liquidity_usd,
            allocations=allocations,
            total_allocated_usd=ai_response.get("total_allocated_usd", amount_usd),
            weighted_expected_apy=ai_response.get("weighted_expected_apy", 0),
            overall_risk_grade=ai_response.get("overall_risk_grade", "B"),
            diversification_score=ai_response.get("diversification_score", 0),
            summary=ai_response.get("summary", ""),
            key_risks=ai_response.get("key_risks", []),
            opportunities=ai_response.get("opportunities", []),
            rationale=ai_response.get("rationale", ""),
            projected_returns=ai_response.get("projected_returns", {}),
            estimated_fees=ai_response.get("estimated_fees", {}),
            confidence_score=ai_response.get("confidence_score", 0),
            timestamp=datetime.utcnow().isoformat(),
            data_freshness_seconds=data_age_seconds
        )
    
    async def analyze_portfolio(
        self,
        current_holdings: List[Dict[str, Any]]
    ) -> str:
        """
        Analyze an existing portfolio.
        
        Args:
            current_holdings: List of current holdings with amounts
            
        Returns:
            Analysis text
        """
        # TODO: Implement portfolio analysis
        raise NotImplementedError("Portfolio analysis coming soon")
    
    async def close(self):
        """Close all connections."""
        await self.aggregator.close()
    
    async def __aenter__(self):
        """Async context manager entry."""
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.close()
