import pytest
from app.services.scoring_engine import scoring_engine

def test_scoring_hot_lead():
    res = scoring_engine.score_lead(
        industry="SaaS",
        company_size="51-200",
        detected_tech_stack=["React", "Node.js", "PostgreSQL", "Stripe"],
        visible_signals=["Missing AI Chatbot", "Manual Sales Scheduling", "Outdated UI"],
        hiring_signals=["Hiring 3x Support Engineers", "Looking for Solutions Architect"],
        expansion_signals=["Expanding into EMEA"],
        conversion_friction_points=["Manual 5-field form", "No instant chat booking"],
        has_website=True,
        website_status="SAAS_OPPORTUNITY",
        buying_intent="HIGH",
        has_chatbot=False,
        has_whatsapp=False,
        decision_makers_count=3,
        primary_decision_maker_has_email=True,
        has_phone=True
    )
    assert res["total_score"] >= 75
    assert res["tier"] in ["Hot", "Warm"]
    assert res["business_fit"] >= 20.0     # max 25
    assert res["service_fit"] >= 20.0      # max 25
    assert res["opportunity_signal"] >= 10.0 # max 20
    assert res["buying_intent"] == 15.0     # max 15 (HIGH)
    assert res["contactability"] >= 3.0     # max 5

def test_scoring_weights_sum_to_one():
    weights = scoring_engine.WEIGHTS
    total = sum(weights.values())
    assert abs(total - 1.0) < 0.001

def test_scoring_cold_lead():
    res = scoring_engine.score_lead(
        industry="Local Mining",
        company_size="1-5",
        detected_tech_stack=["HTML5"],
        visible_signals=[],
        hiring_signals=[],
        expansion_signals=[],
        conversion_friction_points=[],
        has_website=True,
        website_status="ACTIVE",
        buying_intent="LOW",
        has_chatbot=True,
        has_whatsapp=True,
        decision_makers_count=0,
        primary_decision_maker_has_email=False,
        has_phone=False
    )
    assert res["total_score"] < 60
    assert res["tier"] in ["Moderate", "Cold"]
