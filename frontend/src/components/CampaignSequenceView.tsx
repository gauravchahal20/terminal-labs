"use client";

import React, { useState } from "react";
import { 
  Send, 
  Mail, 
  MessageSquare, 
  Share2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Users, 
  BarChart3, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check
} from "lucide-react";
import { Lead } from "@/types";
import { ApiService } from "@/lib/api";

interface CampaignSequenceViewProps {
  leads: Lead[];
  onSelectLead: (leadId: string) => void;
  onOpenEmailSettings: () => void;
}

interface CadenceStep {
  stepNumber: number;
  dayOffset: number;
  channel: "EMAIL" | "LINKEDIN" | "WHATSAPP" | "FOLLOWUP";
  title: string;
  description: string;
  templatePreview: string;
}

const DEFAULT_CADENCE: CadenceStep[] = [
  {
    stepNumber: 1,
    dayOffset: 1,
    channel: "EMAIL",
    title: "Problem-Led Personalized Cold Pitch",
    description: "Referencing observed website status or conversion gaps with tailored Terminal Labs solution offer.",
    templatePreview: "Hi {{firstName}}, I noticed while analyzing {{companyName}}'s digital presence in {{city}} that..."
  },
  {
    stepNumber: 2,
    dayOffset: 3,
    channel: "LINKEDIN",
    title: "Executive InMail & Mutual Connection Touch",
    description: "Brief peer-to-peer connection request highlighting engineering capabilities & case studies.",
    templatePreview: "Hi {{firstName}}, following up on my note regarding {{recommendedService}} for {{companyName}}..."
  },
  {
    stepNumber: 3,
    dayOffset: 5,
    channel: "WHATSAPP",
    title: "WhatsApp Direct Check-in & Demo Preview",
    description: "Concise conversational WhatsApp message linking directly to live demo or workflow prototype.",
    templatePreview: "Hi {{firstName}}, Arjun from Terminal Labs here. Wanted to share a quick 1-min video prototype..."
  },
  {
    stepNumber: 4,
    dayOffset: 8,
    channel: "FOLLOWUP",
    title: "Case Study & ROI Benchmark Breakup",
    description: "Delivering industry-specific ROI metrics and offering open-ended discovery slot.",
    templatePreview: "Hi {{firstName}}, wanted to share how we built automated lead intake for a similar business in {{industry}}..."
  }
];

