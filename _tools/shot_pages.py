# -*- coding: utf-8 -*-
"""一次性打开页面，按顺序截图：数据集列表 / 数据库层 / 数据表层（带渲染校验）。"""
import sys, time, base64, os, json
sys.path.insert(0, r'C:\Users\Windows\Desktop\diwei\_tools')
from cdp import Cdp

URL = 'file:///C:/Users/Windows/Desktop/diwei/lowdim-database-twod.html'
OUT = r'C:\Users\Windows\WorkBuddy\2026-09-23-11-44-23\.workbuddy\tmp\shots'
os.makedirs(OUT, exist_ok=True)

LOGIN = "(function(){var b=document.querySelector('[data-standard-login-submit]');if(b)b.click();return 1;})()"
NAV = "(function(){var n=document.querySelector('.sidebar .nav-btn[data-page=\"lowdim-database-twod\"]');if(n)n.click();return 1;})()"
WAIT = "(function(){return new Promise(function(r){setTimeout(function(){r(1);},700);});})()"
CHECK = "(function(){var p=document.getElementById('page-lowdim-database-twod');var h=p&&p.querySelector('.twod-ds-head h2');return h?h.innerText:'(none)';})()"

def click(sel):
    return "(function(){var e=document.querySelector(%s);if(!e)return 'MISSING:'+%s;e.click();return 'ok';})()" % (json.dumps(sel), json.dumps(sel))

# 每个目标都从「数据集列表」出发：list -> (可选) db tab -> (可选) 某张表
steps = [
    ('after_list.png', []),
    ('after_db.png', [click('[data-twod-ds-viewtab="db"]')]),
    ('after_table_property.png', [click('[data-twod-ds-viewtab="db"]'), click('[data-twod-ds-table="ldm_material_2d_property"]')]),
    ('after_table_structure.png', [click('[data-twod-ds-viewtab="db"]'), click('[data-twod-ds-table="ldm_material_2d_structure"]')]),
]

c = Cdp()
try:
    c.open(URL)
    time.sleep(2.0)
    c.send('Emulation.setDeviceMetricsOverride', {'width': 1600, 'height': 1000, 'deviceScaleFactor': 1, 'mobile': False})
    c.evaluate(LOGIN)
    time.sleep(0.8)
    c.evaluate(NAV)
    c.evaluate(WAIT)
    for name, actions in steps:
        # 先回到列表起点
        c.evaluate(click('[data-twod-ds-viewtab="list"]'))
        c.evaluate(WAIT)
        for a in actions:
            r = c.evaluate(a)
            if r and r != 'ok':
                print('  !! ' + name + ' action -> ' + str(r))
            c.evaluate(WAIT)
        title = c.evaluate(CHECK)
        r = c.send('Page.captureScreenshot', {'format': 'png', 'captureBeyondViewport': True})
        data = base64.b64decode(r['result']['data'])
        p = os.path.join(OUT, name)
        open(p, 'wb').write(data)
        print('saved %-32s %7d bytes   h2=%s' % (name, len(data), title))
finally:
    c.close()
