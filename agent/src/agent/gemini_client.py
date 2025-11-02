"""Gemini 2.0 Flash AI client for yield analysis."""

import os
import json
from typing import List, Dict, Any, Optional
from loguru import logger
from pydantic import BaseModel, Field

try:
    import google.generativeai as genai
except ImportError:
    logger.error("google-generativeai not installed. Run: pip install google-generativeai")
    raise

from ..models.yield_opportunity import YieldOpportunity, RiskDistribution


class AllocationSchema(BaseModel):
    """Schema for a single portfolio allocation."""
    pool_id: str
    project: str
    chain: str
    symbol: str
    allocation_percentage: float
    allocation_usd: float
    expected_apy: float
    risk_tier: str
    reasoning: str


class RecommendationSchema(BaseModel):
    """Schema for the complete AI recommendation response."""
    allocations: List[AllocationSchema]
    total_allocated_usd: float
    weighted_expected_apy: float
    overall_risk_grade: str
    diversification_score: float
    summary: str
    key_risks: List[str]
    opportunities: List[str]
    rationale: str
    projected_returns: Dict[str, float]  # Simplified to basic dict
    estimated_fees: Dict[str, float]  # Simplified to basic dict
    confidence_score: float


class GeminiClient:
    """Client for Google Gemini 2.0 Flash Experimental API with structured output."""
    
    MODEL_NAME = "gemini-2.0-flash-exp"
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Gemini client.
        
        Args:
            api_key: Gemini API key (defaults to GEMINI_API_KEY env var)
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        
        if not self.api_key:
            raise ValueError(
                "Gemini API key required. Set GEMINI_API_KEY environment variable "
                "or pass api_key parameter."
            )
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        
        # Initialize model (generation_config will be set per-request for structured output)
        self.model = genai.GenerativeModel(
            model_name=self.MODEL_NAME,
            safety_settings=[
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_NONE"
                },
            ]
        )
        
        logger.info(f"Gemini client initialized with model: {self.MODEL_NAME}")
    
    def _format_opportunities(
        self,
        opportunities: List[YieldOpportunity],
        limit: int = 20
    ) -> str:
        """Format opportunities for AI context."""
        formatted = []
        
        for i, opp in enumerate(opportunities[:limit], 1):
            formatted.append(f"""
{i}. {opp.project} - {opp.symbol} ({opp.chain})
   - APY: {opp.apy:.2f}% (Base: {opp.apy_base or 0:.2f}%, Reward: {opp.apy_reward or 0:.2f}%)
   - TVL: ${opp.tvl_usd:,.0f} USD
   - Risk Tier: {opp.risk_tier.value if opp.risk_tier else 'N/A'} (Score: {opp.risk_score:.2f})
   - Stablecoin: {opp.stablecoin}
   - IL Risk: {opp.il_risk}
   - Exposure: {opp.exposure}
   - Prediction: {opp.predicted_class} ({opp.predicted_probability}% confidence)
   - Volatility: {abs(opp.apy_pct_7d or 0):.2f}% (7d change)
""".strip())
        
        return "\n\n".join(formatted)
    
    def _build_recommendation_prompt(
        self,
        opportunities: List[YieldOpportunity],
        amount_usd: float,
        risk_tolerance: str,
        preferred_chains: Optional[List[str]] = None,
        min_liquidity_usd: Optional[float] = None,
        risk_distribution: Optional[RiskDistribution] = None
    ) -> str:
        """Build the recommendation prompt for Gemini (simplified for structured output)."""
        
        chains_str = ", ".join(preferred_chains) if preferred_chains else "Any"
        liquidity_str = f"${min_liquidity_usd:,.0f}" if min_liquidity_usd else "No minimum"
        
        risk_dist_str = ""
        if risk_distribution:
            risk_dist_str = f"""
Market Risk Distribution:
- Tier A: {risk_distribution.distribution[0].percentage}% ({risk_distribution.distribution[0].count} pools)
- Tier B: {risk_distribution.distribution[1].percentage}% ({risk_distribution.distribution[1].count} pools)
- Tier C: {risk_distribution.distribution[2].percentage}% ({risk_distribution.distribution[2].count} pools)
- Tier D: {risk_distribution.distribution[3].percentage}% ({risk_distribution.distribution[3].count} pools)
- Overall: {risk_distribution.grade}
"""
        
        opportunities_str = self._format_opportunities(opportunities)
        
        prompt = f"""You are a DeFi yield analyst. Create a personalized portfolio recommendation.

USER CONTEXT:
- Amount: ${amount_usd:,.2f} USD
- Risk: {risk_tolerance}
- Chains: {chains_str}
- Min Liquidity: {liquidity_str}

{risk_dist_str}

OPPORTUNITIES ({len(opportunities)} available):
{opportunities_str}

REQUIREMENTS:
1. Recommend 3-5 allocations totaling 100% of capital
2. Diversify across protocols, chains, risk tiers, and asset types
3. Match risk tolerance - explain rationale for each allocation
4. Calculate projected returns (1d, 7d, 30d, 365d in USD)
5. Estimate fees (bridge, swap, gas)
6. Provide executive summary, top 3 risks, top 3 opportunities
7. Rate confidence 0-100
"""
        
        return prompt
    
    async def get_recommendation(
        self,
        opportunities: List[YieldOpportunity],
        amount_usd: float,
        risk_tolerance: str,
        preferred_chains: Optional[List[str]] = None,
        min_liquidity_usd: Optional[float] = None,
        risk_distribution: Optional[RiskDistribution] = None
    ) -> Dict[str, Any]:
        """
        Get AI-powered recommendation from Gemini with structured output.
        
        Args:
            opportunities: List of available yield opportunities
            amount_usd: Investment amount in USD
            risk_tolerance: User's risk tolerance (low/medium/high)
            preferred_chains: Optional list of preferred chains
            min_liquidity_usd: Optional minimum liquidity requirement
            risk_distribution: Optional risk distribution summary
            
        Returns:
            Dict containing recommendation data
        """
        try:
            logger.info(
                f"Requesting recommendation from Gemini Flash Lite: "
                f"amount=${amount_usd}, risk={risk_tolerance}, "
                f"opportunities={len(opportunities)}"
            )
            
            # Build prompt
            prompt = self._build_recommendation_prompt(
                opportunities=opportunities,
                amount_usd=amount_usd,
                risk_tolerance=risk_tolerance,
                preferred_chains=preferred_chains,
                min_liquidity_usd=min_liquidity_usd,
                risk_distribution=risk_distribution
            )
            
            # Generate response with JSON output
            # Note: Using response_mime_type without schema for better compatibility
            # This still ensures valid JSON but allows more flexibility
            response = self.model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.7,
                    "top_p": 0.95,
                    "top_k": 40,
                    "max_output_tokens": 4096,  # Reduced for faster responses
                    "response_mime_type": "application/json",
                }
            )
            
            # Parse structured JSON response
            # The response_schema ensures valid JSON, but we still need to parse the text
            response_text = response.text.strip()
            recommendation = json.loads(response_text)
            
            # Validate against our schema (optional but recommended)
            try:
                validated = RecommendationSchema(**recommendation)
                # Convert back to dict for compatibility
                recommendation = validated.model_dump()
            except Exception as validation_error:
                logger.warning(f"Schema validation warning: {validation_error}")
                # Continue with unvalidated data if validation fails
            
            logger.info(
                f"Received structured recommendation: "
                f"{len(recommendation.get('allocations', []))} allocations, "
                f"confidence={recommendation.get('confidence_score')}%"
            )
            
            return recommendation
            
        except Exception as e:
            logger.error(f"Error getting recommendation from Gemini: {e}")
            raise
    
    def analyze_opportunity(
        self,
        opportunity: YieldOpportunity,
        amount_usd: float
    ) -> str:
        """
        Get detailed analysis of a specific opportunity.
        
        Args:
            opportunity: Yield opportunity to analyze
            amount_usd: Potential investment amount
            
        Returns:
            Detailed analysis text
        """
        try:
            prompt = f"""Analyze this DeFi yield opportunity in detail:

Project: {opportunity.project}
Chain: {opportunity.chain}
Symbol: {opportunity.symbol}
APY: {opportunity.apy}%
TVL: ${opportunity.tvl_usd:,.0f}
Risk Tier: {opportunity.risk_tier.value if opportunity.risk_tier else 'N/A'}
Stablecoin: {opportunity.stablecoin}
IL Risk: {opportunity.il_risk}

Investment Amount: ${amount_usd:,.2f}

Provide:
1. Opportunity overview
2. Risk analysis
3. Expected returns over 1d, 7d, 30d, 365d
4. Key considerations
5. Recommendation (invest/avoid/consider)
"""
            
            response = self.model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            logger.error(f"Error analyzing opportunity: {e}")
            raise
