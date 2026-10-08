
(() => {
  if (typeof state === "undefined" || typeof optoMaterials === "undefined") return;
  const h = window.__optoRequestedHelpers;
  if (!h) return;
  const { metadataMarkup, structureSvg, spectraCard, parameterMarkup, esc, shown } = h;

  function externalRows(material) {
    return [
      { type: "文献论文", platform: "图书馆论文检索系统", id: "DOI:10.1039/D3TA01245A", url: "https://doi.org/10.1039/D3TA01245A", note: "电导率、玻璃化转变温度原始文献" },
      { type: "外部化学数据库", platform: "PubChem", id: `CID:${material.moleculeNumber.replace(/\D/g, "") || "17789"}`, url: `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(material.casNumber)}`, note: "高分子单体结构拓展信息" }
    ];
  }

  function basicPage(material) {
    return `<section class="opto-detail-page active" data-opto-detail-page="basic">
      <div class="opto-detail-page-head"><div><h4>详情信息</h4><p>展示分子结构与材料基础身份信息。</p></div></div>
      <div class="opto-basic-layout">
        <article class="opto-detail-card"><div class="opto-card-head"><h5>分子结构图</h5><span>${esc(material.formula)}</span></div><div class="opto-structure-stage">${typeof renderLowDimRealViewer === "function" ? (renderLowDimRealViewer("opto", material) || `<div class="material-atom-cluster">${structureSvg(material)}</div>`) : `<div class="material-atom-cluster">${structureSvg(material)}</div>`}</div><div class="opto-structure-downloads"><button class="opto-download-btn" type="button" data-opto-file-download="structure">结构文件下载</button><button class="opto-download-btn" type="button" data-opto-file-download="ground">基态结构文件下载</button><button class="opto-download-btn" type="button" data-opto-file-download="excited">激发态结构文件下载</button></div></article>
        ${metadataMarkup(material)}
      </div>
    </section>`;
  }

  function spectraPage(material) {
    return `<section class="opto-detail-page active" data-opto-detail-page="spectra">
      <div class="opto-detail-page-head"><div><h4>表征图谱</h4><p>基础信息与三类分子表征图谱集中展示。</p></div></div>
      ${metadataMarkup(material, true)}
      <div class="opto-spectrum-grid">${spectraCard("红外光谱", "ir", "#3978d2", "横坐标为波数（cm⁻¹），用于识别分子振动吸收特征峰。")}${spectraCard("拉曼光谱", "raman", "#7a5bd6", "展示分子振动产生的拉曼散射强度与特征位移。")}${spectraCard("核磁共振光谱", "nmr", "#1c9b73", "展示模拟化学位移及主要共振峰分布。")}</div>
    </section>`;
  }

  function paramsPage(material) {
    return `<section class="opto-detail-page active" data-opto-detail-page="params">
      <div class="opto-detail-page-head"><div><h4>特征参数</h4><p>集中展示物性数据和量子化学计算数据。</p></div></div>
      ${metadataMarkup(material, true)}
      <h5 class="opto-section-title">物性数据</h5><div class="opto-parameter-grid">${parameterMarkup("相对密度", material.relativeDensity)}${parameterMarkup("熔点", material.meltingPoint)}${parameterMarkup("沸点", material.boilingPoint)}${parameterMarkup("闪点", material.flashPoint)}</div>
      <h5 class="opto-section-title">计算数据</h5><div class="opto-parameter-grid">${parameterMarkup("激发能", material.excitedEnergy)}${parameterMarkup("放射能", material.emissionEnergy)}${parameterMarkup("跃迁偶极矩", material.transitionDipole)}${parameterMarkup("HOMO能级", `${shown(material.homo)} eV`)}${parameterMarkup("LUMO能级", `${shown(material.lumo)} eV`)}${parameterMarkup("溶剂化自由能", material.solvationFreeEnergy)}${parameterMarkup("斯托克斯位移", material.stokesShift)}${parameterMarkup("简正模式", material.normalModes)}</div>
    </section>`;
  }

  function externalPage(material) {
    return `<section class="opto-detail-page active" data-opto-detail-page="external">
      <div class="opto-detail-page-head"><div><h4>外部数据关联</h4><p>汇总论文检索系统与外部化学数据库的关联记录。</p></div></div>
      <div class="opto-detail-card opto-external-table-wrap"><table class="opto-external-table"><colgroup><col style="width:12%"><col style="width:16%"><col style="width:19%"><col style="width:25%"><col style="width:20%"><col style="width:8%"></colgroup><thead><tr><th>关联类型</th><th>外部平台名称</th><th>标识编号</th><th>跳转链接</th><th>来源备注</th><th>操作</th></tr></thead><tbody>${externalRows(material).map((row) => `<tr><td>${esc(row.type)}</td><td>${esc(row.platform)}</td><td>${esc(row.id)}</td><td class="opto-external-url">${esc(row.url)}</td><td>${esc(row.note)}</td><td><button class="opto-link-button" type="button" data-opto-external-url="${esc(row.url)}">打开链接</button></td></tr>`).join("")}</tbody></table></div>
    </section>`;
  }

  function renderRequestedOptoDetailPage(material) {
    if (!material) return;
    const page = document.getElementById("page-twod-detail");
    const title = document.getElementById("twodDetailPageTitle");
    const subtitle = document.getElementById("twodDetailPageSubtitle");
    const tree = document.getElementById("twodDetailTree");
    const content = document.getElementById("twodDetailPageContent");
    if (!page || !tree || !content) return;
    page.dataset.source = "opto";
    if (title) title.textContent = `${material.chineseName} 材料详情`;
    if (subtitle) subtitle.textContent = `材料编号 ${material.materialNumber} · 分子编号 ${material.moleculeNumber} · CAS号 ${material.casNumber}`;
    const section = ["basic", "spectra", "params", "external"].includes(state.selectedTwodDetailSection) ? state.selectedTwodDetailSection : "basic";
    state.selectedTwodDetailSection = section;
    tree.innerHTML = [["basic", "详情信息"], ["spectra", "表征图谱"], ["params", "特征参数"], ["external", "外部数据关联"]].map(([key, label]) => `<div class="twod-tree-item"><button class="twod-tree-node${section === key ? " active" : ""}" type="button" data-opto-detail-nav="${key}">${label}</button></div>`).join("");
    const renderers = { basic: basicPage, spectra: spectraPage, params: paramsPage, external: externalPage };
    content.innerHTML = `<div class="opto-custom-detail">${renderers[section](material)}</div>`;
  }

  renderOptoDetailPage = renderRequestedOptoDetailPage;
  window.renderOptoDetailPage = renderOptoDetailPage;
  openOptoDetailSection = function openRequestedOptoDetailSection(section) {
    state.selectedTwodDetailSection = section;
    const material = optoMaterials.find((item) => item.id === state.selectedMaterialId) || optoMaterials[0];
    renderRequestedOptoDetailPage(material);
    return false;
  };
  window.openOptoDetailSection = openOptoDetailSection;

  const previousStandaloneHandle = handleMaterialDetailOpen;
  handleMaterialDetailOpen = function handleRequestedOptoStandalone(materialToken, targetView = "basic") {
    const token = String(materialToken || "");
    if (token.startsWith("opto:") && targetView !== "prediction") {
      const material = optoMaterials.find((item) => item.id === token.slice(5)) || optoMaterials[0];
      state.selectedMaterialSource = "opto";
      state.selectedMaterialId = material.id;
      state.twodDetailReturnPage = state.page === "twod-detail" ? "opto" : (state.page || "opto");
      const targetMap = { spectra: "spectra", params: "params", properties: "params", external: "external" };
      state.selectedTwodDetailSection = targetMap[targetView] || "basic";
      document.getElementById("materialModal")?.classList.remove("show");
      if (typeof switchPage === "function") switchPage("twod-detail");
      window.setTimeout(() => {
        renderRequestedOptoDetailPage(material);
        const viewerNode = document.querySelector('#page-twod-detail[data-source="opto"] .mol3d-viewer');
        const viewer = viewerNode?.__lowDimMolViewer;
        if (viewerNode && viewer) {
          try { viewer.resize(); viewer.zoomTo(); viewer.render(); } catch (error) {}
        }
      }, 60);
      return false;
    }
    return previousStandaloneHandle(materialToken, targetView);
  };
  window.handleMaterialDetailOpen = handleMaterialDetailOpen;

  document.body.addEventListener("click", (event) => {
    const button = event.target.closest?.("#twodDetailTree [data-opto-detail-nav]");
    if (!button || state.selectedMaterialSource !== "opto") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openOptoDetailSection(button.dataset.optoDetailNav);
  }, true);
})();
