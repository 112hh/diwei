const fs = require('fs');
const path = require('path');
const source = fs.readFileSync(path.resolve(__dirname, '..', 'low-dim-materials.html'), 'utf8');
const checks = [
  [/cell\(item\.reactant[^\n]*\{ red: true \}/, '反应物列未使用红色内联样式'],
  [/cell\(item\.product[^\n]*\{ red: true \}/, '生成物列未使用红色内联样式'],
  [/function renderCatalystDetailPage\(material\)[\s\S]{0,500}data-source.*catalyst/, '催化详情未设置数据源'],
  [!/function renderOptoDetailPage\(material\)[\s\S]{0,500}data-source.*catalyst/, '有机光电详情被错误设置为催化数据源'],
  [/数据质量<\/span><strong class="catalyst-red-field" style="color:#d12f2f !important;">/, '数据质量未绑定红色内联样式'],
  [/renderDetailKvSection\("元素特征", elementRows, \{[^}]*redLabels: \["第一电离能", "相对原子质量"\]/, '第一电离能或相对原子质量未标红'],
  [/renderDetailKvSection\("晶格参数", latticeRows, \{[^}]*redAll: true/, '晶格参数未全部标红'],
  [/renderDetailKvSection\("结构特征", structureFeatureRows, \{[^}]*redAll: true/, '结构特征未全部标红'],
  [/renderDetailKvSection\("体系特征", systemFeatureRows, \{[^}]*redAll: true/, '体系特征未全部标红'],
  [/renderDetailKvSection\("催化性能", catalyticRows, \{[^}]*redLabels: \["中间产物类型", "吸附位点"\]/, '中间产物类型或吸附位点未标红'],
  [/const redStyle = isRed \? ' style="color:#d12f2f !important;"'/, '详情字段未生成红色内联样式']
];
const failures = checks.filter(([ok]) => (ok instanceof RegExp ? ok.test(source) : ok)).map(([, message]) => message);
if (failures.length) { console.error(failures.map(x => `FAIL: ${x}`).join('\n')); process.exit(1); }
console.log('PASS: 催化材料列表与详情红色样式规则完整');
