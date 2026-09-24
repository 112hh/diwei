# -*- coding: utf-8 -*-
"""校验 lowdim-database-twod.html 新页面：DOM 渲染 + 目录切换 + 搜索 + 抽屉"""
import json, os, subprocess, sys, time, urllib.request
import websocket  # type: ignore

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
DIWEI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = "file:///" + os.path.join(DIWEI, "lowdim-database-twod.html").replace("\\", "/")
PROFILE = os.path.join(DIWEI, "_tools", "_chromeprofile_test")
PORT = 9333

JS_PROBE = r"""
(function(){
  var out = {};
  var page = document.getElementById('page-lowdim-database-twod');
  out.pageExists = !!page;
  out.pageActive = page ? page.classList.contains('active') : false;
  out.hasRoot = !!document.querySelector('#page-lowdim-database-twod .t2d-root');
  out.sideNodes = document.querySelectorAll('#page-lowdim-database-twod .t2d-node').length;
  out.datasetNodes = Array.prototype.map.call(
    document.querySelectorAll('#page-lowdim-database-twod [data-t2d-node]'),
    function(n){ return n.textContent.replace(/\s+/g,' ').trim(); });
  out.tabs = Array.prototype.map.call(
    document.querySelectorAll('#page-lowdim-database-twod .t2d-tab'),
    function(n){ return n.textContent.trim() + (n.classList.contains('is-active')?'*':''); });
  out.stats = Array.prototype.map.call(
    document.querySelectorAll('#page-lowdim-database-twod .t2d-stat'),
    function(n){ return n.textContent.replace(/\s+/g,' ').trim(); });
  out.listHeaders = Array.prototype.map.call(
    document.querySelectorAll('#page-lowdim-database-twod .t2d-table thead th'),
    function(n){ return n.textContent.trim(); });
  out.listRows = document.querySelectorAll('#page-lowdim-database-twod .t2d-table tbody tr').length;
  out.firstRow = (function(){
    var tr = document.querySelector('#page-lowdim-database-twod .t2d-table tbody tr');
    if(!tr) return null;
    return Array.prototype.map.call(tr.children, function(td){ return td.textContent.replace(/\s+/g,' ').trim(); });
  })();
  out.searchInputs = Array.prototype.map.call(
    document.querySelectorAll('#page-lowdim-database-twod input'),
    function(n){ return n.getAttribute('placeholder'); });
  return out;
})()
"""


def boot():
    if not os.path.exists(PROFILE):
        os.makedirs(PROFILE)
    args = [CHROME, "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
            "--remote-debugging-port=%d" % PORT, "--remote-allow-origins=*",
            "--user-data-dir=" + PROFILE,
            "--allow-file-access-from-files", "--window-size=1600,1100", URL]
    proc = subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(60):
        try:
            data = urllib.request.urlopen("http://127.0.0.1:%d/json" % PORT, timeout=1).read()
            tabs = [t for t in json.loads(data) if t.get("type") == "page"]
            if tabs:
                return proc, tabs[0]["webSocketDebuggerUrl"]
        except Exception:
            pass
        time.sleep(0.5)
    raise RuntimeError("chrome devtools not reachable")


class CDP(object):
    def __init__(self, url):
        self.ws = websocket.create_connection(url, timeout=30)
        self.i = 0

    def send(self, method, **params):
        self.i += 1
        self.ws.send(json.dumps({"id": self.i, "method": method, "params": params}))
        while True:
            msg = json.loads(self.ws.recv())
            if msg.get("id") == self.i:
                if "error" in msg:
                    raise RuntimeError(msg["error"])
                return msg.get("result", {})

    def eval(self, expr):
        r = self.send("Runtime.evaluate", expression=expr, returnByValue=True, awaitPromise=True)
        return r.get("result", {}).get("value")

    def click(self, selector):
        return self.eval(
            "(function(){var el=document.querySelector(%s); if(!el) return 'NOT_FOUND'; el.click(); return 'OK';})()"
            % json.dumps(selector))

    def type_into(self, selector, text):
        return self.eval(
            "(function(){var el=document.querySelector(%s); if(!el) return 'NOT_FOUND';"
            "el.value=%s; el.dispatchEvent(new Event('input',{bubbles:true})); return 'OK';})()"
            % (json.dumps(selector), json.dumps(text)))


