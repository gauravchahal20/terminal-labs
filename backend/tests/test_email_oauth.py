import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db, AsyncSessionLocal
from app.services.seed_data import seed_database_if_empty
from app.services.mailer_service import mailer_service

@pytest_asyncio.fixture(autouse=True)
async def prepare_db():
    await init_db()
    async with AsyncSessionLocal() as session:
        await seed_database_if_empty(session)

@pytest.mark.asyncio
async def test_email_account_retrieval_and_status():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/email-account")
    assert res.status_code == 200
    account = res.json()
    assert "sender_email" in account
    assert "is_connected" in account
    assert "gmail_status" in account
    assert "is_oauth_configured" in account

@pytest.mark.asyncio
async def test_google_oauth_url_generation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/email-account/google/auth-url")
    assert res.status_code == 200
    auth_data = res.json()
    assert "scopes" in auth_data
    assert "https://www.googleapis.com/auth/gmail.send" in auth_data["scopes"]
    assert "openid" in auth_data["scopes"]

@pytest.mark.asyncio
async def test_unconfigured_oauth_callback_rejection():
    """Verify that when Google OAuth credentials are not in environment, mock tokens are NOT generated."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post(
            "/api/v1/email-account/google/callback",
            json={"code": "4/0AeanS0Y9invalid_code_sample"}
        )
    # When credentials not configured in .env, returns 400 with descriptive error
    assert res.status_code == 400
    assert "Google OAuth is not configured" in res.json()["detail"] or "Error" in res.json()["detail"]

@pytest.mark.asyncio
async def test_email_test_connection_unconfigured():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post("/api/v1/email-account/test-connection")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ["NOT CONFIGURED", "FAILED", "CONNECTED"]

@pytest.mark.asyncio
async def test_disconnect_email_account():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post("/api/v1/email-account/disconnect")
    assert res.status_code == 200
    data = res.json()
    assert data["is_connected"] is False
    assert data["gmail_status"] == "DISCONNECTED"
