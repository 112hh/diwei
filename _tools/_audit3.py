# -*- coding: utf-8 -*-
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cdp import Cdp
ROOT = r"C:/Users/Windows/Desktop/diwei"
out=[]
c = Cdp()
try:
    c.open("file:///" + os.path.join(ROOT,"lowdim-ingest-twod.html").replace("\\","/"))
    time.sleep(1.5)
    # 列出所有 overlay id 与可见性
    out.append("== overlays before")
    out.append(c.evaluate("(function(){return JSON.stringify(Array.from(document.querySelectorAll('.overlay')).map(function(o){return o.id+'|'+(o.hidden?'hidden':(getComputedStyle(o).display==='none'?'none':'VISIBLE'))+'|'+(o.innerText||'').slice(0,40).replace(/\\n/g,' ');}));})()"))
    r = c.evaluate("(function(){var b=Array.from(document.querySelectorAll('#page-lowdim-ingest-twod button')).filter(function(e){return (e.textContent||'').indexOf('数据安全等级')>=0;}); if(b.length){b[0].click(); return 'clicked:'+b[0].outerHTML.slice(0,200);} return 'miss';})()")
    time.sleep(1.5)
    out.append("== click 数据安全等级: "+str(r))
    out.append(c.evaluate("(function(){return JSON.stringify(Array.from(document.querySelectorAll('.overlay')).map(function(o){return o.id+'|'+(o.hidden?'hidden':(getComputedStyle(o).display==='none'?'none':'VISIBLE'))+'|'+(o.innerText||'').slice(0,120).replace(/\\n/g,' ');}));})()"))
    # 加工环：切到资源加工
    r2 = c.evaluate("(function(){var b=Array.from(document.querySelectorAll('#page-lowdim-ingest-twod button')).filter(function(e){return (e.textContent||'').indexOf('资源加工')>=0;}); if(b.length){b[0].click(); return 'ok';} return 'miss';})()")
    time.sleep(1.5)
    out.append("== 资源加工页签: "+str(r2))
    out.append((c.evaluate("(function(){var p=document.getElementById('page-lowdim-ingest-twod');return (p.innerText||'').slice(0,1500);})()") or ""))
    # 采集环：切到录入审核
    r3 = c.evaluate("(function(){var b=Array.from(document.querySelectorAll('#page-lowdim-ingest-twod button')).filter(function(e){return (e.textContent||'').indexOf('资源录入')>=0;}); if(b.length){b[0].click(); return 'ok';} return 'miss';})()")
    time.sleep(1.5)
    out.append("== 资源录入页签: "+str(r3))
    out.append((c.evaluate("(function(){var p=document.getElementById('page-lowdim-ingest-twod');return (p.innerText||'').slice(0,2000);})()") or ""))
finally:
    c.close()
open(os.path.join(os.path.dirname(os.path.abspath(__file__)),"_audit3_out.txt"),"w",encoding="utf-8").write("\n".join(out))
print("done")
