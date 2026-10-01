import pytest
from app.services.opportunity_matcher import opportunity_matcher

def test_opportunity_matcher_whatsapp():
    res = opportunity_matcher.match_opportunity(
        company_name="Urban Luxe Realty",
        industry="Real Estate",
        detected_tech_stack=["WordPress"],
        visible_signals=["Missing WhatsApp Channel", "Manual Lead Inquiry"],
        hiring_signals=[],
        expansion_signals=[],
        conversion_friction_points=["Slow email follow up"],
        has_chatbot=True,
        has_whatsapp=False,
        ui_modernity_score=7.5
    )
    assert res["recommended_service"] == "WhatsApp Business Automation"
    assert "Urban Luxe Realty" in res["primary_problem"]
    assert "https://labs-terminal.vercel.app/services/whatsapp-automation" in res["service_url"]
    assert res["confidence"] >= 0.85

def test_opportunity_matcher_ai_agents():
    res = opportunity_matcher.match_opportunity(
        company_name="Apex Care",
        industry="HealthTech",
        detected_tech_stack=["Next.js", "FastAPI"],
        visible_signals=["Missing AI Chatbot", "Support Ticket Overload"],
        hiring_signals=["Hiring Tier-1 Support Reps"],
        expansion_signals=[],
        conversion_friction_points=["Long queue times for patient questions"],
        has_chatbot=False,
        has_whatsapp=True,
        ui_modernity_score=8.0
    )
    assert res["recommended_service"] == "AI Agents"
    assert "https://labs-terminal.vercel.app/services/ai-agents" in res["service_url"]
    assert res["confidence"] >= 0.85

def test_opportunity_matcher_ui_ux():
    res = opportunity_matcher.match_opportunity(
        company_name="Legacy Corp",
        industry="Legal",
        detected_tech_stack=["WordPress"],
        visible_signals=["Outdated UI", "Non-responsive elements"],
        hiring_signals=[],
        expansion_signals=[],
        conversion_friction_points=["5-page intake questionnaire"],
        has_chatbot=True,
        has_whatsapp=True,
        ui_modernity_score=5.5
    )
    assert res["recommended_service"] == "UI/UX & Brand Identity Design"
    assert "https://labs-terminal.vercel.app/services/ui-ux-brand-identity-design" in res["service_url"]
