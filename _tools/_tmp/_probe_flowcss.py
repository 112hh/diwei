# -*- coding: utf-8 -*-
"""量 .rw-flow-node 的样式到底有没有生效 + 注入的 style 表里还剩几条规则。"""
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cdp import Cdp

c = Cdp()
try:
    c.open("file:///C:/Users/Windows/Desktop/diwei/lowdim-ingest-catalyst.html")
    time.sleep(1.5)
    c.send("Emulation.setDeviceMetricsOverride", {"width": 1600, "height": 1000, "deviceScaleFactor": 1, "mobile": False})
    time.sleep(0.4)
    c.evaluate("document.querySelector('#page-lowdim-ingest-catalyst .rw-tab[data-rw-tab=\"process\"]').click()")
    time.sleep(0.5)

    print("computed .rw-flow-node :", c.evaluate(
        "JSON.stringify((function(){var n=document.querySelector('#page-lowdim-ingest-catalyst .rw-flow-node');"
        "var s=getComputedStyle(n); return {border:s.borderTopWidth, bg:s.backgroundColor, align:s.textAlign, display:s.display};})())"))
    print("computed .rw-flow      :", c.evaluate(
        "JSON.stringify((function(){var s=getComputedStyle(document.querySelector('#page-lowdim-ingest-catalyst .rw-flow'));"
        "return {display:s.display, dir:s.flexDirection};})())"))
    print("style#id                :", c.evaluate(
        "JSON.stringify(Array.from(document.querySelectorAll('style')).map(function(s){return {id:s.id, len:s.textContent.length, rules:(s.sheet?s.sheet.cssRules.length:-1)};}))"))
    print("rw stylesheet rules 数   :", c.evaluate(
        "(function(){var s=document.getElementById('rw-twod-rw-style')||document.querySelector('style[id^=\"rw-\"]');"
        "return s? s.sheet.cssRules.length : 'NO_SHEET';})()"))
    print("含 .rw-flow-node 的规则  :", c.evaluate(
        "(function(){var out=[];Array.from(document.styleSheets).forEach(function(s){try{Array.from(s.cssRules).forEach(function(r){"
        "if(r.cssText && r.cssText.indexOf('rw-flow-node')>=0) out.push(r.cssText.slice(0,80));});}catch(e){}}); return JSON.stringify(out);})()"))
    print("...最后 5 条规则          :", c.evaluate(
        "(function(){var s=document.getElementById('rw-twod-rw-style')||document.querySelector('style[id^=\"rw-\"]');"
        "if(!s) return 'NO_SHEET'; var rs=s.sheet.cssRules, out=[];"
        "for(var i=Math.max(0,rs.length-5);i<rs.length;i++) out.push(rs[i].cssText.slice(0,120)); return JSON.stringify(out);})()"))
finally:
    c.close()
