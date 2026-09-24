
    (() => {
      const predictionTaskRows = [
        {
          id: "PT-20260821-001",
          name: "MoS2 单层结构弛豫",
          source: "二维材料数据库",
          createdAt: "2026-08-21 14:32",
          stage: "结构预处理",
          status: "排队中",
          progress: 12,
          materialSource: "twod",
          materialId: "2D-MoS2-001",
          algorithm: "非磁单层材料结构弛豫"
        },
        {
          id: "PT-20260821-002",
          name: "Nb2C 声子稳定性计算",
          source: "二维材料数据库",
          createdAt: "2026-08-21 13:48",
          stage: "性质计算",
          status: "性质计算中",
          progress: 68,
          materialSource: "twod",
          materialId: "2D-Nb2C-001",
          algorithm: "声子谱计算"
        },
        {
          id: "PT-20260820-009",
          name: "MoS2 结构重算",
          source: "二维材料数据库",
          createdAt: "2026-08-20 16:15",
          stage: "结果归档",
          status: "运行成功",
          progress: 100,
          materialSource: "twod",
          materialId: "2D-MoS2-001",
          algorithm: "非磁单层材料结构弛豫"
        },
        {
          id: "PT-20260820-006",
          name: "磁性单层参数检查",
          source: "二维材料数据库",
          createdAt: "2026-08-20 10:20",
          stage: "错误诊断",
          status: "运行失败",
          progress: 43,
          materialSource: "twod",
          materialId: "2D-FePS3-001",
          algorithm: "磁性单层材料结构弛豫"
        },
        {
          id: "PT-20260819-003",
          name: "有机电解液输运预测",
          source: "电解质材料数据库",
          createdAt: "2026-08-19 09:08",
          stage: "任务调度",
          status: "已取消",
          progress: 0,
          materialSource: "electrolyte",
          materialId: "EL-LIQ-001",
          algorithm: "离子输运性质计算"
        }
      ];
      const predictionTaskFilters = {
        name: "",
        source: "全部",
        status: "全部",
        start: "",
        end: ""
      };

      const escapeTaskHtml = (value) => typeof escapeLowDimHtml === "function"
        ? escapeLowDimHtml(value == null ? "" : String(value))
        : String(value ?? "").replace(/[&<>"']/g, (char) => ({
          "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[char]));

      function ensurePredictionTaskRows() {
        const createdTask = window.lowDimPredictionTaskState?.task;
        if (!createdTask) return predictionTaskRows;
        const existing = predictionTaskRows.find((item) => item.id === createdTask.id);
        if (!existing) {
          predictionTaskRows.unshift({
            id: createdTask.id,
            name: createdTask.taskName,
            source: createdTask.source === "twod" ? "二维材料数据库" : createdTask.source === "electrolyte" ? "电解质材料数据库" : "低维材料数据库",
            createdAt: "2026-08-21 14:32",
            stage: "任务调度",
            status: createdTask.status === "pending" ? "排队中" : "运行成功",
            progress: createdTask.status === "pending" ? 12 : 100,
            materialSource: createdTask.source,
            materialId: createdTask.materialId,
            algorithm: createdTask.subAlgorithms?.join("、") || createdTask.algorithmType
          });
        }
        return predictionTaskRows;
      }

      function getPredictionTaskStatusClass(status) {
        if (status === "运行成功") return "success";
        if (status === "运行失败") return "danger";
        if (status === "已取消") return "warning";
        return "info";
      }

      function filterPredictionTaskRows() {
        return ensurePredictionTaskRows().filter((row) => {
          const nameMatch = !predictionTaskFilters.name || row.name.toLowerCase().includes(predictionTaskFilters.name.toLowerCase());
          const sourceMatch = predictionTaskFilters.source === "全部" || row.source === predictionTaskFilters.source;
          const statusMatch = predictionTaskFilters.status === "全部" || row.status === predictionTaskFilters.status;
          const startMatch = !predictionTaskFilters.start || row.createdAt.slice(0, 10) >= predictionTaskFilters.start;
          const endMatch = !predictionTaskFilters.end || row.createdAt.slice(0, 10) <= predictionTaskFilters.end;
          return nameMatch && sourceMatch && statusMatch && startMatch && endMatch;
        });
      }

      function ensurePredictionTaskLogModal() {
        if (document.getElementById("predictionTaskLogModal")) return;
        document.body.insertAdjacentHTML("beforeend", `
          <div class="overlay" id="predictionTaskLogModal">
            <div class="modal modal-lg">
              <div class="modal-header">
                <div><h3 id="predictionTaskLogTitle">任务运行日志</h3><p>查看算法运行日志、阶段信息和报错内容。</p></div>
                <button class="modal-close" type="button" data-close-modal="predictionTaskLogModal">×</button>
              </div>
              <div class="modal-body modal-scroll" id="predictionTaskLogBody"></div>
              <div class="modal-footer"><button class="btn" type="button" data-close-modal="predictionTaskLogModal">关闭</button></div>
            </div>
          </div>
        `);
      }

      function showPredictionTaskLog(task) {
        ensurePredictionTaskLogModal();
        const logBody = document.getElementById("predictionTaskLogBody");
        if (!logBody) return;
        const failed = task.status === "运行失败";
        logBody.innerHTML = `
          <section class="twod-detail-section-card">
            <div class="twod-detail-property-grid">
              <article class="twod-detail-property-item"><span>任务 ID</span><strong>${escapeTaskHtml(task.id)}</strong></article>
              <article class="twod-detail-property-item"><span>当前阶段</span><strong>${escapeTaskHtml(task.stage)}</strong></article>
              <article class="twod-detail-property-item"><span>任务状态</span><strong>${escapeTaskHtml(task.status)}</strong></article>
              <article class="twod-detail-property-item"><span>进度</span><strong>${task.progress}%</strong></article>
            </div>
          </section>
          <section class="twod-detail-section-card">
            <h4>算法运行日志</h4>
            <pre class="algorithm-doc-code">[2026-08-21 14:32:01] 创建任务 ${escapeTaskHtml(task.id)}
[2026-08-21 14:32:04] 加载标准化结构文件
[2026-08-21 14:32:08] 调用 ${escapeTaskHtml(task.algorithm)} 接口
[2026-08-21 14:33:12] 当前阶段：${escapeTaskHtml(task.stage)}
${failed ? "[ERROR] 输入参数校验未通过：缺少必要的收敛配置，请修改后重试。" : "[INFO] 任务正在按调度队列执行。"}</pre>
          </section>
        `;
        openModal("predictionTaskLogModal");
      }

      function updatePredictionTask(task, action) {
        if (action === "cancel") {
          task.status = "已取消";
          task.stage = "任务已终止";
          task.progress = Math.min(task.progress, 32);
          showToast("预测任务", `${task.id} 已取消。`);
        }
        if (action === "retry") {
          task.status = "排队中";
          task.stage = "重新排队";
          task.progress = 0;
          showToast("预测任务", `${task.id} 已重新进入算法队列。`);
        }
        renderPredictionTaskManagementPage();
      }

      function renderPredictionTaskManagementPage() {
        const page = document.getElementById("page-prediction-tasks");
        if (!page) return;
        document.querySelectorAll(".page").forEach((node) => node.classList.toggle("active", node.id === "page-prediction-tasks"));
        const rows = filterPredictionTaskRows();
        const isDefaultView = !predictionTaskFilters.name && predictionTaskFilters.source === "全部" && predictionTaskFilters.status === "全部" && !predictionTaskFilters.start && !predictionTaskFilters.end;
        const extraRow = { id: "PT-20260819-004", name: "石墨烯缺陷结构预测测试", source: "二维材料数据库", createdAt: "2026-08-19 15:48", stage: "结果归档", status: "已取消", progress: 0, materialSource: "twod", materialId: "2D-Graphene-001", algorithm: "缺陷单层材料结构弛豫" };
        const referenceRows = isDefaultView ? [
          { ...rows[0], name: "MoS₂ 非磁单层结构弛豫预测", algorithm: "非磁单层材料结构弛豫算法", status: "弛豫计算中", materialId: "2D-MoS2-001", createdAt: "2024-01-15 14:32:18" },
          { ...rows[1], name: "WS₂ 多层材料结构优化计算", algorithm: "多层材料结构弛豫算法", status: "运行成功", materialId: "2D-WS2-001", createdAt: "2024-01-15 10:15:42" },
          { ...rows[0], id: "PT-20260821-003", name: "WSe₂ 缺陷结构弛豫预测", algorithm: "缺陷单层材料结构弛豫算法", status: "排队中", materialId: "2D-WSe2-001", createdAt: "2024-01-15 14:45:00" },
          { ...rows[3], name: "MoSe₂ 磁性单层结构预测", algorithm: "磁性单层材料结构弛豫算法", status: "运行失败", materialId: "2D-MoSe2-001", createdAt: "2024-01-14 16:22:08" },
          { ...rows[2], id: "PT-20260814-007", name: "Ba₂Ti₃O₈ 晶体结构预测计算", algorithm: "非磁单层材料结构弛豫算法", status: "运行成功", materialId: "2D-Ba2Ti3O8-001", createdAt: "2024-01-14 09:30:15" },
          extraRow
        ] : rows;
        const displayRows = referenceRows;
        const statusIcon = (status) => status === "运行成功" ? "✓" : status === "运行失败" ? "×" : status === "已取消" ? "⊙" : "◷";
        const statusLabel = (status) => status === "运行成功" ? "已完成" : status === "运行失败" ? "失败" : status === "已取消" ? "已取消" : status === "排队中" ? "排队中" : "运行中";
        const statusClass = (status) => status === "运行成功" ? "success" : status === "运行失败" ? "danger" : status === "已取消" ? "muted" : status === "排队中" ? "queued" : "running";
        const author = (task, index) => task.status === "运行成功" ? ["李博士", "#f0ddff", "李"] : task.status === "运行失败" ? ["王工", "#d5f8e6", "王"] : task.status === "已取消" ? ["赵教授", "#ffe9c7", "赵"] : ["张研究员", "#d9e9ff", "张"];
        const algorithmName = (task) => task.algorithm || "非磁单层材料结构弛豫算法";
        const materialName = (task) => task.name.includes("WS2") ? "WS₂" : task.name.includes("WSe₂") ? "WSe₂" : task.name.includes("Ba₂Ti₃O₈") ? "Ba₂Ti₃O₈" : task.name.includes("石墨烯") ? "Graphene" : task.name.includes("Nb2C") ? "Nb₂C" : "MoS₂";
        page.innerHTML = `
          <div class="prediction-task-breadcrumb"><span>低维材料数据库分析预测</span><b>/</b><strong>预测任务管理</strong></div>
          <div class="prediction-task-hero"><div class="prediction-task-title-wrap"><div class="prediction-task-title-icon">✓</div><div><h2>预测任务管理</h2><p>管理所有材料预测任务，查看任务状态与计算结果</p></div></div><button class="prediction-create-btn" type="button" data-prediction-create><span>＋</span>新建预测任务</button></div>
          <section class="prediction-stat-grid" aria-label="任务统计"><article class="prediction-stat-card"><div><span class="prediction-stat-label">全部任务</span><strong>128</strong><em class="stat-up">↑ 较上周 +12%</em></div><div class="stat-icon blue">▤</div></article><article class="prediction-stat-card"><div><span class="prediction-stat-label">运行中</span><strong class="orange-text">7</strong><em class="stat-warn">◷ 3 个排队中</em></div><div class="stat-icon orange">▶</div></article><article class="prediction-stat-card"><div><span class="prediction-stat-label">已完成</span><strong class="green-text">112</strong><em class="stat-up">↑ 成功率 95.7%</em></div><div class="stat-icon green">✓</div></article><article class="prediction-stat-card"><div><span class="prediction-stat-label">失败/已取消</span><strong class="red-text">9</strong><em class="stat-down">↓ 失败率 4.3%</em></div><div class="stat-icon red">×</div></article></section>
          <section class="prediction-filter-card"><div class="prediction-filter-row"><label class="prediction-search-field"><span class="search-glyph">⌕</span><input type="text" value="${escapeTaskHtml(predictionTaskFilters.name)}" placeholder="搜索任务名称、材料名称..." data-prediction-filter="name"></label><label class="prediction-select-field"><select data-prediction-filter="status"><option>全部状态</option>${["排队中", "弛豫计算中", "性质计算中", "运行成功", "运行失败", "已取消"].map((item) => `<option${predictionTaskFilters.status === item ? " selected" : ""}>${item}</option>`).join("")}</select><span>⌄</span></label><label class="prediction-select-field"><select data-prediction-filter="source"><option>全部算法分类</option><option${predictionTaskFilters.source === "二维材料数据库" ? " selected" : ""}>二维材料数据库</option><option${predictionTaskFilters.source === "电解质材料数据库" ? " selected" : ""}>电解质材料数据库</option><option${predictionTaskFilters.source === "有机光电材料数据库" ? " selected" : ""}>有机光电材料数据库</option><option${predictionTaskFilters.source === "机器学习力场数据库" ? " selected" : ""}>机器学习力场数据库</option><option${predictionTaskFilters.source === "催化材料数据库" ? " selected" : ""}>催化材料数据库</option></select><span>⌄</span></label><label class="prediction-date-field"><input type="text" value="" placeholder="选择创建时间范围" onfocus="this.type='date'" onblur="if(!this.value)this.type='text'" data-prediction-filter="start"><span>▣</span></label><button class="prediction-query-btn" type="button" data-prediction-filter-submit>查询</button><button class="prediction-reset-btn" type="button" data-prediction-filter-reset>重置</button></div><div class="prediction-quick-filter"><span>快速筛选:</span><button class="quick-chip active" type="button" data-prediction-quick="全部">全部</button><button class="quick-chip" type="button" data-prediction-quick="运行中">运行中</button><button class="quick-chip" type="button" data-prediction-quick="已完成">已完成</button><button class="quick-chip" type="button" data-prediction-quick="排队中">排队中</button><button class="quick-chip" type="button" data-prediction-quick="失败">失败</button><button class="quick-chip" type="button" data-prediction-quick="我的任务">我的任务</button></div></section>
          <section class="prediction-table-card"><div class="prediction-table-head"><div><h3>任务列表 <span>共 128 条</span></h3></div><div class="prediction-table-tools"><button type="button" aria-label="刷新任务列表">⟳</button><button type="button" aria-label="导出任务">⇩ 导出</button><button type="button" aria-label="列表设置">⚙</button></div></div><div class="prediction-table-wrap"><table class="prediction-task-table"><thead><tr><th><input type="checkbox" aria-label="选择全部任务"></th><th>任务名称</th><th>材料信息</th><th>算法名称</th><th>状态</th><th>创建人</th><th>创建时间</th><th>耗时</th><th>操作</th></tr></thead><tbody>${displayRows.length ? displayRows.map((task, index) => { const person = author(task, index); return `<tr><td><input type="checkbox" aria-label="选择 ${escapeTaskHtml(task.name)}"></td><td><div class="task-name-cell"><a href="#" onclick="return false">${escapeTaskHtml(task.name)}</a><small>${escapeTaskHtml(task.id.replace("PT-", "TASK-").replaceAll("-", ""))}</small></div></td><td><div class="material-cell"><strong>${materialName(task)}</strong><small>mp-${escapeTaskHtml(task.materialId.replace(/[^0-9]/g, "").slice(-7) || "1018134")}</small></div></td><td><div class="algorithm-cell">${escapeTaskHtml(algorithmName(task))}<small>v1.0 · 二维材料</small></div></td><td><span class="prediction-status ${statusClass(task.status)}"><i>${statusIcon(task.status)}</i>${statusLabel(task.status)}</span></td><td><div class="creator-cell"><b style="background:${person[1]}">${person[2]}</b><span>${person[0]}</span></div></td><td>${escapeTaskHtml(task.createdAt)}</td><td class="duration-cell">${task.status === "运行成功" ? "12分36秒" : task.status === "运行失败" ? "03分15秒" : task.status === "已取消" ? "01分20秒" : index === 0 ? "--" : "06分42秒"}</td><td><div class="prediction-actions"><button class="twod-action-view" type="button" data-prediction-task-result="${escapeTaskHtml(task.id)}"${task.status === "运行成功" ? "" : " disabled"}>查看结果</button>${task.status === "运行失败" ? `<button class="twod-record-link" type="button" data-prediction-task-retry="${escapeTaskHtml(task.id)}">重试</button>` : task.status === "已取消" ? `<button class="twod-record-link" type="button" data-prediction-task-retry="${escapeTaskHtml(task.id)}">重新提交</button>` : task.status === "运行成功" ? `<button class="twod-record-link" type="button" data-prediction-task-log="${escapeTaskHtml(task.id)}">下载</button>` : `<button class="twod-record-link" type="button" data-prediction-task-cancel="${escapeTaskHtml(task.id)}">终止</button>`}</div></td></tr>`; }).join("") : `<tr><td colspan="9" class="opto-table-empty">暂无符合条件的预测任务。</td></tr>`}</tbody></table></div><div class="prediction-table-footer"><span>共 128 条记录，第 1 / 22 页</span><div class="prediction-pagination"><button type="button">‹</button><button type="button" class="active">1</button><button type="button">2</button><button type="button">3</button><button type="button">4</button><button type="button">5</button><span>...</span><button type="button">22</button><button type="button">›</button><label>10条/页　⌄</label></div></div></section>
        `;
        page.querySelectorAll("[data-prediction-quick]").forEach((button) => button.addEventListener("click", () => { const value = button.dataset.predictionQuick; if (value === "全部") Object.assign(predictionTaskFilters, { name: "", source: "全部", status: "全部", start: "", end: "" }); else if (value === "失败") predictionTaskFilters.status = "运行失败"; else if (value === "排队中") predictionTaskFilters.status = "排队中"; else if (value === "已完成") predictionTaskFilters.status = "运行成功"; else if (value === "运行中") predictionTaskFilters.status = "性质计算中"; renderPredictionTaskManagementPage(); }));
        page.querySelectorAll("[data-prediction-filter]").forEach((field) => field.addEventListener("change", () => { predictionTaskFilters[field.dataset.predictionFilter] = field.value === "全部状态" || field.value === "全部算法分类" ? "全部" : field.value; }));
      }


      function renderAlgorithmDocDetailPage(algorithmId) {
        const page = document.getElementById("page-algorithm-doc-detail");
        const algorithm = typeof findAlgorithmById === "function" ? findAlgorithmById(algorithmId) : null;
        const detailMarkup = typeof window.renderUnifiedAlgorithmDocPage === "function"
          ? window.renderUnifiedAlgorithmDocPage(algorithmId)
          : "";
        if (!page || !algorithm || !detailMarkup) return;
        state.activeAlgorithmResourceId = algorithm.id;
        page.innerHTML = `<div class="algorithm-reference-toolbar"><button class="btn" type="button" data-algorithm-detail-back>← 返回数据应用算法</button></div><div class="algorithm-reference-page">${detailMarkup}</div>`;
        switchPage("algorithm-doc-detail");
        const breadcrumb = document.getElementById("breadcrumb");
        if (breadcrumb) {
          breadcrumb.innerHTML = `<span>低维材料数据库分析预测</span><span>/</span><span>数据应用算法</span><span>/</span><strong>${escapeTaskHtml(algorithm.title)}</strong>`;
        }
      }

      const originalSwitchPageForPredictionTasks = switchPage;
      switchPage = function predictionTaskAwareSwitchPage(page) {
        originalSwitchPageForPredictionTasks(page);
        if (page === "prediction-tasks") {
          document.querySelectorAll(".page").forEach((node) => node.classList.toggle("active", node.id === "page-prediction-tasks"));
          state.page = page;
          renderPredictionTaskManagementPage();
        }
        if (page === "algorithm-doc-detail") {
          const algorithm = typeof findAlgorithmById === "function" ? findAlgorithmById(state.activeAlgorithmResourceId) : null;
          if (algorithm && !document.querySelector("#page-algorithm-doc-detail .algorithm-reference-page")) renderAlgorithmDocDetailPage(algorithm.id);
        }
      };
      window.switchPage = switchPage;

      const originalAlgorithmDocModal = renderAlgorithmDocModal;
      renderAlgorithmDocModal = function renderAlgorithmDocDetailRoute(algorithmId) {
        const algorithm = typeof findAlgorithmById === "function" ? findAlgorithmById(algorithmId) : null;
        if (!algorithm) return originalAlgorithmDocModal(algorithmId);
        renderAlgorithmDocDetailPage(algorithm.id);
      };

      document.body.addEventListener("input", (event) => {
        const field = event.target.closest("[data-prediction-filter]");
        if (field) predictionTaskFilters[field.dataset.predictionFilter] = field.value;
      });
      document.body.addEventListener("change", (event) => {
        const field = event.target.closest("[data-prediction-filter]");
        if (field) predictionTaskFilters[field.dataset.predictionFilter] = field.value;
      });
      document.body.addEventListener("click", (event) => {
        if (event.target.closest("[data-prediction-filter-submit]")) {
          renderPredictionTaskManagementPage();
          return;
        }
        if (event.target.closest("[data-prediction-filter-reset]")) {
          Object.assign(predictionTaskFilters, { name: "", source: "全部", status: "全部", start: "", end: "" });
          renderPredictionTaskManagementPage();
          return;
        }
        const logButton = event.target.closest("[data-prediction-task-log]");
        if (logButton) {
          const task = ensurePredictionTaskRows().find((item) => item.id === logButton.dataset.predictionTaskLog);
          if (task) showPredictionTaskLog(task);
          return;
        }
        const retryButton = event.target.closest("[data-prediction-task-retry]");
        if (retryButton && !retryButton.disabled) {
          const task = ensurePredictionTaskRows().find((item) => item.id === retryButton.dataset.predictionTaskRetry);
          if (task) updatePredictionTask(task, "retry");
          return;
        }
        const cancelButton = event.target.closest("[data-prediction-task-cancel]");
        if (cancelButton && !cancelButton.disabled) {
          const task = ensurePredictionTaskRows().find((item) => item.id === cancelButton.dataset.predictionTaskCancel);
          if (task) updatePredictionTask(task, "cancel");
          return;
        }
        const resultButton = event.target.closest("[data-prediction-task-result]");
        if (resultButton && !resultButton.disabled) {
          const task = ensurePredictionTaskRows().find((item) => item.id === resultButton.dataset.predictionTaskResult);
          if (task && typeof openPredictionPage === "function") openPredictionPage(task.materialSource, task.materialId);
          return;
        }
        if (event.target.closest("[data-algorithm-detail-back]")) {
          state.algorithmPageView = "overview";
          renderAlgorithms();
          switchPage("algorithms");
        }
      });

      window.renderPredictionTaskManagementPage = renderPredictionTaskManagementPage;
      window.renderAlgorithmDocDetailPage = renderAlgorithmDocDetailPage;
    })();
  