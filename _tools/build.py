# -*- coding: utf-8 -*-
"""由备份源重建：共享 CSS/JS + 每个菜单项一个独立 HTML。"""
import re, io, os, json, shutil

ROOT = r'C:\Users\Windows\Desktop\diwei'
SRC = os.path.join(ROOT, '_backup', 'low-dim-materials.backup-20260922-pre-split.html')
ASSETS = os.path.join(ROOT, 'assets')
JSDIR = os.path.join(ASSETS, 'js')
os.makedirs(JSDIR, exist_ok=True)

s = io.open(SRC, encoding='utf-8', errors='replace', newline='').read()

OPEN = re.compile(r'<(script|style)\b[^>]*>', re.I)
parts, buf, i, n = [], [], 0, len(s)
while i < n:
    j = s.find('<', i)
    if j < 0:
        buf.append(s[i:]); break
    m = OPEN.match(s, j)
    if m:
        kind = m.group(1).lower()
        cm = re.compile(r'</' + kind + r'\s*>', re.I).search(s, m.end())
        if not cm:
            buf.append(s[i:j + 1]); i = j + 1; continue
        buf.append(s[i:j]); parts.append(('markup', ''.join(buf))); buf = []
        parts.append((kind, s[j:cm.end()])); i = cm.end()
    else:
        buf.append(s[i:j + 1]); i = j + 1
buf.append(''); parts.append(('markup', ''.join(buf)))
merged = []
for kind, text in parts:
    if merged and merged[-1][0] == 'markup' and kind == 'markup':
        merged[-1] = ('markup', merged[-1][1] + text)
    else:
        merged.append((kind, text))
parts = [p for p in merged if p[1]]
assert ''.join(t for _, t in parts) == s

# body markup
stage, pre, body = 'pre', [], []
for kind, text in parts:
    if kind != 'markup':
        continue
    if stage == 'pre':
        b = text.find('<body')
        if b >= 0:
            pre.append(text[:b]); body.append(text[b:]); stage = 'body'
        else:
            pre.append(text)
    elif stage == 'body':
        e = text.find('</body')
        if e >= 0:
            body.append(text[:e + 7]); stage = 'tail'
        else:
            body.append(text)
BODY = ''.join(body)
# 去掉 </body>
if BODY.rstrip().endswith('</body>'):
    BODY = BODY[:BODY.rfind('</body>')]

styles = [t for k, t in parts if k == 'style']
scripts = [t for k, t in parts if k == 'script']

def inner(tag_text):
    a = tag_text.find('>')
    b = tag_text.rfind('</')
    return tag_text[a + 1:b]

# ---------- 写共享 CSS ----------
css = '\n\n'.join(inner(t) for t in styles)
io.open(os.path.join(ASSETS, 'app.css'), 'w', encoding='utf-8', newline='').write(css)

# ---------- 写共享 JS（按原顺序，一块一个文件，保留块级错误隔离） ----------
js_names = []
for idx, t in enumerate(scripts):
    name = '%02d.js' % idx
    js_names.append('js/' + name)
    io.open(os.path.join(JSDIR, name), 'w', encoding='utf-8', newline='').write(inner(t))

# 追加层（二维材料数据库改造），放在最后
EXTRA_LAYER = os.path.join(ROOT, '_tools', 'layer_twod_database.js')
if os.path.exists(EXTRA_LAYER):
    js_names.append('js/99-layer.js')
    io.open(os.path.join(JSDIR, '99-layer.js'), 'w', encoding='utf-8', newline='').write(
        io.open(EXTRA_LAYER, encoding='utf-8').read())

SCRIPT_TAGS = '\n'.join('  <script src="assets/%s"></script>' % n for n in js_names)

# ---------- 页面清单 ----------
PAGES = [
    ('monitor', '监控统计', [('dashboard', '数据看板', True)]),
    ('standards', '低维材料标准体系', [('standard-twod', '低维材料标准体系', False)]),
    ('ingest', '低维材料数据入库', [
        ('lowdim-ingest-twod', '二维材料数据采集加工处理', False),
        ('lowdim-ingest-opto', '有机光电材料数据采集加工处理', False),
        ('lowdim-ingest-electrolyte', '电解质材料数据采集加工处理', False),
        ('lowdim-ingest-mlff', '机器学习力场数据采集加工处理', False),
        ('lowdim-ingest-catalyst', '催化材料数据采集加工处理', False),
    ]),
    ('standardization', '低维材料数据标准化', [
        ('lowdim-standardization-twod', '二维材料数据库标准化', False),
        ('lowdim-standardization-opto', '有机光电材料数据库标准化', False),
        ('lowdim-standardization-electrolyte', '电解质材料数据库标准化', False),
        ('lowdim-standardization-mlff', '机器学习力场数据库标准化', False),
        ('lowdim-standardization-catalyst', '催化材料数据库标准化', False),
    ]),
    ('database', '低维材料数据库', [
        ('lowdim-database-twod', '二维材料数据库', False),
        ('lowdim-database-opto', '有机光电材料数据库', False),
        ('lowdim-database-electrolyte', '电解质材料数据库', False),
        ('lowdim-database-mlff', '机器学习力场数据库', False),
        ('lowdim-database-catalyst', '催化材料数据库', False),
    ]),
    ('applications', '低维材料主题应用', [
        ('twod', '二维材料数据应用', False),
        ('electrolyte', '电解质材料数据应用', False),
        ('opto', '有机光电材料应用', False),
        ('mlff', '机器学习力场应用', False),
        ('catalyst', '催化材料数据应用', False),
    ]),
    ('analysis', '低维材料数据库分析预测', [
        ('algorithms', '数据应用算法', False),
        ('tools', '数据工具开发', False),
        ('prediction-tasks', '预测任务管理', False),
    ]),
    ('workflow', '数据管理', [
        ('data-submit', '数据上传', False),
        ('my-submissions', '我的提交', False),
        ('twod-review', '入库审核', True),
    ]),
    ('algorithm-tools', '算法/工具管理', [('sys-algorithm', '算法/接口管理', False)]),
    ('system', '系统管理', [
        ('sys-permission', '权限审批', True),
        ('sys-user', '用户管理', True),
        ('sys-role', '角色管理', True),
        ('sys-menu', '菜单管理', True),
        ('sys-dict', '字典管理', True),
        ('system-config', '平台配置', True),
        ('sys-log', '操作日志', True),
    ]),
]

