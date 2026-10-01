from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

# Base Models
class LeadBase(BaseModel):
    company_name: str
    domain: str
    website_url: Optional[str] = None
    country: Optional[str] = "India"
    state: Optional[str] = None
    city: Optional[str] = None
    industry: Optional[str] = "Technology"
    company_size: Optional[str] = "11-50"
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    phone: Optional[str] = None
    phone_status: Optional[str] = "PUBLIC"
    phone_source_url: Optional[str] = None
    phone_source_name: Optional[str] = None
    phone_observed_at: Optional[datetime] = None
    phone_verification_method: Optional[str] = "Public Directory Inspection"
    whatsapp_status: Optional[str] = "WHATSAPP_UNKNOWN"
    whatsapp_verification_method: Optional[str] = "Unverified link only"
    lead_type: Optional[str] = "REAL"
    website_status: Optional[str] = "WEBSITE_PLUS_AUTOMATION"
    buying_intent: Optional[str] = "HIGH"
    intent_signal: Optional[str] = None
    intent_source: Optional[str] = None
    intent_timestamp: Optional[datetime] = None
    source_urls: Optional[List[str]] = []
    source_names: Optional[List[str]] = ["Public Web Registry"]
    researched_at: Optional[datetime] = None
    last_verified_at: Optional[datetime] = None
    tags: Optional[List[str]] = []
    notes: Optional[str] = ""

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    company_name: Optional[str] = None
    domain: Optional[str] = None
    website_url: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    phone: Optional[str] = None
    phone_status: Optional[str] = None
    whatsapp_status: Optional[str] = None
    lead_type: Optional[str] = None
    website_status: Optional[str] = None
    buying_intent: Optional[str] = None
    intent_signal: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None

class DecisionMakerSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    full_name: str
    title: str
    role_category: str
    linkedin_url: Optional[str] = None
    linkedin_status: Optional[str] = "PUBLIC"
    linkedin_source_url: Optional[str] = None
    linkedin_observed_at: Optional[datetime] = None
    email: Optional[str] = None
    email_confidence: float = 0.0
    email_status: Optional[str] = "UNKNOWN"
    email_source_url: Optional[str] = None
    email_source_name: Optional[str] = None
    email_observed_at: Optional[datetime] = None
    email_verification_method: Optional[str] = "Domain MX and Public Header Check"
    phone: Optional[str] = None
    phone_status: Optional[str] = "UNKNOWN"
    phone_source_url: Optional[str] = None
    phone_source_name: Optional[str] = None
    phone_observed_at: Optional[datetime] = None
    phone_verification_method: Optional[str] = "Public Business Directory"
    contact_confidence: Optional[float] = 50.0
    verified_source_url: str
    provenance_note: Optional[str] = ""
    is_primary: bool = False
    created_at: datetime

class CompanyResearchSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    has_website: bool = True
    detected_tech_stack: List[str] = []
    contact_flow_type: str = "Standard Form"
    chatbot_present: bool = False
    chatbot_vendor: Optional[str] = None
    whatsapp_present: bool = False
    whatsapp_phone: Optional[str] = None
    booking_system_present: bool = False
    booking_vendor: Optional[str] = None
    form_types: List[str] = []
    social_links: Union[Dict[str, Any], List[Any], None] = {}
    visible_signals: List[str] = []
    hiring_signals: List[str] = []
    expansion_signals: List[str] = []
    ui_modernity_score: float = 7.0
    conversion_friction_points: List[str] = []
    source_urls: List[str] = []
    observed_facts: List[Any] = []
    inferred_insights: List[Any] = []
    research_timestamp: datetime

class LeadScoreSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    total_score: int
    evidence_confidence: Optional[float] = 78.0
    contact_confidence: Optional[float] = 35.0
    tier: str
    business_fit: float = 0.0
    service_fit: float = 0.0
    opportunity_signal: Optional[float] = 0.0
    pain_signal: Optional[float] = None
    buying_intent: Optional[float] = 0.0
    buying_signal: Optional[float] = None
    business_activity: Optional[float] = 0.0
    company_fit: Optional[float] = None
    digital_opportunity: float = 0.0
    contactability: float = 0.0
    calculation_explanation: Optional[Dict[str, Any]] = {}
    calculated_at: datetime

class OpportunitySchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    opportunity_type: Optional[str] = "NEW WEBSITE"
    primary_problem: str
    recommended_service: str
    service_url: Optional[str] = None
    service_category: Optional[str] = None
    secondary_services: List[str] = []
    reason: str
    potential_offer: str
    estimated_deal_size: str
    deal_value_numeric: Optional[int] = None
    estimated_monthly_roi: Optional[str] = "Potential ROI: requires discovery call"
    conversion_uplift: Optional[str] = "+35% workflow efficiency"
    implementation_timeline: Optional[str] = "2 - 3 Weeks Delivery"
    confidence: float
    observed_evidence: Optional[List[str]] = []
    ai_inferences: Optional[List[str]] = []
    matched_at: datetime

class OutreachDraftSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    decision_maker_id: Optional[str] = None
    cold_email_subject: str
    cold_email_body: str
    linkedin_inmail_body: str
    short_followup_body: str
    personalized_icebreaker: str
    whatsapp_message_body: Optional[str] = None
    case_type: Optional[str] = None
    service_url: Optional[str] = None
    research_citations: List[str] = []
    approval_status: Optional[str] = "PENDING"
    is_approved: bool = False
    approved_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    channel_status: Dict[str, Any] = {}
    created_at: datetime

class ActivityLogSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    agent_name: str
    action: str
    details: Dict[str, Any] = {}
    timestamp: datetime

# Full Detail Response
class LeadDetailResponse(LeadBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    status: str
    is_duplicate: bool = False
    duplicate_of_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    # Relationships
    research: Optional[CompanyResearchSchema] = None
    decision_makers: List[DecisionMakerSchema] = []
    score: Optional[LeadScoreSchema] = None
    opportunity: Optional[OpportunitySchema] = None
    outreach_drafts: List[OutreachDraftSchema] = []
    activities: List[ActivityLogSchema] = []

class LeadListResponse(BaseModel):
    total: int
    page: int
    limit: int
    leads: List[LeadDetailResponse]

# Discovery Trigger Schema
class DiscoveryFilterRequest(BaseModel):
    industry: Optional[str] = None
    country: Optional[str] = "India"
    state: Optional[str] = None
    city: Optional[str] = None
    company_size: Optional[str] = None
    technology: Optional[str] = None
    service_type: Optional[str] = None
    target_service: Optional[str] = None
    website_status: Optional[str] = None
    buying_intent: Optional[str] = None
    min_score: Optional[int] = 0
    search_query: Optional[str] = None
    search_keywords: Optional[List[str]] = []
    buying_signals: Optional[List[str]] = []
    limit: Optional[int] = 10
    max_results: Optional[int] = 10
    auto_qualify: bool = True
