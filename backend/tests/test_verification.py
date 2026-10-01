import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_full_stack_verification():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health check / Root
        res_root = await client.get("/")
        assert res_root.status_code == 200

        # 2. Leads API
        res_leads = await client.get("/api/v1/leads?limit=50")
        assert res_leads.status_code == 200
        leads_data = res_leads.json()
        leads = leads_data.get("leads", [])
        assert len(leads) >= 12, f"Expected at least 12 leads, got {len(leads)}"

        # Verify real lead provenance and contact confidence
        for lead in leads:
            assert lead["lead_type"] in ["REAL", "DEMO", "SYNTHETIC"]
            assert lead["whatsapp_status"] in ["WHATSAPP_CONFIRMED", "PUBLIC_PHONE_ONLY", "WHATSAPP_UNKNOWN", "INVALID", "UNKNOWN"]
            if lead["score"]:
                assert "evidence_confidence" in lead["score"]
                assert "contact_confidence" in lead["score"]
                assert "total_score" in lead["score"]

        # 3. No-Website Leads Filter
        res_noweb = await client.get("/api/v1/leads?website_status=NO_WEBSITE")
        assert res_noweb.status_code == 200
        noweb_data = res_noweb.json()
        noweb_leads = noweb_data.get("leads", [])
        assert len(noweb_leads) >= 3, f"Expected at least 3 no-website leads, got {len(noweb_leads)}"
        for lead in noweb_leads:
            assert lead["website_status"] == "NO_WEBSITE"
            assert lead["score"] is not None
            assert "business_fit" in lead["score"]
            assert "service_fit" in lead["score"]
            assert "calculation_explanation" in lead["score"]

        # 4. Analytics Endpoint
        res_analytics = await client.get("/api/v1/analytics")
        assert res_analytics.status_code == 200
        analytics = res_analytics.json()
        assert "kpis" in analytics
        assert analytics["kpis"]["total_leads"] >= 12
        assert "charts" in analytics

        # 5. Production Readiness Endpoint
        res_readiness = await client.get("/api/v1/analytics/production-readiness")
        assert res_readiness.status_code == 200
        readiness = res_readiness.json()
        assert "production_readiness_score" in readiness
        assert "status" in readiness
        assert "data_integrity" in readiness
        assert "contact_provenance" in readiness
        assert "gmail_status" in readiness
        assert "whatsapp_status" in readiness
        assert "api_status" in readiness
        assert "database_status" in readiness
        assert "security_status" in readiness
        assert "test_status" in readiness

        # 6. CSV Export Endpoint
        res_csv = await client.get("/api/v1/leads/export/csv")
        assert res_csv.status_code == 200
        csv_lines = res_csv.text.strip().splitlines()
        assert len(csv_lines) >= 13
        header = csv_lines[0]
        assert "Lead Type" in header
        assert "Website Status" in header
        assert "Buying Intent" in header
        assert "Intent Signal" in header
        assert "Decision Maker Phone" in header

        # 7. Approval Toggle Endpoint
        lead_id = leads[0]["id"]
        lead_detail_res = await client.get(f"/api/v1/leads/{lead_id}")
        lead_detail = lead_detail_res.json()
        if lead_detail.get("outreach_drafts"):
            draft_id = lead_detail["outreach_drafts"][0]["id"]
            approval_res = await client.put(f"/api/v1/outreach/{draft_id}/approve", json={"is_approved": True})
            assert approval_res.status_code == 200
            approval_data = approval_res.json()
            assert approval_data["is_approved"] is True
            assert approval_data["approval_status"] == "APPROVED"
            assert approval_data["approved_at"] is not None
