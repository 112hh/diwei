/* 验收 + 取证：文件转换摘要条删除圈红的「转换类型」「源文件」两张卡 */
"use strict";
const { spawn } = require("child_process");
const fs = require("fs");
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p => fs.existsSync(p));
const PORT = 9361, PROFILE = "C:/Users/Windows/Desktop/diwei/_tools/_verify_profile_conv";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJSON = async u => (await fetch(u)).json();
let id = 0; const pending = new Map(); let ws;
const send = (m, p = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
async function evalJS(e) {
  const m = await send("Runtime.evaluate", { expression: e, awaitPromise: true, returnByValue: true });
  if (m.result && m.result.exceptionDetails) {
    const d = m.result.exceptionDetails;
    return { __EXC__: (d.exception && d.exception.description) || d.text || "EXC" };
  }
  return m.result.result.value;
}
async function shot(file) { const m = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true }); fs.writeFileSync(file, Buffer.from(m.result.data, "base64")); }

(async () => {
  const proc = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run", "--mute-audio", "--hide-scrollbars",
    "--remote-debugging-port=" + PORT, "--remote-allow-origins=*", "--user-data-dir=" + PROFILE,
    "--allow-file-access-from-files", "--window-size=1440,940", "about:blank"], { stdio: "ignore" });
  const out = { modules: {} };
  try {
    for (let i = 0; i < 60; i++) { try { await getJSON("http://127.0.0.1:" + PORT + "/json/version"); break; } catch (e) { await sleep(500); } }
    const list = await getJSON("http://127.0.0.1:" + PORT + "/json/list");
    ws = new WebSocket(list.find(t => t.type === "page").webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    ws.addEventListener("message", ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id).res(m); pending.delete(m.id); } });
    await send("Page.enable"); await send("Runtime.enable");
    await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 940, deviceScaleFactor: 1, mobile: false });

    await send("Page.navigate", { url: "file:///C:/Users/Windows/Desktop/diwei/low-dim-materials.html" });
    for (let i = 0; i < 40; i++) { await sleep(500); if (await evalJS("document.readyState") === "complete") break; }
    await sleep(1500);

    const r = await evalJS(`(async () => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      const o = { errs: [] };
      window.addEventListener("error", e2 => o.errs.push(String(e2.message)));
      const lb = document.querySelector("[data-standard-login-submit]");
      if (lb) { lb.click(); await sleep(1600); }
      const nav = document.querySelector('.sidebar .nav-btn[data-page="twod"]');
      if (nav) { nav.click(); await sleep(1400); }
      o.active = [...document.querySelectorAll("section.page.active")].map(x => x.id).join(",");
      /* 切到文件转换子页签 */
      const tab = document.querySelector('.module-tab-btn[data-module-target="convert"]');
      if (tab) { tab.click(); await sleep(900); }
      o.tabText = tab ? tab.textContent.trim() : "NO_TAB";
      /* 摘要条断言 */
      const sums = [...document.querySelectorAll(".material-convert-summary")];
      o.summaryCount = sums.length;
      o.summaries = sums.map(s => [...s.querySelectorAll(".material-convert-summary-item")].map(it => ({
        label: (it.querySelector("span") || {}).textContent || "",
        value: (it.querySelector("strong") || {}).textContent || ""
      })));
      const twod = sums[0];
      o.twodLabels = twod ? [...twod.querySelectorAll(".material-convert-summary-item > span")].map(x => x.textContent.trim()) : [];
      o.twodOk = !!twod
        && o.twodLabels.join("|") === "源文件格式|目标文件格式"
        && twod.textContent.indexOf("转换类型") < 0
        && twod.textContent.indexOf("待上传") < 0;
      /* 工作台整体不应再有「待上传」字样 */
      const shell = document.querySelector('.material-convert-shell[data-material-convert-module="twod"]');
      o.shellHas待上传 = shell ? shell.textContent.indexOf("待上传") >= 0 : null;
      o.shellHas转换类型Card = shell ? [...shell.querySelectorAll(".material-convert-summary-item > span")].some(x => x.textContent.trim() === "转换类型") : null;
      /* 表单字段与按钮仍在 */
      o.hasSourceFormatField = !!document.querySelector('[data-material-convert-source-format="twod"]');
      o.hasTargetSelect = !!document.querySelector('select[data-material-convert-field="targetFormat"][data-module="twod"]');
      o.hasStartBtn = !!document.querySelector('[data-material-convert-start="twod"]');
      o.hasClearBtn = !!document.querySelector('[data-material-convert-clear="twod"]');
      /* 转换记录表头仍保留「转换类型 / 源文件」列（业务列表，不属于圈红范围） */
      o.recordThs = shell ? [...shell.querySelectorAll("thead th")].map(x => x.textContent.trim()).join("|") : "";
      return o;
    })()`);
    out.twod = r;

    /* 其余四个模块摘要条也应只剩 源格式 / 目标格式 */
    for (const mk of ["opto", "mlff", "catalyst", "electrolyte"]) {
      const rr = await evalJS(`(async () => {
        const sleep = ms => new Promise(r => setTimeout(r, ms));
        const nav = document.querySelector('.sidebar .nav-btn[data-page="${mk}"]');
        if (nav) { nav.click(); await sleep(1200); }
        const tab = document.querySelector('.module-tab-btn[data-module-target="convert"]');
        if (tab) { tab.click(); await sleep(900); }
        const s = document.querySelector('.material-convert-shell[data-material-convert-module="${mk}"] .material-convert-summary');
        return s ? [...s.querySelectorAll(".material-convert-summary-item > span")].map(x => x.textContent.trim()).join("|") : "NO_SUMMARY";
      })()`);
      out.modules[mk] = rr;
    }

    /* 取证截图：回到 twod 文件转换 */
    await evalJS(`(async () => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      const nav = document.querySelector('.sidebar .nav-btn[data-page="twod"]');
      if (nav) { nav.click(); await sleep(1200); }
      const tab = document.querySelector('.module-tab-btn[data-module-target="convert"]');
      if (tab) { tab.click(); await sleep(900); }
      return 1;
    })()`);
    await sleep(500);
    await shot("C:/Users/Windows/Desktop/diwei/_tools/_verify_convert_summary.png");

    console.log("===RESULT===");
    console.log(JSON.stringify(out, null, 2));
  } catch (e) {
    console.log("FATAL:" + e.message + "\n" + JSON.stringify(out, null, 2));
  } finally { try { ws && ws.close(); } catch (e) {} try { proc.kill(); } catch (e) {} }
  process.exit(0);
})().catch(e => { console.log("FATAL:" + e.message); process.exit(1); });
