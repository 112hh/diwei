const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1200 } });

  try {
    await page.goto(pathToFileURL('C:\\Users\\Windows\\Desktop\\diwei\\low-dim-materials.html').href, {
      waitUntil: 'networkidle'
    });
    await page.getByText('管理员', { exact: true }).click();
    await page.getByRole('button', { name: '统一身份认证登录' }).click();
    await page.locator('.sidebar-group[data-group="ingest"] [data-group-toggle]').click();
    await page.locator('.nav-btn[data-page="lowdim-ingest-twod"]:visible').click();
    await page.getByRole('button', { name: '创建任务', exact: true }).click();

    await page.locator('[data-twod-wizard-field="name"]').fill('批量资源录入任务');
    await page.locator('[data-twod-wizard-field="description"]').fill('验证批量上传文件区域。');
    await page.getByRole('button', { name: '进入下一步', exact: true }).click();
    await page.getByRole('button', { name: '进入采集方式', exact: true }).click();
    await page.getByRole('button', { name: '进入下一步', exact: true }).click();

    const root = page.locator('#page-lowdim-ingest-twod');
    await root.getByText('批量录入', { exact: true }).click();
    assert.ok(await root.getByText('批量上传文件', { exact: true }).count() === 1, '选择批量录入后应展示批量上传文件区域');
    assert.ok(await root.locator('[data-twod-entry-batch-file]').count() === 1, '批量录入区域应包含文件选择控件');
    assert.ok(await root.getByText('支持 Excel、CSV 或 JSON 文件', { exact: false }).count() >= 1, '批量录入区域应说明支持的文件类型');
    assert.ok(await root.getByText('解析字段预览', { exact: true }).count() === 1, '批量录入区域应展示解析字段预览');

    await root.locator('[data-twod-entry-batch-file]').setInputFiles({
      name: 'twod-literature-import.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('材料名称,数据字段,数值,单位\nMoS2,带隙 Eg,1.80,eV')
    });
    assert.ok(await root.getByText('twod-literature-import.csv', { exact: true }).count() === 1, '上传后应展示文件名');
    assert.ok(await root.getByText('CSV', { exact: true }).count() >= 1, '上传后应展示文件类型');
    assert.ok(await root.getByText('待解析', { exact: true }).count() === 1, '上传后应展示待解析状态');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
