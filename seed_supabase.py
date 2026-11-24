"""
طارق آپٹیکل سنٹر (Tariq Optical Centre)
Script to seed all 137 products from products.json into Supabase table 'products'.
Usage:
  python seed_supabase.py <SUPABASE_URL> <SUPABASE_SERVICE_ROLE_KEY_OR_ANON_KEY>
"""

import sys
import json
import os
import urllib.request
import urllib.error

def main():
    if len(sys.argv) < 3:
        print("Usage: python seed_supabase.py <SUPABASE_URL> <SUPABASE_KEY>")
        print("Example: python seed_supabase.py https://xyz.supabase.co eyJhbGciOi...")
        return

    url = sys.argv[1].rstrip('/')
    key = sys.argv[2].strip()

    json_path = os.path.join(os.path.dirname(__file__), 'products.json')
    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found.")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        products = json.load(f)

    print(f"Loaded {len(products)} products from products.json.")

    endpoint = f"{url}/rest/v1/products"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }

    # Prepare records for insertion
    records = []
    for p in products:
        rec = {
            "id": p.get("id"),
            "code": p.get("code"),
            "cat": p.get("cat"),
            "type": p.get("type", ""),
            "name": p.get("name", ""),
            "name_en": p.get("nameEn", ""),
            "price": p.get("price", 0),
            "gender": p.get("gender", "سب کے لیے"),
            "img": p.get("img", ""),
            "stock": p.get("stock", "موجود ہے"),
            "in_stock": p.get("inStock", True),
            "featured": p.get("featured", False),
            "specs": p.get("specs", {})
        }
        records.append(rec)

    # Insert in batches of 50
    batch_size = 50
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        data = json.dumps(batch, ensure_ascii=False).encode('utf-8')
        req = urllib.request.Request(endpoint, data=data, headers=headers, method='POST')

        try:
            with urllib.request.urlopen(req) as response:
                print(f"Uploaded batch {i // batch_size + 1} ({len(batch)} items) - Status: {response.status}")
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode('utf-8', errors='ignore')
            print(f"Error uploading batch {i // batch_size + 1}: {e.code} - {err_msg}")
            return
        except Exception as e:
            print(f"Failed to connect: {e}")
            return

    print("Successfully seeded all products into Supabase!")

if __name__ == "__main__":
    main()
