import re
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func, desc
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import verify_token
from app.models import (
    Lead,
    CompanyResearch,
    DecisionMaker,
    LeadScore,
    Opportunity,
    OutreachDraft,
    ActivityLog,
    LeadFeedback,
    SavedSearch,
    ICPProfile
)
from app.services.discovery_service import discovery_service

router = APIRouter(prefix="/cockpit", tags=["Sales Cockpit & Intelligence"])

class NaturalLanguageAskRequest(BaseModel):
    query: str

class FeedbackRequest(BaseModel):
    lead_id: str
    feedback_type: str # GOOD_LEAD, BAD_LEAD, WRONG_SERVICE, WRONG_CONTACT, USEFUL_MESSAGE, BAD_MESSAGE
    note: Optional[str] = None

class SavedSearchCreateRequest(BaseModel):
    title: str
    category: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = "India"
    website_status: Optional[str] = "All"
    whatsapp_signal: Optional[str] = "All"
    buying_intent: Optional[str] = "All"
    keywords: Optional[str] = None
    auto_monitor: bool = True

@router.get("/today")
async def get_today_sales_cockpit(
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Returns today's high-impact actionable items for the sales cockpit:
    - High-fit leads ready for outreach
    - New explicit buying signals
    - Drafts awaiting human approval
    - Contacts requiring quick verification
    - Stale leads needing fresh observation
    - Next Best Action summary breakdown
    """
    stmt = select(Lead).options(
        selectinload(Lead.score),
        selectinload(Lead.opportunity),
        selectinload(Lead.decision_makers),
        selectinload(Lead.outreach_drafts)
    )
    result = await db.execute(stmt)
    leads = result.scalars().all()

    now = datetime.now(timezone.utc)

    # 1. High Fit Leads (Hot Tier / Score >= 75)
    high_fit_leads = [
        {
            "id": l.id,
            "company_name": l.company_name,
            "category": l.category or l.industry,
            "city": l.city,
            "country": l.country,
            "score": l.score.total_score if l.score else 0,
            "recommended_service": l.opportunity.recommended_service if l.opportunity else "Digital Modernization",
            "website_status": l.website_status,
            "buying_intent": l.buying_intent,
            "next_best_action": l.next_best_action or "GENERATE_EMAIL",
            "next_best_action_reason": l.next_best_action_reason or "Ready for outreach",
            "why_this_lead": l.why_this_lead or ""
        }
        for l in leads if l.score and l.score.total_score >= 70 and getattr(l, "lead_type", "REAL") == "REAL"
    ]
    high_fit_leads.sort(key=lambda x: x["score"], reverse=True)

    # 2. Buying Signals
    active_signals = [
        {
            "id": l.id,
            "company_name": l.company_name,
            "signal": l.intent_signal,
            "source": l.intent_source,
            "buying_intent": l.buying_intent,
            "service": l.opportunity.recommended_service if l.opportunity else "Custom Software",
            "timestamp": l.intent_timestamp.isoformat() if l.intent_timestamp else None
        }
        for l in leads if l.intent_signal and l.buying_intent in ["HIGH", "MEDIUM"]
    ]

    # 3. Drafts Waiting for Approval
    drafts_waiting = []
    for l in leads:
        for d in l.outreach_drafts:
            if not d.is_approved and d.approval_status == "PENDING":
                drafts_waiting.append({
                    "draft_id": d.id,
                    "lead_id": l.id,
                    "company_name": l.company_name,
                    "service": l.opportunity.recommended_service if l.opportunity else "Web Development",
                    "subject": d.cold_email_subject,
                    "preview": d.cold_email_body[:120] + "..." if len(d.cold_email_body) > 120 else d.cold_email_body,
                    "has_whatsapp": bool(d.whatsapp_message_body),
                    "created_at": d.created_at.isoformat() if d.created_at else None
                })

    # 4. Contacts Requiring Verification
    contacts_to_verify = [
        {
            "id": l.id,
            "company_name": l.company_name,
            "phone": l.phone,
            "whatsapp_status": l.whatsapp_status,
            "quality_firewall_status": l.quality_firewall_status,
            "quality_firewall_flags": l.quality_firewall_flags
        }
        for l in leads if l.quality_firewall_status in ["WARNING", "REVIEW_REQUIRED"]
    ]

    # 5. Next Best Action aggregated counts
    nba_counts = {}
    for l in leads:
        nba = l.next_best_action or "GENERATE_EMAIL"
        nba_counts[nba] = nba_counts.get(nba, 0) + 1

    return {
        "summary": {
            "actionable_leads_count": len(high_fit_leads),
            "buying_signals_count": len(active_signals),
            "pending_approvals_count": len(drafts_waiting),
            "verifications_needed_count": len(contacts_to_verify),
            "total_active_pipeline": len(leads)
        },
        "next_best_action_breakdown": nba_counts,
        "high_fit_leads": high_fit_leads[:8],
        "active_buying_signals": active_signals[:6],
        "drafts_waiting_approval": drafts_waiting[:6],
        "contacts_to_verify": contacts_to_verify[:6]
    }

@router.post("/ask")
async def natural_language_prospect_parser(
    req: NaturalLanguageAskRequest,
    auth: dict = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Feature 6: Converts Natural Language queries into structured search criteria.
    Examples:
    - 'Find dental clinics in Chandigarh without website' -> {category: 'Dental', city: 'Chandigarh', website_status: 'NO_WEBSITE'}
    - 'Find US SaaS companies with remote hiring' -> {category: 'SaaS', country: 'USA', buying_intent: 'HIGH'}
    """
    text = req.query.lower().strip()
    
    # Defaults
    category = "All"
    city = "All"
    country = "India"
    website_status = "All"
    buying_intent = "All"
    whatsapp_signal = "All"
    limit = 25

    # City matching
    for c in ["chandigarh", "mohali", "panchkula", "ludhiana", "delhi", "gurgaon", "noida", "jaipur", "ahmedabad", "mumbai", "pune", "bengaluru", "hyderabad", "chennai", "kolkata", "kochi", "indore", "lucknow", "austin", "chicago", "london", "dubai"]:
        if c in text:
            city = c.title()
            if c in ["austin", "chicago"]:
                country = "USA"
            elif c == "london":
                country = "UK"
            elif c == "dubai":
                country = "UAE"
            break

    # Country matching
    for ctry, cname in [("us", "USA"), ("usa", "USA"), ("united states", "USA"), ("uk", "UK"), ("united kingdom", "UK"), ("uae", "UAE"), ("dubai", "UAE"), ("canada", "Canada"), ("australia", "Australia"), ("singapore", "Singapore"), ("germany", "Germany")]:
        if f" {ctry} " in f" {text} ":
            country = cname
            break

    # Category matching
    for cat in ["dental", "healthcare", "restaurant", "hospitality", "real estate", "manufacturing", "logistics", "automotive", "retail", "legal", "finance", "saas", "software"]:
        if cat in text:
            category = "Dental" if cat == "dental" else ("Restaurants" if cat == "restaurant" else cat.title())
            break

    # Website status matching
    if "no website" in text or "without website" in text or "no official website" in text:
        website_status = "NO_WEBSITE"
    elif "weak website" in text or "outdated website" in text or "redesign" in text:
        website_status = "WEAK_WEBSITE"

    # WhatsApp matching
    if "whatsapp" in text:
        whatsapp_signal = "BUSINESS_PUBLICLY_ADVERTISES_WHATSAPP"

    # Intent matching
    if "hiring" in text or "remote" in text or "rfp" in text or "developer" in text or "high intent" in text:
        buying_intent = "HIGH"

    # Extract limit if number exists
    num_match = re.search(r"\b(\d+)\b", text)
    if num_match:
        lim_val = int(num_match.group(1))
        if lim_val in [10, 25, 50, 100, 250]:
            limit = lim_val

    # Execute search with parsed criteria
    results = discovery_service.generate_candidate_leads(
        category=category if category != "All" else None,
        city=city if city != "All" else None,
        country=country,
        website_status=website_status if website_status != "All" else None,
        whatsapp_signal=whatsapp_signal if whatsapp_signal != "All" else None,
        buying_intent=buying_intent if buying_intent != "All" else None,
        limit=limit
    )

    return {
        "status": "success",
        "interpreted_filter": {
            "query_raw": req.query,
            "category": category,
            "city": city,
            "country": country,
            "website_status": website_status,
            "whatsapp_signal": whatsapp_signal,
            "buying_intent": buying_intent,
            "limit": limit
        },
        "total_results": len(results),
        "businesses": results
    }

@router.get("/lookalike/{lead_id}")
async def get_lookalike_prospects(
    lead_id: str,
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Feature 7: Finds similar lookalike companies based on category, company size, tech stack, and service opportunity.
    """
    result = await db.execute(select(Lead).options(selectinload(Lead.opportunity)).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Target lead not found")

    target_service = lead.opportunity.recommended_service if lead.opportunity else None
    
    # Generate lookalike prospects
    lookalikes = discovery_service.generate_candidate_leads(
        category=lead.category or lead.industry,
        country=lead.country or "India",
        target_service=target_service,
        limit=10
    )

    # Filter out current company
    lookalikes = [c for c in lookalikes if c["company_name"] != lead.company_name]

    return {
        "status": "success",
        "seed_lead": {
            "id": lead.id,
            "company_name": lead.company_name,
            "category": lead.category or lead.industry,
            "city": lead.city,
            "country": lead.country,
            "recommended_service": target_service
        },
        "similarity_criteria": {
            "category_match": lead.category or lead.industry,
            "market": lead.country,
            "service_alignment": target_service
        },
        "lookalike_candidates": lookalikes
    }

@router.post("/feedback")
async def record_human_feedback(
    req: FeedbackRequest,
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Feature 18: Records human-in-the-loop feedback and adapts lead score & qualification transparently.
    """
    result = await db.execute(select(Lead).options(selectinload(Lead.score)).where(Lead.id == req.lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    adj = 0.0
    if req.feedback_type == "GOOD_LEAD":
        adj = 5.0
    elif req.feedback_type == "BAD_LEAD":
        adj = -15.0
    elif req.feedback_type == "WRONG_SERVICE":
        adj = -5.0
    elif req.feedback_type == "WRONG_CONTACT":
        adj = -5.0

    feedback = LeadFeedback(
        lead_id=lead.id,
        feedback_type=req.feedback_type,
        adjustment_applied=adj,
        feedback_note=req.note
    )
    db.add(feedback)

    lead.feedback_score_adjustment = (lead.feedback_score_adjustment or 0.0) + adj
    lead.is_feedback_influenced = True
    
    if lead.score:
        lead.score.total_score = max(0, min(100, int(lead.score.total_score + adj)))

    # Log activity
    act = ActivityLog(
        lead_id=lead.id,
        agent_name="User Feedback Loop",
        action=f"Human Feedback Recorded: {req.feedback_type} (Score Adjusted by {adj:+0.1f})",
        details={"feedback_type": req.feedback_type, "note": req.note, "adjustment": adj}
    )
    db.add(act)
    await db.commit()

    return {
        "status": "success",
        "feedback_type": req.feedback_type,
        "new_score": lead.score.total_score if lead.score else None,
        "is_feedback_influenced": True
    }

@router.get("/saved-searches")
async def list_saved_searches(
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
) -> List[Dict[str, Any]]:
    """
    Feature 19: Returns saved searches and monitors.
    """
    result = await db.execute(select(SavedSearch).order_by(desc(SavedSearch.created_at)))
    searches = result.scalars().all()
    return [
        {
            "id": s.id,
            "title": s.title,
            "category": s.category,
            "city": s.city,
            "country": s.country,
            "website_status": s.website_status,
            "whatsapp_signal": s.whatsapp_signal,
            "buying_intent": s.buying_intent,
            "keywords": s.keywords,
            "auto_monitor": s.auto_monitor,
            "new_leads_detected_count": s.new_leads_detected_count,
            "last_checked_at": s.last_checked_at.isoformat() if s.last_checked_at else None,
            "created_at": s.created_at.isoformat() if s.created_at else None
        }
        for s in searches
    ]

@router.post("/saved-searches")
async def create_saved_search(
    req: SavedSearchCreateRequest,
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Feature 19: Saves search filter criteria for continuous buying signal monitoring.
    """
    saved = SavedSearch(
        title=req.title,
        category=req.category,
        city=req.city,
        country=req.country or "India",
        website_status=req.website_status or "All",
        whatsapp_signal=req.whatsapp_signal or "All",
        buying_intent=req.buying_intent or "All",
        keywords=req.keywords,
        auto_monitor=req.auto_monitor
    )
    db.add(saved)
    await db.commit()
    await db.refresh(saved)

    return {
        "status": "success",
        "id": saved.id,
        "title": saved.title,
        "auto_monitor": saved.auto_monitor
    }
