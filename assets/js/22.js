
    (() => {
      const html = (value) => typeof escapeHtml === "function"
        ? escapeHtml(value)
        : String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

      const camelParam = (value, fallback) => {
        const raw = String(value || "").trim();
        const known = {
          "结构文件索引": "structure_file_id",
          "晶格约束": "lattice_constraints",
          "收敛阈值": "convergence_threshold",
          "自旋设置": "spin_settings",
          "缺陷类型": "defect_type",
          "超胞索引": "supercell_id",
          "层数": "layer_count",
          "堆垛方式": "stacking_mode",
          "特征选择": "feature_columns",
          "结构索引": "structure_id",
          "k 点路径": "k_path",
          "能量范围": "energy_range",
          "材料索引": "material_id",
          "温度区间": "temperature_range",
          "结果类型": "result_type",
          "材料名称": "material_name",
          "外部数据库源": "source_database",
          "字段映射模板": "field_mapping",
          "电解质类型": "electrolyte_type",
          "数据源": "data_source",
          "采集字段": "collect_fields",
          "光电材料数据集": "opto_dataset_id",
          "分类模板": "classification_template",
          "标签体系": "tag_schema",
          "电解质数据集": "electrolyte_dataset_id",
          "分类字段": "classification_fields",
          "标签规则": "tag_rules",
          "参考数据索引": "reference_dataset_id",
          "元素类型": "element_types",
          "拟合区间": "fit_range",
          "势函数模板": "potential_template",
          "分子结构索引": "molecule_structure_id",
          "电荷设置": "charge_settings",
          "分子索引": "molecule_id",
          "多极矩模板": "multipole_template",
          "训练集索引": "training_dataset_id",
          "模型版本": "model_version",
          "返回格式": "response_format",
          "模型索引": "model_id",
          "数据集编号": "dataset_code",
          "回调方式": "callback_mode",
          "输出格式": "output_format",
          "表面索引": "surface_id",
          "反应类型": "reaction_type",
          "吸附物": "adsorbate",
          "目标产物": "target_product",
          "筛选条件": "filter_rules",
          "催化剂索引": "catalyst_id",
          "反应条件": "reaction_conditions",
          "表面模型": "surface_model",
          "反应路径索引": "reaction_path_id",
          "温度": "temperature",
          "环境参数": "environment_parameters",
          "吸附物索引": "adsorbate_id",
          "表面位点": "surface_site"
        };
        return known[raw] || `param_${fallback}`;
      };

      const getAlgorithmPath = (algorithmId) => {
        if (typeof algorithms === "undefined") return null;
        for (const [categoryKey, category] of Object.entries(algorithms)) {
          for (const [subcategoryKey, subcategory] of Object.entries(category.subcategories || {})) {
            const match = (subcategory.algorithms || []).find((item) => item.id === algorithmId);
            if (match) return { categoryKey, category, subcategoryKey, subcategory, algorithm: match };
          }
        }
        return null;
      };

      const splitItems = (value) => String(value || "").split(/[、,，]/).map((item) => item.trim()).filter(Boolean);

      const normalizeEndpoint = (endpoint) => {
        const raw = String(endpoint || "").trim();
        if (!raw) return { method: "POST", path: "/api/v1/algorithms/run" };
        const match = raw.match(/^(GET|POST|PUT|DELETE|PATCH)\s+(.+)$/i);
        return match ? { method: match[1].toUpperCase(), path: match[2].trim() } : { method: "POST", path: raw };
      };

      const getAlgorithmScenario = (path) => {
        const title = path?.category?.title || "";
        const subTitle = path?.subcategory?.title || "";
        if (title.includes("二维材料")) {
          return subTitle.includes("驰豫")
            ? "二维材料结构优化、后续性质计算前处理、数据库结构结果对比"
            : "二维材料性质计算、图谱数据生成、数据库字段自动补全";
        }
        if (title.includes("低维材料")) return "多源低维材料数据采集、数据分类、字段标准化入库";
        if (title.includes("机器学习力场")) return "力场参数拟合、势能面建模、结构能量和受力快速预测";
        if (title.includes("催化材料")) return "催化性能筛选、表面结构预测、反应路径和吸附态分析";
        return "低维材料数据库分析预测、批量调用和结果对比";
      };

      const getAlgorithmFeatureText = (algorithm, path) => {
        const tags = Array.isArray(algorithm.tags) ? algorithm.tags.join("、") : "";
        const status = typeof getAlgorithmStatusText === "function" ? getAlgorithmStatusText(algorithm.status) : algorithm.status;
        return `${tags || path.subcategory.title}；${algorithm.version || "v1.0"}；接口状态${status}`;
      };

      const getRequestRows = (algorithm) => {
        const items = splitItems(algorithm.input);
        return (items.length ? items : ["输入数据索引", "计算参数", "返回格式"]).map((item, index) => ({
          name: camelParam(item, index + 1),
          type: index === 0 ? "string" : "string | array",
          required: index < 2,
          desc: item
        }));
      };

      const getOutputRows = (algorithm) => {
        const items = splitItems(algorithm.output);
        return (items.length ? items : ["任务状态", "结果文件", "摘要报告"]).map((item, index) => ({
          name: camelParam(item, index + 1).replace(/^param_/, "result_"),
          type: index === 0 ? "object" : "string | object",
          desc: item
        }));
      };

      const buildExampleParams = (rows) => {
        const params = {};
        rows.slice(0, 4).forEach((row, index) => {
          if (row.type.includes("array")) params[row.name] = index === 0 ? ["sample_id"] : [row.desc];
          else params[row.name] = index === 0 ? "sample_material_001" : row.desc;
        });
        return JSON.stringify(params, null, 4).replace(/^/gm, "    ");
      };

      const buildAlgorithmApiCode = (algorithm, path, requestRows) => {
        const endpoint = normalizeEndpoint(algorithm.endpoint);
        const paramsBlock = buildExampleParams(requestRows);
        return `# ${algorithm.title}：按数据应用算法接口调用
import json
import requests

url = "https://api.lowdim-materials.local${endpoint.path}"
params = ${paramsBlock.trimStart()}

with open("input_material_data.zip", "rb") as file:
    resp = requests.${endpoint.method.toLowerCase()}(
        url,
        files={"file": file},
        data={"params": json.dumps(params, ensure_ascii=False)}
    )

print(resp.json())`;
      };

      const buildAlgorithmInputExample = (algorithm, path, rows) => {
        return JSON.stringify({
          algorithmName: algorithm.title,
          algorithmType: path.category.title,
          algorithmCategory: path.subcategory.title,
          version: algorithm.version || "v1.0",
          params: rows.reduce((acc, row, index) => {
            acc[row.name] = index === 0 ? "sample_material_001" : row.desc;
            return acc;
          }, {})
        }, null, 2);
      };

      const buildAlgorithmOutputExample = (algorithm, outputRows) => {
        return JSON.stringify({
          status: algorithm.status === "maintenance" ? "maintenance" : "success",
          taskId: `${algorithm.slug || algorithm.id}_task_20260815`,
          algorithmName: algorithm.title,
          results: outputRows.reduce((acc, row) => {
            acc[row.name] = row.desc;
            return acc;
          }, {}),
          updatedAt: algorithm.updatedAt || "2026-08-15"
        }, null, 2);
      };

      const renderRows = (rows, type) => rows.map((row) => `
        <tr>
          <td><code>${html(row.name)}</code></td>
          <td>${html(row.type)}</td>
          ${type === "request" ? `<td>${row.required ? '<span class="algorithm-reference-required">必填</span>' : "否"}</td>` : ""}
          <td>${html(row.desc)}</td>
        </tr>
      `).join("");

      function renderUnifiedAlgorithmDoc(algorithm, path) {
        const requestRows = getRequestRows(algorithm);
        const apiCode = buildAlgorithmApiCode(algorithm, path, requestRows);
        return `
          <div class="algorithm-reference-doc">
            <section class="algorithm-reference-hero">
              <h3>${html(algorithm.title)}</h3>
              <p>${html(algorithm.desc || "该算法用于低维材料数据库分析预测任务，支持通过 API 调用完成批量计算、数据处理和结果回写。")}</p>
              <div class="algorithm-reference-tags">
                <div class="algorithm-reference-tag"><span>功能特点</span>${html(getAlgorithmFeatureText(algorithm, path))}</div>
                <div class="algorithm-reference-tag"><span>适用场景</span>${html(getAlgorithmScenario(path))}</div>
              </div>
            </section>

            <section class="algorithm-reference-section">
              <div class="algorithm-reference-section-head">
                <h4>API 调用示例</h4>
                <button class="algorithm-reference-copy" type="button" data-algorithm-copy-code aria-label="复制 API 调用示例">复制代码</button>
              </div>
              <pre class="algorithm-reference-code" id="algorithmReferenceCode">${html(apiCode)}</pre>
            </section>

            <section class="algorithm-reference-section">
              <div class="algorithm-reference-section-head"><h4>请求参数</h4></div>
              <div class="algorithm-reference-table-wrap">
                <table class="algorithm-reference-table">
                  <thead><tr><th style="width:24%;">参数名</th><th style="width:16%;">类型</th><th style="width:12%;">必填</th><th>说明</th></tr></thead>
                  <tbody>${renderRows(requestRows, "request")}</tbody>
                </table>
              </div>
            </section>
          </div>
        `;
      }

      window.renderUnifiedAlgorithmDocPage = function renderUnifiedAlgorithmDocPage(algorithmId) {
        const path = getAlgorithmPath(algorithmId);
        const algorithm = path?.algorithm || (typeof findAlgorithmById === "function" ? findAlgorithmById(algorithmId) : null);
        if (!algorithm || !path) return "";
        return renderUnifiedAlgorithmDoc(algorithm, path);
      };

      window.renderUnifiedAlgorithmDocModal = function renderAlgorithmDocModalUnifiedReference(algorithmId) {
        const path = getAlgorithmPath(algorithmId);
        const algorithm = path?.algorithm || (typeof findAlgorithmById === "function" ? findAlgorithmById(algorithmId) : null);
        if (!algorithm || !path) return;
        if (typeof state !== "undefined") state.activeAlgorithmResourceId = algorithm.id;

        const title = document.getElementById("algorithmDocTitle");
        const detailTitleNode = document.getElementById("algorithmDetailTitle");
        const detailHeadNode = detailTitleNode?.closest(".algorithm-item-head");
        const detailDescNode = document.getElementById("algorithmDetailDesc");
        const detailTagsNode = document.getElementById("algorithmDetailTags");
        const detailMetaNode = document.getElementById("algorithmDetailMeta");
        const endpointNode = document.getElementById("algorithmEndpointList");
        const maintenanceAlert = document.getElementById("algorithmMaintenanceAlert");

        if (title) title.textContent = `${algorithm.title} - 算法详情`;
        if (detailHeadNode) detailHeadNode.hidden = true;
        if (detailDescNode) detailDescNode.hidden = true;
        if (detailTagsNode) detailTagsNode.hidden = true;
        if (endpointNode) endpointNode.innerHTML = "";
        if (maintenanceAlert) maintenanceAlert.hidden = true;
        if (detailMetaNode) {
          detailMetaNode.className = "algorithm-doc-mount";
          detailMetaNode.innerHTML = renderUnifiedAlgorithmDoc(algorithm, path);
        }
        if (typeof openModal === "function") openModal("algorithmDocModal");
      };

      document.body.addEventListener("click", (event) => {
        const copyButton = event.target.closest?.("[data-algorithm-copy-code]");
        if (!copyButton) return;
        const code = document.getElementById("algorithmReferenceCode")?.textContent || "";
        const done = () => {
          copyButton.textContent = "已复制";
          window.setTimeout(() => { copyButton.textContent = "复制代码"; }, 1600);
          if (typeof showToast === "function") showToast("算法详情", "API 调用示例已复制。");
        };
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(code).then(done).catch(done);
        } else {
          done();
        }
      });
    })();
  