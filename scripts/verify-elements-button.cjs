const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const pageFile = path.resolve(__dirname, '..', 'low-dim-materials.html');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  try {
    await page.goto(pathToFileURL(pageFile).href, { waitUntil: 'networkidle' });
    await page.getByText('普通用户', { exact: true }).click();
    await page.getByRole('button', { name: '统一身份认证登录' }).click();
    await page.waitForTimeout(350);

    const size = async (selector) => page.locator(selector).evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return { width: Math.round(rect.width), height: Math.round(rect.height) };
    });

    const formulaSearch = await size('#twodSearchBtn');
    await page.locator('#page-twod .twod-mode-btn[data-twod-mode="elements"]').click();
    await page.waitForTimeout(100);
    const elementsSearch = await size('#twodElementSearchBtn');
    const elementsClear = await size('#twodClearBtn');
    const actionGap = await page.evaluate(() => {
      const search = document.querySelector('#twodElementSearchBtn').getBoundingClientRect();
      const clear = document.querySelector('#twodClearBtn').getBoundingClientRect();
      return Math.round(clear.left - search.right);
    });

    assert.deepEqual(elementsSearch, formulaSearch, '元素组成检索按钮应与化学式检索按钮保持相同尺寸');
    assert.equal(elementsSearch.height, elementsClear.height, '元素组成检索的操作按钮应保持相同高度');
    assert.ok(actionGap <= 4, '元素组成检索操作按钮间距应不大于 4px，当前为 ' + actionGap + 'px');
    console.log('元素组成检索按钮尺寸验证通过');
  } finally { await browser.close(); }
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });

