
(() => {
  const safe = (value) => typeof html === 'function' ? html(value ?? '—') : String(value ?? '—');
  const text = (value, fallback = '未记录') => value === undefined || value === null || value === '' ? fallback : String(value);
  const tags = ['单原子催化剂数据集', '二元合金数据集', '晶界数据集'];
  const defaultRoute = ['(1) CO₂(g) + * → *CO₂(δ−)', '(2) *CO₂ + H⁺ + e⁻ → *COOH', '(3) *COOH + H⁺ + e⁻ → *CO + H₂O', '(4) *CO → CO(g) + *'];
  const datasetTags = (material) => {
    const raw = material?.datasetTags || material?.classificationTags || material?.catalystDataset || [];
    const values = Array.isArray(raw) ? raw : String(raw).split(/[,，、|]/).filter(Boolean);
    const inferred = values.length ? values : (material?.catalystCategory || '').includes('单原子') ? [tags[0]] : (material?.catalystCategory || '').includes('合金') ? [tags[1]] : (material?.catalystCategory || '').includes('晶界') ? [tags[2]] : [tags[0]];
    return [...new Set(inferred)].filter((item) => tags.includes(item));
  };
  const route = (material) => material?.reactionPath || material?.reactionRoute || material?.routeInfo || defaultRoute;
  const routeMarkup = (material) => `<div class="catalyst-route-preview">${(Array.isArray(route(material)) ? route(material) : String(route(material)).split(/\n|；/)).map((item) => `<span>${safe(item)}</span>`).join('')}</div>`;
  const featureItem = (label, value) => `<div class="catalyst-feature-item"><span>${safe(label)}</span><strong>${safe(text(value))}</strong></div>`;
  const rowValue = (material, keys, fallback = '未记录') => { for (const key of keys) if (material?.[key] !== undefined && material?.[key] !== null && material[key] !== '') return material[key]; return fallback; };
  const activeTag = (material) => datasetTags(material)[0];
  const featureRows = (material, key) => {
    const element = [
      ['周期数', rowValue(material, ['period','periodNumber'])], ['族数', rowValue(material, ['group','groupNumber'])], ['元素电荷', rowValue(material, ['elementCharge','charge'])], ['相对原子质量', rowValue(material, ['relativeAtomicMass','atomicMass'])], ['原子半径', rowValue(material, ['atomicRadius'])], ['价电子数量', rowValue(material, ['valenceElectrons'])], ['p轨道或d轨道电子数', rowValue(material, ['pOrDElectrons','dElectrons','pElectrons'])], ['第一电离能', rowValue(material, ['firstIonizationEnergy','ionizationEnergy'])], ['电子亲和势', rowValue(material, ['electronAffinity'])], ['电负性', rowValue(material, ['electronegativity'])], ['d带中心', rowValue(material, ['dBandCenter'])]
    ];
    const structure = [['形貌结构图', rowValue(material, ['morphology','morphologyDescription'], '保留右侧 3D 晶体结构图')], ['原子位置坐标', rowValue(material, ['atomicCoordinates','coordinates'])], ['空间群', rowValue(material, ['spaceGroup'])], ['所属点群', rowValue(material, ['pointGroup'])], ['活性位点配位数', rowValue(material, ['activeSiteCoordination','coordinationNumber'])], ['对称性函数', rowValue(material, ['symmetryFunction'])], ['其他结构特征描述符', rowValue(material, ['otherStructureDescriptors','structureFeature'])]];
    const system = [['费米面位置', rowValue(material, ['fermiSurfacePosition','fermiSurface'])], ['掺杂形成能', rowValue(material, ['dopingFormationEnergy','formationEnergy'])], ['费米能级', rowValue(material, ['fermiLevel','fermiEnergy'])], ['体系磁矩', rowValue(material, ['systemMagneticMoment','magneticMoment','chargeTransfer'])], ['催化反应-中间产物', rowValue(material, ['catalyticReactionIntermediate','intermediate'])], ['反应路径信息（基本步骤）', route(material).join ? route(material).join('；') : route(material)], ['催化性能-完整反应方程', rowValue(material, ['fullReactionEquation','reactionEquation'], 'CO₂(g) + 2H⁺ + 2e⁻ → CO(g) + H₂O')]];
    return key === 'structure' ? structure : key === 'system' ? system : element;
  };

  window.renderCatalystPlatformRows = function renderCatalystPlatformRowsRequest(list) {
    if (!list.length) return '<tr><td colspan="13" class="opto-table-empty">未检索到符合条件的催化材料数据，请调整检索条件后重试。</td></tr>';
    const start = ((state.catalystPage || 1) - 1) * (state.catalystPageSize || 5);
    return list.map((item,index) => `<tr>
      <td>${start + index + 1}</td><td>${safe(item.id)}</td>
      <td title="${safe(item.name)}"><button class="twod-material-link" type="button" data-open-material="catalyst:${safe(item.id)}" data-material-view="basic">${safe(item.name)}</button></td>
      <td>${safe(item.formula)}</td><td><div class="catalyst-dataset-tags">${datasetTags(item).map((tag) => `<span class="catalyst-dataset-tag">${safe(tag)}</span>`).join('')}</div></td>
      <td>${safe(item.composition || (item.elements || []).join(', '))}</td><td>${safe(item.intermediate)}</td><td>${safe(item.structureFeature || item.systemFeature || item.atomicStructure || '/')}</td>
      <td>${safe(item.surface || item.surfaceParameter)}</td><td>${typeof renderCatalystDatasetSource === 'function' ? renderCatalystDatasetSource(item) : safe(item.dataSource)}</td>
      <td>${safe(item.activationEnergy ? `${Number(item.activationEnergy).toFixed(2)} eV` : '—')}</td><td>${routeMarkup(item)}</td>
      <td><div class="twod-record-inline-actions"><button class="twod-action-view" type="button" data-open-material="catalyst:${safe(item.id)}" data-material-view="basic">查看详情</button><button class="twod-record-link" type="button" data-open-material="catalyst:${safe(item.id)}" data-material-view="prediction">发起预测</button></div></td>
    </tr>`).join('');
  };

  const oldBasic = window.renderCatalystDetailBasicPage;
  window.renderCatalystDetailBasicPage = function renderCatalystDetailBasicPageRequest(material) {
    const active = state.catalystFeatureTab || 'element';
    const realViewer = typeof renderLowDimRealViewer === 'function' ? renderLowDimRealViewer('catalyst', material) : '';
    const rows = featureRows(material, active === 'structure' ? 'structure' : active === 'system' ? 'system' : 'element');
    const leadTag = activeTag(material) || tags[0];
    const tagHtml = `<span class="catalyst-dataset-tag active">${safe(leadTag)}</span>`;
    const grid = rows.map(([label,value]) => featureItem(label,value)).join('');
    return `<div class="twod-detail-page-head"><div><h4>${safe(material.name)} · 基础信息</h4><p>按数据集分类查看催化材料的元素、结构与体系特征。</p></div></div>
      <div class="catalyst-feature-bar"><div class="catalyst-feature-tabs" role="tablist"><button class="catalyst-feature-tab${active==='element'?' active':''}" type="button" data-catalyst-feature-tab="element">元素特征数据</button><button class="catalyst-feature-tab${active==='structure'?' active':''}" type="button" data-catalyst-feature-tab="structure">结构特征数据</button><button class="catalyst-feature-tab${active==='system'?' active':''}" type="button" data-catalyst-feature-tab="system">体系特征数据</button></div><div class="catalyst-dataset-tags catalyst-dataset-tags-inline">${tagHtml}</div></div>
      <div class="catalyst-feature-shell"><section class="catalyst-feature-card"><h5>${active==='element'?'元素特征数据':active==='structure'?'结构特征数据':'体系特征数据'}</h5><div class="catalyst-feature-list">${grid}</div>${active==='system' ? `<div style="margin-top:14px"><h5>反应路径信息</h5>${routeMarkup(material)}</div>` : ''}<div style="margin-top:14px"><button class="catalyst-poscar-download" type="button" data-catalyst-poscar-download="${safe(material.id)}">⇩ POSCAR下载</button></div></section>
      <aside class="catalyst-feature-side"><section class="twod-detail-visual-card"><h5>3D晶体结构</h5><div class="catalyst-detail-stage">${realViewer || '<div id="catalystVisualMainCanvas"></div>'}</div><p class="chart-caption">保留 3D 结构查看、旋转与缩放能力。</p></section></aside></div>`;
  };
  if (typeof window.renderCatalystDetailBasicPage !== 'function' && oldBasic) window.renderCatalystDetailBasicPage = oldBasic;

  const guideDocs = [{name:'Materials Studio 建模操作文档',size:'2.4 MB'},{name:'VESTA 晶体结构可视化指南',size:'1.8 MB'},{name:'VASP CO₂还原计算指南',size:'3.6 MB'},{name:'催化反应路径数据填写规范',size:'860 KB'}];
  const downloadBlob = (name, content) => { const blob = new Blob([content],{type:'text/plain;charset=utf-8'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),500); };
  window.showCatalystGuideDocs = () => { const modal=document.getElementById('catalystGuideDocsModal') || document.createElement('div'); modal.id='catalystGuideDocsModal'; modal.className='modal-backdrop'; modal.innerHTML=`<div class="modal modal-lg"><div class="modal-header"><div><h3>材料信息计算文档</h3><p>选择需要的操作文档下载。</p></div><button class="modal-close" data-catalyst-close-docs>×</button></div><div class="modal-body"><div class="catalyst-doc-modal-list">${guideDocs.map((doc)=>`<div class="catalyst-doc-row"><strong>${safe(doc.name)}</strong><span>${safe(doc.size)}</span><button class="btn-link" type="button" data-catalyst-doc-download="${safe(doc.name)}">下载</button></div>`).join('')}</div></div></div>`; if(!modal.parentElement) document.body.appendChild(modal); modal.hidden=false; };
  window.renderCatalystExternalInfoPage = function renderCatalystExternalInfoPageRequest(material) { return `<div class="twod-detail-page-head"><div><h4>催化材料数据共享</h4><p>关联外部数据，并通过统一入口导入新的催化材料数据。</p></div><button class="btn-primary" type="button" data-catalyst-open-upload data-catalyst-share-upload onclick="return MarvisRouter.go(&#39;page-data-submit&#39;)">催化材料数据导入</button></div><div class="twod-detail-tabs"><button class="twod-detail-tab active" type="button">外部信息关联</button><button class="twod-detail-tab" type="button" data-catalyst-guide-tab>用户引导</button></div><div class="catalyst-feature-card" style="margin-top:16px"><h5>关联数据库</h5><div class="catalyst-feature-list"><div class="catalyst-feature-item"><span>Materials Project</span><strong>对比材料结构与基础性质信息</strong></div><div class="catalyst-feature-item"><span>Catalysis-Hub</span><strong>查询催化吸附与反应路径数据</strong></div><div class="catalyst-feature-item"><span>OQMD</span><strong>对比结构稳定性与材料组成</strong></div></div></div>`; };
  document.addEventListener('click', (event) => {
    const feature = event.target.closest('[data-catalyst-feature-tab]'); if(feature){ state.catalystFeatureTab=feature.dataset.catalystFeatureTab; const material=typeof findCatalystMaterial==='function'?findCatalystMaterial(state.selectedCatalystId):null; if(material && typeof renderCatalystDetailPage==='function') renderCatalystDetailPage(material); }
    const poscar=event.target.closest('[data-catalyst-poscar-download]'); if(poscar && typeof triggerCatalystDetailDownload==='function') triggerCatalystDetailDownload();
    const guide=event.target.closest('[data-catalyst-guide-tab]'); if(guide){ showCatalystGuideDocs(); }
    const close=event.target.closest('[data-catalyst-close-docs]'); if(close){ const modal=document.getElementById('catalystGuideDocsModal'); if(modal) modal.hidden=true; }
    const doc=event.target.closest('[data-catalyst-doc-download]'); if(doc) downloadBlob(doc.dataset.catalystDocDownload, `催化材料操作文档\n\n${doc.dataset.catalystDocDownload}\n下载日期：2026-09-02`);
    if(event.target.closest('[data-catalyst-template-download]')) downloadBlob('催化材料计算输入文件模板.txt','POSCAR\n# 计算输入文件模板\nENCUT = 450\nISMEAR = 0\n');
  });
  document.addEventListener('DOMContentLoaded',()=>{ if(typeof state!=='undefined') state.catalystFeatureTab ||= 'element'; });
})();
