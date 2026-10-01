import urllib.parse
import urllib.request
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException, Body, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.core.security import verify_token
from app.core.config import settings
from app.models import EmailAccount, DispatchLog, ActivityLog
from app.services.mailer_service import mailer_service

logger = logging.getLogger("terminal_labs.auth_email")
router = APIRouter(prefix="/email-account", tags=["Connected Email & Outreach"])

@router.get("")
async def get_email_account(
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Returns the active email account, Google Sign-In profile, and Gmail OAuth status.
    """
    account = await mailer_service.get_active_account(db)
    is_oauth_configured = bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET)
    
    gmail_status_val = account.gmail_status
    if not account.is_connected and not is_oauth_configured:
        gmail_status_val = "NOT CONFIGURED"
    elif account.is_connected and account.connected_email:
        gmail_status_val = "CONNECTED"

    return {
        "id": account.id,
        "sender_name": account.sender_name,
        "sender_email": account.sender_email,
        "reply_to_email": account.reply_to_email,
        "provider_type": account.provider_type,
        "is_connected": account.is_connected,
        "connected_email": account.connected_email,
        "gmail_status": gmail_status_val,
        "is_oauth_configured": is_oauth_configured,
        "user_google_name": account.user_google_name,
        "user_google_email": account.user_google_email,
        "user_google_picture": account.user_google_picture,
        "google_auth_connected": bool(account.google_auth_connected),
        "smtp_host": account.smtp_host,
        "smtp_port": account.smtp_port,
        "smtp_username": account.smtp_username,
        "has_password": bool(account.smtp_password),
        "email_signature": account.email_signature,
        "whatsapp_phone_number": account.whatsapp_phone_number,
        "is_verified": account.is_verified,
        "test_status": account.test_status,
        "last_tested_at": account.last_tested_at.isoformat() if account.last_tested_at else None,
        "last_error": account.last_error
    }

@router.post("")
async def update_email_account(
    data: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Updates the email account settings, sender profile, or signature.
    """
    account = await mailer_service.update_account(db, data)
    return {
        "success": True,
        "id": account.id,
        "sender_name": account.sender_name,
        "sender_email": account.sender_email,
        "connected_email": account.connected_email,
        "is_connected": account.is_connected,
        "gmail_status": account.gmail_status,
        "provider_type": account.provider_type,
        "test_status": account.test_status
    }

@router.get("/google/auth-url")
async def get_google_oauth_url(
    auth: dict = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Generates the Google OAuth 2.0 authorization URL for Gmail sending permissions.
    Uses the smallest scopes necessary: openid, userinfo.email, userinfo.profile, gmail.send.
    """
    is_configured = bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET)
    client_id = settings.GOOGLE_CLIENT_ID or "NOT_CONFIGURED"
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    scopes = [
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/gmail.send"
    ]
    scope_str = " ".join(scopes)
    state = f"tl_oauth_{int(datetime.now(timezone.utc).timestamp())}"
    
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": scope_str,
        "access_type": "offline",
        "prompt": "consent",
        "state": state
    }
    
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
    
    return {
        "auth_url": auth_url if is_configured else None,
        "client_id": client_id if is_configured else None,
        "redirect_uri": redirect_uri,
        "scopes": scopes,
        "is_configured": is_configured,
        "status": "CONFIGURED" if is_configured else "NOT CONFIGURED",
        "message": "Google OAuth is ready." if is_configured else "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required in backend .env to connect Gmail."
    }

@router.post("/google/callback")
async def handle_google_oauth_callback(
    code: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Exchanges the OAuth 2.0 authorization code with Google for tokens.
    Fetches the real authenticated Google profile and Gmail address.
    Never generates mock tokens.
    """
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=400,
            detail="Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend .env"
        )
        
    try:
        token_url = "https://oauth2.googleapis.com/token"
        token_data = urllib.parse.urlencode({
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code"
        }).encode("utf-8")
        
        req = urllib.request.Request(token_url, data=token_data, method="POST")
        with urllib.request.urlopen(req, timeout=10) as resp:
            token_json = json.loads(resp.read().decode("utf-8"))
            access_token = token_json.get("access_token")
            refresh_token = token_json.get("refresh_token")
            expires_in = token_json.get("expires_in", 3600)
            expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
            
        if not access_token:
            raise HTTPException(status_code=400, detail="Google did not return an access token.")

        # Fetch actual authenticated user email & profile
        user_req = urllib.request.Request(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        with urllib.request.urlopen(user_req, timeout=10) as user_resp:
            user_info = json.loads(user_resp.read().decode("utf-8"))
            connected_email = user_info.get("email")
            user_name = user_info.get("name")
            user_picture = user_info.get("picture")

        account = await mailer_service.get_active_account(db)
        account.is_connected = True
        account.connected_email = connected_email
        account.gmail_status = "CONNECTED"
        account.oauth_access_token = access_token
        if refresh_token:
            account.oauth_refresh_token = refresh_token
        account.oauth_token_expires_at = expires_at
        account.oauth_scopes = [
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/gmail.send"
        ]
        account.test_status = "CONNECTED"
        account.is_verified = True
        account.last_tested_at = datetime.now(timezone.utc)
        account.last_error = None
        
        if user_name:
            account.user_google_name = user_name
            account.sender_name = user_name
        if connected_email:
            account.user_google_email = connected_email
            account.sender_email = connected_email
        if user_picture:
            account.user_google_picture = user_picture
        account.google_auth_connected = True
        
        await db.commit()
        await db.refresh(account)
        
        return {
            "success": True,
            "status": "CONNECTED",
            "connected_email": connected_email,
            "sender_name": account.sender_name,
            "message": f"Successfully connected Google account for {connected_email}"
        }
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        logger.error(f"Google OAuth token exchange failed: {err_body}")
        raise HTTPException(status_code=400, detail=f"Google OAuth Error: {err_body}")
    except Exception as e:
        logger.error(f"OAuth callback error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/google/sign-in")
async def handle_google_sign_in(
    access_token: Optional[str] = Body(None, embed=True),
    id_token: Optional[str] = Body(None, embed=True),
    mock_email: Optional[str] = None, # Deprecated / Ignored
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Authenticates user into Terminal Labs using real Google Account credentials.
    Fetches real Google profile (name, email, picture).
    """
    if not access_token and not id_token:
        raise HTTPException(status_code=400, detail="Missing Google access_token or id_token.")

    try:
        headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}
        url = "https://www.googleapis.com/oauth2/v2/userinfo"
        if id_token and not access_token:
            url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
            headers = {}

        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            user_info = json.loads(resp.read().decode("utf-8"))
            google_email = user_info.get("email")
            google_name = user_info.get("name", google_email.split("@")[0] if google_email else "Google User")
            google_picture = user_info.get("picture")

        if not google_email:
            raise HTTPException(status_code=400, detail="Could not extract email from Google identity token.")

        account = await mailer_service.get_active_account(db)
        account.user_google_name = google_name
        account.user_google_email = google_email
        account.user_google_picture = google_picture
        account.google_auth_connected = True
        await db.commit()
        await db.refresh(account)

        return {
            "success": True,
            "name": google_name,
            "email": google_email,
            "picture": google_picture,
            "google_account_status": "CONNECTED"
        }
    except Exception as e:
        logger.error(f"Google sign-in error: {e}")
        raise HTTPException(status_code=400, detail=f"Google authentication failed: {str(e)}")

@router.post("/test-connection")
async def test_email_connection(
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Executes a live connection check against the authenticated Gmail account or SMTP server.
    """
    return await mailer_service.test_connection(db)

@router.post("/disconnect")
async def disconnect_email_account(
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Disconnects the active Google/Gmail OAuth connection.
    """
    account = await mailer_service.disconnect_account(db)
    return {
        "success": True,
        "is_connected": False,
        "gmail_status": "DISCONNECTED",
        "message": "Successfully disconnected Google / Gmail account."
    }

@router.get("/dispatch-logs")
async def get_dispatch_logs(
    limit: int = Query(25, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
) -> List[Dict[str, Any]]:
    """
    Returns audit trail of live outbound emails and outreach dispatches.
    """
    stmt = select(DispatchLog).order_by(desc(DispatchLog.dispatched_at)).limit(limit)
    result = await db.execute(stmt)
    logs = result.scalars().all()
    
    return [
        {
            "id": log.id,
            "lead_id": log.lead_id,
            "draft_id": log.draft_id,
            "channel": log.channel,
            "recipient_name": log.recipient_name,
            "recipient_target": log.recipient_target,
            "sender_account": log.sender_account,
            "subject": log.subject,
            "message_snippet": log.message_content[:120] if log.message_content else "",
            "status": log.status,
            "response_code": log.response_code,
            "error_message": log.error_message,
            "dispatched_at": log.dispatched_at.isoformat()
        }
        for log in logs
    ]
