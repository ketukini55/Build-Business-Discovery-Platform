import openai
import googlemaps

def search_businesses_without_websites(api_key, country, business_type):
    gmaps = googlemaps.Client(key=api_key)
    
    # Perform a nearby search for the specified business type
    results = gmaps.places_nearby(location=f"{country}", keyword=business_type)
    
    # Filter results to find businesses without websites
    businesses_without_websites = []
    
    for place in results.get('results', []):
        name = place.get('name')
        website = place.get('website')
        
        if not website:
            businesses_without_websites.append(name)
    
    return businesses_without_websites

def main():
    # Sample API keys; replace with your actual API keys
    google_maps_api_key = 'YOUR_GOOGLE_MAPS_API_KEY'
    openai_api_key = 'YOUR_OPENAI_API_KEY'
    
    # Input for country and business type
    country = input("Enter the country: ")
    business_type = input("Enter the type of business: ")
    
    # Search for businesses without websites
    results = search_businesses_without_websites(google_maps_api_key, country, business_type)
    
    # Output results
    print("Businesses without websites:")
    for business in results:
        print(f"- {business}")

if __name__ == '__main__':
    main()