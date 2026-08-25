const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
(async()=>{
 const browser=await chromium.launch({headless:true, executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 try {
  await page.goto(pathToFileURL(path.resolve('low-dim-materials.html')).href,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(500);
  await page.getByText('普通用户',{exact:true}).click();
  await page.getByRole('button',{name:'统一身份认证登录'}).click();
  await page.locator('.nav-btn[data-page="mlff"]').click();
  await page.locator('[data-mlff-glossary-page]').click();
  await page.waitForTimeout(250);
  assert.equal(await page.locator('#page-mlff .mlff-glossary-page-title').textContent(),'机器学习力场数据术语表');
  assert.deepEqual(await page.locator('#page-mlff [data-mlff-glossary-page-tab]').allTextContents(),['参数数据定义表','数据获取方法表']);
  assert.equal((await page.locator('#page-mlff [data-mlff-glossary-back]').textContent()).trim(),'返回列表');
  assert.equal(await page.locator('#page-mlff .mlff-alpha-btn').count(),27);
  assert.ok(await page.locator('#page-mlff .mlff-definition-card').count() >= 2);
  await page.locator('[data-mlff-glossary-page-tab="method"]').click();
  await page.waitForTimeout(150);
  assert.ok(await page.locator('#page-mlff .mlff-method-stat').count() >= 4);
  assert.ok(await page.locator('#page-mlff .mlff-method-card').count() >= 2);
  await page.locator('#page-mlff [data-mlff-glossary-back]').click();
  await page.waitForTimeout(150);
  assert.equal(await page.locator('#page-mlff [data-mlff-glossary-page]').count(),1);
  console.log('机器学习力场术语表页面交互验证通过');
 } finally { await browser.close(); }
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
