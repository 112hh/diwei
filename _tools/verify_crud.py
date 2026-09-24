# -*- coding: utf-8 -*-
"""二维材料数据库页面验证：字段信息页签 / 数据信息页签 / 数据集增删改"""
import base64, json, os, subprocess, sys, time, urllib.request
import websocket  # type: ignore

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
DIWEI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = "file:///" + os.path.join(DIWEI, "lowdim-database-twod.html").replace("\\", "/")
PROFILE = os.path.join(DIWEI, "_tools", "_chromeprofile_crud")
OUTDIR = os.path.join(DIWEI, "_tools", "preview_crud")
PORT = 9336
PREFIX = "#page-lowdim-database-twod "

FAIL = []


def boot():
    if not os.path.exists(PROFILE):
        os.makedirs(PROFILE)
    args = [CHROME, "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
            "--remote-debugging-port=%d" % PORT, "--remote-allow-origins=*",
            "--user-data-dir=" + PROFILE, "--allow-file-access-from-files",
            "--force-device-scale-factor=1", "--window-size=1680,1020", URL]
    proc = subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(60):
        try:
            data = urllib.request.urlopen("http://127.0.0.1:%d/json" % PORT, timeout=1).read()
            tabs = [t for t in json.loads(data) if t.get("type") == "page"]
            if tabs:
                return proc, tabs[0]["webSocketDebuggerUrl"]
        except Exception:
            pass
        time.sleep(0.5)
    raise RuntimeError("chrome devtools not reachable")


class CDP(object):
    def __init__(self, url):
        self.ws = websocket.create_connection(url, timeout=60)
        self.i = 0

    def send(self, method, **params):
        self.i += 1
        self.ws.send(json.dumps({"id": self.i, "method": method, "params": params}))
        while True:
            msg = json.loads(self.ws.recv())
            if msg.get("id") == self.i:
                if "error" in msg:
                    raise RuntimeError(msg["error"])
                return msg.get("result", {})

    def eval(self, expr):
        r = self.send("Runtime.evaluate", expression=expr, returnByValue=True, awaitPromise=True)
        if r.get("exceptionDetails"):
            return "EXC: " + json.dumps(r["exceptionDetails"].get("exception", {}).get("description", r["exceptionDetails"]))
        return r.get("result", {}).get("value")

    def shot(self, name, full=True):
        """视口固定为 1680×1020（在 main 中设定一次），
        全页截图靠 captureBeyondViewport 完成，避免切换视口导致 fixed 弹窗错位。"""
        self.eval("window.scrollTo(0,0)")
        time.sleep(0.45)
        r = self.send("Page.captureScreenshot", format="png", captureBeyondViewport=full)
        path = os.path.join(OUTDIR, name + ".png")
        with open(path, "wb") as f:
            f.write(base64.b64decode(r["data"]))
        print("    [shot] %s" % name)


def js_click(sel):
    return "(function(){var e=document.querySelector(%s);if(!e)return 'NOT_FOUND';e.click();return 'OK';})()" % json.dumps(sel)


def js_set(sel, val, evt="input"):
    return ("(function(){var e=document.querySelector(%s);if(!e)return 'NOT_FOUND';"
            "e.value=%s;e.dispatchEvent(new Event(%s,{bubbles:true}));return e.value;})()"
            % (json.dumps(sel), json.dumps(val), json.dumps(evt)))


def js_text(sel):
    return "(function(){var e=document.querySelector(%s);return e?e.textContent.trim():'NOT_FOUND';})()" % json.dumps(sel)


def js_count(sel):
    return "(function(){return document.querySelectorAll(%s).length;})()" % json.dumps(sel)


def check(label, got, want):
    ok = (got == want)
    print("  [%s] %s  →  %r" % ("PASS" if ok else "FAIL", label, got))
    if not ok:
        FAIL.append("%s: got %r, want %r" % (label, got, want))
    return ok


def check_true(label, cond, got=None):
    print("  [%s] %s  →  %r" % ("PASS" if cond else "FAIL", label, got))
    if not cond:
        FAIL.append("%s: %r" % (label, got))


