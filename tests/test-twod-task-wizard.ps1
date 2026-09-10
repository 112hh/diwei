$path = 'low-dim-materials.html'
$content = Get-Content -Raw $path
$checks = @(
  '任务描述',
  '数据来源类型',
  '创建任务',
  '结构特征',
  '确定并进入下一步',
  'twod-task-wizard',
  'twod-collection-method-card',
  'twod-target-dataset-panel',
  'twod-collection-params-panel',
  'twod-raw-files-panel',
  '获取原始数据文件',
  'twod-entry-mode-card',
  'twod-manual-entry-panel',
  'twod-entry-table',
  '添加一条数据',
  '已录入 2 / 1,280 条'
  ,'data-twod-resource-intro-screen'
  ,'进入采集方式'
  ,'twod-security-result-panel'
  ,'twod-security-basis'
  ,'twod-security-level-card'
  ,'判定结果：公开数据（I 级）'
  ,'twod-standardization-overview'
  ,'twod-standardization-progress'
  ,'twod-standardization-rule-card'
  ,'开始标准化处理'
  ,'已完成 1,248 / 1,280 条数据的标准化处理'
  ,'twod-submit-confirmation'
  ,'twod-task-info-card'
  ,'twod-processed-overview'
  ,'twod-data-preview'
  ,'我已确认上述数据信息准确无误'
  ,'提交入库'
  ,'twod-processing-step'
  ,'twod-processing-progress'
  ,'twod-processing-stat'
  ,'twod-processing-table'
  ,'数据清洗'
  ,'格式转换'
  ,'一键加工'
  ,'已加工 832 条，48 条异常待处理'
)
$missing = $checks | Where-Object { $content -notmatch [regex]::Escape($_) }
if ($missing.Count -gt 0) {
  Write-Output ('FAIL missing: ' + ($missing -join ', '))
  exit 1
}
Write-Output 'PASS'
