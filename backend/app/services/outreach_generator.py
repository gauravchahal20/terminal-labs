from typing import Dict, Any, List, Optional
from app.services.opportunity_matcher import TerminalLabsServiceCatalog

class OutreachGenerator:
    """
    Generates research-grounded, non-hallucinatory outreach assets tailored to specific case profiles:
    - Case A: No Website (Turnkey web presence & B2B/B2C digital storefront)
    - Case B: Outdated / Broken Website (Modern Next.js redesign & speed optimization)
    - Case C: Website + WhatsApp Automation (Instant 24/7 lead qualification & CRM sync)
    - Case D: AI Automation & Agents (24/7 customer triage & workflow automation)
    - Case E: Explicitly Requesting Developer / Tech Talent (Fast-turnaround agency execution)
    - Case F: SaaS / MVP Opportunity (Full-stack product architecture & scale)
    """

    def generate_outreach(
        self,
        company_name: str,
        domain: str,
        decision_maker_name: str,
        decision_maker_title: str,
        recommended_service: str,
        primary_problem: str,
        potential_offer: str,
        observed_facts: List[str],
        visible_signals: List[str],
        verified_source_url: str,
        website_status: Optional[str] = "WEBSITE_PLUS_AUTOMATION",
        intent_signal: Optional[str] = None
    ) -> Dict[str, Any]:
        first_name = decision_maker_name.split()[0] if decision_maker_name and decision_maker_name != "Unknown" else "there"
        key_fact = observed_facts[0] if observed_facts else f"public business listing for {company_name}"
        citation = f"Observed on {verified_source_url}" if verified_source_url else f"Public registry review of {company_name}"

        service_info = TerminalLabsServiceCatalog.SERVICES.get(recommended_service, {})
        service_url = service_info.get("url", "https://labs-terminal.vercel.app/services")

        # Determine Outreach Case Profile
        if website_status == "NO_WEBSITE":
            case_type = "CASE_A_NO_WEBSITE"
            subject = f"Building {company_name}'s official digital presence & customer portal"
            icebreaker = f"Hi {first_name}, I noticed {company_name}'s strong reputation on public registries, but saw you don't currently maintain an official standalone website."
            email_body = (
                f"Hi {first_name},\n\n"
                f"While researching leading businesses in your industry, I came across {company_name}'s public profile. "
                f"I noticed that your business is currently operating without an official standalone website, relying primarily on directories or direct phone inquiries.\n\n"
                f"At Terminal Labs, we build high-performance, modern business websites and automated ordering/booking portals with Next.js. "
                f"We can help {company_name} launch an official, lightning-fast digital storefront that establishes credibility and captures direct customer demand.\n\n"
                f"You can review our web development portfolio and delivery workflow here:\n{service_url}\n\n"
                f"Would you be open to a 10-minute discovery call this Thursday to explore options for {company_name}?\n\n"
                f"Best regards,\n"
                f"Terminal Labs Intelligence Team\n"
                f"https://labs-terminal.vercel.app"
            )
            linkedin_body = (
                f"Hi {first_name} — noticed your leadership at {company_name}. "
                f"Saw your strong market activity on public directories and wanted to connect. "
                f"We help established businesses build their first high-converting web presence with zero tech headache. Open to connecting?"
            )
            whatsapp_body = (
                f"Hi {first_name}! 👋 Reaching out from Terminal Labs regarding {company_name}. "
                f"We noticed you don't currently have an official website. We build high-speed, modern websites with integrated WhatsApp inquiry capture for businesses in your space. "
                f"Would you like to see a quick concept wireframe for {company_name}? (Details: {service_url})"
            )

        elif website_status in ["WEAK_WEBSITE", "OUTDATED_WEBSITE", "WEBSITE_REDESIGN"]:
            case_type = "CASE_B_OUTDATED_WEBSITE"
            subject = f"Modernizing {company_name}'s web performance & user conversion"
            icebreaker = f"Hi {first_name}, while reviewing {company_name}'s website at {domain}, I noted several areas where a modern UI refresh could significantly lift conversion."
            email_body = (
                f"Hi {first_name},\n\n"
                f"I was recently reviewing {company_name}'s website on {domain}. "
                f"I noticed that the current page structure and mobile layout could be modernized to improve load times and user engagement.\n\n"
                f"At Terminal Labs, we specialize in high-converting website redesigns and performance engineering. "
                f"We could help you overhaul {company_name}'s digital experience in 2–3 weeks—improving mobile responsiveness, SEO ranking, and visitor-to-inquiry rates.\n\n"
                f"See our redesign case studies and technology stack here:\n{service_url}\n\n"
                f"Would you be available for a brief 10-minute walkthrough this week?\n\n"
                f"Best regards,\n"
                f"Terminal Labs Intelligence Team\n"
                f"https://labs-terminal.vercel.app"
            )
            linkedin_body = (
                f"Hi {first_name} — caught {company_name}'s website at {domain}. "
                f"We spotted a few high-impact UI and mobile performance optimizations that could lift visitor conversions. "
                f"Terminal Labs has modernized web apps for similar high-growth brands. Open to trading brief notes?"
            )
            whatsapp_body = (
                f"Hi {first_name}! 👋 Reaching out from Terminal Labs regarding {company_name}. "
                f"We conducted a quick UI/UX review of {domain} and spotted clear opportunities to boost mobile speed and conversion. "
                f"Open to a brief 5-minute chat this week? (Case studies: {service_url})"
            )

        elif intent_signal and any(w in intent_signal.lower() for w in ["looking for", "rfp", "developer", "hiring", "seeking"]):
            case_type = "CASE_E_REQUESTING_DEVELOPER"
            subject = f"Supporting {company_name}'s technical requirements ({recommended_service})"
            icebreaker = f"Hi {first_name}, I noticed {company_name}'s public notice regarding technical execution needs in {recommended_service}."
            email_body = (
                f"Hi {first_name},\n\n"
                f"I came across {company_name}'s public requirement regarding {intent_signal.lower() if intent_signal else 'technical development'}.\n\n"
                f"At Terminal Labs, we provide dedicated engineering teams and turnkey delivery across {recommended_service}. "
                f"Instead of spending months recruiting and onboarding, we can deploy a battle-tested team to deliver your milestones with clear sprint deliverables and production SLAs.\n\n"
                f"Review our capabilities and workflow here:\n{service_url}\n\n"
                f"Would you be open to a 15-minute sync this week to review your technical specs and timeline?\n\n"
                f"Best regards,\n"
                f"Terminal Labs Intelligence Team\n"
                f"https://labs-terminal.vercel.app"
            )
            linkedin_body = (
                f"Hi {first_name} — saw {company_name}'s public requirement around {recommended_service}. "
                f"Terminal Labs delivers dedicated, high-velocity engineering for tech and growth teams. "
                f"Happy to share our technical specs and delivery timelines if you're open to connecting."
            )
            whatsapp_body = (
                f"Hi {first_name}! 👋 Terminal Labs team here. Saw your public posting regarding {recommended_service}. "
                f"We can deploy senior engineers immediately to execute your roadmap. "
                f"Open to reviewing our track record and availability? (Details: {service_url})"
            )

        elif website_status == "SAAS_OPPORTUNITY" or "saas" in recommended_service.lower():
            case_type = "CASE_F_SAAS_MVP"
            subject = f"Accelerating {company_name}'s SaaS product engineering roadmap"
            icebreaker = f"Hi {first_name}, following {company_name}'s progress on {domain}, I noticed your product engineering requirements are scaling rapidly."
            email_body = (
                f"Hi {first_name},\n\n"
                f"I've been following {company_name}'s growth on {domain}. "
                f"As product usage scales, architecting multi-tenant reliability and fast feature velocity becomes critical.\n\n"
                f"At Terminal Labs, we partner with SaaS founders to build scalable Next.js + FastAPI architectures, automate cloud deployments, and build modern client portals.\n\n"
                f"Explore our SaaS engineering frameworks here:\n{service_url}\n\n"
                f"Could we schedule a short 10-minute technical exchange this Thursday?\n\n"
                f"Best regards,\n"
                f"Terminal Labs Engineering Team\n"
                f"https://labs-terminal.vercel.app"
            )
            linkedin_body = (
                f"Hi {first_name} — impressed by what you're building at {company_name}. "
                f"We partner with SaaS scaleups to accelerate feature delivery and cloud architecture. "
                f"Open to connecting and exchanging notes on your current engineering priorities?"
            )
            whatsapp_body = (
                f"Hi {first_name}! 👋 Reaching out from Terminal Labs regarding {company_name}'s SaaS product roadmap. "
                f"We specialize in full-stack SaaS development and cloud modernization. "
                f"Would love to connect if you're evaluating engineering bandwidth this quarter. (Details: {service_url})"
            )

        elif "whatsapp" in recommended_service.lower():
            case_type = "CASE_C_WEBSITE_WHATSAPP"
            subject = f"Automating 24/7 inquiry qualification for {company_name} on WhatsApp"
            icebreaker = f"Hi {first_name}, while reviewing {company_name}'s customer inquiry flows on {domain}, I noticed opportunities to automate instant WhatsApp lead response."
            email_body = (
                f"Hi {first_name},\n\n"
                f"I was reviewing {company_name}'s customer contact points on {domain}. "
                f"In high-intent markets, delayed response times on customer inquiries can lead to lost opportunities.\n\n"
                f"At Terminal Labs, we build official WhatsApp Business API automation that instantly qualifies leads, answers FAQs, sends collateral, and syncs directly with your CRM 24/7.\n\n"
                f"See our WhatsApp automation architecture here:\n{service_url}\n\n"
                f"Would you be open to a 10-minute demo this week to see how this works for {company_name}?\n\n"
                f"Best regards,\n"
                f"Terminal Labs Intelligence Team\n"
                f"https://labs-terminal.vercel.app"
            )
            linkedin_body = (
                f"Hi {first_name} — caught {company_name}'s customer touchpoints on {domain}. "
                f"We've helped similar businesses deploy automated 24/7 WhatsApp lead qualification to eliminate response delays. "
                f"Open to seeing a 2-minute workflow demo?"
            )
            whatsapp_body = (
                f"Hi {first_name}! 👋 Terminal Labs team here regarding {company_name}. "
                f"We build official 24/7 WhatsApp AI qualification engines that capture high-intent leads instantly. "
                f"Open to a quick demo of how it works? (Details: {service_url})"
            )

        else:
            case_type = "CASE_D_AI_AUTOMATION"
            subject = f"Streamlining {company_name}'s operations with {recommended_service}"
            icebreaker = f"Hi {first_name}, while analyzing {company_name}'s digital touchpoints on {domain}, I noticed clear opportunities to deploy {recommended_service}."
            email_body = (
                f"Hi {first_name},\n\n"
                f"I was recently reviewing {company_name}'s public touchpoints on {domain} and noticed that {primary_problem.lower()}\n\n"
                f"At Terminal Labs, we specialize in {recommended_service} for modern businesses. "
                f"We could help you deploy {potential_offer.lower()} in under 3 weeks—delivering measurable efficiency without disrupting your daily workflows.\n\n"
                f"Review our workflow and client case studies here:\n{service_url}\n\n"
                f"Would you be open to a brief 10-minute walkthrough this Thursday to review our tailored solution for {company_name}?\n\n"
                f"Best regards,\n"
                f"Terminal Labs Intelligence Team\n"
                f"https://labs-terminal.vercel.app"
            )
            linkedin_body = (
                f"Hi {first_name} — caught your work leading {company_name}. "
                f"Looking at {domain}, we spotted an opportunity to streamline your workflow with {recommended_service}. "
                f"Terminal Labs has helped similar teams automate this bottleneck. Open to connecting?"
            )
            whatsapp_body = (
                f"Hi {first_name}! 👋 Reaching out from Terminal Labs regarding {company_name}. "
                f"We spotted an immediate opportunity to deploy {recommended_service} to streamline operations. "
                f"Are you open to a quick 5-min demo this week? (Details: {service_url})"
            )

        followup_body = (
            f"Hi {first_name},\n\n"
            f"Following up on my previous note regarding {company_name}'s {recommended_service} roadmap. "
            f"We put together a quick 3-point architectural brief addressing {key_fact.lower()}.\n\n"
            f"Let me know if you'd like me to send over the 2-page brief.\n\n"
            f"Best,\n"
            f"Terminal Labs Team"
        )

        return {
            "case_type": case_type,
            "cold_email_subject": subject,
            "cold_email_body": email_body,
            "linkedin_inmail_body": linkedin_body,
            "short_followup_body": followup_body,
            "personalized_icebreaker": icebreaker,
            "whatsapp_message_body": whatsapp_body,
            "service_url": service_url,
            "research_citations": [citation, f"Observed fact: {key_fact}"]
        }

outreach_generator = OutreachGenerator()
