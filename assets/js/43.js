
(() => {
  const html = (value) => typeof escapeLowDimHtml === "function" ? escapeLowDimHtml(value == null ? "" : String(value)) : String(value ?? "").replace(/[&<>\"']/g, (ch) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;", "'":"&#39;"}[ch]));
  const text = (value, fallback = "未记录") => value == null || value === "" || value === "/" ? fallback : String(value);
  const has = (item, words) => words.some((word) => `${item?.name || ""} ${item?.english || ""} ${item?.formula || ""} ${item?.moleculeSubstanceType || ""}`.toLowerCase().includes(word));
  const moleculeType = (item) => item?.moleculeSystemType || item?.moleculeType || (has(item, ["polymer", "protein", "高分子", "蛋白"]) ? "高分子机器学习力场数据集" : "有机小分子机器学习力场数据集");
  const scaleType = (item) => item?.systemScaleType || (item?.systemScale === "双分子数据集" || has(item, ["dimer", "双分子"]) ? "双分子数据集" : item?.systemScale === "多分子团簇数据集" || has(item, ["cluster", "团簇"]) ? "多分子团簇数据集" : "单分子数据集");
  const substanceType = (item) => {
    if (item?.moleculeSubstanceType) return item.moleculeSubstanceType;
    if (has(item, ["protein", "蛋白"])) return "蛋白质机器学习力场数据集";
    if (has(item, ["polymer", "高分子", "p3ht", "聚合"])) return "高分子片段机器学习力场数据集";
    if (has(item, ["ether", "醚", "methoxy", "dimethyl ether"])) return "醚类有机小分子数据集";
    return "酰胺有机小分子数据集";
  };
  const datasetFields = (item) => ({ moleculeSystemType: moleculeType(item), systemScaleType: scaleType(item), moleculeSubstanceType: substanceType(item) });
  window.getMlffMoleculeSystemType = moleculeType;
  window.getMlffSystemScaleType = scaleType;
  window.getMlffMoleculeSubstanceType = substanceType;

  if (typeof renderMlffResultRows === "function") {
    renderMlffResultRows = function renderMlffResultRowsMolecularDataset(list) {
      if (!list.length) return `<tr><td colspan="13" class="opto-table-empty">未检索到符合条件的机器学习力场数据，请调整检索条件后重试。</td></tr>`;
      return list.map((item) => {
        const fields = datasetFields(item);
        return `<tr>
          <td>${html(item.id)}</td>
          <td title="${html(text(item.name))}"><button class="twod-material-link" type="button" data-open-material="mlff:${html(item.id)}" data-material-view="basic">${html(text(item.name))}</button></td>
          <td>${html(text(item.english))}</td>
          <td title="${html(text(item.formula))}"><em>${html(text(item.formula))}</em></td>
          <td>${html(fields.moleculeSystemType)}</td><td>${typeof renderMlffDatasetSource === "function" ? renderMlffDatasetSource(item) : html(text(item.datasetSource))}</td>
          <td>${html(fields.systemScaleType)}</td><td>${html(fields.moleculeSubstanceType)}</td>
          <td>${typeof getMlffChargeSummary === "function" ? getMlffChargeSummary(item) : "未记录"}</td>
          <td>${typeof getMlffMultipoleSummary === "function" ? getMlffMultipoleSummary(item) : "未记录"}</td>
          <td>${typeof getMlffPolarizabilitySummary === "function" ? getMlffPolarizabilitySummary(item) : "未记录"}</td>
          <td>${typeof getMlffDispersionCoefficientSummary === "function" ? getMlffDispersionCoefficientSummary(item) : "未记录"}</td>
          <td><div class="twod-record-inline-actions"><button class="twod-action-view" type="button" data-open-material="mlff:${html(item.id)}" data-material-view="basic">查看详情</button><button class="twod-record-link" type="button" data-open-material="mlff:${html(item.id)}" data-material-view="prediction">发起预测</button><button class="twod-record-link" type="button" data-mlff-field-update="${html(item.id)}">场数据更新</button></div></td>
        </tr>`;
      }).join("");
    };
  }
  const originalRenderMlffModule = typeof renderMlffModule === "function" ? renderMlffModule : null;
  if (originalRenderMlffModule) {
    renderMlffModule = function renderMlffModuleWithMolecularDatasetTaxonomy() {
      originalRenderMlffModule();
      if (state.mlffTab === "convert" || state.mlffTab === "glossary" || state.mlffFieldUpdateOpen) return;
      const headers = document.querySelectorAll("#page-mlff .twod-search-results .twod-result-table thead th");
      const labels = ["材料编号","中文名称","英文名称","分子式/化学式","分子体系类型","数据来源","体系规模类型","分子体系物质类型","电荷","多极矩","极化率","色散系数","操作"];
      headers.forEach((node, index) => { if (labels[index]) node.textContent = labels[index]; });
    };
    window.renderMlffModule = renderMlffModule;
  }

  const originalBasic = typeof renderMlffDetailBasicPage === "function" ? renderMlffDetailBasicPage : null;
  if (originalBasic) {
    renderMlffDetailBasicPage = function renderMlffDetailBasicPageMolecularDataset(material) {
      const result = originalBasic(material);
      const classification = `<div class="mlff-molecular-data-section"><h5>分子体系分类</h5><div class="mlff-geometry-grid"><div class="mlff-geometry-item"><span>分子体系类型</span><strong>${html(moleculeType(material))}</strong></div><div class="mlff-geometry-item"><span>体系规模类型</span><strong>${html(scaleType(material))}</strong></div><div class="mlff-geometry-item"><span>分子体系物质类型</span><strong>${html(substanceType(material))}</strong></div></div></div>`;
      return result.replace(/化学式/g, "分子式/化学式").replace(/数据集类型/g, "分子体系类型").replace(/体系规模/g, "体系规模类型").replace(/体系类型/g, "分子体系物质类型").replace(/(<section class="twod-detail-table-card mlff-basic-left-card">[\s\S]*?<\/section>)/, `$1${classification}`);
    };
    window.renderMlffDetailBasicPage = renderMlffDetailBasicPage;
  }

  const renderRows = (rows) => typeof renderDetailKvSection === "function" ? renderDetailKvSection("", rows, { fallback: "未记录" }) : `<div class="detail-grid">${rows.map((row) => `<div><span>${html(row.label)}</span><strong>${html(row.value)}</strong></div>`).join("")}</div>`;
const valueFor = (item, keys, fallback = "未记录") => { for (const key of keys) { if (item?.[key] != null && item[key] !== "") return item[key]; } return fallback; };
  const coordinateRows = (material) => {
    const nodes = typeof buildMlffNodeCoordinates === "function" ? buildMlffNodeCoordinates(material) : [];
    return nodes.slice(0, 12).map((node, index) => ({ index: index + 1, atom: node.label || node.element || "原子", x: Number(node.x || 0).toFixed(3), y: Number(node.y || 0).toFixed(3), z: Number(node.z || 0).toFixed(3) }));
  };
  const coordinateTable = (material, title) => {
    const rows = coordinateRows(material);
    return `<div class="mlff-molecule-data-section"><h5>${title}</h5>${rows.length ? `<div class="mlff-coordinate-preview"><table><thead><tr><th>序号</th><th>原子</th><th>X (Å)</th><th>Y (Å)</th><th>Z (Å)</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${r.index}</td><td>${html(r.atom)}</td><td>${r.x}</td><td>${r.y}</td><td>${r.z}</td></tr>`).join("")}</tbody></table></div>` : `<div class="mlff-image-meta">当前条目未记录可直接展示的${title}。</div>`}</div>`;
  };
  const geometry = (material, kind) => {
    const isDimer = kind === "dimer", isCluster = kind === "cluster";
    return `<div class="mlff-geometry-grid"><div class="mlff-geometry-item"><span>键长</span><strong>${html(valueFor(material, [isDimer ? "dimerBondLength" : isCluster ? "clusterBondLength" : "bondLength"], "未记录"))} Å</strong></div><div class="mlff-geometry-item"><span>键角</span><strong>${html(valueFor(material, [isDimer ? "dimerBondAngle" : isCluster ? "clusterBondAngle" : "bondAngle"], "未记录"))}°</strong></div><div class="mlff-geometry-item"><span>二面角</span><strong>${html(valueFor(material, [isDimer ? "dimerDihedral" : isCluster ? "clusterDihedral" : "dihedral"], "未记录"))}°</strong></div></div>`;
  };
  const tabData = (material, key) => {
    const kind = key === "dimer" ? "dimer" : key === "cluster" ? "cluster" : "molecule";
    if (kind === "molecule") return `<div class="mlff-molecule-data-section"><h5>单分子性质</h5>${renderRows([{label:"原子电荷",value:valueFor(material,["atomicCharge","charge","netCharge"])},{label:"偶极矩",value:valueFor(material,["dipole","dipole_debye"])},{label:"四极矩",value:valueFor(material,["quadrupole","quadrupole_moment"])},{label:"多极矩",value:valueFor(material,["multipole"])},{label:"极化率",value:valueFor(material,["polarizability"])},{label:"色散系数",value:valueFor(material,["dispersionCoefficient","dispersion"])},{label:"单分子能量",value:valueFor(material,["monomerEnergy","energy"]) }])}</div>${coordinateTable(material,"单分子结构（原子坐标）")}${geometry(material,kind)}`;
    if (kind === "dimer") return `<div class="mlff-molecule-data-section"><h5>双分子相互作用</h5>${renderRows([{label:"分子间相互作用",value:valueFor(material,["intermolecularInteraction","interactionType"],"已记录")},{label:"双分子相互作用能",value:valueFor(material,["dimerInteractionEnergy","interactionEnergy"])},{label:"原子受力",value:valueFor(material,["dimerAtomicForce","atomicForce"]) }])}</div>${coordinateTable(material,"双分子结构（原子坐标）")}${geometry(material,kind)}`;
    return `<div class="mlff-molecule-data-section"><h5>多分子团簇信息</h5>${renderRows([{label:"多分子相互作用能",value:valueFor(material,["clusterInteractionEnergy","interactionEnergy"])},{label:"原子受力",value:valueFor(material,["clusterAtomicForce","atomicForce"]) }])}</div>${coordinateTable(material,"多分子团簇结构（原子坐标）")}${geometry(material,kind)}`;
  };

  const originalStructure = typeof renderMlffStructurePage === "function" ? renderMlffStructurePage : null;
  if (originalStructure) {
    renderMlffStructurePage = function renderMlffStructurePageMolecularDataset(material, tabKey, titleText, descText) {
      if (tabKey !== "molecule") return originalStructure(material, tabKey, titleText, descText);
      const active = state.mlffMoleculeDatasetTab || "single";
      const tabs = [{key:"single",label:"单分子数据集"},{key:"dimer",label:"双分子数据集"},{key:"cluster",label:"多分子团簇数据集"}];
      const viewerKind = active === "dimer" ? "smallSystem" : active === "cluster" ? "largeSystem" : "molecule";
      const viewerTitle = active === "dimer" ? "双分子结构3D图" : active === "cluster" ? "多分子团簇结构3D图" : "3D分子结构图";
      const realViewer = active === "single" && typeof renderLowDimRealViewer === "function" ? renderLowDimRealViewer("mlff", material) : "";
      const scene = !realViewer && typeof buildMlffScene === "function" ? buildMlffScene(material, viewerKind) : null;
      const sceneMarkup = scene && typeof renderMlffSceneMarkup === "function" ? `<div class="material-atom-cluster mlff-scene" data-mlff-scene-size="${scene.size}">${renderMlffSceneMarkup(scene)}</div>` : "";
      const viewer = `<section class="mlff-request-card twod-detail-visual-card mlff-red-structure-card"><h5>${html(viewerTitle)}</h5><div class="mlff-structure-stage mlff-request-stage">${realViewer || sceneMarkup || `<div class="mlff-image-meta">当前条目暂无可用的三维结构坐标。</div>`}</div><p class="mlff-request-caption">${realViewer ? "真实分子坐标，可拖拽旋转、滚轮缩放并切换显示样式。" : html(scene?.caption || "分子结构三维示意图")}</p></section>`;
      return `<div class="twod-detail-page-head"><div><h4>分子结构</h4><p>按分子体系规模查看结构、几何参数与相互作用数据。</p></div></div><div class="mlff-molecule-dataset-tabs" role="tablist">${tabs.map((tab) => `<button class="mlff-molecule-dataset-tab${active === tab.key ? " active" : ""}" type="button" role="tab" aria-selected="${active === tab.key}" onclick="return openMlffMoleculeDatasetTab('${tab.key}')">${tab.label}</button>`).join("")}</div><div class="mlff-request-layout"><section class="mlff-request-card"><h5>分子体系信息</h5>${tabData(material,active)}</section><div class="mlff-request-right">${viewer}</div></div>`;
    };
    window.renderMlffStructurePage = renderMlffStructurePage;
  }
  window.openMlffMoleculeDatasetTab = function openMlffMoleculeDatasetTab(key) {
    state.mlffMoleculeDatasetTab = ["single","dimer","cluster"].includes(key) ? key : "single";
    const material = typeof getCanonicalMaterialBySource === "function" ? getCanonicalMaterialBySource("mlff", state.selectedMaterialId) : null;
    if (material && typeof renderMlffDetailPage === "function") renderMlffDetailPage(material);
    return false;
  };
  if (typeof state !== "undefined") state.mlffMoleculeDatasetTab ||= "single";
})();