BOOTSTRAP = r'''  <script>
    /* 独立页面引导：以管理员身份直达本页（普通角色会被角色守卫回落到首页） */
    (function () {
      var target = "%s";
      function activate() {
        try {
          var page = document.getElementById("page-" + target);
          if (!page) return false;
          var ok = page.classList.contains("active");
          if (!ok) {
            document.querySelectorAll(".page").forEach(function (n) { n.classList.remove("active"); });
            page.classList.add("active");
          }
          var nav = document.querySelector('.sidebar .nav-btn[data-page="' + target + '"]');
          if (nav) {
            document.querySelectorAll(".nav-btn").forEach(function (n) { n.classList.remove("active"); });
            nav.classList.add("active");
          }
          return true;
        } catch (e) { return false; }
      }
      try {
        if (typeof state !== "undefined") { state.isAuthenticated = true; state.loginRole = "admin"; }
        if (typeof setUserRole === "function") setUserRole("admin");
        if (typeof syncAuthView === "function") syncAuthView();
        if (typeof switchPage === "function") switchPage(target);
      } catch (e) { console.warn("standalone bootstrap", e); }
      activate();
      [0, 120, 400, 900].forEach(function (d) { setTimeout(activate, d); });
    })();
  </script>
'''


def write_page(path, title, standalone=None, role=None):
    head = ['<!DOCTYPE html>', '<html lang="zh-CN">', '<head>',
            '  <meta charset="UTF-8">',
            '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
            '  <title>%s</title>' % title]
    if standalone:
        head.append('  <meta name="lowdim-standalone-page" content="%s">' % standalone)
    head.append('  <link rel="stylesheet" href="assets/app.css">')
    head.append('</head>')
    out = '\r\n'.join(head) + '\r\n<body>\r\n' + BODY + '\r\n' + SCRIPT_TAGS + '\r\n'
    if standalone:
        out += BOOTSTRAP % standalone
    out += '</body>\r\n</html>\r\n'
    io.open(path, 'w', encoding='utf-8', newline='').write(out)

# 完整应用入口（保留 portal.html 的登录跳转链路）
write_page(os.path.join(ROOT, 'low-dim-materials.html'), '低维材料主题库')

for group, glabel, items in PAGES:
    for pid, label, is_admin in items:
        write_page(os.path.join(ROOT, pid + '.html'),
                   '低维材料主题库 · ' + label,
                   standalone=pid,
                   role=('admin' if is_admin else None))

# ---------- index.html 导航 ----------
nav = []
for group, glabel, items in PAGES:
    nav.append('    <section class="nav-group"><h2>%s</h2><div class="nav-items">' % glabel)
    for pid, label, _ in items:
        nav.append('      <a class="nav-item" href="%s.html"><span>%s</span><code>%s.html</code></a>' % (pid, label, pid))
    nav.append('    </div></section>')
idx = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>低维材料主题库 · 页面导航</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 32px 28px 56px; background: #f5f8fc; color: #22395c;
           font-family: "Microsoft YaHei", "PingFang SC", system-ui, sans-serif; }
    .wrap { max-width: 1180px; margin: 0 auto; }
    h1 { margin: 0 0 6px; font-size: 26px; }
    .sub { margin: 0 0 26px; color: #6b7f9c; font-size: 14px; }
    .quick { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 28px; }
    .quick a { padding: 9px 16px; border-radius: 10px; background: #165DFF; color: #fff;
               font-size: 14px; text-decoration: none; }
    .quick a.gray { background: #fff; color: #3d4d68; border: 1px solid #cbd8eb; }
    .nav-group { margin-bottom: 22px; }
    .nav-group h2 { margin: 0 0 10px; font-size: 15px; color: #165DFF; }
    .nav-items { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
    .nav-item { display: flex; align-items: center; justify-content: space-between; gap: 10px;
                padding: 12px 14px; border: 1px solid #dde6f2; border-radius: 10px; background: #fff;
                color: #22395c; text-decoration: none; font-size: 14px; }
    .nav-item:hover { border-color: #165DFF; box-shadow: 0 4px 14px rgba(22,93,255,.12); }
    .nav-item code { color: #94a5bd; font-size: 12px; }
    @media (max-width: 900px) { .nav-items { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>低维材料主题库 · 页面导航</h1>
    <p class="sub">按左侧菜单栏拆分为 %d 个独立页面，每个页面打开后直达对应功能；<code>low-dim-materials.html</code> 为完整应用入口（登录后可切换全部页面）。</p>
    <div class="quick">
      <a href="low-dim-materials.html">完整应用入口（含登录）</a>
      <a class="gray" href="portal.html">门户首页</a>
    </div>
%s
  </div>
</body>
</html>
""" % (sum(len(x[2]) for x in PAGES), '\n'.join(nav))
io.open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8', newline='').write(idx)

print('pages:', sum(len(x[2]) for x in PAGES))
print('scripts:', len(js_names), 'css bytes:', len(css))
print('done')
