
    function getMissingFieldRedClass(label) {
      const text = String(label || "").replace(/<[^>]*>/g, "").trim();
      const fields = {
        twod: new Set(["原子坐标", "磁基态构型", "磁基态构型图", "声子谱", "声子态密度", "声子谱图", "声子态密度图", "介电函数", "介电函数图", "光学性质图谱", "空位缺陷构型", "空位缺陷形成能", "反位缺陷形成能", "反位缺陷构型", "缺陷性质图谱"]),
        electrolyte: new Set(["晶系", "晶胞参数", "空间群"]),
        opto: new Set(["3D分子结构图", "相对分子质量", "CAS 号", "InChIKey", "SMILES", "类别 Family", "含杂原子 / 检索命中"])
      };
      return fields[state?.selectedMaterialSource]?.has(text) ? " missing-field-red" : "";
    }

    function applyMissingFieldRedStyles() {
      const source = state?.selectedMaterialSource;
      const root = document.getElementById("page-twod-detail");
      if (!root || !source) return;
      const bySource = {
        twod: new Set(["原子坐标", "磁基态构型", "磁基态构型图", "声子谱", "声子态密度", "声子谱图", "声子态密度图", "介电函数", "介电函数图", "光学性质图谱", "空位缺陷构型", "空位缺陷形成能", "反位缺陷形成能", "反位缺陷构型", "缺陷性质图谱"]),
        electrolyte: new Set(["晶系", "晶胞参数", "空间群"]),
        opto: new Set(["3D分子结构图", "相对分子质量", "CAS 号", "InChIKey", "SMILES", "类别 Family", "含杂原子 / 检索命中"])
      };
      const labels = bySource[source] || new Set();
      root.querySelectorAll("h4,h5,th,td,.is-row-head,.detail-kv-label,.twod-tree-node span:last-child").forEach((node) => {
        const text = (node.textContent || "").trim();
        if (labels.has(text)) node.classList.add("missing-field-red");
        if (source === "twod" && state?.selectedTwodDetailSection === "visualization" && node.matches(".twod-tree-node span:last-child,.twod-detail-page-head h4,.twod-detail-chart-card h5")) node.classList.add("missing-field-red");
        if (source === "electrolyte" && /计算信息|计算数据/.test(text)) node.classList.add("missing-field-red");
        if (source === "electrolyte" && root.querySelector("h4")?.textContent.includes("计算信息") && node.matches(".is-row-head,.detail-kv-label")) node.classList.add("missing-field-red");
        if (source === "opto" && text === "数据来源") node.closest(".detail-kv-item,tr,.twod-structure-meta-item")?.remove();
      });
    }
    const missingFieldObserver = new MutationObserver(() => applyMissingFieldRedStyles());
    missingFieldObserver.observe(document.body, { childList: true, subtree: true });
    window.applyMissingFieldRedStyles = applyMissingFieldRedStyles;
    applyMissingFieldRedStyles();
  