
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

      const propertyTypes = [
        { key: "structure3d", label: "有机分子三维结构" },
        { key: "spectra", label: "有机光电材料表征图谱" },
        { key: "featureParams", label: "有机光电材料特征参数" },
        { key: "dos", label: "态密度信息" },
        { key: "external", label: "外部数据关联" }
      ];

      const propertyOptionMap = {
        structure3d: [
          { key: "with", label: "包含有机分子三维结构" },
          { key: "without", label: "不包含有机分子三维结构" }
        ],
        spectra: [
          { key: "with", label: "包含有机光电材料表征图谱" },
          { key: "without", label: "不包含有机光电材料表征图谱" }
        ],
        featureParams: [
          { key: "with", label: "包含有机光电材料特征参数" },
          { key: "without", label: "不包含有机光电材料特征参数" }
        ],
        dos: [
          { key: "with", label: "包含态密度信息" },
          { key: "without", label: "不包含态密度信息" }
        ],
        external: [
          { key: "with", label: "包含外部数据关联" },
          { key: "without", label: "不包含外部数据关联" }
        ]
      };

      const getPropertyTypeLabel = (key) => propertyTypes.find((item) => item.key === key)?.label || propertyTypes[0].label;
      const getPropertyOptions = (key) => propertyOptionMap[key] || propertyOptionMap.structure3d;

      function parseLocalNumber(value) {
        if (typeof parseNumberValue === "function") return parseNumberValue(value);
        const text = String(value ?? "").trim();
        if (!text) return null;
        const parsed = Number(text);
        return Number.isFinite(parsed) ? parsed : null;
      }

      function ensureOptoOrganicSearchState() {
        if (typeof ensureOptoRuntimeState === "function") ensureOptoRuntimeState();
        if (typeof OPTO_MODE_CONFIG !== "undefined") {
          OPTO_MODE_CONFIG.code.placeholder = "请输入材料编号进行检索，如OP-001";
          OPTO_MODE_CONFIG.code.helper = "支持按材料编号进行准确或模糊检索。";
          OPTO_MODE_CONFIG.combo.label = "条件组合筛选";
          OPTO_MODE_CONFIG.combo.helper = "";
          OPTO_MODE_CONFIG.property.helper = "先选择性质类型，再勾选对应条件，系统按所选性质数据筛选列表。";
        }

        state.optoSearchDraft = state.optoSearchDraft || (typeof createOptoSearchDrafts === "function" ? createOptoSearchDrafts() : {});
        const combo = state.optoSearchDraft.combo || {};
        if (!Array.isArray(combo.conditions)) {
          state.optoSearchDraft.combo = {
            conditions: [{
              propertyKey: combo.propertyKey || OPTO_COMBO_FIELDS?.[0]?.key || "molecularWeight",
              operator: combo.operator || "range",
              min: combo.min || "",
              max: combo.max || ""
            }]
          };
        }
        if (!state.optoSearchDraft.combo.conditions.length) {
          state.optoSearchDraft.combo.conditions.push({
            propertyKey: OPTO_COMBO_FIELDS?.[0]?.key || "molecularWeight",
            operator: "range",
            min: "",
            max: ""
          });
        }
        const property = state.optoSearchDraft.property || {};
        if (!property.propertyType) property.propertyType = "structure3d";
        if (!Array.isArray(property.selectedOptions)) property.selectedOptions = [];
        state.optoSearchDraft.property = property;

        ensureOptoStructureFileMetadata();
      }

      function getComboConditions(filters = state.optoSearchDraft.combo) {
        if (Array.isArray(filters?.conditions)) return filters.conditions;
        return [{
          propertyKey: filters?.propertyKey || OPTO_COMBO_FIELDS?.[0]?.key || "molecularWeight",
          operator: filters?.operator || "range",
          min: filters?.min || "",
          max: filters?.max || ""
        }];
      }

      function hasComboConditionValue(condition) {
        return String(condition?.min || "").trim() || String(condition?.max || "").trim();
      }

      function getOptoNumericValue(item, key) {
        if (typeof getOptoValueByKey === "function") return getOptoValueByKey(item, key);
        return parseLocalNumber(item?.[key]);
      }

      function matchComboCondition(item, condition) {
        const current = getOptoNumericValue(item, condition.propertyKey || "molecularWeight");
        if (!Number.isFinite(Number(current))) return false;
        const value = Number(current);
        const min = parseLocalNumber(condition.min);
        const max = parseLocalNumber(condition.max);
        const operator = condition.operator || "range";
        if (operator === "gte") return min == null ? true : value >= min;
        if (operator === "lte") return min == null ? true : value <= min;
        if (operator === "eq") return min == null ? true : Math.abs(value - min) < 0.000001;
        if (min != null && value < min) return false;
        if (max != null && value > max) return false;
        return true;
      }

      function hasOpto3DStructure(item) {
        return item?.hasOrganic3dStructure !== false && item?.has3dStructure !== false && Boolean(
          item?.structureType ||
          item?.structureView ||
          item?.structurePath ||
          item?.structureFile ||
          item?.structureData
        );
      }

      function hasPropertyDataByType(item, type) {
        if (type === "structure3d") return hasOpto3DStructure(item);
        if (type === "spectra") return Boolean(item?.peakAbsorption || item?.peakEmission || item?.lifetime || item?.visuals);
        if (type === "featureParams") return Boolean(item?.molecularWeight || item?.homo || item?.lumo || item?.bandGap || item?.density);
        if (type === "dos") return Boolean(item?.dos || item?.densityOfStates || item?.bandGap);
        if (type === "external") return Array.isArray(item?.externalLinks) ? item.externalLinks.length > 0 : Boolean(item?.external);
        return true;
      }

      function getOptoStructureFiles(material) {
        const code = String(material?.code || material?.id || "OP-000").replace(/[\\\/:*?"<>|\s]+/g, "_");
        const name = String(material?.name || "organic").replace(/[\\\/:*?"<>|\s]+/g, "_");
        return [
          { key: "pdb", label: "有机分子结构 PDB 文件", filename: `${code}_${name}_organic_molecule.pdb` },
          { key: "ground", label: "基态结构文件", filename: `${code}_${name}_ground_state.xyz` },
          { key: "excited", label: "激发态结构文件", filename: `${code}_${name}_excited_state.xyz` }
        ];
      }

      function ensureOptoStructureFileMetadata() {
        optoMaterials.forEach((item) => {
          if (typeof item.hasOrganic3dStructure === "undefined") {
            item.hasOrganic3dStructure = item.structureType !== "polymer"
              && Boolean(item.structureType || item.structureView || item.structurePath || item.structureData);
          }
          if (!Array.isArray(item.organicStructureFiles)) {
            item.organicStructureFiles = getOptoStructureFiles(item);
          }
        });
      }

      function filterPropertyMode(filters) {
        const type = filters?.propertyType || "structure3d";
        const selected = Array.isArray(filters?.selectedOptions) ? filters.selectedOptions : [];
        if (!selected.length) return optoMaterials.slice();
        const includeWith = selected.includes("with");
        const includeWithout = selected.includes("without");
        if (includeWith && includeWithout) return optoMaterials.slice();
        return optoMaterials.filter((item) => {
          const hasData = hasPropertyDataByType(item, type);
          return includeWith ? hasData : !hasData;
        });
      }

      hasOptoActiveFilters = function hasOptoActiveFiltersOrganic(mode, filters) {
        if (!mode || filters == null) return false;
        if (["name", "formula", "code"].includes(mode)) return String(filters || "").trim().length > 0;
        if (mode === "combo") return getComboConditions(filters).some(hasComboConditionValue);
        if (mode === "property") return Array.isArray(filters?.selectedOptions) && filters.selectedOptions.length > 0;
        if (typeof filters === "object") return Object.values(filters).some((value) => String(value || "").trim());
        return Boolean(String(filters || "").trim());
      };

      const previousFilterOptoByMode = typeof filterOptoByMode === "function" ? filterOptoByMode : null;
      filterOptoByMode = function filterOptoByModeOrganic(mode, filters) {
        ensureOptoOrganicSearchState();
        if (!hasOptoActiveFilters(mode, filters)) return optoMaterials.slice();
        if (mode === "combo") {
          const active = getComboConditions(filters).filter(hasComboConditionValue);
          if (!active.length) return optoMaterials.slice();
          const logic = filters?.logic === "OR" ? "OR" : "AND";
          return optoMaterials.filter((item) => {
            const checks = active.map((condition) => matchComboCondition(item, condition));
            return logic === "OR" ? checks.some(Boolean) : checks.every(Boolean);
          });
        }
        if (mode === "property") return filterPropertyMode(filters);
        return previousFilterOptoByMode ? previousFilterOptoByMode(mode, filters) : optoMaterials.slice();
      };

      getOptoResultList = function getOptoResultListOrganic() {
        ensureOptoOrganicSearchState();
        const applied = state.optoAppliedSearch || {};
        if (!applied.mode || !hasOptoActiveFilters(applied.mode, applied.filters)) return optoMaterials.slice();
        return filterOptoByMode(applied.mode, applied.filters);
      };

      getOptoResultHint = function getOptoResultHintOrganic(list) {
        const applied = state.optoAppliedSearch || {};
        if (!applied.mode || !hasOptoActiveFilters(applied.mode, applied.filters)) {
          return `默认展示有机光电材料库的全部 ${list.length} 条数据。`;
        }
        if (applied.mode === "property") {
          return `已按“${getPropertyTypeLabel(applied.filters?.propertyType)}”筛选到 ${list.length} 条匹配数据。`;
        }
        const label = typeof getOptoModeLabel === "function" ? getOptoModeLabel(applied.mode) : "当前条件";
        return `已按“${label}”筛选到 ${list.length} 条匹配数据。`;
      };

      function renderComboConditionRow(condition, index, total) {
        const field = (typeof OPTO_COMBO_FIELDS !== "undefined" ? OPTO_COMBO_FIELDS : [])[0] || { key: "molecularWeight", label: "分子量", unit: "g/mol" };
        const selectedField = (typeof OPTO_COMBO_FIELDS !== "undefined" ? OPTO_COMBO_FIELDS : []).find((item) => item.key === condition.propertyKey) || field;
        const showMax = true;
        return `
          <div class="opto-condition-row">
            <em class="opto-condition-index">${index + 1}</em>
            <select data-opto-condition-row="${index}" data-opto-condition-role="property" aria-label="性质字段">
              ${(typeof OPTO_COMBO_FIELDS !== "undefined" ? OPTO_COMBO_FIELDS : []).map((item) => `<option value="${esc(item.key)}" ${selectedField.key === item.key ? "selected" : ""}>${esc(item.label)}</option>`).join("")}
            </select>
            <span class="opto-condition-fixed-range">范围</span>
            <input type="text" data-opto-condition-row="${index}" data-opto-condition-role="min" value="${esc(condition.min || "")}" placeholder="${showMax ? "最小值" : "数值"}">
            <span class="opto-condition-separator">${showMax ? "至" : ""}</span>
            <input type="text" data-opto-condition-row="${index}" data-opto-condition-role="max" value="${esc(condition.max || "")}" placeholder="最大值" ${showMax ? "" : "disabled"}>
            <span class="opto-condition-unit">${esc(selectedField.unit || "-")}</span>
            <div class="opto-condition-actions">
              ${total > 1 ? `<button class="btn opto-condition-icon-btn" type="button" data-opto-condition-remove="${index}">删除</button>` : ""}
            </div>
          </div>
        `;
      }

      function renderOptoComboWorkspaceOrganic() {
        const draft = state.optoSearchDraft.combo;
        const conditions = getComboConditions(draft);
        return `
          <div class="twod-mode-panel active">
            <div class="opto-condition-config" aria-label="检索条件配置">
              <div class="opto-condition-config-head">
                <div class="opto-condition-title"><span class="opto-condition-title-mark">+</span><strong>检索条件配置</strong><span class="opto-condition-count">已添加 ${conditions.length} 个条件</span></div>
                <button class="btn-primary" type="button" data-opto-condition-add>添加条件</button>
              </div>
              <div class="opto-condition-list">
                ${conditions.map((condition, index) => renderComboConditionRow(condition, index, conditions.length)).join("")}
              </div>
              <div class="opto-condition-config-footer">
                <div class="opto-condition-logic">多个条件默认同时满足筛选。</div>
                <div class="twod-detail-actions">
                  <button class="btn" type="button" data-opto-reset>重置</button>
                  <button class="btn-primary" type="button" data-opto-apply>检索</button>
                </div>
              </div>
            </div>
            <div class="twod-platform-actions"><div class="twod-status-text">${esc(OPTO_MODE_CONFIG.combo.helper)}</div></div>
          </div>
        `;
      }

      function renderPropertySelectedHint(type, selected) {
        const options = getPropertyOptions(type).filter((item) => selected.includes(item.key));
        if (!options.length) return `<span>请选择需要筛选的性质条件。</span>`;
        return options.map((item) => `<span class="opto-property-chip">${esc(item.label)}</span>`).join("");
      }

      function renderOptoPropertyWorkspaceOrganic() {
        const filters = state.optoSearchDraft.property || {};
        const type = filters.propertyType || "structure3d";
        const selected = Array.isArray(filters.selectedOptions) ? filters.selectedOptions : [];
        const options = getPropertyOptions(type);
        const summary = selected.length
          ? `已选择 ${selected.length} 项`
          : (type === "structure3d" ? "请选择三维结构条件" : "请选择数据条件");
        return `
          <div class="twod-mode-panel active">
            <div class="opto-property-filter-shell">
              <div class="opto-property-filter-row">
                <label class="opto-property-control">
                  <span>性质类型</span>
                  <select data-opto-property-type aria-label="性质类型">
                    ${propertyTypes.map((item) => `<option value="${esc(item.key)}" ${item.key === type ? "selected" : ""}>${esc(item.label)}</option>`).join("")}
                  </select>
                </label>
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
              </div>
              <div class="opto-property-selected-hint">${renderPropertySelectedHint(type, selected)}</div>
              <div class="cross-db-search-row">
                <button class="btn-primary cross-db-search-btn" type="button" data-opto-apply>检索</button>
                <button class="btn cross-db-clear-btn" type="button" data-opto-reset>重置</button>
              </div>
            </div>
            <div class="twod-platform-actions"><div class="twod-status-text">${esc(OPTO_MODE_CONFIG.property.helper)}</div></div>
          </div>
        `;
      }

      const previousRenderOptoModeWorkspace = typeof renderOptoModeWorkspace === "function" ? renderOptoModeWorkspace : null;
      renderOptoModeWorkspace = function renderOptoModeWorkspaceOrganic() {
        ensureOptoOrganicSearchState();
        const mode = state.optoSearchMode || "name";
        if (mode === "combo") return renderOptoComboWorkspaceOrganic();
        if (mode === "property") return renderOptoPropertyWorkspaceOrganic();
        return previousRenderOptoModeWorkspace ? previousRenderOptoModeWorkspace() : "";
      };

      clearCurrentOptoModeDraft = function clearCurrentOptoModeDraftOrganic() {
        ensureOptoOrganicSearchState();
        const mode = state.optoSearchMode || "name";
        if (mode === "combo") {
          state.optoSearchDraft.combo = {
            logic: "AND",
            conditions: [{ propertyKey: OPTO_COMBO_FIELDS?.[0]?.key || "molecularWeight", operator: "range", min: "", max: "" }]
          };
        } else if (mode === "property") {
          state.optoSearchDraft.property = { propertyType: "structure3d", selectedOptions: [] };
        } else {
          state.optoSearchDraft[mode] = "";
        }
        state.optoAppliedSearch = { mode: "", filters: null };
        state.optoCurrentPage = 1;
      };

      function syncOptoOrganicDraftFromDom() {
        const page = document.getElementById("page-opto");
        if (!page) return;
        const mode = state.optoSearchMode || "name";
        if (["name", "formula", "code"].includes(mode)) {
          const input = page.querySelector(`[data-opto-input="${mode}"]`);
          state.optoSearchDraft[mode] = input ? input.value : (state.optoSearchDraft[mode] || "");
          return;
        }
        if (mode === "combo") {
          const rows = [...page.querySelectorAll("[data-opto-condition-row][data-opto-condition-role='property']")];
          state.optoSearchDraft.combo = {
            conditions: rows.map((select) => {
              const index = select.dataset.optoConditionRow;
              return {
                propertyKey: select.value || OPTO_COMBO_FIELDS?.[0]?.key || "molecularWeight",
                operator: "range",
                min: page.querySelector(`[data-opto-condition-row="${index}"][data-opto-condition-role="min"]`)?.value || "",
                max: page.querySelector(`[data-opto-condition-row="${index}"][data-opto-condition-role="max"]`)?.value || ""
              };
            })
          };
          if (!state.optoSearchDraft.combo.conditions.length) {
            state.optoSearchDraft.combo.conditions.push({ propertyKey: OPTO_COMBO_FIELDS?.[0]?.key || "molecularWeight", operator: "range", min: "", max: "" });
          }
          return;
        }
        if (mode === "property") {
          const type = page.querySelector("[data-opto-property-type]")?.value || state.optoSearchDraft.property?.propertyType || "structure3d";
          const selectedOptions = [...page.querySelectorAll("[data-opto-property-option]:checked")].map((item) => item.value);
          state.optoSearchDraft.property = { propertyType: type, selectedOptions };
        }
      }

      applyOptoSearch = function applyOptoSearchOrganic() {
        ensureOptoOrganicSearchState();
        syncOptoOrganicDraftFromDom();
        const mode = state.optoSearchMode || "name";
        const filters = mode === "combo" || mode === "property"
          ? JSON.parse(JSON.stringify(state.optoSearchDraft[mode]))
          : state.optoSearchDraft[mode];
        state.optoAppliedSearch = { mode, filters };
        state.optoCurrentPage = 1;
      };

      function rerenderOptoIfVisible() {
        if (typeof renderOptoModule === "function" && state.page === "opto") renderOptoModule();
      }

      document.body.addEventListener("input", (event) => {
        const target = event.target;
        if (!target.closest?.("#page-opto")) return;
        const row = target.getAttribute("data-opto-condition-row");
        const role = target.getAttribute("data-opto-condition-role");
        if (row == null || !role) return;
        ensureOptoOrganicSearchState();
        const condition = state.optoSearchDraft.combo.conditions[Number(row)];
        if (!condition) return;
        if (role === "min") condition.min = target.value;
        if (role === "max") condition.max = target.value;
      }, true);

      document.body.addEventListener("change", (event) => {
        const target = event.target;
        if (!target.closest?.("#page-opto")) return;
        ensureOptoOrganicSearchState();
        const row = target.getAttribute("data-opto-condition-row");
        const role = target.getAttribute("data-opto-condition-role");
        if (row != null && role) {
          const condition = state.optoSearchDraft.combo.conditions[Number(row)];
          if (!condition) return;
          if (role === "property") condition.propertyKey = target.value;
          if (role === "operator") {
            condition.operator = target.value || "range";
            if (condition.operator !== "range") condition.max = "";
            rerenderOptoIfVisible();
          }
          return;
        }
        if (target.matches("[data-opto-property-type]")) {
          state.optoSearchDraft.property = { propertyType: target.value || "structure3d", selectedOptions: [] };
          rerenderOptoIfVisible();
          return;
        }
        if (target.matches("[data-opto-property-option]")) {
          const type = state.optoSearchDraft.property?.propertyType || "structure3d";
          const checked = [...document.querySelectorAll("#page-opto [data-opto-property-option]:checked")].map((item) => item.value);
          state.optoSearchDraft.property = { propertyType: type, selectedOptions: checked };
        }
      }, true);

      document.body.addEventListener("click", (event) => {
        const add = event.target.closest?.("[data-opto-condition-add]");
        const remove = event.target.closest?.("[data-opto-condition-remove]");
        if (!add && !remove) return;
        event.preventDefault();
        event.stopPropagation();
        ensureOptoOrganicSearchState();
        syncOptoOrganicDraftFromDom();
        const conditions = state.optoSearchDraft.combo.conditions;
        if (add) {
          conditions.push({ propertyKey: OPTO_COMBO_FIELDS?.[0]?.key || "molecularWeight", operator: "range", min: "", max: "" });
        }
        if (remove) {
          const index = Number(remove.dataset.optoConditionRemove);
          state.optoSearchDraft.combo.conditions = conditions.filter((_, itemIndex) => itemIndex !== index);
          if (!state.optoSearchDraft.combo.conditions.length) {
            state.optoSearchDraft.combo.conditions.push({ propertyKey: OPTO_COMBO_FIELDS?.[0]?.key || "molecularWeight", operator: "range", min: "", max: "" });
          }
        }
        rerenderOptoIfVisible();
      }, true);

      function buildStructureDownloadContent(material, kind) {
        const title = `${material?.name || "Organic molecule"} / ${material?.formula || ""}`.trim();
        if (kind === "pdb") {
          return [
            `HEADER    ${title}`,
            "REMARK    Generated preview structure file from low-dimensional materials prototype.",
            "ATOM      1  C   MOL A   1       0.000   0.000   0.000  1.00  0.00           C",
            "ATOM      2  N   MOL A   1       1.320   0.120   0.000  1.00  0.00           N",
            "ATOM      3  H   MOL A   1      -0.620   0.820   0.000  1.00  0.00           H",
            "END"
          ].join("\n");
        }
        const stateLabel = kind === "excited" ? "excited_state" : "ground_state";
        return [
          "3",
          `${title} ${stateLabel}`,
          "C 0.00000 0.00000 0.00000",
          `N ${kind === "excited" ? "1.42000" : "1.32000"} 0.12000 0.00000`,
          "H -0.62000 0.82000 0.00000"
        ].join("\n");
      }

      function downloadOptoStructureFile(material, kind) {
        const files = getOptoStructureFiles(material);
        const file = files.find((item) => item.key === kind) || files[0];
        const blob = new Blob([buildStructureDownloadContent(material, kind)], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        if (typeof showToast === "function") showToast("结构文件下载", `${file.filename} 已开始下载。`);
      }

      function enhanceOptoDetailStructureDownloads(material) {
        const modal = document.getElementById("materialModal");
        if (!modal || state.selectedMaterialSource !== "opto" || !material) return;
        modal.querySelector(".opto-structure-download-panel")?.remove();
        if (!hasOpto3DStructure(material)) return;
        const caption = modal.querySelector("#materialStructureCaption");
        const mount = caption || modal.querySelector(".material-view-card");
        if (!mount) return;
        const files = getOptoStructureFiles(material);
        const panel = document.createElement("div");
        panel.className = "opto-structure-download-panel";
        panel.innerHTML = `
          <div class="opto-structure-download-head">
            <div>
              <h5>结构文件展示与下载</h5>
              <p>提供有机分子结构 PDB、基态结构与激发态结构文件。</p>
            </div>
          </div>
          <div class="opto-structure-download-list">
            ${files.map((file) => `
              <div class="opto-structure-download-item">
                <span title="${esc(file.filename)}">${esc(file.label)}：${esc(file.filename)}</span>
                <button class="btn" type="button" data-opto-structure-download="${esc(file.key)}">下载</button>
              </div>
            `).join("")}
          </div>
        `;
        if (caption) caption.insertAdjacentElement("afterend", panel);
        else mount.appendChild(panel);
      }

      if (typeof openRichMaterialModal === "function") {
        const previousOpenRichMaterialModal = openRichMaterialModal;
        openRichMaterialModal = function openRichMaterialModalWithOptoDownloads(materialToken, targetView) {
          const result = previousOpenRichMaterialModal.apply(this, arguments);
          const token = String(materialToken || "");
          const source = token.includes(":") ? token.split(":")[0] : "twod";
          const id = token.includes(":") ? token.split(":").slice(1).join(":") : token;
          if (source === "opto") {
            const material = typeof findOptoMaterial === "function" ? (findOptoMaterial(id) || optoMaterials[0]) : optoMaterials[0];
            window.setTimeout(() => enhanceOptoDetailStructureDownloads(material), 0);
          }
          return result;
        };
        if (typeof window !== "undefined") window.openRichMaterialModal = openRichMaterialModal;
      }

      if (typeof handleMaterialDetailOpen === "function") {
        handleMaterialDetailOpen = function handleMaterialDetailOpenWithOptoDownloads(materialToken, targetView = "detail") {
          return openRichMaterialModal(materialToken, targetView);
        };
        if (typeof window !== "undefined") window.handleMaterialDetailOpen = handleMaterialDetailOpen;
      }

      if (typeof renderMaterialModal === "function") {
        renderMaterialModal = function renderMaterialModalWithOptoDownloads(materialToken) {
          return openRichMaterialModal(materialToken, "detail");
        };
        if (typeof window !== "undefined") window.renderMaterialModal = renderMaterialModal;
      }

      document.body.addEventListener("click", (event) => {
        const button = event.target.closest?.("[data-opto-structure-download]");
        if (!button) return;
        event.preventDefault();
        event.stopPropagation();
        const material = typeof findOptoMaterial === "function"
          ? (findOptoMaterial(state.selectedMaterialId) || optoMaterials[0])
          : optoMaterials[0];
        downloadOptoStructureFile(material, button.dataset.optoStructureDownload);
      }, true);

      ensureOptoOrganicSearchState();
      if (state.page === "opto" && typeof renderOptoModule === "function") renderOptoModule();
    })();

  