  /* ==========================================================================
     一、数据集定义（八大特征数据集）+ 目录顺序

     说明：数据集是「逻辑数据集」概念，其数据最终落在二维材料数据库的物理库表上，
     因此 table 字段统一指向真实物理表（ldm_material_2d_structure / ldm_material_2d_property），
     与库级「字段信息」页签中的四张库表口径保持一致。
     ========================================================================== */
  var DATASETS = [
    {
      key: "structure", label: "结构特征数据集", table: "ldm_material_2d_structure",
      group: "结构类", coverage: "3,825 种材料", rows: 9460, size: 128.6,
      desc: "收录二维材料的原子结构图、化学式、晶胞参数、层厚、原子坐标、键长键角、晶系与空间群等结构特征。"
    },
    {
      key: "electronic", label: "电子结构数据集", table: "ldm_material_2d_property",
      group: "电子类", coverage: "3,180 种材料", rows: 4200, size: 96.4,
      desc: "收录能带结构、态密度与载流子有效质量等电子结构计算结果及计算条件。"
    },
    {
      key: "electrical", label: "电学性质数据集", table: "ldm_material_2d_property",
      group: "电学类", coverage: "1,260 种材料", rows: 4560, size: 52.8,
      desc: "收录铁电性质、压电性质等电学性质数据，含自发极化、极化翻转与压电系数。"
    },
    {
      key: "magnetic", label: "磁学性质数据集", table: "ldm_material_2d_property",
      group: "磁学类", coverage: "1,140 种材料", rows: 4980, size: 48.2,
      desc: "收录磁基态构型与磁转变温度（居里 / 奈尔温度）等磁学性质数据。"
    },
    {
      key: "thermal", label: "热学性质数据集", table: "ldm_material_2d_property",
      group: "热学类", coverage: "2,480 种材料", rows: 2480, size: 74.5,
      desc: "收录形成能、声子谱与声子态密度等热力学与晶格动力学数据。"
    },
    {
      key: "mechanical", label: "力学性质数据集", table: "ldm_material_2d_property",
      group: "力学类", coverage: "1,680 种材料", rows: 1680, size: 31.6,
      desc: "收录弹性常数、杨氏模量与泊松比等力学性质数据，区分面内与面外分量。"
    },
    {
      key: "optical", label: "光学性质数据集", table: "ldm_material_2d_property",
      group: "光学类", coverage: "2,160 种材料", rows: 2160, size: 63.7,
      desc: "收录介电函数、光吸收系数、反射率、折射率与消光系数等光学性质数据。"
    },
    {
      key: "defect", label: "缺陷性质数据集", table: "ldm_material_2d_property",
      group: "缺陷类", coverage: "1,080 种材料", rows: 1080, size: 19.4,
      desc: "收录空位缺陷、反位缺陷等缺陷构型及其形成能、迁移势垒数据。"
    }
  ];

  /* 数据集可关联的物理库表（新增 / 编辑数据集时的多选下拉选项）
     cn 为该库表的中文别名，供选项行右侧的说明文案使用 */
  var TABLE_OPTIONS = [
    { value: "ldm_material_2d",            cn: "二维材料主表",       label: "ldm_material_2d（二维材料主表）" },
    { value: "ldm_material_2d_structure",  cn: "二维材料结构表",     label: "ldm_material_2d_structure（二维材料结构表）" },
    { value: "ldm_material_2d_property",   cn: "二维材料性质结果表", label: "ldm_material_2d_property（二维材料性质结果表）" },
    { value: "ldm_material_file_asset",    cn: "材料文件资产关联表", label: "ldm_material_file_asset（材料文件资产关联表）" }
  ];

  /* ==========================================================================
     二、库表字段字典（DDL 权威口径）

     数据来源：生产库 DDL 截图，四张表字段逐字段录入（合计 80 个字段）。
     字段对象属性：
       en      字段英文名
       cn      字段中文注释（COMMENT 原文，未标注注释的系统字段为 "—"）
       type    数据类型（长度 / 精度原样保留）
       notNull 是否 NOT NULL
       def     默认值（无默认值时为 ""，渲染为 —）
       key     参与的索引（PRIMARY / UNIQUE / KEY 名称，空字符串表示不参与索引）
     ========================================================================== */
  function DF(en, cn, type, notNull, def, key) {
    return {
      en: en, cn: cn || "—", type: type, notNull: !!notNull,
      def: def == null ? "" : def, key: key || ""
    };
  }

  var DDL_TABLES = [
    {
      name: "ldm_material_2d",
      cn: "二维材料主表",
      comment: "二维材料主表",
      keys: [
        "PRIMARY KEY (`id`)",
        "UNIQUE KEY `uk_ldm_2d_material` (`tenant_id`, `material_id`)",
        "KEY `idx_ldm_2d_formula` (`tenant_id`, `del_flag`, `formula`)",
        "KEY `idx_ldm_2d_name` (`tenant_id`, `del_flag`, `name`)"
      ],
      fields: [
        DF("id",                  "主键ID",             "bigint",        true,  "AUTO_INCREMENT", "PRIMARY KEY"),
        DF("material_id",         "材料业务标识",       "varchar(32)",   true,  "",               "uk_ldm_2d_material"),
        DF("name",                "材料名称",           "varchar(255)",  false, "NULL",           "idx_ldm_2d_name"),
        DF("formula",             "化学式",             "varchar(64)",   true,  "",               "idx_ldm_2d_formula"),
        DF("element_composition", "元素组成",           "varchar(255)",  false, "NULL",           ""),
        DF("source_type",         "来源类型",           "varchar(32)",   true,  "",               ""),
        DF("source_detail",       "来源详情",           "varchar(128)",  false, "NULL",           ""),
        DF("producer",            "生产者",             "varchar(64)",   false, "NULL",           ""),
        DF("production_date",     "生产时间",           "datetime",      false, "NULL",           ""),
        DF("data_level",          "数据等级",           "varchar(16)",   false, "NULL",           ""),
        DF("quality_grade",       "质量等级",           "varchar(16)",   false, "NULL",           ""),
        DF("sec_level",           "敏感度等级",         "varchar(16)",   false, "NULL",           ""),
        DF("result_version",      "结果版本",           "varchar(64)",   false, "NULL",           ""),
        DF("tenant_id",           "—",                  "varchar(20)",   true,  "'000000'",       "uk_ldm_2d_material / idx_ldm_2d_formula / idx_ldm_2d_name"),
        DF("create_dept",         "—",                  "bigint",        false, "NULL",           ""),
        DF("create_by",           "—",                  "bigint",        false, "NULL",           ""),
        DF("create_time",         "—",                  "datetime",      false, "NULL",           ""),
        DF("update_by",           "—",                  "bigint",        false, "NULL",           ""),
        DF("update_time",         "—",                  "datetime",      false, "NULL",           ""),
        DF("del_flag",            "—",                  "char(1)",       true,  "'0'",            "idx_ldm_2d_formula / idx_ldm_2d_name")
      ]
    },
    {
      name: "ldm_material_2d_property",
      cn: "二维材料性质结果表",
      comment: "二维材料性质结果表",
      keys: [
        "PRIMARY KEY (`id`)",
        "KEY `idx_ldm_2d_property_material` (`tenant_id`, `material_id`, `property_group`, `property_code`)"
      ],
      fields: [
        DF("id",                    "主键ID",                  "bigint",         true,  "AUTO_INCREMENT", "PRIMARY KEY"),
        DF("material_id",           "二维材料主体逻辑ID",      "bigint",         true,  "",               "idx_ldm_2d_property_material"),
        DF("structure_id",          "结构逻辑ID",              "bigint",         false, "NULL",           ""),
        DF("property_group",        "性质分组",                "varchar(32)",    true,  "",               "idx_ldm_2d_property_material"),
        DF("property_code",         "性质编码",                "varchar(64)",    true,  "",               "idx_ldm_2d_property_material"),
        DF("value_num",             "数值",                    "decimal(30,12)", false, "NULL",           ""),
        DF("value_text",            "文本值",                  "varchar(500)",   false, "NULL",           ""),
        DF("value_json",            "数组 / 曲线 / 矩阵",      "json",           false, "NULL",           ""),
        DF("unit",                  "单位",                    "varchar(64)",    false, "NULL",           ""),
        DF("data_file_id",          "ldm_material_file_asset 主键", "bigint",    false, "NULL",           ""),
        DF("preview_file_id",       "ldm_material_file_asset 主键", "bigint",    false, "NULL",           ""),
        DF("calc_method",           "—",                       "varchar(64)",    false, "NULL",           ""),
        DF("calc_software_version", "—",                       "varchar(64)",    false, "NULL",           ""),
        DF("functional",            "—",                       "varchar(32)",    false, "NULL",           ""),
        DF("condition_json",        "—",                       "json",           false, "NULL",           ""),
        DF("source_type",           "—",                       "varchar(32)",    false, "NULL",           ""),
        DF("result_version",        "—",                       "varchar(64)",    false, "NULL",           ""),
        DF("tenant_id",             "—",                       "varchar(20)",    true,  "'000000'",       "idx_ldm_2d_property_material"),
        DF("create_time",           "—",                       "datetime",       false, "NULL",           ""),
        DF("update_time",           "—",                       "datetime",       false, "NULL",           ""),
        DF("del_flag",              "—",                       "char(1)",        true,  "'0'",            "")
      ]
    },
    {
      name: "ldm_material_2d_structure",
      cn: "二维材料结构表",
      comment: "二维材料结构表",
      keys: [
        "PRIMARY KEY (`id`)",
        "KEY `idx_ldm_2d_structure_material` (`tenant_id`, `material_id`, `structure_type`)"
      ],
      fields: [
        DF("id",                  "主键ID",                     "bigint",        true,  "AUTO_INCREMENT", "PRIMARY KEY"),
        DF("material_id",         "二维材料主体逻辑ID",          "bigint",        true,  "",               "idx_ldm_2d_structure_material"),
        DF("structure_type",      "结构类型",                   "varchar(32)",   true,  "",               "idx_ldm_2d_structure_material"),
        DF("layer_count",         "层数",                       "int",           false, "NULL",           ""),
        DF("layer_thickness",     "层厚, Å",                    "decimal(12,5)", false, "NULL",           ""),
        DF("lattice_a",           "晶格a, Å",                   "decimal(12,5)", false, "NULL",           ""),
        DF("lattice_b",           "晶格b, Å",                   "decimal(12,5)", false, "NULL",           ""),
        DF("lattice_c",           "晶格c, Å",                   "decimal(12,5)", false, "NULL",           ""),
        DF("angle_alpha",         "α, °",                       "decimal(8,4)",  false, "NULL",           ""),
        DF("angle_beta",          "β, °",                       "decimal(8,4)",  false, "NULL",           ""),
        DF("angle_gamma",         "γ, °",                       "decimal(8,4)",  false, "NULL",           ""),
        DF("crystal_system",      "晶系",                       "varchar(32)",   false, "NULL",           ""),
        DF("space_group",         "空间群",                     "varchar(64)",   false, "NULL",           ""),
        DF("atomic_coordinates",  "原子坐标",                   "json",          false, "NULL",           ""),
        DF("coordinate_type",     "分数或笛卡尔",               "varchar(16)",   false, "NULL",           ""),
        DF("bond_data",           "键数据",                     "json",          false, "NULL",           ""),
        DF("angle_data",          "角数据",                     "json",          false, "NULL",           ""),
        DF("structure_file_id",   "结构文件资产主键，二维指向 ldm_material_file_asset，力场指向 ldm_mlff_asset", "bigint", false, "NULL", ""),
        DF("preview_file_id",     "ldm_material_file_asset 主键", "bigint",      false, "NULL",           ""),
        DF("structure_version",   "—",                          "varchar(64)",   false, "NULL",           ""),
        DF("tenant_id",           "—",                          "varchar(20)",   true,  "'000000'",       "idx_ldm_2d_structure_material"),
        DF("create_time",         "—",                          "datetime",      false, "NULL",           ""),
        DF("update_time",         "—",                          "datetime",      false, "NULL",           ""),
        DF("del_flag",            "—",                          "char(1)",       true,  "'0'",            "")
      ]
    },
    {
      name: "ldm_material_file_asset",
      cn: "材料文件资产关联表",
      comment: "材料文件资产关联表",
      keys: [
        "PRIMARY KEY (`id`)",
        "KEY `idx_ldm_material_file_asset_oss` (`oss_id`)",
        "KEY `idx_ldm_material_file_asset_tenant_active` (`tenant_id`, `active_flag`)",
        "KEY `idx_ldm_material_file_asset_material` (`tenant_id`, `material_type`, `material_table`, `material_id`)",
        "KEY `idx_ldm_material_file_asset_active` (`tenant_id`, `material_type`, `file_type`, `active_flag`)"
      ],
      fields: [
        DF("id",                   "主键ID",                            "bigint",         true,  "AUTO_INCREMENT", "PRIMARY KEY"),
        DF("material_type",        "材料类型",                          "varchar(32)",    true,  "",               "idx_ldm_material_file_asset_material / idx_ldm_material_file_asset_active"),
        DF("material_table",       "材料镜像表",                        "varchar(64)",    true,  "",               "idx_ldm_material_file_asset_material"),
        DF("material_id",          "材料业务标识",                      "varchar(64)",    true,  "",               "idx_ldm_material_file_asset_material"),
        DF("file_type",            "文件类型",                          "varchar(64)",    true,  "",               "idx_ldm_material_file_asset_active"),
        DF("oss_id",               "文件OSS ID",                        "bigint",         false, "NULL",           "idx_ldm_material_file_asset_oss"),
        DF("legacy_path_snapshot", "历史路径快照，仅迁移追溯使用",        "varchar(1024)",  false, "NULL",           ""),
        DF("active_flag",          "当前可用标志（Y是 N否）",            "char(1)",        true,  "'Y'",            "idx_ldm_material_file_asset_tenant_active / idx_ldm_material_file_asset_active"),
        DF("tenant_id",            "租户编号",                          "varchar(20)",    true,  "'000000'",       "idx_ldm_material_file_asset_tenant_active / idx_ldm_material_file_asset_material / idx_ldm_material_file_asset_active"),
        DF("create_dept",          "创建部门",                          "bigint",         false, "NULL",           ""),
        DF("create_by",            "创建者",                            "bigint",         false, "NULL",           ""),
        DF("create_time",          "本系统创建时间",                    "datetime",       false, "NULL",           ""),
        DF("update_by",            "更新者",                            "bigint",         false, "NULL",           ""),
        DF("update_time",          "本系统更新时间",                    "datetime",       false, "NULL",           ""),
        DF("del_flag",             "删除标志（0代表存在 1代表删除）",      "char(1)",        true,  "'0'",            "")
      ]
    }
  ];

  /* 库表字典：按表名索引，便于新增数据集时反查字段结构 */
  function findDdlTable(name) {
    for (var i = 0; i < DDL_TABLES.length; i++) {
      if (DDL_TABLES[i].name === name) return DDL_TABLES[i];
    }
    return null;
  }

  /* ==========================================================================
     三、字段字典（数据集级字段信息，用于信息概览统计）
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

  /* 字段构造器：cn 中文名 / en 英文名 / type 类型 / notNull 是否非空 / desc 说明 / unit 单位 */
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

  /* EAV 统一属性表结构（七个性质数据集共用） */
  var PROPERTY_EAV_FIELDS = function () {
    return [
      F("主键ID", "id", "bigint", true, "自增主键，逻辑唯一标识，业务侧不直接暴露", "—"),
      F("材料名称", "material_name", "varchar(255)", false, "材料名称，如「二硫化钼（2H 相）单层」", "—"),
      F("性质分组", "property_group", "varchar(32)", true, "性质大类分组", "—"),
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

  /* 结构特征数据集：字段清单为业务确认的固定口径 */
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
     四、示例材料（数据信息列表的行标识）
     ========================================================================== */
  var MATERIALS = [
    { id: "TD2026001", name: "二硫化钼（2H 相）单层", formula: "MoS2" },
    { id: "TD2026002", name: "石墨烯单层", formula: "C" },
    { id: "TD2026003", name: "六方氮化硼单层", formula: "BN" },
    { id: "TD2026004", name: "硒化铟单层", formula: "In2Se3" },
    { id: "TD2026005", name: "羟基氧化铬单层", formula: "CrOOH" },
    { id: "TD2026006", name: "碳化铌单层（MXene）", formula: "Nb2C" }
  ];

  /* ==========================================================================
     五、各数据集「数据信息」展示列（业务确认口径）

     顺序即列表列顺序；kind=image 的列按缩略图 + 文件名渲染。
     ========================================================================== */
  var INFO_COLS = {
    structure: [
      { k: "structure_image", t: "原子结构图", kind: "image" },
      { k: "formula",         t: "化学式" },
      { k: "lattice",         t: "晶胞参数" },
      { k: "layer_thickness", t: "层厚（Å）" },
      { k: "atomic_coordinates", t: "原子坐标" },
      { k: "bond_angle",      t: "键长 / 键角" },
      { k: "crystal_system",  t: "晶系" },
      { k: "space_group",     t: "空间群" }
    ],
    electronic: [
      { k: "band_structure",  t: "能带结构" },
      { k: "dos",             t: "态密度" },
      { k: "effective_mass",  t: "有效质量" }
    ],
    electrical: [
      { k: "ferroelectric",   t: "铁电性质" },
      { k: "piezoelectric",   t: "压电性质" }
    ],
    magnetic: [
      { k: "mag_ground",      t: "磁基态构型" },
      { k: "mag_temp",        t: "磁转变温度" }
    ],
    thermal: [
      { k: "formation_energy", t: "形成能" },
      { k: "phonon_spectrum",  t: "声子谱" },
      { k: "phonon_dos",       t: "声子态密度" }
    ],
    mechanical: [
      { k: "elastic_const",   t: "弹性常数" },
      { k: "youngs_modulus",  t: "杨氏模量" },
      { k: "poisson_ratio",   t: "泊松比" }
    ],
    optical: [
      { k: "dielectric",      t: "介电函数" },
      { k: "absorption",      t: "光吸收系数" },
      { k: "reflectivity",    t: "反射率" },
      { k: "refractive",      t: "折射率" },
      { k: "extinction",      t: "消光系数" }
    ],
    defect: [
      { k: "vacancy",         t: "空位缺陷" },
      { k: "antisite",        t: "反位缺陷" }
    ]
  };

  /* ==========================================================================
     六、各数据集「数据信息」行数据（与 MATERIALS 一一对应，共 6 条）
     ========================================================================== */
  var INFO_ROWS = {
    structure: [
      { structure_image: "MoS2-2H.png", formula: "MoS₂", lattice: "a = b = 3.17 Å，c = 20.00 Å，α = β = 90°，γ = 120°", layer_thickness: "3.13 Å", atomic_coordinates: "Mo(0.000, 0.000, 0.500)；S(0.333, 0.667, 0.586)；S(0.667, 0.333, 0.414)", bond_angle: "d(Mo–S) = 2.41 Å；∠SMoS = 82.1°、∠MoSMo = 98.0°", crystal_system: "六方晶系", space_group: "P-6m2" },
      { structure_image: "Graphene.png", formula: "C", lattice: "a = b = 2.46 Å，c = 18.00 Å，α = β = 90°，γ = 120°", layer_thickness: "0.34 Å", atomic_coordinates: "C(0.000, 0.000, 0.500)；C(0.333, 0.667, 0.500)", bond_angle: "d(C–C) = 1.42 Å；∠CCC = 120.0°", crystal_system: "六方晶系", space_group: "P6/mmm" },
      { structure_image: "hBN.png", formula: "BN", lattice: "a = b = 2.51 Å，c = 20.10 Å，α = β = 90°，γ = 120°", layer_thickness: "3.33 Å", atomic_coordinates: "B(0.000, 0.000, 0.500)；N(0.333, 0.667, 0.500)", bond_angle: "d(B–N) = 1.45 Å；∠BNB = 120.0°、∠NBN = 120.0°", crystal_system: "六方晶系", space_group: "P6₃/mmc" },
      { structure_image: "In2Se3.png", formula: "In₂Se₃", lattice: "a = b = 4.05 Å，c = 19.60 Å，α = β = 90°，γ = 120°", layer_thickness: "6.60 Å", atomic_coordinates: "In(0.333, 0.667, 0.432)；Se(0.000, 0.000, 0.585)", bond_angle: "d(In–Se) = 2.63 Å；∠SeInSe = 104.2°", crystal_system: "六方晶系", space_group: "P6₃/mmc" },
      { structure_image: "CrOOH.png", formula: "CrOOH", lattice: "a = b = 3.02 Å，c = 13.40 Å，α = β = 90°，γ = 120°", layer_thickness: "2.86 Å", atomic_coordinates: "Cr(0.000, 0.000, 0.500)；O(0.333, 0.667, 0.562)；H(0.333, 0.667, 0.640)", bond_angle: "d(Cr–O) = 1.98 Å；∠OCrO = 95.6°", crystal_system: "三方晶系", space_group: "P-3m1" },
      { structure_image: "Nb2C.png", formula: "Nb₂C", lattice: "a = b = 3.12 Å，c = 14.80 Å，α = β = 90°，γ = 120°", layer_thickness: "5.90 Å", atomic_coordinates: "Nb(0.333, 0.667, 0.500)；C(0.000, 0.000, 0.500)", bond_angle: "d(Nb–C) = 2.15 Å；∠CNbC = 88.4°", crystal_system: "六方晶系", space_group: "P6₃/mmc" }
    ],
    electronic: [
      { band_structure: "直接带隙，Eg = 1.78 eV（K 点）", dos: "价带顶以 Mo-d 为主、导带底 Mo-d + S-p 杂化，费米能级附近 DOS 台阶明显", effective_mass: "m*e = 0.47 m₀，m*h = 0.61 m₀" },
      { band_structure: "零带隙，狄拉克锥位于 K / K′ 点（E = 0）", dos: "费米能级处 DOS 线性趋于 0，呈典型 V 形", effective_mass: "m* ≈ 0.012 m₀（近 K 点线性色散，有效质量趋零）" },
      { band_structure: "间接带隙，Eg = 4.68 eV（K → Γ）", dos: "带隙宽，费米能级附近 DOS 近似为 0", effective_mass: "m*e = 1.12 m₀，m*h = 1.35 m₀" },
      { band_structure: "直接带隙，Eg = 1.45 eV（Γ 点，α 相）", dos: "价带顶 Se-p 主导、导带底 In-s 主导，带边态密度陡峭", effective_mass: "m*e = 0.21 m₀，m*h = 0.38 m₀" },
      { band_structure: "间接带隙，Eg = 2.10 eV", dos: "O-p 与 Cr-d 强杂化，DOS 呈自旋极化分裂", effective_mass: "m*e = 0.86 m₀，m*h = 1.04 m₀" },
      { band_structure: "金属性，无带隙（Nb-d 能带穿越费米面）", dos: "费米能级处 DOS 有限，以 Nb-d 轨道贡献为主", effective_mass: "金属性材料，载流子有效质量不适用" }
    ],
    electrical: [
      { ferroelectric: "非铁电（2H 相中心对称，无自发极化）", piezoelectric: "e₁₁ = 3.06×10⁻¹⁰ C/m（单层本征压电）" },
      { ferroelectric: "非铁电（D6h 中心对称）", piezoelectric: "中心对称结构，本征无压电响应" },
      { ferroelectric: "非铁电，AB 堆垛具面外自发极化", piezoelectric: "e₁₁ = 1.38×10⁻¹⁰ C/m" },
      { ferroelectric: "铁电，Ps = 0.11 μC/cm²（α-In₂Se₃，面外极化可翻转）", piezoelectric: "d₃₃ = 3.9 pm/V（面外压电）" },
      { ferroelectric: "反铁电（相邻层极化反平行）", piezoelectric: "R-3m 中心对称，本征压电响应弱" },
      { ferroelectric: "非铁电（金属性，表面官能团可调控）", piezoelectric: "d₁₁ = 1.7 pm/V（–F 终止表面）" }
    ],
    magnetic: [
      { mag_ground: "非磁性（2H 相 d⁰ 体系，无未配对电子）", mag_temp: "—" },
      { mag_ground: "非磁性（sp² 杂化，无未配对电子）", mag_temp: "—" },
      { mag_ground: "非磁性（宽禁带绝缘体）", mag_temp: "—" },
      { mag_ground: "非磁性（α 相范德瓦尔斯铁电体）", mag_temp: "—" },
      { mag_ground: "铁磁（FM，Cr³⁺–Cr³⁺ 面内铁磁耦合）", mag_temp: "Tc = 45 K（居里温度）" },
      { mag_ground: "反铁磁（AFM，层间自旋反平行排列）", mag_temp: "TN = 128 K（奈尔温度）" }
    ],
    thermal: [
      { formation_energy: "Ef = −1.24 eV/atom", phonon_spectrum: "无虚频，最高声子频率 ≈ 480 cm⁻¹，动力学稳定", phonon_dos: "声学支与光学支间隙明显，低频区 g(ω) ∝ ω" },
      { formation_energy: "Ef = −0.68 eV/atom", phonon_spectrum: "ZA 支呈二次色散，最高频率 ≈ 1600 cm⁻¹", phonon_dos: "约 1300 cm⁻¹ 处出现范霍夫奇点" },
      { formation_energy: "Ef = −1.05 eV/atom", phonon_spectrum: "无虚频，最高频率 ≈ 1400 cm⁻¹", phonon_dos: "高频光学支窄带，离子性引起 LO–TO 劈裂" },
      { formation_energy: "Ef = −0.62 eV/atom", phonon_spectrum: "α 相无虚频，最高频率 ≈ 260 cm⁻¹", phonon_dos: "低频区以 In–Se 振动贡献为主" },
      { formation_energy: "Ef = −1.47 eV/atom", phonon_spectrum: "存在低频虚频（≈ −32 cm⁻¹），动力学亚稳", phonon_dos: "300 cm⁻¹ 以下以 Cr–O 振动为主" },
      { formation_energy: "Ef = −0.93 eV/atom", phonon_spectrum: "金属性材料声子谱稳定，无虚频", phonon_dos: "低频声学支与 Nb-d 电子耦合较强" }
    ],
    mechanical: [
      { elastic_const: "C₁₁ = 227 GPa，C₁₂ = 62 GPa，C₆₆ = 82 GPa", youngs_modulus: "E = 178 GPa", poisson_ratio: "ν = 0.253" },
      { elastic_const: "C₁₁ = 1042 GPa，C₁₂ = 180 GPa，C₆₆ = 431 GPa", youngs_modulus: "E = 1010 GPa", poisson_ratio: "ν = 0.172" },
      { elastic_const: "C₁₁ = 810 GPa，C₁₂ = 176 GPa，C₆₆ = 317 GPa", youngs_modulus: "E = 772 GPa", poisson_ratio: "ν = 0.216" },
      { elastic_const: "C₁₁ = 118 GPa，C₁₂ = 35 GPa，C₆₆ = 42 GPa", youngs_modulus: "E = 107 GPa", poisson_ratio: "ν = 0.298" },
      { elastic_const: "C₁₁ = 156 GPa，C₁₂ = 43 GPa，C₆₆ = 56 GPa", youngs_modulus: "E = 144 GPa", poisson_ratio: "ν = 0.273" },
      { elastic_const: "C₁₁ = 236 GPa，C₁₂ = 74 GPa，C₆₆ = 81 GPa", youngs_modulus: "E = 204 GPa", poisson_ratio: "ν = 0.313" }
    ],
    optical: [
      { dielectric: "ε₁(0) = 5.6，ε₂ 峰值位于 2.8 eV 与 4.0 eV", absorption: "可见光区 α ≈ 1.1×10⁶ cm⁻¹（2.0 eV）", reflectivity: "R ≈ 0.32（2.0 eV）", refractive: "n = 2.37（2.0 eV）", extinction: "k = 0.86（2.0 eV）" },
      { dielectric: "ε₁(0) ≈ 1.0（单层），红外区呈 Drude 响应", absorption: "单层恒定吸收 α = πα ≈ 2.3%", reflectivity: "R ≈ 0.02（可见光，单层）", refractive: "n ≈ 2.60（可见光，含衬底）", extinction: "k ≈ 0.05（可见光）" },
      { dielectric: "ε₁(0) = 4.2（面内）/ 3.0（面外）", absorption: "吸收边位于 ≈ 5.9 eV（紫外区）", reflectivity: "R ≈ 0.13（可见光）", refractive: "n = 2.10（面内，可见光）", extinction: "k ≈ 0（可见光区高度透明）" },
      { dielectric: "ε₁(0) = 8.4，ε₂ 峰值位于 3.4 eV", absorption: "可见光区 α ≈ 7.6×10⁵ cm⁻¹", reflectivity: "R ≈ 0.28（2.5 eV）", refractive: "n = 3.12（2.5 eV）", extinction: "k = 0.52（2.5 eV）" },
      { dielectric: "ε₁(0) = 6.1，可见光区介电响应较平缓", absorption: "可见光区 α ≈ 3.2×10⁵ cm⁻¹", reflectivity: "R ≈ 0.18（可见光）", refractive: "n = 2.55（可见光）", extinction: "k = 0.21（可见光）" },
      { dielectric: "金属性，ε₁ 低频发散（Drude 项主导）", absorption: "红外区吸收强、可见光区反射为主", reflectivity: "R ≈ 0.78（红外）", refractive: "n = 1.85", extinction: "k = 3.40" }
    ],
    defect: [
      { vacancy: "V_S 硫空位，Ef = 1.72 eV（中性态，S 富集条件）", antisite: "Mo_S 反位，Ef = 2.46 eV" },
      { vacancy: "V_C 碳空位，Ef = 7.50 eV（中性态）", antisite: "单元素体系，无反位缺陷" },
      { vacancy: "V_N 氮空位，Ef = 4.20 eV（中性态）", antisite: "N_B 反位，Ef = 5.30 eV" },
      { vacancy: "V_Se 硒空位，Ef = 1.94 eV（+1 电荷态）", antisite: "In_Se 反位，Ef = 2.18 eV" },
      { vacancy: "V_Cr 铬空位，Ef = 3.65 eV（中性态）", antisite: "Cr_O 反位，Ef = 4.10 eV" },
      { vacancy: "V_C 碳空位，Ef = 1.38 eV（中性态）", antisite: "间隙碳构型更稳定，无反位缺陷" }
    ]
  };
