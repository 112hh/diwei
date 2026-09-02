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
    await page.locator('#page-electrolyte [data-ely-category="solidInorganic"]').click();

    const list = page.locator('#page-electrolyte');
    const listText = await list.innerText();
    for (const label of ['英文名称', '分子式/化学式', 'CAS号', '结构种类细分', '密度']) assert.ok(listText.includes(label), `固态无机电解质列表应包含${label}`);
    assert.equal(listText.includes('英文简称'), false, '固态无机电解质列表不应显示英文简称');
    assert.equal(listText.includes('形成能'), false, '固态无机电解质列表不应显示形成能');
    assert.equal(listText.includes('化学式</th>'), false, '固态无机电解质列表不应显示旧字段化学式');

    await list.getByRole('button', { name: '查看详情' }).first().click();
    const detail = page.locator('#page-twod-detail');
    const menuText = await page.locator('#twodDetailTree').innerText();
    assert.equal(menuText.includes('相关体系推荐'), false, '详情菜单不应包含相关体系推荐');
    assert.ok(menuText.includes('基础信息') && menuText.includes('图谱数据') && menuText.includes('计算信息'), '详情菜单应保留基础、图谱、计算信息');

    let detailText = await detail.innerText();
    for (const label of ['材料编号', '中文名称', '英文名称', '分子式/化学式', 'CAS号', '结构种类细分', '密度', '晶体结构示意', '空间群/点群', '晶胞棱长', '晶胞尺寸', '对称性/晶系', '结构文件']) assert.ok(detailText.includes(label), `基础信息应包含${label}`);
    assert.equal(await detail.locator('.twod-detail-page-head button').count(), 0, '基础信息右上角不应有下载按钮');
    assert.ok(await detail.locator('.twod-detail-visual-card').count() >= 1, '基础信息应展示晶体结构图');
    const structureCard = detail.locator('.twod-detail-visual-card').first();
    assert.ok(await structureCard.locator('text=结构文件').count() > 0, '结构文件应放在晶体结构示意图下方');
    assert.ok(await structureCard.locator('.electrolyte-structure-file-name').count() === 1, '应展示结构文件名称');
    assert.ok(await structureCard.locator('.electrolyte-structure-file-format').count() === 1, '应展示结构文件格式');
    assert.ok(await structureCard.getByRole('button', { name: '下载结构文件' }).count() === 1, '应提供下载结构文件按钮');
    assert.equal(await structureCard.locator('pre').count(), 0, '结构图下方不应展示结构文件正文');

    await page.locator('#twodDetailTree .twod-tree-node', { hasText: '计算信息' }).click();
    detailText = await detail.innerText();
    for (const label of ['形成能', '费米能级']) assert.equal(detailText.includes(label), false, `计算信息不应显示${label}`);

    await page.locator('#twodDetailTree .twod-tree-node', { hasText: '图谱数据' }).click();
    detailText = await detail.innerText();
    for (const label of ['能带结构', '态密度', '电子能带结构', 'X射线衍射谱图', 'X射线吸收谱图']) assert.ok(detailText.includes(label), `图谱信息应包含${label}`);
    console.log('固态无机电解质列表与详情验收通过');
  } finally { await browser.close(); }
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });




