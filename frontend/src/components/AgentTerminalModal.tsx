"use client";

import React, { useState } from "react";
import { AgentDiscoveryRequest } from "@/types";
import { TERMINAL_LABS_SERVICES } from "@/lib/services-catalog";
import { 
  X, 
  Bot, 
  Sparkles, 
  Play, 
  Loader2, 
  Sliders,
  CheckCircle2,
  Globe,
  Flame,
  Building2,
  Terminal,
  Zap,
  Target
} from "lucide-react";

interface AgentTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunDiscovery: (filters: AgentDiscoveryRequest) => Promise<void>;
  isRunning: boolean;
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

export const AgentTerminalModal: React.FC<AgentTerminalModalProps> = ({
  isOpen,
  onClose,
  onRunDiscovery,
  isRunning,
}) => {
  const [industry, setIndustry] = useState("All");
  const [country, setCountry] = useState("India");
  const [city, setCity] = useState("All India");
  const [websiteStatus, setWebsiteStatus] = useState("All");
  const [buyingIntent, setBuyingIntent] = useState("All");
  const [targetService, setTargetService] = useState("All");
  const [companySize, setCompanySize] = useState("11-50");
  const [limit, setLimit] = useState(5);
  const [autoQualify, setAutoQualify] = useState(true);

  const [logs, setLogs] = useState<string[]>([
    "Terminal Labs Autonomous Intelligence Engine v2.4 initialized.",
    "Ready to execute Phase 2 multi-agent pipeline across 15 service verticals.",
    "Data provenance: Verified Public Data & Registry Crawling active.",
    "No-Website Discovery & Explicit Buying-Intent signals configured."
  ]);

  if (!isOpen) return null;

  const applyPreset = (preset: {
    industry?: string;
    country?: string;
    city?: string;
    websiteStatus?: string;
    buyingIntent?: string;
    targetService?: string;
    label: string;
  }) => {
    if (preset.industry) setIndustry(preset.industry);
    if (preset.country) setCountry(preset.country);
    if (preset.city) setCity(preset.city);
    if (preset.websiteStatus) setWebsiteStatus(preset.websiteStatus);
    if (preset.buyingIntent) setBuyingIntent(preset.buyingIntent);
    if (preset.targetService) setTargetService(preset.targetService);

    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [PRESET] Applied strategy: "${preset.label}"`
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [DISCOVERY AGENT] Initiating search in ${city === "All India" ? "India" : city}, ${country}...`,
      `[${new Date().toLocaleTimeString()}] [DISCOVERY AGENT] Website Filter: ${websiteStatus} | Buying Intent: ${buyingIntent}`,
      `[${new Date().toLocaleTimeString()}] [DISCOVERY AGENT] Checking duplicate registry records & domain normalizers...`
    ]);

    await onRunDiscovery({
      industry: industry === "All" ? undefined : industry,
      country,
      city: city === "All India" ? undefined : city,
      website_status: websiteStatus === "All" ? undefined : websiteStatus,
      buying_intent: buyingIntent === "All" ? undefined : buyingIntent,
      target_service: targetService === "All" ? undefined : targetService,
      company_size: companySize,
      limit,
      auto_qualify: autoQualify,
    });

    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [RESEARCH AGENT] Inspected public digital touchpoints & decision maker profiles.`,
      `[${new Date().toLocaleTimeString()}] [QUALIFICATION AGENT] Evaluated 7-factor explainable score (25/25/20/15/5/5/5).`,
      `[${new Date().toLocaleTimeString()}] [PERSONALIZATION AGENT] Generated Case-specific cold email, LinkedIn, and WhatsApp drafts.`,
      `[${new Date().toLocaleTimeString()}] [CRM SYNC] Pipeline run completed. New qualified targets placed in CRM.`
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#252620]/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div 
        className="w-full max-w-4xl bg-[#FCFCF8] border border-[#E2E4DA] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#E2E4DA] flex items-center justify-between bg-[#F5F5EF]/60">
          <div className="flex items-center gap-2.5">
            <Bot className="w-5 h-5 text-[#59664A]" />
            <div>
              <h2 className="text-sm font-serif font-medium text-[#252620]">
                Autonomous Lead Discovery & Qualification Engine
              </h2>
              <p className="text-[11px] text-[#7B7F73]">Configure multi-agent discovery controls or launch 1-click discovery presets</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#7B7F73] hover:text-[#252620] hover:bg-[#E2E4DA]/40 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-CLICK STRATEGIC PRESETS BAR */}
        <div className="p-3.5 bg-[#FCFCF8] border-b border-[#E2E4DA] flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-semibold text-[#59664A] uppercase tracking-wider">
            Discovery Presets:
          </span>

          <button
            type="button"
            onClick={() => applyPreset({
              websiteStatus: "NO_WEBSITE",
              country: "India",
              label: "Find Indian businesses without official websites"
            })}
            className="px-2.5 py-1 rounded text-[11px] font-medium bg-[#FDE8E8] text-[#9B1C1C] hover:bg-[#FDE8E8]/80 transition-colors"
          >
            🌐 No Website Indian Businesses
          </button>

          <button
            type="button"
            onClick={() => applyPreset({
              industry: "SaaS & Technology",
              targetService: "SaaS Development",
              buyingIntent: "HIGH",
              label: "Find Indian SaaS companies needing custom dev"
            })}
            className="px-2.5 py-1 rounded text-[11px] font-medium bg-[#E7EEDB] text-[#59664A] hover:bg-[#D9E2CC] transition-colors"
          >
            ⚡ Indian SaaS Scaleups
          </button>

          <button
            type="button"
            onClick={() => applyPreset({
              industry: "Real Estate",
              targetService: "WhatsApp Business Automation",
              label: "Find real estate businesses needing WhatsApp automation"
            })}
            className="px-2.5 py-1 rounded text-[11px] font-medium bg-[#E7EEDB] text-[#59664A] hover:bg-[#D9E2CC] transition-colors"
          >
            💬 Real Estate WhatsApp Automation
          </button>

          <button
            type="button"
            onClick={() => applyPreset({
              buyingIntent: "HIGH",
              targetService: "Web Design & Development",
              label: "Find companies publicly looking for website developers"
            })}
            className="px-2.5 py-1 rounded text-[11px] font-medium bg-[#F9EBDD] text-[#8B4513] hover:bg-[#F9EBDD]/80 transition-colors"
          >
            🔥 Public RFPs Seeking Developers
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E2E4DA]">
          {/* Parameters Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs bg-[#FCFCF8]">
            {/* 1. Indian Hub / City */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-medium text-[#7B7F73] uppercase tracking-wider block mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-2 bg-[#F5F5EF] border border-[#E2E4DA] rounded-lg text-[#252620]"
                />
              </div>

              <div>
                <label className="text-[10px] font-medium text-[#7B7F73] uppercase tracking-wider block mb-1">Indian Metro Hub</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2 bg-[#F5F5EF] border border-[#E2E4DA] rounded-lg text-[#252620]"
                >
                  {INDIAN_HUBS.map((hub) => (
                    <option key={hub} value={hub}>{hub}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Target Industry & Company Size */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-medium text-[#7B7F73] uppercase tracking-wider block mb-1">Target Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full p-2 bg-[#F5F5EF] border border-[#E2E4DA] rounded-lg text-[#252620]"
                >
                  <option value="All">All High-Growth B2B Sectors</option>
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

              <div>
                <label className="text-[10px] font-medium text-[#7B7F73] uppercase tracking-wider block mb-1">Company Size</label>
                <select
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full p-2 bg-[#F5F5EF] border border-[#E2E4DA] rounded-lg text-[#252620]"
                >
                  <option value="1-10">1-10 Employees</option>
                  <option value="11-50">11-50 Employees</option>
                  <option value="51-200">51-200 Employees</option>
                  <option value="201-500">201-500 Employees</option>
                </select>
              </div>
            </div>

            {/* 3. Website Status & Buying Intent */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-medium text-[#7B7F73] uppercase tracking-wider block mb-1">Website Gap Status</label>
                <select
                  value={websiteStatus}
                  onChange={(e) => setWebsiteStatus(e.target.value)}
                  className="w-full p-2 bg-[#F5F5EF] border border-[#E2E4DA] rounded-lg text-[#252620]"
                >
                  <option value="All">All Website Statuses</option>
                  <option value="NO_WEBSITE">🌐 No Website (Turnkey Build)</option>
                  <option value="WEBSITE_PLUS_AUTOMATION">Website + Automation</option>
                  <option value="WEBSITE_PLUS_AI">Website + AI Agent</option>
                  <option value="WEBSITE_REDESIGN">Website Redesign</option>
                  <option value="SAAS_OPPORTUNITY">SaaS Opportunity</option>
                  <option value="CUSTOM_SOFTWARE_OPPORTUNITY">Custom Software</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-medium text-[#7B7F73] uppercase tracking-wider block mb-1">Buying Intent Level</label>
                <select
                  value={buyingIntent}
                  onChange={(e) => setBuyingIntent(e.target.value)}
                  className="w-full p-2 bg-[#F5F5EF] border border-[#E2E4DA] rounded-lg text-[#252620]"
                >
                  <option value="All">All Intent Levels</option>
                  <option value="HIGH">🔥 High Intent (Public RFP / Hiring)</option>
                  <option value="MEDIUM">Medium Intent</option>
                  <option value="LOW">Low Intent</option>
                </select>
              </div>
            </div>

            {/* 4. Target Service Matched */}
            <div>
              <label className="text-[10px] font-medium text-[#7B7F73] uppercase tracking-wider block mb-1">Terminal Labs Offering</label>
              <select
                value={targetService}
                onChange={(e) => setTargetService(e.target.value)}
                className="w-full p-2 bg-[#F5F5EF] border border-[#E2E4DA] rounded-lg text-[#252620]"
              >
                <option value="All">All 15 Service Verticals</option>
                {Object.keys(TERMINAL_LABS_SERVICES).map((srv) => (
                  <option key={srv} value={srv}>{srv}</option>
                ))}
              </select>
            </div>

            {/* 5. Auto Qualify Switch */}
            <div className="p-3 bg-[#F5F5EF] rounded-xl flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#252620]">Auto-Qualify & Personalize</div>
                <div className="text-[10px] text-[#7B7F73]">Run Web Inspection, 7-Factor Score, and Case-Specific Outreach</div>
              </div>
              <input
                type="checkbox"
                checked={autoQualify}
                onChange={(e) => setAutoQualify(e.target.checked)}
                className="h-4 w-4 accent-[#59664A]"
              />
            </div>

            {/* Launch Button */}
            <button
              type="submit"
              disabled={isRunning}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-[#252620] hover:bg-[#383A31] disabled:opacity-50 transition-all shadow-xs"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#A8B98D]" />
                  <span>Autonomous Agents Running Pipeline...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-[#A8B98D]" />
                  <span>Launch Discovery Pipeline</span>
                </>
              )}
            </button>
          </form>

          {/* Real-time Terminal Log Console */}
          <div className="p-6 flex flex-col justify-between bg-[#1E1F1A] text-white">
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10 text-xs text-[#A8B98D]">
                <div className="flex items-center gap-1.5 font-mono">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Multi-Agent Live Execution Terminal</span>
                </div>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A8B98D] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A8B98D]"></span>
                </span>
              </div>

              <div className="font-mono text-[11px] space-y-2 text-[#E7EEDB]/90 h-64 overflow-y-auto leading-relaxed">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-1.5">
                    <span className="text-[#A8B98D] select-none">&gt;</span>
                    <span className={log.includes("[DISCOVERY") ? "text-[#A8B98D]" : log.includes("[PRESET") ? "text-[#E7EEDB] font-bold" : "text-white/80"}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-white/50 font-mono">
              <span>Status: {isRunning ? "EXECUTING PIPELINE" : "IDLE"}</span>
              <span>Model: Claude 3.5 Sonnet / Multi-Agent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
