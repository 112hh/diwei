# -*- coding: utf-8 -*-
"""诊断：五个数据库页面的关键元素 computed style + 几何尺寸对照。

输出一张「属性 × 页面」的表，用来定位哪一页和二维库（基准）不一致。
"""
import json, os, subprocess, time, urllib.request
import websocket  # type: ignore

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
DIWEI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROFILE = os.path.join(DIWEI, "_tools", "_chromeprofile_diag")
PORT = 9370

DBS = [
    ("twod", "lowdim-database-twod", "lowdim-database-twod.html"),
    ("opto", "lowdim-database-opto", "lowdim-database-opto.html"),
    ("electrolyte", "lowdim-database-electrolyte", "lowdim-database-electrolyte.html"),
    ("mlff", "lowdim-database-mlff", "lowdim-database-mlff.html"),
    ("catalyst", "lowdim-database-catalyst", "lowdim-database-catalyst.html"),
]

# 要对比的「元素（相对页面）→ 属性」
TARGETS = [
    ("PAGE", "", ["display", "padding", "margin", "background-color", "background", "border-radius", "overflow"]),
    ("PARENT", "__PARENT__", ["display", "padding", "margin", "background-color", "max-width", "width"]),
    ("ROOT", ".t2d-root", ["display", "background-color", "border", "border-radius", "overflow", "width", "height"]),
    ("SIDE", ".t2d-side", ["display", "width", "flex", "border-right", "background-color", "padding"]),
    ("MAIN", ".t2d-main", ["display", "flex", "padding", "background-color", "width"]),
    ("H2", ".t2d-title-row h2", ["font-size", "font-weight", "color", "font-family", "line-height", "margin"]),
    ("TAB", ".t2d-tab", ["font-size", "font-weight", "color", "padding", "height", "border-radius"]),
    ("TABLE", ".t2d-table", ["width", "border-collapse", "font-size", "table-layout"]),
    ("TH", ".t2d-table thead th", ["padding", "font-size", "font-weight", "color", "background-color", "text-align", "white-space", "border-bottom"]),
    ("TD", ".t2d-table tbody td", ["padding", "font-size", "font-weight", "color", "white-space", "border-bottom", "text-align"]),
    ("INFO", ".t2d-info", ["display", "grid-template-columns", "gap", "padding", "font-size"]),
    ("BAR", ".t2d-bar", ["display", "padding", "gap", "margin-bottom", "align-items"]),
    ("PAGER", ".t2d-pager", ["display", "gap", "font-size", "padding", "margin-top", "justify-content"]),
    ("FOOT", ".t2d-foot", ["display", "padding", "font-size", "color", "border-top", "margin-top"]),
    ("CARD", ".t2d-card", ["background-color", "border", "border-radius", "padding", "box-shadow"]),
]

PROPS = []
for _, _, props in TARGETS:
    for p in props:
        if p not in PROPS:
            PROPS.append(p)


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
    raise RuntimeError("no chrome")


class CDP(object):
    def __init__(self, url):
        self.ws = websocket.create_connection(url, timeout=60)
        self.i = 0

    def send(self, method, **params):
        self.i += 1
        self.ws.send(json.dumps({"id": self.i, "method": method, "params": params}))
        while True:
            m = json.loads(self.ws.recv())
            if m.get("id") == self.i:
                return m.get("result", {})

    def eval(self, expr):
        r = self.send("Runtime.evaluate", expression=expr, returnByValue=True)
        if r.get("exceptionDetails"):
            return "EXC"
        return r.get("result", {}).get("value")


