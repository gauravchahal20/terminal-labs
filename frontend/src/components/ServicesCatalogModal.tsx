"use client";

import React, { useState } from "react";
import { TERMINAL_LABS_SERVICES, ServiceMeta } from "@/lib/services-catalog";
import { X, ExternalLink, Layers } from "lucide-react";

interface ServicesCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ServicesCatalogModal: React.FC<ServicesCatalogModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  if (!isOpen) return null;

  const services = Object.values(TERMINAL_LABS_SERVICES);
  const categories = ["All", ...Array.from(new Set(services.map((s) => s.category)))];

  const filteredServices = services.filter(
    (s) => selectedCategory === "All" || s.category === selectedCategory
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#252620]/30 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div 
        className="w-full max-w-5xl bg-[#FCFCF8] border border-[#E2E4DA] rounded-2xl overflow-hidden shadow-xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E2E4DA] bg-[#F5F5EF]/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif text-[#252620] font-normal">
              Terminal Labs 15 Core Services
            </h2>
            <p className="text-xs text-[#7B7F73]">
              Official capabilities catalog mapped to autonomous opportunity matching
            </p>
          </div>

          <button onClick={onClose} className="p-1 rounded-md text-[#7B7F73] hover:text-[#252620]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="p-3 px-6 border-b border-[#E2E4DA] flex items-center gap-1.5 overflow-x-auto text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedCategory === cat
                  ? "bg-[#E7EEDB] text-[#252620] font-semibold"
                  : "text-[#7B7F73] hover:text-[#252620] hover:bg-[#F5F5EF]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <div
              key={service.key}
              className="editorial-card p-4 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#59664A] bg-[#E7EEDB] px-2 py-0.5 rounded font-medium">
                    {service.category}
                  </span>
                </div>

                <h3 className="text-sm font-serif font-medium text-[#252620]">
                  {service.name}
                </h3>

                <p className="text-xs text-[#7B7F73] leading-relaxed line-clamp-2">
                  {service.description}
                </p>

                <div className="pt-2 border-t border-[#E2E4DA] space-y-1">
                  <span className="text-[10px] text-[#7B7F73] uppercase tracking-wider block">
                    Capabilities
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {service.sub_capabilities.map((cap) => (
                      <span key={cap} className="px-1.5 py-0.5 rounded text-[10px] bg-[#F5F5EF] text-[#252620] border border-[#E2E4DA]">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E2E4DA] flex items-center justify-between text-xs">
                <span className="text-[10px] text-[#7B7F73]">Workflow Details</span>
                <a
                  href={service.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-[#59664A] hover:underline flex items-center gap-1"
                >
                  Learn Details <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Retainers Bottom Banner */}
        <div className="p-4 px-6 border-t border-[#E2E4DA] bg-[#F5F5EF] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-[#252620]">Custom Engineering & Dedicated Retainers</span>
            <p className="text-[#7B7F73] text-[11px]">Bespoke SLA packages, multi-agent ecosystems, and dedicated retainer teams.</p>
          </div>
          <a
            href="https://labs-terminal.vercel.app/contact"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 bg-[#252620] text-white rounded-lg font-medium hover:bg-[#383A31] transition-colors flex items-center gap-1"
          >
            Contact Team <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
