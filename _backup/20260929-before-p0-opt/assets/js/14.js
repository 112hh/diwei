
  (() => {
    if (window.__TWOD_PROPERTY_SEARCH_VISUAL_DOWNLOAD_READY__) return;
    window.__TWOD_PROPERTY_SEARCH_VISUAL_DOWNLOAD_READY__ = true;

    const esc = (value) => {
      if (typeof escapeLowDimHtml === "function") return escapeLowDimHtml(value);
      if (typeof escapeTwodHtml === "function") return escapeTwodHtml(value);
      return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[char]);
    };

    function ensureTwodPropertySearchV2Style() {
      if (document.getElementById("twodPropertySearchV2Style")) return;
      const style = document.createElement("style");
      style.id = "twodPropertySearchV2Style";
      style.textContent = `
        #page-twod .twod-property-field-card{min-width:0;border:1px solid #dfe6f1;border-radius:8px;background:#fff;padding:12px;box-shadow:none;}
        #page-twod .twod-property-field-card h4{display:flex;align-items:center;gap:6px;margin:0 0 10px;color:#0f2377;font-size:14px;line-height:20px;font-weight:800;}
        #page-twod .twod-property-field-card .field label{display:flex;align-items:center;gap:6px;color:#334155;font-size:13px;font-weight:700;}
        #page-twod .twod-property-field-card input,
        #page-twod .twod-property-field-card select{height:34px;border:1px solid #d9e2ef;border-radius:4px;background:#fff;color:#142033;font-size:13px;}
        #page-twod .twod-property-mini-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}
        #page-twod .twod-property-mini-grid.is-three{grid-template-columns:repeat(3,minmax(0,1fr));}
        #page-twod .twod-range-row{display:grid;grid-template-columns:minmax(0,1fr) 14px minmax(0,1fr);gap:8px;align-items:center;}
        #page-twod .twod-range-row span{color:#94a3b8;text-align:center;}
        #page-twod .twod-property-upload-row{display:flex;align-items:center;gap:8px;min-width:0;}
        #page-twod .twod-property-upload-row input[type=file]{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;}
        #page-twod .twod-property-upload-btn{display:inline-flex;align-items:center;justify-content:center;height:34px;padding:0 12px;border:1px solid #165DFF;border-radius:4px;background:#fff;color:#165DFF;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;}
        #page-twod .twod-property-upload-name{min-width:0;color:#64748b;font-size:12px;line-height:18px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        #page-twod .twod-property-help{position:relative;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border:1px solid #9db3d7;border-radius:50%;background:#f8fbff;color:#123c9c;font-size:12px;font-weight:800;cursor:help;}
        #page-twod .twod-property-help::after{content:attr(data-tip);position:absolute;left:0;top:calc(100% + 8px);z-index:2000;width:260px;padding:9px 10px;border:1px solid #cfd8e6;border-radius:6px;background:#fff;color:#334155;font-size:12px;line-height:18px;font-weight:600;box-shadow:0 12px 28px rgba(31,55,92,.14);opacity:0;visibility:hidden;transform:translateY(-4px);transition:opacity .18s ease,transform .18s ease,visibility .18s ease;white-space:normal;pointer-events:none;}
        #page-twod .twod-property-help:hover::after,#page-twod .twod-property-help:focus::after{opacity:1;visibility:visible;transform:translateY(0);}
        #page-twod-detail .twod-detail-page-action{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end;}
        @media (max-width:900px){#page-twod .twod-property-mini-grid,#page-twod .twod-property-mini-grid.is-three{grid-template-columns:1fr;}}
      `;
      document.head.appendChild(style);
    }

    function replaceTwodPropertySchemas() {
      if (typeof twodPropertySchemas === "undefined") return;
      Object.assign(twodPropertySchemas, {
        structure: {
          label: "结构特征",
          title: "结构特征",
          desc: "按材料名称、化学式、层厚、结构文件、坐标、键长键角、晶胞参数、晶系与空间群进行筛选。",
          fields: [
            { key: "name", kind: "text", title: "材料名称", label: "材料名称", placeholder: "请输入材料名称" },
            { key: "formula", kind: "text", title: "化学式", label: "化学式", placeholder: "请输入化学式" },
            { key: "layerThickness", kind: "range", title: "层厚", label: "层厚", minPlaceholder: "最小值 0.00", maxPlaceholder: "最大值 0.00", step: "0.01", precision: 2 },
            { key: "atomicStructureFile", kind: "file", title: "原子结构图", label: "原子结构图", accept: ".cif", placeholder: "请上传原子结构图（仅支持cif格式）", tip: "仅支持全字段精准匹配查询" },
            { key: "atomCoordinate", kind: "tripleNumber", title: "原子坐标", keys: ["atomX", "atomY", "atomZ"], labels: ["x", "y", "z"], step: "0.00001", precision: 5 },
            { key: "bond", kind: "pairNumber", title: "键长键角", keys: ["bondLength", "bondAngle"], labels: ["键长", "键角"], steps: ["0.01", "1"], precisions: [2, 0] },
            { key: "lattice", kind: "tripleNumber", title: "晶胞参数", keys: ["latticeA", "latticeB", "latticeC"], labels: ["晶格常数a", "晶格常数b", "晶格常数c"], step: "0.01", precision: 2 },
            { key: "crystalSystem", kind: "select", title: "晶系", label: "晶系", options: ["请选择晶系", "立方晶系", "六方晶系", "四方晶系", "三方晶系", "正交晶系", "单斜晶系", "三斜晶系"] },
            { key: "spaceGroup", kind: "text", title: "空间群", label: "空间群", placeholder: "请输入空间群" }
          ]
        },
        electronic: {
          label: "电子结构",
          title: "电子结构",
          desc: "按能带结构类型、半导体带隙、态密度与有效质量进行筛选。",
          fields: [
            { key: "bandType", kind: "select", title: "能带结构", label: "能带结构", options: ["请选择能带结构", "金属", "半导体", "绝缘体"] },
            { key: "bandGap", kind: "conditionalNumber", dependsOn: "bandType", dependsValue: "半导体", title: "带隙数值", label: "带隙数值", placeholder: "请输入带隙，两位小数", step: "0.01", precision: 2 },
            { key: "dos", kind: "text", title: "态密度", label: "电子态数目", placeholder: "请输入每单位能量单位体积的电子态数目" },
            { key: "effectiveMass", kind: "text", title: "有效质量", label: "有效质量", placeholder: "请输入有效质量" }
          ]
        },
        electrical: {
          label: "电学性质",
          title: "电学性质",
          desc: "按铁电性质、铁电极化、压电系数与电导率进行筛选。",
          fields: [
            { key: "ferroelectricState", kind: "select", title: "铁电性质", label: "铁电性质", options: ["请选择铁电性质", "具有铁电性", "不具有铁电性"] },
            { key: "ferroelectric", kind: "numberText", title: "铁电极化", label: "铁电极化", placeholder: "请输入数值" },
            { key: "piezo", kind: "numberText", title: "压电性质", label: "压电系数", placeholder: "请输入数值" },
            { key: "conductivity", kind: "numberText", title: "电导率", label: "电导率", placeholder: "请输入数值" }
          ]
        },
        magnetic: {
          label: "磁学性质",
          title: "磁学性质",
          desc: "按磁基态构型和磁转变温度 Tc 进行筛选。",
          fields: [
            { key: "magneticOrder", kind: "select", title: "磁基态构型", label: "磁基态构型", options: ["请选择磁基态构型", "铁磁", "反铁磁"] },
            { key: "transitionTemp", kind: "text", title: "磁转变温度", label: "磁转变温度 Tc", placeholder: "请输入 Tc" }
          ]
        },
        thermal: {
          label: "热学性质",
          title: "热学性质",
          desc: "按形成能、声子谱与声子态密度进行筛选。",
          fields: [
            { key: "formation", kind: "text", title: "形成能", label: "形成能", placeholder: "请输入形成能" },
            { key: "phononSpectrum", kind: "text", title: "声子谱", label: "声子谱", placeholder: "请输入声子谱信息" },
            { key: "phononDensityOfStates", kind: "text", title: "声子态密度", label: "声子态密度", placeholder: "请输入元素名称" }
          ]
        },
        mechanical: {
          label: "力学性质",
          title: "力学性质",
          desc: "按弹性常数、杨氏模量和泊松比数值进行筛选。",
          fields: [
            { key: "elasticConstants", kind: "numberText", title: "弹性常数", label: "弹性常数", placeholder: "请输入弹性常数数值" },
            { key: "young", kind: "numberText", title: "杨氏模量", label: "杨氏模量", placeholder: "请输入杨氏模量数值" },
            { key: "poisson", kind: "numberText", title: "泊松比", label: "泊松比", placeholder: "请输入泊松比数值" }
          ]
        },
        optical: {
          label: "光学性质",
          title: "光学性质",
          desc: "按介电函数、光吸收系数、反射率、折射率和消光系数数值进行筛选。",
          fields: [
            { key: "dielectric", kind: "numberText", title: "介电函数", label: "介电函数", placeholder: "请输入介电函数数值" },
            { key: "absorption", kind: "numberText", title: "光吸收系数", label: "光吸收系数", placeholder: "请输入光吸收系数数值" },
            { key: "reflectance", kind: "numberText", title: "反射率", label: "反射率", placeholder: "请输入反射率数值" },
            { key: "refractive", kind: "numberText", title: "折射率", label: "折射率", placeholder: "请输入折射率数值" },
            { key: "extinction", kind: "numberText", title: "消光系数", label: "消光系数", placeholder: "请输入消光系数数值" }
          ]
        },
        defect: {
          label: "缺陷性质",
          title: "缺陷性质",
          desc: "按空位缺陷和反位缺陷类型进行筛选。",
          fields: [
            { key: "vacancyDefectOption", kind: "select", title: "空位缺陷", label: "空位缺陷", options: ["请选择空位缺陷", "空位缺陷形成能", "空位缺陷构型", "空位缺陷形成能和空位缺陷构型"] },
            { key: "antisiteDefectOption", kind: "select", title: "反位缺陷", label: "反位缺陷", options: ["请选择反位缺陷", "反位缺陷形成能", "反位缺陷构型", "反位缺陷形成能和反位缺陷构型"] }
          ]
        }
      });
    }

    function draftValue(key) {
      return state.twodPropertyDraft?.[key] || "";
    }

    function renderTip(field) {
      return field.tip ? `<span class="twod-property-help" tabindex="0" aria-label="${esc(field.tip)}" data-tip="${esc(field.tip)}">i</span>` : "";
    }

    buildPropertyFieldCard = function buildPropertyFieldCardV2(field) {
      ensureTwodPropertySearchV2Style();
      if (field.kind === "file") {
        const fileValue = draftValue(field.key);
        return `
          <article class="twod-property-field-card">
            <h4>${esc(field.title)}${renderTip(field)}</h4>
            <div class="field">
              <label for="prop_${field.key}">${esc(field.label)}</label>
              <div class="twod-property-upload-row">
                <label class="twod-property-upload-btn" for="prop_${field.key}">上传文件</label>
                <input id="prop_${field.key}" type="file" accept="${esc(field.accept || "")}" data-prop-file="${esc(field.key)}">
                <span class="twod-property-upload-name" id="prop_${field.key}_name">${esc(fileValue || field.placeholder || "")}</span>
              </div>
            </div>
          </article>
        `;
      }
      if (field.kind === "select") {
        const selectedValue = draftValue(field.key);
        return `
          <article class="twod-property-field-card">
            <h4>${esc(field.title)}</h4>
            <div class="field">
              <label for="prop_${field.key}">${esc(field.label)}</label>
              <select id="prop_${field.key}">
                ${field.options.map((option, index) => `<option value="${index === 0 ? "" : esc(option)}" ${selectedValue === option ? "selected" : ""}>${esc(option)}</option>`).join("")}
              </select>
            </div>
          </article>
        `;
      }
      if (field.kind === "range") {
        return `
          <article class="twod-property-field-card">
            <h4>${esc(field.title)}</h4>
            <div class="field">
              <label>${esc(field.label)}</label>
              <div class="twod-range-row">
                <input id="prop_${field.key}_min" type="number" step="${field.step || "0.01"}" value="${esc(draftValue(`${field.key}_min`))}" placeholder="${esc(field.minPlaceholder || "最小值")}">
                <span>-</span>
                <input id="prop_${field.key}_max" type="number" step="${field.step || "0.01"}" value="${esc(draftValue(`${field.key}_max`))}" placeholder="${esc(field.maxPlaceholder || "最大值")}">
              </div>
            </div>
          </article>
        `;
      }
      if (field.kind === "tripleNumber") {
        return `
          <article class="twod-property-field-card">
            <h4>${esc(field.title)}</h4>
            <div class="twod-property-mini-grid is-three">
              ${field.keys.map((key, index) => `
                <div class="field">
                  <label for="prop_${key}">${esc(field.labels[index])}</label>
                  <input id="prop_${key}" type="number" step="${field.step || "0.00001"}" value="${esc(draftValue(key))}" placeholder="${esc(field.labels[index])}">
                </div>
              `).join("")}
            </div>
          </article>
        `;
      }
      if (field.kind === "pairNumber") {
        return `
          <article class="twod-property-field-card">
            <h4>${esc(field.title)}</h4>
            <div class="twod-property-mini-grid">
              ${field.keys.map((key, index) => `
                <div class="field">
                  <label for="prop_${key}">${esc(field.labels[index])}</label>
                  <input id="prop_${key}" type="number" step="${field.steps?.[index] || "0.01"}" value="${esc(draftValue(key))}" placeholder="${esc(field.labels[index])}">
                </div>
              `).join("")}
            </div>
          </article>
        `;
      }
      if (field.kind === "conditionalNumber") {
        const shouldShow = draftValue(field.dependsOn) === field.dependsValue;
        return shouldShow ? `
          <article class="twod-property-field-card">
            <h4>${esc(field.title)}</h4>
            <div class="field">
              <label for="prop_${field.key}">${esc(field.label)}</label>
              <input id="prop_${field.key}" type="number" step="${field.step || "0.01"}" value="${esc(draftValue(field.key))}" placeholder="${esc(field.placeholder || "")}">
            </div>
          </article>
        ` : "";
      }
      const inputType = field.kind === "numberText" ? "number" : "text";
      return `
        <article class="twod-property-field-card">
          <h4>${esc(field.title)}</h4>
          <div class="field">
            <label for="prop_${field.key}">${esc(field.label)}</label>
            <input id="prop_${field.key}" type="${inputType}" value="${esc(draftValue(field.key))}" placeholder="${esc(field.placeholder || "")}">
          </div>
        </article>
      `;
    };

    const originalSyncTwodPropertyDraftFromDom = typeof syncTwodPropertyDraftFromDom === "function" ? syncTwodPropertyDraftFromDom : null;
    syncTwodPropertyDraftFromDom = function syncTwodPropertyDraftFromDomV2() {
      const wrap = document.getElementById("propertyDynamicFields");
      if (!wrap) return;
      const nextDraft = {};
      wrap.querySelectorAll("input, select").forEach((node) => {
        if (!node.id || !node.id.startsWith("prop_")) return;
        const key = node.id.replace(/^prop_/, "");
        if (node.type === "file") {
          nextDraft[key] = node.files?.[0]?.name || state.twodPropertyDraft?.[key] || "";
        } else {
          nextDraft[key] = String(node.value || "").trim();
        }
      });
      state.twodPropertyDraft = nextDraft;
    };

    function toNumber(value) {
      const number = Number(String(value ?? "").trim());
      return Number.isFinite(number) ? number : null;
    }

    function normalizeText(value) {
      return String(value ?? "").trim().toLowerCase();
    }

    function roundedEqual(actual, expected, precision) {
      const a = toNumber(actual);
      const e = toNumber(expected);
      if (a == null || e == null) return false;
      const factor = Math.pow(10, precision || 2);
      return Math.round(a * factor) === Math.round(e * factor);
    }

    function getBandTypeLabel(item) {
      if (typeof getTwodResultBandType === "function") return getTwodResultBandType(item);
      const gap = toNumber(item?.bandGap);
      if (gap == null) return "";
      if (gap <= 0.05) return "金属";
      if (gap < 3) return "半导体";
      return "绝缘体";
    }

    function getItemTextValue(item, key) {
      if (key === "formula" && typeof getTwodFormulaDisplay === "function") return getTwodFormulaDisplay(item);
      if (key === "name" && typeof getTwodMaterialDisplayName === "function") return getTwodMaterialDisplayName(item);
      if (key === "ferroelectricState") {
        const value = toNumber(item?.ferroelectric);
        return value != null && value > 0 ? "具有铁电性" : "不具有铁电性";
      }
      if (key === "bandType") return getBandTypeLabel(item);
      if (key === "phononDensityOfStates") return `${item?.phononDensityOfStates || ""} ${(item?.elements || []).join(" ")}`;
      if (key === "atomicStructureFile") return `${item?.sourceCif || item?.structureFile || item?.structureFileName || ""}`;
      if (key === "vacancyDefectOption") return [item?.vacancyDefect, item?.defectEnergy, item?.defectType].filter((value) => value != null).join(" ");
      if (key === "antisiteDefectOption") return [item?.antisiteDefect].filter((value) => value != null).join(" ");
      return item?.[key] ?? "";
    }

    filterByPropertyCategory = function filterByPropertyCategoryV2(categoryKey = state.twodAppliedPropertyCategory, source = state.twodPropertyApplied) {
      if (!categoryKey) return [];
      const schema = twodPropertySchemas[categoryKey];
      if (!schema) return twodMaterials.slice();
      const appliedKeys = Array.isArray(state.twodAppliedPropertyFields)
        ? state.twodAppliedPropertyFields.filter(Boolean)
        : [];
      const activeFields = appliedKeys.length
        ? schema.fields.filter((field) => appliedKeys.includes(field.key))
        : schema.fields;
      return twodMaterials.filter((item) => activeFields.every((field) => {
        if (field.kind === "conditionalNumber" && source?.[field.dependsOn] !== field.dependsValue) return true;
        if (field.kind === "file") {
          const fileName = normalizeText(source?.[field.key]);
          if (!fileName) return true;
          return normalizeText(getItemTextValue(item, field.key)).includes(fileName.replace(/\.cif$/i, ""));
        }
        if (field.kind === "select") {
          const value = source?.[field.key] || "";
          if (!value) return true;
          if (field.key === "vacancyDefectOption") {
            const hasEnergy = item?.defectEnergy != null && String(item.defectEnergy).trim() !== "";
            const hasConfig = Boolean(String(item?.vacancyDefect || item?.defectType || "").trim());
            if (value === "空位缺陷形成能") return hasEnergy;
            if (value === "空位缺陷构型") return hasConfig;
            if (value === "空位缺陷形成能和空位缺陷构型") return hasEnergy && hasConfig;
          }
          if (field.key === "antisiteDefectOption") {
            const text = String(item?.antisiteDefect || "");
            const hasEnergy = /形成能|eV|\d/.test(text) && !/暂无/.test(text);
            const hasConfig = Boolean(text.trim()) && !/暂无/.test(text);
            if (value === "反位缺陷形成能") return hasEnergy;
            if (value === "反位缺陷构型") return hasConfig;
            if (value === "反位缺陷形成能和反位缺陷构型") return hasEnergy && hasConfig;
          }
          return normalizeText(getItemTextValue(item, field.key)) === normalizeText(value);
        }
        if (field.kind === "range") {
          const min = toNumber(source?.[`${field.key}_min`]);
          const max = toNumber(source?.[`${field.key}_max`]);
          const current = toNumber(item?.[field.key] ?? item?.interlayer ?? item?.layerThicknessNm);
          if ((min != null || max != null) && current == null) return false;
          if (min != null && current < min) return false;
          if (max != null && current > max) return false;
          return true;
        }
        if (field.kind === "tripleNumber") {
          const values = field.keys.map((key) => source?.[key]).filter((value) => String(value || "").trim());
          if (!values.length) return true;
          if (field.key === "atomCoordinate") {
            const coords = item?.atomCoordinates || item?.atomicCoordinates || [];
            return coords.some((coord) => field.keys.every((key, index) => {
              const expected = source?.[key];
              if (!String(expected || "").trim()) return true;
              const coordKey = ["x", "y", "z"][index];
              return roundedEqual(coord?.[coordKey], expected, field.precision || 5);
            }));
          }
          return field.keys.every((key) => {
            const expected = source?.[key];
            if (!String(expected || "").trim()) return true;
            return roundedEqual(item?.[key], expected, field.precision || 2);
          });
        }
        if (field.kind === "pairNumber" || field.kind === "numberText" || field.kind === "conditionalNumber") {
          const keys = field.keys || [field.key];
          return keys.every((key, index) => {
            const expected = source?.[key];
            if (!String(expected || "").trim()) return true;
            return roundedEqual(item?.[key], expected, field.precisions?.[index] ?? field.precision ?? 2);
          });
        }
        const query = normalizeText(source?.[field.key]);
        if (!query) return true;
        return normalizeText(getItemTextValue(item, field.key)).includes(query);
      }));
    };

    const originalRenderProperties = typeof renderProperties === "function" ? renderProperties : null;
    renderProperties = function renderPropertiesV2() {
      replaceTwodPropertySchemas();
      ensureTwodPropertySearchV2Style();
      if (originalRenderProperties) originalRenderProperties();
    };

    function buildAllTwodVisualChartsDownloadPayload(material) {
      const profile = typeof getTwodVisualProfile === "function" ? getTwodVisualProfile(material, state.selectedMaterialVisual) : null;
      const tabs = profile?.visualTabs || [];
      const visuals = profile?.visuals || {};
      const available = tabs.filter((item) => visuals[item.key]);
      if (!available.length) return null;
      const body = available.map((item, index) => {
        const chart = buildChartSvg(visuals[item.key]);
        const desc = typeof getTwodVisualDescription === "function" ? getTwodVisualDescription(item.key, item.label) : "";
        return `<section><h2>${index + 1}. ${esc(item.label)}</h2><p>${esc(desc)}</p><div>${chart}</div><p>${esc(visuals[item.key].caption || "")}</p></section>`;
      }).join("\n");
      return {
        filename: `${material?.id || "twod"}_all_visual_charts.html`,
        content: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${esc(material?.name || "二维材料")} 全部图表</title>
  <style>body{font-family:Arial,"Microsoft YaHei",sans-serif;margin:24px;color:#142033;background:#F2F3F5;}section{margin:0 0 18px;padding:16px;border:1px solid #dfe6f1;border-radius:8px;background:#fff;}h1{font-size:20px;}h2{font-size:16px;color:#0f2377;}p{color:#64748b;font-size:13px;line-height:1.6;}svg{max-width:100%;height:auto;}

</style>
<style id="mlff-topic-detail-20260916">
/*
 * 机器学习力场主题应用 —— 材料详情：三类结构「或」关系
 * 适用：page-mlff（低维材料主题应用 / 机器学习力场应用）→ 点击「查看详情」打开的 materialModal
 * 设计令牌沿用低维材料数据入库详情页（ldidp-*），本块只补本页特有类。
 * 全量选择器限定在 #materialModal 内，避免影响二维材料 / 有机光电 / 电解质 / 催化材料的详情弹窗。
 */

/* 结构类型主题色：分子结构（蓝） / 小体系结构（绿） / 大体系结构（橙） */
#materialModal {
  --mlff-chart-molecule: #0070F0;
  --mlff-chart-molecule-fill: rgba(0, 112, 240, .10);
  --mlff-chart-small: #0D9B70;
  --mlff-chart-small-fill: rgba(13, 155, 112, .10);
  --mlff-chart-large: #D97706;
  --mlff-chart-large-fill: rgba(217, 119, 6, .10);
}

/* ── 结构类型提示条（插在「基础信息」面板最上方） ───────────────────────── */
#materialModal .mlfftd-struct-notice {
  margin: 0 0 14px; padding: 14px 16px; border-radius: 10px;
  background: #F5F9FF; border: 1px solid #DCE8FA;
}
#materialModal .mlfftd-struct-notice[data-structure="small"] { background: #F2FBF7; border-color: #D3EEE3; }
#materialModal .mlfftd-struct-notice[data-structure="large"] { background: #FFF9F0; border-color: #F6E4C8; }
#materialModal .mlfftd-struct-notice-head {
  display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 8px;
}
#materialModal .mlfftd-struct-notice-head strong {
  font-size: 13.5px; color: #1F2637; font-weight: 700;
}
#materialModal .mlfftd-struct-notice > p {
  margin: 0; font-size: 12.5px; color: #5B6478; line-height: 1.75;
}

