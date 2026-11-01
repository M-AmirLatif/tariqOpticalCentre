# -*- coding: utf-8 -*-

with open('js/app.js', 'r', encoding='utf-8') as f:
    code = f.read().replace('\r\n', '\n')

# 1. Add prescription state in state object
old_state = """    sortBy: 'featured',
    visibleCount: 12,
    cart: loadCart(),
    lightbox: {"""

new_state = """    sortBy: 'featured',
    visibleCount: 12,
    cart: loadCart(),
    prescriptionImage: null,
    prescriptionFile: null,
    lightbox: {"""

if old_state in code:
    code = code.replace(old_state, new_state, 1)
    print("State updated with prescription fields!")
else:
    print("Could not find old_state")

# 2. Add DOM references in dom object
old_dom = """    // Lightbox
    lightboxOverlay: document.getElementById('lightbox-overlay'),
    lightboxCloseBtn: document.getElementById('lightbox-close-btn'),
    lightboxPrevBtn: document.getElementById('lightbox-prev-btn'),
    lightboxNextBtn: document.getElementById('lightbox-next-btn'),
    lightboxBody: document.getElementById('lightbox-body')
  };"""

new_dom = """    // Mobile Drawer
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
    // Lightbox
    lightboxOverlay: document.getElementById('lightbox-overlay'),
    lightboxCloseBtn: document.getElementById('lightbox-close-btn'),
    lightboxPrevBtn: document.getElementById('lightbox-prev-btn'),
    lightboxNextBtn: document.getElementById('lightbox-next-btn'),
    lightboxBody: document.getElementById('lightbox-body')
  };"""

if old_dom in code:
    code = code.replace(old_dom, new_dom, 1)
    print("DOM references added!")
else:
    print("Could not find old_dom")

# 3. Add Drawer & Prescription helper functions
helper_functions = """
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
      if (dom.prescriptionPreviewImg) {
        dom.prescriptionPreviewImg.src = e.target.result;
      }
      if (dom.previewFilename) {
        dom.previewFilename.textContent = `${file.name} (${Math.round(file.size / 1024)} KB)`;
      }
      if (dom.uploadPlaceholder) dom.uploadPlaceholder.style.display = 'none';
      if (dom.uploadPreview) dom.uploadPreview.style.display = 'flex';
      if (dom.prescriptionCardBox) dom.prescriptionCardBox.classList.add('has-file');

      updateCartUI();
    };
    reader.readAsDataURL(file);
  }

  function clearPrescriptionFile() {
    state.prescriptionImage = null;
    state.prescriptionFile = null;
    if (dom.prescriptionInput) dom.prescriptionInput.value = '';
    if (dom.prescriptionPreviewImg) dom.prescriptionPreviewImg.src = '';
    if (dom.uploadPlaceholder) dom.uploadPlaceholder.style.display = 'flex';
    if (dom.uploadPreview) dom.uploadPreview.style.display = 'none';
    if (dom.prescriptionCardBox) dom.prescriptionCardBox.classList.remove('has-file');

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
"""

if 'function openDrawer()' not in code:
    # Insert right before updateCartUI
    code = code.replace('  // Update Cart UI everywhere', helper_functions + '\n  // Update Cart UI everywhere', 1)
    print("Drawer & Prescription helper functions inserted!")

# 4. Update updateCartUI to support Card-only submissions and update button text
old_update_cart = """    // Render Order Section Cart Items List
    if (dom.cartItemsList) {
      dom.cartItemsList.innerHTML = '';
      if (state.cart.length === 0) {
        dom.cartItemsList.innerHTML = `
          <div style="text-align:center; padding:2rem 1rem; color:var(--muted);">
            <div style="font-size:2.5rem; margin-bottom:0.5rem;">🛒</div>
            <p style="font-size:1.1rem; font-weight:600; color:var(--heading);">آپ کے آرڈر میں ابھی کوئی چیز شامل نہیں ہے۔</p>
            <p style="font-size:0.95rem; margin-top:0.35rem;">اوپر موجود کیٹلاگ سے چشمہ، لینز یا فریم منتخب کریں اور "آرڈر میں ڈالیں" پر کلک کریں۔</p>
            <a href="#browse-section" class="btn btn-primary" style="margin-top:1rem;">👓 مصنوعات دیکھیں</a>
          </div>
        `;
        if (dom.cartTotalPrice) {
          dom.cartTotalPrice.style.display = 'none';
        }
        const orderSubmitBtn = dom.orderForm ? dom.orderForm.querySelector('button[type="submit"]') : null;
        if (orderSubmitBtn) {
          orderSubmitBtn.disabled = true;
          orderSubmitBtn.style.opacity = '0.6';
          orderSubmitBtn.style.cursor = 'not-allowed';
          orderSubmitBtn.innerHTML = '🛒 پہلے کوئی پروڈکٹ منتخب کریں';
        }
      } else {
        if (dom.cartTotalPrice) {
          dom.cartTotalPrice.style.display = 'block';
        }
        const orderSubmitBtn = dom.orderForm ? dom.orderForm.querySelector('button[type="submit"]') : null;
        if (orderSubmitBtn) {
          orderSubmitBtn.disabled = false;
          orderSubmitBtn.style.opacity = '1';
          orderSubmitBtn.style.cursor = 'pointer';
          orderSubmitBtn.innerHTML = '<span>✅</span> <span>واٹس ایپ پر آرڈر بھیجیں</span>';
        }"""

