import os
import googlemaps
from typing import List, Dict, Any

def get_maps_client():
    api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    if not api_key or api_key == "your_google_maps_api_key_here":
        return None
    return googlemaps.Client(key=api_key)

def search_businesses(country: str, category: str, max_results: int = 20) -> List[Dict[str, Any]]:
    client = get_maps_client()
    if not client:
        # Return mock data when no API key is configured
        return generate_mock_businesses(country, category, max_results)
    
    try:
        query = f"{category} in {country}"
        results = []
        response = client.places(query=query)
        
        results.extend(response.get("results", []))
        
        # Handle pagination
        while len(results) < max_results and "next_page_token" in response:
            import time
            time.sleep(2)  # Required delay between paginated requests
            response = client.places(query=query, page_token=response["next_page_token"])
            results.extend(response.get("results", []))
        
        return results[:max_results]
    except Exception as e:
        print(f"Google Maps API error: {e}")
        return generate_mock_businesses(country, category, max_results)

def get_place_details(place_id: str) -> Dict[str, Any]:
    client = get_maps_client()
    if not client:
        return {}
    
    try:
        result = client.place(place_id=place_id, fields=[
            "name", "formatted_address", "formatted_phone_number",
            "website", "opening_hours", "rating", "user_ratings_total",
            "geometry", "types", "url"
        ])
        return result.get("result", {})
    except Exception as e:
        print(f"Error fetching place details: {e}")
        return {}

def generate_mock_businesses(country: str, category: str, count: int = 20) -> List[Dict[str, Any]]:
    """Generate realistic mock business data for demo/testing"""
    business_names = {
        "restaurants": ["The Golden Fork", "Mama's Kitchen", "Spice Garden", "Blue Ocean Diner", "The Rustic Table",
                       "Morning Star Cafe", "Street Food Corner", "The Local Bistro", "Garden Fresh", "Family Feast"],
        "plumbers": ["QuickFix Plumbing", "AquaPro Services", "Drain Masters", "PipeLine Experts", "FlowRight Plumbing",
                    "City Plumbers", "Emergency Drain Co", "Premier Pipeworks", "TrustPipe Solutions", "AllFix Plumbing"],
        "salons": ["Style Studio", "The Beauty Bar", "Glamour Touch", "Hair & Beyond", "Chic Cuts",
                  "The Styling Room", "Color Theory Salon", "Fresh Look Studio", "Elite Beauty", "Trend Setters"],
        "default": ["Local Business Co", "Main Street Shop", "Community Services", "Town Center Store", "Neighborhood Hub",
                   "Corner Shop", "Local Experts", "City Services", "Premium Services", "Quality First Business"]
    }
    
    cat_lower = category.lower()
    names = None
    for key in business_names:
        if key in cat_lower:
            names = business_names[key]
            break
    if names is None:
        names = business_names["default"]
    
    cities = {
        "United States": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio"],
        "United Kingdom": ["London", "Birmingham", "Manchester", "Leeds", "Liverpool", "Sheffield", "Bristol"],
        "Canada": ["Toronto", "Vancouver", "Montreal", "Calgary", "Edmonton", "Ottawa", "Winnipeg"],
        "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra"],
        "India": ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Ahmedabad"],
        "default": ["Capital City", "Metro Town", "Downtown", "City Center", "Main District"]
    }
    
    city_list = cities.get(country, cities["default"])
    
    import random
    mock_results = []
    for i in range(min(count, len(names))):
        city = random.choice(city_list)
        street_num = random.randint(1, 999)
        streets = ["Main St", "Oak Ave", "Park Rd", "First St", "Market St", "Church Ln", "High St"]
        street = random.choice(streets)
        phone_area = random.randint(200, 999)
        phone_num = f"+1-{phone_area}-{random.randint(100,999)}-{random.randint(1000,9999)}"
        
        mock_results.append({
            "place_id": f"mock_{i}_{category}_{country}".replace(" ", "_").lower(),
            "name": names[i] if i < len(names) else f"{category.title()} Business {i+1}",
            "formatted_address": f"{street_num} {street}, {city}, {country}",
            "geometry": {
                "location": {
                    "lat": random.uniform(25, 55),
                    "lng": random.uniform(-120, 30)
                }
            },
            "rating": round(random.uniform(3.0, 5.0), 1),
            "user_ratings_total": random.randint(5, 500),
            "types": [category.lower().replace(" ", "_"), "establishment"],
            "formatted_phone_number": phone_num,
            "website": None,  # No website - these are the target businesses
            "is_mock": True
        })
    
    return mock_results
