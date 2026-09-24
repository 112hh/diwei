# -*- coding: utf-8 -*-
"""二维材料数据库：数据集视图 + 库表结构视图（数据库层/数据表层）冒烟测试。"""
import json, sys
from cdp import Cdp, INIT

URL = 'file:///C:/Users/Windows/Desktop/diwei/lowdim-database-twod.html'
PAGE = 'page-lowdim-database-twod'

J_LOGIN = "(function(){var b=document.querySelector('[data-standard-login-submit]');if(b)b.click();" \
          "var n=document.querySelector('.sidebar .nav-btn[data-page=\"lowdim-database-twod\"]');if(n)n.click();return 1;})()"

# 每张表期望的字段数（来自 gkx_ldm.sql 实际列数）
EXPECT_FIELDS = {
    'ldm_material_2d': 20,
    'ldm_material_2d_structure': 24,
    'ldm_material_2d_property': 21,
    'ldm_material_file_asset': 15,
    'ldm_file_conversion_task': 26,
    'ldm_file_conversion_capability': 18,
}

PROBE = """
(function(){
  var page = document.getElementById('%s');
  var root = page ? page.querySelector('.twod-ds-page') : null;
  function txt(el){ return el ? el.innerText.replace(/\\s+/g,' ') : ''; }
  function cnt(sel){ return page ? page.querySelectorAll(sel).length : 0; }
  var cards = [];
  if (page) Array.prototype.forEach.call(page.querySelectorAll('.twod-ds-card'), function(c){
    cards.push(txt(c.querySelector('h3')));
  });
  return JSON.stringify({
    errors: window.__cdpErrors || [],
    hasRoot: !!root,
    h2: txt(page ? page.querySelector('.twod-ds-head h2') : null),
    tabs: cnt('.twod-ds-tab'),
    activeTab: txt(page ? page.querySelector('.twod-ds-tab.is-active') : null),
    statCards: cnt('.twod-ds-head-stats > div'),
    cards: cards,
    listRows: cnt('.twod-ds-table-list tbody tr'),
    tableCount: page ? page.querySelectorAll('[data-twod-ds-table]').length : 0,
    auditRows: page ? (function(){
      var t = Array.prototype.find ? Array.prototype.filter.call(page.querySelectorAll('.twod-ds-card'), function(c){
        return c.innerText.indexOf('数据集字段覆盖核对') === 0;
      })[0] : null;
      return t ? t.querySelectorAll('tbody tr').length : 0;
    })() : 0,
    missingTags: cnt('.twod-ds-tag-miss'),
    fieldRows: page ? (function(){
      var t = Array.prototype.filter.call(page.querySelectorAll('.twod-ds-card'), function(c){
        return c.innerText.indexOf('字段信息') === 0;
      })[0];
      return t ? t.querySelectorAll('tbody tr').length : 0;
    })() : 0,
    sampleRows: page ? (function(){
      var t = Array.prototype.filter.call(page.querySelectorAll('.twod-ds-card'), function(c){
        return c.innerText.indexOf('示例数据') === 0;
      })[0];
      return t ? t.querySelectorAll('tbody tr').length : 0;
    })() : 0,
    bodyLen: root ? root.innerText.length : 0,
    overflowX: page ? (document.body.scrollWidth - document.documentElement.clientWidth) : -1
  });
})()
""" % PAGE

def j(sel):
    return "(function(){var e=document.querySelector(%s);if(!e)return 'NO-ELEMENT';e.click();return 'clicked';})()" % json.dumps(sel)

fails = []
def check(name, cond, extra=''):
    if cond:
        print('  PASS  ' + name)
    else:
        print('  FAIL  ' + name + '  ' + extra)
        fails.append(name)

def probe(c):
    return json.loads(c.evaluate(PROBE))

