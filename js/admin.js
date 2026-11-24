/**
 * طارق آپٹیکل سنٹر (Tariq Optical Centre) - ایڈمن پورٹل لاجک
 * Supabase CRUD Operations, Stock Toggle, Pricing Update, Storage & Auth
 */

(function () {
  'use strict';

  // Hardcoded Supabase Configuration
  const TOC_SUPABASE_URL = "https://iwtpzgkxdrjgoalpvcyu.supabase.co";
  const TOC_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dHB6Z2t4ZHJqZ29hbHB2Y3l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1MDU0NTcsImV4cCI6MjExMTA4MTQ1N30.B7KwtbDuY97oOR-Qt-pPRJ9wFKie4i9y-54bX7A0XvE";

  // State Management
  let supabaseClient = null;
  let currentUser = null;
  let allProducts = [];
  let filteredProducts = [];
  let currentCategory = 'all';
  let productToDelete = null;

  // DOM Elements
  const loginSection = document.getElementById('loginSection');
  const dashboardSection = document.getElementById('dashboardSection');

  const connectionDot = document.getElementById('connectionDot');
  const connectionText = document.getElementById('connectionText');
  const userBadge = document.getElementById('userBadge');
  const userEmailText = document.getElementById('userEmailText');
  const btnLogout = document.getElementById('btnLogout');

  const loginForm = document.getElementById('loginForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const loginAlert = document.getElementById('loginAlert');
  const btnLoginSubmit = document.getElementById('btnLoginSubmit');

  // Dashboard Stats
  const statTotal = document.getElementById('statTotal');
  const statInStock = document.getElementById('statInStock');
  const statOutOfStock = document.getElementById('statOutOfStock');
  const statFrames = document.getElementById('statFrames');
  const statSun = document.getElementById('statSun');
  const statContact = document.getElementById('statContact');
  const statLens = document.getElementById('statLens');

  // Pill Badges
  const pillBadgeAll = document.getElementById('pillBadgeAll');
  const pillBadgeFrame = document.getElementById('pillBadgeFrame');
  const pillBadgeSun = document.getElementById('pillBadgeSun');
  const pillBadgeContact = document.getElementById('pillBadgeContact');
  const pillBadgeLens = document.getElementById('pillBadgeLens');

  // Controls & Table
  const searchInput = document.getElementById('searchInput');
  const stockFilter = document.getElementById('stockFilter');
  const sortFilter = document.getElementById('sortFilter');
  const productsTableBody = document.getElementById('productsTableBody');
  const emptyState = document.getElementById('emptyState');
  const btnRefresh = document.getElementById('btnRefresh');
  const btnOpenAddModal = document.getElementById('btnOpenAddModal');

  // Product Modal
  const productModal = document.getElementById('productModal');
  const productForm = document.getElementById('productForm');
  const modalTitle = document.getElementById('modalTitle');
  const prodFormId = document.getElementById('prodFormId');
  const prodCat = document.getElementById('prodCat');
  const prodType = document.getElementById('prodType');
  const prodTypeCustom = document.getElementById('prodTypeCustom');
  const prodCode = document.getElementById('prodCode');
  const prodPrice = document.getElementById('prodPrice');
  const prodGender = document.getElementById('prodGender');
  const prodName = document.getElementById('prodName');
  const prodNameEn = document.getElementById('prodNameEn');
  const prodInStock = document.getElementById('prodInStock');
  const modalStockLabel = document.getElementById('modalStockLabel');
  const imageUploadWrapper = document.getElementById('imageUploadWrapper');
  const prodImageFile = document.getElementById('prodImageFile');
  const modalImagePreview = document.getElementById('modalImagePreview');
  const imagePlaceholder = document.getElementById('imagePlaceholder');
  const prodImageUrl = document.getElementById('prodImageUrl');
  const dynamicSpecsContainer = document.getElementById('dynamicSpecsContainer');
  const specsCategoryTitle = document.getElementById('specsCategoryTitle');

  // Delete Modal
  const deleteModal = document.getElementById('deleteModal');
  const deleteProdName = document.getElementById('deleteProdName');
  const btnConfirmDelete = document.getElementById('btnConfirmDelete');

  const toastContainer = document.getElementById('toastContainer');

  // ==================== INITIALIZATION ====================

  function init() {
    setupEventListeners();

    const storedUrl = TOC_SUPABASE_URL || localStorage.getItem('toc_supabase_url') || (window.SHOP_CONFIG && SHOP_CONFIG.supabase && SHOP_CONFIG.supabase.url);
    const storedKey = TOC_SUPABASE_KEY || localStorage.getItem('toc_supabase_key') || (window.SHOP_CONFIG && SHOP_CONFIG.supabase && SHOP_CONFIG.supabase.anonKey);

    initializeSupabase(storedUrl, storedKey);
  }

  function initializeSupabase(url, key) {
    try {
      if (!window.supabase) {
        showToast('Supabase SDK لوڈ نہیں ہو سکی۔ براہ کرم انٹرنیٹ کنکشن چیک کریں۔', 'error');
        return;
      }

      supabaseClient = window.supabase.createClient(url, key);
      updateConnectionStatus(true);
      checkAuthSession();
    } catch (err) {
      console.error('Supabase Init Error:', err);
      updateConnectionStatus(false);
      showLoginScreen();
    }
  }

  function updateConnectionStatus(isConnected) {
    if (isConnected) {
      connectionDot.className = 'status-dot';
      connectionText.textContent = 'منسلک ہے';
    } else {
      connectionDot.className = 'status-dot offline';
      connectionText.textContent = 'غیر منسلک';
    }
  }

  // ==================== AUTHENTICATION ====================

  async function checkAuthSession() {
    if (!supabaseClient) return;

    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession();

      if (session && session.user) {
        currentUser = session.user;
        showDashboard();
      } else {
        showLoginScreen();
      }

      // Listen for auth state changes
      supabaseClient.auth.onAuthStateChange((_event, session) => {
        if (session && session.user) {
          currentUser = session.user;
          showDashboard();
        } else {
          currentUser = null;
          showLoginScreen();
        }
      });
    } catch (err) {
      console.error('Auth Check Error:', err);
      showLoginScreen();
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    loginAlert.style.display = 'none';
    btnLoginSubmit.disabled = true;
    btnLoginSubmit.innerHTML = '<span>تصدیق ہو رہی ہے...</span>';

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      currentUser = data.user;
      showToast('کامیابی سے لاگ ان ہو گئے!', 'success');
      showDashboard();
    } catch (err) {
      console.error('Login Error:', err);
      loginAlert.textContent = err.message || 'لاگ ان نا کام رہا۔ براہ کرم ای میل اور پاس ورڈ درست درج کریں۔';
      loginAlert.style.display = 'block';
    } finally {
      btnLoginSubmit.disabled = false;
      btnLoginSubmit.innerHTML = '<span>لاگ ان کریں</span>';
    }
  }

  async function handleLogout() {
    if (!supabaseClient) return;
    try {
      await supabaseClient.auth.signOut();
      currentUser = null;
      showToast('لاگ آؤٹ مکمل ہو گیا۔', 'success');
      showLoginScreen();
    } catch (err) {
      console.error('Logout error:', err);
    }
  }

  // ==================== SCREEN NAVIGATION ====================

  function showLoginScreen() {
    if (loginSection) loginSection.style.display = 'flex';
    if (dashboardSection) dashboardSection.style.display = 'none';
    if (userBadge) userBadge.style.display = 'none';
    if (btnLogout) btnLogout.style.display = 'none';
  }

  function showDashboard() {
    if (loginSection) loginSection.style.display = 'none';
    if (dashboardSection) dashboardSection.style.display = 'block';

    if (currentUser) {
      userBadge.style.display = 'flex';
      userEmailText.textContent = currentUser.email || 'Admin';
      btnLogout.style.display = 'inline-flex';
    }

    loadProducts();
  }

  // ==================== PRODUCT DATA FETCHING ====================

  async function loadProducts() {
    if (!supabaseClient) return;

    renderTableLoading();

    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      allProducts = data || [];

      // Auto-heal any zero prices from products.json
      const zeroProducts = allProducts.filter(p => !p.price || parseFloat(p.price) === 0);
      if (zeroProducts.length > 0) {
        try {
          const res = await fetch('products.json?v=' + Date.now());
          if (res.ok) {
            const jsonProducts = await res.json();
            const priceMap = {};
            jsonProducts.forEach(jp => {
              if (jp.price && parseFloat(jp.price) > 0) {
                priceMap[jp.code] = parseFloat(jp.price);
              }
            });

            for (const zp of zeroProducts) {
              if (priceMap[zp.code]) {
                const newPrice = priceMap[zp.code];
                zp.price = newPrice;
                await supabaseClient.from('products').update({ price: newPrice }).eq('id', zp.id);
              }
            }
          }
        } catch (e) {
          console.warn('Auto-healing zero prices warning:', e);
        }
      }

      // Auto-sync any missing products from products.json into Supabase (e.g. CL-213, CL-214)
      if (currentUser) {
        try {
          const res = await fetch('products.json?v=' + Date.now());
          if (res.ok) {
            const jsonProducts = await res.json();
            const existingCodes = new Set(allProducts.map(p => p.code));
            const missing = jsonProducts.filter(jp => !existingCodes.has(jp.code));
            if (missing.length > 0) {
              for (const mp of missing) {
                const rec = {
                  code: mp.code,
                  cat: mp.cat,
                  type: mp.type || '',
                  name: mp.name || '',
                  name_en: mp.nameEn || '',
                  price: mp.price || 0,
                  gender: mp.gender || 'سب کے لیے',
                  img: mp.img || '',
                  stock: mp.stock || 'موجود ہے',
                  in_stock: mp.inStock !== false,
                  featured: mp.featured || false,
                  specs: mp.specs || {}
                };
                const { data: inserted, error: insErr } = await supabaseClient.from('products').insert([rec]).select();
                if (!insErr && inserted && inserted[0]) {
                  allProducts.push(inserted[0]);
                }
              }
            }
          }
        } catch (e) {
          console.warn('Auto-sync missing products warning:', e);
        }
      }

      updateMetrics();
      applyFilters();
    } catch (err) {
      console.error('Fetch products error:', err);
      showToast('پروڈکٹس لوڈ کرنے میں مسئلہ ہوا: ' + err.message, 'error');
      productsTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2rem; color: var(--rose);">
            ڈیٹا لوڈ کرنے میں خرابی۔ براہ کرم چیک کریں کہ کیا آپ نے Supabase میں <code>supabase_schema.sql</code> رن کر دیا ہے؟
          </td>
        </tr>
      `;
    }
  }

  function updateMetrics() {
    const total = allProducts.length;
    const inStockCount = allProducts.filter(p => p.in_stock).length;
    const outOfStockCount = total - inStockCount;

    const framesCount = allProducts.filter(p => p.cat === 'frame').length;
    const sunCount = allProducts.filter(p => p.cat === 'sun').length;
    const contactCount = allProducts.filter(p => p.cat === 'contact').length;
    const lensCount = allProducts.filter(p => p.cat === 'lens').length;

    statTotal.textContent = total;
    statInStock.textContent = inStockCount;
    statOutOfStock.textContent = outOfStockCount;
    statFrames.textContent = framesCount;
    statSun.textContent = sunCount;
    statContact.textContent = contactCount;
    statLens.textContent = lensCount;

    pillBadgeAll.textContent = total;
    pillBadgeFrame.textContent = framesCount;
    pillBadgeSun.textContent = sunCount;
    pillBadgeContact.textContent = contactCount;
    pillBadgeLens.textContent = lensCount;
  }

  function applyFilters() {
    const query = (searchInput.value || '').trim().toLowerCase();
    const stockVal = stockFilter.value;
    const sortVal = sortFilter.value;

    filteredProducts = allProducts.filter(p => {
      // Category match
      if (currentCategory !== 'all' && p.cat !== currentCategory) {
        return false;
      }

      // Stock status match
      if (stockVal === 'in_stock' && !p.in_stock) return false;
      if (stockVal === 'out_of_stock' && p.in_stock) return false;

      // Search match
      if (query) {
        const codeMatch = (p.code || '').toLowerCase().includes(query);
        const nameMatch = (p.name || '').toLowerCase().includes(query);
        const nameEnMatch = (p.name_en || '').toLowerCase().includes(query);
        const typeMatch = (p.type || '').toLowerCase().includes(query);
        const specsMatch = JSON.stringify(p.specs || {}).toLowerCase().includes(query);

        if (!codeMatch && !nameMatch && !nameEnMatch && !typeMatch && !specsMatch) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    filteredProducts.sort((a, b) => {
      if (sortVal === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (sortVal === 'price_desc') return (b.price || 0) - (a.price || 0);
      if (sortVal === 'code_asc') return (a.code || '').localeCompare(b.code || '');
      if (sortVal === 'newest') return (b.id || 0) - (a.id || 0);
      return (a.id || 0) - (b.id || 0); // default id_asc
    });

    renderTable();
  }

  // ==================== TABLE RENDERING ====================

  function renderTableLoading() {
    productsTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
          <span>⏳ ڈیٹا بیس سے مصنوعات لوڈ ہو رہی ہیں...</span>
        </td>
      </tr>
    `;
    const mobileCardsContainer = document.getElementById('mobileCardsContainer');
    if (mobileCardsContainer) {
      mobileCardsContainer.innerHTML = `
        <div style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
          <span>⏳ ڈیٹا بیس سے مصنوعات لوڈ ہو رہی ہیں...</span>
        </div>
      `;
    }
    emptyState.style.display = 'none';
  }

  function renderTable() {
    const mobileCardsContainer = document.getElementById('mobileCardsContainer');

    if (filteredProducts.length === 0) {
      productsTableBody.innerHTML = '';
      if (mobileCardsContainer) mobileCardsContainer.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    const categoryIcons = {
      frame: '👓',
      sun: '🕶️',
      contact: '👁️',
      lens: '🔍'
    };

    const categoryNames = {
      frame: 'فریم',
      sun: 'دھوپ کے چشمے',
      contact: 'کانٹیکٹ لینز',
      lens: 'شیشہ'
    };

    const rowsHtml = filteredProducts.map(p => {
      const isOutOfStock = !p.in_stock;
      const catIcon = categoryIcons[p.cat] || '📦';
      const catName = categoryNames[p.cat] || p.cat;

      return `
        <tr data-id="${p.id}" class="${isOutOfStock ? 'out-of-stock-row' : ''}">
          <!-- Image -->
          <td class="cell-thumb">
            <div class="prod-thumb-wrapper" onclick="previewImage('${escapeHtml(p.img || '')}')">
              <img src="${escapeHtml(p.img || 'images/frames/placeholder.webp')}" alt="${escapeHtml(p.name || '')}" class="prod-thumb" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'><rect fill=\\'%23112332\\' width=\\'100\\' height=\\'100\\'/><text y=\\'.9em\\' font-size=\\'90\\'>👓</text></svg>'" />
            </div>
          </td>

          <!-- Code -->
          <td class="cell-code">
            <span class="prod-code-badge">${escapeHtml(p.code || '')}</span>
          </td>

          <!-- Name & Details -->
          <td class="cell-info">
            <div class="prod-title-group">
              <span class="prod-name">${escapeHtml(p.name || '')}</span>
              ${p.name_en ? `<span class="prod-name-en">${escapeHtml(p.name_en)}</span>` : ''}
            </div>
          </td>

          <!-- Category & Subcategory -->
          <td class="cell-cat">
            <span class="cat-badge">
              <span>${catIcon}</span>
              <span>${catName}</span>
            </span>
            ${p.type ? `<span class="subcat-text">${escapeHtml(p.type)}</span>` : ''}
          </td>

          <!-- Price with Quick Edit -->
          <td class="cell-price">
            <div class="price-display">
              <span class="price-currency">Rs.</span>
              <input type="number" class="quick-price-input" value="${p.price || 0}" min="0" onchange="quickUpdatePrice(${p.id}, this.value)" title="قیمت تبدیل کر کے Enter دبائیں" />
            </div>
          </td>

          <!-- Stock Status Button -->
          <td class="cell-stock">
            <button type="button" class="stock-toggle-btn ${p.in_stock ? 'in-stock' : 'out-of-stock'}" onclick="toggleProductStock(${p.id}, ${!p.in_stock})" title="اسٹیٹس تبدیل کرنے کے لیے کلک کریں">
              ${p.in_stock ? '🟢 موجود ہے' : '🔴 پوشیدہ'}
            </button>
          </td>

          <!-- Actions -->
          <td class="cell-actions">
            <div class="actions-group">
              <button class="btn btn-secondary btn-icon" onclick="openEditModal(${p.id})" title="ترمیم کریں">
                <span>✏️</span>
              </button>
              <button class="btn btn-danger btn-icon" onclick="openDeleteModal(${p.id})" title="ڈیلیٹ کریں">
                <span>🗑️</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    productsTableBody.innerHTML = rowsHtml;

    // Mobile Cards Rendering
    if (mobileCardsContainer) {
      const mobileCardsHtml = filteredProducts.map(p => {
        const isOutOfStock = !p.in_stock;
        const catIcon = categoryIcons[p.cat] || '📦';
        const catName = categoryNames[p.cat] || p.cat;

        return `
          <div class="mobile-product-card ${isOutOfStock ? 'out-of-stock-card' : ''}" data-id="${p.id}">
            <div class="mp-body">
              <div class="mp-thumb-wrapper" onclick="previewImage('${escapeHtml(p.img || '')}')">
                <img src="${escapeHtml(p.img || 'images/frames/placeholder.webp')}" alt="${escapeHtml(p.name || '')}" class="mp-thumb" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'><rect fill=\\'%23112332\\' width=\\'100\\' height=\\'100\\'/><text y=\\'.9em\\' font-size=\\'90\\'>👓</text></svg>'" />
                <span class="mp-zoom-hint">🔍</span>
              </div>

              <div class="mp-details">
                <div class="mp-top-line">
                  <span class="prod-code-badge">${escapeHtml(p.code || '')}</span>
                  <span class="cat-badge">
                    <span>${catIcon}</span>
                    <span>${catName}</span>
                  </span>
                  ${p.type ? `<span class="subcat-chip">${escapeHtml(p.type)}</span>` : ''}
                </div>

                <div class="mp-title">${escapeHtml(p.name || '')}</div>
                ${p.name_en ? `<div class="mp-title-en">${escapeHtml(p.name_en)}</div>` : ''}
              </div>
            </div>

            <div class="mp-footer">
              <div class="mp-price-group">
                <span class="mp-price-label">قیمت:</span>
                <span class="price-currency">Rs.</span>
                <input type="number" class="quick-price-input" value="${p.price || 0}" min="0" onchange="quickUpdatePrice(${p.id}, this.value)" title="قیمت تبدیل کر کے Enter دبائیں" />
              </div>

              <button type="button" class="stock-toggle-btn ${p.in_stock ? 'in-stock' : 'out-of-stock'}" onclick="toggleProductStock(${p.id}, ${!p.in_stock})" title="اسٹیٹس تبدیل کرنے کے لیے کلک کریں">
                ${p.in_stock ? '🟢 موجود ہے' : '🔴 پوشیدہ'}
              </button>

              <div class="actions-group">
                <button class="btn btn-secondary btn-icon" onclick="openEditModal(${p.id})" title="ترمیم کریں">
                  <span>✏️</span>
                </button>
                <button class="btn btn-danger btn-icon" onclick="openDeleteModal(${p.id})" title="ڈیلیٹ کریں">
                  <span>🗑️</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      mobileCardsContainer.innerHTML = mobileCardsHtml;
    }
  }

  // ==================== INLINE ACTIONS ====================

  window.toggleProductStock = async function (id, newInStock) {
    if (!supabaseClient) return;

    try {
      const stockText = newInStock ? 'موجود ہے' : 'ختم ہے';

      const { error } = await supabaseClient
        .from('products')
        .update({
          in_stock: newInStock,
          stock: stockText
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      const prod = allProducts.find(p => p.id === id);
      if (prod) {
        prod.in_stock = newInStock;
        prod.stock = stockText;
      }

      updateMetrics();

      // Update UI row class without full re-render
      const tr = document.querySelector(`tr[data-id="${id}"]`);
      if (tr) {
        if (newInStock) {
          tr.classList.remove('out-of-stock-row');
        } else {
          tr.classList.add('out-of-stock-row');
        }
        const btn = tr.querySelector('.stock-toggle-btn');
        if (btn) {
          btn.className = `stock-toggle-btn ${newInStock ? 'in-stock' : 'out-of-stock'}`;
          btn.innerHTML = newInStock ? '🟢 موجود ہے' : '🔴 پوشیدہ';
          btn.setAttribute('onclick', `toggleProductStock(${id}, ${!newInStock})`);
        }
      }

      // Update mobile card class without full re-render
      const card = document.querySelector(`.mobile-product-card[data-id="${id}"]`);
      if (card) {
        if (newInStock) {
          card.classList.remove('out-of-stock-card');
        } else {
          card.classList.add('out-of-stock-card');
        }
        const cardBtn = card.querySelector('.stock-toggle-btn');
        if (cardBtn) {
          cardBtn.className = `stock-toggle-btn ${newInStock ? 'in-stock' : 'out-of-stock'}`;
          cardBtn.innerHTML = newInStock ? '🟢 موجود ہے' : '🔴 پوشیدہ';
          cardBtn.setAttribute('onclick', `toggleProductStock(${id}, ${!newInStock})`);
        }
      }

      showToast(`پروڈکٹ کا اسٹیٹس اب "${newInStock ? 'دستیاب / ظاہر' : 'پوشیدہ / ختم'}" کر دیا گیا ہے۔`, 'success');
    } catch (err) {
      console.error('Toggle stock error:', err);
      showToast('اسٹاک اسٹیٹس تبدیل کرنے میں خرابی: ' + err.message, 'error');
      loadProducts(); // revert on error
    }
  };

  window.quickUpdatePrice = async function (id, newPriceVal) {
    if (!supabaseClient) return;

    const price = parseFloat(newPriceVal);
    if (isNaN(price) || price < 0) {
      showToast('براہ کرم درست قیمت درج کریں۔', 'error');
      return;
    }

    try {
      const { error } = await supabaseClient
        .from('products')
        .update({ price })
        .eq('id', id);

      if (error) throw error;

      const prod = allProducts.find(p => p.id === id);
      if (prod) prod.price = price;

      // Sync both desktop and mobile price inputs
      document.querySelectorAll(`[data-id="${id}"] .quick-price-input`).forEach(input => {
        input.value = price;
      });

      showToast(`قیمت کامیابی سے Rs. ${price.toLocaleString()} اپڈیٹ ہو گئی ہے۔`, 'success');
    } catch (err) {
      console.error('Quick price update error:', err);
      showToast('قیمت اپڈیٹ کرنے میں خرابی: ' + err.message, 'error');
    }
  };

  window.previewImage = function (url) {
    if (!url) return;
    window.open(url, '_blank');
  };

  // ==================== DYNAMIC SPECS & FORM ====================

  const SUBCATEGORIES_MAP = {
    frame: [
      { id: "چوکور", name: "چوکور" },
      { id: "گول", name: "گول" },
      { id: "کیٹ آئی", name: "کیٹ آئی" },
      { id: "بغیر فریم", name: "بغیر فریم" },
      { id: "بچوں کے", name: "بچوں کے" }
    ],
    sun: [
      { id: "پروٹیکٹو", name: "پروٹیکٹو" },
      { id: "اسٹائلش", name: "اسٹائلش" },
      { id: "برانڈڈ", name: "برانڈڈ" },
      { id: "ویفیرر", name: "ویفیرر" }
    ],
    contact: [
      { id: "Bella", name: "Bella" },
      { id: "Comfort", name: "Comfort" },
      { id: "Comfort. Toric", name: "Comfort Toric" },
      { id: "Comfort By Pretty", name: "Pretty" },
      { id: "New Bio Transparent", name: "Bio" },
      { id: "Adore", name: "Adore" },
      { id: "Vision 6", name: "Vision 6" }
    ],
    lens: [
      { id: "سادہ", name: "سادہ" },
      { id: "ہارڈ کوٹنگ (اینٹی اسکریچ)", name: "ہارڈ کوٹنگ" },
      { id: "بلیو کٹ + فوٹو کرومک", name: "بلیو کٹ + فوٹو" },
      { id: "فوٹو کرومک (دھوپ چھاؤں)", name: "فوٹو کرومک" },
      { id: "بلیو کٹ (Hard Multi Coating)", name: "اینٹی بلیو لائٹ" }
    ]
  };

  const DYNAMIC_SPECS_FIELDS = {
    frame: [
      { key: "size", label: "سائز (Size)", placeholder: "مثال: 52" },
      { key: "sideLength", label: "ڈنڈی لمبائی (Side Length)", placeholder: "مثال: 140" },
      { key: "material", label: "میٹریل و رنگ (Material & Color)", placeholder: "مثال: TR90 کالا, میٹل گولڈن" }
    ],
    sun: [
      { key: "color", label: "رنگ (Color)", placeholder: "مثال: B2 Black, Brown" },
      { key: "uv", label: "تحفظ (UV Protection)", placeholder: "مثال: 100% UV Protection" }
    ],
    contact: [
      { key: "powerRange", label: "پاور رینج (Power Range)", placeholder: "مثال: -0.50 To -8.00" },
      { key: "diaBc", label: "قطر و بیس کرو (B.C / Dia)", placeholder: "مثال: 8.60mm / 14.5mm" }
    ],
    lens: [
      { key: "powerRange", label: "پاور کی حد (Power Range)", placeholder: "مثال: Plano to -6.00" },
      { key: "coating", label: "کوٹنگ (Coating)", placeholder: "مثال: ہارڈ کوٹنگ, اینٹی اسکریچ" }
    ]
  };

  function populateSubcategories(cat, selectedType = '') {
    const list = SUBCATEGORIES_MAP[cat] || (window.SHOP_CONFIG && SHOP_CONFIG.subcategories && SHOP_CONFIG.subcategories[cat]) || [];
    prodType.innerHTML = '';

    let matched = false;
    list.forEach(sub => {
      if (sub.id === 'all') return;
      const opt = document.createElement('option');
      opt.value = sub.id;
      opt.textContent = sub.name;
      if (sub.id === selectedType) {
        opt.selected = true;
        matched = true;
      }
      prodType.appendChild(opt);
    });

    // Custom option
    const customOpt = document.createElement('option');
    customOpt.value = '__custom__';
    customOpt.textContent = '✏️ + نئی قسم خود لکھیں (Custom)...';
    if (selectedType && !matched) {
      customOpt.selected = true;
      if (prodTypeCustom) {
        prodTypeCustom.value = selectedType;
        prodTypeCustom.style.display = 'block';
      }
    } else {
      if (prodTypeCustom) {
        prodTypeCustom.value = '';
        prodTypeCustom.style.display = 'none';
      }
    }
    prodType.appendChild(customOpt);
  }

  function renderDynamicSpecs(cat, existingSpecs = {}) {
    const fields = DYNAMIC_SPECS_FIELDS[cat] || [];
    dynamicSpecsContainer.innerHTML = '';

    const catTitles = {
      frame: 'فریم کے ضروری فیچرز (Frame Details)',
      sun: 'دھوپ کے چشمے کی تفصیلات (Sunglasses Details)',
      contact: 'کانٹیکٹ لینز کی تفصیلات (Contact Lens Details)',
      lens: 'نظر کے شیشے کی تفصیلات (Optical Lens Details)'
    };

    specsCategoryTitle.textContent = catTitles[cat] || 'خصوصیات (Specs)';

    fields.forEach(item => {
      const val = existingSpecs[item.key] || '';
      const div = document.createElement('div');
      div.className = 'form-group';

      div.innerHTML = `
        <label for="spec_${item.key}">${escapeHtml(item.label)}</label>
        <input type="text" id="spec_${item.key}" class="form-control" name="spec_${item.key}" value="${escapeHtml(val)}" placeholder="${escapeHtml(item.placeholder || '')}" />
      `;

      dynamicSpecsContainer.appendChild(div);
    });
  }

  function collectSpecsFromForm(cat) {
    const fields = DYNAMIC_SPECS_FIELDS[cat] || [];
    const specs = {
      code: prodCode.value.trim(),
      stock: (prodInStock.value === 'true') ? 'موجود ہے' : 'ختم ہے'
    };

    fields.forEach(f => {
      const el = document.getElementById(`spec_${f.key}`);
      if (el) {
        specs[f.key] = el.value.trim();
      }
    });

    return specs;
  }

  // ==================== ADD / EDIT PRODUCT ====================

  window.openEditModal = function (id) {
    const p = allProducts.find(item => item.id === id);
    if (!p) return;

    modalTitle.textContent = '✏️ پروڈکٹ میں ترمیم کریں';
    prodFormId.value = p.id;
    prodCat.value = p.cat;
    prodCode.value = p.code || '';
    prodPrice.value = p.price || 0;
    prodName.value = p.name || '';
    prodInStock.value = p.in_stock ? 'true' : 'false';
    prodImageUrl.value = p.img || '';

    // Image preview
    if (p.img) {
      modalImagePreview.src = p.img;
      modalImagePreview.style.display = 'block';
      imagePlaceholder.style.display = 'none';
    } else {
      modalImagePreview.style.display = 'none';
      imagePlaceholder.style.display = 'block';
    }

    populateSubcategories(p.cat, p.type);
    renderDynamicSpecs(p.cat, p.specs || {});

    openModal(productModal);
  };

  btnOpenAddModal.addEventListener('click', () => {
    modalTitle.textContent = '➕ نیا پروڈکٹ شامل کریں';
    productForm.reset();
    prodFormId.value = '';
    prodInStock.value = 'true';
    modalImagePreview.style.display = 'none';
    imagePlaceholder.style.display = 'block';
    prodCat.value = currentCategory !== 'all' ? currentCategory : 'frame';
    if (prodTypeCustom) {
      prodTypeCustom.value = '';
      prodTypeCustom.style.display = 'none';
    }

    populateSubcategories(prodCat.value);
    renderDynamicSpecs(prodCat.value);

    openModal(productModal);
  });

  prodCat.addEventListener('change', () => {
    populateSubcategories(prodCat.value);
    renderDynamicSpecs(prodCat.value);
  });

  if (prodType) {
    prodType.addEventListener('change', () => {
      if (prodType.value === '__custom__') {
        prodTypeCustom.style.display = 'block';
        prodTypeCustom.focus();
      } else {
        prodTypeCustom.style.display = 'none';
      }
    });
  }

  prodInStock.addEventListener('change', () => {
    modalStockLabel.textContent = prodInStock.checked ? 'موجود ہے' : 'پوشیدہ';
  });

  // Image Upload handler
  imageUploadWrapper.addEventListener('click', () => prodImageFile.click());
  prodImageFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        modalImagePreview.src = event.target.result;
        modalImagePreview.style.display = 'block';
        imagePlaceholder.style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
  });

  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!supabaseClient) return;

    const btnSave = document.getElementById('btnSaveProduct');
    btnSave.disabled = true;
    btnSave.innerHTML = '<span>محفوظ ہو رہا ہے...</span>';

    try {
      const cat = prodCat.value;
      const code = prodCode.value.trim();
      let imgPath = prodImageUrl.value.trim();

      // Check if user uploaded a new image file to Supabase Storage
      if (prodImageFile.files && prodImageFile.files.length > 0) {
        const file = prodImageFile.files[0];
        const ext = file.name.split('.').pop() || 'webp';
        const fileName = `${cat}/${code.toLowerCase()}_${Date.now()}.${ext}`;

        const { data: uploadData, error: uploadError } = await supabaseClient.storage
          .from('product-images')
          .upload(fileName, file, { upsert: true });

        if (uploadError) {
          console.warn('Storage upload warning:', uploadError);
          // If storage bucket isn't ready or failed, fallback to local path or keep existing
          if (!imgPath) imgPath = `images/${cat}s/${code.toLowerCase()}.webp`;
        } else {
          const { data: publicUrlData } = supabaseClient.storage
            .from('product-images')
            .getPublicUrl(fileName);
          imgPath = publicUrlData.publicUrl;
        }
      }

      if (!imgPath) {
        imgPath = `images/${cat === 'sun' ? 'sunglasses' : (cat + 's')}/placeholder.webp`;
      }

      const specs = collectSpecsFromForm(cat);
      const isEditing = !!prodFormId.value;
      const finalType = prodType.value === '__custom__' ? (prodTypeCustom.value.trim() || 'عام') : prodType.value;
      const isInStock = prodInStock.value === 'true';
      const productPayload = {
        code,
        cat,
        type: finalType,
        name: prodName.value.trim(),
        name_en: null,
        price: parseFloat(prodPrice.value) || 0,
        gender: 'سب کے لیے',
        img: imgPath,
        stock: isInStock ? 'موجود ہے' : 'ختم ہے',
        in_stock: isInStock,
        specs
      };

      if (isEditing) {
        const id = parseInt(prodFormId.value, 10);
        const { error } = await supabaseClient
          .from('products')
          .update(productPayload)
          .eq('id', id);

        if (error) throw error;
        showToast('پروڈکٹ کامیابی سے اپڈیٹ ہو گئی!', 'success');
      } else {
        const { error } = await supabaseClient
          .from('products')
          .insert([productPayload]);

        if (error) throw error;
        showToast('نیا پروڈکٹ کامیابی سے شامل کر دیا گیا!', 'success');
      }

      closeModal(productModal);
      await loadProducts();
    } catch (err) {
      console.error('Save product error:', err);
      showToast('محفوظ کرنے میں خرابی: ' + err.message, 'error');
    } finally {
      btnSave.disabled = false;
      btnSave.innerHTML = '<span>💾 محفوظ کریں</span>';
    }
  });

  // ==================== DELETE PRODUCT ====================

  window.openDeleteModal = function (id) {
    const p = allProducts.find(item => item.id === id);
    if (!p) return;

    productToDelete = p;
    deleteProdName.textContent = `${p.code} (${p.name})`;
    openModal(deleteModal);
  };

  btnConfirmDelete.addEventListener('click', async () => {
    if (!productToDelete || !supabaseClient) return;

    btnConfirmDelete.disabled = true;
    btnConfirmDelete.textContent = 'ڈیلیٹ ہو رہا ہے...';

    try {
      const { error } = await supabaseClient
        .from('products')
        .delete()
        .eq('id', productToDelete.id);

      if (error) throw error;

      showToast(`پروڈکٹ ${productToDelete.code} کامیابی سے ڈیلیٹ ہو گئی۔`, 'success');
      closeModal(deleteModal);
      productToDelete = null;
      await loadProducts();
    } catch (err) {
      console.error('Delete product error:', err);
      showToast('ڈیلیٹ کرنے میں خرابی: ' + err.message, 'error');
    } finally {
      btnConfirmDelete.disabled = false;
      btnConfirmDelete.textContent = 'ہاں، ڈیلیٹ کریں';
    }
  });

  // ==================== EVENT LISTENERS ====================

  function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    btnLogout.addEventListener('click', handleLogout);

    btnRefresh.addEventListener('click', () => {
      showToast('ڈیٹا ری فریش ہو رہا ہے...', 'success');
      loadProducts();
    });

    searchInput.addEventListener('input', applyFilters);
    stockFilter.addEventListener('change', applyFilters);
    sortFilter.addEventListener('change', applyFilters);

    // Category pills filter
    document.querySelectorAll('.cat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentCategory = pill.dataset.cat || 'all';
        applyFilters();
      });
    });

    // Close modal handlers
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-backdrop').forEach(m => closeModal(m));
      });
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    });

    // Escape key closes modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.open').forEach(m => closeModal(m));
      }
    });
  }

  // ==================== UTILITIES ====================

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✅' : '⚠️'}</span>
      <span>${escapeHtml(message)}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();
