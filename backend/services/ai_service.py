import os
import json
import logging
from typing import Dict, Any, Optional
from openai import OpenAI

logger = logging.getLogger(__name__)

# Maximum tokens for AI-generated summary + contact recommendation
AI_MAX_TOKENS = 300

def get_openai_client() -> Optional[OpenAI]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "your_openai_api_key_here":
        return None
    return OpenAI(api_key=api_key)

def generate_business_summary(business_data: Dict[str, Any]) -> Dict[str, str]:
    """Generate AI summary and contact recommendation for a business."""
    client = get_openai_client()
    
    if not client:
        return generate_fallback_summary(business_data)
    
    name = business_data.get("name", "Unknown Business")
    category = business_data.get("category", "Business")
    address = business_data.get("address", "")
    rating = business_data.get("rating")
    total_ratings = business_data.get("total_ratings", 0)
    has_website = business_data.get("has_website", False)
    
    prompt = f"""You are a sales consultant helping someone sell website development services.

Business Information:
- Name: {name}
- Category: {category}
- Address: {address}
- Rating: {rating}/5 ({total_ratings} reviews)
- Has Website: {has_website}

Please provide:
1. A brief 2-3 sentence business summary
2. A specific, personalized recommendation on how to contact this business to offer web development services

Format your response as JSON:
{{
    "summary": "...",
    "contact_recommendation": "..."
}}"""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=AI_MAX_TOKENS,
            temperature=0.7
        )
        content = response.choices[0].message.content.strip()
        # Try to parse JSON
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        result = json.loads(content)
        return {
            "ai_summary": result.get("summary", ""),
            "contact_recommendation": result.get("contact_recommendation", "")
        }
    except Exception as e:
        logger.error("OpenAI API error: %s", e)
        return generate_fallback_summary(business_data)

def generate_fallback_summary(business_data: Dict[str, Any]) -> Dict[str, str]:
    """Generate a template-based summary when OpenAI is not available."""
    name = business_data.get("name", "This business")
    category = business_data.get("category", "business")
    address = business_data.get("address", "")
    rating = business_data.get("rating")
    total_ratings = business_data.get("total_ratings", 0)
    
    rating_text = ""
    if rating:
        if rating >= 4.5:
            rating_text = f"It has an excellent rating of {rating}/5 based on {total_ratings} reviews, indicating strong customer satisfaction."
        elif rating >= 3.5:
            rating_text = f"It has a good rating of {rating}/5 based on {total_ratings} reviews."
        else:
            rating_text = f"It has a rating of {rating}/5 based on {total_ratings} reviews."
    
    summary = f"{name} is a local {category} business located at {address}. {rating_text} This business currently has no website presence, making it an ideal candidate for web development services."
    
    recommendation = (
        f"Contact {name} directly by phone to introduce your web development services. "
        f"Emphasize how a professional website can help them attract more customers online, "
        f"especially since competitors may already have an online presence. "
        f"Offer a free consultation and show examples of websites you've built for similar {category} businesses."
    )
    
    return {
        "ai_summary": summary,
        "contact_recommendation": recommendation
    }
