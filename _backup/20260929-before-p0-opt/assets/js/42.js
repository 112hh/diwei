
(() => {
  if (typeof renderOptoExternalPageContent !== "function") return;
  const esc = (value) => typeof escapeLowDimHtml === "function" ? escapeLowDimHtml(value == null ? "" : String(value)) : String(value ?? "");
  renderOptoExternalPageContent = function renderSystemStyleExternal(material) {
    const rows = [
      ["文献论文", "图书馆论文检索系统", "DOI:10.1039/D3TA01245A", "https://doi.org/10.1039/D3TA01245A", "电导率、玻璃化转变温度原始文献"],
      ["外部化学数据库", "PubChem", `CID:${String(material.moleculeNumber || "17789").replace(/\D/g, "") || "17789"}`, `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(material.casNumber || material.formula || "")}`, "高分子单体结构拓展信息"]
    ];
    return `<div class="twod-detail-page-head"><div><h4>${esc(material.chineseName || material.name)}外部数据关联</h4><p>查看与该有机光电材料关联的文献信息与外部数据资源。</p></div></div><section class="twod-detail-section-card"><h5>关联文献与数据库</h5><div class="table-wrap"><table class="twod-result-table"><thead><tr><th>关联类型</th><th>外部平台名称</th><th>标识编号</th><th>跳转链接</th><th>来源备注</th><th>操作</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${esc(row[0])}</td><td>${esc(row[1])}</td><td>${esc(row[2])}</td><td><span style="color:#2451c6;word-break:break-all;">${esc(row[3])}</span></td><td>${esc(row[4])}</td><td><button class="twod-detail-link-btn" type="button" data-opto-external-url="${esc(row[3])}">打开链接</button></td></tr>`).join("")}</tbody></table></div></section>`;
  };
  window.renderOptoExternalPageContent = renderOptoExternalPageContent;
  document.body.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-opto-external-url]");
    if (button) window.open(button.dataset.optoExternalUrl, "_blank", "noopener,noreferrer");
  }, true);
})();
