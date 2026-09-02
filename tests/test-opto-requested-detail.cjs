const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto(pathToFileURL(path.resolve(__dirname, '..', 'low-dim-materials.html')).href, { waitUntil: 'networkidle' });
    await page.getByText('管理员', { exact: true }).click();
    await page.getByRole('button', { name: '统一身份认证登录' }).click();
    await page.locator('.nav-btn[data-page="opto"]:visible').click();
    await page.waitForTimeout(150);

    const headerText = await page.locator('#page-opto .twod-result-table thead').innerText();
    for (const label of ['中文名称', '分子式/化学式', '分子编号/CAS号', '分子量', '相对密度', '熔点', '沸点', '闪点']) assert.ok(headerText.includes(label), `列表应展示字段：${label}`);
    assert.equal(headerText.includes('材料简称'), false, '列表不应继续显示“材料简称”');
    assert.equal(headerText.includes('完整名称'), false, '列表不应继续显示“完整名称”');

    await page.locator('#page-opto .twod-action-view').first().click();
    await page.waitForSelector('#page-twod-detail.active');
    await page.waitForTimeout(150);

    const navText = await page.locator('#twodDetailTree').innerText();
    for (const label of ['基础信息', '表征图谱', '特征参数', '外部数据关联']) assert.ok(navText.includes(label), `详情菜单应包含：${label}`);
    assert.equal(navText.includes('结构描述符'), false, '详情菜单中应删除结构描述符');

    const basic = page.locator('#page-twod-detail [data-opto-detail-page="basic"]');
    assert.equal(await basic.count(), 1, '应渲染有机光电详情信息页面');
    const basicText = await basic.innerText();
    for (const label of ['中文名称', '英文名称', '分子式/化学式', '材料编号', '分子编号', 'CAS号', '分子量']) assert.ok(basicText.includes(label), `基础信息应展示：${label}`);
    assert.equal(basicText.includes('结构描述符'), false, '详情信息中应删除结构描述符');
    for (const label of ['结构文件下载', '基态结构文件下载', '激发态结构文件下载']) assert.ok(basicText.includes(label), `结构图下方应包含：${label}`);

    await page.locator('#twodDetailTree [data-opto-detail-nav="spectra"]').click();
    const spectraText = await page.locator('#page-twod-detail [data-opto-detail-page="spectra"]').innerText();
    for (const label of ['中文名称', '英文名称', '分子式/化学式', '材料编号', '分子编号', 'CAS号', '分子量', '红外光谱', '拉曼光谱', '核磁共振光谱']) assert.ok(spectraText.includes(label), `表征图谱页面应展示：${label}`);

    await page.locator('#twodDetailTree [data-opto-detail-nav="params"]').click();
    const paramsText = await page.locator('#page-twod-detail [data-opto-detail-page="params"]').innerText();
    for (const label of ['中文名称', '英文名称', '分子式/化学式', '材料编号', '分子编号', 'CAS号', '分子量', '相对密度', '熔点', '沸点', '闪点', '激发能', '放射能', '跃迁偶极矩', 'HOMO能级', 'LUMO能级', '溶剂化自由能', '斯托克斯位移', '简正模式']) assert.ok(paramsText.includes(label), `特征参数页面应展示：${label}`);

    await page.locator('#twodDetailTree [data-opto-detail-nav="external"]').click();
    const externalText = await page.locator('#page-twod-detail [data-opto-detail-page="external"]').innerText();
    for (const label of ['关联类型', '外部平台名称', '标识编号', '跳转链接', '来源备注', '文献论文', '图书馆论文检索系统', '外部化学数据库', 'PubChem', '打开链接']) assert.ok(externalText.includes(label), `外部数据关联页面应展示：${label}`);

    assert.deepEqual(errors, [], `页面运行不应出现错误：${errors.join(' | ')}`);
    console.log('有机光电材料列表与四类详情页面验证通过');
  } finally { await browser.close(); }
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });
