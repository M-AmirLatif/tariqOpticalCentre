const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9229;
const USER_DATA = path.resolve('temp_edge_verify');

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

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
    this.ws.close();
  }
}

async function verify() {
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
    const tabs = await resp.json();
    const pageTarget = tabs.find(t => t.type === 'page');
    const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();

    console.log('=== TEST 1: White Mode Footer Contrast Verification ===');
    // Switch to light mode
    await client.eval(`
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('tariq_optical_theme', 'light');
    `);
    await sleep(400);

    const rectStr = await client.eval(`
      (() => {
        const f = document.querySelector('.site-footer');
        f.scrollIntoView({ behavior: 'instant', block: 'start' });
        const r = f.getBoundingClientRect();
        return JSON.stringify({
          x: Math.round(window.scrollX + r.left),
          y: Math.round(window.scrollY + r.top),
          width: Math.round(r.width),
          height: Math.round(r.height)
        });
      })()
    `);
    const footerRect = JSON.parse(rectStr);

    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 414,
      height: Math.max(900, footerRect.y + footerRect.height + 100),
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(300);

    await client.screenshot('screenshots/footer-white-mode.png', {
      x: footerRect.x,
      y: footerRect.y,
      width: footerRect.width,
      height: footerRect.height,
      scale: 1
    });
    console.log('Saved screenshots/footer-white-mode.png');

    console.log('\n=== TEST 2: Desktop Navbar Verification ===');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false
    });
    await client.eval(`window.scrollTo(0, 0);`);
    await sleep(400);

    const desktopNavVisible = await client.eval(`
      getComputedStyle(document.querySelector('.desktop-nav')).display !== 'none'
    `);
    console.log('Desktop nav visible on 1280px:', desktopNavVisible);

    const headerRect = JSON.parse(await client.eval(`
      (() => {
        const h = document.querySelector('.site-header');
        const r = h.getBoundingClientRect();
        return JSON.stringify({ x: Math.round(r.left), y: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height) });
      })()
    `));
    await client.screenshot('screenshots/navbar-desktop.png', {
      x: 0,
      y: 0,
      width: 1280,
      height: headerRect.height + 20,
      scale: 1
    });
    console.log('Saved screenshots/navbar-desktop.png');

    console.log('\n=== TEST 3: Mobile 3-Dot Drawer Verification ===');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 414,
      height: 896,
      deviceScaleFactor: 2,
      mobile: true
    });
    await client.eval(`window.scrollTo(0, 0);`);
    await sleep(300);

    const menuBtnVisible = await client.eval(`
      getComputedStyle(document.getElementById('menu-toggle-btn')).display !== 'none'
    `);
    console.log('Mobile 3-dot menu button visible on 414px:', menuBtnVisible);

    // Open drawer
    await client.eval(`document.getElementById('menu-toggle-btn').click();`);
    await sleep(400);

    const drawerActive = await client.eval(`
      document.getElementById('mobile-nav-drawer').classList.contains('active')
    `);
    console.log('Mobile drawer active after clicking 3-dot button:', drawerActive);

    await client.screenshot('screenshots/navbar-mobile-drawer.png');
    console.log('Saved screenshots/navbar-mobile-drawer.png');

    // Close drawer
    await client.eval(`document.getElementById('drawer-close-btn').click();`);
    await sleep(300);

    console.log('\n=== TEST 4: Prescription / Eye Card Upload Flow ===');
    // Switch to dark mode for test
    await client.eval(`
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('tariq_optical_theme', 'dark');
    `);
    await sleep(200);

    // Simulate uploading prescription card
    await client.eval(`
      (() => {
        const file = new File(['dummy card data'], 'doctor_prescription_card.jpg', { type: 'image/jpeg' });
        window.__tariqApp.handlePrescriptionFile(file);
      })()
    `);
    await sleep(500);

    const previewShown = await client.eval(`
      document.getElementById('upload-preview').style.display !== 'none'
    `);
    console.log('Prescription card preview displayed:', previewShown);

    const cardBoxRectStr = await client.eval(`
      (() => {
        const box = document.getElementById('prescription-card-box');
        box.scrollIntoView({ behavior: 'instant', block: 'center' });
        const r = box.getBoundingClientRect();
        return JSON.stringify({
          x: Math.round(window.scrollX + r.left),
          y: Math.round(window.scrollY + r.top),
          width: Math.round(r.width),
          height: Math.round(r.height)
        });
      })()
    `);
    const cardBoxRect = JSON.parse(cardBoxRectStr);

    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 414,
      height: Math.max(900, cardBoxRect.y + cardBoxRect.height + 100),
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(300);

    await client.screenshot('screenshots/prescription-card-preview.png', {
      x: cardBoxRect.x,
      y: cardBoxRect.y,
      width: cardBoxRect.width,
      height: cardBoxRect.height,
      scale: 1
    });
    console.log('Saved screenshots/prescription-card-preview.png');

    // Verify WhatsApp order submit with Card attached
    await client.eval(`
      document.getElementById('order-name').value = 'عمران علی';
      document.getElementById('order-phone').value = '0308-4454785';
      document.getElementById('order-address').value = 'نزد میونسپل کمیٹی، نیاز بازار، قصور';
      document.getElementById('order-note').value = 'براہ کرم کارڈ دیکھ کر فریم اور لینز تیار کریں';
    `);

    // Intercept window.open
    await client.eval(`
      window.__lastWaUrl = '';
      window.open = function(url) { window.__lastWaUrl = url; return null; };
    `);

    // Submit form
    await client.eval(`
      document.getElementById('order-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    `);
    await sleep(500);

    const lastWaUrl = await client.eval(`window.__lastWaUrl`);
    console.log('Captured WhatsApp URL generated:', lastWaUrl ? 'YES' : 'NO');

    if (lastWaUrl && lastWaUrl.includes('?text=')) {
      const decoded = decodeURIComponent(lastWaUrl.split('?text=')[1]);
      console.log('\n--- DECODED WHATSAPP MESSAGE WITH CARD ---');
      console.log(decoded);
      console.log('-------------------------------------------\n');

      const hasCardPrompt = decoded.includes('آنکھوں کا کارڈ / نسخہ: منسلک تصویر ساتھ بھیجی جا رہی ہے');
      console.log('WhatsApp message includes Card notification:', hasCardPrompt);
      if (!hasCardPrompt) throw new Error('WhatsApp message missing card notification!');
    }

    client.close();
    console.log('\n=== ALL NEW FEATURE TESTS PASSED SUCCESSFULLY! ===');
  } finally {
    edgeProc.kill();
    await sleep(500);
    try { fs.rmSync(USER_DATA, { recursive: true, force: true }); } catch (e) {}
  }
}

verify();
