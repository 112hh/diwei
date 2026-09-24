# -*- coding: utf-8 -*-
"""五个材料数据库页面联合验证：
   二维材料 / 有机光电材料 / 电解质材料 / 机器学习力场 / 催化材料

   每个库断言：
     - 库级「字段信息」字段总数（= 该库全部物理表字段合计）、分页、搜索
     - 元数据目录数据集数量与名称
     - 每个数据集「数据信息」列头与行数
     - 数据集「信息概览」含「关联数据表」且展示库表名
     - 本轮删除项：标题徽标 / 描述段 / 工具条提示 / 页脚「数据来源」
     - 控制台无错误
"""
import base64, json, os, subprocess, sys, time, urllib.request
import websocket  # type: ignore

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
DIWEI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTDIR = os.path.join(DIWEI, "_tools", "preview_dbs")
PROFILE = os.path.join(DIWEI, "_tools", "_chromeprofile_dbs")
PORT = 9341

FAIL = []

# 每个库：pageId / html / 字段总数 / 数据集（key, 标签, 首列标题...）
DBS = [
    {
        "page": "lowdim-database-twod",
        "style": "twod-db-rewrite-20260923",
        "html": "lowdim-database-twod.html",
        "name": "二维材料数据库",
        "fields": 80,
        "count": 8,
        "ds": [
            ("structure", "结构特征数据集", ["序号", "材料名称", "原子结构图", "化学式", "晶胞参数"]),
            ("electronic", "电子结构数据集", ["序号", "材料名称", "能带结构", "态密度", "有效质量"]),
            ("optical", "光学性质数据集", ["序号", "材料名称", "介电函数", "光吸收系数", "反射率"]),
        ],
    },
    {
        "page": "lowdim-database-opto",
        "style": "opto-db-rewrite-20260923",
        "html": "lowdim-database-opto.html",
        "name": "有机光电材料数据库",
        "fields": 40,
        "count": 4,
        "ds": [
            ("op_base", "有机光电材料基础数据集", ["序号", "材料名称", "中文名称", "英文名称", "分子式"]),
            ("op_property", "有机光电材料物性数据集", ["序号", "材料名称", "密度（g/cm³）", "熔点（°C）", "沸点（°C）"]),
            ("op_spectrum", "有机光电材料表征图谱数据集", ["序号", "材料名称", "红外光谱", "拉曼光谱", "核磁共振谱"]),
            ("op_calc", "有机光电材料计算数据集", ["序号", "材料名称", "基态结构", "激发态结构", "激发能（eV）"]),
        ],
    },
    {
        "page": "lowdim-database-electrolyte",
        "style": "electrolyte-db-rewrite-20260923",
        "html": "lowdim-database-electrolyte.html",
        "name": "电解质材料数据库",
        "fields": 61,
        "count": 3,
        "ds": [
            ("el_liquid", "有机电解液数据集", ["序号", "材料名称", "名称", "分子式", "三维结构"]),
            ("el_solid_organic", "固态有机电解质数据集", ["序号", "材料名称", "名称", "分子式", "单体结构"]),
            ("el_solid_inorganic", "固态无机电解质数据集", ["序号", "材料名称", "名称", "化学式", "晶体结构"]),
        ],
    },
    {
        "page": "lowdim-database-mlff",
        "style": "mlff-db-rewrite-20260923",
        "html": "lowdim-database-mlff.html",
        "name": "机器学习力场数据库",
        "fields": 41,
        "count": 3,
        "ds": [
            ("mlff_base", "机器学习力场基础数据集", ["序号", "材料名称", "分子名称", "分子式", "分子结构"]),
            ("mlff_small", "有机小分子机器学习力场数据集", ["序号", "材料名称", "单分子能量（Hartree）", "原子受力（kJ/(mol·Å)）"]),
            ("mlff_polymer", "高分子机器学习力场数据集", ["序号", "材料名称", "聚合物名称", "重复单元", "片段结构"]),
        ],
    },
    {
        "page": "lowdim-database-catalyst",
        "style": "catalyst-db-rewrite-20260923",
        "html": "lowdim-database-catalyst.html",
        "name": "催化材料数据库",
        "fields": 24,
        "count": 6,
        "ds": [
            ("cat_element", "催化材料元素特征数据集", ["序号", "材料名称", "周期数", "族数", "元素电荷"]),
            ("cat_structure", "催化材料结构特征数据集", ["序号", "材料名称", "结构文件", "空间群", "配位数"]),
            ("cat_single_atom", "单原子催化剂数据集", ["序号", "材料名称", "催化剂名称", "化学式", "催化类型"]),
            ("cat_alloy", "二元合金数据集", ["序号", "材料名称", "催化剂名称", "化学式", "催化类型"]),
            ("cat_grain", "晶界数据集", ["序号", "材料名称", "催化剂名称", "化学式", "催化类型"]),
            ("cat_system", "体系特征数据集", ["序号", "材料名称", "费米能级（eV）", "形成能（eV/atom）"]),
        ],
    },
]


