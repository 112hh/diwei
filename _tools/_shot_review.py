# -*- coding: utf-8 -*-
"""截取采集加工页三个页签的实际渲染效果，用于信息架构评审。"""
import base64
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cdp import Cdp  # noqa: E402

ROOT = r"C:\Users\Windows\Desktop\diwei"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_review")
if not os.path.isdir(OUT):
    os.makedirs(OUT)

TARGETS = [("collect", None), ("entry", "todo"), ("process", "jobs")]


def js(c, expr):
    return c.evaluate("(function(){ try { return (%s); } catch(e) { return '__ERR__' + e.message; } })()" % expr)


def shot(c, name, h):
    c.send("Emulation.setDeviceMetricsOverride",
           {"width": 1500, "height": h, "deviceScaleFactor": 1, "mobile": False})
    time.sleep(0.6)
    r = c.send("Page.captureScreenshot", {"format": "png", "captureBeyondViewport": True})
    data = r.get("result", {}).get("data")
    if not data:
        print("shot fail", name, str(r)[:200])
        return
    p = os.path.join(OUT, name + ".png")
    with open(p, "wb") as f:
        f.write(base64.b64decode(data))
    print("shot:", p)


def main():
    c = Cdp()
    try:
        c.open("file:///" + os.path.join(ROOT, "lowdim-ingest-twod.html").replace("\\", "/"))
        time.sleep(5)
        for tab, view in TARGETS:
            if tab != "collect":
                js(c, "document.querySelector('#page-lowdim-ingest-twod .rw-tab[data-rw-tab=\"%s\"]').click()" % tab)
                time.sleep(1.2)
            if view:
                js(c, "document.querySelector('[data-rw-act=\"%s-view\"][data-view=\"%s\"]').click()"
                   % ("entry" if tab == "entry" else "proc", view))
                time.sleep(1.0)
            h = js(c, "Math.min(document.getElementById('page-lowdim-ingest-twod').scrollHeight+120, 9000)")
            try:
                h = int(h)
            except Exception:
                h = 3000
            shot(c, "twod_" + tab, h)
    finally:
        c.close()


if __name__ == "__main__":
    main()
