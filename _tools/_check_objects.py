# -*- coding: utf-8 -*-
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
src = open(r"C:\Users\Windows\Desktop\diwei\_tools\ingest_rw.js", encoding="utf-8").read()
for name in ["twod", "opto", "electrolyte", "mlff", "catalyst"]:
    i = src.index("MAT." + name + " = {")
    j = src.index("objects:", i)
    k = src.index("systems:", j)
    seg = src[j:k]
    names = re.findall(r'name:\s*"([^"]+)"', seg)
    groups = re.findall(r'\{[^{}]*group:\s*"([^"]+)"', seg)
    print("--- MAT.%s  对象数=%d" % (name, len(names)))
    print("    " + " | ".join(names[:20]))
    if groups:
        print("    分组: " + " | ".join(groups[:10]))
    print()
