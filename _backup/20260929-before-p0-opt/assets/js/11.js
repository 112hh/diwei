
  (function () {
    "use strict";

    const ALGORITHM_TYPES = [
      "二维材料数据库应用算法",
      "低维材料数据库应用算法",
      "机器学习力场数据库应用算法",
      "催化材料数据库应用算法"
    ];
    const ALGORITHM_CLASSIFICATIONS = {
      "二维材料数据库应用算法": ["晶体结构驰豫算法", "材料性质计算算法"],
      "低维材料数据库应用算法": ["数据爬取算法", "数据分类算法"],
      "机器学习力场数据库应用算法": ["力场格式校验算法", "力场参数生成算法"],
      "催化材料数据库应用算法": ["催化活性预测算法", "吸附能计算算法"]
    };

    function esc(value) {
      return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
        return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
      });
    }

    function nowMinute() {
      const now = new Date();
      const pad = (value) => String(value).padStart(2, "0");
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    }

    function normalizeAlgorithmRecord(record) {
      if (!record) return record;
      const oldCategory = String(record.category || "").trim();
      if (!record.algorithmType) {
        if (oldCategory.includes("低维")) record.algorithmType = "低维材料数据库应用算法";
        else if (oldCategory.includes("机器学习") || oldCategory.includes("力场")) record.algorithmType = "机器学习力场数据库应用算法";
        else if (oldCategory.includes("催化")) record.algorithmType = "催化材料数据库应用算法";
        else record.algorithmType = "二维材料数据库应用算法";
      }
      if (!record.algorithmCategory) {
        const candidates = ALGORITHM_CLASSIFICATIONS[record.algorithmType] || [];
        record.algorithmCategory = oldCategory.includes("催化") ? "催化活性预测算法" : candidates[0] || oldCategory || "";
      }
      record.category = record.algorithmCategory || record.category || "";
      record.creator = record.creator || record.owner || "管理员";
      record.createTime = record.createTime || record.createdAt || record.updatedAt || nowMinute();
      record.inputParams = Array.isArray(record.inputParams) && record.inputParams.length
        ? record.inputParams
        : [{ item: "materialId", desc: "材料编号或结构文件索引" }];
      record.outputParams = Array.isArray(record.outputParams) && record.outputParams.length
        ? record.outputParams
        : [{ item: "result", desc: "算法计算结果与图谱索引" }];
      record.exampleInput = record.exampleInput || '{"materialId":"2D-MoS2-001","structureFile":"MoS2.cif"}';
      record.exampleOutput = record.exampleOutput || '{"taskId":"TASK-20260812-001","status":"success","resultUrl":"/result/task"}';
      return record;
    }

    function normalizeAlgorithmStore() {
      if (typeof systemStore === "undefined" || !Array.isArray(systemStore.algorithms)) return;
      systemStore.algorithms.forEach(normalizeAlgorithmRecord);
      if (typeof systemState !== "undefined") {
        systemState.search["sys-algorithm"] = Object.assign({ algorithmName: "", algorithmType: "", algorithmCategory: "" }, systemState.search["sys-algorithm"] || {});
      }
      if (typeof SYSTEM_PAGE_CONFIGS !== "undefined" && SYSTEM_PAGE_CONFIGS["sys-algorithm"]) {
        SYSTEM_PAGE_CONFIGS["sys-algorithm"].searchFields = [
          { key: "algorithmName", label: "算法/接口名称", type: "text", placeholder: "请输入算法/接口名称" },
          { key: "algorithmType", label: "算法类型", type: "select", options: ["", ...ALGORITHM_TYPES] },
          { key: "algorithmCategory", label: "算法分类", type: "text", placeholder: "请输入算法分类" }
        ];
        SYSTEM_PAGE_CONFIGS["sys-algorithm"].headers = ["算法/接口名称", "算法类型", "算法分类", "接口地址", "创建人", "创建时间", "操作"];
      }
    }

    const originalRenderSystemManagementSection = typeof renderSystemManagementSection === "function" ? renderSystemManagementSection : null;
    renderSystemManagementSection = function (page, options = {}) {
      if (page !== "sys-algorithm" || typeof getSystemVisibleRecords !== "function") {
        return originalRenderSystemManagementSection ? originalRenderSystemManagementSection(page, options) : "";
      }
      normalizeAlgorithmStore();
      const cfg = SYSTEM_PAGE_CONFIGS[page];
      const searchHtml = cfg.searchFields.map((field) => renderSystemSearchField(field, page)).join("");
      const { rows, total, currentPage, totalPages, pageSize } = getSystemVisibleRecords(page);
      return `
        <section class="sys-table-card card">
          <div class="sys-toolbar">
            <div><h3>${options.title || "算法/接口管理"}</h3><p>${options.desc || "统一维护平台算法资源、接口地址、输入输出参数与示例调用内容。"}</p></div>
            <div class="sys-toolbar-actions"><span class="sys-count">共<strong>${total}</strong> 条</span><button class="btn-primary" type="button" data-sys-add="sys-algorithm">新增</button></div>
          </div>
          <section class="sys-search-card card" style="margin-bottom:16px;">
            <div class="sys-search-grid">${searchHtml}</div>
            <div class="twod-action-bar" style="margin-top:14px;"><div class="action-row"><button class="btn-primary" type="button" data-sys-search="sys-algorithm">查询</button><button class="btn" type="button" data-sys-reset="sys-algorithm">重置</button></div></div>
          </section>
          <div class="table-wrap twod-result-table-wrap">
            <table class="twod-result-table">
              <thead><tr>${cfg.headers.map((item) => `<th>${item}</th>`).join("")}</tr></thead>
              <tbody>${rows.length ? rows.map((record) => renderSystemRow(page, record)).join("") : `<tr><td colspan="${cfg.headers.length}"><div class="sys-empty">暂无数据</div></td></tr>`}</tbody>
            </table>
          </div>
          ${renderSystemPaginationFooter(page, total, currentPage, totalPages, pageSize)}
        </section>
      `;
    };

    const originalRenderSystemRow = typeof renderSystemRow === "function" ? renderSystemRow : null;
    renderSystemRow = function (page, record) {
      if (page !== "sys-algorithm") return originalRenderSystemRow ? originalRenderSystemRow(page, record) : "";
      normalizeAlgorithmRecord(record);
      const viewBtn = `<button class="table-action-link" type="button" data-sys-view="${page}" data-id="${record.id}">查看</button>`;
      const testBtn = `<button class="table-action-link" type="button" data-sys-test-algorithm="${record.id}">测试</button>`;
      const editBtn = `<button class="table-action-link" type="button" data-sys-edit="${page}" data-id="${record.id}">编辑</button>`;
      const deleteBtn = `<button class="table-action-link" type="button" data-sys-delete="${page}" data-id="${record.id}">删除</button>`;
      return `<tr>
        <td title="${esc(record.algorithmName)}">${esc(record.algorithmName)}</td>
        <td title="${esc(record.algorithmType)}">${esc(record.algorithmType)}</td>
        <td title="${esc(record.algorithmCategory)}">${esc(record.algorithmCategory)}</td>
        <td title="${esc(record.endpoint)}">${esc(record.endpoint)}</td>
        <td title="${esc(record.creator)}">${esc(record.creator)}</td>
        <td title="${esc(record.createTime)}">${esc(record.createTime)}</td>
        <td class="action-cell">${viewBtn}${testBtn}${editBtn}${deleteBtn}</td>
      </tr>`;
    };

    function getAlgorithmRecord(id) {
      return systemStore.algorithms.find((item) => String(item.id) === String(id));
    }

    function classificationOptions(type, selected) {
      const options = ALGORITHM_CLASSIFICATIONS[type] || [];
      return options.map((option) => `<option value="${esc(option)}"${String(option) === String(selected) ? " selected" : ""}>${esc(option)}</option>`).join("");
    }

    function renderParamRows(kind, rows, readonly) {
      const list = Array.isArray(rows) && rows.length ? rows : [{ item: "", desc: "" }];
      return list.map((row, index) => `
        <tr>
          <td style="width:72px;">${index + 1}</td>
          <td><input type="text" value="${esc(row.item || "")}" data-algo-param-field="item"${readonly ? " disabled" : ""}></td>
          <td><input type="text" value="${esc(row.desc || "")}" data-algo-param-field="desc"${readonly ? " disabled" : ""}></td>
          <td style="width:86px;">${readonly ? "-" : `<button class="algo-param-delete" type="button" data-algo-param-delete="${kind}">删除</button>`}</td>
        </tr>
      `).join("");
    }

    function renderParamSection(title, kind, rows, readonly) {
      return `
        <section class="algo-interface-section">
          <h4>${esc(title)}</h4>
          <div class="algo-param-table-wrap">
            <table class="algo-param-table" data-param-list="${esc(kind)}">
              <thead><tr><th style="width:72px;">序号</th><th>输入项</th><th>说明</th><th style="width:86px;">操作</th></tr></thead>
              <tbody>${renderParamRows(kind, rows, readonly)}</tbody>
            </table>
          </div>
          ${readonly ? "" : `<div class="algo-param-tools"><button class="btn" type="button" data-algo-param-add="${esc(kind)}">新增</button></div>`}
        </section>
      `.replace("输入项", kind === "outputParams" ? "输出项" : "输入项");
    }

    function renderAlgorithmInterfaceForm(record, mode) {
      const readonly = mode === "view";
      const disabled = readonly ? " disabled" : "";
      const typeValue = record.algorithmType || ALGORITHM_TYPES[0];
      const categoryValue = record.algorithmCategory || (ALGORITHM_CLASSIFICATIONS[typeValue] || [])[0] || "";
      const richEditable = readonly ? "false" : "true";
      return `
        <form class="sys-modal-form algo-interface-form" id="systemCrudForm">
          <section class="algo-interface-section">
            <h4>基本信息</h4>
            <div class="algo-interface-grid">
              <div class="field">
                <label>算法/接口名称</label>
                <input name="algorithmName" type="text" maxlength="20" value="${esc(record.algorithmName || "")}" placeholder="请输入20字以内名称"${disabled}>
              </div>
              <div class="field">
                <label>算法类型</label>
                <select name="algorithmType" id="algorithmInterfaceType"${disabled}>
                  ${ALGORITHM_TYPES.map((type) => `<option value="${esc(type)}"${type === typeValue ? " selected" : ""}>${esc(type)}</option>`).join("")}
                </select>
              </div>
              <div class="field">
                <label>算法分类</label>
                <select name="algorithmCategory" id="algorithmInterfaceCategory"${disabled}>${classificationOptions(typeValue, categoryValue)}</select>
              </div>
              <div class="field">
                <label>版本</label>
                <input name="version" type="text" value="${esc(record.version || "")}" placeholder="请输入版本，如 v1.0"${disabled}>
              </div>
              <div class="field is-wide">
                <label>接口地址</label>
                <input name="endpoint" type="text" value="${esc(record.endpoint || "")}" placeholder="请输入接口地址，如 /api/v1/algorithms/twod/relax"${disabled}>
              </div>
              <div class="field is-wide">
                <label>算法介绍</label>
                <textarea name="remark" maxlength="1000" placeholder="请输入算法用途、适用材料和计算特点，1000字以内"${disabled}>${esc(record.remark || record.desc || "")}</textarea>
              </div>
            </div>
          </section>
          ${renderParamSection("输入参数", "inputParams", record.inputParams, readonly)}
          ${renderParamSection("输出结果", "outputParams", record.outputParams, readonly)}
          <section class="algo-interface-section">
            <h4>示例展示</h4>
            <div class="algo-rich-grid">
              <div class="field">
                <label>示例输入</label>
                <div class="algo-rich-editor" data-rich-name="exampleInput" contenteditable="${richEditable}" role="textbox" aria-label="示例输入">${esc(record.exampleInput || "")}</div>
              </div>
              <div class="field">
                <label>示例输出</label>
                <div class="algo-rich-editor" data-rich-name="exampleOutput" contenteditable="${richEditable}" role="textbox" aria-label="示例输出">${esc(record.exampleOutput || "")}</div>
              </div>
            </div>
          </section>
        </form>
      `;
    }

    const originalOpenSystemCrudModal = typeof openSystemCrudModal === "function" ? openSystemCrudModal : null;
    openSystemCrudModal = function (page, mode, id = null) {
      if (page !== "sys-algorithm") {
        if (originalOpenSystemCrudModal) return originalOpenSystemCrudModal(page, mode, id);
        return;
      }
      normalizeAlgorithmStore();
      const body = document.getElementById("systemCrudModalBody");
      const footer = document.getElementById("systemCrudModalFooter");
      const title = document.getElementById("systemCrudModalTitle");
      const subtitle = document.getElementById("systemCrudModalSubtitle");
      const record = normalizeAlgorithmRecord(id == null ? {} : Object.assign({}, getAlgorithmRecord(id) || {}));
      if (!body || !footer || !title || !subtitle) return;
      systemState.modal = { page, mode, id };
      title.textContent = mode === "add" ? "新增算法/接口" : mode === "edit" ? "编辑算法/接口" : "查看算法/接口";
      subtitle.textContent = "维护算法类型、算法分类、接口地址、输入输出参数与示例调用内容";
      body.innerHTML = renderAlgorithmInterfaceForm(record, mode);
      footer.innerHTML = mode === "view"
        ? `<button class="btn-primary" type="button" data-close-modal="systemCrudModal">关闭</button>`
        : `<button class="btn" type="button" data-close-modal="systemCrudModal">取消</button><button class="btn-primary" type="button" data-sys-save="sys-algorithm">保存</button>`;
      openModal("systemCrudModal");
    };

    function collectParamRows(kind) {
      const table = document.querySelector(`.algo-param-table[data-param-list="${kind}"]`);
      if (!table) return [];
      return Array.from(table.querySelectorAll("tbody tr")).map((row) => {
        const item = row.querySelector('[data-algo-param-field="item"]')?.value.trim() || "";
        const desc = row.querySelector('[data-algo-param-field="desc"]')?.value.trim() || "";
        return { item, desc };
      }).filter((row) => row.item || row.desc);
    }

    function collectAlgorithmInterfacePayload() {
      const form = document.getElementById("systemCrudForm");
      if (!form) return null;
      const name = String(form.elements.namedItem("algorithmName")?.value || "").trim();
      const type = String(form.elements.namedItem("algorithmType")?.value || "").trim();
      const category = String(form.elements.namedItem("algorithmCategory")?.value || "").trim();
      const version = String(form.elements.namedItem("version")?.value || "").trim();
      const endpoint = String(form.elements.namedItem("endpoint")?.value || "").trim();
      const remark = String(form.elements.namedItem("remark")?.value || "").trim();
      return {
        algorithmName: name,
        algorithmCode: name ? name.toLowerCase().replace(/\s+/g, "_").replace(/[^\w\u4e00-\u9fa5]/g, "") : "",
        algorithmType: type,
        algorithmCategory: category,
        category,
        version,
        endpoint,
        remark,
        inputParams: collectParamRows("inputParams"),
        outputParams: collectParamRows("outputParams"),
        exampleInput: document.querySelector('[data-rich-name="exampleInput"]')?.innerHTML.trim() || "",
        exampleOutput: document.querySelector('[data-rich-name="exampleOutput"]')?.innerHTML.trim() || ""
      };
    }

    const originalSaveSystemRecord = typeof saveSystemRecord === "function" ? saveSystemRecord : null;
    saveSystemRecord = function () {
      const modal = systemState.modal || {};
      if (modal.page !== "sys-algorithm") {
        if (originalSaveSystemRecord) return originalSaveSystemRecord();
        return;
      }
      const payload = collectAlgorithmInterfacePayload();
      if (!payload) return;
      if (!payload.algorithmName || !payload.algorithmType || !payload.algorithmCategory) {
        showToast("保存失败", "请完整填写算法/接口名称、算法类型和算法分类。", "warning");
        return;
      }
      if (payload.algorithmName.length > 20) {
        showToast("保存失败", "算法/接口名称需控制在20字以内。", "warning");
        return;
      }
      if (payload.remark.length > 1000) {
        showToast("保存失败", "算法介绍需控制在1000字以内。", "warning");
        return;
      }
      const stamp = nowMinute();
      if (modal.mode === "add") {
        const nextId = Math.max(0, ...systemStore.algorithms.map((item) => Number(item.id) || 0)) + 1;
        systemStore.algorithms.unshift({
          id: nextId,
          creator: "管理员",
          owner: "管理员",
          createTime: stamp,
          updatedAt: stamp,
          status: "启用",
          healthStatus: "未检测",
          lastCheckedAt: "/",
          ...payload
        });
      } else {
        const record = getAlgorithmRecord(modal.id);
        if (record) Object.assign(record, payload, { updatedAt: stamp });
      }
      closeModal("systemCrudModal");
      normalizeAlgorithmStore();
      renderSystemPages();
      showToast("保存成功", "算法/接口信息已更新。", "success");
    };

    function refreshParamTable(kind) {
      const table = document.querySelector(`.algo-param-table[data-param-list="${kind}"]`);
      if (!table) return;
      table.querySelector("tbody").innerHTML = renderParamRows(kind, collectParamRows(kind).concat([{ item: "", desc: "" }]), false);
    }

    document.addEventListener("change", function (event) {
      const select = event.target.closest("#algorithmInterfaceType");
      if (!select) return;
      const category = document.getElementById("algorithmInterfaceCategory");
      if (!category) return;
      category.innerHTML = classificationOptions(select.value, "");
    });

    document.addEventListener("click", function (event) {
      const add = event.target.closest("[data-algo-param-add]");
      if (add) {
        refreshParamTable(add.dataset.algoParamAdd);
        return;
      }
      const del = event.target.closest("[data-algo-param-delete]");
      if (del) {
        const row = del.closest("tr");
        const tbody = row && row.parentElement;
        if (row && tbody && tbody.children.length > 1) row.remove();
      }
    });

    normalizeAlgorithmStore();
    if (typeof renderSystemPage === "function") {
      setTimeout(function () {
        renderSystemPage("sys-algorithm");
        renderSystemPage("sys-api");
      }, 0);
    }
  })();
  