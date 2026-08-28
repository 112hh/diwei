const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const pageFile = path.resolve(__dirname, '..', 'low-dim-materials.html');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto(pathToFileURL(pageFile).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => handleLoginSubmit({ preventDefault() {} }));

    const twodHeaders = await page.locator('#page-twod .twod-result-table th.missing-field-red').allTextContents();
    assert.deepEqual(twodHeaders, ['密度', '晶胞体积', '元素组成', '数据来源'], '二维材料指定列表表头应标红');

    await page.evaluate(() => {
      const material = electrolyteMaterials.find((item) => item.electrolyteCategory === 'solidInorganic');
      openElectrolyteDetailPage(`electrolyte:${material.id}`, 'basic');
    });
    await page.waitForTimeout(100);
    const electrolyteRed = await page.locator('#page-twod-detail .missing-field-red').allTextContents();
    assert.ok(electrolyteRed.some((text) => text.trim() === '晶系'), '电解质详情的晶系应标红');
    assert.ok(electrolyteRed.some((text) => text.trim() === '晶胞参数'), '电解质详情的晶胞参数应标红');
    assert.ok(electrolyteRed.some((text) => text.trim() === '空间群'), '电解质详情的空间群应标红');

    await page.evaluate(() => openElectrolyteDetailSection('external'));
    await page.waitForTimeout(100);
    const externalHead = await page.locator('.electrolyte-same-composition-results thead th').allTextContents();
    assert.deepEqual(externalHead, ['材料名称', '化学式', '元素组成', '结构类型', '空间群', '参考文献', '操作'], '外部关联结果表列应符合要求');
    assert.deepEqual(await page.locator('.electrolyte-same-composition-results button').allTextContents(), ['下载', '下载', '下载'], '外部关联操作列只应提供下载');
    const contentHeadings = await page.locator('#twodDetailPageContent > .twod-detail-section-card > h5').allTextContents();
    assert.equal(contentHeadings[0].trim(), '同元素不同结构材料检索结果', '同元素不同结构结果应排在最上方');

    await page.evaluate(() => {
      const material = optoMaterials[0];
      openOptoDetailPage(`opto:${material.id}`, 'detail');
    });
    await page.waitForTimeout(100);
    const optoRed = await page.locator('#page-twod-detail .missing-field-red').allTextContents();
    for (const label of ['相对分子质量', 'CAS 号', 'InChIKey', 'SMILES', '类别 Family', '含杂原子 / 检索命中']) {
      assert.ok(optoRed.some((text) => text.trim() === label), `有机光电详情的${label}应标红`);
    }
    assert.equal(await page.locator('#page-twod-detail .detail-kv-label', { hasText: '数据来源' }).count(), 0, '有机光电详情不应显示数据来源');

    await page.evaluate(() => openOptoDetailSection('spectra'));
    await page.waitForTimeout(100);
    const spectraRed = await page.locator('#page-twod-detail .twod-detail-chart-card h5.missing-field-red').allTextContents();
    assert.deepEqual(spectraRed, ['红外光谱', '拉曼光谱', '核磁共振光谱'], '有机光电表征图谱字段应全部标红');
    assert.deepEqual(errors, [], `页面运行不应出现错误：${errors.join(' | ')}`);
    console.log('缺失字段页面改造交互验证通过');
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });

