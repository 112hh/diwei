# -*- coding: utf-8 -*-
"""把 low-dim-materials.html 解析为 markup / style / script 三段序列。"""
import re, io, os, json, shutil

ROOT = r'C:\Users\Windows\Desktop\diwei'
SRC = os.path.join(ROOT, 'low-dim-materials.html')
BACKUP_DIR = os.path.join(ROOT, '_backup')
os.makedirs(BACKUP_DIR, exist_ok=True)
BACKUP = os.path.join(BACKUP_DIR, 'low-dim-materials.backup-20260922-pre-split.html')

s = io.open(SRC, encoding='utf-8', errors='replace', newline='').read()
print('src len', len(s))

# ---------- 顺序解析 ----------
OPEN = re.compile(r'<(script|style)\b[^>]*>', re.I)
parts = []          # (kind, text)  kind: markup/style/script ; style/script 含外层标签
buf = []
i, n = 0, len(s)
while i < n:
    j = s.find('<', i)
    if j < 0:
        buf.append(s[i:])
        break
    m = OPEN.match(s, j)
    if m:
        kind = m.group(1).lower()
        open_end = m.end()
        close_re = re.compile(r'</' + kind + r'\s*>', re.I)
        cm = close_re.search(s, open_end)
        if not cm:
            # 未闭合，当作普通标记
            buf.append(s[i:j + 1])
            i = j + 1
            continue
        buf.append(s[i:j])
        parts.append(('markup', ''.join(buf)))
        buf = []
        parts.append((kind, s[j:cm.end()]))
        i = cm.end()
    else:
        buf.append(s[i:j + 1])
        i = j + 1
buf.append('')
parts.append(('markup', ''.join(buf)))

# 合并相邻 markup
merged = []
for kind, text in parts:
    if merged and merged[-1][0] == 'markup' and kind == 'markup':
        merged[-1] = ('markup', merged[-1][1] + text)
    else:
        merged.append((kind, text))
parts = [p for p in merged if p[1]]

# ---------- 校验：拼接可还原原文 ----------
rebuilt = ''.join(t for _, t in parts)
print('roundtrip ok:', rebuilt == s, len(rebuilt), len(s))

from collections import Counter
print(Counter(k for k, _ in parts))

# ---------- 切分 head / body / tail ----------
markup_idx = [k for k, (kind, _) in enumerate(parts) if kind == 'markup']
pre_body, in_body, tail = [], [], []
stage = 'pre'
for idx, (kind, text) in enumerate(parts):
    if kind == 'markup':
        # 找 <body 与 </body>
        b = text.find('<body')
        e = text.find('</body')
        if stage == 'pre' and b >= 0:
            pre_body.append(text[:b])
            rest = text[b:]
            e2 = rest.find('</body')
            if e2 >= 0:
                in_body.append(rest[:e2 + 7])
                tail.append(rest[e2 + 7:])
                stage = 'tail'
            else:
                in_body.append(rest)
                stage = 'body'
        elif stage == 'body':
            if e >= 0:
                in_body.append(text[:e + 7])
                tail.append(text[e + 7:])
                stage = 'tail'
            else:
                in_body.append(text)
        else:
            (pre_body if stage == 'pre' else tail).append(text)
    else:
        # style/script 归属当前阶段（只影响统计，不影响产物）
        pass

pre = ''.join(pre_body)
body = ''.join(in_body)
tailtext = ''.join(tail)
print('--- pre-body markup (len %d) ---' % len(pre))
print(repr(pre[:600]))
print('...')
print(repr(pre[-200:]))
print('--- body markup len', len(body), ' tail len', len(tailtext))

styles = [t for k, t in parts if k == 'style']
scripts = [t for k, t in parts if k == 'script']
print('styles', len(styles), 'total', sum(len(x) for x in styles))
print('scripts', len(scripts), 'total', sum(len(x) for x in scripts))

# ---------- 备份 ----------
if not os.path.exists(BACKUP):
    shutil.copy2(SRC, BACKUP)
    print('backup ->', BACKUP)

io.open(os.path.join(ROOT, '_tools', '_body_markup.html'), 'w', encoding='utf-8', newline='').write(body)
meta = {
    'styleCount': len(styles),
    'scriptCount': len(scripts),
    'bodyMarkupLen': len(body),
    'preLen': len(pre),
    'tailLen': len(tailtext),
}
io.open(os.path.join(ROOT, '_tools', '_meta.json'), 'w', encoding='utf-8').write(json.dumps(meta, ensure_ascii=False, indent=2))
print('done')
