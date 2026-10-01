import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_sales_cockpit_today_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/cockpit/today")
        assert res.status_code == 200
        data = res.json()
        assert "summary" in data
        assert "high_fit_leads" in data
        assert "active_buying_signals" in data
        assert "next_best_action_breakdown" in data
        assert data["summary"]["actionable_leads_count"] >= 1

@pytest.mark.asyncio
async def test_natural_language_prospect_parser():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Local no-website dental search
        res = await client.post("/api/v1/cockpit/ask", json={
            "query": "Find dental clinics in Chandigarh with no website"
        })
        assert res.status_code == 200
        data = res.json()
        assert data["interpreted_filter"]["category"] == "Dental"
        assert data["interpreted_filter"]["city"] == "Chandigarh"
        assert data["interpreted_filter"]["website_status"] == "NO_WEBSITE"
        assert len(data["businesses"]) > 0

        # 2. Foreign SaaS high intent search
        res_saas = await client.post("/api/v1/cockpit/ask", json={
            "query": "Find 50 US SaaS companies with remote hiring"
        })
        assert res_saas.status_code == 200
        saas_data = res_saas.json()
        assert saas_data["interpreted_filter"]["country"] == "USA"
        assert saas_data["interpreted_filter"]["buying_intent"] == "HIGH"
        assert saas_data["interpreted_filter"]["limit"] == 50

@pytest.mark.asyncio
async def test_lookalike_and_feedback_loop():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Get a real lead
        res_leads = await client.get("/api/v1/leads?limit=5")
        assert res_leads.status_code == 200
        leads = res_leads.json().get("leads", [])
        assert len(leads) > 0
        lead = leads[0]

        # 1. Lookalike search
        res_look = await client.get(f"/api/v1/cockpit/lookalike/{lead['id']}")
        assert res_look.status_code == 200
        look_data = res_look.json()
        assert "lookalike_candidates" in look_data

        # 2. Human Feedback
        res_feed = await client.post("/api/v1/cockpit/feedback", json={
            "lead_id": lead["id"],
            "feedback_type": "GOOD_LEAD",
            "note": "Verified excellent fit for Next.js web application"
        })
        assert res_feed.status_code == 200
        feed_data = res_feed.json()
        assert feed_data["is_feedback_influenced"] is True

        # 3. Saved Searches
        res_save = await client.post("/api/v1/cockpit/saved-searches", json={
            "title": "Chandigarh Dental Monitor",
            "category": "Dental",
            "city": "Chandigarh",
            "website_status": "NO_WEBSITE",
            "auto_monitor": True
        })
        assert res_save.status_code == 200
        saved_data = res_save.json()
        assert saved_data["title"] == "Chandigarh Dental Monitor"
