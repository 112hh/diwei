
  /* 修复3：直接通过 URL（如 ?entry=app&page=prediction 或登录跳转目标）
     进入“算法预测结果”页时，右侧内容面板与预测菜单均为空白。
     这里在页面被激活且内容为空时，补一块与全站规范一致的空状态提示；
     一旦应用自身渲染了内容（如点击“发起预测”进入），本逻辑自动让位。 */
  (function () {
    function boot() {
      var page = document.getElementById("page-prediction");
      var content = document.getElementById("predictionPageContent");
      if (!page || !content) return;
      var filled = false;
      function fill() {
        if (filled) return;
        if (getComputedStyle(page).display === "none") return;
        if (content.textContent.trim()) { filled = true; return; }
        content.innerHTML =
          '<div class="twod-detail-page-head"><div><h4>预测结果</h4>' +
          '<p>请从二维材料等数据检索列表点击“发起预测”进入，或先在左侧预测菜单选择要查看的内容。</p></div></div>' +
          '<section class="twod-detail-section-card"><div class="twod-detail-empty-state">' +
          '<strong>暂无可展示的预测内容</strong>' +
          '<span>预测功能需要先选择具体材料记录，选中后此处将展示对应的预测详情。</span>' +
          '</div></section>';
      }
      try {
        new MutationObserver(function () { fill(); }).observe(page, {
          attributes: true,
          attributeFilter: ["class", "style"]
        });
      } catch (err) { /* 环境不支持观察器时仅靠兜底定时器 */ }
      setTimeout(fill, 400);
      setTimeout(fill, 1600);
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  })();
