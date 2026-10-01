import logging
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Lead, LeadStatusEnum
from app.services.orchestrator import orchestrator
from app.services.discovery_service import discovery_service

logger = logging.getLogger(__name__)

async def seed_database_if_empty(db: AsyncSession):
    """
    Seeds high-fidelity Indian & Global prospect targets and runs them through the full intelligence pipeline.
    """
    result = await db.execute(select(Lead))
    existing = result.scalars().first()
    if existing:
        logger.info("Database already contains leads, skipping automatic seed initialization.")
        return

    logger.info("Seeding initial high-fidelity Terminal Labs lead intelligence dataset across 15 services...")
    companies = discovery_service.get_comprehensive_prospect_database()
    now = datetime.now(timezone.utc)

    for comp in companies:
        lead = Lead(
            company_name=comp["company_name"],
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
            researched_at=now,
            last_verified_at=now,
            status=LeadStatusEnum.QUALIFIED,
            tags=comp.get("tags", []),
            notes=comp.get("notes", "")
        )
        db.add(lead)
        await db.flush()

        # Run through end-to-end intelligence pipeline
        await orchestrator.run_full_pipeline_for_lead(db, lead.id)

    await db.commit()
    logger.info(f"Successfully seeded {len(companies)} high-intent leads and ran end-to-end multi-agent qualification.")

SAMPLE_COMPANIES = discovery_service.get_comprehensive_prospect_database()
