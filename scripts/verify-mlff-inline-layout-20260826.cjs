const { chromium } = require("playwright");
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1536,height:900}});
 await page.goto("http://127.0.0.1:8765/low-dim-materials.html", {waitUntil:"networkidle"});
 await page.evaluate(()=>{ const b=document.querySelector('[data-page="mlff"]'); if(b) b.click(); });
 await page.waitForTimeout(500);
 const info=await page.evaluate(()=>{
  const row=document.querySelector('#page-mlff .twod-search-row:has(.mlff-match-mode-select)');
  const els=row?[...row.children].map(el=>({tag:el.tagName,cls:el.className,text:el.innerText,rect:(()=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}})()})):[];
  const rr=row?.getBoundingClientRect();
  return {page:document.querySelector('#page-mlff')?.className,row:rr&&{x:rr.x,y:rr.y,w:rr.width,h:rr.height},els};
 });
 await page.screenshot({path:"C:/Users/Windows/Desktop/diwei/artifacts/mlff-search-layout-20260826.png", fullPage:false});
 console.log(JSON.stringify(info,null,2));
 await browser.close();
})();
