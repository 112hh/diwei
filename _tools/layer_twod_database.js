/* ============================================================================
   二维材料数据库 —— 数据集类型下拉 + 数据集列表 + 查看全部样例 + 库表结构
   追加层（20260922 初版 / 20260923 修订）：只作用于 #page-lowdim-database-twod，其它四个子库零改动。

   20260923 修订内容：
     1) 新增「库表结构视图」双层导航
          数据库层：库表清单 + 信息概览 + 数据集字段覆盖核对
          数据表层：字段信息 + 示例数据 + 信息概览（含计算与测试条件）
     2) 表结构元数据依据 gkx_ldm.sql 生成，覆盖 3 张核心业务表 + 3 张支撑表
     3) 依据《低维材料主题库.xlsx》R30~R37 八大数据集字段要求，修正「结构特征数据集」
        晶胞参数缺 α/β/γ 夹角、缺层数等缺口
   ============================================================================ */
(function () {
  "use strict";

  var PAGE_ID = "lowdim-database-twod";
  var STYLE_ID = "twod-dataset-type-view-20260922";
  var esc = function (v) {
    return typeof escapeLowDimHtml === "function" ? escapeLowDimHtml(String(v == null ? "" : v)) : String(v == null ? "" : v);
  };

  /* ---------- 1. 八类数据集：字段沿用既有定义，样例数据为本层新增 ---------- */
  var DATASET_SAMPLES = {
    structure: [
      { structureImage: "MoS2-2H", formula: "MoS2", cellParams: "a=3.17 Å, b=3.17 Å, c=20.00 Å；α=90°, β=90°, γ=120°", layerThickness: "3.13 Å", atomicCoords: "Mo(0.000,0.000,0.500)；S(0.333,0.667,0.586)；S(0.667,0.333,0.414)", bondInfo: "d(Mo-S)=2.41 Å；∠SMoS=82.1°, ∠MoSMo=98.0°", crystalSystem: "六方晶系", spaceGroup: "P-6m2" },
      { structureImage: "Graphene", formula: "C", cellParams: "a=2.46 Å, b=2.46 Å, c=18.00 Å；α=90°, β=90°, γ=120°", layerThickness: "0.34 Å（等效）", atomicCoords: "C(0.000,0.000,0.500)；C(0.333,0.667,0.500)", bondInfo: "d(C-C)=1.42 Å；∠CCC=120.0°", crystalSystem: "六方晶系", spaceGroup: "P6/mmm" },
      { structureImage: "hBN", formula: "BN", cellParams: "a=2.51 Å, b=2.51 Å, c=20.10 Å；α=90°, β=90°, γ=120°", layerThickness: "3.33 Å", atomicCoords: "B(0.000,0.000,0.500)；N(0.333,0.667,0.500)", bondInfo: "d(B-N)=1.45 Å；∠BNB=120.0°, ∠NBN=120.0°", crystalSystem: "六方晶系", spaceGroup: "P6₃/mmc" },
      { structureImage: "In2Se3", formula: "In2Se3", cellParams: "a=4.05 Å, b=4.05 Å, c=19.60 Å；α=90°, β=90°, γ=120°", layerThickness: "6.60 Å", atomicCoords: "In(0.000,0.000,0.423)；Se(0.333,0.667,0.512)；Se(0.667,0.333,0.334)", bondInfo: "d(In-Se)=2.62 Å；∠SeInSe=109.5°", crystalSystem: "六方晶系", spaceGroup: "P6₃/mmc" },
      { structureImage: "CrOOH", formula: "CrOOH", cellParams: "a=3.02 Å, b=3.02 Å, c=13.40 Å；α=90°, β=90°, γ=120°", layerThickness: "2.86 Å", atomicCoords: "Cr(0.000,0.000,0.500)；O(0.333,0.667,0.442)；H(0.667,0.333,0.386)", bondInfo: "d(Cr-O)=1.99 Å；d(O-H)=0.98 Å；∠OCrO=88.4°", crystalSystem: "三方晶系", spaceGroup: "P-3m1" },
      { structureImage: "Nb2C", formula: "Nb2C", cellParams: "a=3.12 Å, b=3.12 Å, c=14.80 Å；α=90°, β=90°, γ=120°", layerThickness: "5.90 Å", atomicCoords: "Nb(0.000,0.000,0.408)；C(0.333,0.667,0.500)；Nb(0.667,0.333,0.592)", bondInfo: "d(Nb-C)=2.16 Å；∠NbCNb=60.0°", crystalSystem: "六方晶系", spaceGroup: "P6₃/mmc" },
      { structureImage: "WS2", formula: "WS2", cellParams: "a=3.19 Å, b=3.19 Å, c=20.20 Å；α=90°, β=90°, γ=120°", layerThickness: "3.14 Å", atomicCoords: "W(0.000,0.000,0.500)；S(0.333,0.667,0.588)；S(0.667,0.333,0.412)", bondInfo: "d(W-S)=2.42 Å；∠SWS=82.3°, ∠WSW=98.4°", crystalSystem: "六方晶系", spaceGroup: "P-6m2" },
      { structureImage: "WSe2", formula: "WSe2", cellParams: "a=3.32 Å, b=3.32 Å, c=21.00 Å；α=90°, β=90°, γ=120°", layerThickness: "3.35 Å", atomicCoords: "W(0.000,0.000,0.500)；Se(0.333,0.667,0.591)；Se(0.667,0.333,0.409)", bondInfo: "d(W-Se)=2.54 Å；∠SeWSe=82.5°, ∠WSeW=98.7°", crystalSystem: "六方晶系", spaceGroup: "P-6m2" }
    ],
    electronic: [
      { bandStructure: "MoS2_band.dat；K 点直接带隙 1.82 eV", densityOfStates: "MoS2_dos.dat；费米能级附近 DOS 已归一", effectiveMass: "me*=0.48 m₀，mh*=0.59 m₀" },
      { bandStructure: "Graphene_band.dat；Dirac 点位于 K", densityOfStates: "Graphene_dos.dat；Dirac 点 DOS 接近 0", effectiveMass: "Dirac 线性色散，有效质量趋近 0" },
      { bandStructure: "hBN_band.dat；Γ 点直接带隙 4.70 eV", densityOfStates: "hBN_dos.dat；价带顶以 N-p 为主", effectiveMass: "me*=0.52 m₀，mh*=0.61 m₀" },
      { bandStructure: "In2Se3_band.dat；Γ 点直接带隙 1.40 eV", densityOfStates: "In2Se3_dos.dat；Se-p 主导价带顶", effectiveMass: "me*=0.36 m₀，mh*=0.44 m₀" },
      { bandStructure: "CrOOH_band.dat；间接带隙 2.10 eV", densityOfStates: "CrOOH_dos.dat；带隙主导轨道为 Cr-d", effectiveMass: "me*=0.71 m₀，mh*=0.88 m₀" },
      { bandStructure: "Nb2C_band.dat；金属性，Nb-d 跨费米能级", densityOfStates: "Nb2C_dos.dat；费米能级处 DOS 非零", effectiveMass: "金属性，无有效质量定义" }
    ],
    electrical: [
      { ferroelectric: "In2Se3 面外自发极化 0.11 C/m²", piezoelectric: "d11 = 5.8 pm/V" },
      { ferroelectric: "CuInP2S6 层间铁电翻转，极化 0.04 C/m²", piezoelectric: "e11 = 3.2×10⁻¹⁰ C/m" },
      { ferroelectric: "MoS2 单层无自发极化（中心对称）", piezoelectric: "e11 = 362 pC/m，d11 = 3.65 pm/V" },
      { ferroelectric: "SnTe 单层面内铁电极化 0.02 C/m²", piezoelectric: "d11 = 2.4 pm/V" },
      { ferroelectric: "Sc2CO2 单层铁电翻转势垒 0.32 eV", piezoelectric: "e11 = 4.1×10⁻¹⁰ C/m" }
    ],
    magnetic: [
      { magneticGroundState: "CrI3 单层铁磁基态构型图", magneticTransitionTemperature: "45 K" },
      { magneticGroundState: "Fe3GeTe2 单层铁磁基态", magneticTransitionTemperature: "130 K" },
      { magneticGroundState: "CrOOH 铁磁基态（FM 能量最低）", magneticTransitionTemperature: "待补充（工单 QC-2026-0007）" },
      { magneticGroundState: "MnSe2 单层反铁磁基态", magneticTransitionTemperature: "88 K" },
      { magneticGroundState: "VS2 单层铁磁基态", magneticTransitionTemperature: "62 K" },
      { magneticGroundState: "CrBr3 单层铁磁基态", magneticTransitionTemperature: "34 K" }
    ],
    thermal: [
      { formationEnergy: "-1.24 eV/atom", phononSpectrum: "MoS2_phonon.dat；无虚频，动力学稳定", phononDos: "MoS2_phonon_dos.dat" },
      { formationEnergy: "-0.98 eV/atom", phononSpectrum: "hBN_phonon.dat；声学支稳定", phononDos: "hBN_phonon_dos.dat" },
      { formationEnergy: "-0.65 eV/atom", phononSpectrum: "Nb2C_phonon.dat；3 声学支 + 6 光学支", phononDos: "Nb2C_phonon_dos.dat" },
      { formationEnergy: "-0.87 eV/atom", phononSpectrum: "Graphene_phonon.dat；ZA 支呈二次色散", phononDos: "Graphene_phonon_dos.dat" },
      { formationEnergy: "-1.07 eV/atom", phononSpectrum: "WS2_phonon.dat；无虚频", phononDos: "WS2_phonon_dos.dat" },
      { formationEnergy: "-0.79 eV/atom", phononSpectrum: "In2Se3_phonon.dat；低频区存在软化", phononDos: "In2Se3_phonon_dos.dat" }
    ],
    mechanical: [
      { elasticConstant: "C11=123 N/m，C12=31 N/m", youngModulus: "180 N/m", poissonRatio: "0.25" },
      { elasticConstant: "C11=340 N/m，C12=61 N/m", youngModulus: "342 N/m", poissonRatio: "0.17" },
      { elasticConstant: "C11=275 N/m，C12=48 N/m", youngModulus: "276 N/m", poissonRatio: "0.22" },
      { elasticConstant: "C11=68.4 GPa", youngModulus: "68.4 GPa", poissonRatio: "0.31" },
      { elasticConstant: "C11=210 N/m，C12=44 N/m", youngModulus: "198 N/m", poissonRatio: "0.21" },
      { elasticConstant: "C11=156 N/m，C12=38 N/m", youngModulus: "147 N/m", poissonRatio: "0.24" }
    ],
    optical: [
      { dielectricFunction: "MoS2_epsilon.dat", absorptionCoefficient: "峰值 8.2×10⁵ cm⁻¹", reflectivity: "Rmax=0.31", refractiveIndex: "n=2.6", extinctionCoefficient: "k=0.42" },
      { dielectricFunction: "hBN_epsilon.dat", absorptionCoefficient: "紫外区吸收增强", reflectivity: "Rmax=0.18", refractiveIndex: "n=1.9", extinctionCoefficient: "k=0.21" },
      { dielectricFunction: "WS2_epsilon.dat", absorptionCoefficient: "峰值 7.6×10⁵ cm⁻¹", reflectivity: "Rmax=0.28", refractiveIndex: "n=2.4", extinctionCoefficient: "k=0.38" },
      { dielectricFunction: "In2Se3_epsilon.dat", absorptionCoefficient: "可见光区宽谱吸收", reflectivity: "Rmax=0.24", refractiveIndex: "n=2.2", extinctionCoefficient: "k=0.31" },
      { dielectricFunction: "Graphene_epsilon.dat", absorptionCoefficient: "可见光区约 2.3% 吸收", reflectivity: "Rmax=0.02", refractiveIndex: "n=2.0", extinctionCoefficient: "k=1.1" }
    ],
    defect: [
      { vacancyDefect: "S 空位；形成能 1.72 eV", antisiteDefect: "Mo_S 反位缺陷；形成能 3.41 eV" },
      { vacancyDefect: "B 空位；形成能 2.18 eV", antisiteDefect: "B_N 反位缺陷；形成能 4.03 eV" },
      { vacancyDefect: "Nb 空位；形成能 1.94 eV", antisiteDefect: "C_Nb 反位缺陷；形成能 3.86 eV" },
      { vacancyDefect: "Se 空位；形成能 1.55 eV", antisiteDefect: "In_Se 反位缺陷；形成能 3.12 eV" },
      { vacancyDefect: "Mo 空位；形成能 4.26 eV", antisiteDefect: "S_Mo 反位缺陷；形成能 5.07 eV" }
    ]
  };

  /* ---------- 1.1 库表元数据（依据 gkx_ldm.sql） ---------- */
  function f(name, label, type, required, unit, desc) {
    return { name: name, label: label, type: type, required: required, unit: unit, desc: desc };
  }

  var SCHEMA_TABLES = [
    {
      key: "ldm_material_2d",
      table: "ldm_material_2d",
      name: "二维材料主体表",
      kind: "core",
      kindLabel: "核心业务表",
      volume: 3825,
      updated: "2026-07-28",
      primaryKey: "id（唯一索引 uk_ldm_2d_material：tenant_id + material_id）",
      datasets: "全部八个特征数据集（材料主体）",
      related: ["ldm_material_2d_structure", "ldm_material_2d_property", "ldm_material_file_asset"],
      note: "以材料为主体记录业务标识、化学式、元素组成，以及数据等级、质量等级、敏感度等级等管理与溯源属性；结构与性质数据通过 material_id 关联。",
      fields: [
        f("id", "主键ID", "bigint", "是", "—", "自增主键，逻辑唯一标识，业务侧不直接暴露"),
        f("material_id", "材料业务标识", "varchar(32)", "是", "—", "材料唯一业务编号，如 TD2026001；与 tenant_id 组成唯一索引"),
        f("name", "材料名称", "varchar(255)", "否", "—", "材料名称，如「二硫化钼（2H 相）单层」"),
        f("formula", "化学式", "varchar(64)", "是", "—", "各元素原子组成比例，如 MoS2"),
        f("element_composition", "元素组成", "varchar(255)", "否", "at%", "元素种类及原子百分比，如 Mo:33.3at%、S:66.7at%"),
        f("source_type", "来源类型", "varchar(32)", "是", "—", "第一性原理计算 / 文献数据 / 实验测试 / 外部数据库导入"),
        f("source_detail", "来源详情", "varchar(128)", "否", "—", "来源说明，如文献 DOI、外部数据库名称"),
        f("producer", "生产者", "varchar(64)", "否", "—", "数据生产 / 提供单位"),
        f("production_date", "生产时间", "datetime", "否", "—", "数据生产时间"),
        f("data_level", "数据等级", "varchar(16)", "否", "—", "数据成熟度等级，如 L1~L5"),
        f("quality_grade", "质量等级", "varchar(16)", "否", "—", "数据质量评级，如 A 级 / B 级"),
        f("sec_level", "敏感度等级", "varchar(16)", "否", "—", "公开 / 内部 / 受限"),
        f("result_version", "结果版本", "varchar(64)", "否", "—", "结果版本号，如 V2026.07，用于数据追溯"),
        f("tenant_id", "租户编号", "varchar(20)", "是", "—", "多租户隔离标识，默认 000000"),
        f("create_dept", "创建部门", "bigint", "否", "—", "数据创建部门"),
        f("create_by", "创建者", "bigint", "否", "—", "创建人"),
        f("create_time", "创建时间", "datetime", "否", "—", "本系统创建时间"),
        f("update_by", "更新者", "bigint", "否", "—", "最后更新人"),
        f("update_time", "更新时间", "datetime", "否", "—", "本系统最后更新时间"),
        f("del_flag", "删除标志", "char(1)", "是", "—", "逻辑删除标记（0 存在 / 1 删除）")
      ],
      sampleFields: ["material_id", "name", "formula", "element_composition", "source_type", "producer", "data_level", "quality_grade", "sec_level", "result_version"],
      samples: [
        { material_id: "TD2026001", name: "二硫化钼（2H 相）单层", formula: "MoS2", element_composition: "Mo:33.3at%、S:66.7at%", source_type: "第一性原理计算", producer: "低维材料主题库", data_level: "L3", quality_grade: "A 级", sec_level: "公开", result_version: "V2026.07" },
        { material_id: "TD2026002", name: "石墨烯单层", formula: "C", element_composition: "C:100.0at%", source_type: "文献数据", producer: "低维材料主题库", data_level: "L3", quality_grade: "A 级", sec_level: "公开", result_version: "V2026.07" },
        { material_id: "TD2026003", name: "六方氮化硼单层", formula: "BN", element_composition: "B:50.0at%、N:50.0at%", source_type: "第一性原理计算", producer: "低维材料主题库", data_level: "L3", quality_grade: "A 级", sec_level: "公开", result_version: "V2026.07" },
        { material_id: "TD2026004", name: "硒化铟单层", formula: "In2Se3", element_composition: "In:40.0at%、Se:60.0at%", source_type: "第一性原理计算", producer: "低维材料主题库", data_level: "L2", quality_grade: "A 级", sec_level: "公开", result_version: "V2026.07" },
        { material_id: "TD2026005", name: "羟基氧化铬单层", formula: "CrOOH", element_composition: "Cr:20.0at%、O:40.0at%、H:20.0at%", source_type: "第一性原理计算", producer: "低维材料主题库", data_level: "L2", quality_grade: "B 级", sec_level: "内部", result_version: "V2026.07" },
        { material_id: "TD2026006", name: "碳化铌单层（MXene）", formula: "Nb2C", element_composition: "Nb:66.7at%、C:33.3at%", source_type: "实验测试", producer: "外部合作单位", data_level: "L2", quality_grade: "B 级", sec_level: "受限", result_version: "V2026.06" }
      ]
    },
    {
      key: "ldm_material_2d_structure",
      table: "ldm_material_2d_structure",
      name: "二维材料结构表",
      kind: "core",
      kindLabel: "核心业务表",
      volume: 9460,
      updated: "2026-07-27",
      primaryKey: "id（索引 idx_ldm_2d_structure_material：tenant_id + material_id + structure_type）",
      datasets: "结构特征数据集",
      related: ["ldm_material_2d", "ldm_material_2d_property", "ldm_material_file_asset"],
      note: "承载结构的几何与晶体学描述：层数、层厚、晶格常数与夹角、晶系、空间群、原子坐标与键长键角；结构模型文件（CIF / XYZ / POSCAR）与预览图通过 *_file_id 关联。",
      fields: [
        f("id", "主键ID", "bigint", "是", "—", "自增主键"),
        f("material_id", "二维材料主体逻辑ID", "bigint", "是", "—", "关联 ldm_material_2d.id"),
        f("structure_type", "结构类型", "varchar(32)", "是", "—", "单层 / 多层 / 异质结 / 缺陷超胞"),
        f("layer_count", "层数", "int", "否", "层", "材料原子层数，单层记为 1"),
        f("layer_thickness", "层厚", "decimal(12,5)", "否", "Å", "最上层与最下层原子间的垂直距离"),
        f("lattice_a", "晶格a", "decimal(12,5)", "否", "Å", "晶胞基矢 a 长度"),
        f("lattice_b", "晶格b", "decimal(12,5)", "否", "Å", "晶胞基矢 b 长度"),
        f("lattice_c", "晶格c", "decimal(12,5)", "否", "Å", "晶胞基矢 c 长度（含真空层）"),
        f("angle_alpha", "α 角", "decimal(8,4)", "否", "°", "基矢 b 与 c 的夹角"),
        f("angle_beta", "β 角", "decimal(8,4)", "否", "°", "基矢 a 与 c 的夹角"),
        f("angle_gamma", "γ 角", "decimal(8,4)", "否", "°", "基矢 a 与 b 的夹角"),
        f("crystal_system", "晶系", "varchar(32)", "否", "—", "立方 / 六方 / 四方 / 三方 / 正交 / 单斜 / 三斜 共七类"),
        f("space_group", "空间群", "varchar(64)", "否", "—", "二维晶体共有 17 种空间群，如 P-6m2"),
        f("atomic_coordinates", "原子坐标", "json", "否", "—", "晶胞内各原子坐标数组"),
        f("coordinate_type", "坐标类型", "varchar(16)", "否", "—", "分数坐标 / 笛卡尔坐标"),
        f("bond_data", "键数据", "json", "否", "Å", "键长数据，含成键原子对与距离"),
        f("angle_data", "角数据", "json", "否", "°", "键角数据，含顶点原子与角度值"),
        f("structure_file_id", "结构文件逻辑ID", "bigint", "否", "—", "关联材料文件资产表中的结构文件（CIF / XYZ / POSCAR）"),
        f("preview_file_id", "预览文件逻辑ID", "bigint", "否", "—", "原子结构图预览文件"),
        f("structure_version", "结构版本", "varchar(64)", "否", "—", "结构版本标识，区分结构优化前后版本"),
        f("tenant_id", "租户编号", "varchar(20)", "是", "—", "多租户隔离标识，默认 000000"),
        f("create_time", "创建时间", "datetime", "否", "—", "本系统创建时间"),
        f("update_time", "更新时间", "datetime", "否", "—", "本系统最后更新时间"),
        f("del_flag", "删除标志", "char(1)", "是", "—", "逻辑删除标记（0 存在 / 1 删除）")
      ],
      sampleFields: ["material_id", "structure_type", "layer_count", "layer_thickness", "lattice_a", "lattice_b", "lattice_c", "angle_alpha", "angle_beta", "angle_gamma", "crystal_system", "space_group", "coordinate_type"],
      samples: [
        { material_id: "TD2026001", structure_type: "单层", layer_count: 1, layer_thickness: 3.13, lattice_a: 3.17, lattice_b: 3.17, lattice_c: 20.00, angle_alpha: 90, angle_beta: 90, angle_gamma: 120, crystal_system: "六方晶系", space_group: "P-6m2", coordinate_type: "分数坐标" },
        { material_id: "TD2026002", structure_type: "单层", layer_count: 1, layer_thickness: 0.34, lattice_a: 2.46, lattice_b: 2.46, lattice_c: 18.00, angle_alpha: 90, angle_beta: 90, angle_gamma: 120, crystal_system: "六方晶系", space_group: "P6/mmm", coordinate_type: "分数坐标" },
        { material_id: "TD2026003", structure_type: "单层", layer_count: 1, layer_thickness: 3.33, lattice_a: 2.51, lattice_b: 2.51, lattice_c: 20.10, angle_alpha: 90, angle_beta: 90, angle_gamma: 120, crystal_system: "六方晶系", space_group: "P6₃/mmc", coordinate_type: "分数坐标" },
        { material_id: "TD2026004", structure_type: "单层", layer_count: 1, layer_thickness: 6.60, lattice_a: 4.05, lattice_b: 4.05, lattice_c: 19.60, angle_alpha: 90, angle_beta: 90, angle_gamma: 120, crystal_system: "六方晶系", space_group: "P6₃/mmc", coordinate_type: "分数坐标" },
        { material_id: "TD2026005", structure_type: "单层", layer_count: 1, layer_thickness: 2.86, lattice_a: 3.02, lattice_b: 3.02, lattice_c: 13.40, angle_alpha: 90, angle_beta: 90, angle_gamma: 120, crystal_system: "三方晶系", space_group: "P-3m1", coordinate_type: "分数坐标" },
        { material_id: "TD2026006", structure_type: "多层", layer_count: 3, layer_thickness: 5.90, lattice_a: 3.12, lattice_b: 3.12, lattice_c: 14.80, angle_alpha: 90, angle_beta: 90, angle_gamma: 120, crystal_system: "六方晶系", space_group: "P6₃/mmc", coordinate_type: "分数坐标" }
      ]
    },
    {
      key: "ldm_material_2d_property",
      table: "ldm_material_2d_property",
      name: "二维材料性质结果表",
      kind: "core",
      kindLabel: "核心业务表",
      volume: 21640,
      updated: "2026-07-28",
      primaryKey: "id（索引 idx_ldm_2d_property_material：tenant_id + material_id + property_group + property_code）",
      datasets: "电子 / 电学 / 磁学 / 热学 / 力学 / 光学 / 缺陷性质数据集",
      related: ["ldm_material_2d", "ldm_material_2d_structure", "ldm_material_file_asset"],
      note: "键值化存储七大性质分组的结果值（数值 / 文本 / 曲线矩阵），并保留单位、计算方法、泛函、软件版本与计算条件，保证结果可追溯；原始 DAT 数据与图谱预览通过 *_file_id 关联。",
      fields: [
        f("id", "主键ID", "bigint", "是", "—", "自增主键"),
        f("material_id", "二维材料主体逻辑ID", "bigint", "是", "—", "关联 ldm_material_2d.id"),
        f("structure_id", "结构逻辑ID", "bigint", "否", "—", "关联 ldm_material_2d_structure.id，指明性质所属结构版本"),
        f("property_group", "性质分组", "varchar(32)", "是", "—", "电子 / 电学 / 磁学 / 热学 / 力学 / 光学 / 缺陷"),
        f("property_code", "性质编码", "varchar(64)", "是", "—", "如 BAND_GAP、EFFECTIVE_MASS、FORMATION_ENERGY"),
        f("value_num", "数值", "decimal(30,12)", "否", "依性质而定", "数值型结果"),
        f("value_text", "文本值", "varchar(500)", "否", "—", "文本型结果"),
        f("value_json", "数组/曲线/矩阵", "json", "否", "—", "曲线或矩阵型结果，如能带曲线、声子谱"),
        f("unit", "单位", "varchar(64)", "否", "—", "如 eV、K、N/m、cm⁻¹、C/m²"),
        f("data_file_id", "结果文件逻辑ID", "bigint", "否", "—", "原始计算结果 DAT 文件"),
        f("preview_file_id", "预览文件逻辑ID", "bigint", "否", "—", "图谱预览文件（JPG / PNG / TIFF，300 dpi）"),
        f("calc_method", "计算方法", "varchar(64)", "否", "—", "如 DFT"),
        f("calc_software_version", "计算软件版本", "varchar(64)", "否", "—", "如 VASP 6.3.2"),
        f("functional", "泛函", "varchar(32)", "否", "—", "如 GGA-PBE"),
        f("condition_json", "计算条件", "json", "否", "—", "截断能、K 点、真空层、力收敛判据等"),
        f("source_type", "来源类型", "varchar(32)", "否", "—", "计算 / 文献 / 实验"),
        f("result_version", "结果版本", "varchar(64)", "否", "—", "结果版本号，如 V2026.07"),
        f("tenant_id", "租户编号", "varchar(20)", "是", "—", "多租户隔离标识，默认 000000"),
        f("create_time", "创建时间", "datetime", "否", "—", "本系统创建时间"),
        f("update_time", "更新时间", "datetime", "否", "—", "本系统最后更新时间"),
        f("del_flag", "删除标志", "char(1)", "是", "—", "逻辑删除标记（0 存在 / 1 删除）")
      ],
      sampleFields: ["material_id", "property_group", "property_code", "value_num", "value_text", "unit", "functional", "calc_method", "source_type", "result_version"],
      samples: [
        { material_id: "TD2026001", property_group: "电子", property_code: "BAND_GAP", value_num: 1.82, value_text: "K 点直接带隙", unit: "eV", functional: "GGA-PBE", calc_method: "DFT", source_type: "计算", result_version: "V2026.07" },
        { material_id: "TD2026001", property_group: "电学", property_code: "PIEZO_COEFFICIENT_D11", value_num: 3.65, value_text: "d11 压电系数", unit: "pm/V", functional: "GGA-PBE", calc_method: "DFT", source_type: "计算", result_version: "V2026.07" },
        { material_id: "TD2026005", property_group: "磁学", property_code: "CURIE_TEMPERATURE", value_num: null, value_text: "待补充（工单 QC-2026-0007）", unit: "K", functional: "GGA-PBE", calc_method: "DFT+U", source_type: "计算", result_version: "V2026.07" },
        { material_id: "TD2026001", property_group: "热学", property_code: "FORMATION_ENERGY", value_num: -1.24, value_text: "单原子形成能", unit: "eV/atom", functional: "GGA-PBE", calc_method: "DFT", source_type: "计算", result_version: "V2026.07" },
        { material_id: "TD2026002", property_group: "力学", property_code: "YOUNG_MODULUS", value_num: 342, value_text: "面内杨氏模量", unit: "N/m", functional: "GGA-PBE", calc_method: "DFT", source_type: "计算", result_version: "V2026.07" },
        { material_id: "TD2026001", property_group: "光学", property_code: "ABSORPTION_COEFFICIENT", value_num: 820000, value_text: "可见光区吸收峰值", unit: "cm⁻¹", functional: "GGA-PBE", calc_method: "DFT", source_type: "计算", result_version: "V2026.07" },
        { material_id: "TD2026001", property_group: "缺陷", property_code: "VACANCY_FORMATION_ENERGY", value_num: 1.72, value_text: "S 空位形成能", unit: "eV", functional: "GGA-PBE", calc_method: "DFT", source_type: "计算", result_version: "V2026.07" },
        { material_id: "TD2026006", property_group: "热学", property_code: "PHONON_DOS", value_num: null, value_text: "Nb2C_phonon_dos.dat；3 声学支 + 6 光学支", unit: "—", functional: "GGA-PBE", calc_method: "DFT", source_type: "计算", result_version: "V2026.07" }
      ]
    },
    {
      key: "ldm_material_file_asset",
      table: "ldm_material_file_asset",
      name: "材料文件资产表",
      kind: "support",
      kindLabel: "支撑表",
      volume: 24612,
      updated: "2026-07-26",
      primaryKey: "id（索引 idx_ldm_material_file_asset_material：tenant_id + material_type + material_table + material_id）",
      datasets: "全部特征数据集（结构模型 / 结果数据 / 图谱文件）",
      related: ["ldm_material_2d", "ldm_material_2d_structure", "ldm_material_2d_property"],
      note: "统一管理材料的物理文件资产，按材料类型 + 镜像表 + 业务标识定位，记录文件类型、OSS 编号与是否当前可用，支撑文件格式转换与下载。",
      fields: [
        f("id", "主键ID", "bigint", "是", "—", "自增主键"),
        f("material_type", "材料类型", "varchar(32)", "是", "—", "二维材料为 TWO_D_MATERIAL"),
        f("material_table", "材料镜像表", "varchar(64)", "是", "—", "如 ldm_material_2d"),
        f("material_id", "材料业务标识", "varchar(64)", "是", "—", "材料唯一业务编号"),
        f("file_type", "文件类型", "varchar(64)", "是", "—", "CIF / XYZ / POSCAR / DAT / JPG / PNG / TIFF / CSV / JSON"),
        f("oss_id", "文件OSS ID", "bigint", "否", "—", "对象存储文件编号"),
        f("legacy_path_snapshot", "历史路径快照", "varchar(1024)", "否", "—", "迁移前历史路径记录，便于数据回溯"),
        f("active_flag", "是否当前可用", "char(1)", "是", "—", "Y 可用 / N 已下线"),
        f("tenant_id", "租户编号", "varchar(20)", "是", "—", "多租户隔离标识，默认 000000"),
        f("create_dept", "创建部门", "bigint", "否", "—", "创建部门"),
        f("create_by", "创建者", "bigint", "否", "—", "创建人"),
        f("create_time", "创建时间", "datetime", "否", "—", "本系统创建时间"),
        f("update_by", "更新者", "bigint", "否", "—", "最后更新人"),
        f("update_time", "更新时间", "datetime", "否", "—", "本系统最后更新时间"),
        f("del_flag", "删除标志", "char(1)", "是", "—", "逻辑删除标记（0 存在 / 1 删除）")
      ],
      sampleFields: ["material_type", "material_table", "material_id", "file_type", "oss_id", "active_flag", "create_time"],
      samples: [
        { material_type: "TWO_D_MATERIAL", material_table: "ldm_material_2d_structure", material_id: "TD2026001", file_type: "CIF", oss_id: 10021, active_flag: "Y", create_time: "2026-07-27 10:12:04" },
        { material_type: "TWO_D_MATERIAL", material_table: "ldm_material_2d_structure", material_id: "TD2026001", file_type: "JPG", oss_id: 10022, active_flag: "Y", create_time: "2026-07-27 10:12:11" },
        { material_type: "TWO_D_MATERIAL", material_table: "ldm_material_2d_property", material_id: "TD2026001", file_type: "DAT", oss_id: 10035, active_flag: "Y", create_time: "2026-07-28 09:41:22" },
        { material_type: "TWO_D_MATERIAL", material_table: "ldm_material_2d_property", material_id: "TD2026002", file_type: "DAT", oss_id: 10041, active_flag: "Y", create_time: "2026-07-28 09:52:38" },
        { material_type: "TWO_D_MATERIAL", material_table: "ldm_material_2d_property", material_id: "TD2026002", file_type: "PNG", oss_id: 10042, active_flag: "N", create_time: "2026-06-30 15:03:57" },
        { material_type: "TWO_D_MATERIAL", material_table: "ldm_material_2d", material_id: "TD2026006", file_type: "CSV", oss_id: 10088, active_flag: "Y", create_time: "2026-07-26 17:24:09" }
      ]
    },
    {
      key: "ldm_file_conversion_task",
      table: "ldm_file_conversion_task",
      name: "文件格式转换任务表",
      kind: "support",
      kindLabel: "支撑表",
      volume: 1268,
      updated: "2026-07-25",
      primaryKey: "id（唯一索引 uk_ldm_conversion_no：conversion_no）",
      datasets: "支撑「文件格式转换」功能",
      related: ["ldm_material_file_asset", "ldm_file_conversion_capability"],
      note: "记录结构模型文件与研究数据的格式转换任务（如 CIF → POSCAR），包含任务状态、进度、输出文件与错误信息。",
      fields: [
        f("id", "主键ID", "bigint", "是", "—", "自增主键"),
        f("conversion_no", "转换任务号", "varchar(64)", "是", "—", "任务唯一编号"),
        f("material_type", "材料类型", "varchar(32)", "是", "—", "TWO_D_MATERIAL / ML_FORCE_FIELD"),
        f("source_file_id", "源文件逻辑ID", "bigint", "是", "—", "关联材料文件资产表源文件"),
        f("source_format", "源格式", "varchar(32)", "是", "—", "如 CIF"),
        f("target_format", "目标格式", "varchar(32)", "是", "—", "如 POSCAR"),
        f("train_ratio", "训练集比例", "decimal(6,5)", "否", "—", "力场数据集拆分时使用"),
        f("test_ratio", "测试集比例", "decimal(6,5)", "否", "—", "力场数据集拆分时使用"),
        f("random_seed", "随机种子", "int", "否", "—", "拆分随机种子"),
        f("include_energy", "是否包含能量", "char(1)", "否", "—", "Y / N"),
        f("include_forces", "是否包含受力", "char(1)", "否", "—", "Y / N"),
        f("include_stress", "是否包含应力", "char(1)", "否", "—", "Y / N"),
        f("status", "任务状态", "varchar(20)", "是", "—", "排队中 / 进行中 / 成功 / 失败"),
        f("progress", "进度", "int", "是", "%", "0~100"),
        f("output_file_id", "输出文件逻辑ID", "bigint", "否", "—", "转换结果文件"),
        f("summary_json", "转换摘要", "json", "否", "—", "条目数、跳过条数等统计"),
        f("error_code", "错误码", "varchar(64)", "否", "—", "失败任务错误码"),
        f("error_message", "错误信息", "varchar(500)", "否", "—", "失败原因描述"),
        f("submitted_by", "提交人", "bigint", "否", "—", "任务提交人"),
        f("submitted_time", "提交时间", "datetime", "是", "—", "任务提交时间"),
        f("started_time", "开始时间", "datetime", "否", "—", "任务开始执行时间"),
        f("finished_time", "完成时间", "datetime", "否", "—", "任务结束时间"),
        f("tenant_id", "租户编号", "varchar(20)", "是", "—", "多租户隔离标识，默认 000000"),
        f("create_time", "创建时间", "datetime", "否", "—", "本系统创建时间"),
        f("update_time", "更新时间", "datetime", "否", "—", "本系统最后更新时间"),
        f("del_flag", "删除标志", "char(1)", "是", "—", "逻辑删除标记（0 存在 / 1 删除）")
      ],
      sampleFields: ["conversion_no", "material_type", "source_format", "target_format", "status", "progress", "output_file_id", "submitted_time"],
      samples: [
        { conversion_no: "CV20260725-0001", material_type: "TWO_D_MATERIAL", source_format: "CIF", target_format: "POSCAR", status: "成功", progress: 100, output_file_id: 20011, submitted_time: "2026-07-25 09:12:33" },
        { conversion_no: "CV20260725-0002", material_type: "TWO_D_MATERIAL", source_format: "XYZ", target_format: "CIF", status: "成功", progress: 100, output_file_id: 20014, submitted_time: "2026-07-25 10:48:02" },
        { conversion_no: "CV20260725-0003", material_type: "TWO_D_MATERIAL", source_format: "DAT", target_format: "CSV", status: "失败", progress: 62, output_file_id: null, submitted_time: "2026-07-25 14:20:41" },
        { conversion_no: "CV20260726-0004", material_type: "TWO_D_MATERIAL", source_format: "CIF", target_format: "XYZ", status: "成功", progress: 100, output_file_id: 20027, submitted_time: "2026-07-26 08:35:19" },
        { conversion_no: "CV20260726-0005", material_type: "ML_FORCE_FIELD", source_format: "XYZ", target_format: "HDF5", status: "进行中", progress: 45, output_file_id: null, submitted_time: "2026-07-26 16:02:55" }
      ]
    },
    {
      key: "ldm_file_conversion_capability",
      table: "ldm_file_conversion_capability",
      name: "文件转换能力矩阵表",
      kind: "support",
      kindLabel: "支撑表",
      volume: 42,
      updated: "2026-07-20",
      primaryKey: "id（唯一索引 uk_ldm_file_conversion_capability：app_code + material_type + material_table + conversion_type + source_format + target_format）",
      datasets: "支撑「文件格式转换」功能的能力配置",
      related: ["ldm_file_conversion_task"],
      note: "配置「材料类型 / 镜像表 / 转换类型」维度下允许的格式互转关系、单文件大小上限与启用状态，前端据此渲染可转换的目标格式。",
      fields: [
        f("id", "主键ID", "bigint", "是", "—", "自增主键"),
        f("app_code", "应用编码", "varchar(32)", "是", "—", "默认 ldm"),
        f("material_type", "材料类型", "varchar(32)", "是", "—", "如 TWO_D_MATERIAL"),
        f("material_table", "材料镜像表", "varchar(64)", "否", "—", "空表示材料类型通用"),
        f("conversion_type", "转换类型", "varchar(32)", "是", "—", "结构模型互转 / 研究数据导出"),
        f("source_format", "源格式", "varchar(32)", "是", "—", "如 CIF"),
        f("target_format", "目标格式", "varchar(32)", "是", "—", "如 POSCAR"),
        f("max_size_mb", "最大文件大小", "int", "是", "MB", "单文件大小上限，默认 50"),
        f("enabled", "是否启用", "char(1)", "是", "—", "Y 启用 / N 停用"),
        f("sort_order", "展示排序", "int", "是", "—", "前端下拉展示顺序"),
        f("remark", "说明", "varchar(500)", "否", "—", "能力说明备注"),
        f("tenant_id", "租户编号", "varchar(20)", "是", "—", "多租户隔离标识，默认 000000"),
        f("create_dept", "创建部门", "bigint", "否", "—", "创建部门"),
        f("create_by", "创建者", "bigint", "否", "—", "创建人"),
        f("create_time", "创建时间", "datetime", "否", "—", "本系统创建时间"),
        f("update_by", "更新者", "bigint", "否", "—", "最后更新人"),
        f("update_time", "更新时间", "datetime", "否", "—", "本系统最后更新时间"),
        f("del_flag", "删除标志", "char(1)", "是", "—", "逻辑删除标记（0 存在 / 1 删除）")
      ],
      sampleFields: ["app_code", "material_type", "material_table", "conversion_type", "source_format", "target_format", "max_size_mb", "enabled"],
      samples: [
        { app_code: "ldm", material_type: "TWO_D_MATERIAL", material_table: "ldm_material_2d_structure", conversion_type: "结构模型互转", source_format: "CIF", target_format: "POSCAR", max_size_mb: 50, enabled: "Y" },
        { app_code: "ldm", material_type: "TWO_D_MATERIAL", material_table: "ldm_material_2d_structure", conversion_type: "结构模型互转", source_format: "CIF", target_format: "XYZ", max_size_mb: 50, enabled: "Y" },
        { app_code: "ldm", material_type: "TWO_D_MATERIAL", material_table: "", conversion_type: "研究数据导出", source_format: "DAT", target_format: "CSV", max_size_mb: 100, enabled: "Y" },
        { app_code: "ldm", material_type: "TWO_D_MATERIAL", material_table: "", conversion_type: "研究数据导出", source_format: "JSON", target_format: "CSV", max_size_mb: 100, enabled: "Y" },
        { app_code: "ldm", material_type: "ML_FORCE_FIELD", material_table: "", conversion_type: "研究数据导出", source_format: "XYZ", target_format: "HDF5", max_size_mb: 200, enabled: "N" }
      ]
    }
  ];

  function getTableMeta(key) {
    for (var i = 0; i < SCHEMA_TABLES.length; i += 1) if (SCHEMA_TABLES[i].key === key) return SCHEMA_TABLES[i];
    return SCHEMA_TABLES[0];
  }

  var SCHEMA_TOTAL_BUSINESS = (function () {
    var total = 0;
    SCHEMA_TABLES.forEach(function (t) { if (t.kind === "core") total += t.volume; });
    return total;
  })();
  var SCHEMA_TOTAL_FIELDS = (function () {
    var total = 0;
    SCHEMA_TABLES.forEach(function (t) { total += t.fields.length; });
    return total;
  })();

  /* ---------- 1.2 数据集字段覆盖核对：招标/需规要求 ↔ 业务数据集字段 ↔ 库表溯源字段 ---------- */
  var FIELD_AUDIT = [
    { key: "structure", required: ["原子结构图", "化学式", "晶胞参数", "层厚", "原子坐标", "键长键角", "晶系", "空间群"], tables: ["ldm_material_2d", "ldm_material_2d_structure"], trace: ["材料名称", "元素组成", "层数", "来源类型", "质量等级", "敏感度等级", "坐标类型", "结构版本"] },
    { key: "electronic", required: ["能带结构", "态密度", "有效质量"], tables: ["ldm_material_2d", "ldm_material_2d_property"], trace: ["单位", "计算方法", "泛函", "计算条件", "来源类型", "结果版本"] },
    { key: "electrical", required: ["铁电性质", "压电性质"], tables: ["ldm_material_2d", "ldm_material_2d_property"], trace: ["单位", "计算方法", "泛函", "计算条件", "来源类型", "结果版本"] },
    { key: "magnetic", required: ["磁基态构型", "磁转变温度"], tables: ["ldm_material_2d", "ldm_material_2d_property"], trace: ["单位", "计算方法", "泛函", "计算条件", "来源类型", "结果版本"] },
    { key: "thermal", required: ["形成能", "声子谱", "声子态密度"], tables: ["ldm_material_2d", "ldm_material_2d_property"], trace: ["单位", "计算方法", "泛函", "计算条件", "来源类型", "结果版本"] },
    { key: "mechanical", required: ["弹性常数", "杨氏模量", "泊松比"], tables: ["ldm_material_2d", "ldm_material_2d_property"], trace: ["单位", "计算方法", "泛函", "计算条件", "来源类型", "结果版本"] },
    { key: "optical", required: ["介电函数", "光吸收系数", "反射率", "折射率", "消光系数"], tables: ["ldm_material_2d", "ldm_material_2d_property"], trace: ["单位", "计算方法", "泛函", "计算条件", "来源类型", "结果版本"] },
    { key: "defect", required: ["空位缺陷", "反位缺陷"], tables: ["ldm_material_2d", "ldm_material_2d_property"], trace: ["单位", "计算方法", "泛函", "计算条件", "来源类型", "结果版本"] }
  ];

  /* 依据标准 R03 整理的计算与测试条件 */
  var CALC_CONDITIONS = [
    { label: "计算软件", value: "VASP" },
    { label: "交换关联泛函", value: "GGA-PBE" },
    { label: "截断能", value: "500 eV" },
    { label: "真空层厚度", value: "15 Å" },
    { label: "力收敛判据", value: "0.01 eV/Å" },
    { label: "色散校正", value: "DFT-D3" },
    { label: "结构模型格式", value: "XYZ / CIF / POSCAR" },
    { label: "图谱格式", value: "JPG / PNG / TIFF（300 dpi）" }
  ];

  function getDatasetTypes() {
    /* 字段定义沿用既有 TWOD_DATABASE_DATASET_TABS，保证与列表字段口径一致 */
    var tabs = (typeof TWOD_DATABASE_DATASET_TABS !== "undefined" && TWOD_DATABASE_DATASET_TABS) || [];
    return tabs.map(function (tab) {
      return {
        key: tab.key,
        title: tab.label,
        fields: tab.fields || [],
        samples: DATASET_SAMPLES[tab.key] || []
      };
    });
  }

  function getDatasetType(key) {
    var list = getDatasetTypes();
    for (var i = 0; i < list.length; i += 1) if (list[i].key === key) return list[i];
    return list[0];
  }

  function getOverviewMeta(key) {
    try {
      var cfg = (typeof LOWDIM_DB_OVERVIEW_CONFIGS !== "undefined" ? LOWDIM_DB_OVERVIEW_CONFIGS : {})[PAGE_ID];
      var list = (cfg && cfg.datasets) || [];
      for (var i = 0; i < list.length; i += 1) if (list[i].key === key) return list[i];
    } catch (e) { /* ignore */ }
    return null;
  }

  function getOverviewConfig() {
    try {
      return (typeof LOWDIM_DB_OVERVIEW_CONFIGS !== "undefined" ? LOWDIM_DB_OVERVIEW_CONFIGS : {})[PAGE_ID] || null;
    } catch (e) {
      return null;
    }
  }

  function getState() {
    if (typeof state === "undefined") return {};
    var s = state.twodDatasetType;
    if (!s) s = state.twodDatasetType = {};
    if (!s.type) s.type = "structure";
    if (!s.view) s.view = "list";
    if (s.focusIndex === undefined) s.focusIndex = "";
    if (!s.tableKey) s.tableKey = "ldm_material_2d";
    return s;
  }

  function fmtNum(v) {
    return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function toCsv(headers, rows) {
    var lines = [headers.join(",")];
    rows.forEach(function (row) {
      lines.push(row.map(function (cell) {
        return '"' + String(cell == null ? "" : cell).replace(/"/g, '""') + '"';
      }).join(","));
    });
    return "\ufeff" + lines.join("\r\n");
  }

  function downloadFile(fileName, content) {
    try {
      var blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ---------- 2. 样式（唯一 id，全量选择器限定到本页） ---------- */
  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "#page-lowdim-database-twod.twod-ds-active { display:block; width:100%; min-width:0; padding:0 !important; border:0 !important; border-radius:0 !important; background:#f3f7fd !important; box-shadow:none !important; overflow:visible !important; }",
      "#page-lowdim-database-twod .twod-ds-page { color:#4e6687; font-family:inherit; }",
      "#page-lowdim-database-twod .twod-ds-breadcrumb { display:none; }",
      "#page-lowdim-database-twod .twod-ds-head { display:flex; align-items:flex-end; justify-content:space-between; gap:18px; flex-wrap:wrap; padding:22px 28px 18px; }",
      "#page-lowdim-database-twod .twod-ds-head h2 { margin:0 0 8px; color:#082b82; font-size:29px; line-height:1.25; }",
      "#page-lowdim-database-twod .twod-ds-head p { margin:0; max-width:760px; color:#5e7391; font-size:15px; line-height:1.7; }",
      "#page-lowdim-database-twod .twod-ds-head-stats { display:flex; gap:12px; flex-wrap:wrap; }",
      "#page-lowdim-database-twod .twod-ds-head-stats div { min-width:132px; padding:12px 15px; border:1px solid #dbe6f4; border-radius:9px; background:#fff; }",
      "#page-lowdim-database-twod .twod-ds-head-stats span { display:block; margin-bottom:5px; color:#8ba0bb; font-size:13px; }",
      "#page-lowdim-database-twod .twod-ds-head-stats strong { color:#2a4265; font-size:17px; }",
      "#page-lowdim-database-twod .twod-ds-tabs { display:inline-flex; gap:4px; padding:4px; border:1px solid #d8e5f5; border-radius:10px; background:#f7fafe; }",
      "#page-lowdim-database-twod .twod-ds-tab { min-height:34px; padding:0 16px; border:0; border-radius:7px; background:transparent; color:#5e7391; font-size:14px; cursor:pointer; }",
      "#page-lowdim-database-twod .twod-ds-tab:hover { color:#2165d0; }",
      "#page-lowdim-database-twod .twod-ds-tab.is-active { background:#fff; color:#165DFF; font-weight:700; box-shadow:0 1px 3px rgba(22,93,255,.14); }",
      "#page-lowdim-database-twod .twod-ds-filter { display:flex; align-items:center; gap:14px; flex-wrap:wrap; margin:0 28px 16px; padding:16px 18px; border:1px solid #d8e5f5; border-radius:12px; background:#fff; }",
      "#page-lowdim-database-twod .twod-ds-filter label { display:inline-flex; align-items:center; gap:10px; color:#3d5678; font-size:15px; font-weight:700; }",
      "#page-lowdim-database-twod .twod-ds-filter select { min-width:220px; height:40px; padding:0 12px; border:1px solid #cbd8eb; border-radius:8px; background:#fff; color:#2a4265; font-size:14px; cursor:pointer; }",
      "#page-lowdim-database-twod .twod-ds-filter .twod-ds-filter-hint { color:#8aa0bc; font-size:13px; }",
      /* 说明：app.css 中有 `section { background: transparent !important }` 与 `[class$="-card"] { border-radius: 12px !important }` 两条全局规则，
         会把本层的 <section class="twod-ds-card"> 打回透明背景。此处复用系统自身的 CSS 变量还原「白色卡片」外观，
         与系统其它模块的 .card / .panel 保持一致；不修改 assets/app.css。 */
      "#page-lowdim-database-twod .twod-ds-card { background: var(--ds-surface, var(--color-bg-component, #fff)) !important; border-radius: var(--ds-radius-lg, 12px) !important; box-shadow: var(--ds-shadow-1, 0 1px 2px rgba(15,23,42,.05)) !important; }",
      "#page-lowdim-database-twod .twod-ds-card { margin:0 28px 26px; border:1px solid #d8e5f5; border-radius:14px; background:#fff; overflow:hidden; }",
      "#page-lowdim-database-twod .twod-ds-card-head { display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; padding:18px 22px 14px; border-bottom:1px solid #e8eef6; }",
      "#page-lowdim-database-twod .twod-ds-card-head h3 { margin:0; color:#1e385d; font-size:20px; }",
      "#page-lowdim-database-twod .twod-ds-card-head p { margin:6px 0 0; color:#7890ad; font-size:14px; }",
      "#page-lowdim-database-twod .twod-ds-card-head .twod-ds-count { color:#5e7391; font-size:14px; }",
      "#page-lowdim-database-twod .twod-ds-card-head-actions { display:flex; gap:8px; }",
      "#page-lowdim-database-twod .twod-ds-layout { display:grid; grid-template-columns:minmax(0,1fr) 352px; gap:18px; align-items:start; padding:0 28px 26px; }",
      "#page-lowdim-database-twod .twod-ds-layout > .twod-ds-card, #page-lowdim-database-twod .twod-ds-layout > aside > .twod-ds-card { margin:0; }",
      "#page-lowdim-database-twod .twod-ds-layout > aside { display:grid; gap:18px; }",
      "#page-lowdim-database-twod .twod-ds-layout-sub { display:grid; gap:18px; }",
      "#page-lowdim-database-twod .twod-ds-table-wrap { overflow-x:auto; }",
      "#page-lowdim-database-twod .twod-ds-table { width:100%; min-width:1180px; border-collapse:separate; border-spacing:0; }",
      "#page-lowdim-database-twod .twod-ds-table.is-narrow { min-width:900px; }",
      "#page-lowdim-database-twod .twod-ds-table th.twod-ds-col-index { width:64px; }",
      "#page-lowdim-database-twod .twod-ds-table th.twod-ds-col-actions { width:210px; }",
      "#page-lowdim-database-twod .twod-ds-table-list th.twod-ds-col-actions { position:sticky; right:0; z-index:2; background:#f4f8fd; box-shadow:-1px 0 0 #e8eef6; }",
      "#page-lowdim-database-twod .twod-ds-table-list td.twod-ds-cell-actions { position:sticky; right:0; z-index:1; background:#fff; box-shadow:-1px 0 0 #e8eef6; }",
      "#page-lowdim-database-twod .twod-ds-table-list tbody tr:hover td.twod-ds-cell-actions { background:#f8fbff; }",
      "#page-lowdim-database-twod .twod-ds-table-list tbody tr.is-focus td.twod-ds-cell-actions { background:#eaf2ff; }",
      "#page-lowdim-database-twod .twod-ds-table th, #page-lowdim-database-twod .twod-ds-table td { padding:12px 14px; border-bottom:1px solid #e8eef6; color:#55708f; font-size:13px; text-align:left; vertical-align:middle; }",
      "#page-lowdim-database-twod .twod-ds-table th { background:#f4f8fd; color:#2d4a70; font-weight:700; white-space:nowrap; }",
      "#page-lowdim-database-twod .twod-ds-table tbody tr:hover { background:#f8fbff; }",
      "#page-lowdim-database-twod .twod-ds-table tbody tr.is-focus { background:#eaf2ff; }",
      "#page-lowdim-database-twod .twod-ds-table td[data-twod-ds-field=\"formula\"], #page-lowdim-database-twod .twod-ds-table td[data-twod-ds-field=\"layerThickness\"], #page-lowdim-database-twod .twod-ds-table td[data-twod-ds-field=\"crystalSystem\"], #page-lowdim-database-twod .twod-ds-table td[data-twod-ds-field=\"spaceGroup\"], #page-lowdim-database-twod .twod-ds-table th { white-space:nowrap !important; }",
      "#page-lowdim-database-twod .twod-ds-table td[data-twod-ds-field=\"desc\"] { min-width:280px; white-space:normal; line-height:1.65; }",
      "#page-lowdim-database-twod .twod-ds-index { color:#8ba0bb; font-weight:700; }",
      "#page-lowdim-database-twod .twod-ds-thumb { display:inline-flex; flex-direction:column; align-items:center; gap:4px; width:78px; padding:0; border:0; background:transparent; cursor:pointer; }",
      "#page-lowdim-database-twod .twod-ds-thumb svg { width:70px; height:48px; }",
      "#page-lowdim-database-twod .twod-ds-thumb span { color:#55708f; font-size:12px; }",
      "#page-lowdim-database-twod .twod-ds-actions { display:flex; gap:8px; white-space:nowrap; }",
      "#page-lowdim-database-twod .twod-ds-actions button { min-height:32px; min-width:78px; padding:0 12px; border-radius:6px; font-size:13px; white-space:nowrap; cursor:pointer; }",
      "#page-lowdim-database-twod .twod-ds-btn-view { border:1px solid #bcd3f4; background:#fff; color:#2165d0; }",
      "#page-lowdim-database-twod .twod-ds-btn-view:hover { background:#eaf2ff; }",
      "#page-lowdim-database-twod .twod-ds-btn-download { border:1px solid #bcd3f4; background:#fff; color:#2165d0; }",
      "#page-lowdim-database-twod .twod-ds-btn-download:hover { background:#eaf2ff; }",
      "#page-lowdim-database-twod .twod-ds-mono { font-family:Consolas,\"Courier New\",monospace; color:#1e385d; font-size:13px; white-space:nowrap; }",
      "#page-lowdim-database-twod .twod-ds-tag { display:inline-block; padding:2px 9px; border-radius:20px; font-size:12px; line-height:1.7; white-space:nowrap; }",
      "#page-lowdim-database-twod .twod-ds-tag-core { border:1px solid #bcd3f4; background:#e8f3ff; color:#165DFF; }",
      "#page-lowdim-database-twod .twod-ds-tag-support { border:1px solid #dfe4ec; background:#f4f6fa; color:#6f8298; }",
      "#page-lowdim-database-twod .twod-ds-tag-ok { border:1px solid #b7e2c8; background:#eaf9f0; color:#1a7f45; }",
      "#page-lowdim-database-twod .twod-ds-tag-miss { border:1px solid #f3c9b7; background:#fdf1eb; color:#c05621; }",
      "#page-lowdim-database-twod .twod-ds-summary { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; padding:18px 22px; border-bottom:1px solid #e8eef6; }",
      "#page-lowdim-database-twod .twod-ds-summary div { padding:13px 15px; border:1px solid #dbe6f4; border-radius:9px; background:#f8fbff; }",
      "#page-lowdim-database-twod .twod-ds-summary span { display:block; margin-bottom:5px; color:#8ba0bb; font-size:13px; }",
      "#page-lowdim-database-twod .twod-ds-summary strong { color:#2a4265; font-size:15px; }",
      "#page-lowdim-database-twod .twod-ds-kv { display:grid; gap:0; padding:6px 22px 20px; }",
      "#page-lowdim-database-twod .twod-ds-kv > div { display:flex; gap:12px; padding:11px 0; border-bottom:1px dashed #e6edf6; }",
      "#page-lowdim-database-twod .twod-ds-kv > div:last-child { border-bottom:0; }",
      "#page-lowdim-database-twod .twod-ds-kv dt, #page-lowdim-database-twod .twod-ds-kv > div > span:first-child { flex:0 0 104px; color:#8ba0bb; font-size:13px; line-height:1.6; }",
      "#page-lowdim-database-twod .twod-ds-kv dd, #page-lowdim-database-twod .twod-ds-kv > div > span:last-child { flex:1; min-width:0; color:#2a4265; font-size:13px; line-height:1.65; word-break:break-all; }",
      "#page-lowdim-database-twod .twod-ds-files { display:grid; gap:10px; padding:18px 22px 22px; }",
      "#page-lowdim-database-twod .twod-ds-files > div { display:flex; align-items:center; gap:12px; padding:14px 16px; border:1px solid #dce7f3; border-radius:8px; background:#f8fbff; }",
      "#page-lowdim-database-twod .twod-ds-files strong { color:#365374; font-size:14px; }",
      "#page-lowdim-database-twod .twod-ds-file-icon { color:#2670da; font-size:18px; }",
      "#page-lowdim-database-twod .twod-ds-file-download { margin-left:auto; padding:6px 13px; border:1px solid #bcd3f4; border-radius:4px; background:#fff; color:#2165d0; font-size:13px; cursor:pointer; }",
      "#page-lowdim-database-twod .twod-ds-back { min-height:38px; padding:0 18px; border:1px solid #cbd8eb; border-radius:8px; background:#fff; color:#3d5678; font-size:14px; cursor:pointer; }",
      "#page-lowdim-database-twod .twod-ds-back:hover { background:#f5f9ff; }",
      "#page-lowdim-database-twod .twod-ds-ghost { min-height:32px; padding:0 14px; border:1px solid #cbd8eb; border-radius:6px; background:#fff; color:#3d5678; font-size:13px; cursor:pointer; }",
      "#page-lowdim-database-twod .twod-ds-ghost:hover { background:#f5f9ff; }",
      "#page-lowdim-database-twod .twod-ds-empty { padding:46px 0; color:#7b8da7; font-size:14px; text-align:center; }",
      "#page-lowdim-database-twod .twod-ds-tip { margin:0 0 14px; padding:12px 16px; border:1px solid #d3dfff; border-radius:8px; background:#e8f3ff; color:#4f6591; font-size:13px; line-height:1.7; }",
      "#page-lowdim-database-twod .twod-ds-note { padding:16px 22px 20px; border-top:1px solid #e8eef6; color:#6f8298; font-size:13px; line-height:1.8; }",
      "#page-lowdim-database-twod .twod-ds-note strong { color:#365374; }",
      "@media (max-width:1440px) { #page-lowdim-database-twod .twod-ds-layout { grid-template-columns:minmax(0,1fr) 320px; } }",
      "@media (max-width:1180px) { #page-lowdim-database-twod .twod-ds-layout { grid-template-columns:1fr; } }",
      "@media (max-width:1280px) { #page-lowdim-database-twod .twod-ds-summary { grid-template-columns:repeat(2,minmax(0,1fr)); } }",
      "@media (max-width:820px) { #page-lowdim-database-twod .twod-ds-breadcrumb, #page-lowdim-database-twod .twod-ds-head { padding-left:16px; padding-right:16px; } #page-lowdim-database-twod .twod-ds-filter, #page-lowdim-database-twod .twod-ds-card { margin-left:16px; margin-right:16px; } #page-lowdim-database-twod .twod-ds-layout { padding-left:16px; padding-right:16px; } #page-lowdim-database-twod .twod-ds-summary { grid-template-columns:1fr; } }"
    ].join("\n");
    document.head.appendChild(style);
  }

  /* ---------- 3. 通用片段 ---------- */
  function renderTabs(active) {
    return '<div class="twod-ds-tabs">'
      + '<button class="twod-ds-tab' + (active === "list" ? " is-active" : "") + '" type="button" data-twod-ds-viewtab="list">数据集视图</button>'
      + '<button class="twod-ds-tab' + (active === "db" ? " is-active" : "") + '" type="button" data-twod-ds-viewtab="db">库表结构视图</button>'
      + '</div>';
  }

  function renderKv(items) {
    return '<div class="twod-ds-kv">'
      + items.map(function (item) {
          return '<div><span>' + esc(item.label) + '</span><span>' + item.value + '</span></div>';
        }).join("")
      + '</div>';
  }

  function resetPageScroll(page) {
    page.scrollTop = 0;
    if (typeof window !== "undefined" && window.scrollTo) window.scrollTo({ top: 0, behavior: "auto" });
  }

  function renderCell(type, row, field) {
    if (field.kind === "image") {
      var label = row[field.key] || row.formula || "二维结构";
      return '<button class="twod-ds-thumb" type="button" title="查看 ' + esc(label) + ' 原子结构图" data-twod-ds-preview="' + esc(label) + '">'
        + (typeof renderTwodAtomicStructureSvg === "function" ? renderTwodAtomicStructureSvg(label, true) : "")
        + '<span>' + esc(label) + '</span></button>';
    }
    return esc(row[field.key] || "/");
  }

  /* ---------- 4. 渲染：数据集列表视图 ---------- */
  function renderList(typeKey) {
    var type = getDatasetType(typeKey);
    var page = document.getElementById("page-" + PAGE_ID);
    if (!page) return;
    ensureStyle();
    page.classList.remove("twod-dataset-detail-active");
    page.classList.add("twod-ds-active");
    var meta = getOverviewMeta(type.key);
    var volume = meta ? meta.volume : type.samples.length;
    var format = meta ? meta.format : "CSV / JSON";
    var status = meta ? meta.status : "已标准化";
    var options = getDatasetTypes().map(function (item) {
      return '<option value="' + esc(item.key) + '"' + (item.key === type.key ? " selected" : "") + '>' + esc(item.title) + '</option>';
    }).join("");
    var head = '<tr><th class="twod-ds-col-index">序号</th>'
      + type.fields.map(function (f) { return '<th>' + esc(f.label) + '</th>'; }).join("")
      + '<th class="twod-ds-col-actions">操作</th></tr>';
    var body = type.samples.length
      ? type.samples.map(function (row, index) {
          return '<tr data-twod-ds-row="' + index + '">'
            + '<td class="twod-ds-index">' + (index + 1) + '</td>'
            + type.fields.map(function (f) { return '<td data-twod-ds-field="' + esc(f.key) + '">' + renderCell(type, row, f) + '</td>'; }).join("")
            + '<td class="twod-ds-cell-actions"><div class="twod-ds-actions">'
            + '<button class="twod-ds-btn-view" type="button" data-twod-ds-viewall="' + index + '">查看全部</button>'
            + '<button class="twod-ds-btn-download" type="button" data-twod-ds-download="' + index + '">下载</button>'
            + '</div></td></tr>';
        }).join("")
      : '<tr><td colspan="' + (type.fields.length + 2) + '"><div class="twod-ds-empty">该数据集暂无样例数据</div></td></tr>';

    page.innerHTML = '<div class="twod-ds-page">'
      + '<div class="twod-ds-breadcrumb">低维材料主题应用　/　低维材料数据库　/　二维材料数据库</div>'
      + '<div class="twod-ds-head"><div><h2>二维材料数据库</h2>'
      + '<p>按数据集类型查看二维材料八大特征数据集的样例数据，支持查看全部样例与单条数据下载。</p></div>'
      + '<div class="twod-ds-head-stats">'
      + '<div><span>数据集类型</span><strong>8 类</strong></div>'
      + '<div><span>当前数据集数据量</span><strong>' + fmtNum(volume) + ' 条</strong></div>'
      + '<div><span>标准化状态</span><strong>' + esc(status) + '</strong></div>'
      + '</div></div>'
      + '<div class="twod-ds-filter"><label>数据集类型<select data-twod-ds-type>' + options + '</select></label>'
      + '<span class="twod-ds-filter-hint">共 8 类特征数据集，默认展示「结构特征数据集」；切换后列表字段随数据集类型变化。</span>'
      + '<div style="margin-left:auto;display:flex;align-items:center;gap:10px;">'
      + renderTabs("list")
      + '<button class="twod-ds-ghost" type="button" data-twod-ds-godb>查看来源库表</button>'
      + '</div></div>'
      + '<section class="twod-ds-card">'
      + '<div class="twod-ds-card-head"><div><h3>' + esc(type.title) + '</h3>'
      + '<p>文件类型 ' + esc(format) + ' · 标准化字段 ' + type.fields.length + ' 项 · 样例展示 ' + type.samples.length + ' 条</p></div>'
      + '<span class="twod-ds-count">共 ' + type.samples.length + ' 条样例数据</span></div>'
      + '<div class="twod-ds-table-wrap"><table class="twod-ds-table twod-ds-table-list"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>'
      + '</section></div>';
    resetPageScroll(page);
  }

  /* ---------- 5. 渲染：查看全部（数据集包样例） ---------- */
  function renderAll(typeKey, focusIndex) {
    var type = getDatasetType(typeKey);
    var page = document.getElementById("page-" + PAGE_ID);
    if (!page) return;
    ensureStyle();
    page.classList.remove("twod-dataset-detail-active");
    page.classList.add("twod-ds-active");
    var meta = getOverviewMeta(type.key);
    var files = [type.key + "_dataset.parquet", type.key + "_sample.csv", type.key + "_metadata.json"];
    var head = '<tr><th class="twod-ds-col-index">序号</th>'
      + type.fields.map(function (f) { return '<th>' + esc(f.label) + '</th>'; }).join("") + '</tr>';
    var body = type.samples.map(function (row, index) {
      return '<tr' + (String(index) === String(focusIndex) ? ' class="is-focus"' : '') + '>'
        + '<td class="twod-ds-index">' + (index + 1) + '</td>'
        + type.fields.map(function (f) { return '<td data-twod-ds-field="' + esc(f.key) + '">' + renderCell(type, row, f) + '</td>'; }).join("") + '</tr>';
    }).join("");

    page.innerHTML = '<div class="twod-ds-page">'
      + '<div class="twod-ds-breadcrumb">低维材料主题应用　/　低维材料数据库　/　二维材料数据库　/　' + esc(type.title) + '</div>'
      + '<div class="twod-ds-head"><div><h2>' + esc(type.title) + '</h2>'
      + '<p>数据集编号 2D-' + esc(String(type.key).toUpperCase()) + ' · 按列表字段展示该数据集包的全部样例数据。</p></div>'
      + '<div class="twod-ds-head-stats">'
      + '<div><span>所属数据库</span><strong>二维材料数据库</strong></div>'
      + '<div><span>数据量</span><strong>' + fmtNum(meta ? meta.volume : type.samples.length) + ' 条</strong></div>'
      + '<div><span>文件类型</span><strong>' + esc(meta ? meta.format : "CSV / JSON") + '</strong></div>'
      + '<div><span>样例条数</span><strong>' + type.samples.length + ' 条</strong></div>'
      + '</div></div>'
      + '<div class="twod-ds-filter">'
      + renderTabs("list")
      + '<div style="margin-left:auto;display:flex;align-items:center;gap:10px;">'
      + '<button class="twod-ds-ghost" type="button" data-twod-ds-godb>查看来源库表</button>'
      + '<button class="twod-ds-back" type="button" data-twod-ds-back>返回数据集列表</button>'
      + '</div></div>'
      + '<section class="twod-ds-card">'
      + '<div class="twod-ds-card-head"><div><h3>数据集包样例数据</h3>'
      + '<p>以下为「' + esc(type.title) + '」按列表字段展示的样例数据，与数据集归档文件字段口径一致。</p></div>'
      + '<span class="twod-ds-count">共 ' + type.samples.length + ' 条</span></div>'
      + '<div class="twod-ds-table-wrap"><table class="twod-ds-table"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>'
      + '</section>'
      + '<section class="twod-ds-card"><div class="twod-ds-card-head"><div><h3>数据集包归档文件</h3>'
      + '<p>标准化数据文件、样例文件与元数据说明文件。</p></div></div><div class="twod-ds-files">'
      + files.map(function (file) {
          return '<div><span class="twod-ds-file-icon">▣</span><strong>' + esc(file) + '</strong>'
            + '<button class="twod-ds-file-download" type="button" data-twod-ds-file="' + esc(file) + '">下载</button></div>';
        }).join("")
      + '</div></section></div>';
    resetPageScroll(page);
  }

  /* ---------- 6. 渲染：数据库层（库表清单 + 信息概览 + 字段核对） ---------- */
  function renderDbLayer() {
    var page = document.getElementById("page-" + PAGE_ID);
    if (!page) return;
    ensureStyle();
    page.classList.remove("twod-dataset-detail-active");
    page.classList.add("twod-ds-active");
    var cfg = getOverviewConfig();

    var coreCount = SCHEMA_TABLES.filter(function (t) { return t.kind === "core"; }).length;
    var supportCount = SCHEMA_TABLES.length - coreCount;

    /* 库表清单 */
    var tableRows = SCHEMA_TABLES.map(function (t, index) {
      return '<tr>'
        + '<td class="twod-ds-index">' + (index + 1) + '</td>'
        + '<td><span class="twod-ds-mono">' + esc(t.table) + '</span></td>'
        + '<td>' + esc(t.name) + '</td>'
        + '<td><span class="twod-ds-tag ' + (t.kind === "core" ? "twod-ds-tag-core" : "twod-ds-tag-support") + '">' + esc(t.kindLabel) + '</span></td>'
        + '<td>' + t.fields.length + ' 个</td>'
        + '<td>' + fmtNum(t.volume) + ' 条</td>'
        + '<td>' + esc(t.datasets) + '</td>'
        + '<td>' + esc(t.updated) + '</td>'
        + '<td><button class="twod-ds-btn-view" type="button" data-twod-ds-table="' + esc(t.key) + '">查看字段</button></td>'
        + '</tr>';
    }).join("");

    /* 信息概览 */
    var overview = renderKv([
      { label: "数据库标识", value: '<span class="twod-ds-mono">gkx_ldm（库名）／ 2D（业务编码）</span>' },
      { label: "数据库名称", value: "二维材料数据库" },
      { label: "关联系统", value: "数据融合中枢　/　科学数据中心　/　低维材料主题库" },
      { label: "核心业务表", value: coreCount + " 张（二维材料主体 / 结构 / 性质结果）" },
      { label: "支撑数据表", value: supportCount + " 张（文件资产 / 转换任务 / 转换能力矩阵）" },
      { label: "物理字段总数", value: fmtNum(SCHEMA_TOTAL_FIELDS) + " 个" },
      { label: "核心表记录数", value: fmtNum(SCHEMA_TOTAL_BUSINESS) + " 条" },
      { label: "数据集口径", value: "八大数据集 30,600 条（满足招标要求不少于 30,600 条）" },
      { label: "标准化状态", value: "已标准化（计算方法 / 软件 / 平台 / 格式 / 单位 / 名词 / 图片 统一）" },
      { label: "最近更新", value: esc(cfg ? cfg.updated : "2026-07-28") }
    ]);

    /* 计算与测试条件 */
    var conditions = renderKv(CALC_CONDITIONS.map(function (c) {
      return { label: c.label, value: esc(c.value) };
    }));

    /* 数据集字段覆盖核对 */
    var auditRows = FIELD_AUDIT.map(function (item, index) {
      var type = getDatasetType(item.key);
      var labels = type.fields.map(function (f) { return f.label; });
      var missing = item.required.filter(function (name) { return labels.indexOf(name) < 0; });
      var meta = getOverviewMeta(item.key);
      return '<tr>'
        + '<td class="twod-ds-index">' + (index + 1) + '</td>'
        + '<td>' + esc(item.title) + '</td>'
        + '<td>' + item.required.length + ' 项<div style="margin-top:4px;color:#8ba0bb;line-height:1.6;">' + esc(item.required.join("、")) + '</div></td>'
        + '<td>' + labels.length + ' 项<div style="margin-top:4px;color:#8ba0bb;line-height:1.6;">' + esc(labels.join("、")) + '</div></td>'
        + '<td>' + (missing.length
            ? '<span class="twod-ds-tag twod-ds-tag-miss">缺 ' + missing.length + ' 项</span><div style="margin-top:4px;line-height:1.6;">' + esc(missing.join("、")) + '</div>'
            : '<span class="twod-ds-tag twod-ds-tag-ok">已覆盖</span>') + '</td>'
        + '<td>' + item.tables.map(function (t) { return '<span class="twod-ds-mono" style="display:block;">' + esc(t) + '</span>'; }).join("")
          + '<div style="margin-top:6px;color:#8ba0bb;line-height:1.6;">补充：' + esc(item.trace.join("、")) + '</div></td>'
        + '<td>' + fmtNum(meta ? meta.volume : 0) + ' 条</td>'
        + '</tr>';
    }).join("");

    page.innerHTML = '<div class="twod-ds-page">'
      + '<div class="twod-ds-breadcrumb">低维材料主题应用　/　低维材料数据库　/　二维材料数据库　/　库表结构</div>'
      + '<div class="twod-ds-head"><div><h2>二维材料数据库 · 库表结构</h2>'
      + '<p>数据库层：按物理库表组织二维材料数据资源，展示库表清单、信息概览与数据集字段覆盖核对结果；点击「查看字段」可进入数据表层查看字段信息、示例数据与计算条件。</p></div>'
      + '<div class="twod-ds-head-stats">'
      + '<div><span>数据表总数</span><strong>' + SCHEMA_TABLES.length + ' 张</strong></div>'
      + '<div><span>物理字段总数</span><strong>' + fmtNum(SCHEMA_TOTAL_FIELDS) + ' 个</strong></div>'
      + '<div><span>核心表记录数</span><strong>' + fmtNum(SCHEMA_TOTAL_BUSINESS) + ' 条</strong></div>'
      + '</div></div>'
      + '<div class="twod-ds-filter">' + renderTabs("db")
      + '<span class="twod-ds-filter-hint">当前为「数据库层」，表结构与字段注释来自 gkx_ldm.sql。</span></div>'
      + '<div class="twod-ds-layout">'
      + '<div class="twod-ds-layout-sub">'
      +   '<section class="twod-ds-card">'
      +     '<div class="twod-ds-card-head"><div><h3>库表清单</h3>'
      +     '<p>共 ' + SCHEMA_TABLES.length + ' 张表（核心业务表 ' + coreCount + ' 张 + 支撑表 ' + supportCount + ' 张），表结构与注释来自 gkx_ldm.sql。</p></div>'
      +     '<span class="twod-ds-count">物理字段合计 ' + fmtNum(SCHEMA_TOTAL_FIELDS) + ' 个</span></div>'
      +     '<div class="twod-ds-table-wrap"><table class="twod-ds-table is-narrow"><thead><tr>'
      +     '<th class="twod-ds-col-index">序号</th><th>数据表名</th><th>表中文名</th><th>表类型</th><th>字段数</th><th>数据量</th><th>承载数据集</th><th>最近更新</th><th>操作</th>'
      +     '</tr></thead><tbody>' + tableRows + '</tbody></table></div>'
      +   '</section>'
      +   '<section class="twod-ds-card">'
      +     '<div class="twod-ds-card-head"><div><h3>数据集字段覆盖核对</h3>'
      +     '<p>对照《低维材料主题库》招标与需规要求，核对八大特征数据集字段是否齐全，缺失项在「缺失字段」列标红。</p></div>'
      +     '<span class="twod-ds-count">共 8 类数据集</span></div>'
      +     '<div class="twod-ds-table-wrap"><table class="twod-ds-table"><thead><tr>'
      +     '<th class="twod-ds-col-index">序号</th><th>数据集</th><th>招标/需规要求字段</th><th>业务数据集字段</th><th>核对结果</th><th>库表溯源字段</th><th>数据量</th>'
      +     '</tr></thead><tbody>' + auditRows + '</tbody></table></div>'
      +   '</section>'
      + '</div>'
      + '<aside>'
      +   '<section class="twod-ds-card"><div class="twod-ds-card-head"><div><h3>信息概览</h3>'
      +   '<p>二维材料数据库的整体口径与标准化情况。</p></div></div>' + overview + '</section>'
      +   '<section class="twod-ds-card"><div class="twod-ds-card-head"><div><h3>计算与测试条件</h3>'
      +   '<p>依据二维材料数据库标准化细则。</p></div></div>' + conditions + '</section>'
      + '</aside>'
      + '</div></div>';
    resetPageScroll(page);
  }

  /* ---------- 7. 渲染：数据表层（字段信息 + 示例数据 + 信息概览） ---------- */
  function renderTableLayer(tableKey) {
    var meta = getTableMeta(tableKey);
    var page = document.getElementById("page-" + PAGE_ID);
    if (!page) return;
    ensureStyle();
    page.classList.remove("twod-dataset-detail-active");
    page.classList.add("twod-ds-active");

    /* 字段信息 */
    var fieldRows = meta.fields.map(function (field, index) {
      return '<tr>'
        + '<td class="twod-ds-index">' + (index + 1) + '</td>'
        + '<td><span class="twod-ds-mono">' + esc(field.name) + '</span></td>'
        + '<td>' + esc(field.label) + '</td>'
        + '<td><span class="twod-ds-mono">' + esc(field.type) + '</span></td>'
        + '<td>' + (field.required === "是"
            ? '<span class="twod-ds-tag twod-ds-tag-core">必填</span>'
            : '<span class="twod-ds-tag twod-ds-tag-support">可空</span>') + '</td>'
        + '<td>' + esc(field.unit) + '</td>'
        + '<td data-twod-ds-field="desc">' + esc(field.desc) + '</td>'
        + '</tr>';
    }).join("");

    /* 示例数据 */
    var sampleHead = '<tr><th class="twod-ds-col-index">序号</th>'
      + meta.sampleFields.map(function (name) {
          var match = null;
          meta.fields.forEach(function (x) { if (x.name === name) match = x; });
          return '<th>' + esc(match ? match.label : name) + '</th>';
        }).join("") + '</tr>';
    var sampleBody = meta.samples.map(function (row, index) {
      return '<tr><td class="twod-ds-index">' + (index + 1) + '</td>'
        + meta.sampleFields.map(function (name) {
            var v = row[name];
            return '<td>' + (v === null || v === undefined || v === "" ? "<span style=\"color:#b3c1d4\">NULL</span>" : esc(v)) + '</td>';
          }).join("") + '</tr>';
    }).join("");

    /* 信息概览 */
    var overview = renderKv([
      { label: "所属数据库", value: "二维材料数据库（<span class=\"twod-ds-mono\">gkx_ldm</span>）" },
      { label: "数据表", value: '<span class="twod-ds-mono">' + esc(meta.table) + '</span>' },
      { label: "表中文名", value: esc(meta.name) },
      { label: "表类型", value: '<span class="twod-ds-tag ' + (meta.kind === "core" ? "twod-ds-tag-core" : "twod-ds-tag-support") + '">' + esc(meta.kindLabel) + '</span>' },
      { label: "字段数量", value: meta.fields.length + " 个（其中必填 " + meta.fields.filter(function (x) { return x.required === "是"; }).length + " 个）" },
      { label: "数据量", value: fmtNum(meta.volume) + " 条" },
      { label: "主键/索引", value: '<span style="font-size:12px;">' + esc(meta.primaryKey) + '</span>' },
      { label: "承载数据集", value: esc(meta.datasets) },
      { label: "最近更新", value: esc(meta.updated) }
    ]);

    var related = renderKv([
      { label: "关联表", value: meta.related.map(function (t) {
          return '<span class="twod-ds-mono" style="display:block;"><button class="twod-ds-thumb" style="width:auto;padding:0;border:0;background:none;color:#2165d0;font-family:Consolas,\'Courier New\',monospace;font-size:13px;cursor:pointer;" type="button" data-twod-ds-table="' + esc(t) + '">' + esc(t) + '</button></span>';
        }).join("") },
      { label: "表说明", value: esc(meta.note) }
    ]);

    var conditions = meta.kind === "core"
      ? '<section class="twod-ds-card"><div class="twod-ds-card-head"><div><h3>计算与测试条件</h3>'
        + '<p>该表数据的标准化计算口径。</p></div></div>'
        + renderKv(CALC_CONDITIONS.map(function (c) { return { label: c.label, value: esc(c.value) }; }))
        + '</section>'
      : "";

    page.innerHTML = '<div class="twod-ds-page">'
      + '<div class="twod-ds-breadcrumb">低维材料主题应用　/　低维材料数据库　/　二维材料数据库　/　库表结构　/　' + esc(meta.name) + '</div>'
      + '<div class="twod-ds-head"><div><h2>' + esc(meta.name) + '</h2>'
      + '<p><span class="twod-ds-mono">' + esc(meta.table) + '</span>　数据表层：字段信息来自 gkx_ldm.sql 物理表结构，示例数据为该表的前 ' + meta.samples.length + ' 条记录。</p></div>'
      + '<div class="twod-ds-head-stats">'
      + '<div><span>字段数量</span><strong>' + meta.fields.length + ' 个</strong></div>'
      + '<div><span>数据量</span><strong>' + fmtNum(meta.volume) + ' 条</strong></div>'
      + '<div><span>最近更新</span><strong>' + esc(meta.updated) + '</strong></div>'
      + '</div></div>'
      + '<div class="twod-ds-filter">' + renderTabs("db")
      + '<span class="twod-ds-filter-hint">当前为「数据表层」。</span>'
      + '<div style="margin-left:auto;display:flex;align-items:center;gap:10px;">'
      + '<button class="twod-ds-ghost" type="button" data-twod-ds-exportfields="' + esc(meta.key) + '">导出字段清单</button>'
      + '<button class="twod-ds-back" type="button" data-twod-ds-backdb>返回库表清单</button></div>'
      + '</div>'
      + '<div class="twod-ds-layout">'
      + '<div class="twod-ds-layout-sub">'
      +   '<section class="twod-ds-card">'
      +     '<div class="twod-ds-card-head"><div><h3>字段信息</h3>'
      +     '<p>字段名称、数据类型、是否必填、单位与字段说明均以物理表结构为准。</p></div>'
      +     '<span class="twod-ds-count">共 ' + meta.fields.length + ' 个字段</span></div>'
      +     '<div class="twod-ds-table-wrap"><table class="twod-ds-table"><thead><tr>'
      +     '<th class="twod-ds-col-index">序号</th><th>字段名</th><th>字段中文名</th><th>数据类型</th><th>是否必填</th><th>单位/取值</th><th>字段说明</th>'
      +     '</tr></thead><tbody>' + fieldRows + '</tbody></table></div>'
      +   '</section>'
      +   '<section class="twod-ds-card">'
      +     '<div class="twod-ds-card-head"><div><h3>示例数据</h3>'
      +     '<p>该表的核心业务字段样例，NULL 表示该字段在此记录中无值（数值/文本二选一存储）。</p></div>'
      +     '<span class="twod-ds-count">共 ' + meta.samples.length + ' 条示例</span></div>'
      +     '<div class="twod-ds-table-wrap"><table class="twod-ds-table"><thead>' + sampleHead + '</thead><tbody>' + sampleBody + '</tbody></table></div>'
      +   '</section>'
      + '</div>'
      + '<aside>'
      +   '<section class="twod-ds-card"><div class="twod-ds-card-head"><div><h3>信息概览</h3>'
      +   '<p>数据表的基本情况。</p></div></div>' + overview + '</section>'
      +   conditions
      +   '<section class="twod-ds-card"><div class="twod-ds-card-head"><div><h3>关联与说明</h3>'
      +   '<p>外键指向与表职责说明。</p></div></div>' + related + '</section>'
      + '</aside>'
      + '</div></div>';
    resetPageScroll(page);
  }

  /* ---------- 8. 下载 ---------- */
  function downloadRow(typeKey, index) {
    var type = getDatasetType(typeKey);
    var row = type.samples[Number(index)];
    if (!row) return;
    var headers = ["序号"].concat(type.fields.map(function (f) { return f.label; }));
    var values = [Number(index) + 1].concat(type.fields.map(function (f) { return row[f.key] || "/"; }));
    var ok = downloadFile("2D-" + type.key + "-" + (Number(index) + 1) + ".csv", toCsv(headers, [values]));
    if (typeof showToast === "function") {
      showToast("数据下载", ok ? "已导出「" + type.title + "」第 " + (Number(index) + 1) + " 条样例数据。" : "当前浏览器不支持文件导出。");
    }
  }

  function downloadPackage(typeKey) {
    var type = getDatasetType(typeKey);
    var headers = ["序号"].concat(type.fields.map(function (f) { return f.label; }));
    var rows = type.samples.map(function (row, index) {
      return [index + 1].concat(type.fields.map(function (f) { return row[f.key] || "/"; }));
    });
    var ok = downloadFile("2D-" + type.key + "-dataset-sample.csv", toCsv(headers, rows));
    if (typeof showToast === "function") {
      showToast("数据集下载", ok ? "已导出「" + type.title + "」样例数据 " + type.samples.length + " 条。" : "当前浏览器不支持文件导出。");
    }
  }

  function downloadFields(tableKey) {
    var meta = getTableMeta(tableKey);
    var headers = ["序号", "字段名", "字段中文名", "数据类型", "是否必填", "单位/取值", "字段说明"];
    var rows = meta.fields.map(function (field, index) {
      return [index + 1, field.name, field.label, field.type, field.required, field.unit, field.desc];
    });
    var ok = downloadFile(meta.table + "-fields.csv", toCsv(headers, rows));
    if (typeof showToast === "function") {
      showToast("字段清单导出", ok ? "已导出「" + meta.name + "」字段清单 " + meta.fields.length + " 个字段。" : "当前浏览器不支持文件导出。");
    }
  }

  /* ---------- 9. 接入既有渲染链 ---------- */
  var current = getState();

  function renderCurrent() {
    var s = getState();
    if (s.view === "all") renderAll(s.type, s.focusIndex);
    else if (s.view === "db") renderDbLayer();
    else if (s.view === "table") renderTableLayer(s.tableKey);
    else renderList(s.type);
  }

  var baseOverview = typeof renderLowdimDbOverviewPage === "function" ? renderLowdimDbOverviewPage : null;
  if (baseOverview) {
    renderLowdimDbOverviewPage = function (pageId) {
      if (pageId === PAGE_ID) { renderCurrent(); return; }
      return baseOverview.apply(this, arguments);
    };
  }
  var baseTwodDb = typeof renderTwodDatabasePage === "function" ? renderTwodDatabasePage : null;
  if (baseTwodDb) {
    renderTwodDatabasePage = function (pageId) {
      if (pageId === PAGE_ID) { renderCurrent(); return; }
      return baseTwodDb.apply(this, arguments);
    };
  }

  /* 切到本页时兜底重渲染（patchedSwitchPage 里可能有 setTimeout 覆盖） */
  var baseSwitch = typeof switchPage === "function" ? switchPage : null;
  if (baseSwitch && !baseSwitch.__twodDatasetTypePatched) {
    var patched = function (page) {
      var result = baseSwitch.apply(this, arguments);
      if (page === PAGE_ID) setTimeout(renderCurrent, 0);
      return result;
    };
    patched.__twodDatasetTypePatched = true;
    switchPage = patched;
    window.switchPage = patched;
  }

  /* ---------- 10. 事件委托 ---------- */
  function bindEvents() {
    if (document.body.dataset.twodDatasetTypeBound === "true") return;
    document.body.dataset.twodDatasetTypeBound = "true";

    document.body.addEventListener("change", function (event) {
      var select = event.target.closest ? event.target.closest("[data-twod-ds-type]") : null;
      if (!select) return;
      var s = getState();
      s.type = select.value || "structure";
      s.view = "list";
      s.focusIndex = "";
      renderList(s.type);
    });

    document.body.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || !target.closest) return;
      var s = getState();

      /* 视图 Tab */
      var viewTab = target.closest("[data-twod-ds-viewtab]");
      if (viewTab) {
        var next = viewTab.getAttribute("data-twod-ds-viewtab");
        s.view = next === "db" ? "db" : "list";
        s.focusIndex = "";
        renderCurrent();
        return;
      }

      /* 进入库表结构 */
      var goDb = target.closest("[data-twod-ds-godb]");
      if (goDb) {
        s.view = "db";
        s.focusIndex = "";
        renderDbLayer();
        return;
      }

      /* 进入数据表层 */
      var tableBtn = target.closest("[data-twod-ds-table]");
      if (tableBtn) {
        s.view = "table";
        s.tableKey = tableBtn.getAttribute("data-twod-ds-table") || "ldm_material_2d";
        renderTableLayer(s.tableKey);
        return;
      }

      /* 返回库表清单 */
      if (target.closest("[data-twod-ds-backdb]")) {
        s.view = "db";
        renderDbLayer();
        return;
      }

      /* 导出字段清单 */
      var exportBtn = target.closest("[data-twod-ds-exportfields]");
      if (exportBtn) {
        downloadFields(exportBtn.getAttribute("data-twod-ds-exportfields"));
        return;
      }

      var viewAll = target.closest("[data-twod-ds-viewall]");
      if (viewAll) {
        s.view = "all";
        s.focusIndex = viewAll.getAttribute("data-twod-ds-viewall");
        renderAll(s.type, s.focusIndex);
        return;
      }
      var back = target.closest("[data-twod-ds-back]");
      if (back) {
        s.view = "list";
        s.focusIndex = "";
        renderList(s.type);
        return;
      }
      var download = target.closest("[data-twod-ds-download]");
      if (download) {
        downloadRow(s.type, download.getAttribute("data-twod-ds-download"));
        return;
      }
      var fileBtn = target.closest("[data-twod-ds-file]");
      if (fileBtn) {
        downloadPackage(s.type);
        return;
      }
      var thumb = target.closest("[data-twod-ds-preview]");
      if (thumb) {
        var label = thumb.getAttribute("data-twod-ds-preview") || "二维结构";
        var modal = document.getElementById("twodDatabaseStructurePreviewModal");
        var title = document.getElementById("twodDatabaseStructurePreviewTitle");
        var body = document.getElementById("twodDatabaseStructurePreviewBody");
        if (modal && body) {
          if (title) title.textContent = label + " 原子结构图";
          body.innerHTML = '<div class="twod-db-preview">' + renderTwodAtomicStructureSvg(label, true) + '</div>';
          if (typeof openModal === "function") openModal("twodDatabaseStructurePreviewModal");
        } else if (typeof showToast === "function") {
          showToast("原子结构图", label);
        }
        return;
      }
    });
  }

  bindEvents();

  /* 首屏：若当前已在本页则立即重渲染 */
  if (typeof state !== "undefined" && state.page === PAGE_ID) {
    setTimeout(renderCurrent, 0);
  }
})();
