# -*- coding: utf-8 -*-
"""验证另外四类材料（有机光电 / 电解质 / 机器学习力场 / 催化）的采集加工处理页。

与 verify_rw.py（二维材料，166 项）互补：这里只跑四类材料的关键路径，
重点看「材料专属内容有没有真的按需求规格落地」+「三个页签能不能真的操作」。
"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cdp import Cdp

ROOT = "file:///C:/Users/Windows/Desktop/diwei/%s.html"

PAGES = [
    {
        "pid": "lowdim-ingest-opto", "key": "opto", "code": "OP", "name": "有机光电材料",
        "objects": ["基础信息对象", "物理性质对象", "表征图谱对象", "计算数据对象"],
        "openDb": "PubChem", "source": "PubChemPlugin", "calcOut": "LOG", "calcIn": "GJF",
        "reqField": "mw", "badVal": "-1", "badMsg": "分子量必须为正数",
        "dataType": "计算数据对象", "entryCode": "CAL",
        "procStep": "加工模型构建", "product": "OLED"
    },
    {
        "pid": "lowdim-ingest-electrolyte", "key": "electrolyte", "code": "EL", "name": "电解质材料",
        "objects": ["有机电解液对象", "固态有机电解质对象", "固态无机电解质对象"],
        "openDb": "Materials Project", "source": "MaterialsProjectPlugin", "calcOut": "OUTCAR", "calcIn": "INCAR",
        "reqField": "conductivity", "badVal": "9.9", "badMsg": "离子电导率超出合理范围",
        "dataType": "物性数据", "entryCode": "PHY",
        "procStep": "加工模型构建", "product": "高安全性电解液"
    },
    {
        "pid": "lowdim-ingest-mlff", "key": "mlff", "code": "ML", "name": "机器学习力场",
        "objects": ["有机小分子力场对象", "高分子力场对象", "蛋白质力场对象"],
        "openDb": "QM9", "source": "QM9Plugin", "calcOut": "PDB", "calcIn": "MDP",
        "reqField": "temperature", "badVal": "5000", "badMsg": "采样温度超出合理范围",
        "dataType": "有机小分子力场对象", "entryCode": "SM",
        "procStep": "加工模型构建", "product": "小分子高精度力场"
    },
    {
        "pid": "lowdim-ingest-catalyst", "key": "catalyst", "code": "CA", "name": "催化材料",
        "objects": ["催化表面分子吸附数据", "催化表面反应路径数据"],
        "openDb": "Catalysis-Hub", "source": "CatalysisHubPlugin", "calcOut": "OUTCAR", "calcIn": "INCAR",
        "reqField": "activationEnergy", "badVal": "-2", "badMsg": "活化能必须为正数",
        "dataType": "催化表面分子吸附数据", "entryCode": "ADS",
        "procStep": "加工模型构建", "product": "Cu 基 CO2RR"
    }
]

RESULTS = []


def check(name, cond, extra=""):
    RESULTS.append((name, bool(cond), extra))
    print(("PASS  " if cond else "FAIL  ") + name + (("   | " + str(extra)[:300]) if extra else ""))


def js(c, expr):
    return c.evaluate("(function(){ try { return (%s); } catch(e) { return '__ERR__' + e.message; } })()" % expr)


FILL_JS = r"""(function(){
  var fields = window.__rwDbg.fields();
  var ok = 0;
  fields.forEach(function (f) {
    var el = document.querySelector('#rwEntryMask [data-rw-ef="' + f.key + '"]');
    if (!el) return;
    var v;
    if (f.type === 'select') { el.selectedIndex = 0; el.dispatchEvent(new Event('change', {bubbles: true})); ok++; return; }
    if (f.rule === 'formula') v = 'H2O';
    else if (f.rule === 'coord') v = 'X 0.10 0.20 0.30';
    else if (f.rule === 'gap') v = '1.68';
    else if (f.rule === 'fe') v = '-1.20';
    else if (f.rule === 'pos' || f.rule === 'num') v = '1.50';
    else if (f.rule === 'range') v = (f.min != null ? String((Number(f.min) + (Number(f.max != null ? f.max : f.min + 10)) ) / 2) : '1');
    else v = '示例体系-' + f.key;
    el.value = v;
    el.dispatchEvent(new Event('input', {bubbles: true}));
    el.dispatchEvent(new Event('change', {bubbles: true}));
    ok++;
  });
  return ok;
})()"""


def run_page(c, p):
    pid = p["pid"]
    c.open(ROOT % pid)
    time.sleep(1.4)
    c.evaluate("window.prompt = function(){ return '1.68'; };")
    page = "#page-" + pid

    check("[%s] 无 JS 错误" % p["name"], js(c, "window.__cdpErrors.length") == 0,
          js(c, "JSON.stringify(window.__cdpErrors.slice(0,3))"))
    check("[%s] 新层已接管该页" % p["name"],
          js(c, "window.__rwDbg && window.__rwDbg.curPage()") == pid,
          js(c, "window.__rwDbg && window.__rwDbg.curPage()"))
    check("[%s] 配置键正确" % p["name"], js(c, "window.__rwDbg.curKey()") == p["key"],
          js(c, "window.__rwDbg.curKey()"))
    check("[%s] 标题正确" % p["name"],
          js(c, "document.querySelector('%s .rw-head h1').textContent" % page) == p["name"] + "数据采集加工处理",
          js(c, "document.querySelector('%s .rw-head h1').textContent" % page))

    # ---- 样式表必须按页独立注入（否则 #page-<其他页> 前缀的选择器全部落空） ----
    sid = "rw-ingest-%s-style-20260924" % pid
    check("[%s] 按页注入独立样式表" % p["name"], js(c, "!!document.getElementById('%s')" % sid),
          js(c, "JSON.stringify(Array.from(document.querySelectorAll('style[id^=\"rw-ingest-\"]')).map(function(s){return s.id;}))"))
    check("[%s] 样式表规则前缀为 #page-%s" % (p["name"], pid),
          str(js(c, "(function(){var s=document.getElementById('%s');"
                   " if(!s||!s.sheet||!s.sheet.cssRules.length) return '__NO_SHEET__';"
                   " for (var i=0;i<s.sheet.cssRules.length;i++){ var t=s.sheet.cssRules[i].selectorText;"
                   " if (t && t.indexOf('.rw-flow-node')>=0) return t; } return '__NORULE__'; })()" % sid)
          ).startswith("#page-" + pid),
          js(c, "(function(){var s=document.getElementById('%s');"
                " if(!s||!s.sheet||!s.sheet.cssRules.length) return '__NO_SHEET__';"
                " for (var i=0;i<s.sheet.cssRules.length;i++){ var t=s.sheet.cssRules[i].selectorText;"
                " if (t && t.indexOf('.rw-flow-node')>=0) return t; } return '__NORULE__'; })()" % sid))
    check("[%s] 卡片背景样式已生效" % p["name"],
          js(c, "getComputedStyle(document.querySelector('%s .rw-card')).backgroundColor" % page) == "rgb(255, 255, 255)",
          js(c, "getComputedStyle(document.querySelector('%s .rw-card')).backgroundColor" % page))

    # ---- 页签 ----
    tabs = json.loads(js(c, "JSON.stringify(Array.from(document.querySelectorAll('%s .rw-tab')).map(function(b){return b.textContent.replace(/[0-9]+$/,'').trim();}))" % page) or "[]")
    check("[%s] 三页签：资源采集 / 资源录入 / 资源加工" % p["name"], tabs == ["资源采集", "资源录入", "资源加工"], tabs)
    check("[%s] 默认展示资源采集" % p["name"],
          js(c, "document.querySelector('%s .rw-tab.is-active').getAttribute('data-rw-tab')" % page) == "collect")
    cols = json.loads(js(c, "JSON.stringify(Array.from(document.querySelectorAll('%s .rw-card table thead th')).map(function(t){return t.textContent.trim();}))" % page) or "[]")
    check("[%s] 采集列表字段正确" % p["name"], cols == ["采集ID", "采集任务名称", "采集方式", "采集说明", "操作"], cols)
    ids = json.loads(js(c, "JSON.stringify(Array.from(document.querySelectorAll('%s .rw-card table tbody tr td:first-child')).map(function(t){return t.textContent.trim();}))" % page) or "[]")
    check("[%s] 采集 ID 前缀为 %s-CL" % (p["name"], p["code"]),
          len(ids) == 3 and all(i.startswith(p["code"] + "-CL-") for i in ids), ids)

    # ---- 资源对象介绍 ----
    js(c, "document.querySelector('%s [data-rw-act=\"open-create\"]').click()" % page)
    time.sleep(0.4)
    js(c, "document.querySelector('#rwMask [data-rw-act=\"intro\"]').click()")
    time.sleep(0.45)
    intro = js(c, "document.getElementById('rwIntroMask').innerText")
    for o in p["objects"]:
        check("[%s] 资源对象介绍含「%s」" % (p["name"], o), o in intro)
    js(c, "document.querySelector('#rwIntroMask [data-rw-act=\"close-intro\"]').click()")
    time.sleep(0.25)

    # ---- 开源数据库（步骤 2）----
    js(c, "document.querySelector('#rwMask [data-rw-f=\"name\"]').value='验证任务'")
    js(c, "document.querySelector('#rwMask [data-rw-act=\"next\"]').click()")
    time.sleep(0.45)
    body = js(c, "document.getElementById('rwMask').innerText")
    check("[%s] 开源数据库列表含 %s" % (p["name"], p["openDb"]), p["openDb"] in body, body[:160])
    # 数据计算：输出 / 输入文件
    js(c, "document.querySelector('#rwMask [data-rw-f=\"method\"][value=\"calc\"]').click()")
    time.sleep(0.4)
    outs = json.loads(js(c, "JSON.stringify(Array.from(document.querySelectorAll('#rwMask [data-rw-f=\"calcOut\"]')).map(function(x){return x.value;}))") or "[]")
    check("[%s] 计算输出文件含 %s" % (p["name"], p["calcOut"]), p["calcOut"] in outs, outs)
    js(c, "document.querySelector('#rwMask [data-rw-f=\"calcOut\"][value=\"%s\"]').click()" % p["calcOut"])
    time.sleep(0.3)
    js(c, "document.querySelector('#rwMask [data-rw-act=\"calc-demo-files\"]').click()")
    time.sleep(0.35)
    body2 = js(c, "document.getElementById('rwMask').innerText")
    check("[%s] 计算输入文件含 %s" % (p["name"], p["calcIn"]), p["calcIn"] in body2, body2[:200])
    js(c, "document.querySelector('#rwMask [data-rw-act=\"run-collect\"]').click()")
    time.sleep(2.6)
    body3 = js(c, "document.getElementById('rwMask').innerText")
    check("[%s] 生成合规性校验报告" % p["name"], "合规性校验" in body3, body3[:160])
    js(c, "document.querySelector('#rwMask [data-rw-act=\"close-create\"]').click()")
    time.sleep(0.3)

    # ---- 资源录入 ----
    js(c, "document.querySelector('%s .rw-tab[data-rw-tab=\"entry\"]').click()" % page)
    time.sleep(0.45)
    srcNames = js(c, "document.querySelector('%s .rw-body').innerText" % page)
    check("[%s] 录入来源表含该类插件/来源" % p["name"], p["source"].replace("Plugin", "") in srcNames or p["openDb"] in srcNames)
    check("[%s] 录入来源表 5 行" % p["name"],
          js(c, "document.querySelectorAll('%s .rw-source-table tbody tr').length" % page) == 5)

    js(c, "document.querySelector('%s [data-rw-act=\"entry-manual\"]').click()" % page)
    time.sleep(0.45)
    check("[%s] 单条录入弹窗打开" % p["name"], js(c, "!!document.getElementById('rwEntryMask')"))
    n = js(c, FILL_JS)
    time.sleep(0.35)
    check("[%s] 录入表单已填充 %s 个字段" % (p["name"], n), isinstance(n, int) and n >= 6, n)

    # 故意填错一个必填项，验证材料专属校验文案
    js(c, "(function(){var el=document.querySelector('#rwEntryMask [data-rw-ef=\"%s\"]'); el.value=%s; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true}));})()" % (p["reqField"], json.dumps(p["badVal"])))
    time.sleep(0.3)
    check("[%s] 字段校验文案：%s" % (p["name"], p["badMsg"]),
          p["badMsg"] in str(js(c, "document.getElementById('rwEntryMask').innerHTML")),
          js(c, "document.querySelector('#rwEntryMask .rw-field-tip.rw-error') && document.querySelector('#rwEntryMask .rw-field-tip.rw-error').textContent"))
    js(c, FILL_JS)
    time.sleep(0.3)
    js(c, "(function(){var el=document.querySelector('#rwEntryMask [data-rw-ef=\"dataType\"]'); el.value=%s; el.dispatchEvent(new Event('change',{bubbles:true}));})()" % json.dumps(p["dataType"]))
    time.sleep(0.3)

    js(c, "document.querySelector('#rwEntryMask [data-rw-act=\"entry-submit\"]').click()")
    time.sleep(0.6)
    rid = js(c, "(document.querySelector('%s .rw-audit-table tbody tr td.rw-id')||{}).textContent" % page)
    check("[%s] 生成材料唯一标识 %s-%s-" % (p["name"], p["code"], p["entryCode"]),
          bool(rid) and str(rid).startswith(p["code"] + "-" + p["entryCode"] + "-"), rid)

    js(c, "document.querySelector('[data-rw-act=\"audit-auto\"]').click()")
    time.sleep(0.35)
    js(c, "document.querySelector('[data-rw-act=\"audit-first-ok\"]').click()")
    time.sleep(0.35)
    js(c, "document.querySelector('[data-rw-act=\"audit-final-ok\"]').click()")
    time.sleep(0.45)
    check("[%s] 终审通过后审核队列清空" % p["name"],
          js(c, "document.querySelectorAll('%s .rw-audit-table tbody tr').length" % page) == 0)
    js(c, "document.querySelector('[data-rw-act=\"entry-view\"][data-view=\"done\"]').click()")
    time.sleep(0.4)
    check("[%s] 已入库数据视图含该记录" % p["name"],
          js(c, "document.querySelectorAll('%s .rw-done-table tbody tr').length" % page) == 1,
          js(c, "(document.querySelector('%s .rw-done-table tbody tr')||{}).innerText" % page))

    # ---- 资源加工 ----
    js(c, "document.querySelector('%s .rw-tab[data-rw-tab=\"process\"]').click()" % page)
    time.sleep(0.45)
    nodes = json.loads(js(c, "JSON.stringify(Array.from(document.querySelectorAll('%s .rw-flow-node .rw-flow-name')).map(function(n){return n.textContent.trim();}))" % page) or "[]")
    check("[%s] 加工流程 6 步且第 4 步为「%s」" % (p["name"], p["procStep"]),
          len(nodes) == 6 and nodes[3] == p["procStep"], nodes)
    # 上面这条只看 DOM；这里补一条「样式真的糊上去了」的：前缀选择器命中则 border 为 1px
    check("[%s] 流程节点样式已生效（前缀选择器命中）" % p["name"],
          js(c, "getComputedStyle(document.querySelector('%s .rw-flow-node')).borderTopWidth" % page) == "1px",
          js(c, "JSON.stringify((function(){var s=getComputedStyle(document.querySelector('%s .rw-flow-node'));"
                "return {border:s.borderTopWidth, display:s.display, align:s.textAlign};})())" % page))
    check("[%s] 流程节点横向排列" % p["name"],
          js(c, "getComputedStyle(document.querySelector('%s .rw-flow')).flexDirection" % page) == "row",
          js(c, "getComputedStyle(document.querySelector('%s .rw-flow')).flexDirection" % page))

    js(c, "document.querySelector('[data-rw-act=\"proc-new\"]').click()")
    time.sleep(0.5)
    check("[%s] 加工向导弹窗打开" % p["name"], js(c, "!!document.getElementById('rwProcMask')"))
    js(c, "(function(){var el=document.querySelector('#rwProcMask [data-rw-pf=\"name\"]'); el.value='验证加工任务'; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true}));})()")
    time.sleep(0.2)
    js(c, "document.querySelectorAll('#rwProcMask [data-rw-pf=\"source\"]').forEach(function(el){ if(!el.checked) el.click(); })")
    time.sleep(0.25)
    js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-run-1\"]').click()")
    time.sleep(0.4)
    check("[%s] 步骤1 执行后标记完成" % p["name"],
          js(c, "!!document.querySelector('#rwProcMask .rw-stepbar-item.is-done')"))
    for step in (2, 3, 4, 5, 6):
        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-next\"]').click()")
        time.sleep(0.4)
        if step == 4:
            js(c, "document.querySelector('#rwProcMask [data-rw-pf=\"model\"][value=\"stat\"]').click()")
            time.sleep(0.3)
        if step == 5:
            js(c, "document.querySelector('#rwProcMask [data-rw-pf=\"product\"][value=\"ai\"]').click()")
            time.sleep(0.3)
        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-run-%d\"]').click()" % step)
        time.sleep(0.45)
        if step == 3:
            check("[%s] 步骤3 后版本推进 V1.0" % p["name"],
                  "V1.0" in str(js(c, "document.querySelector('#rwProcMask .rw-modal-head').innerHTML")))
        if step == 5:
            check("[%s] 步骤5 后版本推进 V2.0" % p["name"],
                  "V2.0" in str(js(c, "document.querySelector('#rwProcMask .rw-modal-head').innerHTML")))
    js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-finish\"]').click()")
    time.sleep(0.5)
    check("[%s] 加工完成并回到任务列表" % p["name"],
          js(c, "!document.getElementById('rwProcMask')") and "V2.0" in str(js(c, "document.querySelector('%s .rw-body').innerText" % page)))

    # ---- 加工规范说明按需求规格落地 ----
    js(c, "document.querySelector('[data-rw-act=\"proc-view\"][data-view=\"spec\"]').click()")
    time.sleep(0.45)
    spec = js(c, "document.querySelector('%s .rw-body').innerText" % page)
    check("[%s] 加工规范说明含该产品示例「%s」" % (p["name"], p["product"]), p["product"] in spec)

    # ---- 无横向溢出 ----
    for w in (1920, 1440, 1280):
        c.send("Emulation.setDeviceMetricsOverride", {"width": w, "height": 900, "deviceScaleFactor": 1, "mobile": False})
        time.sleep(0.35)
        sw = js(c, "document.body.scrollWidth")
        cw = js(c, "document.documentElement.clientWidth")
        check("[%s] 宽度 %d 无横向溢出" % (p["name"], w), sw <= cw + 2, "%s vs %s" % (sw, cw))
    c.send("Emulation.clearDeviceMetricsOverride", {})

    check("[%s] 最终无 JS 错误" % p["name"], js(c, "window.__cdpErrors.length") == 0,
          js(c, "JSON.stringify(window.__cdpErrors.slice(0,3))"))


def main():
    c = Cdp()
    try:
        for p in PAGES:
            print("\n========== %s（%s） ==========" % (p["name"], p["pid"]))
            run_page(c, p)
    finally:
        c.close()
    bad = [r for r in RESULTS if not r[1]]
    print("\n==== 共 %d 项，通过 %d，失败 %d" % (len(RESULTS), len(RESULTS) - len(bad), len(bad)))
    for r in bad:
        print("  FAIL:", r[0], "|", str(r[2])[:200])


if __name__ == "__main__":
    main()
