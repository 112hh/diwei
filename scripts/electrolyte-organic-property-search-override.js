(() => {
  const organicPropertyTypes = [
    { key: "basic", label: "有机电解液基础信息" },
    { key: "spectra", label: "有机电解液图谱信息" },
    { key: "compute", label: "有机电解液计算信息" },
    { key: "chart", label: "有机电解液图谱信息" },
    { key: "similar", label: "相似分子推荐" }
  ];
  const propertyTypesByCategory = {
    organicLiquid: organicPropertyTypes,
    solidOrganic: [
      { key: "basic", label: "固态有机电解质基础信息" },
      { key: "compute", label: "固态有机电解质计算信息" },
      { key: "similar", label: "固态有机电解质材料溶解溶剂推荐" }
    ],
    solidInorganic: [
      { key: "basic", label: "固态无机电解质基础信息" },
      { key: "spectra", label: "固态无机电解质图谱信息" },
      { key: "compute", label: "固态无机电解质计算信息" },
      { key: "external", label: "外部数据关联" }
    ]
  };
  const spectraFieldsByCategory = {
    organicLiquid: [
      { key: "ir", label: "气相红外光谱" },
      { key: "raman", label: "拉曼光谱" },
      { key: "nmr", label: "核磁共振光谱" }
    ],
    solidInorganic: [
      { key: "band", label: "能带结构" },
      { key: "dos", label: "态密度" },
      { key: "xrd", label: "X射线衍射谱图" },
      { key: "absorption", label: "X射线吸收谱图" }
    ]
  };

  const escapeValue = (value) => typeof escapeHtml === "function"
    ? escapeHtml(String(value ?? ""))
    : String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const isRecorded = (value) => !isLowDimNoPropertyValue(value);

  function ensureDraft(filters) {
    const draft = filters || {};
    const category = state.electrolyteCategory || "organicLiquid";
    const propertyTypes = propertyTypesByCategory[category] || organicPropertyTypes;
    draft.propertyType = propertyTypes.some((item) => item.key === draft.propertyType) ? draft.propertyType : "basic";
    if (!Array.isArray(draft.spectra)) draft.spectra = [];
    if (!Array.isArray(draft.computeFields)) draft.computeFields = [];
    if (!draft.computeValues || typeof draft.computeValues !== "object") draft.computeValues = {};
    if (!draft.basicStructure) draft.basicStructure = "";
    if (!draft.chartStatus) draft.chartStatus = "";
    if (!draft.similarStatus) draft.similarStatus = "";
    if (!draft.externalStatus) draft.externalStatus = "";
    return draft;
  }

  function getPropertyTypes(category) {
    return propertyTypesByCategory[category] || organicPropertyTypes;
  }

  const previousRenderPropertyWorkspace = renderElectrolytePropertyWorkspace;
  const previousHasOrganicFilters = hasElectrolyteOrganicPropertyFilters;
  const previousFilterByProperty = filterElectrolyteByProperty;
  const previousResultList = getElectrolyteResultList;
  const previousVisibleColumns = getElectrolyteVisibleResultColumns;
  const previousResultCell = renderElectrolyteResultCell;
  const previousDetailMenu = getElectrolyteDetailMenu;
  const previousOrganicBasicPage = typeof renderElectrolyteOrganicBasicPage === "function" ? renderElectrolyteOrganicBasicPage : null;
  hasElectrolyteOrganicPropertyFilters = function (filters) {
    const draft = ensureDraft(filters);
    if (draft.propertyType === "basic") return Boolean(draft.basicStructure);
    if (draft.propertyType === "spectra") return draft.spectra.length > 0;
    if (draft.propertyType === "compute") return draft.computeFields.length > 0;
    if (draft.propertyType === "chart") return Boolean(draft.chartStatus);
    if (draft.propertyType === "similar") return Boolean(draft.similarStatus);
    if (draft.propertyType === "external") return Boolean(draft.externalStatus);
    return previousHasOrganicFilters(filters);
  };

  filterElectrolyteByProperty = function (category, filters, list) {
    const draft = ensureDraft(filters);
    const hasStructure = (item) => Boolean(item?.structureFile || item?.cifFile || item?.structureView || item?.structure || item?.visuals?.structure);
    const hasChart = (item) => Boolean(item?.visuals && Object.keys(item.visuals).length);
    const hasSimilar = (item) => isRecorded(item?.similarMolecules)
      || isRecorded(item?.similarityScore)
      || isRecorded(item?.similarity)
      || Boolean(item?.detailTabs?.recommend?.length);
    if (draft.propertyType === "basic") return list.filter((item) => draft.basicStructure === "has" ? hasStructure(item) : !hasStructure(item));
    if (draft.propertyType === "spectra") return list.filter((item) => draft.spectra.every((key) => {
      const spectrum = getElectrolyteSpectraSearchText(item, key);
      return isRecorded(spectrum) || Boolean(item?.visuals?.[key]);
    }));
    if (draft.propertyType === "compute") return list.filter((item) => draft.computeFields.every((key) => {
      const value = String(getElectrolyteListValue(item, key) || "");
      const query = String(draft.computeValues[key] || "").trim().toLowerCase();
      return isRecorded(value) && (!query || value.toLowerCase().includes(query));
    }));
    if (draft.propertyType === "chart") return list.filter((item) => draft.chartStatus === "has" ? hasChart(item) : !hasChart(item));
    if (draft.propertyType === "similar") return list.filter((item) => draft.similarStatus === "has" ? hasSimilar(item) : !hasSimilar(item));
    if (draft.propertyType === "external") return list.filter((item) => draft.externalStatus === "has" ? Boolean(item?.externalLinks?.length || item?.externalData || item?.externalSource) : !Boolean(item?.externalLinks?.length || item?.externalData || item?.externalSource));
    return previousFilterByProperty(category, filters, list);
  };

  getElectrolyteResultList = function () {
    const applied = state.electrolyteAppliedSearch || {};
    if (!propertyTypesByCategory[state.electrolyteCategory] || applied.category !== state.electrolyteCategory || applied.mode !== "property" || !hasElectrolyteOrganicPropertyFilters(applied.filters)) {
      return previousResultList();
    }
    return filterElectrolyteByProperty(state.electrolyteCategory, applied.filters, getElectrolyteCategoryMaterials(state.electrolyteCategory));
  };

  renderElectrolytePropertyWorkspace = function (category) {
    if (!propertyTypesByCategory[category]) return previousRenderPropertyWorkspace(category);
    const filters = ensureDraft(state.electrolyteSearchDrafts[category].property);
    const propertyTypes = getPropertyTypes(category);
    const categoryLabel = category === "solidOrganic" ? "固态有机电解质" : category === "solidInorganic" ? "固态无机电解质" : "有机电解液";
    const radio = (name, value, options, key) => options.map((item) => `
      <label class="electrolyte-check-item">
        <input type="radio" name="${name}" value="${item.key}" data-ely-organic-property-radio="${key}" ${value === item.key ? "checked" : ""}>
        <span>${item.label}</span>
      </label>
    `).join("");
    let controls = "";
    if (filters.propertyType === "basic") {
      controls = category === "solidOrganic"
        ? `<div class="electrolyte-property-description"><strong>基础信息与物性数据</strong><span>首先展示分子的基础信息及对应单体信息；其次展示摩尔体积、密度、玻璃化转变温度、电导率和机械性能。未收录的数据统一以“/”表示。</span></div>`
        : radio("elyOrganicStructure", filters.basicStructure, [{ key: "has", label: "含有结构图" }, { key: "none", label: "不含有结构图" }], "basicStructure");
    } else if (filters.propertyType === "spectra") {
      const activeSpectraFields = spectraFieldsByCategory[category] || spectraFieldsByCategory.organicLiquid;
      controls = activeSpectraFields.map((item) => `
        <label class="electrolyte-check-item">
          <input type="checkbox" value="${item.key}" data-ely-organic-property-option="spectra" ${filters.spectra.includes(item.key) ? "checked" : ""}>
          <span>${item.label}</span>
        </label>
      `).join("");
    } else if (filters.propertyType === "compute") {
      controls = (ELECTROLYTE_COMPUTE_FIELD_MAP[category] || ELECTROLYTE_COMPUTE_FIELD_MAP.organicLiquid).map((item) => {
        const selected = filters.computeFields.includes(item.key);
        return `
          <label class="electrolyte-check-item">
            <input type="checkbox" value="${item.key}" data-ely-organic-property-option="compute" ${selected ? "checked" : ""}>
            <span>${item.label}</span>
          </label>
          ${selected ? `<input type="text" data-ely-organic-property-value="${item.key}" value="${escapeValue(filters.computeValues[item.key])}" placeholder="输入${item.label}数值">` : ""}
        `;
      }).join("");
    } else if (filters.propertyType === "chart") {
      controls = radio("elyOrganicChart", filters.chartStatus, [{ key: "has", label: "含有有机电解液图谱信息" }, { key: "none", label: "不含有有机电解液图谱信息" }], "chartStatus");
    } else if (filters.propertyType === "similar") {
      controls = category === "solidOrganic"
        ? radio("elySolidOrganicSolvent", filters.similarStatus, [{ key: "has", label: "有相似分子推荐" }, { key: "none", label: "无相似分子推荐" }], "similarStatus")
        : radio("elyOrganicSimilar", filters.similarStatus, [{ key: "has", label: "有相似分子推荐" }, { key: "none", label: "无相似分子推荐" }], "similarStatus");
    } else {
      controls = radio("elyOrganicExternal", filters.externalStatus, [{ key: "has", label: "含有外部数据关联" }, { key: "none", label: "不含有外部数据关联" }], "externalStatus");
    }
    return `
      <div class="twod-mode-panel active">
        <div class="twod-property-panel">
          <div class="electrolyte-inline-query-shell">
            <div class="electrolyte-inline-query">
              <div class="electrolyte-inline-row">
                <strong>性质类型</strong>
                <div class="electrolyte-inline-row-body">
                  <div class="electrolyte-organic-condition-row">
                    <select data-ely-organic-property-type aria-label="性质类型">
                      ${propertyTypes.map((item) => `<option value="${item.key}" ${filters.propertyType === item.key ? "selected" : ""}>${item.label}</option>`).join("")}
                    </select>
                    <div class="electrolyte-checkbox-row">${controls}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="twod-platform-actions electrolyte-property-actions">
            <div class="twod-detail-actions">
              <button class="btn twod-search-reset" type="button" data-ely-reset>清空条件</button>
              <button class="btn-primary" type="button" data-ely-apply ${hasElectrolyteOrganicPropertyFilters(filters) ? "" : "disabled"}>检索</button>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  getElectrolyteVisibleResultColumns = function () {
    const category = state.electrolyteCategory || "organicLiquid";
    const common = [
      { key: "code", label: "材料编号", width: "150px", fixed: true },
      { key: "chineseName", label: "中文名称", width: "180px", fixed: true },
      { key: "englishName", label: "英文简称", width: "150px", fixed: true },
      { key: "formula", label: "分子式", width: "130px", fixed: true }
    ];
    const tail = [
      { key: "source", label: "数据来源", width: "180px" },
      { key: "actions", label: "操作", width: "150px", fixed: true }
    ];
    if (category === "solidOrganic") {
      return common.concat([
        { key: "ignitionPoint", label: "燃点", width: "110px" },
        { key: "molarVolume", label: "摩尔体积", width: "130px" },
        { key: "density", label: "密度", width: "110px" }
      ], tail);
    }
    if (category === "solidInorganic") {
      return common.concat([
        { key: "bandGapValue", label: "带隙", width: "110px" },
        { key: "density", label: "密度", width: "110px" },
        { key: "formationEnergy", label: "形成能", width: "130px" }
      ], tail);
    }
    return common.concat([
      { key: "physicalState", label: "性状", width: "120px" },
      { key: "meltingPoint", label: "熔点", width: "110px" },
      { key: "boilingPoint", label: "沸点", width: "110px" },
      { key: "safetyLevel", label: "安全等级", width: "120px" }
    ], tail);
  };

  const getDetailValueSafe = (item, labels, tabs) => typeof findElectrolyteDetailValue === "function"
    ? findElectrolyteDetailValue(item, labels, tabs)
    : null;
  const formatSafe = (value) => typeof formatElectrolyteValue === "function" ? formatElectrolyteValue(value) : formatLowDimValue(value);

  renderElectrolyteResultCell = function (item, column) {
    if (column.key === "chineseName") return `<td>${formatLowDimValue(item.name)}</td>`;
    if (column.key === "safetyLevel") return `<td>${formatLowDimValue(item.hazardLevel || item.safety)}</td>`;
    if (column.key === "ignitionPoint") return `<td class="twod-result-extra-cell">${formatSafe(item.ignitionPoint || item.firePoint || getDetailValueSafe(item, ["燃点", "闪点"], ["basic"]))}</td>`;
    if (column.key === "molarVolume") return `<td class="twod-result-extra-cell">${formatSafe(item.molarVolume || getDetailValueSafe(item, ["摩尔体积"], ["basic"]))}</td>`;
    if (column.key === "density") return `<td class="twod-result-extra-cell">${formatSafe(item.density || getDetailValueSafe(item, ["密度"], ["basic"]))}</td>`;
    if (column.key === "bandGapValue") return `<td class="twod-result-extra-cell">${typeof formatElectrolyteMetric === "function" ? formatElectrolyteMetric(item.bandGapValue, "eV") : formatLowDimValue(item.bandGapValue)}</td>`;
    if (column.key === "formationEnergy") return `<td class="twod-result-extra-cell">${typeof formatElectrolyteMetric === "function" ? formatElectrolyteMetric(item.formationEnergy, "eV/atom") : formatLowDimValue(item.formationEnergy)}</td>`;
    return previousResultCell(item, column);
  };

  getElectrolyteDetailMenu = function (category) {
    const menu = previousDetailMenu(category);
    if (category !== "solidOrganic") return menu;
    const withoutRecommend = menu.filter((item) => item.key !== "recommend");
    const basicIndex = withoutRecommend.findIndex((item) => item.key === "basic");
    const hasProperty = withoutRecommend.some((item) => item.key === "property");
    if (hasProperty || basicIndex < 0) return withoutRecommend;
    return withoutRecommend.slice(0, basicIndex + 1).concat([{ key: "property", label: "物性信息" }], withoutRecommend.slice(basicIndex + 1));
  };

  if (previousOrganicBasicPage) {
    renderElectrolyteOrganicBasicPage = function (material) {
      let html = previousOrganicBasicPage(material);
      const safetyRows = [
        { label: "毒理学数据", value: material.toxicology || getDetailValueSafe(material, ["毒理学数据", "毒理学", "毒性"], ["basic"]) || "待评估" },
        { label: "生态毒性", value: material.ecotoxicity || getDetailValueSafe(material, ["生态毒性", "生态"], ["basic"]) || "待评估" },
        { label: "安全标识", value: material.safetyIdentification || material.safetyLabel || material.ghs || getDetailValueSafe(material, ["安全标识", "GHS", "安全标签"], ["basic"]) || "未记录" }
      ];
      const safetyTable = typeof renderElectrolyteInfoTable === "function"
        ? renderElectrolyteInfoTable("安全信息", safetyRows)
        : `<table class="twod-detail-info-table"><tbody><tr><th colspan="2">安全信息</th></tr>${safetyRows.map((row) => `<tr><td>${escapeValue(row.label)}</td><td>${escapeValue(row.value)}</td></tr>`).join("")}</tbody></table>`;
      if (/毒理学数据|生态毒性|安全标识/.test(html)) return html;
      const structureCardStart = /(<\/section>\s*<section class="twod-detail-visual-card")/;
      return structureCardStart.test(html)
        ? html.replace(structureCardStart, `${safetyTable}$1`)
        : html.replace(/(<\/section>\s*\$\{?\s*renderElectrolyteStructureCard)/, `${safetyTable}$1`);
    };
  }


  if (typeof renderElectrolyteSolidOrganicBasicPage === "function") {
    renderElectrolyteSolidOrganicBasicPage = function (material) {
      const baseRows = [
        { label: "中文名称", value: material.name },
        { label: "英文名称", value: material.alias || "/" },
        { label: "分子式", value: material.formula },
        { label: "材料编号", value: material.code || material.id },
        { label: "对应单体信息", value: material.monomerInfo || material.monomer || getDetailValueSafe(material, ["对应单体信息", "单体信息"], ["basic"]) || (material.alias === "PEO" ? "乙烯氧化物重复单元" : "/") }
      ];
      return `
        <div class="twod-detail-page-head">
          <div>
            <h4>${material.name}基础信息</h4>
            <p>展示当前固态有机电解质的基础信息与三维结构；物性字段已独立至左侧“物性信息”菜单。</p>
          </div>
          <div class="twod-detail-page-action">
            <button class="btn-primary" type="button" onclick="return triggerElectrolyteDetailDownload('section', 'basic')">结构文件下载</button>
          </div>
        </div>
        ${buildElectrolyteSummaryPills(material)}
        <div class="twod-basic-card-grid">
          <section class="twod-detail-table-card">
            <h5 class="twod-detail-material-title">基础信息</h5>
            ${renderElectrolyteInfoTable("基础信息", baseRows)}
          </section>
          ${renderElectrolyteStructureCard(material, "3D晶体结构")}
        </div>
      `;
    };
  }

  if (typeof renderElectrolyteSolidOrganicPropertyPage === "function") {
    renderElectrolyteSolidOrganicPropertyPage = function (material) {
      const solventValue = material.solventRecommend
        || material.recommendedSolvent
        || getDetailValueSafe(material, ["溶解溶剂", "推荐溶剂", "溶剂推荐"], ["basic", "recommend"])
        || (material.detailTabs?.recommend || []).map((item) => `${item.label}：${item.value}`).join("；")
        || "/";
      const rows = [
        { label: "燃点", value: material.ignitionPoint || material.firePoint || getDetailValueSafe(material, ["燃点", "闪点"], ["basic"]) || "待评估" },
        { label: "摩尔体积", value: material.molarVolume || getDetailValueSafe(material, ["摩尔体积"], ["basic"]) || "/" },
        { label: "密度", value: material.density || getDetailValueSafe(material, ["密度"], ["basic"]) || "/" },
        { label: "熔点", value: material.meltingPoint || getDetailValueSafe(material, ["熔点"], ["basic"]) || "/" },
        { label: "玻璃化转变温度", value: material.glassTransitionTemperature || material.glassTransitionTemp || getDetailValueSafe(material, ["玻璃化转变温度", "玻璃化温度", "Tg"], ["basic", "spectra"]) || "/" },
        { label: "电导率", value: material.conductivityLabel ? `${material.conductivityLabel} S/cm` : (material.conductivity || getDetailValueSafe(material, ["电导率", "离子电导率"], ["basic", "compute"]) || "/") },
        { label: "溶解溶剂", value: solventValue },
        { label: "拉伸模量", value: material.tensileModulus || getDetailValueSafe(material, ["拉伸模量", "杨氏模量", "弹性模量"], ["basic", "compute"]) || "/" },
        { label: "断裂应力/应变", value: material.fractureStressStrain || material.breakStressStrain || getDetailValueSafe(material, ["断裂应力/应变", "断裂应力", "断裂应变"], ["basic", "compute"]) || "/" },
        { label: "断裂伸长率", value: material.elongationAtBreak || material.breakElongation || getDetailValueSafe(material, ["断裂伸长率", "断裂伸长"], ["basic", "compute"]) || "/" }
      ];
      return `
        <div class="twod-detail-page-head">
          <div>
            <h4>物性信息</h4>
            <p>展示当前固态有机电解质的热学、密度、电导、溶解溶剂与拉伸性能等物性数据。</p>
          </div>
          <div class="twod-detail-page-action">
            <button class="btn-primary" type="button" onclick="return triggerElectrolyteDetailDownload('section', 'property')">物性信息下载</button>
          </div>
        </div>
        <section class="twod-detail-section-card">
          <h5>物性信息</h5>
          ${renderElectrolyteInfoTable("物性信息", rows)}
        </section>
      `;
    };
  }
  document.addEventListener("change", (event) => {
    const category = state.electrolyteCategory;
    if (!propertyTypesByCategory[category] || getActiveElectrolyteMode(category) !== "property") return;
    const filters = ensureDraft(state.electrolyteSearchDrafts[category].property);
    if (event.target.matches("[data-ely-organic-property-type]")) {
      filters.propertyType = event.target.value;
      renderElectrolyteModule();
      return;
    }
    const group = event.target.dataset.elyOrganicPropertyOption;
    if (group) {
      const field = group === "spectra" ? "spectra" : "computeFields";
      const key = event.target.value;
      filters[field] = event.target.checked ? Array.from(new Set(filters[field].concat(key))) : filters[field].filter((item) => item !== key);
      if (!event.target.checked) delete filters.computeValues[key];
      renderElectrolyteModule();
      return;
    }
    const radioKey = event.target.dataset.elyOrganicPropertyRadio;
    if (radioKey) {
      filters[radioKey] = event.target.value;
      updateElectrolytePropertyApplyState();
    }
  });

  document.addEventListener("input", (event) => {
    const key = event.target.dataset.elyOrganicPropertyValue;
    if (!key || !propertyTypesByCategory[state.electrolyteCategory]) return;
    const filters = ensureDraft(state.electrolyteSearchDrafts[state.electrolyteCategory].property);
    filters.computeValues[key] = event.target.value;
    updateElectrolytePropertyApplyState();
  });

  if (state.page === "electrolyte") renderElectrolyteModule();
})();

