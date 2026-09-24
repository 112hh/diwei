
    (() => {
      const predictionTaskState = {
        draft: {
          source: "",
          materialId: "",
          taskName: "",
          algorithmType: "晶体结构弛豫算法",
          subAlgorithms: ["nonmagnetic"],
          sourceMode: "database",
          spinPolarized: false,
          functional: "GGA-PBE",
          kpointMode: "auto",
          vdW: false,
          taskDescription: ""
        },
        task: null
      };
      window.lowDimPredictionTaskState = predictionTaskState;

      const esc = (value) => typeof escapeLowDimHtml === "function"
        ? escapeLowDimHtml(value == null ? "" : String(value))
        : String(value ?? "").replace(/[&<>"']/g, (char) => ({
          "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[char]));

      function getPredictionTaskMaterial() {
        const draft = predictionTaskState.draft;
        if (!draft.source || !draft.materialId || typeof getCanonicalMaterialBySource !== "function") return null;
        return getCanonicalMaterialBySource(draft.source, draft.materialId);
      }

      function getPredictionTaskOptions(source) {
        if (source === "twod") {
          return {
            types: ["晶体结构弛豫算法", "材料性质计算算法"],
            subAlgorithms: {
              "晶体结构弛豫算法": [
                ["nonmagnetic", "非磁单层材料结构弛豫"],
                ["magnetic", "磁性单层材料结构弛豫"],
                ["defect", "缺陷单层材料结构弛豫"],
                ["multilayer", "多层材料结构弛豫"]
              ],
              "材料性质计算算法": [
                ["band", "能带结构计算"],
                ["dos", "态密度计算"],
                ["phonon", "声子谱计算"]
              ]
            }
          };
        }
        if (source === "electrolyte") {
          return { types: ["材料性质计算算法"], subAlgorithms: { "材料性质计算算法": [["transport", "离子输运性质计算"]] } };
        }
        if (source === "opto") {
          return { types: ["材料性质计算算法"], subAlgorithms: { "材料性质计算算法": [["spectra", "光谱与态密度计算"]] } };
        }
        if (source === "mlff") {
          return { types: ["材料性质计算算法"], subAlgorithms: { "材料性质计算算法": [["forceField", "力场参数计算"]] } };
        }
        return { types: ["材料性质计算算法"], subAlgorithms: { "材料性质计算算法": [["catalyst", "催化性能预测"]] } };
      }

      function renderPredictionTaskBody() {
        const draft = predictionTaskState.draft;
        const material = getPredictionTaskMaterial();
        const source = draft.source || "twod";
        const isTwod = source === "twod";
        const allMaterials = typeof twodMaterials !== "undefined" ? twodMaterials : [];
        const selectedId = material?.id || draft.materialId || allMaterials[0]?.id || "";
        const formula = material?.formula || material?.chemicalFormula || "-";
        const algorithmCatalog = isTwod ? [
          ["nonmagnetic", "非磁单层材料结构弛豫", "针对非磁性二维单层材料的结构优化算法，通过 API 调用返回优化后的晶格参数与原子位置信息。", "可用", "v1.0"],
          ["magnetic", "磁性单层材料结构弛豫", "针对磁性二维单层材料的结构优化算法，考虑自旋极化效应并返回稳定自洽结构结果。", "维护中", "v1.1"],
          ["defect", "缺陷单层材料结构弛豫", "针对含空位、间隙和替位缺陷的二维材料进行结构优化，返回缺陷构型与几何参数。", "可用", "v1.0"],
          ["multilayer", "多层材料结构弛豫", "针对二维多层材料的结构优化，优化层间距离和堆垛方式，并通过 API 返回结果。", "可用", "v1.0"],
          ["band", "能带结构计算", "计算材料能带结构、带隙与高对称路径上的电子态信息。", "可用", "v1.0"],
          ["dos", "态密度计算", "计算总态密度与分波态密度，辅助分析材料电子结构。", "可用", "v1.0"],
          ["phonon", "声子谱计算", "计算声子色散与动力学稳定性，识别虚频与软模。", "可用", "v1.0"]
        ] : (getPredictionTaskOptions(source).subAlgorithms[getPredictionTaskOptions(source).types[0]] || []).map(([key, label]) => [key, label, "调用对应材料数据库算法完成标准化预测计算。", "可用", "v1.0"]);
        const selectedAlgorithm = draft.subAlgorithms[0] || algorithmCatalog[0]?.[0];
        const checked = (key) => draft.subAlgorithms.includes(key) ? " checked" : "";
        return `
          <div class="prediction-modal-material-picker">
            <div class="prediction-modal-section-title"><span class="prediction-info-icon">i</span><div><strong>待预测材料</strong><small>选择本次任务要进行预测的材料</small></div></div>
            <label class="prediction-material-select"><span>选择材料</span><select data-prediction-material>${allMaterials.map((item) => `<option value="${esc(item.id)}"${item.id === selectedId ? " selected" : ""}>${esc(item.name || item.formula || item.id)} · ${esc(item.formula || "")}</option>`).join("")}</select><b>⌄</b></label>
            <div class="prediction-material-summary"><span>材料名称：<strong>${esc(material?.name || "-   ")}</strong></span><span>材料编号：<a>${esc(material?.id || "-")}</a></span><span>化学式：<strong>${esc(formula)}</strong></span></div>
          </div>
          <label class="prediction-modal-task-name"><span>预测任务名称 <i>*</i></span><input type="text" value="${esc(draft.taskName)}" placeholder="请输入任务名称" data-prediction-task-name><small>请输入任务名称，便于后续查找和管理，最多50个字符</small></label>
          <section class="prediction-modal-algorithm-section"><div class="prediction-modal-field-title"><span>算法分类 <i>*</i></span><div class="prediction-algorithm-categories"><button type="button" class="active" data-prediction-algorithm-category="twod">二维材料数据库应用算法</button><button type="button" data-prediction-algorithm-category="lowdim">低维材料数据库应用算法</button><button type="button" data-prediction-algorithm-category="mlff">机器学习力场算法</button></div></div><div class="prediction-algorithm-heading"><span>选择算法 <i>*</i></span><a href="#" onclick="return false">查看全部算法 ↗</a></div><div class="prediction-algorithm-list">${algorithmCatalog.map(([key, label, desc, availability, version]) => `<label class="prediction-algorithm-card${key === selectedAlgorithm ? " selected" : ""}"><input type="checkbox" value="${key}" data-prediction-subalgorithm${checked(key)}><span class="prediction-algorithm-radio"></span><div><strong>${esc(label)}</strong><em class="${availability === "维护中" ? "maintenance" : "available"}">${availability}</em><small>${version}</small><p>${esc(desc)}</p></div><b>晶体结构弛豫</b></label>`).join("")}</div></section>
          <section class="prediction-modal-config-section"><h4>计算参数配置 <em>选填</em></h4><div class="prediction-modal-config-grid"><label><span>收敛精度</span><select><option>中等精度 (1e-3 eV/Å)</option><option>高精度 (1e-5 eV/Å)</option></select></label><label><span>最大迭代步数</span><input type="number" value="100"></label></div><small class="prediction-config-hint">ⓘ 如不填写将使用算法默认参数，您可在任务详情中查看完整参数配置</small></section>
          <section class="prediction-modal-description"><h4>任务描述 <em>选填</em></h4><textarea rows="3" placeholder="请输入任务描述信息，便于后续回顾任务" data-prediction-task-description>${esc(draft.taskDescription || "")}</textarea></section>
          <select class="prediction-hidden-control" data-prediction-algorithm-type>${getPredictionTaskOptions(source).types.map((item) => `<option${item === draft.algorithmType ? " selected" : ""}>${esc(item)}</option>`).join("")}</select>
        `;
      }


      function renderPredictionTaskModal() {
        const body = document.getElementById("predictionTaskModalBody");
        if (body) body.innerHTML = renderPredictionTaskBody();
      }

      function openPredictionTaskModal(source, materialId) {
        const defaultMaterialId = !materialId && source === "twod" && typeof twodMaterials !== "undefined"
          ? (twodMaterials.find((item) => /MoS2|MoS₂/i.test(`${item.name || ""}${item.formula || ""}`))?.id || twodMaterials[0]?.id)
          : materialId;
        const material = typeof getCanonicalMaterialBySource === "function"
          ? getCanonicalMaterialBySource(source, defaultMaterialId)
          : null;
        if (!material) return false;
        const options = getPredictionTaskOptions(source);
        predictionTaskState.draft = {
          source,
          materialId: material.id,
          taskName: "",
          algorithmType: options.types[0],
          subAlgorithms: [options.subAlgorithms[options.types[0]][0][0]],
          sourceMode: "database",
          spinPolarized: source === "twod" && /磁|Fe|Co|Ni|Mn/i.test(`${material.name || ""}${material.formula || ""}`),
          functional: "GGA-PBE",
          kpointMode: "auto",
          vdW: false,
          taskDescription: ""
        };
        renderPredictionTaskModal();
        openModal("predictionTaskModal");
        return false;
      }

      function syncPredictionTaskDraftFromDom() {
        const body = document.getElementById("predictionTaskModalBody");
        if (!body) return;
        const draft = predictionTaskState.draft;
        draft.taskName = body.querySelector("[data-prediction-task-name]")?.value || draft.taskName;
        draft.algorithmType = body.querySelector("[data-prediction-algorithm-type]")?.value || draft.algorithmType;
        draft.subAlgorithms = [...body.querySelectorAll("[data-prediction-subalgorithm]:checked")].map((node) => node.value);
        draft.sourceMode = body.querySelector("[data-prediction-source-mode]")?.value || draft.sourceMode;
        draft.spinPolarized = !!body.querySelector("[data-prediction-spin]")?.checked;
        draft.functional = body.querySelector("[data-prediction-functional]")?.value || draft.functional;
        draft.kpointMode = body.querySelector("[data-prediction-kpoint-mode]")?.value === "手动输入 KPOINTS 参数" ? "manual" : "auto";
        draft.vdW = !!body.querySelector("[data-prediction-vdw]")?.checked;
        draft.taskDescription = body.querySelector("[data-prediction-task-description]")?.value || draft.taskDescription;
      }

      function showPredictionPendingPage() {
        const draft = predictionTaskState.draft;
        const material = getPredictionTaskMaterial();
        const page = document.getElementById("page-prediction-pending");
        if (!page) return;
        page.querySelector("#predictionPendingTaskName").textContent = draft.taskName || "预测任务";
        page.querySelector("#predictionPendingMaterial").textContent = `${material?.id || "-"} · ${material?.formula || "-"}`;
        page.querySelector("#predictionPendingAlgorithm").textContent = `${draft.algorithmType} · ${draft.subAlgorithms.join("、") || "未选择"}`;
        page.querySelector("#predictionPendingSummary").textContent = `已提交 ${material?.name || "当前材料"} 的预测任务，算法正在处理中，请耐心等待几分钟。`;
        switchPage("prediction-pending");
      }

      function submitPredictionTask(mode) {
        syncPredictionTaskDraftFromDom();
        const draft = predictionTaskState.draft;
        if (!draft.taskName.trim()) {
          showToast("发起预测", "请输入任务名称。");
          return;
        }
        if (!draft.materialId) {
          showToast("发起预测", "请至少保留一条待计算材料。");
          return;
        }
        if (!draft.subAlgorithms.length) {
          showToast("发起预测", "请至少选择一个子算法。");
          return;
        }
        predictionTaskState.task = { ...draft, id: `pred-${Date.now()}`, status: "pending" };
        closeModal("predictionTaskModal");
        showPredictionPendingPage();
      }

      const previousPredictionDetailOpen = handleMaterialDetailOpen;
      handleMaterialDetailOpen = function (materialToken, targetView = "detail") {
        if (targetView === "prediction") {
          const parsed = parseMaterialToken(materialToken);
          return openPredictionTaskModal(parsed.source, parsed.id);
        }
        return previousPredictionDetailOpen(materialToken, targetView);
      };
      window.handleMaterialDetailOpen = handleMaterialDetailOpen;

      document.body.addEventListener("input", (event) => {
        if (event.target.closest("#predictionTaskModalBody")) syncPredictionTaskDraftFromDom();
      });
      document.body.addEventListener("change", (event) => {
        if (!event.target.closest("#predictionTaskModalBody")) return;
        syncPredictionTaskDraftFromDom();
        if (event.target.matches("[data-prediction-material]")) {
          predictionTaskState.draft.materialId = event.target.value;
          renderPredictionTaskModal();
          return;
        }
        if (event.target.matches("[data-prediction-algorithm-type]")) {
          const options = getPredictionTaskOptions(predictionTaskState.draft.source);
          const next = options.subAlgorithms[predictionTaskState.draft.algorithmType] || [];
          predictionTaskState.draft.subAlgorithms = next.length ? [next[0][0]] : [];
          renderPredictionTaskModal();
        }
        if (event.target.matches("[data-prediction-subalgorithm]")) renderPredictionTaskModal();
      });
      document.body.addEventListener("click", (event) => {
        if (event.target.closest("[data-prediction-create]")) {
          openPredictionTaskModal("twod", "");
          return;
        }
        const category = event.target.closest("[data-prediction-algorithm-category]");
        if (category) {
          predictionTaskState.draft.algorithmType = category.dataset.predictionAlgorithmCategory === "twod" ? "晶体结构弛豫算法" : "材料性质计算算法";
          renderPredictionTaskModal();
          return;
        }
        if (event.target.closest("[data-prediction-submit-pending]")) return submitPredictionTask("pending");

        if (event.target.closest("[data-prediction-remove-material]")) {
          predictionTaskState.draft.materialId = "";
          renderPredictionTaskModal();
          return;
        }
        if (event.target.closest("[data-prediction-preview-file]") || event.target.closest("[data-prediction-preview-pdb]")) {
          showToast("文件预览", "示例预览已打开，可查看标准化结构文件内容。");
          return;
        }
        if (event.target.closest("[data-prediction-pending-result]")) {
          const draft = predictionTaskState.draft;
          openPredictionPage(draft.source, draft.materialId);
          return;
        }
        if (event.target.closest("[data-prediction-pending-back]")) {
          const target = predictionTaskState.task?.source || predictionTaskState.draft.source || "twod";
          switchPage(target);
          if (target === "twod" && typeof renderTwodModuleUnified === "function") renderTwodModuleUnified();
          if (target === "electrolyte" && typeof renderElectrolyteModule === "function") renderElectrolyteModule();
          if (target === "opto" && typeof renderOptoModule === "function") renderOptoModule();
          if (target === "mlff" && typeof renderMlffModule === "function") renderMlffModule();
          if (target === "catalyst" && typeof renderCatalystModule === "function") renderCatalystModule();
        }
      });
    })();
  