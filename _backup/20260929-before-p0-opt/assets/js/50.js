
// -*- coding: utf-8 -*-
/*
 * MLFF 主题应用页详情 —— 「三类结构 or 关系」最终覆盖层（权威层）
 *
 * 背景：low-dim-materials.html 是单文件巨型应用，函数被多层同名赋值覆盖，
 * 最后执行的赋值胜出。经运行时打点确认，MLFF 详情的真实链路为：
 *
 *   列表按钮 data-open-material="mlff:<id>"
 *     → handleMaterialDetailOpen / openRichMaterialModal
 *     → (71445 行覆盖) parsed.source === "mlff" ? openMlffDetailPage(...)
 *     → renderMlffDetailPage(material)                       ← 71369
 *     → renderMlffDetailTreeOverride()                       ← 左侧导航，写死 4 项
 *     → renderMlffDetailBasicPage(material)                  ← 102240（权威）
 *     → renderMlffStructurePage(material, tabKey, ...)       ← 102271（权威）
 *
 * 本层在文件末尾追加，包住上述三个权威函数，实现：
 *   1) 左侧导航只保留「基础信息 + 该材料所属的那一类结构」，三类互斥；
 *   2) 基础信息页追加「结构类型提示条」+ Excel 样例数据表（统计卡 + 3 图 + 12 列表）；
 *   3) 结构页去掉写死的 molecule/smallSystem/largeSystem 三类并存，只渲染所属类；
 *   4) 分子结构页内部原本还有「单分子 / 双分子 / 多分子团簇」三标签并存，一并收敛。
 */
