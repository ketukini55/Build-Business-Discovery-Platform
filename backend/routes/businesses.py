from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
import aiosqlite
import json

from models.database import get_db

router = APIRouter()

@router.get("/results")
async def get_results(
    search_id: Optional[int] = None,
    website_status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: aiosqlite.Connection = Depends(get_db)
):
    query = "SELECT * FROM businesses WHERE 1=1"
    params = []
    
    if search_id:
        query += " AND search_id = ?"
        params.append(search_id)
    
    if website_status:
        query += " AND website_status = ?"
        params.append(website_status)
    
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    cursor = await db.execute(query, params)
    rows = await cursor.fetchall()
    
    businesses = []
    for row in rows:
        b = dict(row)
        if b.get("social_media"):
            try:
                b["social_media"] = json.loads(b["social_media"])
            except Exception:
                b["social_media"] = []
        businesses.append(b)
    
    return {"businesses": businesses, "total": len(businesses)}

@router.get("/business/{place_id}")
async def get_business_detail(
    place_id: str,
    db: aiosqlite.Connection = Depends(get_db)
):
    cursor = await db.execute(
        "SELECT * FROM businesses WHERE place_id = ?", (place_id,)
    )
    row = await cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Business not found")
    
    business = dict(row)
    if business.get("social_media"):
        try:
            business["social_media"] = json.loads(business["social_media"])
        except Exception:
            business["social_media"] = []
    
    return business

@router.get("/searches")
async def get_searches(
    db: aiosqlite.Connection = Depends(get_db)
):
    cursor = await db.execute(
        "SELECT * FROM searches ORDER BY created_at DESC LIMIT 20"
    )
    rows = await cursor.fetchall()
    return {"searches": [dict(row) for row in rows]}
