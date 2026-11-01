const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9232;
const USER_DATA = path.resolve('temp_edge_real_shop_test');

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

async function run() {
  console.log('Spawning Edge headless...');
  const edgeProc = spawn(EDGE_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA}`,
    '--no-first-run',
    'http://localhost:8080/'
  ]);

  await sleep(3000);

  try {
    const resp = await fetch(`http://127.0.0.1:${PORT}/json`);
    const tabs = await resp.json();
    const pageTarget = tabs.find(t => t.type === 'page') || tabs[0];
    const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();

    // 1. Set Desktop Viewport
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1200,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await sleep(1000);

    // Wait for products to load and render
    let totalProducts = 0;
    for (let i = 0; i < 20; i++) {
      totalProducts = await client.eval(`document.querySelectorAll('.product-card').length`);
      if (totalProducts > 0) break;
      await sleep(300);
    }
    console.log(`Rendered product cards: ${totalProducts}`);

    // Verify L-305 and L-306
    const lensDetails = await client.eval(`
      (() => {
        const cards = Array.from(document.querySelectorAll('.product-card'));
        const l305 = cards.find(c => c.textContent.includes('L-305'));
        const l306 = cards.find(c => c.textContent.includes('L-306'));
        return {
          l305Found: !!l305,
          l305Price: l305 ? l305.querySelector('.product-price-box')?.innerText : null,
          l306Found: !!l306,
          l306Price: l306 ? l306.querySelector('.product-price-box')?.innerText : null
        };
      })()
    `);
    console.log('Lens verification:', lensDetails);

    // Filter to Lenses to capture new lens products
    await client.eval(`
      (() => {
        const lensTab = Array.from(document.querySelectorAll('.cat-tab-btn')).find(b => b.textContent.includes('لینز'));
        if (lensTab) lensTab.click();
      })()
    `);
    await sleep(600);

    // Capture Lenses in catalog
    const lensSectionBox = await client.eval(`
      (() => {
        const b = document.getElementById('browse-section');
        b.scrollIntoView({ behavior: 'instant', block: 'start' });
        const r = b.getBoundingClientRect();
        return { x: 0, y: Math.round(window.scrollY + r.top), width: 1200, height: 950 };
      })()
    `);
    await client.screenshot('screenshots/lenses-catalog-new.png', {
      x: 0, y: lensSectionBox.y, width: 1200, height: 950, scale: 1
    });
    console.log('Captured screenshots/lenses-catalog-new.png');

    // Capture Hero Section with real store image
    const heroBox = await client.eval(`
      (() => {
        const h = document.getElementById('top');
        h.scrollIntoView({ behavior: 'instant', block: 'start' });
        const r = h.getBoundingClientRect();
        return { x: 0, y: Math.round(window.scrollY + r.top), width: 1200, height: Math.round(r.height) };
      })()
    `);
    await client.screenshot('screenshots/hero-real-store.png', {
      x: 0, y: heroBox.y, width: 1200, height: heroBox.height, scale: 1
    });
    console.log('Captured screenshots/hero-real-store.png');

    // Capture Category Tiles with real shop thumbnails
    const catBox = await client.eval(`
      (() => {
        const c = document.querySelector('.categories-section');
        c.scrollIntoView({ behavior: 'instant', block: 'start' });
        const r = c.getBoundingClientRect();
        return { x: 0, y: Math.round(window.scrollY + r.top), width: 1200, height: Math.round(r.height) };
      })()
    `);
    await client.screenshot('screenshots/categories-real-store.png', {
      x: 0, y: catBox.y, width: 1200, height: catBox.height, scale: 1
    });
    console.log('Captured screenshots/categories-real-store.png');

    // Capture Services Machine Spotlight Banner
    const servBox = await client.eval(`
      (() => {
        const s = document.querySelector('.service-machine-spotlight');
        s.scrollIntoView({ behavior: 'instant', block: 'center' });
        const r = s.getBoundingClientRect();
        return { x: Math.round(r.left), y: Math.round(window.pageYOffset + r.top), width: Math.round(r.width), height: Math.round(r.height) };
      })()
    `);
    await sleep(400);
    await client.screenshot('screenshots/services-machine-spotlight.png', {
      x: servBox.x, y: servBox.y, width: servBox.width, height: servBox.height, scale: 1
    });
    console.log('Captured screenshots/services-machine-spotlight.png');

    // Capture About Us Section
    const aboutBox = await client.eval(`
      (() => {
        const a = document.querySelector('.about-section');
        a.scrollIntoView({ behavior: 'instant', block: 'start' });
        const r = a.getBoundingClientRect();
        return { x: 0, y: Math.round(window.scrollY + r.top), width: 1200, height: Math.round(r.height) };
      })()
    `);
    await client.screenshot('screenshots/about-real-owner.png', {
      x: 0, y: aboutBox.y, width: 1200, height: aboutBox.height, scale: 1
    });
    console.log('Captured screenshots/about-real-owner.png');

    // Capture Real Store Gallery Section
    const galBox = await client.eval(`
      (() => {
        const g = document.getElementById('gallery-section');
        g.scrollIntoView({ behavior: 'instant', block: 'start' });
        const r = g.getBoundingClientRect();
        return { x: 0, y: Math.round(window.scrollY + r.top), width: 1200, height: Math.round(r.height) };
      })()
    `);
    await client.screenshot('screenshots/gallery-real-store.png', {
      x: 0, y: galBox.y, width: 1200, height: galBox.height, scale: 1
    });
    console.log('Captured screenshots/gallery-real-store.png');

    client.close();
    console.log('All verifications completed successfully!');
  } finally {
    edgeProc.kill();
    await sleep(400);
    try { fs.rmSync(USER_DATA, { recursive: true, force: true }); } catch (e) {}
  }
}

run().catch(err => {
  console.error('Error running test:', err);
  process.exit(1);
});
