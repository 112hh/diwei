const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const pageFile = path.resolve(__dirname, '..', 'low-dim-materials.html');
const modules = ['electrolyte', 'opto', 'mlff', 'catalyst'];

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
    await page.waitForTimeout(350);

    for (const moduleId of modules) {
      await page.locator(`.nav-btn[data-page="${moduleId}"]`).click();
      await page.waitForTimeout(250);
      const report = await page.locator(`#page-${moduleId}`).evaluate((root) => {
        const style = (selector) => {
          const node = root.querySelector(selector);
          return node ? getComputedStyle(node) : null;
        };
        const rect = (selector) => {
          const node = root.querySelector(selector);
          return node ? node.getBoundingClientRect() : null;
        };
        const action = root.querySelector('.twod-result-table tbody .twod-record-inline-actions button') || root.querySelector('.twod-result-table tbody button, .twod-result-table tbody a');
        const actionStyle = action ? getComputedStyle(action) : null;
        return {
          pageHeadDisplay: style('.page-head')?.display,
          shellGap: style('.twod-platform-shell')?.gap,
          platformRadius: style('.twod-search-platform')?.borderRadius,
          platformPaddingTop: style('.twod-search-platform')?.paddingTop,
          moduleTabHeight: Math.round(rect('.module-tab-btn')?.height || 0),
          modeButtonHeight: Math.round(rect('.twod-mode-btn.active')?.height || 0),
          tableCellPaddingTop: style('.twod-result-table tbody td')?.paddingTop,
          actionBackground: actionStyle?.backgroundColor,
          actionBorderTopWidth: actionStyle?.borderTopWidth,
          actionColor: actionStyle?.color
        };
      });
      assert.ok(report.pageHeadDisplay === undefined || report.pageHeadDisplay === 'none', `${moduleId}: 不应显示重复的大标题说明区`);
      assert.equal(report.shellGap, '12px', `${moduleId}: 检索区和结果区间距应压缩为 12px`);
      assert.equal(report.platformRadius, '4px', `${moduleId}: 检索卡片应使用参考图的 4px 圆角`);
      assert.equal(report.platformPaddingTop, '14px', `${moduleId}: 检索卡片顶部内边距应为 14px`);
      assert.equal(report.moduleTabHeight, 40, `${moduleId}: 顶部模块按钮应统一为 40px`);
      assert.equal(report.modeButtonHeight, 40, `${moduleId}: 检索方式按钮应统一为 40px`);
      assert.equal(report.tableCellPaddingTop, '13px', `${moduleId}: 表格行应使用紧凑间距`);
      if (report.actionColor) {
        assert.equal(report.actionBackground, 'rgba(0, 0, 0, 0)', `${moduleId}: 表格操作项应为文字按钮`);
        assert.equal(report.actionBorderTopWidth, '0px', `${moduleId}: 表格操作项不应有按钮边框`);
        assert.ok(['rgb(31, 99, 255)', 'rgb(30, 136, 229)'].includes(report.actionColor), `${moduleId}: 表格操作项应使用统一蓝色`);
      }
    }
    console.log('四个低维材料应用页面统一紧凑布局验证通过');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});

