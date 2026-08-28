const fs = require('fs');
const path = process.argv[2] || require('path').join(__dirname, '..', 'low-dim-materials.html');
const html = fs.readFileSync(path, 'utf8');
const expectedHeaders = ['材料编号','中文名称','英文名称','化学式','数据集类型','体系规模','体系类型','电荷','多极矩','极化率','色散系数','操作'];
const headerBlock = (html.match(/<table class="twod-result-table">[\s\S]*?<\/table>/) || [''])[0];
for (const header of expectedHeaders) {
  if (!headerBlock.includes(`<th>${header}</th>`)) throw new Error(`列表缺少字段：${header}`);
}
const detailTreeBlock = (html.match(/function renderMlffDetailTreeOverride\(\) \{[\s\S]*?\n    \}/) || [''])[0];
for (const section of ['基础信息','分子结构','小体系结构','大体系结构']) {
  if (!detailTreeBlock.includes(`label: "${section}"`)) throw new Error(`详情菜单缺少：${section}`);
}
for (const removed of ['label: "原子电荷"','label: "多级矩"']) {
  if (detailTreeBlock.includes(removed)) throw new Error(`详情菜单仍包含不需要的项目：${removed}`);
}
console.log('MLFF adjustment checks passed.');
