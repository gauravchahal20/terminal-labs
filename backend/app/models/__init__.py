import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class LeadStatusEnum:
    NEW = "New"
    RESEARCHING = "Researching"
    QUALIFIED = "Qualified"
    CONTACTED = "Contacted"
    REPLIED = "Replied"
    MEETING = "Meeting"
    PROPOSAL = "Proposal"
    WON = "Won"
    LOST = "Lost"

class LeadTypeEnum:
    REAL = "REAL"
    DEMO = "DEMO"
    SYNTHETIC = "SYNTHETIC"

class WebsiteStatusEnum:
    NO_WEBSITE = "NO_WEBSITE"
    WEAK_WEBSITE = "WEAK_WEBSITE"
    OUTDATED_WEBSITE = "OUTDATED_WEBSITE"
    BROKEN_WEBSITE = "BROKEN_WEBSITE"
    WEBSITE_REDESIGN = "WEBSITE_REDESIGN"
    WEBSITE_PLUS_AUTOMATION = "WEBSITE_PLUS_AUTOMATION"
    WEBSITE_PLUS_AI = "WEBSITE_PLUS_AI"
    SAAS_OPPORTUNITY = "SAAS_OPPORTUNITY"
    CUSTOM_SOFTWARE_OPPORTUNITY = "CUSTOM_SOFTWARE_OPPORTUNITY"

class BuyingIntentEnum:
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    UNKNOWN = "UNKNOWN"

class ContactStatusEnum:
    VERIFIED = "VERIFIED"
    PUBLIC = "PUBLIC"
    UNVERIFIED = "UNVERIFIED"
    UNKNOWN = "UNKNOWN"

class SourceTypeEnum:
    AUTHORIZED_BUSINESS_API = "AUTHORIZED_BUSINESS_API"
    PUBLIC_BUSINESS_DIRECTORY = "PUBLIC_BUSINESS_DIRECTORY"
    PUBLIC_COMPANY_WEBSITE = "PUBLIC_COMPANY_WEBSITE"
    PUBLIC_BUSINESS_PROFILE = "PUBLIC_BUSINESS_PROFILE"
    USER_PROVIDED_CSV = "USER_PROVIDED_CSV"
    USER_PROVIDED_DATASET = "USER_PROVIDED_DATASET"
    AUTHORIZED_SEARCH_PROVIDER = "AUTHORIZED_SEARCH_PROVIDER"

class WhatsAppStatusEnum:
    WHATSAPP_CONFIRMED = "WHATSAPP_CONFIRMED"
    BUSINESS_PUBLICLY_ADVERTISES_WHATSAPP = "BUSINESS_PUBLICLY_ADVERTISES_WHATSAPP"
    PUBLIC_PHONE_ONLY = "PUBLIC_PHONE_ONLY"
    WHATSAPP_UNKNOWN = "WHATSAPP_UNKNOWN"
    INVALID = "INVALID"
    UNKNOWN = "UNKNOWN"

