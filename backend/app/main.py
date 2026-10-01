import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db, AsyncSessionLocal
from app.services.seed_data import seed_database_if_empty
from app.api.v1 import api_v1_router

# Logging Configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("terminal_labs")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Terminal Labs Database Schema...")
    await init_db()
    
    logger.info("Verifying Seed Dataset...")
    async with AsyncSessionLocal() as session:
        await seed_database_if_empty(session)
        
    logger.info("Terminal Labs AI Lead Intelligence Platform Backend Ready.")
    yield
    logger.info("Shutting down Terminal Labs Backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Autonomous B2B Lead Intelligence & Qualification Engine for Terminal Labs",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "platform": settings.PROJECT_NAME,
        "agency": "Terminal Labs",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR,
        "status": "online"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
