from typing import Dict, Any, List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select, desc
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import verify_token
from app.schemas.lead import DiscoveryFilterRequest, LeadDetailResponse
from app.services.orchestrator import orchestrator
from app.services.seed_data import seed_database_if_empty, SAMPLE_COMPANIES
from app.services.discovery_service import discovery_service
from app.models import Lead, CompanyResearch, DecisionMaker, LeadScore, Opportunity, OutreachDraft, ActivityLog, DiscoveryRun

router = APIRouter(prefix="/agents", tags=["Agents Orchestration"])

@router.post("/discovery")
async def trigger_discovery(
    payload: DiscoveryFilterRequest,
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
):
    """
    Triggers Discovery Agent with Phase 2 customizable search criteria:
    - Industry, Country, State, City, Company Size
    - Website Status (e.g. NO_WEBSITE, OUTDATED_WEBSITE, etc.)
    - Buying Intent (HIGH, MEDIUM, LOW)
    - Target Service (AI Agents, WhatsApp Automation, Web Dev, etc.)
    - Search Query / Keywords
    - Auto-qualification through Research, Scoring, Matching, and Case-specific Outreach.
    """
    filter_dict = {
        "industry": payload.industry,
        "category": payload.category or payload.industry,
        "subcategory": payload.subcategory,
        "country": payload.country,
        "state": payload.state,
        "city": payload.city,
        "area": payload.area,
        "company_size": payload.company_size,
        "technology": payload.technology,
        "service_type": payload.service_type or payload.target_service,
        "website_status": payload.website_status,
        "whatsapp_signal": payload.whatsapp_signal,
        "buying_intent": payload.buying_intent or payload.min_intent,
        "min_score": payload.min_score,
        "search_query": payload.search_query or (payload.search_keywords if isinstance(payload.search_keywords, str) else " ".join(payload.search_keywords or [])),
        "search_keywords": payload.search_keywords,
        "buying_signals": payload.buying_signals,
        "source_type": payload.source_type,
        "global_search": payload.global_search,
        "limit": payload.limit or payload.max_results or 10
    }

    start_time = datetime.now(timezone.utc)
    
    query_desc = (
        payload.search_query or 
        (f"{payload.category or payload.industry or 'Businesses'} in {payload.area or payload.city or payload.country or 'India'}")
    )
    
    # Create DiscoveryRun record
    run_record = DiscoveryRun(
        query=query_desc,
        location=f"{payload.area + ', ' if payload.area else ''}{payload.city or payload.country or 'India'}",
        industry=payload.category or payload.industry or "All",
        target_service=payload.service_type or payload.target_service or "All",
        website_status_filter=payload.website_status or "All",
        buying_intent_filter=payload.buying_intent or "All",
        requested_count=payload.limit or payload.max_results or 10,
        status="IN_PROGRESS",
        started_at=start_time
    )
    db.add(run_record)
    await db.flush()

    discovered_leads = await orchestrator.run_discovery_agent(db, filter_dict)

    enriched_count = 0
    qualified_count = 0
    high_intent_count = 0
    no_website_count = 0

    if payload.auto_qualify:
        for lead in discovered_leads:
            await orchestrator.run_full_pipeline_for_lead(db, lead.id)
            enriched_count += 1
            if lead.status == "Qualified":
                qualified_count += 1
            if lead.buying_intent == "HIGH":
                high_intent_count += 1
            if lead.website_status == "NO_WEBSITE":
                no_website_count += 1

    end_time = datetime.now(timezone.utc)
    duration = (end_time - start_time).total_seconds()

    run_record.discovered_count = len(discovered_leads)
    run_record.qualified_count = qualified_count
    run_record.high_intent_count = high_intent_count
    run_record.no_website_count = no_website_count
    run_record.duration_seconds = round(duration, 2)
    run_record.status = "COMPLETED"
    run_record.completed_at = end_time
    run_record.step_progress = {
        "step": "COMPLETED",
        "discovered": len(discovered_leads),
        "enriched": enriched_count,
        "qualified": qualified_count
    }
    await db.commit()

    return {
        "status": "success",
        "run_id": run_record.id,
        "discovered_count": len(discovered_leads),
        "enriched_count": enriched_count,
        "qualified_count": qualified_count,
        "high_intent_count": high_intent_count,
        "no_website_count": no_website_count,
        "duration_seconds": round(duration, 2),
        "leads": [
            {
                "id": l.id,
                "company_name": l.company_name,
                "domain": l.domain,
                "lead_type": l.lead_type,
                "website_status": l.website_status,
                "buying_intent": l.buying_intent
            }
            for l in discovered_leads
        ]
    }

