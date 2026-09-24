# -*- coding: utf-8 -*-
"""构建 assets/js/61-ingest-twod.js
   源：_tools/ingest_rw.js
   产物：assets/js/61-ingest-twod.js，并在引用了 assets/js/99-layer.js 的页面后面
        追加 <script src="assets/js/61-ingest-twod.js"></script>（幂等）。
"""
import io, os, glob

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(BASE)
SRC = os.path.join(BASE, "ingest_rw.js")
OUT = os.path.join(ROOT, "assets", "js", "61-ingest-twod.js")
TAG = '<script src="assets/js/61-ingest-twod.js"></script>'


def main():
    with io.open(SRC, "r", encoding="utf-8") as f:
        js = f.read()
    with io.open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write(js)
    print("written:", OUT, len(js), "chars")

    touched = 0
    for path in sorted(glob.glob(os.path.join(ROOT, "*.html"))):
        with io.open(path, "r", encoding="utf-8", newline="") as f:
            html = f.read()
        if "assets/js/99-layer.js" not in html:
            continue
        if TAG in html:
            continue
        anchor = '<script src="assets/js/99-layer.js"></script>'
        nl = "\r\n" if "\r\n" in html else "\n"
        html = html.replace(anchor, anchor + nl + TAG, 1)
        with io.open(path, "w", encoding="utf-8", newline="") as f:
            f.write(html)
        touched += 1
    print("html pages injected:", touched)


if __name__ == "__main__":
    main()
