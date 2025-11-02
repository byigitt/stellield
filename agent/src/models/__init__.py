"""Data models for yield opportunities and recommendations."""

from .yield_opportunity import (
    YieldOpportunity,
    RiskTier,
    RiskMetric,
    RiskDistribution,
)
from .recommendation import (
    Recommendation,
    PortfolioAllocation,
    RecommendationResponse,
)

__all__ = [
    "YieldOpportunity",
    "RiskTier",
    "RiskMetric",
    "RiskDistribution",
    "Recommendation",
    "PortfolioAllocation",
    "RecommendationResponse",
]
