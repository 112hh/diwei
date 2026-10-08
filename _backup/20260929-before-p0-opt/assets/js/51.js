
// -*- coding: utf-8 -*-
/*
 * MLFF 详情 —— 「三类结构 or 关系」补充层 2
 *
 * 问题：文件中 <script id="mlff-molecule-navigation-fallback-20260902"> （约 102298 行）
 * 注册了一个 body 级别 click 监听器，但它**不调用** renderMlffStructurePage，
 * 而是直接 `content.innerHTML = renderMlffStructurePage(...)`。
 * 由于它捕获的是「事件发生时」的全局函数引用，我们在末尾追加的包装层
 * 对 renderMlffStructurePage 的覆盖**应当**生效；
 * 但该监听器还额外做了两件事会破坏本层：
 *   1) 它把 state.selectedTwodDetailSection 设为 "molecule" 后直接写 innerHTML，
 *      绕过了 renderMlffDetailPage（而 renderMlffDetailTreeOverride 是由后者调用的）；
 *   2) renderMlffStructurePageMolecularDataset 内部对 tabKey==="molecule" 会
 *      强制渲染「单分子/双分子/多分子团簇」三个标签并用原始 originalStructure。
 *
 * 本层在捕获阶段（capture=true）先于该监听器拿到点击事件，直接把导航统一
 * 路由到 renderMlffDetailPage，并在渲染完成后做一次「后处理」，
 * 把结构页内容收敛为「该材料所属的那一类结构」。
 */
