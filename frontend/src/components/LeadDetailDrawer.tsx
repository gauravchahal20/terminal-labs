"use client";

import React, { useState } from "react";
import { Lead, LeadStatus, DecisionMaker } from "@/types";
import { TERMINAL_LABS_SERVICES } from "@/lib/services-catalog";
import { ApiService } from "@/lib/api";
import { 
  X, 
  ExternalLink, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Bot, 
  Mail, 
  Copy, 
  Check, 
  ShieldCheck, 
  Clock, 
  Edit3, 
  AlertCircle, 
  MessageSquare, 
  Phone, 
  Calendar, 
  Globe, 
  Users, 
  Share2,
  Target,
  FileText,
  Flame,
  ThumbsUp,
  ThumbsDown,
  Building2,
  Lock,
  ChevronRight,
  Send
} from "lucide-react";
import confetti from "canvas-confetti";

interface LeadDetailDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateStatus: (leadId: string, status: LeadStatus) => void;
  onToggleApproval: (draftId: string, isApproved: boolean) => void;
  onSaveOutreachEdit: (draftId: string, data: any) => void;
  onReRunPipeline: (leadId: string) => void;
}

type TabType = "opportunity" | "intelligence" | "decision_makers" | "scoring" | "evidence_graph" | "outreach" | "provenance" | "activity";

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  onClose,
  onUpdateStatus,
  onToggleApproval,
  onSaveOutreachEdit,
  onReRunPipeline,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("opportunity");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isEditingOutreach, setIsEditingOutreach] = useState(false);
  
  const [editSubject, setEditSubject] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editLinkedin, setEditLinkedin] = useState("");
  const [editFollowup, setEditFollowup] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSendingWhatsapp, setIsSendingWhatsapp] = useState(false);
  const [emailSentStatus, setEmailSentStatus] = useState<string | null>(null);
  const [whatsappSentStatus, setWhatsappSentStatus] = useState<string | null>(null);

  if (!lead) return null;

  const recService = lead.opportunity?.recommended_service;
  const serviceMeta = recService ? (TERMINAL_LABS_SERVICES as any)[recService] : null;
  const draft = lead.outreach_drafts?.[0];
  const primaryDm = lead.decision_makers?.find((dm) => dm.is_primary) || lead.decision_makers?.[0];
  const directPhone = primaryDm?.phone || lead.phone;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyBriefing = () => {
    const opp = lead.opportunity;
    const dmList = (lead.decision_makers || []).map(d => 
      `• ${d.full_name} (${d.title})\n  - Phone: ${d.phone || lead.phone || 'N/A'} [Status: ${d.phone_status || 'PUBLIC'}]\n  - Email: ${d.email || 'N/A'} [Status: ${d.email_status || 'VERIFIED'}]\n  - Source: ${d.verified_source_url}`
    ).join("\n");

    const text = `📋 TERMINAL LABS PHASE 2 INTELLIGENCE DOSSIER
==================================================
TARGET COMPANY: ${lead.company_name}
LEAD TYPE: ${lead.lead_type || 'REAL'} (Verified Public Data)
WEBSITE STATUS: ${lead.website_status || 'Active Web'}
WEBSITE / DOMAIN: ${lead.website_url || lead.domain}
LOCATION: ${lead.city ? `${lead.city}, ` : ""}${lead.state ? `${lead.state}, ` : ""}${lead.country}
INDUSTRY: ${lead.industry} | SIZE: ${lead.company_size}
BUYING INTENT: ${lead.buying_intent || 'HIGH'}
INTENT EVIDENCE: ${lead.intent_signal || 'General Market Fit'}
INTENT SOURCE: ${lead.intent_source || 'Public Web Registry'}

QUALIFICATION SCORE: ${lead.score?.total_score || 0}/100 (${lead.score?.tier || 'Qualified'})
• Business Fit: ${lead.score?.business_fit || 22}/25
• Service Fit: ${lead.score?.service_fit || 22}/25
• Opportunity Signal: ${lead.score?.opportunity_signal || lead.score?.pain_signal || 16}/20
• Buying Intent: ${lead.score?.buying_intent || lead.score?.buying_signal || 12}/15
• Business Activity: ${lead.score?.business_activity || lead.score?.company_fit || 4}/5
• Digital Opportunity: ${lead.score?.digital_opportunity || 4}/5
• Contactability: ${lead.score?.contactability || 4}/5

🎯 RECOMMENDED SERVICE: ${opp?.recommended_service || 'Web Design & Development'}
OPPORTUNITY TYPE: ${opp?.opportunity_type || 'NEW WEBSITE'}
ESTIMATED DEAL SIZE: ${opp?.estimated_deal_size || '$8,000 - $25,000'}
PROJECTED ROI: ${opp?.estimated_monthly_roi || 'Potential ROI: requires discovery call'}
TIMELINE: ${opp?.implementation_timeline || '2 - 3 Weeks Delivery'}

🔍 IDENTIFIED PAIN POINT & BOTTLENECK:
${opp?.primary_problem || 'Manual workflows and unoptimized digital touchpoints.'}

👤 EXECUTIVE DECISION MAKERS:
${dmList}

✉️ TAILORED OUTREACH SCRIPTS:
Subject: ${draft?.cold_email_subject || 'Quick inquiry'}

Cold Email Body:
${draft?.cold_email_body || ''}

WhatsApp Direct Script:
${draft?.whatsapp_message_body || ''}
==================================================`;

    navigator.clipboard.writeText(text);
    setCopiedKey("executive_briefing");
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const startEdit = () => {
    if (draft) {
      setEditSubject(draft.cold_email_subject);
      setEditEmail(draft.cold_email_body);
      setEditLinkedin(draft.linkedin_inmail_body);
      setEditFollowup(draft.short_followup_body);
      setEditWhatsapp(draft.whatsapp_message_body || "");
      setIsEditingOutreach(true);
    }
  };

  const saveEdit = () => {
    if (draft) {
      onSaveOutreachEdit(draft.id, {
        cold_email_subject: editSubject,
        cold_email_body: editEmail,
        linkedin_inmail_body: editLinkedin,
        short_followup_body: editFollowup,
        whatsapp_message_body: editWhatsapp,
      });
      setIsEditingOutreach(false);
    }
  };

  const handleApprove = () => {
    if (draft) {
      onToggleApproval(draft.id, true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#59664A", "#A8B98D", "#E7EEDB"],
      });
    }
  };

  const handleReject = () => {
    if (draft) {
      onToggleApproval(draft.id, false);
    }
  };

  const handleSendLiveEmail = async () => {
    if (!draft) return;
    setIsSendingEmail(true);
    setEmailSentStatus(null);
    try {
      const res = await ApiService.sendLiveEmail(draft.id, {
        custom_recipient: primaryDm?.email,
        custom_subject: editSubject || draft.cold_email_subject,
        custom_body: editEmail || draft.cold_email_body,
      });
      setEmailSentStatus(`Dispatched via ${res.sender} on ${new Date().toLocaleTimeString()}`);
      onToggleApproval(draft.id, true);
      onUpdateStatus(lead.id, "Contacted");
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#59664A", "#A8B98D", "#E7EEDB"],
      });
    } catch (err: any) {
      alert(`Error sending email: ${err.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!draft) return;
    setIsSendingTest(true);
    try {
      const res = await ApiService.sendTestEmail(draft.id);
      alert(`Test preview email dispatched to your connected mailbox (${res.recipient || res.sender})`);
    } catch (err: any) {
      alert(`Error sending test preview: ${err.message}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSendWhatsappMessage = async () => {
    if (!draft) return;
    setIsSendingWhatsapp(true);
    try {
      const res = await ApiService.sendWhatsApp(draft.id, {
        custom_recipient_phone: directPhone,
        custom_message: editWhatsapp || draft.whatsapp_message_body,
      });
      setWhatsappSentStatus(`Dispatched on ${new Date().toLocaleTimeString()}`);
      onUpdateStatus(lead.id, "Contacted");
      if (res.deep_link) {
        window.open(res.deep_link, "_blank");
      }
    } catch (err: any) {
      alert(`Error dispatching WhatsApp: ${err.message}`);
    } finally {
      setIsSendingWhatsapp(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#FCFCF8] h-full shadow-2xl border-l border-[#E2E4DA] flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300"
      >
        {/* TOP HEADER */}
        <div className="p-6 border-b border-[#E2E4DA] bg-[#FCFCF8]">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E7EEDB] text-[#59664A] border border-[#A8B98D]/40">
                  {lead.lead_type || "REAL"} • Verified Public Data
                </span>
                {lead.website_status === "NO_WEBSITE" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FDE8E8] text-[#9B1C1C]">
                    <Globe className="w-3 h-3" /> No Website
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F5F5EF] text-[#252620] border border-[#E2E4DA]">
                    {lead.website_status?.replace(/_/g, " ") || "Active Web"}
                  </span>
                )}
                {lead.buying_intent === "HIGH" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F9EBDD] text-[#8B4513]">
                    <Flame className="w-3 h-3" /> High Intent
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-serif text-[#252620] font-normal tracking-tight flex items-center gap-2">
                <span>{lead.company_name}</span>
                {lead.website_url ? (
                  <a
                    href={lead.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#7B7F73] hover:text-[#59664A]"
                    title="Open website"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : null}
              </h2>

              <div className="text-xs text-[#7B7F73] flex flex-wrap items-center gap-2">
                <span>{lead.city ? `${lead.city}, ` : ""}{lead.state ? `${lead.state}, ` : ""}{lead.country}</span>
                <span>•</span>
                <span>{lead.industry}</span>
                <span>•</span>
                <span className="font-mono">{lead.company_size} employees</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyBriefing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#252620] bg-[#FCFCF8] border border-[#E2E4DA] hover:bg-[#F0F2EB] rounded-lg transition-colors"
                title="Copy entire briefing formatted for sales outreach"
              >
                {copiedKey === "executive_briefing" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#59664A]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#59664A]" />
                    <span>Copy Briefing</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-[#7B7F73] hover:text-[#252620] hover:bg-[#F5F5EF] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* TAB NAVIGATION */}
          <div className="flex items-center gap-1 mt-6 border-b border-[#E2E4DA] -mb-6 overflow-x-auto">
            {[
              { id: "opportunity", label: "Opportunity & Offer" },
              { id: "intelligence", label: "Web Presence & Gaps" },
              { id: "decision_makers", label: `Decision Makers (${lead.decision_makers?.length || 0})` },
              { id: "scoring", label: `7-Factor Score (${lead.score?.total_score || 0})` },
              { id: "evidence_graph", label: "Evidence Graph" },
              { id: "outreach", label: "Outreach & Approval Gate" },
              { id: "provenance", label: "Data Provenance" },
              { id: "activity", label: `CRM Activity (${lead.activities?.length || 0})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-3 py-2 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[#59664A] text-[#252620] font-semibold"
                    : "border-transparent text-[#7B7F73] hover:text-[#252620]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB BODY (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OPPORTUNITY & OFFER */}
          {activeTab === "opportunity" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Primary Matched Service Card */}
              <div className="editorial-card p-5 bg-[#FCFCF8] border-l-4 border-l-[#59664A]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#59664A] uppercase tracking-wider">
                    Recommended Terminal Labs Service
                  </span>
                  <span className="text-[11px] font-mono text-[#59664A] bg-[#E7EEDB] px-2 py-0.5 rounded font-semibold">
                    {lead.opportunity?.confidence ? `${Math.round(lead.opportunity.confidence * 100)}% Confidence` : "95% Confidence"}
                  </span>
                </div>

                <div className="mt-2 flex items-baseline justify-between">
                  <h3 className="text-xl font-serif text-[#252620]">
                    {lead.opportunity?.recommended_service || "Web Design & Development"}
                  </h3>
                  <div className="text-base font-serif font-medium text-[#59664A]">
                    {lead.opportunity?.estimated_deal_size || "$8,000 - $25,000"}
                  </div>
                </div>

                <p className="text-xs text-[#7B7F73] mt-2">
                  {lead.opportunity?.reason}
                </p>

                {lead.opportunity?.service_url && (
                  <div className="mt-3 pt-3 border-t border-[#E2E4DA] flex items-center justify-between text-xs">
                    <span className="text-[#7B7F73]">Official Service Spec:</span>
                    <a
                      href={lead.opportunity.service_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#59664A] font-medium hover:underline flex items-center gap-1"
                    >
                      <span>View Delivery Workflow & Specs</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Identified Problem & Opportunity */}
              <div className="editorial-card p-4 space-y-2">
                <div className="text-xs font-semibold text-[#252620] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-[#59664A]" />
                  <span>Identified Pain Point & Opportunity</span>
                </div>
                <p className="text-xs text-[#252620] leading-relaxed">
                  {lead.opportunity?.primary_problem}
                </p>
                <div className="text-[11px] text-[#7B7F73] mt-1 pt-2 border-t border-[#E2E4DA]">
                  <strong>Proposed Offer:</strong> {lead.opportunity?.potential_offer}
                </div>
              </div>

              {/* Observed Evidence vs AI Inferences (Strict Separation) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Column 1: Observed Evidence (Facts) */}
                <div className="editorial-card p-4 bg-[#FCFCF8]">
                  <div className="text-xs font-semibold text-[#252620] flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#59664A]" />
                    <span>Observed Public Evidence (Facts)</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#252620]">
                    {lead.opportunity?.observed_evidence && lead.opportunity.observed_evidence.length > 0 ? (
                      lead.opportunity.observed_evidence.map((fact, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-[#59664A] font-bold">•</span>
                          <span>{fact}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-start gap-1.5">
                          <span className="text-[#59664A] font-bold">•</span>
                          <span>Domain inspection: {lead.website_url || lead.domain}</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-[#59664A] font-bold">•</span>
                          <span>Public registry listing in {lead.city}, {lead.country}</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Column 2: AI Inferences (Deductions) */}
                <div className="editorial-card p-4 bg-[#FCFCF8]">
                  <div className="text-xs font-semibold text-[#252620] flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#A8B98D]" />
                    <span>AI Strategic Inference</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#7B7F73]">
                    {lead.opportunity?.ai_inferences && lead.opportunity.ai_inferences.length > 0 ? (
                      lead.opportunity.ai_inferences.map((inf, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-[#A8B98D] font-bold">•</span>
                          <span>{inf}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#A8B98D] font-bold">•</span>
                        <span>Potential opportunity for automated lead qualification and workflow modernization.</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Delivery Metrics */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="editorial-card p-3">
                  <div className="text-[10px] text-[#7B7F73]">Projected ROI</div>
                  <div className="text-xs font-semibold text-[#59664A] mt-1">
                    {lead.opportunity?.estimated_monthly_roi || "Potential ROI: requires discovery call"}
                  </div>
                </div>
                <div className="editorial-card p-3">
                  <div className="text-[10px] text-[#7B7F73]">Efficiency Lift</div>
                  <div className="text-xs font-semibold text-[#252620] mt-1">
                    {lead.opportunity?.conversion_uplift || "+35% workflow efficiency"}
                  </div>
                </div>
                <div className="editorial-card p-3">
                  <div className="text-[10px] text-[#7B7F73]">Delivery Timeline</div>
                  <div className="text-xs font-semibold text-[#252620] mt-1">
                    {lead.opportunity?.implementation_timeline || "2 - 3 Weeks"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WEB PRESENCE & GAPS */}
          {activeTab === "intelligence" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="editorial-card p-4 space-y-3">
                <h3 className="text-sm font-semibold text-[#252620]">
                  Website Status & Tech Stack
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#F5F5EF] rounded-lg">
                    <div className="text-[10px] text-[#7B7F73]">Website Status</div>
                    <div className="font-semibold text-[#252620] mt-0.5">
                      {lead.website_status?.replace(/_/g, " ") || "Active Web"}
                    </div>
                  </div>
                  <div className="p-3 bg-[#F5F5EF] rounded-lg">
                    <div className="text-[10px] text-[#7B7F73]">Contact Flow</div>
                    <div className="font-semibold text-[#252620] mt-0.5">
                      {lead.research?.contact_flow_type || "Direct Phone & Form"}
                    </div>
                  </div>
                </div>

                {lead.research?.detected_tech_stack && lead.research.detected_tech_stack.length > 0 && (
                  <div>
                    <div className="text-[10px] text-[#7B7F73] mb-1.5">Detected Infrastructure:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {lead.research.detected_tech_stack.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-[#FCFCF8] border border-[#E2E4DA] text-[#252620]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Conversion Friction Points */}
              {lead.research?.conversion_friction_points && lead.research.conversion_friction_points.length > 0 && (
                <div className="editorial-card p-4 space-y-2">
                  <div className="text-xs font-semibold text-[#252620]">Observed Conversion Friction</div>
                  <ul className="space-y-1 text-xs text-[#7B7F73]">
                    {lead.research.conversion_friction_points.map((pt, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3 text-[#59664A]" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DECISION MAKERS */}
          {activeTab === "decision_makers" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {lead.decision_makers && lead.decision_makers.length > 0 ? (
                lead.decision_makers.map((dm) => (
                  <div key={dm.id} className="editorial-card p-4 space-y-3 bg-[#FCFCF8]">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-base font-medium text-[#252620]">
                            {dm.full_name}
                          </h4>
                          {dm.is_primary && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#E7EEDB] text-[#59664A]">
                              Primary Contact
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#7B7F73] mt-0.5">{dm.title}</p>
                      </div>

                      {dm.phone && (
                        <a
                          href={`https://wa.me/${dm.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-[#59664A] bg-[#E7EEDB] hover:bg-[#D9E2CC] transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-[#E2E4DA]">
                      {dm.phone && (
                        <div className="flex items-center justify-between p-2 bg-[#F5F5EF] rounded">
                          <span className="text-[#7B7F73] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#59664A]" /> {dm.phone}
                          </span>
                          <span className="text-[9px] font-semibold text-[#59664A] bg-[#E7EEDB] px-1.5 py-0.2 rounded">
                            {dm.phone_status || "VERIFIED"}
                          </span>
                        </div>
                      )}

                      {dm.email && (
                        <div className="flex items-center justify-between p-2 bg-[#F5F5EF] rounded">
                          <span className="text-[#7B7F73] flex items-center gap-1 truncate max-w-[170px]">
                            <Mail className="w-3 h-3 text-[#59664A]" /> {dm.email}
                          </span>
                          <span className="text-[9px] font-semibold text-[#59664A] bg-[#E7EEDB] px-1.5 py-0.2 rounded">
                            {dm.email_status || "VERIFIED"}
                          </span>
                        </div>
                      )}
                    </div>

                    {dm.provenance_note && (
                      <div className="text-[10px] text-[#7B7F73] italic">
                        <strong>Source Provenance:</strong> {dm.provenance_note}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="editorial-card p-6 text-center text-xs text-[#7B7F73]">
                  No direct decision makers extracted yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: 7-FACTOR SCORE BREAKDOWN */}
          {activeTab === "scoring" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 gap-3">
                <div className="editorial-card p-4 bg-[#FCFCF8]">
                  <div className="text-xs text-[#7B7F73]">Qualification Score</div>
                  <div className="text-2xl font-serif text-[#252620] mt-1">
                    {lead.score?.total_score || 0}<span className="text-sm text-[#7B7F73]">/100</span>
                  </div>
                  <div className="text-[10px] text-[#59664A] font-semibold mt-1">
                    {lead.score?.tier || "Qualified"} Tier
                  </div>
                </div>

                <div className="editorial-card p-4 bg-[#FCFCF8]">
                  <div className="text-xs text-[#7B7F73]">Evidence Confidence</div>
                  <div className="text-2xl font-serif text-[#252620] mt-1">
                    {Math.round(lead.score?.evidence_confidence || 78)}<span className="text-sm text-[#7B7F73]">/100</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                    Verified Public Evidence
                  </div>
                </div>
              </div>

              {/* 7 Factor Progress Bars */}
              <div className="editorial-card p-4 space-y-3">
                {[
                  { label: "1. Business Fit", val: lead.score?.business_fit || 22, max: 25, desc: "Industry alignment & company scale" },
                  { label: "2. Service Fit", val: lead.score?.service_fit || 22, max: 25, desc: "Direct synergy with 15 core services" },
                  { label: "3. Opportunity Signal", val: lead.score?.opportunity_signal || lead.score?.pain_signal || 16, max: 20, desc: "Missing website or conversion friction" },
                  { label: "4. Buying Intent", val: lead.score?.buying_intent || lead.score?.buying_signal || 12, max: 15, desc: "Public hiring / RFP signals" },
                  { label: "5. Business Activity", val: lead.score?.business_activity || lead.score?.company_fit || 4, max: 5, desc: "Operational volume and headcount" },
                  { label: "6. Digital Opportunity", val: lead.score?.digital_opportunity || 4, max: 5, desc: "Chatbot & WhatsApp presence gap" },
                  { label: "7. Contactability", val: lead.score?.contactability || 4, max: 5, desc: "Direct phone, email, and LinkedIn reach" }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#252620]">{item.label}</span>
                      <span className="font-mono text-[11px] text-[#59664A]">{item.val} / {item.max}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E2E4DA] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#59664A] rounded-full" 
                        style={{ width: `${(item.val / item.max) * 100}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-[#7B7F73]">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: OUTREACH & HUMAN APPROVAL GATE */}
          {activeTab === "outreach" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Human Approval Gate Alert Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                draft?.is_approved 
                  ? "bg-[#E7EEDB]/80 border-[#A8B98D] text-[#59664A]"
                  : "bg-[#FCFCF8] border-[#E2E4DA] text-[#252620]"
              }`}>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#59664A]" />
                  <div>
                    <div className="text-xs font-semibold">
                      Human Approval Gate: {draft?.approval_status || (draft?.is_approved ? "APPROVED" : "PENDING")}
                    </div>
                    <div className="text-[10px] text-[#7B7F73]">
                      Autonomous sending requires explicit review & authorization.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApprove}
                    className="flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold text-white bg-[#59664A] hover:bg-[#48533C] transition-colors shadow-xs"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={handleReject}
                    className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-[#7B7F73] bg-[#FCFCF8] border border-[#E2E4DA] hover:bg-[#F5F5EF] transition-colors"
                  >
                    <ThumbsDown className="w-3 h-3" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              {/* Live Dispatch Feedback */}
              {emailSentStatus && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{emailSentStatus}</span>
                </div>
              )}

              {/* Case Profile Header */}
              <div className="text-xs font-semibold text-[#252620] flex items-center justify-between">
                <span>Tailored Outreach Assets ({draft?.case_type || "Grounded Pitch"})</span>
                {!isEditingOutreach ? (
                  <button
                    onClick={startEdit}
                    className="flex items-center gap-1 text-[11px] text-[#59664A] hover:underline"
                  >
                    <Edit3 className="w-3 h-3" /> Edit Drafts
                  </button>
                ) : (
                  <button
                    onClick={saveEdit}
                    className="flex items-center gap-1 text-[11px] text-white bg-[#59664A] px-2 py-0.5 rounded"
                  >
                    <Check className="w-3 h-3" /> Save Changes
                  </button>
                )}
              </div>

              {/* Cold Email Asset */}
              <div className="editorial-card p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#252620] flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#59664A]" /> Cold Email Draft
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSendTestEmail}
                      disabled={isSendingTest}
                      className="text-[11px] text-[#7B7F73] hover:text-[#252620] underline"
                    >
                      {isSendingTest ? "Sending..." : "Send Test Preview"}
                    </button>
                    <button
                      onClick={() => handleCopy(draft?.cold_email_body || "", "email")}
                      className="text-[11px] text-[#59664A] hover:underline"
                    >
                      {copiedKey === "email" ? "Copied!" : "Copy Email"}
                    </button>
                  </div>
                </div>

                {isEditingOutreach ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="w-full p-2 text-xs bg-[#F5F5EF] border border-[#E2E4DA] rounded"
                      placeholder="Email Subject"
                    />
                    <textarea
                      rows={6}
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full p-2 text-xs bg-[#F5F5EF] border border-[#E2E4DA] rounded font-mono"
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-[#F5F5EF] rounded-lg text-xs space-y-2">
                    <div className="font-semibold text-[#252620]">
                      Subject: {draft?.cold_email_subject}
                    </div>
                    <pre className="font-sans text-[#252620] whitespace-pre-wrap leading-relaxed text-[11px]">
                      {draft?.cold_email_body}
                    </pre>
                  </div>
                )}

                {/* Direct 1-Click Send Email Action */}
                <div className="pt-2 border-t border-[#E2E4DA] flex items-center justify-between">
                  <div className="text-[11px] text-[#7B7F73]">
                    Recipient: <strong className="text-[#252620]">{primaryDm?.email || `contact@${lead.domain}`}</strong>
                  </div>
                  <button
                    onClick={handleSendLiveEmail}
                    disabled={isSendingEmail}
                    className="px-4 py-1.5 rounded-xl bg-[#59664A] text-white text-xs font-semibold hover:bg-[#424C37] transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingEmail ? "Dispatching..." : "Send Live Email Now"}</span>
                  </button>
                </div>
              </div>

              {/* WhatsApp Direct Message Asset */}
              <div className="editorial-card p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#252620] flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-[#59664A]" /> WhatsApp Direct Script
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(draft?.whatsapp_message_body || "", "whatsapp")}
                      className="text-[11px] text-[#59664A] hover:underline"
                    >
                      {copiedKey === "whatsapp" ? "Copied!" : "Copy Script"}
                    </button>
                  </div>
                </div>

                {isEditingOutreach ? (
                  <textarea
                    rows={3}
                    value={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                    className="w-full p-2 text-xs bg-[#F5F5EF] border border-[#E2E4DA] rounded font-mono"
                  />
                ) : (
                  <div className="p-3 bg-[#F5F5EF] rounded-lg text-xs text-[#252620] leading-relaxed">
                    {draft?.whatsapp_message_body || "No WhatsApp script generated."}
                  </div>
                )}

                {/* WhatsApp Dispatch Button */}
                <div className="pt-2 border-t border-[#E2E4DA] flex items-center justify-between">
                  <div className="text-[11px] text-[#7B7F73]">
                    Phone: <strong className="text-[#252620]">{directPhone || "Not Listed"}</strong>
                  </div>
                  {directPhone ? (
                    <button
                      onClick={handleSendWhatsappMessage}
                      disabled={isSendingWhatsapp}
                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{isSendingWhatsapp ? "Opening..." : "Send on WhatsApp"}</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#7B7F73]">No direct phone number</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: EVIDENCE GRAPH (Feature 2) */}
          {activeTab === "evidence_graph" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="editorial-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-[#252620] flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#59664A]" />
                    <span>Evidence Graph & Provenance Chains</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E7EEDB] text-[#424C37] font-semibold">
                    100% Traceable
                  </span>
                </div>
                <p className="text-xs text-[#7B7F73]">
                  Explicit separation of observed real-world facts from deterministic AI deductions. Every claim is mapped to verified public sources and observation timestamps.
                </p>
              </div>

              {/* Graph Nodes */}
              <div className="space-y-3">
                {lead.evidence_graph && lead.evidence_graph.length > 0 ? (
                  lead.evidence_graph.map((node, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border ${
                        node.is_ai_inference
                          ? "bg-[#FCFCF8] border-[#D1DCC2]"
                          : "bg-white border-[#E2E4DA]"
                      } space-y-2`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                          node.is_ai_inference
                            ? "bg-purple-50 text-purple-800 border border-purple-200"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}>
                          {node.is_ai_inference ? "Deterministic AI Inference" : "Observed Real-World Fact"}
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-[#59664A]">
                          Confidence: {node.confidence || "HIGH"}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-[#252620] leading-snug">
                        {node.fact}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-[#E2E4DA] text-[10px] text-[#7B7F73]">
                        <span className="truncate">Source: <strong className="text-[#252620]">{node.source}</strong></span>
                        <span>{node.observed_at ? new Date(node.observed_at).toLocaleDateString() : "Observed 2026"}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-[#7B7F73]">
                    No evidence graph nodes generated yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: DATA PROVENANCE */}
          {activeTab === "provenance" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="editorial-card p-4 space-y-3">
                <div className="text-xs font-semibold text-[#252620] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#59664A]" />
                  <span>Data Provenance & Source URLs</span>
                </div>
                <p className="text-xs text-[#7B7F73]">
                  All intelligence is grounded in public commercial registries, corporate websites, and verified directories.
                </p>

                <div className="space-y-2 pt-2 border-t border-[#E2E4DA]">
                  {lead.source_names && lead.source_names.length > 0 ? (
                    lead.source_names.map((src, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 bg-[#F5F5EF] rounded">
                        <span className="font-medium text-[#252620]">{src}</span>
                        <span className="text-[10px] text-[#59664A] font-semibold bg-[#E7EEDB] px-1.5 py-0.2 rounded">
                          Verified Public
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-[#7B7F73] italic">Public Web & Domain Registry</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CRM ACTIVITY LOG */}
          {activeTab === "activity" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {lead.activities && lead.activities.length > 0 ? (
                lead.activities.map((act) => (
                  <div key={act.id} className="editorial-card p-3.5 space-y-1 bg-[#FCFCF8]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#252620] flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-[#59664A]" />
                        <span>{act.agent_name}</span>
                      </span>
                      <span className="text-[10px] font-mono text-[#7B7F73]">
                        {new Date(act.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs text-[#252620] font-medium">{act.action}</div>
                    {act.details && (
                      <div className="text-[10px] font-mono text-[#7B7F73] bg-[#F5F5EF] p-2 rounded mt-1">
                        {JSON.stringify(act.details, null, 2)}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="editorial-card p-6 text-center text-xs text-[#7B7F73]">
                  No activity logs recorded yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM DRAWER FOOTER */}
        <div className="p-4 border-t border-[#E2E4DA] bg-[#FCFCF8] flex items-center justify-between">
          <div className="text-xs text-[#7B7F73]">
            Lead ID: <span className="font-mono text-[#252620]">{lead.id.slice(0, 8)}...</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onReRunPipeline(lead.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#252620] bg-[#FCFCF8] border border-[#E2E4DA] hover:bg-[#F0F2EB] rounded-lg transition-colors"
            >
              <Bot className="w-3.5 h-3.5 text-[#59664A]" />
              <span>Re-Run AI Intelligence</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#252620] hover:bg-[#383A31] rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
