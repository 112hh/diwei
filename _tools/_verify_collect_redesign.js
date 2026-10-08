/* 验证 2026-10-08 采集加工页改动：
   1) 圈红区域（flow-nav / ic-bar / ic-cards）在 5 个加工处理页隐藏
   2) 创建采集任务三步向导（数据获取 → 数据整合 → 数据更新）
   3) 列表改为采集任务执行记录（采集ID/数据来源/入库名称/数据整合报告/状态/操作）
   4) 数据采集审核按钮 → 审核页 → 审核弹窗 → 提交审核结果
   走 CDP 页面级 WebSocket（skill §2.2），Chrome 由本脚本拉起并在结束时杀掉。 */
"use strict";
const { spawn } = require("child_process");
const fs = require("fs");

const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
];
const CHROME = CHROME_CANDIDATES.find(p => fs.existsSync(p));
const PORT = 9333;
const PROFILE = "C:/Users/Windows/Desktop/diwei/_tools/_verify_profile_collect";
const PAGES = ["lowdim-ingest-twod.html", "lowdim-ingest-catalyst.html"];

const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJSON = async u => (await fetch(u)).json();

let id = 0; const pending = new Map(); let ws;
function send(method, params = {}) {
  return new Promise((res, rej) => {
    const i = ++id; pending.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
}

async function evalJS(expression) {
  const m = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (m.result && m.result.exceptionDetails) {
    const d = m.result.exceptionDetails;
    return { __EXC__: (d.exception && d.exception.description) || d.text || "EXC" };
  }
  return m.result.result.value;
}

async function shot(file, fullPage) {
  const m = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: !!fullPage
  });
  fs.writeFileSync(file, Buffer.from(m.result.data, "base64"));
}