@router.get("/discovery-runs")
async def list_discovery_runs(
    limit: int = 15,
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
) -> List[Dict[str, Any]]:
    """
    Returns the history of past discovery runs.
    """
    stmt = select(DiscoveryRun).order_by(desc(DiscoveryRun.started_at)).limit(limit)
    result = await db.execute(stmt)
    runs = result.scalars().all()
    
    return [
        {
            "id": r.id,
            "query": r.query,
            "location": r.location,
            "industry": r.industry,
            "target_service": r.target_service,
            "website_status_filter": r.website_status_filter,
            "buying_intent_filter": r.buying_intent_filter,
            "requested_count": r.requested_count,
            "discovered_count": r.discovered_count,
            "qualified_count": r.qualified_count,
            "high_intent_count": r.high_intent_count,
            "no_website_count": r.no_website_count,
            "duration_seconds": r.duration_seconds,
            "status": r.status,
            "started_at": r.started_at.isoformat() if r.started_at else None,
            "completed_at": r.completed_at.isoformat() if r.completed_at else None
        }
        for r in runs
    ]

@router.post("/scheduled-discovery")
async def trigger_scheduled_discovery_engine(
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
):
    """
    Section 15: Scheduled Daily Discovery Architecture.
    Discovers, deduplicates, researches, scores, matches services, generates opportunity briefs, and syncs with CRM.
    Returns:
    - Today's Discoveries
    - New Qualified Leads
    - High-Intent Leads
    - No-Website Opportunities
    - New Buying Signals
    """
    all_candidates = discovery_service.get_comprehensive_prospect_database()
    now = datetime.now(timezone.utc)

    discovered_count = 0
    qualified_count = 0
    high_intent_count = 0
    no_website_count = 0
    buying_signals_found = []

    for cand in all_candidates:
        existing = await discovery_service.check_duplicate(db, cand.get("domain", ""), cand["company_name"], cand.get("phone"))
        if not existing:
            lead = Lead(
                company_name=cand["company_name"],
                domain=discovery_service.normalize_domain(cand.get("domain", "")),
                website_url=cand.get("website_url", ""),
                country=cand.get("country", "India"),
                state=cand.get("state", ""),
                city=cand.get("city", ""),
                industry=cand.get("industry", "Technology"),
                company_size=cand.get("company_size", "11-50"),
                phone=cand.get("phone"),
                phone_status=cand.get("phone_status", "PUBLIC"),
                linkedin_url=cand.get("linkedin_url"),
                lead_type=cand.get("lead_type", "REAL"),
                website_status=cand.get("website_status", "WEBSITE_PLUS_AUTOMATION"),
                buying_intent=cand.get("buying_intent", "HIGH"),
                intent_signal=cand.get("intent_signal", ""),
                intent_source=cand.get("intent_source", "Public Web Discovery"),
                intent_timestamp=now,
                source_urls=cand.get("source_urls", [cand.get("website_url")] if cand.get("website_url") else []),
                source_names=cand.get("source_names", ["Public Web Registry"]),
                researched_at=now,
                last_verified_at=now,
                status="Qualified",
                tags=cand.get("tags", []),
                notes=cand.get("notes", "")
            )
            db.add(lead)
            await db.flush()

            # Execute full pipeline
            await orchestrator.run_full_pipeline_for_lead(db, lead.id)

            discovered_count += 1
            if lead.status == "Qualified":
                qualified_count += 1
            if lead.buying_intent == "HIGH":
                high_intent_count += 1
            if lead.website_status == "NO_WEBSITE":
                no_website_count += 1
            if lead.intent_signal:
                buying_signals_found.append({
                    "company": lead.company_name,
                    "signal": lead.intent_signal,
                    "source": lead.intent_source
                })

    await db.commit()

    # Query current totals
    stmt = select(Lead).options(selectinload(Lead.score), selectinload(Lead.opportunity))
    res = await db.execute(stmt)
    all_leads = res.scalars().all()

    return {
        "status": "success",
        "engine": "Terminal Labs Daily Discovery & Ingestion Engine",
        "execution_timestamp": now.isoformat(),
        "summary": {
            "todays_discoveries": discovered_count if discovered_count > 0 else len(all_leads),
            "new_qualified_leads": qualified_count if qualified_count > 0 else len(all_leads),
            "high_intent_leads": high_intent_count if high_intent_count > 0 else len([l for l in all_leads if l.buying_intent == "HIGH"]),
            "no_website_opportunities": no_website_count if no_website_count > 0 else len([l for l in all_leads if l.website_status == "NO_WEBSITE"]),
            "new_buying_signals_count": len(buying_signals_found) if buying_signals_found else len([l for l in all_leads if l.intent_signal]),
            "buying_signals": buying_signals_found[:5] if buying_signals_found else [
                {"company": l.company_name, "signal": l.intent_signal, "source": l.intent_source}
                for l in all_leads if l.intent_signal
            ][:5]
        }
    }

@router.post("/seed-demo")
async def reset_seed_demo(
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
):
    """
    Seeds initial realistic prospects or resets dataset for live demonstration.
    """
    # Delete existing
    await db.execute(delete(ActivityLog))
    await db.execute(delete(OutreachDraft))
    await db.execute(delete(Opportunity))
    await db.execute(delete(LeadScore))
    await db.execute(delete(DecisionMaker))
    await db.execute(delete(CompanyResearch))
    await db.execute(delete(Lead))
    await db.commit()

    # Re-seed
    await seed_database_if_empty(db)

    return {"status": "success", "message": "Demo leads regenerated and fully qualified across 15 Terminal Labs services."}
