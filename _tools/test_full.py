# -*- coding: utf-8 -*-
import sys, time, json
sys.path.insert(0, r'C:\Users\Windows\Desktop\diwei\_tools')
from cdp import Cdp

c = Cdp()
try:
    c.open('file:///C:/Users/Windows/Desktop/diwei/low-dim-materials.html')
    time.sleep(1.5)
    print('初始（登录页）:', c.evaluate("JSON.stringify({login:!(document.getElementById('loginShell').hidden), page: state.page})"))
    # 模拟以管理员登入并进入二维材料数据库
    print('切管理员+进库:', c.evaluate("""(function(){
      try{
        if (typeof setUserRole==='function') setUserRole('admin');
        state.isAuthenticated = true; state.loginRole='admin';
        if (typeof syncAuthView==='function') syncAuthView();
        switchPage('lowdim-database-twod');
        return 'ok';
      }catch(e){return 'ERR '+e.message;}
    })()"""))
    time.sleep(1.5)
    print('页面状态:', c.evaluate("""JSON.stringify({
      active: document.querySelector('.page.active').id,
      sel: (document.querySelector('[data-twod-ds-type]')||{}).value,
      cols: Array.from(document.querySelectorAll('#page-lowdim-database-twod thead th')).map(function(t){return t.innerText.trim();}),
      rows: document.querySelectorAll('#page-lowdim-database-twod tbody tr').length,
      err: (window.__cdpErrors||[]).length
    })"""))
    # 其它四个库仍为原有视图
    for pid in ['lowdim-database-opto','lowdim-database-catalyst']:
        c.evaluate("switchPage('%s')" % pid)
        time.sleep(1.2)
        print(pid, c.evaluate("""JSON.stringify({
          active: document.querySelector('.page.active').id,
          hasNewView: !!document.querySelector('#page-%s [data-twod-ds-type]'),
          hasOldView: !!document.querySelector('#page-%s .ldbm-page'),
          err: (window.__cdpErrors||[]).length
        })""" % (pid, pid)))
    print('errors:', c.evaluate("JSON.stringify(window.__cdpErrors||[])"))
finally:
    c.close()
