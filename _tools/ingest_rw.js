/* ============================================================================
   二维材料数据采集加工处理 —— 页面重构层（20260924）
   本文件由 _tools/build3.py 复制到 assets/js/61-ingest-twod.js，请勿直接改产物。
   作用范围：仅 #page-lowdim-ingest-twod（lowdim-ingest-twod.html / 完整应用入口）。

   需求要点：
   1) 保留「数据安全等级」「创建任务」按钮；删除原采集加工任务总表与卡片数据
   2) 三个页签：资源采集 / 资源录入 / 资源加工（默认资源采集）
   3) 创建任务：采集ID 自动编码 + 采集任务名称 + 三种采集方式（开源数据获取 /
      数据购买·自采数据 / 数据计算），各自含采集参数、异常处理与确认入库
   4) 「数据资源对象介绍」放入创建任务弹窗，蓝色按钮，点击弹窗展示
   5) 资源录入：按 2.2 数据录入（录入方式 / 批量导入 / 单条手动 / 字段校验 / 审核）
   6) 资源加工：加工流程总览 + 步骤1~6 + 版本标记规则
   ========================================================================== */
(function () {
  "use strict";

  var PAGE_ID = "lowdim-ingest-twod";
  var STYLE_ID = "rw-ingest-twod-style-20260924";
  /* 样式表里的选择器带 #page-<PAGE_ID> 前缀，所以每个被接管的页面都必须有自己的样式表，
     id 也必须按页区分——否则第二类材料页会复用二维那套前缀，选择器全部落空。 */
  function styleIdFor(pid) { return "rw-ingest-" + pid + "-style-20260924"; }
  var NS = "rw";

  /* 2026-10-08：资源录入页的「批量导入」功能暂时下线——入口按钮不渲染，
     对应动作也被拦下（数据仍保留，恢复只需把下面这个开关改回 false）。 */
  var HIDE_ENTRY_BATCH = true;

  /* ---------------------------------------------------------------- 工具 */
  var esc = (function () {
    try {
      if (typeof escapeLowDimHtml === "function") return escapeLowDimHtml;
    } catch (e) { /* ignore */ }
    return function (v) {
      return String(v == null ? "" : v)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    };
  })();

  /* 材料配置里自带的优先，其次用 04.js 的全局数据，最后才是兜底值 */
  var TWOD_MATERIAL_TYPES_OVERRIDE = null;
  var TWOD_TASK_RESOURCE_OBJECTS_OVERRIDE = null;

  function materialTypes() {
    if (TWOD_MATERIAL_TYPES_OVERRIDE && TWOD_MATERIAL_TYPES_OVERRIDE.length) return TWOD_MATERIAL_TYPES_OVERRIDE;
    try {
      if (typeof TWOD_MATERIAL_TYPES !== "undefined" && TWOD_MATERIAL_TYPES.length) {
        return TWOD_MATERIAL_TYPES;
      }
    } catch (e) { /* ignore */ }
    return [{ name: "过渡金属硫族化合物", abbr: "TMD", sample: "MoS2", fields: ["结构特征", "电子结构", "热学性质", "力学性质", "光学性质"] }];
  }

  function resourceObjects() {
    if (TWOD_TASK_RESOURCE_OBJECTS_OVERRIDE && TWOD_TASK_RESOURCE_OBJECTS_OVERRIDE.length) return TWOD_TASK_RESOURCE_OBJECTS_OVERRIDE;
    try {
      if (typeof TWOD_TASK_RESOURCE_OBJECTS !== "undefined" && TWOD_TASK_RESOURCE_OBJECTS.length) {
        return TWOD_TASK_RESOURCE_OBJECTS;
      }
    } catch (e) { /* ignore */ }
    return [];
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function nowText(d) {
    d = d || new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate())
      + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function stamp(d) {
    d = d || new Date();
    return "" + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
  }

  /* ---------------------------------------------------------------- 样式 */
  function ensureStyle() {
    var sid = styleIdFor(PAGE_ID);
    if (document.getElementById(sid)) return;
    var s = document.createElement("style");
    s.id = sid;
    s.textContent = [
      /* 页面容器：抵消外层 24px 内边距，与既有 .twod-main-page 行为一致 */
      "#page-" + PAGE_ID + " .rw-page { background:#f4f6fa; margin:-24px; padding:24px 26px 34px; min-height:calc(100vh - 80px); color:#1f2d3d; }",
      "#page-" + PAGE_ID + " .rw-head { display:flex; align-items:flex-start; justify-content:space-between; gap:20px; margin-bottom:18px; }",
      "#page-" + PAGE_ID + " .rw-head h1 { margin:0 0 6px; font-size:24px; font-weight:700; color:#1f2d3d; letter-spacing:0; }",
      "#page-" + PAGE_ID + " .rw-head p { margin:0; color:#74849a; font-size:13px; line-height:1.6; }",
      "#page-" + PAGE_ID + " .rw-head-actions { display:flex; gap:10px; flex:0 0 auto; }",

      /* 通用按钮 */
      ".rw-btn { display:inline-flex; align-items:center; gap:6px; min-height:38px; padding:0 16px; border-radius:8px; border:1px solid #d3dceb; background:#fff; color:#40536e; font-size:14px; cursor:pointer; white-space:nowrap; }",
      ".rw-btn:hover { border-color:#7aa2f7; color:#1f63ff; }",
      ".rw-btn--primary { min-height:42px; padding:0 20px; border:0; background:#1f63ff; color:#fff; font-weight:600; box-shadow:0 5px 12px rgba(31,99,255,.2); }",
      ".rw-btn--primary:hover { background:#0f52e0; color:#fff; }",
      ".rw-btn--primary[disabled] { background:#a9bde0; box-shadow:none; cursor:not-allowed; }",
      ".rw-btn--blue { border-color:#1f63ff; background:#eef3ff; color:#1f63ff; font-weight:600; }",
      ".rw-btn--blue:hover { background:#dce7ff; color:#0f52e0; }",
      ".rw-btn--ghost { border-style:dashed; color:#1677d2; }",
      ".rw-btn--sm { min-height:30px; padding:0 12px; font-size:13px; }",
      ".rw-btn--danger { border-color:#f0a4a4; background:#fff1f1; color:#d03050; }",

      /* 页签 */
      "#page-" + PAGE_ID + " .rw-tabs { display:flex; gap:6px; border-bottom:1px solid #e3e9f2; margin-bottom:18px; }",
      "#page-" + PAGE_ID + " .rw-tab { position:relative; padding:11px 22px; border:0; background:transparent; font-size:15px; color:#6b7d95; cursor:pointer; border-radius:8px 8px 0 0; }",
      "#page-" + PAGE_ID + " .rw-tab:hover { color:#1f63ff; background:#eaf1ff; }",
      "#page-" + PAGE_ID + " .rw-tab.is-active { color:#1f63ff; font-weight:600; background:#eaf1ff; }",
      "#page-" + PAGE_ID + " .rw-tab.is-active::after { content:\"\"; position:absolute; left:14px; right:14px; bottom:-1px; height:3px; border-radius:3px; background:#1f63ff; }",
      "#page-" + PAGE_ID + " .rw-tab-count { margin-left:6px; padding:1px 7px; border-radius:9px; background:#d8e0ee; font-size:12px; color:#55637a; }",

      /* 卡片 */
      "#page-" + PAGE_ID + " .rw-card { background:#fff; border:1px solid #e6ecf5; border-radius:12px; padding:18px 20px; margin-bottom:16px; }",
      "#page-" + PAGE_ID + " .rw-card-head { display:flex; align-items:flex-start; justify-content:space-between; gap:14px; margin-bottom:14px; }",
      "#page-" + PAGE_ID + " .rw-card-head h3 { margin:0 0 4px; font-size:16px; color:#22364f; }",
      "#page-" + PAGE_ID + " .rw-card-head p { margin:0; font-size:13px; color:#7d8ca3; }",
      "#page-" + PAGE_ID + " .rw-card-note { margin:0 0 12px; font-size:13px; color:#6b7d95; }",
      "#page-" + PAGE_ID + " .rw-section-title { display:flex; align-items:center; gap:8px; margin:0 0 12px; font-size:15px; color:#22364f; }",

      /* 表格 */
      "#page-" + PAGE_ID + " .rw-tbl-wrap { overflow-x:auto; border-radius:10px; border:1px solid #e6ecf5; }",
      "#page-" + PAGE_ID + " table.rw-tbl { width:100%; border-collapse:separate; border-spacing:0; font-size:13px; color:#2c3e56; }",
      "#page-" + PAGE_ID + " table.rw-tbl th { background:#f4f8fd; padding:11px 13px; text-align:left; font-weight:600; color:#54637c; border-bottom:1px solid #e6ecf5; white-space:nowrap !important; }",
      "#page-" + PAGE_ID + " table.rw-tbl td { padding:11px 13px; border-bottom:1px solid #eef2f8; vertical-align:top; line-height:1.6; }",
      "#page-" + PAGE_ID + " table.rw-tbl tbody tr:last-child td { border-bottom:0; }",
      "#page-" + PAGE_ID + " table.rw-tbl tbody tr:hover td { background:#f8fbff; }",
      "#page-" + PAGE_ID + " table.rw-tbl td.rw-nowrap { white-space:nowrap !important; }",
      "#page-" + PAGE_ID + " table.rw-tbl td.rw-id { font-family:Consolas,Monaco,monospace; color:#1f63ff; white-space:nowrap !important; }",

      /* 徽标 */
      ".rw-tag { display:inline-block; padding:2px 9px; border-radius:10px; font-size:12px; line-height:18px; white-space:nowrap !important; }",
      ".rw-tag--open { background:#e8f3ff; color:#1f63ff; }",
      ".rw-tag--buy { background:#f3ecff; color:#6b3fe0; }",
      ".rw-tag--calc { background:#e6f8f2; color:#0d8f66; }",
      ".rw-tag--done { background:#e7f8ee; color:#0d8f66; }",
      ".rw-tag--fail { background:#fdecec; color:#d03050; }",
      ".rw-tag--warn { background:#fff5e6; color:#b8720f; }",
      ".rw-tag--run { background:#eaf1ff; color:#1f63ff; }",
      ".rw-tag--gray { background:#eef1f6; color:#6b7d95; }",

      /* 操作链接 */
      ".rw-op { border:0; background:transparent; color:#1f63ff; font-size:13px; cursor:pointer; padding:0 8px 0 0; }",
      ".rw-op:hover { text-decoration:underline; }",
      ".rw-op + .rw-op { padding-left:8px; border-left:1px solid #dde5f0; }",
      ".rw-op--danger { color:#d03050; }",
      ".rw-op[disabled] { color:#b3bfd0; cursor:not-allowed; }",

      /* 空态 */
      "#page-" + PAGE_ID + " .rw-empty { padding:52px 0; text-align:center; color:#8a99ae; font-size:14px; }",
      "#page-" + PAGE_ID + " .rw-empty b { display:block; font-size:34px; color:#c4cfdf; margin-bottom:8px; font-weight:400; }",

      /* 说明条 */
      "#page-" + PAGE_ID + " .rw-banner { display:flex; gap:10px; padding:12px 14px; border-radius:10px; background:#eef4ff; border:1px solid #d6e4ff; color:#40536e; font-size:13px; line-height:1.6; margin-bottom:16px; }",
      "#page-" + PAGE_ID + " .rw-banner--warn { background:#fff7e8; border-color:#ffe0ac; }",
      "#page-" + PAGE_ID + " .rw-banner--err { background:#fdeeee; border-color:#f7c9c9; }",

      /* 流程条（数据策划 → … → 质量评价） */
      "#page-" + PAGE_ID + " .rw-flow { display:flex; align-items:stretch; gap:0; padding:6px 0 2px; overflow-x:auto; }",
      "#page-" + PAGE_ID + " .rw-flow-node { flex:1 1 0; min-width:132px; position:relative; padding:14px 12px; border-radius:10px; border:1px solid #dbe4f2; background:#f8fafd; cursor:pointer; text-align:center; }",
      "#page-" + PAGE_ID + " .rw-flow-node:hover { border-color:#1f63ff; box-shadow:0 4px 12px rgba(31,99,255,.1); }",
      "#page-" + PAGE_ID + " .rw-flow-node.is-active { border-color:#1f63ff; background:#eaf1ff; }",
      "#page-" + PAGE_ID + " .rw-flow-idx { display:inline-grid; place-items:center; width:26px; height:26px; border-radius:50%; background:#1f63ff; color:#fff; font-size:13px; font-weight:700; margin-bottom:7px; }",
      "#page-" + PAGE_ID + " .rw-flow-name { display:block; font-size:14px; font-weight:600; color:#22364f; margin-bottom:4px; }",
      "#page-" + PAGE_ID + " .rw-flow-desc { display:block; font-size:12px; color:#7d8ca3; line-height:1.5; }",
      "#page-" + PAGE_ID + " .rw-flow-arrow { flex:0 0 30px; display:grid; place-items:center; color:#b6c3d6; font-size:18px; }",

      /* 简易流程链（状态流转 / 审核流程） */
      "#page-" + PAGE_ID + " .rw-chain { display:flex; flex-wrap:wrap; align-items:center; gap:8px; padding:14px; border-radius:10px; background:#f8fafd; border:1px solid #e6ecf5; }",
      "#page-" + PAGE_ID + " .rw-chain-item { display:inline-flex; align-items:center; min-height:32px; padding:0 14px; border-radius:16px; background:#eef3ff; border:1px solid #d6e4ff; color:#1f63ff; font-size:13px; }",
      "#page-" + PAGE_ID + " .rw-chain-item.is-fork { background:#fff7e8; border-color:#ffe0ac; color:#b8720f; }",
      "#page-" + PAGE_ID + " .rw-chain-item.is-end { background:#e7f8ee; border-color:#b9e8cf; color:#0d8f66; }",
      "#page-" + PAGE_ID + " .rw-chain-item.is-back { background:#fdecec; border-color:#f7c9c9; color:#d03050; }",
      "#page-" + PAGE_ID + " .rw-chain-sep { color:#aab6c9; }",

      /* 步骤时间线（批量导入 / 单条手动录入） */
      "#page-" + PAGE_ID + " .rw-steps { display:grid; gap:10px; }",
      "#page-" + PAGE_ID + " .rw-step-row { display:grid; grid-template-columns:36px minmax(0,1fr); gap:12px; padding:12px 14px; border:1px solid #e6ecf5; border-radius:10px; background:#fdfdff; }",
      "#page-" + PAGE_ID + " .rw-step-idx { display:grid; place-items:center; width:32px; height:32px; border-radius:50%; background:#1f63ff; color:#fff; font-weight:700; font-size:14px; }",
      "#page-" + PAGE_ID + " .rw-step-who { display:inline-block; margin-left:8px; padding:1px 9px; border-radius:10px; background:#eef1f6; color:#55637a; font-size:12px; }",
      "#page-" + PAGE_ID + " .rw-step-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:8px 18px; margin-top:8px; font-size:13px; }",
      "#page-" + PAGE_ID + " .rw-step-grid div { color:#5c6b83; line-height:1.6; }",
      "#page-" + PAGE_ID + " .rw-step-grid b { color:#8a99ae; font-weight:500; margin-right:6px; }",

      /* 引入浮层：遮罩 + 弹窗 */
      ".rw-mask { position:fixed; inset:0; z-index:4000; background:rgba(20,32,52,.46); display:flex; align-items:flex-start; justify-content:center; padding:42px 18px; overflow-y:auto; }",
      ".rw-modal { width:min(1080px,100%); background:#fff; border-radius:14px; box-shadow:0 22px 60px rgba(20,40,80,.26); display:flex; flex-direction:column; max-height:calc(100vh - 84px); }",
      ".rw-modal--narrow { width:min(640px,100%); }",
      ".rw-modal-head { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; padding:18px 22px 14px; border-bottom:1px solid #edf1f6; }",
      ".rw-modal-head h3 { margin:0 0 4px; font-size:18px; color:#1f2d3d; }",
      ".rw-modal-head p { margin:0; font-size:13px; color:#7d8ca3; }",
      ".rw-modal-head-side { display:flex; align-items:center; gap:10px; flex:0 0 auto; }",
      ".rw-modal-close { border:0; background:transparent; font-size:22px; line-height:1; color:#8a99ae; cursor:pointer; padding:0 4px; }",
      ".rw-modal-close:hover { color:#d03050; }",
      ".rw-modal-body { padding:18px 22px 20px; overflow-y:auto; }",
      ".rw-modal-foot { display:flex; align-items:center; justify-content:flex-end; gap:10px; padding:14px 22px; border-top:1px solid #edf1f6; background:#fbfcfe; border-radius:0 0 14px 14px; }",
      ".rw-modal-foot .rw-foot-tip { margin-right:auto; font-size:13px; color:#8a99ae; }",

      /* 弹窗内分步条 */
      ".rw-stepbar { display:flex; align-items:center; padding:14px 22px; background:#fbfcfe; border-bottom:1px solid #edf1f6; }",
      ".rw-stepbar-item { display:flex; align-items:center; gap:8px; color:#9aa9bb; font-size:13px; }",
      ".rw-stepbar-item .dot { display:grid; place-items:center; width:26px; height:26px; border-radius:50%; border:2px solid #e1e6ed; background:#eef1f5; color:#9aa9b7; font-weight:700; font-size:12px; }",
      ".rw-stepbar-item.is-done { color:#0d8f66; }",
      ".rw-stepbar-item.is-done .dot { border-color:#0d8f66; background:#0d8f66; color:#fff; }",
      /* 注意：is-active 必须写在 is-done 之后——当前步骤即使已完成，也保持蓝色高亮，避免“当前在哪一步”看不出来 */
      ".rw-stepbar-item.is-active { color:#1f63ff; font-weight:600; }",
      ".rw-stepbar-item.is-active .dot { border-color:#1f63ff; background:#1f63ff; color:#fff; }",
      ".rw-stepbar-line { flex:1 1 auto; height:2px; background:#e3e9f2; margin:0 12px; }",

      /* 表单 */
      ".rw-form { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px 20px; }",
      ".rw-field { display:flex; flex-direction:column; gap:6px; }",
      ".rw-field.is-full { grid-column:1 / -1; }",
      ".rw-field > label { font-size:13px; color:#54637c; }",
      ".rw-field > label i { color:#d03050; font-style:normal; margin-left:3px; }",
      ".rw-field input[type=text], .rw-field input[type=number], .rw-field select, .rw-field textarea { width:100%; box-sizing:border-box; min-height:38px; padding:8px 12px; border:1px solid #d5dee8; border-radius:8px; font-size:14px; color:#2c3e56; background:#fff; }",
      ".rw-field textarea { min-height:82px; resize:vertical; line-height:1.6; }",
      ".rw-field input:focus, .rw-field select:focus, .rw-field textarea:focus { outline:0; border-color:#1f63ff; box-shadow:0 0 0 3px rgba(31,99,255,.12); }",
      ".rw-field input[readonly] { background:#f5f7fb; color:#6b7d95; }",
      ".rw-field-tip { font-size:12px; color:#8a99ae; line-height:1.5; }",
      ".rw-field.is-error input, .rw-field.is-error select, .rw-field.is-error textarea { border-color:#d03050 !important; }",
      ".rw-field-err { font-size:12px; color:#d03050; }",

      /* 采集方式三选一 */
      ".rw-methods { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }",
      ".rw-method { display:block; position:relative; padding:14px 16px; border:1px solid #dbe4f2; border-radius:10px; background:#fff; cursor:pointer; }",
      ".rw-method:hover { border-color:#7aa2f7; }",
      ".rw-method.is-on { border-color:#1f63ff; background:#f2f7ff; box-shadow:0 0 0 3px rgba(31,99,255,.1); }",
      ".rw-method input { width:16px !important; height:16px !important; margin:0 !important; }",
      ".rw-method-top { display:flex; align-items:center; gap:8px; margin-bottom:6px; }",
      ".rw-method-title { font-size:15px; font-weight:600; color:#22364f; }",
      ".rw-method-desc { font-size:12px; color:#7d8ca3; line-height:1.55; }",

      /* 数据库 / 数据集勾选 */
      ".rw-db-list { display:grid; gap:12px; }",
      ".rw-db { border:1px solid #e2e8f2; border-radius:10px; padding:12px 14px; background:#fdfdff; }",
      ".rw-db.is-on { border-color:#1f63ff; background:#f5f9ff; }",
      ".rw-db-top { display:flex; align-items:center; gap:10px; }",
      ".rw-db-top input { width:16px !important; height:16px !important; margin:0 !important; }",
      ".rw-db-name { font-size:14px; font-weight:600; color:#22364f; }",
      ".rw-db-meta { font-size:12px; color:#8a99ae; }",
      ".rw-db-right { margin-left:auto; display:flex; align-items:center; gap:8px; }",
      ".rw-ds-list { display:grid; gap:6px; margin-top:10px; padding-left:26px; }",
      ".rw-ds { display:flex; align-items:flex-start; gap:9px; padding:8px 10px; border-radius:8px; background:#fff; border:1px solid #eaeff7; cursor:pointer; }",
      ".rw-ds:hover { border-color:#9dbcf5; }",
      ".rw-ds.is-on { background:#eef4ff; border-color:#a9c6f8; }",
      ".rw-ds input { width:15px !important; height:15px !important; margin:0 !important; margin-top:2px !important; }",
      ".rw-ds-name { font-size:13px; color:#2c3e56; font-weight:600; }",
      ".rw-ds-desc { font-size:12px; color:#8a99ae; }",
      ".rw-ds-count { margin-left:auto; font-size:12px; color:#1f63ff; white-space:nowrap !important; }",
      /* 2026-10-08：加工步骤 5「数据产品按数据集划分」卡片 */
      ".rw-ds-wrap { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }",
      ".rw-pds { display:block; padding:10px 12px; border-radius:10px; background:#fff; border:1px solid #eaeff7; cursor:pointer; }",
      ".rw-pds:hover { border-color:#9dbcf5; }",
      ".rw-pds.is-on { background:#eef4ff; border-color:#a9c6f8; }",
      ".rw-pds-top { display:flex; align-items:center; gap:9px; }",
      ".rw-pds-top input { width:15px !important; height:15px !important; margin:0 !important; }",
      ".rw-pds-top b { font-size:13px; color:#22364f; }",
      ".rw-pds-desc { margin-top:6px; font-size:12px; color:#5b6c85; line-height:20px; }",
      ".rw-pds .rw-field-tip { margin-top:6px; font-size:12px; line-height:18px; }",
      ".rw-pick-result { margin-top:14px; border:1px solid #e2e8f2; border-radius:10px; overflow:hidden; }",
      ".rw-pick-result-head { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:#f4f8fd; font-size:13px; color:#54637c; border-bottom:1px solid #e6ecf5; }",

      /* 采集参数 */
      ".rw-params { border:1px solid #e2e8f2; border-radius:10px; padding:14px 16px; background:#fdfdff; }",
      ".rw-params-title { display:flex; align-items:center; gap:8px; font-size:15px; font-weight:600; color:#22364f; margin-bottom:10px; }",
      ".rw-range-row { display:grid; grid-template-columns:minmax(150px,1.4fr) 1fr 1fr 0.8fr auto; gap:10px; align-items:center; }",
      ".rw-range-row input, .rw-range-row select { width:100%; box-sizing:border-box; min-height:34px; padding:6px 10px; border:1px solid #d5dee8; border-radius:7px; font-size:13px; }",

      /* 日志 / 执行面板 */
      ".rw-run { border:1px solid #e2e8f2; border-radius:10px; background:#fbfcfe; padding:12px 14px; margin-top:14px; }",
      ".rw-run-head { display:flex; align-items:center; justify-content:space-between; gap:12px; font-size:13px; color:#54637c; margin-bottom:8px; }",
      ".rw-log { max-height:190px; overflow-y:auto; background:#101a2b; border-radius:8px; padding:10px 12px; font-family:Consolas,Monaco,monospace; font-size:12px; line-height:1.85; color:#c8d5e8; }",
      ".rw-log-line.is-ok { color:#74e0a8; }",
      ".rw-log-line.is-err { color:#ff9d9d; }",
      ".rw-log-line.is-warn { color:#ffcf85; }",
      ".rw-log-time { color:#6d7f99; margin-right:8px; }",

      /* 结果区 */
      ".rw-result { margin-top:14px; border:1px solid #cfe8db; background:#f2fbf6; border-radius:10px; padding:14px 16px; }",
      ".rw-result.is-fail { border-color:#f3c8c8; background:#fdf4f4; }",
      ".rw-result.is-warn { border-color:#f7ddb0; background:#fffaf0; }",
      ".rw-result-title { display:flex; align-items:center; gap:8px; font-size:15px; font-weight:600; color:#0d8f66; margin-bottom:8px; }",
      ".rw-result.is-fail .rw-result-title { color:#d03050; }",
      ".rw-result.is-warn .rw-result-title { color:#b8720f; }",
      ".rw-kv { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:8px 18px; margin-bottom:10px; font-size:13px; color:#5c6b83; }",
      ".rw-kv b { color:#8a99ae; font-weight:500; margin-right:6px; }",

      /* 关联配置规范（勾选标准化处理模块的规则）——弹窗挂在 body 下，样式必须是全局选择器 */
      ".rw-std-wrap { margin-top:12px; border:1px solid #dfe7f3; border-radius:10px; background:#fafcff; padding:12px 14px; }",
      ".rw-std-top { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px; font-size:13px; color:#5c6b83; }",
      ".rw-std-top b { color:#1f63ff; font-size:14px; }",
      ".rw-std-top .rw-btn { margin-left:8px; }",
      ".rw-std-cat { margin-bottom:12px; }",
      ".rw-std-cat-head { display:flex; align-items:center; gap:8px; font-size:13px; color:#22364f; margin-bottom:7px; }",
      ".rw-std-cat-count { padding:1px 8px; border-radius:9px; background:#eaf1ff; color:#1f63ff; font-size:12px; }",
      ".rw-std-items { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:8px; }",
      ".rw-std-item { display:flex; gap:8px; align-items:flex-start; padding:9px 11px; border:1px solid #e3eaf6; border-radius:8px; background:#fff; cursor:pointer; }",
      ".rw-std-item.is-on { border-color:#7aa2f7; background:#f2f7ff; }",
      ".rw-std-item input { margin-top:3px; }",
      ".rw-std-item-title { font-size:13px; color:#22364f; font-weight:600; }",
      ".rw-std-item-desc { font-size:12px; color:#8a99ae; line-height:1.5; margin-top:2px; }",

      /* 计算方式：输出文件单选 + 输入文件上传 */
      ".rw-calc-outs { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; }",
      ".rw-calc-out { display:block; padding:12px 12px; border:1px solid #dbe4f2; border-radius:10px; background:#fff; cursor:pointer; }",
      ".rw-calc-out input { width:16px !important; height:16px !important; margin:0 !important; }",
      ".rw-calc-out.is-on { border-color:#1f63ff; background:#f2f7ff; box-shadow:0 0 0 3px rgba(31,99,255,.1); }",
      ".rw-calc-out b { display:block; font-size:14px; color:#22364f; margin:4px 0 3px; }",
      ".rw-calc-out span { font-size:12px; color:#8a99ae; line-height:1.5; }",
      ".rw-upload-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; margin-top:12px; }",
      ".rw-upload-slot { border:1px dashed #c3d0e4; border-radius:10px; padding:12px; background:#fbfcfe; text-align:center; }",
      ".rw-upload-slot.is-ok { border-style:solid; border-color:#8fd4ae; background:#f2fbf6; }",
      ".rw-upload-slot.is-miss { border-style:solid; border-color:#f0a4a4; background:#fdf4f4; }",
      ".rw-upload-slot b { display:block; font-size:13px; color:#22364f; margin-bottom:4px; font-family:Consolas,Monaco,monospace; }",
      ".rw-upload-slot span { font-size:12px; color:#8a99ae; }",
      ".rw-upload-zone { margin-top:12px; border:1px dashed #b9c8e0; border-radius:10px; padding:18px; text-align:center; background:#fbfcfe; }",
      ".rw-upload-zone strong { display:block; font-size:14px; color:#22364f; margin-bottom:4px; }",
      ".rw-upload-zone span { font-size:12px; color:#8a99ae; }",

      /* 校验报告 */
      ".rw-report { border:1px solid #e2e8f2; border-radius:10px; overflow:hidden; margin-top:14px; }",
      ".rw-report-head { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:#f4f8fd; border-bottom:1px solid #e6ecf5; font-size:14px; color:#22364f; font-weight:600; }",
      ".rw-report-item { display:flex; align-items:flex-start; gap:9px; padding:9px 14px; border-bottom:1px solid #eef2f8; font-size:13px; color:#5c6b83; }",
      ".rw-report-item:last-child { border-bottom:0; }",
      ".rw-report-item.is-bad { background:#fdf6f6; color:#8a3a4a; }",
      ".rw-report-ico { flex:0 0 18px; text-align:center; font-weight:700; }",

      /* 结构化 JSON 预览 */
      ".rw-json { background:#101a2b; border-radius:10px; padding:14px 16px; color:#c8d5e8; font-family:Consolas,Monaco,monospace; font-size:12.5px; line-height:1.8; overflow-x:auto; }",
      ".rw-json .k { color:#7fb8ff; }",
      ".rw-json .s { color:#8ee6a8; }",
      ".rw-json .n { color:#ffcf85; }",

      /* 资源对象介绍弹窗 */
      ".rw-intro-list { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }",
      ".rw-intro-item { border:1px solid #e2e8f2; border-radius:10px; padding:12px 14px; background:#fdfdff; }",
      ".rw-intro-item h5 { margin:0 0 6px; font-size:14px; color:#1f63ff; }",
      ".rw-intro-item p { margin:0; font-size:13px; color:#5c6b83; line-height:1.7; }",

      /* Toast */
      ".rw-toast { position:fixed; left:50%; bottom:44px; transform:translateX(-50%); z-index:5000; min-width:220px; max-width:70vw; padding:12px 18px; border-radius:10px; background:rgba(24,38,60,.94); color:#fff; font-size:14px; box-shadow:0 10px 30px rgba(20,40,80,.3); }",
      ".rw-toast.is-ok { background:rgba(13,143,102,.95); }",
      ".rw-toast.is-err { background:rgba(208,48,80,.95); }",

      /* 子视图切换条 */
      "#page-" + PAGE_ID + " .rw-subtabs { display:flex; flex-wrap:wrap; gap:8px; margin:0 0 14px; }",
      "#page-" + PAGE_ID + " .rw-subtab { padding:8px 16px; border:1px solid #dbe4f2; border-radius:18px; background:#fff; color:#55637a; font-size:13px; cursor:pointer; }",
      "#page-" + PAGE_ID + " .rw-subtab:hover { border-color:#7aa2f7; color:#1f63ff; }",
      "#page-" + PAGE_ID + " .rw-subtab.is-active { border-color:#1f63ff; background:#eaf1ff; color:#1f63ff; font-weight:600; }",

      /* 复选框组 */
      ".rw-checks { display:flex; flex-wrap:wrap; gap:12px; padding-top:6px; }",
      ".rw-check { display:inline-flex; align-items:center; gap:7px; padding:6px 12px; border:1px solid #dbe4f2; border-radius:8px; background:#fff; font-size:13px; color:#40536e; cursor:pointer; }",
      ".rw-check.is-on { border-color:#1f63ff; background:#f2f7ff; color:#1f63ff; }",
      ".rw-check input { width:15px !important; height:15px !important; margin:0 !important; }",

      /* 进度条 */
      "#page-" + PAGE_ID + " .rw-progress { margin-top:6px; height:6px; border-radius:4px; background:#eef2f8; overflow:hidden; }",
      "#page-" + PAGE_ID + " .rw-progress i { display:block; height:100%; background:#1f63ff; border-radius:4px; }",

      /* 表单错误小字 */
      ".rw-field-tip.rw-error { color:#d03050 !important; }",

      /* 响应式 */
      "@media (max-width:1440px) {",
      "  .rw-methods { grid-template-columns:1fr; }",
      "  .rw-calc-outs { grid-template-columns:repeat(2,minmax(0,1fr)); }",
      "  .rw-upload-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }",
      "  .rw-intro-list { grid-template-columns:1fr; }",
      "}",
      "@media (max-width:1180px) {",
      "  .rw-form { grid-template-columns:1fr; }",
      "  .rw-range-row { grid-template-columns:1fr 1fr; }",
      "}",
      "@media (max-width:820px) {",
      "  #page-" + PAGE_ID + " .rw-head { flex-direction:column; }",
      "  #page-" + PAGE_ID + " .rw-flow { flex-direction:column; }",
      "  #page-" + PAGE_ID + " .rw-flow-arrow { transform:rotate(90deg); height:20px; }",
      "  .rw-modal { width:100%; }",
      "}"
    ].join("\n");
    document.head.appendChild(s);
  }

  /* ------------------------------------------------------------ 静态数据 */
  var RW_TABS = [
    { key: "collect", label: "资源采集" },
    { key: "entry", label: "资源录入" },
    { key: "process", label: "资源加工" }
  ];

  var METHODS = {
    open: { key: "open", label: "开源数据获取", tag: "rw-tag--open", desc: "从公开材料数据库（Materials Project / C2DB / 2DMatPedia 等）调用开放 API 获取二维材料数据" },
    buy: { key: "buy", label: "数据购买 / 自采数据", tag: "rw-tag--buy", desc: "从已购买授权的商业数据库或自采数据包中导入二维材料数据" },
    calc: { key: "calc", label: "数据计算", tag: "rw-tag--calc", desc: "上传 VASP 计算输入 / 输出文件，由系统校验完整性、合规性并提取结构化数据" }
  };

  /* 开源数据库（含可用数据集） */
  var OPEN_DBS = [
    {
      key: "mp", name: "Materials Project（材料项目数据库）", meta: "开放 API · 官方 v2024.11 数据版本",
      datasets: [
        { name: "二维材料结构数据集", desc: "含晶胞参数、空间群、原子坐标", count: 1280 },
        { name: "电子结构数据集", desc: "含能带结构、态密度、费米能级", count: 960 },
        { name: "力学性质数据集", desc: "含弹性常数、杨氏模量、泊松比", count: 640 }
      ]
    },
    {
      key: "c2db", name: "C2DB（二维材料数据库）", meta: "开放 API · 官方 v3.2 数据版本",
      datasets: [
        { name: "C2DB 结构数据集", desc: "含层状结构与层间厚度", count: 1640 },
        { name: "C2DB 磁学性质数据集", desc: "含磁基态构型、磁转变温度", count: 420 },
        { name: "C2DB 热学性质数据集", desc: "含形成能、声子谱", count: 730 }
      ]
    },
    {
      key: "2dmatpedia", name: "2DMatPedia（二维材料百科）", meta: "开放 API · 官方 v2023.09 数据版本",
      datasets: [
        { name: "2DMatPedia 结构数据集", desc: "含二维材料晶体结构", count: 2100 },
        { name: "2DMatPedia 电学性质数据集", desc: "含铁电性、压电性参数", count: 380 }
      ]
    }
  ];

  /* 已购买 / 自采数据库 */
  var BUY_DBS = [
    { key: "b-c2db", name: "C2DB 商业授权数据包", meta: "已购买 · 授权有效期至 2026-12-31", datasets: [{ name: "C2DB 全量结构数据", desc: "授权范围内全量结构文件", count: 3200 }, { name: "C2DB 光学性质数据", desc: "含介电函数、光吸收系数", count: 560 }] },
    { key: "b-icsd", name: "ICSD 无机晶体结构数据库", meta: "已购买 · 机构订阅", datasets: [{ name: "无机晶体结构数据", desc: "含 CIF 原文件与空间群信息", count: 1480 }, { name: "结构精修数据", desc: "含 Rietveld 精修结果", count: 320 }] },
    { key: "b-2dm", name: "2D Materials 商业数据集", meta: "已购买 · 2026-06 采购", datasets: [{ name: "二维材料缺陷性质数据", desc: "含空位、反位缺陷构型与形成能", count: 640 }] },
    { key: "b-self", name: "课题组自采数据包（MoS2 / WS2）", meta: "自采 · 本地上传", datasets: [{ name: "自采结构数据", desc: "自建 VASP 计算结构文件", count: 260 }, { name: "自采电学性质数据", desc: "自测铁电 / 压电参数", count: 90 }] }
  ];

  /* 计算输出 / 输入文件 */
  var CALC_OUTPUTS = [
    { key: "OUTCAR", desc: "VASP 输出详细信息文件：能量、受力、收敛信息" },
    { key: "DOSCAR", desc: "态密度输出文件：态密度、费米能级" },
    { key: "EIGENVAL", desc: "能带本征值文件：能带结构、带隙" },
    { key: "CONTCAR", desc: "结构输出文件：优化后晶格与原子坐标" }
  ];
  var CALC_INPUTS = ["INCAR", "POSCAR", "POTCAR", "KPOINTS"];
  var CALC_INPUT_DESC = {
    INCAR: "计算控制参数",
    POSCAR: "初始结构文件",
    POTCAR: "赝势文件",
    KPOINTS: "K 点采样设置"
  };

  /* 合规性校验项 */
  var CALC_COMPLIANCE = [
    { key: "functional", name: "交换关联泛函", rule: "PBE / GGA 或更高精度泛函", bad: "检测到 LDA 泛函，与本库标准（PBE/GGA）不一致", fix: "重新计算" },
    { key: "cutoff", name: "平面波截断能", rule: "≥ 400 eV", bad: "截断能为 320 eV，低于标准阈值 400 eV", fix: "重新计算" },
    { key: "kpoints", name: "K 点密度", rule: "≥ 15 Å⁻¹（二维体系）", bad: "K 点密度为 9 Å⁻¹，低于标准阈值 15 Å⁻¹", fix: "低精度入库" },
    { key: "force", name: "力收敛判据", rule: "≤ 0.01 eV/Å", bad: "力收敛判据为 0.05 eV/Å，低于精度要求", fix: "低精度入库" },
    { key: "vacuum", name: "真空层厚度", rule: "≥ 15 Å", bad: "真空层厚度为 12 Å，低于二维材料标准 15 Å", fix: "重新计算" }
  ];

  /* 资源录入 —— 数据录入方式选择（2.2.1） */
  var ENTRY_METHOD_ROWS = [
    ["Materials Project 等公开库", "定制插件批量导入", "文件头含 “Materials Project” 标识", "采集参数配置"],
    ["C2DB 数据库", "定制插件批量导入", "文件头含 “C2DB” 标识", "采集参数配置"],
    ["VASP 自主计算数据", "自动化流程录入", "包含 INCAR+POSCAR+POTCAR+KPOINTS", "参数合规性复核"],
    ["文献提取数据", "手动输入", "无法自动识别", "全文录入"],
    ["用户上传数据", "手动输入 + 自动校验", "文件格式识别", "质量审核"]
  ];

  /* 批量导入录入流程（2.2.2） */
  var ENTRY_BATCH_STEPS = [
    { who: "数据录入员", act: "选择批量导入入口", sys: "显示数据源类型选择界面", check: "选择正确的数据源类型", out: "数据源配置" },
    { who: "数据录入员", act: "上传数据包（ZIP）或配置 API", sys: "解压 / 解析数据包，列出文件清单", check: "文件完整性检查", out: "文件清单" },
    { who: "系统", act: "—", sys: "调用对应解析插件（Materials Project / C2DB / VASP）", check: "按数据源类型匹配解析器", out: "解析后的结构化数据" },
    { who: "系统", act: "—", sys: "按录入规范表（1.2 节）自动映射字段", check: "字段名匹配、类型转换", out: "字段映射结果" },
    { who: "系统", act: "—", sys: "执行自动审核（交叉对比 + 可重复性 + 格式统一）", check: "第 2.2.3 节审核规则", out: "审核状态" },
    { who: "数据录入员", act: "查看并确认批处理结果", sys: "显示成功 / 失败条数及明细", check: "失败条目需人工处理", out: "入库确认" }
  ];

  /* 单条手动录入流程（2.2.3） */
  var ENTRY_MANUAL_STEPS = [
    { who: "数据录入员", act: "选择“新增材料”", sys: "显示二维材料标准录入表单（基于 1.2 节字段定义）", check: "—", out: "空白录入界面" },
    { who: "数据录入员", act: "填写必填字段（化学式、晶系、空间群、带隙等）", sys: "实时校验：化学式元素符号有效性、数值范围", check: "必填项完整性、值域合法性", out: "已填数据" },
    { who: "数据录入员", act: "上传结构文件（CIF / POSCAR）", sys: "解析结构文件，自动填充晶格常数、原子坐标", check: "文件格式合规性", out: "自动填充的字段" },
    { who: "数据录入员", act: "填写计算参数（软件、泛函、截断能等）", sys: "与标准阈值（1.4 节）对比", check: "参数合规性", out: "计算参数记录" },
    { who: "系统", act: "—", sys: "生成唯一标识：2D-数据类型-序号", check: "数据库查询最大序号 +1", out: "材料唯一标识" },
    { who: "数据录入员", act: "提交数据", sys: "进入审核队列", check: "触发第 2.2.4 节审核流程", out: "提交状态" }
  ];

  /* 表单字段验证规则 */
  var ENTRY_RULES = [
    ["化学式", "正则：[A-Z][a-z]?\\d*（可重复）", "“化学式格式不正确，示例：MoS2”"],
    ["带隙", "≥ 0 且 ≤ 10", "“带隙值超出合理范围（0-10 eV）”"],
    ["形成能", "≤ 0（稳定条件）", "“形成能应 ≤ 0，请确认是否为稳定结构”"],
    ["晶格常数", "> 0", "“晶格常数必须为正数”"],
    ["原子坐标", "每个坐标在 0~1 之间（分数坐标）", "“分数坐标应在 0-1 范围内”"]
  ];

  /* 资源加工 —— 流程总览 */
  var PROC_FLOW = [
    { n: "数据策划", d: "明确数据产品目标用途、格式与精度要求" },
    { n: "基础数据筛选", d: "按质量等级与材料类型筛选可用数据集合" },
    { n: "标准化预处理", d: "格式 / 单位统一、缺失值与异常值处理" },
    { n: "数据加工", d: "属性统计、图谱标准化、结构优化验证" },
    { n: "产品生产", d: "AI 训练集、科研参考集、跨库融通集" },
    { n: "质量评价", d: "来源质量、模型质量、产品质量抽样评价" }
  ];

  /* 步骤 1 数据策划 */
  var PROC_S1 = { head: ["活动", "操作人", "输入", "输出", "内容"], rows: [["需求分析", "数据加工工程师", "用户需求 / 项目要求", "数据产品规格文档", "明确数据产品的目标用途、格式、精度要求"]] };
  /* 步骤 2 基础数据筛选 */
  var PROC_S2 = { head: ["活动", "操作人", "系统行为", "筛选条件", "输出"], rows: [
    ["数据筛选", "数据加工工程师", "执行 SQL 查询 + 质量过滤", "质量等级 = A 级 或 B 级", "筛选后的数据集合"],
    ["数据筛选", "数据加工工程师", "按材料类型分组", "按化学式分组，每组至少 3 条", "分组清单"]
  ] };
  /* 步骤 3 标准化预处理 */
  var PROC_S3 = { head: ["子步骤", "操作人", "系统行为", "处理规则", "输出"], rows: [
    ["格式统一", "系统", "自动执行格式转换脚本", "CIF/POSCAR → 标准 CIF", "标准格式文件"],
    ["单位统一", "系统", "自动执行单位换算", "非标准单位 → 标准单位（第 1.4 节单位表）", "带标准单位的数据"],
    ["缺失值", "系统", "标记缺失字段", "缺失率 ≤ 5% 时标注 “N/A”；> 5% 退回", "缺失值报告"],
    ["异常值检测", "系统", "执行异常检测算法", "超出 3σ 范围或物理不合理", "异常值清单"],
    ["异常值修正", "数据加工工程师", "人工复核异常值", "确认修正值或标注保留", "修正记录"]
  ] };
  /* 步骤 4 数据加工模型和算法 */
  var PROC_S4 = { head: ["数据类型", "加工模型 / 算法", "输入", "处理逻辑", "输出"], rows: [
    ["属性数据", "统计计算模型", "原始性质值（带隙、形成能等）", "计算均值、标准差、置信区间", "加工后属性数据"],
    ["图形数据", "图像标准化模型", "原始图谱（能带图、态密度图）", "统一坐标轴、分辨率、标注、格式", "标准化 PNG 图谱"],
    ["结构数据", "结构优化验证模型", "CIF / POSCAR 文件", "校验原子坐标合理性、键长范围", "验证后的结构文件"]
  ] };
  /* 步骤 5 数据处理加工与产品生产 */
  var PROC_S5 = { head: ["数据产品类型", "加工操作", "输出格式", "输出用途"], rows: [
    ["AI 训练数据集", "数据清洗 + 特征工程 + 格式转换", "CSV / JSON + 数据字典", "机器学习模型训练"],
    ["科研参考数据集", "数据整理 + 可视化渲染", "PDF 报告 + JSON", "科研人员查阅"],
    ["跨库融通数据集", "格式转换 + 元数据补全", "JSON（符合 OPTIMADE 格式）", "与主平台融通"]
  ] };
  /* 步骤 6 质量评价 */
  var PROC_S6 = { head: ["评价维度", "评价方法", "合格标准", "不合格处理"], rows: [
    ["数据来源质量", "检查来源可信度分级", "来源为 1 级或 2 级", "标记“来源待验证”"],
    ["加工模型质量", "验证模型输出与输入一致性", "偏差 < 5%", "调整模型参数"],
    ["数据产品质量", "抽样检测（AQL = 1%）", "缺陷率 < 1%", "返工处理"]
  ] };
  /* 版本标记规则 */
  var PROC_VERSION = { head: ["版本阶段", "版本号格式", "标记位置", "说明"], rows: [
    ["原始版", "V0.0", "元数据字段 “data_version”", "采集后的原始数据"],
    ["标准化版", "V1.0", "元数据字段 “data_version”", "完成标准化预处理"],
    ["产品版", "V2.0", "元数据字段 “data_version”", "完成数据产品生产"]
  ] };

  /* ------------------------------------------------------------ 状态容器 */
  function getS() {
    var holder = null;
    try { holder = state; } catch (e) { holder = null; }
    if (!holder) {
      if (!window.__rwFallbackState) window.__rwFallbackState = {};
      holder = window.__rwFallbackState;
    }
    /* 五类材料各用一份状态，互不干扰 */
    if (!holder.lowdimRw) holder.lowdimRw = {};
    var sk = PAGE_ID || "lowdim-ingest-twod";
    if (!holder.lowdimRw[sk]) {
      holder.lowdimRw[sk] = {
        tab: "collect",
        seq: 3,
        tasks: seedTasks(),
        entryDone: [],
        procDone: [],
        create: null,
        focusTaskId: ""
      };
    }
    var s = holder.lowdimRw[sk];
    if (!s.tasks) s.tasks = seedTasks();
    if (!s.entryDone) s.entryDone = [];
    if (!s.procDone) s.procDone = [];
    if (!s.collectTaskId && s.tasks.length) s.collectTaskId = s.tasks[0].id;
    if (!s.collectTaskId) s.collectTaskId = "";
    if (!s.handoffDone) s.handoffDone = [];
    if (!s.approvals) s.approvals = {};
    if (!s.collectTaskView) s.collectTaskView = "trace";
    return s;
  }

  function seedTasks() {
    var cfgTasks = C().tasks;
    var base = cfgTasks ? cfgTasks.map(function (x) { return Object.assign({}, x); }) : (function () {
      var t = materialTypes()[0];
      return [
        {
          id: "2D-CL-2026-0922-001", name: t.name + "（MoS2）电子结构数据采集", method: "open",
          desc: "从 Materials Project 开放 API 采集 MoS2 能带结构与态密度数据", status: "已完成",
          createdAt: "2026-09-22 10:24", source: "Materials Project（材料项目数据库）",
          version: "v2024.11", rawFiles: "JSON / CIF", security: "第1级"
        },
        {
          id: "2D-CL-2026-0923-002", name: t.name + "（WS2）力学性质数据采集", method: "buy",
          desc: "从已购买 C2DB 商业授权数据包导入 WS2 弹性常数与杨氏模量数据", status: "已完成",
          createdAt: "2026-09-23 09:12", source: "C2DB 商业授权数据包",
          version: "v3.2", rawFiles: "JSON", security: "第1级"
        },
        {
          id: "2D-CL-2026-0923-003", name: "二维磁性材料（CrI3）态密度数据计算", method: "calc",
          desc: "基于 VASP 计算输出文件提取结构信息、能带数据与态密度", status: "待确认",
          createdAt: "2026-09-23 16:48", source: "本地计算输出（OUTCAR / DOSCAR）",
          version: "V0.0", rawFiles: "JSON", security: "第2级"
        }
      ];
    })();
    return collectSeedTasks(base);
  }

  /* ------------------------------------------------------------------------
     2026-10-08：演示用样例数据——「采集任务执行记录」补足到 6 条，
     覆盖 已完成 / 待确认 / 采集失败 / 格式异常 四类状态与三种采集方式，
     字段与「创建采集任务」三步向导落库结构保持一致（数据来源 / 入库名称 / 数据整合报告 / 审核状态）。
     ------------------------------------------------------------------------ */
  function collectSeedTasks(base) {
    var out = base.slice();
    var code = C().code || "2D";
    var short = C().short || "材料";
    var ds = C().datasets || [];
    var EXTRA = [
      {
        method: "calc", status: "采集失败", security: "第2级",
        name: short + "高通量计算数据采集（第 2 批）",
        desc: "批量提交第一性原理计算任务，API 限流导致拉取中断，已自动重试 2 次",
        source: "本地计算输出（OUTCAR / DOSCAR）", sourceType: "计算数据",
        obtainWay: "API", dataType: "非结构化", collectObject: "图",
        version: "V0.0", rawFiles: "OUTCAR / DOSCAR",
        updateFreq: "每周", updateMode: "自动",
        report: "图像校验规则 6/6 通过（分辨率 / 格式 / 色彩模式 / 尺寸 / 清晰度 / 水印）· 命名统一",
        auditStatus: "审核驳回", auditOpinion: "本批次缺失关键计算参数说明，退回补充计算方法与参数后重新提交。"
      },
      {
        method: "open", status: "格式异常", security: "第1级",
        name: short + "开放库文献数据采集",
        desc: "采集文献报道数据，部分记录字段缺失（缺失率 8.4%），已进入异常处理队列",
        source: "文献数据库（开放 API）", sourceType: "文献采集",
        obtainWay: "API", dataType: "结构化", collectObject: "表",
        version: "v2026.09", rawFiles: "JSON / CSV",
        updateFreq: "每月", updateMode: "手动",
        report: "表字段规则校验 5/6 通过 · 1 项单位未统一（待人工复核）",
        auditStatus: "待审核", auditOpinion: ""
      },
      {
        method: "buy", status: "已完成", security: "第1级",
        name: short + "商业库定期同步任务",
        desc: "按更新周期自动同步已购数据包，同步完成后推送至数据整合环节",
        source: "已购商业数据库（定期同步）", sourceType: "商业购买数据库",
        obtainWay: "数据库", dataType: "结构化", collectObject: "表",
        version: "v3.2", rawFiles: "JSON / CSV",
        updateFreq: "每季度", updateMode: "自动",
        report: "表字段规则校验 6/6 通过 · 增量去重完成",
        auditStatus: "审核通过", auditOpinion: "数据来源合规、整合校验全部通过，同意入库。"
      }
    ];
    var daySeq = ["2026-09-24 09:35", "2026-09-25 14:02", "2026-09-26 17:20", "2026-09-27 10:08", "2026-09-28 15:44"];
    var n = out.length;
    EXTRA.forEach(function (x, i) {
      if (n >= 6) return;
      var idx = n + 1;
      var d = ds.length ? ds[(idx - 1) % ds.length] : null;
      out.push({
        id: code + "-CL-2026-09" + (23 + idx) + "-00" + idx,
        name: x.name + (d ? "（" + d.title.replace("数据集", "") + "）" : ""),
        method: x.method,
        desc: x.desc,
        status: x.status,
        createdAt: daySeq[(idx - 4 + daySeq.length) % daySeq.length] || daySeq[0],
        source: x.source,
        sourceType: x.sourceType,
        obtainWay: x.obtainWay,
        dataType: x.dataType,
        collectObject: x.collectObject,
        dbName: (d ? short + d.title : short + "数据集") + "（V2.0）",
        integrationReport: x.report,
        updateFreq: x.updateFreq,
        updateMode: x.updateMode,
        version: x.version,
        rawFiles: x.rawFiles,
        security: x.security,
        audit: {
          status: x.auditStatus,
          result: x.auditStatus === "审核通过" ? "通过" : (x.auditStatus === "审核驳回" ? "不通过" : ""),
          opinion: x.auditOpinion,
          at: x.auditOpinion ? daySeq[(idx - 4 + daySeq.length) % daySeq.length] : "",
          by: x.auditOpinion ? "管理员9527" : ""
        }
      });
      n += 1;
    });
    return out;
  }

  function methodMeta(key) { return METHODS[key] || METHODS.open; }

  function tagFor(status) {
    var map = { "已完成": "rw-tag--done", "待确认": "rw-tag--run", "采集失败": "rw-tag--fail", "格式异常": "rw-tag--warn", "待处理": "rw-tag--warn" };
    return map[status] || "rw-tag--gray";
  }

  /* ------------------------------------------------------------ 公共片段 */
  function tableHtml(def, extraClass) {
    return '<div class="rw-tbl-wrap"><table class="rw-tbl ' + (extraClass || "") + '"><thead><tr>'
      + def.head.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("")
      + '</tr></thead><tbody>'
      + def.rows.map(function (r) {
        return "<tr>" + r.map(function (c, i) {
          return '<td class="' + (i === 0 ? "rw-nowrap" : "") + '">' + esc(c) + "</td>";
        }).join("") + "</tr>";
      }).join("")
      + "</tbody></table></div>";
  }

  function chainHtml(items) {
    return '<div class="rw-chain">' + items.map(function (it, i) {
      var cls = typeof it === "string" ? "" : (" " + (it.cls || ""));
      var text = typeof it === "string" ? it : it.text;
      return '<span class="rw-chain-item' + cls + '">' + esc(text) + "</span>"
        + (i < items.length - 1 ? '<span class="rw-chain-sep">→</span>' : "");
    }).join("") + "</div>";
  }

  function stepsHtml(steps) {
    return '<div class="rw-steps">' + steps.map(function (s, i) {
      return '<div class="rw-step-row"><div class="rw-step-idx">' + (i + 1) + "</div><div>"
        + '<div><b style="font-size:14px;color:#22364f">' + esc(s.act) + '</b><span class="rw-step-who">' + esc(s.who) + "</span></div>"
        + '<div class="rw-step-grid">'
        + '<div><b>系统行为</b>' + esc(s.sys) + "</div>"
        + '<div><b>校验点</b>' + esc(s.check) + "</div>"
        + '<div><b>输出</b>' + esc(s.out) + "</div>"
        + "</div></div></div>";
    }).join("") + "</div>";
  }

  /* ------------------------------------------------------------ 页面渲染 */
  function renderRwPage(force) {
    ensureStyle();
    var page = document.getElementById("page-" + PAGE_ID);
    if (!page) return;
    var s = getS();
    var tabs = RW_TABS.map(function (t) {
      var eSt = entryState();
      var pSt = procState();
      var count = t.key === "collect" ? s.tasks.length
        : t.key === "entry" ? (pendingEntryCount() + eSt.records.filter(function (r) { return r.status !== "已入库" && r.status !== "已退回"; }).length)
          : pSt.jobs.length;
      return '<button type="button" class="rw-tab' + (s.tab === t.key ? " is-active" : "") + '" data-rw-act="tab" data-rw-tab="' + t.key + '">'
        + esc(t.label) + '<span class="rw-tab-count">' + count + "</span></button>";
    }).join("");

    page.innerHTML = '<div class="rw-page" data-rw-root="page">'
      + '<div class="rw-head">'
      + '<div class="rw-head-main"><h1>' + esc(C().title) + "</h1>"
      + "<p>" + C().headDesc + "</p></div>"
      + '<div class="rw-head-actions">'
      /* 清单编号 10「数据安全等级」只挂在二维材料名下，其余四类不出现该入口 */
      + (hasSecurity() ? '<button class="rw-btn" type="button" data-twod-security-guide>数据安全等级</button>' : "")
      + "</div></div>"
      + '<nav class="rw-tabs">' + tabs + "</nav>"
      + '<div class="rw-body">' + renderRwBody() + "</div>"
      + "</div>";
    if (force) syncModal();
  }

  function renderRwBody() {
    var s = getS();
    if (s.auditOpen) return renderAuditPage();
    if (s.tab === "entry") return renderEntryTab();
    if (s.tab === "process") return renderProcessTab();
    return renderCollectTab();
  }

  function rerenderBody() {
    var host = document.querySelector('[data-rw-root="page"] .rw-body');
    if (!host) { renderRwPage(); return; }
    host.innerHTML = renderRwBody();
    var tabs = document.querySelectorAll('[data-rw-root="page"] .rw-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle("is-active", tabs[i].getAttribute("data-rw-tab") === getS().tab);
    }
  }

  /* -------------------------------------------------------- 页签一：资源采集 */
  function renderCollectTab() {
    var s = getS();
    if (!s.tasks.length) {
      return '<div class="rw-card">'
        + '<div class="rw-card-head"><div><h3>采集任务执行记录</h3>'
        + "<p>暂无采集任务，点击「创建任务」三步完成：数据获取 → 数据整合 → 数据更新。</p></div>"
        + '<div style="display:flex;gap:10px;flex:0 0 auto">'
        + '<button class="rw-btn rw-btn--primary" type="button" data-rw-act="open-create">＋ 创建任务</button>'
        + '<button class="rw-btn rw-btn--blue" type="button" data-rw-act="open-audit">数据采集审核</button></div></div>'
        + '<div class="rw-empty"><b>▤</b>暂无采集任务</div></div>';
    }
    return collectClosureCards();
  }

  function pendingEntryCount() {
    return getS().tasks.filter(function (t) { return getS().entryDone.indexOf(t.id) < 0; }).length;
  }
  function pendingProcCount() {
    return getS().entryDone.filter(function (id) { return getS().procDone.indexOf(id) < 0; }).length;
  }

  /* ------------------------------------ 页签二：资源录入 —— 规范说明（可折叠参考） */
  function renderEntrySpec() {
    var s = getS();
    var focus = s.focusTaskId ? s.tasks.filter(function (t) { return t.id === s.focusTaskId; })[0] : null;
    var pending = s.tasks.filter(function (t) { return s.entryDone.indexOf(t.id) < 0; });

    var methodRows = ENTRY_METHOD_ROWS.map(function (r) {
      return "<tr>" + r.map(function (c, i) { return '<td class="' + (i === 0 ? "rw-nowrap" : "") + '">' + esc(c) + "</td>"; }).join("") + "</tr>";
    }).join("");

    var pendingRows = pending.length
      ? pending.map(function (t) {
        var m = methodMeta(t.method);
        return "<tr>"
          + '<td class="rw-id">' + esc(t.id) + "</td>"
          + "<td><b>" + esc(t.name) + "</b></td>"
          + '<td><span class="rw-tag ' + m.tag + '">' + esc(m.label) + "</span></td>"
          + '<td><span class="rw-tag ' + tagFor(t.status) + '">' + esc(t.status) + "</span></td>"
          + "<td>" + esc(t.rawFiles) + "</td>"
          + '<td class="rw-nowrap">'
          + '<button class="rw-op" type="button" data-rw-act="entry-confirm" data-id="' + esc(t.id) + '">确认录入</button>'
          + '<button class="rw-op" type="button" data-rw-act="view-task" data-id="' + esc(t.id) + '">查看</button>'
          + "</td></tr>";
      }).join("")
      : '<tr><td colspan="6"><div class="rw-empty" style="padding:26px 0">已采集数据已全部确认录入</div></td></tr>';

    var doneRows = s.entryDone.length
      ? s.entryDone.map(function (id) {
        var t = s.tasks.filter(function (x) { return x.id === id; })[0] || {};
        return "<tr>"
          + '<td class="rw-id">' + esc(id) + "</td>"
          + "<td>" + esc(t.name || "-") + "</td>"
          + '<td><span class="rw-tag rw-tag--done">已录入</span></td>'
          + "<td>" + esc(t.rawFiles || "JSON") + "</td>"
          + "<td>" + esc(nowText()) + "</td>"
          + "</tr>";
      }).join("")
      : '<tr><td colspan="5"><div class="rw-empty" style="padding:22px 0">暂无已录入数据</div></td></tr>';

    return (focus
      ? '<div class="rw-banner"><span>▸</span><div>当前从采集任务 <b>' + esc(focus.id) + " · " + esc(focus.name) + "</b> 进入录入环节，请在下方「待录入数据列表」中确认录入。</div></div>"
      : "")
      + '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>数据录入方式选择（2.2.1）</h3><p>按数据来源自动匹配推荐录入方式，并给出系统自动识别规则与人工介入点。</p></div></div>'
      + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>数据来源</th><th>推荐录入方式</th><th>系统自动识别规则</th><th>人工介入点</th></tr></thead><tbody>' + methodRows + "</tbody></table></div>"
      + "</div>"

      + '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>批量导入录入流程（定制插件 / 自动化流程）</h3><p>适用于 Materials Project / C2DB / VASP 等可批量获取的数据源，共 6 个操作步骤。</p></div></div>'
      + stepsHtml(ENTRY_BATCH_STEPS)
      + '<div style="margin-top:16px"><div class="rw-section-title">状态流转</div>'
      + chainHtml([
        "待处理", "解析中", "字段映射中", "审核中",
        { text: "通过 / 部分失败 / 全部失败", cls: "is-fork" },
        { text: "管理员人工复核", cls: "is-fork" },
        { text: "入库", cls: "is-end" }
      ])
      + "</div></div>"

      + '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>单条手动录入流程（2.2.3）</h3><p>适用于文献提取数据与用户上传数据，共 6 个操作步骤，系统实时校验字段。</p></div></div>'
      + stepsHtml(ENTRY_MANUAL_STEPS)
      + "</div>"

      + '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>表单字段验证规则（前端实时校验）</h3><p>字段不合规时即时给出错误提示，阻断提交。</p></div></div>'
      + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>字段</th><th>验证规则</th><th>错误提示</th></tr></thead><tbody>'
      + ENTRY_RULES.map(function (r) {
        return "<tr><td class=\"rw-nowrap\">" + esc(r[0]) + "</td><td>" + esc(r[1]) + '</td><td style="color:#d03050">' + esc(r[2]) + "</td></tr>";
      }).join("")
      + "</tbody></table></div></div>"

      + '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>数据录入审核流程（2.2.4）</h3><p>一次审批：提交 → 自动校验 → 管理员审核 → 入库 / 退回。</p></div></div>'
      + chainHtml([
        "提交", { text: "自动校验", cls: "" }, { text: "管理员审核", cls: "" },
        { text: "入库", cls: "is-end" }, { text: "退回", cls: "is-back" }
      ])
      + "</div>"

      + '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>待录入数据列表</h3><p>资源采集完成后进入录入环节，确认无误后点击「确认录入」提交保存到已录入列表。</p></div></div>'
      + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>采集ID</th><th>采集任务名称</th><th>采集方式</th><th>采集状态</th><th>原始文件</th><th>操作</th></tr></thead><tbody>' + pendingRows + "</tbody></table></div>"
      + "</div>"

      + '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>已录入数据列表</h3><p>确认录入后的数据，可继续进入资源加工环节。</p></div>'
      + '<div><button class="rw-btn" type="button" data-rw-act="tab" data-rw-tab="process">进入资源加工 →</button></div></div>'
      + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>采集ID</th><th>采集任务名称</th><th>状态</th><th>数据格式</th><th>确认录入时间</th></tr></thead><tbody>' + doneRows + "</tbody></table></div>"
      + "</div>"
      + entryClosureCards("spec");
  }

  /* ------------------------------------ 页签三：资源加工 —— 规范说明（可折叠参考） */
  function renderProcessSpec() {
    var s = getS();
    var ready = s.tasks.filter(function (t) { return s.entryDone.indexOf(t.id) >= 0; });
    var rows = ready.length
      ? ready.map(function (t) {
        var done = s.procDone.indexOf(t.id) >= 0;
        return "<tr>"
          + '<td class="rw-id">' + esc(t.id) + "</td>"
          + "<td><b>" + esc(t.name) + "</b></td>"
          + "<td>V0.0 → V1.0 → V2.0</td>"
          + '<td><span class="rw-tag ' + (done ? "rw-tag--done" : "rw-tag--run") + '">' + (done ? "已加工（V2.0）" : "待加工（V0.0）") + "</span></td>"
          + "<td>" + esc(done ? nowText() : "-") + "</td>"
          + '<td class="rw-nowrap">'
          + (done
            ? '<button class="rw-op" type="button" data-rw-act="view-task" data-id="' + esc(t.id) + '">查看</button>'
            : '<button class="rw-op" type="button" data-rw-act="proc-confirm" data-id="' + esc(t.id) + '">确认加工</button>')
          + "</td></tr>";
      }).join("")
      : '<tr><td colspan="6"><div class="rw-empty" style="padding:26px 0">暂无已录入数据，请先在「资源录入」页签确认录入</div></td></tr>';

    var flow = PROC_FLOW.map(function (f, i) {
      return '<div class="rw-flow-node" data-rw-act="flow-jump" data-rw-step="' + i + '">'
        + '<span class="rw-flow-idx">' + (i + 1) + "</span>"
        + '<span class="rw-flow-name">' + esc(f.n) + "</span>"
        + '<span class="rw-flow-desc">' + esc(f.d) + "</span>"
        + "</div>" + (i < PROC_FLOW.length - 1 ? '<div class="rw-flow-arrow">→</div>' : "");
    }).join("");

    function stepCard(idx, title, def, note) {
      return '<div class="rw-card" data-rw-proc-card="' + idx + '">'
        + '<div class="rw-card-head"><div><h3>步骤 ' + idx + "：" + esc(title) + "</h3><p>" + esc(note) + "</p></div></div>"
        + tableHtml(def) + "</div>";
    }

    return '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>加工流程总览</h3><p>数据策划 → 基础数据筛选 → 标准化预处理 → 数据加工 → 产品生产 → 质量评价，点击步骤可快速定位到下方详解。</p></div></div>'
      + '<div class="rw-flow">' + flow + "</div>"
      + "</div>"

      + stepCard(1, "数据策划", PROC_S1, "明确数据产品的目标用途、格式与精度要求。")
      + stepCard(2, "基础数据筛选", PROC_S2, "执行 SQL 查询 + 质量过滤，并按材料类型分组。")
      + stepCard(3, "标准化预处理", PROC_S3, "格式统一 / 单位统一 / 缺失值处理 / 异常值检测与修正。")
      + stepCard(4, "数据加工模型和算法", PROC_S4, "按属性数据、图形数据、结构数据分别选用加工模型。")
      + stepCard(5, "数据处理加工与产品生产", PROC_S5, "产出 AI 训练数据集、科研参考数据集与跨库融通数据集。")
      + stepCard(6, "质量评价", PROC_S6, "从数据来源、加工模型、数据产品三个维度评价，不合格数据分级处理。")

      + '<div class="rw-card"><div class="rw-card-head"><div><h3>版本标记规则（2.3.3）</h3><p>每次加工阶段完成后更新元数据字段 data_version。</p></div></div>'
      + tableHtml(PROC_VERSION) + "</div>"

      + '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>加工数据列表</h3><p>已录入数据进入加工队列，确认加工后按 V0.0 → V1.0 → V2.0 版本推进。</p></div></div>'
      + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>采集ID</th><th>采集任务名称</th><th>版本路径</th><th>加工状态</th><th>完成时间</th><th>操作</th></tr></thead><tbody>' + rows + "</tbody></table></div>"
      + "</div>";
  }

  /* ------------------------------------------------------------ Toast */
  function toast(msg, kind) {
    try { (window.__rwToastLog = window.__rwToastLog || []).push({ msg: msg, kind: kind || "" }); } catch (e) { /* ignore */ }
    var old = document.getElementById("rwToast");
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var el = document.createElement("div");
    el.className = "rw-toast" + (kind ? " is-" + kind : "");
    el.id = "rwToast";
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 2600);
  }

  /* ------------------------------------------------ 创建任务：状态与弹窗骨架 */
  function nextTaskId() {
    var s = getS();
    s.seq += 1;
    return C().code + "-CL-" + stamp().slice(0, 4) + "-" + stamp().slice(4, 6) + "-" + stamp().slice(6, 8) + "-" + ("00" + s.seq).slice(-3);
  }

  function openCreate() {
    var s = getS();
    /* 2026-10-08 重做：创建采集任务三步向导 —— 数据获取 → 数据整合 → 数据更新 */
    s.create = {
      step: 1,
      id: nextTaskId(),
      name: "",
      obtainWay: "API",
      sourceType: "文献采集",
      desc: "",
      dataType: "结构化",
      collectObject: "表",
      updateFreq: "每周",
      updateMode: "手动",
      error: ""
    };
    renderCreateModal();
  }

  function closeCreate() {
    var m = document.getElementById("rwMask");
    if (m && m.parentNode) m.parentNode.removeChild(m);
    var c = document.getElementById("rwFlowMask");
    if (c && c.parentNode) c.parentNode.removeChild(c);
    var s = getS();
    s.create = null;
    s.auditId = "";
  }

  function renderCreateModal() {
    ensureStyle();
    var s = getS();
    var c = s.create;
    if (!c) return;
    var mask = document.getElementById("rwMask");
    if (!mask) {
      mask = document.createElement("div");
      mask.className = "rw-mask";
      mask.id = "rwMask";
      mask.setAttribute("data-rw-root", "modal");
      mask.addEventListener("click", function (e) { if (e.target === mask) closeCreate(); });
      document.body.appendChild(mask);
    }
    mask.innerHTML = renderCreateInner(c);
    afterModalRender();
  }

  function createStepbar(step) {
    var labels = ["数据获取", "数据整合", "数据更新"];
    return '<div class="rw-stepbar">' + labels.map(function (l, i) {
      var cls = step === i + 1 ? "is-active" : (step > i + 1 ? "is-done" : "");
      return '<div class="rw-stepbar-item ' + cls + '"><span class="dot">' + (step > i + 1 ? "✓" : i + 1) + "</span>" + esc(l) + "</div>"
        + (i < labels.length - 1 ? '<div class="rw-stepbar-line"></div>' : "");
    }).join("") + "</div>";
  }

  function renderCreateInner(c) {
    var body = c.step === 1 ? renderCreateStep1(c) : (c.step === 2 ? renderCreateStep2(c) : renderCreateStep3(c));
    var foot = renderCreateFoot(c);
    return '<div class="rw-modal" role="dialog" aria-modal="true">'
      + '<div class="rw-modal-head">'
      + '<div><h3>创建采集任务</h3><p>分三步完成任务创建：数据获取 → 数据整合 → 数据更新；提交后进入数据采集审核。</p></div>'
      + '<div class="rw-modal-head-side">'
      + '<button class="rw-btn rw-btn--blue" type="button" data-rw-act="intro">数据资源对象介绍</button>'
      + '<button class="rw-modal-close" type="button" data-rw-act="close-create" aria-label="关闭">×</button>'
      + "</div></div>"
      + createStepbar(c.step)
      + '<div class="rw-modal-body">' + body + "</div>"
      + foot
      + "</div>";
  }

  function renderCreateFoot(c) {
    var error = c.error ? '<span class="rw-foot-tip" style="color:#d03050">' + esc(c.error) + "</span>" : "";
    if (c.step === 1) {
      return '<div class="rw-modal-foot">' + error
        + '<button class="rw-btn" type="button" data-rw-act="close-create">取消</button>'
        + '<button class="rw-btn rw-btn--primary" type="button" data-rw-act="next">下一步</button></div>';
    }
    if (c.step === 2) {
      return '<div class="rw-modal-foot">' + error
        + '<button class="rw-btn" type="button" data-rw-act="prev">上一步</button>'
        + '<button class="rw-btn rw-btn--primary" type="button" data-rw-act="next">下一步</button></div>';
    }
    return '<div class="rw-modal-foot">'
      + '<span class="rw-foot-tip">确认无误后点击「确认提交」，任务将进入数据采集审核。</span>'
      + '<button class="rw-btn" type="button" data-rw-act="prev">上一步</button>'
      + '<button class="rw-btn rw-btn--primary" type="button" data-rw-act="submit-task">确认提交</button></div>';
  }

  /* ------------------------------------------------ 整合规则（表字段 / 图像校验） */
  var TABLE_RULES = [
    ["晶格常数", "数值", "保留小数点后 7 位，单位 Å，须为正数", "通过"],
    ["化学式", "字符", "元素符号按国际通行规范书写，原子个数归一化", "通过"],
    ["空间群", "枚举", "国际编号 1–230，须与对称性数据一致", "通过"],
    ["带隙", "数值", "单位 eV，保留小数点后 4 位，取值 ≥ 0", "通过"],
    ["形成能", "数值", "单位 eV/atom，保留小数点后 6 位", "通过"],
    ["原子坐标", "数组", "分数坐标取值 0 ≤ x < 1，原子数与化学式一致", "通过"]
  ];
  var IMAGE_RULES = [
    ["分辨率", "≥ 300 dpi，低于阈值判定为不合规图像", "通过"],
    ["图像格式", "PNG / JPG / BMP，禁止截图二次压缩件", "通过"],
    ["色彩模式", "RGB 或灰度，位深 ≥ 8 bit", "通过"],
    ["图像尺寸", "长与宽均 ≥ 512 px，宽高比无拉伸变形", "通过"],
    ["清晰度", "拉普拉斯方差 ≥ 100，无模糊失焦", "通过"],
    ["水印与标注", "无水印、无人工标注框，坐标轴与图例完整", "通过"]
  ];

  function rulesTable(rules, withType) {
    var head = withType
      ? "<tr><th>字段名称</th><th>数据类型</th><th>校验规则</th><th>校验结果</th></tr>"
      : "<tr><th>校验项</th><th>校验规则</th><th>校验结果</th></tr>";
    var rows = rules.map(function (r) {
      return "<tr><td><b>" + esc(r[0]) + "</b></td>"
        + (withType ? "<td>" + esc(r[1]) + "</td>" : "")
        + "<td>" + esc(r[withType ? 2 : 1]) + "</td>"
        + '<td><span class="rw-tag rw-tag--done">' + esc(r[withType ? 3 : 2]) + "</span></td></tr>";
    }).join("");
    return '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead>' + head + "</thead><tbody>" + rows + "</tbody></table></div>";
  }

  /* ------------------------------------------------------------ 步骤 1：数据获取 */
  function renderCreateStep1(c) {
    function opt(list, cur) {
      return list.map(function (o) { return '<option value="' + esc(o) + '"' + (cur === o ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("");
    }
    return '<div class="rw-section-title">第一步 · 数据获取</div>'
      + '<div class="rw-form">'
      + '<div class="rw-field"><label>采集 ID（系统自动编码）</label>'
      + '<input type="text" readonly value="' + esc(c.id) + '">'
      + '<span class="rw-field-tip">编码规则：材料代码-CL-年-月-日-三位序号，创建时自动生成，不可修改。</span></div>'
      + '<div class="rw-field"><label>数据获取方式<i>*</i></label>'
      + '<select data-rw-f="obtainWay">' + opt(["API", "数据库"], c.obtainWay) + "</select>"
      + '<span class="rw-field-tip">API：通过接口实时拉取；数据库：直连数据库抽取。</span></div>'
      + '<div class="rw-field"><label>数据来源<i>*</i></label>'
      + '<select data-rw-f="sourceType">' + opt(["文献采集", "开源数据库", "计算数据", "商业购买数据库"], c.sourceType) + "</select>"
      + '<span class="rw-field-tip">选择本次采集任务的数据来源渠道。</span></div>'
      + '<div class="rw-field"><label>数据类型<i>*</i></label>'
      + '<select data-rw-f="dataType">' + opt(["结构化", "非结构化"], c.dataType) + "</select>"
      + '<span class="rw-field-tip">结构化：表格 / 数值类数据；非结构化：图像 / 文档类数据。</span></div>'
      + '<div class="rw-field is-full"><label>入库名称<i>*</i></label>'
      + '<input type="text" data-rw-f="name" maxlength="60" placeholder="请输入入库名称" value="' + esc(c.name) + '">'
      + '<span class="rw-field-tip">入库名称将展示在采集任务执行记录与数据库目录中。</span></div>'
      + '<div class="rw-field is-full"><label>数据来源描述</label>'
      + '<textarea data-rw-f="desc" placeholder="请输入数据来源描述，例如来源数据库 / 文献范围 / 计算工况与数据规模…">' + esc(c.desc) + "</textarea>"
      + '<span class="rw-field-tip">数据来源描述将随采集任务归档，供数据采集审核与追溯使用。</span></div>'
      + "</div>";
  }

  /* ------------------------------------------------------------ 步骤 2：数据整合 */
  function renderCreateStep2(c) {
    var isTable = c.collectObject !== "图";
    return '<div class="rw-section-title">第二步 · 数据整合</div>'
      + '<div class="rw-card-note">数据整合配置：选择数据采集对象后，系统按对应规则对采集数据进行自动校验与格式统一。</div>'
      + '<div class="rw-form">'
      + '<div class="rw-field"><label>数据采集对象<i>*</i></label>'
      + '<select data-rw-f="collectObject">'
      + '<option value="表"' + (isTable ? " selected" : "") + ">表（结构化数据字段校验）</option>"
      + '<option value="图"' + (isTable ? "" : " selected") + ">图（图像数据校验）</option>"
      + "</select>"
      + '<span class="rw-field-tip">选择「表」按表字段规则逐字段校验；选择「图」按图像校验规则逐项校验。</span></div>'
      + "</div>"
      + '<div class="rw-section-title" style="margin-top:14px">' + (isTable ? "表字段规则校验" : "图像校验规则") + "</div>"
      + rulesTable(isTable ? TABLE_RULES : IMAGE_RULES, isTable)
      + '<div class="rw-banner" style="margin-top:14px"><span>✓</span><div>'
      + (isTable
        ? "已按表字段规则完成预校验：全部字段校验通过，其中<b>晶格常数</b>保留小数点后 7 位；校验不通过的字段将转入待处理队列，不会直接入库。"
        : "已按图像校验规则完成预校验：全部校验项通过；不合规图像将转入待处理队列，不会直接入库。")
      + "</div></div>";
  }

  /* ---------- 采集参数（材料类型 + 性质范围） ---------- */
  function renderParamsPanel(c) {
    var types = materialTypes();
    var fields = (types.filter(function (t) { return t.name === c.params.materialType; })[0] || types[0]).fields || [];
    var rows = c.params.ranges.map(function (r, i) {
      return '<div class="rw-range-row" style="margin-bottom:8px">'
        + '<select data-rw-f="range" data-row="' + i + '" data-col="property">'
        + fields.map(function (f) { return '<option' + (r.property === f ? " selected" : "") + ">" + esc(f) + "</option>"; }).join("")
        + "</select>"
        + '<input type="text" data-rw-f="range" data-row="' + i + '" data-col="min" placeholder="最小值" value="' + esc(r.min) + '">'
        + '<input type="text" data-rw-f="range" data-row="' + i + '" data-col="max" placeholder="最大值" value="' + esc(r.max) + '">'
        + '<input type="text" data-rw-f="range" data-row="' + i + '" data-col="unit" placeholder="单位" value="' + esc(r.unit) + '">'
        + '<button class="rw-btn rw-btn--sm" type="button" data-rw-act="range-del" data-row="' + i + '">删除</button>'
        + "</div>";
    }).join("");

    return '<div class="rw-params"><div class="rw-params-title">⚒ 设置采集参数</div>'
      + '<div class="rw-form">'
      + '<div class="rw-field is-full"><label>材料类型<i>*</i></label>'
      + '<select data-rw-f="materialType">'
      + types.map(function (t) { return '<option value="' + esc(t.name) + '"' + (c.params.materialType === t.name ? " selected" : "") + ">" + esc(t.name) + "（" + esc(t.abbr) + "）</option>"; }).join("")
      + "</select>"
      + '<span class="rw-field-tip">' + esc(C().typeTip) + '</span></div>'
      + "</div>"
      + '<div style="margin-top:12px"><div class="rw-section-title">性质范围（输入取值范围）</div>'
      + rows
      + '<button class="rw-btn rw-btn--sm rw-btn--ghost" type="button" data-rw-act="range-add">＋ 添加性质范围</button>'
      + '<div class="rw-field-tip" style="margin-top:8px">取值范围用于采集过滤：仅保留落入范围内（含边界）的数据记录，留空表示不限制。</div>'
      + "</div></div>";
  }

  /* ---------- 面板 A：开源数据获取 ---------- */
  function renderOpenPanel(c) {
    return '<div class="rw-section-title">选择目标数据库（含可用数据集）</div>'
      + renderDbList(OPEN_DBS, c)
      + renderPickResult(OPEN_DBS, c)
      + '<div style="margin-top:16px">' + renderParamsPanel(c) + "</div>";
  }

  /* ---------- 面板 B：数据购买 / 自采数据 ---------- */
  function renderBuyPanel(c) {
    return '<div class="rw-section-title">已购买 / 自采数据库列表</div>'
      + '<div class="rw-card-note">' + esc(C().buyNote) + '</div>'
      + renderDbList(BUY_DBS, c)
      + renderPickResult(BUY_DBS, c)
      + '<div style="margin-top:16px">' + renderParamsPanel(c) + "</div>";
  }

  function renderDbList(list, c) {
    return '<div class="rw-db-list">' + list.map(function (db) {
      var picked = db.datasets.filter(function (d, i) { return c.dbPick[db.key + "::" + i]; }).length;
      var all = picked === db.datasets.length && picked > 0;
      return '<div class="rw-db' + (picked ? " is-on" : "") + '">'
        + '<div class="rw-db-top">'
        + '<input type="checkbox" data-rw-f="dbAll" data-db="' + db.key + '"' + (all ? " checked" : "") + '>'
        + '<span class="rw-db-name">' + esc(db.name) + "</span>"
        + '<span class="rw-db-meta">' + esc(db.meta) + "</span>"
        + '<span class="rw-db-right"><span class="rw-tag ' + (picked ? "rw-tag--open" : "rw-tag--gray") + '">' + (picked ? "已选 " + picked + " 个数据集" : "未选择") + "</span></span>"
        + "</div>"
        + '<div class="rw-ds-list">' + db.datasets.map(function (d, i) {
          var on = !!c.dbPick[db.key + "::" + i];
          return '<label class="rw-ds' + (on ? " is-on" : "") + '">'
            + '<input type="checkbox" data-rw-f="ds" data-db="' + db.key + '" data-ds="' + i + '"' + (on ? " checked" : "") + ">"
            + "<div><div class=\"rw-ds-name\">" + esc(d.name) + '</div><div class="rw-ds-desc">' + esc(d.desc) + "</div></div>"
            + '<span class="rw-ds-count">约 ' + d.count + " 条</span></label>";
        }).join("") + "</div></div>";
    }).join("") + "</div>";
  }

  function pickedList(list, c) {
    var out = [];
    list.forEach(function (db) {
      db.datasets.forEach(function (d, i) {
        if (c.dbPick[db.key + "::" + i]) out.push({ dbKey: db.key, dbName: db.name, dsName: d.name, count: d.count });
      });
    });
    return out;
  }

  function renderPickResult(list, c) {
    var picks = pickedList(list, c);
    if (!picks.length) {
      return '<div class="rw-pick-result"><div class="rw-pick-result-head"><span>勾选结果</span><span>尚未勾选任何数据集</span></div>'
        + '<div class="rw-empty" style="padding:24px 0">勾选上方数据库或数据集后，此处将展示本次采集的数据集清单</div></div>';
    }
    return '<div class="rw-pick-result"><div class="rw-pick-result-head"><span>勾选结果（共 ' + picks.length + " 个数据集）</span>"
      + '<span>预计采集约 ' + picks.reduce(function (a, b) { return a + b.count; }, 0) + " 条记录</span></div>"
      + '<table class="rw-tbl"><thead><tr><th>源数据库</th><th>数据集</th><th>预计记录数</th><th>操作</th></tr></thead><tbody>'
      + picks.map(function (p, i) {
        return "<tr><td>" + esc(p.dbName) + "</td><td>" + esc(p.dsName) + "</td><td>" + p.count + " 条</td>"
          + '<td class="rw-nowrap"><button class="rw-op rw-op--danger" type="button" data-rw-act="pick-del" data-db="' + esc(p.dbKey) + '" data-name="' + esc(p.dsName) + '">移除</button></td></tr>';
      }).join("")
      + "</tbody></table></div>";
  }

  /* ---------- 面板 C：数据计算 ---------- */
  function renderCalcPanel(c) {
    var outs = CALC_OUTPUTS.map(function (o) {
      var on = c.calc.out === o.key;
      return '<label class="rw-calc-out' + (on ? " is-on" : "") + '">'
        + '<input type="radio" name="rwCalcOut" data-rw-f="calcOut" value="' + o.key + '"' + (on ? " checked" : "") + ">"
        + "<b>" + esc(o.key) + "</b><span>" + esc(o.desc) + "</span></label>";
    }).join("");

    var slots = CALC_INPUTS.map(function (k) {
      var has = !!c.calc.files[k];
      var missClass = c.calc.missingAlert && !has ? " is-miss" : (has ? " is-ok" : "");
      return '<div class="rw-upload-slot' + missClass + '"><b>' + k + "</b><span>"
        + (has ? esc(c.calc.files[k]) : esc(CALC_INPUT_DESC[k])) + "</span></div>";
    }).join("");

    var outHas = !!c.calc.out;
    var ready = CALC_INPUTS.filter(function (k) { return c.calc.files[k]; }).length;

    return '<div class="rw-section-title">① 选择一类计算输出文件</div>'
      + '<div class="rw-calc-outs">' + outs + "</div>"

      + '<div style="margin-top:18px"><div class="rw-section-title">② 上传对应的计算输入文件</div>'
      + '<div class="rw-card-note">需要上传 INCAR / POSCAR / POTCAR / KPOINTS 四类计算输入文件，系统将校验文件完整性，并检测是否包含所选输出文件与四类输入文件。</div>'
      + '<div class="rw-upload-zone"' + (outHas ? "" : ' style="opacity:.55"') + ">"
      + "<strong>" + (outHas ? "拖拽或点击选择计算输入文件" : "请先选择一类计算输出文件") + "</strong>"
      + "<span>支持 INCAR / POSCAR / POTCAR / KPOINTS，可多选上传（原型可直接使用「填充示例文件」）</span>"
      + '<div style="margin-top:10px;display:flex;gap:10px;justify-content:center">'
      + '<input type="file" multiple data-rw-f="calcFiles"' + (outHas ? "" : " disabled") + ' style="max-width:280px">'
      + '<button class="rw-btn rw-btn--sm" type="button" data-rw-act="calc-demo-files">填充示例文件</button>'
      + '<button class="rw-btn rw-btn--sm" type="button" data-rw-act="calc-clear-files">清空</button>'
      + "</div></div>"
      + '<div class="rw-upload-grid">' + slots + "</div>"
      + '<div style="margin-top:10px;font-size:13px;color:#7d8ca3">已上传 ' + ready + " / 4 类输入文件"
      + (ready === 4 ? '　<span class="rw-tag rw-tag--done">文件完整</span>' : '　<span class="rw-tag rw-tag--warn">缺少 ' + CALC_INPUTS.filter(function (k) { return !c.calc.files[k]; }).join("、") + "</span>")
      + "</div></div>"

      + '<div style="margin-top:16px" class="rw-params"><div class="rw-params-title">③ 计算参数与结构信息</div>'
      + '<div class="rw-form">'
      + '<div class="rw-field"><label>材料类型<i>*</i></label><select data-rw-f="materialType">'
      + materialTypes().map(function (t) { return '<option value="' + esc(t.name) + '"' + (c.params.materialType === t.name ? " selected" : "") + ">" + esc(t.name) + "</option>"; }).join("")
      + "</select></div>"
      + '<div class="rw-field"><label>计算体系</label><input type="text" data-rw-f="calcSystem" value="' + esc(c.calc.system || (materialTypes()[0].sample || "MoS2") + " 单层") + '"></div>'
      + "</div>"
      + '<div class="rw-field-tip" style="margin-top:8px">' + esc(C().calcTip) + '</div>'
      + "</div>"

      + (c.calc.validated ? renderCalcReport(c) : "")
      + (c.calc.validated ? renderStructuredData(c) : "");
  }

  function renderCalcReport(c) {
    var rep = c.calc.report || { items: [], bad: [] };
    var bad = rep.items.filter(function (i) { return !i.ok; });
    var head = '<div class="rw-report-head"><span>合规性校验报告</span>'
      + '<span class="rw-tag ' + (bad.length ? "rw-tag--warn" : "rw-tag--done") + '">' + (bad.length ? "存在 " + bad.length + " 项不合规" : "全部合规") + "</span></div>";
    var items = rep.items.map(function (i) {
      return '<div class="rw-report-item' + (i.ok ? "" : " is-bad") + '">'
        + '<span class="rw-report-ico" style="color:' + (i.ok ? "#0d8f66" : "#d03050") + '">' + (i.ok ? "✓" : "✕") + "</span>"
        + "<div><b>" + esc(i.name) + "</b>（" + esc(i.rule) + "）"
        + (i.ok ? "　检测结果：符合" : "　" + esc(i.bad))
        + (i.ok ? "" : '　<i style="color:#b8720f;font-style:normal">建议：' + esc(i.fix) + "</i>")
        + "</div></div>";
    }).join("");
    var actions = bad.length
      ? '<div class="rw-banner rw-banner--warn" style="margin:12px 14px"><span>⚠</span><div>检测到参数不合规项，可「重新计算」后重新上传，或在入库时标注 <b>“低精度”</b> 继续入库。</div>'
      + '<div style="margin-left:auto;display:flex;gap:8px;flex:0 0 auto">'
      + '<button class="rw-btn rw-btn--sm" type="button" data-rw-act="calc-recalc">重新计算</button>'
      + '<button class="rw-btn rw-btn--sm rw-btn--blue" type="button" data-rw-act="calc-lowq">标注“低精度”并入库</button>'
      + "</div></div>"
      : "";
    return '<div class="rw-report">' + head + items + actions + "</div>";
  }

  function structuredPayload() {
    if (C().payload) return C().payload;
    return {
      结构信息: { 化学式: "MoS2", 晶系: "Hexagonal", 空间群: "P6₃/mmc", "晶格常数 a": "3.16 Å", "晶格常数 c": "12.30 Å", 原子坐标: "Mo(0,0,0.25)；S(1/3,2/3,0.62)", 层间厚度: "6.15 Å", 真空层: "16.5 Å" },
      能带数据: { 带隙: "1.68 eV", 带隙类型: "直接带隙（Direct）", 导带底: "K 点", 价带顶: "K 点", "电子有效质量": "0.45 m₀", "空穴有效质量": "0.52 m₀" },
      态密度: { 费米能级: "-0.42 eV", "DOS@E_F": "0.68 states/eV", 能量范围: "-20 ~ 10 eV", 能量网格: "2001 点", "Mo-d 带中心": "-1.85 eV" }
    };
  }

  function renderStructuredData(c) {
    var payload = structuredPayload();
    var keys = Object.keys(payload);
    var list = keys.map(function (g) {
      var inner = Object.keys(payload[g]).map(function (k) {
        return "<tr><td class=\"rw-nowrap\">" + esc(k) + "</td><td>" + esc(payload[g][k]) + "</td></tr>";
      }).join("");
      return '<div class="rw-card" style="margin:0"><div class="rw-card-head"><div><h3 style="font-size:14px">' + esc(g) + "（结构化数据字段）</h3></div></div>"
        + '<table class="rw-tbl"><tbody>' + inner + "</tbody></table></div>";
    }).join("");

    var json = C().payloadJson
      || ('{&nbsp;&quot;material&quot;:&nbsp;&quot;MoS2&quot;,<br>'
        + '&nbsp;&nbsp;<span class="k">&quot;structure&quot;</span>:&nbsp;{&nbsp;<span class="k">&quot;formula&quot;</span>:&nbsp;<span class="s">&quot;MoS2&quot;</span>,&nbsp;<span class="k">&quot;space_group&quot;</span>:&nbsp;<span class="s">&quot;P6_3/mmc&quot;</span>,&nbsp;<span class="k">&quot;a&quot;</span>:&nbsp;<span class="n">3.16</span>,&nbsp;<span class="k">&quot;c&quot;</span>:&nbsp;<span class="n">12.30</span>&nbsp;},<br>'
        + '&nbsp;&nbsp;<span class="k">&quot;band_gap&quot;</span>:&nbsp;{&nbsp;<span class="k">&quot;value&quot;</span>:&nbsp;<span class="n">1.68</span>,&nbsp;<span class="k">&quot;type&quot;</span>:&nbsp;<span class="s">&quot;direct&quot;</span>,&nbsp;<span class="k">&quot;unit&quot;</span>:&nbsp;<span class="s">&quot;eV&quot;</span>&nbsp;},<br>'
        + '&nbsp;&nbsp;<span class="k">&quot;dos&quot;</span>:&nbsp;{&nbsp;<span class="k">&quot;e_fermi&quot;</span>:&nbsp;<span class="n">-0.42</span>,&nbsp;<span class="k">&quot;dos_at_ef&quot;</span>:&nbsp;<span class="n">0.68</span>,&nbsp;<span class="k">&quot;grid&quot;</span>:&nbsp;<span class="n">2001</span>&nbsp;}<br>}');

    return '<div style="margin-top:18px"><div class="rw-section-title">④ 提取的结构化数据（' + esc(C().payloadTitle) + "）</div>"
      + '<div class="rw-card-note">无论数据质量等级高低，系统都会展示提取到的最终信息。</div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">' + list + "</div>"
      + '<div style="margin-top:12px"><div class="rw-json">' + json + "</div></div></div>";
  }

  /* ---------- 执行面板（日志） ---------- */
  function renderRunPanel(c) {
    var demoOpts = c.method === "calc"
      ? [["normal", "参数全部合规"], ["formatbad", "部分参数不合规（低精度）"]]
      : [["normal", "正常采集"], ["apifail", "API 调用失败（重试 3 次）"], ["formatbad", "数据格式不匹配（进入待处理队列）"]];
    var demo = '<select data-rw-f="demo" style="min-height:32px;border:1px solid #d5dee8;border-radius:7px;padding:4px 8px;font-size:13px">'
      + demoOpts.map(function (o) { return '<option value="' + o[0] + '"' + (c.demo === o[0] ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("")
      + "</select>";
    var speed = '<label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#54637c">'
      + '<input type="checkbox" data-rw-f="speed"' + (c.speed ? " checked" : "") + "> 演示加速（重试间隔 0.5s / 1s / 2s）</label>";

    var log = c.log.length
      ? c.log.map(function (l) {
        return '<div class="rw-log-line' + (l.kind ? " is-" + l.kind : "") + '"><span class="rw-log-time">' + esc(l.time) + "</span>" + esc(l.text) + "</div>";
      }).join("")
      : '<div class="rw-log-line"><span class="rw-log-time">--:--</span>等待开始采集…</div>';

    return '<div class="rw-run" data-rw-run-panel>'
      + '<div class="rw-run-head"><span>' + (c.method === "calc" ? "校验与提取日志" : "采集执行日志") + "</span>"
      + '<span style="display:flex;align-items:center;gap:14px">' + speed + "<span>原型演示：</span>" + demo + "</span></div>"
      + '<div class="rw-log" data-rw-log>' + log + "</div>"
      + (c.method !== "calc" ? '<div class="rw-field-tip" style="margin-top:8px">异常处理规则：API 调用失败自动重试 3 次（间隔 5s / 10s / 30s），仍失败则记录错误日志并将该批次标记为「采集失败」；数据格式不匹配的记录存入「待处理队列」并标记「格式异常」，同时通知数据管理员人工处理。</div>' : "")
      + "</div>"
      + renderResultPanel(c);
  }

  /* ---------- 结果面板（步骤 2 内） ---------- */
  function renderResultPanel(c) {
    var r = c.result;
    if (!r) return "";
    if (r.kind === "fail") {
      return '<div class="rw-result is-fail">'
        + '<div class="rw-result-title">✕ 采集失败</div>'
        + '<div class="rw-kv"><div><b>采集 ID</b>' + esc(c.id) + "</div><div><b>失败批次</b>" + esc(r.batch) + "</div>"
        + "<div><b>重试次数</b>3 次（间隔 5s / 10s / 30s）</div><div><b>错误日志</b>" + esc(r.logId) + "</div></div>"
        + '<div style="font-size:13px;color:#8a3a4a;line-height:1.7">该批次已标记为「采集失败」，错误日志已写入系统操作日志，可在资源采集列表中查看错误明细后重新发起采集。</div>'
        + "</div>";
    }
    var rows = (r.rows || []).map(function (x) {
      return "<tr><td>" + esc(x.dbName) + "</td><td class=\"rw-nowrap\">" + esc(x.version) + "</td><td class=\"rw-nowrap\">" + esc(x.time) + "</td><td>" + x.count + " 条</td><td>" + esc(x.files) + "</td></tr>";
    }).join("");
    var fileRows = (r.files || []).map(function (f) {
      return "<tr><td class=\"rw-nowrap\">" + esc(f.name) + "</td><td>" + esc(f.type) + "</td><td>" + (f.check === "ok" ? '<span class="rw-tag rw-tag--done">校验通过</span>' : '<span class="rw-tag rw-tag--warn">格式异常</span>') + "</td><td>" + esc(f.note) + "</td></tr>";
    }).join("");

    var cls = r.kind === "format" ? " is-warn" : "";
    var title = r.kind === "format" ? "⚠ 采集完成（部分数据格式不匹配）" : "✓ 采集成功";
    return '<div class="rw-result' + cls + '">'
      + '<div class="rw-result-title">' + title + "</div>"
      + '<div class="rw-kv"><div><b>采集 ID</b>' + esc(c.id) + "</div>"
      + "<div><b>源数据库</b>" + (r.rows || []).map(function (x) { return esc(x.dbName); }).join("、") + "</div>"
      + "<div><b>记录总数</b>" + (r.total || 0) + " 条</div>"
      + "<div><b>原始数据文件</b>JSON / CIF</div>"
      + "<div><b>采集时间</b>" + esc(r.at) + "</div>"
      + "<div><b>安全等级</b>" + esc(r.security) + "</div></div>"
      + '<table class="rw-tbl rw-result-table-main" style="background:#fff;border-radius:8px;overflow:hidden"><thead><tr><th>源数据库名称</th><th>数据版本</th><th>采集时间</th><th>记录数</th><th>原始文件</th></tr></thead><tbody>' + rows + "</tbody></table>"
      + '<div style="margin-top:14px"><div class="rw-section-title" style="font-size:14px">计算数据文件校验</div>'
      + '<table class="rw-tbl rw-result-table-files" style="background:#fff;border-radius:8px;overflow:hidden"><thead><tr><th>文件名称</th><th>类型</th><th>校验结果</th><th>处理</th></tr></thead><tbody>' + fileRows + "</tbody></table></div>"
      + (r.pending && r.pending.length
        ? '<div class="rw-banner rw-banner--warn" style="margin:14px 0 0"><span>⚠</span><div>'
        + "<b>" + r.pending.length + " 条记录数据格式不匹配</b>：已存入「待处理队列」并标记「格式异常」，已自动通知数据管理员人工处理。"
        + '<div style="margin-top:6px">' + r.pending.map(function (p) { return esc(p.name) + "（" + esc(p.reason) + "）"; }).join("；") + "</div>"
        + "</div></div>"
        : "")
      + "</div>";
  }

  /* ---------- 步骤 3：数据更新 ---------- */
  function renderCreateStep3(c) {
    var summary = '<div class="rw-result"><div class="rw-result-title">✓ 任务配置确认</div>'
      + '<div class="rw-kv">'
      + "<div><b>采集 ID</b>" + esc(c.id) + "</div>"
      + "<div><b>入库名称</b>" + esc(c.name || "-") + "</div>"
      + "<div><b>数据获取方式</b>" + esc(c.obtainWay) + "</div>"
      + "<div><b>数据来源</b>" + esc(c.sourceType) + "</div>"
      + "<div><b>数据类型</b>" + esc(c.dataType) + "</div>"
      + "<div><b>数据整合对象</b>" + esc(c.collectObject === "图" ? "图（图像校验规则）" : "表（表字段规则校验）") + "</div>"
      + "</div></div>";
    return '<div class="rw-section-title">第三步 · 数据更新</div>'
      + summary
      + '<div class="rw-form" style="margin-top:14px">'
      + '<div class="rw-field"><label>更新频率<i>*</i></label>'
      + '<select data-rw-f="updateFreq">'
      + ["每日", "每周", "每月", "每季度"].map(function (o) { return '<option value="' + esc(o) + '"' + (c.updateFreq === o ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("")
      + "</select>"
      + '<span class="rw-field-tip">按所选周期自动检查数据源更新并生成更新批次。</span></div>'
      + '<div class="rw-field"><label>更新执行方式<i>*</i></label>'
      + '<div class="rw-methods" style="margin-top:2px">'
      + '<label class="rw-method' + (c.updateMode !== "自动" ? " is-on" : "") + '"><div class="rw-method-top">'
      + '<input type="radio" name="rwUpdateMode" data-rw-f="updateMode" value="手动"' + (c.updateMode !== "自动" ? " checked" : "") + ">"
      + '<span class="rw-method-title">手动</span></div>'
      + '<div class="rw-method-desc">由工作人员在任务列表中手动触发更新执行。</div></label>'
      + '<label class="rw-method' + (c.updateMode === "自动" ? " is-on" : "") + '"><div class="rw-method-top">'
      + '<input type="radio" name="rwUpdateMode" data-rw-f="updateMode" value="自动"' + (c.updateMode === "自动" ? " checked" : "") + ">"
      + '<span class="rw-method-title">自动</span></div>'
      + '<div class="rw-method-desc">系统按更新频率定时执行更新，无需人工干预。</div></label>'
      + "</div></div>"
      + "</div>";
  }

  /* ------------------------------------------------------------ 执行采集 */
  function logPush(c, kind, text) {
    c.log.push({ kind: kind || "", text: text, time: nowText() });
    var box = document.querySelector("[data-rw-log]");
    if (box) {
      var line = document.createElement("div");
      line.className = "rw-log-line" + (kind ? " is-" + kind : "");
      line.innerHTML = '<span class="rw-log-time">' + esc(nowText()) + "</span>" + esc(text);
      box.appendChild(line);
      box.scrollTop = box.scrollHeight;
    }
  }

  function dbVersionOf(key) {
    var map = C().dbVersions || { mp: "v2024.11", c2db: "v3.2", "2dmatpedia": "v2023.09", "b-c2db": "v3.2", "b-icsd": "v2.8", "b-2dm": "v1.6", "b-self": "V0.0（自采）" };
    return map[key] || "v1.0";
  }

  function buildMediaFiles(picks, badCount) {
    var list = [];
    picks.forEach(function (p, i) {
      var idx = i + 1;
      var base = C().code + "_" + p.dbKey.toUpperCase().replace(/[^A-Z0-9]/g, "") + "_" + ("00" + idx).slice(-2);
      var ext = C().mediaExt || "cif";
      list.push({ name: base + ".json", type: "JSON", check: "ok", note: "字段结构校验通过" });
      list.push({ name: base + "." + ext, type: ext.toUpperCase(), check: i < badCount ? "bad" : "ok", note: i < badCount ? "字段缺失 / 结构块不完整，已转待处理队列" : "结构块校验通过" });
    });
    return list;
  }

  function runCollect() {
    syncFromDom();
    var c = getS().create;
    if (!c || c.running) return;

    if (c.method === "calc") { runCalc(); return; }

    var list = c.method === "buy" ? BUY_DBS : OPEN_DBS;
    var picks = pickedList(list, c);
    if (!picks.length) {
      c.error = "请先勾选要采集的数据库或数据集";
      renderCreateModal();
      return;
    }
    var badRanges = c.params.ranges.some(function (r) { return (r.min && isNaN(Number(r.min))) || (r.max && isNaN(Number(r.max))); });
    if (badRanges) {
      c.error = "性质范围请输入数值";
      renderCreateModal();
      return;
    }

    c.error = "";
    c.result = null;
    c.running = true;
    c.log = [];
    renderCreateModal();

    var gap = c.speed ? [500, 1000, 2000] : [5000, 10000, 30000];
    var total = picks.reduce(function (a, b) { return a + b.count; }, 0);
    var dbNames = [];
    picks.forEach(function (p) { if (dbNames.indexOf(p.dbName) < 0) dbNames.push(p.dbName); });
    var rangeText = c.params.ranges.map(function (r) {
      return r.property + " " + (r.min || "不限") + " ~ " + (r.max || "不限") + " " + (r.unit || "");
    }).join("；") || "不限";

    logPush(c, "", "初始化采集任务 " + c.id + "（材料类型：" + c.params.materialType + "；性质范围：" + rangeText + "）");
    logPush(c, "", "已装载 " + picks.length + " 个数据集，预计记录数 " + total + " 条");

    var failMode = c.demo === "apifail" ? "apifail" : "";
    var attempts = 0;

    function attempt() {
      attempts += 1;
      logPush(c, "", "调用 " + picks[0].dbName + " 开放 API（/v1/materials/search）· 第 " + attempts + " 次尝试");
      if (failMode === "apifail") {
        if (attempts <= 3) {
          logPush(c, "err", "API 调用失败：504 Gateway Timeout（第 " + attempts + " 次）");
          logPush(c, "warn", "将在 " + (gap[attempts - 1] / 1000) + " 秒后自动重试…");
          setTimeout(attempt, gap[attempts - 1]);
          return;
        }
        finish();
        return;
      }
      // 成功分支
      logPush(c, "ok", "API 调用成功，返回 " + total + " 条候选记录");
      logPush(c, "", "正在拉取原始数据文件（JSON / CIF）…");
      setTimeout(finish, c.speed ? 700 : 1800);
    }

    function finish() {
      var nowStr = nowText();
      if (failMode === "apifail") {
        var logId = "ERR-" + stamp() + "-" + ("00" + Math.min(attempts, 3)).slice(-2);
        logPush(c, "err", "已重试 3 次（间隔 5s / 10s / 30s）仍失败");
        logPush(c, "err", "记录错误日志：" + logId + "，该批次标记为「采集失败」");
        c.running = false;
        c.result = { kind: "fail", method: c.method, batch: c.id + "-B01", logId: logId, at: nowStr };
        c.autoScroll = true;
        renderCreateModal();
        toast("采集失败：已重试 3 次仍无法调用 API，批次已标记「采集失败」", "err");
        return;
      }

      var badCount = c.demo === "formatbad" ? 1 : 0;
      var files = buildMediaFiles(picks, badCount);
      var pending = files.filter(function (f) { return f.check === "bad"; }).map(function (f) {
        return { name: f.name, reason: "格式异常（缺少必需字段 / 结构块不完整）" };
      });
      var rows = dbNames.map(function (n) {
        var dbKey = picks.filter(function (p) { return p.dbName === n; })[0].dbKey;
        var cnt = picks.filter(function (p) { return p.dbName === n; }).reduce(function (a, b) { return a + b.count; }, 0);
        return { dbName: n, version: dbVersionOf(dbKey), time: nowStr, count: cnt, files: "JSON / CIF" };
      });

      logPush(c, "", "字段映射与去重完成，共 " + total + " 条记录");
      logPush(c, "", "执行计算数据文件校验（" + files.length + " 个文件）");
      files.forEach(function (f) {
        if (f.check === "ok") logPush(c, "ok", "校验通过：" + f.name);
        else logPush(c, "warn", "格式异常：" + f.name + " → 已存入「待处理队列」，标记「格式异常」");
      });
      if (pending.length) {
        logPush(c, "warn", "已通知数据管理员人工处理（通知方式：站内消息 + 邮件）");
      }
      logPush(c, "ok", "采集完成，已生成原始数据文件与采集清单");

      c.running = false;
      c.result = {
        kind: pending.length ? "format" : "success",
        method: c.method, rows: rows, files: files, pending: pending,
        total: total, at: nowStr, security: c.method === "calc" ? "第2级" : "第1级"
      };
      c.autoScroll = true;
      renderCreateModal();
      if (pending.length) {
        toast("采集完成，但存在 " + pending.length + " 个格式异常文件，已转待处理队列并通知数据管理员", "err");
      } else {
        toast("采集成功，请确认列表信息后提交", "ok");
      }
    }

    setTimeout(attempt, c.speed ? 400 : 800);
  }

  /* ------------------------------------------------------------ 执行计算校验 */
  function runCalc() {
    syncFromDom();
    var c = getS().create;
    if (!c) return;
    if (!c.calc.out) {
      c.error = "请先选择一类计算输出文件（OUTCAR / DOSCAR / EIGENVAL / CONTCAR）";
      renderCreateModal();
      return;
    }
    var missing = CALC_INPUTS.filter(function (k) { return !c.calc.files[k]; });
    c.error = "";
    c.running = true;
    c.log = [];
    renderCreateModal();

    logPush(c, "", "开始校验计算文件（输出文件：" + c.calc.out + "）");
    logPush(c, "", "检测计算输入文件完整性…");

    if (missing.length) {
      c.calc.missingAlert = true;
      c.calc.validated = false;
      c.running = false;
      logPush(c, "err", "缺少 INCAR/POSCAR/POTCAR/KPOINTS 文件（缺失：" + missing.join("、") + "），已拒绝提交");
      c.error = "缺少 INCAR/POSCAR/POTCAR/KPOINTS 文件，已拒绝提交";
      renderCreateModal();
      toast('缺少 INCAR/POSCAR/POTCAR/KPOINTS 文件，已拒绝提交', "err");
      return;
    }

    CALC_INPUTS.forEach(function (k) { logPush(c, "ok", "输入文件完整：" + k); });
    setTimeout(function () {
      logPush(c, "", "执行参数合规性校验（泛函 / 截断能 / K 点密度 / 力收敛 / 真空层）");
      var badMode = c.demo === "formatbad";
      var items = CALC_COMPLIANCE.map(function (item, i) {
        var ok = badMode ? i !== 2 : true;
        return { key: item.key, name: item.name, rule: item.rule, ok: ok, bad: item.bad, fix: item.fix };
      });
      c.calc.report = { items: items };
      c.calc.validated = true;
      c.calc.quality = items.some(function (i) { return !i.ok; }) ? "低精度" : "高精度";
      items.forEach(function (i) {
        if (i.ok) logPush(c, "ok", "参数合规：" + i.name + "（" + i.rule + "）");
        else logPush(c, "warn", "参数不合规：" + i.name + " —— " + i.bad + "（建议：" + i.fix + "）");
      });
      logPush(c, "", "读取并提取结构化数据：结构信息、能带数据、态密度");
      logPush(c, "ok", "提取完成，已生成结构化数据 JSON 字段");

      c.running = false;
      c.result = {
        kind: "success", method: "calc", out: c.calc.out, inputs: CALC_INPUTS.slice(),
        report: c.calc.report, quality: c.calc.quality, at: nowText(),
        rows: [], files: buildMediaFiles([{ dbKey: "calc", dbName: "本地计算输出", count: 1 }], 0),
        total: 1, security: c.calc.quality === "低精度" ? "第2级" : "第1级"
      };
      c.autoScroll = true;
      renderCreateModal();
      toast(c.calc.quality === "低精度" ? "校验完成（存在不合规项），数据将按「低精度」标注入库" : "校验通过，结构化数据已提取", c.calc.quality === "低精度" ? "err" : "ok");
    }, c.speed ? 700 : 1800);
  }

  /* --------------------------------------------------- 数据资源对象介绍弹窗 */
  function openIntro() {
    var old = document.getElementById("rwIntroMask");
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var objs = resourceObjects();
    var list = objs.length
      ? objs.map(function (o) {
        return '<div class="rw-intro-item"><h5>' + esc(o.name) + "</h5><p>" + esc(o.fields) + "</p></div>";
      }).join("")
      : '<div class="rw-intro-item"><p>暂无资源对象定义</p></div>';

    var mask = document.createElement("div");
    mask.className = "rw-mask";
    mask.id = "rwIntroMask";
    mask.setAttribute("data-rw-root", "intro");
    mask.innerHTML = '<div class="rw-modal">'
      + '<div class="rw-modal-head"><div><h3>数据资源对象介绍</h3>'
      + "<p>" + esc(C().introTitle) + "</p></div>"
      + '<div class="rw-modal-head-side"><button class="rw-modal-close" type="button" data-rw-act="close-intro" aria-label="关闭">×</button></div></div>'
      + '<div class="rw-modal-body">'
      + '<div class="rw-banner"><span>▸</span><div>' + esc(C().introBanner) + "</div></div>"
      + '<div class="rw-intro-list">' + list + "</div>"
      + '<div class="rw-banner" style="margin-top:14px"><span>ⓘ</span><div>采集参数中的「性质范围」即针对上述资源对象的性质字段设置取值范围，用于过滤落在范围外的数据记录。</div></div>'
      + "</div>"
      + '<div class="rw-modal-foot"><button class="rw-btn rw-btn--primary" type="button" data-rw-act="close-intro">我知道了</button></div>'
      + "</div>";
    mask.addEventListener("click", function (e) { if (e.target === mask) closeIntro(); });
    document.body.appendChild(mask);
  }

  function closeIntro() {
    var m = document.getElementById("rwIntroMask");
    if (m && m.parentNode) m.parentNode.removeChild(m);
  }

  /* ------------------------------------------------------------ 任务详情弹窗 */
  function openDetail(id) {
    var s = getS();
    var t = s.tasks.filter(function (x) { return x.id === id; })[0];
    if (!t) return;
    var m = methodMeta(t.method);
    var r = t.result;
    var old = document.getElementById("rwDetailMask");
    if (old && old.parentNode) old.parentNode.removeChild(old);

    var rowsHtml = "";
    if (r && r.rows && r.rows.length) {
      rowsHtml = '<div class="rw-section-title" style="font-size:14px">采集成功列表</div>'
        + '<table class="rw-tbl" style="border:1px solid #e6ecf5;border-radius:8px;overflow:hidden"><thead><tr><th>源数据库名称</th><th>数据版本</th><th>采集时间</th><th>记录数</th></tr></thead><tbody>'
        + r.rows.map(function (x) { return "<tr><td>" + esc(x.dbName) + "</td><td>" + esc(x.version) + "</td><td>" + esc(x.time) + "</td><td>" + x.count + " 条</td></tr>"; }).join("")
        + "</tbody></table>";
    }
    if (r && r.method === "calc") {
      var payload = structuredPayload();
      rowsHtml = Object.keys(payload).map(function (g) {
        return '<div class="rw-section-title" style="font-size:14px;margin-top:12px">' + esc(g) + "</div>"
          + '<table class="rw-tbl" style="border:1px solid #e6ecf5;border-radius:8px;overflow:hidden"><tbody>'
          + Object.keys(payload[g]).map(function (k) { return "<tr><td class=\"rw-nowrap\">" + esc(k) + "</td><td>" + esc(payload[g][k]) + "</td></tr>"; }).join("")
          + "</tbody></table>";
      }).join("") + '<div style="margin-top:12px"><div class="rw-section-title" style="font-size:14px">合规性校验报告</div>'
        + ((r.report && r.report.items) || []).map(function (i) {
          return '<div class="rw-report-item' + (i.ok ? "" : " is-bad") + '"><span class="rw-report-ico" style="color:' + (i.ok ? "#0d8f66" : "#d03050") + '">' + (i.ok ? "✓" : "✕") + "</span><div><b>" + esc(i.name) + "</b>（" + esc(i.rule) + "）" + (i.ok ? "　符合" : "　" + esc(i.bad)) + "</div></div>";
        }).join("") + "</div>";
    }
    if (r && r.pending && r.pending.length) {
      rowsHtml += '<div class="rw-banner rw-banner--warn" style="margin-top:12px"><span>⚠</span><div>'
        + r.pending.map(function (p) { return esc(p.name) + "（" + esc(p.reason) + "）"; }).join("；")
        + "　已存入待处理队列，标记「格式异常」，等待数据管理员人工处理。</div></div>";
    }

    var mask = document.createElement("div");
    mask.className = "rw-mask";
    mask.id = "rwDetailMask";
    mask.setAttribute("data-rw-root", "detail");
    mask.innerHTML = '<div class="rw-modal rw-modal--narrow" style="width:min(760px,100%)">'
      + '<div class="rw-modal-head"><div><h3>' + esc(t.name) + "</h3><p>采集任务详情</p></div>"
      + '<div class="rw-modal-head-side"><button class="rw-modal-close" type="button" data-rw-act="close-detail">×</button></div></div>'
      + '<div class="rw-modal-body">'
      + '<div class="rw-kv"><div><b>采集ID</b>' + esc(t.id) + "</div>"
      + "<div><b>采集方式</b><span class=\"rw-tag " + m.tag + '">' + esc(m.label) + "</span></div>"
      + "<div><b>状态</b>" + esc(t.status) + "</div>"
      + "<div><b>源数据库</b>" + esc(t.source || "-") + "</div>"
      + "<div><b>数据版本</b>" + esc(t.version || "-") + "</div>"
      + "<div><b>原始文件</b>" + esc(t.rawFiles || "-") + "</div>"
      + "<div><b>安全等级</b>" + esc(t.security || "第1级") + "</div>"
      + "<div><b>创建时间</b>" + esc(t.createdAt) + "</div></div>"
      + detailClosureHtml(t)
      + '<div class="rw-section-title" style="font-size:14px">采集说明</div>'
      + '<div class="rw-card-note">' + esc(t.desc || "-") + "</div>"
      + rowsHtml
      + "</div>"
      + '<div class="rw-modal-foot"><button class="rw-btn" type="button" data-rw-act="close-detail">关闭</button>'
      + '<button class="rw-btn rw-btn--primary" type="button" data-rw-act="detail-to-entry" data-id="' + esc(t.id) + '">进入资源录入</button></div>'
      + "</div>";
    mask.addEventListener("click", function (e) { if (e.target === mask) closeDetail(); });
    document.body.appendChild(mask);
  }

  function closeDetail() {
    var m = document.getElementById("rwDetailMask");
    if (m && m.parentNode) m.parentNode.removeChild(m);
  }

  /* ------------------------------------------------------------ 表单同步 */
  function syncFromDom() {
    var c = getS().create;
    if (!c) return;
    var mask = document.getElementById("rwMask");
    if (!mask) return;
    var ranges = [];
    var rangeMap = {};
    mask.querySelectorAll("[data-rw-f]").forEach(function (el) {
      var f = el.getAttribute("data-rw-f");
      if (f === "name") c.name = el.value;
      else if (f === "desc") c.desc = el.value;
      else if (f === "obtainWay") c.obtainWay = el.value;
      else if (f === "sourceType") c.sourceType = el.value;
      else if (f === "dataType") c.dataType = el.value;
      else if (f === "collectObject") c.collectObject = el.value;
      else if (f === "updateFreq") c.updateFreq = el.value;
      else if (f === "updateMode") { if (el.type !== "radio" || el.checked) c.updateMode = el.value; }
      else if (f === "method") {
        if (el.checked && c.method !== el.value) {
          c.method = el.value;
          c.result = null;
          c.running = false;
          c.log = [];
          c.error = "";
          c.calc.validated = false;
          c.calc.report = null;
          c.calc.missingAlert = false;
        }
      }
      else if (f === "demo") c.demo = el.value;
      else if (f === "speed") c.speed = !!el.checked;
      else if (f === "calcSystem") c.calc.system = el.value;
      else if (f === "materialType") {
        var prev = c.params.materialType;
        c.params.materialType = el.value;
        if (prev !== el.value) c.params.ranges = [{ property: "", min: "", max: "", unit: "" }];
      } else if (f === "dbAll") {
        var dbKey = el.getAttribute("data-db");
        var src = (c.method === "buy" ? BUY_DBS : OPEN_DBS).filter(function (d) { return d.key === dbKey; })[0];
        if (!src) return;
        src.datasets.forEach(function (d, i) {
          if (el.checked) c.dbPick[dbKey + "::" + i] = true; else delete c.dbPick[dbKey + "::" + i];
        });
      } else if (f === "ds") {
        var k = el.getAttribute("data-db") + "::" + el.getAttribute("data-ds");
        if (el.checked) c.dbPick[k] = true; else delete c.dbPick[k];
      } else if (f === "calcOut") { if (el.checked) c.calc.out = el.value; }
      else if (f === "calcFiles") {
        if (el.files && el.files.length) {
          for (var i = 0; i < el.files.length; i++) {
            var nm = el.files[i].name;
            var base = nm.replace(/\.[^.]+$/, "").toUpperCase();
            CALC_INPUTS.forEach(function (key) { if (base.indexOf(key) >= 0) c.calc.files[key] = nm; });
          }
        }
      } else if (f === "range") {
        var ri = Number(el.getAttribute("data-row"));
        var col = el.getAttribute("data-col");
        if (!rangeMap[ri]) rangeMap[ri] = { property: "", min: "", max: "", unit: "" };
        rangeMap[ri][col] = el.value;
      }
    });
    Object.keys(rangeMap).forEach(function (k) { ranges.push(rangeMap[k]); });
    if (ranges.length) c.params.ranges = ranges;
  }

  function afterModalRender() {
    var mask = document.getElementById("rwMask");
    if (!mask) return;
    var c = getS().create;
    if (!c) return;
    mask.querySelectorAll('[data-rw-f="dbAll"]').forEach(function (el) {
      var dbKey = el.getAttribute("data-db");
      var src = (c.method === "buy" ? BUY_DBS : OPEN_DBS).filter(function (d) { return d.key === dbKey; })[0];
      if (!src) return;
      var n = src.datasets.filter(function (d, i) { return c.dbPick[dbKey + "::" + i]; }).length;
      el.checked = n === src.datasets.length && n > 0;
      el.indeterminate = n > 0 && n < src.datasets.length;
    });
    /* 采集 / 校验完成后自动滚到结果区，避免结果落在弹窗折叠线以下 */
    if (c.autoScroll) {
      c.autoScroll = false;
      setTimeout(function () { scrollModalTo(c.step === 3 ? ".rw-result" : (c.method === "calc" ? ".rw-report" : ".rw-result")); }, 40);
    }
  }

  function scrollModalTo(sel) {
    var mask = document.getElementById("rwMask");
    if (!mask) return;
    var body = mask.querySelector(".rw-modal-body");
    var target = mask.querySelector(sel);
    if (!body || !target) return;
    var br = body.getBoundingClientRect();
    var tr = target.getBoundingClientRect();
    body.scrollTop = body.scrollTop + (tr.top - br.top) - 10;
  }

  function syncModal() { /* 弹窗挂在 body 上，页面重渲染不影响它 */ }

  /* ------------------------------------------------------------ 提交入库 */
  var METHOD_BY_SOURCE = { "文献采集": "buy", "开源数据库": "open", "计算数据": "calc", "商业购买数据库": "buy" };

  function submitTask() {
    syncFromDom();
    var s = getS();
    var c = s.create;
    if (!c) return;
    if (!String(c.name || "").trim()) {
      c.error = "请填写入库名称";
      c.step = 3;
      renderCreateModal();
      return;
    }
    var isTable = c.collectObject !== "图";
    var report = isTable
      ? "表字段规则校验 " + TABLE_RULES.length + "/" + TABLE_RULES.length + " 通过（含晶格常数小数点后 7 位）· 格式统一完成"
      : "图像校验规则 " + IMAGE_RULES.length + "/" + IMAGE_RULES.length + " 通过（分辨率/格式/清晰度合格）· 已统一存储格式";

    var task = {
      id: c.id,
      name: String(c.name).trim(),
      method: METHOD_BY_SOURCE[c.sourceType] || "open",
      desc: String(c.desc || "").trim(),
      status: "已完成",
      createdAt: nowText(),
      source: c.sourceType,
      sourceType: c.sourceType,
      obtainWay: c.obtainWay,
      dataType: c.dataType,
      collectObject: c.collectObject,
      dbName: String(c.name).trim(),
      integrationReport: report,
      updateFreq: c.updateFreq,
      updateMode: c.updateMode,
      version: "V1.0",
      rawFiles: isTable ? "JSON / CSV" : "PNG / JPG",
      security: "第1级",
      audit: { status: "待审核", result: "", opinion: "", at: "", by: "" }
    };
    s.tasks.unshift(task);
    s.tab = "collect";
    s.focusTaskId = "";
    s.collectTaskId = task.id;
    s.auditOpen = false;
    closeCreate();
    renderRwPage();
    toast("采集任务 " + task.id + " 已提交，等待数据采集审核", "ok");
  }

  /* ================================================== 数据采集审核（2026-10-08 新增） */
  function auditTagOf(t) {
    var a = (t && t.audit && t.audit.status) || "待审核";
    var cls = a === "审核通过" ? "rw-tag--done" : (a === "审核驳回" ? "rw-tag--fail" : "rw-tag--warn");
    return '<span class="rw-tag ' + cls + '">' + esc(a) + "</span>";
  }

  function auditSourceOf(t) { return t.sourceType || t.source || methodMeta(t.method).label; }

  function renderAuditPage() {
    var s = getS();
    var wait = s.tasks.filter(function (t) { return !t.audit || !t.audit.status || t.audit.status === "待审核"; }).length;
    var rows = s.tasks.map(function (t) {
      return "<tr>"
        + '<td class="rw-id">' + esc(t.id) + "</td>"
        + "<td>" + esc(auditSourceOf(t)) + "</td>"
        + "<td><b>" + esc(t.dbName || t.name) + "</b></td>"
        + "<td>" + esc(t.integrationReport || "表字段规则校验通过 · 格式统一完成") + "</td>"
        + "<td>" + auditTagOf(t)
        + (t.audit && t.audit.opinion
          ? '<div class="rw-field-tip">审核' + esc(t.audit.status || "-") + "：" + esc(t.audit.opinion)
            + (t.audit.at ? "（" + esc(t.audit.by || "管理员") + " · " + esc(t.audit.at) + "）" : "") + "</div>"
          : "")
        + "</td>"
        + '<td class="rw-nowrap">'
        + '<button class="rw-op rw-op--primary" type="button" data-rw-act="open-audit-modal" data-id="' + esc(t.id) + '">审核</button>'
        + '<button class="rw-op" type="button" data-rw-act="view-task" data-id="' + esc(t.id) + '">查看详情</button>'
        + "</td></tr>";
    }).join("");
    return '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>数据采集审核</h3>'
      + "<p>管理员对全部采集任务的执行记录进行审核：共 " + s.tasks.length + " 条，其中待审核 " + wait + " 条；审核通过后方可进入入库流程。</p></div>"
      + '<div><button class="rw-btn" type="button" data-rw-act="collect-audit-back">← 返回采集任务执行记录</button></div></div>'
      + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>采集ID</th><th>数据来源</th><th>入库名称</th><th>数据整合报告</th><th>审核状态</th><th>操作</th></tr></thead><tbody>'
      + rows
      + "</tbody></table></div>"
      + "</div>";
  }

  function auditKvRow(label, value) {
    return "<div><b>" + esc(label) + "</b>" + esc(value == null || value === "" ? "-" : value) + "</div>";
  }

  function renderAuditModal() {
    ensureStyle();
    var s = getS();
    var t = s.tasks.filter(function (x) { return x.id === s.auditId; })[0];
    if (!t) return;
    var mask = document.getElementById("rwMask");
    if (!mask) {
      mask = document.createElement("div");
      mask.className = "rw-mask";
      mask.id = "rwMask";
      mask.setAttribute("data-rw-root", "modal");
      mask.addEventListener("click", function (e) { if (e.target === mask) closeCreate(); });
      document.body.appendChild(mask);
    }
    var a = t.audit || {};
    var isTable = t.collectObject !== "图";
    var rulesHtml = t.collectObject
      ? '<div class="rw-section-title" style="margin-top:14px">' + (isTable ? "表字段规则校验" : "图像校验规则") + "</div>"
        + rulesTable(isTable ? TABLE_RULES : IMAGE_RULES, isTable)
      : "";
    var auditResultHtml = a.status && a.status !== "待审核"
      ? '<div class="rw-banner' + (a.status === "审核驳回" ? " rw-banner--warn" : "") + '" style="margin-top:14px"><span>' + (a.status === "审核通过" ? "✓" : "✕") + "</span><div>已有审核结果：<b>" + esc(a.status) + "</b>"
        + (a.opinion ? "，审核意见：" + esc(a.opinion) : "")
        + (a.at ? "（" + esc(a.by || "管理员") + " · " + esc(a.at) + "）" : "") + "。重新提交将覆盖原结果。</div></div>"
      : "";
    mask.innerHTML = '<div class="rw-modal" role="dialog" aria-modal="true">'
      + '<div class="rw-modal-head">'
      + '<div><h3>数据采集审核 · ' + esc(t.id) + "</h3><p>展示采集任务的全部配置内容与校验结果，管理员填写审核结果与意见。审核只需一次：通过后即可进入入库流程。</p></div>"
      + '<div class="rw-modal-head-side">'
      + '<button class="rw-modal-close" type="button" data-rw-act="close-create" aria-label="关闭">×</button>'
      + "</div></div>"
      + '<div class="rw-modal-body">'
      + '<div class="rw-section-title">采集任务内容</div>'
      + '<div class="rw-kv">'
      + auditKvRow("采集 ID", t.id)
      + auditKvRow("入库名称", t.dbName || t.name)
      + auditKvRow("数据获取方式", t.obtainWay || "API")
      + auditKvRow("数据来源", auditSourceOf(t))
      + auditKvRow("数据来源描述", t.desc)
      + auditKvRow("数据类型", t.dataType || "结构化")
      + auditKvRow("数据采集对象", t.collectObject || "表")
      + auditKvRow("数据整合报告", t.integrationReport || "表字段规则校验通过 · 格式统一完成")
      + auditKvRow("更新频率", t.updateFreq || "每周")
      + auditKvRow("更新执行方式", t.updateMode || "手动")
      + auditKvRow("创建时间", t.createdAt)
      + "</div>"
      + rulesHtml
      + auditResultHtml
      + '<div class="rw-section-title" style="margin-top:16px">审核结果</div>'
      + '<div class="rw-form">'
      + '<div class="rw-field"><label>审核是否通过<i>*</i></label>'
      + '<div class="rw-methods" style="margin-top:2px">'
      + '<label class="rw-method"><div class="rw-method-top">'
      + '<input type="radio" name="rwAuditResult" value="通过">'
      + '<span class="rw-method-title">审核通过</span></div>'
      + '<div class="rw-method-desc">任务数据允许进入入库流程。</div></label>'
      + '<label class="rw-method"><div class="rw-method-top">'
      + '<input type="radio" name="rwAuditResult" value="不通过">'
      + '<span class="rw-method-title">审核不通过</span></div>'
      + '<div class="rw-method-desc">任务数据退回修改，需重新提交审核。</div></label>'
      + "</div></div>"
      + '<div class="rw-field is-full"><label>审核意见</label>'
      + '<textarea id="rwAuditOpinion" placeholder="请输入审核意见，例如数据来源合规性、整合校验结论或退回原因…"></textarea>'
      + "</div>"
      + "</div>"
      + "</div>"
      + '<div class="rw-modal-foot">'
      + '<button class="rw-btn" type="button" data-rw-act="close-create">取消</button>'
      + '<button class="rw-btn rw-btn--primary" type="button" data-rw-act="submit-audit">提交审核结果</button>'
      + "</div>"
      + "</div>";
  }

  function submitAudit() {
    var s = getS();
    var mask = document.getElementById("rwMask");
    if (!mask) return;
    var t = s.tasks.filter(function (x) { return x.id === s.auditId; })[0];
    if (!t) return;
    var sel = mask.querySelector('input[name="rwAuditResult"]:checked');
    if (!sel) { toast("请先选择审核是否通过", "err"); return; }
    var op = mask.querySelector("#rwAuditOpinion");
    var pass = sel.value === "通过";
    t.audit = {
      status: pass ? "审核通过" : "审核驳回",
      result: sel.value,
      opinion: op ? op.value.trim() : "",
      at: nowText(),
      by: "管理员9527"
    };
    closeCreate();
    renderRwPage();
    toast("采集任务 " + t.id + " 审核完成：" + t.audit.status, pass ? "ok" : "err");
  }

  /* ==========================================================================
     资源录入工作台：批量导入 / 单条手动录入 / 录入审核（均可实际操作）
     ========================================================================== */

  /* 数据来源 → 推荐录入方式 → 自动识别规则 → 人工介入点（2.2.1） */
  var ENTRY_SOURCES = [
    { key: "mp", name: "Materials Project 等公开库", rec: "定制插件批量导入", rule: '文件头含 "Materials Project" 标识', point: "采集参数配置", plugin: "MaterialsProjectPlugin" },
    { key: "c2db", name: "C2DB 数据库", rec: "定制插件批量导入", rule: '文件头含 "C2DB" 标识', point: "采集参数配置", plugin: "C2DBPlugin" },
    { key: "vasp", name: "VASP 自主计算数据", rec: "自动化流程录入", rule: "包含 INCAR+POSCAR+POTCAR+KPOINTS", point: "参数合规性复核", plugin: "VASPAutoFlow" },
    { key: "literature", name: "文献提取数据", rec: "手动输入", rule: "无法自动识别", point: "全文录入", plugin: "-" },
    { key: "user", name: "用户上传数据", rec: "手动输入 + 自动校验", rule: "文件格式识别", point: "质量审核", plugin: "AutoValidator" }
  ];

  var DATA_TYPE_CODES = { "结构特征": "STR", "电子结构": "ELE", "电学性质": "ELC", "磁学性质": "MAG", "热学性质": "THE", "力学性质": "MEC", "光学性质": "OPT", "缺陷性质": "DEF" };

  /* 单条手动录入表单字段（基于 1.2 节字段定义） */
  var ENTRY_MANUAL_FIELDS = [
    { key: "formula", label: "化学式", req: true, ph: "如 MoS2", rule: "formula", msg: "化学式格式不正确，示例：MoS2" },
    { key: "crystal", label: "晶系", req: true, ph: "如 Hexagonal", rule: "text" },
    { key: "spaceGroup", label: "空间群", req: true, ph: "如 P6₃/mmc", rule: "text" },
    { key: "dataType", label: "数据类型", req: true, type: "select", opts: ["结构特征", "电子结构", "电学性质", "磁学性质", "热学性质", "力学性质", "光学性质", "缺陷性质"], rule: "text" },
    { key: "la", label: "晶格常数 a", req: true, unit: "Å", rule: "pos", msg: "晶格常数必须为正数" },
    { key: "lb", label: "晶格常数 b", req: true, unit: "Å", rule: "pos", msg: "晶格常数必须为正数" },
    { key: "lc", label: "晶格常数 c", req: true, unit: "Å", rule: "pos", msg: "晶格常数必须为正数" },
    { key: "coords", label: "原子坐标（分数坐标）", req: true, type: "textarea", ph: "Mo 0.000 0.000 0.250\nS 0.333 0.667 0.620", rule: "coord", msg: "分数坐标应在 0-1 范围内" },
    { key: "bandGap", label: "带隙", req: true, unit: "eV", rule: "gap", msg: "带隙值超出合理范围（0-10 eV）" },
    { key: "formationEnergy", label: "形成能", req: false, unit: "eV/atom", rule: "fe", msg: "形成能应≤0，请确认是否为稳定结构" },
    { key: "thickness", label: "层间厚度", req: false, unit: "Å", rule: "pos", msg: "层间厚度必须为正数" }
  ];

  /* 计算参数与标准阈值（1.4 节） */
  var ENTRY_CALC_PARAMS = [
    { key: "software", label: "计算软件", type: "select", opts: ["VASP", "Quantum ESPRESSO", "GPAW", "CASTEP"], std: "—", neutral: true },
    { key: "functional", label: "交换关联泛函", type: "select", opts: ["PBE", "GGA", "HSE06", "LDA"], std: "PBE / GGA 或更高", bad: ["LDA"], msg: "检测到 LDA 泛函，与本库标准（PBE / GGA）不一致" },
    { key: "encut", label: "平面波截断能", unit: "eV", std: "≥ 400 eV", min: 400, msg: "截断能低于标准阈值 400 eV" },
    { key: "kpoints", label: "K 点密度", unit: "Å⁻¹", std: "≥ 15 Å⁻¹", min: 15, msg: "K 点密度低于标准阈值 15 Å⁻¹" },
    { key: "force", label: "力收敛判据", unit: "eV/Å", std: "≤ 0.01 eV/Å", max: 0.01, msg: "力收敛判据低于精度要求 0.01 eV/Å" },
    { key: "vacuum", label: "真空层厚度", unit: "Å", std: "≥ 15 Å", min: 15, msg: "真空层低于二维材料标准 15 Å" }
  ];

  /* 审核流程阶段（2.2.4） */
  /* 2026-10-08：所有审核统一为一次审批——提交 → 自动校验 → 管理员审核 → 入库 / 退回 */
  var AUDIT_STAGES = ["待审核", "自动校验", "管理员审核", "入库 / 退回"];

  var AUDIT_BATCH_STAGES = ["待处理", "解析中", "字段映射中", "审核中", "通过 / 部分失败 / 全部失败", "管理员人工复核", "入库"];

  /* ---------------------------------------------------- 录入状态与工具函数 */
  function entryState() {
    var s = getS();
    if (!s.entry) {
      s.entry = {
        view: "todo",
        seq: 0,
        /* 2026-10-08：演示用样例数据——预置已入库 / 待审核记录若干，
           使「已入库数据」「录入审核」两个列表开箱即有内容，加工任务也能直接取到数据源 */
        records: seedEntryRecords(),
        manual: null,
        batch: null,
        specOpen: false,
        auditFilter: "all"
      };
      s.entry.seq = s.entry.records.length;
    }
    /* 兼容：2026-10-08 起审核改为一次审批，历史数据中的待初审 / 待终审统一视为待审核 */
    if (s.entry.records && s.entry.records.length) {
      s.entry.records.forEach(function (r) {
        if (r.status === "待初审" || r.status === "待终审") r.status = "待审核";
      });
    }
    return s.entry;
  }

  function entryRecords() { return entryState().records; }

  /* ------------------------------------------------------------------------
     2026-10-08：录入模块演示样例数据
     取当前材料的 batchSamples 作为蓝本：前 2 条标记为「已入库」（带管理员一次审核痕迹与关联规范），
     其余标记为「待审核」，审核通过后即进入已入库列表。字段沿用手动录入落库结构。
     ------------------------------------------------------------------------ */
  function seedEntryRecords() {
    var samples = C().batchSamples || [];
    var groups = stdRuleGroups();
    var pickRules = function (n) {
      return groups.slice(0, n).map(function (g) { return g.id; });
    };
    var times = ["2026-09-24 10:12", "2026-09-25 15:38", "2026-09-26 11:05", "2026-09-27 16:41"];
    var auditTimes = ["2026-09-24 14:20", "2026-09-25 17:02", "", ""];
    return samples.map(function (s, i) {
      var rec = Object.assign({}, s);
      rec.id = (C().code || "2D") + "-" + (DATA_TYPE_CODES[rec.dataType] || "GEN") + "-000" + (i + 1);
      rec.source = i % 2 === 0 ? "手动录入" : "批量导入";
      rec.sourceName = i % 2 === 0 ? "数据录入员手动录入" : "公开库 / 计算数据批量导入";
      rec.sourceType = i % 2 === 0 ? "manual" : "batch";
      rec.createdAt = times[i] || times[times.length - 1];
      rec.taskId = "";
      rec.calc = rec.calc || {};
      if (i < 2) {
        rec.status = "已入库";
        rec.auditedAt = auditTimes[i];
        rec.stdRules = pickRules(3);
        rec.stdRuleNames = rec.stdRules.map(stdRuleName);
        rec.audit = {
          auto: "自动校验通过",
          adminResult: "通过",
          opinion: "字段完整、已按标准化处理模块关联规范校验，同意入库。",
          adminAt: rec.auditedAt,
          adminBy: "管理员9527"
        };
      } else {
        rec.status = "待审核";
        rec.auditedAt = "";
        rec.stdRules = pickRules(2);
        rec.stdRuleNames = rec.stdRules.map(stdRuleName);
        rec.audit = { auto: "", adminResult: "", opinion: "", reason: "" };
      }
      return rec;
    });
  }

  /* 录入表单里「数据类型」字段的第一个选项，用作新建记录的默认值 */
  function firstDataType() {
    var f = ENTRY_MANUAL_FIELDS.filter(function (x) { return x.key === "dataType"; })[0];
    if (f && f.opts && f.opts.length) return f.opts[0];
    var keys = Object.keys(DATA_TYPE_CODES || {});
    return keys.length ? keys[0] : "通用";
  }

  function nextEntryId(dataType) {
    var e = entryState();
    e.seq += 1;
    return C().code + "-" + (DATA_TYPE_CODES[dataType] || "GEN") + "-" + ("000" + e.seq).slice(-4);
  }

  function auditStageIndex(status) {
    var map = { "待审核": 0, "自动校验中": 1, "自动校验未通过": 1, "已入库": 3, "已退回": 3 };
    return map[status] == null ? 0 : map[status];
  }

  function auditStatusTag(status) {
    if (status === "已入库") return "rw-tag--done";
    if (status === "已退回" || status === "自动校验未通过") return "rw-tag--fail";
    if (status === "待审核" || status === "自动校验中") return "rw-tag--open";
    return "rw-tag--warn";
  }

  /* 字段校验（前端实时校验，规则见 2.2.3） */
  function validateEntryField(key, val) {
    var f = ENTRY_MANUAL_FIELDS.filter(function (x) { return x.key === key; })[0] || {};
    var v = String(val == null ? "" : val).trim();
    if (!v) return { ok: false, msg: "请填写" + f.label };
    /* 规则驱动的通用校验：每种规则给一条默认文案，材料配置可用 msg 覆盖 */
    var DEFAULT_MSG = {
      formula: "化学式格式不正确，示例：MoS2",
      pos: "取值必须为正数",
      gap: "带隙值超出合理范围（0-10 eV）",
      fe: "形成能应≤0，请确认是否为稳定结构",
      num: "请输入数值",
      range: "取值超出合理范围",
      coord: "分数坐标应在 0-1 范围内",
      text: f.label + "填写不完整"
    };
    var rule = f.rule || "text";
    var bad = function (m) { return { ok: false, msg: m || f.msg || DEFAULT_MSG[rule] || (f.label + "填写不正确") }; };

    if (rule === "formula") {
      if (!/^([A-Z][a-z]?\d*)+$/.test(v)) return bad(f.msg);
      return { ok: true };
    }
    if (rule === "pos") {
      if (isNaN(Number(v)) || Number(v) <= 0) return bad(f.msg);
      return { ok: true };
    }
    if (rule === "gap") {
      var g = Number(v);
      if (isNaN(g) || g < 0 || g > 10) return bad(f.msg);
      return { ok: true };
    }
    if (rule === "fe") {
      if (isNaN(Number(v))) return bad(f.msg);
      if (Number(v) > 0) return bad(f.msg);
      return { ok: true };
    }
    if (rule === "num") {
      if (isNaN(Number(v))) return bad(f.msg);
      return { ok: true };
    }
    if (rule === "range") {
      var rn = Number(v);
      if (isNaN(rn)) return bad(f.msg);
      if (f.min != null && rn < f.min) return bad(f.msg);
      if (f.max != null && rn > f.max) return bad(f.msg);
      return { ok: true };
    }
    if (rule === "coord") {
      var lines = v.split(/\r?\n/).filter(function (l) { return String(l).trim(); });
      if (!lines.length) return { ok: false, msg: "请填写" + f.label };
      for (var i = 0; i < lines.length; i++) {
        var nums = lines[i].trim().split(/\s+/).slice(1);
        if (nums.length < 3) return { ok: false, msg: "第 " + (i + 1) + " 行坐标不完整" };
        for (var j = 0; j < 3; j++) {
          var n = Number(nums[j]);
          if (isNaN(n) || n < 0 || n > 1) return { ok: false, msg: (f.msg || "分数坐标应在 0-1 范围内") + "（第 " + (i + 1) + " 行）" };
        }
      }
      return { ok: true };
    }
    return { ok: true };
  }

  function calcParamIssue(p, val) {
    var v = String(val == null ? "" : val).trim();
    if (!v) return null;
    if (p.bad && p.bad.indexOf(v) >= 0) return p.msg;
    if (p.min != null && !isNaN(Number(v)) && Number(v) < p.min) return p.msg;
    if (p.max != null && !isNaN(Number(v)) && Number(v) > p.max) return p.msg;
    return null;
  }

  /* -------------------------------------------------------- 页签二：资源录入 */
  function renderEntryTab() {
    var e = entryState();
    var recs = entryRecords();
    var todo = (function () {
      var done = getS().entryDone;
      return getS().tasks.filter(function (t) { return done.indexOf(t.id) < 0; });
    })();
    var queue = recs.filter(function (r) { return r.status !== "已入库" && r.status !== "已退回"; });
    var done = recs.filter(function (r) { return r.status === "已入库"; });

    var actions = '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>数据录入工作台</h3>'
      + "<p>按数据来源选择录入方式：公开库 / C2DB 走定制插件批量导入，VASP 自主计算走自动化流程，文献与用户上传走手动录入并自动校验。</p></div>"
      + '<div style="display:flex;gap:10px;flex:0 0 auto;flex-wrap:wrap">'
      + (HIDE_ENTRY_BATCH
        ? ""
        : '<button class="rw-btn rw-btn--primary" type="button" data-rw-act="entry-batch">⇧ 批量导入</button>')
      + '<button class="rw-btn rw-btn--blue" type="button" data-rw-act="entry-manual">＋ 新增材料（单条录入）</button>'
      + '<button class="rw-btn' + (e.view === "stats" ? " rw-btn--blue" : "") + '" type="button" data-rw-act="entry-view" data-view="stats">📊 数据统计</button>'
      + '<button class="rw-btn' + (e.view === "perm" ? " rw-btn--blue" : "") + '" type="button" data-rw-act="entry-view" data-view="perm">🔐 权限管理</button>'
      + '<button class="rw-btn' + (e.view === "flow" ? " rw-btn--blue" : "") + '" type="button" data-rw-act="entry-view" data-view="flow">🧭 流程管理</button>'
      + "</div></div>"
      + "</div>";
    /* 2026-10-08：圈红删除——工作台下方的「数据来源/推荐录入方式/识别规则/人工介入点」来源规则表不再展示，
       数据来源仍在「批量导入 / 单条录入」弹窗内选择，录入功能不受影响。 */

    var sub = '<div class="rw-subtabs">'
      + '<button class="rw-subtab' + (e.view === "todo" ? " is-active" : "") + '" type="button" data-rw-act="entry-view" data-view="todo">待录入数据（' + todo.length + "）</button>"
      + '<button class="rw-subtab' + (e.view === "audit" ? " is-active" : "") + '" type="button" data-rw-act="entry-view" data-view="audit">录入审核（' + queue.length + "）</button>"
      + '<button class="rw-subtab' + (e.view === "done" ? " is-active" : "") + '" type="button" data-rw-act="entry-view" data-view="done">已入库数据（' + done.length + "）</button>"
      + '<button class="rw-subtab' + (e.view === "spec" ? " is-active" : "") + '" type="button" data-rw-act="entry-view" data-view="spec">录入规范说明</button>'
      + "</div>";

    var body = e.view === "audit" ? renderAuditView(queue)
      : e.view === "done" ? renderEntryDoneView(done)
      : e.view === "spec" ? renderEntrySpec()
      : e.view === "stats" ? renderEntryStats()
      : e.view === "perm" ? renderEntryPerm()
      : e.view === "flow" ? renderEntryFlow()
      : renderEntryTodoView(todo);

    return actions + sub + body;
  }

  function renderEntryTodoView(todo) {
    var rows = todo.length
      ? todo.map(function (t) {
        var m = methodMeta(t.method);
        return "<tr>"
          + '<td class="rw-id">' + esc(t.id) + "</td>"
          + "<td><b>" + esc(t.name) + "</b></td>"
          + '<td><span class="rw-tag ' + m.tag + '">' + esc(m.label) + "</span></td>"
          + '<td><span class="rw-tag ' + tagFor(t.status) + '">' + esc(t.status) + "</span></td>"
          + "<td>" + esc(t.rawFiles) + "</td>"
          + '<td class="rw-nowrap">'
          + '<button class="rw-op" type="button" data-rw-act="entry-manual" data-task="' + esc(t.id) + '">录入</button>'
          + '<button class="rw-op" type="button" data-rw-act="view-task" data-id="' + esc(t.id) + '">查看</button>'
          + "</td></tr>";
      }).join("")
      : '<tr><td colspan="6"><div class="rw-empty" style="padding:26px 0">采集数据已全部录入，可切换到「录入审核」继续处理</div></td></tr>';

    return '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>待录入数据</h3><p>资源采集完成后进入录入环节，点击「录入」填写材料数据并提交审核。</p></div></div>'
      + '<div class="rw-tbl-wrap"><table class="rw-tbl rw-todo-table"><thead><tr><th>采集ID</th><th>采集任务名称</th><th>采集方式</th><th>采集状态</th><th>原始文件</th><th>操作</th></tr></thead><tbody>' + rows + "</tbody></table></div>"
      + "</div>";
  }

  function renderAuditView(queue) {
    if (!queue.length) {
      return '<div class="rw-card"><div class="rw-card-head"><div><h3>录入审核队列</h3></div></div>'
        + '<div class="rw-empty"><b>✓</b>暂无待审核记录，请先通过「新增材料」提交数据</div></div>'
        + auditFlowCard();
    }
    var rows = queue.map(function (r) {
      return "<tr>"
        + '<td class="rw-id">' + esc(r.id) + "</td>"
        + "<td><b>" + esc(r.formula || "-") + "</b><div class=\"rw-field-tip\">" + esc(r.dataType || "-") + " · " + esc(r.sourceName || "-") + "</div></td>"
        + listTds(r)
        + '<td><span class="rw-tag ' + auditStatusTag(r.status) + '">' + esc(r.status) + "</span>"
        + (r.audit && (r.audit.opinion || r.audit.adminResult)
          ? '<div class="rw-field-tip">审核' + esc(r.audit.adminResult || "-") + "：" + esc(r.audit.opinion || "（无建议）")
            + (r.audit.adminAt ? "（" + esc(r.audit.adminBy || "管理员") + " · " + esc(r.audit.adminAt) + "）" : "") + "</div>"
          : "")
        + "</td>"
        + "<td>" + esc(r.createdAt) + "</td>"
        + '<td class="rw-nowrap">' + auditOps(r) + "</td></tr>";
    }).join("");
    return '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>录入审核队列</h3><p>一次审批：提交 → 自动校验 → 管理员审核 → 入库 / 退回。</p></div></div>'
      + '<div class="rw-tbl-wrap"><table class="rw-tbl rw-audit-table"><thead><tr><th>材料唯一标识</th><th>标识 / 数据类型</th>' + listThs()
      + "<th>审核状态</th><th>提交时间</th><th>操作</th></tr></thead><tbody>" + rows + "</tbody></table></div>"
      + "</div>" + auditFlowCard();
  }

  /* 列表里的「材料相关列」随材料变化，列定义来自 C().listCols */
  function listCols() { return C().listCols || [{ key: "crystal", label: "晶系" }]; }
  function listThs() { return listCols().map(function (c) { return "<th>" + esc(c.label) + "</th>"; }).join(""); }
  function listTds(r) {
    return listCols().map(function (c) {
      var v = r[c.key];
      return "<td>" + esc(v == null || v === "" ? "-" : v) + (v == null || v === "" ? "" : esc(c.unit || "")) + "</td>";
    }).join("");
  }

  function auditOps(r) {
    var out = [];
    /* 2026-10-08：一次审批制——待审核 / 自动校验未通过的记录只提供「审核」与「退回」 */
    if (["待审核", "自动校验未通过"].indexOf(r.status) >= 0) {
      out.push('<button class="rw-op rw-op--primary" type="button" data-rw-act="entry-audit-open" data-id="' + esc(r.id) + '">审核</button>');
      out.push('<button class="rw-op" type="button" data-rw-act="audit-auto" data-id="' + esc(r.id) + '">自动校验</button>');
      out.push('<button class="rw-op rw-op--danger" type="button" data-rw-act="audit-back" data-id="' + esc(r.id) + '" data-stage="审核">退回</button>');
    }
    out.push('<button class="rw-op" type="button" data-rw-act="audit-detail" data-id="' + esc(r.id) + '">详情</button>');
    return out.join("");
  }

  function auditFlowCard() {
    return '<div class="rw-card"><div class="rw-card-head"><div><h3>数据录入审核流程（2.2.4）</h3><p>提交 → 自动校验 → 管理员审核 → 入库 / 退回（一次审批）</p></div></div>'
      + chainHtml([{ text: "提交", cls: "" }, { text: "自动校验", cls: "" }, { text: "管理员审核", cls: "" }, { text: "入库", cls: "is-end" }, { text: "退回", cls: "is-back" }])
      + "</div>";
  }

  function renderEntryDoneView(done) {
    var rows = done.length
      ? done.map(function (r) {
        return "<tr>"
          + '<td class="rw-id">' + esc(r.id) + "</td>"
          + "<td><b>" + esc(r.formula || "-") + "</b></td>"
          + "<td>" + esc(r.dataType || "-") + "</td>"
          + listTds(r)
          + "<td>" + esc(r.quality || "高精度") + "</td>"
          + "<td>" + esc(r.auditedAt || "-") + "</td>"
          + '<td class="rw-nowrap">'
          + '<button class="rw-op" type="button" data-rw-act="audit-detail" data-id="' + esc(r.id) + '">详情</button>'
          + '<button class="rw-op" type="button" data-rw-act="entry-to-proc" data-id="' + esc(r.id) + '">送去加工</button>'
          + "</td></tr>";
      }).join("")
      : '<tr><td colspan="' + (7 + listCols().length) + '"><div class="rw-empty" style="padding:26px 0">暂无已入库数据</div></td></tr>';
    return '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>已入库数据</h3><p>' + esc(C().doneNote) + "</p></div>"
      + '<div style="flex:0 0 auto"><button class="rw-btn" type="button" data-rw-act="tab" data-rw-tab="process">进入资源加工 →</button></div></div>'
      + '<div class="rw-tbl-wrap"><table class="rw-tbl rw-done-table"><thead><tr><th>材料唯一标识</th><th>标识</th><th>数据类型</th>' + listThs()
      + "<th>质量等级</th><th>入库时间</th><th>操作</th></tr></thead><tbody>" + rows + "</tbody></table></div>"
      + "</div>";
  }

  /* ---------------------------------------------------- 单条手动录入表单弹窗 */
  function openManualEntry(sourceKey, taskId) {
    var e = entryState();
    var src = ENTRY_SOURCES.filter(function (x) { return x.key === sourceKey; })[0] || ENTRY_SOURCES[0];
    var task = taskId ? getS().tasks.filter(function (t) { return t.id === taskId; })[0] : null;
    var d = C().manualDefaults || {};
    var form = {};
    ENTRY_MANUAL_FIELDS.forEach(function (f) {
      if (f.key === "dataType") { form[f.key] = (d.form && d.form.dataType) || firstDataType(); return; }
      form[f.key] = (d.form && d.form[f.key]) != null ? d.form[f.key] : "";
    });
    var calc = {};
    ENTRY_CALC_PARAMS.forEach(function (p) {
      calc[p.key] = (d.calc && d.calc[p.key]) != null ? d.calc[p.key] : (p.opts && p.opts.length ? p.opts[0] : "");
    });
    e.manual = {
      sourceKey: src.key,
      taskId: taskId || "",
      form: form,
      calc: calc,
      errors: {},
      calcIssues: [],
      file: "",
      previewId: C().code + "-" + (DATA_TYPE_CODES[firstDataType()] || "GEN") + "-" + ("000" + (e.seq + 1)).slice(-4),
      lowPrecision: false,
      stdRules: []
    };
    if (task) {
      /* 从采集任务进入时，用该材料的示例数据预填，避免用户从零开始敲 */
      var demo = C().demoParse || {};
      Object.keys(demo).forEach(function (k) { if (Object.prototype.hasOwnProperty.call(e.manual.form, k)) e.manual.form[k] = demo[k]; });
      var picked = (task.name.match(/[（(]([A-Za-z0-9]+)[）)]/) || [])[1];
      if (picked && Object.prototype.hasOwnProperty.call(e.manual.form, "formula")) e.manual.form.formula = picked;
    }
    renderManualEntry();
  }

  function renderManualEntry() {
    ensureStyle();
    var e = entryState();
    var m = e.manual;
    if (!m) return;
    closeMask("rwEntryMask");
    var mask = document.createElement("div");
    mask.className = "rw-mask";
    mask.id = "rwEntryMask";
    mask.setAttribute("data-rw-root", "entryForm");
    mask.addEventListener("click", function (ev) { if (ev.target === mask) closeMask("rwEntryMask"); });
    mask.innerHTML = '<div class="rw-modal" role="dialog" aria-modal="true">'
      + '<div class="rw-modal-head"><div><h3>新增材料 · 单条手动录入</h3>'
      + "<p>数据来源：" + esc(ENTRY_SOURCES.filter(function (x) { return x.key === m.sourceKey; })[0].name) + "　推荐方式：" + esc(ENTRY_SOURCES.filter(function (x) { return x.key === m.sourceKey; })[0].rec) + "</p></div>"
      + '<div class="rw-modal-head-side"><button class="rw-modal-close" type="button" data-rw-act="entry-form-close">×</button></div></div>'
      + '<div class="rw-modal-body">'
      + '<div class="rw-banner"><span>ⓘ</span><div>系统按录入规范表（1.2 节）实时校验字段；计算参数将与标准阈值（1.4 节）自动对比，不合规项会给出提示。</div></div>'
      + '<div class="rw-section-title">① 材料基本信息（必填项已标 *）</div>'
      + manualFormHtml(m)
      + '<div style="margin-top:18px"><div class="rw-section-title">② 关联配置规范（勾选本次录入适用的标准化处理规则）</div>'
      + '<div class="rw-card-note">规则来自「数据标准化处理」模块规则库；勾选后随记录一并提交，录入审核时逐条对照。</div>'
      + renderStdRulesHtml(m) + "</div>"
      + '<div style="margin-top:18px"><div class="rw-section-title">③ 上传结构文件（CIF / POSCAR）</div>'
      + '<div class="rw-upload-zone"><strong>' + (m.file ? esc(m.file) : "拖拽或点击选择结构文件，解析后自动填充晶格常数与原子坐标") + "</strong>"
      + '<span>支持 CIF / POSCAR；原型中点击「填充示例结构」可直接体验自动填充</span>'
      + '<div style="margin-top:10px;display:flex;gap:10px;justify-content:center">'
      + '<button class="rw-btn rw-btn--sm rw-btn--ghost" type="button" data-rw-act="entry-demo-cif">填充示例结构（' + esc(C().demoFile) + '）</button>'
      + '<button class="rw-btn rw-btn--sm" type="button" data-rw-act="entry-parse-cif">解析并填充字段</button>'
      + "</div></div></div>"
      + '<div style="margin-top:18px"><div class="rw-section-title">④ 计算参数（与标准阈值自动对比）</div>'
      + calcParamHtml(m) + "</div>"
      + '<div style="margin-top:14px"><div class="rw-field-tip">提交后系统生成唯一标识（格式：' + esc(C().code) + '-数据类型-序号），并进入第 2.2.4 节审核流程。</div>'
      + '<div class="rw-banner" style="margin-top:8px"><span>#</span><div>预生成唯一标识：<b>' + esc(m.previewId || "（选择数据类型后生成）") + "</b></div></div></div>"
      + "</div>"
      + '<div class="rw-modal-foot">'
      + '<span class="rw-foot-tip">' + (m.lowPrecision ? '已选择按「低精度」提交' : (m.calcIssues.length ? "存在 " + m.calcIssues.length + " 项参数不合规，可重新计算或标注低精度提交" : "")) + "</span>"
      + '<button class="rw-btn" type="button" data-rw-act="entry-form-close">取消</button>'
      + (m.calcIssues.length && !m.lowPrecision ? '<button class="rw-btn rw-btn--blue" type="button" data-rw-act="entry-mark-low">标注“低精度”提交</button>' : "")
      + '<button class="rw-btn rw-btn--primary" type="button" data-rw-act="entry-submit">提交审核</button></div>'
      + "</div>";
    document.body.appendChild(mask);
  }

  /* ================================================== 关联配置规范（2026-10-08 新增）
     勾选项取自「数据标准化处理」模块的规则库（LOWDIM_STD_LIBRARY），按分类分组展示，
     勾选结果随记录提交，供录入审核时逐条对照。 */
  function stdLibrary() {
    try { return (window.LOWDIM_STD_LIBRARY || {})[CFG_KEY] || null; } catch (e) { return null; }
  }

  function stdRuleGroups() {
    var L = stdLibrary();
    var out = [];
    if (L && Array.isArray(L.categories)) {
      L.categories.forEach(function (cat) {
        (cat.sections || []).forEach(function (sec) {
          (sec.rules || []).forEach(function (r) {
            out.push({
              id: r.id || ((cat.key || "cat") + "-" + out.length),
              cat: cat.label || "规范分类",
              item: r.item || r.field || "-",
              desc: r.basis || r.value || ""
            });
          });
        });
      });
    }
    /* 规则库未就绪时的兜底：用本库通用字段规则 */
    if (!out.length) {
      TABLE_RULES.forEach(function (r, i) {
        out.push({ id: "fb-" + i, cat: "通用字段规范", item: r[0], desc: r[2] });
      });
    }
    return out;
  }

  function stdRuleName(id) {
    var g = stdRuleGroups().filter(function (x) { return x.id === id; })[0];
    return g ? g.item : id;
  }

  function renderStdRulesHtml(m) {
    var groups = stdRuleGroups();
    var sel = m.stdRules || [];
    var byCat = {};
    groups.forEach(function (g) { (byCat[g.cat] = byCat[g.cat] || []).push(g); });
    var cats = Object.keys(byCat).map(function (cat) {
      var list = byCat[cat];
      var items = list.map(function (r) {
        var on = sel.indexOf(r.id) >= 0;
        return '<label class="rw-std-item' + (on ? " is-on" : "") + '">'
          + '<input type="checkbox" data-rw-es="' + esc(r.id) + '"' + (on ? " checked" : "") + ">"
          + '<div><div class="rw-std-item-title">' + esc(r.item) + "</div>"
          + '<div class="rw-std-item-desc">' + esc(r.desc) + "</div></div></label>";
      }).join("");
      return '<div class="rw-std-cat"><div class="rw-std-cat-head"><b>' + esc(cat) + "</b>"
        + '<span class="rw-std-cat-count">' + list.length + " 条</span></div>"
        + '<div class="rw-std-items">' + items + "</div></div>";
    }).join("");
    return '<div class="rw-std-wrap">'
      + '<div class="rw-std-top"><span>已关联 <b>' + sel.length + "</b> / " + groups.length + " 条规范</span>"
      + '<span><button class="rw-btn rw-btn--sm" type="button" data-rw-act="std-all">全选</button>'
      + '<button class="rw-btn rw-btn--sm" type="button" data-rw-act="std-none">清空</button></span></div>'
      + cats
      + "</div>";
  }

  /* 勾选后只更新计数与高亮，不做整弹窗重渲染（避免滚动位置丢失） */
  function refreshStdCount() {
    var m = entryState().manual;
    if (!m) return;
    var mask = document.getElementById("rwEntryMask");
    if (!mask) return;
    var b = mask.querySelector(".rw-std-top b");
    if (b) b.textContent = String((m.stdRules || []).length);
    Array.prototype.forEach.call(mask.querySelectorAll(".rw-std-item"), function (el) {
      var cb = el.querySelector('input[data-rw-es]');
      if (cb) el.classList.toggle("is-on", !!cb.checked);
    });
  }

  function manualFormHtml(m) {
    return '<div class="rw-form">' + ENTRY_MANUAL_FIELDS.map(function (f) {
      var err = m.errors[f.key];
      var val = m.form[f.key];
      var ctl;
      if (f.type === "select") {
        ctl = '<select data-rw-ef="' + f.key + '">' + f.opts.map(function (o) {
          return '<option' + (val === o ? " selected" : "") + ">" + esc(o) + "</option>";
        }).join("") + "</select>";
      } else if (f.type === "textarea") {
        ctl = '<textarea data-rw-ef="' + f.key + '" placeholder="' + esc(f.ph || "") + '">' + esc(val) + "</textarea>";
      } else {
        ctl = '<input type="text" data-rw-ef="' + f.key + '" placeholder="' + esc(f.ph || "") + '" value="' + esc(val) + '">';
      }
      return '<div class="rw-field' + (f.type === "textarea" ? " is-full" : "") + (err ? " is-error" : "") + '">'
        + "<label>" + esc(f.label) + (f.req ? "<i>*</i>" : "") + (f.unit ? "（" + esc(f.unit) + "）" : "") + "</label>"
        + ctl
        + (err ? '<span class="rw-field-err">' + esc(err) + "</span>" : (f.rule === "coord" ? '<span class="rw-field-tip">每行一个原子：元素 + 三个分数坐标（0~1）</span>' : ""))
        + "</div>";
    }).join("") + "</div>";
  }

  function calcParamHtml(m) {
    var items = ENTRY_CALC_PARAMS.map(function (p) {
      var v = m.calc[p.key];
      var bad = m.calcIssues.filter(function (x) { return x.key === p.key; })[0];
      var ctl = p.type === "select"
        ? '<select data-rw-ec="' + p.key + '">' + p.opts.map(function (o) { return '<option' + (v === o ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("") + "</select>"
        : '<input type="text" data-rw-ec="' + p.key + '" value="' + esc(v) + '">';
      return '<div class="rw-field' + (bad ? " is-error" : "") + '"><label>' + esc(p.label) + (p.unit ? "（" + esc(p.unit) + "）" : "") + "</label>"
        + ctl
        + '<span class="rw-field-tip' + (bad ? " rw-error" : "") + '">' + (bad ? esc(bad.msg) : "标准：" + esc(p.std)) + "</span></div>";
    }).join("");
    return '<div class="rw-form">' + items + "</div>"
      + '<div style="margin-top:10px"><button class="rw-btn rw-btn--sm" type="button" data-rw-act="entry-check-calc">标准阈值对比</button></div>';
  }

  function recomputeCalcIssues(silent) {
    var m = entryState().manual;
    if (!m) return;
    var issues = [];
    ENTRY_CALC_PARAMS.forEach(function (p) {
      if (p.neutral) return;
      var msg = calcParamIssue(p, m.calc[p.key]);
      if (msg) issues.push({ key: p.key, msg: msg });
    });
    m.calcIssues = issues;
    if (!issues.length) m.lowPrecision = false;
    if (!silent) renderManualEntry();
  }

  function validateManualForm(fieldOnly) {
    var m = entryState().manual;
    if (!m) return true;
    var errs = {};
    ENTRY_MANUAL_FIELDS.forEach(function (f) {
      if (fieldOnly && f.key !== fieldOnly) return;
      if (!f.req && !String(m.form[f.key] || "").trim()) return;
      var r = validateEntryField(f.key, m.form[f.key]);
      if (!r.ok) errs[f.key] = r.msg;
    });
    if (fieldOnly) {
      delete m.errors[fieldOnly];
      if (errs[fieldOnly]) m.errors[fieldOnly] = errs[fieldOnly];
    } else {
      m.errors = errs;
    }
    return Object.keys(m.errors).length === 0;
  }

  /* 局部刷新校验提示：不重建 DOM，避免输入框失焦 / 弹窗滚动位置被重置 */
  function refreshManualErrors() {
    var m = entryState().manual;
    var mask = document.getElementById("rwEntryMask");
    if (!m || !mask) return;
    mask.querySelectorAll("[data-rw-ef]").forEach(function (el) {
      var host = el.closest(".rw-field");
      if (!host) return;
      var err = m.errors[el.getAttribute("data-rw-ef")];
      host.classList.toggle("is-error", !!err);
      var old = host.querySelector(".rw-field-err");
      if (old && old.parentNode) old.parentNode.removeChild(old);
      if (err) {
        var p = document.createElement("span");
        p.className = "rw-field-err";
        p.textContent = err;
        host.appendChild(p);
      }
    });
    mask.querySelectorAll("[data-rw-ec]").forEach(function (el) {
      var k = el.getAttribute("data-rw-ec");
      var host = el.closest(".rw-field");
      if (!host) return;
      var bad = m.calcIssues.filter(function (x) { return x.key === k; })[0];
      var p = ENTRY_CALC_PARAMS.filter(function (x) { return x.key === k; })[0] || {};
      host.classList.toggle("is-error", !!bad);
      var tip = host.querySelector(".rw-field-tip");
      if (tip) {
        tip.textContent = bad ? bad.msg : ("标准：" + p.std);
        tip.classList.toggle("rw-error", !!bad);
      }
    });
  }

  /* 勾选态可视化（不重渲染页面，只切 is-on） */
  function markChecked(el) {
    if (el.type === "radio") {
      var nm = el.getAttribute("name") || "";
      document.querySelectorAll('input[type="radio"][name="' + nm + '"]').forEach(function (r) {
        var h = r.closest(".rw-method");
        if (h) h.classList.toggle("is-on", r === el);
      });
      return;
    }
    var host = el.closest(".rw-method") || el.closest(".rw-check") || el.closest(".rw-ds");
    if (host) host.classList.toggle("is-on", !!el.checked);
  }

  function submitManualEntry() {
    var e = entryState();
    var m = e.manual;
    if (!m) return;
    if (!validateManualForm()) {
      renderManualEntry();
      toast("存在字段校验未通过，请修正后再提交", "err");
      return;
    }
    recomputeCalcIssues(true);
    /* 字段随材料配置变化，这里按当前材料的字段定义逐项落库 */
    var rec = { id: nextEntryId(m.form.dataType) };
    ENTRY_MANUAL_FIELDS.forEach(function (f) { rec[f.key] = m.form[f.key]; });
    rec.formula = m.form.formula || "";
    rec.dataType = m.form.dataType || "";
    rec.calc = Object.assign({}, m.calc);
    rec.quality = m.lowPrecision ? "低精度" : (m.calcIssues.length ? "低精度" : "高精度");
    rec.source = "手动录入";
    rec.sourceName = (ENTRY_SOURCES.filter(function (x) { return x.key === m.sourceKey; })[0] || {}).name || "-";
    rec.sourceType = m.sourceKey;
    rec.taskId = m.taskId;
    /* 关联配置规范：勾选的标准化处理规则随记录落库，审核时逐条对照 */
    rec.stdRules = (m.stdRules || []).slice();
    rec.stdRuleNames = rec.stdRules.map(stdRuleName);
    rec.status = "待审核";
    rec.audit = { auto: "", first: "", final: "", reason: "" };
    rec.createdAt = nowText();
    rec.auditedAt = "";
    e.records.unshift(rec);
    if (m.taskId && getS().entryDone.indexOf(m.taskId) < 0) getS().entryDone.push(m.taskId);
    e.view = "audit";
    e.manual = null;
    closeMask("rwEntryMask");
    renderRwPage();
    toast("已提交审核：" + rec.id + "（唯一标识已生成）", "ok");
  }

  /* ==========================================================================
     资源管理三模块：数据统计 / 权限管理 / 流程管理（2026-10-08 新增）
     内容对应功能描述第（3）（4）（5）条原文要求。
     ========================================================================== */

  /* ---------------------------------------------- （3）数据统计：库容监测口径 */
  /* 与 64-ingest-closure.js 的招标量与容量口径保持一致，避免各页数字自相矛盾 */
  var ENTRY_STATS = {
    twod: { entries: 30600, used: 1.42, total: 5.0, periodic: 1240 },
    opto: { entries: 3880, used: 0.36, total: 5.0, periodic: 260 },
    electrolyte: { entries: 10250, used: 0.88, total: 5.0, periodic: 520 },
    mlff: { entries: 25200, used: 1.65, total: 5.0, periodic: 980 },
    catalyst: { entries: 34920, used: 1.94, total: 5.0, periodic: 1360 }
  };
  function statOf() { return ENTRY_STATS[CFG_KEY] || ENTRY_STATS.twod; }

  function fmtNum(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

  function usageBar(pct, warn) {
    return '<div style="margin-top:8px"><div style="display:flex;justify-content:space-between;font-size:12px;color:#5b7292">'
      + "<span>硬件空间占用率</span><b style=\"color:" + (warn ? "#b26a00" : "#165DFF") + "\">" + pct + "%</b></div>"
      + '<div style="height:10px;border-radius:999px;background:#eef3fb;overflow:hidden;margin-top:4px">'
      + '<div style="height:100%;width:' + pct + "%;background:linear-gradient(90deg," + (warn ? "#ff9a2e,#ffc069" : "#165DFF,#4d8bff") + ')"></div></div></div>';
  }

  function renderEntryStats() {
    var st = statOf();
    var e = entryState();
    var free = Math.max(0, st.total - st.used);
    var pct = Math.round(st.used / st.total * 100);
    var warn = pct >= 80;
    var dedup = {
      head: ["去重机制", "执行周期", "上期执行", "上期删除重复", "下次执行", "状态"],
      rows: [
        ["重复数据辨别与删除", LOOP_DEDUP_CYCLE, "2026-09-08 02:00", "126 条", "2026-10-08 02:00", "运行中"],
        ["条目数量实时统计", "实时", nowText(), "-", "持续", "运行中"],
        ["占用空间采样", "每日", "2026-10-08 01:00", "-", "2026-10-09 01:00", "运行中"]
      ]
    };
    return '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>（3）数据统计 · 数据库容量与条目监测</h3>'
      + "<p>随着大量数据逐步入库，数据库大小快速增长；监测系统实时统计条目数量与占用空间，并按固定周期（"
      + esc(LOOP_DEDUP_CYCLE) + "）辨别和删除重复数据，向数据库维护人员汇报。</p></div>"
      + '<div style="flex:0 0 auto"><button class="rw-btn" type="button" data-rw-act="entry-view" data-view="todo">← 返回待录入数据</button></div></div>'

      + '<div class="rw-banner"><span>ⓘ</span><div>监测系统实时统计库内现有数据，并以固定周期（'
      + esc(LOOP_DEDUP_CYCLE) + '）对可能存在的重复数据进行辨别和删除，防止库容被冗余数据占用。</div></div>'

      + '<div class="rw-section-title">① 实时统计结果</div>'
      + '<div class="rw-kv">'
      + "<div><b>现有数据条目</b>" + fmtNum(st.entries) + " 条</div>"
      + "<div><b>本周期新增</b>" + fmtNum(st.periodic) + " 条</div>"
      + "<div><b>当前占用硬件空间</b>" + st.used.toFixed(2) + " TB</div>"
      + "<div><b>剩余硬件空间</b>" + free.toFixed(2) + " TB / " + st.total.toFixed(2) + " TB</div>"
      + "<div><b>本页已录入记录</b>" + e.records.length + " 条</div>"
      + "<div><b>统计时间</b>" + esc(nowText()) + "</div>"
      + "</div>"
      + usageBar(pct, warn)
      + (warn
        ? '<div class="rw-banner rw-banner--warn" style="margin-top:12px"><span>⚠</span><div>占用率已达 '
          + pct + '%，请维护人员及时管控数据录入并评估硬件扩容。</div></div>'
        : '<div class="rw-banner" style="margin-top:12px"><span>✓</span><div>当前占用率 '
          + pct + '%，硬件空间充足；维护人员仍可按月度趋势提前规划扩容。</div></div>')

      + '<div class="rw-section-title" style="margin-top:16px">② 定期去重（固定周期 ' + esc(LOOP_DEDUP_CYCLE) + '）</div>'
      + tableHtml(dedup)

      + '<div class="rw-section-title" style="margin-top:16px">③ 向数据库维护人员汇报</div>'
      + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>汇报项</th><th>当前值</th><th>处置建议</th></tr></thead><tbody>'
      + "<tr><td><b>现有数据总量</b></td><td>" + fmtNum(st.entries) + " 条</td><td>作为录入与扩容的基础口径，按周复核</td></tr>"
      + "<tr><td><b>当前占用硬件空间总量</b></td><td>" + st.used.toFixed(2) + " TB</td><td>超过 80% 时启动扩容评估</td></tr>"
      + "<tr><td><b>剩余硬件空间总量</b></td><td>" + free.toFixed(2) + " TB</td><td>低于 1 TB 时限制大规模录入</td></tr>"
      + "</tbody></table></div>"
      + '<div class="rw-card-note" style="margin-top:12px">维护人员需根据当前硬件使用状况，及时管理对数据库的录入和硬件扩容。</div>'
      + "</div>";
  }

  /* ---------------------------------------------- （4）权限管理：分级权限 */
  function renderEntryPerm() {
    var perm = getS().approvals && getS().approvals["perm"];
    var permBanner = perm
      ? '<div class="rw-banner" style="margin-bottom:14px"><span>✓</span><div>数据录入权限申请已于 ' + esc(perm.at) + ' 提交，当前状态：' + esc(perm.status) + "；管理员审核通过后即可执行录入。</div></div>"
      : '<div class="rw-banner" style="margin-bottom:14px"><span>ⓘ</span><div>大规模录入前，请先提交权限申请，由管理员按角色授予相应读写权限。</div></div>';

    return '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>（4）权限管理 · 用户分级与授权</h3>'
      + "<p>不同用户对数据库的访问与修改取决于被赋予的权限；为防止数据丢失、以及过于密集的数据请求对数据库造成过大压力，按等级区分用户权限。</p></div>"
      + '<div style="flex:0 0 auto"><button class="rw-btn" type="button" data-rw-act="entry-view" data-view="todo">← 返回待录入数据</button></div></div>'

      + permBanner
      + '<div class="rw-section-title">① 用户等级与权限矩阵</div>'
      + tableHtml(LOOP_PERM)

      + '<div class="rw-section-title" style="margin-top:16px">② 权限分级说明</div>'
      + '<div class="rw-steps">'
      + [
        ["系统管理员拥有对于数据库的最高读写权限", "可读取、修改、删除全部数据，并配置其他角色权限"],
        ["管理员又可授予数据库维护员读取和修改相应数据库的权限", "授权范围限定到具体数据库，到期自动回收"],
        ["高级用户拥有对数据库密集读取数据的权限", "允许高频 / 批量检索与下载，需限制并发峰值"],
        ["普通用户仅拥有对数据库的正常频次的读取权限", "无写入权限，超出频次触发限流"]
      ].map(function (x, i) {
        return '<div class="rw-step-row"><div class="rw-step-idx">' + (i + 1) + '</div><div><div><b style="font-size:14px;color:#22364f">'
          + esc(x[0]) + '</b></div><div class="rw-field-tip">' + esc(x[1]) + "</div></div></div>";
      }).join("")
      + "</div>"

      + '<div class="rw-section-title" style="margin-top:16px">③ 权限授予链路</div>'
      + chainHtml(["系统管理员（内置最高权限）", "授予数据库维护员读取 / 修改权限", "授予高级用户密集读取权限", "普通用户默认正常频次读取", "到期 / 任务完成后回收"])
      + '<div style="margin-top:14px"><button class="rw-btn rw-btn--primary" type="button" data-rw-act="entry-apply-perm">提交数据录入权限申请</button></div>'
      + "</div>";
  }

  /* ---------------------------------------------- （5）流程管理：四类日常流程 */
  function renderEntryFlow() {
    var perm = getS().approvals && getS().approvals["perm"];
    return '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>（5）流程管理 · 数据库日常运行流程</h3>'
      + "<p>为维护数据库正常运行，对日常运行建立流程管理：人员权限审批、数据录入审批、操作工单备案、定期备份。</p></div>"
      + '<div style="flex:0 0 auto"><button class="rw-btn" type="button" data-rw-act="entry-view" data-view="todo">← 返回待录入数据</button></div></div>'

      /* 1）人员权限审批 */
      + '<div class="rw-card" style="margin:0 0 14px;border-color:#e6ecf5">'
      + '<div class="rw-card-head"><div><h3>① 人员权限审批</h3>'
      + "<p>对拥有修改数据库权限的工作人员进行相应培训，确保其满足维护数据库的技术要求及安全意识。</p></div>"
      + '<div style="flex:0 0 auto"><button class="rw-btn rw-btn--primary" type="button" data-rw-act="entry-apply-perm">提交权限申请</button></div></div>'
      + (perm
        ? '<div class="rw-banner" style="margin-bottom:12px"><span>✓</span><div>最近一次权限申请：' + esc(perm.at) + "，当前状态：" + esc(perm.status) + "。</div></div>"
        : "")
      + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>审批环节</th><th>要求</th><th>责任人</th><th>结果</th></tr></thead><tbody>'
      + "<tr><td><b>技术培训</b></td><td>掌握数据库结构、字段规范与录入工具使用</td><td>数据库维护员</td><td>培训记录归档</td></tr>"
      + "<tr><td><b>技术能力考核</b></td><td>满足维护数据库的技术要求（参数合规、异常处理）</td><td>系统管理员</td><td>考核通过</td></tr>"
      + "<tr><td><b>安全意识审核</b></td><td>数据备份、误操作防范与保密要求</td><td>系统管理员</td><td>签署承诺书</td></tr>"
      + "<tr><td><b>权限授予</b></td><td>按最小必要原则授予读取 / 修改权限</td><td>系统管理员</td><td>到期自动回收</td></tr>"
      + "</tbody></table></div>"
      + '<div style="margin-top:12px">' + chainHtml(["提出申请", "技术培训与考核", "安全意识审核", "管理员审批", "授予权限", "到期回收"]) + "</div>"
      + "</div>"

      /* 2）数据录入审批 */
      + '<div class="rw-card" style="margin:0 0 14px;border-color:#e6ecf5">'
      + '<div class="rw-card-head"><div><h3>② 数据录入审批</h3>'
      + "<p>对于大规模的数据录入，应该进行事先的数据质量审核，防止错误数据污染数据库。</p></div></div>"
      + '<div style="margin-bottom:12px">' + chainHtml(["提交大规模录入申请", "事先数据质量审核", "管理员审批通过", "执行数据录入", "结果复核", "归档备案"]) + "</div>"
      + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>审核项</th><th>审核内容</th><th>判定</th><th>处置</th></tr></thead><tbody>'
      + "<tr><td><b>来源准确性</b></td><td>第三方数据库每批次抽样调查对比</td><td>偏差 &lt; 5%</td><td>不达标则退回</td></tr>"
      + "<tr><td><b>录入汇总整合性</b></td><td>统一存储格式，确保可检索</td><td>格式一致</td><td>转格式后重录</td></tr>"
      + "<tr><td><b>数据及时性</b></td><td>计算结果 30 天内更新入库</td><td>在有效期内</td><td>超期重新计算</td></tr>"
      + "<tr><td><b>字段完整性</b></td><td>必填字段齐全、单位与量纲统一</td><td>缺失率 &lt; 3%</td><td>标记待补充</td></tr>"
      + "</tbody></table></div>"
      + "</div>"

      /* 3）操作工单备案 */
      + '<div class="rw-card" style="margin:0 0 14px;border-color:#e6ecf5">'
      + '<div class="rw-card-head"><div><h3>③ 操作工单备案</h3>'
      + "<p>对于数据录入和删除操作，要进行操作行为和工单号的具体对应，从而在数据出错时更好地回溯错误发生的时间及相应负责人员。</p></div></div>"
      + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>工单号</th><th>操作类型</th><th>操作对象</th><th>操作人</th><th>审批人</th><th>操作时间</th><th>状态</th></tr></thead><tbody>'
      + workOrderRows().map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("")
      + "</tbody></table></div>"
      + '<div class="rw-card-note" style="margin-top:10px">录入 / 删除操作与工单号一一对应，出错时可按工单号回溯操作时间与责任人。</div>'
      + "</div>"

      /* 4）定期备份 */
      + '<div class="rw-card" style="margin:0;border-color:#e6ecf5">'
      + '<div class="rw-card-head"><div><h3>④ 定期备份</h3>'
      + "<p>为尽量减少硬件故障和人员误操作给数据库带来的伤害，应当定期对数据库进行备份工作。</p></div></div>"
      + tableHtml(LOOP_BACKUP)
      + '<div style="margin-top:12px">' + chainHtml(["定时触发备份", "全量 / 增量快照", "完整性校验", "异地留存", "恢复演练"]) + "</div>"
      + "</div>"
      + "</div>";
  }

  /* ================================================== 录入审核弹窗（2026-10-08 新增）
     管理员点击列表「审核」→ 弹窗展示该条录入的全部内容（基本信息 / 字段值 / 计算参数 /
     关联配置规范 / 已有审核结果），填写审核是否通过 + 审核建议后提交，记录状态随之流转。 */
  function entryAuditRec() {
    var e = entryState();
    if (!e.auditId) return null;
    return e.records.filter(function (r) { return r.id === e.auditId; })[0] || null;
  }

  function entryKv(label, value) {
    return "<div><b>" + esc(label) + "</b>" + esc(value == null || value === "" ? "-" : value) + "</div>";
  }

  function renderEntryAuditModal() {
    ensureStyle();
    var r = entryAuditRec();
    if (!r) return;
    closeMask("rwEntryAuditMask");
    var mask = document.createElement("div");
    mask.className = "rw-mask";
    mask.id = "rwEntryAuditMask";
    mask.setAttribute("data-rw-root", "entryAudit");
    mask.addEventListener("click", function (ev) { if (ev.target === mask) closeMask("rwEntryAuditMask"); });

    /* 字段明细：按当前材料的列定义展示 */
    var fieldRows = listCols().map(function (c) {
      var v = r[c.key];
      return "<tr><td><b>" + esc(c.label) + "</b></td><td>" + esc(v == null || v === "" ? "-" : v) + esc(c.unit || "") + "</td></tr>";
    }).join("");
    var calcRows = Object.keys(r.calc || {}).map(function (k) {
      return "<tr><td><b>" + esc(k) + "</b></td><td>" + esc(r.calc[k]) + "</td></tr>";
    }).join("");
    var stdHtml = (r.stdRuleNames && r.stdRuleNames.length)
      ? '<div class="rw-std-wrap"><div class="rw-std-top"><span>已关联 <b>' + r.stdRuleNames.length + "</b> 条规范</span></div>"
        + '<div class="rw-std-items">' + r.stdRuleNames.map(function (n) {
            return '<div class="rw-std-item is-on"><div><div class="rw-std-item-title">' + esc(n) + "</div></div></div>";
          }).join("") + "</div></div>"
      : '<div class="rw-empty" style="padding:18px 0">本条记录未关联配置规范</div>';
    var prev = (r.audit && (r.audit.adminResult || r.audit.opinion))
      ? '<div class="rw-banner' + (r.audit.adminResult === "不通过" ? " rw-banner--warn" : "") + '" style="margin-top:14px"><span>'
        + (r.audit.adminResult === "不通过" ? "✕" : "✓") + "</span><div>已有审核结果：<b>" + esc(r.audit.adminResult || "-") + "</b>"
        + "，审核建议：" + esc(r.audit.opinion || "（无）")
        + (r.audit.adminAt ? "（" + esc(r.audit.adminBy || "管理员") + " · " + esc(r.audit.adminAt) + "）" : "")
        + "。重新提交将覆盖原结果。</div></div>"
      : "";

    mask.innerHTML = '<div class="rw-modal" role="dialog" aria-modal="true">'
      + '<div class="rw-modal-head"><div><h3>录入审核 · ' + esc(r.id) + "</h3>"
      + "<p>展示该条录入的全部内容，管理员填写审核是否通过及审核建议后提交。审核只需一次：通过后记录直接入库，无需二次审批。</p></div>"
      + '<div class="rw-modal-head-side"><button class="rw-modal-close" type="button" data-rw-act="entry-audit-close" aria-label="关闭">×</button></div></div>'
      + '<div class="rw-modal-body">'
      + '<div class="rw-section-title">录入内容</div>'
      + '<div class="rw-kv">'
      + entryKv("材料唯一标识", r.id)
      + entryKv("化学式 / 标识", r.formula)
      + entryKv("数据类型", r.dataType)
      + entryKv("数据来源", r.sourceName)
      + entryKv("录入方式", r.source)
      + entryKv("质量等级", r.quality)
      + entryKv("提交时间", r.createdAt)
      + entryKv("当前状态", r.status)
      + entryKv("关联采集任务", r.taskId)
      + "</div>"
      + '<div class="rw-section-title" style="margin-top:14px">字段明细</div>'
      + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>字段</th><th>取值</th></tr></thead><tbody>' + fieldRows + "</tbody></table></div>"
      + (calcRows
        ? '<div class="rw-section-title" style="margin-top:14px">计算参数</div>'
          + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>参数</th><th>取值</th></tr></thead><tbody>' + calcRows + "</tbody></table></div>"
        : "")
      + '<div class="rw-section-title" style="margin-top:14px">关联配置规范</div>' + stdHtml
      + prev
      + '<div class="rw-section-title" style="margin-top:16px">审核结果</div>'
      + '<div class="rw-form">'
      + '<div class="rw-field"><label>审核是否通过<i>*</i></label>'
      + '<div class="rw-methods" style="margin-top:2px">'
      + '<label class="rw-method"><div class="rw-method-top">'
      + '<input type="radio" name="rwEntryAuditResult" value="通过">'
      + '<span class="rw-method-title">审核通过</span></div>'
      + '<div class="rw-method-desc">审核通过后记录直接入库，无需二次审批。</div></label>'
      + '<label class="rw-method"><div class="rw-method-top">'
      + '<input type="radio" name="rwEntryAuditResult" value="不通过">'
      + '<span class="rw-method-title">审核不通过</span></div>'
      + '<div class="rw-method-desc">记录退回修改，需重新提交审核。</div></label>'
      + "</div></div>"
      + '<div class="rw-field is-full"><label>审核建议</label>'
      + '<textarea id="rwEntryAuditOpinion" placeholder="请输入审核建议，例如字段合规性、规范对照结论或退回原因…"></textarea>'
      + "</div>"
      + "</div>"
      + "</div>"
      + '<div class="rw-modal-foot">'
      + '<button class="rw-btn" type="button" data-rw-act="entry-audit-close">取消</button>'
      + '<button class="rw-btn rw-btn--primary" type="button" data-rw-act="entry-audit-submit">提交审核结果</button>'
      + "</div>"
      + "</div>";
    document.body.appendChild(mask);
  }

  function submitEntryAudit() {
    var e = entryState();
    var r = entryAuditRec();
    if (!r) return;
    var mask = document.getElementById("rwEntryAuditMask");
    if (!mask) return;
    var sel = mask.querySelector('input[name="rwEntryAuditResult"]:checked');
    if (!sel) { toast("请先选择审核是否通过", "err"); return; }
    var op = mask.querySelector("#rwEntryAuditOpinion");
    var pass = sel.value === "通过";
    var at = nowText();
    r.audit = r.audit || {};
    r.audit.adminResult = pass ? "通过" : "不通过";
    r.audit.opinion = op ? op.value.trim() : "";
    r.audit.adminAt = at;
    r.audit.adminBy = "管理员9527";
    if (pass) {
      /* 一次审批：审核通过即入库 */
      r.status = "已入库";
      r.auditedAt = at;
    } else {
      r.status = "已退回";
      r.audit.reason = r.audit.opinion;
    }
    closeMask("rwEntryAuditMask");
    e.auditId = "";
    e.view = "audit";
    renderRwPage();
    toast("录入审核已提交：" + r.id + " → " + r.status, pass ? "ok" : "err");
  }

  /* ---------------------------------------------------------- 批量导入弹窗 */
  var BATCH_STEPS = ["选择数据来源", "上传数据包 / 配置 API", "解析与字段映射", "自动审核", "确认入库"];

  function openBatchEntry(sourceKey) {
    var e = entryState();
    e.batch = {
      step: 1,
      sourceKey: sourceKey || "mp",
      apiUrl: "",
      files: [],
      running: false,
      log: [],
      fileList: [],
      mapping: [],
      rows: [],
      fails: [],
      stage: 0,
      done: false,
      demo: "normal",
      speed: true
    };
    renderBatchEntry();
  }

  function renderBatchEntry() {
    ensureStyle();
    var e = entryState();
    var b = e.batch;
    if (!b) return;
    var mask = document.getElementById("rwBatchMask");
    if (!mask) {
      mask = document.createElement("div");
      mask.className = "rw-mask";
      mask.id = "rwBatchMask";
      mask.setAttribute("data-rw-root", "batchForm");
      mask.addEventListener("click", function (ev) { if (ev.target === mask) closeMask("rwBatchMask"); });
      document.body.appendChild(mask);
    }
    mask.innerHTML = '<div class="rw-modal" role="dialog" aria-modal="true">'
      + '<div class="rw-modal-head"><div><h3>批量导入录入</h3><p>定制插件 / 自动化流程：解析 → 字段映射 → 自动审核 → 确认入库</p></div>'
      + '<div class="rw-modal-head-side"><button class="rw-modal-close" type="button" data-rw-act="batch-close">×</button></div></div>'
      + batchStepbar(b.step)
      + '<div class="rw-modal-body">' + batchBodyHtml(b) + "</div>"
      + batchFootHtml(b)
      + "</div>";
  }

  function batchStepbar(step) {
    return '<div class="rw-stepbar">' + BATCH_STEPS.map(function (l, i) {
      var cls = step === i + 1 ? "is-active" : (step > i + 1 ? "is-done" : "");
      return '<div class="rw-stepbar-item ' + cls + '"><span class="dot">' + (step > i + 1 ? "✓" : i + 1) + "</span>" + esc(l) + "</div>"
        + (i < BATCH_STEPS.length - 1 ? '<div class="rw-stepbar-line"></div>' : "");
    }).join("") + "</div>";
  }

  function batchBodyHtml(b) {
    var src = ENTRY_SOURCES.filter(function (x) { return x.key === b.sourceKey; })[0] || ENTRY_SOURCES[0];
    if (b.step === 1) {
      return '<div class="rw-section-title">选择数据来源类型</div>'
        + '<div class="rw-db-list">' + ENTRY_SOURCES.map(function (s) {
          var on = b.sourceKey === s.key;
          return '<div class="rw-db' + (on ? " is-on" : "") + '" data-rw-act="batch-source" data-source="' + s.key + '" style="cursor:pointer">'
            + '<div class="rw-db-top"><span class="rw-db-name">' + esc(s.name) + "</span>"
            + '<span class="rw-db-meta">' + esc(s.rule) + "</span>"
            + '<span class="rw-db-right"><span class="rw-tag ' + (on ? "rw-tag--open" : "rw-tag--gray") + '">' + (on ? "已选择" : esc(s.rec)) + "</span></span></div>"
            + '<div class="rw-field-tip" style="margin-top:6px">推荐录入方式：' + esc(s.rec) + "　·　解析插件：" + esc(s.plugin) + "　·　人工介入点：" + esc(s.point) + "</div></div>";
        }).join("") + "</div>";
    }
    if (b.step === 2) {
      return '<div class="rw-banner"><span>▸</span><div>数据来源：<b>' + esc(src.name) + "</b>　系统自动识别规则：" + esc(src.rule) + "　解析插件：" + esc(src.plugin) + "</div></div>"
        + '<div class="rw-form">'
        + '<div class="rw-field is-full"><label>API 地址（配置 API 方式）</label>'
        + '<input type="text" data-rw-bf="apiUrl" placeholder="https://api.materialsproject.org/v1/materials" value="' + esc(b.apiUrl || "https://api.materialsproject.org/v1/materials") + '"></div>'
        + "</div>"
        + '<div class="rw-upload-zone" style="margin-top:14px"><strong>或上传数据包（ZIP）</strong>'
        + "<span>数据包需包含结构文件与性质文件，系统将解压并列出文件清单</span>"
        + '<div style="margin-top:10px;display:flex;gap:10px;justify-content:center">'
        + '<button class="rw-btn rw-btn--sm rw-btn--ghost" type="button" data-rw-act="batch-demo-files">填充示例数据包</button>'
        + '<button class="rw-btn rw-btn--sm" type="button" data-rw-act="batch-clear-files">清空</button>'
        + "</div></div>"
        + (b.files.length
          ? '<div class="rw-upload-grid" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr))">' + b.files.map(function (f) {
            return '<div class="rw-upload-slot is-ok"><b>' + esc(f) + "</b><span>已就绪</span></div>";
          }).join("") + "</div>"
          : "")
        + '<div class="rw-field-tip" style="margin-top:10px">点击「解析数据包」后系统执行：解压 → 文件完整性检查 → 依数据源类型匹配解析器。</div>'
        + (b.log.length ? renderBatchLog(b) : "");
    }
    if (b.step === 3) {
      return renderBatchStageChain(b)
        + '<div class="rw-section-title" style="margin-top:16px">文件清单（完整性检查）</div>'
        + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>文件名称</th><th>类型</th><th>大小</th><th>完整性</th></tr></thead><tbody>'
        + b.fileList.map(function (f) {
          return "<tr><td>" + esc(f.name) + "</td><td>" + esc(f.type) + "</td><td>" + esc(f.size) + "</td><td>"
            + (f.ok ? '<span class="rw-tag rw-tag--done">完整</span>' : '<span class="rw-tag rw-tag--fail">缺失 / 损坏</span>') + "</td></tr>";
        }).join("") + "</tbody></table></div>"
        + '<div class="rw-section-title" style="margin-top:16px">字段映射结果（按录入规范表 1.2 节）</div>'
        + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>来源字段</th><th>标准字段</th><th>类型转换</th><th>映射状态</th></tr></thead><tbody>'
        + b.mapping.map(function (m2) {
          return "<tr><td>" + esc(m2.src) + "</td><td>" + esc(m2.std) + "</td><td>" + esc(m2.cast) + "</td><td>"
            + '<span class="rw-tag ' + (m2.ok ? "rw-tag--done" : "rw-tag--warn") + '">' + (m2.ok ? "已映射" : "待人工确认") + "</span></td></tr>";
        }).join("") + "</tbody></table></div>"
        + renderBatchLog(b);
    }
    if (b.step === 4) {
      var okRows = b.rows.filter(function (r) { return !r.bad; });
      var badRows = b.rows.filter(function (r) { return r.bad; });
      return renderBatchStageChain(b)
        + '<div class="rw-section-title" style="margin-top:16px">自动审核结果（交叉对比 + 可重复性 + 格式统一）</div>'
        + '<div class="rw-kv"><div><b>总条数</b>' + b.rows.length + "</div><div><b>通过</b>" + okRows.length + " 条</div>"
        + "<div><b>失败</b>" + badRows.length + " 条</div><div><b>审核规则</b>第 2.2.3 节</div></div>"
        + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>材料</th><th>数据类型</th><th>交叉对比</th><th>可重复性</th><th>格式统一</th><th>审核状态</th><th>操作</th></tr></thead><tbody>'
        + b.rows.map(function (r, i) {
          return "<tr><td>" + esc(r.formula) + "</td><td>" + esc(r.dataType) + "</td>"
            + "<td>" + esc(r.cross) + "</td><td>" + esc(r.repeat) + "</td><td>" + esc(r.fmt) + "</td>"
            + '<td><span class="rw-tag ' + (r.bad ? "rw-tag--fail" : "rw-tag--done") + '">' + (r.bad ? "审核失败" : "通过") + "</span></td>"
            + '<td class="rw-nowrap">' + (r.bad ? '<button class="rw-op" type="button" data-rw-act="batch-fix-row" data-row="' + i + '">人工处理</button>' : "") + "</td></tr>";
        }).join("") + "</tbody></table></div>"
        + (badRows.length ? '<div class="rw-banner rw-banner--warn" style="margin-top:12px"><span>⚠</span><div>失败条目需人工处理：可在上表点击「人工处理」修正字段，或剔除该条目后继续入库。</div></div>' : "")
        + renderBatchLog(b);
    }
    /* 步骤 5：确认入库 */
    var okRows2 = b.rows.filter(function (r) { return !r.bad; });
    return renderBatchStageChain(b)
      + '<div class="rw-banner"><span>▸</span><div>确认以下批处理结果，点击「确认入库」生成材料唯一标识并进入审核队列。</div></div>'
      + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>预生成唯一标识</th><th>标识</th><th>数据类型</th>' + listThs() + '<th>质量等级</th></tr></thead><tbody>'
      + okRows2.map(function (r, i) {
        return '<tr><td class="rw-id">' + esc(r.id) + "</td><td>" + esc(r.formula || "-") + "</td><td>" + esc(r.dataType || "-") + "</td>"
          + listTds(r) + "<td>" + esc(r.quality) + "</td></tr>";
      }).join("") + "</tbody></table></div>"
      + '<div class="rw-form" style="margin-top:14px"><div class="rw-field"><label>入库后审核入口</label>'
      + '<input type="text" readonly value="管理员审核（一次审批，通过即入库）"></div>'
      + '<div class="rw-field"><label>本次批量导入条数</label><input type="text" readonly value="' + okRows2.length + ' 条"></div></div>';
  }

  function renderBatchStageChain(b) {
    return '<div class="rw-section-title">处理状态流转</div>' + chainHtml(AUDIT_BATCH_STAGES.map(function (s, i) {
      var cls = i < b.stage ? "is-end" : (i === b.stage ? "" : "");
      return { text: s, cls: cls };
    }));
  }

  function renderBatchLog(b) {
    var log = b.log.length
      ? b.log.map(function (l) {
        return '<div class="rw-log-line' + (l.kind ? " is-" + l.kind : "") + '"><span class="rw-log-time">' + esc(l.time) + "</span>" + esc(l.text) + "</div>";
      }).join("")
      : '<div class="rw-log-line"><span class="rw-log-time">--:--</span>等待开始…</div>';
    return '<div class="rw-run"><div class="rw-run-head"><span>处理日志</span>'
      + '<label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#54637c">'
      + '<input type="checkbox" data-rw-bf="speed"' + (b.speed ? " checked" : "") + "> 演示加速</label></div>"
      + '<div class="rw-log">' + log + "</div></div>";
  }

  function batchFootHtml(b) {
    var left = '<span class="rw-foot-tip">' + (b.running ? "处理中，请稍候…" : "") + "</span>";
    if (b.step === 1) {
      return '<div class="rw-modal-foot">' + left
        + '<button class="rw-btn" type="button" data-rw-act="batch-close">取消</button>'
        + '<button class="rw-btn rw-btn--primary" type="button" data-rw-act="batch-next">下一步</button></div>';
    }
    if (b.step === 2) {
      return '<div class="rw-modal-foot">' + left
        + '<button class="rw-btn" type="button" data-rw-act="batch-prev">上一步</button>'
        + '<button class="rw-btn rw-btn--primary" type="button" data-rw-act="batch-parse"' + (b.running ? " disabled" : "") + ">解析数据包</button></div>";
    }
    return '<div class="rw-modal-foot">' + left
      + '<button class="rw-btn" type="button" data-rw-act="batch-prev">上一步</button>'
      + (b.step < 5
        ? '<button class="rw-btn rw-btn--primary" type="button" data-rw-act="batch-next">下一步</button>'
        : '<button class="rw-btn rw-btn--primary" type="button" data-rw-act="batch-confirm">确认入库</button>')
      + "</div>";
  }

  function closeMask(id) {
    var m = document.getElementById(id);
    if (m && m.parentNode) m.parentNode.removeChild(m);
  }

  /* ------------------------------------------------- 批量导入：解析与执行 */
  function batchLog(b, kind, text) {
    b.log.push({ kind: kind || "", text: text, time: nowText() });
    var box = document.querySelector("#rwBatchMask .rw-log");
    if (box) {
      var line = document.createElement("div");
      line.className = "rw-log-line" + (kind ? " is-" + kind : "");
      line.innerHTML = '<span class="rw-log-time">' + esc(nowText()) + "</span>" + esc(text);
      box.appendChild(line);
      box.scrollTop = box.scrollHeight;
    }
  }

  function batchParse() {
    var e = entryState();
    var b = e.batch;
    if (!b) return;
    if (!b.files.length && !String(b.apiUrl || "").trim()) {
      toast("请先上传数据包或配置 API 地址", "err");
      return;
    }
    b.running = true;
    b.log = [];
    b.stage = 1;
    renderBatchEntry();
    var src = ENTRY_SOURCES.filter(function (x) { return x.key === b.sourceKey; })[0] || ENTRY_SOURCES[0];
    var g = b.speed ? 500 : 1500;

    batchLog(b, "", "开始解析（来源：" + src.name + "，插件：" + src.plugin + "）");
    batchLog(b, "", "解压数据包 / 建立 API 连接…");

    var attempt = 0;
    function tryApi() {
      attempt += 1;
      batchLog(b, "", "调用数据源接口 · 第 " + attempt + " 次尝试");
      if (b.demo === "apifail") {
        if (attempt <= 3) {
          batchLog(b, "err", "接口调用失败：504 Gateway Timeout（第 " + attempt + " 次）");
          batchLog(b, "warn", "将在 " + (b.speed ? 0.5 : 5) + " 秒后自动重试…");
          setTimeout(tryApi, b.speed ? 500 : 5000);
          return;
        }
        batchLog(b, "err", "重试 3 次仍失败，已记录错误日志，该批次标记「解析失败」");
        b.running = false;
        renderBatchEntry();
        toast("解析失败：已重试 3 次仍无法调用数据源接口", "err");
        return;
      }
      batchLog(b, "ok", "接口调用成功，获取文件清单");
      setTimeout(doList, g);
    }

    function doList() {
      var names = b.files.length ? b.files : ["materials.json", "structures.cif", "properties.csv", "meta.yaml"];
      b.fileList = names.map(function (n, i) {
        var ext = (n.split(".").pop() || "").toUpperCase();
        return { name: n, type: ext || "—", size: (120 + i * 260) + " KB", ok: b.demo !== "missing" || i !== 2 };
      });
      b.stage = 2;
      b.fileList.forEach(function (f) {
        if (f.ok) batchLog(b, "ok", "文件完整：" + f.name);
        else batchLog(b, "err", "文件缺失 / 损坏：" + f.name + "（完整性检查未通过）");
      });
      if (b.fileList.some(function (f) { return !f.ok; })) {
        batchLog(b, "err", "存在缺失文件，已阻断后续流程，请补齐后重新解析");
        b.running = false;
        renderBatchEntry();
        toast("文件完整性检查未通过，请补齐缺失文件", "err");
        return;
      }
      setTimeout(doMap, g);
    }

    function doMap() {
      batchLog(b, "", "调用解析插件：" + src.plugin);
      b.mapping = [
        { src: "material_id", std: "材料编号", cast: "string → string", ok: true },
        { src: "formula", std: "化学式", cast: "string → string", ok: true },
        { src: "spacegroup.symbol", std: "空间群", cast: "string → string", ok: true },
        { src: "lattice.a / b / c", std: "晶格常数 a / b / c", cast: "float → float(Å)", ok: true },
        { src: "sites.frac_coords", std: "原子坐标", cast: "array → 分数坐标", ok: true },
        { src: "band_gap", std: "带隙", cast: "float → float(eV)", ok: true },
        { src: "formation_energy", std: "形成能", cast: "float → float(eV/atom)", ok: true },
        { src: "dos_data", std: "态密度", cast: "object → JSON", ok: b.demo !== "formatbad" },
        { src: "custom_tag", std: "（未匹配标准字段）", cast: "— → —", ok: false }
      ];
      b.stage = 3;
      b.mapping.forEach(function (m2) {
        if (m2.ok) batchLog(b, "ok", "字段映射成功：" + m2.src + " → " + m2.std);
        else batchLog(b, "warn", "字段未匹配：" + m2.src + " 需人工确认");
      });
      setTimeout(doAudit, g);
    }

    function doAudit() {
      batchLog(b, "", "执行自动审核（交叉对比 + 可重复性 + 格式统一）");
      var samples = C().batchSamples || [];
      b.rows = samples.map(function (s2, i) {
        var bad = b.demo === "formatbad" && i === 2;
        var row = { id: "", quality: s2.quality };
        ENTRY_MANUAL_FIELDS.forEach(function (f) { row[f.key] = s2[f.key] != null ? s2[f.key] : ""; });
        row.metric = (s2[C().metric.key] || "-") + C().metric.unit;
        return Object.assign(row, {
          cross: bad ? "与参考库差异 12%" : "一致",
          repeat: bad ? "不可复现" : "可复现",
          fmt: bad ? "单位未统一" : "已统一",
          bad: bad
        });
      });
      b.stage = 4;
      b.rows.forEach(function (r) {
        if (r.bad) batchLog(b, "warn", "审核失败：" + r.formula + "（" + r.cross + " / " + r.repeat + " / " + r.fmt + "）");
        else batchLog(b, "ok", "审核通过：" + r.formula);
      });
      var badN = b.rows.filter(function (r) { return r.bad; }).length;
      b.running = false;
      b.step = 4;
      renderBatchEntry();
      toast(badN ? "解析完成，" + badN + " 条审核失败需人工处理" : "解析完成，全部通过", badN ? "err" : "ok");
    }

    setTimeout(tryApi, b.speed ? 350 : 900);
  }

  function batchConfirm() {
    var e = entryState();
    var b = e.batch;
    if (!b) return;
    var okRows = b.rows.filter(function (r) { return !r.bad; });
    if (!okRows.length) { toast("无通过审核的数据可入库", "err"); return; }
    okRows.forEach(function (r) {
      r.id = nextEntryId(r.dataType);
      var rec = { id: r.id };
      ENTRY_MANUAL_FIELDS.forEach(function (f) { rec[f.key] = r[f.key] != null ? r[f.key] : ""; });
      rec.formula = r.formula || "";
      rec.dataType = r.dataType || "";
      rec.metric = r.metric || "";
      rec.calc = Object.assign({}, C().manualDefaults.calc || {});
      rec.quality = r.quality;
      e.records.unshift(Object.assign(rec, {
        source: "批量导入", sourceName: (ENTRY_SOURCES.filter(function (x) { return x.key === b.sourceKey; })[0] || {}).name || "-",
        sourceType: b.sourceKey, taskId: "",
        status: "待审核", audit: { auto: "", first: "", final: "", reason: "" },
        createdAt: nowText(), auditedAt: ""
      }));
    });
    b.stage = 6;
    e.view = "audit";
    e.batch = null;
    closeMask("rwBatchMask");
    renderRwPage();
    toast("已入库 " + okRows.length + " 条，进入审核队列", "ok");
  }

  /* ---------------------------------------------------------- 录入审核操作 */
  function findRecord(id) {
    return entryRecords().filter(function (r) { return r.id === id; })[0];
  }

  function auditAuto(id) {
    var r = findRecord(id);
    if (!r) return;
    var errs = [];
    ENTRY_MANUAL_FIELDS.forEach(function (f) {
      if (!f.req) return;
      var v = validateEntryField(f.key, r[f.key]);
      if (!v.ok) errs.push(f.label + "：" + v.msg);
    });
    if (errs.length) {
      r.status = "自动校验未通过";
      r.audit.auto = "未通过：" + errs.join("；");
      toast("自动校验未通过：" + errs[0], "err");
    } else {
      r.status = "待审核";
      r.audit.auto = "通过（字段完整性 + 值域合法性校验）";
      toast("自动校验通过，等待管理员审核", "ok");
    }
    renderRwPage();
  }

  function auditBack(id, stage) {
    var r = findRecord(id);
    if (!r) return;
    var reason = window.prompt("请输入" + stage + "退回原因：", "字段与原始来源不一致，请核对后重新提交") || "未填写原因";
    r.status = "已退回";
    r.audit.reason = stage + "退回：" + reason;
    toast(r.id + " 已退回，请在详情中修正后重新提交", "err");
    renderRwPage();
  }

  function auditDetail(id) {
    var r = findRecord(id);
    if (!r) return;
    closeMask("rwRecordMask");
    var kv = [["材料唯一标识", r.id]];
    ENTRY_MANUAL_FIELDS.forEach(function (f) {
      var v = r[f.key];
      kv.push([f.label, (v == null || v === "" ? "-" : v) + (f.unit ? " " + f.unit : "")]);
    });
    kv = kv.concat([
      ["数据来源", r.sourceName || "-"], ["录入方式", r.source || "-"], ["质量等级", r.quality || "-"],
      ["审核状态", r.status], ["提交时间", r.createdAt], ["入库时间", r.auditedAt || "-"]
    ]);
    var calcRows = ENTRY_CALC_PARAMS.map(function (p) {
      return "<tr><td>" + esc(p.label) + "</td><td>" + esc(r.calc ? r.calc[p.key] : "-") + "</td><td>" + esc(p.std) + "</td></tr>";
    }).join("");
    var idx = auditStageIndex(r.status);
    var chain = chainHtml(AUDIT_STAGES.map(function (s2, i) {
      return { text: s2, cls: i < idx ? "is-end" : (i === idx ? "is-fork" : "") };
    }));
    var mask = document.createElement("div");
    mask.className = "rw-mask";
    mask.id = "rwRecordMask";
    mask.setAttribute("data-rw-root", "recordDetail");
    mask.innerHTML = '<div class="rw-modal rw-modal--narrow" style="width:min(720px,100%)">'
      + '<div class="rw-modal-head"><div><h3>' + esc(r.formula || "材料记录") + "</h3><p>" + esc(r.id) + " · 录入记录详情</p></div>"
      + '<div class="rw-modal-head-side"><button class="rw-modal-close" type="button" data-rw-act="record-close">×</button></div></div>'
      + '<div class="rw-modal-body">'
      + '<div class="rw-kv">' + kv.map(function (p) { return "<div><b>" + esc(p[0]) + "</b>" + esc(String(p[1])) + "</div>"; }).join("") + "</div>"
      + '<div class="rw-section-title" style="margin-top:14px">审核流程进度</div>' + chain
      + (r.audit.auto ? '<div class="rw-banner" style="margin-top:12px"><span>◉</span><div>自动校验：' + esc(r.audit.auto) + "</div></div>" : "")
      + (r.audit.adminResult
        ? '<div class="rw-banner' + (r.audit.adminResult === "不通过" ? " rw-banner--err" : "") + '" style="margin-top:8px"><span>◉</span><div>管理员审核：' + esc(r.audit.adminResult)
          + (r.audit.opinion ? "，审核建议：" + esc(r.audit.opinion) : "")
          + (r.audit.adminAt ? "（" + esc(r.audit.adminBy || "管理员") + " · " + esc(r.audit.adminAt) + "）" : "") + "</div></div>"
        : "")
      + (r.audit.reason ? '<div class="rw-banner rw-banner--err" style="margin-top:8px"><span>✕</span><div>' + esc(r.audit.reason) + "</div></div>" : "")
      + '<div class="rw-section-title" style="margin-top:14px">计算参数与标准阈值</div>'
      + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>参数</th><th>取值</th><th>标准阈值</th></tr></thead><tbody>' + calcRows + "</tbody></table></div>"
      + '<div class="rw-section-title" style="margin-top:14px">原子坐标（分数坐标）</div>'
      + '<div class="rw-json">' + esc(r.coords || "-").replace(/\n/g, "<br>") + "</div>"
      + "</div>"
      + '<div class="rw-modal-foot">'
      + (r.status !== "已入库" ? '<button class="rw-btn" type="button" data-rw-act="audit-ops" data-id="' + esc(r.id) + '">执行审核操作</button>' : "")
      + '<button class="rw-btn rw-btn--primary" type="button" data-rw-act="record-close">关闭</button></div>'
      + "</div>";
    mask.addEventListener("click", function (ev) { if (ev.target === mask) closeMask("rwRecordMask"); });
    document.body.appendChild(mask);
  }

  /* ==========================================================================
     资源加工工作台：新建加工任务 → 六步加工流程（每步均可实际执行）
     ========================================================================== */

  var PROC_MODELS = [
    { key: "stat", name: "统计计算模型", type: "属性数据", input: "原始性质值（带隙、形成能等）", logic: "计算均值、标准差、置信区间", out: "加工后属性数据" },
    { key: "image", name: "图像标准化模型", type: "图形数据", input: "原始图谱（能带图、态密度图）", logic: "统一坐标轴、分辨率、标注、格式", out: "标准化 PNG 图谱" },
    { key: "struct", name: "结构优化验证模型", type: "结构数据", input: "CIF / POSCAR 文件", logic: "校验原子坐标合理性、键长范围", out: "验证后的结构文件" }
  ];

  var PROC_PRODUCTS = [
    { key: "ai", name: "AI 训练数据集", op: "数据清洗 + 特征工程 + 格式转换", format: "CSV / JSON + 数据字典", use: "机器学习模型训练" },
    { key: "sci", name: "科研参考数据集", op: "数据整理 + 可视化渲染", format: "PDF 报告 + JSON", use: "科研人员查阅" },
    { key: "cross", name: "跨库融通数据集", op: "格式转换 + 元数据补全", format: "JSON（符合 OPTIMADE 格式）", use: "与主平台融通" }
  ];

  var PROC_QUALITY = [
    { key: "source", dim: "数据来源质量", method: "检查来源可信度分级", std: "来源为 1 级或 2 级", fix: "标记“来源待验证”" },
    { key: "model", dim: "加工模型质量", method: "验证模型输出与输入一致性", std: "偏差 < 5%", fix: "调整模型参数" },
    { key: "product", dim: "数据产品质量", method: "抽样检测（AQL = 1%）", std: "缺陷率 < 1%", fix: "返工处理" }
  ];

  var PROC_STEP_TITLES = ["数据策划", "基础数据筛选", "标准化预处理", "数据加工", "产品生产", "质量评价"];

  function procState() {
    var s = getS();
    if (!s.proc) {
      s.proc = { view: "jobs", seq: 0, jobs: [], activeId: "" };
      /* 2026-10-08：演示用样例数据——加工任务列表预置若干任务，避免空态 */
      s.proc.jobs = seedProcJobs();
      s.proc.seq = s.proc.jobs.length;
    }
    return s.proc;
  }

  function procJobs() { return procState().jobs; }

  function activeJob() {
    var p = procState();
    return p.jobs.filter(function (j) { return j.id === p.activeId; })[0] || null;
  }

  /* ------------------------------------------------------------------------
     2026-10-08：演示用样例数据——「加工任务」列表预置 4 条任务，
     覆盖「六步已完成 / 进行到产品生产 / 进行到标准化预处理 / 仅完成数据策划」四种进度，
     版本按规则推进（步骤 3 完成 → V1.0，步骤 5 完成 → V2.0），数据集取自数据库配置。
     ------------------------------------------------------------------------ */

  /* 加工模型执行结果样例（与 procRun(4) 的兜底逻辑保持一致） */
  function procPresetRows(key) {
    var preset = ((C().modelRows || {})[key] || []).map(function (r) { return Object.assign({}, r); });
    if (preset.length) return preset;
    if (key === "stat") {
      return [
        { item: "带隙（示例）", input: "1.62 / 1.70 / 1.72 eV", logic: "计算均值、标准差、置信区间", out: "1.68 ± 0.05 eV（95% CI：1.64 ~ 1.72）" },
        { item: "形成能（示例）", input: "-1.20 / -1.26 / -1.26 eV/atom", logic: "计算均值、标准差、置信区间", out: "-1.24 ± 0.03 eV/atom" }
      ];
    }
    if (key === "image") {
      return [
        { item: "能带图", input: "band_raw.png（1024×768，坐标轴不一致）", logic: "统一坐标轴、分辨率、标注、格式", out: "band_std.png（1600×1200，统一标注）" },
        { item: "态密度图", input: "dos_raw.png（800×600）", logic: "统一坐标轴、分辨率、标注、格式", out: "dos_std.png（1600×1200，统一标注）" }
      ];
    }
    return [
      { item: "结构文件校验", input: "structure_raw.cif", logic: "校验原子坐标合理性、键长范围", out: "structure_verified.cif（键长合理）" }
    ];
  }

  function procJobSkeleton(id, createdAt) {
    return {
      id: id,
      name: "",
      step: 1,
      version: "V0.0",
      sourceIds: [],
      spec: { purpose: "机器学习模型训练", format: "CSV / JSON + 数据字典", precision: "", productForm: "数据集（CSV / JSON）", desc: "" },
      basis: [],
      filter: { levels: ["A级", "B级"], groupByFormula: true, minPerGroup: 3, executed: false, rows: [], groups: [] },
      pre: {
        opts: { format: true, unit: true, missing: true, outlier: true },
        executed: false,
        missing: { rate: "3.4%", pass: true },
        outliers: (C().outliers || []).map(function (o) { return Object.assign({}, o); })
      },
      model: { key: "", executed: false, rows: [] },
      product: { key: "", executed: false, result: "", datasets: [] },
      quality: { items: PROC_QUALITY.map(function (q) { return { key: q.key, measured: "", ok: null, handled: "" }; }), executed: false },
      done: {},
      createdAt: createdAt,
      log: []
    };
  }

  /* 按已入库记录回填筛选结果（与 procRun(2) 同口径） */
  function procFillFilter(j, e) {
    j.filter.rows = (j.sourceIds || []).map(function (id, i) {
      var r = e.records.filter(function (x) { return x.id === id; })[0] || {};
      var v = r[C().metric.key];
      return {
        formula: r.formula || "-",
        id: id,
        dataType: r.dataType || "-",
        level: ["A级", "B级"][i % 2],
        metric: v ? (v + C().metric.unit) : "-"
      };
    });
    var map = {};
    j.filter.rows.forEach(function (r) { map[r.formula] = (map[r.formula] || 0) + 1; });
    j.filter.groups = Object.keys(map).map(function (k) {
      return { formula: k, count: map[k], pass: map[k] >= Number(j.filter.minPerGroup || 3) };
    });
    j.filter.executed = true;
  }

  function seedProcJobs() {
    var e = entryState();
    var ids = e.records.filter(function (r) { return r.status === "已入库"; }).map(function (r) { return r.id; });
    var code = C().code || "2D";
    var short = C().short || "材料";
    var ds = procDatasets();
    var pick = function (n, off) {
      return ds.slice(off || 0, (off || 0) + n).map(function (d) { return d.key; });
    };
    var T = ["2026-09-24 09:12", "2026-09-25 10:40", "2026-09-26 14:18", "2026-09-27 16:02"];
    var seqNo = 1;
    var mk = function (at) {
      var j = procJobSkeleton(code + "-PRC-2026-000" + seqNo, at);
      j.sourceIds = ids.slice(0, 3);
      seqNo += 1;
      return j;
    };

    /* ① 六步全部完成：版本 V2.0，已产出数据集并完成质量评价 */
    var j1 = mk(T[0]);
    j1.name = short + "电子结构与能带数据加工";
    j1.spec.purpose = "机器学习模型训练";
    j1.spec.desc = "对已入库的结构与计算数据统一格式与单位，产出可直接用于模型训练的数据集；验收标准：抽样缺陷率 < 1%，来源可信度 1~2 级。";
    j1.spec.precision = "带隙保留 2 位小数；能量单位统一为 eV/atom";
    j1.basis = ["calc", "file", "integ"];
    procFillFilter(j1, e);
    j1.pre.executed = true;
    j1.pre.missing = { rate: "2.1%", pass: true };
    j1.model = { key: "stat", executed: true, rows: procPresetRows("stat") };
    j1.product = {
      key: "",
      executed: true,
      datasets: pick(2, 0),
      result: pick(2, 0).map(function (k) { var d = procDatasetOf(k); return d ? d.title : k; }).join("、")
    };
    j1.quality = {
      executed: true,
      items: [
        { key: "source", measured: "来源可信度 1 级", ok: true, handled: "" },
        { key: "model", measured: "调整模型参数后偏差 3.1%", ok: true, handled: "已调整模型参数" },
        { key: "product", measured: "抽样缺陷率 0.4%", ok: true, handled: "" }
      ]
    };
    j1.done = { 1: T[0], 2: "2026-09-24 09:40", 3: "2026-09-24 10:05", 4: "2026-09-24 10:52", 5: "2026-09-24 11:26", 6: "2026-09-24 14:08" };
    j1.step = 6;
    j1.version = "V2.0";

    /* ② 进行到「产品生产」：前四步已完成，版本 V1.0 */
    var j2 = mk(T[1]);
    j2.name = short + "图谱与文件数据标准化加工";
    j2.spec.purpose = "科研人员查阅";
    j2.spec.desc = "对能带图、态密度图等图谱数据统一坐标轴、分辨率与标注，产出可直接查阅的图谱数据集。";
    j2.spec.precision = "图谱分辨率统一为 1600×1200；文件格式统一为 PNG";
    j2.basis = ["calc", "file"];
    procFillFilter(j2, e);
    j2.pre.executed = true;
    j2.pre.missing = { rate: "3.4%", pass: true };
    j2.model = { key: "image", executed: true, rows: procPresetRows("image") };
    j2.done = { 1: T[1], 2: "2026-09-25 11:02", 3: "2026-09-25 11:35", 4: "2026-09-25 15:20" };
    j2.step = 5;
    j2.version = "V1.0";

    /* ③ 进行到「标准化预处理」：筛选已完成，版本 V0.0 */
    var j3 = mk(T[2]);
    j3.name = short + "结构数据校验与清洗";
    j3.spec.purpose = "与主平台融通";
    j3.spec.desc = "校验结构文件原子坐标与键长合理性，输出符合 OPTIMADE 格式的交换数据集。";
    j3.spec.precision = "坐标保留 6 位小数；长度单位统一为 Å";
    j3.spec.format = "JSON（OPTIMADE）";
    j3.spec.productForm = "结构模型库";
    j3.basis = ["file", "integ"];
    procFillFilter(j3, e);
    j3.done = { 1: T[2], 2: "2026-09-26 14:50" };
    j3.step = 3;
    j3.version = "V0.0";

    /* ④ 刚创建：仅完成数据策划前的信息填写，停在步骤 1 */
    var j4 = mk(T[3]);
    j4.name = short + "性质数据集成加工（待执行）";
    j4.spec.purpose = "内部质量分析";
    j4.spec.desc = "汇总多来源性质数据做一致性比对，用于内部数据质量分析。";
    j4.spec.precision = "统一保留 3 位有效数字";
    j4.basis = ["integ"];
    j4.step = 1;
    j4.version = "V0.0";

    return [j4, j3, j2, j1];
  }

  function newJob() {
    var p = procState();
    p.seq += 1;
    var e = entryState();
    var ready = e.records.filter(function (r) { return r.status === "已入库"; });
    var job = {
      id: "PRC-" + stamp().slice(0, 4) + "-" + stamp().slice(4, 6) + stamp().slice(6, 8) + "-" + ("00" + p.seq).slice(-3),
      name: "",
      step: 1,
      version: "V0.0",
      sourceIds: ready.slice(0, 3).map(function (r) { return r.id; }),
      spec: { purpose: "", format: "", precision: "", productForm: "", desc: "" },
      basis: [],
      filter: { levels: ["A级", "B级"], groupByFormula: true, minPerGroup: 3, executed: false, rows: [], groups: [] },
      pre: {
        opts: { format: true, unit: true, missing: true, outlier: true },
        executed: false,
        missing: { rate: "3.4%", pass: true },
        outliers: (C().outliers || []).map(function (o) { return Object.assign({}, o); })
      },
      model: { key: "", executed: false, rows: [] },
      /* 2026-10-08：数据产品按数据集划分——datasets 存本次产出归入的数据集 key 列表 */
      product: { key: "", executed: false, result: "", datasets: [] },
      quality: { items: PROC_QUALITY.map(function (q) { return { key: q.key, measured: "", ok: null, handled: "" }; }), executed: false },
      done: {},
      createdAt: nowText(),
      log: []
    };
    p.jobs.unshift(job);
    p.activeId = job.id;
    p.view = "jobs";
    openProcWizard();
  }

  /* -------------------------------------------------------- 页签三：资源加工 */
  function renderProcessTab() {
    var p = procState();
    var sub = '<div class="rw-subtabs">'
      + '<button class="rw-subtab' + (p.view === "jobs" ? " is-active" : "") + '" type="button" data-rw-act="proc-view" data-view="jobs">加工任务（' + p.jobs.length + "）</button>"
      + '<button class="rw-subtab' + (p.view === "spec" ? " is-active" : "") + '" type="button" data-rw-act="proc-view" data-view="spec">加工规范说明</button>'
      + "</div>";
    /* 2026-10-08：圈红删除——「加工流程总览」与「加工产物交接（对外出口）」两块不再展示 */
    return sub + (p.view === "spec" ? renderProcessSpec() : renderProcJobs());
  }

  function renderProcJobs() {
    var p = procState();
    var e = entryState();
    var ready = e.records.filter(function (r) { return r.status === "已入库"; }).length;
    var rows = p.jobs.length
      ? p.jobs.map(function (j) {
        var pct = Math.round(Object.keys(j.done).length / 6 * 100);
        return "<tr>"
          + '<td class="rw-id">' + esc(j.id) + "</td>"
          + "<td><b>" + esc(j.name || "未命名加工任务") + "</b><div class=\"rw-field-tip\">" + esc(j.spec.purpose || "未填写目标用途") + "</div></td>"
          + '<td><span class="rw-tag rw-tag--gray">' + esc(j.version) + "</span></td>"
          + '<td>步骤 ' + j.step + '：' + esc(PROC_STEP_TITLES[j.step - 1]) + '<div class="rw-progress"><i style="width:' + pct + '%"></i></div></td>'
          + "<td>" + (j.sourceIds || []).length + " 条</td>"
          + "<td>" + esc(j.createdAt) + "</td>"
          + '<td class="rw-nowrap">'
          + '<button class="rw-op" type="button" data-rw-act="proc-open" data-id="' + esc(j.id) + '">继续加工</button>'
          + '<button class="rw-op" type="button" data-rw-act="proc-report" data-id="' + esc(j.id) + '">加工报告</button>'
          + '<button class="rw-op rw-op--danger" type="button" data-rw-act="proc-del" data-id="' + esc(j.id) + '">删除</button>'
          + "</td></tr>";
      }).join("")
      : '<tr><td colspan="7"><div class="rw-empty" style="padding:26px 0">暂无加工任务，点击「新建加工任务」按六步流程开始加工</div></td></tr>';

    return '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>加工任务工作台</h3>'
      + "<p>已入库数据 " + ready + " 条可参与加工；每个加工任务按「数据策划 → 基础数据筛选 → 标准化预处理 → 数据加工 → 产品生产 → 质量评价」六步执行，版本随阶段推进 V0.0 → V1.0 → V2.0。</p></div>"
      + '<div style="flex:0 0 auto"><button class="rw-btn rw-btn--primary" type="button" data-rw-act="proc-new">＋ 新建加工任务</button></div></div>'
      + '<div class="rw-tbl-wrap"><table class="rw-tbl rw-jobs-table"><thead><tr><th>任务ID</th><th>加工任务名称</th><th>版本</th><th>当前步骤</th><th>数据量</th><th>创建时间</th><th>操作</th></tr></thead><tbody>' + rows + "</tbody></table></div>"
      + "</div>";
  }

  function procFlowOverview() {
    var flow = PROC_FLOW.map(function (f, i) {
      return '<div class="rw-flow-node" data-rw-act="flow-jump" data-rw-step="' + i + '">'
        + '<span class="rw-flow-idx">' + (i + 1) + "</span>"
        + '<span class="rw-flow-name">' + esc(f.n) + "</span>"
        + '<span class="rw-flow-desc">' + esc(f.d) + "</span></div>"
        + (i < PROC_FLOW.length - 1 ? '<div class="rw-flow-arrow">→</div>' : "");
    }).join("");
    return '<div class="rw-card"><div class="rw-card-head"><div><h3>加工流程总览</h3><p>数据策划 → 基础数据筛选 → 标准化预处理 → 数据加工 → 产品生产 → 质量评价</p></div></div>'
      + '<div class="rw-flow">' + flow + "</div></div>";
  }

  /* ------------------------------------------------------ 加工向导（六步） */
  function openProcWizard() {
    var j = activeJob();
    if (!j) return;
    renderProcWizard();
  }

  function renderProcWizard() {
    ensureStyle();
    var j = activeJob();
    if (!j) return;
    var mask = document.getElementById("rwProcMask");
    if (!mask) {
      mask = document.createElement("div");
      mask.className = "rw-mask";
      mask.id = "rwProcMask";
      mask.setAttribute("data-rw-root", "procWizard");
      mask.addEventListener("click", function (ev) { if (ev.target === mask) closeMask("rwProcMask"); });
      document.body.appendChild(mask);
    }
    mask.innerHTML = '<div class="rw-modal" role="dialog" aria-modal="true">'
      + '<div class="rw-modal-head"><div><h3>数据加工 · ' + esc(PROC_STEP_TITLES[j.step - 1]) + "</h3>"
      + "<p>任务 " + esc(j.id) + "　当前版本 " + esc(j.version) + "　已完成 " + Object.keys(j.done).length + " / 6 步</p></div>"
      + '<div class="rw-modal-head-side">'
      + '<span class="rw-tag rw-tag--open">' + esc(j.version) + "</span>"
      + '<button class="rw-modal-close" type="button" data-rw-act="proc-close">×</button></div></div>'
      + procStepbar(j)
      + '<div class="rw-modal-body">' + procStepBody(j) + "</div>"
      + procFoot(j)
      + "</div>";
    var body = mask.querySelector(".rw-modal-body");
    if (body && j.autoScroll) { j.autoScroll = false; setTimeout(function () { body.scrollTop = body.scrollHeight; }, 40); }
  }

  function procStepbar(j) {
    return '<div class="rw-stepbar">' + PROC_STEP_TITLES.map(function (l, i) {
      /* 已完成与当前步骤可以同时成立：都打上类名，样式由 CSS 顺序决定（is-active 优先显示为蓝色） */
      var cls = (j.done[i + 1] ? "is-done " : "") + (j.step === i + 1 ? "is-active" : "");
      return '<div class="rw-stepbar-item ' + cls + '" data-rw-act="proc-goto" data-step="' + (i + 1) + '" style="cursor:' + (j.done[i + 1] || i + 1 <= j.step ? "pointer" : "default") + '">'
        + '<span class="dot">' + (j.done[i + 1] ? "✓" : i + 1) + "</span>" + esc(l) + "</div>"
        + (i < PROC_STEP_TITLES.length - 1 ? '<div class="rw-stepbar-line"></div>' : "");
    }).join("") + "</div>";
  }

  function procFoot(j) {
    /* 2026-10-08：步骤 1/2 改为点击「下一步」时校验（填写 / 勾选完成即可前进），按钮不再预禁用 */
    var autoOk = j.step <= 2;
    var canNext = !!j.done[j.step] || autoOk;
    var tip = j.done[j.step]
      ? "本步骤已完成，可进入下一步"
      : (autoOk
        ? (j.step === 1 ? "填写完成后点击「下一步」" : "勾选基础数据后点击「下一步」")
        : "<span style=\"color:#b8720f\">请先执行本步骤操作后再进入下一步</span>");
    return '<div class="rw-modal-foot"><span class="rw-foot-tip">' + tip + "</span>"
      + '<button class="rw-btn" type="button" data-rw-act="proc-close">关闭</button>'
      + '<button class="rw-btn" type="button" data-rw-act="proc-prev"' + (j.step === 1 ? " disabled" : "") + ">上一步</button>"
      + (j.step < 6
        ? '<button class="rw-btn rw-btn--primary" type="button" data-rw-act="proc-next"' + (canNext ? "" : " disabled") + ">下一步</button>"
        : '<button class="rw-btn rw-btn--primary" type="button" data-rw-act="proc-finish"' + (canNext ? "" : " disabled") + '>完成加工</button>')
      + "</div>";
  }

  function procStepBody(j) {
    if (j.step === 1) return procStep1(j);
    if (j.step === 2) return procStep2(j);
    if (j.step === 3) return procStep3(j);
    if (j.step === 4) return procStep4(j);
    if (j.step === 5) return procStep5(j);
    return procStep6(j);
  }

  /* 步骤 1 数据策划 —— 2026-10-08 精简：只保留 加工任务名称 / 目标用途 / 输出格式 /
     数据产品形式 / 内容 五项；删除原「选择参与加工的数据源」「生成规格文档」按钮与
     「前往资源录入」按钮（基础数据改在步骤 2 勾选）。 */
  function procStep1(j) {
    if (!j.spec.purpose) j.spec.purpose = "机器学习模型训练";
    if (!j.spec.format) j.spec.format = "CSV / JSON + 数据字典";
    if (!j.spec.productForm) j.spec.productForm = "数据集（CSV / JSON）";
    return '<div class="rw-section-title">数据策划</div>'
      + '<div class="rw-form">'
      + '<div class="rw-field"><label>加工任务名称<i>*</i></label><input type="text" data-rw-pf="name" placeholder="' + esc(C().procNamePh) + '" value="' + esc(j.name) + '"></div>'
      + '<div class="rw-field"><label>目标用途<i>*</i></label><select data-rw-pf="purpose">'
      + ["机器学习模型训练", "科研人员查阅", "与主平台融通", "内部质量分析"].map(function (o) { return '<option' + (j.spec.purpose === o ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("")
      + "</select></div>"
      + '<div class="rw-field"><label>输出格式<i>*</i></label><select data-rw-pf="format">'
      + ["CSV / JSON + 数据字典", "PDF 报告 + JSON", "JSON（OPTIMADE）"].map(function (o) { return '<option' + (j.spec.format === o ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("")
      + "</select></div>"
      + '<div class="rw-field"><label>数据产品形式<i>*</i></label><select data-rw-pf="productForm">'
      + ["数据集（CSV / JSON）", "结构模型库", "图谱集", "可视化分析报告"].map(function (o) { return '<option' + (j.spec.productForm === o ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("")
      + "</select></div>"
      + '<div class="rw-field is-full"><label>内容<i>*</i></label><textarea data-rw-pf="desc" placeholder="描述本次数据产品的内容、覆盖范围与验收标准…">' + esc(j.spec.desc) + "</textarea></div>"
      + "</div>"
      + (j.done[1] ? procDoneCard(j, 1) : "");
  }

  /* 步骤 2 基础数据筛选 —— 2026-10-08 重做：展示三类基础数据，勾选后进入下一步 */
  var BASIS_DATA_TYPES = [
    { key: "calc", name: "计算数据", desc: "VASP / 量子化学等计算输出数据（能量、带隙、形成能、态密度等）" },
    { key: "file", name: "文件数据", desc: "结构文件（CIF / POSCAR）、图谱与图像等文件类数据" },
    { key: "integ", name: "集成化基础数据", desc: "已入库的结构化基础数据（字段完整、格式统一、可直接检索）" }
  ];

  function procStep2(j) {
    var sel = j.basis || [];
    var cards = BASIS_DATA_TYPES.map(function (b) {
      var on = sel.indexOf(b.key) >= 0;
      return '<label class="rw-ds' + (on ? " is-on" : "") + '" style="padding:13px 15px">'
        + '<input type="checkbox" data-rw-pf="basis" data-v="' + b.key + '"' + (on ? " checked" : "") + ">"
        + '<div><div class="rw-ds-name">' + esc(b.name) + "</div>"
        + '<div class="rw-ds-desc">' + esc(b.desc) + "</div></div></label>";
    }).join("");
    return '<div class="rw-section-title">基础数据筛选</div>'
      + '<div class="rw-card-note">勾选本次加工需要纳入的基础数据类型（可多选）；勾选后点击「下一步」进入标准化预处理。</div>'
      + '<div class="rw-ds-list" style="padding-left:0">' + cards + "</div>"
      + '<div class="rw-field-tip rw-basis-count" style="margin-top:10px">已勾选 <b>' + sel.length + "</b> 类基础数据</div>"
      + (j.done[2] ? procDoneCard(j, 2) : "");
  }

  function procFilterResult(f) {
    var rows = f.rows.map(function (r) {
      return "<tr><td>" + esc(r.formula) + "</td><td>" + esc(r.id) + "</td><td>" + esc(r.dataType) + "</td><td>" + esc(r.level) + "</td><td>" + esc(r.metric || "-") + "</td></tr>";
    }).join("");
    var groups = f.groups.map(function (g) {
      return "<tr><td>" + esc(g.formula) + "</td><td>" + g.count + " 条</td><td>" + (g.pass ? '<span class="rw-tag rw-tag--done">满足</span>' : '<span class="rw-tag rw-tag--warn">不足（每组至少 3 条）</span>') + "</td></tr>";
    }).join("");
    return '<div style="margin-top:16px"><div class="rw-section-title">筛选后的数据集合</div>'
      + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>化学式</th><th>材料唯一标识</th><th>数据类型</th><th>质量等级</th><th>' + esc(C().metric.label) + '</th></tr></thead><tbody>' + rows + "</tbody></table></div></div>"
      + '<div style="margin-top:14px"><div class="rw-section-title">分组清单（按化学式）</div>'
      + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>化学式</th><th>条数</th><th>分组校验</th></tr></thead><tbody>' + groups + "</tbody></table></div></div>";
  }

  /* 步骤 3 标准化预处理 */
  function procStep3(j) {
    var p = j.pre;
    var opts = [["format", "格式统一", "CIF/POSCAR → 标准 CIF"], ["unit", "单位统一", "非标准单位 → 标准单位（第 1.4 节单位表）"],
      ["missing", "缺失值", "缺失率 ≤ 5% 时标注 “N/A”；> 5% 退回"], ["outlier", "异常值检测", "超出 3σ 范围或物理不合理"]];
    var optHtml = opts.map(function (o) {
      return '<label class="rw-check' + (p.opts[o[0]] ? " is-on" : "") + '" style="display:block;margin-bottom:8px">'
        + '<input type="checkbox" data-rw-pf="preOpt" data-v="' + o[0] + '"' + (p.opts[o[0]] ? " checked" : "") + ">"
        + "<div><b>" + esc(o[1]) + "</b><div class=\"rw-field-tip\">" + esc(o[2]) + "</div></div></label>";
    }).join("");

    var outlierRows = p.outliers.length
      ? p.outliers.map(function (o) {
        return "<tr><td>" + esc(o.name) + "</td><td>" + esc(o.value) + "</td><td>" + esc(o.sigma) + "</td>"
          + '<td><input type="text" data-rw-pf="outlierFix" data-v="' + esc(o.key) + '" placeholder="输入修正值" value="' + esc(o.fixed) + '" style="width:100%;box-sizing:border-box;min-height:32px;border:1px solid #d5dee8;border-radius:6px;padding:4px 8px"></td>'
          + '<td class="rw-nowrap">'
          + (o.keep ? '<span class="rw-tag rw-tag--warn">已标注保留</span>' : '<button class="rw-op" type="button" data-rw-act="proc-outlier-keep" data-v="' + esc(o.key) + '">标注保留</button>')
          + '<button class="rw-op" type="button" data-rw-act="proc-outlier-fix" data-v="' + esc(o.key) + '">确认修正</button>'
          + "</td></tr>";
      }).join("")
      : '<tr><td colspan="5"><div class="rw-empty" style="padding:18px 0">未检测到异常值</div></td></tr>';

    return '<div class="rw-section-title">预处理项（系统自动执行 + 人工复核）</div>'
      + optHtml
      + '<div style="margin-top:14px"><button class="rw-btn rw-btn--primary" type="button" data-rw-act="proc-run-3">执行标准化预处理</button></div>'
      + (p.executed
        ? '<div style="margin-top:16px"><div class="rw-section-title">缺失值报告</div>'
        + '<div class="rw-kv"><div><b>缺失率</b>' + esc(p.missing.rate) + "</div>"
        + "<div><b>判定</b>" + (p.missing.pass ? '<span class="rw-tag rw-tag--done">≤ 5%，标注 “N/A”</span>' : '<span class="rw-tag rw-tag--fail">> 5%，退回数据源</span>') + "</div>"
        + "<div><b>处理人</b>系统（自动执行）</div></div></div>"
        + '<div style="margin-top:14px"><div class="rw-section-title">异常值清单（人工复核）</div>'
        + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>数据项</th><th>原始值</th><th>偏离</th><th>修正值</th><th>操作</th></tr></thead><tbody>' + outlierRows + "</tbody></table></div></div>"
        : "")
      + (j.done[3] ? procDoneCard(j, 3) : "");
  }

  /* 步骤 4 数据加工 */
  function procStep4(j) {
    var m = j.model;
    var cards = PROC_MODELS.map(function (mo) {
      return '<label class="rw-method' + (m.key === mo.key ? " is-on" : "") + '">'
        + '<div class="rw-method-top"><input type="radio" name="rwProcModel" data-rw-pf="model" value="' + mo.key + '"' + (m.key === mo.key ? " checked" : "") + ">"
        + '<span class="rw-method-title">' + esc(mo.name) + "</span></div>"
        + '<div class="rw-method-desc">' + esc(mo.type) + " ｜ 输入：" + esc(mo.input) + "<br>处理逻辑：" + esc(mo.logic) + "<br>输出：" + esc(mo.out) + "</div></label>";
    }).join("");
    var result = m.executed
      ? '<div style="margin-top:16px"><div class="rw-section-title">加工结果</div>'
      + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>数据项</th><th>输入</th><th>处理逻辑</th><th>加工输出</th></tr></thead><tbody>'
      + m.rows.map(function (r) { return "<tr><td>" + esc(r.item) + "</td><td>" + esc(r.input) + "</td><td>" + esc(r.logic) + "</td><td>" + esc(r.out) + "</td></tr>"; }).join("")
      + "</tbody></table></div></div>"
      : "";
    /* 2026-10-08：模型加工完成后，产出按数据集划分，数据集清单与数据库保持一致 */
    var nextTip = m.executed
      ? '<div class="rw-field-tip" style="margin-top:10px">加工结果将在步骤「产品生产」中按数据集划分生成数据产品，数据集清单与'
        + esc(procDbName()) + "保持一致（如：" + esc(procDatasets().slice(0, 3).map(function (d) { return d.title; }).join("、")) + "）。</div>"
      : "";
    return '<div class="rw-section-title">选择加工模型 / 算法</div>'
      + '<div class="rw-methods">' + cards + "</div>"
      + '<div style="margin-top:14px"><button class="rw-btn rw-btn--primary" type="button" data-rw-act="proc-run-4">执行数据加工</button></div>'
      + result + nextTip
      + (j.done[4] ? procDoneCard(j, 4) : "");
  }

  /* 步骤 5 产品生产
     2026-10-08：数据产品按「数据集」划分——勾选本次产出归入哪些数据集，
     数据集清单与数据库（04.js LOWDIM_DB_OVERVIEW_CONFIGS）逐项对齐，字段 / 输出格式 / 存量口径一致。
     2026-10-08 圈红删除：原「选择数据产品形态」（AI 训练 / 科研参考 / 跨库融通）三卡下线，产品生产只按数据集划分。 */
  function procDbName() { return (C().short || "材料") + "数据库"; }
  function procDatasets() { return C().datasets || []; }
  function procDatasetOf(key) {
    return procDatasets().filter(function (d) { return d.key === key; })[0] || null;
  }

  function procStep5(j) {
    var pr = j.product;
    var picked = pr.datasets || [];
    var ds = procDatasets();
    var dbName = procDbName();
    var dsCards = ds.length
      ? ds.map(function (d) {
        var on = picked.indexOf(d.key) >= 0;
        return '<label class="rw-pds' + (on ? " is-on" : "") + '">'
          + '<div class="rw-pds-top"><input type="checkbox" data-rw-pf="productDs" data-v="' + esc(d.key) + '"' + (on ? " checked" : "") + ">"
          + "<b>" + esc(d.title) + "</b></div>"
          + '<div class="rw-pds-desc">入库位置：' + esc(dbName) + " · " + esc(d.title)
          + "<br>核心字段：" + esc(d.fields.join("、"))
          + "<br>输出格式：" + esc(d.format) + " ｜ 数据集存量：" + esc(String(d.volume).replace(/\B(?=(\d{3})+(?!\d))/g, ",")) + " 条</div>"
          + '<div class="rw-field-tip">' + esc(d.desc) + "</div></label>";
      }).join("")
      : '<div class="rw-empty" style="padding:22px 0">当前材料未配置数据集</div>';

    var result = pr.executed
      ? '<div class="rw-result" style="margin-top:16px"><div class="rw-result-title">✓ 数据产品已生成（按数据集划分）</div>'
      + '<div class="rw-kv"><div><b>产出数据集</b>' + esc((pr.datasets || []).length) + " 个</div>"
      + "<div><b>版本标记</b>" + esc(j.version) + "</div></div>"
      + '<div style="margin-top:14px"><div class="rw-section-title">本次产出的数据集（' + (pr.datasets || []).length + " 个）"
      + '</div><div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>数据集</th><th>核心字段</th><th>输出格式</th><th>本次产出</th><th>入库位置</th></tr></thead><tbody>'
      + (pr.datasets || []).map(function (k2) {
        var d = procDatasetOf(k2);
        if (!d) return "";
        /* 本次产出条数：已执行筛选取筛选结果条数，否则回退到参与加工的记录数，避免出现 0 条的误读 */
        var outN = (j.filter.executed && (j.filter.rows || []).length) ? j.filter.rows.length : (j.sourceIds || []).length;
        return "<tr><td><b>" + esc(d.title) + "</b></td><td>" + esc(d.fields.join("、")) + "</td><td>" + esc(d.format) + "</td>"
          + "<td>" + esc(outN) + " 条</td><td>" + esc(dbName) + " · " + esc(d.title) + "</td></tr>";
      }).join("")
      + "</tbody></table></div></div>"
      + '<div class="rw-field-tip">元数据字段 data_version 已更新为 ' + esc(j.version) + "；各数据集按上述入库位置归档，字段与数据库保持一致。</div></div>"
      : "";

    return '<div class="rw-section-title">数据产品按数据集划分（可多选，与' + esc(dbName) + '数据集一致）</div>'
      + '<div class="rw-field-tip" style="margin-bottom:10px">已勾选 <b class="rw-ds-count">' + picked.length + "</b> / " + ds.length
      + " 个数据集；加工产出将分别归入所选数据集，字段口径与数据库保持一致。</div>"
      + '<div class="rw-ds-wrap">' + dsCards + "</div>"
      + '<div style="margin-top:14px"><button class="rw-btn rw-btn--primary" type="button" data-rw-act="proc-run-5">生产数据产品</button></div>'
      + result
      + (j.done[5] ? procDoneCard(j, 5) : "");
  }

  /* 步骤 6 质量评价 */
  function procStep6(j) {
    var q = j.quality;
    var rows = PROC_QUALITY.map(function (item, i) {
      var r = q.items[i] || {};
      var okTag = r.ok === null ? '<span class="rw-tag rw-tag--gray">未评价</span>'
        : (r.ok ? '<span class="rw-tag rw-tag--done">合格</span>' : '<span class="rw-tag rw-tag--fail">不合格</span>');
      return "<tr><td>" + esc(item.dim) + "</td><td>" + esc(item.method) + "</td><td>" + esc(item.std) + "</td>"
        + "<td>" + (r.measured ? esc(r.measured) : "—") + "</td><td>" + okTag + "</td>"
        + '<td class="rw-nowrap">' + (r.ok === false ? '<button class="rw-op" type="button" data-rw-act="proc-quality-fix" data-key="' + esc(item.key) + '">' + esc(item.fix) + "</button>" : (r.handled ? '<span class="rw-tag rw-tag--warn">' + esc(r.handled) + "</span>" : "—")) + "</td></tr>";
    }).join("");
    return '<div class="rw-section-title">质量评价（三维度）</div>'
      + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>评价维度</th><th>评价方法</th><th>合格标准</th><th>实测值</th><th>判定</th><th>不合格处理</th></tr></thead><tbody>' + rows + "</tbody></table></div>"
      + '<div style="margin-top:14px"><button class="rw-btn rw-btn--primary" type="button" data-rw-act="proc-run-6">执行质量评价</button></div>'
      + (q.executed ? '<div class="rw-field-tip" style="margin-top:10px">评价完成：'
      + q.items.filter(function (x) { return x.ok; }).length + " 项合格，"
      + q.items.filter(function (x) { return !x.ok; }).length + " 项不合格（不合格项按上表处理动作执行）。</div>" : "")
      + (j.done[6] ? procDoneCard(j, 6) : "");
  }

  function procDoneCard(j, step) {
    var text = {
      1: "数据产品规格文档已生成，明确目标用途、输出格式与精度要求。",
      2: "已按质量等级与材料类型完成筛选，输出筛选后数据集合与分组清单。",
      3: "标准化预处理完成：格式与单位统一、缺失值标注、异常值已复核；版本推进至 V1.0。",
      4: "加工模型执行完成，输出加工后属性数据 / 标准化图谱 / 验证后结构文件。",
      5: "数据产品生产完成，已按数据集划分归档（输出格式、用途与入库数据集均已确定）；版本推进至 V2.0。",
      6: "质量评价完成，来源 / 模型 / 产品三维度均已给出判定与处理动作。"
    };
    return '<div class="rw-banner" style="margin-top:14px"><span>✓</span><div>' + esc(text[step]) + "</div></div>";
  }

  /* ------------------------------------------------------ 加工各步骤执行 */
  function procDone(j, step) {
    j.done[step] = nowText();
    j.autoScroll = true;
  }

  function procRun(step) {
    var j = activeJob();
    if (!j) return;
    if (step === 1) {
      if (!String(j.name || "").trim()) { toast("请填写加工任务名称", "err"); return; }
      if (!(j.sourceIds || []).length) { toast("请选择参与加工的数据源", "err"); return; }
      procDone(j, 1);
      toast("数据产品规格文档已生成", "ok");
    } else if (step === 2) {
      if (!j.done[1]) { toast("请先完成步骤 1 数据策划", "err"); return; }
      var e = entryState();
      var pool = j.sourceIds.map(function (id) { return e.records.filter(function (r) { return r.id === id; })[0]; }).filter(Boolean);
      var levels = j.filter.levels;
      j.filter.rows = pool.map(function (r, i) {
        return { formula: r.formula, id: r.id, dataType: r.dataType, level: levels[i % levels.length] || "A级", metric: (r[C().metric.key] || "-") + C().metric.unit };
      });
      var map = {};
      j.filter.rows.forEach(function (r) { map[r.formula] = (map[r.formula] || 0) + 1; });
      j.filter.groups = Object.keys(map).map(function (k) {
        return { formula: k, count: map[k], pass: map[k] >= Number(j.filter.minPerGroup || 3) };
      });
      j.filter.executed = true;
      procDone(j, 2);
      toast("筛选完成：" + j.filter.rows.length + " 条数据，" + j.filter.groups.length + " 个分组", "ok");
    } else if (step === 3) {
      if (!j.done[2]) { toast("请先完成步骤 2 基础数据筛选", "err"); return; }
      j.pre.executed = true;
      j.version = "V1.0";
      procDone(j, 3);
      toast("标准化预处理完成，版本推进至 V1.0", "ok");
    } else if (step === 4) {
      if (!j.done[3]) { toast("请先完成步骤 3 标准化预处理", "err"); return; }
      if (!j.model.key) { toast("请选择加工模型 / 算法", "err"); return; }
      var mo = PROC_MODELS.filter(function (x) { return x.key === j.model.key; })[0];
      var preset = (C().modelRows || {})[j.model.key] || [];
      j.model.rows = preset.map(function (r2) { return Object.assign({}, r2); });
      if (!j.model.rows.length && j.model.key === "stat") {
        j.model.rows = [
          { item: "带隙（MoS2）", input: "1.62 / 1.70 / 1.72 eV", logic: "计算均值、标准差、置信区间", out: "1.68 ± 0.05 eV（95% CI：1.64 ~ 1.72）" },
          { item: "形成能（MoS2）", input: "-1.20 / -1.26 / -1.26 eV/atom", logic: "计算均值、标准差、置信区间", out: "-1.24 ± 0.03 eV/atom" }
        ];
      } else if (j.model.key === "image") {
        j.model.rows = [
          { item: "能带图", input: "band_raw.png（1024×768，坐标轴不一致）", logic: "统一坐标轴、分辨率、标注、格式", out: "band_std.png（1600×1200，统一标注）" },
          { item: "态密度图", input: "dos_raw.png（800×600）", logic: "统一坐标轴、分辨率、标注、格式", out: "dos_std.png（1600×1200，统一标注）" }
        ];
      } else {
        j.model.rows = [
          { item: "MoS2 结构", input: "MoS2.cif", logic: "校验原子坐标合理性、键长范围", out: "MoS2_verified.cif（键长 2.41 Å，合理）" },
          { item: "WS2 结构", input: "WS2.cif", logic: "校验原子坐标合理性、键长范围", out: "WS2_verified.cif（键长 2.42 Å，合理）" }
        ];
      }
      j.model.executed = true;
      procDone(j, 4);
      toast(mo.name + " 执行完成", "ok");
    } else if (step === 5) {
      if (!j.done[4]) { toast("请先完成步骤 4 数据加工", "err"); return; }
      /* 2026-10-08：数据产品必须明确归入至少一个数据集（产品形态卡已按圈红删除） */
      if (!(j.product.datasets || []).length) { toast("请勾选本次产出归入的数据集", "err"); return; }
      j.product.executed = true;
      j.version = "V2.0";
      j.product.result = (j.product.datasets || []).map(function (k3) {
        var d2 = procDatasetOf(k3);
        return d2 ? d2.title : k3;
      }).join("、");
      procDone(j, 5);
      toast("数据产品生产完成：" + j.product.datasets.length + " 个数据集，版本推进至 V2.0", "ok");
    } else if (step === 6) {
      if (!j.done[5]) { toast("请先完成步骤 5 产品生产", "err"); return; }
      j.quality.items = [
        { key: "source", measured: "来源可信度 1 级", ok: true, handled: "" },
        { key: "model", measured: "输出与输入偏差 6.8%", ok: false, handled: "" },
        { key: "product", measured: "抽样缺陷率 0.4%", ok: true, handled: "" }
      ];
      j.quality.executed = true;
      procDone(j, 6);
      toast("质量评价完成：2 项合格，1 项不合格需处理", "err");
    }
    renderProcWizard();
  }

  function procQualityFix(key) {
    var j = activeJob();
    if (!j) return;
    var item = j.quality.items.filter(function (x) { return x.key === key; })[0];
    if (!item) return;
    var fix = (PROC_QUALITY.filter(function (q) { return q.key === key; })[0] || {}).fix;
    if (key === "model") {
      item.measured = "调整模型参数后偏差 3.1%";
      item.ok = true;
      item.handled = "已调整模型参数";
    } else {
      item.handled = fix;
    }
    procDone(j, 6);
    renderProcWizard();
    toast("已执行处理：" + fix, "ok");
  }

  function procFinish() {
    var j = activeJob();
    if (!j) return;
    closeMask("rwProcMask");
    procState().activeId = "";
    renderRwPage();
    toast("加工任务 " + j.id + " 已完成（版本 " + j.version + "）", "ok");
  }

  function procReport(id) {
    var j = procJobs().filter(function (x) { return x.id === id; })[0];
    if (!j) return;
    closeMask("rwProcReportMask");
    var steps = PROC_STEP_TITLES.map(function (t, i) {
      return "<tr><td>步骤 " + (i + 1) + "：" + esc(t) + "</td><td>" + (j.done[i + 1] ? '<span class="rw-tag rw-tag--done">已完成</span>' : '<span class="rw-tag rw-tag--gray">未执行</span>') + "</td><td>" + esc(j.done[i + 1] || "—") + "</td></tr>";
    }).join("");
    var mask = document.createElement("div");
    mask.className = "rw-mask";
    mask.id = "rwProcReportMask";
    mask.setAttribute("data-rw-root", "procReport");
    mask.innerHTML = '<div class="rw-modal rw-modal--narrow" style="width:min(760px,100%)">'
      + '<div class="rw-modal-head"><div><h3>' + esc(j.name || "加工任务") + "</h3><p>" + esc(j.id) + " · 加工报告</p></div>"
      + '<div class="rw-modal-head-side"><span class="rw-tag rw-tag--open">' + esc(j.version) + '</span><button class="rw-modal-close" type="button" data-rw-act="proc-report-close">×</button></div></div>'
      + '<div class="rw-modal-body">'
      + '<div class="rw-kv"><div><b>目标用途</b>' + esc(j.spec.purpose || "-") + "</div><div><b>输出格式</b>" + esc(j.spec.format || "-") + "</div>"
      + "<div><b>精度要求</b>" + esc(j.spec.precision || "-") + "</div><div><b>数据源</b>" + (j.sourceIds || []).length + " 条</div>"
      + "<div><b>筛选结果</b>" + (j.filter.executed ? j.filter.rows.length + " 条 / " + j.filter.groups.length + " 组" : "未执行") + "</div>"
      + "<div><b>加工模型</b>" + esc((PROC_MODELS.filter(function (x) { return x.key === j.model.key; })[0] || {}).name || "-") + "</div>"
      + "<div><b>数据产品</b>" + esc((j.product.datasets || []).length ? (j.product.datasets || []).map(function (k4) {
          var d4 = procDatasetOf(k4);
          return d4 ? d4.title : k4;
        }).join("、") : "-") + "</div>"
      + "<div><b>当前版本</b>" + esc(j.version) + "</div></div>"
      + '<div class="rw-section-title">执行进度</div>'
      + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>加工步骤</th><th>状态</th><th>完成时间</th></tr></thead><tbody>' + steps + "</tbody></table></div>"
      + (j.quality.executed ? '<div class="rw-section-title" style="margin-top:14px">质量评价</div>'
        + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>评价维度</th><th>实测值</th><th>判定</th><th>处理</th></tr></thead><tbody>'
        + j.quality.items.map(function (it) {
          var meta = PROC_QUALITY.filter(function (q) { return q.key === it.key; })[0] || {};
          return "<tr><td>" + esc(meta.dim) + "</td><td>" + esc(it.measured) + "</td><td>" + (it.ok ? '<span class="rw-tag rw-tag--done">合格</span>' : '<span class="rw-tag rw-tag--fail">不合格</span>') + "</td><td>" + esc(it.handled || "—") + "</td></tr>";
        }).join("") + "</tbody></table></div>" : "")
      + "</div>"
      + '<div class="rw-modal-foot"><button class="rw-btn" type="button" data-rw-act="proc-report-close">关闭</button>'
      + '<button class="rw-btn rw-btn--primary" type="button" data-rw-act="proc-open" data-id="' + esc(j.id) + '">继续加工</button></div>'
      + "</div>";
    mask.addEventListener("click", function (ev) { if (ev.target === mask) closeMask("rwProcReportMask"); });
    document.body.appendChild(mask);
  }

  /* ==========================================================================
     闭环补充层 —— 依据《低维材料主题库》清单 编号 6~22 补齐
     原则：
       1) 只复用既有 rw-* 样式类，不新增 CSS；
       2) 每条文案都能追溯到清单条目或「招标汇总描述」；
       3) 批次ID / source_id / SHA-256 / evidence_type / 字段状态 / 异常单 /
          任务状态 / 版本发布链，均为让清单功能真正闭合所需的支撑字段。
     ========================================================================== */

  /* 编号 10「数据安全等级」只挂在二维材料名下 */
  function hasSecurity() { return CFG_KEY === "twod"; }
  function MX() { return MATX[CFG_KEY] || MATX.twod; }

  /* ------------------------------------------------------------------------
     五类材料的追溯 / 审核 / 整合 / 更新 / 统计 / 交接数据
     trace  : [批次ID, source_id, 来源名称, 来源类型, 数据版本, 原始文件, SHA-256, 采集时间, 状态]
     shards : {id, n 记录数, acc 接收, rej 拒收, dup 重复, pend 待补, st 状态}  恒等：n=acc+rej+dup+pend
     ------------------------------------------------------------------------ */
  var MATX = {

    /* ================= 二维材料（清单编号 6 / 7 / 8 / 9 / 10） ================= */
    twod: {
      trace: [
        ["2D-CL-2026-0922-001", "SRC-MP-0001", "Materials Project（材料项目数据库）", "开源数据获取", "v2024.11", "JSON / CIF", "3a7f9c…c19d", "2026-09-22 10:24", "已完成"],
        ["2D-CL-2026-0923-002", "SRC-C2DB-0007", "C2DB 商业授权数据包", "数据购买", "v3.2", "JSON", "8d21e4…4e0b", "2026-09-23 09:12", "已完成"],
        ["2D-CL-2026-0923-003", "SRC-VASP-0012", "本地 VASP 计算输出", "数据计算", "V0.0", "OUTCAR / DOSCAR", "b5407a…7f3a", "2026-09-23 16:48", "待确认"]
      ],
      shards: [
        { id: "S01", n: 1280, acc: 1180, rej: 42, dup: 51, pend: 7, st: "已完成", taskId: "2D-CL-2026-0922-001" },
        { id: "S02", n: 960, acc: 905, rej: 28, dup: 24, pend: 3, st: "已完成", taskId: "2D-CL-2026-0922-001" },
        { id: "S03", n: 640, acc: 512, rej: 61, dup: 55, pend: 12, st: "已完成", taskId: "2D-CL-2026-0923-002" },
        { id: "S04", n: 420, acc: 366, rej: 30, dup: 21, pend: 3, st: "部分失败", taskId: "2D-CL-2026-0923-002" },
        { id: "S05", n: 320, acc: 0, rej: 0, dup: 0, pend: 320, st: "采集失败", taskId: "2D-CL-2026-0923-003" }
      ],
      cred: {
        head: ["审核对象", "审核规则", "不一致处理", "放行条件"],
        rows: [
          ["同一材料 · 同一计算方法下的多来源结果", "将多元途径获得的数据进行比对，确认计算结果的一致性", "误差较大的计算结果予以剔除，改由数据计算方式提供准确结果并上传数据库", "一致性较好的数据判定为可信数据并上传数据库"],
          ["开源库 / 商业库条目", "抽样调查与对比，确认第三方数据准确", "抽样不一致时整批复核", "抽样合格率达标后放行"]
        ]
      },
      appl: {
        head: ["审核对象", "审核规则", "不一致处理", "放行条件"],
        rows: [
          ["不同计算方法 / 不同计算参数下的结果差异", "整理并归纳差异，在结果展示界面提供不同计算方法的结果及该结果的计算参数", "不做剔除，按计算方法分组展示", "用户可据此判断数据是否符合研究需求"],
          ["计算数据的可重复性凭证", "必须提供计算方法与计算参数", "缺少方法或参数的数据退回补标", "凭证齐全后放行"]
        ]
      },
      unify: {
        head: ["数据类型", "统一存储格式", "展示方式"],
        rows: [
          ["结构特征（晶胞原子结构、原子坐标）", ".cif 文件", "调用三维建模软件在数据库界面展示"],
          ["电子结构（能带结构、态密度）", "数据文本", "调用绘图软件在数据库界面绘制成图表展示"],
          ["力学性质（弹性常数、杨氏模量、泊松比）", "数值", "以数字形式存储与调用展示"],
          ["磁学性质（磁基态构型）", "二进制图片", "以图片形式展示；磁转变温度以数字展示"],
          ["热学性质（声子谱、声子态密度）", "数据文本", "调用绘图软件可视化展示；形成能以数字展示"],
          ["光学性质（介电函数、光吸收系数、反射率、折射率、消光系数）", "数据文本", "调用软件转换为图表展示"],
          ["缺陷性质（缺陷构型）", "字符（结构文件）", "调用软件做三维结构可视化；缺陷形成能以数字展示"]
        ]
      },
      upd: {
        head: ["更新类型", "数据来源", "更新周期", "最近执行", "下次执行", "责任人"],
        rows: [
          ["现有条目基础信息更新", "开源数据库数据 + 商业数据库购买数据", "定期同步（30 天）", "2026-09-20", "2026-10-20", "数据库维护员"],
          ["新增条目（新型二维材料）", "数据计算（第一性原理计算软件）", "定期新增（30 天）", "2026-09-20", "2026-10-20", "数据加工工程师"]
        ]
      },
      stats: [
        ["数据总量", "30,600 条 · 采集加工量指标 ≥ 30,600 条（招标汇总描述，编号 6）"],
        ["当前占用硬件空间", "1.84 TB（含结构文件与图谱附件）"],
        ["剩余硬件空间", "3.16 TB（总容量 5.00 TB）"],
        ["重复数据辨别与删除", "固定周期 30 天执行一次"]
      ],
      handoff: [
        ["二维材料结构特征数据集（V2.0）", "二维材料数据库 · 结构特征数据集", "编号 28", "化学式、晶系与空间群、晶胞原子结构、晶格常数、原子坐标、键长键角、层间厚度", "待交接"],
        ["二维材料电子结构数据集（V2.0）", "二维材料数据库 · 电子结构数据集", "编号 29", "能带结构、态密度、电子有效质量", "待交接"],
        ["二维材料电学性质数据集（V2.0）", "二维材料数据库 · 电学性质数据集", "编号 30", "铁电性、压电性", "待交接"],
        ["二维材料磁学性质数据集（V2.0）", "二维材料数据库 · 磁学性质数据集", "编号 31", "磁基态构型、磁转变温度", "待交接"],
        ["二维材料热学性质数据集（V2.0）", "二维材料数据库 · 热学性质数据集", "编号 32", "形成能、声子谱、声子态密度", "待交接"],
        ["二维材料力学性质数据集（V2.0）", "二维材料数据库 · 力学性质数据集", "编号 33", "弹性常数、杨氏模量、泊松比", "待交接"],
        ["二维材料光学性质数据集（V2.0）", "二维材料数据库 · 光学性质数据集", "编号 34", "介电函数、光吸收系数、反射率、折射率、消光系数", "待交接"],
        ["二维材料缺陷性质数据集（V2.0）", "二维材料数据库 · 缺陷性质数据集", "编号 35", "空位缺陷、反位缺陷、缺陷构型、缺陷形成能", "待交接"]
      ],
      procNote: ""
    },

    /* ============ 有机光电材料（清单编号 11 / 12 / 13 / 14） ============ */
    opto: {
      trace: [
        ["OP-CL-2026-0922-001", "SRC-PUBCHEM-0031", "PubChem（化合物数据库，含 CCDC 结构校核）", "开源数据获取", "2026.08", "JSON / MOL", "1f02b8…9ad3", "2026-09-22 10:24", "已完成"],
        ["OP-CL-2026-0923-002", "SRC-SCIF-0004", "SciFinder（化学文献数据库，已购授权）", "数据购买", "2026.09", "JSON / CSV", "a9d3c7…05f1", "2026-09-23 09:12", "已完成"],
        ["OP-CL-2026-0923-003", "SRC-G16-0021", "本地计算输出（Gaussian16 LOG / FCHK）", "数据计算", "V0.0", "LOG / FCHK", "d64e90…c8a2", "2026-09-23 16:48", "待确认"]
      ],
      shards: [
        { id: "S01", n: 420, acc: 388, rej: 14, dup: 16, pend: 2, st: "已完成", taskId: "OP-CL-2026-0922-001" },
        { id: "S02", n: 260, acc: 231, rej: 12, dup: 15, pend: 2, st: "已完成", taskId: "OP-CL-2026-0922-001" },
        { id: "S03", n: 180, acc: 150, rej: 18, dup: 9, pend: 3, st: "部分失败", taskId: "OP-CL-2026-0923-002" },
        { id: "S04", n: 140, acc: 0, rej: 0, dup: 0, pend: 140, st: "采集失败", taskId: "OP-CL-2026-0923-003" }
      ],
      cred: {
        head: ["审核对象", "审核规则", "不一致处理", "放行条件"],
        rows: [
          ["同一分子在不同来源的数据（如 PubChem 的熔点与文献值）", "多来源数值比对", "误差 > 10% 的数据需重新计算验证", "误差 ≤ 10% 判定为可信数据"],
          ["商用库（SciFinder / Reaxys）条目", "与开源库及文献值抽样对比", "抽样不一致时整批复核", "抽样合格率达标后放行"]
        ]
      },
      appl: {
        head: ["审核对象", "审核规则", "不一致处理", "放行条件"],
        rows: [
          ["计算数据", "标注计算方法（如 B3LYP / def2-SVP）", "未标注方法与参数的数据退回补标", "用户可据此判断是否符合研究需求"],
          ["物性数据", "标注实验条件（如熔点测定压力）", "未标注实验条件的数据退回补标", "用户可据此判断是否符合研究需求"]
        ]
      },
      unify: {
        head: ["数据类型", "统一存储格式", "展示方式"],
        rows: [
          ["基础信息（中英文名称、分子式、分子量、分子编号）", "字符 + 数值（分子量）", "文本与数字展示"],
          ["三维结构（原子坐标、键长键角）", "字符 + 数值统一结构文件", "三维结构可视化展示"],
          ["分子构象", "二进制图片", "图片展示"],
          ["物性数据（密度、熔点、沸点、闪点、折射率、溶解性）", "数值（附测试条件字符）", "数字展示并附测试条件"],
          ["表征图谱（红外光谱、拉曼光谱、核磁共振谱）", "二进制图片（原始数据 + 图谱图片）", "图谱图片展示"],
          ["计算数据（激发能、发射能、跃迁偶极矩、HOMO-LUMO、溶剂化自由能）", "数值", "数字展示；跃迁类型、溶剂模型以字符展示"],
          ["计算数据（基态 / 激发态结构、态密度）", "二进制图片", "图谱 / 结构图片展示"],
          ["简正振动模式", "数值（振动频率）+ 字符（模式描述）", "数字 + 描述展示"]
        ]
      },
      upd: {
        head: ["更新类型", "数据来源", "更新周期", "最近执行", "下次执行", "责任人"],
        rows: [
          ["开源数据同步", "PubChem / CCDC 新增分子", "每月", "2026-09-01", "2026-10-01", "数据库维护员"],
          ["自主计算新增", "Gaussian16 计算新型分子（如新型 OLED 主体材料）", "每季度（50–100 个）", "2026-07-01", "2026-10-01", "数据加工工程师"]
        ]
      },
      stats: [
        ["数据总量", "1,000 条 · 采集加工量指标 ≥ 1,000 条（招标汇总描述，编号 6）"],
        ["当前占用硬件空间", "0.62 TB（含图谱与构象图片）"],
        ["剩余硬件空间", "4.38 TB（总容量 5.00 TB）"],
        ["重复数据辨别与删除", "固定周期 30 天执行一次"]
      ],
      handoff: [
        ["有机光电材料基础数据集（V2.0）", "有机光电材料数据库 · 基础数据集", "编号 36", "中英文名称、分子式、分子量、分子编号、三维结构", "待交接"],
        ["有机光电材料物性数据集（V2.0）", "有机光电材料数据库 · 物性数据集", "编号 37", "密度、熔点、沸点、闪点、折射率、溶解性", "待交接"],
        ["有机光电材料表征图谱数据集（V2.0）", "有机光电材料数据库 · 表征图谱数据集", "编号 38", "红外光谱、拉曼光谱、核磁共振谱（原始数据 + 图谱图片）", "待交接"],
        ["有机光电材料计算数据集（V2.0）", "有机光电材料数据库 · 计算数据集", "编号 39", "基态 / 激发态结构、激发能、发射能、跃迁偶极矩、HOMO-LUMO、溶剂化自由能、态密度、简正模式", "待交接"]
      ],
      procNote: ""
    },

    /* ============== 电解质材料（清单编号 15 / 16 / 17 / 18） ============== */
    electrolyte: {
      trace: [
        ["EL-CL-2026-0922-001", "SRC-MP-0006", "Materials Project（材料项目数据库）", "开源数据获取", "v2025.03", "JSON / CIF", "4b81d2…7c05", "2026-09-22 10:24", "已完成"],
        ["EL-CL-2026-0923-002", "SRC-REAX-0003", "Reaxys 电解质应用数据包（已购授权）", "数据购买", "2026.07", "JSON", "5c9f02…ae34", "2026-09-23 09:12", "已完成"],
        ["EL-CL-2026-0923-003", "SRC-VASP-0033", "本地计算输出（VASP OUTCAR / DOSCAR）", "数据计算", "V0.0", "OUTCAR / DOSCAR", "9e14bb…63f7", "2026-09-23 16:48", "待确认"]
      ],
      shards: [
        { id: "S01", n: 3250, acc: 2980, rej: 140, dup: 118, pend: 12, st: "已完成", taskId: "EL-CL-2026-0922-001" },
        { id: "S02", n: 2880, acc: 2560, rej: 178, dup: 130, pend: 12, st: "已完成", taskId: "EL-CL-2026-0922-001" },
        { id: "S03", n: 2100, acc: 1805, rej: 165, dup: 118, pend: 12, st: "部分失败", taskId: "EL-CL-2026-0923-002" },
        { id: "S04", n: 2020, acc: 0, rej: 0, dup: 0, pend: 2020, st: "采集失败", taskId: "EL-CL-2026-0923-003" }
      ],
      cred: {
        head: ["审核对象", "审核规则", "不一致处理", "放行条件"],
        rows: [
          ["同一电解质在不同来源的数据（如有机电解液燃点）", "多来源数值比对，燃点误差控制在 10 ℃ 以内", "误差超 20% 的数据需重新计算验证", "误差 ≤ 20% 判定为可信数据"],
          ["固态无机电解质（如 LLZO 离子电导率）", "开源数据与商用数据交叉对比", "误差超 20% 触发重新计算", "误差达标后放行"]
        ]
      },
      appl: {
        head: ["审核对象", "审核规则", "不一致处理", "放行条件"],
        rows: [
          ["计算数据", "标注计算方法（如 VASP-PBE）", "未标注计算方法的数据退回补标", "用户可据此判断是否符合研究需求"],
          ["物性数据", "标注实验条件（如电导率测定温度）", "未标注实验条件的数据退回补标", "用户可据此判断是否符合研究需求"],
          ["自主计算数据可重复性", "必须提供输入文件（INCAR / gjf）", "缺少输入文件的数据退回补交", "其他用户可重复计算后放行"]
        ]
      },
      unify: {
        head: ["数据类型", "统一存储格式", "展示方式"],
        rows: [
          ["有机电解液结构文件", "pdb", "三维结构可视化展示"],
          ["固态无机电解质结构文件", "cif / POSCAR", "三维结构可视化展示"],
          ["表征图谱（XRD、XAS、红外、核磁共振）", "jpg（300 dpi）", "图谱图片展示"],
          ["物性数据（熔点、燃点、介电常数、离子电导率、玻璃化转变温度、拉伸模量、机械强度）", "数值（带单位）", "数字展示"],
          ["计算数据（带隙、态密度、能带结构、HOMO-LUMO、溶剂化自由能、结合能、摩尔热容）", "数值（带单位）+ 图谱", "数字 + 图谱展示"]
        ]
      },
      upd: {
        head: ["更新类型", "数据来源", "更新周期", "最近执行", "下次执行", "责任人"],
        rows: [
          ["开源 / 商业数据同步", "MaterialsProject / ICSD 更新", "每季度", "2026-07-01", "2026-10-01", "数据库维护员"],
          ["自主计算新增", "VASP / Gaussian 计算新型电解质（如新型硫化物固态电解质、高介电常数电解液溶剂）", "每半年（30–50 个）", "2026-07-01", "2027-01-01", "数据加工工程师"]
        ]
      },
      stats: [
        ["数据总量", "10,250 条 · 采集加工量指标 ≥ 10,250 条（招标汇总描述，编号 6）"],
        ["当前占用硬件空间", "1.05 TB（含晶体结构与衍射图谱）"],
        ["剩余硬件空间", "3.95 TB（总容量 5.00 TB）"],
        ["重复数据辨别与删除", "固定周期 30 天执行一次"]
      ],
      handoff: [
        ["有机电解液数据集（V2.0）", "电解质材料数据库 · 有机电解液数据集", "编号 40", "名称、分子式、结构、熔点、燃点、介电常数、红外与核磁图谱、HOMO-LUMO、溶剂化自由能", "待交接"],
        ["固态有机电解质数据集（V2.0）", "电解质材料数据库 · 固态有机电解质数据集", "编号 41", "名称、单体与聚合物结构、玻璃化转变温度、拉伸模量、结合能、摩尔热容", "待交接"],
        ["固态无机电解质数据集（V2.0）", "电解质材料数据库 · 固态无机电解质数据集", "编号 42", "名称、化学式、晶体结构、离子电导率、机械强度、XRD 与 XAS 图谱、带隙、态密度、能带结构", "待交接"]
      ],
      procNote: ""
    },

    /* ============ 机器学习力场（清单编号 19 / 20 / 21） ============ */
    mlff: {
      trace: [
        ["ML-CL-2026-0922-001", "SRC-QM9-0002", "QM9（量子化学小分子数据集）", "开源数据获取", "v2024", "CSV / XYZ", "2c6ea1…bb47", "2026-09-22 10:24", "已完成"],
        ["ML-CL-2026-0923-002", "SRC-REAX-0005", "Reaxys 高分子片段数据包（已购授权）", "数据购买", "2026.07", "CSV / XML", "aa07c5…3d16", "2026-09-23 09:12", "已完成"],
        ["ML-CL-2026-0923-003", "SRC-SAMP-0027", "本地计算输出（Gromacs 采样 PDB / Q-Chem 受力 CSV）", "数据计算", "V0.0", "PDB / CSV", "3fd8e2…51c9", "2026-09-23 16:48", "待确认"]
      ],
      shards: [
        { id: "S01", n: 8400, acc: 7920, rej: 260, dup: 190, pend: 30, st: "已完成", taskId: "ML-CL-2026-0922-001" },
        { id: "S02", n: 7200, acc: 6680, rej: 300, dup: 190, pend: 30, st: "已完成", taskId: "ML-CL-2026-0922-001" },
        { id: "S03", n: 5400, acc: 4810, rej: 350, dup: 210, pend: 30, st: "部分失败", taskId: "ML-CL-2026-0923-002" },
        { id: "S04", n: 4200, acc: 0, rej: 0, dup: 0, pend: 4200, st: "采集失败", taskId: "ML-CL-2026-0923-003" }
      ],
      cred: {
        head: ["审核对象", "审核规则", "不一致处理", "放行条件"],
        rows: [
          ["同一分子在不同来源的数据（如 QM9 与自主计算的 H₂O 能量）", "多来源能量比对，误差控制在 0.001 AU 以内", "误差超 5% 的数据需重新采样计算", "误差 ≤ 5% 判定为可信数据"],
          ["高分子 / 蛋白质体系能量与受力", "开源库与自主采样计算结果交叉对比", "超阈值触发重新采样计算", "达标后放行"]
        ]
      },
      appl: {
        head: ["审核对象", "审核规则", "不一致处理", "放行条件"],
        rows: [
          ["采样数据", "标注采样系综（如 NVT）、温度区间与采样时长", "未标注采样条件的数据退回补标", "用户可据此判断是否符合力场训练需求"],
          ["计算数据", "标注计算参数（如 CCSD(T) / def2-QZVP、DFT-PBE0、MP2）", "未标注计算参数的数据退回补标", "用户可据此判断是否符合力场训练需求"]
        ]
      },
      unify: {
        head: ["数据类型", "统一存储格式", "展示方式"],
        rows: [
          ["小分子构象（QM9 的 xyz）", "pdb", "三维结构可视化展示"],
          ["能量 / 原子受力数据", "csv", "数值表格 + 图表展示"],
          ["采样轨迹帧", "pdb（按帧编号）", "轨迹帧序列展示"],
          ["体系基础信息（名称、分子式、重复单元、氨基酸序列）", "字符", "文本展示"],
          ["采样数据（温度、构象数、RMSD、链段运动频率、折叠状态）", "数值（带单位）+ 字符", "数字 + 状态描述展示"],
          ["原子性质（电荷、偶极矩、极化率）", "数值（带单位）", "数字展示"],
          ["力场参数（如色散系数 C₆）", "数值（带单位）", "数字展示"],
          ["采样过程描述（如 NVT 系综，300 K，10 ns）", "字符", "文本展示"]
        ]
      },
      upd: {
        head: ["更新类型", "数据来源", "更新周期", "最近执行", "下次执行", "责任人"],
        rows: [
          ["开源数据同步", "QM9 / PDB 更新", "每季度", "2026-07-01", "2026-10-01", "数据库维护员"],
          ["自主采样计算新增", "小分子 10–15 个 / 高分子 5–8 个 / 蛋白质 3–5 个", "每半年", "2026-07-01", "2027-01-01", "数据加工工程师"]
        ]
      },
      stats: [
        ["数据总量", "25,200 条 · 采集加工量指标 ≥ 25,200 条（招标汇总描述，编号 6）"],
        ["当前占用硬件空间", "2.46 TB（含轨迹帧与受力数据）"],
        ["剩余硬件空间", "2.54 TB（总容量 5.00 TB）"],
        ["重复数据辨别与删除", "固定周期 30 天执行一次"]
      ],
      handoff: [
        ["机器学习力场基础数据集（V2.0）", "机器学习力场数据库 · 基础数据集", "编号 43", "体系名称、分子式、重复单元、氨基酸序列、结构", "待交接"],
        ["有机小分子机器学习力场数据集（V2.0）", "机器学习力场数据库 · 有机小分子力场数据集", "编号 44", "采样温度、构象数、RMSD、单分子能量、原子受力、双分子相互作用能、电荷、偶极矩、极化率", "待交接"],
        ["高分子机器学习力场数据集（V2.0）", "机器学习力场数据库 · 高分子力场数据集", "编号 45", "链段运动频率、片段总能量、原子受力、分子间相互作用能", "待交接"]
      ],
      procNote: "清单编号 19–21 未单列「数据资源加工」模块；依据编号 6 招标汇总描述「支持对……机器学习力场数据……提供低维材料数据采集加工处理服务」，本页加工环节沿用统一六步流程，产物交接至机器学习力场数据库数据集。"
    },

    /* ================ 催化材料（清单编号 22） ================ */
    catalyst: {
      trace: [
        ["CA-CL-2026-0922-001", "SRC-CATHUB-0014", "Catalysis-Hub（催化反应数据库）", "开源数据获取", "2026.05", "JSON / CIF", "6b2d09…f471", "2026-09-22 10:24", "已完成"],
        ["CA-CL-2026-0923-002", "SRC-LIT-0008", "文献催化性能专题库（已购授权）", "数据购买", "2026.06", "CSV / CIF", "cf5108…2a93", "2026-09-23 09:12", "已完成"],
        ["CA-CL-2026-0923-003", "SRC-VASP-0046", "本地计算输出（VASP OUTCAR / CONTCAR）", "数据计算", "V0.0", "OUTCAR / CONTCAR", "18ae64…d0b5", "2026-09-23 16:48", "待确认"]
      ],
      shards: [
        { id: "S01", n: 12400, acc: 11520, rej: 480, dup: 340, pend: 60, st: "已完成", taskId: "CA-CL-2026-0922-001" },
        { id: "S02", n: 9800, acc: 9060, rej: 420, dup: 280, pend: 40, st: "已完成", taskId: "CA-CL-2026-0922-001" },
        { id: "S03", n: 7600, acc: 6820, rej: 460, dup: 280, pend: 40, st: "部分失败", taskId: "CA-CL-2026-0923-002" },
        { id: "S04", n: 5120, acc: 0, rej: 0, dup: 0, pend: 5120, st: "采集失败", taskId: "CA-CL-2026-0923-003" }
      ],
      cred: {
        head: ["审核对象", "审核规则", "不一致处理", "放行条件"],
        rows: [
          ["同一催化体系在同一计算方法下的多来源结果", "将多元途径获得的数据进行比对，确认计算结果的一致性", "误差较大的计算结果予以剔除，改由数据计算方式补算", "一致性较好的数据判定为可信数据"],
          ["吸附能 / 反应能 / 活化能", "同晶面同吸附分子的多来源数值比对", "超阈值结果触发重新计算", "达标后放行"]
        ]
      },
      appl: {
        head: ["审核对象", "审核规则", "不一致处理", "放行条件"],
        rows: [
          ["不同计算方法 / 不同计算参数下的结果差异", "整理并归纳差异，在结果展示界面提供不同计算方法的结果及该结果的计算参数", "不做剔除，按计算方法分组展示", "用户可据此判断数据是否符合研究需求"],
          ["计算数据的可重复性凭证", "必须提供计算方法与计算参数", "缺少方法或参数的数据退回补标", "凭证齐全后放行"]
        ]
      },
      unify: {
        head: ["数据类型", "统一存储格式", "展示方式"],
        rows: [
          ["催化表面晶面、掺杂原子参数", "字符 + 结构文件", "三维结构可视化展示"],
          ["吸附分子构型 / 反应初始构型 / 产物吸附构型 / 过渡态吸附构型", "字符（结构文件）", "三维结构可视化展示"],
          ["分子吸附能量 / 反应能 / 活化能", "数值（带单位）", "数字展示"],
          ["吸附分子种类、反应产物", "字符", "文本展示"]
        ]
      },
      upd: {
        head: ["更新类型", "数据来源", "更新周期", "最近执行", "下次执行", "责任人"],
        rows: [
          ["现有条目基础信息更新", "开源数据库与商业数据库", "定期同步（30 天）", "2026-09-20", "2026-10-20", "数据库维护员"],
          ["新增条目（新型催化体系）", "数据计算（VASP 吸附构型与过渡态计算）", "定期新增（30 天）", "2026-09-20", "2026-10-20", "数据加工工程师"]
        ]
      },
      stats: [
        ["数据总量", "34,920 条 · 采集加工量指标 ≥ 34,920 条（招标汇总描述，编号 6）"],
        ["当前占用硬件空间", "3.28 TB（含吸附构型与过渡态结构）"],
        ["剩余硬件空间", "1.72 TB（总容量 5.00 TB）"],
        ["重复数据辨别与删除", "固定周期 30 天执行一次"]
      ],
      handoff: [
        ["催化材料元素特征数据集（V2.0）", "催化材料数据库 · 元素特征数据集", "编号 46", "掺杂原子元素特征与参数", "待交接"],
        ["催化材料结构特征数据集（V2.0）", "催化材料数据库 · 结构特征数据集", "编号 47", "催化表面晶面、表面结构特征", "待交接"],
        ["单原子催化剂数据集（V2.0）", "催化材料数据库 · 单原子催化剂数据集", "编号 48", "单原子催化体系吸附与反应路径数据", "待交接"],
        ["二元合金数据集（V2.0）", "催化材料数据库 · 二元合金数据集", "编号 49", "二元合金催化表面吸附与反应路径数据", "待交接"],
        ["晶界数据集（V2.0）", "催化材料数据库 · 晶界数据集", "编号 50", "晶界体系吸附与反应路径数据", "待交接"],
        ["体系特征数据集（V2.0）", "催化材料数据库 · 体系特征数据集", "编号 51", "反应能、活化能等体系级特征值", "待交接"]
      ],
      procNote: "清单编号 22 仅单列「数据资源对象」模块；依据编号 6 招标汇总描述「支持对……催化材料数据……提供低维材料数据采集加工处理服务」，本页采集 / 录入 / 加工环节沿用统一流程，产物交接至催化材料数据库数据集。"
    }
  };

  /* ---------------------------------------------- 通用：追溯 / 守恒 / 状态 */
  var LOOP_TRACE_HEAD = ["批次ID", "source_id", "来源名称", "来源类型", "数据版本", "原始文件", "SHA-256", "采集时间", "状态"];

  /* 编号 8「数据录入统计 / 数据统计」：条目数、占用空间、剩余空间、30 天去重 */
  var LOOP_DEDUP_CYCLE = "30 天";

  /* 支撑字段：字段四级状态（手册第 4 章，用于让清单「录入规范」真正可判定） */
  var LOOP_FIELD_STATUS = {
    head: ["字段状态", "含义", "入库放行", "展示方式"],
    rows: [
      ["available（有值）", "该字段已有经审核的有效取值", "放行", "正常展示数值 / 字符 / 图谱"],
      ["partial（部分有值）", "同批次中仅部分记录该字段有值", "放行并标注", "展示取值并标注「部分记录有值」"],
      ["missing（缺失）", "来源未提供且无法推断", "不阻断入库，标记待补充", "展示「待补充」并引导上传"],
      ["not_applicable（不适用）", "该字段对本材料 / 本构型无意义", "放行", "展示「不适用」并说明原因"]
    ]
  };

  /* 支撑字段：证据类型（让清单「可信度审核 / 可重复性」可判定） */
  var LOOP_EVIDENCE = {
    head: ["evidence_type", "含义", "可重复性凭证", "可信度审核方式"],
    rows: [
      ["开源库条目", "来自开放数据库 / 开放 API", "库名 + 数据版本 + 条目号", "多来源交叉对比"],
      ["商业库条目", "来自已购买授权的商业数据库", "授权编号 + 数据版本", "抽样调查对比"],
      ["文献提取", "从已发表文献整理归纳", "文献出处 + 表 / 图编号", "原文复核"],
      ["第一性原理计算", "本库自主计算所得", "输入文件（INCAR / POSCAR / gjf）+ 计算参数", "参数合规性复核 + 结果比对"],
      ["采样计算", "分子动力学采样所得", "采样系综 + 温度 + 时长 + 软件版本", "同体系不同来源能量比对"],
      ["实验实测", "实测物性与表征数据", "测试条件 + 仪器 + 原始图谱", "标准样复核"],
      ["人工补录", "无法自动化解析时人工录入", "录入人 + 工单号", "管理员一次审核（通过即入库）"]
    ]
  };

  /* 编号 8「权限管理」：系统管理员 / 数据库维护员 / 高级用户 / 普通用户 */
  var LOOP_PERM = {
    head: ["角色", "数据录入", "数据读取", "数据修改", "密集读取", "授权方式", "有效期"],
    rows: [
      ["系统管理员", "✔ 最高权限", "✔", "✔", "✔", "系统内置", "长期"],
      ["数据库维护员", "✔ 需申请", "✔", "✔ 授权范围内", "✔", "管理员授予", "到期自动回收"],
      ["高级用户", "✕", "✔", "✕", "✔ 密集读取", "管理员授予", "到期自动回收"],
      ["普通用户", "✕", "✔ 正常频次", "✕", "✕", "注册默认", "长期"]
    ]
  };

  /* 编号 8「定期备份」 */
  var LOOP_BACKUP = {
    head: ["备份对象", "备份周期", "保留份数", "存储位置", "完整性校验"],
    rows: [
      ["关系型数据（条目与字段长表）", "每日增量 / 每周全量", "近 30 份", "异地备份存储", "SHA-256 清单比对"],
      ["结构文件与图谱附件", "每周全量", "近 12 份", "对象存储", "文件数 + 哈希比对"],
      ["操作日志与工单记录", "每月归档", "长期保留", "归档存储", "归档完整性校验"]
    ]
  };

  /* 编号 8「质量控制」1)~3) */
  var LOOP_QC = {
    head: ["控制项", "控制要求", "执行周期", "责任人"],
    rows: [
      ["第三方数据库准确性", "适度抽样调查、对比，确保所采用数据的准确", "每批次抽样", "数据审核员"],
      ["录入汇总整合性", "使用统一存储格式，确保数据整合性，便于快速检索与访问", "每次录入", "数据录入员"],
      ["数据及时性", "将近期计算所得结果更新进数据库", LOOP_DEDUP_CYCLE, "数据库维护员"]
    ]
  };

  /* 加工环返工规则（让清单编号 9「质量评价」可定向退回） */
  var LOOP_REWORK = {
    head: ["失败类型", "检出节点", "退回目标节点", "日志处理", "复核人"],
    rows: [
      ["主键冲突 / 身份重复", "录入 · 自动校验", "资源录入 · 字段映射", "保留原日志并追加冲突记录", "数据管理员"],
      ["单位或量纲不一致", "录入 · 自动校验", "资源录入 · 字段映射", "保留原日志", "数据管理员"],
      ["结构文件解析失败", "录入 · 解析", "资源采集 · 完整性校验", "保留原日志并标记分片失败", "数据加工工程师"],
      ["计算参数不满足标准阈值", "录入 · 合规性复核", "资源采集 · 数据计算", "保留原日志，触发重新计算", "数据审核员"],
      ["质量评价不合格（基础数据）", "加工 · 步骤 6 质量评价", "加工 · 步骤 2 基础数据筛选", "保留原日志", "数据审核员"],
      ["质量评价不合格（加工模型）", "加工 · 步骤 6 质量评价", "加工 · 步骤 4 加工模型和算法", "保留原日志", "数据加工工程师"],
      ["质量评价不合格（数据产品）", "加工 · 步骤 6 质量评价", "加工 · 步骤 5 产品生产", "保留原日志", "数据加工工程师"]
    ]
  };

  /* ------------------------------------------------ 分片重试（采集环可闭合） */
  function shardRetryMap() {
    var s = getS();
    if (!s.shardRetry) s.shardRetry = {};
    return s.shardRetry;
  }
  function shardView(sh) {
    var r = shardRetryMap()[sh.id] || 0;
    if (!r) return { id: sh.id, n: sh.n, acc: sh.acc, rej: sh.rej, dup: sh.dup, pend: sh.pend, st: sh.st, raw: sh.st, times: 0 };
    /* 定向重试后：原「待补」全部重新采集，接收补满，仅残留少量拒收与重复 */
    var rej = sh.rej > 0 ? sh.rej : Math.max(1, Math.round(sh.n * 0.01));
    var dup = sh.dup > 0 ? sh.dup : Math.max(1, Math.round(sh.n * 0.005));
    return { id: sh.id, n: sh.n, acc: sh.n - rej - dup, rej: rej, dup: dup, pend: 0, st: "重试已完成", raw: sh.st, times: r };
  }
  function shardTag(st) {
    if (st === "已完成") return "rw-tag--done";
    if (st === "重试已完成") return "rw-tag--done";
    if (st === "部分失败") return "rw-tag--warn";
    return "rw-tag--fail";
  }

  /* ------------------------------------------------ 异常单（支撑字段） */
  function issueRows() {
    var out = [];
    var n = 0;
    MX().shards.forEach(function (sh) {
      var v = shardView(sh);
      if (v.times > 0) return;                 /* 已重试成功的分片不挂异常单 */
      if (sh.st === "已完成") return;
      n += 1;
      var isFail = sh.st === "采集失败";
      out.push([
        "IS-2026-" + ("000" + n).slice(-4),
        sh.id,
        isFail ? "采集失败 · 分片不可达" : "部分失败 · 格式异常",
        isFail ? "源数据库 API 连接超时，分片未返回数据" : "部分记录结构文件缺失，无法自动解析",
        isFail ? "对分片 " + sh.id + " 发起定向重试" : "转入待处理队列，标记「格式异常」等待人工处理",
        isFail ? "数据加工工程师" : "数据管理员",
        isFail ? "数据管理员" : "数据审核员",
        isFail ? "待重试" : "处理中",
        isFail ? "重试成功后自动关闭" : "人工复核通过后关闭"
      ]);
    });
    return out;
  }

  /* ------------------------------------------------ 操作工单（编号 8-5c） */
  function workOrderRows() {
    var s = getS();
    var out = [];
    var seq = 1180;
    s.tasks.forEach(function (t) {
      seq += 1;
      out.push([
        "WO-2026-" + ("000" + seq).slice(-4),
        "数据录入",
        t.id,
        "数据录入员",
        "系统管理员",
        t.createdAt || "-",
        s.entryDone.indexOf(t.id) >= 0 ? "已归档" : "执行中"
      ]);
    });
    seq += 1;
    out.push([
      "WO-2026-" + ("000" + seq).slice(-4),
      "重复数据辨别与删除",
      "全库（" + LOOP_DEDUP_CYCLE + " 周期）",
      "数据库维护员",
      "系统管理员",
      nowText(),
      "已归档"
    ]);
    return out;
  }

  /* ================================================== 页签一：采集环闭环 */
  function collectClosureCards() {
    var x = MX();
    var s = getS();
    var shards = x.shards.map(shardView);
    var issue = issueRows();

    /* 当前选中的采集任务，默认第一个 */
    var selectedId = s.collectTaskId || (s.tasks[0] && s.tasks[0].id) || "";
    var selectedTask = s.tasks.filter(function (t) { return t.id === selectedId; })[0] || s.tasks[0];
    if (selectedTask && selectedId !== selectedTask.id) { selectedId = selectedTask.id; s.collectTaskId = selectedId; }

    /* 全库合计 */
    var totN = 0, totAcc = 0, totRej = 0, totDup = 0, totPend = 0;
    shards.forEach(function (v) { totN += v.n; totAcc += v.acc; totRej += v.rej; totDup += v.dup; totPend += v.pend; });
    var balanced = shards.every(function (v) { return v.acc + v.rej + v.dup + v.pend === v.n; });

    /* 选中任务的批次与分片 */
    var taskTraceRows = x.trace.filter(function (r) { return r[0] === selectedId; });
    var taskShards = shards.filter(function (v) { return v.taskId === selectedId; });
    var selectedShardIds = x.shards.filter(function (sh) { return sh.taskId === selectedId; }).map(function (sh) { return sh.id; });
    var taskIssues = issue.filter(function (r) { return selectedShardIds.indexOf(r[1]) >= 0; });

    /* 摘要条：当前任务 + 全局关键指标（2026-10-08 改为「采集任务执行记录」） */
    var summaryHead = '<div class="rw-card-head"><div><h3>采集任务执行记录</h3>'
      + '<p>当前本库：' + s.tasks.length + ' 个采集任务 · ' + totAcc + ' 条已接收 · '
      + totPend + ' 条待补 · ' + issue.length + ' 个未闭环异常 · '
      + (s.handoffDone ? s.handoffDone.length : 0) + ' 个产物已交接</p></div>'
      + '<div style="display:flex;gap:10px;flex:0 0 auto">'
      + '<button class="rw-btn rw-btn--primary" type="button" data-rw-act="open-create">＋ 创建任务</button>'
      + '<button class="rw-btn rw-btn--blue" type="button" data-rw-act="open-audit">数据采集审核</button>'
      + '<button class="rw-btn" type="button" data-rw-act="tab" data-rw-tab="entry">进入资源录入 →</button></div></div>';

    /* 任务列表行：点击行可切换选中，操作按钮互不干扰 */
    var taskRows = s.tasks.map(function (t) {
      var src = t.sourceType || t.source || methodMeta(t.method).label;
      var dbName = t.dbName || t.name;
      var report = t.integrationReport || "表字段规则校验通过 · 格式统一完成";
      var isSel = t.id === selectedId;
      return "<tr" + (isSel ? ' style="background:#f0f7ff"' : "") + ' data-rw-act="select-task" data-id="' + esc(t.id) + '">'
        + '<td class="rw-id">' + esc(t.id) + "</td>"
        + "<td>" + esc(src) + "</td>"
        + "<td><b>" + esc(dbName) + "</b>" + (isSel ? ' <span class="rw-tag rw-tag--run">当前选中</span>' : "") + "</td>"
        + "<td>" + esc(report) + "</td>"
        + '<td><span class="rw-tag ' + tagFor(t.status) + '">' + esc(t.status) + "</span></td>"
        + '<td class="rw-nowrap">'
        + '<button class="rw-op" type="button" data-rw-act="view-task" data-id="' + esc(t.id) + '">查看详情</button>'
        + '<button class="rw-op" type="button" data-rw-act="to-entry" data-id="' + esc(t.id) + '">录入</button>'
        + "</td></tr>";
    }).join("");

    /* 选中任务的批次表 */
    var traceHtml = taskTraceRows.length
      ? '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr>'
        + LOOP_TRACE_HEAD.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("")
        + "</tr></thead><tbody>"
        + taskTraceRows.map(function (r) {
            return "<tr>" + r.map(function (c, i) {
              var cls = i === 0 || i === 1 || i === 6 ? "rw-nowrap" : "";
              return '<td class="' + cls + '">' + esc(c) + "</td>";
            }).join("") + "</tr>";
          }).join("")
        + "</tbody></table></div>"
      : '<div class="rw-empty" style="padding:22px 0">当前任务暂无批次追溯记录</div>';

    /* 选中任务的分片表 */
    var taskShardRows = taskShards.map(function (v) {
      var canRetry = v.times === 0 && (v.raw === "采集失败" || v.raw === "部分失败");
      return "<tr>"
        + '<td class="rw-nowrap">' + esc(v.id) + "</td>"
        + "<td>" + v.n + "</td>"
        + "<td>" + v.acc + "</td><td>" + v.rej + "</td><td>" + v.dup + "</td><td>" + v.pend + "</td>"
        + "<td>" + v.acc + "</td>"
        + '<td><span class="rw-tag ' + shardTag(v.st) + '">' + esc(v.st) + (v.times ? "（第 " + v.times + " 次）" : "") + "</span></td>"
        + '<td class="rw-nowrap">'
        + (canRetry
          ? '<button class="rw-op" type="button" data-rw-act="shard-retry" data-shard="' + esc(v.id) + '">定向重试</button>'
          : '<button class="rw-op" type="button" data-rw-act="view-task" data-id="' + esc(v.taskId) + '">查看</button>')
        + "</td></tr>";
    }).join("");

    var taskShardHtml = taskShards.length
      ? '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>分片</th><th>记录数</th><th>接收</th><th>拒收</th><th>重复</th><th>待补</th><th>转加工</th><th>状态</th><th>操作</th></tr></thead><tbody>' + taskShardRows + "</tbody></table></div>"
      : '<div class="rw-empty" style="padding:22px 0">当前任务暂无分片记录</div>';

    /* 选中任务的异常单 */
    var taskIssueHtml = taskIssues.length
      ? '<div style="margin-top:14px"><div class="rw-section-title">该任务关联的异常单</div>'
        + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>异常单号</th><th>来源分片</th><th>异常类型</th><th>原因</th><th>处理动作</th><th>责任人</th><th>复核人</th><th>状态</th><th>恢复方式</th></tr></thead><tbody>'
        + taskIssues.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("")
        + "</tbody></table></div></div>"
      : '<div class="rw-banner" style="margin-top:14px"><span>✓</span><div>当前任务无未闭环异常单</div></div>';

    /* 全库数量守恒与数据去向 */
    var flowOutHtml = '<div class="rw-chain">'
      + chainHtml([
        "采集完成（" + totAcc + " 条接收）",
        { text: "进入资源录入", cls: "is-fork" },
        { text: "资源加工（V0.0 → V1.0 → V2.0）", cls: "is-fork" },
        { text: "产物交接 → 标准化 → 数据集入库", cls: "is-end" }
      ])
      + "</div>";

    /* 规则折叠区：审核与整合 + 更新策略 + 统计 */
    var stats = x.stats.map(function (r) {
      return '<div class="rw-step-row" style="grid-template-columns:1fr"><div><div><b style="font-size:15px;color:#22364f">'
        + esc(r[0]) + '</b></div><div class="rw-field-tip">' + esc(r[1]) + "</div></div></div>";
    }).join("");

    var rulesHtml = '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>数据审核与整合</h3><p>数据审核保证可信度与适用性，数据整合保证标准化；三项均按清单原文执行。</p></div></div>'
      + '<div class="rw-section-title">① 可信度审核</div>' + tableHtml(x.cred)
      + '<div class="rw-section-title" style="margin-top:14px">② 适用性审核</div>' + tableHtml(x.appl)
      + '<div class="rw-section-title" style="margin-top:14px">③ 数据整合（格式统一）</div>' + tableHtml(x.unify)
      + "</div>"
      + '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>数据更新策略</h3>'
      + "<p>数据更新分「现有条目基础信息更新」与「新增条目」两条线，分别来自外部同步与自主计算。</p></div></div>"
      + tableHtml(x.upd)
      + "</div>"
      + '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>数据录入统计</h3>'
      + "<p>按清单「数据统计」要求，实时汇报数据总量、占用硬件空间与剩余硬件空间，并按固定周期辨别和删除重复数据。</p></div></div>"
      + '<div class="rw-steps">' + stats + "</div>"
      + "</div>";

    /* 当前任务的三类详情用子页签分开，一次只呈现一类，避免三张表纵向堆叠 */
    var view = s.collectTaskView || "trace";
    var subTabs = '<div class="rw-subtabs">'
      + '<button class="rw-subtab' + (view === "trace" ? " is-active" : "") + '" type="button" data-rw-act="collect-view" data-view="trace">来源追溯</button>'
      + '<button class="rw-subtab' + (view === "shard" ? " is-active" : "") + '" type="button" data-rw-act="collect-view" data-view="shard">分片状态</button>'
      + '<button class="rw-subtab' + (view === "issue" ? " is-active" : "") + '" type="button" data-rw-act="collect-view" data-view="issue">异常单（' + taskIssues.length + '）</button>'
      + "</div>";

    var conserveBanner = balanced
      ? '<div class="rw-banner" style="margin-top:12px"><span>✓</span><div>数量守恒校验通过：本任务全部分片满足「记录数 = 接收 + 拒收 + 重复 + 待补」，且「接收 = 转加工」。</div></div>'
      : '<div class="rw-banner rw-banner--err" style="margin-top:12px"><span>✕</span><div>数量守恒校验未通过，存在分片去向未登记。</div></div>';

    var taskIssueTable = taskIssues.length
      ? '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>异常单号</th><th>来源分片</th><th>异常类型</th><th>原因</th><th>处理动作</th><th>责任人</th><th>复核人</th><th>状态</th><th>恢复方式</th></tr></thead><tbody>'
        + taskIssues.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("")
        + "</tbody></table></div>"
      : '<div class="rw-empty" style="padding:22px 0">当前任务无未闭环异常单</div>';

    var detailBody = view === "shard"
      ? taskShardHtml + conserveBanner
      : view === "issue" ? taskIssueTable : traceHtml;

    /* 2026-10-08：圈红删除——「全库未闭环异常单」警示条与「当前任务」详情卡不再展示，
       任务详情可通过列表行「查看详情」弹窗查看；下方规范说明折叠区保留。 */
    return '<div class="rw-card">'
      + summaryHead
      + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>采集ID</th><th>数据来源</th><th>入库名称</th><th>数据整合报告</th><th>采集状态</th><th>操作</th></tr></thead><tbody>' + taskRows + "</tbody></table></div>"
      + "</div>"

      + '<details style="margin-top:8px;background:#fff;border-radius:8px;border:1px solid #e6ecf5;overflow:hidden">'
      + '<summary style="padding:16px 20px;cursor:pointer;font-weight:600;color:#22364f;list-style:none;outline:none">📋 规范说明：数据审核与整合 / 数据更新策略 / 数据录入统计</summary>'
      + '<div style="padding:0 20px 20px">' + rulesHtml + '</div></details>';
  }

  /* ================================================== 页签二：录入环闭环 */
  function entryClosureCards(view) {
    /* 这 6 张卡是「规范说明」，只在「录入规范说明」子 Tab 下出现，避免跟操作视图混在一起 */
    if (view !== "spec") return "";
    var perm = getS().approvals && getS().approvals["perm"];
    var permBanner = perm
      ? '<div class="rw-banner" style="margin-bottom:14px"><span>✓</span><div>数据录入权限申请已于 ' + esc(perm.at) + ' 提交，当前状态：' + esc(perm.status) + "；管理员审核通过后即可执行录入。</div></div>"
      : '<div class="rw-banner" style="margin-bottom:14px"><span>ⓘ</span><div>大规模录入前，请先提交「数据录入权限申请」，由管理员授予相应数据的读写权限。</div></div>';
    return permBanner
      + '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>数据资源录入权限</h3>'
      + "<p>管理员拥有数据录入最高权限，并可将读取 / 修改权限授予数据库工作人员；普通数据使用者不具有录入权限。</p></div></div>"
      + tableHtml(LOOP_PERM)
      + '<div style="margin-top:14px"><div class="rw-section-title">权限授予链路</div>'
      + chainHtml(["数据库工作人员提出申请", "管理员审核批准", "授予相应数据读写权限", "执行数据录入", "到期 / 任务完成后权限回收"])
      + "</div></div>"

      + '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>数据录入审批</h3>'
      + "<p>大规模数据录入须事先进行数据质量审核，防止错误数据污染数据库。</p></div>"
      + '<div><button class="rw-btn rw-btn--primary" type="button" data-rw-act="entry-apply-perm">提交权限申请</button></div></div>'
      + chainHtml(["提交录入申请", "事先数据质量审核", "管理员审批通过", "执行数据录入", "结果复核", "归档"])
      + "</div>"

      + '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>操作工单备案</h3>'
      + "<p>数据录入与删除操作均与工单号一一对应，数据出错时可回溯发生时间与相应负责人员。</p></div></div>"
      + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>工单号</th><th>操作类型</th><th>操作对象</th><th>操作人</th><th>审批人</th><th>操作时间</th><th>状态</th></tr></thead><tbody>'
      + workOrderRows().map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("")
      + "</tbody></table></div></div>"

      + '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>定期备份</h3>'
      + "<p>为减少硬件故障与人员误操作带来的损害，按下列策略定期备份并做完整性校验。</p></div></div>"
      + tableHtml(LOOP_BACKUP)
      + "</div>"

      + '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>质量控制</h3><p>对资料来源及录入汇总各环节进行监督，含准确性、整合性与及时性三项。</p></div></div>'
      + tableHtml(LOOP_QC)
      + "</div>"

      + '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>字段状态与证据类型</h3>'
      + "<p>字段按四级状态判定是否放行入库，evidence_type 标注每条数值的来源性质，两者共同构成可重复性凭证。</p></div></div>"
      + '<div class="rw-section-title">① 字段状态</div>' + tableHtml(LOOP_FIELD_STATUS)
      + '<div class="rw-section-title" style="margin-top:14px">② 证据类型（evidence_type）</div>' + tableHtml(LOOP_EVIDENCE)
      + "</div>";
  }

  /* ================================================== 页签三：加工环闭环 */
  function procClosureCards(view) {
    var x = MX();
    var s = getS();
    var doneMap = {};
    (s.handoffDone || []).forEach(function (id) { doneMap[id] = true; });
    var doneCount = 0;
    var handoffRows = x.handoff.map(function (r, idx) {
      var hid = "HO-" + C().code + "-" + ("000" + (idx + 1)).slice(-4);
      var isDone = doneMap[hid];
      if (isDone) doneCount += 1;
      return "<tr>"
        + "<td>" + esc(r[0]) + "</td>"
        + "<td>" + esc(r[1]) + "</td>"
        + '<td class="rw-nowrap">' + esc(r[2]) + "</td>"
        + "<td>" + esc(r[3]) + "</td>"
        + '<td><span class="rw-tag ' + (isDone ? "rw-tag--done" : "rw-tag--gray") + '">' + (isDone ? "已交接（" + hid + "）" : "待交接") + "</span></td>"
        + '<td class="rw-nowrap">'
        + (isDone
          ? '<button class="rw-op" type="button" data-rw-act="view-task" data-id="' + esc(hid) + '">查看交接单</button>'
          : '<button class="rw-op rw-op--primary" type="button" data-rw-act="proc-handoff" data-handoff="' + esc(hid) + '">发起交接</button>')
        + "</td></tr>";
    }).join("");

    var progressHtml = doneCount === x.handoff.length
      ? '<div class="rw-banner" style="margin-bottom:14px"><span>✓</span><div>本材料全部 ' + x.handoff.length + ' 项加工产物已交接完成，可进入下游「数据标准化」与「数据集入库」环节。</div></div>'
      : '<div class="rw-banner" style="margin-bottom:14px"><span>ⓘ</span><div>本材料共有 ' + x.handoff.length + ' 项加工产物等待交接，已交接 ' + doneCount + ' 项；点击「发起交接」推进至下游数据集。</div></div>';

    return (x.procNote
      ? '<div class="rw-banner"><span>ⓘ</span><div>' + esc(x.procNote) + "</div></div>"
      : "")
      /* 返工规则是参考说明，只在「加工规范说明」子页签出现，任务视图保持清爽 */
      + (view === "spec"
        ? '<div class="rw-card">'
          + '<div class="rw-card-head"><div><h3>加工返工与定向退回</h3>'
          + "<p>质量评价贯穿加工全过程；按失败类型退回指定节点，原执行日志全部保留，返工后可继续推进版本。</p></div></div>"
          + tableHtml(LOOP_REWORK)
          + "</div>"
        : "")

      + '<div class="rw-card">'
      + '<div class="rw-card-head"><div><h3>加工产物交接（对外出口）</h3>'
      + "<p>加工产物（V2.0）在此交接给下游「数据标准化」与「数据集入库」环节，交接清单按清单数据库模块逐项登记。</p></div></div>"
      + progressHtml
      + '<div style="margin-bottom:14px">' + chainHtml([
        "加工产物（V2.0）", "数据标准化（编号 23–27）",
        { text: "数据集入库（编号 28–51）", cls: "is-fork" },
        { text: "主题应用（编号 52–86）", cls: "is-end" }
      ]) + "</div>"
      + '<div class="rw-tbl-wrap"><table class="rw-tbl"><thead><tr><th>加工产物</th><th>目标数据集</th><th>目标模块（清单编号）</th><th>交接内容</th><th>交接状态</th><th>操作</th></tr></thead><tbody>'
      + handoffRows
      + "</tbody></table></div>"
      + "</div>";
  }

  /* ================================================== 采集任务详情：追溯信息 */
  function detailClosureHtml(t) {
    var x = MX();
    var row = null;
    x.trace.forEach(function (r) { if (r[0] === t.id) row = r; });
    if (!row) row = x.trace[0];
    /* 取该任务所属的第一个分片来展示数量守恒 */
    var firstShard = x.shards.filter(function (sh) { return sh.taskId === t.id; })[0] || x.shards[0];
    var v = shardView(firstShard);
    return '<div class="rw-section-title" style="font-size:14px">追溯信息</div>'
      + '<div class="rw-kv">'
      + "<div><b>批次ID</b>" + esc(row[0]) + "</div>"
      + "<div><b>source_id</b>" + esc(row[1]) + "</div>"
      + "<div><b>来源名称</b>" + esc(row[2]) + "</div>"
      + "<div><b>来源类型</b>" + esc(row[3]) + "</div>"
      + "<div><b>数据版本</b>" + esc(row[4]) + "</div>"
      + "<div><b>原始文件</b>" + esc(row[5]) + "</div>"
      + "<div><b>SHA-256</b>" + esc(row[6]) + "</div>"
      + "<div><b>采集时间</b>" + esc(row[7]) + "</div>"
      + "</div>"
      + '<div class="rw-section-title" style="font-size:14px">数量守恒（分片 ' + esc(v.id) + "）</div>"
      + '<div class="rw-kv">'
      + "<div><b>记录数</b>" + v.n + " 条</div>"
      + "<div><b>接收</b>" + v.acc + " 条</div>"
      + "<div><b>拒收</b>" + v.rej + " 条</div>"
      + "<div><b>重复</b>" + v.dup + " 条</div>"
      + "<div><b>待补</b>" + v.pend + " 条</div>"
      + "<div><b>转加工</b>" + v.acc + " 条</div>"
      + "</div>";
  }

  /* ------------------------------------------------------------ 交互处理 */
  function handleAct(act, node) {
    var s = getS();
    var c = s.create;
    switch (act) {
      case "tab":
        s.tab = node.getAttribute("data-rw-tab") || "collect";
        s.auditOpen = false;
        if (s.tab === "collect") s.focusTaskId = "";
        renderRwPage();
        return;
      case "open-audit":
        s.auditOpen = true;
        renderRwPage();
        return;
      /* 注意：act 名用 collect-audit-back，避免和资源录入页录入审核的「退回」（audit-back）撞车 */
      case "collect-audit-back":
        s.auditOpen = false;
        renderRwPage();
        return;
      case "open-audit-modal":
        s.auditId = node.getAttribute("data-id") || "";
        renderAuditModal();
        return;
      case "submit-audit":
        submitAudit();
        return;
      case "shard-retry":
        /* 失败分片定向重试：待补归零、接收补满，对应异常单自动关闭 */
        (function () {
          var sid = node.getAttribute("data-shard") || "";
          if (!sid) return;
          var m = shardRetryMap();
          m[sid] = (m[sid] || 0) + 1;
          renderRwPage();
          toast("分片 " + sid + " 已重新采集，待补记录全部补回，数量守恒重新校验通过", "ok");
        })();
        return;
      case "entry-apply-perm":
        getS().approvals["perm"] = { status: "已提交", at: nowText() };
        renderRwPage();
        toast("数据录入权限申请已提交，等待系统管理员审核", "ok");
        return;
      case "proc-handoff":
        (function () {
          var hid = node.getAttribute("data-handoff") || "";
          var s = getS();
          if (s.handoffDone.indexOf(hid) < 0) s.handoffDone.push(hid);
          renderRwPage();
          toast("加工产物已发起交接，单号 " + hid + "，等待标准化入库", "ok");
        })();
        return;
      case "open-create":
        openCreate();
        return;
      case "close-create":
        closeCreate();
        return;
      case "intro":
        openIntro();
        return;
      case "close-intro":
        closeIntro();
        return;
      case "close-detail":
        closeDetail();
        return;
      case "view-task":
        openDetail(node.getAttribute("data-id") || "");
        return;
      case "select-task":
        getS().collectTaskId = node.getAttribute("data-id") || "";
        renderRwPage();
        return;
      case "collect-view":
        getS().collectTaskView = node.getAttribute("data-view") || "trace";
        renderRwPage();
        return;
      case "to-entry":
        closeDetail();
        s.tab = "entry";
        s.focusTaskId = node.getAttribute("data-id") || "";
        renderRwPage();
        return;
      case "detail-to-entry":
        var did = node.getAttribute("data-id") || "";
        closeDetail();
        if (c) closeCreate();
        s.tab = "entry";
        s.focusTaskId = did;
        renderRwPage();
        return;
      case "entry-confirm":
        var eid = node.getAttribute("data-id") || "";
        if (s.entryDone.indexOf(eid) < 0) s.entryDone.push(eid);
        renderRwPage();
        toast("采集数据 " + eid + " 已确认录入", "ok");
        return;
      case "proc-confirm":
        var pid = node.getAttribute("data-id") || "";
        if (s.procDone.indexOf(pid) < 0) s.procDone.push(pid);
        renderRwPage();
        toast("数据 " + pid + " 已确认加工，版本推进至 V2.0", "ok");
        return;
      case "flow-jump":
        var idx = Number(node.getAttribute("data-rw-step")) + 1;
        var cards = document.querySelectorAll('[data-rw-proc-card]');
        for (var i = 0; i < cards.length; i++) cards[i].style.boxShadow = "";
        var target = document.querySelector('[data-rw-proc-card="' + idx + '"]');
        if (target) {
          target.style.boxShadow = "0 0 0 3px rgba(31,99,255,.16)";
          if (target.scrollIntoView) target.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          /* 加工任务视图下：直接进入某个任务的六步加工流程对应步骤 */
          var jobs = procJobs();
          if (!jobs.length) {
            newJob();
            var j0 = activeJob();
            if (j0) { j0.step = idx; renderProcWizard(); }
          } else {
            procState().activeId = jobs[0].id;
            var j1 = activeJob();
            if (j1) {
              j1.step = Math.min(idx, Math.max(1, Object.keys(j1.done).length + 1));
              openProcWizard();
            }
          }
        }
        return;

      /* ---- 资源录入工作台 ---- */
      case "entry-view":
        entryState().view = node.getAttribute("data-view") || "todo";
        rerenderBody();
        return;
      case "entry-batch":
        /* 2026-10-08：批量导入功能暂时下线，动作入口一并拦下 */
        if (HIDE_ENTRY_BATCH) { toast("批量导入功能暂未开放，请使用「新增材料（单条录入）」", "err"); return; }
        openBatchEntry(node.getAttribute("data-source") || "mp");
        return;
      case "entry-manual":
        openManualEntry(node.getAttribute("data-source") || "", node.getAttribute("data-task") || "");
        return;
      case "std-all":
        (function () {
          var m = entryState().manual;
          if (!m) return;
          m.stdRules = stdRuleGroups().map(function (r) { return r.id; });
          renderManualEntry();
        })();
        return;
      case "std-none":
        (function () {
          var m = entryState().manual;
          if (!m) return;
          m.stdRules = [];
          renderManualEntry();
        })();
        return;
      case "entry-audit-open":
        entryState().auditId = node.getAttribute("data-id") || "";
        renderEntryAuditModal();
        return;
      case "entry-audit-close":
        closeMask("rwEntryAuditMask");
        entryState().auditId = "";
        return;
      case "entry-audit-submit":
        submitEntryAudit();
        return;
      case "entry-form-close":
        entryState().manual = null;
        closeMask("rwEntryMask");
        return;
      case "entry-demo-cif":
        entryState().manual.file = C().demoFile;
        renderManualEntry();
        return;
      case "entry-parse-cif":
        (function () {
          var m = entryState().manual;
          if (!m || !m.file) { toast("请先选择结构文件", "err"); return; }
          /* 解析结果按材料配置回填：只填当前材料表单里真实存在的字段 */
          var parsed = C().demoParse || {};
          Object.keys(parsed).forEach(function (k) {
            if (Object.prototype.hasOwnProperty.call(m.form, k)) m.form[k] = parsed[k];
          });
          validateManualForm();
          renderManualEntry();
          toast("已解析 " + m.file + "，结构字段已自动填充", "ok");
        })();
        return;
      case "entry-check-calc":
        recomputeCalcIssues(false);
        toast(entryState().manual.calcIssues.length ? "发现 " + entryState().manual.calcIssues.length + " 项参数不合规" : "计算参数全部符合标准阈值",
          entryState().manual.calcIssues.length ? "err" : "ok");
        return;
      case "entry-mark-low":
        entryState().manual.lowPrecision = true;
        renderManualEntry();
        toast('已选择按「低精度」提交', "ok");
        return;
      case "entry-submit":
        submitManualEntry();
        return;
      case "record-close":
        closeMask("rwRecordMask");
        return;
      case "entry-to-proc":
        var rid = node.getAttribute("data-id") || "";
        closeMask("rwRecordMask");
        procState().view = "jobs";
        getS().tab = "process";
        renderRwPage();
        toast("已切换到资源加工，可新建加工任务并选择 " + rid, "ok");
        return;

      /* ---- 批量导入 ---- */
      case "batch-source":
        entryState().batch.sourceKey = node.getAttribute("data-source") || "mp";
        renderBatchEntry();
        return;
      case "batch-close":
        entryState().batch = null;
        closeMask("rwBatchMask");
        return;
      case "batch-prev":
        entryState().batch.step = Math.max(1, entryState().batch.step - 1);
        renderBatchEntry();
        return;
      case "batch-next":
        (function () {
          var b = entryState().batch;
          if (b.step === 2 && !b.fileList.length) { toast("请先解析数据包", "err"); return; }
          if (b.step === 3 && !b.mapping.length) { toast("请先解析数据包", "err"); return; }
          if (b.step === 4 && !b.rows.length) { toast("请先执行自动审核", "err"); return; }
          b.step = Math.min(5, b.step + 1);
          renderBatchEntry();
        })();
        return;
      case "batch-parse":
        batchParse();
        return;
      case "batch-demo-files":
        entryState().batch.files = ["materials.json", "structures.cif", "properties.csv", "meta.yaml"];
        renderBatchEntry();
        return;
      case "batch-clear-files":
        entryState().batch.files = [];
        entryState().batch.fileList = [];
        entryState().batch.mapping = [];
        entryState().batch.rows = [];
        entryState().batch.log = [];
        entryState().batch.stage = 0;
        renderBatchEntry();
        return;
      case "batch-fix-row":
        (function () {
          var b = entryState().batch;
          var i2 = Number(node.getAttribute("data-row"));
          var r = b.rows[i2];
          if (!r) return;
          var v = window.prompt("人工处理：请输入 " + r.formula + " 的修正后" + C().metric.label + "（" + C().metric.unit.trim() + "）", "1.68");
          if (v == null) return;
          r[C().metric.key] = v;
          r.metric = v + C().metric.unit;
          r.cross = "人工复核一致";
          r.repeat = "人工复核可复现";
          r.fmt = "单位已统一";
          r.bad = false;
          batchLog(b, "ok", "人工处理完成：" + r.formula + " → " + C().metric.label + " " + v + C().metric.unit);
          renderBatchEntry();
          toast("已修正 " + r.formula + "，可继续入库", "ok");
        })();
        return;
      case "batch-confirm":
        batchConfirm();
        return;

      /* ---- 录入审核 ---- */
      case "audit-auto":
        auditAuto(node.getAttribute("data-id") || "");
        return;
      case "audit-back":
        auditBack(node.getAttribute("data-id") || "", node.getAttribute("data-stage") || "审核");
        return;
      case "audit-detail":
        auditDetail(node.getAttribute("data-id") || "");
        return;
      case "audit-ops":
        (function () {
          var rid2 = node.getAttribute("data-id") || "";
          closeMask("rwRecordMask");
          getS().tab = "entry";
          entryState().view = "audit";
          renderRwPage();
          toast("已切换到录入审核队列，可继续审核 " + rid2, "ok");
        })();
        return;

      /* ---- 资源加工工作台 ---- */
      case "proc-view":
        procState().view = node.getAttribute("data-view") || "jobs";
        rerenderBody();
        return;
      case "proc-new":
        newJob();
        return;
      case "proc-open":
        procState().activeId = node.getAttribute("data-id") || "";
        closeMask("rwProcReportMask");
        openProcWizard();
        return;
      case "proc-report":
        procReport(node.getAttribute("data-id") || "");
        return;
      case "proc-report-close":
        closeMask("rwProcReportMask");
        return;
      case "proc-del":
        (function () {
          var jid = node.getAttribute("data-id") || "";
          var p = procState();
          p.jobs = p.jobs.filter(function (x) { return x.id !== jid; });
          if (p.activeId === jid) p.activeId = "";
          renderRwPage();
          toast("已删除加工任务 " + jid);
        })();
        return;
      case "proc-close":
        procState().activeId = "";
        closeMask("rwProcMask");
        return;
      case "proc-prev":
        (function () {
          var j = activeJob();
          if (!j) return;
          j.step = Math.max(1, j.step - 1);
          renderProcWizard();
        })();
        return;
      case "proc-next":
        (function () {
          var j = activeJob();
          if (!j) return;
          /* 步骤 1：数据策划必填校验；步骤 2：至少勾选一类基础数据 */
          if (j.step === 1) {
            if (!String(j.name || "").trim()) { toast("请填写加工任务名称", "err"); return; }
            if (!String(j.spec.purpose || "").trim()) { toast("请选择目标用途", "err"); return; }
            if (!String(j.spec.format || "").trim()) { toast("请选择输出格式", "err"); return; }
            if (!String(j.spec.productForm || "").trim()) { toast("请选择数据产品形式", "err"); return; }
            if (!String(j.spec.desc || "").trim()) { toast("请填写内容", "err"); return; }
            if (!j.done[1]) procDone(j, 1);
          } else if (j.step === 2) {
            if (!(j.basis || []).length) { toast("请至少勾选一类基础数据（计算数据 / 文件数据 / 集成化基础数据）", "err"); return; }
            if (!j.done[2]) procDone(j, 2);
          }
          j.step = Math.min(6, j.step + 1);
          renderProcWizard();
        })();
        return;
      case "proc-goto":
        (function () {
          var j = activeJob();
          if (!j) return;
          var st = Number(node.getAttribute("data-step"));
          if (st > j.step && !j.done[j.step]) { toast("请先完成当前步骤", "err"); return; }
          j.step = st;
          renderProcWizard();
        })();
        return;
      case "proc-finish":
        procFinish();
        return;
      case "proc-run-1": case "proc-run-2": case "proc-run-3":
      case "proc-run-4": case "proc-run-5": case "proc-run-6":
        procRun(Number(String(act).replace("proc-run-", "")));
        return;
      case "proc-outlier-fix":
        (function () {
          var j = activeJob();
          if (!j) return;
          var key2 = node.getAttribute("data-v");
          var o = j.pre.outliers.filter(function (x) { return x.key === key2; })[0];
          if (!o) return;
          var inp = document.querySelector('[data-rw-pf="outlierFix"][data-v="' + key2 + '"]');
          if (inp) o.fixed = inp.value;
          if (!String(o.fixed || "").trim()) { toast("请输入修正值", "err"); return; }
          o.keep = false;
          renderProcWizard();
          toast("已确认修正：" + o.name + " → " + o.fixed, "ok");
        })();
        return;
      case "proc-outlier-keep":
        (function () {
          var j = activeJob();
          if (!j) return;
          var key3 = node.getAttribute("data-v");
          var o2 = j.pre.outliers.filter(function (x) { return x.key === key3; })[0];
          if (!o2) return;
          o2.keep = true;
          o2.fixed = "";
          renderProcWizard();
          toast("已标注保留：" + o2.name, "ok");
        })();
        return;
      case "proc-quality-fix":
        procQualityFix(node.getAttribute("data-key") || "");
        return;
      case "proc-goto-entry":
        /* 加工无可用数据源时，一键跳到资源录入页签（先关向导，避免遮罩挡住页面） */
        (function () {
          procState().activeId = "";
          closeMask("rwProcMask");
          var s2 = getS();
          s2.tab = "entry";
          entryState().view = "todo";
          renderRwPage();
          var t = document.querySelector('[data-rw-root="page"] .rw-tab[data-rw-tab="entry"]');
          if (t && t.scrollIntoView) t.scrollIntoView({ block: "center" });
          toast("已切换到「资源录入」，完成审核入库后即可回来加工", "ok");
        })();
        return;
    }
    if (!c) return;
    switch (act) {
      case "next":
        syncFromDom();
        if (c.step === 1) {
          if (!String(c.name || "").trim()) { c.error = "请填写入库名称"; renderCreateModal(); return; }
          c.error = "";
          c.step = 2;
        } else if (c.step === 2) {
          c.error = "";
          c.step = 3;
        }
        renderCreateModal();
        return;
      case "prev":
        syncFromDom();
        c.error = "";
        c.step = Math.max(1, c.step - 1);
        renderCreateModal();
        return;
      case "run-collect":
        runCollect();
        return;
      case "skip-to-confirm":
        syncFromDom();
        if (!c.result || c.result.kind === "fail") { c.error = "请先完成采集 / 校验"; renderCreateModal(); return; }
        c.error = "";
        c.step = 3;
        renderCreateModal();
        return;
      case "submit-task":
        submitTask();
        return;
      case "range-add":
        syncFromDom();
        c.params.ranges.push({ property: "", min: "", max: "", unit: "" });
        renderCreateModal();
        return;
      case "range-del":
        syncFromDom();
        c.params.ranges.splice(Number(node.getAttribute("data-row")), 1);
        if (!c.params.ranges.length) c.params.ranges.push({ property: "", min: "", max: "", unit: "" });
        renderCreateModal();
        return;
      case "pick-del":
        syncFromDom();
        (function () {
          var dbKey = node.getAttribute("data-db");
          var dsName = node.getAttribute("data-name");
          var src = (c.method === "buy" ? BUY_DBS : OPEN_DBS).filter(function (d) { return d.key === dbKey; })[0];
          if (!src) return;
          src.datasets.forEach(function (d, i) { if (d.name === dsName) delete c.dbPick[dbKey + "::" + i]; });
        })();
        renderCreateModal();
        return;
      case "calc-demo-files":
        c.calc.files = { INCAR: "INCAR", POSCAR: "POSCAR", POTCAR: "POTCAR", KPOINTS: "KPOINTS" };
        c.calc.missingAlert = false;
        c.error = "";
        renderCreateModal();
        return;
      case "calc-clear-files":
        c.calc.files = {};
        c.calc.validated = false;
        c.calc.report = null;
        c.calc.missingAlert = false;
        c.result = null;
        c.error = "";
        renderCreateModal();
        return;
      case "calc-recalc":
        c.calc.files = {};
        c.calc.validated = false;
        c.calc.report = null;
        c.calc.missingAlert = false;
        c.result = null;
        c.error = "";
        renderCreateModal();
        toast("已重置，请修改计算参数后重新上传输入文件");
        return;
      case "calc-lowq":
        c.calc.quality = "低精度";
        if (c.result) { c.result.quality = "低精度"; c.result.security = "第2级"; }
        c.step = 3;
        c.error = "";
        renderCreateModal();
        toast("已按「低精度」标注入库，请确认最终信息", "ok");
        return;
    }
  }

  function bindEvents() {
    if (document.body.dataset.rwBound === "true") return;
    document.body.dataset.rwBound = "true";

    document.addEventListener("click", function (event) {
      var node = event.target && event.target.closest ? event.target.closest("[data-rw-act]") : null;
      if (!node) return;
      var tag = (event.target.tagName || "").toUpperCase();
      if (tag !== "INPUT") event.preventDefault();
      event.stopImmediatePropagation();
      handleAct(node.getAttribute("data-rw-act"), node);
    }, true);

    var FIELD_SEL = "[data-rw-f],[data-rw-ef],[data-rw-ec],[data-rw-bf],[data-rw-pf],[data-rw-es]";

    document.addEventListener("change", function (event) {
      var el = event.target && event.target.closest ? event.target.closest(FIELD_SEL) : null;
      if (!el) return;
      event.stopImmediatePropagation();
      var isCheck = el.type === "checkbox";
      var v = isCheck ? !!el.checked : el.value;

      if (el.hasAttribute("data-rw-f")) {
        var f = el.getAttribute("data-rw-f");
        syncFromDom();
        if (f === "method" || f === "materialType" || f === "dbAll" || f === "ds" || f === "calcOut" || f === "calcFiles" || f === "collectObject") renderCreateModal();
        return;
      }
      if (el.hasAttribute("data-rw-ef")) {
        var m = entryState().manual;
        if (!m) return;
        var k = el.getAttribute("data-rw-ef");
        m.form[k] = el.value;
        if (k === "dataType") {
          m.previewId = C().code + "-" + (DATA_TYPE_CODES[el.value] || "GEN") + "-" + ("000" + (entryState().seq + 1)).slice(-4);
          renderManualEntry();
          return;
        }
        validateManualForm(k);
        refreshManualErrors();
        return;
      }
      if (el.hasAttribute("data-rw-ec")) {
        var m2 = entryState().manual;
        if (!m2) return;
        m2.calc[el.getAttribute("data-rw-ec")] = el.value;
        recomputeCalcIssues(true);
        refreshManualErrors();
        return;
      }
      if (el.hasAttribute("data-rw-es")) {
        /* 关联配置规范的勾选 */
        var m4 = entryState().manual;
        if (!m4) return;
        var rid = el.getAttribute("data-rw-es");
        if (!m4.stdRules) m4.stdRules = [];
        var ix4 = m4.stdRules.indexOf(rid);
        if (el.checked && ix4 < 0) m4.stdRules.push(rid);
        if (!el.checked && ix4 >= 0) m4.stdRules.splice(ix4, 1);
        refreshStdCount();
        return;
      }
      if (el.hasAttribute("data-rw-bf")) {
        var b = entryState().batch;
        if (b) b[el.getAttribute("data-rw-bf")] = v;
        return;
      }
      if (el.hasAttribute("data-rw-pf")) {
        var j = activeJob();
        if (!j) return;
        var kp = el.getAttribute("data-rw-pf");
        if (kp === "name") j.name = v;
        else if (kp === "purpose") j.spec.purpose = v;
        else if (kp === "format") j.spec.format = v;
        else if (kp === "precision") j.spec.precision = v;
        else if (kp === "productForm") j.spec.productForm = v;
        else if (kp === "basis") {
          /* 步骤 2 基础数据勾选（计算数据 / 文件数据 / 集成化基础数据） */
          j.basis = j.basis || [];
          var bv = el.getAttribute("data-v");
          var bi = j.basis.indexOf(bv);
          if (v && bi < 0) j.basis.push(bv);
          if (!v && bi >= 0) j.basis.splice(bi, 1);
          /* 实时刷新卡片高亮与计数，不重渲染整个弹窗 */
          var lb = el.closest ? el.closest(".rw-ds") : null;
          if (lb) lb.classList.toggle("is-on", !!v);
          var cnt = document.querySelector("#rwProcMask .rw-basis-count b");
          if (cnt) cnt.textContent = String(j.basis.length);
        }
        else if (kp === "desc") j.spec.desc = v;
        else if (kp === "minGroup") j.filter.minPerGroup = v;
        else if (kp === "groupBy") j.filter.groupByFormula = v;
        else if (kp === "source") {
          var id = el.getAttribute("data-id");
          j.sourceIds = j.sourceIds || [];
          var ix = j.sourceIds.indexOf(id);
          if (v && ix < 0) j.sourceIds.push(id);
          if (!v && ix >= 0) j.sourceIds.splice(ix, 1);
        } else if (kp === "level") {
          var lv = el.getAttribute("data-v");
          var il = j.filter.levels.indexOf(lv);
          if (v && il < 0) j.filter.levels.push(lv);
          if (!v && il >= 0) j.filter.levels.splice(il, 1);
        } else if (kp === "preOpt") {
          j.pre.opts[el.getAttribute("data-v")] = v;
        } else if (kp === "productDs") {
          /* 步骤 5：数据产品按数据集划分，勾选本次产出归入的数据集 */
          j.product.datasets = j.product.datasets || [];
          var dv = el.getAttribute("data-v");
          var di = j.product.datasets.indexOf(dv);
          if (v && di < 0) j.product.datasets.push(dv);
          if (!v && di >= 0) j.product.datasets.splice(di, 1);
          /* 实时刷新卡片高亮与计数，不重渲染整个弹窗 */
          var dl = el.closest ? el.closest(".rw-pds") : null;
          if (dl) dl.classList.toggle("is-on", !!v);
          var dc = document.querySelector("#rwProcMask .rw-ds-count");
          if (dc) dc.textContent = String(j.product.datasets.length);
        } else if (kp === "model") j.model.key = v;
        else if (kp === "product") j.product.key = v;
        else if (kp === "outlierFix") {
          var o = j.pre.outliers.filter(function (x) { return x.key === el.getAttribute("data-v"); })[0];
          if (o) o.fixed = v;
        }
        markChecked(el);
        return;
      }
    }, true);

    document.addEventListener("input", function (event) {
      var el = event.target && event.target.closest ? event.target.closest("[data-rw-f],[data-rw-ef],[data-rw-ec],[data-rw-pf]") : null;
      if (!el) return;
      if (el.hasAttribute("data-rw-f")) {
        var f = el.getAttribute("data-rw-f");
        if (f === "name" || f === "desc" || f === "range" || f === "calcSystem") syncFromDom();
        return;
      }
      if (el.hasAttribute("data-rw-ef")) {
        var m = entryState().manual;
        if (m) m.form[el.getAttribute("data-rw-ef")] = el.value;
        return;
      }
      if (el.hasAttribute("data-rw-ec")) {
        var m2 = entryState().manual;
        if (m2) {
          m2.calc[el.getAttribute("data-rw-ec")] = el.value;
          recomputeCalcIssues(true);
        }
        return;
      }
      if (el.hasAttribute("data-rw-pf")) {
        var j = activeJob();
        if (!j) return;
        var kp = el.getAttribute("data-rw-pf");
        if (kp === "name") j.name = el.value;
        else if (kp === "desc") j.spec.desc = el.value;
        else if (kp === "minGroup") j.filter.minPerGroup = el.value;
        else if (kp === "outlierFix") {
          var o = j.pre.outliers.filter(function (x) { return x.key === el.getAttribute("data-v"); })[0];
          if (o) o.fixed = el.value;
        }
      }
    }, true);

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeIntro();
        closeDetail();
        if (document.getElementById("rwMask")) closeCreate();
      }
    }, true);
  }

  /* ------------------------------------------------------------ 接入渲染链 */
  /* __rwMatCfgInjected begin */
  /* ==================================================================
     材料配置表：五类材料共用同一套界面逻辑，只在渲染前切换配置
     ------------------------------------------------------------------
     数据来源：需求规格说明书（低维材料主题库）
       · R14~R17 有机光电材料数据采集加工处理（对象 / 采集 / 录入 / 加工）
       · R18~R21 电解质材料数据采集加工处理
       · R22~R24 机器学习力场数据采集加工处理（加工合并在 R24）
       · R25     催化材料数据采集加工处理（数据资源对象）
     ================================================================== */
  var PAGE_KEYS = {
    "lowdim-ingest-twod": "twod",
    "lowdim-ingest-opto": "opto",
    "lowdim-ingest-electrolyte": "electrolyte",
    "lowdim-ingest-mlff": "mlff",
    "lowdim-ingest-catalyst": "catalyst"
  };

  function keyOf(pid) { return PAGE_KEYS[pid] || ""; }

  var CFG_KEY = "twod";
  var MAT = {};

  function C() { return MAT[CFG_KEY] || MAT.twod; }

  /* ------------------------------------------------------------ 二维材料 */
  MAT.twod = {
    code: "2D",
    short: "二维材料",
    title: "二维材料数据采集加工处理",
    headDesc: "面向二维材料数据的采集、录入与加工全流程管理：支持开源数据库 API 采集、已购 / 自采数据导入与 VASP 计算数据提取，<br>内置字段级校验、异常处理队列与质量评价规则，采集结果确认后统一入库。",
    introTitle: "二维材料数据库共包含 8 大资源对象，采集 / 录入 / 加工均围绕这些对象展开。",
    introBanner: "八大资源对象：结构特征、电子结构、电学性质、磁学性质、热学性质、力学性质、光学性质及缺陷性质。各资源对象包含的数据字段如下：",
    introTip: "采集参数中的「性质范围」即针对上述资源对象的性质字段设置取值范围，用于过滤落在范围外的数据记录。",
    objectsNote: "二维材料八大资源对象",
    typeTip: "选择本次采集的二维材料类型，不同类型对应不同的性质字段模板。",
    buyNote: "仅展示当前账号已完成采购或已完成自采登记的数据库，勾选后可从对应数据包中导入二维材料数据。",
    calcTip: "二维材料计算须设置真空层 ≥ 15 Å、K 点密度 ≥ 15 Å⁻¹，参数不合规将进入合规性校验报告分支。",
    taskNamePh: "请输入采集任务名称，如：过渡金属硫族化合物（MoS2）电子结构数据采集",
    doneNote: "审核通过并完成入库的二维材料数据，可直接送去资源加工。",
    objects: null,               /* null = 沿用 04.js 的 TWOD_TASK_RESOURCE_OBJECTS */
    systems: null,               /* null = 沿用 04.js 的 TWOD_MATERIAL_TYPES */
    methods: null,
    openDbs: null,
    buyDbs: null,
    dbVersions: { mp: "v2024.11", c2db: "v3.2", "2dmatpedia": "v2023.09", "b-c2db": "v3.2", "b-icsd": "v2.8", "b-2dm": "v1.6", "b-self": "V0.0（自采）" },
    calcOutputs: null,
    calcInputs: null,
    calcInputDesc: null,
    calcCompliance: null,
    mediaExt: "cif",
    payloadTitle: "结构信息 / 能带数据 / 态密度",
    payload: null,
    payloadJson: null,
    entryMethodRows: null,
    entrySources: null,
    dataTypeCodes: null,
    entryManualFields: null,
    entryCalcParams: null,
    entryManualSteps: null,
    entryBatchSteps: null,
    entryRules: null,
    manualDefaults: { form: { dataType: "结构特征" }, calc: { software: "VASP", functional: "PBE", encut: "450", kpoints: "18", force: "0.01", vacuum: "16" } },
    demoFile: "MoS2.cif",
    demoParse: { formula: "MoS2", crystal: "Hexagonal", spaceGroup: "P6₃/mmc", la: "3.16", lb: "3.16", lc: "12.30", coords: "Mo 0.000 0.000 0.250\nS 0.333 0.667 0.620", bandGap: "1.68", formationEnergy: "-1.24", thickness: "6.15" },
    procFlow: null,
    procStepTitles: null,
    procS1: null, procS2: null, procS3: null, procS4: null, procS5: null, procS6: null, procVersion: null,
    procModels: null, procProducts: null, procQuality: null,
    modelRows: {
      stat: [
        { item: "带隙（MoS2）", input: "1.62 / 1.70 / 1.72 eV", logic: "计算均值、标准差、置信区间", out: "1.68 ± 0.05 eV（95% CI：1.64 ~ 1.72）" },
        { item: "形成能（MoS2）", input: "-1.20 / -1.26 / -1.26 eV/atom", logic: "计算均值、标准差、置信区间", out: "-1.24 ± 0.03 eV/atom" }
      ],
      image: [
        { item: "能带图", input: "band_raw.png（1024×768，坐标轴不一致）", logic: "统一坐标轴、分辨率、标注、格式", out: "band_std.png（1600×1200，统一标注）" },
        { item: "态密度图", input: "dos_raw.png（800×600）", logic: "统一坐标轴、分辨率、标注、格式", out: "dos_std.png（1600×1200，统一标注）" }
      ],
      struct: [
        { item: "MoS2 结构", input: "MoS2.cif", logic: "校验原子坐标合理性、键长范围", out: "MoS2_verified.cif（键长 2.41 Å，合理）" },
        { item: "WS2 结构", input: "WS2.cif", logic: "校验原子坐标合理性、键长范围", out: "WS2_verified.cif（键长 2.42 Å，合理）" }
      ]
    },
    outliers: [
      { key: "o1", name: "MoS2 · 带隙", value: "11.6 eV", sigma: "4.2σ", fixed: "", keep: false },
      { key: "o2", name: "WS2 · 形成能", value: "+0.38 eV/atom", sigma: "3.6σ", fixed: "", keep: false }
    ],
    procNamePh: "如：MoS2 电子结构数据产品加工",
    listCols: [{ key: "crystal", label: "晶系" }, { key: "spaceGroup", label: "空间群" }, { key: "bandGap", label: "带隙", unit: " eV" }],
    metric: { key: "bandGap", label: "带隙", unit: " eV" },
    batchSamples: [
      { formula: "MoS2", dataType: "结构特征", crystal: "Hexagonal", spaceGroup: "P6₃/mmc", bandGap: "1.68", quality: "高精度" },
      { formula: "WS2", dataType: "电子结构", crystal: "Hexagonal", spaceGroup: "P6₃/mmc", bandGap: "1.98", quality: "高精度" },
      { formula: "CrI3", dataType: "磁学性质", crystal: "Trigonal", spaceGroup: "R-3", bandGap: "0.85", quality: "低精度" },
      { formula: "Ti3C2", dataType: "电学性质", crystal: "Hexagonal", spaceGroup: "P6₃/mmc", bandGap: "0.00", quality: "高精度" }
    ],
    /* 2026-10-08：数据产品按数据集划分，清单与数据库（04.js LOWDIM_DB_OVERVIEW_CONFIGS）逐项对齐，
       加工产出的每个数据产品都明确归入所属数据集，字段/格式/存量均与数据库一致。 */
    datasets: [
      { key: "structure", title: "结构特征数据集", format: "Parquet / CIF", volume: 9460, fields: ["原子结构图", "化学式", "晶胞参数", "层厚", "原子坐标", "键长键角", "晶系", "空间群"], desc: "收录二维材料结构特征相关标准化数据，涵盖原子结构图、化学式、晶胞参数、原子坐标、键长键角、晶系和空间群等信息。" },
      { key: "electronic", title: "电子结构数据集", format: "CSV / DAT", volume: 4200, fields: ["能带结构", "态密度", "有效质量"], desc: "收录二维材料电子结构相关标准化数据，提供能带结构、态密度和电子有效质量等可追溯数据。" },
      { key: "electrical", title: "电学性质数据集", format: "CSV / JSON", volume: 4560, fields: ["铁电性质", "压电性质"], desc: "收录二维材料电学性质相关标准化数据，覆盖铁电性质与压电性质及其测试条件信息。" },
      { key: "magnetic", title: "磁学性质数据集", format: "CSV / JSON", volume: 4980, fields: ["磁基态构型", "磁转变温度"], desc: "收录二维材料磁学性质相关标准化数据，包含磁基态构型和磁转变温度（居里温度）。" },
      { key: "thermal", title: "热学性质数据集", format: "CSV / DAT", volume: 2480, fields: ["形成能", "声子谱", "声子态密度"], desc: "收录二维材料热学性质相关标准化数据，包含形成能、声子谱和声子态密度。" },
      { key: "mechanical", title: "力学性质数据集", format: "CSV / JSON", volume: 1680, fields: ["弹性常数", "杨氏模量", "泊松比"], desc: "收录二维材料力学性质相关标准化数据，包含弹性常数、杨氏模量和泊松比。" },
      { key: "optical", title: "光学性质数据集", format: "CSV / DAT", volume: 2160, fields: ["介电函数", "光吸收系数", "反射率", "折射率", "消光系数"], desc: "收录二维材料光学性质相关标准化数据，涵盖介电函数、光吸收系数、反射率、折射率和消光系数。" },
      { key: "defect", title: "缺陷性质数据集", format: "CSV / JSON", volume: 1080, fields: ["空位缺陷", "反位缺陷"], desc: "收录二维材料缺陷性质相关标准化数据，包含空位缺陷与反位缺陷的构型和形成能。" }
    ],
    tasks: null
  };

  /* -------------------------------------------------- 有机光电材料（R14~R17） */
  MAT.opto = {
    code: "OP",
    short: "有机光电材料",
    title: "有机光电材料数据采集加工处理",
    headDesc: "面向有机光电材料数据的采集、录入与加工全流程管理：支持 PubChem / CCDC 开源抓取与文献解析、SciFinder / Reaxys 商用数据导入与 Gaussian16 自主计算提取，<br>内置分子级字段校验、异常处理队列与质量评价规则，采集结果确认后统一入库。",
    introTitle: "有机光电材料数据库数据资源共包含 4 类核心对象，采集 / 录入 / 加工均围绕这些对象展开。",
    introBanner: "4 类核心对象：基础信息对象、物理性质对象、表征图谱对象、计算数据对象。各资源对象包含的数据字段如下：",
    introTip: "采集参数中的「性质范围」即针对上述资源对象的性质字段设置取值范围，用于过滤落在范围外的数据记录。",
    objectsNote: "有机光电材料 4 类核心对象",
    typeTip: "选择本次采集的有机光电材料类型，不同类型对应不同的性质字段模板。",
    buyNote: "仅展示当前账号已完成采购或已完成自采登记的数据库，勾选后可从对应数据包中导入有机光电材料数据。",
    calcTip: "有机分子激发态计算建议采用 B3LYP 及以上精度的泛函，并显式声明溶剂模型，参数不合规将进入合规性校验报告分支。",
    taskNamePh: "请输入采集任务名称，如：OLED 发光分子（DPP-DTT）激发能数据采集",
    doneNote: "审核通过并完成入库的有机光电材料数据，可直接送去资源加工。",
    objects: [
      { name: "基础信息对象", fields: "中英文名称、分子式、分子量、分子编号、三维结构（原子坐标、键长键角）" },
      { name: "物理性质对象", fields: "密度、熔点、沸点、闪点、折射率、溶解性" },
      { name: "表征图谱对象", fields: "红外光谱、拉曼光谱、核磁共振谱（原始数据 + 图谱图片）" },
      { name: "计算数据对象", fields: "基态 / 激发态结构、激发能、发射能、跃迁偶极矩、HOMO-LUMO、溶剂化自由能、态密度、简正模式" }
    ],
    systems: [
      { name: "OLED 发光分子", abbr: "OLED", sample: "DPP-DTT", fields: ["分子基础信息", "物性数据", "表征图谱", "激发能/发射能", "HOMO/LUMO", "溶剂化自由能", "简正模式"] },
      { name: "有机光伏给体 / 受体", abbr: "OPV", sample: "PM6:Y6", fields: ["分子基础信息", "物性数据", "表征图谱", "激发能/发射能", "HOMO/LUMO", "溶剂化自由能", "简正模式"] },
      { name: "有机半导体聚合物", abbr: "OSP", sample: "P3HT", fields: ["分子基础信息", "物性数据", "表征图谱", "激发能/发射能", "HOMO/LUMO", "溶剂化自由能", "简正模式"] }
    ],
    methods: {
      open: { key: "open", label: "开源数据获取", tag: "rw-tag--open", desc: "通过 Python 爬虫抓取 PubChem / CCDC 的分子基础信息与物性数据，并解析 JACS / Angew 等文献中的计算数据" },
      buy: { key: "buy", label: "数据购买 / 自采数据", tag: "rw-tag--buy", desc: "从已购买授权的 SciFinder / Reaxys 商用数据库中导入高可信度 OLED 材料与药物分子数据" },
      calc: { key: "calc", label: "数据计算", tag: "rw-tag--calc", desc: "上传 Gaussian16 计算输入 / 输出文件，由系统校验完整性、合规性并提取结构化数据" }
    },
    openDbs: [
      {
        key: "pubchem", name: "PubChem（化合物数据库）", meta: "开放 API · 官方 2026.08 数据版本",
        datasets: [
          { name: "有机光电材料基础数据集", desc: "含中英文名称、分子式、分子量与三维结构 · 共 842 条记录", count: 842 },
          { name: "有机光电材料物性数据集", desc: "含密度、熔点、沸点、闪点与折射率 · 共 516 条记录", count: 516 },
          { name: "分子编号与 CAS 对照数据集", desc: "含 CAS 号、InChIKey、SMILES · 共 1,120 条记录", count: 1120 }
        ]
      },
      {
        key: "ccdc", name: "CCDC（剑桥结构数据库）", meta: "开放 API · CSD 2026.1 数据版本",
        datasets: [
          { name: "有机晶体结构数据集", desc: "含晶胞参数、空间群、原子坐标与键长键角", count: 648 },
          { name: "分子构象数据集", desc: "含基态构象与堆积方式", count: 312 }
        ]
      }
    ],
    buyDbs: [
      { key: "b-scifinder", name: "SciFinder（化学文献数据库）", meta: "已购买 · 授权有效期至 2027-06-30", datasets: [{ name: "SciFinder 文献计算数据集", desc: "含文献报道的激发能、发射能与量子产率", count: 1260 }, { name: "商用 OLED 材料物性数据", desc: "含熔点、沸点、溶解性与折射率", count: 430 }] },
      { key: "b-reaxys", name: "Reaxys（化学信息数据库）", meta: "已购买 · 机构订阅", datasets: [{ name: "Reaxys 高可信度物性数据", desc: "含实测熔点、闪点与密度", count: 980 }, { name: "Reaxys 合成路线数据", desc: "含前驱体与合成条件", count: 260 }] },
      { key: "b-jacs", name: "JACS / Angew 文献专题数据包", meta: "自采 · 文献解析入库", datasets: [{ name: "文献激发能数据集", desc: "从 JACS / Angew 全文解析的计算数据", count: 540 }] },
      { key: "b-self", name: "课题组自采数据包（OLED 分子）", meta: "自采 · 本地上传", datasets: [{ name: "自采荧光量子产率数据", desc: "自测发射波长与量子产率", count: 180 }] }
    ],
    dbVersions: { pubchem: "2026.08", ccdc: "CSD 2026.1", "b-scifinder": "2026.09", "b-reaxys": "2026.07", "b-jacs": "2026.06", "b-self": "V0.0（自采）" },
    calcOutputs: [
      { key: "LOG", desc: "Gaussian16 计算日志文件：激发能、发射能、振荡强度" },
      { key: "FCHK", desc: "格式化检查点文件：轨道能级、电子密度" },
      { key: "OUT", desc: "Gaussian16 输出文件：几何优化与频率结果" },
      { key: "MOLDEN", desc: "轨道与简正模式输出文件：HOMO-LUMO、振动模式" }
    ],
    calcInputs: ["GJF", "CHK", "MOL", "PDB"],
    calcInputDesc: { GJF: "Gaussian 计算输入卡（含方法与基组）", CHK: "检查点文件（波函数续算）", MOL: "初始分子结构文件", PDB: "三维坐标文件" },
    calcCompliance: [
      { key: "method", name: "计算方法（泛函）", rule: "B3LYP / CAM-B3LYP 或更高精度", bad: "检测到 HF 方法，与本库标准（B3LYP 及以上）不一致", fix: "重新计算" },
      { key: "basis", name: "基组", rule: "≥ def2-SVP", bad: "基组为 STO-3G，低于标准阈值 def2-SVP", fix: "重新计算" },
      { key: "solvent", name: "溶剂模型", rule: "必须显式声明（PCM / SMD / 气相）", bad: "未声明溶剂模型，激发能数据不可比", fix: "补充声明或重新计算" },
      { key: "scf", name: "SCF 收敛判据", rule: "≤ 1×10⁻⁶", bad: "SCF 收敛判据为 1×10⁻⁴，低于精度要求", fix: "重新计算" },
      { key: "dispersion", name: "色散校正", rule: "启用 GD3(BJ) 色散校正", bad: "未启用色散校正，构象能将系统性偏高", fix: "低精度入库" }
    ],
    mediaExt: "mol",
    payloadTitle: "分子结构 / 激发态数据 / 光谱与轨道数据",
    payload: {
      分子结构: { 分子式: "C22H30N2O2S2", 分子量: "418.62 g/mol", 分子编号: "CAS 1446789-12-4", 键长: "C-S 1.74 Å", 键角: "C-S-C 98.6°", 三维构象: "平面共轭骨架" },
      激发态数据: { 激发能: "2.14 eV", 发射能: "1.86 eV", 跃迁偶极矩: "3.42 Debye", 跃迁类型: "π → π*（S0 → S1）", 振荡强度: "0.68", 斯托克斯位移: "0.28 eV" },
      光谱与轨道: { "HOMO 能级": "-5.12 eV", "LUMO 能级": "-2.98 eV", "HOMO-LUMO 能隙": "2.14 eV", 溶剂模型: "PCM（甲苯）", 溶剂化自由能: "-8.60 kcal/mol", 简正模式: "1,742 cm⁻¹（C=C 伸缩）" }
    },
    payloadJson: '{&nbsp;&quot;molecule&quot;:&nbsp;&quot;DPP-DTT&quot;,<br>'
      + '&nbsp;&nbsp;<span class="k">&quot;formula&quot;</span>:&nbsp;<span class="s">&quot;C22H30N2O2S2&quot;</span>,&nbsp;<span class="k">&quot;mw&quot;</span>:&nbsp;<span class="n">418.62</span>,&nbsp;<span class="k">&quot;cas&quot;</span>:&nbsp;<span class="s">&quot;1446789-12-4&quot;</span>&nbsp;},<br>'
      + '&nbsp;&nbsp;<span class="k">&quot;excitation&quot;</span>:&nbsp;{&nbsp;<span class="k">&quot;e_exc&quot;</span>:&nbsp;<span class="n">2.14</span>,&nbsp;<span class="k">&quot;e_emi&quot;</span>:&nbsp;<span class="n">1.86</span>,&nbsp;<span class="k">&quot;mu&quot;</span>:&nbsp;<span class="n">3.42</span>,&nbsp;<span class="k">&quot;unit&quot;</span>:&nbsp;<span class="s">&quot;eV / Debye&quot;</span>&nbsp;},<br>'
      + '&nbsp;&nbsp;<span class="k">&quot;orbitals&quot;</span>:&nbsp;{&nbsp;<span class="k">&quot;homo&quot;</span>:&nbsp;<span class="n">-5.12</span>,&nbsp;<span class="k">&quot;lumo&quot;</span>:&nbsp;<span class="n">-2.98</span>,&nbsp;<span class="k">&quot;gap&quot;</span>:&nbsp;<span class="n">2.14</span>,&nbsp;<span class="k">&quot;solvent&quot;</span>:&nbsp;<span class="s">&quot;PCM-toluene&quot;</span>&nbsp;}<br>}',
    entryMethodRows: [
      ["PubChem / CCDC 等公开库", "定制插件批量导入", "文件头含 “PubChem” / “CSD” 标识", "采集参数配置"],
      ["SciFinder / Reaxys 商用库", "定制插件批量导入", "商用授权文件头校验", "采购范围核对"],
      ["Gaussian16 自主计算数据", "自动化流程录入", "包含 GJF+CHK+MOL/PDB", "参数合规性复核"],
      ["文献提取数据（JACS / Angew）", "手动输入", "无法自动识别", "全文录入"],
      ["用户上传数据", "手动输入 + 自动校验", "文件格式识别", "质量审核"]
    ],
    entrySources: [
      { key: "pubchem", name: "PubChem / CCDC 等公开库", rec: "定制插件批量导入", rule: '文件头含 "PubChem" / "CSD" 标识', point: "采集参数配置", plugin: "PubChemPlugin" },
      { key: "ccdc", name: "CCDC 剑桥结构数据库", rec: "定制插件批量导入", rule: '文件头含 "CSD" 标识', point: "采集参数配置", plugin: "CCDCPlugin" },
      { key: "gaussian", name: "Gaussian16 自主计算数据", rec: "自动化流程录入", rule: "包含 GJF+CHK+MOL/PDB", point: "参数合规性复核", plugin: "GaussianAutoFlow" },
      { key: "literature", name: "文献提取数据（JACS / Angew）", rec: "手动输入", rule: "无法自动识别", point: "全文录入", plugin: "-" },
      { key: "user", name: "用户上传数据", rec: "手动输入 + 自动校验", rule: "文件格式识别", point: "质量审核", plugin: "AutoValidator" }
    ],
    dataTypeCodes: { "基础信息对象": "BAS", "物理性质对象": "PHY", "表征图谱对象": "SPC", "计算数据对象": "CAL" },
    entryManualFields: [
      { key: "formula", label: "分子式", req: true, ph: "如 C22H30N2O2S2", rule: "formula", msg: "分子式格式不正确，示例：C22H30N2O2S2" },
      { key: "mw", label: "分子量", req: true, unit: "g/mol", rule: "pos", msg: "分子量必须为正数" },
      { key: "name", label: "中英文名称", req: true, ph: "如 DPP-DTT / 吡咯并吡咯二酮", rule: "text" },
      { key: "code", label: "分子编号 / CAS", req: true, ph: "如 1446789-12-4", rule: "text" },
      { key: "dataType", label: "数据类型", req: true, type: "select", opts: ["基础信息对象", "物理性质对象", "表征图谱对象", "计算数据对象"], rule: "text" },
      { key: "meltingPoint", label: "熔点", req: true, unit: "℃", rule: "range", min: -200, max: 500, msg: "熔点超出合理范围（-200 ~ 500 ℃）" },
      { key: "flashPoint", label: "闪点", req: false, unit: "℃", rule: "range", min: -200, max: 500, msg: "闪点超出合理范围（-200 ~ 500 ℃）" },
      { key: "bandGap", label: "HOMO-LUMO 能隙", req: true, unit: "eV", rule: "gap", msg: "HOMO-LUMO 能隙超出合理范围（0-10 eV）" },
      { key: "excitation", label: "激发能", req: false, unit: "eV", rule: "gap", msg: "激发能超出合理范围（0-10 eV）" },
      { key: "solvation", label: "溶剂化自由能", req: false, unit: "kcal/mol", rule: "fe", msg: "溶剂化自由能应 ≤ 0，请确认溶剂模型" },
      { key: "dipole", label: "跃迁偶极矩", req: false, unit: "Debye", rule: "pos", msg: "跃迁偶极矩必须为正数" }
    ],
    entryCalcParams: [
      { key: "software", label: "计算软件", type: "select", opts: ["Gaussian16", "ORCA", "Turbomole", "PSI4"], std: "—", neutral: true },
      { key: "method", label: "计算方法（泛函）", type: "select", opts: ["B3LYP", "CAM-B3LYP", "ωB97XD", "HF"], std: "B3LYP 及以上", bad: ["HF"], msg: "检测到 HF 方法，与本库标准（B3LYP 及以上）不一致" },
      { key: "basis", label: "基组", type: "select", opts: ["def2-SVP", "def2-TZVP", "6-31G*", "STO-3G"], std: "≥ def2-SVP", bad: ["STO-3G", "6-31G*"], msg: "基组低于标准阈值 def2-SVP" },
      { key: "solvent", label: "溶剂模型", type: "select", opts: ["PCM", "SMD", "气相"], std: "必须显式声明", neutral: true },
      { key: "scf", label: "SCF 收敛判据", std: "≤ 1e-6", max: 0.000001, msg: "SCF 收敛判据低于精度要求 1e-6" },
      { key: "dispersion", label: "色散校正", type: "select", opts: ["GD3(BJ)", "GD2", "无"], std: "启用 GD3(BJ)", bad: ["无"], msg: "未启用色散校正，构象能将系统性偏高" }
    ],
    entryManualSteps: [
      { who: "数据录入员", act: "选择“新增材料”", sys: "显示有机光电材料标准录入表单（基于 1.2 节字段定义）", check: "—", out: "空白录入界面" },
      { who: "数据录入员", act: "填写必填字段（分子式、分子量、熔点、HOMO-LUMO 等）", sys: "实时校验：分子式元素符号有效性、数值范围", check: "必填项完整性、值域合法性", out: "已填数据" },
      { who: "数据录入员", act: "上传结构文件（MOL / PDB / CIF）", sys: "解析结构文件，自动填充原子坐标、键长键角", check: "文件格式合规性", out: "自动填充的字段" },
      { who: "数据录入员", act: "填写计算参数（软件、泛函、基组、溶剂模型等）", sys: "与标准阈值（1.4 节）对比", check: "参数合规性", out: "计算参数记录" },
      { who: "系统", act: "—", sys: "生成唯一标识：OP-数据类型-序号", check: "数据库查询最大序号 +1", out: "材料唯一标识" },
      { who: "数据录入员", act: "提交数据", sys: "进入审核队列", check: "触发第 2.2.4 节审核流程", out: "提交状态" }
    ],
    entryBatchSteps: [
      { who: "数据录入员", act: "选择批量导入入口", sys: "显示数据源类型选择界面", check: "选择正确的数据源类型", out: "数据源配置" },
      { who: "数据录入员", act: "上传数据包（ZIP）或配置 API", sys: "解压 / 解析数据包，列出文件清单", check: "文件完整性检查", out: "文件清单" },
      { who: "系统", act: "—", sys: "调用对应解析插件（PubChem / CCDC / Gaussian16）", check: "按数据源类型匹配解析器", out: "解析后的结构化数据" },
      { who: "系统", act: "—", sys: "按录入规范表（1.2 节）自动映射字段", check: "字段名匹配、类型转换", out: "字段映射结果" },
      { who: "系统", act: "—", sys: "执行自动审核（交叉对比 + 可重复性 + 格式统一）", check: "第 2.2.3 节审核规则", out: "审核状态" },
      { who: "数据录入员", act: "查看并确认批处理结果", sys: "显示成功 / 失败条数及明细", check: "失败条目需人工处理", out: "入库确认" }
    ],
    entryRules: [
      ["分子式", "正则：[A-Z][a-z]?\\d*（可重复）", "“分子式格式不正确，示例：C22H30N2O2S2”"],
      ["HOMO-LUMO 能隙", "≥ 0 且 ≤ 10", "“HOMO-LUMO 能隙超出合理范围（0-10 eV）”"],
      ["溶剂化自由能", "≤ 0（稳定溶剂化）", "“溶剂化自由能应 ≤ 0，请确认溶剂模型”"],
      ["分子量", "> 0", "“分子量必须为正数”"],
      ["熔点 / 闪点", "-200 ~ 500 ℃", "“熔点超出合理范围（-200 ~ 500 ℃）”"]
    ],
    manualDefaults: {
      form: { dataType: "计算数据对象" },
      calc: { software: "Gaussian16", method: "B3LYP", basis: "def2-TZVP", solvent: "PCM", scf: "1e-6", dispersion: "GD3(BJ)" }
    },
    demoFile: "DPP-DTT.mol",
    demoParse: { formula: "C22H30N2O2S2", mw: "418.62", name: "DPP-DTT", code: "1446789-12-4", meltingPoint: "286", flashPoint: "312", bandGap: "2.14", excitation: "2.14", solvation: "-8.60", dipole: "3.42" },
    procFlow: [
      { n: "数据策划", d: "明确数据产品目标用途、格式与精度要求" },
      { n: "基础数据筛选", d: "按“分子量 < 500 + 有光电性能”筛选" },
      { n: "标准化预处理", d: "格式统一、误差修正、完整性整理" },
      { n: "加工模型构建", d: "构建激发能预测等性质的加工模型" },
      { n: "数据产品生产", d: "如“OLED 红光材料数据集”" },
      { n: "质量评价", d: "数据准确性校验" }
    ],
    procStepTitles: ["数据策划", "基础数据筛选", "标准化预处理", "加工模型构建", "数据产品生产", "质量评价"],
    procS1: { head: ["活动", "操作人", "输入", "输出", "内容"], rows: [["需求分析", "数据加工工程师", "用户需求 / 项目要求", "数据产品规格文档", "明确应用需求：目标材料体系（如 OLED 红光材料）、输出格式与精度要求"]] },
    procS2: { head: ["活动", "操作人", "系统行为", "筛选条件", "输出"], rows: [
      ["数据筛选", "数据加工工程师", "执行 SQL 查询 + 质量过滤", "质量等级 = A 级 或 B 级", "筛选后的数据集合"],
      ["数据筛选", "数据加工工程师", "按材料类型分组", "分子量 < 500 且具备光电性能数据", "分组清单"]
    ] },
    procS3: { head: ["子步骤", "操作人", "系统行为", "处理规则", "输出"], rows: [
      ["格式统一", "系统", "自动执行格式转换脚本", "mol / cif → 标准 pdb；txt 谱图数据 → jpg 图谱", "标准格式文件"],
      ["单位统一", "系统", "自动执行单位换算", "非标准单位 → 标准单位（第 1.4 节单位表）", "带标准单位的数据"],
      ["缺失值", "系统", "标记缺失字段", "缺失率 ≤ 5% 时标注 “N/A”；> 5% 退回", "缺失值报告"],
      ["异常值检测", "系统", "执行异常检测算法", "超出 3σ 范围或物理不合理（如熔点 > 500 ℃ 的有机小分子）", "异常值清单"],
      ["异常值修正", "数据加工工程师", "人工复核异常值", "剔除明显错误数据，或通过相似分子预测补充（如闪点）", "修正记录"]
    ] },
    procS4: { head: ["数据类型", "加工模型 / 算法", "输入", "处理逻辑", "输出"], rows: [
      ["性质数据", "激发能预测模型", "分子结构与已知激发能样本", "基于分子指纹回归预测激发能 / 发射能", "预测的激发能、发射能"],
      ["图谱数据", "图谱标准化模型", "红外 / 拉曼 / 核磁原始谱图", "统一波数轴、分辨率、标注与图片格式", "标准化 PNG 图谱"],
      ["结构数据", "分子结构验证模型", "MOL / PDB / CIF 文件", "校验原子坐标合理性、键长键角范围", "验证后的结构文件"]
    ] },
    procS5: { head: ["数据产品类型", "加工操作", "输出格式", "输出用途"], rows: [
      ["AI 训练数据集", "数据清洗 + 特征工程 + 格式转换", "CSV / JSON + 数据字典", "机器学习模型训练"],
      ["科研参考数据集", "数据整理 + 可视化渲染", "PDF 报告 + JSON", "科研人员查阅"],
      ["跨库融通数据集", "格式转换 + 元数据补全", "JSON（符合 OPTIMADE 格式）", "与主平台融通"]
    ] },
    procS6: { head: ["评价维度", "评价方法", "合格标准", "不合格处理"], rows: [
      ["数据来源质量", "检查来源可信度分级", "来源为 1 级或 2 级", "标记“来源待验证”"],
      ["加工模型质量", "验证模型输出与输入一致性", "激发能预测偏差 < 5%", "调整模型参数"],
      ["数据产品质量", "抽样检测（AQL = 1%）", "缺陷率 < 1%", "返工处理"]
    ] },
    procVersion: { head: ["版本阶段", "版本号格式", "标记位置", "说明"], rows: [
      ["原始版", "V0.0", "元数据字段 “data_version”", "采集后的原始数据"],
      ["标准化版", "V1.0", "元数据字段 “data_version”", "完成标准化预处理"],
      ["产品版", "V2.0", "元数据字段 “data_version”", "完成数据产品生产"]
    ] },
    procModels: [
      { key: "stat", name: "激发能预测模型", type: "性质数据", input: "分子结构与已知激发能样本", logic: "基于分子指纹回归预测激发能 / 发射能", out: "预测的激发能、发射能" },
      { key: "image", name: "图谱标准化模型", type: "图谱数据", input: "红外 / 拉曼 / 核磁原始谱图", logic: "统一波数轴、分辨率、标注与图片格式", out: "标准化 PNG 图谱" },
      { key: "struct", name: "分子结构验证模型", type: "结构数据", input: "MOL / PDB / CIF 文件", logic: "校验原子坐标合理性、键长键角范围", out: "验证后的结构文件" }
    ],
    procProducts: [
      { key: "ai", name: "AI 训练数据集", op: "数据清洗 + 特征工程 + 格式转换", format: "CSV / JSON + 数据字典", use: "机器学习模型训练" },
      { key: "sci", name: "科研参考数据集", op: "数据整理 + 可视化渲染", format: "PDF 报告 + JSON", use: "科研人员查阅" },
      { key: "cross", name: "跨库融通数据集", op: "格式转换 + 元数据补全", format: "JSON（符合 OPTIMADE 格式）", use: "与主平台融通" }
    ],
    procQuality: [
      { key: "source", dim: "数据来源质量", method: "检查来源可信度分级", std: "来源为 1 级或 2 级", fix: "标记“来源待验证”" },
      { key: "model", dim: "加工模型质量", method: "验证模型输出与输入一致性", std: "激发能预测偏差 < 5%", fix: "调整模型参数" },
      { key: "product", dim: "数据产品质量", method: "抽样检测（AQL = 1%）", std: "缺陷率 < 1%", fix: "返工处理" }
    ],
    modelRows: {
      stat: [
        { item: "激发能（DPP-DTT）", input: "2.08 / 2.14 / 2.19 eV", logic: "分子指纹回归 + 交叉验证", out: "2.14 ± 0.06 eV（95% CI：2.09 ~ 2.19）" },
        { item: "发射能（DPP-DTT）", input: "1.82 / 1.86 / 1.91 eV", logic: "分子指纹回归 + 交叉验证", out: "1.86 ± 0.05 eV" }
      ],
      image: [
        { item: "红外光谱", input: "ir_raw.txt（1,600 点，波数轴不一致）", logic: "统一波数轴、分辨率、标注、格式", out: "ir_std.png（1600×1200，统一标注）" },
        { item: "核磁共振谱", input: "nmr_raw.txt（800×600）", logic: "统一化学位移轴、分辨率、标注、格式", out: "nmr_std.png（1600×1200，统一标注）" }
      ],
      struct: [
        { item: "DPP-DTT 结构", input: "DPP-DTT.mol", logic: "校验原子坐标合理性、键长键角范围", out: "DPP-DTT_verified.pdb（C-S 键长 1.74 Å，合理）" },
        { item: "P3HT 片段结构", input: "P3HT.mol", logic: "校验原子坐标合理性、键长键角范围", out: "P3HT_verified.pdb（C-C 键长 1.45 Å，合理）" }
      ]
    },
    outliers: [
      { key: "o1", name: "DPP-DTT · 熔点", value: "612 ℃", sigma: "4.6σ", fixed: "", keep: false },
      { key: "o2", name: "PM6 · 闪点", value: "-48 ℃", sigma: "3.8σ", fixed: "", keep: false }
    ],
    procNamePh: "如：OLED 红光材料数据集加工",
    listCols: [{ key: "name", label: "中英文名称" }, { key: "mw", label: "分子量", unit: " g/mol" }, { key: "bandGap", label: "HOMO-LUMO", unit: " eV" }],
    metric: { key: "bandGap", label: "HOMO-LUMO", unit: " eV" },
    batchSamples: [
      { formula: "C22H30N2O2S2", dataType: "计算数据对象", name: "DPP-DTT", mw: "418.62", bandGap: "2.14", quality: "高精度" },
      { formula: "C30H40N2O2S4", dataType: "计算数据对象", name: "PM6", mw: "604.92", bandGap: "1.92", quality: "高精度" },
      { formula: "C82H86N8O2S4", dataType: "物理性质对象", name: "Y6", mw: "1371.94", bandGap: "1.48", quality: "低精度" },
      { formula: "C10H14S", dataType: "物理性质对象", name: "P3HT", mw: "166.29", bandGap: "2.02", quality: "高精度" }
    ],
    tasks: [
      { id: "OP-CL-2026-0922-001", name: "OLED 发光分子（DPP-DTT）激发能数据采集", method: "open", desc: "从 PubChem 开放 API 采集 DPP-DTT 分子基础信息与物性数据", status: "已完成", createdAt: "2026-09-22 10:24", source: "PubChem（化合物数据库）", version: "2026.08", rawFiles: "JSON / MOL", security: "第1级" },
      { id: "OP-CL-2026-0923-002", name: "有机光伏受体（PM6:Y6）物性数据采集", method: "buy", desc: "从已购买 SciFinder 商用数据包导入受体分子熔点、闪点与溶解性数据", status: "已完成", createdAt: "2026-09-23 09:12", source: "SciFinder（化学文献数据库）", version: "2026.09", rawFiles: "JSON / CSV", security: "第1级" },
      { id: "OP-CL-2026-0923-003", name: "有机半导体聚合物（P3HT）激发态数据计算", method: "calc", desc: "基于 Gaussian16 计算输出文件提取激发能、发射能与 HOMO-LUMO 能级", status: "待确认", createdAt: "2026-09-23 16:48", source: "本地计算输出（LOG / FCHK）", version: "V0.0", rawFiles: "JSON", security: "第2级" }
    ],
    datasets: [
      { key: "basic", title: "有机光电基础数据集", format: "PDB / MOL / SDF", volume: 1000, fields: ["中英文名称", "分子编号", "分子式", "分子量", "三维结构"], desc: "收录有机分子中英文名称、CAS/InChI 分子编号、分子式、分子量和三维结构等基础信息。" },
      { key: "physical", title: "有机光电物性数据集", format: "CSV / JSON", volume: 1860, fields: ["相对密度", "熔点", "沸点", "闪点"], desc: "收录有机分子相对密度、熔点、沸点、闪点等物理性质数据，支撑热稳定性与使用场景筛选。" },
      { key: "spectral", title: "有机光电表征图谱数据集", format: "JPG / CSV", volume: 2400, fields: ["红外光谱", "拉曼光谱", "核磁共振谱"], desc: "收录红外光谱、拉曼光谱和核磁共振谱等表征图谱，包含原始数据与图谱图片。" },
      { key: "computed", title: "有机光电计算数据集", format: "CSV / JSON / JPG", volume: 3160, fields: ["基态/激发态结构", "激发能", "发射能", "跃迁偶极矩", "HOMO-LUMO", "溶剂化自由能", "斯托克斯位移", "简正模式", "态密度"], desc: "收录量子化学计算数据：基态/激发态结构、激发能、发射能、跃迁偶极矩、HOMO-LUMO、溶剂化自由能、斯托克斯位移、简正模式和态密度。" }
    ]
  };

  /* ---------------------------------------------------- 电解质材料（R18~R21） */
  MAT.electrolyte = {
    code: "EL",
    short: "电解质材料",
    title: "电解质材料数据采集加工处理",
    headDesc: "面向电解质材料数据的采集、录入与加工全流程管理：支持 Materials Project / PubChem / ICSD 开源抓取、Reaxys 商用数据导入与 VASP / Gaussian 自主计算提取，<br>内置字段级校验、异常处理队列与质量评价规则，采集结果确认后统一入库。",
    introTitle: "电解质材料数据库数据资源共包含 3 类核心对象（按电解质类型划分），采集 / 录入 / 加工均围绕这些对象展开。",
    introBanner: "3 类核心对象：有机电解液对象、固态有机电解质对象、固态无机电解质对象。各资源对象包含的数据字段如下：",
    introTip: "采集参数中的「性质范围」即针对上述资源对象的性质字段设置取值范围，用于过滤落在范围外的数据记录。",
    objectsNote: "电解质材料 3 类核心对象",
    typeTip: "选择本次采集的电解质材料类型，不同类型对应不同的性质字段模板。",
    buyNote: "仅展示当前账号已完成采购或已完成自采登记的数据库，勾选后可从对应数据包中导入电解质材料数据。",
    calcTip: "固态电解质计算须声明泛函与截断能，离子输运相关性质需标注测试温度，参数不合规将进入合规性校验报告分支。",
    taskNamePh: "请输入采集任务名称，如：固态无机电解质（LLZO）离子电导率数据采集",
    doneNote: "审核通过并完成入库的电解质材料数据，可直接送去资源加工。",
    objects: [
      { name: "有机电解液对象", fields: "基础信息（名称、分子式、结构）、物性（熔点、燃点、介电常数）、表征图谱（红外、核磁共振）、计算数据（HOMO-LUMO、溶剂化自由能）" },
      { name: "固态有机电解质对象", fields: "基础信息（名称、单体结构、聚合物结构）、物性（玻璃化转变温度、拉伸模量）、计算数据（结合能、摩尔热容）" },
      { name: "固态无机电解质对象", fields: "基础信息（名称、化学式、晶体结构）、物性（离子电导率、机械强度）、表征图谱（XRD、XAS）、计算数据（带隙、态密度、能带结构）" }
    ],
    systems: [
      { name: "有机电解液", abbr: "LE", sample: "LiFSI-DME", fields: ["基础信息", "物性数据", "表征图谱", "计算数据", "离子电导率", "机械强度", "界面兼容性"] },
      { name: "固态有机电解质", abbr: "SPE", sample: "PEO-LiTFSI", fields: ["基础信息", "物性数据", "表征图谱", "计算数据", "离子电导率", "机械强度", "界面兼容性"] },
      { name: "固态无机电解质", abbr: "SIE", sample: "Li6PS5Cl", fields: ["基础信息", "物性数据", "表征图谱", "计算数据", "离子电导率", "机械强度", "界面兼容性"] }
    ],
    methods: {
      open: { key: "open", label: "开源数据获取", tag: "rw-tag--open", desc: "通过 Python 爬虫抓取 Materials Project 的固态无机电解质数据、PubChem 的有机电解液物性数据与 ICSD 的晶体衍射数据" },
      buy: { key: "buy", label: "数据购买 / 自采数据", tag: "rw-tag--buy", desc: "从已购买授权的 Reaxys 电解质应用数据与 ICSD 全量晶体结构数据中导入" },
      calc: { key: "calc", label: "数据计算", tag: "rw-tag--calc", desc: "上传 VASP / Gaussian 计算输入 / 输出文件，由系统校验完整性、合规性并提取结构化数据" }
    },
    openDbs: [
      {
        key: "mp", name: "Materials Project（材料项目数据库）", meta: "开放 API · 官方 v2025.03 数据版本",
        datasets: [
          { name: "固态无机电解质结构数据集", desc: "含 LLZO 晶格常数、空间群与原子坐标 · 共 486 条记录", count: 486 },
          { name: "带隙与能带结构数据集", desc: "含带隙、能带结构与态密度", count: 372 },
          { name: "离子输运性质数据集", desc: "含迁移能垒与离子电导率估算", count: 208 }
        ]
      },
      {
        key: "pubchem", name: "PubChem（化合物数据库）", meta: "开放 API · 官方 2026.08 数据版本",
        datasets: [
          { name: "有机电解液物性数据集", desc: "含熔点、燃点、介电常数与粘度 · 共 315 条记录", count: 315 },
          { name: "溶剂 / 锂盐基础数据集", desc: "含分子式、分子量与 SMILES", count: 642 }
        ]
      },
      {
        key: "icsd", name: "ICSD（无机晶体结构数据库）", meta: "开放 API · 2026.1 数据版本",
        datasets: [
          { name: "晶体衍射结构数据集", desc: "含 CIF 原文件与空间群信息", count: 1240 },
          { name: "结构精修数据集", desc: "含 Rietveld 精修结果", count: 268 }
        ]
      }
    ],
    buyDbs: [
      { key: "b-reaxys", name: "Reaxys 电解质应用数据包", meta: "已购买 · 授权有效期至 2027-03-31", datasets: [{ name: "电解液与电极兼容性数据", desc: "含界面副反应与相容性评价", count: 420 }, { name: "电解液配方物性数据", desc: "含实测电导率与电化学窗口", count: 356 }] },
      { key: "b-icsd", name: "ICSD 全量晶体结构数据", meta: "已购买 · 机构订阅", datasets: [{ name: "全量无机晶体结构", desc: "授权范围内全量 CIF 文件", count: 1860 }, { name: "硫化物固态电解质专题", desc: "含 Li6PS5Cl / LGPS 系列结构", count: 240 }] },
      { key: "b-self", name: "课题组自采数据包（硫化物电解质）", meta: "自采 · 本地上传", datasets: [{ name: "自采电导率测试数据", desc: "自测离子电导率与活化能", count: 160 }] }
    ],
    dbVersions: { mp: "v2025.03", pubchem: "2026.08", icsd: "2026.1", "b-reaxys": "2026.07", "b-icsd": "2026.1", "b-self": "V0.0（自采）" },
    calcOutputs: [
      { key: "OUTCAR", desc: "VASP 输出详细信息文件：能量、受力、收敛信息" },
      { key: "DOSCAR", desc: "态密度输出文件：带隙、态密度、费米能级" },
      { key: "EIGENVAL", desc: "能带本征值文件：能带结构、带隙" },
      { key: "CONTCAR", desc: "结构输出文件：优化后晶格与原子坐标" }
    ],
    calcInputs: ["INCAR", "POSCAR", "POTCAR", "KPOINTS"],
    calcInputDesc: { INCAR: "计算控制参数", POSCAR: "初始结构文件", POTCAR: "赝势文件", KPOINTS: "K 点采样设置" },
    calcCompliance: [
      { key: "functional", name: "交换关联泛函", rule: "PBE / PBEsol 或更高精度泛函", bad: "检测到 LDA 泛函，与本库标准（PBE / PBEsol）不一致", fix: "重新计算" },
      { key: "cutoff", name: "平面波截断能", rule: "≥ 400 eV", bad: "截断能为 320 eV，低于标准阈值 400 eV", fix: "重新计算" },
      { key: "kpoints", name: "K 点密度", rule: "≥ 20 Å⁻¹（固态体系）", bad: "K 点密度为 12 Å⁻¹，低于标准阈值 20 Å⁻¹", fix: "低精度入库" },
      { key: "force", name: "力收敛判据", rule: "≤ 0.01 eV/Å", bad: "力收敛判据为 0.05 eV/Å，低于精度要求", fix: "低精度入库" },
      { key: "energy", name: "能量收敛判据", rule: "≤ 1×10⁻⁵ eV", bad: "能量收敛判据为 1×10⁻³ eV，低于精度要求", fix: "重新计算" }
    ],
    mediaExt: "cif",
    payloadTitle: "结构信息 / 离子输运数据 / 电化学窗口",
    payload: {
      结构信息: { 化学式: "Li6PS5Cl", 晶体结构: "Argyrodite（硫银锗矿型）", 空间群: "F-43m", "晶格常数 a": "10.15 Å", 晶胞体积: "1046.2 Å³", 原子坐标: "Li(0.25,0.25,0.25)；P(0,0,0)；S(0.38,0.38,0.12)" },
      离子输运数据: { "离子电导率": "3.2×10⁻³ S/cm（298 K）", 活化能: "0.31 eV", 迁移离子: "Li⁺", 迁移通道: "四面体-四面体跃迁", 扩散系数: "2.8×10⁻⁸ cm²/s" },
      电化学窗口: { "氧化电位": "2.6 V（vs. Li/Li⁺）", "还原电位": "0.4 V（vs. Li/Li⁺）", 电化学窗口: "2.2 V", 带隙: "2.35 eV", 态密度: "价带顶以 S-3p 为主", 费米能级: "1.18 eV" }
    },
    payloadJson: '{&nbsp;&quot;material&quot;:&nbsp;&quot;Li6PS5Cl&quot;,<br>'
      + '&nbsp;&nbsp;<span class="k">&quot;structure&quot;</span>:&nbsp;{&nbsp;<span class="k">&quot;formula&quot;</span>:&nbsp;<span class="s">&quot;Li6PS5Cl&quot;</span>,&nbsp;<span class="k">&quot;space_group&quot;</span>:&nbsp;<span class="s">&quot;F-43m&quot;</span>,&nbsp;<span class="k">&quot;a&quot;</span>:&nbsp;<span class="n">10.15</span>&nbsp;},<br>'
      + '&nbsp;&nbsp;<span class="k">&quot;transport&quot;</span>:&nbsp;{&nbsp;<span class="k">&quot;conductivity&quot;</span>:&nbsp;<span class="n">3.2e-3</span>,&nbsp;<span class="k">&quot;unit&quot;</span>:&nbsp;<span class="s">&quot;S/cm&quot;</span>,&nbsp;<span class="k">&quot;ea&quot;</span>:&nbsp;<span class="n">0.31</span>,&nbsp;<span class="k">&quot;carrier&quot;</span>:&nbsp;<span class="s">&quot;Li+&quot;</span>&nbsp;},<br>'
      + '&nbsp;&nbsp;<span class="k">&quot;window&quot;</span>:&nbsp;{&nbsp;<span class="k">&quot;oxid&quot;</span>:&nbsp;<span class="n">2.6</span>,&nbsp;<span class="k">&quot;red&quot;</span>:&nbsp;<span class="n">0.4</span>,&nbsp;<span class="k">&quot;gap&quot;</span>:&nbsp;<span class="n">2.35</span>&nbsp;}<br>}',
    entryMethodRows: [
      ["Materials Project / ICSD 等公开库", "定制插件批量导入", "文件头含 “Materials Project” / “ICSD” 标识", "采集参数配置"],
      ["Reaxys 商用库（电解质应用数据）", "定制插件批量导入", "商用授权文件头校验", "采购范围核对"],
      ["VASP / Gaussian 自主计算数据", "自动化流程录入", "包含 INCAR+POSCAR+POTCAR+KPOINTS 或 gjf", "参数合规性复核"],
      ["特殊实验数据（电解液与电极兼容性）", "手动输入", "无法自动识别", "全文录入"],
      ["用户上传数据", "手动输入 + 自动校验", "文件格式识别", "质量审核"]
    ],
    entrySources: [
      { key: "mp", name: "Materials Project 等公开库", rec: "定制插件批量导入", rule: '文件头含 "Materials Project" 标识', point: "采集参数配置", plugin: "MaterialsProjectPlugin" },
      { key: "icsd", name: "ICSD 无机晶体结构数据库", rec: "定制插件批量导入", rule: '文件头含 "ICSD" 标识', point: "采集参数配置", plugin: "ICSDPlugin" },
      { key: "vasp", name: "VASP / Gaussian 自主计算数据", rec: "自动化流程录入", rule: "包含 INCAR+POSCAR+POTCAR+KPOINTS 或 gjf", point: "参数合规性复核", plugin: "VASPAutoFlow" },
      { key: "literature", name: "特殊实验数据（兼容性）", rec: "手动输入", rule: "无法自动识别", point: "全文录入", plugin: "-" },
      { key: "user", name: "用户上传数据", rec: "手动输入 + 自动校验", rule: "文件格式识别", point: "质量审核", plugin: "AutoValidator" }
    ],
    dataTypeCodes: { "基础信息": "BAS", "物性数据": "PHY", "表征图谱": "SPC", "计算数据": "CAL" },
    entryManualFields: [
      { key: "formula", label: "化学式 / 分子式", req: true, ph: "如 Li6PS5Cl", rule: "formula", msg: "化学式格式不正确，示例：Li6PS5Cl" },
      { key: "type", label: "电解质类型", req: true, type: "select", opts: ["有机电解液", "固态有机电解质", "固态无机电解质"], rule: "text" },
      { key: "dataType", label: "数据类型", req: true, type: "select", opts: ["基础信息", "物性数据", "表征图谱", "计算数据"], rule: "text" },
      { key: "name", label: "材料名称", req: true, ph: "如 锂镧锆氧（LLZO）", rule: "text" },
      { key: "crystal", label: "晶体结构 / 空间群", req: false, ph: "如 F-43m", rule: "text" },
      { key: "meltingPoint", label: "熔点", req: false, unit: "℃", rule: "range", min: -200, max: 1600, msg: "熔点超出合理范围（-200 ~ 1600 ℃）" },
      { key: "flashPoint", label: "燃点", req: false, unit: "℃", rule: "range", min: -50, max: 800, msg: "燃点超出合理范围（-50 ~ 800 ℃）" },
      { key: "conductivity", label: "离子电导率", req: true, unit: "S/cm", ph: "如 3.2e-3", rule: "range", min: 0, max: 0.01, msg: "离子电导率超出合理范围（0 ~ 10⁻² S/cm）" },
      { key: "window", label: "电化学窗口", req: false, unit: "V", rule: "pos", msg: "电化学窗口必须为正数" },
      { key: "bandGap", label: "带隙", req: false, unit: "eV", rule: "gap", msg: "带隙值超出合理范围（0-10 eV）" },
      { key: "solvation", label: "溶剂化自由能", req: false, unit: "kcal/mol", rule: "fe", msg: "溶剂化自由能应 ≤ 0，请确认溶剂模型" }
    ],
    entryCalcParams: [
      { key: "software", label: "计算软件", type: "select", opts: ["VASP", "Gaussian16", "CP2K", "LAMMPS"], std: "—", neutral: true },
      { key: "functional", label: "交换关联泛函", type: "select", opts: ["PBE", "PBEsol", "HSE06", "LDA"], std: "PBE / PBEsol 或更高", bad: ["LDA"], msg: "检测到 LDA 泛函，与本库标准（PBE / PBEsol）不一致" },
      { key: "encut", label: "平面波截断能", unit: "eV", std: "≥ 400 eV", min: 400, msg: "截断能低于标准阈值 400 eV" },
      { key: "kpoints", label: "K 点密度", unit: "Å⁻¹", std: "≥ 20 Å⁻¹", min: 20, msg: "K 点密度低于标准阈值 20 Å⁻¹" },
      { key: "force", label: "力收敛判据", unit: "eV/Å", std: "≤ 0.01 eV/Å", max: 0.01, msg: "力收敛判据低于精度要求 0.01 eV/Å" },
      { key: "energy", label: "能量收敛判据", unit: "eV", std: "≤ 1e-5 eV", max: 0.00001, msg: "能量收敛判据低于精度要求 1e-5 eV" }
    ],
    entryManualSteps: [
      { who: "数据录入员", act: "选择“新增材料”", sys: "显示电解质材料标准录入表单（基于 1.2 节字段定义）", check: "—", out: "空白录入界面" },
      { who: "数据录入员", act: "填写必填字段（化学式、电解质类型、离子电导率等）", sys: "实时校验：化学式有效性、数值范围", check: "必填项完整性、值域合法性", out: "已填数据" },
      { who: "数据录入员", act: "上传结构文件（CIF / POSCAR）", sys: "解析结构文件，自动填充晶格常数、原子坐标", check: "文件格式合规性", out: "自动填充的字段" },
      { who: "数据录入员", act: "填写计算参数（软件、泛函、截断能等）", sys: "与标准阈值（1.4 节）对比", check: "参数合规性", out: "计算参数记录" },
      { who: "系统", act: "—", sys: "生成唯一标识：EL-数据类型-序号", check: "数据库查询最大序号 +1", out: "材料唯一标识" },
      { who: "数据录入员", act: "提交数据", sys: "进入审核队列", check: "触发第 2.2.4 节审核流程", out: "提交状态" }
    ],
    entryBatchSteps: [
      { who: "数据录入员", act: "选择批量导入入口", sys: "显示数据源类型选择界面", check: "选择正确的数据源类型", out: "数据源配置" },
      { who: "数据录入员", act: "上传数据包（ZIP）或配置 API", sys: "解压 / 解析数据包，列出文件清单", check: "文件完整性检查", out: "文件清单" },
      { who: "系统", act: "—", sys: "调用对应解析插件（Materials Project / ICSD / VASP）", check: "按数据源类型匹配解析器", out: "解析后的结构化数据" },
      { who: "系统", act: "—", sys: "按录入规范表（1.2 节）自动映射字段", check: "字段名匹配、类型转换", out: "字段映射结果" },
      { who: "系统", act: "—", sys: "执行自动审核（交叉对比 + 可重复性 + 格式统一）", check: "第 2.2.3 节审核规则", out: "审核状态" },
      { who: "数据录入员", act: "查看并确认批处理结果", sys: "显示成功 / 失败条数及明细", check: "失败条目需人工处理", out: "入库确认" }
    ],
    entryRules: [
      ["化学式", "正则：[A-Z][a-z]?\\d*（可重复）", "“化学式格式不正确，示例：Li6PS5Cl”"],
      ["离子电导率", "0 ~ 10⁻² S/cm", "“离子电导率超出合理范围（0 ~ 10⁻² S/cm）”"],
      ["溶剂化自由能", "≤ 0（稳定溶剂化）", "“溶剂化自由能应 ≤ 0，请确认溶剂模型”"],
      ["带隙", "≥ 0 且 ≤ 10", "“带隙值超出合理范围（0-10 eV）”"],
      ["熔点 / 燃点", "熔点 -200 ~ 1600 ℃；燃点 -50 ~ 800 ℃", "“熔点超出合理范围（-200 ~ 1600 ℃）”"]
    ],
    manualDefaults: {
      form: { dataType: "物性数据", type: "固态无机电解质" },
      calc: { software: "VASP", functional: "PBE", encut: "520", kpoints: "24", force: "0.01", energy: "1e-6" }
    },
    demoFile: "LLZO.cif",
    demoParse: { formula: "Li7La3Zr2O12", type: "固态无机电解质", crystal: "Ia-3d", name: "锂镧锆氧（LLZO）", conductivity: "8.5e-4", window: "4.2", bandGap: "4.86", meltingPoint: "1230", flashPoint: "", solvation: "" },
    procFlow: [
      { n: "数据策划", d: "明确应用需求，如“动力电池电解液”" },
      { n: "基础数据筛选", d: "按“燃点 > 150 ℃ + 离子电导率 > 10⁻³ S/m”筛选" },
      { n: "标准化预处理", d: "格式统一、误差修正、完整性整理" },
      { n: "加工模型构建", d: "构建电解质-电极兼容性预测模型" },
      { n: "数据产品生产", d: "如“高安全性电解液数据集”" },
      { n: "质量评价", d: "数据准确性校验" }
    ],
    procStepTitles: ["数据策划", "基础数据筛选", "标准化预处理", "加工模型构建", "数据产品生产", "质量评价"],
    procS1: { head: ["活动", "操作人", "输入", "输出", "内容"], rows: [["需求分析", "数据加工工程师", "用户需求 / 项目要求", "数据产品规格文档", "明确应用需求（如动力电池电解液）、输出格式与精度要求"]] },
    procS2: { head: ["活动", "操作人", "系统行为", "筛选条件", "输出"], rows: [
      ["数据筛选", "数据加工工程师", "执行 SQL 查询 + 质量过滤", "质量等级 = A 级 或 B 级", "筛选后的数据集合"],
      ["数据筛选", "数据加工工程师", "按电解质类型分组", "燃点 > 150 ℃ 且离子电导率 > 10⁻³ S/m", "分组清单"]
    ] },
    procS3: { head: ["子步骤", "操作人", "系统行为", "处理规则", "输出"], rows: [
      ["格式统一", "系统", "自动执行格式转换脚本", "mol / xyz → 标准 pdb；固态体系 → cif / POSCAR；XRD 数据 → jpg 图谱", "标准格式文件"],
      ["单位统一", "系统", "自动执行单位换算", "非标准单位 → 标准单位（第 1.4 节单位表）", "带标准单位的数据"],
      ["缺失值", "系统", "标记缺失字段", "缺失率 ≤ 5% 时标注 “N/A”；> 5% 退回", "缺失值报告"],
      ["异常值检测", "系统", "执行异常检测算法", "超出 3σ 范围或物理不合理（如离子电导率 > 10⁻² S/m 的固态电解质）", "异常值清单"],
      ["异常值修正", "数据加工工程师", "人工复核异常值", "剔除错误数据，或通过相似体系预测补充（如溶剂化自由能）", "修正记录"]
    ] },
    procS4: { head: ["数据类型", "加工模型 / 算法", "输入", "处理逻辑", "输出"], rows: [
      ["性质数据", "兼容性预测模型", "电解质组成与电极材料特征", "预测电解质-电极界面兼容性等级", "兼容性评级结果"],
      ["图谱数据", "图谱标准化模型", "XRD / XAS / 红外 / 核磁原始谱图", "统一坐标轴、分辨率、标注与图片格式", "标准化 PNG 图谱"],
      ["结构数据", "结构优化验证模型", "CIF / POSCAR 文件", "校验原子坐标合理性、键长范围", "验证后的结构文件"]
    ] },
    procS5: { head: ["数据产品类型", "加工操作", "输出格式", "输出用途"], rows: [
      ["AI 训练数据集", "数据清洗 + 特征工程 + 格式转换", "CSV / JSON + 数据字典", "机器学习模型训练"],
      ["科研参考数据集", "数据整理 + 可视化渲染", "PDF 报告 + JSON", "科研人员查阅"],
      ["跨库融通数据集", "格式转换 + 元数据补全", "JSON（符合 OPTIMADE 格式）", "与主平台融通"]
    ] },
    procS6: { head: ["评价维度", "评价方法", "合格标准", "不合格处理"], rows: [
      ["数据来源质量", "检查来源可信度分级", "来源为 1 级或 2 级", "标记“来源待验证”"],
      ["加工模型质量", "验证模型输出与输入一致性", "电导率预测偏差 < 20%", "调整模型参数"],
      ["数据产品质量", "抽样检测（AQL = 1%）", "缺陷率 < 1%", "返工处理"]
    ] },
    procVersion: { head: ["版本阶段", "版本号格式", "标记位置", "说明"], rows: [
      ["原始版", "V0.0", "元数据字段 “data_version”", "采集后的原始数据"],
      ["标准化版", "V1.0", "元数据字段 “data_version”", "完成标准化预处理"],
      ["产品版", "V2.0", "元数据字段 “data_version”", "完成数据产品生产"]
    ] },
    procModels: [
      { key: "stat", name: "兼容性预测模型", type: "性质数据", input: "电解质组成与电极材料特征", logic: "预测电解质-电极界面兼容性等级", out: "兼容性评级结果" },
      { key: "image", name: "图谱标准化模型", type: "图谱数据", input: "XRD / XAS / 红外 / 核磁原始谱图", logic: "统一坐标轴、分辨率、标注与图片格式", out: "标准化 PNG 图谱" },
      { key: "struct", name: "结构优化验证模型", type: "结构数据", input: "CIF / POSCAR 文件", logic: "校验原子坐标合理性、键长范围", out: "验证后的结构文件" }
    ],
    procProducts: [
      { key: "ai", name: "AI 训练数据集", op: "数据清洗 + 特征工程 + 格式转换", format: "CSV / JSON + 数据字典", use: "机器学习模型训练" },
      { key: "sci", name: "科研参考数据集", op: "数据整理 + 可视化渲染", format: "PDF 报告 + JSON", use: "科研人员查阅" },
      { key: "cross", name: "跨库融通数据集", op: "格式转换 + 元数据补全", format: "JSON（符合 OPTIMADE 格式）", use: "与主平台融通" }
    ],
    procQuality: [
      { key: "source", dim: "数据来源质量", method: "检查来源可信度分级", std: "来源为 1 级或 2 级", fix: "标记“来源待验证”" },
      { key: "model", dim: "加工模型质量", method: "验证模型输出与输入一致性", std: "电导率预测偏差 < 20%", fix: "调整模型参数" },
      { key: "product", dim: "数据产品质量", method: "抽样检测（AQL = 1%）", std: "缺陷率 < 1%", fix: "返工处理" }
    ],
    modelRows: {
      stat: [
        { item: "离子电导率（LLZO）", input: "7.9e-4 / 8.5e-4 / 9.1e-4 S/cm", logic: "计算均值、标准差、置信区间", out: "8.5×10⁻⁴ ± 0.6×10⁻⁴ S/cm（95% CI）" },
        { item: "活化能（Li6PS5Cl）", input: "0.29 / 0.31 / 0.33 eV", logic: "计算均值、标准差、置信区间", out: "0.31 ± 0.02 eV" }
      ],
      image: [
        { item: "XRD 图谱", input: "xrd_raw.txt（2θ 轴不一致）", logic: "统一 2θ 轴、分辨率、标注、格式", out: "xrd_std.png（1600×1200，300 dpi）" },
        { item: "XAS 图谱", input: "xas_raw.txt（800×600）", logic: "统一能量轴、分辨率、标注、格式", out: "xas_std.png（1600×1200，300 dpi）" }
      ],
      struct: [
        { item: "LLZO 结构", input: "LLZO.cif", logic: "校验原子坐标合理性、键长范围", out: "LLZO_verified.cif（Zr-O 键长 2.11 Å，合理）" },
        { item: "Li6PS5Cl 结构", input: "Li6PS5Cl.cif", logic: "校验原子坐标合理性、键长范围", out: "Li6PS5Cl_verified.cif（P-S 键长 2.05 Å，合理）" }
      ]
    },
    outliers: [
      { key: "o1", name: "LLZO · 离子电导率", value: "4.6×10⁻² S/cm", sigma: "5.1σ", fixed: "", keep: false },
      { key: "o2", name: "PEO-LiTFSI · 燃点", value: "42 ℃", sigma: "3.4σ", fixed: "", keep: false }
    ],
    procNamePh: "如：高安全性电解液数据集加工",
    listCols: [{ key: "type", label: "电解质类型" }, { key: "conductivity", label: "离子电导率", unit: " S/cm" }, { key: "bandGap", label: "带隙", unit: " eV" }],
    metric: { key: "conductivity", label: "离子电导率", unit: " S/cm" },
    batchSamples: [
      { formula: "Li7La3Zr2O12", dataType: "物性数据", type: "固态无机电解质", conductivity: "8.5e-4", bandGap: "4.86", quality: "高精度" },
      { formula: "Li6PS5Cl", dataType: "物性数据", type: "固态无机电解质", conductivity: "3.2e-3", bandGap: "2.35", quality: "高精度" },
      { formula: "PEO-LiTFSI", dataType: "物性数据", type: "固态有机电解质", conductivity: "1.1e-5", bandGap: "", quality: "低精度" },
      { formula: "LiFSI-DME", dataType: "物性数据", type: "有机电解液", conductivity: "6.4e-3", bandGap: "", quality: "高精度" }
    ],
    tasks: [
      { id: "EL-CL-2026-0922-001", name: "固态无机电解质（LLZO）晶体结构数据采集", method: "open", desc: "从 Materials Project 开放 API 采集 LLZO 晶格常数、带隙与能带结构数据", status: "已完成", createdAt: "2026-09-22 10:24", source: "Materials Project（材料项目数据库）", version: "v2025.03", rawFiles: "JSON / CIF", security: "第1级" },
      { id: "EL-CL-2026-0923-002", name: "有机电解液（LiFSI-DME）物性数据采集", method: "buy", desc: "从已购买 Reaxys 电解质应用数据包导入电解液与电极兼容性数据", status: "已完成", createdAt: "2026-09-23 09:12", source: "Reaxys 电解质应用数据包", version: "2026.07", rawFiles: "JSON", security: "第1级" },
      { id: "EL-CL-2026-0923-003", name: "硫化物固态电解质（Li6PS5Cl）输运性质计算", method: "calc", desc: "基于 VASP 计算输出文件提取带隙、态密度与离子迁移能垒", status: "待确认", createdAt: "2026-09-23 16:48", source: "本地计算输出（OUTCAR / DOSCAR）", version: "V0.0", rawFiles: "JSON", security: "第2级" }
    ],
    datasets: [
      { key: "liquid", title: "有机电解液数据集", format: "PDB / CSV", volume: 3150, fields: ["基础信息", "物性数据", "表征图谱", "安全信息", "HOMO-LUMO", "电荷分布", "溶剂化能"], desc: "按醚类、酯类、环状和其他四类子数据集组织，涵盖基础信息、物性数据、表征图谱、安全信息和计算数据五大模块。" },
      { key: "solid-organic", title: "固态有机电解质数据集", format: "PDB / CSV / JSON", volume: 2400, fields: ["单体信息", "摩尔体积", "密度", "玻璃化转变温度", "电导率", "摩尔热容", "结合能"], desc: "按醚类、酮类、腈类和其他官能团分类，涵盖基础信息、物性数据和计算数据三大模块。" },
      { key: "solid-inorganic", title: "固态无机电解质数据集", format: "CIF / POSCAR / CSV", volume: 4700, fields: ["晶体结构", "形成能", "费米能级", "带隙", "能带/态密度", "XRD", "XAS"], desc: "按氧化物、硫化物、卤化物和其他类型分类，涵盖基础信息、计算数据和图谱数据三大模块。" }
    ]
  };

  /* ---------------------------------------- 机器学习力场（R22~R24，加工合并在 R24） */
  MAT.mlff = {
    code: "ML",
    short: "机器学习力场",
    title: "机器学习力场数据采集加工处理",
    headDesc: "面向机器学习力场数据的采集、录入与加工全流程管理：支持 QM9 / PDB / PubChem 开源抓取、Reaxys 商用数据导入与 Gromacs / Amber / Q-Chem 自主采样计算提取，<br>内置构象级字段校验、异常处理队列与质量评价规则，采集结果确认后统一入库。",
    introTitle: "机器学习力场数据库数据资源共包含 3 类核心对象（按分子体系类型划分），采集 / 录入 / 加工均围绕这些对象展开。",
    introBanner: "3 类核心对象：有机小分子力场对象、高分子力场对象、蛋白质力场对象。各资源对象包含的数据字段如下：",
    introTip: "采集参数中的「性质范围」即针对上述资源对象的性质字段设置取值范围，用于过滤落在范围外的数据记录。",
    objectsNote: "机器学习力场 3 类核心对象",
    typeTip: "选择本次采集的分子体系类型，不同类型对应不同的性质字段模板。",
    buyNote: "仅展示当前账号已完成采购或已完成自采登记的数据库，勾选后可从对应数据包中导入力场数据。",
    calcTip: "自主采样计算须声明系综（NVT / NPT）与采样温度区间，量子化学标注 CCSD(T) / MP2 与基组，参数不合规将进入合规性校验报告分支。",
    taskNamePh: "请输入采集任务名称，如：有机小分子（H2O）CCSD(T) 能量与受力数据采集",
    doneNote: "审核通过并完成入库的机器学习力场数据，可直接送去资源加工。",
    objects: [
      { name: "有机小分子力场对象", fields: "基础信息（名称、分子式、结构）、采样数据（温度、构象数、RMSD）、计算数据（单分子能量、原子受力、双分子相互作用能）、原子性质（电荷、偶极矩、极化率）" },
      { name: "高分子力场对象", fields: "基础信息（名称、重复单元、片段结构）、采样数据（温度、链段运动频率）、计算数据（片段总能量、原子受力、分子间相互作用能）" },
      { name: "蛋白质力场对象", fields: "基础信息（名称、氨基酸序列、结构）、采样数据（温度、折叠状态）、计算数据（肽键能量、侧链相互作用能、静电相互作用能）" }
    ],
    systems: [
      { name: "有机小分子体系", abbr: "SM", sample: "H2O", fields: ["单分子能量", "原子受力", "双分子相互作用能", "原子电荷", "偶极矩", "极化率", "构象数"] },
      { name: "高分子片段体系", abbr: "PL", sample: "PEO", fields: ["单分子能量", "原子受力", "双分子相互作用能", "原子电荷", "偶极矩", "极化率", "构象数"] },
      { name: "蛋白质体系", abbr: "PT", sample: "Gly-Gly", fields: ["单分子能量", "原子受力", "双分子相互作用能", "原子电荷", "偶极矩", "极化率", "构象数"] }
    ],
    methods: {
      open: { key: "open", label: "开源数据获取", tag: "rw-tag--open", desc: "通过 Python 爬虫抓取 QM9 的小分子能量数据、PDB 的蛋白质二肽 / 三肽结构数据与 PubChem 的小分子基础信息" },
      buy: { key: "buy", label: "数据购买 / 自采数据", tag: "rw-tag--buy", desc: "从已购买授权的 Reaxys 高分子片段分子间相互作用能数据与 ProteinDataBank 蛋白质构象动态数据中导入" },
      calc: { key: "calc", label: "自主采样计算", tag: "rw-tag--calc", desc: "上传 Gromacs / Amber 采样轨迹与 Q-Chem / VASP 计算输出，由系统校验完整性、合规性并提取结构化数据" }
    },
    openDbs: [
      {
        key: "qm9", name: "QM9（量子化学小分子数据集）", meta: "开放 API · 官方 v2024 数据版本",
        datasets: [
          { name: "小分子能量数据集", desc: "含 H2O、CH4 等 CCSD(T) / MP2 能量 · 共 498 条记录", count: 498 },
          { name: "有机小分子力场数据集", desc: "含 CCSD(T)/MP2 能量与原子受力标签 · 共 362 条记录", count: 362 },
          { name: "小分子原子性质数据集", desc: "含原子电荷、偶极矩与极化率", count: 284 }
        ]
      },
      {
        key: "pdb", name: "PDB（蛋白质结构数据库）", meta: "开放 API · 2026.07 数据版本",
        datasets: [
          { name: "蛋白质二肽 / 三肽结构数据集", desc: "含甘氨酸二肽、丙氨酸三肽构象", count: 216 },
          { name: "蛋白质构象动态数据集", desc: "含折叠状态与采样温度标注", count: 148 }
        ]
      },
      {
        key: "pubchem", name: "PubChem（化合物数据库）", meta: "开放 API · 官方 2026.08 数据版本",
        datasets: [
          { name: "小分子基础信息数据集", desc: "含分子式、分子量与 SMILES", count: 1120 }
        ]
      }
    ],
    buyDbs: [
      { key: "b-reaxys", name: "Reaxys 高分子片段数据包", meta: "已购买 · 授权有效期至 2027-05-31", datasets: [{ name: "高分子片段相互作用能", desc: "含 PEO / PET 片段分子间相互作用能", count: 320 }, { name: "链段运动频率数据", desc: "含不同温度下的链段动力学", count: 140 }] },
      { key: "b-pdb", name: "ProteinDataBank 构象动态数据", meta: "已购买 · 机构订阅", datasets: [{ name: "蛋白质构象动态数据", desc: "含轨迹采样与折叠状态标注", count: 260 }] },
      { key: "b-self", name: "课题组自采采样数据包", meta: "自采 · 本地上传", datasets: [{ name: "自采 MD 轨迹数据", desc: "Gromacs NVT 系综采样结果", count: 420 }] }
    ],
    dbVersions: { qm9: "v2024", pdb: "2026.07", pubchem: "2026.08", "b-reaxys": "2026.07", "b-pdb": "2026.07", "b-self": "V0.0（自采）" },
    calcOutputs: [
      { key: "PDB", desc: "采样构象文件：构象坐标与构象 ID" },
      { key: "CSV", desc: "能量 / 受力数据文件：能量、Fx/Fy/Fz" },
      { key: "XML", desc: "力场参数文件：色散系数、电荷参数" },
      { key: "LOG", desc: "Q-Chem / VASP 计算日志：能量、收敛信息" }
    ],
    calcInputs: ["MDP", "TOP", "GRO", "INP"],
    calcInputDesc: { MDP: "Gromacs 分子动力学参数文件", TOP: "拓扑文件（力场与分子类型）", GRO: "初始构型坐标文件", INP: "Q-Chem 量子化学输入文件" },
    calcCompliance: [
      { key: "ensemble", name: "采样系综", rule: "NVT 或 NPT", bad: "检测到 NVE 系综，未控温不可用于力场训练", fix: "重新采样" },
      { key: "temp", name: "采样温度", rule: "200 ~ 1000 K", bad: "采样温度为 120 K，低于标准区间 200 K", fix: "重新采样" },
      { key: "method", name: "量子化学方法", rule: "CCSD(T) 或 MP2", bad: "检测到 DFT-GGA 方法，低于标准 CCSD(T) / MP2", fix: "低精度入库" },
      { key: "basis", name: "基组", rule: "≥ def2-TZVP", bad: "基组为 6-31G*，低于标准阈值 def2-TZVP", fix: "重新计算" },
      { key: "conformers", name: "构象数", rule: "≥ 1000 个 / 体系", bad: "构象数为 320，低于标准阈值 1000", fix: "补采样" }
    ],
    mediaExt: "pdb",
    payloadTitle: "构象结构 / 能量与受力 / 原子性质",
    payload: {
      构象结构: { 分子式: "H2O", 构象数: "1,200", 采样系综: "NVT", 采样温度: "300 K", 采样时长: "10 ns", RMSD: "0.42 Å" },
      能量与受力: { 单分子能量: "-76.321 154 Hartree（CCSD(T)）", 原子受力: "最大 0.042 eV/Å", "Fx / Fy / Fz": "已按构象 ID 对齐输出", 双分子相互作用能: "-6.82 kJ/mol", 肽键能量: "—" },
      原子性质: { "原子电荷（O）": "-0.812 e", "原子电荷（H）": "+0.406 e", 偶极矩: "1.85 Debye", 极化率: "1.45 Å³", "色散系数 C6": "12.6 a.u." }
    },
    payloadJson: '{&nbsp;&quot;system&quot;:&nbsp;&quot;H2O&quot;,<br>'
      + '&nbsp;&nbsp;<span class="k">&quot;sampling&quot;</span>:&nbsp;{&nbsp;<span class="k">&quot;ensemble&quot;</span>:&nbsp;<span class="s">&quot;NVT&quot;</span>,&nbsp;<span class="k">&quot;temp&quot;</span>:&nbsp;<span class="n">300</span>,&nbsp;<span class="k">&quot;conformers&quot;</span>:&nbsp;<span class="n">1200</span>,&nbsp;<span class="k">&quot;rmsd&quot;</span>:&nbsp;<span class="n">0.42</span>&nbsp;},<br>'
      + '&nbsp;&nbsp;<span class="k">&quot;energy&quot;</span>:&nbsp;{&nbsp;<span class="k">&quot;e_total&quot;</span>:&nbsp;<span class="n">-76.321154</span>,&nbsp;<span class="k">&quot;unit&quot;</span>:&nbsp;<span class="s">&quot;Hartree&quot;</span>,&nbsp;<span class="k">&quot;method&quot;</span>:&nbsp;<span class="s">&quot;CCSD(T)&quot;</span>,&nbsp;<span class="k">&quot;fmax&quot;</span>:&nbsp;<span class="n">0.042</span>&nbsp;},<br>'
      + '&nbsp;&nbsp;<span class="k">&quot;atomic&quot;</span>:&nbsp;{&nbsp;<span class="k">&quot;q_O&quot;</span>:&nbsp;<span class="n">-0.812</span>,&nbsp;<span class="k">&quot;dipole&quot;</span>:&nbsp;<span class="n">1.85</span>,&nbsp;<span class="k">&quot;polar&quot;</span>:&nbsp;<span class="n">1.45</span>,&nbsp;<span class="k">&quot;c6&quot;</span>:&nbsp;<span class="n">12.6</span>&nbsp;}<br>}',
    entryMethodRows: [
      ["QM9 / PDB 等公开库", "定制插件批量导入", "文件头含 “QM9” / “PDB” 标识", "采集参数配置"],
      ["Reaxys / ProteinDataBank 商用库", "定制插件批量导入", "商用授权文件头校验", "采购范围核对"],
      ["Gromacs / Amber 自主采样计算数据", "自动化流程录入", "包含 MDP+TOP+GRO+INP", "参数合规性复核"],
      ["特殊数据（力场参数、采样过程描述）", "手动输入", "无法自动识别", "全文录入"],
      ["用户上传数据", "手动输入 + 自动校验", "文件格式识别", "质量审核"]
    ],
    entrySources: [
      { key: "qm9", name: "QM9 等公开库", rec: "定制插件批量导入", rule: '文件头含 "QM9" 标识', point: "采集参数配置", plugin: "QM9Plugin" },
      { key: "pdb", name: "PDB 蛋白质结构数据库", rec: "定制插件批量导入", rule: '文件头含 "PDB" 标识', point: "采集参数配置", plugin: "PDBPlugin" },
      { key: "md", name: "Gromacs / Amber 自主采样计算数据", rec: "自动化流程录入", rule: "包含 MDP+TOP+GRO+INP", point: "参数合规性复核", plugin: "MDAutoFlow" },
      { key: "literature", name: "特殊数据（力场参数）", rec: "手动输入", rule: "无法自动识别", point: "全文录入", plugin: "-" },
      { key: "user", name: "用户上传数据", rec: "手动输入 + 自动校验", rule: "文件格式识别", point: "质量审核", plugin: "AutoValidator" }
    ],
    dataTypeCodes: { "有机小分子力场对象": "SM", "高分子力场对象": "PL", "蛋白质力场对象": "PT" },
    entryManualFields: [
      { key: "formula", label: "分子式", req: true, ph: "如 H2O", rule: "formula", msg: "分子式格式不正确，示例：H2O" },
      { key: "systemType", label: "分子体系类型", req: true, type: "select", opts: ["有机小分子体系", "高分子片段体系", "蛋白质体系"], rule: "text" },
      { key: "dataType", label: "数据类型", req: true, type: "select", opts: ["有机小分子力场对象", "高分子力场对象", "蛋白质力场对象"], rule: "text" },
      { key: "name", label: "体系名称", req: true, ph: "如 甘氨酸二肽", rule: "text" },
      { key: "conformers", label: "构象数", req: true, unit: "个", rule: "pos", msg: "构象数必须为正数" },
      { key: "temperature", label: "采样温度", req: true, unit: "K", rule: "range", min: 0, max: 1000, msg: "采样温度超出合理范围（0 ~ 1000 K）" },
      { key: "energy", label: "单分子能量", req: true, unit: "Hartree", ph: "如 -76.321154", rule: "num", msg: "请输入数值型能量" },
      { key: "force", label: "原子受力", req: false, unit: "eV/Å", rule: "num", msg: "请输入数值型受力" },
      { key: "dimerEnergy", label: "双分子相互作用能", req: false, unit: "kJ/mol", rule: "num", msg: "请输入数值型相互作用能" },
      { key: "rmsd", label: "RMSD", req: false, unit: "Å", rule: "pos", msg: "RMSD 必须为正数" },
      { key: "dipole", label: "偶极矩", req: false, unit: "Debye", rule: "pos", msg: "偶极矩必须为正数" }
    ],
    entryCalcParams: [
      { key: "software", label: "采样软件", type: "select", opts: ["Gromacs", "Amber", "LAMMPS", "MaterialsStudio"], std: "—", neutral: true },
      { key: "ensemble", label: "采样系综", type: "select", opts: ["NVT", "NPT", "NVE"], std: "NVT 或 NPT", bad: ["NVE"], msg: "检测到 NVE 系综，未控温不可用于力场训练" },
      { key: "temp", label: "采样温度", unit: "K", std: "200 ~ 1000 K", min: 200, max: 1000, msg: "采样温度超出标准区间 200 ~ 1000 K" },
      { key: "method", label: "量子化学方法", type: "select", opts: ["CCSD(T)", "MP2", "PBE0", "DFT-GGA"], std: "CCSD(T) 或 MP2", bad: ["DFT-GGA"], msg: "检测到 DFT-GGA 方法，低于标准 CCSD(T) / MP2" },
      { key: "basis", label: "基组", type: "select", opts: ["def2-QZVP", "def2-TZVP", "def2-SVP", "6-31G*"], std: "≥ def2-TZVP", bad: ["6-31G*", "def2-SVP"], msg: "基组低于标准阈值 def2-TZVP" },
      { key: "conformers", label: "构象数", unit: "个", std: "≥ 1000 个 / 体系", min: 1000, msg: "构象数低于标准阈值 1000" }
    ],
    entryManualSteps: [
      { who: "数据录入员", act: "选择“新增材料”", sys: "显示机器学习力场标准录入表单（基于 1.2 节字段定义）", check: "—", out: "空白录入界面" },
      { who: "数据录入员", act: "填写必填字段（分子式、体系类型、构象数、能量等）", sys: "实时校验：分子式有效性、数值范围", check: "必填项完整性、值域合法性", out: "已填数据" },
      { who: "数据录入员", act: "上传构象文件（XYZ / PDB）", sys: "解析构象文件，自动填充原子坐标与构象数", check: "文件格式合规性", out: "自动填充的字段" },
      { who: "数据录入员", act: "填写采样与计算参数（系综、温度、方法、基组）", sys: "与标准阈值（1.4 节）对比", check: "参数合规性", out: "计算参数记录" },
      { who: "系统", act: "—", sys: "生成唯一标识：ML-数据类型-序号", check: "数据库查询最大序号 +1", out: "材料唯一标识" },
      { who: "数据录入员", act: "提交数据", sys: "进入审核队列", check: "触发第 2.2.4 节审核流程", out: "提交状态" }
    ],
    entryBatchSteps: [
      { who: "数据录入员", act: "选择批量导入入口", sys: "显示数据源类型选择界面", check: "选择正确的数据源类型", out: "数据源配置" },
      { who: "数据录入员", act: "上传数据包（ZIP）或配置 API", sys: "解压 / 解析数据包，列出文件清单", check: "文件完整性检查", out: "文件清单" },
      { who: "系统", act: "—", sys: "调用对应解析插件（QM9 / PDB / MD 轨迹）", check: "按数据源类型匹配解析器", out: "解析后的结构化数据" },
      { who: "系统", act: "—", sys: "按录入规范表（1.2 节）自动映射字段", check: "字段名匹配、类型转换", out: "字段映射结果" },
      { who: "系统", act: "—", sys: "执行自动审核（交叉对比 + 可重复性 + 格式统一）", check: "第 2.2.3 节审核规则", out: "审核状态" },
      { who: "数据录入员", act: "查看并确认批处理结果", sys: "显示成功 / 失败条数及明细", check: "失败条目需人工处理", out: "入库确认" }
    ],
    entryRules: [
      ["分子式", "正则：[A-Z][a-z]?\\d*（可重复）", "“分子式格式不正确，示例：H2O”"],
      ["构象数", "> 0，且训练用体系建议 ≥ 1000", "“构象数必须为正数”"],
      ["采样温度", "0 ~ 1000 K", "“采样温度超出合理范围（0 ~ 1000 K）”"],
      ["能量 / 受力", "数值型（支持科学计数法）", "“请输入数值型能量”"],
      ["RMSD / 偶极矩", "> 0", "“RMSD 必须为正数”"]
    ],
    manualDefaults: {
      form: { dataType: "有机小分子力场对象", systemType: "有机小分子体系" },
      calc: { software: "Gromacs", ensemble: "NVT", temp: "300", method: "CCSD(T)", basis: "def2-QZVP", conformers: "1200" }
    },
    demoFile: "H2O_traj.pdb",
    demoParse: { formula: "H2O", systemType: "有机小分子体系", name: "水分子（H2O）", conformers: "1200", temperature: "300", energy: "-76.321154", force: "0.042", dimerEnergy: "-6.82", rmsd: "0.42", dipole: "1.85" },
    procFlow: [
      { n: "数据策划", d: "明确力场应用场景，如“药物分子对接力场”" },
      { n: "基础数据筛选", d: "按“小分子 + CCSD(T) 计算 + 构象数 ≥ 1000”筛选" },
      { n: "标准化预处理", d: "格式统一、异常构象剔除、数据补全" },
      { n: "加工模型构建", d: "构建力场参数拟合模型" },
      { n: "数据产品生产", d: "如“小分子高精度力场训练集”" },
      { n: "质量评价", d: "参数拟合误差校验" }
    ],
    procStepTitles: ["数据策划", "基础数据筛选", "标准化预处理", "加工模型构建", "数据产品生产", "质量评价"],
    procS1: { head: ["活动", "操作人", "输入", "输出", "内容"], rows: [["需求分析", "数据加工工程师", "力场训练需求 / 项目要求", "数据产品规格文档", "明确力场应用场景（如药物分子对接力场）、输出格式与精度要求"]] },
    procS2: { head: ["活动", "操作人", "系统行为", "筛选条件", "输出"], rows: [
      ["数据筛选", "数据加工工程师", "执行 SQL 查询 + 质量过滤", "质量等级 = A 级 或 B 级", "筛选后的数据集合"],
      ["数据筛选", "数据加工工程师", "按分子体系分组", "小分子 + CCSD(T) 计算 + 构象数 ≥ 1000", "分组清单"]
    ] },
    procS3: { head: ["子步骤", "操作人", "系统行为", "处理规则", "输出"], rows: [
      ["格式统一", "系统", "自动执行格式转换脚本", "xyz / mol → 标准 pdb；txt 能量数据 → csv", "标准格式文件"],
      ["单位统一", "系统", "自动执行单位换算", "字段统一为：构象 ID、分子名称、原子坐标 x/y/z、能量、Fx/Fy/Fz", "带标准单位的数据"],
      ["缺失值", "系统", "标记缺失字段", "缺失率 ≤ 5% 时标注 “N/A”；> 5% 退回", "缺失值报告"],
      ["异常值检测", "系统", "执行异常检测算法", "能量超出均值 3 倍标准差或键长 > 2 Å 的几何不合理构象", "异常值清单"],
      ["异常值修正", "数据加工工程师", "人工复核异常构象", "剔除异常构象；缺失受力数据通过相邻构象插值补充", "修正记录"]
    ] },
    procS4: { head: ["数据类型", "加工模型 / 算法", "输入", "处理逻辑", "输出"], rows: [
      ["能量 / 受力数据", "力场参数拟合模型", "构象-能量-受力三元组", "拟合键合 / 非键合参数并计算拟合残差", "力场参数（XML）"],
      ["构象数据", "构象标准化模型", "MD 采样轨迹", "统一构象 ID、坐标顺序与拓扑定义", "标准化构象集"],
      ["原子性质数据", "原子性质预测模型", "已知电荷 / 极化率样本", "按相似官能团预测缺失的原子性质", "补全的原子性质"]
    ] },
    procS5: { head: ["数据产品类型", "加工操作", "输出格式", "输出用途"], rows: [
      ["AI 训练数据集", "数据清洗 + 特征工程 + 格式转换", "CSV / JSON + 数据字典", "机器学习力场训练"],
      ["科研参考数据集", "数据整理 + 可视化渲染", "PDF 报告 + JSON", "科研人员查阅"],
      ["跨库融通数据集", "格式转换 + 元数据补全", "JSON（符合 OPTIMADE 格式）", "与主平台融通"]
    ] },
    procS6: { head: ["评价维度", "评价方法", "合格标准", "不合格处理"], rows: [
      ["数据来源质量", "检查来源可信度分级", "来源为 1 级或 2 级", "标记“来源待验证”"],
      ["加工模型质量", "验证参数拟合残差", "能量拟合 RMSE < 1 kJ/mol", "调整模型参数"],
      ["数据产品质量", "抽样检测（AQL = 1%）", "缺陷率 < 1%", "返工处理"]
    ] },
    procVersion: { head: ["版本阶段", "版本号格式", "标记位置", "说明"], rows: [
      ["原始版", "V0.0", "元数据字段 “data_version”", "采集后的原始数据"],
      ["标准化版", "V1.0", "元数据字段 “data_version”", "完成标准化预处理"],
      ["产品版", "V2.0", "元数据字段 “data_version”", "完成数据产品生产"]
    ] },
    procModels: [
      { key: "stat", name: "力场参数拟合模型", type: "能量 / 受力数据", input: "构象-能量-受力三元组", logic: "拟合键合 / 非键合参数并计算拟合残差", out: "力场参数（XML）" },
      { key: "image", name: "构象标准化模型", type: "构象数据", input: "MD 采样轨迹", logic: "统一构象 ID、坐标顺序与拓扑定义", out: "标准化构象集" },
      { key: "struct", name: "原子性质预测模型", type: "原子性质数据", input: "已知电荷 / 极化率样本", logic: "按相似官能团预测缺失的原子性质", out: "补全的原子性质" }
    ],
    procProducts: [
      { key: "ai", name: "AI 训练数据集", op: "数据清洗 + 特征工程 + 格式转换", format: "CSV / JSON + 数据字典", use: "机器学习力场训练" },
      { key: "sci", name: "科研参考数据集", op: "数据整理 + 可视化渲染", format: "PDF 报告 + JSON", use: "科研人员查阅" },
      { key: "cross", name: "跨库融通数据集", op: "格式转换 + 元数据补全", format: "JSON（符合 OPTIMADE 格式）", use: "与主平台融通" }
    ],
    procQuality: [
      { key: "source", dim: "数据来源质量", method: "检查来源可信度分级", std: "来源为 1 级或 2 级", fix: "标记“来源待验证”" },
      { key: "model", dim: "加工模型质量", method: "验证参数拟合残差", std: "能量拟合 RMSE < 1 kJ/mol", fix: "调整模型参数" },
      { key: "product", dim: "数据产品质量", method: "抽样检测（AQL = 1%）", std: "缺陷率 < 1%", fix: "返工处理" }
    ],
    modelRows: {
      stat: [
        { item: "单分子能量（H2O）", input: "1,200 个构象的 CCSD(T) 能量", logic: "拟合键合 / 非键合参数，计算残差", out: "力场参数 water.xml（RMSE 0.42 kJ/mol）" },
        { item: "双分子相互作用能（H2O 二聚体）", input: "320 个二聚体构象", logic: "拟合非键合参数，计算残差", out: "非键合参数（RMSE 0.86 kJ/mol）" }
      ],
      image: [
        { item: "MD 采样轨迹", input: "traj_raw.xtc（构象 ID 不连续）", logic: "统一构象 ID、坐标顺序与拓扑定义", out: "traj_std.pdb（1,200 构象，顺序一致）" },
        { item: "高分子片段轨迹", input: "peo_traj.xtc", logic: "统一构象 ID、坐标顺序与拓扑定义", out: "peo_std.pdb（860 构象）" }
      ],
      struct: [
        { item: "H2O 构象", input: "H2O_traj.pdb", logic: "校验键长键角合理性、剔除几何异常构象", out: "H2O_verified.pdb（O-H 键长 0.97 Å，合理）" },
        { item: "甘氨酸二肽构象", input: "glygly.pdb", logic: "校验键长键角合理性、剔除几何异常构象", out: "glygly_verified.pdb（肽键 1.33 Å，合理）" }
      ]
    },
    outliers: [
      { key: "o1", name: "H2O · 单分子能量", value: "-74.02 Hartree", sigma: "4.8σ", fixed: "", keep: false },
      { key: "o2", name: "PEO 片段 · 键长", value: "2.46 Å", sigma: "3.9σ", fixed: "", keep: false }
    ],
    procNamePh: "如：小分子高精度力场训练集加工",
    listCols: [{ key: "systemType", label: "分子体系" }, { key: "conformers", label: "构象数", unit: " 个" }, { key: "energy", label: "单分子能量", unit: " Ha" }],
    metric: { key: "conformers", label: "构象数", unit: " 个" },
    batchSamples: [
      { formula: "H2O", dataType: "有机小分子力场对象", systemType: "有机小分子体系", conformers: "1200", energy: "-76.321154", quality: "高精度" },
      { formula: "CH4", dataType: "有机小分子力场对象", systemType: "有机小分子体系", conformers: "1080", energy: "-40.512340", quality: "高精度" },
      { formula: "PEO", dataType: "高分子力场对象", systemType: "高分子片段体系", conformers: "860", energy: "-154.208100", quality: "低精度" },
      { formula: "Gly-Gly", dataType: "蛋白质力场对象", systemType: "蛋白质体系", conformers: "1420", energy: "-491.336200", quality: "高精度" }
    ],
    tasks: [
      { id: "ML-CL-2026-0922-001", name: "有机小分子（H2O）CCSD(T) 能量数据采集", method: "open", desc: "从 QM9 开放数据集采集 H2O、CH4 的 CCSD(T) 能量与原子受力数据", status: "已完成", createdAt: "2026-09-22 10:24", source: "QM9（量子化学小分子数据集）", version: "v2024", rawFiles: "CSV / XYZ", security: "第1级" },
      { id: "ML-CL-2026-0923-002", name: "高分子片段（PEO）相互作用能数据采集", method: "buy", desc: "从已购买 Reaxys 高分子数据包导入 PEO / PET 片段分子间相互作用能", status: "已完成", createdAt: "2026-09-23 09:12", source: "Reaxys 高分子片段数据包", version: "2026.07", rawFiles: "CSV / XML", security: "第1级" },
      { id: "ML-CL-2026-0923-003", name: "蛋白质二肽（甘氨酸）构象采样数据计算", method: "calc", desc: "基于 Gromacs NVT 采样与 Q-Chem 计算提取构象、能量与原子受力", status: "待确认", createdAt: "2026-09-23 16:48", source: "本地计算输出（PDB / CSV）", version: "V0.0", rawFiles: "CSV", security: "第2级" }
    ],
    datasets: [
      { key: "basic", title: "机器学习力场基础数据集", format: "PDB / CSV / XML", volume: 9600, fields: ["原子电荷", "偶极矩", "极化率", "色散系数", "单分子能量", "相互作用能", "原子受力"], desc: "收录单分子、双分子和多分子团簇的结构、能量、原子受力，以及原子电荷、偶极矩、极化率、色散系数等力场参数。" },
      { key: "small-molecule", title: "有机小分子机器学习力场数据集", format: "PDB / XYZ / CSV", volume: 8400, fields: ["醚类小分子", "酰胺类小分子", "构象采样", "能量与受力"], desc: "收录醚类、酰胺类有机小分子的构象采样数据与第一性原理计算的能量、受力等训练集数据。" },
      { key: "polymer", title: "高分子机器学习力场数据集", format: "PDB / HDF5", volume: 7200, fields: ["高分子片段", "蛋白质构象", "片段能量", "相互作用能"], desc: "收录高分子片段（重复单元、官能团）与蛋白质（二肽/三肽）构象采样和能量数据，用于机器学习力场训练。" }
    ]
  };

  /* ------------------------------------------------------ 催化材料（R25） */
  MAT.catalyst = {
    code: "CA",
    short: "催化材料",
    title: "催化材料数据采集加工处理",
    headDesc: "面向催化材料数据的采集、录入与加工全流程管理：支持 Catalysis-Hub / OC20 开源抓取、文献催化性能专题库导入与 VASP 表面吸附 / 反应路径计算提取，<br>内置吸附能与活化能字段校验、异常处理队列与质量评价规则，采集结果确认后统一入库。",
    introTitle: "催化材料数据库的数据资源包含 2 类核心对象，采集 / 录入 / 加工均围绕这些对象展开。",
    introBanner: "2 类核心对象：催化表面分子吸附数据、催化表面反应路径数据。各资源对象包含的数据字段如下：",
    introTip: "采集参数中的「性质范围」即针对上述资源对象的性质字段设置取值范围，用于过滤落在范围外的数据记录。",
    objectsNote: "催化材料 2 类核心对象",
    typeTip: "选择本次采集的催化表面类型，不同类型对应不同的性质字段模板。",
    buyNote: "仅展示当前账号已完成采购或已完成自采登记的专题库，勾选后可从对应数据包中导入催化材料数据。",
    calcTip: "表面模型计算须设置真空层 ≥ 12 Å、力收敛 ≤ 0.02 eV/Å，K 点密度按表面单胞尺寸折算，参数不合规将进入合规性校验报告分支。",
    taskNamePh: "请输入采集任务名称，如：Cu(211) 表面 CO2 还原吸附能数据采集",
    doneNote: "审核通过并完成入库的催化材料数据，可直接送去资源加工。",
    objects: [
      { name: "催化表面分子吸附数据", fields: "催化表面晶面、掺杂原子参数、吸附分子种类、吸附分子构型、分子吸附位置、分子吸附能量" },
      { name: "催化表面反应路径数据", fields: "催化表面晶面、掺杂原子参数、吸附分子种类、反应初始构型、反应产物、产物吸附构型、过渡态吸附构型、反应能、活化能" }
    ],
    systems: [
      { name: "Cu(100) / Cu(110) / Cu(111) 表面", abbr: "LOW", sample: "Cu(111)", fields: ["催化表面晶面", "掺杂原子参数", "吸附分子种类", "吸附分子构型", "分子吸附能量", "反应能", "活化能"] },
      { name: "Cu(210) / Cu(411) 台阶表面", abbr: "STEP", sample: "Cu(211)", fields: ["催化表面晶面", "掺杂原子参数", "吸附分子种类", "吸附分子构型", "分子吸附能量", "反应能", "活化能"] },
      { name: "单原子与二元合金催化剂", abbr: "ALLOY", sample: "Cu-Ag", fields: ["催化表面晶面", "掺杂原子参数", "吸附分子种类", "吸附分子构型", "分子吸附能量", "反应能", "活化能"] }
    ],
    methods: {
      open: { key: "open", label: "开源数据获取", tag: "rw-tag--open", desc: "从 Catalysis-Hub 与 OC20 开放数据集中获取催化表面吸附构型与反应路径数据" },
      buy: { key: "buy", label: "数据购买 / 自采数据", tag: "rw-tag--buy", desc: "从已购买或自建的文献催化性能专题库中导入实验与计算催化性能数据" },
      calc: { key: "calc", label: "数据计算", tag: "rw-tag--calc", desc: "上传 VASP 表面计算输入 / 输出文件，由系统校验完整性、合规性并提取结构化数据" }
    },
    openDbs: [
      {
        key: "cathub", name: "Catalysis-Hub（催化反应数据库）", meta: "开放 API · 官方 2026.05 数据版本",
        datasets: [
          { name: "催化材料元素特征数据集", desc: "含元素编码、价态与周期表特征 · 共 5,100 条记录", count: 5100 },
          { name: "催化表面吸附数据集", desc: "含表面晶面、吸附构型与吸附能", count: 3240 },
          { name: "反应路径数据集", desc: "含初态、过渡态、末态与活化能", count: 1860 }
        ]
      },
      {
        key: "oc20", name: "OC20（催化表面数据集）", meta: "开放 API · 官方 2026.02 数据版本",
        datasets: [
          { name: "OC20 结构弛豫数据集", desc: "含表面-吸附物初始与弛豫构型", count: 6480 },
          { name: "OC20 吸附能数据集", desc: "含吸附能标签与力场一致性判定", count: 2760 }
        ]
      }
    ],
    buyDbs: [
      { key: "b-liter", name: "文献催化性能专题库", meta: "已建库 · 机构自建", datasets: [{ name: "文献催化活性数据", desc: "含过电位、法拉第效率与产物分布", count: 1240 }, { name: "单原子催化剂实验数据", desc: "含掺杂元素与活性位点表征", count: 420 }] },
      { key: "b-alloy", name: "二元合金催化专题数据包", meta: "已建库 · 2026-04 入库", datasets: [{ name: "二元合金表面数据", desc: "含合金配比与表面偏析能", count: 860 }] },
      { key: "b-self", name: "课题组自采数据包（CO2RR）", meta: "自采 · 本地上传", datasets: [{ name: "自采电化学测试数据", desc: "自测产物分布与法拉第效率", count: 320 }] }
    ],
    dbVersions: { cathub: "2026.05", oc20: "2026.02", "b-liter": "2026.06", "b-alloy": "2026.04", "b-self": "V0.0（自采）" },
    calcOutputs: [
      { key: "OUTCAR", desc: "VASP 输出详细信息文件：吸附能、受力、收敛信息" },
      { key: "CONTCAR", desc: "结构输出文件：弛豫后表面与吸附物构型" },
      { key: "OSZICAR", desc: "迭代收敛文件：能量收敛过程与步数" },
      { key: "CSV", desc: "反应路径数据文件：反应能、活化能与过渡态构型" }
    ],
    calcInputs: ["INCAR", "POSCAR", "POTCAR", "KPOINTS"],
    calcInputDesc: { INCAR: "计算控制参数（含真空层与收敛判据）", POSCAR: "表面-吸附物初始构型", POTCAR: "赝势文件", KPOINTS: "K 点采样设置" },
    calcCompliance: [
      { key: "functional", name: "交换关联泛函", rule: "PBE / RPBE 或 BEEF-vdW", bad: "检测到 LDA 泛函，与本库标准（PBE / RPBE）不一致", fix: "重新计算" },
      { key: "cutoff", name: "平面波截断能", rule: "≥ 400 eV", bad: "截断能为 350 eV，低于标准阈值 400 eV", fix: "重新计算" },
      { key: "kpoints", name: "K 点密度", rule: "≥ 12 Å⁻¹（表面模型）", bad: "K 点密度为 6 Å⁻¹，低于标准阈值 12 Å⁻¹", fix: "低精度入库" },
      { key: "force", name: "力收敛判据", rule: "≤ 0.02 eV/Å", bad: "力收敛判据为 0.05 eV/Å，低于精度要求", fix: "低精度入库" },
      { key: "vacuum", name: "真空层厚度", rule: "≥ 12 Å", bad: "真空层厚度为 8 Å，低于表面模型标准 12 Å", fix: "重新计算" }
    ],
    mediaExt: "cif",
    payloadTitle: "表面结构 / 吸附数据 / 反应路径数据",
    payload: {
      表面结构: { 催化体系: "Cu(211)-CO2RR", 表面晶面: "Cu(211) 台阶面", 掺杂原子: "—（纯 Cu）", 超胞: "3×2（4 层）", 真空层: "14.2 Å", 固定层数: "底部 2 层固定" },
      吸附数据: { 吸附分子: "CO2", 吸附构型: "C 端向下（η²-C,O）", 吸附位置: "台阶位点（Step-bridge）", 分子吸附能量: "-0.86 eV", "Cu-C 键长": "2.04 Å" },
      反应路径: { 反应初始构型: "*CO2", 反应产物: "*COOH", 产物吸附构型: "COOH 单齿吸附", 过渡态构型: "C-O 键伸长至 1.32 Å", 反应能: "-0.42 eV", 活化能: "0.78 eV" }
    },
    payloadJson: '{&nbsp;&quot;system&quot;:&nbsp;&quot;Cu(211)-CO2RR&quot;,<br>'
      + '&nbsp;&nbsp;<span class="k">&quot;surface&quot;</span>:&nbsp;{&nbsp;<span class="k">&quot;facet&quot;</span>:&nbsp;<span class="s">&quot;Cu(211)&quot;</span>,&nbsp;<span class="k">&quot;dopant&quot;</span>:&nbsp;<span class="s">&quot;none&quot;</span>,&nbsp;<span class="k">&quot;vacuum&quot;</span>:&nbsp;<span class="n">14.2</span>&nbsp;},<br>'
      + '&nbsp;&nbsp;<span class="k">&quot;adsorption&quot;</span>:&nbsp;{&nbsp;<span class="k">&quot;molecule&quot;</span>:&nbsp;<span class="s">&quot;CO2&quot;</span>,&nbsp;<span class="k">&quot;site&quot;</span>:&nbsp;<span class="s">&quot;step-bridge&quot;</span>,&nbsp;<span class="k">&quot;e_ads&quot;</span>:&nbsp;<span class="n">-0.86</span>&nbsp;},<br>'
      + '&nbsp;&nbsp;<span class="k">&quot;pathway&quot;</span>:&nbsp;{&nbsp;<span class="k">&quot;reactant&quot;</span>:&nbsp;<span class="s">&quot;*CO2&quot;</span>,&nbsp;<span class="k">&quot;product&quot;</span>:&nbsp;<span class="s">&quot;*COOH&quot;</span>,&nbsp;<span class="k">&quot;dE&quot;</span>:&nbsp;<span class="n">-0.42</span>,&nbsp;<span class="k">&quot;ea&quot;</span>:&nbsp;<span class="n">0.78</span>&nbsp;}<br>}',
    entryMethodRows: [
      ["Catalysis-Hub / OC20 等公开库", "定制插件批量导入", "文件头含 “Catalysis-Hub” / “OC20” 标识", "采集参数配置"],
      ["文献催化性能专题库", "定制插件批量导入", "专题库文件头校验", "采集范围核对"],
      ["VASP 表面自主计算数据", "自动化流程录入", "包含 INCAR+POSCAR+POTCAR+KPOINTS", "参数合规性复核"],
      ["特殊数据（电化学测试产物分布）", "手动输入", "无法自动识别", "全文录入"],
      ["用户上传数据", "手动输入 + 自动校验", "文件格式识别", "质量审核"]
    ],
    entrySources: [
      { key: "cathub", name: "Catalysis-Hub 等公开库", rec: "定制插件批量导入", rule: '文件头含 "Catalysis-Hub" 标识', point: "采集参数配置", plugin: "CatalysisHubPlugin" },
      { key: "oc20", name: "OC20 催化表面数据集", rec: "定制插件批量导入", rule: '文件头含 "OC20" 标识', point: "采集参数配置", plugin: "OC20Plugin" },
      { key: "vasp", name: "VASP 表面自主计算数据", rec: "自动化流程录入", rule: "包含 INCAR+POSCAR+POTCAR+KPOINTS", point: "参数合规性复核", plugin: "VASPAutoFlow" },
      { key: "literature", name: "特殊数据（产物分布）", rec: "手动输入", rule: "无法自动识别", point: "全文录入", plugin: "-" },
      { key: "user", name: "用户上传数据", rec: "手动输入 + 自动校验", rule: "文件格式识别", point: "质量审核", plugin: "AutoValidator" }
    ],
    dataTypeCodes: { "催化表面分子吸附数据": "ADS", "催化表面反应路径数据": "PTH" },
    entryManualFields: [
      { key: "formula", label: "催化体系标识", req: true, ph: "如 Cu(211)-CO2RR", rule: "text" },
      { key: "facet", label: "催化表面晶面", req: true, type: "select", opts: ["Cu(100)", "Cu(110)", "Cu(111)", "Cu(210)", "Cu(211)", "Cu(411)"], rule: "text" },
      { key: "dataType", label: "数据类型", req: true, type: "select", opts: ["催化表面分子吸附数据", "催化表面反应路径数据"], rule: "text" },
      { key: "dopant", label: "掺杂原子参数", req: false, ph: "如 Ag / 单原子 Pt", rule: "text" },
      { key: "adsorbate", label: "吸附分子种类", req: true, type: "select", opts: ["CO2", "CO", "H", "OH", "OCHO", "COOH", "CH4"], rule: "text" },
      { key: "site", label: "分子吸附位置", req: false, ph: "如 Step-bridge / Hollow", rule: "text" },
      { key: "adsorptionEnergy", label: "分子吸附能量", req: true, unit: "eV", ph: "如 -0.86", rule: "num", msg: "请输入数值型吸附能" },
      { key: "reactionEnergy", label: "反应能", req: false, unit: "eV", rule: "num", msg: "请输入数值型反应能" },
      { key: "activationEnergy", label: "活化能", req: false, unit: "eV", rule: "pos", msg: "活化能必须为正数" },
      { key: "coordination", label: "活性位点配位数", req: false, rule: "pos", msg: "配位数必须为正数" }
    ],
    entryCalcParams: [
      { key: "software", label: "计算软件", type: "select", opts: ["VASP", "Quantum ESPRESSO", "CP2K", "GPAW"], std: "—", neutral: true },
      { key: "functional", label: "交换关联泛函", type: "select", opts: ["PBE", "RPBE", "BEEF-vdW", "LDA"], std: "PBE / RPBE 或 BEEF-vdW", bad: ["LDA"], msg: "检测到 LDA 泛函，与本库标准（PBE / RPBE）不一致" },
      { key: "cutoff", label: "平面波截断能", unit: "eV", std: "≥ 400 eV", min: 400, msg: "截断能低于标准阈值 400 eV" },
      { key: "kpoints", label: "K 点密度", unit: "Å⁻¹", std: "≥ 12 Å⁻¹", min: 12, msg: "K 点密度低于标准阈值 12 Å⁻¹" },
      { key: "force", label: "力收敛判据", unit: "eV/Å", std: "≤ 0.02 eV/Å", max: 0.02, msg: "力收敛判据低于精度要求 0.02 eV/Å" },
      { key: "vacuum", label: "真空层厚度", unit: "Å", std: "≥ 12 Å", min: 12, msg: "真空层低于表面模型标准 12 Å" }
    ],
    entryManualSteps: [
      { who: "数据录入员", act: "选择“新增材料”", sys: "显示催化材料标准录入表单（基于 1.2 节字段定义）", check: "—", out: "空白录入界面" },
      { who: "数据录入员", act: "填写必填字段（体系标识、表面晶面、吸附分子、吸附能等）", sys: "实时校验：必填完整性、数值范围", check: "必填项完整性、值域合法性", out: "已填数据" },
      { who: "数据录入员", act: "上传结构文件（CIF / POSCAR）", sys: "解析结构文件，自动填充表面晶面与吸附构型", check: "文件格式合规性", out: "自动填充的字段" },
      { who: "数据录入员", act: "填写计算参数（软件、泛函、截断能、真空层等）", sys: "与标准阈值（1.4 节）对比", check: "参数合规性", out: "计算参数记录" },
      { who: "系统", act: "—", sys: "生成唯一标识：CA-数据类型-序号", check: "数据库查询最大序号 +1", out: "材料唯一标识" },
      { who: "数据录入员", act: "提交数据", sys: "进入审核队列", check: "触发第 2.2.4 节审核流程", out: "提交状态" }
    ],
    entryBatchSteps: [
      { who: "数据录入员", act: "选择批量导入入口", sys: "显示数据源类型选择界面", check: "选择正确的数据源类型", out: "数据源配置" },
      { who: "数据录入员", act: "上传数据包（ZIP）或配置 API", sys: "解压 / 解析数据包，列出文件清单", check: "文件完整性检查", out: "文件清单" },
      { who: "系统", act: "—", sys: "调用对应解析插件（Catalysis-Hub / OC20 / VASP）", check: "按数据源类型匹配解析器", out: "解析后的结构化数据" },
      { who: "系统", act: "—", sys: "按录入规范表（1.2 节）自动映射字段", check: "字段名匹配、类型转换", out: "字段映射结果" },
      { who: "系统", act: "—", sys: "执行自动审核（交叉对比 + 可重复性 + 格式统一）", check: "第 2.2.3 节审核规则", out: "审核状态" },
      { who: "数据录入员", act: "查看并确认批处理结果", sys: "显示成功 / 失败条数及明细", check: "失败条目需人工处理", out: "入库确认" }
    ],
    entryRules: [
      ["催化体系标识", "必填，建议“表面-反应”形式", "“请填写催化体系标识”"],
      ["分子吸附能量", "数值型（稳定吸附通常为负值）", "“请输入数值型吸附能”"],
      ["活化能", "> 0", "“活化能必须为正数”"],
      ["活性位点配位数", "> 0", "“配位数必须为正数”"],
      ["表面晶面 / 吸附分子", "从标准字典中选择", "“请选择标准字典中的取值”"]
    ],
    manualDefaults: {
      form: { dataType: "催化表面分子吸附数据", facet: "Cu(211)", adsorbate: "CO2" },
      calc: { software: "VASP", functional: "PBE", cutoff: "450", kpoints: "14", force: "0.02", vacuum: "14" }
    },
    demoFile: "Cu211_CO2.cif",
    demoParse: { formula: "Cu(211)-CO2RR", facet: "Cu(211)", dopant: "—（纯 Cu）", adsorbate: "CO2", site: "Step-bridge", adsorptionEnergy: "-0.86", reactionEnergy: "-0.42", activationEnergy: "0.78", coordination: "7" },
    procFlow: [
      { n: "数据策划", d: "明确应用需求，如“CO2 还原催化剂筛选”" },
      { n: "基础数据筛选", d: "按“Cu 基表面 + 有吸附能 / 活化能数据”筛选" },
      { n: "标准化预处理", d: "格式统一、误差修正、完整性整理" },
      { n: "加工模型构建", d: "构建吸附能 / 活性预测模型" },
      { n: "数据产品生产", d: "如“Cu 基 CO2RR 催化剂数据集”" },
      { n: "质量评价", d: "数据准确性校验" }
    ],
    procStepTitles: ["数据策划", "基础数据筛选", "标准化预处理", "加工模型构建", "数据产品生产", "质量评价"],
    procS1: { head: ["活动", "操作人", "输入", "输出", "内容"], rows: [["需求分析", "数据加工工程师", "用户需求 / 项目要求", "数据产品规格文档", "明确应用需求（如 CO2 还原催化剂筛选）、输出格式与精度要求"]] },
    procS2: { head: ["活动", "操作人", "系统行为", "筛选条件", "输出"], rows: [
      ["数据筛选", "数据加工工程师", "执行 SQL 查询 + 质量过滤", "质量等级 = A 级 或 B 级", "筛选后的数据集合"],
      ["数据筛选", "数据加工工程师", "按表面晶面分组", "Cu 基表面且含吸附能 / 活化能数据", "分组清单"]
    ] },
    procS3: { head: ["子步骤", "操作人", "系统行为", "处理规则", "输出"], rows: [
      ["格式统一", "系统", "自动执行格式转换脚本", "POSCAR / CIF → 标准结构；反应路径 → CSV", "标准格式文件"],
      ["单位统一", "系统", "自动执行单位换算", "非标准单位 → 标准单位（第 1.4 节单位表）", "带标准单位的数据"],
      ["缺失值", "系统", "标记缺失字段", "缺失率 ≤ 5% 时标注 “N/A”；> 5% 退回", "缺失值报告"],
      ["异常值检测", "系统", "执行异常检测算法", "超出 3σ 范围或物理不合理（如活化能为负）", "异常值清单"],
      ["异常值修正", "数据加工工程师", "人工复核异常值", "确认修正值或标注保留", "修正记录"]
    ] },
    procS4: { head: ["数据类型", "加工模型 / 算法", "输入", "处理逻辑", "输出"], rows: [
      ["吸附数据", "吸附能预测模型", "表面特征与已知吸附能样本", "基于元素与配位特征回归预测吸附能", "预测的吸附能"],
      ["反应路径数据", "反应路径校验模型", "初态 / 过渡态 / 末态构型与能量", "校验过渡态唯一虚频与能垒连续性", "校验后的反应路径"],
      ["结构数据", "表面结构验证模型", "CIF / POSCAR 文件", "校验真空层、固定层与吸附高度合理性", "验证后的结构文件"]
    ] },
    procS5: { head: ["数据产品类型", "加工操作", "输出格式", "输出用途"], rows: [
      ["AI 训练数据集", "数据清洗 + 特征工程 + 格式转换", "CSV / JSON + 数据字典", "机器学习模型训练"],
      ["科研参考数据集", "数据整理 + 可视化渲染", "PDF 报告 + JSON", "科研人员查阅"],
      ["跨库融通数据集", "格式转换 + 元数据补全", "JSON（符合 OPTIMADE 格式）", "与主平台融通"]
    ] },
    procS6: { head: ["评价维度", "评价方法", "合格标准", "不合格处理"], rows: [
      ["数据来源质量", "检查来源可信度分级", "来源为 1 级或 2 级", "标记“来源待验证”"],
      ["加工模型质量", "验证模型输出与输入一致性", "吸附能预测偏差 < 0.1 eV", "调整模型参数"],
      ["数据产品质量", "抽样检测（AQL = 1%）", "缺陷率 < 1%", "返工处理"]
    ] },
    procVersion: { head: ["版本阶段", "版本号格式", "标记位置", "说明"], rows: [
      ["原始版", "V0.0", "元数据字段 “data_version”", "采集后的原始数据"],
      ["标准化版", "V1.0", "元数据字段 “data_version”", "完成标准化预处理"],
      ["产品版", "V2.0", "元数据字段 “data_version”", "完成数据产品生产"]
    ] },
    procModels: [
      { key: "stat", name: "吸附能预测模型", type: "吸附数据", input: "表面特征与已知吸附能样本", logic: "基于元素与配位特征回归预测吸附能", out: "预测的吸附能" },
      { key: "image", name: "反应路径校验模型", type: "反应路径数据", input: "初态 / 过渡态 / 末态构型与能量", logic: "校验过渡态唯一虚频与能垒连续性", out: "校验后的反应路径" },
      { key: "struct", name: "表面结构验证模型", type: "结构数据", input: "CIF / POSCAR 文件", logic: "校验真空层、固定层与吸附高度合理性", out: "验证后的结构文件" }
    ],
    procProducts: [
      { key: "ai", name: "AI 训练数据集", op: "数据清洗 + 特征工程 + 格式转换", format: "CSV / JSON + 数据字典", use: "机器学习模型训练" },
      { key: "sci", name: "科研参考数据集", op: "数据整理 + 可视化渲染", format: "PDF 报告 + JSON", use: "科研人员查阅" },
      { key: "cross", name: "跨库融通数据集", op: "格式转换 + 元数据补全", format: "JSON（符合 OPTIMADE 格式）", use: "与主平台融通" }
    ],
    procQuality: [
      { key: "source", dim: "数据来源质量", method: "检查来源可信度分级", std: "来源为 1 级或 2 级", fix: "标记“来源待验证”" },
      { key: "model", dim: "加工模型质量", method: "验证模型输出与输入一致性", std: "吸附能预测偏差 < 0.1 eV", fix: "调整模型参数" },
      { key: "product", dim: "数据产品质量", method: "抽样检测（AQL = 1%）", std: "缺陷率 < 1%", fix: "返工处理" }
    ],
    modelRows: {
      stat: [
        { item: "吸附能（Cu(211)-CO2）", input: "-0.82 / -0.86 / -0.91 eV", logic: "计算均值、标准差、置信区间", out: "-0.86 ± 0.05 eV（95% CI：-0.90 ~ -0.82）" },
        { item: "活化能（*CO2 → *COOH）", input: "0.74 / 0.78 / 0.81 eV", logic: "计算均值、标准差、置信区间", out: "0.78 ± 0.04 eV" }
      ],
      image: [
        { item: "反应路径图", input: "path_raw.png（能量轴不一致）", logic: "统一能量轴、分辨率、标注、格式", out: "path_std.png（1600×1200，统一标注）" },
        { item: "吸附构型图", input: "ads_raw.png（800×600）", logic: "统一视角、分辨率、标注、格式", out: "ads_std.png（1600×1200，统一标注）" }
      ],
      struct: [
        { item: "Cu(211) 表面", input: "Cu211.cif", logic: "校验真空层、固定层与吸附高度合理性", out: "Cu211_verified.cif（真空层 14.2 Å，合理）" },
        { item: "Cu(111) 表面", input: "Cu111.cif", logic: "校验真空层、固定层与吸附高度合理性", out: "Cu111_verified.cif（真空层 14.0 Å，合理）" }
      ]
    },
    outliers: [
      { key: "o1", name: "Cu(211) · 吸附能", value: "-4.62 eV", sigma: "5.4σ", fixed: "", keep: false },
      { key: "o2", name: "Cu(111) · 活化能", value: "-0.35 eV", sigma: "3.7σ", fixed: "", keep: false }
    ],
    procNamePh: "如：Cu 基 CO2RR 催化剂数据集加工",
    listCols: [{ key: "facet", label: "表面晶面" }, { key: "adsorbate", label: "吸附分子" }, { key: "adsorptionEnergy", label: "吸附能", unit: " eV" }],
    metric: { key: "adsorptionEnergy", label: "吸附能", unit: " eV" },
    batchSamples: [
      { formula: "Cu(211)-CO2RR", dataType: "催化表面分子吸附数据", facet: "Cu(211)", adsorbate: "CO2", adsorptionEnergy: "-0.86", quality: "高精度" },
      { formula: "Cu(111)-CORR", dataType: "催化表面反应路径数据", facet: "Cu(111)", adsorbate: "CO", adsorptionEnergy: "-1.12", quality: "高精度" },
      { formula: "Ag-Cu(211)-CO2RR", dataType: "催化表面分子吸附数据", facet: "Cu(211)", adsorbate: "COOH", adsorptionEnergy: "-1.04", quality: "低精度" },
      { formula: "Pt1-Cu(111)-HER", dataType: "催化表面反应路径数据", facet: "Cu(111)", adsorbate: "H", adsorptionEnergy: "-0.42", quality: "高精度" }
    ],
    tasks: [
      { id: "CA-CL-2026-0922-001", name: "Cu(211) 表面 CO2 还原吸附能数据采集", method: "open", desc: "从 Catalysis-Hub 开放数据集采集 Cu 基表面吸附构型与吸附能数据", status: "已完成", createdAt: "2026-09-22 10:24", source: "Catalysis-Hub（催化反应数据库）", version: "2026.05", rawFiles: "JSON / CIF", security: "第1级" },
      { id: "CA-CL-2026-0923-002", name: "单原子催化剂（Cu-Ag）活性数据采集", method: "buy", desc: "从文献催化性能专题库导入掺杂原子参数与活性位点表征数据", status: "已完成", createdAt: "2026-09-23 09:12", source: "文献催化性能专题库", version: "2026.06", rawFiles: "CSV / CIF", security: "第1级" },
      { id: "CA-CL-2026-0923-003", name: "Cu(111) 表面 *COOH 反应路径计算", method: "calc", desc: "基于 VASP 计算输出文件提取过渡态构型、反应能与活化能", status: "待确认", createdAt: "2026-09-23 16:48", source: "本地计算输出（OUTCAR / CONTCAR）", version: "V0.0", rawFiles: "JSON", security: "第2级" }
    ],
    datasets: [
      { key: "element", title: "催化材料元素特征数据集", format: "CSV / JSON", volume: 520, fields: ["周期数和族数", "元素电荷", "相对原子质量", "原子半径", "价电子数", "d/p轨道电子数", "第一电离能", "电子亲和势", "电负性", "d带中心"], desc: "收录催化材料相关元素的周期数和族数、元素电荷、相对原子质量、原子半径、价电子数、轨道电子数、第一电离能、电子亲和势、电负性和 d 带中心。" },
      { key: "structure", title: "催化材料结构特征数据集", format: "PNG / CIF / DAE", volume: 600, fields: ["形貌结构图", "点群和空间群", "活性位点配位数", "对称性函数"], desc: "收录形貌结构图、点群和空间群、活性位点配位数、对称性函数及其他结构特征描述符。" },
      { key: "single-atom", title: "单原子催化剂数据集", format: "POSCAR / CSV", volume: 14000, fields: ["41种掺杂元素", "5种铜表面", "6种中间产物", "吸附能"], desc: "以铜单质为基底、41 种元素掺杂，覆盖 Cu(100)/(110)/(111)/(210)/(411) 五种表面共 75 种吸附结构，提供 CO2 还原 6 种中间产物吸附能数据约 1.4 万条。" },
      { key: "alloy", title: "二元合金数据集", format: "POSCAR / CSV", volume: 15000, fields: ["127种二元合金", "5种铜表面", "6种中间产物", "吸附构型"], desc: "基于 Materials Project 筛选的 127 种铜基二元合金材料，覆盖 5 种铜表面与 6 种中间产物的吸附构型和吸附能数据。" },
      { key: "grain-boundary", title: "晶界数据集", format: "POSCAR / CSV", volume: 4800, fields: ["5种晶界结构", "41种元素", "4种位点", "中间产物吸附"], desc: "收录铜中 5 种典型晶界结构，41 种元素置于晶界 4 个不同位点，针对 6 种中间产物共 4,800 条催化材料数据。" },
      { key: "system", title: "体系特征数据集", format: "CSV / DAT / JSON", volume: 6000, fields: ["费米面位置", "掺杂形成能", "体系磁矩", "反应路径", "催化性能"], desc: "收录费米面位置、掺杂形成能（晶界能）、体系磁矩等体系特征，以及催化反应路径、催化产物与催化性能数据。" }
    ]
  };

  /* ---------------------------------------------------------- 配置切换 */
  /* 所有材料相关常量都是模块级 var，切换页面时整体重挂即可，
     这样下面的两千多行界面逻辑完全不用关心当前是哪种材料。 */
  /* 模块级初始值即二维材料的默认配置。切换材料前必须先还原这批默认值，
     否则「上一类材料覆盖过、而本类配置里没给」的字段会串味
     （典型：从催化页切回二维时 procS2~procS6 仍是催化的）。 */
  var RW_DEFAULTS = null;
  function snapshotDefaults() {
    RW_DEFAULTS = {
      methods: METHODS, openDbs: OPEN_DBS, buyDbs: BUY_DBS,
      calcOutputs: CALC_OUTPUTS, calcInputs: CALC_INPUTS,
      calcInputDesc: CALC_INPUT_DESC, calcCompliance: CALC_COMPLIANCE,
      entryMethodRows: ENTRY_METHOD_ROWS, entryBatchSteps: ENTRY_BATCH_STEPS,
      entryManualSteps: ENTRY_MANUAL_STEPS, entryRules: ENTRY_RULES,
      entrySources: ENTRY_SOURCES, dataTypeCodes: DATA_TYPE_CODES,
      entryManualFields: ENTRY_MANUAL_FIELDS, entryCalcParams: ENTRY_CALC_PARAMS,
      procFlow: PROC_FLOW, procStepTitles: PROC_STEP_TITLES,
      procS1: PROC_S1, procS2: PROC_S2, procS3: PROC_S3,
      procS4: PROC_S4, procS5: PROC_S5, procS6: PROC_S6,
      procVersion: PROC_VERSION, procModels: PROC_MODELS,
      procProducts: PROC_PRODUCTS, procQuality: PROC_QUALITY
    };
  }
  function restoreDefaults() {
    var d = RW_DEFAULTS;
    METHODS = d.methods; OPEN_DBS = d.openDbs; BUY_DBS = d.buyDbs;
    CALC_OUTPUTS = d.calcOutputs; CALC_INPUTS = d.calcInputs;
    CALC_INPUT_DESC = d.calcInputDesc; CALC_COMPLIANCE = d.calcCompliance;
    ENTRY_METHOD_ROWS = d.entryMethodRows; ENTRY_BATCH_STEPS = d.entryBatchSteps;
    ENTRY_MANUAL_STEPS = d.entryManualSteps; ENTRY_RULES = d.entryRules;
    ENTRY_SOURCES = d.entrySources; DATA_TYPE_CODES = d.dataTypeCodes;
    ENTRY_MANUAL_FIELDS = d.entryManualFields; ENTRY_CALC_PARAMS = d.entryCalcParams;
    PROC_FLOW = d.procFlow; PROC_STEP_TITLES = d.procStepTitles;
    PROC_S1 = d.procS1; PROC_S2 = d.procS2; PROC_S3 = d.procS3;
    PROC_S4 = d.procS4; PROC_S5 = d.procS5; PROC_S6 = d.procS6;
    PROC_VERSION = d.procVersion; PROC_MODELS = d.procModels;
    PROC_PRODUCTS = d.procProducts; PROC_QUALITY = d.procQuality;
  }

  function applyCfg(pid) {
    var k = keyOf(pid);
    if (!k) return false;
    var c = MAT[k];
    if (!c) return false;
    if (!RW_DEFAULTS) snapshotDefaults();
    restoreDefaults();
    CFG_KEY = k;
    PAGE_ID = pid;

    /* 对象 / 材料类型：配置里给了就用配置，没给就沿用 04.js 的全局数据 */
    if (c.objects) TWOD_TASK_RESOURCE_OBJECTS_OVERRIDE = c.objects; else TWOD_TASK_RESOURCE_OBJECTS_OVERRIDE = null;
    if (c.systems) TWOD_MATERIAL_TYPES_OVERRIDE = c.systems; else TWOD_MATERIAL_TYPES_OVERRIDE = null;

    if (c.methods) METHODS = c.methods;
    if (c.openDbs) OPEN_DBS = c.openDbs;
    if (c.buyDbs) BUY_DBS = c.buyDbs;
    if (c.calcOutputs) CALC_OUTPUTS = c.calcOutputs;
    if (c.calcInputs) CALC_INPUTS = c.calcInputs;
    if (c.calcInputDesc) CALC_INPUT_DESC = c.calcInputDesc;
    if (c.calcCompliance) CALC_COMPLIANCE = c.calcCompliance;
    if (c.entryMethodRows) ENTRY_METHOD_ROWS = c.entryMethodRows;
    if (c.entryBatchSteps) ENTRY_BATCH_STEPS = c.entryBatchSteps;
    if (c.entryManualSteps) ENTRY_MANUAL_STEPS = c.entryManualSteps;
    if (c.entryRules) ENTRY_RULES = c.entryRules;
    if (c.entrySources) ENTRY_SOURCES = c.entrySources;
    if (c.dataTypeCodes) DATA_TYPE_CODES = c.dataTypeCodes;
    if (c.entryManualFields) ENTRY_MANUAL_FIELDS = c.entryManualFields;
    if (c.entryCalcParams) ENTRY_CALC_PARAMS = c.entryCalcParams;
    if (c.procFlow) PROC_FLOW = c.procFlow;
    if (c.procStepTitles) PROC_STEP_TITLES = c.procStepTitles;
    if (c.procS1) PROC_S1 = c.procS1;
    if (c.procS2) PROC_S2 = c.procS2;
    if (c.procS3) PROC_S3 = c.procS3;
    if (c.procS4) PROC_S4 = c.procS4;
    if (c.procS5) PROC_S5 = c.procS5;
    if (c.procS6) PROC_S6 = c.procS6;
    if (c.procVersion) PROC_VERSION = c.procVersion;
    if (c.procModels) PROC_MODELS = c.procModels;
    if (c.procProducts) PROC_PRODUCTS = c.procProducts;
    if (c.procQuality) PROC_QUALITY = c.procQuality;
    return true;
  }

  /* __rwMatCfgInjected end */

  function patchRender() {
    var base = window.renderLowdimIngestPage;
    if (typeof base !== "function") { setTimeout(patchRender, 80); return; }
    if (base.__rwPatched) return;
    var wrapped = function (pageId) {
      /* applyCfg 只认我们接管的五个 pageId，其余页面原样放行 */
      if (applyCfg(pageId)) { renderRwPage(true); return; }
      return base.apply(this, arguments);
    };
    wrapped.__rwPatched = true;
    window.renderLowdimIngestPage = wrapped;
    try { renderLowdimIngestPage = wrapped; } catch (e) { /* ignore */ }
  }

  /* 调试钩子：验证脚本用它读取当前材料配置与字段定义（不影响页面行为） */
  try {
    window.__rwDbg = {
      cfg: function () { return C(); },
      curKey: function () { return CFG_KEY; },
      curPage: function () { return PAGE_ID; },
      fields: function () { return ENTRY_MANUAL_FIELDS; },
      calcParams: function () { return ENTRY_CALC_PARAMS; },
      keyOf: keyOf
    };
  } catch (e) { /* ignore */ }

  /* ------------------------------------------------------------ 启动 */
  function boot() {
    ensureStyle();
    bindEvents();
    patchRender();
    var go = function () {
      Object.keys(PAGE_KEYS).forEach(function (pid) {
        var hit = false;
        try {
          if (typeof state !== "undefined" && state.page === pid) hit = true;
        } catch (e) { /* ignore */ }
        var el = document.getElementById("page-" + pid);
        if (!hit && el && el.classList.contains("active")) hit = true;
        if (hit) { applyCfg(pid); renderRwPage(true); }
      });
    };
    go();
    [50, 160, 420, 900, 1500].forEach(function (d) { setTimeout(go, d); });
  }

  boot();
})();
