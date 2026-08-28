const fs=require('fs'), vm=require('vm');
const html=fs.readFileSync(process.argv[2],'utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
let bad=0;
for(let i=0;i<scripts.length;i++){
  try { new vm.Script(scripts[i], {filename:`inline-script-${i}.js`}); }
  catch(e) { bad++; console.error(`FAIL script ${i}: ${e.message}`); }
}
if(!bad) console.log(`PASS: ${scripts.length} inline scripts parsed`);
process.exit(bad?1:0);
