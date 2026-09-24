# -*- coding: utf-8 -*-
"""实测示例数据表 / 分页条的计算样式"""
import json, time
from test_db2 import boot, CDP

P = "#page-lowdim-database-twod"

JS = """
(function(){
  var P = %s;
  var tb = document.querySelector(P + ' .t2d-table.is-sample');
  if (!tb) return 'NO_SAMPLE_TABLE';
  var g = function(el, p){ return getComputedStyle(el)[p]; };
  var th = tb.querySelector('thead th');
  var trs = tb.querySelectorAll('tbody tr');
  var act = document.querySelector(P + ' .t2d-page-num.is-active');
  return {
    tableCls: tb.className,
    thBg: g(th,'backgroundColor'), thColor: g(th,'color'), thAlign: g(th,'textAlign'),
    thPad: g(th,'padding'), thWeight: g(th,'fontWeight'), thBorder: g(th,'borderBottomColor'),
    row1Bg: g(trs[0],'backgroundColor'), row2Bg: g(trs[1],'backgroundColor'),
    tdPad: g(trs[0].children[1],'padding'), tdColor: g(trs[0].children[1],'color'),
    tdAlign: g(trs[0].children[1],'textAlign'),
    idxColor: g(trs[0].children[0],'color'), idxAlign: g(trs[0].children[0],'textAlign'),
    wrapOverflow: g(tb.parentNode,'overflowX'),
    pagerInCard: !!document.querySelector(P + ' .t2d-card .t2d-pager'),
    pagerBorder: g(document.querySelector(P + ' .t2d-pager'),'borderTopColor'),
    activeNumBg: act ? g(act,'backgroundColor') : null,
    activeNumColor: act ? g(act,'color') : null
  };
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
