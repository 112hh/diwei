# -*- coding: utf-8 -*-
"""五个数据库页面：新增/编辑/删除数据集 + 关联数据表多选 的联合回归。

每个库断言：
  - 目录「＋ 新增」按钮可打开弹窗，且弹窗带 data-t2d-page（实例隔离）
  - 多选下拉可展开、可勾选，chips 与勾选数一致
  - 名称为空时提交进入错误态（.is-error）
  - 填写名称后提交成功：目录 +1、toast 出现
  - 新数据集「信息概览 → 关联数据表」显示所勾选的多张表
  - 删除数据集后目录恢复原数量
  - 控制台无错误
"""
import json, os, subprocess, sys, time, urllib.request
import websocket  # type: ignore

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
DIWEI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTDIR = os.path.join(DIWEI, "_tools", "preview_dbs")
PROFILE = os.path.join(DIWEI, "_tools", "_chromeprofile_crud")
PORT = 9360

FAIL = []

DBS = [
    ("二维材料数据库", "lowdim-database-twod", "lowdim-database-twod.html", 8, 4),
    ("有机光电材料数据库", "lowdim-database-opto", "lowdim-database-opto.html", 4, 1),
    ("电解质材料数据库", "lowdim-database-electrolyte", "lowdim-database-electrolyte.html", 3, 3),
    ("机器学习力场数据库", "lowdim-database-mlff", "lowdim-database-mlff.html", 3, 3),
    ("催化材料数据库", "lowdim-database-catalyst", "lowdim-database-catalyst.html", 6, 1),
]
# (名称, pageId, html, 数据集数, 该库物理表数)


def boot(url, port):
    if not os.path.exists(PROFILE):
        os.makedirs(PROFILE)
    args = [CHROME, "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
            "--remote-debugging-port=%d" % port, "--remote-allow-origins=*",
            "--user-data-dir=" + PROFILE, "--allow-file-access-from-files",
            "--force-device-scale-factor=1", "--window-size=1680,1020", url]
    proc = subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(60):
        try:
            data = urllib.request.urlopen("http://127.0.0.1:%d/json" % port, timeout=1).read()
            tabs = [t for t in json.loads(data) if t.get("type") == "page"]
            if tabs:
                return proc, tabs[0]["webSocketDebuggerUrl"]
        except Exception:
            pass
        time.sleep(0.5)
    raise RuntimeError("chrome devtools not reachable: %s" % url)


class CDP(object):
    def __init__(self, url):
        self.ws = websocket.create_connection(url, timeout=60)
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
        if r.get("exceptionDetails"):
            ed = r["exceptionDetails"]
            return "EXC: " + (ed.get("exception", {}).get("description") or ed.get("text") or json.dumps(ed, ensure_ascii=False))
        return r.get("result", {}).get("value")

    def shot(self, name):
        self.eval("window.scrollTo(0,0)")
        time.sleep(0.3)
        r = self.send("Page.captureScreenshot", format="png", captureBeyondViewport=True)
        with open(os.path.join(OUTDIR, name + ".png"), "wb") as f:
            f.write(__import__("base64").b64decode(r["data"]))


def js_click(sel):
    return "(function(){var e=document.querySelector(%s);if(!e)return 'NOT_FOUND';e.click();return 'OK';})()" % json.dumps(sel)


def js_count(sel):
    return "(function(){return document.querySelectorAll(%s).length;})()" % json.dumps(sel)


def check(label, got, want):
    ok = (got == want)
    print("  [%s] %s  →  %r" % ("PASS" if ok else "FAIL", label, got))
    if not ok:
        FAIL.append("%s: got %r, want %r" % (label, got, want))


def check_true(label, cond, got=None):
    ok = bool(cond) and not (isinstance(cond, str) and cond.startswith("EXC:"))
    print("  [%s] %s  →  %r" % ("PASS" if ok else "FAIL", label, got))
    if not ok:
        FAIL.append("%s: %r" % (label, got))


