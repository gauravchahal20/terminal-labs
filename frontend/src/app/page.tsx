"use client";

import React, { useState, useEffect } from "react";
import { Lead, DashboardAnalytics, LeadStatus, AgentDiscoveryRequest } from "@/types";
import { ApiService } from "@/lib/api";
import { Sidebar, NavTab } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { DashboardView } from "@/components/DashboardView";
import { LeadsGridView } from "@/components/LeadsGridView";
import { PipelineKanbanView } from "@/components/PipelineKanbanView";
import { LeadDetailDrawer } from "@/components/LeadDetailDrawer";
import { AgentTerminalModal } from "@/components/AgentTerminalModal";
import { ServicesCatalogModal } from "@/components/ServicesCatalogModal";
import { NewLeadModal } from "@/components/NewLeadModal";
import { ResearchPanelView } from "@/components/ResearchPanelView";
import { EmailSettingsModal } from "@/components/EmailSettingsModal";
import { CampaignSequenceView } from "@/components/CampaignSequenceView";
import { DirectoryExtractorModal } from "@/components/DirectoryExtractorModal";
import { LocalDiscoveryView } from "@/components/LocalDiscoveryView";
import { ProductionReadinessModal } from "@/components/ProductionReadinessModal";
import { SalesCockpitView } from "@/components/SalesCockpitView";

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [initialWebsiteFilter, setInitialWebsiteFilter] = useState("All");
  const [initialIntentFilter, setInitialIntentFilter] = useState("All");

  // Data States
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pipeline, setPipeline] = useState<Record<string, Lead[]>>({});
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Modal States
  const [isAgentTerminalOpen, setIsAgentTerminalOpen] = useState(false);
  const [isServicesCatalogOpen, setIsServicesCatalogOpen] = useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isEmailSettingsOpen, setIsEmailSettingsOpen] = useState(false);
  const [isDirectoryExtractorOpen, setIsDirectoryExtractorOpen] = useState(false);
  const [isProductionAuditOpen, setIsProductionAuditOpen] = useState(false);

  // Email Connection State
  const [connectedEmail, setConnectedEmail] = useState("partnerships@terminallabs.com");
  const [isMailConnected, setIsMailConnected] = useState(true);

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isResettingDemo, setIsResettingDemo] = useState(false);
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [isCreatingLead, setIsCreatingLead] = useState(false);

  const refreshData = async () => {
    try {
      const [leadsRes, pipelineRes, analyticsRes, emailRes] = await Promise.all([
        ApiService.getLeads({ limit: 50, sort_by: "score" }),
        ApiService.getPipeline(),
        ApiService.getAnalytics(),
        ApiService.getEmailAccount().catch(() => null),
      ]);

      setLeads(leadsRes.leads || []);
      setPipeline(pipelineRes || {});
      setAnalytics(analyticsRes || null);
      if (emailRes) {
        setConnectedEmail(emailRes.connected_email || emailRes.sender_email || "partnerships@terminallabs.com");
        setIsMailConnected(emailRes.is_connected ?? true);
      }
    } catch (err) {
      console.warn("Could not fetch data from API:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (selectedLeadId) {
      ApiService.getLead(selectedLeadId)
        .then((data) => setSelectedLead(data))
        .catch((err) => console.error("Error fetching lead detail:", err));
    } else {
      setSelectedLead(null);
    }
  }, [selectedLeadId]);

  const handleUpdateStatus = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await ApiService.updateLeadStatus(leadId, newStatus);
      await refreshData();
      if (selectedLeadId === leadId) {
        const updated = await ApiService.getLead(leadId);
        setSelectedLead(updated);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleRunPipeline = async (leadId: string) => {
    try {
      await ApiService.runLeadPipeline(leadId);
      await refreshData();
      if (selectedLeadId === leadId) {
        const updated = await ApiService.getLead(leadId);
        setSelectedLead(updated);
      }
    } catch (err) {
      console.error("Error running pipeline:", err);
    }
  };

  const handleResetDemo = async () => {
    setIsResettingDemo(true);
    try {
      await ApiService.resetSeedDemo();
      await refreshData();
    } catch (err) {
      console.error("Error resetting demo:", err);
    } finally {
      setIsResettingDemo(false);
    }
  };

  const handleRunDiscovery = async (filters: AgentDiscoveryRequest) => {
    setIsAgentRunning(true);
    try {
      await ApiService.triggerDiscovery(filters);
      await refreshData();
    } catch (err) {
      console.error("Error running discovery agent:", err);
    } finally {
      setIsAgentRunning(false);
    }
  };

  const handleCreateLead = async (data: any) => {
    setIsCreatingLead(true);
    try {
      const created = await ApiService.createLead(data, true);
      await refreshData();
      setSelectedLeadId(created.id);
    } catch (err) {
      console.error("Error creating lead:", err);
    } finally {
      setIsCreatingLead(false);
    }
  };

  const handleToggleApproval = async (draftId: string, isApproved: boolean) => {
    try {
      await ApiService.toggleOutreachApproval(draftId, isApproved);
      if (selectedLeadId) {
        const updated = await ApiService.getLead(selectedLeadId);
        setSelectedLead(updated);
      }
      await refreshData();
    } catch (err) {
      console.error("Error toggling approval:", err);
    }
  };

  const handleSaveOutreachEdit = async (draftId: string, data: any) => {
    try {
      await ApiService.editOutreachDraft(draftId, data);
      if (selectedLeadId) {
        const updated = await ApiService.getLead(selectedLeadId);
        setSelectedLead(updated);
      }
      await refreshData();
    } catch (err) {
      console.error("Error saving outreach edit:", err);
    }
  };

  const handleViewAllLeadsFiltered = (filter?: { website_status?: string; buying_intent?: string }) => {
    if (filter?.website_status) {
      setInitialWebsiteFilter(filter.website_status);
    } else {
      setInitialWebsiteFilter("All");
    }
    if (filter?.buying_intent) {
      setInitialIntentFilter(filter.buying_intent);
    } else {
      setInitialIntentFilter("All");
    }
    setActiveTab("leads");
  };

  const getTabDisplayName = () => {
    switch (activeTab) {
      case "dashboard": return "Overview";
      case "cockpit": return "Sales Cockpit";
      case "discovery": return "Prospector Engine";
      case "leads": return "Lead Intelligence";
      case "companies": return "Companies";
      case "research": return "Research";
      case "contacts": return "Decision Makers";
      case "pipeline": return "Pipeline";
      case "campaigns": return "Campaigns";
      case "analytics": return "Analytics";
      default: return "Overview";
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5EF] flex">
      {/* 1. FIXED NARROW LEFT SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === "services") {
            setIsServicesCatalogOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        leadCount={leads.length}
        onOpenServices={() => setIsServicesCatalogOpen(true)}
        onOpenDirectoryExtractor={() => setIsDirectoryExtractorOpen(true)}
        onOpenAudit={() => setIsProductionAuditOpen(true)}
      />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Minimal Bar */}
        <TopBar
          currentTabName={getTabDisplayName()}
          onOpenAgentTerminal={() => setIsAgentTerminalOpen(true)}
          onOpenNewLeadModal={() => setIsNewLeadModalOpen(true)}
          onOpenEmailSettings={() => setIsEmailSettingsOpen(true)}
          onResetDemo={handleResetDemo}
          isResettingDemo={isResettingDemo}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          connectedEmail={connectedEmail}
          isMailConnected={isMailConnected}
        />

        {/* Canvas Body with generous whitespace */}
        <main className="flex-1 p-8 max-w-[1500px] w-full mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="text-center space-y-2">
                <div className="w-6 h-6 border-2 border-[#59664A] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-serif text-[#7B7F73]">Connecting to Terminal Labs Intelligence...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <DashboardView
                  analytics={analytics}
                  onSelectLead={(id) => setSelectedLeadId(id)}
                  onOpenAgentTerminal={() => setIsAgentTerminalOpen(true)}
                  onExploreServices={() => setIsServicesCatalogOpen(true)}
                  onViewAllLeads={handleViewAllLeadsFiltered}
                />
              )}

              {activeTab === "cockpit" && (
                <SalesCockpitView
                  onSelectLead={(id) => setSelectedLeadId(id)}
                  onOpenDiscovery={() => setActiveTab("discovery")}
                />
              )}

              {activeTab === "discovery" && (
                <LocalDiscoveryView
                  onSelectLead={(lead) => setSelectedLeadId(lead.id)}
                  onLeadImported={(lead) => {
                    refreshData();
                    setSelectedLeadId(lead.id);
                  }}
                  onOpenOutreach={(lead) => {
                    setSelectedLeadId(lead.id);
                  }}
                />
              )}

              {(activeTab === "leads" || activeTab === "companies" || activeTab === "contacts") && (
                <LeadsGridView
                  leads={leads}
                  onSelectLead={(id) => setSelectedLeadId(id)}
                  onUpdateStatus={handleUpdateStatus}
                  onRunPipeline={handleRunPipeline}
                  onOpenNewLeadModal={() => setIsNewLeadModalOpen(true)}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  initialWebsiteStatus={initialWebsiteFilter}
                  initialBuyingIntent={initialIntentFilter}
                />
              )}

              {activeTab === "research" && (
                <ResearchPanelView
                  onRunDiscovery={handleRunDiscovery}
                  isRunning={isAgentRunning}
                  discoveredLeads={leads}
                  onSelectLead={(id) => setSelectedLeadId(id)}
                />
              )}

              {activeTab === "pipeline" && (
                <PipelineKanbanView
                  pipeline={pipeline}
                  onSelectLead={(id) => setSelectedLeadId(id)}
                  onUpdateStatus={handleUpdateStatus}
                />
              )}

              {activeTab === "campaigns" && (
                <CampaignSequenceView
                  leads={leads}
                  onSelectLead={(id) => setSelectedLeadId(id)}
                  onOpenEmailSettings={() => setIsEmailSettingsOpen(true)}
                />
              )}

              {activeTab === "analytics" && (
                <DashboardView
                  analytics={analytics}
                  onSelectLead={(id) => setSelectedLeadId(id)}
                  onOpenAgentTerminal={() => setIsAgentTerminalOpen(true)}
                  onExploreServices={() => setIsServicesCatalogOpen(true)}
                  onViewAllLeads={handleViewAllLeadsFiltered}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* 3. MODALS & DRAWERS */}
      <LeadDetailDrawer
        lead={selectedLead}
        onClose={() => setSelectedLeadId(null)}
        onUpdateStatus={handleUpdateStatus}
        onToggleApproval={handleToggleApproval}
        onSaveOutreachEdit={handleSaveOutreachEdit}
        onReRunPipeline={handleRunPipeline}
      />

      <AgentTerminalModal
        isOpen={isAgentTerminalOpen}
        onClose={() => setIsAgentTerminalOpen(false)}
        onRunDiscovery={handleRunDiscovery}
        isRunning={isAgentRunning}
      />

      <ServicesCatalogModal
        isOpen={isServicesCatalogOpen}
        onClose={() => setIsServicesCatalogOpen(false)}
      />

      <NewLeadModal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        onCreateLead={handleCreateLead}
        isCreating={isCreatingLead}
      />

      <EmailSettingsModal
        isOpen={isEmailSettingsOpen}
        onClose={() => setIsEmailSettingsOpen(false)}
        onAccountUpdated={(acc) => {
          setConnectedEmail(acc.connected_email || acc.sender_email);
          setIsMailConnected(acc.is_connected);
        }}
      />

      <DirectoryExtractorModal
        isOpen={isDirectoryExtractorOpen}
        onClose={() => setIsDirectoryExtractorOpen(false)}
        onLeadsIngested={() => refreshData()}
      />

      <ProductionReadinessModal
        isOpen={isProductionAuditOpen}
        onClose={() => setIsProductionAuditOpen(false)}
      />
    </div>
  );
}
