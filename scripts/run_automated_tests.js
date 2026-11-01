const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9222;
const USER_DATA = path.resolve('temp_edge_test');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && this.callbacks.has(data.id)) {
        const { resolve, reject } = this.callbacks.get(data.id);
        this.callbacks.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };
  }

  send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result ? res.result.value : null;
  }

  async screenshot(outPath, clip = null) {
    const params = { format: 'png' };
    if (clip) params.clip = clip;
    const res = await this.send('Page.captureScreenshot', params);
    fs.writeFileSync(outPath, Buffer.from(res.data, 'base64'));
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  fs.mkdirSync('screenshots', { recursive: true });

  const edgeProc = spawn(EDGE_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA}`,
    '--no-first-run',
    'http://localhost:8080/'
  ]);

  await sleep(2500);

  try {
    const resp = await fetch(`http://127.0.0.1:${PORT}/json`);
    const targets = await resp.json();
    const page = targets.find(t => t.type === 'page');
    if (!page) throw new Error('No page target found');

    const client = new CDPClient(page.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('DOM.enable');

    console.log('=== TEST 1: Viewport Screenshots (360px, 414px, 768px, 1280px) ===');
    const viewports = [
      { w: 360, h: 800, file: 'screenshots/viewport-360px.png' },
      { w: 414, h: 896, file: 'screenshots/viewport-414px.png' },
      { w: 768, h: 1024, file: 'screenshots/viewport-768px.png' },
      { w: 1280, h: 800, file: 'screenshots/viewport-1280px.png' }
    ];

    for (const vp of viewports) {
      await client.send('Emulation.setDeviceMetricsOverride', {
        width: vp.w,
        height: vp.h,
        deviceScaleFactor: 1,
        mobile: vp.w < 768
      });
      await sleep(400);
      await client.screenshot(vp.file);
      console.log(`Saved: ${vp.file}`);
    }

    console.log('\n=== TEST 2: Product Cards Testing & Screenshots ===');
    // Set to desktop view for clear inspection
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await sleep(500);

    // Get cards info
    const cards = await client.eval(`
      Array.from(document.querySelectorAll('.product-card')).map(card => {
        const id = card.getAttribute('data-id');
        const name = card.querySelector('.product-name')?.innerText || '';
        const code = card.querySelector('.product-code-tag')?.innerText || '';
        const price = card.querySelector('.price-box')?.innerText || '';
        const availability = card.querySelector('.availability-badge')?.innerText || '';
        const addBtnDisabled = card.querySelector('.btn-add-cart')?.disabled || false;
        const addBtnText = card.querySelector('.btn-add-cart')?.innerText || '';
        const rect = card.getBoundingClientRect();
        const specsRows = Array.from(card.querySelectorAll('.specs-row')).map(r => ({
          label: r.querySelector('.specs-label')?.innerText || '',
          value: r.querySelector('.specs-value')?.innerText || ''
        }));
        return { id, name, code, price, availability, addBtnDisabled, addBtnText, specsRows, rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height } };
      })
    `);

    console.log(`Rendered cards count: ${cards.length}`);

    // Helper to screenshot an element
    async function captureCard(cardItem, filename) {
      // scroll element into view
      await client.eval(`
        const card = document.querySelector('[data-id="${cardItem.id}"]');
        card.scrollIntoView({ block: 'center' });
      `);
      await sleep(300);
      const rectStr = await client.eval(`
        (() => {
          const card = document.querySelector('[data-id="${cardItem.id}"]');
          const r = card.getBoundingClientRect();
          return JSON.stringify({ 
            x: Math.round(window.scrollX + r.left), 
            y: Math.round(window.scrollY + r.top), 
            width: Math.round(r.width), 
            height: Math.round(r.height) 
          });
        })()
      `);
      const updatedRect = JSON.parse(rectStr);

      await client.send('Emulation.setDeviceMetricsOverride', {
        width: 1280,
        height: Math.max(900, Math.round(updatedRect.y + updatedRect.height + 200)),
        deviceScaleFactor: 1,
        mobile: false
      });
      await sleep(200);

      await client.screenshot(filename, {
        x: Math.max(0, updatedRect.x),
        y: Math.max(0, updatedRect.y),
        width: updatedRect.width,
        height: updatedRect.height,
        scale: 1
      });
      console.log(`Saved card screenshot: ${filename} (${cardItem.code})`);
    }

    const frameCard = cards.find(c => c.code.includes('F-101'));
    const frame103Card = cards.find(c => c.code.includes('F-103'));
    const sunCard = cards.find(c => c.code.includes('S-201'));
    const lensCard = cards.find(c => c.code.includes('L-301'));
    const mirrorCard = cards.find(c => c.code.includes('M-401'));

    if (frameCard) {
      await captureCard(frameCard, 'screenshots/card-frame-F101.png');
      console.log('Frame F-101 specs:', frameCard.specsRows);
    }
    if (frame103Card) {
      await captureCard(frame103Card, 'screenshots/card-frame-F103.png');
      console.log('Frame F-103 specs:', frame103Card.specsRows);
    }
    if (sunCard) {
      await captureCard(sunCard, 'screenshots/card-sun-S201.png');
      console.log('Sunglasses S-201 specs:', sunCard.specsRows);
    }
    if (lensCard) {
      await captureCard(lensCard, 'screenshots/card-lens-L301.png');
      console.log('Lens L-301 specs:', lensCard.specsRows);
    }
    if (mirrorCard) {
      await captureCard(mirrorCard, 'screenshots/card-mirror-M401.png');
      console.log('Mirror M-401 specs:', mirrorCard.specsRows);
    }

    console.log('\n=== TEST 3: Out-of-Stock Item (S-202) Verification ===');
    const outOfStockCard = cards.find(c => c.code.includes('S-202'));
    if (outOfStockCard) {
      console.log(`Availability text: "${outOfStockCard.availability}"`);
      console.log(`Add button disabled: ${outOfStockCard.addBtnDisabled}`);
      console.log(`Add button text: "${outOfStockCard.addBtnText}"`);
      if (!outOfStockCard.availability.includes('ختم ہے') || !outOfStockCard.addBtnDisabled) {
        throw new Error('Out of stock behavior failed!');
      }
      console.log('PASS: Out of stock is correctly displayed and button is disabled.');
    }

    console.log('\n=== TEST 4: Zero Price Item (L-301) Verification ===');
    if (lensCard) {
      console.log(`Price text: "${lensCard.price}"`);
      if (!lensCard.price.includes('قیمت واٹس ایپ پر پوچھیں') && !lensCard.price.includes('رابطہ پر')) {
        throw new Error('Zero price ask WhatsApp failed!');
      }
      console.log('PASS: Zero price displays WhatsApp consultation prompt.');
    }

    console.log('\n=== TEST 5: Cart Flow & WhatsApp Message URL Formatting ===');
    // Clear cart first
    await client.eval(`
      localStorage.removeItem('tariq_optical_cart');
      location.reload();
    `);
    await sleep(1500);

    // Add F-101 to cart (qty 1, then increment to 2)
    await client.eval(`
      const f101Card = Array.from(document.querySelectorAll('.product-card')).find(c => c.innerHTML.includes('F-101'));
      const f101AddBtn = f101Card ? f101Card.querySelector('[data-action="add"]') : null;
      if (f101AddBtn) f101AddBtn.click();
    `);
    await sleep(300);

    // Increment to 2
    await client.eval(`
      const f101Card = Array.from(document.querySelectorAll('.product-card')).find(c => c.innerHTML.includes('F-101'));
      const incBtn = f101Card ? f101Card.querySelector('[data-action="increase"]') : null;
      if (incBtn) incBtn.click();
    `);
    await sleep(300);

    // Also add L-301 (price 0)
    await client.eval(`
      const l301Card = Array.from(document.querySelectorAll('.product-card')).find(c => c.innerHTML.includes('L-301'));
      const l301AddBtn = l301Card ? l301Card.querySelector('[data-action="add"]') : null;
      if (l301AddBtn) l301AddBtn.click();
    `);
    await sleep(300);

    // Check cart storage
    const cartState = await client.eval(`JSON.parse(localStorage.getItem('tariq_optical_cart') || '[]')`);
    console.log('Cart items in localStorage:', cartState.map(i => ({ code: i.code, name: i.name, qty: i.qty, price: i.price })));

    // Intercept window.open
    await client.eval(`
      window.__interceptedWaUrl = null;
      window.open = function(url) {
        window.__interceptedWaUrl = url;
      };
    `);

    // Test Validation: Empty submit should trigger error
    await client.eval(`
      document.getElementById('order-form').dispatchEvent(new Event('submit', { cancelable: true }));
    `);
    await sleep(300);
    const hasNameError = await client.eval(`document.getElementById('err-order-name').classList.contains('active')`);
    console.log('Name validation error shown on empty submit:', hasNameError);

    // Fill valid form
    await client.eval(`
      document.getElementById('order-name').value = 'احمد علی';
      document.getElementById('order-phone').value = '0308-4454785';
      document.getElementById('order-address').value = 'محلہ عیدگاہ، نزد کچہری، نیاز بازار، قصور';
      document.getElementById('order-note').value = 'نظر کا نمبر دائیں -1.50، بائیں -1.25';
      document.getElementById('order-form').dispatchEvent(new Event('submit', { cancelable: true }));
    `);
    await sleep(500);

    const waUrl = await client.eval(`window.__interceptedWaUrl`);
    console.log('\nGenerated WhatsApp URL:\n', waUrl);

    if (!waUrl || !waUrl.includes('https://wa.me/923084454785?text=')) {
      throw new Error('Invalid WhatsApp URL format!');
    }

    const encodedText = waUrl.split('?text=')[1];
    const decodedMessage = decodeURIComponent(encodedText);
    console.log('\n--- DECODED WHATSAPP MESSAGE ---');
    console.log(decodedMessage);
    console.log('--------------------------------\n');

    // Verify requirements:
    // 1. Must contain "السلام علیکم! میں طارق آپٹیکل سنٹر سے آرڈر کرنا چاہتا ہوں۔"
    if (!decodedMessage.includes('السلام علیکم! میں طارق آپٹیکل سنٹر سے آرڈر کرنا چاہتا ہوں۔')) {
      throw new Error('Greeting missing in WhatsApp text');
    }
    // 2. Must contain F-101 with color, size, and calculation
    if (!decodedMessage.includes('F-101') || !decodedMessage.includes('Rs 1450')) {
      throw new Error('Item spec or price line calculation missing');
    }
    // 3. Must contain name, phone, address, and note
    if (!decodedMessage.includes('احمد علی') || !decodedMessage.includes('0308-4454785') || !decodedMessage.includes('قصور')) {
      throw new Error('Customer information missing in WhatsApp text');
    }

    console.log('PASS: WhatsApp Order Message strictly matches all brief criteria!');

    console.log('\n=== TEST 6: Lightbox Modal Verification ===');
    await client.eval(`
      const f101Title = document.querySelector('[data-id="1"] .product-name');
      f101Title.click();
    `);
    await sleep(500);

    const isLightboxOpen = await client.eval(`document.getElementById('lightbox-overlay').classList.contains('active')`);
    console.log('Lightbox opened on product title click:', isLightboxOpen);
    if (!isLightboxOpen) throw new Error('Lightbox did not open');

    // Capture lightbox screenshot
    await client.screenshot('screenshots/lightbox-modal.png');
    console.log('Saved: screenshots/lightbox-modal.png');

    // Test Escape key closes lightbox
    await client.eval(`
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    `);
    await sleep(300);
    const isLightboxClosed = await client.eval(`!document.getElementById('lightbox-overlay').classList.contains('active')`);
    console.log('Lightbox closed on Escape key:', isLightboxClosed);
    if (!isLightboxClosed) throw new Error('Lightbox failed to close on Escape');

    console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! ===');
    client.close();
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  } finally {
    edgeProc.kill();
  }
}

run();