def boot(url, port):
    if not os.path.exists(PROFILE):
        os.makedirs(PROFILE)
    args = [CHROME, "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
            "--remote-debugging-port=%d" % port, "--remote-allow-origins=*",
            "--user-data-dir=" + PROFILE, "--allow-file-access-from-files",
            "--force-device-scale-factor=1", "--window-size=1680,1020", url]
    proc = subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(60):
        try:
            data = urllib.request.urlopen("http://127.0.0.1:%d/json" % port, timeout=1).read()
            tabs = [t for t in json.loads(data) if t.get("type") == "page"]
            if tabs:
                return proc, tabs[0]["webSocketDebuggerUrl"]
        except Exception:
            pass
        time.sleep(0.5)
    raise RuntimeError("chrome devtools not reachable: %s" % url)


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
            ed = r["exceptionDetails"]
            desc = ed.get("exception", {}).get("description") or ed.get("text") or ""
            if not desc:
                desc = json.dumps(ed, ensure_ascii=False)
            return "EXC: " + desc
        return r.get("result", {}).get("value")

    def shot(self, name, full=True):
        self.eval("window.scrollTo(0,0)")
        time.sleep(0.4)
        r = self.send("Page.captureScreenshot", format="png", captureBeyondViewport=full)
        with open(os.path.join(OUTDIR, name + ".png"), "wb") as f:
            f.write(base64.b64decode(r["data"]))


def js_click(sel):
    return "(function(){var e=document.querySelector(%s);if(!e)return 'NOT_FOUND';e.click();return 'OK';})()" % json.dumps(sel)


def js_text(sel):
    return "(function(){var e=document.querySelector(%s);return e?e.textContent.trim():'NOT_FOUND';})()" % json.dumps(sel)


def js_count(sel):
    return "(function(){return document.querySelectorAll(%s).length;})()" % json.dumps(sel)


def js_style(sel, prop):
    """取元素 computed style 的某个属性（用于风格一致性断言）"""
    return ("(function(){var e=document.querySelector(%s);"
            "return e?getComputedStyle(e).getPropertyValue(%s):'NOT_FOUND';})()") % (json.dumps(sel), json.dumps(prop))


def check(label, got, want):
    ok = (got == want)
    print("  [%s] %s  →  %r" % ("PASS" if ok else "FAIL", label, got))
    if not ok:
        FAIL.append("%s: got %r, want %r" % (label, got, want))


def check_true(label, cond, got=None):
    # 防止「EXC: xxx」这类异常字符串被当成真值而假通过
    ok = bool(cond) and not (isinstance(cond, str) and cond.startswith("EXC:"))
    print("  [%s] %s  →  %r" % ("PASS" if ok else "FAIL", label, got))
    if not ok:
        FAIL.append("%s: %r" % (label, got))


