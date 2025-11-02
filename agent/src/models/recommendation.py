"""Recommendation output models."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from .yield_opportunity import YieldOpportunity, RiskTier


class PortfolioAllocation(BaseModel):
    """Recommended allocation for a single opportunity."""
    
    opportunity: YieldOpportunity
    allocation_percentage: float = Field(
        ge=0, le=100,
        description="Percentage of total capital to allocate"
    )
    allocation_usd: float = Field(
        ge=0,
        description="Dollar amount to allocate"
    )
    expected_apy: float
    risk_tier: RiskTier
    reasoning: str = Field(
        description="AI-generated explanation for this allocation"
    )


class Recommendation(BaseModel):
    """Complete recommendation response from the AI agent."""
    
    # Input Context
    requested_amount_usd: float
    risk_tolerance: str
    preferred_chains: Optional[List[str]] = None
    min_liquidity_usd: Optional[float] = None
    
    # Recommendations
    allocations: List[PortfolioAllocation]
    
    # Aggregate Metrics
    total_allocated_usd: float
    weighted_expected_apy: float
    overall_risk_grade: str
    diversification_score: float = Field(
        ge=0, le=100,
        description="Portfolio diversification score (0-100)"
    )
    
    # AI Insights
    summary: str = Field(
        description="Executive summary of the recommendation"
    )
    key_risks: List[str] = Field(
        description="Main risks identified"
    )
    opportunities: List[str] = Field(
        description="Key opportunities highlighted"
    )
    rationale: str = Field(
        description="Detailed explanation of the recommendation strategy"
    )
    
    # Approximate Calculations
    projected_returns: Dict[str, float] = Field(
        description="Projected returns over different timeframes (1d, 7d, 30d, 365d)"
    )
    estimated_fees: Dict[str, float] = Field(
        description="Estimated fees breakdown"
    )
    
    # Confidence
    confidence_score: float = Field(
        ge=0, le=100,
        description="AI confidence in this recommendation (0-100)"
    )
    
    # Metadata
    timestamp: str
    data_freshness_seconds: int = Field(
        description="How old is the underlying data"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "requested_amount_usd": 10000,
                "risk_tolerance": "medium",
                "preferred_chains": ["stellar", "ethereum"],
                "allocations": [],
                "total_allocated_usd": 10000,
                "weighted_expected_apy": 12.5,
                "overall_risk_grade": "B+",
                "diversification_score": 85,
                "summary": "Balanced portfolio with focus on stablecoin yields",
                "confidence_score": 87.5
            }
        }


class RecommendationResponse(BaseModel):
    """API response wrapper for recommendations."""
    
    success: bool
    recommendation: Optional[Recommendation] = None
    error: Optional[str] = None
    execution_time_ms: float
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "recommendation": {},
                "error": None,
                "execution_time_ms": 2345.67
            }
        }
