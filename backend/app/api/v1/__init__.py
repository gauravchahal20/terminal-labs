from fastapi import APIRouter
from app.api.v1.leads import router as leads_router
from app.api.v1.pipeline import router as pipeline_router
from app.api.v1.agents import router as agents_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.outreach import router as outreach_router
from app.api.v1.auth_email import router as auth_email_router
from app.api.v1.directory_extractor import router as directory_extractor_router
from app.api.v1.health import router as health_router
from app.api.v1.cockpit import router as cockpit_router

api_v1_router = APIRouter()
api_v1_router.include_router(health_router)
api_v1_router.include_router(cockpit_router)
api_v1_router.include_router(leads_router)
api_v1_router.include_router(pipeline_router)
api_v1_router.include_router(agents_router)
api_v1_router.include_router(analytics_router)
api_v1_router.include_router(outreach_router)
api_v1_router.include_router(auth_email_router)
api_v1_router.include_router(directory_extractor_router)


