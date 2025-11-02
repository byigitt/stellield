"""Tests for risk scoring functionality."""

import pytest
from src.models.yield_opportunity import YieldOpportunity, RiskTier
from src.data.risk_scorer import RiskScorer, classify_risk_tier, compute_risk_distribution


class TestRiskScorer:
    """Test cases for RiskScorer class."""
    
    def test_calculate_risk_score_low_risk_stable(self):
        """Test risk score calculation for low-risk stable opportunity."""
        pool = YieldOpportunity(
            chain="Ethereum",
            project="Aave",
            symbol="USDC",
            apy=5.0,
            tvlUsd=10000000,
            stablecoin=True,
            ilRisk="no",
            predictedClass="stable/up",
            predictedProbability=90,
            apyPct7D=0.5,
        )
        
        score = RiskScorer.calculate_risk_score(pool)
        
        # High score = lower risk
        assert score >= 3.0, f"Expected high score for low-risk pool, got {score}"
    
    def test_calculate_risk_score_high_risk_volatile(self):
        """Test risk score calculation for high-risk volatile opportunity."""
        pool = YieldOpportunity(
            chain="Ethereum",
            project="HighYield",
            symbol="VOLATILE",
            apy=50.0,  # Very high APY
            tvlUsd=100000,
            stablecoin=False,
            ilRisk="yes",  # Impermanent loss risk
            predictedClass="down",
            predictedProbability=30,
            apyPct7D=10.0,  # High volatility
        )
        
        score = RiskScorer.calculate_risk_score(pool)
        
        # Low score = higher risk
        assert score < 0, f"Expected low score for high-risk pool, got {score}"
    
    def test_classify_risk_tier_a(self):
        """Test classification into Tier A (safest)."""
        pool = YieldOpportunity(
            chain="Ethereum",
            project="Aave",
            symbol="USDC",
            apy=4.0,
            tvlUsd=50000000,
            stablecoin=True,
            ilRisk="no",
            predictedClass="stable/up",
            predictedProbability=95,
        )
        
        tier = classify_risk_tier(pool)
        
        assert tier == RiskTier.A, f"Expected tier A, got {tier}"
    
    def test_classify_risk_tier_d(self):
        """Test classification into Tier D (riskiest)."""
        pool = YieldOpportunity(
            chain="BSC",
            project="HighRisk",
            symbol="MEME",
            apy=100.0,
            tvlUsd=10000,
            stablecoin=False,
            ilRisk="yes",
            predictedClass="down",
            predictedProbability=20,
            apyPct7D=20.0,
        )
        
        tier = classify_risk_tier(pool)
        
        assert tier == RiskTier.D, f"Expected tier D, got {tier}"
    
    def test_compute_risk_distribution_empty(self):
        """Test risk distribution with empty pool list."""
        distribution = compute_risk_distribution([])
        
        assert distribution.total == 0
        assert distribution.grade == "N/A"
        assert len(distribution.distribution) == 4
        assert all(metric.count == 0 for metric in distribution.distribution)
    
    def test_compute_risk_distribution_mixed(self):
        """Test risk distribution with mixed pool tiers."""
        pools = [
            # 2 Tier A pools
            YieldOpportunity(
                chain="Ethereum", project="Aave", symbol="USDC",
                apy=5.0, tvlUsd=1000000, stablecoin=True, ilRisk="no",
                predictedClass="stable/up", predictedProbability=90
            ),
            YieldOpportunity(
                chain="Ethereum", project="Compound", symbol="USDT",
                apy=4.5, tvlUsd=2000000, stablecoin=True, ilRisk="no",
                predictedClass="stable/up", predictedProbability=85
            ),
            # 1 Tier B pool
            YieldOpportunity(
                chain="Ethereum", project="Curve", symbol="ETH",
                apy=8.0, tvlUsd=500000, stablecoin=False, ilRisk="no",
                predictedClass="stable", predictedProbability=70
            ),
            # 1 Tier C pool
            YieldOpportunity(
                chain="BSC", project="PancakeSwap", symbol="BNB",
                apy=15.0, tvlUsd=200000, stablecoin=False, ilRisk="yes"
            ),
        ]
        
        distribution = compute_risk_distribution(pools)
        
        assert distribution.total == 4
        assert distribution.distribution[0].tier == RiskTier.A
        assert distribution.distribution[0].count >= 1
        assert distribution.grade in ["A", "B+", "B", "B-", "C", "C-"]
    
    def test_apy_impact_on_risk(self):
        """Test that higher APY increases risk score negatively."""
        low_apy_pool = YieldOpportunity(
            chain="Ethereum", project="Aave", symbol="USDC",
            apy=5.0, tvlUsd=1000000, stablecoin=True
        )
        
        high_apy_pool = YieldOpportunity(
            chain="Ethereum", project="Aave", symbol="USDC",
            apy=25.0, tvlUsd=1000000, stablecoin=True
        )
        
        low_score = RiskScorer.calculate_risk_score(low_apy_pool)
        high_score = RiskScorer.calculate_risk_score(high_apy_pool)
        
        assert low_score > high_score, "Lower APY should have better risk score"
    
    def test_stablecoin_bonus(self):
        """Test that stablecoins with no IL risk get bonus points."""
        stablecoin_pool = YieldOpportunity(
            chain="Ethereum", project="Aave", symbol="USDC",
            apy=5.0, tvlUsd=1000000, stablecoin=True, ilRisk="no"
        )
        
        non_stablecoin_pool = YieldOpportunity(
            chain="Ethereum", project="Aave", symbol="ETH",
            apy=5.0, tvlUsd=1000000, stablecoin=False, ilRisk="no"
        )
        
        stable_score = RiskScorer.calculate_risk_score(stablecoin_pool)
        non_stable_score = RiskScorer.calculate_risk_score(non_stablecoin_pool)
        
        assert stable_score > non_stable_score, "Stablecoin should have better risk score"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
