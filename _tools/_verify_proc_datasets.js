/* 验收 + 取证：数据加工「产品生产」按数据集划分，且与数据库数据集清单对齐 */
"use strict";
const { spawn } = require("child_process");
const fs = require("fs");
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p => fs.existsSync(p));
const PORT = 9371, PROFILE = "C:/Users/Windows/Desktop/diwei/_tools/_verify_profile_pds";
/* 数据库侧权威数据集清单（04.js LOWDIM_DB_OVERVIEW_CONFIGS），用于逐项比对 */
const DB_DATASETS = {
  twod: ["结构特征数据集", "电子结构数据集", "电学性质数据集", "磁学性质数据集", "热学性质数据集", "力学性质数据集", "光学性质数据集", "缺陷性质数据集"],
  catalyst: ["催化材料元素特征数据集", "催化材料结构特征数据集", "单原子催化剂数据集", "二元合金数据集", "晶界数据集", "体系特征数据集"],
  opto: ["有机光电基础数据集", "有机光电物性数据集", "有机光电表征图谱数据集", "有机光电计算数据集"],
  mlff: ["机器学习力场基础数据集", "有机小分子机器学习力场数据集", "高分子机器学习力场数据集"],
  electrolyte: ["有机电解液数据集", "固态有机电解质数据集", "固态无机电解质数据集"]
};
const PAGES = process.argv[2] ? process.argv[2].split(",") : ["twod", "catalyst"];
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

