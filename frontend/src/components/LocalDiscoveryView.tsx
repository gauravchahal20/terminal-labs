"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Building2,
  Globe,
  Phone,
  MessageSquare,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Filter,
  RefreshCw,
  Layers,
  Star,
  ExternalLink,
  Plus,
  Compass,
  FileCheck,
  TrendingUp,
  Cpu,
  Smartphone,
  ChevronRight,
  Database,
  Lock
} from "lucide-react";
import { ApiService } from "@/lib/api";
import { Lead, LocalBusinessCandidate, WebsiteStatus, WhatsAppStatus, BuyingIntent } from "@/types";

interface LocalDiscoveryViewProps {
  onSelectLead: (lead: Lead) => void;
  onLeadImported?: (lead: Lead) => void;
  onOpenOutreach?: (lead: Lead) => void;
}

const LOCAL_CITIES = [
  "Chandigarh", "Mohali", "Panchkula", "Ludhiana", "Delhi", "Gurgaon", "Noida", 
  "Jaipur", "Ahmedabad", "Mumbai", "Pune", "Bengaluru", "Hyderabad", "Chennai", 
  "Kolkata", "Kochi", "Indore", "Lucknow"
];

const FOREIGN_COUNTRIES = [
  "USA", "UK", "Canada", "Australia", "UAE", "Saudi Arabia", "Singapore", 
  "Ireland", "Netherlands", "Germany", "France", "New Zealand"
];

const CATEGORIES = [
  "Healthcare", "Dental", "Restaurants", "Hospitality", "Real Estate", "Education", 
  "Coaching", "Manufacturing", "Logistics", "Automotive", "Retail", "E-commerce", 
  "Legal", "Finance", "Travel", "Fitness", "Beauty", "Professional Services", 
  "Startups", "SaaS", "Local Services"
];

const PRESET_SEARCHES = [
  {
    title: "100 Dental Clinics in Chandigarh",
    subtitle: "Find dental practices with no official websites & appointment opportunities",
    city: "Chandigarh",
    country: "India",
    category: "Dental",
    website_status: "NO_WEBSITE",
    whatsapp_signal: "All",
    buying_intent: "All",
    keywords: "Dental Clinic",
    limit: 100,
  },
  {
    title: "100 Restaurants in Delhi (No Website)",
    subtitle: "Dining & hospitality hubs needing digital presence & QR menu automation",
    city: "Delhi",
    country: "India",
    category: "Restaurants",
    website_status: "NO_WEBSITE",
    whatsapp_signal: "All",
    buying_intent: "All",
    keywords: "Restaurant",
    limit: 100,
  },
  {
    title: "Gurgaon Tech & Real Estate Modernization",
    subtitle: "High-growth firms needing custom web apps & AI automation workflows",
    city: "Gurgaon",
    country: "India",
    category: "Real Estate",
    website_status: "All",
    whatsapp_signal: "All",
    buying_intent: "HIGH",
    keywords: "Luxury Realty",
    limit: 50,
  },
  {
    title: "Indian Manufacturers Needing Custom Software",
    subtitle: "Industrial exporters in Chandigarh, Ludhiana & NCR looking for ERP & portals",
    city: "All",
    country: "India",
    category: "Manufacturing",
    website_status: "All",
    whatsapp_signal: "All",
    buying_intent: "HIGH",
    keywords: "Manufacturing Exporter",
    limit: 50,
  },
  {
    title: "50 US SaaS Companies (Remote Dev Signals)",
    subtitle: "High-fit international software companies hiring remote engineers",
    city: "All",
    country: "USA",
    category: "SaaS",
    website_status: "All",
    whatsapp_signal: "All",
    buying_intent: "HIGH",
    keywords: "Cloud AI",
    limit: 50,
  },
  {
    title: "UAE Real Estate (WhatsApp Automation)",
    subtitle: "Dubai & Abu Dhabi brokerages with public WhatsApp buyer intake flows",
    city: "All",
    country: "UAE",
    category: "Real Estate",
    website_status: "All",
    whatsapp_signal: "BUSINESS_PUBLICLY_ADVERTISES_WHATSAPP",
    buying_intent: "HIGH",
    keywords: "Horizon Real Estate",
    limit: 25,
  }
];

