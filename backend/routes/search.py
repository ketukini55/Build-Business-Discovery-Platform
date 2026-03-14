import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import aiosqlite
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor

from models.database import get_db
from services.maps_service import search_businesses, get_place_details
from services.website_checker import check_website_status
from services.ai_service import generate_business_summary

router = APIRouter()
# Executor is created lazily and reused; FastAPI shutdown handles process cleanup.
executor = ThreadPoolExecutor(max_workers=4)
logger = logging.getLogger(__name__)

class SearchRequest(BaseModel):
    country: str
    category: str
    max_results: Optional[int] = 20
    filter_no_website: Optional[bool] = True

class SearchResponse(BaseModel):
    search_id: int
    total_found: int
    businesses: List[dict]

@router.post("/search", response_model=SearchResponse)
async def search_businesses_endpoint(
    request: SearchRequest,
    db: aiosqlite.Connection = Depends(get_db)
):
    if not request.country or not request.category:
        raise HTTPException(status_code=400, detail="Country and category are required")
    
    # Save search to DB
    cursor = await db.execute(
        "INSERT INTO searches (country, category) VALUES (?, ?)",
        (request.country, request.category)
    )
    await db.commit()
    search_id = cursor.lastrowid
    
    # Search for businesses using Google Maps (or mock data)
    loop = asyncio.get_event_loop()
    raw_businesses = await loop.run_in_executor(
        executor, 
        search_businesses, 
        request.country, 
        request.category, 
        request.max_results
    )
    
    processed_businesses = []
    
    for business in raw_businesses:
        place_id = business.get("place_id", "")
        name = business.get("name", "")
        address = business.get("formatted_address", business.get("vicinity", ""))
        
        # Check for website
        website_url = business.get("website")
        phone = business.get("formatted_phone_number", "")

        # Get detailed info if real API
        if not business.get("is_mock") and place_id:
            details = await loop.run_in_executor(executor, get_place_details, place_id)
            if details:
                website_url = details.get("website", website_url)
                phone = details.get("formatted_phone_number", phone)
                address = details.get("formatted_address", address)
        
        # Check website status
        website_info = await loop.run_in_executor(
            executor, check_website_status, website_url, name, address
        )
        
        # Skip businesses with websites if filter is on
        if request.filter_no_website and website_info["has_website"]:
            continue
        
        # Generate AI summary
        business_data = {
            "name": name,
            "category": request.category,
            "address": address,
            "rating": business.get("rating"),
            "total_ratings": business.get("user_ratings_total", 0),
            "has_website": website_info["has_website"],
        }
        
        ai_data = await loop.run_in_executor(executor, generate_business_summary, business_data)
        
        # Prepare social media as JSON string
        social_media_json = json.dumps(website_info.get("social_media", []))
        
        # Save to DB
        try:
            await db.execute("""
                INSERT OR REPLACE INTO businesses 
                (search_id, place_id, name, category, address, phone, email, website,
                 website_status, social_media, latitude, longitude, rating, total_ratings,
                 ai_summary, contact_recommendation, raw_data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                search_id, place_id, name, request.category, address, phone,
                website_info.get("email"), website_info.get("website_url"),
                website_info.get("website_status", "none"), social_media_json,
                business.get("geometry", {}).get("location", {}).get("lat"),
                business.get("geometry", {}).get("location", {}).get("lng"),
                business.get("rating"), business.get("user_ratings_total", 0),
                ai_data.get("ai_summary"), ai_data.get("contact_recommendation"),
                json.dumps(business)
            ))
            await db.commit()
        except Exception as e:
            logger.error("DB error saving business '%s': %s", name, e)
        
        processed_businesses.append({
            "place_id": place_id,
            "name": name,
            "category": request.category,
            "address": address,
            "phone": phone,
            "email": website_info.get("email"),
            "website": website_info.get("website_url"),
            "website_status": website_info.get("website_status", "none"),
            "social_media": website_info.get("social_media", []),
            "rating": business.get("rating"),
            "total_ratings": business.get("user_ratings_total", 0),
            "latitude": business.get("geometry", {}).get("location", {}).get("lat"),
            "longitude": business.get("geometry", {}).get("location", {}).get("lng"),
            "ai_summary": ai_data.get("ai_summary"),
            "contact_recommendation": ai_data.get("contact_recommendation"),
        })
    
    return {
        "search_id": search_id,
        "total_found": len(processed_businesses),
        "businesses": processed_businesses
    }
