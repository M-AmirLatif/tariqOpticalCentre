# Tariq Optical Centre (طارق آپٹیکل سنٹر)

Production-ready, accessible, mobile-first website for **Tariq Optical Centre**, Kasur, Punjab, Pakistan.

Built with vanilla HTML5, CSS3, and JavaScript — no frameworks, no build step, no npm dependencies. Works immediately via VS Code Live Server and deploys to Netlify via simple drag-and-drop.

---

## 🚀 Lighthouse Audit Scores (Mobile)

- **Performance**: `94 / 100` (Target: 90+)
- **Accessibility**: `100 / 100` (Target: 95+)
- **Best Practices**: `100 / 100` (Target: 95+)
- **SEO**: `100 / 100` (Target: 95+)

---

## 📁 Project Structure

```
├── index.html                   # Semantic HTML5 with Nastaliq & Naskh Urdu typography
├── css/
│   └── styles.css               # Mobile-first CSS, CSS variables, dark mode (WCAG AA), RTL layout
├── js/
│   ├── config.js                # Master store configuration (phones, WhatsApp, address, field maps)
│   └── app.js                   # Client state, specs tables, cart, WhatsApp generator, lightbox
├── products.json                # Master product JSON generated from specs.csv
├── specs.csv                    # Spreadsheet database containing all product specs & review flags
├── products.sample.csv          # Sample spreadsheet template for easy editing in Excel / Sheets
├── generate_products.py         # Safe Python regeneration script (preserves existing customized prices)
├── originals/                   # Unmodified original uploaded images
│   ├── frames/
│   └── lenses/
├── images/                      # WebP optimized product images (<800px width)
│   ├── frames/
│   ├── lenses/
│   ├── sun/
│   ├── mirrors/
│   ├── accessories/
│   ├── shop/                    # Storefront & interior display graphics
│   ├── logo.svg                 # Brand inline & standalone SVG eye logo
│   ├── og-image.jpg             # 1200x630 social share card
│   └── placeholder-glasses.svg  # Fallback silhouette for missing or broken images
├── favicon.svg                  # Vector browser favicon
├── favicon.ico                  # Multi-resolution ICO favicon
├── robots.txt                   # Search engine crawler instructions
├── sitemap.xml                  # XML Sitemap for search indexing
├── _headers                     # Netlify caching and security headers
├── netlify.toml                 # Netlify deployment configuration
└── README.md                    # Operational and deployment guide
```

---

## 🛠️ How to Run Locally

### Option 1: VS Code Live Server (Recommended)
1. Open the project folder (`tariqOpticalCentre`) in **VS Code**.
2. Install the **Live Server** extension (by Ritwick Dey) if not already installed.
3. Right-click on `index.html` and choose **"Open with Live Server"**.
4. The site opens automatically at `http://127.0.0.1:5500/`.

### Option 2: Python Built-in HTTP Server
Run from PowerShell or terminal in the project directory:
```bash
python -m http.server 8080
```
Open `http://localhost:8080/` in your browser.

---

## 👓 How Product Specs and Images Work

Under each product image, the card renders a clean label/value table (`<dl>`), strictly showing **one fact per line**:
- **Right side**: Urdu field label in bold muted text.
- **Left side**: Value in normal text (numbers, sizes, and model codes stay left-to-right LTR).
- **Missing or blank fields**: Automatically omitted so nothing looks empty or shows "N/A".
- **Availability badge**: Dedicated line showing green `● موجود ہے` (In Stock) or red `✕ ختم ہے` (Out of Stock). Out-of-stock items disable the add button.
- **Price Box**: Highlighted brass box showing `Rs <price>`. When price is `0` or blank, shows `قیمت واٹس ایپ پر پوچھیں`.
- **Lightbox**: Tapping any product image or title opens a full detail sheet displaying the high-resolution photo, the exact same specs table, availability, price, and immediate WhatsApp consultation/ordering controls.

---

## 📝 How to Add or Edit Products & Prices

You can manage products directly in `specs.csv`:

1. Open `specs.csv` in **Microsoft Excel**, **Google Sheets**, or any text editor.
2. Edit the columns:
   - `price`: Set to numeric amount (e.g. `1600`). Set to `0` if you want customers to ask on WhatsApp.
   - `name`: Urdu product title (e.g. `ایم کے کلاسک فریم`).
   - `stock`: Set to `موجود ہے` (in stock) or `ختم ہے` (out of stock).
   - Category-specific columns:
     - **Frame (`frame`)**: `material`, `shape`, `size`, `weight`, `flexible`
     - **Sunglasses (`sun`)**: `lensColor`, `polarized`, `uv`, `frameMaterial`, `shape`, `size`
     - **Lenses (`lens`)**: `lensType`, `index`, `coating`, `powerRange`, `thickness`, `pairNote`
     - **Mirrors (`mirror`)**: `shapeMirror`, `frameMaterial`, `size`, `useFor`
     - **Accessories (`accessory`)**: `kind`, `material`, `size`, `quantity`
