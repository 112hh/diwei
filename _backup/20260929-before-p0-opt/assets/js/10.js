
  (function () {
    "use strict";

    const REQUIRED_FIELDS = new Set(["materialName", "formula"]);
    const UPLOAD_FIELD_GROUPS = [
      {
        title: "基础信息",
        fields: [
          { key: "materialId", label: "材料编号", placeholder: "请输入材料编号，如 2D-MoS2-001" },
          { key: "materialName", label: "材料名称", placeholder: "请输入材料名称", required: true },
          { key: "formula", label: "化学式", placeholder: "请输入化学式，如 MoS2", required: true },
          { key: "bandGap", label: "带隙", unit: "eV", placeholder: "请输入" },
          { key: "formation", label: "形成能", unit: "eV/atom", placeholder: "请输入" },
          { key: "density_g_cm3", label: "密度", unit: "g/cm3", placeholder: "请输入" },
          { key: "volume_ang3", label: "晶胞体积", unit: "A3", placeholder: "请输入" },
          { key: "elementsText", label: "元素组成", placeholder: "请输入，如 Mo, S" },
          { key: "source", label: "数据来源", type: "select", options: ["", "自有数据集", "公开数据集"] }
        ]
      },
      {
        title: "结构特征",
        fields: [
          { key: "latticeA", label: "晶格常数 a", unit: "A", placeholder: "请输入" },
          { key: "latticeB", label: "晶格常数 b", unit: "A", placeholder: "请输入" },
          { key: "latticeC", label: "晶格常数 c", unit: "A", placeholder: "请输入" },
          { key: "latticeAlpha", label: "夹角 α", unit: "deg", placeholder: "请输入" },
          { key: "latticeBeta", label: "夹角 β", unit: "deg", placeholder: "请输入" },
          { key: "latticeGamma", label: "夹角 γ", unit: "deg", placeholder: "请输入" },
          { key: "layerThickness", label: "层厚", unit: "A", placeholder: "请输入" },
          { key: "crystalSystem", label: "晶系", type: "select", options: ["", "立方晶系", "六方晶系", "四方晶系", "三方晶系", "正交晶系", "单斜晶系", "三斜晶系"] },
          { key: "spaceGroup", label: "空间群", placeholder: "请输入" },
          { key: "atomicCoordinatesText", label: "原子坐标", type: "textarea", wide: true, placeholder: "每行一个原子，如 Mo 0.000 0.000 0.500" },
          { key: "bondLengthAngle", label: "键长键角", type: "textarea", wide: true, placeholder: "请输入键长、键角信息" }
        ]
      },
      {
        title: "电子结构",
        fields: [
          { key: "bandType", label: "能带结构类型", type: "select", options: ["", "金属", "半导体", "绝缘体", "直接带隙半导体"] },
          { key: "dos", label: "态密度", unit: "states/eV", placeholder: "请输入" },
          { key: "effectiveMass", label: "有效质量", unit: "cm2 V-1 s-1", placeholder: "请输入" },
          { key: "bandChart", label: "能带图", placeholder: "请输入图谱文件名或链接" },
          { key: "dosPlot", label: "态密度图", placeholder: "请输入图谱文件名或链接" }
        ]
      },
      {
        title: "电学性质",
        fields: [
          { key: "ferroelectricText", label: "铁电性质", type: "select", options: ["", "具有铁电性", "不具有铁电性"] },
          { key: "ferroelectric", label: "铁电极化", unit: "μC/cm2", placeholder: "请输入" },
          { key: "piezo", label: "压电系数", unit: "pC/N", placeholder: "请输入" },
          { key: "piezoTensor", label: "压电张量/系数", placeholder: "如 e11 = 362 pC/m，d11 = 3.65 pm/V" }
        ]
      },
      {
        title: "磁学性质",
        fields: [
          { key: "magneticOrder", label: "磁基态构型", type: "select", options: ["", "铁磁", "反铁磁", "非磁性", "弱铁磁"] },
          { key: "magnetization", label: "磁矩", unit: "μB", placeholder: "请输入" },
          { key: "transitionTemp", label: "磁转变温度 Tc", unit: "K", placeholder: "请输入" },
          { key: "magneticGroundStateImage", label: "磁基态构型图", placeholder: "请输入图谱文件名或链接" }
        ]
      },
      {
        title: "热学性质",
        fields: [
          { key: "phononSpectrum", label: "声子谱", placeholder: "请输入声学支/光学支或虚频信息" },
          { key: "phononDos", label: "声子态密度", placeholder: "请输入振动贡献说明" },
          { key: "phononDispersionImage", label: "声子谱图", placeholder: "请输入图谱文件名或链接" },
          { key: "phononDosImage", label: "声子态密度图", placeholder: "请输入图谱文件名或链接" }
        ]
      },
      {
        title: "力学性质",
        fields: [
          { key: "elasticConstants", label: "弹性常数", placeholder: "如 C11=289.8 N/m，C12=63.7 N/m" },
          { key: "young", label: "杨氏模量", unit: "N/m", placeholder: "请输入" },
          { key: "poisson", label: "泊松比", placeholder: "请输入" }
        ]
      },
      {
        title: "光学性质",
        fields: [
          { key: "dielectric", label: "介电函数", placeholder: "请输入" },
          { key: "absorption", label: "光吸收系数", unit: "cm-1", placeholder: "请输入" },
          { key: "reflectance", label: "反射率", unit: "%", placeholder: "请输入" },
          { key: "refractive", label: "折射率", placeholder: "请输入" },
          { key: "extinction", label: "消光系数", placeholder: "请输入" },
          { key: "dielectricFunctionImage", label: "介电函数图", placeholder: "请输入图谱文件名或链接" },
          { key: "opticalAbsorptionImage", label: "光吸收系数图", placeholder: "请输入图谱文件名或链接" },
          { key: "reflectanceImage", label: "反射率图", placeholder: "请输入图谱文件名或链接" },
          { key: "refractiveIndexImage", label: "折射率图", placeholder: "请输入图谱文件名或链接" },
          { key: "extinctionCoefficientImage", label: "消光系数图", placeholder: "请输入图谱文件名或链接" }
        ]
      },
      {
        title: "缺陷性质",
        fields: [
          { key: "defectType", label: "空位缺陷", placeholder: "请输入空位缺陷类型/数量" },
          { key: "antisiteDefect", label: "反位缺陷", placeholder: "请输入反位缺陷类型/数量" },
          { key: "defectEnergy", label: "缺陷形成能", unit: "eV", placeholder: "请输入" },
          { key: "defectFormationEnergyImage", label: "缺陷形成能图", placeholder: "请输入图谱文件名或链接" },
          { key: "defectStructureImage", label: "缺陷结构图", placeholder: "请输入图谱文件名或链接" }
        ]
      }
    ];

    function esc(value) {
      return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
        return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
      });
    }

    function getWorkbenchState() {
      return window.__dataSubmitWorkbenchState || null;
    }

    function getFieldValue(key) {
      const state = getWorkbenchState();
      return state && state.fields ? state.fields[key] || "" : "";
    }

    function renderAlignedField(field) {
      const id = "twodUpload" + field.key.replace(/[^a-zA-Z0-9]/g, "_");
      const cls = [
        "data-submit-field",
        field.wide ? "is-wide" : "",
        REQUIRED_FIELDS.has(field.key) ? "twod-upload-required" : "is-optional"
      ].filter(Boolean).join(" ");
      const label = '<label for="' + esc(id) + '">' + esc(field.label) + '</label>';
      if (field.type === "select") {
        return '<div class="' + cls + '">' + label + '<select id="' + esc(id) + '" data-workbench-field="' + esc(field.key) + '">' +
          (field.options || []).map(function (option) {
            const value = option || "";
            const selected = getFieldValue(field.key) === value ? " selected" : "";
            return '<option value="' + esc(value) + '"' + selected + '>' + esc(option || "请选择") + '</option>';
          }).join("") +
          '</select></div>';
      }
      if (field.type === "textarea") {
        return '<div class="' + cls + '">' + label + '<textarea id="' + esc(id) + '" data-workbench-field="' + esc(field.key) + '" placeholder="' + esc(field.placeholder || "请输入") + '">' + esc(getFieldValue(field.key)) + '</textarea></div>';
      }
      const input = '<input id="' + esc(id) + '" data-workbench-field="' + esc(field.key) + '" value="' + esc(getFieldValue(field.key)) + '" placeholder="' + esc(field.placeholder || "请输入") + '">';
      return '<div class="' + cls + '">' + label + (field.unit ? '<div class="data-submit-input-unit">' + input + '<span>' + esc(field.unit) + '</span></div>' : input) + '</div>';
    }

    function renderAlignedTwodUploadForm() {
      return '<h3 class="data-submit-stage-title">填写材料信息</h3><div class="data-submit-form twod-upload-aligned-form">' +
        UPLOAD_FIELD_GROUPS.map(function (group) {
          return '<section class="twod-upload-section"><h4 class="twod-upload-section-title">' + esc(group.title) + '</h4><div class="twod-upload-field-grid">' +
            group.fields.map(renderAlignedField).join("") +
          '</div></section>';
        }).join("") +
        '<section class="twod-upload-section"><h4 class="twod-upload-section-title">数据描述</h4><div class="twod-upload-field-grid">' +
          renderAlignedField({ key: "methodDescription", label: "计算方法与实验条件", type: "textarea", wide: true, placeholder: "描述计算方法、计算参数、数据来源补充说明和质量说明" }) +
        '</div></section></div>';
    }

    function bindAlignedInputs(root) {
      const state = getWorkbenchState();
      if (!state) return;
      state.fields = state.fields || {};
      root.querySelectorAll("[data-workbench-field]").forEach(function (input) {
        input.addEventListener("input", function () {
          state.fields[input.dataset.workbenchField] = input.value;
        });
        input.addEventListener("change", function () {
          state.fields[input.dataset.workbenchField] = input.value;
        });
      });
    }

    function isTwodWorkbenchInfoStage() {
      const state = getWorkbenchState();
      return state && state.step === 2 && state.materialType === "二维材料";
    }

    function applyAlignedUploadStage() {
      if (!isTwodWorkbenchInfoStage()) return;
      const stage = document.querySelector("#page-data-submit .data-submit-stage");
      if (!stage || stage.dataset.twodAligned === "1") return;
      stage.dataset.twodAligned = "1";
      stage.innerHTML = renderAlignedTwodUploadForm();
      bindAlignedInputs(stage);
    }

    function ensureLegacyField(group, field) {
      if (!group || group.querySelector('[data-field="' + field.key + '"]')) return;
      const holder = document.createElement("div");
      holder.hidden = true;
      let control;
      if (field.type === "textarea") {
        control = document.createElement("textarea");
      } else if (field.type === "select") {
        control = document.createElement("select");
        (field.options || [""]).forEach(function (option) {
          const opt = document.createElement("option");
          opt.value = option || "";
          opt.textContent = option || "请选择";
          control.appendChild(opt);
        });
      } else {
        control = document.createElement("input");
        control.type = "text";
      }
      control.dataset.field = field.key;
      holder.appendChild(control);
      group.appendChild(holder);
    }

    function ensureLegacyTwodFields() {
      const group = document.querySelector('#page-data-submit .material-form-group[data-material="二维材料"]');
      if (!group) return;
      UPLOAD_FIELD_GROUPS.forEach(function (section) {
        section.fields.forEach(function (field) { ensureLegacyField(group, field); });
      });
    }

    function syncAlignedFieldsToLegacy() {
      const state = getWorkbenchState();
      const group = document.querySelector('#page-data-submit .material-form-group[data-material="二维材料"]');
      if (!state || !state.fields || !group) return;
      ensureLegacyTwodFields();
      Object.keys(state.fields).forEach(function (key) {
        const field = group.querySelector('[data-field="' + key + '"]');
        if (field) field.value = state.fields[key] || "";
      });
    }

    function parseNumber(value) {
      if (value == null || value === "") return undefined;
      const cleaned = String(value).replace(/[^\d.+\-eE]/g, "");
      const number = Number(cleaned);
      return Number.isFinite(number) ? number : undefined;
    }

    function firstText(fields, keys) {
      for (const key of keys) {
        const value = fields && fields[key];
        if (value != null && String(value).trim()) return String(value).trim();
      }
      return "";
    }

    function parseElements(fields, formula) {
      const text = firstText(fields, ["elementsText", "elements"]);
      const fromText = text ? text.split(/[,\s，、;；\-]+/).map(function (item) { return item.trim(); }).filter(Boolean) : [];
      const fromFormula = String(formula || "").match(/[A-Z][a-z]?/g) || [];
      return Array.from(new Set((fromText.length ? fromText : fromFormula).filter(Boolean)));
    }

    function parseAtomCoordinates(text) {
      return String(text || "").split(/\n+/).map(function (line, index) {
        const parts = line.trim().split(/[\s,，]+/).filter(Boolean);
        if (!parts.length) return null;
        const element = parts[0];
        const x = parseNumber(parts[1]);
        const y = parseNumber(parts[2]);
        const z = parseNumber(parts[3]);
        if (x == null && y == null && z == null) return null;
        return { index: index + 1, element, x, y, z };
      }).filter(Boolean);
    }

    function deriveBandType(fields, bandGap) {
      const text = firstText(fields, ["bandType"]);
      if (text) return text;
      if (bandGap == null) return "";
      if (bandGap <= 0.05) return "金属";
      if (bandGap >= 3) return "绝缘体";
      return "半导体";
    }

    function mapAlignedFieldsToTwodMaterial(record, template) {
      const fields = Object.assign({}, record && record.fields);
      const formula = firstText(fields, ["formula"]) || record.materialFormula || record.formula || "";
      const bandGap = parseNumber(fields.bandGap);
      const materialId = firstText(fields, ["materialId"]);
      const elements = parseElements(fields, formula);
      const material = {
        id: materialId || record.databaseLinkedId || "",
        name: firstText(fields, ["materialName"]) || record.materialName || "",
        formula: formula || (template && template.formula) || "",
        elements: elements.length ? elements : ((template && template.elements) ? template.elements.slice() : []),
        source: firstText(fields, ["source"]) || record.source || "用户上传",
        dataSource: firstText(fields, ["source"]) || record.source || "用户上传",
        updatedAt: record.uploadedAt || "2026-08-12",
        quality: "审核入库",
        bandGap,
        formation: parseNumber(fields.formation),
        density_g_cm3: parseNumber(fields.density_g_cm3),
        volume_ang3: parseNumber(fields.volume_ang3),
        volume: parseNumber(fields.volume_ang3),
        latticeA: parseNumber(fields.latticeA),
        latticeB: parseNumber(fields.latticeB),
        latticeC: parseNumber(fields.latticeC),
        latticeAlpha: parseNumber(fields.latticeAlpha),
        latticeBeta: parseNumber(fields.latticeBeta),
        latticeGamma: parseNumber(fields.latticeGamma),
        layerThickness: parseNumber(fields.layerThickness),
        interlayer: parseNumber(fields.layerThickness),
        crystalSystem: firstText(fields, ["crystalSystem"]) || (template && template.crystalSystem) || "",
        spaceGroup: firstText(fields, ["spaceGroup"]) || (template && template.spaceGroup) || "",
        bondLengthAngle: firstText(fields, ["bondLengthAngle"]),
        atomCoordinates: parseAtomCoordinates(fields.atomicCoordinatesText),
        type: deriveBandType(fields, bandGap),
        dos: parseNumber(fields.dos),
        effectiveMass: parseNumber(fields.effectiveMass),
        bandChart: firstText(fields, ["bandChart"]),
        dosPlot: firstText(fields, ["dosPlot"]),
        ferroelectric: firstText(fields, ["ferroelectricText"]).includes("具有") ? 1 : parseNumber(fields.ferroelectric),
        piezo: parseNumber(fields.piezo),
        piezoTensor: firstText(fields, ["piezoTensor"]),
        magneticOrder: firstText(fields, ["magneticOrder"]),
        magnetization: parseNumber(fields.magnetization),
        transitionTemp: parseNumber(fields.transitionTemp),
        phononSpectrum: firstText(fields, ["phononSpectrum"]),
        phononDos: firstText(fields, ["phononDos"]),
        elasticConstants: firstText(fields, ["elasticConstants"]),
        young: parseNumber(fields.young || fields.youngsModulus),
        poisson: parseNumber(fields.poisson),
        dielectric: parseNumber(fields.dielectric),
        absorption: parseNumber(fields.absorption),
        reflectance: parseNumber(fields.reflectance),
        refractive: parseNumber(fields.refractive),
        extinction: parseNumber(fields.extinction),
        defectType: firstText(fields, ["defectType"]),
        antisiteDefect: firstText(fields, ["antisiteDefect"]),
        defectEnergy: parseNumber(fields.defectEnergy),
        visuals: {
          bandStructure: firstText(fields, ["bandChart"]),
          dosPlot: firstText(fields, ["dosPlot"]),
          magneticGroundState: firstText(fields, ["magneticGroundStateImage"]),
          phononDispersion: firstText(fields, ["phononDispersionImage"]),
          phononDOS: firstText(fields, ["phononDosImage"]),
          dielectricFunction: firstText(fields, ["dielectricFunctionImage"]),
          opticalAbsorption: firstText(fields, ["opticalAbsorptionImage"]),
          reflectance: firstText(fields, ["reflectanceImage"]),
          refractiveIndex: firstText(fields, ["refractiveIndexImage"]),
          extinctionCoefficient: firstText(fields, ["extinctionCoefficientImage"]),
          defectFormationEnergy: firstText(fields, ["defectFormationEnergyImage"]),
          defectStructure: firstText(fields, ["defectStructureImage"])
        }
      };
      Object.keys(material).forEach(function (key) {
        if (material[key] === undefined || material[key] === "") delete material[key];
      });
      return material;
    }

    function patchEnsureRecordInDatabase() {
      if (typeof window.ensureRecordInDatabase !== "function" || window.ensureRecordInDatabase.__twodAlignedPatched) return;
      const original = window.ensureRecordInDatabase;
      window.ensureRecordInDatabase = function (record) {
        if (!record || record.databaseLinkedId || record.materialType !== "二维材料" || !record.fields) {
          return original.apply(this, arguments);
        }
        const materials = Array.isArray(window.twodMaterials) ? window.twodMaterials : (typeof twodMaterials !== "undefined" ? twodMaterials : null);
        if (!materials) return original.apply(this, arguments);
        const formula = firstText(record.fields, ["formula"]) || record.materialFormula || "";
        const name = firstText(record.fields, ["materialName"]) || record.materialName || "";
        const existing = materials.find(function (item) {
          return (name && String(item.name || "").toLowerCase() === name.toLowerCase()) ||
            (formula && String(item.formula || "").toLowerCase() === formula.toLowerCase());
        });
        if (existing) {
          record.databaseLinkedId = existing.id;
          return existing.id;
        }
        const template = materials[materials.length % Math.max(materials.length, 1)] || materials[0] || {};
        const sequence = materials.length + 1;
        const material = Object.assign({}, template, mapAlignedFieldsToTwodMaterial(record, template));
        material.id = material.id || "2D-UP-" + String(sequence).padStart(3, "0");
        material.trueMaterialId = material.id;
        material.displayName = material.name;
        material.displayFormula = material.formula;
        material.sampleImported = true;
        material.source = material.source || "用户上传";
        material.quality = material.quality || "审核入库";
        materials.unshift(material);
        record.databaseLinkedId = material.id;
        return material.id;
      };
      window.ensureRecordInDatabase.__twodAlignedPatched = true;
    }

    function patchRecordDetail() {
      document.addEventListener("click", function (event) {
        const trigger = event.target.closest("[data-view-detail], [data-open-record], [data-approve-record]");
        if (!trigger) return;
        window.setTimeout(function () {
          const extra = document.getElementById("recordExtraInfo");
          if (!extra) return;
          const records = Array.isArray(window.twodUpdateRecords) ? window.twodUpdateRecords : (typeof twodUpdateRecords !== "undefined" ? twodUpdateRecords : []);
          const id = trigger.dataset.viewDetail || trigger.dataset.openRecord || trigger.dataset.approveRecord;
          const record = records.find(function (item) { return item.id === id; });
          if (!record || record.materialType !== "二维材料" || !record.fields || extra.dataset.twodAligned === id) return;
          extra.dataset.twodAligned = id;
          const fields = record.fields;
          const rows = [
            ["材料编号", firstText(fields, ["materialId"]) || record.databaseLinkedId || "未入库"],
            ["材料名称", firstText(fields, ["materialName"]) || record.materialName || "-"],
            ["化学式", firstText(fields, ["formula"]) || record.materialFormula || "-"],
            ["元素组成", firstText(fields, ["elementsText"]) || parseElements(fields, fields.formula).join(", ") || "-"],
            ["数据来源", firstText(fields, ["source"]) || record.source || "-"],
            ["带隙", firstText(fields, ["bandGap"]) ? firstText(fields, ["bandGap"]) + " eV" : "-"],
            ["形成能", firstText(fields, ["formation"]) ? firstText(fields, ["formation"]) + " eV/atom" : "-"],
            ["晶胞体积", firstText(fields, ["volume_ang3"]) ? firstText(fields, ["volume_ang3"]) + " A3" : "-"],
            ["晶系", firstText(fields, ["crystalSystem"]) || "-"],
            ["空间群", firstText(fields, ["spaceGroup"]) || "-"]
          ];
          extra.innerHTML = rows.map(function (row) {
            return '<span class="record-detail-label">' + esc(row[0]) + '</span><span class="record-detail-value" title="' + esc(row[1]) + '">' + esc(row[1]) + '</span>';
          }).join("");
        }, 80);
      }, true);
    }

    function init() {
      ensureLegacyTwodFields();
      patchEnsureRecordInDatabase();
      patchRecordDetail();
      applyAlignedUploadStage();
      document.addEventListener("click", function (event) {
        if (event.target.closest("[data-workbench-next], [data-workbench-step], [data-material-select], [data-material-type], [data-workbench-draft], [data-workbench-submit]")) {
          syncAlignedFieldsToLegacy();
          window.setTimeout(applyAlignedUploadStage, 0);
          window.setTimeout(syncAlignedFieldsToLegacy, 30);
        }
      }, true);
      document.addEventListener("input", syncAlignedFieldsToLegacy, true);
      document.addEventListener("change", syncAlignedFieldsToLegacy, true);
      const page = document.getElementById("page-data-submit");
      if (page && "MutationObserver" in window) {
        const observer = new MutationObserver(function () {
          applyAlignedUploadStage();
          syncAlignedFieldsToLegacy();
        });
        observer.observe(page, { childList: true, subtree: true });
      }
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  })();
  