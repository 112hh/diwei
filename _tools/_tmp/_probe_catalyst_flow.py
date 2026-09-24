# -*- coding: utf-8 -*-
"""量一下催化页「加工流程总览」卡片的真实 DOM。"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cdp import Cdp

c = Cdp()
try:
    c.open("file:///C:/Users/Windows/Desktop/diwei/lowdim-ingest-catalyst.html")
    time.sleep(1.5)
    c.evaluate("document.querySelector('#page-lowdim-ingest-catalyst .rw-tab[data-rw-tab=\"process\"]').click()")
    time.sleep(0.6)
    html = c.evaluate("(function(){var cs=document.querySelectorAll('#page-lowdim-ingest-catalyst .rw-card');"
                      " for (var i=0;i<cs.length;i++){ if (cs[i].innerText.indexOf('加工流程总览')>=0) return cs[i].outerHTML; }"
                      " return '__NONE__'; })()")
    print(html[:4000])
    print("\n---- innerText ----")
    txt = c.evaluate("(function(){var cs=document.querySelectorAll('#page-lowdim-ingest-catalyst .rw-card');"
                     " for (var i=0;i<cs.length;i++){ if (cs[i].innerText.indexOf('加工流程总览')>=0) return cs[i].innerText; }"
                     " return '__NONE__'; })()")
    print(txt)
    print("\n---- flow nodes ----")
    print(c.evaluate("JSON.stringify(Array.from(document.querySelectorAll('#page-lowdim-ingest-catalyst .rw-flow-node')).map(function(n){return n.innerText;}))"))
    print("\n---- flow arrows ----")
    print(c.evaluate("JSON.stringify(Array.from(document.querySelectorAll('#page-lowdim-ingest-catalyst .rw-flow-arrow')).map(function(n){return n.innerText;}))"))
    print("\n---- flexdir ----")
    print(c.evaluate("getComputedStyle(document.querySelector('#page-lowdim-ingest-catalyst .rw-flow')).flexDirection"))
    print("width", c.evaluate("document.documentElement.clientWidth"))
finally:
    c.close()
