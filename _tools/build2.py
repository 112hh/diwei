# -*- coding: utf-8 -*-
"""构建 assets/js/99-layer.js：
   head.js（IIFE 开头 + 五个库页面级样式覆盖）
 + db2_data.js（二维材料库数据字典）
 + dbx_data.js（五库配置注册表，含另外四个库的库表 / 数据集 / 示例行）
 + db2_page.js（通用渲染与事件工厂）
"""
import io, os, sys

BASE = os.path.dirname(os.path.abspath(__file__))
DIWEI = os.path.dirname(BASE)
OUT = os.path.join(DIWEI, "assets", "js", "99-layer.js")
TARGET = os.path.join(DIWEI, "lowdim-database-twod.html")

HEAD = """/* ============================================================================
   二维材料数据库 —— 页面整体重写（20260923）
   本文件由 _tools/build2.py 自动生成，请勿手工编辑；
   请修改 _tools/head.js / _tools/db2_data.js / _tools/db2_page.js 后重新构建。

   作用范围：仅 #page-lowdim-database-twod（lowdim-database-twod.html 独立页面）
   左侧：元数据目录（二维材料数据库 + 八大数据集）
   右侧：库表清单 / 信息概览（库级） + 字段信息 / 示例数据 / 信息概览（数据集级）
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- 0. 页面级样式覆盖（清除 app.css 对 .page 的卡片化装饰） ---------- */
  var GLOBAL_STYLE_ID = "twod-db-page-override-20260923";
  if (!document.getElementById(GLOBAL_STYLE_ID)) {
    var gstyle = document.createElement("style");
    gstyle.id = GLOBAL_STYLE_ID;
    gstyle.textContent = [
      "#page-lowdim-database-twod { display:none; background:transparent !important; border:0 !important; border-radius:0 !important; box-shadow:none !important; }",
      "#page-lowdim-database-twod.active { display:block !important; }",
      "#page-lowdim-database-twod { padding:0 !important; min-width:0 !important; }",
      ".main:has(#page-lowdim-database-twod.active), .main-shell:has(#page-lowdim-database-twod.active) { padding:0 !important; margin:0 !important; border:0 !important; border-radius:0 !important; box-shadow:none !important; background:transparent !important; }"
    ].join("\\n");
    document.head.appendChild(gstyle);
  }

"""


def read(name):
    with io.open(os.path.join(BASE, name), "r", encoding="utf-8") as f:
        return f.read()


def main():
    head = read("head.js").rstrip() + "\n"
    body = "\n".join([read("db2_data.js"), read("dbx_data.js"), read("db2_page.js")])
    js = head + body
    if not js.rstrip().endswith("})();"):
        js = js.rstrip() + "\n})();\n"
    else:
        js = js.rstrip() + "\n"
    with io.open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write(js)
    print("written:", OUT, len(js), "chars")

    # 只保留 99-layer.js 一个脚本引用（去重）
    with io.open(TARGET, "r", encoding="utf-8") as f:
        html = f.read()
    refs = html.count('<script src="assets/js/99-layer.js"></script>')
    print("99-layer.js refs in html:", refs)


if __name__ == "__main__":
    main()