new_update_cart = """    // Update Mobile Drawer Cart Count
    if (dom.drawerCartCount) {
      dom.drawerCartCount.textContent = totalCount;
    }

    const hasCard = state.prescriptionImage !== null;
    const canSubmit = totalCount > 0 || hasCard;
    const orderSubmitBtn = dom.orderForm ? dom.orderForm.querySelector('button[type="submit"]') : null;

    if (orderSubmitBtn) {
      if (canSubmit) {
        orderSubmitBtn.disabled = false;
        orderSubmitBtn.style.opacity = '1';
        orderSubmitBtn.style.cursor = 'pointer';
        if (totalCount > 0 && hasCard) {
          orderSubmitBtn.innerHTML = '<span>✅</span> <span>فریم، لینز اور کارڈ واٹس ایپ پر بھیجیں</span>';
        } else if (hasCard) {
          orderSubmitBtn.innerHTML = '<span>✅</span> <span>آنکھوں کا کارڈ واٹس ایپ پر بھیجیں</span>';
        } else {
          orderSubmitBtn.innerHTML = '<span>✅</span> <span>واٹس ایپ پر آرڈر بھیجیں</span>';
        }
      } else {
        orderSubmitBtn.disabled = true;
        orderSubmitBtn.style.opacity = '0.6';
        orderSubmitBtn.style.cursor = 'not-allowed';
        orderSubmitBtn.innerHTML = '🛒 پہلے پروڈکٹ منتخب کریں یا کارڈ اپلوڈ کریں';
      }
    }

    // Render Order Section Cart Items List
    if (dom.cartItemsList) {
      dom.cartItemsList.innerHTML = '';
      if (state.cart.length === 0) {
        dom.cartItemsList.innerHTML = `
          <div style="text-align:center; padding:1.75rem 1rem; color:var(--muted);">
            <div style="font-size:2.4rem; margin-bottom:0.4rem;">🛒</div>
            <p style="font-size:1.05rem; font-weight:600; color:var(--heading);">آپ کے آرڈر میں ابھی کوئی فریم یا چشمہ شامل نہیں ہے۔</p>
            <p style="font-size:0.92rem; margin-top:0.35rem;">آپ اوپر کیٹلاگ سے فریم اور لینز منتخب کر سکتے ہیں، یا صرف اپنا نسخہ / کارڈ اپلوڈ کر کے بھی آرڈر بھیج سکتے ہیں!</p>
            <a href="#browse-section" class="btn btn-outline" style="margin-top:0.75rem;">👓 مصنوعات دیکھیں</a>
          </div>
        `;
        if (dom.cartTotalPrice) {
          dom.cartTotalPrice.style.display = 'none';
        }
      } else {
        if (dom.cartTotalPrice) {
          dom.cartTotalPrice.style.display = 'block';
        }"""

if old_update_cart in code:
    code = code.replace(old_update_cart, new_update_cart, 1)
    print("updateCartUI updated for card upload workflow!")
else:
    print("Could not find old_update_cart")

# 5. Update handleOrderSubmit
old_submit = """  // Order Submission & WhatsApp Pre-filled URL Generation
  function handleOrderSubmit(e) {
    e.preventDefault();

    if (state.cart.length === 0) {
      alert('برائے مہربانی پہلے مصنوعات منتخب کریں جن کا آپ آرڈر کرنا چاہتے ہیں!');
      return;
    }"""

new_submit = """  // Order Submission & WhatsApp Pre-filled URL Generation
  function handleOrderSubmit(e) {
    e.preventDefault();

    if (state.cart.length === 0 && !state.prescriptionImage) {
      alert('برائے مہربانی پہلے کوئی پروڈکٹ منتخب کریں یا اپنے چشمے کا کارڈ اپلوڈ فرمائیں!');
      return;
    }"""

if old_submit in code:
    code = code.replace(old_submit, new_submit, 1)
    print("handleOrderSubmit validation updated!")
else:
    print("Could not find old_submit")

# 6. Update message builder in handleOrderSubmit
old_msg_block = """    let msg = `السلام علیکم! میں طارق آپٹیکل سنٹر سے آرڈر کرنا چاہتا ہوں۔\\n\\n`;

    state.cart.forEach((item, idx) => {"""

