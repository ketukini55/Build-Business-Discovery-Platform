import requests
from bs4 import BeautifulSoup

# Parameters
SOURCE_URL = 'https://publicdatadomain.com/businesses/'  # Example public data source URL

def find_businesses_without_websites():
    response = requests.get(SOURCE_URL)
    soup = BeautifulSoup(response.text, 'html.parser')

    businesses = []

    # Assuming that the businesses are listed in a specific HTML element
    for business in soup.find_all('div', class_='business-listing'):
        name = business.find('h2').text.strip()
        website = business.find('a', class_='website-link')

        # Check if the business has a website
        if website is None:
            businesses.append(name)

    return businesses

if __name__ == '__main__':
    businesses = find_businesses_without_websites()
    print('Businesses without websites:')
    for business in businesses:
        print(business)