class Lead(Base):
    __tablename__ = "leads"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    company_name = Column(String(255), nullable=False, index=True)
    business_name = Column(String(255), nullable=True)
    domain = Column(String(255), nullable=False, index=True)
    website_url = Column(String(500), nullable=False)
    
    category = Column(String(100), nullable=True, index=True)
    subcategory = Column(String(100), nullable=True)
    country = Column(String(100), default="India", index=True)
    state = Column(String(100), default="")
    city = Column(String(100), default="", index=True)
    area = Column(String(100), nullable=True, index=True)
    address = Column(Text, nullable=True)
    postal_code = Column(String(50), nullable=True)
    industry = Column(String(100), default="Technology", index=True)
    company_size = Column(String(50), default="11-50")
    
    linkedin_url = Column(String(500), nullable=True)
    twitter_url = Column(String(500), nullable=True)
    phone = Column(String(50), nullable=True)
    phone_status = Column(String(50), default=ContactStatusEnum.PUBLIC) # VERIFIED, PUBLIC, UNVERIFIED, UNKNOWN
    phone_source_url = Column(String(500), nullable=True)
    phone_source_name = Column(String(255), nullable=True)
    phone_observed_at = Column(DateTime(timezone=True), default=utc_now)
    phone_verification_method = Column(String(255), default="Public Directory Inspection")
    
    whatsapp_status = Column(String(50), default=WhatsAppStatusEnum.WHATSAPP_UNKNOWN) # WHATSAPP_CONFIRMED, BUSINESS_PUBLICLY_ADVERTISES_WHATSAPP, PUBLIC_PHONE_ONLY, WHATSAPP_UNKNOWN, INVALID, UNKNOWN
    whatsapp_verification_method = Column(String(255), default="Unverified link only")
    
    # Lead Type, Source Type & Data Provenance
    lead_type = Column(String(50), default=LeadTypeEnum.REAL, index=True) # REAL, DEMO, SYNTHETIC
    source_type = Column(String(100), default=SourceTypeEnum.PUBLIC_BUSINESS_DIRECTORY, index=True)
    usage_permission = Column(String(255), default="Public Business Registry Data - Permitted Discovery Use")
    source_urls = Column(JSON, default=list)
    source_names = Column(JSON, default=list) # e.g. ["Official Website", "MCA Corporate Filing", "LinkedIn Directory"]
    researched_at = Column(DateTime(timezone=True), default=utc_now)
    last_verified_at = Column(DateTime(timezone=True), default=utc_now)
    
    # Local Business Directory Attributes
    rating = Column(String(20), nullable=True)
    review_count = Column(Integer, default=0)
    years_in_business = Column(String(50), nullable=True)
    business_description = Column(Text, nullable=True)
    hours = Column(String(255), nullable=True)
    social_profiles = Column(JSON, default=dict) # {"facebook": "...", "instagram": "...", "linkedin": "...", "youtube": "...", "x": "..."}
    
    # Global / Outsourcing Fit
    global_fit_score = Column(Float, default=0.0) # 0 - 100 for foreign prospects
    outsourcing_fit = Column(String(50), default="MEDIUM") # HIGH, MEDIUM, LOW
    
    # Website Intelligence Classification
    website_status = Column(String(50), default=WebsiteStatusEnum.OUTDATED_WEBSITE, index=True)
    
    # Explicit Buying Intent Engine
    buying_intent = Column(String(50), default=BuyingIntentEnum.MEDIUM, index=True) # HIGH, MEDIUM, LOW, UNKNOWN
    intent_signal = Column(Text, nullable=True) # e.g. "Public post requesting React developer & WhatsApp automation"
    intent_source = Column(String(500), nullable=True) # e.g. "Public MCA filing & LinkedIn RFP listing"
    intent_timestamp = Column(DateTime(timezone=True), nullable=True)
    
    # CRM & Pipeline Status
    status = Column(String(50), default=LeadStatusEnum.NEW, index=True)
    
    # Deduplication & Safety
    is_duplicate = Column(Boolean, default=False)
    duplicate_of_id = Column(String(36), nullable=True)
    
    tags = Column(JSON, default=list)
    notes = Column(Text, default="")
    
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    research = relationship("CompanyResearch", back_populates="lead", uselist=False, cascade="all, delete-orphan")
    decision_makers = relationship("DecisionMaker", back_populates="lead", cascade="all, delete-orphan")
    score = relationship("LeadScore", back_populates="lead", uselist=False, cascade="all, delete-orphan")
    opportunity = relationship("Opportunity", back_populates="lead", uselist=False, cascade="all, delete-orphan")
    outreach_drafts = relationship("OutreachDraft", back_populates="lead", cascade="all, delete-orphan")
    activities = relationship("ActivityLog", back_populates="lead", cascade="all, delete-orphan")

