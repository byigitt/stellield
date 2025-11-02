"""Tests for data models."""

import pytest
from src.models.yield_opportunity import YieldOpportunity, RiskTier, RiskMetric, RiskDistribution
from src.models.recommendation import PortfolioAllocation, Recommendation


class TestYieldOpportunity:
    """Test cases for YieldOpportunity model."""
    
    def test_create_basic_opportunity(self):
        """Test creating a basic yield opportunity."""
        opp = YieldOpportunity(
            chain="Ethereum",
            project="Aave",
            symbol="USDC",
            apy=5.5,
            tvlUsd=10000000,
        )
        
        assert opp.chain == "Ethereum"
        assert opp.project == "Aave"
        assert opp.symbol == "USDC"
        assert opp.apy == 5.5
        assert opp.tvl_usd == 10000000
    
    def test_create_with_aliases(self):
        """Test creating opportunity with camelCase aliases."""
        opp = YieldOpportunity(
            chain="Stellar",
            project="StellarDEX",
            symbol="XLM/USDC",
            tvlUsd=500000,  # camelCase
            apyBase=3.0,    # camelCase
            apyReward=2.0,  # camelCase
            ilRisk="no",    # camelCase
        )
        
        assert opp.tvl_usd == 500000
        assert opp.apy_base == 3.0
        assert opp.apy_reward == 2.0
        assert opp.il_risk == "no"
    
    def test_predicted_class_lowercase(self):
        """Test that predicted_class is normalized to lowercase."""
        opp = YieldOpportunity(
            chain="Ethereum",
            project="Test",
            symbol="TEST",
            predictedClass="STABLE/UP",
        )
        
        assert opp.predicted_class == "stable/up"
    
    def test_risk_tier_enum(self):
        """Test RiskTier enum values."""
        assert RiskTier.A.value == "A"
        assert RiskTier.B.value == "B"
        assert RiskTier.C.value == "C"
        assert RiskTier.D.value == "D"


class TestRiskDistribution:
    """Test cases for RiskDistribution model."""
    
    def test_create_risk_distribution(self):
        """Test creating a risk distribution."""
        distribution = RiskDistribution(
            distribution=[
                RiskMetric(tier=RiskTier.A, percentage=50, count=5),
                RiskMetric(tier=RiskTier.B, percentage=30, count=3),
                RiskMetric(tier=RiskTier.C, percentage=10, count=1),
                RiskMetric(tier=RiskTier.D, percentage=10, count=1),
            ],
            grade="B+",
            total=10
        )
        
        assert distribution.total == 10
        assert distribution.grade == "B+"
        assert len(distribution.distribution) == 4
    
    def test_to_dict(self):
        """Test converting risk distribution to dict."""
        distribution = RiskDistribution(
            distribution=[
                RiskMetric(tier=RiskTier.A, percentage=100, count=1),
            ],
            grade="A",
            total=1
        )
        
        data = distribution.to_dict()
        
        assert data["total"] == 1
        assert data["grade"] == "A"
        assert len(data["distribution"]) == 1
        assert data["distribution"][0]["tier"] == "A"


class TestRecommendation:
    """Test cases for Recommendation model."""
    
    def test_create_recommendation(self):
        """Test creating a recommendation."""
        opp = YieldOpportunity(
            chain="Ethereum",
            project="Aave",
            symbol="USDC",
            apy=5.0,
            tvlUsd=10000000,
        )
        
        allocation = PortfolioAllocation(
            opportunity=opp,
            allocation_percentage=100,
            allocation_usd=10000,
            expected_apy=5.0,
            risk_tier=RiskTier.A,
            reasoning="Safe stablecoin yield"
        )
        
        rec = Recommendation(
            requested_amount_usd=10000,
            risk_tolerance="low",
            allocations=[allocation],
            total_allocated_usd=10000,
            weighted_expected_apy=5.0,
            overall_risk_grade="A",
            diversification_score=50,
            summary="Conservative portfolio",
            key_risks=["Smart contract risk"],
            opportunities=["Stable returns"],
            rationale="Focus on safety",
            projected_returns={"1d": 1.37, "365d": 500},
            estimated_fees={"total": 10},
            confidence_score=90,
            timestamp="2025-11-02T08:00:00",
            data_freshness_seconds=0
        )
        
        assert rec.requested_amount_usd == 10000
        assert rec.risk_tolerance == "low"
        assert len(rec.allocations) == 1
        assert rec.weighted_expected_apy == 5.0
        assert rec.confidence_score == 90
    
    def test_allocation_percentage_validation(self):
        """Test that allocation percentage is validated."""
        opp = YieldOpportunity(
            chain="Ethereum",
            project="Test",
            symbol="TEST"
        )
        
        # Valid allocation
        allocation = PortfolioAllocation(
            opportunity=opp,
            allocation_percentage=50,
            allocation_usd=5000,
            expected_apy=5.0,
            risk_tier=RiskTier.B,
            reasoning="Test"
        )
        assert allocation.allocation_percentage == 50
        
        # Invalid allocation (>100) should raise validation error
        with pytest.raises(Exception):  # Pydantic ValidationError
            PortfolioAllocation(
                opportunity=opp,
                allocation_percentage=150,  # Invalid!
                allocation_usd=5000,
                expected_apy=5.0,
                risk_tier=RiskTier.B,
                reasoning="Test"
            )


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
