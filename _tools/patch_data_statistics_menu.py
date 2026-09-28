# -*- coding: utf-8 -*-
"""向 diwei 全部业务 HTML 注入「数据统计」二级菜单、页面容器与菜单管理表格行。"""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

NAV_ANCHOR = (
    b'          <button class="nav-btn" data-group="monitor" data-page="dashboard" data-label="\xe6\x95\xb0\xe6\x8d\xae\xe7\x9c\x8b\xe6\x9d\xbf">'
    b'<span>\xe6\x95\xb0\xe6\x8d\xae\xe7\x9c\x8b\xe6\x9d\xbf</span></button>'
)
NAV_ADD = (
    b'\n          <button class="nav-btn" data-group="monitor" data-page="data-statistics" data-label="\xe6\x95\xb0\xe6\x8d\xae\xe7\xbb\x9f\xe8\xae\xa1">'
    b'<span>\xe6\x95\xb0\xe6\x8d\xae\xe7\xbb\x9f\xe8\xae\xa1</span></button>'
)

SECTION_ANCHOR = b'      <section class="page" id="page-data-resource-catalog"></section>'
SECTION_ADD = b'\n      <section class="page" id="page-data-statistics"></section>'

MENU_ANCHOR = (
    b'<tr><td>\xe6\x95\xb0\xe6\x8d\xae\xe7\x9c\x8b\xe6\x9d\xbf</td><td>DB</td><td>dashboard</td>'
    b'<td>\xe7\x9b\x91\xe6\x8e\xa7\xe7\xbb\x9f\xe8\xae\xa1</td><td>1</td><td>admin, reviewer</td>'
    b'<td><span class="status-badge success">\xe5\x90\xaf\xe7\x94\xa8</span></td>'
    b'<td><button class="btn btn-sm">\xe7\xbc\x96\xe8\xbe\x91</button></td></tr>'
)
MENU_ADD = (
    b'\n                <tr><td>\xe6\x95\xb0\xe6\x8d\xae\xe7\xbb\x9f\xe8\xae\xa1</td><td>DS</td><td>data-statistics</td>'
    b'<td>\xe7\x9b\x91\xe6\x8e\xa7\xe7\xbb\x9f\xe8\xae\xa1</td><td>2</td><td>admin, reviewer</td>'
    b'<td><span class="status-badge success">\xe5\x90\xaf\xe7\x94\xa8</span></td>'
    b'<td><button class="btn btn-sm">\xe7\xbc\x96\xe8\xbe\x91</button></td></tr>'
)

COUNT_OLD = b'<span>\xe5\x85\xb1 5 \xe6\x9d\xa1\xe8\x8f\x9c\xe5\x8d\x95\xe8\xae\xb0\xe5\xbd\x95</span>'
COUNT_NEW = b'<span>\xe5\x85\xb1 6 \xe6\x9d\xa1\xe8\x8f\x9c\xe5\x8d\x95\xe8\xae\xb0\xe5\xbd\x95</span>'


def patch_file(path):
    with open(path, 'rb') as handle:
        raw = handle.read()
    original = raw
    marks = []

    if NAV_ANCHOR in raw and b'data-page="data-statistics"' not in raw:
        raw = raw.replace(NAV_ANCHOR, NAV_ANCHOR + NAV_ADD, 1)
        marks.append('nav')

    if SECTION_ANCHOR in raw and b'id="page-data-statistics"' not in raw:
        raw = raw.replace(SECTION_ANCHOR, SECTION_ANCHOR + SECTION_ADD, 1)
        marks.append('section')

    if MENU_ANCHOR in raw and b'<td>data-statistics</td>' not in raw:
        raw = raw.replace(MENU_ANCHOR, MENU_ANCHOR + MENU_ADD, 1)
        marks.append('menu')
        if COUNT_OLD in raw:
            raw = raw.replace(COUNT_OLD, COUNT_NEW, 1)
            marks.append('count')

    if raw == original:
        return marks
    with open(path, 'wb') as handle:
        handle.write(raw)
    return marks


def main():
    targets = sorted(
        name for name in os.listdir(ROOT)
        if name.endswith('.html') and os.path.isfile(os.path.join(ROOT, name))
    )
    changed = 0
    for name in targets:
        marks = patch_file(os.path.join(ROOT, name))
        if marks:
            changed += 1
            print('%-42s %s' % (name, ','.join(marks)))
        else:
            print('%-42s (skip)' % name)
    print('\nchanged files: %d / %d' % (changed, len(targets)))


if __name__ == '__main__':
    sys.exit(main())
