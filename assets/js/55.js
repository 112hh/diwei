
(function () {
  if (window.__LOWDIM_AUX_HINT_READY__) return;
  window.__LOWDIM_AUX_HINT_READY__ = true;

  /* 需求条款文案：来自《低维材料主题库》功能清单「二维材料数据采集加工处理」 */
  var AUX_HINTS = {
    volume: {
      title: "采集加工量指标说明",
      sub: "招标要求与任务量统计口径",
      body:
        '<div class="lah-section">' +
          '<h4 class="lah-title">招标指标</h4>' +
          '<ul class="lah-list">' +
            '<li>二维材料数据采集加工量<b>不少于 30,600 条</b>。</li>' +
            '<li>本页第 1 步「采集加工量（条）」为本次任务的计划量，提交后计入总指标统计。</li>' +
          '</ul>' +
        '</div>' +
        '<div class="lah-section">' +
          '<h4 class="lah-title">统计口径</h4>' +
          '<ul class="lah-list">' +
            '<li><b>开源数据获取</b>：开放数据库词条 + 已发表文献整理归纳。</li>' +
            '<li><b>数据购买</b>：商业用途数据库许可采购（商用授权、机构内许可）。</li>' +
            '<li><b>数据计算</b>：第一性原理计算与理论模拟（弥补前两者数据量不足）。</li>' +
            '<li>四条途径采集加工的数据<b>合并计入</b> 30,600 条总指标。</li>' +
          '</ul>' +
        '</div>' +
        '<div class="lah-note">数据计算是拓宽数据库数据量的有力补充，同时为后续的数据更新提供保障。</div>'
    },
    "collection-update": {
      title: "数据更新机制",
      sub: "现有数据条目更新 + 新增数据条目",
      body:
        '<div class="lah-section">' +
          '<h4 class="lah-title">现有数据条目的基础信息更新</h4>' +
          '<ul class="lah-list">' +
            '<li>来源：开源数据库数据和商业数据库购买数据的更新。</li>' +
            '<li>做法：<b>定期</b>将以上数据库的数据同步至低维材料数据库。</li>' +
          '</ul>' +
        '</div>' +
        '<div class="lah-section">' +
          '<h4 class="lah-title">低维材料数据条目的新增</h4>' +
          '<ul class="lah-list">' +
            '<li>对象：新型低维材料数据。</li>' +
            '<li>来源：主要为<b>数据计算</b>，定期将新发现低维材料的各类性质进行计算并更新入库。</li>' +
          '</ul>' +
        '</div>' +
        '<div class="lah-note">质量控制要求：每隔规定时间（30 天）就要将近期计算所得的结果更新进数据库，保障数据的及时性。</div>'
    },
    "collection-audit": {
      title: "数据审核与整合",
      sub: "可信度审核 · 适用性审核 · 数据标准化整合",
      body:
        '<div class="lah-section">' +
          '<h4 class="lah-title">可信度审核</h4>' +
          '<ul class="lah-list">' +
            '<li>将多元途径获得的数据进行<b>交叉比对</b>，确认同一种计算方法和计算参数下同种材料的计算结果具有一致性。</li>' +
            '<li>误差较大的计算结果<b>予以剔除</b>，并通过数据计算的方式提供准确结果后上传。</li>' +
            '<li>一致性较好的数据被认为是可信数据并上传数据库。</li>' +
          '</ul>' +
        '</div>' +
        '<div class="lah-section">' +
          '<h4 class="lah-title">适用性审核</h4>' +
          '<ul class="lah-list">' +
            '<li>整理归纳<b>不同计算方法、不同计算参数</b>下计算结果的差异性。</li>' +
            '<li>结果展示界面提供不同计算方法的结果，并同时提供该结果的<b>计算参数</b>。</li>' +
          '</ul>' +
        '</div>' +
        '<div class="lah-section">' +
          '<h4 class="lah-title">数据整合（标准化）</h4>' +
          '<ul class="lah-list">' +
            '<li>结构与原子坐标 → 统一存储为适用性广的 <b>.cif</b> 文件，调用三维建模软件在界面展示。</li>' +
            '<li>能带结构、态密度等需图片展示的数据 → 统一存储为<b>数据文本</b>，调用绘图软件展示。</li>' +
            '<li>弹性常数、杨氏模量、泊松比等 → 以<b>数字</b>形式存储与调用展示。</li>' +
          '</ul>' +
        '</div>' +
        '<div class="lah-note">整合目的：页面展示便利性 + 使用者下载数据后的使用便利性。</div>'
    },
    "entry-stats": {
      title: "录入统计监测",
      sub: "数据条目数量与占用空间监测系统",
      body:
        '<div class="lah-section">' +
          '<h4 class="lah-title">系统职责</h4>' +
          '<ul class="lah-list">' +
            '<li><b>实时统计</b>数据库内的现有数据。</li>' +
            '<li>以<b>固定周期（30 天）</b>对可能存在的重复数据进行辨别和删除。</li>' +
            '<li>向数据库维护人员汇报：现有数据总量、当前占用硬件空间总量、剩余硬件空间总量。</li>' +
          '</ul>' +
        '</div>' +
        '<div class="lah-section">' +
          '<h4 class="lah-title">用途</h4>' +
          '<div class="lah-grid">' +
            '<div class="lah-cell"><strong>容量管理</strong><span>维护人员依据硬件使用状况，及时管理数据录入与硬件扩容。</span></div>' +
            '<div class="lah-cell"><strong>重复治理</strong><span>周期性识别并清理重复条目，避免冗余占用。</span></div>' +
          '</div>' +
        '</div>'
    },
    "entry-permission": {
      title: "权限管理",
      sub: "数据资源录入权限与用户等级",
      body:
        '<div class="lah-section">' +
          '<h4 class="lah-title">数据资源录入权限</h4>' +
          '<ul class="lah-list">' +
            '<li>管理员拥有数据录入的<b>最高权限</b>，并可授予数据库工作人员读取和修改相应数据库的权限。</li>' +
            '<li><b>普通数据使用者不具有数据录入的权限。</b></li>' +
            '<li>每次数据录入需由数据库工作人员向管理员<b>提出申请</b>，管理员审核批准后授予相应数据的读写权限，再由工作人员录入。</li>' +
          '</ul>' +
        '</div>' +
        '<div class="lah-section">' +
          '<h4 class="lah-title">用户等级划分</h4>' +
          '<div class="lah-grid">' +
            '<div class="lah-cell"><strong>系统管理员</strong><span>拥有对于数据库的最高读写权限。</span></div>' +
            '<div class="lah-cell"><strong>数据库维护员</strong><span>由管理员授予读取和修改相应数据库的权限。</span></div>' +
            '<div class="lah-cell"><strong>高级用户</strong><span>拥有对数据库密集读取数据的权限。</span></div>' +
            '<div class="lah-cell"><strong>普通用户</strong><span>仅拥有对数据库的正常频次的读取权限。</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="lah-note">目的：避免数据录入过程中出现数据重复和数据丢失，并防止过于密集的数据请求对数据库造成过大压力。</div>'
    },
    "entry-process": {
      title: "流程管理",
      sub: "数据库日常运行的四项流程管理",
      body:
        '<div class="lah-section">' +
          '<h4 class="lah-title">四项流程</h4>' +
          '<div class="lah-grid">' +
            '<div class="lah-cell"><strong>人员权限审批</strong><span>对拥有修改数据库权限的工作人员进行培训，确保其满足维护数据库的技术要求及安全意识。</span></div>' +
            '<div class="lah-cell"><strong>数据录入审批</strong><span>对于大规模的数据录入，事先进行数据质量审核，防止错误数据污染数据库。</span></div>' +
            '<div class="lah-cell"><strong>操作工单备案</strong><span>数据录入和删除操作要与操作行为、工单号具体对应，便于出错时回溯时间及负责人员。</span></div>' +
            '<div class="lah-cell"><strong>定期备份</strong><span>尽量减少硬件故障和人员误操作给数据库带来的伤害。</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="lah-note">本页「商业数据库采购 → 提交采购申请」即走「数据录入审批 / 人员权限审批」流程。</div>'
    },
    "security-user": {
      title: "用户身份分级与审核",
      sub: "普通用户 / 专业用户与管理员审核机制",
      body:
        '<div class="lah-section">' +
          '<h4 class="lah-title">访问范围</h4>' +
          '<ul class="lah-list">' +
            '<li>普通用户和专业用户<b>均能够</b>查阅和下载<b>第 1 级</b>数据。</li>' +
            '<li><b>仅专业用户</b>能够查阅和下载<b>第 2 级</b>数据。</li>' +
          '</ul>' +
        '</div>' +
        '<div class="lah-section">' +
          '<h4 class="lah-title">身份流转</h4>' +
          '<ul class="lah-list">' +
            '<li>普通用户需<b>提交申请</b>，并经数据库管理员<b>审核通过</b>后，才能转变为专业用户。</li>' +
            '<li>专业用户身份<b>有使用期限</b>，超过使用期限后自动转变为普通用户。</li>' +
            '<li>延续专业用户身份需提交<b>续期申请</b>，并经数据库管理员审核通过后继续保有。</li>' +
          '</ul>' +
        '</div>' +
        '<div class="lah-note">用户身份区分和数据库管理员审核，为数据安全级别提供保障。</div>'
    }
  };

  function ensureModal() {
    var wrap = document.getElementById("lowdimAuxHintModal");
    if (wrap) return wrap;
    wrap = document.createElement("div");
    wrap.className = "overlay";
    wrap.id = "lowdimAuxHintModal";
    wrap.innerHTML =
      '<div class="modal modal-lg lowdim-aux-modal" role="dialog" aria-modal="true">' +
        '<div class="modal-header">' +
          '<div><h3 id="lowdimAuxHintTitle">说明</h3><p id="lowdimAuxHintSub"></p></div>' +
          '<button class="modal-close" type="button" data-close-lowdim-aux aria-label="关闭说明">&times;</button>' +
        '</div>' +
        '<div class="modal-body modal-scroll" id="lowdimAuxHintBody"></div>' +
        '<div class="modal-footer">' +
          '<button class="btn-primary" type="button" data-close-lowdim-aux>我知道了</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);
    wrap.addEventListener("click", function (e) { if (e.target === wrap) closeModal(); });
    return wrap;
  }

  function closeModal() {
    var wrap = document.getElementById("lowdimAuxHintModal");
    if (wrap) wrap.classList.remove("show");
  }

  function openHint(key) {
    var hint = AUX_HINTS[key];
    if (!hint) return;
    var wrap = ensureModal();
    document.getElementById("lowdimAuxHintTitle").textContent = hint.title;
    document.getElementById("lowdimAuxHintSub").textContent = hint.sub || "";
    document.getElementById("lowdimAuxHintBody").innerHTML = hint.body;
    wrap.classList.add("show");
  }
  window.openLowdimAuxHint = openHint;

  /* ── 附加功能按钮 / 采购申请 / 自动提取：统一委托 ── */
  document.addEventListener("click", function (event) {
    var t = event.target;
    if (!t || !t.closest) return;

    var aux = t.closest("[data-lowdim-aux]");
    if (aux) { event.preventDefault(); openHint(aux.getAttribute("data-lowdim-aux")); return; }

    if (t.closest("[data-close-lowdim-aux]")) { closeModal(); return; }

    var apply = t.closest("[data-twod-purchase-apply]");
    if (apply) {
      var picked = 0;
      try {
        var pid = getTwodWizardPageId(apply);
        picked = (getTwodTaskWizardState(pid).pickedCommercial || []).length;
      } catch (e) { picked = 0; }
      if (!picked) { showToast("提交采购申请", "请至少勾选 1 个商用数据库数据集。"); return; }
      showToast("提交采购申请",
        "已提交 " + picked + " 个商用数据库许可采购申请，进入管理员审批（数据录入审批 / 人员权限审批）。");
      return;
    }

    var auto = t.closest("[data-twod-auto-extract-start]");
    if (auto) {
      showToast("自动化计算提取",
        "已触发 4 个自动化计算与结果提取流程，结果按统一格式回写后进入录入审核。");
      return;
    }
  });

  /* ── 商用数据库勾选：写回向导状态并重渲染 ── */
  document.addEventListener("change", function (event) {
    var t = event.target;
    if (!t || !t.closest) return;
    var pick = t.closest("[data-twod-pick-commercial]");
    if (!pick) return;
    var pageId = getTwodWizardPageId(pick);
    var wizard = getTwodTaskWizardState(pageId);
    var key = "comm-" + pick.getAttribute("data-twod-pick-commercial");
    if (!wizard.pickedCommercial) wizard.pickedCommercial = [];
    var idx = wizard.pickedCommercial.indexOf(key);
    if (pick.checked && idx < 0) wizard.pickedCommercial.push(key);
    if (!pick.checked && idx >= 0) wizard.pickedCommercial.splice(idx, 1);
    if (typeof renderLowdimIngestPage === "function") renderLowdimIngestPage(pageId);
  });
})();
