/* ============================================================================
   二维材料数据库 —— 渲染与事件（20260923）
   本片段由 _tools/build2.py 合并进 assets/js/99-layer.js 的单层 IIFE 中，
   因此文件自身不再包裹 (function(){...})()。
   ========================================================================== */

  var PAGE_ID = "lowdim-database-twod";
  var STYLE_ID = "twod-db-rewrite-20260923";

  var esc = function (v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };
  var fmt = function (v) {
    return String(v == null ? "" : v).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  var MB = function (v) { return v >= 1024 ? (v / 1024).toFixed(2) + " GB" : v.toFixed(2) + " MB"; };
  var KB = function (v) { return v.toFixed(2) + "KB"; };
  var isEmpty = function (v) { return v === null || v === undefined || v === ""; };

  /* ==========================================================================
     1. 字段与数据装配
     ========================================================================== */
  var DS = {};
  DATASETS.forEach(function (d) {
    d.fields = buildFields(d.key);
    d.samples = buildRows(d.key);      /* 示例记录数组，勿覆盖 d.rows（数据量） */
    d.sampleCount = d.samples.length;
    d.fieldCount = d.fields.length;
    d.storage = MB(d.size);
    DS[d.key] = d;
  });

  /* 库级基本信息（信息概览页签展示） */
  var DB_META = {
    name: "二维材料数据库",
    creator: "马兴",
    updated: "2026-09-15 18:20:07"
  };

  /* 库表清单：八大数据集，与左侧目录一一对应，点击名称跳转到对应数据集 */
  var DB_TABLES = [
    { key: "structure",  name: "结构特征数据集", type: "结构特征", rows: 2345, fieldCount: 12, size: 132.21 },
    { key: "electronic", name: "电子结构数据集", type: "电子结构", rows: 1345, fieldCount: 5,  size: 32.21  },
    { key: "electrical", name: "电学性质数据集", type: "电学性质", rows: 2345, fieldCount: 6,  size: 132.21 },
    { key: "magnetic",   name: "磁学性质数据集", type: "磁学性质", rows: 2345, fieldCount: 4,  size: 132.21 },
    { key: "thermal",    name: "热学性质数据集", type: "热学性质", rows: 2345, fieldCount: 3,  size: 132.21 },
    { key: "mechanical", name: "力学性质数据集", type: "力学性质", rows: 2345, fieldCount: 6,  size: 132.21 },
    { key: "optical",    name: "光学性质数据集", type: "光学性质", rows: 2345, fieldCount: 5,  size: 132.21 },
    { key: "defect",     name: "缺陷性质数据集", type: "缺陷性质", rows: 2345, fieldCount: 5,  size: 132.21 }
  ];

  /* 库级汇总：以库表清单为准 */
  var TOTAL = (function () {
    var t = { rows: 0, fields: 0, size: 0 };
    DB_TABLES.forEach(function (x) {
      t.rows += x.rows;
      t.fields += x.fieldCount;
      t.size += x.size;
    });
    t.sizeText = KB(t.size);
    return t;
  })();

  /* 目录树：一级 = 二维材料数据库；二级 = 八大数据集 */
  var TREE = [{
    id: "db-root", label: "二维材料数据库", code: "gkx_ldm", kind: "db", count: DB_TABLES.length,
    children: DATASETS.map(function (d) {
      return { id: "ds:" + d.key, label: d.label, code: d.table, kind: "ds", key: d.key, count: d.rows };
    })
  }];

  /* ==========================================================================
     2. 页面状态
     ========================================================================== */
  function getState() {
    if (typeof state === "undefined") return { open: { "db-root": true }, node: "db-root", tab: "tables", q1: "", q2: "", page: {}, per: 10 };
    if (!state.twodDbRewrite) {
      state.twodDbRewrite = { open: { "db-root": true }, node: "db-root", tab: "tables", q1: "", q2: "", page: {}, per: 10 };
    }
    var s = state.twodDbRewrite;
    if (!s.open) s.open = { "db-root": true };
    if (!s.node) s.node = "db-root";
    if (!s.tab) s.tab = "tables";
    if (typeof s.q1 !== "string") s.q1 = "";
    if (typeof s.q2 !== "string") s.q2 = "";
    if (!s.page || typeof s.page !== "object") s.page = {};   /* 各列表当前页，键 = 列表标识 */
    if (typeof s.per !== "number") s.per = 10;                /* 每页条数 */
    return s;
  }

  /* ==========================================================================
     3. 样式
     ========================================================================== */
  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var P = "#page-lowdim-database-twod ";
    var css = [
      P + ".t2d-root { display:flex; gap:0; min-width:0; align-items:stretch; background:#fff; border:1px solid #e4ecf8; border-radius:12px; overflow:hidden; }",

      /* ---- 左侧目录 ---- */
      P + ".t2d-side { flex:0 0 264px; width:264px; border-right:1px solid #e8eef6; background:#fbfdff; padding:14px 12px 22px; }",
      P + ".t2d-side-head { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:0 4px 12px; }",
      P + ".t2d-side-head h3 { margin:0; color:#0b2a63; font-size:15px; font-weight:800; letter-spacing:.2px; }",
      P + ".t2d-search { position:relative; margin:0 4px 12px; }",
      P + ".t2d-search input { width:100%; height:34px; padding:0 30px 0 12px; border:1px solid #d9e5f5; border-radius:8px; background:#fff; color:#31527d; font-size:13px; font-family:inherit; }",
      P + ".t2d-search input:focus { outline:none; border-color:#165DFF; box-shadow:0 0 0 2px rgba(22,93,255,.1); }",
      P + ".t2d-search input::placeholder { color:#a8b9d0; }",
      P + ".t2d-search .t2d-search-ico { position:absolute; right:10px; top:50%; transform:translateY(-50%); color:#a8b9d0; font-size:13px; pointer-events:none; }",
      P + ".t2d-tree { display:grid; gap:2px; }",
      P + ".t2d-node { display:flex; align-items:center; gap:8px; width:100%; padding:9px 10px; border:0; border-radius:8px; background:transparent; color:#2f4a70; font-size:13.5px; font-family:inherit; font-weight:600; text-align:left; cursor:pointer; line-height:1.5; }",
      P + ".t2d-node:hover { background:#f1f7ff; color:#165DFF; }",
      P + ".t2d-node.is-active { background:#e8f2ff; color:#165DFF; font-weight:800; }",
      P + ".t2d-node.is-root { font-size:14.5px; font-weight:800; color:#12315e; padding:10px 10px; }",
      P + ".t2d-node .t2d-caret { flex:0 0 auto; width:12px; color:#8ba0bb; font-size:10px; transition:transform .18s ease; }",
      P + ".t2d-node.is-open .t2d-caret { transform:rotate(90deg); }",
      P + ".t2d-node .t2d-ico { flex:0 0 auto; width:16px; height:16px; display:grid; place-items:center; color:#5c86c9; }",
      P + ".t2d-node.is-active .t2d-ico, " + P + ".t2d-node:hover .t2d-ico { color:#165DFF; }",
      P + ".t2d-node .t2d-ico svg { width:15px; height:15px; }",
      P + ".t2d-node .t2d-txt { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }",
      P + ".t2d-node .t2d-cnt { flex:0 0 auto; min-width:22px; padding:1px 7px; border-radius:20px; background:#eef3fa; color:#7b90ad; font-size:11.5px; font-weight:700; text-align:center; }",
      P + ".t2d-node.is-active .t2d-cnt { background:#d6e8ff; color:#165DFF; }",
      P + ".t2d-children { display:grid; gap:2px; margin:2px 0 6px 16px; padding-left:8px; border-left:1px dashed #dde8f5; }",
      P + ".t2d-children.is-folded { display:none; }",

      /* ---- 右侧主区 ---- */
      P + ".t2d-main { flex:1; min-width:0; padding:18px 22px 26px; background:#fff; }",
      P + ".t2d-crumb { display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:12px; color:#93a8c4; font-size:12.5px; }",
      P + ".t2d-crumb b { color:#4b6b96; font-weight:600; }",
      P + ".t2d-title-row { display:flex; align-items:flex-start; gap:10px; flex-wrap:wrap; margin-bottom:6px; }",
      P + ".t2d-title-row h2 { margin:0; color:#0b2a63; font-size:23px; font-weight:800; line-height:1.3; }",
      P + ".t2d-badge { display:inline-flex; align-items:center; height:22px; padding:0 10px; margin-top:3px; border-radius:6px; background:#e8f2ff; color:#165DFF; font-size:12px; font-weight:700; }",
      P + ".t2d-badge.is-plain { background:#f1f5fb; color:#6b829e; }",
      P + ".t2d-sub { margin:0 0 14px; color:#7c90ab; font-size:13px; line-height:1.75; }",
      P + ".t2d-tabs { display:flex; gap:22px; margin:0 0 16px; border-bottom:1px solid #e8eef6; }",
      P + ".t2d-tab { position:relative; padding:0 2px 11px; border:0; background:transparent; color:#5e7899; font-size:14px; font-family:inherit; font-weight:700; cursor:pointer; }",
      P + ".t2d-tab:hover { color:#165DFF; }",
      P + ".t2d-tab.is-active { color:#0b2a63; }",
      P + ".t2d-tab.is-active::after { content:''; position:absolute; left:0; right:0; bottom:-1px; height:2px; border-radius:2px; background:#165DFF; }",

      /* ---- 指标卡片 ---- */
      P + ".t2d-stat-grid { display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:14px; margin-bottom:16px; }",
      P + ".t2d-stat { display:flex; align-items:flex-start; gap:12px; padding:15px 16px; border:1px solid #e6eef9; border-radius:10px; background:#fff; box-shadow:0 1px 2px rgba(15,31,61,.03); }",
      P + ".t2d-stat-ico { flex:0 0 auto; width:34px; height:34px; border-radius:9px; display:grid; place-items:center; }",
      P + ".t2d-stat-ico svg { width:17px; height:17px; }",
      P + ".t2d-stat-ico.c-blue { background:#e8f2ff; color:#165DFF; }",
      P + ".t2d-stat-ico.c-violet { background:#f0edff; color:#6b4ef0; }",
      P + ".t2d-stat-ico.c-green { background:#e8f8f0; color:#12996b; }",
      P + ".t2d-stat-ico.c-orange { background:#fff2e8; color:#e2761b; }",
      P + ".t2d-stat-body { min-width:0; }",
      P + ".t2d-stat-body span { display:block; color:#8ba0bb; font-size:12.5px; margin-bottom:3px; }",
      P + ".t2d-stat-body strong { display:block; color:#12315e; font-size:22px; font-weight:800; line-height:1.2; letter-spacing:-.3px; }",
      P + ".t2d-stat-body i { display:block; margin-top:3px; color:#a3b4ca; font-size:11.5px; font-style:normal; }",

      /* ---- 工具条 ---- */
      P + ".t2d-bar { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:12px; padding:11px 14px; border:1px solid #e6eef9; border-radius:10px; background:#fafcff; }",
      P + ".t2d-bar .t2d-bar-input { position:relative; flex:1; min-width:220px; max-width:420px; }",
      P + ".t2d-bar .t2d-bar-input input { width:100%; height:36px; padding:0 34px 0 12px; border:1px solid #d9e5f5; border-radius:8px; background:#fff; color:#31527d; font-size:13.5px; font-family:inherit; }",
      P + ".t2d-bar .t2d-bar-input input:focus { outline:none; border-color:#165DFF; box-shadow:0 0 0 2px rgba(22,93,255,.1); }",
      P + ".t2d-bar .t2d-bar-input input::placeholder { color:#a8b9d0; }",
      P + ".t2d-bar .t2d-bar-input .t2d-search-ico { position:absolute; right:11px; top:50%; transform:translateY(-50%); color:#a8b9d0; font-size:14px; pointer-events:none; }",
      P + ".t2d-bar-tip { color:#93a8c4; font-size:12.5px; }",
      P + ".t2d-bar-tip b { color:#5c86c9; }",

      /* ---- 表格 ---- */
      P + ".t2d-card { border:1px solid #e6eef9; border-radius:10px; background:#fff; overflow:hidden; }",
      P + ".t2d-tw { overflow-x:auto; }",
      P + ".t2d-table { width:100%; border-collapse:separate; border-spacing:0; }",
      P + ".t2d-table th, " + P + ".t2d-table td { padding:12px 14px; border-bottom:1px solid #eef3fa; font-size:13px; color:#4e6b8d; text-align:left; vertical-align:middle; }",
      P + ".t2d-table th { background:#f7fafe; color:#33527a; font-weight:700; white-space:nowrap; font-size:12.5px; }",
      P + ".t2d-table tbody tr:hover td { background:#fafdff; }",
      P + ".t2d-table td.num { text-align:right; font-variant-numeric:tabular-nums; color:#33527a; font-weight:600; }",
      P + ".t2d-table th.num { text-align:right; }",
      P + ".t2d-table td.mono, " + P + ".t2d-table th.mono { font-family:Consolas,\"Courier New\",monospace; font-size:12.5px; color:#1e3c66; white-space:nowrap; }",
      P + ".t2d-link { padding:0; border:0; background:transparent; color:#165DFF; font-size:13px; font-family:inherit; font-weight:600; cursor:pointer; text-align:left; }",
      P + ".t2d-link:hover { color:#0b47c8; text-decoration:underline; }",
      /* 朴素链接：与同表普通单元格实际渲染色一致（app.css 用 !important 把 td 压成 #526276），
         仅 hover 保留下划线提示可点击；这里必须加 !important 才能压过 app.css */
      P + ".t2d-link.is-plain { color:#526276 !important; font-weight:400; }",
      P + ".t2d-link.is-plain:hover { text-decoration:underline; }",
      P + ".t2d-tag { display:inline-block; padding:2px 9px; border-radius:20px; font-size:11.5px; line-height:1.75; white-space:nowrap; border:1px solid transparent; }",
      P + ".t2d-tag.t-blue { background:#eaf2ff; border-color:#cfe1ff; color:#165DFF; }",
      P + ".t2d-tag.t-violet { background:#f0edff; border-color:#ddd6ff; color:#6b4ef0; }",
      P + ".t2d-tag.t-green { background:#e8f8f0; border-color:#c6ecd9; color:#12996b; }",
      P + ".t2d-tag.t-gray { background:#f2f5fa; border-color:#e3e9f2; color:#6f8298; }",
      P + ".t2d-tag.t-orange { background:#fff2e8; border-color:#ffdfc4; color:#c2680f; }",
      P + ".t2d-null { color:#bccbdd; font-style:italic; }",
      P + ".t2d-check { color:#12a065; font-weight:800; font-size:14px; }",

      /* ---- 示例数据表（参考图版式）：行高更松、首列序号固定、斑马纹更明显 ---- */
      /* app.css 用 !important 锁死了 th/td 的 padding、表头背景与字重，这里必须同样 !important 才能压过 */
      P + ".t2d-table.is-sample th, " + P + ".t2d-table.is-sample td { padding:14px 18px !important; }",
      P + ".t2d-table.is-sample { min-width:100%; }",
      P + ".t2d-table.is-sample thead th { background:#fff !important; border-bottom:1px solid #e6eef9 !important; font-size:13px !important; font-weight:700 !important; }",
      /* 斑马纹不加 !important（否则会盖掉 hover），hover 加 !important 才能压过 app.css 的 tr:hover td */
      P + ".t2d-table.is-sample tbody tr:nth-child(odd) td { background:#f7fbff; }",
      P + ".t2d-table.is-sample tbody tr:hover td { background:#eef6ff !important; }",
      P + ".t2d-table.is-sample td.num:first-child { text-align:left !important; font-weight:600 !important; }",

      /* ---- 分页条 ---- */
      P + ".t2d-pager { display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; padding:12px 18px; border-top:1px solid #eef3fa; background:#fcfdff; }",
      P + ".t2d-page-tip { color:#93a8c4; font-size:12.5px; }",
      P + ".t2d-page-tip b { color:#5c86c9; }",
      P + ".t2d-page-ctl { display:flex; align-items:center; gap:5px; }",
      P + ".t2d-page-btn, " + P + ".t2d-page-num { min-width:30px; height:30px; padding:0 9px; border:1px solid #dde7f5; border-radius:7px; background:#fff; color:#4b6b96; font-size:12.5px; font-family:inherit; font-weight:600; cursor:pointer; }",
      P + ".t2d-page-btn:hover:not(:disabled), " + P + ".t2d-page-num:hover { border-color:#a9c6ee; color:#165DFF; background:#f6faff; }",
      P + ".t2d-page-btn:disabled { color:#c3d1e2; cursor:not-allowed; background:#fafcff; }",
      P + ".t2d-page-num.is-active { border-color:#165DFF; background:#165DFF; color:#fff; }",
      P + ".t2d-page-gap { color:#a8b9d0; font-size:12.5px; padding:0 2px; }",
      P + ".t2d-page-sizes { display:flex; align-items:center; gap:4px; }",
      P + ".t2d-page-size { height:28px; padding:0 10px; border:1px solid #dde7f5; border-radius:7px; background:#fff; color:#6f8298; font-size:12px; font-family:inherit; cursor:pointer; }",
      P + ".t2d-page-size:hover { border-color:#a9c6ee; color:#165DFF; }",
      P + ".t2d-page-size.is-active { border-color:#bcd6ff; background:#eaf2ff; color:#165DFF; font-weight:700; }",
      P + ".t2d-dash { color:#c3d0e0; }",
      P + ".t2d-empty { padding:48px 0; color:#93a8c4; font-size:13.5px; text-align:center; }",
      P + ".t2d-foot { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; padding:12px 4px 0; color:#93a8c4; font-size:12.5px; }",
      P + ".t2d-foot b { color:#4e6b8d; }",

      /* ---- 信息概览 ---- */
      P + ".t2d-kv { display:grid; gap:0; padding:4px 18px 16px; }",
      P + ".t2d-kv > div { display:flex; gap:14px; padding:11px 0; border-bottom:1px dashed #e9eff8; }",
      P + ".t2d-kv > div:last-child { border-bottom:0; }",
      P + ".t2d-kv dt { flex:0 0 118px; margin:0; color:#8ba0bb; font-size:13px; line-height:1.7; }",
      P + ".t2d-kv dd { flex:1; min-width:0; margin:0; color:#2f4a70; font-size:13px; line-height:1.7; word-break:break-word; }",
      P + ".t2d-sec { padding:14px 18px; border-bottom:1px solid #eef3fa; }",
      P + ".t2d-sec:last-child { border-bottom:0; }",
      P + ".t2d-sec h4 { display:flex; align-items:center; gap:7px; margin:0 0 10px; color:#12315e; font-size:14px; font-weight:800; }",
      P + ".t2d-sec h4::before { content:''; width:3px; height:13px; border-radius:2px; background:#165DFF; }",
      P + ".t2d-chips { display:flex; flex-wrap:wrap; gap:8px; }",
      P + ".t2d-chip { padding:5px 11px; border:1px solid #dfe9f7; border-radius:7px; background:#f8fbff; color:#46658f; font-size:12.5px; }",
      P + ".t2d-chip b { color:#12315e; font-weight:700; }",
      P + ".t2d-cols { display:grid; grid-template-columns:minmax(0,1fr); gap:16px; }",
      P + ".t2d-two { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:16px; }",

      /* ---- 信息概览：6 卡 + 基本信息 ---- */
      P + ".t2d-stat-grid.is-six { grid-template-columns:repeat(6, minmax(0,1fr)); gap:12px; align-items:stretch; }",
      P + ".t2d-stat-grid.is-six .t2d-stat { padding:13px 14px; gap:9px; align-items:center; }",
      P + ".t2d-stat-grid.is-six .t2d-stat-body strong { font-size:19px; white-space:nowrap; }",
      P + ".t2d-stat-grid.is-six .t2d-stat-body i { display:none; }",
      P + ".t2d-stat-ico.c-rose { background:#ffeef2; color:#d63864; }",
      P + ".t2d-sec-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 18px 12px; border-bottom:1px solid #eef3fa; }",
      P + ".t2d-sec-head h4 { display:flex; align-items:center; gap:7px; margin:0; color:#12315e; font-size:14px; font-weight:800; }",
      P + ".t2d-sec-head h4::before { content:''; width:3px; height:13px; border-radius:2px; background:#165DFF; }",
      P + ".t2d-info { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); column-gap:36px; padding:2px 18px 18px; }",
      P + ".t2d-info > div { display:flex; gap:14px; padding:12px 0; border-bottom:1px dashed #e9eff8; }",
      P + ".t2d-info dt { flex:0 0 112px; margin:0; color:#8ba0bb; font-size:13px; line-height:1.7; }",
      P + ".t2d-info dd { flex:1; min-width:0; margin:0; color:#2f4a70; font-size:13px; line-height:1.7; word-break:break-word; }",
      P + ".t2d-badge { display:inline-block; margin-left:8px; padding:1px 7px; border-radius:4px; background:#f2f5fa; border:1px solid #e3e9f2; color:#8ba0bb; font-size:11.5px; vertical-align:1px; }",

      /* ---- 抽屉（字段 / 记录详情） ---- */
      P + ".t2d-mask { position:fixed; inset:0; z-index:1200; background:rgba(12,27,54,.34); display:flex; justify-content:flex-end; }",
      P + ".t2d-drawer { width:min(620px,94vw); height:100%; background:#fff; box-shadow:-8px 0 28px rgba(12,27,54,.16); display:flex; flex-direction:column; animation:t2dSlide .2s ease; }",
      "@keyframes t2dSlide { from { transform:translateX(28px); opacity:.4 } to { transform:translateX(0); opacity:1 } }",
      P + ".t2d-drawer-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; padding:16px 20px; border-bottom:1px solid #eef3fa; }",
      P + ".t2d-drawer-head h3 { margin:0; color:#0b2a63; font-size:17px; font-weight:800; }",
      P + ".t2d-drawer-head p { margin:5px 0 0; color:#8ba0bb; font-size:12.5px; font-family:Consolas,\"Courier New\",monospace; }",
      P + ".t2d-drawer-head button { width:28px; height:28px; border:0; border-radius:7px; background:#f4f7fc; color:#6f8298; font-size:16px; cursor:pointer; }",
      P + ".t2d-drawer-head button:hover { background:#eaf2ff; color:#165DFF; }",
      P + ".t2d-drawer-body { flex:1; overflow-y:auto; padding:6px 20px 24px; }",
      P + ".t2d-drawer-foot { padding:12px 20px; border-top:1px solid #eef3fa; display:flex; justify-content:flex-end; gap:10px; }",
      P + ".t2d-btn { min-height:34px; padding:0 16px; border:1px solid #ccd9ea; border-radius:8px; background:#fff; color:#3d5678; font-size:13.5px; font-family:inherit; font-weight:600; cursor:pointer; }",
      P + ".t2d-btn:hover { background:#f5f9ff; border-color:#a9c6ee; }",
      P + ".t2d-btn.is-primary { border-color:#165DFF; background:#165DFF; color:#fff; }",
      P + ".t2d-btn.is-primary:hover { background:#0b47c8; }",

      /* ---- 响应式 ---- */
      "@media (max-width:1440px) { " + P + ".t2d-stat-grid { grid-template-columns:repeat(2, minmax(0,1fr)); } " + P + ".t2d-stat-grid.is-six { grid-template-columns:repeat(3, minmax(0,1fr)); } }",
      "@media (max-width:1080px) { " + P + ".t2d-root { flex-direction:column; } " + P + ".t2d-side { flex:1 1 auto; width:auto; border-right:0; border-bottom:1px solid #e8eef6; } " + P + ".t2d-two { grid-template-columns:minmax(0,1fr); } " + P + ".t2d-info { grid-template-columns:minmax(0,1fr); } }",
      "@media (max-width:720px) { " + P + ".t2d-stat-grid { grid-template-columns:minmax(0,1fr); } " + P + ".t2d-stat-grid.is-six { grid-template-columns:repeat(2, minmax(0,1fr)); } " + P + ".t2d-main { padding:14px; } }"
    ].join(String.fromCharCode(10));
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ==========================================================================
     4. 图标
     ========================================================================== */
  var ICON = {
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>',
    db: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/></svg>',
    table: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/></svg>',
    nodes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="8" y="3" width="8" height="5" rx="1.5"/><rect x="2" y="16" width="8" height="5" rx="1.5"/><rect x="14" y="16" width="8" height="5" rx="1.5"/><path d="M12 8v4M6 16v-4h12v4"/></svg>',
    disk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg>',
    rows: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4"/><path d="M5 5h11l-1.6 3.5L16 12H5z"/></svg>'
  };

  /* ==========================================================================
     5. 通用片段
     ========================================================================== */
  function statCard(icon, cls, label, value, hint) {
    return '<div class="t2d-stat">'
      + '<div class="t2d-stat-ico ' + cls + '">' + icon + '</div>'
      + '<div class="t2d-stat-body"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong>'
      + (hint ? '<i>' + esc(hint) + '</i>' : '') + '</div></div>';
  }

  function nullCell() { return '<span class="t2d-null">NULL</span>'; }

  /* 按字段类型渲染单元格值，typeInfo 决定数值格式 */
  function cellValue(field, raw) {
    if (isEmpty(raw)) return nullCell();
    var t = parseType(field.type);
    if (t.base === "DECIMAL" && t.scale) {
      var n = Number(raw);
      if (!isNaN(n)) return esc(n.toFixed(Number(t.scale)));
    }
    var text = String(raw);
    if (text.length > 90) return '<span title="' + esc(text) + '">' + esc(text.slice(0, 88)) + '…</span>';
    return esc(text);
  }

  function renderKv(items) {
    return '<div class="t2d-kv">' + items.map(function (it) {
      return '<div><dt>' + esc(it.label) + '</dt><dd>' + (it.html || esc(it.value)) + '</dd></div>';
    }).join("") + '</div>';
  }

  /* ==========================================================================
     5.1 列表分页
     ========================================================================== */
  var PER_OPTIONS = [10, 20, 50];

  /* 对全集切片，返回当前页数据；同时把页码收敛到合法范围 */
  function paginate(s, listKey, list) {
    var per = s.per || 10;
    var pages = Math.max(1, Math.ceil(list.length / per));
    var cur = Number(s.page[listKey] || 1);
    if (!isFinite(cur) || cur < 1) cur = 1;
    if (cur > pages) cur = pages;
    s.page[listKey] = cur;
    return {
      listKey: listKey, per: per, pages: pages, cur: cur, total: list.length,
      from: list.length ? (cur - 1) * per + 1 : 0,
      to: Math.min(cur * per, list.length),
      slice: list.slice((cur - 1) * per, cur * per)
    };
  }

  /* 页码窗口：始终给出首末页，当前页左右各留 1，其余用省略号 */
  function pageNumbers(p) {
    if (p.pages <= 7) {
      var all = [];
      for (var i = 1; i <= p.pages; i++) all.push(i);
      return all;
    }
    var out = [1], start = Math.max(2, p.cur - 1), end = Math.min(p.pages - 1, p.cur + 1);
    if (start > 2) out.push("...");
    for (var j = start; j <= end; j++) out.push(j);
    if (end < p.pages - 1) out.push("...");
    out.push(p.pages);
    return out;
  }

  function renderPager(p, unit) {
    var nums = pageNumbers(p).map(function (n) {
      if (n === "...") return '<span class="t2d-page-gap">···</span>';
      return '<button type="button" class="t2d-page-num' + (n === p.cur ? ' is-active' : '') + '"'
        + ' data-t2d-page="' + p.listKey + '" data-t2d-page-to="' + n + '">' + n + '</button>';
    }).join("");

    var sizes = PER_OPTIONS.map(function (n) {
      return '<button type="button" class="t2d-page-size' + (n === p.per ? ' is-active' : '') + '"'
        + ' data-t2d-per="' + n + '">' + n + ' 条/页</button>';
    }).join("");

    return '<div class="t2d-pager">'
      + '<span class="t2d-page-tip">共 <b>' + fmt(p.total) + '</b> ' + unit
      + '　第 <b>' + p.from + '-' + p.to + '</b> 条</span>'
      + '<div class="t2d-page-ctl">'
      + '<button type="button" class="t2d-page-btn" data-t2d-page="' + p.listKey + '" data-t2d-page-to="' + (p.cur - 1) + '"'
      + (p.cur <= 1 ? ' disabled' : '') + '>上一页</button>'
      + nums
      + '<button type="button" class="t2d-page-btn" data-t2d-page="' + p.listKey + '" data-t2d-page-to="' + (p.cur + 1) + '"'
      + (p.cur >= p.pages ? ' disabled' : '') + '>下一页</button>'
      + '</div>'
      + '<div class="t2d-page-sizes">' + sizes + '</div>'
      + '</div>';
  }

  /* ==========================================================================
     6. 左侧目录树
     ========================================================================== */
  function renderTree() {
    var s = getState();
    var html = '<aside class="t2d-side">'
      + '<div class="t2d-side-head"><h3>元数据目录</h3></div>'
      + '<div class="t2d-search"><input type="text" placeholder="搜索数据库 / 数据表" value="' + esc(s.q1) + '" data-t2d-filter1><span class="t2d-search-ico">⌕</span></div>'
      + '<div class="t2d-tree">';

    TREE.forEach(function (root) {
      var keyword = (s.q1 || "").trim().toLowerCase();
      var kids = root.children.filter(function (c) {
        return !keyword || c.label.toLowerCase().indexOf(keyword) >= 0 || c.code.toLowerCase().indexOf(keyword) >= 0;
      });
      var rootHit = !keyword || root.label.toLowerCase().indexOf(keyword) >= 0 || root.code.toLowerCase().indexOf(keyword) >= 0;
      if (!rootHit && !kids.length) return;
      var shown = rootHit ? root.children : kids;
      var open = !!s.open[root.id] || (!!keyword && shown.length > 0);
      html += '<button class="t2d-node is-root' + (s.node === root.id ? ' is-active' : '') + (open ? ' is-open' : '') + '" type="button" data-t2d-toggle="' + root.id + '">'
        + '<span class="t2d-caret">' + ICON.chevron + '</span>'
        + '<span class="t2d-ico">' + ICON.db + '</span>'
        + '<span class="t2d-txt">' + esc(root.label) + '</span>'
        + '<span class="t2d-cnt">' + shown.length + '</span></button>';
      html += '<div class="t2d-children' + (open ? '' : ' is-folded') + '">';
      shown.forEach(function (child) {
        html += '<button class="t2d-node' + (s.node === child.id ? ' is-active' : '') + '" type="button" data-t2d-node="' + child.id + '">'
          + '<span class="t2d-ico">' + ICON.table + '</span>'
          + '<span class="t2d-txt" title="' + esc(child.code) + '">' + esc(child.label) + '</span>'
          + '<span class="t2d-cnt">' + fmt(child.count) + '</span></button>';
      });
      if (!shown.length) html += '<div class="t2d-empty" style="padding:14px 0;font-size:12.5px;">无匹配数据集</div>';
      html += '</div>';
    });

    html += '</div>'
      + '</aside>';
    return html;
  }

  /* ==========================================================================
     7. 右侧：库级视图（库表清单 / 信息概览）
     ========================================================================== */
  function filterTables(kw) {
    var k = (kw || "").trim().toLowerCase();
    return DB_TABLES.filter(function (t) {
      if (!k) return true;
      return (t.name + " " + t.type).toLowerCase().indexOf(k) >= 0;
    });
  }

  function tableRowHtml(t) {
    var typeTag = t.type === "结构特征"
      ? '<span class="t2d-tag t-violet">' + esc(t.type) + '</span>'
      : (t.type === "电子结构"
        ? '<span class="t2d-tag t-green">' + esc(t.type) + '</span>'
        : '<span class="t2d-tag t-blue">' + esc(t.type) + '</span>');
    return '<tr>'
      + '<td class="mono"><button class="t2d-link" type="button" data-t2d-table="' + esc(t.key) + '">' + esc(t.name) + '</button></td>'
      + '<td>' + typeTag + '</td>'
      + '<td class="num">' + fmt(t.rows) + '</td>'
      + '<td class="num">' + t.fieldCount + '</td>'
      + '<td class="num">' + KB(t.size) + '</td>'
      + '</tr>';
  }

  function renderDbTables(s) {
    var list = filterTables(s.q1b);
    var p = paginate(s, "dbTables", list);
    var rows = p.slice.map(tableRowHtml).join("");
    return '<div class="t2d-stat-grid">'
      + statCard(ICON.table, "c-blue", "表数量", DB_TABLES.length + " 张", "与左侧八个数据集目录一一对应")
      + statCard(ICON.nodes, "c-violet", "字段数量", fmt(TOTAL.fields) + " 个", "八大数据集字段数合计")
      + statCard(ICON.rows, "c-green", "数据量", fmt(TOTAL.rows) + " 条", "八大数据集合计")
      + statCard(ICON.disk, "c-orange", "存储大小", TOTAL.sizeText, "八大数据集存储合计")
      + '</div>'
      + '<div class="t2d-bar">'
      + '<div class="t2d-bar-input"><input type="text" placeholder="请输入数据表名称搜索" value="' + esc(s.q1b || "") + '" data-t2d-q1b><span class="t2d-search-ico">⌕</span></div>'
      + '<span class="t2d-bar-tip">共 <b>' + list.length + '</b> 张数据表　·　点击数据表名称可跳转到对应数据集</span>'
      + '</div>'
      + '<div class="t2d-card"><div class="t2d-tw"><table class="t2d-table"><thead><tr>'
      + '<th>数据表名称</th><th>数据集类型</th><th class="num">数据量</th><th class="num">字段数量</th><th class="num">存储大小</th>'
      + '</tr></thead><tbody>' + (rows || '<tr><td colspan="5"><div class="t2d-empty">没有匹配的数据表，请调整搜索关键词。</div></td></tr>') + '</tbody></table></div>'
      + (list.length ? renderPager(p, "张数据表") : '') + '</div>'
      + '<div class="t2d-foot"><span>数据来源：<b>gkx_ldm</b>　·　最近更新 <b>2026-07-28</b></span><span>点击数据表名称可跳转到对应数据集列表页</span></div>';
  }

  /* 库级信息概览：4 张指标卡 + 基本信息（两列） */
  function renderDbOverview() {
    var META = DB_META;

    /* 基本信息：按参考图固定字段顺序，两列排布 */
    var infoItems = [
      { label: "数据库名称", value: META.name },
      { label: "表数量",     value: DB_TABLES.length + " 张" },
      { label: "字段数合计", value: fmt(TOTAL.fields) + " 个" },
      { label: "数据量合计", value: fmt(TOTAL.rows) + " 条" },
      { label: "存储大小",   value: TOTAL.sizeText + '<span class="t2d-badge">示例</span>', html: true },
      { label: "创建人",     value: META.creator },
      { label: "更新时间",   value: META.updated }
    ];
    var infoHtml = '<div class="t2d-info">' + infoItems.map(function (it) {
      return '<div><dt>' + esc(it.label) + '</dt><dd>' + (it.html ? it.value : esc(it.value)) + '</dd></div>';
    }).join("") + '</div>';

    return '<div class="t2d-stat-grid">'
      + statCard(ICON.table, "c-blue", "表数量", DB_TABLES.length + " 张", "与左侧八个数据集目录一一对应")
      + statCard(ICON.nodes, "c-violet", "字段数合计", fmt(TOTAL.fields) + " 个", "八大数据集字段数合计")
      + statCard(ICON.rows, "c-green", "数据量合计", fmt(TOTAL.rows) + " 条", "八大数据集合计")
      + statCard(ICON.disk, "c-orange", "存储大小", TOTAL.sizeText, "八大数据集存储合计")
      + '</div>'
      + '<section class="t2d-card">'
      + '<div class="t2d-sec-head"><h4>基本信息</h4></div>'
      + infoHtml
      + '</section>';
  }

  /* ==========================================================================
     8. 右侧：数据集级视图（字段信息 / 示例数据 / 信息概览）
     ========================================================================== */
  function filterFields(ds, kw) {
    var k = (kw || "").trim().toLowerCase();
    return ds.fields.filter(function (f) {
      if (!k) return true;
      return (f.en + " " + f.cn + " " + f.type).toLowerCase().indexOf(k) >= 0;
    });
  }

  function renderDatasetFields(ds) {
    var s = getState();
    var list = filterFields(ds, s.q2);
    var p = paginate(s, "dsFields:" + ds.key, list);
    var rows = p.slice.map(function (f, i) {
      var t = parseType(f.type);
      var lenText = t.len === "" ? '<span class="t2d-dash">—</span>' : String(t.len);
      var scaleText = t.scale === "" ? '<span class="t2d-dash">—</span>' : t.scale;
      return '<tr>'
        + '<td class="mono"><button class="t2d-link is-plain" type="button" data-t2d-field="' + esc(f.en) + '">' + esc(f.en) + '</button></td>'
        + '<td>' + esc(f.cn) + '</td>'
        + '<td class="mono">' + esc(f.type) + '</td>'
        + '<td>' + (f.notNull ? '<span class="t2d-check">✓</span> 非空' : '<span class="t2d-tag t-gray">可空</span>') + '</td>'
        + '<td class="num">' + lenText + '</td>'
        + '<td class="num">' + scaleText + '</td>'
        + '</tr>';
    }).join("");

    return '<div class="t2d-bar">'
      + '<div class="t2d-bar-input"><input type="text" placeholder="请输入字段英文名 / 字段中文名搜索" value="' + esc(s.q2 || "") + '" data-t2d-q2><span class="t2d-search-ico">⌕</span></div>'
      + '<span class="t2d-bar-tip">共 <b>' + list.length + '</b> / ' + ds.fieldCount + ' 个字段　·　其中非空 <b>' + ds.fields.filter(function (f) { return f.notNull; }).length + '</b> 个</span>'
      + '</div>'
      + '<div class="t2d-card"><div class="t2d-tw"><table class="t2d-table"><thead><tr>'
      + '<th class="mono">字段英文名</th><th>字段中文名</th><th>类型</th><th>非空</th><th class="num">字段长度</th><th class="num">小数点</th>'
      + '</tr></thead><tbody>' + (rows || '<tr><td colspan="6"><div class="t2d-empty">没有匹配的字段，请调整搜索关键词。</div></td></tr>') + '</tbody></table></div>'
      + (list.length ? renderPager(p, "个字段") : '') + '</div>'
      + '<div class="t2d-foot"><span>字段定义依据《二维材料数据库标准化细则》与物理库表 <b>' + esc(ds.table) + '</b></span></div>';
  }

  /* 依据字段取值来源判断单元格展示方式：
     - row.values 命中：该数据集业务字段的真实示例值
     - fieldSample 命中（real=true）：由该数据集样例数据回填
     - 其余：未在样例中回填，置灰显示 */
  function sampleCell(ds, row, field, index) {
    var mapped = Object.prototype.hasOwnProperty.call(row.values, field.en);
    var got = fieldSample(ds.key, field, index);
    var value = mapped ? row.values[field.en] : got.value;
    if (isEmpty(value)) return '<td>' + nullCell() + '</td>';
    if (mapped) return '<td>' + cellValue(field, value) + '</td>';
    if (got.real) return '<td>' + cellValue(field, value) + '</td>';
    return '<td style="color:#a9bacf;">' + cellValue(field, value) + '</td>';
  }

  function renderDatasetSample(ds) {
    var s = getState();
    var p = paginate(s, "dsSample:" + ds.key, ds.samples);
    var head = '<tr><th class="num">序号</th>' + ds.fields.map(function (f) { return '<th>' + esc(f.cn) + '</th>'; }).join("") + '</tr>';
    var body = p.slice.map(function (row, i) {
      var index = (p.cur - 1) * p.per + i;   /* 序号跨页连续 */
      return '<tr><td class="num">' + (index + 1) + '</td>'
        + ds.fields.map(function (f) { return sampleCell(ds, row, f, index); }).join("")
        + '</tr>';
    }).join("");

    return '<div class="t2d-bar"><span class="t2d-bar-tip">展示该数据集 <b>' + ds.sampleCount + '</b> 条示例记录（数据量共 <b>' + fmt(ds.rows) + '</b> 条）　·　灰色为未在示例数据中回填的字段，NULL 表示该条记录无值</span></div>'
      + '<div class="t2d-card"><div class="t2d-tw"><table class="t2d-table is-sample"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>'
      + renderPager(p, "条记录") + '</div>';
  }

  function renderDatasetOverview(ds) {
    var notNull = ds.fields.filter(function (f) { return f.notNull; }).length;

    var infoItems = [
      { label: "数据集名称", value: ds.label },
      { label: "所属数据库", value: "二维材料数据库" },
      { label: "物理表名",   value: '<span class="mono">' + esc(ds.table) + '</span>', html: true },
      { label: "字段数合计", value: ds.fieldCount + " 个" },
      { label: "数据量合计", value: fmt(ds.rows) + " 条" },
      { label: "存储大小",   value: ds.storage },
      { label: "创建人",     value: DB_META.creator },
      { label: "更新时间",   value: DB_META.updated }
    ];
    var infoHtml = '<div class="t2d-info">' + infoItems.map(function (it) {
      return '<div><dt>' + esc(it.label) + '</dt><dd>' + (it.html ? it.value : esc(it.value)) + '</dd></div>';
    }).join("") + '</div>';

    return '<div class="t2d-stat-grid">'
      + statCard(ICON.rows, "c-green", "数据量合计", fmt(ds.rows) + " 条", "材料覆盖 " + ds.coverage)
      + statCard(ICON.nodes, "c-violet", "字段数合计", ds.fieldCount + " 个", "非空 " + notNull + " 个")
      + statCard(ICON.disk, "c-orange", "存储大小", ds.storage, "Parquet 压缩后")
      + statCard(ICON.flag, "c-rose", "数据集类型", "特征结构", ds.group)
      + '</div>'
      + '<section class="t2d-card">'
      + '<div class="t2d-sec-head"><h4>基本信息</h4></div>'
      + infoHtml
      + '</section>';
  }

  /* ==========================================================================
     9. 主渲染
     ========================================================================== */
  function renderPage() {
    var page = document.getElementById("page-" + PAGE_ID);
    if (!page) return;
    ensureStyle();
    page.classList.add("t2d-ready");
    var s = getState();
    var right;

    if (s.node === "db-root") {
      right = '<div class="t2d-crumb"><span>低维材料主题库</span><span>／</span><span>低维材料数据库</span><span>／</span><b>二维材料数据库</b></div>'
        + '<div class="t2d-title-row"><h2>二维材料数据库</h2><span class="t2d-badge">数据库</span></div>'
        + '<p class="t2d-sub">数据库层：按物理库表组织二维材料数据资源，展示库表清单、基础信息与指标概览；点击左侧任一数据集目录或下方数据表名称，可进入数据集详情查看字段信息与示例数据。</p>'
        + '<div class="t2d-tabs">'
        + '<button class="t2d-tab' + (s.tab === "tables" ? " is-active" : "") + '" type="button" data-t2d-tab="tables">库表清单</button>'
        + '<button class="t2d-tab' + (s.tab === "overview" ? " is-active" : "") + '" type="button" data-t2d-tab="overview">信息概览</button>'
        + '</div>'
        + (s.tab === "overview" ? renderDbOverview() : renderDbTables(s));
    } else {
      var ds = DS[s.node.slice(3)];
      if (!ds) { s.node = "db-root"; return renderPage(); }
      right = '<div class="t2d-crumb"><span>低维材料主题库</span><span>／</span><span>低维材料数据库</span><span>／</span><span>二维材料数据库</span><span>／</span><b>' + esc(ds.label) + '</b></div>'
        + '<div class="t2d-title-row"><h2>' + esc(ds.label) + '</h2><span class="t2d-badge">数据表</span>'
        + '<span class="t2d-badge is-plain mono">' + esc(ds.table) + '</span></div>'
        + '<p class="t2d-sub">' + esc(ds.desc) + '　数据量 <b>' + fmt(ds.rows) + '</b> 条，字段 <b>' + ds.fieldCount + '</b> 个。</p>'
        + '<div class="t2d-tabs">'
        + '<button class="t2d-tab' + (s.tab === "fields" ? " is-active" : "") + '" type="button" data-t2d-tab="fields">字段信息</button>'
        + '<button class="t2d-tab' + (s.tab === "sample" ? " is-active" : "") + '" type="button" data-t2d-tab="sample">示例数据</button>'
        + '<button class="t2d-tab' + (s.tab === "overview" ? " is-active" : "") + '" type="button" data-t2d-tab="overview">信息概览</button>'
        + '</div>'
        + (s.tab === "sample" ? renderDatasetSample(ds) : (s.tab === "overview" ? renderDatasetOverview(ds) : renderDatasetFields(ds)));
    }

    page.innerHTML = '<div class="t2d-root">' + renderTree() + '<div class="t2d-main">' + right + '</div></div>';
    if (typeof window !== "undefined" && window.scrollTo) window.scrollTo({ top: 0, behavior: "auto" });
  }

  /* ==========================================================================
     10. 抽屉：字段详情 / 数据表详情
     ========================================================================== */
  function closeDrawer() {
    var el = document.getElementById("t2dDrawerMask");
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function openDrawer(title, subtitle, bodyHtml) {
    closeDrawer();
    var mask = document.createElement("div");
    mask.className = "t2d-mask";
    mask.id = "t2dDrawerMask";
    mask.innerHTML = '<div class="t2d-drawer" role="dialog" aria-modal="true">'
      + '<div class="t2d-drawer-head"><div><h3>' + esc(title) + '</h3><p>' + esc(subtitle) + '</p></div>'
      + '<button type="button" data-t2d-drawer-close aria-label="关闭">×</button></div>'
      + '<div class="t2d-drawer-body">' + bodyHtml + '</div>'
      + '<div class="t2d-drawer-foot"><button class="t2d-btn is-primary" type="button" data-t2d-drawer-close>关闭</button></div>'
      + '</div>';
    mask.addEventListener("click", function (e) {
      if (e.target === mask) closeDrawer();
    });
    document.body.appendChild(mask);
  }

  function openFieldDetail(dsKey, fieldEn) {
    var ds = DS[dsKey];
    if (!ds) return;
    var field = null;
    ds.fields.forEach(function (f) { if (f.en === fieldEn) field = f; });
    if (!field) return;
    var t = parseType(field.type);
    var pos = ds.fields.indexOf(field) + 1;
    var samples = ds.samples.map(function (row, index) {
      var got = fieldSample(ds.key, field, index);
      var v = Object.prototype.hasOwnProperty.call(row.values, field.en) ? row.values[field.en] : got.value;
      return '<tr><td class="num">' + (index + 1) + '</td><td>' + esc(ds.samples[index].materialId) + '</td><td>'
        + (isEmpty(v) ? nullCell() : esc(String(v))) + '</td></tr>';
    }).join("");

    openDrawer(field.cn, ds.table + "." + field.en,
      '<div class="t2d-sec"><h4>字段属性</h4>'
      + renderKv([
        { label: "字段英文名", value: field.en },
        { label: "字段中文名", value: field.cn },
        { label: "数据类型", value: field.type },
        { label: "是否非空", value: field.notNull ? "是（NOT NULL）" : "否（可空）" },
        { label: "字段长度", value: t.len === "" ? "—" : String(t.len) },
        { label: "小数点", value: t.scale === "" ? "—" : t.scale },
        { label: "计量单位", value: field.unit },
        { label: "字段序号", value: "第 " + pos + " / " + ds.fieldCount + " 个字段" }
      ])
      + '</div>'
      + '<div class="t2d-sec"><h4>字段说明</h4><p style="margin:0;color:#55708f;font-size:13px;line-height:1.85;">' + esc(field.desc || "—") + '</p></div>'
      + '<div class="t2d-sec"><h4>所属数据集</h4><div class="t2d-chips">'
      + '<span class="t2d-chip">' + esc(ds.label) + '</span>'
      + '<span class="t2d-chip">物理表：<b>' + esc(ds.table) + '</b></span>'
      + '<span class="t2d-chip">数据量：<b>' + fmt(ds.rows) + ' 条</b></span>'
      + '</div></div>'
      + '<div class="t2d-sec"><h4>样例取值</h4><div class="t2d-tw"><table class="t2d-table"><thead><tr><th>序号</th><th>材料业务标识</th><th>该字段取值</th></tr></thead><tbody>' + samples + '</tbody></table></div></div>');
  }

  function E_ENUM(k) { return ENUM[k] || "—"; }

  /* ==========================================================================
     11. 事件
     ========================================================================== */
  function bindEvents() {
    if (document.body.dataset.twodDbRewriteBound === "true") return;
    document.body.dataset.twodDbRewriteBound = "true";

    document.body.addEventListener("click", function (event) {
      var el = event.target;
      if (!el || !el.closest) return;
      var s = getState();
      var node, hit;

      if (el.closest("[data-t2d-drawer-close]")) { closeDrawer(); return; }

      /* 分页：跳转指定页 */
      hit = el.closest("[data-t2d-page]");
      if (hit) {
        var pkey = hit.getAttribute("data-t2d-page");
        var pto = parseInt(hit.getAttribute("data-t2d-page-to"), 10);
        if (pkey && isFinite(pto) && pto >= 1) { s.page[pkey] = pto; renderPage(); }
        return;
      }

      /* 分页：切换每页条数（页码全部回到第 1 页） */
      hit = el.closest("[data-t2d-per]");
      if (hit) {
        var pv = parseInt(hit.getAttribute("data-t2d-per"), 10);
        if (isFinite(pv) && pv >= 1) { s.per = pv; s.page = {}; renderPage(); }
        return;
      }

      hit = el.closest("[data-t2d-table]");
      if (hit) {
        s.node = "ds:" + hit.getAttribute("data-t2d-table");
        s.tab = "fields";
        s.q2 = "";
        s.open["db-root"] = true;
        renderPage();
        return;
      }

      hit = el.closest("[data-t2d-field]");
      if (hit && s.node.indexOf("ds:") === 0) { openFieldDetail(s.node.slice(3), hit.getAttribute("data-t2d-field")); return; }

      hit = el.closest("[data-t2d-goto]");
      if (hit) {
        closeDrawer();
        s.node = hit.getAttribute("data-t2d-goto");
        s.tab = "fields"; s.q2 = "";
        renderPage(); return;
      }

      hit = el.closest("[data-t2d-tab]");
      if (hit) { s.tab = hit.getAttribute("data-t2d-tab"); s.q1b = ""; s.q2 = ""; renderPage(); return; }

      hit = el.closest("[data-t2d-node]");
      if (hit) {
        node = hit.getAttribute("data-t2d-node");
        s.node = node;
        s.tab = node === "db-root" ? "tables" : "fields";
        s.q2 = ""; s.q1b = "";
        renderPage(); return;
      }

      hit = el.closest("[data-t2d-toggle]");
      if (hit) {
        var id = hit.getAttribute("data-t2d-toggle");
        if (s.node === id) { s.node = "db-root"; s.tab = "tables"; }
        else { s.node = id; s.tab = "tables"; }
        s.open[id] = !s.open[id];
        renderPage(); return;
      }
    });

    document.body.addEventListener("input", function (event) {
      var el = event.target;
      if (!el || !el.matches) return;
      var s = getState();
      if (el.matches("[data-t2d-filter1]")) { s.q1 = el.value; renderPage(); keepFocus("[data-t2d-filter1]"); return; }
      /* 搜索变化后回到第 1 页，避免停在不存在的页码上 */
      if (el.matches("[data-t2d-q1b]")) {
        s.q1b = el.value; s.page["dbTables"] = 1;
        renderPage(); keepFocus("[data-t2d-q1b]"); return;
      }
      if (el.matches("[data-t2d-q2]")) {
        s.q2 = el.value;
        if (s.node.indexOf("ds:") === 0) s.page["dsFields:" + s.node.slice(3)] = 1;
        renderPage(); keepFocus("[data-t2d-q2]"); return;
      }
    });

    document.body.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeDrawer();
    });
  }

  /* 重渲染后恢复输入焦点与光标位置 */
  function keepFocus(selector) {
    setTimeout(function () {
      var el = document.querySelector("#page-" + PAGE_ID + " " + selector);
      if (!el) return;
      el.focus();
      try { var n = el.value.length; el.setSelectionRange(n, n); } catch (e) { /* ignore */ }
    }, 0);
  }

  /* ==========================================================================
     12. 接入既有渲染链，让切到本页时走新实现
     ========================================================================== */
  function patch(name) {
    if (typeof window[name] !== "function") return;
    var base = window[name];
    if (base.__t2dRewritten) return;
    var wrapped = function (pageId) {
      if (pageId === PAGE_ID) { renderPage(); return; }
      return base.apply(this, arguments);
    };
    wrapped.__t2dRewritten = true;
    window[name] = wrapped;
  }

  ["renderLowdimDbOverviewPage", "renderTwodDatabasePage"].forEach(patch);

  var baseSwitch = typeof window.switchPage === "function" ? window.switchPage : null;
  if (baseSwitch && !baseSwitch.__t2dRewritten) {
    var patchedSwitch = function (page) {
      var result = baseSwitch.apply(this, arguments);
      if (page === PAGE_ID) setTimeout(renderPage, 0);
      return result;
    };
    patchedSwitch.__t2dRewritten = true;
    window.switchPage = patchedSwitch;
    try { switchPage = patchedSwitch; } catch (e) { /* ignore */ }
  }

  bindEvents();

  /* 首屏：当前停在本页则立即渲染 */
  try {
    if (typeof state !== "undefined" && state.page === PAGE_ID) setTimeout(renderPage, 0);
  } catch (e) { /* ignore */ }
  setTimeout(renderPage, 0);
  [60, 200, 500, 1000].forEach(function (d) { setTimeout(renderPage, d); });
