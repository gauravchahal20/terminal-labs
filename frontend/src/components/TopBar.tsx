"use client";

import React from "react";
import { Search, Bell, Sparkles, RefreshCw, Plus, Bot, Layers } from "lucide-react";

interface TopBarProps {
  currentTabName: string;
  onOpenAgentTerminal: () => void;
  onOpenNewLeadModal: () => void;
  onOpenEmailSettings: () => void;
  onResetDemo: () => void;
  isResettingDemo: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  connectedEmail?: string;
  isMailConnected?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTabName,
  onOpenAgentTerminal,
  onOpenNewLeadModal,
  onOpenEmailSettings,
  onResetDemo,
  isResettingDemo,
  searchTerm,
  setSearchTerm,
  connectedEmail = "partnerships@terminallabs.com",
  isMailConnected = true,
}) => {
  return (
    <header className="h-16 px-8 border-b border-[#E2E4DA] bg-[#FCFCF8] flex items-center justify-between sticky top-0 z-20">
      {/* Left: Breadcrumbs / Page Context */}
      <div className="flex items-center gap-2 text-xs text-[#7B7F73]">
        <span className="hover:text-[#252620] cursor-pointer">Terminal Labs</span>
        <span>/</span>
        <span className="font-semibold text-[#252620] capitalize">{currentTabName}</span>
      </div>

      {/* Right: Search, Mail, Demo, Add Lead, Launch Agents */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:block w-64">
          <Search className="w-3.5 h-3.5 text-[#7B7F73] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads, domains, services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#F5F5EF] border border-[#E2E4DA] rounded-lg text-xs text-[#252620] placeholder:text-[#7B7F73] focus:outline-none focus:border-[#A8B98D] transition-colors"
          />
        </div>

        {/* Mailbox Connection Button */}
        <button
          onClick={onOpenEmailSettings}
          title="Manage Connected Google Mailbox & Outreach"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#252620] bg-[#E7EEDB]/80 border border-[#A8B98D]/50 hover:bg-[#D9E2CC] transition-colors"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden lg:inline">{connectedEmail}</span>
          <span className="lg:hidden">Mail</span>
        </button>

        {/* Demo Mode Toggle */}
        <button
          onClick={onResetDemo}
          disabled={isResettingDemo}
          title="Reset verified sample companies"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#7B7F73] bg-[#FCFCF8] border border-[#E2E4DA] hover:bg-[#F5F5EF] hover:text-[#252620] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResettingDemo ? "animate-spin text-[#59664A]" : ""}`} />
          <span className="hidden md:inline">Demo Seed</span>
        </button>

        {/* Add Lead */}
        <button
          onClick={onOpenNewLeadModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#252620] bg-[#FCFCF8] border border-[#E2E4DA] hover:bg-[#F5F5EF] transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-[#59664A]" />
          <span>Add Target</span>
        </button>

        {/* Launch Autonomous Agents */}
        <button
          onClick={onOpenAgentTerminal}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#252620] hover:bg-[#3B3D34] active:scale-95 transition-all shadow-sm"
        >
          <Bot className="w-3.5 h-3.5 text-[#A8B98D]" />
          <span>Launch Agents</span>
        </button>
      </div>
    </header>
  );
};
