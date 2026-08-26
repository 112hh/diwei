const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  try {
    await page.goto(pathToFileURL(path.resolve(__dirname, '..', 'low-dim-materials.html')).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => handleLoginSubmit({ preventDefault() {} }));
    await page.locator('.nav-btn[data-page="mlff"]').click();
    await page.waitForTimeout(250);

    await page.locator('[data-mlff-mode="name"]').click();
    assert.equal(await page.locator('#page-mlff [data-mlff-name-match-mode]').count(), 1, '化学名称检索应有匹配方式下拉框');
    assert.deepEqual(await page.locator('#page-mlff [data-mlff-name-match-mode] option').allTextContents(), ['准确检索', '模糊检索']);

    await page.locator('[data-mlff-mode="formula"]').click();
    assert.equal(await page.locator('#page-mlff [data-mlff-formula-match-mode]').count(), 1, '分子式检索应有结构匹配方式下拉框');
    assert.deepEqual(await page.locator('#page-mlff [data-mlff-formula-match-mode] option').allTextContents(), ['全结构检索', '子结构检索', '模糊结构检索']);

    await page.locator('[data-module-tab="mlff"][data-module-target="convert"]').click();
    await page.waitForTimeout(150);
    assert.equal(await page.locator('#page-mlff .material-convert-shell').count(), 1, 'MLFF 文件转换应使用统一转换面板'); assert.ok((await page.locator('#page-mlff').innerText()).includes('机器学习力场文件转换'), '文件转换页面应有内容');

    await page.locator('[data-module-tab="mlff"][data-module-target="search"]').click();
    await page.waitForTimeout(150);
    const fieldUpdate = page.locator('#page-mlff [data-mlff-field-update]').first();
    await fieldUpdate.click();
    await page.waitForTimeout(150);
    assert.equal(await page.locator('#page-data-submit').isVisible(), true, '场数据更新应进入数据上传页面');
    assert.equal(await page.locator('#page-mlff .mlff-field-update-page').count(), 0, '不应再展示旧场数据更新页面');
    assert.equal(await page.locator('#page-data-submit .twod-filter-chip.active').textContent(), '机器学习力场');

    console.log('机器学习力场应用改造验证通过');
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });

