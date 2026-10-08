
    (() => {
      const originalRenderMlffGlossaryPage = window.renderMlffGlossaryPage || (typeof renderMlffGlossaryPage === "function" ? renderMlffGlossaryPage : null);
      const definitionExtras = [
        { letter:"A", cn:"安全温度术语", en:"Flash/fire/autoignition point", type:"/", unit:"/", desc:"闪点、持续燃烧的燃点和自燃温度分别保存，不能混用或用单一数值替代。", nullRule:"/", category:"/" },
        { letter:"A", cn:"吸附能", en:"Adsorption energy", type:"/", unit:"/", desc:"表面与吸附物相互作用的能量差；不能从总能字段直接改名得到。", nullRule:"/", category:"/" },
        { letter:"A", cn:"相互作用能", en:"Interaction energy", type:"/", unit:"/", desc:"簇态或分子间相互作用能；需明确参考态、几何和计算方法。", nullRule:"/", category:"/" },
        { letter:"A", cn:"原子受力", en:"Atomic forces", type:"/", unit:"/", desc:"每个原子上的力向量；需与结构坐标保持严格顺序一致。", nullRule:"/", category:"/" },
        { letter:"B", cn:"玻尔兹曼常数", en:"Boltzmann Constant", type:"/", unit:"/", desc:"用于建立微观能量与宏观温度之间的联系，是分子动力学温度控制和热力学计算的基础参数。", nullRule:"/", category:"/" },
        { letter:"D", cn:"单体/重复单元", en:"Monomer/repeat unit", type:"/", unit:"/", desc:"单体、聚合物重复单元和完整链片段分级记录，不能将不同层级结构混为一项。", nullRule:"/", category:"/" },
        { letter:"D", cn:"多极矩", en:"Multipole moments", type:"/", unit:"/", desc:"电荷、偶极、四极等多极矩；必须记录阶数、分量约定和原点。", nullRule:"/", category:"/" },
        { letter:"F", cn:"分子DOS", en:"Molecular density of states", type:"/", unit:"/", desc:"离散轨道经展宽后的分子态密度；不能当作周期晶体DOS使用。", nullRule:"/", category:"/" },
        { letter:"F", cn:"费米能级", en:"Fermi level", type:"/", unit:"/", desc:"体系电子占据的费米能级；必须保留能量零点和计算条件。", nullRule:"/", category:"/" },
        { letter:"F", cn:"费米面", en:"Fermi surface", type:"/", unit:"/", desc:"满足E_n(k)=E_F的k空间曲面，不是单个能量数值。", nullRule:"/", category:"/" },
        { letter:"J", cn:"极化率", en:"polarizability", type:"标量或结构化记录", unit:"本轮9个单点样例用于字段和格式联调；不是训练完成的高精度力场", desc:"原子与分子alpha(0)；D4模型系数，非实验张量。", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
        { letter:"J", cn:"简正模式", en:"Normal modes", type:"/", unit:"/", desc:"非线性分子有3N−6个振动模式；不保证每个模式都有IR强度。", nullRule:"/", category:"/" },
        { letter:"L", cn:"理论层级", en:"Level of theory", type:"/", unit:"/", desc:"记录泛函、基组、色散、势函数及收敛设置，不能只写一个软件名称。", nullRule:"/", category:"/" },
        { letter:"M", cn:"密度", en:"Density", type:"/", unit:"/", desc:"样品密度必须绑定温度、压力、组成和测量或计算方法。", nullRule:"/", category:"/" },
        { letter:"N", cn:"能量", en:"Energy", type:"/", unit:"/", desc:"能量值必须明确体系、参考态、几何构型、方法和单位。", nullRule:"/", category:"/" },
        { letter:"R", cn:"溶剂化自由能", en:"Solvation free energy", type:"/", unit:"/", desc:"溶液与气相自由能差；溶剂、温度和标准态必须一致。", nullRule:"/", category:"/" },
        { letter:"S", cn:"色散系数", en:"dispersion_coefficients", type:"标量或结构化记录", unit:"本轮9个单点样例用于字段和格式联调；不是训练完成的高精度力场", desc:"原子与分子C6AA，原子单位；保留方法。", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
        { letter:"S", cn:"双分子相互作用能", en:"dimer_interaction_energy", type:"标量或结构化记录", unit:"本轮9个单点样例用于字段和格式联调；不是训练完成的高精度力场", desc:"E2−2E1，同几何同方法；不冒充总能。", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
        { letter:"S", cn:"双分子原子受力", en:"dimer_forces", type:"结构化对象/附件", unit:"本轮9个单点样例用于字段和格式联调；不是训练完成的高精度力场", desc:"2mer逐原子Nx3受力，eV/Å，F=−∇E。", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
        { letter:"S", cn:"双分子结构", en:"dimer_geometry", type:"结构化对象/附件", unit:"本轮9个单点样例用于字段和格式联调；不是训练完成的高精度力场", desc:"2mer实际坐标，两个冻结单体平移组合。", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
        { letter:"S", cn:"四级结构", en:"quaternary_structure", type:"结构化对象/附件", unit:"结构证据，不包含量化能量与原子力", desc:"4HHB α2β2四聚体；1UBQ单链不适用四级结构。", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
        { letter:"T", cn:"态密度", en:"density_of_states", type:"标量或结构化记录", unit:"电子能带与能带合并同一字段；可用标记不能代替数组", desc:"Li3N有实际band/DOS图片；Li3PO4部分band图片；原始数组未取回。", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
        { letter:"T", cn:"体系规模", en:"system_classification", type:"标量或结构化记录", unit:"完整蛋白仅结构；不计为完整蛋白力场训练集", desc:"醚DME、酰胺Formamide、PEO n4各1/2/3mer；MD22三肽和PDB蛋白。", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
        { letter:"T", cn:"训练/验证/测试", en:"Train/validation/test", type:"/", unit:"/", desc:"训练更新参数，验证选择模型，测试只作独立评估；避免轨迹穿帧泄漏。", nullRule:"/", category:"/" },
        { letter:"T", cn:"拓扑/质子态/三肽/二硫键采样", en:"protein_topology_sampling", type:"标量或结构化记录", unit:"PDB不是已配参MD拓扑；样例PDB不含SSBOND不代表所有蛋白无二硫键", desc:"MD22三肽32帧带DFT能量/力；1UBQ/4HHB PDB结构。全质子态和二硫键二肽集合待补。", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
        { letter:"W", cn:"外观颜色", en:"Appearance color", type:"/", unit:"/", desc:"样品外观描述，不能替代结构、谱图或定量性质。", nullRule:"/", category:"/" },
        { letter:"X", cn:"X射线衍射谱", en:"XRD spectrum", type:"/", unit:"/", desc:"2θ=5–90°；未加入仪器展宽；不是实测XRD。", nullRule:"/", category:"/" },
        { letter:"X", cn:"X射线吸收谱", en:"XAS spectrum", type:"/", unit:"/", desc:"需记录吸收元素、吸收边、能量网格和信号类型。", nullRule:"/", category:"/" },
        { letter:"X", cn:"相互作用能", en:"Interaction energy", type:"/", unit:"/", desc:"簇态或分子间相互作用能；需明确参考态、几何和计算方法。", nullRule:"/", category:"/" },
        { letter:"X", cn:"吸附能", en:"Adsorption energy", type:"/", unit:"/", desc:"表面与吸附物相互作用的能量差；不能从总能字段直接改名得到。", nullRule:"/", category:"/" },
        { letter:"X", cn:"小分子/链片段/蛋白及体系规模", en:"system_classification", type:"标量或结构化记录", unit:"完整蛋白仅结构；不计为完整蛋白力场训练集", desc:"醚DME、酰胺Formamide、PEO n4各1/2/3mer；MD22三肽和PDB蛋白。", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
        { letter:"Y", cn:"一级结构", en:"primary_structure", type:"结构化对象/附件", unit:"结构证据，不包含量化能量与原子力", desc:"PDB SEQRES链序列；1UBQ76残基。", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
        { letter:"Y", cn:"原子电荷", en:"atomic_charges", type:"标量或结构化记录", unit:"本轮9个单点样例用于字段和格式联调；不是训练完成的高精度力场", desc:"实际GFN2-xTB逐原子电荷，净电荷校验。", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
        { letter:"Y", cn:"原子受力", en:"Atomic forces", type:"/", unit:"/", desc:"每个原子上的力向量；需与结构坐标保持严格顺序一致。", nullRule:"/", category:"/" },
        { letter:"Y", cn:"跃迁偶极矩", en:"Transition dipole", type:"/", unit:"/", desc:"态间跃迁偶极矩，不能用静态永久偶极矩替代。", nullRule:"/", category:"/" },
        { letter:"Z", cn:"重复单元与肽键", en:"repeat_units_peptide_bonds", type:"标量或结构化记录", unit:"未构建覆盖所有残基/质子态的拓扑集合", desc:"PEO重复单元、OH端基n4片段与MD22封端三肽；肽链结构可下载。", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
        { letter:"Z", cn:"总能量", en:"Total energy", type:"/", unit:"/", desc:"指定哈密顿量和构型的总能量；不同方法零点不可直接比较。", nullRule:"/", category:"/" },
        { letter:"Z", cn:"多分子团簇结构", en:"cluster_geometry", type:"结构化对象/附件", unit:"本轮9个单点样例用于字段和格式联调；不是训练完成的高精度力场", desc:"3mer真实坐标，三分子团簇。", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
        { letter:"Z", cn:"多分子相互作用能", en:"cluster_interaction_energy", type:"标量或结构化记录", unit:"本轮9个单点样例用于字段和格式联调；不是训练完成的高精度力场", desc:"E3−3E1，同几何同方法。", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
        { letter:"Z", cn:"多分子原子受力", en:"cluster_forces", type:"结构化对象/附件", unit:"本轮9个单点样例用于字段和格式联调；不是训练完成的高精度力场", desc:"3mer逐原子Nx3受力，eV/Å。", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
        { letter:"Z", cn:"分子间色散作用", en:"intermolecular_dispersion", type:"标量或结构化记录", unit:"/", desc:"提供GFN2含色散总相互作用与C6系数；未独立提取色散能分量。", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
        { letter:"Z", cn:"链间氢键", en:"interchain_hydrogen_bonds", type:"标量或结构化记录", unit:"需指定供体/受体、距离角度阈值，并计算标签", desc:"提供含OH端基和酰胺的真实结构；未将未筛选平移构型标为氢键数据集。", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
        { letter:"Z", cn:"链取向/折叠/排列", en:"chain_conformation", type:"标量或结构化记录", unit:"未覆盖长PEO链构象分布及多链熔体", desc:"实际单构象及平移组合；MD22提供32帧构象。", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
        { letter:"Z", cn:"单分子能量", en:"monomer_energy", type:"标量或结构化记录", unit:"本轮9个单点样例用于字段和格式联调；不是训练完成的高精度力场", desc:"真实单点总能，eV；未弛豫构型。", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
        { letter:"Z", cn:"单分子结构", en:"monomer_geometry", type:"结构化对象/附件", unit:"本轮9个单点样例用于字段和格式联调；不是训练完成的高精度力场", desc:"1mer XYZ/PDB及带标签extxyz。", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" }
      ];
      const pinyinInitialByTerm = {};
      const normalizeDefinition = (item) => ({ letter:item.letter || pinyinInitialByTerm[item.cn] || "Z", cn:item.cn, en:item.en || "/", type:item.type || "/", unit:item.unit || "/", desc:item.desc || "/", nullRule:item.nullRule || "/", category:item.category || "/" });
      const methodDetails = {
        "密度泛函理论 (DFT)": { shortTitle:"英文缩写：DFT", frequency:"高", analysis:{pros:"精度高，可准确描述电子结构",cons:"计算成本高，受体系规模限制",apply:"中小规模体系的力场参数获取"}, params:["原子电荷","成键参数"], updatedAt:"2026-08-20" },
        "从头算分子动力学 (AIMD)": { shortTitle:"英文缩写：AIMD", frequency:"中", analysis:{pros:"无需预定义经验参数",cons:"计算资源消耗大",apply:"反应过程与电子结构变化体系"}, params:["能量","原子受力"], updatedAt:"2026-08-18" },
        "深度神经网络势 (Deep Potential)": { shortTitle:"英文缩写：DP", frequency:"高", analysis:{pros:"兼顾接近DFT的精度与高效率",cons:"依赖高质量训练数据",apply:"大规模与长时间分子动力学"}, params:["能量","力","维里"], updatedAt:"2026-08-16" },
        "高斯过程回归 (GPR)": { shortTitle:"英文缩写：GPR", frequency:"中", analysis:{pros:"可评估预测不确定性",cons:"大数据集训练成本较高",apply:"小中型体系与主动学习"}, params:["势能面","不确定性"], updatedAt:"2026-08-14" },
        "X射线衍射 (XRD)": { shortTitle:"英文缩写：XRD", frequency:"中", analysis:{pros:"结构参数测量精度高",cons:"对样品晶体质量有要求",apply:"晶体结构与键长键角验证"}, params:["晶格常数","键长"], updatedAt:"2026-08-12" },
        "核磁共振 (NMR)": { shortTitle:"英文缩写：NMR", frequency:"中", analysis:{pros:"可表征构象和动态信息",cons:"谱图解析复杂",apply:"扭转参数与构象验证"}, params:["化学位移","耦合常数"], updatedAt:"2026-08-10" }
      };
      const methods = (window.mlffGlossaryMethods || (typeof mlffGlossaryMethods !== "undefined" ? mlffGlossaryMethods : [])).map((item) => ({...item, ...(methodDetails[item.title] || {}), analysis:(methodDetails[item.title] || {}).analysis || {pros:"数据可信度高",cons:"获取周期较长",apply:item.scope || "力场参数获取"}, params:(methodDetails[item.title] || {}).params || ["力场参数"], updatedAt:(methodDetails[item.title] || {}).updatedAt || "2026-08-20", shortTitle:(methodDetails[item.title] || {}).shortTitle || item.type, frequency:(methodDetails[item.title] || {}).frequency || "中"}));
      const definitions = definitionExtras.map(normalizeDefinition);
      const toneMap = { blue:{bg:"#eaf3ff",fg:"#1765f2",icon:"▣"}, green:{bg:"#eafaf2",fg:"#18a965",icon:"♟"}, purple:{bg:"#f2ecff",fg:"#8056e8",icon:"◎"} };
      const esc = (value) => typeof html === "function" ? html(String(value ?? "")) : String(value ?? "").replace(/[&<>\"]/g,(char)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]));
      function renderDefinitions() {
        const keyword = String(state.mlffTermKeyword || "").trim().toLowerCase();
        const alpha = state.mlffGlossaryAlpha || "A";
        const sortedDefinitions = definitions.slice().sort((a, b) => a.letter.localeCompare(b.letter) || a.cn.localeCompare(b.cn, "zh-Hans-CN"));
        const list = sortedDefinitions.filter((item) => (alpha === "全" || item.letter === alpha) && (!keyword || `${item.cn} ${item.en} ${item.type} ${item.desc}`.toLowerCase().includes(keyword)));
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").concat("全");
        return `
          <section class="mlff-search-panel">
            <div class="mlff-search-title-row"><div class="mlff-search-title"><span>⌕</span><span>术语检索</span></div><button class="mlff-reset-link" type="button" data-mlff-glossary-reset>⟳ 重置条件</button></div>
            <div class="mlff-search-line"><label class="mlff-search-input"><span>⌕</span><input value="${esc(state.mlffTermKeyword || "")}" placeholder="输入术语名称、英文缩写或参数类型进行检索" data-mlff-glossary-keyword></label><div class="mlff-search-controls"><label>参数类型：</label><select data-mlff-definition-type><option>全部类型</option><option>电子结构参数</option><option>物理常数</option><option>力场参数</option></select><button class="mlff-search-submit" type="button" data-mlff-glossary-search>⌕　检索</button></div></div>
          </section>
          <section class="mlff-alpha-panel"><div class="mlff-alpha-title"><strong>A↕</strong><span>汉字拼音首字母索引</span><small>点击字母快速定位到对应术语</small></div><div class="mlff-alpha-list">${letters.map((letter)=>`<button class="mlff-alpha-btn${alpha===letter?" active":""}" type="button" data-mlff-alpha="${letter}">${letter}</button>`).join("")}</div></section>
          <section class="mlff-list-section"><div class="mlff-list-heading"><h3>参数数据定义列表 <span>共 156 条</span></h3><div class="mlff-list-sort">排序方式： <strong>首字母</strong>　参数类型　更新时间</div></div><div class="mlff-definition-list">${list.map((item)=>`<article class="mlff-definition-card"><div class="mlff-term-card-head"><div class="mlff-term-identity"><div class="mlff-term-letter">${esc(item.letter)}</div><div><div class="mlff-term-name">${esc(item.cn)}<span class="mlff-term-en">${esc(item.en)}</span></div><div class="mlff-term-meta">首字母：${esc(item.letter)}　·　参数类型：${esc(item.type)}</div></div></div><div class="mlff-card-actions"><button class="mlff-primary-small" type="button">◉ 查看定义</button><button class="mlff-star-small" type="button" title="收藏">☆</button></div></div><div class="mlff-definition-box"><div class="mlff-definition-label">▦　参数定义</div><p>${esc(item.desc)}</p></div><div class="mlff-term-card-foot"><span>◉ 来源：${esc(item.source)}　　◷ 更新于 ${esc(item.updatedAt)}</span><div class="mlff-related-tags">关联获取方法：${item.methods.map((method)=>`<span>${esc(method)}</span>`).join("")}</div></div></article>`).join("")}</div></section>`;
      }
      function renderMethods() {
        const keyword = String(state.mlffTermKeyword || "").trim().toLowerCase();
        const methodType = state.mlffMethodFilter || "all";
        const filtered = methods.filter((item) => (methodType === "all" || item.type.includes(methodType)) && (!keyword || `${item.title} ${item.type} ${item.desc} ${item.shortTitle}`.toLowerCase().includes(keyword)));
        const counts = [
          {n:3,label:"DFT计算类方法",bg:"#eaf2ff",fg:"#1765f2",icon:"▣"},
          {n:2,label:"实验数据类方法",bg:"#eafaf2",fg:"#18a965",icon:"♟"},
          {n:2,label:"机器学习类方法",bg:"#f2ecff",fg:"#8056e8",icon:"◎"},
          {n:1,label:"文献查阅类方法",bg:"#fff2eb",fg:"#f28a57",icon:"▤"}
        ];
        return `
          <section class="mlff-search-panel"><div class="mlff-search-title-row"><div class="mlff-search-title"><span>⌕</span><span>深度检索</span></div><button class="mlff-reset-link" type="button" data-mlff-glossary-reset>⟳ 重置条件</button></div><div class="mlff-search-line"><label class="mlff-search-input"><span>⌕</span><input value="${esc(state.mlffTermKeyword || "")}" placeholder="输入参数名称、获取方法或关键词进行深度检索" data-mlff-glossary-method-keyword></label><div class="mlff-search-controls"><label>获取方法：</label><select data-mlff-glossary-method-filter><option value="all"${methodType==="all"?" selected":""}>全部方法</option><option value="量子化学计算"${methodType==="量子化学计算"?" selected":""}>量子化学计算</option><option value="机器学习方法"${methodType==="机器学习方法"?" selected":""}>机器学习方法</option><option value="实验测量"${methodType==="实验测量"?" selected":""}>实验测量</option></select><button class="mlff-search-submit" type="button" data-mlff-glossary-search>⌕　检索</button></div></div><div class="mlff-filter-row"><label>参数类型：<select><option>全部类型</option></select></label><label>数据来源：<select><option>全部来源</option></select></label><label>更新时间：<select><option>全部时间</option></select></label></div></section>
          <section class="mlff-list-section"><div class="mlff-list-heading"><h3>获取方法概览 <span>共 8 种方法</span></h3><div class="mlff-list-sort">◷ 数据更新于 2026-08-20</div></div><div class="mlff-method-stats">${counts.map((item)=>`<article class="mlff-method-stat"><div class="mlff-method-stat-icon" style="background:${item.bg};color:${item.fg}">${item.icon}</div><div><strong>${item.n}</strong><small>${item.label}</small></div></article>`).join("")}</div></section>
          <section class="mlff-list-section"><div class="mlff-list-heading"><h3>数据获取方法列表 <span>按方法类别排列</span></h3><div class="mlff-list-sort">排序方式： <strong>方法类别</strong>　使用频率　更新时间</div></div><div class="mlff-method-list">${filtered.map((item)=>{const tone=toneMap[item.tone]||toneMap.blue;return `<article class="mlff-method-card"><div class="mlff-method-card-header"><div class="mlff-method-card-title-row"><div class="mlff-method-icon" style="background:${tone.bg};color:${tone.fg}">${tone.icon}</div><div class="mlff-method-card-title-info"><h4>${esc(item.title)}<span class="mlff-method-type-badge" style="background:${tone.bg};color:${tone.fg}">${esc(item.type)}</span></h4><div class="mlff-method-card-subtitle">${esc(item.shortTitle)}　·　使用频率：${esc(item.frequency)}</div></div></div><div class="mlff-card-actions"><button class="mlff-primary-small" type="button" data-mlff-method-detail>◉ 查看详情</button><button class="mlff-star-small" type="button" title="收藏">☆</button></div></div><div class="mlff-method-section mlff-method-desc-section"><div class="mlff-method-section-title">ⓘ　方法说明</div><p>${esc(item.desc)}</p></div><div class="mlff-method-section mlff-method-analysis-section"><div class="mlff-method-section-title">⌁　方法分析</div><div class="mlff-method-analysis-content"><span class="mlff-method-pros">✓ 优势：${esc((item.analysis || {}).pros || "数据可信度高")}</span><span class="mlff-method-cons">⊗ 不足：${esc((item.analysis || {}).cons || "获取成本较高")}</span><span class="mlff-method-apply">适用于：${esc((item.analysis || {}).apply || item.scope || "力场参数获取")}</span></div></div><div class="mlff-method-footer"><div>关联参数：${item.params.map((param)=>`<span class="mlff-method-param-tag">${esc(param)}</span>`).join("")}</div><span>◷ 更新于 ${esc(item.updatedAt)}</span></div></article>`}).join("")}</div></section>`;
      }
      const renderReferencePage = () => {
        const definition = state.mlffGlossaryTab !== "method";
        return `<div class="mlff-glossary-page"><section class="mlff-glossary-frame"><header class="mlff-glossary-header"><div class="mlff-glossary-heading"><div class="mlff-glossary-book">▣</div><div><h2 class="mlff-glossary-page-title">机器学习力场数据术语表</h2><p>统一查询参数数据定义与数据获取方法，辅助理解机器学习力场数据差异</p></div></div><div class="mlff-glossary-head-actions"><button class="mlff-glossary-head-btn" type="button">⇩　导出${definition?"术语表":"方法表"}</button><button class="mlff-glossary-head-btn" type="button" data-mlff-glossary-back>返回列表</button></div></header><nav class="mlff-glossary-tabs"><button class="mlff-glossary-tab${definition?" active":""}" type="button" data-mlff-glossary-page-tab="definition">参数数据定义表</button><button class="mlff-glossary-tab${!definition?" active":""}" type="button" data-mlff-glossary-page-tab="method">数据获取方法表</button></nav><div class="mlff-glossary-content"><section class="mlff-notice"><div class="mlff-notice-main"><div class="mlff-notice-icon">◇</div><div><strong>${definition?"本术语表仅限深圳市低维材料数据库认证用户使用":"本方法表基于参数数据定义表提供深度检索，帮助用户理解数据之间的差异"}</strong><small>${definition?"您已通过认证，可正常访问全部术语数据":"仅限深圳市低维材料数据库认证用户使用"}</small></div></div><div class="mlff-certified">已认证</div></section>${definition?renderDefinitions():renderMethods()}</div></section></div>`;
      };
      window.renderMlffGlossaryPage = renderReferencePage;
      try { renderMlffGlossaryPage = renderReferencePage; } catch (error) {}
      const renderMlffModuleBeforeGlossaryReference = typeof renderMlffModule === "function" ? renderMlffModule : null;
      if (renderMlffModuleBeforeGlossaryReference) {
        renderMlffModule = function renderMlffModuleWithReferenceGlossary() {
          if (state.mlffTab === "glossary") {
            const page = document.getElementById("page-mlff");
            if (page) page.innerHTML = renderReferencePage();
            return;
          }
          return renderMlffModuleBeforeGlossaryReference();
        };
        window.renderMlffModule = renderMlffModule;
      }
      if (!state.mlffGlossaryAlpha) state.mlffGlossaryAlpha = "全";
      document.addEventListener("click", (event) => {
        const methodDetail = event.target.closest("[data-mlff-method-detail]");
        if (methodDetail) {
          event.preventDefault();
          openMlffMethodDetail(methodDetail);
          return;
        }
        const alphaButton = event.target.closest("[data-mlff-alpha]");
        if (!alphaButton) return;
        state.mlffGlossaryAlpha = alphaButton.dataset.mlffAlpha;
        if (typeof renderMlffModule === "function") renderMlffModule();
      });
      if (state.page === "mlff" && state.mlffTab === "glossary" && typeof renderMlffModule === "function") renderMlffModule();
    })();
  