/* 结构类型 chip */
#materialModal .mlfftd-struct-chip {
  display: inline-flex; align-items: center; height: 24px; padding: 0 10px;
  border-radius: 999px; font-size: 12px; font-weight: 600; white-space: nowrap;
  border: 1px solid transparent;
}
#materialModal .mlfftd-struct-chip[data-structure="molecule"] { color: #0070F0; background: rgba(0, 112, 240, .10); border-color: rgba(0, 112, 240, .24); }
#materialModal .mlfftd-struct-chip[data-structure="small"]    { color: #0D9B70; background: rgba(13, 155, 112, .10); border-color: rgba(13, 155, 112, .24); }
#materialModal .mlfftd-struct-chip[data-structure="large"]    { color: #B45309; background: rgba(217, 119, 6, .12); border-color: rgba(217, 119, 6, .26); }

/* ── 结构页面：banner / 统计卡 / 图表 / 表格 ───────────────────────────── */
#materialModal .mlff-struct-banner {
  display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(0, 1.45fr); gap: 22px;
  align-items: start; padding: 16px 18px; border-radius: 12px;
  background: #fff; border: 1px solid #E8EEF6;
}
#materialModal .mlff-struct-banner-main { min-width: 0; }
#materialModal .mlff-struct-tag {
  display: inline-flex; align-items: center; height: 22px; padding: 0 9px; margin-bottom: 10px;
  border-radius: 6px; font-size: 11px; font-weight: 600; letter-spacing: .04em;
  color: #5B6478; background: #EEF2F8; text-transform: uppercase;
}
#materialModal .mlff-struct-banner-main h4 {
  margin: 0 0 8px; font-size: 15px; color: #1F2637; font-weight: 700;
}
#materialModal .mlff-struct-banner-main p {
  margin: 0; font-size: 12.5px; color: #5B6478; line-height: 1.75;
}
#materialModal .mlff-struct-facts { display: grid; gap: 10px; margin: 0; padding: 0; }
#materialModal .mlff-struct-facts > div {
  display: grid; grid-template-columns: 68px minmax(0, 1fr); gap: 12px; align-items: baseline;
}
#materialModal .mlff-struct-facts dt { margin: 0; font-size: 12px; color: #8A94A6; white-space: nowrap; }
#materialModal .mlff-struct-facts dd {
  margin: 0; font-size: 12.5px; color: #1F2637; font-weight: 600; line-height: 1.6; word-break: break-word;
}

