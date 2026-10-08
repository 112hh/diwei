
    (() => {
      if (window.__CROSS_DATABASE_SEARCH_PLATFORM_READY__) return;
      window.__CROSS_DATABASE_SEARCH_PLATFORM_READY__ = true;

      const html = (value) => String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

      const valueText = (value, options) => typeof formatLowDimValue === "function"
        ? formatLowDimValue(value, options)
        : (value == null || value === "" ? "暂无数据" : String(value));

      const cell = (value, options) => {
        const text = valueText(value, options);
        const redClass = options?.red ? " catalyst-red-field" : "";
        const redStyle = options?.red ? ' style="color:#d12f2f !important;"' : "";
        return `<td class="${redClass.trim()}"${redStyle} title="${html(text)}">${text}</td>`;
      };

      const toolbarPanel = (items, type = "button") => items.map((item) => type === "check"
        ? `<label><input type="checkbox" checked disabled><span>${html(item)}</span></label>`
        : `<button type="button">${html(item)}</button>`).join("");

      const renderCrossDatabaseToolbar = (total, config = {}) => `
        <div class="cross-db-result-toolbar">
          <div class="cross-db-toolbar-count">共 <strong>${total}</strong> 条</div>
          <div class="cross-db-toolbar-actions">
            ${config.leadingActions ? `<div class="cross-db-toolbar-leading-actions">${config.leadingActions.map((item) => `<button class="btn-primary" type="button" ${item.attribute || ""}>${html(item.label)}</button>`).join("")}</div>` : ""}
            ${config.showSort !== false ? `<details class="cross-db-toolbar-menu">
              <summary>排序▾</summary>
              <div class="cross-db-toolbar-panel">${toolbarPanel(config.sorts || [])}</div>
            </details>` : ""}
            ${config.showFilter !== false ? `<details class="cross-db-toolbar-menu">
              <summary>筛选▾</summary>
              <div class="cross-db-toolbar-panel">${toolbarPanel(config.filters || [])}</div>
            </details>` : ""}
            <details class="cross-db-toolbar-menu">
              <summary>列设置▾</summary>
              <div class="cross-db-toolbar-panel">${toolbarPanel(config.columns || [], "check")}</div>
            </details>
          </div>
        </div>
      `;
      const renderFlatSearchWorkspace = (moduleKey, mode, config, value, applyAttr, resetAttr, inputAttr) => `
        <div class="twod-mode-panel active">
          <div class="twod-search-row">
            <label class="twod-search-input">
              <span>检索</span>
              <input type="text" ${inputAttr}="${html(mode)}" value="${html(value || "")}" placeholder="${html(config.placeholder || "请输入检索条件")}">
            </label>
            <button class="btn-primary twod-search-submit" type="button" ${applyAttr}>检索</button>
            <button class="btn twod-search-reset" type="button" ${resetAttr}>清空条件</button>
          </div>
          <div class="twod-platform-actions">
            <div class="twod-status-text">${html(config.helper || "输入条件后点击检索，结果列表将按当前条件更新。")}</div>
          </div>
        </div>
      `;

      const normalizeFormula = (value) => String(value || "").replace(/\s+/g, "").toLowerCase();

      const matchText = (query, values, matchMode = "fuzzy") => {
        const keyword = String(query || "").trim().toLowerCase();
        if (!keyword) return true;
        const texts = values.map((value) => String(value || "").trim().toLowerCase()).filter(Boolean);
        return matchMode === "exact"
          ? texts.some((text) => text === keyword)
          : texts.some((text) => text.includes(keyword));
      };

      const matchFormula = (query, formula, matchMode = "exact") => {
        const keyword = normalizeFormula(query);
        const target = normalizeFormula(formula);
        if (!keyword) return true;
        if (matchMode === "exact") return target === keyword;
        if (matchMode === "substructure") return target.includes(keyword);
        return target.includes(keyword) || keyword.includes(target) || [...keyword].every((char) => target.includes(char));
      };

      const ensureOptoComboReferenceFields = () => {
        const extras = [
          { key: "logP", label: "LogP", unit: "" },
          { key: "hBondDonorCount", label: "氢键供体数", unit: "个" }
        ];
        extras.forEach((field) => {
          if (!OPTO_COMBO_FIELDS.some((item) => item.key === field.key)) {
            OPTO_COMBO_FIELDS.push(field);
          }
        });
        optoMaterials.forEach((item, index) => {
          if (item.logP == null) {
            item.logP = Number(((((Number(item.bandGap) || 2.2) * 0.8) + (index % 5) * 0.35) - 1.2).toFixed(2));
          }
          if (item.hBondDonorCount == null) {
            item.hBondDonorCount = index % 4;
          }
        });
      };

      const createDefaultOptoComboConditions = () => [
        { propertyKey: "molecularWeight", operator: "range", min: "200", max: "300" },
        { propertyKey: "logP", operator: "range", min: "-1", max: "5" },
        { propertyKey: "hBondDonorCount", operator: "gte", min: "2", max: "" }
      ];

      const ensureOptoSearchEnhancementState = () => {
        ensureOptoRuntimeState();
        ensureOptoComboReferenceFields();
        if (!state.optoMatchModes) {
          state.optoMatchModes = { name: "fuzzy", formula: "exact", code: "fuzzy" };
        }
        state.optoMatchModes.name = state.optoMatchModes.name || "fuzzy";
        state.optoMatchModes.formula = state.optoMatchModes.formula || "exact";
        state.optoMatchModes.code = state.optoMatchModes.code || "fuzzy";
        const combo = state.optoSearchDraft.combo || {};
        if (!Array.isArray(combo.conditions)) {
          state.optoSearchDraft.combo = {
            conditions: String(combo.min || combo.max || "").trim() ? [{
              propertyKey: combo.propertyKey || OPTO_COMBO_FIELDS[0]?.key || "molecularWeight",
              operator: combo.operator || "range",
              min: combo.min || "",
              max: combo.max || ""
            }] : createDefaultOptoComboConditions()
          };
        }
        if (!state.optoSearchDraft.combo.conditions.length) {
          state.optoSearchDraft.combo.conditions = createDefaultOptoComboConditions();
        }
      };

      const getOptoComboConditions = (filters = state.optoSearchDraft.combo) => {
        if (Array.isArray(filters?.conditions)) return filters.conditions;
        return [{
          propertyKey: filters?.propertyKey || OPTO_COMBO_FIELDS[0]?.key || "molecularWeight",
          operator: filters?.operator || "range",
          min: filters?.min || "",
          max: filters?.max || ""
        }];
      };

      const hasOptoComboConditionValue = (condition) => String(condition?.min || "").trim() || String(condition?.max || "").trim();

      const getOptoComboField = (key) => OPTO_COMBO_FIELDS.find((item) => item.key === key) || OPTO_COMBO_FIELDS[0] || { key: "molecularWeight", label: "分子量", unit: "g/mol" };

      const OPTO_COMBO_OPERATORS = [
        { key: "range", label: "范围" },
        { key: "gte", label: "大于等于" },
        { key: "lte", label: "小于等于" },
        { key: "eq", label: "等于" }
      ];

      const matchOptoComboCondition = (item, condition) => {
        const current = Number(item[condition.propertyKey]);
        if (!Number.isFinite(current)) return false;
        const min = parseNumberValue(condition.min);
        const max = parseNumberValue(condition.max);
        const operator = condition.operator || "range";
        if (operator === "gte") return min == null ? true : current >= min;
        if (operator === "lte") return min == null ? true : current <= min;
        if (operator === "eq") return min == null ? true : Math.abs(current - min) < 0.000001;
        return (min == null || current >= min) && (max == null || current <= max);
      };

      hasOptoActiveFilters = function hasOptoActiveFiltersUnified(mode, filters) {
        if (!mode || filters == null) return false;
        if (["name", "formula", "code"].includes(mode)) return String(filters || "").trim().length > 0;
        if (mode === "combo") return getOptoComboConditions(filters).some(hasOptoComboConditionValue);
        if (mode === "property" && Array.isArray(filters.conditions)) {
          return filters.conditions.some((condition) => String(condition?.min || "").trim() || String(condition?.max || "").trim());
        }
        if (typeof filters === "object") return Object.values(filters).some((value) => String(value || "").trim());
        return Boolean(String(filters || "").trim());
      };

      filterOptoByMode = function filterOptoByModeUnified(mode, filters) {
        if (!hasOptoActiveFilters(mode, filters)) return optoMaterials.slice();
        if (mode === "name") {
          return optoMaterials.filter((item) => matchText(filters, [item.name, item.fullName, item.english, item.englishName], state.optoMatchModes?.name || "fuzzy"));
        }
        if (mode === "formula") {
          return optoMaterials.filter((item) => matchFormula(filters, item.formula, state.optoMatchModes?.formula || "exact"));
        }
        if (mode === "code") {
          return optoMaterials.filter((item) => matchText(filters, [item.code, item.id], state.optoMatchModes?.code || "fuzzy"));
        }
        if (mode === "combo") {
          const activeConditions = getOptoComboConditions(filters).filter(hasOptoComboConditionValue);
          if (!activeConditions.length) return optoMaterials.slice();
          return optoMaterials.filter((item) => {
            const checks = activeConditions.map((condition) => matchOptoComboCondition(item, condition));
            return checks.every(Boolean);
          });
        }
        return optoMaterials.slice();
      };

      getOptoResultHint = function getOptoResultHintUnified(list) {
        const applied = state.optoAppliedSearch || {};
        if (!applied.mode || !hasOptoActiveFilters(applied.mode, applied.filters)) {
          return `默认展示有机光电材料库的全部 ${list.length} 条数据。`;
        }
        if (!list.length) return `已按“${getOptoModeLabel(applied.mode)}”执行检索，当前没有匹配结果。`;
        return `已按“${getOptoModeLabel(applied.mode)}”检索到 ${list.length} 条匹配数据。`;
      };

      clearCurrentOptoModeDraft = function clearCurrentOptoModeDraftUnified() {
        const mode = state.optoSearchMode;
        if (mode === "combo") {
          state.optoSearchDraft.combo = {
            conditions: createDefaultOptoComboConditions()
          };
        } else if (mode === "property") {
          state.optoSearchDraft.property = createOptoSearchDrafts().property;
        } else {
          state.optoSearchDraft[mode] = "";
        }
        state.optoAppliedSearch = { mode: "", filters: null };
        state.optoCurrentPage = 1;
      };

      const renderOptoMatchSelect = (mode) => {
        const current = state.optoMatchModes?.[mode] || (mode === "formula" ? "exact" : "fuzzy");
        const options = mode === "formula"
          ? [
              ["exact", "全结构检索"],
              ["substructure", "子结构检索"],
              ["fuzzy", "模糊结构检索"]
            ]
          : [
              ["exact", "准确检索"],
              ["fuzzy", "模糊检索"]
            ];
        return `
          <select class="cross-db-select" data-opto-match-mode="${html(mode)}" aria-label="${html(OPTO_MODE_CONFIG[mode]?.label || "匹配方式")}">
            ${options.map(([value, label]) => `<option value="${value}" ${current === value ? "selected" : ""}>${html(label)}</option>`).join("")}
          </select>
        `;
      };

      const renderOptoTextWorkspace = (mode) => {
        const config = OPTO_MODE_CONFIG[mode] || OPTO_MODE_CONFIG.name;
        const value = state.optoSearchDraft[mode] || "";
        return `
          <div class="twod-mode-panel active">
            <div class="cross-db-search-row">
              <label class="twod-search-input">
                <span>检索</span>
                <input type="text" data-opto-input="${html(mode)}" value="${html(value)}" placeholder="${html(config.placeholder || "请输入检索条件")}">
              </label>
              ${renderOptoMatchSelect(mode)}
              <button class="btn-primary cross-db-search-btn" type="button" data-opto-apply>检索</button>
              <button class="btn cross-db-clear-btn" type="button" data-opto-reset>清空条件</button>
            </div>
            <div class="twod-platform-actions"><div class="twod-status-text">${html(config.helper || "输入条件后点击检索，结果列表将按当前条件更新。")}</div></div>
          </div>
        `;
      };

      if (typeof filterOptoByMode === "function") {
        getOptoResultList = function getOptoResultListUnified() {
          ensureOptoRuntimeState();
          const applied = state.optoAppliedSearch || {};
          if (!applied.mode || !hasOptoActiveFilters(applied.mode, applied.filters)) {
            return optoMaterials.slice();
          }
          return filterOptoByMode(applied.mode, applied.filters);
        };
      }

      if (typeof filterMlffMaterials === "function") {
        getMlffResultList = function getMlffResultListUnified() {
          ensureMlffRuntimeState();
          const applied = state.mlffAppliedSearch || {};
          if (!applied.mode || !hasMlffActiveFilters(applied.mode, applied.filters)) {
            return mlffMaterials.slice();
          }
          return filterMlffMaterials(applied.mode, applied.filters);
        };
      }

      renderOptoModeWorkspace = function renderOptoModeWorkspaceUnified() {
        ensureOptoSearchEnhancementState();
        const mode = state.optoSearchMode || "name";
        if (mode === "combo") {
          const conditions = getOptoComboConditions(state.optoSearchDraft.combo);
          return `
            <div class="twod-mode-panel active">
              <div class="opto-combo-filter" aria-label="性质组合条件筛选">
                <div class="opto-combo-filter-head">
                  <div class="opto-combo-title">
                    <span class="opto-combo-title-icon" aria-hidden="true">⚙</span>
                    <span>检索条件配置</span>
                    <span class="opto-combo-count">已添加 ${conditions.length} 个条件</span>
                  </div>
                  <button class="btn-primary opto-combo-add-main" type="button" data-opto-combo-add>＋ 添加条件</button>
                </div>
                <div class="opto-combo-filter-list">
                  ${conditions.map((condition, index) => {
                    const field = getOptoComboField(condition.propertyKey);
                    const showMax = true;
                    return `
                      <div class="opto-combo-filter-row">
                        <em class="opto-combo-index">${index + 1}</em>
                        <select class="cross-db-select" data-opto-combo-row="${index}" data-opto-combo-role="property" aria-label="性质字段">
                          ${OPTO_COMBO_FIELDS.map((item) => `<option value="${html(item.key)}" ${field.key === item.key ? "selected" : ""}>${html(item.label)}</option>`).join("")}
                        </select>
                        <span class="cross-db-select opto-combo-fixed-range">范围</span>
                        <input class="cross-db-input" type="text" data-opto-combo-row="${index}" data-opto-combo-role="min" value="${html(condition.min || "")}" placeholder="${showMax ? "最小值" : "数值"}">
                        <span class="opto-combo-separator">${showMax ? "至" : ""}</span>
                        <input class="cross-db-input" type="text" data-opto-combo-row="${index}" data-opto-combo-role="max" value="${html(condition.max || "")}" placeholder="最大值" ${showMax ? "" : "disabled"}>
                        <span class="opto-combo-unit">${html(field.unit || "-")}</span>
                        <div class="opto-combo-row-actions">
                          ${conditions.length > 1 ? `<button class="opto-combo-icon-btn danger" type="button" data-opto-combo-remove="${index}" aria-label="删除条件" title="删除条件">⌫</button>` : ""}
                        </div>
                      </div>
                    `;
                  }).join("")}
                </div>
                <div class="opto-combo-filter-footer">
                  <div class="opto-combo-tip">条件组合默认按同时满足筛选。</div>
                </div>
                <div class="cross-db-search-row">
                  <button class="btn-primary cross-db-search-btn" type="button" data-opto-apply>检索</button>
                  <button class="btn cross-db-clear-btn" type="button" data-opto-reset>清空条件</button>
                </div>
              </div>
              <div class="twod-platform-actions"><div class="twod-status-text">${html(OPTO_MODE_CONFIG.combo.helper)}</div></div>
            </div>
          `;
        }
        if (mode === "property") {
          const filters = state.optoSearchDraft.property || {};
          return `
            <div class="twod-mode-panel active">
              <div class="opto-property-grid">
                ${OPTO_PROPERTY_FIELD_GROUPS.map((group) => renderOptoPropertyCard(group, filters)).join("")}
              </div>
              <div class="twod-platform-actions">
                <div class="twod-status-text">${html(OPTO_MODE_CONFIG.property.helper)}</div>
                <div class="twod-detail-actions">
                  <button class="btn twod-search-reset" type="button" data-opto-reset>清空条件</button>
                  <button class="btn-primary" type="button" data-opto-apply>检索</button>
                </div>
              </div>
            </div>
          `;
        }
        return renderOptoTextWorkspace(mode);
      };

      renderMlffModeWorkspace = function renderMlffModeWorkspaceUnified() {
        const mode = state.mlffSearchMode || "name";
        if (mode === "property") {
          const currentField = state.mlffSearchDraft.propertyField || MLFF_PROPERTY_FIELDS[0].key;
          return `
            <div class="twod-mode-panel active">
              <div class="cross-db-search-row">
                <select class="cross-db-select" id="mlffPropertyField" aria-label="性质数据">
                  ${MLFF_PROPERTY_FIELDS.map((item) => `<option value="${html(item.key)}" ${currentField === item.key ? "selected" : ""}>${html(item.label)}</option>`).join("")}
                </select>
                <input class="cross-db-input" id="mlffPropertyKeyword" type="text" value="${html(state.mlffSearchDraft.propertyKeyword || "")}" placeholder="${html(MLFF_PROPERTY_PLACEHOLDERS[currentField] || "请输入对应内容")}">
                <button class="btn-primary cross-db-search-btn" type="button" data-mlff-apply>检索</button>
                <button class="btn cross-db-clear-btn" type="button" data-mlff-reset>清空条件</button>
              </div>
              <div class="twod-platform-actions"><div class="twod-status-text">${html(getMlffModeLabel(mode))}支持按参数、方法、能量和结构信息筛选。</div></div>
            </div>
          `;
        }
        const config = MLFF_SEARCH_MODES.find((item) => item.key === mode) || MLFF_SEARCH_MODES[0];
        const value = mode === "name" ? state.mlffSearchDraft.name : state.mlffSearchDraft.formula;
        return renderFlatSearchWorkspace("mlff", mode, config, value, "data-mlff-apply", "data-mlff-reset", "data-mlff-mode-input");
      };

      const renderCatalystElementPicker = () => {
        const selected = new Set(Array.isArray(state.catalystSearchDraft.elementSelections) ? state.catalystSearchDraft.elementSelections : []);
        return CATALYST_PERIODIC_ELEMENTS.map((symbol, index) => `
          <button
            class="catalyst-periodic-btn${selected.has(symbol) ? " active" : ""}"
            type="button"
            data-catalyst-element-pick="${html(symbol)}"
            aria-pressed="${selected.has(symbol) ? "true" : "false"}"
            title="${index + 1} ${html(symbol)}"
          >${html(symbol)}</button>
        `).join("");
      };

      const renderCatalystElementsWorkspace = () => {
        const selected = Array.isArray(state.catalystSearchDraft.elementSelections) ? state.catalystSearchDraft.elementSelections : [];
        return `
          <div class="twod-mode-panel active">
            <div class="catalyst-element-search">
              <div class="catalyst-element-input-row">
                <input class="cross-db-input" type="text" data-catalyst-mode-input="elements" value="${html(state.catalystSearchDraft.elements || "")}" placeholder="请输入元素组成，如 Pt、Fe,N,C 或 Ni+Mo">
                <button class="btn-primary cross-db-search-btn" type="button" data-catalyst-platform-apply>检索</button>
                <button class="btn cross-db-clear-btn" type="button" data-catalyst-platform-reset>清空条件</button>
              </div>
              <details class="catalyst-periodic-dropdown">
                <summary>元素周期表选择</summary>
                <div class="catalyst-periodic-grid" aria-label="元素周期表多选">
                  ${renderCatalystElementPicker()}
                </div>
              </details>
              <div class="catalyst-element-selected">已选择：${selected.length ? html(selected.join(" + ")) : "未选择元素，可直接输入文本或点击周期表元素"}</div>
            </div>
            <div class="twod-platform-actions"><div class="twod-status-text">按元素组成检索催化剂体系，文本输入和周期表选择会合并筛选，多个元素默认同时包含。</div></div>
          </div>
        `;
      };

      renderCatalystPlatformWorkspace = function renderCatalystPlatformWorkspaceUnified() {
        const mode = state.catalystSearchMode || "keyword";
        if (mode === "elements") return renderCatalystElementsWorkspace();
        if (mode === "property") {
          return `
            <div class="twod-mode-panel active">
              <div class="cross-db-search-row">
                <select class="cross-db-select" id="catalystPropertyFieldPlatform" aria-label="性质项">
                  ${CATALYST_PROPERTY_FIELDS.map((item) => `<option value="${html(item.key)}" ${state.catalystSearchDraft.propertyField === item.key ? "selected" : ""}>${html(item.label)}</option>`).join("")}
                </select>
                <input class="cross-db-input" id="catalystPropertyKeywordPlatform" type="text" value="${html(state.catalystSearchDraft.propertyKeyword || "")}" placeholder="请输入性质详情检索值">
                <button class="btn-primary cross-db-search-btn" type="button" data-catalyst-platform-apply>检索</button>
                <button class="btn cross-db-clear-btn" type="button" data-catalyst-platform-reset>清空条件</button>
              </div>
              <div class="twod-platform-actions"><div class="twod-status-text">${html(getCatalystSearchLabel(mode))}支持按元素组成、结构特征、晶格参数、电子性质和催化性能筛选。</div></div>
            </div>
          `;
        }
        if (mode === "route") {
          return `
            <div class="twod-mode-panel active">
              <div class="cross-db-search-row">
                <input class="cross-db-input" id="catalystRouteReactant" type="text" value="${html(state.catalystSearchDraft.routeReactant || "")}" placeholder="请输入反应物，如 O2、H2O、H+">
                <input class="cross-db-input" id="catalystRouteProduct" type="text" value="${html(state.catalystSearchDraft.routeProduct || "")}" placeholder="请输入生成物，如 H2O、O2、H2">
                <button class="btn-primary cross-db-search-btn" type="button" data-catalyst-platform-apply>检索</button>
                <button class="btn cross-db-clear-btn" type="button" data-catalyst-platform-reset>清空条件</button>
              </div>
              <div class="twod-platform-actions"><div class="twod-status-text">${html(getCatalystSearchLabel(mode))}用于定位反应路线对应的催化材料记录。</div></div>
            </div>
          `;
        }
        const config = CATALYST_SEARCH_MODES.find((item) => item.key === mode) || CATALYST_SEARCH_MODES[0];
        return renderFlatSearchWorkspace("catalyst", mode, config, state.catalystSearchDraft[mode] || "", "data-catalyst-platform-apply", "data-catalyst-platform-reset", "data-catalyst-mode-input");
      };

      renderOptoResultRows = function renderOptoResultRowsUnified(list) {
        if (!list.length) return `<tr><td colspan="8" class="electrolyte-empty">未检索到符合条件的数据，请调整检索条件后重试。</td></tr>`;
        const start = ((state.optoCurrentPage || 1) - 1) * (state.optoPageSize || 5);
        return list.map((item, index) => `
          <tr>
            ${cell(start + index + 1)}
            ${cell(item.code || item.id)}
            <td title="${html(valueText(item.name))}"><button class="twod-material-link" type="button" data-open-material="opto:${html(item.id)}" data-material-view="basic">${valueText(item.name)}</button></td>
            ${cell(item.fullName)}
            ${cell(item.englishName || item.english || item.enName || item.name)}
            <td title="${html(valueText(item.formula))}"><em>${valueText(item.formula)}</em></td>
            <td>${renderLowDimDatasetSource(item, "opto")}</td>
            <td>
              <div class="twod-record-inline-actions">
                <button class="twod-action-view" type="button" data-open-material="opto:${html(item.id)}" data-material-view="basic">查看详情</button>
                <button class="twod-record-link" type="button" data-open-material="opto:${html(item.id)}" data-material-view="prediction">发起预测</button>
              </div>
            </td>
          </tr>
        `).join("");
      };

      function getMlffAtomPropertySummary(item) {
        if (item.atomProperties) return String(item.atomProperties);
        if (item.structureType) return String(item.structureType);
        return LOW_DIM_NO_PROPERTY_TEXT;
      }

      function getMlffChargeSummary(item) {
        if (Array.isArray(item.chargeValues) && item.chargeValues.length && item.chargeValues.every((value) => Number.isFinite(Number(value)) && Math.abs(Number(value)) <= 10)) {
          const min = Math.min.apply(null, item.chargeValues);
          const max = Math.max.apply(null, item.chargeValues);
          return min === max ? `${min.toFixed(2)} e` : `${min.toFixed(2)} ~ ${max.toFixed(2)} e`;
        }
        if (item.charge != null) return String(item.charge);
        if (item.parameterValue && /电荷|charge/i.test(String(item.parameterName || ""))) return String(item.parameterValue);
        return LOW_DIM_NO_PROPERTY_TEXT;
      }

      function getMlffMultipoleSummary(item) {
        if (item.multipole != null) return String(item.multipole);
        if (item.dipole != null) return `${Number(item.dipole).toFixed(2)} D`;
        return LOW_DIM_NO_PROPERTY_TEXT;
      }

      function getMlffPolarizabilitySummary(item) {
        return item.polarizability != null ? String(item.polarizability) : LOW_DIM_NO_PROPERTY_TEXT;
      }

      function getMlffDispersionCoefficientSummary(item) {
        return item.dispersionCoefficient != null ? String(item.dispersionCoefficient) : LOW_DIM_NO_PROPERTY_TEXT;
      }

      const MLFF_DATASET_TYPE_SAMPLES = [
        "单分子数据集", "双分子数据集", "多分子团簇数据集", "醚类有机小分子数据集",
        "酰胺类有机小分子数据集", "高分子片段机器学习力场数据集", "蛋白质机器学习力场数据集"
      ];

      function getMlffDatasetTypeSummary(item) {
        if (item.datasetType || item.dataSetType) return item.datasetType || item.dataSetType;
        const index = Math.max(0, mlffMaterials.indexOf(item));
        return MLFF_DATASET_TYPE_SAMPLES[index % MLFF_DATASET_TYPE_SAMPLES.length];
      }

      function getMlffDatasetSourceLabel(item) {
        if (item.dataSource === "internal" || item.datasetSource === "internal") return "自研数据集";
        if (item.dataSource === "public" || item.datasetSource === "public") return "公开数据集";
        const datasetType = getMlffDatasetTypeSummary(item);
        if (datasetType.includes("高分子片段") || datasetType.includes("蛋白质")) return "自研数据集";
        return getLowDimDatasetSourceLabel(item).replace("自有数据集", "自研数据集");
      }

      function renderMlffDatasetSource(item) {
        return `<div class="twod-source-stack"><span class="twod-source-pill">${html(getMlffDatasetSourceLabel(item))}</span></div>`;
      }

      // 详情页增强脚本在外层作用域运行，显式暴露数据来源格式化函数供其复用。
      window.getMlffDatasetSourceLabel = getMlffDatasetSourceLabel;

      function getMlffSystemScaleSummary(item) {
        if (item.systemScale) return String(item.systemScale);
        const atomCount = Array.isArray(item.chargeValues) ? item.chargeValues.length : String(item.atoms || "").split(",").filter(Boolean).length;
        return atomCount > 10 ? "大体系" : "小体系";
      }

      function getMlffSystemTypeSummary(item) {
        return item.systemType || item.systemCategory || "非周期分子体系";
      }

      renderMlffResultRows = function renderMlffResultRowsUnified(list) {
        if (!list.length) return `<tr><td colspan="13" class="opto-table-empty">未检索到符合条件的机器学习力场数据，请调整检索条件后重试。</td></tr>`;
        const start = ((state.mlffPage || 1) - 1) * (state.mlffPageSize || 5);
        return list.map((item, index) => `
          <tr>
            ${cell(item.id)}
            <td title="${html(valueText(item.name))}"><button class="twod-material-link" type="button" data-open-material="mlff:${html(item.id)}" data-material-view="basic">${valueText(item.name)}</button></td>
            ${cell(item.english)}
            <td title="${html(valueText(item.formula))}"><em>${valueText(item.formula)}</em></td>
            ${cell(getMlffDatasetTypeSummary(item))}
            <td>${renderMlffDatasetSource(item)}</td>
            ${cell(getMlffSystemScaleSummary(item))}
            ${cell(getMlffSystemTypeSummary(item))}
            ${cell(getMlffChargeSummary(item))}
            ${cell(getMlffMultipoleSummary(item))}
            ${cell(getMlffPolarizabilitySummary(item))}
            ${cell(getMlffDispersionCoefficientSummary(item))}
            <td>
              <div class="twod-record-inline-actions">
                <button class="twod-action-view" type="button" data-open-material="mlff:${html(item.id)}" data-material-view="basic">查看详情</button>
                <button class="twod-record-link" type="button" data-open-material="mlff:${html(item.id)}" data-material-view="prediction">发起预测</button>
                <button class="twod-record-link" type="button" data-mlff-field-update="${html(item.id)}">场数据更新</button>
              </div>
            </td>
          </tr>
        `).join("");
      };

      renderCatalystPlatformRows = function renderCatalystPlatformRowsUnified(list) {
        if (!list.length) return `<tr><td colspan="13" class="opto-table-empty">未检索到符合条件的催化材料数据，请调整检索条件后重试。</td></tr>`;
        const start = ((state.catalystPage || 1) - 1) * (state.catalystPageSize || 5);
        return list.map((item, index) => `
          <tr>
            ${cell(start + index + 1)}
            ${cell(item.id)}
            <td title="${html(valueText(item.name))}"><button class="twod-material-link" type="button" data-open-material="catalyst:${html(item.id)}" data-material-view="basic">${valueText(item.name)}</button></td>
            ${cell(item.formula)}
            ${cell(item.catalystCategory)}
            ${cell(item.composition || (item.elements || []).join(", "))}
            ${cell(item.intermediate)}
            ${cell(item.structureFeature || item.systemFeature || item.atomicStructure || "/")}
            ${cell(item.surface)}
            <td>${renderCatalystDatasetSource(item)}</td>
            ${cell(item.activationEnergy, { numeric: true, digits: 2, suffix: " eV" })}
            ${cell(item.reactant || item.reactionReactant || item.routeReactant, { red: true })}
            ${cell(item.product || item.reactionProduct || item.routeProduct, { red: true })}
            <td>
              <div class="twod-record-inline-actions">
                <button class="twod-action-view" type="button" data-open-material="catalyst:${html(item.id)}" data-material-view="basic">查看详情</button>
                <button class="twod-record-link" type="button" data-open-material="catalyst:${html(item.id)}" data-material-view="prediction">发起预测</button>
              </div>
            </td>
          </tr>
        `).join("");
      };

      const resultToolbars = {
        opto: {
          showSort: false,
          showFilter: false,
          columns: ["序号", "材料编号", "材料简称", "完整名称", "英文名称", "分子式", "数据来源", "操作"]
        },
        mlff: {
          showSort: false,
          showFilter: false,
          columns: ["材料编号", "中文名称", "英文名称", "分子式", "电荷", "多极矩", "极化率和色散系数", "键长/结构", "操作"],
          leadingActions: [{ label: "机器学习力场数据术语表", attribute: "data-mlff-glossary-page" }]
        },
        catalyst: {
          showSort: false,
          showFilter: false,
          columns: ["序号", "材料编号", "材料名称", "化学式", "分类标签", "材料成分", "中间产物", "材料描述", "表面参数", "数据来源", "活化能", "反应路径信息", "操作"],
          leadingActions: [
            { label: "活性位点分析", attribute: 'data-catalyst-workbench="site"' },
            { label: "材料对比", attribute: 'data-catalyst-workbench="compare"' },
            { label: "催化构建", attribute: 'data-catalyst-workbench="build"' }
          ]
        }
      };
      function renderMlffCurrentConversionPanel() {
        const typeDescriptions = {
          "拓扑文件": "拓扑文件是描述体系原子种类、原子坐标信息的文件。通过拓扑文件转换器，可以转换常用的几种拓扑文件格式，在不同软件上进行分子动力学模拟或力场能力计算时灵活使用。",
          "力场文件": "力场文件转换方便将力场参数转换为各大计算软件包常用的类型，用户可以得到一组力场参数并将其运用在不同的计算软件平台上。"
        };
        const convertTypes = ["拓扑文件", "力场文件"];
        const currentType = convertTypes.includes(state.mlffConvertFilterType) ? state.mlffConvertFilterType : "拓扑文件";
        state.mlffConvertFilterType = currentType;
        const upload = state.mlffConvertUpload && state.mlffConvertUpload.fileType === currentType ? state.mlffConvertUpload : null;
        const allFormats = getMlffConvertTargetFormatsByType(currentType);
        const sourceFormat = String(upload?.sourceFormat || "").toUpperCase();
        const filteredFormats = allFormats.filter((item) => item !== sourceFormat);
        const targetFormats = filteredFormats.length ? filteredFormats : allFormats;
        if (!targetFormats.includes(state.mlffConvertTargetFormat)) {
          state.mlffConvertTargetFormat = targetFormats[0] || "";
        }
        const filters = state.mlffConvertFilters || { keyword: "", type: "", status: "" };
        const allHistoryRecords = (window.__materialConversionRecords || []).filter((r) => r.module === "mlff");
        const historyRecords = allHistoryRecords.filter((r) => {
          const keyword = String(filters.keyword || "").trim().toLowerCase();
          const keywordText = `${r.materialName || ""} ${r.sourceName || ""} ${r.resultName || ""} ${r.remark || ""}`.toLowerCase();
          const keywordMatch = !keyword || keywordText.includes(keyword);
          const typeMatch = !filters.type || r.fileType === filters.type;
          const statusMatch = !filters.status || r.status === filters.status;
          return keywordMatch && typeMatch && statusMatch;
        });
        const sourceText = upload
          ? `源格式：${upload.sourceFormat || "自动识别"} · ${upload.fileSizeText || "本地上传文件"}`
          : "支持拓扑文件、力场文件两类转换业务";
        return `
          <div class="material-convert-shell" data-material-convert-module="mlff">
            <section class="card pad material-convert-workbench">
              <div class="material-convert-head">
                <div>
                  <h3>机器学习力场文件转换</h3>
                  <p>支持机器学习力场拓扑文件与力场文件的格式统一化转换，转换结果可继续下载或作为更新记录维护。</p>
                </div>
              </div>
              <div class="material-convert-grid">
                <div style="display:grid;gap:14px;align-content:start;">
                  <div class="material-convert-type-row">
                    ${convertTypes.map((type) => `
                      <button class="material-convert-type${currentType === type ? " active" : ""}" type="button" data-mlff-current-convert-type="${type}">${type}</button>
                    `).join("")}
                  </div>
                  <div class="material-convert-drop is-upload">
                    <strong>${html(upload?.fileName || "请先上传拓扑文件或力场文件")}</strong>
                    <span>${html(sourceText)}</span>
                    <button class="material-convert-upload-btn" type="button" data-mlff-convert-upload>选择文件</button>
                    <input type="file" hidden data-mlff-convert-file accept=".xyz,.pdb,.mol2,.sdf,.cif,.json,.csv,.xml,.txt,.dat,.prm,.ff,.npz,.h5,.hdf5">
                  </div>
                </div>
                <div>
                  <p class="material-convert-type-note">${html(typeDescriptions[currentType] || "")}</p>
                  <div class="material-convert-form" style="margin-top:14px;">
                    <div class="field">
                      <label>源文件格式</label>
                      <input type="text" value="${html(upload?.sourceFormat || "自动识别")}" readonly aria-readonly="true" data-mlff-convert-source-format>
                    </div>
                    <div class="field">
                      <label>目标文件格式</label>
                      <select data-mlff-current-convert-target>
                        ${targetFormats.map((format) => `<option value="${html(format)}"${format === state.mlffConvertTargetFormat ? " selected" : ""}>${html(format)}</option>`).join("")}
                      </select>
                    </div>
                  </div>
                  ${buildTwodConvertSummary([
                    { label: "转换类型", value: currentType },
                    { label: "源文件", value: upload?.fileName || "待上传" },
                    { label: "源文件格式", value: upload?.sourceFormat || "自动识别" },
                    { label: "目标文件格式", value: state.mlffConvertTargetFormat || "-" }
                  ])}
                  <div class="twod-convert-actions" style="margin-top:16px;">
                    <button class="btn-primary" type="button" data-mlff-current-convert-start ${upload ? "" : "disabled"}>开始转换</button>
                    <button class="btn" type="button" data-mlff-current-convert-clear>清空文件</button>
                  </div>
                </div>
              </div>
            </section>

            <section class="card pad material-convert-record-card">
              <div class="material-convert-record-title">
                <h3>转换记录</h3>
                <p>支持按文件名、材料名、转换类型和状态查询历史记录，并可查看详情或下载结果文件。</p>
              </div>
              <div class="material-convert-record-toolbar">
                <div class="material-convert-record-search">
                  <input type="text" value="${html(filters.keyword || "")}" placeholder="材料名 / 源文件 / 结果文件" data-mlff-convert-filter="keyword">
                </div>
                <label class="material-convert-filter-field">
                  <span>转换类型</span>
                  <select data-mlff-convert-filter="type">
                    <option value="">全部</option>
                    ${convertTypes.map((item) => `<option value="${html(item)}"${filters.type === item ? " selected" : ""}>${html(item)}</option>`).join("")}
                  </select>
                </label>
                <label class="material-convert-filter-field">
                  <span>转换状态</span>
                  <select data-mlff-convert-filter="status">
                    <option value="">全部</option>
                    ${["已完成", "转换中"].map((item) => `<option value="${item}"${filters.status === item ? " selected" : ""}>${item}</option>`).join("")}
                  </select>
                </label>
                <div class="material-convert-record-actions">
                  <button class="btn-primary" type="button" data-mlff-convert-search>查询</button>
                  <button class="btn" type="button" data-mlff-convert-reset>重置</button>
                </div>
              </div>
              <div class="table-wrap twod-result-table-wrap">
                <table class="twod-result-table">
                  <thead>
                    <tr>
                      <th>转换时间</th>
                      <th>材料名称</th>
                      <th>转换类型</th>
                      <th>源文件</th>
                      <th>源格式</th>
                      <th>目标格式</th>
                      <th>状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${historyRecords.length ? historyRecords.map((record) => `
                      <tr>
                        <td>${html(record.createdAt || "-")}</td>
                        <td>${html(record.materialName || "-")}</td>
                        <td>${html(record.fileType || "-")}</td>
                        <td>${html(record.sourceName || "-")}</td>
                        <td>${html(record.sourceFormat || "-")}</td>
                        <td>${html(record.targetFormat || "-")}</td>
                        <td><span class="status-badge success">${html(record.status || "-")}</span></td>
                        <td>
                          <div class="table-actions">
                            <button class="btn btn-sm" type="button" data-mlff-convert-detail="${html(record.id)}">查看</button>
                            <button class="btn btn-sm" type="button" data-mlff-convert-download="${html(record.id)}">下载文件</button>
                          </div>
                        </td>
                      </tr>
                    `).join("") : `<tr><td colspan="8"><div class="sys-empty">暂无符合条件的转换记录</div></td></tr>`}
                  </tbody>
                </table>
              </div>
              <div class="material-convert-record-footer">
                <span>共计 ${historyRecords.length} 条</span>
                <div class="material-convert-record-pager" aria-label="转换记录分页">
                  <button type="button" disabled aria-label="上一页">‹</button>
                  <button type="button" class="active">1</button>
                  <button type="button" disabled aria-label="下一页">›</button>
                  <select class="material-convert-record-page-size" aria-label="每页条数">
                    <option>10条/页</option>
                  </select>
                </div>
              </div>
            </section>
          </div>
        `;
      }

      function renderMlffGlossaryPage() {
        const isDefinition = state.mlffGlossaryTab !== "method";
        const definitionItems = mlffGlossaryDefinitions.filter((item) => {
          const keyword = String(state.mlffTermKeyword || "").trim().toLowerCase();
          return !keyword || `${item.cn} ${item.en} ${item.desc}`.toLowerCase().includes(keyword);
        });
        const methodItems = mlffGlossaryMethods.filter((item) => {
          const keyword = String(state.mlffTermKeyword || "").trim().toLowerCase();
          const typeMatch = state.mlffMethodFilter === "all" || item.type.includes(state.mlffMethodFilter);
          const keywordMatch = !keyword || `${item.title} ${item.type} ${item.desc} ${item.shortTitle}`.toLowerCase().includes(keyword);
          return typeMatch && keywordMatch;
        });
        const definitionBody = `
          <section class="card table-card">
            <div class="table-head"><div><h3>参数数据定义列表</h3><p class="section-subtitle">提供机器学习力场参数数据的中文术语、英文名称、定义说明与单位。</p></div></div>
            <div class="table-wrap"><table class="summary-table"><thead><tr><th>首字母</th><th>术语名称</th><th>英文名称</th><th>定义说明</th><th>单位</th></tr></thead><tbody>
              ${definitionItems.map((item) => `<tr><td><strong>${html(item.letter)}</strong></td><td>${html(item.cn)}</td><td>${html(item.en)}</td><td>${html(item.desc)}</td><td>${html(item.unit)}</td></tr>`).join("") || `<tr><td colspan="5" class="opto-table-empty">暂无匹配术语</td></tr>`}
            </tbody></table></div>
          </section>
        `;
        const methodBody = `
        <div class="mlff-method-list">
          ${methodItems.map((item) => {
            const toneColors = { blue: { bg: "#e8f0fe", fg: "#1660ff" }, purple: { bg: "#f3e8ff", fg: "#8c46ff" }, green: { bg: "#e8f8f0", fg: "#21a65d" }, orange: { bg: "#fff3e0", fg: "#e87722" } };
            const tc = toneColors[item.tone] || toneColors.blue;
            const iconMap = { dft: "🔬", mlp: "🤖", expfit: "", fffit: "⚙️", lit: "" };
            const icon = iconMap[item.id] || "📋";
            return `
              <article class="mlff-method-card">
                <div class="mlff-method-card-header">
                  <div class="mlff-method-card-title-row">
                    <div class="mlff-method-icon" style="background:${tc.bg};font-size:20px;">${icon}</div>
                    <div class="mlff-method-card-title-info">
                      <h4>${item.title} <span class="mlff-method-type-badge" style="background:${tc.bg};color:${tc.fg};">${item.type}</span></h4>
                      <div class="mlff-method-card-subtitle">${item.shortTitle} · 使用频率：${item.frequency}</div>
                    </div>
                  </div>
                  <div class="mlff-method-card-actions">
                    <button class="mlff-detail-btn" type="button" data-mlff-method-detail>查看详情</button>
                    <button class="mlff-fav-btn" type="button" title="收藏">☆</button>
                  </div>
                </div>
                <div class="mlff-method-section mlff-method-desc-section">
                  <div class="mlff-method-section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg> 方法说明</div>
                  <p>${item.desc}</p>
                </div>
                <div class="mlff-method-section mlff-method-analysis-section">
                  <div class="mlff-method-section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg> 方法分析</div>
                  <div class="mlff-method-analysis-content">
                    <span class="mlff-method-pros">✓ 优势：${(item.analysis || {}).pros || "数据可信度高"}</span>
                    <span class="mlff-method-cons">✗ 不足：${(item.analysis || {}).cons || "获取成本较高"}</span>
                    <span class="mlff-method-apply">适用于：${(item.analysis || {}).apply || item.scope || "力场参数获取"}</span>
                  </div>
                </div>
                <div class="mlff-method-footer">
                  <div class="mlff-method-params">
                    <span class="mlff-method-params-label">关联参数：</span>
                    ${(item.params || ["力场参数"]).map(p => "<span class=\"mlff-method-param-tag\">" + p + "</span>").join("")}
                  </div>
                  <div class="mlff-method-updated"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> 更新于 ${item.updatedAt}</div>
                </div>
              </article>
            `;
          }).join("")}
        </div>
      `;
        return `
          <div class="page-head"><div><h2>机器学习力场数据术语表</h2><p>提供机器学习力场参数数据定义与数据获取方法，支持检索和分类查看。</p></div></div>
          <div class="twod-platform-shell">
            <section class="card twod-search-platform">
              <div class="twod-results-head"><div><h3>术语表分类</h3><p class="twod-result-hint">当前页面仅展示机器学习力场数据相关术语和获取方法。</p></div><button class="btn" type="button" data-mlff-glossary-back>返回数据检索</button></div>
              <div class="module-tab-strip"><button class="module-tab-btn${isDefinition ? " active" : ""}" type="button" data-mlff-glossary-page-tab="definition">机器学习力场参数数据定义表</button><button class="module-tab-btn${!isDefinition ? " active" : ""}" type="button" data-mlff-glossary-page-tab="method">机器学习力场数据获取方法表</button></div>
              ${isDefinition ? `<div class="twod-search-row"><label class="twod-search-input"><span>术语检索</span><input type="text" value="${html(state.mlffTermKeyword || "")}" placeholder="输入术语名称、英文缩写或参数类型进行检索" data-mlff-glossary-keyword></label><button class="btn-primary" type="button" data-mlff-glossary-search>检索</button><button class="btn" type="button" data-mlff-glossary-reset>重置条件</button></div><div class="twod-platform-actions"><div class="twod-status-text">按汉字、英文名称或定义说明筛选术语。</div></div>` : `<div class="twod-search-row"><label class="twod-search-input"><span>深度检索</span><input type="text" value="${html(state.mlffTermKeyword || "")}" placeholder="输入参数名称、获取方法或关键词进行深度检索" data-mlff-glossary-method-keyword></label><label class="field"><span>获取方法</span><select data-mlff-glossary-method-filter><option value="all">全部方法</option><option value="量子化学计算">量子化学计算</option><option value="机器学习方法">机器学习方法</option><option value="实验测量">实验测量</option></select></label><button class="btn-primary" type="button" data-mlff-glossary-search>检索</button><button class="btn" type="button" data-mlff-glossary-reset>重置条件</button></div>`}
            </section>
            ${isDefinition ? definitionBody : methodBody}
          </div>
        `;
      }

      if (document.body.dataset.mlffCurrentConversionBound !== "true") {
        document.body.dataset.mlffCurrentConversionBound = "true";
        const inferMlffConvertType = (format) => {
          const normalized = String(format || "").toUpperCase();
          if (["XYZ", "PDB", "MOL2", "SDF", "CIF"].includes(normalized)) return "拓扑文件";
          if (["XML", "JSON", "TXT", "CSV", "DAT", "FF", "PRM"].includes(normalized)) return "力场文件";
          return "";
        };
        document.body.addEventListener("change", (event) => {
          if (event.target.matches("[data-mlff-current-convert-target]")) {
            state.mlffConvertTargetFormat = event.target.value;
            return;
          }
          const uploadInput = event.target.closest("[data-mlff-convert-file]");
          if (uploadInput) {
            const file = uploadInput.files && uploadInput.files[0];
            if (!file) return;
            const ext = String(file.name.split(".").pop() || "").toUpperCase();
            const fileType = inferMlffConvertType(ext) || state.mlffConvertFilterType;
            const sizeKb = Math.max(1, Math.round((file.size || 0) / 1024));
            state.mlffConvertUpload = {
              fileName: file.name,
              sourceFormat: ext || "自动识别",
              fileType,
              fileSizeText: `${sizeKb} KB`
            };
            state.mlffConvertFilterType = fileType;
            const available = getMlffConvertTargetFormatsByType(fileType).filter((item) => item !== ext);
            const fallback = available.length ? available : getMlffConvertTargetFormatsByType(fileType);
            state.mlffConvertTargetFormat = fallback[0] || "";
            renderMlffModule();
            return;
          }
          const filterField = event.target.closest("[data-mlff-convert-filter]");
          if (filterField) {
            state.mlffConvertFilters = state.mlffConvertFilters || { keyword: "", type: "", status: "" };
            state.mlffConvertFilters[filterField.dataset.mlffConvertFilter] = filterField.value;
          }
        });
        document.body.addEventListener("click", (event) => {
          const typeButton = event.target.closest("[data-mlff-current-convert-type]");
          if (typeButton) {
            state.mlffConvertFilterType = typeButton.dataset.mlffCurrentConvertType;
            state.mlffConvertUpload = null;
            state.mlffConvertTargetFormat = "";
            renderMlffModule();
            return;
          }
          if (event.target.closest("[data-mlff-convert-upload]")) {
            document.querySelector("[data-mlff-convert-file]")?.click();
            return;
          }
          if (event.target.closest("[data-mlff-current-convert-clear]")) {
            state.mlffConvertUpload = null;
            state.mlffConvertTargetFormat = "";
            renderMlffModule();
            return;
          }
          if (event.target.closest("[data-mlff-current-convert-start]")) {
            startMlffConvertFlow();
            return;
          }
          if (event.target.closest("[data-mlff-convert-search]")) {
            state.mlffConvertFilters = {
              keyword: document.querySelector('[data-mlff-convert-filter="keyword"]')?.value.trim() || "",
              type: document.querySelector('[data-mlff-convert-filter="type"]')?.value || "",
              status: document.querySelector('[data-mlff-convert-filter="status"]')?.value || ""
            };
            renderMlffModule();
            return;
          }
          if (event.target.closest("[data-mlff-convert-reset]")) {
            state.mlffConvertFilters = { keyword: "", type: "", status: "" };
            renderMlffModule();
            return;
          }
          const detailBtn = event.target.closest("[data-mlff-convert-detail]");
          if (detailBtn) {
            const record = (window.__materialConversionRecords || []).find((r) => r.id === detailBtn.dataset.mlffConvertDetail);
            if (record) showToast("转换记录详情", `${record.materialName} · ${record.sourceName} → ${record.targetFormat}（${record.status}）`);
            return;
          }
          const downloadBtn = event.target.closest("[data-mlff-convert-download]");
          if (downloadBtn) {
            const record = (window.__materialConversionRecords || []).find((r) => r.id === downloadBtn.dataset.mlffConvertDownload);
            if (record) {
              triggerTwodDetailDownload(
                record.resultName || "converted.txt",
                [`Source File: ${record.sourceName}`, `Source Format: ${record.sourceFormat}`, `Target Format: ${record.targetFormat}`, `Generated At: ${record.createdAt}`].join("\n"),
                "text/plain;charset=utf-8"
              );
              showToast("文件格式转换", `${record.resultName} 已开始下载。`);
            }
            return;
          }
        });
      }

      if (document.body.dataset.mlffGlossaryPageBound !== "true") {
        document.body.dataset.mlffGlossaryPageBound = "true";
        document.body.addEventListener("click", (event) => {
          if (event.target.closest("[data-mlff-glossary-page]")) {
            state.mlffTab = "glossary";
            renderMlffModule();
            return;
          }
          const tabButton = event.target.closest("[data-mlff-glossary-page-tab]");
          if (tabButton) {
            state.mlffGlossaryTab = tabButton.dataset.mlffGlossaryPageTab;
            renderMlffModule();
            return;
          }
          if (event.target.closest("[data-mlff-glossary-back]")) {
            state.mlffTab = "search";
            renderMlffModule();
            return;
          }
          if (event.target.closest("[data-mlff-glossary-reset]")) {
            state.mlffTermKeyword = "";
            state.mlffMethodFilter = "all";
            renderMlffModule();
            return;
          }
          if (event.target.closest("[data-mlff-glossary-search]")) {
            renderMlffModule();
          }
        });
        document.body.addEventListener("input", (event) => {
          if (event.target.matches("[data-mlff-glossary-keyword]")) {
            state.mlffTermKeyword = event.target.value;
          }
          if (event.target.matches("[data-mlff-glossary-method-keyword]")) {
            state.mlffTermKeyword = event.target.value;
          }
        });
        document.body.addEventListener("change", (event) => {
          if (event.target.matches("[data-mlff-glossary-method-filter]")) {
            state.mlffMethodFilter = event.target.value;
            renderMlffModule();
          }
        });
      }

      function ensureMlffFieldUpdateState() {
        if (state.mlffFieldUpdateOpen == null) state.mlffFieldUpdateOpen = false;
        if (!state.mlffFieldUpdateView) state.mlffFieldUpdateView = "list";
        if (!state.mlffFieldUpdateSelectedId) state.mlffFieldUpdateSelectedId = "";
        if (!state.mlffFieldUpdateModalOpen) state.mlffFieldUpdateModalOpen = false;
      }

      function resetTopicApplicationEntry(moduleKey) {
        if (!["twod", "electrolyte", "opto", "mlff", "catalyst"].includes(moduleKey)) return;
        if (moduleKey === "twod") {
          state.twodTab = "search";
          state.twodHasSearched = false;
          state.twodSearchApplied = { formula: "", elements: "", materialId: "" };
          state.twodPropertyApplied = {};
          state.twodAppliedPropertyCategory = "";
          state.twodPeriodicApplied = [];
          state.twodCurrentPage = 1;
        }
        if (moduleKey === "electrolyte") {
          state.electrolyteTab = "search";
          state.electrolyteScope = "all";
          state.electrolyteCurrentPage = 1;
          if (typeof resetElectrolyteAppliedSearch === "function") resetElectrolyteAppliedSearch();
        }
        if (moduleKey === "opto") {
          state.optoTab = "search";
          state.optoCurrentPage = 1;
          state.optoAppliedSearch = { mode: "", filters: null };
        }
        if (moduleKey === "mlff") {
          state.mlffTab = "search";
          state.mlffFieldUpdateOpen = false;
          state.mlffPage = 1;
          state.mlffAppliedSearch = { mode: "", filters: null };
        }
        if (moduleKey === "catalyst") {
          state.catalystTab = "search";
          state.catalystPage = 1;
          state.catalystCurrentPage = 1;
          state.catalystAppliedSearch = { mode: "", filters: null };
        }
        setTimeout(() => {
          if (moduleKey === "twod" && typeof renderTwodModuleUnified === "function") renderTwodModuleUnified();
          if (moduleKey === "electrolyte" && typeof renderElectrolyteModule === "function") renderElectrolyteModule();
          if (moduleKey === "opto" && typeof renderOptoModule === "function") renderOptoModule();
          if (moduleKey === "mlff" && typeof renderMlffModule === "function") renderMlffModule();
          if (moduleKey === "catalyst" && typeof renderCatalystModule === "function") renderCatalystModule();
        }, 0);
      }

      if (!document.getElementById("topicApplicationSingleLineStyle")) {
        const style = document.createElement("style");
        style.id = "topicApplicationSingleLineStyle";
        style.textContent = "#page-twod table th,#page-twod table td,#page-electrolyte table th,#page-electrolyte table td,#page-opto table th,#page-opto table td,#page-mlff table th,#page-mlff table td,#page-catalyst table th,#page-catalyst table td{white-space:nowrap!important;}#page-twod .twod-record-inline-actions,#page-electrolyte .twod-record-inline-actions,#page-opto .twod-record-inline-actions,#page-mlff .twod-record-inline-actions,#page-catalyst .twod-record-inline-actions{white-space:nowrap!important;}";
        document.head.appendChild(style);
      }

      if (document.body.dataset.topicApplicationEntryBound !== "true") {
        document.body.dataset.topicApplicationEntryBound = "true";
        document.body.addEventListener("click", (event) => {
          const nav = event.target.closest(".nav-btn[data-page]");
          if (nav) resetTopicApplicationEntry(nav.dataset.page);
        });
      }

      function getMlffFieldUpdateRows() {
        return [
          { id: "atomic-charge", name: "原子电荷参数", type: "电子结构参数", source: "DFT计算", saved: "2024-01-15 14:32", updated: "2024-01-15 14:32", status: "已生效", version: "v3.2", values: [["Mulliken电荷", "-0.452", "e", "Mulliken布居分析"], ["Bader电荷", "-0.387", "e", "Bader拓扑分析"], ["Hirshfeld电荷", "-0.298", "e", "Hirshfeld布居分析"]] },
          { id: "bond-set", name: "成键参数集", type: "力场参数", source: "量子化学计算", saved: "2024-01-15 11:20", updated: "2024-01-15 11:20", status: "已生效", version: "v2.0", values: [["C-C键长", "1.42", "Å", "平衡键长"], ["键角", "120.0", "°", "平衡键角"]] },
          { id: "lj-set", name: "对势参数-LJ", type: "力场参数", source: "实验数据拟合", saved: "2024-01-14 16:45", updated: "2024-01-14 16:45", status: "已生效", version: "v1.5", values: [["epsilon", "0.152", "kcal/mol", "Lennard-Jones势阱深度"], ["sigma", "3.405", "Å", "Lennard-Jones距离参数"]] },
          { id: "dihedral-set", name: "二面角参数集", type: "力场参数", source: "量子化学计算", saved: "2024-01-14 10:15", updated: "2024-01-14 10:15", status: "已生效", version: "v1.2", values: [["扭转势系数", "0.650", "kcal/mol", "二面角拟合参数"]] },
          { id: "bohr", name: "玻尔兹曼常数", type: "物理常数", source: "CODATA推荐值", saved: "2024-01-13 09:30", updated: "2024-01-13 09:30", status: "已生效", version: "v1.0", values: [["Boltzmann常数", "1.380649e-23", "J/K", "CODATA推荐值"]] }
        ];
      }

      function getMlffFieldUpdateRow(id) {
        return getMlffFieldUpdateRows().find((item) => item.id === id) || getMlffFieldUpdateRows()[0];
      }

      function renderMlffFieldUpdatePage() {
        ensureMlffFieldUpdateState();
        const rows = getMlffFieldUpdateRows();
        if (state.mlffFieldUpdateView === "history") return renderMlffFieldUpdateHistory(getMlffFieldUpdateRow(state.mlffFieldUpdateSelectedId));
        return `
          <div class="page-head"><div><h2>场数据更新</h2><p>对现有数据进行补充和存储，支持编辑、历史记录对比与批量操作。</p></div><div class="page-tools"><button class="btn-primary" type="button" data-mlff-field-store>存入数据</button><button class="btn" type="button" data-mlff-field-batch>批量操作</button></div></div>
          <div class="twod-platform-shell">
            <section class="card twod-search-platform"><div class="twod-results-head"><div><p class="twod-result-hint">您可以通过存入按钮对现有数据库中不存在的数据进行补充和存储，进一步拓展数据库的可用性。</p></div><span class="status-badge success">已认证</span></div></section>
            <section class="card twod-search-results">
              <div class="twod-results-head"><div><h3>已存入数据列表 <span class="twod-result-count">共 ${rows.length} 条</span></h3></div><div class="twod-search-row"><button class="btn-primary" type="button" data-mlff-field-store>存入数据</button><button class="btn" type="button" data-mlff-field-batch>批量操作</button><input class="cross-db-input" placeholder="搜索数据名称或参数" data-mlff-field-keyword><button class="btn" type="button" data-mlff-field-filter>筛选</button></div></div>
              <div class="twod-platform-actions"><div class="twod-status-text">已选择 3 项</div><div class="twod-detail-actions"><button class="btn-primary" type="button" data-mlff-field-edit>批量编辑</button><button class="btn" type="button" data-mlff-field-revoke>批量撤销</button><button class="btn" type="button" data-mlff-field-clear-selection>取消选择</button></div></div>
              <div class="table-wrap twod-result-table-wrap"><table class="twod-result-table"><thead><tr><th>数据名称</th><th>参数类型</th><th>数据来源</th><th>存入时间</th><th>更新时间</th><th>状态</th><th>操作</th></tr></thead><tbody>
                ${rows.map((row) => `<tr><td><strong>${html(row.name)}</strong><span class="status-badge success">新</span></td><td>${html(row.type)}</td><td>${html(row.source)}</td><td>${html(row.saved)}</td><td>${html(row.updated)}</td><td><span class="status-badge success">${html(row.status)}</span></td><td><div class="twod-record-inline-actions"><button class="twod-action-view" type="button" data-mlff-field-edit-row="${html(row.id)}">编辑</button><button class="twod-record-link" type="button" data-mlff-field-history="${html(row.id)}">历史</button><button class="twod-record-link" type="button" data-mlff-field-revoke-row="${html(row.id)}">撤销</button></div></td></tr>`).join("")}
              </tbody></table></div>
              <div class="result-footer twod-result-footer"><span>显示 1 - ${rows.length} 条，共 ${rows.length} 条记录</span>${renderSharedPaginationFooter({ total: rows.length, currentPage: 1, totalPages: 1, pageSize: rows.length, pageSizeId: "mlffFieldPageSize", pageAttr: "data-mlff-field-page", jumpModule: "mlff" })}</div>
            </section>
          </div>
        `;
      }

      function renderMlffFieldUpdateHistory(row) {
        return `<div class="page-head"><div><h2>历史记录对比</h2><p>保存历史上传的历史记录，供用户对比参考，保证数据的有效性。</p></div><div class="page-tools"><button class="btn" type="button" data-mlff-field-history-back>返回列表</button></div></div><div class="twod-platform-shell"><section class="card twod-search-results"><div class="twod-results-head"><div><h3>${html(row.name)}</h3><p class="twod-result-hint">数据ID：MLFF-${html(row.id)}　参数类型：${html(row.type)}　数据来源：${html(row.source)}　当前版本：${html(row.version)}</p></div></div><div class="table-wrap twod-result-table-wrap"><table class="twod-result-table"><thead><tr><th>参数名称</th><th>版本 A（${html(row.version)}）</th><th>版本 B（v2.0）</th><th>差异</th></tr></thead><tbody>${row.values.map((value, index) => `<tr><td>${html(value[0])}</td><td>${html(value[1])} ${html(value[2])}</td><td>${index === 0 ? html(value[1]) + " " + html(value[2]) : "—"}</td><td><span class="status-badge success">${index === 0 ? "无差异" : "新增"}</span></td></tr>`).join("")}</tbody></table></div><div class="mlff-platform-kpis"><article class="mlff-kpi-card"><strong>2</strong><span>个参数有差异</span></article><article class="mlff-kpi-card"><strong>1</strong><span>个参数新增</span></article><article class="mlff-kpi-card"><strong>1</strong><span>个参数无变化</span></article></div><h3>历史版本记录</h3><div class="card table-card"><div class="table-wrap"><table class="twod-result-table"><tbody><tr><td><strong>v3.2</strong></td><td>更新参数数值，新增参数</td><td>2024-01-15 14:32 · 研究员</td><td><button class="btn" type="button">查看</button></td></tr><tr><td><strong>v2.0</strong></td><td>修正参数计算误差</td><td>2023-11-20 09:15 · 研究员</td><td><button class="btn" type="button">对比</button><button class="btn" type="button">查看</button></td></tr><tr><td><strong>v1.0</strong></td><td>初始版本，录入基础参数数据</td><td>2023-03-08 14:00 · 研究员</td><td><button class="btn" type="button">对比</button><button class="btn" type="button">查看</button></td></tr></tbody></table></div></div></section></div>`;
      }

      function renderMlffFieldStoreModal() {
        let modal = document.getElementById("mlffFieldStoreModal");
        if (!modal) { document.body.insertAdjacentHTML("beforeend", `<div class="overlay" id="mlffFieldStoreModal"><div class="modal modal-xl"><div class="modal-header"><div><h3>存入数据</h3><p>对现有数据进行补充和存储。</p></div><button class="modal-close" type="button" data-mlff-field-store-close>×</button></div><div class="modal-body modal-scroll" id="mlffFieldStoreBody"></div><div class="modal-footer"><button class="btn" type="button" data-mlff-field-store-close>取消</button><button class="btn" type="button">保存草稿</button><button class="btn-primary" type="button" data-mlff-field-store-submit>提交存入</button></div></div></div>`); modal = document.getElementById("mlffFieldStoreModal"); }
        modal.querySelector("#mlffFieldStoreBody").innerHTML = `<section class="card table-card"><div class="table-head"><h3>选择存入方式</h3></div><div class="twod-detail-actions"><button class="btn-primary" type="button">手动录入</button><button class="btn" type="button">文件批量上传</button></div></section><section class="card table-card"><h3>数据基本信息</h3><div class="twod-detail-property-grid"><label class="field"><span>数据名称 *</span><input value="原子电荷参数"></label><label class="field"><span>参数类型 *</span><select><option>电子结构参数</option><option>力场参数</option></select></label><label class="field"><span>数据来源 *</span><select><option>DFT计算</option><option>量子化学计算</option></select></label><label class="field"><span>英文名称</span><input value="Atomic Charge"></label><label class="field"><span>单位</span><input value="e"></label><label class="field"><span>数据精度</span><input value="1e-4"></label></div><h3>数据值录入</h3><div class="table-wrap"><table class="twod-result-table"><thead><tr><th>序号</th><th>参数名称</th><th>参数值</th><th>单位</th><th>参数说明</th><th>操作</th></tr></thead><tbody>${getMlffFieldUpdateRows()[0].values.map((value, index) => `<tr><td>${index + 1}</td><td><input value="${html(value[0])}"></td><td><input value="${html(value[1])}"></td><td>${html(value[2])}</td><td>${html(value[3])}</td><td><button class="btn" type="button">删除</button></td></tr>`).join("")}</tbody></table></div><button class="btn" type="button">+ 添加参数行</button><h3>备注信息</h3><textarea class="cross-db-input" placeholder="请输入数据备注信息"></textarea></section>`;
        modal.hidden = false;
        if (typeof openModal === "function") openModal("mlffFieldStoreModal");
      }

      if (document.body.dataset.mlffFieldUpdateBound !== "true") {
        document.body.dataset.mlffFieldUpdateBound = "true";
        document.body.addEventListener("click", (event) => {
          const updateButton = event.target.closest("[data-mlff-field-update]");
          if (updateButton) { state.mlffFieldUpdateOpen = false; state.mlffFieldUpdateSelectedId = updateButton.dataset.mlffFieldUpdate || ""; state.page = "data-submit"; document.querySelectorAll(".page").forEach((node) => node.classList.toggle("active", node.id === "page-data-submit")); document.querySelectorAll(".nav-btn").forEach((node) => node.classList.toggle("active", node.dataset.page === "data-submit")); if (typeof syncPageMeta === "function") syncPageMeta("data-submit"); setDataSubmitMaterialType("机器学习力场"); return; }
          if (state.mlffFieldUpdateOpen && event.target.closest("[data-mlff-field-store]")) {
            renderMlffFieldStoreModal();
            return;
          }
          if (state.mlffFieldUpdateOpen && (event.target.closest("[data-mlff-field-history]") || event.target.closest("[data-mlff-field-history-row]"))) {
            const trigger = event.target.closest("[data-mlff-field-history]") || event.target.closest("[data-mlff-field-history-row]");
            state.mlffFieldUpdateSelectedId = trigger.dataset.mlffFieldHistory || trigger.dataset.mlffFieldHistoryRow;
            state.mlffFieldUpdateView = "history";
            renderMlffModule();
            return;
          }
          if (state.mlffFieldUpdateOpen && event.target.closest("[data-mlff-field-history-back]")) {
            state.mlffFieldUpdateView = "list";
            renderMlffModule();
            return;
          }
          if (state.mlffFieldUpdateOpen && event.target.closest("[data-mlff-field-store-close]")) {
            const modal = document.getElementById("mlffFieldStoreModal");
            if (modal) modal.hidden = true;
            return;
          }
          if (state.mlffFieldUpdateOpen && event.target.closest("[data-mlff-field-store-submit]")) {
            const modal = document.getElementById("mlffFieldStoreModal");
            if (modal) modal.hidden = true;
            showToast("存入数据", "数据已提交存入，正在生成新版本记录。");
            return;
          }
        });
      }

      const renderModuleTabs = (module, active) => `
        <div class="module-tab-strip">
          <button class="module-tab-btn${active === "search" ? " active" : ""}" type="button" data-module-tab="${html(module)}" data-module-target="search">数据检索</button>
          ${["opto", "catalyst"].includes(module) ? "" : `<button class="module-tab-btn${active === "convert" ? " active" : ""}" type="button" data-module-tab="${html(module)}" data-module-target="convert">文件转换</button>`}
        </div>
      `;

      renderOptoModule = function renderOptoModuleUnifiedFinal() {
        if (typeof ensureUnifiedClosureState === "function") ensureUnifiedClosureState();
        ensureOptoRuntimeState();
        const page = document.getElementById("page-opto");
        if (!page) return;
        if (state.optoTab === "convert") state.optoTab = "search";
        if (state.optoTab === "convert") {
          page.innerHTML = `
            <div class="page-head"><div><h2>有机光电材料应用</h2><p>面向有机光电材料的统一检索与文件转换平台。</p></div></div>
            ${renderModuleTabs("opto", "convert")}
            ${renderMaterialConversionPanel("opto")}
          `;
          return;
        }
        ensureOptoSearchEnhancementState();
        const resultList = getOptoResultList();
        const hasApplied = true;
        const total = resultList.length;
        const totalPages = Math.max(1, Math.ceil(total / state.optoPageSize));
        state.optoCurrentPage = Math.min(state.optoCurrentPage, totalPages);
        const start = (state.optoCurrentPage - 1) * state.optoPageSize;
        const pageItems = resultList.slice(start, start + state.optoPageSize);
        page.innerHTML = `
          ${renderModuleTabs("opto", state.optoTab)}
          <div class="twod-platform-shell">
            <section class="card twod-search-platform">
              <div class="twod-mode-selector" id="optoModeSelector">
                ${Object.entries(OPTO_MODE_CONFIG).map(([key, item]) => `<button class="twod-mode-btn${state.optoSearchMode === key ? " active" : ""}" type="button" data-opto-mode="${html(key)}">${html(item.label)}</button>`).join("")}
              </div>
              <div class="twod-mode-stage" id="optoModeWorkspace">${renderOptoModeWorkspace()}</div>
            </section>
            ${hasApplied ? `
              <section class="card twod-search-results">
                <div class="twod-results-head"><div><div class="twod-result-count">找到 <strong>${total}</strong> 条相关材料</div><p class="twod-result-hint">${html(getOptoResultHint(resultList))}</p></div></div>
                ${renderCrossDatabaseToolbar(total, resultToolbars.opto)}
                <div class="table-wrap twod-result-table-wrap">
                  <table class="twod-result-table">
                    <thead><tr><th>序号</th><th>材料编号</th><th>材料简称</th><th>完整名称</th><th>英文名称</th><th>分子式</th><th>数据来源</th><th>操作</th></tr></thead>
                    <tbody>${renderOptoResultRows(pageItems)}</tbody>
                  </table>
                </div>
                <div class="result-footer twod-result-footer">${renderSharedPaginationFooter({ total, currentPage: state.optoCurrentPage, totalPages, pageSize: state.optoPageSize, pageSizeId: "optoResultPageSize", pageAttr: "data-opto-page", jumpModule: "opto" })}</div>
              </section>
            ` : ""}
          </div>
        `;
      };

      renderMlffModule = function renderMlffModuleUnifiedFinal() {
        if (typeof ensureUnifiedClosureState === "function") ensureUnifiedClosureState();
        ensureMlffRuntimeState();
        if (typeof ensureMlffPageStylesOverride === "function") ensureMlffPageStylesOverride();
        const page = document.getElementById("page-mlff");
        if (!page) return;
        ensureMlffFieldUpdateState();
        if (state.mlffFieldUpdateOpen) {
          page.innerHTML = renderMlffFieldUpdatePage();
          return;
        }
        if (state.mlffTab === "glossary") {
          page.innerHTML = renderMlffGlossaryPage();
          return;
        }
        if (state.mlffTab === "convert") {
          page.innerHTML = `
          ${renderModuleTabs("mlff", "convert")}
          ${renderMlffCurrentConversionPanel()}
          `;
          return;
        }
        const hasResults = true;
        const resultList = getMlffResultList();
        const total = resultList.length;
        const totalPages = Math.max(1, Math.ceil(total / state.mlffPageSize));
        state.mlffPage = Math.min(state.mlffPage, totalPages);
        const start = (state.mlffPage - 1) * state.mlffPageSize;
        const pageRows = resultList.slice(start, start + state.mlffPageSize);
        page.innerHTML = `
          ${renderModuleTabs("mlff", state.mlffTab)}
          <div class="twod-platform-shell">
            <section class="card twod-search-platform">
              <div class="twod-mode-selector" id="mlffModeSelector">
                ${MLFF_SEARCH_MODES.map((item) => `<button class="twod-mode-btn${state.mlffSearchMode === item.key ? " active" : ""}" type="button" data-mlff-mode="${html(item.key)}">${html(getMlffDisplayModeLabel(item.key))}</button>`).join("")}
              </div>
              <div class="twod-mode-stage" id="mlffModeWorkspace">${renderMlffModeWorkspace()}</div>
            </section>
            ${hasResults ? `
              <section class="card twod-search-results">
                <div class="twod-results-head"><div><div class="twod-result-count">找到 <strong>${total}</strong> 条相关数据</div><p class="twod-result-hint">${html(state.mlffAppliedSearch?.mode ? getMlffResultHint(resultList) : `默认展示机器学习力场数据库的全部 ${total} 条数据。`)}</p></div></div>
                ${renderCrossDatabaseToolbar(total, resultToolbars.mlff)}
                <div class="table-wrap twod-result-table-wrap">
                  <table class="twod-result-table">
                    <thead><tr><th>材料编号</th><th>中文名称</th><th>英文名称</th><th>化学式</th><th>数据集类型</th><th>数据来源</th><th>体系规模</th><th>体系类型</th><th>电荷</th><th>多极矩</th><th>极化率</th><th>色散系数</th><th>操作</th></tr></thead>
                    <tbody>${renderMlffResultRows(pageRows)}</tbody>
                  </table>
                </div>
                <div class="result-footer twod-result-footer">${renderSharedPaginationFooter({ total, currentPage: state.mlffPage, totalPages, pageSize: state.mlffPageSize, pageSizeId: "mlffPageSizeFinal", pageAttr: "data-mlff-page", jumpModule: "mlff" })}</div>
              </section>
            ` : ""}
          </div>
        `;
      };

      renderCatalystModule = function renderCatalystModuleUnifiedFinal() {
        if (typeof ensureUnifiedClosureState === "function") ensureUnifiedClosureState();
        ensureCatalystPlatformState();
        if (typeof ensureCatalystPageStylesOverride === "function") ensureCatalystPageStylesOverride();
        const page = document.getElementById("page-catalyst");
        if (!page) return;
        if (state.catalystTab === "convert") state.catalystTab = "search";
        if (state.catalystTab === "convert") {
        page.innerHTML = `
          <div class="page-head">
            <div><h2>催化材料应用</h2><p>围绕催化材料检索、位点分析、材料对比、催化构建与文件转换形成完整业务链路。</p></div>
          </div>
          ${renderModuleTabs("catalyst", "convert")}
          ${renderMaterialConversionPanel("catalyst")}
        `;
          return;
        }
        const resultList = getCatalystPlatformResults();
        const total = resultList.length;
        const hasApplied = true;
        const { totalPages, items } = getCatalystPagedPlatformResults(resultList);
        page.innerHTML = `
          ${renderModuleTabs("catalyst", state.catalystTab)}
          <div class="twod-platform-shell">
            <section class="card twod-search-platform">
              <div class="twod-mode-selector" id="catalystModeSelector">
                ${CATALYST_SEARCH_MODES.map((item) => `<button class="twod-mode-btn${state.catalystSearchMode === item.key ? " active" : ""}" type="button" data-catalyst-mode="${html(item.key)}">${html(item.label)}</button>`).join("")}
              </div>
              <div class="twod-mode-stage" id="catalystModeWorkspace">${renderCatalystPlatformWorkspace()}</div>
            </section>
            ${hasApplied ? `
              <section class="card twod-search-results">
                <div class="twod-results-head">
                  <div><div class="twod-result-count">找到 <strong>${total}</strong> 条相关数据</div><p class="twod-result-hint">${html(state.catalystAppliedSearch?.mode ? getCatalystPlatformHint(resultList) : `默认展示催化材料数据库的全部 ${total} 条数据。`)}</p></div>
                </div>
                ${renderCrossDatabaseToolbar(total, resultToolbars.catalyst)}
                <div class="table-wrap twod-result-table-wrap">
                  <table class="twod-result-table">
                    <thead><tr><th>序号</th><th>材料编号</th><th>材料名称</th><th>化学式</th><th>分类标签</th><th>材料成分</th><th>中间产物</th><th>材料描述</th><th>表面参数</th><th>数据来源</th><th>活化能</th><th>反应路径信息</th><th>操作</th></tr></thead>
                    <tbody>${renderCatalystPlatformRows(items)}</tbody>
                  </table>
                </div>
                <div class="result-footer twod-result-footer">${renderSharedPaginationFooter({ total, currentPage: state.catalystPage, totalPages, pageSize: state.catalystPageSize, pageSizeId: "catalystPageSizePlatform", pageAttr: "data-catalyst-platform-page", jumpModule: "catalyst" })}</div>
              </section>
            ` : ""}
          </div>
        `;
      };

      applyOptoSearch = function applyOptoSearchUnified() {
        ensureOptoSearchEnhancementState();
        const page = document.getElementById("page-opto");
        const mode = state.optoSearchMode || "name";
        if (["name", "formula", "code"].includes(mode)) {
          const input = page?.querySelector(`[data-opto-input="${mode}"]`);
          state.optoSearchDraft[mode] = input ? input.value : (state.optoSearchDraft[mode] || "");
        }
        if (mode === "combo") {
          syncOptoComboDraftFromDom();
        }
        const filters = mode === "combo" || mode === "property"
          ? JSON.parse(JSON.stringify(state.optoSearchDraft[mode]))
          : state.optoSearchDraft[mode];
        state.optoAppliedSearch = { mode, filters };
        state.optoCurrentPage = 1;
      };

      function syncOptoComboDraftFromDom() {
        ensureOptoSearchEnhancementState();
        const rows = [...document.querySelectorAll("#page-opto [data-opto-combo-row][data-opto-combo-role='property']")];
        if (!rows.length) return;
        const conditions = rows.map((propertySelect) => {
          const index = propertySelect.dataset.optoComboRow;
          return {
            propertyKey: propertySelect.value || OPTO_COMBO_FIELDS[0]?.key || "molecularWeight",
            operator: "range",
            min: document.querySelector(`#page-opto [data-opto-combo-row="${index}"][data-opto-combo-role="min"]`)?.value || "",
            max: document.querySelector(`#page-opto [data-opto-combo-row="${index}"][data-opto-combo-role="max"]`)?.value || ""
          };
        });
        state.optoSearchDraft.combo = { conditions };
      }

      document.body.addEventListener("input", (event) => {
        const target = event.target;
        if (!target.closest?.("#page-opto")) return;
        const row = target.getAttribute("data-opto-combo-row");
        const role = target.getAttribute("data-opto-combo-role");
        if (row == null || !role) return;
        ensureOptoSearchEnhancementState();
        const condition = state.optoSearchDraft.combo.conditions[Number(row)];
        if (!condition) return;
        if (role === "min") condition.min = target.value;
        if (role === "max") condition.max = target.value;
      });

      document.body.addEventListener("change", (event) => {
        const target = event.target;
        if (!target.closest?.("#page-opto")) return;
        const matchMode = target.getAttribute("data-opto-match-mode");
        if (matchMode) {
          ensureOptoSearchEnhancementState();
          state.optoMatchModes[matchMode] = target.value;
          return;
        }
        const row = target.getAttribute("data-opto-combo-row");
        const role = target.getAttribute("data-opto-combo-role");
        if (row == null || !role) return;
        ensureOptoSearchEnhancementState();
        const condition = state.optoSearchDraft.combo.conditions[Number(row)];
        if (!condition) return;
        if (role === "property") condition.propertyKey = target.value;
        if (role === "operator") {
          condition.operator = target.value || "range";
          if (condition.operator !== "range") condition.max = "";
        }
        if (role === "property" || role === "operator") renderOptoModule();
      });

      document.body.addEventListener("click", (event) => {
        const addButton = event.target.closest?.("[data-opto-combo-add]");
        const removeButton = event.target.closest?.("[data-opto-combo-remove]");
        if (!addButton && !removeButton) return;
        ensureOptoSearchEnhancementState();
        const conditions = state.optoSearchDraft.combo.conditions;
        if (addButton) {
          conditions.push({
            propertyKey: OPTO_COMBO_FIELDS[0]?.key || "molecularWeight",
            operator: "range",
            min: "",
            max: ""
          });
        }
        if (removeButton) {
          const index = Number(removeButton.dataset.optoComboRemove);
          state.optoSearchDraft.combo.conditions = conditions.filter((_, itemIndex) => itemIndex !== index);
          if (!state.optoSearchDraft.combo.conditions.length) {
            state.optoSearchDraft.combo.conditions.push(...createDefaultOptoComboConditions());
          }
        }
        renderOptoModule();
      });

      if (typeof filterElectrolyteMaterials === "function") {
        getElectrolyteResultList = function getElectrolyteResultListUnifiedDefault() {
          ensureElectrolyteRuntimeState();
          const { applied, hasQuery } = getElectrolyteAppliedSearchOverride();
          const baseList = state.electrolyteScope === "all"
            ? electrolyteMaterials.slice()
            : getElectrolyteCategoryMaterials(state.electrolyteCategory);
          if (!hasQuery) return baseList;
          return filterElectrolyteMaterials(applied.category, applied.mode, applied.filters, baseList);
        };
      }

      if (typeof filterCatalystPlatformResults === "function") {
        getCatalystPlatformResults = function getCatalystPlatformResultsUnifiedDefault() {
          ensureCatalystPlatformState();
          const applied = state.catalystAppliedSearch || {};
          const list = !applied.mode || !hasCatalystActiveFilters(applied.mode, applied.filters)
            ? catalystMaterials.slice()
            : filterCatalystPlatformResults(applied.mode, applied.filters);
          state.catalystBatchSelection = state.catalystBatchSelection.filter((id) => list.some((item) => item.id === id));
          return list;
        };
      }

      if (typeof refreshTwodResults === "function") {
        refreshTwodResults = function refreshTwodResultsUnifiedDefault(options = {}) {
          const body = document.getElementById("twodBaseTableBody");
          if (!body) return;
          const { resetPage = false } = options;
          state.twodHasSearched = true;
          const hasAppliedCondition = Boolean(
            String(state.twodSearchApplied?.formula || "").trim()
            || String(state.twodSearchApplied?.elements || "").trim()
            || String(state.twodSearchApplied?.materialId || "").trim()
            || (Array.isArray(state.twodPeriodicApplied) && state.twodPeriodicApplied.length)
            || state.twodAppliedPropertyCategory
          );
          const list = hasAppliedCondition ? getActiveTwodResults() : twodMaterials.slice();
          const processedList = typeof getTwodProcessedResults === "function" ? getTwodProcessedResults(list) : list.slice();
          state.twodLastResults = processedList.slice();
          renderTwodSearchResults(list, resetPage);
          const hint = hasAppliedCondition
            ? getTwodResultHint(state.twodSearchMode, processedList)
            : `默认展示二维材料数据库的全部 ${processedList.length} 条数据。`;
          const hintNode = document.getElementById("twodResultHint");
          if (hintNode) hintNode.textContent = hint;
          if (typeof setTwodResultVisibility === "function") setTwodResultVisibility(true);
        };
      }

      if (state?.page === "opto") renderOptoModule();
      if (state?.page === "mlff") renderMlffModule();
      if (state?.page === "catalyst") renderCatalystModule();
    })();
  