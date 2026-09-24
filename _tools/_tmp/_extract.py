# -*- coding: utf-8 -*-
import io, re, os
p = r'C:/Users/Windows/Desktop/diwei/_tools/_xlsx_dump.txt'
out = r'C:/Users/Windows/Desktop/diwei/_tools/_spec'
if not os.path.isdir(out):
    os.makedirs(out)
lines = io.open(p, encoding='utf-8').read().split('\n')
# 行首形如 "R14  | "
for ln in lines:
    m = re.match(r'^R(\d+)\s*\|\s*(.*)$', ln)
    if not m:
        continue
    rn = int(m.group(1))
    if rn < 14 or rn > 25:
        continue
    body = m.group(2)
    # 取 N 列
    idx = body.find(' || N%d=' % rn)
    if idx < 0:
        continue
    text = body[idx + len(' || N%d=' % rn):]
    # 取 L / M 列用于命名
    lm = re.search(r'L%d=([^|]*?) \|\| ' % rn, body)
    mm = re.search(r'M%d=([^|]*?)($| \|\| )' % rn, body)
    lvl = lm.group(1).strip() if lm else ''
    sub = mm.group(1).strip() if mm else ''
    text = text.replace('\\n', '\n')
    fn = os.path.join(out, 'R%02d_%s_%s.txt' % (rn, lvl, sub))
    with io.open(fn, 'w', encoding='utf-8') as f:
        f.write(text)
    print('wrote', os.path.basename(fn), len(text))
