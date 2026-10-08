# -*- coding: utf-8 -*-
"""P0 改造冒烟：注入 62/63/64 后，渲染关键页面，检查报错 + 新 UI 是否出现 + 交互是否可用。"""
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cdp import Cdp

ROOT = r"C:/Users/Windows/Desktop/diwei"
out = []
c = Cdp()


def ev(expr):
    try:
        return c.evaluate(expr)
    except Exception as e:
        return {"__error__": str(e)[:300]}


def errs():
    return ev("JSON.stringify(window.__cdpErrors||[])")


def body(n=2000):
    return (ev("(document.body.innerText||'').slice(0,%d)" % n) or "")


def click(needle, scope=None):
    root = ("document.querySelector('%s')||document" % scope) if scope else "document"
    js = ("(function(){var b=Array.from((%s).querySelectorAll('button,[data-stdsys-view],"
          "[data-stdex-view],[data-ic-dbview]'))"
          ".filter(function(e){return (e.textContent||'').indexOf('%s')>=0;});"
          "if(b.length){b[0].click();return 'ok:'+b[0].tagName+':'+(b[0].getAttribute('data-stdsys-view')"
          "||b[0].getAttribute('data-stdex-view')||b[0].getAttribute('data-ic-dbview')||'');}"
          "return 'miss';})()" % (root, needle))
    return ev(js)


def cnt(sel):
    return ev("document.querySelectorAll('%s').length" % sel)


def txt_of(sel, n=1200):
    return (ev("(function(){var e=document.querySelector('%s');return e?(e.innerText||'').slice(0,%d):'NO-ELM';})()" % (sel, n)) or "")


def sec(title):
    out.append("")
    out.append("########## " + title)


