# -*- coding: utf-8 -*-
import sys, time, base64, os
sys.path.insert(0, r'C:\Users\Windows\Desktop\diwei\_tools')
from cdp import Cdp

url = sys.argv[1]
out = sys.argv[2]
w = int(sys.argv[3]) if len(sys.argv) > 3 else 1600
h = int(sys.argv[4]) if len(sys.argv) > 4 else 1000
c = Cdp()
try:
    c.open(url)
    time.sleep(2.5)
    c.send('Emulation.setDeviceMetricsOverride', {'width': w, 'height': h, 'deviceScaleFactor': 1, 'mobile': False})
    time.sleep(1.0)
    if len(sys.argv) > 5:
        c.evaluate(sys.argv[5])
        time.sleep(1.5)
    r = c.send('Page.captureScreenshot', {'format': 'png', 'captureBeyondViewport': True})
    data = base64.b64decode(r['result']['data'])
    open(out, 'wb').write(data)
    print('saved', out, len(data))
finally:
    c.close()
