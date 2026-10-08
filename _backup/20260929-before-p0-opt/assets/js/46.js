
(() => {
  const esc = (v) => typeof html === 'function' ? html(v ?? '') : String(v ?? '');
  const docs = [
    ['Materials Studio 建模操作文档','2.4 MB'],
    ['VESTA 晶体结构可视化指南','1.8 MB'],
    ['VASP CO₂还原计算指南','3.6 MB'],
    ['催化反应路径数据填写规范','860 KB']
  ];
  const docsMarkup = () => `<section class="twod-detail-section-card"><div class="catalyst-guide-layout"><div class="catalyst-guide-card"><h5>材料结构建模引导</h5><p>选择建模软件并按步骤完成结构创建，导出 CIF / POSCAR 后上传。</p><div class="catalyst-guide-actions"><a class="btn-primary" href="https://www.3ds.com/products/biovia/materials-studio" target="_blank" rel="noreferrer">访问建模软件</a><button class="btn" type="button" data-catalyst-model-doc>下载操作文档</button></div></div><div class="catalyst-guide-card"><h5>材料信息计算引导</h5><p>根据计算任务选择第一性原理、分子动力学或机器学习势工具，完成计算后导入结果。</p><div class="catalyst-guide-actions"><button class="btn" type="button" data-catalyst-guide-docs>查看全部文档</button><button class="btn-primary" type="button" data-catalyst-template-download>计算输入文件模板</button></div></div></div></section>`;
  const oldGuide = window.renderCatalystGuideTab;
  window.renderCatalystGuideTab = function renderCatalystGuideTabRequest(){ return docsMarkup(); };
  const oldShare = window.renderCatalystExternalInfoPage;
  window.renderCatalystExternalInfoPage = function renderCatalystExternalInfoPageRequestV2(material){
    const active = state.catalystShareTab || 'external';
    if(active === 'guide') return `<div class="twod-detail-page-head"><div><h4>用户引导</h4><p>从结构建模到计算结果导入，按步骤完成催化材料数据准备。</p></div></div><div class="twod-detail-tabs"><button class="twod-detail-tab" type="button" onclick="return switchCatalystShareTab('external')">外部信息关联</button><button class="twod-detail-tab active" type="button">用户引导</button></div>${docsMarkup()}`;
    return `<div class="twod-detail-page-head"><div><h4>催化材料数据共享</h4><p>关联外部数据，并通过统一入口导入新的催化材料数据。</p></div><button class="btn-primary" type="button" data-catalyst-open-upload data-catalyst-share-upload onclick="return MarvisRouter.go(&#39;page-data-submit&#39;)">催化材料数据导入</button></div><div class="twod-detail-tabs"><button class="twod-detail-tab active" type="button">外部信息关联</button><button class="twod-detail-tab" type="button" onclick="return switchCatalystShareTab('guide')">用户引导</button></div><div class="catalyst-feature-card" style="margin-top:16px"><h5>关联数据库</h5><div class="catalyst-feature-list"><div class="catalyst-feature-item"><span>Materials Project</span><strong>对比材料结构与基础性质信息</strong></div><div class="catalyst-feature-item"><span>Catalysis-Hub</span><strong>查询催化吸附与反应路径数据</strong></div><div class="catalyst-feature-item"><span>OQMD</span><strong>对比结构稳定性与材料组成</strong></div></div></div>`;
  };
  const download = (name, content) => { const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'})); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),600); };
  document.addEventListener('click',(e)=>{
    if(e.target.closest('[data-catalyst-guide-docs]')) showCatalystGuideDocs();
    if(e.target.closest('[data-catalyst-model-doc]')) download('材料结构建模操作文档.txt','材料结构建模操作文档\n\n1. 选择建模软件\n2. 创建晶胞与表面\n3. 导出 CIF / POSCAR\n');
    if(e.target.closest('[data-catalyst-template-download]')) download('催化材料计算输入文件模板.txt','POSCAR\n# 催化材料计算输入文件模板\nENCUT = 450\nISMEAR = 0\nEDIFF = 1E-5\n');
  });
})();