try:
    # ---------- A 标准体系 ----------
    c.open("file:///" + os.path.join(ROOT, "standard-twod.html").replace("\\", "/"))
    time.sleep(1.5)
    sec("A. standard-twod.html  errors=" + str(errs()))
    out.append("[has 本库标准] " + str("本库标准" in body(4000)) + "  [has 引用国标] " + str("引用国标" in body(4000)))
    out.append("[.stdsys-viewbar] " + str(cnt(".stdsys-viewbar")) + " [.stdsys-stdtabs] " + str(cnt(".stdsys-stdtabs")))
    out.append("--- viewbar: " + txt_of(".stdsys-viewbar", 300).replace("\n", " | "))
    out.append("--- click 本库标准 -> " + str(click("本库标准")))
    time.sleep(1.2)
    out.append("[.stdsys-table after own] " + str(cnt(".stdsys-table")))
    out.append("--- stdtabs: " + txt_of(".stdsys-stdtabs", 300).replace("\n", " | "))
    out.append("--- 材料tab切换(电解质) -> " + str(click("电解质材料数据库标准", ".stdsys-stdtabs")))
    time.sleep(1.2)
    out.append("--- own view text:\n" + txt_of(".stdsys-card", 1600))
    out.append("--- click 引用国标 -> " + str(click("引用国标")))
    time.sleep(1.2)
    out.append("--- gb view text:\n" + (body(900)))

    # ---------- B 入库-二维 ----------
    c.open("file:///" + os.path.join(ROOT, "lowdim-ingest-twod.html").replace("\\", "/"))
    time.sleep(2.0)
    sec("B. lowdim-ingest-twod.html  errors=" + str(errs()))
    out.append("[has 达成率] " + str("达成率" in body(6000)))
    out.append("--- .ic-bar:\n" + txt_of(".ic-bar", 900))
    out.append("--- .ic-cards:\n" + txt_of(".ic-cards", 900))
    out.append("--- 资源加工 -> " + str(click("资源加工")))
    time.sleep(1.5)
    bt = body(3000)
    out.append("[has PRC-] " + str("PRC-" in bt))
    out.append("--- 加工环 text:\n" + bt[:2000])

    # ---------- C 标准化-二维 ----------
    c.open("file:///" + os.path.join(ROOT, "lowdim-standardization-twod.html").replace("\\", "/"))
    time.sleep(1.2)
    ev("try{localStorage.removeItem('lowdim_std_state_v1')}catch(e){}")
    c.open("file:///" + os.path.join(ROOT, "lowdim-standardization-twod.html").replace("\\", "/"))
    time.sleep(2.0)
    sec("C. lowdim-standardization-twod.html  errors=" + str(errs()))
    out.append("--- .stdex-bar:\n" + txt_of(".stdex-bar", 400).replace("\n", " | "))
    out.append("--- click 标准化执行 -> " + str(click("标准化执行")))
    time.sleep(1.5)
    ct = body(4000)
    out.append("[has HO-] " + str("HO-" in ct))
    out.append("[.stdex-table] " + str(cnt(".stdex-table")))
    out.append("--- 执行视图:\n" + ct[:2200])
    # 闭环动作：展开 → 执行比对 → 逐项回写 → 归档
    out.append("--- 展开 -> " + str(click("展开")))
    time.sleep(1.2)
    out.append("--- 执行比对 -> " + str(click("执行比对")))
    time.sleep(1.2)
    for i in range(4):
        r = click("自动回写标准值")
        time.sleep(0.9)
        out.append("    回写第%d次 -> %s" % (i + 1, r))
        if r == "miss":
            break
    out.append("--- 执行后:\n" + body(2600)[:1800])
    out.append("--- 归档 -> " + str(click("生成标准化数据包并归档")))
    time.sleep(1.5)
    out.append("--- click 输出与归档 -> " + str(click("输出与归档")))
    time.sleep(1.5)
    out.append("--- 归档视图:\n" + body(2400)[:1800])
    out.append("[ARCHIVE twod] " + str(ev("JSON.stringify((window.__STD_ARCHIVE__||{}).twod||[])")))
    out.append("--- click 标准规则库 -> " + str(click("标准规则库")))
    time.sleep(1.2)
    out.append("--- 规则库(回归检查):\n" + body(1200)[:1000])

    # ---------- D 标准化-电解质(专属名词) ----------
    c.open("file:///" + os.path.join(ROOT, "lowdim-standardization-electrolyte.html").replace("\\", "/"))
    time.sleep(2.0)
    sec("D. lowdim-standardization-electrolyte.html  errors=" + str(errs()))
    db = body(6000)
    out.append("[has 专属名词标准化] " + str("专属名词标准化" in db))
    out.append("[电解质 categories] " + str(ev("JSON.stringify((window.LOWDIM_STD_LIBRARY&&window.LOWDIM_STD_LIBRARY.electrolyte.categories||[]).map(function(c){return c.key+':'+c.name;}))")))
    out.append("--- click 专属名词标准化 -> " + str(click("专属名词标准化")))
    time.sleep(1.5)
    out.append("--- 名词标准化:\n" + body(1800)[:1500])

    # ---------- E 数据库-二维(入库记录) ----------
    c.open("file:///" + os.path.join(ROOT, "lowdim-database-twod.html").replace("\\", "/"))
    time.sleep(2.0)
    sec("E. lowdim-database-twod.html  errors=" + str(errs()))
    out.append("--- .ic-dbbar: " + txt_of(".ic-dbbar", 300).replace("\n", " | "))
    out.append("--- click 入库记录 -> " + str(click("入库记录")))
    time.sleep(1.5)
    et = body(4000)
    out.append("[has DS-] " + str("DS-" in et))
    out.append("--- 入库记录:\n" + et[:1800])

    # ---------- F 入库-催化(指标条) ----------
    c.open("file:///" + os.path.join(ROOT, "lowdim-ingest-catalyst.html").replace("\\", "/"))
    time.sleep(2.0)
    sec("F. lowdim-ingest-catalyst.html  errors=" + str(errs()))
    out.append("[has 达成率] " + str("达成率" in body(6000)))
    out.append("--- .ic-bar:\n" + txt_of(".ic-bar", 700))

    # ---------- G 全局对象 ----------
    sec("G. 全局对象")
    out.append("HANDOVER_QUEUE keys: " + str(ev("JSON.stringify(Object.keys(window.__STD_HANDOVER_QUEUE__||{}))")))
    out.append("ARCHIVE keys: " + str(ev("JSON.stringify(Object.keys(window.__STD_ARCHIVE__||{}))")))
    out.append("EXEC_LOGS keys: " + str(ev("JSON.stringify(Object.keys(window.__STD_EXEC_LOGS__||{}))")))
finally:
    c.close()

p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_smoke_p0_out.txt")
open(p, "w", encoding="utf-8").write("\n".join(out))
print("done ->", p)
