
  (function () {
    "use strict";

    function keepDataTablesSingleLine(scope) {
      var root = scope && scope.querySelectorAll ? scope : document;
      root.querySelectorAll(".page table th, .page table td").forEach(function(cell) {
        cell.style.whiteSpace = "nowrap";
        cell.style.wordBreak = "keep-all";
        if (!cell.hasAttribute("title")) {
          var text = (cell.textContent || "").replace(/\s+/g, " ").trim();
          if (text && text.length > 8) cell.setAttribute("title", text);
        }
      });
      root.querySelectorAll(".page .action-cell, .page .batch-actions, .page .twod-record-inline-actions, .page td:last-child").forEach(function(node) {
        node.style.whiteSpace = "nowrap";
      });
    }

    window.keepDataTablesSingleLine = keepDataTablesSingleLine;

    var materialCards = [
      {
        type: "二维材料",
        title: "二维材料数据",
        description: "用于二维层状材料科研数据录入，实现材料各类性能信息规范归档",
        action: "选择材料"
      },
      {
        type: "有机光电材料",
        title: "有机光电材料",
        description: "收录有机光电相关材料与器件参数，支撑光电方向数据标准化管理",
        action: "选择材料"
      },
      {
        type: "电解质材料",
        title: "电解质材料",
        description: "采集电解液、固态电解质关键性能数据，服务电化学与储能研究",
        action: "选择材料"
      },
      {
        type: "机器学习力场",
        title: "机器学习力场",
        description: "收纳原子模拟相关参数与结构数据，适配计算材料学与真研究",
        action: "选择材料"
      },
      {
        type: "催化材料",
        title: "催化材料",
        description: "录入催化材料性能、实验条件等信息，统一催化实验数据填报规范",
        action: "选择材料"
      }
    ];

    var state = window.__dataSubmitWorkbenchState || {
      step: 1,
      materialType: "二维材料",
      files: [],
      batchMode: false,
      fields: {
        materialName: "",
        formula: "",
        bandGap: "",
        youngsModulus: "",
        source: "",
        methodDescription: ""
      }
    };
    window.__dataSubmitWorkbenchState = state;

    function esc(value) {
      return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
        return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
      });
    }

    function fieldValue(key) {
      return state.fields[key] || "";
    }

    function renderStepper() {
      var stepper = document.querySelector(".data-submit-stepper");
      if (!stepper) return;
      var items = stepper.querySelectorAll(".data-submit-step");
      items.forEach(function (item, index) {
        var number = index + 1;
        item.classList.toggle("is-current", state.step === number);
        item.classList.toggle("is-complete", state.step > number);
        item.setAttribute("aria-current", state.step === number ? "step" : "false");
      });
    }

    function renderStage() {
      var stage = document.querySelector(".data-submit-stage");
      var footer = document.querySelector(".data-submit-footer");
      if (!stage || !footer) return;

      renderStepper();
      if (state.step === 1) {
        stage.innerHTML =
          '<h3 class="data-submit-stage-title">选择材料类型</h3>' +
          '<div class="data-submit-material-grid">' +
          materialCards.map(function (item, index) {
            var selected = state.materialType === item.type;
            return '<article class="data-submit-material-card ' + (selected ? "is-selected" : "") + '" data-material-type="' + esc(item.type) + '">' +
              '<span class="data-submit-folder-tab"></span>' +
              '<span class="data-submit-folder-icon" aria-hidden="true"></span>' +
              '<h4>' + esc(item.title) + '</h4>' +
              '<p>' + esc(item.description) + '</p>' +
              '<button class="data-submit-material-select ' + (selected ? "is-selected" : "") + '" type="button" data-material-select="' + esc(item.type) + '">' + esc(item.action) + '</button>' +
              '</article>';
          }).join("") +
          "</div>";
        footer.innerHTML = '<button class="data-submit-button is-primary" type="button" data-workbench-next>下一步</button>';
      } else if (state.step === 2) {
        stage.innerHTML =
          '<h3 class="data-submit-stage-title">填写材料信息</h3>' +
          '<div class="data-submit-form">' +
            '<div class="data-submit-field"><label for="workbenchMaterialName">材料名称</label><input id="workbenchMaterialName" data-workbench-field="materialName" value="' + esc(fieldValue("materialName")) + '" placeholder="请输入"></div>' +
            '<div class="data-submit-field"><label for="workbenchFormula">化学式</label><input id="workbenchFormula" data-workbench-field="formula" value="' + esc(fieldValue("formula")) + '" placeholder="请输入"></div>' +
            '<div class="data-submit-field"><label for="workbenchBandGap">能带间隙</label><div class="data-submit-input-unit"><input id="workbenchBandGap" data-workbench-field="bandGap" value="' + esc(fieldValue("bandGap")) + '" placeholder="请输入"><span>eV</span></div></div>' +
            '<div class="data-submit-field"><label for="workbenchYoungsModulus">杨氏模量</label><div class="data-submit-input-unit"><input id="workbenchYoungsModulus" data-workbench-field="youngsModulus" value="' + esc(fieldValue("youngsModulus")) + '" placeholder="请输入"><span>Gpa</span></div></div>' +
            '<div class="data-submit-field"><label for="workbenchSource">数据来源</label><select id="workbenchSource" data-workbench-field="source"><option value="">请输入</option><option value="自有数据集">自有数据集</option><option value="公开数据集">公开数据集</option></select></div>' +
            '<div class="data-submit-field is-wide"><label for="workbenchMethod">计算方法与实验条件</label><textarea id="workbenchMethod" data-workbench-field="methodDescription" placeholder="描述计算方法（DFT/GGA-PBE等）、基组、收敛标准等">' + esc(fieldValue("methodDescription")) + '</textarea></div>' +
          "</div>";
        var source = document.getElementById("workbenchSource");
        if (source) source.value = fieldValue("source");
        footer.innerHTML =
          '<button class="data-submit-button is-primary" type="button" data-workbench-next>下一步</button>' +
          '<button class="data-submit-button" type="button" data-workbench-draft>保存草稿</button>';
      } else if (state.step === 3) {
        var files = state.files || [];
        stage.innerHTML =
          '<h3 class="data-submit-stage-title">上传材料附件</h3>' +
          '<div class="data-submit-upload-panel">' +
            '<div class="data-submit-upload-toolbar">' +
              '<button class="data-submit-button is-primary" type="button" data-workbench-file-kind="structure">上传结构/数据附件</button>' +
              '<button class="data-submit-button" type="button" data-workbench-file-kind="visual">上传图谱/结果文件</button>' +
              '<span class="data-submit-format">格式要求：.cif / .vasp / .xsf / .xyz / .csv / .png</span>' +
              '<button class="data-submit-button is-primary" type="button" data-workbench-batch>批量导入</button>' +
            '</div>' +
            '<div class="data-submit-file-zone ' + (files.length ? "has-files" : "") + '" data-workbench-dropzone>' +
              (files.length
                ? '<div class="data-submit-file-list">' + files.map(function (file) {
                    return '<div class="data-submit-file-item" title="' + esc(file.name) + '"><span>' + esc(file.name) + " · " + esc(file.kind) + "</span></div>";
                  }).join("") + "</div>"
                : "已批量导入 0 个文件；提交记录已进入“我的提交”和“入库审核”") +
            "</div>" +
            '<input type="file" hidden multiple data-workbench-input="structure" accept=".cif,.poscar,.vasp,.xsf,.xyz,.mol,.sdf,.pdb,.mol2,.csv,.tsv,.xlsx,.xls,.json,.xml,.txt,.dat,.out,.log,.npz,.h5,.hdf5">' +
            '<input type="file" hidden multiple data-workbench-input="visual" accept=".png,.jpg,.jpeg,.webp,.svg,.csv,.tsv,.json,.txt,.dat,.out,.log">' +
            '<input type="file" hidden multiple data-workbench-input="batch" accept=".cif,.poscar,.vasp,.xsf,.xyz,.mol,.sdf,.pdb,.mol2,.csv,.tsv,.xlsx,.xls,.json,.xml,.txt,.dat,.out,.log,.npz,.h5,.hdf5,.png,.jpg,.jpeg,.webp,.svg,.zip">' +
          "</div>";
        footer.innerHTML =
          '<button class="data-submit-button is-primary" type="button" data-workbench-submit>提交</button>' +
          '<button class="data-submit-button" type="button" data-workbench-cancel>取消</button>' +
          '<button class="data-submit-button" type="button" data-workbench-draft>保存草稿</button>';
      } else {
        stage.innerHTML =
          '<div class="data-submit-success">' +
            '<h3 class="data-submit-stage-title">提交成功</h3>' +
            '<div class="data-submit-success-icon" aria-hidden="true"></div>' +
            '<h4>您已提交成功</h4>' +
            '<p>请前往我的提交列表查看文件状态</p>' +
            '<button class="data-submit-button is-primary" type="button" data-workbench-my-submissions>查看我的提交</button>' +
          "</div>";
        footer.innerHTML = "";
      }
      bindStageInputs();
    }

    function bindStageInputs() {
      document.querySelectorAll("[data-workbench-field]").forEach(function (input) {
        input.addEventListener("input", function () {
          state.fields[input.dataset.workbenchField] = input.value;
        });
        input.addEventListener("change", function () {
          state.fields[input.dataset.workbenchField] = input.value;
        });
      });
      document.querySelectorAll("[data-workbench-input]").forEach(function (input) {
        input.addEventListener("change", function () {
          var kind = input.dataset.workbenchInput;
          var list = Array.from(input.files || []);
          if (!list.length) return;
          state.batchMode = kind === "batch";
          state.files = list.map(function (file) {
            return { name: file.name, size: file.size, kind: kind === "visual" ? "图谱/结果文件" : "结构/数据附件" };
          });
          if (kind === "batch") {
            var legacy = document.getElementById("dataBatchImportInput");
            if (legacy && typeof DataTransfer !== "undefined") {
              try {
                var transfer = new DataTransfer();
                list.forEach(function (file) { transfer.items.add(file); });
                legacy.files = transfer.files;
                legacy.dispatchEvent(new Event("change", { bubbles: true }));
              } catch (error) {}
            }
          }
          renderStage();
        });
      });
      var zone = document.querySelector("[data-workbench-dropzone]");
      if (zone) {
        zone.addEventListener("dragover", function (event) {
          event.preventDefault();
          zone.style.borderColor = "#165DFF";
          zone.style.background = "#f5f8ff";
        });
        zone.addEventListener("dragleave", function () {
          zone.style.borderColor = "";
          zone.style.background = "";
        });
        zone.addEventListener("drop", function (event) {
          event.preventDefault();
          zone.style.borderColor = "";
          zone.style.background = "";
          var files = Array.from(event.dataTransfer.files || []);
          if (!files.length) return;
          state.batchMode = true;
          state.files = files.map(function (file) {
            return { name: file.name, size: file.size, kind: "结构/数据附件" };
          });
          renderStage();
        });
      }
    }

    function showWorkbenchToast(title, message, type) {
      if (typeof window.showToast === "function") window.showToast(title, message, type || "info");
    }

    function setLegacyFormFields() {
      var group = document.querySelector('#page-data-submit .material-form-group[data-material="二维材料"]');
      if (!group) return;
      Object.keys(state.fields).forEach(function (key) {
        var field = group.querySelector('[data-field="' + key + '"]');
        if (field) field.value = state.fields[key] || "";
      });
      var chip = document.querySelector('#page-data-submit .twod-filter-chip');
      if (chip) chip.classList.add("active");
    }

    function withRouteSuppressed(action) {
      var router = window.MarvisRouter;
      if (!router || typeof router.go !== "function") {
        action();
        return;
      }
      var originalGo = router.go;
      var restored = false;
      router.go = function (page) {
        if (page === "page-data-submit" || page === "data-submit" || page === "page-my-submissions" || page === "my-submissions" || page === "page-twod-review" || page === "twod-review") return;
        return originalGo.apply(router, arguments);
      };
      action();
      window.setTimeout(function () {
        if (!restored) {
          restored = true;
          router.go = originalGo;
        }
      }, 1200);
    }

    function submitLegacyForm(isDraft) {
      setLegacyFormFields();
      var selector = isDraft
        ? '#page-data-submit .submit-actions .btn:not(.btn-primary)'
        : '#page-data-submit .submit-actions .btn-primary';
      var button = document.querySelector(selector);
      if (!button) {
        showWorkbenchToast("提交失败", "暂未找到提交控件，请刷新页面后重试", "warning");
        return false;
      }
      withRouteSuppressed(function () {
        button.click();
      });
      return true;
    }

    function attachFilesToLatestRecord() {
      if (!state.files || !state.files.length) return;
      var attachments = state.files.map(function (file) {
        return { name: file.name, kind: file.kind, size: file.size };
      });
      var legacy = document.querySelector("#page-data-submit .material-form-group[data-material='二维材料']");
      if (legacy) {
        legacy.dataset.attachments = JSON.stringify(attachments);
      }
      var records = Array.isArray(window.twodUpdateRecords)
        ? window.twodUpdateRecords
        : (typeof twodUpdateRecords !== "undefined" ? twodUpdateRecords : null);
      if (records && records.length) records[0].attachments = attachments;
    }

    function initWorkbench() {
      var page = document.getElementById("page-data-submit");
      if (!page || page.querySelector(".data-submit-workbench")) return;
      var workbench = document.createElement("div");
      workbench.className = "data-submit-workbench";
      workbench.innerHTML =
        '<div class="data-submit-workbench-head">' +
          '<div class="data-submit-breadcrumb"><span>数据管理</span><span>数据上传</span></div>' +
          '<h2 class="data-submit-title">数据上传</h2>' +
          '<p class="data-submit-desc">统一承接五类材料的数据新增、补充提交与驳回重提；提交后可在“我的提交”查看状态，并由“入库审核”统一审核</p>' +
          '<div class="data-submit-stepper">' +
            '<div class="data-submit-step" data-workbench-step="1" tabindex="0"><span class="data-submit-step-index">1</span><span class="data-submit-step-name">选择材料类型</span><span class="data-submit-step-desc">选择研究材料类别，自动加载对应表单</span></div>' +
            '<div class="data-submit-step" data-workbench-step="2" tabindex="0"><span class="data-submit-step-index">2</span><span class="data-submit-step-name">填写材料信息</span><span class="data-submit-step-desc">录入材料基础信息与电化学性能参数</span></div>' +
            '<div class="data-submit-step" data-workbench-step="3" tabindex="0"><span class="data-submit-step-index">3</span><span class="data-submit-step-name">上传材料附件</span><span class="data-submit-step-desc">上传结构文件、测试图谱与原始数据附件</span></div>' +
            '<div class="data-submit-step" data-workbench-step="4" tabindex="0"><span class="data-submit-step-index">4</span><span class="data-submit-step-name">提交成功</span><span class="data-submit-step-desc">校验全部信息提交表单，进入审核流程</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="data-submit-content"><div class="data-submit-stage"></div></div>' +
        '<div class="data-submit-footer"></div>';
      page.insertBefore(workbench, page.firstChild);

      page.addEventListener("click", function (event) {
        var target = event.target;
        var step = target.closest("[data-workbench-step]");
        if (step) {
          var requested = Number(step.dataset.workbenchStep);
          if (requested <= state.step || requested === state.step + 1 && state.step < 3) {
            if (requested === 2 && state.step === 1) state.step = 2;
            else if (requested === 3 && state.step >= 2) state.step = 3;
            else if (requested === 1) state.step = 1;
            renderStage();
          }
          return;
        }
        var material = target.closest("[data-material-select], [data-material-type]");
        if (material) {
          state.materialType = material.dataset.materialSelect || material.dataset.materialType;
          state.step = 1;
          renderStage();
          return;
        }
        if (target.closest("[data-workbench-next]")) {
          if (state.step === 1) state.step = 2;
          else if (state.step === 2) state.step = 3;
          renderStage();
          return;
        }
        if (target.closest("[data-workbench-file-kind]")) {
          var kindButton = target.closest("[data-workbench-file-kind]");
          var input = page.querySelector('[data-workbench-input="' + kindButton.dataset.workbenchFileKind + '"]');
          if (input) input.click();
          return;
        }
        if (target.closest("[data-workbench-batch]")) {
          var batchInput = page.querySelector('[data-workbench-input="batch"]');
          if (batchInput) batchInput.click();
          return;
        }
        if (target.closest("[data-workbench-draft]")) {
          if (submitLegacyForm(true)) showWorkbenchToast("草稿已保存", "可在“我的提交”中继续编辑此条记录", "success");
          return;
        }
        if (target.closest("[data-workbench-submit]")) {
          if (!state.fields.materialName || !state.fields.formula) {
            showWorkbenchToast("请补充材料信息", "材料名称和化学式为必填项", "warning");
            state.step = 2;
            renderStage();
            return;
          }
          if (state.batchMode && state.files.length > 1) {
            var batchConfirm = document.querySelector("[data-batch-import-confirm]");
            if (batchConfirm) {
              withRouteSuppressed(function () { batchConfirm.click(); });
            }
          } else {
            submitLegacyForm(false);
            window.setTimeout(attachFilesToLatestRecord, 60);
          }
          state.step = 4;
          renderStage();
          showWorkbenchToast("提交成功", "材料数据已进入审核流程", "success");
          return;
        }
        if (target.closest("[data-workbench-cancel]")) {
          state.step = 1;
          state.files = [];
          state.batchMode = false;
          renderStage();
          return;
        }
        if (target.closest("[data-workbench-my-submissions]")) {
          if (window.MarvisRouter && typeof window.MarvisRouter.go === "function") window.MarvisRouter.go("page-my-submissions");
        }
      });

      renderStage();
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function() {
        initWorkbench();
        keepDataTablesSingleLine(document);
      });
    } else {
      initWorkbench();
      keepDataTablesSingleLine(document);
    }
    var singleLineObserver = new MutationObserver(function(mutations) {
      var shouldSync = mutations.some(function(mutation) {
        return Array.prototype.some.call(mutation.addedNodes || [], function(node) {
          return node.nodeType === 1 && (
            node.matches?.("table, tr, td, th, .table-wrap, .page") ||
            node.querySelector?.("table, tr, td, th, .table-wrap")
          );
        });
      });
      if (shouldSync) window.requestAnimationFrame(function() {
        keepDataTablesSingleLine(document);
      });
    });
    if (document.body) {
      singleLineObserver.observe(document.body, { childList: true, subtree: true });
    }
  })();
  