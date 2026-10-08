/* ================================================================
   65-unified-column-settings.js  (v2 · DOM 驱动)
   低维材料主题应用 · 检索列表「列设置」统一层
   覆盖页面：twod / electrolyte / opto / mlff / catalyst（仅主题应用）

   为什么用 DOM 驱动而不是函数覆写：
   本项目是"追加式"演化的大型静态包，各模块列表的真实渲染入口散落在
   多个互相包裹的闭包里（后加载文件早在加载期就捕获了旧函数引用），
   任何函数级覆写都可能被绕过。因此本层直接对渲染产物 DOM 做
   「观察 → 注入统一面板 → 按列隐藏/恢复 → 追加自定义列」，
   对渲染路径零侵入，任何后续重渲染都会被重新套用。

   —— 统一面板结构（参考交互稿）：
      全选 + 已选 x / y
      列清单：每列带「固定 / 默认 / 自定义」标签，固定列勾选且禁用
      底部：恢复默认 + 完成

   —— 偏好读写闭环（关键逻辑）：
      1) 用户勾选/取消列 → 列表立即变化（无需保存按钮）
      2) 写入用户偏好：key = lowdim:colpref:<user_id>:<页面标识>
         （值 = 勾选中的可切换列名 + 启用的自定义列 key）
      3) 偏好存储：服务端为主、本地缓存兜底（当前为纯静态演示，
         以 localStorage 模拟远端持久化；接入真实后端时只需替换
         readPref / writePref / clearPref 三个实现为异步接口）
      4) 再次进入页面 → 读偏好 → 按用户选择渲染（跨会话、跨设备一致）
      5) 恢复默认 → 二次确认后执行 → 清除该用户的偏好记录（仅当前用户生效）
         → 回落系统默认列配置，等价于新用户首次进入
   ================================================================ */
