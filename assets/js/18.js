
  (() => {
    if (window.__LOWDIM_STANDARD_BROWSER_FINAL_READY__) return;
    window.__LOWDIM_STANDARD_BROWSER_FINAL_READY__ = true;

    const MANAGEMENT_PAGE = "standard-system-manage";
    const legacyTwodStandardRenderer = typeof renderTwodStandardPage === "function" ? renderTwodStandardPage : null;

    const browserTypes = [
      "二维材料数据库标准体系",
      "有机光电材料数据库标准体系",
      "电解质材料数据库标准体系",
      "机器学习力场数据库标准体系",
      "催化材料数据库标准体系"
    ];
    const browserLevels = [
      "强制性国标 GB",
      "推荐性国标 GB/T",
      "国家环境保护标准 HJ",
      "行业标准",
      "地方标准",
      "团体标准",
      "企业标准",
      "暂无专项国标"
    ];
    const browserReferences = [
      "[1] GB/T 30544.13-2018，纳米科技 术语 第 13 部分：石墨烯及相关二维材料 [S].",
      "[2] GB/T 40069-2021，纳米技术 石墨烯相关二维材料的层数测量 拉曼光谱法 [S].",
      "[3] GB/T 40071-2021，纳米技术 石墨烯相关二维材料的层数测量 光学对比度法 [S].",
      "[4] GB/T 44935-2024，纳米技术 二硫化钼薄片的层数测量 拉曼光谱法 [S].",
      "[5] GB/T 30451-2021，石墨烯电导率测试方法（四探针法）[S].",
      "[6] GB/T 43682-2024，纳米技术 亚纳米厚度石墨烯薄膜载流子迁移率及方块电阻测量方法 [S].",
      "[7] GB/T 30904-2014，无机化工产品 晶型结构分析 X 射线衍射法 [S].",
      "[8] GB/T 7714-2015，信息与文献 参考文献著录规则 [S].",
      "[9] T/CSTM 00800—2021，材料基因工程数据通则 [S]."
    ];
    const browserExtendedReferences = [
      "[1] GB/T 33876-2017，科研数据元数据规范 [S].",
      "[2] GB/T 7714-2015，信息与文献 参考文献著录规则 [S].",
      "[3] GB/T 6040-2002，红外光谱分析方法通则 [S].",
      "[4] GB/T 21186-2007，傅立叶变换红外光谱仪 [S].",
      "[5] GB/T 261-2008，闪点的测定 宾斯基 - 马丁闭口杯法 [S].",
      "[6] GB/T 617-2006，化学试剂 熔点范围测定通用方法 [S].",
      "[7] GB/T 35305-2017，有机发光二极管（OLED）器件测试方法 [S].",
      "[8] GB/T 22231-2022，锂离子电池用电解液 [S].",
      "[9] GB/T 11007-2008，电导率仪试验方法 [S].",
      "[10] GB/T 30835-2014，锂离子电池用磷酸铁锂 [S].",
      "[11] GB/T 13390-2008，金属粉末比表面积的测定 氮吸附法 [S].",
      "[12] GB/T 30904-2014，无机化工产品 晶型结构分析 X 射线衍射法 [S].",
      "[13] GB/T 38219-2019，烟气脱硝催化剂检测技术规范 [S].",
      "[14] HJ 2534-2013，环境标志产品技术要求 电池 [S].",
      "[15] T/CSTM 00800—2021，材料基因工程数据通则 [S]."
    ];
    const browserRecords = [
      {
        id: "browser-std-33876",
        type: browserTypes,
        standardNo: "GB/T 33876-2017",
        standardName: "科研数据元数据规范",
        organization: "国家市场监督管理总局、中国国家标准化管理委员会",
        publishDate: "2017-12-29",
        effectiveDate: "2018-07-01",
        level: "推荐性国标 GB/T",
        intro: "统一科研数据集的元数据描述框架，为数据库字段设计和数据溯源提供基础规范。",
        coreContent: "规定科研数据集元数据框架，包含标识信息、数据内容、获取方式、质量信息和溯源信息，定义结构化数据集描述规范。",
        projectMatch: "适用于有机光电、电解质、机器学习力场、催化和二维材料五类数据库，指导结构化字段设计、数据溯源管理和摘要规范。",
        attachmentName: "GB_T33876-2017_科研数据元数据规范.txt",
        references: browserExtendedReferences
      },
      {
        id: "browser-std-6040",
        type: browserTypes,
        standardNo: "GB/T 6040-2002",
        standardName: "红外光谱分析方法通则",
        organization: "国家质量监督检验检疫总局、国家标准化管理委员会",
        publishDate: "2002-10-18",
        effectiveDate: "2003-04-01",
        level: "推荐性国标 GB/T",
        intro: "统一红外光谱样品制备、测试和图谱解析流程，支撑实验图谱数据质量控制。",
        coreContent: "规定傅里叶变换红外光谱的样品制备、测试流程、图谱采集和谱图解析通用规范。",
        projectMatch: "适用于有机光电材料和电解质材料红外光谱表征图谱入库与数据质量校验。",
        attachmentName: "GB_T6040-2002_红外光谱分析方法通则.txt",
        references: browserExtendedReferences
      },
      {
        id: "browser-std-21186",
        type: browserTypes,
        standardNo: "GB/T 21186-2007",
        standardName: "傅立叶变换红外光谱仪",
        organization: "国家质量监督检验检疫总局、国家标准化管理委员会",
        publishDate: "2007-08-28",
        effectiveDate: "2008-03-01",
        level: "推荐性国标 GB/T",
        intro: "规定傅立叶变换红外光谱仪的技术要求和性能检定方法，为仪器数据对标提供依据。",
        coreContent: "规定红外光谱仪器的技术要求、性能指标和检定方法，统一实验设备输出数据的基本质量要求。",
        projectMatch: "用于有机光电材料和电解质材料红外图谱实验数据的设备对标和质量审核。",
        attachmentName: "GB_T21186-2007_傅立叶变换红外光谱仪.txt",
        references: browserExtendedReferences
      },
      {
        id: "browser-std-30544-13",
        type: browserTypes[0],
        standardNo: "GB/T 30544.13-2018",
        standardName: "纳米科技 术语 第 13 部分：石墨烯及相关二维材料",
        organization: "国家市场监督管理总局、中国国家标准化管理委员会",
        publishDate: "2018-12-28",
        effectiveDate: "2019-11-01",
        level: "推荐性国标 GB/T",
        intro: "统一石墨烯及相关二维材料的术语定义，为结构、表征与数据库字段命名提供共同语境。",
        coreContent: "等同采用 ISO/TS 80004-13:2017；界定石墨烯及相关二维材料统一术语定义，包含单层、少层二维材料、层厚、堆垛方式、缺陷、纳米片等名词；规范二维材料结构、表征相关专业词汇。",
        projectMatch: "二维材料摘要规范，统一数据库字段术语、筛选标签名词。",
        attachmentName: "GB_T30544.13-2018_石墨烯及相关二维材料术语.txt"
      },
      {
        id: "browser-std-40069",
        type: browserTypes[0],
        standardNo: "GB/T 40069-2021",
        standardName: "纳米技术 石墨烯相关二维材料的层数测量 拉曼光谱法",
        organization: "国家市场监督管理总局、中国国家标准化管理委员会",
        publishDate: "2021-05-21",
        effectiveDate: "2021-12-01",
        level: "推荐性国标 GB/T",
        intro: "规范石墨烯薄片层数的拉曼光谱测量流程与判定规则，支撑实验数据质量校验。",
        coreContent: "规定利用拉曼光谱判定石墨烯薄片层数的三类测试方法；规范光源、样品预处理、激光功率、峰拟合、图谱采集、层数判定规则；适用于机械剥离、AB/ABC 堆垛 CVD 石墨烯。",
        projectMatch: "数据质量衡量标准，结构参数实验对标、层厚与层数实验数据校验。",
        attachmentName: "GB_T40069-2021_拉曼光谱法.txt"
      },
      {
        id: "browser-std-40071",
        type: browserTypes[0],
        standardNo: "GB/T 40071-2021",
        standardName: "纳米技术 石墨烯相关二维材料的层数测量 光学对比度法",
        organization: "国家市场监督管理总局、中国国家标准化管理委员会",
        publishDate: "2021-05-21",
        effectiveDate: "2021-12-01",
        level: "推荐性国标 GB/T",
        intro: "建立基于光学对比度的石墨烯层数无损测量方法，用于快速实验初筛。",
        coreContent: "建立反射光谱法、光学显微灰度对比度法测量石墨烯层数；规范衬底、物镜参数、图像校正算法，实现无损、快速的层数初筛。",
        projectMatch: "二维材料结构表征实验数据入库校验依据。",
        attachmentName: "GB_T40071-2021_光学对比度法.txt"
      },
      {
        id: "browser-std-44935",
        type: browserTypes[0],
        standardNo: "GB/T 44935-2024",
        standardName: "纳米技术 二硫化钼薄片的层数测量 拉曼光谱法",
        organization: "国家市场监督管理总局、中国国家标准化管理委员会",
        publishDate: "2024-03-15",
        effectiveDate: "2025-07-01",
        level: "推荐性国标 GB/T",
        intro: "面向 2H 相 MoS₂ 二维薄片，提供可复用的拉曼层数判定方法与参考光谱。",
        coreContent: "针对 2H 相 MoS₂ 二维薄片，规定 3 种拉曼层数判定方法；规范低频呼吸模、E₂g¹ 与 A₁g 峰位差标定方法，并提供标准参考光谱。",
        projectMatch: "数据库 TMDs 二维材料实验表征对标依据。",
        attachmentName: "GB_T44935-2024_MoS2层数测量.txt"
      },
      {
        id: "browser-std-30451",
        type: browserTypes[0],
        standardNo: "GB/T 30451-2021",
        standardName: "石墨烯电导率测试方法（四探针法）",
        organization: "国家市场监督管理总局、中国国家标准化管理委员会",
        publishDate: "2021-03-09",
        effectiveDate: "2021-10-01",
        level: "推荐性国标 GB/T",
        intro: "规定石墨烯薄膜方块电阻和面电导率的四探针测试流程与仪器校准要求。",
        coreContent: "常温直线四探针法测量石墨烯薄膜方块电阻、面电导率；包含边缘效应修正、多点均匀性采样和仪器校准规范。",
        projectMatch: "电学性质实验数据与 DFT 计算参数交叉比对基准。",
        attachmentName: "GB_T30451-2021_四探针法.txt"
      },
      {
        id: "browser-std-43682",
        type: browserTypes[0],
        standardNo: "GB/T 43682-2024",
        standardName: "纳米技术 亚纳米厚度石墨烯薄膜载流子迁移率及方块电阻测量方法",
        organization: "国家市场监督管理总局、中国国家标准化管理委员会",
        publishDate: "2024-03-15",
        effectiveDate: "2024-07-01",
        level: "推荐性国标 GB/T",
        intro: "规范亚纳米厚度石墨烯薄膜载流子迁移率、方块电阻和载流子浓度的器件法测量。",
        coreContent: "基于场效应晶体管器件法测试石墨烯薄膜载流子迁移率、方块电阻和载流子浓度；规范器件制备、电压扫描、接触电阻修正及不确定度评估。",
        projectMatch: "数据库电学输运参数（有效质量、迁移率）实验对照标准。",
        attachmentName: "GB_T43682-2024_载流子迁移率测量.txt"
      },
      {
        id: "browser-std-30904",
        type: browserTypes[0],
        standardNo: "GB/T 30904-2014",
        standardName: "无机化工产品 晶型结构分析 X 射线衍射法",
        organization: "国家质量监督检验检疫总局、中国国家标准化管理委员会",
        publishDate: "2014-07-08",
        effectiveDate: "2014-12-01",
        level: "推荐性国标 GB/T",
        intro: "规范 X 射线衍射法开展晶体物相、晶格常数和晶面间距测试的流程与图谱解析。",
        coreContent: "规定 XRD 衍射仪法开展晶体物相、晶格常数和晶面间距测试流程，包括样品制备、测试条件和图谱解析方法。",
        projectMatch: "数据质量衡量标准，DFT 计算晶格常数与实验 XRD 数据对比，校验结构模型合理性。",
        attachmentName: "GB_T30904-2014_X射线衍射法.txt"
      },
      {
        id: "browser-std-7714",
        type: browserTypes,
        standardNo: "GB/T 7714-2015",
        standardName: "信息与文献 参考文献著录规则",
        organization: "国家市场监督管理总局、中国国家标准化管理委员会",
        publishDate: "2015-12-31",
        effectiveDate: "2016-07-01",
        level: "推荐性国标 GB/T",
        intro: "统一文献、实验数据和计算成果的引用格式，支撑数据库数据溯源与元数据标准化。",
        coreContent: "规范文献、实验数据、计算成果来源的引用格式，支撑数据库数据溯源和文献元数据标准化录入。",
        projectMatch: "二维材料数据库数据来源、文献引用和成果溯源的统一规范。",
        attachmentName: "GB_T7714-2015_参考文献著录规则.txt",
        references: browserExtendedReferences
      },
      {
        id: "browser-std-cstm-00800",
        type: browserTypes,
        standardNo: "T/CSTM 00800—2021",
        standardName: "材料基因工程数据通则",
        organization: "中国材料与试验标准化技术委员会（CSTM）",
        publishDate: "2021",
        effectiveDate: "2021",
        level: "团体标准",
        intro: "材料基因工程领域的高通量计算、数据分类、元数据、数据质量与 FAIR 原则顶层规范。",
        coreContent: "指导材料高通量计算的数据分类、元数据、数据质量和 FAIR 原则，弥补二维材料 DFT 计算暂无国标的空白。",
        projectMatch: "为二维材料数据库的数据组织、质量评价和开放共享提供上位规范依据。",
        attachmentName: "T_CSTM00800-2021_材料基因工程数据通则.txt",
        references: browserExtendedReferences
      },
      {
        id: "browser-std-organic-261",
        type: browserTypes[1],
        standardNo: "GB/T 261-2008",
        standardName: "闪点的测定 宾斯基 - 马丁闭口杯法",
        organization: "国家质量监督检验检疫总局、国家标准化管理委员会",
        publishDate: "2008-06-19",
        effectiveDate: "2008-12-01",
        level: "推荐性国标 GB/T",
        intro: "规定有机液体闪点的通用测试方法，为材料安全性和物性参数入库提供统一依据。",
        coreContent: "规定采用宾斯基 - 马丁闭口杯法测定有机液体闪点的仪器、样品处理、测试步骤和结果判定要求。",
        projectMatch: "有机光电材料选择标准和闪点物性参数的实验对照依据。",
        attachmentName: "GB_T261-2008_闪点测定.txt",
        references: browserExtendedReferences
      },
      {
        id: "browser-std-organic-617",
        type: browserTypes[1],
        standardNo: "GB/T 617-2006",
        standardName: "化学试剂 熔点范围测定通用方法",
        organization: "国家质量监督检验检疫总局、国家标准化管理委员会",
        publishDate: "2006-11-03",
        effectiveDate: "2007-06-01",
        level: "推荐性国标 GB/T",
        intro: "统一有机小分子熔点范围测定方法，用于材料物性数据质量校验。",
        coreContent: "规定化学试剂熔点范围测定的仪器、样品装填、升温速率、观察记录和结果表示方法。",
        projectMatch: "有机光电材料熔点物性数据的实验测量与数据质量校验。",
        attachmentName: "GB_T617-2006_熔点范围测定.txt",
        references: browserExtendedReferences
      },
      {
        id: "browser-std-organic-35305",
        type: browserTypes[1],
        standardNo: "GB/T 35305-2017",
        standardName: "有机发光二极管（OLED）器件测试方法",
        organization: "国家市场监督管理总局、中国国家标准化管理委员会",
        publishDate: "2017-12-29",
        effectiveDate: "2018-07-01",
        level: "推荐性国标 GB/T",
        intro: "规范 OLED 器件光电性能测试，为有机光电材料发光性能评价提供实验参照。",
        coreContent: "规定 OLED 器件发光亮度、发光光谱、色坐标、开启电压和发光效率等指标的测试方法。",
        projectMatch: "有机光电材料发光性能和发光颜色筛选指标的实验参照。",
        attachmentName: "GB_T35305-2017_OLED器件测试方法.txt",
        references: browserExtendedReferences
      },
      {
        id: "browser-std-electrolyte-hj2534",
        type: browserTypes[2],
        standardNo: "HJ 2534-2013",
        standardName: "环境标志产品技术要求 电池",
        organization: "中华人民共和国环境保护部",
        publishDate: "2013-12-20",
        effectiveDate: "2014-03-01",
        level: "国家环境保护标准 HJ",
        intro: "规定电池产品的环保准入要求，为电解质材料入库提供环境标准依据。",
        coreContent: "规定电池原材料重金属限值、生产禁用溶剂、回收与环保管控要求，作为强制环保依据使用。",
        projectMatch: "电解质材料环境准入判定和环保属性审核。",
        attachmentName: "HJ_2534-2013_环境标志产品技术要求电池.txt",
        references: browserExtendedReferences
      },
      {
        id: "browser-std-electrolyte-30835",
        type: browserTypes[2],
        standardNo: "GB/T 30835-2014",
        standardName: "锂离子电池用磷酸铁锂",
        organization: "国家质量监督检验检疫总局、国家标准化管理委员会",
        publishDate: "2014-07-08",
        effectiveDate: "2014-12-01",
        level: "推荐性国标 GB/T",
        intro: "规定锂离子电池无机材料的理化性能和电化学性能测试要求。",
        coreContent: "规定锂离子电池用磷酸铁锂的理化性能、电导率、电化学性能和检验规则，可作为固态无机电解质测试参照。",
        projectMatch: "固态无机电解质电学性能和电化学性能测试参照。",
        attachmentName: "GB_T30835-2014_锂离子电池用磷酸铁锂.txt",
        references: browserExtendedReferences
      },
      {
        id: "browser-std-electrolyte-11007",
        type: browserTypes[2],
        standardNo: "GB/T 11007-2008",
        standardName: "电导率仪试验方法",
        organization: "国家质量监督检验检疫总局、国家标准化管理委员会",
        publishDate: "2008-06-19",
        effectiveDate: "2008-12-01",
        level: "推荐性国标 GB/T",
        intro: "统一溶液和固体电导率仪器的校准与测试方法。",
        coreContent: "规定电导率仪的校准、检验、测试条件和结果处理方法，覆盖溶液与固体电导率测量。",
        projectMatch: "有机电解液、固态有机和无机电解质电导率实验数据对标。",
        attachmentName: "GB_T11007-2008_电导率仪试验方法.txt",
        references: browserExtendedReferences
      },
      {
        id: "browser-std-electrolyte-22231",
        type: browserTypes[2],
        standardNo: "GB/T 22231-2022",
        standardName: "锂离子电池用电解液",
        organization: "国家市场监督管理总局、中国国家标准化管理委员会",
        publishDate: "2022-10-14",
        effectiveDate: "2023-05-01",
        level: "推荐性国标 GB/T",
        intro: "规定锂离子电池用液态电解液的水分、酸度、稳定性和理化指标测试方法。",
        coreContent: "规定锂离子电池用电解液的分类、技术要求、试验方法、检验规则、标志、包装、运输和贮存要求。",
        projectMatch: "有机液态电解液数据集物性数据质量衡量和入库审核。",
        attachmentName: "GB_T22231-2022_锂离子电池用电解液.txt",
        references: browserExtendedReferences
      },
      {
        id: "browser-std-electrolyte-solid-oxide",
        type: browserTypes[2],
        standardNo: "团体标准（编号待补充）",
        standardName: "固态锂电池用固态电解质性能要求及测试方法 无机氧化物固态电解质",
        organization: "相关材料与电池行业团体标准组织",
        publishDate: "暂无",
        effectiveDate: "参照执行",
        level: "团体标准",
        intro: "面向无机氧化物固态电解质的性能要求和测试方法，作为电解质数据库的配套团体标准实例。",
        coreContent: "围绕离子电导率、化学稳定性、界面相容性和样品测试条件建立性能评价与数据记录要求。",
        projectMatch: "固态无机电解质数据集的性能字段设计、测试数据归一化和质量审核。",
        attachmentName: "固态电解质性能要求_无机氧化物.txt",
        references: browserExtendedReferences
      },
      {
        id: "browser-std-electrolyte-solid-polymer",
        type: browserTypes[2],
        standardNo: "团体标准（编号待补充）",
        standardName: "固态锂电池用固态电解质性能要求及测试方法 聚合物及复合固态电解质",
        organization: "相关材料与电池行业团体标准组织",
        publishDate: "暂无",
        effectiveDate: "参照执行",
        level: "团体标准",
        intro: "面向聚合物及复合固态电解质的性能要求和测试方法，补充电解质数据库标准体系。",
        coreContent: "围绕离子传导、机械性能、热稳定性和界面性能建立测试方法与结果记录要求。",
        projectMatch: "聚合物及复合固态电解质数据集的性能字段设计和测试结果对标。",
        attachmentName: "固态电解质性能要求_聚合物及复合材料.txt",
        references: browserExtendedReferences
      },
      {
        id: "browser-std-mlff-note",
        type: browserTypes[3],
        standardNo: "暂无专项国标",
        standardName: "机器学习力场数据库构建技术依据说明",
        organization: "平台标准说明",
        publishDate: "暂无专项国家标准",
        effectiveDate: "参照执行",
        level: "暂无专项国标",
        intro: "国内暂无针对机器学习力场数据库、分子动力学训练集和势能面数据集的独立国家标准。",
        coreContent: "机器学习力场、分子动力学训练集和势能面数据集属于计算化学前沿方向，国内暂无直接相关国家标准。数据集构建、结构采样和能量精度控制参照 T/CSTM 00800—2021《材料基因工程数据通则》，同时遵循国际力场数据集通用规范。",
        projectMatch: "机器学习力场数据库的数据集构建、结构采样、能量精度控制、训练集溯源和质量评估。",
        attachmentName: "机器学习力场数据库技术依据说明.txt",
        references: browserExtendedReferences
      },
      {
        id: "browser-std-catalyst-13390",
        type: browserTypes[4],
        standardNo: "GB/T 13390-2008",
        standardName: "金属粉末比表面积的测定 氮吸附法",
        organization: "国家质量监督检验检疫总局、国家标准化管理委员会",
        publishDate: "2008-06-19",
        effectiveDate: "2008-12-01",
        level: "推荐性国标 GB/T",
        intro: "规定金属粉末比表面积的氮吸附测试方法，用于催化材料活性位点表征。",
        coreContent: "规定采用氮吸附法测定金属粉末比表面积的仪器、样品处理、测试流程和结果计算方法。",
        projectMatch: "催化材料结构特征、活性位点和比表面积相关实验数据校验。",
        attachmentName: "GB_T13390-2008_金属粉末比表面积.txt",
        references: browserExtendedReferences
      },
      {
        id: "browser-std-catalyst-30904",
        type: browserTypes[4],
        standardNo: "GB/T 30904-2014",
        standardName: "无机化工产品 晶型结构分析 X 射线衍射法",
        organization: "国家质量监督检验检疫总局、中国国家标准化管理委员会",
        publishDate: "2014-07-08",
        effectiveDate: "2014-12-01",
        level: "推荐性国标 GB/T",
        intro: "规定 XRD 测试晶体结构、晶格常数和物相的通用流程。",
        coreContent: "规定 XRD 衍射仪开展晶体物相、晶格常数和晶面间距测试的样品制备、测试条件和图谱解析方法。",
        projectMatch: "铜基催化材料晶体结构、晶面（Cu (100)/Cu (111) 等）模型合理性比对。",
        attachmentName: "GB_T30904-2014_催化材料X射线衍射法.txt",
        references: browserExtendedReferences
      },
      {
        id: "browser-std-catalyst-38219",
        type: browserTypes[4],
        standardNo: "GB/T 38219-2019",
        standardName: "烟气脱硝催化剂检测技术规范",
        organization: "国家市场监督管理总局、中国国家标准化管理委员会",
        publishDate: "2019-10-18",
        effectiveDate: "2020-05-01",
        level: "推荐性国标 GB/T",
        intro: "建立催化剂活性、选择性和微观结构的通用检测框架，可作为电催化材料评价参考。",
        coreContent: "规定烟气脱硝催化剂的样品制备、活性和选择性测试、微观结构表征及结果评价要求。",
        projectMatch: "催化材料数据质量衡量、催化活性指标交叉比对和实验评价方法参考。",
        attachmentName: "GB_T38219-2019_烟气脱硝催化剂检测.txt",
        references: browserExtendedReferences
      }
    ];

    const browserState = {
      activeType: browserTypes[0],
      keyword: "",
      publishFrom: "",
      publishTo: "",
      level: "",
      page: 1,
      pageSize: 6,
      detailId: ""
    };
    let browserKeywordTimer = null;

    function escapeBrowserHtml(value) {
      return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
    }

    function browserDateValue(value) {
      const match = String(value || "").match(/\d{4}-\d{2}-\d{2}/);
      return match ? match[0] : "";
    }

    function getBrowserRecords() {
      const keyword = browserState.keyword.trim().toLowerCase();
      const from = browserState.publishFrom || "";
      const to = browserState.publishTo || "";
      return browserRecords.filter((record) => {
        const typeMatch = Array.isArray(record.type)
          ? record.type.includes(browserState.activeType)
          : record.type === browserState.activeType;
        if (!typeMatch) return false;
        const searchable = `${record.standardNo} ${record.standardName} ${record.organization} ${record.intro} ${record.level}`.toLowerCase();
        const publishDate = browserDateValue(record.publishDate);
        return (!keyword || searchable.includes(keyword))
          && (!from || publishDate >= from)
          && (!to || publishDate <= to)
          && (!browserState.level || record.level === browserState.level);
      });
    }

    function browserPager(total) {
      const totalPages = Math.max(1, Math.ceil(total / browserState.pageSize));
      browserState.page = Math.min(Math.max(1, browserState.page), totalPages);
      const start = (browserState.page - 1) * browserState.pageSize;
      return {
        totalPages,
        records: getBrowserRecords().slice(start, start + browserState.pageSize)
      };
    }

    function browserCard(record) {
      return `
        <article class="lowdim-standard-browser-card">
          <div class="lowdim-standard-browser-card-top">
            <span class="lowdim-standard-browser-badge">${escapeBrowserHtml(record.level)}</span>
            <span class="lowdim-standard-browser-number">${escapeBrowserHtml(record.standardNo)}</span>
          </div>
          <h3 title="${escapeBrowserHtml(record.standardName)}">${escapeBrowserHtml(record.standardName)}</h3>
          <p class="lowdim-standard-browser-intro" title="${escapeBrowserHtml(record.intro)}">${escapeBrowserHtml(record.intro)}</p>
          <dl class="lowdim-standard-browser-meta">
            <div><dt>发布机构</dt><dd title="${escapeBrowserHtml(record.organization)}">${escapeBrowserHtml(record.organization)}</dd></div>
            <div><dt>发布日期</dt><dd>${escapeBrowserHtml(record.publishDate)}</dd></div>
            <div><dt>实施日期</dt><dd>${escapeBrowserHtml(record.effectiveDate)}</dd></div>
          </dl>
          <div class="lowdim-standard-browser-card-footer">
            <button class="btn btn-sm lowdim-standard-browser-detail-btn" type="button" data-standard-browser-view="${escapeBrowserHtml(record.id)}">查看详情</button>
          </div>
        </article>
      `;
    }

    function browserPagination(total, totalPages) {
      const page = browserState.page;
      const buttons = [];
      const first = Math.max(1, Math.min(page - 2, totalPages - 4));
      const last = Math.min(totalPages, first + 4);
      for (let index = first; index <= last; index += 1) {
        buttons.push(`<button type="button" class="${index === page ? "active" : ""}" data-standard-browser-page="${index}" aria-current="${index === page ? "page" : "false"}">${index}</button>`);
      }
      return `
        <div class="lowdim-standard-browser-pagination">
          <span>共 ${total} 条标准</span>
          <div class="lowdim-standard-browser-page-buttons">
            <button type="button" ${page <= 1 ? "disabled" : ""} data-standard-browser-page="${page - 1}" aria-label="上一页">‹</button>
            ${buttons.join("")}
            <button type="button" ${page >= totalPages ? "disabled" : ""} data-standard-browser-page="${page + 1}" aria-label="下一页">›</button>
          </div>
          <span>第 ${page} / ${totalPages} 页</span>
        </div>
      `;
    }

    function browserDetailPager(record) {
      const records = getBrowserRecords();
      const index = records.findIndex((item) => item.id === record.id);
      const position = index >= 0 ? index + 1 : 1;
      return `
        <div class="lowdim-standard-browser-detail-pager" aria-label="标准详情分页">
          <button type="button" class="lowdim-standard-browser-detail-pager-btn" data-standard-browser-detail-nav="prev" ${index <= 0 ? "disabled" : ""} aria-label="上一条">‹</button>
          <span>${position} / ${Math.max(records.length, 1)}</span>
          <button type="button" class="lowdim-standard-browser-detail-pager-btn" data-standard-browser-detail-nav="next" ${index < 0 || index >= records.length - 1 ? "disabled" : ""} aria-label="下一条">›</button>
        </div>
      `;
    }

    function browserDetail(record) {
      const references = record.references || browserReferences;
      return `
        <div class="lowdim-standard-browser-shell lowdim-standard-browser-detail-shell">
          <div class="lowdim-standard-browser-head">
            <div>
              <div class="lowdim-standard-browser-breadcrumb">
                <span>首页</span><i>/</i><span>低维材料标准体系</span><i>/</i><strong>标准详情</strong>
              </div>
              <div class="lowdim-standard-browser-title-row">
                <button class="lowdim-standard-browser-back-icon" type="button" data-standard-browser-back aria-label="返回标准列表">‹</button>
                <div>
                  <span class="twod-search-eyebrow">低维材料标准体系</span>
                  <h2>${escapeBrowserHtml(record.standardName)}</h2>
                  <p>${escapeBrowserHtml(record.standardNo)}</p>
                </div>
              </div>
            </div>
            <div class="lowdim-standard-browser-head-actions">
              <button class="btn" type="button" data-standard-browser-back>返回列表</button>
            </div>
          </div>
          <section class="lowdim-standard-browser-panel">
            <div class="lowdim-standard-browser-section-title">
              <div class="lowdim-standard-browser-section-heading"><span class="lowdim-standard-browser-section-icon" aria-hidden="true">i</span><h3>基本信息</h3></div>
            </div>
            <div class="lowdim-standard-browser-detail-grid">
              <div class="lowdim-standard-browser-detail-item"><span>标准编号</span><strong>${escapeBrowserHtml(record.standardNo)}</strong></div>
              <div class="lowdim-standard-browser-detail-item"><span>标准文件名称</span><strong>${escapeBrowserHtml(record.standardName)}</strong></div>
              <div class="lowdim-standard-browser-detail-item"><span>标准级别</span><strong>${escapeBrowserHtml(record.level)}</strong></div>
              <div class="lowdim-standard-browser-detail-item"><span>发布机构</span><strong>${escapeBrowserHtml(record.organization)}</strong></div>
              <div class="lowdim-standard-browser-detail-item"><span>发布日期</span><strong>${escapeBrowserHtml(record.publishDate)}</strong></div>
              <div class="lowdim-standard-browser-detail-item"><span>实施日期</span><strong>${escapeBrowserHtml(record.effectiveDate)}</strong></div>
            </div>
          </section>
          <section class="lowdim-standard-browser-panel">
            <div class="lowdim-standard-browser-section-title">
              <div class="lowdim-standard-browser-section-heading"><span class="lowdim-standard-browser-section-icon" aria-hidden="true"></span><h3>适用范围</h3></div>
            </div>
            <div class="lowdim-standard-browser-scope">
              <p>${escapeBrowserHtml(record.intro)}</p>
              <p>${escapeBrowserHtml(record.projectMatch)}</p>
            </div>
          </section>
          <section class="lowdim-standard-browser-panel">
            <div class="lowdim-standard-browser-section-title">
              <div class="lowdim-standard-browser-section-heading"><span class="lowdim-standard-browser-section-icon" aria-hidden="true">▤</span><h3>规范性引用文件</h3></div>
              <span>${references.length} 项</span>
            </div>
            <p class="lowdim-standard-browser-section-desc">下列文件用于说明本标准的引用依据和相关技术来源。</p>
            <ol class="lowdim-standard-browser-references">${references.map((item) => `<li>${escapeBrowserHtml(item)}</li>`).join("")}</ol>
          </section>
          <section class="lowdim-standard-browser-panel">
            <div class="lowdim-standard-browser-section-title">
              <div class="lowdim-standard-browser-section-heading"><span class="lowdim-standard-browser-section-icon" aria-hidden="true">▣</span><h3>标准核心内容</h3></div>
            </div>
            <div class="lowdim-standard-browser-rich-view">
              <div class="lowdim-standard-browser-rich-block">
                <span>核心内容说明</span>
                <p>${escapeBrowserHtml(record.coreContent)}</p>
              </div>
              <div class="lowdim-standard-browser-rich-block">
                <span>项目匹配场景</span>
                <p>${escapeBrowserHtml(record.projectMatch)}</p>
              </div>
            </div>
          </section>
          <section class="lowdim-standard-browser-panel">
            <div class="lowdim-standard-browser-section-title">
              <div class="lowdim-standard-browser-section-heading"><span class="lowdim-standard-browser-section-icon" aria-hidden="true">↗</span><h3>附件</h3></div>
              <span>支持下载</span>
            </div>
            <div class="lowdim-standard-browser-attachment-detail">
              <div class="lowdim-standard-browser-file-main">
                <span class="lowdim-standard-browser-file-icon" aria-hidden="true">TXT</span>
                <div>
                  <strong>${escapeBrowserHtml(record.attachmentName)}</strong>
                  <p>标准文档摘要附件 · TXT</p>
                </div>
              </div>
              <button class="btn-primary btn-sm" type="button" data-standard-browser-download="${escapeBrowserHtml(record.id)}">下载附件</button>
            </div>
          </section>
          ${browserDetailPager(record)}
        </div>
      `;
    }

    function renderLowdimStandardBrowserPage() {
      const page = document.getElementById("page-standard-twod");
      if (!page || state?.page === MANAGEMENT_PAGE) return;
      const activeRecord = browserRecords.find((record) => record.id === browserState.detailId);
      if (activeRecord) {
        page.innerHTML = `<style>${getLowdimStandardBrowserStyles()}</style>${browserDetail(activeRecord)}`;
        return;
      }
      const filtered = getBrowserRecords();
      const { records, totalPages } = browserPager(filtered.length);
      page.innerHTML = `
        <style>${getLowdimStandardBrowserStyles()}</style>
        <div class="lowdim-standard-browser-type-tabs" role="tablist" aria-label="标准类型">
          ${browserTypes.map((type) => `<button type="button" class="${browserState.activeType === type ? "active" : ""}" data-standard-browser-type="${escapeBrowserHtml(type)}" role="tab" aria-selected="${browserState.activeType === type ? "true" : "false"}">${escapeBrowserHtml(type)}</button>`).join("")}
        </div>
        <div class="lowdim-standard-browser-shell">
          <section class="lowdim-standard-browser-panel lowdim-standard-browser-filter-panel">
            <div class="lowdim-standard-browser-filters">
              <label><span>标准名称</span><input type="search" value="${escapeBrowserHtml(browserState.keyword)}" placeholder="请输入标准名称" data-standard-browser-keyword></label>
              <label><span>发布时间</span><div class="lowdim-standard-browser-date-range"><input type="date" value="${escapeBrowserHtml(browserState.publishFrom)}" aria-label="发布时间开始" data-standard-browser-from><i>至</i><input type="date" value="${escapeBrowserHtml(browserState.publishTo)}" aria-label="发布时间结束" data-standard-browser-to></div></label>
              <label><span>标准级别</span><select data-standard-browser-level><option value="">请选择标准级别</option>${browserLevels.map((level) => `<option value="${escapeBrowserHtml(level)}" ${browserState.level === level ? "selected" : ""}>${escapeBrowserHtml(level)}</option>`).join("")}</select></label>
              <button class="btn lowdim-standard-browser-clear" type="button" data-standard-browser-clear>清空条件</button>
            </div>
          </section>
          <div class="lowdim-standard-browser-list-head"><strong>共 ${filtered.length} 条标准</strong></div>
          <section class="lowdim-standard-browser-grid">${records.length ? records.map(browserCard).join("") : `<div class="lowdim-standard-browser-empty">暂无符合条件的标准文件</div>`}</section>
          ${browserPagination(filtered.length, totalPages)}
        </div>
      `;
    }

    function getLowdimStandardBrowserStyles() {
      return `
        #page-standard-twod{background:#f6f8fb;margin:-18px -22px -24px;min-height:calc(100vh - var(--topbar-height));padding:0 0 28px;color:#142033;}
        #page-standard-twod .lowdim-standard-browser-shell{padding:22px;display:grid;gap:16px;}
        #page-standard-twod .lowdim-standard-browser-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;flex-wrap:wrap;}
        #page-standard-twod .lowdim-standard-browser-head h2{margin:6px 0 0;color:#0f2377;font-size:24px;line-height:32px;font-weight:800;}
        #page-standard-twod .lowdim-standard-browser-head p{margin:8px 0 0;color:#526176;font-size:14px;line-height:24px;}
        #page-standard-twod .lowdim-standard-browser-head-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap;}
        #page-standard-twod .lowdim-standard-browser-detail-shell{gap:22px;}
        #page-standard-twod .lowdim-standard-browser-breadcrumb{display:flex;align-items:center;gap:8px;margin-bottom:10px;color:#8a97aa;font-size:13px;line-height:20px;}
        #page-standard-twod .lowdim-standard-browser-breadcrumb i{font-style:normal;color:#b4bfcc;}
        #page-standard-twod .lowdim-standard-browser-breadcrumb strong{color:#2451c6;font-weight:800;}
        #page-standard-twod .lowdim-standard-browser-title-row{display:flex;align-items:center;gap:12px;}
        #page-standard-twod .lowdim-standard-browser-back-icon{display:grid;width:34px;height:34px;flex:0 0 auto;place-items:center;border:1px solid #dce4ef;border-radius:50%;background:#fff;color:#718096;font-size:26px;line-height:1;cursor:pointer;}
        #page-standard-twod .lowdim-standard-browser-back-icon:hover{border-color:#9db9e9;background:#eef5ff;color:#2451c6;}
        #page-standard-twod .lowdim-standard-browser-section-heading{display:flex;align-items:center;gap:8px;min-width:0;}
        #page-standard-twod .lowdim-standard-browser-section-icon{display:inline-grid;width:22px;height:22px;flex:0 0 auto;place-items:center;border-radius:5px;background:#e8f2ff;color:#2d6cdf;font-size:13px;font-weight:800;line-height:1;}
        #page-standard-twod .lowdim-standard-browser-section-heading h3{min-width:0;}
        #page-standard-twod .lowdim-standard-browser-scope{display:grid;gap:12px;color:#526176;font-size:14px;line-height:28px;}
        #page-standard-twod .lowdim-standard-browser-scope p{margin:0;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;}
        #page-standard-twod .lowdim-standard-browser-section-desc{margin:0 0 12px;color:#7b8798;font-size:13px;line-height:24px;}
        #page-standard-twod .lowdim-standard-browser-type-tabs{display:flex;align-items:center;gap:8px;overflow-x:auto;padding:12px 22px;background:#fff;border-bottom:1px solid #dfe6f1;}
        #page-standard-twod .lowdim-standard-browser-type-label{flex:0 0 auto;color:#0f2377;font-size:14px;font-weight:800;white-space:nowrap;}
        #page-standard-twod .lowdim-standard-browser-type-tabs button{min-height:40px;padding:0 16px;border:1px solid #c3d8fb;border-radius:6px;background:#eef4ff;color:#1f63ff;font-size:13px;font-weight:700;white-space:nowrap;transition:background .2s ease,color .2s ease,border-color .2s ease;}
        #page-standard-twod .lowdim-standard-browser-type-tabs button:hover{background:#dfebff;border-color:#9dc0fb;}
        #page-standard-twod .lowdim-standard-browser-type-tabs button.active{background:#1f63ff;color:#fff;border-color:#1f63ff;box-shadow:0 2px 8px rgba(31,99,255,.28);}
        #page-standard-twod .lowdim-standard-browser-panel{background:#fff;border:1px solid #dfe6f1;border-radius:8px;padding:16px;box-shadow:0 10px 24px rgba(31,55,92,.06);}
        #page-standard-twod .lowdim-standard-browser-filters{display:grid;grid-template-columns:minmax(220px,1fr) minmax(300px,1.2fr) minmax(200px,.8fr) auto;align-items:end;gap:12px;}
        #page-standard-twod .lowdim-standard-browser-filters label{display:grid;gap:6px;color:#334155;font-size:13px;font-weight:700;}
        #page-standard-twod .lowdim-standard-browser-filters input,#page-standard-twod .lowdim-standard-browser-filters select{width:100%;min-height:42px;border:1px solid #cfd8e6;border-radius:6px;background:#fff;padding:0 11px;color:#142033;outline:none;}
        #page-standard-twod .lowdim-standard-browser-filters input:focus,#page-standard-twod .lowdim-standard-browser-filters select:focus{border-color:#2451c6;box-shadow:0 0 0 3px rgba(36,81,198,.12);}
        #page-standard-twod .lowdim-standard-browser-date-range{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:8px;}
        #page-standard-twod .lowdim-standard-browser-date-range i{font-style:normal;color:#94a3b8;}
        #page-standard-twod .lowdim-standard-browser-clear{min-height:42px;white-space:nowrap;}
        #page-standard-twod .lowdim-standard-browser-list-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;color:#64748b;font-size:13px;}
        #page-standard-twod .lowdim-standard-browser-list-head strong{color:#123c9c;font-size:17px;}
        #page-standard-twod .lowdim-standard-browser-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;}
        #page-standard-twod .lowdim-standard-browser-card{min-width:0;display:flex;flex-direction:column;min-height:286px;padding:16px;border:1px solid #dfe6f1;border-radius:8px;background:#fff;box-shadow:0 8px 20px rgba(31,55,92,.05);transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease;}
        #page-standard-twod .lowdim-standard-browser-card:hover{transform:translateY(-2px);border-color:#a9bfe9;box-shadow:0 14px 28px rgba(31,55,92,.1);}
        #page-standard-twod .lowdim-standard-browser-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px;}
        #page-standard-twod .lowdim-standard-browser-badge{display:inline-flex;align-items:center;min-height:24px;padding:2px 9px;border-radius:999px;background:#eaf2ff;color:#123c9c;font-size:12px;font-weight:800;white-space:nowrap;}
        #page-standard-twod .lowdim-standard-browser-number{color:#64748b;font-size:12px;font-variant-numeric:tabular-nums;white-space:nowrap;}
        #page-standard-twod .lowdim-standard-browser-card h3{display:-webkit-box;margin:0;color:#142033;font-size:16px;line-height:24px;font-weight:800;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;}
        #page-standard-twod .lowdim-standard-browser-intro{display:-webkit-box;min-height:48px;margin:10px 0 14px;color:#64748b;font-size:13px;line-height:24px;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;}
        #page-standard-twod .lowdim-standard-browser-meta{display:grid;gap:7px;margin:0;}
        #page-standard-twod .lowdim-standard-browser-meta div{display:grid;grid-template-columns:68px minmax(0,1fr);gap:8px;min-width:0;font-size:12px;line-height:20px;}
        #page-standard-twod .lowdim-standard-browser-meta dt{color:#94a3b8;}
        #page-standard-twod .lowdim-standard-browser-meta dd{min-width:0;margin:0;color:#334155;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        #page-standard-twod .lowdim-standard-browser-card-footer{display:flex;justify-content:flex-end;margin-top:auto;padding-top:14px;border-top:1px solid #edf1f6;}
        #page-standard-twod .lowdim-standard-browser-detail-btn{min-width:88px;color:#123c9c;border-color:#2451c6;background:#fff;}
        #page-standard-twod .lowdim-standard-browser-empty{grid-column:1/-1;padding:46px 18px;text-align:center;color:#64748b;border:1px dashed #cfd8e6;border-radius:8px;background:#fbfdff;}
        #page-standard-twod .lowdim-standard-browser-pagination{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px 2px 0;color:#64748b;font-size:13px;}
        #page-standard-twod .lowdim-standard-browser-page-buttons{display:flex;align-items:center;gap:6px;}
        #page-standard-twod .lowdim-standard-browser-page-buttons button{width:34px;height:34px;border:1px solid #d4deeb;border-radius:5px;background:#fff;color:#334155;cursor:pointer;}
        #page-standard-twod .lowdim-standard-browser-page-buttons button:hover:not(:disabled){border-color:#2451c6;color:#123c9c;background:#eaf2ff;}
        #page-standard-twod .lowdim-standard-browser-page-buttons button.active{border-color:#123c9c;background:#123c9c;color:#fff;}
        #page-standard-twod .lowdim-standard-browser-page-buttons button:disabled{cursor:not-allowed;opacity:.45;}
        #page-standard-twod .lowdim-standard-browser-section-title{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;}
        #page-standard-twod .lowdim-standard-browser-section-title h3{margin:0;color:#0f2377;font-size:18px;line-height:26px;}
        #page-standard-twod .lowdim-standard-browser-section-title span{color:#64748b;font-size:13px;}
        #page-standard-twod .lowdim-standard-browser-info-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;}
        #page-standard-twod .lowdim-standard-browser-info-grid div{display:grid;gap:6px;min-width:0;padding:12px;border:1px solid #e2e8f0;border-radius:6px;background:var(--color-bg-table-head, #f5f5f5);}
        #page-standard-twod .lowdim-standard-browser-info-grid span{color:#64748b;font-size:12px;font-weight:700;}
        #page-standard-twod .lowdim-standard-browser-info-grid strong{color:#142033;font-size:14px;line-height:22px;overflow-wrap:anywhere;}
        #page-standard-twod .lowdim-standard-browser-detail-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;}
        #page-standard-twod .lowdim-standard-browser-detail-item{display:grid;gap:6px;min-width:0;padding:12px;border:1px solid #e2e8f0;border-radius:6px;background:var(--color-bg-table-head, #f5f5f5);}
        #page-standard-twod .lowdim-standard-browser-detail-item span{color:#64748b;font-size:12px;font-weight:700;}
        #page-standard-twod .lowdim-standard-browser-detail-item strong{color:#142033;font-size:14px;line-height:22px;overflow-wrap:anywhere;word-break:break-word;}
        #page-standard-twod .lowdim-standard-browser-rich-view{display:grid;gap:14px;min-height:120px;padding:14px;border:1px solid #dfe6f1;border-radius:6px;background:#fbfdff;color:#334155;font-size:14px;line-height:26px;overflow-wrap:anywhere;}
        #page-standard-twod .lowdim-standard-browser-rich-block{min-width:0;}
        #page-standard-twod .lowdim-standard-browser-rich-block + .lowdim-standard-browser-rich-block{padding-top:14px;border-top:1px solid #E5E6EB;}
        #page-standard-twod .lowdim-standard-browser-rich-block span{display:block;margin-bottom:4px;color:#64748b;font-size:12px;font-weight:800;}
        #page-standard-twod .lowdim-standard-browser-rich-block p{margin:0;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;}
        #page-standard-twod .lowdim-standard-browser-rich{padding:14px;border:1px solid #dfe6f1;border-radius:6px;background:#fbfdff;color:#334155;font-size:14px;line-height:26px;overflow-wrap:anywhere;}
        #page-standard-twod .lowdim-standard-browser-references{display:grid;gap:8px;margin:0;padding:0 0 0 22px;color:#334155;font-size:13px;line-height:24px;}
        #page-standard-twod .lowdim-standard-browser-attachment-detail{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:14px;border:1px solid #dfe6f1;border-radius:8px;background:var(--color-bg-table-head, #f5f5f5);}
        #page-standard-twod .lowdim-standard-browser-attachment-detail strong{display:block;color:#142033;font-size:14px;overflow-wrap:anywhere;word-break:break-word;}
        #page-standard-twod .lowdim-standard-browser-attachment-detail p{margin:6px 0 0;color:#64748b;line-height:22px;}
        #page-standard-twod .lowdim-standard-browser-file-main{display:flex;align-items:center;gap:12px;min-width:0;}
        #page-standard-twod .lowdim-standard-browser-file-main > div{min-width:0;}
        #page-standard-twod .lowdim-standard-browser-file-icon{display:grid;width:38px;height:42px;flex:0 0 auto;place-items:center;border:1px solid #ff6b6b;border-radius:5px;background:#fff4f4;color:#f04444;font-size:10px;font-weight:800;}
        #page-standard-twod .lowdim-standard-browser-detail-pager{display:flex;align-items:center;justify-content:center;gap:14px;min-height:42px;color:#526176;font-size:13px;}
        #page-standard-twod .lowdim-standard-browser-detail-pager-btn{display:grid;width:34px;height:34px;place-items:center;border:1px solid #d4deeb;border-radius:5px;background:#fff;color:#334155;font-size:22px;line-height:1;cursor:pointer;}
        #page-standard-twod .lowdim-standard-browser-detail-pager-btn:hover:not(:disabled){border-color:#2451c6;background:#eaf2ff;color:#123c9c;}
        #page-standard-twod .lowdim-standard-browser-detail-pager-btn:disabled{cursor:not-allowed;opacity:.4;}
        @media (max-width:1100px){#page-standard-twod .lowdim-standard-browser-filters{grid-template-columns:repeat(2,minmax(0,1fr));}#page-standard-twod .lowdim-standard-browser-grid{grid-template-columns:repeat(2,minmax(0,1fr));}#page-standard-twod .lowdim-standard-browser-info-grid,#page-standard-twod .lowdim-standard-browser-detail-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}
        @media (max-width:720px){#page-standard-twod{margin:-18px -12px -24px;}#page-standard-twod .lowdim-standard-browser-shell{padding:14px;}#page-standard-twod .lowdim-standard-browser-type-tabs{padding:10px 14px;}#page-standard-twod .lowdim-standard-browser-filters,#page-standard-twod .lowdim-standard-browser-grid,#page-standard-twod .lowdim-standard-browser-info-grid,#page-standard-twod .lowdim-standard-browser-detail-grid{grid-template-columns:1fr;}#page-standard-twod .lowdim-standard-browser-date-range{grid-template-columns:1fr;}.lowdim-standard-browser-date-range i{display:none;}}
        @media (prefers-reduced-motion:reduce){#page-standard-twod .lowdim-standard-browser-card,#page-standard-twod .lowdim-standard-browser-type-tabs button{transition:none;}}
      `;
    }

    function downloadBrowserAttachment(record) {
      const references = record.references || browserReferences;
      const content = [
        record.standardNo,
        record.standardName,
        `发布机构：${record.organization}`,
        `发布日期：${record.publishDate}`,
        `实施日期：${record.effectiveDate}`,
        `标准级别：${record.level}`,
        "",
        `简介：${record.intro}`,
        "",
        `核心内容：${record.coreContent}`,
        "",
        `项目匹配：${record.projectMatch}`,
        "",
        "规范性引用文件：",
        ...references
      ].join("\n");
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = record.attachmentName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      if (typeof showToast === "function") showToast("标准体系", `${record.standardNo} 附件已开始下载。`);
    }

    renderTwodStandardPage = function renderLowdimStandardBrowserOrLegacy() {
      if (state?.page === MANAGEMENT_PAGE && legacyTwodStandardRenderer) {
        legacyTwodStandardRenderer();
        return;
      }
      renderLowdimStandardBrowserPage();
    };

    document.body.addEventListener("click", (event) => {
      const typeButton = event.target.closest("[data-standard-browser-type]");
      if (typeButton) {
        browserState.activeType = typeButton.dataset.standardBrowserType || browserTypes[0];
        browserState.keyword = "";
        browserState.publishFrom = "";
        browserState.publishTo = "";
        browserState.level = "";
        browserState.page = 1;
        browserState.detailId = "";
        renderLowdimStandardBrowserPage();
        return;
      }
      if (event.target.closest("[data-standard-browser-manage]")) {
        if (typeof switchPage === "function") switchPage(MANAGEMENT_PAGE);
        return;
      }
      const detailNavButton = event.target.closest("[data-standard-browser-detail-nav]");
      if (detailNavButton && !detailNavButton.disabled) {
        const records = getBrowserRecords();
        const currentIndex = records.findIndex((record) => record.id === browserState.detailId);
        const direction = detailNavButton.dataset.standardBrowserDetailNav === "prev" ? -1 : 1;
        const nextRecord = records[currentIndex + direction];
        if (nextRecord) {
          browserState.detailId = nextRecord.id;
          renderLowdimStandardBrowserPage();
        }
        return;
      }
      const viewButton = event.target.closest("[data-standard-browser-view]");
      if (viewButton) {
        browserState.detailId = viewButton.dataset.standardBrowserView || "";
        renderLowdimStandardBrowserPage();
        return;
      }
      if (event.target.closest("[data-standard-browser-back]")) {
        browserState.detailId = "";
        renderLowdimStandardBrowserPage();
        return;
      }
      const downloadButton = event.target.closest("[data-standard-browser-download]");
      if (downloadButton) {
        const record = browserRecords.find((item) => item.id === downloadButton.dataset.standardBrowserDownload);
        if (record) downloadBrowserAttachment(record);
        return;
      }
      const pageButton = event.target.closest("[data-standard-browser-page]");
      if (pageButton && !pageButton.disabled) {
        browserState.page = Number(pageButton.dataset.standardBrowserPage) || 1;
        renderLowdimStandardBrowserPage();
        return;
      }
      if (event.target.closest("[data-standard-browser-clear]")) {
        browserState.keyword = "";
        browserState.publishFrom = "";
        browserState.publishTo = "";
        browserState.level = "";
        browserState.page = 1;
        renderLowdimStandardBrowserPage();
      }
    });

    document.body.addEventListener("input", (event) => {
      if (event.target.closest("[data-standard-browser-keyword]")) {
        browserState.keyword = event.target.value || "";
        browserState.page = 1;
        clearTimeout(browserKeywordTimer);
        browserKeywordTimer = setTimeout(() => renderLowdimStandardBrowserPage(), 160);
      }
    });

    document.body.addEventListener("change", (event) => {
      if (event.target.closest("[data-standard-browser-from]")) browserState.publishFrom = event.target.value || "";
      if (event.target.closest("[data-standard-browser-to]")) browserState.publishTo = event.target.value || "";
      if (event.target.closest("[data-standard-browser-level]")) browserState.level = event.target.value || "";
      if (event.target.closest("[data-standard-browser-from],[data-standard-browser-to],[data-standard-browser-level]")) {
        browserState.page = 1;
        renderLowdimStandardBrowserPage();
      }
    });

    if (state?.page === "standard-twod") renderLowdimStandardBrowserPage();
  })();
  