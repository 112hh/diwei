/* 验收 + 取证：所有审核改为「一次审批，通过即入库」，全站无初审 / 终审
   注意：所有按钮查询必须限定在当前激活页容器内，否则会点到 database 页上的同名按钮。 */
"use strict";
const { spawn } = require("child_process");
const fs = require("fs");
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p => fs.existsSync(p));
const PORT = 9341, PROFILE = "C:/Users/Windows/Desktop/diwei/_tools/_verify_profile_ao";
const PAGES = ["twod", "opto", "electrolyte", "mlff", "catalyst"];
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

/* 页面内驱动：k 为材料 key */
function driver(k) {
  return `(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const o = { errs: [] };
    window.addEventListener("error", e2 => o.errs.push(String(e2.message)));
    const lb = document.querySelector("[data-standard-login-submit]");
    if (lb) { lb.click(); await sleep(1600); }
    const PID = "lowdim-ingest-${k}";
    const nav = document.querySelector('.sidebar .nav-btn[data-page="' + PID + '"]');
    if (nav) { nav.click(); await sleep(1200); }
    o.active = [...document.querySelectorAll("section.page.active")].map(x => x.id).join(",");
    const P = () => document.getElementById("page-" + PID);
    const Q = s => { const p = P(); return p ? p.querySelector(s) : null; };
    const QA = s => { const p = P(); return p ? [...p.querySelectorAll(s)] : []; };

    /* ---- 1. 采集审核页 ---- */
    const ca = Q('[data-rw-act="open-audit"]');
    o.collectAuditBtn = !!ca;
    if (ca) { ca.click(); await sleep(600); }
    o.collectAuditTitle = (Q(".rw-card-head h3") || {}).textContent || "";
    o.collectOps = QA("table.rw-tbl tbody tr").slice(0, 1)
      .map(tr => [...tr.querySelectorAll("button")].map(b => b.textContent.trim()).join("|")).join("");
    o.collectHasFirstFinal = (P() || { textContent: "" }).textContent.indexOf("初审") >= 0
      || (P() || { textContent: "" }).textContent.indexOf("终审") >= 0;
    const back = Q('[data-rw-act="collect-audit-back"]');
    if (back) { back.click(); await sleep(500); }

    /* ---- 2. 录入：手动录入造一条 → 审核 → 通过 ---- */
    const et = Q('.rw-tab[data-rw-tab="entry"]');
    if (et) { et.click(); await sleep(600); }
    const me = QA('[data-rw-act="entry-manual"]').filter(b => !b.getAttribute("data-task"))[0];
    o.manualBtn = !!me;
    if (me) {
      me.click(); await sleep(600);
      let m2 = document.getElementById("rwEntryMask");
      if (m2) {
        /* 用示例结构 + 解析把必填字段一次填好，避免校验拦下 */
        const demo = m2.querySelector('[data-rw-act="entry-demo-cif"]');
        if (demo) { demo.click(); await sleep(300); }
        m2 = document.getElementById("rwEntryMask") || m2;
        const parse = m2.querySelector('[data-rw-act="entry-parse-cif"]');
        if (parse) { parse.click(); await sleep(400); }
        m2 = document.getElementById("rwEntryMask") || m2;
        /* 注意：不要覆盖表单里的 textarea（多为原子坐标等强校验字段），demo + 解析已填好必填项 */
        await sleep(300);
        const sb = m2.querySelector('[data-rw-act="entry-submit"]');
        if (sb) { sb.click(); await sleep(700); }
      }
    }
    const ab = Q('[data-rw-act="entry-audit-open"]');
    o.hasAuditBtn = !!ab;
    if (ab) {
      ab.click(); await sleep(600);
      const am = document.getElementById("rwEntryAuditMask");
      o.modalTitle = am ? ((am.querySelector(".rw-modal-head h3") || {}).textContent || "") : "NO_MODAL";
      o.modalDesc = am ? ((am.querySelector(".rw-modal-head p") || {}).textContent || "") : "";
      o.modalHasFirstFinal = am ? (am.textContent.indexOf("初审") >= 0 || am.textContent.indexOf("终审") >= 0) : null;
      if (am) {
        const p = am.querySelector('input[name="rwEntryAuditResult"][value="通过"]');
        if (p) { p.checked = true; p.dispatchEvent(new Event("change", { bubbles: true })); }
        const op = am.querySelector("#rwEntryAuditOpinion");
        if (op) { op.value = "字段完整、规范已关联，一次审核通过，同意入库。"; op.dispatchEvent(new Event("input", { bubbles: true })); }
        await sleep(250);
        const sb2 = am.querySelector('[data-rw-act="entry-audit-submit"]');
        if (sb2) { sb2.click(); await sleep(800); }
      }
    }

    /* ---- 3. 读库判定：一次审批通过即入库 ----
       2026-10-08：录入列表已预置演示样例，新建记录插在队首，
       因此按「审核弹窗标题里的记录号」定位本次审批的那条，而不是取最后一条 */
    const holder = (typeof state !== "undefined" && state) || window.__rwFallbackState;
    const recs = (holder && holder.lowdimRw && holder.lowdimRw[PID] && holder.lowdimRw[PID].entry.records) || [];
    const auditedId = String(o.modalTitle || "").split("·").pop().trim();
    const rec = recs.filter(x => x.id === auditedId)[0] || recs[0] || null;
    const au = (rec && rec.audit) || {};
    o.rec = rec ? JSON.stringify({ id: rec.id, status: rec.status, adminResult: au.adminResult, adminBy: au.adminBy, opinion: au.opinion || "" }) : "NO_REC";
    o.onceOk = !!rec && rec.status === "已入库" && au.adminResult === "通过" && (au.opinion || "").indexOf("同意入库") >= 0 && !au.first && !au.final;
    const LEGAL = ["待审核", "自动校验中", "自动校验未通过", "已入库", "已退回"];
    o.statuses = recs.map(r => r.status).join(",");
    o.legalStatuses = recs.every(x => LEGAL.indexOf(x.status) >= 0) && recs.every(x => !x.audit || (!x.audit.first && !x.audit.final));

    /* ---- 4. 全文扫描 ---- */
    o.pageHasFirstFinal = (P() || { textContent: "" }).textContent.indexOf("初审") >= 0
      || (P() || { textContent: "" }).textContent.indexOf("终审") >= 0;
    return o;
  })()`;
}

