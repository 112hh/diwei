const fs = require('fs');
const path = process.argv[2] || require('path').join(__dirname, '..', 'low-dim-materials.html');
const html = fs.readFileSync(path, 'utf8');

function assertIncludes(needle, message) {
  if (!html.includes(needle)) throw new Error(message || `Missing: ${needle}`);
}

assertIncludes('.mlff-red-field', 'Missing scoped red-field CSS hook');
assertIncludes('const MLFF_RED_LABELS = new Set([', 'Missing requested MLFF red label set');
for (const label of ['团簇信息', '结构参数及原子组成', '大体系信息']) assertIncludes(label, `Missing requested heading: ${label}`);
assertIncludes('renderMlffStructurePage(material, "smallSystem", "小体系结构"', 'Missing small-system structure page');
assertIncludes('renderMlffStructurePage(material, "largeSystem", "大体系结构"', 'Missing large-system structure page');
assertIncludes('${titleText}图', 'Missing structure image heading renderer');
assertIncludes('item.key === "smallSystem" ? " mlff-red-field"', 'Missing red class on MLFF small-system menu item');
assertIncludes('class="mlff-red-field mlff-red-heading"', 'Missing red class on requested structure heading');
assertIncludes('#page-twod-detail[data-source="mlff"] .mlff-red-heading', 'Missing red heading CSS hook');
assertIncludes('mlff-red-section-card', 'Missing red section-card hook');
assertIncludes('mlff-red-structure-card', 'Missing red structure-card hook');
console.log('MLFF red field checks passed.');
