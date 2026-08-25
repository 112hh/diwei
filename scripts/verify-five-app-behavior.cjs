const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const pageFile = path.resolve(__dirname, '..', 'low-dim-materials.html');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  const browserErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  page.on('pageerror', (error) => browserErrors.push(error.message));
  try {
    await page.goto(pathToFileURL(pageFile).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => handleLoginSubmit({ preventDefault() {} }));
    await page.waitForTimeout(300);

    // A mode change must update the result sentence to the selected condition.
    await page.locator('.nav-btn[data-page="opto"]').evaluate((button) => button.click());
    await page.locator('#page-opto [data-opto-mode="formula"]').evaluate((button) => button.click());
    await page.waitForTimeout(250);
    const optoHint = await page.locator('#page-opto .twod-result-count').first().textContent();
    assert.match(optoHint.trim(), /^已按“分子式检索”检索到\d+条匹配结果。$/);

    // Long list content is physically shortened to ten characters and exposes the full value on hover.
    const longCell = page.locator('#page-opto .twod-result-table tbody td[data-full-text]').filter({ hasNot: page.locator('button, a') }).filter({ hasText: /\.\.\.$/ }).first();
    const longCellReport = await longCell.evaluate((cell) => ({
      text: cell.textContent.trim(),
      title: cell.title,
      fullText: cell.dataset.fullText
    }));
    assert.ok(Array.from(longCellReport.text.replace(/\.\.\.$/, '')).length <= 10, 'visible text should be limited to ten characters');
    assert.equal(longCellReport.title, longCellReport.fullText, 'hover title should expose the complete value');

    // All three electrolyte categories use one-line property search and a fixed right-side action group.
    await page.locator('.nav-btn[data-page="electrolyte"]').evaluate((button) => button.click());
    for (const category of ['organicLiquid', 'solidOrganic', 'solidInorganic']) {
      await page.locator(`#page-electrolyte [data-ely-category="${category}"]`).evaluate((button) => button.click());
      await page.locator('#page-electrolyte [data-ely-mode="property"]').evaluate((button) => button.click());
      await page.waitForTimeout(180);
      const layout = await page.locator('#page-electrolyte .twod-property-panel').evaluate((panel) => {
        const condition = panel.querySelector('.electrolyte-inline-query-shell');
        const actions = panel.querySelector('.electrolyte-property-actions');
        const search = panel.querySelector('[data-ely-apply]');
        const clear = panel.querySelector('[data-ely-reset]');
        const pr = panel.getBoundingClientRect();
        const cr = condition.getBoundingClientRect();
        const ar = actions.getBoundingClientRect();
        return {
          display: getComputedStyle(panel).display,
          columns: getComputedStyle(panel).gridTemplateColumns,
          sameRow: Math.abs(cr.bottom - ar.bottom) < 8,
          actionsAtRight: ar.right <= pr.right + 1 && ar.left > cr.left,
          searchOrder: Number(getComputedStyle(search).order),
          clearOrder: Number(getComputedStyle(clear).order),
          searchWhiteSpace: getComputedStyle(search).whiteSpace,
          clearWhiteSpace: getComputedStyle(clear).whiteSpace
        };
      });
      assert.equal(layout.display, 'grid', `${category}: property search should use grid alignment`);
      assert.equal(layout.sameRow, true, `${category}: conditions and actions should share one row`);
      assert.equal(layout.actionsAtRight, true, `${category}: action group should stay at the right edge`);
      assert.ok(layout.searchOrder < layout.clearOrder, `${category}: search should precede clear`);
      assert.equal(layout.searchWhiteSpace, 'nowrap');
      assert.equal(layout.clearWhiteSpace, 'nowrap');
    }

    assert.deepEqual(browserErrors, [], `browser should not report errors: ${browserErrors.join(' | ')}`);
    console.log('检索条件动态提示、长文本悬浮和电解质性质检索布局验证通过');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});

