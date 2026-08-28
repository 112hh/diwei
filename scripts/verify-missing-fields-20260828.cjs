const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.resolve(__dirname, '..', 'low-dim-materials.html'), 'utf8');

const required = [
  'missing-field-red',
  '密度', '晶胞体积', '元素组成', '数据来源',
  '原子结构图', '原子坐标', '晶格夹角', '磁转变温度', '反位缺陷',
  '性状', '安全等级', '晶系', '晶胞参数', '空间群',
  '3D分子结构图', '相对分子质量', 'CAS 号', 'InChIKey', 'SMILES', '类别 Family', '含杂原子 / 检索命中'
];
for (const text of required) assert.ok(html.includes(text), `应保留并处理字段：${text}`);
assert.match(html, /function renderElectrolyteResultHeader[\s\S]*?missing-field-red/, '电解质列表应对缺失字段表头添加红色样式');
assert.match(html, /const head = \["材料名称", "化学式", "元素组成", "结构类型", "空间群", "参考文献", "操作"\]/, '外部关联表应有参考文献列且没有来源列');
const externalStart = html.indexOf('function renderElectrolyteSolidInorganicExternalPage');
const externalEnd = html.indexOf('function openElectrolyteExternalCandidateDetail', externalStart);
const externalRenderer = html.slice(externalStart, externalEnd);
assert.ok(externalRenderer.indexOf('renderElectrolyteSameCompositionCandidateTable(material)') < externalRenderer.indexOf('参考文献概览'), '同元素不同结构检索结果应排在外部关联页最上方');
assert.match(html, /band:\s*"能带结构图"/, '电解质图谱字段应为能带结构图');
assert.match(html, /dos:\s*"态密度图"/, '电解质图谱字段应为态密度图');
console.log('缺失字段页面改造静态验证通过');

