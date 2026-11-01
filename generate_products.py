import os
import csv
import json

SPECS_CSV = 'specs.csv'
PRODUCTS_JSON = 'products.json'

CATEGORY_FIELDS = {
    'frame': ['code', 'brand', 'color', 'gender', 'condition', 'stock', 'price', 'material', 'shape', 'size', 'weight', 'flexible', 'note'],
    'sun': ['code', 'brand', 'color', 'gender', 'condition', 'stock', 'price', 'lensColor', 'polarized', 'uv', 'frameMaterial', 'shape', 'size', 'note'],
    'lens': ['code', 'brand', 'color', 'gender', 'condition', 'stock', 'price', 'lensType', 'material', 'index', 'coating', 'powerRange', 'thickness', 'pairNote', 'note'],
    'mirror': ['code', 'brand', 'color', 'condition', 'stock', 'price', 'size', 'shapeMirror', 'frameMaterial', 'useFor', 'note'],
    'accessory': ['code', 'brand', 'color', 'condition', 'stock', 'price', 'kind', 'material', 'size', 'quantity', 'note']
}

def safe_get(row, key, default=''):
    val = row.get(key)
    return val.strip() if val is not None else default

def load_existing_json():
    if os.path.exists(PRODUCTS_JSON):
        try:
            with open(PRODUCTS_JSON, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                if not content:
                    return {}
                data = json.loads(content)
                return {item['img']: item for item in data}
        except Exception:
            return {}
    return {}

def generate():
    existing_by_img = load_existing_json()
    products = []
    
    if not os.path.exists(SPECS_CSV):
        print(f"Error: {SPECS_CSV} not found!")
        return
        
    with open(SPECS_CSV, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        idx = 1
        for row in reader:
            img = safe_get(row, 'image_path').replace('\\', '/')
            if not img:
                continue
                
            cat = safe_get(row, 'category')
            code = safe_get(row, 'code') or f"{cat.upper()[:1]}-{100+idx}"
            name = safe_get(row, 'name')
            price_raw = safe_get(row, 'price', '0')
            try:
                price = int(float(price_raw)) if price_raw else 0
            except ValueError:
                price = 0
                
            gender = safe_get(row, 'gender') or 'unisex'
            shape = safe_get(row, 'shape')
            subcat = shape or safe_get(row, 'kind') or safe_get(row, 'coating') or 'عام'
            
            # Build specs dictionary - strictly omit unknown/empty fields
            specs = {}
            # Common core fields
            for field in ['code', 'brand', 'color', 'gender', 'condition', 'stock']:
                val = safe_get(row, field)
                if val:
                    specs[field] = val
                    
            # Category-specific fields
            cat_allowed = CATEGORY_FIELDS.get(cat, [])
            for field in cat_allowed:
                if field in ['price', 'code', 'brand', 'color', 'gender', 'condition', 'stock']:
                    continue
                val = safe_get(row, field)
                if val:
                    specs[field] = val
                    
            note = safe_get(row, 'note')
            if note:
                specs['note'] = note
                
            stock_val = safe_get(row, 'stock') or 'موجود ہے'
            is_in_stock = (stock_val != 'ختم ہے')
            featured_val = safe_get(row, 'featured').lower()
            featured = featured_val in ['true', '1', 'yes', 'ہاں']
            
            item = {
                "id": idx,
                "cat": cat,
                "code": code,
                "type": subcat,
                "name": name if name else f"ماڈل {code}",
                "price": price,
                "gender": gender,
                "img": img,
                "stock": stock_val,
                "inStock": is_in_stock,
                "featured": featured,
                "specs": specs
            }
            
            # Merge with existing products if price/name was manually customized
            if img in existing_by_img:
                prev = existing_by_img[img]
                if price == 0 and prev.get('price', 0) > 0:
                    item['price'] = prev['price']
                if not name and prev.get('name'):
                    item['name'] = prev['name']
                    
            products.append(item)
            idx += 1

    with open(PRODUCTS_JSON, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully generated {len(products)} products in {PRODUCTS_JSON} from {SPECS_CSV}!")

if __name__ == '__main__':
    generate()