def main():
    c = Cdp()
    try:
        c.open(URL)
        c.send('Page.addScriptToEvaluateOnNewDocument', {'source': INIT})
        c.evaluate(J_LOGIN)
        c.evaluate("(function(){return new Promise(function(r){setTimeout(function(){r(1);},800);});})()")

        print('--- 1. 数据集视图（默认列表） ---')
        s = probe(c)
        check('无 JS 报错', not s['errors'], str(s['errors']))
        check('页面标题正确', s['h2'] == '二维材料数据库', s['h2'])
        check('两个视图 Tab 存在', s['tabs'] == 2, str(s['tabs']))
        check('默认激活数据集视图', s['activeTab'] == '数据集视图', s['activeTab'])
        check('头部统计卡 3 个', s['statCards'] == 3, str(s['statCards']))
        check('结构特征数据集 8 条样例', s['listRows'] == 8, str(s['listRows']))
        check('无横向溢出', s['overflowX'] <= 0, str(s['overflowX']))

        print('--- 2. 切换到库表结构视图（数据库层） ---')
        c.evaluate(j('[data-twod-ds-viewtab="db"]'))
        c.evaluate("(function(){return new Promise(function(r){setTimeout(function(){r(1);},400);});})()")
        s = probe(c)
        check('无 JS 报错', not s['errors'], str(s['errors']))
        check('激活库表结构视图', s['activeTab'] == '库表结构视图', s['activeTab'])
        check('卡片含库表清单', '库表清单' in s['cards'], str(s['cards']))
        check('卡片含信息概览', '信息概览' in s['cards'], str(s['cards']))
        check('卡片含计算与测试条件', '计算与测试条件' in s['cards'], str(s['cards']))
        check('卡片含字段覆盖核对', '数据集字段覆盖核对' in s['cards'], str(s['cards']))
        check('库表清单 6 张表', s['tableCount'] == 6, str(s['tableCount']))
        check('字段核对 8 行', s['auditRows'] == 8, str(s['auditRows']))
        check('无缺失字段标红', s['missingTags'] == 0, str(s['missingTags']))
        check('无横向溢出', s['overflowX'] <= 0, str(s['overflowX']))

        print('--- 3. 逐张表进入数据表层 ---')
        for key, num in EXPECT_FIELDS.items():
            c.evaluate(j('[data-twod-ds-table="%s"]' % key))
            c.evaluate("(function(){return new Promise(function(r){setTimeout(function(){r(1);},350);});})()")
            s = probe(c)
            ok = (s['fieldRows'] == num and '字段信息' in s['cards']
                  and '示例数据' in s['cards'] and '信息概览' in s['cards']
                  and s['sampleRows'] > 0 and not s['errors'])
            check('%s 字段 %d 个 + 示例 %d 行' % (key, num, s['sampleRows']), ok,
                  'got fields=%s cards=%s errors=%s' % (s['fieldRows'], s['cards'], s['errors']))
            # 返回库表清单
            c.evaluate(j('[data-twod-ds-backdb]'))
            c.evaluate("(function(){return new Promise(function(r){setTimeout(function(){r(1);},300);});})()")

        s = probe(c)
        check('返回库表清单成功', s['tableCount'] == 6, str(s['cards']))

        print('--- 4. 从列表页「查看来源库表」进入 ---')
        c.evaluate(j('[data-twod-ds-viewtab="list"]'))
        c.evaluate("(function(){return new Promise(function(r){setTimeout(function(){r(1);},350);});})()")
        c.evaluate(j('[data-twod-ds-godb]'))
        c.evaluate("(function(){return new Promise(function(r){setTimeout(function(){r(1);},350);});})()")
        s = probe(c)
        check('列表可直接进入数据库层', s['tableCount'] == 6 and s['activeTab'] == '库表结构视图', str(s['cards']))

        print('--- 5. 切回数据集视图做「查看全部」回归 ---')
        c.evaluate(j('[data-twod-ds-viewtab="list"]'))
        c.evaluate("(function(){return new Promise(function(r){setTimeout(function(){r(1);},350);});})()")
        c.evaluate(j('[data-twod-ds-viewall="2"]'))
        c.evaluate("(function(){return new Promise(function(r){setTimeout(function(){r(1);},350);});})()")
        s = probe(c)
        check('查看全部渲染正常', '数据集包样例数据' in s['cards'] and not s['errors'], str(s['cards']) + str(s['errors']))
        c.evaluate(j('[data-twod-ds-back]'))
        c.evaluate("(function(){return new Promise(function(r){setTimeout(function(){r(1);},350);});})()")
        s = probe(c)
        check('返回数据集列表正常', s['listRows'] == 8, str(s['listRows']))

        print('--- 6. 侧栏切走再切回 ---')
        c.evaluate("(function(){var n=document.querySelector('.sidebar .nav-btn[data-page=\"lowdim-database-opto\"]');if(n)n.click();return 1;})()")
        c.evaluate("(function(){return new Promise(function(r){setTimeout(function(){r(1);},400);});})()")
        c.evaluate(J_LOGIN)
        c.evaluate("(function(){return new Promise(function(r){setTimeout(function(){r(1);},600);});})()")
        s = probe(c)
        check('切回本页仍能渲染', s['hasRoot'] and not s['errors'], str(s['errors']))

        print('')
        if fails:
            print('RESULT: FAIL (%d)' % len(fails))
            for f in fails:
                print('  - ' + f)
        else:
            print('RESULT: ALL PASS')
    finally:
        c.close()

main()
