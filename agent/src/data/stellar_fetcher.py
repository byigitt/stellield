"""Stellar-specific data fetcher using Horizon API."""

import httpx
from typing import List, Optional, Dict, Any
from loguru import logger

from ..models.yield_opportunity import YieldOpportunity


class StellarFetcher:
    """Fetch Stellar-specific yield data from Horizon API."""
    
    def __init__(
        self,
        horizon_url: str = "https://horizon.stellar.org",
        timeout: int = 30
    ):
        """
        Initialize Stellar fetcher.
        
        Args:
            horizon_url: Horizon API base URL
            timeout: Request timeout in seconds
        """
        self.horizon_url = horizon_url.rstrip("/")
        self.timeout = timeout
        self.client = httpx.AsyncClient(timeout=timeout)
    
    async def fetch_liquidity_pools(self, limit: int = 200) -> List[Dict[str, Any]]:
        """
        Fetch liquidity pools from Stellar Horizon API.
        
        Args:
            limit: Maximum number of pools to fetch
            
        Returns:
            List of raw pool data
        """
        try:
            url = f"{self.horizon_url}/liquidity_pools"
            params = {"limit": limit, "order": "desc"}
            
            logger.info(f"Fetching Stellar liquidity pools (limit={limit})")
            
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            pools = data.get("_embedded", {}).get("records", [])
            
            logger.info(f"Fetched {len(pools)} Stellar liquidity pools")
            
            return pools
            
        except httpx.HTTPError as e:
            logger.error(f"HTTP error fetching Stellar pools: {e}")
            raise
        except Exception as e:
            logger.error(f"Error fetching Stellar pools: {e}")
            raise
    
    async def parse_stellar_pools(
        self,
        pools: List[Dict[str, Any]]
    ) -> List[YieldOpportunity]:
        """
        Parse Stellar liquidity pools into YieldOpportunity format.
        
        Note: Stellar pools don't directly provide APY data.
        This is a simplified implementation that would need enhancement
        with actual yield calculations based on fees and volume.
        
        Args:
            pools: Raw pool data from Horizon API
            
        Returns:
            List of YieldOpportunity objects
        """
        opportunities = []
        
        for pool in pools:
            try:
                # Extract reserves
                reserves = pool.get("reserves", [])
                if len(reserves) < 2:
                    continue
                
                # Get asset symbols
                symbols = []
                for reserve in reserves:
                    asset = reserve.get("asset", "")
                    if asset.startswith("native"):
                        symbols.append("XLM")
                    else:
                        # Format: CODE:ISSUER
                        parts = asset.split(":")
                        if len(parts) >= 1:
                            symbols.append(parts[0])
                
                symbol = "/".join(symbols) if symbols else "Unknown"
                
                # Calculate TVL (simplified - would need asset prices)
                total_shares = float(pool.get("total_shares", "0"))
                
                # Fee in basis points
                fee_bp = pool.get("fee_bp", 30)
                
                # Approximate APY based on fee tier (very simplified)
                # In reality, this would need volume data and calculations
                estimated_apy = fee_bp / 100.0  # Rough estimate
                
                opportunity = YieldOpportunity(
                    chain="Stellar",
                    project="Stellar DEX",
                    symbol=symbol,
                    pool=pool.get("id"),
                    tvlUsd=None,  # Would need price oracle
                    apy=estimated_apy,
                    apyBase=estimated_apy,
                    apyReward=None,
                    exposure="single" if len(symbols) == 1 else "multi",
                    ilRisk="yes" if len(symbols) > 1 else "no",
                    stablecoin=any(s in ["USDC", "USDT"] for s in symbols),
                    underlyingTokens=symbols,
                )
                
                opportunities.append(opportunity)
                
            except Exception as e:
                logger.warning(f"Failed to parse Stellar pool: {e}")
                continue
        
        logger.info(f"Parsed {len(opportunities)} Stellar opportunities")
        
        return opportunities
    
    async def fetch_stellar_yields(self, limit: int = 200) -> List[YieldOpportunity]:
        """
        Fetch and parse Stellar yield opportunities.
        
        Args:
            limit: Maximum number of pools to fetch
            
        Returns:
            List of YieldOpportunity objects
        """
        pools = await self.fetch_liquidity_pools(limit)
        return await self.parse_stellar_pools(pools)
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()
    
    async def __aenter__(self):
        """Async context manager entry."""
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.close()
