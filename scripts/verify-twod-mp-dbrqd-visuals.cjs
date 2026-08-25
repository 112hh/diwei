const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const pageFile = path.resolve(__dirname, '..', 'low-dim-materials.html');
const expected = [
  ['bandStructure', '01_MoS2_band_structure.png'],
  ['dosPlot', '02_MoS2_projected_DOS.png'],
  ['magneticGroundState', '03_CrI3_magnetic_ground_state.png'],
  ['phononDispersion', '04_graphene_phonon_dispersion.png'],
  ['phononDOS', '05_MoS2_phonon_DOS.png'],
  ['dielectricFunction', '06_hBN_dielectric_function.png'],
  ['opticalAbsorption', '07_MoS2_absorption_coefficient.png'],
  ['reflectance', '08_WS2_reflectivity.png'],
  ['refractiveIndex', '09_MoS2_refractive_index.png'],
  ['extinctionCoefficient', '10_WS2_extinction_coefficient.png'],
  ['defectFormationEnergy', '11_hBN_defect_formation_energy.png'],
  ['defectStructure', '12_hBN_N_vacancy_structure.png']
];

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  try {
    await page.goto(pathToFileURL(pageFile).href, { waitUntil: 'networkidle' });
    await page.getByText('普通用户', { exact: true }).click();
    await page.getByRole('button', { name: '统一身份认证登录' }).click();
    await page.waitForTimeout(250);
    await page.evaluate(() => handleMaterialDetailOpen('twod:mp-dbrqd', 'visualization'));
    await page.waitForTimeout(250);

    const buttons = page.locator('#page-twod-detail [data-material-visual]');
    assert.equal(await buttons.count(), 12, 'mp-dbrqd 应提供12个物理性质可视化切换按钮');

    for (const [key, filename] of expected) {
      await page.locator(`#page-twod-detail [data-material-visual="${key}"]`).click();
      const image = page.locator('#page-twod-detail .twod-detail-chart-card .twod-visual-image-frame img');
      await image.waitFor({ state: 'visible' });
      const result = await image.evaluate((node) => ({ src: node.getAttribute('src'), naturalWidth: node.naturalWidth, naturalHeight: node.naturalHeight }));
      assert.ok(result.src.endsWith(`/assets/twod-visualizations/${filename}`) || result.src.endsWith(`assets/twod-visualizations/${filename}`), `${key} 应显示 ${filename}，实际为 ${result.src}`);
      assert.ok(result.naturalWidth > 0 && result.naturalHeight > 0, `${filename} 应成功加载`);
    }
    console.log('mp-dbrqd 12张物理性质可视化图片验证通过');
  } finally { await browser.close(); }
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });
