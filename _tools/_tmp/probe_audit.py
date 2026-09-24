# -*- coding: utf-8 -*-
"""调试：有机光电页面提交录入后，审核推进为什么没走到「已入库」。"""
import sys, time, json
sys.path.insert(0, r'C:\Users\Windows\Desktop\diwei\_tools')
from cdp import Cdp

c = Cdp()
try:
    c.open("file:///C:/Users/Windows/Desktop/diwei/lowdim-ingest-opto.html")
    time.sleep(1.5)
    js = lambda e: c.evaluate("(function(){ try { return (%s); } catch(err){ return '__ERR__'+err.message; } })()" % e)
    js("window.prompt = function(){ return '1.68'; };")
    P = "#page-lowdim-ingest-opto"
    js("document.querySelector('%s .rw-tab[data-rw-tab=\"entry\"]').click()" % P)
    time.sleep(0.5)
    js("document.querySelector('%s [data-rw-act=\"entry-manual\"]').click()" % P)
    time.sleep(0.5)
    FILL = open(r'C:\Users\Windows\Desktop\diwei\_tools\_fill.js', encoding='utf-8').read()
    print("fill:", js(FILL))
    time.sleep(0.4)
    # 明确把数据类型设为「计算数据对象」
    js("(function(){var el=document.querySelector('#rwEntryMask [data-rw-ef=\"dataType\"]'); el.value='计算数据对象'; el.dispatchEvent(new Event('change',{bubbles:true}));})()")
    time.sleep(0.4)
    print("errors:", js("JSON.stringify(window.__rwDbg ? Object.keys((function(){return {};})()) : {})"))
    print("modal err text:", js("Array.from(document.querySelectorAll('#rwEntryMask .rw-field-tip.rw-error')).map(function(x){return x.textContent;}).join(' | ')"))
    js("document.querySelector('#rwEntryMask [data-rw-act=\"entry-submit\"]').click()")
    time.sleep(0.8)
    print("toast:", js("JSON.stringify((window.__rwToastLog||[]).slice(-4))"))
    print("row:", js("(document.querySelector('%s .rw-audit-table tbody tr')||{}).innerText" % P))
    print("status cell:", js("(document.querySelector('%s .rw-audit-table tbody tr')||{}).innerHTML" % P)[:400])
    print("audit-auto btn:", js("!!document.querySelector('[data-rw-act=\"audit-auto\"]')"))
    js("document.querySelector('[data-rw-act=\"audit-auto\"]').click()")
    time.sleep(0.5)
    print("toast after auto:", js("JSON.stringify((window.__rwToastLog||[]).slice(-2))"))
    print("row2:", js("(document.querySelector('%s .rw-audit-table tbody tr')||{}).innerText" % P))
    js("document.querySelector('[data-rw-act=\"audit-first-ok\"]') && document.querySelector('[data-rw-act=\"audit-first-ok\"]').click()")
    time.sleep(0.5)
    print("toast after first:", js("JSON.stringify((window.__rwToastLog||[]).slice(-2))"))
    js("document.querySelector('[data-rw-act=\"audit-final-ok\"]') && document.querySelector('[data-rw-act=\"audit-final-ok\"]').click()")
    time.sleep(0.5)
    print("toast after final:", js("JSON.stringify((window.__rwToastLog||[]).slice(-2))"))
    print("rows now:", js("document.querySelectorAll('%s .rw-audit-table tbody tr').length" % P))
    print("all rows:", js("Array.from(document.querySelectorAll('%s .rw-audit-table tbody tr')).map(function(r){return r.innerText.replace(/\\n/g,' / ');}).join(' ## ')" % P))
finally:
    c.close()