def main():
    if not os.path.exists(OUTDIR):
        os.makedirs(OUTDIR)
    proc, ws = boot()
    try:
        cdp = CDP(ws)
        cdp.send("Runtime.enable")
        cdp.send("Page.enable")
        cdp.send("Page.addScriptToEvaluateOnNewDocument", source=(
            "window.__errs=[];"
            "window.addEventListener('error',function(e){window.__errs.push('ERR '+e.message+' @line'+e.lineno);});"
            "window.addEventListener('unhandledrejection',function(e){window.__errs.push('REJ '+e.reason);});"))
        cdp.send("Page.reload")
        time.sleep(1.0)
        cdp.send("Emulation.setDeviceMetricsOverride", width=1680, height=1020,
                 deviceScaleFactor=1, mobile=False)
        time.sleep(2.5)

        print("\n========== A. 库级「字段信息」页签 ==========")
        check("页签名", cdp.eval(js_text(PREFIX + ".t2d-tab")), "字段信息")
        check("页签数量（库级应为 2）", cdp.eval(js_count(PREFIX + ".t2d-tab")), 2)
        check("默认页行数（10 条/页）", cdp.eval(js_count(PREFIX + ".t2d-table tbody tr")), 10)
        check("分页文案", cdp.eval(js_text(PREFIX + ".t2d-page-tip")), "共 80 个字段　第 1-10 条")
        check("总页数按钮末位", cdp.eval("(function(){var a=document.querySelectorAll('#page-lowdim-database-twod .t2d-page-num');return a[a.length-1].textContent;})()"), "8")
        check("第1行字段名", cdp.eval(js_text(PREFIX + ".t2d-table tbody tr:nth-child(1) td:nth-child(3)")), "id")
        check("第1行所属表", cdp.eval(js_text(PREFIX + ".t2d-table tbody tr:nth-child(1) td:nth-child(2)")), "ldm_material_2d")
        cdp.eval("window.scrollTo(0,0)")
        cdp.shot("A1-字段信息-第1页")

        # 翻页
        cdp.eval(js_click(PREFIX + ".t2d-page-num[data-t2d-page-to='2']"))
        time.sleep(0.5)
        check("第2页首行序号", cdp.eval(js_text(PREFIX + ".t2d-table tbody tr:nth-child(1) td:nth-child(1)")), "11")
        cdp.eval("window.scrollTo(0,0)")
        cdp.shot("A2-字段信息-第2页")

        # 跳到末页
        cdp.eval(js_click(PREFIX + ".t2d-page-num[data-t2d-page-to='8']"))
        time.sleep(0.5)
        check("末页行数", cdp.eval(js_count(PREFIX + ".t2d-table tbody tr")), 10)
        check("末页末行序号", cdp.eval(js_text(PREFIX + ".t2d-table tbody tr:nth-child(10) td:nth-child(1)")), "80")

        # 每页条数切换
        cdp.eval(js_click(PREFIX + ".t2d-page-size[data-t2d-per='50']"))
        time.sleep(0.5)
        check("50条/页行数", cdp.eval(js_count(PREFIX + ".t2d-table tbody tr")), 50)
        check("50条/页总页数", cdp.eval(js_count(PREFIX + ".t2d-page-num")), 2)
        cdp.eval(js_click(PREFIX + ".t2d-page-size[data-t2d-per='10']"))
        time.sleep(0.4)

        # 本轮删除项核验：标题徽标 / 描述段 / 所属表下拉 / 工具条提示
        check("库级标题已无徽标", cdp.eval(js_count(PREFIX + ".t2d-title-row .t2d-badge")), 0)
        check("库级已无描述段", cdp.eval(js_count(PREFIX + ".t2d-sub")), 0)
        check("已移除所属表下拉", cdp.eval(js_count(PREFIX + "[data-t2d-qtbl]")), 0)
        check("字段信息工具条已移除提示文案", cdp.eval(js_count(PREFIX + ".t2d-bar-tip")), 0)
        check("所属数据表列已改为纯文本", cdp.eval(js_count(PREFIX + ".t2d-table tbody [data-t2d-tblfilter]")), 0)
        # 本轮删除项：顶部指标卡片 + 页脚来源说明
        check("字段信息已删指标卡片", cdp.eval(js_count(PREFIX + ".t2d-stat-grid")), 0)
        check("字段信息已无 stat 节点", cdp.eval(js_count(PREFIX + ".t2d-stat")), 0)
        check("字段信息已删页脚来源说明", cdp.eval("(function(){return document.querySelector('#page-lowdim-database-twod').textContent.indexOf('字段来源')>=0;})()"), False)
        check("字段信息已删 t2d-foot", cdp.eval(js_count(PREFIX + ".t2d-main > .t2d-foot")), 0)
        cdp.eval("window.scrollTo(0,0)")
        cdp.shot("A3-字段信息-已删减后")

        # 搜索
        cdp.eval(js_set(PREFIX + "[data-t2d-q1b]", "空间群"))
        time.sleep(0.5)
        check("搜索「空间群」命中数", cdp.eval(js_count(PREFIX + ".t2d-table tbody tr")), 1)
        check("搜索命中行字段名", cdp.eval(js_text(PREFIX + ".t2d-table tbody tr:nth-child(1) td:nth-child(3)")), "space_group")
        cdp.eval("window.scrollTo(0,0)")
        cdp.shot("A4-字段信息-搜索命中")
        cdp.eval(js_set(PREFIX + "[data-t2d-q1b]", ""))
        time.sleep(0.5)

        # 字段英文名已去链接化，且不再弹出字段详情抽屉
        check("字段英文名已无按钮（纯文本）", cdp.eval(js_count(PREFIX + ".t2d-table tbody button[data-t2d-ddl]")), 0)
        check("字段英文名为普通单元格", cdp.eval(js_text(PREFIX + ".t2d-table tbody tr:nth-child(3) td:nth-child(3)")), "name")
        cdp.eval(js_click(PREFIX + ".t2d-table tbody tr:nth-child(3) td:nth-child(3)"))
        time.sleep(0.6)
        check("点击字段名不再弹抽屉", cdp.eval("(function(){return document.getElementById('t2dDrawerMask')===null;})()"), True)

        # 库级信息概览
        cdp.eval(js_click(PREFIX + ".t2d-tab[data-t2d-tab='overview']"))
        time.sleep(0.6)
        check("库级概览含字段数 80", cdp.eval("(function(){return document.querySelector('#page-lowdim-database-twod').textContent.indexOf('80 个')>=0;})()"), True)
        check("库级概览已删指标卡片", cdp.eval(js_count(PREFIX + ".t2d-stat-grid")), 0)
        check("库级概览已删库表构成", cdp.eval("(function(){return document.querySelector('#page-lowdim-database-twod').textContent.indexOf('库表构成')>=0;})()"), False)
        check("库级概览保留基本信息 8 项", cdp.eval(js_count(PREFIX + ".t2d-info > div")), 8)
        cdp.eval("window.scrollTo(0,0)")
        cdp.shot("A6-库级信息概览")

        print("\n========== B. 数据集「数据信息」页签 ==========")
        cdp.eval(js_click(PREFIX + "[data-t2d-node='ds:structure']"))
        time.sleep(0.7)
        tabs = cdp.eval("(function(){return Array.prototype.map.call(document.querySelectorAll('#page-lowdim-database-twod .t2d-tab'),function(t){return t.textContent;});})()")
        check("数据集页签", tabs, ["数据信息", "信息概览"])
        head = cdp.eval("(function(){return Array.prototype.map.call(document.querySelectorAll('#page-lowdim-database-twod .t2d-table thead th'),function(t){return t.textContent;});})()")
        check("结构特征数据集列头", head, ["序号", "材料名称", "原子结构图", "化学式", "晶胞参数", "层厚（Å）", "原子坐标", "键长 / 键角", "晶系", "空间群"])
        check("数据信息行数", cdp.eval(js_count(PREFIX + ".t2d-table tbody tr")), 6)
        check("首行化学式", cdp.eval(js_text(PREFIX + ".t2d-table tbody tr:nth-child(1) td:nth-child(4)")), "MoS₂")
        check_true("首行含原子结构缩略图", cdp.eval("(function(){return document.querySelectorAll('#page-lowdim-database-twod .t2d-thumb-box svg').length===6;})()"))
        cdp.eval("window.scrollTo(0,0)")
        cdp.shot("B1-结构特征数据集-数据信息")

        for key, want in [("electronic", ["能带结构", "态密度", "有效质量"]),
                          ("electrical", ["铁电性质", "压电性质"]),
                          ("magnetic", ["磁基态构型", "磁转变温度"]),
                          ("thermal", ["形成能", "声子谱", "声子态密度"]),
                          ("mechanical", ["弹性常数", "杨氏模量", "泊松比"]),
                          ("optical", ["介电函数", "光吸收系数", "反射率", "折射率", "消光系数"]),
                          ("defect", ["空位缺陷", "反位缺陷"])]:
            cdp.eval(js_click(PREFIX + "[data-t2d-node='ds:%s']" % key))
            time.sleep(0.55)
            h = cdp.eval("(function(){return Array.prototype.map.call(document.querySelectorAll('#page-lowdim-database-twod .t2d-table thead th'),function(t){return t.textContent;});})()")
            check("%s 列头" % key, h, ["序号", "材料名称"] + want)
            cdp.eval("window.scrollTo(0,0)")
            cdp.shot("B-%s-数据信息" % key)

        cdp.eval(js_click(PREFIX + ".t2d-tab[data-t2d-tab='overview']"))
        time.sleep(0.55)
        check("数据集概览已无指标卡片", cdp.eval(js_count(PREFIX + ".t2d-stat-grid")), 0)
        check("数据集概览保留基本信息 10 项", cdp.eval(js_count(PREFIX + ".t2d-info > div")), 10)
        check("数据集概览仍含数据量", cdp.eval("(function(){return document.querySelector('#page-lowdim-database-twod').textContent.indexOf('数据量合计')>=0;})()"), True)
        cdp.eval("window.scrollTo(0,0)")
        cdp.shot("B8-数据集信息概览")

        print("\n========== C. 新增数据集 ==========")
        cdp.eval(js_click(PREFIX + "[data-t2d-add-ds]"))
        time.sleep(0.6)
        check("弹窗标题", cdp.eval(js_text("#t2dModalMask h3")), "新增数据集")
        check("弹窗字段标签", cdp.eval("(function(){return Array.prototype.map.call(document.querySelectorAll('#t2dModalMask .t2d-form-item > label'),function(t){return t.textContent;});})()"), ["数据集名称*", "关联数据表*"])
        check("已无原生 select", cdp.eval(js_count("#t2dModalMask select")), 0)
        check("多选选项数（4 张库表）", cdp.eval(js_count("#t2dModalMask [data-t2d-f-tables]")), 4)
        check("选项控件类型为 checkbox", cdp.eval("(function(){var e=document.querySelector('#t2dModalMask [data-t2d-f-tables]');return e?e.type:'NONE';})()"), "checkbox")
        check("面板初始收起", cdp.eval(js_count("#t2dModalMask .t2d-msel.is-open")), 0)
        check("初始占位文案", cdp.eval(js_text("#t2dModalMask .t2d-msel-ph")), "请选择关联数据表（可多选）")
        cdp.shot("C1-新增数据集弹窗", full=False)

        # 点击展开多选面板
        cdp.eval(js_click("#t2dModalMask [data-t2d-msel-toggle]"))
        time.sleep(0.35)
        check("点击后面板展开", cdp.eval(js_count("#t2dModalMask .t2d-msel.is-open")), 1)
        check("面板 display 为 block", cdp.eval("(function(){var p=document.querySelector('#t2dModalMask .t2d-msel-panel');return p?getComputedStyle(p).display:'NONE';})()"), "block")
        check("面板内选项可点（4 行）", cdp.eval(js_count("#t2dModalMask .t2d-msel-opt")), 4)
        cdp.shot("C2a-多选面板展开", full=False)

        # 空值校验
        cdp.eval(js_click("#t2dModalMask [data-t2d-modal-ok]"))
        time.sleep(0.4)
        check("空名称校验提示", cdp.eval(js_text("#t2dModalMask .t2d-form-err")), "请输入数据集名称")
        cdp.shot("C2-新增表单校验", full=False)

        # 未选表校验
        cdp.eval(js_set("#t2dModalMask [data-t2d-f-name]", "界面性质数据集"))
        time.sleep(0.3)
        cdp.eval(js_click("#t2dModalMask [data-t2d-modal-ok]"))
        time.sleep(0.4)
        check("未选表校验提示", cdp.eval(js_text("#t2dModalMask .t2d-form-item:nth-child(2) .t2d-form-err")), "请选择关联数据表（至少选择 1 张）")
        check("校验后面板自动展开", cdp.eval(js_count("#t2dModalMask .t2d-msel.is-open")), 1)

        # 勾选两张库表
        cdp.eval(js_click("#t2dModalMask [data-t2d-f-tables][value='ldm_material_2d']"))
        time.sleep(0.2)
        cdp.eval(js_click("#t2dModalMask [data-t2d-f-tables][value='ldm_material_2d_structure']"))
        time.sleep(0.35)
        check("已选标签数（2 张）", cdp.eval(js_count("#t2dModalMask .t2d-msel-chip")), 2)
        check("已选标签回显", cdp.eval("(function(){return Array.prototype.map.call(document.querySelectorAll('#t2dModalMask .t2d-msel-chip'),function(t){return t.textContent;});})()"), ["ldm_material_2d", "ldm_material_2d_structure"])
        check("已选 2 行选项高亮", cdp.eval(js_count("#t2dModalMask .t2d-msel-opt.is-on")), 2)
        check("勾选后错误态已清除", cdp.eval(js_count("#t2dModalMask .t2d-form-err")), 0)
        check("已选提示文案", cdp.eval(js_text("#t2dModalMask [data-t2d-msel-tip]")), "已选 2 张表，字段结构将按所选库表合并同步")
        cdp.shot("C3-新增表单已填写", full=False)

        # 正常提交
        cdp.eval(js_click("#t2dModalMask [data-t2d-modal-ok]"))
        time.sleep(0.9)
        check("弹窗已关闭", cdp.eval("(function(){return document.getElementById('t2dModalMask')===null;})()"), True)
        check("目录数据集数量", cdp.eval(js_count(PREFIX + ".t2d-children .t2d-node-row")), 9)
        check("新数据集名称出现在目录", cdp.eval("(function(){return document.querySelector('#page-lowdim-database-twod').textContent.indexOf('界面性质数据集')>=0;})()"), True)
        check("右侧标题已跳转", cdp.eval(js_text(PREFIX + ".t2d-title-row h2")), "界面性质数据集")
        # 第六轮起：数据集标题区的「数据集」徽标与库表徽标已全部删除
        check("标题区无徽标", cdp.eval(js_count(PREFIX + ".t2d-title-row .t2d-badge")), 0)
        check("轻提示", cdp.eval(js_text("#t2dToast")), "数据集「界面性质数据集」已新增")
        # 两表字段合并：20 + 24 − 重叠 6 = 38
        check("数据信息页字段总数（合并去重）", cdp.eval("(function(){var m=document.querySelector('#page-lowdim-database-twod .t2d-page-tip');if(!m)return 'NONE';var r=m.textContent.match(/共\\s*(\\d+)\\s*个字段/);return r?Number(r[1]):'NO_MATCH';})()"), 38)
        # 第六轮起：数据信息工具条提示已删除，改用「信息概览 → 关联数据表」核验多表合并结果
        check("工具条无提示", cdp.eval(js_count(PREFIX + ".t2d-bar-tip")), 0)
        cdp.eval(js_click(PREFIX + ".t2d-tab[data-t2d-tab='overview']"))
        time.sleep(0.5)
        check_true("概览关联数据表为新两表", cdp.eval("(function(){var d=document.querySelectorAll('#page-lowdim-database-twod .t2d-info dt');for(var i=0;i<d.length;i++){if(d[i].textContent.indexOf('关联数据表')>=0){var p=d[i].parentNode;return !!p && p.textContent.indexOf('ldm_material_2d、ldm_material_2d_structure')>=0;}}return false;})()"))
        cdp.eval(js_click(PREFIX + ".t2d-tab[data-t2d-tab='info']"))
        time.sleep(0.5)
        cdp.eval("window.scrollTo(0,0)")
        cdp.shot("C4-新增后-数据信息")
        cdp.eval(js_click(PREFIX + ".t2d-tab[data-t2d-tab='overview']"))
        time.sleep(0.55)
        check("概览项名为「关联数据表」", cdp.eval("(function(){var d=document.querySelectorAll('#page-lowdim-database-twod .t2d-info dt');return Array.prototype.map.call(d,function(t){return t.textContent;}).indexOf('关联数据表')>=0;})()"), True)
        check_true("概览展示两张库表", cdp.eval("(function(){var d=document.querySelector('#page-lowdim-database-twod .t2d-info');return !!d && d.textContent.indexOf('ldm_material_2d、ldm_material_2d_structure')>=0;})()"))
        check("概览多表徽标 2 张表", cdp.eval(js_text(PREFIX + ".t2d-info .t2d-badge2")), "2 张表")
        cdp.eval("window.scrollTo(0,0)")
        cdp.shot("C5-新增后-信息概览")

        print("\n========== D. 编辑数据集 ==========")
        # 编辑新增的那个（列表最后一项）
        cdp.eval(js_click(PREFIX + ".t2d-children .t2d-node-row:last-child [data-t2d-edit-ds]"))
        time.sleep(0.6)
        check("编辑弹窗标题", cdp.eval(js_text("#t2dModalMask h3")), "编辑数据集")
        check("带出原名称", cdp.eval("(function(){return document.querySelector('#t2dModalMask [data-t2d-f-name]').value;})()"), "界面性质数据集")
        check("编辑弹窗标签为关联数据表", cdp.eval("(function(){return Array.prototype.map.call(document.querySelectorAll('#t2dModalMask .t2d-form-item > label'),function(t){return t.textContent;});})()"), ["数据集名称*", "关联数据表*"])
        check("带出已勾选库表", cdp.eval("(function(){return Array.prototype.map.call(document.querySelectorAll('#t2dModalMask [data-t2d-f-tables]:checked'),function(b){return b.value;});})()"), ["ldm_material_2d", "ldm_material_2d_structure"])
        check("编辑态已选标签 2 枚", cdp.eval(js_count("#t2dModalMask .t2d-msel-chip")), 2)
        cdp.shot("D1-编辑数据集弹窗", full=False)

        # 改名 + 调整关联数据表（取消 structure，改勾 property）
        cdp.eval(js_set("#t2dModalMask [data-t2d-f-name]", "界面与异质结数据集"))
        cdp.eval(js_click("#t2dModalMask [data-t2d-f-tables][value='ldm_material_2d_structure']"))
        time.sleep(0.2)
        cdp.eval(js_click("#t2dModalMask [data-t2d-f-tables][value='ldm_material_2d_property']"))
        time.sleep(0.35)
        check("改选后标签回显", cdp.eval("(function(){return Array.prototype.map.call(document.querySelectorAll('#t2dModalMask .t2d-msel-chip'),function(t){return t.textContent;});})()"), ["ldm_material_2d", "ldm_material_2d_property"])
        cdp.eval(js_click("#t2dModalMask [data-t2d-modal-ok]"))
        time.sleep(0.9)
        check("目录已更新名称", cdp.eval("(function(){return document.querySelector('#page-lowdim-database-twod').textContent.indexOf('界面与异质结数据集')>=0;})()"), True)
        check("旧名称已消失", cdp.eval("(function(){return document.querySelector('#page-lowdim-database-twod').textContent.indexOf('界面性质数据集')>=0;})()"), False)
        check("右侧标题已更新", cdp.eval(js_text(PREFIX + ".t2d-title-row h2")), "界面与异质结数据集")
        check("编辑轻提示含关联表调整", cdp.eval(js_text("#t2dToast")), "数据集「界面性质数据集」已更新，关联数据表已调整")
        cdp.eval(js_click(PREFIX + ".t2d-tab[data-t2d-tab='info']"))
        time.sleep(0.55)
        # 改选后两表字段合并：20 + 21 − 重叠 8 = 33
        check("改表后字段总数（合并去重）", cdp.eval("(function(){var m=document.querySelector('#page-lowdim-database-twod .t2d-page-tip');if(!m)return 'NONE';var r=m.textContent.match(/共\\s*(\\d+)\\s*个字段/);return r?Number(r[1]):'NO_MATCH';})()"), 33)
        cdp.eval(js_click(PREFIX + ".t2d-tab[data-t2d-tab='overview']"))
        time.sleep(0.5)
        check_true("概览关联数据表已切成新两表", cdp.eval("(function(){var d=document.querySelectorAll('#page-lowdim-database-twod .t2d-info dt');for(var i=0;i<d.length;i++){if(d[i].textContent.indexOf('关联数据表')>=0){var p=d[i].parentNode;return !!p && p.textContent.indexOf('ldm_material_2d、ldm_material_2d_property')>=0;}}return false;})()"))
        cdp.eval("window.scrollTo(0,0)")
        cdp.shot("D2-编辑后")

        # 编辑内置数据集
        cdp.eval(js_click(PREFIX + "[data-t2d-node='ds:optical']"))
        time.sleep(0.5)
        cdp.eval(js_click(PREFIX + ".t2d-children .t2d-node-row:nth-child(7) [data-t2d-edit-ds]"))
        time.sleep(0.6)
        check("内置数据集编辑弹窗带出名称", cdp.eval("(function(){return document.querySelector('#t2dModalMask [data-t2d-f-name]').value;})()"), "光学性质数据集")
        check("内置数据集带出原关联表", cdp.eval("(function(){return Array.prototype.map.call(document.querySelectorAll('#t2dModalMask [data-t2d-f-tables]:checked'),function(b){return b.value;});})()"), ["ldm_material_2d_property"])
        cdp.shot("D3-编辑内置数据集", full=False)
        cdp.eval(js_click("#t2dModalMask [data-t2d-modal-close]"))
        time.sleep(0.3)
        check("取消后弹窗关闭", cdp.eval("(function(){return document.getElementById('t2dModalMask')===null;})()"), True)

        print("\n========== E. 删除数据集 ==========")
        cdp.eval(js_click(PREFIX + ".t2d-children .t2d-node-row:last-child [data-t2d-del-ds]"))
        time.sleep(0.6)
        check("删除弹窗标题", cdp.eval(js_text("#t2dModalMask h3")), "删除数据集")
        check_true("删除弹窗含数据集名", cdp.eval("(function(){return document.querySelector('#t2dModalMask').textContent.indexOf('界面与异质结数据集')>=0;})()"))
        cdp.shot("E1-删除确认弹窗", full=False)
        cdp.eval(js_click("#t2dModalMask [data-t2d-modal-ok]"))
        time.sleep(0.9)
        check("删除后目录数量", cdp.eval(js_count(PREFIX + ".t2d-children .t2d-node-row")), 8)
        check("删除后名称消失", cdp.eval("(function(){return document.querySelector('#page-lowdim-database-twod').textContent.indexOf('界面与异质结数据集')>=0;})()"), False)
        check("删除后停留在原数据集", cdp.eval(js_text(PREFIX + ".t2d-title-row h2")), "光学性质数据集")
        check("删除轻提示", cdp.eval(js_text("#t2dToast")), "数据集「界面与异质结数据集」已删除")
        cdp.eval("window.scrollTo(0,0)")
        cdp.shot("E2-删除后")

        print("\n========== F. 删除内置数据集 ==========")
        cdp.eval(js_click(PREFIX + ".t2d-children .t2d-node-row:last-child [data-t2d-del-ds]"))
        time.sleep(0.5)
        cdp.eval(js_click("#t2dModalMask [data-t2d-modal-ok]"))
        time.sleep(0.8)
        check("删除内置后目录数量", cdp.eval(js_count(PREFIX + ".t2d-children .t2d-node-row")), 7)
        check("根节点计数徽标", cdp.eval(js_text(PREFIX + ".t2d-node-row:first-child .t2d-cnt")), "7")
        cdp.eval("window.scrollTo(0,0)")
        cdp.shot("F1-删除内置数据集后")

        print("\n========== G. 目录搜索 ==========")
        cdp.eval(js_set(PREFIX + "[data-t2d-filter1]", "光学"))
        time.sleep(0.6)
        check("搜索「光学」命中", cdp.eval(js_count(PREFIX + ".t2d-children .t2d-node-row")), 1)
        cdp.shot("G1-目录搜索", full=False)
        cdp.eval(js_set(PREFIX + "[data-t2d-filter1]", ""))
        time.sleep(0.5)

        print("\n========== 控制台错误 ==========")
        errs = cdp.eval("JSON.stringify(window.__errs||[])")
        print("  __errs =", errs)
        if errs and errs != "[]":
            FAIL.append("控制台错误: " + str(errs))

        print("\n===== 结果 =====")
        if FAIL:
            print("存在 %d 处失败：" % len(FAIL))
            for f in FAIL:
                print("  ✗", f)
        else:
            print("全部通过 ✓")
        return 1 if FAIL else 0
    finally:
        try:
            proc.terminate()
        except Exception:
            pass


if __name__ == "__main__":
    sys.exit(main())
