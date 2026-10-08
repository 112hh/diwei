# -*- coding: utf-8 -*-
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cdp import Cdp
ROOT = r"C:/Users/Windows/Desktop/diwei"
out = []
c = Cdp()
try:
    for f in ["lowdim-ingest-twod.html", "lowdim-database-twod.html", "lowdim-standardization-twod.html", "standard-twod.html"]:
        c.open("file:///" + os.path.join(ROOT, f).replace("\\", "/"))
        time.sleep(1.5)
        out.append("==== " + f)
        out.append("errors: " + str(c.evaluate("JSON.stringify(window.__cdpErrors||[])")))
        out.append("typeof window.renderLowdimIngestPage = " + str(c.evaluate("typeof window.renderLowdimIngestPage")))
        out.append("typeof window.renderLowdimDatabasePage = " + str(c.evaluate("typeof window.renderLowdimDatabasePage")))
        out.append("typeof window.renderLowdimStandardizationPage = " + str(c.evaluate("typeof window.renderLowdimStandardizationPage")))
        out.append("typeof window.renderLowdimStandardSystemPage = " + str(c.evaluate("typeof window.renderLowdimStandardSystemPage")))
        out.append("typeof window.goToPage = " + str(c.evaluate("typeof window.goToPage")))
        out.append("state.page = " + str(c.evaluate("(typeof state!=='undefined'&&state)?state.page:'(no state)'")))
        out.append("ic-bar present: " + str(c.evaluate("!!document.querySelector('.ic-bar')")))
        out.append("ic-dbbar present: " + str(c.evaluate("!!document.querySelector('.ic-dbbar')")))
finally:
    c.close()
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_probe_render_out.txt")
open(p, "w", encoding="utf-8").write("\n".join(out))
print("done ->", p)
