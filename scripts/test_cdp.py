import subprocess
import time
import json
import urllib.request
import os
import base64

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
port = 9222
user_data = os.path.abspath("temp_edge_profile")

cmd = [
    edge_path,
    "--headless=new",
    "--disable-gpu",
    f"--remote-debugging-port={port}",
    f"--user-data-dir={user_data}",
    "--no-first-run",
    "http://localhost:8080/"
]

proc = subprocess.Popen(cmd)
time.sleep(2)

try:
    # Query DevTools list
    with urllib.request.urlopen(f"http://127.0.0.1:{port}/json") as resp:
        targets = json.loads(resp.read().decode())
    
    page = next(t for t in targets if t.get("type") == "page")
    ws_url = page["webSocketDebuggerUrl"]
    print(f"Connected to page: {page['url']}, WS: {ws_url}")
finally:
    proc.terminate()
    proc.wait()
