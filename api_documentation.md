# Terminal Labs API v1 Specification

Base URL: `/api/v1`

### 1. Health
- `GET /health`: System health and mode check.

### 2. Analytics
- `GET /analytics/dashboard`: Aggregate KPI metrics (total leads, qualified leads, high intent, avg score, conversion rate), 15 services demand mix, industry breakdown, score distribution, pipeline stage count, and recent discoveries.

### 3. Leads & Dossiers
- `GET /leads`: List leads with search, filters (industry, status, tier, service), and sorting (`score`, `created_at`, `name`).
- `GET /leads/{id}`: Retrieve comprehensive lead dossier including research findings, decision makers, 7-factor score, opportunity match, outreach drafts, and activity logs.
- `POST /leads`: Manually ingest a prospective company and optionally run automated intelligence pipeline.
- `PUT /leads/{id}`: Update company information or tags.
- `DELETE /leads/{id}`: Remove lead record.
- `POST /leads/{id}/run-pipeline`: Execute autonomous multi-agent pipeline on specific lead.
- `POST /leads/{id}/research`: Run Research Agent only.
- `POST /leads/{id}/qualify`: Run Qualification Agent only.
- `POST /leads/{id}/personalize`: Run Personalization Agent only.

### 4. CRM Pipeline
- `GET /pipeline`: Get all leads organized by 9 CRM stages for Kanban visualization.
- `PUT /pipeline/{lead_id}/status`: Advance or update CRM stage with audit logging.

### 5. Autonomous Agents
- `POST /agents/discovery`: Trigger Discovery Agent with customizable search criteria (industry, country, city, size, service vertical, limit).
- `POST /agents/seed-demo`: Re-seed or reset realistic multi-sector demonstration leads.

### 6. Outreach Studio
- `PUT /outreach/{draft_id}/approve`: Toggle human approval status (`is_approved`) to unlock sending.
- `PUT /outreach/{draft_id}`: Edit draft subject, email body, LinkedIn InMail, or follow-up text.
