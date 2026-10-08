/* 验收 + 取证：文件转换 twod 工作台重构——只留「源文件格式 / 目标文件格式」两张卡，目标文件格式为下拉 */
"use strict";
const { spawn } = require("child_process");
const fs = require("fs");
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p => fs.existsSync(p));
const PORT = 9365, PROFILE = "C:/Users/Windows/Desktop/diwei/_tools/_verify_profile_conv2";
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
  let out = {};
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

    out = await evalJS(`(async () => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      const o = { errs: [] };
      window.addEventListener("error", e2 => o.errs.push(String(e2.message)));
      const lb = document.querySelector("[data-standard-login-submit]");
      if (lb) { lb.click(); await sleep(1600); }
      const nav = document.querySelector('.sidebar .nav-btn[data-page="twod"]');
      if (nav) { nav.click(); await sleep(1400); }
      const tab = document.querySelector('.module-tab-btn[data-module-tab="twod"][data-module-target="convert"]');
      if (tab) { tab.click(); await sleep(1000); }
      const shell = document.querySelector('.material-convert-shell[data-material-convert-module="twod"]');
      o.shellFound = !!shell;
      if (!shell) return o;

      /* 1) 新结构：format-row + 两张卡 */
      const row = shell.querySelector(".material-convert-format-row");
      o.formatRowFound = !!row;
      const cards = row ? [...row.querySelectorAll(".material-convert-format-card")] : [];
      o.cardCount = cards.length;
      o.cardLabels = cards.map(c => (c.querySelector(".material-convert-format-label") || {}).textContent || "");
      const srcCard = cards[0], tgtCard = cards[1];
      o.srcValue = srcCard ? ((srcCard.querySelector(".material-convert-format-value strong") || {}).textContent || "") : "";
      o.srcHint = srcCard ? ((srcCard.querySelector(".material-convert-format-value em") || {}).textContent || "") : "";
      const sel = tgtCard ? tgtCard.querySelector("select.material-convert-format-select") : null;
      o.targetIsSelect = !!sel;
      o.targetOptions = sel ? [...sel.options].map(x => x.value) : [];
      o.targetValue = sel ? sel.value : "";

      /* 2) 旧结构已移除：无重复表单行、无旧摘要卡 */
      o.noOldForm = !shell.querySelector(".material-convert-form");
      o.noOldSummary = !shell.querySelector(".material-convert-summary");
      o.no转换类型Card = ![...shell.querySelectorAll(".material-convert-summary-item")].length;

      /* 3) 下拉可用：切换选项 → change 委托 → 状态落库 → 重渲染回显 */
      if (sel && sel.options.length > 1) {
        const next = sel.options[1].value;
        sel.value = next;
        sel.dispatchEvent(new Event("change", { bubbles: true }));
        await sleep(700);
        const sel2 = document.querySelector('.material-convert-shell[data-material-convert-module="twod"] select.material-convert-format-select');
        o.afterChangeValue = sel2 ? sel2.value : "NO_SEL_AFTER";
        o.changePersisted = sel2 && sel2.value === next;
        const sel3 = sel2 || sel;
        if (sel3 && sel3.options.length > 1) {
          const back = sel3.options[0].value;
          sel3.value = back;
          sel3.dispatchEvent(new Event("change", { bubbles: true }));
          await sleep(700);
        }
      }

      /* 4) 按钮与上传区完好 */
      o.hasStartBtn = !!shell.querySelector('[data-material-convert-start="twod"]');
      o.hasClearBtn = !!shell.querySelector('[data-material-convert-clear="twod"]');
      o.hasUploadBtn = !!shell.querySelector('[data-material-convert-upload="twod"]');
      o.hasTypeRow = !!shell.querySelector(".material-convert-type-row");
      o.recordThs = [...shell.querySelectorAll("thead th")].map(x => x.textContent.trim()).join("|");
      return o;
    })()`);

    /* 取证截图 */
    await evalJS(`(async () => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      const nav = document.querySelector('.sidebar .nav-btn[data-page="twod"]');
      if (nav) { nav.click(); await sleep(1200); }
      const tab = document.querySelector('.module-tab-btn[data-module-tab="twod"][data-module-target="convert"]');
      if (tab) { tab.click(); await sleep(900); }
      return 1;
    })()`);
    await sleep(500);
    await shot("C:/Users/Windows/Desktop/diwei/_tools/_verify_convert_format_cards.png");

    console.log("===RESULT===");
    console.log(JSON.stringify(out, null, 2));
  } catch (e) {
    console.log("FATAL:" + e.message + "\n" + JSON.stringify(out, null, 2));
  } finally { try { ws && ws.close(); } catch (e) {} try { proc.kill(); } catch (e) {} }
  process.exit(0);
})().catch(e => { console.log("FATAL:" + e.message); process.exit(1); });
