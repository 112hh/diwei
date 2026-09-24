# -*- coding: utf-8 -*-
"""对新页面各视图截图，便于人工核对视觉效果"""
import base64, json, os, subprocess, time, urllib.request
import websocket  # type: ignore

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
DIWEI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = "file:///" + os.path.join(DIWEI, "lowdim-database-twod.html").replace("\\", "/")
PROFILE = os.path.join(DIWEI, "_tools", "_chromeprofile_shot")
OUTDIR = os.path.join(DIWEI, "_tools", "preview")
PORT = 9334


def boot():
    if not os.path.exists(PROFILE):
        os.makedirs(PROFILE)
    args = [CHROME, "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
            "--remote-debugging-port=%d" % PORT, "--remote-allow-origins=*",
            "--user-data-dir=" + PROFILE, "--allow-file-access-from-files",
            "--force-device-scale-factor=1", "--window-size=1560,1000", URL]
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
        self.ws = websocket.create_connection(url, timeout=40)
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

    def shot(self, name, full=True):
        if full:
            m = self.send("Page.getLayoutMetrics")
            h = int(m["cssContentSize"]["height"])
            self.send("Emulation.setDeviceMetricsOverride", width=1560, height=min(h, 6000),
                      deviceScaleFactor=1, mobile=False)
        time.sleep(0.5)
        r = self.send("Page.captureScreenshot", format="png", captureBeyondViewport=full)
        path = os.path.join(OUTDIR, name + ".png")
        with open(path, "wb") as f:
            f.write(base64.b64decode(r["data"]))
        print("saved", path)
        if full:
            self.send("Emulation.clearDeviceMetricsOverride")


def main():
    if not os.path.exists(OUTDIR):
        os.makedirs(OUTDIR)
    proc, url = boot()
    try:
        cdp = CDP(url)
        cdp.send("Runtime.enable"); cdp.send("Page.enable")
        time.sleep(2.0)

        cdp.eval("window.scrollTo(0,0)")
        cdp.shot("01-库表清单")
        cdp.eval("(function(){document.querySelectorAll('#page-lowdim-database-twod .t2d-tab')[1].click();})()")
        time.sleep(0.6); cdp.eval("window.scrollTo(0,0)")
        cdp.shot("02-信息概览")
        cdp.eval("(function(){document.querySelectorAll('#page-lowdim-database-twod .t2d-tab')[0].click();})()")
        time.sleep(0.5)
        cdp.eval("(function(){document.querySelector('[data-t2d-node=\"ds:structure\"]').click();})()")
        time.sleep(0.6); cdp.eval("window.scrollTo(0,0)")
        cdp.shot("03-数据集字段信息")
        cdp.eval("(function(){var b=document.querySelectorAll('#page-lowdim-database-twod .t2d-page-num')[1]; b&&b.click();})()")
        time.sleep(0.6); cdp.eval("window.scrollTo(0,0)")
        cdp.shot("03b-字段信息第2页")
        cdp.eval("(function(){var b=document.querySelectorAll('#page-lowdim-database-twod .t2d-page-num')[0]; b&&b.click();})()")
        time.sleep(0.5)
        cdp.eval("(function(){document.querySelectorAll('#page-lowdim-database-twod .t2d-tab')[1].click();})()")
        time.sleep(0.7); cdp.eval("window.scrollTo(0,0)")
        cdp.shot("04-数据集示例数据")
        cdp.eval("(function(){document.querySelectorAll('#page-lowdim-database-twod .t2d-tab')[2].click();})()")
        time.sleep(0.7); cdp.eval("window.scrollTo(0,0)")
        cdp.shot("05-数据集信息概览")
        cdp.eval("(function(){document.querySelectorAll('#page-lowdim-database-twod .t2d-tab')[0].click();})()")
        time.sleep(0.5)
        cdp.eval("(function(){document.querySelector('#page-lowdim-database-twod .t2d-table tbody .t2d-link').click();})()")
        time.sleep(1.2)
        cdp.eval("window.scrollTo(0,0)")
        cdp.shot("06-点击数据表名称跳转", full=False)
        time.sleep(0.5)
        cdp.eval("(function(){document.querySelector('[data-t2d-node=\"ds:optical\"]').click();})()")
        time.sleep(0.7)
        cdp.eval("(function(){document.querySelector('#page-lowdim-database-twod .t2d-table tbody .t2d-link').click();})()")
        time.sleep(1.2)
        cdp.shot("07-字段详情抽屉", full=False)
        cdp.eval("(function(){var b=document.querySelector('[data-t2d-drawer-close]'); b&&b.click();})()")
        time.sleep(0.4)

        # EAV 结构：电子结构数据集 字段信息 / 示例数据 / 缺陷数据集
        cdp.eval("(function(){document.querySelector('[data-t2d-node=\"ds:electronic\"]').click();})()")
        time.sleep(0.7); cdp.eval("window.scrollTo(0,0)")
        cdp.shot("08-电子结构数据集字段信息-EAV")
        cdp.eval("(function(){document.querySelectorAll('#page-lowdim-database-twod .t2d-tab')[1].click();})()")
        time.sleep(0.7); cdp.eval("window.scrollTo(0,0)")
        cdp.shot("09-电子结构数据集示例数据-EAV")
        cdp.eval("(function(){document.querySelector('[data-t2d-node=\"ds:defect\"]').click();})()")
        time.sleep(0.7); cdp.eval("window.scrollTo(0,0)")
        cdp.shot("10-缺陷数据集字段信息-EAV扩展")
        print("done")
    finally:
        try: proc.terminate()
        except Exception: pass


if __name__ == "__main__":
    main()