/* 每个页面跑同一套驱动，返回断言结果对象 */
function pageDriver(pageId) {
  return `(async () => {
  const out = { page: "${pageId}", errs: [] };
  try {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    window.addEventListener("error", e => out.errs.push(String(e.message)));

    /* ---------- 0. 登录门禁 + 切到目标页 ---------- */
    const loginBtn = document.querySelector("[data-standard-login-submit]");
    if (loginBtn) { loginBtn.click(); await sleep(1500); }
    const nav = document.querySelector('.sidebar .nav-btn[data-page="${pageId}"]');
    if (nav) { nav.click(); await sleep(1000); }
    out.activePage = [...document.querySelectorAll("section.page.active")].map(x => x.id).join(",");

    const page = document.getElementById("page-${pageId}");

    /* ---------- 1. 圈红区域隐藏 ---------- */
    const fn = page.querySelector(".flow-nav");
    out.flowNav = fn ? getComputedStyle(fn).display : "ABSENT";
    out.icBar = page.querySelector(".ic-bar") ? "PRESENT" : "ABSENT";
    out.icCards = page.querySelector(".ic-cards") ? "PRESENT" : "ABSENT";

    /* ---------- 2. 列表改采集任务执行记录 ---------- */
    out.listTitle = (page.querySelector(".rw-card-head h3") || {}).textContent || "";
    out.noCurrentTaskCard = page.textContent.indexOf("当前任务 ·") < 0;
    out.noIssueBanner = page.textContent.indexOf("全库尚有") < 0;
    out.heads = [...page.querySelectorAll(".rw-card table.rw-tbl thead th")].slice(0, 8).map(t => t.textContent.trim());
    out.rowCount = page.querySelectorAll(".rw-card table.rw-tbl tbody tr").length;

    /* ---------- 3. 打开创建任务 ---------- */
    const btn = page.querySelector('[data-rw-act="open-create"]');
    if (!btn) { out.createErr = "NO open-create button"; return out; }
    btn.click(); await sleep(400);
    const mask = document.getElementById("rwMask");
    if (!mask) { out.createErr = "NO rwMask"; return out; }
    out.modalTitle = (mask.querySelector(".rw-modal-head h3") || {}).textContent || "";
    out.stepbar = [...mask.querySelectorAll(".rw-stepbar-item")].map(x => x.textContent.trim());
    const selObtain = mask.querySelector('[data-rw-f="obtainWay"]');
    const selSource = mask.querySelector('[data-rw-f="sourceType"]');
    const selType = mask.querySelector('[data-rw-f="dataType"]');
    out.obtainOpts = selObtain ? [...selObtain.options].map(o => o.value) : [];
    out.sourceOpts = selSource ? [...selSource.options].map(o => o.value) : [];
    out.dataTypeOpts = selType ? [...selType.options].map(o => o.value) : [];
    out.hasName = !!mask.querySelector('[data-rw-f="name"]');
    out.hasDesc = !!mask.querySelector('[data-rw-f="desc"]');

    /* 填入库名称 → 下一步 */
    const name = mask.querySelector('[data-rw-f="name"]');
    name.value = "验证入库名称A";
    name.dispatchEvent(new Event("input", { bubbles: true }));
    name.dispatchEvent(new Event("change", { bubbles: true }));
    mask.querySelector('[data-rw-act="next"]').click(); await sleep(300);

    /* ---------- 4. 第二步：数据整合 ---------- */
    out.step2Title = mask.body ? "" : (mask.querySelector(".rw-section-title") || {}).textContent || "";
    const selObj = mask.querySelector('[data-rw-f="collectObject"]');
    out.collectOpts = selObj ? [...selObj.options].map(o => o.value) : [];
    out.tableRule = mask.textContent.indexOf("晶格常数") >= 0 && mask.textContent.indexOf("小数点后 7 位") >= 0;
    /* 切到「图」→ 应显示图像校验规则 */
    selObj.value = "图";
    selObj.dispatchEvent(new Event("change", { bubbles: true })); await sleep(300);
    out.imgRule = mask.textContent.indexOf("图像校验规则") >= 0 && mask.textContent.indexOf("分辨率") >= 0;
    /* 切回「表」 */
    const selObj2 = mask.querySelector('[data-rw-f="collectObject"]');
    selObj2.value = "表";
    selObj2.dispatchEvent(new Event("change", { bubbles: true })); await sleep(300);

    /* 下一步 → 第三步：数据更新 */
    mask.querySelector('[data-rw-act="next"]').click(); await sleep(300);
    out.hasFreq = mask.textContent.indexOf("更新频率") >= 0;
    out.freqOpts = (() => { const s = mask.querySelector('[data-rw-f="updateFreq"]'); return s ? [...s.options].map(o => o.value) : []; })();
    out.updateModeRadios = mask.querySelectorAll('input[name="rwUpdateMode"]').length;
    const auto = mask.querySelector('input[name="rwUpdateMode"][value="自动"]');
    if (auto) { auto.checked = true; auto.dispatchEvent(new Event("change", { bubbles: true })); await sleep(150); }

    /* 提交 */
    mask.querySelector('[data-rw-act="submit-task"]').click(); await sleep(500);
    out.maskClosedAfterSubmit = !document.getElementById("rwMask");
    const page2 = document.getElementById("page-${pageId}");
    const firstRow = page2.querySelector('.rw-card table.rw-tbl tbody tr');
    out.firstRowText = firstRow ? firstRow.textContent.replace(/\\s+/g, " ").slice(0, 200) : "";

    /* ---------- 5. 数据采集审核 ---------- */
    const auditBtn = page2.querySelector('[data-rw-act="open-audit"]');
    if (!auditBtn) { out.auditErr = "NO audit button"; return out; }
    auditBtn.click(); await sleep(400);
    const page3 = document.getElementById("page-${pageId}");
    out.auditTitle = (page3.querySelector(".rw-card-head h3") || {}).textContent || "";
    out.auditHeads = [...page3.querySelectorAll("table.rw-tbl thead th")].map(t => t.textContent.trim());
    const auditOp = page3.querySelector('[data-rw-act="open-audit-modal"]');
    if (!auditOp) { out.auditErr = "NO audit op button"; return out; }
    auditOp.click(); await sleep(400);
    const mask2 = document.getElementById("rwMask");
    out.auditModalTitle = (mask2.querySelector(".rw-modal-head h3") || {}).textContent || "";
    out.auditKvCount = mask2.querySelectorAll(".rw-kv > div").length;
    const pass = mask2.querySelector('input[name="rwAuditResult"][value="通过"]');
    pass.checked = true; pass.dispatchEvent(new Event("change", { bubbles: true }));
    const op = mask2.querySelector("#rwAuditOpinion");
    op.value = "数据来源合规，整合校验全部通过，同意入库。";
    mask2.querySelector('[data-rw-act="submit-audit"]').click(); await sleep(500);
    const page4 = document.getElementById("page-${pageId}");
    out.auditAfter = (page4.querySelector("table.rw-tbl tbody tr") || {}).textContent || "";
    out.auditHasPass = out.auditAfter.indexOf("审核通过") >= 0;
    out.auditHasOpinion = out.auditAfter.indexOf("同意入库") >= 0;
    /* 返回列表 */
    const back = page4.querySelector('[data-rw-act="audit-back"]');
    if (back) { back.click(); await sleep(400); }
    out.returnToListTitle = (page4.querySelector(".rw-card-head h3") || {}).textContent || "";

    /* ---------- 6. 资源录入页签：来源规则表已删、工作台保留 ---------- */
    const entryTab = document.querySelector('[data-rw-root="page"] .rw-tab[data-rw-tab="entry"]');
    entryTab.click(); await sleep(500);
    const page5 = document.getElementById("page-${pageId}");
    out.entryWorkbench = page5.textContent.indexOf("数据录入工作台") >= 0;
    out.entryNoSourceTable = page5.textContent.indexOf("系统自动识别规则") < 0;
    out.entryHasBatchBtn = !!page5.querySelector('[data-rw-act="entry-batch"]');
    out.entryHasManualBtn = !!page5.querySelector('[data-rw-act="entry-manual"]');
    out.entrySubTabs = [...page5.querySelectorAll(".rw-subtab")].map(x => x.textContent.trim());

    /* ---------- 7. 手动录入：关联配置规范勾选 ---------- */
    page5.querySelector('[data-rw-act="entry-manual"]').click(); await sleep(450);
    const m1 = document.getElementById("rwEntryMask");
    out.manualHasStdSection = m1 ? m1.textContent.indexOf("关联配置规范") >= 0 : false;
    out.stdItemCount = m1 ? m1.querySelectorAll("input[data-rw-es]").length : 0;
    out.stdCheckedInit = m1 ? m1.querySelectorAll("input[data-rw-es]:checked").length : 0;
    /* 勾一条 + 全选 */
    const first = m1 && m1.querySelector("input[data-rw-es]");
    if (first) { first.checked = true; first.dispatchEvent(new Event("change", { bubbles: true })); await sleep(200); }
    out.stdCounterAfterOne = (document.querySelector("#rwEntryMask .rw-std-top b") || {}).textContent || "";
    (document.querySelector('#rwEntryMask [data-rw-act="std-all"]') || {}).click
      && document.querySelector('#rwEntryMask [data-rw-act="std-all"]').click();
    await sleep(350);
    const m2 = document.getElementById("rwEntryMask");
    out.stdCheckedAfterAll = m2 ? m2.querySelectorAll("input[data-rw-es]:checked").length : 0;
    /* 填示例结构 → 解析 → 提交 */
    const demo = m2 && m2.querySelector('[data-rw-act="entry-demo-cif"]');
    if (demo) { demo.click(); await sleep(250); }
    const parse = document.querySelector('#rwEntryMask [data-rw-act="entry-parse-cif"]');
    if (parse) { parse.click(); await sleep(350); }
    const m3 = document.getElementById("rwEntryMask");
    out.stdCounterBeforeSubmit = (m3 && m3.querySelector(".rw-std-top b") || {}).textContent || "";
    const sub = m3 && m3.querySelector('[data-rw-act="entry-submit"]');
    if (sub) { sub.click(); await sleep(600); }
    out.manualSubmitClosed = !document.getElementById("rwEntryMask");
    const page6 = document.getElementById("page-${pageId}");
    out.auditRowCount = page6.querySelectorAll("table.rw-audit-table tbody tr").length;

    /* ---------- 8. 录入审核：一次审批 ---------- */
    const firstAuditRow = page6.querySelector("table.rw-audit-table tbody tr");
    out.auditRowOps = firstAuditRow ? [...firstAuditRow.querySelectorAll("button")].map(b => b.textContent.trim()).join("|") : "";
    out.auditNoFirstFinal = out.auditRowOps.indexOf("初审") < 0 && out.auditRowOps.indexOf("终审") < 0;
    const aBtn = page6.querySelector('[data-rw-act="entry-audit-open"]');
    if (aBtn) { aBtn.click(); await sleep(450); }
    const am = document.getElementById("rwEntryAuditMask");
    out.entryAuditModalTitle = am ? (am.querySelector(".rw-modal-head h3") || {}).textContent : "NO_MODAL";
    out.entryAuditHasContent = am ? (am.textContent.indexOf("录入内容") >= 0 && am.textContent.indexOf("关联配置规范") >= 0) : false;
    out.entryAuditHasForm = am ? (am.querySelectorAll('input[name="rwEntryAuditResult"]').length === 2 && !!am.querySelector("#rwEntryAuditOpinion")) : false;
    if (am) {
      const p = am.querySelector('input[name="rwEntryAuditResult"][value="通过"]');
      p.checked = true; p.dispatchEvent(new Event("change", { bubbles: true }));
      am.querySelector("#rwEntryAuditOpinion").value = "字段完整、规范已关联，同意入库。";
      am.querySelector('[data-rw-act="entry-audit-submit"]').click(); await sleep(600);
    }
    const page7 = document.getElementById("page-${pageId}");
    out.auditQueueAfter = (page7.querySelector("table.rw-audit-table tbody tr") || {}).textContent || "";
    /* 一次审批：审核通过后记录直接入库，应出现在「已入库数据」 */
    const doneTab = page7.querySelector('[data-rw-act="entry-view"][data-view="done"]');
    if (doneTab) { doneTab.click(); await sleep(450); }
    const page8 = document.getElementById("page-${pageId}");
    out.entryDoneRow = (page8.querySelector("table.rw-done-table tbody tr") || {}).textContent || "";
    /* 直接读库：一次审批通过 → status 应为「已入库」，且只留下 adminResult/adminBy 这类管理员一次审核痕迹 */
    const holder = (typeof state !== "undefined" && state) || window.__rwFallbackState;
    const recs = (holder && holder.lowdimRw && holder.lowdimRw["${pageId}"] && holder.lowdimRw["${pageId}"].entry.records) || [];
    const rec = recs[recs.length - 1] || null;
    const au = (rec && rec.audit) || {};
    out.auditRecJson = rec ? JSON.stringify({ id: rec.id, status: rec.status, adminResult: au.adminResult, adminBy: au.adminBy, opinion: au.opinion || "" }) : "NO_REC";
    out.entryAuditStored = !!rec && rec.status === "已入库" && au.adminResult === "通过" && (au.opinion || "").indexOf("同意入库") >= 0 && !!au.adminAt;
    /* 全库不得残留初审 / 终审态 */
    const LEGAL = ["待审核", "自动校验中", "自动校验未通过", "已入库", "已退回"];
    out.auditStatuses = recs.map(r => r.status).join(",");
    out.auditNoLegacyStatus = recs.every(r => LEGAL.indexOf(r.status) >= 0) && recs.every(r => !r.firstResult && !r.finalResult);
    out.pageNoFirstFinal = page8.textContent.indexOf("初审") < 0 && page8.textContent.indexOf("终审") < 0;

    /* ---------- 9. 数据统计 / 权限管理 / 流程管理 ---------- */
    const views = { stats: ["现有数据条目", "剩余硬件空间", "定期去重"], perm: ["系统管理员", "高级用户", "普通用户"], flow: ["人员权限审批", "操作工单备案", "定期备份"] };
    for (const v of Object.keys(views)) {
      const b = document.querySelector('[data-rw-act="entry-view"][data-view="' + v + '"]');
      if (b) { b.click(); await sleep(450); }
      const pv = document.getElementById("page-${pageId}");
      const txt = pv.textContent;
      out["view_" + v + "_title"] = (pv.querySelector(".rw-card-head h3") || {}).textContent || "";
      out["view_" + v + "_ok"] = views[v].every(function (k) { return txt.indexOf(k) >= 0; });
      out["view_" + v + "_tables"] = pv.querySelectorAll("table.rw-tbl").length;
    }

    /* ---------- 10. 资源加工：圈红删除 + 创建加工任务向导 ---------- */
    const procTab = document.querySelector('[data-rw-root="page"] .rw-tab[data-rw-tab="process"]');
    procTab.click(); await sleep(500);
    const pp = document.getElementById("page-${pageId}");
    out.procNoOverview = pp.textContent.indexOf("加工流程总览") < 0;
    out.procNoHandoff = pp.textContent.indexOf("加工产物交接") < 0;
    pp.querySelector('[data-rw-act="proc-new"]').click(); await sleep(500);
    let wm = document.getElementById("rwProcMask");
    out.wizStep1Active = wm ? ((wm.querySelector(".rw-stepbar-item.is-active") || {}).textContent || "").indexOf("数据策划") >= 0 : false;
    out.wizHasName = !!(wm && wm.querySelector('[data-rw-pf="name"]'));
    out.wizHasPurpose = wm ? wm.textContent.indexOf("目标用途") >= 0 : false;
    out.wizHasFormat = wm ? wm.textContent.indexOf("输出格式") >= 0 : false;
    out.wizHasProductForm = wm ? wm.textContent.indexOf("数据产品形式") >= 0 : false;
    out.wizHasContent = !!(wm && wm.querySelector('[data-rw-pf="desc"]'));
    out.wizNoDocBtn = !(wm && wm.querySelector('[data-rw-act="proc-run-1"]'));
    out.wizNoGotoEntry = !(wm && wm.querySelector('[data-rw-act="proc-goto-entry"]'));
    out.wizNoSourcePick = wm ? wm.textContent.indexOf("选择参与加工的数据源") < 0 : false;
    out.wizNoPrecision = wm ? wm.textContent.indexOf("精度要求") < 0 : false;
    /* 空名称点下一步 → 仍停在步骤 1 */
    wm.querySelector('[data-rw-act="proc-next"]').click(); await sleep(300);
    wm = document.getElementById("rwProcMask");
    out.wizNameGuard = wm ? wm.textContent.indexOf("数据策划") >= 0 : false;
    /* 填名称 + 内容 → 下一步 → 步骤 2 */
    const nm = wm.querySelector('[data-rw-pf="name"]');
    nm.value = "验证加工任务"; nm.dispatchEvent(new Event("input", { bubbles: true }));
    const dz = wm.querySelector('[data-rw-pf="desc"]');
    dz.value = "验证内容说明"; dz.dispatchEvent(new Event("input", { bubbles: true }));
    wm.querySelector('[data-rw-act="proc-next"]').click(); await sleep(350);
    wm = document.getElementById("rwProcMask");
    out.wizStep2 = wm ? wm.textContent.indexOf("勾选本次加工需要纳入的基础数据类型") >= 0 : false;
    out.wizBasisCards = wm ? wm.querySelectorAll('input[data-rw-pf="basis"]').length : 0;
    /* 不勾选 → 下一步被拦 */
    wm.querySelector('[data-rw-act="proc-next"]').click(); await sleep(300);
    wm = document.getElementById("rwProcMask");
    out.wizBasisGuard = wm ? wm.textContent.indexOf("勾选本次加工需要纳入的基础数据类型") >= 0 : false;
    /* 勾两类 → 下一步到步骤 3 */
    const cbs = wm.querySelectorAll('input[data-rw-pf="basis"]');
    cbs[0].checked = true; cbs[0].dispatchEvent(new Event("change", { bubbles: true }));
    await sleep(150);
    const cb2 = document.querySelectorAll('#rwProcMask input[data-rw-pf="basis"]')[1];
    cb2.checked = true; cb2.dispatchEvent(new Event("change", { bubbles: true }));
    await sleep(150);
    document.querySelector('#rwProcMask [data-rw-act="proc-next"]').click(); await sleep(350);
    wm = document.getElementById("rwProcMask");
    out.wizStep3 = wm ? wm.textContent.indexOf("标准化预处理") >= 0 : false;
  } catch (e) { out.fatal = String(e && e.message || e); }
  return out;
})()`;
}

async function verifyPage(htmlFile, pageId) {
  await send("Page.navigate", { url: "file:///C:/Users/Windows/Desktop/diwei/" + htmlFile });
  /* 等加载完成 */
  for (let i = 0; i < 40; i++) { await sleep(500); const r = await evalJS("document.readyState"); if (r === "complete") break; }
  await sleep(1500);
  const r = await evalJS(pageDriver(pageId));
  return r;
}

(async () => {
  if (!CHROME) { console.log("NO_CHROME"); process.exit(1); }
  fs.rmSync(PROFILE, { recursive: true, force: true });
  const proc = spawn(CHROME, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
    "--disable-extensions", "--mute-audio", "--hide-scrollbars",
    "--remote-debugging-port=" + PORT, "--remote-allow-origins=*",
    "--user-data-dir=" + PROFILE, "--allow-file-access-from-files",
    "--window-size=1440,940", "about:blank"
  ], { stdio: "ignore" });

  try {
    let ver = null;
    for (let i = 0; i < 60; i++) {
      try { ver = await getJSON("http://127.0.0.1:" + PORT + "/json/version"); break; }
      catch (e) { await sleep(500); }
    }
    if (!ver) { console.log("CDP_NOT_READY"); process.exit(1); }

    const list = await getJSON("http://127.0.0.1:" + PORT + "/json/list");
    const pageTarget = list.find(t => t.type === "page");
    ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    ws.addEventListener("message", ev => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) { pending.get(m.id).res(m); pending.delete(m.id); }
    });
    await send("Page.enable");
    await send("Runtime.enable");
    await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 940, deviceScaleFactor: 1, mobile: false });

    const results = [];
    for (let i = 0; i < PAGES.length; i++) {
      const pageId = PAGES[i].replace(/\.html$/, "").replace("lowdim-ingest-", "");
      const r = await verifyPage(PAGES[i], "lowdim-ingest-" + pageId);
      results.push(r);
      if (i === 0) {
        await shot("C:/Users/Windows/Desktop/diwei/_tools/_verify_collect_audit.png", true).catch(() => {});
      }
    }
    console.log("===RESULT===");
    console.log(JSON.stringify(results, null, 1));
  } finally {
    try { ws && ws.close(); } catch (e) {}
    try { proc.kill(); } catch (e) {}
  }
  process.exit(0);
})().catch(e => { console.log("FATAL:" + (e && e.message || e)); process.exit(1); });
