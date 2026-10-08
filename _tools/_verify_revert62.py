# -*- coding: utf-8 -*-
"""回退验证：标准体系模块应恢复原样（无本库标准/引用国标切换条），63/64 不受影响。"""
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cdp import Cdp

ROOT = r"C:/Users/Windows/Desktop/diwei"
out = []
c = Cdp()


def ev(e):
    return c.evaluate(e)


def errs():
    return ev("JSON.stringify(window.__cdpErrors||[])")


def body(n=1800):
    return (ev("(document.body.innerText||'').slice(0,%d)" % n) or "")


try:
    c.open("file:///" + os.path.join(ROOT, "standard-twod.html").replace("\\", "/"))
    time.sleep(2.0)
    out.append("==== standard-twod.html  errors=" + str(errs()))
    b = body(3000)
    out.append("[应有] 标准类型筛选: " + str("标准类型：" in b))
    out.append("[应有] 新增标准体系按钮: " + str("新增标准体系" in b))
    out.append("[应有] 标准文件列表: " + str("二维材料数据库字段与图谱归档标准" in b))
    out.append("[不该有] 本库标准: " + str("本库标准" in b))
    out.append("[不该有] 引用国标: " + str("引用国标" in b))
    out.append("[不该有] .stdsys-viewbar: " + str(ev("!!document.querySelector('.stdsys-viewbar')")))
    out.append("[不该有] .stdsys-stdtabs: " + str(ev("!!document.querySelector('.stdsys-stdtabs')")))
    out.append("[不该有] 摘要规范表: " + str("二维材料摘要规范" in b))
    out.append("--- 正文:\n" + b[:1200])

    c.open("file:///" + os.path.join(ROOT, "lowdim-standardization-twod.html").replace("\\", "/"))
    time.sleep(2.0)
    b2 = body(2600)
    out.append("")
    out.append("==== lowdim-standardization-twod.html  errors=" + str(errs()))
    out.append("[63 仍在] .stdex-bar: " + str(ev("!!document.querySelector('.stdex-bar')")))
    out.append("[63 仍在] 标准化执行页签: " + str("标准化执行" in b2))

    c.open("file:///" + os.path.join(ROOT, "lowdim-ingest-twod.html").replace("\\", "/"))
    time.sleep(2.0)
    b3 = body(2600)
    out.append("")
    out.append("==== lowdim-ingest-twod.html  errors=" + str(errs()))
    out.append("[64 仍在] 达成率: " + str("达成率" in b3))
    out.append("[64 仍在] .ic-bar: " + str(ev("!!document.querySelector('.ic-bar')")))

    c.open("file:///" + os.path.join(ROOT, "lowdim-database-twod.html").replace("\\", "/"))
    time.sleep(2.0)
    out.append("")
    out.append("==== lowdim-database-twod.html  errors=" + str(errs()))
    out.append("[64 仍在] .ic-dbbar: " + str(ev("!!document.querySelector('.ic-dbbar')")))
finally:
    c.close()

p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_verify_revert62_out.txt")
open(p, "w", encoding="utf-8").write("\n".join(out))
print("done ->", p)