function driver(k) {
  return `(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const o = { errs: [] };
    window.addEventListener("error", e2 => o.errs.push(String(e2.message)));
    const PID = "lowdim-ingest-${k}";
    const lb = document.querySelector("[data-standard-login-submit]");
    if (lb) { lb.click(); await sleep(1600); }
    const nav = document.querySelector('.sidebar .nav-btn[data-page="' + PID + '"]');
    if (nav) { nav.click(); await sleep(1300); }
    const P = () => document.getElementById("page-" + PID);
    const Q = s => { const p = P(); return p ? p.querySelector(s) : null; };
    const M = s => document.querySelector("#rwProcMask " + s);
    const MA = s => [...document.querySelectorAll("#rwProcMask " + s)];
    const click = el => { if (el) el.click(); };
    const fire = (el, t) => { if (el) el.dispatchEvent(new Event(t, { bubbles: true })); };

    /* 先造一条「已入库」记录作为加工数据源（步骤 1 会校验 sourceIds） */
    const et = Q('.rw-tab[data-rw-tab="entry"]'); if (et) { et.click(); await sleep(600); }
    const meBtn = [...P().querySelectorAll('[data-rw-act="entry-manual"]')].filter(b => !b.getAttribute("data-task"))[0];
    if (meBtn) {
      meBtn.click(); await sleep(600);
      let m2 = document.getElementById("rwEntryMask");
      if (m2) {
        const dm = m2.querySelector('[data-rw-act="entry-demo-cif"]'); if (dm) { dm.click(); await sleep(300); }
        m2 = document.getElementById("rwEntryMask") || m2;
        const pz = m2.querySelector('[data-rw-act="entry-parse-cif"]'); if (pz) { pz.click(); await sleep(400); }
        m2 = document.getElementById("rwEntryMask") || m2;
        const sb = m2.querySelector('[data-rw-act="entry-submit"]'); if (sb) { sb.click(); await sleep(700); }
      }
      const ab = Q('[data-rw-act="entry-audit-open"]');
      if (ab) {
        ab.click(); await sleep(600);
        const am = document.getElementById("rwEntryAuditMask");
        if (am) {
          const p = am.querySelector('input[name="rwEntryAuditResult"][value="通过"]');
          if (p) { p.checked = true; p.dispatchEvent(new Event("change", { bubbles: true })); }
          const op = am.querySelector("#rwEntryAuditOpinion"); if (op) { op.value = "字段完整，同意入库。"; }
          const sb2 = am.querySelector('[data-rw-act="entry-audit-submit"]'); if (sb2) { sb2.click(); await sleep(700); }
        }
      }
    }

    /* 进入资源加工 → 新建加工任务 */
    const pt = Q('.rw-tab[data-rw-tab="process"]'); if (pt) { pt.click(); await sleep(600); }
    click(Q('[data-rw-act="proc-new"]')); await sleep(600);
    o.wizardOpen = !!document.getElementById("rwProcMask");
    if (!o.wizardOpen) return o;

    /* 步骤 1：填名称 → 下一步 */
    const nm = M('[data-rw-pf="name"]');
    if (nm) { nm.value = "按数据集划分产出的数据产品加工"; fire(nm, "input"); fire(nm, "change"); await sleep(250); }
    /* 步骤 1 其余必填项：目标用途 / 输出格式 / 数据产品形式（下拉回填默认值）/ 内容 */
    const pu = M('[data-rw-pf="purpose"]'); if (pu) { fire(pu, "change"); }
    const fm = M('[data-rw-pf="format"]'); if (fm) { fire(fm, "change"); }
    const pf2 = M('[data-rw-pf="productForm"]'); if (pf2) { fire(pf2, "change"); }
    const dc2 = M('[data-rw-pf="desc"]');
    if (dc2) { dc2.value = "本次加工按数据集划分产出数据产品，字段口径与数据库保持一致。"; fire(dc2, "input"); fire(dc2, "change"); }
    await sleep(250);
    click(M('[data-rw-act="proc-next"]')); await sleep(500);
    o.step2 = (M(".rw-stepbar-item.is-active") || {}).textContent || "";

    /* 步骤 2：勾基础数据 → 下一步 */
    const b0 = M('input[data-rw-pf="basis"]');
    if (b0) { b0.checked = true; fire(b0, "change"); await sleep(250); }
    click(M('[data-rw-act="proc-run-2"]')); await sleep(600);
    click(M('[data-rw-act="proc-next"]')); await sleep(500);

    /* 步骤 3：执行预处理 → 下一步 */
    click(M('[data-rw-act="proc-run-3"]')); await sleep(600);
    click(M('[data-rw-act="proc-next"]')); await sleep(500);

    /* 步骤 4：选模型 → 执行加工 → 下一步 */
    const mo = M('input[data-rw-pf="model"]');
    if (mo) { mo.checked = true; fire(mo, "change"); await sleep(250); }
    click(M('[data-rw-act="proc-run-4"]')); await sleep(700);
    o.step4Tip = (M(".rw-field-tip") || {}).textContent || "";
    click(M('[data-rw-act="proc-next"]')); await sleep(600);
    o.step5Title = (M(".rw-modal-head h3") || {}).textContent || "";

    /* 步骤 5：数据集划分（2026-10-08 圈红删除产品形态三卡） */
    o.noProductFormSection = (M(".rw-modal-body") || document.getElementById("rwProcMask")).textContent.indexOf("选择数据产品形态") < 0;
    o.noProductRadio = !M('input[data-rw-pf="product"]');
    o.sectionTitles = MA(".rw-section-title").map(x => x.textContent.trim()).join(" | ");
    o.dsCardCount = MA(".rw-pds").length;
    o.dsTitles = MA(".rw-pds .rw-pds-top b").map(x => x.textContent.trim());
    o.dsHasDbName = MA(".rw-pds").every(x => (x.textContent || "").indexOf("入库位置：") >= 0);
    o.dsHasFields = MA(".rw-pds").every(x => (x.textContent || "").indexOf("核心字段：") >= 0);
    o.countText = (M(".rw-ds-count") || {}).textContent || "";

    /* 未勾选数据集时点生产 → 不应产出 */
    click(M('[data-rw-act="proc-run-5"]')); await sleep(600);
    o.blockedWithoutDs = !M(".rw-result");

    /* 勾选前两个数据集 → 计数实时更新 */
    const cbs = MA('input[data-rw-pf="productDs"]');
    o.cbCount = cbs.length;
    if (cbs[0]) { cbs[0].checked = true; fire(cbs[0], "change"); await sleep(200); }
    if (cbs[1]) { cbs[1].checked = true; fire(cbs[1], "change"); await sleep(200); }
    o.countAfter = (M(".rw-ds-count") || {}).textContent || "";
    o.cardOnCount = MA(".rw-pds.is-on").length;

    /* 生产数据产品 */
    click(M('[data-rw-act="proc-run-5"]')); await sleep(800);
    o.resultTitle = (M(".rw-result-title") || {}).textContent || "";
    const rows = MA(".rw-result tbody tr");
    o.resultRowCount = rows.length;
    o.resultRows = rows.map(tr => [...tr.children].map(td => td.textContent.trim()).join(" / "));
    o.resultHasDb = rows.every(tr => (tr.textContent || "").indexOf("数据库 ·") >= 0);
    o.versionText = (M(".rw-result") || {}).textContent ? ((M(".rw-result").textContent.match(/V\\d\\.\\d/) || [])[0] || "") : "";
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
      r.dsAlign = JSON.stringify(r.dsTitles) === JSON.stringify(DB_DATASETS[k]);
      out.pages[k] = r;
      const ok = !r.__EXC__ && r.wizardOpen && r.dsCardCount === DB_DATASETS[k].length && r.dsAlign
        && r.dsHasDbName && r.dsHasFields && r.blockedWithoutDs && r.cardOnCount === 2
        && r.countAfter === "2" && r.resultRowCount === 2 && r.resultHasDb
        && r.noProductFormSection === true && r.noProductRadio === true && (r.errs || []).length === 0;
      if (!ok) out.bad.push(k + " -> " + JSON.stringify({ dsCardCount: r.dsCardCount, align: r.dsAlign, blocked: r.blockedWithoutDs, rows: r.resultRowCount, errs: r.errs }));
    }

    /* 取证截图（twod）：勾选状态 + 产出结果 */
    await send("Page.navigate", { url: "file:///C:/Users/Windows/Desktop/diwei/lowdim-ingest-twod.html" });
    for (let i = 0; i < 40; i++) { await sleep(500); if (await evalJS("document.readyState") === "complete") break; }
    await sleep(1500);
    const shotState = await evalJS(`(async () => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      const lb = document.querySelector("[data-standard-login-submit]"); if (lb) { lb.click(); await sleep(1600); }
      const nav = document.querySelector('.sidebar .nav-btn[data-page="lowdim-ingest-twod"]'); if (nav) { nav.click(); await sleep(1300); }
      const P = () => document.getElementById("page-lowdim-ingest-twod");
      const Q = s => { const p = P(); return p ? p.querySelector(s) : null; };
      const M = s => document.querySelector("#rwProcMask " + s);
      const MA = s => [...document.querySelectorAll("#rwProcMask " + s)];
      const fire = (el, t) => { if (el) el.dispatchEvent(new Event(t, { bubbles: true })); };
      /* 先造一条已入库记录 */
      const et = Q('.rw-tab[data-rw-tab="entry"]'); if (et) { et.click(); await sleep(600); }
      const meBtn = [...P().querySelectorAll('[data-rw-act="entry-manual"]')].filter(b => !b.getAttribute("data-task"))[0];
      if (meBtn) {
        meBtn.click(); await sleep(600);
        let m2 = document.getElementById("rwEntryMask");
        if (m2) {
          const dm = m2.querySelector('[data-rw-act="entry-demo-cif"]'); if (dm) { dm.click(); await sleep(300); }
          m2 = document.getElementById("rwEntryMask") || m2;
          const pz = m2.querySelector('[data-rw-act="entry-parse-cif"]'); if (pz) { pz.click(); await sleep(400); }
          m2 = document.getElementById("rwEntryMask") || m2;
          const sb = m2.querySelector('[data-rw-act="entry-submit"]'); if (sb) { sb.click(); await sleep(700); }
        }
        const ab = Q('[data-rw-act="entry-audit-open"]');
        if (ab) {
          ab.click(); await sleep(600);
          const am = document.getElementById("rwEntryAuditMask");
          if (am) {
            const p = am.querySelector('input[name="rwEntryAuditResult"][value="通过"]');
            if (p) { p.checked = true; p.dispatchEvent(new Event("change", { bubbles: true })); }
            const op = am.querySelector("#rwEntryAuditOpinion"); if (op) { op.value = "字段完整，同意入库。"; }
            const sb2 = am.querySelector('[data-rw-act="entry-audit-submit"]'); if (sb2) { sb2.click(); await sleep(700); }
          }
        }
      }
      const pt = Q('.rw-tab[data-rw-tab="process"]'); if (pt) { pt.click(); await sleep(600); }
      if (Q('[data-rw-act="proc-new"]')) Q('[data-rw-act="proc-new"]').click(); await sleep(600);
      const nm = M('[data-rw-pf="name"]'); if (nm) { nm.value = "MoS2 电子结构数据产品加工"; fire(nm, "input"); fire(nm, "change"); }
      const pu = M('[data-rw-pf="purpose"]'); if (pu) { fire(pu, "change"); }
      const fm = M('[data-rw-pf="format"]'); if (fm) { fire(fm, "change"); }
      const pf2 = M('[data-rw-pf="productForm"]'); if (pf2) { fire(pf2, "change"); }
      const dc2 = M('[data-rw-pf="desc"]');
      if (dc2) { dc2.value = "产出结构特征、电子结构与光学性质三类数据集，字段口径与数据库一致。"; fire(dc2, "input"); fire(dc2, "change"); }
      await sleep(250);
      if (M('[data-rw-act="proc-next"]')) M('[data-rw-act="proc-next"]').click(); await sleep(500);
      const b0 = M('input[data-rw-pf="basis"]'); if (b0) { b0.checked = true; fire(b0, "change"); }
      await sleep(250);
      if (M('[data-rw-act="proc-run-2"]')) M('[data-rw-act="proc-run-2"]').click(); await sleep(600);
      if (M('[data-rw-act="proc-next"]')) M('[data-rw-act="proc-next"]').click(); await sleep(500);
      if (M('[data-rw-act="proc-run-3"]')) M('[data-rw-act="proc-run-3"]').click(); await sleep(600);
      if (M('[data-rw-act="proc-next"]')) M('[data-rw-act="proc-next"]').click(); await sleep(500);
      const mo = M('input[data-rw-pf="model"]'); if (mo) { mo.checked = true; fire(mo, "change"); }
      await sleep(250);
      if (M('[data-rw-act="proc-run-4"]')) M('[data-rw-act="proc-run-4"]').click(); await sleep(700);
      if (M('[data-rw-act="proc-next"]')) M('[data-rw-act="proc-next"]').click(); await sleep(600);
      await sleep(250);
      /* 勾结构特征 + 电子结构 + 光学性质 */
      const cbs = MA('input[data-rw-pf="productDs"]');
      [0, 1, 6].forEach(i => { if (cbs[i]) { cbs[i].checked = true; fire(cbs[i], "change"); } });
      await sleep(350);
      return 1;
    })()`);
    await sleep(400);
    await shot("C:/Users/Windows/Desktop/diwei/_tools/_verify_proc_ds_select.png");
    await evalJS("(function(){var b=document.querySelector('#rwProcMask [data-rw-act=\"proc-run-5\"]');if(b)b.click();return 1;})()");
    await sleep(900);
    await shot("C:/Users/Windows/Desktop/diwei/_tools/_verify_proc_ds_result.png");

    console.log("===RESULT===");
    console.log(JSON.stringify(out, null, 2));
  } catch (e) {
    console.log("FATAL:" + e.message + "\n" + JSON.stringify(out, null, 2));
  } finally { try { ws && ws.close(); } catch (e) {} try { proc.kill(); } catch (e) {} }
  process.exit(0);
})().catch(e => { console.log("FATAL:" + e.message); process.exit(1); });
