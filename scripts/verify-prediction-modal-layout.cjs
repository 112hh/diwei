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
    for (const source of ['twod', 'electrolyte', 'opto', 'mlff', 'catalyst']) {
      await page.locator(`.nav-btn[data-page="${source}"]`).click();
      await page.waitForTimeout(250);
      const button = page.locator(`[data-open-material^="${source}:"][data-material-view="prediction"]`).first();
      assert.equal(await button.count(), 1, `未找到 ${source} 模块的发起预测按钮`);
      await button.click();
      await page.waitForTimeout(120);
      assert.equal(await page.locator('#predictionTaskModal.show').count(), 1, `${source} 应打开发起预测弹窗`);
      const modal = page.locator('#predictionTaskModal .modal');
      assert.equal(await modal.evaluate((node) => node.classList.contains('prediction-task-modal')), true, `${source} 弹窗应使用专属布局类`);
      const body = page.locator('#predictionTaskModalBody');
      assert.equal(await body.locator('.prediction-task-overview').count(), 1, `${source} 应有任务概览区`);
      assert.equal(await body.locator('.prediction-task-section').count(), 4, `${source} 应有四个分组区块`);
      assert.deepEqual(await body.locator('.prediction-task-material-table th').allTextContents(), ['材料 ID', '化学名称', '化学式'], `${source} 的材料表应仅展示材料 ID、化学名称和化学式`);
      assert.equal(await body.locator('.prediction-task-algorithm-selection').count(), 1, `${source} 的算法与子算法应使用同一选择区`);
      assert.equal(await body.locator('.prediction-task-algorithm-selection [data-prediction-algorithm-type]').count(), 1, `${source} 应保留算法选择`);
      assert.ok(await body.locator('.prediction-task-algorithm-selection [data-prediction-subalgorithm]').count() >= 1, `${source} 应展示对应子算法`);
      await page.locator('#predictionTaskModal .modal-close').click();
    }
    console.log('发起预测弹窗布局验证通过');
  } finally { await browser.close(); }
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });
