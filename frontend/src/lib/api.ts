import { Lead, AnalyticsData, DiscoveryFilterRequest, LeadStatus } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class ApiService {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      return await response.json();
    } catch (err: any) {
      console.warn(`Fetch to ${url} encountered an error:`, err.message);
      throw err;
    }
  }

  // Analytics
  static async getAnalytics(): Promise<AnalyticsData> {
    return this.request<AnalyticsData>("/analytics/dashboard");
  }

  // Leads
  static async getLeads(params?: {
    page?: number;
    limit?: number;
    search?: string;
    industry?: string;
    status?: string;
    sort_by?: string;
  }): Promise<{ total: number; page: number; limit: number; leads: Lead[] }> {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.search) query.append("search", params.search);
    if (params?.industry && params.industry !== "All") query.append("industry", params.industry);
    if (params?.status && params.status !== "All") query.append("status", params.status);
    if (params?.sort_by) query.append("sort_by", params.sort_by);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    return this.request(`/leads${queryString}`);
  }

  static async getLead(id: string): Promise<Lead> {
    return this.request<Lead>(`/leads/${id}`);
  }

  static async createLead(data: Partial<Lead>, runEnrichment = true): Promise<Lead> {
    return this.request<Lead>(`/leads?run_enrichment=${runEnrichment}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
    return this.request<Lead>(`/leads/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  static async deleteLead(id: string): Promise<{ status: string; id: string }> {
    return this.request<{ status: string; id: string }>(`/leads/${id}`, {
      method: "DELETE",
    });
  }

  // Autonomous Agent Triggers
  static async triggerDiscovery(filter: DiscoveryFilterRequest): Promise<{
    status: string;
    discovered_count: number;
    enriched_count: number;
    leads: any[];
  }> {
    return this.request("/agents/discovery", {
      method: "POST",
      body: JSON.stringify(filter),
    });
  }

  static async resetSeedDemo(): Promise<{ status: string; message: string }> {
    return this.request("/agents/seed-demo", {
      method: "POST",
    });
  }

  static async runLeadPipeline(leadId: string): Promise<Lead> {
    return this.request<Lead>(`/leads/${leadId}/run-pipeline`, {
      method: "POST",
    });
  }

  // Pipeline Kanban
  static async getPipeline(): Promise<Record<string, Lead[]>> {
    return this.request<Record<string, Lead[]>>("/pipeline");
  }

  static async updateLeadStatus(leadId: string, status: LeadStatus, note?: string): Promise<{ status: string; new_status: string }> {
    return this.request(`/pipeline/${leadId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, note }),
    });
  }

  // Outreach Approvals & Dispatch
  static async toggleOutreachApproval(draftId: string, is_approved: boolean): Promise<any> {
    return this.request(`/outreach/${draftId}/approve`, {
      method: "PUT",
      body: JSON.stringify({ is_approved }),
    });
  }

  static async editOutreachDraft(draftId: string, data: {
    cold_email_subject?: string;
    cold_email_body?: string;
    linkedin_inmail_body?: string;
    short_followup_body?: string;
    whatsapp_message_body?: string;
  }): Promise<any> {
    return this.request(`/outreach/${draftId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  static async sendLiveEmail(draftId: string, payload?: {
    custom_recipient?: string;
    custom_subject?: string;
    custom_body?: string;
  }): Promise<any> {
    return this.request(`/outreach/${draftId}/send-email`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
  }

  static async sendTestEmail(draftId: string, testRecipient?: string): Promise<any> {
    return this.request(`/outreach/${draftId}/send-test`, {
      method: "POST",
      body: JSON.stringify({ test_recipient: testRecipient }),
    });
  }

  static async sendWhatsApp(draftId: string, payload?: {
    custom_recipient_phone?: string;
    custom_message?: string;
  }): Promise<any> {
    return this.request(`/outreach/${draftId}/send-whatsapp`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
  }

  static async batchSendEmails(draftIds: string[]): Promise<any> {
    return this.request("/outreach/batch-send", {
      method: "POST",
      body: JSON.stringify({ draft_ids: draftIds }),
    });
  }

  // Connected Email Account & Google OAuth 2.0
  static async getEmailAccount(): Promise<any> {
    return this.request("/email-account");
  }

  static async updateEmailAccount(data: any): Promise<any> {
    return this.request("/email-account", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async getGoogleOAuthUrl(): Promise<{ auth_url: string; client_id: string; is_configured: boolean }> {
    return this.request("/email-account/google/auth-url");
  }

  static async handleGoogleOAuthCallback(code: string, mockEmail?: string): Promise<any> {
    return this.request("/email-account/google/callback", {
      method: "POST",
      body: JSON.stringify({ code, mock_email: mockEmail }),
    });
  }

  static async disconnectGoogleAccount(): Promise<any> {
    return this.request("/email-account/google/disconnect", {
      method: "POST",
    });
  }

  static async testEmailConnection(): Promise<any> {
    return this.request("/email-account/test-connection", {
      method: "POST",
      body: JSON.stringify({}),
    });
  }

  static async getDispatchLogs(limit = 25): Promise<any[]> {
    return this.request(`/email-account/dispatch-logs?limit=${limit}`);
  }

  static async getDiscoveryRuns(limit = 15): Promise<any[]> {
    return this.request(`/agents/discovery-runs?limit=${limit}`);
  }

  // Directory Extractor (JustDial / IndiaMART / Local)
  static async extractDirectoryLeads(params: {
    industry_or_keyword?: string;
    city?: string;
    platform?: string;
    has_no_website_only?: boolean;
    limit?: number;
    auto_ingest?: boolean;
  }): Promise<any> {
    return this.request("/directory/extract", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  static async parseRawDirectoryHtml(params: {
    raw_html: string;
    city?: string;
    platform?: string;
    auto_ingest?: boolean;
  }): Promise<any> {
    return this.request("/directory/parse-raw", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  static async ingestDirectoryLeads(records: any[], autoQualify = true): Promise<any> {
    return this.request("/directory/ingest", {
      method: "POST",
      body: JSON.stringify({ records, auto_qualify: autoQualify }),
    });
  }

  // Business Directory Search (Phase 5 Local & Global Discovery Engine)
  static async searchDirectory(params: {
    category?: string;
    city?: string;
    area?: string;
    country?: string;
    website_status?: string;
    whatsapp_signal?: string;
    buying_intent?: string;
    keywords?: string;
    limit?: number;
  }): Promise<{ status: string; query: any; total_results: number; businesses: any[] }> {
    const query = new URLSearchParams();
    if (params.category && params.category !== "All") query.append("category", params.category);
    if (params.city && params.city !== "All") query.append("city", params.city);
    if (params.area && params.area !== "All") query.append("area", params.area);
    if (params.country) query.append("country", params.country);
    if (params.website_status) query.append("website_status", params.website_status);
    if (params.whatsapp_signal) query.append("whatsapp_signal", params.whatsapp_signal);
    if (params.buying_intent) query.append("buying_intent", params.buying_intent);
    if (params.keywords) query.append("keywords", params.keywords);
    if (params.limit) query.append("limit", params.limit.toString());

    return this.request(`/leads/directory/search?${query.toString()}`);
  }

  static async importCandidateToCRM(candidate: any): Promise<Lead> {
    return this.request<Lead>("/leads/directory/import-to-crm", {
      method: "POST",
      body: JSON.stringify(candidate),
    });
  }

  // Production Readiness & Quality Audit (Phase 4 / 5)
  static async getProductionReadiness(): Promise<any> {
    return this.request("/analytics/production-readiness");
  }

  // Health
  static async getHealth(): Promise<{ status: string; service: string; environment: string; demo_mode: boolean }> {
    return this.request("/health");
  }
}

