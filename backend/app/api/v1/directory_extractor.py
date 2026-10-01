from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import verify_token
from app.services.directory_extractor_service import directory_extractor_service

router = APIRouter(prefix="/directory", tags=["Directory Extractor (JustDial / IndiaMART / Local)"])

class DirectoryExtractRequest(BaseModel):
    industry_or_keyword: Optional[str] = Field("Interior Designers", description="Business category or search term")
    city: Optional[str] = Field("Chandigarh", description="Target city or commercial hub")
    platform: Optional[str] = Field("JustDial", description="Platform: JustDial, IndiaMART, Sulekha, Google Places")
    has_no_website_only: Optional[bool] = Field(False, description="Filter for leads lacking official website")
    limit: Optional[int] = Field(10, ge=1, le=50)
    auto_ingest: Optional[bool] = Field(False, description="Whether to immediately ingest into CRM")

class RawHTMLParseRequest(BaseModel):
    raw_html: str = Field(..., description="Raw HTML snippet or text copied from JustDial / IndiaMART")
    city: Optional[str] = Field("Chandigarh", description="City for the listings")
    platform: Optional[str] = Field("JustDial", description="Platform name")
    auto_ingest: Optional[bool] = Field(False, description="Whether to immediately ingest into CRM")

class DirectoryIngestRequest(BaseModel):
    records: List[Dict[str, Any]] = Field(..., description="List of directory records to ingest")
    auto_qualify: Optional[bool] = Field(True, description="Whether to run full research & scoring pipeline")

@router.post("/extract")
async def extract_directory_leads(
    payload: DirectoryExtractRequest,
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Extracts structured business leads from JustDial, IndiaMART, Sulekha, or Google Places.
    Includes verified public phone, address, ratings, website detection, and contact provenance.
    """
    records = directory_extractor_service.extract_from_directory_query(
        industry_or_keyword=payload.industry_or_keyword,
        city=payload.city,
        platform=payload.platform,
        has_no_website_only=payload.has_no_website_only or False,
        limit=payload.limit or 10
    )

    if payload.auto_ingest:
        ingest_res = await directory_extractor_service.ingest_directory_leads(
            db=db,
            records=records,
            auto_qualify=True
        )
        return {
            "status": "success",
            "mode": "extracted_and_ingested",
            "query": {
                "keyword": payload.industry_or_keyword,
                "city": payload.city,
                "platform": payload.platform
            },
            **ingest_res
        }

    return {
        "status": "success",
        "mode": "preview",
        "query": {
            "keyword": payload.industry_or_keyword,
            "city": payload.city,
            "platform": payload.platform
        },
        "total_extracted": len(records),
        "records": records
    }

@router.post("/parse-raw")
async def parse_raw_directory_html(
    payload: RawHTMLParseRequest,
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Parses raw HTML snippet or text copied from JustDial, IndiaMART, etc.
    Extracts structured business objects with phone numbers, names, and addresses.
    """
    if not payload.raw_html.strip():
        raise HTTPException(status_code=400, detail="raw_html content cannot be empty.")

    records = directory_extractor_service.parse_raw_directory_html(
        raw_html=payload.raw_html,
        default_city=payload.city or "India",
        default_platform=payload.platform or "JustDial"
    )

    if payload.auto_ingest and records:
        ingest_res = await directory_extractor_service.ingest_directory_leads(
            db=db,
            records=records,
            auto_qualify=True
        )
        return {
            "status": "success",
            "mode": "parsed_and_ingested",
            **ingest_res
        }

    return {
        "status": "success",
        "mode": "parsed_preview",
        "total_parsed": len(records),
        "records": records
    }

@router.post("/ingest")
async def ingest_directory_leads_endpoint(
    payload: DirectoryIngestRequest,
    db: AsyncSession = Depends(get_db),
    auth: dict = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Ingests directory prospect records into the database with Phase 4 Contact Provenance.
    Runs 7-factor explainable scoring, service opportunity matching, and case-specific outreach generation.
    """
    if not payload.records:
        raise HTTPException(status_code=400, detail="No records provided to ingest.")

    return await directory_extractor_service.ingest_directory_leads(
        db=db,
        records=payload.records,
        auto_qualify=payload.auto_qualify if payload.auto_qualify is not None else True
    )
