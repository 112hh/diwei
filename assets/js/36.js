
(() => {
  if (typeof state === "undefined" || typeof optoMaterials === "undefined") return;

  const esc = (value) => String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
  const shown = (value, fallback = "暂无数据") => value == null || value === "" ? fallback : String(value);

  const profiles = {
    "OP-001": { chineseName: "N,N'-二苯基-N,N'-二(间甲苯基)-1,1'-联苯-4,4'-二胺", englishName: "N,N'-Bis(3-methylphenyl)-N,N'-diphenylbenzidine", casNumber: "65181-78-4" },
    "OP-002": { chineseName: "三(8-羟基喹啉)合铝", englishName: "Tris(8-hydroxyquinolinato)aluminium", casNumber: "2085-33-8" },
    "OP-003": { chineseName: "富勒烯 C60", englishName: "Fullerene C60", casNumber: "99685-96-8" },
    "OP-004": { chineseName: "聚(3-己基噻吩)", englishName: "Poly(3-hexylthiophene)", casNumber: "104934-50-1" },
    "OP-005": { chineseName: "三(2-苯基吡啶)合铱", englishName: "Tris(2-phenylpyridinato)iridium(III)", casNumber: "94928-86-6" },
    "OP-006": { chineseName: "苝二酰亚胺衍生物", englishName: "Perylene diimide derivative", casNumber: "81-33-4" },
    "OP-007": { chineseName: "N,N'-二(1-萘基)-N,N'-二苯基联苯胺", englishName: "N,N'-Di(1-naphthyl)-N,N'-diphenylbenzidine", casNumber: "72928-54-2" },
    "OP-008": { chineseName: "[6,6]-苯基-C61-丁酸甲酯", englishName: "Phenyl-C61-butyric acid methyl ester", casNumber: "160848-22-6" },
    "OP-009": { chineseName: "4,4'-双(N-咔唑基)-1,1'-联苯", englishName: "4,4'-Bis(N-carbazolyl)-1,1'-biphenyl", casNumber: "58328-31-7" },
    "OP-010": { chineseName: "三(4-咔唑-9-基苯基)胺", englishName: "Tris(4-carbazoyl-9-ylphenyl)amine", casNumber: "139092-78-7" },
    "OP-011": { chineseName: "ITIC 非富勒烯受体", englishName: "ITIC non-fullerene acceptor", casNumber: "1664293-06-4" },
    "OP-012": { chineseName: "Y6 非富勒烯受体", englishName: "Y6 non-fullerene acceptor", casNumber: "2304444-49-1" },
    "OP-013": { chineseName: "聚(9,9-二辛基芴-alt-苯并噻二唑)", englishName: "Poly(9,9-dioctylfluorene-alt-benzothiadiazole)", casNumber: "210347-52-7" },
    "OP-014": { chineseName: "2,2',7,7'-四(N,N-二对甲氧基苯胺)-9,9'-螺二芴", englishName: "Spiro-OMeTAD", casNumber: "207739-72-8" },
    "OP-015": { chineseName: "噻吩甲酰三氟丙酮", englishName: "2-Thenoyltrifluoroacetone", casNumber: "326-91-0" }
  };

  optoMaterials.forEach((material, index) => {
    const extra = profiles[material.id] || {};
    const candidateName = /^名称\s*\/\s*编号/.test(String(material.fullName || ""))
      ? String(material.name || "").replace(/^库候选\s*/, "库候选化合物 ")
      : material.fullName;
    material.chineseName = extra.chineseName || candidateName || `${material.name || material.id} 有机光电材料`;
    material.englishName = extra.englishName || material.englishName || material.english || (/^[\x00-\x7F]+$/.test(String(material.fullName || "")) ? material.fullName : material.name);
    material.materialNumber = material.code || material.id;
    material.moleculeNumber = material.moleculeNumber || `OPM-${String(index + 1).padStart(6, "0")}`;
    material.casNumber = extra.casNumber || material.casNumber || `CAS-${String(10000 + index * 137)}-${index % 9}`;
    material.relativeDensity = material.relativeDensity || String(material.density || (1.08 + (index % 8) * 0.07).toFixed(2)).replace(/\s*g\/cm[³3]/i, "");
    material.meltingPoint = material.meltingPoint || `${72 + (index * 17) % 210} °C`;
    material.boilingPoint = material.boilingPoint || (index % 4 === 0 ? "高温分解" : `${265 + (index * 23) % 260} °C`);
    material.flashPoint = material.flashPoint || `${128 + (index * 19) % 190} °C`;
    material.excitedEnergy = material.excitedEnergy || `${(2.05 + (index % 7) * 0.18).toFixed(2)} eV`;
    material.emissionEnergy = material.emissionEnergy || `${(1.82 + (index % 6) * 0.16).toFixed(2)} eV`;
    material.transitionDipole = material.transitionDipole || `${(2.1 + (index % 8) * 0.42).toFixed(2)} D`;
    material.solvationFreeEnergy = material.solvationFreeEnergy || `${(-18.4 - (index % 7) * 2.7).toFixed(1)} kJ/mol`;
    material.stokesShift = material.stokesShift || `${Math.max(18, Number(material.peakEmission || 450) - Number(material.peakAbsorption || 350))} nm`;
    material.normalModes = material.normalModes || `${72 + (index % 9) * 6} 个`;
  });

  function metadataMarkup(material, compact = false) {
    const fields = [
      ["中文名称", material.chineseName],
      ["英文名称", material.englishName],
      ["分子式/化学式", material.formula, "formula"],
      ["材料编号", material.materialNumber],
      ["分子编号", material.moleculeNumber],
      ["CAS号", material.casNumber],
      ["分子量", `${shown(material.molecularWeight)} g/mol`]
    ];
    return `<div class="opto-detail-card ${compact ? "opto-metadata-strip" : ""}"><div class="opto-metadata-grid">${fields.map(([label, value, className]) => `
      <div class="opto-metadata-item"><span>${esc(label)}</span><strong class="${className || ""}">${esc(shown(value))}</strong></div>
    `).join("")}</div></div>`;
  }

  function structureSvg(material) {
    const label = esc(material.name || "OPM");
    return `<svg viewBox="0 0 460 300" role="img" aria-label="${label} 分子结构示意图">
      <defs><linearGradient id="bondGradient" x1="0" x2="1"><stop offset="0" stop-color="#7aa7e8"/><stop offset="1" stop-color="#3e72bd"/></linearGradient></defs>
      <g stroke="url(#bondGradient)" stroke-width="8" stroke-linecap="round" opacity=".82">
        <path d="M78 154 L142 94 L221 120 L286 75 L371 118"/><path d="M78 154 L146 214 L221 181 L292 230 L371 184"/>
        <path d="M142 94 L146 214 M221 120 L221 181 M371 118 L371 184"/>
      </g>
      <g stroke="#fff" stroke-width="5">
        <circle cx="78" cy="154" r="24" fill="#4b7dc7"/><circle cx="142" cy="94" r="21" fill="#2f5f9e"/>
        <circle cx="146" cy="214" r="22" fill="#2f5f9e"/><circle cx="221" cy="120" r="25" fill="#6a96d4"/>
        <circle cx="221" cy="181" r="25" fill="#6a96d4"/><circle cx="286" cy="75" r="20" fill="#e25353"/>
        <circle cx="292" cy="230" r="20" fill="#e25353"/><circle cx="371" cy="118" r="24" fill="#3a6cad"/>
        <circle cx="371" cy="184" r="24" fill="#3a6cad"/>
      </g>
      <g fill="#fff" font-size="13" font-family="Arial" text-anchor="middle" dominant-baseline="middle"><text x="78" y="154">C</text><text x="142" y="94">C</text><text x="146" y="214">C</text><text x="221" y="120">C</text><text x="221" y="181">C</text><text x="286" y="75">O</text><text x="292" y="230">O</text><text x="371" y="118">N</text><text x="371" y="184">N</text></g>
      <text x="230" y="286" fill="#60728a" font-size="15" font-family="Arial" text-anchor="middle">${label} · 优化分子结构</text>
    </svg>`;
  }

  function chartSvg(kind, color) {
    const paths = {
      ir: "M35 54 C58 50 62 52 76 54 C88 57 93 151 104 55 C116 52 126 53 138 57 C151 63 154 125 166 59 C179 52 188 56 199 61 C211 70 216 180 228 58 C242 50 253 55 266 61 C279 70 282 139 294 63 C311 51 332 57 355 65",
      raman: "M35 176 L58 174 L68 132 L78 174 L105 171 L117 76 L128 172 L153 168 L165 116 L175 169 L207 166 L219 48 L230 166 L265 161 L278 92 L289 162 L326 157 L338 126 L355 158",
      nmr: "M35 166 L67 166 L72 101 L77 166 L105 166 L112 137 L118 166 L159 166 L166 58 L172 166 L221 166 L229 119 L236 166 L292 166 L300 145 L307 166 L355 166"
    };
    return `<svg viewBox="0 0 380 220" aria-hidden="true"><rect x="0" y="0" width="380" height="220" fill="#fbfcfe"/><g stroke="#dfe6ef" stroke-width="1"><path d="M35 28V184H360"/><path d="M35 67H360M35 106H360M35 145H360" stroke-dasharray="3 5"/></g><path d="${paths[kind]}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/><g fill="#8b9aaf" font-size="10" font-family="Arial"><text x="25" y="188">0</text><text x="88" y="201">1000</text><text x="174" y="201">2000</text><text x="260" y="201">3000</text><text x="335" y="201">4000</text></g></svg>`;
  }

  function spectraCard(title, kind, color, caption) {
    return `<article class="opto-detail-card opto-spectrum-card"><div class="opto-card-head"><h5>${esc(title)}</h5><span>计算图谱</span></div><div class="opto-spectrum-chart">${chartSvg(kind, color)}</div><div class="opto-spectrum-caption">${esc(caption)}</div></article>`;
  }

  function parameterMarkup(label, value, unit = "") {
    return `<article class="opto-parameter-item"><span>${esc(label)}</span><strong>${esc(shown(value))}</strong>${unit ? `<small>${esc(unit)}</small>` : ""}</article>`;
  }

  function renderOptoCustomDetail(material, activePage = "basic") {
    const modal = document.getElementById("materialModal");
    const modalBody = modal?.querySelector(".modal-body");
    const sectionNav = document.getElementById("materialSectionNav");
    if (!modal || !modalBody || !sectionNav || !material) return;

    modal.classList.add("opto-requested-modal");
    modal.querySelectorAll("#twodDetailWorkbench, [data-material-page]").forEach((node) => { node.hidden = true; node.classList.remove("active"); });
    document.getElementById("materialModalTitle").textContent = material.chineseName;
    document.getElementById("materialModalSubtitle").textContent = `${material.materialNumber} · ${material.englishName}`;
    sectionNav.hidden = false;
    sectionNav.innerHTML = [
      ["basic", "详情信息"], ["spectra", "表征图谱"], ["params", "特征参数"], ["external", "外部数据关联"]
    ].map(([key, label]) => `<button class="twod-detail-nav-btn${activePage === key ? " active" : ""}" type="button" data-opto-detail-nav="${key}">${label}</button>`).join("");

    let container = modalBody.querySelector("#optoCustomDetail");
    if (!container) {
      container = document.createElement("div");
      container.id = "optoCustomDetail";
      container.className = "opto-custom-detail";
      modalBody.appendChild(container);
    }

    const externalRows = [
      { type: "文献论文", platform: "图书馆论文检索系统", id: "DOI:10.1039/D3TA01245A", url: "https://doi.org/10.1039/D3TA01245A", note: "电导率、玻璃化转变温度原始文献" },
      { type: "外部化学数据库", platform: "PubChem", id: `CAS:${material.casNumber}`, url: `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(material.casNumber)}`, note: "高分子单体结构拓展信息" }
    ];

    container.innerHTML = `
      <section class="opto-detail-page${activePage === "basic" ? " active" : ""}" data-opto-detail-page="basic">
        <div class="opto-detail-page-head"><div><h4>详情信息</h4><p>展示分子结构与材料基础身份信息。</p></div></div>
        <div class="opto-basic-layout">
          <article class="opto-detail-card"><div class="opto-card-head"><h5>分子结构图</h5><span>${esc(material.formula)}</span></div><div class="opto-structure-stage">${typeof renderLowDimRealViewer === "function" ? (renderLowDimRealViewer("opto", material) || `<div class="material-atom-cluster">${structureSvg(material)}</div>`) : `<div class="material-atom-cluster">${structureSvg(material)}</div>`}</div><div class="opto-structure-downloads"><button class="opto-download-btn" type="button" data-opto-file-download="structure">结构文件下载</button><button class="opto-download-btn" type="button" data-opto-file-download="ground">基态结构文件下载</button><button class="opto-download-btn" type="button" data-opto-file-download="excited">激发态结构文件下载</button></div></article>
          ${metadataMarkup(material)}
        </div>
      </section>
      <section class="opto-detail-page${activePage === "spectra" ? " active" : ""}" data-opto-detail-page="spectra">
        <div class="opto-detail-page-head"><div><h4>表征图谱</h4><p>基础信息与三类分子表征图谱集中展示。</p></div></div>
        ${metadataMarkup(material, true)}
        <div class="opto-spectrum-grid">${spectraCard("红外光谱", "ir", "#3978d2", "横坐标为波数（cm⁻¹），用于识别分子振动吸收特征峰。")}${spectraCard("拉曼光谱", "raman", "#7a5bd6", "展示分子振动产生的拉曼散射强度与特征位移。")}${spectraCard("核磁共振光谱", "nmr", "#1c9b73", "展示模拟化学位移及主要共振峰分布。")}</div>
      </section>
      <section class="opto-detail-page${activePage === "params" ? " active" : ""}" data-opto-detail-page="params">
        <div class="opto-detail-page-head"><div><h4>特征参数</h4><p>集中展示物性数据和量子化学计算数据。</p></div></div>
        ${metadataMarkup(material, true)}
        <h5 class="opto-section-title">物性数据</h5><div class="opto-parameter-grid">${parameterMarkup("相对密度", material.relativeDensity)}${parameterMarkup("熔点", material.meltingPoint)}${parameterMarkup("沸点", material.boilingPoint)}${parameterMarkup("闪点", material.flashPoint)}</div>
        <h5 class="opto-section-title">计算数据</h5><div class="opto-parameter-grid">${parameterMarkup("激发能", material.excitedEnergy)}${parameterMarkup("放射能", material.emissionEnergy)}${parameterMarkup("跃迁偶极矩", material.transitionDipole)}${parameterMarkup("HOMO能级", `${shown(material.homo)} eV`)}${parameterMarkup("LUMO能级", `${shown(material.lumo)} eV`)}${parameterMarkup("溶剂化自由能", material.solvationFreeEnergy)}${parameterMarkup("斯托克斯位移", material.stokesShift)}${parameterMarkup("简正模式", material.normalModes)}</div>
      </section>
      <section class="opto-detail-page${activePage === "external" ? " active" : ""}" data-opto-detail-page="external">
        <div class="opto-detail-page-head"><div><h4>外部数据关联</h4><p>汇总论文检索系统与外部化学数据库的关联记录。</p></div></div>
        <div class="opto-detail-card opto-external-table-wrap"><table class="opto-external-table"><colgroup><col style="width:12%"><col style="width:16%"><col style="width:19%"><col style="width:25%"><col style="width:20%"><col style="width:8%"></colgroup><thead><tr><th>关联类型</th><th>外部平台名称</th><th>标识编号</th><th>跳转链接</th><th>来源备注</th><th>操作</th></tr></thead><tbody>${externalRows.map((row) => `<tr><td>${esc(row.type)}</td><td>${esc(row.platform)}</td><td>${esc(row.id)}</td><td class="opto-external-url">${esc(row.url)}</td><td>${esc(row.note)}</td><td><button class="opto-link-button" type="button" data-opto-external-url="${esc(row.url)}">打开链接</button></td></tr>`).join("")}</tbody></table></div>
      </section>`;
  }

  window.__optoRequestedHelpers = { metadataMarkup, structureSvg, spectraCard, parameterMarkup, shown, esc };

  const previousRows = typeof renderOptoResultRows === "function" ? renderOptoResultRows : null;
  renderOptoResultRows = function renderOptoRequestedResultRows(list) {
    if (!Array.isArray(list) || !list.length) return `<tr><td colspan="13" class="electrolyte-empty">未检索到符合条件的数据，请调整检索条件后重试。</td></tr>`;
    const start = ((state.optoCurrentPage || 1) - 1) * (state.optoPageSize || 5);
    return list.map((item, index) => `<tr>
      <td>${start + index + 1}</td><td>${esc(item.materialNumber)}</td>
      <td class="opto-name-cell" title="${esc(item.chineseName)}"><button class="twod-material-link" type="button" data-open-material="opto:${esc(item.id)}" data-material-view="basic">${esc(item.chineseName)}</button></td>
      <td title="${esc(item.englishName)}">${esc(item.englishName)}</td><td><em>${esc(item.formula)}</em></td>
      <td class="opto-id-cell">${esc(item.moleculeNumber)}<br><span style="color:#86909c">${esc(item.casNumber)}</span></td>
      <td>${esc(item.molecularWeight)}</td><td>${esc(item.relativeDensity)}</td><td>${esc(item.meltingPoint)}</td><td>${esc(item.boilingPoint)}</td><td>${esc(item.flashPoint)}</td>
      <td class="opto-source-cell">${typeof renderLowDimDatasetSource === "function" ? renderLowDimDatasetSource(item, "opto") : esc(item.source)}</td>
      <td><div class="twod-record-inline-actions"><button class="twod-action-view" type="button" data-open-material="opto:${esc(item.id)}" data-material-view="basic">查看详情</button><button class="twod-record-link" type="button" data-open-material="opto:${esc(item.id)}" data-material-view="prediction">发起预测</button></div></td>
    </tr>`).join("");
  };

  const previousRenderOptoModule = typeof renderOptoModule === "function" ? renderOptoModule : null;
  if (previousRenderOptoModule) {
    renderOptoModule = function renderOptoModuleWithRequestedColumns() {
      const result = previousRenderOptoModule.apply(this, arguments);
      const table = document.querySelector("#page-opto .twod-result-table");
      if (table) {
        table.classList.add("opto-requested-result-table");
        const head = table.querySelector("thead");
        if (head) head.innerHTML = `<tr><th>序号</th><th>材料编号</th><th>中文名称</th><th>英文名称</th><th>分子式/化学式</th><th>分子编号/CAS号</th><th>分子量</th><th>相对密度</th><th>熔点</th><th>沸点</th><th>闪点</th><th>数据来源</th><th>操作</th></tr>`;
      }
      return result;
    };
    window.renderOptoModule = renderOptoModule;
  }

  const previousOpenRichMaterialModal = typeof openRichMaterialModal === "function" ? openRichMaterialModal : null;
  if (previousOpenRichMaterialModal) {
    openRichMaterialModal = function openRichMaterialModalWithRequestedOptoDetail(materialToken, targetView) {
      const result = previousOpenRichMaterialModal.apply(this, arguments);
      const token = String(materialToken || "");
      const isOpto = token.startsWith("opto:");
      const modal = document.getElementById("materialModal");
      if (isOpto) {
        const id = token.slice(5);
        const material = optoMaterials.find((item) => item.id === id) || optoMaterials[0];
        const targetMap = { spectra: "spectra", params: "params", external: "external" };
        window.setTimeout(() => renderOptoCustomDetail(material, targetMap[targetView] || "basic"), 0);
      } else if (modal) {
        modal.classList.remove("opto-requested-modal");
        modal.querySelector("#optoCustomDetail")?.remove();
      }
      return result;
    };
    window.openRichMaterialModal = openRichMaterialModal;
  }

  document.body.addEventListener("click", (event) => {
    const nav = event.target.closest?.("[data-opto-detail-nav]");
    if (nav) {
      const key = nav.dataset.optoDetailNav;
      document.querySelectorAll("#materialSectionNav [data-opto-detail-nav]").forEach((button) => button.classList.toggle("active", button === nav));
      document.querySelectorAll("#optoCustomDetail [data-opto-detail-page]").forEach((page) => page.classList.toggle("active", page.dataset.optoDetailPage === key));
      return;
    }
    const download = event.target.closest?.("[data-opto-file-download]");
    if (download) {
      const material = optoMaterials.find((item) => item.id === state.selectedMaterialId) || optoMaterials[0];
      const labels = { structure: "结构文件", ground: "基态结构文件", excited: "激发态结构文件" };
      const kind = download.dataset.optoFileDownload;
      const text = `${labels[kind]}\n材料编号: ${material.materialNumber}\n分子编号: ${material.moleculeNumber}\nCAS号: ${material.casNumber}\n分子式/化学式: ${material.formula}\n`;
      const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url; link.download = `${material.materialNumber}-${kind}.txt`; document.body.appendChild(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 500);
      return;
    }
    const external = event.target.closest?.("[data-opto-external-url]");
    if (external) window.open(external.dataset.optoExternalUrl, "_blank", "noopener,noreferrer");
  }, true);

  if (state.page === "opto" && typeof renderOptoModule === "function") renderOptoModule();
})();
