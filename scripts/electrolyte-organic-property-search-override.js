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


/* 2026-09 organic electrolyte list/detail refinement */
(() => {
  const escapeValue = (value) => typeof escapeHtml === "function"
    ? escapeHtml(String(value ?? ""))
    : String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const display = (value) => typeof formatLowDimValue === "function" ? formatLowDimValue(value) : (value ?? "/");
  const lookup = (material, labels, groups = ["basic", "spectra", "compute", "recommend", "external"]) => {
    if (typeof findElectrolyteDetailValue !== "function") return null;
    return findElectrolyteDetailValue(material, labels, groups);
  };
  const valueOf = (material, keys, labels = keys) => {
    for (const key of keys) if (material?.[key] != null && material[key] !== "") return material[key];
    return lookup(material, labels) ?? "/";
  };
  const englishNameMap = {
    "哌嗪腈醇溶剂(候选)": "Piperazine Nitrile Alcohol Solvent (Candidate)"
  };
  const getEnglishName = (material) => material?.englishName || englishNameMap[material?.name] || lookup(material, ["英文名称"] ) || "/";
  const getStructureSubtype = (material) => {
    const explicit = material?.structureSubtype || material?.structureCategory || material?.structureType || lookup(material, ["结构种类细分", "结构类型", "结构种类"]);
    if (explicit && explicit !== "该材料暂无此性质") return explicit;
    const text = `${material?.name || ""} ${(material?.keywords || []).join(" ")} ${material?.structureView?.caption || ""}`;
    if (/醚|ether/i.test(text)) return "醚类有机电解液数据集";
    if (/酯|carbonate|ester/i.test(text)) return "酯类有机电解液数据集";
    if (/环|cyclic|ring/i.test(text)) return "环状有机电解液数据集";
    return "其他有机电解液数据集";
  };
  const row = (material, keys, labels = keys) => ({ label: labels[0], value: valueOf(material, keys, labels) });

  const previousColumns = getElectrolyteVisibleResultColumns;
  const previousResultHeader = typeof renderElectrolyteResultHeader === "function" ? renderElectrolyteResultHeader : null;
  if (previousResultHeader) {
    renderElectrolyteResultHeader = function (columns) {
      if ((state.electrolyteCategory || "") !== "solidInorganic") return previousResultHeader(columns);
      return `<tr>${columns.map((column) => `<th style="width:${column.width || "150px"}">${column.label}</th>`).join("")}</tr>`;
    };
  }
  getElectrolyteVisibleResultColumns = function () {
    const category = state.electrolyteCategory || "organicLiquid";
    if (category !== "organicLiquid") return previousColumns();
    return [
      { key: "code", label: "材料编号", width: "150px", fixed: true },
      { key: "chineseName", label: "中文名称", width: "180px", fixed: true },
      { key: "englishName", label: "英文名称", width: "180px", fixed: true },
      { key: "formula", label: "分子式/化学式", width: "150px", fixed: true },
      { key: "cas", label: "分子编号/CAS号", width: "170px" },
      { key: "structureSubtype", label: "结构种类细分", width: "190px" },
      { key: "molecularWeight", label: "分子量", width: "120px" },
      { key: "physicalAppearance", label: "性状-外观颜色", width: "160px" },
      { key: "physicalShape", label: "性状-形状", width: "130px" },
      { key: "physicalTaste", label: "性状-味觉", width: "130px" },
      { key: "physicalOdor", label: "性状-嗅觉", width: "130px" },
      { key: "ignitionPoint", label: "燃点", width: "110px" },
      { key: "flashPoint", label: "闪点", width: "110px" },
      { key: "source", label: "数据来源", width: "180px" },
      { key: "actions", label: "操作", width: "150px", fixed: true }
    ];
  };

  const previousCell = renderElectrolyteResultCell;
  renderElectrolyteResultCell = function (item, column) {
    if (item?.electrolyteCategory !== "organicLiquid") return previousCell(item, column);
    const map = {
      chineseName: item.name,
      englishName: getEnglishName(item),
      formula: item.formula,
      cas: item.cas || item.molecularId || lookup(item, ["分子编号/CAS号", "CAS号", "分子编号"]),
      structureSubtype: getStructureSubtype(item),
      molecularWeight: item.molecularWeight || lookup(item, ["分子量"]),
      physicalAppearance: item.physicalAppearance || item.appearanceColor || lookup(item, ["性状-外观颜色", "外观颜色", "性状"]),
      physicalShape: item.physicalShape || lookup(item, ["性状-形状", "形状"]),
      physicalTaste: item.physicalTaste || lookup(item, ["性状-味觉", "味觉"]),
      physicalOdor: item.physicalOdor || item.odor || lookup(item, ["性状-嗅觉", "嗅觉"]),
      ignitionPoint: item.ignitionPoint || item.firePoint || lookup(item, ["燃点"]),
      flashPoint: item.flashPoint || lookup(item, ["闪点"])
    };
    if (column.key in map) return `<td class="twod-result-extra-cell">${display(map[column.key])}</td>`;
    return previousCell(item, column);
  };

  const previousMenu = getElectrolyteDetailMenu;
  getElectrolyteDetailMenu = function (category) {
    if (category === "organicLiquid") return [
      { key: "basic", label: "基础信息" },
      { key: "property", label: "物性信息" },
      { key: "safety", label: "安全信息" },
      { key: "compute", label: "计算信息" },
      { key: "spectra", label: "图谱信息" },
      { key: "recommend", label: "相似分子推荐" }
    ];
    return previousMenu(category);
  };

  const renderRows = (title, rows) => renderElectrolyteInfoTable(title, rows.map((item) => ({ label: item.label, value: item.value ?? "/" })));
  const previousOrganicBasic = renderElectrolyteOrganicBasicPage;
  renderElectrolyteOrganicBasicPage = function (material) {
    const baseRows = [
      row(material, ["code", "id"], ["材料编号"]),
      row(material, ["name"], ["中文名称"]),
      { label: "英文名称", value: getEnglishName(material) },
      row(material, ["formula"], ["分子式/化学式", "分子式"]),
      row(material, ["cas", "molecularId"], ["分子编号/CAS号", "CAS号", "分子编号"]),
      { label: "结构种类细分", value: getStructureSubtype(material) },
      row(material, ["molecularWeight"], ["分子量"])
    ];
    return `
      <div class="twod-detail-page-head"><div><h4>${escapeText(material.name)}基础信息</h4><p>展示当前有机电解液的基础信息与三维结构。</p></div></div>
      ${buildElectrolyteSummaryPills(material)}
      <section class="twod-detail-section-card organic-liquid-basic-panel">
        ${renderRows("基础信息", baseRows)}
      </section>
      ${renderElectrolyteStructureCard(material, "三维结构图")}
      <div class="twod-detail-page-action organic-liquid-structure-download"><button class="btn-primary" type="button" onclick="return triggerElectrolyteDetailDownload('section', 'basic')">结构文件下载</button></div>
    `;
  };

  renderElectrolyteOrganicPropertyPage = function (material) {
    const rows = [
      row(material, ["physicalAppearance", "appearanceColor"], ["性状-外观颜色", "外观颜色", "性状"]),
      row(material, ["physicalShape"], ["性状-形状", "形状"]),
      row(material, ["physicalTaste"], ["性状-味觉", "味觉"]),
      row(material, ["physicalOdor", "odor"], ["性状-嗅觉", "嗅觉"]),
      row(material, ["meltingPoint"], ["熔点"]),
      row(material, ["boilingPoint"], ["沸点"]),
      row(material, ["relativeDensity", "density"], ["相对密度", "密度"]),
      row(material, ["flashPoint"], ["闪点"]),
      row(material, ["ignitionPoint", "firePoint"], ["燃点"]),
      row(material, ["waterSolubility", "solubility"], ["溶解性（水溶性）", "水溶性", "溶解性"]),
      row(material, ["refractiveIndex"], ["折射率"]),
      row(material, ["viscosity"], ["黏度", "粘度"]),
      row(material, ["dielectricConstant", "dielectric"], ["介电常数"]),
      row(material, ["specificHeatCapacity", "specificHeat"], ["比热容"]),
      row(material, ["thermalConductivity"], ["热导率"]),
      row(material, ["conductivity"], ["电导率", "离子电导率"])
    ];
    return `<div class="twod-detail-page-head"><div><h4>物性信息</h4><p>展示当前有机电解液的物性数据。</p></div></div><section class="twod-detail-section-card">${renderRows("物性信息", rows)}</section>`;
  };

  renderElectrolyteOrganicSafetyPage = function (material) {
    const rows = [
      row(material, ["toxicology"], ["毒理学数据", "毒理学", "毒性"]),
      row(material, ["ecotoxicity"], ["生态毒性", "生态"]),
      row(material, ["safetyIdentification", "safetyLabel", "ghs"], ["安全标识", "GHS", "安全标签"])
    ];
    return `<div class="twod-detail-page-head"><div><h4>安全信息</h4><p>展示当前有机电解液的安全与环境影响信息。</p></div></div><section class="twod-detail-section-card">${renderRows("安全信息", rows)}</section>`;
  };

  renderElectrolyteOrganicComputePage = function (material) {
    const computeValue = (value, unit = "") => {
      if (value == null || (typeof isLowDimNoPropertyValue === "function" && isLowDimNoPropertyValue(value))) return "/";
      const formatted = typeof formatElectrolyteValue === "function" ? formatElectrolyteValue(value) : String(value);
      return unit && !String(formatted).trim().endsWith(unit) ? `${formatted} ${unit}` : formatted;
    };
    const chargeDistribution = material.chargeDistribution ?? material.charge ?? material.atomicCharges;
    const rows = [
      { label: "HOMO", value: computeValue(material.homo, "eV") },
      { label: "LUMO", value: computeValue(material.lumo, "eV") },
      { label: "电荷分布", value: computeValue(chargeDistribution) },
      { label: "偶极矩", value: computeValue(material.dipole, "D") },
      { label: "溶解剂自由能", value: computeValue(material.solvation ?? material.solvationFreeEnergy, "kJ/mol") },
      { label: "吸附能", value: computeValue(material.adsorptionEnergy ?? material.adsorption, "eV") },
      { label: "生成焓", value: computeValue(material.heatForm ?? material.formationEnthalpy, "kJ/mol") }
    ];
    const rowMarkup = rows.map((item) => `<div class="detail-kv-item"><div class="detail-kv-label">${escapeValue(item.label)}</div><div class="detail-kv-value">${escapeValue(item.value)}</div></div>`).join("");
    return `<div class="twod-detail-page-head"><div><h4>计算信息</h4><p>展示当前有机电解液的电子结构与热力学相关计算数据。</p></div></div><section class="twod-detail-section-card"><div class="detail-kv-section"><div class="detail-kv-section-title">计算信息</div><div class="detail-kv-list organic-liquid-compute-list">${rowMarkup}</div></div></section>`;
  };

  const previousDetailPage = renderElectrolyteDetailPage;
  renderElectrolyteDetailPage = function (material) {
    if (material?.electrolyteCategory !== "organicLiquid") return previousDetailPage(material);
    const detailPage = document.getElementById("page-twod-detail");
    if (detailPage) detailPage.dataset.source = "electrolyte";
    const title = document.getElementById("twodDetailPageTitle");
    const subtitle = document.getElementById("twodDetailPageSubtitle");
    const content = document.getElementById("twodDetailPageContent");
    if (title) title.textContent = `${material.name} 材料详情`;
    if (subtitle) subtitle.textContent = "有机电解液 / 查看基础、物性、安全与计算信息。";
    normalizeElectrolyteDetailSection(material);
    renderElectrolyteDetailTreeOverride(material);
    if (!content) return;
    if (state.selectedTwodDetailSection === "property") content.innerHTML = renderElectrolyteOrganicPropertyPage(material);
    else if (state.selectedTwodDetailSection === "safety") content.innerHTML = renderElectrolyteOrganicSafetyPage(material);
    else if (state.selectedTwodDetailSection === "compute") content.innerHTML = renderElectrolyteOrganicComputePage(material);
    else if (state.selectedTwodDetailSection === "spectra") content.innerHTML = renderElectrolyteOrganicSpectraPage(material);
    else if (state.selectedTwodDetailSection === "recommend") content.innerHTML = renderElectrolyteOrganicRecommendPage(material);
    else content.innerHTML = renderElectrolyteOrganicBasicPage(material);
  };

  const previousTree = renderElectrolyteDetailTreeOverride;
  renderElectrolyteDetailTreeOverride = function (material) {
    const wrap = document.getElementById("twodDetailTree");
    if (!wrap) return previousTree(material);
    wrap.innerHTML = getElectrolyteDetailMenu(material.electrolyteCategory).map((item) => `<div class="twod-tree-item"><button class="twod-tree-node${state.selectedTwodDetailSection === item.key ? " active" : ""}" type="button" data-detail-section="${item.key}" onclick="return openElectrolyteDetailSection('${item.key}')">${item.label}</button></div>`).join("");
  };

  if (state.page === "electrolyte") renderElectrolyteModule();
})();