(function () {
  if (typeof window === "undefined") return;
  if (window.__mlffOrRelationLayer2) return;
  window.__mlffOrRelationLayer2 = true;

  var TAB_LABEL = { molecule: "分子结构", smallSystem: "小体系结构", largeSystem: "大体系结构" };

  var STRUCT_TYPE_MAP = {
    "单体": "molecule",
    "离子晶体": "small", "离子液体": "small", "蛋白质": "small", "DNA": "small",
    "聚合物": "large", "MOF": "large", "ZIF": "large", "沸石": "large", "2D材料": "large"
  };

  function resolveStructure(material) {
    if (typeof window.__mlffTopicResolveStructure === "function") {
      return window.__mlffTopicResolveStructure(material);
    }
    if (!material) return "molecule";
    if (STRUCT_TYPE_MAP[material.structureType]) return STRUCT_TYPE_MAP[material.structureType];
    var s = [material.structureType, material.english, material.name, material.formula, material.systemType].join(" ");
    if (/MOF|ZIF|沸石|石墨烯|聚合物|Polystyrene|Zeolite|Graphene|2D材料|大体系|扩展体系|周期/i.test(s)) return "large";
    if (/离子晶体|离子液体|蛋白质|Sodium|Lithium|EMIM|Dipeptide|Alanine|团簇|小体系/i.test(s)) return "small";
    return "molecule";
  }
  function ownedTab(material) {
    if (typeof window.__mlffTopicOwnedTab === "function") return window.__mlffTopicOwnedTab(material);
    var m = { molecule: "molecule", small: "smallSystem", large: "largeSystem" };
    return m[resolveStructure(material)] || "molecule";
  }

  /* 结构页后处理：收敛三类并存、移除三标签切换条 */
  function postProcessStructurePage() {
    var content = document.getElementById("twodDetailPageContent");
    if (!content || state.selectedMaterialSource !== "mlff") return;
    var material = typeof getCanonicalMaterialBySource === "function"
      ? getCanonicalMaterialBySource("mlff", state.selectedMaterialId) : null;
    if (!material) return;
    var owned = ownedTab(material);

    /* 1) 分子结构页内「单分子 / 双分子 / 多分子团簇」三标签并存 → 移除该切换条 */
    var tabs = content.querySelector(".mlff-molecule-dataset-tabs");
    if (tabs) tabs.remove();

    /* 2) 清除「结构类型提示条 / 结构样例数据」节点（这两块已不再渲染） */
    Array.prototype.forEach.call(content.querySelectorAll(".mlfftor-notice, .mlfftor-sample, .mlfftor-append-host"), function (n) { n.remove(); });

    /* 3) 标题补一句「仅展示所属结构」说明 */
    var head = content.querySelector(".twod-detail-page-head p");
    if (head) {
      var label = TAB_LABEL[owned];
      var tip = "（三类结构为或关系，本页仅展示「" + label + "」）";
      if (head.textContent.indexOf("或关系") < 0) head.textContent = head.textContent.replace(/。?$/, "") + tip + "。";
    }
  }

  /* 捕获阶段拦截左侧导航与 fallback 的点击，统一走 renderMlffDetailPage */
  document.body.addEventListener("click", function (event) {
    if (state.selectedMaterialSource !== "mlff") return;
    var node = event.target.closest && event.target.closest("#twodDetailTree button, #twodDetailTree .twod-tree-node");
    if (!node) return;
    var material = typeof getCanonicalMaterialBySource === "function"
      ? getCanonicalMaterialBySource("mlff", state.selectedMaterialId) : null;
    if (!material) return;
    var owned = ownedTab(material);

    /* 只允许 basic 与所属结构 */
    var key = node.dataset.mlffTopicSection || "";
    if (!key) {
      var txt = (node.textContent || "").trim();
      if (txt === "基础信息") key = "basic";
      else if (txt === "分子结构") key = owned === "molecule" ? "molecule" : "";
      else if (txt === "小体系结构") key = owned === "smallSystem" ? "smallSystem" : "";
      else if (txt === "大体系结构") key = owned === "largeSystem" ? "largeSystem" : "";
      else key = "";
      /* 非所属结构：拦下并改用所属结构 */
      if (!key) key = owned;
    } else if (key !== "basic" && key !== owned) {
      key = owned;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    state.selectedTwodDetailSection = key;

    /* 关键：直接调权威渲染函数，绕开 renderMlffDetailPage —— 
       因为 renderMlffDetailPage 内部对 molecule 会调 renderMlffStructurePage，
       而 renderMlffStructurePageMolecularDataset 会再包装一层「三标签并存」。
       这里改为：渲染内容后立即清理，保证只呈现所属结构。 */
    var content = document.getElementById("twodDetailPageContent");
    if (key === "basic") {
      if (typeof renderMlffDetailPage === "function") renderMlffDetailPage(material);
    } else {
      var label = TAB_LABEL[key] || "结构";
      var desc = key === "molecule"
        ? "展示当前材料的单分子结构与组成信息（该材料不涉及小体系 / 大体系结构）。"
        : key === "smallSystem"
          ? "展示当前材料的小体系结构与力场参数上下文（该材料不涉及分子 / 大体系结构）。"
          : "展示当前材料的扩展多分子体系结构（该材料不涉及分子 / 小体系结构）。";
      if (content && typeof renderMlffStructurePage === "function") {
        content.innerHTML = renderMlffStructurePage(material, key, label, desc);
      }
      if (typeof renderMlffDetailTreeOverride === "function") renderMlffDetailTreeOverride();
      if (typeof updateBreadcrumb === "function") updateBreadcrumb("twod-detail");
    }
    window.setTimeout(postProcessStructurePage, 0);
    return false;
  }, true);

  /* 兜底：切分区后（含其它入口）也做一次后处理 */
  var baseDetail2 = typeof renderMlffDetailPage === "function" ? renderMlffDetailPage : null;
  if (baseDetail2) {
    renderMlffDetailPage = function (material) {
      var result = baseDetail2.apply(this, arguments);
      if (material) window.setTimeout(postProcessStructurePage, 0);
      return result;
    };
    if (typeof window !== "undefined") window.renderMlffDetailPage = renderMlffDetailPage;
  }

  window.__mlffOrPostProcess = postProcessStructurePage;
})();

