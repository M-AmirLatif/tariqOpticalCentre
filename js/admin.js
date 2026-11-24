/**
 * طارق آپٹیکل سنٹر (Tariq Optical Centre) - ایڈمن پورٹل لاجک
 * Supabase CRUD Operations, Stock Toggle, Pricing Update, Storage & Auth
 */

(function () {
  'use strict';

  // State Management
  let supabaseClient = null;
  let currentUser = null;
  let allProducts = [];
  let filteredProducts = [];
  let currentCategory = 'all';
  let productToDelete = null;

  // DOM Elements
  const setupSection = document.getElementById('setupSection');
  const loginSection = document.getElementById('loginSection');
  const dashboardSection = document.getElementById('dashboardSection');

  const connectionDot = document.getElementById('connectionDot');
  const connectionText = document.getElementById('connectionText');
  const userBadge = document.getElementById('userBadge');
  const userEmailText = document.getElementById('userEmailText');
  const btnLogout = document.getElementById('btnLogout');
  const btnSettings = document.getElementById('btnSettings');

  const setupForm = document.getElementById('setupForm');
  const setupUrl = document.getElementById('setupUrl');
  const setupKey = document.getElementById('setupKey');

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
  const btnSyncCatalog = document.getElementById('btnSyncCatalog');

  // Product Modal
  const productModal = document.getElementById('productModal');
  const productForm = document.getElementById('productForm');
  const modalTitle = document.getElementById('modalTitle');
  const prodFormId = document.getElementById('prodFormId');
  const prodCat = document.getElementById('prodCat');
  const prodType = document.getElementById('prodType');
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

  // Sync Modal
  const syncModal = document.getElementById('syncModal');
  const btnStartSync = document.getElementById('btnStartSync');
  const syncProgressContainer = document.getElementById('syncProgressContainer');
  const syncProgressText = document.getElementById('syncProgressText');
  const syncProgressBar = document.getElementById('syncProgressBar');

  // Settings Modal
  const settingsModal = document.getElementById('settingsModal');
  const settingsForm = document.getElementById('settingsForm');
  const settingsUrl = document.getElementById('settingsUrl');
  const settingsKey = document.getElementById('settingsKey');

  const toastContainer = document.getElementById('toastContainer');

  // ==================== INITIALIZATION ====================

  function init() {
    setupEventListeners();

    // Check credentials from localStorage or SHOP_CONFIG
    const storedUrl = localStorage.getItem('toc_supabase_url') || (window.SHOP_CONFIG && SHOP_CONFIG.supabase && SHOP_CONFIG.supabase.url);
    const storedKey = localStorage.getItem('toc_supabase_key') || (window.SHOP_CONFIG && SHOP_CONFIG.supabase && SHOP_CONFIG.supabase.anonKey);

    if (storedUrl && storedKey && storedUrl.startsWith('http')) {
      initializeSupabase(storedUrl, storedKey);
    } else {
      showSetupScreen();
    }
  }

  function initializeSupabase(url, key) {
    try {
      if (!window.supabase) {
        showToast('Supabase SDK لوڈ نہیں ہو سکی۔ براہ کرم انٹرنیٹ کنکشن چیک کریں۔', 'error');
        return;
      }

      supabaseClient = window.supabase.createClient(url, key);
      localStorage.setItem('toc_supabase_url', url);
      localStorage.setItem('toc_supabase_key', key);

      updateConnectionStatus(true);
      checkAuthSession();
    } catch (err) {
      console.error('Supabase Init Error:', err);
      updateConnectionStatus(false);
      showSetupScreen();
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

  function showSetupScreen() {
    setupSection.style.display = 'flex';
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'none';
    userBadge.style.display = 'none';
    btnLogout.style.display = 'none';
  }

  function showLoginScreen() {
    setupSection.style.display = 'none';
    loginSection.style.display = 'flex';
    dashboardSection.style.display = 'none';
    userBadge.style.display = 'none';
    btnLogout.style.display = 'none';
  }

  function showDashboard() {
    setupSection.style.display = 'none';
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';

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

      // If Supabase table is completely empty, offer quick sync from products.json
      if (allProducts.length === 0) {
        openModal(syncModal);
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
    emptyState.style.display = 'none';
  }

  function renderTable() {
    if (filteredProducts.length === 0) {
      productsTableBody.innerHTML = '';
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
          <td>
            <div class="prod-thumb-wrapper" onclick="previewImage('${escapeHtml(p.img || '')}')">
              <img src="${escapeHtml(p.img || 'images/frames/placeholder.webp')}" alt="${escapeHtml(p.name || '')}" class="prod-thumb" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'><rect fill=\\'%23112332\\' width=\\'100\\' height=\\'100\\'/><text y=\\'.9em\\' font-size=\\'90\\'>👓</text></svg>'" />
            </div>
          </td>

          <!-- Code -->
          <td>
            <span class="prod-code-badge">${escapeHtml(p.code || '')}</span>
          </td>

          <!-- Name & Details -->
          <td>
            <div class="prod-title-group">
              <span class="prod-name">${escapeHtml(p.name || '')}</span>
              ${p.name_en ? `<span class="prod-name-en">${escapeHtml(p.name_en)}</span>` : ''}
            </div>
          </td>

          <!-- Category & Subcategory -->
          <td>
            <span class="cat-badge">
              <span>${catIcon}</span>
              <span>${catName}</span>
            </span>
            ${p.type ? `<span class="subcat-text">${escapeHtml(p.type)}</span>` : ''}
          </td>

          <!-- Price with Quick Edit -->
          <td>
            <div class="price-display">
              <span class="price-currency">Rs.</span>
              <input type="number" class="quick-price-input" value="${p.price || 0}" min="0" onchange="quickUpdatePrice(${p.id}, this.value)" title="قیمت تبدیل کر کے Enter دبائیں" />
            </div>
          </td>

          <!-- Stock Toggle Switch -->
          <td>
            <label class="toggle-switch" title="${p.in_stock ? 'ویب سائٹ پر دکھائی دے رہا ہے' : 'ویب سائٹ سے پوشیدہ ہے'}">
              <input type="checkbox" ${p.in_stock ? 'checked' : ''} onchange="toggleProductStock(${p.id}, this.checked)" />
              <span class="slider"></span>
              <span class="toggle-label">${p.in_stock ? 'موجود ہے' : 'پوشیدہ'}</span>
            </label>
          </td>

          <!-- Actions -->
          <td style="text-align: center;">
            <div style="display: inline-flex; gap: 0.4rem;">
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
        const label = tr.querySelector('.toggle-label');
        if (label) label.textContent = newInStock ? 'موجود ہے' : 'پوشیدہ';
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

  function populateSubcategories(cat, selectedType = '') {
    const subcats = (window.SHOP_CONFIG && SHOP_CONFIG.subcategories && SHOP_CONFIG.subcategories[cat]) || [];
    prodType.innerHTML = '';

    subcats.forEach(sub => {
      if (sub.id === 'all') return;
      const opt = document.createElement('option');
      opt.value = sub.id;
      opt.textContent = sub.name;
      if (sub.id === selectedType) opt.selected = true;
      prodType.appendChild(opt);
    });
  }

  function renderDynamicSpecs(cat, existingSpecs = {}) {
    const specsMap = (window.SHOP_CONFIG && SHOP_CONFIG.specsFieldOrder && SHOP_CONFIG.specsFieldOrder[cat]) || [];
    dynamicSpecsContainer.innerHTML = '';

    const catTitles = {
      frame: 'فریم کے مخصوص فیچرز (Frame Specs)',
      sun: 'دھوپ کے چشمے کے مخصوص فیچرز (Sunglasses Specs)',
      contact: 'کانٹیکٹ لینز کے مخصوص فیچرز (Contact Lens Specs)',
      lens: 'نظر کے شیشے کے مخصوص فیچرز (Optical Lens Specs)'
    };

    specsCategoryTitle.textContent = catTitles[cat] || 'خصوصیات (Specs)';

    // Skip fields that are already in the main form (code, condition, stock)
    const skipKeys = ['code', 'stock'];

    specsMap.forEach(item => {
      if (skipKeys.includes(item.key)) return;

      const val = existingSpecs[item.key] || '';
      const div = document.createElement('div');
      div.className = 'form-group';

      div.innerHTML = `
        <label for="spec_${item.key}">${escapeHtml(item.label)} (${item.key})</label>
        <input type="text" id="spec_${item.key}" class="form-control" name="spec_${item.key}" value="${escapeHtml(val)}" />
      `;

      dynamicSpecsContainer.appendChild(div);
    });
  }

  function collectSpecsFromForm(cat) {
    const specsMap = (window.SHOP_CONFIG && SHOP_CONFIG.specsFieldOrder && SHOP_CONFIG.specsFieldOrder[cat]) || [];
    const specs = {};

    specsMap.forEach(item => {
      if (item.key === 'code') {
        specs.code = prodCode.value.trim();
        return;
      }
      if (item.key === 'stock') {
        specs.stock = prodInStock.checked ? 'موجود ہے' : 'ختم ہے';
        return;
      }

      const input = document.getElementById(`spec_${item.key}`);
      if (input) {
        specs[item.key] = input.value.trim();
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
    prodGender.value = p.gender || 'سب کے لیے';
    prodName.value = p.name || '';
    prodNameEn.value = p.name_en || '';
    prodInStock.checked = !!p.in_stock;
    modalStockLabel.textContent = p.in_stock ? 'موجود ہے' : 'پوشیدہ';
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
    prodInStock.checked = true;
    modalStockLabel.textContent = 'موجود ہے';
    modalImagePreview.style.display = 'none';
    imagePlaceholder.style.display = 'block';
    prodCat.value = currentCategory !== 'all' ? currentCategory : 'frame';

    populateSubcategories(prodCat.value);
    renderDynamicSpecs(prodCat.value);

    openModal(productModal);
  });

  prodCat.addEventListener('change', () => {
    populateSubcategories(prodCat.value);
    renderDynamicSpecs(prodCat.value);
  });

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
      const productPayload = {
        code,
        cat,
        type: prodType.value,
        name: prodName.value.trim(),
        name_en: prodNameEn.value.trim() || null,
        price: parseFloat(prodPrice.value) || 0,
        gender: prodGender.value,
        img: imgPath,
        stock: prodInStock.checked ? 'موجود ہے' : 'ختم ہے',
        in_stock: prodInStock.checked,
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

  // ==================== 1-CLICK SYNC CATALOG ====================

  btnSyncCatalog.addEventListener('click', () => {
    syncProgressContainer.style.display = 'none';
    syncProgressBar.style.width = '0%';
    openModal(syncModal);
  });

  btnStartSync.addEventListener('click', async () => {
    if (!supabaseClient) return;

    btnStartSync.disabled = true;
    syncProgressContainer.style.display = 'block';

    try {
      const res = await fetch('products.json?v=' + Date.now());
      if (!res.ok) throw new Error('products.json فائل دستیاب نہیں ہے');
      const seedProducts = await res.json();

      const total = seedProducts.length;
      syncProgressText.textContent = `0 / ${total}`;

      const batchSize = 25;
      for (let i = 0; i < total; i += batchSize) {
        const batch = seedProducts.slice(i, i + batchSize).map(p => ({
          id: p.id,
          code: p.code,
          cat: p.cat,
          type: p.type || '',
          name: p.name,
          name_en: p.nameEn || null,
          price: p.price || 0,
          gender: p.gender || 'سب کے لیے',
          img: p.img,
          stock: p.stock || 'موجود ہے',
          in_stock: p.inStock !== false,
          featured: !!p.featured,
          specs: p.specs || {}
        }));

        const { error } = await supabaseClient
          .from('products')
          .upsert(batch, { onConflict: 'code' });

        if (error) throw error;

        const currentCount = Math.min(i + batchSize, total);
        const percent = Math.round((currentCount / total) * 100);
        syncProgressBar.style.width = percent + '%';
        syncProgressText.textContent = `${currentCount} / ${total} (${percent}%)`;
      }

      showToast(`تمام ${total} مصنوعات کامیابی سے Supabase میں سنک ہو گئیں!`, 'success');
      closeModal(syncModal);
      await loadProducts();
    } catch (err) {
      console.error('Sync error:', err);
      showToast('سنک کرنے میں خرابی: ' + err.message, 'error');
    } finally {
      btnStartSync.disabled = false;
    }
  });

  // ==================== SETTINGS MODAL ====================

  btnSettings.addEventListener('click', () => {
    settingsUrl.value = localStorage.getItem('toc_supabase_url') || (window.SHOP_CONFIG && SHOP_CONFIG.supabase && SHOP_CONFIG.supabase.url) || '';
    settingsKey.value = localStorage.getItem('toc_supabase_key') || (window.SHOP_CONFIG && SHOP_CONFIG.supabase && SHOP_CONFIG.supabase.anonKey) || '';
    openModal(settingsModal);
  });

  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = settingsUrl.value.trim();
    const key = settingsKey.value.trim();

    if (url && key) {
      initializeSupabase(url, key);
      closeModal(settingsModal);
      showToast('ترتیبات کامیابی سے محفوظ ہو گئیں۔', 'success');
    }
  });

  setupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = setupUrl.value.trim();
    const key = setupKey.value.trim();

    if (url && key) {
      initializeSupabase(url, key);
      showToast('کنکشن قائم کرنے کی کوشش کی جا رہی ہے...', 'success');
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
