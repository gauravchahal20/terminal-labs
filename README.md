# Terminal Labs - AI Lead Generation & Qualification Platform

Autonomous B2B lead intelligence and qualification system custom-engineered for **Terminal Labs**.

Discover prospective clients, inspect public digital touchpoints, identify operational bottlenecks, match needs directly against **Terminal Labs' 15 core service verticals**, compute 7-factor composite scores (0-100), identify verified decision-makers with provenance citations, and generate factual outreach drafts (Cold Email, LinkedIn InMail, Follow-ups).

---

## 🚀 Terminal Labs Core 15 Services Catalog
All opportunities, scoring heuristics, and outreach drafts are mapped to Terminal Labs' 15 official services:
1. **[Web Design & Development](https://labs-terminal.vercel.app/services/web-development)** - Business Websites, Landing Pages, E-Commerce, Custom Web Apps
2. **[Mobile App Development](https://labs-terminal.vercel.app/services/mobile-app-development)** - Android, iOS, Cross Platform, Backend Integration
3. **[AI Agents](https://labs-terminal.vercel.app/services/ai-agents)** - AI Chatbots, AI Assistants, Custom Knowledge Bases, Support
4. **[WhatsApp Business Automation](https://labs-terminal.vercel.app/services/whatsapp-automation)** - WhatsApp Business API, AI Chatbots, Automated Replies, Broadcasts
5. **[Social Media Management](https://labs-terminal.vercel.app/services/social-media-management)** - Content Planning, Creative Design, Copywriting, Scheduling
6. **[Video Editing & Production](https://labs-terminal.vercel.app/services/video-editing-production)** - Promotional Videos, Reels & Shorts, Motion Graphics, Sound Design
7. **[Data Analytics & Visualization](https://labs-terminal.vercel.app/services/data-analytics-visualization)** - Interactive Dashboards, BI, Data Visualization, KPI Reporting
8. **[Ads & Content Creation](https://labs-terminal.vercel.app/services/ads-content-creation)** - Google Ads, Meta Ads, Content Creation, Creative Design
9. **[Automation Workflows](https://labs-terminal.vercel.app/services/automation-workflows)** - Workflow Automation, API Integration, Zapier & Make Automation
10. **[Search Engine Optimization (SEO)](https://labs-terminal.vercel.app/services/seo-search-engine-optimization)** - Technical SEO, On-Page SEO, Keyword Research, Content Optimization
11. **[Copywriting & Ghostwriting](https://labs-terminal.vercel.app/services/copywriting-ghostwriting)** - Website Copy, Blogs & Articles, Sales Pages, Email Campaigns
12. **[Discord Server Management](https://labs-terminal.vercel.app/services/discord-server-management)** - Server Setup, Channel Organization, Role Management, Moderation
13. **[Data Cleaning](https://labs-terminal.vercel.app/services/data-cleaning)** - Data Cleaning, Duplicate Removal, Data Validation, Spreadsheet Optimization
14. **[DevOps & Cloud Solutions](https://labs-terminal.vercel.app/services/devops-cloud-solutions)** - Cloud Deployment, CI/CD Pipelines, Docker & Kubernetes, Server Management
15. **[UI/UX & Brand Identity Design](https://labs-terminal.vercel.app/services/ui-ux-brand-identity-design)** - UI Design, UX Research, Wireframing, Prototyping

---

## 🏗️ Architecture & Modules

```
TerminalLABS/
├── backend/                  # FastAPI + Python Backend
│   ├── app/
│   │   ├── core/             # Configuration, Database, Security
│   │   ├── models/           # SQLAlchemy DB Models (Lead, Research, Score, Opportunity, Outreach)
│   │   ├── schemas/          # Pydantic v2 validation schemas
│   │   ├── services/         # Intelligence Engines:
│   │   │   ├── discovery_service.py       # Domain filtering & deduplication
│   │   │   ├── website_intelligence.py    # Public DOM inspection (Chatbots, WhatsApp, Booking)
│   │   │   ├── decision_maker_service.py  # Public leadership resolver with provenance
│   │   │   ├── scoring_engine.py          # 7-factor composite scoring (0-100)
│   │   │   ├── opportunity_matcher.py     # 15 Services matching engine
│   │   │   ├── outreach_generator.py      # Grounded outreach asset generator
│   │   │   ├── crm_service.py             # 9-stage pipeline & approval locks
│   │   │   ├── orchestrator.py            # Multi-agent orchestrator (DA, RA, QA, PA)
│   │   │   ├── gemini_client.py           # Gemini API client + Cognitive Engine
│   │   │   └── seed_data.py               # Demo dataset loader
│   │   ├── api/v1/           # REST endpoints (leads, pipeline, agents, analytics, outreach)
│   │   └── main.py           # FastAPI ASGI entrypoint
│   ├── tests/                # Automated pytest suite (11 unit/API tests)
│   └── requirements.txt
│
└── frontend/                 # Next.js 14+ TypeScript Tailwind App Router
    ├── src/
    │   ├── app/              # Page routes & layout
    │   ├── components/       # Enterprise UI components:
    │   │   ├── Navbar.tsx
    │   │   ├── DashboardView.tsx
    │   │   ├── LeadsGridView.tsx
    │   │   ├── PipelineKanbanView.tsx
    │   │   ├── LeadDetailDrawer.tsx
    │   │   ├── AgentTerminalModal.tsx
    │   │   ├── ServicesCatalogModal.tsx
    │   │   └── NewLeadModal.tsx
    │   ├── lib/              # API client & 15 Services Catalog
    │   └── types/            # TypeScript interfaces
```

---

## 🎯 Lead Scoring Engine (7 Weighted Vectors)
- **Business Fit (15%)**: Industry alignment, revenue potential, company headcount.
- **Service Fit (20%)**: Direct match with Terminal Labs' 15 service verticals.
- **Pain Signal (20%)**: Conversion friction, outdated UI, missing automation.
- **Buying Signal (15%)**: Hiring momentum, funding, expansion indicators.
- **Company Fit (10%)**: Tech maturity, budget bandwidth.
- **Digital Opportunity (10%)**: Lack of AI chatbot, missing WhatsApp capture, manual booking.
- **Contactability (10%)**: Verified decision makers with provenance URLs.

**Tiers**:
- 🔥 **Hot (80-100)**: Immediate high-priority outreach candidate.
- ⚡ **Warm (60-79)**: Solid operational fit, qualified for outreach.
- 🟡 **Moderate (40-59)**: Secondary prospect.
- ❄️ **Cold (0-39)**: Unaligned or low-urgency target.

---

## 🛡️ Safety & Anti-Hallucination Safeguards
1. **Provenance & Citations**: Every generated pitch references an observed public fact (e.g. `domain.com/about-us`).
2. **Facts vs. Inference Separation**: Ingested raw website data is explicitly separated from AI deductions.
3. **Approval Before Send Lock**: No outreach drafts can be dispatched without explicit human verification (`is_approved` lock).
4. **Deduplication Engine**: Automatically normalizes URLs and flags duplicate entries across domains and company names.

---

## ⚡ Quickstart & Local Setup

### 1. Backend (FastAPI + Python 3.10+)
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be accessible at: `http://localhost:8000/docs`

### 2. Frontend (Next.js 14+ TypeScript)
```bash
cd frontend
npm install
npm run dev
```
Dashboard will be accessible at: `http://localhost:3000`

---

## 🧪 Running Automated Tests
```bash
cd backend
venv\Scripts\pytest -v
```
All 11 unit and integration tests (scoring, deduplication, opportunity matching, factual outreach grounding, API endpoints) execute with 100% pass rate.