export const LocalDiscoveryView: React.FC<LocalDiscoveryViewProps> = ({
  onSelectLead,
  onLeadImported,
  onOpenOutreach
}) => {
  // Form State
  const [countryMode, setCountryMode] = useState<"LOCAL" | "FOREIGN">("LOCAL");
  const [selectedCountry, setSelectedCountry] = useState<string>("India");
  const [selectedCity, setSelectedCity] = useState<string>("Chandigarh");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Dental");
  const [keywords, setKeywords] = useState<string>("");
  const [websiteStatusFilter, setWebsiteStatusFilter] = useState<string>("All");
  const [whatsappFilter, setWhatsappFilter] = useState<string>("All");
  const [intentFilter, setIntentFilter] = useState<string>("All");
  const [limit, setLimit] = useState<number>(25);

  // Results State
  const [results, setResults] = useState<LocalBusinessCandidate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [activeQuerySummary, setActiveQuerySummary] = useState<string>("");
  const [importingId, setImportingId] = useState<string | null>(null);
  const [importedSuccessIds, setImportedSuccessIds] = useState<Set<string>>(new Set());

  // Initial load
  useEffect(() => {
    executeSearch();
  }, []);

  const handleCountryModeChange = (mode: "LOCAL" | "FOREIGN") => {
    setCountryMode(mode);
    if (mode === "LOCAL") {
      setSelectedCountry("India");
      setSelectedCity("Chandigarh");
    } else {
      setSelectedCountry("USA");
      setSelectedCity("All");
    }
  };

  const applyPreset = (preset: typeof PRESET_SEARCHES[0]) => {
    if (preset.country === "India") {
      setCountryMode("LOCAL");
    } else {
      setCountryMode("FOREIGN");
    }
    setSelectedCountry(preset.country);
    setSelectedCity(preset.city);
    setSelectedCategory(preset.category);
    setWebsiteStatusFilter(preset.website_status);
    setWhatsappFilter(preset.whatsapp_signal);
    setIntentFilter(preset.buying_intent);
    setKeywords(preset.keywords);
    setLimit(preset.limit);

    // Run search immediately
    executeSearch({
      country: preset.country,
      city: preset.city,
      category: preset.category,
      website_status: preset.website_status,
      whatsapp_signal: preset.whatsapp_signal,
      buying_intent: preset.buying_intent,
      keywords: preset.keywords,
      limit: preset.limit
    });
  };

  const executeSearch = async (overrides?: any) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const country = overrides?.country ?? selectedCountry;
      const city = overrides?.city ?? selectedCity;
      const area = overrides?.area ?? selectedArea;
      const category = overrides?.category ?? selectedCategory;
      const ws = overrides?.website_status ?? websiteStatusFilter;
      const wa = overrides?.whatsapp_signal ?? whatsappFilter;
      const bi = overrides?.buying_intent ?? intentFilter;
      const kw = overrides?.keywords ?? keywords;
      const lim = overrides?.limit ?? limit;

      const summaryText = `${lim} ${category || "All Categories"} in ${city !== "All" ? city : country} ${ws !== "All" ? `[${ws}]` : ""}`;
      setActiveQuerySummary(summaryText);

      const res = await ApiService.searchDirectory({
        country,
        city: city !== "All" ? city : undefined,
        area: area.trim() ? area.trim() : undefined,
        category: category !== "All" ? category : undefined,
        website_status: ws !== "All" ? ws : undefined,
        whatsapp_signal: wa !== "All" ? wa : undefined,
        buying_intent: bi !== "All" ? bi : undefined,
        keywords: kw.trim() ? kw.trim() : undefined,
        limit: lim
      });

      setResults(res.businesses || []);
    } catch (err) {
      console.error("Directory search failed:", err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportToCRM = async (candidate: LocalBusinessCandidate) => {
    setImportingId(candidate.company_name);
    try {
      const importedLead = await ApiService.importCandidateToCRM(candidate);
      setImportedSuccessIds(prev => new Set(prev).add(candidate.company_name));
      if (onLeadImported) {
        onLeadImported(importedLead);
      }
    } catch (err) {
      console.error("Failed to import candidate to CRM:", err);
    } finally {
      setImportingId(null);
    }
  };

  const getWebsiteBadge = (status: WebsiteStatus) => {
    switch (status) {
      case "NO_WEBSITE":
        return {
          label: "No Official Website",
          className: "bg-rose-50 text-rose-700 border-rose-200"
        };
      case "WEAK_WEBSITE":
        return {
          label: "Weak / Outdated Web",
          className: "bg-amber-50 text-amber-700 border-amber-200"
        };
      case "OUTDATED_WEBSITE":
        return {
          label: "Outdated Infrastructure",
          className: "bg-orange-50 text-orange-700 border-orange-200"
        };
      default:
        return {
          label: "Website Active",
          className: "bg-[#E7EEDB] text-[#424C37] border-[#D1DCC2]"
        };
    }
  };

  const getWhatsAppBadge = (status: WhatsAppStatus) => {
    switch (status) {
      case "WHATSAPP_CONFIRMED":
        return {
          label: "WhatsApp Confirmed",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200"
        };
      case "BUSINESS_PUBLICLY_ADVERTISES_WHATSAPP":
        return {
          label: "Public WhatsApp Action Signal",
          className: "bg-teal-50 text-teal-700 border-teal-200"
        };
      case "PUBLIC_PHONE_ONLY":
        return {
          label: "Public Phone Only (WA Unknown)",
          className: "bg-[#F5F5EF] text-[#7B7F73] border-[#E2E4DA]"
        };
      default:
        return {
          label: "WhatsApp Unknown",
          className: "bg-[#F5F5EF] text-[#7B7F73] border-[#E2E4DA]"
        };
    }
  };

  const statsNoWebsite = results.filter(r => r.website_status === "NO_WEBSITE").length;
  const statsWhatsAppSignals = results.filter(r => 
    r.whatsapp_status === "BUSINESS_PUBLICLY_ADVERTISES_WHATSAPP" || r.whatsapp_status === "WHATSAPP_CONFIRMED"
  ).length;
  const statsHighIntent = results.filter(r => r.buying_intent === "HIGH").length;
  const statsAvgScore = results.length > 0 
    ? Math.round(results.reduce((acc, r) => acc + (r.lead_score || 0), 0) / results.length) 
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-[#FCFCF8] border border-[#E2E4DA] rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wide uppercase bg-[#E7EEDB] text-[#424C37] border border-[#D1DCC2] flex items-center gap-1">
                <Compass className="w-3 h-3 text-[#59664A]" />
                Directory Prospector Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                No-Fabrication Policy Enforced
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#252620] tracking-tight">
              Local & Global Business Discovery
            </h1>
            <p className="text-xs text-[#7B7F73] leading-relaxed">
              Find high-fit prospects with verifiable public metadata across 18+ Indian commercial hubs and 12+ international tech markets. Includes deterministic no-website detection, WhatsApp signals, and 7-factor explainable scoring.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#F5F5EF] p-1 rounded-xl border border-[#E2E4DA]">
              <button
                onClick={() => handleCountryModeChange("LOCAL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  countryMode === "LOCAL"
                    ? "bg-white text-[#252620] shadow-sm font-semibold"
                    : "text-[#7B7F73] hover:text-[#252620]"
                }`}
              >
                🇮🇳 Local Hubs (India)
              </button>
              <button
                onClick={() => handleCountryModeChange("FOREIGN")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  countryMode === "FOREIGN"
                    ? "bg-white text-[#252620] shadow-sm font-semibold"
                    : "text-[#7B7F73] hover:text-[#252620]"
                }`}
              >
                🌐 Global Clients (US/UK/UAE)
              </button>
            </div>
          </div>
        </div>

        {/* 1-Click Search Presets */}
        <div className="mt-5 pt-4 border-t border-[#E2E4DA]">
          <div className="text-[11px] font-semibold text-[#252620] mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#59664A]" />
            <span>Ready-to-Run Discovery Presets</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {PRESET_SEARCHES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(preset)}
                className="text-left p-2.5 rounded-xl border border-[#E2E4DA] bg-white hover:bg-[#F5F5EF] hover:border-[#59664A]/40 transition-all group relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-[#252620] group-hover:text-[#59664A] transition-colors flex items-center gap-1">
                      <span>{preset.title}</span>
                    </div>
                    <div className="text-[10px] text-[#7B7F73] line-clamp-1 mt-0.5">
                      {preset.subtitle}
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#7B7F73] group-hover:text-[#59664A] group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-[#FCFCF8] border border-[#E2E4DA] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Location Country / City */}
          {countryMode === "LOCAL" ? (
            <>
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#7B7F73] font-semibold mb-1">
                  City / Hub
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full text-xs bg-white border border-[#E2E4DA] rounded-xl px-2.5 py-2 text-[#252620] focus:outline-none focus:border-[#59664A]"
                >
                  <option value="All">All Indian Cities</option>
                  {LOCAL_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#7B7F73] font-semibold mb-1">
                  Area / Sector
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sector 17, Connaught Place"
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full text-xs bg-white border border-[#E2E4DA] rounded-xl px-2.5 py-2 text-[#252620] focus:outline-none focus:border-[#59664A]"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#7B7F73] font-semibold mb-1">
                  Target Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full text-xs bg-white border border-[#E2E4DA] rounded-xl px-2.5 py-2 text-[#252620] focus:outline-none focus:border-[#59664A]"
                >
                  {FOREIGN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#7B7F73] font-semibold mb-1">
                  City / State (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. London, Austin, Dubai"
                  value={selectedCity === "All" ? "" : selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value || "All")}
                  className="w-full text-xs bg-white border border-[#E2E4DA] rounded-xl px-2.5 py-2 text-[#252620] focus:outline-none focus:border-[#59664A]"
                />
              </div>
            </>
          )}

          {/* Category */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-[#7B7F73] font-semibold mb-1">
              Category / Industry
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs bg-white border border-[#E2E4DA] rounded-xl px-2.5 py-2 text-[#252620] focus:outline-none focus:border-[#59664A]"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Website Status */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-[#7B7F73] font-semibold mb-1">
              Website Status
            </label>
            <select
              value={websiteStatusFilter}
              onChange={(e) => setWebsiteStatusFilter(e.target.value)}
              className="w-full text-xs bg-white border border-[#E2E4DA] rounded-xl px-2.5 py-2 text-[#252620] focus:outline-none focus:border-[#59664A]"
            >
              <option value="All">Any Status</option>
              <option value="NO_WEBSITE">No Official Website</option>
              <option value="WEAK_WEBSITE">Weak / Outdated Web</option>
              <option value="WEBSITE_PLUS_AUTOMATION">Website Exists</option>
            </select>
          </div>

          {/* WhatsApp Signal */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-[#7B7F73] font-semibold mb-1">
              WhatsApp Signal
            </label>
            <select
              value={whatsappFilter}
              onChange={(e) => setWhatsappFilter(e.target.value)}
              className="w-full text-xs bg-white border border-[#E2E4DA] rounded-xl px-2.5 py-2 text-[#252620] focus:outline-none focus:border-[#59664A]"
            >
              <option value="All">Any Signal</option>
              <option value="BUSINESS_PUBLICLY_ADVERTISES_WHATSAPP">Public WhatsApp Action Signal</option>
              <option value="WHATSAPP_CONFIRMED">WhatsApp Confirmed</option>
              <option value="PUBLIC_PHONE_ONLY">Public Phone Only</option>
            </select>
          </div>

          {/* Limit */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-[#7B7F73] font-semibold mb-1">
              Max Businesses
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full text-xs bg-white border border-[#E2E4DA] rounded-xl px-2.5 py-2 text-[#252620] focus:outline-none focus:border-[#59664A]"
            >
              <option value={10}>10 Businesses</option>
              <option value={25}>25 Businesses</option>
              <option value={50}>50 Businesses</option>
              <option value={100}>100 Businesses</option>
              <option value={250}>250 Businesses</option>
              <option value={500}>500 Businesses</option>
            </select>
          </div>
        </div>

        {/* Search Bar & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#7B7F73] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by keywords (e.g. 'dental implants', 'exporter', 'cloud migration', 'luxury')"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && executeSearch()}
              className="w-full text-xs bg-white border border-[#E2E4DA] rounded-xl pl-9 pr-4 py-2.5 text-[#252620] focus:outline-none focus:border-[#59664A]"
            />
          </div>

          <button
            onClick={() => executeSearch()}
            disabled={isLoading}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#59664A] hover:bg-[#47523B] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 shrink-0"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Prospecting...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Search Businesses</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#FCFCF8] border border-[#E2E4DA] rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-[#7B7F73] uppercase font-semibold">Total Discovered</div>
          <div className="text-xl font-bold font-serif text-[#252620] mt-0.5">{results.length}</div>
          <div className="text-[10px] text-[#7B7F73] mt-0.5">Backed by source provenance</div>
        </div>
        <div className="bg-[#FCFCF8] border border-[#E2E4DA] rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-rose-700 uppercase font-semibold">No Website Leads</div>
          <div className="text-xl font-bold font-serif text-rose-700 mt-0.5">{statsNoWebsite}</div>
          <div className="text-[10px] text-[#7B7F73] mt-0.5">High development opportunity</div>
        </div>
        <div className="bg-[#FCFCF8] border border-[#E2E4DA] rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-teal-700 uppercase font-semibold">WhatsApp Signals</div>
          <div className="text-xl font-bold font-serif text-teal-700 mt-0.5">{statsWhatsAppSignals}</div>
          <div className="text-[10px] text-[#7B7F73] mt-0.5">Verified public business actions</div>
        </div>
        <div className="bg-[#FCFCF8] border border-[#E2E4DA] rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-[#59664A] uppercase font-semibold">Average Lead Score</div>
          <div className="text-xl font-bold font-serif text-[#59664A] mt-0.5">{statsAvgScore} / 100</div>
          <div className="text-[10px] text-[#7B7F73] mt-0.5">{statsHighIntent} high buying intent</div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <div className="text-xs font-semibold text-[#252620] flex items-center gap-2">
          <span>Discovery Results</span>
          {activeQuerySummary && (
            <span className="text-[11px] text-[#7B7F73] font-normal">({activeQuerySummary})</span>
          )}
        </div>
        <div className="text-[10px] font-mono text-[#7B7F73]">
          Showing {results.length} qualified prospects
        </div>
      </div>

      {/* Results List */}
      {results.length === 0 && !isLoading && (
        <div className="bg-[#FCFCF8] border border-dashed border-[#E2E4DA] rounded-2xl p-12 text-center space-y-3">
          <Building2 className="w-8 h-8 text-[#7B7F73] mx-auto opacity-50" />
          <div className="text-sm font-semibold text-[#252620]">No Businesses Found</div>
          <p className="text-xs text-[#7B7F73] max-w-sm mx-auto">
            Try adjusting your location, category, or keyword filters, or click one of the pre-configured discovery buttons above.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((candidate, idx) => {
          const webBadge = getWebsiteBadge(candidate.website_status);
          const waBadge = getWhatsAppBadge(candidate.whatsapp_status);
          const isImported = importedSuccessIds.has(candidate.company_name);
          const isImporting = importingId === candidate.company_name;

          return (
            <div
              key={idx}
              className="bg-[#FCFCF8] border border-[#E2E4DA] hover:border-[#59664A]/50 rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between space-y-4"
            >
              {/* Card Header */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#252620] font-serif leading-tight">
                        {candidate.company_name}
                      </h3>
                      {candidate.lead_type && (
                        <span className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                          candidate.lead_type === "REAL"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}>
                          {candidate.lead_type}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#7B7F73] mt-1 flex-wrap">
                      <span className="font-medium text-[#252620]">{candidate.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#7B7F73]" />
                        {candidate.area ? `${candidate.area}, ` : ""}{candidate.city}, {candidate.country}
                      </span>
                      {candidate.rating && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                            {candidate.rating}
                            {candidate.review_count ? ` (${candidate.review_count})` : ""}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Score Pill */}
                  <div className="text-right shrink-0">
                    <div className="text-base font-bold font-serif text-[#59664A]">
                      {candidate.lead_score} <span className="text-[10px] text-[#7B7F73] font-normal">/ 100</span>
                    </div>
                    <div className="text-[9px] font-mono text-[#7B7F73]">
                      Lead Score
                    </div>
                  </div>
                </div>

                {/* Badges Bar */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${webBadge.className}`}>
                    {webBadge.label}
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${waBadge.className}`}>
                    {waBadge.label}
                  </span>
                  {candidate.buying_intent === "HIGH" && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      High Intent Signal
                    </span>
                  )}
                </div>
              </div>

              {/* Contact Metadata Bar */}
              <div className="bg-[#F5F5EF] p-2.5 rounded-xl border border-[#E2E4DA] space-y-1.5 text-xs text-[#252620]">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3.5 h-3.5 text-[#7B7F73] shrink-0" />
                    <span className="truncate">
                      {candidate.phone ? candidate.phone : <span className="text-[#7B7F73] italic">No public phone</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Globe className="w-3.5 h-3.5 text-[#7B7F73] shrink-0" />
                    <span className="truncate">
                      {candidate.website_url ? (
                        <a href={candidate.website_url} target="_blank" rel="noreferrer" className="text-[#59664A] hover:underline truncate">
                          {candidate.website_url.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <span className="text-rose-600 italic">No official website</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Opportunity & Why Terminal Labs Box */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-[#252620] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#59664A]" />
                  <span>Opportunity: {candidate.potential_opportunity}</span>
                </div>
                <div className="text-[11px] text-[#7B7F73] leading-snug">
                  {candidate.why_terminal_labs || "Public business presence with strong digital infrastructure modernization requirements."}
                </div>
              </div>

              {/* Multi-Factor Confidence Separators */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#E2E4DA] text-[10px] font-mono text-[#7B7F73]">
                <div>
                  Evidence Conf: <span className="font-semibold text-[#252620]">{candidate.evidence_confidence}%</span>
                </div>
                <div>
                  Contact Conf: <span className="font-semibold text-[#252620]">{candidate.contact_confidence}%</span>
                </div>
              </div>

              {/* Source Provenance */}
              <div className="text-[9px] font-mono text-[#7B7F73] truncate">
                Source: {candidate.source_names.join(", ")} ({candidate.source_type})
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E2E4DA]">
                {candidate.phone && candidate.whatsapp_status !== "INVALID" && (
                  <a
                    href={`https://wa.me/${candidate.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(candidate.company_name)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg border border-[#E2E4DA] hover:bg-[#E7EEDB] text-[11px] font-medium text-[#252620] flex items-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3 h-3 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  {isImported ? (
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Added to CRM</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleImportToCRM(candidate)}
                      disabled={isImporting}
                      className="px-3.5 py-1.5 rounded-lg bg-[#59664A] hover:bg-[#47523B] text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                    >
                      {isImporting ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Importing & Researching...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to CRM</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