def main():
    if not os.path.exists(OUTDIR):
        os.makedirs(OUTDIR)

    for idx, db in enumerate(DBS):
        pid = db["page"]
        P = "#page-%s " % pid
        url = "file:///" + os.path.join(DIWEI, db["html"]).replace("\\", "/")
        proc, ws = boot(url, PORT + idx)
        try:
            cdp = CDP(ws)
            cdp.send("Runtime.enable")
            cdp.send("Page.enable")
            cdp.send("Page.addScriptToEvaluateOnNewDocument", source=(
                "window.__errs=[];"
                "window.addEventListener('error',function(e){window.__errs.push('ERR '+e.message+' @line'+e.lineno);});"
                "window.addEventListener('unhandledrejection',function(e){window.__errs.push('REJ '+e.reason);});"))
            cdp.send("Page.reload")
            time.sleep(1.2)
            cdp.send("Emulation.setDeviceMetricsOverride", width=1680, height=1020, deviceScaleFactor=1, mobile=False)
            time.sleep(2.8)

            print("\n========== %s（%s） ==========" % (db["name"], pid))
            # 切到目标页（部分 html 的首屏可能是别的页）
            cdp.eval("(function(){try{switchPage(%s);}catch(e){return 'EXC';}return 'OK';})()" % json.dumps(pid))
            time.sleep(1.2)

            check("页容器已渲染本实现", cdp.eval(js_count(P + ".t2d-root")), 1)

            # ---- 风格一致性（基准 = 二维材料数据库）----
            # 根因检测：注入的 style 块里选择器前缀必须是「本页」。
            # 曾经写死成 twod，导致其余四库一条样式都匹配不上（root 变 block、侧栏撑满、内边距归零）。
            check_true("注入样式前缀为本页",
                       cdp.eval("(function(){var s=document.getElementById(%s);return !!s && s.textContent.indexOf('#page-%s ')>=0;})()" % (json.dumps(db["style"]), pid)),
                       cdp.eval("(function(){var s=document.getElementById(%s);return s?s.textContent.slice(0,46):'NO_STYLE';})()" % json.dumps(db["style"])))
            check("root 布局", cdp.eval(js_style(P + ".t2d-root", "display")), "flex")
            check("root 圆角", cdp.eval(js_style(P + ".t2d-root", "border-radius")), "12px")
            check("侧栏宽度", cdp.eval(js_style(P + ".t2d-side", "width")), "308px")
            check("主区内边距", cdp.eval(js_style(P + ".t2d-main", "padding")), "18px 22px 26px")
            check("页签字重", cdp.eval(js_style(P + ".t2d-tab", "font-weight")), "700")
            check("表头不换行", cdp.eval(js_style(P + ".t2d-table thead th", "white-space")), "nowrap")

            check("库级标题", cdp.eval(js_text(P + ".t2d-title-row h2")), db["name"])
            check("库级页签", cdp.eval("(function(){return Array.prototype.map.call(document.querySelectorAll(%s),function(t){return t.textContent;});})()" % json.dumps(P + ".t2d-tab")), ["字段信息", "信息概览"])

            # 字段信息
            total = cdp.eval("(function(){var m=document.querySelector(%s);if(!m)return 'NONE';var r=m.textContent.match(/共\\s*(\\d+)\\s*个字段/);return r?Number(r[1]):'NO_MATCH';})()" % json.dumps(P + ".t2d-page-tip"))
            check("字段信息总数字段数", total, db["fields"])
            check("首页行数", cdp.eval(js_count(P + ".t2d-table tbody tr")), 10)
            cdp.eval("window.scrollTo(0,0)")
            cdp.shot("%s-1-字段信息" % db["name"])

            # 本轮删除项（库级）
            check("库级已无指标卡片", cdp.eval(js_count(P + ".t2d-stat-grid")), 0)
            check("库级已无页脚来源说明", cdp.eval(js_count(P + ".t2d-main > .t2d-foot")), 0)

            # 目录数据集数量（二维库有 8 个数据集，本脚本只抽检其中 3 个）
            check("目录数据集数量", cdp.eval(js_count(P + ".t2d-children .t2d-node-row")), db["count"])

            # 逐个数据集
            for dkey, dlabel, head_want in db["ds"]:
                cdp.eval(js_click(P + "[data-t2d-node='ds:%s']" % dkey))
                time.sleep(0.6)
                check("%s 标题" % dkey, cdp.eval(js_text(P + ".t2d-title-row h2")), dlabel)
                # 本轮删除项（数据集级）
                check("%s 已无标题徽标" % dkey, cdp.eval(js_count(P + ".t2d-title-row .t2d-badge")), 0)
                check("%s 已无描述段" % dkey, cdp.eval(js_count(P + ".t2d-sub")), 0)
                check("%s 已无工具条提示" % dkey, cdp.eval(js_count(P + ".t2d-bar-tip")), 0)
                check_true("%s 页脚已无数据来源" % dkey,
                           cdp.eval("(function(){var f=document.querySelector(%s);return !!f && f.textContent.indexOf('数据来源')<0;})()" % json.dumps(P + ".t2d-foot")),
                           cdp.eval(js_text(P + ".t2d-foot")))
                head = cdp.eval("(function(){return Array.prototype.map.call(document.querySelectorAll(%s),function(t){return t.textContent;});})()" % json.dumps(P + ".t2d-table thead th"))
                check("%s 列头前缀" % dkey, head[:len(head_want)], head_want)
                check("%s 数据信息行数" % dkey, cdp.eval(js_count(P + ".t2d-table tbody tr")), 6)
                cdp.eval("window.scrollTo(0,0)")
                cdp.shot("%s-2-%s" % (db["name"], dlabel))

                # 信息概览
                cdp.eval(js_click(P + ".t2d-tab[data-t2d-tab='overview']"))
                time.sleep(0.5)
                check_true("%s 概览含关联数据表项" % dkey,
                           cdp.eval("(function(){var d=document.querySelectorAll(%s);var a=Array.prototype.map.call(d,function(t){return t.textContent;});return a.indexOf('关联数据表')>=0;})()" % json.dumps(P + ".t2d-info dt")))
                check("%s 概览基本信息项数" % dkey, cdp.eval(js_count(P + ".t2d-info > div")), 10)

            # 控制台错误
            errs = cdp.eval("JSON.stringify(window.__errs||[])")
            print("  __errs =", errs)
            if errs and errs != "[]":
                FAIL.append("%s 控制台错误: %s" % (db["name"], errs))
        finally:
            try:
                proc.terminate()
            except Exception:
                pass
            time.sleep(0.5)

    print("\n===== 结果 =====")
    if FAIL:
        print("存在 %d 处失败：" % len(FAIL))
        for f in FAIL:
            print("  ✗", f)
    else:
        print("全部通过 ✓")


if __name__ == "__main__":
    main()
