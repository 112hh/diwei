/* ================================================================
   66-property-type-hint.js
   低维材料主题应用 · 性质检索「性质类别 / 性质类型」字段说明（ⓘ）

   行为：字段标签旁注入 ⓘ 图标 → hover 展示说明浮层，点击可钉住（再点/点外部收起）
   覆盖：twod / electrolyte / opto / mlff / catalyst 的性质检索面板

   实现说明：沿用 65 的 DOM 驱动思路（本项目渲染入口被多层闭包包裹，
   直接改模板容易失效），这里观察 DOM → 找到性质类别/类型下拉 → 在其标签旁注入图标，
   说明文案在展开时**按该下拉框当前真实选项**生成，选项变了文案自动跟着变。
   ================================================================ */
(() => {
  if (window.__LOWDIM_PROP_HINT__) return;
  window.__LOWDIM_PROP_HINT__ = true;

  const esc = (v) => String(v ?? "");
  const LETTERS = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"];

  /* ---------------- 文案 ---------------- */
  const TITLE = "什么是性质类型？";
  const INTRO = "性质类型不是表格中的某一列，而是数据的类别。选择后，检索范围和结果列会随之变化，根据相关要求输入内容进行检索。";
  const SUB = "性质类型介绍例如：";
  const TAIL = "默认不选 = 检索全部类型。";

  /* 各库「性质检索」能力说明：电解质按三类细分电解质分别给文案 */
  const MODULE_NAME = {
    twod: "二维材料性质检索",
    "electrolyte:organicLiquid": "有机电解液性质检索",
    "electrolyte:solidOrganic": "固态有机电解质性质检索",
    "electrolyte:solidInorganic": "固态无机电解质性质检索",
    opto: "有机光电材料性质检索",
    mlff: "机器学习力场性质检索",
    catalyst: "催化材料性质检索"
  };
  const MODULE_INTRO = {
    twod: "支持检索材料的结构、电子、电学、磁学、热学、力学、光学、缺陷 8 大类性质数据，可按大类或具体性质筛选，也可组合检索。",
    "electrolyte:organicLiquid": "支持检索目标分子的基础信息、三维结构、基础物性、安全信息、图谱及计算数据，并支持相似分子推荐；缺失数据以 “/” 表示，只能选择任意性质后进行检索不支持组合检索。",
    "electrolyte:solidOrganic": "支持检索目标高分子的基础信息、单体信息、物性数据（摩尔体积、密度、玻璃化转变温度、电导率、机械性能）及计算数据（摩尔热容、结合能），并支持推荐溶解溶剂；缺失数据以 “/” 表示，只能选择任意性质后进行检索不支持组合检索。",
    "electrolyte:solidInorganic": "支持检索目标无机电解质的基础信息（晶胞参数、晶系、可下载结构文件）、图谱信息（能带结构、态密度、X 射线衍射 / 吸收谱图）及计算信息（形成能、费米能级、带隙），并支持搜索关联同元素组成的不同结构材料及结构参考文献。",
    opto: "支持检索特征信息（三维结构、表征图谱、特征参数、态密度、外部数据关联）可从任意检索结果页面通过 “检索” 按钮检索相关信息，点击查看详情跳转至相应性质界面；各界面均提供分子基本信息，三维结构与谱图支持下载，并支持跳转外部数据库获取原始来源与拓展信息。",
    mlff: "支持检索电荷、多极矩、分子结构、小体系结构、大体系结构相关字段信息，可在查看详情界面查看高阶性质，同时提供分子结构、团簇 / 大体系展示及 PDB 拓扑文件下载。",
    catalyst: "支持检索催化材料元素组成、结构 / 体系特征、晶格参数、原子结构、电子性质及催化性能、成分、表面参数、中间产物等字段进行检索。"
  };

  /* 说明按模块分区，避免不同库同名类别（如 twod 与 catalyst 都有「结构特征」）串文案 */
  const DESC = {
    /* ---------- 电解质（三条沿用产品给定文案） ---------- */
    electrolyte: {
    "基础信息": "用户可在线预览电解质材料基础信息以及其三维结构。",
    "图谱信息": "用户可在线预览数据库提供的图谱信息，表征谱图如气相红外光谱、拉曼光谱和核磁共振光谱将以可下载的图片格式置于界面中。",
    "计算信息": "用户可在线预览数据库提供的计算信息包括HOMO-LUMO能量、电荷分布、偶极矩、生成焓、生成吉布斯自由能、结合能和溶剂化自由能等在内的计算数据。",
    "物性信息": "用户可在线预览熔点、沸点、密度、电导率与机械性能等物性数据。",
    "溶解溶剂推荐": "系统根据材料特性推荐适配的溶解溶剂，辅助配方与体系筛选。",
    "相似分子推荐": "系统按结构相似度推荐相近分子，便于横向对比物性与计算数据。",
    "相关体系推荐": "系统推荐同体系或相近体系材料，便于扩展检索范围。",
    "外部数据关联": "汇总论文检索系统与外部数据库的关联记录，支持跳转查看原始来源。"
    },
    /* ---------- 二维材料（沿用各性质类别在系统内的官方描述） ---------- */
    twod: {
      "结构特征": "选择后展示二维材料的结构与晶体学相关性质字段。",
      "电子结构": "选择后展示二维材料的电子结构图谱与质量参数。",
      "电学性质": "选择后展示二维材料的铁电与压电性质字段。",
      "磁学性质": "选择后展示二维材料的磁基态与磁转变相关字段。",
      "热学性质": "选择后展示二维材料的形成能、声子谱及声子态密度字段。",
      "力学性质": "选择后展示二维材料的弹性与形变相关字段。",
      "光学性质": "选择后展示二维材料的介电、吸收、反射与折射相关图谱字段。",
      "缺陷性质": "选择后展示二维材料的缺陷形成能与缺陷结构字段。"
    },
    /* ---------- 有机光电 ---------- */
    opto: {
      "有机分子三维结构": "用户可在线预览有机分子三维结构，并下载对应的结构文件。",
      "有机光电材料表征图谱": "用户可在线预览紫外、荧光、红外、拉曼与核磁等谱图，谱图以可下载的图片格式置于界面中。",
      "有机光电材料特征参数": "用户可在线预览物性数据与量子化学计算数据，包括HOMO/LUMO能级、激发能与溶剂化自由能等。",
      "态密度信息": "用户可在线预览态密度图及相关电子结构数据。",
      "外部数据关联": "汇总论文检索系统与外部化学数据库的关联记录，支持跳转查看。"
    },
    /* ---------- 机器学习力场 ---------- */
    mlff: {
      "电荷": "按原子电荷与电荷组（如 RESP charge set）等字段检索力场数据。",
      "多级矩": "按偶极矩、四极矩等多极矩参数检索力场数据。",
      "分子结构": "按键长、键角等分子结构描述检索对应的力场样本。",
      "小体系结构": "按小体系（如水、氨等）结构与相互作用参数检索。",
      "大体系结构": "按大体系（如团簇、周期性体系）结构与相互作用参数检索。"
    },
    /* ---------- 催化 ---------- */
    catalyst: {
      "中间产物": "按催化反应中间产物名称或组成检索相关材料。",
      "催化材料种类": "按催化材料所属种类检索，缩小候选材料范围。",
      "材料成分": "按材料元素组成或化学式成分检索。",
      "表面参数": "按表面晶面、表面能等表面参数检索。",
      "活性位点": "按活性位点类型与配位环境检索。",
      "结构特征": "按形貌结构、空间群等结构特征检索。",
      "体系特征": "按费米能级、掺杂形成能、磁矩等体系特征检索。",
      "晶格参数": "按晶胞参数与晶格常数等结构参数检索。",
      "原子结构": "按原子位置坐标与局域结构检索。",
      "电子性质": "按带隙、态密度等电子性质检索。",
      "催化性能": "按活化能、反应路径与催化性能指标检索。"
    }
  };
  const FALLBACK_DESC = "选择该类型后，按对应字段输入内容进行检索。";

  /* ---------------- 锚点规则 ---------------- */
  const RULES = [
    { sel: "#propertyCategorySelect", label: "性质类别" },
    { sel: "[data-prop-panel-category]", label: "性质类别" },
    { sel: "[data-solid-organic-prop-type]", label: "性质类型" },
    { sel: 'select[aria-label="性质类型"]', label: "性质类型" },
    { sel: "#mlffPropertyField", label: "性质数据" },
    { sel: "#catalystPropertyFieldPlatform", label: "性质项" }
  ];
  const THEME_SELECTOR = "#page-twod, #page-electrolyte, #page-opto, #page-mlff, #page-catalyst";

  function isInThemePage(el) {
    const host = el.closest ? el.closest(THEME_SELECTOR) : null;
    if (host) return true;
    /* 电解质性质面板挂在 electrolyteModeWorkspace 下，兜底放行 */
    return !!(el.closest && el.closest("#electrolyteModeWorkspace"));
  }

  function findLabel(el, fallbackText) {
    /* 只在当前页面容器内找，避免单体应用里同名 id（如 propertyCategorySelect）串页 */
    const host = (el.closest && (el.closest(THEME_SELECTOR) || el.closest("#electrolyteModeWorkspace")))
      || (el.parentElement && el.parentElement.parentElement) || null;
    if (!host) return null;
    /* 1) label[for=id] */
    if (el.id) {
      const l = host.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (l) return l;
    }
    /* 2) 同一字段容器内文案匹配“性质类别/类型/数据/项”的 label / span */
    const scope = el.parentElement || host;
    const nodes = scope.querySelectorAll("label, span");
    for (const n of nodes) {
      const txt = (n.textContent || "").trim();
      if (/^性质(类别|类型|数据|项)$/.test(txt) || (fallbackText && txt === fallbackText)) return n;
    }
    return null;
  }

  /* ---------------- 浮层 ---------------- */
  let pop = null;
  let pinnedFor = null;

  function buildPop() {
    pop = document.createElement("div");
    pop.className = "prop-hint-pop";
    pop.setAttribute("role", "tooltip");
    pop.hidden = true;
    document.body.appendChild(pop);
    return pop;
  }

  function optionList(select) {
    if (!select || !select.options) return [];
    const seen = new Set();
    const list = [];
    [...select.options].forEach((o) => {
      const t = (o.textContent || "").trim();
      if (!t || /^请选择|全部|不限/.test(t) || seen.has(t)) return;
      seen.add(t);
      list.push(t);
    });
    return list.slice(0, 12);
  }

  /* ---------------- 模块识别（电解质需细分到三类） ---------------- */
  /* state 被闭包包裹，取不到；改从 DOM 上「当前激活的电解质类别卡片」推断 */
  /* 类别切换控件有两种皮肤（.electrolyte-category-card / .module-tab-btn），
     统一按「带 active 的 [data-ely-category]」识别，避免依赖具体 class */
  function pickActive(nodes) {
    for (const n of nodes) {
      const cls = n.classList;
      if (cls && (cls.contains("active") || cls.contains("is-active") || cls.contains("current"))) {
        if (n.dataset && n.dataset.elyCategory) return n.dataset.elyCategory;
      }
      if (n.getAttribute && n.getAttribute("aria-selected") === "true" && n.dataset && n.dataset.elyCategory) {
        return n.dataset.elyCategory;
      }
    }
    return "";
  }

  function currentElyCategory(host) {
    try {
      if (window.state && window.state.electrolyteCategory) return String(window.state.electrolyteCategory);
    } catch (e) { /* 忽略跨源读取异常 */ }
    let cat = "";
    if (host && host.querySelectorAll) cat = pickActive(host.querySelectorAll("[data-ely-category]"));
    if (!cat) cat = pickActive(document.querySelectorAll("[data-ely-category]"));
    return cat;
  }

  function moduleKeyOf(select) {
    const host = select && select.closest
      ? (select.closest(THEME_SELECTOR) || select.closest("#electrolyteModeWorkspace")) : null;
    let base = host ? String(host.id || "").replace("page-", "") : "";
    if (!base) base = "electrolyte";
    if (base !== "electrolyte") return base;
    const cat = currentElyCategory(host);
    if (cat) return "electrolyte:" + cat;
    /* 再兜底：按当前下拉里的选项前缀反推（如「固态无机…」） */
    const joined = optionList(select).join("|");
    if (/固态有机/.test(joined)) return "electrolyte:solidOrganic";
    if (/固态无机/.test(joined)) return "electrolyte:solidInorganic";
    return "electrolyte:organicLiquid";
  }

  /* 模块能力文案；未知细分电解质回落到有机电解液 */
  function moduleText(key) {
    if (MODULE_NAME[key]) return { name: MODULE_NAME[key], intro: MODULE_INTRO[key] || "" };
    if (String(key).indexOf("electrolyte:") === 0) {
      const k = "electrolyte:organicLiquid";
      return { name: MODULE_NAME[k], intro: MODULE_INTRO[k] || "" };
    }
    return null;
  }

  /* 选项名带材料类别前缀（如「有机电解液基础信息」），说明文案按去前缀后的名称匹配 */
  function descOf(pageId, label) {
    const bare = String(pageId).split(":")[0];
    const pool = DESC[pageId] || DESC[bare] || {};
    if (pool[label]) return pool[label];
    const normalized = String(label).replace(/^(有机电解液|固态有机电解质|固态无机电解质)/, "").trim();
    if (pool[normalized]) return pool[normalized];
    if (DESC.electrolyte && DESC.electrolyte[normalized]) return DESC.electrolyte[normalized];
    return FALLBACK_DESC;
  }

  function renderPopContent(labels, moduleKey) {
    pop.textContent = "";

    /* ① 本库性质检索能力（模块级） */
    const mod = moduleText(moduleKey);
    if (mod) {
      const block = document.createElement("div");
      block.className = "prop-hint-module";
      const mh = document.createElement("h5");
      mh.textContent = mod.name;
      block.appendChild(mh);
      const mp = document.createElement("p");
      mp.textContent = mod.intro;
      block.appendChild(mp);
      pop.appendChild(block);
    }

    /* ② 字段级：什么是性质类型？ */
    const body = document.createElement("div");
    body.className = "prop-hint-body";
    const h = document.createElement("h5");
    h.textContent = TITLE;
    body.appendChild(h);

    const p = document.createElement("p");
    p.textContent = INTRO;
    body.appendChild(p);

    const sub = document.createElement("p");
    sub.className = "prop-hint-sub";
    sub.textContent = SUB;
    body.appendChild(sub);

    const list = document.createElement("ol");
    labels.forEach((label, i) => {
      const li = document.createElement("li");
      const strong = document.createElement("strong");
      strong.textContent = `（${LETTERS[i] || i + 1}）${label}`;
      li.appendChild(strong);
      const span = document.createElement("span");
      span.textContent = descOf(moduleKey, label);
      li.appendChild(span);
      list.appendChild(li);
    });
    body.appendChild(list);

    const tail = document.createElement("p");
    tail.className = "prop-hint-tail";
    tail.textContent = TAIL;
    body.appendChild(tail);

    pop.appendChild(body);
  }

  function placePop(icon) {
    const r = icon.getBoundingClientRect();
    const pw = pop.offsetWidth || 340;
    const ph = pop.offsetHeight || 220;
    let left = r.right + 8;
    let top = r.top - 8;
    if (left + pw > window.innerWidth - 12) left = Math.max(12, r.left - pw - 8);
    if (top + ph > window.innerHeight - 12) top = Math.max(12, window.innerHeight - ph - 12);
    if (top < 12) top = 12;
    pop.style.left = left + "px";
    pop.style.top = top + "px";
  }

  function showPop(icon) {
    if (!pop) buildPop();
    const select = icon.__propSelect || null;
    /* 每次展示都重新取选项与模块键：切了电解质类别 / 下拉被重绘，文案跟着变 */
    const fresh = optionList(select);
    const labels = fresh.length ? fresh : (icon.__propLabels || []);
    icon.__propLabels = labels;
    const moduleKey = moduleKeyOf(select) || icon.__propPageId || "";
    icon.__propPageId = moduleKey;
    renderPopContent(labels, moduleKey);
    pop.hidden = false;
    pop.classList.add("is-open");
    placePop(icon);
  }

  function hidePop() {
    if (!pop) return;
    pop.classList.remove("is-open");
    pop.hidden = true;
  }

  document.addEventListener("click", (event) => {
    const icon = event.target.closest ? event.target.closest(".prop-hint-icon") : null;
    if (icon) {
      event.preventDefault();
      event.stopPropagation();
      if (pinnedFor === icon && !pop.hidden) {
        pinnedFor = null;
        hidePop();
      } else {
        pinnedFor = icon;
        showPop(icon);
      }
      return;
    }
    if (pinnedFor && pop && !pop.hidden) {
      if (!pop.contains(event.target)) { pinnedFor = null; hidePop(); }
    }
  });

  document.addEventListener("mouseover", (event) => {
    const icon = event.target.closest ? event.target.closest(".prop-hint-icon") : null;
    if (!icon || pinnedFor) return;
    if (pop && !pop.hidden && pop.__for === icon) return;
    pop && (pop.__for = icon);
    showPop(icon);
  });

  document.addEventListener("mouseout", (event) => {
    const icon = event.target.closest ? event.target.closest(".prop-hint-icon") : null;
    if (!icon || pinnedFor) return;
    const to = event.relatedTarget;
    if (to && (icon.contains(to) || (pop && pop.contains(to)))) return;
    hidePop();
  });

  window.addEventListener("scroll", () => { if (!pinnedFor && pop && !pop.hidden) hidePop(); }, true);
  window.addEventListener("resize", () => { if (pop && !pop.hidden) hidePop(); });

  /* ---------------- 注入 ⓘ ---------------- */
  const ICON_SVG = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">' +
    '<circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/>' +
    '<text x="8" y="11.6" text-anchor="middle" font-size="8.5" font-family="Arial, sans-serif" fill="currentColor">i</text></svg>';

  function attachHint(node, ruleLabel) {
    if (!isInThemePage(node)) return;
    const select = node.tagName === "SELECT" ? node : node.querySelector("select");
    if (!select) return;
    /* 图标一律锚在下拉框本身旁边（容器类锚点不要插到整块面板之后） */
    const anchorHost = select.parentElement || select;
    if (anchorHost.querySelector(".prop-hint-icon")) return;
    if (select.nextElementSibling && select.nextElementSibling.classList.contains("prop-hint-icon")) return;

    const icon = document.createElement("button");
    icon.type = "button";
    icon.className = "prop-hint-icon";
    icon.title = "查看性质检索说明";
    icon.setAttribute("aria-label", "查看" + (ruleLabel || "性质类型") + "说明");
    icon.innerHTML = ICON_SVG;
    icon.__propSelect = select;
    icon.__propLabels = optionList(select);
    icon.__propPageId = moduleKeyOf(select);

    const label = findLabel(select, ruleLabel);
    if (label && label.parentElement && label.parentElement === anchorHost) {
      label.insertAdjacentElement("afterend", icon);
    } else {
      select.insertAdjacentElement("afterend", icon);
    }
  }

  function ensureHints() {
    RULES.forEach((rule) => {
      document.querySelectorAll(rule.sel).forEach((el) => {
        try { attachHint(el, rule.label); } catch (e) { /* 忽略单个锚点异常 */ }
      });
    });
    /* 兜底：主题页内任何“性质类别/类型/数据/项”标签 + 相邻下拉 */
    document.querySelectorAll(THEME_SELECTOR + " label, " + THEME_SELECTOR + " span").forEach((el) => {
      const txt = (el.textContent || "").trim();
      if (!/^性质(类别|类型|数据|项)$/.test(txt)) return;
      if (el.parentElement && el.parentElement.querySelector(".prop-hint-icon")) return;
      const field = el.parentElement || el;
      const sel = field.querySelector("select");
      if (!sel) return;
      try { attachHint(sel, txt); } catch (e) {}
    });
  }

  let timer = null;
  const mo = new MutationObserver(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { try { ensureHints(); } catch (e) {} }, 200);
  });
  const start = () => mo.observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "complete") { start(); setTimeout(ensureHints, 800); }
  else window.addEventListener("load", () => { start(); setTimeout(ensureHints, 800); });

  /* ---------------- 样式 ---------------- */
  const style = document.createElement("style");
  style.id = "lowdim-property-type-hint-style";
  style.textContent = `
    .prop-hint-icon { display: inline-flex; align-items: center; justify-content: center;
      width: 18px; height: 18px; margin-left: 5px; padding: 0; border: 0; background: none;
      color: #94a5bd; cursor: help; vertical-align: middle; border-radius: 50%; line-height: 1; }
    .prop-hint-icon:hover, .prop-hint-icon:focus-visible { color: #165DFF; background: #eef3ff; outline: none; }
    .prop-hint-icon svg { display: block; }
    .prop-hint-pop { position: fixed; z-index: 9999; width: 360px; max-width: calc(100vw - 24px);
      padding: 14px 16px; background: #fff; border: 1px solid #dbe4f0; border-radius: 10px;
      box-shadow: 0 12px 32px rgba(15, 42, 86, 0.16); color: #22395c; font-size: 13px;
      line-height: 20px; text-align: left; max-height: 68vh; overflow-y: auto; }
    .prop-hint-pop h5 { margin: 0 0 6px; font-size: 13px; font-weight: 600; color: #165DFF; }
    .prop-hint-pop p { margin: 0 0 8px; color: #4a5b76; }
    .prop-hint-pop .prop-hint-module { padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px solid #e2e8f2; }
    .prop-hint-pop .prop-hint-module h5 { font-size: 13.5px; }
    .prop-hint-pop .prop-hint-module p { margin: 0; }
    .prop-hint-pop .prop-hint-sub { margin: 10px 0 6px; color: #22395c; font-weight: 600; }
    .prop-hint-pop ol { margin: 0; padding-left: 18px; }
    .prop-hint-pop li { margin-bottom: 7px; }
    .prop-hint-pop li strong { display: block; font-weight: 600; color: #22395c; }
    .prop-hint-pop li span { color: #6b7f9c; }
    .prop-hint-pop .prop-hint-tail { margin: 10px 0 0; padding-top: 8px; border-top: 1px dashed #e2e8f2; color: #6b7f9c; }
  `;
  document.head.appendChild(style);
})();
