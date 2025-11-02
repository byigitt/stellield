"""DeFiLlama API data fetcher."""

import httpx
from typing import List, Optional, Dict, Any
from loguru import logger

from ..models.yield_opportunity import YieldOpportunity
from .risk_scorer import RiskScorer


class DefiLlamaFetcher:
    """Fetch yield data from DeFiLlama API."""
    
    BASE_URL = "https://yields.llama.fi"
    
    def __init__(self, timeout: int = 30):
        """
        Initialize DeFiLlama fetcher.
        
        Args:
            timeout: Request timeout in seconds
        """
        self.timeout = timeout
        self.client = httpx.AsyncClient(timeout=timeout)
    
    async def fetch_pools(
        self,
        chain: Optional[str] = None,
        project: Optional[str] = None
    ) -> List[YieldOpportunity]:
        """
        Fetch yield pools from DeFiLlama.
        
        Args:
            chain: Filter by blockchain (e.g., 'Stellar', 'Ethereum')
            project: Filter by project name
            
        Returns:
            List of YieldOpportunity objects with risk scores computed
        """
        try:
            url = f"{self.BASE_URL}/pools"
            
            logger.info(f"Fetching DeFiLlama pools: chain={chain}, project={project}")
            
            response = await self.client.get(url)
            response.raise_for_status()
            
            data = response.json()
            pools_data = data.get("data", [])
            
            logger.info(f"Fetched {len(pools_data)} pools from DeFiLlama")
            
            # Parse and filter pools
            opportunities = []
            for pool_data in pools_data:
                try:
                    # Apply filters
                    pool_chain = (pool_data.get("chain") or "").lower()
                    pool_project = (pool_data.get("project") or "").lower()
                    
                    # Check if pool has required metrics
                    if pool_data.get("tvlUsd") is None or pool_data.get("apy") is None:
                        continue
                    
                    # Apply chain filter
                    if chain and pool_chain != chain.lower():
                        continue
                    
                    # Apply project filter
                    if project and pool_project != project.lower():
                        continue
                    
                    # Parse predictions if available
                    predictions = pool_data.get("predictions") or {}
                    pool_data["predictedClass"] = predictions.get("predictedClass")
                    pool_data["predictedProbability"] = predictions.get("predictedProbability")
                    pool_data["binnedConfidence"] = predictions.get("binnedConfidence")
                    
                    # Create opportunity
                    opportunity = YieldOpportunity(**pool_data)
                    
                    # Calculate risk score and tier
                    opportunity.risk_score = RiskScorer.calculate_risk_score(opportunity)
                    opportunity.risk_tier = RiskScorer.classify_risk_tier(opportunity)
                    
                    opportunities.append(opportunity)
                    
                except Exception as e:
                    logger.warning(f"Failed to parse pool: {e}")
                    continue
            
            logger.info(
                f"Parsed {len(opportunities)} valid opportunities "
                f"(chain={chain}, project={project})"
            )
            
            return opportunities
            
        except httpx.HTTPError as e:
            logger.error(f"HTTP error fetching DeFiLlama pools: {e}")
            raise
        except Exception as e:
            logger.error(f"Error fetching DeFiLlama pools: {e}")
            raise
    
    async def fetch_chain_pools(self, chain: str) -> List[YieldOpportunity]:
        """
        Fetch pools for a specific chain.
        
        Args:
            chain: Blockchain name (e.g., 'Stellar', 'Ethereum')
            
        Returns:
            List of YieldOpportunity objects
        """
        return await self.fetch_pools(chain=chain)
    
    async def fetch_project_pools(self, project: str) -> List[YieldOpportunity]:
        """
        Fetch pools for a specific project.
        
        Args:
            project: Project name (e.g., 'aave', 'compound')
            
        Returns:
            List of YieldOpportunity objects
        """
        return await self.fetch_pools(project=project)
    
    async def get_pool_by_id(self, pool_id: str) -> Optional[YieldOpportunity]:
        """
        Get a specific pool by ID.
        
        Args:
            pool_id: Pool identifier
            
        Returns:
            YieldOpportunity or None if not found
        """
        pools = await self.fetch_pools()
        for pool in pools:
            if pool.pool == pool_id:
                return pool
        return None
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()
    
    async def __aenter__(self):
        """Async context manager entry."""
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.close()
