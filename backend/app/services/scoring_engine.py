from typing import Dict, Any, List, Optional

class LeadScoringEngine:
    """
    Computes a transparent, explainable qualification score (0-100) across 7 critical dimensions:
    1. Business Fit (max 25)
    2. Service Fit (max 25)
    3. Opportunity Signal (max 20)
    4. Buying Intent (max 15)
    5. Business Activity (max 5)
    6. Digital Opportunity (max 5)
    7. Contactability (max 5)
    Total Max = 100
    """

    WEIGHTS = {
        "business_fit": 0.25,
        "service_fit": 0.25,
        "opportunity_signal": 0.20,
        "buying_intent": 0.15,
        "business_activity": 0.05,
        "digital_opportunity": 0.05,
        "contactability": 0.05
    }

    TARGET_INDUSTRIES = [
        "Real Estate", "HealthTech", "Healthcare", "SaaS", "Software", "FinTech", "E-commerce", 
        "Logistics", "EdTech", "Education", "Manufacturing", "Hospitality", "Legal", "Marketing",
        "Gaming", "Web3", "Retail", "Local Services"
    ]

    def score_lead(
        self,
        industry: str,
        company_size: str,
        detected_tech_stack: List[str] = [],
        visible_signals: List[str] = [],
        hiring_signals: List[str] = [],
        expansion_signals: List[str] = [],
        conversion_friction_points: List[str] = [],
        has_website: bool = True,
        website_status: str = "WEBSITE_PLUS_AUTOMATION",
        buying_intent: str = "HIGH",
        has_chatbot: bool = False,
        has_whatsapp: bool = False,
        decision_makers_count: int = 1,
        primary_decision_maker_has_email: bool = True,
        has_phone: bool = True
    ) -> Dict[str, Any]:
        # 1. Business Fit (0 - 25)
        bf = 15.0
        if any(target.lower() in industry.lower() for target in self.TARGET_INDUSTRIES):
            bf += 7.0
        if company_size in ["11-50", "51-200", "201-500"]:
            bf += 3.0
        business_fit = min(25.0, max(0.0, bf))

        # 2. Service Fit (0 - 25)
        sf = 16.0
        if len(detected_tech_stack) >= 2 or not has_website or website_status in ["NO_WEBSITE", "WEBSITE_REDESIGN", "OUTDATED_WEBSITE"]:
            sf += 5.0
        if any("automation" in s.lower() or "ai" in s.lower() or "ui" in s.lower() or "bot" in s.lower() or "lead" in s.lower() for s in visible_signals):
            sf += 4.0
        service_fit = min(25.0, max(0.0, sf))

        # 3. Opportunity Signal (0 - 20)
        os = 10.0
        if not has_website or website_status == "NO_WEBSITE":
            os += 8.0
        elif website_status in ["OUTDATED_WEBSITE", "WEAK_WEBSITE", "BROKEN_WEBSITE"]:
            os += 6.0
        if len(conversion_friction_points) > 0:
            os += min(4.0, len(conversion_friction_points) * 2.0)
        opportunity_signal = min(20.0, max(0.0, os))

        # 4. Buying Intent (0 - 15)
        bi_map = {
            "HIGH": 15.0,
            "MEDIUM": 10.0,
            "LOW": 5.0,
            "UNKNOWN": 3.0
        }
        buying_intent_score = bi_map.get(buying_intent.upper(), 10.0)

        # 5. Business Activity (0 - 5)
        ba = 2.0
        if len(hiring_signals) > 0:
            ba += 2.0
        if len(expansion_signals) > 0:
            ba += 1.0
        business_activity = min(5.0, max(0.0, ba))

        # 6. Digital Opportunity (0 - 5)
        do = 2.0
        if not has_chatbot:
            do += 1.5
        if not has_whatsapp:
            do += 1.5
        digital_opportunity = min(5.0, max(0.0, do))

        # 7. Contactability (0 - 5)
        ct = 1.0
        if decision_makers_count > 0:
            ct += 2.0
        if primary_decision_maker_has_email:
            ct += 1.0
        if has_phone:
            ct += 1.0
        contactability = min(5.0, max(0.0, ct))

        # Total Composite Score (Max 100)
        total_score = int(round(
            business_fit +
            service_fit +
            opportunity_signal +
            buying_intent_score +
            business_activity +
            digital_opportunity +
            contactability
        ))
        total_score = min(100, max(0, total_score))

        # Tier classification
        if total_score >= 80:
            tier = "Hot"
        elif total_score >= 60:
            tier = "Warm"
        elif total_score >= 40:
            tier = "Moderate"
        else:
            tier = "Cold"

        # Determine primary key driver
        drivers = [
            (business_fit, "Target Industry Fit & Size"),
            (service_fit, "Terminal Labs Service Alignment"),
            (opportunity_signal, "Digital & Operational Opportunity Gap"),
            (buying_intent_score, "Public Hiring & Expansion Signals"),
            (contactability, "Verified Direct Executive Reach")
        ]
        drivers.sort(key=lambda x: x[0], reverse=True)
        key_driver = drivers[0][1]

        explanation = {
            "formula": "Score = Business Fit (25) + Service Fit (25) + Opportunity Signal (20) + Buying Intent (15) + Business Activity (5) + Digital Opportunity (5) + Contactability (5)",
            "tier": tier,
            "key_driver": key_driver,
            "weights": self.WEIGHTS,
            "subscores": {
                "business_fit": business_fit,
                "service_fit": service_fit,
                "opportunity_signal": opportunity_signal,
                "buying_intent": buying_intent_score,
                "business_activity": business_activity,
                "digital_opportunity": digital_opportunity,
                "contactability": contactability
            }
        }

        # Calculate Evidence Confidence (0 - 100) separate from lead score
        ec = 55.0
        if has_website or website_status == "NO_WEBSITE":
            ec += 15.0
        if len(visible_signals) > 0:
            ec += 10.0
        if len(hiring_signals) > 0 or len(expansion_signals) > 0:
            ec += 10.0
        evidence_confidence = min(100.0, max(30.0, ec))

        # Calculate Contact Confidence (0 - 100) strictly separate from lead score and evidence
        cc = 15.0
        if decision_makers_count > 0:
            cc += 25.0
        if primary_decision_maker_has_email:
            cc += 35.0
        if has_phone:
            cc += 25.0
        contact_confidence = min(100.0, max(10.0, cc))

        return {
            "total_score": total_score,
            "evidence_confidence": evidence_confidence,
            "contact_confidence": contact_confidence,
            "tier": tier,
            "business_fit": business_fit,
            "service_fit": service_fit,
            "opportunity_signal": opportunity_signal,
            "pain_signal": opportunity_signal, # backward compatibility
            "buying_intent": buying_intent_score,
            "buying_signal": buying_intent_score, # backward compatibility
            "business_activity": business_activity,
            "company_fit": business_activity, # backward compatibility
            "digital_opportunity": digital_opportunity,
            "contactability": contactability,
            "calculation_explanation": explanation
        }

scoring_engine = LeadScoringEngine()
