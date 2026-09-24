  /* ==========================================================================
     一、数据集定义（八大特征数据集）+ 目录顺序
     ========================================================================== */
  var DATASETS = [
    {
      key: "structure", label: "结构特征数据集", table: "ds_2d_structure_feature",
      group: "结构类", coverage: "3,825 种材料", rows: 9460, size: 128.6,
      desc: "收录二维材料的原子结构图、化学式、晶胞参数、层厚、原子坐标、键长键角、晶系与空间群等结构特征。",
      groupUsage: ["结构特征数据集"], extra: 0
    },
    {
      key: "electronic", label: "电子结构数据集", table: "ds_2d_electronic_structure",
      group: "电子类", coverage: "3,180 种材料", rows: 4200, size: 96.4,
      desc: "收录能带结构、态密度与载流子有效质量等电子结构计算结果及计算条件。",
      groupUsage: ["电子"], extra: 0
    },
    {
      key: "electrical", label: "电学性质数据集", table: "ds_2d_electrical_property",
      group: "电学类", coverage: "1,260 种材料", rows: 4560, size: 52.8,
      desc: "收录铁电性质、压电性质等电学性质数据，含自发极化、极化翻转与压电系数。",
      groupUsage: ["电学"], extra: 0
    },
    {
      key: "magnetic", label: "磁学性质数据集", table: "ds_2d_magnetic_property",
      group: "磁学类", coverage: "1,140 种材料", rows: 4980, size: 48.2,
      desc: "收录磁基态构型与磁转变温度（居里/奈尔温度）等磁学性质数据。",
      groupUsage: ["磁学"], extra: 0
    },
    {
      key: "thermal", label: "热学性质数据集", table: "ds_2d_thermal_property",
      group: "热学类", coverage: "2,480 种材料", rows: 2480, size: 74.5,
      desc: "收录形成能、声子谱与声子态密度等热力学与晶格动力学数据。",
      groupUsage: ["热学"], extra: 0
    },
    {
      key: "mechanical", label: "力学性质数据集", table: "ds_2d_mechanical_property",
      group: "力学类", coverage: "1,680 种材料", rows: 1680, size: 31.6,
      desc: "收录弹性常数、杨氏模量与泊松比等力学性质数据，区分面内与面外分量。",
      groupUsage: ["力学"], extra: 0
    },
    {
      key: "optical", label: "光学性质数据集", table: "ds_2d_optical_property",
      group: "光学类", coverage: "2,160 种材料", rows: 2160, size: 63.7,
      desc: "收录介电函数、光吸收系数、反射率、折射率与消光系数等光学性质数据。",
      groupUsage: ["光学"], extra: 0
    },
    {
      key: "defect", label: "缺陷性质数据集", table: "ds_2d_defect_property",
      group: "缺陷类", coverage: "1,080 种材料", rows: 1080, size: 19.4,
      desc: "收录空位缺陷、反位缺陷等缺陷构型及其形成能、迁移势垒数据。",
      groupUsage: ["缺陷"], extra: 0
    }
  ];

  /* ==========================================================================
     二、字段字典
     ========================================================================== */
  var ENUM = {
    sourceType: "第一性原理计算 / 文献数据 / 实验测试 / 外部数据库导入",
    dataLevel: "L1（调研）～ L5（权威）",
    quality: "A 级 / B 级 / C 级",
    sec: "公开 / 内部 / 受限",
    structure: "单层 / 多层 / 异质结 / 缺陷超胞",
    coord: "分数坐标 / 笛卡尔坐标",
    propertyGroup: "电子 / 电学 / 磁学 / 热学 / 力学 / 光学 / 缺陷",
    text: "自由文本",
    bool: "Y / N"
  };

  /* 字段构造器：cn 中文名 / en 英文名 / type 类型 / notNull 是否非空 / num 数值精度说明 */
  function F(cn, en, type, notNull, desc, unit) {
    return { cn: cn, en: en, type: type, notNull: !!notNull, desc: desc || "", unit: unit || "—" };
  }

  /* 解析类型串：varchar(64) → 字符长度 64；decimal(10,2) → 长度 10 / 小数 2 */
  function parseType(type) {
    var m = /^(varchar|char)\s*\(\s*(\d+)\s*\)$/i.exec(String(type || ""));
    if (m) return { base: m[1].toLowerCase() === "char" ? "CHAR" : "VARCHAR", len: Number(m[2]), scale: "" };
    m = /^decimal\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(String(type || ""));
    if (m) return { base: "DECIMAL", len: Number(m[1]), scale: String(Number(m[2])) };
    m = /^datetime\s*\(\s*(\d+)\s*\)$/i.exec(String(type || ""));
    if (m) return { base: "DATETIME", len: "", scale: "" };
    if (/^int\s*\(\s*(\d+)\s*\)$/i.test(String(type || ""))) {
      return { base: "INT", len: "", scale: "" };
    }
    return { base: String(type || "").toUpperCase(), len: "", scale: "" };
  }

  /* --------------------------------------------------------------------------
     EAV 统一属性表结构（七个性质数据集共用）
     依据业务确认口径：所有性质数据统一存于 ldm_material_2d_property，
     以 property_group（性质分组）+ property_code（性质编码）区分具体性质，
     数值/文本/数组三选一承载取值，单位单列。
     -------------------------------------------------------------------------- */
  var PROPERTY_EAV_FIELDS = function () {
    return [
      F("主键ID", "id", "bigint", true, "自增主键，逻辑唯一标识，业务侧不直接暴露", "—"),
      F("材料名称", "material_name", "varchar(255)", false, "材料名称，如「二硫化钼（2H 相）单层」", "—"),
      F("性质分组", "property_group", "varchar(32)", true, "性质大类分组，取值见下表「存储方式」列", "—"),
      F("性质编码", "property_code", "varchar(64)", true, "具体性质编码，如 band_type / dos_total", "—"),
      F("数值", "value_num", "decimal(30,12)", false, "标量性质的数值，配合 unit 使用", "—"),
      F("文本值", "value_text", "varchar(500)", false, "枚举型性质的文本取值，如「直接带隙」", "—"),
      F("数组 / 曲线 / 矩阵", "value_json", "json", false, "曲线、张量矩阵等结构化取值", "—"),
      F("单位", "unit", "varchar(64)", false, "该性质取值的计量单位", "—"),
      F("预览文件主键", "preview_file_id", "bigint", false, "图谱 / 曲线预览图片文件主键", "—")
    ];
  };

  /* 缺陷类：EAV 结构 + 缺陷专属扩展字段 */
  var DEFECT_FIELDS = function () {
    return PROPERTY_EAV_FIELDS().slice(0, 8).concat([
      F("缺陷位置坐标", "defect_position", "json", false, "缺陷原子在晶胞中的分数坐标 [x,y,z]", "—"),
      F("电荷态", "charge_state", "int", false, "缺陷带电状态，如 0、+1、-1、+2、-2", "—"),
      F("形成能", "formation_energy", "decimal(30,12)", false, "该电荷态下的缺陷形成能", "eV"),
      F("形成能范围", "formation_energy_per_ran", "json", false, "化学势区间内的形成能范围，含 E min / E max", "eV")
    ]).concat([
      F("预览文件主键", "preview_file_id", "bigint", false, "图谱 / 曲线预览图片文件主键", "—")
    ]);
  };

  /* 依据数据集来源类型补充公共字段的示例值 */
  var SOURCE_POOL = ["第一性原理计算", "文献数据", "实验测试", "外部数据库导入"];

  /* 由数据集定义派生出完整字段清单 */
  /* 结构特征数据集：字段清单为业务确认的固定口径，不再走 base+own+tail 拼装。
     前两项保留「主键ID」「材料名称」，其余按指定清单排列。 */
  var STRUCTURE_FIELDS = [
    F("主键ID", "id", "bigint", true, "自增主键，逻辑唯一标识，业务侧不直接暴露", "—"),
    F("材料名称", "material_name", "varchar(255)", false, "材料名称，如「二硫化钼（2H 相）单层」", "—"),
    F("化学式", "formula", "varchar(64)", true, "各元素原子组成比例，如 MoS2", "—"),
    F("晶系", "crystal_system", "varchar(32)", false, "立方 / 六方 / 四方 / 三方 / 正交 / 单斜 / 三斜 共七类", "—"),
    F("空间群", "space_group", "varchar(64)", false, "二维晶体共有 17 种空间群，如 P-6m2", "—"),
    F("晶格参数 a", "lattice_a", "decimal(12,5)", false, "晶胞基矢 a 长度", "Å"),
    F("晶格参数 b", "lattice_b", "decimal(12,5)", false, "晶胞基矢 b 长度", "Å"),
    F("晶格参数 c", "lattice_c", "decimal(12,5)", false, "晶胞基矢 c 长度（含真空层）", "Å"),
    F("晶胞夹角 α", "angle_alpha", "decimal(8,4)", false, "基矢 b 与 c 的夹角", "°"),
    F("晶胞夹角 β", "angle_beta", "decimal(8,4)", false, "基矢 a 与 c 的夹角", "°"),
    F("晶胞夹角 γ", "angle_gamma", "decimal(8,4)", false, "基矢 a 与 b 的夹角", "°"),
    F("层厚", "layer_thickness", "decimal(12,5)", false, "最上层与最下层原子间的垂直距离", "Å"),
    F("原子坐标", "atomic_coordinates", "json", false, "晶胞内各原子坐标数组", "—"),
    F("键数据（键长）", "bond_data", "json", false, "键长数据，含成键原子对与距离", "Å"),
    F("角数据（键角）", "angle_data", "json", false, "键角数据，含顶点原子与角度值", "°"),
    F("预览文件主键", "preview_file_id", "bigint", false, "原子结构图预览文件", "—"),
    F("文件类型", "file_type", "varchar(64)", true, "结构文件类型，如 CIF / XYZ / POSCAR", "—")
  ];

  function buildFields(key) {
    if (key === "structure") return STRUCTURE_FIELDS.slice();
    if (key === "defect") return DEFECT_FIELDS();
    return PROPERTY_EAV_FIELDS();
  }

  /* ==========================================================================
     三、示例数据（每个数据集 6 条，含 values 映射 / 覆盖信息 / 计算条件）
     ========================================================================== */
  var MATERIALS = [
    { id: "TD2026001", name: "二硫化钼（2H 相）单层", formula: "MoS2", comp: "Mo:33.3at%、S:66.7at%" },
    { id: "TD2026002", name: "石墨烯单层", formula: "C", comp: "C:100.0at%" },
    { id: "TD2026003", name: "六方氮化硼单层", formula: "BN", comp: "B:50.0at%、N:50.0at%" },
    { id: "TD2026004", name: "硒化铟单层", formula: "In2Se3", comp: "In:40.0at%、Se:60.0at%" },
    { id: "TD2026005", name: "羟基氧化铬单层", formula: "CrOOH", comp: "Cr:20.0at%、O:40.0at%、H:20.0at%" },
    { id: "TD2026006", name: "碳化铌单层（MXene）", formula: "Nb2C", comp: "Nb:66.7at%、C:33.3at%" }
  ];

  /* 每条示例数据 → 各数据集字段值的映射（键为字段英文名） */
  var SAMPLE_VALUES = {
    structure: [
      { structure_image: "MoS2-2H.png", structure_type: "单层", layer_count: 1, layer_thickness: 3.13, lattice_a: 3.17, lattice_b: 3.17, lattice_c: 20.00, angle_alpha: 90, angle_beta: 90, angle_gamma: 120, atomic_coordinates: "Mo(0.000,0.000,0.500)；S(0.333,0.667,0.586)；S(0.667,0.333,0.414)", coordinate_type: "分数坐标", bond_data: "d(Mo-S)=2.41 Å", angle_data: "∠SMoS=82.1°、∠MoSMo=98.0°", crystal_system: "六方晶系", space_group: "P-6m2", structure_file_id: 10021, preview_file_id: 10022, file_type: "CIF" },
      { structure_image: "Graphene.png", structure_type: "单层", layer_count: 1, layer_thickness: 0.34, lattice_a: 2.46, lattice_b: 2.46, lattice_c: 18.00, angle_alpha: 90, angle_beta: 90, angle_gamma: 120, atomic_coordinates: "C(0.000,0.000,0.500)；C(0.333,0.667,0.500)", coordinate_type: "分数坐标", bond_data: "d(C-C)=1.42 Å", angle_data: "∠CCC=120.0°", crystal_system: "六方晶系", space_group: "P6/mmm", structure_file_id: 10031, preview_file_id: 10032, file_type: "POSCAR" },
      { structure_image: "hBN.png", structure_type: "单层", layer_count: 1, layer_thickness: 3.33, lattice_a: 2.51, lattice_b: 2.51, lattice_c: 20.10, angle_alpha: 90, angle_beta: 90, angle_gamma: 120, atomic_coordinates: "B(0.000,0.000,0.500)；N(0.333,0.667,0.500)", coordinate_type: "分数坐标", bond_data: "d(B-N)=1.45 Å", angle_data: "∠BNB=120.0°、∠NBN=120.0°", crystal_system: "六方晶系", space_group: "P6₃/mmc", structure_file_id: 10041, preview_file_id: 10042, file_type: "CIF" },
      { structure_image: "In2Se3.png", structure_type: "单层", layer_count: 1, layer_thickness: 6.60, lattice_a: 4.05, lattice_b: 4.05, lattice_c: 19.60, angle_alpha: 90, angle_beta: 90, angle_gamma: 120, atomic_coordinates: "In(0.333,0.667,0.432)；Se(0.000,0.000,0.585)", coordinate_type: "分数坐标", bond_data: "d(In-Se)=2.63 Å", angle_data: "∠SeInSe=104.2°", crystal_system: "六方晶系", space_group: "P6₃/mmc", structure_file_id: 10051, preview_file_id: 10052, file_type: "XYZ" },
      { structure_image: "CrOOH.png", structure_type: "单层", layer_count: 1, layer_thickness: 2.86, lattice_a: 3.02, lattice_b: 3.02, lattice_c: 13.40, angle_alpha: 90, angle_beta: 90, angle_gamma: 120, atomic_coordinates: "Cr(0.000,0.000,0.500)；O(0.333,0.667,0.562)；H(0.333,0.667,0.640)", coordinate_type: "分数坐标", bond_data: "d(Cr-O)=1.98 Å", angle_data: "∠OCrO=95.6°", crystal_system: "三方晶系", space_group: "P-3m1", structure_file_id: 10061, preview_file_id: 10062, file_type: "CIF" },
      { structure_image: "Nb2C.png", structure_type: "多层", layer_count: 3, layer_thickness: 5.90, lattice_a: 3.12, lattice_b: 3.12, lattice_c: 14.80, angle_alpha: 90, angle_beta: 90, angle_gamma: 120, atomic_coordinates: "Nb(0.333,0.667,0.500)；C(0.000,0.000,0.500)", coordinate_type: "分数坐标", bond_data: "d(Nb-C)=2.15 Å", angle_data: "∠CNbC=88.4°", crystal_system: "六方晶系", space_group: "P6₃/mmc", structure_file_id: 10071, preview_file_id: 10072, file_type: "POSCAR" }
    ],
    /* ---- 以下七个数据集统一走 EAV 结构，字段为 property_group / property_code /
            value_num / value_text / value_json / unit / preview_file_id ---- */
    electronic: [
      { property_group: "electronic", property_code: "band_type", value_text: "直接带隙", preview_file_id: 10122 },
      { property_group: "electronic", property_code: "band_type", value_text: "零带隙（狄拉克半金属）", preview_file_id: 10132 },
      { property_group: "electronic", property_code: "band_type", value_text: "间接带隙", preview_file_id: 10142 },
      { property_group: "electronic", property_code: "band_type", value_text: "直接带隙", preview_file_id: 10152 },
      { property_group: "electronic", property_code: "band_type", value_text: "间接带隙", preview_file_id: 10162 },
      { property_group: "electronic", property_code: "band_type", value_text: "金属性", preview_file_id: 10172 }
    ],
    electrical: [
      { property_group: "electrical", property_code: "polarization / coercive_field", value_num: 0.110000000000, unit: "μC/cm²", preview_file_id: 10222 },
      { property_group: "electrical", property_code: "polarization / coercive_field", value_num: 0.000000000000, unit: "μC/cm²", preview_file_id: 10232 },
      { property_group: "electrical", property_code: "polarization / coercive_field", value_num: 0.000000000000, unit: "μC/cm²", preview_file_id: 10242 },
      { property_group: "electrical", property_code: "polarization / coercive_field", value_num: 0.081000000000, unit: "μC/cm²", preview_file_id: 10252 },
      { property_group: "electrical", property_code: "polarization / coercive_field", value_num: 0.016000000000, unit: "μC/cm²", preview_file_id: 10262 },
      { property_group: "electrical", property_code: "polarization / coercive_field", value_num: 0.000000000000, unit: "μC/cm²", preview_file_id: 10272 }
    ],
    magnetic: [
      { property_group: "magnetic", property_code: "curie_temperature", value_num: null, unit: "K", preview_file_id: 10322 },
      { property_group: "magnetic", property_code: "curie_temperature", value_num: null, unit: "K", preview_file_id: 10332 },
      { property_group: "magnetic", property_code: "curie_temperature", value_num: null, unit: "K", preview_file_id: 10342 },
      { property_group: "magnetic", property_code: "curie_temperature", value_num: 45.000000000000, unit: "K", preview_file_id: 10352 },
      { property_group: "magnetic", property_code: "neel_temperature", value_num: 128.000000000000, unit: "K", preview_file_id: 10362 },
      { property_group: "magnetic", property_code: "curie_temperature", value_num: 130.000000000000, unit: "K", preview_file_id: 10372 }
    ],
    thermal: [
      { property_group: "phonon", property_code: "phonon_bandstructure", value_json: "[高对称路径, 频率] 色散曲线；无虚频，动力学稳定", unit: "cm⁻¹", preview_file_id: 10422 },
      { property_group: "phonon", property_code: "phonon_bandstructure", value_json: "[高对称路径, 频率] 色散曲线；ZA 支二次色散", unit: "cm⁻¹", preview_file_id: 10432 },
      { property_group: "phonon", property_code: "phonon_bandstructure", value_json: "[高对称路径, 频率] 色散曲线；声学支稳定", unit: "cm⁻¹", preview_file_id: 10442 },
      { property_group: "phonon", property_code: "phonon_bandstructure", value_json: "[高对称路径, 频率] 色散曲线；α 相无虚频", unit: "cm⁻¹", preview_file_id: 10452 },
      { property_group: "phonon", property_code: "phonon_bandstructure", value_json: "[高对称路径, 频率] 色散曲线；存在低频虚频", unit: "cm⁻¹", preview_file_id: 10462 },
      { property_group: "phonon", property_code: "phonon_bandstructure", value_json: "[高对称路径, 频率] 色散曲线；金属性材料声子稳定", unit: "cm⁻¹", preview_file_id: 10472 }
    ],
    mechanical: [
      { property_group: "mechanical", property_code: "poisson_ratio", value_num: 0.253000000000, unit: "dimensionless", preview_file_id: 10522 },
      { property_group: "mechanical", property_code: "poisson_ratio", value_num: 0.172000000000, unit: "dimensionless", preview_file_id: 10532 },
      { property_group: "mechanical", property_code: "poisson_ratio", value_num: 0.216000000000, unit: "dimensionless", preview_file_id: 10542 },
      { property_group: "mechanical", property_code: "poisson_ratio", value_num: 0.298000000000, unit: "dimensionless", preview_file_id: 10552 },
      { property_group: "mechanical", property_code: "poisson_ratio", value_num: 0.273000000000, unit: "dimensionless", preview_file_id: 10562 },
      { property_group: "mechanical", property_code: "poisson_ratio", value_num: 0.313000000000, unit: "dimensionless", preview_file_id: 10572 }
    ],
    optical: [
      { property_group: "optical", property_code: "dielectric_function", value_json: "[光子能量, ε 实部, ε 虚部] 复介电函数谱", unit: "eV", preview_file_id: 10622 },
      { property_group: "optical", property_code: "dielectric_function", value_json: "[光子能量, ε 实部, ε 虚部] 红外区 Drude 响应", unit: "eV", preview_file_id: 10632 },
      { property_group: "optical", property_code: "dielectric_function", value_json: "[光子能量, ε 实部, ε 虚部] 紫外区介电响应增强", unit: "eV", preview_file_id: 10642 },
      { property_group: "optical", property_code: "dielectric_function", value_json: "[光子能量, ε 实部, ε 虚部] 可见光区强吸收", unit: "eV", preview_file_id: 10652 },
      { property_group: "optical", property_code: "dielectric_function", value_json: "[光子能量, ε 实部, ε 虚部] 可见光区吸收较弱", unit: "eV", preview_file_id: 10662 },
      { property_group: "optical", property_code: "dielectric_function", value_json: "[光子能量, ε 实部, ε 虚部] 金属性，低频介电发散", unit: "eV", preview_file_id: 10672 }
    ],
    defect: [
      { property_group: "defect", property_code: "vacancy", value_json: "[缺陷构型, 形成能] 数据组", unit: "eV", defect_position: "[0.000, 0.000, 0.500]", charge_state: 0, formation_energy: 1.720000000000, formation_energy_per_ran: "{ E min: 1.72, E max: 2.35 }", preview_file_id: 10722 },
      { property_group: "defect", property_code: "vacancy", value_json: "[缺陷构型, 形成能] 数据组", unit: "eV", defect_position: "[0.333, 0.667, 0.500]", charge_state: 0, formation_energy: 7.500000000000, formation_energy_per_ran: "{ E min: 7.50, E max: 8.14 }", preview_file_id: 10732 },
      { property_group: "defect", property_code: "antisite", value_json: "[缺陷构型, 形成能] 数据组", unit: "eV", defect_position: "[0.333, 0.667, 0.500]", charge_state: -1, formation_energy: 2.180000000000, formation_energy_per_ran: "{ E min: 2.18, E max: 2.96 }", preview_file_id: 10742 },
      { property_group: "defect", property_code: "vacancy", value_json: "[缺陷构型, 形成能] 数据组", unit: "eV", defect_position: "[0.000, 0.000, 0.432]", charge_state: 1, formation_energy: 1.940000000000, formation_energy_per_ran: "{ E min: 1.94, E max: 2.61 }", preview_file_id: 10752 },
      { property_group: "defect", property_code: "antisite", value_json: "[缺陷构型, 形成能] 数据组", unit: "eV", defect_position: "[0.000, 0.000, 0.500]", charge_state: 2, formation_energy: 2.460000000000, formation_energy_per_ran: "{ E min: 2.46, E max: 3.28 }", preview_file_id: 10762 },
      { property_group: "defect", property_code: "vacancy", value_json: "[缺陷构型, 形成能] 数据组", unit: "eV", defect_position: "[0.333, 0.667, 0.500]", charge_state: 0, formation_energy: 1.380000000000, formation_energy_per_ran: "{ E min: 1.38, E max: 1.95 }", preview_file_id: 10772 }
    ]
  };

  var QUALITY_POOL = [
    { data_level: "L3", quality_grade: "A 级", sec_level: "公开", producer: "低维材料主题库", version: "V2026.07" },
    { data_level: "L3", quality_grade: "A 级", sec_level: "公开", producer: "低维材料主题库", version: "V2026.07" },
    { data_level: "L3", quality_grade: "A 级", sec_level: "公开", producer: "低维材料主题库", version: "V2026.07" },
    { data_level: "L2", quality_grade: "A 级", sec_level: "公开", producer: "低维材料主题库", version: "V2026.07" },
    { data_level: "L2", quality_grade: "B 级", sec_level: "内部", producer: "低维材料主题库", version: "V2026.07" },
    { data_level: "L2", quality_grade: "B 级", sec_level: "受限", producer: "外部合作单位", version: "V2026.06" }
  ];

  /* 计算与测试条件（依据二维材料数据库标准化细则 R03） */
  var CALC_CONDITIONS = [
    { label: "计算软件", value: "VASP 6.3.2" },
    { label: "交换关联泛函", value: "GGA-PBE" },
    { label: "截断能", value: "500 eV" },
    { label: "K 点网格", value: "15×15×1" },
    { label: "真空层厚度", value: "15 Å" },
    { label: "力收敛判据", value: "0.01 eV/Å" },
    { label: "能量收敛判据", value: "1×10⁻⁶ eV" },
    { label: "色散校正", value: "DFT-D3" }
  ];

  /* 字段级样例值：命中映射取真实值，否则自动生成（未命中字段标灰） */
  function fieldSample(key, field, index) {
    var conf = SAMPLE_VALUES[key] || [];
    var map = conf[index] || {};
    if (Object.prototype.hasOwnProperty.call(map, field.en)) {
      var v = map[field.en];
      return { value: v, real: true };
    }
    var base = "TD2026" + String(index + 1).padStart(3, "0");
    var mock = {
      id: String(900000 + index * 17 + 3),
      material_id: base,
      tenant_id: "000000",
      create_by: String(100000 + index * 7),
      update_by: String(100000 + index * 7),
      create_time: "2026-07-2" + (index % 8) + " 10:1" + index + ":0" + index,
      update_time: "2026-07-2" + (index % 8) + " 14:3" + index + ":2" + index,
      del_flag: "0"
    };
    if (field.en === "material_name") return { value: MATERIALS[index].name, real: false };
    if (field.en === "formula") return { value: MATERIALS[index].formula, real: false };
    if (Object.prototype.hasOwnProperty.call(mock, field.en)) {
      var mv = mock[field.en];
      if (mv === null) return { value: null, real: false };
      return { value: mv, real: false };
    }
    return { value: null, real: false };
  }

  /* 组装每个数据集的行数据 */
  function buildRows(key) {
    return MATERIALS.map(function (m, index) {
      var q = QUALITY_POOL[index];
      var rows = {
        source_type: key === "structure" ? SOURCE_POOL[index % 2] : SOURCE_POOL[index % 4],
        source_detail: index % 3 === 0 ? "10.1021/acs.nanolett.6b00" + (index + 11) : "低维材料主题库内部编号 LDM-2D-" + (1200 + index),
        producer: q.producer,
        production_date: "2026-07-2" + (index % 8),
        data_level: q.data_level,
        quality_grade: q.quality_grade,
        sec_level: q.sec_level,
        result_version: q.version
      };
      return {
        materialId: m.id,
        coverage: "材料 " + m.id + "　|　结构版本 " + (index < 4 ? "V2026.07" : "V2026.06") + "　|　方法 DFT / GGA-PBE",
        extra: index % 3,
        values: rows
      };
    });
  }