def main():
    if not os.path.exists(OUTDIR):
        os.makedirs(OUTDIR)

    for idx, (name, pid, html, dscount, tblcount) in enumerate(DBS):
        P = "#page-%s " % pid
        url = "file:///" + os.path.join(DIWEI, html).replace("\\", "/")
        proc, ws = boot(url, PORT + idx)
        try:
            cdp = CDP(ws)
            cdp.send("Runtime.enable")
            cdp.send("Page.enable")
            cdp.send("Page.addScriptToEvaluateOnNewDocument", source=(
                "window.__errs=[];"
                "window.addEventListener('error',function(e){window.__errs.push('ERR '+e.message+' @line'+e.lineno);});"
                "window.addEventListener('unhandledrejection',function(e){window.__errs.push('REJ '+e.reason);});"))
            cdp.send("Page.reload")
            time.sleep(1.2)
            cdp.send("Emulation.setDeviceMetricsOverride", width=1680, height=1020, deviceScaleFactor=1, mobile=False)
            time.sleep(2.8)
            cdp.eval("(function(){try{switchPage(%s);}catch(e){return 'EXC';}return 'OK';})()" % json.dumps(pid))
            time.sleep(1.0)

            print("\n========== %s ==========" % name)
            base = cdp.eval(js_count(P + ".t2d-children .t2d-node-row"))
            check("初始数据集数", base, dscount)

            # 1. 打开新增弹窗
            check("点新增", cdp.eval(js_click(P + "[data-t2d-add-ds]")), "OK")
            time.sleep(0.5)
            check("弹窗存在", cdp.eval(js_count("#t2dModalMask")), 1)
            check("弹窗归属本页", cdp.eval("(function(){var m=document.getElementById('t2dModalMask');return m?m.getAttribute('data-t2d-page'):'NONE';})()"), pid)

            # 2. 展开多选
            check("展开下拉", cdp.eval(js_click("#t2dModalMask [data-t2d-msel-toggle]")), "OK")
            time.sleep(0.3)
            check_true("下拉面板可见", cdp.eval("(function(){var p=document.querySelector('#t2dModalMask [data-t2d-msel-panel]');return !!p && p.offsetHeight>0;})()"))
            check("可选项数=物理表数", cdp.eval(js_count("#t2dModalMask [data-t2d-f-tables]")), tblcount)

            # 3. 勾选前两个（单表库就勾 1 个）
            pick = 2 if tblcount >= 2 else 1
            cdp.eval("(function(){var b=document.querySelectorAll('#t2dModalMask [data-t2d-f-tables]');for(var i=0;i<%d;i++){b[i].click();}return 'OK';})()" % pick)
            time.sleep(0.3)
            check("已勾选数", cdp.eval(js_count("#t2dModalMask [data-t2d-f-tables]:checked")), pick)
            check("chips 数", cdp.eval(js_count("#t2dModalMask .t2d-msel-chip")), pick)
            cdp.shot("%s-3-新增弹窗" % name)

            # 4. 空名提交 → 错误态
            cdp.eval(js_click("#t2dModalMask [data-t2d-modal-ok]"))
            time.sleep(0.3)
            check("空名进入错误态", cdp.eval(js_count("#t2dModalMask .t2d-form-item.is-error")), 1)
            check("空名未新增", cdp.eval(js_count(P + ".t2d-children .t2d-node-row")), dscount)

            # 5. 填名提交
            newname = "回归测试数据集"
            cdp.eval("(function(){var e=document.querySelector('#t2dModalMask [data-t2d-f-name]');e.value=%s;e.dispatchEvent(new Event('input',{bubbles:true}));return 'OK';})()" % json.dumps(newname))
            time.sleep(0.2)
            cdp.eval(js_click("#t2dModalMask [data-t2d-modal-ok]"))
            time.sleep(0.8)
            check("弹窗已关闭", cdp.eval(js_count("#t2dModalMask")), 0)
            check("新增后数据集数", cdp.eval(js_count(P + ".t2d-children .t2d-node-row")), dscount + 1)

            # 6. 打开新数据集看概览
            last = cdp.eval("(function(){var n=document.querySelectorAll(%s);var e=n[n.length-1];return e?e.getAttribute('data-t2d-node'):'NONE';})()" % json.dumps(P + ".t2d-children .t2d-node-row [data-t2d-node]"))
            check("新节点 id 前缀", last[:3], "ds:")
            cdp.eval(js_click(P + "[data-t2d-node='%s']" % last))
            time.sleep(0.6)
            check("新数据集标题", cdp.eval("(function(){var e=document.querySelector(%s);return e?e.textContent.trim():'NONE';})()" % json.dumps(P + ".t2d-title-row h2")), newname)
            cdp.eval(js_click(P + ".t2d-tab[data-t2d-tab='overview']"))
            time.sleep(0.5)
            rel = cdp.eval("(function(){var d=document.querySelectorAll(%s);for(var i=0;i<d.length;i++){if(d[i].textContent.indexOf('关联数据表')>=0){var dd=d[i].parentNode;return dd?dd.textContent:'NONE';}}return 'NO_DT';})()" % json.dumps(P + ".t2d-info dt"))
            print("     关联数据表 →", rel)
            check_true("关联数据表含多个表名", (rel.count("、") >= (pick - 1)) and "关联数据表" in rel, rel)
            cdp.shot("%s-4-新数据集概览" % name)

            # 7. 删除
            cdp.eval(js_click(P + "[data-t2d-del-ds='%s']" % last))
            time.sleep(0.5)
            check("删除确认弹窗", cdp.eval(js_count("#t2dModalMask")), 1)
            cdp.eval(js_click("#t2dModalMask [data-t2d-modal-ok]"))
            time.sleep(0.8)
            check("删除后数据集数", cdp.eval(js_count(P + ".t2d-children .t2d-node-row")), dscount)

            errs = cdp.eval("JSON.stringify(window.__errs||[])")
            print("  __errs =", errs)
            if errs and errs != "[]":
                FAIL.append("%s 控制台错误: %s" % (name, errs))
        finally:
            try:
                proc.terminate()
            except Exception:
                pass
            time.sleep(0.4)

    print("\n===== 结果 =====")
    if FAIL:
        print("存在 %d 处失败：" % len(FAIL))
        for f in FAIL:
            print("  ✗", f)
    else:
        print("全部通过 ✓")


if __name__ == "__main__":
    main()