/* 2026-09 solid organic electrolyte inline information tabs */
(() => {
  const tabLabels = [
    { key: "basic", label: "基础信息" },
    { key: "property", label: "物性信息" },
    { key: "safety", label: "安全信息" }
  ];
  const tabEscape = (value) => typeof escapeHtml === "function" ? escapeHtml(String(value ?? "")) : String(value ?? "");
  const tabLookup = (material, labels, groups = ["basic", "spectra", "compute", "recommend", "external"]) => typeof findElectrolyteDetailValue === "function" ? findElectrolyteDetailValue(material, labels, groups) : null;
  const tabValue = (material, keys, labels = keys) => {
    for (const key of keys) if (material?.[key] != null && material[key] !== "") return material[key];
    return tabLookup(material, labels) ?? "/";
  };
  const tabRow = (material, keys, labels = keys) => ({ label: labels[0], value: tabValue(material, keys, labels) });
  const renderTabButtons = (active) => `<div class="solid-organic-info-tabs" role="tablist" aria-label="基础与物性信息"><span class="solid-organic-info-tabs-title">基础与物性信息</span>${tabLabels.map((tab) => `<button type="button" role="tab" aria-selected="${active === tab.key}" class="solid-organic-info-tab${active === tab.key ? " active" : ""}" data-solid-organic-info-tab="${tab.key}" onclick="return selectSolidOrganicInfoTab('${tab.key}')">${tab.label}</button>`).join("")}</div>`;

  const renderBaseRows = (material) => [
    { label: "材料编号", value: material.code || material.id },
    { label: "中文名称", value: material.name },
    { label: "英文名称", value: material.englishName || material.alias || "/" },
    { label: "分子式/化学式", value: material.formula },
    { label: "分子编号/CAS号", value: material.cas || tabLookup(material, ["分子编号/CAS号", "CAS号", "分子编号"]) || "/" },
    { label: "结构种类细分", value: material.structureSubtype || material.structureType || tabLookup(material, ["结构种类细分", "结构类型"]) || "/" },
    { label: "分子量", value: material.molecularWeight || tabLookup(material, ["分子量"]) || "/" }
  ];
  const renderPropertyRows = (material) => [
    tabRow(material, ["physicalAppearance", "appearanceColor"], ["性状-外观颜色", "外观颜色", "性状"]),
    tabRow(material, ["physicalShape"], ["性状-形状", "形状"]),
    tabRow(material, ["physicalTaste"], ["性状-味觉", "味觉"]),
    tabRow(material, ["physicalOdor", "odor"], ["性状-嗅觉", "嗅觉"]),
    tabRow(material, ["meltingPoint"], ["熔点"]),
    tabRow(material, ["boilingPoint"], ["沸点"]),
    tabRow(material, ["relativeDensity", "density"], ["相对密度", "密度"]),
    tabRow(material, ["flashPoint"], ["闪点"]),
    tabRow(material, ["ignitionPoint", "firePoint"], ["燃点"]),
    tabRow(material, ["waterSolubility", "solubility"], ["溶解性（水溶性）", "水溶性", "溶解性"]),
    tabRow(material, ["refractiveIndex"], ["折射率"]),
    tabRow(material, ["viscosity"], ["黏度", "粘度"]),
    tabRow(material, ["dielectricConstant", "dielectric"], ["介电常数"]),
    tabRow(material, ["specificHeatCapacity", "specificHeat"], ["比热容"]),
    tabRow(material, ["thermalConductivity"], ["热导率"]),
    tabRow(material, ["conductivity"], ["电导率", "离子电导率"])
  ];
  const renderSafetyRows = (material) => [
    tabRow(material, ["toxicology"], ["毒理学数据", "毒理学", "毒性"]),
    tabRow(material, ["ecotoxicity"], ["生态毒性", "生态"]),
    tabRow(material, ["safetyIdentification", "safetyLabel", "ghs"], ["安全标识", "GHS", "安全标签"])
  ];
  const renderTabContent = (material, active) => {
    if (active === "property") return renderElectrolyteInfoTable("物性信息", renderPropertyRows(material));
    if (active === "safety") return renderElectrolyteInfoTable("安全信息", renderSafetyRows(material));
    return renderElectrolyteInfoTable("基础信息", renderBaseRows(material));
  };

  selectSolidOrganicInfoTab = function (tab) {
    state.solidOrganicInfoTab = tabLabels.some((item) => item.key === tab) ? tab : "basic";
    const material = getCanonicalMaterialBySource("electrolyte", state.selectedMaterialId);
    if (material) renderElectrolyteDetailPage(material);
    return false;
  };

  const previousSolidOrganicBasic = renderElectrolyteSolidOrganicBasicPage;
  renderElectrolyteSolidOrganicBasicPage = function (material) {
    const active = tabLabels.some((item) => item.key === state.solidOrganicInfoTab) ? state.solidOrganicInfoTab : "basic";
    return `
      <div class="twod-detail-page-head">
        <div><h4>${tabEscape(material.name)}基础信息</h4><p>展示当前固态有机电解质的基础信息与三维结构。</p></div>
        <div class="twod-detail-page-action"><button class="btn-primary" type="button" onclick="return triggerElectrolyteDetailDownload('section', 'basic')">结构文件下载</button></div>
      </div>
      ${buildElectrolyteSummaryPills(material)}
      <div class="twod-basic-card-grid">
        <section class="twod-detail-table-card solid-organic-info-card">
          ${renderTabButtons(active)}
          <div class="solid-organic-info-tab-panel">${renderTabContent(material, active)}</div>
        </section>
        ${renderElectrolyteStructureCard(material, "3D晶体结构")}
      </div>
    `;
  };

  const style = document.createElement("style");
  style.textContent = `.solid-organic-info-tabs{display:flex;align-items:center;gap:8px;padding:0 0 14px;border-bottom:1px solid #e4ecf7;margin-bottom:18px;flex-wrap:wrap}.solid-organic-info-tabs-title{width:100%;font-size:18px;font-weight:700;color:#24364d;margin-bottom:2px}.solid-organic-info-tab{min-height:38px;padding:0 20px;border:1px solid #d9e5f3;border-radius:6px;background:#fff;color:#62758d;font:inherit;font-size:14px;cursor:pointer;transition:background .16s ease,color .16s ease,border-color .16s ease}.solid-organic-info-tab:hover{border-color:#2f6df6;color:#2f6df6}.solid-organic-info-tab.active{border-color:#2468f5;background:#2468f5;color:#fff;font-weight:600}.solid-organic-info-tab:focus-visible{outline:3px solid rgba(36,104,245,.24);outline-offset:2px}`;
  document.head.appendChild(style);

  if (state.page === "twod-detail") {
    const material = getCanonicalMaterialBySource("electrolyte", state.selectedMaterialId);
    if (material?.electrolyteCategory === "solidOrganic" && state.selectedTwodDetailSection === "basic") renderElectrolyteDetailPage(material);
  }
})();

