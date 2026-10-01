"use client";

import React from "react";
import { Terminal, Bot, Sparkles, RefreshCw, Plus, Layers, BarChart3, Users, Kanban, ExternalLink } from "lucide-react";

interface NavbarProps {
  activeTab: "dashboard" | "leads" | "pipeline" | "services";
  setActiveTab: (tab: "dashboard" | "leads" | "pipeline" | "services") => void;
  onOpenAgentTerminal: () => void;
  onOpenNewLeadModal: () => void;
  onResetDemo: () => void;
  isResettingDemo: boolean;
  leadCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAgentTerminal,
  onOpenNewLeadModal,
  onResetDemo,
  isResettingDemo,
  leadCount,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#07090e]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Agency Identity */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 glow-cyan">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black tracking-wider text-lg text-white font-mono">
                    TERMINAL<span className="text-cyan-400">.LABS</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded">
                    Lead Intelligence
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Autonomous B2B Qualification Engine
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-800">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === "dashboard"
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Executive Dashboard
              </button>

              <button
                onClick={() => setActiveTab("leads")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === "leads"
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Users className="w-4 h-4" />
                Lead Intelligence
                {leadCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
                    {leadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("pipeline")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === "pipeline"
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Kanban className="w-4 h-4" />
                CRM Pipeline
              </button>

              <button
                onClick={() => setActiveTab("services")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === "services"
                    ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Layers className="w-4 h-4" />
                15 Core Services
              </button>
            </nav>
          </div>

          {/* Action Triggers */}
          <div className="flex items-center gap-3">
            {/* Seed / Reset Demo Dataset Button */}
            <button
              onClick={onResetDemo}
              disabled={isResettingDemo}
              title="Reset high-fidelity demo companies"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-slate-300 bg-slate-900 border border-slate-700/80 hover:border-slate-500 hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isResettingDemo ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Demo Mode</span>
            </button>

            {/* Manual Add Lead */}
            <button
              onClick={onOpenNewLeadModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800/90 border border-slate-700 hover:bg-slate-700 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Add Target</span>
            </button>

            {/* Launch Autonomous Agent Terminal */}
            <button
              onClick={onOpenAgentTerminal}
              className="relative group flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-black bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <Bot className="w-4 h-4" />
              <span>Launch Agents</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