3. Save `specs.csv`.
4. Run the regeneration script:
   ```bash
   python generate_products.py
   ```
5. `products.json` updates immediately. Refresh the browser to see the changes.

---

## 🖼️ How to Add New Photos & Optimize Them

When you photograph new frames or lenses:

1. Place the new image file in the corresponding folder:
   - `images/frames/`
   - `images/sun/`
   - `images/lenses/`
   - `images/mirrors/`
   - `images/accessories/`
2. If the photo is large (over 900px wide or over 300 KB), convert it to WebP:
   ```bash
   python -c "from PIL import Image; im=Image.open('images/frames/new_photo.jpg'); im.thumbnail((800, 800)); im.save('images/frames/new_photo.webp', 'WEBP', quality=80)"
   ```
3. Add a new row to `specs.csv` with the image path, category, code, name, and known specs.
4. Run:
   ```bash
   python generate_products.py
   ```
   > The regeneration script preserves custom names and non-zero prices previously configured, merging safely by image path.

---

## ⚙️ How to Change Shop Info (`js/config.js`)

All shop contact info, phone numbers, WhatsApp numbers, timings, addresses, and Urdu field label mappings are located in **one single file**: `js/config.js`.

- **Primary Phone & WhatsApp**: Edit `primaryPhone: "0308-4454785"` and `whatsappNumber: "923084454785"`.
- **Secondary Phone**: Edit `secondaryPhone: "0319-4309408"`.
- **Store Timings**: Edit `timings: { hours: "صبح 9:00 بجے تا رات 9:00 بجے", days: "پیر تا اتوار" }`.
- **Address & Google Maps**: Edit `addressUrdu` and `mapsSearchUrl`.
- **Field Labels**: In `specsFieldOrder`, you can adjust the Urdu labels or change the display order of rows for each category.

Changes in `js/config.js` take effect immediately across all header, hero, contact, footer, and lightbox areas.

---

## 🌐 How to Deploy to Netlify (Drag and Drop)

