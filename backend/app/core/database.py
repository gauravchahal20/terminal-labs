from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

database_url = settings.DATABASE_URL
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

connect_args = {}
if "sqlite" in database_url:
    connect_args = {"check_same_thread": False}

engine = create_async_engine(
    database_url,
    echo=False,
    connect_args=connect_args,
    future=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db(drop_all: bool = False):
    async with engine.begin() as conn:
        if drop_all:
            await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        # Safe migration for newly added columns if table already exists in SQLite/Postgres
        migration_queries = [
            "ALTER TABLE leads ADD COLUMN state VARCHAR(100)",
            "ALTER TABLE leads ADD COLUMN lead_type VARCHAR(50) DEFAULT 'REAL'",
            "ALTER TABLE leads ADD COLUMN source_urls JSON DEFAULT '[]'",
            "ALTER TABLE leads ADD COLUMN source_names JSON DEFAULT '[]'",
            "ALTER TABLE leads ADD COLUMN researched_at DATETIME",
            "ALTER TABLE leads ADD COLUMN last_verified_at DATETIME",
            "ALTER TABLE leads ADD COLUMN phone_status VARCHAR(50) DEFAULT 'PUBLIC'",
            "ALTER TABLE leads ADD COLUMN phone_source_url VARCHAR(500)",
            "ALTER TABLE leads ADD COLUMN phone_source_name VARCHAR(255)",
            "ALTER TABLE leads ADD COLUMN phone_observed_at DATETIME",
            "ALTER TABLE leads ADD COLUMN phone_verification_method VARCHAR(255)",
            "ALTER TABLE leads ADD COLUMN whatsapp_status VARCHAR(50) DEFAULT 'WHATSAPP_UNKNOWN'",
            "ALTER TABLE leads ADD COLUMN whatsapp_verification_method VARCHAR(255)",
            "ALTER TABLE leads ADD COLUMN website_status VARCHAR(50) DEFAULT 'OUTDATED_WEBSITE'",
            "ALTER TABLE leads ADD COLUMN buying_intent VARCHAR(50) DEFAULT 'MEDIUM'",
            "ALTER TABLE leads ADD COLUMN intent_signal TEXT",
            "ALTER TABLE leads ADD COLUMN intent_source VARCHAR(500)",
            "ALTER TABLE leads ADD COLUMN intent_timestamp DATETIME",
            
            "ALTER TABLE company_research ADD COLUMN has_website BOOLEAN DEFAULT 1",
            "ALTER TABLE decision_makers ADD COLUMN phone_status VARCHAR(50) DEFAULT 'UNKNOWN'",
            "ALTER TABLE decision_makers ADD COLUMN phone_source_url VARCHAR(500)",
            "ALTER TABLE decision_makers ADD COLUMN phone_source_name VARCHAR(255)",
            "ALTER TABLE decision_makers ADD COLUMN phone_observed_at DATETIME",
            "ALTER TABLE decision_makers ADD COLUMN phone_verification_method VARCHAR(255)",
            "ALTER TABLE decision_makers ADD COLUMN email_status VARCHAR(50) DEFAULT 'UNKNOWN'",
            "ALTER TABLE decision_makers ADD COLUMN email_source_url VARCHAR(500)",
            "ALTER TABLE decision_makers ADD COLUMN email_source_name VARCHAR(255)",
            "ALTER TABLE decision_makers ADD COLUMN email_observed_at DATETIME",
            "ALTER TABLE decision_makers ADD COLUMN email_verification_method VARCHAR(255)",
            "ALTER TABLE decision_makers ADD COLUMN linkedin_status VARCHAR(50) DEFAULT 'PUBLIC'",
            "ALTER TABLE decision_makers ADD COLUMN linkedin_source_url VARCHAR(500)",
            "ALTER TABLE decision_makers ADD COLUMN linkedin_observed_at DATETIME",
            "ALTER TABLE decision_makers ADD COLUMN contact_confidence FLOAT DEFAULT 50.0",
            
            "ALTER TABLE lead_scores ADD COLUMN opportunity_signal FLOAT DEFAULT 0.0",
            "ALTER TABLE lead_scores ADD COLUMN buying_intent FLOAT DEFAULT 0.0",
            "ALTER TABLE lead_scores ADD COLUMN business_activity FLOAT DEFAULT 0.0",
            "ALTER TABLE lead_scores ADD COLUMN evidence_confidence FLOAT DEFAULT 78.0",
            "ALTER TABLE lead_scores ADD COLUMN contact_confidence FLOAT DEFAULT 35.0",
            
            "ALTER TABLE opportunities ADD COLUMN opportunity_type VARCHAR(100) DEFAULT 'WHATSAPP AUTOMATION'",
            "ALTER TABLE opportunities ADD COLUMN observed_evidence JSON DEFAULT '[]'",
            "ALTER TABLE opportunities ADD COLUMN ai_inferences JSON DEFAULT '[]'",
            
            "ALTER TABLE outreach_drafts ADD COLUMN approval_status VARCHAR(50) DEFAULT 'PENDING'",
            "ALTER TABLE outreach_drafts ADD COLUMN whatsapp_message_body TEXT",
            "ALTER TABLE outreach_drafts ADD COLUMN send_status VARCHAR(50) DEFAULT 'DRAFT'",
            "ALTER TABLE outreach_drafts ADD COLUMN sent_to_email VARCHAR(255)",
            "ALTER TABLE outreach_drafts ADD COLUMN sent_to_phone VARCHAR(100)",
            "ALTER TABLE outreach_drafts ADD COLUMN sent_via_account VARCHAR(255)",
            "ALTER TABLE outreach_drafts ADD COLUMN sent_message_id VARCHAR(255)",
            "ALTER TABLE outreach_drafts ADD COLUMN send_error TEXT",

            "ALTER TABLE email_accounts ADD COLUMN user_google_name VARCHAR(255)",
            "ALTER TABLE email_accounts ADD COLUMN user_google_email VARCHAR(255)",
            "ALTER TABLE email_accounts ADD COLUMN user_google_picture VARCHAR(500)",
            "ALTER TABLE email_accounts ADD COLUMN google_auth_connected BOOLEAN DEFAULT 0",
            "ALTER TABLE email_accounts ADD COLUMN is_connected BOOLEAN DEFAULT 0",
            "ALTER TABLE email_accounts ADD COLUMN connected_email VARCHAR(255)",
            "ALTER TABLE email_accounts ADD COLUMN gmail_status VARCHAR(50) DEFAULT 'NOT CONFIGURED'",
            "ALTER TABLE email_accounts ADD COLUMN oauth_access_token TEXT",
            "ALTER TABLE email_accounts ADD COLUMN oauth_refresh_token TEXT",
            "ALTER TABLE email_accounts ADD COLUMN oauth_token_expires_at DATETIME",
            "ALTER TABLE email_accounts ADD COLUMN oauth_scopes JSON DEFAULT '[]'"
        ]
        
        from sqlalchemy import text
        for query in migration_queries:
            try:
                await conn.execute(text(query))
            except Exception:
                pass

