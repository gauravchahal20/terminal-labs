import asyncio
import logging
from datetime import datetime, timezone
from sqlalchemy import delete
from app.core.database import AsyncSessionLocal, init_db
from app.models import (
    Lead, CompanyResearch, DecisionMaker, LeadScore, Opportunity, OutreachDraft, ActivityLog, LeadStatusEnum,
    LeadFeedback, SavedSearch, ICPProfile
)
from app.services.seed_data import SAMPLE_COMPANIES
from app.services.orchestrator import orchestrator
from app.services.discovery_service import discovery_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def reseed():
    logger.info("Initializing database schema with clean recreate...")
    await init_db(drop_all=True)

    async with AsyncSessionLocal() as db:
        logger.info("Purging existing records...")
        await db.execute(delete(LeadFeedback))
        await db.execute(delete(SavedSearch))
        await db.execute(delete(ICPProfile))
        await db.execute(delete(ActivityLog))
        await db.execute(delete(OutreachDraft))
        await db.execute(delete(Opportunity))
        await db.execute(delete(LeadScore))
        await db.execute(delete(DecisionMaker))
        await db.execute(delete(CompanyResearch))
        await db.execute(delete(Lead))
        await db.commit()

        companies = discovery_service.get_comprehensive_prospect_database()
        logger.info(f"Seeding {len(companies)} Phase 2 prospect targets (including No-Website & High Intent)...")
        now = datetime.now(timezone.utc)

        for comp in companies:
            lead = Lead(
                company_name=comp["company_name"],
                business_name=comp.get("business_name") or comp["company_name"],
                category=comp.get("category", comp.get("industry", "Technology")),
                subcategory=comp.get("subcategory"),
                area=comp.get("area"),
                address=comp.get("address"),
                postal_code=comp.get("postal_code"),
                domain=discovery_service.normalize_domain(comp.get("domain", "")),
                website_url=comp.get("website_url", ""),
                country=comp.get("country", "India"),
                state=comp.get("state", ""),
                city=comp.get("city", ""),
                industry=comp.get("industry", "Technology"),
                company_size=comp.get("company_size", "11-50"),
                phone=comp.get("phone"),
                phone_status=comp.get("phone_status", "PUBLIC"),
                phone_source_url=comp.get("phone_source_url"),
                phone_source_name=comp.get("phone_source_name"),
                phone_observed_at=now,
                phone_verification_method=comp.get("phone_verification_method", "Public Directory Inspection"),
                whatsapp_status=comp.get("whatsapp_status", "WHATSAPP_UNKNOWN"),
                whatsapp_verification_method=comp.get("whatsapp_verification_method", "Unverified link only"),
                linkedin_url=comp.get("linkedin_url"),
                lead_type=comp.get("lead_type", "REAL"),
                website_status=comp.get("website_status", "WEBSITE_PLUS_AUTOMATION"),
                buying_intent=comp.get("buying_intent", "HIGH"),
                intent_signal=comp.get("intent_signal", ""),
                intent_source=comp.get("intent_source", "Public Web Discovery"),
                intent_timestamp=now,
                source_urls=comp.get("source_urls", [comp.get("website_url")] if comp.get("website_url") else []),
                source_names=comp.get("source_names", ["Public Web Registry"]),
                source_type=comp.get("source_type", "PUBLIC_BUSINESS_DIRECTORY"),
                usage_permission=comp.get("usage_permission", "PUBLIC_METADATA_INDEXING"),
                rating=comp.get("rating"),
                review_count=comp.get("review_count"),
                years_in_business=comp.get("years_in_business"),
                business_description=comp.get("business_description"),
                hours=comp.get("hours"),
                social_profiles=comp.get("social_profiles", {}),
                global_fit_score=comp.get("global_fit_score", 0),
                outsourcing_fit=comp.get("outsourcing_fit", "LOW"),
                researched_at=now,
                last_verified_at=now,
                status=LeadStatusEnum.QUALIFIED,
                tags=comp.get("tags", []),
                notes=comp.get("notes", "")
            )
            db.add(lead)
            await db.flush()

            logger.info(f"Running pipeline for {lead.company_name} ({lead.city}, {lead.country}) [Status: {lead.website_status}, Intent: {lead.buying_intent}]...")
            await orchestrator.run_full_pipeline_for_lead(db, lead.id)

        await db.commit()
        logger.info("Successfully re-seeded all 20 leads with full Phase 2 intelligence, 7-factor explainable scoring, and case-specific outreach!")

if __name__ == "__main__":
    asyncio.run(reseed())
