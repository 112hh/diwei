# -*- coding: utf-8 -*-
"""列出 CSSOM 中所有命中 is-sample 的规则，并打印单元格背景的实际来源"""
import json, time
from test_db2 import boot, CDP

P = "#page-lowdim-database-twod"

JS = """
(function(){
  var P = %s;
  var rules = [];
  for (var i = 0; i < document.styleSheets.length; i++) {
    var sh = document.styleSheets[i];
    var list;
    try { list = sh.cssRules; } catch (e) { continue; }
    for (var j = 0; j < list.length; j++) {
      var r = list[j];
      if (r.selectorText && r.selectorText.indexOf('is-sample') >= 0) {
        rules.push({ sheet: (sh.href || 'inline').split('/').pop(), sel: r.selectorText, css: r.style.cssText.slice(0,160) });
      }
    }
  }
  var tb = document.querySelector(P + ' .t2d-table.is-sample');
  var info = null;
  if (tb) {
    var trs = tb.querySelectorAll('tbody tr');
    info = {
      rows: trs.length,
      rowBg: Array.prototype.map.call(trs, function(tr){ return getComputedStyle(tr).backgroundColor; }),
      td1Bg: Array.prototype.map.call(trs[0].children, function(td){ return getComputedStyle(td).backgroundColor; }).slice(0,3),
      td2Bg: Array.prototype.map.call(trs[1].children, function(td){ return getComputedStyle(td).backgroundColor; }).slice(0,3)
    };
  }
  return { rules: rules, info: info };
})()
""" % json.dumps(P)


def main():
    proc, url = boot()
    try:
        cdp = CDP(url)
        cdp.send("Runtime.enable")
        time.sleep(2.0)
        cdp.eval("(function(){var b=document.querySelector('[data-t2d-node=\"ds:structure\"]'); b&&b.click();})()")
        time.sleep(0.4)
        cdp.eval("(function(){var t=document.querySelectorAll('%s .t2d-tab')[1]; t&&t.click();})()" % P)
        time.sleep(0.5)
        print(json.dumps(cdp.eval(JS), ensure_ascii=False, indent=1))
    finally:
        try:
            proc.terminate()
        except Exception:
            pass


if __name__ == "__main__":
    main()
