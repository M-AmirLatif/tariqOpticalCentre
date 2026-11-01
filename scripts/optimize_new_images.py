import os
import shutil
from PIL import Image

def optimize_image(src_path, dest_webp_path, max_dim=900, quality=80):
    os.makedirs(os.path.dirname(dest_webp_path), exist_ok=True)
    orig_size = os.path.getsize(src_path)
    with Image.open(src_path) as im:
        # Convert RGBA/P to RGB if needed for saving to WebP
        if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
            im = im.convert('RGBA')
        else:
            im = im.convert('RGB')
        im.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        im.save(dest_webp_path, 'WEBP', quality=quality, method=6)
    new_size = os.path.getsize(dest_webp_path)
    savings = (1 - (new_size / orig_size)) * 100
    print(f"Optimized: {os.path.basename(src_path)} -> {os.path.basename(dest_webp_path)}")
    print(f"  Size: {orig_size / 1024:.1f} KB -> {new_size / 1024:.1f} KB ({savings:.1f}% reduction)")
    return orig_size, new_size

def process_all():
    os.makedirs('originals/shop', exist_ok=True)
    os.makedirs('originals/lenses', exist_ok=True)

    # 1. Shop images mapping
    shop_images = {
        'e9e20e30-1442-469c-91d0-33cb8360cf22.jpg': 'shop-full-interior.webp',
        '66074bd1-629c-4631-b70f-ca599be07853.jpg': 'shop-frames-display.webp',
        '0d8678c8-bb68-46ad-aaea-3097be90242b.jpg': 'shop-sunglasses-rack.webp',
        'b1b5e195-69d9-40e9-a897-6ec06fbaf185.jpg': 'shop-computerized-test.webp',
        'd09aceaf-5a39-460a-ab57-5151136e9f0a.jpg': 'shop-owner-solutions.webp',
    }

    print("=== Processing Shop Images ===")
    for src_name, dest_name in shop_images.items():
        src_file = os.path.join('images/shop', src_name)
        orig_dest = os.path.join('originals/shop', src_name)
        if not os.path.exists(orig_dest) and os.path.exists(src_file):
            shutil.copy2(src_file, orig_dest)
        
        # Optimize to clean name
        optimize_image(src_file, os.path.join('images/shop', dest_name), max_dim=1000, quality=80)
        # Also optimize to original base name as webp
        base_webp = os.path.splitext(src_name)[0] + '.webp'
        optimize_image(src_file, os.path.join('images/shop', base_webp), max_dim=1000, quality=80)

    # 2. Lenses images
    lenses_images = [
        'bb687047-9c60-4bbc-bb10-7911672b7914.jpg',
        'f67ea7db-e0ae-49ba-b58d-a6896cc661e7.jpg',
    ]

    print("\n=== Processing Lens Images ===")
    for src_name in lenses_images:
        src_file = os.path.join('images/lenses', src_name)
        orig_dest = os.path.join('originals/lenses', src_name)
        if not os.path.exists(orig_dest) and os.path.exists(src_file):
            shutil.copy2(src_file, orig_dest)
        base_webp = os.path.splitext(src_name)[0] + '.webp'
        optimize_image(src_file, os.path.join('images/lenses', base_webp), max_dim=800, quality=80)

if __name__ == '__main__':
    process_all()
