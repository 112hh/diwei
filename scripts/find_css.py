import sys
sys.stdout.reconfigure(encoding='utf-8')

f = r'C:\Users\Windows\Desktop\diwei\portal.html'
with open(f, 'r', encoding='utf-8', errors='replace') as fh:
    content = fh.read()

# Find CSS rules for scene-tab
import re
# Simple search for "scene-tab"
for m in re.finditer(r'\.scene-tab[^{]*\{[^}]*\}', content):
    start = m.start()
    snippet = m.group(0)
    # Get line number
    line = content[:start].count('\n') + 1
    print('L' + str(line) + ': ' + snippet)
    print('---')

# Also find scene-tab in any selector
print('\n=== all .scene-tab references ===')
for m in re.finditer(r'\.scene-tab[^{;]*[;{]', content):
    start = m.start()
    line = content[:start].count('\n') + 1
    print('L' + str(line) + ': ' + m.group(0))
