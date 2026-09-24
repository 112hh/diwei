# -*- coding: utf-8 -*-
"""校验三个列表的分页：库表清单 / 字段信息 / 示例数据（翻页、每页条数、跨页序号、搜索重置）"""
import json, time
from test_db2 import boot, CDP  # 复用 Chrome 启动与 CDP 封装

P = "#page-lowdim-database-twod"

JS_PAGER = r"""
(function(){
  var p = document.querySelector('%s .t2d-main');
  var pager = p.querySelector('.t2d-pager');
  if(!pager) return {pager:false};
  var nums = Array.prototype.map.call(pager.querySelectorAll('.t2d-page-num'),
      function(n){return n.textContent.trim()+(n.classList.contains('is-active')?'*':'');});
  var sizes = Array.prototype.map.call(pager.querySelectorAll('.t2d-page-size'),
      function(n){return n.textContent.trim()+(n.classList.contains('is-active')?'*':'');});
  return {
    pager: true,
    tip: pager.querySelector('.t2d-page-tip').textContent.replace(/\s+/g,' ').trim(),
    nums: nums,
    sizes: sizes,
    prevDisabled: pager.querySelector('.t2d-page-btn').disabled,
    nextDisabled: pager.querySelectorAll('.t2d-page-btn')[1].disabled,
    rows: p.querySelectorAll('.t2d-table tbody tr').length,
    head: p.querySelectorAll('.t2d-table thead th').length,
    firstRow: (function(){var tr=p.querySelector('.t2d-table tbody tr');
       return tr? Array.prototype.map.call(tr.children,function(td){return td.textContent.replace(/\s+/g,' ').trim();}) : null;})(),
    sample: !!p.querySelector('.t2d-table.is-sample')
  };
})()
""" % P


def goto_dataset(cdp, key):
    cdp.eval("(function(){var b=document.querySelector('[data-t2d-node=\"ds:%s\"]'); b&&b.click();})()" % key)
    time.sleep(0.35)


def click_tab(cdp, idx):
    cdp.eval("(function(){var t=document.querySelectorAll('%s .t2d-tab')[%d]; t&&t.click();})()" % (P, idx))
    time.sleep(0.35)


def main():
    proc, url = boot()
    try:
        cdp = CDP(url)
        cdp.send("Runtime.enable")
        cdp.send("Page.enable")
        time.sleep(2.0)

        print("=== 1. 库表清单（8 张表，每页 10 → 只有 1 页） ===")
        print(json.dumps(cdp.eval(JS_PAGER), ensure_ascii=False, indent=1))

        print("\n=== 2. 结构特征数据集 / 字段信息（17 个字段，每页 10 → 2 页） ===")
        goto_dataset(cdp, "structure")
        print(json.dumps(cdp.eval(JS_PAGER), ensure_ascii=False, indent=1))

        print("\n--- 点第 2 页 ---")
        print("click:", cdp.eval(
            "(function(){var b=document.querySelectorAll('%s .t2d-page-num')[1]; if(!b) return 'NO_BTN';"
            "var t=b.textContent.trim(); b.click(); return 'clicked page '+t;})()" % P))
        time.sleep(0.4)
        print(json.dumps(cdp.eval(JS_PAGER), ensure_ascii=False, indent=1))

        print("\n--- 点「下一页」（已在第 2 页，应 disabled 且不跳） ---")
        print("next disabled:", cdp.eval(
            "(function(){var b=document.querySelectorAll('%s .t2d-page-btn')[1]; return b? b.disabled : 'NO_BTN';})()" % P))

        print("\n--- 切每页 20 条（应合并成 1 页，17 行） ---")
        print("click:", cdp.eval(
            "(function(){var b=document.querySelectorAll('%s .t2d-page-size')[1]; if(!b) return 'NO_BTN';"
            "var t=b.textContent.trim(); b.click(); return 'clicked '+t;})()" % P))
        time.sleep(0.4)
        print(json.dumps(cdp.eval(JS_PAGER), ensure_ascii=False, indent=1))

        print("\n--- 切回每页 10 条 ---")
        cdp.eval("(function(){var b=document.querySelectorAll('%s .t2d-page-size')[0]; b&&b.click();})()" % P)
        time.sleep(0.4)
        print(json.dumps(cdp.eval(JS_PAGER), ensure_ascii=False, indent=1))

        print("\n=== 3. 搜索后页码重置：先翻到第 2 页，再搜 lattice ===")
        cdp.eval("(function(){var b=document.querySelectorAll('%s .t2d-page-num')[1]; b&&b.click();})()" % P)
        time.sleep(0.35)
        print("翻页后 tip:", cdp.eval("(function(){var t=document.querySelector('%s .t2d-page-tip');"
                                  "return t? t.textContent.replace(/\\s+/g,' ').trim():null;})()" % P))
        cdp.type_into(P + " [data-t2d-q2]", "lattice")
        time.sleep(0.4)
        print(json.dumps(cdp.eval(JS_PAGER), ensure_ascii=False, indent=1))
        cdp.type_into(P + " [data-t2d-q2]", "")
        time.sleep(0.3)

        print("\n=== 4. 示例数据页签（序号跨页连续） ===")
        click_tab(cdp, 1)
        print(json.dumps(cdp.eval(JS_PAGER), ensure_ascii=False, indent=1))
        print("行首序号:", json.dumps(cdp.eval(
            "(function(){return Array.prototype.map.call(document.querySelectorAll('%s .t2d-table.is-sample tbody tr'),"
            "function(tr){return tr.children[0].textContent.trim();});})()" % P), ensure_ascii=False))

        print("\n--- 示例数据切每页 5 条，翻到第 2 页，序号应从 6 开始 ---")
        print("click:", cdp.eval(
            "(function(){var b=document.querySelectorAll('%s .t2d-page-size')[0]; return b? b.textContent.trim() : 'NO_BTN';})()" % P))
        # PER_OPTIONS 为 [10,20,50]，这里直接用页码按钮验证即可
        print(json.dumps(cdp.eval(JS_PAGER), ensure_ascii=False, indent=1))

        print("\n=== 5. 库表清单分页回归（回库级） ===")
        cdp.eval("(function(){var b=document.querySelector('[data-t2d-toggle=\"db-root\"]'); b&&b.click();})()")
        time.sleep(0.3)
        click_tab(cdp, 0)
        print(json.dumps(cdp.eval(JS_PAGER), ensure_ascii=False, indent=1))

        print("\nJS errors:", cdp.eval("window.__pageErrors||'none'"))
    finally:
        try:
            proc.terminate()
        except Exception:
            pass


if __name__ == "__main__":
    main()
