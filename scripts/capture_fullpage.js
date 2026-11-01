const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9224;
const USER_DATA = path.resolve('temp_edge_fullpage');

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

  async fullScreenshot(outPath) {
    // Get layout metrics
    const metrics = await this.send('Page.getLayoutMetrics');
    const width = Math.ceil(metrics.contentSize.width);
    const height = Math.ceil(metrics.contentSize.height);

    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false
    });
    await sleep(400);

    const res = await this.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true
    });
    fs.writeFileSync(outPath, Buffer.from(res.data, 'base64'));
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
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

    // Wait for cards
    for (let i = 0; i < 20; i++) {
      const c = await client.eval(`document.querySelectorAll('.product-card').length`);
      if (c > 0) break;
      await sleep(200);
    }

    // Scroll through the entire page once so content-visibility and lazy images trigger
    await client.eval(`
      window.scrollTo(0, document.body.scrollHeight);
    `);
    await sleep(800);
    await client.eval(`
      window.scrollTo(0, 0);
    `);
    await sleep(500);

    await client.fullScreenshot('screenshots/fullpage-desktop.png');
    console.log('Saved screenshots/fullpage-desktop.png');

    client.close();
  } finally {
    edgeProc.kill();
  }
}

run();