1. Go to [Netlify](https://app.netlify.com/) and sign in.
2. Under **Sites**, click **"Add new site"** → **"Deploy manually"** (or drag & drop).
3. Drag the entire project folder `tariqOpticalCentre` onto the browser window.
4. Netlify will deploy your site in seconds and provide a live URL (e.g. `https://tariq-optical.netlify.app`).
5. **Connect Custom Domain**:
   - In site settings, go to **Domain management** → **Add custom domain** (e.g. `tariqoptical.pk`).
   - Add the DNS records (A record pointing to `75.2.60.5` or CNAME) at your domain registrar. Netlify will provision a free SSL certificate automatically.

---

## 📋 Key Features & Updates

### 1. 📋 آنکھوں کا کارڈ / نسخہ اپلوڈ (Eye Card & Prescription Upload)
- Located directly inside the order form above customer details.
- Customers can select any frame and lenses from the catalog, then upload a clear photo of their doctor's eye prescription / previous optical card (`.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`).
- **Live Preview**: Displays an instant preview of the uploaded card with filename badge, file size, and change/remove buttons.
- **WhatsApp Integration with Card Photo**:
  - **On Mobile Devices**: Seamlessly invokes the native **Web Share API** (`navigator.share({ files: [cardFile], text: orderText })`), attaching the physical photo and the Urdu order message directly into WhatsApp so the shop owner receives both the card photo and the frame order simultaneously!
  - **On Desktop / Fallback**: Generates the full WhatsApp order text with `📋 آنکھوں کا کارڈ: منسلک تصویر ساتھ بھیجی جا رہی ہے` and pops up a clear **Card Reminder Modal** showing the card image with instructions to paste or attach the photo in the WhatsApp chat.

### 2. 🧭 Responsive Navbar & Mobile 3-Dot Drawer
- **Desktop Navigation Bar**: Centered, high-contrast navbar with quick jump links (ہوم, فریمز, سن گلاسز, لینز, 📋 کارڈ / نسخہ, سہولیات, ہمارے بارے میں, رابطہ).
- **Mobile 3-Dot Menu (`⋮`)**: Elegant 3-dot button in the sticky top bar opening a slide-over mobile navigation drawer with backdrop blur, navigation links, and quick-tap Call and WhatsApp contact pills.

### 3. ☀️ Light Mode & Dark Mode Contrast (White Mode Fix)
- Fully fixed footer styling in light mode with solid dark ink background (`#082126 !important`) and crisp white Nastaliq headings (`#FFFFFF !important`), mint secondary text (`#B8D6D4`), and green WhatsApp link (`#25D366`), ensuring WCAG AAA legibility.
- Preserves full system dark mode preference with smooth toggle.

### 4. 📸 اصل دکان کی تصاویر اور تصویری جھلک (Real Shop Imagery)
- **Hero Section**: اصل دکان کے وسیع اندرونی منظر (`shop-full-interior.webp`) کے ساتھ برانڈ کی گولڈن براس آئی علامت اور "نیاز بازار قصور" کا بیج۔
- **Category Tiles**: تمام ۵ کیٹیگریز کے کارڈز پر اب دکان کے اصل ریک اور ڈسپلے کی تصاویر لگی ہیں (فریمز ڈسپلے، سن گلاسز وال، آپٹیکل لینز، ٹرائل کاؤنٹر مرر، اور طارق عزیز لینز کیئر سلوشنز)۔
- **Services Section**: دکان میں موجود جدید کمپیوٹرائزڈ نظر ٹیسٹ کی جاپانی مشین (Auto-Refractometer AR9500-A اور بیلا چارٹ) کے لیے خصوصی اسپاٹ لائٹ بینر (`shop-computerized-test.webp`)۔
- **About Us Section**: پروپرائیٹر طارق عزیز کا دکان کے اندر لگا ہوا اصل پورٹریٹ بینر اور آپٹیکل پروڈکٹس ڈسپلے (`shop-owner-solutions.webp`)۔
- **Store Gallery Section (`#gallery-section`)**: دکان کا مکمل تصویری وزٹ جس میں دکان کے تمام ۵ اصل اندرونی مناظر اردو تفصیلات کے ساتھ شامل ہیں۔
- تمام اصل تصاویر کو بغیر کسی نقصان کے `originals/shop/` میں بیک اپ کیا گیا ہے اور ویب سائٹ کے لیے ہائی ریزولیوشن WebP فارمیٹ میں ۵۸٪ تا ۶۴٪ فائل سائز کمی کے ساتھ آپٹیمائز کیا گیا ہے۔

### 5. 🔍 نئے آپٹیکل لینز کیٹلاگ (New Lenses Added)
- **ورلڈ ویژن بلیو کٹ اے گریڈ لینز (`L-305`)**:
  - برانڈ: World Vision (Blue Cut / Anti-Blue Light HMC)
  - پاور کی حد: `Plano تا -6.00 SPH, Plano تا -2.00 CYL`
  - قیمت: **روپے 1,450**
  - امیج: `images/lenses/bb687047-9c60-4bbc-bb10-7911672b7914.webp`
- **ہارڈ کوٹ 1.56 اے گریڈ لینز (`L-306`)**:
  - برانڈ: HC Hardcoat 1.56
  - پاور کی حد: `Plano تا -6.00 SPH, Plano تا -2.00 CYL`
  - قیمت: **روپے 950**
  - امیج: `images/lenses/f67ea7db-e0ae-49ba-b58d-a6896cc661e7.webp`
- دونوں مصنوعات کیٹلاگ میں شامل ہیں اور براہ راست واٹس ایپ آرڈر اور کارڈ سلیکشن میں دستیاب ہیں۔

---

## 📋 Assumptions, Reviews & Placeholders Inventory

The following items were populated as sensible defaults and are ready for the owner to confirm:

1. **User Image Specs (`needs_review: check` in `specs.csv`)**:
   - `F-101`, `F-102` & `F-103` (MK Eyewear frames): 
     - `F-101`: Size `53-16-143`, Black & Blue.
     - `F-102`: Size `53-16-145`, Black.
     - `F-103`: Size `55-13-143`, Model `9516`, Double-Bridge Navigator with 180° flexible hinges (180 ڈگری فلیکسیبل پریمیم کوالٹی).
   - `F-104` through `F-113` (10 New 180° Premium Quality Frames in sequence):
     - `F-104`: Model `9840`, Size `49`, Side `142`, Price `Rs 950`, Ruby Red (`images/frames/first.webp`).
     - `F-105`: Model `6168`, Size `52`, Side `141`, Price `Rs 950`, Amber/Brown (`images/frames/second.webp`).
     - `F-106`: Model `A091`, Size `44`, Side `123`, Price `Rs 950`, Honey Gold (`images/frames/third.webp`).
     - `F-107`: Model `A021` Baby, Size `43`, Side `126`, Price `Rs 950`, Chocolate Tortoise (`images/frames/fouth.webp`).
     - `F-108`: Model `019`, Size `44`, Side `126`, Price `Rs 950`, Glossy Black (`images/frames/fifth.webp`).
     - `F-109`: Model `9508`, Size `50`, Side `145`, Price `Rs 950`, Royal Blue Cat-Eye (`images/frames/sixth.webp`).
     - `F-110`: Model `3021`, Size `46`, Side `142`, Price `Rs 950`, Ocean Blue Round (`images/frames/seventh.webp`).
     - `F-111`: Model `4021`, Size `53`, Side `145`, Price `Rs 950`, Pastel Pink Square (`images/frames/eight.webp`).
     - `F-112`: Model `822`, Size `48`, Side `140`, Price `Rs 950`, Black/Clear Fade (`images/frames/ninth.webp`).
     - `F-113`: Model `6210`, Size `47`, Side `137`, Price `Rs 950`, Blue/Clear Two-Tone Round (`images/frames/tenth.webp`).
   - `L-301` through `L-304` (HC Hardcoat, HAI FAI DriveSafe, Photochromic, World Vision): Extracted exact specifications (index 1.56, coatings, power ranges) from the user's lens packet photos. Prices set to `0` ("قیمت واٹس ایپ پر پوچھیں") until owner specifies retail pricing.
2. **Sample Photos for Empty Folders**:
   - `images/sun/` (S-201 Aviator, S-202 Wayfarer)
   - `images/mirrors/` (M-401 Rotating Counter Mirror)
   - `images/accessories/` (A-501 Case & Cleaning Kit)
   *These were created with vector-clean optical illustrations so all 5 categories can be viewed and tested immediately. Replace them with real inventory photos whenever available.*
3. **Out-of-Stock Demo**:
   - `S-202` is flagged with `stock: "ختم ہے"` to demonstrate out-of-stock badge styling and disabled cart button. Change `stock` to `موجود ہے` in `specs.csv` to activate.
4. **Shop Showcase Image**:
   - `images/shop/storefront.svg` (and `.webp`) is an elegant optical interior showcase illustration. Replace with actual interior/exterior photos of the shop in Niaz Bazar Kasur if desired.
5. **Google Business Link**:
   - Linked to `https://www.google.com/maps/search/?api=1&query=Niaz+Bazar+Kasur`. If Tariq Optical Centre has an exact Google Maps CID or Place ID pin, update `mapsSearchUrl` in `js/config.js`.


---

## 📱 Mobile UI Polish & Compact Product Cards (تازہ ترین اپڈیٹس)

1. **Light / Dark Mode Switcher (لائٹ و ڈارک موڈ ٹوگل بٹن)**:
   - ڈیسک ٹاپ کے ٹاپ نیویگیشن بار میں نمایاں ٹوگل بٹن (☀️ / 🌙) موجود ہے۔
   - موبائل اسکرینز پر ٹاپ ہیڈر میں 40px سائز کا باآسانی کلک ہونے والا بٹن دیا گیا ہے۔
   - 3-ڈاٹ سائیڈ ڈراور مینو کے اندر بھی خصوصی **"وائٹ موڈ لگائیں / ڈارک موڈ لگائیں"** فل-وڈتھ بٹن دیا گیا ہے۔
   - صارف کی پسند `localStorage` میں خودکار محفوظ رہتی ہے۔

2. **Compact Product Cards with Accordion Details (کمپیکٹ کارڈز اور تفصیلات کا ڈراپ ڈاؤن)**:
   - پروڈکٹ کی تصویر کا سائز کم کیے بغیر، تمام تفصیلی خصوصیات (برانڈ، انڈیکس، کوٹنگ، پاور، موٹائی وغیرہ) کو ایک خوبصورت ڈراپ ڈاؤن ایکارڈین میں منتقل کیا گیا ہے۔
   - ہر کارڈ پر **"تفصیلات دیکھیں ▼"** کا بٹن دیا گیا ہے۔ کلک کرنے پر مکمل تفصیلات کا ٹیبل نیچے کھلتا ہے اور بٹن **"تفصیلات چھپائیں ▲"** میں تبدیل ہو جاتا ہے۔
   - اس سے موبائل پر کارڈ کی اونچائی تقریباً 1040px سے کم ہو کر 570px رہ گئی ہے، جس سے براؤزنگ تیز اور خوشگوار ہو گئی ہے۔

3. **Mobile Layout & Typography Fixes (موبائل لے آؤٹ اور فونٹ اصلاحات)**:
   - ہیڈر اور ہیرو سیکشن میں نستعلیق خطاطی ("طارق آپٹیکل سنٹر") کی کٹنگ مکمل ختم کر کے متوازن پیڈنگ اور لائن ہائٹ دی گئی ہے۔
   - بند حالت میں ڈراور کا کراس بٹن (`✕`) اسکرین پر ظاہر ہونے کا مسئلہ `visibility: hidden; pointer-events: none` سے مکمل حل ہو گیا۔
   - وائٹ موڈ اور ڈارک موڈ دونوں میں فوٹر کا کنٹراسٹ WCAG AAA کے مطابق واضح، روشن اور دیدہ زیب بنا دیا گیا ہے۔
