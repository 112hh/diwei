const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1000 } });

  try {
    await page.goto(pathToFileURL('C:\\Users\\Windows\\Desktop\\diwei\\low-dim-materials.html').href, {
      waitUntil: 'networkidle'
    });
    await page.getByText('管理员', { exact: true }).click();
    await page.getByRole('button', { name: '统一身份认证登录' }).click();
    await page.locator('.sidebar-group[data-group="ingest"] [data-group-toggle]').click();
    await page.locator('.nav-btn[data-page="lowdim-ingest-twod"]:visible').click();
    await page.waitForTimeout(150);

    const pageRoot = page.locator('#page-lowdim-ingest-twod');
    assert.equal(await pageRoot.locator('input[aria-label="搜索任务名称或ID"]').count(), 0, '任务列表页不应显示搜索任务输入框');
    assert.equal(await pageRoot.getByRole('button', { name: '筛选', exact: true }).count(), 0, '任务列表页不应显示筛选按钮');
    assert.equal(await pageRoot.getByRole('button', { name: '创建任务', exact: true }).count(), 1, '任务列表页应保留创建任务按钮');
    assert.ok(await pageRoot.locator('table tbody tr').count() > 0, '任务列表页应保留任务数据表');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
