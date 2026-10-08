/* 取证截图：手动录入弹窗的「关联配置规范」勾选 + 录入审核弹窗 */
"use strict";
const { spawn } = require("child_process");
const fs = require("fs");
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find(p => fs.existsSync(p));
const PORT = 9336, PROFILE = "C:/Users/Windows/Desktop/diwei/_tools/_verify_profile_shot2";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJSON = async u => (await fetch(u)).json();
let id = 0; const pending = new Map(); let ws;
const send = (m, p = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
async function evalJS(e) { const m = await send("Runtime.evaluate", { expression: e, awaitPromise: true, returnByValue: true }); return m.result && m.result.result ? m.result.result.value : null; }
async function shot(file, full) { const m = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: !!full }); fs.writeFileSync(file, Buffer.from(m.result.data, "base64")); }

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
    /* 登录 → 加工处理页 */
    await evalJS("(function(){var b=document.querySelector('[data-standard-login-submit]');if(b)b.click();return 1;})()");
    await sleep(1500);
    /* 进资源录入页签 → 打开新增材料 → 全选规范 → 截图 */
    await evalJS("(function(){var t=document.querySelector('.rw-tab[data-rw-tab=\"entry\"]');if(t)t.click();return 1;})()");
    await sleep(700);
    await evalJS("(function(){var b=document.querySelector('[data-rw-act=\"entry-manual\"]');if(b)b.click();return 1;})()");
    await sleep(700);
    await evalJS("(function(){var b=document.querySelector('#rwEntryMask [data-rw-act=\"std-all\"]');if(b)b.click();return 1;})()");
    await sleep(500);
    await evalJS("(function(){var b=document.getElementById('rwEntryMask');var m=b&&b.querySelector('.rw-modal-body');if(m)m.scrollTop=340;return 1;})()");
    await sleep(400);
    await shot("C:/Users/Windows/Desktop/diwei/_tools/_verify_manual_std.png", false);

    /* 关掉、填充示例结构→解析→提交，进录入审核→打开审核弹窗→截图 */
    await evalJS("(function(){var b=document.querySelector('#rwEntryMask [data-rw-act=\"entry-demo-cif\"]');if(b)b.click();return 1;})()");
    await sleep(300);
    await evalJS("(function(){var b=document.querySelector('#rwEntryMask [data-rw-act=\"entry-parse-cif\"]');if(b)b.click();return 1;})()");
    await sleep(400);
    await evalJS("(function(){var b=document.querySelector('#rwEntryMask [data-rw-act=\"entry-submit\"]');if(b)b.click();return 1;})()");
    await sleep(800);
    await evalJS("(function(){var b=document.querySelector('[data-rw-act=\"entry-audit-open\"]');if(b)b.click();return 1;})()");
    await sleep(700);
    await evalJS("(function(){var b=document.getElementById('rwEntryAuditMask');var m=b&&b.querySelector('.rw-modal-body');if(m)m.scrollTop=0;return 1;})()");
    await sleep(300);
    await shot("C:/Users/Windows/Desktop/diwei/_tools/_verify_entry_audit.png", false);
    console.log("SHOTS_OK");
  } finally { try { ws && ws.close(); } catch (e) {} try { proc.kill(); } catch (e) {} }
  process.exit(0);
})().catch(e => { console.log("FATAL:" + e.message); process.exit(1); });
