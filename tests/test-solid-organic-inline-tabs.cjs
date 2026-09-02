const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  try {
    await page.goto(pathToFileURL(path.resolve(__dirname, '..', 'low-dim-materials.html')).href, { waitUntil: 'networkidle' });
    await page.getByText('管理员', { exact: true }).click();
    await page.getByRole('button', { name: '统一身份认证登录' }).click();
    await page.locator('.nav-btn[data-page="electrolyte"]:visible').click();
    await page.locator('#page-electrolyte [data-ely-category="solidOrganic"]').click();

    const listText = await page.locator('#page-electrolyte').innerText();
    for (const label of ['英文名称', '分子式/化学式', '分子编号/CAS号', '结构种类细分']) {
      assert.ok(listText.includes(label), `固态有机电解质列表应包含${label}`);
    }
    assert.equal(listText.includes('英文简称'), false, '固态有机电解质列表不应继续显示英文简称');
    assert.ok(
      await page.locator('#page-electrolyte td[title="醚类固态有机电解质数据集"], #page-electrolyte td[title="酮类固态有机电解质数据集"], #page-electrolyte td[title="腈类固态有机电解质数据集"], #page-electrolyte td[title="其他固态有机电解质数据集"]').count() > 0,
      '结构种类细分应展示约定的数据集名称'
    );
    assert.equal(await page.locator('#page-electrolyte td[title="—"], #page-electrolyte td[title="NA"], #page-electrolyte td[title="N/A"]').count(), 0, '固态有机电解质列表缺失值应显示“/”');

    await page.locator('#page-electrolyte button', { hasText: '查看详情' }).first().click();
    assert.equal(await page.locator('#page-twod-detail [data-detail-section="property"]').count(), 0, '左侧详情菜单应删除物性信息');

    const tabs = page.locator('#page-twod-detail [data-solid-organic-info-tab]');
    assert.equal(await tabs.count(), 2, '基础信息区域应只有基础信息和物性信息两个页签');
    assert.equal(await page.locator('#page-twod-detail [data-solid-organic-info-tab="basic"].active').count(), 1, '默认应展示基础信息');
    assert.equal(await page.locator('#page-twod-detail [data-solid-organic-info-tab="safety"]').count(), 0, '固态有机电解质不应出现安全信息页签');

    await page.locator('#page-twod-detail [data-solid-organic-info-tab="property"]').click();
    let detailText = await page.locator('#page-twod-detail').innerText();
    for (const label of ['摩尔体积', '密度', '玻璃化转变温度', '电导率', '溶解溶剂', '抗拉性能']) {
      assert.ok(detailText.includes(label), `物性页签应包含${label}`);
    }
    for (const label of ['性状-外观颜色', '熔点', '沸点', '闪点', '燃点', '折射率', '黏度', '介电常数', '比热容', '热导率']) {
      assert.equal(detailText.includes(label), false, `固态有机物性页签不应展示${label}`);
    }
    assert.ok(detailText.includes('/'), '缺失的物性字段应以“/”展示');
    assert.equal(detailText.includes('该材料暂无此性质'), false, '物性字段缺失时不应展示其他占位文案');
    assert.equal(detailText.includes('待补'), false, '待补的物性字段应以“/”展示');
    const propertyTableLayout = await page.locator('#page-twod-detail .solid-organic-info-card').evaluate((card) => {
      const table = card.querySelector('.solid-organic-kv-table');
      const cardRect = card.getBoundingClientRect();
      const tableRect = table.getBoundingClientRect();
      const valueCellRect = table.querySelector('tr:nth-child(2) td:last-child').getBoundingClientRect();
      return { cardRight: cardRect.right, tableRight: tableRect.right, valueCellWidth: valueCellRect.width };
    });
    assert.ok(propertyTableLayout.tableRight <= propertyTableLayout.cardRight + 1, '物性表格不应与右侧结构图重叠');
    assert.ok(propertyTableLayout.valueCellWidth > 80, '物性值列应有足够宽度清晰展示数据');

    await page.locator('#page-twod-detail [data-detail-section="compute"]').click();
    detailText = await page.locator('#page-twod-detail').innerText();
    for (const label of ['摩尔热容', '结合能']) assert.ok(detailText.includes(label), `计算信息应包含${label}`);
    for (const label of ['HOMO', 'LUMO', '偶极矩', '生成焓', '生成吉布斯自由能', '溶剂化自由能']) {
      assert.equal(detailText.includes(label), false, `计算信息不应展示${label}`);
    }

    await page.locator('#page-twod-detail [data-detail-section="solvent"]').click();
    detailText = await page.locator('#page-twod-detail').innerText();
    assert.ok(detailText.includes('本列表为该固态有机电解质高分子的推荐溶解溶剂'), '溶剂推荐页应展示实验参考说明');
    for (const label of ['溶剂名称（中文）', '溶剂名称（英文）', 'CAS号', '溶解能力等级', '适用工艺场景', '备注说明', '操作']) {
      assert.ok(detailText.includes(label), `溶剂推荐列表应包含${label}`);
    }
    for (const value of ['N-甲基吡咯烷酮', 'NMP', '872-50-4', '二甲基甲酰胺', 'DMF', '68-12-2', '溶液浇铸成膜']) {
      assert.ok(detailText.includes(value), `溶剂推荐列表应展示${value}`);
    }
    assert.equal(await page.locator('#page-twod-detail button', { hasText: '导出本条' }).count(), 2, '示例推荐列表应提供两条导出操作');

    console.log('固态有机电解质列表、详情页签、计算信息与溶剂推荐验证通过');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});




