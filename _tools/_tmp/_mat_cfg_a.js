  /* ==================================================================
     材料配置表：五类材料共用同一套界面逻辑，只在渲染前切换配置
     ------------------------------------------------------------------
     数据来源：需求规格说明书（低维材料主题库）
       · R14~R17 有机光电材料数据采集加工处理（对象 / 采集 / 录入 / 加工）
       · R18~R21 电解质材料数据采集加工处理
       · R22~R24 机器学习力场数据采集加工处理（加工合并在 R24）
       · R25     催化材料数据采集加工处理（数据资源对象）
     ================================================================== */
  var PAGE_KEYS = {
    "lowdim-ingest-twod": "twod",
    "lowdim-ingest-opto": "opto",
    "lowdim-ingest-electrolyte": "electrolyte",
    "lowdim-ingest-mlff": "mlff",
    "lowdim-ingest-catalyst": "catalyst"
  };

  function keyOf(pid) { return PAGE_KEYS[pid] || ""; }

  var CFG_KEY = "twod";
  var MAT = {};

  function C() { return MAT[CFG_KEY] || MAT.twod; }

  /* ------------------------------------------------------------ 二维材料 */
  MAT.twod = {
    code: "2D",
    short: "二维材料",
    title: "二维材料数据采集加工处理",
    headDesc: "面向二维材料数据的采集、录入与加工全流程管理：支持开源数据库 API 采集、已购 / 自采数据导入与 VASP 计算数据提取，<br>内置字段级校验、异常处理队列与质量评价规则，采集结果确认后统一入库。",
    introTitle: "二维材料数据库共包含 8 大资源对象，采集 / 录入 / 加工均围绕这些对象展开。",
    introBanner: "八大资源对象：结构特征、电子结构、电学性质、磁学性质、热学性质、力学性质、光学性质及缺陷性质。各资源对象包含的数据字段如下：",
    introTip: "采集参数中的「性质范围」即针对上述资源对象的性质字段设置取值范围，用于过滤落在范围外的数据记录。",
    objectsNote: "二维材料八大资源对象",
    typeTip: "选择本次采集的二维材料类型，不同类型对应不同的性质字段模板。",
    buyNote: "仅展示当前账号已完成采购或已完成自采登记的数据库，勾选后可从对应数据包中导入二维材料数据。",
    calcTip: "二维材料计算须设置真空层 ≥ 15 Å、K 点密度 ≥ 15 Å⁻¹，参数不合规将进入合规性校验报告分支。",
    taskNamePh: "请输入采集任务名称，如：过渡金属硫族化合物（MoS2）电子结构数据采集",
    doneNote: "审核通过并完成入库的二维材料数据，可直接送去资源加工。",
    objects: null,               /* null = 沿用 04.js 的 TWOD_TASK_RESOURCE_OBJECTS */
    systems: null,               /* null = 沿用 04.js 的 TWOD_MATERIAL_TYPES */
    methods: null,
    openDbs: null,
    buyDbs: null,
    dbVersions: { mp: "v2024.11", c2db: "v3.2", "2dmatpedia": "v2023.09", "b-c2db": "v3.2", "b-icsd": "v2.8", "b-2dm": "v1.6", "b-self": "V0.0（自采）" },
    calcOutputs: null,
    calcInputs: null,
    calcInputDesc: null,
    calcCompliance: null,
    mediaExt: "cif",
    payloadTitle: "结构信息 / 能带数据 / 态密度",
    payload: null,
    payloadJson: null,
    entryMethodRows: null,
    entrySources: null,
    dataTypeCodes: null,
    entryManualFields: null,
    entryCalcParams: null,
    entryManualSteps: null,
    entryBatchSteps: null,
    entryRules: null,
    manualDefaults: { form: { dataType: "结构特征" }, calc: { software: "VASP", functional: "PBE", encut: "450", kpoints: "18", force: "0.01", vacuum: "16" } },
    demoFile: "MoS2.cif",
    demoParse: { formula: "MoS2", crystal: "Hexagonal", spaceGroup: "P6₃/mmc", la: "3.16", lb: "3.16", lc: "12.30", coords: "Mo 0.000 0.000 0.250\nS 0.333 0.667 0.620", bandGap: "1.68", formationEnergy: "-1.24", thickness: "6.15" },
    procFlow: null,
    procStepTitles: null,
    procS1: null, procS2: null, procS3: null, procS4: null, procS5: null, procS6: null, procVersion: null,
    procModels: null, procProducts: null, procQuality: null,
    modelRows: {
      stat: [
        { item: "带隙（MoS2）", input: "1.62 / 1.70 / 1.72 eV", logic: "计算均值、标准差、置信区间", out: "1.68 ± 0.05 eV（95% CI：1.64 ~ 1.72）" },
        { item: "形成能（MoS2）", input: "-1.20 / -1.26 / -1.26 eV/atom", logic: "计算均值、标准差、置信区间", out: "-1.24 ± 0.03 eV/atom" }
      ],
      image: [
        { item: "能带图", input: "band_raw.png（1024×768，坐标轴不一致）", logic: "统一坐标轴、分辨率、标注、格式", out: "band_std.png（1600×1200，统一标注）" },
        { item: "态密度图", input: "dos_raw.png（800×600）", logic: "统一坐标轴、分辨率、标注、格式", out: "dos_std.png（1600×1200，统一标注）" }
      ],
      struct: [
        { item: "MoS2 结构", input: "MoS2.cif", logic: "校验原子坐标合理性、键长范围", out: "MoS2_verified.cif（键长 2.41 Å，合理）" },
        { item: "WS2 结构", input: "WS2.cif", logic: "校验原子坐标合理性、键长范围", out: "WS2_verified.cif（键长 2.42 Å，合理）" }
      ]
    },
    outliers: [
      { key: "o1", name: "MoS2 · 带隙", value: "11.6 eV", sigma: "4.2σ", fixed: "", keep: false },
      { key: "o2", name: "WS2 · 形成能", value: "+0.38 eV/atom", sigma: "3.6σ", fixed: "", keep: false }
    ],
    procNamePh: "如：MoS2 电子结构数据产品加工",
    listCols: [{ key: "crystal", label: "晶系" }, { key: "spaceGroup", label: "空间群" }, { key: "bandGap", label: "带隙", unit: " eV" }],
    tasks: null
  };

  /* -------------------------------------------------- 有机光电材料（R14~R17） */
  MAT.opto = {
    code: "OP",
    short: "有机光电材料",
    title: "有机光电材料数据采集加工处理",
    headDesc: "面向有机光电材料数据的采集、录入与加工全流程管理：支持 PubChem / CCDC 开源抓取与文献解析、SciFinder / Reaxys 商用数据导入与 Gaussian16 自主计算提取，<br>内置分子级字段校验、异常处理队列与质量评价规则，采集结果确认后统一入库。",
    introTitle: "有机光电材料数据库数据资源共包含 4 类核心对象，采集 / 录入 / 加工均围绕这些对象展开。",
    introBanner: "4 类核心对象：基础信息对象、物理性质对象、表征图谱对象、计算数据对象。各资源对象包含的数据字段如下：",
    introTip: "采集参数中的「性质范围」即针对上述资源对象的性质字段设置取值范围，用于过滤落在范围外的数据记录。",
    objectsNote: "有机光电材料 4 类核心对象",
    typeTip: "选择本次采集的有机光电材料类型，不同类型对应不同的性质字段模板。",
    buyNote: "仅展示当前账号已完成采购或已完成自采登记的数据库，勾选后可从对应数据包中导入有机光电材料数据。",
    calcTip: "有机分子激发态计算建议采用 B3LYP 及以上精度的泛函，并显式声明溶剂模型，参数不合规将进入合规性校验报告分支。",
    taskNamePh: "请输入采集任务名称，如：OLED 发光分子（DPP-DTT）激发能数据采集",
    doneNote: "审核通过并完成入库的有机光电材料数据，可直接送去资源加工。",
    objects: [
      { name: "基础信息对象", fields: "中英文名称、分子式、分子量、分子编号、三维结构（原子坐标、键长键角）" },
      { name: "物理性质对象", fields: "密度、熔点、沸点、闪点、折射率、溶解性" },
      { name: "表征图谱对象", fields: "红外光谱、拉曼光谱、核磁共振谱（原始数据 + 图谱图片）" },
      { name: "计算数据对象", fields: "基态 / 激发态结构、激发能、发射能、跃迁偶极矩、HOMO-LUMO、溶剂化自由能、态密度、简正模式" }
    ],
    systems: [
      { name: "OLED 发光分子", abbr: "OLED", sample: "DPP-DTT", fields: ["分子基础信息", "物性数据", "表征图谱", "激发能/发射能", "HOMO/LUMO", "溶剂化自由能", "简正模式"] },
      { name: "有机光伏给体 / 受体", abbr: "OPV", sample: "PM6:Y6", fields: ["分子基础信息", "物性数据", "表征图谱", "激发能/发射能", "HOMO/LUMO", "溶剂化自由能", "简正模式"] },
      { name: "有机半导体聚合物", abbr: "OSP", sample: "P3HT", fields: ["分子基础信息", "物性数据", "表征图谱", "激发能/发射能", "HOMO/LUMO", "溶剂化自由能", "简正模式"] }
    ],
    methods: {
      open: { key: "open", label: "开源数据获取", tag: "rw-tag--open", desc: "通过 Python 爬虫抓取 PubChem / CCDC 的分子基础信息与物性数据，并解析 JACS / Angew 等文献中的计算数据" },
      buy: { key: "buy", label: "数据购买 / 自采数据", tag: "rw-tag--buy", desc: "从已购买授权的 SciFinder / Reaxys 商用数据库中导入高可信度 OLED 材料与药物分子数据" },
      calc: { key: "calc", label: "数据计算", tag: "rw-tag--calc", desc: "上传 Gaussian16 计算输入 / 输出文件，由系统校验完整性、合规性并提取结构化数据" }
    },
    openDbs: [
      {
        key: "pubchem", name: "PubChem（化合物数据库）", meta: "开放 API · 官方 2026.08 数据版本",
        datasets: [
          { name: "有机光电材料基础数据集", desc: "含中英文名称、分子式、分子量与三维结构 · 共 842 条记录", count: 842 },
          { name: "有机光电材料物性数据集", desc: "含密度、熔点、沸点、闪点与折射率 · 共 516 条记录", count: 516 },
          { name: "分子编号与 CAS 对照数据集", desc: "含 CAS 号、InChIKey、SMILES · 共 1,120 条记录", count: 1120 }
        ]
      },
      {
        key: "ccdc", name: "CCDC（剑桥结构数据库）", meta: "开放 API · CSD 2026.1 数据版本",
        datasets: [
          { name: "有机晶体结构数据集", desc: "含晶胞参数、空间群、原子坐标与键长键角", count: 648 },
          { name: "分子构象数据集", desc: "含基态构象与堆积方式", count: 312 }
        ]
      }
    ],
    buyDbs: [
      { key: "b-scifinder", name: "SciFinder（化学文献数据库）", meta: "已购买 · 授权有效期至 2027-06-30", datasets: [{ name: "SciFinder 文献计算数据集", desc: "含文献报道的激发能、发射能与量子产率", count: 1260 }, { name: "商用 OLED 材料物性数据", desc: "含熔点、沸点、溶解性与折射率", count: 430 }] },
      { key: "b-reaxys", name: "Reaxys（化学信息数据库）", meta: "已购买 · 机构订阅", datasets: [{ name: "Reaxys 高可信度物性数据", desc: "含实测熔点、闪点与密度", count: 980 }, { name: "Reaxys 合成路线数据", desc: "含前驱体与合成条件", count: 260 }] },
      { key: "b-jacs", name: "JACS / Angew 文献专题数据包", meta: "自采 · 文献解析入库", datasets: [{ name: "文献激发能数据集", desc: "从 JACS / Angew 全文解析的计算数据", count: 540 }] },
      { key: "b-self", name: "课题组自采数据包（OLED 分子）", meta: "自采 · 本地上传", datasets: [{ name: "自采荧光量子产率数据", desc: "自测发射波长与量子产率", count: 180 }] }
    ],
    dbVersions: { pubchem: "2026.08", ccdc: "CSD 2026.1", "b-scifinder": "2026.09", "b-reaxys": "2026.07", "b-jacs": "2026.06", "b-self": "V0.0（自采）" },
    calcOutputs: [
      { key: "LOG", desc: "Gaussian16 计算日志文件：激发能、发射能、振荡强度" },
      { key: "FCHK", desc: "格式化检查点文件：轨道能级、电子密度" },
      { key: "OUT", desc: "Gaussian16 输出文件：几何优化与频率结果" },
      { key: "MOLDEN", desc: "轨道与简正模式输出文件：HOMO-LUMO、振动模式" }
    ],
    calcInputs: ["GJF", "CHK", "MOL", "PDB"],
    calcInputDesc: { GJF: "Gaussian 计算输入卡（含方法与基组）", CHK: "检查点文件（波函数续算）", MOL: "初始分子结构文件", PDB: "三维坐标文件" },
    calcCompliance: [
      { key: "method", name: "计算方法（泛函）", rule: "B3LYP / CAM-B3LYP 或更高精度", bad: "检测到 HF 方法，与本库标准（B3LYP 及以上）不一致", fix: "重新计算" },
      { key: "basis", name: "基组", rule: "≥ def2-SVP", bad: "基组为 STO-3G，低于标准阈值 def2-SVP", fix: "重新计算" },
      { key: "solvent", name: "溶剂模型", rule: "必须显式声明（PCM / SMD / 气相）", bad: "未声明溶剂模型，激发能数据不可比", fix: "补充声明或重新计算" },
      { key: "scf", name: "SCF 收敛判据", rule: "≤ 1×10⁻⁶", bad: "SCF 收敛判据为 1×10⁻⁴，低于精度要求", fix: "重新计算" },
      { key: "dispersion", name: "色散校正", rule: "启用 GD3(BJ) 色散校正", bad: "未启用色散校正，构象能将系统性偏高", fix: "低精度入库" }
    ],
    mediaExt: "mol",
    payloadTitle: "分子结构 / 激发态数据 / 光谱与轨道数据",
    payload: {
      分子结构: { 分子式: "C22H30N2O2S2", 分子量: "418.62 g/mol", 分子编号: "CAS 1446789-12-4", 键长: "C-S 1.74 Å", 键角: "C-S-C 98.6°", 三维构象: "平面共轭骨架" },
      激发态数据: { 激发能: "2.14 eV", 发射能: "1.86 eV", 跃迁偶极矩: "3.42 Debye", 跃迁类型: "π → π*（S0 → S1）", 振荡强度: "0.68", 斯托克斯位移: "0.28 eV" },
      光谱与轨道: { "HOMO 能级": "-5.12 eV", "LUMO 能级": "-2.98 eV", "HOMO-LUMO 能隙": "2.14 eV", 溶剂模型: "PCM（甲苯）", 溶剂化自由能: "-8.60 kcal/mol", 简正模式: "1,742 cm⁻¹（C=C 伸缩）" }
    },
    payloadJson: '{&nbsp;&quot;molecule&quot;:&nbsp;&quot;DPP-DTT&quot;,<br>'
      + '&nbsp;&nbsp;<span class="k">&quot;formula&quot;</span>:&nbsp;<span class="s">&quot;C22H30N2O2S2&quot;</span>,&nbsp;<span class="k">&quot;mw&quot;</span>:&nbsp;<span class="n">418.62</span>,&nbsp;<span class="k">&quot;cas&quot;</span>:&nbsp;<span class="s">&quot;1446789-12-4&quot;</span>&nbsp;},<br>'
      + '&nbsp;&nbsp;<span class="k">&quot;excitation&quot;</span>:&nbsp;{&nbsp;<span class="k">&quot;e_exc&quot;</span>:&nbsp;<span class="n">2.14</span>,&nbsp;<span class="k">&quot;e_emi&quot;</span>:&nbsp;<span class="n">1.86</span>,&nbsp;<span class="k">&quot;mu&quot;</span>:&nbsp;<span class="n">3.42</span>,&nbsp;<span class="k">&quot;unit&quot;</span>:&nbsp;<span class="s">&quot;eV / Debye&quot;</span>&nbsp;},<br>'
      + '&nbsp;&nbsp;<span class="k">&quot;orbitals&quot;</span>:&nbsp;{&nbsp;<span class="k">&quot;homo&quot;</span>:&nbsp;<span class="n">-5.12</span>,&nbsp;<span class="k">&quot;lumo&quot;</span>:&nbsp;<span class="n">-2.98</span>,&nbsp;<span class="k">&quot;gap&quot;</span>:&nbsp;<span class="n">2.14</span>,&nbsp;<span class="k">&quot;solvent&quot;</span>:&nbsp;<span class="s">&quot;PCM-toluene&quot;</span>&nbsp;}<br>}',
    entryMethodRows: [
      ["PubChem / CCDC 等公开库", "定制插件批量导入", "文件头含 “PubChem” / “CSD” 标识", "采集参数配置"],
      ["SciFinder / Reaxys 商用库", "定制插件批量导入", "商用授权文件头校验", "采购范围核对"],
      ["Gaussian16 自主计算数据", "自动化流程录入", "包含 GJF+CHK+MOL/PDB", "参数合规性复核"],
      ["文献提取数据（JACS / Angew）", "手动输入", "无法自动识别", "全文录入"],
      ["用户上传数据", "手动输入 + 自动校验", "文件格式识别", "质量审核"]
    ],
    entrySources: [
      { key: "pubchem", name: "PubChem / CCDC 等公开库", rec: "定制插件批量导入", rule: '文件头含 "PubChem" / "CSD" 标识', point: "采集参数配置", plugin: "PubChemPlugin" },
      { key: "ccdc", name: "CCDC 剑桥结构数据库", rec: "定制插件批量导入", rule: '文件头含 "CSD" 标识', point: "采集参数配置", plugin: "CCDCPlugin" },
      { key: "gaussian", name: "Gaussian16 自主计算数据", rec: "自动化流程录入", rule: "包含 GJF+CHK+MOL/PDB", point: "参数合规性复核", plugin: "GaussianAutoFlow" },
      { key: "literature", name: "文献提取数据（JACS / Angew）", rec: "手动输入", rule: "无法自动识别", point: "全文录入", plugin: "-" },
      { key: "user", name: "用户上传数据", rec: "手动输入 + 自动校验", rule: "文件格式识别", point: "质量审核", plugin: "AutoValidator" }
    ],
    dataTypeCodes: { "基础信息对象": "BAS", "物理性质对象": "PHY", "表征图谱对象": "SPC", "计算数据对象": "CAL" },
    entryManualFields: [
      { key: "formula", label: "分子式", req: true, ph: "如 C22H30N2O2S2", rule: "formula", msg: "分子式格式不正确，示例：C22H30N2O2S2" },
      { key: "mw", label: "分子量", req: true, unit: "g/mol", rule: "pos", msg: "分子量必须为正数" },
      { key: "name", label: "中英文名称", req: true, ph: "如 DPP-DTT / 吡咯并吡咯二酮", rule: "text" },
      { key: "code", label: "分子编号 / CAS", req: true, ph: "如 1446789-12-4", rule: "text" },
      { key: "dataType", label: "数据类型", req: true, type: "select", opts: ["基础信息对象", "物理性质对象", "表征图谱对象", "计算数据对象"], rule: "text" },
      { key: "meltingPoint", label: "熔点", req: true, unit: "℃", rule: "range", min: -200, max: 500, msg: "熔点超出合理范围（-200 ~ 500 ℃）" },
      { key: "flashPoint", label: "闪点", req: false, unit: "℃", rule: "range", min: -200, max: 500, msg: "闪点超出合理范围（-200 ~ 500 ℃）" },
      { key: "bandGap", label: "HOMO-LUMO 能隙", req: true, unit: "eV", rule: "gap", msg: "HOMO-LUMO 能隙超出合理范围（0-10 eV）" },
      { key: "excitation", label: "激发能", req: false, unit: "eV", rule: "gap", msg: "激发能超出合理范围（0-10 eV）" },
      { key: "solvation", label: "溶剂化自由能", req: false, unit: "kcal/mol", rule: "fe", msg: "溶剂化自由能应 ≤ 0，请确认溶剂模型" },
      { key: "dipole", label: "跃迁偶极矩", req: false, unit: "Debye", rule: "pos", msg: "跃迁偶极矩必须为正数" }
    ],
    entryCalcParams: [
      { key: "software", label: "计算软件", type: "select", opts: ["Gaussian16", "ORCA", "Turbomole", "PSI4"], std: "—", neutral: true },
      { key: "method", label: "计算方法（泛函）", type: "select", opts: ["B3LYP", "CAM-B3LYP", "ωB97XD", "HF"], std: "B3LYP 及以上", bad: ["HF"], msg: "检测到 HF 方法，与本库标准（B3LYP 及以上）不一致" },
      { key: "basis", label: "基组", type: "select", opts: ["def2-SVP", "def2-TZVP", "6-31G*", "STO-3G"], std: "≥ def2-SVP", bad: ["STO-3G", "6-31G*"], msg: "基组低于标准阈值 def2-SVP" },
      { key: "solvent", label: "溶剂模型", type: "select", opts: ["PCM", "SMD", "气相"], std: "必须显式声明", neutral: true },
      { key: "scf", label: "SCF 收敛判据", std: "≤ 1e-6", max: 0.000001, msg: "SCF 收敛判据低于精度要求 1e-6" },
      { key: "dispersion", label: "色散校正", type: "select", opts: ["GD3(BJ)", "GD2", "无"], std: "启用 GD3(BJ)", bad: ["无"], msg: "未启用色散校正，构象能将系统性偏高" }
    ],
    entryManualSteps: [
      { who: "数据录入员", act: "选择“新增材料”", sys: "显示有机光电材料标准录入表单（基于 1.2 节字段定义）", check: "—", out: "空白录入界面" },
      { who: "数据录入员", act: "填写必填字段（分子式、分子量、熔点、HOMO-LUMO 等）", sys: "实时校验：分子式元素符号有效性、数值范围", check: "必填项完整性、值域合法性", out: "已填数据" },
      { who: "数据录入员", act: "上传结构文件（MOL / PDB / CIF）", sys: "解析结构文件，自动填充原子坐标、键长键角", check: "文件格式合规性", out: "自动填充的字段" },
      { who: "数据录入员", act: "填写计算参数（软件、泛函、基组、溶剂模型等）", sys: "与标准阈值（1.4 节）对比", check: "参数合规性", out: "计算参数记录" },
      { who: "系统", act: "—", sys: "生成唯一标识：OP-数据类型-序号", check: "数据库查询最大序号 +1", out: "材料唯一标识" },
      { who: "数据录入员", act: "提交数据", sys: "进入审核队列", check: "触发第 2.2.4 节审核流程", out: "提交状态" }
    ],
    entryBatchSteps: [
      { who: "数据录入员", act: "选择批量导入入口", sys: "显示数据源类型选择界面", check: "选择正确的数据源类型", out: "数据源配置" },
      { who: "数据录入员", act: "上传数据包（ZIP）或配置 API", sys: "解压 / 解析数据包，列出文件清单", check: "文件完整性检查", out: "文件清单" },
      { who: "系统", act: "—", sys: "调用对应解析插件（PubChem / CCDC / Gaussian16）", check: "按数据源类型匹配解析器", out: "解析后的结构化数据" },
      { who: "系统", act: "—", sys: "按录入规范表（1.2 节）自动映射字段", check: "字段名匹配、类型转换", out: "字段映射结果" },
      { who: "系统", act: "—", sys: "执行自动审核（交叉对比 + 可重复性 + 格式统一）", check: "第 2.2.3 节审核规则", out: "审核状态" },
      { who: "数据录入员", act: "查看并确认批处理结果", sys: "显示成功 / 失败条数及明细", check: "失败条目需人工处理", out: "入库确认" }
    ],
    entryRules: [
      ["分子式", "正则：[A-Z][a-z]?\\d*（可重复）", "“分子式格式不正确，示例：C22H30N2O2S2”"],
      ["HOMO-LUMO 能隙", "≥ 0 且 ≤ 10", "“HOMO-LUMO 能隙超出合理范围（0-10 eV）”"],
      ["溶剂化自由能", "≤ 0（稳定溶剂化）", "“溶剂化自由能应 ≤ 0，请确认溶剂模型”"],
      ["分子量", "> 0", "“分子量必须为正数”"],
      ["熔点 / 闪点", "-200 ~ 500 ℃", "“熔点超出合理范围（-200 ~ 500 ℃）”"]
    ],
    manualDefaults: {
      form: { dataType: "计算数据对象" },
      calc: { software: "Gaussian16", method: "B3LYP", basis: "def2-TZVP", solvent: "PCM", scf: "1e-6", dispersion: "GD3(BJ)" }
    },
    demoFile: "DPP-DTT.mol",
    demoParse: { formula: "C22H30N2O2S2", mw: "418.62", name: "DPP-DTT", code: "1446789-12-4", meltingPoint: "286", flashPoint: "312", bandGap: "2.14", excitation: "2.14", solvation: "-8.60", dipole: "3.42" },
    procFlow: [
      { n: "数据策划", d: "明确数据产品目标用途、格式与精度要求" },
      { n: "基础数据筛选", d: "按“分子量 < 500 + 有光电性能”筛选" },
      { n: "标准化预处理", d: "格式统一、误差修正、完整性整理" },
      { n: "加工模型构建", d: "构建激发能预测等性质的加工模型" },
      { n: "数据产品生产", d: "如“OLED 红光材料数据集”" },
      { n: "质量评价", d: "数据准确性校验" }
    ],
    procStepTitles: ["数据策划", "基础数据筛选", "标准化预处理", "加工模型构建", "数据产品生产", "质量评价"],
    procS1: { head: ["活动", "操作人", "输入", "输出", "内容"], rows: [["需求分析", "数据加工工程师", "用户需求 / 项目要求", "数据产品规格文档", "明确应用需求：目标材料体系（如 OLED 红光材料）、输出格式与精度要求"]] },
    procS2: { head: ["活动", "操作人", "系统行为", "筛选条件", "输出"], rows: [
      ["数据筛选", "数据加工工程师", "执行 SQL 查询 + 质量过滤", "质量等级 = A 级 或 B 级", "筛选后的数据集合"],
      ["数据筛选", "数据加工工程师", "按材料类型分组", "分子量 < 500 且具备光电性能数据", "分组清单"]
    ] },
    procS3: { head: ["子步骤", "操作人", "系统行为", "处理规则", "输出"], rows: [
      ["格式统一", "系统", "自动执行格式转换脚本", "mol / cif → 标准 pdb；txt 谱图数据 → jpg 图谱", "标准格式文件"],
      ["单位统一", "系统", "自动执行单位换算", "非标准单位 → 标准单位（第 1.4 节单位表）", "带标准单位的数据"],
      ["缺失值", "系统", "标记缺失字段", "缺失率 ≤ 5% 时标注 “N/A”；> 5% 退回", "缺失值报告"],
      ["异常值检测", "系统", "执行异常检测算法", "超出 3σ 范围或物理不合理（如熔点 > 500 ℃ 的有机小分子）", "异常值清单"],
      ["异常值修正", "数据加工工程师", "人工复核异常值", "剔除明显错误数据，或通过相似分子预测补充（如闪点）", "修正记录"]
    ] },
    procS4: { head: ["数据类型", "加工模型 / 算法", "输入", "处理逻辑", "输出"], rows: [
      ["性质数据", "激发能预测模型", "分子结构与已知激发能样本", "基于分子指纹回归预测激发能 / 发射能", "预测的激发能、发射能"],
      ["图谱数据", "图谱标准化模型", "红外 / 拉曼 / 核磁原始谱图", "统一波数轴、分辨率、标注与图片格式", "标准化 PNG 图谱"],
      ["结构数据", "分子结构验证模型", "MOL / PDB / CIF 文件", "校验原子坐标合理性、键长键角范围", "验证后的结构文件"]
    ] },
    procS5: { head: ["数据产品类型", "加工操作", "输出格式", "输出用途"], rows: [
      ["AI 训练数据集", "数据清洗 + 特征工程 + 格式转换", "CSV / JSON + 数据字典", "机器学习模型训练"],
      ["科研参考数据集", "数据整理 + 可视化渲染", "PDF 报告 + JSON", "科研人员查阅"],
      ["跨库融通数据集", "格式转换 + 元数据补全", "JSON（符合 OPTIMADE 格式）", "与主平台融通"]
    ] },
    procS6: { head: ["评价维度", "评价方法", "合格标准", "不合格处理"], rows: [
      ["数据来源质量", "检查来源可信度分级", "来源为 1 级或 2 级", "标记“来源待验证”"],
      ["加工模型质量", "验证模型输出与输入一致性", "激发能预测偏差 < 5%", "调整模型参数"],
      ["数据产品质量", "抽样检测（AQL = 1%）", "缺陷率 < 1%", "返工处理"]
    ] },
    procVersion: { head: ["版本阶段", "版本号格式", "标记位置", "说明"], rows: [
      ["原始版", "V0.0", "元数据字段 “data_version”", "采集后的原始数据"],
      ["标准化版", "V1.0", "元数据字段 “data_version”", "完成标准化预处理"],
      ["产品版", "V2.0", "元数据字段 “data_version”", "完成数据产品生产"]
    ] },
    procModels: [
      { key: "stat", name: "激发能预测模型", type: "性质数据", input: "分子结构与已知激发能样本", logic: "基于分子指纹回归预测激发能 / 发射能", out: "预测的激发能、发射能" },
      { key: "image", name: "图谱标准化模型", type: "图谱数据", input: "红外 / 拉曼 / 核磁原始谱图", logic: "统一波数轴、分辨率、标注与图片格式", out: "标准化 PNG 图谱" },
      { key: "struct", name: "分子结构验证模型", type: "结构数据", input: "MOL / PDB / CIF 文件", logic: "校验原子坐标合理性、键长键角范围", out: "验证后的结构文件" }
    ],
    procProducts: [
      { key: "ai", name: "AI 训练数据集", op: "数据清洗 + 特征工程 + 格式转换", format: "CSV / JSON + 数据字典", use: "机器学习模型训练" },
      { key: "sci", name: "科研参考数据集", op: "数据整理 + 可视化渲染", format: "PDF 报告 + JSON", use: "科研人员查阅" },
      { key: "cross", name: "跨库融通数据集", op: "格式转换 + 元数据补全", format: "JSON（符合 OPTIMADE 格式）", use: "与主平台融通" }
    ],
    procQuality: [
      { key: "source", dim: "数据来源质量", method: "检查来源可信度分级", std: "来源为 1 级或 2 级", fix: "标记“来源待验证”" },
      { key: "model", dim: "加工模型质量", method: "验证模型输出与输入一致性", std: "激发能预测偏差 < 5%", fix: "调整模型参数" },
      { key: "product", dim: "数据产品质量", method: "抽样检测（AQL = 1%）", std: "缺陷率 < 1%", fix: "返工处理" }
    ],
    modelRows: {
      stat: [
        { item: "激发能（DPP-DTT）", input: "2.08 / 2.14 / 2.19 eV", logic: "分子指纹回归 + 交叉验证", out: "2.14 ± 0.06 eV（95% CI：2.09 ~ 2.19）" },
        { item: "发射能（DPP-DTT）", input: "1.82 / 1.86 / 1.91 eV", logic: "分子指纹回归 + 交叉验证", out: "1.86 ± 0.05 eV" }
      ],
      image: [
        { item: "红外光谱", input: "ir_raw.txt（1,600 点，波数轴不一致）", logic: "统一波数轴、分辨率、标注、格式", out: "ir_std.png（1600×1200，统一标注）" },
        { item: "核磁共振谱", input: "nmr_raw.txt（800×600）", logic: "统一化学位移轴、分辨率、标注、格式", out: "nmr_std.png（1600×1200，统一标注）" }
      ],
      struct: [
        { item: "DPP-DTT 结构", input: "DPP-DTT.mol", logic: "校验原子坐标合理性、键长键角范围", out: "DPP-DTT_verified.pdb（C-S 键长 1.74 Å，合理）" },
        { item: "P3HT 片段结构", input: "P3HT.mol", logic: "校验原子坐标合理性、键长键角范围", out: "P3HT_verified.pdb（C-C 键长 1.45 Å，合理）" }
      ]
    },
    outliers: [
      { key: "o1", name: "DPP-DTT · 熔点", value: "612 ℃", sigma: "4.6σ", fixed: "", keep: false },
      { key: "o2", name: "PM6 · 闪点", value: "-48 ℃", sigma: "3.8σ", fixed: "", keep: false }
    ],
    procNamePh: "如：OLED 红光材料数据集加工",
    listCols: [{ key: "name", label: "中英文名称" }, { key: "mw", label: "分子量", unit: " g/mol" }, { key: "bandGap", label: "HOMO-LUMO", unit: " eV" }],
    tasks: [
      { id: "OP-CL-2026-0922-001", name: "OLED 发光分子（DPP-DTT）激发能数据采集", method: "open", desc: "从 PubChem 开放 API 采集 DPP-DTT 分子基础信息与物性数据", status: "已完成", createdAt: "2026-09-22 10:24", source: "PubChem（化合物数据库）", version: "2026.08", rawFiles: "JSON / MOL", security: "第1级" },
      { id: "OP-CL-2026-0923-002", name: "有机光伏受体（PM6:Y6）物性数据采集", method: "buy", desc: "从已购买 SciFinder 商用数据包导入受体分子熔点、闪点与溶解性数据", status: "已完成", createdAt: "2026-09-23 09:12", source: "SciFinder（化学文献数据库）", version: "2026.09", rawFiles: "JSON / CSV", security: "第1级" },
      { id: "OP-CL-2026-0923-003", name: "有机半导体聚合物（P3HT）激发态数据计算", method: "calc", desc: "基于 Gaussian16 计算输出文件提取激发能、发射能与 HOMO-LUMO 能级", status: "待确认", createdAt: "2026-09-23 16:48", source: "本地计算输出（LOG / FCHK）", version: "V0.0", rawFiles: "JSON", security: "第2级" }
    ]
  };
