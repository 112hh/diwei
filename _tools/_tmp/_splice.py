# -*- coding: utf-8 -*-
import io, os
base = r'C:/Users/Windows/Desktop/diwei/_tools/ingest_rw.js'
a = io.open(r'C:/Users/Windows/Desktop/diwei/_tools/_mat_cfg_a.js', encoding='utf-8').read()
b = io.open(r'C:/Users/Windows/Desktop/diwei/_tools/_mat_cfg_b.js', encoding='utf-8').read()
s = io.open(base, encoding='utf-8').read()
anchor = "  function patchRender() {"
assert s.count(anchor) == 1, s.count(anchor)
assert "__rwMatCfgInjected" not in s
block = "  /* __rwMatCfgInjected begin */\n" + a + b + "\n  /* __rwMatCfgInjected end */\n\n"
s = s.replace(anchor, block + anchor)
io.open(base, 'w', encoding='utf-8', newline='\n').write(s)
print('ok, len', len(s))
