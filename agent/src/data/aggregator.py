"""Data aggregator combining multiple sources."""

from typing import List, Optional, Dict, Any
from loguru import logger

from ..models.yield_opportunity import YieldOpportunity, RiskTier
from .defillama_fetcher import DefiLlamaFetcher
from .stellar_fetcher import StellarFetcher
from .risk_scorer import RiskScorer


class DataAggregator:
    """Aggregate yield data from multiple sources."""
    
    def __init__(self, horizon_url: Optional[str] = None):
        """
        Initialize data aggregator.
        
        Args:
            horizon_url: Optional custom Horizon API URL
        """
        self.defillama = DefiLlamaFetcher()
        self.stellar = StellarFetcher(horizon_url) if horizon_url else StellarFetcher()
    
    async def fetch_all_opportunities(
        self,
        chains: Optional[List[str]] = None,
        min_tvl_usd: Optional[float] = None,
        min_apy: Optional[float] = None,
        max_risk_tier: Optional[RiskTier] = None,
        include_stellar_native: bool = True
    ) -> List[YieldOpportunity]:
        """
        Fetch and aggregate opportunities from all sources.
        
        Args:
            chains: Filter by specific chains
            min_tvl_usd: Minimum TVL in USD
            min_apy: Minimum APY percentage
            max_risk_tier: Maximum acceptable risk tier (e.g., RiskTier.B)
            include_stellar_native: Include native Stellar DEX pools
            
        Returns:
            Aggregated and filtered list of opportunities
        """
        all_opportunities = []
        
        # Fetch from DeFiLlama
        if chains:
            for chain in chains:
                try:
                    logger.info(f"Fetching {chain} opportunities from DeFiLlama")
                    opportunities = await self.defillama.fetch_chain_pools(chain)
                    all_opportunities.extend(opportunities)
                except Exception as e:
                    logger.error(f"Failed to fetch {chain} from DeFiLlama: {e}")
        else:
            try:
                logger.info("Fetching all opportunities from DeFiLlama")
                opportunities = await self.defillama.fetch_pools()
                all_opportunities.extend(opportunities)
            except Exception as e:
                logger.error(f"Failed to fetch from DeFiLlama: {e}")
        
        # Fetch native Stellar pools if requested
        if include_stellar_native and (not chains or "stellar" in [c.lower() for c in chains]):
            try:
                logger.info("Fetching native Stellar DEX pools")
                stellar_opportunities = await self.stellar.fetch_stellar_yields()
                all_opportunities.extend(stellar_opportunities)
            except Exception as e:
                logger.error(f"Failed to fetch Stellar native pools: {e}")
        
        # Apply filters
        filtered_opportunities = self._apply_filters(
            all_opportunities,
            min_tvl_usd=min_tvl_usd,
            min_apy=min_apy,
            max_risk_tier=max_risk_tier
        )
        
        logger.info(
            f"Aggregated {len(filtered_opportunities)} opportunities "
            f"from {len(all_opportunities)} total"
        )
        
        return filtered_opportunities
    
    def _apply_filters(
        self,
        opportunities: List[YieldOpportunity],
        min_tvl_usd: Optional[float] = None,
        min_apy: Optional[float] = None,
        max_risk_tier: Optional[RiskTier] = None
    ) -> List[YieldOpportunity]:
        """Apply filters to opportunities."""
        filtered = opportunities
        
        # TVL filter
        if min_tvl_usd is not None:
            filtered = [
                opp for opp in filtered
                if opp.tvl_usd is not None and opp.tvl_usd >= min_tvl_usd
            ]
        
        # APY filter
        if min_apy is not None:
            filtered = [
                opp for opp in filtered
                if opp.apy is not None and opp.apy >= min_apy
            ]
        
        # Risk tier filter
        if max_risk_tier is not None:
            risk_order = {RiskTier.A: 0, RiskTier.B: 1, RiskTier.C: 2, RiskTier.D: 3}
            max_risk_level = risk_order[max_risk_tier]
            
            filtered = [
                opp for opp in filtered
                if opp.risk_tier is not None and risk_order[opp.risk_tier] <= max_risk_level
            ]
        
        return filtered
    
    def rank_opportunities(
        self,
        opportunities: List[YieldOpportunity],
        strategy: str = "risk_adjusted"
    ) -> List[YieldOpportunity]:
        """
        Rank opportunities by different strategies.
        
        Args:
            opportunities: List of opportunities to rank
            strategy: Ranking strategy
                - "risk_adjusted": Balance APY and risk
                - "max_yield": Highest APY first
                - "min_risk": Lowest risk first
                - "sharpe": Risk-adjusted return (simplified)
                
        Returns:
            Sorted list of opportunities
        """
        if strategy == "max_yield":
            return sorted(
                opportunities,
                key=lambda x: x.apy or 0,
                reverse=True
            )
        
        elif strategy == "min_risk":
            risk_order = {RiskTier.A: 0, RiskTier.B: 1, RiskTier.C: 2, RiskTier.D: 3}
            return sorted(
                opportunities,
                key=lambda x: (
                    risk_order.get(x.risk_tier, 4),
                    -(x.apy or 0)
                )
            )
        
        elif strategy == "sharpe":
            # Simplified Sharpe ratio: APY / risk_volatility
            def sharpe_score(opp: YieldOpportunity) -> float:
                apy = opp.apy or 0
                volatility = abs(opp.apy_pct_7d or 1) if opp.apy_pct_7d else 1
                return apy / max(volatility, 0.1)
            
            return sorted(
                opportunities,
                key=sharpe_score,
                reverse=True
            )
        
        else:  # "risk_adjusted" (default)
            # Combine risk score and APY
            def risk_adjusted_score(opp: YieldOpportunity) -> float:
                apy = opp.apy or 0
                risk_score = opp.risk_score or 0
                # Higher risk score = safer, so we add it
                # Scale: APY weighted 70%, risk 30%
                return (apy * 0.7) + (risk_score * 3 * 0.3)
            
            return sorted(
                opportunities,
                key=risk_adjusted_score,
                reverse=True
            )
    
    async def close(self):
        """Close all data source connections."""
        await self.defillama.close()
        await self.stellar.close()
    
    async def __aenter__(self):
        """Async context manager entry."""
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.close()
