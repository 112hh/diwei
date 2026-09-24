# -*- coding: utf-8 -*-
"""整站入口 low-dim-materials.html 冒烟：加载无报错，并能导航到二维材料采集页。"""
import sys, time
sys.path.insert(0, r'C:\Users\Windows\Desktop\diwei\_tools')
from cdp import Cdp

URL = "file:///C:/Users/Windows/Desktop/diwei/low-dim-materials.html"

c = Cdp()
try:
    c.open(URL)
    time.sleep(2.0)
    print("errors:", c.evaluate("JSON.stringify((window.__cdpErrors||[]).slice(0,5))"))
    print("active:", c.evaluate("(document.querySelector('.page.active')||{}).id"))
    # 导航到二维材料数据采集加工处理
    print("navbtn found:", c.evaluate("!!document.querySelector('.sidebar .nav-btn[data-page=\"lowdim-ingest-twod\"]')"))
    # 说明：该整站入口的侧栏点击在新版里由 switchPage 驱动，脚本直接走路由函数验证
    c.evaluate("window.switchPage('lowdim-ingest-twod')")
    time.sleep(1.5)
    print("after nav active:", c.evaluate("(document.querySelector('.page.active')||{}).id"))
    print("page visible:", c.evaluate("(function(){var p=document.getElementById('page-lowdim-ingest-twod'); return p ? [p.classList.contains('active'), getComputedStyle(p).display] : null;})()"))
    print("tabs:", c.evaluate("JSON.stringify(Array.from(document.querySelectorAll('#page-lowdim-ingest-twod .rw-tab')).map(function(b){return b.textContent.replace(/[0-9]+$/,'').trim();}))"))
    print("rows:", c.evaluate("document.querySelectorAll('#page-lowdim-ingest-twod .rw-card table tbody tr').length"))
    print("errors2:", c.evaluate("JSON.stringify((window.__cdpErrors||[]).slice(0,5))"))
    # 切到录入 / 加工，确认可操作元素存在
    c.evaluate("document.querySelector('#page-lowdim-ingest-twod .rw-tab[data-rw-tab=\"entry\"]').click()")
    time.sleep(0.6)
    print("entry source rows:", c.evaluate("document.querySelectorAll('#page-lowdim-ingest-twod .rw-source-table tbody tr').length"))
    c.evaluate("document.querySelector('#page-lowdim-ingest-twod .rw-tab[data-rw-tab=\"process\"]').click()")
    time.sleep(0.6)
    print("proc flow nodes:", c.evaluate("document.querySelectorAll('#page-lowdim-ingest-twod .rw-flow-node').length"))
    print("errors3:", c.evaluate("JSON.stringify((window.__cdpErrors||[]).slice(0,5))"))
finally:
    c.close()
