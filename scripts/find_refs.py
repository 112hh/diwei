import os
import sys
import re

# Force UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

files = [
    r'C:\Users\Windows\Desktop\diwei\portal.html',
    r'C:\Users\Windows\Desktop\diwei\low-dim-materials.html',
    r'C:\Users\Windows\Desktop\diwei\低维材料主题库管理平台原型.html',
]

patterns = ['二维材料', '二维', '检索', '数据应用']

for f in files:
    print('\n===== ' + f + ' =====')
    with open(f, 'r', encoding='utf-8', errors='replace') as fh:
        lines = fh.readlines()
    for i, line in enumerate(lines, 1):
        for p in patterns:
            if p in line:
                snippet = line.strip()[:160]
                print('L' + str(i) + ' [' + p + ']: ' + snippet)
                break
