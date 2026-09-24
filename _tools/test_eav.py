# -*- coding: utf-8 -*-
"""校验七个性质数据集已统一为 EAV 结构：字段清单一致 + 示例数据对齐"""
import json, time
from test_db2 import boot, CDP

P = "#page-lowdim-database-twod"
KEYS = ["structure", "electronic", "electrical", "magnetic", "thermal", "mechanical", "optical", "defect"]
LABELS = {
    "structure": "结构特征数据集", "electronic": "电子结构数据集", "electrical": "电学性质数据集",
    "magnetic": "磁学性质数据集", "thermal": "热学性质数据集", "mechanical": "力学性质数据集",
    "optical": "光学性质数据集", "defect": "缺陷性质数据集"
}

JS_FIELDS = """
(function(){
  var P = %s;
  var tb = document.querySelector(P + ' .t2d-table');
  if (!tb) return 'NO_TABLE';
  return {
    headers: Array.prototype.map.call(tb.querySelectorAll('thead th'),
      function(n){ return n.textContent.replace(/\\s+/g,' ').trim(); }),
    rows: Array.prototype.map.call(tb.querySelectorAll('tbody tr'), function(tr){
      return Array.prototype.map.call(tr.children, function(td){
        return td.textContent.replace(/\\s+/g,' ').trim(); }).slice(0,6);
    }),
    tip: (function(){ var t = document.querySelector(P + ' .t2d-page-tip');
      return t ? t.textContent.replace(/\\s+/g,' ').trim() : null; })()
  };
})()
""" % json.dumps(P)

JS_SAMPLE = """
(function(){
  var P = %s;
  var tb = document.querySelector(P + ' .t2d-table.is-sample');
  if (!tb) return 'NO_SAMPLE';
  return {
    sample: true,
    headers: Array.prototype.map.call(tb.querySelectorAll('thead th'),
      function(n){ return n.textContent.replace(/\\s+/g,' ').trim(); }),
    firstRow: (function(){ var tr = tb.querySelector('tbody tr');
      if(!tr) return null;
      return Array.prototype.map.call(tr.children, function(td){
        return td.textContent.replace(/\\s+/g,' ').trim(); }); })(),
    rows: tb.querySelectorAll('tbody tr').length
  };
})()
""" % json.dumps(P)


def goto(cdp, key):
    cdp.eval("(function(){var b=document.querySelector('[data-t2d-node=\"ds:%s\"]'); b&&b.click();})()" % key)
    time.sleep(0.35)


def tab(cdp, i):
    cdp.eval("(function(){var t=document.querySelectorAll('%s .t2d-tab')[%d]; t&&t.click();})()" % (P, i))
    time.sleep(0.4)


def main():
    proc, url = boot()
    try:
        cdp = CDP(url)
        cdp.send("Runtime.enable")
        time.sleep(2.0)

        print("=== 各数据集「字段信息」表头与首行 ===")
        sig = {}
        for k in KEYS:
            goto(cdp, k)
            r = cdp.eval(JS_FIELDS)
            sig[k] = json.dumps(r.get("headers"), ensure_ascii=False)
            print("\n--- %s（%s）%s ---" % (LABELS[k], k, r.get("tip")))
            print("  表头:", json.dumps(r.get("headers"), ensure_ascii=False))
            print("  行数:", len(r.get("rows") or []))
            for row in (r.get("rows") or [])[:3]:
                print("   ", " | ".join(row))

        print("\n=== 七个性质数据集字段清单是否完全一致 ===")
        prop = [sig[k] for k in KEYS if k not in ("structure", "defect")]
        print("  properties 全部相同:", len(set(prop)) == 1)
        for k in KEYS:
            if k not in ("structure", "defect"):
                print("   %-11s %s" % (k, "一致" if sig[k] == prop[0] else "不一致"))

        print("\n=== 各数据集「示例数据」表头与首行 ===")
        for k in KEYS:
            goto(cdp, k)
            r = cdp.eval(JS_FIELDS)
            print("\n--- %s（%s）%s ---" % (LABELS[k], k, r.get("tip")))
            print("  表头:", json.dumps(r.get("headers"), ensure_ascii=False))
            print("  行数:", len(r.get("rows") or []))
            for row in (r.get("rows") or [])[:3]:
                print("   ", " | ".join(row))

        print("\n=== 示例数据首行 ===")
        for k in KEYS:
            goto(cdp, k)
            tab(cdp, 1)
            r = cdp.eval(JS_SAMPLE)
            print("\n--- %s ---" % LABELS[k])
            if r == 'NO_SAMPLE':
                print("  NO_SAMPLE")
                continue
            print("  表头:", json.dumps(r.get("headers"), ensure_ascii=False))
            print("  行数:", r.get("rows"))
            print("  首行:", json.dumps(r.get("firstRow"), ensure_ascii=False))

        print("\nJS errors:", cdp.eval("window.__pageErrors||'none'"))
    finally:
        try:
            proc.terminate()
        except Exception:
            pass


if __name__ == "__main__":
    main()
