const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto(pathToFileURL(path.resolve(__dirname, '..', 'low-dim-materials.html')).href, { waitUntil: 'networkidle' });
    await page.getByText('管理员', { exact: true }).click();
    await page.getByRole('button', { name: '统一身份认证登录' }).click();
    await page.locator('.nav-btn[data-page="opto"]:visible').click();
    await page.locator('#page-opto button', { hasText: '查看详情' }).first().click();
    await page.waitForTimeout(100);
    const detailText = await page.locator('#page-twod-detail').innerText();
    for (const label of ['应用类型', '数据来源', '更新时间']) {
      assert.equal(detailText.includes(label), false, `有机光电详情不应显示${label}`);
    }

    await page.locator('.nav-btn[data-page="mlff"]:visible').click();
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: '机器学习力场数据术语表' }).click();
    await page.waitForTimeout(100);
    await page.locator('#page-mlff [data-mlff-glossary-page-tab="method"]').click();
    await page.waitForTimeout(100);
    const methodButton = page.locator('#page-mlff .mlff-method-card button', { hasText: '查看详情' }).first();
    assert.equal(await methodButton.count(), 1, '机器学习力场方法卡片应有查看详情按钮');
    await methodButton.click();
    await page.waitForTimeout(100);
    assert.ok(await page.locator('#mlffMethodDetailModal:visible').count() === 1 || await page.locator('#mlffGlossaryModal:visible').count() === 1, '点击查看详情后应打开详情内容');
    assert.ok((await page.locator('body').innerText()).includes('方法说明'), '详情内容应包含方法说明');
    assert.deepEqual(errors, [], `页面运行不应出现错误：${errors.join(' | ')}`);
    console.log('有机光电详情字段与机器学习力场查看详情交互验证通过');
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });
