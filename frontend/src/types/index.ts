export type LeadStatus =
  | "New"
  | "Researching"
  | "Qualified"
  | "Contacted"
  | "Replied"
  | "Meeting"
  | "Proposal"
  | "Won"
  | "Lost";

export type ScoreTier = "Hot" | "Warm" | "Moderate" | "Cold";

export type LeadType = "REAL" | "DEMO" | "SYNTHETIC";

export type WebsiteStatus =
  | "NO_WEBSITE"
  | "WEAK_WEBSITE"
  | "OUTDATED_WEBSITE"
  | "BROKEN_WEBSITE"
  | "WEBSITE_REDESIGN"
  | "WEBSITE_PLUS_AUTOMATION"
  | "WEBSITE_PLUS_AI"
  | "SAAS_OPPORTUNITY"
  | "CUSTOM_SOFTWARE_OPPORTUNITY";

export type BuyingIntent = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

export type VerificationStatus = "VERIFIED" | "PUBLIC" | "UNVERIFIED" | "UNKNOWN";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "EDITED";

export type TerminalLabsServiceKey =
  | "Web Design & Development"
  | "Mobile App Development"
  | "AI Agents"
  | "WhatsApp Business Automation"
  | "Social Media Management"
  | "Video Editing & Production"
  | "Data Analytics & Visualization"
  | "Ads & Content Creation"
  | "Automation Workflows"
  | "Search Engine Optimization (SEO)"
  | "Copywriting & Ghostwriting"
  | "Discord Server Management"
  | "Data Cleaning"
  | "DevOps & Cloud Solutions"
  | "UI/UX & Brand Identity Design"
  | "SaaS Development"
  | "Custom Software";

export interface DecisionMaker {
  id: string;
  full_name: string;
  title: string;
  role_category: string;
  linkedin_url?: string;
  linkedin_status?: VerificationStatus;
  email?: string;
  email_status?: VerificationStatus;
  email_confidence: number;
  phone?: string;
  phone_status?: VerificationStatus;
  verified_source_url: string;
  provenance_note?: string;
  is_primary: boolean;
  created_at: string;
}

export interface CompanyResearch {
  id: string;
  detected_tech_stack: string[];
  contact_flow_type: string;
  chatbot_present: boolean;
  chatbot_vendor?: string;
  whatsapp_present: boolean;
  whatsapp_phone?: string;
  booking_system_present: boolean;
  booking_vendor?: string;
  form_types: string[];
  social_links: Record<string, string>;
  visible_signals: string[];
  hiring_signals: string[];
  expansion_signals: string[];
  ui_modernity_score: number;
  conversion_friction_points: string[];
  source_urls: string[];
  observed_facts: string[];
  inferred_insights: string[];
  research_timestamp: string;
}

export interface LeadScore {
  id: string;
  total_score: number;
  evidence_confidence?: number;
  tier: ScoreTier;
  business_fit: number;
  service_fit: number;
  opportunity_signal?: number;
  pain_signal?: number;
  buying_intent?: number;
  buying_signal?: number;
  business_activity?: number;
  company_fit?: number;
  digital_opportunity: number;
  contactability: number;
  calculation_explanation?: {
    formula: string;
    tier: string;
    key_driver: string;
    weights: Record<string, number>;
  };
  calculated_at: string;
}

export interface Opportunity {
  id: string;
  opportunity_type?: string;
  primary_problem: string;
  recommended_service: TerminalLabsServiceKey | string;
  service_url?: string;
  service_category?: string;
  secondary_services: string[];
  reason: string;
  potential_offer: string;
  estimated_deal_size: string;
  deal_value_numeric?: number;
  estimated_monthly_roi?: string;
  conversion_uplift?: string;
  implementation_timeline?: string;
  confidence: number;
  observed_evidence?: string[];
  ai_inferences?: string[];
  matched_at: string;
}

export interface OutreachDraft {
  id: string;
  decision_maker_id?: string;
  cold_email_subject: string;
  cold_email_body: string;
  linkedin_inmail_body: string;
  short_followup_body: string;
  personalized_icebreaker: string;
  whatsapp_message_body?: string;
  case_type?: string;
  service_url?: string;
  research_citations: string[];
  approval_status?: ApprovalStatus;
  is_approved: boolean;
  approved_at?: string;
  sent_at?: string;
  channel_status: Record<string, any>;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  agent_name: string;
  action: string;
  details: Record<string, any>;
  timestamp: string;
}

export type WhatsAppStatus =
  | "WHATSAPP_CONFIRMED"
  | "BUSINESS_PUBLICLY_ADVERTISES_WHATSAPP"
  | "PUBLIC_PHONE_ONLY"
  | "WHATSAPP_UNKNOWN"
  | "INVALID"
  | "UNKNOWN";

export type SourceType =
  | "AUTHORIZED_BUSINESS_API"
  | "PUBLIC_BUSINESS_DIRECTORY"
  | "PUBLIC_COMPANY_WEBSITE"
  | "PUBLIC_BUSINESS_PROFILE"
  | "USER_PROVIDED_CSV"
  | "USER_PROVIDED_DATASET"
  | "AUTHORIZED_SEARCH_PROVIDER";

export interface Lead {
  id: string;
  company_name: string;
  business_name?: string;
  category?: string;
  subcategory?: string;
  area?: string;
  address?: string;
  postal_code?: string;
  domain: string;
  website_url: string;
  country: string;
  state?: string;
  city: string;
  industry: string;
  company_size: string;
  linkedin_url?: string;
  twitter_url?: string;
  phone?: string;
  phone_status?: VerificationStatus;
  phone_source_name?: string;
  phone_source_url?: string;
  phone_observed_at?: string;
  phone_verification_method?: string;
  whatsapp_status?: WhatsAppStatus;
  whatsapp_source?: string;
  whatsapp_verification_method?: string;
  rating?: number;
  review_count?: number;
  years_in_business?: number;
  business_description?: string;
  hours?: string;
  social_profiles?: Record<string, string>;
  global_fit_score?: number;
  outsourcing_fit?: string;
  partner_opportunity_type?: string;
  source_type?: SourceType;
  usage_permission?: string;
  lead_type?: LeadType;
  website_status?: WebsiteStatus;
  buying_intent?: BuyingIntent;
  intent_signal?: string;
  intent_source?: string;
  intent_timestamp?: string;
  quality_firewall_status?: "PASS" | "WARNING" | "REVIEW_REQUIRED" | "REJECT";
  quality_firewall_flags?: string[];
  quality_firewall_reasons?: string[];
  freshness_score?: number;
  signal_age_days?: number;
  decay_multiplier?: number;
  last_refreshed_at?: string;
  next_best_action?: string;
  next_best_action_reason?: string;
  evidence_graph?: Array<{
    fact: string;
    source: string;
    url?: string;
    observed_at?: string;
    confidence?: string;
    is_ai_inference?: boolean;
  }>;
  why_this_lead?: string;
  why_not_this_lead?: string;
  feedback_score_adjustment?: number;
  is_feedback_influenced?: boolean;
  source_urls?: string[];
  source_names?: string[];
  researched_at?: string;
  last_verified_at?: string;
  status: LeadStatus;
  is_duplicate: boolean;
  duplicate_of_id?: string;
  tags: string[];
  notes?: string;
  created_at: string;
  updated_at: string;

  // Joined Relations
  research?: CompanyResearch;
  decision_makers?: DecisionMaker[];
  score?: LeadScore;
  opportunity?: Opportunity;
  outreach_drafts?: OutreachDraft[];
  activities?: ActivityLog[];
}

export interface CockpitTodayData {
  summary: {
    actionable_leads_count: number;
    buying_signals_count: number;
    pending_approvals_count: number;
    verifications_needed_count: number;
    total_active_pipeline: number;
  };
  next_best_action_breakdown: Record<string, number>;
  high_fit_leads: Array<{
    id: string;
    company_name: string;
    category: string;
    city: string;
    country: string;
    score: number;
    recommended_service: string;
    website_status: string;
    buying_intent: string;
    next_best_action: string;
    next_best_action_reason: string;
    why_this_lead: string;
  }>;
  active_buying_signals: Array<{
    id: string;
    company_name: string;
    signal: string;
    source: string;
    buying_intent: string;
    service: string;
    timestamp: string;
  }>;
  drafts_waiting_approval: Array<{
    draft_id: string;
    lead_id: string;
    company_name: string;
    service: string;
    subject: string;
    preview: string;
    has_whatsapp: boolean;
    created_at: string;
  }>;
  contacts_to_verify: Array<{
    id: string;
    company_name: string;
    phone: string;
    whatsapp_status: string;
    quality_firewall_status: string;
    quality_firewall_flags: string[];
  }>;
}

