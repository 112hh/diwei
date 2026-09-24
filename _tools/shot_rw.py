# -*- coding: utf-8 -*-
"""对重构后的页面关键状态截图（含资源录入 / 资源加工 可操作工作台）。"""
import base64, json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cdp import Cdp

URL = "file:///C:/Users/Windows/Desktop/diwei/lowdim-ingest-twod.html"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "preview_rw")


def js(c, expr):
    return c.evaluate("(function(){ try { return (%s); } catch(e) { return '__ERR__' + e.message; } })()" % expr)


def shot(c, name, full=True):
    if not os.path.isdir(OUT):
        os.makedirs(OUT)
    params = {"format": "png"}
    if full:
        params["captureBeyondViewport"] = True
    r = c.send("Page.captureScreenshot", params)
    data = r.get("result", {}).get("data")
    if not data:
        print("shot fail", name, json.dumps(r)[:200])
        return
    p = os.path.join(OUT, name + ".png")
    with open(p, "wb") as f:
        f.write(base64.b64decode(data))
    print("shot:", p)


def tab(c, key):
    js(c, "document.querySelector('#page-lowdim-ingest-twod .rw-tab[data-rw-tab=\"%s\"]').click()" % key)
    time.sleep(0.5)


def subview(c, view, prefix):
    """prefix 必须是 'entry' 或 'proc'（'spec' 两个页签都有，必须显式指定）。"""
    js(c, "document.querySelector('[data-rw-act=\"%s-view\"][data-view=\"%s\"]').click()" % (prefix, view))
    time.sleep(0.45)


def setv(c, mask, key, val, attr="ef"):
    js(c, "(function(){var el=document.querySelector('#%s [data-rw-%s=\"%s\"]'); el.value=%s;"
          " el.dispatchEvent(new Event('input',{bubbles:true}));"
          " el.dispatchEvent(new Event('change',{bubbles:true}));})()"
       % (mask, attr, key, json.dumps(val)))
    time.sleep(0.15)


