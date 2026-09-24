# -*- coding: utf-8 -*-
import json, os, importlib.util, time
spec = importlib.util.spec_from_file_location("t", r"C:/Users/Windows/Desktop/diwei/_tools/test_db2.py")
t = importlib.util.module_from_spec(spec); spec.loader.exec_module(t)
proc, url = t.boot()
try:
    cdp = t.CDP(url); cdp.send("Runtime.enable"); time.sleep(2.0)
    cdp.eval("(function(){var b=document.querySelector('[data-t2d-node=\"ds:structure\"]'); b&&b.click();})()")
    time.sleep(0.6)
    print("=== 字段信息：首行各单元格颜色 ===")
    print(json.dumps(cdp.eval(
        "(function(){var tr=document.querySelector('#page-lowdim-database-twod .t2d-table tbody tr');"
        "return Array.prototype.map.call(tr.children,function(td){"
        "var el=td.querySelector('button')||td;"
        "var cs=getComputedStyle(el);"
        "return td.textContent.replace(/\\s+/g,' ').trim()+' → '+cs.color+' / weight '+cs.fontWeight;});})()"),
        ensure_ascii=False, indent=1))
    print("\n=== 库表清单：数据表名称链接颜色（应保持蓝色 #165DFF）===")
    cdp.eval("(function(){var b=document.querySelector('[data-t2d-toggle=\"db-root\"]'); b&&b.click();})()")
    time.sleep(0.4)
    cdp.eval("(function(){var x=document.querySelectorAll('#page-lowdim-database-twod .t2d-tab')[0]; x&&x.click();})()")
    time.sleep(0.4)
    print(json.dumps(cdp.eval(
        "(function(){var b=document.querySelector('#page-lowdim-database-twod .t2d-table tbody .t2d-link');"
        "return b? b.textContent.trim()+' → '+getComputedStyle(b).color : 'NONE';})()"), ensure_ascii=False))
    print("\nJS errors:", cdp.eval("window.__pageErrors||'none'"))
finally:
    try: proc.terminate()
    except Exception: pass
