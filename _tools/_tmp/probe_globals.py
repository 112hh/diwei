# -*- coding: utf-8 -*-
"""探测 04.js 里那些材料配置能否从新层直接读到。"""
import sys, time
sys.path.insert(0, r'C:\Users\Windows\Desktop\diwei\_tools')
from cdp import Cdp

c = Cdp()
try:
    c.open("file:///C:/Users/Windows/Desktop/diwei/lowdim-ingest-opto.html")
    time.sleep(1.5)
    for name in ["LOWDIM_TASK_WIZARD_CONFIGS", "TWOD_TASK_RESOURCE_OBJECTS", "TWOD_MATERIAL_TYPES",
                 "LOWDIM_MATERIAL_CONFIGS", "getLowdimMaterialConfig", "getLowdimMaterialKey",
                 "state", "escapeLowDimHtml", "renderLowdimIngestPage", "LOWDIM_INGEST_TABS"]:
        print(name, "=", c.evaluate("typeof window.%s" % name))
    print("---")
    print("wizard keys:", c.evaluate("(window.LOWDIM_TASK_WIZARD_CONFIGS?Object.keys(window.LOWDIM_TASK_WIZARD_CONFIGS):'N/A')"))
    print("materialKey opto:", c.evaluate("window.getLowdimMaterialKey ? window.getLowdimMaterialKey('lowdim-ingest-opto') : 'N/A'"))
    print("cfg opto title:", c.evaluate("window.getLowdimMaterialConfig ? JSON.stringify(window.getLowdimMaterialConfig('lowdim-ingest-opto')).slice(0,400) : 'N/A'"))
    print("page id:", c.evaluate("(document.querySelector('.page.active')||{}).id"))
finally:
    c.close()
