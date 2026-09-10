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

    await page.locator('[data-twod-wizard-field="name"]').fill('VASP 原始数据采集任务');
    await page.locator('[data-twod-wizard-field="description"]').fill('展示自主计算采集的 VASP 原始数据上传与完整性校验。');
    await page.getByRole('button', { name: '进入下一步', exact: true }).click();
    await page.getByRole('button', { name: '进入采集方式', exact: true }).click();
    await page.getByText('自主计算数据采集', { exact: true }).click();

    const root = page.locator('#page-lowdim-ingest-twod');
    await root.getByText('VASP 原始数据文件上传', { exact: true }).waitFor({ state: 'visible', timeout: 500 });
    for (const label of ['OUTCAR', 'DOSCAR', 'EIGENVAL', 'CONTCAR']) {
      assert.ok(await root.getByText(label, { exact: true }).count() > 0, `页面应展示 ${label} 文件类型`);
    }
    assert.ok(await root.getByText('文件完整性校验报告', { exact: true }).count() > 0, '页面应展示文件完整性校验报告');
    assert.ok(await root.getByText('校验通过', { exact: true }).count() > 0, '页面应展示校验通过状态');    await root.getByText('提取数据预览', { exact: true }).waitFor({ state: 'visible', timeout: 500 });
    assert.ok(await root.getByText('已提取 128 个数据字段', { exact: true }).count() > 0, '页面应展示提取字段数量');
    for (const tab of ['结构信息', '能带数据', '态密度数据', '能量信息', '计算参数']) {
      assert.ok(await root.locator('[data-twod-calc-preview-tab]').filter({ hasText: tab }).count() > 0, `页面应展示 ${tab} 预览页签`);
    }
    assert.ok(await root.getByText('结构信息（从 CONTCAR 提取）', { exact: true }).count() > 0, '页面应展示结构信息标题');
    assert.ok(await root.getByText('MoS₂', { exact: true }).count() > 0, '页面应展示材料体系');
    assert.ok(await root.getByText('带隙值 (Band Gap)', { exact: true }).count() > 0, '页面应展示能带数据项');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});



