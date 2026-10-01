import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.outreach_generator import outreach_generator

def test_outreach_generation_grounding():
    res = outreach_generator.generate_outreach(
        company_name="Apex Logistics",
        domain="apexlogistics.com",
        decision_maker_name="Sarah Jenkins",
        decision_maker_title="Chief Operating Officer",
        recommended_service="AI Automation",
        primary_problem="Apex Logistics handles manual dispatch spreadsheet syncing across 5 warehouses.",
        potential_offer="Custom Python & LLM automated dispatch pipeline syncing in real-time.",
        observed_facts=["Public site apexlogistics.com shows manual tracking forms"],
        visible_signals=["Manual Dispatch Inquiries"],
        verified_source_url="https://apexlogistics.com/team"
    )

    assert "Sarah" in res["cold_email_body"]
    assert "Apex Logistics" in res["cold_email_body"]
    assert "AI Automation" in res["cold_email_subject"]
    assert "LinkedIn" in res or "linkedin_inmail_body" in res
    assert "https://apexlogistics.com/team" in res["research_citations"][0]
    assert len(res["personalized_icebreaker"]) > 20

@pytest.mark.asyncio
async def test_demo_lead_isolation_and_safety_rules():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Find all leads
        res = await client.get("/api/v1/leads?limit=50")
        assert res.status_code == 200
        leads = res.json()["leads"]

        # 1. Test Demo Lead rejection on send
        demo_lead = next((l for l in leads if l.get("lead_type") in ["DEMO", "SYNTHETIC"]), None)
        if demo_lead:
            detail_res = await client.get(f"/api/v1/leads/{demo_lead['id']}")
            drafts = detail_res.json().get("outreach_drafts", [])
            if drafts:
                draft_id = drafts[0]["id"]
                send_res = await client.post(f"/api/v1/outreach/{draft_id}/send-email")
                assert send_res.status_code == 400
                assert "DEMO/SYNTHETIC" in send_res.json()["detail"] or "isolated" in send_res.json()["detail"].lower()

        # 2. Test Recipient email safety gate & unapproved draft rejection
        real_lead = next((l for l in leads if l.get("lead_type") == "REAL"), None)
        if real_lead:
            detail_res = await client.get(f"/api/v1/leads/{real_lead['id']}")
            drafts = detail_res.json().get("outreach_drafts", [])
            if drafts:
                draft_id = drafts[0]["id"]
                # Ensure draft is unapproved
                await client.put(f"/api/v1/outreach/{draft_id}/approve", json={"is_approved": False})
                send_res = await client.post(f"/api/v1/outreach/{draft_id}/send-email")
                assert send_res.status_code == 400
                err_msg = send_res.json()["detail"].lower()
                assert ("recipient email is not sufficiently supported" in err_msg or
                        "approval" in err_msg or
                        "connect your google account" in err_msg)

        # 3. Test WhatsApp Link disclaimer
        if real_lead and drafts:
            wa_res = await client.post(f"/api/v1/outreach/{drafts[0]['id']}/send-whatsapp")
            if wa_res.status_code == 200:
                wa_data = wa_res.json()
                assert "disclaimer" in wa_data
                assert "unconfirmed" in wa_data["disclaimer"].lower() or "availability" in wa_data["disclaimer"].lower()
