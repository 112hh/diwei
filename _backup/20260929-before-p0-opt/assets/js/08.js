
  (function () {
    "use strict";
    if (window.__mol3dInstalled) return;
    window.__mol3dInstalled = true;

    function styleFor(mode) {
      if (mode === "spacefill") return { sphere: { scale: 0.75 } };
      return { stick: { radius: 0.16 }, sphere: { scale: 0.30 } };
    }

    function colorHex(sym) {
      try {
        const c = $3Dmol.elementColors && $3Dmol.elementColors.defaultColors && $3Dmol.elementColors.defaultColors[sym];
        if (typeof c === "number") return "#" + c.toString(16).padStart(6, "0");
      } catch (e) {}
      return "#999999";
    }

    function getStructure(el) {
      const database = el.getAttribute("data-real-database") || "";
      const materialId = el.getAttribute("data-material-id") || el.getAttribute("data-case-id") || "";
      let realCase = typeof window.getLowDimRealCase === "function"
        ? window.getLowDimRealCase(database, materialId)
        : null;
      if (!realCase) {
        const bucket = window.LOW_DIM_REAL_CASES?.databases?.[database];
        realCase = Array.isArray(bucket)
          ? bucket.find((item) => String(item?.id) === String(materialId)) || null
          : null;
      }
      const structureKey = el.getAttribute("data-structure-key") || "";
      if (structureKey) {
        const alt = realCase?.altStructures?.[structureKey];
        if (alt?.text) return alt;
      }
      return realCase?.structure || null;
    }

    function normalizeElements(elements) {
      if (Array.isArray(elements)) {
        return Array.from(new Set(elements.map(function (item) {
          return typeof item === "string" ? item : item?.symbol || item?.element || "";
        }).filter(Boolean)));
      }
      if (elements && typeof elements === "object") return Object.keys(elements).filter(Boolean);
      return [];
    }

    function cleanup(el) {
      const viewer = el && el.__lowDimMolViewer;
      if (!viewer) return;
      try { viewer.spin(false); } catch (e) {}
      try { viewer.removeAllModels(); } catch (e) {}
      try { viewer.removeAllShapes(); } catch (e) {}
      try { viewer.clear(); } catch (e) {}
      try {
        el.querySelectorAll("canvas").forEach(function (canvas) {
          const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
          const loseContext = gl && gl.getExtension("WEBGL_lose_context");
          if (loseContext) loseContext.loseContext();
        });
      } catch (e) {}
      el.__lowDimMolViewer = null;
    }

    function appendLegend(el, elements) {
      if (!elements.length) return;
      const legend = document.createElement("div");
      legend.className = "mol3d-legend";
      elements.forEach(function (sym) {
        const item = document.createElement("span");
        const dot = document.createElement("i");
        dot.style.background = colorHex(sym);
        item.appendChild(dot);
        item.appendChild(document.createTextNode(sym));
        legend.appendChild(item);
      });
      el.appendChild(legend);
    }

    function appendToolbar(el, viewer, periodic, model, initialView) {
      let styleMode = "ball";
      let spinning = false;
      let cellOn = periodic;

      const bar = document.createElement("div");
      bar.className = "mol3d-toolbar";

      function btn(label, title) {
        const button = document.createElement("button");
        button.className = "mol3d-btn";
        button.type = "button";
        button.textContent = label;
        button.title = title || label;
        return button;
      }

      const bReset = btn("重置", "还原初始视角、样式与旋转状态");
      const bSpin = btn("自转", "开启 / 关闭自动旋转");
      const bCell = btn("晶胞", periodic ? "显示 / 隐藏晶胞框" : "当前结构为非周期性体系，无晶胞");
      const bStyle = btn("球棍", "当前：球棍模型，点击切换为空间填充");

      bCell.setAttribute("data-mol-action", "cell");
      bCell.disabled = !periodic;
      bCell.setAttribute("aria-disabled", periodic ? "false" : "true");
      if (periodic) bCell.classList.add("is-active");

      function applyStyle() {
        viewer.setStyle({}, styleFor(styleMode));
        const isBall = styleMode === "ball";
        bStyle.textContent = isBall ? "球棍" : "填充";
        bStyle.title = isBall
          ? "当前：球棍模型，点击切换为空间填充"
          : "当前：空间填充模型，点击切换为球棍";
        bStyle.classList.toggle("is-active", !isBall);
      }

      function applyCell() {
        if (!periodic) return;
        try {
          if (cellOn) viewer.addUnitCell(model);
          else viewer.removeUnitCell(model);
        } catch (err) { /* 结构无晶胞信息时忽略 */ }
        bCell.classList.toggle("is-active", cellOn);
      }

      bReset.onclick = function () {
        // 停自转
        spinning = false;
        try { viewer.spin(false); } catch (err) {}
        bSpin.classList.remove("is-active");
        // 还原样式
        styleMode = "ball";
        applyStyle();
        // 还原晶胞显示
        cellOn = periodic;
        applyCell();
        // 还原视角：优先用初始视角，拿不到再退回自动缩放
        if (initialView) {
          try { viewer.setView(initialView); } catch (err) { viewer.zoomTo(); }
        } else {
          viewer.zoomTo();
        }
        viewer.render();
        return false;
      };

      bSpin.onclick = function () {
        spinning = !spinning;
        try { viewer.spin(spinning ? "y" : false); } catch (err) {}
        bSpin.classList.toggle("is-active", spinning);
        return false;
      };

      bCell.onclick = function () {
        if (!periodic) return false;
        cellOn = !cellOn;
        applyCell();
        viewer.render();
        return false;
      };

      bStyle.onclick = function () {
        styleMode = styleMode === "ball" ? "spacefill" : "ball";
        applyStyle();
        viewer.render();
        return false;
      };

      applyStyle();
      bar.appendChild(bReset);
      bar.appendChild(bSpin);
      bar.appendChild(bCell);
      bar.appendChild(bStyle);
      el.appendChild(bar);
    }

    function mount(el) {
      if (!el || el.getAttribute("data-mol-init") === "1") return;
      if (!window.$3Dmol) return;
      const structure = getStructure(el);
      if (!structure?.text || !structure?.viewerFormat) {
        el.setAttribute("data-mol-error", "missing-embedded-structure");
        el.setAttribute("data-mol-ready", "0");
        return;
      }
      el.setAttribute("data-mol-init", "1");
      el.removeAttribute("data-mol-error");

      const loading = document.createElement("div");
      loading.className = "mol3d-loading";
      loading.textContent = "正在加载 3D 结构…";
      el.appendChild(loading);

      try {
        const viewer = $3Dmol.createViewer(el, { backgroundColor: "white" });
        el.__lowDimMolViewer = viewer;
        const format = String(structure.viewerFormat).toLowerCase() === "poscar" ? "vasp" : String(structure.viewerFormat).toLowerCase() === "extxyz" ? "xyz" : String(structure.viewerFormat).toLowerCase();
        const model = viewer.addModel(structure.text, structure.viewerFormat);
        viewer.setStyle({}, styleFor("ball"));
        const periodic = format === "cif" || format === "vasp";
        if (periodic) {
          try { viewer.addUnitCell(model); } catch (cellErr) { /* 无晶胞信息时忽略 */ }
        }
        viewer.zoomTo();
        viewer.render();
        // 记录初始视角，供「重置」精确还原（zoomTo 只调缩放，不还原旋转与平移）
        let initialView = null;
        try { initialView = viewer.getView(); } catch (viewErr) { initialView = null; }
        loading.remove();
        appendLegend(el, normalizeElements(structure.elements));
        appendToolbar(el, viewer, periodic, model, initialView);
        el.setAttribute("data-mol-ready", "1");
      } catch (e) {
        loading.remove();
        cleanup(el);
        el.setAttribute("data-mol-ready", "0");
        el.setAttribute("data-mol-error", e && e.message ? e.message : "viewer-error");
        const msg = document.createElement("div");
        msg.className = "mol3d-error";
        msg.textContent = "无法初始化交互式 3D 结构：" + (e && e.message ? e.message : e);
        el.appendChild(msg);
      }
    }

    function scan(root) { (root || document).querySelectorAll('.mol3d-viewer[data-mol-init="0"]').forEach(mount); }

    const observer = new MutationObserver(function (muts) {
      for (const m of muts) {
        for (const node of m.removedNodes) {
          if (node.nodeType !== 1) continue;
          if (node.classList && node.classList.contains("mol3d-viewer")) cleanup(node);
          if (node.querySelectorAll) node.querySelectorAll(".mol3d-viewer").forEach(cleanup);
        }
        for (const node of m.addedNodes) {
          if (node.nodeType !== 1) continue;
          if (node.classList && node.classList.contains("mol3d-viewer") && node.getAttribute("data-mol-init") === "0") mount(node);
          else if (node.querySelectorAll) scan(node);
        }
      }
    });
    function start() { scan(document); observer.observe(document.body, { childList: true, subtree: true }); }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
  })();
  