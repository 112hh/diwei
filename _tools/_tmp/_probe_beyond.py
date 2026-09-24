# -*- coding: utf-8 -*-
"""对照实验：captureBeyondViewport 是否会把媒体查询尺寸带偏（导致 .rw-flow 竖排）。"""
import base64, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cdp import Cdp

URL = "file:///C:/Users/Windows/Desktop/diwei/lowdim-ingest-catalyst.html"

c = Cdp()
try:
    c.open(URL)
    time.sleep(1.5)
    c.send("Emulation.setDeviceMetricsOverride", {"width": 1600, "height": 1000, "deviceScaleFactor": 1, "mobile": False})
    time.sleep(0.4)
    c.evaluate("document.querySelector('#page-lowdim-ingest-catalyst .rw-tab[data-rw-tab=\"process\"]').click()")
    time.sleep(0.5)

    q = "getComputedStyle(document.querySelector('#page-lowdim-ingest-catalyst .rw-flow')).flexDirection"
    print("A. 截图前（override 1600）        flexDirection =", c.evaluate(q))

    r = c.send("Page.captureScreenshot", {"format": "png"})   # 不带 captureBeyondViewport
    print("B. 截图不带 beyond 之后          flexDirection =", c.evaluate(q))

    r = c.send("Page.captureScreenshot", {"format": "png", "captureBeyondViewport": True})
    print("C. 截图带 beyond 之后            flexDirection =", c.evaluate(q))
    print("   matchMedia(max-width:820px)  =", c.evaluate("matchMedia('(max-width:820px)').matches"))
    print("   clientWidth                  =", c.evaluate("document.documentElement.clientWidth"))
    print("   innerWidth                   =", c.evaluate("window.innerWidth"))
finally:
    c.close()
