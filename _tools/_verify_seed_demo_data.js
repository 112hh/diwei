/* 验收 + 取证：采集加工处理 / 数据入库 两个模块的列表预置样例数据 */
"use strict";
const { spawn } = require("child_process");
const fs = require("fs");
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p => fs.existsSync(p));
const PORT = 9383, PROFILE = "C:/Users/Windows/Desktop/diwei/_tools/_verify_profile_seed";
const KEYS = ["twod", "opto", "electrolyte", "mlff", "catalyst"];
const PAGES = process.argv[2] ? process.argv[2].split(",") : KEYS;
/* 数据库页权威数据集清单（04.js） */
const DB_DATASETS = {
  twod: ["结构特征数据集", "电子结构数据集", "电学性质数据集", "磁学性质数据集", "热学性质数据集", "力学性质数据集", "光学性质数据集", "缺陷性质数据集"],
  opto: ["有机光电基础数据集", "有机光电物性数据集", "有机光电表征图谱数据集", "有机光电计算数据集"],
  electrolyte: ["有机电解液数据集", "固态有机电解质数据集", "固态无机电解质数据集"],
  mlff: ["机器学习力场基础数据集", "有机小分子机器学习力场数据集", "高分子机器学习力场数据集"],
  catalyst: ["催化材料元素特征数据集", "催化材料结构特征数据集", "单原子催化剂数据集", "二元合金数据集", "晶界数据集", "体系特征数据集"]
};
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

/* 采集加工处理页：三个页签的样例数据 */
function driverIngest(k) {
  return `(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const o = { errs: [] };
    window.addEventListener("error", e2 => o.errs.push(String(e2.message)));
    const PID = "lowdim-ingest-${k}";
    const P = () => document.getElementById("page-" + PID);
    const Q = s => { const p = P(); return p ? p.querySelector(s) : null; };
    const QA = s => { const p = P(); return p ? [...p.querySelectorAll(s)] : []; };
    const go = async id2 => {
      const b = document.querySelector('.sidebar .nav-btn[data-page="' + id2 + '"]');
      if (b) { b.click(); await sleep(1200); }
    };
    await go(PID);

    /* ---- 页签一：采集任务执行记录 ---- */
    const ct = Q('.rw-tab[data-rw-tab="collect"]'); if (ct) { ct.click(); await sleep(700); }
    o.taskRows = QA('tr[data-rw-act="select-task"]').length;
    o.taskStatus = [...new Set(QA('tr[data-rw-act="select-task"] .rw-tag').map(x => x.textContent.trim()))];
    o.taskNames = QA('tr[data-rw-act="select-task"]').map(tr => tr.children[2].textContent.trim()).slice(0, 8);
    o.taskHasDbName = QA('tr[data-rw-act="select-task"]').every(tr => (tr.children[2].textContent || "").indexOf("（V") > 0 || tr.children[2].textContent.length > 4);

    /* ---- 页签二：资源录入 ---- */
    const et = Q('.rw-tab[data-rw-tab="entry"]'); if (et) { et.click(); await sleep(700); }
    o.entrySubtabs = QA(".rw-subtab").map(x => x.textContent.trim());
    const sub = n => (o.entrySubtabs.filter(t => t.indexOf(n) === 0)[0] || "");
    o.auditLabel = sub("录入审核");
    o.doneLabel = sub("已入库数据");
    o.auditCount = Number((o.auditLabel.match(/(\\d+)/) || [0, 0])[1]);
    o.doneCount = Number((o.doneLabel.match(/(\\d+)/) || [0, 0])[1]);
    /* 已入库列表有真实行 */
    const dv = QA('.rw-subtab').filter(b => b.textContent.indexOf("已入库数据") === 0)[0];
    if (dv) { dv.click(); await sleep(600); }
    o.doneRows = QA("table.rw-tbl tbody tr").filter(tr => tr.textContent.indexOf("暂无") < 0).length;
    o.doneText = (Q(".rw-card-head p") || {}).textContent || "";

    /* ---- 页签三：加工任务 ---- */
    const pt = Q('.rw-tab[data-rw-tab="process"]'); if (pt) { pt.click(); await sleep(700); }
    const rows = QA(".rw-jobs-table tbody tr");
    o.jobRows = rows.length;
    o.jobNames = rows.map(tr => tr.children[1].textContent.trim());
    o.jobVersions = rows.map(tr => tr.children[2].textContent.trim());
    o.jobSteps = rows.map(tr => tr.children[3].textContent.trim());
    o.jobSrcCounts = rows.map(tr => tr.children[4].textContent.trim());
    o.jobBars = QA(".rw-jobs-table .rw-progress i").map(i => i.style.width);

    /* 打开最后一条（六步已完成）的加工报告，验证数据产品按数据集展示 */
    const last = rows[rows.length - 1];
    if (last) {
      const rb = last.querySelector('[data-rw-act="proc-report"]');
      if (rb) { rb.click(); await sleep(800); }
      const mask = document.getElementById("rwProcReportMask");
      o.reportOpen = !!mask;
      if (mask) {
        const t = mask.textContent || "";
        o.reportHasProduct = t.indexOf("数据产品") >= 0;
        const m2 = t.match(/数据产品([^当]{0,160})/);
        o.reportProduct = m2 ? m2[1].trim() : "";
        o.reportHasQuality = t.indexOf("质量评价") >= 0;
        o.reportSteps = [...mask.querySelectorAll("table.rw-tbl tbody tr")].length;
        const cb = mask.querySelector('[data-rw-act="proc-report-close"]') || mask.querySelector(".rw-modal-close");
        if (cb) { cb.click(); await sleep(400); }
      }
    }
    return o;
  })()`;
}

