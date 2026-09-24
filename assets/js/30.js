
    (() => {
      if (window.__TWOD_PROPERTY_SELECTOR_REFERENCE_READY__) return;
      window.__TWOD_PROPERTY_SELECTOR_REFERENCE_READY__ = true;

      const getAvailableFields = (categoryKey) => {
        const schema = twodPropertySchemas?.[categoryKey];
        return Array.isArray(schema?.fields) ? schema.fields : [];
      };

      const getSelectedFields = (categoryKey) => {
        const available = new Set(getAvailableFields(categoryKey).map((field) => field.key));
        return [...new Set((state.twodPropertySelectedFields || []).filter((key) => available.has(key)))];
      };

      const clearDraftForField = (field) => {
        const keys = Array.isArray(field?.keys) ? field.keys.slice() : [];
        if (field?.key) keys.unshift(field.key);
        if (field?.kind === "range" && field?.key) keys.push(`${field.key}_min`, `${field.key}_max`);
        if (field?.dependsOn) keys.push(field.dependsOn);
        keys.forEach((key) => {
          if (state.twodPropertyDraft) delete state.twodPropertyDraft[key];
        });
      };

      const renderCategoryOptions = () => `
        <div class="twod-property-category-options" id="propertyCategoryOptions" role="group" aria-label="性质类别">
          ${Object.entries(twodPropertySchemas).map(([key, schema]) => `
            <label class="twod-property-category-option" title="${escapeTwodHtml(schema.title || schema.label)}">
              <input type="checkbox" value="${escapeTwodHtml(key)}" data-property-category-option ${state.selectedPropertyCategory === key ? "checked" : ""}>
              <span>${escapeTwodHtml(schema.label)}</span>
            </label>
          `).join("")}
        </div>
      `;

      const renderFieldPicker = (schema, selectedKeys) => `
        <div class="twod-property-field-filter" id="propertyFieldFilter">
          <div class="twod-property-field-filter-head">
            <label class="twod-property-field-select-all">
              <input type="checkbox" data-property-field-select-all ${schema.fields.length && selectedKeys.length === schema.fields.length ? "checked" : ""}>
              <span>请勾选需要检索的特征字段，勾选后下方自动生成对应筛选条件</span>
            </label>
          </div>
          <div class="twod-property-field-options" role="group" aria-label="特征字段筛选">
            ${schema.fields.map((field) => `
              <label class="twod-property-field-option" title="${escapeTwodHtml(field.title || field.label || field.key)}">
                <input type="checkbox" value="${escapeTwodHtml(field.key)}" data-property-field-option ${selectedKeys.includes(field.key) ? "checked" : ""}>
                <span>${escapeTwodHtml(field.title || field.label || field.key)}</span>
              </label>
            `).join("")}
          </div>
        </div>
      `;

      renderProperties = function renderPropertiesReference() {
        const select = document.getElementById("propertyCategorySelect");
        const wrap = document.getElementById("propertyDynamicFields");
        const categoryHost = select?.closest(".twod-property-select");
        const pickerSlot = document.getElementById("propertyFieldFilterSlot");
        if (!select || !wrap || !categoryHost) return;

        const currentValue = state.selectedPropertyCategory || "";
        select.value = currentValue;
        select.setAttribute("aria-hidden", "true");
        if (!document.getElementById("propertyCategoryOptions")) {
          categoryHost.insertAdjacentHTML("beforeend", renderCategoryOptions());
        } else {
          document.getElementById("propertyCategoryOptions").outerHTML = renderCategoryOptions();
        }

        if (!currentValue) {
          document.getElementById("propertyPanelTitle").textContent = "请选择性质类别";
          document.getElementById("propertyPanelDesc").textContent = "选择性质类别后，先勾选需要检索的特征字段，再输入对应条件。";
          if (pickerSlot) pickerSlot.innerHTML = "";
          wrap.innerHTML = "";
          return;
        }

        const schema = twodPropertySchemas[currentValue];
        const selectedKeys = getSelectedFields(currentValue);
        state.twodPropertySelectedFields = selectedKeys;
        document.getElementById("propertyPanelTitle").textContent = schema.title;
        document.getElementById("propertyPanelDesc").textContent = "先勾选一个或多个特征字段，只展示已选字段的检索条件。";
        if (pickerSlot) pickerSlot.innerHTML = renderFieldPicker(schema, selectedKeys);
        wrap.innerHTML = schema.fields.filter((field) => selectedKeys.includes(field.key)).map((field) => buildPropertyFieldCard(field)).join("") || `<div class="twod-property-field-empty">请先在上方勾选一个或多个检索字段</div>`;

        pickerSlot?.querySelector("[data-property-field-select-all]")?.addEventListener("change", (event) => {
          const nextKeys = event.target.checked ? schema.fields.map((field) => field.key) : [];
          state.twodPropertySelectedFields = nextKeys;
          if (!event.target.checked) schema.fields.forEach(clearDraftForField);
          renderProperties();
        });

        pickerSlot?.querySelectorAll("[data-property-field-option]").forEach((checkbox) => {
          checkbox.addEventListener("change", () => {
            const nextKeys = getSelectedFields(currentValue).filter((key) => key !== checkbox.value);
            if (checkbox.checked) nextKeys.push(checkbox.value);
            schema.fields.forEach((field) => {
              if (!nextKeys.includes(field.key)) clearDraftForField(field);
            });
            state.twodPropertySelectedFields = [...new Set(nextKeys)];
            state.twodHasSearched = false;
            renderProperties();
          });
        });


      };

      document.body.addEventListener("change", (event) => {
        const checkbox = event.target.closest("[data-property-category-option]");
        if (!checkbox) return;
        state.selectedPropertyCategory = checkbox.checked ? checkbox.value : "";
        state.twodPropertyDraft = {};
        state.twodAppliedPropertyCategory = "";
        state.twodPropertyApplied = {};
        state.twodPropertySelectedFields = [];
        state.twodHasSearched = false;
        renderProperties();
      });

      renderProperties();
    })();
  