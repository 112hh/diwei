
  /* ---------------------------------------------------- 电解质材料（R18~R21） */
  MAT.electrolyte = {
    code: "EL",
    short: "电解质材料",
    title: "电解质材料数据采集加工处理",
    headDesc: "面向电解质材料数据的采集、录入与加工全流程管理：支持 Materials Project / PubChem / ICSD 开源抓取、Reaxys 商用数据导入与 VASP / Gaussian 自主计算提取，<br>内置字段级校验、异常处理队列与质量评价规则，采集结果确认后统一入库。",
    introTitle: "电解质材料数据库数据资源共包含 3 类核心对象（按电解质类型划分），采集 / 录入 / 加工均围绕这些对象展开。",
    introBanner: "3 类核心对象：有机电解液对象、固态有机电解质对象、固态无机电解质对象。各资源对象包含的数据字段如下：",
    introTip: "采集参数中的「性质范围」即针对上述资源对象的性质字段设置取值范围，用于过滤落在范围外的数据记录。",
    objectsNote: "电解质材料 3 类核心对象",
    typeTip: "选择本次采集的电解质材料类型，不同类型对应不同的性质字段模板。",
    buyNote: "仅展示当前账号已完成采购或已完成自采登记的数据库，勾选后可从对应数据包中导入电解质材料数据。",
    calcTip: "固态电解质计算须声明泛函与截断能，离子输运相关性质需标注测试温度，参数不合规将进入合规性校验报告分支。",
    taskNamePh: "请输入采集任务名称，如：固态无机电解质（LLZO）离子电导率数据采集",
    doneNote: "审核通过并完成入库的电解质材料数据，可直接送去资源加工。",
    objects: [
      { name: "有机电解液对象", fields: "基础信息（名称、分子式、结构）、物性（熔点、燃点、介电常数）、表征图谱（红外、核磁共振）、计算数据（HOMO-LUMO、溶剂化自由能）" },
      { name: "固态有机电解质对象", fields: "基础信息（名称、单体结构、聚合物结构）、物性（玻璃化转变温度、拉伸模量）、计算数据（结合能、摩尔热容）" },
      { name: "固态无机电解质对象", fields: "基础信息（名称、化学式、晶体结构）、物性（离子电导率、机械强度）、表征图谱（XRD、XAS）、计算数据（带隙、态密度、能带结构）" }
    ],
    systems: [
      { name: "有机电解液", abbr: "LE", sample: "LiFSI-DME", fields: ["基础信息", "物性数据", "表征图谱", "计算数据", "离子电导率", "机械强度", "界面兼容性"] },
      { name: "固态有机电解质", abbr: "SPE", sample: "PEO-LiTFSI", fields: ["基础信息", "物性数据", "表征图谱", "计算数据", "离子电导率", "机械强度", "界面兼容性"] },
      { name: "固态无机电解质", abbr: "SIE", sample: "Li6PS5Cl", fields: ["基础信息", "物性数据", "表征图谱", "计算数据", "离子电导率", "机械强度", "界面兼容性"] }
    ],
    methods: {
      open: { key: "open", label: "开源数据获取", tag: "rw-tag--open", desc: "通过 Python 爬虫抓取 Materials Project 的固态无机电解质数据、PubChem 的有机电解液物性数据与 ICSD 的晶体衍射数据" },
      buy: { key: "buy", label: "数据购买 / 自采数据", tag: "rw-tag--buy", desc: "从已购买授权的 Reaxys 电解质应用数据与 ICSD 全量晶体结构数据中导入" },
      calc: { key: "calc", label: "数据计算", tag: "rw-tag--calc", desc: "上传 VASP / Gaussian 计算输入 / 输出文件，由系统校验完整性、合规性并提取结构化数据" }
    },
    openDbs: [
      {
        key: "mp", name: "Materials Project（材料项目数据库）", meta: "开放 API · 官方 v2025.03 数据版本",
        datasets: [
          { name: "固态无机电解质结构数据集", desc: "含 LLZO 晶格常数、空间群与原子坐标 · 共 486 条记录", count: 486 },
          { name: "带隙与能带结构数据集", desc: "含带隙、能带结构与态密度", count: 372 },
          { name: "离子输运性质数据集", desc: "含迁移能垒与离子电导率估算", count: 208 }
        ]
      },
      {
        key: "pubchem", name: "PubChem（化合物数据库）", meta: "开放 API · 官方 2026.08 数据版本",
        datasets: [
          { name: "有机电解液物性数据集", desc: "含熔点、燃点、介电常数与粘度 · 共 315 条记录", count: 315 },
          { name: "溶剂 / 锂盐基础数据集", desc: "含分子式、分子量与 SMILES", count: 642 }
        ]
      },
      {
        key: "icsd", name: "ICSD（无机晶体结构数据库）", meta: "开放 API · 2026.1 数据版本",
        datasets: [
          { name: "晶体衍射结构数据集", desc: "含 CIF 原文件与空间群信息", count: 1240 },
          { name: "结构精修数据集", desc: "含 Rietveld 精修结果", count: 268 }
        ]
      }
    ],
    buyDbs: [
      { key: "b-reaxys", name: "Reaxys 电解质应用数据包", meta: "已购买 · 授权有效期至 2027-03-31", datasets: [{ name: "电解液与电极兼容性数据", desc: "含界面副反应与相容性评价", count: 420 }, { name: "电解液配方物性数据", desc: "含实测电导率与电化学窗口", count: 356 }] },
      { key: "b-icsd", name: "ICSD 全量晶体结构数据", meta: "已购买 · 机构订阅", datasets: [{ name: "全量无机晶体结构", desc: "授权范围内全量 CIF 文件", count: 1860 }, { name: "硫化物固态电解质专题", desc: "含 Li6PS5Cl / LGPS 系列结构", count: 240 }] },
      { key: "b-self", name: "课题组自采数据包（硫化物电解质）", meta: "自采 · 本地上传", datasets: [{ name: "自采电导率测试数据", desc: "自测离子电导率与活化能", count: 160 }] }
    ],
    dbVersions: { mp: "v2025.03", pubchem: "2026.08", icsd: "2026.1", "b-reaxys": "2026.07", "b-icsd": "2026.1", "b-self": "V0.0（自采）" },
    calcOutputs: [
      { key: "OUTCAR", desc: "VASP 输出详细信息文件：能量、受力、收敛信息" },
      { key: "DOSCAR", desc: "态密度输出文件：带隙、态密度、费米能级" },
      { key: "EIGENVAL", desc: "能带本征值文件：能带结构、带隙" },
      { key: "CONTCAR", desc: "结构输出文件：优化后晶格与原子坐标" }
    ],
    calcInputs: ["INCAR", "POSCAR", "POTCAR", "KPOINTS"],
    calcInputDesc: { INCAR: "计算控制参数", POSCAR: "初始结构文件", POTCAR: "赝势文件", KPOINTS: "K 点采样设置" },
    calcCompliance: [
      { key: "functional", name: "交换关联泛函", rule: "PBE / PBEsol 或更高精度泛函", bad: "检测到 LDA 泛函，与本库标准（PBE / PBEsol）不一致", fix: "重新计算" },
      { key: "cutoff", name: "平面波截断能", rule: "≥ 400 eV", bad: "截断能为 320 eV，低于标准阈值 400 eV", fix: "重新计算" },
      { key: "kpoints", name: "K 点密度", rule: "≥ 20 Å⁻¹（固态体系）", bad: "K 点密度为 12 Å⁻¹，低于标准阈值 20 Å⁻¹", fix: "低精度入库" },
      { key: "force", name: "力收敛判据", rule: "≤ 0.01 eV/Å", bad: "力收敛判据为 0.05 eV/Å，低于精度要求", fix: "低精度入库" },
      { key: "energy", name: "能量收敛判据", rule: "≤ 1×10⁻⁵ eV", bad: "能量收敛判据为 1×10⁻³ eV，低于精度要求", fix: "重新计算" }
    ],
    mediaExt: "cif",
    payloadTitle: "结构信息 / 离子输运数据 / 电化学窗口",
    payload: {
      结构信息: { 化学式: "Li6PS5Cl", 晶体结构: "Argyrodite（硫银锗矿型）", 空间群: "F-43m", "晶格常数 a": "10.15 Å", 晶胞体积: "1046.2 Å³", 原子坐标: "Li(0.25,0.25,0.25)；P(0,0,0)；S(0.38,0.38,0.12)" },
      离子输运数据: { "离子电导率": "3.2×10⁻³ S/cm（298 K）", 活化能: "0.31 eV", 迁移离子: "Li⁺", 迁移通道: "四面体-四面体跃迁", 扩散系数: "2.8×10⁻⁸ cm²/s" },
      电化学窗口: { "氧化电位": "2.6 V（vs. Li/Li⁺）", "还原电位": "0.4 V（vs. Li/Li⁺）", 电化学窗口: "2.2 V", 带隙: "2.35 eV", 态密度: "价带顶以 S-3p 为主", 费米能级: "1.18 eV" }
    },
    payloadJson: '{&nbsp;&quot;material&quot;:&nbsp;&quot;Li6PS5Cl&quot;,<br>'
      + '&nbsp;&nbsp;<span class="k">&quot;structure&quot;</span>:&nbsp;{&nbsp;<span class="k">&quot;formula&quot;</span>:&nbsp;<span class="s">&quot;Li6PS5Cl&quot;</span>,&nbsp;<span class="k">&quot;space_group&quot;</span>:&nbsp;<span class="s">&quot;F-43m&quot;</span>,&nbsp;<span class="k">&quot;a&quot;</span>:&nbsp;<span class="n">10.15</span>&nbsp;},<br>'
      + '&nbsp;&nbsp;<span class="k">&quot;transport&quot;</span>:&nbsp;{&nbsp;<span class="k">&quot;conductivity&quot;</span>:&nbsp;<span class="n">3.2e-3</span>,&nbsp;<span class="k">&quot;unit&quot;</span>:&nbsp;<span class="s">&quot;S/cm&quot;</span>,&nbsp;<span class="k">&quot;ea&quot;</span>:&nbsp;<span class="n">0.31</span>,&nbsp;<span class="k">&quot;carrier&quot;</span>:&nbsp;<span class="s">&quot;Li+&quot;</span>&nbsp;},<br>'
      + '&nbsp;&nbsp;<span class="k">&quot;window&quot;</span>:&nbsp;{&nbsp;<span class="k">&quot;oxid&quot;</span>:&nbsp;<span class="n">2.6</span>,&nbsp;<span class="k">&quot;red&quot;</span>:&nbsp;<span class="n">0.4</span>,&nbsp;<span class="k">&quot;gap&quot;</span>:&nbsp;<span class="n">2.35</span>&nbsp;}<br>}',
    entryMethodRows: [
      ["Materials Project / ICSD 等公开库", "定制插件批量导入", "文件头含 “Materials Project” / “ICSD” 标识", "采集参数配置"],
      ["Reaxys 商用库（电解质应用数据）", "定制插件批量导入", "商用授权文件头校验", "采购范围核对"],
      ["VASP / Gaussian 自主计算数据", "自动化流程录入", "包含 INCAR+POSCAR+POTCAR+KPOINTS 或 gjf", "参数合规性复核"],
      ["特殊实验数据（电解液与电极兼容性）", "手动输入", "无法自动识别", "全文录入"],
      ["用户上传数据", "手动输入 + 自动校验", "文件格式识别", "质量审核"]
    ],
    entrySources: [
      { key: "mp", name: "Materials Project 等公开库", rec: "定制插件批量导入", rule: '文件头含 "Materials Project" 标识', point: "采集参数配置", plugin: "MaterialsProjectPlugin" },
      { key: "icsd", name: "ICSD 无机晶体结构数据库", rec: "定制插件批量导入", rule: '文件头含 "ICSD" 标识', point: "采集参数配置", plugin: "ICSDPlugin" },
      { key: "vasp", name: "VASP / Gaussian 自主计算数据", rec: "自动化流程录入", rule: "包含 INCAR+POSCAR+POTCAR+KPOINTS 或 gjf", point: "参数合规性复核", plugin: "VASPAutoFlow" },
      { key: "literature", name: "特殊实验数据（兼容性）", rec: "手动输入", rule: "无法自动识别", point: "全文录入", plugin: "-" },
      { key: "user", name: "用户上传数据", rec: "手动输入 + 自动校验", rule: "文件格式识别", point: "质量审核", plugin: "AutoValidator" }
    ],
    dataTypeCodes: { "基础信息": "BAS", "物性数据": "PHY", "表征图谱": "SPC", "计算数据": "CAL" },
    entryManualFields: [
      { key: "formula", label: "化学式 / 分子式", req: true, ph: "如 Li6PS5Cl", rule: "formula", msg: "化学式格式不正确，示例：Li6PS5Cl" },
      { key: "type", label: "电解质类型", req: true, type: "select", opts: ["有机电解液", "固态有机电解质", "固态无机电解质"], rule: "text" },
      { key: "dataType", label: "数据类型", req: true, type: "select", opts: ["基础信息", "物性数据", "表征图谱", "计算数据"], rule: "text" },
      { key: "name", label: "材料名称", req: true, ph: "如 锂镧锆氧（LLZO）", rule: "text" },
      { key: "crystal", label: "晶体结构 / 空间群", req: false, ph: "如 F-43m", rule: "text" },
      { key: "meltingPoint", label: "熔点", req: false, unit: "℃", rule: "range", min: -200, max: 1600, msg: "熔点超出合理范围（-200 ~ 1600 ℃）" },
      { key: "flashPoint", label: "燃点", req: false, unit: "℃", rule: "range", min: -50, max: 800, msg: "燃点超出合理范围（-50 ~ 800 ℃）" },
      { key: "conductivity", label: "离子电导率", req: true, unit: "S/cm", ph: "如 3.2e-3", rule: "range", min: 0, max: 0.01, msg: "离子电导率超出合理范围（0 ~ 10⁻² S/cm）" },
      { key: "window", label: "电化学窗口", req: false, unit: "V", rule: "pos", msg: "电化学窗口必须为正数" },
      { key: "bandGap", label: "带隙", req: false, unit: "eV", rule: "gap", msg: "带隙值超出合理范围（0-10 eV）" },
      { key: "solvation", label: "溶剂化自由能", req: false, unit: "kcal/mol", rule: "fe", msg: "溶剂化自由能应 ≤ 0，请确认溶剂模型" }
    ],
    entryCalcParams: [
      { key: "software", label: "计算软件", type: "select", opts: ["VASP", "Gaussian16", "CP2K", "LAMMPS"], std: "—", neutral: true },
      { key: "functional", label: "交换关联泛函", type: "select", opts: ["PBE", "PBEsol", "HSE06", "LDA"], std: "PBE / PBEsol 或更高", bad: ["LDA"], msg: "检测到 LDA 泛函，与本库标准（PBE / PBEsol）不一致" },
      { key: "encut", label: "平面波截断能", unit: "eV", std: "≥ 400 eV", min: 400, msg: "截断能低于标准阈值 400 eV" },
      { key: "kpoints", label: "K 点密度", unit: "Å⁻¹", std: "≥ 20 Å⁻¹", min: 20, msg: "K 点密度低于标准阈值 20 Å⁻¹" },
      { key: "force", label: "力收敛判据", unit: "eV/Å", std: "≤ 0.01 eV/Å", max: 0.01, msg: "力收敛判据低于精度要求 0.01 eV/Å" },
      { key: "energy", label: "能量收敛判据", unit: "eV", std: "≤ 1e-5 eV", max: 0.00001, msg: "能量收敛判据低于精度要求 1e-5 eV" }
    ],
    entryManualSteps: [
      { who: "数据录入员", act: "选择“新增材料”", sys: "显示电解质材料标准录入表单（基于 1.2 节字段定义）", check: "—", out: "空白录入界面" },
      { who: "数据录入员", act: "填写必填字段（化学式、电解质类型、离子电导率等）", sys: "实时校验：化学式有效性、数值范围", check: "必填项完整性、值域合法性", out: "已填数据" },
      { who: "数据录入员", act: "上传结构文件（CIF / POSCAR）", sys: "解析结构文件，自动填充晶格常数、原子坐标", check: "文件格式合规性", out: "自动填充的字段" },
      { who: "数据录入员", act: "填写计算参数（软件、泛函、截断能等）", sys: "与标准阈值（1.4 节）对比", check: "参数合规性", out: "计算参数记录" },
      { who: "系统", act: "—", sys: "生成唯一标识：EL-数据类型-序号", check: "数据库查询最大序号 +1", out: "材料唯一标识" },
      { who: "数据录入员", act: "提交数据", sys: "进入审核队列", check: "触发第 2.2.4 节审核流程", out: "提交状态" }
    ],
    entryBatchSteps: [
      { who: "数据录入员", act: "选择批量导入入口", sys: "显示数据源类型选择界面", check: "选择正确的数据源类型", out: "数据源配置" },
      { who: "数据录入员", act: "上传数据包（ZIP）或配置 API", sys: "解压 / 解析数据包，列出文件清单", check: "文件完整性检查", out: "文件清单" },
      { who: "系统", act: "—", sys: "调用对应解析插件（Materials Project / ICSD / VASP）", check: "按数据源类型匹配解析器", out: "解析后的结构化数据" },
      { who: "系统", act: "—", sys: "按录入规范表（1.2 节）自动映射字段", check: "字段名匹配、类型转换", out: "字段映射结果" },
      { who: "系统", act: "—", sys: "执行自动审核（交叉对比 + 可重复性 + 格式统一）", check: "第 2.2.3 节审核规则", out: "审核状态" },
      { who: "数据录入员", act: "查看并确认批处理结果", sys: "显示成功 / 失败条数及明细", check: "失败条目需人工处理", out: "入库确认" }
    ],
    entryRules: [
      ["化学式", "正则：[A-Z][a-z]?\\d*（可重复）", "“化学式格式不正确，示例：Li6PS5Cl”"],
      ["离子电导率", "0 ~ 10⁻² S/cm", "“离子电导率超出合理范围（0 ~ 10⁻² S/cm）”"],
      ["溶剂化自由能", "≤ 0（稳定溶剂化）", "“溶剂化自由能应 ≤ 0，请确认溶剂模型”"],
      ["带隙", "≥ 0 且 ≤ 10", "“带隙值超出合理范围（0-10 eV）”"],
      ["熔点 / 燃点", "熔点 -200 ~ 1600 ℃；燃点 -50 ~ 800 ℃", "“熔点超出合理范围（-200 ~ 1600 ℃）”"]
    ],
    manualDefaults: {
      form: { dataType: "物性数据", type: "固态无机电解质" },
      calc: { software: "VASP", functional: "PBE", encut: "520", kpoints: "24", force: "0.01", energy: "1e-6" }
    },
    demoFile: "LLZO.cif",
    demoParse: { formula: "Li7La3Zr2O12", type: "固态无机电解质", crystal: "Ia-3d", name: "锂镧锆氧（LLZO）", conductivity: "8.5e-4", window: "4.2", bandGap: "4.86", meltingPoint: "1230", flashPoint: "", solvation: "" },
    procFlow: [
      { n: "数据策划", d: "明确应用需求，如“动力电池电解液”" },
      { n: "基础数据筛选", d: "按“燃点 > 150 ℃ + 离子电导率 > 10⁻³ S/m”筛选" },
      { n: "标准化预处理", d: "格式统一、误差修正、完整性整理" },
      { n: "加工模型构建", d: "构建电解质-电极兼容性预测模型" },
      { n: "数据产品生产", d: "如“高安全性电解液数据集”" },
      { n: "质量评价", d: "数据准确性校验" }
    ],
    procStepTitles: ["数据策划", "基础数据筛选", "标准化预处理", "加工模型构建", "数据产品生产", "质量评价"],
    procS1: { head: ["活动", "操作人", "输入", "输出", "内容"], rows: [["需求分析", "数据加工工程师", "用户需求 / 项目要求", "数据产品规格文档", "明确应用需求（如动力电池电解液）、输出格式与精度要求"]] },
    procS2: { head: ["活动", "操作人", "系统行为", "筛选条件", "输出"], rows: [
      ["数据筛选", "数据加工工程师", "执行 SQL 查询 + 质量过滤", "质量等级 = A 级 或 B 级", "筛选后的数据集合"],
      ["数据筛选", "数据加工工程师", "按电解质类型分组", "燃点 > 150 ℃ 且离子电导率 > 10⁻³ S/m", "分组清单"]
    ] },
    procS3: { head: ["子步骤", "操作人", "系统行为", "处理规则", "输出"], rows: [
      ["格式统一", "系统", "自动执行格式转换脚本", "mol / xyz → 标准 pdb；固态体系 → cif / POSCAR；XRD 数据 → jpg 图谱", "标准格式文件"],
      ["单位统一", "系统", "自动执行单位换算", "非标准单位 → 标准单位（第 1.4 节单位表）", "带标准单位的数据"],
      ["缺失值", "系统", "标记缺失字段", "缺失率 ≤ 5% 时标注 “N/A”；> 5% 退回", "缺失值报告"],
      ["异常值检测", "系统", "执行异常检测算法", "超出 3σ 范围或物理不合理（如离子电导率 > 10⁻² S/m 的固态电解质）", "异常值清单"],
      ["异常值修正", "数据加工工程师", "人工复核异常值", "剔除错误数据，或通过相似体系预测补充（如溶剂化自由能）", "修正记录"]
    ] },
    procS4: { head: ["数据类型", "加工模型 / 算法", "输入", "处理逻辑", "输出"], rows: [
      ["性质数据", "兼容性预测模型", "电解质组成与电极材料特征", "预测电解质-电极界面兼容性等级", "兼容性评级结果"],
      ["图谱数据", "图谱标准化模型", "XRD / XAS / 红外 / 核磁原始谱图", "统一坐标轴、分辨率、标注与图片格式", "标准化 PNG 图谱"],
      ["结构数据", "结构优化验证模型", "CIF / POSCAR 文件", "校验原子坐标合理性、键长范围", "验证后的结构文件"]
    ] },
    procS5: { head: ["数据产品类型", "加工操作", "输出格式", "输出用途"], rows: [
      ["AI 训练数据集", "数据清洗 + 特征工程 + 格式转换", "CSV / JSON + 数据字典", "机器学习模型训练"],
      ["科研参考数据集", "数据整理 + 可视化渲染", "PDF 报告 + JSON", "科研人员查阅"],
      ["跨库融通数据集", "格式转换 + 元数据补全", "JSON（符合 OPTIMADE 格式）", "与主平台融通"]
    ] },
    procS6: { head: ["评价维度", "评价方法", "合格标准", "不合格处理"], rows: [
      ["数据来源质量", "检查来源可信度分级", "来源为 1 级或 2 级", "标记“来源待验证”"],
      ["加工模型质量", "验证模型输出与输入一致性", "电导率预测偏差 < 20%", "调整模型参数"],
      ["数据产品质量", "抽样检测（AQL = 1%）", "缺陷率 < 1%", "返工处理"]
    ] },
    procVersion: { head: ["版本阶段", "版本号格式", "标记位置", "说明"], rows: [
      ["原始版", "V0.0", "元数据字段 “data_version”", "采集后的原始数据"],
      ["标准化版", "V1.0", "元数据字段 “data_version”", "完成标准化预处理"],
      ["产品版", "V2.0", "元数据字段 “data_version”", "完成数据产品生产"]
    ] },
    procModels: [
      { key: "stat", name: "兼容性预测模型", type: "性质数据", input: "电解质组成与电极材料特征", logic: "预测电解质-电极界面兼容性等级", out: "兼容性评级结果" },
      { key: "image", name: "图谱标准化模型", type: "图谱数据", input: "XRD / XAS / 红外 / 核磁原始谱图", logic: "统一坐标轴、分辨率、标注与图片格式", out: "标准化 PNG 图谱" },
      { key: "struct", name: "结构优化验证模型", type: "结构数据", input: "CIF / POSCAR 文件", logic: "校验原子坐标合理性、键长范围", out: "验证后的结构文件" }
    ],
    procProducts: [
      { key: "ai", name: "AI 训练数据集", op: "数据清洗 + 特征工程 + 格式转换", format: "CSV / JSON + 数据字典", use: "机器学习模型训练" },
      { key: "sci", name: "科研参考数据集", op: "数据整理 + 可视化渲染", format: "PDF 报告 + JSON", use: "科研人员查阅" },
      { key: "cross", name: "跨库融通数据集", op: "格式转换 + 元数据补全", format: "JSON（符合 OPTIMADE 格式）", use: "与主平台融通" }
    ],
    procQuality: [
      { key: "source", dim: "数据来源质量", method: "检查来源可信度分级", std: "来源为 1 级或 2 级", fix: "标记“来源待验证”" },
      { key: "model", dim: "加工模型质量", method: "验证模型输出与输入一致性", std: "电导率预测偏差 < 20%", fix: "调整模型参数" },
      { key: "product", dim: "数据产品质量", method: "抽样检测（AQL = 1%）", std: "缺陷率 < 1%", fix: "返工处理" }
    ],
    modelRows: {
      stat: [
        { item: "离子电导率（LLZO）", input: "7.9e-4 / 8.5e-4 / 9.1e-4 S/cm", logic: "计算均值、标准差、置信区间", out: "8.5×10⁻⁴ ± 0.6×10⁻⁴ S/cm（95% CI）" },
        { item: "活化能（Li6PS5Cl）", input: "0.29 / 0.31 / 0.33 eV", logic: "计算均值、标准差、置信区间", out: "0.31 ± 0.02 eV" }
      ],
      image: [
        { item: "XRD 图谱", input: "xrd_raw.txt（2θ 轴不一致）", logic: "统一 2θ 轴、分辨率、标注、格式", out: "xrd_std.png（1600×1200，300 dpi）" },
        { item: "XAS 图谱", input: "xas_raw.txt（800×600）", logic: "统一能量轴、分辨率、标注、格式", out: "xas_std.png（1600×1200，300 dpi）" }
      ],
      struct: [
        { item: "LLZO 结构", input: "LLZO.cif", logic: "校验原子坐标合理性、键长范围", out: "LLZO_verified.cif（Zr-O 键长 2.11 Å，合理）" },
        { item: "Li6PS5Cl 结构", input: "Li6PS5Cl.cif", logic: "校验原子坐标合理性、键长范围", out: "Li6PS5Cl_verified.cif（P-S 键长 2.05 Å，合理）" }
      ]
    },
    outliers: [
      { key: "o1", name: "LLZO · 离子电导率", value: "4.6×10⁻² S/cm", sigma: "5.1σ", fixed: "", keep: false },
      { key: "o2", name: "PEO-LiTFSI · 燃点", value: "42 ℃", sigma: "3.4σ", fixed: "", keep: false }
    ],
    procNamePh: "如：高安全性电解液数据集加工",
    listCols: [{ key: "type", label: "电解质类型" }, { key: "conductivity", label: "离子电导率", unit: " S/cm" }, { key: "bandGap", label: "带隙", unit: " eV" }],
    tasks: [
      { id: "EL-CL-2026-0922-001", name: "固态无机电解质（LLZO）晶体结构数据采集", method: "open", desc: "从 Materials Project 开放 API 采集 LLZO 晶格常数、带隙与能带结构数据", status: "已完成", createdAt: "2026-09-22 10:24", source: "Materials Project（材料项目数据库）", version: "v2025.03", rawFiles: "JSON / CIF", security: "第1级" },
      { id: "EL-CL-2026-0923-002", name: "有机电解液（LiFSI-DME）物性数据采集", method: "buy", desc: "从已购买 Reaxys 电解质应用数据包导入电解液与电极兼容性数据", status: "已完成", createdAt: "2026-09-23 09:12", source: "Reaxys 电解质应用数据包", version: "2026.07", rawFiles: "JSON", security: "第1级" },
      { id: "EL-CL-2026-0923-003", name: "硫化物固态电解质（Li6PS5Cl）输运性质计算", method: "calc", desc: "基于 VASP 计算输出文件提取带隙、态密度与离子迁移能垒", status: "待确认", createdAt: "2026-09-23 16:48", source: "本地计算输出（OUTCAR / DOSCAR）", version: "V0.0", rawFiles: "JSON", security: "第2级" }
    ]
  };

  /* ---------------------------------------- 机器学习力场（R22~R24，加工合并在 R24） */
  MAT.mlff = {
    code: "ML",
    short: "机器学习力场",
    title: "机器学习力场数据采集加工处理",
    headDesc: "面向机器学习力场数据的采集、录入与加工全流程管理：支持 QM9 / PDB / PubChem 开源抓取、Reaxys 商用数据导入与 Gromacs / Amber / Q-Chem 自主采样计算提取，<br>内置构象级字段校验、异常处理队列与质量评价规则，采集结果确认后统一入库。",
    introTitle: "机器学习力场数据库数据资源共包含 3 类核心对象（按分子体系类型划分），采集 / 录入 / 加工均围绕这些对象展开。",
    introBanner: "3 类核心对象：有机小分子力场对象、高分子力场对象、蛋白质力场对象。各资源对象包含的数据字段如下：",
    introTip: "采集参数中的「性质范围」即针对上述资源对象的性质字段设置取值范围，用于过滤落在范围外的数据记录。",
    objectsNote: "机器学习力场 3 类核心对象",
    typeTip: "选择本次采集的分子体系类型，不同类型对应不同的性质字段模板。",
    buyNote: "仅展示当前账号已完成采购或已完成自采登记的数据库，勾选后可从对应数据包中导入力场数据。",
    calcTip: "自主采样计算须声明系综（NVT / NPT）与采样温度区间，量子化学标注 CCSD(T) / MP2 与基组，参数不合规将进入合规性校验报告分支。",
    taskNamePh: "请输入采集任务名称，如：有机小分子（H2O）CCSD(T) 能量与受力数据采集",
    doneNote: "审核通过并完成入库的机器学习力场数据，可直接送去资源加工。",
    objects: [
      { name: "有机小分子力场对象", fields: "基础信息（名称、分子式、结构）、采样数据（温度、构象数、RMSD）、计算数据（单分子能量、原子受力、双分子相互作用能）、原子性质（电荷、偶极矩、极化率）" },
      { name: "高分子力场对象", fields: "基础信息（名称、重复单元、片段结构）、采样数据（温度、链段运动频率）、计算数据（片段总能量、原子受力、分子间相互作用能）" },
      { name: "蛋白质力场对象", fields: "基础信息（名称、氨基酸序列、结构）、采样数据（温度、折叠状态）、计算数据（肽键能量、侧链相互作用能、静电相互作用能）" }
    ],
    systems: [
      { name: "有机小分子体系", abbr: "SM", sample: "H2O", fields: ["单分子能量", "原子受力", "双分子相互作用能", "原子电荷", "偶极矩", "极化率", "构象数"] },
      { name: "高分子片段体系", abbr: "PL", sample: "PEO", fields: ["单分子能量", "原子受力", "双分子相互作用能", "原子电荷", "偶极矩", "极化率", "构象数"] },
      { name: "蛋白质体系", abbr: "PT", sample: "Gly-Gly", fields: ["单分子能量", "原子受力", "双分子相互作用能", "原子电荷", "偶极矩", "极化率", "构象数"] }
    ],
    methods: {
      open: { key: "open", label: "开源数据获取", tag: "rw-tag--open", desc: "通过 Python 爬虫抓取 QM9 的小分子能量数据、PDB 的蛋白质二肽 / 三肽结构数据与 PubChem 的小分子基础信息" },
      buy: { key: "buy", label: "数据购买 / 自采数据", tag: "rw-tag--buy", desc: "从已购买授权的 Reaxys 高分子片段分子间相互作用能数据与 ProteinDataBank 蛋白质构象动态数据中导入" },
      calc: { key: "calc", label: "自主采样计算", tag: "rw-tag--calc", desc: "上传 Gromacs / Amber 采样轨迹与 Q-Chem / VASP 计算输出，由系统校验完整性、合规性并提取结构化数据" }
    },
    openDbs: [
      {
        key: "qm9", name: "QM9（量子化学小分子数据集）", meta: "开放 API · 官方 v2024 数据版本",
        datasets: [
          { name: "小分子能量数据集", desc: "含 H2O、CH4 等 CCSD(T) / MP2 能量 · 共 498 条记录", count: 498 },
          { name: "有机小分子力场数据集", desc: "含 CCSD(T)/MP2 能量与原子受力标签 · 共 362 条记录", count: 362 },
          { name: "小分子原子性质数据集", desc: "含原子电荷、偶极矩与极化率", count: 284 }
        ]
      },
      {
        key: "pdb", name: "PDB（蛋白质结构数据库）", meta: "开放 API · 2026.07 数据版本",
        datasets: [
          { name: "蛋白质二肽 / 三肽结构数据集", desc: "含甘氨酸二肽、丙氨酸三肽构象", count: 216 },
          { name: "蛋白质构象动态数据集", desc: "含折叠状态与采样温度标注", count: 148 }
        ]
      },
      {
        key: "pubchem", name: "PubChem（化合物数据库）", meta: "开放 API · 官方 2026.08 数据版本",
        datasets: [
          { name: "小分子基础信息数据集", desc: "含分子式、分子量与 SMILES", count: 1120 }
        ]
      }
    ],
    buyDbs: [
      { key: "b-reaxys", name: "Reaxys 高分子片段数据包", meta: "已购买 · 授权有效期至 2027-05-31", datasets: [{ name: "高分子片段相互作用能", desc: "含 PEO / PET 片段分子间相互作用能", count: 320 }, { name: "链段运动频率数据", desc: "含不同温度下的链段动力学", count: 140 }] },
      { key: "b-pdb", name: "ProteinDataBank 构象动态数据", meta: "已购买 · 机构订阅", datasets: [{ name: "蛋白质构象动态数据", desc: "含轨迹采样与折叠状态标注", count: 260 }] },
      { key: "b-self", name: "课题组自采采样数据包", meta: "自采 · 本地上传", datasets: [{ name: "自采 MD 轨迹数据", desc: "Gromacs NVT 系综采样结果", count: 420 }] }
    ],
    dbVersions: { qm9: "v2024", pdb: "2026.07", pubchem: "2026.08", "b-reaxys": "2026.07", "b-pdb": "2026.07", "b-self": "V0.0（自采）" },
    calcOutputs: [
      { key: "PDB", desc: "采样构象文件：构象坐标与构象 ID" },
      { key: "CSV", desc: "能量 / 受力数据文件：能量、Fx/Fy/Fz" },
      { key: "XML", desc: "力场参数文件：色散系数、电荷参数" },
      { key: "LOG", desc: "Q-Chem / VASP 计算日志：能量、收敛信息" }
    ],
    calcInputs: ["MDP", "TOP", "GRO", "INP"],
    calcInputDesc: { MDP: "Gromacs 分子动力学参数文件", TOP: "拓扑文件（力场与分子类型）", GRO: "初始构型坐标文件", INP: "Q-Chem 量子化学输入文件" },
    calcCompliance: [
      { key: "ensemble", name: "采样系综", rule: "NVT 或 NPT", bad: "检测到 NVE 系综，未控温不可用于力场训练", fix: "重新采样" },
      { key: "temp", name: "采样温度", rule: "200 ~ 1000 K", bad: "采样温度为 120 K，低于标准区间 200 K", fix: "重新采样" },
      { key: "method", name: "量子化学方法", rule: "CCSD(T) 或 MP2", bad: "检测到 DFT-GGA 方法，低于标准 CCSD(T) / MP2", fix: "低精度入库" },
      { key: "basis", name: "基组", rule: "≥ def2-TZVP", bad: "基组为 6-31G*，低于标准阈值 def2-TZVP", fix: "重新计算" },
      { key: "conformers", name: "构象数", rule: "≥ 1000 个 / 体系", bad: "构象数为 320，低于标准阈值 1000", fix: "补采样" }
    ],
    mediaExt: "pdb",
    payloadTitle: "构象结构 / 能量与受力 / 原子性质",
    payload: {
      构象结构: { 分子式: "H2O", 构象数: "1,200", 采样系综: "NVT", 采样温度: "300 K", 采样时长: "10 ns", RMSD: "0.42 Å" },
      能量与受力: { 单分子能量: "-76.321 154 Hartree（CCSD(T)）", 原子受力: "最大 0.042 eV/Å", "Fx / Fy / Fz": "已按构象 ID 对齐输出", 双分子相互作用能: "-6.82 kJ/mol", 肽键能量: "—" },
      原子性质: { "原子电荷（O）": "-0.812 e", "原子电荷（H）": "+0.406 e", 偶极矩: "1.85 Debye", 极化率: "1.45 Å³", 色散系数 C6: "12.6 a.u." }
    },
    payloadJson: '{&nbsp;&quot;system&quot;:&nbsp;&quot;H2O&quot;,<br>'
      + '&nbsp;&nbsp;<span class="k">&quot;sampling&quot;</span>:&nbsp;{&nbsp;<span class="k">&quot;ensemble&quot;</span>:&nbsp;<span class="s">&quot;NVT&quot;</span>,&nbsp;<span class="k">&quot;temp&quot;</span>:&nbsp;<span class="n">300</span>,&nbsp;<span class="k">&quot;conformers&quot;</span>:&nbsp;<span class="n">1200</span>,&nbsp;<span class="k">&quot;rmsd&quot;</span>:&nbsp;<span class="n">0.42</span>&nbsp;},<br>'
      + '&nbsp;&nbsp;<span class="k">&quot;energy&quot;</span>:&nbsp;{&nbsp;<span class="k">&quot;e_total&quot;</span>:&nbsp;<span class="n">-76.321154</span>,&nbsp;<span class="k">&quot;unit&quot;</span>:&nbsp;<span class="s">&quot;Hartree&quot;</span>,&nbsp;<span class="k">&quot;method&quot;</span>:&nbsp;<span class="s">&quot;CCSD(T)&quot;</span>,&nbsp;<span class="k">&quot;fmax&quot;</span>:&nbsp;<span class="n">0.042</span>&nbsp;},<br>'
      + '&nbsp;&nbsp;<span class="k">&quot;atomic&quot;</span>:&nbsp;{&nbsp;<span class="k">&quot;q_O&quot;</span>:&nbsp;<span class="n">-0.812</span>,&nbsp;<span class="k">&quot;dipole&quot;</span>:&nbsp;<span class="n">1.85</span>,&nbsp;<span class="k">&quot;polar&quot;</span>:&nbsp;<span class="n">1.45</span>,&nbsp;<span class="k">&quot;c6&quot;</span>:&nbsp;<span class="n">12.6</span>&nbsp;}<br>}',
    entryMethodRows: [
      ["QM9 / PDB 等公开库", "定制插件批量导入", "文件头含 “QM9” / “PDB” 标识", "采集参数配置"],
      ["Reaxys / ProteinDataBank 商用库", "定制插件批量导入", "商用授权文件头校验", "采购范围核对"],
      ["Gromacs / Amber 自主采样计算数据", "自动化流程录入", "包含 MDP+TOP+GRO+INP", "参数合规性复核"],
      ["特殊数据（力场参数、采样过程描述）", "手动输入", "无法自动识别", "全文录入"],
      ["用户上传数据", "手动输入 + 自动校验", "文件格式识别", "质量审核"]
    ],
    entrySources: [
      { key: "qm9", name: "QM9 等公开库", rec: "定制插件批量导入", rule: '文件头含 "QM9" 标识', point: "采集参数配置", plugin: "QM9Plugin" },
      { key: "pdb", name: "PDB 蛋白质结构数据库", rec: "定制插件批量导入", rule: '文件头含 "PDB" 标识', point: "采集参数配置", plugin: "PDBPlugin" },
      { key: "md", name: "Gromacs / Amber 自主采样计算数据", rec: "自动化流程录入", rule: "包含 MDP+TOP+GRO+INP", point: "参数合规性复核", plugin: "MDAutoFlow" },
      { key: "literature", name: "特殊数据（力场参数）", rec: "手动输入", rule: "无法自动识别", point: "全文录入", plugin: "-" },
      { key: "user", name: "用户上传数据", rec: "手动输入 + 自动校验", rule: "文件格式识别", point: "质量审核", plugin: "AutoValidator" }
    ],
    dataTypeCodes: { "有机小分子力场对象": "SM", "高分子力场对象": "PL", "蛋白质力场对象": "PT" },
    entryManualFields: [
      { key: "formula", label: "分子式", req: true, ph: "如 H2O", rule: "formula", msg: "分子式格式不正确，示例：H2O" },
      { key: "systemType", label: "分子体系类型", req: true, type: "select", opts: ["有机小分子体系", "高分子片段体系", "蛋白质体系"], rule: "text" },
      { key: "dataType", label: "数据类型", req: true, type: "select", opts: ["有机小分子力场对象", "高分子力场对象", "蛋白质力场对象"], rule: "text" },
      { key: "name", label: "体系名称", req: true, ph: "如 甘氨酸二肽", rule: "text" },
      { key: "conformers", label: "构象数", req: true, unit: "个", rule: "pos", msg: "构象数必须为正数" },
      { key: "temperature", label: "采样温度", req: true, unit: "K", rule: "range", min: 0, max: 1000, msg: "采样温度超出合理范围（0 ~ 1000 K）" },
      { key: "energy", label: "单分子能量", req: true, unit: "Hartree", ph: "如 -76.321154", rule: "num", msg: "请输入数值型能量" },
      { key: "force", label: "原子受力", req: false, unit: "eV/Å", rule: "num", msg: "请输入数值型受力" },
      { key: "dimerEnergy", label: "双分子相互作用能", req: false, unit: "kJ/mol", rule: "num", msg: "请输入数值型相互作用能" },
      { key: "rmsd", label: "RMSD", req: false, unit: "Å", rule: "pos", msg: "RMSD 必须为正数" },
      { key: "dipole", label: "偶极矩", req: false, unit: "Debye", rule: "pos", msg: "偶极矩必须为正数" }
    ],
    entryCalcParams: [
      { key: "software", label: "采样软件", type: "select", opts: ["Gromacs", "Amber", "LAMMPS", "MaterialsStudio"], std: "—", neutral: true },
      { key: "ensemble", label: "采样系综", type: "select", opts: ["NVT", "NPT", "NVE"], std: "NVT 或 NPT", bad: ["NVE"], msg: "检测到 NVE 系综，未控温不可用于力场训练" },
      { key: "temp", label: "采样温度", unit: "K", std: "200 ~ 1000 K", min: 200, max: 1000, msg: "采样温度超出标准区间 200 ~ 1000 K" },
      { key: "method", label: "量子化学方法", type: "select", opts: ["CCSD(T)", "MP2", "PBE0", "DFT-GGA"], std: "CCSD(T) 或 MP2", bad: ["DFT-GGA"], msg: "检测到 DFT-GGA 方法，低于标准 CCSD(T) / MP2" },
      { key: "basis", label: "基组", type: "select", opts: ["def2-QZVP", "def2-TZVP", "def2-SVP", "6-31G*"], std: "≥ def2-TZVP", bad: ["6-31G*", "def2-SVP"], msg: "基组低于标准阈值 def2-TZVP" },
      { key: "conformers", label: "构象数", unit: "个", std: "≥ 1000 个 / 体系", min: 1000, msg: "构象数低于标准阈值 1000" }
    ],
    entryManualSteps: [
      { who: "数据录入员", act: "选择“新增材料”", sys: "显示机器学习力场标准录入表单（基于 1.2 节字段定义）", check: "—", out: "空白录入界面" },
      { who: "数据录入员", act: "填写必填字段（分子式、体系类型、构象数、能量等）", sys: "实时校验：分子式有效性、数值范围", check: "必填项完整性、值域合法性", out: "已填数据" },
      { who: "数据录入员", act: "上传构象文件（XYZ / PDB）", sys: "解析构象文件，自动填充原子坐标与构象数", check: "文件格式合规性", out: "自动填充的字段" },
      { who: "数据录入员", act: "填写采样与计算参数（系综、温度、方法、基组）", sys: "与标准阈值（1.4 节）对比", check: "参数合规性", out: "计算参数记录" },
      { who: "系统", act: "—", sys: "生成唯一标识：ML-数据类型-序号", check: "数据库查询最大序号 +1", out: "材料唯一标识" },
      { who: "数据录入员", act: "提交数据", sys: "进入审核队列", check: "触发第 2.2.4 节审核流程", out: "提交状态" }
    ],
    entryBatchSteps: [
      { who: "数据录入员", act: "选择批量导入入口", sys: "显示数据源类型选择界面", check: "选择正确的数据源类型", out: "数据源配置" },
      { who: "数据录入员", act: "上传数据包（ZIP）或配置 API", sys: "解压 / 解析数据包，列出文件清单", check: "文件完整性检查", out: "文件清单" },
      { who: "系统", act: "—", sys: "调用对应解析插件（QM9 / PDB / MD 轨迹）", check: "按数据源类型匹配解析器", out: "解析后的结构化数据" },
      { who: "系统", act: "—", sys: "按录入规范表（1.2 节）自动映射字段", check: "字段名匹配、类型转换", out: "字段映射结果" },
      { who: "系统", act: "—", sys: "执行自动审核（交叉对比 + 可重复性 + 格式统一）", check: "第 2.2.3 节审核规则", out: "审核状态" },
      { who: "数据录入员", act: "查看并确认批处理结果", sys: "显示成功 / 失败条数及明细", check: "失败条目需人工处理", out: "入库确认" }
    ],
    entryRules: [
      ["分子式", "正则：[A-Z][a-z]?\\d*（可重复）", "“分子式格式不正确，示例：H2O”"],
      ["构象数", "> 0，且训练用体系建议 ≥ 1000", "“构象数必须为正数”"],
      ["采样温度", "0 ~ 1000 K", "“采样温度超出合理范围（0 ~ 1000 K）”"],
      ["能量 / 受力", "数值型（支持科学计数法）", "“请输入数值型能量”"],
      ["RMSD / 偶极矩", "> 0", "“RMSD 必须为正数”"]
    ],
    manualDefaults: {
      form: { dataType: "有机小分子力场对象", systemType: "有机小分子体系" },
      calc: { software: "Gromacs", ensemble: "NVT", temp: "300", method: "CCSD(T)", basis: "def2-QZVP", conformers: "1200" }
    },
    demoFile: "H2O_traj.pdb",
    demoParse: { formula: "H2O", systemType: "有机小分子体系", name: "水分子（H2O）", conformers: "1200", temperature: "300", energy: "-76.321154", force: "0.042", dimerEnergy: "-6.82", rmsd: "0.42", dipole: "1.85" },
    procFlow: [
      { n: "数据策划", d: "明确力场应用场景，如“药物分子对接力场”" },
      { n: "基础数据筛选", d: "按“小分子 + CCSD(T) 计算 + 构象数 ≥ 1000”筛选" },
      { n: "标准化预处理", d: "格式统一、异常构象剔除、数据补全" },
      { n: "加工模型构建", d: "构建力场参数拟合模型" },
      { n: "数据产品生产", d: "如“小分子高精度力场训练集”" },
      { n: "质量评价", d: "参数拟合误差校验" }
    ],
    procStepTitles: ["数据策划", "基础数据筛选", "标准化预处理", "加工模型构建", "数据产品生产", "质量评价"],
    procS1: { head: ["活动", "操作人", "输入", "输出", "内容"], rows: [["需求分析", "数据加工工程师", "力场训练需求 / 项目要求", "数据产品规格文档", "明确力场应用场景（如药物分子对接力场）、输出格式与精度要求"]] },
    procS2: { head: ["活动", "操作人", "系统行为", "筛选条件", "输出"], rows: [
      ["数据筛选", "数据加工工程师", "执行 SQL 查询 + 质量过滤", "质量等级 = A 级 或 B 级", "筛选后的数据集合"],
      ["数据筛选", "数据加工工程师", "按分子体系分组", "小分子 + CCSD(T) 计算 + 构象数 ≥ 1000", "分组清单"]
    ] },
    procS3: { head: ["子步骤", "操作人", "系统行为", "处理规则", "输出"], rows: [
      ["格式统一", "系统", "自动执行格式转换脚本", "xyz / mol → 标准 pdb；txt 能量数据 → csv", "标准格式文件"],
      ["单位统一", "系统", "自动执行单位换算", "字段统一为：构象 ID、分子名称、原子坐标 x/y/z、能量、Fx/Fy/Fz", "带标准单位的数据"],
      ["缺失值", "系统", "标记缺失字段", "缺失率 ≤ 5% 时标注 “N/A”；> 5% 退回", "缺失值报告"],
      ["异常值检测", "系统", "执行异常检测算法", "能量超出均值 3 倍标准差或键长 > 2 Å 的几何不合理构象", "异常值清单"],
      ["异常值修正", "数据加工工程师", "人工复核异常构象", "剔除异常构象；缺失受力数据通过相邻构象插值补充", "修正记录"]
    ] },
    procS4: { head: ["数据类型", "加工模型 / 算法", "输入", "处理逻辑", "输出"], rows: [
      ["能量 / 受力数据", "力场参数拟合模型", "构象-能量-受力三元组", "拟合键合 / 非键合参数并计算拟合残差", "力场参数（XML）"],
      ["构象数据", "构象标准化模型", "MD 采样轨迹", "统一构象 ID、坐标顺序与拓扑定义", "标准化构象集"],
      ["原子性质数据", "原子性质预测模型", "已知电荷 / 极化率样本", "按相似官能团预测缺失的原子性质", "补全的原子性质"]
    ] },
    procS5: { head: ["数据产品类型", "加工操作", "输出格式", "输出用途"], rows: [
      ["AI 训练数据集", "数据清洗 + 特征工程 + 格式转换", "CSV / JSON + 数据字典", "机器学习力场训练"],
      ["科研参考数据集", "数据整理 + 可视化渲染", "PDF 报告 + JSON", "科研人员查阅"],
      ["跨库融通数据集", "格式转换 + 元数据补全", "JSON（符合 OPTIMADE 格式）", "与主平台融通"]
    ] },
    procS6: { head: ["评价维度", "评价方法", "合格标准", "不合格处理"], rows: [
      ["数据来源质量", "检查来源可信度分级", "来源为 1 级或 2 级", "标记“来源待验证”"],
      ["加工模型质量", "验证参数拟合残差", "能量拟合 RMSE < 1 kJ/mol", "调整模型参数"],
      ["数据产品质量", "抽样检测（AQL = 1%）", "缺陷率 < 1%", "返工处理"]
    ] },
    procVersion: { head: ["版本阶段", "版本号格式", "标记位置", "说明"], rows: [
      ["原始版", "V0.0", "元数据字段 “data_version”", "采集后的原始数据"],
      ["标准化版", "V1.0", "元数据字段 “data_version”", "完成标准化预处理"],
      ["产品版", "V2.0", "元数据字段 “data_version”", "完成数据产品生产"]
    ] },
    procModels: [
      { key: "stat", name: "力场参数拟合模型", type: "能量 / 受力数据", input: "构象-能量-受力三元组", logic: "拟合键合 / 非键合参数并计算拟合残差", out: "力场参数（XML）" },
      { key: "image", name: "构象标准化模型", type: "构象数据", input: "MD 采样轨迹", logic: "统一构象 ID、坐标顺序与拓扑定义", out: "标准化构象集" },
      { key: "struct", name: "原子性质预测模型", type: "原子性质数据", input: "已知电荷 / 极化率样本", logic: "按相似官能团预测缺失的原子性质", out: "补全的原子性质" }
    ],
    procProducts: [
      { key: "ai", name: "AI 训练数据集", op: "数据清洗 + 特征工程 + 格式转换", format: "CSV / JSON + 数据字典", use: "机器学习力场训练" },
      { key: "sci", name: "科研参考数据集", op: "数据整理 + 可视化渲染", format: "PDF 报告 + JSON", use: "科研人员查阅" },
      { key: "cross", name: "跨库融通数据集", op: "格式转换 + 元数据补全", format: "JSON（符合 OPTIMADE 格式）", use: "与主平台融通" }
    ],
    procQuality: [
      { key: "source", dim: "数据来源质量", method: "检查来源可信度分级", std: "来源为 1 级或 2 级", fix: "标记“来源待验证”" },
      { key: "model", dim: "加工模型质量", method: "验证参数拟合残差", std: "能量拟合 RMSE < 1 kJ/mol", fix: "调整模型参数" },
      { key: "product", dim: "数据产品质量", method: "抽样检测（AQL = 1%）", std: "缺陷率 < 1%", fix: "返工处理" }
    ],
    modelRows: {
      stat: [
        { item: "单分子能量（H2O）", input: "1,200 个构象的 CCSD(T) 能量", logic: "拟合键合 / 非键合参数，计算残差", out: "力场参数 water.xml（RMSE 0.42 kJ/mol）" },
        { item: "双分子相互作用能（H2O 二聚体）", input: "320 个二聚体构象", logic: "拟合非键合参数，计算残差", out: "非键合参数（RMSE 0.86 kJ/mol）" }
      ],
      image: [
        { item: "MD 采样轨迹", input: "traj_raw.xtc（构象 ID 不连续）", logic: "统一构象 ID、坐标顺序与拓扑定义", out: "traj_std.pdb（1,200 构象，顺序一致）" },
        { item: "高分子片段轨迹", input: "peo_traj.xtc", logic: "统一构象 ID、坐标顺序与拓扑定义", out: "peo_std.pdb（860 构象）" }
      ],
      struct: [
        { item: "H2O 构象", input: "H2O_traj.pdb", logic: "校验键长键角合理性、剔除几何异常构象", out: "H2O_verified.pdb（O-H 键长 0.97 Å，合理）" },
        { item: "甘氨酸二肽构象", input: "glygly.pdb", logic: "校验键长键角合理性、剔除几何异常构象", out: "glygly_verified.pdb（肽键 1.33 Å，合理）" }
      ]
    },
    outliers: [
      { key: "o1", name: "H2O · 单分子能量", value: "-74.02 Hartree", sigma: "4.8σ", fixed: "", keep: false },
      { key: "o2", name: "PEO 片段 · 键长", value: "2.46 Å", sigma: "3.9σ", fixed: "", keep: false }
    ],
    procNamePh: "如：小分子高精度力场训练集加工",
    listCols: [{ key: "systemType", label: "分子体系" }, { key: "conformers", label: "构象数", unit: " 个" }, { key: "energy", label: "单分子能量", unit: " Ha" }],
    tasks: [
      { id: "ML-CL-2026-0922-001", name: "有机小分子（H2O）CCSD(T) 能量数据采集", method: "open", desc: "从 QM9 开放数据集采集 H2O、CH4 的 CCSD(T) 能量与原子受力数据", status: "已完成", createdAt: "2026-09-22 10:24", source: "QM9（量子化学小分子数据集）", version: "v2024", rawFiles: "CSV / XYZ", security: "第1级" },
      { id: "ML-CL-2026-0923-002", name: "高分子片段（PEO）相互作用能数据采集", method: "buy", desc: "从已购买 Reaxys 高分子数据包导入 PEO / PET 片段分子间相互作用能", status: "已完成", createdAt: "2026-09-23 09:12", source: "Reaxys 高分子片段数据包", version: "2026.07", rawFiles: "CSV / XML", security: "第1级" },
      { id: "ML-CL-2026-0923-003", name: "蛋白质二肽（甘氨酸）构象采样数据计算", method: "calc", desc: "基于 Gromacs NVT 采样与 Q-Chem 计算提取构象、能量与原子受力", status: "待确认", createdAt: "2026-09-23 16:48", source: "本地计算输出（PDB / CSV）", version: "V0.0", rawFiles: "CSV", security: "第2级" }
    ]
  };

  /* ------------------------------------------------------ 催化材料（R25） */
  MAT.catalyst = {
    code: "CA",
    short: "催化材料",
    title: "催化材料数据采集加工处理",
    headDesc: "面向催化材料数据的采集、录入与加工全流程管理：支持 Catalysis-Hub / OC20 开源抓取、文献催化性能专题库导入与 VASP 表面吸附 / 反应路径计算提取，<br>内置吸附能与活化能字段校验、异常处理队列与质量评价规则，采集结果确认后统一入库。",
    introTitle: "催化材料数据库的数据资源包含 2 类核心对象，采集 / 录入 / 加工均围绕这些对象展开。",
    introBanner: "2 类核心对象：催化表面分子吸附数据、催化表面反应路径数据。各资源对象包含的数据字段如下：",
    introTip: "采集参数中的「性质范围」即针对上述资源对象的性质字段设置取值范围，用于过滤落在范围外的数据记录。",
    objectsNote: "催化材料 2 类核心对象",
    typeTip: "选择本次采集的催化表面类型，不同类型对应不同的性质字段模板。",
    buyNote: "仅展示当前账号已完成采购或已完成自采登记的专题库，勾选后可从对应数据包中导入催化材料数据。",
    calcTip: "表面模型计算须设置真空层 ≥ 12 Å、力收敛 ≤ 0.02 eV/Å，K 点密度按表面单胞尺寸折算，参数不合规将进入合规性校验报告分支。",
    taskNamePh: "请输入采集任务名称，如：Cu(211) 表面 CO2 还原吸附能数据采集",
    doneNote: "审核通过并完成入库的催化材料数据，可直接送去资源加工。",
    objects: [
      { name: "催化表面分子吸附数据", fields: "催化表面晶面、掺杂原子参数、吸附分子种类、吸附分子构型、分子吸附位置、分子吸附能量" },
      { name: "催化表面反应路径数据", fields: "催化表面晶面、掺杂原子参数、吸附分子种类、反应初始构型、反应产物、产物吸附构型、过渡态吸附构型、反应能、活化能" }
    ],
    systems: [
      { name: "Cu(100) / Cu(110) / Cu(111) 表面", abbr: "LOW", sample: "Cu(111)", fields: ["催化表面晶面", "掺杂原子参数", "吸附分子种类", "吸附分子构型", "分子吸附能量", "反应能", "活化能"] },
      { name: "Cu(210) / Cu(411) 台阶表面", abbr: "STEP", sample: "Cu(211)", fields: ["催化表面晶面", "掺杂原子参数", "吸附分子种类", "吸附分子构型", "分子吸附能量", "反应能", "活化能"] },
      { name: "单原子与二元合金催化剂", abbr: "ALLOY", sample: "Cu-Ag", fields: ["催化表面晶面", "掺杂原子参数", "吸附分子种类", "吸附分子构型", "分子吸附能量", "反应能", "活化能"] }
    ],
    methods: {
      open: { key: "open", label: "开源数据获取", tag: "rw-tag--open", desc: "从 Catalysis-Hub 与 OC20 开放数据集中获取催化表面吸附构型与反应路径数据" },
      buy: { key: "buy", label: "数据购买 / 自采数据", tag: "rw-tag--buy", desc: "从已购买或自建的文献催化性能专题库中导入实验与计算催化性能数据" },
      calc: { key: "calc", label: "数据计算", tag: "rw-tag--calc", desc: "上传 VASP 表面计算输入 / 输出文件，由系统校验完整性、合规性并提取结构化数据" }
    },
    openDbs: [
      {
        key: "cathub", name: "Catalysis-Hub（催化反应数据库）", meta: "开放 API · 官方 2026.05 数据版本",
        datasets: [
          { name: "催化材料元素特征数据集", desc: "含元素编码、价态与周期表特征 · 共 5,100 条记录", count: 5100 },
          { name: "催化表面吸附数据集", desc: "含表面晶面、吸附构型与吸附能", count: 3240 },
          { name: "反应路径数据集", desc: "含初态、过渡态、末态与活化能", count: 1860 }
        ]
      },
      {
        key: "oc20", name: "OC20（催化表面数据集）", meta: "开放 API · 官方 2026.02 数据版本",
        datasets: [
          { name: "OC20 结构弛豫数据集", desc: "含表面-吸附物初始与弛豫构型", count: 6480 },
          { name: "OC20 吸附能数据集", desc: "含吸附能标签与力场一致性判定", count: 2760 }
        ]
      }
    ],
    buyDbs: [
      { key: "b-liter", name: "文献催化性能专题库", meta: "已建库 · 机构自建", datasets: [{ name: "文献催化活性数据", desc: "含过电位、法拉第效率与产物分布", count: 1240 }, { name: "单原子催化剂实验数据", desc: "含掺杂元素与活性位点表征", count: 420 }] },
      { key: "b-alloy", name: "二元合金催化专题数据包", meta: "已建库 · 2026-04 入库", datasets: [{ name: "二元合金表面数据", desc: "含合金配比与表面偏析能", count: 860 }] },
      { key: "b-self", name: "课题组自采数据包（CO2RR）", meta: "自采 · 本地上传", datasets: [{ name: "自采电化学测试数据", desc: "自测产物分布与法拉第效率", count: 320 }] }
    ],
    dbVersions: { cathub: "2026.05", oc20: "2026.02", "b-liter": "2026.06", "b-alloy": "2026.04", "b-self": "V0.0（自采）" },
    calcOutputs: [
      { key: "OUTCAR", desc: "VASP 输出详细信息文件：吸附能、受力、收敛信息" },
      { key: "CONTCAR", desc: "结构输出文件：弛豫后表面与吸附物构型" },
      { key: "OSZICAR", desc: "迭代收敛文件：能量收敛过程与步数" },
      { key: "CSV", desc: "反应路径数据文件：反应能、活化能与过渡态构型" }
    ],
    calcInputs: ["INCAR", "POSCAR", "POTCAR", "KPOINTS"],
    calcInputDesc: { INCAR: "计算控制参数（含真空层与收敛判据）", POSCAR: "表面-吸附物初始构型", POTCAR: "赝势文件", KPOINTS: "K 点采样设置" },
    calcCompliance: [
      { key: "functional", name: "交换关联泛函", rule: "PBE / RPBE 或 BEEF-vdW", bad: "检测到 LDA 泛函，与本库标准（PBE / RPBE）不一致", fix: "重新计算" },
      { key: "cutoff", name: "平面波截断能", rule: "≥ 400 eV", bad: "截断能为 350 eV，低于标准阈值 400 eV", fix: "重新计算" },
      { key: "kpoints", name: "K 点密度", rule: "≥ 12 Å⁻¹（表面模型）", bad: "K 点密度为 6 Å⁻¹，低于标准阈值 12 Å⁻¹", fix: "低精度入库" },
      { key: "force", name: "力收敛判据", rule: "≤ 0.02 eV/Å", bad: "力收敛判据为 0.05 eV/Å，低于精度要求", fix: "低精度入库" },
      { key: "vacuum", name: "真空层厚度", rule: "≥ 12 Å", bad: "真空层厚度为 8 Å，低于表面模型标准 12 Å", fix: "重新计算" }
    ],
    mediaExt: "cif",
    payloadTitle: "表面结构 / 吸附数据 / 反应路径数据",
    payload: {
      表面结构: { 催化体系: "Cu(211)-CO2RR", 表面晶面: "Cu(211) 台阶面", 掺杂原子: "—（纯 Cu）", 超胞: "3×2（4 层）", 真空层: "14.2 Å", 固定层数: "底部 2 层固定" },
      吸附数据: { 吸附分子: "CO2", 吸附构型: "C 端向下（η²-C,O）", 吸附位置: "台阶位点（Step-bridge）", 分子吸附能量: "-0.86 eV", "Cu-C 键长": "2.04 Å" },
      反应路径: { 反应初始构型: "*CO2", 反应产物: "*COOH", 产物吸附构型: "COOH 单齿吸附", 过渡态构型: "C-O 键伸长至 1.32 Å", 反应能: "-0.42 eV", 活化能: "0.78 eV" }
    },
    payloadJson: '{&nbsp;&quot;system&quot;:&nbsp;&quot;Cu(211)-CO2RR&quot;,<br>'
      + '&nbsp;&nbsp;<span class="k">&quot;surface&quot;</span>:&nbsp;{&nbsp;<span class="k">&quot;facet&quot;</span>:&nbsp;<span class="s">&quot;Cu(211)&quot;</span>,&nbsp;<span class="k">&quot;dopant&quot;</span>:&nbsp;<span class="s">&quot;none&quot;</span>,&nbsp;<span class="k">&quot;vacuum&quot;</span>:&nbsp;<span class="n">14.2</span>&nbsp;},<br>'
      + '&nbsp;&nbsp;<span class="k">&quot;adsorption&quot;</span>:&nbsp;{&nbsp;<span class="k">&quot;molecule&quot;</span>:&nbsp;<span class="s">&quot;CO2&quot;</span>,&nbsp;<span class="k">&quot;site&quot;</span>:&nbsp;<span class="s">&quot;step-bridge&quot;</span>,&nbsp;<span class="k">&quot;e_ads&quot;</span>:&nbsp;<span class="n">-0.86</span>&nbsp;},<br>'
      + '&nbsp;&nbsp;<span class="k">&quot;pathway&quot;</span>:&nbsp;{&nbsp;<span class="k">&quot;reactant&quot;</span>:&nbsp;<span class="s">&quot;*CO2&quot;</span>,&nbsp;<span class="k">&quot;product&quot;</span>:&nbsp;<span class="s">&quot;*COOH&quot;</span>,&nbsp;<span class="k">&quot;dE&quot;</span>:&nbsp;<span class="n">-0.42</span>,&nbsp;<span class="k">&quot;ea&quot;</span>:&nbsp;<span class="n">0.78</span>&nbsp;}<br>}',
    entryMethodRows: [
      ["Catalysis-Hub / OC20 等公开库", "定制插件批量导入", "文件头含 “Catalysis-Hub” / “OC20” 标识", "采集参数配置"],
      ["文献催化性能专题库", "定制插件批量导入", "专题库文件头校验", "采集范围核对"],
      ["VASP 表面自主计算数据", "自动化流程录入", "包含 INCAR+POSCAR+POTCAR+KPOINTS", "参数合规性复核"],
      ["特殊数据（电化学测试产物分布）", "手动输入", "无法自动识别", "全文录入"],
      ["用户上传数据", "手动输入 + 自动校验", "文件格式识别", "质量审核"]
    ],
    entrySources: [
      { key: "cathub", name: "Catalysis-Hub 等公开库", rec: "定制插件批量导入", rule: '文件头含 "Catalysis-Hub" 标识', point: "采集参数配置", plugin: "CatalysisHubPlugin" },
      { key: "oc20", name: "OC20 催化表面数据集", rec: "定制插件批量导入", rule: '文件头含 "OC20" 标识', point: "采集参数配置", plugin: "OC20Plugin" },
      { key: "vasp", name: "VASP 表面自主计算数据", rec: "自动化流程录入", rule: "包含 INCAR+POSCAR+POTCAR+KPOINTS", point: "参数合规性复核", plugin: "VASPAutoFlow" },
      { key: "literature", name: "特殊数据（产物分布）", rec: "手动输入", rule: "无法自动识别", point: "全文录入", plugin: "-" },
      { key: "user", name: "用户上传数据", rec: "手动输入 + 自动校验", rule: "文件格式识别", point: "质量审核", plugin: "AutoValidator" }
    ],
    dataTypeCodes: { "催化表面分子吸附数据": "ADS", "催化表面反应路径数据": "PTH" },
    entryManualFields: [
      { key: "formula", label: "催化体系标识", req: true, ph: "如 Cu(211)-CO2RR", rule: "text" },
      { key: "facet", label: "催化表面晶面", req: true, type: "select", opts: ["Cu(100)", "Cu(110)", "Cu(111)", "Cu(210)", "Cu(211)", "Cu(411)"], rule: "text" },
      { key: "dataType", label: "数据类型", req: true, type: "select", opts: ["催化表面分子吸附数据", "催化表面反应路径数据"], rule: "text" },
      { key: "dopant", label: "掺杂原子参数", req: false, ph: "如 Ag / 单原子 Pt", rule: "text" },
      { key: "adsorbate", label: "吸附分子种类", req: true, type: "select", opts: ["CO2", "CO", "H", "OH", "OCHO", "COOH", "CH4"], rule: "text" },
      { key: "site", label: "分子吸附位置", req: false, ph: "如 Step-bridge / Hollow", rule: "text" },
      { key: "adsorptionEnergy", label: "分子吸附能量", req: true, unit: "eV", ph: "如 -0.86", rule: "num", msg: "请输入数值型吸附能" },
      { key: "reactionEnergy", label: "反应能", req: false, unit: "eV", rule: "num", msg: "请输入数值型反应能" },
      { key: "activationEnergy", label: "活化能", req: false, unit: "eV", rule: "pos", msg: "活化能必须为正数" },
      { key: "coordination", label: "活性位点配位数", req: false, rule: "pos", msg: "配位数必须为正数" }
    ],
    entryCalcParams: [
      { key: "software", label: "计算软件", type: "select", opts: ["VASP", "Quantum ESPRESSO", "CP2K", "GPAW"], std: "—", neutral: true },
      { key: "functional", label: "交换关联泛函", type: "select", opts: ["PBE", "RPBE", "BEEF-vdW", "LDA"], std: "PBE / RPBE 或 BEEF-vdW", bad: ["LDA"], msg: "检测到 LDA 泛函，与本库标准（PBE / RPBE）不一致" },
      { key: "cutoff", label: "平面波截断能", unit: "eV", std: "≥ 400 eV", min: 400, msg: "截断能低于标准阈值 400 eV" },
      { key: "kpoints", label: "K 点密度", unit: "Å⁻¹", std: "≥ 12 Å⁻¹", min: 12, msg: "K 点密度低于标准阈值 12 Å⁻¹" },
      { key: "force", label: "力收敛判据", unit: "eV/Å", std: "≤ 0.02 eV/Å", max: 0.02, msg: "力收敛判据低于精度要求 0.02 eV/Å" },
      { key: "vacuum", label: "真空层厚度", unit: "Å", std: "≥ 12 Å", min: 12, msg: "真空层低于表面模型标准 12 Å" }
    ],
    entryManualSteps: [
      { who: "数据录入员", act: "选择“新增材料”", sys: "显示催化材料标准录入表单（基于 1.2 节字段定义）", check: "—", out: "空白录入界面" },
      { who: "数据录入员", act: "填写必填字段（体系标识、表面晶面、吸附分子、吸附能等）", sys: "实时校验：必填完整性、数值范围", check: "必填项完整性、值域合法性", out: "已填数据" },
      { who: "数据录入员", act: "上传结构文件（CIF / POSCAR）", sys: "解析结构文件，自动填充表面晶面与吸附构型", check: "文件格式合规性", out: "自动填充的字段" },
      { who: "数据录入员", act: "填写计算参数（软件、泛函、截断能、真空层等）", sys: "与标准阈值（1.4 节）对比", check: "参数合规性", out: "计算参数记录" },
      { who: "系统", act: "—", sys: "生成唯一标识：CA-数据类型-序号", check: "数据库查询最大序号 +1", out: "材料唯一标识" },
      { who: "数据录入员", act: "提交数据", sys: "进入审核队列", check: "触发第 2.2.4 节审核流程", out: "提交状态" }
    ],
    entryBatchSteps: [
      { who: "数据录入员", act: "选择批量导入入口", sys: "显示数据源类型选择界面", check: "选择正确的数据源类型", out: "数据源配置" },
      { who: "数据录入员", act: "上传数据包（ZIP）或配置 API", sys: "解压 / 解析数据包，列出文件清单", check: "文件完整性检查", out: "文件清单" },
      { who: "系统", act: "—", sys: "调用对应解析插件（Catalysis-Hub / OC20 / VASP）", check: "按数据源类型匹配解析器", out: "解析后的结构化数据" },
      { who: "系统", act: "—", sys: "按录入规范表（1.2 节）自动映射字段", check: "字段名匹配、类型转换", out: "字段映射结果" },
      { who: "系统", act: "—", sys: "执行自动审核（交叉对比 + 可重复性 + 格式统一）", check: "第 2.2.3 节审核规则", out: "审核状态" },
      { who: "数据录入员", act: "查看并确认批处理结果", sys: "显示成功 / 失败条数及明细", check: "失败条目需人工处理", out: "入库确认" }
    ],
    entryRules: [
      ["催化体系标识", "必填，建议“表面-反应”形式", "“请填写催化体系标识”"],
      ["分子吸附能量", "数值型（稳定吸附通常为负值）", "“请输入数值型吸附能”"],
      ["活化能", "> 0", "“活化能必须为正数”"],
      ["活性位点配位数", "> 0", "“配位数必须为正数”"],
      ["表面晶面 / 吸附分子", "从标准字典中选择", "“请选择标准字典中的取值”"]
    ],
    manualDefaults: {
      form: { dataType: "催化表面分子吸附数据", facet: "Cu(211)", adsorbate: "CO2" },
      calc: { software: "VASP", functional: "PBE", cutoff: "450", kpoints: "14", force: "0.02", vacuum: "14" }
    },
    demoFile: "Cu211_CO2.cif",
    demoParse: { formula: "Cu(211)-CO2RR", facet: "Cu(211)", dopant: "—（纯 Cu）", adsorbate: "CO2", site: "Step-bridge", adsorptionEnergy: "-0.86", reactionEnergy: "-0.42", activationEnergy: "0.78", coordination: "7" },
    procFlow: [
      { n: "数据策划", d: "明确应用需求，如“CO2 还原催化剂筛选”" },
      { n: "基础数据筛选", d: "按“Cu 基表面 + 有吸附能 / 活化能数据”筛选" },
      { n: "标准化预处理", d: "格式统一、误差修正、完整性整理" },
      { n: "加工模型构建", d: "构建吸附能 / 活性预测模型" },
      { n: "数据产品生产", d: "如“Cu 基 CO2RR 催化剂数据集”" },
      { n: "质量评价", d: "数据准确性校验" }
    ],
    procStepTitles: ["数据策划", "基础数据筛选", "标准化预处理", "加工模型构建", "数据产品生产", "质量评价"],
    procS1: { head: ["活动", "操作人", "输入", "输出", "内容"], rows: [["需求分析", "数据加工工程师", "用户需求 / 项目要求", "数据产品规格文档", "明确应用需求（如 CO2 还原催化剂筛选）、输出格式与精度要求"]] },
    procS2: { head: ["活动", "操作人", "系统行为", "筛选条件", "输出"], rows: [
      ["数据筛选", "数据加工工程师", "执行 SQL 查询 + 质量过滤", "质量等级 = A 级 或 B 级", "筛选后的数据集合"],
      ["数据筛选", "数据加工工程师", "按表面晶面分组", "Cu 基表面且含吸附能 / 活化能数据", "分组清单"]
    ] },
    procS3: { head: ["子步骤", "操作人", "系统行为", "处理规则", "输出"], rows: [
      ["格式统一", "系统", "自动执行格式转换脚本", "POSCAR / CIF → 标准结构；反应路径 → CSV", "标准格式文件"],
      ["单位统一", "系统", "自动执行单位换算", "非标准单位 → 标准单位（第 1.4 节单位表）", "带标准单位的数据"],
      ["缺失值", "系统", "标记缺失字段", "缺失率 ≤ 5% 时标注 “N/A”；> 5% 退回", "缺失值报告"],
      ["异常值检测", "系统", "执行异常检测算法", "超出 3σ 范围或物理不合理（如活化能为负）", "异常值清单"],
      ["异常值修正", "数据加工工程师", "人工复核异常值", "确认修正值或标注保留", "修正记录"]
    ] },
    procS4: { head: ["数据类型", "加工模型 / 算法", "输入", "处理逻辑", "输出"], rows: [
      ["吸附数据", "吸附能预测模型", "表面特征与已知吸附能样本", "基于元素与配位特征回归预测吸附能", "预测的吸附能"],
      ["反应路径数据", "反应路径校验模型", "初态 / 过渡态 / 末态构型与能量", "校验过渡态唯一虚频与能垒连续性", "校验后的反应路径"],
      ["结构数据", "表面结构验证模型", "CIF / POSCAR 文件", "校验真空层、固定层与吸附高度合理性", "验证后的结构文件"]
    ] },
    procS5: { head: ["数据产品类型", "加工操作", "输出格式", "输出用途"], rows: [
      ["AI 训练数据集", "数据清洗 + 特征工程 + 格式转换", "CSV / JSON + 数据字典", "机器学习模型训练"],
      ["科研参考数据集", "数据整理 + 可视化渲染", "PDF 报告 + JSON", "科研人员查阅"],
      ["跨库融通数据集", "格式转换 + 元数据补全", "JSON（符合 OPTIMADE 格式）", "与主平台融通"]
    ] },
    procS6: { head: ["评价维度", "评价方法", "合格标准", "不合格处理"], rows: [
      ["数据来源质量", "检查来源可信度分级", "来源为 1 级或 2 级", "标记“来源待验证”"],
      ["加工模型质量", "验证模型输出与输入一致性", "吸附能预测偏差 < 0.1 eV", "调整模型参数"],
      ["数据产品质量", "抽样检测（AQL = 1%）", "缺陷率 < 1%", "返工处理"]
    ] },
    procVersion: { head: ["版本阶段", "版本号格式", "标记位置", "说明"], rows: [
      ["原始版", "V0.0", "元数据字段 “data_version”", "采集后的原始数据"],
      ["标准化版", "V1.0", "元数据字段 “data_version”", "完成标准化预处理"],
      ["产品版", "V2.0", "元数据字段 “data_version”", "完成数据产品生产"]
    ] },
    procModels: [
      { key: "stat", name: "吸附能预测模型", type: "吸附数据", input: "表面特征与已知吸附能样本", logic: "基于元素与配位特征回归预测吸附能", out: "预测的吸附能" },
      { key: "image", name: "反应路径校验模型", type: "反应路径数据", input: "初态 / 过渡态 / 末态构型与能量", logic: "校验过渡态唯一虚频与能垒连续性", out: "校验后的反应路径" },
      { key: "struct", name: "表面结构验证模型", type: "结构数据", input: "CIF / POSCAR 文件", logic: "校验真空层、固定层与吸附高度合理性", out: "验证后的结构文件" }
    ],
    procProducts: [
      { key: "ai", name: "AI 训练数据集", op: "数据清洗 + 特征工程 + 格式转换", format: "CSV / JSON + 数据字典", use: "机器学习模型训练" },
      { key: "sci", name: "科研参考数据集", op: "数据整理 + 可视化渲染", format: "PDF 报告 + JSON", use: "科研人员查阅" },
      { key: "cross", name: "跨库融通数据集", op: "格式转换 + 元数据补全", format: "JSON（符合 OPTIMADE 格式）", use: "与主平台融通" }
    ],
    procQuality: [
      { key: "source", dim: "数据来源质量", method: "检查来源可信度分级", std: "来源为 1 级或 2 级", fix: "标记“来源待验证”" },
      { key: "model", dim: "加工模型质量", method: "验证模型输出与输入一致性", std: "吸附能预测偏差 < 0.1 eV", fix: "调整模型参数" },
      { key: "product", dim: "数据产品质量", method: "抽样检测（AQL = 1%）", std: "缺陷率 < 1%", fix: "返工处理" }
    ],
    modelRows: {
      stat: [
        { item: "吸附能（Cu(211)-CO2）", input: "-0.82 / -0.86 / -0.91 eV", logic: "计算均值、标准差、置信区间", out: "-0.86 ± 0.05 eV（95% CI：-0.90 ~ -0.82）" },
        { item: "活化能（*CO2 → *COOH）", input: "0.74 / 0.78 / 0.81 eV", logic: "计算均值、标准差、置信区间", out: "0.78 ± 0.04 eV" }
      ],
      image: [
        { item: "反应路径图", input: "path_raw.png（能量轴不一致）", logic: "统一能量轴、分辨率、标注、格式", out: "path_std.png（1600×1200，统一标注）" },
        { item: "吸附构型图", input: "ads_raw.png（800×600）", logic: "统一视角、分辨率、标注、格式", out: "ads_std.png（1600×1200，统一标注）" }
      ],
      struct: [
        { item: "Cu(211) 表面", input: "Cu211.cif", logic: "校验真空层、固定层与吸附高度合理性", out: "Cu211_verified.cif（真空层 14.2 Å，合理）" },
        { item: "Cu(111) 表面", input: "Cu111.cif", logic: "校验真空层、固定层与吸附高度合理性", out: "Cu111_verified.cif（真空层 14.0 Å，合理）" }
      ]
    },
    outliers: [
      { key: "o1", name: "Cu(211) · 吸附能", value: "-4.62 eV", sigma: "5.4σ", fixed: "", keep: false },
      { key: "o2", name: "Cu(111) · 活化能", value: "-0.35 eV", sigma: "3.7σ", fixed: "", keep: false }
    ],
    procNamePh: "如：Cu 基 CO2RR 催化剂数据集加工",
    listCols: [{ key: "facet", label: "表面晶面" }, { key: "adsorbate", label: "吸附分子" }, { key: "adsorptionEnergy", label: "吸附能", unit: " eV" }],
    tasks: [
      { id: "CA-CL-2026-0922-001", name: "Cu(211) 表面 CO2 还原吸附能数据采集", method: "open", desc: "从 Catalysis-Hub 开放数据集采集 Cu 基表面吸附构型与吸附能数据", status: "已完成", createdAt: "2026-09-22 10:24", source: "Catalysis-Hub（催化反应数据库）", version: "2026.05", rawFiles: "JSON / CIF", security: "第1级" },
      { id: "CA-CL-2026-0923-002", name: "单原子催化剂（Cu-Ag）活性数据采集", method: "buy", desc: "从文献催化性能专题库导入掺杂原子参数与活性位点表征数据", status: "已完成", createdAt: "2026-09-23 09:12", source: "文献催化性能专题库", version: "2026.06", rawFiles: "CSV / CIF", security: "第1级" },
      { id: "CA-CL-2026-0923-003", name: "Cu(111) 表面 *COOH 反应路径计算", method: "calc", desc: "基于 VASP 计算输出文件提取过渡态构型、反应能与活化能", status: "待确认", createdAt: "2026-09-23 16:48", source: "本地计算输出（OUTCAR / CONTCAR）", version: "V0.0", rawFiles: "JSON", security: "第2级" }
    ]
  };

  /* ---------------------------------------------------------- 配置切换 */
  /* 所有材料相关常量都是模块级 var，切换页面时整体重挂即可，
     这样下面的两千多行界面逻辑完全不用关心当前是哪种材料。 */
  function applyCfg(pid) {
    var k = keyOf(pid);
    if (!k) return false;
    var c = MAT[k];
    if (!c) return false;
    CFG_KEY = k;
    PAGE_ID = pid;

    /* 对象 / 材料类型：配置里给了就用配置，没给就沿用 04.js 的全局数据 */
    if (c.objects) TWOD_TASK_RESOURCE_OBJECTS_OVERRIDE = c.objects; else TWOD_TASK_RESOURCE_OBJECTS_OVERRIDE = null;
    if (c.systems) TWOD_MATERIAL_TYPES_OVERRIDE = c.systems; else TWOD_MATERIAL_TYPES_OVERRIDE = null;

    if (c.methods) METHODS = c.methods;
    if (c.openDbs) OPEN_DBS = c.openDbs;
    if (c.buyDbs) BUY_DBS = c.buyDbs;
    if (c.calcOutputs) CALC_OUTPUTS = c.calcOutputs;
    if (c.calcInputs) CALC_INPUTS = c.calcInputs;
    if (c.calcInputDesc) CALC_INPUT_DESC = c.calcInputDesc;
    if (c.calcCompliance) CALC_COMPLIANCE = c.calcCompliance;
    if (c.entryMethodRows) ENTRY_METHOD_ROWS = c.entryMethodRows;
    if (c.entryBatchSteps) ENTRY_BATCH_STEPS = c.entryBatchSteps;
    if (c.entryManualSteps) ENTRY_MANUAL_STEPS = c.entryManualSteps;
    if (c.entryRules) ENTRY_RULES = c.entryRules;
    if (c.entrySources) ENTRY_SOURCES = c.entrySources;
    if (c.dataTypeCodes) DATA_TYPE_CODES = c.dataTypeCodes;
    if (c.entryManualFields) ENTRY_MANUAL_FIELDS = c.entryManualFields;
    if (c.entryCalcParams) ENTRY_CALC_PARAMS = c.entryCalcParams;
    if (c.procFlow) PROC_FLOW = c.procFlow;
    if (c.procStepTitles) PROC_STEP_TITLES = c.procStepTitles;
    if (c.procS1) PROC_S1 = c.procS1;
    if (c.procS2) PROC_S2 = c.procS2;
    if (c.procS3) PROC_S3 = c.procS3;
    if (c.procS4) PROC_S4 = c.procS4;
    if (c.procS5) PROC_S5 = c.procS5;
    if (c.procS6) PROC_S6 = c.procS6;
    if (c.procVersion) PROC_VERSION = c.procVersion;
    if (c.procModels) PROC_MODELS = c.procModels;
    if (c.procProducts) PROC_PRODUCTS = c.procProducts;
    if (c.procQuality) PROC_QUALITY = c.procQuality;
    return true;
  }