/* 数据库页：入库记录 */
function driverDb(k) {
  return `(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const o = { errs: [] };
    window.addEventListener("error", e2 => o.errs.push(String(e2.message)));
    const PID = "lowdim-database-${k}";
    const b = document.querySelector('.sidebar .nav-btn[data-page="' + PID + '"]');
    if (b) { b.click(); await sleep(1400); }
    const P = () => document.getElementById("page-" + PID);
    const Q = s => { const p = P(); return p ? p.querySelector(s) : null; };
    const QA = s => { const p = P(); return p ? [...p.querySelectorAll(s)] : []; };
    const rv = Q('[data-ic-dbview="records"]');
    o.hasRecBtn = !!rv;
    if (rv) { rv.click(); await sleep(900); }
    const rows = QA(".ic-rec .ic-table tbody tr");
    o.recRows = rows.length;
    o.recNames = rows.map(tr => tr.children[1].textContent.trim());
    o.recDb = [...new Set(rows.map(tr => tr.children[2].textContent.trim()))];
    o.recEntries = rows.map(tr => tr.children[3].textContent.trim());
    o.recStatus = rows.map(tr => tr.children[6].textContent.trim());
    o.recEmpty = (Q(".ic-rec .ic-empty") ? 1 : 0);
    return o;
  })()`;
}

