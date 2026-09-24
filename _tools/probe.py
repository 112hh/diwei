# -*- coding: utf-8 -*-
import sys, time, json
sys.path.insert(0, r'C:\Users\Windows\Desktop\diwei\_tools')
from cdp import Cdp

url = sys.argv[1]
expr = sys.argv[2]
c = Cdp()
try:
    c.open(url)
    print(c.evaluate(expr))
finally:
    c.close()
