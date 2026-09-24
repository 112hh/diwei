
    (function () {
      function safeText(value, fallback = "未记录") {
        if (value === null || value === undefined || value === "" || value === "/") return fallback;
        if (typeof isLowDimMissing === "function" && isLowDimMissing(value)) return fallback;
        return String(value);
      }

      function firstValue(material, fields, keys, fallback = "未记录") {
        for (const key of keys) {
          const value = material?.[key] ?? fields?.[key];
          if (value !== null && value !== undefined && value !== "" && !(typeof isLowDimMissing === "function" && isLowDimMissing(value))) {
            if (typeof value === "object" && value && "value" in value) return `${value.value}${value.unit ? ` ${value.unit}` : ""}`;
            return value;
          }
        }
        return fallback;
      }

      function getContext(material) {
        const record = typeof getLowDimRealCase === "function" ? getLowDimRealCase("mlff", material?.id) : null;
        return { record, fields: record?.fields || material?.fields || {}, provenance: record?.provenance || material?.provenance || {} };
      }

      function esc(value) {
        return typeof escapeLowDimHtml === "function" ? escapeLowDimHtml(safeText(value)) : safeText(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
      }

      function countAtoms(material, fields) {
        const direct = Number(material?.atomCount ?? fields?.n_atoms ?? 0);
        if (Number.isFinite(direct) && direct > 0) return direct;
        const charges = material?.equilibriumAtomicCharges || fields?.equilibrium_atomic_charges;
        if (Array.isArray(charges) && charges.length) return charges.length;
        const nodes = typeof buildMlffNodeCoordinates === "function" ? buildMlffNodeCoordinates(material) : [];
        return nodes.length || 0;
      }

      function formatNetCharge(material, fields) {
        const value = firstValue(material, fields, ["netCharge", "net_charge", "charge"], "未记录");
        return value === "未记录" ? value : `${value} e`;
      }

      function formatMultipole(material, fields) {
        const dipole = firstValue(material, fields, ["multipole", "dipole", "dipole_debye"], "未记录");
        return dipole === "未记录" ? "未记录" : `偶极矩 ${dipole} D；高阶多极矩未记录`;
      }

      function datasetType(material, provenance) {
        return firstValue(material, provenance, ["datasetType", "dataset", "dataSetType"], "机器学习力场数据集");
      }

      function systemType(material, fields, kind = "molecule") {
        const explicit = firstValue(material, fields, ["systemType", "system_type"], "");
        if (explicit) return explicit;
        if (kind === "smallSystem") return "非周期多分子团簇";
        if (kind === "largeSystem") return "扩展多分子体系";
        return "非周期分子体系";
      }

      function atomicTypes(material, record) {
        const elements = Array.isArray(record?.elements) ? record.elements : [];
        if (elements.length) return elements.join("、");
        return safeText(material?.atoms);
      }

      function parsePdbCoordinates(record, limit = 8) {
        const text = record?.structure?.text;
        if (!text) return [];
        return String(text).split(/\r?\n/).filter((line) => /^(ATOM  |HETATM)/.test(line)).slice(0, limit).map((line, index) => ({
          index: Number(line.slice(6, 11).trim()) || index + 1,
          atom: line.slice(76, 78).trim() || line.slice(12, 16).trim(),
          x: line.slice(30, 38).trim(),
          y: line.slice(38, 46).trim(),
          z: line.slice(46, 54).trim()
        }));
      }

      function renderCoordinates(material, record) {
        const rows = parsePdbCoordinates(record);
        if (!rows.length) return `<div class="mlff-image-meta">当前条目未记录可直接展示的分子三维坐标；可通过右侧 PDB 文件下载入口获取结构文件。</div>`;
        return `
          <div class="mlff-coordinate-preview" aria-label="分子坐标预览">
            <table><thead><tr><th>序号</th><th>原子</th><th>X (Å)</th><th>Y (Å)</th><th>Z (Å)</th></tr></thead><tbody>
              ${rows.map((row) => `<tr><td>${row.index}</td><td>${esc(row.atom)}</td><td>${esc(row.x)}</td><td>${esc(row.y)}</td><td>${esc(row.z)}</td></tr>`).join("")}
            </tbody></table>
          </div>
          <div class="mlff-image-meta">以上展示前 ${rows.length} 个原子坐标；完整坐标请下载 PDB 文件。多分子团簇的独立分子坐标在当前数据条目中未记录。</div>`;
      }

      const MLFF_RED_LABELS = new Set([
        "色散系数", "色散率", "相关文件下载", "参数力场文件包", "PDB 结构文件", "PDB 结构文件下载",
        "XML 力场文件", "XML 力场文件下载", "完整结构图像", "大体系结构数据", "3D分子结构图",
        "多分子团簇分子坐标", "分子间相互作用能", "分子坐标", "小体系结构"
      ]);

      function mlffRedClass(label) {
        return MLFF_RED_LABELS.has(String(label || "").replace(/<[^>]*>/g, "").trim()) ? " mlff-red-field" : "";
      }

      function renderRows(rows, options = {}) {
        const redLabels = options.redLabels || MLFF_RED_LABELS;
        return renderDetailKvSection(options.title || "", rows.map((row) => ({ label: row.label, value: row.value })), { fallback: "未记录", redLabels });
      }

      function renderScene(material, kind, title) {
        const { record } = getContext(material);
        const useRealViewer = kind === "molecule" && typeof renderLowDimRealViewer === "function";
        const realViewer = useRealViewer ? renderLowDimRealViewer("mlff", material) : "";
        const scene = realViewer ? null : buildMlffScene(material, kind);
        return `
          <section class="mlff-request-card twod-detail-visual-card mlff-red-structure-card">
            <h5 class="mlff-red-field mlff-red-heading">${esc(title)}</h5>
            <div class="mlff-structure-stage mlff-request-stage">
              ${realViewer || `<div class="material-atom-cluster mlff-scene" data-mlff-scene-size="${scene.size}">${renderMlffSceneMarkup(scene)}</div>`}
            </div>
            <p class="mlff-request-caption">${realViewer ? "真实分子坐标，可拖拽旋转、滚轮缩放并切换显示样式。" : esc(scene.caption)}</p>
          </section>`;
      }

      function renderDownloadRow(title, description, kind, buttonText = "下载") {
        const redClass = mlffRedClass(title);
        return `<div class="mlff-download-row"><div><strong class="${redClass.trim()} mlff-red-field">${esc(title)}</strong><span>${esc(description)}</span></div><button class="twod-detail-link-btn" type="button" onclick="return triggerMlffDownload('${kind}')">${esc(buttonText)}</button></div>`;
      }

      function renderParameterGrid(rows) {
        return `<div class="mlff-parameter-grid">${rows.map((row) => `<article class="mlff-parameter-item"><span>${esc(row.label)}</span><strong>${esc(row.value)}</strong></article>`).join("")}</div>`;
      }

      function buildSystemFacts(material, kind) {
        const { fields } = getContext(material);
        const moleculeCount = kind === "smallSystem" ? 3 : 6;
        const atomCount = countAtoms(material, fields);
        return {
          moleculeCount,
          atomTotal: atomCount ? atomCount * moleculeCount : "未记录",
          systemName: `${material.name}${kind === "smallSystem" ? "局部团簇" : "扩展体系"}`,
          systemType: systemType(material, fields, kind),
          forceField: firstValue(material, fields, ["forceField", "traditionalForceField", "force_field"], "未记录")
        };
      }

      renderMlffDetailBasicPage = function renderMlffDetailBasicPage20260829(material) {
        const { fields, provenance } = getContext(material);
        const atomCount = countAtoms(material, fields);
        const retained = firstValue(material, fields, ["retainedFrames", "retained_frames", "frameCount"], "未记录");
        const rows = [
          { label: "材料编号", value: esc(material.id) },
          { label: "材料中文名称", value: esc(firstValue(material, fields, ["nameZh", "name_zh", "name"], material.name)) },
          { label: "英文名称", value: esc(firstValue(material, fields, ["english", "nameEn", "name_en"], material.english || material.name)) },
          { label: "化学式", value: esc(material.formula) },
          { label: "数据集类型", value: esc(datasetType(material, provenance)) },
          { label: "数据来源", value: esc(window.getMlffDatasetSourceLabel ? window.getMlffDatasetSourceLabel(material) : "未记录") },
          { label: "体系规模", value: esc(atomCount ? `${atomCount} 个原子；${retained} 个构型帧` : `${retained} 个构型帧`) },
          { label: "体系类型", value: esc(systemType(material, fields)) },
          { label: "电荷", value: esc(formatNetCharge(material, fields)) },
          { label: "多极矩", value: esc(formatMultipole(material, fields)) },
          { label: "极化率", value: esc(firstValue(material, fields, ["polarizability", "polarizability_ang3", "polarizability_A3"], "未记录")) },
          { label: "色散系数", value: esc(firstValue(material, fields, ["dispersionCoefficient", "dispersion", "dispersion_coefficient", "c6_coefficient"], "未记录")) }
        ];
        return `
          <div class="twod-detail-page-head"><div><h4>${esc(material.name)}基础信息</h4><p>展示材料标识、数据集与体系参数，并保留 3D 结构图下方的相关文件下载。</p></div></div>
          <div class="mlff-request-layout">
            <section class="mlff-request-card"><h5>基础信息</h5>${renderRows(rows)}</section>
            <div class="mlff-request-right">
              ${renderScene(material, "molecule", "3D分子结构图")}
              <section class="mlff-request-card"><h5 class="mlff-red-field mlff-red-heading">相关文件下载</h5><div class="mlff-download-list">
                ${renderDownloadRow("参数力场文件包", "包含结构 PDB 与力场 XML 等关联文件", "package")}
                ${renderDownloadRow("PDB 结构文件", "包含原子类型与三维坐标", "pdb")}
                ${renderDownloadRow("XML 力场文件", "包含力场参数映射与结构节点信息", "xml")}
              </div></section>
            </div>
          </div>`;
      };

      renderMlffStructurePage = function renderMlffStructurePage20260829(material, tabKey, titleText, descText) {
        const { record, fields } = getContext(material);
        if (tabKey === "molecule") {
          const moleculeRows = [
            { label: "体系名称", value: esc(material.name) },
            { label: "原子类型", value: esc(atomicTypes(material, record)) },
            { label: "电荷", value: esc(formatNetCharge(material, fields)) },
            { label: "多极矩", value: esc(formatMultipole(material, fields)) },
            { label: "极化率", value: esc(firstValue(material, fields, ["polarizability", "polarizability_ang3"], "未记录")) },
            { label: "色散率", value: esc(firstValue(material, fields, ["dispersionRate", "dispersion", "dispersion_coefficient"], "未记录")) },
            { label: "多分子团簇分子坐标", value: record?.altStructures?.cluster?.text ? "已记录" : "未记录（当前条目仅提供单分子坐标）" },
            { label: "分子间相互作用能", value: esc(firstValue(material, fields, ["interactionEnergy", "interaction_energy", "interaction_energy_kcal_mol"], "未记录")) }
          ];
          return `
            <div class="twod-detail-page-head"><div><h4>${esc(titleText)}</h4><p>${esc(descText)}</p></div></div>
            <div class="mlff-request-layout">
              <section class="mlff-request-card"><h5>分子体系信息</h5>${renderRows(moleculeRows)}<h5 class="mlff-red-field mlff-red-heading" style="margin-top:18px;">分子坐标</h5>${renderCoordinates(material, record)}</section>
              <div class="mlff-request-right">
                ${renderScene(material, "molecule", "3D分子结构图")}
                <section class="mlff-request-card"><h5>PDB 格式文件</h5><div class="mlff-download-list">${renderDownloadRow("PDB 结构文件", "提供完整原子类型和三维坐标，可导入第三方分子可视化工具", "pdb", "下载 PDB")}</div></section>
              </div>
            </div>`;
        }

        const isSmall = tabKey === "smallSystem";
        const system = buildSystemFacts(material, tabKey);
        const lattice = firstValue(material, fields, ["latticeConstants", "lattice_constants", "cell_parameters"], isSmall ? "非周期团簇，不适用" : "未记录");
        const spaceGroup = firstValue(material, fields, ["spaceGroup", "space_group", "space_group_symbol"], isSmall ? "非周期团簇，不适用" : "未记录");
        const systemEnergy = firstValue(material, fields, [isSmall ? "smallSystemEnergy" : "largeSystemEnergy", "systemEnergy", "system_energy", "system_energy_ev"], "未记录");
        const composition = `${safeText(material.formula)} × ${system.moleculeCount}；原子类型：${atomicTypes(material, record)}`;
        const leftRows = [
          { label: "体系名称", value: esc(system.systemName) },
          { label: "体系类型", value: esc(system.systemType) },
          { label: "原子总数", value: esc(system.atomTotal) },
          { label: "分子数", value: esc(system.moleculeCount) },
          { label: "力场类型", value: esc(system.forceField) }
        ];
        const parameterRows = [
          { label: "晶格常数", value: lattice },
          { label: "空间群", value: spaceGroup },
          { label: "体系能量", value: systemEnergy === "未记录" ? systemEnergy : `${systemEnergy} eV` },
          { label: "原子组成", value: composition }
        ];
        const imageName = `${String(material.id).replace(/[^a-z0-9_-]/gi, "_")}_large_system_structure.svg`;
        return `
          <div class="twod-detail-page-head"><div><h4>${esc(titleText)}</h4><p>${esc(descText)}</p></div></div>
          <div class="mlff-request-layout">
            <section class="mlff-request-card mlff-red-section-card"><h5 class="mlff-red-field mlff-red-heading">${isSmall ? "团簇信息" : "大体系信息"}</h5>${renderRows(leftRows)}</section>
            <div class="mlff-request-right">
              ${renderScene(material, tabKey, `${titleText}图`)}
              <section class="mlff-request-card mlff-red-structure-card"><h5 class="mlff-red-field mlff-red-heading">结构参数及原子组成</h5>${renderParameterGrid(parameterRows)}
                ${isSmall ? "" : `<div class="mlff-image-meta"><strong>完整结构描述：</strong>${esc(material.name)} 的扩展多分子体系结构，用于展示周期复制、拓扑扩展与多分子排布。<br><strong>图片名称：</strong>${esc(imageName)}<br><strong>图片格式：</strong>SVG 矢量图</div><div class="mlff-download-list" style="margin-top:12px;"><div class="mlff-download-row"><div><strong>完整结构图像</strong><span>${esc(imageName)} · SVG</span></div><button class="twod-detail-link-btn" type="button" onclick="return downloadMlffStructureImage('largeSystem')">下载图像</button></div>${renderDownloadRow("大体系结构数据", "完整结构参数与原子组成数据", "largeSystem")}</div>`}
              </section>
            </div>
          </div>`;
      };

      window.downloadMlffStructureImage = function downloadMlffStructureImage(kind = "largeSystem") {
        const material = typeof getCanonicalMaterialBySource === "function" ? getCanonicalMaterialBySource("mlff", state.selectedMaterialId) : null;
        if (!material) return false;
        const scene = buildMlffScene(material, kind);
        const width = 1200;
        const height = 720;
        const bonds = scene.bonds.map((bond) => {
          const from = scene.nodes[bond.from];
          const to = scene.nodes[bond.to];
          return `<line x1="${from.x * 12}" y1="${from.y * 7.2}" x2="${to.x * 12}" y2="${to.y * 7.2}" stroke="#657b9b" stroke-width="5" stroke-linecap="round"/>`;
        }).join("");
        const nodes = scene.nodes.map((node) => `<g><circle cx="${node.x * 12}" cy="${node.y * 7.2}" r="18" fill="${node.color}" stroke="#c8d5e6" stroke-width="2"/><text x="${node.x * 12}" y="${node.y * 7.2 + 5}" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="${node.text || "#ffffff"}">${esc(node.label)}</text></g>`).join("");
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#f4f8ff"/><text x="48" y="55" font-family="Arial,'Microsoft YaHei',sans-serif" font-size="26" font-weight="700" fill="#18385f">${esc(material.name)} 完整大体系结构图</text><text x="48" y="86" font-family="Arial,'Microsoft YaHei',sans-serif" font-size="15" fill="#617796">${esc(scene.caption)}</text><g transform="translate(0,60)">${bonds}${nodes}</g></svg>`;
        const filename = `${String(material.id).replace(/[^a-z0-9_-]/gi, "_")}_${kind}_structure.svg`;
        triggerTwodDetailDownload(filename, svg, "image/svg+xml;charset=utf-8");
        if (typeof showToast === "function") showToast("下载图像", `${material.name} 的完整结构图像已开始下载。`);
        return false;
      };
    })();
  