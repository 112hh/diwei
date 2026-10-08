
(() => {
  if (typeof state === "undefined" || typeof optoMaterials === "undefined") return;
  const escValue = (value) => typeof escapeLowDimHtml === "function" ? escapeLowDimHtml(value == null ? "" : String(value)) : String(value ?? "");
  const showValue = (value, fallback = "未记录") => value == null || value === "" ? fallback : String(value);
  const item = (label, value) => `<article class="twod-detail-property-item"><span>${escValue(label)}</span><strong>${escValue(showValue(value))}</strong></article>`;
  const basic = (material) => [
    { label: "中文名称", value: material.chineseName || material.nameZh || material.name },
    { label: "英文名称", value: material.englishName || material.nameEn || material.english || material.name },
    { label: "分子式/化学式", value: material.formula },
    { label: "材料编号", value: material.materialNumber || material.code || material.id },
    { label: "分子编号", value: material.moleculeNumber || material.code || material.id },
    { label: "CAS号", value: material.casNumber },
    { label: "分子量", value: `${showValue(material.molecularWeight)} g/mol` }
  ];
  function meta(material) { return `<section class="twod-detail-section-card opto-system-meta-card"><h5>基础信息</h5>${renderDetailKvSection("", basic(material))}</section>`; }
  function params(material) {
    const physical = [
      ["相对密度", material.relativeDensity], ["熔点", material.meltingPoint], ["沸点", material.boilingPoint], ["闪点", material.flashPoint]
    ];
    const calculated = [
      ["激发能", material.excitedEnergy], ["放射能", material.emissionEnergy], ["跃迁偶极矩", material.transitionDipole], ["HOMO能级", `${showValue(material.homo)} eV`], ["LUMO能级", `${showValue(material.lumo)} eV`], ["溶剂化自由能", material.solvationFreeEnergy], ["斯托克斯位移", material.stokesShift], ["简正模式", material.normalModes]
    ];
    return `<div class="twod-detail-page-head"><div><h4>${escValue(material.chineseName || material.name)}特征参数</h4><p>展示物性数据与计算数据。</p></div><div class="twod-detail-page-action"><button class="btn-primary" type="button" onclick="return triggerOptoDetailDownload('paramsData')">参数数据下载</button></div></div>${meta(material)}<section class="twod-detail-section-card"><h5>物性数据</h5><div class="twod-detail-property-grid">${physical.map(([label, value]) => item(label, value)).join("")}</div></section><section class="twod-detail-section-card"><h5>计算数据</h5><div class="twod-detail-property-grid">${calculated.map(([label, value]) => item(label, value)).join("")}</div></section>`;
  }
  const oldRender = renderOptoParamsPageContent;
  renderOptoParamsPageContent = function renderSystemStyleRequestedParams(material) { return params(material); };
  window.renderOptoParamsPageContent = renderOptoParamsPageContent;
})();
