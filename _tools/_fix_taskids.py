# -*- coding: utf-8 -*-
"""把 MATX.shards 里的 taskId 统一改成各材料配置里真实的采集任务 ID。"""
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
P = r"C:\Users\Windows\Desktop\diwei\_tools\ingest_rw.js"
src = open(P, encoding="utf-8").read()

# 分片归属：S01/S02 归任务1，S03 归任务2，S04/S05 归任务3
MAP = {
    "2D": {"001": ["S01", "S02"], "002": ["S03", "S04"], "003": ["S05"]},
    "OP": {"001": ["S01", "S02"], "002": ["S03"], "003": ["S04"]},
    "EL": {"001": ["S01", "S02"], "002": ["S03"], "003": ["S04"]},
    "ML": {"001": ["S01", "S02"], "002": ["S03"], "003": ["S04"]},
    "CA": {"001": ["S01", "S02"], "002": ["S03"], "003": ["S04"]},
}
DATES = {"001": "2026-0922-001", "002": "2026-0923-002", "003": "2026-0923-003"}

changed = 0
for pre, groups in MAP.items():
    for seq, shard_ids in groups.items():
        task_id = "%s-CL-%s" % (pre, DATES[seq])
        for sid in shard_ids:
            # 只匹配同一材料分片块里的 taskId
            pat = re.compile(
                r'(\{ id: "' + sid + r'", n: \d+, acc: \d+, rej: \d+, dup: \d+, pend: \d+, st: "[^"]+", taskId: ")' + pre + r'-CL-[0-9\-]+(")'
            )
            src2, n = pat.subn(lambda m: m.group(1) + task_id + m.group(2), src)
            if n:
                src = src2
                changed += n

open(P, "w", encoding="utf-8").write(src)
print("taskId 替换条目:", changed)

# 校验：列出替换后的结果
for pre in MAP:
    for m in re.finditer(r'\{ id: "(S\d+)", n: \d+.*?taskId: "(' + pre + r'-CL-[0-9\-]+)"', src):
        print("  ", m.group(2), "<-", m.group(1))
