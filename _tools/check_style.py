# -*- coding: utf-8 -*-
"""视觉一致性核验：关键元素的计算样式是否沿用系统蓝白体系，是否存在文字截断/溢出。"""
import sys, time, json
sys.path.insert(0, r'C:\Users\Windows\Desktop\diwei\_tools')
from cdp import Cdp

URL = 'file:///C:/Users/Windows/Desktop/diwei/lowdim-database-twod.html'
WAIT = "(function(){return new Promise(function(r){setTimeout(function(){r(1);},600);});})()"
LOGIN = "(function(){var b=document.querySelector('[data-standard-login-submit]');if(b)b.click();return 1;})()"
NAV = "(function(){var n=document.querySelector('.sidebar .nav-btn[data-page=\"lowdim-database-twod\"]');if(n)n.click();return 1;})()"

def click(sel):
    return "(function(){var e=document.querySelector(%s);if(e)e.click();return 1;})()" % json.dumps(sel)

CHECK = """
(function(){
  var p = document.getElementById('page-lowdim-database-twod');
  function g(el, props){ var cs = getComputedStyle(el); var o={}; props.forEach(function(k){o[k]=cs[k];}); return o; }
  var card = p.querySelector('.twod-ds-card');
  var table = p.querySelector('.twod-ds-table');
  var wrap = p.querySelector('.twod-ds-table-wrap');
  var h3 = card ? card.querySelector('h3') : null;
  var h2 = p.querySelector('.twod-ds-head h2');
  var tabA = p.querySelector('.twod-ds-tab.is-active');
  var kv = p.querySelector('.twod-ds-kv > div');
  // 其他四个子库页是否仍由主 JS 渲染（未受影响）
  var opto = document.getElementById('page-lowdim-database-opto');
  return JSON.stringify({
    page: {bg: getComputedStyle(p).backgroundColor, cls: p.className},
    card: card ? g(card, ['backgroundColor','borderColor','borderRadius','boxShadow']) : null,
    h2: h2 ? g(h2, ['color','fontSize','fontWeight']) : null,
    h3: h3 ? g(h3, ['color','fontSize','fontWeight']) : null,
    tabActive: tabA ? g(tabA, ['color','fontWeight','backgroundColor']) : null,
    tableHead: table ? g(table.querySelector('th'), ['backgroundColor','color','fontWeight']) : null,
    wrapOverflowX: wrap ? (wrap.scrollWidth - wrap.clientWidth) : -1,
    kvRow: kv ? g(kv, ['borderBottomColor']) : null,
    bodyOverflow: document.body.scrollWidth - document.documentElement.clientWidth,
    otherPageUntouched: opto ? (opto.innerHTML.length > 0 || opto.className) : null,
    hasPageClass: p.classList.contains('twod-ds-active')
  });
})()
"""

c = Cdp()
try:
    c.open(URL)
    time.sleep(2.0)
    c.send('Emulation.setDeviceMetricsOverride', {'width': 1600, 'height': 1000, 'deviceScaleFactor': 1, 'mobile': False})
    c.evaluate(LOGIN); time.sleep(0.8); c.evaluate(NAV); c.evaluate(WAIT)

    for name, act in [('列表视图', None), ('数据库层', click('[data-twod-ds-viewtab="db"]'))]:
        if act:
            c.evaluate(act); c.evaluate(WAIT)
        print('-- ' + name)
        print('  ' + str(c.evaluate(CHECK)))

    c.evaluate(click('[data-twod-ds-table="ldm_material_2d_property"]')); c.evaluate(WAIT)
    print('-- 数据表层（property）')
    print('  ' + str(c.evaluate(CHECK)))

    # 文本抽样：确认数据库层关键文案齐全
    c.evaluate(click('[data-twod-ds-backdb]')); c.evaluate(WAIT)
    txt = c.evaluate("(function(){var p=document.getElementById('page-lowdim-database-twod');return p.innerText.replace(/\\n+/g,' | ').slice(0,2600);})()")
    print('-- 数据库层正文抽样')
    print(txt)
finally:
    c.close()
