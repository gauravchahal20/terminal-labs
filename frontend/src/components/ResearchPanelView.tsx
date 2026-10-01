"use client";

import React, { useState } from "react";
import { AgentDiscoveryRequest, Lead } from "@/types";
import { TERMINAL_LABS_SERVICES } from "@/lib/services-catalog";
import { 
  Search, 
  Bot, 
  Sparkles, 
  Sliders, 
  Globe, 
  Flame, 
  Target, 
  Zap, 
  Loader2, 
  CheckCircle2, 
  Building2, 
  Phone, 
  ExternalLink,
  ShieldCheck,
  ArrowRight
} from "lucide-react";

interface ResearchPanelViewProps {
  onRunDiscovery: (filters: AgentDiscoveryRequest) => Promise<void>;
  isRunning: boolean;
  discoveredLeads: Lead[];
  onSelectLead: (leadId: string) => void;
}

const INDIAN_HUBS = [
  "All India",
  "Bengaluru",
  "Mumbai",
  "Delhi NCR",
  "Gurgaon",
  "Noida",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Jaipur",
  "Ahmedabad",
  "Indore",
  "Chandigarh",
  "Kolkata",
  "Kochi",
  "Lucknow"
];

const PRESET_QUERIES = [
  {
    title: "Find 100 Indian businesses without official websites.",
    website_status: "NO_WEBSITE",
    country: "India",
    service: "Web Design & Development",
    intent: "HIGH"
  },
  {
    title: "Find Indian SaaS companies that may need custom development.",
    industry: "SaaS & Technology",
    target_service: "SaaS Development",
    country: "India",
    intent: "HIGH"
  },
  {
    title: "Find real-estate businesses with WhatsApp automation opportunities.",
    industry: "Real Estate",
    target_service: "WhatsApp Business Automation",
    country: "India",
    intent: "HIGH"
  },
  {
    title: "Find companies publicly looking for website developers.",
    buying_intent: "HIGH",
    target_service: "Web Design & Development",
    search_query: "looking for website developer web designer required"
  }
];

