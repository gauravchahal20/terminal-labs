import csv
import io
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
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
)
from app.schemas.lead import (
    LeadCreate,
    LeadUpdate,
    LeadDetailResponse,
    LeadListResponse,
)
from app.services.orchestrator import orchestrator
from app.services.discovery_service import discovery_service

router = APIRouter(prefix="/leads", tags=["Leads"])

class OutreachApprovalRequest(BaseModel):
    approval_status: str  # "APPROVED", "REJECTED", "EDITED"
    cold_email_subject: Optional[str] = None
    cold_email_body: Optional[str] = None
    linkedin_inmail_body: Optional[str] = None
    whatsapp_message_body: Optional[str] = None

@router.get("", response_model=LeadListResponse)
async def list_leads(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    country: Optional[str] = None,
    city: Optional[str] = None,
    industry: Optional[str] = None,
    status: Optional[str] = None,
    tier: Optional[str] = None,
    service: Optional[str] = None,
    website_status: Optional[str] = None,
    buying_intent: Optional[str] = None,
    lead_type: Optional[str] = None,
    has_phone: Optional[bool] = None,
    sort_by: Optional[str] = "score", # score, created_at, name
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
):
    stmt = select(Lead).options(
        selectinload(Lead.research),
        selectinload(Lead.decision_makers),
        selectinload(Lead.score),
        selectinload(Lead.opportunity),
        selectinload(Lead.outreach_drafts),
        selectinload(Lead.activities)
    )

    if search:
        search_fmt = f"%{search.strip()}%"
        stmt = stmt.where(
            or_(
                Lead.company_name.ilike(search_fmt),
                Lead.domain.ilike(search_fmt),
                Lead.city.ilike(search_fmt),
                Lead.country.ilike(search_fmt),
                Lead.industry.ilike(search_fmt),
                Lead.intent_signal.ilike(search_fmt)
            )
        )

    if country and country.lower() != "all" and country.lower() != "global":
        stmt = stmt.where(Lead.country.ilike(f"%{country}%"))

    if city and city.lower() != "all":
        stmt = stmt.where(Lead.city.ilike(f"%{city}%"))

    if industry and industry.lower() != "all":
        stmt = stmt.where(Lead.industry.ilike(f"%{industry}%"))

    if status and status.lower() != "all":
        stmt = stmt.where(Lead.status == status)

    if website_status and website_status.lower() != "all":
        stmt = stmt.where(Lead.website_status == website_status)

    if buying_intent and buying_intent.lower() != "all":
        stmt = stmt.where(Lead.buying_intent == buying_intent)

    if lead_type and lead_type.lower() != "all":
        stmt = stmt.where(Lead.lead_type == lead_type)

    if has_phone:
        stmt = stmt.where(Lead.phone.isnot(None), Lead.phone != "")

    # Count total
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_res = await db.execute(count_stmt)
    total = total_res.scalar_one()

    # Pagination & Ordering
    if sort_by == "created_at":
        stmt = stmt.order_by(desc(Lead.created_at))
    elif sort_by == "name":
        stmt = stmt.order_by(Lead.company_name)
    else:
        stmt = stmt.order_by(desc(Lead.created_at))

    offset = (page - 1) * limit
    stmt = stmt.offset(offset).limit(limit)

    results = await db.execute(stmt)
    leads = results.scalars().all()

    # Post-filter / sort if needed
    if service and service.lower() != "all":
        leads = [l for l in leads if l.opportunity and l.opportunity.recommended_service.lower() == service.lower()]

    if tier and tier.lower() != "all":
        leads = [l for l in leads if l.score and l.score.tier.lower() == tier.lower()]

    if sort_by == "score":
        leads = sorted(leads, key=lambda l: (l.score.total_score if l.score else 0), reverse=True)

    return LeadListResponse(
        total=total,
        page=page,
        limit=limit,
        leads=leads
    )

