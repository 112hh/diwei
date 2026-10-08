
(() => {
  if (window.__PROP_PANEL_SCREENSHOT_READY__) return;
  window.__PROP_PANEL_SCREENSHOT_READY__ = true;

  const escHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  // ============ 共享：chip 多选渲染 ============
  function renderChipMultiSelect({ selectId, fieldLabel, fields, selectedKeys, emptyHint }) {
    const chipListHtml = (fields || []).map((field) => {
      if (!selectedKeys.includes(field.key)) return "";
      return `<span class="prop-panel-chip">
        ${escHtml(field.title || field.label || field.key)}
        <button type="button" class="prop-panel-chip-remove" data-prop-panel-chip-remove="${escHtml(field.key)}" aria-label="移除 ${escHtml(field.title || field.label || field.key)}">×</button>
      </span>`;
    }).join("");
    const dropdownHtml = `
      <details class="prop-panel-dropdown" data-prop-panel-dropdown>
        <summary class="prop-panel-dropdown-trigger" aria-label="${escHtml(fieldLabel || "添加字段")}">+ ${escHtml(emptyHint || "添加字段")}</summary>
        <div class="prop-panel-dropdown-options" role="group" aria-label="${escHtml(fieldLabel || "添加字段")}">
          ${(fields || []).map((field) => `
            <label title="${escHtml(field.title || field.label || field.key)}">
              <input type="checkbox" value="${escHtml(field.key)}" data-prop-panel-option ${selectedKeys.includes(field.key) ? "checked" : ""}>
              <span>${escHtml(field.title || field.label || field.key)}</span>
            </label>
          `).join("")}
        </div>
      </details>
    `;
    return `
      <div class="field">
        <label>${escHtml(fieldLabel || "特征字段")}</label>
        <div class="prop-panel-selected-chips" data-prop-panel-chips-host>
          ${chipListHtml}
          ${dropdownHtml}
        </div>
      </div>
    `;
  }

  function renderPropPanelTopRow({ selectId, categories, fields, selectedCategory, selectedKeys }) {
    const selectOptionsHtml = (categories || []).map((item) => {
      const value = typeof item === "object" ? item.key : item;
      const label = typeof item === "object" ? item.label : item;
      const selected = (selectedCategory === value) ? "selected" : "";
      return `<option value="${escHtml(value)}" ${selected}>${escHtml(label)}</option>`;
    }).join("");
    const fieldPicker = renderChipMultiSelect({
      selectId: selectId + "_fields",
      fieldLabel: "特征字段",
      fields,
      selectedKeys,
      emptyHint: "添加字段"
    });
    return `
      <div class="prop-panel-top-row">
        <div class="field">
          <label for="${escHtml(selectId)}">性质类别</label>
          <select id="${escHtml(selectId)}" data-prop-panel-category>
            ${selectOptionsHtml}
          </select>
        </div>
        ${fieldPicker}
      </div>
    `;
  }

  // ============ 共享：卡片渲染 ============
  function renderPropPanelCard(field, draft) {
    draft = draft || {};
    const cardTitle = field.title || field.label || field.key;
    const cardLabel = field.label || field.title || field.key;
    const fid = escHtml(field.key);

    if (field.kind === "file") {
      return `
        <article class="prop-panel-card">
          <h4>${escHtml(cardTitle)}</h4>
          <div class="field">
            <label>${escHtml(cardLabel)}</label>
            <div class="prop-panel-upload-row">
              <label class="prop-panel-upload-btn" for="prop_${fid}">上传文件</label>
              <input id="prop_${fid}" type="file" accept="${escHtml(field.accept || "")}" data-prop-panel-input="${fid}">
              <span class="prop-panel-upload-name">${escHtml(draft[field.key] || field.placeholder || "请上传文件")}</span>
            </div>
          </div>
        </article>
      `;
    }

    if (field.kind === "select") {
      const opts = (field.options || []).map((opt, index) => {
        const value = index === 0 ? "" : opt;
        const selected = String(draft[field.key] || "") === String(opt) ? "selected" : "";
        return `<option value="${escHtml(value)}" ${selected}>${escHtml(opt)}</option>`;
      }).join("");
      return `
        <article class="prop-panel-card">
          <h4>${escHtml(cardTitle)}</h4>
          <div class="field">
            <label>${escHtml(cardLabel)}</label>
            <select id="prop_${fid}" data-prop-panel-input="${fid}">
              ${opts}
            </select>
          </div>
        </article>
      `;
    }

    if (field.kind === "range") {
      return `
        <article class="prop-panel-card">
          <h4>${escHtml(cardTitle)}</h4>
          <div class="field">
            <label>${escHtml(cardLabel)}</label>
            <div class="prop-panel-range">
              <input id="prop_${fid}_min" type="number" step="${escHtml(field.step || "0.01")}" value="${escHtml(draft[`${field.key}_min`] || "")}" placeholder="${escHtml(field.minPlaceholder || "最小值")}" data-prop-panel-input="${fid}_min">
              <span>-</span>
              <input id="prop_${fid}_max" type="number" step="${escHtml(field.step || "0.01")}" value="${escHtml(draft[`${field.key}_max`] || "")}" placeholder="${escHtml(field.maxPlaceholder || "最大值")}" data-prop-panel-input="${fid}_max">
            </div>
          </div>
        </article>
      `;
    }

    if (field.kind === "tripleNumber") {
      const keys = field.keys || [];
      const labels = field.labels || [];
      return `
        <article class="prop-panel-card">
          <h4>${escHtml(cardTitle)}</h4>
          <div class="prop-panel-mini-grid">
            ${keys.map((key, index) => {
              const k = escHtml(key);
              return `
              <div class="field">
                <label>${escHtml(labels[index] || key)}</label>
                <input id="prop_${k}" type="number" step="${escHtml(field.step || "0.00001")}" value="${escHtml(draft[key] || "")}" placeholder="${escHtml(labels[index] || key)}" data-prop-panel-input="${k}">
              </div>
            `;
            }).join("")}
          </div>
        </article>
      `;
    }

    if (field.kind === "pairNumber") {
      const keys = field.keys || [];
      const labels = field.labels || [];
      return `
        <article class="prop-panel-card">
          <h4>${escHtml(cardTitle)}</h4>
          <div class="prop-panel-mini-grid is-two">
            ${keys.map((key, index) => {
              const k = escHtml(key);
              return `
              <div class="field">
                <label>${escHtml(labels[index] || key)}</label>
                <input id="prop_${k}" type="number" step="${escHtml((field.steps || [])[index] || "0.01")}" value="${escHtml(draft[key] || "")}" placeholder="${escHtml(labels[index] || key)}" data-prop-panel-input="${k}">
              </div>
            `;
            }).join("")}
          </div>
        </article>
      `;
    }

    if (field.kind === "checkRow") {
      const opts = (field.options || []);
      const current = Array.isArray(draft[field.key]) ? draft[field.key] : [];
      return `
        <article class="prop-panel-card">
          <h4>${escHtml(cardTitle)}</h4>
          <div class="field">
            <label>${escHtml(cardLabel)}</label>
            <div class="prop-panel-check-row">
              ${opts.map((opt) => {
                const checked = current.includes(opt.value) ? "checked" : "";
                return `<label><input type="checkbox" value="${escHtml(opt.value)}" data-prop-panel-input-multi="${fid}" ${checked}>${escHtml(opt.label)}</label>`;
              }).join("")}
            </div>
          </div>
        </article>
      `;
    }

    // 默认文本输入
    const inputType = field.kind === "numberText" ? "number" : "text";
    return `
      <article class="prop-panel-card">
        <h4>${escHtml(cardTitle)}</h4>
        <div class="field">
          <label>${escHtml(cardLabel)}</label>
          <input id="prop_${fid}" type="${inputType}" value="${escHtml(draft[field.key] || "")}" placeholder="${escHtml(field.placeholder || "")}" data-prop-panel-input="${fid}">
        </div>
      </article>
    `;
  }

  function renderPropPanelGrid(fields, selectedKeys, draft) {
    const selected = (fields || []).filter((field) => selectedKeys.includes(field.key));
    if (!selected.length) {
      return `<div class="prop-panel-empty">请先在上方勾选一个或多个检索字段</div>`;
    }
    return selected.map((field) => renderPropPanelCard(field, draft)).join("");
  }

  function syncPropPanelDraftFromDom(root) {
    if (!root) return {};
    const draft = {};
    root.querySelectorAll("[data-prop-panel-input]").forEach((node) => {
      const key = node.dataset.propPanelInput;
      if (node.type === "file") {
        draft[key] = node.files?.[0]?.name || draft[key] || "";
      } else {
        draft[key] = String(node.value || "").trim();
      }
    });
    const multi = {};
    root.querySelectorAll("[data-prop-panel-input-multi]:checked").forEach((node) => {
      const key = node.dataset.propPanelInputMulti;
      if (!multi[key]) multi[key] = [];
      multi[key].push(node.value);
    });
    Object.assign(draft, multi);
    return draft;
  }

  // ============ 电解质属性 schemas ============
  const ELECTROLYTE_PROPERTY_SCHEMAS = {
    organicLiquid: {
      label: "有机电解液",
      title: "有机电解液性质",
      desc: "选择特征字段后填写对应数值；输入完成后点击「检索」筛选有机电解液数据。",
      fields: [
        { key: "materialName", kind: "text", title: "材料名称", label: "材料名称", placeholder: "请输入材料名称" },
        { key: "formula", kind: "text", title: "化学式", label: "化学式", placeholder: "请输入化学式" },
        { key: "casNumber", kind: "text", title: "CAS号", label: "CAS号", placeholder: "请输入CAS号" },
        { key: "conductivity", kind: "range", title: "电导率", label: "电导率 (S/cm)", minPlaceholder: "最小值", maxPlaceholder: "最大值", step: "0.0001" },
        { key: "viscosity", kind: "range", title: "黏度", label: "黏度 (mPa·s)", minPlaceholder: "最小值", maxPlaceholder: "最大值", step: "0.01" },
        { key: "dielectric", kind: "range", title: "介电常数", label: "介电常数", minPlaceholder: "最小值", maxPlaceholder: "最大值", step: "0.01" },
        { key: "meltingPoint", kind: "range", title: "熔点", label: "熔点 (℃)", minPlaceholder: "最小值", maxPlaceholder: "最大值", step: "0.1" },
        { key: "boilingPoint", kind: "range", title: "沸点", label: "沸点 (℃)", minPlaceholder: "最小值", maxPlaceholder: "最大值", step: "0.1" },
        { key: "flashPoint", kind: "range", title: "闪点", label: "闪点 (℃)", minPlaceholder: "最小值", maxPlaceholder: "最大值", step: "0.1" },
        { key: "density", kind: "range", title: "密度", label: "密度 (g/cm³)", minPlaceholder: "最小值", maxPlaceholder: "最大值", step: "0.001" },
        { key: "molarVolume", kind: "range", title: "摩尔体积", label: "摩尔体积 (cm³/mol)", minPlaceholder: "最小值", maxPlaceholder: "最大值", step: "0.01" },
        { key: "safetyLevel", kind: "select", title: "安全等级", label: "安全等级", options: ["请选择安全等级", "低", "中", "高"] },
        { key: "spectra", kind: "checkRow", title: "图谱信息", label: "图谱信息",
          options: [
            { value: "homo", label: "HOMO 能级" },
            { value: "lumo", label: "LUMO 能级" },
            { value: "dipole", label: "偶极矩" },
            { value: "gibbs", label: "Gibbs 自由能" },
            { value: "solvation", label: "溶剂化能" }
          ]
        },
        { key: "reference", kind: "text", title: "参考文献", label: "参考文献", placeholder: "作者、期刊或DOI" }
      ]
    },
    solidOrganic: {
      label: "固态有机电解质",
      title: "固态有机电解质性质",
      desc: "选择性质类型后，勾选需要检索的特征字段并填写对应数值。",
      propertyTypes: [
        {
          key: "basicInfo",
          label: "基础信息",
          fields: [
            { key: "englishName", kind: "text", title: "英文名称", label: "英文名称", placeholder: "请输入英文名称" },
            { key: "molecularNumber", kind: "text", title: "分子编号", label: "分子编号", placeholder: "请输入分子编号" },
            { key: "formula", kind: "text", title: "分子式", label: "分子式", placeholder: "请输入分子式" },
            { key: "monomerInfo", kind: "file", title: "单体信息", label: "单体信息（是否有单体结构图）", accept: ".cif", placeholder: "请上传单体结构图", tip: "仅支持cif格式" },
            { key: "molarVolume", kind: "range", title: "摩尔体积", label: "摩尔体积", minPlaceholder: "最小值", maxPlaceholder: "最大值", step: "0.01" },
            { key: "density", kind: "range", title: "密度", label: "密度 (g/cm³)", minPlaceholder: "最小值", maxPlaceholder: "最大值", step: "0.001" },
            { key: "tg", kind: "range", title: "玻璃化转变温度", label: "Tg (℃)", minPlaceholder: "最小值", maxPlaceholder: "最大值", step: "0.1" },
            { key: "conductivity", kind: "range", title: "电导率", label: "电导率 (S/cm)", minPlaceholder: "最小值", maxPlaceholder: "最大值", step: "0.0001" }
          ]
        },
        {
          key: "computeInfo",
          label: "计算信息",
          fields: [
            { key: "heatCapacity", kind: "range", title: "摩尔热容", label: "摩尔热容 (J/mol·K)", minPlaceholder: "最小值", maxPlaceholder: "最大值", step: "0.1" },
            { key: "bindingEnergy", kind: "range", title: "结合能", label: "结合能 (kJ/mol)", minPlaceholder: "最小值", maxPlaceholder: "最大值", step: "0.1" }
          ]
        },
        {
          key: "solventRecommend",
          label: "溶解溶剂推荐",
          kind: "radio",
          options: [
            { value: "similar", label: "有相似分子推荐" },
            { value: "noSimilar", label: "无相似分子推荐" }
          ]
        }
      ]
    },
    solidInorganic: {
      label: "固态无机电解质",
      title: "固态无机电解质性质",
      desc: "选择特征字段后填写对应数值；输入完成后点击「检索」筛选固态无机电解质数据。",
      fields: [
        { key: "materialName", kind: "text", title: "材料名称", label: "材料名称", placeholder: "请输入材料名称" },
        { key: "formula", kind: "text", title: "化学式", label: "化学式", placeholder: "请输入化学式" },
        { key: "crystalSystem", kind: "select", title: "晶系", label: "晶系",
          options: ["请选择晶系", "立方晶系", "六方晶系", "四方晶系", "三方晶系", "正交晶系", "单斜晶系", "三斜晶系"] },
        { key: "spaceGroup", kind: "text", title: "空间群", label: "空间群", placeholder: "请输入空间群" },
        { key: "bandGap", kind: "range", title: "带隙", label: "带隙 (eV)", minPlaceholder: "最小值", maxPlaceholder: "最大值", step: "0.01" },
        { key: "formationEnergy", kind: "range", title: "形成能", label: "形成能 (eV/atom)", minPlaceholder: "最小值", maxPlaceholder: "最大值", step: "0.01" },
        { key: "fermiLevel", kind: "range", title: "费米能级", label: "费米能级 (eV)", minPlaceholder: "最小值", maxPlaceholder: "最大值", step: "0.01" },
        { key: "conductivity", kind: "range", title: "电导率", label: "电导率 (S/cm)", minPlaceholder: "最小值", maxPlaceholder: "最大值", step: "0.0001" },
        { key: "activationEnergy", kind: "range", title: "活化能", label: "活化能 (eV)", minPlaceholder: "最小值", maxPlaceholder: "最大值", step: "0.01" },
        { key: "spectra", kind: "checkRow", title: "图谱信息", label: "图谱信息",
          options: [
            { value: "band", label: "能带结构" },
            { value: "dos", label: "态密度" },
            { value: "xrd", label: "X射线衍射谱图" },
            { value: "absorption", label: "X射线吸收谱图" }
          ]
        },
        { key: "elements", kind: "text", title: "元素组成", label: "元素组成", placeholder: "如: Li, La, Zr, O" },
        { key: "reference", kind: "text", title: "参考文献", label: "参考文献", placeholder: "作者、期刊或DOI" }
      ]
    }
  };

  const ELECTROLYTE_CATEGORIES = ["organicLiquid", "solidOrganic", "solidInorganic"];

  function ensureElectrolyteState() {
    if (typeof state === "undefined") return null;
    state.electrolyteSelectedPropertyCategory = state.electrolyteSelectedPropertyCategory || "organicLiquid";
    state.electrolyteSelectedPropertyFields = state.electrolyteSelectedPropertyFields || {};
    state.electrolytePropertyDraft = state.electrolytePropertyDraft || {};
    state.solidOrganicPropertyType = state.solidOrganicPropertyType || "basicInfo";
    ELECTROLYTE_CATEGORIES.forEach((cat) => {
      if (!state.electrolyteSelectedPropertyFields[cat]) state.electrolyteSelectedPropertyFields[cat] = [];
      if (!state.electrolytePropertyDraft[cat]) state.electrolytePropertyDraft[cat] = {};
    });
    return state;
  }

  // ============ 渲染电解质性质面板 ============
  function renderElectrolytePropertyPanelV2() {
    ensureElectrolyteState();
    const category = (typeof state !== "undefined" && state.electrolyteCategory) || "organicLiquid";
    const schema = ELECTROLYTE_PROPERTY_SCHEMAS[category];
    const categories = ELECTROLYTE_CATEGORIES.map((cat) => ({
      key: cat,
      label: ELECTROLYTE_PROPERTY_SCHEMAS[cat].label
    }));
    state.electrolyteSelectedPropertyCategory = category;

    // 固态有机电解质：使用性质类型子分类
    if (schema.propertyTypes) {
      return renderSolidOrganicPanelV2(schema, categories, category);
    }

    // 其他类别：原有逻辑
    const fields = schema.fields;
    let selectedKeys = state.electrolyteSelectedPropertyFields[category] || [];
    const allKeys = fields.map((f) => f.key);
    selectedKeys = selectedKeys.filter((k) => allKeys.includes(k));
    state.electrolyteSelectedPropertyFields[category] = selectedKeys;

    const draft = state.electrolytePropertyDraft[category] || {};

    const topRow = renderPropPanelTopRow({
      selectId: "electrolytePropertyCategorySelect",
      categories,
      fields,
      selectedCategory: category,
      selectedKeys
    });

    const grid = renderPropPanelGrid(fields, selectedKeys, draft);

    const hasAnyFilter = selectedKeys.some((k) => {
      const field = fields.find((f) => f.key === k);
      if (!field) return false;
      if (field.kind === "range") return Boolean(draft[`${k}_min`] || draft[`${k}_max`]);
      if (field.kind === "checkRow") return Array.isArray(draft[k]) && draft[k].length > 0;
      return Boolean(draft[k]);
    });

    return `
      <div class="twod-mode-panel active">
        <div class="twod-property-panel">
          <div class="electrolyte-prop-panel-wrap" data-electrolyte-prop-panel data-electrolyte-category="${escHtml(category)}">
            ${topRow}
            <p class="prop-panel-desc">${escHtml(schema.desc)}</p>
            <div class="prop-panel-card-grid">${grid}</div>
            <div class="prop-panel-actions">
              <button class="btn" type="button" data-electrolyte-prop-reset>清空条件</button>
              <button class="btn-primary" type="button" data-electrolyte-prop-apply ${hasAnyFilter ? "" : "disabled"}>检索</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ============ 固态有机电解质专属渲染 ============
  function renderSolidOrganicPanelV2(schema, categories, category) {
    const propType = state.solidOrganicPropertyType || "basicInfo";
    state.solidOrganicPropertyType = propType;
    const ptConfig = schema.propertyTypes.find((pt) => pt.key === propType) || schema.propertyTypes[0];

    // 性质类型下拉（单独一行或与chip合并）
    const propTypeSelectHtml = `
      <div class="field">
        <label>性质类型</label>
        <select data-solid-organic-prop-type>
          ${schema.propertyTypes.map((pt) => `<option value="${escHtml(pt.key)}" ${propType === pt.key ? "selected" : ""}>${escHtml(pt.label)}</option>`).join("")}
        </select>
      </div>
    `;

    let contentHtml = "";
    let hasAnyFilter = false;

    if (ptConfig.kind === "radio") {
      // 溶解溶剂推荐：单选按钮
      const currentVal = (state.electrolytePropertyDraft[category] || {}).solventRecommend || "";
      contentHtml = `
        <div class="prop-panel-radio-group" style="padding:16px 0;">
          <span class="prop-panel-chips-label" style="margin-bottom:12px;">${escHtml(ptConfig.label)}</span>
          <div style="display:flex;gap:24px;align-items:center;">
            ${ptConfig.options.map((opt) => `
              <label class="prop-panel-radio-item" style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;font-size:14px;color:#1f3150;">
                <input type="radio" name="solventRecommend" value="${escHtml(opt.value)}" ${currentVal === opt.value ? "checked" : ""} data-prop-panel-radio="solventRecommend">
                <span>${escHtml(opt.label)}</span>
              </label>
            `).join("")}
          </div>
        </div>
      `;
      hasAnyFilter = Boolean(currentVal);
      // 性质类型单独一行 + radio内容
      return `
        <div class="twod-mode-panel active">
          <div class="twod-property-panel">
            <div class="electrolyte-prop-panel-wrap" data-electrolyte-prop-panel data-electrolyte-category="${escHtml(category)}" data-solid-organic-prop-type="${escHtml(propType)}">
              <div class="prop-panel-top-row">
                ${propTypeSelectHtml}
              </div>
              <p class="prop-panel-desc">${escHtml(schema.desc)}</p>
              ${contentHtml}
              <div class="prop-panel-actions">
                <button class="btn" type="button" data-electrolyte-prop-reset>清空条件</button>
                <button class="btn-primary" type="button" data-electrolyte-prop-apply ${hasAnyFilter ? "" : "disabled"}>检索</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // 基础信息 / 计算信息：性质类型(左) + 特征字段chip(右)
    const fields = ptConfig.fields;
    let selectedKeys = state.electrolyteSelectedPropertyFields[category] || [];
    const allKeys = fields.map((f) => f.key);
    selectedKeys = selectedKeys.filter((k) => allKeys.includes(k));
    state.electrolyteSelectedPropertyFields[category] = selectedKeys;

    const draft = state.electrolytePropertyDraft[category] || {};

    const chipsHtml = fields.map((field) => {
      if (!selectedKeys.includes(field.key)) return "";
      return `<span class="prop-panel-chip" data-prop-panel-chip>
        ${escHtml(field.title || field.label || field.key)}
        <button type="button" class="prop-panel-chip-remove" data-prop-panel-chip-remove="${escHtml(field.key)}" aria-label="移除">×</button>
      </span>`;
    }).join("");

    const dropdownHtml = `
      <details class="prop-panel-dropdown">
        <summary class="prop-panel-dropdown-trigger">+ 添加字段</summary>
        <div class="prop-panel-dropdown-options" role="group" aria-label="特征字段筛选">
          ${fields.map((field) => `
            <label title="${escHtml(field.title || field.label || field.key)}">
              <input type="checkbox" value="${escHtml(field.key)}" data-prop-panel-option ${selectedKeys.includes(field.key) ? "checked" : ""}>
              <span>${escHtml(field.title || field.label || field.key)}</span>
            </label>
          `).join("")}
        </div>
      </details>
    `;

    const chipBarHtml = `
      <span class="prop-panel-chips-label">特征字段</span>
      <div class="prop-panel-selected-chips">${chipsHtml || '<span class="prop-panel-chips-empty">请添加需要检索的字段</span>'}</div>
      ${dropdownHtml}
    `;

    const grid = renderPropPanelGrid(fields, selectedKeys, draft);

    contentHtml = `<div class="prop-panel-card-grid">${grid}</div>`;

    hasAnyFilter = selectedKeys.some((k) => {
      const field = fields.find((f) => f.key === k);
      if (!field) return false;
      if (field.kind === "range") return Boolean(draft[`${k}_min`] || draft[`${k}_max`]);
      if (field.kind === "checkRow") return Array.isArray(draft[k]) && draft[k].length > 0;
      return Boolean(draft[k]);
    });

    return `
      <div class="twod-mode-panel active">
        <div class="twod-property-panel">
          <div class="electrolyte-prop-panel-wrap" data-electrolyte-prop-panel data-electrolyte-category="${escHtml(category)}" data-solid-organic-prop-type="${escHtml(propType)}">
            <div class="prop-panel-top-row">
              ${propTypeSelectHtml}
              ${chipBarHtml}
            </div>
            <p class="prop-panel-desc">${escHtml(schema.desc)}</p>
            ${contentHtml}
            <div class="prop-panel-actions">
              <button class="btn" type="button" data-electrolyte-prop-reset>清空条件</button>
              <button class="btn-primary" type="button" data-electrolyte-prop-apply ${hasAnyFilter ? "" : "disabled"}>检索</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ============ 事件绑定 ============
  // 获取当前类别（及性质类型）下的字段列表
  function getElectrolyteFields(category) {
    const schema = ELECTROLYTE_PROPERTY_SCHEMAS[category];
    if (!schema) return [];
    if (schema.propertyTypes) {
      const pt = state.solidOrganicPropertyType || "basicInfo";
      const ptConfig = schema.propertyTypes.find((p) => p.key === pt);
      return (ptConfig && ptConfig.fields) || [];
    }
    return schema.fields || [];
  }

  function bindElectrolytePropertyPanel(root) {
    if (!root) return;
    const wrap = root.querySelector("[data-electrolyte-prop-panel]");
    if (!wrap) return;
    const category = wrap.dataset.electrolyteCategory;

    // 类别切换
    const categorySelect = wrap.querySelector("[data-prop-panel-category]");
    if (categorySelect) {
      categorySelect.addEventListener("change", (event) => {
        if (typeof state !== "undefined") {
          state.electrolyteCategory = event.target.value;
        }
        if (event.target.value === "solidOrganic") {
          const host = document.getElementById("electrolyteModeWorkspace");
          if (host) host.innerHTML = renderElectrolytePropertyPanelV2();
          bindElectrolytePropertyPanel(host);
        } else {
          if (typeof renderElectrolyteModule === "function") renderElectrolyteModule();
        }
      });
    }

    // 性质类型切换（仅固态有机电解质）
    const propTypeSelect = wrap.querySelector("[data-solid-organic-prop-type]");
    if (propTypeSelect) {
      propTypeSelect.addEventListener("change", (event) => {
        if (typeof state !== "undefined") {
          state.solidOrganicPropertyType = event.target.value;
          // 切换性质类型时清空已选字段和草稿
          state.electrolyteSelectedPropertyFields[category] = [];
          state.electrolytePropertyDraft[category] = {};
        }
        const host = document.getElementById("electrolyteModeWorkspace");
        if (host) host.innerHTML = renderElectrolytePropertyPanelV2();
        bindElectrolytePropertyPanel(host);
      });
    }

    // 单选按钮（溶解溶剂推荐）
    wrap.querySelectorAll("[data-prop-panel-radio]").forEach((radio) => {
      radio.addEventListener("change", () => {
        state.electrolytePropertyDraft[category] = state.electrolytePropertyDraft[category] || {};
        state.electrolytePropertyDraft[category].solventRecommend = radio.value;
        const applyBtn = wrap.querySelector("[data-electrolyte-prop-apply]");
        if (applyBtn) applyBtn.toggleAttribute("disabled", !radio.value);
      });
    });

    // chip 移除
    wrap.querySelectorAll("[data-prop-panel-chip-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.propPanelChipRemove;
        const cur = (state.electrolyteSelectedPropertyFields[category] || []).filter((k) => k !== key);
        state.electrolyteSelectedPropertyFields[category] = cur;
        const fields = getElectrolyteFields(category);
        const field = fields.find((f) => f.key === key);
        if (field) {
          if (field.kind === "range") {
            delete state.electrolytePropertyDraft[category][`${key}_min`];
            delete state.electrolytePropertyDraft[category][`${key}_max`];
          } else {
            delete state.electrolytePropertyDraft[category][key];
          }
        }
        const host = document.getElementById("electrolyteModeWorkspace");
        if (host) host.innerHTML = renderElectrolytePropertyPanelV2();
        bindElectrolytePropertyPanel(host);
      });
    });

    // 下拉选项切换
    wrap.querySelectorAll("[data-prop-panel-option]").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const cur = new Set(state.electrolyteSelectedPropertyFields[category] || []);
        if (checkbox.checked) cur.add(checkbox.value);
        else cur.delete(checkbox.value);
        state.electrolyteSelectedPropertyFields[category] = Array.from(cur);
        const host = document.getElementById("electrolyteModeWorkspace");
        if (host) host.innerHTML = renderElectrolytePropertyPanelV2();
        bindElectrolytePropertyPanel(host);
      });
    });

    // 输入监听
    wrap.querySelectorAll("[data-prop-panel-input], [data-prop-panel-input-multi]").forEach((node) => {
      const handler = () => {
        state.electrolytePropertyDraft[category] = syncPropPanelDraftFromDom(wrap);
        const applyBtn = wrap.querySelector("[data-electrolyte-prop-apply]");
        const fields = getElectrolyteFields(category);
        const hasAnyFilter = (state.electrolyteSelectedPropertyFields[category] || []).some((k) => {
          const field = fields.find((f) => f.key === k);
          if (!field) return false;
          if (field.kind === "range") return Boolean(state.electrolytePropertyDraft[category][`${k}_min`] || state.electrolytePropertyDraft[category][`${k}_max`]);
          if (field.kind === "checkRow") return Array.isArray(state.electrolytePropertyDraft[category][k]) && state.electrolytePropertyDraft[category][k].length > 0;
          return Boolean(state.electrolytePropertyDraft[category][k]);
        });
        if (applyBtn) applyBtn.toggleAttribute("disabled", !hasAnyFilter);
      };
      node.addEventListener("input", handler);
      node.addEventListener("change", handler);
    });

    // 文件上传
    wrap.querySelectorAll("[data-prop-panel-input][type='file']").forEach((fileInput) => {
      fileInput.addEventListener("change", () => {
        const key = fileInput.dataset.propPanelInput;
        state.electrolytePropertyDraft[category] = state.electrolytePropertyDraft[category] || {};
        state.electrolytePropertyDraft[category][key] = fileInput.files?.[0]?.name || "";
        const nameNode = fileInput.parentElement.querySelector(".prop-panel-upload-name");
        if (nameNode) nameNode.textContent = state.electrolytePropertyDraft[category][key] || "请上传文件";
      });
    });

    // 清空条件
    wrap.querySelector("[data-electrolyte-prop-reset]")?.addEventListener("click", () => {
      state.electrolyteSelectedPropertyFields[category] = [];
      state.electrolytePropertyDraft[category] = {};
      const host = document.getElementById("electrolyteModeWorkspace");
      if (host) host.innerHTML = renderElectrolytePropertyPanelV2();
      bindElectrolytePropertyPanel(host);
    });

    // 检索
    wrap.querySelector("[data-electrolyte-prop-apply]")?.addEventListener("click", () => {
      state.electrolytePropertyDraft[category] = syncPropPanelDraftFromDom(wrap);
      if (typeof state !== "undefined") {
        state.electrolyteSearchDrafts = state.electrolyteSearchDrafts || {};
        state.electrolyteSearchDrafts[category] = state.electrolyteSearchDrafts[category] || {};
        state.electrolyteSearchDrafts[category].property = state.electrolytePropertyDraft[category];
        state.electrolyteCurrentPage = 1;
      }
      if (typeof showToast === "function") showToast("性质数据检索", `${ELECTROLYTE_PROPERTY_SCHEMAS[category].label}性质检索条件已应用。`);
      if (typeof renderElectrolyteModule === "function") renderElectrolyteModule();
    });
  }

  // 接管 renderElectrolyteModeWorkspace 中的 property 分支
  const previousElectrolyteModeWorkspace = typeof renderElectrolyteModeWorkspace === "function"
    ? renderElectrolyteModeWorkspace
    : null;
  if (previousElectrolyteModeWorkspace) {
    window.renderElectrolyteModeWorkspaceV2 = previousElectrolyteModeWorkspace;
    renderElectrolyteModeWorkspace = function (category, mode) {
      // 仅固态有机电解质的性质检索使用 chip 面板，其他类别走原始逻辑
      if (mode === "property" && category === "solidOrganic") {
        return renderElectrolytePropertyPanelV2();
      }
      return previousElectrolyteModeWorkspace(category, mode);
    };
  }

  // 绑定事件：每次电解质模块渲染后给电解质工作区绑定chip事件
  const previousElectrolyteModule = typeof renderElectrolyteModule === "function"
    ? renderElectrolyteModule
    : null;
  if (previousElectrolyteModule) {
    window.renderElectrolyteModuleV2 = previousElectrolyteModule;
    renderElectrolyteModule = function () {
      previousElectrolyteModule.apply(this, arguments);
      // 重新绑定工作区事件
      setTimeout(() => {
        const host = document.getElementById("electrolyteModeWorkspace");
        if (host && host.querySelector("[data-electrolyte-prop-panel]")) {
          bindElectrolytePropertyPanel(host);
        }
      }, 0);
    };
  }

  // ============ 2D 性质面板适配 ============
  // 适配 2D 性质面板的 renderFieldPicker，输出chip多选
  const previousRenderProperties = typeof renderProperties === "function"
    ? renderProperties
    : null;

  function getTwodSchema(categoryKey) {
    if (typeof twodPropertySchemas === "undefined") return null;
    return twodPropertySchemas[categoryKey];
  }

  // 填充性质类别下拉框的 <option>（renderPropertiesReference 不填充 select）
  function populateTwodCategorySelect() {
    const select = document.getElementById("propertyCategorySelect");
    if (!select || typeof twodPropertySchemas === "undefined") return;
    const currentValue = (typeof state !== "undefined" && state.selectedPropertyCategory) || "";
    const hasOptions = select.querySelectorAll("option").length > 0;
    const currentSelected = select.value;
    // 如果已有 option 且值匹配，不需要重建
    if (hasOptions && currentSelected === currentValue) return;
    select.innerHTML = '<option value="">请选择性质类别</option>' +
      Object.entries(twodPropertySchemas).map(([key, schema]) => {
        const lbl = escHtml(schema.label || schema.title || key);
        return `<option value="${escHtml(key)}" ${currentValue === key ? "selected" : ""}>${lbl}</option>`;
      }).join("");
    select.value = currentValue;
    select.removeAttribute("aria-hidden");
  }

  function renderTwodChipBarIntoSlot(slot, schema, selectedKeys) {
    if (!slot || !schema) return;
    const selectedArr = (selectedKeys || []).filter((k) => schema.fields.some((f) => f.key === k));

    const chipsHtml = schema.fields.map((field) => {
      if (!selectedArr.includes(field.key)) return "";
      return `<span class="prop-panel-chip" data-twod-chip>
        ${escHtml(field.title || field.label || field.key)}
        <button type="button" class="prop-panel-chip-remove" data-twod-chip-remove="${escHtml(field.key)}" aria-label="移除 ${escHtml(field.title || field.label || field.key)}">×</button>
      </span>`;
    }).join("");

    const dropdownHtml = `
      <details class="prop-panel-dropdown" data-twod-prop-dropdown>
        <summary class="prop-panel-dropdown-trigger">+ 添加字段</summary>
        <div class="prop-panel-dropdown-options" role="group" aria-label="特征字段筛选">
          ${schema.fields.map((field) => `
            <label title="${escHtml(field.title || field.label || field.key)}">
              <input type="checkbox" value="${escHtml(field.key)}" data-twod-prop-option ${selectedArr.includes(field.key) ? "checked" : ""}>
              <span>${escHtml(field.title || field.label || field.key)}</span>
            </label>
          `).join("")}
        </div>
      </details>
    `;

    slot.innerHTML = '<span class="prop-panel-chips-label">特征字段</span>' +
      '<div class="prop-panel-selected-chips">' +
      (chipsHtml || '<span class="prop-panel-chips-empty" style="color:#94a3b8;font-size:13px;">请添加需要检索的字段</span>') +
      '</div>' +
      dropdownHtml;

    slot.querySelectorAll("[data-twod-chip-remove]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const key = btn.dataset.twodChipRemove;
        if (typeof state !== "undefined") {
          state.twodPropertySelectedFields = (state.twodPropertySelectedFields || []).filter((k) => k !== key);
          const field = schema.fields.find((f) => f.key === key);
          if (field && state.twodPropertyDraft) {
            if (field.kind === "range") {
              delete state.twodPropertyDraft[`${key}_min`];
              delete state.twodPropertyDraft[`${key}_max`];
            } else if (field.kind === "tripleNumber" || field.kind === "pairNumber") {
              (field.keys || []).forEach((k) => delete state.twodPropertyDraft[k]);
            } else {
              delete state.twodPropertyDraft[key];
            }
          }
          state.twodHasSearched = false;
        }
        // 调用 renderProperties（即 wrapper）而非 previousRenderProperties，
        // 这样 chip bar 会在 setTimeout 中重新注入
        if (typeof renderProperties === "function") renderProperties();
      });
    });

    slot.querySelectorAll("[data-twod-prop-option]").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const cur = new Set(state.twodPropertySelectedFields || []);
        if (checkbox.checked) cur.add(checkbox.value);
        else cur.delete(checkbox.value);
        state.twodPropertySelectedFields = Array.from(cur);
        state.twodHasSearched = false;
        if (typeof renderProperties === "function") renderProperties();
      });
    });
  }

  // 包装 renderProperties：先填充select，再调原始，最后注入chip
  if (previousRenderProperties) {
    window.renderPropertiesScreenshot = previousRenderProperties;
    renderProperties = function () {
      // 1. 先填充 select 的 option（renderPropertiesReference 不做这件事）
      populateTwodCategorySelect();
      // 2. 调用原始渲染逻辑（renderPropertiesReference）
      previousRenderProperties.apply(this, arguments);
      // 3. 异步注入 chip bar 到 slot
      setTimeout(() => {
        // renderPropertiesReference 会设 aria-hidden="true"，移除它让 select 可见
        const sel = document.getElementById("propertyCategorySelect");
        if (sel) sel.removeAttribute("aria-hidden");
        const slot = document.getElementById("propertyFieldFilterSlot");
        if (slot) {
          const category = (typeof state !== "undefined" && state.selectedPropertyCategory) || "";
          const schema = getTwodSchema(category);
          if (schema) {
            renderTwodChipBarIntoSlot(slot, schema, state.twodPropertySelectedFields || []);
          } else {
            // 没有选择类别时，清空slot
            slot.innerHTML = '<span class="prop-panel-chips-label">特征字段</span>' +
              '<div class="prop-panel-selected-chips">' +
              '<span class="prop-panel-chips-empty" style="color:#94a3b8;font-size:13px;">请先选择性质类别</span>' +
              '</div>';
          }
        }
      }, 0);
    };
  }

  // ============ 暴露接口 ============
  window.__propPanelScreenshot = {
    renderElectrolytePropertyPanel: renderElectrolytePropertyPanelV2,
    bindElectrolytePropertyPanel,
    ELECTROLYTE_PROPERTY_SCHEMAS,
    ELECTROLYTE_CATEGORIES
  };
})();