(() => {
  if (window.__LOWDIM_UCOL_READY__) return;
  window.__LOWDIM_UCOL_READY__ = true;

  const esc = (v) => String(v ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const TAG_TEXT = { fixed: "固定", default: "默认", custom: "自定义" };
  const EXTRA_PREFIX = "ucol-extra:";

  /* ---------------- 偏好读写闭环 ---------------- */
  const PREF_PREFIX = "lowdim:colpref:";

  function prefUserId() {
    try {
      if (typeof state !== "undefined" && state.loginUser) return state.loginUser;
    } catch (e) {}
    return "researcher"; /* 独立页面以默认身份直达时的兜底标识 */
  }
  function prefKey(scope) { return PREF_PREFIX + prefUserId() + ":" + scope; }
  function readPref(scope) {
    try {
      const raw = localStorage.getItem(prefKey(scope));
      const arr = raw ? JSON.parse(raw) : null;
      return Array.isArray(arr) ? arr.filter((k) => typeof k === "string") : null;
    } catch (e) { return null; }
  }
  function writePref(scope, keys) {
    /* 服务端为主：接入后端后在此上报接口；当前以本地缓存兜底（模拟实现） */
    try { localStorage.setItem(prefKey(scope), JSON.stringify(keys)); } catch (e) {}
  }
  function clearPref(scope) {
    /* 恢复默认：删除该用户的偏好记录（仅当前用户生效） */
    try { localStorage.removeItem(prefKey(scope)); } catch (e) {}
  }

  /* ---------------- 页面配置 ---------------- */
  const twodExtraDefs = [];
  try {
    if (typeof TWOD_RESULT_EXTRA_COLUMN_GROUPS !== "undefined") {
      TWOD_RESULT_EXTRA_COLUMN_GROUPS.forEach((g) => g.columns.forEach((c) => {
        if (!twodExtraDefs.some((x) => x.key === c.key)) twodExtraDefs.push({ key: c.key, label: c.label });
      }));
    }
  } catch (e) {}

  const PAGES = {
    twod: {
      containerSel: "#page-twod",
      fixedLabels: ["序号", "材料编号", "材料名称", "操作"],
      scope: () => "twod",
      extras: {
        defs: twodExtraDefs,
        findItem: (id) => { try { return (typeof twodMaterials !== "undefined" ? twodMaterials : []).find((m) => m.id === id) || null; } catch (e) { return null; } },
        value: (item, key) => {
          try { return typeof getTwodResultColumnValue === "function" ? getTwodResultColumnValue(item, key) : "—"; }
          catch (e) { return "—"; }
        }
      }
    },
    electrolyte: {
      containerSel: "#page-electrolyte",
      fixedLabels: ["材料编号", "中文名称", "操作"],
      scope: () => "electrolyte"
    },
    opto: {
      containerSel: "#page-opto",
      fixedLabels: ["序号", "材料编号", "中文名称", "操作"],
      scope: () => "opto",
      extras: {
        defs: [
          { key: "homo", label: "HOMO能级" },
          { key: "lumo", label: "LUMO能级" },
          { key: "bandGap", label: "能隙" },
          { key: "logP", label: "LogP" },
          { key: "hBondDonorCount", label: "氢键供体数" }
        ],
        findItem: (id) => { try { return (typeof optoMaterials !== "undefined" ? optoMaterials : []).find((m) => m.id === id) || null; } catch (e) { return null; } },
        value: (item, key) => {
          const num = (v, suffix) => (v == null || v === "" ? "—" : `${v}${suffix || ""}`);
          if (key === "homo") return num(item && item.homo, " eV");
          if (key === "lumo") return num(item && item.lumo, " eV");
          if (key === "bandGap") return num(item && item.bandGap, " eV");
          if (key === "logP") return num(item && item.logP, "");
          if (key === "hBondDonorCount") return num(item && item.hBondDonorCount, "");
          return "—";
        }
      }
    },
    mlff: {
      containerSel: "#page-mlff",
      fixedLabels: ["材料编号", "中文名称", "操作"],
      scope: () => "mlff"
    },
    catalyst: {
      containerSel: "#page-catalyst",
      fixedLabels: ["材料名称", "操作"],
      scope: () => "catalyst"
    }
  };

  /* ---------------- 可见列解析：有偏好按偏好，无偏好回落系统默认 ---------------- */
  function currentLabels(pageId) {
    const cfg = PAGES[pageId];
    const container = document.querySelector(cfg.containerSel);
    const table = container && container.querySelector("table.twod-result-table");
    const row = table && table.tHead && table.tHead.rows.length ? table.tHead.rows[0] : null;
    return row ? Array.from(row.cells).map((th) => th.textContent.trim()) : [];
  }

  function ucolVisibleSet(pageId, labels) {
    const cfg = PAGES[pageId];
    const pref = readPref(cfg.scope());
    const set = new Set();
    labels.forEach((lb) => {
      if (!lb) return; /* 空表头列（如序号占位）始终显示，不进面板 */
      if (!pref || cfg.fixedLabels.includes(lb) || pref.includes(lb)) set.add(lb);
    });
    (cfg.extras ? cfg.extras.defs : []).forEach((d) => {
      if (pref && pref.includes(EXTRA_PREFIX + d.key)) set.add(EXTRA_PREFIX + d.key);
    });
    return set;
  }

  /* ---------------- 统一面板 ---------------- */
  function panelItems(pageId, labels) {
    const cfg = PAGES[pageId];
    const visibleSet = ucolVisibleSet(pageId, labels);
    const baseLabelSet = new Set(labels.filter(Boolean));
    const items = [];
    labels.forEach((lb) => {
      if (!lb) return;
      const isFixed = cfg.fixedLabels.includes(lb);
      items.push({ key: lb, label: lb, tag: isFixed ? "fixed" : "default", checked: isFixed || visibleSet.has(lb) });
    });
    (cfg.extras ? cfg.extras.defs : []).forEach((d) => {
      if (baseLabelSet.has(d.label)) return; /* 与基础列同名的扩展列不重复出现 */
      items.push({ key: EXTRA_PREFIX + d.key, label: d.label, tag: "custom", checked: visibleSet.has(EXTRA_PREFIX + d.key) });
    });
    return items;
  }

  function panelHtml(pageId, labels, sig) {
    const items = panelItems(pageId, labels);
    const total = items.length;
    const count = items.filter((i) => i.checked).length;
    return `
      <div class="ucol-panel" data-ucol-page="${esc(pageId)}" data-sig="${esc(sig)}">
        <div class="ucol-head">
          <label class="ucol-select-all"><input type="checkbox" data-ucol-select-all ${count === total ? "checked" : ""}><span>全选</span></label>
          <span class="ucol-count">已选 <b>${count}</b> / ${total}</span>
        </div>
        <div class="ucol-list">
          ${items.map((d) => `
            <label class="ucol-item${d.tag === "fixed" ? " is-fixed" : ""}" title="${esc(d.label)}">
              <input type="checkbox" data-ucol-toggle="${esc(d.key)}" ${d.checked ? "checked" : ""} ${d.tag === "fixed" ? "disabled" : ""}>
              <span class="ucol-label">${esc(d.label)}</span>
              <span class="ucol-tag ucol-tag-${d.tag}">${TAG_TEXT[d.tag]}</span>
            </label>`).join("")}
        </div>
        <div class="ucol-foot">
          <button type="button" class="btn ucol-reset-btn" data-ucol-reset>恢复默认</button>
          <button type="button" class="btn-primary ucol-done-btn" data-ucol-done>完成</button>
        </div>
      </div>`;
  }

  function syncPanelHeader(panel, pageId) {
    if (!panel || !PAGES[pageId]) return;
    const items = panelItems(pageId, currentLabels(pageId));
    const count = items.filter((i) => i.checked).length;
    const b = panel.querySelector(".ucol-count b");
    if (b) b.textContent = String(count);
    const all = panel.querySelector("[data-ucol-select-all]");
    if (all) all.checked = count === items.length;
  }

  /* ---------------- 核心：观察渲染产物并套用统一列设置（幂等） ---------------- */
  const openState = {};

  function findColMenu(container) {
    const toolbars = container.querySelectorAll(".cross-db-result-toolbar, .twod-result-toolbar");
    for (const tb of toolbars) {
      for (const d of tb.querySelectorAll("details")) {
        if (/列设置/.test((d.querySelector("summary") || {}).textContent || "")) return d;
      }
    }
    return [...container.querySelectorAll("details")].find((d) =>
      /列设置/.test((d.querySelector("summary") || {}).textContent || "") && d.querySelector(":scope > div"));
  }

  function ensureUcol(pageId) {
    const cfg = PAGES[pageId];
    const container = document.querySelector(cfg.containerSel);
    if (!container) return;
    if (container.classList.contains("page") && !container.classList.contains("active")) return;

    const table = container.querySelector("table.twod-result-table");
    if (!table || !table.tHead || !table.tHead.rows.length) return;
    const ths = Array.from(table.tHead.rows[0].cells);
    if (!ths.length) return;
    const labels = ths.map((th) => th.textContent.trim());
    const sig = labels.join("|");

    /* 1) 找到或注入「列设置」菜单 */
    let details = findColMenu(container);
    if (!details) {
      const actions = container.querySelector(".cross-db-toolbar-actions") || container.querySelector(".twod-toolbar-actions");
      if (!actions) return;
      const isCross = actions.classList.contains("cross-db-toolbar-actions");
      details = document.createElement("details");
      details.className = isCross ? "cross-db-toolbar-menu" : "twod-toolbar-menu";
      details.innerHTML = '<summary>列设置▾</summary><div class="' +
        (isCross ? "cross-db-toolbar-panel" : "twod-toolbar-panel") + ' ucol-host"></div>';
      actions.appendChild(details);
    }
    details.setAttribute("data-ucol-menu", "");
    if (openState[pageId] && !details.open) details.open = true;

    /* 2) 面板缺失或列集合变化时重绘（读写闭环：勾选状态实时反映） */
    const panelHost = details.querySelector(":scope > div");
    const panel = panelHost.querySelector(".ucol-panel");
    if (!panel || panel.dataset.sig !== sig) {
      panelHost.innerHTML = panelHtml(pageId, labels, sig);
    }

    /* 3) 按用户选择隐藏/恢复列（列表立即变化，无需保存按钮） */
    const visibleSet = ucolVisibleSet(pageId, labels);
    ths.forEach((th, i) => {
      const lb = labels[i];
      th.hidden = !!lb && !cfg.fixedLabels.includes(lb) && !visibleSet.has(lb);
    });
    table.querySelectorAll("tbody tr").forEach((tr) => {
      const cells = Array.from(tr.children).filter((td) => !td.hasAttribute("data-ucol-extra"));
      if (cells.length === ths.length) cells.forEach((td, i) => { td.hidden = ths[i].hidden; });
    });

    /* 4) 自定义列（追加单元格，幂等） */
    applyExtras(pageId, table, ths, visibleSet);
  }

  function applyExtras(pageId, table, ths, visibleSet) {
    const cfg = PAGES[pageId];
    if (!cfg.extras || !cfg.extras.defs.length) return;
    const baseLabelSet = new Set(ths.map((th) => th.textContent.trim()).filter(Boolean));
    const active = cfg.extras.defs
      .filter((d) => !baseLabelSet.has(d.label) && visibleSet.has(EXTRA_PREFIX + d.key));
    table.querySelectorAll("tbody tr").forEach((tr) => {
      const extras = Array.from(tr.querySelectorAll("td[data-ucol-extra]"));
      const ok = extras.length === active.length &&
        active.every((d, i) => extras[i] && extras[i].getAttribute("data-ucol-extra") === d.key);
      if (ok) return; /* 已是目标状态，避免无限重排 */
      extras.forEach((td) => td.remove());
      if (!active.length) return;
      const baseCells = Array.from(tr.children);
      if (baseCells.length !== ths.length) return;
      const link = tr.querySelector("[data-open-material]");
      const id = link ? String(link.dataset.openMaterial || "").split(":").pop() : "";
      const item = id ? cfg.extras.findItem(id) : null;
      if (!item) return;
      const anchor = tr.lastElementChild; /* 操作列（固定列）之前插入 */
      active.forEach((d) => {
        const td = document.createElement("td");
        td.setAttribute("data-ucol-extra", d.key);
        td.className = "twod-result-extra-cell";
        td.title = d.label;
        td.textContent = String(cfg.extras.value(item, d.key) ?? "—");
        tr.insertBefore(td, anchor);
      });
    });
  }

  /* ---------------- 全局观察：任何模块重渲染后自动重新套用 ---------------- */
  let moTimer = null;
  const mo = new MutationObserver(() => {
    if (moTimer) clearTimeout(moTimer);
    moTimer = setTimeout(() => {
      Object.keys(PAGES).forEach((pageId) => {
        try { ensureUcol(pageId); } catch (e) { /* 列设置异常不影响原页面 */ }
      });
    }, 150);
  });
  mo.observe(document.body, { childList: true, subtree: true });
  const bootApply = () => Object.keys(PAGES).forEach((pageId) => {
    try { ensureUcol(pageId); } catch (e) {}
  });
  if (document.readyState === "complete") setTimeout(bootApply, 800);
  else window.addEventListener("load", () => setTimeout(bootApply, 800));

  /* ---------------- 事件：勾选 / 全选 / 恢复默认 / 完成 ---------------- */
  function commitSelection(pageId, visSet) {
    const cfg = PAGES[pageId];
    const labels = currentLabels(pageId);
    const fixedSet = new Set(cfg.fixedLabels);
    const baseOn = labels.filter((lb) => lb && !fixedSet.has(lb) && visSet.has(lb));
    const extrasOn = (cfg.extras ? cfg.extras.defs : [])
      .filter((d) => visSet.has(EXTRA_PREFIX + d.key)).map((d) => EXTRA_PREFIX + d.key);
    writePref(cfg.scope(), baseOn.concat(extrasOn)); /* 第 2 步：写入用户偏好 */
    ensureUcol(pageId);                              /* 第 1 步：列表立即变化 */
  }

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (!target || !target.closest) return;
    const toggle = target.closest("[data-ucol-toggle]");
    if (toggle) {
      const panel = toggle.closest(".ucol-panel");
      const pageId = panel ? panel.dataset.ucolPage : "";
      if (!pageId || !PAGES[pageId]) return;
      const visSet = ucolVisibleSet(pageId, currentLabels(pageId));
      if (toggle.checked) visSet.add(toggle.dataset.ucolToggle);
      else visSet.delete(toggle.dataset.ucolToggle);
      commitSelection(pageId, visSet);
      const fresh = document.querySelector(`.ucol-panel[data-ucol-page="${pageId}"]`);
      syncPanelHeader(fresh, pageId);
      return;
    }
    const selectAll = target.closest("[data-ucol-select-all]");
    if (selectAll) {
      const panel = selectAll.closest(".ucol-panel");
      const pageId = panel ? panel.dataset.ucolPage : "";
      if (!pageId || !PAGES[pageId]) return;
      const cfg = PAGES[pageId];
      const labels = currentLabels(pageId);
      const visSet = new Set();
      if (selectAll.checked) {
        labels.forEach((lb) => { if (lb) visSet.add(lb); });
        (cfg.extras ? cfg.extras.defs : []).forEach((d) => visSet.add(EXTRA_PREFIX + d.key));
      } /* 取消全选：仅保留固定列 */
      commitSelection(pageId, visSet);
      const fresh = document.querySelector(`.ucol-panel[data-ucol-page="${pageId}"]`);
      if (fresh) {
        fresh.querySelectorAll("[data-ucol-toggle]").forEach((cb) => {
          if (!cb.disabled) cb.checked = selectAll.checked;
        });
        syncPanelHeader(fresh, pageId);
      }
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!target || !target.closest) return;
    const resetBtn = target.closest("[data-ucol-reset]");
    if (resetBtn) {
      const panel = resetBtn.closest(".ucol-panel");
      const pageId = panel ? panel.dataset.ucolPage : "";
      if (!pageId || !PAGES[pageId]) return;
      /* 二次确认 → 清除该用户偏好记录 → 回落系统默认列配置 */
      if (!window.confirm("确定恢复默认列设置？\n将清除当前用户的个性化列偏好，回到系统默认列配置。")) return;
      clearPref(PAGES[pageId].scope());
      ensureUcol(pageId);
      const fresh = document.querySelector(`.ucol-panel[data-ucol-page="${pageId}"]`);
      if (fresh) {
        const labels = currentLabels(pageId);
        fresh.dataset.sig = labels.join("|");
        fresh.outerHTML = panelHtml(pageId, labels, labels.join("|"));
      }
      return;
    }
    const doneBtn = target.closest("[data-ucol-done]");
    if (doneBtn) {
      const details = doneBtn.closest("details");
      if (details) details.open = false; /* 「完成」仅收起面板，偏好已实时生效 */
    }
  });

  /* 记录面板展开状态，模块重渲染后恢复 */
  document.addEventListener("toggle", (event) => {
    const d = event.target;
    if (!d || !d.matches || !d.matches("details[data-ucol-menu]")) return;
    const panel = d.querySelector(".ucol-panel");
    const pageId = panel ? panel.dataset.ucolPage : null;
    if (pageId) openState[pageId] = d.open;
  }, true);

  /* ---------------- 样式 ---------------- */
  const style = document.createElement("style");
  style.id = "lowdim-unified-column-settings-style";
  style.textContent = `
    .ucol-panel, .ucol-panel * { box-sizing: border-box; }
    .ucol-panel { width: 264px; background: #fff; border: 1px solid #e2e8f2; border-radius: 10px;
      box-shadow: 0 10px 28px rgba(15, 42, 86, 0.12); overflow: hidden; font-size: 13px; color: #22395c; text-align: left; }
    .cross-db-toolbar-panel .ucol-panel, .twod-toolbar-panel .ucol-panel { box-shadow: none; margin: 0 auto; }
    .ucol-head { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #eef2f8; }
    .ucol-select-all { display: flex; align-items: center; gap: 6px; font-weight: 600; cursor: pointer; margin: 0; }
    .ucol-count { color: #8a99b0; font-size: 12px; }
    .ucol-count b { color: #165DFF; }
    .ucol-list { max-height: 264px; overflow-y: auto; padding: 4px 0; }
    .ucol-panel label.ucol-item { display: flex; align-items: center; gap: 8px; padding: 7px 12px; cursor: pointer; margin: 0; background: none; border: 0; width: 100%; }
    .ucol-panel label.ucol-item:hover { background: #f4f8ff; }
    .ucol-panel label.ucol-item.is-fixed, .ucol-panel label.ucol-item.is-fixed:hover { cursor: default; background: none; }
    .ucol-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ucol-item.is-fixed .ucol-label { color: #a4b1c4; }
    .ucol-tag { flex: none; font-size: 11px; line-height: 1; padding: 3px 6px; border-radius: 4px; }
    .ucol-tag-fixed { color: #94a5bd; background: #f1f4f9; }
    .ucol-tag-default { color: #6b7f9c; background: #eef3fa; }
    .ucol-tag-custom { color: #165DFF; background: #e8f0ff; }
    .ucol-item input[type="checkbox"] { accent-color: #165DFF; width: 14px; height: 14px; margin: 0; flex: none; }
    .ucol-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 9px 12px; border-top: 1px solid #eef2f8; background: #fafcfe; }
    .ucol-foot .ucol-reset-btn { padding: 5px 12px; border-radius: 8px; border: 1px solid #cbd8eb; background: #fff; color: #3d4d68; cursor: pointer; font-size: 12px; }
    .ucol-foot .ucol-reset-btn:hover { border-color: #165DFF; color: #165DFF; }
    .ucol-foot .ucol-done-btn { padding: 5px 14px; border-radius: 8px; border: 1px solid #165DFF; background: #165DFF; color: #fff; cursor: pointer; font-size: 12px; }
    .ucol-foot .ucol-done-btn:hover { opacity: .9; }
    .twod-result-table td[hidden], .twod-result-table th[hidden] { display: none !important; }
  `;
  document.head.appendChild(style);
})();
