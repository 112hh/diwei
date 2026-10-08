# -*- coding: utf-8 -*-
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cdp import Cdp
ROOT = r"C:/Users/Windows/Desktop/diwei"
out=[]
DUMP = """(function(){
  var p = document.getElementById('%s');
  if(!p) return '__NO__';
  return (p.innerText||'').replace(/\\n{2,}/g,'\\n');
})()"""
CLICK = "(function(){var els=Array.from(document.querySelectorAll('#%s button,[data-tab]')); var t=els.filter(function(e){return (e.textContent||'').indexOf('%s')>=0;}); if(t.length){t[0].click();return 'ok';} return 'miss';})()"

def dump(c, pid, tag):
    out.append("---- %s" % tag)
    out.append(c.evaluate(DUMP % pid))

c = Cdp()
try:
    # 1. 标准体系页
    c.open("file:///" + os.path.join(ROOT,"standard-twod.html").replace("\\","/"))
    time.sleep(1.5)
    dump(c, "page-standard-twod", "standard-twod 默认")
    for t in ["二维材料数据库标准体系","有机光电材料数据库标准体系","电解质材料数据库标准体系","机器学习力场数据库标准体系","催化材料数据库标准体系"]:
        r = c.evaluate(CLICK % ("page-standard-twod", t))
        time.sleep(1.2)
        dump(c, "page-standard-twod", "点击「%s」 %s" % (t, r))
    # 2. 电解质标准化：点各分类
    c.open("file:///" + os.path.join(ROOT,"lowdim-standardization-electrolyte.html").replace("\\","/"))
    time.sleep(1.5)
    for t in ["计算数据标准化","数据格式标准化","数据图表标准化","数据单位标准化","标准化数据表单整理"]:
        r = c.evaluate(CLICK % ("page-lowdim-standardization-electrolyte", t))
        time.sleep(1.0)
        d = c.evaluate(DUMP % "page-lowdim-standardization-electrolyte")
        out.append("==== 电解质标准化 · %s (%s)" % (t, r))
        out.append(d[:1800])
    # 3. 二维标准化：非标准数据检测
    c.open("file:///" + os.path.join(ROOT,"lowdim-standardization-twod.html").replace("\\","/"))
    time.sleep(1.5)
    r = c.evaluate(CLICK % ("page-lowdim-standardization-twod","非标准数据检测"))
    time.sleep(1.5)
    out.append("==== 二维标准化 · 非标准数据检测 (%s)" % r)
    out.append((c.evaluate(DUMP % "page-lowdim-standardization-twod") or "")[:2500])
    # 4. 入库页：数据安全等级弹窗
    c.open("file:///" + os.path.join(ROOT,"lowdim-ingest-twod.html").replace("\\","/"))
    time.sleep(1.5)
    r = c.evaluate(CLICK % ("page-lowdim-ingest-twod","数据安全等级"))
    time.sleep(1.5)
    out.append("==== 入库二维 · 数据安全等级 (%s)" % r)
    out.append((c.evaluate("(function(){var o=document.querySelector('.overlay:not([hidden])'); return o? o.innerText : 'no-overlay';})()") or "")[:2500])
finally:
    c.close()
open(os.path.join(os.path.dirname(os.path.abspath(__file__)),"_audit2_out.txt"),"w",encoding="utf-8").write("\n".join(out))
print("done")
