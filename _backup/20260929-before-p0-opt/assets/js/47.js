
/* 修复：进入系统默认打开"二维材料数据应用"时列表为空的问题。
   原因：统一闭包脚本的初始渲染发生在 refreshTwodResults 被覆盖为
   "默认展示全部数据"版本之前，首次渲染结果为空，只有切换应用后才会重渲染。
   本补丁在所有脚本加载完成后兜底重渲染，并在登录/切换到 twod 页时兜底。 */
(function () {
  if (window.__TWOD_DEFAULT_LIST_REPAIR_READY__) return;
  window.__TWOD_DEFAULT_LIST_REPAIR_READY__ = true;

  function needsRepair() {
    if (typeof state === "undefined" || !state || state.page !== "twod") return false;
    var appRoot = document.getElementById("twodAppRoot");
    if (!appRoot) return false;
    var body = document.getElementById("twodBaseTableBody");
    if (!body) return false;
    if (body.children.length === 0) return true;
    return body.textContent.indexOf("暂无符合条件的二维材料数据") >= 0;
  }

  function repairTwodDefaultList() {
    if (!needsRepair()) return;
    if (typeof window.renderTwodModuleUnified === "function") {
      try { window.renderTwodModuleUnified(); } catch (e) { /* ignore */ }
      return;
    }
    if (typeof refreshTwodResults === "function") {
      try { refreshTwodResults({ resetPage: true }); } catch (e) { /* ignore */ }
    }
  }

  function repairOnReady() {
    [0, 200, 800].forEach(function (delay) { setTimeout(repairTwodDefaultList, delay); });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", repairOnReady);
    window.addEventListener("load", repairOnReady);
  } else {
    repairOnReady();
  }

  /* 登录流程 / 角色重定向直接调用 switchPage("twod")，不经过导航点击，
     这里包一层保证切到 twod 时列表必然渲染。 */
  if (typeof switchPage === "function" && !switchPage.__twodDefaultListPatched) {
    var baseSwitchPage = switchPage;
    var patchedSwitchPage = function switchPageWithTwodDefaultList(page) {
      var result = baseSwitchPage(page);
      if (page === "twod") setTimeout(repairTwodDefaultList, 0);
      if (page === "lowdim-ingest-detail" && typeof renderLowdimIngestDetailPage === "function") {
        setTimeout(renderLowdimIngestDetailPage, 0);
      }
      return result;
    };
    patchedSwitchPage.__twodDefaultListPatched = true;
    switchPage = patchedSwitchPage;
    if (window.MarvisRouter) {
      window.MarvisRouter.go = function (pageId) {
        var cleanId = String(pageId || "");
        if (cleanId.indexOf("page-") === 0) cleanId = cleanId.slice(5);
        switchPage(cleanId);
      };
    }
  }
})();