#materialModal .mlff-stat-grid {
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-top: 14px;
}
#materialModal .mlff-stat-card {
  min-width: 0; padding: 14px 16px; border-radius: 10px;
  background: #fff; border: 1px solid #E8EEF6;
}
#materialModal .mlff-stat-card > span {
  display: block; font-size: 12px; color: #8A94A6; margin-bottom: 6px;
}
#materialModal .mlff-stat-card strong {
  display: block; font-size: 18px; color: #1F2637; font-weight: 700; line-height: 1.35; word-break: break-word;
}
#materialModal .mlff-stat-card strong em {
  font-style: normal; font-size: 12px; color: #8A94A6; font-weight: 500; margin-left: 4px;
}
#materialModal .mlff-stat-card.is-primary strong { color: #0070F0; }

#materialModal .mlff-chart-grid {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 14px;
}
#materialModal .mlff-chart-card {
  min-width: 0; padding: 14px 16px; border-radius: 10px;
  background: #fff; border: 1px solid #E8EEF6;
}
#materialModal .mlff-chart-head {
  display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-bottom: 10px;
}
#materialModal .mlff-chart-head h4 { margin: 0; font-size: 12.5px; color: #1F2637; font-weight: 600; }
#materialModal .mlff-chart-unit { font-size: 11px; color: #8A94A6; white-space: nowrap; }
#materialModal .mlff-chart svg { display: block; width: 100%; height: 76px; }
#materialModal .mlff-chart-foot {
  display: flex; justify-content: space-between; gap: 10px; margin-top: 10px;
  font-size: 11px; color: #8A94A6;
}
#materialModal .mlff-chart-foot strong { color: #3A3F47; font-weight: 600; }
#materialModal .mlff-chart-empty {
  display: flex; align-items: center; justify-content: center; height: 76px;
  font-size: 12px; color: #A6B0C0;
}

