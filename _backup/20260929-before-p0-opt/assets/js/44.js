
(() => {
  document.body.addEventListener("click", (event) => {
    const button = event.target.closest?.("#twodDetailTree button");
    if (!button || button.textContent.trim() !== "分子结构") return;
    const content = document.getElementById("twodDetailPageContent");
    const material = typeof getCanonicalMaterialBySource === "function" ? getCanonicalMaterialBySource("mlff", state.selectedMaterialId) : null;
    if (!content || !material) return;
    state.selectedTwodDetailSection = "molecule";
    content.innerHTML = renderMlffStructurePage(material, "molecule", "分子结构", "展示当前材料的分子级结构与组成信息。");
    if (typeof renderMlffDetailTreeOverride === "function") renderMlffDetailTreeOverride();
  });
})();
