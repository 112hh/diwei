/* =====================================================================
   63-standardization-exec.js
   低维材料数据标准化页 · 执行视图与输出归档
   ---------------------------------------------------------------------
   问题：功能清单第 23-27 项要求的是「对不少于 N 条数据提供标准化加工服务」，
   即一项可执行的服务；原页面只有「规则库 CRUD + 非标准数据检测」，页面文案
   写着「逐条比对并回写标准值」却没有对应界面。同时加工环产物交接单写明
   下游目标为「数据标准化（编号 23-27）」，但标准化页没有承接入口，链断。

   本文件新增两个子视图：
     ② 标准化执行 —— 接收加工产物交接单，按规则库逐条比对，输出
        材料 / 字段 / 当前值 / 标准值 / 判定 / 处理动作，支持
        自动回写、低精度保留、退回加工三种处理，并留存执行日志
     ③ 输出与归档 —— 生成符合标准的 zip 数据包（参数信息 + 图谱信息），
        归档后可一键推进至「数据集入库（编号 28-51）」
   另：电解质补充「专属名词标准化」分类（清单第 25 项八项之一）。
   原则：只包装渲染函数，不改动 04.js / 49.js 既有逻辑。
   ===================================================================== */
(function () {
  "use strict";
  if (window.__STD_EXEC_PATCHED__) return;
  window.__STD_EXEC_PATCHED__ = true;

  /* ------------------------------ 工具 ------------------------------ */
  function esc(v) {
    if (typeof escapeLowDimHtml === "function") return escapeLowDimHtml(v == null ? "" : String(v));
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function toast(t, b) { if (typeof showToast === "function") showToast(t, b); }
  function now() {
    var d = new Date(), p = function (n) { return String(n).padStart(2, "0"); };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) +
      " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  var KEYS = ["twod", "opto", "electrolyte", "mlff", "catalyst"];
  var SHORT = { twod: "二维材料", opto: "有机光电材料", electrolyte: "电解质材料", mlff: "机器学习力场", catalyst: "催化材料" };

  function keyOf(pageId) {
    var p = String(pageId || "");
    for (var i = 0; i < KEYS.length; i++) if (p.indexOf(KEYS[i]) >= 0) return KEYS[i];
    return "twod";
  }
  function lib(key) { return (window.LOWDIM_STD_LIBRARY || {})[key] || null; }

  /* ------------------------------ 不合规项模板 ------------------------------ */
  /* 取自各库标准规则，样例值与采集加工页的合规性校验报告保持一致 */
  var ISSUE_TPL = {
    twod: [
      { material: "MoS2-2H", field: "encut", current: "420 eV", target: "500 eV", reason: "截断能低于标准值" },
      { material: "Graphene-001", field: "functional", current: "LDA", target: "GGA-PBE", reason: "泛函不符合当前标准" },
      { material: "h-BN-003", field: "image_dpi", current: "180 dpi", target: "300 dpi", reason: "图片分辨率低于标准" },
      { material: "WSe2-006", field: "bond_length_unit", current: "nm", target: "Å", reason: "键长单位需转换" },
      { material: "CrI3-002", field: "vdw_correction", current: "未启用", target: "DFT-D3", reason: "层状体系缺范德华修正" }
    ],
    opto: [
      { material: "DPP-DTT", field: "basis_set", current: "STO-3G", target: "def2-SVP", reason: "基组低于标准阈值" },
      { material: "Rubrene", field: "solvent", current: "未声明", target: "真空（显式声明）", reason: "激发能数据不可比" },
      { material: "PM6:Y6", field: "ground_functional", current: "HF", target: "b3lyp", reason: "基态泛函低于标准要求" },
      { material: "P3HT", field: "image_dpi", current: "200 dpi", target: "300 dpi", reason: "图谱分辨率低于标准" },
      { material: "TPD-023", field: "dispersion", current: "未启用", target: "GD3(BJ)", reason: "构象能将系统性偏高" }
    ],
    electrolyte: [
      { material: "LLZO", field: "functional", current: "LDA", target: "PBE / PBEsol", reason: "泛函与本库标准不一致" },
      { material: "Li6PS5Cl", field: "kpoint_density", current: "12 Å⁻¹", target: "20 Å⁻¹", reason: "K 点密度低于标准阈值" },
      { material: "LiFSI-DME", field: "energy_conv", current: "1e-4 eV", target: "1e-5 eV", reason: "能量收敛判据低于精度要求" },
      { material: "PEO-LiTFSI", field: "basis_set", current: "3-21G", target: "6-311G**", reason: "基组低于标准" },
      { material: "LGPS", field: "image_format", current: "png", target: "jpg（RGB / 300 dpi）", reason: "图谱格式与规格不符" }
    ],
    mlff: [
      { material: "H2O-cluster", field: "sampling_ensemble", current: "NVE", target: "NVT / NPT", reason: "未控温不可用于力场训练" },
      { material: "H2O-cluster", field: "sampling_temperature", current: "120 K", target: "200 - 500 K", reason: "采样温度低于标准区间" },
      { material: "CH4-dimer", field: "qc_method", current: "DFT-GGA", target: "CCSD(T) / MP2", reason: "量子化学方法低于标准" },
      { material: "Gly-dipeptide", field: "basis_set", current: "6-31G*", target: "def2-TZVP", reason: "基组低于标准阈值" },
      { material: "PEO-fragment", field: "conformers", current: "320", target: "≥ 1000", reason: "构象数低于标准阈值" }
    ],
    catalyst: [
      { material: "Cu(211)-CO2", field: "encut", current: "350 eV", target: "400 eV", reason: "截断能低于标准阈值" },
      { material: "Cu(111)-COOH", field: "kpoint_density", current: "6 Å⁻¹", target: "12 Å⁻¹", reason: "K 点密度低于标准阈值" },
      { material: "Cu(100)-H", field: "vacuum", current: "8 Å", target: "≥ 12 Å", reason: "真空层低于表面模型标准" },
      { material: "AgCu(210)", field: "functional", current: "LDA", target: "PBE / RPBE", reason: "泛函与本库标准不一致" },
      { material: "Cu(411)-CHO", field: "force_conv", current: "0.08 eV/Å", target: "0.05 eV/Å", reason: "力收敛判据低于精度要求" }
    ]
  };

  /* ------------------------------ 交接单池（跨模块共享） ------------------------------ */
  /* 加工环「发起交接」后由 64-ingest-closure.js 推入本队列 */
  function queue() {
    if (!window.__STD_HANDOVER_QUEUE__) window.__STD_HANDOVER_QUEUE__ = {};
    return window.__STD_HANDOVER_QUEUE__;
  }

  function seedQueue(key) {
    var q = queue();
    if (q[key] && q[key].length) return q[key];
    var tpl = ISSUE_TPL[key] || ISSUE_TPL.twod;
    var libObj = lib(key);
    var target = (libObj && libObj.target) || "-";
    var list = [
      {
        id: "HO-" + key.toUpperCase() + "-2026-0901",
        product: SHORT[key] + "结构特征数据集（V2.0）",
        dataset: (libObj && libObj.database ? libObj.database : SHORT[key] + "数据库"),
        entries: 1240,
        status: "待接收",
        createdAt: "2026-09-01 10:12",
        items: tpl.slice(0, 3).map(function (t, i) {
          return Object.assign({}, t, { id: "IT-" + (i + 1), judge: "不合规", action: "", result: "" });
        })
      },
      {
        id: "HO-" + key.toUpperCase() + "-2026-0915",
        product: SHORT[key] + "计算数据集（V2.0）",
        dataset: (libObj && libObj.database ? libObj.database : SHORT[key] + "数据库"),
        entries: 860,
        status: "标准化中",
        createdAt: "2026-09-15 15:40",
        items: tpl.slice(2, 5).map(function (t, i) {
          return Object.assign({}, t, { id: "IT-" + (i + 1), judge: "不合规", action: "", result: "" });
        })
      }
    ];
    q[key] = list;
    window.__STD_TARGET_HINT__ = window.__STD_TARGET_HINT__ || {};
    window.__STD_TARGET_HINT__[key] = target;
    return list;
  }

  function listOf(key) {
    var q = queue();
    if (!q[key]) return seedQueue(key);
    return q[key];
  }

  function archived() {
    if (!window.__STD_ARCHIVE__) window.__STD_ARCHIVE__ = {};
    return window.__STD_ARCHIVE__;
  }

  function logs() {
    if (!window.__STD_EXEC_LOGS__) window.__STD_EXEC_LOGS__ = {};
    return window.__STD_EXEC_LOGS__;
  }
  function pushLog(key, text) {
    var l = logs();
    if (!l[key]) l[key] = [];
    l[key].unshift({ time: now(), text: text });
    if (l[key].length > 30) l[key].length = 30;
    persist();
  }

  /* ------------------------------ 跨页面持久化（file:// 演示口径） ------------------------------ */
  /* 交接单处理进度、归档数据包与执行日志写入 localStorage，
     避免「标准化页归档 → 跳到数据库页」时状态丢失导致闭环断链。 */
  var STORE_KEY = "lowdim_std_state_v1";
  function persist() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        queue: window.__STD_HANDOVER_QUEUE__ || {},
        archive: window.__STD_ARCHIVE__ || {},
        logs: window.__STD_EXEC_LOGS__ || {}
      }));
    } catch (e) { /* file:// 下不可用则退化为内存态 */ }
  }
  function hydrate() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return;
      var d = JSON.parse(raw);
      if (d && d.queue && Object.keys(d.queue).length) window.__STD_HANDOVER_QUEUE__ = d.queue;
      if (d && d.archive && Object.keys(d.archive).length) window.__STD_ARCHIVE__ = d.archive;
      if (d && d.logs && Object.keys(d.logs).length) window.__STD_EXEC_LOGS__ = d.logs;
    } catch (e) { /* ignore */ }
  }
  function clearPersisted() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
  }
  window.__STD_PERSIST__ = persist;
  window.__STD_HYDRATE__ = hydrate;
  window.__STD_CLEAR__ = clearPersisted;

  /* ------------------------------ 状态 ------------------------------ */
  function S() {
    if (!window.__stdExecState) {
      window.__stdExecState = { view: "rules", openId: "", scanning: false };
    }
    return window.__stdExecState;
  }

  /* ------------------------------ 样式 ------------------------------ */
  function ensureStyle() {
    if (document.getElementById("stdExecPatchStyle")) return;
    var s = document.createElement("style");
    s.id = "stdExecPatchStyle";
    s.textContent = `
      .stdex-bar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 14px;}
      .stdex-bar button{min-height:38px;padding:0 18px;border:1px solid #cfdcee;border-radius:8px;background:#fff;
        color:#33456b;font-weight:700;font-size:14px;cursor:pointer;}
      .stdex-bar button.active{background:#165DFF;border-color:#165DFF;color:#fff;}
      .stdex-bar .stdex-hint{margin-left:auto;font-size:12px;color:#7b8ca6;}
      .stdex-card{border:1px solid #dde6f2;border-radius:10px;background:#fff;padding:18px 20px;
        box-shadow:0 2px 10px rgba(31,55,92,.05);margin-top:14px;}
      .stdex-card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;
        border-bottom:1px solid #eef2f8;padding-bottom:12px;margin-bottom:12px;}
      .stdex-card-head h3{margin:0;font-size:17px;color:#12305c;}
      .stdex-card-head p{margin:6px 0 0;color:#6b7f9c;font-size:13px;line-height:1.7;width:100%;}
      .stdex-table{width:100%;border-collapse:collapse;font-size:13px;}
      .stdex-table th{background:#eaf2ff;color:#165DFF;font-weight:800;text-align:left;padding:10px 12px;
        border:1px solid #dbe5f3;white-space:nowrap;}
      .stdex-table td{padding:10px 12px;border:1px solid #e7edf6;color:#2c4261;line-height:1.65;vertical-align:top;}
      .stdex-tag{display:inline-block;padding:2px 9px;border-radius:999px;font-size:12px;font-weight:700;}
      .stdex-tag.wait{background:#f1f5fa;color:#5b7292;}
      .stdex-tag.doing{background:#fff5e6;color:#b26a00;}
      .stdex-tag.done{background:#eaf6ef;color:#1e7e45;}
      .stdex-tag.back{background:#fdecec;color:#c0392b;}
      .stdex-tag.bad{background:#fdecec;color:#c0392b;}
      .stdex-tag.good{background:#eaf6ef;color:#1e7e45;}
      .stdex-tag.low{background:#fff5e6;color:#b26a00;}
      .stdex-btn{padding:5px 11px;border-radius:6px;border:1px solid #cfdcee;background:#fff;color:#33456b;
        font-size:12px;font-weight:700;cursor:pointer;margin-right:6px;}
      .stdex-btn:hover{border-color:#165DFF;color:#165DFF;}
      .stdex-btn.primary{background:#165DFF;border-color:#165DFF;color:#fff;}
      .stdex-btn.primary:hover{opacity:.9;color:#fff;}
      .stdex-btn[disabled]{opacity:.45;cursor:not-allowed;}
      .stdex-btn.ghost{border-style:dashed;}
      .stdex-empty{padding:26px;text-align:center;color:#8b9bb2;background:#fafbfe;border:1px dashed #dbe3ef;
        border-radius:8px;}
      .stdex-note{margin-top:12px;padding:10px 14px;border-left:4px solid #165DFF;background:#f5f8ff;
        border-radius:0 8px 8px 0;color:#41597f;font-size:13px;line-height:1.7;}
      .stdex-log{margin-top:12px;border:1px solid #e5eaf3;border-radius:8px;background:#fbfcfe;padding:12px 14px;
        max-height:220px;overflow:auto;}
      .stdex-log h4{margin:0 0 8px;font-size:13px;color:#1f3f6b;}
      .stdex-log ul{margin:0;padding-left:18px;font-size:12px;color:#5b7292;line-height:1.9;}
      .stdex-kpis{display:flex;gap:12px;flex-wrap:wrap;margin:0 0 14px;}
      .stdex-kpi{flex:1;min-width:150px;border:1px solid #dde6f2;border-radius:10px;background:#fff;padding:14px 16px;}
      .stdex-kpi b{display:block;font-size:22px;color:#165DFF;line-height:1.2;}
      .stdex-kpi span{font-size:12px;color:#7b8ca6;}
      .stdex-progress{height:8px;border-radius:999px;background:#eef3fb;overflow:hidden;margin-top:8px;}
      .stdex-progress i{display:block;height:100%;background:#165DFF;border-radius:999px;}
      .stdex-row-open{background:#f7fbff !important;}
    `;
    document.head.appendChild(s);
  }

  /* ------------------------------ 命中规则 / 偏差 ------------------------------ */
  /* 命中规则：把比对项的数据字段反查到规则库中的规则 ID，
     让「命中规则 → 处置动作」的映射显性化（需求 23-27 验收可逐条溯源）。 */
  function ruleIdOf(key, field) {
    var libObj = lib(key);
    if (!libObj) return "";
    var hit = "";
    (libObj.categories || []).forEach(function (cat) {
      (cat.sections || []).forEach(function (sec) {
        (sec.rules || []).forEach(function (rule) {
          if (!hit && rule.field && rule.field === field) hit = rule.id;
        });
      });
    });
    return hit || (key + "-" + field);
  }

  function numOf(v) {
    var m = /(-?\d+(?:\.\d+)?)/.exec(String(v == null ? "" : v));
    return m ? parseFloat(m[1]) : null;
  }
  function unitOf(v) {
    var m = /-?\d+(?:\.\d+)?\s*([^\d\s-].*)?/.exec(String(v == null ? "" : v));
    return m && m[1] ? String(m[1]).trim() : "";
  }
  /* 偏差：数值型给出绝对差与相对百分比，非数值型标注「口径不符」 */
  function deviationOf(current, target) {
    var a = numOf(current), b = numOf(target);
    if (a === null || b === null) return { text: "口径不符", cls: "bad" };
    var d = Math.round((a - b) * 1000) / 1000;
    var u = unitOf(target) || unitOf(current);
    var pct = b !== 0 ? Math.round(Math.abs(d / b) * 1000) / 10 : null;
    var text = (d > 0 ? "+" : "") + d + (u ? " " + u : "") +
      (pct === null ? "" : "（" + (d > 0 ? "+" : "−") + pct + "%）");
    return { text: text, cls: Math.abs(pct === null ? 0 : pct) > 20 ? "bad" : "low" };
  }

  /* ------------------------------ 视图：标准化执行 ------------------------------ */
  function statusTag(s) {
    var m = { "待接收": "wait", "标准化中": "doing", "已完成": "done", "已归档": "done", "已退回": "back" };
    return '<span class="stdex-tag ' + (m[s] || "wait") + '">' + esc(s) + "</span>";
  }

  function renderExec(pageId, key) {
    var list = listOf(key);
    var st = S();
    var libObj = lib(key);

    var kpis = (function () {
      var total = 0, bad = 0, fixed = 0;
      list.forEach(function (o) {
        total += o.items.length;
        o.items.forEach(function (it) {
          if (it.action === "回写") fixed++;
          else if (it.action === "低精度") fixed++;
          else bad++;
        });
      });
      return { total: total, bad: bad, fixed: fixed };
    })();

    var rows = list.map(function (o) {
      var open = st.openId === o.id;
      var main =
        "<tr" + (open ? ' class="stdex-row-open"' : "") + ">" +
          "<td>" + esc(o.id) + "</td>" +
          "<td>" + esc(o.product) + "</td>" +
          "<td>" + esc(o.entries) + " 条</td>" +
          "<td>" + o.items.length + " 项</td>" +
          "<td>" + statusTag(o.status) + "</td>" +
          "<td>" + esc(o.createdAt) + "</td>" +
          '<td><button type="button" class="stdex-btn" data-stdex-open="' + esc(o.id) + '">' +
            (open ? "收起" : "展开") + "</button>" +
            (o.status === "待接收"
              ? '<button type="button" class="stdex-btn primary" data-stdex-start="' + esc(o.id) + '">执行比对</button>'
              : "") +
          "</td>" +
        "</tr>";

      if (!open) return main;

      var itemRows = o.items.map(function (it) {
        var judge = it.action
          ? '<span class="stdex-tag ' + (it.action === "退回" ? "bad" : it.action === "低精度" ? "low" : "good") + '">' +
              esc(it.action) + "</span>"
          : '<span class="stdex-tag bad">不合规</span>';
        var acts = it.action
          ? esc(it.result || "已处理")
          : '<button type="button" class="stdex-btn" data-stdex-act="回写" data-stdex-item="' + esc(it.id) +
              '" data-stdex-order="' + esc(o.id) + '">自动回写标准值</button>' +
            '<button type="button" class="stdex-btn" data-stdex-act="低精度" data-stdex-item="' + esc(it.id) +
              '" data-stdex-order="' + esc(o.id) + '">标为低精度保留</button>' +
            '<button type="button" class="stdex-btn" data-stdex-act="退回" data-stdex-item="' + esc(it.id) +
              '" data-stdex-order="' + esc(o.id) + '">退回加工环节</button>';
        var dev = deviationOf(it.current, it.target);
        var rid = ruleIdOf(key, it.field);
        return "<tr><td>" + esc(it.material) + "</td>" +
          '<td><code style="white-space:nowrap;">' + esc(rid) + "</code></td>" +
          "<td><code>" + esc(it.field) + "</code></td>" +
          "<td>" + esc(it.current) + "</td><td>" + esc(it.target) + "</td>" +
          '<td><span class="stdex-tag ' + dev.cls + '">' + esc(dev.text) + "</span></td>" +
          "<td>" + esc(it.reason) + "</td><td>" + judge + "</td><td>" + acts + "</td></tr>";
      }).join("");

      var detail =
        '<tr><td colspan="7" style="padding:0;background:#fbfcfe;">' +
          '<div style="padding:14px 16px;">' +
            '<div style="font-weight:700;color:#1f3f6b;margin-bottom:8px;">比对结果　' +
              '<span style="font-weight:400;color:#7b8ca6;">依据《' + esc((libObj && libObj.standardName) || "") +
              '》规则库逐条比对 · 命中规则可回溯至「标准规则库」页签</span></div>' +
            '<div style="overflow:auto;">' +
            '<table class="stdex-table" style="min-width:980px;"><thead><tr><th>材料</th><th>命中规则</th>' +
            "<th>数据字段</th><th>实际值</th><th>标准值</th><th>偏差</th>" +
            "<th>不合规原因</th><th>判定</th><th>处理动作</th></tr></thead><tbody>" +
            (itemRows || '<tr><td colspan="9" class="stdex-empty">该批次无待处理项</td></tr>') +
            "</tbody></table></div>" +
            (o.status !== "待接收" && o.status !== "已退回"
              ? '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">' +
                  '<button type="button" class="stdex-btn primary" data-stdex-archive="' + esc(o.id) + '">生成标准化数据包并归档</button>' +
                  '<button type="button" class="stdex-btn" data-stdex-todb="' + esc(o.id) + '">推进至数据集入库 →</button>' +
                "</div>"
              : "") +
          "</div>" +
        "</td></tr>";
      return main + detail;
    }).join("");

    var logList = (logs()[key] || []).slice(0, 12).map(function (l) {
      return "<li>" + esc(l.time) + "　" + esc(l.text) + "</li>";
    }).join("");

    return "" +
      '<div class="stdex-kpis">' +
        '<div class="stdex-kpi"><b>' + list.length + '</b><span>待处理交接单</span></div>' +
        '<div class="stdex-kpi"><b>' + kpis.total + '</b><span>比对项总数</span></div>' +
        '<div class="stdex-kpi"><b>' + kpis.fixed + '</b><span>已处理</span></div>' +
        '<div class="stdex-kpi"><b>' + kpis.bad + '</b><span>待处理</span></div>' +
      "</div>" +
      '<div class="stdex-card">' +
        '<div class="stdex-card-head">' +
          "<div><h3>加工产物交接单</h3>" +
          "<p>接收采集加工处理「加工产物交接」环节推送的数据集；按本页规则库逐条比对，不合规项支持自动回写标准值、标为低精度保留或退回加工环节。</p></div>" +
        "</div>" +
        '<table class="stdex-table"><thead><tr><th>交接单号</th><th>加工产物</th><th>数据量</th><th>待比对项</th>' +
        "<th>状态</th><th>交接时间</th><th>操作</th></tr></thead><tbody>" +
        (rows || '<tr><td colspan="7" class="stdex-empty">暂无交接单，可先在采集加工处理页「发起交接」</td></tr>') +
        "</tbody></table>" +
        '<div class="stdex-note">闭环路径：采集加工处理 → 加工产物交接 → <b>本页标准化执行</b> → 输出与归档 → 数据集入库（编号 28-51）→ 主题应用（编号 52-86）。</div>' +
        (logList
          ? '<div class="stdex-log"><h4>执行日志</h4><ul>' + logList + "</ul></div>"
          : "") +
      "</div>";
  }

  /* ------------------------------ 视图：输出与归档 ------------------------------ */
  function renderOutput(pageId, key) {
    var arc = archived()[key] || [];
    var rows = arc.map(function (a) {
      return "<tr><td>" + esc(a.id) + "</td><td>" + esc(a.name) + "</td><td>" + esc(a.entries) + " 条</td>" +
        "<td>" + esc(a.size) + "</td><td>" + esc(a.time) + "</td>" +
        '<td><span class="stdex-tag done">已归档</span></td>' +
        '<td><button type="button" class="stdex-btn" data-stdex-dl="' + esc(a.id) + '">下载 zip</button>' +
        '<button type="button" class="stdex-btn" data-stdex-todb="' + esc(a.orderId) + '">推进至数据集入库 →</button></td></tr>';
    }).join("");

    return "" +
      '<div class="stdex-card">' +
        '<div class="stdex-card-head">' +
          "<div><h3>标准化数据包</h3>" +
          "<p>标准化执行完成的数据集按标准打包：参数信息（文本）+ 图谱信息（jpg，300 dpi / RGB / ≤7.5cm），格式与单位制均以本库标准为准，输出为 zip 数据包。</p></div>" +
        "</div>" +
        '<table class="stdex-table"><thead><tr><th>数据包编号</th><th>名称</th><th>条目数</th><th>大小</th>' +
        "<th>生成时间</th><th>状态</th><th>操作</th></tr></thead><tbody>" +
        (rows || '<tr><td colspan="7" class="stdex-empty">暂无归档数据包，请先在「标准化执行」中完成比对并归档</td></tr>') +
        "</tbody></table>" +
        '<div class="stdex-note">归档后的数据包推送至「数据集入库（编号 28-51）」，入库完成后即可在主题应用中检索与下载。</div>' +
      "</div>";
  }

  /* ------------------------------ 子视图切换条 ------------------------------ */
  function barHtml(pageId, key, view) {
    var libObj = lib(key);
    return '<div class="stdex-bar" data-stdex-page="' + esc(pageId) + '">' +
      '<button type="button" class="' + (view === "rules" ? "active" : "") + '" data-stdex-view="rules">标准规则库</button>' +
      '<button type="button" class="' + (view === "exec" ? "active" : "") + '" data-stdex-view="exec">标准化执行</button>' +
      '<button type="button" class="' + (view === "output" ? "active" : "") + '" data-stdex-view="output">输出与归档</button>' +
      '<span class="stdex-hint">来源：采集加工处理产物交接 · 依据《' +
        esc((libObj && libObj.standardName) || "") + '》</span>' +
      "</div>";
  }

  /* ------------------------------ 主渲染 ------------------------------ */
  function renderPage(pageId, base) {
    var key = keyOf(pageId);
    var st = S();
    var page = document.getElementById("page-" + pageId);
    if (!page) return;

    if (st.view === "rules") {
      if (typeof base === "function") base(pageId);
      var p = document.getElementById("page-" + pageId);
      if (p) p.insertAdjacentHTML("afterbegin", barHtml(pageId, key, "rules"));
      return;
    }

    ensureStyle();
    var libObj = lib(key);
    var body = st.view === "exec" ? renderExec(pageId, key) : renderOutput(pageId, key);
    page.innerHTML = "" +
      '<div class="stdex-wrap">' +
        '<div class="stdex-card" style="margin-top:0;">' +
          '<div class="stdex-card-head"><div><h3>' + esc((libObj && libObj.standardizationName) || "数据标准化") + "</h3>" +
          "<p>依据《" + esc((libObj && libObj.standardName) || "") + "》对" + esc(SHORT[key] || "") +
          "数据执行标准化加工服务，覆盖" + esc((libObj && libObj.cover) || "") + "。</p></div>" +
          '<button type="button" class="stdex-btn ghost" data-stdex-goto="lowdim-ingest-' + esc(key) + '">前往采集加工处理 →</button>' +
          "</div>" +
          barHtml(pageId, key, st.view) +
        "</div>" +
        body +
      "</div>";
  }

  /* ------------------------------ 事件 ------------------------------ */
  function findOrder(key, id) {
    var l = listOf(key);
    for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
    return null;
  }

  function bindEvents() {
    if (document.body.dataset.stdexBound === "true") return;
    document.body.dataset.stdexBound = "true";
    document.addEventListener("click", function (e) {
      var t = e.target;
      if (!t || typeof t.closest !== "function") return;

      var v = t.closest("[data-stdex-view]");
      if (v) {
        S().view = v.dataset.stdexView || "rules";
        var pid = (v.dataset.stdexPage) || pageIdFrom(v);
        if (pid) renderViaBase(pid);
        return;
      }

      var op = t.closest("[data-stdex-open]");
      if (op) {
        var st = S();
        st.openId = (st.openId === op.dataset.stdexOpen) ? "" : op.dataset.stdexOpen;
        renderViaBase(pageIdFrom(op));
        return;
      }

      var startBtn = t.closest("[data-stdex-start]");
      if (startBtn) {
        var key0 = keyOf(pageIdFrom(startBtn));
        var o0 = findOrder(key0, startBtn.dataset.stdexStart);
        if (o0) {
          o0.status = "标准化中";
          S().openId = o0.id;
          pushLog(key0, "交接单 " + o0.id + " 已接收，按规则库执行逐条比对，检出 " + o0.items.length + " 项不合规。");
          toast("标准化执行", "已按规则库完成比对，共检出 " + o0.items.length + " 项不合规。");
          renderViaBase(pageIdFrom(startBtn));
        }
        return;
      }

      var act = t.closest("[data-stdex-act]");
      if (act) {
        var keyA = keyOf(pageIdFrom(act));
        var oA = findOrder(keyA, act.dataset.stdexOrder);
        if (oA) {
          var item = null;
          oA.items.forEach(function (it) { if (it.id === act.dataset.stdexItem) item = it; });
          if (item) {
            var a = act.dataset.stdexAct;
            item.action = a;
            if (a === "回写") {
              item.result = "已回写为 " + item.target;
              item.current = item.target;
              pushLog(keyA, oA.id + " · " + item.material + " 字段 " + item.field + " 已自动回写为标准值 " + item.target + "。");
              toast("自动回写", item.field + " 已回写为 " + item.target);
            } else if (a === "低精度") {
              item.result = "按低精度标注入库";
              pushLog(keyA, oA.id + " · " + item.material + " 字段 " + item.field + " 标注为低精度保留，待重新计算后覆盖。");
              toast("低精度保留", item.field + " 已标注为低精度");
            } else {
              item.result = "已退回加工环节";
              oA.status = "已退回";
              pushLog(keyA, oA.id + " 因 " + item.field + " 不合规，整批退回加工环节，原执行日志保留。");
              toast("退回加工", "批次已退回加工环节");
            }
            var remain = oA.items.filter(function (x) { return !x.action; }).length;
            if (!remain && oA.status !== "已退回") {
              oA.status = "已完成";
              pushLog(keyA, oA.id + " 全部比对项处理完成，可生成标准化数据包。");
            }
            renderViaBase(pageIdFrom(act));
          }
        }
        return;
      }

      var arcBtn = t.closest("[data-stdex-archive]");
      if (arcBtn) {
        var keyB = keyOf(pageIdFrom(arcBtn));
        var oB = findOrder(keyB, arcBtn.dataset.stdexArchive);
        if (oB) {
          oB.status = "已归档";
          var A = archived();
          if (!A[keyB]) A[keyB] = [];
          var pid = "PKG-" + keyB.toUpperCase() + "-" + String(A[keyB].length + 1).padStart(3, "0");
          A[keyB].unshift({
            id: pid, orderId: oB.id, name: oB.product + " · 标准化数据包",
            entries: oB.entries, size: (Math.max(2, Math.round(oB.entries / 260) * 1.0)).toFixed(1) + " MB",
            time: now()
          });
          pushLog(keyB, oB.id + " 已生成标准化数据包 " + pid + "（参数信息 + 图谱信息，zip）。");
          toast("归档完成", "数据包 " + pid + " 已生成");
          renderViaBase(pageIdFrom(arcBtn));
        }
        return;
      }

      var todb = t.closest("[data-stdex-todb]");
      if (todb) {
        var keyC = keyOf(pageIdFrom(todb));
        var pidC = "lowdim-database-" + keyC;
        pushLog(keyC, "已将 " + todb.dataset.stdexTodb + " 推送至数据集入库（" + pidC + "）。");
        toast("推进数据集入库", "已推送至《" + (SHORT[keyC] || "") + "数据库》");
        goto(pidC);
        return;
      }

      var dl = t.closest("[data-stdex-dl]");
      if (dl) { toast("下载数据包", dl.dataset.stdexDl + ".zip 已开始下载（原型演示）"); return; }

      var gt = t.closest("[data-stdex-goto]");
      if (gt) { goto(gt.dataset.stdexGoto); return; }
    }, false);
  }

  function pageIdFrom(el) {
    var host = el && el.closest ? el.closest("[data-stdex-page]") : null;
    if (host && host.dataset && host.dataset.stdexPage) return host.dataset.stdexPage;
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
      Array.prototype.forEach.call(document.querySelectorAll("section.page"), function (x) {
        x.classList.remove("active");
      });
      sec.classList.add("active");
      if (typeof state !== "undefined") state.page = pid;
      try { window.scrollTo(0, 0); } catch (e) {}
      if (typeof renderLowdimDatabasePage === "function" && pid.indexOf("lowdim-database-") === 0) renderLowdimDatabasePage(pid);
      if (typeof renderLowdimIngestPage === "function" && pid.indexOf("lowdim-ingest-") === 0) renderLowdimIngestPage(pid);
    }
  }

  /* ------------------------------ 接管 ------------------------------ */
  var BASE = null;
  function renderViaBase(pageId) {
    if (!pageId) return;
    renderPage(pageId, BASE);
  }

  function patch() {
    var fn = window.renderLowdimStandardizationPage;
    if (typeof fn !== "function") { setTimeout(patch, 80); return; }
    if (fn.__stdexPatched) return;
    BASE = fn;
    var wrapped = function (pageId) {
      renderPage(pageId, BASE);
    };
    wrapped.__stdexPatched = true;
    window.renderLowdimStandardizationPage = wrapped;
    try { renderLowdimStandardizationPage = wrapped; } catch (e) { /* ignore */ }
  }

  function boot() {
    ensureStyle();
    bindEvents();
    hydrate();          /* 先恢复上次会话的交接单进度与归档包 */
    patch();
    KEYS.forEach(function (k) { seedQueue(k); });
    var go = function () {
      var st = S();
      if (st.view === "rules") return;
      var sec = document.querySelector("section.page.active");
      if (!sec) return;
      var pid = String(sec.id || "").replace(/^page-/, "");
      if (pid.indexOf("lowdim-standardization-") !== 0) return;
      renderViaBase(pid);
    };
    [80, 300, 700, 1400, 2400].forEach(function (d) { setTimeout(go, d); });
  }

  boot();
})();