new_msg_block = """    let msg = `السلام علیکم! میں طارق آپٹیکل سنٹر سے آرڈر کرنا چاہتا ہوں۔\\n\\n`;

    if (state.cart.length > 0) {
      state.cart.forEach((item, idx) => {"""

if old_msg_block in code:
    code = code.replace(old_msg_block, new_msg_block, 1)
    print("Message builder updated part 1!")

old_msg_end = """    msg += `------------------------------\\n`;
    msg += hasUnpriced 
      ? `کل رقم: Rs ${totalPrice.toLocaleString('en-US')} (+ بغیر قیمت والے آئٹمز کی قیمت رابطہ پر)\\n`
      : `کل رقم: Rs ${totalPrice.toLocaleString('en-US')}\\n`;
    msg += `نام: ${nameInput.value.trim()}\\n`;
    msg += `فون: ${phoneInput.value.trim()}\\n`;
    msg += `پتہ: ${addressInput.value.trim()}\\n`;
    if (noteInput && noteInput.value.trim()) {
      msg += `نوٹ: ${noteInput.value.trim()}\\n`;
    }"""

new_msg_end = """    msg += `------------------------------\\n`;
    msg += hasUnpriced 
      ? `کل رقم: Rs ${totalPrice.toLocaleString('en-US')} (+ بغیر قیمت والے آئٹمز کی قیمت رابطہ پر)\\n`
      : `کل رقم: Rs ${totalPrice.toLocaleString('en-US')}\\n`;
    } else {
      msg += `(گاہک نے فریم و لینز کے انتخاب اور مشورے کے لیے نسخہ / کارڈ منسلک کیا ہے)\\n`;
    }

    if (state.prescriptionImage) {
      msg += `------------------------------\\n`;
      msg += `📋 آنکھوں کا کارڈ / نسخہ: منسلک تصویر ساتھ بھیجی جا رہی ہے\\n`;
      msg += `------------------------------\\n`;
    }

    msg += `نام: ${nameInput.value.trim()}\\n`;
    msg += `فون: ${phoneInput.value.trim()}\\n`;
    msg += `پتہ: ${addressInput.value.trim()}\\n`;
    if (noteInput && noteInput.value.trim()) {
      msg += `نوٹ: ${noteInput.value.trim()}\\n`;
    }"""

if old_msg_end in code:
    code = code.replace(old_msg_end, new_msg_end, 1)
    print("Message builder updated part 2!")
else:
    print("Could not find old_msg_end")

# 7. Update window.open to support Web Share API and Card Reminder Modal
old_send = """    const phone = SHOP_CONFIG.whatsappNumber;
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

    // Open WhatsApp
    window.open(waUrl, '_blank');

    // Show Thank-you card
    if (dom.orderSuccessCard) {
      dom.orderSuccessCard.style.display = 'block';
      dom.orderSuccessCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (dom.orderForm) {
      dom.orderForm.style.display = 'none';
    }"""

new_send = """    const phone = SHOP_CONFIG.whatsappNumber;
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

    // If customer attached prescription card and device supports Web Share API with files
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
    }"""

if old_send in code:
    code = code.replace(old_send, new_send, 1)
    print("WhatsApp send logic updated!")
else:
    print("Could not find old_send")

# 8. Register event listeners for Drawer, Nav links, and Prescription upload
old_listeners = """    // Keyboard Navigation for Lightbox
    window.addEventListener('keydown', (e) => {
      if (!state.lightbox.isOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') prevLightbox();
      if (e.key === 'ArrowLeft') nextLightbox();
    });"""

new_listeners = """    // Mobile Drawer Toggle
    if (dom.menuToggleBtn) {
      dom.menuToggleBtn.addEventListener('click', toggleDrawer);
    }
    if (dom.drawerCloseBtn) {
      dom.drawerCloseBtn.addEventListener('click', closeDrawer);
    }
    if (dom.mobileNavBackdrop) {
      dom.mobileNavBackdrop.addEventListener('click', closeDrawer);
    }

    // Drawer and Desktop Nav category links
    document.querySelectorAll('.drawer-link, .nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const cat = link.getAttribute('data-cat');
        if (cat) {
          e.preventDefault();
          setCategory(cat);
          const browseSec = document.getElementById('browse-section');
          if (browseSec) browseSec.scrollIntoView({ behavior: 'smooth' });
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

    // Keyboard Navigation for Lightbox & Drawer
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (state.lightbox.isOpen) closeLightbox();
        closeDrawer();
        if (dom.cardReminderModal) dom.cardReminderModal.style.display = 'none';
      }
      if (state.lightbox.isOpen) {
        if (e.key === 'ArrowRight') prevLightbox();
        if (e.key === 'ArrowLeft') nextLightbox();
      }
    });"""

if old_listeners in code:
    code = code.replace(old_listeners, new_listeners, 1)
    print("Event listeners added!")
else:
    print("Could not find old_listeners")

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("js/app.js updated successfully!")
