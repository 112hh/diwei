  /* ==========================================================================
     五、五个材料数据库的配置注册表（dbx_data.js）

     本文件在 db2_data.js 之后拼入：二维材料库直接复用已录入的字典，
     其余四个库按《低维材料表结构.docx》（物理表 DDL）+《低维材料主题库.xlsx》
     （数据资源对象 / 各数据集字段口径）逐字段录入。

     每个库的配置项：
       key / pageId / styleId / stateKey  页面与状态标识
       name / code                        库名与目录根编码
       meta                               创建人 / 更新时间
       tables                             物理库表（name / cn / keys / fields）
       tableOptions                       关联数据表下拉选项
       datasets                           数据集定义（含 tables 多选）
       materials                          数据信息列表的行标识
       ds                                 各数据集的展示列与示例行
       buildFields / findDdlTable / F     数据集字段装配所需函数
     ========================================================================== */
  var DB_CONFIGS = {};

  /* ---- 通用构造辅助（与 db2_data.js 的 DF / F 口径保持一致） ---- */
  function XDF(en, cn, type, notNull, def, key) {
    return { en: en, cn: cn || "—", type: type, notNull: !!notNull, def: def == null ? "" : def, key: key || "" };
  }
  function XF(cn, en, type, notNull, desc, unit) {
    return { cn: cn, en: en, type: type, notNull: !!notNull, desc: desc || "", unit: unit || "—" };
  }
  function mkFind(tables) {
    return function (name) {
      for (var i = 0; i < tables.length; i++) if (tables[i].name === name) return tables[i];
      return null;
    };
  }
  function mkOpts(tables) {
    return tables.map(function (t) {
      return { value: t.name, cn: t.cn, label: t.name + "（" + t.cn + "）" };
    });
  }
  /* 展示列：[["列标题","字段key"], ...] 或 [["列标题","字段key","image"], ...] */
  function XCols(arr) {
    return arr.map(function (c) { return { t: c[0], k: c[1], kind: c[2] || "" }; });
  }
  /* 示例行：按列顺序给值的二维数组 */
  function XRows(cols, data) {
    return data.map(function (vals) {
      var o = {};
      cols.forEach(function (c, i) { o[c.k] = vals[i] === undefined ? null : vals[i]; });
      return o;
    });
  }
  /* 数据集字段数口径：业务展示列 + 数据集标识等系统字段 */
  function fieldsFromCols(cols) {
    return [XF("数据集标识", "dataset_id", "varchar(32)", true, "业务唯一标识", "—")]
      .concat(cols.map(function (c) {
        return XF(c.t, c.k, c.kind === "image" ? "varchar(256)" : "varchar(255)", false, "业务字段：" + c.t, "—");
      }));
  }

  /* ==========================================================================
     1. 二维材料数据库：直接复用 db2_data.js 的既有字典
     ========================================================================== */
  DB_CONFIGS.twod = {
    key: "twod",
    pageId: "lowdim-database-twod",
    styleId: "twod-db-rewrite-20260923",
    stateKey: "twodDbRewrite",
    name: "二维材料数据库",
    code: "ldm_2d",
    meta: { name: "二维材料数据库", creator: "马兴", updated: "2026-09-15 18:20:07" },
    tables: DDL_TABLES,
    tableOptions: TABLE_OPTIONS,
    datasets: DATASETS,
    materials: MATERIALS,
    infoCols: INFO_COLS,
    infoRows: INFO_ROWS,
    buildFields: buildFields,
    findDdlTable: findDdlTable,
    F: F
  };

  /* ==========================================================================
     2. 有机光电材料数据库（material_optoelectronic）
     ========================================================================== */
  DB_CONFIGS.op = (function () {
    var tables = [
      {
        name: "material_optoelectronic",
        cn: "有机光电材料表",
        comment: "存储有机光电分子结构、物理性质、光谱及 DFT/TDDFT 计算数据，单条记录对应一种分子",
        keys: [
          "PRIMARY KEY (`id`)",
          "UNIQUE KEY `uk_op_molecule` (`molecule_id`)",
          "KEY `idx_op_formula` (`formula`)",
          "KEY `idx_op_homo` (`homo_energy`)",
          "KEY `idx_op_lumo` (`lumo_energy`)",
          "KEY `idx_op_app` (`application_type`)"
        ],
        fields: [
          XDF("id", "主键ID", "BIGINT", true, "AUTO_INCREMENT", "PRIMARY KEY"),
          XDF("molecule_id", "分子标识", "VARCHAR(32)", true, "", "uk_op_molecule"),
          XDF("name_cn", "中文名称", "VARCHAR(100)", false, "NULL", ""),
          XDF("name_en", "英文名称", "VARCHAR(100)", true, "", ""),
          XDF("iupac_name", "IUPAC名称", "VARCHAR(200)", false, "NULL", ""),
          XDF("cas_number", "CAS号", "VARCHAR(20)", false, "NULL", ""),
          XDF("formula", "分子式", "VARCHAR(64)", true, "", "idx_op_formula"),
          XDF("molecular_weight", "分子量", "DECIMAL(8,1)", true, "", ""),
          XDF("structure_file_path", "三维结构文件", "VARCHAR(256)", true, "", ""),
          XDF("density", "密度", "DECIMAL(5,2)", false, "NULL", ""),
          XDF("melting_point", "熔点", "DECIMAL(6,0)", false, "NULL", ""),
          XDF("boiling_point", "沸点", "DECIMAL(6,0)", false, "NULL", ""),
          XDF("flash_point", "闪点", "DECIMAL(6,0)", false, "NULL", ""),
          XDF("refractive_index", "折射率", "DECIMAL(4,2)", false, "NULL", ""),
          XDF("solubility", "溶解性", "VARCHAR(200)", false, "NULL", ""),
          XDF("ir_spectrum_path", "红外光谱", "VARCHAR(256)", false, "NULL", ""),
          XDF("raman_spectrum_path", "拉曼光谱", "VARCHAR(256)", false, "NULL", ""),
          XDF("nmr_spectrum_path", "核磁共振谱", "VARCHAR(256)", false, "NULL", ""),
          XDF("homo_energy", "HOMO能级", "DECIMAL(5,2)", true, "", "idx_op_homo"),
          XDF("lumo_energy", "LUMO能级", "DECIMAL(5,2)", true, "", "idx_op_lumo"),
          XDF("excitation_energy", "激发能", "DECIMAL(5,2)", false, "NULL", ""),
          XDF("emission_energy", "发射能", "DECIMAL(5,2)", false, "NULL", ""),
          XDF("stokes_shift", "斯托克斯位移", "DECIMAL(6,0)", false, "NULL", ""),
          XDF("transition_dipole", "跃迁偶极矩", "DECIMAL(5,2)", false, "NULL", ""),
          XDF("solvation_free_energy", "溶剂化自由能", "DECIMAL(6,1)", false, "NULL", ""),
          XDF("dos_data", "态密度数据", "JSON", false, "NULL", ""),
          XDF("ground_state_structure", "基态结构", "VARCHAR(256)", false, "NULL", ""),
          XDF("excited_state_structure", "激发态结构", "VARCHAR(256)", false, "NULL", ""),
          XDF("application_type", "应用类型", "VARCHAR(32)", true, "", "idx_op_app"),
          XDF("emission_color", "发光颜色", "VARCHAR(16)", false, "NULL", ""),
          XDF("calc_method", "计算方法", "VARCHAR(64)", true, "", ""),
          XDF("calc_software_version", "软件版本", "VARCHAR(16)", true, "", ""),
          XDF("functional_gs", "基态泛函", "VARCHAR(16)", true, "", ""),
          XDF("basis_set_gs", "基态基组", "VARCHAR(16)", true, "", ""),
          XDF("functional_es", "激发态泛函", "VARCHAR(16)", true, "", ""),
          XDF("basis_set_es", "激发态基组", "VARCHAR(16)", true, "", ""),
          XDF("quality_grade", "质量等级", "VARCHAR(4)", true, "", ""),
          XDF("sec_level", "敏感度等级", "VARCHAR(8)", true, "", ""),
          XDF("created_at", "创建时间", "DATETIME", true, "", ""),
          XDF("updated_at", "更新时间", "DATETIME", true, "", "")
        ]
      }
    ];

    var materials = [
      { id: "OP-TPD-001", name: "TPD", formula: "C38H32N2" },
      { id: "OP-RUB-002", name: "红荧烯", formula: "C42H28" },
      { id: "OP-ALQ-003", name: "Alq₃", formula: "C27H18AlN3O3" },
      { id: "OP-NPB-004", name: "NPB", formula: "C44H32N2" },
      { id: "OP-CBP-005", name: "CBP", formula: "C36H24N2" },
      { id: "OP-IRP-006", name: "Ir(ppy)₃", formula: "C33H24IrN3" }
    ];

    var ds = {};

    ds.op_base = {
      cols: XCols([["中文名称", "name_cn"], ["英文名称", "name_en"], ["分子式", "formula"],
        ["分子量（g/mol）", "molecular_weight"], ["分子编号", "molecule_id"], ["三维结构", "structure_file_path", "image"]]),
      rows: [
        ["N,N'-二苯基-N,N'-二(间甲苯基)联苯胺", "TPD", "C38H32N2", "516.7", "OP-TPD-001", "TPD.pdb"],
        ["红荧烯", "Rubrene", "C42H28", "532.7", "OP-RUB-002", "Rubrene.pdb"],
        ["三(8-羟基喹啉)铝", "Alq3", "C27H18AlN3O3", "459.4", "OP-ALQ-003", "Alq3.pdb"],
        ["N,N'-二(1-萘基)-N,N'-二苯基联苯胺", "NPB", "C44H32N2", "588.7", "OP-NPB-004", "NPB.pdb"],
        ["4,4'-二(9-咔唑)联苯", "CBP", "C36H24N2", "484.6", "OP-CBP-005", "CBP.pdb"],
        ["三(2-苯基吡啶)铱", "Ir(ppy)3", "C33H24IrN3", "654.8", "OP-IRP-006", "Irppy3.pdb"]
      ]
    };

    ds.op_property = {
      cols: XCols([["密度（g/cm³）", "density"], ["熔点（°C）", "melting_point"], ["沸点（°C）", "boiling_point"],
        ["闪点（°C）", "flash_point"], ["折射率", "refractive_index"], ["溶解性", "solubility"]]),
      rows: [
        ["1.25", "180", "450", "220", "1.52", "易溶于 CHCl₃、THF"],
        ["1.29", "315", null, null, "1.61", "易溶于甲苯"],
        ["1.41", "412", null, null, "1.58", "易溶于 DMSO"],
        ["1.22", "275", "520", "260", "1.55", "易溶于 CHCl₃"],
        ["1.28", "293", null, null, "1.57", "易溶于 THF"],
        ["1.35", "405", null, null, "1.60", "易溶于二氯甲烷"]
      ]
    };

    ds.op_spectrum = {
      cols: XCols([["红外光谱", "ir_spectrum_path", "image"], ["拉曼光谱", "raman_spectrum_path", "image"],
        ["核磁共振谱", "nmr_spectrum_path", "image"]]),
      rows: [
        ["TPD_IR.jpg", "TPD_Raman.jpg", "TPD_NMR.jpg"],
        ["Rubrene_IR.jpg", "Rubrene_Raman.jpg", "Rubrene_NMR.jpg"],
        ["Alq3_IR.jpg", "Alq3_Raman.jpg", "Alq3_NMR.jpg"],
        ["NPB_IR.jpg", "NPB_Raman.jpg", "NPB_NMR.jpg"],
        ["CBP_IR.jpg", "CBP_Raman.jpg", "CBP_NMR.jpg"],
        ["Irppy3_IR.jpg", "Irppy3_Raman.jpg", "Irppy3_NMR.jpg"]
      ]
    };

    ds.op_calc = {
      cols: XCols([["基态结构", "ground_state_structure", "image"], ["激发态结构", "excited_state_structure", "image"],
        ["激发能（eV）", "excitation_energy"], ["发射能（eV）", "emission_energy"],
        ["跃迁偶极矩（Debye）", "transition_dipole"], ["HOMO-LUMO 能隙（eV）", "gap"],
        ["溶剂化自由能（kJ/mol）", "solvation_free_energy"], ["态密度", "dos_data", "image"], ["简正模式", "normal_modes"]]),
      rows: [
        ["TPD_gs.pdb", "TPD_es.pdb", "3.10", "2.85", "4.32", "3.10", "-36.5", "TPD_dos.jpg", "182 个振动模式"],
        ["Rubrene_gs.pdb", "Rubrene_es.pdb", "2.32", "2.10", "5.18", "2.65", "-42.1", "Rubrene_dos.jpg", "254 个振动模式"],
        ["Alq3_gs.pdb", "Alq3_es.pdb", "2.85", "2.42", "3.96", "2.90", "-38.7", "Alq3_dos.jpg", "168 个振动模式"],
        ["NPB_gs.pdb", "NPB_es.pdb", "3.35", "3.02", "4.05", "3.20", "-45.3", "NPB_dos.jpg", "204 个振动模式"],
        ["CBP_gs.pdb", "CBP_es.pdb", "3.52", "3.18", "3.28", "3.42", "-40.2", "CBP_dos.jpg", "210 个振动模式"],
        ["Irppy3_gs.pdb", "Irppy3_es.pdb", "2.48", "2.15", "2.86", "2.72", "-33.9", "Irppy3_dos.jpg", "192 个振动模式"]
      ]
    };

    /* 行数据按各数据集自己的列顺序展开成对象 */
    Object.keys(ds).forEach(function (k) { ds[k].rows = XRows(ds[k].cols, ds[k].rows); });

    return {
      key: "op",
      pageId: "lowdim-database-opto",
      styleId: "opto-db-rewrite-20260923",
      stateKey: "optoDbRewrite",
      name: "有机光电材料数据库",
      code: "op_material",
      meta: { name: "有机光电材料数据库", creator: "马兴", updated: "2026-09-15 18:20:07" },
      tables: tables,
      tableOptions: mkOpts(tables),
      datasets: [
        { key: "op_base", label: "有机光电材料基础数据集", tables: ["material_optoelectronic"], group: "基础类", coverage: "1,020 种分子", rows: 1020, size: 36.8, desc: "有机分子的基础信息：中英文名称、分子式与分子量、分子编号以及三维结构。" },
        { key: "op_property", label: "有机光电材料物性数据集", tables: ["material_optoelectronic"], group: "物性类", coverage: "1,000 种分子", rows: 1000, size: 24.5, desc: "有机分子的物理性质：密度、熔点、沸点、闪点、折射率与溶解性。" },
        { key: "op_spectrum", label: "有机光电材料表征图谱数据集", tables: ["material_optoelectronic"], group: "图谱类", coverage: "860 种分子", rows: 860, size: 312.6, desc: "有机分子的表征图谱：红外光谱、拉曼光谱与核磁共振谱。" },
        { key: "op_calc", label: "有机光电材料计算数据集", tables: ["material_optoelectronic"], group: "计算类", coverage: "1,000 种分子", rows: 1000, size: 208.4, desc: "量子化学计算结果：基态/激发态结构、激发能、发射能、跃迁偶极矩、HOMO-LUMO、溶剂化自由能、态密度与简正模式。" }
      ],
      materials: materials,
      ds: ds,
      buildFields: function (key) { return fieldsFromCols(ds[key].cols); },
      findDdlTable: mkFind(tables),
      F: XF
    };
  })();

  /* ==========================================================================
     3. 电解质材料数据库（三张子表）
     ========================================================================== */
  DB_CONFIGS.el = (function () {
    var tables = [
      {
        name: "electrolyte_liquid",
        cn: "有机电解液表",
        comment: "存储有机电解液（有机小分子溶剂/添加剂）的基础信息、物性、图谱与计算数据",
        keys: [
          "PRIMARY KEY (`id`)",
          "UNIQUE KEY `uk_el_liquid` (`electrolyte_id`)",
          "KEY `idx_el_liquid_formula` (`formula`)",
          "KEY `idx_el_liquid_cat` (`category`)"
        ],
        fields: [
          XDF("id", "主键ID", "BIGINT", true, "AUTO_INCREMENT", "PRIMARY KEY"),
          XDF("electrolyte_id", "电解液标识", "VARCHAR(32)", true, "", "uk_el_liquid"),
          XDF("name", "名称", "VARCHAR(100)", true, "", ""),
          XDF("alias", "别名", "VARCHAR(50)", false, "NULL", ""),
          XDF("formula", "分子式", "VARCHAR(64)", true, "", "idx_el_liquid_formula"),
          XDF("cas_number", "CAS号", "VARCHAR(20)", false, "NULL", ""),
          XDF("category", "子类别", "VARCHAR(16)", true, "", "idx_el_liquid_cat"),
          XDF("structure_file_path", "三维结构", "VARCHAR(256)", true, "", ""),
          XDF("appearance", "性状", "VARCHAR(50)", false, "NULL", ""),
          XDF("melting_point", "熔点", "DECIMAL(6,0)", false, "NULL", ""),
          XDF("boiling_point", "沸点", "DECIMAL(6,0)", false, "NULL", ""),
          XDF("flash_point", "闪点", "DECIMAL(6,0)", true, "", ""),
          XDF("density", "相对密度", "DECIMAL(5,3)", false, "NULL", ""),
          XDF("viscosity", "粘度", "DECIMAL(6,2)", false, "NULL", ""),
          XDF("dielectric_constant", "介电常数", "DECIMAL(6,1)", false, "NULL", ""),
          XDF("conductivity", "电导率", "DECIMAL(8,4)", false, "NULL", ""),
          XDF("homo_energy", "HOMO能级", "DECIMAL(5,2)", false, "NULL", ""),
          XDF("lumo_energy", "LUMO能级", "DECIMAL(5,2)", false, "NULL", ""),
          XDF("dipole_moment", "偶极矩", "DECIMAL(5,2)", false, "NULL", ""),
          XDF("solvation_free_energy", "溶剂化自由能", "DECIMAL(6,1)", false, "NULL", ""),
          XDF("adsorption_energy", "吸附能", "DECIMAL(5,2)", false, "NULL", ""),
          XDF("formation_enthalpy", "生成焓", "DECIMAL(6,1)", false, "NULL", ""),
          XDF("resp_charges", "RESP电荷", "JSON", false, "NULL", ""),
          XDF("quality_grade", "质量等级", "VARCHAR(4)", true, "", ""),
          XDF("sec_level", "敏感度等级", "VARCHAR(8)", true, "", ""),
          XDF("created_at", "创建时间", "DATETIME", true, "", ""),
          XDF("updated_at", "更新时间", "DATETIME", true, "", "")
        ]
      },
      {
        name: "electrolyte_solid_organic",
        cn: "固态有机电解质表",
        comment: "存储固态有机电解质（聚合物基体）的单体/聚合物结构、物性与计算数据",
        keys: [
          "PRIMARY KEY (`id`)",
          "UNIQUE KEY `uk_el_solid_org` (`electrolyte_id`)",
          "KEY `idx_el_so_formula` (`formula`)"
        ],
        fields: [
          XDF("id", "主键ID", "BIGINT", true, "AUTO_INCREMENT", "PRIMARY KEY"),
          XDF("electrolyte_id", "电解液标识", "VARCHAR(32)", true, "", "uk_el_solid_org"),
          XDF("name", "名称", "VARCHAR(100)", true, "", ""),
          XDF("formula", "分子式", "VARCHAR(64)", true, "", "idx_el_so_formula"),
          XDF("monomer_structure", "单体结构", "TEXT", true, "", ""),
          XDF("polymer_structure", "聚合物结构", "VARCHAR(256)", false, "NULL", ""),
          XDF("glass_transition_temp", "玻璃化转变温度", "DECIMAL(6,0)", false, "NULL", ""),
          XDF("conductivity", "电导率", "DECIMAL(8,6)", false, "NULL", ""),
          XDF("tensile_modulus", "拉伸模量", "DECIMAL(8,0)", false, "NULL", ""),
          XDF("elongation_at_break", "断裂伸长率", "DECIMAL(5,1)", false, "NULL", ""),
          XDF("heat_capacity", "摩尔热容", "DECIMAL(6,1)", false, "NULL", ""),
          XDF("binding_energy", "结合能", "DECIMAL(6,1)", false, "NULL", ""),
          XDF("quality_grade", "质量等级", "VARCHAR(4)", true, "", ""),
          XDF("sec_level", "敏感度等级", "VARCHAR(8)", true, "", ""),
          XDF("created_at", "创建时间", "DATETIME", true, "", ""),
          XDF("updated_at", "更新时间", "DATETIME", true, "", "")
        ]
      },
      {
        name: "electrolyte_solid_inorganic",
        cn: "固态无机电解质表",
        comment: "存储固态无机电解质（晶体）的晶体结构、物性、图谱与能带/态密度计算数据",
        keys: [
          "PRIMARY KEY (`id`)",
          "UNIQUE KEY `uk_el_solid_inorg` (`electrolyte_id`)",
          "KEY `idx_el_si_formula` (`formula`)",
          "KEY `idx_el_si_gap` (`band_gap`)"
        ],
        fields: [
          XDF("id", "主键ID", "BIGINT", true, "AUTO_INCREMENT", "PRIMARY KEY"),
          XDF("electrolyte_id", "电解液标识", "VARCHAR(32)", true, "", "uk_el_solid_inorg"),
          XDF("name", "名称", "VARCHAR(100)", true, "", ""),
          XDF("formula", "化学式", "VARCHAR(64)", true, "", "idx_el_si_formula"),
          XDF("crystal_structure_file", "晶体结构", "VARCHAR(256)", true, "", ""),
          XDF("space_group", "空间群", "VARCHAR(32)", true, "", ""),
          XDF("density", "密度", "DECIMAL(5,2)", false, "NULL", ""),
          XDF("formation_energy", "形成能", "DECIMAL(6,2)", true, "", ""),
          XDF("fermi_energy", "费米能级", "DECIMAL(5,2)", true, "", ""),
          XDF("band_gap", "带隙", "DECIMAL(4,2)", true, "", "idx_el_si_gap"),
          XDF("band_structure_path", "能带结构图", "VARCHAR(256)", false, "NULL", ""),
          XDF("dos_path", "态密度图", "VARCHAR(256)", false, "NULL", ""),
          XDF("xrd_pattern_path", "XRD图谱", "VARCHAR(256)", false, "NULL", ""),
          XDF("xas_spectrum_path", "XAS图谱", "VARCHAR(256)", false, "NULL", ""),
          XDF("quality_grade", "质量等级", "VARCHAR(4)", true, "", ""),
          XDF("sec_level", "敏感度等级", "VARCHAR(8)", true, "", ""),
          XDF("created_at", "创建时间", "DATETIME", true, "", ""),
          XDF("updated_at", "更新时间", "DATETIME", true, "", "")
        ]
      }
    ];

    var materials = [
      { id: "EL-EC-001", name: "碳酸乙烯酯", formula: "C3H4O3" },
      { id: "EL-DMC-002", name: "碳酸二甲酯", formula: "C3H6O3" },
      { id: "EL-DEC-003", name: "碳酸二乙酯", formula: "C5H10O3" },
      { id: "EL-PC-004", name: "碳酸丙烯酯", formula: "C4H6O3" },
      { id: "EL-DOL-005", name: "1,3-二氧戊环", formula: "C3H6O2" },
      { id: "EL-DME-006", name: "乙二醇二甲醚", formula: "C4H10O2" }
    ];

    var ds = {};
    ds.el_liquid = {
      cols: XCols([["名称", "name"], ["分子式", "formula"], ["三维结构", "structure_file_path", "image"],
        ["熔点（°C）", "melting_point"], ["闪点（°C）", "flash_point"], ["介电常数", "dielectric_constant"],
        ["红外光谱", "ir_spectrum", "image"], ["核磁共振谱", "nmr_spectrum", "image"],
        ["HOMO（eV）", "homo_energy"], ["LUMO（eV）", "lumo_energy"], ["溶剂化自由能（kJ/mol）", "solvation_free_energy"]]),
      rows: [
        ["碳酸乙烯酯", "C3H4O3", "EC.pdb", "36", "150", "89.8", "EC_IR.jpg", "EC_NMR.jpg", "-8.72", "0.61", "-48.0"],
        ["碳酸二甲酯", "C3H6O3", "DMC.pdb", "4", "18", "3.1", "DMC_IR.jpg", "DMC_NMR.jpg", "-8.15", "0.94", "-35.2"],
        ["碳酸二乙酯", "C5H10O3", "DEC.pdb", "-43", "33", "2.8", "DEC_IR.jpg", "DEC_NMR.jpg", "-7.98", "1.02", "-30.6"],
        ["碳酸丙烯酯", "C4H6O3", "PC.pdb", "-49", "132", "64.9", "PC_IR.jpg", "PC_NMR.jpg", "-8.44", "0.78", "-41.5"],
        ["1,3-二氧戊环", "C3H6O2", "DOL.pdb", "-95", "2", "7.1", "DOL_IR.jpg", "DOL_NMR.jpg", "-7.62", "1.25", "-28.4"],
        ["乙二醇二甲醚", "C4H10O2", "DME.pdb", "-58", "0", "7.2", "DME_IR.jpg", "DME_NMR.jpg", "-7.35", "1.31", "-26.9"]
      ]
    };
    ds.el_solid_organic = {
      cols: XCols([["名称", "name"], ["分子式", "formula"], ["单体结构", "monomer_structure", "image"],
        ["聚合物结构", "polymer_structure", "image"], ["玻璃化转变温度（°C）", "glass_transition_temp"],
        ["拉伸模量（MPa）", "tensile_modulus"], ["摩尔热容（J/(mol·K)）", "heat_capacity"], ["结合能（kJ/mol）", "binding_energy"]]),
      rows: [
        ["聚环氧乙烷", "(C2H4O)n", "PEO_monomer.pdb", "PEO_polymer.pdb", "-60", "1200", "165.0", "-42.0"],
        ["聚碳酸丙烯酯", "(C4H6O3)n", "PPC_monomer.pdb", "PPC_polymer.pdb", "22", "980", "182.4", "-38.5"],
        ["聚丙烯腈", "(C3H3N)n", "PAN_monomer.pdb", "PAN_polymer.pdb", "85", "2600", "148.6", "-45.2"],
        ["聚偏氟乙烯", "(C2H2F2)n", "PVDF_monomer.pdb", "PVDF_polymer.pdb", "-35", "1900", "156.2", "-36.8"],
        ["聚甲基丙烯酸甲酯", "(C5H8O2)n", "PMMA_monomer.pdb", "PMMA_polymer.pdb", "105", "3100", "209.3", "-51.4"],
        ["聚乙烯醇", "(C2H4O)n", "PVA_monomer.pdb", "PVA_polymer.pdb", "75", "2400", "172.8", "-47.6"]
      ]
    };
    ds.el_solid_inorganic = {
      cols: XCols([["名称", "name"], ["化学式", "formula"], ["晶体结构", "crystal_structure_file", "image"],
        ["空间群", "space_group"], ["离子电导率（S/cm）", "conductivity"], ["带隙（eV）", "band_gap"],
        ["XRD图谱", "xrd_pattern_path", "image"], ["XAS图谱", "xas_spectrum_path", "image"],
        ["态密度图", "dos_path", "image"], ["能带结构图", "band_structure_path", "image"]]),
      rows: [
        ["LLZO 石榴石", "Li7La3Zr2O12", "LLZO.cif", "Ia-3d", "0.00050", "5.20", "LLZO_xrd.jpg", "LLZO_xas.jpg", "LLZO_dos.jpg", "LLZO_band.jpg"],
        ["LATP", "Li1.3Al0.3Ti1.7(PO4)3", "LATP.cif", "R-3c", "0.00070", "4.85", "LATP_xrd.jpg", "LATP_xas.jpg", "LATP_dos.jpg", "LATP_band.jpg"],
        ["LLTO", "Li0.34La0.51TiO2.94", "LLTO.cif", "P4/mmm", "0.00100", "3.90", "LLTO_xrd.jpg", "LLTO_xas.jpg", "LLTO_dos.jpg", "LLTO_band.jpg"],
        ["LiPON", "Li2.9PO3.3N0.46", "LiPON.cif", null, "0.000003", "5.60", "LiPON_xrd.jpg", "LiPON_xas.jpg", "LiPON_dos.jpg", "LiPON_band.jpg"],
        ["硫银锗矿 Li6PS5Cl", "Li6PS5Cl", "LPSCl.cif", "F-43m", "0.00310", "3.30", "LPSCl_xrd.jpg", "LPSCl_xas.jpg", "LPSCl_dos.jpg", "LPSCl_band.jpg"],
        ["LLZTO 石榴石", "Li6.4La3Zr1.4Ta0.6O12", "LLZTO.cif", "Ia-3d", "0.00090", "5.05", "LLZTO_xrd.jpg", "LLZTO_xas.jpg", "LLZTO_dos.jpg", "LLZTO_band.jpg"]
      ]
    };
    Object.keys(ds).forEach(function (k) { ds[k].rows = XRows(ds[k].cols, ds[k].rows); });

    return {
      key: "el",
      pageId: "lowdim-database-electrolyte",
      styleId: "electrolyte-db-rewrite-20260923",
      stateKey: "electrolyteDbRewrite",
      name: "电解质材料数据库",
      code: "el_material",
      meta: { name: "电解质材料数据库", creator: "马兴", updated: "2026-09-15 18:20:07" },
      tables: tables,
      tableOptions: mkOpts(tables),
      datasets: [
        { key: "el_liquid", label: "有机电解液数据集", tables: ["electrolyte_liquid"], group: "有机电解液类", coverage: "5,250 种电解液", rows: 5250, size: 128.4, desc: "有机电解液的基础信息、物性数据、表征图谱与安全信息，含 HOMO/LUMO、溶剂化能与电荷分布等计算数据。" },
        { key: "el_solid_organic", label: "固态有机电解质数据集", tables: ["electrolyte_solid_organic"], group: "固态有机类", coverage: "2,600 种电解质", rows: 2600, size: 96.2, desc: "固态有机电解质的单体与聚合物结构、玻璃化转变温度、拉伸模量及结合能等计算数据。" },
        { key: "el_solid_inorganic", label: "固态无机电解质数据集", tables: ["electrolyte_solid_inorganic"], group: "固态无机类", coverage: "2,400 种电解质", rows: 2400, size: 264.8, desc: "固态无机电解质的晶体结构、离子电导率、XRD/XAS 图谱及带隙、态密度、能带结构等计算数据。" }
      ],
      materials: materials,
      ds: ds,
      buildFields: function (key) { return fieldsFromCols(ds[key].cols); },
      findDdlTable: mkFind(tables),
      F: XF
    };
  })();

  /* ==========================================================================
     4. 机器学习力场数据库（三张子表）
     ========================================================================== */
  DB_CONFIGS.mlff = (function () {
    var tables = [
      {
        name: "mlff_small_molecule",
        cn: "小分子力场数据表",
        comment: "存储小分子体系的采样结构、能量、受力及原子性质数据",
        keys: [
          "PRIMARY KEY (`id`)",
          "UNIQUE KEY `uk_mlff_small` (`dataset_id`)",
          "KEY `idx_mlff_small_formula` (`formula`)"
        ],
        fields: [
          XDF("id", "主键ID", "BIGINT", true, "AUTO_INCREMENT", "PRIMARY KEY"),
          XDF("dataset_id", "数据集标识", "VARCHAR(32)", true, "", "uk_mlff_small"),
          XDF("molecule_name", "分子名称", "VARCHAR(100)", true, "", ""),
          XDF("formula", "分子式", "VARCHAR(32)", true, "", "idx_mlff_small_formula"),
          XDF("structure_file_path", "分子结构", "VARCHAR(256)", true, "", ""),
          XDF("total_energy", "单分子能量", "DECIMAL(10,4)", true, "", ""),
          XDF("atom_charges", "原子电荷", "JSON", true, "", ""),
          XDF("dipole_moment", "偶极矩", "DECIMAL(6,3)", false, "NULL", ""),
          XDF("polarizability", "极化率", "DECIMAL(10,6)", false, "NULL", ""),
          XDF("dispersion_coefficient", "色散系数", "DECIMAL(10,4)", false, "NULL", ""),
          XDF("dimer_structure_path", "双分子结构", "VARCHAR(256)", false, "NULL", ""),
          XDF("interaction_energy", "相互作用能", "DECIMAL(8,3)", false, "NULL", ""),
          XDF("atomic_forces", "原子受力", "JSON", false, "NULL", ""),
          XDF("cluster_structure_path", "团簇结构", "VARCHAR(256)", false, "NULL", ""),
          XDF("cluster_energy", "团簇能量", "DECIMAL(8,3)", false, "NULL", ""),
          XDF("quality_grade", "质量等级", "VARCHAR(4)", true, "", ""),
          XDF("sec_level", "敏感度等级", "VARCHAR(8)", true, "", ""),
          XDF("created_at", "创建时间", "DATETIME", true, "", ""),
          XDF("updated_at", "更新时间", "DATETIME", true, "", "")
        ]
      },
      {
        name: "mlff_polymer",
        cn: "高分子力场数据表",
        comment: "存储高分子片段的采样结构、片段总能量与分子间相互作用能",
        keys: [
          "PRIMARY KEY (`id`)",
          "UNIQUE KEY `uk_mlff_polymer` (`dataset_id`)",
          "KEY `idx_mlff_polymer_name` (`molecule_name`)"
        ],
        fields: [
          XDF("id", "主键ID", "BIGINT", true, "AUTO_INCREMENT", "PRIMARY KEY"),
          XDF("dataset_id", "数据集标识", "VARCHAR(32)", true, "", "uk_mlff_polymer"),
          XDF("molecule_name", "聚合物名称", "VARCHAR(100)", true, "", "idx_mlff_polymer_name"),
          XDF("repeat_unit", "重复单元", "VARCHAR(64)", true, "", ""),
          XDF("fragment_structure_path", "片段结构", "VARCHAR(256)", true, "", ""),
          XDF("total_energy", "片段总能量", "DECIMAL(10,3)", true, "", ""),
          XDF("interaction_energy", "分子间相互作用能", "DECIMAL(6,2)", false, "NULL", ""),
          XDF("quality_grade", "质量等级", "VARCHAR(4)", true, "", ""),
          XDF("sec_level", "敏感度等级", "VARCHAR(8)", true, "", ""),
          XDF("created_at", "创建时间", "DATETIME", true, "", ""),
          XDF("updated_at", "更新时间", "DATETIME", true, "", "")
        ]
      },
      {
        name: "mlff_protein",
        cn: "蛋白质力场数据表",
        comment: "存储蛋白质（多肽）体系的采样结构、肽键能量与侧链相互作用能",
        keys: [
          "PRIMARY KEY (`id`)",
          "UNIQUE KEY `uk_mlff_protein` (`dataset_id`)",
          "KEY `idx_mlff_protein_seq` (`amino_acid_sequence`)"
        ],
        fields: [
          XDF("id", "主键ID", "BIGINT", true, "AUTO_INCREMENT", "PRIMARY KEY"),
          XDF("dataset_id", "数据集标识", "VARCHAR(32)", true, "", "uk_mlff_protein"),
          XDF("protein_name", "蛋白质名称", "VARCHAR(100)", true, "", ""),
          XDF("amino_acid_sequence", "氨基酸序列", "VARCHAR(64)", true, "", "idx_mlff_protein_seq"),
          XDF("structure_file_path", "结构文件", "VARCHAR(256)", true, "", ""),
          XDF("peptide_bond_energy", "肽键能量", "DECIMAL(6,2)", false, "NULL", ""),
          XDF("side_chain_energy", "侧链相互作用能", "DECIMAL(6,2)", false, "NULL", ""),
          XDF("quality_grade", "质量等级", "VARCHAR(4)", true, "", ""),
          XDF("sec_level", "敏感度等级", "VARCHAR(8)", true, "", ""),
          XDF("created_at", "创建时间", "DATETIME", true, "", ""),
          XDF("updated_at", "更新时间", "DATETIME", true, "", "")
        ]
      }
    ];

    var materials = [
      { id: "ML-WATER-001", name: "水分子", formula: "H2O" },
      { id: "ML-CH4-002", name: "甲烷", formula: "CH4" },
      { id: "ML-BEN-003", name: "苯", formula: "C6H6" },
      { id: "ML-PEO-004", name: "PEO 片段", formula: "-(C2H4O)-" },
      { id: "ML-PET-005", name: "PET 片段", formula: "-(C10H8O4)-" },
      { id: "ML-GLY-006", name: "甘氨酸二肽", formula: "Gly-Gly" }
    ];

    var ds = {};
    ds.mlff_base = {
      cols: XCols([["分子名称", "molecule_name"], ["分子式", "formula"], ["分子结构", "structure_file_path", "image"],
        ["采样温度（K）", "sampling_temp"], ["构象数", "conformer_count"], ["RMSD（Å）", "rmsd"]]),
      rows: [
        ["水分子", "H2O", "water.pdb", "300", "1200", "0.05"],
        ["甲烷", "CH4", "methane.pdb", "300", "1050", "0.08"],
        ["苯", "C6H6", "benzene.pdb", "350", "1500", "0.12"],
        ["PEO 片段", "-(C2H4O)-", "PEO_fragment.pdb", "500", "2100", "0.35"],
        ["PET 片段", "-(C10H8O4)-", "PET_fragment.pdb", "600", "1800", "0.42"],
        ["甘氨酸二肽", "Gly-Gly", "gly_gly.pdb", "300", "2600", "0.55"]
      ]
    };
    ds.mlff_small = {
      cols: XCols([["单分子能量（Hartree）", "total_energy"], ["原子受力（kJ/(mol·Å)）", "atomic_forces"],
        ["双分子相互作用能（kJ/mol）", "interaction_energy"], ["原子电荷（e）", "atom_charges"],
        ["偶极矩（D）", "dipole_moment"], ["极化率（a.u.）", "polarizability"]]),
      rows: [
        ["-76.3628", "{\"O\": [0.12, -0.05, 0.08]}", "-12.345", "{\"O\": -0.834, \"H\": 0.417}", "1.850", "1.124900"],
        ["-40.2137", "{\"C\": [-0.03, 0.02, 0.05]}", "-8.120", "{\"C\": -0.412, \"H\": 0.103}", "0.000", "2.448000"],
        ["-232.1685", "{\"C\": [0.08, -0.11, 0.04]}", "-18.760", "{\"C\": -0.128, \"H\": 0.128}", "0.000", "10.420000"],
        [null, null, "-15.230", null, "1.240", "8.760000"],
        [null, null, "-22.410", null, "2.380", "15.320000"],
        [null, null, "-34.500", null, "3.120", "21.450000"]
      ]
    };
    ds.mlff_polymer = {
      cols: XCols([["聚合物名称", "molecule_name"], ["重复单元", "repeat_unit"], ["片段结构", "fragment_structure_path", "image"],
        ["采样温度（K）", "sampling_temp"], ["链段运动频率（GHz）", "segment_frequency"],
        ["片段总能量（kJ/mol）", "total_energy"], ["原子受力（kJ/(mol·Å)）", "atomic_forces"],
        ["分子间相互作用能（kJ/mol）", "interaction_energy"]]),
      rows: [
        ["PEO 片段", "-(C2H4O)-", "PEO_fragment.pdb", "500", "12.5", "-2560.700", "{\"O\": [0.21, -0.14, 0.06]}", "-12.30"],
        ["PET 片段", "-(C10H8O4)-", "PET_fragment.pdb", "600", "8.4", "-3120.450", "{\"O\": [-0.18, 0.09, 0.11]}", "-18.60"],
        ["聚丙烯片段", "-(C3H6)-", "PP_fragment.pdb", "550", "10.2", "-1980.300", "{\"C\": [0.05, 0.16, -0.07]}", "-9.85"],
        ["聚苯乙烯片段", "-(C8H8)-", "PS_fragment.pdb", "650", "6.8", "-4250.800", "{\"C\": [-0.12, 0.11, 0.09]}", "-24.15"],
        ["聚酰亚胺片段", "-(C22H10N2O5)-", "PI_fragment.pdb", "700", "5.1", "-5680.250", "{\"N\": [0.14, -0.08, 0.13]}", "-31.20"],
        ["聚二甲基硅氧烷片段", "-(C2H6OSi)-", "PDMS_fragment.pdb", "450", "14.6", "-2240.600", "{\"Si\": [0.19, -0.05, 0.08]}", "-11.40"]
      ]
    };
    Object.keys(ds).forEach(function (k) { ds[k].rows = XRows(ds[k].cols, ds[k].rows); });

    return {
      key: "mlff",
      pageId: "lowdim-database-mlff",
      styleId: "mlff-db-rewrite-20260923",
      stateKey: "mlffDbRewrite",
      name: "机器学习力场数据库",
      code: "mlff_material",
      meta: { name: "机器学习力场数据库", creator: "马兴", updated: "2026-09-15 18:20:07" },
      tables: tables,
      tableOptions: mkOpts(tables),
      datasets: [
        { key: "mlff_base", label: "机器学习力场基础数据集", tables: ["mlff_small_molecule", "mlff_polymer", "mlff_protein"], group: "基础类", coverage: "1,200 个分子体系", rows: 1200, size: 96.5, desc: "各分子体系的基础信息与采样数据：名称、分子式、结构及采样温度、构象数、RMSD。" },
        { key: "mlff_small", label: "有机小分子机器学习力场数据集", tables: ["mlff_small_molecule"], group: "小分子类", coverage: "15,000 条构象", rows: 15000, size: 486.2, desc: "有机小分子的单分子能量、原子受力、双分子相互作用能及原子电荷、偶极矩、极化率等原子性质。" },
        { key: "mlff_polymer", label: "高分子机器学习力场数据集", tables: ["mlff_polymer"], group: "高分子类", coverage: "9,000 条片段", rows: 9000, size: 372.8, desc: "高分子片段的结构、采样温度、链段运动频率、片段总能量、原子受力与分子间相互作用能。" }
      ],
      materials: materials,
      ds: ds,
      buildFields: function (key) { return fieldsFromCols(ds[key].cols); },
      findDdlTable: mkFind(tables),
      F: XF
    };
  })();

  /* ==========================================================================
     5. 催化材料数据库（material_catalyst）
     ========================================================================== */
  DB_CONFIGS.cat = (function () {
    var tables = [
      {
        name: "material_catalyst",
        cn: "催化材料表",
        comment: "存储催化材料元素特征、结构特征与催化性能数据，单条记录对应一种材料—表面—吸附组合",
        keys: [
          "PRIMARY KEY (`id`)",
          "UNIQUE KEY `uk_cat` (`catalyst_id`)",
          "KEY `idx_cat_formula` (`formula`)",
          "KEY `idx_cat_facet` (`surface_facet`)",
          "KEY `idx_cat_ads` (`adsorption_energy`)",
          "KEY `idx_cat_type` (`catalyst_type`)"
        ],
        fields: [
          XDF("id", "主键ID", "BIGINT", true, "AUTO_INCREMENT", "PRIMARY KEY"),
          XDF("catalyst_id", "催化材料标识", "VARCHAR(32)", true, "", "uk_cat"),
          XDF("name", "材料名称", "VARCHAR(100)", true, "", ""),
          XDF("formula", "化学式", "VARCHAR(32)", true, "", "idx_cat_formula"),
          XDF("catalyst_type", "催化类型", "VARCHAR(16)", true, "", "idx_cat_type"),
          XDF("period", "周期数", "INT", true, "", ""),
          XDF("group", "族数", "VARCHAR(10)", true, "", ""),
          XDF("atomic_number", "元素电荷", "INT", true, "", ""),
          XDF("atomic_radius", "原子半径", "DECIMAL(5,0)", true, "", ""),
          XDF("valence_electrons", "价电子数", "INT", true, "", ""),
          XDF("d_band_center", "d带中心", "DECIMAL(5,2)", false, "NULL", ""),
          XDF("structure_file_path", "结构文件", "VARCHAR(256)", true, "", ""),
          XDF("space_group", "空间群", "VARCHAR(32)", false, "NULL", ""),
          XDF("coordination_number", "配位数", "INT", false, "NULL", ""),
          XDF("surface_facet", "晶面指数", "VARCHAR(16)", true, "", "idx_cat_facet"),
          XDF("adsorption_energy", "吸附能", "DECIMAL(5,3)", true, "", "idx_cat_ads"),
          XDF("activation_energy", "活化能", "DECIMAL(5,2)", false, "NULL", ""),
          XDF("reaction_pathway", "反应路径", "VARCHAR(200)", false, "NULL", ""),
          XDF("intermediate", "中间产物", "VARCHAR(100)", false, "NULL", ""),
          XDF("selectivity", "选择性", "DECIMAL(4,1)", false, "NULL", ""),
          XDF("quality_grade", "质量等级", "VARCHAR(4)", true, "", ""),
          XDF("sec_level", "敏感度等级", "VARCHAR(8)", true, "", ""),
          XDF("created_at", "创建时间", "DATETIME", true, "", ""),
          XDF("updated_at", "更新时间", "DATETIME", true, "", "")
        ]
      }
    ];

    var materials = [
      { id: "CAT-PT-111-001", name: "Pt(111)", formula: "Pt" },
      { id: "CAT-CU-111-002", name: "Cu(111)", formula: "Cu" },
      { id: "CAT-AGCU-111-003", name: "AgCu(111)", formula: "AgCu" },
      { id: "CAT-SAC-ZNCU-004", name: "Zn/Cu(111) 单原子", formula: "ZnCu" },
      { id: "CAT-GB-CU210-005", name: "Cu Σ5(210) 晶界", formula: "Cu" },
      { id: "CAT-NICU-211-006", name: "NiCu(211)", formula: "NiCu" }
    ];

    var ds = {};
    ds.cat_element = {
      cols: XCols([["周期数", "period"], ["族数", "group"], ["元素电荷", "atomic_number"],
        ["原子半径（pm）", "atomic_radius"], ["价电子数", "valence_electrons"], ["d带中心（eV）", "d_band_center"]]),
      rows: [
        ["6", "Ⅷ", "78", "139", "10", "-2.45"],
        ["4", "ⅠB", "29", "128", "11", "-2.20"],
        ["5", "ⅠB", "47", "144", "11", "-3.10"],
        ["4", "ⅡB", "30", "134", "12", "-4.65"],
        ["4", "ⅠB", "29", "128", "11", "-2.18"],
        ["4", "Ⅷ", "28", "124", "10", "-1.98"]
      ]
    };
    ds.cat_structure = {
      cols: XCols([["结构文件", "structure_file_path", "image"], ["空间群", "space_group"],
        ["配位数", "coordination_number"], ["晶面指数", "surface_facet"]]),
      rows: [
        ["Pt111.vasp", "Fm-3m", "12", "(111)"],
        ["Cu111.vasp", "Fm-3m", "12", "(111)"],
        ["AgCu111.vasp", "P4/mmm", "11", "(111)"],
        ["ZnCu_SAC.vasp", "P4/mmm", "9", "(111)"],
        ["Cu_GB210.vasp", "Fm-3m", "10", "(210)"],
        ["NiCu211.vasp", "P4/mmm", "10", "(211)"]
      ]
    };
    ds.cat_single_atom = {
      cols: XCols([["催化剂名称", "name"], ["化学式", "formula"], ["催化类型", "catalyst_type"],
        ["吸附能（eV）", "adsorption_energy"], ["活化能（eV）", "activation_energy"],
        ["反应路径", "reaction_pathway"], ["中间产物", "intermediate"], ["选择性（%）", "selectivity"]]),
      rows: [
        ["Zn/Cu(111) 单原子", "ZnCu", "单原子", "-0.850", "0.45", "*OOH → *O → *OH", "*OOH, *O", "85.0"],
        ["Ag/Cu(111) 单原子", "AgCu", "单原子", "-0.620", "0.58", "*COOH → *CO", "*COOH", "72.4"],
        ["Ga/Cu(111) 单原子", "GaCu", "单原子", "-0.910", "0.38", "*OCHO → *HCOOH", "*OCHO", "90.2"],
        ["Sn/Cu(111) 单原子", "SnCu", "单原子", "-0.740", "0.52", "*OCHO → *HCOOH", "*OCHO", "81.6"],
        ["In/Cu(111) 单原子", "InCu", "单原子", "-0.680", "0.61", "*COOH → *CO", "*COOH", "68.9"],
        ["Pd/Cu(111) 单原子", "PdCu", "单原子", "-1.050", "0.29", "*H → *H₂", "*H", "94.3"]
      ]
    };
    ds.cat_alloy = {
      cols: XCols([["催化剂名称", "name"], ["化学式", "formula"], ["催化类型", "catalyst_type"],
        ["吸附能（eV）", "adsorption_energy"], ["活化能（eV）", "activation_energy"],
        ["反应路径", "reaction_pathway"], ["中间产物", "intermediate"], ["选择性（%）", "selectivity"]]),
      rows: [
        ["AgCu(111)", "AgCu", "二元合金", "-0.720", "0.51", "*CO → *CHO", "*CO", "76.8"],
        ["NiCu(211)", "NiCu", "二元合金", "-0.880", "0.42", "*COOH → *CO", "*COOH", "83.5"],
        ["PdCu(211)", "PdCu", "二元合金", "-0.950", "0.35", "*H → *C₂H₄", "*H", "88.1"],
        ["ZnCu(211)", "ZnCu", "二元合金", "-0.810", "0.47", "*OCHO → *HCOOH", "*OCHO", "79.4"],
        ["AuCu(111)", "AuCu", "二元合金", "-0.590", "0.66", "*CO → *COH", "*CO", "64.2"],
        ["PtCu(111)", "PtCu", "二元合金", "-1.120", "0.26", "*H → *CH₄", "*H", "91.7"]
      ]
    };
    ds.cat_grain = {
      cols: XCols([["催化剂名称", "name"], ["化学式", "formula"], ["催化类型", "catalyst_type"],
        ["吸附能（eV）", "adsorption_energy"], ["活化能（eV）", "activation_energy"],
        ["反应路径", "reaction_pathway"], ["中间产物", "intermediate"], ["选择性（%）", "selectivity"]]),
      rows: [
        ["Cu Σ5(210) 晶界", "Cu", "晶界", "-0.930", "0.33", "*COOH → *CO", "*COOH", "86.4"],
        ["Cu Σ3(111) 晶界", "Cu", "晶界", "-0.760", "0.49", "*OCHO → *HCOOH", "*OCHO", "75.1"],
        ["Cu Σ9(221) 晶界", "Cu", "晶界", "-0.880", "0.41", "*CO → *CHO", "*CO", "80.7"],
        ["AgCu Σ5(210) 晶界", "AgCu", "晶界", "-0.690", "0.57", "*COOH → *CO", "*COOH", "70.3"],
        ["NiCu Σ5(210) 晶界", "NiCu", "晶界", "-0.840", "0.44", "*H → *C₂H₄", "*H", "82.9"],
        ["ZnCu Σ3(111) 晶界", "ZnCu", "晶界", "-0.790", "0.46", "*OCHO → *HCOOH", "*OCHO", "77.6"]
      ]
    };
    ds.cat_system = {
      cols: XCols([["费米能级（eV）", "fermi_energy"], ["形成能（eV/atom）", "formation_energy"], ["体系磁矩（μB）", "magnetic_moment"]]),
      rows: [
        ["4.82", "-6.13", "0.00"],
        ["3.95", "-3.52", "0.00"],
        ["4.16", "-3.28", "0.12"],
        ["4.05", "-3.41", "0.00"],
        ["3.88", "-3.36", "0.08"],
        ["4.27", "-3.61", "0.35"]
      ]
    };
    Object.keys(ds).forEach(function (k) { ds[k].rows = XRows(ds[k].cols, ds[k].rows); });

    return {
      key: "cat",
      pageId: "lowdim-database-catalyst",
      styleId: "catalyst-db-rewrite-20260923",
      stateKey: "catalystDbRewrite",
      name: "催化材料数据库",
      code: "cat_material",
      meta: { name: "催化材料数据库", creator: "马兴", updated: "2026-09-15 18:20:07" },
      tables: tables,
      tableOptions: mkOpts(tables),
      datasets: [
        { key: "cat_element", label: "催化材料元素特征数据集", tables: ["material_catalyst"], group: "元素特征类", coverage: "1,200 种元素特征", rows: 1200, size: 18.6, desc: "催化材料的元素特征：周期数与族数、元素电荷、相对原子质量、原子半径、价电子数、d 带中心等。" },
        { key: "cat_structure", label: "催化材料结构特征数据集", tables: ["material_catalyst"], group: "结构特征类", coverage: "8,600 种表面结构", rows: 8600, size: 246.8, desc: "催化材料的结构特征：形貌结构图、点群与空间群、活性位点配位数、晶面指数与对称性函数。" },
        { key: "cat_single_atom", label: "单原子催化剂数据集", tables: ["material_catalyst"], group: "单原子类", coverage: "9,200 组吸附构型", rows: 9200, size: 312.4, desc: "单原子催化剂的吸附与反应路径数据：吸附能、活化能、反应路径、中间产物与选择性。" },
        { key: "cat_alloy", label: "二元合金数据集", tables: ["material_catalyst"], group: "二元合金类", coverage: "8,600 组吸附构型", rows: 8600, size: 298.5, desc: "二元合金催化剂的吸附与反应路径数据：吸附能、活化能、反应路径、中间产物与选择性。" },
        { key: "cat_grain", label: "晶界数据集", tables: ["material_catalyst"], group: "晶界类", coverage: "4,220 组晶界构型", rows: 4220, size: 186.2, desc: "不同晶粒取向分界面（晶界）处的吸附与反应路径数据。" },
        { key: "cat_system", label: "体系特征数据集", tables: ["material_catalyst"], group: "体系特征类", coverage: "3,100 个体系", rows: 3100, size: 62.4, desc: "催化体系的电子特征：费米能级、掺杂形成能与体系磁矩。" }
      ],
      materials: materials,
      ds: ds,
      buildFields: function (key) { return fieldsFromCols(ds[key].cols); },
      findDdlTable: mkFind(tables),
      F: XF
    };
  })();