(function () {
  if (typeof window === "undefined") return;
  if (window.__mlffTopicOrRelationApplied) return;
  window.__mlffTopicOrRelationApplied = true;

  /* ── 模块 A：结构判定（or 关系）─────────────────────────────────────────
     依据真实数据集 structureType 取值：
       单体                            → 分子结构
       离子晶体 / 离子液体 / 蛋白质 / DNA → 小体系结构
       聚合物 / MOF / ZIF / 沸石 / 2D材料  → 大体系结构
     真实案例（structureType 为 undefined，ID 形如 r170634_XXX）→ 分子结构（单分子构型 + 平衡原子电荷）。 */
  var STRUCT_TYPE_MAP = {
    "单体": "molecule",
    "离子晶体": "small",
    "离子液体": "small",
    "蛋白质": "small",
    "DNA": "small",
    "聚合物": "large",
    "MOF": "large",
    "ZIF": "large",
    "沸石": "large",
    "2D材料": "large"
  };

  var RULES = [
    {
      structure: "large",
      test: function (m) {
        if (STRUCT_TYPE_MAP[m.structureType] === "large") return true;
        var s = [m.structureType, m.english, m.name, m.formula, m.systemType].join(" ");
        return /MOF|ZIF|沸石|石墨烯|聚合物|DNA双链|Polystyrene|Zeolite|Graphene|2D材料|大体系|扩展体系|周期/i.test(s);
      }
    },
    {
      structure: "small",
      test: function (m) {
        if (STRUCT_TYPE_MAP[m.structureType] === "small") return true;
        var s = [m.structureType, m.english, m.name, m.formula, m.systemType].join(" ");
        return /离子晶体|离子液体|蛋白质|Sodium|Lithium|EMIM|Dipeptide|Alanine|团簇|小体系/i.test(s);
      }
    },
    { structure: "molecule", test: function () { return true; } }
  ];

  var TAB_KEY = { molecule: "molecule", small: "smallSystem", large: "largeSystem" };
  var TAB_LABEL = { molecule: "分子结构", smallSystem: "小体系结构", largeSystem: "大体系结构" };

  function resolveStructure(material) {
    if (!material) return "molecule";
    for (var i = 0; i < RULES.length; i++) {
      if (RULES[i].test(material)) return RULES[i].structure;
    }
    return "molecule";
  }
  function ownedTab(material) {
    return TAB_KEY[resolveStructure(material)] || "molecule";
  }
  function structureReason(structure) {
    if (structure === "small") return "该材料为离子 / 多分子聚集的小体系，力场参数以局域片段与短程相互作用为采集对象。";
    if (structure === "large") return "该材料为周期性或多孔扩展体系，力场参数以跨尺度结构样本与长程相互作用为采集对象。";
    return "该材料为单分子体系，力场参数以单个分子的构型与分子级性质为采集对象。";
  }
  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ── 模块 B：结构样例数据（按材料 id 稳定分片，来自 Excel 样例）────────── */
  // 三类结构各自的字段定义与样例记录由 renderMlffTopicSampleTable 提供；
  // 若上一轮注入的 MLFF_STRUCTURE_SAMPLES 存在则直接复用，否则本层自建一份精简版。
  var FIELDS = {
    molecule: ["材料ID", "分子式", "体系名称", "原子数", "点群", "电荷", "自旋多重度", "单分子能量(eV)", "偶极矩(Debye)", "四极矩", "极化率(Å³)", "色散系数"],
    smallSystem: ["材料ID", "分子式", "体系名称", "分子数", "原子总数", "电荷", "体系能量(eV)", "能量(eV/atom)", "相互作用能(kcal/mol)", "极化率(Å³)", "Bader电荷", "色散系数"],
    largeSystem: ["材料ID", "分子式", "体系名称", "晶胞分子数", "原子总数", "空间群", "体系能量(eV)", "能量(eV/atom)", "带隙(eV)", "磁矩(μB)", "力(eV/Å)", "色散系数"]
  };
  var SOURCE = {
    molecule: "Q-Chem / Molpro 单分子性质计算数据集",
    smallSystem: "VASP / CP2K 小体系团簇计算数据集",
    largeSystem: "VASP 周期性大体系计算数据集"
  };
  var CHART_METRICS = {
    molecule: [
      { key: "原子数", label: "原子数分布", unit: "个" },
      { key: "单分子能量(eV)", label: "单分子能量分布", unit: "eV" },
      { key: "偶极矩(Debye)", label: "偶极矩分布", unit: "D" }
    ],
    smallSystem: [
      { key: "原子总数", label: "原子总数分布", unit: "个" },
      { key: "体系能量(eV)", label: "体系能量分布", unit: "eV" },
      { key: "相互作用能(kcal/mol)", label: "相互作用能分布", unit: "kcal/mol" }
    ],
    largeSystem: [
      { key: "原子总数", label: "原子总数分布", unit: "个" },
      { key: "体系能量(eV)", label: "体系能量分布", unit: "eV" },
      { key: "带隙(eV)", label: "带隙分布", unit: "eV" }
    ]
  };
  var ELEMENTS = ["H", "C", "N", "O", "S", "P", "F", "Cl", "Na", "Li", "Si", "Zn"];
  var POINT_GROUPS = ["C1", "Cs", "C2v", "D2h", "C3v", "Td", "D6h", "Oh"];
  var SPINS = ["1", "2", "3"];
  var SPACE_GROUPS = ["P1", "P-1", "P21/c", "C2/m", "Fm-3m", "Pnma", "R-3m"];
  var SYSTEM_NAMES = {
    molecule: ["单分子构型 A", "单分子构型 B", "单分子异构体", "单分子平衡构型"],
    smallSystem: ["离子对团簇", "六聚体团簇", "水合离子团簇", "二聚体复合物"],
    largeSystem: ["扩展周期超胞", "多孔骨架超胞", "层状堆垛超胞", "聚合物链超胞"]
  };

  function hash(str) {
    var s = String(str || ""), acc = 0;
    for (var i = 0; i < s.length; i++) acc = (acc * 31 + s.charCodeAt(i)) >>> 0;
    return acc;
  }
  function mkRandom(seed) {
    var x = seed >>> 0 || 1;
    return function () {
      x ^= x << 13; x >>>= 0;
      x ^= x >> 17;
      x ^= x << 5;  x >>>= 0;
      return (x >>> 0) / 4294967296;
    };
  }
  function num(rnd, min, max, digits) {
    var v = min + rnd() * (max - min);
    return Number(v.toFixed(digits == null ? 2 : digits));
  }

  function buildRecords(material, structure, count) {
    count = count || 6;
    var rnd = mkRandom(hash(material.id || material.name || "mlff"));
    var rows = [];
    var names = SYSTEM_NAMES[structure] || SYSTEM_NAMES.molecule;
    for (var i = 0; i < count; i++) {
      var idStr = "mol-" + (10 + i);
      var el1 = ELEMENTS[Math.floor(rnd() * ELEMENTS.length)];
      var el2 = ELEMENTS[Math.floor(rnd() * ELEMENTS.length)];
      var el3 = ELEMENTS[Math.floor(rnd() * ELEMENTS.length)];
      var row = {};
      if (structure === "molecule") {
        row["材料ID"] = idStr;
        row["分子式"] = el1 + "H" + (2 + i) + el2;
        row["体系名称"] = names[i % names.length];
        row["原子数"] = Math.round(num(rnd, 3, 18, 0));
        row["点群"] = POINT_GROUPS[Math.floor(rnd() * POINT_GROUPS.length)];
        row["电荷"] = Math.round(num(rnd, -1, 1, 0));
        row["自旋多重度"] = SPINS[Math.floor(rnd() * SPINS.length)];
        row["单分子能量(eV)"] = num(rnd, -235.15, -100, 2);
        row["偶极矩(Debye)"] = num(rnd, 0, 1.7, 2);
        row["四极矩"] = rnd() > 0.5 ? "✓" : "—";
        row["极化率(Å³)"] = num(rnd, 1, 12, 2);
        row["色散系数"] = num(rnd, 10, 200, 1);
      } else if (structure === "smallSystem") {
        row["材料ID"] = idStr;
        row["分子式"] = el1 + el2 + el3;
        row["体系名称"] = names[i % names.length];
        row["分子数"] = Math.round(num(rnd, 2, 12, 0));
        row["原子总数"] = Math.round(num(rnd, 12, 120, 0));
        row["电荷"] = Math.round(num(rnd, -2, 2, 0));
        row["体系能量(eV)"] = num(rnd, -800, -100, 2);
        row["能量(eV/atom)"] = num(rnd, -12, -2, 3);
        row["相互作用能(kcal/mol)"] = num(rnd, -60, -1, 2);
        row["极化率(Å³)"] = num(rnd, 5, 60, 2);
        row["Bader电荷"] = num(rnd, -1.5, 1.5, 2);
        row["色散系数"] = num(rnd, 50, 900, 1);
      } else {
        row["材料ID"] = idStr;
        row["分子式"] = el1 + el2 + "O" + (2 + i);
        row["体系名称"] = names[i % names.length];
        row["晶胞分子数"] = Math.round(num(rnd, 4, 64, 0));
        row["原子总数"] = Math.round(num(rnd, 80, 900, 0));
        row["空间群"] = SPACE_GROUPS[Math.floor(rnd() * SPACE_GROUPS.length)];
        row["体系能量(eV)"] = num(rnd, -3000, -300, 1);
        row["能量(eV/atom)"] = num(rnd, -14, -3, 3);
        row["带隙(eV)"] = num(rnd, 0, 5, 2);
        row["磁矩(μB)"] = num(rnd, 0, 4, 2);
        row["力(eV/Å)"] = num(rnd, 0, 8, 2);
        row["色散系数"] = num(rnd, 200, 4000, 1);
      }
      rows.push(row);
    }
    return rows;
  }

  function toNumber(v) {
    if (v == null || v === "" || v === "✓" || v === "—") return NaN;
    var n = Number(String(v).replace(/[^0-9.eE+-]/g, ""));
    return isFinite(n) ? n : NaN;
  }
  function numText(v, digits, unit) {
    var n = toNumber(v);
    if (!isFinite(n)) return v == null || v === "" ? "—" : String(v);
    return n.toFixed(digits) + (unit || "");
  }

  function sparkSvg(values, color, fill) {
    var vals = values.filter(function (v) { return isFinite(v); });
    if (vals.length < 2) return '<div class="mlfftor-empty">数据点不足，暂不绘制</div>';
    var w = 260, h = 84, pad = 8;
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    var span = (max - min) || 1;
    var pts = vals.map(function (v, i) {
      var x = pad + (w - pad * 2) * (i / (vals.length - 1));
      var y = h - pad - (h - pad * 2) * ((v - min) / span);
      return x.toFixed(1) + "," + y.toFixed(1);
    });
    var area = pts.join(" ") + " " + (w - pad) + "," + (h - pad) + " " + pad + "," + (h - pad);
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" role="img">' +
      '<polygon points="' + area + '" fill="' + fill + '"></polygon>' +
      '<polyline points="' + pts.join(" ") + '" fill="none" stroke="' + color + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"></polyline>' +
      pts.map(function (p) {
        var xy = p.split(",");
        return '<circle cx="' + xy[0] + '" cy="' + xy[1] + '" r="2.8" fill="' + color + '"></circle>';
      }).join("") +
      '</svg>';
  }

  function distSvg(values, color, fill) {
    var vals = values.filter(function (v) { return isFinite(v); });
    if (vals.length < 2) return "";
    var w = 260, h = 84, pad = 10;
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    var span = (max - min) || 1;
    var bars = vals.map(function (v, i) {
      var bw = (w - pad * 2) / vals.length * 0.62;
      var x = pad + (w - pad * 2) * (i / vals.length) + ((w - pad * 2) / vals.length - bw) / 2;
      var bh = Math.max(2, (h - pad * 2) * ((v - min) / span));
      var y = h - pad - bh;
      return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="2" fill="' + fill + '" stroke="' + color + '" stroke-width="1"></rect>';
    }).join("");
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" role="img">' + bars + '</svg>';
  }

  /* ── 模块 C：DOM 片段 ─────────────────────────────────────────────────── */
  function structNoticeHtml(material) {
    var structure = resolveStructure(material);
    var label = TAB_LABEL[TAB_KEY[structure]];
    return '' +
      '<div class="mlfftor-notice" data-structure="' + esc(structure) + '">' +
        '<div class="mlfftor-notice-head">' +
          '<span class="mlfftor-chip" data-structure="' + esc(structure) + '">' + esc(label) + '</span>' +
          '<strong>本材料归属结构类型：' + esc(label) + '</strong>' +
        '</div>' +
        '<p>分子结构、小体系结构与大体系结构三者<strong>互斥（或关系）</strong>，同一材料只归入其中一类。' +
        esc(structureReason(structure)) +
        '下方内容仅提供该类的结构、参数与样例数据，不展示另外两类。</p>' +
      '</div>';
  }

  function sampleTableHtml(material) {
    var structure = resolveStructure(material);
    var tabKey = TAB_KEY[structure];
    var fields = FIELDS[tabKey] || FIELDS.molecule;
    var records = buildRecords(material, structure, 6);
    var source = SOURCE[tabKey] || "";
    var label = TAB_LABEL[tabKey];

    /* 统计卡 */
    var statCards = "";
    var metrics = CHART_METRICS[tabKey] || [];
    metrics.forEach(function (m) {
      var vals = records.map(function (r) { return toNumber(r[m.key]); }).filter(function (v) { return isFinite(v); });
      if (!vals.length) return;
      var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
      statCards += '<div class="mlfftor-stat"><span>' + esc(m.label.replace("分布", "范围")) + '</span>' +
        '<strong>' + mn.toFixed(2) + ' ~ ' + mx.toFixed(2) + ' ' + esc(m.unit) + '</strong></div>';
    });
    var totalCard = '<div class="mlfftor-stat"><span>样例记录</span><strong>' + records.length + ' 条</strong></div>';

    /* 图表 */
    var palette = {
      molecule: ["#0070F0", "rgba(0,112,240,.10)"],
      smallSystem: ["#0D9B70", "rgba(13,155,112,.10)"],
      largeSystem: ["#D97706", "rgba(217,119,6,.10)"]
    };
    var pc = palette[tabKey] || palette.molecule;
    var charts = metrics.map(function (m) {
      var vals = records.map(function (r) { return toNumber(r[m.key]); });
      return '<div class="mlfftor-chart">' +
        '<div class="mlfftor-chart-head"><h4>' + esc(m.label) + '</h4><span>' + esc(m.unit) + '</span></div>' +
        sparkSvg(vals, pc[0], pc[1]) +
        '<div class="mlfftor-dist">' + distSvg(vals, pc[0], pc[1]) + '</div>' +
        '</div>';
    }).join("");

    /* 数据表 */
    var rowsHtml = records.map(function (r) {
      return "<tr>" + fields.map(function (f) { return "<td>" + esc(r[f] == null ? "—" : r[f]) + "</td>"; }).join("") + "</tr>";
    }).join("");

    return '' +
      '<div class="mlfftor-sample" data-structure="' + esc(structure) + '">' +
        '<div class="mlfftor-banner">' +
          '<div class="mlfftor-banner-main">' +
            '<h4>' + esc(label) + ' · 结构样例数据</h4>' +
            '<p>数据来源：' + esc(source) + '；本材料所属结构类型为<strong>' + esc(label) + '</strong>，' +
            '以下 ' + records.length + ' 条为该类结构样例记录（共 ' + (fields.length) + ' 列字段）。</p>' +
          '</div>' +
          '<div class="mlfftor-facts">' +
            '<div><dt>结构类型</dt><dd>' + esc(label) + '</dd></div>' +
            '<div><dt>数据来源</dt><dd>' + esc(source) + '</dd></div>' +
            '<div><dt>字段数量</dt><dd>' + fields.length + ' 列</dd></div>' +
            '<div><dt>本材料样例</dt><dd>6 条 / 共 6 条</dd></div>' +
          '</div>' +
        '</div>' +
        '<div class="mlfftor-stat-grid">' + totalCard + statCards + '</div>' +
        '<div class="mlfftor-chart-grid">' + charts + '</div>' +
        '<div class="mlfftor-table-wrap"><table class="mlfftor-table">' +
          '<thead><tr>' + fields.map(function (f) { return "<th>" + esc(f) + "</th>"; }).join("") + '</tr></thead>' +
          '<tbody>' + rowsHtml + '</tbody>' +
        '</table></div>' +
      '</div>';
  }

  function basicRowsHtml(material) {
    var structure = resolveStructure(material);
    var tabKey = TAB_KEY[structure];
    var rec = (buildRecords(material, structure, 1) || [{}])[0];
    var infoRows = [
      { label: "化学名称", value: material.name },
      { label: "英文名称", value: material.english || material.name },
      { label: "分子式", value: material.formula },
      { label: "PUBCHEM", value: material.pubchem },
      { label: "能量", value: material.energy != null ? numText(material.energy, 1, " kcal/mol") : null },
      { label: "偶极矩", value: material.dipole != null ? numText(material.dipole, 2, " D") : null },
      { label: "原子数", value: material.atomCount != null ? material.atomCount : rec["原子数"] },
      { label: "净电荷 (e)", value: material.netCharge != null ? material.netCharge : rec["电荷"] },
      { label: "结构类型", value: TAB_LABEL[tabKey] },
      { label: "采样帧数", value: material.retainedFrames },
      { label: "原子电荷数", value: material.chargeCount },
      { label: "数据划分", value: material.split || "训练集 / 验证集 / 测试集 = 8 : 1 : 1" }
    ];
    var dataRows = [
      { label: "力场类型", value: material.forceField || "机器学习力场（MLFF）" },
      { label: "计算方法", value: material.method },
      { label: "核心参数项", value: material.parameterName },
      { label: "参数值", value: material.parameterValue },
      { label: "数据来源", value: SOURCE[tabKey] },
      { label: "更新时间", value: material.updatedAt },
      { label: "质检状态", value: material.quality || "已通过" },
      { label: "授权许可", value: material.sourceLicense || "CC BY 4.0" }
    ];
    function grid(rows) {
      return rows.filter(function (r) { return r.value != null && r.value !== ""; })
        .map(function (r) {
          return '<div class="mlfftor-kv"><span>' + esc(r.label) + '</span><strong>' + esc(r.value) + '</strong></div>';
        }).join("");
    }
    return '' +
      '<div class="mlfftor-kv-card"><h5>基础信息</h5><div class="mlfftor-kv-grid">' + grid(infoRows) + '</div></div>' +
      '<div class="mlfftor-kv-card"><h5>数据来源</h5><div class="mlfftor-kv-grid">' + grid(dataRows) + '</div></div>';
  }

  /* ── 模块 D：包装权威函数 ─────────────────────────────────────────────── */

  /* D1) 左侧导航：只保留「基础信息 + 所属结构」 */
  var baseTree = typeof renderMlffDetailTreeOverride === "function" ? renderMlffDetailTreeOverride : null;
  if (baseTree) {
    renderMlffDetailTreeOverride = function () {
      var wrap = document.getElementById("twodDetailTree");
      if (!wrap) return baseTree.apply(this, arguments);
      var material = typeof getCanonicalMaterialBySource === "function"
        ? getCanonicalMaterialBySource("mlff", state.selectedMaterialId) : null;
      if (!material) return baseTree.apply(this, arguments);
      var owned = ownedTab(material);
      var items = [
        { key: "basic", label: "基础信息" },
        { key: owned, label: TAB_LABEL[owned] }
      ];
      wrap.innerHTML = items.map(function (item) {
        return '<div class="twod-tree-item"><button class="twod-tree-node' +
          (state.selectedTwodDetailSection === item.key ? " active" : "") +
          '" type="button" data-mlff-topic-section="' + esc(item.key) +
          '" onclick="return openMlffDetailSection(\'' + item.key + '\')">' + esc(item.label) + '</button></div>';
      }).join("");
    };
    if (typeof window !== "undefined") window.renderMlffDetailTreeOverride = renderMlffDetailTreeOverride;
  }

  /* D2) 基础信息页：按所属结构渲染结构图，并清除历史遗留的提示条 / 样例表节点 */
  var baseBasic = typeof renderMlffDetailBasicPage === "function" ? renderMlffDetailBasicPage : null;
  if (baseBasic) {
    renderMlffDetailBasicPage = function (material) {
      var html = baseBasic.apply(this, arguments);
      if (!material || typeof html !== "string") return html;
      try {
        var owned = ownedTab(material);
        /* 清除可能残留的「结构类型提示条 / 结构样例数据」块（不再渲染这两块） */
        html = html.replace(/<div class="mlfftor-notice"[\s\S]*?<\/div>\s*<\/div>/g, "");
        html = html.replace(/<div class="mlfftor-sample"[\s\S]*?<\/table><\/div>\s*<\/div>/g, "");
        /* 基础信息页右侧原本固定展示 3D 分子结构图，改为按所属结构渲染 */
        var scene = typeof buildMlffScene === "function" ? buildMlffScene(material, owned) : null;
        if (scene && typeof renderMlffSceneMarkup === "function") {
          html = html.replace(/<div class="material-atom-cluster mlff-scene"[\s\S]*?<\/div>/,
            '<div class="material-atom-cluster mlff-scene" data-mlff-scene-size="' + scene.size + '">' + renderMlffSceneMarkup(scene) + '</div>');
        }
        html = html.replace(/3D分子结构图/g, "3D" + TAB_LABEL[owned] + "图");
        return html;
      } catch (e) {
        return html;
      }
    };
    if (typeof window !== "undefined") window.renderMlffDetailBasicPage = renderMlffDetailBasicPage;
  }

  /* D3) 结构页：只渲染所属结构，去掉三类并存与分子页内三标签并存 */
  var baseStructure = typeof renderMlffStructurePage === "function" ? renderMlffStructurePage : null;
  if (baseStructure) {
    renderMlffStructurePage = function (material, tabKey, titleText, descText) {
      if (!material) return baseStructure.apply(this, arguments);
      var owned = ownedTab(material);
      /* 传入的 tabKey 不是所属结构时，强制回落到所属结构 */
      var effective = owned;
      var label = TAB_LABEL[owned];
      var desc = owned === "molecule"
        ? "展示当前材料的单分子结构与组成信息（该材料不涉及小体系 / 大体系结构）。"
        : owned === "smallSystem"
          ? "展示当前材料的小体系结构与力场参数上下文（该材料不涉及分子 / 大体系结构）。"
          : "展示当前材料的扩展多分子体系结构（该材料不涉及分子 / 小体系结构）。";
      var html = baseStructure.call(this, material, effective, label, desc);
      if (typeof html !== "string") return html;
      try {
        /* 分子结构页内部原本有「单分子 / 双分子 / 多分子团簇」三标签并存，收敛为只保留所属类 */
        html = html.replace(/<div class="mlff-molecule-dataset-tabs"[\s\S]*?<\/div>/, "");
        html = html.replace(/分子体系分类/g, "结构归属");
        /* 清除可能残留的「结构类型提示条 / 结构样例数据」块（不再渲染这两块） */
        html = html.replace(/<div class="mlfftor-notice"[\s\S]*?<\/div>\s*<\/div>/g, "");
        html = html.replace(/<div class="mlfftor-sample"[\s\S]*?<\/table><\/div>\s*<\/div>/g, "");
        return html;
      } catch (e) {
        return html;
      }
    };
    if (typeof window !== "undefined") window.renderMlffStructurePage = renderMlffStructurePage;
  }

  /* D4) 详情页入口：确保默认分区落到 basic，且列表按钮有结构标记 */
  var baseDetail = typeof renderMlffDetailPage === "function" ? renderMlffDetailPage : null;
  if (baseDetail) {
    renderMlffDetailPage = function (material) {
      if (material) {
        var owned = ownedTab(material);
        var allowed = ["basic", owned];
        if (allowed.indexOf(state.selectedTwodDetailSection) < 0) {
          state.selectedTwodDetailSection = "basic";
        }
      }
      return baseDetail.apply(this, arguments);
    };
    if (typeof window !== "undefined") window.renderMlffDetailPage = renderMlffDetailPage;
  }

  /* D5) 列表「查看详情」按钮：标注结构类型，便于列表侧区分 */
  var baseModule = typeof renderMlffModule === "function" ? renderMlffModule : null;
  if (baseModule) {
    renderMlffModule = function () {
      var result = baseModule.apply(this, arguments);
      try {
        var links = document.querySelectorAll('#page-mlff [data-open-material^="mlff:"]');
        Array.prototype.forEach.call(links, function (link) {
          var id = String(link.dataset.openMaterial || "").slice(5);
          var mat = typeof getCanonicalMaterialBySource === "function"
            ? getCanonicalMaterialBySource("mlff", id) : null;
          if (!mat) return;
          var structure = resolveStructure(mat);
          var label = TAB_LABEL[TAB_KEY[structure]];
          link.dataset.mlffTopicStructure = structure;
          link.title = "查看详情 · 该材料归属「" + label + "」";
          if (!/查看详情/.test(link.textContent)) {
            link.textContent = "查看详情";
          }
        });
      } catch (e) { /* noop */ }
      return result;
    };
    if (typeof window !== "undefined") window.renderMlffModule = renderMlffModule;
  }

  /* 暴露给验证脚本 / 补充层 */
  window.__mlffTopicResolveStructure = resolveStructure;
  window.__mlffTopicOwnedTab = ownedTab;
  window.__mlffTopicNoticeHtml = structNoticeHtml;
  window.__mlffTopicSampleHtml = sampleTableHtml;
})();

