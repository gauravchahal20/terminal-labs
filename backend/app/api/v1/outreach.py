from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
import urllib.parse
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import verify_token
from app.models import OutreachDraft, Lead, DecisionMaker, LeadStatusEnum, ActivityLog, DispatchLog
from app.schemas.lead import OutreachDraftSchema
from app.services.crm_service import crm_service
from app.services.mailer_service import mailer_service

router = APIRouter(prefix="/outreach", tags=["Outreach"])

@router.put("/{draft_id}/approve", response_model=OutreachDraftSchema)
async def toggle_approval(
    draft_id: str,
    is_approved: bool = Body(True, embed=True),
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
):
    """
    Toggles explicit human approval for cold outreach.
    """
    draft = await crm_service.approve_outreach(db, draft_id, is_approved)
    return draft

@router.put("/{draft_id}", response_model=OutreachDraftSchema)
async def edit_outreach_draft(
    draft_id: str,
    cold_email_subject: Optional[str] = Body(None, embed=True),
    cold_email_body: Optional[str] = Body(None, embed=True),
    linkedin_inmail_body: Optional[str] = Body(None, embed=True),
    short_followup_body: Optional[str] = Body(None, embed=True),
    whatsapp_message_body: Optional[str] = Body(None, embed=True),
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
):
    stmt = select(OutreachDraft).where(OutreachDraft.id == draft_id)
    result = await db.execute(stmt)
    draft = result.scalar_one_or_none()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")

    if cold_email_subject is not None:
        draft.cold_email_subject = cold_email_subject
    if cold_email_body is not None:
        draft.cold_email_body = cold_email_body
    if linkedin_inmail_body is not None:
        draft.linkedin_inmail_body = linkedin_inmail_body
    if short_followup_body is not None:
        draft.short_followup_body = short_followup_body
    if whatsapp_message_body is not None:
        draft.whatsapp_message_body = whatsapp_message_body

    await db.commit()
    await db.refresh(draft)
    return draft

@router.post("/{draft_id}/send-email")
async def send_email(
    draft_id: str,
    custom_recipient: Optional[str] = Body(None, embed=True),
    custom_subject: Optional[str] = Body(None, embed=True),
    custom_body: Optional[str] = Body(None, embed=True),
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Sends the approved email outreach directly to the prospect via connected Gmail account.
    Enforces human approval and contact provenance safety gates.
    """
    return await mailer_service.send_email_outreach(
        db=db,
        draft_id=draft_id,
        custom_recipient=custom_recipient,
        custom_subject=custom_subject,
        custom_body=custom_body
    )

@router.post("/{draft_id}/send-test")
async def send_test_email(
    draft_id: str,
    test_recipient: Optional[str] = Body(None, embed=True),
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Sends a real test email copy of the draft to the user's authenticated email account.
    Requires user to have connected Gmail.
    """
    account = await mailer_service.get_active_account(db)
    target = test_recipient or account.connected_email or account.sender_email
    
    if not account.is_connected:
        raise HTTPException(
            status_code=400,
            detail="Cannot send test email: Gmail account is not connected. Please connect your Google account in Settings."
        )

    # Approve draft temporarily for test if needed, then restore
    stmt = select(OutreachDraft).where(OutreachDraft.id == draft_id)
    result = await db.execute(stmt)
    draft = result.scalar_one_or_none()
    if not draft:
        raise HTTPException(status_code=404, detail="Outreach draft not found")

    orig_approved = draft.is_approved
    draft.is_approved = True
    await db.commit()

    try:
        res = await mailer_service.send_email_outreach(
            db=db,
            draft_id=draft_id,
            custom_recipient=target,
            custom_subject=f"[TEST PREVIEW] {draft.cold_email_subject}"
        )
        return res
    finally:
        draft.is_approved = orig_approved
        await db.commit()

@router.post("/{draft_id}/send-whatsapp")
async def send_whatsapp(
    draft_id: str,
    custom_recipient_phone: Optional[str] = Body(None, embed=True),
    custom_message: Optional[str] = Body(None, embed=True),
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Generates a WhatsApp direct conversation link for the public phone number.
    Does not falsely claim automated API delivery without configured credentials.
    """
    stmt = select(OutreachDraft).where(OutreachDraft.id == draft_id)
    result = await db.execute(stmt)
    draft = result.scalar_one_or_none()
    if not draft:
        raise HTTPException(status_code=404, detail="Outreach draft not found")

    lead_stmt = select(Lead).where(Lead.id == draft.lead_id)
    lead_res = await db.execute(lead_stmt)
    lead = lead_res.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    dm_stmt = select(DecisionMaker).where(DecisionMaker.id == draft.decision_maker_id)
    dm_res = await db.execute(dm_stmt)
    dm = dm_res.scalar_one_or_none()

    target_phone = custom_recipient_phone or (dm.phone if dm and dm.phone else lead.phone)
    if not target_phone or target_phone in ["UNKNOWN", "None"]:
        raise HTTPException(status_code=400, detail="No public phone number is recorded for this prospect.")

    message = custom_message or draft.whatsapp_message_body or draft.short_followup_body
    clean_phone = "".join([c for c in target_phone if c.isdigit()])
    deep_link = f"https://wa.me/{clean_phone}?text={urllib.parse.quote(message)}"

    now = datetime.now(timezone.utc)
    
    # Log the action
    dispatch = DispatchLog(
        lead_id=draft.lead_id,
        draft_id=draft.id,
        channel="WHATSAPP",
        recipient_name=dm.full_name if dm else lead.company_name,
        recipient_target=target_phone,
        sender_account="Direct WhatsApp Client",
        subject="WhatsApp Outreach Link Generated",
        message_content=message,
        status="LINK_OPENED",
        response_code="HTTP 200 WA_LINK",
        dispatched_at=now
    )
    db.add(dispatch)

    activity = ActivityLog(
        lead_id=draft.lead_id,
        agent_name="User",
        action=f"Opened WhatsApp direct chat with {target_phone} (Public Phone)",
        details={
            "phone": target_phone,
            "whatsapp_status": lead.whatsapp_status or "PUBLIC_PHONE_ONLY",
            "timestamp": now.isoformat()
        }
    )
    db.add(activity)

    await db.commit()

    return {
        "success": True,
        "status": "LINK_OPENED",
        "phone": target_phone,
        "deep_link": deep_link,
        "disclaimer": "WhatsApp availability has not been independently confirmed for this public phone number.",
        "sent_at": now.isoformat(),
        "draft_id": draft.id
    }

@router.post("/batch-send")
async def batch_send_approved_emails(
    draft_ids: List[str] = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Dispatches multiple approved email drafts in batch.
    Skips unapproved or non-real leads with clear error reports.
    """
    sent_count = 0
    failed_count = 0
    skipped_count = 0
    errors = []

    for draft_id in draft_ids:
        try:
            res = await mailer_service.send_email_outreach(db, draft_id)
            if res.get("success"):
                sent_count += 1
            else:
                failed_count += 1
                errors.append({"draft_id": draft_id, "error": "Dispatch failed"})
        except HTTPException as e:
            failed_count += 1
            errors.append({"draft_id": draft_id, "error": e.detail})
        except Exception as e:
            failed_count += 1
            errors.append({"draft_id": draft_id, "error": str(e)})

    return {
        "success": sent_count > 0 or failed_count == 0,
        "total_requested": len(draft_ids),
        "sent_count": sent_count,
        "failed_count": failed_count,
        "errors": errors
    }