class CompanyResearch(Base):
    __tablename__ = "company_research"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lead_id = Column(String(36), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    detected_tech_stack = Column(JSON, default=list)  # e.g. ["React", "WordPress", "Stripe"]
    contact_flow_type = Column(String(100), default="Standard Form")
    
    # Website Intelligence Signals
    has_website = Column(Boolean, default=True)
    chatbot_present = Column(Boolean, default=False)
    chatbot_vendor = Column(String(100), nullable=True)
    whatsapp_present = Column(Boolean, default=False)
    whatsapp_phone = Column(String(100), nullable=True)
    booking_system_present = Column(Boolean, default=False)
    booking_vendor = Column(String(100), nullable=True)
    
    form_types = Column(JSON, default=list)
    social_links = Column(JSON, default=dict)
    
    # Business Signals
    visible_signals = Column(JSON, default=list) # e.g. ["Outdated UI (2018)", "Missing Mobile Optimization"]
    hiring_signals = Column(JSON, default=list)  # e.g. ["Hiring 3x Customer Support Reps", "Looking for DevOps Lead"]
    expansion_signals = Column(JSON, default=list) # e.g. ["Expanding into New Hub", "New Product Line Launched"]
    
    ui_modernity_score = Column(Float, default=7.0) # 0.0 to 10.0
    conversion_friction_points = Column(JSON, default=list)
    
    # Provenance & Distinguishing Facts from Inference
    source_urls = Column(JSON, default=list)
    observed_facts = Column(JSON, default=list) # [{ "source": "...", "date": "...", "fact": "..." }]
    inferred_insights = Column(JSON, default=list) # [{ "inference": "...", "confidence": "...", "rationale": "..." }]
    
    research_timestamp = Column(DateTime(timezone=True), default=utc_now)

    lead = relationship("Lead", back_populates="research")

class DecisionMaker(Base):
    __tablename__ = "decision_makers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lead_id = Column(String(36), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    
    full_name = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    role_category = Column(String(100), default="Executive") # Founder, CEO, CTO, COO, Head of Sales, Head of Marketing
    
    linkedin_url = Column(String(500), nullable=True)
    linkedin_status = Column(String(50), default=ContactStatusEnum.PUBLIC) # VERIFIED, PUBLIC, UNVERIFIED, UNKNOWN
    linkedin_source_url = Column(String(500), nullable=True)
    linkedin_observed_at = Column(DateTime(timezone=True), default=utc_now)
    
    email = Column(String(255), nullable=True)
    email_confidence = Column(Float, default=0.0)
    email_status = Column(String(50), default=ContactStatusEnum.UNKNOWN) # VERIFIED, PUBLIC, UNVERIFIED, UNKNOWN
    email_source_url = Column(String(500), nullable=True)
    email_source_name = Column(String(255), nullable=True)
    email_observed_at = Column(DateTime(timezone=True), default=utc_now)
    email_verification_method = Column(String(255), default="Domain MX and Public Header Check")
    
    phone = Column(String(50), nullable=True)
    phone_status = Column(String(50), default=ContactStatusEnum.UNKNOWN) # VERIFIED, PUBLIC, UNVERIFIED, UNKNOWN
    phone_source_url = Column(String(500), nullable=True)
    phone_source_name = Column(String(255), nullable=True)
    phone_observed_at = Column(DateTime(timezone=True), default=utc_now)
    phone_verification_method = Column(String(255), default="Public Business Directory")
    
    contact_confidence = Column(Float, default=50.0) # 0.0 - 100.0 separate from Lead Score
    
    verified_source_url = Column(String(500), nullable=False)
    provenance_note = Column(Text, default="")
    is_primary = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), default=utc_now)

    lead = relationship("Lead", back_populates="decision_makers")

