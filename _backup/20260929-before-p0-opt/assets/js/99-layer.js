/* ============================================================================
   低维材料主题库 · 五个材料数据库页面 —— 页面整体重写（20260923）
   本文件由 _tools/build2.py 自动生成，请勿手工编辑；
   请修改 _tools/head.js / _tools/db2_data.js / _tools/dbx_data.js / _tools/db2_page.js
   后重新构建。

   作用范围：五个数据库页面共用同一套实现（左侧元数据目录 + 右侧页签区）
     #page-lowdim-database-twod         二维材料数据库
     #page-lowdim-database-opto         有机光电材料数据库
     #page-lowdim-database-electrolyte  电解质材料数据库
     #page-lowdim-database-mlff         机器学习力场数据库
     #page-lowdim-database-catalyst     催化材料数据库
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- 0. 页面级样式覆盖（清除 app.css 对 .page 的卡片化装饰） ---------- */
  var DB_PAGE_IDS = [
    "lowdim-database-twod",
    "lowdim-database-opto",
    "lowdim-database-electrolyte",
    "lowdim-database-mlff",
    "lowdim-database-catalyst"
  ];
  var GLOBAL_STYLE_ID = "lowdim-db-page-override-20260923";
  if (!document.getElementById(GLOBAL_STYLE_ID)) {
    var gstyle = document.createElement("style");
    gstyle.id = GLOBAL_STYLE_ID;
    var rules = [];
    DB_PAGE_IDS.forEach(function (id) {
      rules.push("#page-" + id + " { display:none; background:transparent !important; border:0 !important; border-radius:0 !important; box-shadow:none !important; padding:0 !important; min-width:0 !important; }");
      rules.push("#page-" + id + ".active { display:block !important; }");
      rules.push(".main:has(#page-" + id + ".active), .main-shell:has(#page-" + id + ".active) { padding:0 !important; margin:0 !important; border:0 !important; border-radius:0 !important; box-shadow:none !important; background:transparent !important; }");
    });
    gstyle.textContent = rules.join(String.fromCharCode(10));
    document.head.appendChild(gstyle);
  }
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

