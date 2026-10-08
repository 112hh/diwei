/* =====================================================================
   62-standard-system.js
   低维材料标准体系页（page-standard-twod）· 本库标准视图
   ---------------------------------------------------------------------
   背景：功能清单第 1-5 项要求「二维 / 有机光电 / 电解质 / 机器学习力场 /
   催化材料数据库标准」，每类包含摘要规范、选择标准、计算条件标准、数据
   质量衡量标准、筛选标准（电解质另含环境标准、MLFF 另含模型准备完成标准）。
   这些数据在 49.js 的 window.LOWDIM_STD_LIBRARY[*].systemStandards 中
   已完整定义，但标准体系页原先只渲染「外部国标引用清单」，本库自定标准
   没有落页面。本文件把这段内容接回页面。

   设计：主视图切换
     ① 本库标准（默认）—— 按材料分 5 类，每类下按标准项分 Tab
     ② 引用国标/规范（现行）—— 沿用原有渲染，不做改动
   原则：只包装渲染函数，不改动 04.js / 49.js 任何既有逻辑。
   ===================================================================== */
(function () {
  "use strict";
  if (window.__STD_SYSTEM_PATCHED__) return;
  window.__STD_SYSTEM_PATCHED__ = true;

  /* ------------------------------ 基础工具 ------------------------------ */
  function esc(v) {
    if (typeof escapeLowDimHtml === "function") return escapeLowDimHtml(v == null ? "" : String(v));
    if (typeof escapeLowdimStandardHtml === "function") return escapeLowdimStandardHtml(v == null ? "" : String(v));
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function toast(t, b) {
    if (typeof showToast === "function") showToast(t, b);
  }

  /* 材料类型 Tab 文案 → 规则库 key */
  var TYPE_MAP = [
    { kw: "二维",     key: "twod" },
    { kw: "有机光电", key: "opto" },
    { kw: "电解质",   key: "electrolyte" },
    { kw: "力场",     key: "mlff" },
    { kw: "催化",     key: "catalyst" }
  ];

  function keyOfType(typeName) {
    var t = String(typeName || "");
    for (var i = 0; i < TYPE_MAP.length; i++) {
      if (t.indexOf(TYPE_MAP[i].kw) >= 0) return TYPE_MAP[i].key;
    }
    return "twod";
  }

  /* 读取现有渲染里的类型 Tab 列表，保证与页面既有口径一致 */
  var DEFAULT_TYPES = [
    "二维材料数据库标准体系",
    "有机光电材料数据库标准体系",
    "电解质材料数据库标准体系",
    "机器学习力场数据库标准体系",
    "催化材料数据库标准体系"
  ];
  function typeTabs() {
    try {
      if (typeof LOWDIM_STANDARD_SYSTEM_TYPES !== "undefined" &&
          Array.isArray(LOWDIM_STANDARD_SYSTEM_TYPES) &&
          LOWDIM_STANDARD_SYSTEM_TYPES.length) {
        return LOWDIM_STANDARD_SYSTEM_TYPES;
      }
    } catch (e) { /* ignore */ }
    return DEFAULT_TYPES;
  }

  function lib(key) {
    var L = window.LOWDIM_STD_LIBRARY || {};
    return L[key] || null;
  }

  /* ------------------------------ 状态 ------------------------------ */
  function S() {
    if (!window.__stdSystemState) {
      window.__stdSystemState = {
        view: "own",        // own = 本库标准；gb = 引用国标
        type: null,         // 当前材料类型 Tab 文案
        stdIndex: 0,        // 当前标准项 Tab 序号
        detail: null        // 展开的要点行
      };
    }
    return window.__stdSystemState;
  }

  /* ------------------------------ 样式 ------------------------------ */
  var STYLE_ID = "stdSystemPatchStyle";
  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = `
      #page-standard-twod .stdsys-viewbar{display:flex;gap:8px;align-items:center;margin:0 0 14px;}
      #page-standard-twod .stdsys-viewbar button{min-height:38px;padding:0 18px;border:1px solid #cfdcee;
        border-radius:8px;background:#fff;color:#33456b;font-weight:700;font-size:14px;cursor:pointer;}
      #page-standard-twod .stdsys-viewbar button.active{background:#165DFF;border-color:#165DFF;color:#fff;}
      #page-standard-twod .stdsys-viewbar .stdsys-viewhint{margin-left:auto;font-size:12px;color:#7b8ca6;}
      #page-standard-twod .stdsys-meta{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 14px;}
      #page-standard-twod .stdsys-chip{padding:5px 12px;border-radius:999px;background:#eaf2ff;color:#165DFF;
        font-size:12px;font-weight:700;}
      #page-standard-twod .stdsys-chip.gray{background:#f1f5fa;color:#5b7292;}
      #page-standard-twod .stdsys-stdtabs{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 16px;
        border-bottom:1px solid #e5eaf3;padding-bottom:14px;}
      #page-standard-twod .stdsys-stdtabs button{padding:8px 14px;border:1px solid #d7e0ef;border-radius:8px;
        background:#fff;color:#33456b;font-size:13px;font-weight:700;cursor:pointer;text-align:left;}
      #page-standard-twod .stdsys-stdtabs button.active{background:#eaf2ff;border-color:#165DFF;color:#165DFF;}
      #page-standard-twod .stdsys-card{border:1px solid #dde6f2;border-radius:10px;background:#fff;
        padding:18px 20px;box-shadow:0 2px 10px rgba(31,55,92,.05);}
      #page-standard-twod .stdsys-card + .stdsys-card{margin-top:14px;}
      #page-standard-twod .stdsys-card-head{display:flex;align-items:flex-start;justify-content:space-between;
        gap:12px;flex-wrap:wrap;border-bottom:1px solid #eef2f8;padding-bottom:12px;margin-bottom:12px;}
      #page-standard-twod .stdsys-card-head h3{margin:0;font-size:17px;color:#12305c;}
      #page-standard-twod .stdsys-card-head p{margin:6px 0 0;color:#6b7f9c;font-size:13px;line-height:1.7;}
      #page-standard-twod .stdsys-goto{padding:7px 14px;border-radius:8px;border:1px solid #165DFF;
        background:#fff;color:#165DFF;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;}
      #page-standard-twod .stdsys-table{width:100%;border-collapse:collapse;font-size:13px;}
      #page-standard-twod .stdsys-table th{background:#eaf2ff;color:#165DFF;font-weight:800;text-align:left;
        padding:10px 12px;border:1px solid #dbe5f3;}
      #page-standard-twod .stdsys-table td{padding:10px 12px;border:1px solid #e7edf6;color:#2c4261;
        line-height:1.7;vertical-align:top;}
      #page-standard-twod .stdsys-table td.idx{width:52px;text-align:center;color:#7b8ca6;font-weight:700;}
      #page-standard-twod .stdsys-table td.cat{width:150px;font-weight:700;color:#1f3f6b;white-space:nowrap;}
      #page-standard-twod .stdsys-empty{padding:26px;text-align:center;color:#8b9bb2;background:#fafbfe;
        border:1px dashed #dbe3ef;border-radius:8px;}
      #page-standard-twod .stdsys-note{margin-top:12px;padding:10px 14px;border-left:4px solid #165DFF;
        background:#f5f8ff;border-radius:0 8px 8px 0;color:#41597f;font-size:13px;line-height:1.7;}
      #page-standard-twod .stdsys-flow{margin-top:14px;border:1px solid #e5eaf3;border-radius:8px;padding:14px 16px;
        background:#fbfcfe;}
      #page-standard-twod .stdsys-flow h4{margin:0 0 8px;font-size:14px;color:#1f3f6b;}
      #page-standard-twod .stdsys-flow ol{margin:0;padding-left:20px;color:#41597f;font-size:13px;line-height:1.8;}
      #page-standard-twod .stdsys-linkbar{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;
        padding-top:12px;border-top:1px solid #eef2f8;}
      #page-standard-twod .stdsys-linkbar button{padding:7px 14px;border:1px solid #cfdcee;border-radius:8px;
        background:#fff;color:#33456b;font-size:13px;font-weight:700;cursor:pointer;}
      #page-standard-twod .stdsys-linkbar button:hover{border-color:#165DFF;color:#165DFF;}
    `;
    document.head.appendChild(s);
  }

  /* ------------------------------ 渲染：本库标准 ------------------------------ */
  /* 把 "结构特征：原子结构图、化学式" 拆成 类别 / 内容 两列 */
  function splitPoint(p) {
    var s = String(p || "");
    var i = s.indexOf("：");
    if (i < 0) i = s.indexOf(":");
    if (i > 0 && i < 18) {
      return { cat: s.slice(0, i).trim(), text: s.slice(i + 1).trim() };
    }
    return { cat: "", text: s.trim() };
  }

  function renderPointsTable(points) {
    var rows = (points || []).map(splitPoint);
    /* 若全部能拆出类别，用三列表；否则两列表 */
    var hasCat = rows.some(function (r) { return !!r.cat; });
    var head = hasCat
      ? '<tr><th style="width:52px">序号</th><th style="width:150px">类别</th><th>标准内容</th></tr>'
      : '<tr><th style="width:52px">序号</th><th>标准内容</th></tr>';
    var body = rows.map(function (r, i) {
      var idx = '<td class="idx">' + (i + 1) + "</td>";
      return hasCat
        ? "<tr>" + idx + '<td class="cat">' + esc(r.cat) + "</td><td>" + esc(r.text) + "</td></tr>"
        : "<tr>" + idx + "<td>" + esc(r.text) + "</td></tr>";
    }).join("");
    return '<table class="stdsys-table"><thead>' + head + "</thead><tbody>" + body + "</tbody></table>";
  }

  /* 计算条件标准 → 对应标准化页 */
  function stdPageOf(key) {
    return "lowdim-standardization-" + key;
  }

  function renderOwnView() {
    var st = S();
    var tabs = typeTabs();
    if (!st.type) st.type = tabs[0];
    var key = keyOfType(st.type);
    var L = lib(key);
    var standards = (L && L.systemStandards) || [];
    if (st.stdIndex >= standards.length) st.stdIndex = 0;
    var cur = standards[st.stdIndex] || null;

    var page = document.getElementById("page-standard-twod");
    if (!page) return;

    var stdTabs = standards.map(function (s, i) {
      return '<button type="button" class="' + (i === st.stdIndex ? "active" : "") +
        '" data-stdsys-std="' + i + '">' + esc(s.name) + "</button>";
    }).join("");

    var body;
    if (!cur) {
      body = '<div class="stdsys-card"><div class="stdsys-empty">该材料暂无标准项定义</div></div>';
    } else {
      var isCalc = String(cur.name).indexOf("计算条件") >= 0;
      body =
        '<div class="stdsys-card">' +
          '<div class="stdsys-card-head">' +
            "<div><h3>" + esc(cur.name) + "</h3><p>" + esc(cur.brief || "") + "</p></div>" +
            (isCalc
              ? '<button type="button" class="stdsys-goto" data-stdsys-goto="' + esc(stdPageOf(key)) +
                '">查看完整计算参数 →</button>'
              : "") +
          "</div>" +
          renderPointsTable(cur.points) +
          '<div class="stdsys-note">依据：《' + esc((L && L.standardName) || (L && L.database) || "") +
            "》· 功能清单第 " + (TYPE_MAP.findIndex(function (m) { return m.key === key; }) + 1) +
            " 项。标准项由标准体系建设组维护，采集加工处理与数据标准化环节直接调用。</div>" +
        "</div>";
    }

    /* 总体工作流程（每类材料都有 lead + workflow） */
    var flow = "";
    if (L && Array.isArray(L.workflow) && L.workflow.length) {
      flow =
        '<div class="stdsys-flow"><h4>《' + esc(L.standardName || L.database) + "》总体工作流程</h4>" +
        "<ol>" + L.workflow.map(function (w) {
          return "<li><strong>" + esc(w.title) + "</strong>：" + esc(w.text) + "</li>";
        }).join("") + "</ol></div>";
    }

    page.innerHTML =
      '<div class="stdsys-viewbar">' +
        '<button type="button" class="' + (st.view === "own" ? "active" : "") + '" data-stdsys-view="own">本库标准</button>' +
        '<button type="button" class="' + (st.view === "gb" ? "active" : "") + '" data-stdsys-view="gb">引用国标 / 规范</button>' +
        '<span class="stdsys-viewhint">本库标准对应功能清单第 1-5 项；引用国标为平台遵循的外部文件</span>' +
      "</div>" +
      '<div class="stdsys-meta">' +
        '<span class="stdsys-chip">' + esc((L && L.standardName) || "") + "</span>" +
        '<span class="stdsys-chip gray">共 ' + standards.length + " 类标准</span>" +
        (L && L.target ? '<span class="stdsys-chip gray">标准化数据量 ≥ ' + esc(L.target) + " 条</span>" : "") +
        (L && L.source ? '<span class="stdsys-chip gray">计算方法：' + esc(L.source) + "</span>" : "") +
      "</div>" +
      '<div class="stdsys-stdtabs" role="tablist" aria-label="标准体系分类">' +
        tabs.map(function (t) {
          return '<button type="button" class="' + (t === st.type ? "active" : "") +
            '" data-stdsys-type="' + esc(t) + '">' + esc(t) + "</button>";
        }).join("") +
      "</div>" +
      (stdTabs ? '<div class="stdsys-stdtabs" role="tablist" aria-label="标准项">' + stdTabs + "</div>" : "") +
      body +
      flow +
      '<div class="stdsys-card"><div class="stdsys-linkbar">' +
        '<button type="button" data-stdsys-goto="' + esc(stdPageOf(key)) + '">前往《' +
          esc((L && L.standardizationName) || "数据标准化") + '》</button>' +
        '<button type="button" data-stdsys-goto="lowdim-ingest-' + esc(key) + '">前往《' +
          esc((L && L.short) || "材料") + '数据采集加工处理》</button>' +
        '<button type="button" data-stdsys-view="gb">查看引用国标 / 规范</button>' +
      "</div></div>";
  }

  /* ------------------------------ 事件 ------------------------------ */
  function bindEvents() {
    if (document.body.dataset.stdsysBound === "true") return;
    document.body.dataset.stdsysBound = "true";
    document.addEventListener("click", function (e) {
      var t = e.target;
      if (!t || typeof t.closest !== "function") return;

      var v = t.closest("[data-stdsys-view]");
      if (v) { S().view = v.dataset.stdsysView || "own"; render(); return; }

      var ty = t.closest("[data-stdsys-type]");
      if (ty) {
        var s = S();
        s.type = ty.dataset.stdsysType;
        s.stdIndex = 0;
        render();
        return;
      }

      var sd = t.closest("[data-stdsys-std]");
      if (sd) { S().stdIndex = Number(sd.dataset.stdsysStd || 0); render(); return; }

      var go = t.closest("[data-stdsys-goto]");
      if (go) {
        var pid = go.dataset.stdsysGoto;
        if (pid && typeof goToPage === "function") { goToPage(pid); return; }
        if (pid && typeof navigateTo === "function") { navigateTo(pid); return; }
        /* 兜底：直接切 section */
        var sec = document.getElementById("page-" + pid);
        if (sec) {
          Array.prototype.forEach.call(document.querySelectorAll("section.page"), function (x) {
            x.classList.remove("active");
          });
          sec.classList.add("active");
          if (typeof state !== "undefined") state.page = pid;
          try { window.scrollTo(0, 0); } catch (err) {}
          if (typeof renderLowdimStandardizationPage === "function" && pid.indexOf("lowdim-standardization-") === 0) {
            renderLowdimStandardizationPage(pid);
          }
          if (typeof renderLowdimIngestPage === "function" && pid.indexOf("lowdim-ingest-") === 0) {
            renderLowdimIngestPage(pid);
          }
        }
        return;
      }
    }, false);
  }

  /* ------------------------------ 接管渲染 ------------------------------ */
  var baseRender = null;

  function render() {
    ensureStyle();
    var st = S();
    if (st.view === "gb") {
      /* 引用国标：交还原渲染 */
      if (typeof baseRender === "function") baseRender();
      return;
    }
    renderOwnView();
  }

  function patch() {
    var fn = window.renderLowdimStandardSystemPage;
    if (typeof fn !== "function") { setTimeout(patch, 80); return; }
    if (fn.__stdSysPatched) return;
    baseRender = fn;
    var wrapped = function () {
      /* 详情页 / 管理页保持原逻辑，不接管 */
      try {
        if (state && state.page === "standard-system-manage") { return baseRender.apply(this, arguments); }
        var std = (typeof getLowdimStandardSystemState === "function") ? getLowdimStandardSystemState() : null;
        if (std && std.detailId) { return baseRender.apply(this, arguments); }
      } catch (e) { /* ignore */ }
      render();
    };
    wrapped.__stdSysPatched = true;
    window.renderLowdimStandardSystemPage = wrapped;
    try { renderLowdimStandardSystemPage = wrapped; } catch (e) { /* ignore */ }
    /* 标准体系页也可能经由 renderTwodStandardPage 进入 */
    try {
      if (typeof window.renderTwodStandardPage === "function") {
        window.renderTwodStandardPage = wrapped;
      }
    } catch (e) { /* ignore */ }
  }

  function boot() {
    ensureStyle();
    bindEvents();
    patch();
    var go = function () {
      var el = document.getElementById("page-standard-twod");
      if (!el) return;
      var active = el.classList.contains("active") ||
        (typeof state !== "undefined" && String(state.page || "").indexOf("standard") === 0);
      if (active) render();
    };
    go();
    [60, 200, 500, 1000, 1800].forEach(function (d) { setTimeout(go, d); });
  }

  boot();
})();
