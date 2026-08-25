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
    const report = await page.evaluate(() => {
      const root = document.querySelector('#page-twod');
      const box = (node) => node ? node.getBoundingClientRect() : null;
      const style = (node) => node ? getComputedStyle(node) : null;
      const actions = Array.from(root?.querySelectorAll('.twod-mode-stage .btn, .twod-mode-stage .btn-primary') || []);
      return { modeCssHeight: style(root?.querySelector('.twod-mode-btn.active'))?.height, modeCssMinHeight: style(root?.querySelector('.twod-mode-btn.active'))?.minHeight, moduleCssHeight: style(root?.querySelector('.module-tab-btn'))?.height, pageScale: getComputedStyle(document.querySelector('.app')).transform, pageHeadDisplay: style(root?.querySelector('.page-head'))?.display, moduleTabHeight: Math.round(box(root?.querySelector('.module-tab-btn'))?.height || 0), modeButtonHeight: Math.round(box(root?.querySelector('.twod-mode-btn.active'))?.height || 0), mainShellHeight: Math.round(box(document.querySelector('.main-shell'))?.height || 0), actionHeights: actions.map((button) => Math.round(box(button)?.height || 0)) };
    });
    assert.equal(report.pageHeadDisplay, 'none', '二维材料页不应显示冗余的标题说明区');
    assert.equal(report.moduleTabHeight, 40, '模块标签应使用 40px 的统一操作高度');
    assert.equal(report.modeButtonHeight, 40, '检索方式标签应使用 40px 的统一操作高度');
    assert.ok(report.mainShellHeight < 420, '未查询时页面不应保留大面积无效空白');
    assert.ok(report.actionHeights.every((height) => height === 40), '检索区操作按钮应统一为 40px 高');
    await page.locator('#page-twod .twod-mode-stage .btn-primary').click();
    await page.waitForTimeout(300);
    assert.ok(await page.locator('#page-twod #twodBaseTableBody tr').count() > 0, '执行检索后应保留现有结果表格内容');
    console.log('二维材料页面紧凑布局验证通过');
  } finally { await browser.close(); }
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });

