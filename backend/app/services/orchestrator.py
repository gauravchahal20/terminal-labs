import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import (
    Lead,
    CompanyResearch,
    DecisionMaker,
    LeadScore,
    Opportunity,
    OutreachDraft,
    ActivityLog,
    LeadStatusEnum,
)
from app.services.discovery_service import discovery_service
from app.services.website_intelligence import website_intelligence_service
from app.services.decision_maker_service import decision_maker_service
from app.services.scoring_engine import scoring_engine
from app.services.opportunity_matcher import opportunity_matcher
from app.services.outreach_generator import outreach_generator
from app.services.gemini_client import gemini_client

logger = logging.getLogger(__name__)

class AgentOrchestrator:
    """
    Autonomous Multi-Agent Lead Intelligence Orchestrator.
    Controls and coordinates:
    1. Discovery Agent (Candidate discovery, No-website detection, Buying-intent detection, Provenance)
    2. Research Agent (Website inspection, Decision-maker resolution with verification status)
    3. Qualification Agent (7-Factor explainable scoring & 15 Service Opportunity mapping)
    4. Personalization Agent (Case-specific cold email, LinkedIn, WhatsApp with approval gate)
    """

    async def run_discovery_agent(
        self,
        db: AsyncSession,
        filter_params: Dict[str, Any]
    ) -> List[Lead]:
        """
        Agent 1: Discovers prospective companies, checks for duplicates, and populates provenance.
        """
        candidates = discovery_service.generate_candidate_leads(**filter_params)
        created_leads = []
        now = datetime.now(timezone.utc)

        for cand in candidates:
            # Duplicate check
            existing = await discovery_service.check_duplicate(db, cand.get("domain", ""), cand["company_name"], cand.get("phone"))
            if existing:
                logger.info(f"Updating existing lead: {cand['company_name']}")
                existing.category = cand.get("category", existing.category)
                existing.area = cand.get("area", existing.area)
                existing.whatsapp_status = cand.get("whatsapp_status", existing.whatsapp_status)
                existing.rating = cand.get("rating", existing.rating)
                existing.review_count = cand.get("review_count", existing.review_count)
                existing.global_fit_score = cand.get("global_fit_score", existing.global_fit_score)
                existing.outsourcing_fit = cand.get("outsourcing_fit", existing.outsourcing_fit)
                existing.last_verified_at = now
                created_leads.append(existing)
                continue

            lead = Lead(
                company_name=cand["company_name"],
                business_name=cand.get("business_name"),
                domain=discovery_service.normalize_domain(cand.get("domain", "")),
                website_url=cand.get("website_url", ""),
                category=cand.get("category"),
                subcategory=cand.get("subcategory"),
                country=cand.get("country", "India"),
                state=cand.get("state", ""),
                city=cand.get("city", ""),
                area=cand.get("area"),
                address=cand.get("address"),
                postal_code=cand.get("postal_code"),
                industry=cand.get("industry", "Technology"),
                company_size=cand.get("company_size", "11-50"),
                linkedin_url=cand.get("linkedin_url"),
                phone=cand.get("phone"),
                phone_status=cand.get("phone_status", "PUBLIC"),
                phone_source_url=cand.get("phone_source_url"),
                phone_source_name=cand.get("phone_source_name"),
                phone_verification_method=cand.get("phone_verification_method", "Public Directory Inspection"),
                whatsapp_status=cand.get("whatsapp_status", "WHATSAPP_UNKNOWN"),
                whatsapp_verification_method=cand.get("whatsapp_verification_method", "Unverified link only"),
                lead_type=cand.get("lead_type", "REAL"),
                source_type=cand.get("source_type", "PUBLIC_BUSINESS_DIRECTORY"),
                usage_permission=cand.get("usage_permission", "Public Business Registry Data - Permitted Discovery Use"),
                rating=cand.get("rating"),
                review_count=cand.get("review_count", 0),
                years_in_business=cand.get("years_in_business"),
                business_description=cand.get("business_description"),
                hours=cand.get("hours"),
                social_profiles=cand.get("social_profiles", {}),
                global_fit_score=cand.get("global_fit_score", 0.0),
                outsourcing_fit=cand.get("outsourcing_fit", "MEDIUM"),
                website_status=cand.get("website_status", "WEBSITE_PLUS_AUTOMATION"),
                buying_intent=cand.get("buying_intent", "HIGH"),
                intent_signal=cand.get("intent_signal", ""),
                intent_source=cand.get("intent_source", "Public Web Discovery"),
                intent_timestamp=now,
                source_urls=cand.get("source_urls", [cand.get("website_url")] if cand.get("website_url") else []),
                source_names=cand.get("source_names", ["Public Web Registry"]),
                researched_at=now,
                last_verified_at=now,
                status=LeadStatusEnum.NEW,
                tags=cand.get("tags", []),
                notes=cand.get("notes", "")
            )
            db.add(lead)
            await db.flush()

            # Log activity
            act = ActivityLog(
                lead_id=lead.id,
                agent_name="Discovery Agent",
                action="Lead Discovered & Provenance Tagged",
                details={
                    "industry": lead.industry,
                    "category": lead.category,
                    "area": lead.area,
                    "lead_type": lead.lead_type,
                    "website_status": lead.website_status,
                    "buying_intent": lead.buying_intent,
                    "source_type": lead.source_type
                }
            )
            db.add(act)
            created_leads.append(lead)

        await db.commit()
        return created_leads

    async def run_research_agent(self, db: AsyncSession, lead_id: str) -> Dict[str, Any]:
        """
        Agent 2: Conducts public web inspection, tech stack identification, and decision maker resolution.
        """
        result = await db.execute(select(Lead).where(Lead.id == lead_id))
        lead = result.scalar_one_or_none()
        if not lead:
            raise ValueError(f"Lead not found: {lead_id}")

        lead.status = LeadStatusEnum.RESEARCHING
        now = datetime.now(timezone.utc)

        # 1. Website & Browser Intelligence
        if lead.website_status == "NO_WEBSITE" or not lead.website_url:
            web_intel = {
                "detected_tech_stack": ["No Web Server Detected", "Google Business Profile", "Public Directory"],
                "contact_flow_type": "Direct Phone / Walk-in / WhatsApp",
                "chatbot_present": False,
                "chatbot_vendor": None,
                "whatsapp_present": bool(lead.phone),
                "whatsapp_phone": lead.phone,
                "booking_system_present": False,
                "booking_vendor": None,
                "form_types": [],
                "social_links": [lead.linkedin_url] if lead.linkedin_url else [],
                "visible_signals": ["No official website detected on domain registry", "High search volume on public listings", "Relies entirely on direct phone and WhatsApp inquiries"],
                "ui_modernity_score": 1.0,
                "conversion_friction_points": ["Missing official website", "No online appointment/catalog booking", "Manual phone-only order intake"],
                "source_urls": lead.source_urls or ["https://maps.google.com"],
                "observed_facts": [
                    "No official standalone website found on domain registry.",
                    f"Business phone {lead.phone} listed on public commercial directory.",
                    f"Operating in {lead.city}, {lead.country} with verified local presence."
                ],
                "inferred_insights": [
                    "High-volume local footfall and inquiries without online conversion funnel.",
                    "Prime opportunity for modern Next.js web application and automated WhatsApp booking."
                ]
            }
        else:
            web_intel = await website_intelligence_service.inspect_website(lead.website_url)

        # 2. Decision Maker Resolution with Provenance and Statuses
        dms = decision_maker_service.resolve_decision_makers(
            company_name=lead.company_name,
            domain=lead.domain,
            industry=lead.industry,
            country=lead.country or "India",
            city=lead.city or ""
        )

        # Upsert Research Record
        res_stmt = await db.execute(select(CompanyResearch).where(CompanyResearch.lead_id == lead_id))
        research = res_stmt.scalar_one_or_none()

        if not research:
            research = CompanyResearch(lead_id=lead_id)
            db.add(research)

        research.detected_tech_stack = web_intel["detected_tech_stack"]
        research.contact_flow_type = web_intel["contact_flow_type"]
        research.chatbot_present = web_intel["chatbot_present"]
        research.chatbot_vendor = web_intel["chatbot_vendor"]
        research.whatsapp_present = web_intel["whatsapp_present"]
        research.whatsapp_phone = web_intel["whatsapp_phone"]
        research.booking_system_present = web_intel["booking_system_present"]
        research.booking_vendor = web_intel["booking_vendor"]
        research.form_types = web_intel["form_types"]
        research.social_links = web_intel["social_links"]
        research.visible_signals = web_intel["visible_signals"]
        research.ui_modernity_score = web_intel["ui_modernity_score"]
        research.conversion_friction_points = web_intel["conversion_friction_points"]
        research.source_urls = web_intel["source_urls"]
        research.observed_facts = web_intel["observed_facts"]
        research.inferred_insights = web_intel["inferred_insights"]
        research.research_timestamp = now

        # Add/update decision makers
        for dm in dms:
            # Check if decision maker already exists
            dm_existing_stmt = await db.execute(
                select(DecisionMaker).where(
                    DecisionMaker.lead_id == lead_id,
                    DecisionMaker.full_name == dm["full_name"]
                )
            )
            maker = dm_existing_stmt.scalar_one_or_none()
            if not maker:
                maker = DecisionMaker(lead_id=lead_id, full_name=dm["full_name"])
                db.add(maker)

            maker.title = dm["title"]
            maker.role_category = dm["role_category"]
            maker.linkedin_url = dm.get("linkedin_url")
            maker.linkedin_status = dm.get("linkedin_status", "PUBLIC")
            maker.linkedin_source_url = dm.get("linkedin_source_url")
            maker.email = dm.get("email")
            maker.email_status = dm.get("email_status", "UNKNOWN")
            maker.email_confidence = dm.get("email_confidence", 0.0)
            maker.email_source_url = dm.get("email_source_url")
            maker.email_source_name = dm.get("email_source_name")
            maker.email_verification_method = dm.get("email_verification_method", "Public Web Check")
            maker.phone = dm.get("phone")
            maker.phone_status = dm.get("phone_status", "UNKNOWN")
            maker.phone_source_url = dm.get("phone_source_url")
            maker.phone_source_name = dm.get("phone_source_name")
            maker.phone_verification_method = dm.get("phone_verification_method", "Public Directory Inspection")
            maker.contact_confidence = dm.get("contact_confidence", 50.0)
            maker.verified_source_url = dm.get("verified_source_url", lead.website_url or "")
            maker.provenance_note = dm.get("provenance_note", "")
            maker.is_primary = dm.get("is_primary", False)

            if dm.get("is_primary") and not lead.phone and dm.get("phone"):
                lead.phone = dm.get("phone")
                lead.phone_status = dm.get("phone_status", "PUBLIC")

        lead.researched_at = now
        lead.last_verified_at = now

        # Log activity
        act = ActivityLog(
            lead_id=lead_id,
            agent_name="Research Agent",
            action="Public Web Intelligence & Decision Makers Extracted",
            details={"tech_count": len(web_intel["detected_tech_stack"]), "decision_makers_found": len(dms)}
        )
        db.add(act)
        await db.commit()

        return {"web_intel": web_intel, "decision_makers": dms}

    async def run_qualification_agent(self, db: AsyncSession, lead_id: str) -> Dict[str, Any]:
        """
        Agent 3: Computes 7-factor composite score and maps to Terminal Labs 15 services.
        """
        result = await db.execute(select(Lead).where(Lead.id == lead_id))
        lead = result.scalar_one_or_none()
        if not lead:
            raise ValueError(f"Lead not found: {lead_id}")

        res_stmt = await db.execute(select(CompanyResearch).where(CompanyResearch.lead_id == lead_id))
        research = res_stmt.scalar_one_or_none()
        if not research:
            await self.run_research_agent(db, lead_id)
            res_stmt = await db.execute(select(CompanyResearch).where(CompanyResearch.lead_id == lead_id))
            research = res_stmt.scalar_one_or_none()

        dm_stmt = await db.execute(select(DecisionMaker).where(DecisionMaker.lead_id == lead_id))
        dms = dm_stmt.scalars().all()
        has_email = any(bool(d.email and d.email_status in ["VERIFIED", "PUBLIC"]) for d in dms)

        # 1. 7-Factor Scoring (Business Fit 25, Service Fit 25, Opp Signal 20, Buying Intent 15, Activity 5, Digital Opp 5, Contactability 5)
        score_res = scoring_engine.score_lead(
            industry=lead.industry,
            company_size=lead.company_size,
            detected_tech_stack=research.detected_tech_stack or [],
            visible_signals=research.visible_signals or [],
            hiring_signals=research.hiring_signals or [],
            expansion_signals=research.expansion_signals or [],
            conversion_friction_points=research.conversion_friction_points or [],
            has_website=bool(lead.website_url and lead.website_status != "NO_WEBSITE"),
            website_status=lead.website_status or "WEBSITE_PLUS_AUTOMATION",
            buying_intent=lead.buying_intent or "MEDIUM",
            has_chatbot=research.chatbot_present,
            has_whatsapp=research.whatsapp_present,
            decision_makers_count=len(dms),
            primary_decision_maker_has_email=has_email,
            has_phone=bool(lead.phone or any(d.phone for d in dms))
        )

        # Save/update score
        score_stmt = await db.execute(select(LeadScore).where(LeadScore.lead_id == lead_id))
        score_model = score_stmt.scalar_one_or_none()
        if not score_model:
            score_model = LeadScore(lead_id=lead_id)
            db.add(score_model)

        score_model.total_score = score_res["total_score"]
        score_model.tier = score_res["tier"]
        score_model.business_fit = score_res["business_fit"]
        score_model.service_fit = score_res["service_fit"]
        score_model.opportunity_signal = score_res.get("opportunity_signal", score_res.get("pain_signal", 16))
        score_model.buying_intent = score_res.get("buying_intent", score_res.get("buying_signal", 12))
        score_model.business_activity = score_res.get("business_activity", score_res.get("company_fit", 5))
        score_model.digital_opportunity = score_res["digital_opportunity"]
        score_model.contactability = score_res["contactability"]
        score_model.evidence_confidence = score_res.get("evidence_confidence", 78.0)
        score_model.contact_confidence = score_res.get("contact_confidence", 35.0)
        score_model.calculation_explanation = score_res["calculation_explanation"]
        score_model.calculated_at = datetime.now(timezone.utc)

        # 2. Opportunity Matcher (15 Terminal Labs Services)
        opp_res = opportunity_matcher.match_opportunity(
            company_name=lead.company_name,
            industry=lead.industry,
            detected_tech_stack=research.detected_tech_stack or [],
            visible_signals=research.visible_signals or [],
            hiring_signals=research.hiring_signals or [],
            expansion_signals=research.expansion_signals or [],
            conversion_friction_points=research.conversion_friction_points or [],
            has_chatbot=research.chatbot_present,
            has_whatsapp=research.whatsapp_present,
            ui_modernity_score=research.ui_modernity_score or 7.0,
            website_status=lead.website_status,
            intent_signal=lead.intent_signal
        )

        opp_stmt = await db.execute(select(Opportunity).where(Opportunity.lead_id == lead_id))
        opp_model = opp_stmt.scalar_one_or_none()
        if not opp_model:
            opp_model = Opportunity(lead_id=lead_id)
            db.add(opp_model)

        opp_model.opportunity_type = opp_res.get("opportunity_type", "NEW WEBSITE")
        opp_model.primary_problem = opp_res["primary_problem"]
        opp_model.recommended_service = opp_res["recommended_service"]
        opp_model.secondary_services = opp_res["secondary_services"]
        opp_model.reason = opp_res["reason"]
        opp_model.potential_offer = opp_res["potential_offer"]
        opp_model.estimated_deal_size = opp_res["estimated_deal_size"]
        opp_model.deal_value_numeric = opp_res.get("deal_value_numeric", 20000)
        opp_model.estimated_monthly_roi = opp_res.get("estimated_monthly_roi", "Potential ROI: requires discovery call")
        opp_model.conversion_uplift = opp_res.get("conversion_uplift", "+35% workflow efficiency")
        opp_model.implementation_timeline = opp_res.get("implementation_timeline", "2 - 3 Weeks Delivery")
        opp_model.confidence = opp_res["confidence"]
        opp_model.observed_evidence = opp_res.get("observed_evidence", [])
        opp_model.ai_inferences = opp_res.get("ai_inferences", [])
        opp_model.matched_at = datetime.now(timezone.utc)

        # Advance status
        if score_res["total_score"] >= 65:
            lead.status = LeadStatusEnum.QUALIFIED

        # Log activity
        act = ActivityLog(
            lead_id=lead_id,
            agent_name="Qualification Agent",
            action=f"Lead Scored: {score_res['total_score']}/100 ({score_res['tier']}) -> Opportunity: {opp_model.opportunity_type}",
            details={"score": score_res["total_score"], "tier": score_res["tier"], "service": opp_res["recommended_service"]}
        )
        db.add(act)
        await db.commit()

        return {"score": score_res, "opportunity": opp_res}

    async def run_personalization_agent(self, db: AsyncSession, lead_id: str) -> Dict[str, Any]:
        """
        Agent 4: Generates grounded cold email, LinkedIn InMail, follow-up, WhatsApp pitch with approval gate.
        """
        result = await db.execute(select(Lead).where(Lead.id == lead_id))
        lead = result.scalar_one_or_none()
        if not lead:
            raise ValueError(f"Lead not found: {lead_id}")

        opp_stmt = await db.execute(select(Opportunity).where(Opportunity.lead_id == lead_id))
        opportunity = opp_stmt.scalar_one_or_none()
        if not opportunity:
            await self.run_qualification_agent(db, lead_id)
            opp_stmt = await db.execute(select(Opportunity).where(Opportunity.lead_id == lead_id))
            opportunity = opp_stmt.scalar_one_or_none()

        res_stmt = await db.execute(select(CompanyResearch).where(CompanyResearch.lead_id == lead_id))
        research = res_stmt.scalar_one_or_none()

        dm_stmt = await db.execute(select(DecisionMaker).where(DecisionMaker.lead_id == lead_id))
        dms = dm_stmt.scalars().all()
        primary_dm = next((d for d in dms if d.is_primary), dms[0] if dms else None)

        dm_name = primary_dm.full_name if primary_dm else "Decision Maker"
        dm_title = primary_dm.title if primary_dm else "Executive"
        verified_url = primary_dm.verified_source_url if primary_dm else lead.website_url

        outreach_data = outreach_generator.generate_outreach(
            company_name=lead.company_name,
            domain=lead.domain,
            decision_maker_name=dm_name,
            decision_maker_title=dm_title,
            recommended_service=opportunity.recommended_service,
            primary_problem=opportunity.primary_problem,
            potential_offer=opportunity.potential_offer,
            observed_facts=research.observed_facts if research else [],
            visible_signals=research.visible_signals if research else [],
            verified_source_url=verified_url,
            website_status=lead.website_status,
            intent_signal=lead.intent_signal
        )

        draft_stmt = await db.execute(select(OutreachDraft).where(OutreachDraft.lead_id == lead_id))
        draft = draft_stmt.scalar_one_or_none()
        if not draft:
            draft = OutreachDraft(lead_id=lead_id)
            db.add(draft)

        draft.decision_maker_id = primary_dm.id if primary_dm else None
        draft.cold_email_subject = outreach_data["cold_email_subject"]
        draft.cold_email_body = outreach_data["cold_email_body"]
        draft.linkedin_inmail_body = outreach_data["linkedin_inmail_body"]
        draft.short_followup_body = outreach_data["short_followup_body"]
        draft.personalized_icebreaker = outreach_data["personalized_icebreaker"]
        draft.whatsapp_message_body = outreach_data.get("whatsapp_message_body")
        draft.research_citations = outreach_data["research_citations"]
        draft.approval_status = "PENDING"
        draft.is_approved = False  # Human Approval Gate: Final sending requires explicit user approval

        act = ActivityLog(
            lead_id=lead_id,
            agent_name="Personalization Agent",
            action="Factual Outreach Assets & Email Drafts Generated",
            details={"service": opportunity.recommended_service, "case_type": outreach_data.get("case_type")}
        )
        db.add(act)
        await db.commit()

        return outreach_data

    async def run_full_pipeline_for_lead(self, db: AsyncSession, lead_id: str) -> Dict[str, Any]:
        """
        Executes end-to-end intelligence chain: Research -> Qualification -> Personalization.
        """
        res = await self.run_research_agent(db, lead_id)
        qual = await self.run_qualification_agent(db, lead_id)
        pers = await self.run_personalization_agent(db, lead_id)
        return {
            "research": res,
            "qualification": qual,
            "personalization": pers
        }

orchestrator = AgentOrchestrator()
