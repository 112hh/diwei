from pathlib import Path
p=Path(r"C:\Users\Windows\Desktop\diwei\low-dim-materials.html")
s=p.read_text(encoding="utf-8-sig")
old='      const content = document.getElementById("twodDetailPageContent");\n      if (title) title.textContent'
new='      const content = document.getElementById("twodDetailPageContent");\n      const detailPage = document.getElementById("page-twod-detail");\n      if (detailPage) detailPage.setAttribute("data-source", "catalyst");\n      if (title) title.textContent'
assert old in s
p.write_text(s.replace(old,new,1), encoding="utf-8", newline="")
