
(() => {
  const getAppState = () => typeof state !== "undefined" ? state : window.state;
  const enhanceCatalystTable = () => {
    const page = document.getElementById("page-catalyst");
    if (!page) return;
    const table = [...page.querySelectorAll(".twod-result-table")].find((candidate) => {
      const firstHeader = candidate.querySelector("thead th");
      return firstHeader && firstHeader.textContent.includes("序号");
    });
    if (!table) return;

    const headerCell = table.querySelector("thead th");
    if (headerCell && !headerCell.querySelector("#catalystBatchAll")) {
      headerCell.innerHTML = '<input id="catalystBatchAll" type="checkbox" aria-label="选择当前页全部催化材料">';
    }

    const rows = [...table.querySelectorAll("tbody tr")].filter((row) => row.querySelector("[data-open-material^='catalyst:']"));
    rows.forEach((row) => {
      const materialButton = row.querySelector("[data-open-material^='catalyst:']");
      const materialId = materialButton?.dataset.openMaterial?.split(":").slice(1).join(":") || "";
      const cell = row.querySelector("td");
      if (!cell || !materialId) return;
      let checkbox = cell.querySelector("[data-catalyst-batch-pick]");
      if (!checkbox) {
        const appState = getAppState();
        const checked = Array.isArray(appState?.catalystBatchSelection)
          && appState.catalystBatchSelection.includes(materialId);
        cell.insertAdjacentHTML(
          "afterbegin",
          `<input type="checkbox" data-catalyst-batch-pick="${materialId}" aria-label="选择 ${materialId}"${checked ? " checked" : ""}>`
        );
      } else if (Array.isArray(getAppState()?.catalystBatchSelection)) {
        checkbox.checked = getAppState().catalystBatchSelection.includes(materialId);
      }
    });

    const checkboxes = rows.map((row) => row.querySelector("[data-catalyst-batch-pick]")).filter(Boolean);
    const allCheckbox = table.querySelector("#catalystBatchAll");
    if (allCheckbox) {
      const selectedCount = checkboxes.filter((checkbox) => checkbox.checked).length;
      allCheckbox.checked = checkboxes.length > 0 && selectedCount === checkboxes.length;
      allCheckbox.indeterminate = selectedCount > 0 && selectedCount < checkboxes.length;
    }

    const actionRow = page.querySelector(".twod-results-head .twod-result-actions, .cross-db-toolbar-leading-actions");
    const siteButton = actionRow?.querySelector('[data-catalyst-workbench="site"]');
    if (!actionRow || !siteButton) return;
    let batchButton = actionRow.querySelector("[data-catalyst-batch-download]");
    if (!batchButton) {
      batchButton = document.createElement("button");
      batchButton.className = siteButton.className || "btn";
      batchButton.type = "button";
      batchButton.dataset.catalystBatchDownload = "";
      batchButton.textContent = "批量下载";
    }
    if (batchButton !== siteButton.previousElementSibling) {
      actionRow.insertBefore(batchButton, siteButton);
    }
  };

  const updateSelection = (checkbox) => {
    const materialId = checkbox?.dataset?.catalystBatchPick;
    const appState = getAppState();
    if (!materialId || !appState) return;
    if (!Array.isArray(appState.catalystBatchSelection)) appState.catalystBatchSelection = [];
    if (checkbox.checked) {
      if (!appState.catalystBatchSelection.includes(materialId)) appState.catalystBatchSelection.push(materialId);
    } else {
      appState.catalystBatchSelection = appState.catalystBatchSelection.filter((id) => id !== materialId);
    }
    enhanceCatalystTable();
  };

  const bind = () => {
    if (document.body.dataset.catalystSelectionDownloadOverrideBound === "true") return;
    document.body.dataset.catalystSelectionDownloadOverrideBound = "true";
    document.addEventListener("change", (event) => {
      if (event.target.matches("#catalystBatchAll")) {
        const table = event.target.closest("table");
        table?.querySelectorAll("[data-catalyst-batch-pick]").forEach((checkbox) => {
          checkbox.checked = event.target.checked;
          updateSelection(checkbox);
        });
        return;
      }
      if (event.target.matches("[data-catalyst-batch-pick]")) updateSelection(event.target);
    }, true);
    document.addEventListener("click", (event) => {
      const batchButton = event.target.closest("[data-catalyst-batch-download]");
      if (!batchButton) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const appState = getAppState();
      const selected = Array.isArray(appState?.catalystBatchSelection)
        ? appState.catalystBatchSelection.map((id) => typeof findCatalystMaterial === "function" ? findCatalystMaterial(id) : null).filter(Boolean)
        : [];
      if (!selected.length) {
        if (typeof showNotify === "function") showNotify("warning", "批量下载", "请先勾选需要下载的催化材料。");
        return;
      }
      if (typeof triggerCatalystBatchDownload === "function") {
        triggerCatalystBatchDownload(selected);
      } else if (typeof showToast === "function") {
        showToast("批量下载", `已选择 ${selected.length} 个催化材料。`);
      }
    }, true);
  };

  bind();
  enhanceCatalystTable();
  const observer = new MutationObserver(() => queueMicrotask(enhanceCatalystTable));
  observer.observe(document.body, { childList: true, subtree: true });
})();
