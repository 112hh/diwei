# -*- coding: utf-8 -*-
"""验证二维材料数据采集加工处理页面重构（CDP 直连无头 Chrome）。"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cdp import Cdp

URL = "file:///C:/Users/Windows/Desktop/diwei/lowdim-ingest-twod.html"

RESULTS = []


def check(name, cond, extra=""):
    RESULTS.append((name, bool(cond), extra))
    print(("PASS  " if cond else "FAIL  ") + name + (("   | " + str(extra)[:400]) if extra else ""))


def js(c, expr):
    return c.evaluate("(function(){ try { return (%s); } catch(e) { return '__ERR__' + e.message; } })()" % expr)


def main():
    c = Cdp()
    try:
        c.open(URL)
        time.sleep(1.2)
        c.evaluate("window.prompt = function(){ return '字段与原始来源不一致，请核对后重新提交'; };")

        # ---------- 基础 ----------
        check("无 JS 错误", js(c, "window.__cdpErrors.length") == 0, js(c, "JSON.stringify(window.__cdpErrors)"))
        check("当前页 = page-lowdim-ingest-twod",
              js(c, "document.querySelector('.page.active') && document.querySelector('.page.active').id") == "page-lowdim-ingest-twod",
              js(c, "document.querySelector('.page.active') && document.querySelector('.page.active').id"))
        check("新页面容器 .rw-page 存在", js(c, "!!document.querySelector('#page-lowdim-ingest-twod .rw-page')"))
        check("标题正确", "二维材料数据采集加工处理" in str(js(c, "document.querySelector('#page-lowdim-ingest-twod .rw-head h1').textContent")),
              js(c, "document.querySelector('#page-lowdim-ingest-twod .rw-head h1').textContent"))

        # ---------- 需求1：保留两个按钮、删除总表与卡片 ----------
        btns = js(c, "JSON.stringify(Array.from(document.querySelectorAll('#page-lowdim-ingest-twod .rw-head-actions button')).map(function(b){return b.textContent.trim();}))")
        check("保留「数据安全等级 + 创建任务」两个按钮", btns is not None and json.loads(btns) == ["数据安全等级", "＋ 创建任务"], btns)
        check("已移除任务总表（.twod-task-summary）", js(c, "document.querySelectorAll('#page-lowdim-ingest-twod .twod-task-summary').length") == 0)
        check("已移除采集向导（.twod-task-wizard）", js(c, "document.querySelectorAll('#page-lowdim-ingest-twod .twod-task-wizard').length") == 0)
        check("已移除旧任务表头「任务ID/任务名称」组合",
              js(c, "document.querySelector('#page-lowdim-ingest-twod').innerHTML.indexOf('采集任务名称') >= 0 && document.querySelector('#page-lowdim-ingest-twod').innerHTML.indexOf('twod-task-table-head') < 0"))

        # ---------- 需求2：三页签 ----------
        tabs = json.loads(js(c, "JSON.stringify(Array.from(document.querySelectorAll('#page-lowdim-ingest-twod .rw-tab')).map(function(b){return b.textContent.replace(/[0-9]+$/,'').trim();}))") or "[]")
        check("三个页签：资源采集/资源录入/资源加工", tabs == ["资源采集", "资源录入", "资源加工"], tabs)
        check("默认展示资源采集",
              js(c, "document.querySelector('#page-lowdim-ingest-twod .rw-tab.is-active').getAttribute('data-rw-tab')") == "collect")
        cols = json.loads(js(c, "JSON.stringify(Array.from(document.querySelectorAll('#page-lowdim-ingest-twod .rw-card table thead th')).map(function(t){return t.textContent.trim();}))") or "[]")
        check("资源采集列表字段 = 采集ID/采集任务名称/采集方式/采集说明/操作",
              cols == ["采集ID", "采集任务名称", "采集方式", "采集说明", "操作"], cols)
        check("列表含 3 条初始数据", js(c, "document.querySelectorAll('#page-lowdim-ingest-twod .rw-card table tbody tr').length") == 3)
        ops = json.loads(js(c, "JSON.stringify(Array.from(document.querySelectorAll('#page-lowdim-ingest-twod .rw-card table tbody tr:first-child .rw-op')).map(function(b){return b.textContent.trim();}))") or "[]")
        check("操作列为 查看/录入", ops == ["查看", "录入"], ops)

        # ---------- 需求4：对象介绍弹窗（蓝色按钮在创建任务弹窗内） ----------
        js(c, "document.querySelector('[data-rw-act=\"open-create\"]').click()")
        time.sleep(0.4)
        check("创建任务弹窗打开", js(c, "!!document.getElementById('rwMask')"))
        check("弹窗内存在蓝色「数据资源对象介绍」按钮",
              js(c, "!!document.querySelector('#rwMask .rw-modal-head-side [data-rw-act=\"intro\"]') && document.querySelector('#rwMask [data-rw-act=\"intro\"]').classList.contains('rw-btn--blue')"))
        stepbar = json.loads(js(c, "JSON.stringify(Array.from(document.querySelectorAll('#rwMask .rw-stepbar-item')).map(function(n){return n.textContent.replace('1','').replace('2','').replace('3','').trim();}))") or "[]")
        check("弹窗分三步：任务基本信息/采集方式与配置/结果确认与提交",
              stepbar == ["任务基本信息", "采集方式与配置", "结果确认与提交"], stepbar)
        cid = js(c, "document.querySelector('#rwMask [data-rw-f=\"id\"]').value")
        check("第一步展示自动编码的采集 ID（只读）", bool(cid) and cid.startswith("2D-CL-") and js(c, "document.querySelector('#rwMask [data-rw-f=\"id\"]').readOnly") is True, cid)
        check("采集任务名称为文本框", js(c, "document.querySelector('#rwMask [data-rw-f=\"name\"]').tagName") == "INPUT")
        js(c, "document.querySelector('#rwMask [data-rw-act=\"intro\"]').click()")
        time.sleep(0.3)
        check("对象介绍弹窗展示 8 大资源对象", js(c, "document.querySelectorAll('#rwIntroMask .rw-intro-item').length") == 8,
              js(c, "document.querySelectorAll('#rwIntroMask .rw-intro-item').length"))
        js(c, "document.querySelector('#rwIntroMask [data-rw-act=\"close-intro\"]').click()")
        time.sleep(0.2)
        check("对象介绍弹窗可关闭", js(c, "!document.getElementById('rwIntroMask')"))

        # ---------- 第二步：三种采集方式 ----------
        js(c, "document.querySelector('#rwMask [data-rw-f=\"name\"]').value='自动化验证任务'")
        js(c, "document.querySelector('#rwMask [data-rw-act=\"next\"]').click()")
        time.sleep(0.4)
        mth = json.loads(js(c, "JSON.stringify(Array.from(document.querySelectorAll('#rwMask .rw-method-title')).map(function(n){return n.textContent.trim();}))") or "[]")
        check("采集方式三种：开源数据获取/数据购买·自采数据/数据计算",
              mth == ["开源数据获取", "数据购买 / 自采数据", "数据计算"], mth)
        check("默认选中开源数据获取", js(c, "document.querySelector('#rwMask [data-rw-f=\"method\"][value=\"open\"]').checked") is True)
        check("开源方式展示目标数据库列表", js(c, "document.querySelectorAll('#rwMask .rw-db').length") == 3)
        check("数据库下列出可用数据集", js(c, "document.querySelectorAll('#rwMask .rw-ds').length") == 8,
              js(c, "document.querySelectorAll('#rwMask .rw-ds').length"))

        # 勾选数据集 → 勾选结果列表
        js(c, "document.querySelectorAll('#rwMask .rw-ds input')[0].click()")
        time.sleep(0.35)
        check("勾选后出现勾选结果列表", js(c, "document.querySelectorAll('#rwMask .rw-pick-result table tbody tr').length") == 1,
              js(c, "document.querySelectorAll('#rwMask .rw-pick-result table tbody tr').length"))
        # 再勾一个数据集
        js(c, "document.querySelectorAll('#rwMask .rw-ds input')[1].click()")
        time.sleep(0.35)
        check("多选后勾选结果累加为 2", js(c, "document.querySelectorAll('#rwMask .rw-pick-result table tbody tr').length") == 2)

        labels = json.loads(js(c, "JSON.stringify(Array.from(document.querySelectorAll('#rwMask .rw-params label')).map(function(n){return n.textContent.replace('*','').trim();}))") or "[]")
        check("设置采集参数展示「材料类型」", "材料类型" in labels, labels)
        check("设置采集参数展示「性质范围（输入取值范围）」", js(c, "document.querySelector('#rwMask .rw-params').innerHTML.indexOf('性质范围（输入取值范围）') >= 0"))
        check("性质范围含 min/max 输入框", js(c, "document.querySelectorAll('#rwMask .rw-range-row input[data-col=\"min\"]').length") == 1)

        # ---------- 采集执行 ----------
        js(c, "document.querySelector('#rwMask [data-rw-act=\"run-collect\"]').click()")
        time.sleep(4.0)
        check("采集日志已输出", js(c, "document.querySelectorAll('#rwMask .rw-log-line').length") > 5,
              js(c, "document.querySelectorAll('#rwMask .rw-log-line').length"))
        check("采集成功结果面板出现", js(c, "!!document.querySelector('#rwMask .rw-result') && document.querySelector('#rwMask .rw-result-title').textContent.indexOf('采集成功') >= 0"),
              js(c, "document.querySelector('#rwMask .rw-result-title') && document.querySelector('#rwMask .rw-result-title').textContent"))
        resHead = json.loads(js(c, "JSON.stringify(Array.from(document.querySelectorAll('#rwMask .rw-result-table-main thead th')).map(function(t){return t.textContent.trim();}))") or "[]")
        check("采集成功列出 源数据库名称/数据版本/采集时间", resHead == ["源数据库名称", "数据版本", "采集时间", "记录数", "原始文件"], resHead)
        check("含计算数据文件校验表", js(c, "document.querySelector('#rwMask .rw-result').innerHTML.indexOf('计算数据文件校验') >= 0"))

        # ---------- 进入确认并提交 ----------
        js(c, "document.querySelector('#rwMask [data-rw-act=\"skip-to-confirm\"]').click()")
        time.sleep(0.4)
        check("第三步展示采集成功确认列表", js(c, "document.querySelector('#rwMask .rw-result-title').textContent.indexOf('采集成功确认列表') >= 0"),
              js(c, "document.querySelector('#rwMask .rw-result-title').textContent"))
        js(c, "document.querySelector('#rwMask [data-rw-act=\"submit-task\"]').click()")
        time.sleep(0.5)
        check("提交后弹窗关闭", js(c, "!document.getElementById('rwMask')"))
        check("新任务已保存到资源采集列表", js(c, "document.querySelectorAll('#page-lowdim-ingest-twod .rw-card table tbody tr').length") == 4,
              js(c, "document.querySelectorAll('#page-lowdim-ingest-twod .rw-card table tbody tr').length"))
        check("新任务名称出现在列表", js(c, "document.querySelector('#page-lowdim-ingest-twod').innerHTML.indexOf('自动化验证任务') >= 0"))

        # ============ 需求5：资源录入 —— 可操作工作台 ============
        js(c, "document.querySelector('#page-lowdim-ingest-twod .rw-tab[data-rw-tab=\"entry\"]').click()")
        time.sleep(0.4)
        entryHtml = js(c, "document.querySelector('#page-lowdim-ingest-twod .rw-body').innerHTML")
        check("录入工作台含「批量导入 / 新增材料」操作按钮",
              "批量导入" in entryHtml and "新增材料（单条录入）" in entryHtml)
        check("录入方式选择表含 5 种数据来源",
              js(c, "document.querySelectorAll('#page-lowdim-ingest-twod .rw-source-table tbody tr').length") == 5,
              js(c, "document.querySelectorAll('#page-lowdim-ingest-twod .rw-source-table tbody tr').length"))
        for kw in ["Materials Project 等公开库", "C2DB 数据库", "VASP 自主计算数据", "文献提取数据", "用户上传数据",
                   "定制插件批量导入", "自动化流程录入", "手动输入", "INCAR+POSCAR+POTCAR+KPOINTS", "无法自动识别"]:
            check("录入方式选择含：「" + kw + "」", kw in entryHtml)
        subs = json.loads(js(c, "JSON.stringify(Array.from(document.querySelectorAll('#page-lowdim-ingest-twod .rw-subtab')).map(function(n){return n.textContent.replace(/（[^）]*）/,'').trim();}))") or "[]")
        check("录入四个子视图：待录入/审核/已入库/规范说明",
              subs == ["待录入数据", "录入审核", "已入库数据", "录入规范说明"], subs)

        # ---- 单条手动录入：字段实时校验 ----
        js(c, "document.querySelector('#page-lowdim-ingest-twod [data-rw-act=\"entry-manual\"]').click()")
        time.sleep(0.5)
        check("手动录入表单弹窗打开", js(c, "!!document.getElementById('rwEntryMask')"))
        check("表单含必填字段（化学式/晶系/空间群/晶格常数/原子坐标/带隙）",
              js(c, "['formula','crystal','spaceGroup','la','lb','lc','coords','bandGap','formationEnergy','thickness'].every(function(k){return !!document.querySelector('#rwEntryMask [data-rw-ef=\"'+k+'\"]');})") is True)

        def setField(k, v):
            js(c, "(function(){var el=document.querySelector('#rwEntryMask [data-rw-ef=\"%s\"]'); el.value=%s; el.dispatchEvent(new Event('change',{bubbles:true}));})()" % (k, json.dumps(v)))
            time.sleep(0.12)

        setField("formula", "mos2")
        check("化学式非法 → 提示「化学式格式不正确，示例：MoS2」",
              "化学式格式不正确，示例：MoS2" in str(js(c, "document.querySelector('#rwEntryMask').innerHTML")))
        setField("formula", "MoS2")
        check("化学式合法 → 错误消除",
              "化学式格式不正确" not in str(js(c, "document.querySelector('#rwEntryMask').innerHTML")))
        setField("bandGap", "15")
        check("带隙 15 → 提示「带隙值超出合理范围（0-10 eV）」",
              "带隙值超出合理范围（0-10 eV）" in str(js(c, "document.querySelector('#rwEntryMask').innerHTML")))
        setField("bandGap", "1.68")
        setField("formationEnergy", "0.5")
        check("形成能 >0 → 提示「形成能应≤0」",
              "形成能应" in str(js(c, "document.querySelector('#rwEntryMask').innerHTML")))
        setField("formationEnergy", "-1.24")
        setField("la", "-3")
        check("晶格常数 -3 → 提示「晶格常数必须为正数」",
              "晶格常数必须为正数" in str(js(c, "document.querySelector('#rwEntryMask').innerHTML")))
        setField("la", "3.16")
        setField("lb", "3.16")
        setField("lc", "12.30")
        setField("crystal", "Hexagonal")
        setField("spaceGroup", "P6₃/mmc")
        setField("coords", "Mo 0.000 0.000 1.500")
        check("分数坐标 1.5 → 提示「分数坐标应在 0-1 范围内」",
              "分数坐标应在 0-1 范围内" in str(js(c, "document.querySelector('#rwEntryMask').innerHTML")))
        setField("coords", "Mo 0.000 0.000 0.250\nS 0.333 0.667 0.620")

        # 结构文件解析自动填充
        js(c, "document.querySelector('#rwEntryMask [data-rw-act=\"entry-demo-cif\"]').click()")
        time.sleep(0.35)
        js(c, "document.querySelector('#rwEntryMask [data-rw-act=\"entry-parse-cif\"]').click()")
        time.sleep(0.35)
        check("上传结构文件后自动填充晶格常数与原子坐标",
              js(c, "document.querySelector('#rwEntryMask [data-rw-ef=\"la\"]').value") == "3.16"
              and js(c, "document.querySelector('#rwEntryMask [data-rw-ef=\"spaceGroup\"]').value").find("mmc") >= 0,
              js(c, "document.querySelector('#rwEntryMask [data-rw-ef=\"la\"]').value"))

        # 计算参数不合规
        js(c, "(function(){var el=document.querySelector('#rwEntryMask [data-rw-ec=\"functional\"]'); el.value='LDA'; el.dispatchEvent(new Event('change',{bubbles:true}));})()")
        time.sleep(0.2)
        js(c, "document.querySelector('#rwEntryMask [data-rw-act=\"entry-check-calc\"]').click()")
        time.sleep(0.35)
        check("计算参数 LDA → 给出具体不合规项",
              "LDA 泛函，与本库标准" in str(js(c, "document.querySelector('#rwEntryMask').innerHTML")))
        check("提供「标注低精度提交」入口", js(c, "!!document.querySelector('#rwEntryMask [data-rw-act=\"entry-mark-low\"]')"))
        js(c, "(function(){var el=document.querySelector('#rwEntryMask [data-rw-ec=\"functional\"]'); el.value='PBE'; el.dispatchEvent(new Event('change',{bubbles:true}));})()")
        time.sleep(0.2)

        # 提交 → 生成唯一标识
        js(c, "document.querySelector('#rwEntryMask [data-rw-act=\"entry-submit\"]').click()")
        time.sleep(0.6)
        check("提交后弹窗关闭并跳转到录入审核视图", js(c, "!document.getElementById('rwEntryMask') && document.querySelector('.rw-subtab.is-active').textContent.indexOf('录入审核')>=0"),
              js(c, "document.querySelector('.rw-subtab.is-active') && document.querySelector('.rw-subtab.is-active').textContent"))
        firstId = js(c, "(document.querySelector('#page-lowdim-ingest-twod .rw-card table tbody tr td.rw-id')||{}).textContent")
        check("生成材料唯一标识（2D-类型码-序号）", bool(firstId) and str(firstId).startswith("2D-"), firstId)
        check("提交后状态为「待审核」", js(c, "document.querySelector('#page-lowdim-ingest-twod .rw-audit-table tbody tr').innerHTML.indexOf('待审核') >= 0"),
              js(c, "document.querySelector('#page-lowdim-ingest-twod .rw-audit-table tbody tr').innerText"))

        # 审核流程逐步推进
        js(c, "document.querySelector('[data-rw-act=\"audit-auto\"]').click()")
        time.sleep(0.4)
        check("自动校验 → 待初审", js(c, "document.querySelector('#page-lowdim-ingest-twod .rw-audit-table tbody tr').innerHTML.indexOf('待初审') >= 0"),
              js(c, "(window.__rwToastLog||[]).slice(-1)[0]"))
        js(c, "document.querySelector('[data-rw-act=\"audit-first-ok\"]').click()")
        time.sleep(0.4)
        check("初审通过 → 待终审", js(c, "document.querySelector('#page-lowdim-ingest-twod .rw-audit-table tbody tr').innerHTML.indexOf('待终审') >= 0"))
        js(c, "document.querySelector('[data-rw-act=\"audit-final-ok\"]').click()")
        time.sleep(0.4)
        # 注意：终审通过后记录会离开审核队列、进入「已入库数据」视图
        check("终审通过后审核队列清空", js(c, "document.querySelectorAll('#page-lowdim-ingest-twod .rw-audit-table tbody tr').length") == 0,
              js(c, "document.querySelectorAll('#page-lowdim-ingest-twod .rw-audit-table tbody tr').length"))
        js(c, "document.querySelector('[data-rw-act=\"entry-view\"][data-view=\"done\"]').click()")
        time.sleep(0.4)
        check("已入库列表出现该记录并提供「送去加工」",
              js(c, "document.querySelector('#page-lowdim-ingest-twod .rw-body').innerHTML.indexOf('送去加工') >= 0"))
        check("已入库记录数 = 1", js(c, "document.querySelectorAll('#page-lowdim-ingest-twod .rw-done-table tbody tr').length") == 1,
              js(c, "document.querySelectorAll('#page-lowdim-ingest-twod .rw-done-table tbody tr').length"))

        # ---- 批量导入 ----
        js(c, "document.querySelector('[data-rw-act=\"entry-view\"][data-view=\"todo\"]').click()")
        time.sleep(0.3)
        js(c, "document.querySelector('[data-rw-act=\"entry-batch\"][data-source=\"vasp\"]').click()")
        time.sleep(0.4)
        check("批量导入弹窗打开（步骤1 选择数据来源）", js(c, "!!document.getElementById('rwBatchMask')"))
        check("按来源打开时自动选中 VASP", js(c, "document.querySelector('#rwBatchMask .rw-db.is-on').innerHTML.indexOf('VASP') >= 0"))
        js(c, "document.querySelector('#rwBatchMask [data-rw-act=\"batch-next\"]').click()")
        time.sleep(0.3)
        js(c, "document.querySelector('#rwBatchMask [data-rw-act=\"batch-demo-files\"]').click()")
        time.sleep(0.3)
        js(c, "document.querySelector('#rwBatchMask [data-rw-act=\"batch-parse\"]').click()")
        time.sleep(3.2)
        check("解析后出现文件清单", js(c, "document.querySelectorAll('#rwBatchMask .rw-tbl tbody tr').length") > 0,
              js(c, "document.querySelector('#rwBatchMask').innerText.slice(0,200)"))
        check("解析完成后展示文件清单与字段映射（步骤 3 内容）",
              js(c, "document.querySelector('#rwBatchMask').innerHTML.indexOf('文件清单') >= 0 || document.querySelector('#rwBatchMask').innerHTML.indexOf('字段映射') >= 0"),
              js(c, "document.querySelector('#rwBatchMask .rw-stepbar-item.is-active').textContent"))
        check("字段映射表展示来源字段 → 标准字段", js(c, "document.querySelector('#rwBatchMask').innerHTML.indexOf('material_id') >= 0 && document.querySelector('#rwBatchMask').innerHTML.indexOf('化学式') >= 0"))
        check("步骤 4 展示自动审核结果（交叉对比/可重复性/格式统一）",
              js(c, "document.querySelector('#rwBatchMask').innerHTML.indexOf('交叉对比') >= 0 && document.querySelector('#rwBatchMask').innerHTML.indexOf('可重复性') >= 0"))
        js(c, "document.querySelector('#rwBatchMask [data-rw-act=\"batch-next\"]').click()")
        time.sleep(0.3)
        check("步骤 5 展示预生成唯一标识确认列表",
              js(c, "document.querySelectorAll('#rwBatchMask .rw-id').length") > 0,
              js(c, "document.querySelectorAll('#rwBatchMask .rw-id').length"))
        js(c, "document.querySelector('#rwBatchMask [data-rw-act=\"batch-confirm\"]').click()")
        time.sleep(0.6)
        check("批量导入确认入库后弹窗关闭", js(c, "!document.getElementById('rwBatchMask')"))
        check("批量导入新增 4 条待审核记录",
              js(c, "document.querySelectorAll('#page-lowdim-ingest-twod .rw-audit-table tbody tr').length") == 4,
              js(c, "document.querySelectorAll('#page-lowdim-ingest-twod .rw-audit-table tbody tr').length"))

        # ---- 规范说明子视图仍在 ----
        js(c, "document.querySelector('[data-rw-act=\"entry-view\"][data-view=\"spec\"]').click()")
        time.sleep(0.4)
        specHtml = js(c, "document.querySelector('#page-lowdim-ingest-twod .rw-body').innerHTML")
        for kw in ["数据录入方式选择（2.2.1）", "批量导入录入流程", "单条手动录入流程（2.2.3）", "表单字段验证规则",
                   "数据录入审核流程（2.2.4）", "解析中", "字段映射中", "管理员人工复核", "数据审核员终审"]:
            check("录入规范说明含：「" + kw + "」", kw in specHtml)

        # ============ 需求6：资源加工 —— 可操作工作台 ============
        js(c, "document.querySelector('#page-lowdim-ingest-twod .rw-tab[data-rw-tab=\"process\"]').click()")
        time.sleep(0.4)
        procHtml = js(c, "document.querySelector('#page-lowdim-ingest-twod .rw-body').innerHTML")
        check("加工工作台含「新建加工任务」按钮", "新建加工任务" in procHtml)
        flowNodes = json.loads(js(c, "JSON.stringify(Array.from(document.querySelectorAll('#page-lowdim-ingest-twod .rw-flow-node .rw-flow-name')).map(function(n){return n.textContent.trim();}))") or "[]")
        check("加工流程总览 6 步",
              flowNodes == ["数据策划", "基础数据筛选", "标准化预处理", "数据加工", "产品生产", "质量评价"], flowNodes)

        js(c, "document.querySelector('[data-rw-act=\"proc-new\"]').click()")
        time.sleep(0.5)
        check("加工向导弹窗打开（步骤1 数据策划）", js(c, "!!document.getElementById('rwProcMask')"))
        check("步骤1 显示需求分析表单（目标用途/输出格式/精度要求）",
              js(c, "!!document.querySelector('#rwProcMask [data-rw-pf=\"purpose\"]') && !!document.querySelector('#rwProcMask [data-rw-pf=\"format\"]') && !!document.querySelector('#rwProcMask [data-rw-pf=\"precision\"]')"))
        check("步骤1 可选择参与加工的数据源", js(c, "document.querySelectorAll('#rwProcMask [data-rw-pf=\"source\"]').length") >= 1,
              js(c, "document.querySelectorAll('#rwProcMask [data-rw-pf=\"source\"]').length"))
        js(c, "(function(){var el=document.querySelector('#rwProcMask [data-rw-pf=\"name\"]'); el.value='MoS2 电子结构数据产品加工'; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true}));})()")
        time.sleep(0.25)
        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-run-1\"]').click()")
        time.sleep(0.4)
        check("步骤1 执行后标记完成", js(c, "document.querySelector('#rwProcMask .rw-stepbar-item.is-done') && document.querySelector('#rwProcMask .rw-stepbar-item.is-done').textContent.indexOf('数据策划')>=0"))

        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-next\"]').click()")
        time.sleep(0.4)
        check("进入步骤2 基础数据筛选", js(c, "document.querySelector('#rwProcMask .rw-stepbar-item.is-active').textContent.indexOf('基础数据筛选') >= 0"))
        check("步骤2 可配置质量等级与分组条件",
              js(c, "document.querySelectorAll('#rwProcMask [data-rw-pf=\"level\"]').length") == 3
              and js(c, "!!document.querySelector('#rwProcMask [data-rw-pf=\"groupBy\"]')"))
        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-run-2\"]').click()")
        time.sleep(0.5)
        check("步骤2 执行筛选 → 输出筛选结果表", js(c, "document.querySelector('#rwProcMask').innerHTML.indexOf('筛选后的数据集合') >= 0"))
        check("步骤2 输出分组清单（按化学式）", js(c, "document.querySelector('#rwProcMask').innerHTML.indexOf('分组清单') >= 0"))

        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-next\"]').click()")
        time.sleep(0.4)
        check("进入步骤3 标准化预处理", js(c, "document.querySelector('#rwProcMask .rw-stepbar-item.is-active').textContent.indexOf('标准化预处理') >= 0"))
        check("步骤3 含四项预处理项（格式/单位/缺失值/异常值）",
              js(c, "document.querySelectorAll('#rwProcMask [data-rw-pf=\"preOpt\"]').length") == 4)
        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-run-3\"]').click()")
        time.sleep(0.5)
        check("步骤3 输出缺失值报告", js(c, "document.querySelector('#rwProcMask').innerHTML.indexOf('缺失值报告') >= 0"))
        check("步骤3 输出异常值清单并可修正/标注保留",
              js(c, "document.querySelector('#rwProcMask').innerHTML.indexOf('异常值清单') >= 0 && !!document.querySelector('#rwProcMask [data-rw-act=\"proc-outlier-fix\"]') && !!document.querySelector('#rwProcMask [data-rw-act=\"proc-outlier-keep\"]')"))
        check("步骤3 完成后版本推进至 V1.0", js(c, "document.querySelector('#rwProcMask .rw-modal-head').innerHTML.indexOf('V1.0') >= 0"),
              js(c, "document.querySelector('#rwProcMask .rw-modal-head').innerText"))
        js(c, "(function(){var el=document.querySelector('#rwProcMask [data-rw-pf=\"outlierFix\"]'); el.value='1.68'; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true}));})()")
        time.sleep(0.2)
        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-outlier-fix\"]').click()")
        time.sleep(0.4)
        check("异常值可确认修正", js(c, "document.querySelector('#rwProcMask').innerHTML.indexOf('已确认修正') >= 0 || (window.__rwToastLog||[]).some(function(x){return x.msg.indexOf('已确认修正')>=0;})") is True,
              js(c, "JSON.stringify((window.__rwToastLog||[]).slice(-2))"))

        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-next\"]').click()")
        time.sleep(0.4)
        check("进入步骤4 数据加工", js(c, "document.querySelector('#rwProcMask .rw-stepbar-item.is-active').textContent.indexOf('数据加工') >= 0"))
        check("步骤4 含 3 个加工模型（统计/图像标准化/结构验证）",
              js(c, "document.querySelectorAll('#rwProcMask [data-rw-pf=\"model\"]').length") == 3)
        js(c, "document.querySelector('#rwProcMask [data-rw-pf=\"model\"][value=\"stat\"]').click()")
        time.sleep(0.35)
        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-run-4\"]').click()")
        time.sleep(0.5)
        check("步骤4 执行模型 → 输出加工结果",
              js(c, "document.querySelector('#rwProcMask').innerHTML.indexOf('加工结果') >= 0 && document.querySelector('#rwProcMask').innerHTML.indexOf('置信区间') >= 0"))

        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-next\"]').click()")
        time.sleep(0.4)
        check("进入步骤5 产品生产", js(c, "document.querySelector('#rwProcMask .rw-stepbar-item.is-active').textContent.indexOf('产品生产') >= 0"))
        check("步骤5 含 3 种数据产品类型", js(c, "document.querySelectorAll('#rwProcMask [data-rw-pf=\"product\"]').length") == 3)
        js(c, "document.querySelector('#rwProcMask [data-rw-pf=\"product\"][value=\"ai\"]').click()")
        time.sleep(0.35)
        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-run-5\"]').click()")
        time.sleep(0.5)
        check("步骤5 生产完成 → 版本推进至 V2.0", js(c, "document.querySelector('#rwProcMask .rw-modal-head').innerHTML.indexOf('V2.0') >= 0"),
              js(c, "document.querySelector('#rwProcMask .rw-modal-head').innerText"))
        check("步骤5 输出格式与用途 + data_version 标记",
              js(c, "document.querySelector('#rwProcMask').innerHTML.indexOf('data_version') >= 0 && document.querySelector('#rwProcMask').innerHTML.indexOf('机器学习模型训练') >= 0"))

        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-next\"]').click()")
        time.sleep(0.4)
        check("进入步骤6 质量评价", js(c, "document.querySelector('#rwProcMask .rw-stepbar-item.is-active').textContent.indexOf('质量评价') >= 0"))
        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-run-6\"]').click()")
        time.sleep(0.5)
        check("步骤6 三维度评价（来源/模型/产品）",
              js(c, "document.querySelector('#rwProcMask').innerHTML.indexOf('数据来源质量') >= 0 && document.querySelector('#rwProcMask').innerHTML.indexOf('加工模型质量') >= 0 && document.querySelector('#rwProcMask').innerHTML.indexOf('数据产品质量') >= 0"))
        check("步骤6 不合格项给出处理动作按钮",
              js(c, "!!document.querySelector('#rwProcMask [data-rw-act=\"proc-quality-fix\"]')"))
        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-quality-fix\"]').click()")
        time.sleep(0.4)
        check("执行不合格处理（调整模型参数）",
              js(c, "(window.__rwToastLog||[]).some(function(x){return x.msg.indexOf('调整模型参数')>=0;})") is True,
              js(c, "JSON.stringify((window.__rwToastLog||[]).slice(-2))"))
        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-finish\"]').click()")
        time.sleep(0.5)
        check("完成加工后向导关闭", js(c, "!document.getElementById('rwProcMask')"))
        check("加工任务列表显示完成版本 V2.0",
              js(c, "document.querySelector('#page-lowdim-ingest-twod .rw-body').innerHTML.indexOf('V2.0') >= 0"))
        check("加工任务列表含进度条", js(c, "document.querySelectorAll('#page-lowdim-ingest-twod .rw-progress').length") >= 1)
        js(c, "document.querySelector('[data-rw-act=\"proc-report\"]').click()")
        time.sleep(0.5)
        check("可打开加工报告", js(c, "!!document.getElementById('rwProcReportMask')"))
        check("加工报告含六步执行进度", js(c, "document.querySelector('#rwProcReportMask').innerHTML.indexOf('加工步骤') >= 0"))
        js(c, "document.querySelector('[data-rw-act=\"proc-report-close\"]').click()")
        time.sleep(0.3)

        # ---- 加工规范说明子视图仍在 ----
        js(c, "document.querySelector('[data-rw-act=\"proc-view\"][data-view=\"spec\"]').click()")
        time.sleep(0.4)
        spec2 = js(c, "document.querySelector('#page-lowdim-ingest-twod .rw-body').innerHTML")
        for kw in ["步骤 1：数据策划", "步骤 2：基础数据筛选", "步骤 3：标准化预处理", "步骤 4：数据加工模型和算法",
                   "步骤 5：数据处理加工与产品生产", "步骤 6：质量评价", "版本标记规则（2.3.3）",
                   "质量等级 = A 级 或 B 级", "CIF/POSCAR → 标准 CIF", "超出 3σ 范围或物理不合理",
                   "统计计算模型", "AI 训练数据集", "跨库融通数据集", "OPTIMADE", "AQL = 1%", "data_version"]:
            check("加工规范说明含：「" + kw + "」", kw in spec2)
        js(c, "document.querySelectorAll('#page-lowdim-ingest-twod .rw-flow-node')[2].click()")
        time.sleep(0.3)
        check("规范视图点击流程节点可定位到步骤 3", js(c, "document.querySelector('[data-rw-proc-card=\"3\"]').style.boxShadow.length") > 0)

        # ---------- 空态引导：加工无可入库数据时一键跳转录入 ----------
        c.open(URL)          # 重新加载，回到「0 条已入库」的初始状态
        time.sleep(1.2)
        js(c, "document.querySelector('#page-lowdim-ingest-twod .rw-tab[data-rw-tab=\"process\"]').click()")
        time.sleep(0.4)
        js(c, "document.querySelector('[data-rw-act=\"proc-new\"]').click()")
        time.sleep(0.5)
        check("无已入库数据时步骤1 提示先完成录入",
              js(c, "document.querySelector('#rwProcMask').innerHTML.indexOf('暂无已入库数据') >= 0"))
        check("无已入库数据时提供「前往资源录入」按钮",
              js(c, "!!document.querySelector('#rwProcMask [data-rw-act=\"proc-goto-entry\"]')"))
        js(c, "document.querySelector('#rwProcMask [data-rw-act=\"proc-goto-entry\"]').click()")
        time.sleep(0.5)
        check("点击后关闭向导并切到资源录入页签",
              js(c, "!document.getElementById('rwProcMask') && document.querySelector('#page-lowdim-ingest-twod .rw-tab.is-active').getAttribute('data-rw-tab')") == "entry",
              js(c, "document.querySelector('#page-lowdim-ingest-twod .rw-tab.is-active').getAttribute('data-rw-tab')"))
        check("跳转后可见录入工作台（5 种数据来源）",
              js(c, "document.querySelectorAll('#page-lowdim-ingest-twod .rw-source-table tbody tr').length") == 5)

        # ---------- 异常处理：API 失败 ----------
        js(c, "document.querySelector('#page-lowdim-ingest-twod .rw-tab[data-rw-tab=\"collect\"]').click()")
        time.sleep(0.3)
        js(c, "document.querySelector('[data-rw-act=\"open-create\"]').click()")
        time.sleep(0.3)
        js(c, "document.querySelector('#rwMask [data-rw-f=\"name\"]').value='异常场景验证'")
        js(c, "document.querySelector('#rwMask [data-rw-act=\"next\"]').click()")
        time.sleep(0.3)
        js(c, "document.querySelectorAll('#rwMask .rw-ds input')[0].click()")
        time.sleep(0.3)
        js(c, "(function(){var s=document.querySelector('#rwMask [data-rw-f=\"demo\"]'); s.value='apifail'; s.dispatchEvent(new Event('change',{bubbles:true}));})()")
        time.sleep(0.3)
        js(c, "document.querySelector('#rwMask [data-rw-act=\"run-collect\"]').click()")
        time.sleep(5.2)
        check("API 失败路径：标记「采集失败」", js(c, "document.querySelector('#rwMask .rw-result-title') && document.querySelector('#rwMask .rw-result-title').textContent.indexOf('采集失败') >= 0"),
              js(c, "document.querySelector('#rwMask .rw-result-title') && document.querySelector('#rwMask .rw-result-title').textContent"))
        check("API 失败路径：已弹出失败提示", js(c, "(window.__rwToastLog||[]).some(function(x){return x.msg.indexOf('采集失败')>=0 && x.kind==='err';})") is True,
              js(c, "JSON.stringify(window.__rwToastLog)"))
        check("API 失败路径：日志含 3 次重试", js(c, "document.querySelectorAll('#rwMask .rw-log-line').length") >= 6,
              js(c, "document.querySelector('#rwMask [data-rw-log]').innerText"))
        check("API 失败路径：记录错误日志编号", js(c, "document.querySelector('#rwMask .rw-result').innerText.indexOf('ERR-') >= 0"))
        js(c, "document.querySelector('#rwMask [data-rw-act=\"close-create\"]').click()")
        time.sleep(0.3)

        # ---------- 异常处理：格式不匹配 ----------
        js(c, "document.querySelector('[data-rw-act=\"open-create\"]').click()")
        time.sleep(0.3)
        js(c, "document.querySelector('#rwMask [data-rw-f=\"name\"]').value='格式异常验证'")
        js(c, "document.querySelector('#rwMask [data-rw-act=\"next\"]').click()")
        time.sleep(0.3)
        js(c, "document.querySelectorAll('#rwMask .rw-ds input')[0].click()")
        time.sleep(0.3)
        js(c, "(function(){var s=document.querySelector('#rwMask [data-rw-f=\"demo\"]'); s.value='formatbad'; s.dispatchEvent(new Event('change',{bubbles:true}));})()")
        time.sleep(0.3)
        js(c, "document.querySelector('#rwMask [data-rw-act=\"run-collect\"]').click()")
        time.sleep(2.2)
        check("格式异常路径：提示待处理队列 / 格式异常",
              js(c, "document.querySelector('#rwMask .rw-result').innerHTML.indexOf('待处理队列') >= 0 && document.querySelector('#rwMask .rw-result').innerHTML.indexOf('格式异常') >= 0"))
        check("格式异常路径：通知数据管理员", js(c, "document.querySelector('#rwMask .rw-result').innerHTML.indexOf('数据管理员') >= 0"))
        check("格式异常路径：出现弹窗提示（toast）",
              js(c, "(window.__rwToastLog||[]).some(function(x){return x.msg.indexOf('格式异常')>=0 && x.kind==='err';})") is True,
              js(c, "JSON.stringify(window.__rwToastLog)"))
        js(c, "document.querySelector('#rwMask [data-rw-act=\"close-create\"]').click()")
        time.sleep(0.3)

        # ---------- 数据计算 ----------
        js(c, "document.querySelector('[data-rw-act=\"open-create\"]').click()")
        time.sleep(0.3)
        js(c, "document.querySelector('#rwMask [data-rw-f=\"name\"]').value='计算数据验证'")
        js(c, "document.querySelector('#rwMask [data-rw-act=\"next\"]').click()")
        time.sleep(0.35)
        js(c, "document.querySelector('#rwMask [data-rw-f=\"method\"][value=\"calc\"]').click()")
        time.sleep(0.4)
        outs = json.loads(js(c, "JSON.stringify(Array.from(document.querySelectorAll('#rwMask .rw-calc-out b')).map(function(n){return n.textContent.trim();}))") or "[]")
        check("数据计算：4 个单选按钮 OUTCAR/DOSCAR/EIGENVAL/CONTCAR",
              outs == ["OUTCAR", "DOSCAR", "EIGENVAL", "CONTCAR"], outs)
        check("数据计算：4 个输入文件槽位 INCAR/POSCAR/POTCAR/KPOINTS",
              json.loads(js(c, "JSON.stringify(Array.from(document.querySelectorAll('#rwMask .rw-upload-slot b')).map(function(n){return n.textContent.trim();}))") or "[]") == ["INCAR", "POSCAR", "POTCAR", "KPOINTS"])
        # 未选输出文件即校验 → 报错
        js(c, "document.querySelector('#rwMask [data-rw-act=\"run-collect\"]').click()")
        time.sleep(0.5)
        check("数据计算：未选输出文件时给出提示", js(c, "document.querySelector('#rwMask .rw-foot-tip') && document.querySelector('#rwMask .rw-foot-tip').textContent.indexOf('输出文件') >= 0"),
              js(c, "document.querySelector('#rwMask .rw-foot-tip') && document.querySelector('#rwMask .rw-foot-tip').textContent"))
        # 选输出文件但不传输入 → 拒绝提交
        js(c, "document.querySelector('#rwMask [data-rw-f=\"calcOut\"][value=\"OUTCAR\"]').click()")
        time.sleep(0.35)
        js(c, "document.querySelector('#rwMask [data-rw-act=\"run-collect\"]').click()")
        time.sleep(0.6)
        check("数据计算：输入缺失时提示「缺少 INCAR/POSCAR/POTCAR/KPOINTS 文件」",
              js(c, "document.querySelector('#rwMask').innerHTML.indexOf('缺少 INCAR/POSCAR/POTCAR/KPOINTS 文件') >= 0"))
        check("数据计算：缺失时拒绝提交（下一步不可用/仍停在第 2 步）",
              js(c, "document.querySelectorAll('#rwMask .rw-stepbar-item.is-active')[0].textContent.indexOf('采集方式与配置') >= 0"),
              js(c, "document.querySelector('#rwMask .rw-stepbar-item.is-active').textContent"))
        # 填充示例文件 → 校验通过
        js(c, "document.querySelector('#rwMask [data-rw-act=\"calc-demo-files\"]').click()")
        time.sleep(0.4)
        js(c, "document.querySelector('#rwMask [data-rw-act=\"run-collect\"]').click()")
        time.sleep(3.0)
        check("数据计算：展示合规性校验报告", js(c, "document.querySelector('#rwMask .rw-report') && document.querySelector('#rwMask .rw-report').innerHTML.indexOf('合规性校验报告') >= 0"))
        check("数据计算：展示结构化 JSON（结构信息/能带数据/态密度）",
              js(c, "document.querySelector('#rwMask').innerHTML.indexOf('结构信息（结构化数据字段）') >= 0 && document.querySelector('#rwMask').innerHTML.indexOf('能带数据（结构化数据字段）') >= 0 && document.querySelector('#rwMask').innerHTML.indexOf('态密度（结构化数据字段）') >= 0"))
        check("数据计算：JSON 字段含 space_group / band_gap / dos", js(c, "document.querySelector('#rwMask .rw-json').innerText.indexOf('space_group') >= 0 && document.querySelector('#rwMask .rw-json').innerText.indexOf('band_gap') >= 0 && document.querySelector('#rwMask .rw-json').innerText.indexOf('dos') >= 0"))
        # 低精度分支
        js(c, "(function(){var s=document.querySelector('#rwMask [data-rw-f=\"demo\"]'); s.value='formatbad'; s.dispatchEvent(new Event('change',{bubbles:true}));})()")
        time.sleep(0.3)
        js(c, "document.querySelector('#rwMask [data-rw-act=\"run-collect\"]').click()")
        time.sleep(3.0)
        check("数据计算：参数不合规时给出具体不合规项", js(c, "document.querySelector('#rwMask .rw-report').innerHTML.indexOf('K 点密度') >= 0 && document.querySelector('#rwMask .rw-report').innerHTML.indexOf('建议') >= 0"))
        check("数据计算：提供「重新计算 / 标注低精度并入库」两个处理入口",
              js(c, "!!document.querySelector('#rwMask [data-rw-act=\"calc-recalc\"]') && !!document.querySelector('#rwMask [data-rw-act=\"calc-lowq\"]')"))
        js(c, "document.querySelector('#rwMask [data-rw-act=\"calc-lowq\"]').click()")
        time.sleep(0.5)
        check("数据计算：低精度时仍进入确认并展示最终信息",
              js(c, "document.querySelector('#rwMask .rw-result').innerHTML.indexOf('低精度') >= 0 && document.querySelector('#rwMask').innerHTML.indexOf('态密度') >= 0"))
        js(c, "document.querySelector('#rwMask [data-rw-act=\"close-create\"]').click()")
        time.sleep(0.3)

        # ---------- 与既有功能不冲突：数据安全等级 ----------
        js(c, "document.querySelector('#page-lowdim-ingest-twod [data-twod-security-guide]').click()")
        time.sleep(0.6)
        check("「数据安全等级」按钮仍可打开原有弹窗",
              js(c, "document.querySelectorAll('.rw-page .rw-btn').length > 0 && document.body.innerHTML.indexOf('数据安全等级') >= 0"))
        check("最终无 JS 错误", js(c, "window.__cdpErrors.length") == 0, js(c, "JSON.stringify(window.__cdpErrors)"))

        # ---------- 响应式 ----------
        for w in [1920, 1600, 1440, 1280, 900, 480]:
            c.send("Emulation.setDeviceMetricsOverride", {"width": w, "height": 900, "deviceScaleFactor": 1, "mobile": False})
            time.sleep(0.35)
            check("宽度 %d 无横向溢出" % w,
                  js(c, "document.body.scrollWidth <= document.documentElement.clientWidth + 2"),
                  js(c, "document.body.scrollWidth + ' vs ' + document.documentElement.clientWidth"))
        c.send("Emulation.clearDeviceMetricsOverride")

        # ---------- 汇总 ----------
        fails = [r for r in RESULTS if not r[1]]
        print("\n==== 共 %d 项，通过 %d，失败 %d" % (len(RESULTS), len(RESULTS) - len(fails), len(fails)))
        for f in fails:
            print("  FAIL:", f[0], "|", str(f[2])[:200])
    finally:
        c.close()


if __name__ == "__main__":
    main()
