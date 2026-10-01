"use client";

import React from "react";
import { Lead, LeadStatus } from "@/types";
import { TERMINAL_LABS_SERVICES } from "@/lib/services-catalog";
import { 
  ChevronRight, 
  ChevronLeft, 
  ArrowUpRight,
  Sparkles
} from "lucide-react";

interface PipelineKanbanViewProps {
  pipeline: Record<string, Lead[]>;
  onSelectLead: (leadId: string) => void;
  onUpdateStatus: (leadId: string, status: LeadStatus) => void;
}

const STAGE_CONFIG: { status: LeadStatus; label: string }[] = [
  { status: "New", label: "New Leads" },
  { status: "Researching", label: "Researching" },
  { status: "Qualified", label: "Qualified" },
  { status: "Contacted", label: "Contacted" },
  { status: "Replied", label: "Replied" },
  { status: "Meeting", label: "Meeting Booked" },
  { status: "Proposal", label: "Proposal Sent" },
  { status: "Won", label: "Closed / Won" },
  { status: "Lost", label: "Lost" },
];

export const PipelineKanbanView: React.FC<PipelineKanbanViewProps> = ({
  pipeline,
  onSelectLead,
  onUpdateStatus,
}) => {
  const getNextStage = (current: LeadStatus): LeadStatus | null => {
    const order: LeadStatus[] = ["New", "Researching", "Qualified", "Contacted", "Replied", "Meeting", "Proposal", "Won"];
    const idx = order.indexOf(current);
    return idx !== -1 && idx < order.length - 1 ? order[idx + 1] : null;
  };

  const getPrevStage = (current: LeadStatus): LeadStatus | null => {
    const order: LeadStatus[] = ["New", "Researching", "Qualified", "Contacted", "Replied", "Meeting", "Proposal", "Won"];
    const idx = order.indexOf(current);
    return idx > 0 ? order[idx - 1] : null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <div className="pb-2 border-b border-[#E2E4DA]">
        <h1 className="text-2xl sm:text-3xl font-serif text-[#252620] font-normal tracking-tight">
          Pipeline & Conversions
        </h1>
        <p className="text-xs text-[#7B7F73] mt-0.5">
          9-stage opportunity pipeline with autonomous qualification progression.
        </p>
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1">
        {STAGE_CONFIG.map(({ status, label }) => {
          const columnLeads = pipeline[status] || [];

          return (
            <div
              key={status}
              className="flex-shrink-0 w-72 bg-[#FCFCF8] rounded-2xl border border-[#E2E4DA] flex flex-col max-h-[75vh]"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-[#E2E4DA] flex items-center justify-between bg-[#F5F5EF]/40 rounded-t-2xl">
                <span className="text-xs font-medium text-[#252620]">{label}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#E7EEDB] text-[10px] font-mono font-medium text-[#59664A]">
                  {columnLeads.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1">
                {columnLeads.length === 0 ? (
                  <div className="py-8 text-center text-[#7B7F73] text-xs font-serif">
                    No leads in this stage
                  </div>
                ) : (
                  columnLeads.map((lead) => {
                    const recService = lead.opportunity?.recommended_service;
                    const nextStage = getNextStage(lead.status);
                    const prevStage = getPrevStage(lead.status);
                    const primaryDm = lead.decision_makers?.find((dm) => dm.is_primary) || lead.decision_makers?.[0];

                    return (
                      <div
                        key={lead.id}
                        onClick={() => onSelectLead(lead.id)}
                        className="p-3.5 rounded-xl bg-[#FCFCF8] border border-[#E2E4DA] hover:border-[#A8B98D] cursor-pointer transition-all space-y-2.5 shadow-2xs group"
                      >
                        {/* Company & Score */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-medium text-xs text-[#252620] group-hover:text-[#59664A] transition-colors">
                              {lead.company_name}
                            </div>
                            <div className="text-[10px] text-[#7B7F73] font-mono">
                              {lead.domain} • {lead.country}
                            </div>
                          </div>

                          {lead.score && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E7EEDB] text-[#59664A] shrink-0">
                              {lead.score.total_score}
                            </span>
                          )}
                        </div>

                        {/* Matched Service */}
                        {recService && (
                          <div className="text-[11px] font-medium text-[#59664A] bg-[#E7EEDB]/60 border border-[#D1DCC2] px-2 py-0.5 rounded-md">
                            {recService}
                          </div>
                        )}

                        {/* Decision Maker */}
                        {primaryDm && (
                          <div className="text-[10px] text-[#7B7F73] pt-1 border-t border-[#E2E4DA]">
                            {primaryDm.full_name} ({primaryDm.title})
                          </div>
                        )}

                        {/* Advance Footer */}
                        <div className="flex items-center justify-between pt-1 border-t border-[#E2E4DA]" onClick={(e) => e.stopPropagation()}>
                          <div>
                            {prevStage && (
                              <button
                                onClick={() => onUpdateStatus(lead.id, prevStage)}
                                title={`Move back to ${prevStage}`}
                                className="p-1 rounded bg-[#F5F5EF] hover:bg-[#E7EEDB] text-[#7B7F73] hover:text-[#252620]"
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <div>
                            {nextStage && (
                              <button
                                onClick={() => onUpdateStatus(lead.id, nextStage)}
                                className="flex items-center gap-0.5 px-2 py-0.5 rounded bg-[#252620] hover:bg-[#383A31] text-white text-[10px] font-medium transition-colors"
                              >
                                <span>Advance</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
