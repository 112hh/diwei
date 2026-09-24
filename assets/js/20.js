
    (() => {
      if (window.__TWOD_PROPERTY_FIELD_FILTER_READY__) return;
      window.__TWOD_PROPERTY_FIELD_FILTER_READY__ = true;

      state.twodPropertySelectedFields = Array.isArray(state.twodPropertySelectedFields)
        ? state.twodPropertySelectedFields
        : [];
      state.twodAppliedPropertyFields = Array.isArray(state.twodAppliedPropertyFields)
        ? state.twodAppliedPropertyFields
        : [];

      const propertyFieldKeys = (field) => {
        const keys = Array.isArray(field?.keys) ? field.keys.slice() : [];
        if (field?.key) keys.unshift(field.key);
        if (field?.kind === "range" && field?.key) keys.push(`${field.key}_min`, `${field.key}_max`);
        if (field?.dependsOn) keys.push(field.dependsOn);
        return [...new Set(keys)];
      };

      const getSchemaFields = (categoryKey = state.selectedPropertyCategory) => {
        const schema = typeof twodPropertySchemas !== "undefined" ? twodPropertySchemas[categoryKey] : null;
        return Array.isArray(schema?.fields) ? schema.fields : [];
      };

      const getSelectedFieldKeys = (categoryKey = state.selectedPropertyCategory) => {
        const available = new Set(getSchemaFields(categoryKey).map((field) => field.key));
        return [...new Set((state.twodPropertySelectedFields || []).filter((key) => available.has(key)))];
      };

      const clearDraftForField = (field) => {
        propertyFieldKeys(field).forEach((key) => {
          if (state.twodPropertyDraft) delete state.twodPropertyDraft[key];
        });
      };

      const renderFieldPicker = (schema, selectedKeys) => {
        const labels = selectedKeys.length
          ? `\u5df2\u9009 ${selectedKeys.length} \u4e2a\u5b57\u6bb5`
          : "\u8bf7\u9009\u62e9\u4e00\u4e2a\u6216\u591a\u4e2a\u5b57\u6bb5";
        return `
          <div class="twod-property-field-filter" id="propertyFieldFilter">
            <div class="twod-property-field-filter-head">
              <span class="twod-property-field-filter-label">\u7279\u5f81\u5b57\u6bb5\u7b5b\u9009</span>
              <details class="twod-property-field-dropdown">
                <summary><span class="twod-property-field-filter-summary">${labels}</span></summary>
                <div class="twod-property-field-options" role="group" aria-label="\u7279\u5f81\u5b57\u6bb5\u7b5b\u9009">
                  ${schema.fields.map((field) => `
                    <label class="twod-property-field-option" title="${escapeTwodHtml(field.title || field.label || field.key)}">
                      <input type="checkbox" value="${escapeTwodHtml(field.key)}" data-property-field-option ${selectedKeys.includes(field.key) ? "checked" : ""}>
                      <span>${escapeTwodHtml(field.title || field.label || field.key)}</span>
                    </label>
                  `).join("")}
                </div>
              </details>
            </div>
          </div>
        `;
      };

      const renderSelectedFields = (schema, selectedKeys) => {
        const fields = schema.fields.filter((field) => selectedKeys.includes(field.key));
        return fields.length
          ? fields.map((field) => buildPropertyFieldCard(field)).join("")
          : `<div class="twod-property-field-empty">\u8bf7\u5148\u5728\u4e0a\u65b9\u52fe\u9009\u4e00\u4e2a\u6216\u591a\u4e2a\u68c0\u7d22\u5b57\u6bb5</div>`;
      };

      const syncSelectedPropertyFields = () => {
        const selected = [...document.querySelectorAll("[data-property-field-option]:checked")].map((node) => node.value);
        state.twodPropertySelectedFields = selected;
        state.twodAppliedPropertyCategory = "";
        state.twodAppliedPropertyFields = [];
        state.twodPropertyApplied = {};
        state.twodHasSearched = false;
        refreshTwodResults({ resetPage: true });
      };

      const originalRenderPropertiesWithFieldFilter = typeof renderProperties === "function" ? renderProperties : null;
      renderProperties = function renderPropertiesWithFieldFilter() {
        const select = document.getElementById("propertyCategorySelect");
        const wrap = document.getElementById("propertyDynamicFields");
        if (!select || !wrap || typeof twodPropertySchemas === "undefined") {
          if (originalRenderPropertiesWithFieldFilter) originalRenderPropertiesWithFieldFilter();
          return;
        }

        const currentValue = state.selectedPropertyCategory || "";
        select.innerHTML = `
          <option value="">\u8bf7\u9009\u62e9\u6027\u8d28\u8fdb\u884c\u7b5b\u9009</option>
          ${Object.entries(twodPropertySchemas).map(([key, schema]) => `
            <option value="${escapeTwodHtml(key)}" ${currentValue === key ? "selected" : ""}>${escapeTwodHtml(schema.label)}</option>
          `).join("")}
        `;

        const pickerSlot = document.getElementById("propertyFieldFilterSlot");
        if (pickerSlot) pickerSlot.innerHTML = "";
        const oldPicker = document.getElementById("propertyFieldFilter");
        if (oldPicker) oldPicker.remove();

        if (!currentValue) {
          document.getElementById("propertyPanelTitle").textContent = "\u8bf7\u5148\u9009\u62e9\u6027\u8d28\u7c7b\u522b";
          document.getElementById("propertyPanelDesc").textContent = "\u9009\u62e9\u6027\u8d28\u7c7b\u522b\u540e\uff0c\u5148\u52fe\u9009\u9700\u8981\u68c0\u7d22\u7684\u5b57\u6bb5\uff0c\u518d\u8f93\u5165\u5bf9\u5e94\u6761\u4ef6\u3002";
          wrap.innerHTML = "";
          state.twodPropertySelectedFields = [];
          return;
        }

        const schema = twodPropertySchemas[currentValue];
        const selectedKeys = getSelectedFieldKeys(currentValue);
        state.twodPropertySelectedFields = selectedKeys;
        document.getElementById("propertyPanelTitle").textContent = schema.title;
        document.getElementById("propertyPanelDesc").textContent = "\u5148\u52fe\u9009\u4e00\u4e2a\u6216\u591a\u4e2a\u7279\u5f81\u5b57\u6bb5\uff0c\u53ea\u5c55\u793a\u5df2\u9009\u5b57\u6bb5\u7684\u68c0\u7d22\u6761\u4ef6\u3002";
        if (pickerSlot) {
          pickerSlot.innerHTML = renderFieldPicker(schema, selectedKeys);
        } else {
          wrap.insertAdjacentHTML("beforebegin", renderFieldPicker(schema, selectedKeys));
        }
        wrap.innerHTML = renderSelectedFields(schema, selectedKeys);

        document.getElementById("propertyFieldFilter")?.addEventListener("change", (event) => {
          const checkbox = event.target.closest("[data-property-field-option]");
          if (!checkbox) return;
          const field = schema.fields.find((item) => item.key === checkbox.value);
          let nextKeys = getSelectedFieldKeys(currentValue);
          if (checkbox.checked) {
            nextKeys = [...new Set([...nextKeys, checkbox.value])];
            if (field?.dependsOn) nextKeys = [...new Set([field.dependsOn, ...nextKeys])];
          } else {
            nextKeys = nextKeys.filter((key) => key !== checkbox.value);
          }
          schema.fields.forEach((item) => {
            if (!nextKeys.includes(item.key)) clearDraftForField(item);
          });
          state.twodPropertySelectedFields = nextKeys;
          renderProperties();
        });
      };

      const originalApplyTwodSearchByModeWithFieldFilter = typeof applyTwodSearchByMode === "function" ? applyTwodSearchByMode : null;
      applyTwodSearchByMode = function applyTwodSearchByModeWithFieldFilter(mode) {
        if (mode === "property") {
          const selectedKeys = getSelectedFieldKeys();
          if (!state.selectedPropertyCategory || !selectedKeys.length) {
            showToast("\u4e8c\u7ef4\u6750\u6599\u6027\u8d28\u68c0\u7d22", "\u8bf7\u5148\u52fe\u9009\u81f3\u5c11\u4e00\u4e2a\u7279\u5f81\u5b57\u6bb5\u3002");
            return false;
          }
          state.twodAppliedPropertyFields = selectedKeys.slice();
        }
        return originalApplyTwodSearchByModeWithFieldFilter
          ? originalApplyTwodSearchByModeWithFieldFilter(mode)
          : false;
      };

      const originalClearTwodSearchConditionsWithFieldFilter = typeof clearTwodSearchConditions === "function" ? clearTwodSearchConditions : null;
      clearTwodSearchConditions = function clearTwodSearchConditionsWithFieldFilter() {
        if (originalClearTwodSearchConditionsWithFieldFilter) originalClearTwodSearchConditionsWithFieldFilter();
        state.twodPropertySelectedFields = [];
        state.twodAppliedPropertyFields = [];
      };

      renderProperties();
    })();
  