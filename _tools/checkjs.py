import os, subprocess, sys
JSDIR = r'C:\Users\Windows\Desktop\diwei\assets\js'
NODE = r'C:\Users\Windows\WorkBuddy\..\Windows\.workbuddy\binaries\node\versions\22.22.2-3\node.exe'
NODE = r'C:\Users\Windows\.workbuddy\binaries\node\versions\22.22.2-3\node.exe'
bad = []
files = sorted(os.listdir(JSDIR))
for f in files:
    p = os.path.join(JSDIR, f)
    r = subprocess.run([NODE, '--check', p], capture_output=True, text=True, encoding='utf-8', errors='replace')
    if r.returncode != 0:
        bad.append((f, (r.stderr or '')[:400]))
print('total', len(files), 'bad', len(bad))
for f, e in bad:
    print('---', f)
    print(e)
