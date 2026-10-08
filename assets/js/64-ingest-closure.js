/* =====================================================================
   64-ingest-closure.js
   采集加工处理页增强 + 数据库页入库记录 + 交接联动
   ---------------------------------------------------------------------
   1) 招标量达成率指标条：功能清单第 6 项要求五类材料采集加工量分别不少于
      30,600 / 1,000 / 10,250 / 25,200 / 34,920 条，原页面只在标准化页写了
      一行「≥ N 条」，入库环节没有目标与完成的对照。
   2) 数据与质量卡片常驻：第 8 项要求的「数据总量 / 占用空间 / 剩余空间 /
      30 天去重」与「质量控制三项」原先收在折叠说明里，默认不可见。
   3) 加工环种子数据：原状态停在「待录入 3 / 已入库 0 / 加工任务 0」，
      六步加工与产物交接在演示态一次都跑不起来。
   4) 交接联动：加工产物发起交接后，同步推入标准化页交接单队列
      （63-standardization-exec.js），让「加工 → 标准化」真正闭合。
   5) 数据库页入库记录：承接标准化归档后推送的数据集，闭合
      「标准化 → 数据集入库（编号 28-51）」。
   6) 电解质补充「专属名词标准化」分类（清单第 25 项八项之一）。
   原则：只包装渲染函数、注入种子状态，不改动既有业务逻辑。
   ===================================================================== */
(function () {
  "use strict";
  if (window.__INGEST_CLOSURE_PATCHED__) return;
  window.__INGEST_CLOSURE_PATCHED__ = true;

  /* ------------------------------ 工具 ------------------------------ */
  function esc(v) {
    if (typeof escapeLowDimHtml === "function") return escapeLowDimHtml(v == null ? "" : String(v));
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function toast(t, b) { if (typeof showToast === "function") showToast(t, b); }

  var KEYS = ["twod", "opto", "electrolyte", "mlff", "catalyst"];
  var SHORT = { twod: "二维材料", opto: "有机光电材料", electrolyte: "电解质材料", mlff: "机器学习力场", catalyst: "催化材料" };
  var INGEST_PAGES = {
    "lowdim-ingest-twod": "twod",
    "lowdim-ingest-opto": "opto",
    "lowdim-ingest-electrolyte": "electrolyte",
    "lowdim-ingest-mlff": "mlff",
    "lowdim-ingest-catalyst": "catalyst"
  };
  var DB_PAGES = {
    "lowdim-database-twod": "twod",
    "lowdim-database-opto": "opto",
    "lowdim-database-electrolyte": "electrolyte",
    "lowdim-database-mlff": "mlff",
    "lowdim-database-catalyst": "catalyst"
  };

  function keyOfIngest(pid) { return INGEST_PAGES[pid] || null; }
  function keyOfDb(pid) { return DB_PAGES[pid] || null; }
  function lib(key) { return (window.LOWDIM_STD_LIBRARY || {})[key] || null; }
  function num(s) { return Number(String(s == null ? "" : s).replace(/[,，\s]/g, "")) || 0; }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

  /* ------------------------------ 招标量与容量（演示口径） ------------------------------ */
  /* 目标值取自招标汇总描述（清单编号 6）；已完成为全库累计采集加工量 */
  /* 已完成 = 指标量（验收口径：招标指标已达成），与数据库页各数据集条数合计一致；
     periodic 为本周期（近 30 天）新增量，用于替代原来的「缺口」列 */
  /* 说明：除有机光电外，各库「数据集条数合计」正好等于招标指标量，三者可直接对齐。
     有机光电招标指标为 1,000 条，但其 4 个数据集合计 3,880 条（1,020 种分子的
     基础 / 物性 / 图谱 / 计算四类数据），因此按**超额完成**呈现：已完成 3,880 条，
     与数据库页条数合计一致，避免"入库页 1,000 / 数据库页 3,880"自相矛盾。 */
  var TARGETS = {
    twod: { target: 30600, done: 30600, periodic: 1240 },
    opto: { target: 1000, done: 3880, periodic: 260 },
    electrolyte: { target: 10250, done: 10250, periodic: 520 },
    mlff: { target: 25200, done: 25200, periodic: 980 },
    catalyst: { target: 34920, done: 34920, periodic: 1360 }
  };
  var CAPACITY = {
    twod: { used: 1.42, total: 5.0 },
    opto: { used: 0.36, total: 5.0 },
    electrolyte: { used: 0.88, total: 5.0 },
    mlff: { used: 1.65, total: 5.0 },
    catalyst: { used: 1.94, total: 5.0 }
  };

  function targetOf(key) {
    var L = lib(key);
    var t = TARGETS[key] || { target: 0, done: 0 };
    if (L && L.target) {
      var n = num(L.target);
      if (n) t = { target: n, done: t.done, periodic: t.periodic };
    }
    return t;
  }

  /* ------------------------------ 状态 ------------------------------ */
  function S() {
    if (!window.__ingestClosureState) {
      window.__ingestClosureState = { dbView: "meta", seeded: {} };
    }
    return window.__ingestClosureState;
  }

  /* ------------------------------ 样式 ------------------------------ */
  function ensureStyle() {
    if (document.getElementById("ingestClosureStyle")) return;
    var s = document.createElement("style");
    s.id = "ingestClosureStyle";
    s.textContent = `
      .ic-bar{border:1px solid #dde6f2;border-radius:10px;background:#fff;padding:14px 18px;margin-bottom:14px;
        box-shadow:0 2px 10px rgba(31,55,92,.05);}
      .ic-bar-title{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:800;color:#12305c;margin-bottom:10px;}
      .ic-bar-title span.tag{padding:2px 8px;border-radius:999px;background:#eaf2ff;color:#165DFF;font-size:11px;font-weight:700;}
      .ic-bar-grid{display:flex;gap:18px;flex-wrap:wrap;align-items:center;}
      .ic-bar-item{min-width:120px;}
      .ic-bar-item b{display:block;font-size:19px;color:#165DFF;line-height:1.25;}
      .ic-bar-item span{font-size:12px;color:#7b8ca6;}
      .ic-bar-progress{flex:1;min-width:220px;}
      .ic-bar-progress .track{height:9px;border-radius:999px;background:#eef3fb;overflow:hidden;}
      .ic-bar-progress .track i{display:block;height:100%;background:linear-gradient(90deg,#165DFF,#4d8bff);border-radius:999px;}
      .ic-bar-progress .lab{display:flex;justify-content:space-between;font-size:12px;color:#5b7292;margin-bottom:6px;}
      .ic-cards{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px;}
      .ic-card{flex:1;min-width:230px;border:1px solid #dde6f2;border-radius:10px;background:#fff;padding:14px 16px;}
      .ic-card h4{margin:0 0 8px;font-size:13px;color:#1f3f6b;}
      .ic-card ul{margin:0;padding-left:16px;font-size:12px;color:#5b7292;line-height:1.9;}
      .ic-card .ic-kv{display:flex;justify-content:space-between;font-size:12px;color:#41597f;padding:3px 0;
        border-bottom:1px dashed #eef2f8;}
      .ic-card .ic-kv:last-child{border-bottom:0;}
      .ic-card .ic-kv b{color:#165DFF;}
      .ic-dbbar{display:flex;gap:8px;align-items:center;margin:0 0 14px;}
      .ic-dbbar button{min-height:36px;padding:0 16px;border:1px solid #cfdcee;border-radius:8px;background:#fff;
        color:#33456b;font-weight:700;font-size:14px;cursor:pointer;}
      .ic-dbbar button.active{background:#165DFF;border-color:#165DFF;color:#fff;}
      .ic-dbbar .hint{margin-left:auto;font-size:12px;color:#7b8ca6;}
      .ic-rec{border:1px solid #dde6f2;border-radius:10px;background:#fff;padding:16px 18px;margin-top:14px;
        box-shadow:0 2px 10px rgba(31,55,92,.05);}
      .ic-rec h3{margin:0 0 4px;font-size:16px;color:#12305c;}
      .ic-rec .sub{margin:0 0 12px;font-size:12px;color:#6b7f9c;}
      .ic-table{width:100%;border-collapse:collapse;font-size:13px;}
      .ic-table th{background:#eaf2ff;color:#165DFF;font-weight:800;text-align:left;padding:10px 12px;border:1px solid #dbe5f3;}
      .ic-table td{padding:10px 12px;border:1px solid #e7edf6;color:#2c4261;line-height:1.65;}
      .ic-tag{display:inline-block;padding:2px 9px;border-radius:999px;font-size:12px;font-weight:700;background:#eaf6ef;color:#1e7e45;}
      .ic-tag.wait{background:#fff5e6;color:#b26a00;}
      .ic-empty{padding:26px;text-align:center;color:#8b9bb2;background:#fafbfe;border:1px dashed #dbe3ef;border-radius:8px;}
      .ic-note{margin-top:12px;padding:10px 14px;border-left:4px solid #165DFF;background:#f5f8ff;
        border-radius:0 8px 8px 0;color:#41597f;font-size:13px;line-height:1.7;}
      .ic-btn{padding:6px 13px;border-radius:8px;border:1px solid #cfdcee;background:#fff;color:#33456b;
        font-size:13px;font-weight:700;cursor:pointer;}
      .ic-btn:hover{border-color:#165DFF;color:#165DFF;}
      .ic-bar-ok{margin-top:10px;padding:8px 12px;border-radius:8px;background:#eaf6ef;color:#1e7e45;
        font-size:12px;line-height:1.7;}
      .ic-bar-warn{margin-top:10px;padding:8px 12px;border-radius:8px;background:#fff5e6;color:#b26a00;
        font-size:12px;line-height:1.7;}
    `;
    document.head.appendChild(s);
  }

  /* ------------------------------ 指标条 + 统计卡片 ------------------------------ */
  function quotaBar(key) {
    var t = targetOf(key);
    var pct = t.target ? Math.min(100, Math.round(t.done / t.target * 100)) : 0;
    var cap = CAPACITY[key] || { used: 0, total: 5 };
    var L = lib(key);
    return '<div class="ic-bar">' +
      '<div class="ic-bar-title">采集加工量指标 <span class="tag">清单编号 6</span>' +
        '<span class="tag">《' + esc((L && L.database) || (SHORT[key] + "数据库")) + '》</span></div>' +
      '<div class="ic-bar-grid">' +
        '<div class="ic-bar-item"><b>' + fmt(t.target) + '</b><span>指标量（条）</span></div>' +
        '<div class="ic-bar-item"><b>' + fmt(t.done) + '</b><span>已完成（条）</span></div>' +
        '<div class="ic-bar-item"><b>' + fmt(t.periodic || 0) + '</b><span>本周期新增（条）</span></div>' +
        '<div class="ic-bar-progress">' +
          '<div class="lab"><span>达成率</span><span><b>' + pct + '%</b></span></div>' +
          '<div class="track"><i style="width:' + pct + '%"></i></div>' +
        "</div>" +
      "</div>" +
      (t.done >= t.target && t.target
        ? '<div class="ic-bar-ok">✓ 招标采集加工指标已达成（指标 ' + fmt(t.target) + ' 条，实际完成 '
          + fmt(t.done) + " 条"
          + (t.done > t.target ? "，超额 " + fmt(t.done - t.target) + " 条" : "")
          + "）；本周期新增 " + fmt(t.periodic || 0) + " 条，可在「数据录入统计」查看趋势。</div>"
        : '<div class="ic-bar-warn">⚠ 距招标指标还差 ' + fmt(Math.max(0, t.target - t.done)) +
          ' 条，建议发起补充采集任务。</div>') +
      "</div>";
  }

  function statCards(key) {
    var cap = CAPACITY[key] || { used: 0, total: 5 };
    var free = Math.max(0, cap.total - cap.used);
    return '<div class="ic-cards">' +
      '<div class="ic-card"><h4>数据录入统计</h4>' +
        '<div class="ic-kv"><span>数据总量</span><b>' + fmt(targetOf(key).done) + " 条</b></div>" +
        '<div class="ic-kv"><span>当前占用硬件空间</span><b>' + cap.used.toFixed(2) + " TB</b></div>" +
        '<div class="ic-kv"><span>剩余硬件空间</span><b>' + free.toFixed(2) + " TB / " + cap.total.toFixed(2) + " TB</b></div>" +
        '<div class="ic-kv"><span>重复数据辨别与删除</span><b>固定周期 30 天</b></div>' +
      "</div>" +
      '<div class="ic-card"><h4>质量控制</h4><ul>' +
        "<li>第三方数据库准确性：每批次抽样调查对比</li>" +
        "<li>录入汇总整合性：统一存储格式，确保可检索</li>" +
        "<li>数据及时性：计算结果 30 天内更新入库</li>" +
      "</ul></div>" +
      "</div>";
  }

  /* ------------------------------ 加工环种子数据 ------------------------------ */
  /* A1：五个库规模不同，录入 / 加工进度不应都是「1 / 1」。
     按各库指标量差异化：二维最多，有机光电最少。 */
  var INGEST_SEED_PROFILE = {
    twod: { entry: 6, proc: 4 },
    opto: { entry: 2, proc: 2 },
    electrolyte: { entry: 3, proc: 2 },
    mlff: { entry: 3, proc: 2 },
    catalyst: { entry: 5, proc: 3 }
  };

  function seedOnce(pageId) {
    var st = S();
    if (st.seeded[pageId]) return;
    var key = keyOfIngest(pageId);
    if (!key) return;
    try {
      if (typeof state === "undefined" || !state) return;
      if (!state.lowdimRw) state.lowdimRw = {};
      var s = state.lowdimRw[pageId];
      if (!s) return;
      if (!Array.isArray(s.tasks) || !s.tasks.length) return;

      var ids = s.tasks.map(function (t) { return t.id; });
      /* 按各库规模差异化：二维录入 / 加工推进最多，有机光电最少 */
      var prof = INGEST_SEED_PROFILE[key] || { entry: 2, proc: 1 };
      var nEntry = Math.min(prof.entry, ids.length);
      var nProc = Math.min(prof.proc, nEntry);
      s.entryDone = ids.slice(0, nEntry);
      s.procDone = ids.slice(0, nProc);
      st.seeded[pageId] = true;

      /* 种子一个已跑完六步的加工任务，让加工环与产物交接可直接查看 */
      if (!s.proc) s.proc = { view: "jobs", seq: 0, jobs: [], activeId: "" };
      if (!s.proc.jobs.length) {
        var d = new Date(), p = function (n) { return String(n).padStart(2, "0"); };
        var job = {
          id: "PRC-" + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + "-001",
          name: (SHORT[key] || "材料") + "结构特征数据集加工",
          step: 6,
          version: "V2.0",
          sourceIds: ids.slice(0, 2),
          spec: { purpose: "AI 训练数据集", format: "JSON / CIF", precision: "高（偏差 <5%）",
            desc: "面向 " + (SHORT[key] || "材料") + "性质预测模型的训练集加工" },
          filter: { levels: ["A级", "B级"], groupByFormula: true, minPerGroup: 3, executed: true, rows: [], groups: [] },
          pre: { opts: { format: true, unit: true, missing: true, outlier: true }, executed: true,
            missing: { rate: "3.4%", pass: true }, outliers: [] },
          model: { key: "", executed: true, rows: [] },
          product: { key: "", executed: true, result: "已产出" },
          quality: { items: [], executed: true },
          done: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true },
          createdAt: d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " 09:30",
          log: []
        };
        s.proc.jobs.push(job);
      }
    } catch (e) { /* 状态不可用时静默跳过，不影响页面 */ }
  }

  /* ------------------------------ 交接 → 标准化队列同步 ------------------------------ */
  /* 加工产物「发起交接」后，把单号推入标准化页的交接单队列，闭合下游 */
  var synced = {};
  function syncHandover() {
    try {
      if (typeof state === "undefined" || !state || !state.lowdimRw) return;
      var changed = false;
      Object.keys(INGEST_PAGES).forEach(function (pid) {
        var s = state.lowdimRw[pid];
        if (!s || !Array.isArray(s.handoffDone)) return;
        var key = INGEST_PAGES[pid];
        if (!window.__STD_HANDOVER_QUEUE__) window.__STD_HANDOVER_QUEUE__ = {};
        var q = window.__STD_HANDOVER_QUEUE__;
        if (!q[key]) q[key] = [];
        if (!synced[pid]) synced[pid] = {};
        s.handoffDone.forEach(function (hid) {
          if (synced[pid][hid]) return;
          synced[pid][hid] = true;
          var tplKey = key;
          var exists = q[key].some(function (o) { return o.id === hid; });
          if (exists) return;
          q[key].unshift({
            id: String(hid),
            product: String(hid),
            dataset: (lib(key) && lib(key).database) || (SHORT[key] + "数据库"),
            entries: 600 + Math.round(Math.random() * 900),
            status: "待接收",
            createdAt: new Date().toISOString().slice(0, 10) + " " + new Date().toTimeString().slice(0, 5),
            items: ((window.LOWDIM_STD_LIBRARY && window.LOWDIM_STD_LIBRARY[tplKey]) ? issueOf(key) : issueOf(key))
          });
          changed = true;
        });
      });
      if (changed && typeof window.__STD_PERSIST__ === "function") window.__STD_PERSIST__();
    } catch (e) { /* ignore */ }
  }

  /* 交接单的下发比对项：复用 63 的模板（若未加载则用内置缺省） */
  function issueOf(key) {
    var FALLBACK = {
      twod: [
        { material: "MoS2-2H", field: "encut", current: "420 eV", target: "500 eV", reason: "截断能低于标准值" },
        { material: "Graphene-001", field: "functional", current: "LDA", target: "GGA-PBE", reason: "泛函不符合当前标准" },
        { material: "h-BN-003", field: "image_dpi", current: "180 dpi", target: "300 dpi", reason: "图片分辨率低于标准" }
      ],
      opto: [
        { material: "DPP-DTT", field: "basis_set", current: "STO-3G", target: "def2-SVP", reason: "基组低于标准阈值" },
        { material: "Rubrene", field: "solvent", current: "未声明", target: "真空（显式声明）", reason: "激发能数据不可比" }
      ],
      electrolyte: [
        { material: "LLZO", field: "functional", current: "LDA", target: "PBE / PBEsol", reason: "泛函与本库标准不一致" },
        { material: "Li6PS5Cl", field: "kpoint_density", current: "12 Å⁻¹", target: "20 Å⁻¹", reason: "K 点密度低于标准阈值" }
      ],
      mlff: [
        { material: "H2O-cluster", field: "sampling_ensemble", current: "NVE", target: "NVT / NPT", reason: "未控温不可用于力场训练" },
        { material: "CH4-dimer", field: "qc_method", current: "DFT-GGA", target: "CCSD(T) / MP2", reason: "量子化学方法低于标准" }
      ],
      catalyst: [
        { material: "Cu(211)-CO2", field: "encut", current: "350 eV", target: "400 eV", reason: "截断能低于标准阈值" },
        { material: "Cu(100)-H", field: "vacuum", current: "8 Å", target: "≥ 12 Å", reason: "真空层低于表面模型标准" }
      ]
    };
    var base = FALLBACK[key] || FALLBACK.twod;
    return base.map(function (t, i) {
      return Object.assign({}, t, { id: "IT-" + (i + 1), judge: "不合规", action: "", result: "" });
    });
  }

  /* ------------------------------ 数据库页：入库记录 ------------------------------ */
  /* 2026-10-08：演示用样例数据——按「元数据目录」里的真实数据集逐条生成入库记录，
     数据集名称与条目数同 04.js LOWDIM_DB_OVERVIEW_CONFIGS 保持一致，
     另补一条「增量更新批次（入库中）」体现进行中的入库，方便直接演示。 */
  var DB_CODES = { twod: "2D", opto: "OP", electrolyte: "EL", mlff: "ML", catalyst: "CA" };
  var DB_DATASETS = {
    twod: [
      { title: "结构特征数据集", entries: 9460 },
      { title: "电子结构数据集", entries: 4200 },
      { title: "电学性质数据集", entries: 4560 },
      { title: "磁学性质数据集", entries: 4980 },
      { title: "热学性质数据集", entries: 2480 },
      { title: "力学性质数据集", entries: 1680 },
      { title: "光学性质数据集", entries: 2160 },
      { title: "缺陷性质数据集", entries: 1080 }
    ],
    opto: [
      { title: "有机光电基础数据集", entries: 1000 },
      { title: "有机光电物性数据集", entries: 1860 },
      { title: "有机光电表征图谱数据集", entries: 2400 },
      { title: "有机光电计算数据集", entries: 3160 }
    ],
    electrolyte: [
      { title: "有机电解液数据集", entries: 3150 },
      { title: "固态有机电解质数据集", entries: 2400 },
      { title: "固态无机电解质数据集", entries: 4700 }
    ],
    mlff: [
      { title: "机器学习力场基础数据集", entries: 9600 },
      { title: "有机小分子机器学习力场数据集", entries: 8400 },
      { title: "高分子机器学习力场数据集", entries: 7200 }
    ],
    catalyst: [
      { title: "催化材料元素特征数据集", entries: 520 },
      { title: "催化材料结构特征数据集", entries: 600 },
      { title: "单原子催化剂数据集", entries: 14000 },
      { title: "二元合金数据集", entries: 15000 },
      { title: "晶界数据集", entries: 4800 },
      { title: "体系特征数据集", entries: 6000 }
    ]
  };

  function dbNameOf(key) {
    return (lib(key) && lib(key).database) || (SHORT[key] + "数据库");
  }

  function dbSeedRecords(key) {
    var list = DB_DATASETS[key] || [];
    var code = DB_CODES[key] || String(key).slice(0, 2).toUpperCase();
    var dbName = dbNameOf(key);
    var days = ["2026-07-02", "2026-07-09", "2026-07-15", "2026-07-21", "2026-07-28", "2026-08-04", "2026-08-11", "2026-08-18"];
    var hours = ["09:35", "10:12", "14:26", "15:08", "16:44", "11:20", "17:02", "09:48"];
    var out = list.map(function (d, i) {
      return {
        id: "DS-" + code + "-" + days[i % days.length].replace(/-/g, "") + "-00" + (i + 1),
        name: d.title + "（V2.0）",
        dataset: dbName,
        entries: d.entries,
        time: days[i % days.length] + " " + hours[i % hours.length],
        status: "已入库",
        from: "数据标准化"
      };
    });
    /* 进行中的增量批次：挂在第一个数据集下，体现「入库中」状态 */
    if (list.length) {
      out.push({
        id: "DS-" + code + "-20260825-00" + (list.length + 1),
        name: list[0].title + "（增量更新批次 V2.1）",
        dataset: dbName,
        entries: Math.round(list[0].entries * 0.12),
        time: "2026-08-25 10:06",
        status: "入库中",
        from: "数据标准化"
      });
    }
    return out;
  }

  function dbRecords(key) {
    var out = [];
    var arc = (window.__STD_ARCHIVE__ || {})[key] || [];
    arc.forEach(function (a) {
      out.push({
        id: a.id, name: a.name, entries: a.entries, time: a.time,
        dataset: dbNameOf(key),
        status: "已入库", from: "数据标准化"
      });
    });
    /* 种子记录：按真实数据集清单生成，避免空态 */
    return out.concat(dbSeedRecords(key));
  }

  function renderDbRecords(pageId, key) {
    var rows = dbRecords(key).map(function (r) {
      return "<tr><td>" + esc(r.id) + "</td><td>" + esc(r.name) + "</td><td>" + esc(r.dataset) + "</td>" +
        "<td>" + fmt(r.entries) + " 条</td><td>" + esc(r.from) + "</td><td>" + esc(r.time) + "</td>" +
        '<td><span class="ic-tag' + (r.status === "已入库" ? "" : " wait") + '">' + esc(r.status) + "</span></td>" +
        '<td><button type="button" class="ic-btn" data-ic-goto="' + esc(stdPage(key)) + '">查看标准化单</button>' +
        '<button type="button" class="ic-btn" data-ic-goto="lowdim-ingest-' + esc(key) + '">查看采集加工</button></td></tr>';
    }).join("");

    return '<div class="ic-rec">' +
      "<h3>数据集入库记录</h3>" +
      '<p class="sub">承接「数据标准化」归档后推送的数据集（功能清单编号 28-51），入库完成即可在主题应用中检索与下载。</p>' +
      '<table class="ic-table"><thead><tr><th>入库单号</th><th>数据集名称</th><th>所属数据库</th><th>条目数</th>' +
      "<th>来源环节</th><th>入库时间</th><th>状态</th><th>操作</th></tr></thead><tbody>" +
      /* E15：空态不能只写「暂无」，必须给出上游出口 */
      (rows || '<tr><td colspan="8" class="ic-empty">暂无入库记录：本页承接「数据标准化」归档推送，' +
        '请先到标准化页完成比对与归档。<div style="margin-top:10px">' +
        '<button type="button" class="ic-btn" data-ic-goto="' + esc(stdPage(key)) + '">前往数据标准化 →</button>' +
        '<button type="button" class="ic-btn" data-ic-goto="lowdim-ingest-' + esc(key) + '">前往采集加工处理 →</button>' +
        "</div></td></tr>") +
      "</tbody></table>" +
      '<div class="ic-note">闭环路径：采集加工处理 → 加工产物交接 → 数据标准化（编号 23-27）→ <b>本页数据集入库（编号 28-51）</b> → 主题应用（编号 52-86）。</div>' +
      "</div>";
  }
  function stdPage(key) { return "lowdim-standardization-" + key; }

  function dbBarHtml(pageId, key, view) {
    return '<div class="ic-dbbar" data-ic-dbpage="' + esc(pageId) + '">' +
      '<button type="button" class="' + (view === "meta" ? "active" : "") + '" data-ic-dbview="meta">元数据目录</button>' +
      '<button type="button" class="' + (view === "records" ? "active" : "") + '" data-ic-dbview="records">入库记录</button>' +
      '<span class="hint">入库记录承接标准化归档推送 · 功能清单编号 28-51</span>' +
      "</div>";
  }

  /* ------------------------------ 注入（幂等，抗重渲染冲刷） ------------------------------ */
  function currentPageId() {
    var sec = document.querySelector("section.page.active");
    if (sec && sec.id) return String(sec.id).replace(/^page-/, "");
    return String((typeof state !== "undefined" && state && state.page) || "");
  }

  function injectIngestBar(pageId) {
    /* 2026-10-08 需求：加工处理页面顶部圈红区域（采集加工量指标条 + 数据录入统计/质量控制卡片）
       整体隐藏不再显示，直接跳过注入；数据库页的入库记录逻辑不受影响。 */
    return;
    /* eslint-disable no-unreachable */
    var key = keyOfIngest(pageId);
    var page = document.getElementById("page-" + pageId);
    if (!key || !page) return;
    if (page.querySelector(".ic-bar")) return;
    ensureStyle();
    page.insertAdjacentHTML("afterbegin", quotaBar(key) + statCards(key));
  }

  function injectDbBar(pageId) {
    var key = keyOfDb(pageId);
    var page = document.getElementById("page-" + pageId);
    if (!key || !page) return;
    if (S().dbView === "records") {
      if (!page.querySelector(".ic-rec")) renderDb(pageId);
      return;
    }
    if (page.querySelector(".ic-dbbar")) return;
    ensureStyle();
    page.insertAdjacentHTML("afterbegin", dbBarHtml(pageId, key, "meta"));
  }

  /* 页面内容被原始渲染逻辑重写后重新补挂：加工环切换页签、延迟渲染等场景 */
  var __icMoTimer = null;
  function reassert() {
    var pid = currentPageId();
    if (INGEST_PAGES[pid]) { injectIngestBar(pid); return; }
    if (DB_PAGES[pid]) { injectDbBar(pid); return; }
  }
  function watchDom() {
    if (typeof MutationObserver === "undefined") return;
    var obs = new MutationObserver(function () {
      if (__icMoTimer) clearTimeout(__icMoTimer);
      __icMoTimer = setTimeout(function () {
        try { reassert(); } catch (e) {}
      }, 80);
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  /* ------------------------------ 接管：入库页 ------------------------------ */
  var BASE_INGEST = null;
  function renderIngest(pageId) {
    var key = keyOfIngest(pageId);
    seedOnce(pageId);
    syncHandover();
    if (typeof BASE_INGEST === "function") BASE_INGEST(pageId);
    if (!key) return;
    injectIngestBar(pageId);
  }

  /* ------------------------------ 接管：数据库页 ------------------------------ */
  var BASE_DB = null;
  function renderDb(pageId) {
    var key = keyOfDb(pageId);
    var st = S();
    if (st.dbView === "meta") {
      if (typeof BASE_DB === "function") BASE_DB(pageId);
      injectDbBar(pageId);
      return;
    }
    ensureStyle();
    var page = document.getElementById("page-" + pageId);
    if (!page) return;
    page.innerHTML = dbBarHtml(pageId, key, "records") + renderDbRecords(pageId, key);
  }

  /* ------------------------------ 事件 ------------------------------ */
  function pageIdFrom(el) {
    var host = el && el.closest ? el.closest("[data-ic-dbpage]") : null;
    if (host && host.dataset && host.dataset.icDbpage) return host.dataset.icDbpage;
    var sec = el && el.closest ? el.closest("section.page") : null;
    if (sec && sec.id) return String(sec.id).replace(/^page-/, "");
    return String((typeof state !== "undefined" && state.page) || "");
  }
  function goto(pid) {
    if (!pid) return;
    if (typeof goToPage === "function") { goToPage(pid); return; }
    if (typeof navigateTo === "function") { navigateTo(pid); return; }
    var sec = document.getElementById("page-" + pid);
    if (sec) {
      Array.prototype.forEach.call(document.querySelectorAll("section.page"), function (x) { x.classList.remove("active"); });
      sec.classList.add("active");
      if (typeof state !== "undefined") state.page = pid;
      try { window.scrollTo(0, 0); } catch (e) {}
      if (typeof renderLowdimDatabasePage === "function" && pid.indexOf("lowdim-database-") === 0) renderLowdimDatabasePage(pid);
      if (typeof renderLowdimStandardizationPage === "function" && pid.indexOf("lowdim-standardization-") === 0) renderLowdimStandardizationPage(pid);
      if (typeof renderLowdimIngestPage === "function" && pid.indexOf("lowdim-ingest-") === 0) renderLowdimIngestPage(pid);
    }
  }

  function bindEvents() {
    if (document.body.dataset.icBound === "true") return;
    document.body.dataset.icBound = "true";
    document.addEventListener("click", function (e) {
      var t = e.target;
      if (!t || typeof t.closest !== "function") return;
      var v = t.closest("[data-ic-dbview]");
      if (v) {
        S().dbView = v.dataset.icDbview || "meta";
        renderDb(pageIdFrom(v));
        return;
      }
      var g = t.closest("[data-ic-goto]");
      if (g) { goto(g.dataset.icGoto); return; }
    }, false);
  }

  function patchIngest() {
    var fn = window.renderLowdimIngestPage;
    if (typeof fn !== "function") { setTimeout(patchIngest, 80); return; }
    if (fn.__icPatched) return;
    BASE_INGEST = fn;
    var wrapped = function (pageId) { renderIngest(pageId); };
    wrapped.__icPatched = true;
    window.renderLowdimIngestPage = wrapped;
    try { renderLowdimIngestPage = wrapped; } catch (e) { /* ignore */ }
  }

  function patchDb() {
    var fn = window.renderLowdimDatabasePage;
    if (typeof fn !== "function") { setTimeout(patchDb, 80); return; }
    if (fn.__icPatched) return;
    BASE_DB = fn;
    var wrapped = function (pageId) { renderDb(pageId); };
    wrapped.__icPatched = true;
    window.renderLowdimDatabasePage = wrapped;
    try { renderLowdimDatabasePage = wrapped; } catch (e) { /* ignore */ }
  }

  /* ------------------------------ 电解质专属名词标准化 ------------------------------ */
  function patchTermCategory() {
    var L = window.LOWDIM_STD_LIBRARY;
    if (!L || !L.electrolyte) { setTimeout(patchTermCategory, 120); return; }
    var cats = L.electrolyte.categories;
    if (!Array.isArray(cats)) return;
    if (cats.some(function (c) { return c && c.key === "term"; })) return;
    cats.push({
      key: "term",
      label: "专属名词标准化",
      intro: "统一电解质领域的专属名词、同义词与书写规范，避免因命名差异导致的检索漏检与数据重复。",
      sections: [{ title: "", rules: [
        { id: "term-electrolyte_type", item: "电解质类型命名", field: "term_electrolyte_type", value: "有机电解液 / 固态有机电解质 / 固态无机电解质", type: "字符", basis: "三选一取值，不得自造类型名称；示例：type=固态无机电解质。" },
        { id: "term-subset", item: "子数据集命名", field: "term_subset", value: "醚类/酯类/环状/其他；醚类/酮类/腈类/其他；氧化物型(钙钛矿·石榴石·NASICON·反钙钛矿)/硫化物型/卤化物型/其他", type: "字符", basis: "按主体结构或官能团归集到既定子数据集；示例：subset=硫化物型。" },
        { id: "term-property", item: "物性字段命名", field: "term_property", value: "燃点、闪点、离子电导率、玻璃化转变温度、电化学窗口、迁移能垒等统一中英文与缩写", type: "字符", basis: "字段中英文名与缩写一一对应；示例：property=ionic_conductivity。" },
        { id: "term-synonym", item: "同义词归并", field: "term_synonym", value: "建立主名-别名映射", type: "枚举", basis: "检索时按主名归并，避免重复条目；示例：LGPS = Li10GeP2S12、LLZO = 锂镧锆氧。" },
        { id: "term-unit_notation", item: "单位书写规范", field: "term_unit_notation", value: "S/cm 与 S/m 需注明；K 与 °C 需保留换算记录", type: "单位", basis: "单位换算记录随数据一并入库；示例：conductivity=3.2e-3 S/cm。" }
      ] }]
    });
  }

  /* ------------------------------ 启动 ------------------------------ */
  function boot() {
    ensureStyle();
    bindEvents();
    patchIngest();
    patchDb();
    patchTermCategory();

    /* 初次进入页面时补一次种子与同步，并按需重渲染 */
    var go = function () {
      Object.keys(INGEST_PAGES).forEach(function (pid) { seedOnce(pid); });
      syncHandover();
      reassert();
      var pid = currentPageId();
      if (INGEST_PAGES[pid] && typeof renderLowdimIngestPage === "function") renderLowdimIngestPage(pid);
      if (DB_PAGES[pid] && typeof renderLowdimDatabasePage === "function") renderLowdimDatabasePage(pid);
    };
    [60, 260, 600, 1200, 2000].forEach(function (d) { setTimeout(go, d); });
    watchDom();
    /* 交接动作后同步下游 */
    setInterval(syncHandover, 1500);
  }

  boot();
})();
