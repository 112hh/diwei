const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const pageFile = path.resolve(__dirname, '..', 'low-dim-materials.html');
const modules = [
  { id: 'opto', name: '有机光电材料', field: '分子结构', forbidden: /MoS2|二维材料数据库|Materials Project|VASP/ },
  { id: 'electrolyte', name: '电解质材料', field: '配方组分', forbidden: /MoS2|二维材料数据库|Materials Project|VASP/ },
  { id: 'mlff', name: '机器学习力场', field: '结构轨迹', forbidden: /MoS2|二维材料数据库|Materials Project|VASP/ },
  { id: 'catalyst', name: '催化材料', field: '催化剂结构', forbidden: /MoS2|二维材料数据库|Materials Project|VASP/ }
];

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  try {
    await page.goto(pathToFileURL(pageFile).href, { waitUntil: 'networkidle' });
    await page.getByText('管理员', { exact: true }).click();
    await page.getByRole('button', { name: '统一身份认证登录' }).click();
    await page.locator('.sidebar-group[data-group="ingest"] [data-group-toggle]').click();
    await page.waitForTimeout(300);

    for (const module of modules) {
      const moduleId = module.id;
      await page.locator(`.nav-btn[data-page="lowdim-ingest-${moduleId}"]:visible`).click();
      await page.waitForTimeout(180);
      const root = page.locator(`#page-lowdim-ingest-${moduleId}`);
      assert.equal(await root.locator('.twod-main-page').count(), 1, `${moduleId}: should reuse the 2D page shell`);
      assert.equal(await root.locator('.twod-task-wizard').count(), 0, `${moduleId}: wizard starts after creating a task`);
      assert.equal(await root.locator('[data-twod-task-wizard-start]').count(), 1, `${moduleId}: create task entry`);
      const title = await root.locator('.twod-main-head h1').innerText();
      assert.match(title, /数据采集加工处理$/, `${moduleId}: module title`);
      assert.doesNotMatch(await root.innerText(), /数据资源对象配置与执行情况/, `${moduleId}: old generic workflow content removed`);
      assert.match(await root.innerText(), new RegExp(module.name), `${moduleId}: material domain text`);
      assert.doesNotMatch(await root.innerText(), module.forbidden, `${moduleId}: no 2D-specific content`);

      await root.locator('[data-twod-task-wizard-start]').click();
      await page.waitForTimeout(100);
      assert.equal(await root.locator('.twod-task-wizard').count(), 1, `${moduleId}: should render the full task wizard`);
      assert.equal(await root.locator('.twod-task-step').count(), 7, `${moduleId}: seven wizard steps`);
      assert.match(await root.innerText(), new RegExp(module.name), `${moduleId}: wizard keeps material domain text`);
      assert.doesNotMatch(await root.innerText(), module.forbidden, `${moduleId}: wizard has no 2D-specific content`);

      await root.locator('[data-twod-wizard-field="name"]').fill(`${module.name}示例采集任务`);
      await root.locator('[data-twod-wizard-field="description"]').fill(`验证${module.name}数据采集、加工与入库流程`);
      await root.locator('[data-twod-task-wizard-next]').click();
      await page.waitForTimeout(60);
      assert.match(await root.innerText(), /数据资源对象介绍/, `${moduleId}: resource introduction step`);
      assert.match(await root.innerText(), new RegExp(module.field), `${moduleId}: domain resource field`);
      assert.doesNotMatch(await root.innerText(), module.forbidden, `${moduleId}: resource step has no 2D-specific content`);
      await root.locator('[data-twod-task-wizard-next]').click();
      await page.waitForTimeout(60);
      assert.match(await root.innerText(), /选择数据采集方式/, `${moduleId}: collection method step`);
      await root.locator('[data-twod-task-wizard-next]').click();
      await page.waitForTimeout(60);
      assert.match(await root.innerText(), /选择录入方式/, `${moduleId}: data entry step`);
      await root.locator('[data-twod-task-wizard-next]').click();
      await page.waitForTimeout(60);
      assert.match(await root.innerText(), /资源数据加工/, `${moduleId}: processing step`);
      await root.locator('[data-twod-task-wizard-next]').click();
      await page.waitForTimeout(60);
      assert.match(await root.innerText(), /数据安全等级校验/, `${moduleId}: security step`);
      await root.locator('[data-twod-task-wizard-next]').click();
      await page.waitForTimeout(60);
      assert.match(await root.innerText(), /标准化处理/, `${moduleId}: standardization step`);
      await root.locator('[data-twod-task-wizard-next]').click();
      await page.waitForTimeout(60);
      assert.match(await root.innerText(), /请确认以下处理后的数据信息/, `${moduleId}: submit step`);
    }
    console.log('五类材料采集加工页面复用二维材料七步向导验证通过');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