export const ResearchPanelView: React.FC<ResearchPanelViewProps> = ({
  onRunDiscovery,
  isRunning,
  discoveredLeads,
  onSelectLead,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [industry, setIndustry] = useState("All");
  const [country, setCountry] = useState("India");
  const [city, setCity] = useState("All India");
  const [companySize, setCompanySize] = useState("11-50");
  const [websiteStatus, setWebsiteStatus] = useState("All");
  const [targetService, setTargetService] = useState("All");
  const [buyingIntent, setBuyingIntent] = useState("All");
  const [minScore, setMinScore] = useState(65);
  const [maxResults, setMaxResults] = useState(10);
  const [autoQualify, setAutoQualify] = useState(true);

  const applyQuery = (q: typeof PRESET_QUERIES[0]) => {
    setSearchQuery(q.title);
    if (q.website_status) setWebsiteStatus(q.website_status);
    if (q.industry) setIndustry(q.industry);
    if (q.country) setCountry(q.country);
    if (q.target_service) setTargetService(q.target_service);
    if (q.intent) setBuyingIntent(q.intent);
    if (q.buying_intent) setBuyingIntent(q.buying_intent);
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    await onRunDiscovery({
      search_query: searchQuery || undefined,
      industry: industry === "All" ? undefined : industry,
      country,
      city: city === "All India" ? undefined : city,
      company_size: companySize,
      website_status: websiteStatus === "All" ? undefined : websiteStatus,
      target_service: targetService === "All" ? undefined : targetService,
      buying_intent: buyingIntent === "All" ? undefined : buyingIntent,
      min_score: minScore,
      limit: maxResults,
      auto_qualify: autoQualify,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-2 border-b border-[#E2E4DA]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold bg-[#E7EEDB] text-[#59664A] border border-[#A8B98D]/40">
              Lead Discovery & Research Panel
            </span>
            <span className="text-xs text-[#7B7F73]">• Section 10 Autonomous Controls</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#252620] font-normal tracking-tight">
            Target Discovery & Research
          </h1>
          <p className="text-xs text-[#7B7F73] mt-0.5">
            Query public business registries, detect no-website opportunities, extract RFPs, and evaluate 7-factor fit.
          </p>
        </div>
      </div>

      {/* QUICK PRESET EXAMPLES */}
      <div className="editorial-card p-4 space-y-2.5">
        <div className="text-xs font-semibold text-[#252620] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#59664A]" />
          <span>Strategic Discovery Examples (Click to configure):</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {PRESET_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => applyQuery(q)}
              className="text-left p-2.5 rounded-lg border border-[#E2E4DA] bg-[#FCFCF8] hover:bg-[#F0F2EB] transition-colors text-xs text-[#252620] flex items-center justify-between group"
            >
              <span className="font-medium">{q.title}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#7B7F73] group-hover:text-[#59664A] transition-colors shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>

      {/* RESEARCH CONTROLS GRID */}
      <form onSubmit={handleLaunch} className="editorial-card p-6 space-y-5 bg-[#FCFCF8]">
        {/* Search Query Input */}
        <div>
          <label className="text-xs font-semibold text-[#252620] block mb-1">
            Discovery Search Query / Objective
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B7F73]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Find 100 Indian businesses without official websites..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#F5F5EF] border border-[#E2E4DA] rounded-lg text-xs text-[#252620] focus:outline-none focus:border-[#59664A]"
            />
          </div>
        </div>

        {/* 6 Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {/* 1. Country */}
          <div>
            <label className="text-[10px] font-medium text-[#7B7F73] block mb-1">Country</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full p-2 bg-[#F5F5EF] border border-[#E2E4DA] rounded-lg text-[#252620]"
            />
          </div>

          {/* 2. Indian Metro Hub */}
          <div>
            <label className="text-[10px] font-medium text-[#7B7F73] block mb-1">Metro Hub</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full p-2 bg-[#F5F5EF] border border-[#E2E4DA] rounded-lg text-[#252620]"
            >
              {INDIAN_HUBS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          {/* 3. Industry */}
          <div>
            <label className="text-[10px] font-medium text-[#7B7F73] block mb-1">Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full p-2 bg-[#F5F5EF] border border-[#E2E4DA] rounded-lg text-[#252620]"
            >
              <option value="All">All High-Growth Sectors</option>
              <option value="Real Estate">Real Estate & PropTech</option>
              <option value="Healthcare">Healthcare & Diagnostics</option>
              <option value="SaaS & Technology">SaaS & Technology</option>
              <option value="FinTech">FinTech & NBFC</option>
              <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
              <option value="E-commerce">E-commerce & D2C</option>
              <option value="Manufacturing & Retail">Manufacturing & Retail</option>
              <option value="Agriculture & B2B">Agriculture & B2B</option>
              <option value="EdTech">EdTech & Education</option>
              <option value="Hospitality">Hospitality & Resorts</option>
            </select>
          </div>

          {/* 4. Website Status */}
          <div>
            <label className="text-[10px] font-medium text-[#7B7F73] block mb-1">Website Gap Status</label>
            <select
              value={websiteStatus}
              onChange={(e) => setWebsiteStatus(e.target.value)}
              className="w-full p-2 bg-[#F5F5EF] border border-[#E2E4DA] rounded-lg text-[#252620]"
            >
              <option value="All">All Statuses</option>
              <option value="NO_WEBSITE">🌐 No Website (High Need)</option>
              <option value="WEBSITE_PLUS_AUTOMATION">Website + Automation</option>
              <option value="WEBSITE_PLUS_AI">Website + AI Agent</option>
              <option value="WEBSITE_REDESIGN">Website Redesign</option>
              <option value="SAAS_OPPORTUNITY">SaaS Opportunity</option>
              <option value="CUSTOM_SOFTWARE_OPPORTUNITY">Custom Software</option>
            </select>
          </div>

          {/* 5. Terminal Labs Service */}
          <div>
            <label className="text-[10px] font-medium text-[#7B7F73] block mb-1">Offering Matched</label>
            <select
              value={targetService}
              onChange={(e) => setTargetService(e.target.value)}
              className="w-full p-2 bg-[#F5F5EF] border border-[#E2E4DA] rounded-lg text-[#252620]"
            >
              <option value="All">All 15 Verticals</option>
              {Object.keys(TERMINAL_LABS_SERVICES).map((srv) => (
                <option key={srv} value={srv}>{srv}</option>
              ))}
            </select>
          </div>

          {/* 6. Buying Intent */}
          <div>
            <label className="text-[10px] font-medium text-[#7B7F73] block mb-1">Buying Intent</label>
            <select
              value={buyingIntent}
              onChange={(e) => setBuyingIntent(e.target.value)}
              className="w-full p-2 bg-[#F5F5EF] border border-[#E2E4DA] rounded-lg text-[#252620]"
            >
              <option value="All">All Intent Levels</option>
              <option value="HIGH">🔥 High Intent (RFP/Posting)</option>
              <option value="MEDIUM">Medium Intent</option>
              <option value="LOW">Low Intent</option>
            </select>
          </div>
        </div>

        {/* Sliders for Min Score and Max Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#E2E4DA]">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-[#252620]">Minimum Qualification Score</span>
              <span className="font-mono font-bold text-[#59664A]">{minScore}/100</span>
            </div>
            <input
              type="range"
              min={0}
              max={95}
              step={5}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full accent-[#59664A]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-[#252620]">Maximum Results</span>
              <span className="font-mono font-bold text-[#59664A]">{maxResults} targets</span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              className="w-full accent-[#59664A]"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-[#F5F5EF] rounded-xl text-xs">
            <div>
              <div className="font-semibold text-[#252620]">Auto-Qualify & Draft Outreach</div>
              <div className="text-[10px] text-[#7B7F73]">Run 7-factor scoring & draft generation</div>
            </div>
            <input
              type="checkbox"
              checked={autoQualify}
              onChange={(e) => setAutoQualify(e.target.checked)}
              className="h-4 w-4 accent-[#59664A]"
            />
          </div>
        </div>

        {/* Launch Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-[#7B7F73] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#59664A]" />
            <span>Automatic domain deduplication and phone verification active.</span>
          </div>

          <button
            type="submit"
            disabled={isRunning}
            className="flex items-center gap-2 py-2.5 px-6 rounded-xl text-xs font-semibold text-white bg-[#252620] hover:bg-[#383A31] disabled:opacity-50 transition-all shadow-xs"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#A8B98D]" />
                <span>Autonomous Agents Executing...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-[#A8B98D]" />
                <span>Execute Discovery Pipeline</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* DISCOVERED PROSPECTS PREVIEW */}
      <div className="editorial-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-serif font-medium text-[#252620]">
              Discovered Target Intelligence ({discoveredLeads.length})
            </h3>
            <p className="text-xs text-[#7B7F73]">
              All discovered companies with verified provenance and matched opportunities.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {discoveredLeads.map((lead) => (
            <div
              key={lead.id}
              onClick={() => onSelectLead(lead.id)}
              className="editorial-card p-4 bg-[#FCFCF8] hover:border-[#A8B98D] cursor-pointer transition-all space-y-2.5 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-serif text-sm font-medium text-[#252620] group-hover:text-[#59664A] transition-colors">
                    {lead.company_name}
                  </h4>
                  <div className="text-[10px] text-[#7B7F73]">
                    {lead.city ? `${lead.city}, ` : ""}{lead.country} • {lead.industry}
                  </div>
                </div>

                {lead.score && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E7EEDB] text-[#59664A]">
                    {lead.score.total_score}/100
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {lead.website_status === "NO_WEBSITE" ? (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#FDE8E8] text-[#9B1C1C]">
                    No Website
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#F5F5EF] text-[#252620] border border-[#E2E4DA]">
                    {lead.website_status?.replace(/_/g, " ")}
                  </span>
                )}

                {lead.buying_intent === "HIGH" && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#F9EBDD] text-[#8B4513]">
                    High Intent
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-[#E2E4DA] flex items-center justify-between text-[11px]">
                <span className="text-[#59664A] font-medium truncate max-w-[170px]">
                  {lead.opportunity?.recommended_service || "Web Development"}
                </span>
                <span className="text-[#7B7F73] group-hover:text-[#252620]">&rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
