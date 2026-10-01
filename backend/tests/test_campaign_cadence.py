import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_campaign_and_discovery_runs():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Test Discovery Runs History Endpoint
        res_runs = await client.get("/api/v1/agents/discovery-runs")
        assert res_runs.status_code == 200
        runs = res_runs.json()
        assert isinstance(runs, list)

        # 2. Trigger a discovery search to create a new DiscoveryRun entry
        discovery_payload = {
            "industry": "Real Estate",
            "country": "India",
            "city": "Gurgaon",
            "target_service": "WhatsApp Business Automation",
            "website_status": "WEBSITE_PLUS_AUTOMATION",
            "buying_intent": "HIGH",
            "auto_qualify": True,
            "limit": 3
        }
        res_disc = await client.post("/api/v1/agents/discovery", json=discovery_payload)
        assert res_disc.status_code == 200
        disc_data = res_disc.json()
        assert disc_data["status"] == "success"
        assert "run_id" in disc_data

        # 3. Verify DiscoveryRun was logged
        res_runs2 = await client.get("/api/v1/agents/discovery-runs")
        assert res_runs2.status_code == 200
        runs2 = res_runs2.json()
        assert len(runs2) >= 1
        assert runs2[0]["location"] in ["Gurgaon", "India"]

        # 4. Test Batch Send Endpoint safety checks
        res_leads = await client.get("/api/v1/leads?limit=5")
        assert res_leads.status_code == 200
        leads = res_leads.json().get("leads", [])
        draft_ids = []
        for l in leads:
            detail_res = await client.get(f"/api/v1/leads/{l['id']}")
            detail = detail_res.json()
            if detail.get("outreach_drafts"):
                draft_ids.append(detail["outreach_drafts"][0]["id"])

        if draft_ids:
            batch_res = await client.post("/api/v1/outreach/batch-send", json={"draft_ids": draft_ids[:2]})
            assert batch_res.status_code == 200
            batch_data = batch_res.json()
            assert "total_requested" in batch_data
