# -*- coding: utf-8 -*-
"""验证闭环补充层在 5 个采集加工页上的落地情况（只读 + 一次点击交互）。"""
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cdp import Cdp  # noqa: E402

ROOT = r"C:\Users\Windows\Desktop\diwei"

PAGES = [
    ("lowdim-ingest-twod", "page-lowdim-ingest-twod", "二维"),
    ("lowdim-ingest-opto", "page-lowdim-ingest-opto", "有机光电"),
    ("lowdim-ingest-electrolyte", "page-lowdim-ingest-electrolyte", "电解质"),
    ("lowdim-ingest-mlff", "page-lowdim-ingest-mlff", "机器学习力场"),
    ("lowdim-ingest-catalyst", "page-lowdim-ingest-catalyst", "催化"),
]

WANT_COLLECT = ["采集批次与来源追溯", "采集分片状态与数量守恒", "采集异常单",
                "数据审核与整合", "数据更新策略", "数据录入统计"]
WANT_ENTRY = ["数据资源录入权限", "数据录入审批", "操作工单备案",
              "定期备份", "质量控制", "字段状态与证据类型"]
WANT_PROC = ["加工返工与定向退回", "加工产物交接（对外出口）"]

PROBE = r"""
(function(pid, want){
  var el = document.getElementById(pid);
  var txt = el ? (el.innerText || '') : '';
  function has(s){ return txt.indexOf(s) >= 0; }
  var out = {
    h1: '',
    cards: [],
    missing: [],
    secBtn: !!(el && el.querySelector('[data-twod-security-guide]')),
    conserveOk: txt.indexOf('数量守恒校验通过') >= 0,
    sourceId: txt.indexOf('source_id') >= 0,
    sha: txt.indexOf('SHA-256') >= 0,
    errors: (window.__cdpErrors || []).slice(0, 6)
  };
  if (el) {
    var hs = el.querySelectorAll('h1');
    if (hs.length) out.h1 = hs[0].innerText.trim();
    var cs = el.querySelectorAll('.rw-card-head h3');
    for (var i = 0; i < cs.length; i++) out.cards.push(cs[i].innerText.trim());
  }
  want.forEach(function(w){ if (!has(w)) out.missing.push(w); });
  return JSON.stringify(out);
})(%s, %s)
"""

CLICK = r"""
(function(pid, sel){
  var el = document.getElementById(pid);
  var n = el ? el.querySelector(sel) : null;
  if (!n) return JSON.stringify({clicked: false});
  n.click();
  return JSON.stringify({clicked: true});
})(%s, %s)
"""

AFTER_RETRY = r"""
(function(pid){
  var el = document.getElementById(pid);
  var txt = el ? (el.innerText || '') : '';
  return JSON.stringify({
    conserveOk: txt.indexOf('数量守恒校验通过') >= 0,
    retried: txt.indexOf('重试已完成') >= 0,
    toast: (window.__rwToastLog && window.__rwToastLog.length)
      ? window.__rwToastLog[window.__rwToastLog.length - 1].msg : '',
    issueLeft: (txt.match(/存在未闭环异常单 (\d+) 条/) || [])[1] || '0',
    errors: (window.__cdpErrors || []).slice(0, 6)
  });
})(%s)
"""


def probe(c, pid, want):
    val = c.evaluate(PROBE % ('"' + pid + '"', json.dumps(want, ensure_ascii=False)))
    try:
        return json.loads(val)
    except Exception:
        return {"raw": val}


def main():
    c = Cdp()
    try:
        for name, pid, label in PAGES:
            url = "file:///" + os.path.join(ROOT, name + ".html").replace("\\", "/")
            c.send("Page.enable")
            c.send("Runtime.enable")
            c.send("Page.navigate", {"url": url})
            time.sleep(5.0)
            print("=" * 72)
            print("【%s】 %s" % (label, name))

            d = probe(c, pid, WANT_COLLECT)
            print("  h1              : %s" % d.get("h1"))
            print("  安全等级按钮     : %s" % d.get("secBtn"))
            print("  source_id/SHA   : %s / %s" % (d.get("sourceId"), d.get("sha")))
            print("  数量守恒校验通过 : %s" % d.get("conserveOk"))
            print("  采集环缺失卡片   : %s" % (d.get("missing") or "无"))
            print("  errors          : %s" % (d.get("errors") or "无"))

            c.evaluate(CLICK % ('"' + pid + '"', '"[data-rw-act=\\"tab\\"][data-rw-tab=\\"entry\\"]"'))
            time.sleep(1.2)
            d2 = probe(c, pid, WANT_ENTRY)
            print("  录入环缺失卡片   : %s" % (d2.get("missing") or "无"))
            print("  errors          : %s" % (d2.get("errors") or "无"))

            c.evaluate(CLICK % ('"' + pid + '"', '"[data-rw-act=\\"tab\\"][data-rw-tab=\\"process\\"]"'))
            time.sleep(1.2)
            d3 = probe(c, pid, WANT_PROC)
            print("  加工环缺失卡片   : %s" % (d3.get("missing") or "无"))
            print("  errors          : %s" % (d3.get("errors") or "无"))

            # 回到采集页，点一次「定向重试」，验证异常单闭环
            c.evaluate(CLICK % ('"' + pid + '"', '"[data-rw-act=\\"tab\\"][data-rw-tab=\\"collect\\"]"'))
            time.sleep(1.2)
            before = c.evaluate(AFTER_RETRY % ('"' + pid + '"',))
            c.evaluate(CLICK % ('"' + pid + '"', '"[data-rw-act=\\"shard-retry\\"]"'))
            time.sleep(1.2)
            after = c.evaluate(AFTER_RETRY % ('"' + pid + '"',))
            try:
                b = json.loads(before)
                a = json.loads(after)
                print("  重试前 异常单数   : %s" % b.get("issueLeft"))
                print("  重试后 异常单数   : %s" % a.get("issueLeft"))
                print("  重试标记出现      : %s" % a.get("retried"))
                print("  守恒仍通过        : %s" % a.get("conserveOk"))
                print("  toast            : %s" % a.get("toast"))
                print("  errors           : %s" % (a.get("errors") or "无"))
            except Exception:
                print("  raw before:", before)
                print("  raw after :", after)
            print()
    finally:
        c.close()


if __name__ == "__main__":
    main()
