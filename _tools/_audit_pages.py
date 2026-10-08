# -*- coding: utf-8 -*-
import os, sys, time, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cdp import Cdp

ROOT = r"C:/Users/Windows/Desktop/diwei"
TARGETS = [
    ("standard-twod.html", "page-standard-twod", "低维材料标准体系"),
    ("lowdim-ingest-twod.html", "page-lowdim-ingest-twod", "二维入库"),
    ("lowdim-ingest-opto.html", "page-lowdim-ingest-opto", "有机光电入库"),
    ("lowdim-ingest-electrolyte.html", "page-lowdim-ingest-electrolyte", "电解质入库"),
    ("lowdim-ingest-mlff.html", "page-lowdim-ingest-mlff", "MLFF入库"),
    ("lowdim-ingest-catalyst.html", "page-lowdim-ingest-catalyst", "催化入库"),
    ("lowdim-standardization-twod.html", "page-lowdim-standardization-twod", "二维标准化"),
    ("lowdim-standardization-opto.html", "page-lowdim-standardization-opto", "有机光电标准化"),
    ("lowdim-standardization-electrolyte.html", "page-lowdim-standardization-electrolyte", "电解质标准化"),
    ("lowdim-standardization-mlff.html", "page-lowdim-standardization-mlff", "MLFF标准化"),
    ("lowdim-standardization-catalyst.html", "page-lowdim-standardization-catalyst", "催化标准化"),
    ("lowdim-database-twod.html", "page-lowdim-database-twod", "二维数据库"),
    ("lowdim-database-opto.html", "page-lowdim-database-opto", "有机光电数据库"),
    ("data-submit.html", "page-data-submit", "数据上传"),
    ("my-submissions.html", "page-my-submissions", "我的提交"),
    ("twod-review.html", "page-twod-review", "入库审核"),
]

JS_NAV = "(function(){var b=document.querySelector('.sidebar .nav-btn[data-page=\"%s\"]'); if(b){b.click(); return 'clicked';} return 'no-nav';})()"
JS_DUMP = """(function(){
  var p = document.getElementById('%s');
  if(!p) return '__NO_SECTION__';
  var txt = (p.innerText||'').replace(/\\n{2,}/g,'\\n');
  var tabs = Array.from(p.querySelectorAll('[data-rw-tab],[data-tab],.rw-tab,.tab-btn')).map(function(e){return (e.textContent||'').trim().slice(0,20);});
  var btns = Array.from(p.querySelectorAll('button')).map(function(e){return (e.textContent||'').trim().slice(0,16);});
  var ths = Array.from(p.querySelectorAll('th')).map(function(e){return (e.textContent||'').trim().slice(0,14);});
  return JSON.stringify({len: txt.length, txt: txt.slice(0,2500), tabs: tabs.slice(0,30), btns: btns.slice(0,40), ths: ths.slice(0,40), nodes: p.querySelectorAll('*').length});
})()"""

def main():
    c = Cdp()
    out = []
    try:
        for fn, pid, label in TARGETS:
            url = "file:///" + os.path.join(ROOT, fn).replace("\\", "/")
            try:
                c.open(url)
            except Exception as e:
                out.append("==== %s (%s) OPEN_FAIL %r" % (label, fn, e)); continue
            time.sleep(1.5)
            nav = c.evaluate(JS_NAV % pid)
            time.sleep(1.8)
            d = c.evaluate(JS_DUMP % pid)
            out.append("#### %s | %s | nav=%s" % (label, fn, nav))
            out.append(d)
            out.append("")
    finally:
        c.close()
    open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_audit_out.txt"), "w", encoding="utf-8").write("\n".join(out))
    print("done")

main()
