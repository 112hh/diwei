# -*- coding: utf-8 -*-
import sys, time, json
sys.path.insert(0, r'C:\Users\Windows\Desktop\diwei\_tools')
from cdp import Cdp

PAGES = [
    ('dashboard', '数据看板'), ('standard-twod', '低维材料标准体系'),
    ('lowdim-ingest-twod', '二维材料数据采集加工处理'), ('lowdim-ingest-opto', '有机光电材料数据采集加工处理'),
    ('lowdim-ingest-electrolyte', '电解质材料数据采集加工处理'), ('lowdim-ingest-mlff', '机器学习力场数据采集加工处理'),
    ('lowdim-ingest-catalyst', '催化材料数据采集加工处理'),
    ('lowdim-standardization-twod', '二维材料数据库标准化'), ('lowdim-standardization-opto', '有机光电材料数据库标准化'),
    ('lowdim-standardization-electrolyte', '电解质材料数据库标准化'), ('lowdim-standardization-mlff', '机器学习力场数据库标准化'),
    ('lowdim-standardization-catalyst', '催化材料数据库标准化'),
    ('lowdim-database-twod', '二维材料数据库'), ('lowdim-database-opto', '有机光电材料数据库'),
    ('lowdim-database-electrolyte', '电解质材料数据库'), ('lowdim-database-mlff', '机器学习力场数据库'),
    ('lowdim-database-catalyst', '催化材料数据库'),
    ('twod', '二维材料数据应用'), ('electrolyte', '电解质材料数据应用'), ('opto', '有机光电材料应用'),
    ('mlff', '机器学习力场应用'), ('catalyst', '催化材料数据应用'),
    ('algorithms', '数据应用算法'), ('tools', '数据工具开发'), ('prediction-tasks', '预测任务管理'),
    ('data-submit', '数据上传'), ('my-submissions', '我的提交'), ('twod-review', '入库审核'),
    ('sys-algorithm', '算法/接口管理'),
    ('sys-permission', '权限审批'), ('sys-user', '用户管理'), ('sys-role', '角色管理'),
    ('sys-menu', '菜单管理'), ('sys-dict', '字典管理'), ('system-config', '平台配置'), ('sys-log', '操作日志'),
]

PROBE = r"""(function(){
  var p = document.querySelector('.page.active');
  var nav = document.querySelector('.sidebar .nav-btn.active');
  return JSON.stringify({
    err: (window.__cdpErrors||[]).length,
    errs: (window.__cdpErrors||[]).slice(0,3),
    active: p ? p.id : null,
    nav: nav ? nav.getAttribute('data-page') : null,
    htmlLen: p ? p.innerHTML.length : 0,
    textLen: p ? p.innerText.length : 0,
    overflow: document.body.scrollWidth > document.documentElement.clientWidth + 2
  });
})()"""

c = Cdp()
try:
    bad = []
    for pid, label in PAGES:
        c.open('file:///C:/Users/Windows/Desktop/diwei/%s.html' % pid)
        time.sleep(0.8)
        v = json.loads(c.evaluate(PROBE))
        ok = (v['active'] == 'page-' + pid) and v['err'] == 0 and v['htmlLen'] > 200
        print('%-32s %-28s active=%-30s nav=%-28s html=%-7d text=%-6d err=%d %s' % (
            pid, label, v['active'], v['nav'], v['htmlLen'], v['textLen'], v['err'],
            'OK' if ok else '<<<< CHECK'))
        if not ok:
            bad.append((pid, v))
    print('\nBAD:', len(bad))
    for pid, v in bad:
        print(' ', pid, v)
finally:
    c.close()