def probe(cdp, pid):
    """返回 {target: {prop: value}}"""
    out = {}
    for label, sub, props in TARGETS:
        if sub == "__PARENT__":
            js = ("(function(){var p=document.getElementById(%s);p=p&&p.parentNode;"
                  "if(!p)return null;var c=getComputedStyle(p);var o={};%s;return o;})()") % (
                json.dumps("page-" + pid),
                ";".join(["o[%s]=c.getPropertyValue(%s)" % (json.dumps(p), json.dumps(p)) for p in props]))
        elif sub == "":
            js = ("(function(){var e=document.getElementById(%s);if(!e)return null;"
                  "var c=getComputedStyle(e);var o={};%s;return o;})()") % (
                json.dumps("page-" + pid),
                ";".join(["o[%s]=c.getPropertyValue(%s)" % (json.dumps(p), json.dumps(p)) for p in props]))
        else:
            js = ("(function(){var e=document.querySelector(%s);if(!e)return null;"
                  "var c=getComputedStyle(e);var o={};%s;return o;})()") % (
                json.dumps("#page-%s %s" % (pid, sub)),
                ";".join(["o[%s]=c.getPropertyValue(%s)" % (json.dumps(p), json.dumps(p)) for p in props]))
        out[label] = cdp.eval(js)
    # 几何
    geo = {}
    for label, sub, _ in TARGETS:
        if sub == "__PARENT__":
            js = "(function(){var p=document.getElementById(%s).parentNode;var r=p.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)];})()" % json.dumps(pid)
        elif sub == "":
            js = "(function(){var r=document.getElementById(%s).getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)];})()" % json.dumps(pid)
        else:
            js = "(function(){var e=document.querySelector(%s);if(!e)return null;var r=e.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)];})()" % json.dumps("#page-%s %s" % (pid, sub))
        geo[label] = cdp.eval(js)
    out["__geo__"] = geo
    return out


def main():
    result = {}
    for idx, (key, pid, html) in enumerate(DBS):
        url = "file:///" + os.path.join(DIWEI, html).replace("\\", "/")
        proc, ws = boot(url, PORT + idx)
        try:
            cdp = CDP(ws)
            cdp.send("Runtime.enable")
            cdp.send("Page.enable")
            cdp.send("Page.reload")
            time.sleep(1.0)
            cdp.send("Emulation.setDeviceMetricsOverride", width=1680, height=1020, deviceScaleFactor=1, mobile=False)
            time.sleep(2.6)
            cdp.eval("(function(){try{switchPage(%s);}catch(e){return 'EXC';}return 'OK';})()" % json.dumps(pid))
            time.sleep(1.0)
            result[key] = probe(cdp, pid)
            # 第二轮：点开本库第一个数据集，再抓一次（覆盖工具条/分页器/页脚/卡片）
            cdp.eval("(function(){var e=document.querySelector(%s);if(!e)return 'NOT_FOUND';e.click();return 'OK';})()"
                     % json.dumps("#page-%s .t2d-children .t2d-node-row [data-t2d-node]" % pid))
            time.sleep(0.8)
            result[key + "__ds"] = probe(cdp, pid)
            print("probe done:", key, "+ ds")
        finally:
            try:
                proc.terminate()
            except Exception:
                pass
            time.sleep(0.3)

    with open(os.path.join(DIWEI, "_tools", "_diag_style_diff.json"), "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=1)

    # 打印差异（以 twod 为基准）
    print("\n===== 与二维库不一致的项 =====")
    for scope in ["", "__ds"]:
        base = result["twod" + scope]
        print("\n########## %s ##########" % ("数据集级" if scope else "库级"))
        for key in [k for k, _, _ in DBS if k != "twod"]:
            cur = result[key + scope]
            diffs = []
            for label, _, props in TARGETS:
                b, c = base.get(label), cur.get(label)
                if b is None and c is None:
                    continue
                if b is None or c is None:
                    diffs.append("%s: 单边存在 (base=%s, cur=%s)" % (label, b is not None, c is not None))
                    continue
                for p in props:
                    if b.get(p) != c.get(p):
                        diffs.append("%s.%s: base=%r  cur=%r" % (label, p, b.get(p), c.get(p)))
            for label in ["PAGE", "PARENT", "ROOT", "SIDE", "MAIN"]:
                bg, cg = base["__geo__"].get(label), cur["__geo__"].get(label)
                if bg and cg and bg != cg:
                    if label == "ROOT" or label == "MAIN" or label == "SIDE":
                        # 高度由内容量决定，只比横向几何
                        if bg[0] != cg[0] or bg[2] != cg[2]:
                            diffs.append("GEO %s: base=%s cur=%s" % (label, bg, cg))
                        else:
                            continue
                    else:
                        diffs.append("GEO %s: base=%s cur=%s" % (label, bg, cg))
            print("\n--- %s ---" % key)
            if not diffs:
                print("  （完全一致）")
            for d in diffs:
                print("  ✗", d)


if __name__ == "__main__":
    main()
