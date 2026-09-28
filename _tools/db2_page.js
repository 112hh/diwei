/* ============================================================================
   五个材料数据库 —— 渲染与事件（20260923 · 数据集增删改 + 字段信息 + 数据信息）
   本片段由 _tools/build2.py 合并进 assets/js/99-layer.js 的单层 IIFE 中，
   因此文件自身不再包裹 (function(){...})()。

   实现被包成 buildDbPage(cfg) 工厂：二维材料 / 有机光电材料 / 电解质材料 /
   机器学习力场 / 催化材料五个库各装配一个实例，页面结构与交互完全一致。
   ========================================================================== */

  /* 全局登记表：pageId → 该页渲染函数；以及全部实例（用于首屏装配） */
  var DB_RENDERERS = {};
  var DB_RENDER_LIST = [];

  function buildDbPage(cfg) {
  var PAGE_ID = cfg.pageId;
  var STYLE_ID = cfg.styleId;
  var STATE_KEY = cfg.stateKey;
  var DDL_TABLES = cfg.tables;
  var TABLE_OPTIONS = cfg.tableOptions;
  var DATASETS = cfg.datasets;
  var MATERIALS = cfg.materials;
  var DB_META = cfg.meta;
  var buildFields = cfg.buildFields;
  var findDdlTable = cfg.findDdlTable;
  var F = cfg.F;
  var DSDEF = cfg.ds || null;        /* 新库：各数据集自带展示列与示例行 */
  var INFO_COLS = cfg.infoCols || {};
  var INFO_ROWS = cfg.infoRows || {};

  var esc = function (v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };
  var fmt = function (v) {
    return String(v == null ? "" : v).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  var MB = function (v) { return v >= 1024 ? (v / 1024).toFixed(2) + " GB" : v.toFixed(2) + " MB"; };
  var isEmpty = function (v) { return v === null || v === undefined || v === ""; };

  /* ==========================================================================
     1. 数据集装配（内置八大 + 运行时新增）
     ========================================================================== */
  var DS = {};   /* key → 数据集运行对象 */

  /* 数据集关联的库表（支持多选）：
     统一口径为数组 def.tables；兼容早期只写了单表的 def.table */
  function tablesOf(def) {
    var raw = (def && def.tables && def.tables.length) ? def.tables : ((def && def.table) ? [def.table] : []);
    var out = [];
    raw.forEach(function (n) { if (n && out.indexOf(n) < 0) out.push(n); });
    return out;
  }

  /* 多张库表的字段合并：按字段英文名去重，先出现的库表优先 */
  function ddlFieldsOfTables(tables) {
    var seen = {}, out = [];
    (tables || []).forEach(function (n) {
      var t = findDdlTable(n);
      if (!t) return;
      t.fields.forEach(function (f) {
        if (seen[f.en]) return;
        seen[f.en] = 1;
        out.push(f);
      });
    });
    return out;
  }

  /* 由数据集定义构造运行对象；自定义数据集直接继承所选库表的字段结构 */
  function makeDataset(def) {
    var tables = tablesOf(def);
    var d = {
      key: def.key,
      label: def.label,
      tables: tables,                              /* 关联数据表（可多张） */
      table: tables[0] || "",                      /* 兼容口径：取首张表 */
      tableText: tables.join("、"),                 /* 展示用：多表以顿号连接 */
      group: def.group || "自定义",
      coverage: def.coverage || "—",
      rows: typeof def.rows === "number" ? def.rows : 0,
      size: typeof def.size === "number" ? def.size : 0,
      desc: def.desc || "",
      custom: !!def.custom
    };
    if (d.custom) {
      d.fields = ddlFieldsOfTables(tables).map(function (f) {
        return F(f.cn === "—" ? f.en : f.cn, f.en, f.type, f.notNull, "物理库表字段：" + f.en, "—");
      });
      d.infoCols = null;
      d.infoRows = [];
    } else {
      d.fields = buildFields(d.key);
      var def = DSDEF ? DSDEF[d.key] : null;
      d.infoCols = def ? def.cols : (INFO_COLS[d.key] || []);
      d.infoRows = def ? def.rows : (INFO_ROWS[d.key] || []);
    }
    d.fieldCount = d.fields.length;
    d.storage = MB(d.size);
    d.infoCount = d.infoRows.length;
    d.notNullCount = d.fields.filter(function (f) { return f.notNull; }).length;
    return d;
  }

  DATASETS.forEach(function (def) { var d = makeDataset(def); DS[d.key] = d; });

  /* 库级统计：以四张物理库表的 DDL 为准 */
  var DDL_STAT = (function () {
    var t = { tables: DDL_TABLES.length, fields: 0, notNull: 0, indexes: 0 };
    DDL_TABLES.forEach(function (x) {
      t.fields += x.fields.length;
      t.indexes += x.keys.length;
      x.fields.forEach(function (f) { if (f.notNull) t.notNull++; });
    });
    return t;
  })();

  /* 数据集业务规模合计（信息概览页签展示） */
  var DS_STAT = (function () {
    var t = { rows: 0, size: 0 };
    DATASETS.forEach(function (d) { t.rows += d.rows; t.size += d.size; });
    t.sizeText = MB(t.size);
    return t;
  })();

  /* ==========================================================================
     2. 页面状态
     ========================================================================== */
  var DB_TABS = ["fields", "overview"];
  var DS_TABS = ["info", "overview"];

  function getState() {
    var blank = function () {
      return { open: { "db-root": true }, node: "db-root", tab: "fields", q1: "", q1b: "", page: {}, per: 10, customDs: [], hidden: {} };
    };
    if (typeof state === "undefined") return blank();
    if (!state[STATE_KEY]) state[STATE_KEY] = blank();
    var s = state[STATE_KEY];
    if (!s.open) s.open = { "db-root": true };
    if (!s.node) s.node = "db-root";
    /* 页签口径迁移：tables → fields（库级）、sample → info（数据集级） */
    if (s.tab === "tables") s.tab = "fields";
    if (s.tab === "sample") s.tab = "info";
    if (!s.tab) s.tab = "fields";
    if (typeof s.q1 !== "string") s.q1 = "";
    if (typeof s.q1b !== "string") s.q1b = "";
    if (!s.page || typeof s.page !== "object") s.page = {};
    if (typeof s.per !== "number") s.per = 10;
    if (!s.customDs || typeof s.customDs.push !== "function") s.customDs = [];
    if (!s.hidden || typeof s.hidden !== "object") s.hidden = {};
    /* 运行时新增的数据集若尚未装配则补装（刷新后 state 与 DS 同时重建，此处仅兜底） */
    s.customDs.forEach(function (c) { if (!DS[c.key]) DS[c.key] = makeDataset(c); });
    return s;
  }

  /* 当前可见数据集（内置顺序 + 新增顺序，剔除已删除项） */
  function datasetList() {
    var s = getState();
    var out = [];
    DATASETS.forEach(function (def) { if (!s.hidden[def.key] && DS[def.key]) out.push(DS[def.key]); });
    s.customDs.forEach(function (c) { if (DS[c.key]) out.push(DS[c.key]); });
    return out;
  }

  /* 目录树：一级 = 二维材料数据库；二级 = 数据集 */
  function buildTree() {
    var list = datasetList();
    return [{
      id: "db-root", label: DB_META.name, code: cfg.code, kind: "db",
      children: list.map(function (d) {
        return { id: "ds:" + d.key, key: d.key, label: d.label, code: d.tableText, kind: "ds", count: d.rows };
      })
    }];
  }

  /* ==========================================================================
     3. 样式
     ========================================================================== */
  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    /* 选择器前缀必须跟着本实例的 PAGE_ID 走：写死成 twod 会让另外四个库一条样式都匹配不上 */
    var P = "#page-" + PAGE_ID + " ";
    var css = [
      P + ".t2d-root { display:flex; gap:0; min-width:0; align-items:stretch; background:#fff; border:1px solid #e4ecf8; border-radius:12px; overflow:hidden; }",

      /* ---- 左侧目录 ---- */
      P + ".t2d-side { flex:0 0 308px; width:308px; border-right:1px solid #e8eef6; background:#fbfdff; padding:14px 12px 22px; }",
      P + ".t2d-side-head { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:0 4px 12px; }",
      P + ".t2d-side-head h3 { margin:0; color:#0b2a63; font-size:15px; font-weight:800; letter-spacing:.2px; }",
      P + ".t2d-search { position:relative; margin:0 4px 12px; }",
      P + ".t2d-search input { width:100%; height:34px; padding:0 30px 0 12px; border:1px solid #d9e5f5; border-radius:8px; background:#fff; color:#31527d; font-size:13px; font-family:inherit; }",
      P + ".t2d-search input:focus { outline:none; border-color:#165DFF; box-shadow:0 0 0 2px rgba(22,93,255,.1); }",
      P + ".t2d-search input::placeholder { color:#a8b9d0; }",
      P + ".t2d-search .t2d-search-ico { position:absolute; right:10px; top:50%; transform:translateY(-50%); color:#a8b9d0; font-size:13px; pointer-events:none; }",
      P + ".t2d-tree { display:grid; gap:2px; }",
      P + ".t2d-node-row { display:flex; align-items:center; gap:2px; min-width:0; }",
      P + ".t2d-node-row > .t2d-node { flex:1; min-width:0; }",
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

      /* ---- 目录节点操作按钮 ---- */
      P + ".t2d-mini-btn.is-add { flex:0 0 auto; height:27px; padding:0 10px; border:1px dashed #a9c8f2; border-radius:7px; background:#f2f8ff; color:#165DFF; font-size:11.5px; font-family:inherit; font-weight:700; cursor:pointer; white-space:nowrap; line-height:1; }",
      P + ".t2d-mini-btn.is-add:hover { background:#e2efff; border-style:solid; border-color:#165DFF; }",
      P + ".t2d-row-acts { flex:0 0 auto; display:flex; gap:1px; opacity:.42; transition:opacity .15s ease; }",
      P + ".t2d-node-row:hover .t2d-row-acts { opacity:1; }",
      P + ".t2d-icon-btn { width:23px; height:23px; padding:0; border:0; border-radius:6px; background:transparent; color:#8ba0bb; cursor:pointer; display:grid; place-items:center; }",
      P + ".t2d-icon-btn svg { width:13px; height:13px; }",
      P + ".t2d-icon-btn:hover { background:#eaf2ff; color:#165DFF; }",
      P + ".t2d-icon-btn.is-danger:hover { background:#ffeef2; color:#d63864; }",

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

      /* ---- 工具条 ---- */
      P + ".t2d-bar { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:12px; padding:11px 14px; border:1px solid #e6eef9; border-radius:10px; background:#fafcff; }",
      P + ".t2d-bar .t2d-bar-input { position:relative; flex:1; min-width:200px; max-width:380px; }",
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
      P + ".t2d-table td.mono, " + P + ".t2d-table th.mono { font-family:Consolas,\"Courier New\",monospace; font-size:12.5px; color:#1e3c66; white-space:nowrap !important; }",
      /* app.css 用 !important 锁死了大量 td/th 的 white-space，此处必须同样 !important 才能接管：
         短内容列不换行、wrap 列（长文本）自动换行 */
      P + ".t2d-table td, " + P + ".t2d-table th { white-space:nowrap !important; }",
      P + ".t2d-table td.wrap, " + P + ".t2d-table th.wrap { white-space:normal !important; min-width:150px; }",
      P + ".t2d-tag { display:inline-block; padding:2px 9px; border-radius:20px; font-size:11.5px; line-height:1.75; white-space:nowrap; border:1px solid transparent; }",
      P + ".t2d-tag.t-blue { background:#eaf2ff; border-color:#cfe1ff; color:#165DFF; }",
      P + ".t2d-tag.t-violet { background:#f0edff; border-color:#ddd6ff; color:#6b4ef0; }",
      P + ".t2d-tag.t-green { background:#e8f8f0; border-color:#c6ecd9; color:#12996b; }",
      P + ".t2d-tag.t-gray { background:#f2f5fa; border-color:#e3e9f2; color:#6f8298; }",
      P + ".t2d-tag.t-orange { background:#fff2e8; border-color:#ffdfc4; color:#c2680f; }",
      P + ".t2d-null { color:#bccbdd; font-style:italic; }",
      P + ".t2d-check { color:#12a065; font-weight:800; font-size:14px; }",
      P + ".t2d-dash { color:#c3d0e0; }",

      /* ---- 数据信息表：行高更松、斑马纹更明显 ---- */
      P + ".t2d-table.is-sample th, " + P + ".t2d-table.is-sample td { padding:12px 14px !important; }",
      P + ".t2d-table.is-sample tbody td { font-size:12.5px !important; }",
      P + ".t2d-table.is-sample { min-width:100%; }",
      P + ".t2d-table.is-sample thead th { background:#fff !important; border-bottom:1px solid #e6eef9 !important; font-size:13px !important; font-weight:700 !important; white-space:normal !important; line-height:1.35; vertical-align:middle; }",
      /* 数据表列多时（如电解液 13 列）表头允许折行，压缩总宽，尽量一屏放得下；
         列少的库（如二维库）表头本来就不折行，观感不受影响。放不下时仍由 .t2d-tw 横向滚动。 */
      P + ".t2d-table.is-sample thead th { max-width:132px; }",
      P + ".t2d-table.is-sample tbody tr:nth-child(odd) td { background:#f7fbff; }",
      P + ".t2d-table.is-sample tbody tr:hover td { background:#eef6ff !important; }",
      P + ".t2d-table.is-sample td.num:first-child { text-align:left !important; font-weight:600 !important; }",

      /* ---- 数据信息：材料名称单元格 / 原子结构缩略图 ---- */
      P + ".t2d-mat { display:flex; flex-direction:column; gap:2px; min-width:132px; }",
      P + ".t2d-mat-name { color:#12315e; font-weight:700; font-size:13px; }",
      P + ".t2d-mat-id { color:#a3b4ca; font-size:11.5px; font-family:Consolas,\"Courier New\",monospace; }",
      P + ".t2d-thumb { display:flex; align-items:center; gap:9px; }",
      P + ".t2d-thumb-box { flex:0 0 auto; width:40px; height:40px; border:1px solid #e2ecf9; border-radius:8px; background:linear-gradient(180deg,#fbfdff,#f2f7fe); display:grid; place-items:center; }",
      P + ".t2d-thumb-box svg { width:34px; height:34px; }",
      P + ".t2d-thumb-name { color:#4e6b8d; font-size:12px; font-family:Consolas,\"Courier New\",monospace; white-space:nowrap; }",

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
      P + ".t2d-empty { padding:48px 0; color:#93a8c4; font-size:13.5px; text-align:center; }",
      P + ".t2d-foot { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; padding:12px 4px 0; color:#93a8c4; font-size:12.5px; }",
      P + ".t2d-foot b { color:#4e6b8d; }",

      /* ---- 信息概览 ---- */
      P + ".t2d-sec-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 18px 12px; border-bottom:1px solid #eef3fa; }",
      P + ".t2d-sec-head h4 { display:flex; align-items:center; gap:7px; margin:0; color:#12315e; font-size:14px; font-weight:800; }",
      P + ".t2d-sec-head h4::before { content:''; width:3px; height:13px; border-radius:2px; background:#165DFF; }",
      P + ".t2d-info { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); column-gap:36px; padding:2px 18px 18px; }",
      P + ".t2d-info > div { display:flex; gap:14px; padding:12px 0; border-bottom:1px dashed #e9eff8; }",
      P + ".t2d-info dt { flex:0 0 112px; margin:0; color:#8ba0bb; font-size:13px; line-height:1.7; }",
      P + ".t2d-info dd { flex:1; min-width:0; margin:0; color:#2f4a70; font-size:13px; line-height:1.7; word-break:break-word; }",
      P + ".t2d-info dd .mono { font-family:Consolas,\"Courier New\",monospace; font-size:12.5px; color:#1e3c66; }",
      P + ".t2d-badge2 { display:inline-block; margin-left:8px; padding:1px 7px; border-radius:4px; background:#f2f5fa; border:1px solid #e3e9f2; color:#8ba0bb; font-size:11.5px; vertical-align:1px; }",

      /* ---- 弹窗 / 按钮：这些节点挂载在 body 下，不在 #page-* 内，
             因此必须使用全局选择器，带页面前缀会整体失效 ---- */
      ".t2d-btn { min-height:34px; padding:0 16px; border:1px solid #ccd9ea; border-radius:8px; background:#fff; color:#3d5678; font-size:13.5px; font-family:inherit; font-weight:600; cursor:pointer; }",
      ".t2d-btn:hover { background:#f5f9ff; border-color:#a9c6ee; }",
      ".t2d-btn.is-primary { border-color:#165DFF; background:#165DFF; color:#fff; }",
      ".t2d-btn.is-primary:hover { background:#0b47c8; }",
      ".t2d-btn.is-danger { border-color:#d63864; background:#d63864; color:#fff; }",
      ".t2d-btn.is-danger:hover { background:#b82a52; border-color:#b82a52; }",

      /* ---- 居中弹窗（新增 / 编辑 / 删除） ---- */
      ".t2d-modal-mask { position:fixed; inset:0; z-index:1300; background:rgba(12,27,54,.38); display:flex; align-items:center; justify-content:center; padding:24px; animation:t2dFade .16s ease; }",
      "@keyframes t2dFade { from { opacity:.4 } to { opacity:1 } }",
      ".t2d-modal { width:min(520px,96vw); max-height:88vh; display:flex; flex-direction:column; background:#fff; border-radius:14px; box-shadow:0 18px 48px rgba(12,27,54,.22); overflow:hidden; animation:t2dPop .18s ease; }",
      "@keyframes t2dPop { from { transform:translateY(12px); opacity:.5 } to { transform:translateY(0); opacity:1 } }",
      ".t2d-modal-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; padding:18px 22px 14px; border-bottom:1px solid #eef3fa; }",
      ".t2d-modal-head h3 { margin:0; color:#0b2a63; font-size:17px; font-weight:800; }",
      ".t2d-modal-head p { margin:6px 0 0; color:#93a8c4; font-size:12.5px; }",
      ".t2d-modal-head button { width:28px; height:28px; border:0; border-radius:7px; background:#f4f7fc; color:#6f8298; font-size:17px; line-height:1; cursor:pointer; }",
      ".t2d-modal-head button:hover { background:#eaf2ff; color:#165DFF; }",
      ".t2d-modal-body { flex:1; overflow-y:auto; padding:18px 22px 6px; }",
      ".t2d-modal-foot { padding:14px 22px 18px; display:flex; justify-content:flex-end; gap:10px; }",
      ".t2d-form-item { margin-bottom:18px; }",
      ".t2d-form-item > label { display:block; margin-bottom:7px; color:#33527a; font-size:13px; font-weight:700; }",
      ".t2d-form-item > label i { color:#d63864; font-style:normal; margin-left:2px; }",
      ".t2d-form-item input, .t2d-form-item select { width:100%; height:38px; padding:0 12px; border:1px solid #d9e5f5; border-radius:8px; background:#fff; color:#31527d; font-size:13.5px; font-family:inherit; }",
      ".t2d-form-item select { cursor:pointer; }",
      ".t2d-form-item input:focus, .t2d-form-item select:focus { outline:none; border-color:#165DFF; box-shadow:0 0 0 2px rgba(22,93,255,.1); }",
      ".t2d-form-item input::placeholder { color:#a8b9d0; }",
      ".t2d-form-tip { margin:7px 0 0; color:#a3b4ca; font-size:12px; line-height:1.7; }",
      ".t2d-form-err { margin:7px 0 0; color:#d63864; font-size:12px; }",
      ".t2d-form-item.is-error input[data-t2d-f-name], .t2d-form-item.is-error select { border-color:#d63864 !important; box-shadow:0 0 0 2px rgba(214,56,100,.1); }",

      /* ---- 关联数据表多选下拉（面板内联展开，避免被 modal-body 的 overflow 裁切） ---- */
      ".t2d-msel { position:relative; }",
      ".t2d-msel-ctrl { display:flex; align-items:flex-start; gap:8px; min-height:38px; padding:6px 36px 6px 8px; border:1px solid #d9e5f5; border-radius:8px; background:#fff; cursor:pointer; }",
      ".t2d-msel-ctrl:hover { border-color:#a9c6ee; }",
      ".t2d-msel.is-open .t2d-msel-ctrl { border-color:#165DFF; box-shadow:0 0 0 2px rgba(22,93,255,.1); }",
      ".t2d-msel-chips { flex:1; min-width:0; display:flex; flex-wrap:wrap; gap:6px; padding:2px 0; }",
      ".t2d-msel-ph { color:#a8b9d0; font-size:13.5px; line-height:24px; }",
      ".t2d-msel-chip { display:inline-flex; align-items:center; height:24px; padding:0 10px; border:1px solid #cfe1ff; border-radius:6px; background:#eaf2ff; color:#165DFF; font-family:Consolas,\"Courier New\",monospace; font-size:12px; white-space:nowrap; }",
      ".t2d-msel-caret { position:absolute; right:12px; top:13px; width:14px; color:#8ba0bb; transition:transform .18s ease; }",
      ".t2d-msel-caret svg { width:14px; height:14px; display:block; }",
      ".t2d-msel.is-open .t2d-msel-caret { transform:rotate(90deg); }",
      ".t2d-msel-panel { display:none; margin-top:8px; border:1px solid #e6eef9; border-radius:9px; background:#fbfdff; max-height:214px; overflow-y:auto; }",
      ".t2d-msel.is-open .t2d-msel-panel { display:block; }",
      ".t2d-msel-opt { display:flex; align-items:center; gap:10px; padding:9px 12px; border-bottom:1px solid #eef3fa; cursor:pointer; }",
      ".t2d-msel-opt:last-child { border-bottom:0; }",
      ".t2d-msel-opt:hover { background:#f2f8ff; }",
      ".t2d-msel-opt.is-on { background:#eaf2ff; }",
      ".t2d-msel-opt input { flex:0 0 auto; width:16px !important; height:16px !important; margin:0 !important; padding:0 !important; accent-color:#165DFF; cursor:pointer; }",
      ".t2d-msel-name { flex:0 0 auto; color:#1e3c66; font-family:Consolas,\"Courier New\",monospace; font-size:12.5px; }",
      ".t2d-msel-cn { flex:1; min-width:0; color:#8ba0bb; font-size:12px; }",
      ".t2d-msel-opt.is-on .t2d-msel-cn { color:#5c86c9; }",
      ".t2d-form-item.is-error .t2d-msel-ctrl { border-color:#d63864 !important; box-shadow:0 0 0 2px rgba(214,56,100,.1); }",
      ".t2d-confirm-text { margin:0; color:#526276; font-size:13.5px; line-height:1.9; }",
      ".t2d-confirm-text b { color:#12315e; }",
      ".t2d-confirm-warn { display:flex; gap:9px; margin-top:14px; padding:11px 13px; border:1px solid #ffdfc4; border-radius:9px; background:#fff8f1; color:#a35b16; font-size:12.5px; line-height:1.75; }",

      /* ---- 轻提示 ---- */
      ".t2d-toast { position:fixed; left:50%; bottom:56px; transform:translateX(-50%); z-index:1400; padding:10px 20px; border-radius:9px; background:rgba(18,49,94,.93); color:#fff; font-size:13px; box-shadow:0 8px 24px rgba(12,27,54,.28); animation:t2dFade .18s ease; }",

      /* ---- 响应式 ---- */
      "@media (max-width:1080px) { " + P + ".t2d-root { flex-direction:column; } " + P + ".t2d-side { flex:1 1 auto; width:auto; border-right:0; border-bottom:1px solid #e8eef6; } " + P + ".t2d-info { grid-template-columns:minmax(0,1fr); } }",
      "@media (max-width:720px) { " + P + ".t2d-main { padding:14px; } }"
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
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10-10-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/></svg>'
  };

  /* 原子结构缩略图（按行取色，示意二维晶格点阵） */
  var THUMB_COLORS = ["#2f6fe0", "#6b7a90", "#12996b", "#8b5cf6", "#e2761b", "#0e9aa7"];
  function structThumb(name, index) {
    var c = THUMB_COLORS[index % THUMB_COLORS.length];
    var svg = '<svg viewBox="0 0 40 40" aria-hidden="true">'
      + '<path d="M20 11.5 L10.5 27.5 L29.5 27.5 Z" fill="none" stroke="' + c + '" stroke-width="1.4" opacity=".42"/>'
      + '<path d="M20 11.5 L20 27.5" stroke="' + c + '" stroke-width="1.2" opacity=".22"/>'
      + '<circle cx="20" cy="11.5" r="4.4" fill="' + c + '" opacity=".92"/>'
      + '<circle cx="10.5" cy="27.5" r="4.4" fill="' + c + '" opacity=".72"/>'
      + '<circle cx="29.5" cy="27.5" r="4.4" fill="' + c + '" opacity=".72"/>'
      + '</svg>';
    return '<span class="t2d-thumb"><span class="t2d-thumb-box">' + svg + '</span>'
      + '<span class="t2d-thumb-name">' + esc(name) + '</span></span>';
  }

  /* ==========================================================================
     5. 通用片段
     ========================================================================== */
  function nullCell() { return '<span class="t2d-null">NULL</span>'; }
  function dashCell() { return '<span class="t2d-dash">—</span>'; }

  /* 文本单元格：空值置灰、超长截断（title 展示全文） */
  function textCell(v, limit) {
    if (isEmpty(v)) return nullCell();
    var s = String(v);
    var max = limit || 120;
    if (s.length > max) return '<span title="' + esc(s) + '">' + esc(s.slice(0, max - 2)) + '…</span>';
    return esc(s);
  }

  /* ==========================================================================
     5.1 列表分页
     ========================================================================== */
  var PER_OPTIONS = [10, 20, 50];

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
     6. 左侧目录树（含新增 / 编辑 / 删除）
     ========================================================================== */
  function renderTree() {
    var s = getState();
    var html = '<aside class="t2d-side">'
      + '<div class="t2d-side-head"><h3>元数据目录</h3></div>'
      + '<div class="t2d-search"><input type="text" placeholder="搜索数据库 / 数据表" value="' + esc(s.q1) + '" data-t2d-filter1><span class="t2d-search-ico">⌕</span></div>'
      + '<div class="t2d-tree">';

    buildTree().forEach(function (root) {
      var keyword = (s.q1 || "").trim().toLowerCase();
      var kids = root.children.filter(function (c) {
        return !keyword || c.label.toLowerCase().indexOf(keyword) >= 0 || String(c.code).toLowerCase().indexOf(keyword) >= 0;
      });
      var rootHit = !keyword || root.label.toLowerCase().indexOf(keyword) >= 0 || String(root.code).toLowerCase().indexOf(keyword) >= 0;
      if (!rootHit && !kids.length) return;
      var shown = rootHit ? root.children : kids;
      var open = !!s.open[root.id] || (!!keyword && shown.length > 0);

      html += '<div class="t2d-node-row">'
        + '<button class="t2d-node is-root' + (s.node === root.id ? ' is-active' : '') + (open ? ' is-open' : '') + '" type="button" data-t2d-toggle="' + root.id + '">'
        + '<span class="t2d-caret">' + ICON.chevron + '</span>'
        + '<span class="t2d-ico">' + ICON.db + '</span>'
        + '<span class="t2d-txt">' + esc(root.label) + '</span>'
        + '<span class="t2d-cnt">' + shown.length + '</span></button>'
        + '</div>';

      html += '<div class="t2d-children' + (open ? '' : ' is-folded') + '">';
      shown.forEach(function (child) {
        html += '<div class="t2d-node-row">'
          + '<button class="t2d-node' + (s.node === child.id ? ' is-active' : '') + '" type="button" data-t2d-node="' + child.id + '">'
          + '<span class="t2d-ico">' + ICON.table + '</span>'
          + '<span class="t2d-txt" title="' + esc(child.label) + '　·　' + esc(child.code) + '">' + esc(child.label) + '</span>'
          + '<span class="t2d-cnt">' + (child.count ? fmt(child.count) : '—') + '</span></button>'
          + '<span class="t2d-row-acts">'
          + '</span></div>';
      });
      if (!shown.length) html += '<div class="t2d-empty" style="padding:14px 0;font-size:12.5px;">无匹配数据集</div>';
      html += '</div>';
    });

    html += '</div></aside>';
    return html;
  }

  /* ==========================================================================
     7. 右侧：库级视图（字段信息 / 信息概览）
     ========================================================================== */
  /* 按关键词过滤四张库表的全部字段 */
  function filterDdlFields(kw) {
    var k = (kw || "").trim().toLowerCase();
    var out = [];
    DDL_TABLES.forEach(function (t) {
      t.fields.forEach(function (f) {
        if (k) {
          var hay = (f.en + " " + f.cn + " " + f.type + " " + t.name).toLowerCase();
          if (hay.indexOf(k) < 0) return;
        }
        out.push({ t: t, f: f });
      });
    });
    return out;
  }

  function renderDbFields(s) {
    var list = filterDdlFields(s.q1b);
    var p = paginate(s, "dbFields", list);
    var rows = p.slice.map(function (it, i) {
      var index = (p.cur - 1) * p.per + i;   /* 序号跨页连续 */
      var f = it.f, t = it.t;
      return '<tr>'
        + '<td class="num">' + (index + 1) + '</td>'
        + '<td class="mono">' + esc(t.name) + '</td>'
        + '<td class="mono">' + esc(f.en) + '</td>'
        + '<td class="wrap">' + (f.cn === "—" ? dashCell() : esc(f.cn)) + '</td>'
        + '<td class="mono">' + esc(f.type) + '</td>'
        + '<td>' + (f.notNull ? '<span class="t2d-check">✓</span> 非空' : '<span class="t2d-tag t-gray">可空</span>') + '</td>'
        + '<td class="mono">' + (f.def === "" ? dashCell() : esc(f.def)) + '</td>'
        + '</tr>';
    }).join("");

    /* 指标卡片 + 页脚来源说明已按需求移除，页面直接从工具条开始 */
    return '<div class="t2d-bar">'
      + '<div class="t2d-bar-input"><input type="text" placeholder="请输入字段英文名 / 中文名搜索" value="' + esc(s.q1b || "") + '" data-t2d-q1b><span class="t2d-search-ico">⌕</span></div>'
      + '</div>'
      + '<div class="t2d-card"><div class="t2d-tw"><table class="t2d-table"><thead><tr>'
      + '<th class="num">序号</th><th class="mono">所属数据表</th><th class="mono">字段英文名</th><th>字段中文名</th><th>数据类型</th><th>是否非空</th><th class="mono">默认值</th>'
      + '</tr></thead><tbody>' + (rows || '<tr><td colspan="7"><div class="t2d-empty">没有匹配的字段，请调整搜索关键词。</div></td></tr>') + '</tbody></table></div>'
      + (list.length ? renderPager(p, "个字段") : '') + '</div>';
  }

  function renderDbOverview() {
    var META = DB_META;
    var infoItems = [
      { label: "数据库名称", value: META.name },
      { label: "数据表数量", value: DDL_STAT.tables + " 张" },
      { label: "字段数合计", value: fmt(DDL_STAT.fields) + " 个" },
      { label: "数据量合计", value: fmt(DS_STAT.rows) + " 条<span class=\"t2d-badge2\">示例</span>", html: true },
      { label: "更新时间",   value: META.updated }
    ];
    var infoHtml = '<div class="t2d-info">' + infoItems.map(function (it) {
      return '<div><dt>' + esc(it.label) + '</dt><dd>' + (it.html ? it.value : esc(it.value)) + '</dd></div>';
    }).join("") + '</div>';

    /* 库级「信息概览」仅保留基本信息卡片（指标卡片与库表构成已按需求移除） */
    return '<section class="t2d-card">'
      + '<div class="t2d-sec-head"><h4>基本信息</h4></div>'
      + infoHtml
      + '</section>';
  }

  /* ==========================================================================
     8. 右侧：数据集级视图（数据信息 / 信息概览）
     ========================================================================== */
  function renderDatasetInfo(ds) {
    var s = getState();

    /* 新挂载数据集：本身尚无采集数据，展示其关联数据表（可多张，字段已合并去重）的结构 */
    if (!ds.infoCols || !ds.infoCols.length) {
      var list0 = ddlFieldsOfTables(ds.tables);
      var p0 = paginate(s, "dsStruct:" + ds.key, list0);
      var rows0 = p0.slice.map(function (f, i) {
        var index = (p0.cur - 1) * p0.per + i;
        return '<tr>'
          + '<td class="num">' + (index + 1) + '</td>'
          + '<td class="mono">' + esc(f.en) + '</td>'
          + '<td class="wrap">' + (f.cn === "—" ? dashCell() : esc(f.cn)) + '</td>'
          + '<td class="mono">' + esc(f.type) + '</td>'
          + '<td>' + (f.notNull ? '<span class="t2d-check">✓</span> 非空' : '<span class="t2d-tag t-gray">可空</span>') + '</td>'
          + '<td class="mono">' + (f.def === "" ? dashCell() : esc(f.def)) + '</td>'
          + '</tr>';
      }).join("");

      /* 新挂载数据集的工具条提示已按需求移除，直接从表结构开始 */
      return ''
        + '<div class="t2d-card"><div class="t2d-tw"><table class="t2d-table"><thead><tr>'
        + '<th class="num">序号</th><th class="mono">字段英文名</th><th>字段中文名</th><th>数据类型</th><th>是否非空</th><th class="mono">默认值</th>'
        + '</tr></thead><tbody>' + (rows0 || '<tr><td colspan="6"><div class="t2d-empty">该库表暂无字段定义。</div></td></tr>') + '</tbody></table></div>'
        + (list0.length ? renderPager(p0, "个字段") : '') + '</div>'
        + '<div class="t2d-foot"><span>字段结构随关联数据表 <b>' + esc(ds.tableText) + '</b> 自动同步</span><span>可在「信息概览」查看该数据集基础信息</span></div>';
    }

    var cols = ds.infoCols;
    var p = paginate(s, "dsInfo:" + ds.key, ds.infoRows);
    var head = '<tr><th class="num">序号</th><th>材料名称</th>'
      + cols.map(function (c) { return '<th>' + esc(c.t) + '</th>'; }).join("") + '</tr>';
    var body = p.slice.map(function (row, i) {
      var index = (p.cur - 1) * p.per + i;   /* 序号跨页连续 */
      var m = MATERIALS[index] || { name: "—", id: "" };
      var tds = cols.map(function (c) {
        var v = row[c.k];
        if (c.kind === "image") return '<td>' + structThumb(isEmpty(v) ? "—" : v, index) + '</td>';
        return '<td class="wrap">' + textCell(v) + '</td>';
      }).join("");
      return '<tr><td class="num">' + (index + 1) + '</td>'
        + '<td><div class="t2d-mat"><span class="t2d-mat-name">' + esc(m.name) + '</span>'
        + '<span class="t2d-mat-id">' + esc(m.id) + '</span></div></td>'
        + tds + '</tr>';
    }).join("");

    /* 数据集「数据信息」工具条提示已按需求移除，直接从表格开始 */
    return '<div class="t2d-card"><div class="t2d-tw"><table class="t2d-table is-sample"><thead>' + head + '</thead><tbody>'
      + (body || '<tr><td colspan="' + (cols.length + 2) + '"><div class="t2d-empty">该数据集暂无数据信息。</div></td></tr>')
      + '</tbody></table></div>'
      + renderPager(p, "条记录") + '</div>'
      /* 页脚左半句「数据来源：…」已按需求移除，仅保留右侧列顺序说明 */
      + '<div class="t2d-foot"><span>列顺序与数据集业务口径一致</span></div>';
  }

  function renderDatasetOverview(ds) {
    var infoItems = [
      { label: "数据集名称", value: ds.label },
      { label: "数据量合计", value: ds.rows ? fmt(ds.rows) + " 条" : "—" },
      { label: "字段数合计", value: ds.fieldCount + " 个" },
      { label: "数据信息条数", value: ds.infoCount ? ds.infoCount + " 条示例" : "—" },
      { label: "更新时间",   value: DB_META.updated }
    ];
    var infoHtml = '<div class="t2d-info">' + infoItems.map(function (it) {
      return '<div><dt>' + esc(it.label) + '</dt><dd>' + (it.html ? it.value : esc(it.value)) + '</dd></div>';
    }).join("") + '</div>';

    /* 数据集「信息概览」只保留基本信息卡片（指标卡片已按需求移除） */
    return '<section class="t2d-card">'
      + '<div class="t2d-sec-head"><h4>基本信息</h4></div>'
      + infoHtml
      + '</section>';
  }

  /* ==========================================================================
     9. 弹窗：新增 / 编辑 / 删除数据集
     ========================================================================== */
  function closeModal() {
    var el = document.getElementById("t2dModalMask");
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  /* 关联数据表：多选下拉。面板内联展开（不受 modal-body 的 overflow 裁切），
     已选库表以标签形式回显在控件内 */
  function tablePickerHtml(selected) {
    var sel = selected || [];
    var opts = TABLE_OPTIONS.map(function (o) {
      var on = sel.indexOf(o.value) >= 0;
      return '<label class="t2d-msel-opt' + (on ? ' is-on' : '') + '">'
        + '<input type="checkbox" value="' + esc(o.value) + '" data-t2d-f-tables' + (on ? ' checked' : '') + '>'
        + '<span class="t2d-msel-name">' + esc(o.value) + '</span>'
        + '<span class="t2d-msel-cn">' + esc(o.cn || "") + '</span>'
        + '</label>';
    }).join("");

    var chips = sel.length
      ? sel.map(function (n) { return '<span class="t2d-msel-chip">' + esc(n) + '</span>'; }).join("")
      : '<span class="t2d-msel-ph">请选择关联数据表（可多选）</span>';

    return '<div class="t2d-msel" data-t2d-msel>'
      + '<div class="t2d-msel-ctrl" data-t2d-msel-toggle role="button" tabindex="0" aria-haspopup="listbox">'
      + '<span class="t2d-msel-chips" data-t2d-msel-chips>' + chips + '</span>'
      + '<span class="t2d-msel-caret">' + ICON.chevron + '</span>'
      + '</div>'
      + '<div class="t2d-msel-panel" data-t2d-msel-panel>' + opts + '</div>'
      + '<p class="t2d-form-tip" data-t2d-msel-tip>' + (sel.length
        ? "已选 " + sel.length + " 张表，字段结构将按所选库表合并同步"
        : "可同时选择多张物理库表，字段结构会随所选库表自动合并同步。")
      + '</p></div>';
  }

  /* 当前弹窗中已勾选的库表（按选项顺序） */
  function pickedTables() {
    var mask = document.getElementById("t2dModalMask");
    var out = [];
    if (!mask) return out;
    Array.prototype.forEach.call(mask.querySelectorAll("[data-t2d-f-tables]"), function (b) {
      if (b.checked) out.push(b.value);
    });
    return out;
  }

  /* 勾选变化后同步：选项高亮 + 已选标签 + 提示文案 */
  function syncTablePicker() {
    var mask = document.getElementById("t2dModalMask");
    if (!mask) return;
    var picker = mask.querySelector("[data-t2d-msel]");
    if (!picker) return;
    var names = pickedTables();

    Array.prototype.forEach.call(picker.querySelectorAll(".t2d-msel-opt"), function (lb) {
      var b = lb.querySelector("[data-t2d-f-tables]");
      if (b && b.checked) lb.classList.add("is-on"); else lb.classList.remove("is-on");
    });

    var chips = picker.querySelector("[data-t2d-msel-chips]");
    if (chips) {
      chips.innerHTML = names.length
        ? names.map(function (n) { return '<span class="t2d-msel-chip">' + esc(n) + '</span>'; }).join("")
        : '<span class="t2d-msel-ph">请选择关联数据表（可多选）</span>';
    }
    var tip = picker.querySelector("[data-t2d-msel-tip]");
    if (tip) {
      tip.textContent = names.length
        ? "已选 " + names.length + " 张表，字段结构将按所选库表合并同步"
        : "可同时选择多张物理库表，字段结构会随所选库表自动合并同步。";
    }
  }

  /* mode: "add" | "edit" */
  function openDatasetForm(mode, key) {
    closeModal();
    var s = getState();
    var editing = mode === "edit" ? DS[key] : null;
    var name = editing ? editing.label : "";
    var tbls = editing ? editing.tables.slice() : [];

    var mask = document.createElement("div");
    mask.className = "t2d-modal-mask";
    mask.id = "t2dModalMask";
    mask.innerHTML = '<div class="t2d-modal" role="dialog" aria-modal="true">'
      + '<div class="t2d-modal-head">'
      + '<div><h3>' + (mode === "add" ? "新增数据集" : "编辑数据集") + '</h3>'
      + '<p>' + (mode === "add" ? "挂载于「" + DB_META.name + "」元数据目录" : "修改数据集名称与关联数据表") + '</p></div>'
      + '<button type="button" data-t2d-modal-close aria-label="关闭">×</button>'
      + '</div>'
      + '<div class="t2d-modal-body">'
      + '<div class="t2d-form-item"><label>数据集名称<i>*</i></label>'
      + '<input type="text" data-t2d-f-name maxlength="40" placeholder="请输入数据集名称，如「界面性质数据集」" value="' + esc(name) + '"></div>'
      + '<div class="t2d-form-item"><label>关联数据表<i>*</i></label>'
      + tablePickerHtml(tbls) + '</div>'
      + '</div>'
      + '<div class="t2d-modal-foot">'
      + '<button class="t2d-btn" type="button" data-t2d-modal-close>取消</button>'
      + '<button class="t2d-btn is-primary" type="button" data-t2d-modal-ok>' + (mode === "add" ? "确定新增" : "保存修改") + '</button>'
      + '</div></div>';

    mask.setAttribute("data-t2d-mode", mode);
    mask.setAttribute("data-t2d-page", PAGE_ID);
    if (editing) mask.setAttribute("data-t2d-key", key);
    mask.addEventListener("click", function (e) { if (e.target === mask) closeModal(); });
    document.body.appendChild(mask);
    syncTablePicker();
    setTimeout(function () {
      var el = document.querySelector("#t2dModalMask [data-t2d-f-name]");
      if (el) el.focus();
    }, 30);
  }

  function openDeleteConfirm(key) {
    closeModal();
    var d = DS[key];
    if (!d) return;
    var mask = document.createElement("div");
    mask.className = "t2d-modal-mask";
    mask.id = "t2dModalMask";
    mask.innerHTML = '<div class="t2d-modal" role="dialog" aria-modal="true" style="width:min(440px,96vw);">'
      + '<div class="t2d-modal-head">'
      + '<div><h3>删除数据集</h3><p>该操作将从元数据目录中移除数据集</p></div>'
      + '<button type="button" data-t2d-modal-close aria-label="关闭">×</button>'
      + '</div>'
      + '<div class="t2d-modal-body">'
      + '<p class="t2d-confirm-text">确认删除数据集 <b>「' + esc(d.label) + '」</b> ？</p>'
      + '<div class="t2d-confirm-warn"><span>⚠</span><span>删除后该数据集及其数据信息入口将从「' + DB_META.name + '」目录中移除，操作不可撤销。</span></div>'
      + '</div>'
      + '<div class="t2d-modal-foot">'
      + '<button class="t2d-btn" type="button" data-t2d-modal-close>取消</button>'
      + '<button class="t2d-btn is-danger" type="button" data-t2d-modal-ok>确认删除</button>'
      + '</div></div>';
    mask.setAttribute("data-t2d-mode", "delete");
    mask.setAttribute("data-t2d-page", PAGE_ID);
    mask.setAttribute("data-t2d-key", key);
    mask.addEventListener("click", function (e) { if (e.target === mask) closeModal(); });
    document.body.appendChild(mask);
  }

  function formError(el, msg) {
    var item = el.closest(".t2d-form-item");
    if (!item) return;
    item.classList.add("is-error");
    var old = item.querySelector(".t2d-form-err");
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var p = document.createElement("p");
    p.className = "t2d-form-err";
    p.textContent = msg;
    item.appendChild(p);
    el.focus();
  }

  function clearFormError(el) {
    var item = el.closest(".t2d-form-item");
    if (!item) return;
    item.classList.remove("is-error");
    var old = item.querySelector(".t2d-form-err");
    if (old && old.parentNode) old.parentNode.removeChild(old);
  }

  function toast(msg) {
    var el = document.getElementById("t2dToast");
    if (el && el.parentNode) el.parentNode.removeChild(el);
    el = document.createElement("div");
    el.className = "t2d-toast";
    el.id = "t2dToast";
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function () { if (el && el.parentNode) el.parentNode.removeChild(el); }, 2400);
  }

  /* 提交新增 / 编辑 */
  function submitDatasetForm(mask) {
    var mode = mask.getAttribute("data-t2d-mode");
    var key = mask.getAttribute("data-t2d-key");
    var s = getState();
    var nameEl = mask.querySelector("[data-t2d-f-name]");
    var name = (nameEl.value || "").trim();
    var tbls = pickedTables();

    if (!name) { formError(nameEl, "请输入数据集名称"); return; }
    if (name.length > 40) { formError(nameEl, "数据集名称不超过 40 个字符"); return; }
    if (!tbls.length) {
      var ctrl = mask.querySelector("[data-t2d-msel-toggle]");
      formError(ctrl || nameEl, "请选择关联数据表（至少选择 1 张）");
      var picker = mask.querySelector("[data-t2d-msel]");
      if (picker) picker.classList.add("is-open");   /* 展开面板方便直接勾选 */
      return;
    }

    /* 同名校验（编辑时排除自身） */
    var dup = datasetList().filter(function (d) { return d.key !== key && d.label === name; });
    if (dup.length) { formError(nameEl, "已存在同名数据集「" + name + "」"); return; }

    if (mode === "add") {
      var nk = "cu" + Date.now().toString(36);
      var def = {
        key: nk, label: name, tables: tbls.slice(), custom: true, group: "自定义",
        coverage: "—", rows: 0, size: 0,
        desc: "自定义挂载数据集，数据按关联数据表 " + tbls.join("、") + " 的字段结构组织。"
      };
      DS[nk] = makeDataset(def);
      s.customDs.push(def);
      s.open["db-root"] = true;
      s.node = "ds:" + nk;
      s.tab = "info";
      closeModal();
      renderPage();
      toast("数据集「" + name + "」已新增");
      return;
    }

    /* 编辑 */
    var d = DS[key];
    if (!d) { closeModal(); return; }
    var oldLabel = d.label;
    var oldTables = d.tables.join("、");
    d.label = name;
    d.tables = tbls.slice();
    d.table = tbls[0] || "";
    d.tableText = tbls.join("、");
    if (d.custom) {
      /* 自定义数据集需按新选的库表重建字段结构与定义快照 */
      var nd = makeDataset({ key: key, label: name, tables: tbls.slice(), custom: true, group: "自定义", coverage: d.coverage, rows: d.rows, size: d.size, desc: d.desc });
      DS[key] = nd;
      s.customDs.forEach(function (c) {
        if (c.key === key) {
          c.label = name;
          c.tables = tbls.slice();
          c.table = tbls[0] || "";
        }
      });
    }
    /* 内置数据集：字段口径不变，仅同步关联数据表 */
    closeModal();
    renderPage();
    toast("数据集「" + oldLabel + "」已更新" + (oldTables === d.tableText ? "" : "，关联数据表已调整"));
  }

  /* 执行删除 */
  function deleteDataset(key) {
    var s = getState();
    var d = DS[key];
    if (!d) { closeModal(); return; }
    if (d.custom) {
      s.customDs = s.customDs.filter(function (c) { return c.key !== key; });
      delete DS[key];
    } else {
      s.hidden[key] = true;   /* 内置数据集仅隐藏，保留定义便于扩展 */
    }
    if (s.node === "ds:" + key) { s.node = "db-root"; s.tab = "fields"; }
    closeModal();
    renderPage();
    toast("数据集「" + d.label + "」已删除");
  }

  /* ==========================================================================
     11. 主渲染
     ========================================================================== */
  function renderPage() {
    var page = document.getElementById("page-" + PAGE_ID);
    if (!page) return;
    ensureStyle();
    page.classList.add("t2d-ready");
    var s = getState();
    var right;

    if (s.node === "db-root") {
      if (DB_TABS.indexOf(s.tab) < 0) s.tab = "fields";
      right = '<div class="t2d-crumb"><span>低维材料主题库</span><span>／</span><span>低维材料数据库</span><span>／</span><b>' + esc(DB_META.name) + '</b></div>'
        + '<div class="t2d-title-row"><h2>' + esc(DB_META.name) + '</h2></div>'
        + '<div class="t2d-tabs">'
        + '<button class="t2d-tab' + (s.tab === "fields" ? " is-active" : "") + '" type="button" data-t2d-tab="fields">字段信息</button>'
        + '<button class="t2d-tab' + (s.tab === "overview" ? " is-active" : "") + '" type="button" data-t2d-tab="overview">信息概览</button>'
        + '</div>'
        + (s.tab === "overview" ? renderDbOverview() : renderDbFields(s));
    } else {
      var ds = DS[s.node.slice(3)];
      if (!ds) { s.node = "db-root"; s.tab = "fields"; return renderPage(); }
      if (DS_TABS.indexOf(s.tab) < 0) s.tab = "info";
      /* 数据集标题区按需求精简：去掉「数据集」徽标、库表徽标与标题下描述段 */
      right = '<div class="t2d-crumb"><span>低维材料主题库</span><span>／</span><span>低维材料数据库</span><span>／</span><span>' + esc(DB_META.name) + '</span><span>／</span><b>' + esc(ds.label) + '</b></div>'
        + '<div class="t2d-title-row"><h2>' + esc(ds.label) + '</h2></div>'
        + '<div class="t2d-tabs">'
        + '<button class="t2d-tab' + (s.tab === "info" ? " is-active" : "") + '" type="button" data-t2d-tab="info">数据信息</button>'
        + '<button class="t2d-tab' + (s.tab === "overview" ? " is-active" : "") + '" type="button" data-t2d-tab="overview">信息概览</button>'
        + '</div>'
        + (s.tab === "overview" ? renderDatasetOverview(ds) : renderDatasetInfo(ds));
    }

    page.innerHTML = '<div class="t2d-root">' + renderTree() + '<div class="t2d-main">' + right + '</div></div>';
    if (typeof window !== "undefined" && window.scrollTo) window.scrollTo({ top: 0, behavior: "auto" });
  }

  /* ==========================================================================
     12. 事件
     ========================================================================== */
  function bindEvents() {
    /* dataset 的键名不能含连字符（DOMStringMap 只认 camelCase→dash），统一换成下划线 */
    var boundFlag = "t2dBound_" + PAGE_ID.replace(/[^A-Za-z0-9]/g, "_");
    if (document.body.dataset[boundFlag] === "true") return;
    document.body.dataset[boundFlag] = "true";

    /* 五个库共用 document.body 上的委托监听，因此每个实例只处理「自己页面内」
       或「自己打开的弹窗」里发生的事件，避免互相串台 */
    function inMyPage(el) { return !!(el && el.closest && el.closest("#page-" + PAGE_ID)); }
    function myModal() {
      var m = document.getElementById("t2dModalMask");
      return (m && m.getAttribute("data-t2d-page") === PAGE_ID) ? m : null;
    }

    document.body.addEventListener("click", function (event) {
      var el = event.target;
      if (!el || !el.closest) return;
      if (!inMyPage(el) && !myModal()) return;
      var s = getState();
      var node, hit;

      /* ---- 弹窗：关联数据表多选面板开关 ---- */
      hit = el.closest("[data-t2d-msel-toggle]");
      if (hit) {
        var picker = hit.closest("[data-t2d-msel]");
        if (picker) picker.classList.toggle("is-open");
        return;
      }

      /* ---- 弹窗 ---- */
      if (el.closest("[data-t2d-modal-close]")) { closeModal(); return; }

      hit = el.closest("[data-t2d-modal-ok]");
      if (hit) {
        var mask = document.getElementById("t2dModalMask");
        if (!mask) return;
        var mode = mask.getAttribute("data-t2d-mode");
        var mkey = mask.getAttribute("data-t2d-key");
        if (mode === "delete") deleteDataset(mkey);
        else submitDatasetForm(mask);
        return;
      }

      /* ---- 数据集增删改入口 ---- */
      hit = el.closest("[data-t2d-add-ds]");
      if (hit) { openDatasetForm("add"); return; }

      hit = el.closest("[data-t2d-edit-ds]");
      if (hit) { openDatasetForm("edit", hit.getAttribute("data-t2d-edit-ds").slice(3)); return; }

      hit = el.closest("[data-t2d-del-ds]");
      if (hit) { openDeleteConfirm(hit.getAttribute("data-t2d-del-ds").slice(3)); return; }

      /* ---- 分页 ---- */
      hit = el.closest("[data-t2d-page]");
      if (hit) {
        var pkey = hit.getAttribute("data-t2d-page");
        var pto = parseInt(hit.getAttribute("data-t2d-page-to"), 10);
        if (pkey && isFinite(pto) && pto >= 1) { s.page[pkey] = pto; renderPage(); }
        return;
      }

      hit = el.closest("[data-t2d-per]");
      if (hit) {
        var pv = parseInt(hit.getAttribute("data-t2d-per"), 10);
        if (isFinite(pv) && pv >= 1) { s.per = pv; s.page = {}; renderPage(); }
        return;
      }

      /* ---- 页签 ---- */
      hit = el.closest("[data-t2d-tab]");
      if (hit) { s.tab = hit.getAttribute("data-t2d-tab"); s.q1b = ""; renderPage(); return; }

      /* ---- 目录节点 ---- */
      hit = el.closest("[data-t2d-node]");
      if (hit) {
        node = hit.getAttribute("data-t2d-node");
        s.node = node;
        s.tab = node === "db-root" ? "fields" : "info";
        s.q1b = "";
        renderPage(); return;
      }

      hit = el.closest("[data-t2d-toggle]");
      if (hit) {
        var id = hit.getAttribute("data-t2d-toggle");
        if (s.node === id) { s.node = "db-root"; s.tab = "fields"; }
        else { s.node = id; s.tab = "fields"; }
        s.open[id] = !s.open[id];
        renderPage(); return;
      }
    });

    document.body.addEventListener("input", function (event) {
      var el = event.target;
      if (!el || !el.matches) return;
      var s = getState();
      if (el.matches("[data-t2d-filter1]")) { s.q1 = el.value; renderPage(); keepFocus("[data-t2d-filter1]"); return; }
      if (el.matches("[data-t2d-q1b]")) {
        s.q1b = el.value;
        s.page["dbFields"] = 1;
        renderPage(); keepFocus("[data-t2d-q1b]"); return;
      }
      /* 表单输入：清除该项错误态 */
      if (el.matches("[data-t2d-f-name]")) clearFormError(el);
    });

    document.body.addEventListener("change", function (event) {
      var el = event.target;
      if (!el || !el.matches) return;
      /* 关联数据表勾选：先同步控件回显，再清错误态 */
      if (el.matches("[data-t2d-f-tables]")) {
        syncTablePicker();
        clearFormError(el);
      }
    });

    document.body.addEventListener("keydown", function (event) {
      if (event.key === "Escape") { closeModal(); return; }
      /* 弹窗内回车提交：只处理本实例打开的弹窗 */
      if (event.key === "Enter") {
        var mask = myModal();
        if (mask && mask.getAttribute("data-t2d-mode") !== "delete" && event.target && event.target.closest && event.target.closest("#t2dModalMask")) {
          event.preventDefault();
          submitDatasetForm(mask);
        }
      }
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
     13. 接入既有渲染链，让切到本页时走新实现
     ========================================================================== */
  function patch(name) {
    if (typeof window[name] !== "function") return;
    var base = window[name];
    /* 五个实例依次包装：命中自己的 pageId 就走新实现，否则透传给上一层 */
    var wrapped = function (pageId) {
      if (pageId === PAGE_ID) { renderPage(); return; }
      return base.apply(this, arguments);
    };
    wrapped.__t2dRewritten = true;
    window[name] = wrapped;
  }

  ["renderLowdimDbOverviewPage", "renderTwodDatabasePage"].forEach(patch);

  bindEvents();

  /* 把本实例的渲染函数登记到全局表，供 switchPage / 首屏渲染统一调度 */
  DB_RENDERERS[PAGE_ID] = renderPage;
  DB_RENDER_LIST.push(renderPage);
  }   /* ← buildDbPage(cfg) 结束 */

  /* ==========================================================================
     14. 装配五个库实例 + 全局调度
     ========================================================================== */
  Object.keys(DB_CONFIGS).forEach(function (k) { buildDbPage(DB_CONFIGS[k]); });

  var baseSwitch = typeof window.switchPage === "function" ? window.switchPage : null;
  if (baseSwitch && !baseSwitch.__t2dRewritten) {
    var patchedSwitch = function (page) {
      var result = baseSwitch.apply(this, arguments);
      if (DB_RENDERERS[page]) setTimeout(DB_RENDERERS[page], 0);
      return result;
    };
    patchedSwitch.__t2dRewritten = true;
    window.switchPage = patchedSwitch;
    try { switchPage = patchedSwitch; } catch (e) { /* ignore */ }
  }

  /* 首屏：当前停在某个库页则立即渲染该页；其余页面容器存在时也一并装配 */
  try {
    if (typeof state !== "undefined" && DB_RENDERERS[state.page]) setTimeout(DB_RENDERERS[state.page], 0);
  } catch (e) { /* ignore */ }
  DB_RENDER_LIST.forEach(function (rp) {
    setTimeout(rp, 0);
    [60, 200, 500, 1000].forEach(function (d) { setTimeout(rp, d); });
  });
