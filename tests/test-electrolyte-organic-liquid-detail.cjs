const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  try {
    await page.goto(pathToFileURL(path.resolve(__dirname, '..', 'low-dim-materials.html')).href, { waitUntil: 'networkidle' });
    await page.getByText('管理员', { exact: true }).click();
    await page.getByRole('button', { name: '统一身份认证登录' }).click();
    await page.locator('.nav-btn[data-page="electrolyte"]:visible').click();
    await page.locator('#page-electrolyte [data-ely-category="organicLiquid"]').click();
    const listText = await page.locator('#page-electrolyte').innerText();
    for (const label of ['英文名称', '分子式/化学式', '分子编号/CAS号', '结构种类细分', '分子量', '性状-外观颜色', '性状-形状', '性状-味觉', '性状-嗅觉', '燃点', '闪点']) assert.ok(listText.includes(label), `有机电解液列表应包含${label}`);
    assert.equal(listText.includes('安全等级'), false, '有机电解液列表不应显示安全等级');

    await page.locator('#page-electrolyte button', { hasText: '查看详情' }).first().click();
    const tabs = page.locator('#page-twod-detail [data-organic-liquid-info-tab]');
    assert.equal(await tabs.count(), 3, '有机电解液基础信息卡片应有三个页签');
    assert.equal(await page.locator('#page-twod-detail [data-organic-liquid-info-tab="basic"].active').count(), 1, '默认应展示基础信息');
    const sideMenuText = await page.locator('#twodDetailTree').innerText();
    assert.equal(sideMenuText.includes('物性信息'), false, '物性信息不应作为左侧详情导航项');
    assert.equal(sideMenuText.includes('安全信息'), false, '安全信息不应作为左侧详情导航项');

    let detailText = await page.locator('#page-twod-detail').innerText();
    for (const label of ['材料编号', '中文名称', '英文名称', '分子式/化学式', '分子编号/CAS号', '结构种类细分', '分子量', '三维结构图']) assert.ok(detailText.includes(label), `基础信息应包含${label}`);
    assert.equal(await page.locator('#page-twod-detail .twod-detail-visual-card').count(), 1, '三维结构图应保持显示');
    assert.equal(await page.locator('#page-twod-detail .twod-detail-page-head button', { hasText: '结构文件下载' }).count(), 1, '结构文件下载按钮应保持在页面顶部');

    await page.locator('#page-twod-detail [data-organic-liquid-info-tab="property"]').click();
    detailText = await page.locator('#page-twod-detail').innerText();
    for (const label of ["性状-外观颜色", "性状-形状", "性状-味觉", "性状-嗅觉", "熔点", "沸点", "相对密度", "闪点", "燃点", "溶解性（水溶性）", "折射率", "黏度", "介电常数", "比热容", "热导率", "电导率"]) assert.ok(detailText.includes(label), "物性页应包含" + label);

    await page.locator('#page-twod-detail [data-organic-liquid-info-tab="safety"]').click();
    detailText = await page.locator('#page-twod-detail').innerText();
    for (const label of ['毒理学数据', '生态毒性', '安全标识']) assert.ok(detailText.includes(label), `安全页应包含${label}`);

    await page.locator('#page-twod-detail .twod-tree-node', { hasText: '计算信息' }).click();
    detailText = await page.locator('#page-twod-detail').innerText();
    for (const label of ['HOMO', 'LUMO', '电荷分布', '偶极矩', '溶解剂自由能', '吸附能', '生成焓']) assert.equal(detailText.includes(label), true, `计算信息应显示${label}`);
    console.log('有机电解液内嵌信息页签验证通过');
  } finally { await browser.close(); }
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });
