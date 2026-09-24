# -*- coding: utf-8 -*-
import sys, time, json
sys.path.insert(0, r'C:\Users\Windows\Desktop\diwei\_tools')
from cdp import Cdp

URL = 'file:///C:/Users/Windows/Desktop/diwei/lowdim-database-twod.html'
c = Cdp()
try:
    c.open(URL)
    time.sleep(1.5)

    def ev(expr):
        return c.evaluate(expr)

    def snap(name):
        v = ev(r"""(function(){
          var p=document.getElementById('page-lowdim-database-twod');
          var sel=p.querySelector('[data-twod-ds-type]');
          var tb=p.querySelector('.twod-ds-table');
          return JSON.stringify({
            active:p.classList.contains('active'),
            sel: sel? sel.value : null,
            selOpts: sel? sel.options.length : 0,
            cols: tb? Array.from(tb.querySelectorAll('thead th')).map(function(t){return t.innerText.trim();}) : [],
            rows: tb? tb.querySelectorAll('tbody tr').length : 0,
            viewAllBtns: p.querySelectorAll('[data-twod-ds-viewall]').length,
            dlBtns: p.querySelectorAll('[data-twod-ds-download]').length,
            backBtns: p.querySelectorAll('[data-twod-ds-back]').length,
            title: (p.querySelector('.twod-ds-card-head h3')||{}).innerText||'',
            err: (window.__cdpErrors||[]).length
          });
        })()""")
        print('--', name, v)
        return json.loads(v)

    snap('初始（默认结构特征数据集）')

    # 切到磁学性质数据集
    ev("(function(){var s=document.querySelector('[data-twod-ds-type]');s.value='magnetic';s.dispatchEvent(new Event('change',{bubbles:true}));return 1;})()")
    time.sleep(1.0)
    snap('切换为磁学性质数据集')

    # 切回结构特征
    ev("(function(){var s=document.querySelector('[data-twod-ds-type]');s.value='structure';s.dispatchEvent(new Event('change',{bubbles:true}));return 1;})()")
    time.sleep(1.0)
    s1 = snap('切回结构特征数据集')

    # 点击第 3 行的查看全部
    ev("(function(){var b=document.querySelectorAll('[data-twod-ds-viewall]')[2];b.click();return 1;})()")
    time.sleep(1.0)
    s2 = snap('点击查看全部（第3行）')
    print('   focus row:', ev("JSON.stringify(Array.from(document.querySelectorAll('#page-lowdim-database-twod .twod-ds-table tbody tr')).map(function(r,i){return r.classList.contains('is-focus')?i:-1;}).filter(function(i){return i>=0;}))"))
    print('   文件区:', ev("document.querySelectorAll('#page-lowdim-database-twod [data-twod-ds-file]').length"))

    # 返回
    ev("(function(){document.querySelector('[data-twod-ds-back]').click();return 1;})()")
    time.sleep(1.0)
    snap('点击返回数据集列表')

    # 下载（只验证不报错）
    print('   下载调用:', ev("(function(){try{document.querySelectorAll('[data-twod-ds-download]')[0].click();return 'clicked';}catch(e){return 'ERR '+e.message;}})()"))
    time.sleep(1.0)
    print('   errors after download:', ev("JSON.stringify(window.__cdpErrors||[])"))

    # 原子结构图预览
    print('   结构图预览:', ev("(function(){try{var b=document.querySelector('[data-twod-ds-preview]');b.click();var m=document.getElementById('twodDatabaseStructurePreviewModal');return 'modal open='+(m? m.classList.contains('active')||getComputedStyle(m).display!=='none' : 'no-modal');}catch(e){return 'ERR '+e.message;}})()"))

    # 侧栏切走再切回
    ev("(function(){var n=document.querySelector('.sidebar .nav-btn[data-page=\"twod\"]');n.click();return 1;})()")
    time.sleep(1.5)
    print('   切到 twod:', ev("document.querySelector('.page.active').id"))
    ev("(function(){var n=document.querySelector('.sidebar .nav-btn[data-page=\"lowdim-database-twod\"]');n.click();return 1;})()")
    time.sleep(1.5)
    snap('侧栏切回二维材料数据库')
    print('   final errors:', ev("JSON.stringify(window.__cdpErrors||[])"))
finally:
    c.close()
