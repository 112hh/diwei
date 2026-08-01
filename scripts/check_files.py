import os

needles = [
    '低维材料主题库',
    '二维材料',
    '低维材料',
    '检索',
    '主题库',
    'icon',
    '门户',
    '图标',
    '侧边栏',
    'sidebar',
    '侧栏',
]

root = r'C:\Users\Windows\Desktop\diwei'
for dirpath, dirs, files in os.walk(root):
    for f in files:
        if f.endswith('.html'):
            p = os.path.join(dirpath, f)
            try:
                with open(p, 'r', encoding='utf-8', errors='replace') as fh:
                    content = fh.read()
            except Exception as e:
                print('ERR ', p, e)
                continue
            hits = [n for n in needles if n in content]
            tag = 'FOUND' if hits else 'NOT  '
            print(f'{tag} {p}')
            for h in hits:
                # find the first few occurrences with line number
                idx = content.find(h)
                line = content[:idx].count('\n') + 1 if idx >= 0 else -1
                print(f'   - {h!r} first at line {line}')
