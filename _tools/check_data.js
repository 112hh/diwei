const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'db2_data.js'), 'utf8');

const api = new Function(src + `
  return { INFO_COLS: INFO_COLS, INFO_ROWS: INFO_ROWS, DDL_TABLES: DDL_TABLES,
           DATASETS: DATASETS, TABLE_OPTIONS: TABLE_OPTIONS, MATERIALS: MATERIALS,
           buildFields: buildFields, findDdlTable: findDdlTable };`)();

let tf = 0, tn = 0, ti = 0;
console.log('=== 四张库表 ===');
api.DDL_TABLES.forEach(function (t) {
  const nn = t.fields.filter(function (f) { return f.notNull; }).length;
  tf += t.fields.length; tn += nn; ti += t.keys.length;
  console.log('  ' + t.name.padEnd(30) + ' 字段 ' + String(t.fields.length).padStart(2)
    + ' | 非空 ' + nn + ' | 索引 ' + t.keys.length + ' | ' + t.cn);
});
console.log('  合计：字段 ' + tf + '，非空 ' + tn + '，索引 ' + ti);

console.log('\n=== 库表字段名去重校验 ===');
api.DDL_TABLES.forEach(function (t) {
  const seen = {};
  let dup = [];
  t.fields.forEach(function (f) { if (seen[f.en]) dup.push(f.en); seen[f.en] = 1; });
  console.log('  ' + t.name.padEnd(30) + (dup.length ? ('重复字段: ' + dup.join(',')) : '无重复 ✓'));
});

console.log('\n=== 数据集「数据信息」列 / 行 一致性 ===');
let bad = 0;
Object.keys(api.INFO_COLS).forEach(function (k) {
  const cols = api.INFO_COLS[k];
  const rows = api.INFO_ROWS[k] || [];
  let miss = [];
  rows.forEach(function (r, i) {
    cols.forEach(function (c) { if (!(c.k in r)) miss.push('第' + (i + 1) + '行缺 ' + c.k); });
    Object.keys(r).forEach(function (rk) {
      if (!cols.some(function (c) { return c.k === rk; })) miss.push('第' + (i + 1) + '行多余键 ' + rk);
    });
  });
  if (rows.length !== api.MATERIALS.length) miss.push('行数 ' + rows.length + ' ≠ 材料数 ' + api.MATERIALS.length);
  if (miss.length) bad += miss.length;
  console.log('  ' + k.padEnd(12) + ' 列 ' + cols.length + ' | 行 ' + rows.length + ' | '
    + (miss.length ? miss.join('; ') : '结构完整 ✓'));
});
console.log(bad ? ('存在 ' + bad + ' 处问题') : '全部数据集数据信息结构完整 ✓');

/* 与页面侧 tablesOf() 同口径：tables 数组优先，兼容旧的单表 table 字段 */
function tablesOf(d) {
  const raw = (d.tables && d.tables.length) ? d.tables : (d.table ? [d.table] : []);
  const out = [];
  raw.forEach(function (n) { if (n && out.indexOf(n) < 0) out.push(n); });
  return out;
}

/* 与页面侧 ddlFieldsOfTables() 同口径：多表字段按英文名去重合并 */
function ddlFieldsOfTables(tables) {
  const seen = {}, out = [];
  tables.forEach(function (n) {
    const t = api.findDdlTable(n);
    if (!t) return;
    t.fields.forEach(function (f) { if (!seen[f.en]) { seen[f.en] = 1; out.push(f); } });
  });
  return out;
}

console.log('\n=== 数据集 → 关联数据表 映射 ===');
let mapBad = 0;
api.DATASETS.forEach(function (d) {
  const list = tablesOf(d);
  const parts = list.map(function (n) {
    const t = api.findDdlTable(n);
    if (!t) { mapBad++; return n + '(✗ 库表中不存在)'; }
    return n + ' ✓ ' + t.fields.length + ' 字段';
  });
  console.log('  ' + d.label.padEnd(16) + ' → ' + parts.join('  |  '));
});
console.log(mapBad ? ('存在 ' + mapBad + ' 处库表映射问题') : '全部数据集关联库表有效 ✓');

console.log('\n=== 新增数据集下拉选项（多选） ===');
const optValues = [];
api.TABLE_OPTIONS.forEach(function (o) {
  optValues.push(o.value);
  console.log('  ' + o.value.padEnd(30) + ' ' + (o.cn || '(缺中文别名)').padEnd(12) + ' ' + o.label);
});

console.log('\n=== 多表字段合并（多选场景） ===');
const probes = [
  ['ldm_material_2d'],
  ['ldm_material_2d_structure'],
  ['ldm_material_2d', 'ldm_material_2d_structure'],
  ['ldm_material_2d', 'ldm_material_2d_property'],
  ['ldm_material_2d_structure', 'ldm_material_2d_property'],
  optValues.slice()
];
probes.forEach(function (combo) {
  const merged = ddlFieldsOfTables(combo);
  const raw = combo.reduce(function (n, name) {
    const t = api.findDdlTable(name);
    return n + (t ? t.fields.length : 0);
  }, 0);
  const names = {};
  let dup = 0;
  merged.forEach(function (f) { if (names[f.en]) dup++; names[f.en] = 1; });
  console.log('  ' + String(combo.length) + ' 张表 ' + ('(' + combo.join(' + ') + ')').slice(0, 78));
  console.log('     原始字段合计 ' + raw + ' → 去重合并后 ' + merged.length
    + '（重叠 ' + (raw - merged.length) + '）' + (dup ? '  ✗ 合并结果仍有重复' : '  ✓ 无重复'));
});

console.log('\n=== 内置数据集字段数（信息概览口径）===');
api.DATASETS.forEach(function (d) { console.log('  ' + d.label.padEnd(16) + ' ' + api.buildFields(d.key).length + ' 个字段'); });
