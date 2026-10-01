"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Zap,
  Target,
  Clock,
  ArrowRight,
  Search,
  CheckCircle2,
  AlertTriangle,
  Send,
  MessageSquare,
  Users,
  Compass,
  RefreshCw,
  Bookmark,
  Building2,
  ChevronRight,
  ShieldCheck,
  Flame,
  ThumbsUp,
  ThumbsDown,
  Layers,
  Copy,
  Plus
} from "lucide-react";
import { ApiService } from "@/lib/api";
import { CockpitTodayData, Lead, SavedSearchItem } from "@/types";

interface SalesCockpitViewProps {
  onSelectLead: (leadId: string) => void;
  onOpenOutreach?: (leadId: string) => void;
  onOpenDiscovery?: () => void;
}

export const SalesCockpitView: React.FC<SalesCockpitViewProps> = ({
  onSelectLead,
  onOpenOutreach,
  onOpenDiscovery
}) => {
  const [cockpitData, setCockpitData] = useState<CockpitTodayData | null>(null);
  const [savedSearches, setSavedSearches] = useState<SavedSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Natural Language Search State
  const [nlQuery, setNlQuery] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [nlResult, setNlResult] = useState<any>(null);

  // Lookalike State
  const [lookalikeLead, setLookalikeLead] = useState<any>(null);
  const [lookalikeCandidates, setLookalikeCandidates] = useState<any[]>([]);
  const [isLoadingLookalikes, setIsLoadingLookalikes] = useState(false);

  // Saved Search Modal / Input
  const [isSavingSearch, setIsSavingSearch] = useState(false);
  const [newSearchTitle, setNewSearchTitle] = useState("");

  useEffect(() => {
    loadCockpit();
  }, []);

  const loadCockpit = async () => {
    setIsLoading(true);
    try {
      const [todayRes, savedRes] = await Promise.all([
        ApiService.getTodayCockpit(),
        ApiService.getSavedSearches().catch(() => [])
      ]);
      setCockpitData(todayRes);
      setSavedSearches(savedRes || []);
    } catch (err) {
      console.error("Failed to load cockpit:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskNaturalLanguage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nlQuery.trim()) return;

    setIsAsking(true);
    try {
      const res = await ApiService.askNaturalLanguage(nlQuery.trim());
      setNlResult(res);
    } catch (err) {
      console.error("Error asking AI:", err);
    } finally {
      setIsAsking(false);
    }
  };

  const handleFindLookalikes = async (leadId: string, companyName: string) => {
    setIsLoadingLookalikes(true);
    setLookalikeLead(companyName);
    try {
      const res = await ApiService.getLookalikes(leadId);
      setLookalikeCandidates(res.lookalike_candidates || []);
    } catch (err) {
      console.error("Error fetching lookalikes:", err);
      setLookalikeCandidates([]);
    } finally {
      setIsLoadingLookalikes(false);
    }
  };

  const handleApproveDraft = async (draftId: string) => {
    try {
      await ApiService.toggleOutreachApproval(draftId, true);
      loadCockpit();
    } catch (err) {
      console.error("Error approving draft:", err);
    }
  };

  const handleFeedback = async (leadId: string, type: string) => {
    try {
      await ApiService.submitFeedback(leadId, type);
      loadCockpit();
    } catch (err) {
      console.error("Error saving feedback:", err);
    }
  };

  const handleSaveCurrentSearch = async () => {
    if (!newSearchTitle.trim()) return;
    try {
      await ApiService.createSavedSearch({
        title: newSearchTitle.trim(),
        keywords: nlQuery || undefined,
        auto_monitor: true
      });
      setIsSavingSearch(false);
      setNewSearchTitle("");
      const updatedSaved = await ApiService.getSavedSearches();
      setSavedSearches(updatedSaved);
    } catch (err) {
      console.error("Error saving search:", err);
    }
  };

  const summary = cockpitData?.summary || {
    actionable_leads_count: 0,
    buying_signals_count: 0,
    pending_approvals_count: 0,
    verifications_needed_count: 0,
    total_active_pipeline: 0
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. SALES COCKPIT MISSION BANNER */}
      <div className="bg-[#FCFCF8] border border-[#E2E4DA] rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wide uppercase bg-[#E7EEDB] text-[#424C37] border border-[#D1DCC2] flex items-center gap-1">
                <Target className="w-3 h-3 text-[#59664A]" />
                Daily Sales Cockpit
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-600" />
                {summary.actionable_leads_count} Hot Opportunities Today
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#252620] tracking-tight">
              Action Center: What Matters Today
            </h1>
            <p className="text-xs text-[#7B7F73] leading-relaxed">
              Prioritized execution dashboard. Focus only on high-fit prospects with active buying signals, verified contacts, and outreach waiting for human approval.
            </p>
          </div>

          <button
            onClick={loadCockpit}
            disabled={isLoading}
            className="px-3.5 py-2 bg-[#F5F5EF] hover:bg-[#E7EEDB] border border-[#E2E4DA] rounded-xl text-xs font-medium text-[#252620] flex items-center gap-2 self-start transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh Cockpit</span>
          </button>
        </div>

        {/* Action Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#E2E4DA]">
          <div className="bg-white p-3.5 rounded-xl border border-[#E2E4DA]">
            <div className="text-[10px] font-mono text-[#59664A] uppercase font-semibold">High-Fit Leads</div>
            <div className="text-xl font-bold font-serif text-[#252620] mt-0.5">{summary.actionable_leads_count}</div>
            <div className="text-[10px] text-[#7B7F73] mt-0.5">Score ≥ 70 / Ready for Pitch</div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-[#E2E4DA]">
            <div className="text-[10px] font-mono text-rose-700 uppercase font-semibold">Buying Signals</div>
            <div className="text-xl font-bold font-serif text-rose-700 mt-0.5">{summary.buying_signals_count}</div>
            <div className="text-[10px] text-[#7B7F73] mt-0.5">Public RFPs & Dev Hiring</div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-[#E2E4DA]">
            <div className="text-[10px] font-mono text-blue-700 uppercase font-semibold">Pending Approvals</div>
            <div className="text-xl font-bold font-serif text-blue-700 mt-0.5">{summary.pending_approvals_count}</div>
            <div className="text-[10px] text-[#7B7F73] mt-0.5">Awaiting Human Gate</div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-[#E2E4DA]">
            <div className="text-[10px] font-mono text-amber-700 uppercase font-semibold">Total Pipeline</div>
            <div className="text-xl font-bold font-serif text-amber-700 mt-0.5">{summary.total_active_pipeline}</div>
            <div className="text-[10px] text-[#7B7F73] mt-0.5">Active In-Flight Accounts</div>
          </div>
        </div>
      </div>

      {/* 2. ASK TERMINAL LABS (NATURAL LANGUAGE PROSPECTOR) */}
      <div className="bg-[#FCFCF8] border border-[#E2E4DA] rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-[#252620] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#59664A]" />
            <span>Ask Terminal Labs (Natural Language Prospecting Engine)</span>
          </div>
          <span className="text-[10px] font-mono text-[#7B7F73]">AI Filter Parser</span>
        </div>

        <form onSubmit={handleAskNaturalLanguage} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#7B7F73] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ask in plain English (e.g. 'Find dental clinics in Chandigarh without website', 'Find 50 US SaaS hiring remote engineers')"
              value={nlQuery}
              onChange={(e) => setNlQuery(e.target.value)}
              className="w-full text-xs bg-white border border-[#E2E4DA] rounded-xl pl-9 pr-4 py-2.5 text-[#252620] focus:outline-none focus:border-[#59664A]"
            />
          </div>
          <button
            type="submit"
            disabled={isAsking || !nlQuery.trim()}
            className="px-5 py-2.5 bg-[#59664A] hover:bg-[#47523B] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shrink-0"
          >
            {isAsking ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Interpreting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Search</span>
              </>
            )}
          </button>
        </form>

        {/* Natural Language Interpretation Result */}
        {nlResult && (
          <div className="bg-white border border-[#E2E4DA] rounded-xl p-4 mt-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#E7EEDB] text-[#424C37]">
                  Parsed Filter: {nlResult.interpreted_filter.category} in {nlResult.interpreted_filter.city !== "All" ? nlResult.interpreted_filter.city : nlResult.interpreted_filter.country}
                </span>
                {nlResult.interpreted_filter.website_status !== "All" && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                    {nlResult.interpreted_filter.website_status}
                  </span>
                )}
                {nlResult.interpreted_filter.buying_intent !== "All" && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    High Intent
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-[#59664A]">
                {nlResult.total_results} Matches Found
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {nlResult.businesses.slice(0, 4).map((b: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded-lg border border-[#E2E4DA] bg-[#FCFCF8] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[#252620]">{b.company_name}</div>
                    <div className="text-[10px] text-[#7B7F73]">
                      {b.city}, {b.country} • {b.potential_opportunity}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-serif font-bold text-[#59664A]">{b.lead_score} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. TODAY'S PRIORITY HIGH-FIT LEADS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-[#252620] flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-600" />
            <span>High-Fit Accounts Requiring Action (Next Best Action)</span>
          </div>
          <span className="text-[10px] font-mono text-[#7B7F73]">
            {cockpitData?.high_fit_leads.length || 0} Ready Prospects
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cockpitData?.high_fit_leads.map((lead, idx) => (
            <div
              key={idx}
              className="bg-[#FCFCF8] border border-[#E2E4DA] hover:border-[#59664A]/60 rounded-2xl p-5 shadow-sm transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-[#252620] font-serif leading-tight">
                      {lead.company_name}
                    </h3>
                    <div className="text-xs text-[#7B7F73] mt-0.5">
                      {lead.category} • {lead.city}, {lead.country}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-bold font-serif text-[#59664A]">
                      {lead.score} <span className="text-[10px] text-[#7B7F73] font-normal">/ 100</span>
                    </div>
                  </div>
                </div>

                {/* Next Best Action Badge */}
                <div className="bg-[#E7EEDB] border border-[#D1DCC2] rounded-xl p-2.5 text-xs text-[#252620] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#424C37] flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#59664A]" />
                      Next Best Action: {lead.next_best_action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-[#59664A]">
                      {lead.recommended_service}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#555E47] leading-snug">
                    {lead.next_best_action_reason}
                  </div>
                </div>

                {/* Why This Lead */}
                {lead.why_this_lead && (
                  <div className="text-[11px] text-[#7B7F73] leading-snug">
                    <span className="font-semibold text-[#252620]">Why This Lead: </span>
                    {lead.why_this_lead}
                  </div>
                )}
              </div>

              {/* Action Buttons & Feedback */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E2E4DA]">
                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    onClick={() => handleFeedback(lead.id, "GOOD_LEAD")}
                    className="p-1.5 rounded-lg border border-[#E2E4DA] hover:bg-emerald-50 text-[#7B7F73] hover:text-emerald-700 transition-colors"
                    title="Mark Good Lead (+5 score)"
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleFeedback(lead.id, "BAD_LEAD")}
                    className="p-1.5 rounded-lg border border-[#E2E4DA] hover:bg-rose-50 text-[#7B7F73] hover:text-rose-700 transition-colors"
                    title="Mark Bad Lead (-15 score)"
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleFindLookalikes(lead.id, lead.company_name)}
                    className="px-2 py-1 rounded-lg border border-[#E2E4DA] hover:bg-[#F5F5EF] text-[10px] font-medium text-[#7B7F73] hover:text-[#252620] flex items-center gap-1 transition-colors"
                    title="Find Lookalike Prospects"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Lookalikes</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectLead(lead.id)}
                    className="px-3 py-1.5 bg-[#252620] hover:bg-black text-white text-[11px] font-semibold rounded-lg transition-all"
                  >
                    View Dossier
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. LOOKALIKE PROSPECTS POPUP / PANEL */}
      {lookalikeLead && (
        <div className="bg-[#FCFCF8] border border-[#59664A] rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#E7EEDB] text-[#424C37]">
                Feature 7: Lookalike Prospects
              </span>
              <span className="text-xs font-semibold text-[#252620]">
                Companies Similar to {lookalikeLead}
              </span>
            </div>
            <button
              onClick={() => setLookalikeLead(null)}
              className="text-xs text-[#7B7F73] hover:text-[#252620]"
            >
              Close
            </button>
          </div>

          {isLoadingLookalikes ? (
            <div className="p-6 text-center text-xs text-[#7B7F73]">
              <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-[#59664A]" />
              Finding similar prospects...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {lookalikeCandidates.map((cand, idx) => (
                <div key={idx} className="p-3 bg-white border border-[#E2E4DA] rounded-xl text-xs space-y-1">
                  <div className="font-semibold text-[#252620] truncate">{cand.company_name}</div>
                  <div className="text-[10px] text-[#7B7F73] truncate">
                    {cand.city}, {cand.country} • {cand.category}
                  </div>
                  <div className="text-[10px] text-[#59664A] font-semibold">
                    {cand.potential_opportunity}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. BUYING SIGNALS & APPROVALS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Buying Signals */}
        <div className="bg-[#FCFCF8] border border-[#E2E4DA] rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-[#252620] flex items-center gap-2">
              <Zap className="w-4 h-4 text-rose-600" />
              <span>Verified Public Buying Signals</span>
            </div>
            <span className="text-[10px] font-mono text-[#7B7F73]">
              {cockpitData?.active_buying_signals.length || 0} Signals
            </span>
          </div>

          <div className="space-y-2.5">
            {cockpitData?.active_buying_signals.map((sig, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-[#E2E4DA] bg-white hover:border-[#59664A]/50 transition-colors space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#252620]">{sig.company_name}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                    {sig.buying_intent}
                  </span>
                </div>
                <p className="text-[11px] text-[#59664A] font-medium leading-snug">
                  "{sig.signal}"
                </p>
                <div className="text-[9px] font-mono text-[#7B7F73] flex items-center justify-between pt-1">
                  <span>Source: {sig.source}</span>
                  <span>Match: {sig.service}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Outreach Waiting for Approval */}
        <div className="bg-[#FCFCF8] border border-[#E2E4DA] rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-[#252620] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Outreach Waiting for Human Approval Gate</span>
            </div>
            <span className="text-[10px] font-mono text-[#7B7F73]">
              {cockpitData?.drafts_waiting_approval.length || 0} Drafts
            </span>
          </div>

          <div className="space-y-2.5">
            {cockpitData?.drafts_waiting_approval.length === 0 && (
              <div className="p-8 text-center text-xs text-[#7B7F73]">
                No drafts currently waiting for approval.
              </div>
            )}

            {cockpitData?.drafts_waiting_approval.map((draft, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-[#E2E4DA] bg-white space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#252620]">{draft.company_name}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                    {draft.service}
                  </span>
                </div>
                <div className="text-[11px] font-medium text-[#252620] truncate">
                  Subject: {draft.subject}
                </div>
                <p className="text-[10px] text-[#7B7F73] line-clamp-2">
                  {draft.preview}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => onSelectLead(draft.lead_id)}
                    className="text-[10px] text-[#7B7F73] hover:text-[#252620] font-medium"
                  >
                    Edit Draft
                  </button>
                  <button
                    onClick={() => handleApproveDraft(draft.draft_id)}
                    className="px-3 py-1 bg-[#59664A] hover:bg-[#47523B] text-white text-[10px] font-semibold rounded-lg flex items-center gap-1 shadow-sm transition-all"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Approve Outreach</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