(async () => {
  const proc = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run", "--mute-audio", "--hide-scrollbars",
    "--remote-debugging-port=" + PORT, "--remote-allow-origins=*", "--user-data-dir=" + PROFILE,
    "--allow-file-access-from-files", "--window-size=1440,940", "about:blank"], { stdio: "ignore" });
  const out = { pages: {}, bad: [] };
  try {
    for (let i = 0; i < 60; i++) { try { await getJSON("http://127.0.0.1:" + PORT + "/json/version"); break; } catch (e) { await sleep(500); } }
    const list = await getJSON("http://127.0.0.1:" + PORT + "/json/list");
    ws = new WebSocket(list.find(t => t.type === "page").webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    ws.addEventListener("message", ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id).res(m); pending.delete(m.id); } });
    await send("Page.enable"); await send("Runtime.enable");
    await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 940, deviceScaleFactor: 1, mobile: false });

    for (const k of PAGES) {
      await send("Page.navigate", { url: "file:///C:/Users/Windows/Desktop/diwei/lowdim-ingest-" + k + ".html" });
      for (let i = 0; i < 40; i++) { await sleep(500); if (await evalJS("document.readyState") === "complete") break; }
      await sleep(1500);
      const r = await evalJS(driver(k));
      out.pages[k] = r;
      const ok = r && !r.__EXC__ && r.onceOk && r.hasAuditBtn && r.manualBtn && r.collectAuditBtn
        && !r.pageHasFirstFinal && !r.collectHasFirstFinal && r.modalHasFirstFinal === false && r.legalStatuses;
      if (!ok) out.bad.push(k + ":" + JSON.stringify(r));
    }

    /* ---------- 取证截图（twod） ---------- */
    await send("Page.navigate", { url: "file:///C:/Users/Windows/Desktop/diwei/lowdim-ingest-twod.html" });
    for (let i = 0; i < 40; i++) { await sleep(500); if (await evalJS("document.readyState") === "complete") break; }
    await sleep(1500);
    const enter = `(async () => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      const lb = document.querySelector("[data-standard-login-submit]"); if (lb) { lb.click(); await sleep(1600); }
      const nav = document.querySelector('.sidebar .nav-btn[data-page="lowdim-ingest-twod"]'); if (nav) { nav.click(); await sleep(1200); }
      const P = () => document.getElementById("page-lowdim-ingest-twod");
      const Q = s => { const p = P(); return p ? p.querySelector(s) : null; };
      const QA = s => { const p = P(); return p ? [...p.querySelectorAll(s)] : []; };
      const et = Q('.rw-tab[data-rw-tab="entry"]'); if (et) { et.click(); await sleep(600); }
      const me = QA('[data-rw-act="entry-manual"]').filter(b => !b.getAttribute("data-task"))[0];
      if (me) { me.click(); await sleep(600); }
      let m = document.getElementById("rwEntryMask");
      if (m) {
        const demo = m.querySelector('[data-rw-act="entry-demo-cif"]'); if (demo) { demo.click(); await sleep(300); }
        m = document.getElementById("rwEntryMask") || m;
        const pz = m.querySelector('[data-rw-act="entry-parse-cif"]'); if (pz) { pz.click(); await sleep(400); }
        m = document.getElementById("rwEntryMask") || m;
        /* 顺手全选关联配置规范，截图里能体现规范条数 */
        const all = m.querySelector('[data-rw-act="std-all"]'); if (all) { all.click(); await sleep(300); }
        m = document.getElementById("rwEntryMask") || m;
        await sleep(300);
        const sb = m.querySelector('[data-rw-act="entry-submit"]'); if (sb) { sb.click(); await sleep(700); }
      }
      const ab = Q('[data-rw-act="entry-audit-open"]'); if (ab) { ab.click(); await sleep(700); }
      const am = document.getElementById("rwEntryAuditMask");
      if (am) {
        const p = am.querySelector('input[name="rwEntryAuditResult"][value="通过"]'); if (p) { p.checked = true; p.dispatchEvent(new Event("change", { bubbles: true })); }
        const op = am.querySelector("#rwEntryAuditOpinion"); if (op) { op.value = "字段完整、标准规范已关联（23 项），一次审核通过，同意入库。"; op.dispatchEvent(new Event("input", { bubbles: true })); }
        await sleep(350);
      }
      return 1;
    })()`;
    await evalJS(enter);
    await sleep(500);
    await shot("C:/Users/Windows/Desktop/diwei/_tools/_verify_audit_once_modal.png");

    /* 提交 → 已入库 */
    await evalJS("(function(){var b=document.querySelector('#rwEntryAuditMask [data-rw-act=\"entry-audit-submit\"]');if(b)b.click();return 1;})()");
    await sleep(900);
    await shot("C:/Users/Windows/Desktop/diwei/_tools/_verify_audit_once_done.png");

    /* 流程管理（管理员一次审核） */
    await evalJS("(function(){var p=document.getElementById('page-lowdim-ingest-twod');var b=p&&p.querySelector('[data-rw-act=\"entry-view\"][data-view=\"flow\"]');if(b)b.click();return 1;})()");
    await sleep(900);
    await shot("C:/Users/Windows/Desktop/diwei/_tools/_verify_audit_once_flow.png");

    /* 数据采集审核页 */
    await evalJS("(function(){var p=document.getElementById('page-lowdim-ingest-twod');var t=p&&p.querySelector('.rw-tab[data-rw-tab=\"collect\"]');if(t)t.click();return 1;})()");
    await sleep(700);
    await evalJS("(function(){var p=document.getElementById('page-lowdim-ingest-twod');var b=p&&p.querySelector('[data-rw-act=\"open-audit\"]');if(b)b.click();return 1;})()");
    await sleep(800);
    await shot("C:/Users/Windows/Desktop/diwei/_tools/_verify_audit_once_collect.png");

    /* 录入规范说明（2.2.4 审核流程） */
    await evalJS("(function(){var p=document.getElementById('page-lowdim-ingest-twod');var b=p&&p.querySelector('[data-rw-act=\"collect-audit-back\"]');if(b)b.click();return 1;})()");
    await sleep(600);
    await evalJS("(function(){var p=document.getElementById('page-lowdim-ingest-twod');var t=p&&p.querySelector('.rw-tab[data-rw-tab=\"entry\"]');if(t)t.click();return 1;})()");
    await sleep(600);
    await evalJS("(function(){var p=document.getElementById('page-lowdim-ingest-twod');var b=p&&p.querySelector('[data-rw-act=\"entry-view\"][data-view=\"spec\"]');if(b)b.click();return 1;})()");
    await sleep(900);
    await shot("C:/Users/Windows/Desktop/diwei/_tools/_verify_audit_once_spec.png");

    console.log("===RESULT===");
    console.log(JSON.stringify(out, null, 2));
  } catch (e) {
    console.log("FATAL:" + e.message + "\n" + JSON.stringify(out, null, 2));
  } finally { try { ws && ws.close(); } catch (e) {} try { proc.kill(); } catch (e) {} }
  process.exit(0);
})().catch(e => { console.log("FATAL:" + e.message); process.exit(1); });
