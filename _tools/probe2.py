# -*- coding: utf-8 -*-
import sys, time, json
sys.path.insert(0, r'C:\Users\Windows\Desktop\diwei\_tools')
from cdp import Cdp

url = sys.argv[1]
wait = float(sys.argv[2]) if len(sys.argv) > 2 else 10.0
c = Cdp()
try:
    c.open(url)
    time.sleep(wait)
    v = c.evaluate(r"""(function(){
      var p = document.querySelector('.page.active');
      return JSON.stringify({
        id: p ? p.id : null,
        htmlLen: p ? p.innerHTML.length : 0,
        textLen: p ? p.innerText.length : 0,
        text: p ? p.innerText.slice(0, 500) : '',
        childCount: p ? p.children.length : 0
      });
    })()""")
    print(v)
finally:
    c.close()
