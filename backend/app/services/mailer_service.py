import base64
import json
import logging
import smtplib
import urllib.parse
import urllib.request
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from fastapi import HTTPException

from app.core.config import settings
from app.models import (
    Lead, 
    OutreachDraft, 
    EmailAccount, 
    DispatchLog, 
    ActivityLog, 
    LeadStatusEnum,
    DecisionMaker
)

logger = logging.getLogger("terminal_labs.mailer")

class MailerService:
    async def get_active_account(self, db: AsyncSession) -> EmailAccount:
        """
        Retrieves the active user email account.
        If none exists, creates an initial unconfigured account record.
        """
        stmt = select(EmailAccount).where(EmailAccount.is_active == True).order_by(EmailAccount.created_at.desc())
        result = await db.execute(stmt)
        account = result.scalars().first()
        
        if not account:
            account = EmailAccount(
                sender_name="Terminal Labs Partnerships",
                sender_email=settings.DEFAULT_SENDER_EMAIL or "partnerships@terminallabs.com",
                reply_to_email=settings.DEFAULT_SENDER_EMAIL or "partnerships@terminallabs.com",
                provider_type="GMAIL_OAUTH",
                is_connected=False,
                connected_email=None,
                gmail_status="NOT CONFIGURED",
                test_status="NOT CONFIGURED",
                email_signature="--\nTerminal Labs Intelligence & AI Solutions\nWebsite: https://labs-terminal.vercel.app",
                is_active=True,
                is_verified=False
            )
            db.add(account)
            await db.commit()
            await db.refresh(account)
            
        return account

    async def update_account(self, db: AsyncSession, data: Dict[str, Any]) -> EmailAccount:
        """
        Saves or updates the email account settings and profile.
        """
        stmt = select(EmailAccount).where(EmailAccount.is_active == True)
        result = await db.execute(stmt)
        account = result.scalars().first()
        
        if not account:
            account = EmailAccount()
            db.add(account)
            
        for k, v in data.items():
            if hasattr(account, k) and v is not None:
                setattr(account, k, v)
                
        account.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(account)
        return account

    async def refresh_google_access_token_if_needed(self, db: AsyncSession, account: EmailAccount) -> Optional[str]:
        """
        Checks if the OAuth access token is expired and uses refresh_token to obtain a new one.
        """
        if not account.oauth_refresh_token or not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
            return account.oauth_access_token

        now = datetime.now(timezone.utc)
        if account.oauth_token_expires_at and account.oauth_token_expires_at > now + timedelta(minutes=2):
            return account.oauth_access_token

        try:
            token_url = "https://oauth2.googleapis.com/token"
            data = urllib.parse.urlencode({
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "refresh_token": account.oauth_refresh_token,
                "grant_type": "refresh_token"
            }).encode("utf-8")
            
            req = urllib.request.Request(token_url, data=data, method="POST")
            with urllib.request.urlopen(req, timeout=10) as resp:
                token_data = json.loads(resp.read().decode("utf-8"))
                new_access_token = token_data.get("access_token")
                expires_in = token_data.get("expires_in", 3600)
                
                if new_access_token:
                    account.oauth_access_token = new_access_token
                    account.oauth_token_expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
                    await db.commit()
                    await db.refresh(account)
                    return new_access_token
        except Exception as e:
            logger.error(f"Failed to refresh Google OAuth token: {e}")
            account.gmail_status = "CONNECTION FAILED"
            account.last_error = f"Token refresh error: {str(e)}"
            await db.commit()
            
        return account.oauth_access_token

    async def test_connection(self, db: AsyncSession, account_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Tests the actual authenticated connection (Google OAuth Gmail API or SMTP).
        Never returns simulated success without valid credentials.
        """
        if account_id:
            stmt = select(EmailAccount).where(EmailAccount.id == account_id)
            result = await db.execute(stmt)
            account = result.scalar_one_or_none()
        else:
            account = await self.get_active_account(db)
            
        if not account:
            raise HTTPException(status_code=404, detail="Email account not found")

        now = datetime.now(timezone.utc)

        # 1. Test Google OAuth Gmail API
        if account.provider_type == "GMAIL_OAUTH" or account.oauth_access_token:
            if not account.is_connected or not account.oauth_access_token:
                account.test_status = "NOT CONFIGURED"
                account.last_tested_at = now
                account.last_error = "Google OAuth is not connected. Please click 'Connect Gmail' to authenticate."
                await db.commit()
                return {
                    "success": False,
                    "status": "NOT CONFIGURED",
                    "message": "Google OAuth is not connected. Connect Gmail in Settings.",
                    "tested_at": now.isoformat()
                }

            token = await self.refresh_google_access_token_if_needed(db, account)
            try:
                # Query Google Gmail Profile API
                profile_req = urllib.request.Request(
                    "https://gmail.googleapis.com/gmail/v1/users/me/profile",
                    headers={"Authorization": f"Bearer {token}"}
                )
                with urllib.request.urlopen(profile_req, timeout=10) as resp:
                    profile_data = json.loads(resp.read().decode("utf-8"))
                    email_addr = profile_data.get("emailAddress", account.connected_email)
                    
                    account.is_connected = True
                    account.connected_email = email_addr
                    account.gmail_status = "CONNECTED"
                    account.test_status = "CONNECTED"
                    account.is_verified = True
                    account.last_tested_at = now
                    account.last_error = None
                    await db.commit()
                    await db.refresh(account)
                    
                    return {
                        "success": True,
                        "status": "CONNECTED",
                        "connected_email": email_addr,
                        "message": f"Successfully verified Gmail API connection for {email_addr}",
                        "tested_at": now.isoformat()
                    }
            except Exception as e:
                err_msg = str(e)
                logger.error(f"Gmail API connection test failed: {err_msg}")
                account.gmail_status = "CONNECTION FAILED"
                account.test_status = "FAILED"
                account.last_tested_at = now
                account.last_error = err_msg
                await db.commit()
                return {
                    "success": False,
                    "status": "CONNECTION FAILED",
                    "message": f"Gmail API Error: {err_msg}",
                    "tested_at": now.isoformat()
                }

        # 2. Test Custom SMTP
        if account.smtp_host and account.smtp_username and account.smtp_password:
            try:
                if account.smtp_use_ssl:
                    server = smtplib.SMTP_SSL(account.smtp_host, account.smtp_port, timeout=10)
                else:
                    server = smtplib.SMTP(account.smtp_host, account.smtp_port, timeout=10)
                    if account.smtp_use_tls:
                        server.starttls()
                        
                server.login(account.smtp_username, account.smtp_password)
                server.quit()
                
                account.is_connected = True
                account.is_verified = True
                account.test_status = "CONNECTED"
                account.last_tested_at = now
                account.last_error = None
                await db.commit()
                await db.refresh(account)
                
                return {
                    "success": True,
                    "status": "CONNECTED",
                    "message": f"SMTP handshake and authentication succeeded for {account.smtp_host}:{account.smtp_port}",
                    "tested_at": now.isoformat()
                }
            except Exception as e:
                err_msg = str(e)
                logger.error(f"SMTP connection test failed: {err_msg}")
                account.test_status = "FAILED"
                account.last_tested_at = now
                account.last_error = err_msg
                await db.commit()
                return {
                    "success": False,
                    "status": "FAILED",
                    "message": f"SMTP Error: {err_msg}",
                    "tested_at": now.isoformat()
                }

        # No connection configured
        account.test_status = "NOT CONFIGURED"
        account.last_tested_at = now
        account.last_error = "No credentials configured."
        await db.commit()
        return {
            "success": False,
            "status": "NOT CONFIGURED",
            "message": "Neither Google OAuth nor SMTP credentials are configured.",
            "tested_at": now.isoformat()
        }

    async def disconnect_account(self, db: AsyncSession) -> EmailAccount:
        """
        Clears stored OAuth tokens and disconnects Gmail account.
        """
        account = await self.get_active_account(db)
        account.is_connected = False
        account.connected_email = None
        account.gmail_status = "DISCONNECTED"
        account.oauth_access_token = None
        account.oauth_refresh_token = None
        account.oauth_token_expires_at = None
        account.test_status = "DISCONNECTED"
        account.last_error = None
        account.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(account)
        return account

    async def send_email_outreach(
        self, 
        db: AsyncSession, 
        draft_id: str, 
        custom_recipient: Optional[str] = None,
        custom_subject: Optional[str] = None,
        custom_body: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sends an approved cold email outreach draft directly to the prospect.
        Enforces Production Safety Rule:
        REAL + sufficiently supported contact (VERIFIED or PUBLIC) + APPROVED + CONNECTED GMAIL = send eligible.
        Anything else = DRAFT ONLY.
        """
        stmt = select(OutreachDraft).where(OutreachDraft.id == draft_id)
        result = await db.execute(stmt)
        draft = result.scalar_one_or_none()
        
        if not draft:
            raise HTTPException(status_code=404, detail="Outreach draft not found")

        # Fetch lead and decision maker
        lead_stmt = select(Lead).where(Lead.id == draft.lead_id)
        lead_res = await db.execute(lead_stmt)
        lead = lead_res.scalar_one_or_none()
        
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")

        dm_stmt = select(DecisionMaker).where(DecisionMaker.id == draft.decision_maker_id)
        dm_res = await db.execute(dm_stmt)
        dm = dm_res.scalar_one_or_none()

        account = await self.get_active_account(db)

        # ---------------- HARD SAFETY ENFORCEMENT ----------------
        # 1. Lead Type Check: DEMO and SYNTHETIC records cannot be sent
        if lead.lead_type in ["DEMO", "SYNTHETIC"]:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot send outreach to {lead.lead_type} lead '{lead.company_name}'. DEMO/SYNTHETIC leads are strictly isolated from production outreach."
            )

        # 2. Recipient Provenance Check
        recipient_email = custom_recipient or (dm.email if dm and dm.email else None)
        recipient_status = dm.email_status if dm else "UNKNOWN"

        if not recipient_email or recipient_status in ["UNKNOWN", "UNVERIFIED"]:
            raise HTTPException(
                status_code=400,
                detail="Recipient email is not sufficiently supported for sending. Value must have verified or public provenance."
            )

        # 3. Human Approval Gate
        if not draft.is_approved:
            raise HTTPException(
                status_code=400,
                detail="Outreach draft requires human approval before sending. Please click Approve in the composer."
            )

        # 4. Connection Check
        if not account.is_connected or (account.gmail_status not in ["CONNECTED"] and not account.smtp_password):
            raise HTTPException(
                status_code=400,
                detail="Gmail is not connected. Connect your Google account in Settings before sending live email."
            )

        recipient_name = dm.full_name if dm and dm.full_name != "Unknown" else lead.company_name
        subject = custom_subject or draft.cold_email_subject
        body = custom_body or draft.cold_email_body
        
        # Append sender signature
        if account.email_signature and not body.endswith(account.email_signature):
            full_body = f"{body}\n\n{account.email_signature}"
        else:
            full_body = body

        sender_address = account.connected_email or account.sender_email
        sent_message_id = None
        now = datetime.now(timezone.utc)

        # ---------------- LIVE SENDING VIA GMAIL API ----------------
        if account.provider_type == "GMAIL_OAUTH" and account.oauth_access_token:
            token = await self.refresh_google_access_token_if_needed(db, account)
            try:
                # Prepare MIME message
                mime_msg = MIMEMultipart()
                mime_msg["From"] = f"{account.sender_name} <{sender_address}>"
                mime_msg["To"] = f"{recipient_name} <{recipient_email}>"
                mime_msg["Subject"] = subject
                if account.reply_to_email:
                    mime_msg["Reply-To"] = account.reply_to_email
                mime_msg.attach(MIMEText(full_body, "plain", "utf-8"))

                raw_bytes = mime_msg.as_bytes()
                raw_b64 = base64.urlsafe_b64encode(raw_bytes).decode("utf-8")

                send_req = urllib.request.Request(
                    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
                    data=json.dumps({"raw": raw_b64}).encode("utf-8"),
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json"
                    },
                    method="POST"
                )
                with urllib.request.urlopen(send_req, timeout=15) as resp:
                    resp_data = json.loads(resp.read().decode("utf-8"))
                    sent_message_id = resp_data.get("id", f"msg_{int(now.timestamp())}")
                    logger.info(f"Live Gmail API email sent successfully to {recipient_email}, ID: {sent_message_id}")
            except Exception as e:
                err_msg = str(e)
                logger.error(f"Gmail API send failed: {err_msg}")
                draft.send_status = "FAILED"
                draft.send_error = err_msg
                await db.commit()
                raise HTTPException(status_code=502, detail=f"Gmail API transmission failed: {err_msg}")

        # ---------------- LIVE SENDING VIA SMTP ----------------
        elif account.smtp_password and account.smtp_username:
            try:
                msg = MIMEMultipart()
                msg["From"] = f"{account.sender_name} <{account.sender_email}>"
                msg["To"] = f"{recipient_name} <{recipient_email}>"
                msg["Subject"] = subject
                if account.reply_to_email:
                    msg["Reply-To"] = account.reply_to_email
                msg.attach(MIMEText(full_body, "plain", "utf-8"))

                if account.smtp_use_ssl:
                    server = smtplib.SMTP_SSL(account.smtp_host, account.smtp_port, timeout=15)
                else:
                    server = smtplib.SMTP(account.smtp_host, account.smtp_port, timeout=15)
                    if account.smtp_use_tls:
                        server.starttls()
                server.login(account.smtp_username, account.smtp_password)
                server.send_message(msg)
                server.quit()
                sent_message_id = f"smtp_{int(now.timestamp())}"
                logger.info(f"Live SMTP email sent successfully to {recipient_email}")
            except Exception as e:
                err_msg = str(e)
                logger.error(f"Live SMTP send error: {err_msg}")
                draft.send_status = "FAILED"
                draft.send_error = err_msg
                await db.commit()
                raise HTTPException(status_code=502, detail=f"SMTP transmission failed: {err_msg}")
        else:
            raise HTTPException(status_code=400, detail="No active email transmission provider configured.")

        # Create Dispatch Log
        dispatch = DispatchLog(
            lead_id=draft.lead_id,
            draft_id=draft.id,
            channel="EMAIL",
            recipient_name=recipient_name,
            recipient_target=recipient_email,
            sender_account=sender_address,
            subject=subject,
            message_content=full_body,
            status="SENT",
            response_code=f"200 OK (Message ID: {sent_message_id})",
            error_message=None,
            dispatched_at=now
        )
        db.add(dispatch)

        # Update Outreach Draft state to SENT
        draft.send_status = "SENT"
        draft.sent_to_email = recipient_email
        draft.sent_via_account = sender_address
        draft.sent_message_id = sent_message_id
        draft.sent_at = now
        draft.send_error = None
        channels = dict(draft.channel_status or {})
        channels["email"] = "SENT"
        channels["email_sent_at"] = now.isoformat()
        channels["email_sender"] = sender_address
        channels["email_message_id"] = sent_message_id
        draft.channel_status = channels

        # Update Lead Status to Contacted
        if lead.status in [LeadStatusEnum.NEW, LeadStatusEnum.RESEARCHING, LeadStatusEnum.QUALIFIED]:
            lead.status = LeadStatusEnum.CONTACTED
            lead.updated_at = now

        # Add Activity Log
        activity = ActivityLog(
            lead_id=draft.lead_id,
            agent_name="User",
            action=f"Dispatched Cold Email to {recipient_name} ({recipient_email}) via Gmail API",
            details={
                "subject": subject,
                "sender": sender_address,
                "status": "SENT",
                "message_id": sent_message_id,
                "dispatched_at": now.isoformat()
            }
        )
        db.add(activity)

        await db.commit()
        await db.refresh(draft)

        return {
            "success": True,
            "status": "SENT",
            "recipient": recipient_email,
            "subject": subject,
            "sender": sender_address,
            "message_id": sent_message_id,
            "sent_at": now.isoformat(),
            "draft_id": draft.id
        }

mailer_service = MailerService()
