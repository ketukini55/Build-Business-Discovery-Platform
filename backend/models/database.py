import aiosqlite
import os

DATABASE_PATH = os.getenv("DATABASE_PATH", "businesses.db")

async def get_db():
    db = await aiosqlite.connect(DATABASE_PATH)
    db.row_factory = aiosqlite.Row
    try:
        yield db
    finally:
        await db.close()

async def init_db():
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS searches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                country TEXT NOT NULL,
                category TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS businesses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                search_id INTEGER,
                place_id TEXT UNIQUE,
                name TEXT NOT NULL,
                category TEXT,
                address TEXT,
                phone TEXT,
                email TEXT,
                website TEXT,
                website_status TEXT DEFAULT 'unknown',
                social_media TEXT,
                latitude REAL,
                longitude REAL,
                rating REAL,
                total_ratings INTEGER,
                ai_summary TEXT,
                contact_recommendation TEXT,
                raw_data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (search_id) REFERENCES searches(id)
            )
        """)
        await db.commit()
