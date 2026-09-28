# -*- coding: utf-8 -*-
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
src = open(r"C:\Users\Windows\Desktop\diwei\_tools\ingest_rw.js", encoding="utf-8").read()

for name in ["twod", "opto", "electrolyte", "mlff", "catalyst"]:
    i = src.index("MAT." + name + " = {")
    j = src.index("tasks:", i)
    k = src.index("};", j)
    seg = src[j:k]
    ids = re.findall(r'id:\s*"([^"]+)"', seg)
    print("MAT.%-12s tasks ids: %s" % (name, ids))
    # trace ids
    m = src.index("MATX")
    ti = src.index(name + ": {", m)
    tj = src.index("trace:", ti)
    tk = src.index("shards:", tj)
    tseg = src[tj:tk]
    tids = re.findall(r'"([A-Z0-9\-]+-CL-[^"]+)"', tseg)
    print("%-16s trace ids : %s" % ("", tids))
    print()
