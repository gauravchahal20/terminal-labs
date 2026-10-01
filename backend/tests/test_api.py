import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db, AsyncSessionLocal
from app.services.seed_data import seed_database_if_empty

@pytest_asyncio.fixture(autouse=True)
async def prepare_db():
    await init_db()
    async with AsyncSessionLocal() as session:
        await seed_database_if_empty(session)

@pytest.mark.asyncio
async def test_healthcheck():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Terminal Labs" in data["service"]

@pytest.mark.asyncio
async def test_list_leads_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/leads")
    assert response.status_code == 200
    data = response.json()
    assert "leads" in data
    assert len(data["leads"]) > 0

@pytest.mark.asyncio
async def test_analytics_dashboard_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/analytics/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert data["kpis"]["total_leads"] > 0
    assert "industry_breakdown" in data
    assert "service_distribution" in data
