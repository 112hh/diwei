param([string]$Path = (Join-Path $PSScriptRoot '..\low-dim-materials.html'))
$html = Get-Content -Raw -LiteralPath $Path
$expectedHeaders = @('材料编号','中文名称','英文名称','化学式','数据集类型','体系规模','体系类型','电荷','多极矩','极化率','色散系数','操作')
$headerBlock = [regex]::Match($html, '<table class="twod-result-table">(?s:.*?)</table>').Value
foreach ($header in $expectedHeaders) {
  if ($headerBlock -notmatch [regex]::Escape("<th>$header</th>")) { throw "列表缺少字段：$header" }
}
$detailTreeBlock = [regex]::Match($html, 'function renderMlffDetailTreeOverride\(\) \{(?s:.*?)\n    \}') .Value
$expectedSections = @('基础信息','分子结构','小体系结构','大体系结构')
foreach ($section in $expectedSections) {
  if ($detailTreeBlock -notmatch [regex]::Escape("label: \"$section\"")) { throw "详情菜单缺少：$section" }
}
foreach ($removed in @('label: "原子电荷"','label: "多级矩"')) {
  if ($detailTreeBlock -match [regex]::Escape($removed)) { throw "详情菜单仍包含不需要的项目：$removed" }
}
Write-Output 'MLFF adjustment checks passed.'
