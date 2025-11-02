"""Yield opportunity data models."""

from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator


class RiskTier(str, Enum):
    """Risk tier classification (A=Low, D=High)."""
    A = "A"
    B = "B"
    C = "C"
    D = "D"


class YieldOpportunity(BaseModel):
    """Represents a DeFi yield opportunity."""
    
    # Basic Info
    chain: str
    project: str
    symbol: str
    pool: Optional[str] = None
    pool_meta: Optional[str] = Field(None, alias="poolMeta")
    
    # Financial Metrics
    tvl_usd: Optional[float] = Field(None, alias="tvlUsd")
    apy: Optional[float] = None
    apy_base: Optional[float] = Field(None, alias="apyBase")
    apy_reward: Optional[float] = Field(None, alias="apyReward")
    apy_mean_30d: Optional[float] = Field(None, alias="apyMean30d")
    apy_pct_7d: Optional[float] = Field(None, alias="apyPct7D")
    
    # Risk Indicators
    exposure: Optional[str] = None
    il_risk: Optional[str] = Field(None, alias="ilRisk")
    stablecoin: Optional[bool] = None
    
    # Predictions
    predicted_class: Optional[str] = Field(None, alias="predictedClass")
    predicted_probability: Optional[float] = Field(None, alias="predictedProbability")
    binned_confidence: Optional[float] = Field(None, alias="binnedConfidence")
    
    # Tokens
    underlying_tokens: Optional[List[str]] = Field(None, alias="underlyingTokens")
    reward_tokens: Optional[List[str]] = Field(None, alias="rewardTokens")
    
    # Computed Risk
    risk_tier: Optional[RiskTier] = None
    risk_score: Optional[float] = None
    
    class Config:
        populate_by_name = True
        use_enum_values = False

    @field_validator('predicted_class', mode='before')
    @classmethod
    def lowercase_predicted_class(cls, v):
        """Normalize predicted class to lowercase."""
        return v.lower() if isinstance(v, str) else v

    @field_validator('il_risk', 'exposure', mode='before')
    @classmethod
    def lowercase_strings(cls, v):
        """Normalize string fields to lowercase."""
        return v.lower() if isinstance(v, str) else v


class RiskMetric(BaseModel):
    """Risk metrics for a single tier."""
    tier: RiskTier
    percentage: float
    count: int


class RiskDistribution(BaseModel):
    """Overall risk distribution summary."""
    distribution: List[RiskMetric]
    grade: str
    total: int
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            "distribution": [
                {
                    "tier": metric.tier.value,
                    "percentage": metric.percentage,
                    "count": metric.count
                }
                for metric in self.distribution
            ],
            "grade": self.grade,
            "total": self.total
        }
