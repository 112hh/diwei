const fs = require('fs');
const path = require('path');
const source = fs.readFileSync(path.resolve(__dirname, '..', 'low-dim-materials.html'), 'utf8');
const failures = [];
function expect(pattern, message) { if (pattern instanceof RegExp ? !pattern.test(source) : !pattern) failures.push(message); }
expect(/const cell = \(value, options\) =>[\s\S]*?catalyst-red-field/, '列表 cell helper 未支持催化材料红色字段');
expect(/cell\(item\.reactant[\s\S]{0,180}red:\s*true/, '反应物列未标记红色');
expect(/cell\(item\.product[\s\S]{0,180}red:\s*true/, '生成物列未标记红色');
expect(/function renderCatalystDetailPage\(material\)[\s\S]{0,500}data-source.*catalyst/, '催化材料详情未设置数据源标识');
expect(!/function renderOptoDetailPage\(material\)[\s\S]{0,500}data-source.*catalyst/.test(source), '有机光电详情页被错误设置为催化材料数据源');
expect(/数据质量[\s\S]{0,180}catalyst-red-field/, '数据质量未标记红色');
expect(/renderDetailKvSection\("元素特征",\s*elementRows,\s*\{[^}]*redLabels:\s*\["第一电离能",\s*"相对原子质量"\]/, '第一电离能或相对原子质量未标记红色');
expect(/renderDetailKvSection\("晶格参数",\s*latticeRows,\s*\{[^}]*redAll:\s*true/, '晶格参数未全部标记红色');
expect(/renderDetailKvSection\("结构特征",\s*structureFeatureRows,\s*\{[^}]*redAll:\s*true/, '结构特征未全部标记红色');
expect(/renderDetailKvSection\("体系特征",\s*systemFeatureRows,\s*\{[^}]*redAll:\s*true/, '体系特征未全部标记红色');
expect(/renderDetailKvSection\("催化性能",\s*catalyticRows,\s*\{[^}]*redLabels:\s*\["中间产物类型",\s*"吸附位点"\]/, '中间产物类型或吸附位点未标记红色');
expect(/id="catalyst-red-fields-final-override"/, '最终催化材料红色覆盖样式缺失');
if (failures.length) { console.error(failures.map(x => `FAIL: ${x}`).join('\n')); process.exit(1); }
console.log('PASS: 催化材料列表与详情红色样式规则完整');

