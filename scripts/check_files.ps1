Add-Type -AssemblyName System.Text.Encoding
$files = Get-ChildItem -Path 'C:\Users\Windows\Desktop\diwei' -Filter *.html -Recurse

# Use byte arrays for Chinese strings to avoid encoding issues
# 低维材料主题库
$lowDimSubjectLib = [System.Text.Encoding]::UTF8.GetString([byte[]]@(232,174,176,231,160,129,231,155,180,231,173,137,231,160,141,232,181,143))
# 二维材料
$twoDim = [System.Text.Encoding]::UTF8.GetString([byte[]]@(232,128,179,231,172,172,231,155,180,231,173,137))
# 检索
$search = [System.Text.Encoding]::UTF8.GetString([byte[]]@(230,176,145,231,186,167))
# 低维
$lowDim = [System.Text.Encoding]::UTF8.GetString([byte[]]@(232,174,176,231,160,129))
# 主题库
$subjLib = [System.Text.Encoding]::UTF8.GetString([byte[]]@(231,160,141,232,181,143))
# icon
$icon = 'icon'

$needles = @($lowDimSubjectLib, $twoDim, $search, $lowDim, $subjLib, $icon)

foreach ($f in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
    $text = [System.Text.Encoding]::UTF8.GetString($bytes)
    $name = $f.Name
    $matches = @()
    foreach ($n in $needles) {
        if ($text -match [regex]::Escape($n)) {
            $matches += $n
        }
    }
    if ($matches.Count -gt 0) {
        Write-Host ("=== " + $name + " ===")
        Write-Host ("  Matches: " + ($matches -join ', '))
    } else {
        Write-Host ("NOT: " + $name)
    }
}
