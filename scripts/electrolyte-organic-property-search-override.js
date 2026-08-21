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
      { key: "spectra", label: "固态有机电解质图谱信息" },
      { key: "compute", label: "固态有机电解质计算信息" }
    ],
    solidInorganic: [
      { key: "basic", label: "固态无机电解质基础信息" },
      { key: "spectra", label: "固态无机电解质图谱信息" },
      { key: "compute", label: "固态无机电解质计算信息" },
      { key: "external", label: "外部数据关联" }
    ]
  };
  const spectraFields = [
    { key: "ir", label: "气相红外光谱" },
    { key: "raman", label: "拉曼光谱" },
    { key: "nmr", label: "核磁共振光谱" }
  ];

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
      controls = radio("elyOrganicStructure", filters.basicStructure, [{ key: "has", label: "含有结构图" }, { key: "none", label: "不含有结构图" }], "basicStructure");
    } else if (filters.propertyType === "spectra") {
      controls = spectraFields.map((item) => `
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
      controls = radio("elyOrganicSimilar", filters.similarStatus, [{ key: "has", label: "有相似分子推荐" }, { key: "none", label: "无相似分子推荐" }], "similarStatus");
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
    if (state.electrolyteCategory !== "organicLiquid") return previousVisibleColumns();
    return [
      { key: "code", label: "材料编号", width: "150px", fixed: true },
      { key: "chineseName", label: "中文名称", width: "180px", fixed: true },
      { key: "englishName", label: "英文简称", width: "150px", fixed: true },
      { key: "formula", label: "分子式", width: "130px", fixed: true },
      { key: "physicalState", label: "性状", width: "120px" },
      { key: "meltingPoint", label: "熔点", width: "110px" },
      { key: "boilingPoint", label: "沸点", width: "110px" },
      { key: "safetyLevel", label: "安全等级", width: "120px" },
      { key: "source", label: "数据来源", width: "180px" },
      { key: "actions", label: "操作", width: "150px", fixed: true }
    ];
  };

  renderElectrolyteResultCell = function (item, column) {
    if (state.electrolyteCategory === "organicLiquid") {
      if (column.key === "chineseName") return `<td>${formatLowDimValue(item.name)}</td>`;
      if (column.key === "safetyLevel") return `<td>${formatLowDimValue(item.hazardLevel || item.safety)}</td>`;
    }
    return previousResultCell(item, column);
  };

  getElectrolyteDetailMenu = function (category) {
    const menu = previousDetailMenu(category);
    return category === "solidOrganic" ? menu.filter((item) => item.key !== "recommend") : menu;
  };

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
