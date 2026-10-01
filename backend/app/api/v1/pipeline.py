from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import verify_token
from app.models import Lead, LeadStatusEnum
from app.schemas.lead import LeadDetailResponse
from app.services.crm_service import crm_service

router = APIRouter(prefix="/pipeline", tags=["Pipeline & CRM"])

@router.get("", response_model=Dict[str, List[LeadDetailResponse]])
async def get_pipeline_kanban(
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
):
    """
    Returns all leads grouped by CRM status column for the Kanban board.
    """
    stmt = select(Lead).options(
        selectinload(Lead.research),
        selectinload(Lead.decision_makers),
        selectinload(Lead.score),
        selectinload(Lead.opportunity),
        selectinload(Lead.outreach_drafts),
        selectinload(Lead.activities)
    )
    result = await db.execute(stmt)
    leads = result.scalars().all()

    board = {status: [] for status in crm_service.VALID_STATUSES}
    for lead in leads:
        st = lead.status if lead.status in board else LeadStatusEnum.NEW
        board[st].append(lead)

    return board

@router.put("/{lead_id}/status")
async def update_lead_status(
    lead_id: str,
    status: str = Body(..., embed=True),
    note: Optional[str] = Body(None, embed=True),
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
):
    lead = await crm_service.update_lead_status(db, lead_id, status, note)
    return {"status": "success", "lead_id": lead.id, "new_status": lead.status}
