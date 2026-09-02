$path = 'low-dim-materials.html'
$content = Get-Content -Raw $path
$checks = @(
  '任务描述',
  '数据来源类型',
  '创建任务',
  '结构特征',
  '确定并进入下一步',
  'twod-task-wizard'
)
$missing = $checks | Where-Object { $content -notmatch [regex]::Escape($_) }
if ($missing.Count -gt 0) {
  Write-Output ('FAIL missing: ' + ($missing -join ', '))
  exit 1
}
Write-Output 'PASS'
