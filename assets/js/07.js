
    (function applyUnifiedMaterialClosure() {
      const optoWorkflowCategoriesUnified = [
        { key: "OLED", label: "OLED 材料" },
        { key: "OPV", label: "OPV 材料" }
      ];

      const optoPersonalLibraryUnified = [
        {
          id: "opto-lib-01",
          uploadedAt: "2026-04-22 10:18",
          fileName: "tpd_emission_curve.xlsx",
          fileSizeText: "1.24 MB",
          sizeBytes: 1300234,
          category: "OLED",
          sourceType: "分子发光寿命数据",
          sourceFormat: "XLSX",
          fileCategory: "草稿",
          reviewStatus: "",
          materialName: "",
          materialType: "",
          dataSource: "项目组上传",
          dataDescription: "",
          visibility: "private"
        },
        {
          id: "opto-lib-02",
          uploadedAt: "2026-04-21 16:42",
          fileName: "y6_uv_pl_mapping.json",
          fileSizeText: "688 KB",
          sizeBytes: 704512,
          category: "OPV",
          sourceType: "光谱关联数据",
          sourceFormat: "JSON",
          fileCategory: "数据处理更新",
          reviewStatus: "正在审核",
          materialName: "Y6",
          materialType: "非富勒烯受体",
          dataSource: "文献整理",
          dataDescription: "Y6 紫外吸收与发射响应关联数据，待专家复核。",
          visibility: "private"
        },
        {
          id: "opto-lib-03",
          uploadedAt: "2026-04-20 09:36",
          fileName: "alq3_quantum_yield.csv",
          fileSizeText: "412 KB",
          sizeBytes: 421888,
          category: "OLED",
          sourceType: "发光寿命数据",
          sourceFormat: "CSV",
          fileCategory: "数据处理更新",
          reviewStatus: "审核通过",
          materialName: "Alq3",
          materialType: "发光材料",
          dataSource: "实验测量",
          dataDescription: "Alq3 发射峰位与寿命测试数据，已完成入库。",
          visibility: "public"
        },
        {
          id: "opto-lib-04",
          uploadedAt: "2026-04-19 13:08",
          fileName: "p3ht_spectra_notes.docx",
          fileSizeText: "356 KB",
          sizeBytes: 364544,
          category: "OPV",
          sourceType: "光谱测试说明",
          sourceFormat: "DOCX",
          fileCategory: "数据处理更新",
          reviewStatus: "审核不通过",
          materialName: "P3HT",
          materialType: "聚合物给体",
          dataSource: "项目组上传",
          dataDescription: "光谱测试说明缺少原始测试条件，需补充。",
          visibility: "private"
        }
      ];

      const mlffWorkflowTypesUnified = [
        { key: "charge", label: "电荷参数数据" },
        { key: "multipole", label: "多极矩数据" },
        { key: "topology", label: "拓扑结构文件" },
        { key: "training", label: "训练样本数据" }
      ];

      const mlffPersonalLibraryUnified = [
        {
          id: "mlff-lib-01",
          uploadedAt: "2026-04-21 11:28",
          fileName: "water_charge_dataset.json",
          fileSizeText: "612 KB",
          sizeBytes: 626688,
          category: "charge",
          sourceType: "电荷参数数据",
          sourceFormat: "JSON",
          fileCategory: "草稿",
          reviewStatus: "",
          materialName: "",
          materialType: "",
          dataSource: "项目组上传",
          dataDescription: "",
          visibility: "private"
        },
        {
          id: "mlff-lib-02",
          uploadedAt: "2026-04-20 15:06",
          fileName: "benzene_multipole_profile.csv",
          fileSizeText: "438 KB",
          sizeBytes: 448512,
          category: "multipole",
          sourceType: "多极矩数据",
          sourceFormat: "CSV",
          fileCategory: "数据处理更新",
          reviewStatus: "正在审核",
          materialName: "Benzene",
          materialType: "芳香小分子",
          dataSource: "理论计算",
          dataDescription: "苯分子多极矩参数与能量摘要文件。",
          visibility: "private"
        },
        {
          id: "mlff-lib-03",
          uploadedAt: "2026-04-19 17:14",
          fileName: "ethanol_topology.xml",
          fileSizeText: "282 KB",
          sizeBytes: 288768,
          category: "topology",
          sourceType: "拓扑结构文件",
          sourceFormat: "XML",
          fileCategory: "数据处理更新",
          reviewStatus: "审核通过",
          materialName: "Ethanol",
          materialType: "有机小分子",
          dataSource: "外部数据库关联",
          dataDescription: "乙醇拓扑结构及键连关系，已通过审核。",
          visibility: "public"
        },
        {
          id: "mlff-lib-04",
          uploadedAt: "2026-04-18 09:52",
          fileName: "acetamide_training_set.zip",
          fileSizeText: "1.86 MB",
          sizeBytes: 1950351,
          category: "training",
          sourceType: "训练样本数据",
          sourceFormat: "ZIP",
          fileCategory: "数据处理更新",
          reviewStatus: "审核不通过",
          materialName: "Acetamide",
          materialType: "极性分子样本",
          dataSource: "项目组上传",
          dataDescription: "训练样本缺少部分标签字段，需要补录。",
          visibility: "private"
        }
      ];

      const materialConversionModules = {
        twod: {
          title: "二维材料文件转换",
          eyebrow: "二维材料数据应用",
          desc: "支持二维材料结构文件、计算结果和图谱源数据的格式统一化转换，转换结果可继续下载或作为更新记录维护。",
          materialLabel: "二维材料",
          materialOptions: () => twodMaterials.map((item) => ({ id: item.id, label: `${item.name} / ${item.formula}` })),
          defaultMaterialId: () => state.selectedMaterialId || twodMaterials[0]?.id || ""
        },
        electrolyte: {
          title: "电解质材料文件转换",
          eyebrow: "电解质材料数据应用",
          desc: "支持从系统内电解质材料结构文件、计算结果和图谱源数据记录发起格式统一化转换，结果可继续下载或作为更新记录维护。",
          materialLabel: "电解质材料",
          materialOptions: () => electrolyteMaterials.map((item) => ({ id: item.id, label: `${item.name} / ${item.formula}` })),
          defaultMaterialId: () => state.selectedElectrolyteId || electrolyteMaterials[0]?.id || ""
        },
        opto: {
          title: "有机光电材料文件转换",
          eyebrow: "有机光电材料应用",
          desc: "支持从系统内有机光电材料结构文件、计算数据与表征图谱源数据记录发起转换，统一输出标准文件并保留转换记录。",
          materialLabel: "有机光电材料",
          materialOptions: () => optoMaterials.map((item) => ({ id: item.id, label: `${item.name} / ${item.formula}` })),
          defaultMaterialId: () => state.selectedOptoId || optoMaterials[0]?.id || ""
        },
        mlff: {
          title: "机器学习力场文件转换",
          eyebrow: "机器学习力场应用",
          desc: "支持从系统内力场样本、拓扑结构、计算标签和可视化源数据记录发起标准化转换，生成结果可回查和下载。",
          materialLabel: "力场材料",
          materialOptions: () => mlffMaterials.map((item) => ({ id: item.id, label: `${item.name} / ${item.formula}` })),
          defaultMaterialId: () => state.selectedMlffId || mlffMaterials[0]?.id || ""
        },
        catalyst: {
          title: "催化材料文件转换",
          eyebrow: "催化材料应用",
          desc: "支持从系统内催化材料结构文件、反应计算结果和可视化文件源数据记录发起转换，输出文件可用于后续建模与分析。",
          materialLabel: "催化材料",
          materialOptions: () => catalystMaterials.map((item) => ({ id: item.id, label: `${item.name} / ${item.formula}` })),
          defaultMaterialId: () => state.selectedCatalystId || catalystMaterials[0]?.id || ""
        }
      };

      const materialConversionTypeDescriptions = {
        "结构文件": "用户可上传已有二维材料的结构文件进行格式转换，如将 CIF 文件转换为 POSCAR。",
        "计算数据": "用户可上传已有的二维材料计算结果数据，完成格式统一化转换。",
        "可视化文件": "用户可上传已有可视化文件的源数据，将其转换为统一格式的可视化图像。"
      };

      const materialConversionTargetFormats = {
        "结构文件": ["POSCAR", "CIF", "VASP", "XYZ", "PDB"],
        "计算数据": ["JSON", "CSV", "YAML", "HDF5", "NPZ"],
        "可视化文件": ["PNG", "SVG", "TIFF", "JSON", "CSV"]
      };

      const materialConversionRecords = [
        { id: "conv-twod-001", module: "twod", materialId: "2D-MoS2-001", materialName: "MoS2", fileType: "结构文件", sourceName: "MoS2_2H.cif", sourceFormat: "CIF", targetFormat: "POSCAR", resultName: "MoS2_2H.POSCAR", status: "已完成", createdAt: "2026-06-23 10:15", operator: "平台用户", remark: "结构文件格式转换，已生成 VASP 输入结构。" },
        { id: "conv-twod-002", module: "twod", materialId: "2D-Graphene-002", materialName: "Graphene", fileType: "计算数据", sourceName: "graphene_band.csv", sourceFormat: "CSV", targetFormat: "JSON", resultName: "graphene_band.JSON", status: "已完成", createdAt: "2026-06-22 14:30", operator: "平台用户", remark: "计算结果字段已完成统一化映射。" },
        { id: "conv-twod-003", module: "twod", materialId: "2D-hBN-003", materialName: "h-BN", fileType: "可视化文件", sourceName: "hbn_dos_source.csv", sourceFormat: "CSV", targetFormat: "SVG", resultName: "hbn_dos_source.SVG", status: "已完成", createdAt: "2026-06-21 09:00", operator: "平台用户", remark: "图谱源数据已转换为统一可视化图像。" },
        { id: "conv-opto-001", module: "opto", materialId: "OP-001", materialName: "TPD", fileType: "可视化文件", sourceName: "tpd_uv_spectrum.csv", sourceFormat: "CSV", targetFormat: "SVG", resultName: "tpd_uv_spectrum.SVG", status: "已完成", createdAt: "2026-06-20 11:22", operator: "平台用户", remark: "UV 图谱源数据已生成标准 SVG。" },
        { id: "conv-electrolyte-001", module: "electrolyte", materialId: "ELY-001", materialName: "LiPF6 EC/DMC", fileType: "计算数据", sourceName: "lipf6_conductivity.xlsx", sourceFormat: "XLSX", targetFormat: "JSON", resultName: "lipf6_conductivity.JSON", status: "已完成", createdAt: "2026-06-19 15:08", operator: "平台用户", remark: "电导率计算结果已转换为 JSON。" },
        { id: "conv-mlff-001", module: "mlff", materialId: "ML-001", materialName: "Water", fileType: "拓扑文件", sourceName: "water_topology.pdb", sourceFormat: "PDB", targetFormat: "XYZ", resultName: "water_topology.XYZ", status: "已完成", createdAt: "2026-06-18 16:40", operator: "平台用户", remark: "拓扑结构已转换为 XYZ 坐标文件。" },
        { id: "conv-mlff-002", module: "mlff", materialId: "ML-002", materialName: "Benzene", fileType: "拓扑文件", sourceName: "benzene_topology.xyz", sourceFormat: "XYZ", targetFormat: "MOL2", resultName: "benzene_topology.MOL2", status: "已完成", createdAt: "2026-06-17 14:22", operator: "平台用户", remark: "苯分子拓扑文件已转换为 MOL2 格式。" },
        { id: "conv-mlff-003", module: "mlff", materialId: "ML-003", materialName: "Ethanol", fileType: "力场文件", sourceName: "ethanol_multipole.csv", sourceFormat: "CSV", targetFormat: "XML", resultName: "ethanol_multipole.XML", status: "已完成", createdAt: "2026-06-16 10:08", operator: "平台用户", remark: "多极矩参数已转换为 XML 格式。" },
        { id: "conv-mlff-004", module: "mlff", materialId: "ML-001", materialName: "Water", fileType: "力场文件", sourceName: "water_charge_dataset.json", sourceFormat: "JSON", targetFormat: "TXT", resultName: "water_charge_dataset.TXT", status: "已完成", createdAt: "2026-06-15 09:30", operator: "平台用户", remark: "电荷参数已转换为 TXT 格式。" },
        { id: "conv-catalyst-001", module: "catalyst", materialId: "CAT-PT-111-001", materialName: "Pt(111)", fileType: "结构文件", sourceName: "pt111_surface.cif", sourceFormat: "CIF", targetFormat: "POSCAR", resultName: "pt111_surface.POSCAR", status: "已完成", createdAt: "2026-06-17 10:30", operator: "平台用户", remark: "表面结构已转换为 POSCAR。" }
      ];
      window.__materialConversionRecords = materialConversionRecords;

      function ensureUnifiedClosureStyles() {
        if (document.getElementById("unifiedClosureStyles")) return;
        const style = document.createElement("style");
        style.id = "unifiedClosureStyles";
        style.textContent = `
          .module-tab-strip {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px;
            border: 1px solid #d8e3f6;
            border-radius: 14px;
            background: linear-gradient(180deg, #ffffff 0%, #f6f9ff 100%);
            box-shadow: 0 10px 24px rgba(21, 67, 146, 0.06);
            margin-bottom: 18px;
          }
          .module-tab-btn {
            min-width: 124px;
            padding: 10px 18px;
            border: 0;
            border-radius: 10px;
            background: transparent;
            color: #60738f;
            font-size: 14px;
            line-height: 22px;
            font-weight: 700;
            cursor: pointer;
            transition: background .18s ease, color .18s ease, box-shadow .18s ease;
          }
          .module-tab-btn.active {
            background: linear-gradient(135deg, #2453d4 0%, #4b80e4 100%);
            color: #fff;
            box-shadow: 0 10px 20px rgba(36, 83, 212, 0.24);
          }
          .module-update-shell {
            display: grid;
            gap: 16px;
          }
          .module-update-summary {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
          }
          .module-update-card {
            padding: 18px 20px;
            border: 1px solid #d8e3f6;
            border-radius: 16px;
            background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
            box-shadow: 0 10px 24px rgba(21, 67, 146, 0.05);
          }
          .module-update-card span {
            display: block;
            margin-bottom: 6px;
            color: #6c809a;
            font-size: 12px;
            line-height: 18px;
          }
          .module-update-card strong {
            display: block;
            color: #1d3358;
            font-size: 22px;
            line-height: 30px;
            font-weight: 800;
          }
          .module-update-card p {
            margin: 6px 0 0;
            color: #6b7f9a;
            font-size: 12px;
            line-height: 18px;
          }
          .module-update-panel {
            border: 1px solid #d8e3f6;
            border-radius: 18px;
            background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
            box-shadow: 0 12px 28px rgba(21, 67, 146, 0.06);
            overflow: hidden;
          }
          .module-update-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 18px;
            padding: 22px 24px 18px;
            border-bottom: 1px solid #e2eaf6;
          }
          .module-update-head h3 {
            margin: 0 0 6px;
            color: #1f3150;
            font-size: 20px;
            line-height: 28px;
          }
          .module-update-head p {
            margin: 0;
            color: #6d819d;
            font-size: 13px;
            line-height: 22px;
          }
          .module-update-actions {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
          }
          .module-update-table table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          .module-update-table th,
          .module-update-table td {
            padding: 12px 14px;
            border-bottom: 1px solid #edf2fb;
            text-align: left;
            font-size: 13px;
            line-height: 21px;
            color: #24395b;
            vertical-align: top;
            word-break: break-word;
            background: #fff;
          }
          .module-update-table th {
            color: #5f7591;
            font-size: 12px;
            line-height: 18px;
            font-weight: 700;
            background: #f8fbff;
          }
          .module-update-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 16px 24px 20px;
            color: #667a96;
            font-size: 12px;
            line-height: 18px;
          }
          .module-empty {
            padding: 28px 24px;
            color: #68809f;
            font-size: 13px;
            line-height: 22px;
            text-align: center;
          }
          .workflow-preview-box .record-meta-pill,
          .module-update-table .record-meta-pill {
            display: inline-flex;
            align-items: center;
            padding: 4px 10px;
            border-radius: 999px;
            background: #eaf2ff;
            color: #274b87;
            font-size: 12px;
            line-height: 18px;
            font-weight: 700;
          }
          @media (max-width: 980px) {
            .module-update-summary {
              grid-template-columns: 1fr;
            }
            .module-update-head {
              flex-direction: column;
            }
            .module-tab-strip {
              width: 100%;
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
            .module-tab-btn {
              min-width: 0;
            }
          }
        `;
        document.head.appendChild(style);
      }

      function ensureMaterialConversionStyles() {
        if (document.getElementById("materialConversionStyles")) return;
        const style = document.createElement("style");
        style.id = "materialConversionStyles";
        style.textContent = `
          .material-convert-shell {
            display: grid;
            gap: 18px;
          }
          .material-convert-head {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            align-items: flex-start;
            margin-bottom: 18px;
          }
          .material-convert-head h3 {
            margin: 4px 0 8px;
            color: #18325d;
            font-size: 22px;
            line-height: 30px;
          }
          .material-convert-head p {
            margin: 0;
            color: #5f7393;
            font-size: 14px;
            line-height: 24px;
          }
          .material-convert-grid {
            display: grid;
            grid-template-columns: minmax(280px, 0.9fr) minmax(0, 1.1fr);
            gap: 16px;
            align-items: stretch;
          }
          .material-convert-drop {
            min-height: 238px;
            padding: 22px;
            border: 1px dashed #9eb9e6;
            border-radius: 14px;
            background: linear-gradient(180deg, #f8fbff, #eef5ff);
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 12px;
          }
          .material-convert-drop.is-upload {
            align-items: center;
            text-align: center;
            background: #fff;
            border-color: #9fbcff;
            border-radius: 6px;
          }
          .material-convert-drop strong {
            color: #18325d;
            font-size: 17px;
            line-height: 24px;
          }
          .material-convert-drop span,
          .material-convert-type-note {
            color: #607492;
            font-size: 13px;
            line-height: 22px;
          }
          .material-convert-upload-btn {
            min-width: 206px;
            height: 40px;
            border: 1px solid #b8cdf8;
            border-radius: 4px;
            background: linear-gradient(180deg, #dce9ff 0%, #bcd3ff 100%);
            color: #145cf5;
            font-size: 14px;
            font-weight: 800;
            cursor: pointer;
          }
          .material-convert-workbench {
            border: 1px solid #c8dcff;
            border-radius: 4px;
            background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
            padding: 24px 20px 20px;
          }
          .material-convert-workbench .material-convert-head {
            margin-bottom: 18px;
            padding-bottom: 14px;
            border-bottom: 1px solid #e0e7f4;
          }
          .material-convert-workbench .material-convert-head h3 {
            margin: 0;
            color: #0b1020;
            font-size: 20px;
            line-height: 30px;
          }
          .material-convert-workbench .material-convert-head p {
            font-size: 13px;
            line-height: 22px;
          }
          .material-convert-workbench .material-convert-type-row {
            border-bottom: 1px solid #dfe7f3;
            gap: 24px;
            margin-bottom: 10px;
          }
          .material-convert-workbench .material-convert-type {
            min-height: 34px;
            padding: 0 0 8px;
            border: 0;
            border-radius: 0;
            background: transparent;
            color: #606f85;
            font-weight: 700;
          }
          .material-convert-workbench .material-convert-type.active {
            color: #145cf5;
            background: transparent;
            box-shadow: inset 0 -2px 0 #145cf5;
          }
          .material-convert-record-title {
            display: flex;
            align-items: baseline;
            gap: 14px;
            margin-bottom: 12px;
          }
          .material-convert-record-title h3 {
            margin: 0;
            color: #0b1020;
            font-size: 20px;
            line-height: 28px;
          }
          .material-convert-record-title p {
            margin: 0;
            color: #607492;
            font-size: 13px;
            line-height: 22px;
          }
          .material-convert-record-card {
            box-shadow: none;
            border: 0;
            background: transparent;
            padding: 0;
          }
          .material-convert-record-card .table-wrap {
            border: 0;
            border-radius: 0;
            background: #fff;
            overflow: hidden;
          }
          .material-convert-record-card .twod-result-table {
            border-collapse: collapse;
            table-layout: auto;
          }
          .material-convert-record-card .twod-result-table th {
            height: 40px;
            padding: 10px 16px;
            border-bottom: 0;
            background: #f4f6fa;
            color: #4f5f76;
            font-size: 13px;
            line-height: 20px;
            font-weight: 800;
          }
          .material-convert-record-card .twod-result-table td {
            height: 52px;
            padding: 12px 16px;
            border-bottom: 1px solid #edf1f7;
            color: #27364f;
            font-size: 13px;
            line-height: 20px;
            background: #fff;
          }
          .material-convert-record-card .twod-result-table th:first-child,
          .material-convert-record-card .twod-result-table td:first-child {
            width: 154px;
            min-width: 154px;
            white-space: nowrap;
          }
          .material-convert-record-card .twod-result-table tbody tr:hover td {
            background: #f8fbff;
          }
          .material-convert-record-card .status-badge {
            border: 0;
            background: transparent;
            color: #4d5f7a;
            padding: 0;
            font-weight: 700;
          }
          .material-convert-record-card .table-actions {
            display: inline-flex;
            align-items: center;
            gap: 12px;
          }
          .material-convert-record-card .table-actions .btn,
          .material-convert-record-card .table-actions .btn-sm {
            min-height: auto;
            height: auto;
            padding: 0;
            border: 0;
            background: transparent;
            color: #145cf5;
            box-shadow: none;
            font-size: 13px;
            line-height: 20px;
            font-weight: 700;
          }
          .material-convert-record-card .table-actions .btn:hover,
          .material-convert-record-card .table-actions .btn-sm:hover {
            color: #0f43c8;
            text-decoration: underline;
          }
          .material-convert-record-toolbar {
            display: grid;
            grid-template-columns: minmax(280px, 1fr) 250px 250px auto;
            gap: 14px;
            align-items: center;
            margin: 12px 0 14px;
          }
          .material-convert-record-search,
          .material-convert-filter-field {
            height: 34px;
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 0;
          }
          .material-convert-record-search input,
          .material-convert-filter-field select {
            width: 100%;
            height: 34px;
            border: 1px solid #E5E6EB;
            border-radius: 4px;
            background: #fff;
            color: #27364f;
            font-size: 13px;
            line-height: 20px;
          }
          .material-convert-record-search input {
            padding: 0 12px;
          }
          .material-convert-filter-field span {
            flex: none;
            color: #27364f;
            font-size: 13px;
            font-weight: 700;
          }
          .material-convert-filter-field select {
            padding: 0 30px 0 12px;
          }
          .material-convert-record-actions {
            display: inline-flex;
            gap: 10px;
            align-items: center;
            justify-content: flex-end;
          }
          .material-convert-record-actions .btn-primary,
          .material-convert-record-actions .btn {
            height: 34px;
            min-height: 34px;
            padding: 0 18px;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 700;
          }
          .material-convert-record-actions .btn {
            border-color: #eef1f6;
            background: #f4f6f9;
            color: #607086;
          }
          .material-convert-record-footer {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 16px;
            padding: 12px 0 0;
            color: #2f3f58;
            font-size: 13px;
            line-height: 22px;
          }
          .material-convert-record-pager {
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }
          .material-convert-record-pager button,
          .material-convert-record-page-size {
            min-width: 32px;
            height: 32px;
            border: 0;
            border-radius: 4px;
            background: transparent;
            color: #2f3f58;
            font-size: 13px;
          }
          .material-convert-record-pager button.active {
            background: #e8f1ff;
            color: #145cf5;
            font-weight: 800;
          }
          .material-convert-record-pager button:disabled {
            color: #b7c1d1;
          }
          .material-convert-record-page-size {
            min-width: 82px;
            padding: 0 8px;
            background: var(--color-bg-table-head, #f5f5f5);
          }
          .material-convert-type-row {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin: 0 0 12px;
          }
          .material-convert-type {
            min-height: 40px;
            padding: 0 14px;
            border: 1px solid #d8e3f6;
            border-radius: 999px;
            background: #fff;
            color: #3e5578;
            font-weight: 700;
            cursor: pointer;
          }
          .material-convert-type.active {
            border-color: #2f73ff;
            background: #eaf2ff;
            color: #225fe0;
          }
          .material-convert-form {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
          }
          .material-convert-form .field {
            margin: 0;
          }
          .material-convert-summary {
            margin-top: 14px;
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 10px;
          }
          .material-convert-summary-item {
            min-height: 74px;
            padding: 12px;
            border: 1px solid #e3ebf8;
            border-radius: 10px;
            background: #f8fbff;
          }
          .material-convert-summary-item span {
            display: block;
            color: #7185a5;
            font-size: 12px;
            line-height: 18px;
            margin-bottom: 4px;
          }
          .material-convert-summary-item strong {
            display: block;
            color: #18325d;
            font-size: 14px;
            line-height: 20px;
            word-break: break-all;
          }
          .material-convert-record-tools {
            display: grid;
            grid-template-columns: minmax(240px, 1fr) 180px 180px auto;
            gap: 12px;
            align-items: end;
            margin: 16px 0;
          }
          .material-convert-detail-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          @media (max-width: 1100px) {
            .material-convert-grid,
            .material-convert-form,
            .material-convert-summary,
            .material-convert-record-tools,
            .material-convert-record-toolbar,
            .material-convert-detail-grid {
              grid-template-columns: 1fr;
            }
            .material-convert-head {
              flex-direction: column;
            }
          }
        `;
        document.head.appendChild(style);
      }

      function ensureUnifiedWorkflowModals() {
        if (!document.getElementById("materialConvertDetailModal")) {
          document.body.insertAdjacentHTML("beforeend", `
            <div class="overlay" id="materialConvertDetailModal">
              <div class="modal modal-lg">
                <div class="modal-header">
                  <div>
                    <h3 id="materialConvertDetailTitle">转换记录详情</h3>
                    <p id="materialConvertDetailSubtitle">查看文件转换业务记录</p>
                  </div>
                  <button class="modal-close" type="button" data-close-modal="materialConvertDetailModal">×</button>
                </div>
                <div class="modal-body modal-scroll" id="materialConvertDetailBody"></div>
                <div class="modal-footer">
                  <button class="btn" type="button" data-close-modal="materialConvertDetailModal">关闭</button>
                  <button class="btn-primary" type="button" id="materialConvertDetailDownloadBtn">下载结果文件</button>
                </div>
              </div>
            </div>
          `);
        }
        if (!document.getElementById("mlffReviewModal")) {
          document.body.insertAdjacentHTML("beforeend", `
            <div class="overlay" id="mlffReviewModal">
              <div class="modal modal-lg">
                <div class="modal-header">
                  <h3>提交审核</h3>
                  <button class="modal-close" type="button" data-close-modal="mlffReviewModal">×</button>
                </div>
                <div class="modal-body modal-scroll" id="mlffReviewWizard"></div>
                <div class="modal-footer" id="mlffReviewFooter"></div>
              </div>
            </div>
          `);
        }
        if (!document.getElementById("optoUploadModal")) {
          document.body.insertAdjacentHTML("beforeend", `
            <div class="overlay" id="optoUploadModal">
              <div class="modal modal-lg">
                <div class="modal-header">
                  <h3>新增数据</h3>
                  <button class="modal-close" type="button" data-close-modal="optoUploadModal">×</button>
                </div>
                <div class="modal-body modal-scroll" id="optoUploadWizard"></div>
                <div class="modal-footer" id="optoUploadFooter"></div>
                <input id="optoUploadFileInputUnified" type="file" hidden>
              </div>
            </div>
          `);
        }
        if (!document.getElementById("optoReviewModal")) {
          document.body.insertAdjacentHTML("beforeend", `
            <div class="overlay" id="optoReviewModal">
              <div class="modal modal-lg">
                <div class="modal-header">
                  <h3>提交审核</h3>
                  <button class="modal-close" type="button" data-close-modal="optoReviewModal">×</button>
                </div>
                <div class="modal-body modal-scroll" id="optoReviewWizard"></div>
                <div class="modal-footer" id="optoReviewFooter"></div>
              </div>
            </div>
          `);
        }
        if (!document.getElementById("optoRecordModal")) {
          document.body.insertAdjacentHTML("beforeend", `
            <div class="overlay" id="optoRecordModal">
              <div class="modal modal-md">
                <div class="modal-header">
                  <h3>更新记录详情</h3>
                  <button class="modal-close" type="button" data-close-modal="optoRecordModal">×</button>
                </div>
                <div class="modal-body modal-scroll" id="optoRecordInfo"></div>
                <div class="modal-footer">
                  <button class="btn" type="button" data-close-modal="optoRecordModal">关闭</button>
                </div>
              </div>
            </div>
          `);
        }
        if (document.getElementById("mlffUploadModal") && !document.getElementById("mlffUploadFileInputUnified")) {
          const input = document.createElement("input");
          input.id = "mlffUploadFileInputUnified";
          input.type = "file";
          input.hidden = true;
          document.getElementById("mlffUploadModal").appendChild(input);
        }
      }

      function ensureUnifiedClosureState() {
        ["twod", "electrolyte", "opto", "mlff", "catalyst"].forEach((moduleKey) => {
          const tabKey = `${moduleKey}Tab`;
          if (!["search", "convert"].includes(state[tabKey])) state[tabKey] = "search";
        });
        if (!state.materialConvertActiveModule) state.materialConvertActiveModule = "twod";
        if (!state.materialConvertDraft) state.materialConvertDraft = null;
        if (!state.materialConvertFilters) state.materialConvertFilters = {};
        Object.keys(materialConversionModules).forEach((moduleKey) => {
          if (!state.materialConvertFilters[moduleKey]) {
            state.materialConvertFilters[moduleKey] = { keyword: "", type: "", status: "" };
          }
        });

        if (!state.mlffFlowUploadStep) state.mlffFlowUploadStep = 1;
        if (!state.optoFlowUploadStep) state.optoFlowUploadStep = 1;
        if (!state.mlffFlowUploadDraft) state.mlffFlowUploadDraft = null;
        if (!state.optoFlowUploadDraft) state.optoFlowUploadDraft = null;

        if (!state.mlffReviewStep) state.mlffReviewStep = 1;
        if (!state.optoReviewStep) state.optoReviewStep = 1;
        if (!state.mlffReviewFilter) state.mlffReviewFilter = "charge";
        if (!state.optoReviewFilter) state.optoReviewFilter = "OLED";
        if (!state.selectedMlffReviewFileId) state.selectedMlffReviewFileId = "";
        if (!state.selectedOptoReviewFileId) state.selectedOptoReviewFileId = "";
        if (!state.mlffReviewForm) {
          state.mlffReviewForm = {
            materialName: "",
            materialType: "",
            dataSource: "理论计算",
            dataDescription: ""
          };
        }
        if (!state.optoReviewForm) {
          state.optoReviewForm = {
            materialName: "",
            materialType: "",
            dataSource: "实验测量",
            dataDescription: ""
          };
        }
      }

      function renderUnifiedModuleTabs(moduleKey, activeTab) {
        const active = activeTab || state[`${moduleKey}Tab`] || "search";
        return `
          <div class="module-tab-strip">
            <button class="module-tab-btn${active === "search" ? " active" : ""}" type="button" data-module-tab="${moduleKey}" data-module-target="search">数据检索</button>
            <button class="module-tab-btn${active === "convert" ? " active" : ""}" type="button" data-module-tab="${moduleKey}" data-module-target="convert">文件转换</button>
          </div>
        `;
      }

      // 催化专用标签行：在通用「数据检索/文件转换」之外，额外把「材料对比」「体相晶格生成」
      // 直接摆到催化材料应用页原位置。两个新按钮复用已绑定的 [data-catalyst-workbench] 处理器
      // （跳到已存在且可用的对比/催化构建工作台），不引入任何伪造数值。
      function renderCatalystUnifiedTabs(activeTab) {
        const active = activeTab || state.catalystTab || "search";
        return `
          <div class="module-tab-strip">
            <button class="module-tab-btn${active === "search" ? " active" : ""}" type="button" data-module-tab="catalyst" data-module-target="search">数据检索</button>
            <button class="module-tab-btn${active === "convert" ? " active" : ""}" type="button" data-module-tab="catalyst" data-module-target="convert">文件转换</button>
          </div>
        `;
      }

      function getMaterialConversionModule(moduleKey) {
        return materialConversionModules[moduleKey] || materialConversionModules.twod;
      }

      function getMaterialConversionDefaultDraft(moduleKey) {
        const config = getMaterialConversionModule(moduleKey);
        if (moduleKey === "twod") {
          return {
            module: moduleKey,
            fileName: "",
            fileSizeText: "",
            fileType: "结构文件",
            sourceFormat: "",
            targetFormat: "POSCAR",
            materialId: config.defaultMaterialId()
          };
        }
        const source = materialConversionRecords.find((record) => record.module === moduleKey);
        if (!source) {
          return {
            module: moduleKey,
            fileName: "",
            fileSizeText: "",
            fileType: "结构文件",
            sourceFormat: "",
            targetFormat: "POSCAR",
            materialId: config.defaultMaterialId()
          };
        }
        return {
          module: moduleKey,
          fileName: source.sourceName || "",
          fileSizeText: "系统内文件",
          fileType: source.fileType || "结构文件",
          sourceFormat: source.sourceFormat || "",
          targetFormat: source.targetFormat || "",
          materialId: source.materialId || config.defaultMaterialId()
        };
      }

      function getMaterialConversionDraft(moduleKey) {
        if (!state.materialConvertDraft || state.materialConvertDraft.module !== moduleKey) {
          state.materialConvertDraft = getMaterialConversionDefaultDraft(moduleKey);
        }
        const draft = state.materialConvertDraft;
        const formats = getMaterialConvertTargetFormats(draft.fileType, draft.sourceFormat);
        if (!formats.includes(draft.targetFormat)) draft.targetFormat = formats[0] || "";
        if (!draft.materialId) draft.materialId = getMaterialConversionModule(moduleKey).defaultMaterialId();
        return draft;
      }

      function getMaterialConvertTargetFormats(fileType, sourceFormat = "") {
        const normalized = String(sourceFormat || "").toUpperCase() === "JPEG" ? "JPG" : String(sourceFormat || "").toUpperCase();
        const formats = materialConversionTargetFormats[fileType] || materialConversionTargetFormats["结构文件"];
        const filtered = formats.filter((item) => item !== normalized);
        return filtered.length ? filtered : formats;
      }

      function inferMaterialConvertFileType(fileName) {
        const upperName = String(fileName || "").toUpperCase();
        const format = upperName === "POSCAR" || upperName === "CONTCAR"
          ? upperName
          : String(typeof detectFileFormat === "function" ? detectFileFormat(fileName) : (fileName.split(".").pop() || "")).toUpperCase();
        if (["CIF", "POSCAR", "VASP", "XYZ", "PDB", "CONTCAR"].includes(format)) return "结构文件";
        if (["PNG", "JPG", "JPEG", "SVG", "TIFF", "TIF"].includes(format)) return "可视化文件";
        if (["BAND", "DOS"].includes(format)) return "可视化文件";
        return "计算数据";
      }

      function getMaterialConvertSourceFormat(fileName) {
        const upperName = String(fileName || "").toUpperCase();
        if (upperName === "POSCAR" || upperName === "CONTCAR") return upperName;
        return String(typeof detectFileFormat === "function" ? detectFileFormat(fileName) : (String(fileName || "").split(".").pop() || "FILE")).toUpperCase();
      }

      function formatMaterialConvertFileSize(size) {
        const bytes = Number(size || 0);
        if (!Number.isFinite(bytes) || bytes <= 0) return "本地上传文件";
        if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
        if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${bytes} B`;
      }

      function getMaterialConvertFilters(moduleKey) {
        ensureUnifiedClosureState();
        return state.materialConvertFilters[moduleKey];
      }

      function getMaterialConversionRecords(moduleKey) {
        const filters = getMaterialConvertFilters(moduleKey);
        const keyword = String(filters.keyword || "").trim().toLowerCase();
        return materialConversionRecords.filter((record) => {
          if (record.module !== moduleKey) return false;
          const keywordText = `${record.materialName} ${record.sourceName} ${record.resultName} ${record.remark}`.toLowerCase();
          const keywordMatch = !keyword || keywordText.includes(keyword);
          const typeMatch = !filters.type || record.fileType === filters.type;
          const statusMatch = !filters.status || record.status === filters.status;
          return keywordMatch && typeMatch && statusMatch;
        });
      }

      function getMaterialConversionMaterialName(moduleKey, materialId) {
        const option = getMaterialConversionModule(moduleKey).materialOptions().find((item) => item.id === materialId);
        return option?.label?.split(" / ")[0] || materialId || "/";
      }

      function buildMaterialConversionResultName(fileName, targetFormat) {
        const safeName = fileName || `converted_${Date.now()}`;
        return typeof replaceFileExtension === "function"
          ? replaceFileExtension(safeName, targetFormat)
          : safeName.replace(/\.[^.]+$/, "") + "." + String(targetFormat || "dat").toLowerCase();
      }

      function buildMaterialConvertSummary(items) {
        return `
          <div class="material-convert-summary">
            ${items.map((item) => `
              <div class="material-convert-summary-item">
                <span>${item.label}</span>
                <strong>${item.value || "-"}</strong>
              </div>
            `).join("")}
          </div>
        `;
      }

      function renderMaterialConversionPanel(moduleKey) {
        const config = getMaterialConversionModule(moduleKey);
        const draft = getMaterialConversionDraft(moduleKey);
        const filters = getMaterialConvertFilters(moduleKey);
        const records = getMaterialConversionRecords(moduleKey);
        const targetFormats = getMaterialConvertTargetFormats(draft.fileType, draft.sourceFormat);
        const options = config.materialOptions();
        const isTwodConvert = moduleKey === "twod";
        const sourceText = draft.fileName
          ? `源格式：${draft.sourceFormat || "自动识别"} · ${draft.fileSizeText || "本地上传文件"}`
          : "支持结构文件、计算数据、可视化文件三类转换业务";
        const recordHead = isTwodConvert ? `
          <div class="material-convert-record-title">
            <h3>转换记录</h3>
            <p>支持按文件名、材料名、转换类型和状态查询历史记录，并可查看详情或下载结果文件。</p>
          </div>
        ` : `
          <div class="material-convert-head" style="margin-bottom:0;">
            <div>
              <h3>转换记录维护</h3>
              <p>支持按文件名、材料名、转换类型和状态查询历史记录，并可查看详情或下载结果文件。</p>
            </div>
          </div>
        `;
        const recordTools = isTwodConvert ? `
          <div class="material-convert-record-toolbar">
            <div class="material-convert-record-search">
              <input type="text" value="${escapeHtml(filters.keyword || "")}" placeholder="材料名 / 源文件 / 结果文件" data-material-convert-filter="keyword" data-module="${moduleKey}">
            </div>
            <label class="material-convert-filter-field">
              <span>转换类型</span>
              <select data-material-convert-filter="type" data-module="${moduleKey}">
                <option value="">全部</option>
                ${["结构文件", "计算数据", "可视化文件"].map((item) => `<option value="${item}"${filters.type === item ? " selected" : ""}>${item}</option>`).join("")}
              </select>
            </label>
            <label class="material-convert-filter-field">
              <span>转换状态</span>
              <select data-material-convert-filter="status" data-module="${moduleKey}">
                <option value="">全部</option>
                ${["已完成", "转换中"].map((item) => `<option value="${item}"${filters.status === item ? " selected" : ""}>${item}</option>`).join("")}
              </select>
            </label>
            <div class="material-convert-record-actions">
              <button class="btn-primary" type="button" data-material-convert-search="${moduleKey}">查询</button>
              <button class="btn" type="button" data-material-convert-reset="${moduleKey}">重置</button>
            </div>
          </div>
        ` : `
          <div class="material-convert-record-tools">
            <div class="field">
              <label>关键词</label>
              <input type="text" value="${escapeHtml(filters.keyword || "")}" placeholder="材料名 / 源文件 / 结果文件" data-material-convert-filter="keyword" data-module="${moduleKey}">
            </div>
            <div class="field">
              <label>转换类型</label>
              <select data-material-convert-filter="type" data-module="${moduleKey}">
                <option value="">全部</option>
                ${["结构文件", "计算数据", "可视化文件"].map((item) => `<option value="${item}"${filters.type === item ? " selected" : ""}>${item}</option>`).join("")}
              </select>
            </div>
            <div class="field">
              <label>转换状态</label>
              <select data-material-convert-filter="status" data-module="${moduleKey}">
                <option value="">全部</option>
                ${["已完成", "转换中"].map((item) => `<option value="${item}"${filters.status === item ? " selected" : ""}>${item}</option>`).join("")}
              </select>
            </div>
            <div style="display:flex;gap:10px;">
              <button class="btn-primary" type="button" data-material-convert-search="${moduleKey}">查询</button>
              <button class="btn" type="button" data-material-convert-reset="${moduleKey}">重置</button>
            </div>
          </div>
        `;
        const recordFooter = isTwodConvert ? `
          <div class="material-convert-record-footer">
            <span>共计 ${records.length} 条</span>
            <div class="material-convert-record-pager" aria-label="转换记录分页">
              <button type="button" disabled aria-label="上一页">‹</button>
              <button type="button" class="active">1</button>
              <button type="button" ${records.length <= 10 ? "disabled" : ""}>2</button>
              <button type="button" disabled aria-label="下一页">›</button>
              <select class="material-convert-record-page-size" aria-label="每页条数">
                <option>10条/页</option>
              </select>
            </div>
          </div>
        ` : `
          <div class="result-footer twod-result-footer">
            <span>共 ${records.length} 条转换记录，可继续维护、查询和下载。</span>
          </div>
        `;
        return `
          <div class="material-convert-shell" data-material-convert-module="${moduleKey}">
            <section class="card pad ${isTwodConvert ? "material-convert-workbench" : ""}">
              <div class="material-convert-head">
                <div>
                  ${isTwodConvert ? "" : `<span class="twod-search-eyebrow">${config.eyebrow}</span>`}
                  <h3>${config.title}</h3>
                  <p>${config.desc}</p>
                </div>
              </div>
              <div class="material-convert-grid">
                <div class="material-convert-drop ${isTwodConvert ? "is-upload" : ""}">
                  <strong>${draft.fileName || (isTwodConvert ? "请先上传结构文件、计算数据或可视化源数据" : "当前模块暂无可转换文件")}</strong>
                  <span>${sourceText}</span>
                  ${isTwodConvert ? `
                    <button class="material-convert-upload-btn" type="button" data-material-convert-upload="${moduleKey}">选择文件</button>
                    <input type="file" hidden data-material-convert-file="${moduleKey}" accept=".cif,.vasp,.poscar,.contcar,.xyz,.pdb,.csv,.json,.yaml,.yml,.hdf5,.h5,.npz,.xlsx,.xls,.dat,.txt,.png,.jpg,.jpeg,.svg,.tif,.tiff">
                  ` : ""}
                </div>
                <div>
                  <div class="material-convert-type-row">
                    ${["结构文件", "计算数据", "可视化文件"].map((type) => `
                      <button class="material-convert-type${draft.fileType === type ? " active" : ""}" type="button" data-material-convert-type="${type}" data-module="${moduleKey}">${type}</button>
                    `).join("")}
                  </div>
                  <p class="material-convert-type-note">${materialConversionTypeDescriptions[draft.fileType]}</p>
                  <div class="material-convert-form" style="margin-top:14px;">
                    <div class="field">
                      <label>${config.materialLabel}</label>
                      <select data-material-convert-field="materialId" data-module="${moduleKey}">
                        ${options.map((item) => `<option value="${item.id}"${draft.materialId === item.id ? " selected" : ""}>${item.label}</option>`).join("")}
                      </select>
                    </div>
                    <div class="field">
                      <label>目标格式</label>
                      <select data-material-convert-field="targetFormat" data-module="${moduleKey}">
                        ${targetFormats.map((format) => `<option value="${format}"${draft.targetFormat === format ? " selected" : ""}>${format}</option>`).join("")}
                      </select>
                    </div>
                  </div>
                  ${buildMaterialConvertSummary([
                    { label: "转换类型", value: draft.fileType },
                    { label: "源文件", value: draft.fileName || "待上传" },
                    { label: "源格式", value: draft.sourceFormat || "自动识别" },
                    { label: "目标格式", value: draft.targetFormat || "-" }
                  ])}
                  <div class="twod-convert-actions" style="margin-top:16px;">
                    <button class="btn-primary" type="button" data-material-convert-start="${moduleKey}" ${draft.fileName ? "" : "disabled"}>开始转换</button>
                    <button class="btn" type="button" data-material-convert-clear="${moduleKey}">${isTwodConvert ? "清空文件" : "清空"}</button>
                  </div>
                </div>
              </div>
            </section>

            <section class="card pad ${isTwodConvert ? "material-convert-record-card" : ""}">
              ${recordHead}
              ${recordTools}
              <div class="table-wrap twod-result-table-wrap">
                <table class="twod-result-table">
                  <thead>
                    <tr>
                      <th>转换时间</th>
                      <th>材料名称</th>
                      <th>转换类型</th>
                      <th>源文件</th>
                      <th>源格式</th>
                      <th>目标格式</th>
                      <th>状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${records.length ? records.map((record) => `
                      <tr>
                        <td>${record.createdAt}</td>
                        <td>${record.materialName}</td>
                        <td>${record.fileType}</td>
                        <td>${record.sourceName}</td>
                        <td>${record.sourceFormat}</td>
                        <td>${record.targetFormat}</td>
                        <td><span class="status-badge success">${record.status}</span></td>
                        <td>
                          <div class="table-actions">
                            <button class="btn btn-sm" type="button" data-material-convert-detail="${record.id}">查看</button>
                            <button class="btn btn-sm" type="button" data-material-convert-download="${record.id}">${isTwodConvert ? "下载文件" : "下载"}</button>
                          </div>
                        </td>
                      </tr>
                    `).join("") : `<tr><td colspan="8"><div class="sys-empty">暂无符合条件的转换记录</div></td></tr>`}
                  </tbody>
                </table>
              </div>
              ${recordFooter}
            </section>
          </div>
        `;
      }

      function refreshMaterialConversionModule(moduleKey) {
        if (moduleKey === "twod") renderTwodModuleUnified();
        if (moduleKey === "electrolyte") renderElectrolyteModule();
        if (moduleKey === "opto") renderOptoModule();
        if (moduleKey === "mlff") renderMlffModule();
        if (moduleKey === "catalyst") renderCatalystModule();
      }

      function buildMaterialConversionPayload(record) {
        if (!record) return null;
        const lines = [
          `Material: ${record.materialName}`,
          `Module: ${getMaterialConversionModule(record.module).eyebrow}`,
          `Conversion Type: ${record.fileType}`,
          `Source File: ${record.sourceName}`,
          `Source Format: ${record.sourceFormat}`,
          `Target Format: ${record.targetFormat}`,
          `Created At: ${record.createdAt}`,
          `Status: ${record.status}`,
          `Remark: ${record.remark}`
        ];
        if (record.fileType === "可视化文件" && record.targetFormat === "SVG") {
          return {
            filename: record.resultName,
            content: `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540"><rect width="100%" height="100%" fill="#f7fbff"/><text x="56" y="104" font-size="30" fill="#18325d">${record.materialName} 可视化转换结果</text><text x="56" y="158" font-size="18" fill="#607492">${record.sourceName} -> ${record.resultName}</text><text x="56" y="212" font-size="18" fill="#2453d4">文件已完成统一格式转换。</text></svg>`,
            mime: "image/svg+xml;charset=utf-8"
          };
        }
        if (record.targetFormat === "JSON") {
          return {
            filename: record.resultName,
            content: JSON.stringify(record, null, 2),
            mime: "application/json;charset=utf-8"
          };
        }
        return {
          filename: record.resultName,
          content: lines.join("\n"),
          mime: "text/plain;charset=utf-8"
        };
      }

      function downloadMaterialConversionRecord(recordId) {
        const record = materialConversionRecords.find((item) => item.id === recordId);
        const payload = buildMaterialConversionPayload(record);
        if (!payload) return;
        triggerTwodDetailDownload(payload.filename, payload.content, payload.mime);
        showToast("文件转换", `${payload.filename} 已开始下载。`);
      }

      function openMaterialConversionDetail(recordId) {
        const record = materialConversionRecords.find((item) => item.id === recordId);
        if (!record) return;
        const title = document.getElementById("materialConvertDetailTitle");
        const subtitle = document.getElementById("materialConvertDetailSubtitle");
        const body = document.getElementById("materialConvertDetailBody");
        const downloadBtn = document.getElementById("materialConvertDetailDownloadBtn");
        if (title) title.textContent = `${record.materialName} - 转换记录详情`;
        if (subtitle) subtitle.textContent = `${record.fileType} · ${record.sourceFormat} -> ${record.targetFormat} · ${record.status}`;
        if (body) {
          body.innerHTML = `
            <div class="material-convert-detail-grid">
              ${[
                ["所属应用", getMaterialConversionModule(record.module).eyebrow],
                ["材料名称", record.materialName],
                ["转换类型", record.fileType],
                ["源文件", record.sourceName],
                ["源格式", record.sourceFormat],
                ["目标格式", record.targetFormat],
                ["输出文件", record.resultName],
                ["转换状态", record.status],
                ["转换时间", record.createdAt],
                ["操作人", record.operator]
              ].map(([label, value]) => `<div class="detail-row"><span class="detail-label">${label}</span><span>${value || "/"}</span></div>`).join("")}
            </div>
            <div style="margin-top:16px;padding:14px 16px;border:1px solid #e5e7eb;border-radius:12px;background:#F7F8FA;color:#334155;line-height:1.8;">
              <strong>转换说明</strong>
              <div>${record.remark || "当前文件已完成格式转换，可下载结果文件用于后续检索、建模或归档。"}</div>
            </div>
          `;
        }
        if (downloadBtn) downloadBtn.dataset.materialConvertDownload = record.id;
        openModal("materialConvertDetailModal");
      }


      function renderUnifiedSummaryCards(records) {
        const total = records.length;
        const draftCount = records.filter((item) => item.fileCategory === "草稿").length;
        const pendingCount = records.filter((item) => item.reviewStatus === "正在审核").length;
        const latest = records[0]?.uploadedAt || "暂无";
        return `
          <div class="module-update-summary">
            <article class="module-update-card">
              <span>当前记录</span>
              <strong>${total}</strong>
              <p>我的提交与更新记录总数</p>
            </article>
            <article class="module-update-card">
              <span>待补充 / 待审核</span>
              <strong>${draftCount + pendingCount}</strong>
              <p>含草稿与审核中的记录</p>
            </article>
            <article class="module-update-card">
              <span>最近更新时间</span>
              <strong style="font-size:16px; line-height:24px;">${latest}</strong>
              <p>便于跟踪当前处理进度</p>
            </article>
          </div>
        `;
      }

      function renderUnifiedUpdateTable(records, config) {
        const tableRows = records.length ? records.map((record) => `
          <tr>
            <td>${record.uploadedAt}</td>
            <td>${record.fileName}</td>
            <td>${record.sourceType}</td>
            <td>${record.sourceFormat}</td>
            <td><span class="record-meta-pill ${getFileCategoryPillClass(record.fileCategory)}">${record.fileCategory}</span></td>
            <td>${record.fileCategory === "草稿" ? "-" : `<span class="record-meta-pill ${getReviewStatusPillClass(record.reviewStatus)}">${record.reviewStatus}</span>`}</td>
            <td>
              <div class="table-actions">
                <button class="${config.linkClass}" type="button" ${config.viewAttr}="${record.id}">查看</button>
                <button class="${config.linkClass}" type="button" ${config.downloadAttr}="${record.id}">下载</button>
              </div>
            </td>
          </tr>
        `).join("") : `<tr><td colspan="7" class="module-empty">当前暂无记录，可先新增数据进入我的提交。</td></tr>`;

        return `
          <div class="module-update-shell">
            ${renderUnifiedSummaryCards(records)}
            <section class="module-update-panel">
              <div class="module-update-head">
                <div>
                  <h3>${config.title}</h3>
                  <p>${config.subtitle}</p>
                </div>
                <div class="module-update-actions">
                  <button class="btn-primary" type="button" ${config.addAttr}>新增数据</button>
                  <button class="btn" type="button" ${config.reviewAttr}>提交审核</button>
                </div>
              </div>
              <div class="module-update-table">
                <table>
                  <thead>
                    <tr>
                      <th>上传时间</th>
                      <th>文件名称</th>
                      <th>来源类型</th>
                      <th>来源格式</th>
                      <th>文件类别</th>
                      <th>审核状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>${tableRows}</tbody>
                </table>
              </div>
              <div class="module-update-footer">
                <span>显示 1 - ${records.length} 条，共 ${records.length} 条结果</span>
                <div class="pagination"><div class="pager"><button type="button" class="active">1</button></div></div>
              </div>
            </section>
          </div>
        `;
      }

      function getMaterialDatabaseLabel(materialType) {
        const map = {
          "二维材料": "二维材料数据库",
          "电解质材料": "电解质材料数据库",
          "有机光电材料": "有机光电材料数据库",
          "机器学习力场": "机器学习力场数据库",
          "催化材料": "催化材料数据库"
        };
        return map[materialType] || "材料数据库";
      }

      function getMlffUnifiedLibrary(filterKey = "") {
        return mlffPersonalLibraryUnified.filter((item) => !filterKey || item.category === filterKey);
      }