def main():
    c = Cdp()
    try:
        c.open(URL)
        time.sleep(1.5)
        c.send("Emulation.setDeviceMetricsOverride", {"width": 1600, "height": 1000, "deviceScaleFactor": 1, "mobile": False})
        time.sleep(0.5)

        # =============== 资源采集 ===============
        shot(c, "01_资源采集列表")

        js(c, "document.querySelector('[data-rw-act=\"open-create\"]').click()")
        time.sleep(0.5)
        shot(c, "02_创建任务_步骤1_任务基本信息")
        js(c, "document.querySelector('#rwMask [data-rw-act=\"intro\"]').click()")
        time.sleep(0.5)
        shot(c, "03_数据资源对象介绍弹窗")
        js(c, "document.querySelector('#rwIntroMask [data-rw-act=\"close-intro\"]').click()")
        time.sleep(0.3)

        js(c, "document.querySelector('#rwMask [data-rw-f=\"name\"]').value='MoS2 电子结构数据采集'")
        js(c, "document.querySelector('#rwMask [data-rw-act=\"next\"]').click()")
        time.sleep(0.5)
        js(c, "document.querySelectorAll('#rwMask .rw-ds input')[0].click()")
        time.sleep(0.4)
        shot(c, "04_创建任务_步骤2_开源数据获取")

        js(c, "document.querySelector('#rwMask [data-rw-act=\"run-collect\"]').click()")
        time.sleep(3.5)
        shot(c, "05_创建任务_步骤2_采集结果")
        js(c, "document.querySelector('#rwMask [data-rw-act=\"skip-to-confirm\"]').click()")
        time.sleep(0.5)
        shot(c, "06_创建任务_步骤3_确认提交")
        js(c, "document.querySelector('#rwMask [data-rw-act=\"close-create\"]').click()")
        time.sleep(0.3)

        # 数据购买
        js(c, "document.querySelector('[data-rw-act=\"open-create\"]').click()")
        time.sleep(0.4)
        js(c, "document.querySelector('#rwMask [data-rw-f=\"name\"]').value='WS2 力学性质数据导入'")
        js(c, "document.querySelector('#rwMask [data-rw-act=\"next\"]').click()")
        time.sleep(0.4)
        js(c, "document.querySelector('#rwMask [data-rw-f=\"method\"][value=\"buy\"]').click()")
        time.sleep(0.4)
        js(c, "document.querySelectorAll('#rwMask .rw-ds input')[0].click()")
        time.sleep(0.4)
        shot(c, "07_创建任务_步骤2_数据购买")
        js(c, "document.querySelector('#rwMask [data-rw-act=\"close-create\"]').click()")
        time.sleep(0.3)

        # 数据计算
        js(c, "document.querySelector('[data-rw-act=\"open-create\"]').click()")
        time.sleep(0.4)
        js(c, "document.querySelector('#rwMask [data-rw-f=\"name\"]').value='CrI3 态密度数据计算'")
        js(c, "document.querySelector('#rwMask [data-rw-act=\"next\"]').click()")
        time.sleep(0.4)
        js(c, "document.querySelector('#rwMask [data-rw-f=\"method\"][value=\"calc\"]').click()")
        time.sleep(0.4)
        js(c, "document.querySelector('#rwMask [data-rw-f=\"calcOut\"][value=\"OUTCAR\"]').click()")
        time.sleep(0.35)
        js(c, "document.querySelector('#rwMask [data-rw-act=\"calc-demo-files\"]').click()")
        time.sleep(0.4)
        js(c, "(function(){var s=document.querySelector('#rwMask [data-rw-f=\"demo\"]'); s.value='formatbad'; s.dispatchEvent(new Event('change',{bubbles:true}));})()")
        time.sleep(0.3)
        shot(c, "08_创建任务_步骤2_数据计算_上传前")
        js(c, "document.querySelector('#rwMask [data-rw-act=\"run-collect\"]').click()")
        time.sleep(3.0)
        shot(c, "09_创建任务_数据计算_合规性校验报告")
        js(c, "document.querySelector('#rwMask [data-rw-act=\"calc-lowq\"]').click()")
        time.sleep(0.5)
        shot(c, "10_创建任务_步骤3_计算数据确认")
        js(c, "document.querySelector('#rwMask [data-rw-act=\"close-create\"]').click()")
        time.sleep(0.3)

        # 任务详情 + 数据安全等级
        js(c, "document.querySelector('#page-lowdim-ingest-twod .rw-card table tbody tr .rw-op').click()")
        time.sleep(0.5)
        shot(c, "11_任务详情弹窗")
        js(c, "document.querySelector('#rwDetailMask [data-rw-act=\"close-detail\"]').click()")
        time.sleep(0.3)
        js(c, "document.querySelector('#page-lowdim-ingest-twod [data-twod-security-guide]').click()")
        time.sleep(0.8)
        shot(c, "12_数据安全等级弹窗")
        js(c, "document.getElementById('twodSecurityGuideModal').classList.remove('show')")
        time.sleep(0.3)

        # =============== 资源录入（可操作工作台） ===============
        tab(c, "entry")
        shot(c, "13_资源录入_工作台_待录入数据")

        # 单条手动录入 + 字段校验
        js(c, "document.querySelector('#page-lowdim-ingest-twod [data-rw-act=\"entry-manual\"]').click()")
        time.sleep(0.5)
        setv(c, "rwEntryMask", "formula", "mos2")
        setv(c, "rwEntryMask", "bandGap", "15")
        time.sleep(0.3)
        shot(c, "14_资源录入_单条录入_字段实时校验报错")
        setv(c, "rwEntryMask", "formula", "MoS2")
        setv(c, "rwEntryMask", "bandGap", "1.68")
        setv(c, "rwEntryMask", "formationEnergy", "-1.24")
        setv(c, "rwEntryMask", "la", "3.16")
        setv(c, "rwEntryMask", "lb", "3.16")
        setv(c, "rwEntryMask", "lc", "12.30")
        setv(c, "rwEntryMask", "crystal", "Hexagonal")
        setv(c, "rwEntryMask", "spaceGroup", "P6_3/mmc")
        setv(c, "rwEntryMask", "coords", "Mo 0.000 0.000 0.250\nS 0.333 0.667 0.620")
        time.sleep(0.3)
        shot(c, "15_资源录入_单条录入_填写完整")
        # 结构文件解析自动填充
        js(c, "document.querySelector('#rwEntryMask [data-rw-act=\"entry-demo-cif\"]').click()")
        time.sleep(0.35)
        js(c, "document.querySelector('#rwEntryMask [data-rw-act=\"entry-parse-cif\"]').click()")
        time.sleep(0.4)
        shot(c, "16_资源录入_单条录入_结构文件解析自动填充")
        # 计算参数不合规
        setv(c, "rwEntryMask", "functional", "LDA", attr="ec")
        js(c, "document.querySelector('#rwEntryMask [data-rw-act=\"entry-check-calc\"]').click()")
        time.sleep(0.4)
        shot(c, "17_资源录入_单条录入_计算参数不合规提示")
        setv(c, "rwEntryMask", "functional", "PBE", attr="ec")
        js(c, "document.querySelector('#rwEntryMask [data-rw-act=\"entry-submit\"]').click()")
        time.sleep(0.7)
        shot(c, "18_资源录入_录入审核_待审核")

        # 审核推进
        js(c, "document.querySelector('[data-rw-act=\"audit-auto\"]').click()")
        time.sleep(0.4)
        js(c, "document.querySelector('[data-rw-act=\"audit-first-ok\"]').click()")
        time.sleep(0.4)
        shot(c, "19_资源录入_录入审核_流转中")
        js(c, "document.querySelector('[data-rw-act=\"audit-final-ok\"]').click()")
        time.sleep(0.5)
        shot(c, "20_资源录入_录入审核_已入库")

        # 已入库数据
        subview(c, "done", "entry")
        shot(c, "21_资源录入_已入库数据")

        # 批量导入
        subview(c, "todo", "entry")
        js(c, "document.querySelector('[data-rw-act=\"entry-batch\"][data-source=\"vasp\"]').click()")
        time.sleep(0.5)
        shot(c, "22_资源录入_批量导入_步骤1选来源")
        js(c, "document.querySelector('#rwBatchMask [data-rw-act=\"batch-next\"]').click()")
        time.sleep(0.3)
        js(c, "document.querySelector('#rwBatchMask [data-rw-act=\"batch-demo-files\"]').click()")
        time.sleep(0.35)
        shot(c, "23_资源录入_批量导入_步骤2上传文件")
        js(c, "document.querySelector('#rwBatchMask [data-rw-act=\"batch-parse\"]').click()")
        time.sleep(3.4)
        shot(c, "24_资源录入_批量导入_步骤3解析映射")
        js(c, "document.querySelector('#rwBatchMask [data-rw-act=\"batch-next\"]').click()")
        time.sleep(0.4)
        shot(c, "25_资源录入_批量导入_步骤4自动审核")
        js(c, "document.querySelector('#rwBatchMask [data-rw-act=\"batch-next\"]').click()")
        time.sleep(0.4)
        shot(c, "26_资源录入_批量导入_步骤5确认入库")
        js(c, "document.querySelector('#rwBatchMask [data-rw-act=\"batch-confirm\"]').click()")
        time.sleep(0.6)
        shot(c, "27_资源录入_批量导入后审核列表")

        # 规范说明（录入页签）
        subview(c, "spec", "entry")
        shot(c, "28_资源录入_录入规范说明")

        # =============== 资源加工（可操作工作台） ===============
        tab(c, "process")
        shot(c, "29_资源加工_工作台与流程总览")

        js(c, "document.querySelector('[data-rw-act=\"proc-new\"]').click()")
        time.sleep(0.5)
        setv(c, "rwProcMask", "name", "MoS2 电子结构数据产品加工", attr="pf")
        js(c, "document.querySelectorAll('#rwProcMask [data-rw-pf=\"source\"]').forEach(function(el){ if(!el.checked) el.click(); })")
        time.sleep(0.3)
        shot(c, "30_加工向导_步骤1_数据策划")
        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-run-1\"]').click()")
        time.sleep(0.5)
        shot(c, "31_加工向导_步骤1_已执行完成")

        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-next\"]').click()")
        time.sleep(0.4)
        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-run-2\"]').click()")
        time.sleep(0.5)
        shot(c, "32_加工向导_步骤2_基础数据筛选结果")

        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-next\"]').click()")
        time.sleep(0.4)
        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-run-3\"]').click()")
        time.sleep(0.5)
        shot(c, "33_加工向导_步骤3_标准化预处理_V1.0")

        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-next\"]').click()")
        time.sleep(0.4)
        js(c, "document.querySelector('#rwProcMask [data-rw-pf=\"model\"][value=\"stat\"]').click()")
        time.sleep(0.3)
        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-run-4\"]').click()")
        time.sleep(0.5)
        shot(c, "34_加工向导_步骤4_数据加工结果")

        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-next\"]').click()")
        time.sleep(0.4)
        js(c, "document.querySelector('#rwProcMask [data-rw-pf=\"product\"][value=\"ai\"]').click()")
        time.sleep(0.3)
        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-run-5\"]').click()")
        time.sleep(0.5)
        shot(c, "35_加工向导_步骤5_产品生产_V2.0")

        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-next\"]').click()")
        time.sleep(0.4)
        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-run-6\"]').click()")
        time.sleep(0.5)
        shot(c, "36_加工向导_步骤6_质量评价")
        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-quality-fix\"]') && document.querySelector('#rwProcMask [data-rw-act=\"proc-quality-fix\"]').click()")
        time.sleep(0.4)
        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-finish\"]').click()")
        time.sleep(0.6)
        shot(c, "37_资源加工_任务列表含进度与版本")

        js(c, "document.querySelector('[data-rw-act=\"proc-report\"]').click()")
        time.sleep(0.5)
        shot(c, "38_加工报告")
        js(c, "document.querySelector('[data-rw-act=\"proc-report-close\"]').click()")
        time.sleep(0.3)

        subview(c, "spec", "proc")
        shot(c, "39_资源加工_加工规范说明")

        # 空态引导：重新加载回到 0 条已入库，展示「前往资源录入」引导
        c.open(URL)
        time.sleep(1.4)
        tab(c, "process")
        js(c, "document.querySelector('[data-rw-act=\"proc-new\"]').click()")
        time.sleep(0.5)
        shot(c, "40_加工向导_空态引导跳转录入")
    finally:
        c.close()


if __name__ == "__main__":
    main()
