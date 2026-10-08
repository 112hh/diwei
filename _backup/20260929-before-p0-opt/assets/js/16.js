
  (() => {
    if (window.__TWOD_CONVERT_LAYOUT_FINAL_READY__) return;
    window.__TWOD_CONVERT_LAYOUT_FINAL_READY__ = true;

    const originalRenderMaterialConversionPanel = typeof renderMaterialConversionPanel === "function"
      ? renderMaterialConversionPanel
      : null;

    function renderTwodConvertRecordRows(records, isTwodConvert) {
      return records.length
        ? records.map((record) => `
            <tr>
              <td class="material-convert-time-cell" title="${escapeHtml(record.createdAt || "-")}">${escapeHtml(record.createdAt || "-")}</td>
              <td title="${escapeHtml(record.materialName || "-")}">${escapeHtml(record.materialName || "-")}</td>
              <td title="${escapeHtml(record.fileType || "-")}">${escapeHtml(record.fileType || "-")}</td>
              <td title="${escapeHtml(record.sourceName || "-")}">${escapeHtml(record.sourceName || "-")}</td>
              <td>${escapeHtml(record.sourceFormat || "-")}</td>
              <td>${escapeHtml(record.targetFormat || "-")}</td>
              <td><span class="status-badge success">${escapeHtml(record.status || "-")}</span></td>
              <td>
                <div class="table-actions material-convert-actions-nowrap">
                  <button class="btn btn-sm" type="button" data-material-convert-detail="${escapeHtml(record.id)}">查看</button>
                  <button class="btn btn-sm" type="button" data-material-convert-download="${escapeHtml(record.id)}">${isTwodConvert ? "下载文件" : "下载"}</button>
                </div>
              </td>
            </tr>
          `).join("")
        : `<tr><td colspan="8"><div class="sys-empty">暂无符合条件的转换记录</div></td></tr>`;
    }

    renderMaterialConversionPanel = function renderMaterialConversionPanelTwodLayout(moduleKey) {
      if (moduleKey !== "twod" || !originalRenderMaterialConversionPanel) {
        return originalRenderMaterialConversionPanel ? originalRenderMaterialConversionPanel(moduleKey) : "";
      }

      const config = getMaterialConversionModule(moduleKey);
      const draft = getMaterialConversionDraft(moduleKey);
      const filters = getMaterialConvertFilters(moduleKey);
      const records = getMaterialConversionRecords(moduleKey);
      const options = config.materialOptions();
      const convertTypes = ["结构文件", "计算数据", "可视化文件"];
      const targetFormats = getMaterialConvertTargetFormats(draft.fileType, draft.sourceFormat);
      const sourceText = draft.fileName
        ? `源格式：${draft.sourceFormat || "自动识别"} · ${draft.fileSizeText || "本地上传文件"}`
        : "支持 CIF、POSCAR、XYZ、CSV、JSON、图片等二维材料文件";

      const recordTools = `
        <div class="material-convert-record-toolbar">
          <div class="material-convert-record-search">
            <input type="text" value="${escapeHtml(filters.keyword || "")}" placeholder="材料名 / 源文件 / 结果文件" data-material-convert-filter="keyword" data-module="${moduleKey}">
          </div>
          <label class="material-convert-filter-field">
            <span>转换类型</span>
            <select data-material-convert-filter="type" data-module="${moduleKey}">
              <option value="">全部</option>
              ${convertTypes.map((item) => `<option value="${item}"${filters.type === item ? " selected" : ""}>${item}</option>`).join("")}
            </select>
          </label>
          <label class="material-convert-filter-field">
            <span>转换状态</span>
            <select data-material-convert-filter="status" data-module="${moduleKey}">
              <option value="">全部</option>
              ${["已完成", "转换中"].map((item) => `<option value="${item}"${filters.status === item ? " selected" : ""}>${item}</option>`).join("")}
            </select>
          </label>
          <div class="material-convert-record-actions">
            <button class="btn-primary" type="button" data-material-convert-search="${moduleKey}">查询</button>
            <button class="btn" type="button" data-material-convert-reset="${moduleKey}">重置</button>
          </div>
        </div>
      `;

      return `
        <div class="material-convert-shell material-convert-shell-twod-final" data-material-convert-module="${moduleKey}">
          <section class="card pad material-convert-workbench material-convert-workbench-final">
            <div class="material-convert-head">
              <div>
                <span class="twod-search-eyebrow">${escapeHtml(config.eyebrow)}</span>
                <h3>${escapeHtml(config.title)}</h3>
                <p>${escapeHtml(config.desc)}</p>
              </div>
            </div>
            <div class="material-convert-workbench-grid">
              <div class="material-convert-side material-convert-side-left">
                <div class="material-convert-side-head">
                  <h4>选择转换内容</h4>
                  <p>先选择文件类型和二维材料，再上传待转换文件。</p>
                </div>
                <div class="material-convert-type-row material-convert-type-row-left">
                  ${convertTypes.map((type) => `
                    <button class="material-convert-type${draft.fileType === type ? " active" : ""}" type="button" data-material-convert-type="${type}" data-module="${moduleKey}">${type}</button>
                  `).join("")}
                </div>
                <div class="field material-convert-material-field">
                  <label for="materialConvertMaterialSelectTwod">二维材料</label>
                  <select id="materialConvertMaterialSelectTwod" data-material-convert-field="materialId" data-module="${moduleKey}">
                    ${options.map((item) => `<option value="${escapeHtml(item.id)}"${draft.materialId === item.id ? " selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}
                  </select>
                </div>
                <div class="material-convert-drop material-convert-drop-left">
                  <div class="material-convert-drop-icon" aria-hidden="true">↑</div>
                  <strong>${escapeHtml(draft.fileName || "上传二维材料文件")}</strong>
                  <span>${escapeHtml(sourceText)}</span>
                  <button class="material-convert-upload-btn" type="button" data-material-convert-upload="${moduleKey}">选择文件</button>
                  <input type="file" hidden data-material-convert-file="${moduleKey}" accept=".cif,.vasp,.poscar,.contcar,.xyz,.pdb,.csv,.json,.yaml,.yml,.hdf5,.h5,.npz,.xlsx,.xls,.dat,.txt,.png,.jpg,.jpeg,.svg,.tif,.tiff">
                </div>
                <p class="material-convert-type-note material-convert-type-note-left">${escapeHtml(materialConversionTypeDescriptions[draft.fileType] || "")}</p>
              </div>
              <div class="material-convert-side material-convert-side-right">
                <div class="material-convert-side-head">
                  <h4>选择转换类型</h4>
                  <p>根据已上传文件选择目标格式，转换结果将自动记录。</p>
                </div>
                <div class="material-convert-form material-convert-form-right">
                  <div class="field">
                    <label for="materialConvertTargetFormatTwod">目标格式</label>
                    <select id="materialConvertTargetFormatTwod" data-material-convert-field="targetFormat" data-module="${moduleKey}" ${draft.fileName ? "" : "disabled"}>
                      ${targetFormats.map((format) => `<option value="${escapeHtml(format)}"${draft.targetFormat === format ? " selected" : ""}>${escapeHtml(format)}</option>`).join("")}
                    </select>
                  </div>
                </div>
                <div class="material-convert-summary-wrap">
                  ${buildMaterialConvertSummary([
                    { label: "转换类型", value: draft.fileType },
                    { label: "源文件", value: draft.fileName || "待上传" },
                    { label: "源格式", value: draft.sourceFormat || "自动识别" },
                    { label: "目标格式", value: draft.targetFormat || "-" }
                  ])}
                </div>
                <div class="twod-convert-actions material-convert-actions-right">
                  <button class="btn-primary" type="button" data-material-convert-start="${moduleKey}" ${draft.fileName && draft.targetFormat ? "" : "disabled"}>开始转换</button>
                  <button class="btn" type="button" data-material-convert-clear="${moduleKey}">清空文件</button>
                </div>
              </div>
            </div>
          </section>

          <section class="card pad material-convert-record-card">
            <div class="material-convert-record-title">
              <h3>转换记录</h3>
              <p>支持按文件名、材料名、转换类型和状态查询历史记录，并可查看详情或下载结果文件。</p>
            </div>
            ${recordTools}
            <div class="table-wrap twod-result-table-wrap material-convert-record-table-wrap">
              <table class="twod-result-table material-convert-record-table">
                <thead>
                  <tr>
                    <th class="material-convert-time-cell">转换时间</th>
                    <th>材料名称</th>
                    <th>转换类型</th>
                    <th>源文件</th>
                    <th>源格式</th>
                    <th>目标格式</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>${renderTwodConvertRecordRows(records, true)}</tbody>
              </table>
            </div>
            <div class="material-convert-record-footer">
              <span>共计 ${records.length} 条转换记录</span>
              <div class="material-convert-record-pager" aria-label="转换记录分页">
                <button type="button" disabled aria-label="上一页">‹</button>
                <button type="button" class="active">1</button>
                <button type="button" disabled aria-label="下一页">›</button>
                <select class="material-convert-record-page-size" aria-label="每页条数">
                  <option>10 条/页</option>
                </select>
              </div>
            </div>
          </section>
        </div>
      `;
    };

    const style = document.createElement("style");
    style.id = "twod-convert-layout-final-style";
    style.textContent = `
      .material-convert-workbench-final {
        overflow: hidden;
      }
      .material-convert-workbench-grid {
        display: grid;
        grid-template-columns: minmax(300px, 0.92fr) minmax(360px, 1.08fr);
        align-items: stretch;
        margin: 22px -20px -20px;
        border-top: 1px solid #dbe5f6;
      }
      .material-convert-side {
        min-width: 0;
        padding: 22px 24px 24px;
      }
      .material-convert-side-left {
        border-right: 1px solid #dbe5f6;
        background: #fbfdff;
      }
      .material-convert-side-right {
        background: #ffffff;
      }
      .material-convert-side-head h4 {
        margin: 0 0 6px;
        color: #223657;
        font-size: 16px;
        line-height: 24px;
      }
      .material-convert-side-head p {
        margin: 0;
        color: #6f8298;
        font-size: 13px;
        line-height: 21px;
      }
      .material-convert-type-row-left {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        margin: 18px 0 10px;
      }
      .material-convert-type-row-left .material-convert-type {
        min-width: 0;
        padding: 10px 8px;
        white-space: nowrap;
      }
      .material-convert-material-field {
        margin-top: 18px;
      }
      .material-convert-drop-left {
        display: flex;
        min-height: 194px;
        align-items: center;
        justify-content: center;
        text-align: center;
        margin-top: 18px;
        padding: 22px 18px;
        border: 1px dashed #a9bfe9;
        border-radius: 12px;
        background: #f7faff;
      }
      .material-convert-drop-left .material-convert-drop-icon {
        display: grid;
        width: 38px;
        height: 38px;
        place-items: center;
        margin-bottom: 8px;
        border-radius: 50%;
        background: #e8f0ff;
        color: #2453d4;
        font-size: 22px;
        font-weight: 700;
      }
      .material-convert-form-right {
        max-width: 420px;
        margin-top: 24px;
      }
      .material-convert-summary-wrap {
        max-width: 620px;
        margin-top: 22px;
      }
      .material-convert-actions-right {
        justify-content: flex-start;
        margin-top: 24px;
      }
      .material-convert-record-table-wrap {
        overflow-x: auto;
      }
      .material-convert-record-table {
        min-width: 1120px;
        table-layout: auto;
      }
      .material-convert-record-table th,
      .material-convert-record-table td {
        vertical-align: middle;
      }
      .material-convert-record-table .material-convert-time-cell {
        width: 168px;
        min-width: 168px;
        white-space: nowrap;
        word-break: keep-all;
        font-variant-numeric: tabular-nums;
      }
      .material-convert-record-table td:nth-child(2) {
        min-width: 120px;
        white-space: nowrap;
      }
      .material-convert-record-table td:nth-child(4) {
        min-width: 180px;
        white-space: nowrap;
      }
      .material-convert-actions-nowrap {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        flex-wrap: nowrap;
        white-space: nowrap;
      }
      #page-twod-convert table th:nth-child(4),
      #page-twod-convert table td:nth-child(4) {
        min-width: 168px;
        white-space: nowrap;
        word-break: keep-all;
        font-variant-numeric: tabular-nums;
      }
      @media (max-width: 900px) {
        .material-convert-workbench-grid {
          grid-template-columns: 1fr;
        }
        .material-convert-side-left {
          border-right: 0;
          border-bottom: 1px solid #dbe5f6;
        }
      }
      @media (max-width: 560px) {
        .material-convert-type-row-left {
          grid-template-columns: 1fr;
        }
        .material-convert-side {
          padding: 18px 16px 20px;
        }
        .material-convert-workbench-grid {
          margin-left: -16px;
          margin-right: -16px;
        }
      }
    `;
    document.head.appendChild(style);

    if (typeof renderTwodModuleUnified === "function" && state?.twodTab === "convert") {
      setTimeout(() => renderTwodModuleUnified(), 0);
    }
  })();
  