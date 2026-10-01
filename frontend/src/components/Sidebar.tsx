"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Search, 
  UserCheck, 
  Kanban, 
  Send, 
  BarChart3, 
  Settings, 
  Layers, 
  Bot, 
  ChevronRight,
  ExternalLink,
  Database
} from "lucide-react";

export type NavTab = 
  | "dashboard" 
  | "leads" 
  | "companies" 
  | "research" 
  | "contacts" 
  | "pipeline" 
  | "campaigns" 
  | "analytics" 
  | "services";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  leadCount: number;
  onOpenServices: () => void;
  onOpenDirectoryExtractor?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  leadCount,
  onOpenServices,
  onOpenDirectoryExtractor,
}) => {
  const mainNavItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "leads", label: "Lead Intelligence", icon: Users, badge: leadCount },
    { id: "companies", label: "Companies", icon: Building2 },
    { id: "research", label: "Research", icon: Search },
    { id: "contacts", label: "Decision Makers", icon: UserCheck },
    { id: "pipeline", label: "Pipeline", icon: Kanban },
    { id: "campaigns", label: "Campaigns", icon: Send },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <aside className="w-60 shrink-0 bg-[#FCFCF8] border-r border-[#E2E4DA] flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      {/* Top Section: Logo & Brand */}
      <div className="p-5 space-y-6">
        {/* Terminal Labs Brand */}
        <div className="flex items-center gap-2.5 px-2 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
          <div className="w-7 h-7 rounded-lg bg-[#59664A] flex items-center justify-center text-white text-xs font-serif font-bold">
            TL
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight text-[#252620]">
              Terminal Labs
            </div>
            <div className="text-[10px] text-[#7B7F73] font-medium tracking-wide">
              Lead Intelligence OS
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1">
          {mainNavItems.map(({ id, label, icon: Icon, badge }) => {
            const isActive = activeTab === id;

            return (
              <button
                key={id}
                onClick={() => setActiveTab(id as NavTab)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                  isActive
                    ? "bg-[#E7EEDB] text-[#252620] font-semibold"
                    : "text-[#7B7F73] hover:text-[#252620] hover:bg-[#F5F5EF]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#59664A]" : "text-[#7B7F73]"}`} strokeWidth={1.75} />
                  <span>{label}</span>
                </div>

                {badge !== undefined && badge > 0 && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                    isActive ? "bg-[#D5DFCA] text-[#424C37]" : "bg-[#F0F2EB] text-[#7B7F73]"
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Services & Extractor Button & User Profile Bottom */}
      <div className="p-4 space-y-2 border-t border-[#E2E4DA] bg-[#FCFCF8]">
        {onOpenDirectoryExtractor && (
          <button
            onClick={onOpenDirectoryExtractor}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-orange-600" />
              <span>JustDial Extractor</span>
            </div>
            <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-orange-200/60 text-orange-800">
              NEW
            </span>
          </button>
        )}

        <button
          onClick={onOpenServices}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#59664A] bg-[#E7EEDB]/60 hover:bg-[#E7EEDB] border border-[#D1DCC2] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#59664A]" />
            <span>15 Core Services</span>
          </div>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </button>

        {/* Profile Card */}
        <div className="flex items-center justify-between pt-2 px-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E7EEDB] border border-[#D1DCC2] flex items-center justify-center text-xs font-bold text-[#59664A]">
              CL
            </div>
            <div>
              <div className="text-xs font-semibold text-[#252620]">Chahal</div>
              <div className="text-[10px] text-[#7B7F73]">Lead Engineer</div>
            </div>
          </div>

          <a
            href="https://labs-terminal.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="p-1 rounded-lg text-[#7B7F73] hover:text-[#252620] hover:bg-[#F5F5EF] transition-colors"
            title="Terminal Labs Website"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </aside>
  );
};
