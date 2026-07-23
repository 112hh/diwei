/* ============================================================================
   Catalyst real-tools UI wiring (offline, client-side).
   Turns the催化 prototype tools into REAL functions using CatalystCrystal:
     - 催化活性位点分析  -> build slab+adsorbate, real GCN descriptor, honest
        (clearly-labelled, non-DFT) adsorption-energy estimate, 3D preview, export
     - 体相晶格生成 / Slab模型生成 / 吸附物添加 -> real CIF/POSCAR generation+download
   Communicates with the host app ONLY through window globals, so it is robust
   whether or not the app JS is wrapped in an IIFE. All app-internal references
   (state / showNotify / triggerTwodDetailDownload) are typeof-guarded.
   ============================================================================ */
(function () {
  "use strict";
  function el(id) { return document.getElementById(id); }
  function C() { return window.CatalystCrystal; }

  function parseElement(s) {
    if (!s) return "Pt";
    var m = String(s).trim().match(/^\s*([A-Z][a-z]?)/);
    return m ? m[1] : "Pt";
  }
  function parseMiller(s) {
    if (!s) return [1, 1, 1];
    var nums = String(s).replace(/[^0-9\-]/g, " ").trim().split(/\s+/).map(Number).filter(function (x) { return !isNaN(x); });
    if (nums.length >= 4) return [nums[0], nums[1], nums[2], nums[3]];
    if (nums.length >= 3) return [nums[0], nums[1], nums[2]];
    return [1, 1, 1];
  }
  function parseAds(s) { return String(s || "O").replace(/[*\s]/g, "").replace(/[（(].*$/, "") || "O"; }
  function parseSite(s) {
    s = String(s || "top");
    if (/桥|bridge/i.test(s)) return "bridge";
    if (/空穴|hollow|fcc|hcp/i.test(s)) return "hollow";
    if (/台阶|step|扭结|kink/i.test(s)) return "hollow";
    return "top";
  }
  function labelSite(s) { return s === "bridge" ? "桥位" : s === "hollow" ? "空穴位" : "顶位"; }
  function isHcp(elm) { var M = C().METALS[elm]; return M && M.struct === "hcp"; }
  function cnBulkOf(elm) { var M = C().METALS[elm]; return M && M.struct === "bcc" ? 8 : 12; }

  function download(name, text, mime) {
    try {
      if (typeof triggerTwodDetailDownload === "function") {
        triggerTwodDetailDownload(name, text, mime || "text/plain;charset=utf-8");
        return;
      }
    } catch (e) { /* fall through */ }
    var blob = new Blob([text], { type: mime || "text/plain;charset=utf-8" });
    var a = document.createElement("a");
    var url = URL.createObjectURL(blob);
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 0);
  }

  function notify(kind, title, msg) {
    try { if (typeof showNotify === "function") { showNotify(kind, title, msg); return; } } catch (e) {}
    try { if (typeof showToast === "function") { showToast(title, msg); return; } } catch (e) {}
  }

  function preview(host, structure, title) {
    if (!host) return;
    if (typeof $3Dmol === "undefined") {
      host.innerHTML = '<div style="padding:16px;color:#6f8298;font-size:13px;">结构已生成，可直接下载查看（3D 预览组件未就绪）。</div>';
      return;
    }
    try {
      host.innerHTML = "";
      host.style.position = "relative";
      if (host.offsetHeight < 120) host.style.minHeight = "300px";
      var pdb = C().toPDB(structure, title || "generated");
      var viewer = $3Dmol.createViewer(host, { backgroundColor: "white" });
      viewer.addModel(pdb, "pdb");
      viewer.setStyle({}, { sphere: { scale: 0.33 }, stick: { radius: 0.14 } });
      try { viewer.addUnitCell(); } catch (e) {}
      viewer.zoomTo();
      viewer.render();
      setTimeout(function () { try { viewer.resize(); viewer.render(); } catch (e) {} }, 90);
    } catch (err) {
      console.error("catalyst preview", err);
      host.innerHTML = '<div style="padding:16px;color:#b4532a;font-size:13px;">结构预览渲染失败（' + err.message + '），结构已生成，可下载。</div>';
    }
  }

  function tile(k, v, sub) {
    return '<div style="flex:1;min-width:120px;background:#f4f8ff;border:1px solid #dbe6f7;border-radius:10px;padding:8px 10px;">' +
      '<div style="font-size:12px;color:#6f8298;">' + k + '</div>' +
      '<div style="font-size:16px;font-weight:700;color:#22314a;">' + v + '</div>' +
      '<div style="font-size:11px;color:#8a9bb2;">' + (sub || "") + '</div></div>';
  }

  var last = { site: null };

  function runSite() {
    var Cx = C();
    var card = document.querySelector(".catalyst-site-result-card");
    try {
      var eln = parseElement(el("catalystToolSubstrate") ? el("catalystToolSubstrate").value : "Pt");
      var milRaw = el("catalystToolMiller") ? el("catalystToolMiller").value : "(111)";
      var ads = parseAds(el("catalystToolAdsorbate") ? el("catalystToolAdsorbate").value : "*O");
      var siteRaw = el("catalystToolAdsSite") ? el("catalystToolAdsSite").value : "顶位 (Top)";
      if (!Cx.METALS[eln]) eln = "Pt";
      var hcp = isHcp(eln);
      var mil = hcp ? [0, 0, 0, 1] : parseMiller(milRaw);
      var facetLabel = hcp ? "0001" : mil.join("");
      var site = parseSite(siteRaw);

      var slab = Cx.buildSlab({ element: eln, miller: mil, layers: 4, vacuum: 15, fixedLayers: 2, xyRepeat: [3, 3] });
      var st = Cx.addAdsorbate(slab, { species: ads, site: site, height: 2.0 });
      var nn = Cx.bulkNN(slab);
      var gcn = Cx.generalizedCoordination(st, st.meta.siteBase, nn + 0.6, cnBulkOf(eln));
      var est = Cx.estimateAdsorption(gcn.gcn, eln, ads);

      var name = eln + "_" + facetLabel + "_" + ads;
      last.site = {
        name: name,
        poscar: Cx.toPOSCAR(st, eln + "(" + facetLabel + ")+" + ads + " slab"),
        cif: Cx.toCIF(st, name),
        xyz: Cx.toXYZ(st, eln + "(" + facetLabel + ")+" + ads)
      };
      var nAds = st.atoms.filter(function (a) { return a.ads; }).length;

      try {
        state.catalystSiteResult = {
          adsorptionEnergy: est.value, strength: est.grade, substrate: eln,
          miller: "(" + facetLabel + ")", adsorbate: ads, site: siteRaw,
          summary: "GCN=" + gcn.gcn + "；" + est.note
        };
        state.catalystSiteCalcStatus = "done";
      } catch (e) { /* state may be app-scoped; ignore */ }

      if (card) {
        card.innerHTML =
          '<div class="catalyst-site-status-head"><strong>计算结果展示区</strong>' +
          '<span class="catalyst-site-result-note" style="color:#1f8f4e;">已生成真实结构 + 描述符</span></div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:10px;margin:10px 0;">' +
          tile("广义配位数 GCN", gcn.gcn, "真实几何描述符") +
          tile("生成结构", st.atoms.length + " 原子 / " + slab.meta.nLayers + " 层", eln + "(" + facetLabel + ") · 真空15Å") +
          tile("吸附物", ads + " @ " + labelSite(site), nAds + " 原子 / 高度2.0Å") +
          '</div>' +
          '<div style="background:#fff7ec;border:1px solid #f0d3a0;border-radius:10px;padding:10px 12px;margin:8px 0;">' +
          '<div style="font-size:20px;font-weight:800;color:#8a5a08;">' + est.value + ' eV ' +
          '<span style="font-size:12px;font-weight:600;background:#f0d3a0;color:#6b430a;border-radius:6px;padding:2px 7px;margin-left:6px;">' + est.grade + '</span></div>' +
          '<div style="font-size:12px;color:#8a6a3a;margin-top:4px;">' + est.note + '</div></div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">' +
          '<button class="btn-primary" type="button" onclick="CatalystRealUI.downloadSite(\'poscar\')">下载 POSCAR</button>' +
          '<button class="btn-outline" type="button" onclick="CatalystRealUI.downloadSite(\'cif\')">下载 CIF</button>' +
          '<button class="btn-outline" type="button" onclick="CatalystRealUI.downloadSite(\'xyz\')">下载 XYZ</button></div>';
      }
      var expBtn = document.querySelector("[data-catalyst-site-export]");
      if (expBtn) expBtn.removeAttribute("disabled");
      preview(el("catalystWorkbenchSiteCanvas"), st, eln + "(" + facetLabel + ")+" + ads);
    } catch (err) {
      console.error("runSite", err);
      if (card) card.innerHTML = '<div style="padding:14px;color:#b4532a;">结构生成失败：' + err.message + '</div>';
    }
    return false;
  }

  function downloadSite(fmt) {
    if (!last.site) return;
    if (fmt === "cif") download(last.site.name + ".cif", last.site.cif, "chemical/x-cif");
    else if (fmt === "xyz") download(last.site.name + ".xyz", last.site.xyz, "chemical/x-xyz");
    else download("POSCAR_" + last.site.name + ".vasp", last.site.poscar, "text/plain;charset=utf-8");
  }

  // Real generation for the build workbench download buttons (bulk/slab/adsorbate).
  // Returns true if it handled the download; false to let the host fall back.
  function buildDownload(stepKey, material, resource) {
    var Cx = C();
    if (!Cx) return false;
    var elems = (material && material.elements) || [];
    var eln = parseElement(elems[0] || (material && material.formula) || "Pt");
    var pure = elems.length <= 1 && !!Cx.METALS[eln];
    if (!pure) {
      notify("info", "结构生成", (material ? material.name : "该材料") +
        " 为化合物/多元体系，客户端暂只对单质金属(Pt/Cu/Fe/Co/Ni/Au/Ag/Pd/Ir/Rh/Ru…)做真实晶格生成；已导出流程说明包。");
      return false;
    }
    try {
      var base = String((material && material.id) || eln).replace(/[^a-zA-Z0-9_-]+/g, "_");
      var hcp = isHcp(eln);
      var struct, summary;
      if (stepKey === "bulk") {
        struct = Cx.buildBulk({ element: eln, supercell: [2, 2, 2] });
        download(base + "_bulk.cif", Cx.toCIF(struct, eln + "_bulk"), "chemical/x-cif");
        download("POSCAR_" + base + "_bulk.vasp", Cx.toPOSCAR(struct, eln + " bulk"), "text/plain;charset=utf-8");
        summary = eln + " 体相超胞 " + struct.atoms.length + " 原子（已导出 CIF + POSCAR）";
      } else if (stepKey === "slab") {
        var facet = hcp ? [0, 0, 0, 1] : parseMiller((resource && resource.slab && resource.slab.plane) || "(111)");
        var layers = parseInt((resource && resource.slab && resource.slab.slabLayers), 10) || 6;
        var vac = parseFloat((resource && resource.slab && resource.slab.vacuum)) || 15;
        struct = Cx.buildSlab({ element: eln, miller: facet, layers: layers, vacuum: vac, fixedLayers: 2, xyRepeat: [2, 2] });
        var fl = hcp ? "0001" : facet.join("");
        download("POSCAR_" + base + "_slab_" + fl + ".vasp", Cx.toPOSCAR(struct, eln + "(" + fl + ") slab"), "text/plain;charset=utf-8");
        download(base + "_slab_" + fl + ".cif", Cx.toCIF(struct, eln + "_slab_" + fl), "chemical/x-cif");
        summary = eln + "(" + fl + ") slab " + struct.atoms.length + " 原子 / " + struct.meta.nLayers + " 层 / 真空 " + vac + "Å（含固定层）";
      } else {
        var facet2 = hcp ? [0, 0, 0, 1] : parseMiller((resource && resource.slab && resource.slab.plane) || "(111)");
        var slab = Cx.buildSlab({ element: eln, miller: facet2, layers: 4, vacuum: 15, fixedLayers: 2, xyRepeat: [3, 3] });
        var species = parseAds((resource && resource.adsorbate && resource.adsorbate.species) || "O");
        var site = parseSite((resource && resource.adsorbate && resource.adsorbate.site) || "hollow");
        struct = Cx.addAdsorbate(slab, { species: species, site: site, height: 2.0 });
        var fl2 = hcp ? "0001" : facet2.join("");
        download("POSCAR_" + base + "_ads_" + species + ".vasp", Cx.toPOSCAR(struct, eln + "(" + fl2 + ")+" + species), "text/plain;charset=utf-8");
        summary = eln + "(" + fl2 + ")+" + species + " @ " + labelSite(site) + "，" + struct.atoms.length + " 原子";
      }
      notify("success", "已生成真实结构", summary + "（客户端 pymatgen 级几何建模，快速/确定性，非DFT）。");
      return true;
    } catch (err) {
      console.error("buildDownload", err);
      return false;
    }
  }

  window.CatalystRealUI = { runSite: runSite, downloadSite: downloadSite, buildDownload: buildDownload, preview: preview, _last: last };
})();