/* ============================================================================
   五个材料数据库 —— 渲染与事件（20260923 · 数据集增删改 + 字段信息 + 数据信息）
   本片段由 _tools/build2.py 合并进 assets/js/99-layer.js 的单层 IIFE 中，
   因此文件自身不再包裹 (function(){...})()。

   实现被包成 buildDbPage(cfg) 工厂：二维材料 / 有机光电材料 / 电解质材料 /
   机器学习力场 / 催化材料五个库各装配一个实例，页面结构与交互完全一致。
   ========================================================================== */

  /* 全局登记表：pageId → 该页渲染函数；以及全部实例（用于首屏装配） */
  var DB_RENDERERS = {};
  var DB_RENDER_LIST = [];

  function buildDbPage(cfg) {
  var PAGE_ID = cfg.pageId;
  var STYLE_ID = cfg.styleId;
  var STATE_KEY = cfg.stateKey;
  var DDL_TABLES = cfg.tables;
  var TABLE_OPTIONS = cfg.tableOptions;
  var DATASETS = cfg.datasets;
  var MATERIALS = cfg.materials;
  var DB_META = cfg.meta;
  var buildFields = cfg.buildFields;
  var findDdlTable = cfg.findDdlTable;
  var F = cfg.F;
  var DSDEF = cfg.ds || null;        /* 新库：各数据集自带展示列与示例行 */
  var INFO_COLS = cfg.infoCols || {};
  var INFO_ROWS = cfg.infoRows || {};

  var esc = function (v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };
  var fmt = function (v) {
    return String(v == null ? "" : v).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  var MB = function (v) { return v >= 1024 ? (v / 1024).toFixed(2) + " GB" : v.toFixed(2) + " MB"; };
  var isEmpty = function (v) { return v === null || v === undefined || v === ""; };

  /* ==========================================================================
     1. 数据集装配（内置八大 + 运行时新增）
     ========================================================================== */
  var DS = {};   /* key → 数据集运行对象 */

  /* 数据集关联的库表（支持多选）：
     统一口径为数组 def.tables；兼容早期只写了单表的 def.table */
  function tablesOf(def) {
    var raw = (def && def.tables && def.tables.length) ? def.tables : ((def && def.table) ? [def.table] : []);
    var out = [];
    raw.forEach(function (n) { if (n && out.indexOf(n) < 0) out.push(n); });
    return out;
  }

  /* 多张库表的字段合并：按字段英文名去重，先出现的库表优先 */
  function ddlFieldsOfTables(tables) {
    var seen = {}, out = [];
    (tables || []).forEach(function (n) {
      var t = findDdlTable(n);
      if (!t) return;
      t.fields.forEach(function (f) {
        if (seen[f.en]) return;
        seen[f.en] = 1;
        out.push(f);
      });
    });
    return out;
  }

  /* 由数据集定义构造运行对象；自定义数据集直接继承所选库表的字段结构 */
  function makeDataset(def) {
    var tables = tablesOf(def);
    var d = {
      key: def.key,
      label: def.label,
      tables: tables,                              /* 关联数据表（可多张） */
      table: tables[0] || "",                      /* 兼容口径：取首张表 */
      tableText: tables.join("、"),                 /* 展示用：多表以顿号连接 */
      group: def.group || "自定义",
      coverage: def.coverage || "—",
      rows: typeof def.rows === "number" ? def.rows : 0,
      size: typeof def.size === "number" ? def.size : 0,
      desc: def.desc || "",
      custom: !!def.custom
    };
    if (d.custom) {
      d.fields = ddlFieldsOfTables(tables).map(function (f) {
        return F(f.cn === "—" ? f.en : f.cn, f.en, f.type, f.notNull, "物理库表字段：" + f.en, "—");
      });
      d.infoCols = null;
      d.infoRows = [];
    } else {
      d.fields = buildFields(d.key);
      var def = DSDEF ? DSDEF[d.key] : null;
      d.infoCols = def ? def.cols : (INFO_COLS[d.key] || []);
      d.infoRows = def ? def.rows : (INFO_ROWS[d.key] || []);
    }
    d.fieldCount = d.fields.length;
    d.storage = MB(d.size);
    d.infoCount = d.infoRows.length;
    d.notNullCount = d.fields.filter(function (f) { return f.notNull; }).length;
    return d;
  }

  DATASETS.forEach(function (def) { var d = makeDataset(def); DS[d.key] = d; });

  /* 库级统计：以四张物理库表的 DDL 为准 */
  var DDL_STAT = (function () {
    var t = { tables: DDL_TABLES.length, fields: 0, notNull: 0, indexes: 0 };
    DDL_TABLES.forEach(function (x) {
      t.fields += x.fields.length;
      t.indexes += x.keys.length;
      x.fields.forEach(function (f) { if (f.notNull) t.notNull++; });
    });
    return t;
  })();

  /* 数据集业务规模合计（信息概览页签展示） */
  var DS_STAT = (function () {
    var t = { rows: 0, size: 0 };
    DATASETS.forEach(function (d) { t.rows += d.rows; t.size += d.size; });
    t.sizeText = MB(t.size);
    return t;
  })();

  /* ==========================================================================
     2. 页面状态
     ========================================================================== */
  var DB_TABS = ["fields", "overview"];
  var DS_TABS = ["info", "overview"];

  function getState() {
    var blank = function () {
      return { open: { "db-root": true }, node: "db-root", tab: "fields", q1: "", q1b: "", page: {}, per: 10, customDs: [], hidden: {} };
    };
    if (typeof state === "undefined") return blank();
    if (!state[STATE_KEY]) state[STATE_KEY] = blank();
    var s = state[STATE_KEY];
    if (!s.open) s.open = { "db-root": true };
    if (!s.node) s.node = "db-root";
    /* 页签口径迁移：tables → fields（库级）、sample → info（数据集级） */
    if (s.tab === "tables") s.tab = "fields";
    if (s.tab === "sample") s.tab = "info";
    if (!s.tab) s.tab = "fields";
    if (typeof s.q1 !== "string") s.q1 = "";
    if (typeof s.q1b !== "string") s.q1b = "";
    if (!s.page || typeof s.page !== "object") s.page = {};
    if (typeof s.per !== "number") s.per = 10;
    if (!s.customDs || typeof s.customDs.push !== "function") s.customDs = [];
    if (!s.hidden || typeof s.hidden !== "object") s.hidden = {};
    /* 运行时新增的数据集若尚未装配则补装（刷新后 state 与 DS 同时重建，此处仅兜底） */
    s.customDs.forEach(function (c) { if (!DS[c.key]) DS[c.key] = makeDataset(c); });
    return s;
  }

  /* 当前可见数据集（内置顺序 + 新增顺序，剔除已删除项） */
  function datasetList() {
    var s = getState();
    var out = [];
    DATASETS.forEach(function (def) { if (!s.hidden[def.key] && DS[def.key]) out.push(DS[def.key]); });
    s.customDs.forEach(function (c) { if (DS[c.key]) out.push(DS[c.key]); });
    return out;
  }

  /* 目录树：一级 = 二维材料数据库；二级 = 数据集 */
  function buildTree() {
    var list = datasetList();
    return [{
      id: "db-root", label: DB_META.name, code: cfg.code, kind: "db",
      children: list.map(function (d) {
        return { id: "ds:" + d.key, key: d.key, label: d.label, code: d.tableText, kind: "ds", count: d.rows };
      })
    }];
  }

  /* ==========================================================================
     3. 样式
     ========================================================================== */
  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    /* 选择器前缀必须跟着本实例的 PAGE_ID 走：写死成 twod 会让另外四个库一条样式都匹配不上 */
    var P = "#page-" + PAGE_ID + " ";
    var css = [
      P + ".t2d-root { display:flex; gap:0; min-width:0; align-items:stretch; background:#fff; border:1px solid #e4ecf8; border-radius:12px; overflow:hidden; }",

      /* ---- 左侧目录 ---- */
      P + ".t2d-side { flex:0 0 308px; width:308px; border-right:1px solid #e8eef6; background:#fbfdff; padding:14px 12px 22px; }",
      P + ".t2d-side-head { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:0 4px 12px; }",
      P + ".t2d-side-head h3 { margin:0; color:#0b2a63; font-size:15px; font-weight:800; letter-spacing:.2px; }",
      P + ".t2d-search { position:relative; margin:0 4px 12px; }",
      P + ".t2d-search input { width:100%; height:34px; padding:0 30px 0 12px; border:1px solid #d9e5f5; border-radius:8px; background:#fff; color:#31527d; font-size:13px; font-family:inherit; }",
      P + ".t2d-search input:focus { outline:none; border-color:#165DFF; box-shadow:0 0 0 2px rgba(22,93,255,.1); }",
      P + ".t2d-search input::placeholder { color:#a8b9d0; }",
      P + ".t2d-search .t2d-search-ico { position:absolute; right:10px; top:50%; transform:translateY(-50%); color:#a8b9d0; font-size:13px; pointer-events:none; }",
      P + ".t2d-tree { display:grid; gap:2px; }",
      P + ".t2d-node-row { display:flex; align-items:center; gap:2px; min-width:0; }",
      P + ".t2d-node-row > .t2d-node { flex:1; min-width:0; }",
      P + ".t2d-node { display:flex; align-items:center; gap:8px; width:100%; padding:9px 10px; border:0; border-radius:8px; background:transparent; color:#2f4a70; font-size:13.5px; font-family:inherit; font-weight:600; text-align:left; cursor:pointer; line-height:1.5; }",
      P + ".t2d-node:hover { background:#f1f7ff; color:#165DFF; }",
      P + ".t2d-node.is-active { background:#e8f2ff; color:#165DFF; font-weight:800; }",
      P + ".t2d-node.is-root { font-size:14.5px; font-weight:800; color:#12315e; padding:10px 10px; }",
      P + ".t2d-node .t2d-caret { flex:0 0 auto; width:12px; color:#8ba0bb; font-size:10px; transition:transform .18s ease; }",
      P + ".t2d-node.is-open .t2d-caret { transform:rotate(90deg); }",
      P + ".t2d-node .t2d-ico { flex:0 0 auto; width:16px; height:16px; display:grid; place-items:center; color:#5c86c9; }",
      P + ".t2d-node.is-active .t2d-ico, " + P + ".t2d-node:hover .t2d-ico { color:#165DFF; }",
      P + ".t2d-node .t2d-ico svg { width:15px; height:15px; }",
      P + ".t2d-node .t2d-txt { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }",
      P + ".t2d-node .t2d-cnt { flex:0 0 auto; min-width:22px; padding:1px 7px; border-radius:20px; background:#eef3fa; color:#7b90ad; font-size:11.5px; font-weight:700; text-align:center; }",
      P + ".t2d-node.is-active .t2d-cnt { background:#d6e8ff; color:#165DFF; }",
      P + ".t2d-children { display:grid; gap:2px; margin:2px 0 6px 16px; padding-left:8px; border-left:1px dashed #dde8f5; }",
      P + ".t2d-children.is-folded { display:none; }",

      /* ---- 目录节点操作按钮 ---- */
      P + ".t2d-mini-btn.is-add { flex:0 0 auto; height:27px; padding:0 10px; border:1px dashed #a9c8f2; border-radius:7px; background:#f2f8ff; color:#165DFF; font-size:11.5px; font-family:inherit; font-weight:700; cursor:pointer; white-space:nowrap; line-height:1; }",
      P + ".t2d-mini-btn.is-add:hover { background:#e2efff; border-style:solid; border-color:#165DFF; }",
      P + ".t2d-row-acts { flex:0 0 auto; display:flex; gap:1px; opacity:.42; transition:opacity .15s ease; }",
      P + ".t2d-node-row:hover .t2d-row-acts { opacity:1; }",
      P + ".t2d-icon-btn { width:23px; height:23px; padding:0; border:0; border-radius:6px; background:transparent; color:#8ba0bb; cursor:pointer; display:grid; place-items:center; }",
      P + ".t2d-icon-btn svg { width:13px; height:13px; }",
      P + ".t2d-icon-btn:hover { background:#eaf2ff; color:#165DFF; }",
      P + ".t2d-icon-btn.is-danger:hover { background:#ffeef2; color:#d63864; }",

      /* ---- 右侧主区 ---- */
      P + ".t2d-main { flex:1; min-width:0; padding:18px 22px 26px; background:#fff; }",
      P + ".t2d-crumb { display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:12px; color:#93a8c4; font-size:12.5px; }",
      P + ".t2d-crumb b { color:#4b6b96; font-weight:600; }",
      P + ".t2d-title-row { display:flex; align-items:flex-start; gap:10px; flex-wrap:wrap; margin-bottom:6px; }",
      P + ".t2d-title-row h2 { margin:0; color:#0b2a63; font-size:23px; font-weight:800; line-height:1.3; }",
      P + ".t2d-badge { display:inline-flex; align-items:center; height:22px; padding:0 10px; margin-top:3px; border-radius:6px; background:#e8f2ff; color:#165DFF; font-size:12px; font-weight:700; }",
      P + ".t2d-badge.is-plain { background:#f1f5fb; color:#6b829e; }",
      P + ".t2d-sub { margin:0 0 14px; color:#7c90ab; font-size:13px; line-height:1.75; }",
      P + ".t2d-tabs { display:flex; gap:22px; margin:0 0 16px; border-bottom:1px solid #e8eef6; }",
      P + ".t2d-tab { position:relative; padding:0 2px 11px; border:0; background:transparent; color:#5e7899; font-size:14px; font-family:inherit; font-weight:700; cursor:pointer; }",
      P + ".t2d-tab:hover { color:#165DFF; }",
      P + ".t2d-tab.is-active { color:#0b2a63; }",
      P + ".t2d-tab.is-active::after { content:''; position:absolute; left:0; right:0; bottom:-1px; height:2px; border-radius:2px; background:#165DFF; }",

      /* ---- 工具条 ---- */
      P + ".t2d-bar { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:12px; padding:11px 14px; border:1px solid #e6eef9; border-radius:10px; background:#fafcff; }",
      P + ".t2d-bar .t2d-bar-input { position:relative; flex:1; min-width:200px; max-width:380px; }",
      P + ".t2d-bar .t2d-bar-input input { width:100%; height:36px; padding:0 34px 0 12px; border:1px solid #d9e5f5; border-radius:8px; background:#fff; color:#31527d; font-size:13.5px; font-family:inherit; }",
      P + ".t2d-bar .t2d-bar-input input:focus { outline:none; border-color:#165DFF; box-shadow:0 0 0 2px rgba(22,93,255,.1); }",
      P + ".t2d-bar .t2d-bar-input input::placeholder { color:#a8b9d0; }",
      P + ".t2d-bar .t2d-bar-input .t2d-search-ico { position:absolute; right:11px; top:50%; transform:translateY(-50%); color:#a8b9d0; font-size:14px; pointer-events:none; }",
      P + ".t2d-bar-tip { color:#93a8c4; font-size:12.5px; }",
      P + ".t2d-bar-tip b { color:#5c86c9; }",

      /* ---- 表格 ---- */
      P + ".t2d-card { border:1px solid #e6eef9; border-radius:10px; background:#fff; overflow:hidden; }",
      P + ".t2d-tw { overflow-x:auto; }",
      P + ".t2d-table { width:100%; border-collapse:separate; border-spacing:0; }",
      P + ".t2d-table th, " + P + ".t2d-table td { padding:12px 14px; border-bottom:1px solid #eef3fa; font-size:13px; color:#4e6b8d; text-align:left; vertical-align:middle; }",
      P + ".t2d-table th { background:#f7fafe; color:#33527a; font-weight:700; white-space:nowrap; font-size:12.5px; }",
      P + ".t2d-table tbody tr:hover td { background:#fafdff; }",
      P + ".t2d-table td.num { text-align:right; font-variant-numeric:tabular-nums; color:#33527a; font-weight:600; }",
      P + ".t2d-table th.num { text-align:right; }",
      P + ".t2d-table td.mono, " + P + ".t2d-table th.mono { font-family:Consolas,\"Courier New\",monospace; font-size:12.5px; color:#1e3c66; white-space:nowrap !important; }",
      /* app.css 用 !important 锁死了大量 td/th 的 white-space，此处必须同样 !important 才能接管：
         短内容列不换行、wrap 列（长文本）自动换行 */
      P + ".t2d-table td, " + P + ".t2d-table th { white-space:nowrap !important; }",
      P + ".t2d-table td.wrap, " + P + ".t2d-table th.wrap { white-space:normal !important; min-width:150px; }",
      P + ".t2d-tag { display:inline-block; padding:2px 9px; border-radius:20px; font-size:11.5px; line-height:1.75; white-space:nowrap; border:1px solid transparent; }",
      P + ".t2d-tag.t-blue { background:#eaf2ff; border-color:#cfe1ff; color:#165DFF; }",
      P + ".t2d-tag.t-violet { background:#f0edff; border-color:#ddd6ff; color:#6b4ef0; }",
      P + ".t2d-tag.t-green { background:#e8f8f0; border-color:#c6ecd9; color:#12996b; }",
      P + ".t2d-tag.t-gray { background:#f2f5fa; border-color:#e3e9f2; color:#6f8298; }",
      P + ".t2d-tag.t-orange { background:#fff2e8; border-color:#ffdfc4; color:#c2680f; }",
      P + ".t2d-null { color:#bccbdd; font-style:italic; }",
      P + ".t2d-check { color:#12a065; font-weight:800; font-size:14px; }",
      P + ".t2d-dash { color:#c3d0e0; }",

      /* ---- 数据信息表：行高更松、斑马纹更明显 ---- */
      P + ".t2d-table.is-sample th, " + P + ".t2d-table.is-sample td { padding:12px 14px !important; }",
      P + ".t2d-table.is-sample tbody td { font-size:12.5px !important; }",
      P + ".t2d-table.is-sample { min-width:100%; }",
      P + ".t2d-table.is-sample thead th { background:#fff !important; border-bottom:1px solid #e6eef9 !important; font-size:13px !important; font-weight:700 !important; white-space:normal !important; line-height:1.35; vertical-align:middle; }",
      /* 数据表列多时（如电解液 13 列）表头允许折行，压缩总宽，尽量一屏放得下；
         列少的库（如二维库）表头本来就不折行，观感不受影响。放不下时仍由 .t2d-tw 横向滚动。 */
      P + ".t2d-table.is-sample thead th { max-width:132px; }",
      P + ".t2d-table.is-sample tbody tr:nth-child(odd) td { background:#f7fbff; }",
      P + ".t2d-table.is-sample tbody tr:hover td { background:#eef6ff !important; }",
      P + ".t2d-table.is-sample td.num:first-child { text-align:left !important; font-weight:600 !important; }",

      /* ---- 数据信息：材料名称单元格 / 原子结构缩略图 ---- */
      P + ".t2d-mat { display:flex; flex-direction:column; gap:2px; min-width:132px; }",
      P + ".t2d-mat-name { color:#12315e; font-weight:700; font-size:13px; }",
      P + ".t2d-mat-id { color:#a3b4ca; font-size:11.5px; font-family:Consolas,\"Courier New\",monospace; }",
      P + ".t2d-thumb { display:flex; align-items:center; gap:9px; }",
      P + ".t2d-thumb-box { flex:0 0 auto; width:40px; height:40px; border:1px solid #e2ecf9; border-radius:8px; background:linear-gradient(180deg,#fbfdff,#f2f7fe); display:grid; place-items:center; }",
      P + ".t2d-thumb-box svg { width:34px; height:34px; }",
      P + ".t2d-thumb-name { color:#4e6b8d; font-size:12px; font-family:Consolas,\"Courier New\",monospace; white-space:nowrap; }",

      /* ---- 分页条 ---- */
      P + ".t2d-pager { display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; padding:12px 18px; border-top:1px solid #eef3fa; background:#fcfdff; }",
      P + ".t2d-page-tip { color:#93a8c4; font-size:12.5px; }",
      P + ".t2d-page-tip b { color:#5c86c9; }",
      P + ".t2d-page-ctl { display:flex; align-items:center; gap:5px; }",
      P + ".t2d-page-btn, " + P + ".t2d-page-num { min-width:30px; height:30px; padding:0 9px; border:1px solid #dde7f5; border-radius:7px; background:#fff; color:#4b6b96; font-size:12.5px; font-family:inherit; font-weight:600; cursor:pointer; }",
      P + ".t2d-page-btn:hover:not(:disabled), " + P + ".t2d-page-num:hover { border-color:#a9c6ee; color:#165DFF; background:#f6faff; }",
      P + ".t2d-page-btn:disabled { color:#c3d1e2; cursor:not-allowed; background:#fafcff; }",
      P + ".t2d-page-num.is-active { border-color:#165DFF; background:#165DFF; color:#fff; }",
      P + ".t2d-page-gap { color:#a8b9d0; font-size:12.5px; padding:0 2px; }",
      P + ".t2d-page-sizes { display:flex; align-items:center; gap:4px; }",
      P + ".t2d-page-size { height:28px; padding:0 10px; border:1px solid #dde7f5; border-radius:7px; background:#fff; color:#6f8298; font-size:12px; font-family:inherit; cursor:pointer; }",
      P + ".t2d-page-size:hover { border-color:#a9c6ee; color:#165DFF; }",
      P + ".t2d-page-size.is-active { border-color:#bcd6ff; background:#eaf2ff; color:#165DFF; font-weight:700; }",
      P + ".t2d-empty { padding:48px 0; color:#93a8c4; font-size:13.5px; text-align:center; }",
      P + ".t2d-foot { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; padding:12px 4px 0; color:#93a8c4; font-size:12.5px; }",
      P + ".t2d-foot b { color:#4e6b8d; }",

      /* ---- 信息概览 ---- */
      P + ".t2d-sec-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 18px 12px; border-bottom:1px solid #eef3fa; }",
      P + ".t2d-sec-head h4 { display:flex; align-items:center; gap:7px; margin:0; color:#12315e; font-size:14px; font-weight:800; }",
      P + ".t2d-sec-head h4::before { content:''; width:3px; height:13px; border-radius:2px; background:#165DFF; }",
      P + ".t2d-info { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); column-gap:36px; padding:2px 18px 18px; }",
      P + ".t2d-info > div { display:flex; gap:14px; padding:12px 0; border-bottom:1px dashed #e9eff8; }",
      P + ".t2d-info dt { flex:0 0 112px; margin:0; color:#8ba0bb; font-size:13px; line-height:1.7; }",
      P + ".t2d-info dd { flex:1; min-width:0; margin:0; color:#2f4a70; font-size:13px; line-height:1.7; word-break:break-word; }",
      P + ".t2d-info dd .mono { font-family:Consolas,\"Courier New\",monospace; font-size:12.5px; color:#1e3c66; }",
      P + ".t2d-badge2 { display:inline-block; margin-left:8px; padding:1px 7px; border-radius:4px; background:#f2f5fa; border:1px solid #e3e9f2; color:#8ba0bb; font-size:11.5px; vertical-align:1px; }",

      /* ---- 弹窗 / 按钮：这些节点挂载在 body 下，不在 #page-* 内，
             因此必须使用全局选择器，带页面前缀会整体失效 ---- */
      ".t2d-btn { min-height:34px; padding:0 16px; border:1px solid #ccd9ea; border-radius:8px; background:#fff; color:#3d5678; font-size:13.5px; font-family:inherit; font-weight:600; cursor:pointer; }",
      ".t2d-btn:hover { background:#f5f9ff; border-color:#a9c6ee; }",
      ".t2d-btn.is-primary { border-color:#165DFF; background:#165DFF; color:#fff; }",
      ".t2d-btn.is-primary:hover { background:#0b47c8; }",
      ".t2d-btn.is-danger { border-color:#d63864; background:#d63864; color:#fff; }",
      ".t2d-btn.is-danger:hover { background:#b82a52; border-color:#b82a52; }",

      /* ---- 居中弹窗（新增 / 编辑 / 删除） ---- */
      ".t2d-modal-mask { position:fixed; inset:0; z-index:1300; background:rgba(12,27,54,.38); display:flex; align-items:center; justify-content:center; padding:24px; animation:t2dFade .16s ease; }",
      "@keyframes t2dFade { from { opacity:.4 } to { opacity:1 } }",
      ".t2d-modal { width:min(520px,96vw); max-height:88vh; display:flex; flex-direction:column; background:#fff; border-radius:14px; box-shadow:0 18px 48px rgba(12,27,54,.22); overflow:hidden; animation:t2dPop .18s ease; }",
      "@keyframes t2dPop { from { transform:translateY(12px); opacity:.5 } to { transform:translateY(0); opacity:1 } }",
      ".t2d-modal-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; padding:18px 22px 14px; border-bottom:1px solid #eef3fa; }",
      ".t2d-modal-head h3 { margin:0; color:#0b2a63; font-size:17px; font-weight:800; }",
      ".t2d-modal-head p { margin:6px 0 0; color:#93a8c4; font-size:12.5px; }",
      ".t2d-modal-head button { width:28px; height:28px; border:0; border-radius:7px; background:#f4f7fc; color:#6f8298; font-size:17px; line-height:1; cursor:pointer; }",
      ".t2d-modal-head button:hover { background:#eaf2ff; color:#165DFF; }",
      ".t2d-modal-body { flex:1; overflow-y:auto; padding:18px 22px 6px; }",
      ".t2d-modal-foot { padding:14px 22px 18px; display:flex; justify-content:flex-end; gap:10px; }",
      ".t2d-form-item { margin-bottom:18px; }",
      ".t2d-form-item > label { display:block; margin-bottom:7px; color:#33527a; font-size:13px; font-weight:700; }",
      ".t2d-form-item > label i { color:#d63864; font-style:normal; margin-left:2px; }",
      ".t2d-form-item input, .t2d-form-item select { width:100%; height:38px; padding:0 12px; border:1px solid #d9e5f5; border-radius:8px; background:#fff; color:#31527d; font-size:13.5px; font-family:inherit; }",
      ".t2d-form-item select { cursor:pointer; }",
      ".t2d-form-item input:focus, .t2d-form-item select:focus { outline:none; border-color:#165DFF; box-shadow:0 0 0 2px rgba(22,93,255,.1); }",
      ".t2d-form-item input::placeholder { color:#a8b9d0; }",
      ".t2d-form-tip { margin:7px 0 0; color:#a3b4ca; font-size:12px; line-height:1.7; }",
      ".t2d-form-err { margin:7px 0 0; color:#d63864; font-size:12px; }",
      ".t2d-form-item.is-error input[data-t2d-f-name], .t2d-form-item.is-error select { border-color:#d63864 !important; box-shadow:0 0 0 2px rgba(214,56,100,.1); }",

      /* ---- 关联数据表多选下拉（面板内联展开，避免被 modal-body 的 overflow 裁切） ---- */
      ".t2d-msel { position:relative; }",
      ".t2d-msel-ctrl { display:flex; align-items:flex-start; gap:8px; min-height:38px; padding:6px 36px 6px 8px; border:1px solid #d9e5f5; border-radius:8px; background:#fff; cursor:pointer; }",
      ".t2d-msel-ctrl:hover { border-color:#a9c6ee; }",
      ".t2d-msel.is-open .t2d-msel-ctrl { border-color:#165DFF; box-shadow:0 0 0 2px rgba(22,93,255,.1); }",
      ".t2d-msel-chips { flex:1; min-width:0; display:flex; flex-wrap:wrap; gap:6px; padding:2px 0; }",
      ".t2d-msel-ph { color:#a8b9d0; font-size:13.5px; line-height:24px; }",
      ".t2d-msel-chip { display:inline-flex; align-items:center; height:24px; padding:0 10px; border:1px solid #cfe1ff; border-radius:6px; background:#eaf2ff; color:#165DFF; font-family:Consolas,\"Courier New\",monospace; font-size:12px; white-space:nowrap; }",
      ".t2d-msel-caret { position:absolute; right:12px; top:13px; width:14px; color:#8ba0bb; transition:transform .18s ease; }",
      ".t2d-msel-caret svg { width:14px; height:14px; display:block; }",
      ".t2d-msel.is-open .t2d-msel-caret { transform:rotate(90deg); }",
      ".t2d-msel-panel { display:none; margin-top:8px; border:1px solid #e6eef9; border-radius:9px; background:#fbfdff; max-height:214px; overflow-y:auto; }",
      ".t2d-msel.is-open .t2d-msel-panel { display:block; }",
      ".t2d-msel-opt { display:flex; align-items:center; gap:10px; padding:9px 12px; border-bottom:1px solid #eef3fa; cursor:pointer; }",
      ".t2d-msel-opt:last-child { border-bottom:0; }",
      ".t2d-msel-opt:hover { background:#f2f8ff; }",
      ".t2d-msel-opt.is-on { background:#eaf2ff; }",
      ".t2d-msel-opt input { flex:0 0 auto; width:16px !important; height:16px !important; margin:0 !important; padding:0 !important; accent-color:#165DFF; cursor:pointer; }",
      ".t2d-msel-name { flex:0 0 auto; color:#1e3c66; font-family:Consolas,\"Courier New\",monospace; font-size:12.5px; }",
      ".t2d-msel-cn { flex:1; min-width:0; color:#8ba0bb; font-size:12px; }",
      ".t2d-msel-opt.is-on .t2d-msel-cn { color:#5c86c9; }",
      ".t2d-form-item.is-error .t2d-msel-ctrl { border-color:#d63864 !important; box-shadow:0 0 0 2px rgba(214,56,100,.1); }",
      ".t2d-confirm-text { margin:0; color:#526276; font-size:13.5px; line-height:1.9; }",
      ".t2d-confirm-text b { color:#12315e; }",
      ".t2d-confirm-warn { display:flex; gap:9px; margin-top:14px; padding:11px 13px; border:1px solid #ffdfc4; border-radius:9px; background:#fff8f1; color:#a35b16; font-size:12.5px; line-height:1.75; }",

      /* ---- 轻提示 ---- */
      ".t2d-toast { position:fixed; left:50%; bottom:56px; transform:translateX(-50%); z-index:1400; padding:10px 20px; border-radius:9px; background:rgba(18,49,94,.93); color:#fff; font-size:13px; box-shadow:0 8px 24px rgba(12,27,54,.28); animation:t2dFade .18s ease; }",

      /* ---- 响应式 ---- */
      "@media (max-width:1080px) { " + P + ".t2d-root { flex-direction:column; } " + P + ".t2d-side { flex:1 1 auto; width:auto; border-right:0; border-bottom:1px solid #e8eef6; } " + P + ".t2d-info { grid-template-columns:minmax(0,1fr); } }",
      "@media (max-width:720px) { " + P + ".t2d-main { padding:14px; } }"
    ].join(String.fromCharCode(10));
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ==========================================================================
     4. 图标
     ========================================================================== */
  var ICON = {
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>',
    db: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/></svg>',
    table: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10-10-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/></svg>'
  };

  /* 原子结构缩略图（按行取色，示意二维晶格点阵） */
  var THUMB_COLORS = ["#2f6fe0", "#6b7a90", "#12996b", "#8b5cf6", "#e2761b", "#0e9aa7"];
  function structThumb(name, index) {
    var c = THUMB_COLORS[index % THUMB_COLORS.length];
    var svg = '<svg viewBox="0 0 40 40" aria-hidden="true">'
      + '<path d="M20 11.5 L10.5 27.5 L29.5 27.5 Z" fill="none" stroke="' + c + '" stroke-width="1.4" opacity=".42"/>'
      + '<path d="M20 11.5 L20 27.5" stroke="' + c + '" stroke-width="1.2" opacity=".22"/>'
      + '<circle cx="20" cy="11.5" r="4.4" fill="' + c + '" opacity=".92"/>'
      + '<circle cx="10.5" cy="27.5" r="4.4" fill="' + c + '" opacity=".72"/>'
      + '<circle cx="29.5" cy="27.5" r="4.4" fill="' + c + '" opacity=".72"/>'
      + '</svg>';
    return '<span class="t2d-thumb"><span class="t2d-thumb-box">' + svg + '</span>'
      + '<span class="t2d-thumb-name">' + esc(name) + '</span></span>';
  }

  /* ==========================================================================
     5. 通用片段
     ========================================================================== */
  function nullCell() { return '<span class="t2d-null">NULL</span>'; }
  function dashCell() { return '<span class="t2d-dash">—</span>'; }

  /* 文本单元格：空值置灰、超长截断（title 展示全文） */
  function textCell(v, limit) {
    if (isEmpty(v)) return nullCell();
    var s = String(v);
    var max = limit || 120;
    if (s.length > max) return '<span title="' + esc(s) + '">' + esc(s.slice(0, max - 2)) + '…</span>';
    return esc(s);
  }

  /* ==========================================================================
     5.1 列表分页
     ========================================================================== */
  var PER_OPTIONS = [10, 20, 50];

  function paginate(s, listKey, list) {
    var per = s.per || 10;
    var pages = Math.max(1, Math.ceil(list.length / per));
    var cur = Number(s.page[listKey] || 1);
    if (!isFinite(cur) || cur < 1) cur = 1;
    if (cur > pages) cur = pages;
    s.page[listKey] = cur;
    return {
      listKey: listKey, per: per, pages: pages, cur: cur, total: list.length,
      from: list.length ? (cur - 1) * per + 1 : 0,
      to: Math.min(cur * per, list.length),
      slice: list.slice((cur - 1) * per, cur * per)
    };
  }

  function pageNumbers(p) {
    if (p.pages <= 7) {
      var all = [];
      for (var i = 1; i <= p.pages; i++) all.push(i);
      return all;
    }
    var out = [1], start = Math.max(2, p.cur - 1), end = Math.min(p.pages - 1, p.cur + 1);
    if (start > 2) out.push("...");
    for (var j = start; j <= end; j++) out.push(j);
    if (end < p.pages - 1) out.push("...");
    out.push(p.pages);
    return out;
  }

  function renderPager(p, unit) {
    var nums = pageNumbers(p).map(function (n) {
      if (n === "...") return '<span class="t2d-page-gap">···</span>';
      return '<button type="button" class="t2d-page-num' + (n === p.cur ? ' is-active' : '') + '"'
        + ' data-t2d-page="' + p.listKey + '" data-t2d-page-to="' + n + '">' + n + '</button>';
    }).join("");

    var sizes = PER_OPTIONS.map(function (n) {
      return '<button type="button" class="t2d-page-size' + (n === p.per ? ' is-active' : '') + '"'
        + ' data-t2d-per="' + n + '">' + n + ' 条/页</button>';
    }).join("");

    return '<div class="t2d-pager">'
      + '<span class="t2d-page-tip">共 <b>' + fmt(p.total) + '</b> ' + unit
      + '　第 <b>' + p.from + '-' + p.to + '</b> 条</span>'
      + '<div class="t2d-page-ctl">'
      + '<button type="button" class="t2d-page-btn" data-t2d-page="' + p.listKey + '" data-t2d-page-to="' + (p.cur - 1) + '"'
      + (p.cur <= 1 ? ' disabled' : '') + '>上一页</button>'
      + nums
      + '<button type="button" class="t2d-page-btn" data-t2d-page="' + p.listKey + '" data-t2d-page-to="' + (p.cur + 1) + '"'
      + (p.cur >= p.pages ? ' disabled' : '') + '>下一页</button>'
      + '</div>'
      + '<div class="t2d-page-sizes">' + sizes + '</div>'
      + '</div>';
  }

  /* ==========================================================================
     6. 左侧目录树（含新增 / 编辑 / 删除）
     ========================================================================== */
  function renderTree() {
    var s = getState();
    var html = '<aside class="t2d-side">'
      + '<div class="t2d-side-head"><h3>元数据目录</h3></div>'
      + '<div class="t2d-search"><input type="text" placeholder="搜索数据库 / 数据表" value="' + esc(s.q1) + '" data-t2d-filter1><span class="t2d-search-ico">⌕</span></div>'
      + '<div class="t2d-tree">';

    buildTree().forEach(function (root) {
      var keyword = (s.q1 || "").trim().toLowerCase();
      var kids = root.children.filter(function (c) {
        return !keyword || c.label.toLowerCase().indexOf(keyword) >= 0 || String(c.code).toLowerCase().indexOf(keyword) >= 0;
      });
      var rootHit = !keyword || root.label.toLowerCase().indexOf(keyword) >= 0 || String(root.code).toLowerCase().indexOf(keyword) >= 0;
      if (!rootHit && !kids.length) return;
      var shown = rootHit ? root.children : kids;
      var open = !!s.open[root.id] || (!!keyword && shown.length > 0);

      html += '<div class="t2d-node-row">'
        + '<button class="t2d-node is-root' + (s.node === root.id ? ' is-active' : '') + (open ? ' is-open' : '') + '" type="button" data-t2d-toggle="' + root.id + '">'
        + '<span class="t2d-caret">' + ICON.chevron + '</span>'
        + '<span class="t2d-ico">' + ICON.db + '</span>'
        + '<span class="t2d-txt">' + esc(root.label) + '</span>'
        + '<span class="t2d-cnt">' + shown.length + '</span></button>'
        + '</div>';

      html += '<div class="t2d-children' + (open ? '' : ' is-folded') + '">';
      shown.forEach(function (child) {
        html += '<div class="t2d-node-row">'
          + '<button class="t2d-node' + (s.node === child.id ? ' is-active' : '') + '" type="button" data-t2d-node="' + child.id + '">'
          + '<span class="t2d-ico">' + ICON.table + '</span>'
          + '<span class="t2d-txt" title="' + esc(child.label) + '　·　' + esc(child.code) + '">' + esc(child.label) + '</span>'
          + '<span class="t2d-cnt">' + (child.count ? fmt(child.count) : '—') + '</span></button>'
          + '<span class="t2d-row-acts">'
          + '</span></div>';
      });
      if (!shown.length) html += '<div class="t2d-empty" style="padding:14px 0;font-size:12.5px;">无匹配数据集</div>';
      html += '</div>';
    });

    html += '</div></aside>';
    return html;
  }

  /* ==========================================================================
     7. 右侧：库级视图（字段信息 / 信息概览）
     ========================================================================== */
  /* 按关键词过滤四张库表的全部字段 */
  function filterDdlFields(kw) {
    var k = (kw || "").trim().toLowerCase();
    var out = [];
    DDL_TABLES.forEach(function (t) {
      t.fields.forEach(function (f) {
        if (k) {
          var hay = (f.en + " " + f.cn + " " + f.type + " " + t.name).toLowerCase();
          if (hay.indexOf(k) < 0) return;
        }
        out.push({ t: t, f: f });
      });
    });
    return out;
  }

  function renderDbFields(s) {
    var list = filterDdlFields(s.q1b);
    var p = paginate(s, "dbFields", list);
    var rows = p.slice.map(function (it, i) {
      var index = (p.cur - 1) * p.per + i;   /* 序号跨页连续 */
      var f = it.f, t = it.t;
      return '<tr>'
        + '<td class="num">' + (index + 1) + '</td>'
        + '<td class="mono">' + esc(t.name) + '</td>'
        + '<td class="mono">' + esc(f.en) + '</td>'
        + '<td class="wrap">' + (f.cn === "—" ? dashCell() : esc(f.cn)) + '</td>'
        + '<td class="mono">' + esc(f.type) + '</td>'
        + '<td>' + (f.notNull ? '<span class="t2d-check">✓</span> 非空' : '<span class="t2d-tag t-gray">可空</span>') + '</td>'
        + '<td class="mono">' + (f.def === "" ? dashCell() : esc(f.def)) + '</td>'
        + '</tr>';
    }).join("");

    /* 指标卡片 + 页脚来源说明已按需求移除，页面直接从工具条开始 */
    return '<div class="t2d-bar">'
      + '<div class="t2d-bar-input"><input type="text" placeholder="请输入字段英文名 / 中文名搜索" value="' + esc(s.q1b || "") + '" data-t2d-q1b><span class="t2d-search-ico">⌕</span></div>'
      + '</div>'
      + '<div class="t2d-card"><div class="t2d-tw"><table class="t2d-table"><thead><tr>'
      + '<th class="num">序号</th><th class="mono">所属数据表</th><th class="mono">字段英文名</th><th>字段中文名</th><th>数据类型</th><th>是否非空</th><th class="mono">默认值</th>'
      + '</tr></thead><tbody>' + (rows || '<tr><td colspan="7"><div class="t2d-empty">没有匹配的字段，请调整搜索关键词。</div></td></tr>') + '</tbody></table></div>'
      + (list.length ? renderPager(p, "个字段") : '') + '</div>';
  }

  function renderDbOverview() {
    var META = DB_META;
    var infoItems = [
      { label: "数据库名称", value: META.name },
      { label: "数据表数量", value: DDL_STAT.tables + " 张" },
      { label: "字段数合计", value: fmt(DDL_STAT.fields) + " 个" },
      { label: "数据量合计", value: fmt(DS_STAT.rows) + " 条<span class=\"t2d-badge2\">示例</span>", html: true },
      { label: "更新时间",   value: META.updated }
    ];
    var infoHtml = '<div class="t2d-info">' + infoItems.map(function (it) {
      return '<div><dt>' + esc(it.label) + '</dt><dd>' + (it.html ? it.value : esc(it.value)) + '</dd></div>';
    }).join("") + '</div>';

    /* 库级「信息概览」仅保留基本信息卡片（指标卡片与库表构成已按需求移除） */
    return '<section class="t2d-card">'
      + '<div class="t2d-sec-head"><h4>基本信息</h4></div>'
      + infoHtml
      + '</section>';
  }

  /* ==========================================================================
     8. 右侧：数据集级视图（数据信息 / 信息概览）
     ========================================================================== */
  function renderDatasetInfo(ds) {
    var s = getState();

    /* 新挂载数据集：本身尚无采集数据，展示其关联数据表（可多张，字段已合并去重）的结构 */
    if (!ds.infoCols || !ds.infoCols.length) {
      var list0 = ddlFieldsOfTables(ds.tables);
      var p0 = paginate(s, "dsStruct:" + ds.key, list0);
      var rows0 = p0.slice.map(function (f, i) {
        var index = (p0.cur - 1) * p0.per + i;
        return '<tr>'
          + '<td class="num">' + (index + 1) + '</td>'
          + '<td class="mono">' + esc(f.en) + '</td>'
          + '<td class="wrap">' + (f.cn === "—" ? dashCell() : esc(f.cn)) + '</td>'
          + '<td class="mono">' + esc(f.type) + '</td>'
          + '<td>' + (f.notNull ? '<span class="t2d-check">✓</span> 非空' : '<span class="t2d-tag t-gray">可空</span>') + '</td>'
          + '<td class="mono">' + (f.def === "" ? dashCell() : esc(f.def)) + '</td>'
          + '</tr>';
      }).join("");

      /* 新挂载数据集的工具条提示已按需求移除，直接从表结构开始 */
      return ''
        + '<div class="t2d-card"><div class="t2d-tw"><table class="t2d-table"><thead><tr>'
        + '<th class="num">序号</th><th class="mono">字段英文名</th><th>字段中文名</th><th>数据类型</th><th>是否非空</th><th class="mono">默认值</th>'
        + '</tr></thead><tbody>' + (rows0 || '<tr><td colspan="6"><div class="t2d-empty">该库表暂无字段定义。</div></td></tr>') + '</tbody></table></div>'
        + (list0.length ? renderPager(p0, "个字段") : '') + '</div>'
        + '<div class="t2d-foot"><span>字段结构随关联数据表 <b>' + esc(ds.tableText) + '</b> 自动同步</span><span>可在「信息概览」查看该数据集基础信息</span></div>';
    }

    var cols = ds.infoCols;
    var p = paginate(s, "dsInfo:" + ds.key, ds.infoRows);
    var head = '<tr><th class="num">序号</th><th>材料名称</th>'
      + cols.map(function (c) { return '<th>' + esc(c.t) + '</th>'; }).join("") + '</tr>';
    var body = p.slice.map(function (row, i) {
      var index = (p.cur - 1) * p.per + i;   /* 序号跨页连续 */
      var m = MATERIALS[index] || { name: "—", id: "" };
      var tds = cols.map(function (c) {
        var v = row[c.k];
        if (c.kind === "image") return '<td>' + structThumb(isEmpty(v) ? "—" : v, index) + '</td>';
        return '<td class="wrap">' + textCell(v) + '</td>';
      }).join("");
      return '<tr><td class="num">' + (index + 1) + '</td>'
        + '<td><div class="t2d-mat"><span class="t2d-mat-name">' + esc(m.name) + '</span>'
        + '<span class="t2d-mat-id">' + esc(m.id) + '</span></div></td>'
        + tds + '</tr>';
    }).join("");

    /* 数据集「数据信息」工具条提示已按需求移除，直接从表格开始 */
    return '<div class="t2d-card"><div class="t2d-tw"><table class="t2d-table is-sample"><thead>' + head + '</thead><tbody>'
      + (body || '<tr><td colspan="' + (cols.length + 2) + '"><div class="t2d-empty">该数据集暂无数据信息。</div></td></tr>')
      + '</tbody></table></div>'
      + renderPager(p, "条记录") + '</div>'
      /* 页脚左半句「数据来源：…」已按需求移除，仅保留右侧列顺序说明 */
      + '<div class="t2d-foot"><span>列顺序与数据集业务口径一致</span></div>';
  }

  function renderDatasetOverview(ds) {
    var infoItems = [
      { label: "数据集名称", value: ds.label },
      { label: "数据量合计", value: ds.rows ? fmt(ds.rows) + " 条" : "—" },
      { label: "字段数合计", value: ds.fieldCount + " 个" },
      { label: "数据信息条数", value: ds.infoCount ? ds.infoCount + " 条示例" : "—" },
      { label: "更新时间",   value: DB_META.updated }
    ];
    var infoHtml = '<div class="t2d-info">' + infoItems.map(function (it) {
      return '<div><dt>' + esc(it.label) + '</dt><dd>' + (it.html ? it.value : esc(it.value)) + '</dd></div>';
    }).join("") + '</div>';

    /* 数据集「信息概览」只保留基本信息卡片（指标卡片已按需求移除） */
    return '<section class="t2d-card">'
      + '<div class="t2d-sec-head"><h4>基本信息</h4></div>'
      + infoHtml
      + '</section>';
  }

  /* ==========================================================================
     9. 弹窗：新增 / 编辑 / 删除数据集
     ========================================================================== */
  function closeModal() {
    var el = document.getElementById("t2dModalMask");
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  /* 关联数据表：多选下拉。面板内联展开（不受 modal-body 的 overflow 裁切），
     已选库表以标签形式回显在控件内 */
  function tablePickerHtml(selected) {
    var sel = selected || [];
    var opts = TABLE_OPTIONS.map(function (o) {
      var on = sel.indexOf(o.value) >= 0;
      return '<label class="t2d-msel-opt' + (on ? ' is-on' : '') + '">'
        + '<input type="checkbox" value="' + esc(o.value) + '" data-t2d-f-tables' + (on ? ' checked' : '') + '>'
        + '<span class="t2d-msel-name">' + esc(o.value) + '</span>'
        + '<span class="t2d-msel-cn">' + esc(o.cn || "") + '</span>'
        + '</label>';
    }).join("");

    var chips = sel.length
      ? sel.map(function (n) { return '<span class="t2d-msel-chip">' + esc(n) + '</span>'; }).join("")
      : '<span class="t2d-msel-ph">请选择关联数据表（可多选）</span>';

    return '<div class="t2d-msel" data-t2d-msel>'
      + '<div class="t2d-msel-ctrl" data-t2d-msel-toggle role="button" tabindex="0" aria-haspopup="listbox">'
      + '<span class="t2d-msel-chips" data-t2d-msel-chips>' + chips + '</span>'
      + '<span class="t2d-msel-caret">' + ICON.chevron + '</span>'
      + '</div>'
      + '<div class="t2d-msel-panel" data-t2d-msel-panel>' + opts + '</div>'
      + '<p class="t2d-form-tip" data-t2d-msel-tip>' + (sel.length
        ? "已选 " + sel.length + " 张表，字段结构将按所选库表合并同步"
        : "可同时选择多张物理库表，字段结构会随所选库表自动合并同步。")
      + '</p></div>';
  }

  /* 当前弹窗中已勾选的库表（按选项顺序） */
  function pickedTables() {
    var mask = document.getElementById("t2dModalMask");
    var out = [];
    if (!mask) return out;
    Array.prototype.forEach.call(mask.querySelectorAll("[data-t2d-f-tables]"), function (b) {
      if (b.checked) out.push(b.value);
    });
    return out;
  }

  /* 勾选变化后同步：选项高亮 + 已选标签 + 提示文案 */
  function syncTablePicker() {
    var mask = document.getElementById("t2dModalMask");
    if (!mask) return;
    var picker = mask.querySelector("[data-t2d-msel]");
    if (!picker) return;
    var names = pickedTables();

    Array.prototype.forEach.call(picker.querySelectorAll(".t2d-msel-opt"), function (lb) {
      var b = lb.querySelector("[data-t2d-f-tables]");
      if (b && b.checked) lb.classList.add("is-on"); else lb.classList.remove("is-on");
    });

    var chips = picker.querySelector("[data-t2d-msel-chips]");
    if (chips) {
      chips.innerHTML = names.length
        ? names.map(function (n) { return '<span class="t2d-msel-chip">' + esc(n) + '</span>'; }).join("")
        : '<span class="t2d-msel-ph">请选择关联数据表（可多选）</span>';
    }
    var tip = picker.querySelector("[data-t2d-msel-tip]");
    if (tip) {
      tip.textContent = names.length
        ? "已选 " + names.length + " 张表，字段结构将按所选库表合并同步"
        : "可同时选择多张物理库表，字段结构会随所选库表自动合并同步。";
    }
  }

  /* mode: "add" | "edit" */
  function openDatasetForm(mode, key) {
    closeModal();
    var s = getState();
    var editing = mode === "edit" ? DS[key] : null;
    var name = editing ? editing.label : "";
    var tbls = editing ? editing.tables.slice() : [];

    var mask = document.createElement("div");
    mask.className = "t2d-modal-mask";
    mask.id = "t2dModalMask";
    mask.innerHTML = '<div class="t2d-modal" role="dialog" aria-modal="true">'
      + '<div class="t2d-modal-head">'
      + '<div><h3>' + (mode === "add" ? "新增数据集" : "编辑数据集") + '</h3>'
      + '<p>' + (mode === "add" ? "挂载于「" + DB_META.name + "」元数据目录" : "修改数据集名称与关联数据表") + '</p></div>'
      + '<button type="button" data-t2d-modal-close aria-label="关闭">×</button>'
      + '</div>'
      + '<div class="t2d-modal-body">'
      + '<div class="t2d-form-item"><label>数据集名称<i>*</i></label>'
      + '<input type="text" data-t2d-f-name maxlength="40" placeholder="请输入数据集名称，如「界面性质数据集」" value="' + esc(name) + '"></div>'
      + '<div class="t2d-form-item"><label>关联数据表<i>*</i></label>'
      + tablePickerHtml(tbls) + '</div>'
      + '</div>'
      + '<div class="t2d-modal-foot">'
      + '<button class="t2d-btn" type="button" data-t2d-modal-close>取消</button>'
      + '<button class="t2d-btn is-primary" type="button" data-t2d-modal-ok>' + (mode === "add" ? "确定新增" : "保存修改") + '</button>'
      + '</div></div>';

    mask.setAttribute("data-t2d-mode", mode);
    mask.setAttribute("data-t2d-page", PAGE_ID);
    if (editing) mask.setAttribute("data-t2d-key", key);
    mask.addEventListener("click", function (e) { if (e.target === mask) closeModal(); });
    document.body.appendChild(mask);
    syncTablePicker();
    setTimeout(function () {
      var el = document.querySelector("#t2dModalMask [data-t2d-f-name]");
      if (el) el.focus();
    }, 30);
  }

  function openDeleteConfirm(key) {
    closeModal();
    var d = DS[key];
    if (!d) return;
    var mask = document.createElement("div");
    mask.className = "t2d-modal-mask";
    mask.id = "t2dModalMask";
    mask.innerHTML = '<div class="t2d-modal" role="dialog" aria-modal="true" style="width:min(440px,96vw);">'
      + '<div class="t2d-modal-head">'
      + '<div><h3>删除数据集</h3><p>该操作将从元数据目录中移除数据集</p></div>'
      + '<button type="button" data-t2d-modal-close aria-label="关闭">×</button>'
      + '</div>'
      + '<div class="t2d-modal-body">'
      + '<p class="t2d-confirm-text">确认删除数据集 <b>「' + esc(d.label) + '」</b> ？</p>'
      + '<div class="t2d-confirm-warn"><span>⚠</span><span>删除后该数据集及其数据信息入口将从「' + DB_META.name + '」目录中移除，操作不可撤销。</span></div>'
      + '</div>'
      + '<div class="t2d-modal-foot">'
      + '<button class="t2d-btn" type="button" data-t2d-modal-close>取消</button>'
      + '<button class="t2d-btn is-danger" type="button" data-t2d-modal-ok>确认删除</button>'
      + '</div></div>';
    mask.setAttribute("data-t2d-mode", "delete");
    mask.setAttribute("data-t2d-page", PAGE_ID);
    mask.setAttribute("data-t2d-key", key);
    mask.addEventListener("click", function (e) { if (e.target === mask) closeModal(); });
    document.body.appendChild(mask);
  }

  function formError(el, msg) {
    var item = el.closest(".t2d-form-item");
    if (!item) return;
    item.classList.add("is-error");
    var old = item.querySelector(".t2d-form-err");
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var p = document.createElement("p");
    p.className = "t2d-form-err";
    p.textContent = msg;
    item.appendChild(p);
    el.focus();
  }

  function clearFormError(el) {
    var item = el.closest(".t2d-form-item");
    if (!item) return;
    item.classList.remove("is-error");
    var old = item.querySelector(".t2d-form-err");
    if (old && old.parentNode) old.parentNode.removeChild(old);
  }

  function toast(msg) {
    var el = document.getElementById("t2dToast");
    if (el && el.parentNode) el.parentNode.removeChild(el);
    el = document.createElement("div");
    el.className = "t2d-toast";
    el.id = "t2dToast";
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function () { if (el && el.parentNode) el.parentNode.removeChild(el); }, 2400);
  }

  /* 提交新增 / 编辑 */
  function submitDatasetForm(mask) {
    var mode = mask.getAttribute("data-t2d-mode");
    var key = mask.getAttribute("data-t2d-key");
    var s = getState();
    var nameEl = mask.querySelector("[data-t2d-f-name]");
    var name = (nameEl.value || "").trim();
    var tbls = pickedTables();

    if (!name) { formError(nameEl, "请输入数据集名称"); return; }
    if (name.length > 40) { formError(nameEl, "数据集名称不超过 40 个字符"); return; }
    if (!tbls.length) {
      var ctrl = mask.querySelector("[data-t2d-msel-toggle]");
      formError(ctrl || nameEl, "请选择关联数据表（至少选择 1 张）");
      var picker = mask.querySelector("[data-t2d-msel]");
      if (picker) picker.classList.add("is-open");   /* 展开面板方便直接勾选 */
      return;
    }

    /* 同名校验（编辑时排除自身） */
    var dup = datasetList().filter(function (d) { return d.key !== key && d.label === name; });
    if (dup.length) { formError(nameEl, "已存在同名数据集「" + name + "」"); return; }

    if (mode === "add") {
      var nk = "cu" + Date.now().toString(36);
      var def = {
        key: nk, label: name, tables: tbls.slice(), custom: true, group: "自定义",
        coverage: "—", rows: 0, size: 0,
        desc: "自定义挂载数据集，数据按关联数据表 " + tbls.join("、") + " 的字段结构组织。"
      };
      DS[nk] = makeDataset(def);
      s.customDs.push(def);
      s.open["db-root"] = true;
      s.node = "ds:" + nk;
      s.tab = "info";
      closeModal();
      renderPage();
      toast("数据集「" + name + "」已新增");
      return;
    }

    /* 编辑 */
    var d = DS[key];
    if (!d) { closeModal(); return; }
    var oldLabel = d.label;
    var oldTables = d.tables.join("、");
    d.label = name;
    d.tables = tbls.slice();
    d.table = tbls[0] || "";
    d.tableText = tbls.join("、");
    if (d.custom) {
      /* 自定义数据集需按新选的库表重建字段结构与定义快照 */
      var nd = makeDataset({ key: key, label: name, tables: tbls.slice(), custom: true, group: "自定义", coverage: d.coverage, rows: d.rows, size: d.size, desc: d.desc });
      DS[key] = nd;
      s.customDs.forEach(function (c) {
        if (c.key === key) {
          c.label = name;
          c.tables = tbls.slice();
          c.table = tbls[0] || "";
        }
      });
    }
    /* 内置数据集：字段口径不变，仅同步关联数据表 */
    closeModal();
    renderPage();
    toast("数据集「" + oldLabel + "」已更新" + (oldTables === d.tableText ? "" : "，关联数据表已调整"));
  }

  /* 执行删除 */
  function deleteDataset(key) {
    var s = getState();
    var d = DS[key];
    if (!d) { closeModal(); return; }
    if (d.custom) {
      s.customDs = s.customDs.filter(function (c) { return c.key !== key; });
      delete DS[key];
    } else {
      s.hidden[key] = true;   /* 内置数据集仅隐藏，保留定义便于扩展 */
    }
    if (s.node === "ds:" + key) { s.node = "db-root"; s.tab = "fields"; }
    closeModal();
    renderPage();
    toast("数据集「" + d.label + "」已删除");
  }

  /* ==========================================================================
     11. 主渲染
     ========================================================================== */
  function renderPage() {
    var page = document.getElementById("page-" + PAGE_ID);
    if (!page) return;
    ensureStyle();
    page.classList.add("t2d-ready");
    var s = getState();
    var right;

    if (s.node === "db-root") {
      if (DB_TABS.indexOf(s.tab) < 0) s.tab = "fields";
      right = '<div class="t2d-crumb"><span>低维材料主题库</span><span>／</span><span>低维材料数据库</span><span>／</span><b>' + esc(DB_META.name) + '</b></div>'
        + '<div class="t2d-title-row"><h2>' + esc(DB_META.name) + '</h2></div>'
        + '<div class="t2d-tabs">'
        + '<button class="t2d-tab' + (s.tab === "fields" ? " is-active" : "") + '" type="button" data-t2d-tab="fields">字段信息</button>'
        + '<button class="t2d-tab' + (s.tab === "overview" ? " is-active" : "") + '" type="button" data-t2d-tab="overview">信息概览</button>'
        + '</div>'
        + (s.tab === "overview" ? renderDbOverview() : renderDbFields(s));
    } else {
      var ds = DS[s.node.slice(3)];
      if (!ds) { s.node = "db-root"; s.tab = "fields"; return renderPage(); }
      if (DS_TABS.indexOf(s.tab) < 0) s.tab = "info";
      /* 数据集标题区按需求精简：去掉「数据集」徽标、库表徽标与标题下描述段 */
      right = '<div class="t2d-crumb"><span>低维材料主题库</span><span>／</span><span>低维材料数据库</span><span>／</span><span>' + esc(DB_META.name) + '</span><span>／</span><b>' + esc(ds.label) + '</b></div>'
        + '<div class="t2d-title-row"><h2>' + esc(ds.label) + '</h2></div>'
        + '<div class="t2d-tabs">'
        + '<button class="t2d-tab' + (s.tab === "info" ? " is-active" : "") + '" type="button" data-t2d-tab="info">数据信息</button>'
        + '<button class="t2d-tab' + (s.tab === "overview" ? " is-active" : "") + '" type="button" data-t2d-tab="overview">信息概览</button>'
        + '</div>'
        + (s.tab === "overview" ? renderDatasetOverview(ds) : renderDatasetInfo(ds));
    }

    page.innerHTML = '<div class="t2d-root">' + renderTree() + '<div class="t2d-main">' + right + '</div></div>';
    if (typeof window !== "undefined" && window.scrollTo) window.scrollTo({ top: 0, behavior: "auto" });
  }

  /* ==========================================================================
     12. 事件
     ========================================================================== */
  function bindEvents() {
    /* dataset 的键名不能含连字符（DOMStringMap 只认 camelCase→dash），统一换成下划线 */
    var boundFlag = "t2dBound_" + PAGE_ID.replace(/[^A-Za-z0-9]/g, "_");
    if (document.body.dataset[boundFlag] === "true") return;
    document.body.dataset[boundFlag] = "true";

    /* 五个库共用 document.body 上的委托监听，因此每个实例只处理「自己页面内」
       或「自己打开的弹窗」里发生的事件，避免互相串台 */
    function inMyPage(el) { return !!(el && el.closest && el.closest("#page-" + PAGE_ID)); }
    function myModal() {
      var m = document.getElementById("t2dModalMask");
      return (m && m.getAttribute("data-t2d-page") === PAGE_ID) ? m : null;
    }

    document.body.addEventListener("click", function (event) {
      var el = event.target;
      if (!el || !el.closest) return;
      if (!inMyPage(el) && !myModal()) return;
      var s = getState();
      var node, hit;

      /* ---- 弹窗：关联数据表多选面板开关 ---- */
      hit = el.closest("[data-t2d-msel-toggle]");
      if (hit) {
        var picker = hit.closest("[data-t2d-msel]");
        if (picker) picker.classList.toggle("is-open");
        return;
      }

      /* ---- 弹窗 ---- */
      if (el.closest("[data-t2d-modal-close]")) { closeModal(); return; }

      hit = el.closest("[data-t2d-modal-ok]");
      if (hit) {
        var mask = document.getElementById("t2dModalMask");
        if (!mask) return;
        var mode = mask.getAttribute("data-t2d-mode");
        var mkey = mask.getAttribute("data-t2d-key");
        if (mode === "delete") deleteDataset(mkey);
        else submitDatasetForm(mask);
        return;
      }

      /* ---- 数据集增删改入口 ---- */
      hit = el.closest("[data-t2d-add-ds]");
      if (hit) { openDatasetForm("add"); return; }

      hit = el.closest("[data-t2d-edit-ds]");
      if (hit) { openDatasetForm("edit", hit.getAttribute("data-t2d-edit-ds").slice(3)); return; }

      hit = el.closest("[data-t2d-del-ds]");
      if (hit) { openDeleteConfirm(hit.getAttribute("data-t2d-del-ds").slice(3)); return; }

      /* ---- 分页 ---- */
      hit = el.closest("[data-t2d-page]");
      if (hit) {
        var pkey = hit.getAttribute("data-t2d-page");
        var pto = parseInt(hit.getAttribute("data-t2d-page-to"), 10);
        if (pkey && isFinite(pto) && pto >= 1) { s.page[pkey] = pto; renderPage(); }
        return;
      }

      hit = el.closest("[data-t2d-per]");
      if (hit) {
        var pv = parseInt(hit.getAttribute("data-t2d-per"), 10);
        if (isFinite(pv) && pv >= 1) { s.per = pv; s.page = {}; renderPage(); }
        return;
      }

      /* ---- 页签 ---- */
      hit = el.closest("[data-t2d-tab]");
      if (hit) { s.tab = hit.getAttribute("data-t2d-tab"); s.q1b = ""; renderPage(); return; }

      /* ---- 目录节点 ---- */
      hit = el.closest("[data-t2d-node]");
      if (hit) {
        node = hit.getAttribute("data-t2d-node");
        s.node = node;
        s.tab = node === "db-root" ? "fields" : "info";
        s.q1b = "";
        renderPage(); return;
      }

      hit = el.closest("[data-t2d-toggle]");
      if (hit) {
        var id = hit.getAttribute("data-t2d-toggle");
        if (s.node === id) { s.node = "db-root"; s.tab = "fields"; }
        else { s.node = id; s.tab = "fields"; }
        s.open[id] = !s.open[id];
        renderPage(); return;
      }
    });

    document.body.addEventListener("input", function (event) {
      var el = event.target;
      if (!el || !el.matches) return;
      var s = getState();
      if (el.matches("[data-t2d-filter1]")) { s.q1 = el.value; renderPage(); keepFocus("[data-t2d-filter1]"); return; }
      if (el.matches("[data-t2d-q1b]")) {
        s.q1b = el.value;
        s.page["dbFields"] = 1;
        renderPage(); keepFocus("[data-t2d-q1b]"); return;
      }
      /* 表单输入：清除该项错误态 */
      if (el.matches("[data-t2d-f-name]")) clearFormError(el);
    });

    document.body.addEventListener("change", function (event) {
      var el = event.target;
      if (!el || !el.matches) return;
      /* 关联数据表勾选：先同步控件回显，再清错误态 */
      if (el.matches("[data-t2d-f-tables]")) {
        syncTablePicker();
        clearFormError(el);
      }
    });

    document.body.addEventListener("keydown", function (event) {
      if (event.key === "Escape") { closeModal(); return; }
      /* 弹窗内回车提交：只处理本实例打开的弹窗 */
      if (event.key === "Enter") {
        var mask = myModal();
        if (mask && mask.getAttribute("data-t2d-mode") !== "delete" && event.target && event.target.closest && event.target.closest("#t2dModalMask")) {
          event.preventDefault();
          submitDatasetForm(mask);
        }
      }
    });
  }

  /* 重渲染后恢复输入焦点与光标位置 */
  function keepFocus(selector) {
    setTimeout(function () {
      var el = document.querySelector("#page-" + PAGE_ID + " " + selector);
      if (!el) return;
      el.focus();
      try { var n = el.value.length; el.setSelectionRange(n, n); } catch (e) { /* ignore */ }
    }, 0);
  }

  /* ==========================================================================
     13. 接入既有渲染链，让切到本页时走新实现
     ========================================================================== */
  function patch(name) {
    if (typeof window[name] !== "function") return;
    var base = window[name];
    /* 五个实例依次包装：命中自己的 pageId 就走新实现，否则透传给上一层 */
    var wrapped = function (pageId) {
      if (pageId === PAGE_ID) { renderPage(); return; }
      return base.apply(this, arguments);
    };
    wrapped.__t2dRewritten = true;
    window[name] = wrapped;
  }

  ["renderLowdimDbOverviewPage", "renderTwodDatabasePage"].forEach(patch);

  bindEvents();

  /* 把本实例的渲染函数登记到全局表，供 switchPage / 首屏渲染统一调度 */
  DB_RENDERERS[PAGE_ID] = renderPage;
  DB_RENDER_LIST.push(renderPage);
  }   /* ← buildDbPage(cfg) 结束 */

  /* ==========================================================================
     14. 装配五个库实例 + 全局调度
     ========================================================================== */
  Object.keys(DB_CONFIGS).forEach(function (k) { buildDbPage(DB_CONFIGS[k]); });

  var baseSwitch = typeof window.switchPage === "function" ? window.switchPage : null;
  if (baseSwitch && !baseSwitch.__t2dRewritten) {
    var patchedSwitch = function (page) {
      var result = baseSwitch.apply(this, arguments);
      if (DB_RENDERERS[page]) setTimeout(DB_RENDERERS[page], 0);
      return result;
    };
    patchedSwitch.__t2dRewritten = true;
    window.switchPage = patchedSwitch;
    try { switchPage = patchedSwitch; } catch (e) { /* ignore */ }
  }

  /* 首屏：当前停在某个库页则立即渲染该页；其余页面容器存在时也一并装配 */
  try {
    if (typeof state !== "undefined" && DB_RENDERERS[state.page]) setTimeout(DB_RENDERERS[state.page], 0);
  } catch (e) { /* ignore */ }
  DB_RENDER_LIST.forEach(function (rp) {
    setTimeout(rp, 0);
    [60, 200, 500, 1000].forEach(function (d) { setTimeout(rp, d); });
  });
})();
