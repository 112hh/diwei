# -*- coding: utf-8 -*-
"""检测截图里的红色框选区域，输出外接矩形（相对整图的百分比坐标）。"""
import sys
from PIL import Image

path = sys.argv[1]
im = Image.open(path).convert("RGB")
W, H = im.size
print("image size: %d x %d" % (W, H))

px = im.load()

def is_red(r, g, b):
    return r > 150 and g < 110 and b < 110 and (r - max(g, b)) > 70

# 逐行 / 逐列统计红像素，用于分离多个框
rows = []
for y in range(H):
    c = 0
    for x in range(W):
        r, g, b = px[x, y]
        if is_red(r, g, b):
            c += 1
    rows.append(c)

cols = []
for x in range(W):
    c = 0
    for y in range(H):
        r, g, b = px[x, y]
        if is_red(r, g, b):
            c += 1
    cols.append(c)

def segments(vals, min_len=8, thr=0):
    segs = []
    start = None
    for i, v in enumerate(vals):
        if v > thr:
            if start is None:
                start = i
        else:
            if start is not None and i - start >= min_len:
                segs.append((start, i - 1))
            start = None
    if start is not None and len(vals) - start >= min_len:
        segs.append((start, len(vals) - 1))
    return segs

# 细红边框可能只有 2~4 px；用连通的“红像素行/列”聚类
rsegs = segments(rows, min_len=6, thr=3)
csegs = segments(cols, min_len=6, thr=3)
print("row bands:", rsegs)
print("col bands:", csegs)

# 合并相邻（间隔 < 6px）的 band
def merge(segs, gap=6):
    out = []
    for s in segs:
        if out and s[0] - out[-1][1] <= gap:
            out[-1] = (out[-1][0], s[1])
        else:
            out.append(list(s) if False else (s[0], s[1]))
    return out

rb = merge(rsegs)
cb = merge(csegs)
print("merged row bands:", rb)
print("merged col bands:", cb)

# 对每个 (row band, col band) 组合，统计框内的红像素密度，只保留边框型（内部稀疏）
boxes = []
for (y0, y1) in rb:
    for (x0, x1) in cb:
        w = x1 - x0 + 1
        h = y1 - y0 + 1
        if w < 30 or h < 20:
            continue
        # 边框密度：四条边上的红像素比例
        edge = 0
        edge_tot = 0
        for x in range(x0, x1 + 1):
            edge_tot += 1
            r, g, b = px[x, y0]
            if is_red(r, g, b):
                edge += 1
            edge_tot += 1
            r, g, b = px[x, y1]
            if is_red(r, g, b):
                edge += 1
        for y in range(y0, y1 + 1):
            edge_tot += 1
            r, g, b = px[x0, y]
            if is_red(r, g, b):
                edge += 1
            edge_tot += 1
            r, g, b = px[x1, y]
            if is_red(r, g, b):
                edge += 1
        ratio = edge / float(edge_tot or 1)
        boxes.append((x0, y0, x1, y1, w, h, round(ratio, 3)))

print("\n候选框（x0,y0,x1,y1,w,h,边框红占比）:")
for b in sorted(boxes, key=lambda b: (b[1], b[0])):
    x0, y0, x1, y1, w, h, r = b
    print("  [%4d,%4d] -> [%4d,%4d]  %4dx%-4d  edge=%.2f   (%.1f%%~%.1f%% W, %.1f%%~%.1f%% H)"
          % (x0, y0, x1, y1, w, h, r, 100.0 * x0 / W, 100.0 * x1 / W, 100.0 * y0 / H, 100.0 * y1 / H))
