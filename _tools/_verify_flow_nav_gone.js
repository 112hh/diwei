/* 验收：标准化 / 数据库 / 加工处理 页顶部链路导航条全部不再显示 */
"use strict";
const { spawn } = require("child_process");
const fs = require("fs");
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p => fs.existsSync(p));
const PORT = 9375, PROFILE = "C:/Users/Windows/Desktop/diwei/_tools/_verify_profile_fn";
const PAGES = ["lowdim-standardization-twod", "lowdim-database-twod", "lowdim-ingest-twod", "lowdim-standardization-catalyst", "lowdim-database-catalyst"];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJSON = async u => (await fetch(u)).json();
let id = 0; const pending = new Map(); let ws;
const send = (m, p = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
async function evalJS(e) {
  const m = await send("Runtime.evaluate", { expression: e, awaitPromise: true, returnByValue: true });
  if (m.result && m.result.exceptionDetails) { const d = m.result.exceptionDetails; return { __EXC__: (d.exception && d.exception.description) || d.text || "EXC" }; }
  return m.result.result.value;
}
async function shot(file) { const m = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true }); fs.writeFileSync(file, Buffer.from(m.result.data, "base64")); }
(async () => {
  const proc = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run", "--mute-audio", "--hide-scrollbars",
    "--remote-debugging-port=" + PORT, "--remote-allow-origins=*", "--user-data-dir=" + PROFILE,
    "--allow-file-access-from-files", "--window-size=1440,940", "about:blank"], { stdio: "ignore" });
  const out = {};
  try {
    for (let i = 0; i < 60; i++) { try { await getJSON("http://127.0.0.1:" + PORT + "/json/version"); break; } catch (e) { await sleep(500); } }
    const list = await getJSON("http://127.0.0.1:" + PORT + "/json/list");
    ws = new WebSocket(list.find(t => t.type === "page").webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    ws.addEventListener("message", ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id).res(m); pending.delete(m.id); } });
    await send("Page.enable"); await send("Runtime.enable");
    await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 940, deviceScaleFactor: 1, mobile: false });
    for (const pid of PAGES) {
      /* 所有页面都内嵌在每个单页 HTML 中，统一用 lowdim-ingest-twod.html 作宿主 */
      const html = "lowdim-ingest-twod.html";
      await send("Page.navigate", { url: "file:///C:/Users/Windows/Desktop/diwei/" + html });
      for (let i = 0; i < 40; i++) { await sleep(500); if (await evalJS("document.readyState") === "complete") break; }
      await sleep(1500);
      out[pid] = await evalJS(`(async () => {
        const sleep = ms => new Promise(r => setTimeout(r, ms));
        const lb = document.querySelector("[data-standard-login-submit]"); if (lb) { lb.click(); await sleep(1500); }
        const nav = document.querySelector('.sidebar .nav-btn[data-page="${pid}"]'); if (nav) { nav.click(); await sleep(1500); }
        await sleep(1200); /* 等 MutationObserver 的 reassert 兜底跑完 */
        const act = document.querySelector("section.page.active");
        const fn = document.querySelector(".flow-nav");
        return {
          active: act ? act.id : "NONE",
          flowNavPresentAnywhere: !!fn,
          flowNavDisplay: fn ? getComputedStyle(fn).display : "ABSENT",
          gotoBtnAnywhere: !!document.querySelector("[data-flownav-to]"),
          pageHeadText: act ? act.textContent.trim().slice(0, 60) : ""
        };
      })()`);
    }
    /* 取证截图：标准化 twod 页顶部 */
    await evalJS(`(async () => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      const nav = document.querySelector('.sidebar .nav-btn[data-page="lowdim-standardization-twod"]'); if (nav) { nav.click(); await sleep(1500); }
      return 1;
    })()`);
    await sleep(800);
    await shot("C:/Users/Windows/Desktop/diwei/_tools/_verify_flow_nav_gone.png");
    console.log("===RESULT===");
    console.log(JSON.stringify(out, null, 2));
  } catch (e) { console.log("FATAL:" + e.message + JSON.stringify(out)); }
  finally { try { ws && ws.close(); } catch (e) {} try { proc.kill(); } catch (e) {} }
  process.exit(0);
})().catch(e => { console.log("FATAL:" + e.message); process.exit(1); });
