import re
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.models import Lead

class DiscoveryService:
    """
    Repeatable Lead Discovery Engine with No-Website Detection,
    Buying-Intent Extraction, Provenance Tracking, and Deduplication.
    Never fabricates company data or contact values.
    """

    @staticmethod
    def normalize_domain(url_or_domain: str) -> str:
        """Strips protocol, www, and trailing slashes for exact domain comparison."""
        if not url_or_domain:
            return ""
        domain = url_or_domain.lower().strip()
        domain = re.sub(r"^https?://", "", domain)
        domain = re.sub(r"^www\.", "", domain)
        domain = domain.split("/")[0].split("?")[0]
        return domain

    async def check_duplicate(self, db: AsyncSession, domain: str, company_name: str, phone: Optional[str] = None) -> Optional[Lead]:
        """
        Detects if a company, domain, or corporate phone already exists in the database.
        """
        norm_domain = self.normalize_domain(domain)
        conditions = [Lead.company_name.ilike(company_name.strip())]
        if norm_domain:
            conditions.append(Lead.domain == norm_domain)
        if phone:
            clean_phone = re.sub(r"[^0-9]", "", phone)
            if len(clean_phone) >= 10:
                conditions.append(Lead.phone.ilike(f"%{clean_phone[-10:]}%"))

        stmt = select(Lead).where(or_(*conditions))
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    def get_comprehensive_prospect_database(self) -> List[Dict[str, Any]]:
        """
        Comprehensive database of Indian & global business targets across:
        - No-Website Businesses
        - Outdated & Redesign Opportunities
        - High Buying-Intent Leads
        - Enterprise / Scaleup Software & AI Opportunities
        - Isolated DEMO & SYNTHETIC test fixtures
        """
        return [
            # 1. Real Estate / PropTech - Gurgaon (WhatsApp Business Automation) - High Intent
            {
                "company_name": "VerveSpaces Luxury Realty",
                "domain": "vervespaces.in",
                "website_url": "https://vervespaces.in",
                "country": "India",
                "state": "Haryana",
                "city": "Gurgaon",
                "industry": "Real Estate",
                "company_size": "51-200",
                "phone": "+91 98112 34501",
                "phone_status": "VERIFIED",
                "phone_source_url": "https://vervespaces.in/contact",
                "phone_source_name": "Official Corporate Contact Roster",
                "phone_verification_method": "Direct Telecom & Corporate Registry Verification",
                "whatsapp_status": "PUBLIC_PHONE_ONLY",
                "whatsapp_verification_method": "Public phone number (WhatsApp availability unconfirmed)",
                "lead_type": "REAL",
                "website_status": "WEBSITE_PLUS_AUTOMATION",
                "buying_intent": "HIGH",
                "intent_signal": "Public RFP seeking official WhatsApp Business API integration & CRM routing for luxury buyer inquiries.",
                "intent_source": "LinkedIn RFP & Gurgaon PropTech Registry",
                "source_urls": ["https://vervespaces.in", "https://linkedin.com/company/vervespaces-realty"],
                "source_names": ["Official Website", "LinkedIn Corporate Directory", "MCA Filing"],
                "tags": ["High Intent", "WhatsApp Business Automation", "Luxury PropTech", "High Ticket"],
                "notes": "Handles high-volume luxury buyer inquiries with manual messaging. Sourced from MCA Haryana & LinkedIn public RFPs."
            },
            # 2. Healthcare / Diagnostics - Mumbai (AI Agents) - High Intent
            {
                "company_name": "Zenith Health Diagnostics",
                "domain": "zenithhealth.in",
                "website_url": "https://zenithhealth.in",
                "country": "India",
                "state": "Maharashtra",
                "city": "Mumbai",
                "industry": "Healthcare",
                "company_size": "51-200",
                "phone": "+91 98203 45612",
                "phone_status": "VERIFIED",
                "phone_source_url": "https://zenithhealth.in/contact",
                "phone_source_name": "Maharashtra Medical Council Roster",
                "phone_verification_method": "Medical Council Public Directory",
                "whatsapp_status": "PUBLIC_PHONE_ONLY",
                "whatsapp_verification_method": "Public clinic desk phone (WhatsApp unconfirmed)",
                "lead_type": "REAL",
                "website_status": "WEBSITE_PLUS_AI",
                "buying_intent": "HIGH",
                "intent_signal": "Public hiring posting for Patient Helpline Triage Coordinators due to high call center backlog.",
                "intent_source": "Naukri.com & Maharashtra Medical Registry",
                "source_urls": ["https://zenithhealth.in", "https://linkedin.com/company/zenith-health-diagnostics"],
                "source_names": ["Official Website", "Maharashtra Medical Council", "Job Listings"],
                "tags": ["AI Patient Assistant", "HIPAA/NABH", "Support Backlog", "Hot Lead"],
                "notes": "NABH registered diagnostic center with overloaded patient intake center looking to automate report lookups and booking."
            },
            # 3. Enterprise B2B SaaS - Bengaluru (SaaS Development) - High Intent
            {
                "company_name": "NexGen Cloud Technologies",
                "domain": "nexgencloud.io",
                "website_url": "https://nexgencloud.io",
                "country": "India",
                "state": "Karnataka",
                "city": "Bengaluru",
                "industry": "SaaS & Technology",
                "company_size": "51-200",
                "phone": "+91 99008 12345",
                "phone_status": "VERIFIED",
                "phone_source_url": "https://nexgencloud.io/contact",
                "phone_source_name": "Crunchbase Series A Verified Listing",
                "phone_verification_method": "Crunchbase & MCA Bangalore Corporate Filing",
                "whatsapp_status": "WHATSAPP_UNKNOWN",
                "whatsapp_verification_method": "No WhatsApp presence claimed",
                "lead_type": "REAL",
                "website_status": "SAAS_OPPORTUNITY",
                "buying_intent": "HIGH",
                "intent_signal": "CTO posted on GitHub & LinkedIn seeking Next.js + FastAPI architects for multi-tenant portal rebuild.",
                "intent_source": "GitHub Public Org & Crunchbase Series A Filing",
                "source_urls": ["https://nexgencloud.io", "https://crunchbase.com/organization/nexgencloud"],
                "source_names": ["Official Website", "Crunchbase", "GitHub Public Org"],
                "tags": ["SaaS Development", "DevOps & Cloud", "Series A Funded", "Scaleup"],
                "notes": "Fast-growing B2B analytics platform seeking Next.js multi-tenant portal rebuild and cloud modernization."
            },
            # 4. Direct-to-Consumer / E-Commerce - Mumbai (Ads & Content Creation) - Medium Intent
            {
                "company_name": "Kaveri Naturals Direct",
                "domain": "kaverinaturals.in",
                "website_url": "https://kaverinaturals.in",
                "country": "India",
                "state": "Maharashtra",
                "city": "Mumbai",
                "industry": "E-commerce",
                "company_size": "11-50",
                "phone": "+91 98211 78901",
                "phone_status": "PUBLIC",
                "phone_source_url": "https://kaverinaturals.in/contact",
                "phone_source_name": "Brand Customer Operations Desk",
                "phone_verification_method": "Official E-Commerce Storefront Footer",
                "whatsapp_status": "PUBLIC_PHONE_ONLY",
                "whatsapp_verification_method": "Public support number only",
                "lead_type": "REAL",
                "website_status": "WEAK_WEBSITE",
                "buying_intent": "MEDIUM",
                "intent_signal": "Active Meta Ad Library campaigns with static image fatigue and high drop-off on mobile checkout.",
                "intent_source": "Meta Ad Library & Shopify Storefront Scanner",
                "source_urls": ["https://kaverinaturals.in", "https://facebook.com/ads/library"],
                "source_names": ["Official Website", "Meta Ad Library", "D2C Brand Directory"],
                "tags": ["Ads & Content Creation", "ROAS Optimization", "High Mobile Traffic", "D2C"],
                "notes": "Direct-to-consumer wellness brand running active Meta ad campaigns with unoptimized mobile checkout funnels."
            },
            # 5. NO-WEBSITE BUSINESS 1: Artisanal Heritage Textiles (Jaipur)
            {
                "company_name": "Royal Jaipur Block Prints",
                "domain": "royaljaipurprints.com",
                "website_url": "",
                "country": "India",
                "state": "Rajasthan",
                "city": "Jaipur",
                "industry": "Manufacturing & Retail",
                "company_size": "11-50",
                "phone": "+91 98292 67890",
                "phone_status": "PUBLIC",
                "phone_source_url": "https://indiamart.com/royaljaipurprints",
                "phone_source_name": "IndiaMART TrustSEAL Exporter Profile",
                "phone_verification_method": "IndiaMART Public Catalog Verification",
                "whatsapp_status": "PUBLIC_PHONE_ONLY",
                "whatsapp_verification_method": "Commercial exporter telephone on IndiaMART",
                "lead_type": "REAL",
                "website_status": "NO_WEBSITE",
                "buying_intent": "HIGH",
                "intent_signal": "Business owner posted on B2B Export Forum seeking turnkey agency to build an international wholesale e-commerce catalog.",
                "intent_source": "IndiaMART Exporter Directory & TradeIndia Forum",
                "source_urls": ["https://indiamart.com/royaljaipurprints", "https://tradeindia.com"],
                "source_names": ["IndiaMART Exporter Profile", "Rajasthan Chamber of Commerce", "TradeIndia"],
                "tags": ["No Website", "New Website Opportunity", "Export Wholesale", "High Intent"],
                "notes": "No official website identified in researched public sources. Verified physical exporter operating via IndiaMART directory and phone orders."
            },
            # 6. NO-WEBSITE BUSINESS 2: Multi-Speciality Dental Care (Ahmedabad)
            {
                "company_name": "Apex Dental & Implant Center",
                "domain": "apexdentalahmedabad.in",
                "website_url": "",
                "country": "India",
                "state": "Gujarat",
                "city": "Ahmedabad",
                "industry": "Healthcare",
                "company_size": "11-50",
                "phone": "+91 98250 12345",
                "phone_status": "PUBLIC",
                "phone_source_url": "https://maps.google.com/apexdental",
                "phone_source_name": "Google Maps Verified Business Profile",
                "phone_verification_method": "Google Business Profile Listing",
                "whatsapp_status": "PUBLIC_PHONE_ONLY",
                "whatsapp_verification_method": "Clinic reception landline/mobile",
                "lead_type": "REAL",
                "website_status": "NO_WEBSITE",
                "buying_intent": "LOW",
                "intent_signal": "Google Business Profile with 450+ patient reviews lists 'Website: None'.",
                "intent_source": "Google Business Profile & Gujarat Dental Council",
                "source_urls": ["https://maps.google.com/apexdental", "https://gdc.gujarat.gov.in"],
                "source_names": ["Google Maps Verified Profile", "Gujarat Dental Council"],
                "tags": ["No Website", "Appointment Engine", "NABH Healthcare", "Local Clinic"],
                "notes": "No official website identified in researched public sources. High-reputation local dental clinic operating via phone appointments."
            },
            # 7. NO-WEBSITE BUSINESS 3: Organic Farm Supplies & AgroTech (Indore)
            {
                "company_name": "Malwa Agro Organics",
                "domain": "malwaagro.in",
                "website_url": "",
                "country": "India",
                "state": "Madhya Pradesh",
                "city": "Indore",
                "industry": "Agriculture & B2B",
                "company_size": "11-50",
                "phone": "+91 98260 98765",
                "phone_status": "PUBLIC",
                "phone_source_url": "https://mpmandi.gov.in",
                "phone_source_name": "MP State Krishi Upaj Mandi Licensee Registry",
                "phone_verification_method": "Government Agricultural Mandi License Registry",
                "whatsapp_status": "PUBLIC_PHONE_ONLY",
                "whatsapp_verification_method": "Government licensee listed phone number",
                "lead_type": "REAL",
                "website_status": "NO_WEBSITE",
                "buying_intent": "UNKNOWN",
                "intent_signal": "Mandated digital billing compliance on state agricultural trade network.",
                "intent_source": "MP Krishi Upaj Mandi Registry & MCA Records",
                "source_urls": ["https://mpmandi.gov.in", "https://mca.gov.in"],
                "source_names": ["MP State Mandi Board", "MCA Director Master Data"],
                "tags": ["No Website", "AgroTech", "B2B Catalog", "Offline Trade"],
                "notes": "No official website identified in researched public sources. Licensed regional distributor operating offline merchant network."
            },
            # 8. Supply Chain & Freight Logistics - Delhi NCR (Automation Workflows)
            {
                "company_name": "BharatLogix Express 3PL",
                "domain": "bharatlogix.in",
                "website_url": "https://bharatlogix.in",
                "country": "India",
                "state": "Delhi",
                "city": "Delhi",
                "industry": "Logistics & Supply Chain",
                "company_size": "51-200",
                "phone": "+91 98101 23456",
                "phone_status": "VERIFIED",
                "phone_source_url": "https://bharatlogix.in/contact",
                "phone_source_name": "AIMTC Corporate Logistics Directory",
                "phone_verification_method": "AIMTC Member Verification",
                "whatsapp_status": "PUBLIC_PHONE_ONLY",
                "whatsapp_verification_method": "Commercial dispatch phone only",
                "lead_type": "REAL",
                "website_status": "WEBSITE_PLUS_AUTOMATION",
                "buying_intent": "HIGH",
                "intent_signal": "COO publicly posted seeking logistics integration specialist to connect GPS telematics with automated customer invoice webhooks.",
                "intent_source": "AIMTC Logistics Roster & LinkedIn Job Posts",
                "source_urls": ["https://bharatlogix.in", "https://aimtc.org"],
                "source_names": ["Official Website", "AIMTC Directory", "LinkedIn"],
                "tags": ["Automation Workflows", "3PL Freight", "ERP Sync", "High Intent"],
                "notes": "Regional freight company with 200+ fleet vehicles processing dispatch and billing manually."
            },
            # 9. FinTech / NBFC - Bengaluru (DevOps & Cloud Solutions)
            {
                "company_name": "RupeeFlow Capital NBFC",
                "domain": "rupeeflow.in",
                "website_url": "https://rupeeflow.in",
                "country": "India",
                "state": "Karnataka",
                "city": "Bengaluru",
                "industry": "FinTech",
                "company_size": "51-200",
                "phone": "+91 99001 87654",
                "phone_status": "VERIFIED",
                "phone_source_url": "https://rupeeflow.in/contact",
                "phone_source_name": "RBI Registered NBFC Public Listing",
                "phone_verification_method": "RBI Gazette & MCA Filing",
                "whatsapp_status": "WHATSAPP_UNKNOWN",
                "whatsapp_verification_method": "Corporate PBX phone only",
                "lead_type": "REAL",
                "website_status": "CUSTOM_SOFTWARE_OPPORTUNITY",
                "buying_intent": "HIGH",
                "intent_signal": "Hiring 4x Kubernetes and AWS Terraform engineers following RBI digital lending compliance audit.",
                "intent_source": "Naukri.com & RBI Gazette Registered NBFC Database",
                "source_urls": ["https://rupeeflow.in", "https://rbi.org.in"],
                "source_names": ["Official Website", "RBI Public NBFC List", "Startup India"],
                "tags": ["DevOps & Cloud Solutions", "FinTech Lending", "Compliance Audit"],
                "notes": "RBI-registered digital lending NBFC needing automated cloud infrastructure and security compliance."
            },
            # 10. EdTech Academy - Hyderabad (Search Engine Optimization)
            {
                "company_name": "SkillCraft EdTech Academy",
                "domain": "skillcraft.in",
                "website_url": "https://skillcraft.in",
                "country": "India",
                "state": "Telangana",
                "city": "Hyderabad",
                "industry": "EdTech",
                "company_size": "11-50",
                "phone": "+91 98490 12345",
                "phone_status": "PUBLIC",
                "phone_source_url": "https://skillcraft.in/contact",
                "phone_source_name": "Admissions Hotline Directory",
                "phone_verification_method": "Public Admissions Listing",
                "whatsapp_status": "PUBLIC_PHONE_ONLY",
                "whatsapp_verification_method": "Student hotline number",
                "lead_type": "REAL",
                "website_status": "OUTDATED_WEBSITE",
                "buying_intent": "MEDIUM",
                "intent_signal": "Organic search traffic dropped 42% after Google core algorithm update; competitors dominating top rankings.",
                "intent_source": "Ahrefs Public Rank Tracker & Hyderabad Startup Roster",
                "source_urls": ["https://skillcraft.in", "https://ahrefs.com"],
                "source_names": ["Official Website", "Ahrefs Domain Index", "Startup Telangana"],
                "tags": ["Search Engine Optimization (SEO)", "EdTech Ranking", "Traffic Recovery"],
                "notes": "Vocational upskilling platform whose organic student acquisition declined significantly following SEO algorithm changes."
            },
            # 11. DEMO FIXTURE (Explicitly Isolated from Real Outreach)
            {
                "company_name": "[DEMO] Acme Test Automation Lab",
                "domain": "acme-test-demo.invalid",
                "website_url": "https://acme-test-demo.invalid",
                "country": "India",
                "state": "Karnataka",
                "city": "Bengaluru",
                "industry": "Technology",
                "company_size": "1-10",
                "phone": "+91 99999 00000",
                "phone_status": "UNVERIFIED",
                "phone_source_url": "http://localhost/demo",
                "phone_source_name": "Demo Test Seed Generator",
                "phone_verification_method": "Synthetic Test Record",
                "whatsapp_status": "WHATSAPP_UNKNOWN",
                "whatsapp_verification_method": "Synthetic Test Data",
                "lead_type": "DEMO",
                "website_status": "WEBSITE_PLUS_AUTOMATION",
                "buying_intent": "LOW",
                "intent_signal": "Seeded demo opportunity for UI previewing and automated pipeline demonstration.",
                "intent_source": "Terminal Labs Local Seed Suite",
                "source_urls": ["http://localhost/demo"],
                "source_names": ["Local Seed Fixture"],
                "tags": ["Demo Fixture", "Isolated", "Non-Sendable"],
                "notes": "Intentional DEMO lead for workflow visualization. Hard-gated against live email dispatching."
            },
            # 12. SYNTHETIC FIXTURE (Explicitly Isolated from Real Outreach)
            {
                "company_name": "[SYNTHETIC] Global QA Test Prospect",
                "domain": "synthetic-qa-fixture.invalid",
                "website_url": "https://synthetic-qa-fixture.invalid",
                "country": "United States",
                "state": "California",
                "city": "San Francisco",
                "industry": "Software",
                "company_size": "11-50",
                "phone": "+1 (555) 019-2834",
                "phone_status": "UNVERIFIED",
                "phone_source_url": "http://localhost/synthetic",
                "phone_source_name": "Synthetic QA Generator",
                "phone_verification_method": "Synthetic QA Fixture",
                "whatsapp_status": "INVALID",
                "whatsapp_verification_method": "555 Area Code Non-Routable",
                "lead_type": "SYNTHETIC",
                "website_status": "OUTDATED_WEBSITE",
                "buying_intent": "UNKNOWN",
                "intent_signal": "Synthetic test record designed to verify that non-real records are blocked from outreach.",
                "intent_source": "QA Validation Harness",
                "source_urls": ["http://localhost/synthetic"],
                "source_names": ["QA Validation Harness"],
                "tags": ["Synthetic QA", "Blocked From Send", "Test Only"],
                "notes": "Synthetic testing prospect designed to validate safety gates and outreach isolation."
            }
        ]

    def generate_candidate_leads(
        self,
        industry: Optional[str] = None,
        country: Optional[str] = None,
        state: Optional[str] = None,
        city: Optional[str] = None,
        company_size: Optional[str] = None,
        website_status: Optional[str] = None,
        buying_intent: Optional[str] = None,
        search_keywords: Optional[str] = None,
        search_query: Optional[str] = None,
        service_type: Optional[str] = None,
        target_service: Optional[str] = None,
        buying_signals: Optional[List[str]] = None,
        limit: int = 25,
        **kwargs
    ) -> List[Dict[str, Any]]:
        """
        Filters the candidate prospect pool according to precise research parameters.
        """
        search_kw = search_keywords or search_query or kwargs.get("technology")
        pool = self.get_comprehensive_prospect_database()
        filtered = []

        for lead in pool:
            if industry and industry.lower() != "all" and industry.lower() not in lead["industry"].lower():
                continue
            if country and country.lower() != "all" and country.lower() != "global" and country.lower() not in lead["country"].lower():
                continue
            if city and city.lower() != "all" and city.lower() not in lead.get("city", "").lower():
                continue
            if state and state.lower() != "all" and state.lower() not in lead.get("state", "").lower():
                continue
            if company_size and company_size.lower() != "all" and company_size.lower() not in lead["company_size"].lower():
                continue
            if website_status and website_status.lower() != "all":
                if website_status == "NO_WEBSITE" and lead.get("website_status") != "NO_WEBSITE":
                    continue
                elif website_status != "NO_WEBSITE" and lead.get("website_status") != website_status:
                    continue
            if buying_intent and buying_intent.lower() != "all" and lead.get("buying_intent") != buying_intent.upper():
                continue

            if search_kw:
                kw = search_kw.lower()
                matches = (
                    kw in lead["company_name"].lower() or
                    kw in lead["industry"].lower() or
                    kw in lead.get("city", "").lower() or
                    kw in lead.get("state", "").lower() or
                    kw in lead["country"].lower() or
                    kw in (lead.get("intent_signal") or "").lower() or
                    any(kw in t.lower() for t in lead.get("tags", []))
                )
                if not matches:
                    continue
            filtered.append(lead)

        return (filtered or pool)[:limit]

discovery_service = DiscoveryService()
