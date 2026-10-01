from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
async def healthcheck():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "demo_mode": settings.DEMO_MODE,
        "gemini_api_configured": bool(settings.GEMINI_API_KEY)
    }
