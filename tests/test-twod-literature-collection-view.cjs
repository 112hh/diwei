const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1400 } });

  try {
    await page.goto(pathToFileURL('C:\\Users\\Windows\\Desktop\\diwei\\low-dim-materials.html').href, {
      waitUntil: 'networkidle'
    });
    await page.getByText('管理员', { exact: true }).click();
    await page.getByRole('button', { name: '统一身份认证登录' }).click();
    await page.locator('.sidebar-group[data-group="ingest"] [data-group-toggle]').click();
    await page.locator('.nav-btn[data-page="lowdim-ingest-twod"]:visible').click();
    await page.getByRole('button', { name: '创建任务', exact: true }).click();

    await page.locator('[data-twod-wizard-field="name"]').fill('文献数据采集任务');
    await page.locator('[data-twod-wizard-field="description"]').fill('验证文献 DOI 并录入二维材料性质数据。');
    await page.getByRole('button', { name: '进入下一步', exact: true }).click();
    await page.getByRole('button', { name: '进入采集方式', exact: true }).click();
    await page.getByText('文献数据采集', { exact: true }).click();

    const root = page.locator('#page-lowdim-ingest-twod');
    for (const label of ['选择数据采集方式', '文献检索与验证', '结构化数据录入', '填写注意事项']) {
      assert.ok(await root.getByText(label, { exact: true }).count() > 0, `页面应展示 ${label}`);
    }
    assert.ok(await root.locator('[data-twod-task-doi]').count() === 1, '页面应展示 DOI 输入框');
    assert.ok(await root.getByRole('button', { name: '验证 DOI', exact: true }).count() === 1, '页面应展示验证 DOI 按钮');
    assert.ok(await root.getByText('已添加文献列表', { exact: true }).count() === 1, '页面应展示文献列表');
    assert.ok(await root.getByText('数据来源', { exact: true }).count() > 0, '结构化数据表应展示数据来源字段');
    assert.ok(await root.getByRole('button', { name: '批量导入', exact: true }).count() === 1, '页面应展示批量导入按钮');

    await root.locator('[data-twod-task-doi]').fill('10.1021/acs.nanolett.5b01234');
    await root.getByRole('button', { name: '验证 DOI', exact: true }).click();
    assert.ok(await root.getByText('DOI 验证通过，文献元数据已成功提取', { exact: true }).count() === 1, '验证后应展示成功状态');
    assert.ok(await root.getByText('Atomically Thin MoS₂: A New Direct-Gap Semiconductor', { exact: true }).count() >= 1, '验证后应展示文献标题');
    assert.ok(await root.getByText('已添加 3 篇文献', { exact: true }).count() === 1, '验证后应更新文献数量');

    const rowCount = await root.locator('[data-twod-literature-row]').count();
    await root.getByRole('button', { name: '添加数据行', exact: true }).click();
    assert.equal(await root.locator('[data-twod-literature-row]').count(), rowCount + 1, '添加数据行应增加一行');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
