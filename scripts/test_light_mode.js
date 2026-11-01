const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9227;
const USER_DATA = path.resolve('temp_edge_light_test');

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
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
    const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    function send(method, params = {}) {
      return new Promise((res, rej) => {
        const mid = id++;
        const handler = (evt) => {
          const d = JSON.parse(evt.data);
          if (d.id === mid) {
            ws.removeEventListener('message', handler);
            if (d.error) rej(d.error); else res(d.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: mid, method, params }));
      });
    }

    // Force light mode
    await send('Runtime.evaluate', {
      expression: `
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('tariq_optical_theme', 'light');
      `
    });
    await sleep(500);

    // Emulate desktop 1280
    await send('Emulation.setDeviceMetricsOverride', {
      width: 414,
      height: 896,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(500);

    // Capture mobile full page in light mode
    const layoutMetrics = await send('Page.getLayoutMetrics');
    const fullHeight = Math.ceil(layoutMetrics.contentSize.height);

    await send('Emulation.setDeviceMetricsOverride', {
      width: 414,
      height: fullHeight,
      deviceScaleFactor: 1,
      mobile: true
    });
    await sleep(500);

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('screenshots/light-mode-mobile.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved screenshots/light-mode-mobile.png, height:', fullHeight);

    ws.close();
  } finally {
    edgeProc.kill();
    await sleep(500);
    try { fs.rmSync(USER_DATA, { recursive: true, force: true }); } catch (e) {}
  }
})();
