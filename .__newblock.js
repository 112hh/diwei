    /* ============================================================================
       低维材料数据库（五个库通用）：以「材料」为主体的数据集视图
       一个材料 = 一个数据集名称，材料内部包含该类材料的全部特征数据集内容
       ============================================================================ */

    /* ---------- 1. 各类材料的特征数据集定义 ---------- */
    const LOWDIM_MATERIAL_DB_DATASET_DEFS = {
      "lowdim-database-twod": [
        { key: "structure",  short: "结构特征", title: "结构特征数据集", domain: "结构", code: "DS-2D-STRUCT", format: "Parquet / CIF", description: "收录二维材料结构特征相关标准化数据，涵盖原子结构图、化学式、晶胞参数、原子坐标、键长键角、晶系和空间群等信息。", fields: ["原子结构图", "化学式", "晶胞参数", "层厚", "原子坐标", "键长键角", "晶系", "空间群"] },
        { key: "electronic", short: "电子结构", title: "电子结构数据集", domain: "电子", code: "DS-2D-ELEC", format: "CSV / DAT", description: "收录二维材料电子结构相关标准化数据，提供能带结构、态密度和电子有效质量等可追溯数据。", fields: ["能带结构", "态密度", "有效质量"] },
        { key: "electrical", short: "电学性质", title: "电学性质数据集", domain: "电学", code: "DS-2D-ELEC2", format: "CSV / JSON", description: "收录二维材料电学性质相关标准化数据，覆盖铁电性质与压电性质及其测试条件信息。", fields: ["铁电性质", "压电性质"] },
        { key: "magnetic",   short: "磁学性质", title: "磁学性质数据集", domain: "磁学", code: "DS-2D-MAG", format: "CSV / PNG", description: "收录二维材料磁学性质相关标准化数据，包含磁基态构型和磁转变温度（居里温度）。", fields: ["磁基态构型", "磁转变温度"] },
        { key: "thermal",    short: "热学性质", title: "热学性质数据集", domain: "热学", code: "DS-2D-THERM", format: "CSV / DAT", description: "收录二维材料热学性质相关标准化数据，包含形成能、声子谱和声子态密度。", fields: ["形成能", "声子谱", "声子态密度"] },
        { key: "mechanical", short: "力学性质", title: "力学性质数据集", domain: "力学", code: "DS-2D-MECH", format: "CSV / JSON", description: "收录二维材料力学性质相关标准化数据，包含弹性常数、杨氏模量和泊松比。", fields: ["弹性常数", "杨氏模量", "泊松比"] },
        { key: "optical",    short: "光学性质", title: "光学性质数据集", domain: "光学", code: "DS-2D-OPT", format: "CSV / DAT", description: "收录二维材料光学性质相关标准化数据，涵盖介电函数、光吸收系数、反射率、折射率和消光系数。", fields: ["介电函数", "光吸收系数", "反射率", "折射率", "消光系数"] },
        { key: "defect",     short: "缺陷性质", title: "缺陷性质数据集", domain: "缺陷", code: "DS-2D-DEF", format: "CSV / DAT", description: "收录二维材料缺陷性质相关标准化数据，包含空位缺陷与反位缺陷的构型和形成能。", fields: ["空位缺陷", "反位缺陷"] }
      ],
      "lowdim-database-opto": [
        { key: "base",   short: "基础", title: "有机光电材料基础数据集", domain: "基础", code: "DS-OP-BASE", format: "PDB / MOL / SDF", description: "收录有机分子中英文名称、CAS/InChI 分子编号、分子式、分子量和三维结构等基础信息。", fields: ["中英文名称", "分子编号", "分子式", "分子量", "三维结构"] },
        { key: "phys",   short: "物性", title: "有机光电材料物性数据集", domain: "物性", code: "DS-OP-PHYS", format: "CSV / JSON", description: "收录有机分子相对密度、熔点、沸点、闪点等物理性质数据，支撑热稳定性与使用场景筛选。", fields: ["相对密度", "熔点", "沸点", "闪点"] },
        { key: "spec",   short: "表征图谱", title: "有机光电材料表征图谱数据集", domain: "图谱", code: "DS-OP-SPEC", format: "JPG / CSV", description: "收录红外光谱、拉曼光谱和核磁共振谱等表征图谱，包含原始数据与图谱图片。", fields: ["红外光谱", "拉曼光谱", "核磁共振谱"] },
        { key: "calc",   short: "计算", title: "有机光电材料计算数据集", domain: "计算", code: "DS-OP-CALC", format: "CSV / JSON / JPG", description: "收录量子化学计算数据：基态/激发态结构、激发能、发射能、跃迁偶极矩、HOMO-LUMO、溶剂化自由能、斯托克斯位移、简正模式和态密度。", fields: ["基态/激发态结构", "激发能", "发射能", "跃迁偶极矩", "HOMO-LUMO", "溶剂化自由能", "斯托克斯位移", "简正模式", "态密度"] }
      ],
      "lowdim-database-electrolyte": [
        { key: "liquid", short: "有机电解液", title: "有机电解液数据集", domain: "基础/物性/图谱/安全/计算", code: "DS-ELE-LIQ", format: "PDB / CSV", description: "按醚类、酯类、环状和其他四类子数据集组织，涵盖基础信息、物性数据、表征图谱、安全信息和计算数据五大模块。", fields: ["基础信息", "物性数据", "表征图谱", "安全信息", "HOMO-LUMO", "电荷分布", "溶剂化能"] },
        { key: "sorg",   short: "固态有机", title: "固态有机电解质数据集", domain: "基础/物性/计算", code: "DS-ELE-SORG", format: "PDB / CSV / JSON", description: "按醚类、酮类、腈类和其他官能团分类，涵盖基础信息、物性数据和计算数据三大模块。", fields: ["单体信息", "摩尔体积", "密度", "玻璃化转变温度", "电导率", "摩尔热容", "结合能"] },
        { key: "sino",   short: "固态无机", title: "固态无机电解质数据集", domain: "基础/计算/图谱", code: "DS-ELE-SINO", format: "CIF / POSCAR / CSV", description: "按氧化物、硫化物、卤化物和其他类型分类，涵盖基础信息、计算数据和图谱数据三大模块。", fields: ["晶体结构", "形成能", "费米能级", "带隙", "能带/态密度", "XRD", "XAS"] }
      ],
      "lowdim-database-mlff": [
        { key: "base",  short: "基础", title: "机器学习力场基础数据集", domain: "基础", code: "DS-MLF-BASE", format: "PDB / CSV / XML", description: "收录单分子、双分子和多分子团簇的结构、能量、原子受力，以及原子电荷、偶极矩、极化率、色散系数等力场参数。", fields: ["原子电荷", "偶极矩", "极化率", "色散系数", "单分子能量", "相互作用能", "原子受力"] },
        { key: "small", short: "有机小分子", title: "有机小分子机器学习力场数据集", domain: "小分子", code: "DS-MLF-SMALL", format: "PDB / XYZ / CSV", description: "收录醚类、酰胺类有机小分子的构象采样数据与第一性原理计算的能量、受力等训练集数据。", fields: ["醚类小分子", "酰胺类小分子", "构象采样", "能量与受力"] },
        { key: "poly",  short: "高分子", title: "高分子机器学习力场数据集", domain: "高分子", code: "DS-MLF-POLY", format: "PDB / HDF5", description: "收录高分子片段（重复单元、官能团）与蛋白质（二肽/三肽）构象采样和能量数据，用于机器学习力场训练。", fields: ["高分子片段", "蛋白质构象", "片段能量", "相互作用能"] }
      ],
      "lowdim-database-catalyst": [
        { key: "elem",   short: "元素特征", title: "催化材料元素特征数据集", domain: "元素特征", code: "DS-CAT-ELEM", format: "CSV / JSON", description: "收录催化材料相关元素的周期数和族数、元素电荷、相对原子质量、原子半径、价电子数、轨道电子数、第一电离能、电子亲和势、电负性和d带中心。", fields: ["周期数和族数", "元素电荷", "相对原子质量", "原子半径", "价电子数", "d/p轨道电子数", "第一电离能", "电子亲和势", "电负性", "d带中心"] },
        { key: "struct", short: "结构特征", title: "催化材料结构特征数据集", domain: "结构特征", code: "DS-CAT-STRUCTF", format: "PNG / CIF / DAE", description: "收录形貌结构图、点群和空间群、活性位点配位数、对称性函数及其他结构特征描述符。", fields: ["形貌结构图", "点群和空间群", "活性位点配位数", "对称性函数"] },
        { key: "sac",    short: "单原子", title: "单原子催化剂数据集", domain: "吸附", code: "DS-CAT-SAC", format: "POSCAR / CSV", description: "以铜单质为基底、41种元素掺杂，覆盖Cu(100)/(110)/(111)/(210)/(411)五种表面共75种吸附结构，提供CO2还原6种中间产物吸附能数据约1.4万条。", fields: ["41种掺杂元素", "5种铜表面", "6种中间产物", "吸附能"] },
        { key: "alloy",  short: "二元合金", title: "二元合金数据集", domain: "吸附", code: "DS-CAT-ALLOY", format: "POSCAR / CSV", description: "基于Materials Project筛选的127种铜基二元合金材料，覆盖5种铜表面与6种中间产物的吸附构型和吸附能数据。", fields: ["127种二元合金", "5种铜表面", "6种中间产物", "吸附构型"] },
        { key: "gb",     short: "晶界", title: "晶界数据集", domain: "吸附", code: "DS-CAT-GB", format: "POSCAR / CSV", description: "收录铜中5种典型晶界结构，41种元素置于晶界4个不同位点，针对6种中间产物共4,800条催化材料数据。", fields: ["5种晶界结构", "41种元素", "4种位点", "中间产物吸附"] },
        { key: "sys",    short: "体系特征", title: "体系特征数据集", domain: "体系特征", code: "DS-CAT-SYS", format: "CSV / DAT / JSON", description: "收录费米面位置、掺杂形成能（晶界能）、体系磁矩等体系特征，以及催化反应路径、催化产物与催化性能数据。", fields: ["费米面位置", "掺杂形成能", "体系磁矩", "反应路径", "催化性能"] }
      ]
    };

    /* ---------- 2. 各库材料清单（每个材料内为该类的全部特征数据集内容） ---------- */
    const LOWDIM_MATERIAL_DB_MATERIAL_DEFS = {
      "lowdim-database-twod": [
        {
          materialId: "2D-MoS2-0001", nameCn: "二硫化钼", nameEn: "Molybdenum disulfide", formula: "MoS2",
          tag: "单层", safetyLevel: 1, status: "已发布", updatedAt: "2026-09-10",
          searchText: "Mo S 六方晶系 P6m2 硫化物 TMD",
          meta: [["晶系 / 空间群", "六方晶系 · P6m2"], ["晶格常数", "a = b = 3.17 Å"]],
          info: [["材料编号", "2D-MoS2-0001"], ["中文名称", "二硫化钼"], ["英文名称", "Molybdenum disulfide"], ["化学式", "MoS2"], ["维度 / 层型", "单层"], ["元素组成", "Mo - S"], ["晶系", "六方晶系"], ["空间群", "P6m2"], ["点群", "D3h"], ["晶格常数", "a = b = 3.17 Å，c = 12.30 Å"], ["晶格夹角", "α = β = 90°，γ = 120°"], ["层厚", "3.13 Å"], ["数据来源", "EXTERNAL 外源数据"]],
          datasets: {
            structure: { updatedAt: "2026-09-10", records: [
              { name: "结构特征", type: "字符", value: "六方晶系，空间群 P6m2；a=b=3.17 Å，α=β=90°，γ=120°；层厚 3.13 Å；晶胞含 2 个 Mo、1 个 S", method: "M-VASP-PBE-500", file: "struct/MoS2_monolayer.cif", published: true },
              { name: "原子结构图", type: "图片", value: "MoS2 单层原子结构图（侧视 + 俯视）", file: "img/struct/MoS2_monolayer.png", published: true },
              { name: "键长键角", type: "字符", value: "Mo-S 键长 2.41 Å；S-Mo-S 键角 82.6°；Mo-S-Mo 键角 47.4°", published: true },
              { name: "三维结构模型", type: "结构", value: "MoS2 单层三维结构可视化模型（可旋转）", file: "model/MoS2_monolayer.dae", published: true }
            ] },
            electronic: { updatedAt: "2026-09-09", records: [
              { name: "能带结构", type: "谱图", value: "直接带隙，导带低与价带顶均位于 K 点", file: "dat/band/MoS2_band.dat", method: "M-VASP-PBE-500", published: true },
              { name: "态密度", type: "谱图", value: "导带低与价带顶主要由 Mo 的 d 轨道贡献，S 的 p 轨道贡献很小", file: "dat/dos/MoS2_dos.dat", method: "M-VASP-PBE-500", published: true },
              { name: "带隙", type: "数字", value: "1.8", unit: "eV", method: "M-VASP-PBE-500", published: true },
              { name: "带隙类型", type: "字符", value: "直接带隙", published: true },
              { name: "有效质量", type: "数字", value: "0.45", unit: "m₀", method: "M-VASP-PBE-500", published: true },
              { name: "载流子迁移率", type: "数字", value: "200", unit: "cm²·V⁻¹·s⁻¹", published: true }
            ] },
            electrical: { updatedAt: "2026-09-05", records: [
              { name: "压电性质", type: "字符", value: "e11 = 362 pC/m，d11 = 3.65 pm/V", unit: "pC/m", method: "M-VASP-PBE-500", published: true }
            ] },
            thermal: { updatedAt: "2026-09-02", records: [
              { name: "形成能", type: "数字", value: "-0.687", unit: "eV", method: "M-VASP-PBE-500", published: true },
              { name: "形成能（修订版本 v2）", type: "数字", value: "-0.712", unit: "eV", method: "M-VASP-PBE-500", published: false }
            ] },
            optical: { updatedAt: "2026-08-29", records: [
              { name: "光吸收系数图", type: "谱图", value: "待重出图（当前 156 dpi，低于标准 300 dpi，工单 QC-2026-0001）", unit: "cm⁻¹", file: "dat/opt/MoS2_absorption.dat", method: "M-VASP-PBE-500", published: false }
            ] },
            defect: { updatedAt: "2026-08-27", records: [
              { name: "缺陷形成能图", type: "谱图", value: "包含 2 种空位缺陷（S 空位、Mo 空位）与 2 种反位缺陷（SMo、MoS）的形成能", unit: "eV", file: "dat/defect/MoS2_defect_formE.dat", method: "M-VASP-PBE-500", published: true }
            ] }
          }
        },
        {
          materialId: "2D-GRAPHENE-0002", nameCn: "石墨烯", nameEn: "Graphene", formula: "C",
          tag: "单层", safetyLevel: 1, status: "已发布", updatedAt: "2026-08-20",
          searchText: "C 碳 六方晶系 P6/mmm 狄拉克",
          meta: [["晶系 / 空间群", "六方晶系 · P6/mmm"], ["晶格常数", "a = b = 2.46 Å"]],
          info: [["材料编号", "2D-GRAPHENE-0002"], ["中文名称", "石墨烯"], ["英文名称", "Graphene"], ["化学式", "C"], ["维度 / 层型", "单层"], ["元素组成", "C"], ["晶系", "六方晶系"], ["空间群", "P6/mmm"], ["点群", "D6h"], ["晶格常数", "a = b = 2.46 Å，c = 18.00 Å"], ["晶格夹角", "α = β = 90°，γ = 120°"], ["层厚", "0.00 Å"], ["数据来源", "EXTERNAL 外源数据"]],
          datasets: {
            structure: { updatedAt: "2026-08-20", records: [
              { name: "结构特征", type: "字符", value: "六方晶系，空间群 P6/mmm；a=b=2.46 Å，α=β=90°，γ=120°；C-C 键长 1.42 Å", method: "M-VASP-PBE-500", file: "struct/graphene_monolayer.cif", published: true },
              { name: "原子结构图", type: "图片", value: "石墨烯单层蜂窝状原子结构图", file: "img/struct/graphene_monolayer.png", published: true },
              { name: "键长键角", type: "字符", value: "C-C 键长 1.42 Å；C-C-C 键角 120.0°", published: true },
              { name: "三维结构模型", type: "结构", value: "石墨烯单层三维结构可视化模型", file: "model/graphene_monolayer.dae", published: true }
            ] },
            electronic: { updatedAt: "2026-08-18", records: [
              { name: "带隙", type: "数字", value: "0", unit: "eV", method: "M-VASP-PBE-500", published: true },
              { name: "带隙类型", type: "字符", value: "金属性（狄拉克点处无带隙，载流子无质量）", published: true },
              { name: "有效质量", type: "数字", value: "0", unit: "m₀", published: true },
              { name: "载流子迁移率", type: "数字", value: "200000", unit: "cm²·V⁻¹·s⁻¹", published: true }
            ] },
            mechanical: { updatedAt: "2026-08-15", records: [
              { name: "杨氏模量", type: "数字", value: "342.2", unit: "N/m", method: "M-VASP-PBE-500", published: true },
              { name: "泊松比", type: "数字", value: "0.173", unit: "1", method: "M-VASP-PBE-500", published: true }
            ] },
            optical: { updatedAt: "2026-08-12", records: [
              { name: "介电函数图", type: "谱图", value: "待重算（截断能 400 eV 低于标准 500 eV，工单 QC-2026-0003）", file: "dat/opt/graphene_dielectric.dat", method: "M-VASP-PBE-400", published: false }
            ] }
          }
        },
        {
          materialId: "2D-HBN-0003", nameCn: "六方氮化硼", nameEn: "Hexagonal boron nitride", formula: "BN",
          tag: "单层", safetyLevel: 1, status: "已发布", updatedAt: "2026-08-21",
          searchText: "B N 硼 氮 六方晶系 绝缘体",
          meta: [["晶系 / 空间群", "六方晶系 · P6₃/mmc"], ["晶格常数", "a = b = 2.51 Å"]],
          info: [["材料编号", "2D-HBN-0003"], ["中文名称", "六方氮化硼"], ["英文名称", "Hexagonal boron nitride"], ["化学式", "BN"], ["维度 / 层型", "单层"], ["元素组成", "B - N"], ["晶系", "六方晶系"], ["空间群", "P6₃/mmc"], ["点群", "D6h"], ["晶格常数", "a = b = 2.51 Å，c = 20.10 Å"], ["晶格夹角", "α = β = 90°，γ = 120°"], ["层厚", "3.33 Å"], ["数据来源", "CALC 计算数据"]],
          datasets: {
            structure: { updatedAt: "2026-08-21", records: [
              { name: "结构特征", type: "字符", value: "六方晶系，空间群 P6₃/mmc；a=b=2.51 Å；层厚 3.33 Å；B、N 交替占据蜂窝格点", method: "M-VASP-PBE-500", file: "struct/hBN_monolayer.cif", published: true },
              { name: "原子结构图", type: "图片", value: "六方氮化硼单层原子结构图", file: "img/struct/hBN_monolayer.png", published: true },
              { name: "键长键角", type: "字符", value: "B-N 键长 1.45 Å；N-B-N 键角 120.0°", published: true },
              { name: "三维结构模型", type: "结构", value: "hBN 单层三维结构可视化模型", file: "model/hBN_monolayer.dae", published: true }
            ] },
            electronic: { updatedAt: "2026-08-19", records: [
              { name: "能带结构", type: "谱图", value: "待重算（结构优化收敛力 0.028 eV/Å 超阈值 0.01 eV/Å，工单 QC-2026-0005）", file: "dat/band/hBN_band.dat", method: "M-VASP-PBE-500", published: false },
              { name: "态密度", type: "谱图", value: "hBN 态密度谱图", file: "dat/dos/hBN_dos.dat", method: "M-VASP-PBE-500", published: true },
              { name: "带隙", type: "数字", value: "4.7", unit: "eV", method: "M-VASP-PBE-500", published: true },
              { name: "带隙类型", type: "字符", value: "直接带隙", published: true }
            ] },
            mechanical: { updatedAt: "2026-08-16", records: [
              { name: "杨氏模量", type: "数字", value: "275.8", unit: "N/m", method: "M-VASP-PBE-500", published: true },
              { name: "泊松比", type: "数字", value: "0.22", unit: "1", method: "M-VASP-PBE-500", published: true }
            ] }
          }
        },
        {
          materialId: "2D-IN2SE3-0004", nameCn: "硒化铟", nameEn: "Indium selenide", formula: "In2Se3",
          tag: "单层", safetyLevel: 2, status: "已发布", updatedAt: "2026-09-10",
          searchText: "In Se 铟 硒 铁电 六方晶系",
          meta: [["晶系 / 空间群", "六方晶系 · P6₃/mmc"], ["晶格常数", "a = b = 4.05 Å"]],
          info: [["材料编号", "2D-IN2SE3-0004"], ["中文名称", "硒化铟"], ["英文名称", "Indium selenide"], ["化学式", "In2Se3"], ["维度 / 层型", "单层"], ["元素组成", "In - Se"], ["晶系", "六方晶系"], ["空间群", "P6₃/mmc"], ["点群", "C3v"], ["晶格常数", "a = b = 4.05 Å，c = 19.60 Å"], ["晶格夹角", "α = β = 90°，γ = 120°"], ["层厚", "6.60 Å"], ["数据来源", "CALC 计算数据"]],
          datasets: {
            structure: { updatedAt: "2026-09-10", records: [
              { name: "结构特征", type: "字符", value: "六方晶系，空间群 P6₃/mmc；a=b=4.05 Å；层厚 6.60 Å；面外原子排列不对称", method: "M-VASP-PBE-500", file: "struct/In2Se3_monolayer.cif", published: true },
              { name: "原子结构图", type: "图片", value: "硒化铟单层原子结构图", file: "img/struct/In2Se3_monolayer.png", published: true },
              { name: "键长键角", type: "字符", value: "In-Se 键长 2.62 Å；Se-In-Se 键角 109.5°", published: true },
              { name: "三维结构模型", type: "结构", value: "In2Se3 单层三维结构可视化模型", file: "model/In2Se3_monolayer.dae", published: true }
            ] },
            electronic: { updatedAt: "2026-09-08", records: [
              { name: "带隙", type: "数字", value: "1.4", unit: "eV", method: "M-VASP-PBE-500", published: true },
              { name: "带隙类型", type: "字符", value: "直接带隙（Γ 点）", published: true },
              { name: "能带结构", type: "谱图", value: "导带低与价带顶均位于 Γ 点", file: "dat/band/In2Se3_band.dat", method: "M-VASP-PBE-500", published: true }
            ] },
            electrical: { updatedAt: "2026-09-06", records: [
              { name: "铁电性质", type: "字符", value: "面外原子排列不对称，正负电荷中心不重合，具有自发极化，属二维铁电材料", file: "img/ferro/In2Se3_polarization.png", method: "M-VASP-PBE-500", published: true }
            ] },
            mechanical: { updatedAt: "2026-09-04", records: [
              { name: "弹性常数", type: "数字", value: "68.4", unit: "GPa", method: "M-VASP-PBE-500", published: false }
            ] }
          }
        },
        {
          materialId: "2D-CROOH-0005", nameCn: "羟基氧化铬", nameEn: "Chromium oxyhydroxide", formula: "CrOOH",
          tag: "单层", safetyLevel: 2, status: "已发布", updatedAt: "2026-09-09",
          searchText: "Cr O H 铬 磁性 六方晶系",
          meta: [["晶系 / 空间群", "六方晶系 · P-3m1"], ["晶格常数", "a = b = 3.02 Å"]],
          info: [["材料编号", "2D-CROOH-0005"], ["中文名称", "羟基氧化铬"], ["英文名称", "Chromium oxyhydroxide"], ["化学式", "CrOOH"], ["维度 / 层型", "单层"], ["元素组成", "Cr - O - H"], ["晶系", "六方晶系"], ["空间群", "P-3m1"], ["点群", "D3d"], ["晶格常数", "a = b = 3.02 Å，c = 13.40 Å"], ["晶格夹角", "α = β = 90°，γ = 120°"], ["层厚", "待补充"], ["数据来源", "CALC 计算数据"]],
          datasets: {
            structure: { updatedAt: "2026-09-09", records: [
              { name: "结构特征", type: "字符", value: "六方晶系，空间群 P-3m1；a=b=3.02 Å，α=β=90°，γ=120°；层厚待补充", method: "M-VASP-PBE-500", file: "struct/CrOOH_monolayer.cif", published: true },
              { name: "原子结构图", type: "图片", value: "羟基氧化铬单层原子结构图", file: "img/struct/CrOOH_monolayer.png", published: true },
              { name: "键长键角", type: "字符", value: "Cr-O 键长 1.99 Å；O-H 键长 0.98 Å", published: true }
            ] },
            electronic: { updatedAt: "2026-09-07", records: [
              { name: "带隙", type: "数字", value: "2.1", unit: "eV", method: "M-VASP-PBE-500", published: true },
              { name: "带隙类型", type: "字符", value: "间接带隙", published: true },
              { name: "能带结构", type: "谱图", value: "带隙主导轨道贡献为 Cr-d", file: "dat/band/CrOOH_band.dat", method: "M-VASP-PBE-500", published: true }
            ] },
            magnetic: { updatedAt: "2026-09-05", records: [
              { name: "磁基态构型", type: "图片", value: "存在 3 种磁构型（1 种铁磁 + 2 种反铁磁）；总能计算表明铁磁构型能量最低，故磁基态为铁磁性", file: "img/mag/CrOOH_mag_config.png", method: "M-VASP-PBE-500", published: true },
              { name: "磁转变温度", type: "数字", value: "待补充（原始记录未采集，已建工单 QC-2026-0007）", unit: "K", method: "M-VASP-PBE-500", published: false }
            ] }
          }
        },
        {
          materialId: "2D-NB2C-0006", nameCn: "碳化铌", nameEn: "Niobium carbide", formula: "Nb2C",
          tag: "单层", safetyLevel: 1, status: "已发布", updatedAt: "2026-08-25",
          searchText: "Nb C 铌 MXene 六方晶系",
          meta: [["晶系 / 空间群", "六方晶系 · P6₃/mmc"], ["晶格常数", "a = b = 3.12 Å"]],
          info: [["材料编号", "2D-NB2C-0006"], ["中文名称", "碳化铌"], ["英文名称", "Niobium carbide"], ["化学式", "Nb2C"], ["维度 / 层型", "单层"], ["元素组成", "Nb - C"], ["晶系", "六方晶系"], ["空间群", "P6₃/mmc"], ["点群", "D3h"], ["晶格常数", "a = b = 3.12 Å，c = 14.80 Å"], ["晶格夹角", "α = β = 90°，γ = 120°"], ["层厚", "5.90 Å"], ["数据来源", "EXTERNAL 外源数据"]],
          datasets: {
            structure: { updatedAt: "2026-08-25", records: [
              { name: "结构特征", type: "字符", value: "六方晶系，空间群 P6₃/mmc；a=b=3.12 Å；层厚 5.90 Å；MXene 型结构", method: "M-VASP-PBE-500", file: "struct/Nb2C_monolayer.cif", published: true },
              { name: "原子结构图", type: "图片", value: "碳化铌单层原子结构图", file: "img/struct/Nb2C_monolayer.png", published: true },
              { name: "键长键角", type: "字符", value: "Nb-C 键长 2.16 Å；Nb-C-Nb 键角 60.0°", published: true },
              { name: "三维结构模型", type: "结构", value: "Nb2C 单层三维结构可视化模型", file: "model/Nb2C_monolayer.dae", published: true }
            ] },
            electronic: { updatedAt: "2026-08-23", records: [
              { name: "带隙", type: "数字", value: "0", unit: "eV", method: "M-VASP-PBE-500", published: true },
              { name: "带隙类型", type: "字符", value: "金属性（Nb-d 轨道跨费米能级）", published: true }
            ] },
            thermal: { updatedAt: "2026-08-22", records: [
              { name: "形成能", type: "数字", value: "-0.65", unit: "eV/atom", method: "M-VASP-PBE-500", published: false },
              { name: "声子谱", type: "谱图", value: "晶胞含 3 个原子，声子谱含 3 条声学支与 6 条光学支；无虚频，判定动力学稳定", unit: "THz", file: "dat/phonon/Nb2C_phonon.dat", method: "M-VASP-PBE-500", published: true },
              { name: "声子态密度", type: "谱图", value: "Nb 原子较重，主导低频区振动；C 原子较轻，主导高频区振动", file: "dat/phonon/Nb2C_phonon_dos.dat", method: "M-VASP-PBE-500", published: true }
            ] },
            defect: { updatedAt: "2026-08-20", records: [
              { name: "缺陷结构图", type: "图片", value: "含 Nb 空位与 C 空位两种缺陷构型", file: "img/defect/Nb2C_vacancy.png", method: "M-VASP-PBE-500", published: false }
            ] }
          }
        }
      ],
      "lowdim-database-opto": [
        {
          materialId: "OP-RUBRENE-0001", nameCn: "红荧烯", nameEn: "Rubrene", formula: "C42H28",
          tag: "多环芳烃类有机小分子", safetyLevel: 1, status: "已发布", updatedAt: "2026-08-30",
          searchText: "Rubrene 517-51-1 并四苯 荧光 空穴迁移",
          meta: [["分子编号 / 分子量", "CAS 517-51-1 · 532.68"], ["三维结构", "PDB / MOL 结构已归档"]],
          info: [["材料编号", "OP-RUBRENE-0001"], ["中文名称", "红荧烯"], ["英文名称", "Rubrene"], ["分子式", "C42H28"], ["分子量", "532.68"], ["分子编号", "CAS 517-51-1"], ["材料子类", "多环芳烃类有机小分子"], ["三维结构", "rubrene.pdb（已归档）"], ["数据来源", "EXTERNAL 外源数据"]],
          datasets: {
            base: { updatedAt: "2026-08-30", records: [
              { name: "中英文名称", type: "字符", value: "红荧烯 / Rubrene", published: true },
              { name: "分子编号", type: "字符", value: "CAS 517-51-1；InChIKey URONBTMTAADXAX-UHFFFAOYSA-N", published: true },
              { name: "分子式", type: "字符", value: "C42H28", published: true },
              { name: "分子量", type: "数字", value: "532.68", unit: "g/mol", published: true },
              { name: "三维结构", type: "结构", value: "红荧烯分子三维结构模型（可旋转）", file: "mol/rubrene.pdb", published: true }
            ] },
            phys: { updatedAt: "2026-08-28", records: [
              { name: "相对密度", type: "数字", value: "1.26", unit: "g/cm³", published: true },
              { name: "熔点", type: "数字", value: "315", unit: "°C", published: true },
              { name: "沸点", type: "数字", value: "640", unit: "°C", published: true },
              { name: "闪点", type: "数字", value: "355", unit: "°C", published: true }
            ] },
            spec: { updatedAt: "2026-08-27", records: [
              { name: "红外光谱", type: "谱图", value: "特征峰：3050 cm⁻¹（芳香 C-H）、1440 cm⁻¹（C=C 骨架）", file: "spec/rubrene_ir.csv", published: true },
              { name: "拉曼光谱", type: "谱图", value: "特征峰：1545 cm⁻¹、1340 cm⁻¹", file: "spec/rubrene_raman.csv", published: true },
              { name: "核磁共振谱", type: "谱图", value: "¹H NMR (CDCl₃) δ 7.2–7.6 (m, 28H)", file: "spec/rubrene_nmr.csv", published: true }
            ] },
            calc: { updatedAt: "2026-08-26", records: [
              { name: "基态/激发态结构", type: "结构", value: "S0 与 S1 优化构型（B3LYP/6-31G*）", file: "calc/rubrene_s0s1.xyz", published: true },
              { name: "激发能", type: "数字", value: "2.35", unit: "eV", published: true },
              { name: "发射能", type: "数字", value: "2.15", unit: "eV", published: true },
              { name: "斯托克斯位移", type: "数字", value: "0.20", unit: "eV", published: true },
              { name: "跃迁偶极矩", type: "数字", value: "3.20", unit: "D", published: true },
              { name: "HOMO-LUMO", type: "数字", value: "HOMO -5.40 eV / LUMO -3.20 eV / 带隙 2.20 eV", unit: "eV", published: true },
              { name: "溶剂化自由能", type: "数字", value: "-0.32", unit: "eV", published: true },
              { name: "简正模式", type: "数字", value: "156", unit: "个", published: true },
              { name: "态密度", type: "谱图", value: "前线轨道态密度分布", file: "calc/rubrene_dos.dat", published: true }
            ] }
          }
        },
        {
          materialId: "OP-PENTACENE-0002", nameCn: "并五苯", nameEn: "Pentacene", formula: "C22H14",
          tag: "多环芳烃类有机小分子", safetyLevel: 1, status: "已发布", updatedAt: "2026-08-24",
          searchText: "Pentacene 135-48-8 有机半导体 p型",
          meta: [["分子编号 / 分子量", "CAS 135-48-8 · 278.35"], ["三维结构", "PDB / MOL 结构已归档"]],
          info: [["材料编号", "OP-PENTACENE-0002"], ["中文名称", "并五苯"], ["英文名称", "Pentacene"], ["分子式", "C22H14"], ["分子量", "278.35"], ["分子编号", "CAS 135-48-8"], ["材料子类", "多环芳烃类有机小分子"], ["三维结构", "pentacene.pdb（已归档）"], ["数据来源", "EXTERNAL 外源数据"]],
          datasets: {
            base: { updatedAt: "2026-08-24", records: [
              { name: "中英文名称", type: "字符", value: "并五苯 / Pentacene", published: true },
              { name: "分子编号", type: "字符", value: "CAS 135-48-8", published: true },
              { name: "分子式", type: "字符", value: "C22H14", published: true },
              { name: "分子量", type: "数字", value: "278.35", unit: "g/mol", published: true },
              { name: "三维结构", type: "结构", value: "并五苯分子三维结构模型", file: "mol/pentacene.pdb", published: true }
            ] },
            phys: { updatedAt: "2026-08-23", records: [
              { name: "相对密度", type: "数字", value: "1.33", unit: "g/cm³", published: true },
              { name: "熔点", type: "数字", value: ">300（分解）", unit: "°C", published: true },
              { name: "沸点", type: "数字", value: "待补充", unit: "°C", published: false }
            ] },
            spec: { updatedAt: "2026-08-22", records: [
              { name: "红外光谱", type: "谱图", value: "特征峰：3040 cm⁻¹、1460 cm⁻¹、900 cm⁻¹", file: "spec/pentacene_ir.csv", published: true },
              { name: "拉曼光谱", type: "谱图", value: "特征峰：1530 cm⁻¹、1370 cm⁻¹", file: "spec/pentacene_raman.csv", published: true }
            ] },
            calc: { updatedAt: "2026-08-21", records: [
              { name: "激发能", type: "数字", value: "2.10", unit: "eV", published: true },
              { name: "HOMO-LUMO", type: "数字", value: "HOMO -5.14 eV / LUMO -3.14 eV / 带隙 2.00 eV", unit: "eV", published: true },
              { name: "跃迁偶极矩", type: "数字", value: "2.60", unit: "D", published: true }
            ] }
          }
        },
        {
          materialId: "OP-ALQ3-0003", nameCn: "三(8-羟基喹啉)铝", nameEn: "Tris(8-hydroxyquinolinato)aluminium", formula: "C27H18AlN3O3",
          tag: "金属配合物类发光材料", safetyLevel: 1, status: "已发布", updatedAt: "2026-08-19",
          searchText: "Alq3 2085-33-8 OLED 绿光 发光",
          meta: [["分子编号 / 分子量", "CAS 2085-33-8 · 459.43"], ["三维结构", "PDB / MOL 结构已归档"]],
          info: [["材料编号", "OP-ALQ3-0003"], ["中文名称", "三(8-羟基喹啉)铝"], ["英文名称", "Tris(8-hydroxyquinolinato)aluminium"], ["分子式", "C27H18AlN3O3"], ["分子量", "459.43"], ["分子编号", "CAS 2085-33-8"], ["材料子类", "金属配合物类发光材料"], ["三维结构", "alq3.pdb（已归档）"], ["数据来源", "EXTERNAL 外源数据"]],
          datasets: {
            base: { updatedAt: "2026-08-19", records: [
              { name: "中英文名称", type: "字符", value: "三(8-羟基喹啉)铝 / Alq3", published: true },
              { name: "分子编号", type: "字符", value: "CAS 2085-33-8", published: true },
              { name: "分子式", type: "字符", value: "C27H18AlN3O3", published: true },
              { name: "分子量", type: "数字", value: "459.43", unit: "g/mol", published: true },
              { name: "三维结构", type: "结构", value: "Alq3 分子三维结构模型", file: "mol/alq3.pdb", published: true }
            ] },
            phys: { updatedAt: "2026-08-18", records: [
              { name: "相对密度", type: "数字", value: "1.35", unit: "g/cm³", published: true },
              { name: "熔点", type: "数字", value: "413", unit: "°C", published: true },
              { name: "沸点", type: "数字", value: "待补充", unit: "°C", published: false }
            ] },
            spec: { updatedAt: "2026-08-17", records: [
              { name: "红外光谱", type: "谱图", value: "特征峰：1580 cm⁻¹、1490 cm⁻¹、750 cm⁻¹", file: "spec/alq3_ir.csv", published: true },
              { name: "核磁共振谱", type: "谱图", value: "¹H NMR (DMSO-d6) δ 7.0–8.6 (m, 18H)", file: "spec/alq3_nmr.csv", published: true }
            ] },
            calc: { updatedAt: "2026-08-16", records: [
              { name: "激发能", type: "数字", value: "2.70", unit: "eV", published: true },
              { name: "发射能", type: "数字", value: "2.40", unit: "eV", published: true },
              { name: "HOMO-LUMO", type: "数字", value: "HOMO -5.80 eV / LUMO -3.00 eV / 带隙 2.80 eV", unit: "eV", published: true },
              { name: "斯托克斯位移", type: "数字", value: "0.30", unit: "eV", published: true }
            ] }
          }
        },
        {
          materialId: "OP-C60-0004", nameCn: "富勒烯 C60", nameEn: "Fullerene C60", formula: "C60",
          tag: "富勒烯类电子受体", safetyLevel: 1, status: "已发布", updatedAt: "2026-08-14",
          searchText: "C60 99685-96-8 富勒烯 电子受体",
          meta: [["分子编号 / 分子量", "CAS 99685-96-8 · 720.64"], ["三维结构", "PDB / MOL 结构已归档"]],
          info: [["材料编号", "OP-C60-0004"], ["中文名称", "富勒烯 C60"], ["英文名称", "Fullerene C60"], ["分子式", "C60"], ["分子量", "720.64"], ["分子编号", "CAS 99685-96-8"], ["材料子类", "富勒烯类电子受体"], ["三维结构", "c60.pdb（已归档）"], ["数据来源", "EXTERNAL 外源数据"]],
          datasets: {
            base: { updatedAt: "2026-08-14", records: [
              { name: "中英文名称", type: "字符", value: "富勒烯 C60 / Fullerene C60", published: true },
              { name: "分子编号", type: "字符", value: "CAS 99685-96-8", published: true },
              { name: "分子式", type: "字符", value: "C60", published: true },
              { name: "分子量", type: "数字", value: "720.64", unit: "g/mol", published: true },
              { name: "三维结构", type: "结构", value: "C60 笼状分子三维结构模型", file: "mol/c60.pdb", published: true }
            ] },
            phys: { updatedAt: "2026-08-13", records: [
              { name: "相对密度", type: "数字", value: "1.65", unit: "g/cm³", published: true },
              { name: "熔点", type: "数字", value: ">280（升华）", unit: "°C", published: true }
            ] },
            spec: { updatedAt: "2026-08-12", records: [
              { name: "红外光谱", type: "谱图", value: "特征峰：1429 cm⁻¹、1183 cm⁻¹、577 cm⁻¹、527 cm⁻¹（四个 F1u 活性模）", file: "spec/c60_ir.csv", published: true },
              { name: "拉曼光谱", type: "谱图", value: "Ag(2) 呼吸模 1469 cm⁻¹", file: "spec/c60_raman.csv", published: true }
            ] }
          }
        },
        {
          materialId: "OP-PDI-0005", nameCn: "苝二酰亚胺", nameEn: "Perylene diimide", formula: "C24H10N2O4",
          tag: "苝酰亚胺类电子受体", safetyLevel: 1, status: "已发布", updatedAt: "2026-08-11",
          searchText: "PDI 苝二酰亚胺 n型 电子传输",
          meta: [["分子编号 / 分子量", "CAS 81-33-4 · 390.35"], ["三维结构", "PDB / MOL 结构已归档"]],
          info: [["材料编号", "OP-PDI-0005"], ["中文名称", "苝二酰亚胺"], ["英文名称", "Perylene diimide"], ["分子式", "C24H10N2O4"], ["分子量", "390.35"], ["分子编号", "CAS 81-33-4"], ["材料子类", "苝酰亚胺类电子受体"], ["三维结构", "pdi.pdb（已归档）"], ["数据来源", "EXTERNAL 外源数据"]],
          datasets: {
            base: { updatedAt: "2026-08-11", records: [
              { name: "中英文名称", type: "字符", value: "苝二酰亚胺 / Perylene diimide", published: true },
              { name: "分子编号", type: "字符", value: "CAS 81-33-4", published: true },
              { name: "分子式", type: "字符", value: "C24H10N2O4", published: true },
              { name: "分子量", type: "数字", value: "390.35", unit: "g/mol", published: true },
              { name: "三维结构", type: "结构", value: "PDI 分子三维结构模型", file: "mol/pdi.pdb", published: true }
            ] },
            phys: { updatedAt: "2026-08-10", records: [
              { name: "相对密度", type: "数字", value: "1.62", unit: "g/cm³", published: true },
              { name: "熔点", type: "数字", value: ">400", unit: "°C", published: true }
            ] },
            calc: { updatedAt: "2026-08-09", records: [
              { name: "HOMO-LUMO", type: "数字", value: "HOMO -6.50 eV / LUMO -4.00 eV / 带隙 2.50 eV", unit: "eV", published: true },
              { name: "激发能", type: "数字", value: "2.60", unit: "eV", published: true },
              { name: "跃迁偶极矩", type: "数字", value: "4.10", unit: "D", published: true }
            ] }
          }
        },
        {
          materialId: "OP-CBP-0006", nameCn: "4,4'-双(N-咔唑基)联苯", nameEn: "4,4'-Bis(N-carbazolyl)-1,1'-biphenyl", formula: "C42H28N2",
          tag: "咔唑类主体材料", safetyLevel: 2, status: "已发布", updatedAt: "2026-08-08",
          searchText: "CBP 58328-31-7 主体材料 磷光",
          meta: [["分子编号 / 分子量", "CAS 58328-31-7 · 584.71"], ["三维结构", "PDB / MOL 结构已归档"]],
          info: [["材料编号", "OP-CBP-0006"], ["中文名称", "4,4'-双(N-咔唑基)联苯"], ["英文名称", "4,4'-Bis(N-carbazolyl)-1,1'-biphenyl"], ["分子式", "C42H28N2"], ["分子量", "584.71"], ["分子编号", "CAS 58328-31-7"], ["材料子类", "咔唑类主体材料"], ["三维结构", "cbp.pdb（已归档）"], ["数据来源", "CALC 计算数据"]],
          datasets: {
            base: { updatedAt: "2026-08-08", records: [
              { name: "中英文名称", type: "字符", value: "4,4'-双(N-咔唑基)联苯 / CBP", published: true },
              { name: "分子编号", type: "字符", value: "CAS 58328-31-7", published: true },
              { name: "分子式", type: "字符", value: "C42H28N2", published: true },
              { name: "分子量", type: "数字", value: "584.71", unit: "g/mol", published: true },
              { name: "三维结构", type: "结构", value: "CBP 分子三维结构模型", file: "mol/cbp.pdb", published: true }
            ] },
            calc: { updatedAt: "2026-08-07", records: [
              { name: "HOMO-LUMO", type: "数字", value: "HOMO -6.10 eV / LUMO -2.60 eV / 带隙 3.50 eV", unit: "eV", published: true },
              { name: "三重态能级", type: "数字", value: "2.60", unit: "eV", published: true },
              { name: "激发能", type: "数字", value: "3.50", unit: "eV", published: true }
            ] }
          }
        }
      ],
      "lowdim-database-electrolyte": [
        {
          materialId: "ELE-LLZO-0001", nameCn: "锂镧锆氧", nameEn: "Lithium lanthanum zirconium oxide", formula: "Li7La3Zr2O12",
          tag: "石榴石型固态无机电解质", safetyLevel: 1, status: "已发布", updatedAt: "2026-08-29",
          searchText: "LLZO Li La Zr O 氧化物 石榴石 离子电导",
          meta: [["晶系 / 空间群", "立方晶系 · Ia-3d"], ["晶格常数", "a = b = c = 12.90 Å"]],
          info: [["材料编号", "ELE-LLZO-0001"], ["中文名称", "锂镧锆氧"], ["英文名称", "Lithium lanthanum zirconium oxide"], ["化学式", "Li7La3Zr2O12"], ["材料子类", "石榴石型固态无机电解质"], ["晶系", "立方晶系"], ["空间群", "Ia-3d"], ["晶格常数", "a = b = c = 12.90 Å"], ["晶格夹角", "α = β = γ = 90°"], ["数据来源", "CALC 计算数据"]],
          datasets: {
            sino: { updatedAt: "2026-08-29", records: [
              { name: "晶体结构", type: "结构", value: "立方相 Li7La3Zr2O12 晶胞（Ia-3d，含 8 个化学式单元）", file: "struct/LLZO_cubic.cif", method: "M-VASP-PBE-500", published: true },
              { name: "形成能", type: "数字", value: "-2.84", unit: "eV/atom", method: "M-VASP-PBE-500", published: true },
              { name: "费米能级", type: "数字", value: "3.12", unit: "eV", method: "M-VASP-PBE-500", published: true },
              { name: "带隙", type: "数字", value: "5.90", unit: "eV", method: "M-VASP-PBE-500", published: true },
              { name: "能带/态密度", type: "谱图", value: "价带顶由 O-p 主导，导带低由 Zr-d 主导；带隙 5.90 eV，电子绝缘", file: "dat/band/LLZO_band.dat", method: "M-VASP-PBE-500", published: true },
              { name: "XRD", type: "谱图", value: "主要衍射峰 2θ = 16.7°、25.6°、30.4°、34.2°（立方石榴石相）", file: "xrd/LLZO_xrd.csv", published: true },
              { name: "XAS", type: "谱图", value: "Zr L3 边吸收谱，白线位置 2226 eV", file: "xas/LLZO_xas.dat", published: true }
            ] }
          }
        },
        {
          materialId: "ELE-LGPS-0002", nameCn: "硫代磷酸锗锂", nameEn: "Lithium germanium thiophosphate", formula: "Li10GeP2S12",
          tag: "硫化物型固态无机电解质", safetyLevel: 1, status: "已发布", updatedAt: "2026-08-26",
          searchText: "LGPS Li Ge P S 硫化物 超离子导体",
          meta: [["晶系 / 空间群", "四方晶系 · P4₂/nmc"], ["晶格常数", "a = b = 8.72 Å"]],
          info: [["材料编号", "ELE-LGPS-0002"], ["中文名称", "硫代磷酸锗锂"], ["英文名称", "Lithium germanium thiophosphate"], ["化学式", "Li10GeP2S12"], ["材料子类", "硫化物型固态无机电解质"], ["晶系", "四方晶系"], ["空间群", "P4₂/nmc"], ["晶格常数", "a = b = 8.72 Å，c = 12.63 Å"], ["晶格夹角", "α = β = γ = 90°"], ["数据来源", "CALC 计算数据"]],
          datasets: {
            sino: { updatedAt: "2026-08-26", records: [
              { name: "晶体结构", type: "结构", value: "四方相 Li10GeP2S12 晶胞（P4₂/nmc，1D 锂离子通道）", file: "struct/LGPS_tetragonal.cif", method: "M-VASP-PBE-500", published: true },
              { name: "形成能", type: "数字", value: "-1.96", unit: "eV/atom", method: "M-VASP-PBE-500", published: true },
              { name: "带隙", type: "数字", value: "2.40", unit: "eV", method: "M-VASP-PBE-500", published: true },
              { name: "能带/态密度", type: "谱图", value: "S-p 主导价带顶；带隙 2.40 eV", file: "dat/band/LGPS_band.dat", method: "M-VASP-PBE-500", published: true },
              { name: "XRD", type: "谱图", value: "主要衍射峰 2θ = 20.2°、29.6°、33.8°", file: "xrd/LGPS_xrd.csv", published: true },
              { name: "XAS", type: "谱图", value: "Ge K 边吸收谱，白线位置 11103 eV", file: "xas/LGPS_xas.dat", published: false }
            ] }
          }
        },
        {
          materialId: "ELE-LI3YCL6-0003", nameCn: "三氯化钇锂", nameEn: "Lithium yttrium chloride", formula: "Li3YCl6",
          tag: "卤化物型固态无机电解质", safetyLevel: 2, status: "已发布", updatedAt: "2026-08-22",
          searchText: "Li3YCl6 卤化物 氯化物 卤素",
          meta: [["晶系 / 空间群", "三方晶系 · P-3m1"], ["晶格常数", "a = b = 6.35 Å"]],
          info: [["材料编号", "ELE-LI3YCL6-0003"], ["中文名称", "三氯化钇锂"], ["英文名称", "Lithium yttrium chloride"], ["化学式", "Li3YCl6"], ["材料子类", "卤化物型固态无机电解质"], ["晶系", "三方晶系"], ["空间群", "P-3m1"], ["晶格常数", "a = b = 6.35 Å，c = 6.10 Å"], ["晶格夹角", "α = β = 90°，γ = 120°"], ["数据来源", "CALC 计算数据"]],
          datasets: {
            sino: { updatedAt: "2026-08-22", records: [
              { name: "晶体结构", type: "结构", value: "三方相 Li3YCl6 晶胞（P-3m1，YCl6 八面体共边）", file: "struct/Li3YCl6_trigonal.cif", method: "M-VASP-PBE-500", published: true },
              { name: "形成能", type: "数字", value: "-2.31", unit: "eV/atom", method: "M-VASP-PBE-500", published: true },
              { name: "带隙", type: "数字", value: "4.20", unit: "eV", method: "M-VASP-PBE-500", published: true },
              { name: "XRD", type: "谱图", value: "主要衍射峰 2θ = 15.4°、30.9°、35.6°", file: "xrd/Li3YCl6_xrd.csv", published: false }
            ] }
          }
        },
        {
          materialId: "ELE-EC-0004", nameCn: "碳酸乙烯酯", nameEn: "Ethylene carbonate", formula: "C3H4O3",
          tag: "环状碳酸酯类有机电解液", safetyLevel: 1, status: "已发布", updatedAt: "2026-08-20",
          searchText: "EC 96-49-1 碳酸酯 电解液 溶剂",
          meta: [["分子编号 / 摩尔质量", "CAS 96-49-1 · 88.06"], ["介电常数 / 沸点", "89.6 · 248 °C"]],
          info: [["材料编号", "ELE-EC-0004"], ["中文名称", "碳酸乙烯酯"], ["英文名称", "Ethylene carbonate"], ["化学式", "C3H4O3"], ["材料子类", "环状碳酸酯类有机电解液"], ["分子编号", "CAS 96-49-1"], ["摩尔质量", "88.06 g/mol"], ["数据来源", "EXTERNAL 外源数据"]],
          datasets: {
            liquid: { updatedAt: "2026-08-20", records: [
              { name: "基础信息", type: "字符", value: "环状碳酸酯溶剂，常与 DMC/EMC 复配用于锂离子电池电解液", published: true },
              { name: "物性数据", type: "字符", value: "熔点 36.4 °C；沸点 248 °C；密度 1.32 g/cm³；黏度 1.90 mPa·s（40 °C）；介电常数 89.6", published: true },
              { name: "表征图谱", type: "谱图", value: "红外与拉曼特征峰已归档", file: "spec/EC_spectra.csv", published: true },
              { name: "安全信息", type: "字符", value: "闪点 143 °C；刺激性物质；需避光密封储存", published: true },
              { name: "HOMO-LUMO", type: "数字", value: "HOMO -8.10 eV / LUMO 0.90 eV", unit: "eV", published: true },
              { name: "电荷分布", type: "字符", value: "羰基氧带最大负电荷（-0.52 e），为 Li⁺ 主要配位位点", published: true },
              { name: "溶剂化能", type: "数字", value: "-1.85", unit: "eV", published: true }
            ] }
          }
        },
        {
          materialId: "ELE-PEO-0005", nameCn: "聚环氧乙烷", nameEn: "Poly(ethylene oxide)", formula: "(C2H4O)n",
          tag: "醚类固态有机电解质", safetyLevel: 1, status: "已发布", updatedAt: "2026-08-18",
          searchText: "PEO 聚环氧乙烷 聚合物电解质 醚",
          meta: [["数均分子量", "Mn ≈ 1.0 × 10⁶"], ["玻璃化转变温度", "-60 °C"]],
          info: [["材料编号", "ELE-PEO-0005"], ["中文名称", "聚环氧乙烷"], ["英文名称", "Poly(ethylene oxide)"], ["化学式", "(C2H4O)n"], ["材料子类", "醚类固态有机电解质"], ["数均分子量", "Mn ≈ 1.0 × 10⁶ g/mol"], ["数据来源", "CALC 计算数据"]],
          datasets: {
            sorg: { updatedAt: "2026-08-18", records: [
              { name: "单体信息", type: "字符", value: "重复单元 -CH2-CH2-O-，主链醚氧为 Li⁺ 配位位点", published: true },
              { name: "摩尔体积", type: "数字", value: "38.6", unit: "cm³/mol", method: "M-DFT-B3LYP-6-31G*", published: true },
              { name: "密度", type: "数字", value: "1.13", unit: "g/cm³", published: true },
              { name: "玻璃化转变温度", type: "数字", value: "-60", unit: "°C", published: true },
              { name: "电导率", type: "数字", value: "1.2 × 10⁻⁶", unit: "S/cm", published: true },
              { name: "摩尔热容", type: "数字", value: "84.5", unit: "J/(mol·K)", published: true },
              { name: "结合能", type: "数字", value: "-1.42", unit: "eV（Li⁺-醚氧）", method: "M-DFT-B3LYP-6-31G*", published: true }
            ] }
          }
        },
        {
          materialId: "ELE-SN-0006", nameCn: "丁二腈", nameEn: "Succinonitrile", formula: "C4H4N2",
          tag: "腈类固态有机电解质", safetyLevel: 2, status: "已发布", updatedAt: "2026-08-16",
          searchText: "丁二腈 110-61-2 腈类 塑晶",
          meta: [["分子编号 / 摩尔质量", "CAS 110-61-2 · 80.09"], ["玻璃化转变温度", "-35 °C"]],
          info: [["材料编号", "ELE-SN-0006"], ["中文名称", "丁二腈"], ["英文名称", "Succinonitrile"], ["化学式", "C4H4N2"], ["材料子类", "腈类固态有机电解质"], ["分子编号", "CAS 110-61-2"], ["摩尔质量", "80.09 g/mol"], ["数据来源", "CALC 计算数据"]],
          datasets: {
            sorg: { updatedAt: "2026-08-16", records: [
              { name: "单体信息", type: "字符", value: "塑晶型固态电解质基体，腈基氮为 Li⁺ 配位位点", published: true },
              { name: "摩尔体积", type: "数字", value: "72.4", unit: "cm³/mol", published: true },
              { name: "密度", type: "数字", value: "1.02", unit: "g/cm³", published: true },
              { name: "玻璃化转变温度", type: "数字", value: "-35", unit: "°C", published: true },
              { name: "电导率", type: "数字", value: "2.7 × 10⁻⁴", unit: "S/cm", published: true },
              { name: "结合能", type: "数字", value: "-1.68", unit: "eV（Li⁺-腈氮）", published: false }
            ] }
          }
        }
      ],
      "lowdim-database-mlff": [
        {
          materialId: "MLF-H2O-0001", nameCn: "水", nameEn: "Water", formula: "H2O",
          tag: "单分子数据集", safetyLevel: 1, status: "已发布", updatedAt: "2026-08-30",
          searchText: "H2O 水 单分子 双分子 团簇",
          meta: [["体系类型", "单分子 / 双分子 / 多分子团簇"], ["采样构象数", "12,000"]],
          info: [["材料编号", "MLF-H2O-0001"], ["中文名称", "水"], ["英文名称", "Water"], ["化学式", "H2O"], ["材料子类", "单分子数据集"], ["体系类型", "单分子 / 双分子 / 多分子团簇"], ["数据来源", "CALC 计算数据"]],
          datasets: {
            base: { updatedAt: "2026-08-30", records: [
              { name: "原子电荷", type: "数字", value: "O -0.68 e / H +0.34 e（Mulliken）", unit: "e", method: "M-DFT-B3LYP-6-31G*", published: true },
              { name: "偶极矩", type: "数字", value: "1.85", unit: "D", method: "M-DFT-B3LYP-6-31G*", published: true },
              { name: "极化率", type: "数字", value: "1.45", unit: "Å³", published: true },
              { name: "色散系数", type: "数字", value: "C6 = 45.4", unit: "a.u.", published: true },
              { name: "单分子能量", type: "数字", value: "-76.42", unit: "eV", method: "M-DFT-B3LYP-6-31G*", published: true },
              { name: "相互作用能", type: "数字", value: "-0.21（二聚体）", unit: "eV", published: true },
              { name: "原子受力", type: "谱图", value: "12,000 帧构象的原子受力张量", file: "traj/water_forces.h5", method: "M-DFT-B3LYP-6-31G*", published: true }
            ] }
          }
        },
        {
          materialId: "MLF-MEOH-0002", nameCn: "甲醇", nameEn: "Methanol", formula: "CH4O",
          tag: "单分子数据集", safetyLevel: 1, status: "已发布", updatedAt: "2026-08-27",
          searchText: "CH4O 甲醇 醇类 小分子",
          meta: [["体系类型", "单分子 / 双分子团簇"], ["采样构象数", "8,600"]],
          info: [["材料编号", "MLF-MEOH-0002"], ["中文名称", "甲醇"], ["英文名称", "Methanol"], ["化学式", "CH4O"], ["材料子类", "单分子数据集"], ["体系类型", "单分子 / 双分子团簇"], ["数据来源", "CALC 计算数据"]],
          datasets: {
            base: { updatedAt: "2026-08-27", records: [
              { name: "原子电荷", type: "数字", value: "O -0.62 e / C +0.28 e / H +0.06~0.34 e", unit: "e", published: true },
              { name: "偶极矩", type: "数字", value: "1.70", unit: "D", published: true },
              { name: "极化率", type: "数字", value: "3.28", unit: "Å³", published: true },
              { name: "单分子能量", type: "数字", value: "-3.21", unit: "eV", method: "M-DFT-B3LYP-6-31G*", published: true },
              { name: "原子受力", type: "谱图", value: "8,600 帧构象的原子受力张量", file: "traj/methanol_forces.h5", published: true }
            ] },
            small: { updatedAt: "2026-08-26", records: [
              { name: "醚类小分子", type: "字符", value: "甲醇羟基可与醚氧形成氢键，纳入醇/醚类小分子训练子集", published: true },
              { name: "构象采样", type: "谱图", value: "扭转构象扫描（C-O 二面角 0°–360°）", file: "traj/methanol_torsion.xyz", published: true },
              { name: "能量与受力", type: "谱图", value: "构象能量曲线与原子受力（MP2/cc-pVTZ）", file: "traj/methanol_energy.dat", published: true }
            ] }
          }
        },
        {
          materialId: "MLF-ETHER-0003", nameCn: "乙醚", nameEn: "Diethyl ether", formula: "C4H10O",
          tag: "醚类有机小分子", safetyLevel: 1, status: "已发布", updatedAt: "2026-08-24",
          searchText: "C4H10O 乙醚 醚类 小分子",
          meta: [["体系类型", "醚类小分子构象采样"], ["采样构象数", "15,200"]],
          info: [["材料编号", "MLF-ETHER-0003"], ["中文名称", "乙醚"], ["英文名称", "Diethyl ether"], ["化学式", "C4H10O"], ["材料子类", "醚类有机小分子"], ["体系类型", "醚类小分子构象采样"], ["数据来源", "CALC 计算数据"]],
          datasets: {
            small: { updatedAt: "2026-08-24", records: [
              { name: "醚类小分子", type: "字符", value: "含 C-O-C 醚键，作为醚类力场训练代表分子", published: true },
              { name: "构象采样", type: "谱图", value: "15,200 个构象（含反式/旁式异构）", file: "traj/ether_conformers.xyz", published: true },
              { name: "能量与受力", type: "谱图", value: "相对能量范围 0–0.42 eV；原子受力 RMS 0.08 eV/Å", file: "traj/ether_energy_forces.h5", method: "M-DFT-B3LYP-6-31G*", published: true }
            ] }
          }
        },
        {
          materialId: "MLF-NMA-0004", nameCn: "N-甲基乙酰胺", nameEn: "N-methylacetamide", formula: "C3H7NO",
          tag: "酰胺类有机小分子", safetyLevel: 1, status: "已发布", updatedAt: "2026-08-22",
          searchText: "C3H7NO NMA 酰胺 肽键 小分子",
          meta: [["体系类型", "酰胺类小分子构象采样"], ["采样构象数", "11,400"]],
          info: [["材料编号", "MLF-NMA-0004"], ["中文名称", "N-甲基乙酰胺"], ["英文名称", "N-methylacetamide"], ["化学式", "C3H7NO"], ["材料子类", "酰胺类有机小分子"], ["体系类型", "酰胺类小分子构象采样"], ["数据来源", "CALC 计算数据"]],
          datasets: {
            small: { updatedAt: "2026-08-22", records: [
              { name: "酰胺类小分子", type: "字符", value: "含肽键（-CO-NH-）模型分子，用于蛋白质力场参数训练", published: true },
              { name: "构象采样", type: "谱图", value: "11,400 个构象（cis/trans 肽键构型）", file: "traj/nma_conformers.xyz", published: true },
              { name: "能量与受力", type: "谱图", value: "肽键旋转势垒 0.83 eV；原子受力张量", file: "traj/nma_energy_forces.h5", published: true }
            ] }
          }
        },
        {
          materialId: "MLF-PEG-0005", nameCn: "聚乙二醇", nameEn: "Poly(ethylene glycol)", formula: "(C2H4O)n",
          tag: "高分子片段", safetyLevel: 2, status: "已发布", updatedAt: "2026-08-20",
          searchText: "PEG 聚乙二醇 高分子 片段 重复单元",
          meta: [["体系类型", "高分子片段（重复单元）"], ["片段构象数", "9,800"]],
          info: [["材料编号", "MLF-PEG-0005"], ["中文名称", "聚乙二醇"], ["英文名称", "Poly(ethylene glycol)"], ["化学式", "(C2H4O)n"], ["材料子类", "高分子片段"], ["体系类型", "高分子片段（重复单元）"], ["数据来源", "CALC 计算数据"]],
          datasets: {
            poly: { updatedAt: "2026-08-20", records: [
              { name: "高分子片段", type: "字符", value: "以 -CH2-CH2-O- 重复单元（n = 2–10）构建片段模型", published: true },
              { name: "片段能量", type: "谱图", value: "9,800 个片段的能量（聚合度 2–10）", file: "poly/peg_fragment_energy.h5", method: "M-DFT-B3LYP-6-31G*", published: true },
              { name: "相互作用能", type: "数字", value: "-0.18", unit: "eV（片段间）", published: true }
            ] }
          }
        },
        {
          materialId: "MLF-GLYGLY-0006", nameCn: "甘氨酰甘氨酸", nameEn: "Glycylglycine", formula: "C4H8N2O3",
          tag: "蛋白质二肽", safetyLevel: 1, status: "已发布", updatedAt: "2026-08-18",
          searchText: "Gly-Gly 二肽 蛋白质 构象",
          meta: [["体系类型", "蛋白质二肽构象采样"], ["采样构象数", "18,600"]],
          info: [["材料编号", "MLF-GLYGLY-0006"], ["中文名称", "甘氨酰甘氨酸"], ["英文名称", "Glycylglycine"], ["化学式", "C4H8N2O3"], ["材料子类", "蛋白质二肽"], ["体系类型", "蛋白质二肽构象采样"], ["数据来源", "CALC 计算数据"]],
          datasets: {
            poly: { updatedAt: "2026-08-18", records: [
              { name: "蛋白质构象", type: "谱图", value: "18,600 个 (φ, ψ) 二面角组合构象（Ramachandran 采样）", file: "poly/glygly_conformers.xyz", published: true },
              { name: "片段能量", type: "谱图", value: "构象能量面（相对能量 0–1.24 eV）", file: "poly/glygly_energy_surface.dat", published: true },
              { name: "相互作用能", type: "数字", value: "-0.46", unit: "eV（分子内氢键）", published: true }
            ] }
          }
        }
      ],
      "lowdim-database-catalyst": [
        {
          materialId: "CAT-ALCU-0001", nameCn: "铝铜合金", nameEn: "Aluminium copper alloy", formula: "AlCu",
          tag: "二元合金", safetyLevel: 1, status: "已发布", updatedAt: "2026-08-28",
          searchText: "AlCu 铝铜 二元合金 铜基",
          meta: [["晶系 / 空间群", "单斜晶系 · C2/m"], ["点群 / 体系类型", "2/m · 二元合金"]],
          info: [["材料编号", "CAT-ALCU-0001"], ["中文名称", "铝铜合金"], ["英文名称", "Aluminium copper alloy"], ["化学式", "AlCu"], ["材料子类", "二元合金"], ["晶系", "单斜晶系"], ["空间群", "C2/m"], ["点群", "2/m"], ["数据来源", "CALC 计算数据"]],
          datasets: {
            elem: { updatedAt: "2026-08-28", records: [
              { name: "周期数和族数", type: "字符", value: "Al：3 周期 ⅢA 族；Cu：4 周期 ⅠB 族", published: true },
              { name: "元素电荷", type: "数字", value: "Al 13 / Cu 29", unit: "e", published: true },
              { name: "相对原子质量", type: "数字", value: "Al 26.982 / Cu 63.546", unit: "u", published: true },
              { name: "原子半径", type: "数字", value: "Al 143 / Cu 128", unit: "pm", published: true },
              { name: "价电子数", type: "数字", value: "Al 3 / Cu 1", published: true },
              { name: "d/p 轨道电子数", type: "数字", value: "Al p 1 / Cu d 10", published: true },
              { name: "第一电离能", type: "数字", value: "Al 577.5 / Cu 745.5", unit: "kJ/mol", published: true },
              { name: "电子亲和势", type: "数字", value: "Al 42.5 / Cu 118.4", unit: "kJ/mol", published: true },
              { name: "电负性", type: "数字", value: "Al 1.61 / Cu 1.90", published: true },
              { name: "d 带中心", type: "数字", value: "-2.34", unit: "eV", method: "M-VASP-PBE-500", published: true }
            ] },
            struct: { updatedAt: "2026-08-27", records: [
              { name: "形貌结构图", type: "图片", value: "AlCu 合金表面原子排布与活性位点分布", file: "img/AlCu_morphology.png", published: true },
              { name: "点群和空间群", type: "字符", value: "点群 2/m；空间群 C2/m", published: true },
              { name: "活性位点配位数", type: "数字", value: "Al 位点 8；Cu 位点 11", published: true },
              { name: "对称性函数", type: "数字", value: "平均广义配位数 5.62", published: true }
            ] },
            alloy: { updatedAt: "2026-08-26", records: [
              { name: "127种二元合金", type: "字符", value: "AlCu 属 Materials Project 筛选的铜基二元合金集合", published: true },
              { name: "5种铜表面", type: "字符", value: "Cu(111) 表面，Al 掺杂覆盖度 0.11 ML", published: true },
              { name: "6种中间产物", type: "字符", value: "CO2 还原中间产物 *COOH、*CO、*CHO、*COH、*CH2O、*OCH3", published: true },
              { name: "吸附构型", type: "结构", value: "各中间产物的最优吸附构型（POSCAR）", file: "poscar/AlCu_111_adsorbates.zip", published: true },
              { name: "吸附能", type: "数字", value: "*CO -0.72 eV；*COOH -0.48 eV；*CHO -1.06 eV", unit: "eV", method: "M-VASP-PBE-500", published: true }
            ] },
            sys: { updatedAt: "2026-08-25", records: [
              { name: "费米面位置", type: "数字", value: "相对真空能级 -4.35", unit: "eV", published: true },
              { name: "掺杂形成能", type: "数字", value: "-0.18", unit: "eV", published: true },
              { name: "体系磁矩", type: "数字", value: "0.00", unit: "μB", published: true },
              { name: "反应路径", type: "谱图", value: "CO2 → *COOH → *CO → *CHO → *CH2O → CH3OH", file: "dat/AlCu_pathway.dat", published: true },
              { name: "催化性能", type: "数字", value: "CO2 还原极限电位 -0.72 V；CH3OH 选择性 61%", published: false }
            ] }
          }
        },
        {
          materialId: "CAT-CU111-0002", nameCn: "铜(111)表面", nameEn: "Copper (111) surface", formula: "Cu",
          tag: "单晶表面", safetyLevel: 1, status: "已发布", updatedAt: "2026-08-24",
          searchText: "Cu111 铜 表面 单晶 基底",
          meta: [["晶系 / 空间群", "立方晶系 · Fm-3m"], ["点群 / 体系类型", "m-3m · 单晶表面"]],
          info: [["材料编号", "CAT-CU111-0002"], ["中文名称", "铜(111)表面"], ["英文名称", "Copper (111) surface"], ["化学式", "Cu"], ["材料子类", "单晶表面"], ["晶系", "立方晶系"], ["空间群", "Fm-3m"], ["点群", "m-3m"], ["数据来源", "CALC 计算数据"]],
          datasets: {
            elem: { updatedAt: "2026-08-24", records: [
              { name: "周期数和族数", type: "字符", value: "Cu：4 周期 ⅠB 族", published: true },
              { name: "元素电荷", type: "数字", value: "29", unit: "e", published: true },
              { name: "相对原子质量", type: "数字", value: "63.546", unit: "u", published: true },
              { name: "原子半径", type: "数字", value: "128", unit: "pm", published: true },
              { name: "价电子数", type: "数字", value: "1", published: true },
              { name: "d 轨道电子数", type: "数字", value: "10", published: true },
              { name: "第一电离能", type: "数字", value: "745.5", unit: "kJ/mol", published: true },
              { name: "电子亲和势", type: "数字", value: "118.4", unit: "kJ/mol", published: true },
              { name: "电负性", type: "数字", value: "1.90", published: true },
              { name: "d 带中心", type: "数字", value: "-2.67", unit: "eV", method: "M-VASP-PBE-500", published: true }
            ] },
            struct: { updatedAt: "2026-08-23", records: [
              { name: "形貌结构图", type: "图片", value: "Cu(111) 六方密排表面与台阶位点示意", file: "img/Cu111_surface.png", published: true },
              { name: "点群和空间群", type: "字符", value: "点群 m-3m；空间群 Fm-3m", published: true },
              { name: "活性位点配位数", type: "数字", value: "顶层 Cu 配位数 9（密排六方）", published: true },
              { name: "对称性函数", type: "数字", value: "平均广义配位数 5.42", published: true }
            ] },
            sac: { updatedAt: "2026-08-22", records: [
              { name: "41种掺杂元素", type: "字符", value: "Cu(111) 上 41 种金属单原子掺杂位点", published: true },
              { name: "5种铜表面", type: "字符", value: "Cu(100)/(110)/(111)/(210)/(411) 五种表面", published: true },
              { name: "6种中间产物", type: "字符", value: "*COOH、*CO、*CHO、*COH、*CH2O、*OCH3", published: true },
              { name: "吸附能", type: "数字", value: "*CO -0.58 eV；*COOH -0.41 eV", unit: "eV", method: "M-VASP-PBE-500", published: true }
            ] },
            sys: { updatedAt: "2026-08-21", records: [
              { name: "费米面位置", type: "数字", value: "相对真空能级 -4.72", unit: "eV", published: true },
              { name: "体系磁矩", type: "数字", value: "0.00", unit: "μB", published: true },
              { name: "反应路径", type: "谱图", value: "CO2 → *COOH → *CO 路径", file: "dat/Cu111_pathway.dat", published: true }
            ] }
          }
        },
        {
          materialId: "CAT-AGCU-0003", nameCn: "银铜合金", nameEn: "Silver copper alloy", formula: "AgCu",
          tag: "二元合金", safetyLevel: 1, status: "已发布", updatedAt: "2026-08-19",
          searchText: "AgCu 银铜 二元合金 铜基",
          meta: [["晶系 / 空间群", "立方晶系 · Fm-3m"], ["点群 / 体系类型", "m-3m · 二元合金"]],
          info: [["材料编号", "CAT-AGCU-0003"], ["中文名称", "银铜合金"], ["英文名称", "Silver copper alloy"], ["化学式", "AgCu"], ["材料子类", "二元合金"], ["晶系", "立方晶系"], ["空间群", "Fm-3m"], ["点群", "m-3m"], ["数据来源", "CALC 计算数据"]],
          datasets: {
            elem: { updatedAt: "2026-08-19", records: [
              { name: "周期数和族数", type: "字符", value: "Ag：5 周期 ⅠB 族；Cu：4 周期 ⅠB 族", published: true },
              { name: "元素电荷", type: "数字", value: "Ag 47 / Cu 29", unit: "e", published: true },
              { name: "相对原子质量", type: "数字", value: "Ag 107.868 / Cu 63.546", unit: "u", published: true },
              { name: "原子半径", type: "数字", value: "Ag 144 / Cu 128", unit: "pm", published: true },
              { name: "d 带中心", type: "数字", value: "-3.12", unit: "eV", published: true }
            ] },
            alloy: { updatedAt: "2026-08-18", records: [
              { name: "127种二元合金", type: "字符", value: "AgCu 属铜基二元合金集合", published: true },
              { name: "5种铜表面", type: "字符", value: "Cu(111) 表面，Ag 掺杂覆盖度 0.11 ML", published: true },
              { name: "6种中间产物", type: "字符", value: "CO2 还原 6 种中间产物", published: true },
              { name: "吸附能", type: "数字", value: "*CO -0.34 eV；*CHO -0.88 eV", unit: "eV", method: "M-VASP-PBE-500", published: true }
            ] }
          }
        },
        {
          materialId: "CAT-AUCU-0004", nameCn: "金铜合金", nameEn: "Gold copper alloy", formula: "AuCu",
          tag: "二元合金", safetyLevel: 2, status: "已发布", updatedAt: "2026-08-17",
          searchText: "AuCu 金铜 二元合金 铜基",
          meta: [["晶系 / 空间群", "四方晶系 · P4/mmm"], ["点群 / 体系类型", "4/mmm · 二元合金"]],
          info: [["材料编号", "CAT-AUCU-0004"], ["中文名称", "金铜合金"], ["英文名称", "Gold copper alloy"], ["化学式", "AuCu"], ["材料子类", "二元合金"], ["晶系", "四方晶系"], ["空间群", "P4/mmm"], ["点群", "4/mmm"], ["数据来源", "CALC 计算数据"]],
          datasets: {
            elem: { updatedAt: "2026-08-17", records: [
              { name: "周期数和族数", type: "字符", value: "Au：6 周期 ⅠB 族；Cu：4 周期 ⅠB 族", published: true },
              { name: "元素电荷", type: "数字", value: "Au 79 / Cu 29", unit: "e", published: true },
              { name: "相对原子质量", type: "数字", value: "Au 196.967 / Cu 63.546", unit: "u", published: true },
              { name: "d 带中心", type: "数字", value: "-3.58", unit: "eV", published: true }
            ] },
            struct: { updatedAt: "2026-08-16", records: [
              { name: "形貌结构图", type: "图片", value: "AuCu 有序化表面结构", file: "img/AuCu_ordered.png", published: true },
              { name: "点群和空间群", type: "字符", value: "点群 4/mmm；空间群 P4/mmm", published: true },
              { name: "活性位点配位数", type: "数字", value: "Au 位点 8；Cu 位点 10", published: true }
            ] },
            alloy: { updatedAt: "2026-08-15", records: [
              { name: "127种二元合金", type: "字符", value: "AuCu 属铜基二元合金集合", published: true },
              { name: "5种铜表面", type: "字符", value: "Cu(111) 表面，Au 掺杂覆盖度 0.11 ML", published: true },
              { name: "吸附能", type: "数字", value: "*CO -0.21 eV；*COOH -0.62 eV", unit: "eV", method: "M-VASP-PBE-500", published: false }
            ] }
          }
        },
        {
          materialId: "CAT-CUGB-0005", nameCn: "铜 Σ5(310) 晶界", nameEn: "Copper Σ5(310) grain boundary", formula: "Cu",
          tag: "晶界结构", safetyLevel: 1, status: "已发布", updatedAt: "2026-08-14",
          searchText: "晶界 Σ5 310 铜 晶界能",
          meta: [["晶界类型", "Σ5(310) 对称倾斜晶界"], ["晶界能", "0.92 J/m²"]],
          info: [["材料编号", "CAT-CUGB-0005"], ["中文名称", "铜 Σ5(310) 晶界"], ["英文名称", "Copper Σ5(310) grain boundary"], ["化学式", "Cu"], ["材料子类", "晶界结构"], ["晶界类型", "Σ5(310) 对称倾斜晶界"], ["数据来源", "CALC 计算数据"]],
          datasets: {
            struct: { updatedAt: "2026-08-14", records: [
              { name: "形貌结构图", type: "图片", value: "Σ5(310) 晶界原子结构（含 4 类位点标注）", file: "img/Cu_Sigma5_310.png", published: true },
              { name: "点群和空间群", type: "字符", value: "晶界超胞，对称性 C2v", published: true },
              { name: "活性位点配位数", type: "数字", value: "4 类位点配位数 7–10", published: true },
              { name: "对称性函数", type: "数字", value: "平均广义配位数 5.18", published: true }
            ] },
            gb: { updatedAt: "2026-08-13", records: [
              { name: "5种晶界结构", type: "字符", value: "Σ3(111)、Σ5(210)、Σ5(310)、Σ9(221)、Σ11(113) 五种铜晶界", published: true },
              { name: "41种元素", type: "字符", value: "41 种元素分别置于晶界位点", published: true },
              { name: "4种位点", type: "字符", value: "晶界 4 个不等价位点", published: true },
              { name: "中间产物吸附", type: "数字", value: "*CO 吸附能 0.34–1.12 eV（按位点）", unit: "eV", method: "M-VASP-PBE-500", published: true }
            ] },
            sys: { updatedAt: "2026-08-12", records: [
              { name: "掺杂形成能（晶界能）", type: "数字", value: "0.92", unit: "J/m²", method: "M-VASP-PBE-500", published: true },
              { name: "体系磁矩", type: "数字", value: "0.00", unit: "μB", published: true },
              { name: "反应路径", type: "谱图", value: "晶界位点上 CO2 → *CO 路径", file: "dat/CuGB_pathway.dat", published: false }
            ] }
          }
        },
        {
          materialId: "CAT-PT1CU-0006", nameCn: "铂掺杂铜单原子催化剂", nameEn: "Pt-doped Cu single-atom catalyst", formula: "Pt1/Cu(111)",
          tag: "单原子催化剂", safetyLevel: 2, status: "已发布", updatedAt: "2026-08-11",
          searchText: "Pt 铂 单原子 Cu111 掺杂",
          meta: [["载体 / 活性中心", "Cu(111) / Pt₁"], ["掺杂覆盖度", "0.11 ML"]],
          info: [["材料编号", "CAT-PT1CU-0006"], ["中文名称", "铂掺杂铜单原子催化剂"], ["英文名称", "Pt-doped Cu single-atom catalyst"], ["化学式", "Pt1/Cu(111)"], ["材料子类", "单原子催化剂"], ["载体", "Cu(111) 表面"], ["活性中心", "Pt 单原子"], ["数据来源", "CALC 计算数据"]],
          datasets: {
            sac: { updatedAt: "2026-08-11", records: [
              { name: "41种掺杂元素", type: "字符", value: "Pt 属 Cu(111) 上 41 种掺杂元素集合", published: true },
              { name: "5种铜表面", type: "字符", value: "Cu(111) 表面", published: true },
              { name: "6种中间产物", type: "字符", value: "*COOH、*CO、*CHO、*COH、*CH2O、*OCH3", published: true },
              { name: "吸附能", type: "数字", value: "*CO -1.42 eV；*COOH -0.96 eV", unit: "eV", method: "M-VASP-PBE-500", published: true }
            ] },
            sys: { updatedAt: "2026-08-10", records: [
              { name: "费米面位置", type: "数字", value: "相对真空能级 -4.18", unit: "eV", published: true },
              { name: "掺杂形成能", type: "数字", value: "-1.24", unit: "eV", published: true },
              { name: "体系磁矩", type: "数字", value: "1.68", unit: "μB", published: true },
              { name: "催化性能", type: "数字", value: "CO2 还原极限电位 -0.42 V；CH3OH 选择性 78%", published: false }
            ] }
          }
        }
      ]
    };

    /* ---------- 3. 页面级配置 ---------- */
    const LOWDIM_MATERIAL_DB_CONFIGS = {
      "lowdim-database-twod": {
        code: "2D", badge: "二维材料数据库", databaseTitle: "二维材料数据库",
        intro: "统一展示二维材料八大特征数据集，查看数据库/集介绍、数据信息预览和数据集文件。",
        listHint: "以材料名称为数据集名称，每个材料内包含结构特征、电子结构、电学性质、磁学性质、热学性质、力学性质、光学性质与缺陷性质共 8 类特征数据集内容。",
        datasetCountText: "八大特征数据集",
        searchPlaceholder: "搜索材料名称、化学式、材料编号或元素（如 Mo-S）"
      },
      "lowdim-database-opto": {
        code: "OP", badge: "有机光电材料数据库", databaseTitle: "有机光电材料数据库",
        intro: "统一展示有机光电材料四大特征数据集，查看数据库/集介绍、数据信息预览和数据集文件。",
        listHint: "以材料名称为数据集名称，每个材料内包含基础、物性、表征图谱与计算共 4 类特征数据集内容。",
        datasetCountText: "四大特征数据集",
        searchPlaceholder: "搜索分子名称、分子式、CAS 编号或子类"
      },
      "lowdim-database-electrolyte": {
        code: "EL", badge: "电解质材料数据库", databaseTitle: "电解质材料数据库",
        intro: "统一展示电解质材料三大特征数据集，查看数据库/集介绍、数据信息预览和数据集文件。",
        listHint: "以材料名称为数据集名称，每个材料按其所属电解质类型归入有机电解液、固态有机电解质或固态无机电解质数据集。",
        datasetCountText: "三大特征数据集",
        searchPlaceholder: "搜索材料名称、化学式或子类（如 石榴石、硫化物、腈类）"
      },
      "lowdim-database-mlff": {
        code: "ML", badge: "机器学习力场数据库", databaseTitle: "机器学习力场数据库",
        intro: "统一展示机器学习力场三大特征数据集，查看数据库/集介绍、数据信息预览和数据集文件。",
        listHint: "以分子名称为数据集名称，每个分子内包含基础、有机小分子与高分子共 3 类特征数据集内容。",
        datasetCountText: "三大特征数据集",
        searchPlaceholder: "搜索分子名称、化学式或体系类型"
      },
      "lowdim-database-catalyst": {
        code: "CA", badge: "催化材料数据库", databaseTitle: "催化材料数据库",
        intro: "统一展示催化材料六大特征数据集，查看数据库/集介绍、数据信息预览和数据集文件。",
        listHint: "以材料名称为数据集名称，每个材料内包含元素特征、结构特征、单原子、二元合金、晶界与体系特征共 6 类特征数据集内容。",
        datasetCountText: "六大特征数据集",
        searchPlaceholder: "搜索材料名称、化学式、载体或子类"
      }
    };

    /* ---------- 4. 取数辅助 ---------- */
    function getLowdimMaterialDbConfig(pageId) {
      return LOWDIM_MATERIAL_DB_CONFIGS[pageId] || null;
    }

    function getLowdimMaterialDbDatasets(pageId) {
      return LOWDIM_MATERIAL_DB_DATASET_DEFS[pageId] || [];
    }

    function getLowdimMaterialDbMaterials(pageId) {
      return LOWDIM_MATERIAL_DB_MATERIAL_DEFS[pageId] || [];
    }

    function getLowdimMaterialDbFileType(file) {
      const ext = String(file || "").split(".").pop().toLowerCase();
      const map = { dat: "DAT", png: "PNG", jpg: "JPG", jpeg: "JPG", cif: "CIF", dae: "DAE", json: "JSON", parquet: "Parquet", csv: "CSV", xyz: "XYZ", npz: "NPZ", h5: "HDF5", pdb: "PDB", mol: "MOL", sdf: "SDF", zip: "ZIP" };
      return map[ext] || (ext ? ext.toUpperCase() : "文件");
    }

    function getLowdimMaterialDbEntries(pageId, material) {
      return getLowdimMaterialDbDatasets(pageId).map((dataset) => {
        const entry = material.datasets ? material.datasets[dataset.key] : null;
        const records = (entry && entry.records) || [];
        const published = records.filter((record) => record.published !== false).length;
        const status = !records.length ? "未收录" : (published === records.length ? "已收录" : "部分收录");
        return { dataset, records, published, status, updatedAt: (entry && entry.updatedAt) || "" };
      });
    }

    function getLowdimMaterialDbSummary(pageId, material) {
      const entries = getLowdimMaterialDbEntries(pageId, material);
      return {
        entries,
        collected: entries.filter((item) => item.records.length).length,
        total: entries.length,
        recordCount: entries.reduce((sum, item) => sum + item.records.length, 0),
        publishedCount: entries.reduce((sum, item) => sum + item.published, 0),
        missing: entries.filter((item) => !item.records.length).map((item) => item.dataset.title)
      };
    }

    function getLowdimMaterialDbSafetyMeta(level) {
      return Number(level) === 2
        ? { short: "第2级", full: "第2级（半公开）", cls: "l2", note: "半公开使用的数据。主要包含短期内通过计算获得的新增数据，需获管理员许可后用户才能查阅和下载使用。" }
        : { short: "第1级", full: "第1级（完全公开）", cls: "l1", note: "可完全公开使用的数据。主要包含外源数据录入的数据和部分上传超过一定时限的计算数据，可供所有用户查阅和下载使用。" };
    }

    function getLowdimMaterialDbStatusClass(status) {
      if (status === "已收录") return "ok";
      if (status === "部分收录") return "warn";
      return "off";
    }

    function getLowdimMaterialDbFilteredMaterials(pageId) {
      const filters = getLowdimDbOverviewState(pageId);
      const keyword = String(filters.search || "").trim().toLowerCase();
      const strip = (text) => String(text).replace(/[\s\-·_/、,，.]+/g, "");
      return getLowdimMaterialDbMaterials(pageId).filter((material) => {
        if (filters.safety && filters.safety !== "all" && String(material.safetyLevel) !== String(filters.safety)) return false;
        if (!keyword) return true;
        const hay = [material.nameCn, material.nameEn, material.formula, material.materialId, material.tag,
          material.searchText || "", (material.info || []).map((row) => row[1]).join(" ")].join(" ").toLowerCase();
        return hay.includes(keyword) || strip(hay).includes(strip(keyword));
      });
    }

    function getLowdimMaterialDbStyle(pageId) {
      return `
        <style id="lowdim-material-db-style">
          #page-${pageId} { background: #f3f6fb; }
          #page-${pageId}.twod-dataset-detail-active { padding: 0 !important; }
          .ldbm-page { padding: 4px 0 28px; }
          .ldbm-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 14px 16px; border: 1px solid #d7e2f2; border-radius: 15px; background: #fff; }
          #page-${pageId} .ldb-search { flex: 1 1 240px; display: flex; align-items: center; gap: 8px; min-width: 200px; padding: 0 12px; border: 1px solid #cbd8eb; border-radius: 10px; background: #f8fbff; }
          #page-${pageId} .ldb-search input { flex: 1; min-height: 38px; border: 0; background: transparent; color: #253957; font-size: 14px; outline: none; }
          #page-${pageId} .ldb-reset-btn { min-height: 40px; padding: 0 18px; border: 1px solid #cbd8eb; border-radius: 10px; background: #fff; color: #3d4d68; font-size: 14px; cursor: pointer; }
          .ldbm-toolbar select { min-height: 40px; padding: 0 12px; border: 1px solid #cbd8eb; border-radius: 10px; background: #fff; color: #3d4d68; font-size: 14px; cursor: pointer; }
          #page-${pageId} .ldb-pagination { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-top: 18px; padding: 14px 18px; border: 1px solid #d7e2f2; border-radius: 15px; background: #fff; }
          #page-${pageId} .ldb-page-info { color: #7b8da7; font-size: 13px; }
          #page-${pageId} .ldb-page-btns { display: flex; align-items: center; gap: 8px; }
          #page-${pageId} .ldb-page-btns button { min-width: 36px; min-height: 36px; padding: 0 12px; border: 1px solid #cbd8eb; border-radius: 9px; background: #fff; color: #3d4d68; font-size: 13px; cursor: pointer; }
          #page-${pageId} .ldb-page-btns button.active { border-color: #165DFF; background: #165DFF; color: #fff; font-weight: 700; }
          #page-${pageId} .ldb-page-btns button:disabled { color: #b6c4d8; cursor: not-allowed; }
          .ldbm-list-hint { margin: 14px 2px 0; color: #7b8da7; font-size: 13px; line-height: 1.8; }
          .ldbm-card-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-top: 16px; }
          .ldbm-card { display: flex; flex-direction: column; padding: 20px 22px 0; border: 1px solid #d7e2f2; border-radius: 15px; background: #fff; box-shadow: 0 2px 7px rgba(47,75,116,.025); transition: border-color .18s ease, box-shadow .18s ease; }
          .ldbm-card:hover { border-color: #a9c8f6; box-shadow: 0 8px 22px rgba(47,75,116,.09); }
          .ldbm-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
          .ldbm-card-title { min-width: 0; }
          .ldbm-card-title h4 { margin: 0; color: #22395c; font-size: 20px; line-height: 1.35; }
          .ldbm-card-title h4 em { margin-left: 8px; color: #7b8da7; font-size: 14px; font-style: normal; font-weight: 600; }
          .ldbm-card-title p { margin: 6px 0 0; color: #7b8da7; font-size: 12.5px; }
          .ldbm-level { flex: none; display: inline-flex; align-items: center; min-height: 30px; padding: 0 12px; border: 1px solid; border-radius: 15px; font-size: 12.5px; font-weight: 700; white-space: nowrap; }
          .ldbm-level.l1 { border-color: #8ce8c2; color: #087f5b; background: #ecfdf5; }
          .ldbm-level.l2 { border-color: #f7c887; color: #c95b14; background: #fff7ed; }
          .ldbm-card-meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 16px; }
          .ldbm-card-meta div { min-width: 0; padding: 10px 12px; border-radius: 10px; background: #f5f8fc; }
          .ldbm-card-meta span { display: block; margin-bottom: 4px; color: #8496b1; font-size: 12px; }
          .ldbm-card-meta strong { display: block; overflow-wrap: anywhere; color: #294365; font-size: 13.5px; line-height: 1.4; }
          .ldbm-card-meta strong em { color: #165DFF; font-style: normal; font-weight: 800; }
          .ldbm-ds-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
          .ldbm-ds-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border: 1px solid #dbe5f3; border-radius: 7px; background: #fff; color: #57718f; font-size: 12px; }
          .ldbm-ds-chip b { font-weight: 700; }
          .ldbm-ds-chip i { font-style: normal; font-size: 11px; }
          .ldbm-ds-chip.ok { border-color: #b7e4cf; background: #f2fdf8; color: #0b7a5c; }
          .ldbm-ds-chip.warn { border-color: #f7d6a8; background: #fffaf2; color: #b9631a; }
          .ldbm-ds-chip.off { border-color: #e4eaf3; background: #f8fafc; color: #a3b1c6; }
          .ldbm-card-actions { display: flex; justify-content: flex-end; align-items: center; gap: 10px; margin-top: 16px; padding: 14px 0 18px; border-top: 1px solid #e8eef6; }
          .ldbm-card-actions .btn-primary { min-width: 110px; min-height: 42px; padding: 0 18px; border: 0; border-radius: 8px; background: #165DFF; color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; }
          .ldbm-empty { margin-top: 16px; padding: 42px 0; border: 1px dashed #c9d8ec; border-radius: 15px; background: #fff; color: #7b8da7; font-size: 14px; text-align: center; }

          /* ---- 材料详情 ---- */
          .ldbm-detail { padding: 4px 0 28px; }
          .ldbm-detail-breadcrumb { color: #8496b1; font-size: 13px; }
          .ldbm-detail-head { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-top: 10px; }
          .ldbm-detail-head h2 { margin: 0; color: #1b2c47; font-size: 24px; }
          .ldbm-detail-head h2 em { margin-left: 10px; color: #7b8da7; font-size: 15px; font-style: normal; font-weight: 600; }
          .ldbm-detail-head p { margin: 8px 0 0; color: #667b9b; font-size: 13.5px; }
          .ldbm-detail-head-actions { display: flex; align-items: center; gap: 10px; }
          .ldbm-detail-head-actions .btn { min-height: 40px; padding: 0 18px; border: 1px solid #cbd8eb; border-radius: 10px; background: #fff; color: #3d4d68; font-size: 14px; cursor: pointer; }
          .ldbm-detail-summary { margin-top: 16px; padding: 20px 22px; border: 1px solid #d7e2f2; border-radius: 15px; background: #fff; }
          .ldbm-detail-summary h3 { margin: 0 0 14px; color: #22395c; font-size: 16px; }
          .ldbm-info-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
          .ldbm-info-grid div { min-width: 0; padding: 11px 13px; border-radius: 10px; background: #f5f8fc; }
          .ldbm-info-grid span { display: block; margin-bottom: 5px; color: #8496b1; font-size: 12px; }
          .ldbm-info-grid strong { display: block; overflow-wrap: anywhere; color: #294365; font-size: 13.5px; line-height: 1.45; }
          .ldbm-detail-nav { margin-top: 16px; padding: 16px 20px; border: 1px solid #d7e2f2; border-radius: 15px; background: #fff; }
          .ldbm-detail-nav > span { display: block; margin-bottom: 10px; color: #7b8da7; font-size: 12.5px; line-height: 1.8; }
          .ldbm-detail-nav .ldbm-ds-chips { margin-top: 0; }
          .ldbm-detail-nav .ldbm-ds-chip { cursor: pointer; }
          .ldbm-detail-nav .ldbm-ds-chip:hover { border-color: #a9c8f6; }
          .ldbm-detail-tabs { display: flex; gap: 6px; margin-top: 20px; border-bottom: 1px solid #dbe5f3; }
          .ldbm-detail-tabs button { min-height: 44px; padding: 0 20px; border: 0; border-bottom: 2px solid transparent; background: transparent; color: #667b9b; font-size: 14.5px; font-weight: 600; cursor: pointer; }
          .ldbm-detail-tabs button:hover { color: #165DFF; }
          .ldbm-detail-tabs button.active { border-bottom-color: #165DFF; color: #165DFF; font-weight: 700; }
          .ldbm-tab-content { display: block; }
          .ldbm-tab-content[hidden] { display: none; }
          .ldbm-ds-panel { margin-top: 16px; border: 1px solid #d7e2f2; border-radius: 15px; background: #fff; overflow: hidden; }
          .ldbm-ds-panel-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 16px 20px; border-bottom: 1px solid #e8eef6; background: #f8fbff; }
          .ldbm-ds-panel-head h3 { margin: 0; color: #22395c; font-size: 16px; }
          .ldbm-ds-panel-head h3 i { margin-left: 10px; color: #8496b1; font-size: 12px; font-style: normal; font-weight: 600; }
          .ldbm-ds-panel-head p { margin: 6px 0 0; color: #7b8da7; font-size: 12.5px; line-height: 1.6; }
          .ldbm-ds-panel-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
          .ldbm-ds-badge { display: inline-flex; align-items: center; min-height: 28px; padding: 0 11px; border: 1px solid; border-radius: 14px; font-size: 12px; font-weight: 700; }
          .ldbm-ds-badge.ok { border-color: #b7e4cf; background: #f2fdf8; color: #0b7a5c; }
          .ldbm-ds-badge.warn { border-color: #f7d6a8; background: #fffaf2; color: #b9631a; }
          .ldbm-ds-badge.off { border-color: #e4eaf3; background: #f8fafc; color: #97a5ba; }
          .ldbm-ds-panel-meta em { color: #8496b1; font-size: 12px; font-style: normal; }
          .ldbm-ds-intro-body { padding: 16px 20px 18px; }
          .ldbm-ds-intro-desc { margin: 0 0 14px; color: #34465b; font-size: 13px; line-height: 1.9; }
          .ldbm-ds-intro-block { margin-top: 12px; }
          .ldbm-ds-intro-block > span { display: block; margin-bottom: 8px; color: #7b8da7; font-size: 12.5px; }
          .ldbm-ds-intro-block .ldbm-ds-chips { margin-top: 0; }
          .ldbm-field-chip { display: inline-flex; align-items: center; padding: 5px 10px; border: 1px solid #dbe5f3; border-radius: 6px; background: #f8fbff; color: #57718f; font-size: 12px; }
          .ldbm-ds-intro-meta { display: flex; flex-wrap: wrap; gap: 8px; }
          .ldbm-ds-intro-meta em { padding: 5px 10px; border-radius: 6px; background: #f3f6fb; color: #667b9b; font-size: 12px; font-style: normal; }
          .ldbm-ds-intro-empty { margin: 0; color: #97a5ba; font-size: 12.5px; }
          .ldbm-ds-table-wrap { overflow-x: auto; }
          .ldbm-ds-table { width: 100%; min-width: 940px; border-collapse: collapse; }
          .ldbm-ds-table th { height: 40px; padding: 0 16px; border-bottom: 1px solid #edf1f7; background: #fcfdff; color: #7b8da7; font-size: 12px; font-weight: 600; text-align: left; white-space: nowrap; }
          .ldbm-ds-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5fa; color: #34465b; font-size: 12.5px; line-height: 1.7; vertical-align: top; }
          .ldbm-ds-table tr:last-child td { border-bottom: 0; }
          .ldbm-ds-table td.ldbm-td-name { color: #22395c; font-weight: 700; white-space: nowrap; }
          .ldbm-ds-table td.ldbm-td-value { min-width: 300px; }
          .ldbm-type-tag { display: inline-flex; padding: 3px 9px; border-radius: 6px; background: #edf4ff; color: #2161d5; font-size: 11.5px; white-space: nowrap; }
          .ldbm-file-chip { display: inline-block; padding: 2px 7px; border-radius: 5px; background: #f3f6fb; color: #5b7089; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; overflow-wrap: anywhere; }
          .ldbm-pub { display: inline-flex; align-items: center; min-height: 24px; padding: 0 9px; border-radius: 12px; font-size: 11.5px; white-space: nowrap; }
          .ldbm-pub.ok { background: #ecfdf5; color: #0b7a5c; }
          .ldbm-pub.warn { background: #fff7ed; color: #b9631a; }
          .ldbm-ds-empty { padding: 26px 20px; color: #97a5ba; font-size: 13px; }
          .ldbm-ds-empty b { color: #667b9b; }
          @media (max-width: 1200px) { .ldbm-info-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
          @media (max-width: 900px) { .ldbm-card-grid { grid-template-columns: 1fr; } .ldbm-info-grid { grid-template-columns: 1fr; } }
        </style>`;
    }

    function renderLowdimMaterialDbToolbar(pageId) {
      const config = getLowdimMaterialDbConfig(pageId);
      const filters = getLowdimDbOverviewState(pageId);
      const opt = (value, label, current) => `<option value="${escapeLowDimHtml(value)}"${String(value) === String(current) ? " selected" : ""}>${escapeLowDimHtml(label)}</option>`;
      return `
          <div class="ldbm-toolbar">
            <div class="ldb-search"><span>🔍</span><input type="text" data-ldb-search placeholder="${escapeLowDimHtml(config.searchPlaceholder)}" value="${escapeLowDimHtml(filters.search || "")}"></div>
            <select data-ldb-filter="safety">${opt("all", "全部安全等级", filters.safety)}${opt("1", "第1级（完全公开）", filters.safety)}${opt("2", "第2级（半公开）", filters.safety)}</select>
            <button type="button" class="ldb-reset-btn" data-ldb-reset>重置</button>
          </div>`;
    }

    function renderLowdimMaterialDbCards(pageId) {
      const filters = getLowdimDbOverviewState(pageId);
      const rows = getLowdimMaterialDbFilteredMaterials(pageId);
      if (!rows.length) return `<div class="ldbm-empty">暂无符合条件的材料数据集，请调整筛选条件。</div>`;
      const start = (filters.page - 1) * filters.pageSize;
      const pageRows = rows.slice(start, start + filters.pageSize);
      return `<div class="ldbm-card-grid">${pageRows.map((material) => {
        const summary = getLowdimMaterialDbSummary(pageId, material);
        const level = getLowdimMaterialDbSafetyMeta(material.safetyLevel);
        const chips = summary.entries.map((entry) => {
          const cls = getLowdimMaterialDbStatusClass(entry.status);
          const tail = entry.records.length ? `<i>${entry.records.length} 项</i>` : `<i>未收录</i>`;
          return `<span class="ldbm-ds-chip ${cls}"><b>${escapeLowDimHtml(entry.dataset.short)}</b>${tail}</span>`;
        }).join("");
        const metaTiles = (material.meta || []).map(([label, value]) => `<div><span>${escapeLowDimHtml(label)}</span><strong>${escapeLowDimHtml(value)}</strong></div>`).join("");
        return `
          <article class="ldbm-card" data-ldbm-card="${escapeLowDimHtml(material.materialId)}">
            <div class="ldbm-card-top">
              <div class="ldbm-card-title">
                <h4>${escapeLowDimHtml(material.nameCn)}<em>${escapeLowDimHtml(material.nameEn)}</em></h4>
                <p>${escapeLowDimHtml(material.formula)} · ${escapeLowDimHtml(material.tag)} · ${escapeLowDimHtml(material.materialId)}</p>
              </div>
              <span class="ldbm-level ${level.cls}" title="${escapeLowDimHtml(level.full)}：${escapeLowDimHtml(level.note)}">${escapeLowDimHtml(level.short)}</span>
            </div>
            <div class="ldbm-card-meta">
              ${metaTiles}
              <div><span>特征数据集收录</span><strong><em>${summary.collected} / ${summary.total}</em> 类 · ${summary.recordCount} 条数据</strong></div>
              <div><span>最近更新</span><strong>${escapeLowDimHtml(material.updatedAt)}</strong></div>
            </div>
            <div class="ldbm-ds-chips">${chips}</div>
            <div class="ldbm-card-actions">
              <button class="btn-primary" type="button" data-ldbm-view="${escapeLowDimHtml(material.materialId)}">查看详情</button>
            </div>
          </article>`;
      }).join("")}</div>`;
    }

    function renderLowdimMaterialDbPagination(pageId) {
      const filters = getLowdimDbOverviewState(pageId);
      const config = getLowdimMaterialDbConfig(pageId);
      const total = getLowdimMaterialDbFilteredMaterials(pageId).length;
      const pages = Math.max(1, Math.ceil(total / filters.pageSize));
      if (filters.page > pages) filters.page = pages;
      let buttons = "";
      for (let i = 1; i <= pages; i += 1) {
        buttons += `<button type="button" class="ldb-page-num${i === filters.page ? " active" : ""}" data-ldb-goto="${i}">${i}</button>`;
      }
      return `
          <div class="ldb-pagination">
            <span class="ldb-page-info">共 ${total} 个材料数据集 · ${escapeLowDimHtml(config.datasetCountText)} · 第 ${filters.page} / ${pages} 页</span>
            <div class="ldb-page-btns">
              <button type="button" data-ldb-goto="${filters.page - 1}" ${filters.page <= 1 ? "disabled" : ""}>上一页</button>
              ${buttons}
              <button type="button" data-ldb-goto="${filters.page + 1}" ${filters.page >= pages ? "disabled" : ""}>下一页</button>
            </div>
          </div>`;
    }

    function renderLowdimMaterialDbDetail(pageId, materialId) {
      const config = getLowdimMaterialDbConfig(pageId);
      const material = getLowdimMaterialDbMaterials(pageId).find((item) => item.materialId === materialId);
      if (!config || !material) return "";
      const summary = getLowdimMaterialDbSummary(pageId, material);
      const level = getLowdimMaterialDbSafetyMeta(material.safetyLevel);
      const info = (material.info || []).concat([
        ["安全等级", level.full],
        ["发布状态", material.status],
        ["最近更新", material.updatedAt]
      ]);
      const navChips = summary.entries.map((entry) => {
        const cls = getLowdimMaterialDbStatusClass(entry.status);
        const tail = entry.records.length ? `<i>${entry.records.length} 项</i>` : `<i>未收录</i>`;
        return `<span class="ldbm-ds-chip ${cls}" data-ldbm-jump="${escapeLowDimHtml(entry.dataset.key)}"><b>${escapeLowDimHtml(entry.dataset.title)}</b>${tail}</span>`;
      }).join("");
      const panelHead = (entry) => `
            <div class="ldbm-ds-panel-head">
              <div>
                <h3>${escapeLowDimHtml(entry.dataset.title)}<i>${escapeLowDimHtml(entry.dataset.code)}</i></h3>
                <p>${escapeLowDimHtml(entry.dataset.description)}</p>
              </div>
              <div class="ldbm-ds-panel-meta">
                <span class="ldbm-ds-badge ${getLowdimMaterialDbStatusClass(entry.status)}">${escapeLowDimHtml(entry.status)}</span>
                <em>${entry.records.length} 条数据${entry.updatedAt ? ` · 更新于 ${escapeLowDimHtml(entry.updatedAt)}` : ""}</em>
              </div>
            </div>`;

      /* --- 页签 1：数据集介绍 --- */
      const introPanels = summary.entries.map((entry) => {
        const ds = entry.dataset;
        const collected = entry.records.length
          ? `<div class="ldbm-ds-chips">${entry.records.map((record) => `<span class="ldbm-field-chip">${escapeLowDimHtml(record.name)}</span>`).join("")}</div>`
          : `<p class="ldbm-ds-intro-empty">该材料暂未收录本数据集内容${summary.missing.length ? `（待补充：${escapeLowDimHtml(summary.missing.join("、"))}）` : ""}。</p>`;
        return `
          <section class="ldbm-ds-panel" data-ldbm-intro-panel="${escapeLowDimHtml(ds.key)}">
            ${panelHead(entry)}
            <div class="ldbm-ds-intro-body">
              <p class="ldbm-ds-intro-desc">${escapeLowDimHtml(ds.description)}</p>
              <div class="ldbm-ds-intro-block"><span>核心字段（${ds.fields.length} 项）</span><div class="ldbm-ds-chips">${ds.fields.map((field) => `<span class="ldbm-field-chip">${escapeLowDimHtml(field)}</span>`).join("")}</div></div>
              <div class="ldbm-ds-intro-block"><span>本材料已收录内容</span>${collected}</div>
              <div class="ldbm-ds-intro-block"><span>数据集信息</span><div class="ldbm-ds-intro-meta"><em>数据集编号 ${escapeLowDimHtml(ds.code)}</em><em>文件类型 ${escapeLowDimHtml(ds.format)}</em><em>所属域 ${escapeLowDimHtml(ds.domain)}</em></div></div>
            </div>
          </section>`;
      }).join("");

      /* --- 页签 2：数据信息预览 --- */
      const previewPanels = summary.entries.map((entry) => {
        const body = entry.records.length
          ? `<div class="ldbm-ds-table-wrap"><table class="ldbm-ds-table">
              <thead><tr><th>数据项</th><th>存储形态</th><th>取值 / 内容</th><th>单位</th><th>计算方法</th><th>关联文件</th><th>状态</th></tr></thead>
              <tbody>${entry.records.map((record) => `
                <tr>
                  <td class="ldbm-td-name">${escapeLowDimHtml(record.name)}</td>
                  <td><span class="ldbm-type-tag">${escapeLowDimHtml(record.type)}</span></td>
                  <td class="ldbm-td-value">${escapeLowDimHtml(record.value)}</td>
                  <td>${escapeLowDimHtml(record.unit || "-")}</td>
                  <td>${escapeLowDimHtml(record.method || "-")}</td>
                  <td>${record.file ? `<span class="ldbm-file-chip">${escapeLowDimHtml(record.file)}</span>` : "-"}</td>
                  <td><span class="ldbm-pub ${record.published === false ? "warn" : "ok"}">${record.published === false ? "待处理" : "已发布"}</span></td>
                </tr>`).join("")}</tbody>
            </table></div>`
          : `<div class="ldbm-ds-empty">该材料暂未收录 <b>${escapeLowDimHtml(entry.dataset.title)}</b> 内容。${summary.missing.length ? `待补充数据集：${escapeLowDimHtml(summary.missing.join("、"))}。` : ""}</div>`;
        return `
          <section class="ldbm-ds-panel" data-ldbm-panel="${escapeLowDimHtml(entry.dataset.key)}">
            ${panelHead(entry)}
            ${body}
          </section>`;
      }).join("");

      /* --- 页签 3：数据集文件 --- */
      const filePanels = summary.entries.map((entry) => {
        const ds = entry.dataset;
        const base = ds.code.toLowerCase();
        const rows = [
          { file: `${base}_dataset.parquet`, type: "Parquet", item: "—", note: "数据集归档文件（全量标准化数据）" },
          { file: `${base}_metadata.json`, type: "JSON", item: "—", note: "数据集元数据与字段说明" }
        ].concat(entry.records.filter((record) => record.file).map((record) => ({
          file: record.file, type: getLowdimMaterialDbFileType(record.file), item: record.name, note: "关联数据文件"
        })));
        const body = entry.records.length
          ? `<div class="ldbm-ds-table-wrap"><table class="ldbm-ds-table">
              <thead><tr><th>文件名称</th><th>文件类型</th><th>关联数据项</th><th>说明</th><th>操作</th></tr></thead>
              <tbody>${rows.map((row) => `
                <tr>
                  <td class="ldbm-td-name"><span class="ldbm-file-chip">${escapeLowDimHtml(row.file)}</span></td>
                  <td><span class="ldbm-type-tag">${escapeLowDimHtml(row.type)}</span></td>
                  <td>${escapeLowDimHtml(row.item)}</td>
                  <td>${escapeLowDimHtml(row.note)}</td>
                  <td><button class="btn btn-sm" type="button" data-ldbm-file-download="${escapeLowDimHtml(row.file)}">下载</button></td>
                </tr>`).join("")}</tbody>
            </table></div>`
          : `<div class="ldbm-ds-empty">该材料暂未收录 <b>${escapeLowDimHtml(ds.title)}</b> 内容，暂无归档文件。</div>`;
        return `
          <section class="ldbm-ds-panel" data-ldbm-file-panel="${escapeLowDimHtml(ds.key)}">
            ${panelHead(entry)}
            ${body}
          </section>`;
      }).join("");

      return `
        <div class="ldbm-detail" data-ldbm-detail>
          <div class="ldbm-detail-breadcrumb">低维材料主题应用　/　低维材料数据库　/　${escapeLowDimHtml(config.databaseTitle)}</div>
          <div class="ldbm-detail-head">
            <div>
              <h2>${escapeLowDimHtml(material.nameCn)}<em>${escapeLowDimHtml(material.nameEn)}</em></h2>
              <p>材料编号 ${escapeLowDimHtml(material.materialId)} · ${escapeLowDimHtml(material.formula)} · ${escapeLowDimHtml(material.tag)}</p>
            </div>
            <div class="ldbm-detail-head-actions">
              <span class="ldbm-level ${level.cls}" title="${escapeLowDimHtml(level.full)}：${escapeLowDimHtml(level.note)}">${escapeLowDimHtml(level.full)}</span>
              <button class="btn" type="button" data-ldbm-back="${escapeLowDimHtml(pageId)}">返回数据库</button>
            </div>
          </div>
          <section class="ldbm-detail-summary">
            <h3>材料基本信息</h3>
            <div class="ldbm-info-grid">${info.map(([label, value]) => `<div><span>${escapeLowDimHtml(label)}</span><strong>${escapeLowDimHtml(value)}</strong></div>`).join("")}</div>
          </section>
          <section class="ldbm-detail-nav">
            <span>该材料共收录 ${summary.collected} / ${summary.total} 类特征数据集（${summary.publishedCount} 条已发布，${summary.recordCount - summary.publishedCount} 条待处理），点击可跳转到对应数据集内容</span>
            <div class="ldbm-ds-chips">${navChips}</div>
          </section>
          <div class="ldbm-detail-tabs" role="tablist">
            <button type="button" class="active" data-ldbm-tab="intro">数据集介绍</button>
            <button type="button" data-ldbm-tab="preview">数据信息预览</button>
            <button type="button" data-ldbm-tab="files">数据集文件</button>
          </div>
          <div class="ldbm-tab-content" data-ldbm-tab-content="intro">${introPanels}</div>
          <div class="ldbm-tab-content" data-ldbm-tab-content="preview" hidden>${previewPanels}</div>
          <div class="ldbm-tab-content" data-ldbm-tab-content="files" hidden>${filePanels}</div>
        </div>`;
    }

    function renderLowdimMaterialDbPage(pageId) {
      const page = document.getElementById(`page-${pageId}`);
      const config = getLowdimMaterialDbConfig(pageId);
      if (!page || !config) return;
      const filters = getLowdimDbOverviewState(pageId);
      const total = getLowdimMaterialDbFilteredMaterials(pageId).length;
      const pages = Math.max(1, Math.ceil(total / filters.pageSize));
      if (filters.page > pages) filters.page = pages;
      ensureLowdimDbOverviewEvents();
      page.classList.remove("twod-dataset-detail-active");
      page.innerHTML = `
        ${getLowdimMaterialDbStyle(pageId)}
        <div class="ldbm-page" data-ldb-page-id="${pageId}">
          ${renderLowdimMaterialDbToolbar(pageId)}
          <div class="ldbm-list-hint">${escapeLowDimHtml(config.listHint)}</div>
          <div data-ldb-list>${renderLowdimMaterialDbCards(pageId)}</div>
          <div data-ldb-pagination>${renderLowdimMaterialDbPagination(pageId)}</div>
        </div>
      `;
      page.scrollTop = 0;
    }

    function openLowdimMaterialDbDetail(pageId, materialId) {
      const page = document.getElementById(`page-${pageId}`);
      if (!page) return;
      const html = renderLowdimMaterialDbDetail(pageId, materialId);
      if (!html) return;
      ensureLowdimDbOverviewEvents();
      page.innerHTML = `${getLowdimMaterialDbStyle(pageId)}${html}`;
      page.scrollTop = 0;
      if (typeof window !== "undefined" && window.scrollTo) window.scrollTo({ top: 0, behavior: "auto" });
    }

