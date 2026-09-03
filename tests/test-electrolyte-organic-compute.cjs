const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const runtimeErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  try {
    await page.goto(pathToFileURL(path.resolve(__dirname, '..', 'low-dim-materials.html')).href, { waitUntil: 'networkidle' });
    await page.getByText('管理员', { exact: true }).click();
    await page.getByRole('button', { name: '统一身份认证登录' }).click();
    await page.locator('.nav-btn[data-page="electrolyte"]:visible').click();
    await page.locator('#page-electrolyte [data-ely-category="organicLiquid"]').click();

    const targetRow = page.locator('#page-electrolyte tr').filter({ hasText: '哌嗪腈醇溶剂' });
    assert.equal(await targetRow.count(), 1, '有机电解液列表应包含目标候选分子');
    await targetRow.getByRole('button', { name: '查看详情' }).click();
    await page.locator('#page-twod-detail .twod-tree-node', { hasText: '计算信息' }).click();

    const panel = page.locator('#twodDetailPageContent');
    const rows = await panel.locator('.detail-kv-item').evaluateAll((items) => items.map((item) => ({
      label: item.querySelector('.detail-kv-label')?.textContent.trim(),
      value: item.querySelector('.detail-kv-value')?.textContent.trim()
    })));

    assert.deepEqual(rows, [
      { label: 'HOMO', value: '/' },
      { label: 'LUMO', value: '/' },
      { label: '电荷分布', value: '/' },
      { label: '偶极矩', value: '10 D' },
      { label: '溶解剂自由能', value: '10 kJ/mol' },
      { label: '吸附能', value: '0.3 eV' },
      { label: '生成焓', value: '101 kJ/mol' }
    ]);
    assert.equal(await panel.locator('.twod-detail-section-card').count(), 1, '计算信息应沿用系统详情卡片规范');
    assert.deepEqual(runtimeErrors, [], '页面不应出现脚本运行错误');
    console.log('有机电解液计算信息验证通过');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
