import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_directory_extraction_and_ingestion():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Test Query Extraction Preview (JustDial / Chandigarh)
        payload = {
            "industry_or_keyword": "Interior Designers",
            "city": "Chandigarh",
            "platform": "JustDial",
            "has_no_website_only": False,
            "limit": 5,
            "auto_ingest": False
        }
        res = await client.post("/api/v1/directory/extract", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["mode"] == "preview"
        assert len(data["records"]) > 0
        
        record = data["records"][0]
        assert "company_name" in record
        assert "phone" in record
        assert "platform" in record
        assert record["platform"] == "JustDial"
        assert "Chandigarh" in record["city"]
        assert record["buying_intent"] == "HIGH"

        # 2. Test Raw HTML Parser
        raw_snippet = """
        <div class="resultbox">
            <h2 class="comp-name">Chandigarh Modular Kitchens & Woodwork</h2>
            <span class="cont_fl_addr">Plot 45, Industrial Area Phase 2, Chandigarh</span>
            <a href="tel:+919876512345" class="call_btn">+91 98765 12345</a>
            <span class="star_rate">4.7 Stars</span>
        </div>
        """
        parse_res = await client.post("/api/v1/directory/parse-raw", json={
            "raw_html": raw_snippet,
            "city": "Chandigarh",
            "platform": "JustDial",
            "auto_ingest": False
        })
        assert parse_res.status_code == 200
        parsed_data = parse_res.json()
        assert parsed_data["status"] == "success"
        assert parsed_data["total_parsed"] >= 1
        assert "Chandigarh Modular Kitchens" in parsed_data["records"][0]["company_name"]

        # 3. Test Ingesting Extracted Records with Provenance & Pipeline
        ingest_res = await client.post("/api/v1/directory/ingest", json={
            "records": [data["records"][0]],
            "auto_qualify": True
        })
        assert ingest_res.status_code == 200
        ingest_data = ingest_res.json()
        assert ingest_data["status"] == "success"
        assert "ingested_count" in ingest_data
