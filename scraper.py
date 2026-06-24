import requests
from bs4 import BeautifulSoup
import os
import glob
import re
import urllib.parse
from difflib import SequenceMatcher

# Helper for string similarity
def similar(a, b):
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

# 1. Get all local tours
print("Parsing local tours...")
local_tours = {}
for file in glob.glob("tour-*.html"):
    with open(file, 'r', encoding='utf-8') as f:
        html = f.read()
        soup = BeautifulSoup(html, 'html.parser')
        title_tag = soup.find('h1', class_='tour-title')
        if title_tag:
            title = title_tag.text.strip()
            # Clean title for better matching
            clean_title = re.sub(r'\(.*?\)', '', title).strip().lower()
            local_tours[file] = {'title': title, 'clean': clean_title, 'html': html}

print(f"Found {len(local_tours)} local tours.")

# 2. Scrape Tursay Travel Categories
categories = [
    'https://tursaytravel.com/tr/alanya-tatil-turlari/',
    'https://tursaytravel.com/tr/side-tatil-turlari/',
    'https://tursaytravel.com/tr/belek-tatil-turlari/'
]

all_tursay_links = set()
for cat in categories:
    print(f"Fetching category: {cat}")
    r = requests.get(cat)
    soup = BeautifulSoup(r.text, 'html.parser')
    for a in soup.find_all('a', href=True):
        href = a['href']
        if '/tr/' in href and '-turu' in href:
            if href.startswith('/'):
                href = 'https://tursaytravel.com' + href
            all_tursay_links.add(href)

print(f"Found {len(all_tursay_links)} tour links on Tursay.")

# 3. Scrape individual tours for images
tursay_data = []
for idx, url in enumerate(all_tursay_links):
    print(f"[{idx+1}/{len(all_tursay_links)}] Fetching {url}")
    try:
        r = requests.get(url, timeout=10)
        soup = BeautifulSoup(r.text, 'html.parser')
        
        # Get title
        h1 = soup.find('h1')
        title = h1.text.strip() if h1 else ""
        clean_title = re.sub(r'\(.*?\)', '', title).strip().lower()
        
        # Get images
        images = []
        for img in soup.find_all('img'):
            src = img.get('src')
            if src and ('wp-content/uploads' in src):
                # Filter out very small icons/logos if possible, usually by filename
                if 'logo' not in src.lower() and 'icon' not in src.lower():
                    images.append(src)
        
        # Remove duplicates
        images = list(dict.fromkeys(images))
        # Keep top 6 images maximum
        images = images[:6]
        
        tursay_data.append({'title': title, 'clean': clean_title, 'url': url, 'images': images})
    except Exception as e:
        print(f"Error fetching {url}: {e}")

# 4. Match local to remote
matched_count = 0
for file, local in local_tours.items():
    best_match = None
    best_score = 0
    for tursay in tursay_data:
        score = similar(local['clean'], tursay['clean'])
        if score > best_score:
            best_score = score
            best_match = tursay
            
    if best_score > 0.6 and best_match:
        print(f"Match: {local['title']} <-> {best_match['title']} ({best_score:.2f})")
        # Download images
        downloaded_paths = []
        for i, img_url in enumerate(best_match['images']):
            try:
                img_data = requests.get(img_url, timeout=10).content
                # parse filename extension
                ext = img_url.split('.')[-1][:4]
                if not ext.isalpha(): ext = 'jpg'
                
                safe_name = re.sub(r'[^a-z0-9]', '-', local['clean'])
                filename = f"images/tours/{safe_name}-{i+1}.{ext}"
                
                with open(filename, 'wb') as f:
                    f.write(img_data)
                downloaded_paths.append(filename)
            except Exception as e:
                print(f"Failed to download {img_url}: {e}")
        
        # Inject into HTML
        if downloaded_paths:
            html = local['html']
            slider_html = '\n<div class="gallery-slider">\n'
            for path in downloaded_paths:
                slider_html += f'  <img src="{path}" alt="{local["title"]} Görseli" />\n'
            slider_html += '</div>\n'
            
            # Find insertion point: <div class="gallery-main">...</div>
            # We'll use regex to inject right after the closing </div> of gallery-main
            new_html = re.sub(
                r'(<div class="gallery-main">.*?</div>)',
                r'\1' + slider_html,
                html,
                flags=re.DOTALL
            )
            
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_html)
            
            matched_count += 1

print(f"Successfully processed and updated {matched_count} tours.")
