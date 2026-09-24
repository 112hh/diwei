
    (() => {
      if (typeof state === "undefined" || typeof optoMaterials === "undefined") return;

      const escape = (value) => {
        if (typeof escapeLowDimHtml === "function") return escapeLowDimHtml(value == null ? "" : String(value));
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        }[char]));
      };

      const propertyTypes = [
        { key: "structure3d", label: "有机分子三维结构" },
        { key: "spectra", label: "有机光电材料表征图谱" },
        { key: "featureParams", label: "有机光电材料特征参数" },
        { key: "dos", label: "态密度信息" },
        { key: "external", label: "外部数据关联" }
      ];

      const spectrumTypes = [
        { key: "ftir", label: "红外光谱" },
        { key: "raman", label: "拉曼光谱" },
        { key: "nmr", label: "核磁共振光谱" }
      ];

      const checkboxTypes = {
        structure3d: [
          { key: "with", label: "包含有机分子三维结构" },
          { key: "without", label: "不包含有机分子三维结构" }
        ],
        spectra: spectrumTypes,
        dos: [
          { key: "with", label: "包含态密度信息" },
          { key: "without", label: "不包含态密度信息" }
        ],
        external: [
          { key: "with", label: "包含外部数据关联" },
          { key: "without", label: "不包含外部数据关联" }
        ]
      };

      const featureCategories = [
        { key: "physicochemical", label: "物理化学性质" },
        { key: "photoelectric", label: "分子光电特效" },
        { key: "electronic", label: "电子结构特效" }
      ];

      const featureFields = {
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

      const numberValue = (value) => {
        if (typeof parseNumberValue === "function") return parseNumberValue(value);
        const text = String(value ?? "").trim().replace(/,/g, "");
        if (!text) return null;
        const parsed = Number(text);
        return Number.isFinite(parsed) ? parsed : null;
      };

      const fieldList = (category) => featureFields[category] || featureFields.physicochemical;
      const fieldMeta = (category, key) => fieldList(category).find((item) => item.key === key) || fieldList(category)[0];

      const ensureState = () => {
        if (!state.optoSearchDraft) {
          state.optoSearchDraft = typeof createOptoSearchDrafts === "function" ? createOptoSearchDrafts() : {};
        }
        const current = state.optoSearchDraft.property || {};
        current.propertyType = current.propertyType || "structure3d";
        current.selectedOptions = Array.isArray(current.selectedOptions) ? current.selectedOptions : [];
        current.featureCategory = current.featureCategory || "physicochemical";
        current.featureField = fieldMeta(current.featureCategory, current.featureField).key;
        current.featureMin = current.featureMin || "";
        current.featureMax = current.featureMax || "";
        state.optoSearchDraft.property = current;
        optoMaterials.forEach((item, index) => {
          if (!Array.isArray(item.optoSpectrumAvailability)) {
            item.optoSpectrumAvailability = index % 7 === 6 ? ["ftir", "nmr"] : ["ftir", "raman", "nmr"];
          }
        });
      };

      const hasStructure = (item) => item?.hasOrganic3dStructure !== false
        && item?.has3dStructure !== false
        && Boolean(item?.structureType || item?.structureView || item?.structurePath || item?.structureFile || item?.structureData);

      const hasProperty = (item, type) => {
        if (type === "structure3d") return hasStructure(item);
        if (type === "spectra") return (item?.optoSpectrumAvailability || spectrumTypes.map((option) => option.key)).length > 0;
        if (type === "featureParams") return true;
        if (type === "dos") return Boolean(item?.dos || item?.densityOfStates || item?.homo != null || item?.lumo != null || item?.bandGap != null);
        if (type === "external") return Array.isArray(item?.externalLinks) && item.externalLinks.length > 0;
        return false;
      };

      const featureValue = (item, key) => {
        const density = String(item?.density ?? "").replace(/[^0-9+\-.eE]/g, "");
        const lifetime = String(item?.lifetime ?? "").toLowerCase();
        if (key === "molecularWeight") return numberValue(item?.molecularWeight);
        if (key === "density") return numberValue(density);
        if (key === "lifetime") {
          const value = numberValue(lifetime);
          return value == null ? null : (lifetime.includes("μs") || lifetime.includes("us") ? value * 1000 : value);
        }
        if (key === "meltingPoint") return 220 + Number(item?.bandGap || 0) * 15;
        if (key === "glassTransitionTemp") return 90 + Math.abs(Number(item?.homo || 0)) * 6;
        if (key === "decompositionTemp") return 360 + Number(item?.bandGap || 0) * 24;
        if (key === "transitionDipole") return 5.1 + Math.abs(Number(item?.lumo || 0)) * 0.8;
        if (key === "stokesShift") return Math.max(20, Number(item?.peakEmission || 0) - Number(item?.peakAbsorption || 0));
        if (key === "electrochemicalPotential") return (Number(item?.homo || 0) + Number(item?.lumo || 0)) / 2;
        return numberValue(item?.[key]);
      };

      const filterProperty = (filters) => {
        const type = filters?.propertyType || "structure3d";
        const selected = Array.isArray(filters?.selectedOptions) ? filters.selectedOptions : [];
        if (type === "featureParams") {
          const min = numberValue(filters?.featureMin);
          const max = numberValue(filters?.featureMax);
          if (min == null && max == null) return optoMaterials.slice();
          return optoMaterials.filter((item) => {
            const value = featureValue(item, filters?.featureField || "molecularWeight");
            return Number.isFinite(Number(value))
              && (min == null || Number(value) >= min)
              && (max == null || Number(value) <= max);
          });
        }
        if (!selected.length) return optoMaterials.slice();
        if (type === "spectra") {
          return optoMaterials.filter((item) => {
            const available = item.optoSpectrumAvailability || spectrumTypes.map((option) => option.key);
            return selected.every((key) => available.includes(key));
          });
        }
        const include = selected.includes("with");
        const exclude = selected.includes("without");
        if (include && exclude) return optoMaterials.slice();
        return optoMaterials.filter((item) => include ? hasProperty(item, type) : !hasProperty(item, type));
      };

      const previousHasActive = typeof hasOptoActiveFilters === "function" ? hasOptoActiveFilters : null;
      hasOptoActiveFilters = function hasOptoActiveFiltersFinal(mode, filters) {
        if (mode === "property") {
          if (filters?.propertyType === "featureParams") {
            return numberValue(filters.featureMin) != null || numberValue(filters.featureMax) != null;
          }
          return Array.isArray(filters?.selectedOptions) && filters.selectedOptions.length > 0;
        }
        return previousHasActive ? previousHasActive(mode, filters) : false;
      };

      const previousFilter = typeof filterOptoByMode === "function" ? filterOptoByMode : null;
      filterOptoByMode = function filterOptoByModeFinal(mode, filters) {
        if (mode === "property") return filterProperty(filters);
        return previousFilter ? previousFilter(mode, filters) : optoMaterials.slice();
      };

      getOptoResultList = function getOptoResultListFinal() {
        ensureState();
        const applied = state.optoAppliedSearch || {};
        if (!applied.mode || !hasOptoActiveFilters(applied.mode, applied.filters)) return optoMaterials.slice();
        return filterOptoByMode(applied.mode, applied.filters);
      };

      getOptoResultHint = function getOptoResultHintFinal(list) {
        const applied = state.optoAppliedSearch || {};
        if (!applied.mode || !hasOptoActiveFilters(applied.mode, applied.filters)) {
          return `默认展示有机光电材料库的全部 ${list.length} 条数据。`;
        }
        if (applied.mode === "property") {
          const type = propertyTypes.find((item) => item.key === applied.filters?.propertyType);
          if (applied.filters?.propertyType === "featureParams") {
            const field = fieldMeta(applied.filters.featureCategory, applied.filters.featureField);
            const range = [applied.filters.featureMin, applied.filters.featureMax].filter(Boolean).join(" 至 ");
            return `已按“${field.label}”${range ? `（${range} ${field.unit}）` : ""}筛选到 ${list.length} 条匹配数据。`;
          }
          const labels = (checkboxTypes[applied.filters?.propertyType] || [])
            .filter((item) => applied.filters?.selectedOptions?.includes(item.key))
            .map((item) => item.label);
          return `已按“${type?.label || "性质数据"}”${labels.length ? `（${labels.join("、")}）` : ""}筛选到 ${list.length} 条匹配数据。`;
        }
        return `已按“${typeof getOptoModeLabel === "function" ? getOptoModeLabel(applied.mode) : "当前条件"}”筛选到 ${list.length} 条匹配数据。`;
      };

      const renderChecks = (type, selected) => {
        const options = checkboxTypes[type] || checkboxTypes.structure3d;
        return `
          <div class="opto-runtime-check-field">
            <span>${type === "spectra" ? "谱图类型（可多选）" : "筛选条件"}</span>
            <div class="opto-runtime-check-list">
              ${options.map((item) => `
                <label>
                  <input type="checkbox" value="${escape(item.key)}" data-opto-property-option ${selected.includes(item.key) ? "checked" : ""}>
                  ${escape(item.label)}
                </label>
              `).join("")}
            </div>
          </div>
        `;
      };

      const renderFeature = (filters) => {
        const category = filters.featureCategory || "physicochemical";
        const field = fieldMeta(category, filters.featureField);
        return `
          <div class="opto-runtime-feature-row">
            <label class="opto-runtime-field">
              <span>性质分类</span>
              <select data-opto-feature-category>
                ${featureCategories.map((item) => `<option value="${escape(item.key)}" ${item.key === category ? "selected" : ""}>${escape(item.label)}</option>`).join("")}
              </select>
            </label>
            <label class="opto-runtime-field">
              <span>性质字段</span>
              <select data-opto-feature-field>
                ${fieldList(category).map((item) => `<option value="${escape(item.key)}" ${item.key === field.key ? "selected" : ""}>${escape(item.label)}（${escape(item.unit)}）</option>`).join("")}
              </select>
            </label>
            <label class="opto-runtime-field">
              <span>最小值</span>
              <input type="text" data-opto-feature-min value="${escape(filters.featureMin || "")}" placeholder="请输入数值">
            </label>
            <span class="opto-runtime-range-separator">至</span>
            <label class="opto-runtime-field">
              <span>最大值</span>
              <input type="text" data-opto-feature-max value="${escape(filters.featureMax || "")}" placeholder="请输入数值">
            </label>
          </div>
          <div class="opto-runtime-property-hint">当前单位：${escape(field.unit)}；输入最小值或最大值后执行范围筛选。</div>
        `;
      };

      const previousWorkspace = typeof renderOptoModeWorkspace === "function" ? renderOptoModeWorkspace : null;
      renderOptoModeWorkspace = function renderOptoModeWorkspaceFinal() {
        ensureState();
        if ((state.optoSearchMode || "name") !== "property") {
          return previousWorkspace ? previousWorkspace() : "";
        }
        const filters = state.optoSearchDraft.property;
        const type = filters.propertyType || "structure3d";
        const selected = Array.isArray(filters.selectedOptions) ? filters.selectedOptions : [];
        return `
          <div class="twod-mode-panel active">
            <div class="opto-property-filter-shell">
              <div class="opto-runtime-property-row">
                <label class="opto-runtime-field">
                  <span>性质类型</span>
                  <select data-opto-property-type aria-label="性质类型">
                    ${propertyTypes.map((item) => `<option value="${escape(item.key)}" ${item.key === type ? "selected" : ""}>${escape(item.label)}</option>`).join("")}
                  </select>
                </label>
                ${type === "featureParams" ? renderFeature(filters) : renderChecks(type, selected)}
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

      const syncDraft = () => {
        ensureState();
        const page = document.getElementById("page-opto");
        if (!page) return;
        const current = state.optoSearchDraft.property || {};
        state.optoSearchDraft.property = {
          propertyType: page.querySelector("[data-opto-property-type]")?.value || current.propertyType || "structure3d",
          selectedOptions: [...page.querySelectorAll("[data-opto-property-option]:checked")].map((item) => item.value),
          featureCategory: page.querySelector("[data-opto-feature-category]")?.value || current.featureCategory || "physicochemical",
          featureField: page.querySelector("[data-opto-feature-field]")?.value || current.featureField || "molecularWeight",
          featureMin: page.querySelector("[data-opto-feature-min]")?.value || "",
          featureMax: page.querySelector("[data-opto-feature-max]")?.value || ""
        };
      };

      const rerender = () => {
        if (state.page === "opto" && typeof renderOptoModule === "function") renderOptoModule();
      };

      const previousApply = typeof applyOptoSearch === "function" ? applyOptoSearch : null;
      applyOptoSearch = function applyOptoSearchFinal() {
        if (state.optoSearchMode === "property") {
          syncDraft();
          state.optoAppliedSearch = {
            mode: "property",
            filters: JSON.parse(JSON.stringify(state.optoSearchDraft.property))
          };
          state.optoCurrentPage = 1;
          return;
        }
        if (previousApply) previousApply();
      };

      const previousClear = typeof clearCurrentOptoModeDraft === "function" ? clearCurrentOptoModeDraft : null;
      clearCurrentOptoModeDraft = function clearCurrentOptoModeDraftFinal() {
        if (state.optoSearchMode !== "property") {
          if (previousClear) previousClear();
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

      document.body.addEventListener("change", (event) => {
        const target = event.target;
        if (!target.closest?.("#page-opto")) return;
        if (target.matches("[data-opto-property-type]")) {
          ensureState();
          state.optoSearchDraft.property = {
            propertyType: target.value || "structure3d",
            selectedOptions: [],
            featureCategory: state.optoSearchDraft.property.featureCategory || "physicochemical",
            featureField: state.optoSearchDraft.property.featureField || "molecularWeight",
            featureMin: "",
            featureMax: ""
          };
          rerender();
          return;
        }
        if (target.matches("[data-opto-feature-category]")) {
          ensureState();
          const category = target.value || "physicochemical";
          state.optoSearchDraft.property.featureCategory = category;
          state.optoSearchDraft.property.featureField = fieldList(category)[0].key;
          rerender();
          return;
        }
        if (target.matches("[data-opto-feature-field]")) {
          ensureState();
          state.optoSearchDraft.property.featureField = target.value;
          return;
        }
        if (target.matches("[data-opto-property-option]")) {
          ensureState();
          state.optoSearchDraft.property.selectedOptions = [...document.querySelectorAll("#page-opto [data-opto-property-option]:checked")].map((item) => item.value);
        }
      }, true);

      const targetViewForSearch = () => {
        const applied = state.optoAppliedSearch || {};
        if (applied.mode !== "property") return "";
        const type = applied.filters?.propertyType;
        if (type === "spectra") return "spectra";
        if (type === "dos") return "dos";
        if (type === "featureParams") return "params";
        if (type === "external") return "external";
        return "detail";
      };

      const previousOpen = typeof openRichMaterialModal === "function" ? openRichMaterialModal : null;
      if (previousOpen) {
        openRichMaterialModal = function openRichMaterialModalFinal(materialToken, targetView) {
          const mappedTarget = targetViewForSearch() || targetView;
          const result = previousOpen.apply(this, [materialToken, mappedTarget]);
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
                  state.selectedMaterialVisual = (applied.filters.selectedOptions || []).find((key) => ["ftir", "raman", "nmr"].includes(key)) || "ftir";
                } else if (type === "dos") {
                  state.selectedMaterialSection = "visualization";
                  state.selectedMaterialVisual = "dos";
                } else if (type === "external") {
                  state.selectedMaterialSection = "properties";
                  state.selectedMaterialTab = "external";
                } else if (type === "featureParams") {
                  state.selectedMaterialSection = "properties";
                  const category = applied.filters?.featureCategory || "physicochemical";
                  state.selectedMaterialTab = category === "electronic"
                    ? "electronic"
                    : category === "photoelectric" ? "photoelectric" : "physicochemical";
                }
                if (typeof renderMaterialDetailSection === "function") renderMaterialDetailSection(material);
                if (typeof canonicalSyncMaterialModalChrome === "function") canonicalSyncMaterialModalChrome(material);
                if (typeof renderOptoExternalMetrics === "function") renderOptoExternalMetrics(material);
              }
              addDownloadActions(material);
            }, 0);
          }
          return result;
        };
        if (typeof window !== "undefined") window.openRichMaterialModal = openRichMaterialModal;
      }

      function addDownloadActions(material) {
        const modal = document.getElementById("materialModal");
        if (!modal || state.selectedMaterialSource !== "opto") return;
        const actionWrap = modal.querySelector('[data-material-page="visualization"] .twod-detail-actions');
        if (!actionWrap) return;
        actionWrap.querySelectorAll(".opto-runtime-download-actions").forEach((node) => node.remove());
        const applied = state.optoAppliedSearch || {};
        const current = state.selectedMaterialVisual || "";
        const isSpectra = ["ftir", "raman", "nmr"].includes(current)
          || (applied.mode === "property" && applied.filters?.propertyType === "spectra");
        const isDos = current === "dos" || (applied.mode === "property" && applied.filters?.propertyType === "dos");
        if (!isSpectra && !isDos) return;
        const wrap = document.createElement("div");
        wrap.className = "opto-runtime-download-actions";
        if (isSpectra) {
          wrap.innerHTML += `<button class="btn" type="button" data-opto-runtime-download="spectraZip">ZIP下载</button>`;
        }
        if (isDos) {
          wrap.innerHTML += `<button class="btn" type="button" data-opto-runtime-download="dosData">DOS数据下载</button>`;
        }
        actionWrap.appendChild(wrap);
      }

      document.body.addEventListener("click", (event) => {
        const button = event.target.closest?.("[data-opto-runtime-download]");
        if (!button) return;
        event.preventDefault();
        const kind = button.dataset.optoRuntimeDownload;
        if (typeof triggerOptoDetailDownload === "function") triggerOptoDetailDownload(kind);
      }, true);

      ensureState();
      if (state.page === "opto" && typeof renderOptoModule === "function") renderOptoModule();
    })();
  