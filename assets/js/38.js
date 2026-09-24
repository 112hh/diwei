
(() => {
  if (typeof handleMaterialDetailOpen !== "function" || typeof optoMaterials === "undefined") return;
  const previousRequestedHandle = handleMaterialDetailOpen;
  handleMaterialDetailOpen = function handleRequestedOptoDetail(materialToken, targetView = "basic") {
    const token = String(materialToken || "");
    if (token.startsWith("opto:") && targetView !== "prediction") {
      const id = token.slice(5);
      const material = optoMaterials.find((item) => item.id === id) || optoMaterials[0];
      state.selectedMaterialSource = "opto";
      state.selectedMaterialId = material.id;
      state.selectedMaterialSection = "basic";
      if (typeof openModal === "function") openModal("materialModal");
      const targetMap = { spectra: "spectra", params: "params", external: "external" };
      const render = () => {
        const helperScript = document.getElementById("opto-requested-detail-20260902-script");
        const modal = document.getElementById("materialModal");
        if (!helperScript || !modal) return;
        /* Re-enter through the wrapped rich modal only to reuse the custom renderer installed above. */
        if (typeof openRichMaterialModal === "function") openRichMaterialModal(token, targetMap[targetView] || "basic");
      };
      window.setTimeout(render, 0);
      return false;
    }
    return previousRequestedHandle(materialToken, targetView);
  };
  window.handleMaterialDetailOpen = handleMaterialDetailOpen;
})();
