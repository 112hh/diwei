
(() => {
  if (typeof state === "undefined" || typeof optoMaterials === "undefined") return;

  const escSystem = (value) => typeof escapeLowDimHtml === "function" ? escapeLowDimHtml(value == null ? "" : String(value)) : String(value ?? "");
  const display = (value) => value == null || value === "" ? "未记录" : String(value);

  function systemBasicRows(material) {
    return [
      { label: "中文名称", value: material.chineseName || material.nameZh || material.name },
      { label: "英文名称", value: material.englishName || material.nameEn || material.english || material.name },
      { label: "分子式/化学式", value: material.formula },
      { label: "材料编号", value: material.materialNumber || material.code || material.id },
      { label: "分子编号", value: material.moleculeNumber || material.code || material.id },
      { label: "CAS号", value: material.casNumber },
      { label: "分子量", value: `${display(material.molecularWeight)} g/mol` }
    ];
  }

  function systemBasicTable(material) {
    return `<section class="twod-detail-table-card"><h5 class="twod-detail-material-title">基础信息</h5>${renderDetailKvSection("", systemBasicRows(material))}</section>`;
  }

  function systemStructureCard(material) {
    const realViewer = typeof renderLowDimRealViewer === "function" ? renderLowDimRealViewer("opto", material) : "";
    const structure = realViewer ? null : (typeof buildOptoStructureView === "function" ? buildOptoStructureView(material) : null);
    const fallback = structure ? `<div class="material-atom-cluster">${renderMaterialStructureMarkup(structure)}</div><div class="material-legend">${(structure.legend || []).map((item) => `<span><i class="legend-dot" style="background:${item.color};"></i>${item.label}</span>`).join("")}</div>` : `<div class="twod-detail-empty-state"><strong>暂无结构数据</strong></div>`;
    return `<section class="twod-detail-visual-card"><h5>3D分子结构图</h5><div class="twod-detail-structure-stage">${realViewer || fallback}<div class="chart-caption">${realViewer ? "真实分子坐标，可拖拽旋转、滚轮缩放并切换显示样式。" : "当前材料的三维分子结构示意。"}</div></div><div class="opto-system-download-row"><button class="twod-detail-link-btn" type="button" data-opto-file-download="structure">结构文件下载</button><button class="twod-detail-link-btn" type="button" data-opto-file-download="ground">基态结构文件下载</button><button class="twod-detail-link-btn" type="button" data-opto-file-download="excited">激发态结构文件下载</button></div></section>`;
  }

  function systemMetaSection(material) {
    return `<section class="twod-detail-section-card opto-system-meta-card"><h5>基础信息</h5>${renderDetailKvSection("", systemBasicRows(material))}</section>`;
  }

  function renderSystemOptoDetailPage(material) {
    const page = document.getElementById("page-twod-detail");
    const title = document.getElementById("twodDetailPageTitle");
    const subtitle = document.getElementById("twodDetailPageSubtitle");
    const tree = document.getElementById("twodDetailTree");
    const content = document.getElementById("twodDetailPageContent");
    if (!page || !tree || !content || !material) return;
    page.dataset.source = "opto";
    const section = ["basic", "spectra", "params", "external"].includes(state.selectedTwodDetailSection) ? state.selectedTwodDetailSection : "basic";
    state.selectedTwodDetailSection = section;
    if (title) title.textContent = `${material.chineseName || material.name} 材料详情`;
    if (subtitle) subtitle.textContent = `材料编号 ${material.materialNumber || material.code || material.id} · 分子编号 ${material.moleculeNumber || material.code || material.id} · CAS号 ${display(material.casNumber)}`;
    tree.innerHTML = [["basic", "基础信息"], ["spectra", "表征图谱"], ["params", "特征参数"], ["external", "外部数据关联"]].map(([key, label]) => `<div class="twod-tree-item"><button class="twod-tree-node${section === key ? " active" : ""}" type="button" data-opto-detail-nav="${key}">${label}</button></div>`).join("");

    if (section === "basic") {
      content.innerHTML = `<div class="twod-detail-page-head"><div><h4>基础信息</h4><p>展示材料基础身份信息与右侧 3D 分子结构图。</p></div></div><div class="twod-basic-card-grid">${systemBasicTable(material)}${systemStructureCard(material)}</div>`;
    } else if (section === "spectra") {
      content.innerHTML = `${systemMetaSection(material)}${typeof renderOptoSpectraPageContent === "function" ? renderOptoSpectraPageContent(material) : ""}`;
    } else if (section === "params") {
      content.innerHTML = typeof renderOptoParamsPageContent === "function" ? renderOptoParamsPageContent(material) : "";
    } else {
      content.innerHTML = typeof renderOptoExternalPageContent === "function" ? renderOptoExternalPageContent(material) : "";
    }
    window.setTimeout(() => {
      document.querySelectorAll('#page-twod-detail[data-source="opto"] .mol3d-viewer').forEach((node) => {
        const viewer = node.__lowDimMolViewer;
        if (viewer) { try { viewer.resize(); viewer.zoomTo(); viewer.render(); } catch (error) {} }
      });
    }, 80);
  }

  renderOptoDetailPage = renderSystemOptoDetailPage;
  window.renderOptoDetailPage = renderOptoDetailPage;
  openOptoDetailSection = function openSystemOptoDetailSection(section) {
    state.selectedTwodDetailSection = section === "structure" ? "basic" : section;
    const material = optoMaterials.find((item) => item.id === state.selectedMaterialId) || optoMaterials[0];
    renderSystemOptoDetailPage(material);
    return false;
  };
  window.openOptoDetailSection = openOptoDetailSection;

  const previousSystemHandle = handleMaterialDetailOpen;
  handleMaterialDetailOpen = function handleSystemStyleOptoDetail(materialToken, targetView = "basic") {
    const token = String(materialToken || "");
    if (token.startsWith("opto:") && targetView !== "prediction") {
      const material = optoMaterials.find((item) => item.id === token.slice(5)) || optoMaterials[0];
      state.selectedMaterialSource = "opto";
      state.selectedMaterialId = material.id;
      state.twodDetailReturnPage = state.page === "twod-detail" ? "opto" : (state.page || "opto");
      state.selectedTwodDetailSection = ({ spectra: "spectra", params: "params", properties: "params", external: "external" })[targetView] || "basic";
      document.getElementById("materialModal")?.classList.remove("show");
      if (typeof switchPage === "function") switchPage("twod-detail");
      window.setTimeout(() => renderSystemOptoDetailPage(material), 60);
      return false;
    }
    return previousSystemHandle(materialToken, targetView);
  };
  window.handleMaterialDetailOpen = handleMaterialDetailOpen;

  document.body.addEventListener("click", (event) => {
    const nav = event.target.closest?.("#twodDetailTree[data-system-opto-tree] [data-opto-detail-nav], #twodDetailTree [data-opto-detail-nav]");
    if (!nav || state.selectedMaterialSource !== "opto") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openOptoDetailSection(nav.dataset.optoDetailNav);
  }, true);

  const oldTree = renderOptoDetailTreeOverride;
  renderOptoDetailTreeOverride = function renderSystemOptoTree(material) {
    const wrap = document.getElementById("twodDetailTree");
    if (!wrap || state.selectedMaterialSource !== "opto") return oldTree(material);
    wrap.dataset.systemOptoTree = "true";
    const active = state.selectedTwodDetailSection === "structure" ? "basic" : state.selectedTwodDetailSection;
    wrap.innerHTML = [["basic", "基础信息"], ["spectra", "表征图谱"], ["params", "特征参数"], ["external", "外部数据关联"]].map(([key, label]) => `<div class="twod-tree-item"><button class="twod-tree-node${active === key ? " active" : ""}" type="button" data-opto-detail-nav="${key}">${label}</button></div>`).join("");
  };
})();