#materialModal .mlff-dist {
  display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; align-items: end;
}
#materialModal .mlff-dist-bar { min-width: 0; }
#materialModal .mlff-dist-track {
  height: 76px; border-radius: 6px; background: rgba(0, 112, 240, .08);
  display: flex; align-items: flex-end; overflow: hidden;
}
#materialModal .mlff-dist-track i {
  display: block; width: 100%; background: #0070F0; border-radius: 5px 5px 0 0;
  transition: height .25s ease;
}
#materialModal .mlff-dist[data-tone="small"] .mlff-dist-track { background: rgba(13, 155, 112, .08); }
#materialModal .mlff-dist[data-tone="small"] .mlff-dist-track i { background: #0D9B70; }
#materialModal .mlff-dist[data-tone="large"] .mlff-dist-track { background: rgba(217, 119, 6, .08); }
#materialModal .mlff-dist[data-tone="large"] .mlff-dist-track i { background: #D97706; }
#materialModal .mlff-dist-meta { margin-top: 6px; text-align: center; }
#materialModal .mlff-dist-meta strong { display: block; font-size: 12px; color: #1F2637; font-weight: 700; }
#materialModal .mlff-dist-meta span {
  display: block; font-size: 10px; color: #A6B0C0; margin-top: 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* 样例记录表：横向可滚动 + 表头吸顶 */
