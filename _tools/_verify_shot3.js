/* 取证截图：录入模块的 数据统计 / 权限管理 / 流程管理 三个模块 */
"use strict";
const { spawn } = require("child_process");
const fs = require("fs");
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find(p => fs.existsSync(p));
const PORT = 9337, PROFILE = "C:/Users/Windows/Desktop/diwei/_tools/_verify_profile_shot3";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJSON = async u => (await fetch(u)).json();
let id = 0; const pending = new Map(); let ws;
const send = (m, p = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
async function evalJS(e) { const m = await send("Runtime.evaluate", { expression: e, awaitPromise: true, returnByValue: true }); return m.result && m.result.result ? m.result.result.value : null; }
async function shot(file) { const m = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true }); fs.writeFileSync(file, Buffer.from(m.result.data, "base64")); }

(async () => {
  const proc = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run", "--mute-audio", "--hide-scrollbars",
    "--remote-debugging-port=" + PORT, "--remote-allow-origins=*", "--user-data-dir=" + PROFILE,
    "--allow-file-access-from-files", "--window-size=1440,940", "about:blank"], { stdio: "ignore" });
  try {
    for (let i = 0; i < 60; i++) { try { await getJSON("http://127.0.0.1:" + PORT + "/json/version"); break; } catch (e) { await sleep(500); } }
    const list = await getJSON("http://127.0.0.1:" + PORT + "/json/list");
    ws = new WebSocket(list.find(t => t.type === "page").webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    ws.addEventListener("message", ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id).res(m); pending.delete(m.id); } });
    await send("Page.enable"); await send("Runtime.enable");
    await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });

    await send("Page.navigate", { url: "file:///C:/Users/Windows/Desktop/diwei/lowdim-ingest-twod.html" });
    for (let i = 0; i < 40; i++) { await sleep(500); if (await evalJS("document.readyState") === "complete") break; }
    await sleep(1500);
    await evalJS("(function(){var b=document.querySelector('[data-standard-login-submit]');if(b)b.click();return 1;})()");
    await sleep(1500);
    await evalJS("(function(){var t=document.querySelector('.rw-tab[data-rw-tab=\"entry\"]');if(t)t.click();return 1;})()");
    await sleep(800);
    for (const v of ["stats", "perm", "flow"]) {
      await evalJS("(function(){var b=document.querySelector('[data-rw-act=\"entry-view\"][data-view=\"" + v + "\"]');if(b)b.click();return 1;})()");
      await sleep(600);
      await evalJS("(function(){window.scrollTo(0,0);return 1;})()");
      await sleep(300);
      await shot("C:/Users/Windows/Desktop/diwei/_tools/_verify_entry_" + v + ".png");
    }
    console.log("SHOTS3_OK");
  } finally { try { ws && ws.close(); } catch (e) {} try { proc.kill(); } catch (e) {} }
  process.exit(0);
})().catch(e => { console.log("FATAL:" + e.message); process.exit(1); });
