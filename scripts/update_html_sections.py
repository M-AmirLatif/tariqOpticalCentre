import re

def update_html():
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Desktop Nav & Mobile Drawer
    if 'href="#gallery-section"' not in html:
        html = html.replace(
            '<a href="#services-section" class="nav-link">سہولیات</a>',
            '<a href="#services-section" class="nav-link">سہولیات</a>\n        <a href="#gallery-section" class="nav-link">📸 دکان کی جھلک</a>'
        )
        html = html.replace(
            '<a href="#services-section" class="drawer-link"><span class="drawer-icon">🛠️</span> <span>ہماری سہولیات و مرمت</span></a>',
            '<a href="#gallery-section" class="drawer-link"><span class="drawer-icon">📸</span> <span>دکان کی تصویری جھلک</span></a>\n      <a href="#services-section" class="drawer-link"><span class="drawer-icon">🛠️</span> <span>ہماری سہولیات و مرمت</span></a>'
        )

    # 2. Hero Visual Card
    old_hero_visual_re = r'<div class="hero-visual">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>'
    new_hero_visual = '''<div class="hero-visual">
          <div class="hero-lens-card">
            <div class="hero-store-img-wrap">
              <img 
                src="images/shop/shop-full-interior.webp" 
                alt="طارق آپٹیکل سنٹر نیاز بازار قصور اندرونی منظر" 
                width="400" 
                height="250" 
                class="hero-store-img"
              />
              <div class="hero-store-badge">
                <span>📍 نیاز بازار، قصور</span>
              </div>
              <div class="hero-eye-floating-badge" aria-hidden="true">
                <svg viewBox="0 0 100 100" class="hero-eye-mini">
                  <defs>
                    <linearGradient id="heroBrassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#E5BE6C" />
                      <stop offset="50%" stop-color="#C8963E" />
                      <stop offset="100%" stop-color="#9E6F22" />
                    </linearGradient>
                    <radialGradient id="heroTealGrad" cx="45%" cy="45%" r="55%">
                      <stop offset="0%" stop-color="#4CE0DB" />
                      <stop offset="60%" stop-color="#2BB5B0" />
                      <stop offset="100%" stop-color="#0E585D" />
                    </radialGradient>
                  </defs>
                  <circle cx="50" cy="50" r="46" fill="none" stroke="url(#heroBrassGrad)" stroke-width="6"/>
                  <path d="M 12 50 C 24 30, 76 30, 88 50 C 76 70, 24 70, 12 50 Z" fill="#FFFFFF" stroke="#0E3B43" stroke-width="2"/>
                  <circle cx="50" cy="50" r="17.5" fill="url(#heroTealGrad)"/>
                  <circle cx="50" cy="50" r="8.5" fill="#0E3B43"/>
                  <circle cx="45" cy="45" r="3.2" fill="#FFFFFF"/>
                </svg>
              </div>
            </div>
            <h2 style="font-size:1.3rem; margin-top:0.4rem; margin-bottom:0.35rem; color:var(--heading);">ہماری اصل دکان کی ایک جھلک</h2>
            <p style="font-size:0.92rem; color:var(--muted); margin-bottom:0.75rem;">
              نیاز بازار قصور میں سینکڑوں جدید فریمز اور معیاری شیشوں کی وسیع ورائٹی
            </p>
            <div style="display:flex; justify-content:center; gap:0.5rem; flex-wrap:wrap;">
              <span class="availability-badge badge-in-stock">● دکان کھلی ہے</span>
              <span class="badge" style="background:var(--brass-light); color:var(--brass-dark); font-weight:700; font-size:0.85rem; padding:3px 10px; border-radius:var(--radius-pill);">کمپیوٹرائزڈ ٹیسٹ</span>
            </div>
          </div>
        </div>
      </div>
    </section>'''
    html = re.sub(old_hero_visual_re, new_hero_visual, html, count=1)

    # 3. Category Tiles Grid
    old_cat_grid_re = r'<div class="category-tiles-grid">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>'
    new_cat_grid = '''<div class="category-tiles-grid">
          <a href="#browse-section" class="cat-tile-card" data-cat-target="frame">
            <div class="cat-tile-thumb-wrap">
              <img src="images/shop/shop-frames-display.webp" alt="طارق آپٹیکل فریمز وال ڈسپلے" loading="lazy" decoding="async" width="180" height="135" class="cat-tile-img" />
              <span class="cat-tile-badge">👓 فریمز</span>
            </div>
            <span class="cat-tile-title">فریم</span>
            <span class="cat-tile-sub">سینکڑوں ڈیزائن و سائز</span>
          </a>

          <a href="#browse-section" class="cat-tile-card" data-cat-target="sun">
            <div class="cat-tile-thumb-wrap">
              <img src="images/shop/shop-sunglasses-rack.webp" alt="طارق آپٹیکل سن گلاسز ریک" loading="lazy" decoding="async" width="180" height="135" class="cat-tile-img" />
              <span class="cat-tile-badge">🕶️ سن گلاسز</span>
            </div>
            <span class="cat-tile-title">دھوپ کے چشمے</span>
            <span class="cat-tile-sub">UV400 و پولرائزڈ ورائٹی</span>
          </a>

          <a href="#browse-section" class="cat-tile-card" data-cat-target="lens">
            <div class="cat-tile-thumb-wrap">
              <img src="images/lenses/bb687047-9c60-4bbc-bb10-7911672b7914.webp" alt="معیاری آپٹیکل لینز" loading="lazy" decoding="async" width="180" height="135" class="cat-tile-img" />
              <span class="cat-tile-badge">🔍 لینز</span>
            </div>
            <span class="cat-tile-title">لینز</span>
            <span class="cat-tile-sub">بلیو کٹ و فوٹو کرومک</span>
          </a>

          <a href="#browse-section" class="cat-tile-card" data-cat-target="mirror">
            <div class="cat-tile-thumb-wrap">
              <img src="images/mirrors/sample-counter-mirror.webp" alt="ٹرائل و کاؤنٹر آئینے" loading="lazy" decoding="async" width="180" height="135" class="cat-tile-img" />
              <span class="cat-tile-badge">🪞 آئینے</span>
            </div>
            <span class="cat-tile-title">آئینے</span>
            <span class="cat-tile-sub">ٹرائل و کاؤنٹر مرر</span>
          </a>

          <a href="#browse-section" class="cat-tile-card" data-cat-target="accessory">
            <div class="cat-tile-thumb-wrap">
              <img src="images/shop/shop-owner-solutions.webp" alt="لینز کیئر اور لوازمات" loading="lazy" decoding="async" width="180" height="135" class="cat-tile-img" />
              <span class="cat-tile-badge">🧰 لوازمات</span>
            </div>
            <span class="cat-tile-title">لوازمات</span>
            <span class="cat-tile-sub">لینز کیئر، باکس و کلینر</span>
          </a>
        </div>
      </div>
    </section>'''
    html = re.sub(old_cat_grid_re, new_cat_grid, html, count=1)

    # 4. Services Section: Append spotlight banner
    old_services_end_re = r'(<div class="service-card">\s*<div class="service-icon" aria-hidden="true">🛠️</div>[\s\S]*?<\/div>\s*<\/div>)'
    spotlight_html = r'''\1

        <!-- Services Machine Spotlight Banner -->
        <div class="service-machine-spotlight">
          <div class="service-machine-img-box">
            <img 
              src="images/shop/shop-computerized-test.webp" 
              alt="جدید کمپیوٹرائزڈ نظر ٹیسٹ کی مشین طارق آپٹیکل سنٹر" 
              loading="lazy" 
              decoding="async" 
              width="450" 
              height="300" 
            />
            <span class="service-machine-tag">🔬 اصل دکان کی مشین AR9500-A</span>
          </div>
          <div class="service-machine-copy">
            <span class="section-badge" style="margin-bottom:0.5rem; width:fit-content;">جدید جاپانی ٹیکنالوجی</span>
            <h3 style="font-size:1.4rem; color:var(--heading); margin-bottom:0.75rem;">کمپیوٹرائزڈ نظر ٹیسٹ اور مکمل رہنمائی</h3>
            <p style="color:var(--text); line-height:1.7; margin-bottom:1rem;">
              طارق آپٹیکل سنٹر پر جدید آٹو ریفریکٹو میٹر (AR9500-A) اور بیلا آئی چارٹ موجود ہے، جس سے آپ کی آنکھوں کا درست ترین نمبر (SPH اور CYL) چیک کیا جاتا ہے اور ماہرانہ رہنمائی فراہم کی جاتی ہے۔
            </p>
            <ul style="list-style:none; padding:0; display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1.25rem; font-weight:600; color:var(--heading); font-size:0.95rem;">
              <li>✅ 100% درست کمپیوٹرائزڈ نمبر کی پیمائش</li>
              <li>✅ موبائل اور کمپیوٹر کے لیے بلیو کٹ لینز کی گائیڈنس</li>
              <li>✅ پرانے فریم میں نیا نمبر والا لینز فٹ کروانے کی سہولت</li>
            </ul>
            <a href="https://wa.me/923084454785?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%DB%8C%DA%A9%D9%85%21%20%D9%85%DB%8C%DA%BA%20%D9%86%D8%B8%D8%B1%20%DA%A9%DB%92%20%D9%B9%DB%8C%D8%B3%D9%B9%20%DA%A9%DB%92%20%D8%AD%D9%88%D8%A7%D9%84%DB%92%20%D8%B3%DB%92%20%D9%BE%D9%88%DA%86%DA%BE%D9%86%D8%A7%20%DA%86%D8%A7%DB%81%D8%AA%D8%A7%20%DB%81%D9%88%DA%BA%DB%94" target="_blank" rel="noopener noreferrer" class="btn btn-wa" style="width:fit-content;">
              <span>💬</span> <span>ٹیسٹ کے لیے واٹس ایپ پر رابطہ</span>
            </a>
          </div>
        </div>'''
    html = re.sub(old_services_end_re, spotlight_html, html, count=1)

    # 5. About Us Section: Real Owner & Shop Photo
    old_about_img_re = r'<div class="about-image-wrap">[\s\S]*?<\/div>'
    new_about_img = '''<div class="about-image-wrap">
          <div class="about-card-figure">
            <img 
              src="images/shop/shop-owner-solutions.webp" 
              alt="پروپرائیٹر طارق عزیز اور آپٹیکل پروڈکٹس ڈسپلے" 
              loading="lazy" 
              decoding="async"
              width="600" 
              height="700"
              class="about-main-img"
            />
            <div class="about-img-caption">
              <strong>👤 پروپرائیٹر طارق عزیز</strong>
              <span>طارق آپٹیکل سنٹر، نیاز بازار قصور</span>
            </div>
          </div>
        </div>'''
    html = re.sub(old_about_img_re, new_about_img, html, count=1)

    # 6. Real Store Gallery Section: Insert after About Section
    if 'id="gallery-section"' not in html:
        gallery_section_html = '''

    <!-- =========================================================================
         10b. Real Store Photo Gallery (دکان کی تصویری جھلک)
         ========================================================================= -->
    <section class="gallery-section" id="gallery-section" aria-label="ہماری دکان کی تصویری جھلک">
      <div class="container">
        <div class="section-title-wrap">
          <span class="section-badge">📸 تصویری جھلک</span>
          <h2>ہماری دکان کی ایک جھلک</h2>
          <p class="section-desc">نیاز بازار، قصور میں واقع طارق آپٹیکل سنٹر کے اصل اندرونی مناظر اور کاؤنٹرز</p>
        </div>

        <div class="gallery-grid">
          <!-- Item 1: Wide interior -->
          <div class="gallery-card">
            <div class="gallery-img-box">
              <img src="images/shop/shop-full-interior.webp" alt="طارق آپٹیکل سنٹر کا وسیع اندرونی منظر" loading="lazy" decoding="async" width="500" height="320" />
              <span class="gallery-pill">🏛️ اندرونی منظر</span>
            </div>
            <div class="gallery-info">
              <h3>دکان کا وسیع اندرونی منظر</h3>
              <p>جدید ڈسپلے، صاف ستھرا آرام دہ ماحول اور فریمز کی مکمل نمائش۔</p>
            </div>
          </div>

          <!-- Item 2: Frames Display Wall -->
          <div class="gallery-card">
            <div class="gallery-img-box">
              <img src="images/shop/shop-frames-display.webp" alt="فریمز ڈسپلے وال اور کاؤنٹر" loading="lazy" decoding="async" width="500" height="320" />
              <span class="gallery-pill">👓 فریمز ڈسپلے</span>
            </div>
            <div class="gallery-info">
              <h3>سینکڑوں ڈیزائنر فریمز</h3>
              <p>مردانہ، زنانہ اور بچوں کے فریمز کی منظم وال اور ٹرائل کاؤنٹر۔</p>
            </div>
          </div>

          <!-- Item 3: Sunglasses Wall Rack -->
          <div class="gallery-card">
            <div class="gallery-img-box">
              <img src="images/shop/shop-sunglasses-rack.webp" alt="دھوپ کے چشمے اور بچوں کے فیشن گلاسز" loading="lazy" decoding="async" width="500" height="320" />
              <span class="gallery-pill">🕶️ سن گلاسز وال</span>
            </div>
            <div class="gallery-info">
              <h3>دھوپ کے چشمے اور فیشن سن گلاسز</h3>
              <p>UV400، پولرائزڈ اور ہر رنگ و ڈیزائن کے چشموں کا وسیع ذخیرہ۔</p>
            </div>
          </div>

          <!-- Item 4: Computerized Test Machine -->
          <div class="gallery-card">
            <div class="gallery-img-box">
              <img src="images/shop/shop-computerized-test.webp" alt="کمپیوٹرائزڈ نظر ٹیسٹ کی مشین AR9500-A" loading="lazy" decoding="async" width="500" height="320" />
              <span class="gallery-pill">🔬 کمپیوٹرائزڈ مشین</span>
            </div>
            <div class="gallery-info">
              <h3>جدید آٹو ریفریکٹو میٹر</h3>
              <p>نظر کے نمبر (SPH/CYL) کی 100% درست ترین کمپیوٹرائزڈ پیمائش۔</p>
            </div>
          </div>

          <!-- Item 5: Tariq Aziz Banner & Eye Care -->
          <div class="gallery-card">
            <div class="gallery-img-box">
              <img src="images/shop/shop-owner-solutions.webp" alt="پروپرائیٹر طارق عزیز اور لینز کیئر پروڈکٹس" loading="lazy" decoding="async" width="500" height="320" />
              <span class="gallery-pill">👤 طارق عزیز کاؤنٹر</span>
            </div>
            <div class="gallery-info">
              <h3>پروپرائیٹر طارق عزیز و لینز کیئر</h3>
              <p>آنکھوں کے لیے معیاری لینز واش سلوشنز، کلیننگ کٹس اور چشمہ ایکسیسریز۔</p>
            </div>
          </div>
        </div>
      </div>
    </section>'''
        html = html.replace('</section>\n\n    <!-- =========================================================================\n         11. Visit Us & Location', '</section>' + gallery_section_html + '\n\n    <!-- =========================================================================\n         11. Visit Us & Location')

    # 7. Footer link
    if 'href="#gallery-section"' in html and '<li><a href="#gallery-section">' not in html:
        html = html.replace(
            '<li><a href="#order-section">🛒 آپ کا آرڈر</a></li>',
            '<li><a href="#gallery-section">📸 دکان کی جھلک</a></li>\n            <li><a href="#order-section">🛒 آپ کا آرڈر</a></li>'
        )

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Successfully updated index.html with all real shop images and gallery section!")

if __name__ == '__main__':
    update_html()
