
    (() => {
      const hiddenAlgorithmToolPages = new Set(["sys-algorithm", "sys-api"]);
      const originalSwitchPage = typeof switchPage === "function" ? switchPage : null;

      if (originalSwitchPage && !window.__algorithmToolsHiddenSwitchWrapped) {
        switchPage = function guardedSwitchPage(page) {
          return originalSwitchPage(hiddenAlgorithmToolPages.has(page) ? "twod" : page);
        };
        window.__algorithmToolsHiddenSwitchWrapped = true;
      }

      const syncHiddenAlgorithmToolPage = () => {
        if (typeof state !== "undefined" && hiddenAlgorithmToolPages.has(state?.page) && typeof switchPage === "function") {
          switchPage("twod");
        }
      };

      syncHiddenAlgorithmToolPage();
      setTimeout(syncHiddenAlgorithmToolPage, 0);
    })();
  