function renderElectrolyteCategoryTabs() {
        const category = state.electrolyteCategory || "organicLiquid";
        return `
          <div class="module-tab-strip electrolyte-category-tabs" aria-label="电解质材料类别切换">
            ${Object.entries(ELECTROLYTE_MODULE_CONFIG).map(([key, item]) => `
              <button class="module-tab-btn${category === key ? " active" : ""}" type="button" data-ely-category="${key}" aria-pressed="${category === key ? "true" : "false"}">${item.title}</button>
            `).join("")}
          </div>
        `;
      }

      // 催化专用标签行：在通用「数据检索/文件转换」之外，额外把「材料对比」「体相晶格生成」
      // 直接摆到催化材料应用页原位置。两个新按钮复用已绑定的 [data-catalyst-workbench] 处理器
      // （跳到已存在且可用的对比/催化构建工作台），不引入任何伪造数值。
      function renderCatalystUnifiedTabs(activeTab) {
        const active = activeTab || state.catalystTab || "search";
        return `
          <div class="module-tab-strip">
            <button class="module-tab-btn${active === "search" ? " active" : ""}" type="button" data-module-tab="catalyst" data-module-target="search">数据检索</button>
            <button class="module-tab-btn${active === "convert" ? " active" : ""}" type="button" data-module-tab="catalyst" data-module-target="convert">文件转换</button>
          </div>
        `;
      }

      function getMaterialConversionModule(moduleKey) {
        return materialConversionModules[moduleKey] || materialConversionModules.twod;
      }

      function getMaterialConversionDefaultDraft(moduleKey) {
        const config = getMaterialConversionModule(moduleKey);
        if (moduleKey === "twod") {
          return {
            module: moduleKey,
            fileName: "",
            fileSizeText: "",
            fileType: "结构文件",
            sourceFormat: "",
            targetFormat: "POSCAR",
            materialId: config.defaultMaterialId()
          };
        }
        const source = materialConversionRecords.find((record) => record.module === moduleKey);
        if (!source) {
          return {
            module: moduleKey,
            fileName: "",
            fileSizeText: "",
            fileType: "结构文件",
            sourceFormat: "",
            targetFormat: "POSCAR",
            materialId: config.defaultMaterialId()
          };
        }
        return {
          module: moduleKey,
          fileName: source.sourceName || "",
          fileSizeText: "系统内文件",
          fileType: source.fileType || "结构文件",
          sourceFormat: source.sourceFormat || "",
          targetFormat: source.targetFormat || "",
          materialId: source.materialId || config.defaultMaterialId()
        };
      }

      function getMaterialConversionDraft(moduleKey) {
        if (!state.materialConvertDraft || state.materialConvertDraft.module !== moduleKey) {
          state.materialConvertDraft = getMaterialConversionDefaultDraft(moduleKey);
        }
        const draft = state.materialConvertDraft;
        const formats = getMaterialConvertTargetFormats(draft.fileType, draft.sourceFormat);
        if (!formats.includes(draft.targetFormat)) draft.targetFormat = formats[0] || "";
        if (!draft.materialId) draft.materialId = getMaterialConversionModule(moduleKey).defaultMaterialId();
        return draft;
      }

      function getMaterialConvertTargetFormats(fileType, sourceFormat = "") {
        const normalized = String(sourceFormat || "").toUpperCase() === "JPEG" ? "JPG" : String(sourceFormat || "").toUpperCase();
        const formats = materialConversionTargetFormats[fileType] || materialConversionTargetFormats["结构文件"];
        const filtered = formats.filter((item) => item !== normalized);
        return filtered.length ? filtered : formats;
      }

      function inferMaterialConvertFileType(fileName) {
        const upperName = String(fileName || "").toUpperCase();
        const format = upperName === "POSCAR" || upperName === "CONTCAR"
          ? upperName
          : String(typeof detectFileFormat === "function" ? detectFileFormat(fileName) : (fileName.split(".").pop() || "")).toUpperCase();
        if (["CIF", "POSCAR", "VASP", "XYZ", "PDB", "CONTCAR"].includes(format)) return "结构文件";
        if (["PNG", "JPG", "JPEG", "SVG", "TIFF", "TIF"].includes(format)) return "可视化文件";
        if (["BAND", "DOS"].includes(format)) return "可视化文件";
        return "计算数据";
      }

      function getMaterialConvertSourceFormat(fileName) {
        const upperName = String(fileName || "").toUpperCase();
        if (upperName === "POSCAR" || upperName === "CONTCAR") return upperName;
        return String(typeof detectFileFormat === "function" ? detectFileFormat(fileName) : (String(fileName || "").split(".").pop() || "FILE")).toUpperCase();
      }

      function formatMaterialConvertFileSize(size) {
        const bytes = Number(size || 0);
        if (!Number.isFinite(bytes) || bytes <= 0) return "本地上传文件";
        if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
        if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${bytes} B`;
      }

      function getMaterialConvertFilters(moduleKey) {
        ensureUnifiedClosureState();
        return state.materialConvertFilters[moduleKey];
      }

      function getMaterialConversionRecords(moduleKey) {
        const filters = getMaterialConvertFilters(moduleKey);
        const keyword = String(filters.keyword || "").trim().toLowerCase();
        return materialConversionRecords.filter((record) => {
          if (record.module !== moduleKey) return false;
          const keywordText = `${record.materialName} ${record.sourceName} ${record.resultName} ${record.remark}`.toLowerCase();
          const keywordMatch = !keyword || keywordText.includes(keyword);
          const typeMatch = !filters.type || record.fileType === filters.type;
          const statusMatch = !filters.status || record.status === filters.status;
          return keywordMatch && typeMatch && statusMatch;
        });
      }

      function getMaterialConversionMaterialName(moduleKey, materialId) {
        const option = getMaterialConversionModule(moduleKey).materialOptions().find((item) => item.id === materialId);
        return option?.label?.split(" / ")[0] || materialId || "/";
      }

      function buildMaterialConversionResultName(fileName, targetFormat) {
        const safeName = fileName || `converted_${Date.now()}`;
        return typeof replaceFileExtension === "function"
          ? replaceFileExtension(safeName, targetFormat)
          : safeName.replace(/\.[^.]+$/, "") + "." + String(targetFormat || "dat").toLowerCase();
      }

      function buildMaterialConvertSummary(items) {
        return `
          <div class="material-convert-summary">
            ${items.map((item) => `
              <div class="material-convert-summary-item">
                <span>${item.label}</span>
                <strong>${item.value || "-"}</strong>
              </div>
            `).join("")}
          </div>
        `;
      }

      function renderMaterialConversionPanel(moduleKey) {
        const config = getMaterialConversionModule(moduleKey);
        const draft = getMaterialConversionDraft(moduleKey);
        const filters = getMaterialConvertFilters(moduleKey);
        const records = getMaterialConversionRecords(moduleKey);
        const targetFormats = getMaterialConvertTargetFormats(draft.fileType, draft.sourceFormat);
        const options = config.materialOptions();
        const isTwodConvert = moduleKey === "twod";
        const sourceText = draft.fileName
          ? `源格式：${draft.sourceFormat || "自动识别"} · ${draft.fileSizeText || "本地上传文件"}`
          : "支持结构文件、计算数据、可视化文件三类转换业务";
        const recordHead = isTwodConvert ? `
          <div class="material-convert-record-title">
            <h3>转换记录</h3>
            <p>支持按文件名、材料名、转换类型和状态查询历史记录，并可查看详情或下载结果文件。</p>
          </div>
        ` : `
          <div class="material-convert-head" style="margin-bottom:0;">
            <div>
              <h3>转换记录维护</h3>
              <p>支持按文件名、材料名、转换类型和状态查询历史记录，并可查看详情或下载结果文件。</p>
            </div>
          </div>
        `;
        const recordTools = isTwodConvert ? `
          <div class="material-convert-record-toolbar">
            <div class="material-convert-record-search">
              <input type="text" value="${escapeHtml(filters.keyword || "")}" placeholder="材料名 / 源文件 / 结果文件" data-material-convert-filter="keyword" data-module="${moduleKey}">
            </div>
            <label class="material-convert-filter-field">
              <span>转换类型</span>
              <select data-material-convert-filter="type" data-module="${moduleKey}">
                <option value="">全部</option>
                ${["结构文件", "计算数据", "可视化文件"].map((item) => `<option value="${item}"${filters.type === item ? " selected" : ""}>${item}</option>`).join("")}
              </select>
            </label>
            <label class="material-convert-filter-field">
              <span>转换状态</span>
              <select data-material-convert-filter="status" data-module="${moduleKey}">
                <option value="">全部</option>
                ${["已完成", "转换中"].map((item) => `<option value="${item}"${filters.status === item ? " selected" : ""}>${item}</option>`).join("")}
              </select>
            </label>
            <div class="material-convert-record-actions">
              <button class="btn-primary" type="button" data-material-convert-search="${moduleKey}">查询</button>
              <button class="btn" type="button" data-material-convert-reset="${moduleKey}">重置</button>
            </div>
          </div>
        ` : `
          <div class="material-convert-record-tools">
            <div class="field">
              <label>关键词</label>
              <input type="text" value="${escapeHtml(filters.keyword || "")}" placeholder="材料名 / 源文件 / 结果文件" data-material-convert-filter="keyword" data-module="${moduleKey}">
            </div>
            <div class="field">
              <label>转换类型</label>
              <select data-material-convert-filter="type" data-module="${moduleKey}">
                <option value="">全部</option>
                ${["结构文件", "计算数据", "可视化文件"].map((item) => `<option value="${item}"${filters.type === item ? " selected" : ""}>${item}</option>`).join("")}
              </select>
            </div>
            <div class="field">
              <label>转换状态</label>
              <select data-material-convert-filter="status" data-module="${moduleKey}">
                <option value="">全部</option>
                ${["已完成", "转换中"].map((item) => `<option value="${item}"${filters.status === item ? " selected" : ""}>${item}</option>`).join("")}
              </select>
            </div>
            <div style="display:flex;gap:10px;">
              <button class="btn-primary" type="button" data-material-convert-search="${moduleKey}">查询</button>
              <button class="btn" type="button" data-material-convert-reset="${moduleKey}">重置</button>
            </div>
          </div>
        `;
        const recordFooter = isTwodConvert ? `
          <div class="material-convert-record-footer">
            <span>共计 ${records.length} 条</span>
            <div class="material-convert-record-pager" aria-label="转换记录分页">
              <button type="button" disabled aria-label="上一页">‹</button>
              <button type="button" class="active">1</button>
              <button type="button" ${records.length <= 10 ? "disabled" : ""}>2</button>
              <button type="button" disabled aria-label="下一页">›</button>
              <select class="material-convert-record-page-size" aria-label="每页条数">
                <option>10条/页</option>
              </select>
            </div>
          </div>
        ` : `
          <div class="result-footer twod-result-footer">
            <span>共 ${records.length} 条转换记录，可继续维护、查询和下载。</span>
          </div>
        `;
        return `
          <div class="material-convert-shell" data-material-convert-module="${moduleKey}">
            <section class="card pad ${isTwodConvert ? "material-convert-workbench" : ""}">
              <div class="material-convert-head">
                <div>
                  ${isTwodConvert ? "" : `<span class="twod-search-eyebrow">${config.eyebrow}</span>`}
                  <h3>${config.title}</h3>
                  <p>${config.desc}</p>
                </div>
              </div>

              <div class="material-convert-grid">
                ${isTwodConvert ? `
                  <div style="display:grid;gap:14px;align-content:start;">
                    <div class="material-convert-type-row">
                      ${["结构文件", "计算数据", "可视化文件"].map((type) => `
                        <button class="material-convert-type${draft.fileType === type ? " active" : ""}" type="button" data-material-convert-type="${type}" data-module="${moduleKey}">${type}</button>
                      `).join("")}
                    </div>
                    <div class="material-convert-drop is-upload">
                      <strong>${draft.fileName || "请先上传结构文件、计算数据或可视化源数据"}</strong>
                      <span>${sourceText}</span>
                      <button class="material-convert-upload-btn" type="button" data-material-convert-upload="${moduleKey}">选择文件</button>
                      <input type="file" hidden data-material-convert-file="${moduleKey}" accept=".cif,.vasp,.poscar,.contcar,.xyz,.pdb,.csv,.json,.yaml,.yml,.hdf5,.h5,.npz,.xlsx,.xls,.dat,.txt,.png,.jpg,.jpeg,.svg,.tif,.tiff">
                    </div>
                  </div>
                ` : `
                  <div class="material-convert-drop">
                    <strong>${draft.fileName || "当前模块暂无可转换文件"}</strong>
                    <span>${sourceText}</span>
                  </div>
                `}
                <div>
                  ${isTwodConvert ? "" : `
                    <div class="material-convert-type-row">
                      ${["结构文件", "计算数据", "可视化文件"].map((type) => `
                        <button class="material-convert-type${draft.fileType === type ? " active" : ""}" type="button" data-material-convert-type="${type}" data-module="${moduleKey}">${type}</button>
                      `).join("")}
                    </div>
                  `}
                  <p class="material-convert-type-note">${materialConversionTypeDescriptions[draft.fileType]}</p>
                  <div class="material-convert-form" style="margin-top:14px;">
                    <div class="field">
                      <label>${isTwodConvert ? "源文件格式" : config.materialLabel}</label>
                      ${isTwodConvert
                        ? `<input type="text" value="${draft.sourceFormat || "自动识别"}" readonly aria-readonly="true" data-material-convert-source-format="${moduleKey}">`
                        : `<select data-material-convert-field="materialId" data-module="${moduleKey}">
                            ${options.map((item) => `<option value="${item.id}"${draft.materialId === item.id ? " selected" : ""}>${item.label}</option>`).join("")}
                          </select>`}
                    </div>
                    <div class="field">
                      <label>${isTwodConvert ? "目标文件格式" : "目标格式"}</label>
                      <select data-material-convert-field="targetFormat" data-module="${moduleKey}">
                        ${targetFormats.map((format) => `<option value="${format}"${draft.targetFormat === format ? " selected" : ""}>${format}</option>`).join("")}
                      </select>
                    </div>
                  </div>
                  ${buildMaterialConvertSummary([
                    { label: "转换类型", value: draft.fileType },
                    { label: "源文件", value: draft.fileName || "待上传" },
                    { label: isTwodConvert ? "源文件格式" : "源格式", value: draft.sourceFormat || "自动识别" },
                    { label: isTwodConvert ? "目标文件格式" : "目标格式", value: draft.targetFormat || "-" }
                  ])}
                  <div class="twod-convert-actions" style="margin-top:16px;">
                    <button class="btn-primary" type="button" data-material-convert-start="${moduleKey}" ${draft.fileName ? "" : "disabled"}>开始转换</button>
                    <button class="btn" type="button" data-material-convert-clear="${moduleKey}">${isTwodConvert ? "清空文件" : "清空"}</button>
                  </div>
                </div>
              </div>
            </section>

            <section class="card pad ${isTwodConvert ? "material-convert-record-card" : ""}">
              ${recordHead}
              ${recordTools}
              <div class="table-wrap twod-result-table-wrap">
                <table class="twod-result-table">
                  <thead>
                    <tr>
                      <th>转换时间</th>
                      <th>材料名称</th>
                      <th>转换类型</th>
                      <th>源文件</th>
                      <th>源格式</th>
                      <th>目标格式</th>
                      <th>状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${records.length ? records.map((record) => `
                      <tr>
                        <td>${record.createdAt}</td>
                        <td>${record.materialName}</td>
                        <td>${record.fileType}</td>
                        <td>${record.sourceName}</td>
                        <td>${record.sourceFormat}</td>
                        <td>${record.targetFormat}</td>
                        <td><span class="status-badge success">${record.status}</span></td>
                        <td>
                          <div class="table-actions">
                            <button class="btn btn-sm" type="button" data-material-convert-detail="${record.id}">查看</button>
                            <button class="btn btn-sm" type="button" data-material-convert-download="${record.id}">${isTwodConvert ? "下载文件" : "下载"}</button>
                          </div>
                        </td>
                      </tr>
                    `).join("") : `<tr><td colspan="8"><div class="sys-empty">暂无符合条件的转换记录</div></td></tr>`}
                  </tbody>
                </table>
              </div>
              ${recordFooter}
            </section>
          </div>
        `;
      }

      function refreshMaterialConversionModule(moduleKey) {
        if (moduleKey === "twod") renderTwodModuleUnified();
        if (moduleKey === "electrolyte") renderElectrolyteModule();
        if (moduleKey === "opto") renderOptoModule();
        if (moduleKey === "mlff") renderMlffModule();
        if (moduleKey === "catalyst") renderCatalystModule();
      }

      function buildMaterialConversionPayload(record) {
        if (!record) return null;
        const lines = [
          `Material: ${record.materialName}`,
          `Module: ${getMaterialConversionModule(record.module).eyebrow}`,
          `Conversion Type: ${record.fileType}`,
          `Source File: ${record.sourceName}`,
          `Source Format: ${record.sourceFormat}`,
          `Target Format: ${record.targetFormat}`,
          `Created At: ${record.createdAt}`,
          `Status: ${record.status}`,
          `Remark: ${record.remark}`
        ];
        if (record.fileType === "可视化文件" && record.targetFormat === "SVG") {
          return {
            filename: record.resultName,
            content: `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540"><rect width="100%" height="100%" fill="#f7fbff"/><text x="56" y="104" font-size="30" fill="#18325d">${record.materialName} 可视化转换结果</text><text x="56" y="158" font-size="18" fill="#607492">${record.sourceName} -> ${record.resultName}</text><text x="56" y="212" font-size="18" fill="#2453d4">文件已完成统一格式转换。</text></svg>`,
            mime: "image/svg+xml;charset=utf-8"
          };
        }
        if (record.targetFormat === "JSON") {
          return {
            filename: record.resultName,
            content: JSON.stringify(record, null, 2),
            mime: "application/json;charset=utf-8"
          };
        }
        return {
          filename: record.resultName,
          content: lines.join("\n"),
          mime: "text/plain;charset=utf-8"
        };
      }

      function downloadMaterialConversionRecord(recordId) {
        const record = materialConversionRecords.find((item) => item.id === recordId);
        const payload = buildMaterialConversionPayload(record);
        if (!payload) return;
        triggerTwodDetailDownload(payload.filename, payload.content, payload.mime);
        showToast("文件转换", `${payload.filename} 已开始下载。`);
      }

      function openMaterialConversionDetail(recordId) {
        const record = materialConversionRecords.find((item) => item.id === recordId);
        if (!record) return;
        const title = document.getElementById("materialConvertDetailTitle");
        const subtitle = document.getElementById("materialConvertDetailSubtitle");
        const body = document.getElementById("materialConvertDetailBody");
        const downloadBtn = document.getElementById("materialConvertDetailDownloadBtn");
        if (title) title.textContent = `${record.materialName} - 转换记录详情`;
        if (subtitle) subtitle.textContent = `${record.fileType} · ${record.sourceFormat} -> ${record.targetFormat} · ${record.status}`;
        if (body) {
          body.innerHTML = `
            <div class="material-convert-detail-grid">
              ${[
                ["所属应用", getMaterialConversionModule(record.module).eyebrow],
                ["材料名称", record.materialName],
                ["转换类型", record.fileType],
                ["源文件", record.sourceName],
                ["源格式", record.sourceFormat],
                ["目标格式", record.targetFormat],
                ["输出文件", record.resultName],
                ["转换状态", record.status],
                ["转换时间", record.createdAt],
                ["操作人", record.operator]
              ].map(([label, value]) => `<div class="detail-row"><span class="detail-label">${label}</span><span>${value || "/"}</span></div>`).join("")}
            </div>
            <div style="margin-top:16px;padding:14px 16px;border:1px solid #e5e7eb;border-radius:12px;background:#F7F8FA;color:#334155;line-height:1.8;">
              <strong>转换说明</strong>
              <div>${record.remark || "当前文件已完成格式转换，可下载结果文件用于后续检索、建模或归档。"}</div>
            </div>
          `;
        }
        if (downloadBtn) downloadBtn.dataset.materialConvertDownload = record.id;
        openModal("materialConvertDetailModal");
      }


      function renderUnifiedSummaryCards(records) {
        const total = records.length;
        const draftCount = records.filter((item) => item.fileCategory === "草稿").length;
        const pendingCount = records.filter((item) => item.reviewStatus === "正在审核").length;
        const latest = records[0]?.uploadedAt || "暂无";
        return `
          <div class="module-update-summary">
            <article class="module-update-card">
              <span>当前记录</span>
              <strong>${total}</strong>
              <p>我的提交与更新记录总数</p>
            </article>
            <article class="module-update-card">
              <span>待补充 / 待审核</span>
              <strong>${draftCount + pendingCount}</strong>
              <p>含草稿与审核中的记录</p>
            </article>
            <article class="module-update-card">
              <span>最近更新时间</span>
              <strong style="font-size:16px; line-height:24px;">${latest}</strong>
              <p>便于跟踪当前处理进度</p>
            </article>
          </div>
        `;
      }

      function renderUnifiedUpdateTable(records, config) {
        const tableRows = records.length ? records.map((record) => `
          <tr>
            <td>${record.uploadedAt}</td>
            <td>${record.fileName}</td>
            <td>${record.sourceType}</td>
            <td>${record.sourceFormat}</td>
            <td><span class="record-meta-pill ${getFileCategoryPillClass(record.fileCategory)}">${record.fileCategory}</span></td>
            <td>${record.fileCategory === "草稿" ? "-" : `<span class="record-meta-pill ${getReviewStatusPillClass(record.reviewStatus)}">${record.reviewStatus}</span>`}</td>
            <td>
              <div class="table-actions">
                <button class="${config.linkClass}" type="button" ${config.viewAttr}="${record.id}">查看</button>
                <button class="${config.linkClass}" type="button" ${config.downloadAttr}="${record.id}">下载</button>
              </div>
            </td>
          </tr>
        `).join("") : `<tr><td colspan="7" class="module-empty">当前暂无记录，可先新增数据进入我的提交。</td></tr>`;

        return `
          <div class="module-update-shell">
            ${renderUnifiedSummaryCards(records)}
            <section class="module-update-panel">
              <div class="module-update-head">
                <div>
                  <h3>${config.title}</h3>
                  <p>${config.subtitle}</p>
                </div>
                <div class="module-update-actions">
                  <button class="btn-primary" type="button" ${config.addAttr}>新增数据</button>
                  <button class="btn" type="button" ${config.reviewAttr}>提交审核</button>
                </div>
              </div>
              <div class="module-update-table">
                <table>
                  <thead>
                    <tr>
                      <th>上传时间</th>
                      <th>文件名称</th>
                      <th>来源类型</th>
                      <th>来源格式</th>
                      <th>文件类别</th>
                      <th>审核状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>${tableRows}</tbody>
                </table>
              </div>
              <div class="module-update-footer">
                <span>显示 1 - ${records.length} 条，共 ${records.length} 条结果</span>
                <div class="pagination"><div class="pager"><button type="button" class="active">1</button></div></div>
              </div>
            </section>
          </div>
        `;
      }

      function getMaterialDatabaseLabel(materialType) {
        const map = {
          "二维材料": "二维材料数据库",
          "电解质材料": "电解质材料数据库",
          "有机光电材料": "有机光电材料数据库",
          "机器学习力场": "机器学习力场数据库",
          "催化材料": "催化材料数据库"
        };
        return map[materialType] || "材料数据库";
      }

      function getMlffUnifiedLibrary(filterKey = "") {
        return mlffPersonalLibraryUnified.filter((item) => !filterKey || item.category === filterKey);
      }
      function getOptoUnifiedLibrary(filterKey = "") {
        return optoPersonalLibraryUnified.filter((item) => !filterKey || item.category === filterKey);
      }

      function findMlffUnifiedRecord(recordId) {
        return mlffPersonalLibraryUnified.find((item) => item.id === recordId) || mlffUpdateRecords.find((item) => item.id === recordId);
      }

      function findOptoUnifiedRecord(recordId) {
        return optoPersonalLibraryUnified.find((item) => item.id === recordId);
      }

      function syncMlffSelectedReviewFile() {
        const available = getMlffUnifiedLibrary(state.mlffReviewFilter).filter(canSubmitRecord);
        if (!available.some((item) => item.id === state.selectedMlffReviewFileId)) {
          state.selectedMlffReviewFileId = available[0]?.id || "";
        }
      }

      function syncOptoSelectedReviewFile() {
        const available = getOptoUnifiedLibrary(state.optoReviewFilter).filter(canSubmitRecord);
        if (!available.some((item) => item.id === state.selectedOptoReviewFileId)) {
          state.selectedOptoReviewFileId = available[0]?.id || "";
        }
      }

      function resetMlffFlowUploadState() {
        revokeUploadPreviewUrl(state.mlffFlowUploadDraft?.previewUrl);
        state.mlffFlowUploadStep = 1;
        state.mlffFlowUploadDraft = null;
      }

      function resetOptoFlowUploadState() {
        revokeUploadPreviewUrl(state.optoFlowUploadDraft?.previewUrl);
        state.optoFlowUploadStep = 1;
        state.optoFlowUploadDraft = null;
      }

      function resetMlffReviewWorkflowUnified() {
        state.mlffReviewStep = 1;
        state.mlffReviewFilter = "charge";
        state.selectedMlffReviewFileId = "";
        state.mlffReviewForm = {
          materialName: "",
          materialType: "",
          dataSource: "理论计算",
          dataDescription: ""
        };
        syncMlffSelectedReviewFile();
      }

      function resetOptoReviewWorkflowUnified() {
        state.optoReviewStep = 1;
        state.optoReviewFilter = "OLED";
        state.selectedOptoReviewFileId = "";
        state.optoReviewForm = {
          materialName: "",
          materialType: "",
          dataSource: "实验测量",
          dataDescription: ""
        };
        syncOptoSelectedReviewFile();
      }

      function renderMlffUploadModalUnified() {
        const title = document.querySelector("#mlffUploadModal .modal-header h3");
        const body = document.getElementById("mlffUploadWizard");
        const footer = document.getElementById("mlffUploadFooter");
        if (!body || !footer) return;
        if (title) title.textContent = "新增数据";
        const draft = state.mlffFlowUploadDraft;
        body.innerHTML = `
          ${buildWorkflowStepper(state.mlffFlowUploadStep, ["上传文件", "确认入库"])}
          ${state.mlffFlowUploadStep === 1 ? `
            <section class="wizard-section">
              <div class="wizard-title-row"><h4>第一步：上传文件</h4></div>
              <div class="upload-dropzone">
                <div>
                  <div class="upload-icon">⇪</div>
                  <button class="btn-primary" type="button" data-mlff-flow-browse>点击上传</button>
                  <p>支持参数文件、拓扑文件和训练样本文件上传。</p>
                </div>
              </div>
              <div class="upload-asset-panel">${draft ? renderUploadAssetList([{
                name: draft.fileName,
                format: draft.sourceFormat || "FILE",
                sizeText: draft.fileSizeText || "",
                previewUrl: draft.previewUrl || ""
              }], "未选择文件") : "未选择文件"}</div>
            </section>
          ` : `
            <section class="wizard-section">
              <div class="wizard-title-row"><h4>第二步：确认文件基本信息</h4></div>
              <div class="wizard-info-card">
                <div><strong>文件名称：</strong>${draft?.fileName || "-"}</div>
                <div><strong>文件大小：</strong>${draft?.fileSizeText || "-"}</div>
                <div><strong>源文件格式：</strong>${draft?.sourceFormat || "-"}</div>
              </div>
              <div class="wizard-actions">
                <div class="radio-row">
                  ${mlffWorkflowTypesUnified.map((item) => `
                    <label class="algorithm-radio">
                      <input type="radio" name="mlffFlowUploadType" value="${item.key}" ${draft?.category === item.key ? "checked" : ""}>
                      ${item.label}
                    </label>
                  `).join("")}
                </div>
              </div>
            </section>
          `}
        `;
        footer.innerHTML = state.mlffFlowUploadStep === 1
          ? `<button class="btn" type="button" data-close-modal="mlffUploadModal">取消</button><button class="btn-primary" type="button" data-mlff-flow-next ${draft?.fileName ? "" : "disabled"}>下一步</button>`
          : `<button class="btn" type="button" data-mlff-flow-back>上一步</button><button class="btn-primary" type="button" data-mlff-flow-confirm ${draft?.category ? "" : "disabled"}>确定</button>`;
      }

      function renderOptoUploadModalUnified() {
        const body = document.getElementById("optoUploadWizard");
        const footer = document.getElementById("optoUploadFooter");
        if (!body || !footer) return;
        const draft = state.optoFlowUploadDraft;
        body.innerHTML = `
          ${buildWorkflowStepper(state.optoFlowUploadStep, ["上传文件", "确认入库"])}
          ${state.optoFlowUploadStep === 1 ? `
            <section class="wizard-section">
              <div class="wizard-title-row"><h4>第一步：上传文件</h4></div>
              <div class="upload-dropzone">
                <div>
                  <div class="upload-icon">⇪</div>
                  <button class="btn-primary" type="button" data-opto-flow-browse>点击上传</button>
                  <p>支持表征图谱、分子特征参数和计算结果文件上传。</p>
                </div>
              </div>
              <div class="upload-asset-panel">${draft ? renderUploadAssetList([{
                name: draft.fileName,
                format: draft.sourceFormat || "FILE",
                sizeText: draft.fileSizeText || "",
                previewUrl: draft.previewUrl || ""
              }], "未选择文件") : "未选择文件"}</div>
            </section>
          ` : `
            <section class="wizard-section">
              <div class="wizard-title-row"><h4>第二步：确认文件基本信息</h4></div>
              <div class="wizard-info-card">
                <div><strong>文件名称：</strong>${draft?.fileName || "-"}</div>
                <div><strong>文件大小：</strong>${draft?.fileSizeText || "-"}</div>
                <div><strong>源文件格式：</strong>${draft?.sourceFormat || "-"}</div>
              </div>
              <div class="wizard-actions">
                <div class="radio-row">
                  ${optoWorkflowCategoriesUnified.map((item) => `
                    <label class="algorithm-radio">
                      <input type="radio" name="optoFlowUploadType" value="${item.key}" ${draft?.category === item.key ? "checked" : ""}>
                      ${item.label}
                    </label>
                  `).join("")}
                </div>
              </div>
            </section>
          `}
        `;
        footer.innerHTML = state.optoFlowUploadStep === 1
          ? `<button class="btn" type="button" data-close-modal="optoUploadModal">取消</button><button class="btn-primary" type="button" data-opto-flow-next ${draft?.fileName ? "" : "disabled"}>下一步</button>`
          : `<button class="btn" type="button" data-opto-flow-back>上一步</button><button class="btn-primary" type="button" data-opto-flow-confirm ${draft?.category ? "" : "disabled"}>确定</button>`;
      }

      function renderMlffReviewModalUnified() {
        const body = document.getElementById("mlffReviewWizard");
        const footer = document.getElementById("mlffReviewFooter");
        if (!body || !footer) return;
        syncMlffSelectedReviewFile();
        const selected = findMlffUnifiedRecord(state.selectedMlffReviewFileId);
        const list = getMlffUnifiedLibrary(state.mlffReviewFilter);
        body.innerHTML = `
          ${buildWorkflowStepper(state.mlffReviewStep, ["选择文件", "补充信息", "预览提交"])}
          ${state.mlffReviewStep === 1 ? `
            <section class="wizard-section">
              <div class="wizard-title-row"><h4>第一步：选择待提交记录</h4></div>
              <div class="library-toolbar">
                <div class="radio-row">
                  ${mlffWorkflowTypesUnified.map((item) => `
                    <label class="algorithm-radio">
                      <input type="radio" name="mlffReviewFilter" value="${item.key}" ${state.mlffReviewFilter === item.key ? "checked" : ""}>
                      ${item.label}
                    </label>
                  `).join("")}
                </div>
                <div class="wizard-inline-card">仅草稿或审核不通过的文件可继续补充信息并提交审核。</div>
              </div>
              ${renderSelectableRecordList(list, state.selectedMlffReviewFileId, "mlffReview")}
            </section>
          ` : state.mlffReviewStep === 2 ? `
            <section class="wizard-section">
              <div class="wizard-title-row"><h4>第二步：补充文件基本信息</h4></div>
              <div class="wizard-info-card">
                <div><strong>当前文件：</strong>${selected?.fileName || "-"}</div>
                <div><strong>文件类别：</strong>${selected?.sourceType || "-"}</div>
              </div>
              <div class="field-grid" style="margin-top:18px;">
                <div class="field">
                  <label for="mlffReviewMaterialName">材料名称</label>
                  <input id="mlffReviewMaterialName" type="text" value="${state.mlffReviewForm.materialName}" placeholder="请输入材料名称">
                </div>
                <div class="field">
                  <label for="mlffReviewMaterialType">材料类别</label>
                  <input id="mlffReviewMaterialType" type="text" value="${state.mlffReviewForm.materialType}" placeholder="如：有机小分子">
                </div>
                <div class="field">
                  <label for="mlffReviewDataSource">数据来源</label>
                  <input id="mlffReviewDataSource" type="text" value="${state.mlffReviewForm.dataSource}" placeholder="如：理论计算">
                </div>
                <div class="field span-2">
                  <label for="mlffReviewDataDescription">数据描述</label>
                  <textarea id="mlffReviewDataDescription" rows="4" placeholder="请输入数据描述">${state.mlffReviewForm.dataDescription}</textarea>
                </div>
              </div>
            </section>
          ` : `
            <section class="wizard-section">
              <div class="wizard-title-row"><h4>第三步：预览提交信息</h4></div>
              <div class="workflow-preview-grid">
                <div class="workflow-preview-box">
                  <h4>文件信息</h4>
                  <div class="workflow-preview-list">
                    <strong>文件名称</strong><span>${selected?.fileName || "-"}</span>
                    <strong>文件类别</strong><span>${selected?.sourceType || "-"}</span>
                    <strong>源文件格式</strong><span>${selected?.sourceFormat || "-"}</span>
                    <strong>文件大小</strong><span>${selected?.fileSizeText || "-"}</span>
                  </div>
                </div>
                <div class="workflow-preview-box">
                  <h4>审核信息</h4>
                  <div class="workflow-preview-list">
                    <strong>材料名称</strong><span>${state.mlffReviewForm.materialName}</span>
                    <strong>材料类别</strong><span>${state.mlffReviewForm.materialType}</span>
                    <strong>数据来源</strong><span>${state.mlffReviewForm.dataSource}</span>
                    <strong>数据描述</strong><span>${state.mlffReviewForm.dataDescription}</span>
                  </div>
                </div>
                <div class="wizard-inline-card">提交后数据将进入审核环节，审核通过后加入机器学习力场数据库。</div>
              </div>
            </section>
          `}
        `;
        footer.innerHTML = state.mlffReviewStep === 1
          ? `<button class="btn" type="button" data-close-modal="mlffReviewModal">取消</button><button class="btn-primary" type="button" data-mlff-review-next ${!state.selectedMlffReviewFileId ? "disabled" : ""}>下一步</button>`
          : state.mlffReviewStep === 2
            ? `<button class="btn" type="button" data-mlff-review-back>上一步</button><button class="btn-primary" type="button" data-mlff-review-next>下一步</button>`
            : `<button class="btn" type="button" data-mlff-review-back>上一步</button><button class="btn-primary" type="button" data-mlff-review-submit>提交</button>`;
      }

      function renderOptoReviewModalUnified() {
        const body = document.getElementById("optoReviewWizard");
        const footer = document.getElementById("optoReviewFooter");
        if (!body || !footer) return;
        syncOptoSelectedReviewFile();
        const selected = findOptoUnifiedRecord(state.selectedOptoReviewFileId);
        const list = getOptoUnifiedLibrary(state.optoReviewFilter);
        body.innerHTML = `
          ${buildWorkflowStepper(state.optoReviewStep, ["选择文件", "补充信息", "预览提交"])}
          ${state.optoReviewStep === 1 ? `
            <section class="wizard-section">
              <div class="wizard-title-row"><h4>第一步：选择待提交记录</h4></div>
              <div class="library-toolbar">
                <div class="radio-row">
                  ${optoWorkflowCategoriesUnified.map((item) => `
                    <label class="algorithm-radio">
                      <input type="radio" name="optoReviewFilter" value="${item.key}" ${state.optoReviewFilter === item.key ? "checked" : ""}>
                      ${item.label}
                    </label>
                  `).join("")}
                </div>
                <div class="wizard-inline-card">仅草稿或审核不通过的文件可继续补充信息并重新提交。</div>
              </div>
              ${renderSelectableRecordList(list, state.selectedOptoReviewFileId, "optoReview")}
            </section>
          ` : state.optoReviewStep === 2 ? `
            <section class="wizard-section">
              <div class="wizard-title-row"><h4>第二步：补充文件基本信息</h4></div>
              <div class="wizard-info-card">
                <div><strong>当前文件：</strong>${selected?.fileName || "-"}</div>
                <div><strong>材料分类：</strong>${selected?.category || "-"}</div>
              </div>
              <div class="field-grid" style="margin-top:18px;">
                <div class="field">
                  <label for="optoReviewMaterialName">材料名称</label>
                  <input id="optoReviewMaterialName" type="text" value="${state.optoReviewForm.materialName}" placeholder="请输入材料名称">
                </div>
                <div class="field">
                  <label for="optoReviewMaterialType">材料类别</label>
                  <input id="optoReviewMaterialType" type="text" value="${state.optoReviewForm.materialType}" placeholder="如：发光材料">
                </div>
                <div class="field">
                  <label for="optoReviewDataSource">数据来源</label>
                  <input id="optoReviewDataSource" type="text" value="${state.optoReviewForm.dataSource}" placeholder="如：实验测量">
                </div>
                <div class="field span-2">
                  <label for="optoReviewDataDescription">数据描述</label>
                  <textarea id="optoReviewDataDescription" rows="4" placeholder="请输入数据描述">${state.optoReviewForm.dataDescription}</textarea>
                </div>
              </div>
            </section>
          ` : `
            <section class="wizard-section">
              <div class="wizard-title-row"><h4>第三步：预览提交信息</h4></div>
              <div class="workflow-preview-grid">
                <div class="workflow-preview-box">
                  <h4>文件信息</h4>
                  <div class="workflow-preview-list">
                    <strong>文件名称</strong><span>${selected?.fileName || "-"}</span>
                    <strong>材料分类</strong><span>${selected?.category || "-"}</span>
                    <strong>源文件格式</strong><span>${selected?.sourceFormat || "-"}</span>
                    <strong>文件大小</strong><span>${selected?.fileSizeText || "-"}</span>
                  </div>
                </div>
                <div class="workflow-preview-box">
                  <h4>审核信息</h4>
                  <div class="workflow-preview-list">
                    <strong>材料名称</strong><span>${state.optoReviewForm.materialName}</span>
                    <strong>材料类别</strong><span>${state.optoReviewForm.materialType}</span>
                    <strong>数据来源</strong><span>${state.optoReviewForm.dataSource}</span>
                    <strong>数据描述</strong><span>${state.optoReviewForm.dataDescription}</span>
                  </div>
                </div>
                <div class="wizard-inline-card">提交后进入专家审核流程，审核通过后写入有机光电材料数据库。</div>
              </div>
            </section>
          `}
        `;
        footer.innerHTML = state.optoReviewStep === 1
          ? `<button class="btn" type="button" data-close-modal="optoReviewModal">取消</button><button class="btn-primary" type="button" data-opto-review-next ${!state.selectedOptoReviewFileId ? "disabled" : ""}>下一步</button>`
          : state.optoReviewStep === 2
            ? `<button class="btn" type="button" data-opto-review-back>上一步</button><button class="btn-primary" type="button" data-opto-review-next>下一步</button>`
            : `<button class="btn" type="button" data-opto-review-back>上一步</button><button class="btn-primary" type="button" data-opto-review-submit>提交</button>`;
      }

      function renderMlffRecordModalUnified(recordId) {
        const record = findMlffUnifiedRecord(recordId);
        if (!record) return;
        document.getElementById("mlffRecordInfo").innerHTML = renderRecordDetailBody(record, "机器学习力场");
        openModal("mlffRecordModal");
      }

      function renderOptoRecordModalUnified(recordId) {
        const record = findOptoUnifiedRecord(recordId);
        if (!record) return;
        document.getElementById("optoRecordInfo").innerHTML = renderRecordDetailBody(record, "有机光电材料");
        openModal("optoRecordModal");
      }

      function openMlffUploadWorkflowUnified() {
        resetMlffFlowUploadState();
        document.getElementById("mlffUploadFileInputUnified").value = "";
        renderMlffUploadModalUnified();
        openModal("mlffUploadModal");
      }

      function openOptoUploadWorkflowUnified() {
        resetOptoFlowUploadState();
        document.getElementById("optoUploadFileInputUnified").value = "";
        renderOptoUploadModalUnified();
        openModal("optoUploadModal");
      }

      function openMlffReviewWorkflowUnified() {
        resetMlffReviewWorkflowUnified();
        renderMlffReviewModalUnified();
        openModal("mlffReviewModal");
      }

      function openOptoReviewWorkflowUnified() {
        resetOptoReviewWorkflowUnified();
        renderOptoReviewModalUnified();
        openModal("optoReviewModal");
      }

      const legacyRenderElectrolyteModuleUnified = renderElectrolyteModule;
      renderElectrolyteModule = function renderElectrolyteModuleUnified() {
        ensureUnifiedClosureState();
        ensureElectrolyteRuntimeState();
        ensureElectrolytePageStylesOverride();
        const root = document.getElementById("electrolyteApp");
        if (!root) return;
        if (state.electrolyteTab === "convert") {
          state.electrolyteTab = "search";
        }
        const category = state.electrolyteCategory;
        const config = ELECTROLYTE_MODULE_CONFIG[category];
        const activeMode = getActiveElectrolyteMode(category);
        const { valid } = getElectrolyteAppliedSearchOverride();
        const resultList = valid ? getElectrolyteResultList() : [];
        const total = resultList.length;
        const totalPages = Math.max(1, Math.ceil(Math.max(total, 1) / state.electrolytePageSize));
        state.electrolyteCurrentPage = Math.min(state.electrolyteCurrentPage, totalPages);
        const start = (state.electrolyteCurrentPage - 1) * state.electrolytePageSize;
        const pageRows = resultList.slice(start, start + state.electrolytePageSize);
        const columns = getElectrolyteVisibleResultColumns();
        root.innerHTML = `
          ${renderElectrolyteCategoryTabs()}
          <div class="twod-platform-shell electrolyte-main-column">
            <section class="card twod-search-platform electrolyte-search-panel">
              <div class="electrolyte-search-head">
                <div class="twod-mode-selector electrolyte-mode-selector" id="electrolyteModeSelector">
                  ${config.modes.map((item) => `<button class="twod-mode-btn${activeMode === item.key ? " active" : ""}" type="button" data-ely-mode="${item.key}">${item.label}</button>`).join("")}
                </div>
              </div>
              <div class="twod-mode-stage" id="electrolyteModeWorkspace">${renderElectrolyteModeWorkspace(category, activeMode)}</div>
            </section>
            ${valid ? `
              <section class="card twod-search-results">
                <div class="twod-results-head">
                  <div>
                    <div class="twod-result-count">找到 <strong>${total}</strong> 条相关数据</div>
                    <p class="twod-result-hint">${getElectrolyteResultHint(resultList)}</p>
                  </div>
                </div>
                ${renderElectrolyteResultToolbar(total)}
                <div class="table-wrap twod-result-table-wrap">
                  <table class="twod-result-table">
                    <thead>
                      ${renderElectrolyteResultHeader(columns)}
                    </thead>
                    <tbody>${pageRows.length ? pageRows.map((item) => `<tr>${columns.map((column) => renderElectrolyteResultCell(item, column)).join("")}</tr>`).join("") : `<tr><td colspan="${columns.length}" class="electrolyte-empty">未检索到符合条件的数据，请调整当前检索条件后重试。</td></tr>`}</tbody>
                  </table>
                </div>
                <div class="result-footer twod-result-footer">
                  ${renderSharedPaginationFooter({
                    total,
                    currentPage: state.electrolyteCurrentPage,
                    totalPages,
                    pageSize: state.electrolytePageSize,
                    pageSizeId: "electrolytePageSize",
                    pageAttr: "data-ely-page",
                    jumpModule: "electrolyte"
                  })}
                </div>
              </section>
            ` : `
              <section class="electrolyte-result-empty">
                <h4>检索结果列表未展开</h4>
                <p>${getElectrolyteResultHint([])}</p>
              </section>
            `}
          </div>
        `;
        syncElectrolyteSidebarSubmenu();
      };
      renderOptoModule = function renderOptoModuleUnified() {
        ensureUnifiedClosureState();
        ensureOptoRuntimeState();
        const page = document.getElementById("page-opto");
        if (!page) return;
        if (state.optoTab === "convert") {
          page.innerHTML = `
            <div class="page-head">
              <div>
                <h2>有机光电材料应用</h2>
                <p>面向有机光电材料的统一检索与数据查看平台，支持化学名称、分子式、分子编号、性质数据检索与文件转换。</p>
              </div>
            </div>
            ${renderUnifiedModuleTabs("opto", "convert")}
            ${renderMaterialConversionPanel("opto")}
          `;
          return;
        }
        const resultList = getOptoResultList();
        const hasAppliedFilters = hasOptoActiveFilters(state.optoAppliedSearch.mode, state.optoAppliedSearch.filters);
        const total = resultList.length;
        const totalPages = Math.max(1, Math.ceil(total / state.optoPageSize));
        state.optoCurrentPage = Math.min(state.optoCurrentPage, totalPages);
        const start = (state.optoCurrentPage - 1) * state.optoPageSize;
        const pageItems = resultList.slice(start, start + state.optoPageSize);

        page.innerHTML = `
          <div class="page-head">
            <div>
              <h2>有机光电材料应用</h2>
              <p>面向有机光电材料的统一检索与数据查看平台，支持化学名称、分子式、分子编号和性质数据检索。</p>
            </div>
          </div>
          ${renderUnifiedModuleTabs("opto", state.optoTab)}
          <div class="twod-platform-shell">
            <section class="card twod-search-platform">
              <div class="twod-search-hero">
                <div class="twod-search-copy">
                  <span class="twod-search-eyebrow">有机光电材料应用模块</span>
                  <h3>有机光电材料检索平台</h3>
                  <p>选择不同检索项后，仅展示对应输入条件。输入条件并点击检索后显示结果列表。</p>
                </div>
                <div class="twod-mode-selector" id="optoModeSelector">
                  ${Object.entries(OPTO_MODE_CONFIG).map(([key, item]) => `<button class="twod-mode-btn${state.optoSearchMode === key ? " active" : ""}" type="button" data-opto-mode="${key}">${item.label}</button>`).join("")}
                </div>
              </div>
              <div class="twod-mode-stage" id="optoModeWorkspace">${renderOptoModeWorkspace()}</div>
            </section>
            ${hasAppliedFilters ? `
              <section class="card twod-search-results">
                <div class="twod-results-head">
                  <div>
                    <div class="twod-result-count">找到 <strong>${total}</strong> 条相关材料</div>
                    <p class="twod-result-hint">${getOptoResultHint(resultList)}</p>
                  </div>
                </div>
                <div class="table-wrap twod-result-table-wrap">
                  <table class="twod-result-table">
                    <thead>
                      <tr>
                        <th>中文名称</th>
                        <th>英文名称</th>
                        <th>分子式</th>
                        <th>分子编号</th>
                        <th>数据来源</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>${renderOptoResultRows(pageItems)}</tbody>
                  </table>
                </div>
                <div class="result-footer twod-result-footer">
                  ${renderSharedPaginationFooter({
                    total,
                    currentPage: state.optoCurrentPage,
                    totalPages,
                    pageSize: state.optoPageSize,
                    pageSizeId: "optoResultPageSize",
                    pageAttr: "data-opto-page",
                    jumpModule: "opto"
                  })}
                </div>
              </section>
            ` : ""}
          </div>
        `;

        page.querySelectorAll('[data-open-material]').forEach((button) => {
          button.onclick = () => handleMaterialDetailOpen(button.dataset.openMaterial, button.dataset.materialView || "basic");
        });
      };

      renderMlffModule = function renderMlffModuleUnified() {
        ensureUnifiedClosureState();
        ensureMlffRuntimeState();
        ensureMlffPageStylesOverride();
        const page = document.getElementById("page-mlff");
        if (!page) return;
        if (state.mlffTab === "convert") {
          page.innerHTML = `
            <div class="page-head">
              <div>
                <h2>机器学习力场应用</h2>
                <p>围绕机器学习力场材料数据提供检索、详情查看、文件下载、格式转换和术语表浏览能力。</p>
              </div>
              <div class="page-tools">
                <button class="btn" type="button" data-mlff-glossary-jump>数据术语表</button>
              </div>
            </div>
            ${renderUnifiedModuleTabs("mlff", "convert")}
            ${renderMaterialConversionPanel("mlff")}
          `;
          return;
        }
        const hasResults = hasMlffAppliedSearchOverride();
        const resultList = getMlffResultList();
        const total = resultList.length;
        const totalPages = Math.max(1, Math.ceil(total / state.mlffPageSize));
        state.mlffPage = Math.min(state.mlffPage, totalPages);
        const start = (state.mlffPage - 1) * state.mlffPageSize;
        const pageRows = resultList.slice(start, start + state.mlffPageSize);

        page.innerHTML = `
          <div class="page-head">
            <div>
              <h2>机器学习力场应用</h2>
              <p>围绕机器学习力场材料数据提供检索、详情查看、文件下载和术语表浏览能力。</p>
            </div>
            <div class="page-tools">
              <button class="btn" type="button" data-mlff-glossary-jump>数据术语表</button>
            </div>
          </div>
          ${renderUnifiedModuleTabs("mlff", state.mlffTab)}
          <div class="twod-platform-shell">
            <section class="card twod-search-platform">
              <div class="twod-search-hero">
                <div class="twod-search-copy">
                  <span class="twod-search-eyebrow">机器学习力场应用模块</span>
                  <h3>机器学习力场检索平台</h3>
                  <p>通过检索类型切换不同条件面板。只有输入检索条件并点击“检索”后，页面才会显示对应的结果列表。</p>
                </div>
                <div class="twod-mode-selector" id="mlffModeSelector">
                  ${MLFF_SEARCH_MODES.map((item) => `<button class="twod-mode-btn${state.mlffSearchMode === item.key ? " active" : ""}" type="button" data-mlff-mode="${item.key}">${getMlffDisplayModeLabel(item.key)}</button>`).join("")}
                </div>
              </div>
              <div class="twod-mode-stage" id="mlffModeWorkspace">${renderMlffModeWorkspace()}</div>
            </section>
            ${hasResults ? `
              <section class="card twod-search-results">
                <div class="twod-results-head">
                  <div>
                    <div class="twod-result-count">找到 <strong>${total}</strong> 条相关数据</div>
                    <p class="twod-result-hint">${getMlffResultHint(resultList)}</p>
                  </div>
                </div>
                <div class="table-wrap twod-result-table-wrap">
                  <table class="twod-result-table">
                    <thead>
                      <tr>
                        <th>材料名称</th>
                        <th>分子式</th>
                        <th>数据来源</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>${renderMlffResultRows(pageRows)}</tbody>
                  </table>
                </div>
                <div class="result-footer twod-result-footer">
                  ${renderSharedPaginationFooter({
                    total,
                    currentPage: state.mlffPage,
                    totalPages,
                    pageSize: state.mlffPageSize,
                    pageSizeId: "mlffPageSizeFinal",
                    pageAttr: "data-mlff-page",
                    jumpModule: "mlff"
                  })}
                </div>
              </section>
            ` : ``}
          </div>
        `;

        page.querySelectorAll('[data-open-material]').forEach((button) => {
          button.onclick = () => handleMaterialDetailOpen(button.dataset.openMaterial, button.dataset.materialView || "basic");
        });
      };

      renderCatalystModule = function renderCatalystModuleUnified() {
        ensureUnifiedClosureState();
        ensureCatalystPlatformState();
        ensureCatalystPageStylesOverride();
        const page = document.getElementById("page-catalyst");
        if (!page) return;
        if (state.catalystTab === "convert") {
          page.innerHTML = `
            <div class="page-head">
              <div>
                <h2>催化材料应用</h2>
                <p>围绕催化材料检索、位点分析、材料对比、催化构建与文件转换形成完整业务链路。</p>
              </div>
            </div>
            ${renderCatalystUnifiedTabs("convert")}
            ${renderMaterialConversionPanel("catalyst")}
          `;
          return;
        }
        const resultList = getCatalystPlatformResults();
        const total = resultList.length;
        const hasApplied = hasCatalystAppliedSearchOverride();
        const { totalPages, items } = getCatalystPagedPlatformResults(resultList);
        page.innerHTML = `
          <div class="page-head">
            <div>
              <h2>催化材料应用</h2>
              <p>围绕催化材料检索、位点分析、材料对比与催化构建形成完整业务链路。</p>
            </div>
          </div>
          ${renderCatalystUnifiedTabs(state.catalystTab)}
          <div class="twod-platform-shell">
            <section class="card twod-search-platform">
              <div class="twod-search-hero">
                <div class="twod-search-copy">
                  <span class="twod-search-eyebrow">催化材料应用模块</span>
                  <h3>催化材料检索平台</h3>
                  <p>支持关键词、条件组合、元素组成、反应路线和性质详情等检索方式，输入条件后点击“检索”查看结果。</p>
                </div>
                <div class="twod-mode-selector" id="catalystModeSelector">
                  ${CATALYST_SEARCH_MODES.map((item) => `<button class="twod-mode-btn${state.catalystSearchMode === item.key ? " active" : ""}" type="button" data-catalyst-mode="${item.key}">${item.label}</button>`).join("")}
                </div>
              </div>
              <div class="twod-mode-stage" id="catalystModeWorkspace">${renderCatalystPlatformWorkspace()}</div>
            </section>
            ${hasApplied ? `
              <section class="card twod-search-results">
                <div class="twod-results-head">
                  <div>
                    <div class="twod-result-count">找到 <strong>${total}</strong> 条相关数据</div>
                    <p class="twod-result-hint">${getCatalystPlatformHint(resultList)}</p>
                  </div>
                  <div class="twod-result-actions">
                    <button class="btn" type="button" data-catalyst-workbench="site">活性位点分析</button>
                    <button class="btn" type="button" data-catalyst-workbench="compare">材料对比</button>
                    <button class="btn" type="button" data-catalyst-workbench="build">催化构建</button>
                    ${!hasLowDimRealCaseDataset("catalyst") && state.catalystBatchSelection.length ? `<button class="btn" type="button" data-catalyst-batch-download>批量下载</button>` : ""}
                  </div>
                </div>
                <div class="table-wrap twod-result-table-wrap">
                  <table class="twod-result-table">
                    <thead>
                      <tr>
                        <th>材料名称</th>
                        <th>元素组成</th>
                        <th>表面</th>
                        <th>催化性能</th>
                        <th>数据来源</th>
                        <th>更新时间</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>${renderCatalystPlatformRows(items)}</tbody>
                  </table>
                </div>
                <div class="result-footer twod-result-footer">
                  ${renderSharedPaginationFooter({
                    total,
                    currentPage: state.catalystPage,
                    totalPages,
                    pageSize: state.catalystPageSize,
                    pageSizeId: "catalystPageSizePlatform",
                    pageAttr: "data-catalyst-platform-page",
                    jumpModule: "catalyst"
                  })}
                </div>
              </section>
            ` : ``}
          </div>
        `;
      };

      function renderTwodModuleUnified() {
        ensureUnifiedClosureState();
        ensureTwodRuntimeState();
        ensureTwodPageStylesOverride();
        const page = document.getElementById("page-twod");
        const twodPageHead = page.querySelector(".page-head");
        if (twodPageHead) twodPageHead.style.display = "none";
        const appRoot = document.getElementById("twodAppRoot");
        const pageTools = document.getElementById("twodPageTools");
        if (!page || !appRoot) return;

        const headDesc = page.querySelector(".page-head p");
        const searchShell = appRoot.querySelector(".twod-platform-shell");
        const tabStrip = appRoot.querySelector(".module-tab-strip");
        if (tabStrip) {
          tabStrip.outerHTML = renderUnifiedModuleTabs("twod", state.twodTab);
        } else {
          appRoot.insertAdjacentHTML("afterbegin", renderUnifiedModuleTabs("twod", state.twodTab));
        }
        let convertShell = appRoot.querySelector('[data-material-convert-shell="twod"]');
        if (!convertShell) {
          appRoot.insertAdjacentHTML("beforeend", `<div data-material-convert-shell="twod" hidden></div>`);
          convertShell = appRoot.querySelector('[data-material-convert-shell="twod"]');
        }

        if (state.twodTab === "convert") {
          if (headDesc) headDesc.textContent = "聚焦二维材料文件格式转换，支持结构文件、计算数据和可视化源数据统一转换。";
          if (pageTools) pageTools.hidden = true;
          if (searchShell) searchShell.hidden = true;
          if (convertShell) {
            convertShell.hidden = false;
            convertShell.innerHTML = renderMaterialConversionPanel("twod");
          }
          return;
        }

        if (headDesc) {
          headDesc.textContent = "聚焦二维材料检索、预测分析与结果查看，支持多维属性检索。";
        }

        if (pageTools) pageTools.hidden = false;

        if (convertShell) convertShell.hidden = true;
        if (searchShell) searchShell.hidden = false;
        setTwodMode(state.twodSearchMode || "formula");
        refreshTwodResults({ resetPage: !state.twodHasSearched });
      }

      window.renderTwodModuleUnified = renderTwodModuleUnified;

      function bindUnifiedModuleTabs() {
        if (document.body.dataset.unifiedModuleTabsBound === "true") return;
        document.body.dataset.unifiedModuleTabsBound = "true";
        document.body.addEventListener("click", (event) => {
          const button = event.target.closest("[data-module-tab][data-module-target]");
          if (!button) return;
          const module = button.dataset.moduleTab;
          const target = button.dataset.moduleTarget;
          if (module === "twod") {
            state.twodTab = target;
            renderTwodModuleUnified();
            return;
          }
          if (module === "electrolyte") {
            state.electrolyteTab = target;
            renderElectrolyteModule();
            return;
          }
          if (module === "opto") {
            state.optoTab = target;
            renderOptoModule();
            return;
          }
          if (module === "mlff") {
            state.mlffTab = target;
            renderMlffModule();
            return;
          }
          if (module === "catalyst") {
            state.catalystTab = target;
            renderCatalystModule();
          }
        });
      }

      function bindUnifiedOptoAndMlffFlows() {
        if (document.body.dataset.unifiedOptoMlffFlowBound === "true") return;
        document.body.dataset.unifiedOptoMlffFlowBound = "true";

      document.body.addEventListener("click", (event) => {
        const convertUpload = event.target.closest("[data-material-convert-upload]");
        if (convertUpload) {
          const moduleKey = convertUpload.dataset.materialConvertUpload || "twod";
          document.querySelector(`[data-material-convert-file="${moduleKey}"]`)?.click();
          return;
        }
        const convertType = event.target.closest("[data-material-convert-type]");
        if (convertType) {
          const moduleKey = convertType.dataset.module || state.materialConvertActiveModule || "twod";
          const draft = getMaterialConversionDraft(moduleKey);
          draft.fileType = convertType.dataset.materialConvertType || "结构文件";
          draft.targetFormat = getMaterialConvertTargetFormats(draft.fileType, draft.sourceFormat)[0] || "";
          refreshMaterialConversionModule(moduleKey);
          return;
        }
        const convertClear = event.target.closest("[data-material-convert-clear]");
        if (convertClear) {
          const moduleKey = convertClear.dataset.materialConvertClear || "twod";
          state.materialConvertDraft = null;
          getMaterialConversionDraft(moduleKey);
          refreshMaterialConversionModule(moduleKey);
          return;
        }
        const convertStart = event.target.closest("[data-material-convert-start]");
        if (convertStart) {
          const moduleKey = convertStart.dataset.materialConvertStart || "twod";
          const draft = getMaterialConversionDraft(moduleKey);
          if (!draft.fileName) {
            showToast("文件转换", "请先选择系统内待转换文件。");
            return;
          }
          const resultName = buildMaterialConversionResultName(draft.fileName, draft.targetFormat);
          materialConversionRecords.unshift({
            id: `conv-${moduleKey}-${Date.now()}`,
            module: moduleKey,
            materialId: draft.materialId,
            materialName: getMaterialConversionMaterialName(moduleKey, draft.materialId),
            fileType: draft.fileType,
            sourceName: draft.fileName,
            sourceFormat: draft.sourceFormat,
            targetFormat: draft.targetFormat,
            resultName,
            status: "已完成",
            createdAt: getCurrentTimestamp(),
            operator: state.loginUser || "当前用户",
            remark: `${draft.fileType}已完成从 ${draft.sourceFormat} 到 ${draft.targetFormat} 的格式转换。`
          });
          state.materialConvertDraft = null;
          state.materialConvertFilters[moduleKey] = { keyword: "", type: "", status: "" };
          getMaterialConversionDraft(moduleKey);
          refreshMaterialConversionModule(moduleKey);
          showToast("文件转换", `${resultName} 已生成，可在转换记录中查询和下载。`);
          return;
        }
        const convertSearch = event.target.closest("[data-material-convert-search]");
        if (convertSearch) {
          const moduleKey = convertSearch.dataset.materialConvertSearch || "twod";
          state.materialConvertFilters[moduleKey] = {
            keyword: document.querySelector(`[data-material-convert-filter="keyword"][data-module="${moduleKey}"]`)?.value.trim() || "",
            type: document.querySelector(`[data-material-convert-filter="type"][data-module="${moduleKey}"]`)?.value || "",
            status: document.querySelector(`[data-material-convert-filter="status"][data-module="${moduleKey}"]`)?.value || ""
          };
          refreshMaterialConversionModule(moduleKey);
          return;
        }
        const convertReset = event.target.closest("[data-material-convert-reset]");
        if (convertReset) {
          const moduleKey = convertReset.dataset.materialConvertReset || "twod";
          state.materialConvertFilters[moduleKey] = { keyword: "", type: "", status: "" };
          refreshMaterialConversionModule(moduleKey);
          return;
        }
        const convertDetail = event.target.closest("[data-material-convert-detail]");
        if (convertDetail) {
          openMaterialConversionDetail(convertDetail.dataset.materialConvertDetail);
          return;
        }
        const convertDownload = event.target.closest("[data-material-convert-download]");
        if (convertDownload) {
          downloadMaterialConversionRecord(convertDownload.dataset.materialConvertDownload);
          return;
        }
        if (event.target.closest("[data-catalyst-go-submit]")) {
          if (typeof MarvisRouter !== "undefined" && MarvisRouter.go) MarvisRouter.go("page-data-submit");
          return;
        }
        if (event.target.closest("[data-catalyst-go-submissions]")) {
          if (typeof MarvisRouter !== "undefined" && MarvisRouter.go) MarvisRouter.go("page-my-submissions");
          return;
        }
        if (event.target.closest("[data-catalyst-go-review]")) {
          if (typeof MarvisRouter !== "undefined" && MarvisRouter.go) MarvisRouter.go("page-twod-review");
          return;
        }
        if (event.target.closest("[data-mlff-flow-open-add]")) {
          openMlffUploadWorkflowUnified();
          return;
        }
          if (event.target.closest("[data-mlff-flow-open-review]")) {
            openMlffReviewWorkflowUnified();
            return;
          }
          if (event.target.closest("[data-open-mlff-flow-record]")) {
            renderMlffRecordModalUnified(event.target.closest("[data-open-mlff-flow-record]").dataset.openMlffFlowRecord);
            return;
          }
          if (event.target.closest("[data-download-mlff-flow-record]")) {
            const record = findMlffUnifiedRecord(event.target.closest("[data-download-mlff-flow-record]").dataset.downloadMlffFlowRecord);
            if (record) showToast("文件下载", `${record.fileName} 已下载到本地环境。`);
            return;
          }
          if (event.target.closest("[data-opto-flow-open-add]")) {
            openOptoUploadWorkflowUnified();
            return;
          }
          if (event.target.closest("[data-opto-flow-open-review]")) {
            openOptoReviewWorkflowUnified();
            return;
          }
          if (event.target.closest("[data-open-opto-flow-record]")) {
            renderOptoRecordModalUnified(event.target.closest("[data-open-opto-flow-record]").dataset.openOptoFlowRecord);
            return;
          }
          if (event.target.closest("[data-download-opto-flow-record]")) {
            const record = findOptoUnifiedRecord(event.target.closest("[data-download-opto-flow-record]").dataset.downloadOptoFlowRecord);
            if (record) showToast("文件下载", `${record.fileName} 已下载到本地环境。`);
            return;
          }
          if (event.target.closest("[data-mlff-flow-browse]")) {
            document.getElementById("mlffUploadFileInputUnified")?.click();
            return;
          }
          if (event.target.closest("[data-mlff-flow-next]")) {
            state.mlffFlowUploadStep = 2;
            renderMlffUploadModalUnified();
            return;
          }
          if (event.target.closest("[data-mlff-flow-back]")) {
            state.mlffFlowUploadStep = 1;
            renderMlffUploadModalUnified();
            return;
          }
          if (event.target.closest("[data-mlff-flow-confirm]")) {
            const draft = state.mlffFlowUploadDraft;
            if (!draft?.fileName) return;
            mlffPersonalLibraryUnified.unshift({
              id: `mlff-lib-${Date.now()}`,
              uploadedAt: getCurrentTimestamp(),
              fileName: draft.fileName,
              fileSizeText: draft.fileSizeText,
              sizeBytes: draft.sizeBytes,
              category: draft.category || "charge",
              sourceType: mlffWorkflowTypesUnified.find((item) => item.key === (draft.category || "charge"))?.label || "未分类",
              sourceFormat: draft.sourceFormat,
              fileCategory: "草稿",
              reviewStatus: "",
              materialName: "",
              materialType: "",
              dataSource: "用户提交",
              dataDescription: "",
              visibility: "private"
            });
            closeModal("mlffUploadModal");
            resetMlffFlowUploadState();
            state.mlffTab = "update";
            renderMlffModule();
            showToast("新增数据", "文件已加入我的提交，并保存为草稿记录。");
            return;
          }
          if (event.target.closest("[data-opto-flow-browse]")) {
            document.getElementById("optoUploadFileInputUnified")?.click();
            return;
          }
          if (event.target.closest("[data-opto-flow-next]")) {
            state.optoFlowUploadStep = 2;
            renderOptoUploadModalUnified();
            return;
          }
          if (event.target.closest("[data-opto-flow-back]")) {
            state.optoFlowUploadStep = 1;
            renderOptoUploadModalUnified();
            return;
          }
          if (event.target.closest("[data-opto-flow-confirm]")) {
            const draft = state.optoFlowUploadDraft;
            if (!draft?.fileName) return;
            optoPersonalLibraryUnified.unshift({
              id: `opto-lib-${Date.now()}`,
              uploadedAt: getCurrentTimestamp(),
              fileName: draft.fileName,
              fileSizeText: draft.fileSizeText,
              sizeBytes: draft.sizeBytes,
              category: draft.category || "OLED",
              sourceType: draft.category === "OPV" ? "光伏性能数据" : "发光性能数据",
              sourceFormat: draft.sourceFormat,
              fileCategory: "草稿",
              reviewStatus: "",
              materialName: "",
              materialType: "",
              dataSource: "用户提交",
              dataDescription: "",
              visibility: "private"
            });
            closeModal("optoUploadModal");
            resetOptoFlowUploadState();
            state.optoTab = "update";
            renderOptoModule();
            showToast("新增数据", "文件已加入我的提交，并保存为草稿记录。");
            return;
          }
          if (event.target.closest("[data-mlff-review-next]")) {
            if (state.mlffReviewStep === 1) {
              if (!state.selectedMlffReviewFileId) {
                showToast("提交审核", "请先选择需要提交审核的文件。");
                return;
              }
              state.mlffReviewStep = 2;
            } else if (state.mlffReviewStep === 2) {
              state.mlffReviewForm.materialName = document.getElementById("mlffReviewMaterialName")?.value.trim() || "";
              state.mlffReviewForm.materialType = document.getElementById("mlffReviewMaterialType")?.value.trim() || "";
              state.mlffReviewForm.dataSource = document.getElementById("mlffReviewDataSource")?.value.trim() || "";
              state.mlffReviewForm.dataDescription = document.getElementById("mlffReviewDataDescription")?.value.trim() || "";
              if (!state.mlffReviewForm.materialName || !state.mlffReviewForm.materialType || !state.mlffReviewForm.dataSource || !state.mlffReviewForm.dataDescription) {
                showToast("提交审核", "请完整填写材料名称、类型、来源和描述。");
                return;
              }
              state.mlffReviewStep = 3;
            }
            renderMlffReviewModalUnified();
            return;
          }
          if (event.target.closest("[data-mlff-review-back]")) {
            state.mlffReviewStep = Math.max(1, state.mlffReviewStep - 1);
            renderMlffReviewModalUnified();
            return;
          }
          if (event.target.closest("[data-mlff-review-submit]")) {
            const record = findMlffUnifiedRecord(state.selectedMlffReviewFileId);
            if (!record) return;
            record.materialName = state.mlffReviewForm.materialName;
            record.materialType = state.mlffReviewForm.materialType;
            record.dataSource = state.mlffReviewForm.dataSource;
            record.dataDescription = state.mlffReviewForm.dataDescription;
            record.fileCategory = "数据处理更新";
            record.reviewStatus = "正在审核";
            record.visibility = "private";
            closeModal("mlffReviewModal");
            resetMlffReviewWorkflowUnified();
            state.mlffTab = "update";
            renderMlffModule();
            showToast("提交审核", "文件已提交审核，审核通过前仅当前用户可见。");
            return;
          }
          if (event.target.closest("[data-opto-review-next]")) {
            if (state.optoReviewStep === 1) {
              if (!state.selectedOptoReviewFileId) {
                showToast("提交审核", "请先选择需要提交审核的文件。");
                return;
              }
              state.optoReviewStep = 2;
            } else if (state.optoReviewStep === 2) {
              state.optoReviewForm.materialName = document.getElementById("optoReviewMaterialName")?.value.trim() || "";
              state.optoReviewForm.materialType = document.getElementById("optoReviewMaterialType")?.value.trim() || "";
              state.optoReviewForm.dataSource = document.getElementById("optoReviewDataSource")?.value.trim() || "";
              state.optoReviewForm.dataDescription = document.getElementById("optoReviewDataDescription")?.value.trim() || "";
              if (!state.optoReviewForm.materialName || !state.optoReviewForm.materialType || !state.optoReviewForm.dataSource || !state.optoReviewForm.dataDescription) {
                showToast("提交审核", "请完整填写材料名称、类型、来源和描述。");
                return;
              }
              state.optoReviewStep = 3;
            }
            renderOptoReviewModalUnified();
            return;
          }
          if (event.target.closest("[data-opto-review-back]")) {
            state.optoReviewStep = Math.max(1, state.optoReviewStep - 1);
            renderOptoReviewModalUnified();
            return;
          }
          if (event.target.closest("[data-opto-review-submit]")) {
            const record = findOptoUnifiedRecord(state.selectedOptoReviewFileId);
            if (!record) return;
            record.materialName = state.optoReviewForm.materialName;
            record.materialType = state.optoReviewForm.materialType;
            record.dataSource = state.optoReviewForm.dataSource;
            record.dataDescription = state.optoReviewForm.dataDescription;
            record.fileCategory = "数据处理更新";
            record.reviewStatus = "正在审核";
            record.visibility = "private";
            closeModal("optoReviewModal");
            resetOptoReviewWorkflowUnified();
            state.optoTab = "update";
            renderOptoModule();
            showToast("提交审核", "文件已提交审核，审核通过前仅当前用户可见。");
          }
        });

        document.body.addEventListener("change", (event) => {
          if (event.target.dataset.materialConvertFile) {
            const moduleKey = event.target.dataset.materialConvertFile || "twod";
            const file = event.target.files?.[0];
            if (!file) return;
            const sourceFormat = getMaterialConvertSourceFormat(file.name);
            const fileType = inferMaterialConvertFileType(file.name);
            const draft = getMaterialConversionDraft(moduleKey);
            draft.fileName = file.name;
            draft.fileSizeText = formatMaterialConvertFileSize(file.size || 0);
            draft.sourceFormat = sourceFormat;
            draft.fileType = fileType;
            draft.targetFormat = getMaterialConvertTargetFormats(fileType, sourceFormat)[0] || "";
            refreshMaterialConversionModule(moduleKey);
            return;
          }
          if (event.target.dataset.materialConvertField) {
            const moduleKey = event.target.dataset.module || "twod";
            const draft = getMaterialConversionDraft(moduleKey);
            draft[event.target.dataset.materialConvertField] = event.target.value;
            refreshMaterialConversionModule(moduleKey);
            return;
          }
          if (event.target.id === "mlffUploadFileInputUnified") {
            const file = event.target.files?.[0];
            if (!file) return;
            revokeUploadPreviewUrl(state.mlffFlowUploadDraft?.previewUrl);
            state.mlffFlowUploadDraft = {
              fileName: file.name,
              sourceFormat: inferMlffFileFormat(file.name),
              sizeBytes: file.size || 0,
              fileSizeText: formatMlffFileSize(file.size || 0),
              category: "charge",
              previewUrl: isUploadImageFile(file.name) ? URL.createObjectURL(file) : ""
            };
            renderMlffUploadModalUnified();
            return;
          }
          if (event.target.name === "mlffFlowUploadType" && state.mlffFlowUploadDraft) {
            state.mlffFlowUploadDraft.category = event.target.value;
            renderMlffUploadModalUnified();
            return;
          }
          if (event.target.name === "mlffReviewFilter") {
            state.mlffReviewFilter = event.target.value;
            syncMlffSelectedReviewFile();
            renderMlffReviewModalUnified();
            return;
          }
          if (event.target.dataset.recordSelect === "mlffReview") {
            state.selectedMlffReviewFileId = event.target.value;
            renderMlffReviewModalUnified();
            return;
          }
          if (event.target.id === "optoUploadFileInputUnified") {
            const file = event.target.files?.[0];
            if (!file) return;
            revokeUploadPreviewUrl(state.optoFlowUploadDraft?.previewUrl);
            state.optoFlowUploadDraft = {
              fileName: file.name,
              sourceFormat: detectFileFormat(file.name),
              sizeBytes: file.size || 0,
              fileSizeText: formatFileSize(file.size || 0),
              category: "OLED",
              previewUrl: isUploadImageFile(file.name) ? URL.createObjectURL(file) : ""
            };
            renderOptoUploadModalUnified();
            return;
          }
          if (event.target.name === "optoFlowUploadType" && state.optoFlowUploadDraft) {
            state.optoFlowUploadDraft.category = event.target.value;
            renderOptoUploadModalUnified();
            return;
          }
          if (event.target.name === "optoReviewFilter") {
            state.optoReviewFilter = event.target.value;
            syncOptoSelectedReviewFile();
            renderOptoReviewModalUnified();
            return;
          }
          if (event.target.dataset.recordSelect === "optoReview") {
            state.selectedOptoReviewFileId = event.target.value;
            renderOptoReviewModalUnified();
          }
        });
      }

      ensureUnifiedClosureStyles();
      ensureMaterialConversionStyles();
      ensureUnifiedWorkflowModals();
      ensureUnifiedClosureState();
      bindUnifiedModuleTabs();
      bindUnifiedOptoAndMlffFlows();

      renderTwodModuleUnified();
      renderElectrolyteModule();
      renderOptoModule();
      renderMlffModule();
      renderCatalystModule();
    })();

    /* ============================================================
       全面交互逻辑补充 - v1.0
       覆盖：筛选切换 · 弹窗 · 状态变更 · 表单 · 复选框全选 · Toast
       ============================================================ */
    (function() {
      'use strict';

      // ── 1. 增强 Toast（带类型图标） ──
      var _showToast = function(title, body, type) {
        var toast = document.getElementById('toast');
        if (!toast) return;
        var clsMap = { success: 'toast-success', warning: 'toast-warning', error: 'toast-error', info: 'toast-info' };
        var iconMap = { success: '\u2713', warning: '!', error: '\u00d7', info: 'i' };
        var cls = clsMap[type] || 'toast-info';
        var iconChar = iconMap[type] || 'i';
        toast.className = 'toast ' + cls;
        var icon = toast.querySelector('.toast-icon');
        if (!icon) {
          icon = document.createElement('span');
          icon.className = 'toast-icon';
          var titleEl = document.getElementById('toastTitle');
          var bodyEl = document.getElementById('toastBody');
          var wrap = document.createElement('div');
          wrap.className = 'toast-content';
          toast.appendChild(icon);
          if (titleEl) wrap.appendChild(titleEl);
          if (bodyEl) wrap.appendChild(bodyEl);
          toast.appendChild(wrap);
        }
        icon.textContent = iconChar;
        document.getElementById('toastTitle').textContent = title;
        document.getElementById('toastBody').textContent = body;
        toast.classList.add('show');
        clearTimeout(_showToast._timer);
        _showToast._timer = setTimeout(function() { toast.classList.remove('show'); }, 2500);
      };

      // ── 2. 登录页增强（忘记密码 + 记住我） ──
      // 登录/注册壳层已改为统一卡片布局，这里不再动态插入旧辅助行，避免两套布局叠加后造成卡片尺寸和按钮位置错位。
      (function() {})();

      // ── 3. 驳回理由弹窗 ──
      var _pendingRejectId = null;
      function _openRejectModal(recordId, label) {
        _pendingRejectId = recordId;
        var overlay = document.getElementById('rejectReasonModal');
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.className = 'overlay';
          overlay.id = 'rejectReasonModal';
          overlay.innerHTML =
            '<div class="modal modal-sm">' +
            '<div class="modal-header"><h3>驳回原因</h3><button class="modal-close" type="button">&times;</button></div>' +
            '<div class="modal-body">' +
            '<form class="reject-form"><textarea id="rejectReasonText" placeholder="请输入驳回理由（如格式不符、数据缺失等）"></textarea></form>' +
            '</div>' +
            '<div class="modal-footer">' +
            '<button class="btn" type="button" id="rejectCancelBtn">取消</button>' +
            '<button class="btn-primary btn-danger" type="button" id="rejectConfirmBtn">确认驳回</button>' +
            '</div></div>';
          document.body.appendChild(overlay);
          overlay.querySelector('.modal-close').addEventListener('click', function() { overlay.hidden = true; });
          overlay.querySelector('#rejectCancelBtn').addEventListener('click', function() { overlay.hidden = true; });
          overlay.querySelector('#rejectConfirmBtn').addEventListener('click', function() {
            var reason = document.getElementById('rejectReasonText').value.trim();
            if (!reason) { _showToast('驳回失败', '请输入驳回理由。', 'warning'); return; }
            overlay.hidden = true;
            // Sync to allSubmissions (fix race condition: do it here before clearing _pendingRejectId)
            if (_pendingRejectId && typeof syncReviewToSubmission === 'function') {
              syncReviewToSubmission(_pendingRejectId, 'rejected', reason);
            }
            if (_pendingRejectId && typeof twodUpdateRecords !== 'undefined') {
              var rec = twodUpdateRecords.find(function(r) { return r.id === _pendingRejectId; });
              if (rec) { rec.status = 'rejected'; rec.rejectReason = reason; }
              if (typeof renderTwodRecords === 'function') renderTwodRecords();
            }
            _showToast('已驳回', label + ' 已被驳回。理由：' + reason, 'warning');
            _pendingRejectId = null;
          });
        }
        if (_pendingRejectId && typeof twodUpdateRecords !== 'undefined') {
          var record = twodUpdateRecords.find(function(r) { return r.id === _pendingRejectId; });
          if (!record) { _showToast('操作失败', '未找到该记录。', 'error'); return; }
        }
        overlay.hidden = false;
      }

      // Also add a reject button to the existing recordDetailModal
      (function injectRejectBtn() {
        var footer = document.querySelector('#recordDetailModal .modal-footer');
        if (!footer || document.getElementById('recordRejectBtn')) return;
        var btn = document.createElement('button');
        btn.id = 'recordRejectBtn';
        btn.type = 'button';
        btn.className = 'btn btn-danger-outline';
        btn.style.cssText = '';
        btn.textContent = '驳回';
        btn.hidden = true;
        var closeBtn = footer.querySelector('[data-close-modal]');
        if (closeBtn) closeBtn.insertAdjacentElement('afterend', btn);
        else footer.appendChild(btn);
        btn.addEventListener('click', function() {
          if (typeof state !== 'undefined' && state.activeTwodRecordId) {
            _openRejectModal(state.activeTwodRecordId, '记录');
          }
        });
      })();

      // ── 4. 全局事件委托 ──
      document.body.addEventListener('click', function(event) {
        var target = event.target;

        // 4a. twod-filter-chip 胶囊切换（通用）
        var chip = target.closest('.twod-filter-chip');
        if (chip) {
          var container = chip.parentElement;
          container.querySelectorAll('.twod-filter-chip').forEach(function(c) { c.classList.remove('active'); });
          chip.classList.add('active');
          _handleFilterChipClick(chip, container);
          return;
        }

        // 4b. 审核工作台 - 材料类型切换 (data-review-material)
        var reviewMatBtn = target.closest('[data-review-material]');
        if (reviewMatBtn) {
          var bar = reviewMatBtn.parentElement;
          bar.querySelectorAll('[data-review-material]').forEach(function(b) { b.classList.remove('active'); });
          reviewMatBtn.classList.add('active');
          state.reviewMaterialFilter = reviewMatBtn.dataset.reviewMaterial;
          if (typeof renderTwodRecords === 'function') renderTwodRecords();
          return;
        }

        // 4e. 我的提交 - 操作按钮
        var subRow = target.closest('#page-my-submissions tbody tr');
        if (subRow && target.closest('button')) {
          var btnText = target.textContent.trim();
          var row = subRow;
          var name = row.cells[1] ? row.cells[1].textContent.trim() : '未知';
          if (btnText === '查看详情') {
            var timeCell = row.cells[0] ? row.cells[0].textContent.trim() : '';
            var typeCell = row.cells[2] ? row.cells[2].textContent.trim() : '';
            var statusCell = row.cells[3] ? row.cells[3].textContent.trim() : '';
            var rejectCell = row.cells[4] ? row.cells[4].textContent.trim() : '';
            document.getElementById("recordBasicInfo").innerHTML =
              '<span class="record-detail-label">材料名称</span><span class="record-detail-value">' + name + '</span>' +
              '<span class="record-detail-label">材料类型</span><span class="record-detail-value">' + typeCell + '</span>' +
              '<span class="record-detail-label">提交时间</span><span class="record-detail-value">' + timeCell + '</span>' +
              '<span class="record-detail-label">审核状态</span><span class="record-detail-value">' + statusCell + '</span>';
            var rejectReason = (rejectCell && rejectCell !== '-') ? rejectCell : '';
            document.getElementById("recordExtraInfo").innerHTML =
              '<span class="record-detail-label">材料名称</span><span class="record-detail-value">' + name + '</span>' +
              '<span class="record-detail-label">化学式</span><span class="record-detail-value">-</span>' +
              '<span class="record-detail-label">材料类别</span><span class="record-detail-value">' + typeCell + '</span>' +
              '<span class="record-detail-label">数据来源</span><span class="record-detail-value">-</span>' +
              '<span class="record-detail-label">数据描述</span><span class="record-detail-value">-</span>' +
              '<span class="record-detail-label">入库编号</span><span class="record-detail-value">未入库</span>';
            var statusLower = statusCell;
            if (statusCell.indexOf('已通过') !== -1) statusLower = 'approved';
            else if (statusCell.indexOf('驳回') !== -1) statusLower = 'rejected';
            else if (statusCell.indexOf('草稿') !== -1) statusLower = 'draft';
            else statusLower = 'pending';
            var materialDb = getMaterialDatabaseLabel(record.materialType || record.fileType || '');
            var msgMap = { approved:'该数据已审核通过，并已写入' + materialDb + '。', rejected:(rejectReason ? '该数据审核未通过。原因：' + rejectReason : '该数据审核未通过，请补充必要元数据后重新提交。'), draft:'该记录为草稿状态，尚未提交审核。', pending:'数据已提交，等待审核通过后写入' + materialDb + '。' };
            var msg = msgMap[statusLower] || ('数据已提交，等待审核通过后写入' + materialDb + '。');
            document.getElementById("recordStatusBlock").innerHTML =
              '<div class="record-detail-status-badge status-' + statusLower + '">' + statusCell + '</div>' +
              '<div class="record-detail-status-msg msg-' + (statusLower === 'approved' ? 'success' : statusLower === 'rejected' ? 'error' : 'warning') + '">' + msg + '</div>';
            document.getElementById("recordDetailDownloadBtn").dataset.recordId = '';
            document.getElementById("recordApproveBtn").setAttribute('hidden', '');
            document.getElementById("recordDetailModal").classList.add('show');
            return;
          }
          if (btnText === '重新编辑') {
            _showToast('重新编辑', '已加载「' + name + '」的草稿数据，请修改后重新提交。', 'info');
            if (typeof MarvisRouter !== 'undefined' && MarvisRouter.go) MarvisRouter.go('page-data-submit');
            return;
          }
          if (btnText === '提交审核') {
            _showToast('提交审核', '「' + name + '」已提交审核。', 'success');
            return;
          }
        }

        // 4f. 权限审批页 - 通过/驳回按钮 & 批量操作
        var permRow = target.closest('#page-sys-permission tbody tr');
        if (permRow && target.closest('button')) {
          var permBtnText = target.textContent.trim();
          var permName = permRow.cells[1] ? permRow.cells[1].textContent.trim() : '未知';
          var statusCell = permRow.cells[6];
          var actionCell = permRow.cells[7];
          if (permBtnText === '通过') {
            if (statusCell) statusCell.innerHTML = '<span class="status-badge success">已通过</span>';
            if (actionCell) actionCell.innerHTML = '<span style="color:var(--muted);">有效期至 2027-06-24</span>';
            _showToast('审批通过', '已批准「' + permName + '」的申请。', 'success');
            return;
          }
          if (permBtnText === '驳回') {
            if (statusCell) statusCell.innerHTML = '<span class="status-badge danger">已驳回</span>';
            if (actionCell) actionCell.innerHTML = '<span style="color:var(--muted);">理由：信息不完整</span>';
            _showToast('已驳回', '已驳回「' + permName + '」的申请。', 'warning');
            return;
          }
        }

        // 4g. 批量通过/批量驳回（权限审批页）
        var batchBtn = target.closest('#page-sys-permission .batch-actions button');
        if (batchBtn) {
          var checked = document.querySelectorAll('#page-sys-permission tbody input[type="checkbox"]:checked');
          if (checked.length === 0) {
            _showToast('提示', '请先勾选需要操作的记录。', 'warning');
            return;
          }
          var isApprove = batchBtn.textContent.includes('通过');
          checked.forEach(function(cb) {
            var row = cb.closest('tr');
            if (!row) return;
            var statusCell = row.cells[6];
            var actionCell = row.cells[7];
            if (isApprove) {
              if (statusCell) statusCell.innerHTML = '<span class="status-badge success">已通过</span>';
              if (actionCell) actionCell.innerHTML = '<span style="color:var(--muted);">有效期至 2027-06-24</span>';
            } else {
              if (statusCell) statusCell.innerHTML = '<span class="status-badge danger">已驳回</span>';
              if (actionCell) actionCell.innerHTML = '<span style="color:var(--muted);">理由：批量驳回</span>';
            }
          });
          _showToast(isApprove ? '批量通过' : '批量驳回', '已处理 ' + checked.length + ' 条记录。', isApprove ? 'success' : 'warning');
          return;
        }

        // 4h. 上传按钮（各材料应用页）
        if (target.matches('.twod-convert-upload-btn, .upload-btn, [data-twod-open-upload]') ||
            (target.closest('button') && target.textContent.includes('上传'))) {
          _showToast('文件上传', '已打开文件选择器，选择文件后将自动上传。支持 .cif / .vasp / .csv / .png 格式。', 'info');
        }

        // 4i. 数据上传页 - 材料类型芯片（不干扰全局 filter-chip 处理）
        if (target.closest('#page-data-submit .twod-filter-chip')) {
          var chip2 = target.closest('#page-data-submit .twod-filter-chip');
          var label = chip2.textContent.trim();
          if (typeof setDataSubmitMaterialType === 'function') setDataSubmitMaterialType(label);
          _showToast('选择类型', '已选择「' + label + '」材料类型。', 'info');
          return;
        }

        // 4j. 审核工作台 - 驳回按钮（表格行内）
        if (target.closest('[data-reject-record]')) {
          var rejectBtn = target.closest('[data-reject-record]');
          var recId = rejectBtn.dataset.rejectRecord;
          var rec = typeof twodUpdateRecords !== 'undefined' ? twodUpdateRecords.find(function(r) { return r.id === recId; }) : null;
          _openRejectModal(recId, rec ? (rec.materialName || rec.fileName || '记录') : '记录');
          return;
        }

        // 4k. 审核工作台 - 批量操作
        if (target.closest('#page-twod-review .batch-actions button')) {
          var batchActBtn = target.closest('#page-twod-review .batch-actions button');
          var checked2 = document.querySelectorAll('#twodWorkflowTableBody input[type="checkbox"]:checked');
          if (checked2.length === 0) {
            _showToast('提示', '请先勾选需要操作的记录。', 'warning');
            return;
          }
          var isBatchApprove = batchActBtn.textContent.includes('通过');
          checked2.forEach(function(cb) {
            var recId2 = cb.dataset.recordId;
            if (!recId2 || typeof twodUpdateRecords === 'undefined') return;
            var rec2 = twodUpdateRecords.find(function(r) { return r.id === recId2; });
            if (rec2) rec2.status = isBatchApprove ? 'approved' : 'rejected';
          });
          if (typeof renderTwodRecords === 'function') renderTwodRecords();
          if (typeof syncReviewToSubmission === 'function') {
            checked2.forEach(function(cb) {
              var rid = cb.dataset.recordId;
              if (rid) {
                syncReviewToSubmission(rid, isBatchApprove ? 'approved' : 'rejected', isBatchApprove ? '' : '批量驳回');
              }
            });
          }
          _showToast(isBatchApprove ? '批量通过' : '批量驳回', '已处理 ' + checked2.length + ' 条记录。', isBatchApprove ? 'success' : 'warning');
          return;
        }
      });

      // ── 5. 表格复选框全选 ──
      document.body.addEventListener('change', function(event) {
        var cb = event.target;
        if (cb.type !== 'checkbox') return;

        // 5a. thead 全选 → 同步 tbody
        var theadRow = cb.closest('thead tr');
        if (theadRow) {
          var table = cb.closest('table');
          if (!table) return;
          var tbody = table.querySelector('tbody');
          if (!tbody) return;
          var isChecked = cb.checked;
          tbody.querySelectorAll('input[type="checkbox"]').forEach(function(tb) { tb.checked = isChecked; });
          return;
        }

        // 5b. tbody 单个变更 → 更新 thead
        var tbodyRow = cb.closest('tbody tr');
        if (tbodyRow) {
          var table2 = cb.closest('table');
          if (!table2) return;
          var theadCb = table2.querySelector('thead input[type="checkbox"]');
          if (!theadCb) return;
          var allCbs = table2.querySelectorAll('tbody input[type="checkbox"]');
          var checkedCount = table2.querySelectorAll('tbody input[type="checkbox"]:checked').length;
          theadCb.checked = allCbs.length > 0 && checkedCount === allCbs.length;
          theadCb.indeterminate = checkedCount > 0 && checkedCount < allCbs.length;
        }
      });

      // ── 6. 辅助函数 ──
      function _handleFilterChipClick(chip, container) {
        var label = chip.textContent.trim();
        // 数据上传页材料类型 → 切换表单字段组
        if (container.closest('#page-data-submit')) {
          if (typeof setDataSubmitMaterialType === 'function') setDataSubmitMaterialType(label);
          _showToast('选择类型', '已选择「' + label + '」材料类型。', 'info');
          return;
        }
        // 审核页状态筛选
        if (container.closest('#page-twod-review')) {
          var filterNodes = container.querySelectorAll('[data-twod-review-filter]');
          if (filterNodes.length > 0) return; // 已有 data-* 绑定的走原有逻辑
          var filterValue = label;
          if (label === '全部状态') filterValue = 'all';
          else if (label === '待审核') filterValue = 'pending';
          else if (label === '已通过') filterValue = 'approved';
          else if (label === '已驳回') filterValue = 'rejected';
          if (typeof state !== 'undefined') state.twodReviewFilter = filterValue;
          if (typeof renderTwodRecords === 'function') renderTwodRecords();
          _showToast('筛选完成', '已筛选「' + label + '」状态。', 'info');
          return;
        }
        // 我的提交页 → 按类型/状态筛选
        if (container.closest('#page-my-submissions')) {
          // Determine if this is a type chip or status chip
          var typeLabels = ['全部类型','二维材料','有机光电材料','电解质材料','机器学习力场','催化材料'];
          var statusLabels = ['全部状态','草稿','待审核','审核中','已通过','已驳回'];
          var isStatusChip = statusLabels.indexOf(label) >= 0;
          // Only toggle chips in the same row
          var currentRow = chip.closest('.filter-row');
          currentRow.querySelectorAll('.twod-filter-chip').forEach(function(c) {
            c.classList.toggle('active', c === chip);
          });
          if (isStatusChip) {
            var activeTypeChip = container.querySelector('.filter-row:first-child .twod-filter-chip.active');
            var activeType = activeTypeChip ? activeTypeChip.textContent.trim() : '全部类型';
            renderAllSubmissions(activeType, label);
          } else {
            var activeStatusChip = container.querySelector('.filter-row:nth-child(2) .twod-filter-chip.active');
            var activeStatus = activeStatusChip ? activeStatusChip.textContent.trim() : '全部状态';
            renderAllSubmissions(label, activeStatus);
          }
          _showToast('筛选完成', '已按「' + label + '」筛选提交记录。', 'info');
          return;
        }
        // 权限审批页
        if (container.closest('#page-sys-permission')) {
          _showToast('筛选完成', '已按「' + label + '」筛选审批列表。', 'info');
          return;
        }
        // 系统配置页
        if (container.closest('#page-system-config')) {
          _showToast('切换配置', '已切换至「' + label + '」配置视图。', 'info');
          return;
        }
      }

      function _updateDashboardCharts(period) {
        var values = {
          '今日': { total: '9', rate: '82.5%', incoming: '42', growth: '3.1%' },
          '本周': { total: '9', rate: '80.0%', incoming: '310', growth: '7.8%' },
          '本月': { total: '9', rate: '80.5%', incoming: '1,280', growth: '12.5%' },
          '近30天': { total: '9', rate: '79.8%', incoming: '1,520', growth: '11.2%' }
        };
        var v = values[period] || values['本周'];
        var statCards = document.querySelectorAll('#page-dashboard .dash-stat-value');
        if (statCards.length >= 4) {
          statCards[0].textContent = v.total;
          statCards[1].textContent = v.rate;
          statCards[2].textContent = v.incoming;
        }
      }

      // ── 7. 注入审核工作台批量操作栏 ──
      (function injectBatchBar() {
        var reviewPage = document.getElementById('page-twod-review');
        if (!reviewPage || reviewPage.querySelector('.batch-actions')) return;
        var tools = reviewPage.querySelector('.page-tools');
        if (!tools) {
          var head = reviewPage.querySelector('.page-head');
          if (head) {
            tools = document.createElement('div');
            tools.className = 'page-tools';
            head.appendChild(tools);
          }
        }
        if (!tools) return;
        var batchBar = document.createElement('div');
        batchBar.className = 'batch-actions';
        batchBar.style.cssText = 'display:flex;gap:8px;';
        batchBar.innerHTML =
          '<button class="btn btn-primary btn-sm" type="button">批量通过</button>' +
          '<button class="btn btn-sm btn-danger-outline" type="button">批量驳回</button>';
        tools.appendChild(batchBar);
      })();

      // ── 8. 注入审核工作台表格复选框 + 驳回按钮 ──
      var _origRenderTwodRecords = typeof renderTwodRecords === 'function' ? renderTwodRecords : null;
      if (_origRenderTwodRecords) {
        var _patchedRender = false;
        renderTwodRecords = function() {
          _origRenderTwodRecords();
          _patchTwodTable();
          if (!_patchedRender) {
            _patchedRender = true;
            // Inject thead checkbox
            var thead = document.querySelector('#page-twod-review table thead tr');
            if (thead) {
              var th = document.createElement('th');
              th.innerHTML = '<input type="checkbox">';
              th.style.cssText = 'width:44px;text-align:center;';
              thead.insertBefore(th, thead.firstChild);
            }
          }
        };
      }

      function _patchTwodTable() {
        var body = document.getElementById('twodWorkflowTableBody');
        if (!body) return;
        // Add checkbox to each row
        body.querySelectorAll('tr').forEach(function(row) {
          if (row.querySelector('td:first-child input[type="checkbox"]')) return;
          var td = document.createElement('td');
          td.style.cssText = 'width:44px;text-align:center;';
          var approveBtn = row.querySelector('[data-approve-record]');
          var recId = approveBtn ? approveBtn.dataset.approveRecord : '';
          td.innerHTML = '<input type="checkbox" data-record-id="' + (recId || '') + '">';
          row.insertBefore(td, row.firstChild);

          // Add reject button for pending records
          var statusCell = row.querySelector('.twod-record-status');
          var actionsDiv = row.querySelector('.twod-record-inline-actions');
          if (statusCell && actionsDiv && statusCell.textContent.includes('待审核')) {
            if (!actionsDiv.querySelector('[data-reject-record]')) {
              var rejectBtn = document.createElement('button');
              rejectBtn.className = 'twod-record-link';
              rejectBtn.type = 'button';
              rejectBtn.dataset.rejectRecord = recId || '';
              rejectBtn.style.cssText = 'color:#dc2626;';
              rejectBtn.textContent = '驳回';
              actionsDiv.appendChild(rejectBtn);
            }
          }
          // Show/hide recordRejectBtn in detail modal
          var openBtn = row.querySelector('[data-open-record]');
          if (openBtn) {
            openBtn.addEventListener('click', function() {
              setTimeout(function() {
                var rb = document.getElementById('recordRejectBtn');
                var rec = typeof twodUpdateRecords !== 'undefined' && typeof state !== 'undefined' && state.activeTwodRecordId
                  ? twodUpdateRecords.find(function(r) { return r.id === state.activeTwodRecordId; }) : null;
                if (rb) rb.hidden = !rec || rec.status !== 'pending' || !rec.materialName;
              }, 100);
            });
          }
        });
      }

      // Initial patch after DOM ready
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(function() {
          if (typeof renderTwodRecords === 'function' && !renderTwodRecords._patched) {
            _patchTwodTable();
          }
        }, 500);
      }

    })();

    /* ============================================================
       BUSINESS LOGIC CLOSURE FIXES (闭环补全)
       - Shared data store for submissions/reviews
       - Dynamic my-submissions rendering
       - Submit → Review queue sync
       - Role-based sidebar visibility
       - Catalyst import → Review queue
       - Config → Review rules link
       - Permission ↔ 2D security indicator
       ============================================================ */
    (function() {
      /* ── 0. Utility ── */
      function ts() {
        var d = new Date();
        return d.getFullYear() + '-' +
          String(d.getMonth()+1).padStart(2,'0') + '-' +
          String(d.getDate()).padStart(2,'0') + ' ' +
          String(d.getHours()).padStart(2,'0') + ':' +
          String(d.getMinutes()).padStart(2,'0') + ':' +
          String(d.getSeconds()).padStart(2,'0');
      }
      function guid() { return 'sub-' + Date.now() + '-' + Math.random().toString(36).slice(2,8); }

      /* ── 1. Shared Data Stores ── */
      // allSubmissions: single source of truth for all user submissions
      // Seeds from the static my-submissions table + twodUpdateRecords
      var allSubmissions = [
        { id:'sub-001', time:'2026-06-20 14:30', materialName:'MoS₂ 单层', materialType:'二维材料', status:'approved', rejectReason:'', formula:'MoS₂', source:'自主计算' },
        { id:'sub-002', time:'2026-06-19 09:15', materialName:'PEDOT:PSS', materialType:'有机光电材料', status:'reviewing', rejectReason:'', formula:'PEDOT:PSS', source:'实验数据' },
        { id:'sub-003', time:'2026-06-18 16:42', materialName:'Li₇La₃Zr₂O₁₂', materialType:'电解质材料', status:'rejected', rejectReason:'格式不符：结构文件缺失', formula:'Li₇La₃Zr₂O₁₂', source:'文献引用' },
        { id:'sub-004', time:'2026-06-17 11:08', materialName:'Cu(111)-CO₂', materialType:'催化材料', status:'pending', rejectReason:'', formula:'Cu-CO₂', source:'自主计算' },
        { id:'sub-005', time:'2026-06-15 10:20', materialName:'Graphene/hBN', materialType:'二维材料', status:'draft', rejectReason:'', formula:'C-BN', source:'自主计算' }
      ];

      // allReviewQueue: feeds the review workbench; includes submissions + catalyst imports
      var allReviewQueue = [];

      // systemConfigState: in-memory mirror of page-system-config
      var systemConfigState = {
        materials: {
          '2DM': { name:'二维材料', errorTolerance:15, securityEnabled:true, userImportEnabled:false, syncCycle:'monthly' },
          'OPM': { name:'有机光电材料', errorTolerance:10, securityEnabled:false, userImportEnabled:false, syncCycle:'quarterly' },
          'ELY': { name:'电解质材料', errorTolerance:20, securityEnabled:false, userImportEnabled:false, syncCycle:'quarterly' },
          'MLF': { name:'机器学习力场', errorTolerance:5, securityEnabled:false, userImportEnabled:false, syncCycle:'semiannually' },
          'CAT': { name:'催化材料', errorTolerance:10, securityEnabled:false, userImportEnabled:true, syncCycle:'monthly' }
        }
      };

      // currentUserRole: 'researcher' | 'professional' | 'reviewer' | 'admin' | 'contributor'
      // 默认设为 admin，确保页面首次加载时显示所有导航项，不做角色隐藏。
      // 角色隔离功能通过 setUserRole() 保留，用户主动切换角色时才生效。
      var currentUserRole = 'admin';

      // Sync initial review queue from twodUpdateRecords + allSubmissions pending items
      function syncReviewQueue() {
        allReviewQueue = [];
        // From twodUpdateRecords (existing 2D review data)
        if (typeof twodUpdateRecords !== 'undefined') {
          twodUpdateRecords.forEach(function(r) {
            if (r.status === 'pending') {
              allReviewQueue.push({
                id: r.id,
                time: r.uploadedAt,
                materialName: r.fileName,
                materialType: '二维材料',
                status: 'pending',
                source: r.category || '文件格式转换',
                formula: '',
                recordRef: r
              });
            }
          });
        }
        // From allSubmissions
        allSubmissions.forEach(function(s) {
          if (s.status === 'pending' && !allReviewQueue.some(function(q) { return q.id === s.id; })) {
            allReviewQueue.push({
              id: s.id,
              time: s.time,
              materialName: s.materialName,
              materialType: s.materialType,
              status: 'pending',
              source: s.source || '',
              formula: s.formula || ''
            });
          }
        });
      }
      syncReviewQueue();

      /* ── 2. Dynamic My Submissions Rendering ── */
      function renderAllSubmissions(filterType, filterStatus) {
        var tbody = document.querySelector('#page-my-submissions .table-wrap tbody');
        var footer = document.querySelector('#page-my-submissions .result-footer span');
        if (!tbody) return;
        var list = allSubmissions.slice();
        if (filterType && filterType !== '全部类型') {
          list = list.filter(function(s) { return s.materialType === filterType; });
        }
        if (filterStatus && filterStatus !== '全部状态') {
          list = list.filter(function(s) { return s.status === filterStatus; });
        }
        var statusClass = { pending:'info', reviewing:'warning', approved:'success', rejected:'danger', draft:'muted' };
        var statusText = { pending:'待审核', reviewing:'审核中', approved:'已通过', rejected:'已驳回', draft:'草稿' };
        tbody.innerHTML = list.map(function(s) {
          var sc = statusClass[s.status] || 'muted';
          var st = statusText[s.status] || s.status;
          var reason = s.rejectReason || '-';
          var actionHtml = '';
          if (s.status === 'draft') {
            actionHtml = '<button class="btn-primary btn-sm" data-submit-submission-review="' + s.id + '">提交审核</button>';
          } else if (s.status === 'rejected') {
            actionHtml = '<button class="btn-primary btn-sm" data-reedit="' + s.id + '">重新编辑</button>';
          } else {
            actionHtml = '<button class="btn btn-sm" data-view-detail="' + s.id + '">查看详情</button>';
          }
          return '<tr><td>' + s.time + '</td><td>' + s.materialName + '</td><td>' + s.materialType + '</td><td><span class="status-badge ' + sc + '">' + st + '</span></td><td>' + reason + '</td><td class="action-cell">' + actionHtml + '</td></tr>';
        }).join('');
        if (footer) footer.textContent = '共 ' + list.length + ' 条提交记录';
      }

      // Hook into page switch to re-render my-submissions
      var _origRouterGo = typeof MarvisRouter !== 'undefined' && MarvisRouter.go ? MarvisRouter.go.bind(MarvisRouter) : null;
      if (_origRouterGo) {
        MarvisRouter.go = function(pageId) {
          _origRouterGo(pageId);
          setTimeout(function() {
            if (pageId === 'page-my-submissions') {
              var chips = document.querySelectorAll('#page-my-submissions .twod-filter-chip');
              var type = state.prefillSubmissionMaterialType || '全部类型';
              var status = '全部状态';
              chips.forEach(function(c) {
                var text = c.textContent.trim();
                if (['全部类型','二维材料','有机光电材料','电解质材料','机器学习力场','催化材料'].indexOf(text) >= 0) {
                  c.classList.toggle('active', text === type || (type === '全部类型' && text === '全部类型'));
                } else if (['全部状态','草稿','待审核','审核中','已通过','已驳回'].indexOf(text) >= 0) {
                  c.classList.toggle('active', text === status);
                }
              });
              renderAllSubmissions(type, status);
            }
            if (pageId === 'page-twod-review') {
              syncReviewQueue();
              if (typeof renderTwodRecords === 'function') renderTwodRecords();
            }
            applyRoleVisibility();
          }, 50);
        };
      }

      // Initial render on DOM ready
      setTimeout(function() {
        renderAllSubmissions();
      }, 200);

      /* ── 2b. Batch import for five material databases ── */
      var batchImportRules = {
        "二维材料": {
          code: "2DM",
          formats: ["cif", "poscar", "vasp", "xsf", "xyz", "csv", "tsv", "json", "xml", "txt", "dat", "out", "log", "png", "jpg", "jpeg", "webp", "svg", "zip"],
          hint: "二维材料支持结构文件、计算文本/表格、图谱图片和压缩包批量导入。"
        },
        "有机光电材料": {
          code: "OPM",
          formats: ["mol", "sdf", "cif", "xyz", "csv", "tsv", "xlsx", "xls", "json", "xml", "txt", "dat", "png", "jpg", "jpeg", "webp", "svg", "zip"],
          hint: "有机光电材料支持分子结构、表征图谱、计算结果和文本说明批量导入。"
        },
        "电解质材料": {
          code: "ELY",
          formats: ["cif", "poscar", "vasp", "xyz", "csv", "tsv", "xlsx", "xls", "json", "xml", "txt", "dat", "png", "jpg", "jpeg", "webp", "svg", "zip"],
          hint: "电解质材料支持结构文件、配方表、测试结果、图片和说明文件批量导入。"
        },
        "机器学习力场": {
          code: "MLF",
          formats: ["json", "npz", "h5", "hdf5", "xyz", "pdb", "mol2", "sdf", "csv", "tsv", "txt", "dat", "out", "log", "png", "jpg", "jpeg", "webp", "svg", "zip"],
          hint: "机器学习力场支持训练样本、参数文件、拓扑/结构文件、日志文本和可视化图片批量导入。"
        },
        "催化材料": {
          code: "CAT",
          formats: ["cif", "poscar", "vasp", "xsf", "xyz", "csv", "tsv", "xlsx", "xls", "json", "xml", "txt", "dat", "out", "log", "png", "jpg", "jpeg", "webp", "svg", "zip"],
          hint: "催化材料支持表面结构、反应路径、性质表格、文本日志和图谱图片批量导入。"
        }
      };

      function escapeBatchHtml(value) {
        return String(value == null ? "" : value).replace(/[&<>"']/g, function(ch) {
          return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
        });
      }

      function getActiveDataSubmitMaterialType() {
        var activeChip = document.querySelector("#page-data-submit .twod-filter-chip.active");
        return activeChip ? activeChip.textContent.trim() : "二维材料";
      }

      function getBatchFileExtension(fileName) {
        var name = String(fileName || "").trim();
        var lower = name.toLowerCase();
        if (["poscar", "contcar", "incar", "outcar"].indexOf(lower) >= 0) return lower;
        var dot = lower.lastIndexOf(".");
        return dot >= 0 ? lower.slice(dot + 1) : "";
      }

      function getBatchFileKind(ext) {
        if (["cif", "poscar", "contcar", "vasp", "xsf", "xyz", "mol", "sdf", "pdb", "mol2"].indexOf(ext) >= 0) return "结构文件";
        if (["png", "jpg", "jpeg", "webp", "svg"].indexOf(ext) >= 0) return "图片/图谱";
        if (["txt", "dat", "out", "log", "xml"].indexOf(ext) >= 0) return "文本文件";
        if (["csv", "tsv", "xlsx", "xls", "json", "npz", "h5", "hdf5"].indexOf(ext) >= 0) return "数据文件";
        if (ext === "zip") return "压缩包";
        return "未知类型";
      }

      function formatBatchFileSize(bytes) {
        var size = Number(bytes) || 0;
        if (size >= 1024 * 1024) return (size / 1024 / 1024).toFixed(2) + " MB";
        if (size >= 1024) return (size / 1024).toFixed(1) + " KB";
        return size + " B";
      }

      function buildBatchImportItem(file, materialType) {
        var rule = batchImportRules[materialType] || batchImportRules["二维材料"];
        var ext = getBatchFileExtension(file.name);
        var accepted = rule.formats.indexOf(ext) >= 0;
        var baseName = String(file.name || "未命名文件").replace(/\.[^.]+$/, "");
        return {
          file: file,
          fileName: file.name || "未命名文件",
          materialName: baseName || file.name || "批量导入材料",
          materialType: materialType,
          ext: ext || "无扩展名",
          fileKind: getBatchFileKind(ext),
          sizeText: formatBatchFileSize(file.size),
          accepted: accepted,
          reason: accepted ? "已加入待审核队列" : "不符合当前材料类型的格式规则"
        };
      }

      function updateBatchImportDropzone(items) {
        var dropzone = document.querySelector("#page-data-submit .upload-dropzone");
        if (!dropzone || !items.length) return;
        var accepted = items.filter(function(item) { return item.accepted; });
        dropzone.innerHTML = accepted.length
          ? "已批量导入 " + accepted.length + " 个文件；提交记录已进入“我的提交”和“入库审核”。"
          : "未导入文件：请选择符合当前材料类型格式要求的结构文件、图片或文本/数据文件。";
      }

      function renderBatchImportPreview(items, materialType) {
        var panel = document.getElementById("dataBatchImportPanel");
        var body = document.getElementById("dataBatchImportBody");
        var context = document.getElementById("dataBatchImportContext");
        if (!panel || !body) return;
        var accepted = items.filter(function(item) { return item.accepted; });
        var rejected = items.length - accepted.length;
        var rule = batchImportRules[materialType] || batchImportRules["二维材料"];
        if (context) context.textContent = rule.hint;
        panel.hidden = false;
        body.innerHTML = [
          '<div class="data-batch-import-summary">',
            '<div class="data-batch-import-stat"><span>识别文件</span><strong>' + items.length + '</strong></div>',
            '<div class="data-batch-import-stat"><span>导入成功</span><strong>' + accepted.length + '</strong></div>',
            '<div class="data-batch-import-stat"><span>待调整</span><strong>' + rejected + '</strong></div>',
          '</div>',
          '<table class="data-batch-import-table">',
            '<thead><tr><th>文件名</th><th>材料类型</th><th>文件类别</th><th>格式</th><th>大小</th><th>状态</th></tr></thead>',
            '<tbody>',
              items.map(function(item) {
                return '<tr>' +
                  '<td>' + escapeBatchHtml(item.fileName) + '</td>' +
                  '<td>' + escapeBatchHtml(item.materialType) + '</td>' +
                  '<td>' + escapeBatchHtml(item.fileKind) + '</td>' +
                  '<td>' + escapeBatchHtml(item.ext.toUpperCase()) + '</td>' +
                  '<td>' + escapeBatchHtml(item.sizeText) + '</td>' +
                  '<td><span class="data-batch-status ' + (item.accepted ? 'is-success' : 'is-warning') + '">' + escapeBatchHtml(item.reason) + '</span></td>' +
                '</tr>';
              }).join(''),
            '</tbody>',
          '</table>'
        ].join('');
      }

      function addBatchImportRecords(items, materialType) {
        var accepted = items.filter(function(item) { return item.accepted; });
        accepted.forEach(function(item) {
          var newSub = {
            id: guid(),
            time: ts(),
            materialName: item.materialName,
            materialType: materialType,
            status: "pending",
            rejectReason: "",
            formula: "",
            source: "批量导入",
            batchImport: true,
            fields: {
              fileName: item.fileName,
              fileType: item.fileKind,
              sourceFormat: item.ext.toUpperCase(),
              fileSize: item.sizeText,
              source: "批量导入"
            }
          };
          allSubmissions.unshift(newSub);
          if (typeof twodUpdateRecords !== "undefined") {
            twodUpdateRecords.unshift({
              id: newSub.id,
              uploadedAt: newSub.time,
              fileName: item.fileName,
              fileType: item.fileKind,
              sourceFormat: item.ext.toUpperCase(),
              category: "批量导入",
              status: "pending",
              materialName: item.materialName,
              materialFormula: "",
              materialType: materialType,
              source: "批量导入",
              workflowType: "批量导入",
              fields: newSub.fields
            });
          }
        });
        return accepted.length;
      }

      var dataSubmitBatchItems = [];

      function handleBatchImportFiles(fileList) {
        var files = Array.from(fileList || []);
        if (!files.length) return;
        var materialType = getActiveDataSubmitMaterialType();
        dataSubmitBatchItems = files.map(function(file) {
          var item = buildBatchImportItem(file, materialType);
          item.reason = item.accepted ? "待确认导入" : "不符合当前材料类型的格式规则";
          return item;
        });
        renderBatchImportPreview(dataSubmitBatchItems, materialType);
        if (typeof showToast === "function") {
          showToast("批量导入", "文件已识别，请确认导入信息后提交审核。");
        }
      }

      function resetDataSubmitBatchImport() {
        dataSubmitBatchItems = [];
        var panel = document.getElementById("dataBatchImportPanel");
        var body = document.getElementById("dataBatchImportBody");
        var input = document.getElementById("dataBatchImportInput");
        if (body) body.innerHTML = "";
        if (panel) panel.hidden = true;
        if (input) input.value = "";
      }

      function confirmDataSubmitBatchImport() {
        if (!dataSubmitBatchItems.length) {
          if (typeof showToast === "function") showToast("批量导入", "请先上传需要导入的文件。");
          return;
        }
        var materialType = dataSubmitBatchItems[0]?.materialType || getActiveDataSubmitMaterialType();
        dataSubmitBatchItems = dataSubmitBatchItems.map(function(item) {
          item.reason = item.accepted ? "已加入待审核队列" : "不符合当前材料类型的格式规则";
          return item;
        });
        var importedCount = addBatchImportRecords(dataSubmitBatchItems, materialType);
        syncReviewQueue();
        renderAllSubmissions();
        if (typeof renderTwodRecords === "function") renderTwodRecords();
        renderBatchImportPreview(dataSubmitBatchItems, materialType);
        updateBatchImportDropzone(dataSubmitBatchItems);
        if (typeof showToast === "function") {
          var rejectedCount = dataSubmitBatchItems.length - importedCount;
          showToast("导入成功", "已导入 " + importedCount + " 个文件并提交审核" + (rejectedCount ? "，" + rejectedCount + " 个文件需调整格式。" : "。"));
        }
        if (importedCount) {
          setTimeout(function() {
            if (typeof MarvisRouter !== "undefined" && MarvisRouter.go) MarvisRouter.go("page-twod-review");
          }, 600);
        }
      }

      window.refreshDataBatchImportContext = function(materialType) {
        var context = document.getElementById("dataBatchImportContext");
        var button = document.querySelector("[data-batch-import-open]");
        var rule = batchImportRules[materialType] || batchImportRules["二维材料"];
        if (context) context.textContent = rule.hint;
        if (button) button.title = rule.hint;
      };

      (function bindBatchImportFlow() {
        document.body.addEventListener("click", function(ev) {
          var openBtn = ev.target.closest("[data-batch-import-open]");
          if (openBtn) {
            var input = document.getElementById("dataBatchImportInput");
            window.refreshDataBatchImportContext(getActiveDataSubmitMaterialType());
            if (input) input.click();
            return;
          }
          var clearBtn = ev.target.closest("[data-batch-import-clear]");
          if (clearBtn) {
            resetDataSubmitBatchImport();
            return;
          }
          if (ev.target.closest("[data-batch-import-confirm]")) {
            confirmDataSubmitBatchImport();
          }
        });
        document.getElementById("dataBatchImportInput")?.addEventListener("change", function(ev) {
          handleBatchImportFiles(ev.target.files);
          ev.target.value = "";
        });
        setTimeout(function() {
          window.refreshDataBatchImportContext(getActiveDataSubmitMaterialType());
        }, 0);
      })();

      /* ── 2c. My submissions batch import: upload -> confirm -> review ── */
      var mySubmissionBatchFiles = [];
      var mySubmissionBatchItems = [];

      function getActiveMySubmissionMaterialType() {
        var activeTypeChip = document.querySelector("#page-my-submissions .filter-card .filter-row:first-child .twod-filter-chip.active");
        var label = activeTypeChip ? activeTypeChip.textContent.trim() : "二维材料";
        return label === "全部类型" ? "二维材料" : label;
      }

      function buildMySubmissionBatchItems(materialType) {
        return mySubmissionBatchFiles.map(function(file) {
          var item = buildBatchImportItem(file, materialType);
          item.reason = item.accepted ? "待确认导入" : "格式需调整";
          return item;
        });
      }

      function renderMySubmissionBatchConfirm(materialType) {
        var panel = document.getElementById("mySubmissionsBatchPanel");
        var body = document.getElementById("mySubmissionsBatchBody");
        var hint = document.getElementById("mySubmissionsBatchHint");
        var select = document.getElementById("mySubmissionsBatchMaterialType");
        if (!panel || !body) return;
        var rule = batchImportRules[materialType] || batchImportRules["二维材料"];
        mySubmissionBatchItems = buildMySubmissionBatchItems(materialType);
        var accepted = mySubmissionBatchItems.filter(function(item) { return item.accepted; });
        var rejected = mySubmissionBatchItems.length - accepted.length;
        if (select) select.value = materialType;
        if (hint) hint.textContent = rule.hint + " 确认后将生成待审核记录。";
        panel.hidden = false;
        body.innerHTML = [
          '<div class="my-submissions-batch-summary">',
            '<div class="my-submissions-batch-stat"><span>识别文件</span><strong>' + mySubmissionBatchItems.length + '</strong></div>',
            '<div class="my-submissions-batch-stat"><span>可导入</span><strong>' + accepted.length + '</strong></div>',
            '<div class="my-submissions-batch-stat"><span>需调整</span><strong>' + rejected + '</strong></div>',
          '</div>',
          '<table class="my-submissions-batch-table">',
            '<thead><tr><th>文件名</th><th>材料类型</th><th>文件类别</th><th>格式</th><th>大小</th><th>确认状态</th></tr></thead>',
            '<tbody>',
              mySubmissionBatchItems.map(function(item) {
                return '<tr>' +
                  '<td>' + escapeBatchHtml(item.fileName) + '</td>' +
                  '<td>' + escapeBatchHtml(item.materialType) + '</td>' +
                  '<td>' + escapeBatchHtml(item.fileKind) + '</td>' +
                  '<td>' + escapeBatchHtml(item.ext.toUpperCase()) + '</td>' +
                  '<td>' + escapeBatchHtml(item.sizeText) + '</td>' +
                  '<td><span class="data-batch-status ' + (item.accepted ? 'is-success' : 'is-warning') + '">' + escapeBatchHtml(item.reason) + '</span></td>' +
                '</tr>';
              }).join(''),
            '</tbody>',
          '</table>'
        ].join('');
      }

      function resetMySubmissionBatchConfirm() {
        mySubmissionBatchFiles = [];
        mySubmissionBatchItems = [];
        var panel = document.getElementById("mySubmissionsBatchPanel");
        var body = document.getElementById("mySubmissionsBatchBody");
        var input = document.getElementById("mySubmissionsBatchInput");
        if (body) body.innerHTML = "";
        if (panel) panel.hidden = true;
        if (input) input.value = "";
      }

      function confirmMySubmissionBatchImport() {
        var materialType = document.getElementById("mySubmissionsBatchMaterialType")?.value || getActiveMySubmissionMaterialType();
        mySubmissionBatchItems = buildMySubmissionBatchItems(materialType).map(function(item) {
          item.reason = item.accepted ? "已加入待审核队列" : "格式需调整";
          return item;
        });
        var importedCount = addBatchImportRecords(mySubmissionBatchItems, materialType);
        var rejectedCount = mySubmissionBatchItems.length - importedCount;
        if (!importedCount) {
          if (typeof showToast === "function") showToast("批量导入", "当前文件均不符合格式要求，请调整后重新上传。");
          renderMySubmissionBatchConfirm(materialType);
          return;
        }
        syncReviewQueue();
        state.prefillSubmissionMaterialType = materialType;
        renderAllSubmissions(materialType, "待审核");
        if (typeof renderTwodRecords === "function") renderTwodRecords();
        resetMySubmissionBatchConfirm();
        if (typeof showToast === "function") {
          showToast("导入成功", "已导入 " + importedCount + " 个文件并提交审核" + (rejectedCount ? "，" + rejectedCount + " 个文件需调整格式。" : "。"));
        }
        setTimeout(function() {
          if (typeof MarvisRouter !== "undefined" && MarvisRouter.go) MarvisRouter.go("page-twod-review");
        }, 600);
      }

      (function bindMySubmissionBatchImport() {
        document.body.addEventListener("click", function(ev) {
          var openBtn = ev.target.closest("[data-my-submissions-batch-open]");
          if (openBtn) {
            var input = document.getElementById("mySubmissionsBatchInput");
            if (input) input.click();
            return;
          }
          if (ev.target.closest("[data-my-submissions-batch-cancel]")) {
            resetMySubmissionBatchConfirm();
            return;
          }
          if (ev.target.closest("[data-my-submissions-batch-confirm]")) {
            confirmMySubmissionBatchImport();
          }
        });
        document.getElementById("mySubmissionsBatchInput")?.addEventListener("change", function(ev) {
          mySubmissionBatchFiles = Array.from(ev.target.files || []);
          if (!mySubmissionBatchFiles.length) return;
          renderMySubmissionBatchConfirm(getActiveMySubmissionMaterialType());
          ev.target.value = "";
        });
        document.getElementById("mySubmissionsBatchMaterialType")?.addEventListener("change", function(ev) {
          if (!mySubmissionBatchFiles.length) return;
          renderMySubmissionBatchConfirm(ev.target.value || "二维材料");
        });
      })();

      /* ── 3. Submit Flow: data-submit → my-submissions + review queue ── */
      (function hookSubmitFlow() {
        document.body.addEventListener('click', function(ev) {
          var submitBtn = ev.target.closest('#page-data-submit .submit-actions .btn-primary');
          if (!submitBtn) return;
          ev.preventDefault();
          ev.stopPropagation();

          var activeChip = document.querySelector('#page-data-submit .twod-filter-chip.active');
          var materialType = activeChip ? activeChip.textContent.trim() : '二维材料';
          var activeGroup = document.querySelector('#page-data-submit .material-form-group[data-material="' + materialType + '"]');

          // Collect all fields via data-field
          var fieldValues = {};
          if (activeGroup) {
            activeGroup.querySelectorAll('[data-field]').forEach(function(el) {
              fieldValues[el.dataset.field] = (el.value || '').trim();
            });
          }
          var materialName = fieldValues.materialName || '未命名材料';
          var formula = fieldValues.formula || '';
          var source = fieldValues.source || '自主计算';

          var newSub = {
            id: guid(), time: ts(),
            materialName: materialName, materialType: materialType,
            status: 'pending', rejectReason: '',
            formula: formula, source: source,
            fields: fieldValues
          };
          allSubmissions.unshift(newSub);

          // All 5 material types → twodUpdateRecords
          if (typeof twodUpdateRecords !== 'undefined') {
            twodUpdateRecords.unshift({
              id: newSub.id, uploadedAt: newSub.time,
              fileName: materialName, fileType: materialType,
              sourceFormat: source, category: '数据上传',
              status: 'pending',
              materialName: materialName,
              materialFormula: formula,
              materialType: materialType,
              source: source,
              fields: fieldValues
            });
          }

          syncReviewQueue();

          if (typeof showToast === 'function') {
            showToast('提交成功', '您的材料数据已提交，进入审核队列。');
          }

          setTimeout(function() {
            if (typeof MarvisRouter !== 'undefined' && MarvisRouter.go) {
              MarvisRouter.go('page-my-submissions');
            }
            renderAllSubmissions();
          }, 600);
        }, true); // capture phase to beat existing handler
      })();

      /* ── 4. Review Approve/Reject → My Submissions Sync ── */
      function syncReviewToSubmission(recordId, newStatus, rejectReason) {
        // Update allSubmissions
        var sub = allSubmissions.find(function(s) { return s.id === recordId; });
        if (sub) {
          sub.status = newStatus;
          if (rejectReason) sub.rejectReason = rejectReason;
        }
        // Update twodUpdateRecords
        if (typeof twodUpdateRecords !== 'undefined') {
          var rec = twodUpdateRecords.find(function(r) { return r.id === recordId; });
          if (rec) {
            rec.status = newStatus;
            if (rejectReason) rec.rejectReason = rejectReason;
          }
        }
        syncReviewQueue();
        renderAllSubmissions();
      }

      // Hook into approve button clicks on review workbench
      document.addEventListener('click', function(ev) {
        var approveBtn = ev.target.closest('[data-approve-record]');
        if (!approveBtn) return;
        var recordId = approveBtn.dataset.approveRecord;
        if (!recordId) return;
        setTimeout(function() {
          syncReviewToSubmission(recordId, 'approved', '');
        }, 200);
      });

      /* ── 5. Role-based Sidebar Visibility (闭环四) ── */
      var adminOnlyPages = ['dashboard','data-resource-catalog','sys-permission','sys-user','sys-role',
        'sys-menu','sys-dict','sys-algorithm','sys-api','system-config','sys-log',
        'standard-system-manage'];
      var reviewerPages = ['twod-review'];
      // standards = 低维材料标准体系分组。
      // 普通用户（researcher）可查看「低维材料标准体系」，但看不到、也进不去
      // 「低维材料标准体系管理」（standard-system-manage），后者仅管理员可维护。
      var normalAllowedGroups = ['applications','standards','analysis','workflow'];
      var normalAllowedPortals = ['applications','algorithms','tools','workflow'];

      function getPageGroupForRole(page) {
        if (typeof resolvePageMeta === 'function') {
          var meta = resolvePageMeta(page);
          if (meta && meta.group) return meta.group;
        }
        var nav = document.querySelector('.nav-btn[data-page="' + page + '"]');
        return nav ? nav.getAttribute('data-group') : '';
      }

      function isPageAllowedForCurrentRole(page) {
        if (currentUserRole === 'admin') return true;
        // 「低维材料标准体系管理」为管理员专属维护页；普通用户只能查看「低维材料标准体系」。
        if (page === 'standard-system-manage') return false;
        if (currentUserRole === 'reviewer') {
          return adminOnlyPages.indexOf(page) < 0;
        }
        return normalAllowedGroups.indexOf(getPageGroupForRole(page)) >= 0;
      }

      function applyRoleVisibility() {
        var sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        var isAdmin = currentUserRole === 'admin';
        var isReviewer = currentUserRole === 'reviewer';
        var isStaff = isAdmin || isReviewer;
        document.body.dataset.userRole = currentUserRole;

        sidebar.querySelectorAll('.sidebar-group').forEach(function(group) {
          var groupKey = group.getAttribute('data-group') || '';
          if (isAdmin) {
            group.style.display = '';
          } else if (currentUserRole === 'researcher') {
            group.style.display = normalAllowedGroups.indexOf(groupKey) >= 0 ? '' : 'none';
          } else {
            group.style.display = group.classList.contains('admin-group') ? 'none' : '';
          }
        });

        document.querySelectorAll('.portal-link').forEach(function(link) {
          var portal = link.getAttribute('data-portal') || '';
          if (isAdmin) {
            link.style.display = '';
          } else if (currentUserRole === 'researcher') {
            link.style.display = normalAllowedPortals.indexOf(portal) >= 0 ? '' : 'none';
          } else {
            link.style.display = portal === 'system' ? 'none' : '';
          }
        });

        // Show/hide twod-review nav in workflow group
        var reviewNav = sidebar.querySelector('[data-page="twod-review"]');
        if (reviewNav) {
          reviewNav.style.display = isStaff ? '' : 'none';
        }

        // 低维材料标准体系：管理员可见「低维材料标准体系」+「低维材料标准体系管理」，
        // 普通用户只保留「低维材料标准体系」查看入口，「体系管理」入口隐藏。
        var standardManageNav = sidebar.querySelector('.nav-btn[data-page="standard-system-manage"]');
        if (standardManageNav) {
          standardManageNav.style.display = isAdmin ? '' : 'none';
        }
        var standardViewNav = sidebar.querySelector('.nav-btn[data-page="standard-twod"]');
        if (standardViewNav) {
          standardViewNav.style.display = '';
        }

        // Hide prediction task management from ordinary users.
        var predictionTasksNav = sidebar.querySelector('[data-page="prediction-tasks"]');
        if (predictionTasksNav) {
          predictionTasksNav.style.display = '';
        }
        // If currently on a restricted page and role changed, redirect to twod
        if (typeof state !== 'undefined') {
          if (!isPageAllowedForCurrentRole(state.page) ||
              (reviewerPages.indexOf(state.page) >= 0 && !isStaff)) {
            if (typeof MarvisRouter !== 'undefined' && MarvisRouter.go) {
              MarvisRouter.go('page-twod');
            }
          }
        }

        // Add role indicator to topbar
        var topbarRight = document.querySelector('.topbar-right');
        if (topbarRight) {
          var existing = topbarRight.querySelector('.role-indicator');
          if (existing) existing.remove();
          var roleNames = {researcher:'普通用户', professional:'专业用户', reviewer:'审核员', admin:'系统管理员', contributor:'数据贡献者'};
          var roleColors = {researcher:'#8a97aa', professional:'#1890ff', reviewer:'#7C4DFF', admin:'#FF9800', contributor:'#16a34a'};
          var badge = document.createElement('span');
          badge.className = 'role-indicator';
          badge.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;margin-left:8px;background:' + roleColors[currentUserRole] + '15;color:' + roleColors[currentUserRole] + ';border:1px solid ' + roleColors[currentUserRole] + '40;';
          badge.textContent = (roleNames[currentUserRole] || '未知') + ' 身份';
          topbarRight.appendChild(badge);
        }
      }

      // Initial apply (MarvisRouter.go is already patched in section 2 above)
      setTimeout(applyRoleVisibility, 100);

      if (typeof switchPage === 'function' && !switchPage.__roleGuarded) {
        var switchPageBeforeRoleGuard = switchPage;
        switchPage = function(page) {
          var target = isPageAllowedForCurrentRole(page) ? page : 'twod';
          switchPageBeforeRoleGuard(target);
          setTimeout(applyRoleVisibility, 0);
        };
        switchPage.__roleGuarded = true;
      }

      /* ── 6. Catalyst Import → Review Queue (闭环五) ── */
      (function hookCatalystImport() {
        // Hook the catalyst import upload button
        document.addEventListener('click', function(ev) {
          var importBtn = ev.target.closest('#page-catalyst-import .upload-dropzone .btn-primary');
          if (!importBtn) return;
          // Skip if already hooked
          if (importBtn.dataset.hooked === '1') return;
          importBtn.dataset.hooked = '1';
          ev.preventDefault();
          ev.stopPropagation();

          // Simulate batch import
          var batchId = 'cat-imp-' + Date.now();
          var batchTime = ts();
          var batchNumber = 'WK' + String(new Date().getDate()).padStart(2,'0') + '-2026';

          // Add to allSubmissions as pending
          var sampleMaterials = [
            { name:'Cu(100)-CO₂催化', formula:'Cu-CO₂' },
            { name:'Pt(111)-O₂裂解', formula:'Pt-O₂' },
            { name:'Ni-Fe合金催化', formula:'NiFe' }
          ];
          sampleMaterials.forEach(function(m, i) {
            allSubmissions.unshift({
              id: batchId + '-' + i,
              time: batchTime,
              materialName: m.name,
              materialType: '催化材料',
              status: 'pending',
              rejectReason: '',
              formula: m.formula,
              source: '众包导入',
              batchNumber: batchNumber
            });
          });

          syncReviewQueue();
          renderAllSubmissions();

          // Add import record to the catalyst import history table
          var tbody = document.querySelector('#page-catalyst-import table tbody');
          if (tbody) {
            var tr = document.createElement('tr');
            tr.innerHTML = '<td>众包导入_' + batchNumber + '.xlsx</td>' +
              '<td>' + batchTime.split(' ')[0] + '</td>' +
              '<td>' + sampleMaterials.length + '</td>' +
              '<td><span class="status-badge info">待审核</span></td>' +
              '<td>' + batchNumber + '</td>' +
              '<td><button class="btn btn-sm" data-track="' + batchId + '">追踪</button></td>';
            tbody.insertBefore(tr, tbody.firstChild);
            var footer = document.querySelector('#page-catalyst-import .result-footer span');
            if (footer) {
              var current = parseInt(footer.textContent.match(/\d+/)) || 0;
              footer.textContent = '共 ' + (current + 1) + ' 条导入记录';
            }
          }

          if (typeof showToast === 'function') {
            showToast('导入成功', '已导入 ' + sampleMaterials.length + ' 条催化材料数据，进入审核队列。');
          }
        });
      })();

      /* ── 7. Config → Review Rules Sync (闭环六) ── */
      (function hookConfigReviewSync() {
        // Monitor page-system-config save buttons
        document.addEventListener('click', function(ev) {
          var saveBtn = ev.target.closest('#page-system-config .btn.btn-sm');
          if (!saveBtn) return;
          setTimeout(function() {
            // Read all config rows and update systemConfigState
            var rows = document.querySelectorAll('#page-system-config tbody tr');
            var codes = ['2DM','OPM','ELY','MLF','CAT'];
            rows.forEach(function(row, i) {
              if (i >= codes.length) return;
              var cells = row.querySelectorAll('td');
              var tolerance = cells[2] ? parseInt(cells[2].textContent.trim()) : systemConfigState.materials[codes[i]].errorTolerance;
              systemConfigState.materials[codes[i]].errorTolerance = tolerance || systemConfigState.materials[codes[i]].errorTolerance;
            });
            if (typeof showToast === 'function') {
              showToast('配置已保存', '系统配置已更新，审核工作台的格式容错规则将同步生效。');
            }
            // Update review workbench helper text if visible
            syncConfigToReviewHelper();
          }, 100);
        });
      })();

      function syncConfigToReviewHelper() {
        var helperEl = document.querySelector('#page-twod-review .page-head p');
        if (!helperEl) return;
        var twodCfg = systemConfigState.materials['2DM'];
        helperEl.textContent = '审核员专属工作台。当前格式容错率：' + twodCfg.errorTolerance + '%（二维材料），安全分级已' + (twodCfg.securityEnabled ? '启用' : '禁用') + '。修改系统配置后即时生效。';
      }

      // Initialize config helper on page load
      setTimeout(syncConfigToReviewHelper, 300);

      /* ── 8. Permission Approval ↔ 2D Security Indicator (闭环三) ── */
      (function hookPermApproval2DSecurity() {
        document.addEventListener('click', function(ev) {
          var approveBtn = ev.target.closest('#page-sys-permission .btn-primary.btn-sm');
          if (!approveBtn) return;
          var row = approveBtn.closest('tr');
          if (!row) return;
          var appType = row.querySelectorAll('td')[2];
          if (!appType) return;
          var typeText = appType.textContent.trim();

          setTimeout(function() {
            // If approving a "专业用户" application, enable 2D level 2 data access
            if (typeText === '专业用户') {
              if (typeof showToast === 'function') {
                showToast('审批完成', '专业用户权限已开通，该用户可访问二维材料第2级（半公开）数据。');
              }
              // Update the permission page: add note about 2D security
              var headNote = document.querySelector('#page-sys-permission .page-head p');
              if (headNote && !headNote.textContent.includes('二维材料第2级')) {
                var noteSpan = document.createElement('span');
                noteSpan.style.cssText = 'display:block;margin-top:4px;color:#7C4DFF;font-weight:600;';
                noteSpan.textContent = '[联动] 已审批通过的专业用户将自动获得二维材料第2级（半公开）数据访问权限。';
                headNote.appendChild(noteSpan);
              }
              // Add 2D security indicator to the approved row
              var approvedRow = document.querySelector('#page-sys-permission tbody .status-badge.success');
              if (approvedRow) {
                var indicator = document.createElement('span');
                indicator.style.cssText = 'display:inline-block;margin-left:8px;padding:2px 6px;border-radius:4px;font-size:11px;background:#e6f7ff;color:#1890ff;border:1px solid #91d5ff;';
                indicator.textContent = '2D-L2已开通';
                approvedRow.parentNode.appendChild(indicator);
              }
            }
          }, 200);
        });
      })();

      /* ── 9. Material Page → Data Submit Prefill (闭环二) ── */
      (function hookMaterialToSubmit() {
        // Hook all "提交数据" / "提交审核" buttons from material pages
        document.addEventListener('click', function(ev) {
          var btn = ev.target.closest('[onclick*="data-submit"]');
          if (!btn) {
            // Also catch twodReviewBtn
            btn = ev.target.closest('#twodReviewBtn');
          }
          if (!btn) return;

          // Determine which material type
          var materialType = '二维材料';
          var pageSection = btn.closest('section');
          if (pageSection) {
            if (pageSection.id === 'page-electrolyte' || pageSection.id === 'page-electrolyte-app') materialType = '电解质材料';
            else if (pageSection.id === 'page-opto' || pageSection.id === 'page-opto-app') materialType = '有机光电材料';
            else if (pageSection.id === 'page-mlff' || pageSection.id === 'page-mlff-app') materialType = '机器学习力场';
            else if (pageSection.id === 'page-catalyst' || pageSection.id === 'page-catalyst-app') materialType = '催化材料';
            else if (pageSection.id === 'page-twod') materialType = '二维材料';
          }

          // Pre-set the material type chip on data-submit page
          setTimeout(function() {
            var chips = document.querySelectorAll('#page-data-submit .card.pad:first-of-type .twod-filter-chip');
            chips.forEach(function(c) {
              if (c.textContent.trim() === materialType) {
                c.classList.add('active');
              } else {
                c.classList.remove('active');
              }
            });
          }, 100);
        });
      })();

      /* ── 9.5 My Submissions Chip Filtering ── */
      document.addEventListener('click', function(ev) {
        var chip = ev.target.closest('.twod-filter-chip');
        if (!chip) return;
        var section = chip.closest('#page-my-submissions');
        if (!section) return;
        setTimeout(function() {
          // Determine active type/status chips
          var typeChips = section.querySelectorAll('.filter-row:first-of-type .twod-filter-chip');
          var statusChips = section.querySelectorAll('.filter-row:nth-of-type(2) .twod-filter-chip');
          var activeType = '全部类型';
          var activeStatus = '全部状态';
          typeChips.forEach(function(c) { if (c.classList.contains('active')) activeType = c.textContent.trim(); });
          statusChips.forEach(function(c) { if (c.classList.contains('active')) activeStatus = c.textContent.trim(); });
          renderAllSubmissions(activeType, activeStatus);
          if (typeof showToast === 'function') {
            showToast('筛选完成', '已按「' + (activeType !== '全部类型' ? activeType + ' · ' : '') + activeStatus + '」筛选提交记录。', 'info');
          }
        }, 10);
      });

      /* ── 9b. Generic form prefill helper (data-field driven) ── */
      function _prefillDataSubmitForm(sub) {
        // Activate correct material type chip and form group
        var chips = document.querySelectorAll('#page-data-submit .twod-filter-chip');
        chips.forEach(function(c) { c.classList.toggle('active', c.textContent.trim() === sub.materialType); });
        var allGroups = document.querySelectorAll('#page-data-submit .material-form-group');
        allGroups.forEach(function(g) { g.style.display = (g.dataset.material === sub.materialType) ? 'flex' : 'none'; });
        // Prefill all data-field inputs
        var activeGroup = document.querySelector('#page-data-submit .material-form-group[data-material="' + sub.materialType + '"]');
        if (activeGroup && sub.fields) {
          Object.keys(sub.fields).forEach(function(key) {
            var el = activeGroup.querySelector('[data-field="' + key + '"]');
            if (el) el.value = sub.fields[key];
          });
        } else if (activeGroup) {
          // Legacy fallback
          var nameEl = activeGroup.querySelector('[data-field="materialName"]');
          if (nameEl) nameEl.value = sub.materialName || '';
          var formulaEl = activeGroup.querySelector('[data-field="formula"]');
          if (formulaEl) formulaEl.value = sub.formula || '';
        }
      }

      /* ── 10. My Submissions Interactions via Event Delegate ── */
      document.addEventListener('click', function(ev) {
        // Submit draft directly to review queue
        var submitReviewBtn = ev.target.closest('[data-submit-submission-review]');
        if (submitReviewBtn) {
          var draftSub = allSubmissions.find(function(s) { return s.id === submitReviewBtn.dataset.submitSubmissionReview; });
          if (draftSub) {
            draftSub.status = 'pending';
            draftSub.rejectReason = '';
            syncReviewQueue();
            renderAllSubmissions();
            if (typeof showToast === 'function') {
              showToast('提交审核', '记录已提交审核，等待审核通过后写入对应数据库。');
            }
          }
          return;
        }
        // Continue edit (draft)
        var continueBtn = ev.target.closest('[data-continue-edit]');
        if (continueBtn) {
          var sub = allSubmissions.find(function(s) { return s.id === continueBtn.dataset.continueEdit; });
          if (sub && typeof MarvisRouter !== 'undefined') {
            setTimeout(function() {
              _prefillDataSubmitForm(sub);
            }, 100);
            MarvisRouter.go('page-data-submit');
          }
          return;
        }
        // Re-edit (rejected)
        var reeditBtn = ev.target.closest('[data-reedit]');
        if (reeditBtn) {
          var sub2 = allSubmissions.find(function(s) { return s.id === reeditBtn.dataset.reedit; });
          if (sub2 && typeof MarvisRouter !== 'undefined') {
            sub2.status = 'pending';
            sub2.rejectReason = '';
            syncReviewQueue();
            setTimeout(function() {
              _prefillDataSubmitForm(sub2);
            }, 100);
            MarvisRouter.go('page-data-submit');
          }
          return;
        }
        // Track
        var trackBtn = ev.target.closest('[data-track]');
        if (trackBtn) {
          if (typeof showToast === 'function') {
            showToast('状态追踪', '该提交当前处于审核队列中，请耐心等待审核结果。');
          }
          return;
        }
        // View detail
        var viewBtn = ev.target.closest('[data-view-detail]');
        if (viewBtn) {
          var sub3 = allSubmissions.find(function(s) { return s.id === viewBtn.dataset.viewDetail; });
          if (sub3) {
            document.getElementById("recordBasicInfo").innerHTML =
              '<span class="record-detail-label">材料名称</span><span class="record-detail-value">' + sub3.materialName + '</span>' +
              '<span class="record-detail-label">化学式</span><span class="record-detail-value">' + (sub3.formula || '-') + '</span>' +
              '<span class="record-detail-label">材料类型</span><span class="record-detail-value">' + sub3.materialType + '</span>' +
              '<span class="record-detail-label">数据来源</span><span class="record-detail-value">' + (sub3.source || '-') + '</span>' +
              '<span class="record-detail-label">提交时间</span><span class="record-detail-value">' + sub3.time + '</span>';
            document.getElementById("recordExtraInfo").innerHTML =
              '<span class="record-detail-label">材料名称</span><span class="record-detail-value">' + sub3.materialName + '</span>' +
              '<span class="record-detail-label">化学式</span><span class="record-detail-value">' + (sub3.formula || '-') + '</span>' +
              '<span class="record-detail-label">材料类别</span><span class="record-detail-value">' + sub3.materialType + '</span>' +
              '<span class="record-detail-label">数据来源</span><span class="record-detail-value">' + (sub3.source || '-') + '</span>' +
              '<span class="record-detail-label">提交时间</span><span class="record-detail-value">' + sub3.time + '</span>' +
              '<span class="record-detail-label">入库编号</span><span class="record-detail-value">未入库</span>';
            var statusMap = { pending:'待审核', reviewing:'审核中', approved:'已通过', rejected:'已驳回', draft:'草稿' };
            var statusLabel = statusMap[sub3.status] || sub3.status;
            var materialDb2 = getMaterialDatabaseLabel(sub3.materialType || '');
            var msgMap = { pending:'数据已提交，等待审核通过后写入' + materialDb2 + '。', reviewing:'数据正在审核中，请耐心等待。', approved:'该数据已审核通过，并已写入' + materialDb2 + '。', rejected:(sub3.rejectReason ? '该数据审核未通过。原因：' + sub3.rejectReason : '该数据审核未通过，请补充必要元数据后重新提交。'), draft:'该记录为草稿状态，尚未提交审核。' };
            var msg = msgMap[sub3.status] || msgMap.pending;
            var statusClass = sub3.status === 'approved' ? 'approved' : sub3.status === 'rejected' ? 'rejected' : sub3.status === 'draft' ? 'draft' : 'pending';
            document.getElementById("recordStatusBlock").innerHTML =
              '<div class="record-detail-status-badge status-' + statusClass + '">' + statusLabel + '</div>' +
              '<div class="record-detail-status-msg msg-' + (sub3.status === 'approved' ? 'success' : sub3.status === 'rejected' ? 'error' : 'warning') + '">' + msg + '</div>';
            document.getElementById("recordDetailDownloadBtn").dataset.recordId = sub3.id;
            document.getElementById("recordApproveBtn").setAttribute('hidden', '');
            document.getElementById("recordDetailModal").classList.add('show');
          }
          return;
        }
      });

      /* ── 11. Save Draft Flow ── */
      (function hookSaveDraft() {
        document.body.addEventListener('click', function(ev) {
          var draftBtn = ev.target.closest('#page-data-submit .submit-actions .btn:not(.btn-primary)');
          if (!draftBtn || draftBtn.textContent.indexOf('保存草稿') === -1) return;
          ev.preventDefault();
          ev.stopPropagation();

          var activeChip = document.querySelector('#page-data-submit .twod-filter-chip.active');
          var materialType = activeChip ? activeChip.textContent.trim() : '二维材料';
          var activeGroup = document.querySelector('#page-data-submit .material-form-group[data-material="' + materialType + '"]');
          var fieldValues = {};
          if (activeGroup) {
            activeGroup.querySelectorAll('[data-field]').forEach(function(el) {
              fieldValues[el.dataset.field] = (el.value || '').trim();
            });
          }
          var materialName = fieldValues.materialName || '草稿材料';
          var formula = fieldValues.formula || '';

          allSubmissions.unshift({
            id: guid(), time: ts(),
            materialName: materialName, materialType: materialType,
            status: 'draft', rejectReason: '',
            formula: formula, source: fieldValues.source || '',
            fields: fieldValues
          });

          if (typeof showToast === 'function') {
            showToast('草稿已保存', '您可以在「我的提交」中继续编辑此草稿。');
          }
        }, true);
      })();

      /* ── 12. Page-dashboard Access Control + Data Refresh ── */
      (function hookDashboardConfigLink() {
        // When navigating to dashboard, show data based on config
        var origDashRender = null;
        document.addEventListener('click', function(ev) {
          var dashNav = ev.target.closest('[data-page="dashboard"]');
          if (!dashNav) return;
          setTimeout(function() {
            // Show config-derived stats on dashboard
            var totalMaterials = allSubmissions.length + (typeof twodUpdateRecords !== 'undefined' ? twodUpdateRecords.length : 0);
            var approved = allSubmissions.filter(function(s) { return s.status === 'approved'; }).length;
            var total = allSubmissions.filter(function(s) { return s.status !== 'draft'; }).length;
            var rate = total > 0 ? ((approved / total) * 100).toFixed(1) : '0.0';

            // Update dashboard stat card values
            var statValues = document.querySelectorAll('#page-dashboard .dash-stat-value');
            if (statValues.length >= 4) {
              statValues[0].textContent = totalMaterials.toLocaleString();
              statValues[1].textContent = rate + '%';
            }
          }, 100);
        });
      })();

      /* ── 13. Expose role toggler for development ── */
      window.setUserRole = function(role) {
        var validRoles = ['researcher','professional','reviewer','admin','contributor'];
        if (validRoles.indexOf(role) === -1) {
          console.warn('Invalid role. Use: ' + validRoles.join(', '));
          return;
        }
        currentUserRole = role;
        applyRoleVisibility();
        if (typeof showToast === 'function') {
          var names = {researcher:'普通用户', professional:'专业用户', reviewer:'审核员', admin:'系统管理员', contributor:'数据贡献者'};
          showToast('角色已切换', '当前身份：' + (names[role] || role));
        }
        console.log('Role switched to: ' + role + '. Sidebar visibility updated.');
      };

      console.log('[闭环补全] 业务逻辑闭环修复已加载。共修复 13 个模块。');
      console.log('[闭环补全] 可通过 setUserRole("admin"/"reviewer"/"researcher"/"professional"/"contributor") 切换角色验证闭环四。');

      (function restorePortalLoginEntry() {
        var params = new URLSearchParams(window.location.search);
        if (params.get("entry") !== "login") return;

        state.isAuthenticated = false;
        state.loginUser = "";
        state.authTab = "login";
        state.page = "twod";
        syncAuthView();
      })();

    })();
  