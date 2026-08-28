const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const pageFile = path.resolve(__dirname, '..', 'low-dim-materials.html');
const html = fs.readFileSync(pageFile, 'utf8');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  try {
    assert.equal(/(?:全结构检索|子结构检索|模糊结构检索)[（(][^)）]*[）)]/.test(html), false, '结构检索名称不应保留括号说明');
    assert.equal(html.includes('准确匹配'), false, '所有检索条件应使用“准确检索”');
    assert.equal(html.includes('模糊匹配'), false, '所有检索条件应使用“模糊检索”');

    await page.goto(pathToFileURL(pageFile).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => handleLoginSubmit({ preventDefault() {} }));

    for (const source of ['twod', 'electrolyte', 'opto', 'mlff', 'catalyst']) {
      await page.locator(`.nav-btn[data-page="${source}"]`).click();
      const trigger = page.locator(`[data-open-material^="${source}:"][data-material-view="prediction"]`).first();
      await trigger.click();
      const body = page.locator('#predictionTaskModalBody');
      assert.deepEqual(await body.locator('.prediction-task-material-table th').allTextContents(), ['材料 ID', '化学名称', '化学式'], `${source} 的预测材料表仅应展示三项材料信息`);
      assert.equal(await body.locator('[data-prediction-remove-material]').count(), 0, `${source} 的预测材料表不应显示移除操作`);
      assert.equal(await body.locator('.prediction-task-algorithm-selection').count(), 1, `${source} 的算法与子算法应组成同一个选择区`);
      assert.equal(await body.locator('.prediction-task-algorithm-selection [data-prediction-algorithm-type]').count(), 1, `${source} 应保留算法选择`);
      assert.ok(await body.locator('.prediction-task-algorithm-selection [data-prediction-subalgorithm]').count() >= 1, `${source} 应在算法旁展示子算法`);
      await page.locator('#predictionTaskModal .modal-close').click();
    }

    const materialId = 'demo-2d-012';
    await page.evaluate((id) => handleMaterialDetailOpen(`twod:${id}`, 'visualization'), materialId);
    const detail = page.locator('#page-twod-detail');
    assert.equal(await detail.locator('.twod-visual-empty-chart').count(), 1, '无数据示例应保留空白图表区域');
    assert.equal((await detail.locator('.twod-visual-empty-message').textContent()).trim(), '该材料暂无此内容', '空图表区域下应展示无内容提示');

    await page.locator('.nav-btn[data-page="mlff"]').click();
    await page.locator('[data-mlff-glossary-page]').click();
    const glossaryCards = page.locator('#page-mlff .mlff-definition-card');
    const initials = await glossaryCards.locator('.mlff-term-letter').allTextContents();
    assert.deepEqual(initials.slice(0, 6), ['B', 'D', 'E', 'F', 'F', 'J'], '参数数据定义表应按汉字拼音首字母排序');
    assert.equal(await page.locator('#page-mlff .mlff-alpha-title span').textContent(), '汉字拼音首字母索引', '索引标题应明确为拼音首字母');

    console.log('2026-08-27 页面改造验证通过');
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });
