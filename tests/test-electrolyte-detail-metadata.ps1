$path = Join-Path $PSScriptRoot '..\low-dim-materials.html'
$html = Get-Content -Raw $path
$electrolyteCardPattern = '(?s)function renderElectrolyteStructureCard\(material, title = "3D结构示意"\).*?\n    }'
$match = [regex]::Match($html, $electrolyteCardPattern)
if (-not $match.Success) { throw 'electrolyte structure card renderer not found' }
$card = $match.Value
foreach ($label in @('数据来源','更新时间','数据质量')) {
  if ($card -match [regex]::Escape("<span>$label</span>")) { throw "electrolyte structure card still contains $label" }
}
$callCount = ([regex]::Matches($html, 'renderElectrolyteStructureCard\(material,')).Count
if ($callCount -lt 3) { throw "expected structure card to be reused by three or more electrolyte detail views, found $callCount" }
Write-Output "electrolyte detail metadata static acceptance passed ($callCount detail views)"
