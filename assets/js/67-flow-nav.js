/* =============================================================================
   66-flow-nav.js —— 三类页面互跳导航（方案 F8）

   主链路：采集加工处理 → 加工产物交接 → 数据标准化 → 输出归档 → 数据集入库
   原实现每一类页面都是孤岛：入库页有「前往标准化」的文案却跳不动，
   数据库页只能看到"入库记录承接标准化归档推送"，却回不去上游。验收走链路时
   必须手动回左侧导航翻页，闭环体验是断的。

   本文件在 15 个页面（入库 5 / 标准化 5 / 数据库 5）顶部注入统一的链路导航条，
   让三页互相可达：

       入库 ──[前往数据标准化]──> 标准化 ──[前往数据库]──> 数据库
         ↑                                                  │
         └────────────[前往采集加工处理]─────────────────────┘
   ============================================================================= */
(function () {
  "use strict";
  if (window.__FLOW_NAV_READY__) return;
  window.__FLOW_NAV_READY__ = true;

  var PREFIX = "flowNav-";
  var STYLE_ID = "flowNavStyle";
  var KEYS = ["twod", "opto", "electrolyte", "mlff", "catalyst"];
  var SHORT = { twod: "二维材料", opto: "有机光电材料", electrolyte: "电解质材料", mlff: "机器学习力场", catalyst: "催化材料" };

  /* 每类页面：当前环节 + 上下游目标 */
  /* 2026-10-08 需求：加工处理（ingest）页面顶部不再显示链路导航条（用户圈红隐藏），
     因此不再登记 lowdim-ingest-* 条目；标准化页与数据库页保持不变。 */
  var MAP = {};
  KEYS.forEach(function (k) {
    var s = SHORT[k];
    MAP["lowdim-standardization-" + k] = {
      kind: "std", key: k, here: "数据标准化",
      links: [
        { to: "lowdim-ingest-" + k, label: "← 前往" + s + "采集加工处理", tip: "编号 6-22" },
        { to: "lowdim-database-" + k, label: "前往" + s + "数据库 →", tip: "编号 28-51" }
      ]
    };
    MAP["lowdim-database-" + k] = {
      kind: "db", key: k, here: "数据集入库",
      links: [
        { to: "lowdim-ingest-" + k, label: "← 前往" + s + "采集加工处理", tip: "编号 6-22" },
        { to: "lowdim-standardization-" + k, label: "← 前往" + s + "数据标准化", tip: "编号 23-27" }
      ]
    };
  });

  var CHAIN = [
    { kind: "ingest", label: "① 采集加工处理" },
    { kind: "std", label: "② 数据标准化" },
    { kind: "db", label: "③ 数据集入库" }
  ];

  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function goto(pid) {
    try {
      if (typeof switchPage === "function") { switchPage(pid); return; }
      if (typeof goToPage === "function") { goToPage(pid); return; }
      if (typeof navigateTo === "function") { navigateTo(pid); return; }
    } catch (e) { /* ignore */ }
    var sec = document.getElementById("page-" + pid);
    if (!sec) return;
    var all = document.querySelectorAll("section.page");
    Array.prototype.forEach.call(all, function (x) { x.classList.remove("active"); });
    sec.classList.add("active");
    try { if (typeof state !== "undefined" && state) state.page = pid; } catch (e) {}
    try { window.scrollTo(0, 0); } catch (e) {}
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = [
      ".flow-nav { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin:0 0 14px; padding:10px 14px; border:1px solid #d9e5f7; border-radius:10px; background:linear-gradient(180deg,#fbfdff,#f4f8ff); }",
      ".flow-nav .fn-chain { display:flex; align-items:center; gap:6px; flex-wrap:wrap; color:#8ba0bb; font-size:12px; font-weight:700; }",
      ".flow-nav .fn-node { padding:3px 9px; border-radius:6px; background:#fff; border:1px solid #e2eaf6; color:#7b8ca6; }",
      ".flow-nav .fn-node.is-here { background:#165DFF; border-color:#165DFF; color:#fff; }",
      ".flow-nav .fn-sep { color:#c3d1e2; }",
      ".flow-nav .fn-acts { display:flex; gap:8px; flex-wrap:wrap; margin-left:auto; }",
      ".flow-nav .fn-btn { min-height:32px; padding:0 13px; border:1px solid #cfdcee; border-radius:8px; background:#fff; color:#33456b; font-size:12.5px; font-weight:700; cursor:pointer; white-space:nowrap; }",
      ".flow-nav .fn-btn:hover { border-color:#165DFF; color:#165DFF; background:#f5f9ff; }",
      ".flow-nav .fn-btn em { font-style:normal; color:#a3b4ca; font-weight:600; margin-left:5px; }",
      ".flow-nav .fn-btn:hover em { color:#7ba7ff; }"
    ].join("\n");
    document.head.appendChild(s);
  }

  function navHtml(cfg) {
    var chain = CHAIN.map(function (c) {
      var on = c.kind === cfg.kind;
      return '<span class="fn-node' + (on ? " is-here" : "") + '">' + esc(c.label) + "</span>";
    }).join('<span class="fn-sep">→</span>');

    var acts = cfg.links.map(function (l) {
      return '<button type="button" class="fn-btn" data-flownav-to="' + esc(l.to) + '">' +
        esc(l.label) + "<em>" + esc(l.tip) + "</em></button>";
    }).join("");

    return '<div class="flow-nav" data-flownav="' + esc(cfg.kind) + '">' +
      '<span class="fn-chain">' + chain + "</span>" +
      '<span class="fn-acts">' + acts + "</span>" +
      "</div>";
  }

  function injectOne(pid) {
    /* 2026-10-08 需求：标准化与数据库页面顶部的链路导航条（① 采集加工处理 ② 数据标准化 ③ 数据集入库
       + 右侧「前往采集加工处理 / 前往数据库」跳转按钮）按用户圈红要求整体隐藏，
       与此前加工处理页的处理保持一致：不再注入任何 flow-nav。 */
    return;
    var cfg = MAP[pid];
    if (!cfg) return;
    var page = document.getElementById("page-" + pid);
    if (!page) return;
    /* 只在当前激活页注入，避免 36 份 HTML 里其余页面也跟着渲染 */
    if (!page.classList.contains("active")) {
      var act = document.querySelector("section.page.active");
      if (!act || act.id !== ("page-" + pid)) return;
    }
    /* 已存在则直接返回：避免「移除→插入」再次触发 MutationObserver 形成死循环 */
    var kids = page.children || [];
    for (var i = 0; i < kids.length; i++) {
      if (kids[i].classList && kids[i].classList.contains("flow-nav")) return;
    }
    ensureStyle();
    page.insertAdjacentHTML("afterbegin", navHtml(cfg));
  }

  var timer = null;
  function reassert() {
    Object.keys(MAP).forEach(function (pid) {
      try { injectOne(pid); } catch (e) { /* ignore */ }
    });
  }

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || typeof t.closest !== "function") return;
    var b = t.closest("[data-flownav-to]");
    if (!b) return;
    goto(b.getAttribute("data-flownav-to"));
  }, false);

  function boot() {
    if (typeof MutationObserver === "undefined") return;
    var obs = new MutationObserver(function () {
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        try { reassert(); } catch (e) { /* ignore */ }
      }, 90);
    });
    obs.observe(document.body, { childList: true, subtree: true });
    setTimeout(reassert, 500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