def main():
    proc, url = boot()
    try:
        cdp = CDP(url)
        cdp.send("Runtime.enable")
        cdp.send("Page.enable")
        time.sleep(2.0)

        errors = cdp.eval("(window.__t2dErrors||[]).length")
        r = cdp.eval(JS_PROBE)
        print("=== 默认页（库表清单） ===")
        print(json.dumps(r, ensure_ascii=False, indent=1))

        # 切到「信息概览」
        print("\n=== 点击「信息概览」页签 ===")
        cdp.eval("(function(){var t=document.querySelectorAll('#page-lowdim-database-twod .t2d-tab')[1]; t&&t.click();})()")
        time.sleep(0.4)
        print(json.dumps(cdp.eval(JS_PROBE), ensure_ascii=False, indent=1))

        print("\n=== 信息概览：指标卡 + 基本信息 ===")
        print(json.dumps(cdp.eval(
            "(function(){var p=document.querySelector('#page-lowdim-database-twod .t2d-main');"
            "var info=p.querySelector('.t2d-info');"
            "var pairs=[];"
            "if(info){Array.prototype.forEach.call(info.children,function(d){"
            "pairs.push(d.querySelector('dt').textContent.trim()+'='+d.querySelector('dd').textContent.trim());});}"
            "return {cards:p.querySelectorAll('.t2d-stat').length,"
            "cardLabels:Array.prototype.map.call(p.querySelectorAll('.t2d-stat-body span'),function(n){return n.textContent.trim();}),"
            "infoPairs:pairs,"
            "secHead:Array.prototype.map.call(p.querySelectorAll('.t2d-sec-head h4, .t2d-edit'),function(n){return n.textContent.trim();}),"
            "chips:p.querySelectorAll('.t2d-chip').length,"
            "kvs:p.querySelectorAll('.t2d-kv').length};})()"), ensure_ascii=False, indent=1))

        # 切回「库表清单」再点数据表名称 → 跳转到对应数据集列表页
        print("\n=== 点击数据表名称 → 跳转到对应数据集 ===")
        cdp.eval("(function(){var t=document.querySelectorAll('#page-lowdim-database-twod .t2d-tab')[0]; t&&t.click();})()")
        time.sleep(0.4)
        print("click result:", cdp.eval(
            "(function(){var b=document.querySelector('#page-lowdim-database-twod .t2d-table tbody .t2d-link');"
            "if(!b) return 'NO_LINK'; b.click(); return 'CLICKED:'+b.textContent.trim();})()"))
        time.sleep(0.5)
        print(json.dumps(cdp.eval(
            "(function(){var p=document.querySelector('#page-lowdim-database-twod .t2d-main');"
            "return {title:(p.querySelector('h2')||{}).textContent,"
            "tabs:Array.prototype.map.call(p.querySelectorAll('.t2d-tab'),function(n){"
            "return n.textContent.trim()+(n.classList.contains('is-active')?'*':'');}),"
            "drawer: !!document.getElementById('t2dDrawerMask'),"
            "crumb: (p.querySelector('.t2d-crumb')||{}).textContent};})()"), ensure_ascii=False))

        print("\n=== 逐个点击 8 个数据表名称，校验跳转目标 ===")
        print(json.dumps(cdp.eval(
            "(function(){var out=[];"
            "var links=document.querySelectorAll('#page-lowdim-database-twod .t2d-table tbody .t2d-link');"
            "if(!links.length) return 'NO_TABLE_VIEW';"
            "return Array.prototype.map.call(links,function(b){return b.textContent.trim();});})()"), ensure_ascii=False))
        for idx, expect in enumerate(["结构特征数据集", "电子结构数据集", "电学性质数据集", "磁学性质数据集",
                                      "热学性质数据集", "力学性质数据集", "光学性质数据集", "缺陷性质数据集"]):
            cdp.eval("(function(){var t=document.querySelectorAll('#page-lowdim-database-twod .t2d-tab')[0];"
                     "if(t&&document.querySelector('[data-t2d-node]')){} })()")
            # 回到库级视图
            cdp.eval("(function(){var b=document.querySelector('[data-t2d-toggle=\"db-root\"]'); b&&b.click();})()")
            time.sleep(0.25)
            cdp.eval("(function(){var t=document.querySelectorAll('#page-lowdim-database-twod .t2d-tab')[0]; t&&t.click();})()")
            time.sleep(0.25)
            got = cdp.eval(
                "(function(){var links=document.querySelectorAll('#page-lowdim-database-twod .t2d-table tbody .t2d-link');"
                "var b=links[%d]; if(!b) return 'NO_LINK'; b.click();"
                "var p=document.querySelector('#page-lowdim-database-twod .t2d-main');"
                "return (p.querySelector('h2')||{}).textContent;})()" % idx)
            time.sleep(0.25)
            print("  %s → %s  %s" % (expect, got, "OK" if got == expect else "MISMATCH"))

        # 回到库级视图，供后续用例
        cdp.eval("(function(){var b=document.querySelector('[data-t2d-toggle=\"db-root\"]'); b&&b.click();})()")
        time.sleep(0.3)

        # 回到库表清单并搜索
        print("\n=== 数据表名称搜索：结构 ===")
        cdp.eval("(function(){var t=document.querySelectorAll('#page-lowdim-database-twod .t2d-tab')[0]; t&&t.click();})()")
        time.sleep(0.3)
        cdp.type_into("#page-lowdim-database-twod [data-t2d-q1b]", "结构")
        time.sleep(0.5)
        print(json.dumps(cdp.eval(
            "(function(){return {rows: document.querySelectorAll('#page-lowdim-database-twod .t2d-table tbody tr').length,"
            "first: (function(){var tr=document.querySelector('#page-lowdim-database-twod .t2d-table tbody tr');"
            "return tr? tr.textContent.replace(/\\s+/g,' ').trim():null;})()};})()"),
            ensure_ascii=False))
        cdp.type_into("#page-lowdim-database-twod [data-t2d-q1b]", "")
        time.sleep(0.3)

        print("\n=== 切换到「结构特征数据集」 ===")
        cdp.eval("(function(){var b=document.querySelector('[data-t2d-node=\"ds:structure\"]'); b&&b.click();})()")
        time.sleep(0.4)
        r2 = cdp.eval(JS_PROBE)
        print(json.dumps(r2, ensure_ascii=False, indent=1))

        print("\n=== 结构特征数据集：字段清单逐行核对 ===")
        print(json.dumps(cdp.eval(
            "(function(){return Array.prototype.map.call("
            "document.querySelectorAll('#page-lowdim-database-twod .t2d-table tbody tr'),"
            "function(tr){return Array.prototype.map.call(tr.children,function(td){"
            "return td.textContent.replace(/\\s+/g,' ').trim();}).slice(0,6).join(' | ');});})()"),
            ensure_ascii=False, indent=1))

        print("\n=== 字段搜索：lattice ===")
        cdp.type_into("#page-lowdim-database-twod [data-t2d-q2]", "lattice")
        time.sleep(0.5)
        print(json.dumps(cdp.eval(
            "(function(){return {rows: document.querySelectorAll('#page-lowdim-database-twod .t2d-table tbody tr').length,"
            "texts: Array.prototype.map.call(document.querySelectorAll('#page-lowdim-database-twod .t2d-table tbody tr'),"
            "function(tr){return tr.children[0].textContent.trim();})};})()"), ensure_ascii=False))
        cdp.type_into("#page-lowdim-database-twod [data-t2d-q2]", "")
        time.sleep(0.3)

        print("\n=== 字段「查看详情」抽屉 ===")
        cdp.eval("(function(){var b=document.querySelector('#page-lowdim-database-twod [data-t2d-field]'); b&&b.click();})()")
        time.sleep(0.4)
        print(json.dumps(cdp.eval(
            "(function(){var m=document.getElementById('t2dDrawerMask');"
            "return m? m.textContent.replace(/\\s+/g,' ').slice(0,500) : 'NO_DRAWER';})()"), ensure_ascii=False))
        cdp.eval("(function(){var b=document.querySelector('[data-t2d-drawer-close]'); b&&b.click();})()")
        time.sleep(0.3)

        for tab, idx in (("示例数据", 1), ("信息概览", 2)):
            print("\n=== 数据集页签：%s ===" % tab)
            cdp.eval("(function(){var t=document.querySelectorAll('#page-lowdim-database-twod .t2d-tab')[%d]; t&&t.click();})()" % idx)
            time.sleep(0.5)
            print(json.dumps(cdp.eval(
                "(function(){var p=document.querySelector('#page-lowdim-database-twod .t2d-main');"
                "return {head: p.querySelectorAll('.t2d-table thead th').length,"
                "rows: p.querySelectorAll('.t2d-table tbody tr').length,"
                "stats: p.querySelectorAll('.t2d-stat').length,"
                "text: p.textContent.replace(/\\s+/g,' ').slice(0,260)};})()"), ensure_ascii=False))
            if tab == "信息概览":
                print(json.dumps(cdp.eval(
                    "(function(){var p=document.querySelector('#page-lowdim-database-twod .t2d-main');"
                    "var info=p.querySelector('.t2d-info');"
                    "return {cardLabels:Array.prototype.map.call(p.querySelectorAll('.t2d-stat-body span'),function(n){return n.textContent.trim();}),"
                    "cardValues:Array.prototype.map.call(p.querySelectorAll('.t2d-stat-body strong'),function(n){return n.textContent.trim();}),"
                    "secHead:Array.prototype.map.call(p.querySelectorAll('.t2d-sec-head h4, .t2d-edit'),function(n){return n.textContent.trim();}),"
                    "infoPairs: info? Array.prototype.map.call(info.children,function(d){"
                    "return d.querySelector('dt').textContent.trim()+'='+d.querySelector('dd').textContent.trim();}) : []};})()"),
                    ensure_ascii=False, indent=1))

        print("\n=== 逐一切换八大目录 ===")
        for key in ["structure", "electronic", "electrical", "magnetic", "thermal", "mechanical", "optical", "defect"]:
            cdp.eval("(function(){var b=document.querySelector('[data-t2d-node=\"ds:%s\"]'); b&&b.click();})()" % key)
            time.sleep(0.3)
            print(key, "→", json.dumps(cdp.eval(
                "(function(){var p=document.querySelector('#page-lowdim-database-twod .t2d-main');"
                "return {title:(p.querySelector('h2')||{}).textContent, fields:p.querySelectorAll('.t2d-table tbody tr').length};})()"),
                ensure_ascii=False))

        print("\nJS errors:", cdp.eval("window.__pageErrors||'none'"))
    finally:
        try:
            proc.terminate()
        except Exception:
            pass


if __name__ == "__main__":
    main()
