$path = 'low-dim-materials.html'
$content = Get-Content -Raw $path
$checks = @(
  '{ key: "effectiveMass", label: "有效质量"',
  '{ key: "magneticTransitionTemperature", label: "磁转变温度"',
  '压电张量矩阵',
  'e11≈40 pC/m',
  'd11≈0.8 pm/V（单层面内）',
  'd33≈-200 pC/N（体相面外）',
  '磁矩',
  '声学支/光学支',
  '声子谱（是否有虚频）',
  '声子谱虚频判定',
  '态密度值'
)
$missing = $checks | Where-Object { $content -notmatch [regex]::Escape($_) }
$forbidden = @('class="missing-field-red">密度','class="missing-field-red">晶胞体积')
$presentForbidden = $forbidden | Where-Object { $content -match [regex]::Escape($_) }
if ($missing.Count -gt 0 -or $presentForbidden.Count -gt 0) {
  Write-Output ('FAIL missing: ' + ($missing -join ', '))
  Write-Output ('FAIL forbidden: ' + ($presentForbidden -join ', '))
  exit 1
}
Write-Output 'PASS'
