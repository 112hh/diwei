# -*- coding: utf-8 -*-
"""按 1920x910 渲染页面，输出右侧主要区块的 getBoundingClientRect，
用于和用户截图里检测到的红框坐标做几何比对。

红框（clipboard-2026-09-23T11-40-16-214Z-d9370179.png, 1920x910）：
  框① x 744~1744, y 325~430  (1001 x 106)
  框② x 744~1744, y 728~881  (1001 x 154)
"""
import json, os, subprocess, sys, time, urllib.request
import websocket  # type: ignore

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
DIWEI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = "file:///" + os.path.join(DIWEI, "lowdim-database-twod.html").replace("\\", "/")
PROFILE = os.path.join(DIWEI, "_tools", "_chromeprofile_geom")
PORT = 9337
PREFIX = "#page-lowdim-database-twod "


def boot():
    if not os.path.exists(PROFILE):
        os.makedirs(PROFILE)
    args = [CHROME, "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
            "--remote-debugging-port=%d" % PORT, "--remote-allow-origins=*",
            "--user-data-dir=" + PROFILE, "--allow-file-access-from-files",
            "--force-device-scale-factor=1", "--window-size=1920,1000", URL]
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
            return "EXC: " + json.dumps(r["exceptionDetails"].get("exception", {}).get("description", r["exceptionDetails"]), ensure_ascii=False)
        return r.get("result", {}).get("value")


RECT = ("(function(){var e=document.querySelector(%s); if(!e) return null;"
        "var r=e.getBoundingClientRect();"
        "return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),"
        "x2:Math.round(r.right),y2:Math.round(r.bottom)};})()")

ATPT = ("(function(){var e=document.elementFromPoint(%d,%d); if(!e) return null;"
        "return e.tagName+'.'+String(e.className||'').slice(0,36)+' | '+String(e.textContent||'').trim().slice(0,34);})()")


def main():
    proc, ws = boot()
    try:
        cdp = CDP(ws)
        cdp.send("Runtime.enable")
        cdp.send("Page.enable")
        cdp.send("Page.reload")
        time.sleep(1.2)
        cdp.send("Emulation.setDeviceMetricsOverride", width=1920, height=910,
                 deviceScaleFactor=1, mobile=False)
        time.sleep(2.5)
        cdp.eval("window.scrollTo(0,0)")
        time.sleep(0.4)

        def rect(sel):
            return cdp.eval(RECT % json.dumps(sel))

        print("inner:", cdp.eval("[window.innerWidth, window.innerHeight]"))
        print("\n--- 字段信息页（库级默认页签）---")
        for name, sel in [("stat-grid", ".t2d-stat-grid"), ("toolbar", ".t2d-bar"),
                          ("table", ".t2d-table"), ("pager", ".t2d-pager"),
                          ("foot", ".t2d-foot"), ("main", ".t2d-main")]:
            print("  %-10s %s" % (name, rect(PREFIX + sel)))

        print("\n  elementFromPoint 扫描（字段信息页）:")
        for y in (325, 380, 430, 500, 728, 800, 881):
            print("    y=%-4d %s" % (y, cdp.eval(ATPT % (1200, y))))

        print("\n--- 切到信息概览页 ---")
        print("  ", cdp.eval("(function(){var t=document.querySelector(\"%s.t2d-tab[data-t2d-tab='overview']\");if(t)t.click();return !!t;})()" % PREFIX))
        time.sleep(0.9)
        for name, sel in [("card", ".t2d-card"), ("info", ".t2d-info"), ("main", ".t2d-main")]:
            print("  %-10s %s" % (name, rect(PREFIX + sel)))
        print("  elementFromPoint 扫描（信息概览页）:")
        for y in (325, 430, 500, 600, 728, 881):
            print("    y=%-4d %s" % (y, cdp.eval(ATPT % (1200, y))))
    finally:
        try:
            proc.terminate()
        except Exception:
            pass


if __name__ == "__main__":
    main()
