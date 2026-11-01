const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9223;
const USER_DATA = path.resolve('temp_edge_cards');

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

async function capture() {
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
    const client = new CDPClient(page.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1200,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    // Wait until cards are rendered
    let cardCount = 0;
    for (let i = 0; i < 20; i++) {
      cardCount = await client.eval(`document.querySelectorAll('.product-card').length`);
      if (cardCount > 0) break;
      await sleep(200);
    }
    console.log(`Found ${cardCount} product cards on page.`);

    const targetCards = [
      { code: 'F-101', filename: 'screenshots/card-frame-F101.png' },
      { code: 'F-103', filename: 'screenshots/card-frame-F103.png' },
      { code: 'S-201', filename: 'screenshots/card-sun-S201.png' },
      { code: 'L-301', filename: 'screenshots/card-lens-L301.png' },
      { code: 'M-401', filename: 'screenshots/card-mirror-M401.png' }
    ];

    for (const item of targetCards) {
      const rectStr = await client.eval(`
        (() => {
          const card = Array.from(document.querySelectorAll('.product-card')).find(c => c.innerText.includes('${item.code}'));
          if (!card) return null;

          const prev = document.getElementById('card-isolated-container');
          if (prev) prev.remove();

          const clone = card.cloneNode(true);
          clone.id = 'isolated-card';
          clone.style.width = '360px';
          clone.style.margin = '20px';

          const wrap = document.createElement('div');
          wrap.id = 'card-isolated-container';
          wrap.style.position = 'fixed';
          wrap.style.top = '0';
          wrap.style.left = '0';
          wrap.style.width = '400px';
          wrap.style.height = '100vh';
          wrap.style.overflow = 'hidden';
          wrap.style.background = getComputedStyle(document.body).backgroundColor;
          wrap.style.zIndex = '999999';
          wrap.appendChild(clone);
          document.body.appendChild(wrap);

          const r = clone.getBoundingClientRect();
          return JSON.stringify({
            x: Math.round(r.left),
            y: Math.round(r.top),
            width: Math.round(r.width),
            height: Math.round(r.height)
          });
        })()
      `);
      await sleep(300);

      const clip = JSON.parse(rectStr);
      clip.x = Math.max(0, clip.x);
      clip.y = Math.max(0, clip.y);
      clip.scale = 1;

      // Ensure viewport height is sufficient
      await client.send('Emulation.setDeviceMetricsOverride', {
        width: 1200,
        height: Math.max(900, clip.height + 100),
        deviceScaleFactor: 1,
        mobile: false
      });
      await sleep(200);

      await client.screenshot(item.filename, clip);
      console.log(`Captured ${item.code} -> ${item.filename} (${clip.width}x${clip.height})`);

      // Clean up isolated container
      await client.eval(`
        const el = document.getElementById('card-isolated-container');
        if (el) el.remove();
      `);
    }

    client.close();
  } finally {
    edgeProc.kill();
  }
}

capture();
