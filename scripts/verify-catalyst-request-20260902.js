const fs = require('fs');
const path = 'C:/Users/Windows/Desktop/diwei/low-dim-materials.html';
const html = fs.readFileSync(path, 'utf8');
const checks = [
  ['分类标签', html.includes('分类标签')],
  ['反应路径信息', html.includes('反应路径信息')],
  ['元素特征数据', html.includes('元素特征数据')],
  ['结构特征数据', html.includes('结构特征数据')],
  ['体系特征数据', html.includes('体系特征数据')],
  ['催化材料数据导入', html.includes('催化材料数据导入')],
  ['POSCAR下载标签', html.includes('POSCAR下载')],
  ['查看全部文档', html.includes('查看全部文档')],
  ['计算输入文件模板', html.includes('计算输入文件模板')],
];
const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error(`RED: ${failed.length} checks missing`);
  failed.forEach(([name]) => console.error(`- ${name}`));
  process.exit(1);
}
console.log(`GREEN: ${checks.length} request markers present`);
