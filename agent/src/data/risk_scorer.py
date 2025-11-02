"""Risk scoring logic ported from TypeScript metrics.ts"""

from typing import List, Optional
from ..models.yield_opportunity import (
    YieldOpportunity,
    RiskTier,
    RiskMetric,
    RiskDistribution,
)


class RiskScorer:
    """Risk scoring engine for yield opportunities."""
    
    @staticmethod
    def calculate_risk_score(pool: YieldOpportunity) -> float:
        """
        Calculate risk score based on multiple factors.
        Ported from TypeScript calculateRiskScore function.
        
        Returns:
            float: Risk score (higher = safer, lower = riskier)
        """
        score = 0.0
        
        # Prediction analysis
        prediction = (pool.predicted_class or "").lower()
        probability = pool.predicted_probability
        il_risk = (pool.il_risk or "").lower() == "yes"
        exposure = (pool.exposure or "").lower()
        stablecoin = pool.stablecoin or False
        
        # Prediction class scoring
        if prediction == "stable/up":
            score += 2
        elif prediction == "down":
            score -= 2
        elif prediction:
            score += 0.5
        
        # Prediction probability scoring
        if probability is not None:
            if probability >= 85:
                score += 2
            elif probability >= 70:
                score += 1
            elif probability <= 35:
                score -= 1
            elif probability <= 20:
                score -= 2
        
        # Impermanent loss risk
        if il_risk:
            score -= 2
        else:
            score += 0.5
        
        # Exposure type
        if exposure == "multi":
            score -= 0.5
        
        # APY analysis (higher APY = higher risk)
        apy = pool.apy or 0
        if apy >= 20:
            score -= 1.5
        elif apy >= 12:
            score -= 1
        elif apy >= 8:
            score -= 0.5
        
        # Volatility analysis
        volatility_candidates = []
        
        if pool.apy_pct_7d is not None:
            volatility_candidates.append(abs(pool.apy_pct_7d))
        
        if pool.apy is not None and pool.apy_mean_30d is not None:
            volatility_candidates.append(abs(pool.apy - pool.apy_mean_30d))
        
        if volatility_candidates:
            volatility = max(volatility_candidates)
            if volatility >= 5:
                score -= 2
            elif volatility >= 2:
                score -= 1
            elif volatility >= 1:
                score -= 0.5
        
        # Stablecoin bonus
        if stablecoin and not il_risk:
            score += 1
        
        return score
    
    @staticmethod
    def classify_risk_tier(pool: YieldOpportunity) -> RiskTier:
        """
        Classify pool into risk tier based on score.
        Ported from TypeScript classifyRiskTier function.
        
        Returns:
            RiskTier: A (safest) to D (riskiest)
        """
        score = RiskScorer.calculate_risk_score(pool)
        
        if score >= 3:
            return RiskTier.A
        elif score >= 1:
            return RiskTier.B
        elif score >= -1.5:
            return RiskTier.C
        else:
            return RiskTier.D
    
    @staticmethod
    def compute_risk_distribution(
        pools: Optional[List[YieldOpportunity]] = None
    ) -> RiskDistribution:
        """
        Compute risk distribution across a list of pools.
        Ported from TypeScript computeRiskDistribution function.
        
        Returns:
            RiskDistribution: Distribution summary with grade
        """
        if not pools or len(pools) == 0:
            empty_distribution = [
                RiskMetric(tier=RiskTier.A, percentage=0, count=0),
                RiskMetric(tier=RiskTier.B, percentage=0, count=0),
                RiskMetric(tier=RiskTier.C, percentage=0, count=0),
                RiskMetric(tier=RiskTier.D, percentage=0, count=0),
            ]
            return RiskDistribution(
                distribution=empty_distribution,
                grade="N/A",
                total=0
            )
        
        # Count pools by tier
        counts = {RiskTier.A: 0, RiskTier.B: 0, RiskTier.C: 0, RiskTier.D: 0}
        
        for pool in pools:
            tier = RiskScorer.classify_risk_tier(pool)
            counts[tier] += 1
        
        total = len(pools)
        
        # Create distribution
        distribution = [
            RiskMetric(
                tier=tier,
                count=counts[tier],
                percentage=round((counts[tier] / total) * 100)
            )
            for tier in [RiskTier.A, RiskTier.B, RiskTier.C, RiskTier.D]
        ]
        
        # Calculate stability score
        stability_score = (
            counts[RiskTier.A] * 4 +
            counts[RiskTier.B] * 2 -
            counts[RiskTier.C] -
            counts[RiskTier.D] * 2
        ) / total
        
        # Assign grade
        if stability_score >= 3.2:
            grade = "A"
        elif stability_score >= 1.5:
            grade = "B+"
        elif stability_score >= 1:
            grade = "B"
        elif stability_score >= 0.2:
            grade = "B-"
        elif stability_score >= -0.5:
            grade = "C"
        else:
            grade = "C-"
        
        return RiskDistribution(
            distribution=distribution,
            grade=grade,
            total=total
        )


# Convenience functions
def classify_risk_tier(pool: YieldOpportunity) -> RiskTier:
    """Classify a single pool's risk tier."""
    return RiskScorer.classify_risk_tier(pool)


def compute_risk_distribution(pools: Optional[List[YieldOpportunity]] = None) -> RiskDistribution:
    """Compute risk distribution for a list of pools."""
    return RiskScorer.compute_risk_distribution(pools)
