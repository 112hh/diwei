# -*- coding: utf-8 -*-
"""重构后的交互闭环验证：按钮存在性 + 子页签联动 + 交接/审批动作。"""
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cdp import Cdp  # noqa: E402

ROOT = r"C:\Users\Windows\Desktop\diwei"
PAGES = [
    ("lowdim-ingest-twod", "二维"),
    ("lowdim-ingest-opto", "有机光电"),
    ("lowdim-ingest-electrolyte", "电解质"),
    ("lowdim-ingest-mlff", "机器学习力场"),
    ("lowdim-ingest-catalyst", "催化"),
]

TXT = '(function(pid){var el=document.getElementById(pid);return JSON.stringify({t:(el?(el.innerText||""):"").slice(0,6000)});})("%s")'
CLICK = '(function(pid,sel){var el=document.getElementById(pid);var n=el?el.querySelector(sel):null;if(!n)return "NO_NODE";n.click();return "OK";})("%s",%s)'
ERR = 'JSON.stringify((window.__cdpErrors||[]).slice(0,5))'


def txt(c, pid):
    v = c.evaluate(TXT % pid)
    try:
        return json.loads(v).get("t", "")
    except Exception:
        return ""


def click(c, pid, sel):
    return c.evaluate(CLICK % (pid, json.dumps(sel, ensure_ascii=False)))


def main():
    c = Cdp()
    ok_all = True
    try:
        c.send("Page.enable")
        c.send("Runtime.enable")
        for name, label in PAGES:
            c.send("Page.navigate", {"url": "file:///" + os.path.join(ROOT, name + ".html").replace("\\", "/")})
            time.sleep(5)
            pid = "page-" + name
            print("=" * 70)
            print("【%s】 %s" % (label, name))

            # --- 采集页 ---
            t = txt(c, pid)
            has_create = "创建任务" in t
            has_sub = "来源追溯" in t and "分片状态" in t and "异常单（" in t
            print("  采集页  创建任务按钮 : %s" % has_create)
            print("  采集页  三类子页签   : %s" % has_sub)
            if not (has_create and has_sub):
                ok_all = False

            # 切到分片状态
            click(c, pid, '[data-rw-act="collect-view"][data-view="shard"]')
            time.sleep(1.0)
            t2 = txt(c, pid)
            print("  分片子页签 含守恒结论 : %s" % ("数量守恒校验" in t2))
            # 切到异常单
            click(c, pid, '[data-rw-act="collect-view"][data-view="issue"]')
            time.sleep(1.0)
            t3 = txt(c, pid)
            print("  异常单子页签 有内容   : %s" % ("异常单号" in t3 or "无未闭环异常单" in t3))

            # --- 录入页：规范说明子页签 ---
            click(c, pid, '[data-rw-act="tab"][data-rw-tab="entry"]')
            time.sleep(1.2)
            t4 = txt(c, pid)
            print("  录入待办页 无规范卡   : %s" % ("数据资源录入权限" not in t4))
            click(c, pid, '[data-rw-act="entry-view"][data-view="spec"]')
            time.sleep(1.2)
            t5 = txt(c, pid)
            print("  录入规范页 有权限卡   : %s" % ("数据资源录入权限" in t5))
            # 提交权限申请
            r = click(c, pid, '[data-rw-act="entry-apply-perm"]')
            time.sleep(1.2)
            t6 = txt(c, pid)
            print("  提交权限申请 %-6s : %s" % (r, "权限申请已提交" in t6 or "申请已提交" in t6))

            # --- 加工页：发起交接 ---
            click(c, pid, '[data-rw-act="tab"][data-rw-tab="process"]')
            time.sleep(1.2)
            t7 = txt(c, pid)
            print("  加工任务页 有交接表   : %s" % ("加工产物交接" in t7))
            r2 = click(c, pid, '[data-rw-act="proc-handoff"]')
            time.sleep(1.2)
            t8 = txt(c, pid)
            print("  发起交接   %-6s : %s" % (r2, "已交接（HO-" in t8))
            # 规范页含返工规则
            click(c, pid, '[data-rw-act="proc-view"][data-view="spec"]')
            time.sleep(1.2)
            t9 = txt(c, pid)
            print("  加工规范页 有返工表   : %s" % ("加工返工与定向退回" in t9))

            errs = c.evaluate(ERR)
            print("  errors               : %s" % errs)
            if errs and errs != "[]":
                ok_all = False
            print()
        print("总体:", "PASS" if ok_all else "有未通过项")
    finally:
        c.close()


if __name__ == "__main__":
    main()
