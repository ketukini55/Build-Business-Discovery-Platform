import requests
import re
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from typing import Dict, Any, Optional, List
import socket

# Email addresses containing these substrings are likely false positives
EMAIL_FALSE_POSITIVE_PATTERNS = [
    'example.com', 'test.com', 'domain.com', '@sentry', '@2x',
    '.png', '.jpg', '.gif', '@email', 'noreply',
]

def _scrape_website_data(url: str, timeout: int = 10) -> Optional[Dict[str, Any]]:
    """Fetch a URL and extract email and social media links. Returns None on failure."""
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        response = requests.get(url, headers=headers, timeout=timeout)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, "lxml")
            return {
                "email": extract_email(response.text),
                "social_media": extract_social_media(soup),
            }
    except Exception:
        pass
    return None


def check_website_status(website_url: Optional[str], business_name: str, address: str = "") -> Dict[str, Any]:
    """Check if a business has a website and gather social media links."""
    result = {
        "has_website": False,
        "website_status": "none",
        "website_url": None,
        "social_media": [],
        "email": None,
    }

    # Check if website URL was provided from Google Maps
    if website_url and website_url.strip():
        result["has_website"] = True
        result["website_status"] = "found"
        result["website_url"] = website_url
        scraped = _scrape_website_data(website_url)
        if scraped:
            result["email"] = scraped["email"]
            result["social_media"] = scraped["social_media"]
        return result

    # Try to find a website via domain guessing
    guessed_url = guess_website_url(business_name)
    if guessed_url:
        scraped = _scrape_website_data(guessed_url, timeout=8)
        if scraped is not None:
            result["has_website"] = True
            result["website_status"] = "found"
            result["website_url"] = guessed_url
            result["email"] = scraped["email"]
            result["social_media"] = scraped["social_media"]
            return result

    result["website_status"] = "none"
    return result

def guess_website_url(business_name: str) -> Optional[str]:
    """Try to guess a website URL based on business name."""
    clean_name = re.sub(r'[^\w\s]', '', business_name.lower())
    clean_name = re.sub(r'\s+', '', clean_name)
    
    if len(clean_name) < 3:
        return None
    
    urls_to_try = [
        f"https://www.{clean_name}.com",
        f"https://{clean_name}.com",
    ]
    
    for url in urls_to_try:
        try:
            domain = urlparse(url).netloc
            socket.getaddrinfo(domain, 80)
            return url
        except (socket.gaierror, Exception):
            continue
    
    return None

def extract_email(html_text: str) -> Optional[str]:
    """Extract email addresses from HTML text."""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, html_text)
    
    # Filter out common false positives
    filtered = [e for e in emails if not any(skip in e.lower() for skip in EMAIL_FALSE_POSITIVE_PATTERNS)]
    
    return filtered[0] if filtered else None

def extract_social_media(soup: BeautifulSoup) -> List[Dict[str, str]]:
    """Extract social media links from a webpage."""
    social_patterns = {
        "facebook": r'facebook\.com/(?!sharer|share|dialog|login)',
        "instagram": r'instagram\.com/',
        "twitter": r'twitter\.com/(?!share|intent)',
        "linkedin": r'linkedin\.com/(?:company|in)/',
        "youtube": r'youtube\.com/(?:channel|user|@)',
        "tiktok": r'tiktok\.com/@',
    }
    
    social_links = []
    seen = set()
    
    for a_tag in soup.find_all("a", href=True):
        href = a_tag.get("href", "")
        for platform, pattern in social_patterns.items():
            if re.search(pattern, href, re.IGNORECASE) and href not in seen:
                seen.add(href)
                social_links.append({"platform": platform, "url": href})
                break
    
    return social_links
