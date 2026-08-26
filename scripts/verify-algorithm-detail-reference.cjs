const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const pageFile = path.resolve(__dirname, '..', 'low-dim-materials.html');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });

  try {
    await page.goto(pathToFileURL(pageFile).href, { waitUntil: 'networkidle' });
    await page.getByText('普通用户', { exact: true }).click();
    await page.getByRole('button', { name: '统一身份认证登录' }).click();
    await page.waitForTimeout(350);

    const sidebarBefore = await page.evaluate(() => ({
      items: Array.from(document.querySelectorAll('.sidebar .sidebar-group')).map((group) => ({
        group: group.dataset.group || '',
        title: group.querySelector('.sidebar-group-title')?.textContent.trim() || '',
        pages: Array.from(group.querySelectorAll('.nav-btn')).map((button) => ({
          page: button.dataset.page || '',
          label: button.dataset.label || button.textContent.trim()
        }))
      })),
      width: Math.round(document.querySelector('.sidebar')?.getBoundingClientRect().width || 0)
    }));

    await page.evaluate(() => renderAlgorithmDocModal('twod-relax-nonmagnetic'));
    await page.waitForTimeout(200);

    const report = await page.evaluate(() => {
      const root = document.querySelector('#page-algorithm-doc-detail');
      const sidebar = document.querySelector('.sidebar');
      const text = root?.innerText || '';
      return {
        active: root?.classList.contains('active') || false,
        sidebarItems: Array.from(sidebar?.querySelectorAll('.sidebar-group') || []).map((group) => ({
          group: group.dataset.group || '',
          title: group.querySelector('.sidebar-group-title')?.textContent.trim() || '',
          pages: Array.from(group.querySelectorAll('.nav-btn')).map((button) => ({
            page: button.dataset.page || '',
            label: button.dataset.label || button.textContent.trim()
          }))
        })),
        sidebarWidth: Math.round(sidebar?.getBoundingClientRect().width || 0),
        pageHeadVisible: root?.querySelector('.page-head') ? getComputedStyle(root.querySelector('.page-head')).display !== 'none' : false,
        hasReferenceShell: Boolean(root?.querySelector('.algorithm-reference-page')),
        hasTitle: text.includes('非磁单层材料结构驰豫算法'),
        hasDescription: text.includes('针对非磁性二维单层材料的结构优化算法'),
        hasFeature: text.includes('功能特点'),
        hasScenario: text.includes('适用场景'),
        hasApi: text.includes('API 调用示例'),
        hasRequest: text.includes('请求参数'),
        hasOutput: text.includes('输出结果'),
        hasBackButton: Boolean(root?.querySelector('[data-algorithm-detail-back]')),
        hasOldBasicInfo: text.includes('基本信息'),
        hasCopyButton: Boolean(root?.querySelector('[data-algorithm-copy-code]')),
        codeBlockDark: (() => {
          const code = root?.querySelector('.algorithm-reference-code');
          if (!code) return false;
          const bg = getComputedStyle(code).backgroundColor;
          return bg === 'rgb(31, 36, 48)' || bg === 'rgb(30, 34, 43)';
        })()
      };
    });

    assert.equal(report.active, true, '算法详情应作为独立页面展示');
    assert.deepEqual(report.sidebarItems, sidebarBefore.items, '左侧菜单结构和内容必须保持不变');
    assert.equal(report.sidebarWidth, sidebarBefore.width, '左侧菜单宽度必须保持不变');
    assert.equal(report.pageHeadVisible, false, '不展示旧的算法详情页头和返回按钮区域');
    assert.equal(report.hasReferenceShell, true, '详情主体应使用截图式文档展示容器');
    assert.equal(report.hasTitle, true, '应展示算法名称');
    assert.equal(report.hasDescription, true, '应展示算法简介');
    assert.equal(report.hasFeature, true, '应展示功能特点');
    assert.equal(report.hasScenario, true, '应展示适用场景');
    assert.equal(report.hasApi, true, '应展示 API 调用示例');
    assert.equal(report.hasRequest, true, '应展示请求参数表格');
    assert.equal(report.hasOutput, false, '暂不展示截图之外的输出结果区');
    assert.equal(report.hasBackButton, false, '暂不展示旧的返回算法列表按钮');
    assert.equal(report.hasOldBasicInfo, false, '暂不展示旧的基本信息等长文档内容');
    assert.equal(report.hasCopyButton, true, 'API 示例应保留复制代码操作');
    assert.equal(report.codeBlockDark, true, 'API 示例应使用深色代码块');

    console.log('算法详情截图式布局验证通过');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});







