const fs = require('fs');
const path = require('path');
const file = process.argv[2] || path.join(__dirname, '..', 'low-dim-materials.html');
const html = fs.readFileSync(file, 'utf8');
function assertIncludes(needle, message) {
  if (!html.includes(needle)) throw new Error(message || `Missing: ${needle}`);
}
assertIncludes('待预测材料', 'Missing material overview heading');
assertIncludes('data-prediction-task-description', 'Missing task description field');
assertIncludes('计算参数配置', 'Missing calculation parameter section');
assertIncludes('data-prediction-submit-pending', 'Missing pending submit action');
assertIncludes('正在调用算法预测结果', 'Missing pending page processing copy');
assertIncludes('请耐心等待几分钟', 'Missing pending wait copy');
assertIncludes('data-prediction-pending-result', 'Missing pending result action');
assertIncludes('data-prediction-pending-back', 'Missing pending back action');
assertIncludes('data-prediction-task-description', 'Missing task description binding');
console.log('Prediction flow static checks passed.');
