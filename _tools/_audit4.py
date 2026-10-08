# -*- coding: utf-8 -*-
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cdp import Cdp
ROOT = r"C:/Users/Windows/Desktop/diwei"
out=[]
c = Cdp()
try:
    for fn, pid, tag in [("dashboard.html","page-dashboard","数据看板"),
                         ("sys-permission.html","page-sys-permission","权限审批"),
                         ("lowdim-database-twod.html","page-lowdim-database-twod","二维数据库-信息概览")]:
        c.open("file:///" + os.path.join(ROOT,fn).replace("\\","/"))
        time.sleep(1.5)
        out.append("#### %s" % tag)
        out.append((c.evaluate("(function(){var p=document.getElementById('%s');return p?(p.innerText||'').slice(0,2200):'__NO__';})()" % pid) or ""))
        out.append("")
    # 数据上传第二步
    c.open("file:///" + os.path.join(ROOT,"data-submit.html").replace("\\","/"))
    time.sleep(1.5)
    r = c.evaluate("(function(){var b=Array.from(document.querySelectorAll('#page-data-submit button')).filter(function(e){return (e.textContent||'').indexOf('下一步')>=0;}); if(b.length){b[0].click();return 'ok';} return 'miss';})()")
    time.sleep(1.2)
    out.append("#### 数据上传·下一步 "+str(r))
    out.append((c.evaluate("(function(){var p=document.getElementById('page-data-submit');return (p.innerText||'').slice(0,1500);})()") or ""))
finally:
    c.close()
open(os.path.join(os.path.dirname(os.path.abspath(__file__)),"_audit4_out.txt"),"w",encoding="utf-8").write("\n".join(out))
print("done")
