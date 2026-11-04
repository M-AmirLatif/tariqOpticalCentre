/**
 * طارق آپٹیکل سنٹر (Tariq Optical Centre) - Main Application Logic
 * Vanilla JavaScript (No frameworks, No dependencies)
 */

(function () {
  'use strict';

  // Application State
  const state = {
    allProducts: [],
    filteredProducts: [],
    visibleCount: 12,
    cart: [],
    prescriptionImage: null,
    prescriptionFile: null,
    filters: {
      category: 'all',
      subcat: 'all',
      search: '',
      gender: 'all',
      color: 'all',
      material: 'all',
      inStockOnly: false,
      sort: 'newest'
    },
    lightbox: {
      isOpen: false,
      currentIndex: -1,
      lastFocusedElement: null
    }
  };

  // Safe localStorage wrapper
  const storage = {
    get(key, fallback) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
      } catch (e) {
        console.warn('localStorage read error:', e);
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn('localStorage write error:', e);
      }
    }
  };

  // DOM Elements Cache
  const dom = {
    // Header & Meta
    brandTitle: document.getElementById('brand-title'),
    cartCountBadge: document.getElementById('header-cart-count'),
    themeToggle: document.getElementById('theme-toggle-btn'),
    // Browser & Filter
    searchInput: document.getElementById('search-input'),
    categoryTabs: document.getElementById('category-tabs'),
    subcatChips: document.getElementById('subcat-chips'),
    filterGender: document.getElementById('filter-gender'),
    filterColor: document.getElementById('filter-color'),
    filterMaterial: document.getElementById('filter-material'),
    filterInStock: document.getElementById('filter-instock'),
    clearFiltersBtn: document.getElementById('clear-filters-btn'),
    sortSelect: document.getElementById('sort-select'),
    filterCountLabel: document.getElementById('filter-count-label'),
    // Grid
    productGrid: document.getElementById('product-grid'),
    loadMoreContainer: document.getElementById('load-more-container'),
    loadMoreBtn: document.getElementById('load-more-btn'),
    emptyState: document.getElementById('empty-state'),
    // Sticky Cart Bar
    stickyCartBar: document.getElementById('sticky-cart-bar'),
    cartBarCount: document.getElementById('cart-bar-count'),
    cartBarTotal: document.getElementById('cart-bar-total'),
    cartBarBtn: document.getElementById('cart-bar-btn'),
    // Cart / Order Form
    cartItemsList: document.getElementById('cart-items-list'),
    cartTotalPrice: document.getElementById('cart-total-price'),
    orderForm: document.getElementById('order-form'),
    orderSuccessCard: document.getElementById('order-success-card'),
    orderResetBtn: document.getElementById('order-reset-btn'),
    // Mobile Drawer
    menuToggleBtn: document.getElementById('menu-toggle-btn'),
    mobileNavDrawer: document.getElementById('mobile-nav-drawer'),
    mobileNavBackdrop: document.getElementById('mobile-nav-backdrop'),
    drawerCloseBtn: document.getElementById('drawer-close-btn'),
    drawerCartCount: document.querySelector('.drawer-cart-count'),
    // Prescription Card Upload
    prescriptionInput: document.getElementById('prescription-input'),
    prescriptionCardBox: document.getElementById('prescription-card-box'),
    prescriptionUploadZone: document.getElementById('prescription-upload-zone'),
    uploadPlaceholder: document.getElementById('upload-placeholder'),
    uploadPreview: document.getElementById('upload-preview'),
    prescriptionPreviewImg: document.getElementById('prescription-preview-img'),
    previewFilename: document.getElementById('preview-filename'),
    prescriptionChangeBtn: document.getElementById('prescription-change-btn'),
    prescriptionRemoveBtn: document.getElementById('prescription-remove-btn'),
    // Card Reminder Modal
    cardReminderModal: document.getElementById('card-reminder-modal'),
    modalCardPreviewImg: document.getElementById('modal-card-preview-img'),
    modalWhatsappAgainBtn: document.getElementById('modal-whatsapp-again-btn'),
    modalReminderCloseBtn: document.getElementById('modal-reminder-close-btn'),
    // Dedicated Order / Cart Modal
    orderModalOverlay: document.getElementById('order-modal-overlay'),
    orderModalCloseBtn: document.getElementById('order-modal-close-btn'),
    modalCartItemsList: document.getElementById('modal-cart-items-list'),
    modalCartTotalBar: document.getElementById('modal-cart-total-bar'),
    modalCartItemCount: document.getElementById('modal-cart-item-count'),
    modalOrderForm: document.getElementById('modal-order-form'),
    modalOrderSuccess: document.getElementById('modal-order-success'),
    modalOrderDoneBtn: document.getElementById('modal-order-done-btn'),
    modalPrescriptionInput: document.getElementById('modal-prescription-input'),
    modalUploadZone: document.getElementById('modal-upload-zone'),
    modalUploadPlaceholder: document.getElementById('modal-upload-placeholder'),
    modalUploadPreview: document.getElementById('modal-upload-preview'),
    modalPreviewImg: document.getElementById('modal-preview-img'),
    modalPreviewFilename: document.getElementById('modal-preview-filename'),
    modalRemovePrescBtn: document.getElementById('modal-remove-presc-btn'),
    // Lightbox
    lightboxOverlay: document.getElementById('lightbox-overlay'),
    lightboxCloseBtn: document.getElementById('lightbox-close-btn'),
    lightboxPrevBtn: document.getElementById('lightbox-prev-btn'),
    lightboxNextBtn: document.getElementById('lightbox-next-btn'),
    lightboxBody: document.getElementById('lightbox-body')
  };

  // Pakistani Mobile Number Validator (03xx-xxxxxxx or 03xxxxxxxxx)
  function isValidPakistaniPhone(phone) {
    const cleaned = phone.replace(/[\s\-]/g, '');
    return /^03\d{9}$/.test(cleaned);
  }

  // Format currency
  function formatRs(amount) {
    if (!amount || amount <= 0) return 'قیمت واٹس ایپ پر پوچھیں';
    return `<span class="price-currency">روپے</span> <span class="num" dir="ltr">${Number(amount).toLocaleString('en-US')}</span>`;
  }

  // Format plain text Rs for WhatsApp message
  function formatRsPlain(amount) {
    if (!amount || amount <= 0) return 'قیمت رابطہ پر طے ہوگی';
    return `Rs ${Number(amount).toLocaleString('en-US')}`;
  }

  // Initialize App
  async function init() {
    loadTheme();
    state.cart = storage.get('tariq_optical_cart', []);
    renderCategoryTabs();
    populateStaticInfo();
    setupEventListeners();

    // Use requestIdleCallback or setTimeout to yield to main thread for zero blocking time
    const deferLoad = window.requestIdleCallback || ((cb) => setTimeout(cb, 16));
    deferLoad(async () => {
      await fetchProducts();
      populateDynamicFilters();
      applyFilters();
      updateCartUI();
    });
  }

  // Theme Management
  function getSystemPrefersDark() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  const THEME_SUN_SVG = `<svg class="sun-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFC107" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="#FFD54F" stroke="#FFA000" stroke-width="1.2"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

  const THEME_MOON_SVG = `<svg class="moon-icon-svg" width="19" height="19" viewBox="0 0 24 24" fill="#0E3B43" stroke="#0E3B43" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

  function updateThemeUI(theme) {
    const isDark = theme === 'dark' || (!theme && getSystemPrefersDark());
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      const icon = btn.querySelector('.theme-icon');
      if (icon) {
        icon.innerHTML = isDark ? THEME_SUN_SVG : THEME_MOON_SVG;
      }
      btn.setAttribute('aria-label', isDark ? 'لائٹ موڈ آن کریں (White Mode)' : 'ڈارک موڈ آن کریں (Dark Mode)');
      btn.setAttribute('title', isDark ? 'لائٹ موڈ آن کریں (White Mode)' : 'ڈارک موڈ آن کریں (Dark Mode)');
      const label = btn.querySelector('.drawer-theme-text');
      if (label) {
        label.textContent = isDark ? 'وائٹ موڈ لگائیں' : 'ڈارک موڈ لگائیں';
      }
    });
  }

  function loadTheme() {
    const savedTheme = localStorage.getItem('tariq_optical_theme') || localStorage.getItem('tariq_theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
      updateThemeUI(savedTheme);
    } else {
      const systemTheme = getSystemPrefersDark() ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', systemTheme);
      updateThemeUI(systemTheme);
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('tariq_optical_theme', nextTheme);
    localStorage.setItem('tariq_theme', nextTheme);
    updateThemeUI(nextTheme);
  }

  // Populate config info on page
  function populateStaticInfo() {
    // Fill phone numbers, address, and timings from config
    document.querySelectorAll('.conf-phone-primary').forEach(el => {
      el.href = `tel:${SHOP_CONFIG.primaryPhoneRaw}`;
      const fullSpan = el.querySelector('.btn-text-full');
      if (fullSpan) {
        fullSpan.textContent = SHOP_CONFIG.primaryPhone;
      } else if (!el.children.length) {
        el.textContent = SHOP_CONFIG.primaryPhone;
      }
    });
    document.querySelectorAll('.conf-phone-secondary').forEach(el => {
      el.href = `tel:${SHOP_CONFIG.secondaryPhoneRaw}`;
      const numSpan = el.querySelector('.num');
      if (numSpan) {
        numSpan.textContent = SHOP_CONFIG.secondaryPhone;
      } else if (!el.children.length) {
        el.textContent = SHOP_CONFIG.secondaryPhone;
      }
    });
    document.querySelectorAll('.conf-whatsapp-btn').forEach(el => {
      el.href = `https://wa.me/${SHOP_CONFIG.whatsappNumber}`;
    });
    document.querySelectorAll('.conf-address-urdu').forEach(el => {
      el.textContent = SHOP_CONFIG.addressUrdu;
    });
    document.querySelectorAll('.conf-timings-days').forEach(el => {
      el.textContent = SHOP_CONFIG.timings.days;
    });
    document.querySelectorAll('.conf-timings-hours').forEach(el => {
      el.textContent = SHOP_CONFIG.timings.hours;
    });
    document.querySelectorAll('.conf-maps-url').forEach(el => {
      el.href = SHOP_CONFIG.mapsSearchUrl;
    });
    document.querySelectorAll('.conf-owner-name').forEach(el => {
      el.textContent = SHOP_CONFIG.ownerName;
    });
  }

  // Fetch products.json
  async function fetchProducts() {
    try {
      const res = await fetch('products.json');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      state.allProducts = Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Failed to load products.json:', err);
      state.allProducts = [];
    }
  }

  // Render Top Category Tabs
  function renderCategoryTabs() {
    if (!dom.categoryTabs) return;
    dom.categoryTabs.innerHTML = '';
    SHOP_CONFIG.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `tab-btn ${state.filters.category === cat.id ? 'active' : ''}`;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', state.filters.category === cat.id ? 'true' : 'false');
      btn.innerHTML = `${cat.icon} ${cat.name}`;
      btn.addEventListener('click', () => {
        setCategory(cat.id);
      });
      dom.categoryTabs.appendChild(btn);
    });
  }

  // Set Category & update subcategories
  function setCategory(catId) {
    state.filters.category = catId;
    state.filters.subcat = 'all';
    state.visibleCount = 12;

    // Update Category Tab UI
    document.querySelectorAll('.tab-btn').forEach(btn => {
      const isActive = btn.textContent.includes(SHOP_CONFIG.categories.find(c => c.id === catId)?.name || '');
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    renderSubcatChips();
    applyFilters();
  }

  // Render Subcategory Chips
  function renderSubcatChips() {
    if (!dom.subcatChips) return;
    dom.subcatChips.innerHTML = '';

    const cat = state.filters.category;
    if (cat === 'all' || !SHOP_CONFIG.subcategories[cat]) {
      dom.subcatChips.style.display = 'none';
      return;
    }

    dom.subcatChips.style.display = 'flex';
    const chips = SHOP_CONFIG.subcategories[cat];
    chips.forEach(chip => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `chip-btn ${state.filters.subcat === chip.id ? 'active' : ''}`;
      btn.setAttribute('aria-pressed', state.filters.subcat === chip.id ? 'true' : 'false');
      btn.textContent = chip.name;
      btn.addEventListener('click', () => {
        state.filters.subcat = chip.id;
        state.visibleCount = 12;
        renderSubcatChips();
        applyFilters();
      });
      dom.subcatChips.appendChild(btn);
    });
  }

  // Populate Colors, Materials, Gender in dropdowns from products
  function populateDynamicFilters() {
    const colors = new Set();
    const materials = new Set();

    state.allProducts.forEach(p => {
      if (p.specs) {
        if (p.specs.color) colors.add(p.specs.color);
        if (p.specs.material) materials.add(p.specs.material);
        if (p.specs.frameMaterial) materials.add(p.specs.frameMaterial);
      }
    });

    if (dom.filterColor) {
      colors.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = `رنگ: ${c}`;
        dom.filterColor.appendChild(opt);
      });
    }

    if (dom.filterMaterial) {
      materials.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = `میٹریل: ${m}`;
        dom.filterMaterial.appendChild(opt);
      });
    }
  }

  // Filter & Sort Logic
  function applyFilters() {
    let list = [...state.allProducts];

    // 1. Category Filter
    if (state.filters.category !== 'all') {
      list = list.filter(p => p.cat === state.filters.category);
    }

    // 2. Subcategory Filter
    if (state.filters.subcat !== 'all') {
      list = list.filter(p => {
        const shape = p.specs?.shape || '';
        const kind = p.specs?.kind || '';
        const coating = p.specs?.coating || '';
        const type = p.type || '';
        return shape.includes(state.filters.subcat) ||
               kind.includes(state.filters.subcat) ||
               coating.includes(state.filters.subcat) ||
               type.includes(state.filters.subcat);
      });
    }

    // 3. Search Filter (matches name, code, color, material, brand, shape)
    if (state.filters.search.trim()) {
      const q = state.filters.search.trim().toLowerCase();
      list = list.filter(p => {
        const name = (p.name || '').toLowerCase();
        const code = (p.code || '').toLowerCase();
        const brand = (p.specs?.brand || '').toLowerCase();
        const color = (p.specs?.color || '').toLowerCase();
        const material = (p.specs?.material || p.specs?.frameMaterial || '').toLowerCase();
        const shape = (p.specs?.shape || '').toLowerCase();
        return name.includes(q) || code.includes(q) || brand.includes(q) ||
               color.includes(q) || material.includes(q) || shape.includes(q);
      });
    }

    // 4. Gender Filter
    if (state.filters.gender !== 'all') {
      list = list.filter(p => {
        const g = p.specs?.gender || p.gender || '';
        return g.includes(state.filters.gender) || g.includes('سب کے لیے') || g === 'unisex';
      });
    }

    // 5. Color Filter
    if (state.filters.color !== 'all') {
      list = list.filter(p => (p.specs?.color || '').includes(state.filters.color));
    }

    // 6. Material Filter
    if (state.filters.material !== 'all') {
      list = list.filter(p => {
        const mat = p.specs?.material || p.specs?.frameMaterial || '';
        return mat.includes(state.filters.material);
      });
    }

    // 7. In-Stock Only
    if (state.filters.inStockOnly) {
      list = list.filter(p => p.inStock === true || (p.specs?.stock && p.specs.stock !== 'ختم ہے'));
    }

    // 8. Sorting
    if (state.filters.sort === 'price-low') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (state.filters.sort === 'price-high') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      // Newest (featured first, then descending ID)
      list.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (b.id || 0) - (a.id || 0);
      });
    }

    state.filteredProducts = list;
    renderProducts();
  }

  // Render Product Specs Table (<dl> definition list for accessibility)
  function renderSpecsTable(product) {
    const fieldOrder = SHOP_CONFIG.specsFieldOrder[product.cat] || [];
    let rowsHtml = '';

    fieldOrder.forEach(item => {
      // Don't duplicate code in specs table since it has its own top badge
      if (item.key === 'code') return;
      const val = product.specs ? product.specs[item.key] : null;
      if (val && String(val).trim() !== '') {
        let formattedVal = escapeHtml(val);
        const rawVal = String(val).trim();
        if (item.key === 'powerRange') {
          formattedVal = `<span class="num" dir="ltr">${escapeHtml(rawVal)}</span>`;
        } else if (/^[0-9\-\.\+xX\s\/□]+$/.test(rawVal)) {
          formattedVal = `<span class="num" dir="ltr">${escapeHtml(rawVal)}</span>`;
        } else if (/^([0-9\.\+]+)\s*(.+)$/.test(rawVal)) {
          const m = rawVal.match(/^([0-9\.\+]+)\s*(.+)$/);
          formattedVal = `<bdi class="num" dir="ltr">${escapeHtml(m[1])}</bdi> ${escapeHtml(m[2])}`;
        }
        rowsHtml += `
          <div class="specs-row">
            <dt class="specs-label">${escapeHtml(item.label)}</dt>
            <dd class="specs-value">${formattedVal}</dd>
          </div>
        `;
      }
    });

    if (!rowsHtml) return '';
    return `<dl class="specs-table">${rowsHtml}</dl>`;
  }

  // Render Product Grid
  function renderProducts() {
    if (!dom.productGrid) return;
    dom.productGrid.innerHTML = '';

    const total = state.filteredProducts.length;
    if (dom.filterCountLabel) {
      dom.filterCountLabel.innerHTML = `دستیاب مصنوعات: <strong class="num">${total}</strong>`;
    }

    if (total === 0) {
      if (dom.emptyState) dom.emptyState.style.display = 'block';
      if (dom.loadMoreContainer) dom.loadMoreContainer.style.display = 'none';
      return;
    }

    if (dom.emptyState) dom.emptyState.style.display = 'none';

    const visibleItems = state.filteredProducts.slice(0, state.visibleCount);

    visibleItems.forEach((product, idx) => {
      const card = createProductCard(product, idx);
      dom.productGrid.appendChild(card);
    });

    // Load More Visibility
    if (dom.loadMoreContainer) {
      dom.loadMoreContainer.style.display = state.visibleCount < total ? 'block' : 'none';
    }
  }

  // Create Individual Product Card DOM Element
  function createProductCard(product, index) {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.setAttribute('data-id', product.id);

    const isInStock = product.inStock !== false && product.specs?.stock !== 'ختم ہے';
    const cartItem = state.cart.find(item => item.id === product.id);
    const cartQty = cartItem ? cartItem.qty : 0;

    // Card structure top to bottom:
    // a) Image
    // b) Name
    // c) Code Tag
    // d) Specs List Table
    // e) Availability Badge
    // f) Price
    // g) Buttons

    card.innerHTML = `
      <div class="product-image-container" tabindex="0" role="button" aria-label="زوم کریں - ${escapeHtml(product.name)}">
        <img 
          src="${escapeHtml(product.img)}" 
          alt="${escapeHtml(product.name)} - طارق آپٹیکل سنٹر قصور" 
          loading="lazy" 
          decoding="async"
          width="800"
          height="600"
          class="product-img"
          onerror="this.onerror=null; this.src='images/placeholder-glasses.svg';"
        />
        <div class="zoom-badge">🔍 زوم کریں</div>
      </div>

      <h3 class="product-name" tabindex="0" role="button">${escapeHtml(product.name)}</h3>
      
      <div class="product-badge-row">
        <span class="product-code-tag"><bdi>کوڈ:</bdi> <bdi class="num" dir="ltr">${escapeHtml(product.code || product.specs?.code || 'N/A')}</bdi></span>
        <span class="availability-badge ${isInStock ? 'badge-in-stock' : 'badge-out-of-stock'}">
          ${isInStock ? '● موجود ہے' : '✕ ختم ہے'}
        </span>
      </div>

      <div class="price-box">
        ${product.price > 0 ? `
          <div class="price-main"><span class="price-currency">روپے</span> <span class="num" dir="ltr">${Number(product.price).toLocaleString('en-US')}</span></div>
          <span class="price-tag-sub">معیاری ریٹ</span>
        ` : `
          <div class="price-main price-ask">💬 قیمت واٹس ایپ پر پوچھیں</div>
        `}
      </div>

      <!-- Collapsible Details Accordion -->
      <div class="product-details-accordion">
        <button type="button" class="btn btn-details-toggle" aria-expanded="false" data-id="${product.id}" aria-label="تفصیلات دیکھیں یا چھپائیں">
          <span class="toggle-text">تفصیلات دیکھیں</span>
          <span class="toggle-icon" aria-hidden="true">▼</span>
        </button>
        <div class="product-specs-collapse" id="specs-box-${product.id}">
          ${renderSpecsTable(product)}
        </div>
      </div>

      <div class="card-actions">
        ${renderCardActionButton(product, cartQty, isInStock)}
        <button type="button" class="btn btn-ask-wa" data-action="ask-wa" data-id="${product.id}">
          💬 واٹس ایپ پر پوچھیں
        </button>
      </div>
    `;

    // Bind Image & Title Click to Lightbox
    const imgBox = card.querySelector('.product-image-container');
    const titleEl = card.querySelector('.product-name');
    const openLightboxHandler = () => openLightbox(index);

    imgBox.addEventListener('click', openLightboxHandler);
    imgBox.addEventListener('keydown', (e) => { if (e.key === 'Enter') openLightboxHandler(); });
    titleEl.addEventListener('click', openLightboxHandler);
    titleEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') openLightboxHandler(); });

    // Bind Details Toggle Accordion
    const toggleBtn = card.querySelector('.btn-details-toggle');
    const collapseBox = card.querySelector('.product-specs-collapse');
    if (toggleBtn && collapseBox) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = collapseBox.classList.contains('is-open');
        if (isOpen) {
          collapseBox.classList.remove('is-open');
          toggleBtn.setAttribute('aria-expanded', 'false');
          toggleBtn.querySelector('.toggle-text').textContent = 'تفصیلات دیکھیں';
        } else {
          collapseBox.classList.add('is-open');
          toggleBtn.setAttribute('aria-expanded', 'true');
          toggleBtn.querySelector('.toggle-text').textContent = 'تفصیلات چھپائیں';
        }
      });
    }

    // Bind Card Buttons
    const askWaBtn = card.querySelector('[data-action="ask-wa"]');
    askWaBtn.addEventListener('click', () => askProductOnWhatsApp(product));

    bindCardCartEvents(card, product, isInStock);

    return card;
  }

  // Render Action Button: Either "+ آرڈر میں ڈالیں" or Stepper "− qty +"
  function renderCardActionButton(product, qty, isInStock) {
    if (!isInStock) {
      return `
        <button type="button" class="btn btn-add-cart" disabled aria-disabled="true">
          ختم ہے (دستیاب نہیں)
        </button>
      `;
    }

    if (qty > 0) {
      return `
        <div class="qty-stepper" aria-label="تعداد تبدیل کریں">
          <button type="button" class="stepper-btn" data-action="decrease" data-id="${product.id}" aria-label="ایک کم کریں">−</button>
          <span class="stepper-num num">${qty}</span>
          <button type="button" class="stepper-btn" data-action="increase" data-id="${product.id}" aria-label="ایک زیادہ کریں">+</button>
        </div>
      `;
    }

    return `
      <button type="button" class="btn btn-add-cart" data-action="add" data-id="${product.id}">
        🛒 آرڈر میں ڈالیں
      </button>
    `;
  }

  // Bind Stepper and Add to Cart Events
  function bindCardCartEvents(container, product, isInStock) {
    const addBtn = container.querySelector('[data-action="add"]');
    if (addBtn && isInStock) {
      addBtn.addEventListener('click', () => {
        addToCart(product);
      });
    }

    const decBtn = container.querySelector('[data-action="decrease"]');
    const incBtn = container.querySelector('[data-action="increase"]');

    if (decBtn) {
      decBtn.addEventListener('click', () => updateCartQty(product.id, -1));
    }
    if (incBtn) {
      incBtn.addEventListener('click', () => updateCartQty(product.id, 1));
    }
  }

  // Cart Operations
  function addToCart(product) {
    const existing = state.cart.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      state.cart.push({
        id: product.id,
        code: product.code || product.specs?.code || 'N/A',
        name: product.name,
        price: product.price || 0,
        qty: 1,
        img: product.img,
        cat: product.cat,
        specs: product.specs || {}
      });
    }
    saveCart();
    updateCartUI();
    renderProducts();
    if (state.lightbox.isOpen) {
      renderLightboxContent(state.lightbox.currentIndex);
    }
  }

  function updateCartQty(productId, delta) {
    const item = state.cart.find(i => i.id === productId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      state.cart = state.cart.filter(i => i.id !== productId);
    }
    saveCart();
    updateCartUI();
    renderProducts();
    if (state.lightbox.isOpen) {
      renderLightboxContent(state.lightbox.currentIndex);
    }
  }

  function removeFromCart(productId) {
    state.cart = state.cart.filter(i => i.id !== productId);
    saveCart();
    updateCartUI();
    renderProducts();
    if (state.lightbox.isOpen) {
      renderLightboxContent(state.lightbox.currentIndex);
    }
  }

  function clearCart() {
    state.cart = [];
    saveCart();
    updateCartUI();
    renderProducts();
  }

  function saveCart() {
    storage.set('tariq_optical_cart', state.cart);
  }


  // Mobile Nav Drawer Toggle
  function openDrawer() {
    if (dom.mobileNavDrawer) {
      dom.mobileNavDrawer.classList.add('active');
      dom.mobileNavDrawer.setAttribute('aria-hidden', 'false');
    }
    if (dom.mobileNavBackdrop) {
      dom.mobileNavBackdrop.classList.add('active');
    }
    if (dom.menuToggleBtn) {
      dom.menuToggleBtn.setAttribute('aria-expanded', 'true');
    }
    document.documentElement.classList.add('drawer-locked');
    document.body.classList.add('drawer-locked');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (dom.mobileNavDrawer) {
      dom.mobileNavDrawer.classList.remove('active');
      dom.mobileNavDrawer.setAttribute('aria-hidden', 'true');
    }
    if (dom.mobileNavBackdrop) {
      dom.mobileNavBackdrop.classList.remove('active');
    }
    if (dom.menuToggleBtn) {
      dom.menuToggleBtn.setAttribute('aria-expanded', 'false');
    }
    document.documentElement.classList.remove('drawer-locked');
    document.body.classList.remove('drawer-locked');
    document.body.style.overflow = '';
  }

  function toggleDrawer() {
    if (dom.mobileNavDrawer && dom.mobileNavDrawer.classList.contains('active')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  // Prescription / Card File Processing
  function handlePrescriptionFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('برائے مہربانی صرف تصویر (JPG یا PNG) اپلوڈ کریں۔');
      return;
    }

    state.prescriptionFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      state.prescriptionImage = e.target.result;
      const sizeStr = `${file.name} (${Math.round(file.size / 1024)} KB)`;

      // Page Elements
      if (dom.prescriptionPreviewImg) dom.prescriptionPreviewImg.src = e.target.result;
      if (dom.previewFilename) dom.previewFilename.textContent = sizeStr;
      if (dom.uploadPlaceholder) dom.uploadPlaceholder.style.display = 'none';
      if (dom.uploadPreview) dom.uploadPreview.style.display = 'flex';
      if (dom.prescriptionCardBox) dom.prescriptionCardBox.classList.add('has-file');

      // Modal Elements
      if (dom.modalPreviewImg) dom.modalPreviewImg.src = e.target.result;
      if (dom.modalPreviewFilename) dom.modalPreviewFilename.textContent = sizeStr;
      if (dom.modalUploadPlaceholder) dom.modalUploadPlaceholder.style.display = 'none';
      if (dom.modalUploadPreview) dom.modalUploadPreview.style.display = 'flex';

      updateCartUI();
    };
    reader.readAsDataURL(file);
  }

  function clearPrescriptionFile() {
    state.prescriptionImage = null;
    state.prescriptionFile = null;

    // Page Elements
    if (dom.prescriptionInput) dom.prescriptionInput.value = '';
    if (dom.prescriptionPreviewImg) dom.prescriptionPreviewImg.src = '';
    if (dom.uploadPlaceholder) dom.uploadPlaceholder.style.display = 'flex';
    if (dom.uploadPreview) dom.uploadPreview.style.display = 'none';
    if (dom.prescriptionCardBox) dom.prescriptionCardBox.classList.remove('has-file');

    // Modal Elements
    if (dom.modalPrescriptionInput) dom.modalPrescriptionInput.value = '';
    if (dom.modalPreviewImg) dom.modalPreviewImg.src = '';
    if (dom.modalUploadPlaceholder) dom.modalUploadPlaceholder.style.display = 'flex';
    if (dom.modalUploadPreview) dom.modalUploadPreview.style.display = 'none';

    updateCartUI();
  }

  function showCardReminderModal(waUrl) {
    if (!dom.cardReminderModal) return;
    if (dom.modalCardPreviewImg && state.prescriptionImage) {
      dom.modalCardPreviewImg.src = state.prescriptionImage;
    }
    if (dom.modalWhatsappAgainBtn) {
      dom.modalWhatsappAgainBtn.href = waUrl;
    }
    dom.cardReminderModal.style.display = 'flex';
  }

  // Dedicated Order / Cart Modal Controls
  function openOrderModal() {
    if (dom.orderModalOverlay) {
      dom.orderModalOverlay.style.display = 'flex';
      void dom.orderModalOverlay.offsetWidth;
      dom.orderModalOverlay.classList.add('active');
      document.documentElement.classList.add('order-modal-open');
      document.body.classList.add('order-modal-open');

      // Sync inputs from page to modal if user already typed on page
      const pageName = document.getElementById('order-name');
      const modalName = document.getElementById('modal-order-name');
      if (pageName && modalName && pageName.value && !modalName.value) {
        modalName.value = pageName.value;
      }
      const pagePhone = document.getElementById('order-phone');
      const modalPhone = document.getElementById('modal-order-phone');
      if (pagePhone && modalPhone && pagePhone.value && !modalPhone.value) {
        modalPhone.value = pagePhone.value;
      }
      const pageAddr = document.getElementById('order-address');
      const modalAddr = document.getElementById('modal-order-address');
      if (pageAddr && modalAddr && pageAddr.value && !modalAddr.value) {
        modalAddr.value = pageAddr.value;
      }
      const pageNote = document.getElementById('order-note');
      const modalNote = document.getElementById('modal-order-note');
      if (pageNote && modalNote && pageNote.value && !modalNote.value) {
        modalNote.value = pageNote.value;
      }

      updateCartUI();
    }
  }

  function closeOrderModal() {
    if (dom.orderModalOverlay) {
      dom.orderModalOverlay.classList.remove('active');
      document.documentElement.classList.remove('order-modal-open');
      document.body.classList.remove('order-modal-open');
      setTimeout(() => {
        if (!dom.orderModalOverlay.classList.contains('active')) {
          dom.orderModalOverlay.style.display = 'none';
        }
      }, 280);
    }
  }

  // Render Cart Item Cards Helper (used for both on-page cart and modal cart)
  function renderCartCardsTo(container, totalBarEl, isModal) {
    if (!container) return;
    container.innerHTML = '';

    const totalCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const hasUnpriced = state.cart.some(item => !item.price || item.price === 0);

    if (state.cart.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:1.75rem 1rem; color:var(--muted);">
          <div style="font-size:2.8rem; margin-bottom:0.4rem;">🛒</div>
          <p style="font-size:1.08rem; font-weight:700; color:var(--heading); margin-bottom:0.35rem;">آپ کے آرڈر میں ابھی کوئی فریم یا چشمہ شامل نہیں ہے۔</p>
          <p style="font-size:0.92rem; margin-bottom:0.85rem;">کیٹلاگ سے فریم اور لینز منتخب کریں یا صرف اپنا نسخہ / کارڈ اپلوڈ کر کے بھی آرڈر بھیج سکتے ہیں!</p>
          <button type="button" class="btn btn-outline" data-action="cart-browse">👓 مصنوعات دیکھیں</button>
        </div>
      `;
      const browseBtn = container.querySelector('[data-action="cart-browse"]');
      if (browseBtn) {
        browseBtn.addEventListener('click', () => {
          if (isModal) closeOrderModal();
          const browseSec = document.getElementById('browse-section');
          if (browseSec) browseSec.scrollIntoView({ behavior: 'smooth' });
        });
      }
      if (totalBarEl) totalBarEl.style.display = 'none';
      return;
    }

    if (totalBarEl) totalBarEl.style.display = 'flex';

    state.cart.forEach(item => {
      const card = document.createElement('div');
      card.className = 'cart-item-card';

      const specTags = [];
      if (item.specs?.color) specTags.push(`<span class="cart-item-spec-pill">رنگ: ${escapeHtml(item.specs.color)}</span>`);
      if (item.specs?.size) specTags.push(`<span class="cart-item-spec-pill">سائز: ${escapeHtml(item.specs.size)}</span>`);
      if (item.specs?.coating) specTags.push(`<span class="cart-item-spec-pill">کوٹنگ: ${escapeHtml(item.specs.coating)}</span>`);

      card.innerHTML = `
        <div class="cart-item-header">
          <div class="cart-item-title-col">
            <h4 class="cart-item-name">${escapeHtml(item.name)}</h4>
            <div class="cart-item-tags">
              <span class="cart-item-code-tag">کوڈ: <bdi class="num" dir="ltr">${escapeHtml(item.code)}</bdi></span>
              ${specTags.join('')}
            </div>
          </div>
          <button type="button" class="cart-item-remove-btn" data-action="cart-remove" data-id="${item.id}" aria-label="${escapeHtml(item.name)} حذف کریں" title="آرڈر سے ہٹائیں">
            🗑️
          </button>
        </div>
        <div class="cart-item-bottom">
          <div class="qty-stepper" style="height:36px;">
            <button type="button" class="stepper-btn" style="width:30px; height:30px; font-size:1.15rem;" data-action="cart-dec" data-id="${item.id}">−</button>
            <span class="stepper-num num" style="min-width:28px; font-size:1rem;">${item.qty}</span>
            <button type="button" class="stepper-btn" style="width:30px; height:30px; font-size:1.15rem;" data-action="cart-inc" data-id="${item.id}">+</button>
          </div>
          <div class="cart-item-price-col">
            ${item.price > 0 ? `
              <span class="cart-item-rate-text"><bdi class="num">${item.qty}</bdi> × <bdi class="num">Rs ${item.price.toLocaleString('en-US')}</bdi></span>
              <span class="cart-item-total-text num" dir="ltr">Rs ${(item.price * item.qty).toLocaleString('en-US')}</span>
            ` : `
              <span class="cart-item-total-text" style="font-size:0.95rem;">قیمت رابطہ پر طے ہوگی</span>
            `}
          </div>
        </div>
      `;

      card.querySelector('[data-action="cart-dec"]').addEventListener('click', () => updateCartQty(item.id, -1));
      card.querySelector('[data-action="cart-inc"]').addEventListener('click', () => updateCartQty(item.id, 1));
      card.querySelector('[data-action="cart-remove"]').addEventListener('click', () => removeFromCart(item.id));

      container.appendChild(card);
    });

    if (totalBarEl) {
      totalBarEl.innerHTML = `
        <div class="cart-total-row">
          <span>کل رقم (Total Amount):</span>
          <span class="num" dir="ltr">Rs ${totalPrice.toLocaleString('en-US')}</span>
        </div>
        ${hasUnpriced ? `<div style="font-size:0.85rem; color:var(--muted); margin-top:3px;">* بغیر قیمت والے آئٹمز کی قیمت واٹس ایپ پر طے ہوگی۔</div>` : ''}
      `;
    }
  }

  // Update Cart UI everywhere
  function updateCartUI() {
    const totalCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const hasUnpriced = state.cart.some(item => !item.price || item.price === 0);

    // Update Header Badge
    if (dom.cartCountBadge) {
      dom.cartCountBadge.textContent = totalCount;
      dom.cartCountBadge.style.display = totalCount > 0 ? 'flex' : 'none';
    }

    // Update Sticky Bottom Cart Bar
    if (dom.stickyCartBar) {
      if (totalCount > 0) {
        dom.stickyCartBar.classList.add('active');
        document.body.classList.add('cart-active');
        dom.cartBarCount.innerHTML = `آپ کے آرڈر میں: <span class="num">${totalCount}</span> چشمے/آئٹمز`;
        dom.cartBarTotal.innerHTML = hasUnpriced 
          ? `کل: Rs <span class="num">${totalPrice.toLocaleString('en-US')}</span>`
          : `کل رقم: Rs <span class="num">${totalPrice.toLocaleString('en-US')}</span>`;
      } else {
        dom.stickyCartBar.classList.remove('active');
        document.body.classList.remove('cart-active');
      }
    }

    // Update Mobile Drawer Cart Count
    if (dom.drawerCartCount) {
      dom.drawerCartCount.textContent = totalCount;
    }

    // Update Modal Cart Count Badge
    if (dom.modalCartItemCount) {
      dom.modalCartItemCount.textContent = `${totalCount} آئٹمز منتخب`;
    }

    const hasCard = state.prescriptionImage !== null;
    const canSubmit = totalCount > 0 || hasCard;

    // Update Submit buttons in both forms
    const submitBtns = [
      dom.orderForm ? dom.orderForm.querySelector('button[type="submit"]') : null,
      dom.modalOrderForm ? dom.modalOrderForm.querySelector('button[type="submit"]') : null
    ];

    submitBtns.forEach(btn => {
      if (!btn) return;
      if (canSubmit) {
        btn.disabled = false;
        btn.classList.remove('btn-order-disabled');
        btn.classList.add('btn-order-active');
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        if (totalCount > 0 && hasCard) {
          btn.innerHTML = '<span>✅</span> <span>فریم، لینز اور کارڈ واٹس ایپ پر بھیجیں</span>';
        } else if (hasCard) {
          btn.innerHTML = '<span>✅</span> <span>آنکھوں کا کارڈ واٹس ایپ پر بھیجیں</span>';
        } else {
          btn.innerHTML = '<span>✅</span> <span>واٹس ایپ پر آرڈر بھیجیں</span>';
        }
      } else {
        btn.disabled = true;
        btn.classList.remove('btn-order-active');
        btn.classList.add('btn-order-disabled');
        btn.style.opacity = '1';
        btn.style.cursor = 'not-allowed';
        btn.innerHTML = '<span>🛒</span> <span>پہلے پروڈکٹ منتخب کریں یا کارڈ اپلوڈ کریں</span>';
      }
    });

    // Render Cart Items into both page and modal
    renderCartCardsTo(dom.cartItemsList, dom.cartTotalPrice, false);
    renderCartCardsTo(dom.modalCartItemsList, dom.modalCartTotalBar, true);
  }

  // Ask about Single Product on WhatsApp
  function askProductOnWhatsApp(product) {
    const code = product.code || product.specs?.code || 'N/A';
    const color = product.specs?.color || 'معیاری';
    const size = product.specs?.size || product.specs?.shape || '';
    
    let msg = `السلام علیکم طارق آپٹیکل سنٹر!\nمیں اس پروڈکٹ کے بارے میں معلوم کرنا چاہتا ہوں:\n\n`;
    msg += `• پروڈکٹ: ${product.name}\n`;
    msg += `• کوڈ: ${code}\n`;
    if (color) msg += `• رنگ: ${color}\n`;
    if (size) msg += `• تفصیل: ${size}\n`;
    if (product.price > 0) {
      msg += `• دکھائی گئی قیمت: Rs ${product.price}\n`;
    } else {
      msg += `• قیمت: برائے مہربانی قیمت اور دستیابی سے آگاہ فرمائیں۔\n`;
    }
    msg += `\nشکریہ!`;

    const url = `https://wa.me/${SHOP_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }

  // Order Submission & WhatsApp Pre-filled URL Generation
  function handleOrderSubmit(e) {
    e.preventDefault();

    if (state.cart.length === 0 && !state.prescriptionImage) {
      alert('برائے مہربانی پہلے کوئی چشمہ یا فریم منتخب کریں یا اپنے آنکھوں کا کارڈ اپلوڈ فرمائیں!');
      return;
    }

    const nameInput = document.getElementById('order-name');
    const phoneInput = document.getElementById('order-phone');
    const addressInput = document.getElementById('order-address');
    const noteInput = document.getElementById('order-note');

    const nameErr = document.getElementById('err-order-name');
    const phoneErr = document.getElementById('err-order-phone');
    const addressErr = document.getElementById('err-order-address');

    let isValid = true;

    // Validate Name
    if (!nameInput.value.trim()) {
      nameErr.classList.add('active');
      nameInput.focus();
      isValid = false;
    } else {
      nameErr.classList.remove('active');
    }

    // Validate Pakistani Phone
    if (!isValidPakistaniPhone(phoneInput.value)) {
      phoneErr.classList.add('active');
      if (isValid) phoneInput.focus();
      isValid = false;
    } else {
      phoneErr.classList.remove('active');
    }

    // Validate Address
    if (!addressInput.value.trim()) {
      addressErr.classList.add('active');
      if (isValid) addressInput.focus();
      isValid = false;
    } else {
      addressErr.classList.remove('active');
    }

    if (!isValid) return;

    // Build the formatted WhatsApp order message
    // Layout Requirement:
    // السلام علیکم! میں طارق آپٹیکل سنٹر سے آرڈر کرنا چاہتا ہوں۔
    // 1. فریم – کوڈ F-101
    //    رنگ: کالا | سائز: 52-18-140
    //    تعداد: 2 × Rs 1500 = Rs 3000
    // ...
    // کل رقم: Rs <total>
    // نام: ... / فون: ... / پتہ: ... / نوٹ: ...

    let msg = `السلام علیکم! میں طارق آپٹیکل سنٹر سے آرڈر کرنا چاہتا ہوں۔\n\n`;

    let totalNumeric = 0;
    let hasUnpriced = false;

    if (state.cart.length > 0) {
      state.cart.forEach((item, index) => {
        const lineNum = index + 1;
        const code = item.code || 'N/A';
        const color = item.specs?.color || 'عام';
        const size = item.specs?.size || item.specs?.shape || item.specs?.coating || '';
        const linePrice = item.price > 0 ? (item.price * item.qty) : 0;
        if (item.price > 0) {
          totalNumeric += linePrice;
        } else {
          hasUnpriced = true;
        }

        msg += `${lineNum}. ${item.name} – کوڈ ${code}\n`;
        msg += `   رنگ: ${color}${size ? ` | تفصیل: ${size}` : ''}\n`;
        if (item.price > 0) {
          msg += `   تعداد: ${item.qty} × Rs ${item.price} = Rs ${linePrice}\n\n`;
        } else {
          msg += `   تعداد: ${item.qty} (قیمت رابطہ پر طے ہوگی)\n\n`;
        }
      });

      msg += `------------------------------\n`;
      if (totalNumeric > 0) {
        msg += `کل رقم: Rs ${totalNumeric}${hasUnpriced ? ' (+ بغیر قیمت والے آئٹمز کی قیمت رابطہ پر)' : ''}\n`;
      } else {
        msg += `کل رقم: رابطہ پر طے ہوگی\n`;
      }
    } else {
      msg += `(گاہک نے فریم و لینز کے انتخاب اور مشورے کے لیے نسخہ / کارڈ منسلک کیا ہے)\n`;
    }

    if (state.prescriptionImage) {
      msg += `------------------------------\n`;
      msg += `📋 آنکھوں کا کارڈ / نسخہ: منسلک تصویر ساتھ بھیجی جا رہی ہے\n`;
      msg += `------------------------------\n`;
    }

    msg += `نام: ${nameInput.value.trim()}\n`;
    msg += `فون: ${phoneInput.value.trim()}\n`;
    msg += `پتہ: ${addressInput.value.trim()}\n`;
    if (noteInput && noteInput.value.trim()) {
      msg += `نوٹ: ${noteInput.value.trim()}\n`;
    }

    // Open WhatsApp
    const waUrl = `https://wa.me/${SHOP_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;

    if (state.prescriptionFile && navigator.canShare && navigator.canShare({ files: [state.prescriptionFile] })) {
      navigator.share({
        files: [state.prescriptionFile],
        title: 'طارق آپٹیکل سنٹر آرڈر',
        text: msg
      }).then(() => {
        if (dom.orderSuccessCard) {
          dom.orderSuccessCard.style.display = 'block';
          dom.orderSuccessCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        if (dom.orderForm) dom.orderForm.style.display = 'none';
      }).catch(err => {
        window.open(waUrl, '_blank');
        showCardReminderModal(waUrl);
      });
    } else {
      window.open(waUrl, '_blank');
      if (state.prescriptionImage) {
        showCardReminderModal(waUrl);
      }
      if (dom.orderSuccessCard) {
        dom.orderSuccessCard.style.display = 'block';
        dom.orderSuccessCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      if (dom.orderForm) dom.orderForm.style.display = 'none';
    }
  }

  // Modal Order Submission Handler
  function handleModalOrderSubmit(e) {
    e.preventDefault();

    if (state.cart.length === 0 && !state.prescriptionImage) {
      alert('برائے مہربانی پہلے کوئی چشمہ یا فریم منتخب کریں یا اپنے آنکھوں کا کارڈ اپلوڈ فرمائیں!');
      return;
    }

    const nameInput = document.getElementById('modal-order-name');
    const phoneInput = document.getElementById('modal-order-phone');
    const addressInput = document.getElementById('modal-order-address');
    const noteInput = document.getElementById('modal-order-note');

    const nameErr = document.getElementById('err-modal-name');
    const phoneErr = document.getElementById('err-modal-phone');
    const addressErr = document.getElementById('err-modal-address');

    let isValid = true;

    if (!nameInput.value.trim()) {
      if (nameErr) nameErr.classList.add('active');
      nameInput.focus();
      isValid = false;
    } else if (nameErr) {
      nameErr.classList.remove('active');
    }

    if (!isValidPakistaniPhone(phoneInput.value)) {
      if (phoneErr) phoneErr.classList.add('active');
      if (isValid) phoneInput.focus();
      isValid = false;
    } else if (phoneErr) {
      phoneErr.classList.remove('active');
    }

    if (!addressInput.value.trim()) {
      if (addressErr) addressErr.classList.add('active');
      if (isValid) addressInput.focus();
      isValid = false;
    } else if (addressErr) {
      addressErr.classList.remove('active');
    }

    if (!isValid) return;

    let msg = `السلام علیکم! میں طارق آپٹیکل سنٹر سے آرڈر کرنا چاہتا ہوں۔\n\n`;

    let totalNumeric = 0;
    let hasUnpriced = false;

    if (state.cart.length > 0) {
      state.cart.forEach((item, index) => {
        const lineNum = index + 1;
        const code = item.code || 'N/A';
        const color = item.specs?.color || 'عام';
        const size = item.specs?.size || item.specs?.shape || item.specs?.coating || '';
        const linePrice = item.price > 0 ? (item.price * item.qty) : 0;
        if (item.price > 0) {
          totalNumeric += linePrice;
        } else {
          hasUnpriced = true;
        }

        msg += `${lineNum}. ${item.name} – کوڈ ${code}\n`;
        msg += `   رنگ: ${color}${size ? ` | تفصیل: ${size}` : ''}\n`;
        if (item.price > 0) {
          msg += `   تعداد: ${item.qty} × Rs ${item.price} = Rs ${linePrice}\n\n`;
        } else {
          msg += `   تعداد: ${item.qty} (قیمت رابطہ پر طے ہوگی)\n\n`;
        }
      });

      msg += `------------------------------\n`;
      if (totalNumeric > 0) {
        msg += `کل رقم: Rs ${totalNumeric}${hasUnpriced ? ' (+ بغیر قیمت والے آئٹمز کی قیمت رابطہ پر)' : ''}\n`;
      } else {
        msg += `کل رقم: رابطہ پر طے ہوگی\n`;
      }
    } else {
      msg += `(گاہک نے فریم و لینز کے انتخاب اور مشورے کے لیے نسخہ / کارڈ منسلک کیا ہے)\n`;
    }

    if (state.prescriptionImage) {
      msg += `------------------------------\n`;
      msg += `📋 آنکھوں کا کارڈ / نسخہ: منسلک تصویر ساتھ بھیجی جا رہی ہے\n`;
      msg += `------------------------------\n`;
    }

    msg += `نام: ${nameInput.value.trim()}\n`;
    msg += `فون: ${phoneInput.value.trim()}\n`;
    msg += `پتہ: ${addressInput.value.trim()}\n`;
    if (noteInput && noteInput.value.trim()) {
      msg += `نوٹ: ${noteInput.value.trim()}\n`;
    }

    const waUrl = `https://wa.me/${SHOP_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;

    if (state.prescriptionFile && navigator.canShare && navigator.canShare({ files: [state.prescriptionFile] })) {
      navigator.share({
        files: [state.prescriptionFile],
        title: 'طارق آپٹیکل سنٹر آرڈر',
        text: msg
      }).then(() => {
        if (dom.modalOrderSuccess) dom.modalOrderSuccess.style.display = 'block';
        if (dom.modalOrderForm) dom.modalOrderForm.style.display = 'none';
      }).catch(err => {
        window.open(waUrl, '_blank');
        if (dom.modalOrderSuccess) dom.modalOrderSuccess.style.display = 'block';
        if (dom.modalOrderForm) dom.modalOrderForm.style.display = 'none';
        showCardReminderModal(waUrl);
      });
    } else {
      window.open(waUrl, '_blank');
      if (state.prescriptionImage) {
        showCardReminderModal(waUrl);
      }
      if (dom.modalOrderSuccess) dom.modalOrderSuccess.style.display = 'block';
      if (dom.modalOrderForm) dom.modalOrderForm.style.display = 'none';
    }
  }

  // Lightbox Detail View
  function openLightbox(index) {
    if (index < 0 || index >= state.filteredProducts.length) return;
    state.lightbox.currentIndex = index;
    state.lightbox.isOpen = true;
    state.lightbox.lastFocusedElement = document.activeElement;

    renderLightboxContent(index);

    if (dom.lightboxOverlay) {
      dom.lightboxOverlay.style.display = 'flex';
      setTimeout(() => {
        dom.lightboxOverlay.classList.add('active');
        dom.lightboxCloseBtn?.focus();
      }, 10);
    }
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    state.lightbox.isOpen = false;
    if (dom.lightboxOverlay) {
      dom.lightboxOverlay.classList.remove('active');
      setTimeout(() => {
        if (!state.lightbox.isOpen) {
          dom.lightboxOverlay.style.display = 'none';
        }
      }, 250);
    }
    document.body.style.overflow = '';
    if (state.lightbox.lastFocusedElement) {
      state.lightbox.lastFocusedElement.focus();
    }
  }

  function prevLightbox() {
    if (!state.lightbox.isOpen) return;
    let nextIndex = state.lightbox.currentIndex - 1;
    if (nextIndex < 0) nextIndex = state.filteredProducts.length - 1;
    openLightbox(nextIndex);
  }

  function nextLightbox() {
    if (!state.lightbox.isOpen) return;
    let nextIndex = state.lightbox.currentIndex + 1;
    if (nextIndex >= state.filteredProducts.length) nextIndex = 0;
    openLightbox(nextIndex);
  }

  function renderLightboxContent(index) {
    const product = state.filteredProducts[index];
    if (!product || !dom.lightboxBody) return;

    const isInStock = product.inStock !== false && product.specs?.stock !== 'ختم ہے';
    const cartItem = state.cart.find(item => item.id === product.id);
    const cartQty = cartItem ? cartItem.qty : 0;

    dom.lightboxBody.innerHTML = `
      <div class="lightbox-content-grid">
        <div class="lightbox-image-box">
          <img 
            src="${escapeHtml(product.img)}" 
            alt="${escapeHtml(product.name)}" 
            onerror="this.onerror=null; this.src='images/placeholder-glasses.svg';"
          />
        </div>
        <div class="lightbox-details-box">
          <h2 style="font-size:1.6rem; margin-bottom:0.4rem; color:var(--heading);">${escapeHtml(product.name)}</h2>
          <div style="margin-bottom:0.75rem;">
            <span class="product-code-tag"><bdi>کوڈ:</bdi> <bdi class="num" dir="ltr">${escapeHtml(product.code || product.specs?.code || 'N/A')}</bdi></span>
          </div>

          ${renderSpecsTable(product)}

          <div style="margin: 0.85rem 0;">
            <span class="availability-badge ${isInStock ? 'badge-in-stock' : 'badge-out-of-stock'}">
              ${isInStock ? '● موجود ہے' : '✕ ختم ہے'}
            </span>
          </div>

          <div class="price-box">
            ${product.price > 0 ? `
              <div class="price-main"><span class="price-currency">روپے</span> <span class="num" dir="ltr">${Number(product.price).toLocaleString('en-US')}</span></div>
              <span class="price-tag-sub">معیاری ریٹ</span>
            ` : `
              <div class="price-main price-ask">💬 قیمت واٹس ایپ پر پوچھیں</div>
            `}
          </div>

          <div class="card-actions" style="margin-top:1.25rem;">
            ${renderCardActionButton(product, cartQty, isInStock)}
            <button type="button" class="btn btn-wa" id="lb-ask-wa" style="width:100%;">
              💬 واٹس ایپ پر اس پروڈکٹ کا پوچھیں
            </button>
          </div>
        </div>
      </div>
    `;

    bindCardCartEvents(dom.lightboxBody, product, isInStock);
    const lbWaBtn = dom.lightboxBody.querySelector('#lb-ask-wa');
    if (lbWaBtn) {
      lbWaBtn.addEventListener('click', () => askProductOnWhatsApp(product));
    }
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Theme Toggle
    if (dom.themeToggle) {
      dom.themeToggle.addEventListener('click', toggleTheme);
    }

    // Search Input
    if (dom.searchInput) {
      dom.searchInput.addEventListener('input', (e) => {
        state.filters.search = e.target.value;
        state.visibleCount = 12;
        applyFilters();
      });
    }

    // Secondary Specs Filters
    if (dom.filterGender) {
      dom.filterGender.addEventListener('change', (e) => {
        state.filters.gender = e.target.value;
        applyFilters();
      });
    }
    if (dom.filterColor) {
      dom.filterColor.addEventListener('change', (e) => {
        state.filters.color = e.target.value;
        applyFilters();
      });
    }
    if (dom.filterMaterial) {
      dom.filterMaterial.addEventListener('change', (e) => {
        state.filters.material = e.target.value;
        applyFilters();
      });
    }
    if (dom.filterInStock) {
      dom.filterInStock.addEventListener('change', (e) => {
        state.filters.inStockOnly = e.target.checked;
        applyFilters();
      });
    }
    if (dom.sortSelect) {
      dom.sortSelect.addEventListener('change', (e) => {
        state.filters.sort = e.target.value;
        applyFilters();
      });
    }

    // Clear All Filters
    if (dom.clearFiltersBtn) {
      dom.clearFiltersBtn.addEventListener('click', () => {
        state.filters = {
          category: 'all',
          subcat: 'all',
          search: '',
          gender: 'all',
          color: 'all',
          material: 'all',
          inStockOnly: false,
          sort: 'newest'
        };
        if (dom.searchInput) dom.searchInput.value = '';
        if (dom.filterGender) dom.filterGender.value = 'all';
        if (dom.filterColor) dom.filterColor.value = 'all';
        if (dom.filterMaterial) dom.filterMaterial.value = 'all';
        if (dom.filterInStock) dom.filterInStock.checked = false;
        if (dom.sortSelect) dom.sortSelect.value = 'newest';
        renderCategoryTabs();
        renderSubcatChips();
        applyFilters();
      });
    }

    // Load More Button
    if (dom.loadMoreBtn) {
      dom.loadMoreBtn.addEventListener('click', () => {
        state.visibleCount += 12;
        renderProducts();
      });
    }

    // Order Form Submission
    if (dom.orderForm) {
      dom.orderForm.addEventListener('submit', handleOrderSubmit);
    }

    // Reset Order / Clear Cart after success
    if (dom.orderResetBtn) {
      dom.orderResetBtn.addEventListener('click', () => {
        clearCart();
        if (dom.orderSuccessCard) dom.orderSuccessCard.style.display = 'none';
        if (dom.orderForm) {
          dom.orderForm.style.display = 'block';
          dom.orderForm.reset();
        }
      });
    }

    // Lightbox Controls
    if (dom.lightboxCloseBtn) {
      dom.lightboxCloseBtn.addEventListener('click', closeLightbox);
    }
    if (dom.lightboxPrevBtn) {
      dom.lightboxPrevBtn.addEventListener('click', prevLightbox);
    }
    if (dom.lightboxNextBtn) {
      dom.lightboxNextBtn.addEventListener('click', nextLightbox);
    }
    if (dom.lightboxOverlay) {
      dom.lightboxOverlay.addEventListener('click', (e) => {
        if (e.target === dom.lightboxOverlay) closeLightbox();
      });
    }

    // Mobile Drawer Toggle
    if (dom.menuToggleBtn) {
      dom.menuToggleBtn.addEventListener('click', toggleDrawer);
    }
    if (dom.drawerCloseBtn) {
      dom.drawerCloseBtn.addEventListener('click', closeDrawer);
    }
    if (dom.mobileNavBackdrop) {
      dom.mobileNavBackdrop.addEventListener('click', closeDrawer);
      dom.mobileNavBackdrop.addEventListener('touchmove', (e) => {
        e.preventDefault();
      }, { passive: false });
    }
    if (dom.mobileNavDrawer) {
      dom.mobileNavDrawer.addEventListener('touchmove', (e) => {
        e.stopPropagation();
      }, { passive: true });
    }

    // Dedicated Order / Cart Modal Event Handlers
    if (dom.orderModalCloseBtn) {
      dom.orderModalCloseBtn.addEventListener('click', closeOrderModal);
    }
    if (dom.modalOrderDoneBtn) {
      dom.modalOrderDoneBtn.addEventListener('click', closeOrderModal);
    }
    if (dom.orderModalOverlay) {
      dom.orderModalOverlay.addEventListener('click', (e) => {
        if (e.target === dom.orderModalOverlay) closeOrderModal();
      });
    }
    if (dom.modalPrescriptionInput) {
      dom.modalPrescriptionInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) handlePrescriptionFile(file);
      });
    }
    if (dom.modalUploadPlaceholder) {
      dom.modalUploadPlaceholder.addEventListener('click', () => {
        if (dom.modalPrescriptionInput) dom.modalPrescriptionInput.click();
      });
    }
    if (dom.modalRemovePrescBtn) {
      dom.modalRemovePrescBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearPrescriptionFile();
      });
    }
    if (dom.modalOrderForm) {
      dom.modalOrderForm.addEventListener('submit', handleModalOrderSubmit);
    }

    // Drawer, Desktop Nav and Internal Anchor Smooth Scrolling
    document.querySelectorAll('.drawer-link, .nav-link, a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        const targetId = href.slice(1);
        if (!targetId) return;

        // Open dedicated order window if clicking on order / cart buttons
        if (targetId === 'order-section' || link.classList.contains('cart-icon-btn') || link.classList.contains('drawer-link-highlight')) {
          e.preventDefault();
          closeDrawer();
          openOrderModal();
          return;
        }

        const cat = link.getAttribute('data-cat');
        if (cat) {
          setCategory(cat);
        }

        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (history.pushState) {
            history.pushState(null, null, `#${targetId}`);
          }
        }
        closeDrawer();
      });
    });

    // Prescription Card Upload Handlers
    if (dom.prescriptionInput) {
      dom.prescriptionInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) handlePrescriptionFile(file);
      });
    }
    if (dom.prescriptionChangeBtn) {
      dom.prescriptionChangeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dom.prescriptionInput) dom.prescriptionInput.click();
      });
    }
    if (dom.prescriptionRemoveBtn) {
      dom.prescriptionRemoveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearPrescriptionFile();
      });
    }
    if (dom.modalReminderCloseBtn) {
      dom.modalReminderCloseBtn.addEventListener('click', () => {
        if (dom.cardReminderModal) dom.cardReminderModal.style.display = 'none';
      });
    }

    // Keyboard navigation for Lightbox, Order Modal & Drawer
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (state.lightbox.isOpen) closeLightbox();
        closeDrawer();
        closeOrderModal();
        if (dom.cardReminderModal) dom.cardReminderModal.style.display = 'none';
      }
      if (state.lightbox.isOpen) {
        if (e.key === 'ArrowRight') prevLightbox();
        if (e.key === 'ArrowLeft') nextLightbox();
      }
    });

    // Category Tile Clicks (Scroll & Select)
    document.querySelectorAll('[data-cat-target]').forEach(tile => {
      tile.addEventListener('click', (e) => {
        e.preventDefault();
        const catId = tile.getAttribute('data-cat-target');
        setCategory(catId);
        const target = document.getElementById('browse-section');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Open Dedicated Order Window for Cart Bar
    if (dom.cartBarBtn) {
      dom.cartBarBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openOrderModal();
      });
    }

    // Back to top
    const backToTopBtn = document.getElementById('back-to-top-btn');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // HTML sanitization helper
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Expose helpers for testing and external integrations
  window.__tariqApp = {
    openDrawer,
    closeDrawer,
    toggleDrawer,
    handlePrescriptionFile,
    clearPrescriptionFile,
    state
  };

  // Self Initializer on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
