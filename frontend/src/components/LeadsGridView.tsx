"use client";

import React, { useState } from "react";
import { Lead, LeadStatus } from "@/types";
import { TERMINAL_LABS_SERVICES } from "@/lib/services-catalog";
import { 
  Search, 
  ExternalLink, 
  ArrowUpDown, 
  Bot, 
  ArrowUpRight,
  Filter,
  Plus,
  Phone,
  Mail,
  MessageSquare,
  Download,
  CheckCircle2,
  Globe,
  Flame,
  ShieldCheck,
  Building2,
  Copy,
  Check
} from "lucide-react";

interface LeadsGridViewProps {
  leads: Lead[];
  onSelectLead: (leadId: string) => void;
  onUpdateStatus: (leadId: string, status: LeadStatus) => void;
  onRunPipeline: (leadId: string) => void;
  onOpenNewLeadModal: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  initialWebsiteStatus?: string;
  initialBuyingIntent?: string;
}

const CRM_STATUSES: LeadStatus[] = [
  "New",
  "Researching",
  "Qualified",
  "Contacted",
  "Replied",
  "Meeting",
  "Proposal",
  "Won",
  "Lost",
];

export const LeadsGridView: React.FC<LeadsGridViewProps> = ({
  leads,
  onSelectLead,
  onUpdateStatus,
  onRunPipeline,
  onOpenNewLeadModal,
  searchTerm,
  setSearchTerm,
  initialWebsiteStatus = "All",
  initialBuyingIntent = "All"
}) => {
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedService, setSelectedService] = useState("All");
  const [selectedTier, setSelectedTier] = useState("All");
  const [selectedWebsiteStatus, setSelectedWebsiteStatus] = useState(initialWebsiteStatus);
  const [selectedBuyingIntent, setSelectedBuyingIntent] = useState(initialBuyingIntent);
  const [selectedLeadType, setSelectedLeadType] = useState("All");
  const [hasPhoneOnly, setHasPhoneOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"score" | "name" | "recent">("score");
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const industries = ["All", ...Array.from(new Set(leads.map((l) => l.industry).filter(Boolean)))];
  const serviceKeys = ["All", ...Object.keys(TERMINAL_LABS_SERVICES)];

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedPhone(text);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      !searchTerm ||
      lead.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.intent_signal && lead.intent_signal.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRegion =
      selectedRegion === "All" ||
      (selectedRegion === "India" && (lead.country.toLowerCase().includes("india") || lead.domain.endsWith(".in"))) ||
      (selectedRegion === "UAE" && (lead.country.toLowerCase().includes("emirates") || lead.country.toLowerCase().includes("uae"))) ||
      (selectedRegion === "US" && (lead.country.toLowerCase().includes("united states") || lead.country.toLowerCase().includes("us"))) ||
      (selectedRegion === "Europe" && (lead.country.toLowerCase().includes("kingdom") || lead.country.toLowerCase().includes("uk")));

    const matchesIndustry = selectedIndustry === "All" || lead.industry === selectedIndustry;
    const matchesStatus = selectedStatus === "All" || lead.status === selectedStatus;
    const matchesService =
      selectedService === "All" ||
      lead.opportunity?.recommended_service === selectedService;
    const matchesTier = selectedTier === "All" || lead.score?.tier === selectedTier;
    const matchesWebsiteStatus = 
      selectedWebsiteStatus === "All" || 
      lead.website_status === selectedWebsiteStatus ||
      (selectedWebsiteStatus === "NO_WEBSITE" && (lead.website_status === "NO_WEBSITE" || !lead.website_url));
    const matchesBuyingIntent = selectedBuyingIntent === "All" || lead.buying_intent === selectedBuyingIntent;
    const matchesLeadType = selectedLeadType === "All" || (lead.lead_type || "REAL") === selectedLeadType;
    const matchesPhone = !hasPhoneOnly || Boolean(lead.phone || lead.decision_makers?.some(d => d.phone));

    return (
      matchesSearch && 
      matchesRegion && 
      matchesIndustry && 
      matchesStatus && 
      matchesService && 
      matchesTier && 
      matchesWebsiteStatus &&
      matchesBuyingIntent &&
      matchesLeadType &&
      matchesPhone
    );
  }).sort((a, b) => {
    if (sortBy === "score") {
      return (b.score?.total_score || 0) - (a.score?.total_score || 0);
    }
    if (sortBy === "name") {
      return a.company_name.localeCompare(b.company_name);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-2 border-b border-[#E2E4DA]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold bg-[#E7EEDB] text-[#59664A] border border-[#A8B98D]/40">
              Phase 2 Intelligence Roster
            </span>
            <span className="text-xs text-[#7B7F73]">• 7-Factor Scoring & Provenance Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#252620] font-normal tracking-tight">
            Lead Intelligence Platform
          </h1>
          <p className="text-xs text-[#7B7F73] mt-0.5">
            Verified prospect roster with transparent 7-factor scores, no-website gap classification, and direct decision-maker channels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="http://localhost:8000/api/v1/leads/export/csv"
            download="terminal_labs_phase2_leads.csv"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#252620] bg-[#FCFCF8] border border-[#E2E4DA] hover:bg-[#F0F2EB] transition-colors shadow-xs"
            title="Download CSV of all verified contacts & phone numbers"
          >
            <Download className="w-3.5 h-3.5 text-[#59664A]" />
            <span>Export CSV</span>
          </a>
          <button
            onClick={onOpenNewLeadModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#252620] hover:bg-[#383A31] transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#A8B98D]" />
            <span>Add Target</span>
          </button>
        </div>
      </div>

      {/* QUICK PRESET FILTER PILLS */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setSelectedWebsiteStatus("All");
            setSelectedBuyingIntent("All");
            setSelectedRegion("All");
            setHasPhoneOnly(false);
          }}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
            selectedWebsiteStatus === "All" && selectedBuyingIntent === "All" && selectedRegion === "All" && !hasPhoneOnly
              ? "bg-[#252620] text-white"
              : "bg-[#FCFCF8] text-[#7B7F73] border border-[#E2E4DA] hover:border-[#A8B98D]"
          }`}
        >
          All Prospects ({leads.length})
        </button>

        <button
          onClick={() => {
            setSelectedWebsiteStatus(selectedWebsiteStatus === "NO_WEBSITE" ? "All" : "NO_WEBSITE");
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            selectedWebsiteStatus === "NO_WEBSITE"
              ? "bg-[#9B1C1C] text-white shadow-xs"
              : "bg-[#FCFCF8] text-[#9B1C1C] border border-[#FDE8E8] hover:bg-[#FDE8E8]/40"
          }`}
        >
          <Globe className="w-3 h-3" />
          <span>🌐 No Website Only ({leads.filter(l => l.website_status === "NO_WEBSITE" || !l.website_url).length})</span>
        </button>

        <button
          onClick={() => {
            setSelectedBuyingIntent(selectedBuyingIntent === "HIGH" ? "All" : "HIGH");
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            selectedBuyingIntent === "HIGH"
              ? "bg-[#8B4513] text-white shadow-xs"
              : "bg-[#FCFCF8] text-[#8B4513] border border-[#F9EBDD] hover:bg-[#F9EBDD]/50"
          }`}
        >
          <Flame className="w-3 h-3" />
          <span>🔥 High Buying Intent ({leads.filter(l => l.buying_intent === "HIGH").length})</span>
        </button>

        <button
          onClick={() => {
            setSelectedRegion(selectedRegion === "India" ? "All" : "India");
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
            selectedRegion === "India"
              ? "bg-[#59664A] text-white shadow-xs"
              : "bg-[#FCFCF8] text-[#59664A] border border-[#E7EEDB] hover:bg-[#E7EEDB]"
          }`}
        >
          <span>🇮🇳 India Hubs ({leads.filter(l => l.country?.toLowerCase().includes("india") || l.domain.endsWith(".in")).length})</span>
        </button>

        <button
          onClick={() => setHasPhoneOnly(!hasPhoneOnly)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
            hasPhoneOnly
              ? "bg-[#59664A] text-white shadow-xs"
              : "bg-[#FCFCF8] text-[#252620] border border-[#E2E4DA] hover:bg-[#F0F2EB]"
          }`}
        >
          <Phone className="w-3 h-3 text-[#59664A]" />
          <span>Direct Phone Ready</span>
        </button>
      </div>

      {/* SEARCH AND EXTENDED FILTER BAR */}
      <div className="editorial-card p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B7F73]" />
            <input
              type="text"
              placeholder="Search companies, cities, buying intent RFP signals, or domains..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F5F5EF] border border-[#E2E4DA] rounded-lg text-xs text-[#252620] placeholder-[#7B7F73] focus:outline-none focus:border-[#59664A]"
            />
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-between md:justify-end gap-2 text-xs text-[#7B7F73] px-1">
            <span>Showing <strong className="text-[#252620]">{filteredLeads.length}</strong> of {leads.length} prospects</span>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-[#E2E4DA]">
          {/* 1. Website Status */}
          <div>
            <label className="text-[10px] font-medium text-[#7B7F73] block mb-1">Website Status</label>
            <select
              value={selectedWebsiteStatus}
              onChange={(e) => setSelectedWebsiteStatus(e.target.value)}
              className="w-full px-2 py-1.5 text-xs bg-[#F5F5EF] border border-[#E2E4DA] rounded-md text-[#252620]"
            >
              <option value="All">All Statuses</option>
              <option value="NO_WEBSITE">No Website</option>
              <option value="WEBSITE_PLUS_AUTOMATION">Website + Automation</option>
              <option value="WEBSITE_PLUS_AI">Website + AI Agent</option>
              <option value="WEBSITE_REDESIGN">Website Redesign</option>
              <option value="WEAK_WEBSITE">Weak Website / Low UX</option>
              <option value="SAAS_OPPORTUNITY">SaaS Opportunity</option>
              <option value="CUSTOM_SOFTWARE_OPPORTUNITY">Custom Software</option>
            </select>
          </div>

          {/* 2. Buying Intent */}
          <div>
            <label className="text-[10px] font-medium text-[#7B7F73] block mb-1">Buying Intent</label>
            <select
              value={selectedBuyingIntent}
              onChange={(e) => setSelectedBuyingIntent(e.target.value)}
              className="w-full px-2 py-1.5 text-xs bg-[#F5F5EF] border border-[#E2E4DA] rounded-md text-[#252620]"
            >
              <option value="All">All Intent Levels</option>
              <option value="HIGH">High Intent (RFP/Posting)</option>
              <option value="MEDIUM">Medium Intent</option>
              <option value="LOW">Low Intent</option>
            </select>
          </div>

          {/* 3. Industry */}
          <div>
            <label className="text-[10px] font-medium text-[#7B7F73] block mb-1">Industry</label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full px-2 py-1.5 text-xs bg-[#F5F5EF] border border-[#E2E4DA] rounded-md text-[#252620]"
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* 4. Service Matched */}
          <div>
            <label className="text-[10px] font-medium text-[#7B7F73] block mb-1">Matched Service</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-2 py-1.5 text-xs bg-[#F5F5EF] border border-[#E2E4DA] rounded-md text-[#252620]"
            >
              {serviceKeys.map((srv) => (
                <option key={srv} value={srv}>{srv}</option>
              ))}
            </select>
          </div>

          {/* 5. Score Tier */}
          <div>
            <label className="text-[10px] font-medium text-[#7B7F73] block mb-1">Score Tier</label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full px-2 py-1.5 text-xs bg-[#F5F5EF] border border-[#E2E4DA] rounded-md text-[#252620]"
            >
              <option value="All">All Tiers</option>
              <option value="Hot">Hot (80-100)</option>
              <option value="Warm">Warm (60-79)</option>
              <option value="Moderate">Moderate (40-59)</option>
              <option value="Cold">Cold (0-39)</option>
            </select>
          </div>

          {/* 6. Sort By */}
          <div>
            <label className="text-[10px] font-medium text-[#7B7F73] block mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2 py-1.5 text-xs bg-[#F5F5EF] border border-[#E2E4DA] rounded-md text-[#252620]"
            >
              <option value="score">Highest Score</option>
              <option value="name">Company Name</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
        </div>
      </div>

      {/* MAIN LEADS TABLE */}
      <div className="editorial-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5F5EF]/60 border-b border-[#E2E4DA] text-[#7B7F73] font-medium">
                <th className="py-3 px-4 font-medium">Company & Data Provenance</th>
                <th className="py-3 px-3 font-medium">Location</th>
                <th className="py-3 px-3 font-medium">Website Gap Status</th>
                <th className="py-3 px-3 font-medium">Buying Intent</th>
                <th className="py-3 px-3 font-medium">Primary Decision Maker</th>
                <th className="py-3 px-3 font-medium">7-Factor Score</th>
                <th className="py-3 px-3 font-medium">Recommended Service</th>
                <th className="py-3 px-3 font-medium">Stage</th>
                <th className="py-3 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4DA]">
              {filteredLeads.map((lead) => {
                const primaryDm = lead.decision_makers?.find((d) => d.is_primary) || lead.decision_makers?.[0];
                const directPhone = primaryDm?.phone || lead.phone;
                const scoreVal = lead.score?.total_score ?? 0;

                return (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead.id)}
                    className="hover:bg-[#F0F2EB]/80 cursor-pointer transition-colors group"
                  >
                    {/* 1. Company & Provenance */}
                    <td className="py-3.5 px-4">
                      <div className="font-serif text-sm font-medium text-[#252620] group-hover:text-[#59664A] transition-colors flex items-center gap-1.5">
                        <span>{lead.company_name}</span>
                        {lead.website_url ? (
                          <a
                            href={lead.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#7B7F73] hover:text-[#59664A]"
                            title="Visit Website"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : null}
                      </div>

                      <div className="text-[11px] text-[#7B7F73] flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#E7EEDB] text-[#59664A]">
                          {lead.lead_type || "REAL"}
                        </span>
                        <span>•</span>
                        <span>{lead.industry}</span>
                        <span>•</span>
                        <span className="font-mono text-[10px]">{lead.company_size}</span>
                      </div>
                    </td>

                    {/* 2. Location */}
                    <td className="py-3.5 px-3 text-[#252620]">
                      <div>{lead.city || lead.state || "—"}</div>
                      <div className="text-[10px] text-[#7B7F73]">{lead.country}</div>
                    </td>

                    {/* 3. Website Gap Status */}
                    <td className="py-3.5 px-3">
                      {lead.website_status === "NO_WEBSITE" || !lead.website_url ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FDE8E8] text-[#9B1C1C]">
                          <Globe className="w-3 h-3" /> No Website
                        </span>
                      ) : lead.website_status === "WEBSITE_PLUS_AUTOMATION" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#E7EEDB] text-[#59664A]">
                          Web + Automation
                        </span>
                      ) : lead.website_status === "WEBSITE_PLUS_AI" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#E7EEDB] text-[#59664A]">
                          Web + AI Agent
                        </span>
                      ) : lead.website_status === "WEBSITE_REDESIGN" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#F9EBDD] text-[#8B4513]">
                          Redesign Needed
                        </span>
                      ) : lead.website_status === "SAAS_OPPORTUNITY" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#E7EEDB] text-[#252620]">
                          SaaS / Portal Rebuild
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#F5F5EF] text-[#252620] border border-[#E2E4DA]">
                          {lead.website_status?.replace(/_/g, " ") || "Active Web"}
                        </span>
                      )}
                    </td>

                    {/* 4. Buying Intent */}
                    <td className="py-3.5 px-3">
                      {lead.buying_intent === "HIGH" ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F9EBDD] text-[#8B4513]">
                            <Flame className="w-3 h-3" /> High Intent
                          </span>
                          {lead.intent_signal && (
                            <div className="text-[10px] text-[#7B7F73] truncate max-w-[140px] mt-0.5" title={lead.intent_signal}>
                              {lead.intent_signal}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#F5F5EF] text-[#7B7F73]">
                          {lead.buying_intent || "Medium"}
                        </span>
                      )}
                    </td>

                    {/* 5. Primary Decision Maker */}
                    <td className="py-3.5 px-3">
                      {primaryDm ? (
                        <div>
                          <div className="font-medium text-[#252620] flex items-center gap-1">
                            <span>{primaryDm.full_name}</span>
                          </div>
                          <div className="text-[10px] text-[#7B7F73] truncate max-w-[150px]">
                            {primaryDm.title}
                          </div>
                          {directPhone && (
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-[#59664A] font-mono">
                              <Phone className="w-2.5 h-2.5" />
                              <span>{directPhone}</span>
                              <button
                                onClick={(e) => handleCopy(directPhone, e)}
                                className="text-[#7B7F73] hover:text-[#252620] ml-0.5"
                                title="Copy Phone Number"
                              >
                                {copiedPhone === directPhone ? (
                                  <Check className="w-2.5 h-2.5 text-[#59664A]" />
                                ) : (
                                  <Copy className="w-2.5 h-2.5" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#7B7F73] italic">Unassigned</span>
                      )}
                    </td>

                    {/* 6. 7-Factor Score */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-serif font-medium text-base text-[#252620]">
                          {scoreVal}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                          scoreVal >= 80 
                            ? "bg-[#E7EEDB] text-[#59664A]" 
                            : scoreVal >= 60
                            ? "bg-[#F0F2EB] text-[#252620]"
                            : "bg-[#F5F5EF] text-[#7B7F73]"
                        }`}>
                          {lead.score?.tier || "Qualified"}
                        </span>
                      </div>
                      <div className="text-[9px] text-[#7B7F73] mt-0.5">
                        Fit {lead.score?.business_fit || 22}/25 • Opp {lead.score?.opportunity_signal || 16}/20
                      </div>
                    </td>

                    {/* 7. Matched Service */}
                    <td className="py-3.5 px-3">
                      <div className="font-medium text-[#252620] truncate max-w-[150px]">
                        {lead.opportunity?.recommended_service || "Web Design & Development"}
                      </div>
                      <div className="text-[10px] text-[#59664A] font-serif mt-0.5">
                        {lead.opportunity?.estimated_deal_size || "$8,000 - $25,000"}
                      </div>
                    </td>

                    {/* 8. Stage Dropdown */}
                    <td className="py-3.5 px-3">
                      <select
                        value={lead.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(lead.id, e.target.value as LeadStatus);
                        }}
                        className="px-2 py-1 text-[11px] font-medium rounded bg-[#F5F5EF] border border-[#E2E4DA] text-[#252620] focus:outline-none"
                      >
                        {CRM_STATUSES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </td>

                    {/* 9. Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLead(lead.id);
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium text-[#252620] bg-[#FCFCF8] border border-[#E2E4DA] hover:bg-[#E7EEDB] hover:text-[#59664A] rounded transition-colors"
                        >
                          Dossier
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
