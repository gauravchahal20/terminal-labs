from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Lead, LeadStatusEnum, ActivityLog, OutreachDraft
from fastapi import HTTPException

class CRMService:
    VALID_STATUSES = [
        LeadStatusEnum.NEW,
        LeadStatusEnum.RESEARCHING,
        LeadStatusEnum.QUALIFIED,
        LeadStatusEnum.CONTACTED,
        LeadStatusEnum.REPLIED,
        LeadStatusEnum.MEETING,
        LeadStatusEnum.PROPOSAL,
        LeadStatusEnum.WON,
        LeadStatusEnum.LOST,
    ]

    async def update_lead_status(self, db: AsyncSession, lead_id: str, new_status: str, note: Optional[str] = None) -> Lead:
        if new_status not in self.VALID_STATUSES:
            raise HTTPException(status_code=400, detail=f"Invalid status: {new_status}. Must be one of {self.VALID_STATUSES}")

        result = await db.execute(select(Lead).where(Lead.id == lead_id))
        lead = result.scalar_one_or_none()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")

        old_status = lead.status
        lead.status = new_status
        lead.updated_at = datetime.now(timezone.utc)

        # Log activity
        activity = ActivityLog(
            lead_id=lead_id,
            agent_name="User",
            action=f"Status changed from {old_status} to {new_status}",
            details={"old_status": old_status, "new_status": new_status, "note": note or ""}
        )
        db.add(activity)
        await db.commit()
        await db.refresh(lead)
        return lead

    async def approve_outreach(self, db: AsyncSession, draft_id: str, is_approved: bool = True) -> OutreachDraft:
        result = await db.execute(select(OutreachDraft).where(OutreachDraft.id == draft_id))
        draft = result.scalar_one_or_none()
        if not draft:
            raise HTTPException(status_code=404, detail="Outreach draft not found")

        draft.is_approved = is_approved
        draft.approval_status = "APPROVED" if is_approved else "REJECTED"
        draft.approved_at = datetime.now(timezone.utc) if is_approved else None

        # Log approval
        activity = ActivityLog(
            lead_id=draft.lead_id,
            agent_name="User",
            action="Outreach Draft Approved" if is_approved else "Outreach Draft Revoked",
            details={"draft_id": draft_id, "is_approved": is_approved}
        )
        db.add(activity)
        await db.commit()
        await db.refresh(draft)
        return draft

crm_service = CRMService()
