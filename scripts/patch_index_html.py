# -*- coding: utf-8 -*-

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read().replace('\r\n', '\n')

# 1. Desktop Nav & Mobile 3-Dot Button in Header
header_old = """      <a href="#top" class="brand-link" aria-label="طارق آپٹیکل سنٹر ہوم">
        <svg class="brand-logo-svg" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="none" stroke="#C8963E" stroke-width="5"/>
          <path d="M 12 50 C 24 30, 76 30, 88 50 C 76 70, 24 70, 12 50 Z" fill="#FFFFFF" stroke="#0E3B43" stroke-width="1.5"/>
          <circle cx="50" cy="50" r="17.5" fill="#2BB5B0"/>
          <circle cx="50" cy="50" r="8.5" fill="#0E3B43"/>
          <circle cx="45" cy="45" r="3.2" fill="#FFFFFF"/>
        </svg>
        <div class="brand-text">
          <span class="brand-title" id="brand-title">طارق آپٹیکل سنٹر</span>
          <span class="brand-sub">نیاز بازار، قصور</span>
        </div>
      </a>

      <div class="header-actions">
        <!-- Call Button -->
        <a href="tel:03084454785" class="btn btn-primary conf-phone-primary" aria-label="فون پر کال کریں">
          <span aria-hidden="true">📞</span>
          <span class="btn-text-short">کال</span>
          <span class="num btn-text-full">0308-4454785</span>
        </a>

        <!-- Cart Button with Count Badge -->
        <a href="#order-section" class="btn btn-icon-only cart-icon-btn" aria-label="آپ کا آرڈر دیکھیں">
          <span aria-hidden="true" style="font-size:1.4rem;">🛒</span>
          <span class="cart-badge num" id="header-cart-count" style="display:none;">0</span>
        </a>

        <!-- Dark/Light Theme Toggle -->
        <button type="button" class="btn btn-icon-only theme-toggle-btn" id="theme-toggle-btn" aria-label="ڈارک یا لائٹ موڈ تبدیل کریں">
          <span aria-hidden="true">🌓</span>
        </button>
      </div>"""

header_new = """      <a href="#top" class="brand-link" aria-label="طارق آپٹیکل سنٹر ہوم">
        <svg class="brand-logo-svg" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="none" stroke="#C8963E" stroke-width="5"/>
          <path d="M 12 50 C 24 30, 76 30, 88 50 C 76 70, 24 70, 12 50 Z" fill="#FFFFFF" stroke="#0E3B43" stroke-width="1.5"/>
          <circle cx="50" cy="50" r="17.5" fill="#2BB5B0"/>
          <circle cx="50" cy="50" r="8.5" fill="#0E3B43"/>
          <circle cx="45" cy="45" r="3.2" fill="#FFFFFF"/>
        </svg>
        <div class="brand-text">
          <span class="brand-title" id="brand-title">طارق آپٹیکل سنٹر</span>
          <span class="brand-sub">نیاز بازار، قصور</span>
        </div>
      </a>

      <!-- Desktop Navigation Bar -->
      <nav class="desktop-nav" aria-label="مرکزی مینو">
        <a href="#top" class="nav-link">ہوم</a>
        <a href="#browse-section" class="nav-link" data-cat="frame">فریمز</a>
        <a href="#browse-section" class="nav-link" data-cat="sun">سن گلاسز</a>
        <a href="#browse-section" class="nav-link" data-cat="lens">لینز</a>
        <a href="#prescription-card-box" class="nav-link nav-link-badge">
          <span>📋</span> کارڈ / نسخہ
        </a>
        <a href="#services-section" class="nav-link">سہولیات</a>
        <a href="#about-section" class="nav-link">ہمارے بارے میں</a>
        <a href="#visit-section" class="nav-link">رابطہ</a>
      </nav>

      <div class="header-actions">
        <!-- Call Button -->
        <a href="tel:03084454785" class="btn btn-primary conf-phone-primary" aria-label="فون پر کال کریں">
          <span aria-hidden="true">📞</span>
          <span class="btn-text-short">کال</span>
          <span class="num btn-text-full">0308-4454785</span>
        </a>

        <!-- Cart Button with Count Badge -->
        <a href="#order-section" class="btn btn-icon-only cart-icon-btn" aria-label="آپ کا آرڈر دیکھیں">
          <span aria-hidden="true" style="font-size:1.4rem;">🛒</span>
          <span class="cart-badge num" id="header-cart-count" style="display:none;">0</span>
        </a>

        <!-- Dark/Light Theme Toggle -->
        <button type="button" class="btn btn-icon-only theme-toggle-btn" id="theme-toggle-btn" aria-label="ڈارک یا لائٹ موڈ تبدیل کریں">
          <span aria-hidden="true">🌓</span>
        </button>

        <!-- Mobile 3-Dot Menu Button -->
        <button type="button" class="btn btn-icon-only menu-toggle-btn" id="menu-toggle-btn" aria-label="موبائل مینو کھولیں" aria-expanded="false" aria-controls="mobile-nav-drawer">
          <span class="three-dots-icon" aria-hidden="true">⋮</span>
        </button>
      </div>"""

if header_old in html:
    html = html.replace(header_old, header_new, 1)
    print("Header nav & 3-dot button added!")
else:
    print("Could not find header_old")

# 2. Add Mobile Nav Drawer right after </header>
drawer_markup = """  </header>

  <!-- Mobile Navigation Drawer & Backdrop -->
  <div class="mobile-nav-backdrop" id="mobile-nav-backdrop"></div>
  <aside class="mobile-nav-drawer" id="mobile-nav-drawer" aria-label="موبائل مینو" aria-hidden="true">
    <div class="drawer-header">
      <div class="drawer-brand">
        <span class="brand-title">طارق آپٹیکل سنٹر</span>
        <span class="brand-sub">نیاز بازار، قصور</span>
      </div>
      <button type="button" class="drawer-close-btn" id="drawer-close-btn" aria-label="مینو بند کریں">✕</button>
    </div>

    <div class="drawer-quick-actions">
      <a href="tel:03084454785" class="btn btn-primary btn-sm conf-phone-primary">
        <span>📞</span> <span>فوری کال</span>
      </a>
      <a href="https://wa.me/923084454785" target="_blank" rel="noopener noreferrer" class="btn btn-wa btn-sm conf-whatsapp-btn">
        <span>💬</span> <span>واٹس ایپ</span>
      </a>
    </div>

    <nav class="drawer-nav">
      <a href="#top" class="drawer-link"><span class="drawer-icon">🏠</span> <span>ہوم پیج</span></a>
      <a href="#browse-section" class="drawer-link" data-cat="frame"><span class="drawer-icon">👓</span> <span>نظر کے فریمز</span></a>
      <a href="#browse-section" class="drawer-link" data-cat="sun"><span class="drawer-icon">🕶️</span> <span>دھوپ کے چشمے (Sunglasses)</span></a>
      <a href="#browse-section" class="drawer-link" data-cat="lens"><span class="drawer-icon">🔬</span> <span>آپٹیکل لینز (Lenses)</span></a>
      <a href="#prescription-card-box" class="drawer-link drawer-link-highlight"><span class="drawer-icon">📋</span> <span>آنکھوں کا کارڈ / نسخہ اپلوڈ کریں</span></a>
      <a href="#services-section" class="drawer-link"><span class="drawer-icon">🛠️</span> <span>ہماری سہولیات و مرمت</span></a>
      <a href="#about-section" class="drawer-link"><span class="drawer-icon">🏢</span> <span>طارق آپٹیکل سنٹر کے بارے میں</span></a>
      <a href="#visit-section" class="drawer-link"><span class="drawer-icon">📍</span> <span>دکان کا پتہ اور اوقات</span></a>
      <a href="#order-section" class="drawer-link"><span class="drawer-icon">🛒</span> <span>آپ کا آرڈر (<span class="drawer-cart-count num">0</span>)</span></a>
    </nav>
  </aside>"""

if '  </header>' in html and 'mobile-nav-drawer' not in html:
    html = html.replace('  </header>', drawer_markup, 1)
    print("Mobile nav drawer markup added!")

# 3. Add Prescription / Card Upload inside #order-form right before Name Field
form_old = """            <form id="order-form" novalidate>
              <!-- Name Field -->"""

form_new = """            <form id="order-form" novalidate>
              <!-- Prescription / Eye Card Upload Box -->
              <div class="prescription-upload-card" id="prescription-card-box">
                <div class="prescription-header">
                  <div class="prescription-icon">📋</div>
                  <div>
                    <h3 class="prescription-title">آنکھوں کا کارڈ یا ڈاکٹر کا نسخہ اپلوڈ کریں</h3>
                    <p class="prescription-sub">اگر آپ کے پاس پرانے چشمے کا کارڈ یا ڈاکٹر کا نسخہ موجود ہے تو تصویر کھینچ کر یا گیلری سے اپلوڈ کریں۔ آپ کا منتخب فریم، لینز اور کارڈ سب واٹس ایپ پر دکان دار کو موصول ہوں گے!</p>
                  </div>
                </div>

                <div class="prescription-upload-zone" id="prescription-upload-zone">
                  <input type="file" id="prescription-input" accept="image/*" capture="environment" class="prescription-file-input" aria-label="آنکھوں کے کارڈ کی تصویر منتخب کریں">
                  <div class="upload-placeholder" id="upload-placeholder">
                    <span class="upload-icon">📷</span>
                    <span class="upload-btn-text">کارڈ کی تصویر کھینچیں یا فائل اپلوڈ کریں</span>
                    <span class="upload-hint">موبائل کیمرے سے واضح تصویر یا گیلری سے فوٹو منتخب کریں (JPG, PNG)</span>
                  </div>

                  <!-- Preview when image is uploaded -->
                  <div class="upload-preview" id="upload-preview" style="display:none;">
                    <img id="prescription-preview-img" src="" alt="آنکھوں کا کارڈ پیش نظارہ">
                    <div class="preview-info">
                      <div class="preview-badge">✅ کارڈ کی تصویر تیار ہے</div>
                      <div class="preview-name" id="preview-filename">card.jpg</div>
                      <div class="preview-actions">
                        <button type="button" class="btn btn-sm btn-outline" id="prescription-change-btn">🔄 تصویر تبدیل کریں</button>
                        <button type="button" class="btn btn-sm btn-danger-outline" id="prescription-remove-btn">🗑️ حذف کریں</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Name Field -->"""

if form_old in html:
    html = html.replace(form_old, form_new, 1)
    print("Prescription upload card markup added!")
else:
    print("Could not find form_old")

# 4. Clean up inline styles on footer so CSS sets high contrast
footer_markup_old = """        <div>
          <h3 style="color:#FFFFFF; font-size:1.15rem; margin-bottom:0.75rem;">فوری لنکس</h3>
          <ul style="list-style:none; padding:0; display:flex; flex-direction:column; gap:0.4rem; font-size:0.95rem;">
            <li><a href="#browse-section" style="color:#D7E5E3;">👓 تمام مصنوعات</a></li>
            <li><a href="#order-section" style="color:#D7E5E3;">🛒 آپ کا آرڈر</a></li>
            <li><a href="tel:03084454785" style="color:#D7E5E3;">📞 0308-4454785</a></li>
            <li><a href="https://wa.me/923084454785" target="_blank" rel="noopener noreferrer" style="color:#25D366;">💬 واٹس ایپ آرڈر</a></li>
          </ul>
        </div>

        <div>
          <h3 style="color:#FFFFFF; font-size:1.15rem; margin-bottom:0.75rem;">ایڈریس</h3>
          <p style="font-size:0.95rem; color:#D7E5E3;">
            نیاز بازار، قصور، پنجاب، پاکستان
          </p>
          <p style="font-size:0.9rem; color:#85A6A3;">
            روزانہ صبح 9 بجے تا رات 9 بجے
          </p>
        </div>"""

footer_markup_new = """        <div>
          <h3>فوری لنکس</h3>
          <ul style="list-style:none; padding:0; display:flex; flex-direction:column; gap:0.4rem; font-size:0.95rem;">
            <li><a href="#browse-section">👓 تمام مصنوعات</a></li>
            <li><a href="#prescription-card-box">📋 کارڈ / نسخہ اپلوڈ</a></li>
            <li><a href="#order-section">🛒 آپ کا آرڈر</a></li>
            <li><a href="tel:03084454785">📞 0308-4454785</a></li>
            <li><a href="https://wa.me/923084454785" target="_blank" rel="noopener noreferrer" style="color:#25D366 !important;">💬 واٹس ایپ آرڈر</a></li>
          </ul>
        </div>

        <div>
          <h3>ایڈریس و اوقات</h3>
          <p>
            نیاز بازار، قصور، پنجاب، پاکستان
          </p>
          <p>
            روزانہ صبح 9 بجے تا رات 9 بجے
          </p>
        </div>"""

if footer_markup_old in html:
    html = html.replace(footer_markup_old, footer_markup_new, 1)
    print("Footer markup cleaned and updated!")

# 5. Add Card Reminder Confirmation Modal right before </body>
modal_markup = """  <!-- Card Reminder Modal -->
  <div class="card-reminder-modal" id="card-reminder-modal" role="dialog" aria-modal="true" aria-label="کارڈ تصویر کی تصدیق" style="display:none;">
    <div class="card-reminder-content">
      <div style="font-size:2.6rem; margin-bottom:0.4rem;">📱</div>
      <h3 style="color:var(--heading); font-size:1.35rem; margin-bottom:0.4rem;">آپ کا آرڈر واٹس ایپ پر تیار ہے!</h3>
      <p style="color:var(--muted); font-size:0.95rem; line-height:1.6;">
        ہم نے آپ کے آرڈر اور کارڈ کی تمام معلومات واٹس ایپ کے لیے تیار کر دی ہیں۔<br>
        <strong>اہم نوٹ:</strong> جیسے ہی واٹس ایپ کھلے، نیچے دی گئی کارڈ تصویر چیٹ میں <strong>📎 (اٹیچمنٹ)</strong> دبا کر ساتھ بھیج دیں تاکہ آپٹیشن آپ کا نمبر فوراً چیک کر سکے۔
      </p>

      <img id="modal-card-preview-img" class="card-reminder-img" src="" alt="آپ کا کارڈ">

      <div style="display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap; margin-top:1.25rem;">
        <a id="modal-whatsapp-again-btn" href="#" target="_blank" rel="noopener noreferrer" class="btn btn-wa">
          <span>💬</span> <span>واٹس ایپ چیٹ پر جائیں</span>
        </a>
        <button type="button" class="btn btn-outline" id="modal-reminder-close-btn">
          سمجھ گیا (بند کریں)
        </button>
      </div>
    </div>
  </div>

</body>"""

if '</body>' in html and 'card-reminder-modal' not in html:
    html = html.replace('</body>', modal_markup, 1)
    print("Card reminder modal added!")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("index.html updated successfully!")
