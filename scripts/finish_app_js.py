# -*- coding: utf-8 -*-

with open('js/app.js', 'r', encoding='utf-8') as f:
    code = f.read().replace('\r\n', '\n')

# 1. Update state object
old_state = """  // Application State
  const state = {
    allProducts: [],
    filteredProducts: [],
    visibleCount: 12,
    cart: [],
    filters: {"""

new_state = """  // Application State
  const state = {
    allProducts: [],
    filteredProducts: [],
    visibleCount: 12,
    cart: [],
    prescriptionImage: null,
    prescriptionFile: null,
    filters: {"""

if old_state in code:
    code = code.replace(old_state, new_state, 1)
    print("State updated with prescriptionImage & prescriptionFile!")
else:
    print("old_state not found!")

# 2. Update handleOrderSubmit
old_submit_start = """  // Order Submission & WhatsApp Pre-filled URL Generation
  function handleOrderSubmit(e) {
    e.preventDefault();

    if (state.cart.length === 0) {
      alert('برائے مہربانی پہلے کوئی چشمہ یا فریم آرڈر میں شامل فرمائیں!');
      return;
    }"""

new_submit_start = """  // Order Submission & WhatsApp Pre-filled URL Generation
  function handleOrderSubmit(e) {
    e.preventDefault();

    if (state.cart.length === 0 && !state.prescriptionImage) {
      alert('برائے مہربانی پہلے کوئی چشمہ یا فریم منتخب کریں یا اپنے آنکھوں کا کارڈ اپلوڈ فرمائیں!');
      return;
    }"""

if old_submit_start in code:
    code = code.replace(old_submit_start, new_submit_start, 1)
    print("handleOrderSubmit validation updated!")
else:
    print("old_submit_start not found!")

# 3. Update handleOrderSubmit message & send logic
old_submit_full = """    let msg = `السلام علیکم! میں طارق آپٹیکل سنٹر سے آرڈر کرنا چاہتا ہوں۔\\n\\n`;

    let totalNumeric = 0;
    let hasUnpriced = false;

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

      msg += `${lineNum}. ${item.name} – کوڈ ${code}\\n`;
      msg += `   رنگ: ${color}${size ? ` | تفصیل: ${size}` : ''}\\n`;
      if (item.price > 0) {
        msg += `   تعداد: ${item.qty} × Rs ${item.price} = Rs ${linePrice}\\n\\n`;
      } else {
        msg += `   تعداد: ${item.qty} (قیمت رابطہ پر طے ہوگی)\\n\\n`;
      }
    });

    msg += `------------------------------\\n`;
    if (totalNumeric > 0) {
      msg += `کل رقم: Rs ${totalNumeric}${hasUnpriced ? ' (+ بغیر قیمت والے آئٹمز کی قیمت رابطہ پر)' : ''}\\n`;
    } else {
      msg += `کل رقم: رابطہ پر طے ہوگی\\n`;
    }

    msg += `نام: ${nameInput.value.trim()}\\n`;
    msg += `فون: ${phoneInput.value.trim()}\\n`;
    msg += `پتہ: ${addressInput.value.trim()}\\n`;
    if (noteInput.value.trim()) {
      msg += `نوٹ: ${noteInput.value.trim()}\\n`;
    }

    // Open WhatsApp
    const waUrl = `https://wa.me/${SHOP_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');

    // Show Thank you & option to reset
    if (dom.orderSuccessCard) {
      dom.orderSuccessCard.style.display = 'block';
      dom.orderForm.style.display = 'none';
    }"""

new_submit_full = """    let msg = `السلام علیکم! میں طارق آپٹیکل سنٹر سے آرڈر کرنا چاہتا ہوں۔\\n\\n`;

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

        msg += `${lineNum}. ${item.name} – کوڈ ${code}\\n`;
        msg += `   رنگ: ${color}${size ? ` | تفصیل: ${size}` : ''}\\n`;
        if (item.price > 0) {
          msg += `   تعداد: ${item.qty} × Rs ${item.price} = Rs ${linePrice}\\n\\n`;
        } else {
          msg += `   تعداد: ${item.qty} (قیمت رابطہ پر طے ہوگی)\\n\\n`;
        }
      });

      msg += `------------------------------\\n`;
      if (totalNumeric > 0) {
        msg += `کل رقم: Rs ${totalNumeric}${hasUnpriced ? ' (+ بغیر قیمت والے آئٹمز کی قیمت رابطہ پر)' : ''}\\n`;
      } else {
        msg += `کل رقم: رابطہ پر طے ہوگی\\n`;
      }
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
    }"""

if old_submit_full in code:
    code = code.replace(old_submit_full, new_submit_full, 1)
    print("handleOrderSubmit full message & send logic updated!")
else:
    print("old_submit_full not found!")

# 4. Add Drawer & Prescription Event Listeners in setupEventListeners
old_listeners = """    // Keyboard navigation for Lightbox
    window.addEventListener('keydown', (e) => {
      if (!state.lightbox.isOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextLightbox();
      if (e.key === 'ArrowLeft') prevLightbox();
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

    // Keyboard navigation for Lightbox & Drawer
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
    print("old_listeners not found!")

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("js/app.js updated successfully!")