/* Solid organic electrolyte list and detail refinements — 2026-09-02 */
(() => {
  const allowedSubtypeLabels = [
    "醚类固态有机电解质数据集",
    "酮类固态有机电解质数据集",
    "腈类固态有机电解质数据集",
    "其他固态有机电解质数据集"
  ];
  const englishNameMap = {
    "二乙烯基喹喔啉(单体)": "2,3-Divinylquinoxaline (Monomer)",
    "聚环氧乙烷": "Polyethylene Oxide",
    "聚氧化乙烯": "Polyethylene Oxide",
    "聚丙烯腈": "Polyacrylonitrile",
    "聚甲基丙烯酸甲酯": "Poly(methyl methacrylate)"
  };
  const solventRecommendations = [
    {
      chineseName: "N-甲基吡咯烷酮",
      englishName: "NMP",
      cas: "872-50-4",
      grade: "优",
      process: "溶液浇铸成膜",
      note: "挥发性中等"
    },
    {
      chineseName: "二甲基甲酰胺",
      englishName: "DMF",
      cas: "68-12-2",
      grade: "良",
      process: "溶液浇铸成膜",
      note: "具有一定毒性"
    }
  ];

  const escapeSolidOrganic = (value) => typeof escapeHtml === "function"
    ? escapeHtml(String(value ?? ""))
    : String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const isMissingSolidOrganicValue = (value) => {
    if (value == null || value === "") return true;
    const text = String(value).trim();
    return !text || text === "/" || text === "-" || text === "—" || /^(?:N\/?A|NULL)$/i.test(text) || /暂无|未记录|待评估|待补|无数据|缺失/.test(text);
  };
  const displaySolidOrganicValue = (value) => isMissingSolidOrganicValue(value) ? "/" : escapeSolidOrganic(value);
  const findSolidOrganicValue = (material, labels, tabs = ["basic", "property", "recommend", "compute"]) => {
    if (typeof findElectrolyteDetailValue === "function") {
      const found = findElectrolyteDetailValue(material, labels, tabs);
      if (!isMissingSolidOrganicValue(found)) return found;
    }
    for (const tab of tabs) {
      const row = (material?.detailTabs?.[tab] || []).find((item) => labels.some((label) => String(item?.label || "").includes(label)));
      if (row && !isMissingSolidOrganicValue(row.value)) return row.value;
    }
    return "/";
  };
  const getSolidOrganicEnglishName = (material) => {
    const explicit = material?.englishName || findSolidOrganicValue(material, ["英文名称"]);
    if (!isMissingSolidOrganicValue(explicit)) return explicit;
    if (englishNameMap[material?.name]) return englishNameMap[material.name];
    return material?.alias || "/";
  };
  const getSolidOrganicSubtype = (material) => {
    const explicit = material?.structureSubtype || material?.structureCategory || material?.structureType || findSolidOrganicValue(material, ["结构种类细分", "结构种类", "结构类型"]);
    if (allowedSubtypeLabels.includes(explicit)) return explicit;
    const sourceText = `${explicit || ""} ${material?.name || ""} ${material?.englishName || ""} ${material?.alias || ""} ${material?.formula || ""} ${(material?.keywords || []).join(" ")}`;
    if (/聚环氧乙烷|聚氧化乙烯|环氧乙烷|polyethylene\s*oxide|\bPEO\b|\bPEG\b|醚|ether/i.test(sourceText)) return allowedSubtypeLabels[0];
    if (/酮|ketone|carbonyl/i.test(sourceText)) return allowedSubtypeLabels[1];
    if (/聚丙烯腈|polyacrylonitrile|\bPAN\b|腈|nitrile|cyano/i.test(sourceText)) return allowedSubtypeLabels[2];
    return allowedSubtypeLabels[3];
  };
  const getSolidOrganicCas = (material) => material?.cas || material?.molecularId || findSolidOrganicValue(material, ["分子编号/CAS号", "CAS号", "分子编号"]);

  const previousColumns = getElectrolyteVisibleResultColumns;
  const previousResultHeader = typeof renderElectrolyteResultHeader === "function" ? renderElectrolyteResultHeader : null;
  if (previousResultHeader) {
    renderElectrolyteResultHeader = function (columns) {
      if ((state.electrolyteCategory || "") !== "solidInorganic") return previousResultHeader(columns);
      return `<tr>${columns.map((column) => `<th style="width:${column.width || "150px"}">${column.label}</th>`).join("")}</tr>`;
    };
  }
  getElectrolyteVisibleResultColumns = function () {
    if ((state.electrolyteCategory || "organicLiquid") !== "solidOrganic") return previousColumns();
    return [
      { key: "code", label: "材料编号", width: "150px", fixed: true },
      { key: "chineseName", label: "中文名称", width: "180px", fixed: true },
      { key: "englishName", label: "英文名称", width: "210px", fixed: true },
      { key: "formula", label: "分子式/化学式", width: "150px", fixed: true },
      { key: "cas", label: "分子编号/CAS号", width: "170px" },
      { key: "structureSubtype", label: "结构种类细分", width: "230px" },
      { key: "ignitionPoint", label: "燃点", width: "110px" },
      { key: "molarVolume", label: "摩尔体积", width: "130px" },
      { key: "density", label: "密度", width: "110px" },
      { key: "source", label: "数据来源", width: "180px" },
      { key: "actions", label: "操作", width: "150px", fixed: true }
    ];
  };

  const previousCell = renderElectrolyteResultCell;
  renderElectrolyteResultCell = function (item, column) {
    if (item?.electrolyteCategory !== "solidOrganic") return previousCell(item, column);
    const values = {
      chineseName: item.name,
      englishName: getSolidOrganicEnglishName(item),
      formula: item.formula,
      cas: getSolidOrganicCas(item),
      structureSubtype: getSolidOrganicSubtype(item),
      ignitionPoint: item.ignitionPoint || item.firePoint || findSolidOrganicValue(item, ["燃点"]),
      molarVolume: item.molarVolume || findSolidOrganicValue(item, ["摩尔体积"]),
      density: item.density || findSolidOrganicValue(item, ["密度"])
    };
    if (Object.prototype.hasOwnProperty.call(values, column.key)) {
      return `<td class="twod-result-extra-cell">${displaySolidOrganicValue(values[column.key])}</td>`;
    }
    return previousCell(item, column);
  };

  const previousMenu = getElectrolyteDetailMenu;
  getElectrolyteDetailMenu = function (category) {
    if (category !== "solidOrganic") return previousMenu(category);
    return [
      { key: "basic", label: "基础信息" },
      { key: "compute", label: "计算信息" },
      { key: "solvent", label: "溶解溶剂推荐" }
    ];
  };

  const solidOrganicTabs = [
    { key: "basic", label: "基础信息" },
    { key: "property", label: "物性信息" }
  ];
  const valueRow = (label, value) => ({ label, value: isMissingSolidOrganicValue(value) ? "/" : value });
  const renderSolidOrganicInfoTable = (title, rows) => `
    <table class="twod-detail-info-table solid-organic-kv-table">
      <tbody>
        <tr><th colspan="2">${escapeSolidOrganic(title)}</th></tr>
        ${rows.map((item) => `<tr><td class="is-row-head">${escapeSolidOrganic(item.label)}</td><td>${displaySolidOrganicValue(item.value)}</td></tr>`).join("")}
      </tbody>
    </table>`;
  const getSolidOrganicBasicRows = (material) => [
    valueRow("材料编号", material.code || material.id),
    valueRow("中文名称", material.name),
    valueRow("英文名称", getSolidOrganicEnglishName(material)),
    valueRow("分子式/化学式", material.formula),
    valueRow("分子编号/CAS号", getSolidOrganicCas(material)),
    valueRow("结构种类细分", getSolidOrganicSubtype(material)),
    valueRow("分子量", material.molecularWeight || findSolidOrganicValue(material, ["分子量"])),
    valueRow("对应单体信息", material.monomerInfo || findSolidOrganicValue(material, ["对应单体信息", "单体信息"]))
  ];
  const getSolidOrganicPropertyRows = (material) => [
    valueRow("摩尔体积", material.molarVolume || findSolidOrganicValue(material, ["摩尔体积"])),
    valueRow("密度", material.density || findSolidOrganicValue(material, ["密度"])),
    valueRow("玻璃化转变温度", material.glassTransitionTemperature || material.glassTransitionTemp || findSolidOrganicValue(material, ["玻璃化转变温度", "玻璃化温度"])),
    valueRow("电导率", material.conductivityLabel ? `${material.conductivityLabel} S/cm` : material.conductivity || findSolidOrganicValue(material, ["电导率", "离子电导率"])),
    valueRow("溶解溶剂", material.solubleSolvent || material.solvent || findSolidOrganicValue(material, ["溶解溶剂", "推荐溶剂", "溶剂推荐"])),
    valueRow("抗拉性能", material.tensileProperty || material.tensileStrength || material.mechanicalProperty || findSolidOrganicValue(material, ["抗拉性能", "拉伸性能", "机械性能"]))
  ];
  const renderSolidOrganicTabs = (active) => `
    <div class="solid-organic-info-tabs" role="tablist" aria-label="固态有机电解质信息类型">
      ${solidOrganicTabs.map((tab) => `<button type="button" role="tab" aria-selected="${active === tab.key}" class="solid-organic-info-tab${active === tab.key ? " active" : ""}" data-solid-organic-info-tab="${tab.key}" onclick="return selectSolidOrganicInfoTab('${tab.key}')">${tab.label}</button>`).join("")}
    </div>`;

  selectSolidOrganicInfoTab = function (tab) {
    state.solidOrganicInfoTab = solidOrganicTabs.some((item) => item.key === tab) ? tab : "basic";
    const material = getCanonicalMaterialBySource("electrolyte", state.selectedMaterialId);
    if (material) renderElectrolyteDetailPage(material);
    return false;
  };

  renderElectrolyteSolidOrganicBasicPage = function (material) {
    const active = solidOrganicTabs.some((item) => item.key === state.solidOrganicInfoTab) ? state.solidOrganicInfoTab : "basic";
    const rows = active === "property" ? getSolidOrganicPropertyRows(material) : getSolidOrganicBasicRows(material);
    return `
      <div class="twod-detail-page-head">
        <div><h4>${escapeSolidOrganic(material.name)}基础信息</h4><p>通过页签查看当前材料的基础信息与物性信息；缺失数据统一显示“/”。</p></div>
        <div class="twod-detail-page-action"><button class="btn-primary" type="button" onclick="return triggerElectrolyteDetailDownload('section', 'basic')">结构文件下载</button></div>
      </div>
      ${buildElectrolyteSummaryPills(material)}
      <div class="twod-basic-card-grid">
        <section class="twod-detail-table-card solid-organic-info-card">
          ${renderSolidOrganicTabs(active)}
          <div class="solid-organic-info-tab-panel" role="tabpanel">${renderSolidOrganicInfoTable(active === "property" ? "物性信息" : "基础信息", rows)}</div>
        </section>
        ${renderElectrolyteStructureCard(material, "3D晶体结构")}
      </div>`;
  };

  renderElectrolyteSolidOrganicComputePage = function (material) {
    const rows = [
      valueRow("摩尔热容", material.heatCapacity != null ? `${material.heatCapacity} J/mol·K` : findSolidOrganicValue(material, ["摩尔热容"])),
      valueRow("结合能", material.bindingEnergy != null ? `${material.bindingEnergy} kJ/mol` : findSolidOrganicValue(material, ["结合能"]))
    ];
    return `
      <div class="twod-detail-page-head">
        <div><h4>计算信息</h4><p>展示当前固态有机电解质的摩尔热容和结合能。</p></div>
        <div class="twod-detail-page-action"><button class="btn-primary" type="button" onclick="return triggerElectrolyteDetailDownload('section', 'compute')">计算信息下载</button></div>
      </div>
      <section class="twod-detail-section-card"><h5>计算数据</h5>${renderSolidOrganicInfoTable("计算信息", rows)}</section>`;
  };

  window.exportSolidOrganicSolventRow = function (index) {
    const row = solventRecommendations[index];
    if (!row) return false;
    const headers = ["溶剂名称（中文）", "溶剂名称（英文）", "CAS号", "溶解能力等级", "适用工艺场景", "备注说明"];
    const values = [row.chineseName, row.englishName, row.cas, row.grade, row.process, row.note];
    const content = `\ufeff${headers.join("\t")}\r
${values.join("\t")}`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([content], { type: "text/tab-separated-values;charset=utf-8" }));
    link.download = `${row.englishName || "solvent"}-溶剂推荐.tsv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 0);
    return false;
  };

  renderElectrolyteSolidOrganicSolventPage = function () {
    return `
      <div class="twod-detail-page-head">
        <div><h4>溶解溶剂推荐</h4><p>查看适用于当前固态有机电解质高分子的推荐溶解溶剂。</p></div>
        <div class="twod-detail-page-action"><button class="btn-primary" type="button" onclick="return triggerElectrolyteDetailDownload('section', 'solvent')">推荐结果下载</button></div>
      </div>
      <section class="twod-detail-section-card solid-organic-solvent-card">
        <div class="solid-organic-solvent-note" role="note"><strong>说明：</strong>本列表为该固态有机电解质高分子的推荐溶解溶剂，数据来源于实验 / 文献记录；溶解效果受温度、浓度、高分子分子量影响，仅供实验制备参考。</div>
        <div class="solid-organic-solvent-table-wrap">
          <table class="solid-organic-solvent-table">
            <thead><tr><th>溶剂名称（中文）</th><th>溶剂名称（英文）</th><th>CAS号</th><th>溶解能力等级</th><th>适用工艺场景</th><th>备注说明</th><th>操作</th></tr></thead>
            <tbody>${solventRecommendations.map((row, index) => `<tr><td>${escapeSolidOrganic(row.chineseName)}</td><td>${escapeSolidOrganic(row.englishName)}</td><td>${escapeSolidOrganic(row.cas)}</td><td><span class="solid-organic-solvent-grade">${escapeSolidOrganic(row.grade)}</span></td><td>${escapeSolidOrganic(row.process)}</td><td>${escapeSolidOrganic(row.note)}</td><td><button class="solid-organic-solvent-export" type="button" onclick="return exportSolidOrganicSolventRow(${index})">导出本条</button></td></tr>`).join("")}</tbody>
          </table>
        </div>
      </section>`;
  };

  const style = document.createElement("style");
  style.textContent = `
    .solid-organic-info-tabs{display:flex;align-items:center;gap:10px;padding:0 0 14px;border-bottom:1px solid #e4ecf7;margin-bottom:18px}
    .solid-organic-info-tab{min-height:44px;padding:0 24px;border:1px solid #d9e5f3;border-radius:7px;background:#fff;color:#60748e;font:inherit;font-size:14px;cursor:pointer;transition:background .16s ease,color .16s ease,border-color .16s ease,box-shadow .16s ease}
    .solid-organic-info-tab:hover{border-color:#2f6df6;color:#2f6df6}.solid-organic-info-tab.active{border-color:#2468f5;background:#2468f5;color:#fff;font-weight:600;box-shadow:0 4px 12px rgba(36,104,245,.18)}
    .solid-organic-info-tab:focus-visible,.solid-organic-solvent-export:focus-visible{outline:3px solid rgba(36,104,245,.24);outline-offset:2px}
    .solid-organic-kv-table{width:100%!important;min-width:0!important;max-width:100%;table-layout:fixed}.solid-organic-kv-table td:first-child{width:42%;text-align:left}.solid-organic-kv-table td:last-child{width:58%;text-align:left;color:#43566e}.solid-organic-kv-table th,.solid-organic-kv-table td{padding:13px 16px}
    .solid-organic-solvent-note{margin-bottom:18px;padding:13px 16px;border:1px solid #cfe0f8;border-radius:8px;background:#f4f8ff;color:#52677f;font-size:13px;line-height:1.75}.solid-organic-solvent-note strong{color:#2d5fae}
    .solid-organic-solvent-table-wrap{overflow-x:auto;border:1px solid #e1e8f1;border-radius:9px}.solid-organic-solvent-table{width:100%;min-width:960px;border-collapse:collapse;background:#fff}
    .solid-organic-solvent-table th{padding:15px 14px;border-right:1px solid #e4e9f0;border-bottom:1px solid #dfe6ef;background:#f8fafc;color:#24364d;font-size:14px;font-weight:700;text-align:left;white-space:nowrap}
    .solid-organic-solvent-table td{padding:15px 14px;border-right:1px solid #edf1f6;border-bottom:1px solid #edf1f6;color:#52657c;font-size:14px;line-height:1.5}.solid-organic-solvent-table th:last-child,.solid-organic-solvent-table td:last-child{border-right:0}.solid-organic-solvent-table tbody tr:last-child td{border-bottom:0}.solid-organic-solvent-table tbody tr:hover{background:#fbfdff}
    .solid-organic-solvent-grade{display:inline-flex;align-items:center;justify-content:center;min-width:34px;padding:3px 9px;border-radius:12px;background:#edf8f1;color:#238553;font-weight:600}
    .solid-organic-solvent-export{min-height:40px;padding:0 14px;border:1px solid #c9daf3;border-radius:6px;background:#fff;color:#2868c7;font:inherit;font-size:13px;cursor:pointer}.solid-organic-solvent-export:hover{border-color:#2868c7;background:#f3f7ff}
    @media (max-width:720px){.solid-organic-info-tabs{align-items:stretch}.solid-organic-info-tab{flex:1;padding:0 12px}.solid-organic-solvent-note{font-size:12px}}
  `;
  document.head.appendChild(style);
})();

/* 2026-09 organic electrolyte inline information tabs */
(() => {
  const tabs = [
    { key: "basic", label: "基础信息" },
    { key: "property", label: "物性信息" },
    { key: "safety", label: "安全信息" }
  ];
  const lookup = (material, labels) => typeof findElectrolyteDetailValue === "function" ? findElectrolyteDetailValue(material, labels, ["basic", "spectra", "compute", "recommend", "external"]) : null;
  const valueOf = (material, keys, labels = keys) => {
    for (const key of keys) if (material?.[key] != null && material[key] !== "") return material[key];
    return lookup(material, labels) ?? "/";
  };
  const row = (material, keys, labels = keys) => ({ label: labels[0], value: valueOf(material, keys, labels) });
  const rowsFor = {
    basic: (material) => [
      row(material, ["code", "id"], ["材料编号"]),
      row(material, ["name"], ["中文名称"]),
      { label: "英文名称", value: material.englishName || material.alias || "/" },
      row(material, ["formula"], ["分子式/化学式", "分子式"]),
      row(material, ["cas", "molecularId"], ["分子编号/CAS号", "CAS号", "分子编号"]),
      row(material, ["structureSubtype", "structureCategory", "structureType"], ["结构种类细分", "结构类型", "结构种类"]),
      row(material, ["molecularWeight"], ["分子量"])
    ],
    property: (material) => [
      row(material, ["physicalAppearance", "appearanceColor"], ["性状-外观颜色", "外观颜色", "性状"]),
      row(material, ["physicalShape"], ["性状-形状", "形状"]),
      row(material, ["physicalTaste"], ["性状-味觉", "味觉"]),
      row(material, ["physicalOdor", "odor"], ["性状-嗅觉", "嗅觉"]),
      row(material, ["meltingPoint"], ["熔点"]),
      row(material, ["boilingPoint"], ["沸点"]),
      row(material, ["relativeDensity", "density"], ["相对密度", "密度"]),
      row(material, ["flashPoint"], ["闪点"]),
      row(material, ["ignitionPoint", "firePoint"], ["燃点"]),
      row(material, ["waterSolubility", "solubility"], ["溶解性（水溶性）", "水溶性", "溶解性"]),
      row(material, ["refractiveIndex"], ["折射率"]),
      row(material, ["viscosity"], ["黏度", "粘度"]),
      row(material, ["dielectricConstant", "dielectric"], ["介电常数"]),
      row(material, ["specificHeatCapacity", "specificHeat"], ["比热容"]),
      row(material, ["thermalConductivity"], ["热导率"]),
      row(material, ["conductivity"], ["电导率", "离子电导率"])
    ],
    safety: (material) => [
      row(material, ["toxicology"], ["毒理学数据", "毒理学", "毒性"]),
      row(material, ["ecotoxicity"], ["生态毒性", "生态"]),
      row(material, ["safetyIdentification", "safetyLabel", "ghs"], ["安全标识", "GHS", "安全标签"])
    ]
  };
  const renderTabs = (active) => `<div class="organic-liquid-info-tabs" role="tablist" aria-label="基础与物性信息"><button type="button" role="tab" aria-selected="${active === "basic"}" class="organic-liquid-info-tab${active === "basic" ? " active" : ""}" data-organic-liquid-info-tab="basic" onclick="return selectOrganicLiquidInfoTab('basic')">基础信息</button><button type="button" role="tab" aria-selected="${active === "property"}" class="organic-liquid-info-tab${active === "property" ? " active" : ""}" data-organic-liquid-info-tab="property" onclick="return selectOrganicLiquidInfoTab('property')">物性信息</button><button type="button" role="tab" aria-selected="${active === "safety"}" class="organic-liquid-info-tab${active === "safety" ? " active" : ""}" data-organic-liquid-info-tab="safety" onclick="return selectOrganicLiquidInfoTab('safety')">安全信息</button></div>`;
  const renderContent = (material, active) => renderElectrolyteInfoTable(active === "property" ? "物性信息" : active === "safety" ? "安全信息" : "基础信息", rowsFor[active](material));

  selectOrganicLiquidInfoTab = function (tab) {
    state.organicLiquidInfoTab = tabs.some((item) => item.key === tab) ? tab : "basic";
    const material = getCanonicalMaterialBySource("electrolyte", state.selectedMaterialId);
    if (material) renderElectrolyteDetailPage(material);
    return false;
  };

  const previousMenu = getElectrolyteDetailMenu;
  getElectrolyteDetailMenu = function (category) {
    if (category !== "organicLiquid") return previousMenu(category);
    return previousMenu(category).filter((item) => !["property", "safety"].includes(item.key));
  };

  const previousBasic = renderElectrolyteOrganicBasicPage;
  renderElectrolyteOrganicBasicPage = function (material) {
    const active = tabs.some((item) => item.key === state.organicLiquidInfoTab) ? state.organicLiquidInfoTab : "basic";
    return `<div class="twod-detail-page-head"><div><h4>${material.name}基础信息</h4><p>展示当前有机电解液的基础信息与三维结构。</p></div><div class="twod-detail-page-action"><button class="btn-primary" type="button" onclick="return triggerElectrolyteDetailDownload('section', 'basic')">结构文件下载</button></div></div>${buildElectrolyteSummaryPills(material)}<div class="twod-basic-card-grid"><section class="twod-detail-table-card organic-liquid-info-card">${renderTabs(active)}<div class="organic-liquid-info-tab-panel">${renderContent(material, active)}</div></section>${renderElectrolyteStructureCard(material, "三维结构图")}</div>`;
  };

  const previousDetail = renderElectrolyteDetailPage;
  renderElectrolyteDetailPage = function (material) {
    if (material?.electrolyteCategory !== "organicLiquid") return previousDetail(material);
    const detailPage = document.getElementById("page-twod-detail");
    const title = document.getElementById("twodDetailPageTitle");
    const subtitle = document.getElementById("twodDetailPageSubtitle");
    const content = document.getElementById("twodDetailPageContent");
    if (detailPage) detailPage.dataset.source = "electrolyte";
    if (title) title.textContent = `${material.name} 材料详情`;
    if (subtitle) subtitle.textContent = "有机电解液 / 查看基础信息、图谱信息、计算信息与关联推荐内容。";
    if (typeof renderElectrolyteDetailTreeOverride === "function") renderElectrolyteDetailTreeOverride(material);
    if (!content) return;
    const section = state.selectedTwodDetailSection;
    if (section === "basic") content.innerHTML = renderElectrolyteOrganicBasicPage(material);
    else if (section === "compute") content.innerHTML = renderElectrolyteOrganicComputePage(material);
    else if (section === "spectra") content.innerHTML = renderElectrolyteOrganicSpectraPage(material);
    else if (section === "recommend") content.innerHTML = renderElectrolyteOrganicRecommendPage(material);
    else content.innerHTML = renderElectrolyteOrganicBasicPage(material);
  };

  const style = document.createElement("style");
  style.textContent = `.organic-liquid-info-tabs{display:flex;gap:12px;padding:0 0 16px;border-bottom:1px solid #e4ecf7;margin-bottom:18px}.organic-liquid-info-tab{min-height:38px;padding:0 26px;border:1px solid #d9e5f3;border-radius:6px;background:#fff;color:#62758d;font:inherit;font-size:14px;cursor:pointer}.organic-liquid-info-tab.active{border-color:#2468f5;background:#2468f5;color:#fff;font-weight:600}.organic-liquid-info-tab:focus-visible{outline:3px solid rgba(36,104,245,.24);outline-offset:2px}`;
  document.head.appendChild(style);
})();


/* 2026-09 solid inorganic electrolyte requested fields/detail cleanup */
(() => {
  const SUBTYPES = ["钙钛矿型固态无机电解质", "石榴石型固态无机电解质", "NASICON型固态无机电解质", "反钙钛矿型固态电解质", "硫化物型固态电解质", "卤化物型固态电解质", "其他类型固态电解质"];
  const escapeText = (v) => typeof escapeHtml === "function" ? escapeHtml(String(v ?? "")) : String(v ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"}[c] || c));
  const read = (m, keys, labels = keys) => {
    for (const k of keys) if (m?.[k] != null && m[k] !== "") return m[k];
    if (typeof findElectrolyteDetailValue === "function") {
      const found = findElectrolyteDetailValue(m, labels, ["basic", "spectra", "compute"]);
      if (found != null && found !== "" && !isLowDimNoPropertyValue(found)) return found;
    }
    return "/";
  };
  const show = (v) => { const raw = v == null ? "" : String(v); return !raw || ["—", "NA", "N/A"].includes(raw) || /暂无|待补/.test(raw) ? "/" : escapeText(raw); };
  const subtype = (m) => {
    const explicit = read(m, ["structureSubtype", "structureCategory", "structureType"], ["结构种类细分", "结构种类", "结构类型"]);
    if (SUBTYPES.includes(explicit)) return explicit;
    const text = `${explicit} ${m?.name || ""} ${m?.alias || ""} ${m?.formula || ""} ${(m?.keywords || []).join(" ")}`;
    if (/石榴石|garnet|LLZO/i.test(text)) return SUBTYPES[1];
    if (/NASICON|磷酸盐|LATP|LAGP/i.test(text)) return SUBTYPES[2];
    if (/反钙钛矿|anti.?perovskite/i.test(text)) return SUBTYPES[3];
    if (/硫化物|sulfide|硫银锗矿|LGPS|Li.?P.?S/i.test(text)) return SUBTYPES[4];
    if (/卤化物|halide|Li.?Cl|Li.?Br|Li.?I/i.test(text)) return SUBTYPES[5];
    if (/钙钛矿|perovskite|LiTaO3|LiNbO3/i.test(text)) return SUBTYPES[0];
    return SUBTYPES[6];
  };
  const previousColumns = getElectrolyteVisibleResultColumns;
  getElectrolyteVisibleResultColumns = function () {
    if ((state.electrolyteCategory || "") !== "solidInorganic") return previousColumns();
    return [
      { key: "code", label: "材料编号", width: "150px", fixed: true }, { key: "chineseName", label: "中文名称", width: "180px", fixed: true }, { key: "englishName", label: "英文名称", width: "210px", fixed: true }, { key: "formula", label: "分子式/化学式", width: "150px", fixed: true }, { key: "cas", label: "CAS号", width: "140px", fixed: true }, { key: "structureSubtype", label: "结构种类细分", width: "230px", fixed: true }, { key: "density", label: "密度", width: "110px", fixed: true }, { key: "source", label: "数据来源", width: "180px" }, { key: "actions", label: "操作", width: "150px", fixed: true }
    ];
  };
  const previousCell = renderElectrolyteResultCell;
  renderElectrolyteResultCell = function (item, column) {
    if (item?.electrolyteCategory !== "solidInorganic") return previousCell(item, column);
    const cells = { chineseName: item.name, englishName: item.englishName || item.alias, formula: item.formula, cas: item.cas || item.CAS, structureSubtype: subtype(item), density: item.density || read(item, ["density"], ["密度"]) };
    return Object.prototype.hasOwnProperty.call(cells, column.key) ? `<td class="twod-result-extra-cell">${show(cells[column.key])}</td>` : previousCell(item, column);
  };
  const previousMenu = getElectrolyteDetailMenu;
  getElectrolyteDetailMenu = function (category) {
    if (category !== "solidInorganic") return previousMenu(category);
    return [{ key: "basic", label: "基础信息" }, { key: "spectra", label: "图谱数据" }, { key: "compute", label: "计算信息" }, { key: "external", label: "外部数据关联" }];
  };
  const previousBasic = renderElectrolyteSolidInorganicBasicPage;
  renderElectrolyteSolidInorganicBasicPage = function (material) {
    if (material?.electrolyteCategory !== "solidInorganic") return previousBasic(material);
    const rows = [
      ["材料编号", material.code || material.id], ["中文名称", material.name], ["英文名称", material.englishName || material.alias], ["分子式/化学式", material.formula], ["CAS号", material.cas || material.CAS], ["结构种类细分", subtype(material)], ["密度", material.density || read(material, ["density"], ["密度"])], ["空间群/点群", read(material, ["spaceGroupPointGroup"], ["空间群/点群", "空间群", "点群"])], ["晶胞棱长", read(material, ["cellEdge", "lattice"], ["晶胞棱长", "晶胞参数"])], ["晶胞尺寸", read(material, ["cellSize"], ["晶胞尺寸", "晶胞参数"])], ["对称性/晶系", read(material, ["symmetryCrystalSystem", "crystalSystem"], ["对称性/晶系", "晶系", "对称性"])]
    ].map(([label, value]) => ({ label, value }));
    const realFormat = typeof getLowDimRealCase === "function" ? getLowDimRealCase("electrolyte", material.id)?.structure?.viewerFormat : null;
    const extension = realFormat === "vasp" ? "vasp" : realFormat || "cif";
    const fileName = `${material.id || material.code}_structure.${extension}`;
    return `<div class="twod-detail-page-head"><div><h4>${escapeText(material.name)}基础信息</h4><p>展示固态无机电解质的基础信息、晶体结构图与结构文件。</p></div></div>${buildElectrolyteSummaryPills(material)}<div class="twod-basic-card-grid"><section class="twod-detail-table-card"><h5 class="twod-detail-basic-title">基础信息</h5>${renderElectrolyteInfoTable("基础信息", rows)}</section><section class="twod-detail-visual-card"><h5>晶体结构示意图</h5><div class="twod-detail-structure-stage">${renderLowDimRealViewer("electrolyte", material) || `<div class="material-atom-cluster">${renderMaterialStructureMarkup(material.structureView || { nodes: [], bonds: [], legend: [] })}</div>`}</div><div class="chart-caption">${escapeText(material.structureView?.caption || "当前暂无结构说明")}</div><div class="electrolyte-structure-file-content"><h6>结构文件</h6><div class="electrolyte-structure-file-meta"><span class="electrolyte-structure-file-name">${escapeText(fileName)}</span><span class="electrolyte-structure-file-format">格式：${escapeText(extension.toUpperCase())}</span><button class="twod-detail-link-btn" type="button" onclick="return triggerElectrolyteDetailDownload('structure')">下载结构文件</button></div></div></section></div>`;
  };
  const previousCompute = renderElectrolyteSolidInorganicComputePage;
  renderElectrolyteSolidInorganicComputePage = function (material) {
    if (material?.electrolyteCategory !== "solidInorganic") return previousCompute(material);
    const rows = (material.detailTabs?.compute || []).filter((item) => !/形成能|费米能级/.test(String(item?.label || "")));
    return `<div class="twod-detail-page-head"><div><h4>计算信息</h4><p>展示当前固态无机电解质中保留的计算数据。</p></div></div><section class="twod-detail-section-card"><h5>计算数据</h5>${renderElectrolyteInfoTable("计算信息", rows.length ? rows : [{ label: "记录状态", value: "暂无其他计算信息" }])}</section>`;
  };
  const previousVisualBlock = renderElectrolyteVisualBlock;
  renderElectrolyteVisualBlock = function (material, keys) {
    if (material?.electrolyteCategory !== "solidInorganic") return previousVisualBlock(material, keys);
    return previousVisualBlock(material, keys).replace(/<h5>能带结构图<\/h5>/, "<h5>能带结构 / 电子能带结构</h5>").replace(/<h5>态密度图<\/h5>/, "<h5>态密度</h5>");
  };
  const previousSpectra = renderElectrolyteSolidInorganicSpectraPage;
  renderElectrolyteSolidInorganicSpectraPage = function (material) {
    if (material?.electrolyteCategory !== "solidInorganic") return previousSpectra(material);
    return `<div class="twod-detail-page-head"><div><h4>图谱数据</h4><p>展示能带结构、态密度、电子能带结构、X射线衍射谱图与X射线吸收谱图。</p></div></div>${renderElectrolyteVisualBlock(material, ["band", "dos", "xrd", "absorption"])}`;
  };
  const previousDetail = renderElectrolyteDetailPage;
  renderElectrolyteDetailPage = function (material) {
    if (material?.electrolyteCategory !== "solidInorganic") return previousDetail(material);
    const content = document.getElementById("twodDetailPageContent");
    const title = document.getElementById("twodDetailPageTitle");
    const subtitle = document.getElementById("twodDetailPageSubtitle");
    if (title) title.textContent = `${material.name} 材料详情`;
    if (subtitle) subtitle.textContent = "固态无机电解质 / 查看基础信息、图谱数据、计算信息与外部数据关联。";
    normalizeElectrolyteDetailSection(material);
    renderElectrolyteDetailTreeOverride(material);
    if (!content) return;
    const section = state.selectedTwodDetailSection;
    content.innerHTML = section === "spectra" ? renderElectrolyteSolidInorganicSpectraPage(material) : section === "compute" ? renderElectrolyteSolidInorganicComputePage(material) : section === "external" ? renderElectrolyteSolidInorganicExternalPage(material) : renderElectrolyteSolidInorganicBasicPage(material);
  };
  const style = document.createElement("style");
  style.textContent = `.electrolyte-structure-file-content{margin-top:16px;padding-top:14px;border-top:1px solid #e4ecf7}.electrolyte-structure-file-content h6{margin:0 0 8px;color:#24364d;font-size:13px}.electrolyte-structure-file-meta{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px;border:1px solid #e1e8f1;border-radius:6px;background:#f8fafc;color:#52657c;font-size:13px}.electrolyte-structure-file-name{font-weight:600;color:#24364d}.electrolyte-structure-file-format{color:#60748e}.electrolyte-structure-file-meta .twod-detail-link-btn{margin-left:auto}`;
  document.head.appendChild(style);
})();