#materialModal .mlff-table-wrap { overflow-x: auto; border-radius: 10px; border: 1px solid #E8EEF6; }
#materialModal .mlff-table { width: max-content; min-width: 100%; border-collapse: collapse; }
#materialModal .mlff-table th,
#materialModal .mlff-table td {
  padding: 10px 14px; font-size: 12.5px; white-space: nowrap;
  border-bottom: 1px solid #EEF2F8; text-align: left;
}
#materialModal .mlff-table thead th {
  position: sticky; top: 0; z-index: 2; background: #F7F9FC;
  color: #5B6478; font-weight: 600; border-bottom: 1px solid #E8EEF6;
}
#materialModal .mlff-table tbody tr:last-child td { border-bottom: 0; }
#materialModal .mlff-table tbody tr:hover td { background: #F8FBFF; }
#materialModal .mlff-table .mlff-cell-num {
  text-align: right; font-variant-numeric: tabular-nums;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
}
#materialModal .mlff-table .mlff-cell-mark { text-align: center; }
#materialModal .mlff-check { color: #0D9B70; font-weight: 700; }

/* 卡片标题条（结构样例记录） */
#materialModal .mlff-topic-panel-head {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  margin: 18px 0 10px;
}
#materialModal .mlff-topic-panel-head h4 { margin: 0; font-size: 14px; color: #1F2637; font-weight: 700; }
#materialModal .mlff-topic-panel-head .mlff-topic-panel-tag {
  display: inline-flex; align-items: center; height: 22px; padding: 0 9px;
  border-radius: 6px; font-size: 11.5px; color: #5B6478; background: #EEF2F8; white-space: nowrap;
}

