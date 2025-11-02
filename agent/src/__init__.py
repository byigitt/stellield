"""Stellar Yield Agent - AI-powered yield recommendations."""

__version__ = "0.1.0"

from .agent.recommendation_engine import RecommendationEngine
from .agent.gemini_client import GeminiClient
from .data.aggregator import DataAggregator
from .data.risk_scorer import RiskScorer
from .models import (
    YieldOpportunity,
    RiskTier,
    Recommendation,
    RecommendationResponse,
)

__all__ = [
    "RecommendationEngine",
    "GeminiClient",
    "DataAggregator",
    "RiskScorer",
    "YieldOpportunity",
    "RiskTier",
    "Recommendation",
    "RecommendationResponse",
]
