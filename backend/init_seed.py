import asyncio
import logging
from app.core.database import init_db, AsyncSessionLocal
from app.services.seed_data import seed_database_if_empty

logging.basicConfig(level=logging.INFO)

async def main():
    print("Initializing database...")
    await init_db()
    async with AsyncSessionLocal() as db:
        print("Seeding database with qualified leads & executive contact numbers...")
        await seed_database_if_empty(db)
    print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(main())
