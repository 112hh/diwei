# -*- coding: utf-8 -*-
"""诊断 5 个采集加工页的实际渲染状态（只读，不改任何文件）。"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cdp import Cdp, INIT  # noqa: E402

ROOT = r"C:\Users\Windows\Desktop\diwei"

PAGES = [
    ("lowdim-ingest-twod", "page-lowdim-ingest-twod"),
    ("lowdim-ingest-opto", "page-lowdim-ingest-opto"),
    ("lowdim-ingest-electrolyte", "page-lowdim-ingest-electrolyte"),
    ("lowdim-ingest-mlff", "page-lowdim-ingest-mlff"),
    ("lowdim-ingest-catalyst", "page-lowdim-ingest-catalyst"),
]

PROBE = r"""
(function(pid){
  var el = document.getElementById(pid);
  var out = {
    exists: !!el,
    htmlLen: el ? el.innerHTML.length : 0,
    textLen: el ? (el.innerText||'').length : 0,
    tabs: [],
    h1: '',
    headDesc: '',
    firstText: '',
    hasCreateBtn: false,
    tableRows: 0,
    rwRoot: !!(el && el.querySelector('[data-rw-root="page"]')),
    errors: (window.__cdpErrors||[]).slice(0,6)
  };
  if (el) {
    var hs = el.querySelectorAll('h1');
    if (hs.length) out.h1 = hs[0].innerText.trim();
    var ps = el.querySelectorAll('.rw-head p');
    if (ps.length) out.headDesc = ps[0].innerText.trim().slice(0,120);
    var ts = el.querySelectorAll('.rw-tab');
    for (var i=0;i<ts.length;i++) out.tabs.push(ts[i].innerText.trim());
    out.hasCreateBtn = !!el.querySelector('[data-rw-act="open-create"]');
    out.tableRows = el.querySelectorAll('table.rw-tbl tbody tr').length;
    var t = (el.innerText||'').replace(/\s+/g,' ').trim();
    out.firstText = t.slice(0, 160);
  }
  return JSON.stringify(out);
})(%s)
"""


def main():
    c = Cdp()
    try:
        for name, pid in PAGES:
            url = "file:///" + os.path.join(ROOT, name + ".html").replace("\\", "/")
            c.send("Page.enable")
            c.send("Runtime.enable")
            c.send("Page.addScriptToEvaluateOnNewDocument", {"source": INIT})
            c.send("Page.navigate", {"url": url})
            import time
            time.sleep(5.0)
            val = c.evaluate(PROBE % ('"' + pid + '"',))
            print("==== " + name)
            try:
                d = json.loads(val)
                for k, v in d.items():
                    print("   %-14s %s" % (k, v))
            except Exception:
                print("   raw:", val)
            print()
    finally:
        c.close()


if __name__ == "__main__":
    main()
