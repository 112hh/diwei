
  (() => {
    if (window.__TWOD_STRUCTURE_FILE_DISPLAY_READY__) return;
    window.__TWOD_STRUCTURE_FILE_DISPLAY_READY__ = true;

    function escapeStructureFileHtml(value) {
      if (typeof escapeLowDimHtml === "function") return escapeLowDimHtml(value);
      if (typeof escapeTwodHtml === "function") return escapeTwodHtml(value);
      return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[char]);
    }

    function sanitizeStructureFilePart(value, fallback) {
      const text = String(value || "").trim()
        .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (char) => "₀₁₂₃₄₅₆₇₈₉".indexOf(char))
        .replace(/[\\/:*?"<>|\s]+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "");
      return text || fallback;
    }

    function getTwodDetailStructureFileName(material) {
      const realCase = typeof getLowDimRealCase === "function" ? getLowDimRealCase("twod", material?.id) : null;
      const candidates = [
        material?.sourceCif,
        material?.localCifName,
        material?.structureFile,
        material?.structureFileName,
        material?.demoAssets?.structureFile,
        realCase?.structure?.sourceCif,
        realCase?.structure?.fileName,
        realCase?.structure?.name,
        realCase?.structure?.path ? String(realCase.structure.path).split(/[\\/]/).pop() : ""
      ].filter(Boolean);
      const existing = candidates.find((name) => /\.(cif|vasp|poscar|xsf|xyz)$/i.test(String(name)));
      if (existing) return String(existing);
      const formula = sanitizeStructureFilePart(
        typeof getTwodFormulaDisplay === "function" ? getTwodFormulaDisplay(material) : material?.formula || material?.name,
        "TwodMaterial"
      );
      const id = sanitizeStructureFilePart(
        material?.trueMaterialId || material?.materialId || material?.id,
        "structure"
      );
      return `${formula}_${id}.cif`;
    }

    function getTwodDetailStructureFileMeta(material) {
      const fileName = getTwodDetailStructureFileName(material);
      const extension = (fileName.match(/\.([^.]+)$/)?.[1] || "cif").toUpperCase();
      const realCase = typeof getLowDimRealCase === "function" ? getLowDimRealCase("twod", material?.id) : null;
      const atomCount = realCase?.structure?.atomCount || realCase?.fields?.n_atoms || material?.atomCoordinates?.length || material?.atomicCoordinates?.length || "-";
      const source = material?.sampleSourceFile || material?.dataSource || material?.source || "二维材料数据库";
      return { fileName, extension, atomCount, source };
    }

    function renderTwodDetailStructureFilePanel(material) {
      const meta = getTwodDetailStructureFileMeta(material);
      return `
        <div class="twod-structure-file-panel">
          <div class="twod-structure-file-main">
            <span class="twod-structure-file-type">${escapeStructureFileHtml(meta.extension)}</span>
            <div class="twod-structure-file-copy">
              <strong title="${escapeStructureFileHtml(meta.fileName)}">${escapeStructureFileHtml(meta.fileName)}</strong>
              <p>结构文件 · 原子数 ${escapeStructureFileHtml(meta.atomCount)} · 来源 ${escapeStructureFileHtml(meta.source)}</p>
            </div>
          </div>
          <button class="twod-detail-link-btn twod-structure-file-download" type="button" data-twod-download="structure-file">下载</button>
        </div>
      `;
    }

    function ensureTwodStructureFilePanelStyle() {
      if (document.getElementById("twodStructureFilePanelStyle")) return;
      const style = document.createElement("style");
      style.id = "twodStructureFilePanelStyle";
      style.textContent = `
        #page-twod-detail .twod-structure-file-panel{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:10px;padding:10px 12px;border:1px solid #d8e2f1;border-radius:6px;background:#f8fbff;}
        #page-twod-detail .twod-structure-file-main{display:flex;align-items:center;gap:10px;min-width:0;}
        #page-twod-detail .twod-structure-file-type{display:inline-flex;align-items:center;justify-content:center;min-width:44px;height:28px;padding:0 9px;border:1px solid #9db3d7;border-radius:4px;background:#edf3fb;color:#123c9c;font-size:12px;font-weight:800;line-height:1;}
        #page-twod-detail .twod-structure-file-copy{min-width:0;}
        #page-twod-detail .twod-structure-file-copy strong{display:block;max-width:100%;color:#142033;font-size:14px;line-height:20px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        #page-twod-detail .twod-structure-file-copy p{margin:2px 0 0;color:#64748b;font-size:12px;line-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        #page-twod-detail .twod-structure-file-download{flex:0 0 auto;min-width:64px;height:30px;}
        @media (max-width:640px){#page-twod-detail .twod-structure-file-panel{align-items:flex-start;flex-direction:column;}#page-twod-detail .twod-structure-file-copy strong,#page-twod-detail .twod-structure-file-copy p{white-space:normal;}.twod-structure-file-download{width:100%;}}
      `;
      document.head.appendChild(style);
    }

    const originalFormatTwodStructureDownloadName = typeof formatTwodStructureDownloadName === "function" ? formatTwodStructureDownloadName : null;
    formatTwodStructureDownloadName = function (material) {
      const fileName = getTwodDetailStructureFileName(material);
      return fileName || (originalFormatTwodStructureDownloadName ? originalFormatTwodStructureDownloadName(material) : "structure.cif");
    };

    const originalRenderTwodStructureViewerBlock = typeof renderTwodStructureViewerBlock === "function" ? renderTwodStructureViewerBlock : null;
    if (originalRenderTwodStructureViewerBlock) {
      renderTwodStructureViewerBlock = function (...args) {
        ensureTwodStructureFilePanelStyle();
        const material = args[0];
        const html = originalRenderTwodStructureViewerBlock.apply(this, args);
        const panel = renderTwodDetailStructureFilePanel(material);
        if (String(html).includes("</section>")) {
          return String(html).replace(/<\/section>\s*$/, `${panel}</section>`);
        }
        return `${html}${panel}`;
      };
    }
  })();
  