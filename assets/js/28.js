
    (() => {
      const moduleIds = ["twod", "electrolyte", "opto", "mlff", "catalyst"];
      const selectors = moduleIds.map((id) => `#page-${id}`).join(",");
      const countPattern = /(\d[\d,]*)\s*条/;
      let scheduled = false;
      let enhancing = false;

      const getActiveModeLabel = (root) => {
        const button = root.querySelector(".twod-mode-btn.active");
        return (button?.textContent || "条件检索").trim();
      };

      const readResultTotal = (root, countNode) => {
        const footerText = root.querySelector(".twod-result-footer, .result-footer")?.textContent || "";
        const footerMatch = footerText.match(/共(?:计)?\s*(\d[\d,]*)\s*条/);
        if (footerMatch) return Number(footerMatch[1].replace(/,/g, ""));
        const countText = countNode?.textContent || "";
        const match = countText.match(countPattern);
        if (match) return Number(match[1].replace(/,/g, ""));
        return root.querySelectorAll(".twod-result-table tbody tr:not(.empty-row)").length;
      };

      const normalizeResultHint = (root) => {
        const resultSections = root.querySelectorAll(".twod-search-results");
        resultSections.forEach((section) => {
          let countNode = section.querySelector(".twod-result-count, .electrolyte-status-count");
          if (!countNode && section.querySelector(".twod-result-table")) {
            const head = section.querySelector(".twod-results-head");
            if (head) {
              countNode = document.createElement("div");
              countNode.className = "twod-result-count";
              head.replaceChildren(countNode);
            }
          }
          if (!countNode) return;
          const total = readResultTotal(section, countNode);
          countNode.dataset.resultTotal = String(total);
          const label = getActiveModeLabel(root);
          const message = `已按“${label}”检索到${total}条匹配结果。`;
          if (countNode.textContent.trim() !== message) countNode.textContent = message;
          countNode.setAttribute("aria-live", "polite");
          section.querySelectorAll(".twod-result-hint").forEach((hint) => {
            hint.hidden = true;
            hint.setAttribute("aria-hidden", "true");
          });
        });
      };

      const truncateText = (value, limit = 10) => {
        const chars = Array.from(value);
        return chars.length > limit ? `${chars.slice(0, limit).join("")}...` : value;
      };

      const normalizeTableCell = (cell) => {
        if (cell.matches(":last-child") || cell.querySelector(".twod-record-inline-actions")) return;
        const originalCellText = (cell.dataset.fullText || cell.textContent || "").trim();
        if (originalCellText) {
          cell.dataset.fullText = originalCellText;
          cell.title = originalCellText;
        }
        const leaf = cell.querySelector("a, button, strong, span, em, code");
        if (leaf && !leaf.querySelector("a, button, strong, span, em, code") && leaf.children.length === 0) {
          const original = (leaf.dataset.fullText || leaf.textContent || "").trim();
          if (original) {
            leaf.dataset.fullText = original;
            leaf.title = original;
            const shortened = truncateText(original);
            if (leaf.textContent !== shortened) leaf.textContent = shortened;
          }
          return;
        }
        if (cell.children.length === 0 && originalCellText) {
          const shortened = truncateText(originalCellText);
          if (cell.textContent !== shortened) cell.textContent = shortened;
        }
      };

      const normalizeTables = (root) => {
        root.querySelectorAll(".twod-search-results .twod-result-table").forEach((table) => {
          table.querySelectorAll("thead th").forEach((cell) => { cell.title = cell.textContent.trim(); });
          table.querySelectorAll("tbody td").forEach(normalizeTableCell);
          table.querySelectorAll("tbody td:last-child").forEach((cell) => {
            cell.querySelectorAll("button, a").forEach((action) => { action.title = action.textContent.trim(); });
          });
        });
      };

      const enhance = () => {
        if (enhancing) return;
        enhancing = true;
        document.querySelectorAll(selectors).forEach((root) => {
          normalizeResultHint(root);
          normalizeTables(root);
        });
        enhancing = false;
      };

      const scheduleEnhance = () => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
          scheduled = false;
          enhance();
          window.setTimeout(enhance, 120);
        });
      };

      const observer = new MutationObserver(scheduleEnhance);
      observer.observe(document.body, { childList: true, subtree: true });
      document.addEventListener("click", scheduleEnhance, true);
      document.addEventListener("change", scheduleEnhance, true);
      enhance();
    })();
  