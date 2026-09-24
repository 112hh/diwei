
(() => {
  const previousRender = typeof renderMlffGlossaryPage === "function" ? renderMlffGlossaryPage : window.renderMlffGlossaryPage;
  const esc = (value) => typeof html === "function" ? html(String(value ?? "")) : String(value ?? "").replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
  const empty = (value) => {
    const text = String(value ?? "").trim();
    return text ? text : "/";
  };
  const requestedInitials = { "安全温度术语":"A", "单体/重复单元":"D", "单分子结构":"D", "单分子能量":"D", "多分子团簇结构":"D", "多分子相互作用能":"D", "多分子原子受力":"D", "多极矩":"D", "独立测试与迭代":"D", "二级结构":"E", "分子DOS":"F", "分子间色散作用":"F", "费米能级":"F", "费米面":"F", "共轭效应":"G", "极化率":"J", "简正模式":"J", "理论层级":"L", "链间氢键":"L", "链取向/折叠/排列":"L", "溶剂化自由能":"R", "色散系数":"S", "三级结构":"S", "双分子结构":"S", "双分子相互作用能":"S", "双分子原子受力":"S", "四级结构":"S", "态密度":"T", "拓扑/质子态/三肽/二硫键采样":"T", "训练/验证/测试":"X", "吸附能":"X", "相互作用能":"X", "小分子/链片段/蛋白及体系规模":"X", "一级结构":"Y", "原子电荷":"Y", "原子受力":"Y", "长短程分离框架与训练":"Z", "重复单元与肽键":"Z", "总能量":"Z" };
  const rows = [
    { letter:"A", cn:"安全温度术语", en:"Flash/fire/autoignition point", type:"/", unit:"/", desc:"闪点、持续燃烧的燃点和自燃温度分别保存，不能混用或用单一数值替代。", nullRule:"/", category:"/" },
    { letter:"D", cn:"单体/重复单元", en:"Monomer/repeat unit", type:"/", unit:"/", desc:"单体反应物不等于聚合后的连接单元；聚合度和端基单列。", nullRule:"/", category:"/" },
    { letter:"D", cn:"单分子结构", en:"monomer_geometry", type:"结构化对象/附件", unit:"本轮9个单点样例用于字段和格式联调；不是训练完成的高精度力场", desc:"1mer XYZ/PDB及带标签extxyz", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
    { letter:"D", cn:"单分子能量", en:"monomer_energy", type:"标量或结构化记录", unit:"本轮9个单点样例用于字段和格式联调；不是训练完成的高精度力场", desc:"真实单点总能，eV；未弛豫构型", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
    { letter:"D", cn:"多分子团簇结构", en:"cluster_geometry", type:"结构化对象/附件", unit:"本轮9个单点样例用于字段和格式联调；不是训练完成的高精度力场", desc:"3mer真实坐标，三分子团簇", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
    { letter:"D", cn:"多分子相互作用能", en:"cluster_interaction_energy", type:"标量或结构化记录", unit:"本轮9个单点样例用于字段和格式联调；不是训练完成的高精度力场", desc:"E3−3E1，同几何同方法", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
    { letter:"D", cn:"多分子原子受力", en:"cluster_forces", type:"结构化对象/附件", unit:"本轮9个单点样例用于字段和格式联调；不是训练完成的高精度力场", desc:"3mer逐原子Nx3受力，eV/Å", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
    { letter:"D", cn:"多极矩", en:"Multipole moments", type:"/", unit:"/", desc:"电荷、偶极、四极等；需明确原点、分量和单位。", nullRule:"/", category:"/" },
    { letter:"E", cn:"二级结构", en:"secondary_structure", type:"结构化对象/附件", unit:"结构证据，不包含量化能量与原子力", desc:"PDB HELIX/SHEET原始注释；转角/环未重新DSSP赋值", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
    { letter:"F", cn:"分子DOS", en:"Molecular density of states", type:"/", unit:"/", desc:"离散轨道经规定核函数数展宽的分布；保留展宽、权重和积分归一化。", nullRule:"/", category:"/" },
    { letter:"F", cn:"分子间色散作用", en:"intermolecular_dispersion", type:"标量或结构化记录", unit:"/", desc:"提供GFN2含色散总相互作用与C6系数；未独立提取色散能分量", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
    { letter:"F", cn:"费米能级", en:"Fermi level", type:"/", unit:"/", desc:"需能量参考零点；分子输出的Fermi参数不等价于金属费米面。", nullRule:"/", category:"/" },
    { letter:"F", cn:"费米面", en:"Fermi surface", type:"/", unit:"/", desc:"满足E_n(k)=E_F的k空间曲面，非单个能量值。", nullRule:"/", category:"/" },
    { letter:"G", cn:"共轭效应", en:"conjugation", type:"标量或结构化记录", unit:"/", desc:"PEO骨架非共轭；不适合承载共轭聚合物样例，另需聚噻吩等数据", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
    { letter:"J", cn:"极化率", en:"polarizability", type:"标量或结构化记录", unit:"本轮9个单点样例用于字段和格式联调；不是训练完成的高精度力场", desc:"原子与分子alpha(0)；D4模型系数，非实验张量。注明原子/分子、静态/动态、标量/张量及单位。", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
    { letter:"J", cn:"简正模式", en:"Normal modes", type:"/", unit:"/", desc:"非线性N原子有3N−6个振动模式；不保证每个模式都有IR强度。", nullRule:"/", category:"/" },
    { letter:"L", cn:"理论层级", en:"Level of theory", type:"/", unit:"/", desc:"GFN2−xTB半经验、PBE+MBD DFT、S22耦合簇基准互不等价。", nullRule:"/", category:"/" },
    { letter:"L", cn:"链间氢键", en:"interchain_hydrogen_bonds", type:"标量或结构化记录", unit:"需指定供体/受体、距离角度阈值，并计算标签", desc:"提供含OH端基和酰胺的真实结构；未将未筛选平移构型标为氢键数据集", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
    { letter:"L", cn:"链取向/折叠/排列", en:"chain_conformation", type:"标量或结构化记录", unit:"未覆盖长PEO链构象分布及多链熔体", desc:"实际单构象及平移组合；MD22提供32帧构象", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
    { letter:"R", cn:"溶剂化自由能", en:"Solvation free energy", type:"/", unit:"/", desc:"溶液与气相自由能差；溶剂、温度和标准态需一致。", nullRule:"/", category:"/" },
    { letter:"S", cn:"色散系数", en:"dispersion_coefficients", type:"标量或结构化记录", unit:"本轮9个单点样例用于字段和格式联调；不是训练完成的高精度力场", desc:"原子与分子C6AA，原子单位；保留方法。字段为C6、C8等色散参数，不是色散能或色散率。", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
    { letter:"S", cn:"三级结构", en:"tertiary_structure", type:"结构化对象/附件", unit:"结构证据，不包含量化能量与原子力", desc:"完整PDB原子坐标", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
    { letter:"S", cn:"双分子结构", en:"dimer_geometry", type:"结构化对象/附件", unit:"本轮9个单点样例用于字段和格式联调；不是训练完成的高精度力场", desc:"2mer实际坐标，两个冻结单体平移组合", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
    { letter:"S", cn:"双分子相互作用能", en:"dimer_interaction_energy", type:"标量或结构化记录", unit:"本轮9个单点样例用于字段和格式联调；不是训练完成的高精度力场", desc:"E2−2E1，同几何同方法；不冒充总能", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
    { letter:"S", cn:"双分子原子受力", en:"dimer_forces", type:"结构化对象/附件", unit:"本轮9个单点样例用于字段和格式联调；不是训练完成的高精度力场", desc:"2mer逐原子Nx3受力，eV/Å，F=−∇E", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
    { letter:"S", cn:"四级结构", en:"quaternary_structure", type:"结构化对象/附件", unit:"结构证据，不包含量化能量与原子力", desc:"4HHB α2β2四聚体；1UBQ单链不适用四级结构", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
    { letter:"T", cn:"态密度", en:"density_of_states", type:"标量或结构化记录", unit:"电子能带与能带合并同一字段；可用标记不能代替数组", desc:"Li3N有实际band/DOS图片；Li3PO4部分band图片；原始数组未取回", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
    { letter:"T", cn:"拓扑/质子态/三肽/二硫键采样", en:"protein_topology_sampling", type:"标量或结构化记录", unit:"PDB不是已配参MD拓扑；样例PDB不含SSBOND不代表所有蛋白无二硫键", desc:"MD22三肽32帧带DFT能量/力；1UBQ/4HHB PDB结构。全质子态和二硫键二肽集合待补", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
    { letter:"X", cn:"训练/验证/测试", en:"Train/validation/test", type:"/", unit:"/", desc:"训练更新参数，验证选模型，测试只作独立评估；避免轨迹邻帧泄漏。", nullRule:"/", category:"/" },
    { letter:"X", cn:"吸附能", en:"Adsorption energy", type:"/", unit:"/", desc:"表面+吸附物与分离参考体系能量差；不能从总能字段直接改名。", nullRule:"/", category:"/" },
    { letter:"X", cn:"相互作用能", en:"Interaction energy", type:"/", unit:"/", desc:"簇总能减相同几何孤立片段能之和；需明确是否含形变/BSSE。", nullRule:"/", category:"/" },
    { letter:"X", cn:"小分子/链片段/蛋白及体系规模", en:"system_classification", type:"标量或结构化记录", unit:"完整蛋白仅结构；不计为完整蛋白力场训练集", desc:"醚DME、酰胺Formamide、PEO n4各1/2/3mer；MD22三肽和PDB蛋白", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
    { letter:"Y", cn:"一级结构", en:"primary_structure", type:"结构化对象/附件", unit:"结构证据，不包含量化能量与原子力", desc:"PDB SEQRES链序列；1UBQ76残基", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
    { letter:"Y", cn:"原子电荷", en:"atomic_charges", type:"标量或结构化记录", unit:"本轮9个单点样例用于字段和格式联调；不是训练完成的高精度力场", desc:"实际GFN2-xTB逐原子电荷，净电荷校验。", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
    { letter:"Y", cn:"原子受力", en:"Atomic forces", type:"/", unit:"/", desc:"能量对原子坐标的负梯度；N×3。", nullRule:"/", category:"/" },
    { letter:"Z", cn:"长短程分离框架与训练", en:"long_short_range_training", type:"标量或结构化记录", unit:"需模型权重、数据版本、训练日志、精度与适用域", desc:"交付框架/损失/划分/验证设计；未训练或交付完整蛋白力场模型", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
    { letter:"Z", cn:"重复单元与肽键", en:"repeat_units_peptide_bonds", type:"标量或结构化记录", unit:"未构建覆盖所有残基/质子态的拓扑集合", desc:"PEO重复单元、OH端基n4片段与MD22封端三肽；肽链结构可下载", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" },
    { letter:"Z", cn:"总能量", en:"Total energy", type:"/", unit:"/", desc:"指定哈密顿量和构型的总能量；不同方法零点不可混用。", nullRule:"/", category:"/" },
    { letter:"D", cn:"独立测试与迭代", en:"protein_external_test", type:"标量或结构化记录", unit:"/", desc:"交付按分子/构象轨迹隔离的验收建议；缺实测误差与稳定性结果", nullRule:"null + status + missing_reason；不能使用0、虚构谱图或外观图替代", category:"机器学习力场" }
  ].map((item) => ({ ...item, letter:requestedInitials[item.cn] || item.letter, en:empty(item.en), type:empty(item.type), unit:empty(item.unit), desc:empty(item.desc), nullRule:empty(item.nullRule), category:empty(item.category) })).filter((item, index, list) => list.findIndex((candidate) => candidate.cn === item.cn) === index);
  const methodRows = [
    { id:"MLFF-D001", sampleData:"ML-001 水分子、ML-002 苯、ML-003 乙醇等单体能量样例", method:"DFT 单点静态结构计算", tool:"VASP", theory:"PBE+D3，PAW 赝势", sampling:"静态构型扫描", output:"OUTCAR、vasprun.xml", principle:"固定原子构型，不做离子弛豫，DFT 自洽求解电子结构直接得到单点能量。", analysis:"适合晶体缺陷、表面吸附和过渡态等高精度标注；覆盖离散构型，计算成本随体系规模快速上升。", system:"总能量、电子结构与势能面基准数据" },
    { id:"MLFF-D002", sampleData:"ML-013 聚乙二醇、ML-015 丙氨酸二肽等轨迹/受力样例", method:"AIMD 从头算分子动力学采样", tool:"CP2K", theory:"PBE-D3，DZVP 基组", sampling:"MD 时序采样", output:"MD 轨迹.xyz、ener/force 输出", principle:"在设定温度下随时间演化原子构型，每一步执行 DFT 电子求解，输出原子受力和能量。", analysis:"能提供连续温度轨迹和受力标签；相邻帧相关性强、计算成本高，高温下 SCF 收敛难度会上升。", system:"块体材料、熔体、溶液与柔性分子体系" },
    { id:"MLFF-D003", sampleData:"ML-017 MOF-5、ML-018 ZIF-8、ML-020 石墨烯等大体系样例", method:"DPGen 主动学习增强采样", tool:"PWmat + DPGen", theory:"PBE", sampling:"主动学习探索势能面", output:"MOVEMENT、extxyz", principle:"用临时 MLFF 探索势能面，识别预测误差大的未知构型，筛选后提交高精度 DFT 标注。", analysis:"能主动补齐高不确定性构型，适合多相、化学反应和相变；依赖初始模型质量，平衡态数据可能偏少。", system:"多相材料、化学反应与相变体系的能量/力/应力" },
    { id:"MLFF-D004", sampleData:"ML-001 至 ML-008 有机分子与小分子团簇样例", method:"公开 QM 数据集导入", tool:"ASE", theory:"ωB97M-D3(BJ)/def2-TZVPPD", sampling:"预采样数据集导入", output:"SPICE、extxyz", principle:"直接导入已由文献完成 QM 计算的公开数据集，复用标注好的构型、能量和力。", analysis:"复用成本低、适合快速建立基线；理论水平和收敛标准可能不统一，元素及电荷范围受数据集限制。", system:"有机分子、小分子团簇的坐标、能量与受力" },
    { id:"MLFF-D005", sampleData:"ML-013 聚乙二醇、ML-014 聚苯乙烯等凝聚相样例", method:"经典力场预采样 + QM 单点重计算", tool:"LAMMPS + VASP", theory:"PBE", sampling:"预采样 + 二次标注", output:"LAMMPS 轨迹、OUTCAR", principle:"先用经典力场快速生成候选结构，再挑选代表性构型运行高精度 DFT，得到能量和力标签。", analysis:"可低成本扩大构型覆盖，适合有机凝聚相和聚合物；经典力场会引入结构偏差，候选构型必须过滤。", system:"有机凝聚相、聚合物的候选结构与 QM 标签" }
  ].map((item) => ({
    ...item,
    calculationMethod: `${item.method}；${item.theory}；${item.sampling}`,
    software: `${item.tool}；输出：${item.output}`,
    explanation: item.principle
  }));
  const paginate = (items, page) => {
    const pageSize = 3;
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const currentPage = Math.min(Math.max(1, Number(page) || 1), totalPages);
    return { currentPage, totalPages, items:items.slice((currentPage - 1) * pageSize, currentPage * pageSize) };
  };
  const renderPagination = (currentPage, totalPages, attribute) => `<div class="mlff-pagination" data-mlff-pagination="${attribute}"${attribute === "method" ? ' data-mlff-method-pagination="true"' : ""}><button type="button" data-mlff-page="${attribute}" data-page-value="${currentPage - 1}"${currentPage <= 1 ? " disabled" : ""}>上一页</button>${Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => `<button type="button" class="${page === currentPage ? "active" : ""}" data-mlff-page="${attribute}" data-page-value="${page}">${page}</button>`).join("")}<button type="button" data-mlff-page="${attribute}" data-page-value="${currentPage + 1}"${currentPage >= totalPages ? " disabled" : ""}>下一页</button><span>第 ${currentPage}/${totalPages} 页</span></div>`;
  function renderRequestedDefinitions() {
    const keyword = String(state.mlffTermKeyword || "").trim().toLowerCase();
    const alpha = state.mlffGlossaryAlpha || "全";
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").concat("全");
    const filtered = rows.filter((item) => (alpha === "全" || item.letter === alpha) && (!keyword || `${item.cn} ${item.en} ${item.type} ${item.unit} ${item.desc} ${item.nullRule} ${item.category}`.toLowerCase().includes(keyword)));
    const sorted = filtered.slice().sort((a, b) => a.letter.localeCompare(b.letter) || a.cn.localeCompare(b.cn, "zh-Hans-CN"));
    const pageData = paginate(sorted, state.mlffDefinitionPage);
    return `
      <section class="mlff-search-panel"><div class="mlff-search-title-row"><div class="mlff-search-title"><span>⌕</span><span>术语检索</span></div><button class="mlff-reset-link" type="button" data-mlff-glossary-reset>⟳ 重置条件</button></div><div class="mlff-search-line"><label class="mlff-search-input"><span>⌕</span><input value="${esc(state.mlffTermKeyword || "")}" placeholder="输入字段中文、字段英文、类型或规则进行检索" data-mlff-glossary-keyword></label><div class="mlff-search-controls"><button class="mlff-search-submit" type="button" data-mlff-glossary-search>⌕　检索</button></div></div></section>
      <section class="mlff-alpha-panel"><div class="mlff-alpha-title"><strong>A↕</strong><span>汉字拼音首字母索引</span><small>点击字母快速筛选字段</small></div><div class="mlff-alpha-list">${letters.map((letter) => `<button class="mlff-alpha-btn${alpha === letter ? " active" : ""}" type="button" data-mlff-alpha="${letter}">${letter}</button>`).join("")}</div></section>
      <section class="mlff-list-section"><div class="mlff-list-heading"><h3>参数数据定义列表 <span>共 ${sorted.length} 条</span></h3><div class="mlff-list-sort">排序方式：<strong>汉字首字母</strong></div></div><div class="mlff-definition-table-wrap"><table class="mlff-definition-table"><thead><tr><th>字段中文</th><th>字段英文</th><th>类型</th><th>推荐单位/条件</th><th>定义与使用限制/规则</th><th>空值规则</th><th>适用类别</th></tr></thead><tbody>${pageData.items.map((item) => `<tr><td>${esc(item.cn)}</td><td>${esc(item.en)}</td><td>${esc(item.type)}</td><td>${esc(item.unit)}</td><td>${esc(item.desc)}</td><td>${esc(item.nullRule)}</td><td>${esc(item.category)}</td></tr>`).join("") || `<tr><td colspan="7" class="opto-table-empty">暂无匹配术语</td></tr>`}</tbody></table></div>${renderPagination(pageData.currentPage, pageData.totalPages, "definition")}</section>`;
  }
  function renderRequestedMethods() {
    const keyword = String(state.mlffTermKeyword || "").trim().toLowerCase();
    const filtered = methodRows.filter((item) => !keyword || `${item.sampleData} ${item.method} ${item.tool} ${item.principle} ${item.analysis} ${item.system}`.toLowerCase().includes(keyword));
    const pageData = paginate(filtered, state.mlffMethodPage);
    return `<section class="mlff-search-panel"><div class="mlff-search-title-row"><div class="mlff-search-title"><span>⌕</span><span>获取方法检索</span></div><button class="mlff-reset-link" type="button" data-mlff-glossary-reset>⟳ 重置条件</button></div><div class="mlff-search-line"><label class="mlff-search-input"><span>⌕</span><input value="${esc(state.mlffTermKeyword || "")}" placeholder="输入适用数据、计算方法或软件进行检索" data-mlff-glossary-method-keyword></label><div class="mlff-search-controls"><button class="mlff-search-submit" type="button" data-mlff-glossary-search>⌕　检索</button></div></div></section><section class="mlff-list-section"><div class="mlff-list-heading"><h3>数据获取方法列表 <span>共 ${filtered.length} 条</span></h3><div class="mlff-list-sort">每页 3 条</div></div><div class="mlff-definition-table-wrap"><table class="mlff-definition-table mlff-method-table"><thead><tr><th>适用数据</th><th>计算方法</th><th>软件/程序</th><th>简要解释</th><th>分析</th></tr></thead><tbody>${pageData.items.map((item) => `<tr><td>${esc(item.sampleData)}</td><td>${esc(item.calculationMethod)}</td><td>${esc(item.software)}</td><td>${esc(item.explanation)}</td><td>${esc(item.analysis)}</td></tr>`).join("") || `<tr><td colspan="5" class="opto-table-empty">暂无匹配方法</td></tr>`}</tbody></table></div>${renderPagination(pageData.currentPage, pageData.totalPages, "method")}</section>`;
  }
  function renderRequestedGlossaryPage() {
    const definition = state.mlffGlossaryTab !== "method";
    return `<div class="mlff-glossary-page"><section class="mlff-glossary-frame"><header class="mlff-glossary-header"><div class="mlff-glossary-heading"><div class="mlff-glossary-book">▣</div><div><h2 class="mlff-glossary-page-title">机器学习力场数据术语表</h2><p>统一查询参数数据定义与数据获取方法，辅助理解机器学习力场数据差异</p></div></div><div class="mlff-glossary-head-actions"><button class="mlff-glossary-head-btn" type="button" data-mlff-glossary-back>返回列表</button></div></header><nav class="mlff-glossary-tabs"><button class="mlff-glossary-tab${definition ? " active" : ""}" type="button" data-mlff-glossary-page-tab="definition">参数数据定义表</button><button class="mlff-glossary-tab${!definition ? " active" : ""}" type="button" data-mlff-glossary-page-tab="method">数据获取方法表</button></nav><div class="mlff-glossary-content"><section class="mlff-notice"><div class="mlff-notice-main"><div class="mlff-notice-icon">◇</div><div><strong>本术语表仅限深圳市低维材料数据库认证用户使用</strong><small>您已通过认证，可正常访问全部术语数据</small></div></div><div class="mlff-certified">已认证</div></section>${definition ? renderRequestedDefinitions() : renderRequestedMethods()}</div></section></div>`;
  }
  window.renderMlffGlossaryPage = renderRequestedGlossaryPage;
  try { renderMlffGlossaryPage = renderRequestedGlossaryPage; } catch (error) {}
  const previousModule = typeof renderMlffModule === "function" ? renderMlffModule : window.renderMlffModule;
  if (previousModule) {
    renderMlffModule = function renderMlffModuleWithRequestedDefinitionTable() {
      if (state.mlffTab === "glossary") {
        const page = document.getElementById("page-mlff");
        if (page) page.innerHTML = renderRequestedGlossaryPage();
        return;
      }
      return previousModule();
    };
    window.renderMlffModule = renderMlffModule;
  }
  if (!state.mlffGlossaryAlpha) state.mlffGlossaryAlpha = "全";
  state.mlffDefinitionPage = state.mlffDefinitionPage || 1;
  state.mlffMethodPage = state.mlffMethodPage || 1;
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mlff-page]");
    if (!button || button.disabled) return;
    const target = button.dataset.mlffPage;
    if (target === "definition") state.mlffDefinitionPage = Number(button.dataset.pageValue) || 1;
    if (target === "method") state.mlffMethodPage = Number(button.dataset.pageValue) || 1;
    if (typeof renderMlffModule === "function") renderMlffModule();
  });
})();