class LeadScore(Base):
    __tablename__ = "lead_scores"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lead_id = Column(String(36), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    total_score = Column(Integer, nullable=False, default=0, index=True)
    evidence_confidence = Column(Float, default=78.0) # 0.0 - 100.0 evidence confidence separate from score
    contact_confidence = Column(Float, default=35.0)  # 0.0 - 100.0 contact confidence separate from score
    tier = Column(String(50), default="Warm") # Hot (80-100), Warm (60-79), Moderate (40-59), Cold (0-39)
    
    # 7-factor explainable breakdown (Total = 100)
    business_fit = Column(Float, default=0.0)        # max 25
    service_fit = Column(Float, default=0.0)         # max 25
    opportunity_signal = Column(Float, default=0.0)  # max 20
    buying_intent = Column(Float, default=0.0)       # max 15
    business_activity = Column(Float, default=0.0)   # max 5
    digital_opportunity = Column(Float, default=0.0) # max 5
    contactability = Column(Float, default=0.0)      # max 5
    
    calculation_explanation = Column(JSON, default=dict)
    calculated_at = Column(DateTime(timezone=True), default=utc_now)

    lead = relationship("Lead", back_populates="score")

class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lead_id = Column(String(36), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    opportunity_type = Column(String(100), default="WHATSAPP AUTOMATION") # NEW WEBSITE, WEBSITE REDESIGN, etc.
    primary_problem = Column(Text, nullable=False)
    recommended_service = Column(String(100), nullable=False)  # One of 15 Terminal Labs Services
    secondary_services = Column(JSON, default=list)
    
    reason = Column(Text, nullable=False)
    potential_offer = Column(Text, nullable=False)
    
    # Observed Evidence vs Inferences
    observed_evidence = Column(JSON, default=list)
    ai_inferences = Column(JSON, default=list)
    
    estimated_deal_size = Column(String(50), default="$15k - $30k")
    deal_value_numeric = Column(Integer, default=20000)
    estimated_monthly_roi = Column(String(100), default="Potential ROI: requires discovery call")
    conversion_uplift = Column(String(50), default="+35% inquiry conversion")
    implementation_timeline = Column(String(50), default="2 - 3 Weeks Delivery")
    confidence = Column(Float, default=0.90)
    
    matched_at = Column(DateTime(timezone=True), default=utc_now)

    lead = relationship("Lead", back_populates="opportunity")

class OutreachDraft(Base):
    __tablename__ = "outreach_drafts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lead_id = Column(String(36), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False)
    decision_maker_id = Column(String(36), ForeignKey("decision_makers.id", ondelete="SET NULL"), nullable=True)
    
    cold_email_subject = Column(String(255), nullable=False)
    cold_email_body = Column(Text, nullable=False)
    linkedin_inmail_body = Column(Text, nullable=False)
    short_followup_body = Column(Text, nullable=False)
    personalized_icebreaker = Column(Text, nullable=False)
    whatsapp_message_body = Column(Text, nullable=True)
    
    # Human Approval Gate Status
    is_approved = Column(Boolean, default=False)
    approval_status = Column(String(50), default="PENDING") # PENDING, APPROVED, REJECTED, EDITED
    approved_at = Column(DateTime(timezone=True), nullable=True)
    
    # Direct Dispatch Fields
    send_status = Column(String(50), default="DRAFT") # DRAFT, APPROVED, SENDING, SENT, FAILED
    sent_to_email = Column(String(255), nullable=True)
    sent_to_phone = Column(String(100), nullable=True)
    sent_via_account = Column(String(255), nullable=True)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    sent_message_id = Column(String(255), nullable=True)
    send_error = Column(Text, nullable=True)
    
    research_citations = Column(JSON, default=list)
    channel_status = Column(JSON, default=dict) # {"email": "draft", "linkedin": "draft", "whatsapp": "draft"}
    created_at = Column(DateTime(timezone=True), default=utc_now)

    lead = relationship("Lead", back_populates="outreach_drafts")
    decision_maker = relationship("DecisionMaker")

class EmailAccount(Base):
    __tablename__ = "email_accounts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    sender_name = Column(String(255), default="Terminal Labs Partnerships")
    sender_email = Column(String(255), nullable=False)
    reply_to_email = Column(String(255), nullable=True)
    provider_type = Column(String(50), default="GMAIL_OAUTH") # GMAIL_OAUTH, GOOGLE_WORKSPACE, CUSTOM_SMTP
    
    # Google User Identity Profile (Sign in with Google)
    user_google_name = Column(String(255), nullable=True)
    user_google_email = Column(String(255), nullable=True)
    user_google_picture = Column(String(500), nullable=True)
    google_auth_connected = Column(Boolean, default=False)
    
    # Google OAuth 2.0 Gmail Connection
    is_connected = Column(Boolean, default=False)
    connected_email = Column(String(255), nullable=True)
    gmail_status = Column(String(50), default="NOT CONFIGURED") # CONNECTED, NOT CONFIGURED, CONNECTION FAILED, DISCONNECTED, BLOCKED
    oauth_access_token = Column(Text, nullable=True)
    oauth_refresh_token = Column(Text, nullable=True)
    oauth_token_expires_at = Column(DateTime(timezone=True), nullable=True)
    oauth_scopes = Column(JSON, default=list)
    
    # SMTP Settings (Fallback or manual config)
    smtp_host = Column(String(255), default="smtp.gmail.com")
    smtp_port = Column(Integer, default=587)
    smtp_username = Column(String(255), nullable=True)
    smtp_password = Column(String(255), nullable=True)
    smtp_use_tls = Column(Boolean, default=True)
    smtp_use_ssl = Column(Boolean, default=False)
    
    # Email signature
    email_signature = Column(Text, default="--\nPartnerships Team | Terminal Labs\nhttps://labs-terminal.vercel.app")
    
    # WhatsApp / Phone direct config
    whatsapp_phone_number = Column(String(100), nullable=True)
    whatsapp_api_token = Column(String(255), nullable=True)
    
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    last_tested_at = Column(DateTime(timezone=True), nullable=True)
    test_status = Column(String(50), default="NOT CONFIGURED") # CONNECTED, FAILED, NOT CONFIGURED, DISCONNECTED
    last_error = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

class DiscoveryRun(Base):
    __tablename__ = "discovery_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    query = Column(String(500), nullable=True)
    location = Column(String(100), default="India")
    industry = Column(String(100), default="All")
    target_service = Column(String(100), default="All")
    website_status_filter = Column(String(50), default="All")
    buying_intent_filter = Column(String(50), default="All")
    
    requested_count = Column(Integer, default=10)
    discovered_count = Column(Integer, default=0)
    duplicates_count = Column(Integer, default=0)
    qualified_count = Column(Integer, default=0)
    high_intent_count = Column(Integer, default=0)
    no_website_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)
    
    duration_seconds = Column(Float, default=0.0)
    status = Column(String(50), default="COMPLETED") # QUEUED, DISCOVERING, RESEARCHING, SCORING, MATCHING, COMPLETED, FAILED
    
    step_progress = Column(JSON, default=dict) # {"step": "MATCHING", "current": 10, "total": 10}
    logs = Column(JSON, default=list)
    
    started_at = Column(DateTime(timezone=True), default=utc_now)
    completed_at = Column(DateTime(timezone=True), nullable=True)

class DispatchLog(Base):
    __tablename__ = "dispatch_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lead_id = Column(String(36), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    draft_id = Column(String(36), ForeignKey("outreach_drafts.id", ondelete="SET NULL"), nullable=True)
    
    channel = Column(String(50), default="EMAIL") # EMAIL, WHATSAPP, LINKEDIN, SMS
    recipient_name = Column(String(255), nullable=True)
    recipient_target = Column(String(255), nullable=False) # Email address or Phone number
    sender_account = Column(String(255), nullable=True)
    
    subject = Column(String(255), nullable=True)
    message_content = Column(Text, nullable=False)
    
    status = Column(String(50), default="SENT") # SENT, FAILED, SIMULATED
    response_code = Column(String(100), nullable=True)
    error_message = Column(Text, nullable=True)
    
    dispatched_at = Column(DateTime(timezone=True), default=utc_now)

    lead = relationship("Lead")

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lead_id = Column(String(36), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    
    agent_name = Column(String(100), default="System") # Discovery Agent, Research Agent, Scoring Agent, Personalization Agent, User
    action = Column(String(100), nullable=False)
    details = Column(JSON, default=dict)
    
    timestamp = Column(DateTime(timezone=True), default=utc_now)

    lead = relationship("Lead", back_populates="activities")
