"use client";

import React, { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLead: (leadData: any) => Promise<void>;
  isCreating: boolean;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({
  isOpen,
  onClose,
  onCreateLead,
  isCreating,
}) => {
  const [companyName, setCompanyName] = useState("");
  const [domain, setDomain] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState("Technology");
  const [country, setCountry] = useState("United States");
  const [city, setCity] = useState("");
  const [companySize, setCompanySize] = useState("11-50");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleDomainChange = (val: string) => {
    setDomain(val);
    if (!websiteUrl || websiteUrl.includes(domain)) {
      setWebsiteUrl(val.startsWith("http") ? val : `https://${val}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !domain) return;

    await onCreateLead({
      company_name: companyName,
      domain,
      website_url: websiteUrl || `https://${domain}`,
      industry,
      country,
      city,
      company_size: companySize,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#252620]/30 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div 
        className="w-full max-w-lg bg-[#FCFCF8] border border-[#E2E4DA] rounded-2xl overflow-hidden shadow-xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 px-6 border-b border-[#E2E4DA] bg-[#F5F5EF]/50 flex items-center justify-between">
          <h2 className="text-sm font-serif font-medium text-[#252620]">Ingest Target Company</h2>
          <button onClick={onClose} className="p-1 text-[#7B7F73] hover:text-[#252620]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          <div>
            <label className="text-[11px] text-[#7B7F73] uppercase tracking-wider block mb-1">Company Name *</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Health Systems"
              className="w-full p-2 bg-[#F5F5EF] border border-[#E2E4DA] rounded-lg text-[#252620] focus:outline-none focus:border-[#A8B98D]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-[#7B7F73] uppercase tracking-wider block mb-1">Domain *</label>
              <input
                type="text"
                required
                value={domain}
                onChange={(e) => handleDomainChange(e.target.value)}
                placeholder="e.g. acmehealth.io"
                className="w-full p-2 bg-[#F5F5EF] border border-[#E2E4DA] rounded-lg text-[#252620] focus:outline-none focus:border-[#A8B98D]"
              />
            </div>

            <div>
              <label className="text-[11px] text-[#7B7F73] uppercase tracking-wider block mb-1">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full p-2 bg-[#F5F5EF] border border-[#E2E4DA] rounded-lg text-[#252620] focus:outline-none focus:border-[#A8B98D]"
              >
                <option value="SaaS & Technology">SaaS & Technology</option>
                <option value="HealthTech">HealthTech</option>
                <option value="FinTech">FinTech</option>
                <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Legal">Legal</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-[#7B7F73] uppercase tracking-wider block mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. United States"
                className="w-full p-2 bg-[#F5F5EF] border border-[#E2E4DA] rounded-lg text-[#252620] focus:outline-none focus:border-[#A8B98D]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#7B7F73] uppercase tracking-wider block mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. San Francisco"
                className="w-full p-2 bg-[#F5F5EF] border border-[#E2E4DA] rounded-lg text-[#252620] focus:outline-none focus:border-[#A8B98D]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-[#7B7F73] uppercase tracking-wider block mb-1">Notes / Observations</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Initial observations or manual cues..."
              className="w-full p-2 bg-[#F5F5EF] border border-[#E2E4DA] rounded-lg text-[#252620] focus:outline-none focus:border-[#A8B98D]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-[#7B7F73] hover:text-[#252620]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-1.5 rounded-lg text-white font-medium bg-[#252620] hover:bg-[#383A31] transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Ingest & Qualify</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
