const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  try {
    await page.goto(pathToFileURL(path.resolve(__dirname, '..', 'low-dim-materials.html')).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      state.isAuthenticated = true;
      syncAuthView();
      openCatalystDetailPage(catalystMaterials[0].id);
      openCatalystDetailSection('external');
    });

    const detail = page.locator('#page-twod-detail');
    assert.equal(await detail.getByText('选择催化材料', { exact: true }).count(), 0, '催化材料数据共享不应显示选择催化材料卡片');
    assert.equal(await detail.getByRole('button', { name: '开始数据上传', exact: true }).count(), 0, '催化材料数据共享不应显示开始数据上传按钮');
    const importButton = detail.getByRole('button', { name: '催化材料数据导入', exact: true });
    assert.equal(await importButton.count(), 1, '应保留右上角催化材料数据导入按钮');
    await importButton.click();
    await page.waitForTimeout(100);
    assert.equal(await page.locator('#page-data-submit.active').count(), 1, '点击催化材料数据导入后应打开数据管理-数据上传页面');
    assert.ok((await page.locator('#page-data-submit').innerText()).includes('数据上传'), '数据上传页面应显示页面标题');    console.log('催化材料数据共享入口验收通过');
  } finally { await browser.close(); }
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });

