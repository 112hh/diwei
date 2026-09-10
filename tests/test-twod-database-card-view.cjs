const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const pageFile = path.resolve(__dirname, '..', 'low-dim-materials.html');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });

  try {
    await page.goto(pathToFileURL(pageFile).href, { waitUntil: 'networkidle' });
    await page.getByText('普通用户', { exact: true }).click();
    await page.getByRole('button', { name: '统一身份认证登录' }).click();
    await page.waitForTimeout(300);
    await page.evaluate(() => setUserRole('admin'));
    await page.evaluate(() => switchPage('lowdim-database-twod'));
    await page.waitForTimeout(300);

    const root = page.locator('#page-lowdim-database-twod');
    assert.ok(await root.locator('.twod-db-card').count() > 0, '二维材料数据库应以卡片形式展示');
    assert.equal(await root.locator('.twod-db-table').count(), 0, '二维材料数据库不应继续展示表格');
    assert.equal(await root.locator('[data-twod-db-dataset-add]').count(), 0, '二维材料数据库不应显示新增数据集按钮');
    assert.ok(await root.locator('[data-twod-db-updated]').count() > 0, '卡片应展示更新时间');
    assert.ok(await root.locator('[data-twod-db-size]').count() > 0, '卡片应展示数据大小');
    await root.locator('[data-twod-db-dataset-view]').first().click();
    await page.waitForTimeout(150);
    assert.equal(await page.locator('#twodDatabaseDatasetDetailModal').evaluate((node) => !node.hidden), true, '查看详情应打开详情弹窗');
    assert.ok(await page.locator('#twodDatabaseDatasetDetailBody').getByText('原子结构图').count() > 0, '详情应展示数据集字段');
    assert.ok(await page.locator('#twodDatabaseDatasetDetailBody').getByText('数据大小').count() > 0, '详情应展示数据大小');
    console.log('二维材料数据库卡片布局与详情验证通过');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
