/* ============================================================================
   低维材料主题库 · 五个材料数据库页面 —— 页面整体重写（20260923）
   本文件由 _tools/build2.py 自动生成，请勿手工编辑；
   请修改 _tools/head.js / _tools/db2_data.js / _tools/dbx_data.js / _tools/db2_page.js
   后重新构建。

   作用范围：五个数据库页面共用同一套实现（左侧元数据目录 + 右侧页签区）
     #page-lowdim-database-twod         二维材料数据库
     #page-lowdim-database-opto         有机光电材料数据库
     #page-lowdim-database-electrolyte  电解质材料数据库
     #page-lowdim-database-mlff         机器学习力场数据库
     #page-lowdim-database-catalyst     催化材料数据库
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- 0. 页面级样式覆盖（清除 app.css 对 .page 的卡片化装饰） ---------- */
  var DB_PAGE_IDS = [
    "lowdim-database-twod",
    "lowdim-database-opto",
    "lowdim-database-electrolyte",
    "lowdim-database-mlff",
    "lowdim-database-catalyst"
  ];
  var GLOBAL_STYLE_ID = "lowdim-db-page-override-20260923";
  if (!document.getElementById(GLOBAL_STYLE_ID)) {
    var gstyle = document.createElement("style");
    gstyle.id = GLOBAL_STYLE_ID;
    var rules = [];
    DB_PAGE_IDS.forEach(function (id) {
      rules.push("#page-" + id + " { display:none; background:transparent !important; border:0 !important; border-radius:0 !important; box-shadow:none !important; padding:0 !important; min-width:0 !important; }");
      rules.push("#page-" + id + ".active { display:block !important; }");
      rules.push(".main:has(#page-" + id + ".active), .main-shell:has(#page-" + id + ".active) { padding:0 !important; margin:0 !important; border:0 !important; border-radius:0 !important; box-shadow:none !important; background:transparent !important; }");
    });
    gstyle.textContent = rules.join(String.fromCharCode(10));
    document.head.appendChild(gstyle);
  }
