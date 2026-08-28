from pathlib import Path
import re, sys
path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).parents[1] / "low-dim-materials.html"
html = path.read_text(encoding="utf-8")
headers = ["材料编号","中文名称","英文名称","化学式","数据集类型","体系规模","体系类型","电荷","多极矩","极化率","色散系数","操作"]
blocks = re.findall(r'<table class="twod-result-table">[\s\S]*?</table>', html)
assert blocks, "MLFF result table not found"
block = max(blocks, key=len)
for h in headers:
    assert f"<th>{h}</th>" in block, f"missing list field: {h}"
assert 'colspan="12"' in html, "empty row colspan must match 12 columns"
tree = re.search(r'function renderMlffDetailTreeOverride\(\) \{([\s\S]*?)\n    \}', html).group(1)
for label in ["基础信息","分子结构","小体系结构","大体系结构"]:
    assert f'label: "{label}"' in tree, f"missing detail section: {label}"
for label in ["原子电荷","多级矩"]:
    assert f'label: "{label}"' not in tree, f"removed detail section still present: {label}"
print("MLFF adjustment checks passed.")
