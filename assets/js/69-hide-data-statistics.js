
/* 隐藏「数据统计」页面
 * 需求：该页面暂时不在系统中露出。
 * 做法：
 *   1) 从侧边栏移除 data-page="data-statistics" 入口（并防御性监听，被重新插入也会移除）；
 *   2) 拦截 switchPage，任何跳往 data-statistics 的调用都回落到「数据看板」并给出提示；
 *   3) 「菜单管理」里对应菜单项状态置为「停用」，与页面下线保持一致。
 * 恢复方式：删除本文件引用，并把侧边栏那一行按钮加回去即可。
 */
(function () {
  if (window.__LOWDIM_HIDE_DATA_STATISTICS__) return;
  window.__LOWDIM_HIDE_DATA_STATISTICS__ = true;

  var HIDDEN_PAGE = "data-statistics";
  var FALLBACK_PAGE = "dashboard";

  function hideNavEntry() {
    var nodes = document.querySelectorAll('.nav-btn[data-page="' + HIDDEN_PAGE + '"]');
    for (var i = 0; i < nodes.length; i += 1) {
      if (nodes[i].parentNode) nodes[i].parentNode.removeChild(nodes[i]);
    }
  }

  hideNavEntry();
  /* 侧边栏若被重新渲染，补移除一次（只查 3 次，不做持续监听，避免大页面 DOM 抖动） */
  [0, 200, 800].forEach(function (delay) { setTimeout(hideNavEntry, delay); });
  window.addEventListener("load", hideNavEntry);

  var baseSwitchPage = typeof switchPage === "function" ? switchPage : null;
  if (baseSwitchPage && !baseSwitchPage.__lowdimHideDataStatisticsPatched) {
    var patchedSwitchPage = function switchPageWithoutDataStatistics(page) {
      var clean = String(page || "").replace(/^page-/, "");
      if (clean === HIDDEN_PAGE) {
        baseSwitchPage(FALLBACK_PAGE);
        if (typeof showToast === "function") {
          showToast("功能暂未开放", "「数据统计」页面已隐藏，如需查看请先启用该模块。");
        }
        return;
      }
      baseSwitchPage(clean);
    };
    patchedSwitchPage.__lowdimHideDataStatisticsPatched = true;
    switchPage = patchedSwitchPage;
  }

  /* 菜单管理中同步置为「停用」 */
  try {
    if (typeof systemStore !== "undefined" && Array.isArray(systemStore.menus)) {
      systemStore.menus.forEach(function (item) {
        if (item && item.path === "/monitor/data-statistics") item.status = "停用";
      });
    }
  } catch (error) {
    console.warn("隐藏数据统计菜单状态失败", error);
  }
})();