(async () => {
  const proc = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run", "--mute-audio", "--hide-scrollbars",
    "--remote-debugging-port=" + PORT, "--remote-allow-origins=*", "--user-data-dir=" + PROFILE,
    "--allow-file-access-from-files", "--window-size=1440,940", "about:blank"], { stdio: "ignore" });
  const out = { bad: [], pages: {} };
  try {
    for (let i = 0; i < 60; i++) { try { await getJSON("http://127.0.0.1:" + PORT + "/json/version"); break; } catch (e) { await sleep(500); } }
    const list = await getJSON("http://127.0.0.1:" + PORT + "/json/list");
    ws = new WebSocket(list.find(t => t.type === "page").webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    ws.addEventListener("message", ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id).res(m); pending.delete(m.id); } });
    await send("Page.enable"); await send("Runtime.enable");
    await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 940, deviceScaleFactor: 1, mobile: false });

    await send("Page.navigate", { url: "file:///C:/Users/Windows/Desktop/diwei/lowdim-ingest-twod.html" });
    for (let i = 0; i < 40; i++) { await sleep(500); if (await evalJS("document.readyState") === "complete") break; }
    await sleep(1800);
    const lb = await evalJS('(function(){var b=document.querySelector("[data-standard-login-submit]");if(b)b.click();return 1;})()');
    await sleep(1800);

    for (const k of PAGES) {
      const ing = await evalJS(driverIngest(k));
      const db = await evalJS(driverDb(k));
      const want = DB_DATASETS[k];
      ing.recRows = db.recRows; ing.recNames = db.recNames; ing.recStatus = db.recStatus; ing.recDb = db.recDb;
      ing.recAlign = JSON.stringify(db.recNames.slice(0, want.length).map(s => s.replace("（V2.0）", ""))) === JSON.stringify(want);
      ing.recHasIng = (db.recStatus || []).filter(s => s === "入库中").length === 1;
      ing.recNoEmpty = db.recEmpty === 0;
      out.pages[k] = ing;
      const ok = !ing.__EXC__
        && ing.taskRows >= 6
        && ing.auditCount >= 2 && ing.doneCount >= 2
        && ing.doneRows >= 2
        && ing.jobRows === 4
        && ing.jobVersions.join(",").indexOf("V2.0") >= 0 && ing.jobVersions.join(",").indexOf("V1.0") >= 0
        && ing.recRows === want.length + 1 && ing.recAlign && ing.recHasIng && ing.recNoEmpty
        && ing.reportOpen && ing.reportHasProduct
        && (ing.errs || []).length === 0;
      if (!ok) out.bad.push(k + " -> " + JSON.stringify({
        taskRows: ing.taskRows, auditCount: ing.auditCount, doneCount: ing.doneCount, doneRows: ing.doneRows,
        jobRows: ing.jobRows, versions: ing.jobVersions, recRows: ing.recRows, align: ing.recAlign,
        hasIng: ing.recHasIng, report: ing.reportOpen, errs: ing.errs
      }));
    }

    /* 取证截图：twod 三个列表 + 入库记录 */
    await evalJS('(function(){var b=document.querySelector(\'.sidebar .nav-btn[data-page="lowdim-ingest-twod"]\');if(b)b.click();return 1;})()');
    await sleep(1400);
    await evalJS('(function(){var p=document.getElementById("page-lowdim-ingest-twod");var b=p&&p.querySelector(\'.rw-tab[data-rw-tab="collect"]\');if(b)b.click();return 1;})()');
    await sleep(700); await shot("C:/Users/Windows/Desktop/diwei/_tools/_seed_collect_twod.png");
    await evalJS('(function(){var p=document.getElementById("page-lowdim-ingest-twod");var b=p&&p.querySelector(\'.rw-tab[data-rw-tab="entry"]\');if(b)b.click();return 1;})()');
    await sleep(700);
    await evalJS('(function(){var p=document.getElementById("page-lowdim-ingest-twod");var b=[...(p?p.querySelectorAll(".rw-subtab"):[])].filter(x=>x.textContent.indexOf("已入库数据")===0)[0];if(b)b.click();return 1;})()');
    await sleep(700); await shot("C:/Users/Windows/Desktop/diwei/_tools/_seed_entry_twod.png");
    await evalJS('(function(){var p=document.getElementById("page-lowdim-ingest-twod");var b=p&&p.querySelector(\'.rw-tab[data-rw-tab="process"]\');if(b)b.click();return 1;})()');
    await sleep(700); await shot("C:/Users/Windows/Desktop/diwei/_tools/_seed_proc_twod.png");
    await evalJS('(function(){var b=document.querySelector(\'.sidebar .nav-btn[data-page="lowdim-database-twod"]\');if(b)b.click();return 1;})()');
    await sleep(1400);
    await evalJS('(function(){var b=document.querySelector(\'[data-ic-dbview="records"]\');if(b)b.click();return 1;})()');
    await sleep(900); await shot("C:/Users/Windows/Desktop/diwei/_tools/_seed_db_records_twod.png");

    console.log("===RESULT===");
    console.log(JSON.stringify(out, null, 2));
  } catch (e) {
    console.log("FATAL:" + e.message + "\n" + JSON.stringify(out, null, 2));
  } finally { try { ws && ws.close(); } catch (e) {} try { proc.kill(); } catch (e) {} }
  process.exit(0);
})().catch(e => { console.log("FATAL:" + e.message); process.exit(1); });