@router.get("/export/csv")
async def export_leads_csv(
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
):
    """
    Exports all qualified leads, data provenance, 7-factor scores, and contact intelligence as a clean CSV.
    """
    stmt = select(Lead).options(
        selectinload(Lead.research),
        selectinload(Lead.decision_makers),
        selectinload(Lead.score),
        selectinload(Lead.opportunity),
        selectinload(Lead.outreach_drafts)
    ).order_by(desc(Lead.created_at))

    results = await db.execute(stmt)
    leads = results.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Lead Type",
        "Company Name",
        "Domain",
        "Website URL",
        "Website Status",
        "Country",
        "State",
        "City",
        "Industry",
        "Company Size",
        "Corporate Phone",
        "Phone Status",
        "Buying Intent",
        "Intent Signal",
        "Intent Source",
        "Stage",
        "Total Score (100)",
        "Score Tier",
        "Business Fit (25)",
        "Service Fit (25)",
        "Opportunity Signal (20)",
        "Buying Intent (15)",
        "Business Activity (5)",
        "Digital Opportunity (5)",
        "Contactability (5)",
        "Primary Decision Maker",
        "Title & Role",
        "Direct Phone",
        "Decision Maker Phone Status",
        "Direct Email",
        "Decision Maker Email Status",
        "Email Confidence",
        "Opportunity Type",
        "Recommended Terminal Labs Service",
        "Secondary Services",
        "Estimated Deal Value",
        "Estimated Monthly ROI",
        "Conversion Uplift",
        "Implementation Timeline",
        "Identified Bottleneck",
        "Observed Evidence",
        "AI Inferences",
        "Cold Email Subject",
        "WhatsApp Outreach Script",
        "LinkedIn InMail Script",
        "Outreach Approval Status",
        "Data Provenance Sources"
    ])

    for l in leads:
        primary_dm = l.decision_makers[0] if l.decision_makers else None
        draft = l.outreach_drafts[0] if l.outreach_drafts else None
        opp = l.opportunity
        score = l.score

        writer.writerow([
            l.lead_type or "REAL",
            l.company_name,
            l.domain,
            l.website_url,
            l.website_status or "WEBSITE_PLUS_AUTOMATION",
            l.country,
            l.state or "",
            l.city,
            l.industry,
            l.company_size,
            l.phone or "",
            l.phone_status or "PUBLIC",
            l.buying_intent or "HIGH",
            l.intent_signal or "",
            l.intent_source or "",
            l.status,
            score.total_score if score else "",
            score.tier if score else "",
            score.business_fit if score else "",
            score.service_fit if score else "",
            getattr(score, 'opportunity_signal', getattr(score, 'pain_signal', '')) if score else "",
            getattr(score, 'buying_intent', getattr(score, 'buying_signal', '')) if score else "",
            getattr(score, 'business_activity', getattr(score, 'company_fit', '')) if score else "",
            score.digital_opportunity if score else "",
            score.contactability if score else "",
            primary_dm.full_name if primary_dm else "",
            primary_dm.title if primary_dm else "",
            primary_dm.phone if primary_dm else "",
            getattr(primary_dm, 'phone_status', 'PUBLIC') if primary_dm else "",
            primary_dm.email if primary_dm else "",
            getattr(primary_dm, 'email_status', 'VERIFIED') if primary_dm else "",
            f"{int(primary_dm.email_confidence * 100)}%" if primary_dm else "",
            getattr(opp, 'opportunity_type', 'NEW WEBSITE') if opp else "",
            opp.recommended_service if opp else "",
            ", ".join(opp.secondary_services) if opp and opp.secondary_services else "",
            opp.estimated_deal_size if opp else "",
            getattr(opp, 'estimated_monthly_roi', 'Potential ROI: requires discovery call') if opp else "",
            getattr(opp, 'conversion_uplift', '') if opp else "",
            getattr(opp, 'implementation_timeline', '') if opp else "",
            opp.primary_problem if opp else "",
            "; ".join(getattr(opp, 'observed_evidence', [])) if opp and hasattr(opp, 'observed_evidence') and opp.observed_evidence else "",
            "; ".join(getattr(opp, 'ai_inferences', [])) if opp and hasattr(opp, 'ai_inferences') and opp.ai_inferences else "",
            draft.cold_email_subject if draft else "",
            getattr(draft, 'whatsapp_message_body', '') if draft else "",
            draft.linkedin_inmail_body if draft else "",
            getattr(draft, 'approval_status', 'PENDING') if draft else "PENDING",
            ", ".join(l.source_names or ["Public Web Registry"])
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=terminal_labs_phase2_leads.csv"}
    )

@router.get("/{lead_id}", response_model=LeadDetailResponse)
async def get_lead_detail(
    lead_id: str,
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
):
    stmt = select(Lead).options(
        selectinload(Lead.research),
        selectinload(Lead.decision_makers),
        selectinload(Lead.score),
        selectinload(Lead.opportunity),
        selectinload(Lead.outreach_drafts),
        selectinload(Lead.activities)
    ).where(Lead.id == lead_id)

    result = await db.execute(stmt)
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@router.post("/{lead_id}/outreach/approval")
async def update_outreach_approval(
    lead_id: str,
    payload: OutreachApprovalRequest,
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
):
    """
    Human Approval Gate: Approve, Edit, or Reject generated outreach.
    """
    stmt = select(OutreachDraft).where(OutreachDraft.lead_id == lead_id)
    result = await db.execute(stmt)
    draft = result.scalar_one_or_none()
    if not draft:
        raise HTTPException(status_code=404, detail="Outreach draft not found for lead")

    draft.approval_status = payload.approval_status.upper()
    draft.is_approved = (payload.approval_status.upper() == "APPROVED")

    if payload.cold_email_subject:
        draft.cold_email_subject = payload.cold_email_subject
    if payload.cold_email_body:
        draft.cold_email_body = payload.cold_email_body
    if payload.linkedin_inmail_body:
        draft.linkedin_inmail_body = payload.linkedin_inmail_body
    if payload.whatsapp_message_body:
        draft.whatsapp_message_body = payload.whatsapp_message_body

    act = ActivityLog(
        lead_id=lead_id,
        agent_name="Human Approval Gate",
        action=f"Outreach Draft Status Changed: {draft.approval_status}",
        details={"status": draft.approval_status, "is_approved": draft.is_approved}
    )
    db.add(act)
    await db.commit()

    return {"status": "success", "approval_status": draft.approval_status, "is_approved": draft.is_approved}

@router.post("", response_model=LeadDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_lead(
    payload: LeadCreate,
    run_enrichment: bool = Query(True),
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
):
    # Duplicate check
    existing = await discovery_service.check_duplicate(db, payload.domain, payload.company_name)
    if existing:
        raise HTTPException(status_code=409, detail=f"Lead with domain {payload.domain} already exists.")

    lead = Lead(
        company_name=payload.company_name,
        domain=discovery_service.normalize_domain(payload.domain),
        website_url=payload.website_url,
        country=payload.country or "Global",
        city=payload.city or "",
        industry=payload.industry or "Technology",
        company_size=payload.company_size or "11-50",
        linkedin_url=payload.linkedin_url,
        twitter_url=payload.twitter_url,
        status="New",
        tags=payload.tags or [],
        notes=payload.notes or ""
    )
    db.add(lead)
    await db.commit()
    await db.refresh(lead)

    if run_enrichment:
        await orchestrator.run_full_pipeline_for_lead(db, lead.id)

    return await get_lead_detail(lead.id, db, auth)

@router.put("/{lead_id}", response_model=LeadDetailResponse)
async def update_lead(
    lead_id: str,
    payload: LeadUpdate,
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
):
    stmt = select(Lead).where(Lead.id == lead_id)
    result = await db.execute(stmt)
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(lead, key, value)

    await db.commit()
    return await get_lead_detail(lead_id, db, auth)

@router.delete("/{lead_id}")
async def delete_lead(
    lead_id: str,
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
):
    stmt = select(Lead).where(Lead.id == lead_id)
    result = await db.execute(stmt)
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    await db.delete(lead)
    await db.commit()
    return {"status": "deleted", "id": lead_id}

@router.post("/{lead_id}/research")
async def trigger_research(
    lead_id: str,
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
):
    res = await orchestrator.run_research_agent(db, lead_id)
    return {"status": "success", "agent": "Research Agent", "data": res}

@router.post("/{lead_id}/qualify")
async def trigger_qualification(
    lead_id: str,
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
):
    res = await orchestrator.run_qualification_agent(db, lead_id)
    return {"status": "success", "agent": "Qualification Agent", "data": res}

@router.post("/{lead_id}/personalize")
async def trigger_personalization(
    lead_id: str,
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
):
    res = await orchestrator.run_personalization_agent(db, lead_id)
    return {"status": "success", "agent": "Personalization Agent", "data": res}

@router.post("/{lead_id}/run-pipeline", response_model=LeadDetailResponse)
async def run_full_lead_pipeline(
    lead_id: str,
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
):
    await orchestrator.run_full_pipeline_for_lead(db, lead_id)
    return await get_lead_detail(lead_id, db, auth)