export interface SavedSearchItem {
  id: string;
  title: string;
  category?: string;
  city?: string;
  country?: string;
  website_status?: string;
  whatsapp_signal?: string;
  buying_intent?: string;
  keywords?: string;
  auto_monitor: boolean;
  new_leads_detected_count: number;
  last_checked_at?: string;
  created_at: string;
}

export interface LocalBusinessCandidate {
  company_name: string;
  business_name?: string;
  category: string;
  subcategory?: string;
  country: string;
  state?: string;
  city: string;
  area?: string;
  address?: string;
  postal_code?: string;
  phone?: string;
  phone_status: VerificationStatus;
  phone_source_name?: string;
  phone_source_url?: string;
  phone_observed_at?: string;
  email?: string;
  email_status?: VerificationStatus;
  email_source?: string;
  website_url?: string;
  website_status: WebsiteStatus;
  website_source?: string;
  whatsapp_status: WhatsAppStatus;
  whatsapp_source?: string;
  rating?: number;
  review_count?: number;
  years_in_business?: number;
  business_description?: string;
  hours?: string;
  social_profiles?: Record<string, string>;
  lead_score: number;
  evidence_confidence: number;
  contact_confidence: number;
  buying_intent: BuyingIntent;
  intent_signal?: string;
  potential_opportunity: string;
  recommended_service: string;
  secondary_services?: string[];
  why_terminal_labs?: string;
  source_names: string[];
  source_urls: string[];
  source_type: SourceType;
  usage_permission: string;
  retrieved_at: string;
  lead_type: LeadType;
}

export interface DashboardAnalytics {
  kpis: {
    total_leads: number;
    qualified_leads: number;
    high_intent_leads: number;
    no_website_leads: number;
    real_leads_count: number;
    avg_qualification_score: number;
    total_pipeline_value: number;
    avg_deal_value: number;
    active_services_matched: number;
  };
  charts: {
    industry_distribution: { industry: string; count: number }[];
    service_opportunities: { service: string; count: number }[];
    score_breakdown: { tier: string; count: number }[];
    pipeline_stages: { status: string; count: number }[];
    website_status_distribution?: { status: string; count: number }[];
    buying_intent_distribution?: { intent: string; count: number }[];
    lead_type_distribution?: { type: string; count: number }[];
  };
  recent_leads: Array<{
    id: string;
    company_name: string;
    domain: string;
    industry: string;
    country: string;
    city: string;
    status: LeadStatus;
    lead_type?: LeadType;
    website_status?: WebsiteStatus;
    buying_intent?: BuyingIntent;
    phone_status?: VerificationStatus;
    score: number | null;
    tier: ScoreTier | null;
    recommended_service: string | null;
    created_at: string;
  }>;
}

export interface AgentDiscoveryRequest {
  industry?: string;
  country?: string;
  state?: string;
  city?: string;
  company_size?: string;
  technology?: string;
  service_type?: string;
  target_service?: string;
  website_status?: string;
  buying_intent?: string;
  min_score?: number;
  search_query?: string;
  search_keywords?: string[];
  buying_signals?: string[];
  limit?: number;
  max_results?: number;
  auto_qualify?: boolean;
}

export type AnalyticsData = DashboardAnalytics;
export type DiscoveryFilterRequest = AgentDiscoveryRequest;

export interface EmailAccountData {
  id: string;
  sender_name: string;
  sender_email: string;
  reply_to_email?: string;
  provider_type: string;
  is_connected: boolean;
  connected_email?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  has_password?: boolean;
  email_signature: string;
  whatsapp_phone_number?: string;
  is_verified: boolean;
  test_status: string;
  last_tested_at?: string;
  last_error?: string;
}

export interface DispatchLogItem {
  id: string;
  lead_id: string;
  draft_id?: string;
  channel: string;
  recipient_name?: string;
  recipient_target: string;
  sender_account?: string;
  subject?: string;
  message_snippet: string;
  status: string;
  response_code?: string;
  error_message?: string;
  dispatched_at: string;
}

export interface DiscoveryRunItem {
  id: string;
  query: string;
  location: string;
  industry: string;
  target_service: string;
  website_status_filter: string;
  buying_intent_filter: string;
  requested_count: number;
  discovered_count: number;
  qualified_count: number;
  high_intent_count: number;
  no_website_count: number;
  duration_seconds: number;
  status: string;
  started_at: string;
  completed_at?: string;
}


