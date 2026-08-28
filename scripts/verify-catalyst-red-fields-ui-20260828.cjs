const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage();
  const errors=[]; page.on("console", m => { if (m.type()==="error") errors.push(m.text()); }); page.on("pageerror", e => errors.push(e.message));
  await page.goto("http://127.0.0.1:8765/low-dim-materials.html", {waitUntil:"networkidle"});
  await page.waitForTimeout(1000);
  const body = await page.locator("body").innerText();
  console.log("initial", body.includes("催化材料应用"), body.slice(0,300).replace(/\n/g," | "));
  const catalystLink = page.getByText("催化材料应用", {exact:true}).first();
  console.log("links", await catalystLink.count());
  if (await catalystLink.count()) { await catalystLink.click(); await page.waitForTimeout(500); }
  console.log("page", await page.locator("body").innerText().then(t=>t.includes("反应物")));
  const redCells = await page.locator('#page-catalyst tbody td.catalyst-red-field').count();
  console.log("redCells", redCells);
  const detailBtn = page.getByRole("button", {name:"查看详情"}).first();
  console.log("detailBtn", await detailBtn.count());
  if (await detailBtn.count()) { await detailBtn.click(); await page.waitForTimeout(500); }
  const detail = page.locator("#page-twod-detail");
  console.log("detailVisible", await detail.isVisible().catch(()=>false), "source", await detail.getAttribute("data-source"));
  const redItems = await detail.locator(".detail-kv-item.mlff-red-field").count();
  const quality = await detail.locator(".catalyst-red-field").count();
  console.log("redItems", redItems, "qualityOrOther", quality, "errors", errors.length);
  if (errors.length) console.log(errors.join("\n"));
  await browser.close();
  if (redCells < 2 || redItems < 10 || quality < 2 || errors.length) process.exit(1);
})();
