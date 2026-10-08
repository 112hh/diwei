
/* =====================================================================
   低维材料数据标准化 · 五库规则库与标准化页面
   来源：《低维材料主题库》需求清单
     - 第 1-5 项  低维材料标准体系（摘要规范/选择标准/计算条件标准/数据质量衡量标准/筛选标准…）
     - 第 23-27 项 低维材料数据标准化（二维/有机光电/电解质/机器学习力场/催化材料）
   说明：采集加工处理（数据资源加工、标准化环节）直接调用本规则库执行标准化。
   ===================================================================== */
(function () {
  if (window.__LOWDIM_STD_LIBRARY_READY__) return;
  window.__LOWDIM_STD_LIBRARY_READY__ = true;

  function esc(value) {
    if (typeof escapeLowDimHtml === "function") return escapeLowDimHtml(value == null ? "" : String(value));
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function toast(title, body) {
    if (typeof showToast === "function") showToast(title, body);
  }
  function r(key, item, field, value, type, basis) {
    return { id: key + "-" + field, item: item, field: field, value: value, type: type, basis: basis || "" };
  }

  /* ================= 规则库：二维材料 ================= */
  const TWOD_LIB = {
    key: "twod",
    short: "二维材料",
    database: "二维材料数据库",
    standardName: "二维材料数据库标准",
    standardizationName: "二维材料数据标准化",
    target: "30,600",
    cover: "计算方法标准化、数据格式标准化、数据表格标准化、数据图片标准化、数据单位标准化",
    source: "VASP（Vienna Ab-initio Simulation Package）",
    lead: "二维材料数据库录入总体工作流程为三部分：先统计二维材料并按组分与磁性归类，依据材料特性选择合适的第一性原理计算软件包；再分别计算每种材料单层与多层的电学、力学、磁学、光学、热学及缺陷性质，结果按统一标准汇总整理；最后与已发表高质量前沿文章和现有材料数据库结果交叉比对，在数据库中展示原子结构、电子结构与可靠的计算结果。",
    workflow: [
      { title: "分类与建模", text: "统计二维材料按组分和磁性归类；常用软件包 VASP、Quantum ESPRESSO、Gaussian16、USPEX、Materials Studio，本模块主要选用 VASP。" },
      { title: "单层 / 多层性能计算", text: "每种材料分别计算单层与多层的电学、力学、磁学、光学、热学性质以及缺陷性质。" },
      { title: "交叉比对与发布", text: "与已发表高质量前沿文章和现有材料数据库的计算结果比较，展示原子结构、电子结构与可靠计算结果。" }
    ],
    systemStandards: [
      { name: "二维材料摘要规范", brief: "以图表和字符方式构建二维材料数据集，覆盖八大性质。", points: [
        "结构特征：原子结构图、化学式、晶格常数、层厚、原子坐标、键长键角、晶系、空间群",
        "电子结构：能带结构、态密度、有效质量",
        "电学性质：铁电性、压电性；磁学性质：磁基态构型、磁转变温度",
        "热学性质：形成能、声子谱、声子态密度",
        "力学性质：弹性常数、杨氏模量、泊松比",
        "光学性质：介电函数、光吸收系数、反射率、折射率、消光系数",
        "缺陷性质：空位缺陷、反位缺陷"
      ] },
      { name: "二维材料选择标准", brief: "按稳定性与丰富可调的物理/化学性质选材。", points: [
        "动力学稳定性、热力学稳定性、力学稳定性是首要考虑因素",
        "优选具有丰富且可调控的电学、磁学性质的二维材料",
        "支撑面向电子器件、光电器件、集成电路的高通量筛选"
      ] },
      { name: "二维材料计算条件标准", brief: "规范计算模型构建、计算软件与计算精度参数。", points: [
        "建模软件：Materials Studio、VESTA；导出 POSCAR、cif 等可读取格式",
        "计算软件：基于 DFT 的 VASP，采用 PAW 描述离子实与价电子相互作用",
        "交换关联泛函：GGA-PBE；截断能 500 eV；真空层厚度 15 Å",
        "结构优化收敛力标准：不大于 0.01 eV/Å"
      ] },
      { name: "二维材料数据质量衡量标准", brief: "衡量结构模型、图谱、有效位数与物性参数质量。", points: [
        "计算结构模型：文件格式为数据库支持的 xyz、cif；晶格常数与实验数据比对判断合理性",
        "图谱质量：清晰，分辨率 300 dpi，大小 200 KB ~ 1 MB，格式 jpg / png / tiff",
        "计算结果有效位数：与已发表文献、实验数据及其他权威数据库交叉对比",
        "物理和化学性质参数（磁矩、带隙、电荷转移）：与文献、实验及权威数据库交叉对比"
      ] },
      { name: "二维材料筛选标准", brief: "基于七大性质族快速匹配目标二维材料。", points: [
        "电子结构：能带结构、态密度；电学性质：铁电性、压电性",
        "磁学性质：磁基态构型、磁转变温度",
        "热学性质：形成能、声子谱、声子态密度",
        "力学性质：弹性常数、杨氏模量、泊松比",
        "光学性质：光吸收系数、反射率、折射率、消光系数；缺陷性质：空位、反位缺陷"
      ] }
    ],
    categories: [
      {
        key: "calc", label: "计算方法标准化",
        intro: "统一采用第一性原理计算软件包 VASP，交换关联势采用 GGA-PBE 形式，并规范赝势、截断能、K 点与能量/力收敛标准。",
        sections: [{ title: "", rules: [
          r("twod-calc", "计算软件", "calc_software", "VASP（Vienna Ab-initio Simulation Package）", "字符", "二维材料模块主要选用 VASP 计算材料物理性能，保证准确性与可重复性。"),
          r("twod-calc", "交换关联泛函", "functional", "GGA-PBE", "字符", "统一采用广义梯度近似下的 PBE 泛函。"),
          r("twod-calc", "赝势文件", "potcar", "按组分成键轨道电子结构确定 POTCAR", "文件", "同一元素存在多个版本 PAW 势文件时，按组分成键轨道选择。"),
          r("twod-calc", "截断能 ENCUT", "encut", "500 eV（且须满足能量收敛）", "数字+单位", "POTCAR 默认 ENMAX / ENMIN 仅作参考，截断能须满足收敛标准。"),
          r("twod-calc", "K 点网格", "kpoint_grid", "满足能量与力的收敛标准", "字符", "布里渊区 K 点数须满足结构优化的能量和力收敛。"),
          r("twod-calc", "能量收敛精度", "energy_conv", "1e-6 eV", "数字+单位", "结构优化能量收敛标准。"),
          r("twod-calc", "力的收敛精度", "force_conv", "1e-2 eV/Å", "数字+单位", "结构优化力收敛标准。"),
          r("twod-calc", "范德华修正", "vdw_correction", "DFT-D3", "字符", "层状二维材料计算时考虑范德瓦尔斯相互作用。"),
          r("twod-calc", "强关联体系", "dft_u", "DFT+U（Hubbard U）", "字符", "金属氧化物、稀土元素及其化合物等在能量泛函中加入 Hubbard 参数 U。"),
          r("twod-calc", "计算层级", "layer_scope", "单层 + 多层分别计算", "枚举", "每种材料分别计算其单层和多层的物理性能。")
        ] }]
      },
      {
        key: "format", label: "数据格式标准化",
        intro: "材料性质数据采用 VASP 对应输出文件格式，图表类数据统一为 .dat，并保留可视化源文件与版本信息。",
        sections: [{ title: "", rules: [
          r("twod-fmt", "材料性质数据格式", "property_file_format", "VASP 输出文件格式", "文件", "数据库中材料性质的数据格式采用 VASP 对应的输出文件格式。"),
          r("twod-fmt", "图表类数据格式", "chart_data_format", ".dat（内容格式与 VASP 输出一致）", "文件", "K 点测试、截断能测试等统一保存为 .dat。"),
          r("twod-fmt", "可视化源文件", "visual_source_format", "保留 VASP 输出源文件格式", "文件", "需要软件进行可视化的文件保留 VASP 输出源文件格式。"),
          r("twod-fmt", "软件版本信息", "vasp_version", "显示计算所用 VASP 版本信息", "字符", "数据中显示计算时 VASP 的版本信息，保证可追溯。"),
          r("twod-fmt", "后处理端口", "post_process_port", "内置后处理与可视化软件端口", "字符", "数据库中内置对应后处理软件与可视化软件的端口。")
        ] }]
      },
      {
        key: "table", label: "数据表格标准化",
        intro: "展示材料性能的数据表格采用统一格式，单位为标准化单位。",
        sections: [{ title: "", rules: [
          r("twod-tab", "表格格式", "table_format", "统一表格格式", "字符", "所有性能数据表采用统一的表格格式。"),
          r("twod-tab", "单位标注", "table_unit", "采用标准化单位", "单位", "表格中单位为标准化的单位。"),
          r("twod-tab", "单位制", "unit_system", "学术常用单位制", "枚举", "均采用学术常用单位制。")
        ] }]
      },
      {
        key: "image", label: "数据图片标准化",
        intro: "数据库中的图片与三维模型统一格式。",
        sections: [{ title: "", rules: [
          r("twod-img", "图片格式", "image_format", "PNG", "文件", "数据库中的图片统一采用 PNG 格式图片。"),
          r("twod-img", "三维模型格式", "model_format", "DAE", "文件", "对于三维模型则采用 DAE 格式文件。"),
          r("twod-img", "图片分辨率", "image_dpi", "300 dpi", "数字+单位", "图谱质量衡量标准要求分辨率达到 300 dpi。"),
          r("twod-img", "图片大小", "image_size", "200 KB ~ 1 MB", "数字+单位", "图像大小要求在 200 KB 以上、1 MB 以下。")
        ] }]
      },
      {
        key: "unit", label: "数据单位标准化",
        intro: "为便于比较材料性能，物理量采用统一单位标定。",
        sections: [{ title: "", rules: [
          r("twod-unit", "单位标定原则", "unit_normalize", "物理量采用统一单位标定", "单位", "数据库中为更方便比较材料性能，物理量采用统一单位标定。"),
          r("twod-unit", "长度", "length_unit", "Å", "单位", "晶格常数、键长、层厚等长度量。"),
          r("twod-unit", "能量 / 带隙", "energy_unit", "eV", "单位", "形成能、带隙、声子能量等。"),
          r("twod-unit", "磁矩", "magnetic_moment_unit", "μB/atom", "单位", "原子磁矩标准单位。"),
          r("twod-unit", "杨氏模量", "young_modulus_unit", "N/m²", "单位", "力学性质标准单位。")
        ] }]
      }
    ],
    formSpec: [
      "数据表格：统一表格格式，单位为标准化单位，采用学术常用单位制",
      "图片文件：PNG 格式，分辨率 300 dpi，大小 200 KB ~ 1 MB",
      "三维模型：DAE 格式文件",
      "性质数据文件：VASP 输出格式；图表类数据 .dat",
      "单位体系：Å / eV / μB·atom⁻¹ / N·m⁻² 等学术常用单位"
    ],
    nonstandard: [
      { id: "twod-ns-01", material: "MoS2-2H", field: "encut", current: "420 eV", target: "500 eV", reason: "截断能低于标准值", status: "待处理" },
      { id: "twod-ns-02", material: "Graphene-001", field: "functional", current: "LDA", target: "GGA-PBE", reason: "泛函不符合标准", status: "待处理" },
      { id: "twod-ns-03", material: "h-BN-003", field: "image_dpi", current: "180 dpi", target: "300 dpi", reason: "图片分辨率低于标准", status: "待处理" },
      { id: "twod-ns-04", material: "WSe2-006", field: "bond_length_unit", current: "nm", target: "Å", reason: "键长单位需换算", status: "待处理" },
      { id: "twod-ns-05", material: "MoS2-2H", field: "vdw_correction", current: "未启用", target: "DFT-D3", reason: "层状体系缺少范德华修正", status: "待处理" },
      { id: "twod-ns-06", material: "Ti3C2-004", field: "chart_data_format", current: "txt", target: ".dat", reason: "图表类数据格式不符", status: "待处理" }
    ],
    ingestHint: "采集加工处理的「数据资源加工」按本库规则做字段清洗与格式转换；「标准化」环节调用本页全部规则逐条比对并回写标准值。"
  };

  /* ================= 规则库：有机光电材料 ================= */
  const OPTO_LIB = {
    key: "opto",
    short: "有机光电材料",
    database: "有机光电材料数据库",
    standardName: "有机光电材料数据库标准",
    standardizationName: "有机光电材料数据标准化",
    target: "1,000",
    cover: "计算方法标准化、数据格式标准化、结构文件标准化、图表标准化、表征图谱与 DOS 图标准化以及单位标准化",
    source: "Gaussian",
    lead: "有机光电数据库标准化工作分四步：提交数据（按标准格式提交，提交页给出规范说明）、审核数据（判断中英文名称、物理性质单位、结构文件格式、图谱格式是否合规，不合规则拒绝更新）、更新数据（自动整合为标准化表单，图形文件提供简略图与下载链接）、输出数据（输出满足标准化要求的 zip 数据包，格式与单位制以标准为准）。",
    workflow: [
      { title: "提交数据", text: "管理者或具备更新权限的用户在数据库更新界面按标准格式提交新数据，提交页面提供提交规范说明。" },
      { title: "审核数据", text: "管理者审核中英文名称、物理性质单位、结构文件格式、图谱格式，不符合标准化要求则拒绝本次更新。" },
      { title: "更新数据", text: "各项数据均满足标准化要求时执行更新，自动整合成标准化表单；图形文件在页面提供简略图并提供下载链接。" },
      { title: "输出数据", text: "数据更新完成后提供下载服务，输出压缩为包含参数信息与图谱信息的 zip 文件，格式与单位制均以标准化要求为准。" }
    ],
    systemStandards: [
      { name: "有机光电材料摘要规范", brief: "覆盖基础信息、物理性质、表征图谱与量子化学计算结果。", points: [
        "基础信息：中英文名称、分子式与分子量、分子编号、三维结构",
        "物理性质：密度、熔点、沸点、闪点",
        "表征图谱：红外光谱、拉曼光谱、核磁共振谱",
        "计算结果：基态结构、激发态结构、简正模式、激发能、发射能、斯托克斯位移、跃迁偶极矩、态密度、溶剂化自由能"
      ] },
      { name: "有机光电材料选择标准", brief: "按分子量与热稳定性选材，优先小分子体系。", points: [
        "为便于量子化学计算、高效获取激发与发光信息，尽量选择小分子体系，相对分子量控制在 500 以下",
        "考虑实际应用场景，应选择常温固相或液相、且不易着火的材料",
        "按分子量及热稳定性（熔点、闪点）进行材料选择"
      ] },
      { name: "有机光电材料计算条件标准", brief: "规范计算软件、溶剂条件、泛函基组选择。", points: [
        "计算软件：成熟的商业软件 Gaussian",
        "溶剂条件：溶剂对基态结构影响较小，统一不使用溶剂，以真空作为标准条件",
        "基态计算：b3lyp 泛函；激发态计算：PBE0 泛函",
        "基组：def2svp"
      ] },
      { name: "有机光电材料数据质量衡量标准", brief: "衡量模型文件、表征图谱、有效位数与物性参数质量。", points: [
        "模型文件：格式须为数据库支持格式 pdb、xyz、cif、mol；结构与已有实验数据和权威数据库比对",
        "表征图谱：清晰，分辨率 300 dpi，大小 200 KB ~ 1 MB，格式 jpg、png、tiff",
        "计算结果有效位数：与已发表国内外文献和实验数据交叉比对",
        "物性参数：与已发表文献、权威数据库、其他商业机构或化工材料厂商交叉比对"
      ] },
      { name: "有机光电材料筛选标准", brief: "基于物理性质、分子量、元素种类与发光颜色筛选。", points: [
        "物理性质：密度、熔点、沸点、闪点，决定使用场景",
        "分子量：控制在小分子范围以适配计算与应用",
        "元素种类：排除基本 C/H/O/N 后的其他元素，常与官能团相关",
        "发光颜色：有机光电材料最直观的使用性质"
      ] }
    ],
    categories: [
      {
        key: "calc", label: "计算方法标准化",
        intro: "由量子化学方法计算得到的数据（基态结构、简正模式、激发能、发射能、斯托克斯位移、跃迁偶极矩、态密度、溶剂化自由能）需规范计算方法，保证精确度与可比性。",
        sections: [{ title: "", rules: [
          r("opto-calc", "计算软件", "calc_software", "Gaussian", "字符", "为保证准确性及可重复性，统一使用成熟的商业软件 Gaussian。"),
          r("opto-calc", "溶剂条件", "solvent", "真空（不使用溶剂）", "字符", "消除光电材料在不同溶剂中的分散性差异，所有计算需在真空条件下进行。"),
          r("opto-calc", "基态泛函", "ground_functional", "b3lyp", "字符", "基态计算使用普遍适用的 b3lyp 泛函。"),
          r("opto-calc", "激发态泛函", "excited_functional", "PBE0", "字符", "激发态计算使用 PBE0 泛函。"),
          r("opto-calc", "基组", "basis_set", "def2svp", "字符", "综合考虑计算精度及效率，基组统一使用 def2svp。")
        ] }]
      },
      {
        key: "format", label: "数据格式标准化",
        intro: "数据库包含文字、分子结构、表征图谱等不同类型字段，需分别进行格式标准化。",
        sections: [{ title: "", rules: [
          r("opto-fmt", "分子结构文件", "structure_file_format", "pdb", "文件", "有机分子结构文件以 pdb 的格式提供。"),
          r("opto-fmt", "基本信息 / 物性 / 计算数据", "text_format", "文本格式", "文本", "基本信息、物性数据与计算数据以文本格式提供。"),
          r("opto-fmt", "表征图谱与 DOS 图", "spectrum_format", "jpg", "文件", "表征图谱与 DOS 图以 jpg 的格式提供。")
        ] }]
      },
      {
        key: "struct", label: "结构文件标准化",
        intro: "便于管理者和用户上传下载，统一结构文件格式与体积上限。",
        sections: [{ title: "", rules: [
          r("opto-struct", "结构文件格式", "structure_format", "pdb", "文件", "统一结构文件格式为 pdb 文件。"),
          r("opto-struct", "结构文件大小", "structure_size", "不超过 50 MB", "数字+单位", "统一结构文件格式为 pdb 文件，大小不超过 50 MB。")
        ] }]
      },
      {
        key: "chart", label: "图表标准化",
        intro: "对图片分辨率、颜色模式、尺寸以及表格与字体作出统一要求。",
        sections: [{ title: "", rules: [
          r("opto-chart", "图片分辨率", "image_dpi", "≥ 300 dpi", "数字+单位", "图片分辨率要求 ≥300 dpi。"),
          r("opto-chart", "颜色模式", "color_mode", "RGB", "字符", "图片颜色模式为 RGB。"),
          r("opto-chart", "图片尺寸", "image_width", "≤ 7.5 cm", "数字+单位", "图片大小控制在 7.5 cm 以内。"),
          r("opto-chart", "表格样式", "table_style", "三线表", "枚举", "表格为三线表格。"),
          r("opto-chart", "英文字体", "font_en", "Arial", "字符", "英文标注统一使用 Arial 字体。"),
          r("opto-chart", "中文字体", "font_cn", "宋体（正文）、黑体（标题）", "字符", "中文标注使用宋体（正文）与黑体（标题）。")
        ] }]
      },
      {
        key: "spectrum", label: "表征图谱与 DOS 图标准化",
        intro: "表征图谱与 DOS 图须满足底色、坐标轴、刻度、线型与文件规格要求。",
        sections: [{ title: "", rules: [
          r("opto-spec", "图谱底色", "figure_background", "白色底色", "字符", "数据库中的表征图谱应白色为底色。"),
          r("opto-spec", "坐标轴", "axis_style", "黑色且带单位的横纵坐标轴", "字符", "坐标轴均为黑色并具有清晰单位。"),
          r("opto-spec", "刻度方向（表征图谱）", "tick_direction_spectrum", "主次刻度，刻度向外，数字清晰", "字符", "表征图谱刻度向外。"),
          r("opto-spec", "DOS 图底色与字体", "dos_background", "白底黑字", "字符", "有机分子 DOS 图应白底黑字，坐标轴名称单位清晰可见。"),
          r("opto-spec", "刻度方向（DOS 图）", "tick_direction_dos", "主次刻度，刻度向内", "字符", "DOS 图刻度向内。"),
          r("opto-spec", "轨道曲线表示", "orbital_curve", "不同轨道用不同类型曲线表示", "字符", "DOS 总图中不同轨道用不同类型曲线区分。"),
          r("opto-spec", "DOS 分轨道图", "dos_pdos_rule", "与总图一致；单曲线时为黑实线", "字符", "DOS 分轨道图要求与 DOS 总图保持一致。"),
          r("opto-spec", "图片文件规格", "image_spec", "jpg / 300 dpi / RGB / ≤7.5 cm", "文件", "收录图片均为 jpg，分辨率 300 dpi，颜色模式 RGB，大小控制在 7.5 cm 以内。")
        ] }]
      },
      {
        key: "unit", label: "单位标准化",
        intro: "对能量、密度、温度、波长等物理性质词条统一单位。",
        sections: [{ title: "", rules: [
          r("opto-unit", "单位制", "unit_system", "国际单位制（SI）", "枚举", "本数据库中均采用国际单位制。"),
          r("opto-unit", "能量", "energy_unit", "eV", "单位", "激发能、发射能、HOMO/LUMO 能级等。"),
          r("opto-unit", "波长", "wavelength_unit", "nm", "单位", "吸收峰、发射峰等波长量。"),
          r("opto-unit", "温度", "temperature_unit", "K（或 °C，需注明）", "单位", "熔点、沸点、分解温度等需统一并保留换算记录。"),
          r("opto-unit", "密度", "density_unit", "g/cm³", "单位", "密度等物性参数标准单位。")
        ] }]
      }
    ],
    formSpec: [
      "结构文件：pdb 格式，单文件不超过 50 MB",
      "基本信息 / 物性数据 / 计算数据：文本格式",
      "表征图谱与 DOS 图：jpg 格式，300 dpi，RGB，≤7.5 cm",
      "表格：三线表；英文 Arial，中文宋体（正文）/黑体（标题）",
      "单位体系：国际单位制（SI）"
    ],
    nonstandard: [
      { id: "opto-ns-01", material: "DPP-DTT", field: "ground_functional", current: "PBE0", target: "b3lyp", reason: "基态泛函不符合标准", status: "待处理" },
      { id: "opto-ns-02", material: "Y6-受体", field: "structure_format", current: "mol", target: "pdb", reason: "结构文件格式需统一为 pdb", status: "待处理" },
      { id: "opto-ns-03", material: "ITIC-分子", field: "image_dpi", current: "200 dpi", target: "≥300 dpi", reason: "图谱分辨率低于标准", status: "待处理" },
      { id: "opto-ns-04", material: "PM6-聚合物", field: "table_style", current: "全框线表", target: "三线表", reason: "表格样式不符", status: "待处理" },
      { id: "opto-ns-05", material: "PC61BM", field: "structure_size", current: "78 MB", target: "≤50 MB", reason: "结构文件超出体积上限", status: "待处理" },
      { id: "opto-ns-06", material: "DPP-DTT", field: "tick_direction_dos", current: "刻度向外", target: "刻度向内", reason: "DOS 图刻度方向不符", status: "待处理" }
    ],
    ingestHint: "采集加工处理提交的新数据将按本库标准审核：中英文名称、物理性质单位、结构文件格式、图谱格式任一项不符即拒绝更新。"
  };


  /* ================= 规则库：电解质材料 ================= */
  const ELECTROLYTE_LIB = {
    key: "electrolyte",
    short: "电解质材料",
    database: "电解质材料数据库",
    standardName: "电解质材料数据库标准",
    standardizationName: "电解质材料数据标准化",
    target: "10,250",
    cover: "计算数据标准化、数据格式标准化、数据单位标准化、数据图表标准化以及标准化数据表单整理",
    source: "Gaussian16 / VASP / Multiwfn / VASPKIT",
    lead: "根据不同数据库的实际需求，按照计算方法标准化、计算软件标准化、计算平台标准化、数据格式标准化、单位标准化、专属名词标准化、图片标准化和表格标准化需求，建立标准化数据表单。数据库按材料种类划分为有机电解液数据集、固态有机电解质数据集与固态无机电解质数据集，各子数据集分别建立标准化数据表单。",
    workflow: [
      { title: "子数据集划分", text: "按有机小分子、有机高分子、无机晶体三类电解质材料，划分有机电解液数据集、固态有机电解质数据集与固态无机电解质数据集。" },
      { title: "计算方法与软件统一", text: "统一 DFT 方法、泛函基组、溶剂化模型、电荷拟合流程，并统一建模、计算、后处理与可视化软件。" },
      { title: "格式与图表规范", text: "结构文件 pdb / cif，文本数据统一，图谱 jpg；表格三线表，字体与图片规格统一。" },
      { title: "单位与表单整理", text: "建立三个子数据集的标准单位表单，并整理为对应的标准化数据表单。" }
    ],
    systemStandards: [
      { name: "电解质材料摘要规范", brief: "针对不同种类电解质搭建数据采集中心，各中心采集项目不尽相同。", points: [
        "有机小分子：三维结构、熔点、沸点、比热容、热导率、电导率、介电常数、红外光谱、拉曼光谱、核磁共振谱、毒理学数据",
        "有机小分子计算数据：HOMO、LUMO、电荷分布、溶剂化能",
        "有机高分子：单体信息、摩尔体积、密度、玻璃化转变温度、电导率、摩尔热容；计算数据：结合能",
        "固态无机晶体：密度、X 射线衍射谱、X 射线吸收谱；计算数据：态密度、能带"
      ] },
      { name: "电解质材料选择标准", brief: "三级选择：种类 → 分子结构/官能团/晶体结构 → 基础信息/物性/计算数据。", points: [
        "将数据库划分为有机液态电解液数据集、固态有机电解质数据集、固态无机电解质数据集",
        "有机液态电解液按主体结构分醚类、酯类、环状及其他；整体数据分基础信息、物性数据、表征图谱、安全信息、计算数据五大模块",
        "固态有机电解质按官能团分醚类、酮类、腈类及其他；数据分基础信息、物性数据、计算数据三大模块",
        "固态无机电解质按晶体结构分氧化物型（钙钛矿、石榴石、NASICON、反钙钛矿）、硫化物型、卤化物型及其他；数据分基础信息、计算数据、图谱数据",
        "各大模块建立相应的标准化表单，确保数据的标准化"
      ] },
      { name: "电解质材料计算条件标准", brief: "规范计算模型、计算算法与计算软件。", points: [
        "建模软件：ChemOffice（ChemDraw/Chem3D/ChemFinder）、GaussView、Materials Studio；固态无机可用 Materials Studio、Diamond、CrystalMaker、Medea、VESTA",
        "模型保存格式：pdb、xyz、cif、mol（固态无机为 pxyz、cif、POSCAR）",
        "所有计算数据均采用密度泛函理论（DFT）进行第一性原理计算",
        "计算软件：Gaussian16、VASP、Q-Chem、Molpro 等"
      ] },
      { name: "电解质材料数据质量衡量标准", brief: "衡量模型文件、图像、计算方法与物性参数质量。", points: [
        "模型文件：格式为数据库支持的 pdb、xyz、cif、mol；结构与已有实验数据、权威数据库比对",
        "图像质量：清晰，分辨率 300 dpi，大小 200 KB ~ 1 MB，格式 jpg、png、tiff",
        "计算方法：与已发表的国内外文献和实验数据交叉比对",
        "物性参数：与已发表文献、权威数据库、其他商业机构或化工材料厂商交叉比对"
      ] },
      { name: "电解质材料筛选标准", brief: "分子数据集 → 固态有机 → 固态无机的分层筛选视角。", points: [
        "有机电解液：按熔点、沸点筛选高安全性电解液；按溶剂化能筛选合适溶剂；按 HOMO、LUMO 筛选高稳定化学窗口材料",
        "固态有机电解质：按玻璃化转变温度筛选不同温度区间材料；按电导率筛选高绝缘电解质；按抗拉性能筛选机械强度大的材料；按结合能筛选与锂原子强相互作用的材料",
        "固态无机电解质：按带隙筛选高绝缘介质的无机陶瓷"
      ] },
      { name: "电解质材料环境标准", brief: "收录材料须满足国家与团体环境及性能标准。", points: [
        "HJ 2534-2013《环境标志产品技术要求 电池》",
        "《固态锂电池用固态电解质性能要求及测试方法 无机氧化物固态电解质》",
        "《固态锂电池用固态电解质性能要求及测试方法 聚合物及复合固态电解质》"
      ] }
    ],
    categories: [
      {
        key: "calc", label: "计算数据标准化",
        intro: "按计算方法标准化、计算软件标准化、计算平台标准化三部分统一规范，覆盖有机电解液、固态有机与固态无机三个子数据集的计算数据。",
        sections: [
          { title: "① 计算方法标准化", rules: [
            r("ele-calc-m", "理论方法", "theory", "密度泛函理论（DFT）", "字符", "优化结构、HOMO、LUMO、吉布斯自由能、溶剂化能满足度泛函理论方法获得。"),
            r("ele-calc-m", "自洽判据", "scf_criteria", "能量变化 < 1e-5 eV", "数字+单位", "当能量变化小于 1e-5 eV 时认为自洽。"),
            r("ele-calc-m", "结构优化收敛", "force_criteria", "残余力 < 1e-2 eV/Å", "数字+单位", "残余力小于 1e-2 eV/Å 时认为结构优化收敛。"),
            r("ele-calc-m", "泛函与色散", "functional", "B3LYP + DFT-D3 色散校正", "字符", "理论方法选用 B3LYP，同时考虑 DFT-D3 色散校正。"),
            r("ele-calc-m", "基组（前三周期）", "basis_light", "6-311G**", "字符", "对前三周期元素基组选用 6-311G**。"),
            r("ele-calc-m", "基组（第四周期及之后）", "basis_heavy", "SDD 赝势及其标配赝势基组", "字符", "体系中含有第四周期及之后原子时使用 SDD 赝势。"),
            r("ele-calc-m", "静电势计算", "esp", "B3LYP；前三周期 6-311G**；过渡金属 SDD；Br、I 等主族元素 lanl08(d)", "字符", "静电势计算泛函与基组规定。"),
            r("ele-calc-m", "溶剂化模型", "solvation", "隐式溶剂模型（可极化连续介质）", "字符", "溶剂环境简单当作可极化的连续介质考虑。"),
            r("ele-calc-m", "电荷分布", "charge_model", "RESP 电荷（拟合后）", "字符", "给出拟合之后的 Restrained ElectroStatic Potential 电荷，便于用户用于柔性小分子的分子模拟。"),
            r("ele-calc-m", "电荷拟合第一步", "resp_step1", "双曲惩罚函数弱限制 a = 0.0005，不约束原子等价性", "字符", "允许原子电荷变化有最大自由度，充分让极性原子拟合静电势。"),
            r("ele-calc-m", "电荷拟合第二步", "resp_step2", "双曲惩罚函数强限制 a = 0.001，仅拟合 sp3 碳、亚甲基碳及其氢，约束 -CH3/=CH2/-CH2- 氢等价", "字符", "其余原子电荷保持上一步状态。"),
            r("ele-calc-m", "固态有机结合能", "binding_energy", "Ebind = E(ad/sub) − E(ad) − E(sub)", "字符", "所涉及能量均由第一性原理计算所得。"),
            r("ele-calc-m", "固态无机 DOS", "dos", "TDOS + PDOS（按 s/p/d/f 分辨）", "字符", "态密度包括总态密度与分波态密度。"),
            r("ele-calc-m", "强关联体系", "dft_u", "DFT+U（Hubbard 模型）", "字符", "含 d、f 轨道电子强关联体系采用 DFT+U 求解。"),
            r("ele-calc-m", "U 值确定", "u_value", "权威数据库/实验/文献交叉比对，否则用 Cococcioni 线性响应法", "字符", "通过施加 LDAUU/LDAUJ 并计算 d/f 轨道占据数一阶偏导得到 U 值。"),
            r("ele-calc-m", "能带 K 点路径", "kpath", "在不可约布里渊区边界选取 K-path", "字符", "三维晶体 24 种对称性不同布里渊区，二维材料分 4 种。")
          ] },
          { title: "② 计算软件标准化", rules: [
            r("ele-calc-s", "有机小分子建模", "software_model_organic", "GaussView 6.0", "字符", "有机电解液数据集有机小分子模型文件由 GaussView 6.0 可视化软件建模获得。"),
            r("ele-calc-s", "有机电解液计算", "software_calc_liquid", "Gaussian16", "字符", "最优化结构、HOMO、LUMO、吉布斯自由能、溶剂化能由 Gaussian16 计算包计算获得。"),
            r("ele-calc-s", "RESP 电荷拟合", "software_resp", "Multiwfn", "字符", "有机分子的 RESP 电荷由 Multiwfn 拟合获得。"),
            r("ele-calc-s", "结构图片可视化", "software_visual", "GaussView 6.0 与 VMD", "字符", "模型结构图片由 GaussView 6.0 与 VMD 可视化软件获得。"),
            r("ele-calc-s", "固态有机电解质计算", "software_calc_solid_organic", "Gaussian16", "字符", "固态有机电解质数据集结合能由 Gaussian16 计算包计算获得。"),
            r("ele-calc-s", "固态无机晶体来源", "source_crystal", "Materials Project、ICSD 等权威晶体学数据库", "字符", "晶体结构模型从权威晶体学数据库获得。"),
            r("ele-calc-s", "固态无机计算", "software_calc_inorganic", "VASP", "字符", "态密度与能带由 Vienna Ab-initio Simulation Package 计算获得。"),
            r("ele-calc-s", "K 点路径与 DOS/能带后处理", "software_post", "VASPKIT", "字符", "K 点路径与态密度、能带数据由 VASPKIT 工具获得。"),
            r("ele-calc-s", "无机结构图片", "software_visual_inorganic", "VESTA", "字符", "晶体模型结构图片由 VESTA 可视化软件获得。")
          ] },
          { title: "③ 计算平台标准化", rules: [
            r("ele-calc-p", "计算平台", "platform", "天河二号超级计算机系统", "字符", "所有计算将依托天河二号超级计算机系统平台计算获得。"),
            r("ele-calc-p", "CPU 型号", "cpu_model", "Intel Xeon E5-2692 v2", "字符", "CPU 型号暂定为 Intel Xeon E5-2692 v2。")
          ] }
        ]
      },
      {
        key: "format", label: "数据格式标准化",
        intro: "按三个子数据集分别规定结构文件、文本数据与图谱数据的格式。",
        sections: [{ title: "", rules: [
          r("ele-fmt", "有机电解液结构文件", "format_liquid_struct", "pdb", "文件", "有机小分子结构文件以 pdb 的格式提供。"),
          r("ele-fmt", "有机电解液文本数据", "format_liquid_text", "文本格式", "文本", "基本信息、物性数据、安全信息与计算数据以文本格式提供。"),
          r("ele-fmt", "有机电解液图谱", "format_liquid_image", "jpg", "文件", "表征图谱以 jpg 的格式提供。"),
          r("ele-fmt", "固态有机结构文件", "format_solid_organic_struct", "pdb", "文件", "固态有机电解质数据集中有机分子结构以 pdb 的格式提供。"),
          r("ele-fmt", "固态有机文本数据", "format_solid_organic_text", "文本格式", "文本", "基本信息、物性数据与计算数据以文本格式提供。"),
          r("ele-fmt", "固态无机结构文件", "format_inorganic_struct", "cif", "文件", "固态无机电解质数据集中无机晶体结构以 cif 的格式提供。"),
          r("ele-fmt", "固态无机文本数据", "format_inorganic_text", "文本格式", "文本", "基础信息和计算数据以文本格式提供。"),
          r("ele-fmt", "固态无机图谱数据", "format_inorganic_image", "jpg", "文件", "图谱数据以 jpg 的格式提供。")
        ] }]
      },
      {
        key: "chart", label: "数据图表标准化",
        intro: "表格样式、字体与图片规格统一要求。",
        sections: [{ title: "", rules: [
          r("ele-chart", "表格样式", "table_style", "三线表", "枚举", "表格要求为三线表格。"),
          r("ele-chart", "英文字体", "font_en", "Arial", "字符", "英文标注都使用 Arial 字体。"),
          r("ele-chart", "中文字体", "font_cn", "宋体（正文）、黑体（标题）", "字符", "中文标注使用宋体或黑体，宋体用于正文、黑体用于标题。"),
          r("ele-chart", "图片格式", "image_format", "jpg", "文件", "图片的格式要求为 jpg 格式。"),
          r("ele-chart", "图片分辨率", "image_dpi", "300 dpi", "数字+单位", "图片分辨率要求为 300 dpi。"),
          r("ele-chart", "颜色模式", "color_mode", "RGB", "字符", "图片颜色模式要求为 RGB 格式。"),
          r("ele-chart", "图片尺寸", "image_width", "≤ 7.5 cm", "数字+单位", "图片大小控制在 7.5 cm 以内。")
        ] }]
      },
      {
        key: "unit", label: "数据单位标准化",
        intro: "为便于比较材料性能，按子数据集建立标准单位表单。",
        sections: [{ title: "", rules: [
          r("ele-unit", "有机电解液标准单位表单", "unit_form_liquid", "已建立", "表单", "①有机电解液数据集标准单位表单。"),
          r("ele-unit", "固态有机电解质标准单位表单", "unit_form_solid_organic", "已建立", "表单", "②固态有机电解质数据集标准单位表单。"),
          r("ele-unit", "固态无机电解质标准单位表单", "unit_form_inorganic", "已建立", "表单", "③固态无机电解质数据集标准单位表单。"),
          r("ele-unit", "能量单位", "energy_unit", "eV", "单位", "结合能、HOMO/LUMO 能级、带隙等。"),
          r("ele-unit", "电导率单位", "conductivity_unit", "S/cm（或 S/m，需注明）", "单位", "离子电导率、电子电导率统一单位。"),
          r("ele-unit", "温度单位", "temperature_unit", "K（或 °C，需注明）", "单位", "熔点、沸点、玻璃化转变温度等统一并保留换算记录。")
        ] }]
      },
      {
        key: "form", label: "标准化数据表单整理",
        intro: "根据不同子数据集建立不同的标准化数据表单。",
        sections: [{ title: "", rules: [
          r("ele-form", "有机电解液数据集标准化数据表单", "form_liquid", "已建立（基础信息 / 物性数据 / 表征图谱 / 安全信息 / 计算数据 五大模块）", "表单", "有机液态电解液按主体结构分醚类、酯类、环状及其他小数据集。"),
          r("ele-form", "固态有机电解质数据集标准化数据表单", "form_solid_organic", "已建立（基础信息 / 物性数据 / 计算数据 三大模块）", "表单", "按单体官能团分醚类、酮类、腈类及其他。"),
          r("ele-form", "固态无机电解质数据集标准化数据表单", "form_inorganic", "已建立（基础信息 / 计算数据 / 图谱数据 三大模块）", "表单", "按晶体结构分氧化物型、硫化物型、卤化物型及其他。")
        ] }]
      }
    ],
    formSpec: [
      "结构文件：有机电解液 pdb；固态有机 pdb；固态无机 cif",
      "文本数据：基本信息、物性数据、安全信息与计算数据以文本格式提供",
      "图谱数据：jpg 格式，300 dpi，RGB，≤7.5 cm",
      "表格：三线表；英文 Arial，中文宋体（正文）/黑体（标题）",
      "标准单位表单：有机电解液、固态有机电解质、固态无机电解质各一套"
    ],
    nonstandard: [
      { id: "ele-ns-01", material: "LiPF6-EC/DMC", field: "functional", current: "PBE0", target: "B3LYP + DFT-D3", reason: "泛函与色散校正不符", status: "待处理" },
      { id: "ele-ns-02", material: "Li6PS5Cl", field: "format_inorganic_struct", current: "pdb", target: "cif", reason: "固态无机晶体结构格式应为 cif", status: "待处理" },
      { id: "ele-ns-03", material: "PEO-LiTFSI", field: "scf_criteria", current: "1e-4 eV", target: "< 1e-5 eV", reason: "自洽判据未达标准", status: "待处理" },
      { id: "ele-ns-04", material: "PVDF-HFP", field: "image_dpi", current: "150 dpi", target: "300 dpi", reason: "图片分辨率低于标准", status: "待处理" },
      { id: "ele-ns-05", material: "LLZO-石榴石型", field: "kpath", current: "自定义路径", target: "不可约布里渊区边界 K-path", reason: "K 点路径不符合标准", status: "待处理" },
      { id: "ele-ns-06", material: "LiTFSI-DOL", field: "charge_model", current: "Mulliken", target: "RESP 电荷", reason: "电荷分布类型不符", status: "待处理" }
    ],
    ingestHint: "采集加工处理时按三个子数据集分别调用对应标准化数据表单：有机电解液五大模块、固态有机三大模块、固态无机三大模块。"
  };

  /* ================= 规则库：机器学习力场 ================= */
  const MLFF_LIB = {
    key: "mlff",
    short: "机器学习力场",
    database: "机器学习力场数据库",
    standardName: "机器学习力场数据库标准",
    standardizationName: "机器学习力场数据标准化",
    target: "25,200",
    cover: "计算方法标准化、数据格式标准化、数据单位标准化、图表标准化",
    source: "OPENMM / I-PI / Gromacs / VASP / Q-Chem / Molpro / REANN / DP-Gen / DeepMDKit",
    lead: "通过采样、计算以及测试获取数据，并按照统一的规则整理收集；在记录中注明采样条件（温度、分子模拟时间长度、分子体系大小等）与机器学习拟合测试集的误差数值，供用户参考；负责人审核考察相关数据；数据统一单位并注明单位换算情况；数据整理并录入表格记录入库。",
    workflow: [
      { title: "采样 / 计算 / 测试", text: "通过分子动力学采样、性质计算与机器学习拟合测试获取数据，并按统一规则整理收集。" },
      { title: "记录采样与误差信息", text: "注明采样条件（温度、分子模拟时间长度、分子体系大小等）与机器学习拟合测试集的误差数值，提供给用户参考。" },
      { title: "负责人审核", text: "负责人审核、考察相关数据。" },
      { title: "统一单位", text: "数据统一单位，并注明单位换算情况。" },
      { title: "整理入库", text: "数据整理并录入表格记录入库。" }
    ],
    systemStandards: [
      { name: "机器学习力场摘要规范", brief: "以多维数组方式构建，含结构信息与力场参数信息。", points: [
        "为机器学习提供训练集的输入信息和测试集的标准信息",
        "以多维数组的方式构建机器学习力场数据库",
        "数据类型：分子体系的三维坐标代表的结构信息；分子体系中各类原子在力场构建中的参数信息"
      ] },
      { name: "机器学习力场选择标准", brief: "体系选择 + 分子体系性质选择两方面。", points: [
        "按体系大小划分为大分子体系与小分子体系，不同大小体系使用不同精度的电子结构计算方法",
        "按力场能量组成（静电相互作用能、极化相互作用能、色散能、短程相互作用能）所涉及的参数作为分子性质",
        "性质分单分子性质、双分子性质、多分子性质",
        "单分子性质：单分子的能量和原子性质；原子性质只与原子种类相关",
        "双分子与多分子性质：分子键的相互作用能、体系中分子单体的能量、体系总能量，与相对位置（三维坐标）相关"
      ] },
      { name: "机器学习力场计算条件标准", brief: "按体系大小提前规划算力与计算精度。", points: [
        "先对分子体系大小进行划分，并规范不同等级大小体系应采取的计算精度",
        "小分子体系采取高精度计算，同时为大分子体系选择更高效的计算方法",
        "以达到计算成本合理分配的目的"
      ] },
      { name: "机器学习力场数据质量衡量标准", brief: "数据形式为数组，精度由计算方法和体系大小决定。", points: [
        "单个能量值为长度为一的数组（标量），如能量、电荷",
        "单个原子坐标为三维数组，多分子坐标为矩阵",
        "数据精度分采样得到的结构精度与第一性原理计算得到的分子性质精度"
      ] },
      { name: "机器学习力场训练集数据筛选标准", brief: "按温度与体系大小进行采样筛选。", points: [
        "进行结构采样时按照不同的温度进行采样筛选",
        "按照不同体系大小进行采样筛选"
      ] },
      { name: "机器学习力场模型准备完成标准", brief: "训练集构型可得到参数并通过精度测试。", points: [
        "可通过训练数据库中的训练集构型得到分子性能参数",
        "通过相应的测试结果达到精度要求，即视为完成数据库中一个特定分子体系的数据准备"
      ] }
    ],
    categories: [
      {
        key: "calc", label: "计算方法标准化",
        intro: "对不同类型的分子体系分别进行采样计算、分子性质计算以及机器学习训练和测试，规范计算软件与计算精度。",
        sections: [
          { title: "① 计算软件选择标准化", rules: [
            r("mlff-calc-s", "采样计算方式", "sampling_method", "分子动力学模拟采样分子构型，得到原子坐标信息", "字符", "采样计算通过分子动力学模拟对分子构型进行采样。"),
            r("mlff-calc-s", "采样计算软件", "software_sampling", "OPENMM、I-PI、Gromacs、VASP", "字符", "采样计算软件标准化清单。"),
            r("mlff-calc-s", "分子性质计算方式", "property_method", "利用采样得到的分子体系构型进行性质计算", "字符", "分子性质计算流程。"),
            r("mlff-calc-s", "分子性质计算软件", "software_property", "Q-Chem、Molpro", "字符", "分子性质计算软件标准化清单。"),
            r("mlff-calc-s", "机器学习拟合方式", "ml_method", "根据体系的性质选择合适的机器学习神经网络进行分子性质拟合", "字符", "机器学习拟合流程。"),
            r("mlff-calc-s", "机器学习拟合软件", "software_ml", "REANN、DP-Gen、DeepMDKit", "字符", "机器学习拟合软件标准化清单。")
          ] },
          { title: "② 计算精度标准化", rules: [
            r("mlff-calc-p", "小分子体系精度", "precision_small", "高精度计算方法（耦合簇计算方法、MP2 计算方法）", "字符", "对小分子体系如水、甲烷等采用高精度计算方法。"),
            r("mlff-calc-p", "大分子体系精度", "precision_large", "密度泛函方法（计算速度更快）", "字符", "对于大分子体系如蛋白质，采用计算速度更快的密度泛函方法。"),
            r("mlff-calc-p", "精度记录", "precision_record", "记录拟合测试集误差数值", "字符", "机器学习拟合测试集的误差数值信息提供给用户参考。")
          ] }
        ]
      },
      {
        key: "format", label: "数据格式标准化",
        intro: "结构数据以 PDB 格式提供，分子性质信息写入注释行。",
        sections: [{ title: "", rules: [
          r("mlff-fmt", "结构数据格式", "structure_format", "PDB（每个构象一个文件）", "文件", "结构数据以 PDB 格式提供，每个构象一个文件。"),
          r("mlff-fmt", "分子性质信息位置", "property_location", "注释行（REMARK 注释）", "字符", "每个分子体系的分子性质信息包含在注释行中。"),
          r("mlff-fmt", "位置单位", "position_unit", "埃（Å）", "单位", "位置以埃为单位。"),
          r("mlff-fmt", "能量单位", "energy_unit", "kcal/mol", "单位", "能量以 kcal/mol 为单位。"),
          r("mlff-fmt", "采样条件记录", "sampling_meta", "温度、分子模拟时间长度、分子体系大小", "字符", "在记录中注明采样条件。")
        ] }]
      },
      {
        key: "chart", label: "图表标准化",
        intro: "表格样式、字体与图片规格统一要求。",
        sections: [{ title: "", rules: [
          r("mlff-chart", "表格样式", "table_style", "三线表", "枚举", "表格要求为三线表格。"),
          r("mlff-chart", "英文字体", "font_en", "Arial", "字符", "英文标注都使用 Arial 字体。"),
          r("mlff-chart", "中文字体", "font_cn", "宋体（正文）、黑体（标题）", "字符", "中文标注使用宋体或黑体，宋体用于正文、黑体用于标题。"),
          r("mlff-chart", "图片格式", "image_format", "jpg", "文件", "图片的格式要求为 jpg 格式。"),
          r("mlff-chart", "图片分辨率", "image_dpi", "300 dpi", "数字+单位", "图片分辨率要求为 300 dpi。"),
          r("mlff-chart", "颜色模式", "color_mode", "RGB", "字符", "图片颜色模式要求为 RGB。"),
          r("mlff-chart", "图片尺寸", "image_width", "≤ 7.5 cm", "数字+单位", "图片大小控制在 7.5 cm 以内。")
        ] }]
      },
      {
        key: "unit", label: "数据单位标准化",
        intro: "统一单位并注明单位换算情况。",
        sections: [{ title: "", rules: [
          r("mlff-unit", "单位统一原则", "unit_normalize", "统一单位并注明单位换算情况", "单位", "数据整理时统一单位并注明换算情况。"),
          r("mlff-unit", "位置", "position_unit", "Å", "单位", "原子坐标单位。"),
          r("mlff-unit", "能量", "energy_unit", "kcal/mol", "单位", "能量、势能单位。"),
          r("mlff-unit", "力", "force_unit", "eV/Å 或 kcal/(mol·Å)", "单位", "原子受力单位，需注明换算关系。"),
          r("mlff-unit", "温度", "temperature_unit", "K", "单位", "采样温度单位。"),
          r("mlff-unit", "标准单位表", "unit_table", "机器学习力场数据库标准单位", "表单", "机器学习力场数据库标准单位表。")
        ] }]
      }
    ],
    formSpec: [
      "结构数据：PDB 格式，每个构象一个文件",
      "分子性质：写入 PDB 注释行",
      "位置单位：Å；能量单位：kcal/mol",
      "表格：三线表；英文 Arial，中文宋体（正文）/黑体（标题）",
      "图片：jpg，300 dpi，RGB，≤7.5 cm"
    ],
    nonstandard: [
      { id: "mlff-ns-01", material: "SiO2-轨迹集", field: "structure_format", current: "xyz", target: "PDB", reason: "结构数据格式应为 PDB，每构象一个文件", status: "待处理" },
      { id: "mlff-ns-02", material: "H2O-小分子", field: "precision_small", current: "DFT", target: "耦合簇 / MP2", reason: "小分子体系应采用高精度方法", status: "待处理" },
      { id: "mlff-ns-03", material: "丙氨酸二肽", field: "position_unit", current: "nm", target: "Å", reason: "位置单位需换算", status: "待处理" },
      { id: "mlff-ns-04", material: "蛋白质-大分子", field: "sampling_meta", current: "缺少模拟时长", target: "注明温度/时长/体系大小", reason: "采样条件记录不完整", status: "待处理" },
      { id: "mlff-ns-05", material: "ZnO-体系", field: "image_dpi", current: "120 dpi", target: "300 dpi", reason: "图片分辨率低于标准", status: "待处理" },
      { id: "mlff-ns-06", material: "CH4-体系", field: "energy_unit", current: "eV", target: "kcal/mol", reason: "能量单位不符合标准", status: "待处理" }
    ],
    ingestHint: "采集加工处理时须一并采集采样条件（温度、模拟时长、体系大小）与拟合测试集误差，用于标准化校验与质量标注。"
  };

  /* ================= 规则库：催化材料 ================= */
  const CATALYST_LIB = {
    key: "catalyst",
    short: "催化材料",
    database: "催化材料数据库",
    standardName: "催化材料数据库标准",
    standardizationName: "催化材料数据标准化",
    target: "34,920",
    cover: "计算方法标准化、数据格式标准化、数据表格标准化、数据图片标准化、数据单位标准化",
    source: "VASP / LAMMPS / Gaussian",
    lead: "针对催化数据库，根据不同催化材料的元素特征、结构特征、体系特征得出该催化材料的催化性能相关数据。催化材料种类按非铜元素字母表顺序排序，再按非铜元素晶胞原子数目由小到大排序，表面按（100）、（110）、（210）、（411）顺序排序；催化反应按中间产物 -H、-CO、-CHO、-COH、-COOH、-CH2OH 顺序排序；涉及单位采用国际单位制和学界常用单位混合的方式。",
    workflow: [
      { title: "材料排序", text: "按非铜元素字母表顺序 → 非铜元素晶胞原子数目由小到大 → 表面（100）、（110）、（210）、（411）顺序排序。" },
      { title: "反应排序", text: "催化反应按中间产物 -H、-CO、-CHO、-COH、-COOH、-CH2OH 顺序排序。" },
      { title: "特征到性能", text: "由元素特征、结构特征、体系特征得出催化性能相关数据（反应路径、催化产物、催化性能）。" },
      { title: "单位体系", text: "涉及单位采用国际单位制和学界常用单位混合的方式。" }
    ],
    systemStandards: [
      { name: "催化材料摘要规范", brief: "以 UML 图表方式构建，覆盖基础信息、元素特征、结构特征与体系特征。", points: [
        "基础信息：中英文名称、化学式",
        "元素特征：周期数和族数、元素电荷、相对原子质量、原子半径、价电子数、金属 d 轨道电子数、非金属 p 轨道电子数、第一电离能、电子亲合势、电负性、d 带中心",
        "结构特征：形貌结构图、点群和空间群、活性位点配位数、对称性函数",
        "体系特征：费米面位置、掺杂形成能、体系磁矩",
        "进一步计算催化反应路径、催化产物及催化性能"
      ] },
      { name: "催化材料选择标准", brief: "聚焦 CO2 还原相关的铜基三类催化材料。", points: [
        "依托铜的 5 种常见表面 Cu(100)、Cu(110)、Cu(111)、Cu(210)、Cu(411)",
        "金属铜基质不同表面上的单原子催化剂",
        "引入第二种金属元素后的二元合金催化剂",
        "不同晶粒取向的分界面（晶界）处的催化性能"
      ] },
      { name: "催化材料计算条件标准", brief: "规范计算软件与具体参数选择。", points: [
        "VASP（第一性原理）、LAMMPS（分子动力学）、Gaussian（量子化学综合）",
        "采用 PAW_PBE 赝势；截断能 400 eV",
        "能量收敛精度 1×10⁻⁴ eV；力的收敛精度 0.05 eV/Å",
        "倒空间 K 点撒点密度 0.3 Å⁻¹；真空层厚度约 15 Å"
      ] },
      { name: "催化材料数据质量衡量标准", brief: "有效位数、模型文件质量与实验交叉验证。", points: [
        "计算前收集的特征数据有效位数、计算结果有效位数、模型文件的质量",
        "数据有效位数取到小数点后 2-3 位，如吸附能取小数点后 3 位",
        "少数已实验研究的催化材料，将计算结果与实验数据对比评估有效性",
        "可与实验相互印证，如 CuZn 纳米颗粒相较纯铜具有更高 CH4 法拉第效率"
      ] },
      { name: "催化材料筛选标准", brief: "面向 CO2 还原的铜基材料筛选维度。", points: [
        "环境稳定性：决定催化材料能否长时间保存",
        "使用寿命：决定能否长时间稳定工作",
        "反应路径：决定是否可以产生具有经济效益的催化产物",
        "反应速率：反映催化材料的实际工作性能"
      ] }
    ],
    categories: [
      {
        key: "calc", label: "计算方法标准化",
        intro: "综合考量计算精度及效率后，催化材料数据库统一采用 VASP 计算并规范全部关键参数。",
        sections: [{ title: "", rules: [
          r("cat-calc", "计算软件", "calc_software", "VASP", "字符", "综合考虑计算的精度及效率后选择 VASP 软件。"),
          r("cat-calc", "赝势", "pseudopotential", "PAW_PBE", "字符", "采用 PAW_PBE 赝势对催化材料进行计算。"),
          r("cat-calc", "截断能", "encut", "400 eV", "数字+单位", "取截断能为 400 eV。"),
          r("cat-calc", "能量收敛精度", "energy_conv", "1×10⁻⁴ eV", "数字+单位", "能量收敛精度为 1×10-4 eV。"),
          r("cat-calc", "力的收敛精度", "force_conv", "0.05 eV/Å", "数字+单位", "力的收敛精度为 0.05 eV/Å。"),
          r("cat-calc", "K 点撒点密度", "kpoint_density", "0.3 Å⁻¹", "数字+单位", "倒空间中 K 点的撒点密度为 0.3 Å-1。"),
          r("cat-calc", "真空层厚度", "vacuum", "约 15 Å", "数字+单位", "真空层厚度约 15 Å。"),
          r("cat-calc", "材料排序规则", "material_order", "非铜元素字母表顺序 → 晶胞原子数目由小到大 → 表面 (100)/(110)/(210)/(411)", "字符", "催化材料种类排序规则。"),
          r("cat-calc", "反应排序规则", "reaction_order", "-H、-CO、-CHO、-COH、-COOH、-CH2OH", "字符", "催化反应按中间产物顺序排序。")
        ] }]
      },
      {
        key: "format", label: "数据格式标准化",
        intro: "材料性质数据采用 VASP 软件的输出格式，计算细节以 .dat 保存并提供可视化接口。",
        sections: [{ title: "", rules: [
          r("cat-fmt", "材料性质数据格式", "property_file_format", "VASP 软件输出格式", "文件", "数据库中材料性质的数据格式将采用 VASP 软件的输出格式。"),
          r("cat-fmt", "计算细节格式", "detail_format", ".dat", "文件", "对于输出的计算细节将以 .dat 格式进行保存。"),
          r("cat-fmt", "可视化接口", "visual_interface", "提供数据可视化接口", "字符", "提供将这些数据可视化的接口。")
        ] }]
      },
      {
        key: "table", label: "数据表格标准化",
        intro: "展示材料性能的数据表格采用统一的表格格式与标准化单位。",
        sections: [{ title: "", rules: [
          r("cat-tab", "表格格式", "table_format", "统一表格格式", "字符", "对于数据库中展示材料性能的数据表格，将采用统一的表格格式。"),
          r("cat-tab", "单位标注", "table_unit", "标准化的单位", "单位", "表格中单位为标准化的单位。"),
          r("cat-tab", "单位制", "unit_system", "学术常用单位制", "枚举", "均采用学术常用单位制。")
        ] }]
      },
      {
        key: "image", label: "数据图片标准化",
        intro: "图片与结构模型格式统一。",
        sections: [{ title: "", rules: [
          r("cat-img", "图片格式", "image_format", "PNG", "文件", "数据库中的图片统一采用 PNG 格式图片。"),
          r("cat-img", "结构模型格式", "model_format", "VASP 默认 POSCAR 格式文件", "文件", "对于结构模型则采用 VASP 默认的 POSCAR 格式文件。"),
          r("cat-img", "图片分辨率", "image_dpi", "300 dpi", "数字+单位", "图谱质量衡量标准要求分辨率达到 300 dpi。")
        ] }]
      },
      {
        key: "unit", label: "数据单位标准化",
        intro: "涉及单位采用国际单位制和学界常用单位混合的方式。",
        sections: [{ title: "", rules: [
          r("cat-unit", "单位体系", "unit_system", "国际单位制 + 学界常用单位（混合）", "枚举", "催化材料数据库涉及的单位采用国际单位制和学界常用单位混合的方式。"),
          r("cat-unit", "能量 / 吸附能", "energy_unit", "eV（吸附能保留 3 位小数）", "单位", "吸附能有效位数为小数点后 3 位。"),
          r("cat-unit", "长度", "length_unit", "Å", "单位", "键长、吸附高度、真空层厚度等。"),
          r("cat-unit", "K 点密度", "kpoint_unit", "Å⁻¹", "单位", "倒空间 K 点撒点密度单位。"),
          r("cat-unit", "d 带中心", "d_band_center_unit", "eV", "单位", "元素特征中 d 带中心标准单位。")
        ] }]
      }
    ],
    formSpec: [
      "性质数据：VASP 输出格式；计算细节 .dat 并保留可视化接口",
      "结构模型：VASP 默认 POSCAR 格式文件",
      "图片：PNG 格式，300 dpi",
      "表格：统一表格格式，标准化单位，学术常用单位制",
      "单位体系：国际单位制与学界常用单位混合"
    ],
    nonstandard: [
      { id: "cat-ns-01", material: "Cu(111)-CO", field: "encut", current: "350 eV", target: "400 eV", reason: "截断能低于标准值", status: "待处理" },
      { id: "cat-ns-02", material: "AgCu-合金", field: "pseudopotential", current: "PAW_LDA", target: "PAW_PBE", reason: "赝势不符合标准", status: "待处理" },
      { id: "cat-ns-03", material: "Cu(210)-CHO", field: "energy_conv", current: "1e-3 eV", target: "1×10⁻⁴ eV", reason: "能量收敛精度不足", status: "待处理" },
      { id: "cat-ns-04", material: "ZnCu-单原子", field: "model_format", current: "cif", target: "POSCAR", reason: "结构模型格式应为 POSCAR", status: "待处理" },
      { id: "cat-ns-05", material: "Cu(411)-COOH", field: "kpoint_density", current: "0.15 Å⁻¹", target: "0.3 Å⁻¹", reason: "K 点撒点密度低于标准", status: "待处理" },
      { id: "cat-ns-06", material: "SnCu-合金", field: "image_format", current: "jpg", target: "PNG", reason: "图片格式不符", status: "待处理" }
    ],
    ingestHint: "采集加工处理时按材料排序规则（非铜元素字母顺序 → 晶胞原子数 → 表面取向）与反应中间产物顺序组织数据，并按 VASP 参数标准校验。"
  };

  const LOWDIM_STD_LIBRARY = {
    twod: TWOD_LIB,
    opto: OPTO_LIB,
    electrolyte: ELECTROLYTE_LIB,
    mlff: MLFF_LIB,
    catalyst: CATALYST_LIB
  };

  window.LOWDIM_STD_LIBRARY = LOWDIM_STD_LIBRARY;


  /* ===================== 基础取值 ===================== */
  function stdKey(pageId) {
    const key = String(pageId || "").split("-").pop();
    return LOWDIM_STD_LIBRARY[key] ? key : "twod";
  }
  function stdLib(pageId) {
    return LOWDIM_STD_LIBRARY[stdKey(pageId)];
  }
  function stdCategoryRules(category) {
    const out = [];
    (category.sections || []).forEach((section) => {
      (section.rules || []).forEach((rule) => out.push(rule));
    });
    return out;
  }
  function stdTotalRules(lib) {
    let total = 0;
    lib.categories.forEach((category) => { total += stdCategoryRules(category).length; });
    return total;
  }
  function stdState(pageId) {
    if (!state.lowdimStd) state.lowdimStd = {};
    if (!state.lowdimStd[pageId]) {
      const lib = stdLib(pageId);
      const rules = {};
      lib.categories.forEach((category) => {
        rules[category.key] = stdCategoryRules(category).map((rule) => Object.assign({}, rule));
      });
      state.lowdimStd[pageId] = {
        activeCategory: lib.categories[0].key,
        rules: rules,
        dirty: {},
        selected: [],
        scan: { running: false, progress: 0, complete: false, results: [] },
        affectedCount: 0
      };
    }
    return state.lowdimStd[pageId];
  }
  function stdCell(value, mode) {
    const text = esc(value || "-");
    const cls = mode === "wrap" ? "lstd-cell wrap" : (mode === "strong" ? "lstd-cell strong" : "lstd-cell");
    return '<span class="' + cls + '" title="' + text + '">' + text + "</span>";
  }

  /* ===================== 样式 ===================== */
  const LSTD_CSS = [
    /* —— 头部指标 chips —— */
    "__SCOPE__ .lstd-hero-chips { display:flex; flex-wrap:wrap; gap:9px; margin-top:13px; }",
    "__SCOPE__ .lstd-hero-chip { padding:5px 13px; border-radius:7px; background:#e9f0fe; color:#1d4ed8; font-size:12.5px; font-weight:600; }",
    /* —— 采集加工调用规则库 callout：内容居左、按钮居右 —— */
    "__SCOPE__ .lstd-callout { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; flex-wrap:wrap; margin-top:16px; padding:16px 20px; border:1px solid #cfe0fb; border-radius:10px; background:#f6f9ff; }",
    "__SCOPE__ .lstd-callout-main { min-width:0; flex:1 1 420px; }",
    "__SCOPE__ .lstd-callout-main strong { color:#0f2b6b; font-size:14px; }",
    "__SCOPE__ .lstd-callout-main p { margin:6px 0 0; color:#5b6b80; font-size:12.5px; line-height:20px; }",
    "__SCOPE__ .lstd-chips { display:flex; flex-wrap:wrap; gap:8px; margin-top:11px; }",
    "__SCOPE__ .lstd-chip { padding:4px 11px; border-radius:6px; background:#fff; border:1px solid #cfe0fb; color:#1d4ed8; font-size:11.5px; }",
    "__SCOPE__ .lstd-chip.green { border-color:#b9e8d3; color:#0d9b70; }",
    /* —— 总体工作流程：横向步骤 + 连接线 —— */
    "__SCOPE__ .lstd-flow-card { margin-top:16px; padding:16px 20px 20px; }",
    "__SCOPE__ .lstd-flow-head h3 { margin:0; color:#101f3c; font-size:15px; }",
    "__SCOPE__ .lstd-flow-head p { margin:7px 0 0; color:#7c8b9c; font-size:12.5px; line-height:21px; }",
    "__SCOPE__ .lstd-flow { position:relative; display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:16px; margin-top:18px; }",
    "__SCOPE__ .lstd-flow::before { content:\"\"; position:absolute; left:14px; right:14px; top:14px; height:2px; background:#d6e2fb; }",
    "__SCOPE__ .lstd-flow-step { position:relative; min-width:0; }",
    "__SCOPE__ .lstd-flow-step b { position:relative; z-index:1; display:inline-grid; place-items:center; width:28px; height:28px; border-radius:50%; background:#1f63ff; color:#fff; font-size:13px; box-shadow:0 0 0 4px #f3f6fb; }",
    "__SCOPE__ .lstd-flow-step h4 { display:inline-block; vertical-align:middle; margin:0 0 0 9px; color:#15294d; font-size:14px; }",
    "__SCOPE__ .lstd-flow-step p { margin:9px 0 0 38px; color:#6b7a90; font-size:12.5px; line-height:21px; }",
    /* —— 标准化类别：顶部横向 tab —— */
    "__SCOPE__ .lstd-tabs { display:flex; gap:30px; margin-top:24px; border-bottom:1px solid #e2e8f2; overflow-x:auto; }",
    "__SCOPE__ .lstd-tabs button { flex:none; padding:12px 2px 11px; border:0; border-bottom:2px solid transparent; background:transparent; color:#5f7189; font:inherit; font-size:14px; cursor:pointer; white-space:nowrap; }",
    "__SCOPE__ .lstd-tabs button:hover { color:#1f63ff; }",
    "__SCOPE__ .lstd-tabs button.active { color:#1f63ff; border-bottom-color:#1f63ff; font-weight:700; }",
    /* —— 规则卡片 —— */
    "__SCOPE__ .lstd-card { margin-top:0; border:1px solid #dbe3ee; border-radius:10px; background:#fff; }",
    "__SCOPE__ .lstd-head { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; padding:16px 20px; }",
    "__SCOPE__ .lstd-head-main { display:flex; align-items:center; gap:14px; flex-wrap:wrap; min-width:0; }",
    "__SCOPE__ .lstd-head h3 { margin:0; color:#101f3c; font-size:17px; }",
    "__SCOPE__ .lstd-formspec-link { display:inline-flex; align-items:center; gap:6px; padding:0; border:0; background:transparent; color:#1f63ff; font:inherit; font-size:12.5px; font-weight:600; cursor:pointer; }",
    "__SCOPE__ .lstd-formspec-link:hover { text-decoration:underline; }",
    "__SCOPE__ .lstd-actions { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }",
    "__SCOPE__ .lstd-intro { padding:0 20px 15px; color:#6b7a90; font-size:12.5px; line-height:20px; }",
    /* —— 规则表格 —— */
    "__SCOPE__ .lstd-table-wrap { overflow:auto; border-radius:0 0 10px 10px; }",
    "__SCOPE__ .lstd-table { width:100%; min-width:1020px; border-collapse:collapse; table-layout:fixed; }",
    "__SCOPE__ .lstd-table col.c-item { width:140px; }",
    "__SCOPE__ .lstd-table col.c-field { width:120px; }",
    "__SCOPE__ .lstd-table col.c-value { width:190px; }",
    "__SCOPE__ .lstd-table col.c-type { width:88px; }",
    "__SCOPE__ .lstd-table col.c-req { width:104px; }",
    "__SCOPE__ .lstd-table col.c-mod { width:112px; }",
    "__SCOPE__ .lstd-table col.c-op { width:104px; }",
    /* —— 来源条款 / 最近修改 / 版本条 —— */
    "__SCOPE__ .lstd-clause { display:inline-block; padding:2px 8px; border-radius:5px; background:#eef4ff; border:1px solid #d9e6ff; color:#1f63ff; font-size:11.5px; font-weight:700; white-space:nowrap; }",
    "__SCOPE__ .lstd-mod { display:flex; flex-direction:column; gap:2px; color:#6b7a90; font-size:11.5px; line-height:1.55; }",
    "__SCOPE__ .lstd-mod b { color:#334155; font-weight:700; }",
    "__SCOPE__ .lstd-version-bar { display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; margin:0 0 14px; padding:12px 16px; border:1px solid #cfe0fb; border-radius:10px; background:linear-gradient(180deg,#f8fbff,#f2f7ff); }",
    "__SCOPE__ .lstd-version-main { display:flex; align-items:center; gap:12px; flex-wrap:wrap; color:#6b7a90; font-size:12.5px; }",
    "__SCOPE__ .lstd-version-main strong { color:#12305c; font-size:14px; font-weight:800; }",
    "__SCOPE__ .lstd-version-tag { padding:3px 10px; border-radius:6px; background:#165DFF; color:#fff; font-size:12px; font-weight:800; }",
    "__SCOPE__ .lstd-version-acts { display:flex; gap:8px; flex-wrap:wrap; }",
    "__SCOPE__ .lstd-version-btn { min-height:32px; padding:0 13px; border:1px solid #cfdcee; border-radius:8px; background:#fff; color:#33456b; font-size:12.5px; font-weight:700; cursor:pointer; }",
    "__SCOPE__ .lstd-version-btn:hover { border-color:#165DFF; color:#165DFF; background:#f5f9ff; }",
    ".lstd-history-modal { width:min(720px,96vw); }",
    ".lstd-history-table { width:100%; border-collapse:collapse; font-size:13px; }",
    ".lstd-history-table th { padding:10px 12px; background:#f4f6fa; color:#55657c; font-size:12px; font-weight:700; text-align:left; white-space:nowrap; }",
    ".lstd-history-table td { padding:10px 12px; border-bottom:1px solid #eef2f7; color:#334155; vertical-align:top; }",
    ".lstd-history-table td.wrap { white-space:normal; line-height:1.7; }",
    ".lstd-hist-now { display:inline-block; padding:2px 9px; border-radius:999px; background:#eaf6ef; color:#1e7e45; font-size:11.5px; font-weight:700; }",
    ".lstd-hist-old { display:inline-block; padding:2px 9px; border-radius:999px; background:#f1f5fa; color:#6b7a90; font-size:11.5px; font-weight:700; }",
    "__SCOPE__ .lstd-table th { height:42px; padding:0 16px; border-bottom:1px solid #e8eef6; background:#f4f6fa; color:#55657c; font-size:12px; font-weight:700; text-align:left; white-space:nowrap; }",
    "__SCOPE__ .lstd-table td { padding:12px 16px; border-bottom:1px solid #eef2f7; color:#334155; font-size:12.5px; vertical-align:top; }",
    "__SCOPE__ .lstd-table tr:last-child td { border-bottom:0; }",
    "__SCOPE__ .lstd-table tr.lstd-section-row td { padding:9px 16px; background:#eaf2ff; color:#1f63ff; font-size:12px; font-weight:700; }",
    "__SCOPE__ .lstd-cell { display:block; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }",
    "__SCOPE__ .lstd-cell.wrap { white-space:normal; word-break:break-word; overflow:visible; text-overflow:clip; line-height:20px; }",
    "__SCOPE__ .lstd-cell.strong { color:#101f3c; font-weight:700; }",
    "__SCOPE__ .lstd-table th, __SCOPE__ .lstd-table td { overflow-wrap:break-word; }",
    "__SCOPE__ .lstd-rule-value { color:#101f3c; font-weight:700; }",
    "__SCOPE__ .lstd-row-actions { display:flex; gap:12px; }",
    "__SCOPE__ .lstd-row-actions button { min-height:0; padding:0; border:0; background:transparent; color:#1f63ff; font:inherit; font-size:12.5px; cursor:pointer; white-space:nowrap; }",
    "__SCOPE__ .lstd-row-actions button:hover { text-decoration:underline; }",
    "__SCOPE__ .lstd-row-actions button.danger { color:#e05656; }",
    /* —— 卡片底部：状态 + 取消/保存 —— */
    "__SCOPE__ .lstd-card-foot { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; padding:13px 20px; border-top:1px solid #e8eef6; }",
    "__SCOPE__ .lstd-foot-actions { display:flex; gap:10px; }",
    "__SCOPE__ .lstd-status { display:inline-flex; align-items:center; min-height:28px; padding:3px 12px; border-radius:999px; background:#e5f7ef; color:#0d9b70; font-size:12px; font-weight:700; }",
    "__SCOPE__ .lstd-status.dirty { background:#fef3e2; color:#d97706; }",
    /* —— 影响存量数据横幅 —— */
    "__SCOPE__ .lstd-affected { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-top:16px; padding:13px 18px; border:1px solid #f5d9a8; border-radius:10px; background:#fffaf0; }",
    "__SCOPE__ .lstd-affected span { color:#92400e; font-weight:700; font-size:12.5px; }",
    /* —— 进度条（保留给弹窗用） —— */
    "__SCOPE__ .lstd-progress { height:10px; border-radius:999px; background:#e6ebf3; overflow:hidden; }",
    "__SCOPE__ .lstd-progress span { display:block; height:100%; background:#1f63ff; transition:width .2s ease; }",
    "@media (max-width: 900px) { __SCOPE__ .lstd-flow::before { display:none; } __SCOPE__ .lstd-tabs { gap:18px; } }"
  ].join("\n          ");

  function lstdStyle(pageId) {
    const scope = "#page-" + pageId;
    return "<style>" + LSTD_CSS.split("__SCOPE__").join(scope) + "</style>";
  }

  /* ===================== 全局弹窗样式（弹窗挂在 body 下，不能用页面作用域） ===================== */
  const LSTD_GLOBAL_CSS = [
    /* !important：渲染期注入的 .modal { width:520px } 会同特异性后到先得，必须压过它 */
    ".overlay .modal.lstd-detect-modal { width:min(100%,900px) !important; }",
    ".overlay .modal.lstd-formspec-modal { width:min(100%,620px) !important; }",
    ".overlay .modal.lstd-save-modal { width:min(100%,440px) !important; }",
    ".overlay .modal.twod-standardization-rule-modal { width:min(100%,500px) !important; }",
    ".lstd-modal-head { display:flex; align-items:flex-start; justify-content:space-between; gap:14px; padding:18px 24px; border-bottom:1px solid #edf1f7; }",
    ".lstd-modal-head h3 { margin:0; color:#101f3c; font-size:16px; line-height:24px; }",
    ".lstd-modal-head h3 em { font-style:normal; color:#8593a8; font-size:12px; font-weight:400; }",
    ".lstd-modal-close { flex:none; border:0; background:transparent; color:#98a4b5; font-size:20px; line-height:1; cursor:pointer; padding:2px 4px; }",
    ".lstd-modal-close:hover { color:#475569; }",
    ".lstd-modal-body { padding:18px 24px; overflow:auto; }",
    ".lstd-modal-foot { display:flex; align-items:center; justify-content:flex-end; gap:10px; padding:14px 24px; border-top:1px solid #edf1f7; }",
    /* 新增/编辑标准规则弹窗：两列表单 */
    ".lstd-rule-form { display:grid; gap:16px; padding:4px 2px; }",
    ".lstd-rule-form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }",
    ".lstd-rule-form label { display:grid; gap:7px; }",
    ".lstd-rule-form label > span { color:#3a4a5f; font-size:13px; font-weight:700; }",
    ".lstd-rule-form input, .lstd-rule-form textarea { width:100%; box-sizing:border-box; padding:9px 12px; border:1px solid #d3dbe7; border-radius:6px; background:#fff; color:#1e293b; font:inherit; font-size:13px; }",
    ".lstd-rule-form input:focus, .lstd-rule-form textarea:focus { outline:none; border-color:#1f63ff; box-shadow:0 0 0 2px rgba(31,99,255,.12); }",
    ".lstd-rule-form textarea { resize:vertical; min-height:88px; }",
    /* 非标数据检测弹窗 */
    ".lstd-progress-row { display:flex; align-items:center; gap:12px; }",
    ".lstd-progress-row .lstd-progress { flex:1; height:10px; border-radius:999px; background:#e6ebf3; overflow:hidden; }",
    ".lstd-progress-row .lstd-progress span { display:block; height:100%; background:#1f63ff; transition:width .2s ease; }",
    ".lstd-progress-row.done .lstd-progress span { background:#16a34a; }",
    ".lstd-progress-num { min-width:42px; text-align:right; color:#16a34a; font-size:13px; font-weight:700; }",
    ".lstd-progress-row:not(.done) .lstd-progress-num { color:#1f63ff; }",
    ".lstd-detect-tip { margin:12px 0 16px; color:#6b7a90; font-size:13px; }",
    ".lstd-detect-table { width:100% !important; min-width:860px; border-collapse:collapse; table-layout:fixed; }",
    ".lstd-detect-table th { height:40px; padding:0 12px; background:#f4f6fa; border-bottom:1px solid #e8eef6; color:#55657c; font-size:12px; font-weight:700; text-align:left; white-space:nowrap; }",
    ".lstd-detect-table td { padding:11px 12px; border-bottom:1px solid #eef2f7; color:#334155; font-size:12.5px; word-break:break-word; vertical-align:top; }",
    ".lstd-detect-table tr:last-child td { border-bottom:0; }",
    ".lstd-pill { display:inline-flex; align-items:center; min-height:22px; padding:2px 10px; border-radius:999px; font-size:11.5px; font-weight:700; white-space:nowrap; }",
    ".lstd-pill.warn { background:#fef3e2; color:#d97706; }",
    ".lstd-pill.ok { background:#e5f7ef; color:#0d9b70; }",
    /* 标准化数据表单与规格要求弹窗 */
    ".lstd-formspec-list { display:grid; gap:12px; }",
    ".lstd-formspec-list div { display:flex; gap:10px; align-items:flex-start; padding:12px 14px; border-radius:8px; background:#f4f6fa; color:#3a4a5f; font-size:13px; line-height:21px; }",
    ".lstd-formspec-list b { flex:none; width:18px; height:18px; margin-top:2px; border-radius:50%; background:#16a34a; color:#fff; font-size:11px; display:grid; place-items:center; }",
    /* 标准保存确认弹窗 */
    ".lstd-save-text { margin:0; color:#3a4a5f; font-size:13.5px; line-height:23px; }"
  ].join("\n          ");

  function lstdGlobalStyle() {
    if (document.getElementById("lstdGlobalStyle")) return;
    const style = document.createElement("style");
    style.id = "lstdGlobalStyle";
    style.textContent = LSTD_GLOBAL_CSS;
    document.head.appendChild(style);
  }

  /* ===================== 动态弹窗：非标数据检测 / 规格要求 / 标准保存 ===================== */
  function lstdOpenModalEl(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add("show");
  }
  function lstdCloseModalEl(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove("show");
  }

  function ensureLstdModals() {
    lstdGlobalStyle();
    if (document.getElementById("lstdDetectModal")) return;
    const wrap = document.createElement("div");
    wrap.innerHTML =
      /* 非标数据检测 */
      '<div class="overlay" id="lstdDetectModal">' +
        '<div class="modal lstd-detect-modal">' +
          '<div class="lstd-modal-head"><h3>非标数据检测 <em>（按本库标准化规则逐条比对，列出不符合标准值的数据）</em></h3>' +
            '<button class="lstd-modal-close" type="button" data-close-modal="lstdDetectModal" aria-label="关闭非标数据检测">×</button></div>' +
          '<div class="lstd-modal-body" id="lstdDetectModalBody"></div>' +
          '<div class="lstd-modal-foot">' +
            '<button class="btn-primary" type="button" data-lstd-batch>批量标准化</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      /* 标准化数据表单与规格要求 */
      '<div class="overlay" id="lstdFormSpecModal">' +
        '<div class="modal lstd-formspec-modal">' +
          '<div class="lstd-modal-head"><h3>标准化数据表单与规格要求 <em>（标准化输出文件需同时满足以下规格）</em></h3>' +
            '<button class="lstd-modal-close" type="button" data-close-modal="lstdFormSpecModal" aria-label="关闭规格要求">×</button></div>' +
          '<div class="lstd-modal-body" id="lstdFormSpecModalBody"></div>' +
        '</div>' +
      '</div>' +
      /* 标准保存确认 */
      '<div class="overlay" id="lstdSaveModal">' +
        '<div class="modal lstd-save-modal">' +
          '<div class="lstd-modal-head"><h3>标准保存</h3>' +
            '<button class="lstd-modal-close" type="button" data-close-modal="lstdSaveModal" aria-label="关闭标准保存">×</button></div>' +
          '<div class="lstd-modal-body"><p class="lstd-save-text" id="lstdSaveModalText"></p></div>' +
          '<div class="lstd-modal-foot">' +
            '<button class="btn" type="button" data-close-modal="lstdSaveModal">取消</button>' +
            '<button class="btn-primary" type="button" data-close-modal="lstdSaveModal">确定</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);
  }

  function lstdStatusPill(status) {
    const ok = status === "已标准化";
    return '<span class="lstd-pill ' + (ok ? "ok" : "warn") + '">' + esc(status || "-") + "</span>";
  }

  function lstdRenderDetectBody(pageId) {
    const st = stdState(pageId);
    const scan = st.scan || { progress: 0 };
    const selected = new Set(st.selected || []);
    const pending = (scan.results || []).filter((item) => item.status !== "已标准化").length;
    const tip = scan.running
      ? "正在扫描数据库，请稍候…"
      : (scan.complete ? "扫描完成，发现 " + pending + " 条待处理非标数据。" : "正在准备扫描…");
    let html = '<div class="lstd-progress-row' + (scan.complete ? " done" : "") + '">' +
      '<div class="lstd-progress"><span style="width:' + (scan.progress || 0) + '%;"></span></div>' +
      '<span class="lstd-progress-num">' + (scan.progress || 0) + "%</span></div>" +
      '<p class="lstd-detect-tip">' + esc(tip) + "</p>";
    if ((scan.results || []).length) {
      html += '<div style="overflow:auto;border:1px solid #e8eef6;border-radius:9px;">' +
        '<table class="lstd-detect-table"><colgroup>' +
        '<col style="width:46px;"><col style="width:122px;"><col style="width:118px;"><col style="width:112px;"><col style="width:112px;"><col><col style="width:88px;">' +
        '</colgroup><thead><tr>' +
        "<th>选择</th><th>材料</th><th>标准项</th><th>当前值</th><th>标准值</th><th>问题说明</th><th>状态</th>" +
        "</tr></thead><tbody>" + scan.results.map((item) => (
          '<tr><td><input type="checkbox" data-lstd-check="' + esc(item.id) + '"' + (selected.has(item.id) ? " checked" : "") + (item.status === "已标准化" ? " disabled" : "") + "></td>" +
          "<td>" + stdCell(item.material) + "</td><td>" + stdCell(item.field) + "</td><td>" + stdCell(item.current) + "</td>" +
          "<td>" + stdCell(item.target) + "</td><td>" + stdCell(item.reason, "wrap") + "</td><td>" + lstdStatusPill(item.status) + "</td></tr>"
        )).join("") + "</tbody></table></div>";
    }
    return html;
  }

  function lstdSyncDetectModal(pageId) {
    const modal = document.getElementById("lstdDetectModal");
    if (!modal || !modal.classList.contains("show")) return;
    if (modal.dataset.lstdPage !== pageId) return;
    const body = document.getElementById("lstdDetectModalBody");
    if (body) body.innerHTML = lstdRenderDetectBody(pageId);
    const st = stdState(pageId);
    const batchButton = modal.querySelector("[data-lstd-batch]");
    if (batchButton) batchButton.disabled = !(st.selected || []).length;
  }

  function openLstdDetectModal(pageId) {
    ensureLstdModals();
    const modal = document.getElementById("lstdDetectModal");
    if (!modal) return;
    modal.dataset.lstdPage = pageId;
    const body = document.getElementById("lstdDetectModalBody");
    if (body) body.innerHTML = lstdRenderDetectBody(pageId);
    lstdOpenModalEl("lstdDetectModal");
    const st = stdState(pageId);
    if (!st.scan || (!st.scan.running && !st.scan.complete)) runLstdScan(pageId);
  }

  function openLstdFormSpecModal(pageId) {
    ensureLstdModals();
    const lib = stdLib(pageId);
    const body = document.getElementById("lstdFormSpecModalBody");
    if (body) {
      body.innerHTML = '<div class="lstd-formspec-list">' +
        (lib.formSpec || []).map((item) => "<div><b>✓</b><span>" + esc(item) + "</span></div>").join("") +
        "</div>";
    }
    lstdOpenModalEl("lstdFormSpecModal");
  }

  function openLstdSaveModal(pageId) {
    ensureLstdModals();
    const lib = stdLib(pageId);
    const text = document.getElementById("lstdSaveModalText");
    if (text) text.textContent = "标准已保存，存量数据影响已按" + lib.database + "标准化重新计算。";
    lstdOpenModalEl("lstdSaveModal");
  }

  /* ===================== 标准化页面 ===================== */
  function lstdRenderFlow(lib) {
    if (!lib.workflow || !lib.workflow.length) return "";
    return '<div class="lstd-flow">' + lib.workflow.map((step, index) => (
      '<article class="lstd-flow-step"><b>' + (index + 1) + "</b><h4>" + esc(step.title) + "</h4><p>" + esc(step.text) + "</p></article>"
    )).join("") + "</div>";
  }

  /* ===================== 规则溯源元信息 =====================
     需求 23-27 对应五个库的「数据标准化」，每库下 5 类标准化的子条款序号即
     需求条目号（如二维「计算方法标准化」= 需求 23(1)），用于验收逐条溯源。 */
  const LSTD_REQUIREMENT_NO = { twod: 23, opto: 24, electrolyte: 25, mlff: 26, catalyst: 27 };

  /* 规则库版本：随标准体系页发布的标准版本同步（需求 1-5 → 23-27 派生关系） */
  const LSTD_RULE_VERSION = { version: "V2.0", effective: "2026-09-01", publisher: "低维材料标准体系建设组" };

  function lstdReqClause(pageId, categoryKey) {
    const lib = stdLib(pageId);
    const no = LSTD_REQUIREMENT_NO[lib.key] || 23;
    const index = lib.categories.findIndex((item) => item.key === categoryKey);
    return "需求 " + no + "(" + (index < 0 ? 1 : index + 1) + ")";
  }

  /* 最近修改人 / 时间：按规则 id 确定性派生，保证每次渲染一致 */
  const LSTD_RULE_EDITORS = ["马兴", "李昊", "张婉", "陈铎"];
  function lstdRuleModified(ruleId) {
    let h = 0, h2 = 0;
    for (let i = 0; i < String(ruleId).length; i++) {
      const code = String(ruleId).charCodeAt(i);
      h = (h * 31 + code) % 100000;
      h2 = (h2 * 17 + code * (i + 1)) % 997;      /* 第二个散列专门用于取修改人，避免与日期同模撞值 */
    }
    const day = 1 + (h % 28);
    const hour = 8 + (h % 10);
    const minute = (h % 6) * 10 + (h % 10);
    return {
      by: LSTD_RULE_EDITORS[h2 % LSTD_RULE_EDITORS.length],
      at: "2026-09-" + (day < 10 ? "0" + day : day) + " " +
          (hour < 10 ? "0" + hour : hour) + ":" + (minute < 10 ? "0" + minute : minute)
    };
  }

  function lstdRenderVersionBar(pageId) {
    const lib = stdLib(pageId);
    const total = stdTotalRules(lib);
    return '<div class="lstd-version-bar">' +
      '<div class="lstd-version-main">' +
        '<span class="lstd-version-tag">' + esc(LSTD_RULE_VERSION.version) + "</span>" +
        "<strong>" + esc(lib.standardizationName) + "规则库</strong>" +
        "<span>生效日期 " + esc(LSTD_RULE_VERSION.effective) + "</span>" +
        "<span>发布 " + esc(LSTD_RULE_VERSION.publisher) + "</span>" +
        "<span>共 " + total + " 条规则 · " + lib.categories.length + " 类标准化</span>" +
      "</div>" +
      '<div class="lstd-version-acts">' +
        '<button type="button" class="lstd-version-btn" data-lstd-history="1">变更历史</button>' +
        '<button type="button" class="lstd-version-btn" data-lstd-goto-standard="1">查看上游标准体系 →</button>' +
      "</div>" +
    "</div>";
  }

  function lstdOpenHistoryModal(pageId) {
    const lib = stdLib(pageId);
    const no = LSTD_REQUIREMENT_NO[lib.key] || 23;
    const rows = [
      ["V2.0", "2026-09-01", "新增「计算层级 / 强关联体系」两条规则；单位制统一为 eV / Å", "马兴", "现行"],
      ["V1.2", "2026-06-18", "依据需求 " + no + "(4) 收紧图片规格：300 dpi、200 KB~1 MB", "李昊", "已归档"],
      ["V1.1", "2026-04-02", "补充数据格式标准化中 .dat 与可视化源文件口径", "张婉", "已归档"],
      ["V1.0", "2026-01-15", "首个版本：5 类标准化规则入库", "陈铎", "已归档"]
    ];
    const body = '<table class="lstd-history-table"><thead><tr><th>版本</th><th>生效日期</th>' +
      "<th>变更说明</th><th>修改人</th><th>状态</th></tr></thead><tbody>" +
      rows.map((r) => "<tr><td><b>" + esc(r[0]) + "</b></td><td>" + esc(r[1]) + "</td>" +
        '<td class="wrap">' + esc(r[2]) + "</td><td>" + esc(r[3]) + "</td>" +
        "<td>" + (r[4] === "现行"
          ? '<span class="lstd-hist-now">现行</span>'
          : '<span class="lstd-hist-old">已归档</span>') + "</td></tr>").join("") +
      "</tbody></table>";

    let modal = document.getElementById("lstdHistoryModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "lstdHistoryModal";
      modal.className = "overlay";
      modal.innerHTML = '<div class="modal lstd-history-modal">' +
        '<div class="lstd-modal-head"><h3>规则库变更历史</h3>' +
        '<button class="lstd-modal-close" type="button" data-lstd-history-close aria-label="关闭">×</button></div>' +
        '<div class="lstd-modal-body"></div>' +
        '<div class="lstd-modal-foot"><button class="btn" type="button" data-lstd-history-close>关闭</button></div>' +
        "</div>";
      document.body.appendChild(modal);
      modal.addEventListener("click", (e) => {
        if (e.target === modal || e.target.closest("[data-lstd-history-close]")) modal.classList.remove("show");
      });
    }
    modal.querySelector(".lstd-modal-body").innerHTML = body;
    modal.classList.add("show");
  }

  function lstdRenderRulesTable(pageId, activeCategory) {
    const st = stdState(pageId);
    const rows = st.rules[activeCategory.key] || [];
    const clause = lstdReqClause(pageId, activeCategory.key);
    const sections = (activeCategory.sections || []).map((section) => {
      const sectionRules = section.rules || [];
      const body = sectionRules.map((rule) => {
        const record = rows.find((item) => item.id === rule.id) || rule;
        const mod = lstdRuleModified(record.id);
        return "<tr><td>" + stdCell(record.item, "strong") + "</td>" +
          "<td>" + stdCell(record.field || record.item) + "</td>" +
          '<td class="lstd-rule-value">' + stdCell(record.value, "wrap") + "</td>" +
          "<td>" + stdCell(record.type) + "</td>" +
          "<td>" + stdCell(record.basis, "wrap") + "</td>" +
          '<td><span class="lstd-clause">' + esc(clause) + "</span></td>" +
          '<td><div class="lstd-mod"><b>' + esc(mod.by) + "</b><span>" + esc(mod.at) + "</span></div></td>" +
          '<td><div class="lstd-row-actions">' +
            '<button type="button" data-lstd-rule-edit="' + esc(record.id) + '">编辑</button>' +
            '<button type="button" class="danger" data-lstd-rule-delete="' + esc(record.id) + '">删除</button>' +
          "</div></td></tr>";
      }).join("");
      const header = section.title ? '<tr class="lstd-section-row"><td colspan="8">' + esc(section.title) + "</td></tr>" : "";
      return header + body;
    }).join("");
    return '<div class="lstd-table-wrap"><table class="lstd-table">' +
      '<colgroup><col class="c-item"><col class="c-field"><col class="c-value"><col class="c-type"><col class="c-basis"><col class="c-req"><col class="c-mod"><col class="c-op"></colgroup>' +
      "<thead><tr><th>标准项</th><th>数据字段</th><th>标准值</th><th>数据类型</th><th>依据 / 说明</th>" +
      "<th>来源条款</th><th>最近修改</th><th>操作</th></tr></thead>" +
      "<tbody>" + sections + "</tbody></table></div>";
  }

  function cancelLstdStandard(pageId) {
    const lib = stdLib(pageId);
    const st = stdState(pageId);
    const categoryKey = st.activeCategory;
    const category = lib.categories.find((item) => item.key === categoryKey) || lib.categories[0];
    st.rules[categoryKey] = stdCategoryRules(category).map((rule) => Object.assign({}, rule));
    st.dirty[categoryKey] = false;
    renderLstdPage(pageId);
    toast("标准保存", "已取消未保存的修改，恢复为上次保存的标准。");
  }

  function renderLstdPage(pageId) {
    const page = document.getElementById("page-" + pageId);
    if (!page) return;
    const lib = stdLib(pageId);
    const st = stdState(pageId);
    let activeCategory = lib.categories.find((item) => item.key === st.activeCategory) || lib.categories[0];
    st.activeCategory = activeCategory.key;
    const dirty = Boolean(st.dirty[activeCategory.key]);
    const totalRules = stdTotalRules(lib);
    const affected = Number(st.affectedCount || 0);
    const ingestPageId = "lowdim-ingest-" + lib.key;
    const workflowStyle = typeof getLowdimWorkflowStyle === "function" ? getLowdimWorkflowStyle() : "";
    ensureLstdModals();

    page.innerHTML =
      workflowStyle +
      lstdStyle(pageId) +
      '<div class="lowdim-workflow-page" data-lstd-page="' + esc(pageId) + '">' +

        /* —— 页头：标题 + 说明 + 指标 chips —— */
        '<div class="lowdim-workflow-head"><div>' +
          "<h2>" + esc(lib.standardizationName) + "</h2>" +
          "<p>依据《" + esc(lib.standardName) + "》对" + esc(lib.short) + "数据执行标准化加工服务，覆盖" + esc(lib.cover) + "。</p>" +
          '<div class="lstd-hero-chips">' +
            '<span class="lstd-hero-chip">标准化数据量 ≥ ' + esc(lib.target) + " 条</span>" +
            '<span class="lstd-hero-chip">' + lib.categories.length + " 类标准化</span>" +
            '<span class="lstd-hero-chip">' + totalRules + " 条标准规则</span>" +
          "</div>" +
        "</div></div>" +

        /* —— 采集加工处理调用本规则库 —— */
        '<div class="lstd-callout">' +
          '<div class="lstd-callout-main">' +
            "<strong>采集加工处理调用本规则库</strong>" +
            "<p>" + esc(lib.ingestHint) + "</p>" +
            '<div class="lstd-chips">' +
              '<span class="lstd-chip">计算方法：' + esc(lib.source) + "</span>" +
              '<span class="lstd-chip green">' + esc(lib.short) + "采集加工处理</span>" +
            "</div>" +
          "</div>" +
          '<button class="btn-primary" type="button" data-lstd-goto-ingest="' + esc(ingestPageId) + '">前往采集加工处理</button>' +
        "</div>" +

        /* —— 标准更新影响存量数据 —— */
        (affected ? '<div class="lstd-affected">' +
          "<span>标准更新影响存量数据：预计 " + affected + " 条需要重新标准化。</span>" +
          '<button class="btn-primary" type="button" data-lstd-restandardize>批量重新标准化</button></div>' : "") +

        /* —— 总体工作流程 —— */
        '<div class="lstd-card lstd-flow-card">' +
          '<div class="lstd-flow-head"><h3>总体工作流程</h3><p>' + esc(lib.lead) + "</p></div>" +
          lstdRenderFlow(lib) +
        "</div>" +

        /* —— 标准化类别：横向 tab —— */
        '<div class="lstd-tabs">' +
          lib.categories.map((category) => (
            '<button type="button" class="' + (category.key === activeCategory.key ? "active" : "") + '" data-lstd-category="' + esc(category.key) + '">' +
              esc(category.label) + "</button>"
          )).join("") +
        "</div>" +

        /* —— 规则库版本 / 生效时间 / 变更历史 —— */
        lstdRenderVersionBar(pageId) +

        /* —— 当前类别标准规则卡片 —— */
        '<div class="lstd-card">' +
          '<div class="lstd-head">' +
            '<div class="lstd-head-main">' +
              "<h3>" + esc(activeCategory.label) + "</h3>" +
              '<button class="lstd-formspec-link" type="button" data-lstd-formspec>▤ 数据表单与规格要求</button>' +
            "</div>" +
            '<div class="lstd-actions">' +
              '<button class="btn-primary" type="button" data-lstd-rule-add>+ 新增</button>' +
              '<button class="btn-primary" type="button" data-lstd-scan>非标准数据检测</button>' +
            "</div>" +
          "</div>" +
          '<div class="lstd-intro">' + esc(activeCategory.intro) + "</div>" +
          lstdRenderRulesTable(pageId, activeCategory) +
          '<div class="lstd-card-foot">' +
            '<span class="lstd-status' + (dirty ? " dirty" : "") + '">' + (dirty ? "未保存" : "已保存") + "</span>" +
            '<div class="lstd-foot-actions">' +
              '<button class="btn" type="button" data-lstd-cancel' + (dirty ? "" : " disabled") + ">取消</button>" +
              '<button class="btn-primary" type="button" data-lstd-save-standard' + (dirty ? "" : " disabled") + ">保存</button>" +
            "</div>" +
          "</div>" +
        "</div>" +

      "</div>";
  }

  /* ===================== 规则编辑 ===================== */
  function openLstdRuleModal(mode, ruleId, pageId) {
    const lib = stdLib(pageId);
    const st = stdState(pageId);
    const categoryKey = st.activeCategory || lib.categories[0].key;
    const category = lib.categories.find((item) => item.key === categoryKey) || lib.categories[0];
    const rows = st.rules[categoryKey] || [];
    const record = mode === "edit" ? rows.find((item) => item.id === ruleId) : null;
    state.lstdEditing = { pageId: pageId, categoryKey: categoryKey, ruleId: ruleId, mode: mode };
    const title = document.getElementById("twodStandardizationRuleModalTitle");
    const body = document.getElementById("twodStandardizationRuleModalBody");
    if (title) title.textContent = (mode === "edit" ? "编辑标准规则" : "新增标准规则") + " · " + lib.short + " / " + category.label;
    if (body) {
      const field = (label, id, value, placeholder) =>
        '<label><span>' + label + '</span><input id="' + id + '" type="text" value="' + esc(value || "") + '" placeholder="' + esc(placeholder || "") + '"></label>';
      body.innerHTML = '<div class="lstd-rule-form">' +
        '<div class="lstd-rule-form-row">' +
          field("标准项", "twodStdRuleItem", record && record.item, "如：截断能ENCUT") +
          field("数据字段", "twodStdRuleField", (record && (record.field || record.item)) || "", "如：encut") +
        "</div>" +
        '<div class="lstd-rule-form-row">' +
          field("标准值", "twodStdRuleValue", record && record.value, "如：500ev") +
          field("数据类型", "twodStdRuleType", record && record.type, "如：数字+单位") +
        "</div>" +
        '<label><span>依据 / 说明</span><textarea id="twodStdRuleNote" rows="3" placeholder="请输入规则依据或说明">' + esc((record && record.basis) || "") + "</textarea></label>" +
        "</div>";
    }
    if (typeof openModal === "function") openModal("twodStandardizationRuleModal");
  }

  function saveLstdRule() {
    const editing = state.lstdEditing || {};
    const pageId = editing.pageId || "lowdim-standardization-twod";
    const st = stdState(pageId);
    const categoryKey = editing.categoryKey || st.activeCategory;
    const item = (document.getElementById("twodStdRuleItem") || {}).value || "";
    const field = (document.getElementById("twodStdRuleField") || {}).value || "";
    const value = (document.getElementById("twodStdRuleValue") || {}).value || "";
    const type = (document.getElementById("twodStdRuleType") || {}).value || "";
    const basis = (document.getElementById("twodStdRuleNote") || {}).value || "";
    if (!item.trim() || !value.trim() || !type.trim()) {
      toast("标准规则校验", "请填写标准项、标准值和数据类型。");
      return;
    }
    const rows = st.rules[categoryKey] || (st.rules[categoryKey] = []);
    const draft = { item: item.trim(), field: field.trim() || item.trim(), value: value.trim(), type: type.trim(), basis: basis.trim() };
    if (editing.mode === "edit") {
      const index = rows.findIndex((row) => row.id === editing.ruleId);
      if (index >= 0) rows[index] = Object.assign({}, rows[index], draft);
    } else {
      rows.push(Object.assign({ id: categoryKey + "-" + Date.now() }, draft));
    }
    st.dirty[categoryKey] = true;
    if (typeof closeModal === "function") closeModal("twodStandardizationRuleModal");
    renderLstdPage(pageId);
    toast("标准规则", editing.mode === "edit" ? "规则已编辑，当前未保存。" : "规则已新增，当前未保存。");
  }

  function deleteLstdRule(pageId, ruleId) {
    const st = stdState(pageId);
    const categoryKey = st.activeCategory;
    const rows = st.rules[categoryKey] || [];
    const record = rows.find((row) => row.id === ruleId);
    if (!record) return;
    if (!window.confirm('确认删除「' + record.item + '」吗？')) return;
    st.rules[categoryKey] = rows.filter((row) => row.id !== ruleId);
    st.dirty[categoryKey] = true;
    renderLstdPage(pageId);
    toast("标准规则", "规则已删除，当前未保存。");
  }

  function saveLstdStandard(pageId) {
    const st = stdState(pageId);
    const categoryKey = st.activeCategory;
    st.dirty[categoryKey] = false;
    const lib = stdLib(pageId);
    const scale = parseInt(String(lib.target).replace(/[^0-9]/g, ""), 10) || 1000;
    st.affectedCount = Math.max(120, Math.round(scale * 0.004));
    renderLstdPage(pageId);
    openLstdSaveModal(pageId);
  }

  function runLstdScan(pageId) {
    const st = stdState(pageId);
    if (st.scan && st.scan.running) return;
    const lib = stdLib(pageId);
    st.scan = { running: true, progress: 0, complete: false, results: [] };
    st.selected = [];
    lstdSyncDetectModal(pageId);
    renderLstdPage(pageId);
    clearInterval(runLstdScan.timer);
    runLstdScan.timer = setInterval(() => {
      const current = stdState(pageId);
      current.scan.progress = Math.min(100, current.scan.progress + 20);
      if (current.scan.progress >= 100) {
        clearInterval(runLstdScan.timer);
        current.scan.running = false;
        current.scan.complete = true;
        current.scan.results = lib.nonstandard.map((item) => Object.assign({}, item));
      }
      if (typeof state !== "undefined" && state.page === pageId) renderLstdPage(pageId);
      lstdSyncDetectModal(pageId);
    }, 200);
  }

  function batchLstdStandardize(pageId) {
    const st = stdState(pageId);
    const selected = new Set(st.selected || []);
    if (!selected.size) {
      toast("批量标准化", "请先勾选非标数据。");
      return;
    }
    st.scan.results = (st.scan.results || []).map((item) =>
      selected.has(item.id) ? Object.assign({}, item, { current: item.target, status: "已标准化" }) : item);
    st.selected = [];
    renderLstdPage(pageId);
    lstdSyncDetectModal(pageId);
    toast("批量标准化", selected.size + " 条非标数据已按标准值完成标准化。");
  }

  function restandardizeLstd(pageId) {
    const st = stdState(pageId);
    st.affectedCount = 0;
    st.scan.results = (st.scan.results || []).map((item) => Object.assign({}, item, { current: item.target, status: "已标准化" }));
    st.selected = [];
    renderLstdPage(pageId);
    lstdSyncDetectModal(pageId);
    toast("批量重新标准化", "受影响的存量数据已按最新标准重新标准化。");
  }


  /* ===================== 采集加工处理：调用标准化规则 ===================== */
  function lstdIngestStyle(pageId) {
    const scope = "#page-" + pageId;
    return "<style>" + [
      scope + " .lstd-call-table { width:100%; min-width:680px; border-collapse:collapse; table-layout:fixed; }",
      scope + " .lstd-call-table th:first-child, " + scope + " .lstd-call-table td:first-child { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }",
      scope + " .lstd-call-table th:nth-child(2), " + scope + " .lstd-call-table td:nth-child(2), " + scope + " .lstd-call-table th:nth-child(4), " + scope + " .lstd-call-table td:nth-child(4) { white-space:nowrap; }",
      scope + " .lstd-call-table td:nth-child(3) { word-break:break-word; line-height:19px; }",
      scope + " .lstd-call-table th { height:40px; padding:0 14px; background:var(--color-bg-table-head, #f5f5f5); border-bottom:1px solid #e8eef6; color:#64748b; font-size:11.5px; text-align:left; }",
      scope + " .lstd-call-table td { padding:11px 14px; border-bottom:1px solid #eef2f7; color:#334155; font-size:12px; }",
      scope + " .lstd-call-table td strong { color:#0f172a; }",
      scope + " .lstd-call-table .ok { color:#0d9b70; font-weight:700; }",
      scope + " .lstd-call-table .pending { color:#b7791f; font-weight:700; }",
      scope + " .lstd-call-note { display:flex; gap:10px; align-items:flex-start; margin-top:14px; padding:12px 14px; border:1px solid #cfe0fb; border-radius:9px; background:#f2f7ff; color:#475569; font-size:12px; line-height:19px; }",
      scope + " .lstd-call-note b { color:#00308f; }",
      scope + " .lstd-ingest-inline { margin:0 0 16px; padding:13px 16px; border:1px solid #cfe0fb; border-radius:10px; background:#f2f7ff; }",
      scope + " .lstd-ingest-inline strong { display:block; margin-bottom:5px; color:#00308f; font-size:12.5px; }",
      scope + " .lstd-ingest-inline p { margin:0; color:#475569; font-size:11.5px; line-height:19px; }",
      scope + " .lstd-ingest-inline em { display:block; margin-top:7px; color:#7c8b9c; font-size:11px; font-style:normal; }"
    ].join("\n          ") + "</style>";
  }

  function lstdIngestState(pageId) {
    if (!state.lowdimStdIngest) state.lowdimStdIngest = {};
    if (!state.lowdimStdIngest[pageId]) {
      state.lowdimStdIngest[pageId] = { running: false, progress: 0, done: false };
    }
    return state.lowdimStdIngest[pageId];
  }

  /* 采集加工处理 · 标准化环节：直接展示所调用的标准化规则条目 */
  function renderLowdimStandardizationWizardStep(pageId, config, material) {
    const key = stdKey(pageId);
    const lib = stdLib(pageId);
    const st = lstdIngestState(pageId);
    const totalRules = stdTotalRules(lib);
    const categoryCount = lib.categories.length;
    const doneCount = st.done ? categoryCount : Math.floor((st.progress / 100) * categoryCount + 0.55);

    const callRows = lib.categories.map((category, index) => {
      const rules = stdCategoryRules(category);
      const samples = rules.slice(0, 3).map((rule) => rule.item + "=" + rule.value);
      const stateText = index < doneCount ? '<span class="ok">● 已应用</span>' : '<span class="pending">○ 待应用</span>';
      return "<tr><td><strong>" + esc(category.label) + "</strong></td>" +
        "<td>" + rules.length + " 条</td>" +
        "<td>" + esc(samples.join("；")) + "</td>" +
        "<td>" + stateText + "</td></tr>";
    }).join("");

    const progressItems = lib.categories.map((category, index) => {
      const active = index === doneCount && st.running;
      const done = index < doneCount;
      const cls = active ? " processing" : "";
      const stateText = done ? "已完成" : (active ? "进行中 · " + st.progress + "%" : "待执行");
      return '<div class="twod-standardization-item' + cls + '">' +
        '<span class="twod-standardization-item-icon">' + (done ? "✓" : "◔") + "</span>" +
        "<strong>" + esc(category.label) + "（" + stdCategoryRules(category).length + " 条规则）</strong>" +
        "<em>" + esc(stateText) + "</em></div>";
    }).join("");

    const doneRules = Math.round((doneCount / categoryCount) * totalRules);
    const totalRecords = 1280;

    return '<div class="twod-standardization-step">' +
      lstdIngestStyle(pageId) +
      '<section class="twod-collection-panel">' +
        '<div class="twod-collection-panel-head"><span>▱</span><div>' +
          "<h3>标准化处理</h3>" +
          "<p>调用《" + esc(lib.standardizationName) + "》规则库（" + esc(lib.standardName) + "），统一数据字段、单位与格式</p>" +
        "</div></div>" +
        '<div class="lstd-ingest-inline">' +
          "<strong>本次标准化调用规则库：" + totalRules + " 条规则 · " + categoryCount + " 个标准化类别</strong>" +
          "<p>依据：" + esc(lib.cover) + "。数据来源与计算软件：" + esc(lib.source) + "。</p>" +
          "<em>" + esc(lib.ingestHint) + "</em>" +
        "</div>" +
        '<div class="twod-standardization-overview">' +
          lib.categories.slice(0, 4).map((category) => (
            '<div class="twod-standardization-rule-card">' +
              '<h4><span class="twod-standardization-rule-icon">◇</span>' + esc(category.label) + "</h4>" +
              "<p>" + esc(category.intro) + "</p>" +
              "<p style=\"margin-top:8px;color:#1f63ff;\">调用 " + stdCategoryRules(category).length + " 条规则</p>" +
            "</div>"
          )).join("") +
        "</div>" +
        '<div class="lstd-call-note"><b>规则调用清单</b><span>下列标准化规则由本页规则库直出，采集加工处理不再另行定义标准。</span></div>' +
        '<div style="overflow:auto;margin-top:12px;border:1px solid #e8eef6;border-radius:9px;">' +
          '<table class="lstd-call-table"><thead><tr><th style="width:190px;">标准化类别</th><th style="width:90px;">调用规则数</th><th>关键标准值（示例）</th><th style="width:110px;">状态</th></tr></thead>' +
          "<tbody>" + callRows + "</tbody></table>" +
        "</div>" +
      "</section>" +
      '<section class="twod-standardization-progress">' +
        '<div class="twod-standardization-progress-head"><h3>标准化执行进度</h3>' +
          '<button class="btn-primary" type="button" data-lstd-ingest-run="' + esc(pageId) + '"' + (st.running ? " disabled" : "") + ">◉&nbsp; 开始标准化处理</button>" +
        "</div>" +
        '<div class="twod-standardization-list">' + progressItems + "</div>" +
        '<div class="twod-standardization-summary">已按标准值处理 ' + doneRules + " / " + totalRules + " 条规则，覆盖 " + totalRecords + " 条" + esc(lib.short) + "数据" +
          "<strong>通过 " + Math.max(0, totalRecords - 40) + "</strong><b>警告 8</b><i>失败 32</i></div>" +
      "</section>" +
      '<div class="twod-entry-footer-note">⌁&nbsp;' + (st.done ? "标准化处理完成，可进入提交入库" : "标准化规则已就绪，点击「开始标准化处理」调用规则库执行") + "</div>" +
    "</div>";
  }

  /* 采集加工处理 · 数据资源加工：提示本次加工将调用的标准化规则 */
  function renderLowdimStdRuleCallInline(pageId) {
    const lib = stdLib(pageId);
    const totalRules = stdTotalRules(lib);
    const preview = lib.categories.map((category) => category.label + "(" + stdCategoryRules(category).length + ")").join("、");
    return '<div class="lstd-ingest-inline">' +
      "<strong>标准化规则调用：" + totalRules + " 条规则 · " + lib.categories.length + " 个类别</strong>" +
      "<p>本次加工将依据《" + esc(lib.standardizationName) + "》执行清洗、格式转换与单位归一，加工结果按标准值回写；标准化环节将逐条比对并生成非标清单。</p>" +
      "<em>类别：" + esc(preview) + "</em></div>";
  }

  /* ===================== 页面上线：接管标准化页面 ===================== */
  function patchedRenderLowdimStandardizationPage(pageId) {
    if (String(pageId || "").indexOf("lowdim-standardization-") === 0) {
      renderLstdPage(pageId);
      return;
    }
    renderLstdPage("lowdim-standardization-twod");
  }

  if (typeof window.renderLowdimStandardizationPage !== "function" || !window.renderLowdimStandardizationPage.__lstdPatched) {
    const baseRender = typeof renderLowdimStandardizationPage === "function" ? renderLowdimStandardizationPage : null;
    patchedRenderLowdimStandardizationPage.__lstdPatched = true;
    patchedRenderLowdimStandardizationPage.__lstdBase = baseRender;
    renderLowdimStandardizationPage = patchedRenderLowdimStandardizationPage;
    window.renderLowdimStandardizationPage = patchedRenderLowdimStandardizationPage;
  }

  renderTwodStandardizationPage = function (pageId) {
    renderLstdPage(String(pageId || "lowdim-standardization-twod"));
  };
  window.renderTwodStandardizationPage = renderTwodStandardizationPage;

  saveTwodStandardizationRule = saveLstdRule;
  deleteTwodStandardizationRule = function (ruleId) {
    deleteLstdRule("lowdim-standardization-" + stdKey(state && state.page), ruleId);
  };

  /* 采集加工处理主脚本以裸标识符调用这两个函数，必须挂到全局对象上 */
  window.renderLowdimStandardizationWizardStep = renderLowdimStandardizationWizardStep;
  window.renderLowdimStdRuleCallInline = renderLowdimStdRuleCallInline;

  window.renderLstdPage = renderLstdPage;
  window.LOWDIM_STD_API = {
    library: LOWDIM_STD_LIBRARY,
    render: renderLstdPage,
    totalRules: stdTotalRules,
    categories: (pageId) => stdLib(pageId).categories,
    wizardStep: renderLowdimStandardizationWizardStep,
    ruleCallInline: renderLowdimStdRuleCallInline
  };

  /* ===================== 事件绑定 ===================== */
  function lstdPageIdFrom(el) {
    const host = el && el.closest ? el.closest("[data-lstd-page]") : null;
    if (host && host.dataset && host.dataset.lstdPage) return host.dataset.lstdPage;
    const section = el && el.closest ? el.closest("section.page") : null;
    if (section && section.id) return String(section.id).replace(/^page-/, "");
    return String((state && state.page) || "");
  }

  document.addEventListener("click", function (event) {
    const target = event.target;
    if (!target || typeof target.closest !== "function") return;

    const categoryButton = target.closest("[data-lstd-category]");
    if (categoryButton) {
      const pageId = lstdPageIdFrom(categoryButton);
      stdState(pageId).activeCategory = categoryButton.dataset.lstdCategory;
      renderLstdPage(pageId);
      return;
    }
    if (target.closest("[data-lstd-rule-add]")) {
      openLstdRuleModal("add", "", lstdPageIdFrom(target));
      return;
    }
    const editButton = target.closest("[data-lstd-rule-edit]");
    if (editButton) {
      openLstdRuleModal("edit", editButton.dataset.lstdRuleEdit, lstdPageIdFrom(editButton));
      return;
    }
    const deleteButton = target.closest("[data-lstd-rule-delete]");
    if (deleteButton) {
      deleteLstdRule(lstdPageIdFrom(deleteButton), deleteButton.dataset.lstdRuleDelete);
      return;
    }
    if (target.closest("[data-lstd-formspec]")) {
      openLstdFormSpecModal(lstdPageIdFrom(target));
      return;
    }
    if (target.closest("[data-lstd-history]")) {
      lstdOpenHistoryModal(lstdPageIdFrom(target));
      return;
    }
    if (target.closest("[data-lstd-goto-standard]")) {
      const stdPage = "standard-twod";
      try {
        if (typeof switchPage === "function") switchPage(stdPage);
        toast("标准体系", "已定位到「低维材料标准体系」，本规则库由其标准文本派生。");
      } catch (error) {
        toast("标准体系", "请从左侧导航进入「低维材料标准体系」查看上游标准文本。");
      }
      return;
    }
    if (target.closest("[data-lstd-save-standard]")) {
      saveLstdStandard(lstdPageIdFrom(target));
      return;
    }
    if (target.closest("[data-lstd-cancel]")) {
      cancelLstdStandard(lstdPageIdFrom(target));
      return;
    }
    if (target.closest("[data-lstd-scan]")) {
      openLstdDetectModal(lstdPageIdFrom(target));
      return;
    }
    if (target.closest("[data-lstd-batch]")) {
      batchLstdStandardize(lstdPageIdFrom(target));
      return;
    }
    if (target.closest("[data-lstd-restandardize]")) {
      restandardizeLstd(lstdPageIdFrom(target));
      return;
    }
    const gotoIngest = target.closest("[data-lstd-goto-ingest]");
    if (gotoIngest) {
      const targetPage = gotoIngest.dataset.lstdGotoIngest;
      try {
        if (typeof switchPage === "function") switchPage(targetPage);
        toast("采集加工处理", "已定位到「" + stdLib(targetPage).short + "数据采集加工处理」，标准化规则将在此被调用。");
      } catch (error) {
        toast("采集加工处理", "请从左侧导航进入「" + stdLib(targetPage).short + "数据采集加工处理」。");
      }
      return;
    }
    const runIngest = target.closest("[data-lstd-ingest-run]");
    if (runIngest) {
      const pageId = runIngest.dataset.lstdIngestRun;
      const st = lstdIngestState(pageId);
      if (st.running) return;
      st.running = true;
      st.progress = 0;
      st.done = false;
      renderLowdimIngestPage(pageId);
      clearInterval(runIngest.timer);
      runIngest.timer = setInterval(function () {
        const current = lstdIngestState(pageId);
        current.progress = Math.min(100, current.progress + 20);
        if (current.progress >= 100) {
          clearInterval(runIngest.timer);
          current.running = false;
          current.done = true;
        }
        if (state && state.page === pageId) renderLowdimIngestPage(pageId);
      }, 220);
      return;
    }
  }, false);

  document.addEventListener("change", function (event) {
    const check = event.target && event.target.closest ? event.target.closest("[data-lstd-check]") : null;
    if (!check) return;
    const pageId = lstdPageIdFrom(check);
    const st = stdState(pageId);
    const selected = new Set(st.selected || []);
    if (check.checked) selected.add(check.dataset.lstdCheck);
    else selected.delete(check.dataset.lstdCheck);
    st.selected = Array.from(selected);
    /* 只更新按钮可用态，避免整页重渲染导致勾选跳动 */
    const root = check.closest("[data-lstd-page]");
    const batchButton = root ? root.querySelector("[data-lstd-batch]") : null;
    if (batchButton) batchButton.disabled = !st.selected.length;
  }, false);

  window.__LOWDIM_STD_LIBRARY_READY__ = true;
})();

