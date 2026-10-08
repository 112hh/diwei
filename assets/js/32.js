
    (() => {
      const esc = (value) => typeof escapeLowDimHtml === "function" ? escapeLowDimHtml(value == null ? "" : String(value)) : String(value ?? "");
      const normalize = (value) => String(value ?? "").trim().toLowerCase().replace(/[\s·•_-]+/g, "");
      const normalizeFormula = (value) => normalize(value).replace(/[（）()\[\]{}]/g, "");
      const ensure = () => {
        ensureMlffRuntimeState();
        state.mlffSearchDraft ||= {};
        state.mlffSearchDraft.nameMatchMode ||= "fuzzy";
        state.mlffSearchDraft.formulaMatchMode ||= "fuzzy";
        state.mlffAppliedSearch ||= { mode: "", filters: null };
      };
      const nameLabel = (mode) => mode === "exact" ? "准确检索" : "模糊检索";
      const formulaLabel = (mode) => ({ exact: "全结构检索", substructure: "子结构检索", fuzzy: "模糊结构检索" }[mode] || "模糊结构检索");

      const originalGetMlffResultList = getMlffResultList;
      getMlffResultList = function () {
        ensure();
        const applied = state.mlffAppliedSearch || {};
        if (!applied.mode || !applied.filters || !String(applied.filters.keyword || "").trim()) return originalGetMlffResultList();
        const keyword = applied.mode === "formula" ? normalizeFormula(applied.filters.keyword) : normalize(applied.filters.keyword);
        if (applied.mode === "name") return mlffMaterials.filter((item) => {
          const values = [item.name, item.english].map(normalize);
          return applied.filters.matchMode === "exact" ? values.some((value) => value === keyword) : values.some((value) => value.includes(keyword));
        });
        if (applied.mode === "formula") return mlffMaterials.filter((item) => {
          const formula = normalizeFormula(item.formula);
          if (applied.filters.matchMode === "exact") return formula === keyword;
          if (applied.filters.matchMode === "substructure") return formula.includes(keyword);
          return formula.includes(keyword) || keyword.includes(formula);
        });
        return originalGetMlffResultList();
      };

      applyMlffSearch = function () {
        ensure();
        const mode = state.mlffSearchMode;
        if (mode === "name") state.mlffAppliedSearch = { mode, filters: { keyword: state.mlffSearchDraft.name || "", matchMode: state.mlffSearchDraft.nameMatchMode } };
        else if (mode === "formula") state.mlffAppliedSearch = { mode, filters: { keyword: state.mlffSearchDraft.formula || "", matchMode: state.mlffSearchDraft.formulaMatchMode } };
        else state.mlffAppliedSearch = { mode, filters: { field: state.mlffSearchDraft.propertyField, keyword: state.mlffSearchDraft.propertyKeyword || "" } };
        state.mlffPage = 1;
      };

      renderMlffModeWorkspace = function () {
        ensure();
        const mode = state.mlffSearchMode || "name";
        if (mode === "property") { const field = state.mlffSearchDraft.propertyField || MLFF_PROPERTY_FIELDS[0].key; const canApply = Boolean(String(state.mlffSearchDraft.propertyKeyword || "").trim()); return `<div class="twod-mode-panel active"><div class="twod-property-panel"><div class="search-grid two"><div class="field"><label>性质数据</label><select id="mlffPropertyField">${MLFF_PROPERTY_FIELDS.map((item) => `<option value="${esc(item.key)}" ${field === item.key ? "selected" : ""}>${esc(item.label)}</option>`).join("")}</select></div><div class="field"><label>输入内容</label><input id="mlffPropertyKeyword" type="text" value="${esc(state.mlffSearchDraft.propertyKeyword || "")}" placeholder="${esc(MLFF_PROPERTY_PLACEHOLDERS[field] || "请输入对应内容")}"></div></div><div class="twod-platform-actions"><div class="twod-detail-actions"><button class="btn twod-search-reset" type="button" data-mlff-reset>重置</button><button class="btn-primary" type="button" data-mlff-apply ${canApply ? "" : "disabled"}>检索</button></div></div></div></div>`; }
        const isName = mode === "name";
        const value = isName ? state.mlffSearchDraft.name : state.mlffSearchDraft.formula;
        const matchMode = isName ? state.mlffSearchDraft.nameMatchMode : state.mlffSearchDraft.formulaMatchMode;
        const options = isName
          ? `<option value="exact" ${matchMode === "exact" ? "selected" : ""}>准确检索</option><option value="fuzzy" ${matchMode === "fuzzy" ? "selected" : ""}>模糊检索</option>`
          : `<option value="exact" ${matchMode === "exact" ? "selected" : ""}>全结构检索</option><option value="substructure" ${matchMode === "substructure" ? "selected" : ""}>子结构检索</option><option value="fuzzy" ${matchMode === "fuzzy" ? "selected" : ""}>模糊结构检索</option>`;
        return `<div class="twod-mode-panel active"><div class="twod-search-row"><label class="twod-search-input"><span>检</span><input type="text" data-mlff-mode-input="${mode}" value="${esc(value || "")}" placeholder="${isName ? "请输入化学名称，如 Water、Methanol" : "请输入分子式，如 H2O、CH3OH、C6H6"}"></label><select class="cross-db-select mlff-match-mode-select" data-mlff-${isName ? "name" : "formula"}-match-mode aria-label="${isName ? "化学名称检索方式" : "分子式检索方式"}">${options}</select><button class="btn-primary twod-search-submit" type="button" data-mlff-apply>检索</button><button class="btn twod-search-reset" type="button" data-mlff-reset>重置</button></div><div class="mlff-search-guide"><span>${isName ? "化学名称支持准确检索和模糊检索。" : "分子式支持全结构、子结构和模糊结构检索。"}</span></div></div>`;
      };

      const originalHint = getMlffResultHint;
      getMlffResultHint = function (list) {
        ensure();
        const applied = state.mlffAppliedSearch || {};
        if (!applied.mode || !applied.filters?.keyword) return originalHint(list);
        const label = applied.mode === "name" ? nameLabel(applied.filters.matchMode) : applied.mode === "formula" ? formulaLabel(applied.filters.matchMode) : "性质筛选";
        return `已按“${getMlffDisplayModeLabel(applied.mode)} / ${label}”检索到 ${list.length} 条匹配数据。`;
      };

      document.body.addEventListener("change", (event) => {
        ensure();
        if (event.target.matches("[data-mlff-name-match-mode]")) state.mlffSearchDraft.nameMatchMode = event.target.value;
        if (event.target.matches("[data-mlff-formula-match-mode]")) state.mlffSearchDraft.formulaMatchMode = event.target.value;
      });
      if (!document.getElementById("mlff-application-layout-override-20260826")) {
        const style = document.createElement("style");
        style.id = "mlff-application-layout-override-20260826";
        style.textContent = `
          #page-mlff .mlff-match-mode-select { flex: 0 0 132px; width: 132px; min-width: 132px; }          #page-mlff .twod-search-row:has(.mlff-match-mode-select) {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) 132px auto !important;
            align-items: end !important;
            flex-wrap: nowrap !important;
            overflow: visible !important;
          }
          #page-mlff .twod-search-row:has(.mlff-match-mode-select) .twod-search-input {
            width: auto !important;
            min-width: 0 !important;
            flex: none !important;
          }
          #page-mlff .twod-search-row:has(.mlff-match-mode-select) .mlff-match-mode-select {
            width: 132px !important;
            min-width: 132px !important;
            max-width: 132px !important;
            flex: none !important;
          }
          #page-mlff .twod-search-row:has(.mlff-match-mode-select) .twod-search-submit {
            width: auto !important;
            min-width: 88px !important;
            flex: none !important;
            white-space: nowrap !important;
          }
          #page-mlff .twod-search-input { flex: 1 1 auto; min-width: 0; }
          #page-mlff .twod-search-input input { width: 100%; }
          #page-mlff .mlff-match-mode-select + .twod-search-submit { flex: 0 0 auto; }
        `;
        document.head.appendChild(style);
      }
      const originalRender = renderMlffModule;
      renderMlffModule = function () { ensure(); originalRender(); };
      window.renderMlffModule = renderMlffModule;
      if (state.page === "mlff") renderMlffModule();
    })();
  