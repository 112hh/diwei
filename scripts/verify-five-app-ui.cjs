const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const pageFile = path.resolve(__dirname, '..', 'low-dim-materials.html');
const modules = ['twod', 'electrolyte', 'opto', 'mlff', 'catalyst'];

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  try {
    await page.goto(pathToFileURL(pageFile).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => handleLoginSubmit({ preventDefault() {} }));
    await page.waitForTimeout(350);
    for (const moduleId of modules) {
      await page.locator(`.nav-btn[data-page="${moduleId}"]`).evaluate((button) => button.click());
      await page.waitForTimeout(250);
      const root = page.locator(`#page-${moduleId}`);
      const report = await root.evaluate((root) => {
        const resultHint = root.querySelector('.twod-result-count, .electrolyte-status-count');
        const search = root.querySelector('#twodSearchBtn, [data-ely-apply], [data-opto-apply], [data-mlff-apply], [data-catalyst-platform-apply]');
        const clear = root.querySelector('#twodClearBtn, [data-ely-reset], [data-opto-reset], [data-mlff-reset], [data-catalyst-platform-reset]');
        const action = root.querySelector('.twod-result-table tbody .twod-record-inline-actions, .twod-result-table tbody td:last-child');
        const textCell = root.querySelector('.twod-result-table tbody td');
        const style = (node) => node ? getComputedStyle(node) : null;
        return {
          hintText: resultHint?.textContent?.trim() || '',
          hasSearch: !!search,
          hasClear: !!clear,
          searchWhiteSpace: style(search)?.whiteSpace || '',
          clearWhiteSpace: style(clear)?.whiteSpace || '',
          actionWhiteSpace: style(action)?.whiteSpace || '',
          cellWhiteSpace: style(textCell)?.whiteSpace || '',
          cellTextOverflow: style(textCell)?.textOverflow || '',
          cellOverflow: style(textCell)?.overflow || ''
        };
      });
      assert.equal(report.hasSearch, true, `${moduleId}: should expose search button`);
      assert.equal(report.hasClear, true, `${moduleId}: should expose clear button`);
      assert.match(report.hintText, /已按“.*”检索到\s*\d+\s*条匹配结果|未检索到匹配结果/, `${moduleId}: result hint should use unified search wording`);
      assert.equal(report.searchWhiteSpace, 'nowrap', `${moduleId}: search button should stay on one line`);
      assert.equal(report.clearWhiteSpace, 'nowrap', `${moduleId}: clear button should stay on one line`);
      assert.equal(report.actionWhiteSpace, 'nowrap', `${moduleId}: action cell should stay on one line`);
      assert.equal(report.cellWhiteSpace, 'nowrap', `${moduleId}: table cells should stay on one line`);
      assert.equal(report.cellTextOverflow, 'ellipsis', `${moduleId}: long table text should ellipsize`);
      assert.equal(report.cellOverflow, 'hidden', `${moduleId}: long table text should be clipped`);
    }
    console.log('统一五模块检索与列表展示验证通过');
  } finally { await browser.close(); }
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });












