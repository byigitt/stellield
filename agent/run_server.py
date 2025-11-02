"""Run the FastAPI server for Stellar Yield Agent."""

import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    port = int(os.getenv("API_PORT", "8000"))
    host = os.getenv("API_HOST", "0.0.0.0")
    workers = int(os.getenv("API_WORKERS", "1"))
    
    print(f"🚀 Starting Stellar Yield Agent API on {host}:{port}")
    print(f"📖 API Documentation: http://{host}:{port}/docs")
    print(f"🔍 Health Check: http://{host}:{port}/health")
    
    uvicorn.run(
        "src.api.server:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