export const CampaignSequenceView: React.FC<CampaignSequenceViewProps> = ({
  leads,
  onSelectLead,
  onOpenEmailSettings,
}) => {
  const [selectedStep, setSelectedStep] = useState<number>(1);
  const [isBatchSending, setIsBatchSending] = useState(false);
  const [batchResult, setBatchResult] = useState<string | null>(null);

  // Filter approved leads ready for dispatch
  const approvedLeads = leads.filter(l => l.outreach_drafts?.some(d => d.is_approved));
  const pendingApprovalLeads = leads.filter(l => !l.outreach_drafts?.some(d => d.is_approved));

  const handleBatchSendApproved = async () => {
    const draftIds = approvedLeads
      .map(l => l.outreach_drafts?.find(d => d.is_approved)?.id)
      .filter(Boolean) as string[];

    if (draftIds.length === 0) {
      alert("No approved outreach drafts found. Approve leads from the dossier drawer first.");
      return;
    }

    if (!confirm(`Send live cold emails to ${draftIds.length} approved leads from your connected mailbox?`)) return;

    setIsBatchSending(true);
    setBatchResult(null);
    try {
      const res = await ApiService.batchSendEmails(draftIds);
      setBatchResult(`Successfully dispatched ${res.sent_count} emails out of ${res.total_requested} leads.`);
    } catch (err: any) {
      alert(`Batch send error: ${err.message}`);
    } finally {
      setIsBatchSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-[#FCFCF8] border border-[#E2E4DA] rounded-3xl shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E7EEDB] text-[#59664A] font-semibold">
              4-STEP OUTREACH CADENCE
            </span>
            <span className="text-xs text-[#7B7F73]">Automated Drip Sequences</span>
          </div>
          <h2 className="text-2xl font-serif font-medium text-[#252620]">
            Campaign Orchestration & Dispatch
          </h2>
          <p className="text-xs text-[#7B7F73] max-w-xl">
            Multi-touch outreach sequence coordinating Personalized Email, LinkedIn InMail, and WhatsApp follow-ups with strict human approval gates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenEmailSettings}
            className="px-4 py-2 text-xs font-semibold text-[#252620] bg-[#F5F5EF] hover:bg-[#E2E4DA] border border-[#E2E4DA] rounded-xl transition-all flex items-center gap-2"
          >
            <Mail className="w-3.5 h-3.5 text-[#59664A]" />
            <span>Connected Mailbox</span>
          </button>

          <button
            onClick={handleBatchSendApproved}
            disabled={isBatchSending || approvedLeads.length === 0}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#59664A] hover:bg-[#424C37] rounded-xl transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isBatchSending ? "Dispatching..." : `Send Approved Emails (${approvedLeads.length})`}</span>
          </button>
        </div>
      </div>

      {batchResult && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{batchResult}</span>
        </div>
      )}

      {/* Cadence Timeline Sequence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {DEFAULT_CADENCE.map((step) => {
          const isSelected = selectedStep === step.stepNumber;
          const ChannelIcon = 
            step.channel === "EMAIL" ? Mail :
            step.channel === "LINKEDIN" ? Share2 :
            step.channel === "WHATSAPP" ? MessageSquare : Clock;

          return (
            <div
              key={step.stepNumber}
              onClick={() => setSelectedStep(step.stepNumber)}
              className={`editorial-card p-5 cursor-pointer transition-all ${
                isSelected 
                  ? "border-[#59664A] ring-1 ring-[#59664A] bg-[#FCFCF8] shadow-md" 
                  : "bg-[#FCFCF8]/80 hover:bg-[#FCFCF8]"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold ${
                    isSelected ? "bg-[#59664A] text-white" : "bg-[#E7EEDB] text-[#59664A]"
                  }`}>
                    {step.stepNumber}
                  </div>
                  <span className="text-[11px] font-mono font-medium text-[#7B7F73]">
                    Day {step.dayOffset}
                  </span>
                </div>

                <div className="p-1.5 rounded-lg bg-[#F5F5EF] text-[#59664A]">
                  <ChannelIcon className="w-3.5 h-3.5" />
                </div>
              </div>

              <h4 className="text-sm font-serif font-medium text-[#252620] mb-1">
                {step.title}
              </h4>
              <p className="text-[11px] text-[#7B7F73] leading-relaxed line-clamp-2">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Leads Enrolled in Sequence */}
      <div className="editorial-card p-6 space-y-4 bg-[#FCFCF8]">
        <div className="flex items-center justify-between border-b border-[#E2E4DA] pb-4">
          <div className="space-y-0.5">
            <h3 className="font-serif text-lg font-medium text-[#252620]">
              Enrolled Prospects in Outreach Pipeline ({leads.length})
            </h3>
            <p className="text-xs text-[#7B7F73]">
              {approvedLeads.length} leads approved for automated sending • {pendingApprovalLeads.length} pending your review
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" /> {approvedLeads.length} Approved
            </span>
            <span className="flex items-center gap-1.5 text-amber-700 font-semibold px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
              <Clock className="w-3 h-3" /> {pendingApprovalLeads.length} Pending
            </span>
          </div>
        </div>

        {/* Lead List Table */}
        <div className="divide-y divide-[#E2E4DA] overflow-hidden">
          {leads.slice(0, 15).map((lead) => {
            const draft = lead.outreach_drafts?.[0];
            const isApproved = draft?.is_approved;
            const primaryDm = lead.decision_makers?.[0];

            return (
              <div 
                key={lead.id} 
                onClick={() => onSelectLead(lead.id)}
                className="py-3.5 px-2 hover:bg-[#F5F5EF] transition-colors rounded-xl flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E7EEDB] flex items-center justify-center text-[#59664A] text-xs font-serif font-bold">
                    {lead.company_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-[#252620] group-hover:text-[#59664A] transition-colors">
                        {lead.company_name}
                      </h4>
                      <span className="text-[10px] text-[#7B7F73]">({lead.city || lead.country})</span>
                      {lead.website_status === "NO_WEBSITE" && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          NO WEBSITE
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#7B7F73]">
                      Target Service: <strong className="text-[#252620]">{lead.opportunity?.recommended_service || "Web Design"}</strong> • Contact: {primaryDm?.full_name || "Executive"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                    isApproved 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                      : "bg-[#F5F5EF] text-[#7B7F73] border-[#E2E4DA]"
                  }`}>
                    {isApproved ? "READY TO SEND" : "NEEDS APPROVAL"}
                  </span>

                  <ArrowRight className="w-4 h-4 text-[#7B7F73] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
