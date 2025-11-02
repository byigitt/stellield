"""FastAPI server for AI-powered yield recommendations."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import os
from loguru import logger

from ..agent.recommendation_engine import RecommendationEngine
from ..models.recommendation import RecommendationResponse

# Initialize FastAPI app
app = FastAPI(
    title="Stellar Yield Agent API",
    description="AI-powered yield recommendations using Google Gemini 2.0 Flash",
    version="0.1.0"
)

# CORS middleware configuration
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecommendationRequest(BaseModel):
    """Request model for yield recommendations."""
    
    amount_usd: float = Field(
        gt=0,
        description="Investment amount in USD",
        example=10000
    )
    risk_tolerance: str = Field(
        default="medium",
        pattern="^(low|medium|high)$",
        description="Risk tolerance level",
        example="medium"
    )
    preferred_chains: Optional[List[str]] = Field(
        default=None,
        description="Preferred blockchain networks",
        example=["Stellar", "Ethereum"]
    )
    min_liquidity_usd: Optional[float] = Field(
        default=50000,
        description="Minimum TVL requirement in USD",
        example=50000
    )
    min_apy: Optional[float] = Field(
        default=None,
        description="Minimum APY percentage",
        example=5.0
    )


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "Stellar Yield Agent API",
        "version": "0.1.0",
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "agent-api"
    }


@app.post("/api/recommendations", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """
    Generate AI-powered yield recommendations.
    
    Args:
        request: Recommendation request parameters
        
    Returns:
        RecommendationResponse with allocations and analysis
        
    Raises:
        HTTPException: If recommendation generation fails
    """
    try:
        logger.info(
            f"Recommendation request: amount=${request.amount_usd}, "
            f"risk={request.risk_tolerance}"
        )
        
        async with RecommendationEngine() as engine:
            response = await engine.recommend(
                amount_usd=request.amount_usd,
                risk_tolerance=request.risk_tolerance,
                preferred_chains=request.preferred_chains,
                min_liquidity_usd=request.min_liquidity_usd,
                min_apy=request.min_apy,
                max_opportunities=20
            )
            
            if not response.success:
                logger.error(f"Recommendation failed: {response.error}")
                raise HTTPException(
                    status_code=500,
                    detail=response.error or "Failed to generate recommendation"
                )
            
            logger.info("Recommendation generated successfully")
            return response
            
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/health/detailed")
async def detailed_health():
    """Detailed health check with service dependencies."""
    try:
        # Check if Gemini API key is configured
        gemini_key = os.getenv("GEMINI_API_KEY")
        gemini_status = "configured" if gemini_key else "missing"
        
        return {
            "status": "ok",
            "service": "agent-api",
            "dependencies": {
                "gemini_api": gemini_status,
            },
            "environment": {
                "api_port": os.getenv("API_PORT", "8000"),
                "log_level": os.getenv("LOG_LEVEL", "INFO"),
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unhealthy")


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("API_PORT", "8000"))
    host = os.getenv("API_HOST", "0.0.0.0")
    
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info"
    )