/* 响应式 */
@media (max-width: 1180px) {
  #materialModal .mlff-struct-banner { grid-template-columns: minmax(0, 1fr); gap: 18px; }
  #materialModal .mlff-chart-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  #materialModal .mlff-stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 820px) {
  #materialModal .mlff-chart-grid { grid-template-columns: minmax(0, 1fr); }
  #materialModal .mlff-stat-grid { grid-template-columns: minmax(0, 1fr); }
}
</style>

</head>
<body>
  <h1>${esc(material?.name || "二维材料")} 全部物理性质可视化图表</h1>
  ${body}'
'</body>
</html>`,
        mime: "text/html;charset=utf-8",
        label: "全部图表"
      };
    }

    const originalRenderTwodVisualizationPage = typeof renderTwodVisualizationPage === "function" ? renderTwodVisualizationPage : null;
    renderTwodVisualizationPage = function renderTwodVisualizationPageDownloadAll(material) {
      const html = originalRenderTwodVisualizationPage ? originalRenderTwodVisualizationPage(material) : "";
      if (!html || html.includes("data-twod-download-all-visuals")) return html;
      return html.replace(
        /(<div class="twod-detail-page-action">[\s\S]*?)(<\/div>\s*<\/div>)/,
        `$1<button class="btn" type="button" data-twod-download-all-visuals>下载全部图表</button>$2`
      );
    };

    document.addEventListener("change", (event) => {
      const fileInput = event.target.closest("[data-prop-file]");
      if (fileInput) {
        const key = fileInput.dataset.propFile;
        if (!state.twodPropertyDraft) state.twodPropertyDraft = {};
        state.twodPropertyDraft[key] = fileInput.files?.[0]?.name || "";
        const nameNode = document.getElementById(`prop_${key}_name`);
        if (nameNode) nameNode.textContent = state.twodPropertyDraft[key] || "请上传原子结构图（仅支持cif格式）";
        return;
      }
      if (event.target.id === "prop_bandType") {
        syncTwodPropertyDraftFromDom();
        renderProperties();
      }
    }, true);

    document.addEventListener("click", (event) => {
      if (!event.target.closest("[data-twod-download-all-visuals]")) return;
      const material = typeof getCurrentMaterial === "function" ? getCurrentMaterial() : null;
      const payload = buildAllTwodVisualChartsDownloadPayload(material);
      if (!payload) {
        if (typeof showToast === "function") showToast("下载图表", "当前材料暂无可下载图表。");
        return;
      }
      triggerTwodDetailDownload(payload.filename, payload.content, payload.mime);
      if (typeof showToast === "function") showToast("下载图表", `${material?.name || "当前材料"} 的全部图表已开始下载。`);
    }, true);

    replaceTwodPropertySchemas();
  })();
  