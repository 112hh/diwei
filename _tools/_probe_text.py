# -*- coding: utf-8 -*-
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cdp import Cdp

c = Cdp()
try:
    c.send('Page.enable'); c.send('Runtime.enable')
    for name in ['lowdim-ingest-twod', 'lowdim-ingest-opto', 'lowdim-ingest-electrolyte', 'lowdim-ingest-mlff', 'lowdim-ingest-catalyst']:
        c.send('Page.navigate', {'url': 'file:///C:/Users/Windows/Desktop/diwei/%s.html' % name})
        time.sleep(5)
        q = '(function(){var el=document.getElementById("page-%s");var t=el?(el.innerText||"").slice(0,2500):"";return JSON.stringify({len:t.length,has_src:t.indexOf("source_id")>=0,has_sha:t.indexOf("SHA-256")>=0,has_select:t.indexOf("选中任务")>=0,has_spec:t.indexOf("规范说明")>=0,has_handoff_btn:t.indexOf("发起交接")>=0,has_apply:t.indexOf("提交权限申请")>=0,head:t.slice(0,160)});})()' % name
        print(name, json.loads(c.evaluate(q)))
        print('errors:', c.evaluate('JSON.stringify(window.__cdpErrors||[])'))
finally:
    c.close()
