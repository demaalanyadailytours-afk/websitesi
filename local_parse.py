import glob
from bs4 import BeautifulSoup

tours = {}
for file in glob.glob("tour-*.html"):
    with open(file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
        
        title_tag = soup.find('h1', class_='tour-title')
        title = title_tag.text.strip() if title_tag else "Unknown"
        
        adult_input = soup.find('input', id='adultCount')
        adult_price = adult_input.get('data-price') if adult_input else None
        
        tours[file] = {'title': title, 'price': adult_price}

print(f"Found {len(tours)} local tours.")
print(list(tours.items())[:3])
