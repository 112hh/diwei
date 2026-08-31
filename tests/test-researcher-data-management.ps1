$path = Join-Path $PSScriptRoot '..\low-dim-materials.html'
$html = Get-Content -Raw $path
$groupsPattern = "var normalAllowedGroups = \['applications','analysis','workflow'\]"
$portalsPattern = "var normalAllowedPortals = \['applications','algorithms','tools','workflow'\]"
if ($html -notmatch $groupsPattern) { throw 'workflow group is not allowed for researcher' }
if ($html -notmatch $portalsPattern) { throw 'workflow portal is not allowed for researcher' }
if ($html -notmatch 'data-page="data-submit"' -or $html -notmatch 'data-page="my-submissions"') { throw 'upload or submissions nav missing' }
Write-Output 'researcher data management static acceptance passed'
