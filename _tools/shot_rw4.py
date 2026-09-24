# -*- coding: utf-8 -*-
"""对四类新材料（有机光电 / 电解质 / 机器学习力场 / 催化）的采集·录入·加工页截图。

每张图 = 一个「真的能操作」的状态，不只是静态展示。
"""
import base64, json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cdp import Cdp

ROOT = "file:///C:/Users/Windows/Desktop/diwei/%s.html"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "preview_rw4")

PAGES = [
    {"pid": "lowdim-ingest-opto", "dir": "1_有机光电材料", "name": "有机光电材料",
     "openDb": "PubChem", "calcOut": "LOG", "dataType": "计算数据对象"},
    {"pid": "lowdim-ingest-electrolyte", "dir": "2_电解质材料", "name": "电解质材料",
     "openDb": "Materials Project", "calcOut": "OUTCAR", "dataType": "物性数据"},
    {"pid": "lowdim-ingest-mlff", "dir": "3_机器学习力场", "name": "机器学习力场",
     "openDb": "QM9", "calcOut": "PDB", "dataType": "有机小分子力场对象"},
    {"pid": "lowdim-ingest-catalyst", "dir": "4_催化材料", "name": "催化材料",
     "openDb": "Catalysis-Hub", "calcOut": "OUTCAR", "dataType": "催化表面分子吸附数据"},
]

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
    else if (f.rule === 'range') v = (f.min != null ? String((Number(f.min) + Number(f.max != null ? f.max : Number(f.min) + 10)) / 2) : '1');
    else v = '示例体系-' + f.key;
    el.value = v;
    el.dispatchEvent(new Event('input', {bubbles: true}));
    el.dispatchEvent(new Event('change', {bubbles: true}));
    ok++;
  });
  return ok;
})()"""


def js(c, expr):
    return c.evaluate("(function(){ try { return (%s); } catch(e) { return '__ERR__' + e.message; } })()" % expr)


def shot(c, subdir, name, full=True):
    d = os.path.join(OUT, subdir)
    if not os.path.isdir(d):
        os.makedirs(d)
    params = {"format": "png"}
    if full:
        params["captureBeyondViewport"] = True
    r = c.send("Page.captureScreenshot", params)
    data = r.get("result", {}).get("data")
    if not data:
        print("shot fail", name, json.dumps(r)[:200])
        return
    p = os.path.join(d, name + ".png")
    with open(p, "wb") as f:
        f.write(base64.b64decode(data))
    print("shot:", p)


def tab(c, pid, key):
    js(c, "document.querySelector('#page-%s .rw-tab[data-rw-tab=\"%s\"]').click()" % (pid, key))
    time.sleep(0.5)


def subview(c, view, prefix):
    js(c, "document.querySelector('[data-rw-act=\"%s-view\"][data-view=\"%s\"]').click()" % (prefix, view))
    time.sleep(0.45)


def run(c, p):
    pid, sub, name = p["pid"], p["dir"], p["name"]
    c.open(ROOT % pid)
    time.sleep(1.5)
    c.send("Emulation.setDeviceMetricsOverride", {"width": 1600, "height": 1000, "deviceScaleFactor": 1, "mobile": False})
    c.evaluate("window.prompt = function(){ return '1.68'; };")
    page = "#page-" + pid

    # ---------- 资源采集 ----------
    shot(c, sub, "01_资源采集列表")

    js(c, "document.querySelector('%s [data-rw-act=\"open-create\"]').click()" % page)
    time.sleep(0.5)
    js(c, "document.querySelector('#rwMask [data-rw-act=\"intro\"]').click()")
    time.sleep(0.5)
    shot(c, sub, "02_数据资源对象介绍弹窗")
    js(c, "document.querySelector('#rwIntroMask [data-rw-act=\"close-intro\"]').click()")
    time.sleep(0.3)

    js(c, "document.querySelector('#rwMask [data-rw-f=\"name\"]').value='%s数据采集任务'" % name)
    js(c, "document.querySelector('#rwMask [data-rw-act=\"next\"]').click()")
    time.sleep(0.5)
    js(c, "document.querySelectorAll('#rwMask .rw-ds input')[0].click()")
    time.sleep(0.45)
    shot(c, sub, "03_创建任务_步骤2_开源数据获取")

    js(c, "document.querySelector('#rwMask [data-rw-act=\"run-collect\"]').click()")
    time.sleep(3.2)
    shot(c, sub, "04_创建任务_步骤2_采集执行结果")

    # 数据计算
    js(c, "document.querySelector('#rwMask [data-rw-f=\"method\"][value=\"calc\"]').click()")
    time.sleep(0.45)
    js(c, "document.querySelector('#rwMask [data-rw-f=\"calcOut\"][value=\"%s\"]').click()" % p["calcOut"])
    time.sleep(0.35)
    js(c, "document.querySelector('#rwMask [data-rw-act=\"calc-demo-files\"]').click()")
    time.sleep(0.4)
    shot(c, sub, "05_创建任务_步骤2_数据计算_上传后")
    js(c, "document.querySelector('#rwMask [data-rw-act=\"run-collect\"]').click()")
    time.sleep(3.0)
    shot(c, sub, "06_创建任务_数据计算_合规性校验报告")
    js(c, "document.querySelector('#rwMask [data-rw-act=\"close-create\"]').click()")
    time.sleep(0.3)

    js(c, "document.querySelector('%s .rw-card table tbody tr .rw-op').click()" % page)
    time.sleep(0.5)
    shot(c, sub, "07_任务详情弹窗")
    js(c, "document.querySelector('#rwDetailMask [data-rw-act=\"close-detail\"]').click()")
    time.sleep(0.3)

    # ---------- 资源录入 ----------
    tab(c, pid, "entry")
    shot(c, sub, "08_资源录入_工作台_待录入数据")

    js(c, "document.querySelector('%s [data-rw-act=\"entry-manual\"]').click()" % page)
    time.sleep(0.5)
    js(c, FILL_JS)
    time.sleep(0.4)
    shot(c, sub, "09_资源录入_单条录入_字段填写")

    # 故意错一个必填项，看材料专属校验
    js(c, "(function(){var els=document.querySelectorAll('#rwEntryMask [data-rw-ef]');"
          " for (var i=0;i<els.length;i++){ var el=els[i];"
          " if (el.getAttribute('data-rw-ef')!=='dataType' && el.tagName==='INPUT'){ "
          " el.value='-9999'; el.dispatchEvent(new Event('input',{bubbles:true}));"
          " el.dispatchEvent(new Event('change',{bubbles:true})); } } })()")
    time.sleep(0.4)
    shot(c, sub, "10_资源录入_单条录入_字段校验报错")
    js(c, FILL_JS)
    time.sleep(0.35)
    js(c, "(function(){var el=document.querySelector('#rwEntryMask [data-rw-ef=\"dataType\"]');"
          " if(el){ el.value=%s; el.dispatchEvent(new Event('change',{bubbles:true})); }})()"
       % json.dumps(p["dataType"], ensure_ascii=False))
    time.sleep(0.3)
    js(c, "document.querySelector('#rwEntryMask [data-rw-act=\"entry-submit\"]').click()")
    time.sleep(0.7)
    shot(c, sub, "11_资源录入_录入审核_待审核")
    js(c, "document.querySelector('[data-rw-act=\"audit-auto\"]').click()")
    time.sleep(0.35)
    js(c, "document.querySelector('[data-rw-act=\"audit-first-ok\"]').click()")
    time.sleep(0.4)
    shot(c, sub, "12_资源录入_录入审核_流转中")
    js(c, "document.querySelector('[data-rw-act=\"audit-final-ok\"]').click()")
    time.sleep(0.5)
    subview(c, "done", "entry")
    shot(c, sub, "13_资源录入_已入库数据")

    subview(c, "todo", "entry")
    js(c, "document.querySelector('[data-rw-act=\"entry-batch\"]').click()")
    time.sleep(0.5)
    shot(c, sub, "14_资源录入_批量导入_步骤1选来源")
    js(c, "document.querySelector('#rwBatchMask [data-rw-act=\"batch-next\"]').click()")
    time.sleep(0.3)
    js(c, "document.querySelector('#rwBatchMask [data-rw-act=\"batch-demo-files\"]').click()")
    time.sleep(0.35)
    js(c, "document.querySelector('#rwBatchMask [data-rw-act=\"batch-parse\"]').click()")
    time.sleep(3.4)
    shot(c, sub, "15_资源录入_批量导入_解析映射")
    js(c, "document.querySelector('#rwBatchMask [data-rw-act=\"batch-close\"]') && document.querySelector('#rwBatchMask [data-rw-act=\"batch-close\"]').click()")
    time.sleep(0.3)

    subview(c, "spec", "entry")
    shot(c, sub, "16_资源录入_录入规范说明")

    # ---------- 资源加工 ----------
    tab(c, pid, "process")
    shot(c, sub, "17_资源加工_工作台与流程总览")

    js(c, "document.querySelector('[data-rw-act=\"proc-new\"]').click()")
    time.sleep(0.5)
    js(c, "(function(){var el=document.querySelector('#rwProcMask [data-rw-pf=\"name\"]');"
          " el.value='%s数据产品加工'; el.dispatchEvent(new Event('input',{bubbles:true}));})()" % name)
    time.sleep(0.2)
    js(c, "document.querySelectorAll('#rwProcMask [data-rw-pf=\"source\"]').forEach(function(el){ if(!el.checked) el.click(); })")
    time.sleep(0.3)
    shot(c, sub, "18_加工向导_步骤1_数据策划")
    js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-run-1\"]').click()")
    time.sleep(0.5)

    js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-next\"]').click()")
    time.sleep(0.4)
    js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-run-2\"]').click()")
    time.sleep(0.5)
    shot(c, sub, "19_加工向导_步骤2_基础数据筛选")

    js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-next\"]').click()")
    time.sleep(0.4)
    js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-run-3\"]').click()")
    time.sleep(0.5)
    shot(c, sub, "20_加工向导_步骤3_标准化预处理_V1.0")

    js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-next\"]').click()")
    time.sleep(0.4)
    js(c, "document.querySelector('#rwProcMask [data-rw-pf=\"model\"][value=\"stat\"]').click()")
    time.sleep(0.3)
    js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-run-4\"]').click()")
    time.sleep(0.5)
    shot(c, sub, "21_加工向导_步骤4_数据加工")

    js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-next\"]').click()")
    time.sleep(0.4)
    js(c, "document.querySelector('#rwProcMask [data-rw-pf=\"product\"][value=\"ai\"]').click()")
    time.sleep(0.3)
    js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-run-5\"]').click()")
    time.sleep(0.5)
    shot(c, sub, "22_加工向导_步骤5_产品生产_V2.0")

    js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-next\"]').click()")
    time.sleep(0.4)
    js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-run-6\"]').click()")
    time.sleep(0.5)
    shot(c, sub, "23_加工向导_步骤6_质量评价")
    js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-finish\"]').click()")
    time.sleep(0.6)
    shot(c, sub, "24_资源加工_任务列表含进度与版本")

    js(c, "document.querySelector('[data-rw-act=\"proc-report\"]').click()")
    time.sleep(0.5)
    shot(c, sub, "25_加工报告")
    js(c, "document.querySelector('[data-rw-act=\"proc-report-close\"]').click()")
    time.sleep(0.3)

    subview(c, "spec", "proc")
    shot(c, sub, "26_资源加工_加工规范说明")


def main():
    c = Cdp()
    try:
        for p in PAGES:
            print("\n====== %s ======" % p["name"])
            run(c, p)
    finally:
        c.close()


if __name__ == "__main__":
    main()
