
    (function () {
      if (typeof state === "undefined" || typeof optoMaterials === "undefined") return;

      const esc = (value) => {
        if (typeof escapeLowDimHtml === "function") return escapeLowDimHtml(value == null ? "" : String(value));
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        }[char]));
      };

      const spectrumOptions = [
        { key: "ftir", label: "红外光谱" },
        { key: "raman", label: "拉曼光谱" },
        { key: "nmr", label: "核磁共振光谱" }
      ];

      const propertyOptions = {
        structure3d: [
          { key: "with", label: "包含有机分子三维结构" },
          { key: "without", label: "不包含有机分子三维结构" }
        ],
        spectra: spectrumOptions,
        dos: [
          { key: "with", label: "包含态密度信息" },
          { key: "without", label: "不包含态密度信息" }
        ],
        external: [
          { key: "with", label: "包含外部数据关联" },
          { key: "without", label: "不包含外部数据关联" }
        ]
      };

      const propertyTypeOptions = [
        { key: "structure3d", label: "有机分子三维结构" },
        { key: "spectra", label: "有机光电材料表征图谱" },
        { key: "featureParams", label: "有机光电材料特征参数" },
        { key: "dos", label: "态密度信息" },
        { key: "external", label: "外部数据关联" }
      ];

      const featureCategoryOptions = [
        { key: "physicochemical", label: "物理化学性质" },
        { key: "photoelectric", label: "分子光电特效" },
        { key: "electronic", label: "电子结构特效" }
      ];

      const featureFieldMap = {
        physicochemical: [
          { key: "molecularWeight", label: "分子量", unit: "g/mol" },
          { key: "meltingPoint", label: "熔点", unit: "°C" },
          { key: "glassTransitionTemp", label: "玻璃化转变温度", unit: "°C" },
          { key: "decompositionTemp", label: "热分解温度", unit: "°C" },
          { key: "density", label: "密度", unit: "g/cm³" }
        ],
        photoelectric: [
          { key: "lifetime", label: "寿命", unit: "ns" },
          { key: "peakAbsorption", label: "吸收峰位", unit: "nm" },
          { key: "peakEmission", label: "发射峰位", unit: "nm" },
          { key: "transitionDipole", label: "跃迁偶极矩", unit: "Debye" },
          { key: "stokesShift", label: "斯托克斯位移", unit: "nm" }
        ],
        electronic: [
          { key: "homo", label: "HOMO", unit: "eV" },
          { key: "lumo", label: "LUMO", unit: "eV" },
          { key: "bandGap", label: "带隙", unit: "eV" },
          { key: "electrochemicalPotential", label: "电化学势", unit: "eV" }
        ]
      };

      const getFeatureFields = (category) => featureFieldMap[category] || featureFieldMap.physicochemical;
      const getFeatureFieldMeta = (category, key) => getFeatureFields(category).find((item) => item.key === key) || getFeatureFields(category)[0];
      const parseNumber = (value) => {
        if (typeof parseNumberValue === "function") return parseNumberValue(value);
        const text = String(value ?? "").trim().replace(/,/g, "");
        if (!text) return null;
        const number = Number(text);
        return Number.isFinite(number) ? number : null;
      };

      function ensureOptoPropertyDataState() {
        if (!state.optoSearchDraft) {
          state.optoSearchDraft = typeof createOptoSearchDrafts === "function" ? createOptoSearchDrafts() : {};
        }
        const property = state.optoSearchDraft.property || {};
        property.propertyType = property.propertyType || "structure3d";
        property.selectedOptions = Array.isArray(property.selectedOptions) ? property.selectedOptions : [];
        property.featureCategory = property.featureCategory || "physicochemical";
        property.featureField = property.featureField || getFeatureFields(property.featureCategory)[0].key;
        property.featureMin = property.featureMin || "";
        property.featureMax = property.featureMax || "";
        state.optoSearchDraft.property = property;
        optoMaterials.forEach((item, index) => {
          if (!Array.isArray(item.optoSpectrumAvailability)) {
            item.optoSpectrumAvailability = index % 7 === 6 ? ["ftir", "nmr"] : ["ftir", "raman", "nmr"];
          }
        });
      }

      function hasOptoStructure(item) {
        return item?.hasOrganic3dStructure !== false && item?.has3dStructure !== false && Boolean(
          item?.structureType || item?.structureView || item?.structurePath || item?.structureFile || item?.structureData
        );
      }

      function hasOptoPropertyData(item, type) {
        if (type === "structure3d") return hasOptoStructure(item);
        if (type === "spectra") return (item?.optoSpectrumAvailability || spectrumOptions.map((option) => option.key)).length > 0;
        if (type === "featureParams") return true;
        if (type === "dos") return Boolean(item?.dos || item?.densityOfStates || item?.homo != null || item?.lumo != null || item?.bandGap != null);
        if (type === "external") return Array.isArray(item?.externalLinks) && item.externalLinks.length > 0;
        return false;
      }

      function getOptoFeatureValue(item, field) {
        const densityText = String(item?.density ?? "").replace(/[^0-9+\-.eE]/g, "");
        const lifetimeText = String(item?.lifetime ?? "").toLowerCase();
        if (field === "molecularWeight") return parseNumber(item?.molecularWeight);
        if (field === "density") return parseNumber(densityText);
        if (field === "lifetime") {
          const value = parseNumber(lifetimeText);
          return value == null ? null : (lifetimeText.includes("μs") || lifetimeText.includes("us") ? value * 1000 : value);
        }
        if (field === "meltingPoint") return 220 + Number(item?.bandGap || 0) * 15;
        if (field === "glassTransitionTemp") return 90 + Math.abs(Number(item?.homo || 0)) * 6;
        if (field === "decompositionTemp") return 360 + Number(item?.bandGap || 0) * 24;
        if (field === "transitionDipole") return 5.1 + Math.abs(Number(item?.lumo || 0)) * 0.8;
        if (field === "stokesShift") return Math.max(20, Number(item?.peakEmission || 0) - Number(item?.peakAbsorption || 0));
        if (field === "electrochemicalPotential") return (Number(item?.homo || 0) + Number(item?.lumo || 0)) / 2;
        return parseNumber(item?.[field]);
      }

      function getActiveFeatureFilter(filters) {
        const field = filters?.featureField || "molecularWeight";
        const min = parseNumber(filters?.featureMin);
        const max = parseNumber(filters?.featureMax);
        return { field, min, max, active: min != null || max != null };
      }

      function filterOptoPropertyData(filters) {
        const type = filters?.propertyType || "structure3d";
        const selected = Array.isArray(filters?.selectedOptions) ? filters.selectedOptions : [];

        if (type === "featureParams") {
          const feature = getActiveFeatureFilter(filters);
          if (!feature.active) return optoMaterials.slice();
          return optoMaterials.filter((item) => {
            const value = getOptoFeatureValue(item, feature.field);
            return Number.isFinite(Number(value))
              && (feature.min == null || Number(value) >= feature.min)
              && (feature.max == null || Number(value) <= feature.max);
          });
        }

        if (!selected.length) return optoMaterials.slice();
        if (type === "spectra") {
          return optoMaterials.filter((item) => {
            const available = item.optoSpectrumAvailability || spectrumOptions.map((option) => option.key);
            return selected.every((key) => available.includes(key));
          });
        }

        const include = selected.includes("with");
        const exclude = selected.includes("without");
        if (include && exclude) return optoMaterials.slice();
        return optoMaterials.filter((item) => include
          ? hasOptoPropertyData(item, type)
          : !hasOptoPropertyData(item, type));
      }

      const previousHasOptoActiveFilters = typeof hasOptoActiveFilters === "function" ? hasOptoActiveFilters : null;
      hasOptoActiveFilters = function hasOptoActiveFiltersWithPropertyData(mode, filters) {
        if (mode === "property") {
          const type = filters?.propertyType || "structure3d";
          if (type === "featureParams") return getActiveFeatureFilter(filters).active;
          return Array.isArray(filters?.selectedOptions) && filters.selectedOptions.length > 0;
        }
        return previousHasOptoActiveFilters ? previousHasOptoActiveFilters(mode, filters) : false;
      };

      const previousFilterOptoByMode = typeof filterOptoByMode === "function" ? filterOptoByMode : null;
      filterOptoByMode = function filterOptoByModeWithPropertyData(mode, filters) {
        if (mode === "property") return filterOptoPropertyData(filters);
        return previousFilterOptoByMode ? previousFilterOptoByMode(mode, filters) : optoMaterials.slice();
      };

      getOptoResultList = function getOptoResultListWithPropertyData() {
        const applied = state.optoAppliedSearch || {};
        if (!applied.mode || !hasOptoActiveFilters(applied.mode, applied.filters)) return optoMaterials.slice();
        return filterOptoByMode(applied.mode, applied.filters);
      };

      getOptoResultHint = function getOptoResultHintWithPropertyData(list) {
        const applied = state.optoAppliedSearch || {};
        if (!applied.mode || !hasOptoActiveFilters(applied.mode, applied.filters)) return `默认展示有机光电材料库的全部 ${list.length} 条数据。`;
        if (applied.mode === "property") {
          const type = propertyTypeOptions.find((item) => item.key === applied.filters?.propertyType);
          if (applied.filters?.propertyType === "featureParams") {
            const field = getFeatureFieldMeta(applied.filters.featureCategory, applied.filters.featureField);
            return `已按“${field.label}”${applied.filters.featureMin || applied.filters.featureMax ? "范围" : ""}筛选到 ${list.length} 条匹配数据。`;
          }
          const selectedLabels = (propertyOptions[applied.filters?.propertyType] || [])
            .filter((item) => applied.filters?.selectedOptions?.includes(item.key))
            .map((item) => item.label);
          return `已按“${type?.label || "性质数据"}”${selectedLabels.length ? `（${selectedLabels.join("、")}）` : ""}筛选到 ${list.length} 条匹配数据。`;
        }
        return `已按“${typeof getOptoModeLabel === "function" ? getOptoModeLabel(applied.mode) : "当前条件"}”筛选到 ${list.length} 条匹配数据。`;
      };

      function renderCheckboxPropertyControl(type, filters) {
        const options = propertyOptions[type] || propertyOptions.structure3d;
        const selected = Array.isArray(filters.selectedOptions) ? filters.selectedOptions : [];
        const summary = selected.length ? `已选择 ${selected.length} 项` : "请选择筛选条件";
        return `
          <div class="opto-structure-check-field">
            <span>条件勾选</span>
            <details class="opto-check-dropdown">
              <summary>${esc(summary)}</summary>
              <div class="opto-check-menu">
                ${options.map((item) => `
                  <label>
                    <input type="checkbox" value="${esc(item.key)}" data-opto-property-option ${selected.includes(item.key) ? "checked" : ""}>
                    ${esc(item.label)}
                  </label>
                `).join("")}
              </div>
            </details>
          </div>
        `;
      }

      function renderFeaturePropertyControl(filters) {
        const category = filters.featureCategory || "physicochemical";
        const field = getFeatureFieldMeta(category, filters.featureField);
        return `
          <div class="opto-feature-filter-row">
            <label class="opto-feature-filter-field">
              <span>特征类别</span>
              <select data-opto-feature-category>
                ${featureCategoryOptions.map((item) => `<option value="${esc(item.key)}" ${item.key === category ? "selected" : ""}>${esc(item.label)}</option>`).join("")}
              </select>
            </label>
            <label class="opto-feature-filter-field">
              <span>性质字段</span>
              <select data-opto-feature-field>
                ${getFeatureFields(category).map((item) => `<option value="${esc(item.key)}" ${item.key === field.key ? "selected" : ""}>${esc(item.label)}（${esc(item.unit)}）</option>`).join("")}
              </select>
            </label>
            <label class="opto-feature-filter-field">
              <span>最小值</span>
              <input type="text" data-opto-feature-min value="${esc(filters.featureMin || "")}" placeholder="请输入数值">
            </label>
            <span class="opto-feature-filter-separator">至</span>
            <label class="opto-feature-filter-field">
              <span>最大值</span>
              <input type="text" data-opto-feature-max value="${esc(filters.featureMax || "")}" placeholder="请输入数值">
            </label>
          </div>
          <div class="opto-property-selected-hint"><span>当前筛选单位：${esc(field.unit)}</span></div>
        `;
      }

      const previousRenderOptoModeWorkspace = typeof renderOptoModeWorkspace === "function" ? renderOptoModeWorkspace : null;
      renderOptoModeWorkspace = function renderOptoModeWorkspaceWithPropertyData() {
        const mode = state.optoSearchMode || "name";
        if (mode !== "property") return previousRenderOptoModeWorkspace ? previousRenderOptoModeWorkspace() : "";
        ensureOptoPropertyDataState();
        const filters = state.optoSearchDraft.property;
        const type = filters.propertyType || "structure3d";
        return `
          <div class="twod-mode-panel active">
            <div class="opto-property-filter-shell">
              <div class="opto-property-filter-row">
                <label class="opto-property-control">
                  <span>性质类型</span>
                  <select data-opto-property-type aria-label="性质类型">
                    ${propertyTypeOptions.map((item) => `<option value="${esc(item.key)}" ${item.key === type ? "selected" : ""}>${esc(item.label)}</option>`).join("")}
                  </select>
                </label>
                ${type === "featureParams"
                  ? renderFeaturePropertyControl(filters)
                  : renderCheckboxPropertyControl(type, filters)}
              </div>
              <div class="cross-db-search-row">
                <button class="btn-primary cross-db-search-btn" type="button" data-opto-apply>检索</button>
                <button class="btn cross-db-clear-btn" type="button" data-opto-reset>清空条件</button>
              </div>
            </div>
            <div class="twod-platform-actions"><div class="twod-status-text">先选择性质类型，再选择对应字段或输入数值进行检索。</div></div>
          </div>
        `;
      };

      function syncOptoPropertyDataDraft() {
        const page = document.getElementById("page-opto");
        if (!page) return;
        ensureOptoPropertyDataState();
        const propertyType = page.querySelector("[data-opto-property-type]")?.value || state.optoSearchDraft.property.propertyType || "structure3d";
        const next = {
          propertyType,
          selectedOptions: [...page.querySelectorAll("[data-opto-property-option]:checked")].map((item) => item.value),
          featureCategory: page.querySelector("[data-opto-feature-category]")?.value || state.optoSearchDraft.property.featureCategory || "physicochemical",
          featureField: page.querySelector("[data-opto-feature-field]")?.value || state.optoSearchDraft.property.featureField || "molecularWeight",
          featureMin: page.querySelector("[data-opto-feature-min]")?.value || "",
          featureMax: page.querySelector("[data-opto-feature-max]")?.value || ""
        };
        state.optoSearchDraft.property = next;
      }

      const previousApplyOptoSearch = typeof applyOptoSearch === "function" ? applyOptoSearch : null;
      applyOptoSearch = function applyOptoSearchWithPropertyData() {
        if (state.optoSearchMode === "property") {
          syncOptoPropertyDataDraft();
          state.optoAppliedSearch = {
            mode: "property",
            filters: JSON.parse(JSON.stringify(state.optoSearchDraft.property))
          };
          state.optoCurrentPage = 1;
          return;
        }
        if (previousApplyOptoSearch) previousApplyOptoSearch();
      };

      const previousClearOptoModeDraft = typeof clearCurrentOptoModeDraft === "function" ? clearCurrentOptoModeDraft : null;
      clearCurrentOptoModeDraft = function clearCurrentOptoModeDraftWithPropertyData() {
        if (state.optoSearchMode !== "property") {
          if (previousClearOptoModeDraft) previousClearOptoModeDraft();
          return;
        }
        state.optoSearchDraft.property = {
          propertyType: "structure3d",
          selectedOptions: [],
          featureCategory: "physicochemical",
          featureField: "molecularWeight",
          featureMin: "",
          featureMax: ""
        };
        state.optoAppliedSearch = { mode: "", filters: null };
        state.optoCurrentPage = 1;
      };

      function rerenderOptoPropertyPage() {
        if (state.page === "opto" && typeof renderOptoModule === "function") renderOptoModule();
      }

      document.body.addEventListener("change", (event) => {
        const target = event.target;
        if (!target.closest?.("#page-opto")) return;
        if (target.matches("[data-opto-property-type]")) {
          ensureOptoPropertyDataState();
          state.optoSearchDraft.property = {
            propertyType: target.value || "structure3d",
            selectedOptions: [],
            featureCategory: state.optoSearchDraft.property.featureCategory || "physicochemical",
            featureField: state.optoSearchDraft.property.featureField || "molecularWeight",
            featureMin: "",
            featureMax: ""
          };
          rerenderOptoPropertyPage();
          return;
        }
        if (target.matches("[data-opto-feature-category]")) {
          ensureOptoPropertyDataState();
          const category = target.value || "physicochemical";
          state.optoSearchDraft.property.featureCategory = category;
          state.optoSearchDraft.property.featureField = getFeatureFields(category)[0].key;
          rerenderOptoPropertyPage();
          return;
        }
        if (target.matches("[data-opto-feature-field]")) {
          ensureOptoPropertyDataState();
          state.optoSearchDraft.property.featureField = target.value;
          return;
        }
        if (target.matches("[data-opto-property-option]")) {
          ensureOptoPropertyDataState();
          state.optoSearchDraft.property.selectedOptions = [...document.querySelectorAll("#page-opto [data-opto-property-option]:checked")].map((item) => item.value);
        }
      }, true);

      function getOptoTargetViewFromAppliedSearch() {
        const applied = state.optoAppliedSearch || {};
        if (applied.mode !== "property") return "";
        const type = applied.filters?.propertyType;
        if (type === "spectra") return "spectra";
        if (type === "dos") return "dos";
        if (type === "featureParams") return "params";
        if (type === "external") return "external";
        return "detail";
      }

      function getOptoExternalUrl(label, value) {
        const query = encodeURIComponent(String(value || label || "").trim());
        if (/crossref|论文|文献/i.test(`${label} ${value}`)) return `https://search.crossref.org/?q=${query}`;
        if (/chembl/i.test(`${label} ${value}`)) return `https://www.ebi.ac.uk/chembl/explore/compound/${query}`;
        return `https://pubchem.ncbi.nlm.nih.gov/#query=${query}`;
      }

      function renderOptoExternalMetrics(material) {
        if (state.selectedMaterialSource !== "opto" || state.selectedMaterialTab !== "external") return;
        const wrap = document.getElementById("materialMetricGrid");
        if (!wrap) return;
        const profile = typeof getCanonicalMaterialProfile === "function" ? getCanonicalMaterialProfile("opto", material) : null;
        const rows = profile?.detailTabs?.external || (material.externalLinks || []).map(([label, value]) => ({ label, value }));
        wrap.innerHTML = `
          <div class="opto-external-link-list">
            ${rows.length ? rows.map((item) => `
              <article class="opto-external-link-card">
                <span>${esc(item.label)}</span>
                <strong title="${esc(item.value)}">${esc(item.value)}</strong>
                <a href="${esc(getOptoExternalUrl(item.label, item.value))}" target="_blank" rel="noopener noreferrer">进入外部数据库查询</a>
              </article>
            `).join("") : `<div class="sys-empty">暂无外部数据关联。</div>`}
          </div>
        `;
      }

      const previousCanonicalRenderMaterialMetrics = typeof canonicalRenderMaterialMetrics === "function" ? canonicalRenderMaterialMetrics : null;
      canonicalRenderMaterialMetrics = function canonicalRenderMaterialMetricsWithExternalLinks(material) {
        if (previousCanonicalRenderMaterialMetrics) previousCanonicalRenderMaterialMetrics(material);
        renderOptoExternalMetrics(material);
      };

      const previousBuildOptoSpectraConfigs = typeof buildOptoSpectraConfigs === "function" ? buildOptoSpectraConfigs : null;
      if (previousBuildOptoSpectraConfigs) {
        buildOptoSpectraConfigs = function buildOptoSpectraConfigsWithRaman(material) {
          const configs = previousBuildOptoSpectraConfigs(material);
          if (!configs.raman && typeof buildOptoRamanConfig === "function") configs.raman = buildOptoRamanConfig(material);
          return configs;
        };
      }

      const previousBuildOptoVisualProfile = typeof buildOptoVisualProfile === "function" ? buildOptoVisualProfile : null;
      if (previousBuildOptoVisualProfile) {
        buildOptoVisualProfile = function buildOptoVisualProfileWithRaman(material) {
          const profile = previousBuildOptoVisualProfile(material);
          const raman = typeof buildOptoRamanConfig === "function" ? buildOptoRamanConfig(material) : null;
          if (!raman) return profile;
          const visuals = { ...(profile.visuals || {}), raman: { ...raman, label: "拉曼光谱" } };
          const visualTabs = [...(profile.visualTabs || [])];
          if (!visualTabs.some((item) => item.key === "raman")) {
            const insertAt = visualTabs.findIndex((item) => item.key === "nmr");
            visualTabs.splice(insertAt >= 0 ? insertAt : visualTabs.length, 0, { key: "raman", label: "拉曼光谱" });
          }
          return { ...profile, visualTabs, visuals };
        };
      }

      const previousGetCanonicalMaterialProfile = typeof getCanonicalMaterialProfile === "function" ? getCanonicalMaterialProfile : null;
      if (previousGetCanonicalMaterialProfile) {
        getCanonicalMaterialProfile = function getCanonicalMaterialProfileWithRaman(source, material) {
          const profile = previousGetCanonicalMaterialProfile(source, material);
          if (source !== "opto" || !profile) return profile;
          const raman = typeof buildOptoRamanConfig === "function" ? buildOptoRamanConfig(material) : null;
          if (!raman) return profile;
          const visuals = { ...(profile.visuals || {}), raman: { ...raman, label: "拉曼光谱" } };
          const visualTabs = [...(profile.visualTabs || [])];
          if (!visualTabs.some((item) => item.key === "raman")) {
            const insertAt = visualTabs.findIndex((item) => item.key === "nmr");
            visualTabs.splice(insertAt >= 0 ? insertAt : visualTabs.length, 0, { key: "raman", label: "拉曼光谱" });
          }
          return { ...profile, visualTabs, visuals };
        };
      }

      function renderSelectedOptoVisuals(material) {
        const applied = state.optoAppliedSearch || {};
        const filters = applied.filters || {};
        const selected = applied.mode === "property" && filters.propertyType === "spectra"
          ? (filters.selectedOptions || [])
          : [];
        if (state.selectedMaterialSource !== "opto" || !selected.length) return false;
        const profile = getCanonicalMaterialProfile("opto", material);
        const selectedTabs = (profile.visualTabs || []).filter((item) => selected.includes(item.key));
        if (!selectedTabs.length) return false;
        const activeVisual = selectedTabs.some((item) => item.key === state.selectedMaterialVisual)
          ? state.selectedMaterialVisual
          : selectedTabs[0].key;
        state.selectedMaterialVisual = activeVisual;
        const currentVisual = profile.visuals[activeVisual];
        const chips = document.getElementById("materialVisualChips");
        const chart = document.getElementById("materialLineChart");
        const caption = document.getElementById("materialChartCaption");
        if (!chips || !chart || !caption) return false;
        chips.innerHTML = selectedTabs.map((item) => `<button class="material-visual-chip${item.key === activeVisual ? " active" : ""}" type="button" data-material-visual="${esc(item.key)}">${esc(item.label)}</button>`).join("");
        chart.innerHTML = buildChartSvg(currentVisual);
        caption.textContent = currentVisual.caption;
        return true;
      }

      const previousCanonicalRenderMaterialVisuals = typeof canonicalRenderMaterialVisuals === "function" ? canonicalRenderMaterialVisuals : null;
      canonicalRenderMaterialVisuals = function canonicalRenderMaterialVisualsWithSelectedSpectra(material) {
        if (renderSelectedOptoVisuals(material)) return;
        if (previousCanonicalRenderMaterialVisuals) previousCanonicalRenderMaterialVisuals(material);
      };

      function enhanceOptoPropertyDownloadActions(material) {
        const modal = document.getElementById("materialModal");
        if (!modal || state.selectedMaterialSource !== "opto") return;
        const actionWrap = modal.querySelector('[data-material-page="visualization"] .twod-detail-actions');
        if (!actionWrap) return;
        actionWrap.querySelectorAll(".opto-data-download-btn").forEach((node) => node.remove());
        const currentVisual = state.selectedMaterialVisual || "";
        const applied = state.optoAppliedSearch || {};
        const isSpectrum = ["ftir", "raman", "nmr"].includes(currentVisual)
          || (applied.mode === "property" && applied.filters?.propertyType === "spectra");
        const isDos = currentVisual === "dos" || (applied.mode === "property" && applied.filters?.propertyType === "dos");
        if (isSpectrum) {
          const button = document.createElement("button");
          button.className = "btn opto-data-download-btn";
          button.type = "button";
          button.textContent = "ZIP下载";
          button.setAttribute("data-opto-spectra-zip", "true");
          actionWrap.appendChild(button);
        }
        if (isDos) {
          const button = document.createElement("button");
          button.className = "btn opto-data-download-btn";
          button.type = "button";
          button.textContent = "DOS数据下载";
          button.setAttribute("data-opto-dos-download", "true");
          actionWrap.appendChild(button);
        }
      }

      const previousOpenRichMaterialModal = typeof openRichMaterialModal === "function" ? openRichMaterialModal : null;
      if (previousOpenRichMaterialModal) {
        openRichMaterialModal = function openRichMaterialModalWithPropertyData(materialToken, targetView) {
          const mappedTarget = getOptoTargetViewFromAppliedSearch() || targetView;
          const result = previousOpenRichMaterialModal.apply(this, [materialToken, mappedTarget]);
          const token = String(materialToken || "");
          const source = token.includes(":") ? token.split(":")[0] : "twod";
          const id = token.includes(":") ? token.split(":").slice(1).join(":") : token;
          if (source === "opto") {
            const material = typeof findOptoMaterial === "function" ? (findOptoMaterial(id) || optoMaterials[0]) : optoMaterials[0];
            window.setTimeout(() => {
              const applied = state.optoAppliedSearch || {};
              if (applied.mode === "property") {
                const type = applied.filters?.propertyType;
                if (type === "spectra") {
                  state.selectedMaterialSection = "visualization";
                  state.selectedMaterialVisual = applied.filters.selectedOptions?.[0] || "ftir";
                } else if (type === "dos") {
                  state.selectedMaterialSection = "visualization";
                  state.selectedMaterialVisual = "dos";
                } else if (type === "external") {
                  state.selectedMaterialSection = "properties";
                  state.selectedMaterialTab = "external";
                } else if (type === "featureParams") {
                  state.selectedMaterialSection = "properties";
                  const category = applied.filters?.featureCategory || "physicochemical";
                  state.selectedMaterialTab = category === "electronic" ? "electronic" : category === "photoelectric" ? "photoelectric" : "physicochemical";
                }
                if (typeof renderMaterialDetailSection === "function") renderMaterialDetailSection(material);
                if (typeof canonicalSyncMaterialModalChrome === "function") canonicalSyncMaterialModalChrome(material);
                renderOptoExternalMetrics(material);
              }
              enhanceOptoPropertyDownloadActions(material);
            }, 0);
          }
          return result;
        };
        if (typeof window !== "undefined") window.openRichMaterialModal = openRichMaterialModal;
      }

      document.body.addEventListener("click", (event) => {
        const zipButton = event.target.closest?.("[data-opto-spectra-zip]");
        const dosButton = event.target.closest?.("[data-opto-dos-download]");
        if (zipButton) {
          event.preventDefault();
          if (typeof triggerOptoDetailDownload === "function") triggerOptoDetailDownload("spectraZip");
          return;
        }
        if (dosButton) {
          event.preventDefault();
          if (typeof triggerOptoDetailDownload === "function") triggerOptoDetailDownload("dosData");
        }
      }, true);

      ensureOptoPropertyDataState();
      if (state.page === "opto" && typeof renderOptoModule === "function") renderOptoModule();
    })();

  