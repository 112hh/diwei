param(
  [string]$Source = "C:\Users\Windows\Desktop\diwei\低维材料主题库-工作副本.xlsx",
  [string]$Output = "C:\Users\Windows\Desktop\diwei\低维材料主题库-补充完善版.xlsx"
)

Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-EntryText($zip, [string]$name) {
  $entry = $zip.GetEntry($name)
  if (-not $entry) { return $null }
  $reader = [System.IO.StreamReader]::new($entry.Open())
  try { return $reader.ReadToEnd() } finally { $reader.Dispose() }
}

function Get-ColIndex([string]$ref) {
  $letters = ([regex]::Match($ref, '^[A-Z]+')).Value
  $n = 0
  foreach ($ch in $letters.ToCharArray()) {
    $n = $n * 26 + ([int][char]$ch - [int][char]'A' + 1)
  }
  return $n
}

function Get-ColName([int]$index) {
  $name = ""
  while ($index -gt 0) {
    $index--
    $name = [char]([int][char]'A' + ($index % 26)) + $name
    $index = [math]::Floor($index / 26)
  }
  return $name
}

function Escape-Xml([string]$value) {
  if ($null -eq $value) { return "" }
  return [System.Security.SecurityElement]::Escape($value)
}

function Get-CellValue($cell, $sharedStrings) {
  $type = $cell.GetAttribute('t')
  if ($type -eq 'inlineStr') {
    return (($cell.SelectNodes('.//*[local-name()="t"]') | ForEach-Object { $_.InnerText }) -join '')
  }
  $vNode = $cell.ChildNodes | Where-Object { $_.LocalName -eq 'v' } | Select-Object -First 1
  if (-not $vNode) { return "" }
  if ($type -eq 's') { return $sharedStrings[[int]$vNode.InnerText] }
  return $vNode.InnerText
}

function New-CellXml([int]$rowIndex, [int]$colIndex, [string]$value, [string]$style, [switch]$Number) {
  $ref = "$(Get-ColName $colIndex)$rowIndex"
  if ($Number) {
    return "<c r=`"$ref`" s=`"$style`"><v>$value</v></c>"
  }
  $escaped = Escape-Xml $value
  return "<c r=`"$ref`" s=`"$style`" t=`"inlineStr`"><is><t xml:space=`"preserve`">$escaped</t></is></c>"
}

function New-RowXml([int]$rowIndex, [object[]]$values) {
  $styles = @("13", "14", "14", "14", "15", "15", "15", "16", "14", "14", "17", "17", "16", "18", "13", "18")
  $cells = New-Object System.Collections.Generic.List[string]
  for ($i = 0; $i -lt $values.Count; $i++) {
    $value = [string]$values[$i]
    if ($i -eq 0 -and $value -match '^\d+$') {
      $cells.Add((New-CellXml $rowIndex ($i + 1) $value $styles[$i] -Number))
    } else {
      $cells.Add((New-CellXml $rowIndex ($i + 1) $value $styles[$i]))
    }
  }
  return "<row r=`"$rowIndex`" spans=`"1:16`">$($cells -join '')</row>"
}

function New-Supplement([hashtable]$row) {
  $path = "$($row.K)>$($row.L)>$($row.M)"
  if ($row.M -like '*应用算法') {
    return "补充输入输出闭环：明确算法输入数据格式、参数配置、模型/规则处理过程、结果输出、可视化展示、批量导出、版本记录和异常提示；验收以样例数据可运行、输出结果可复核、过程日志可追踪为准。"
  }
  if ($row.L -eq '数据工具开发') {
    return "补充工具闭环：覆盖数据导入、参数配置、任务执行、质量校验、结果预览、文件导出、模型/规则版本管理、权限控制和操作日志；验收以端到端任务可完成并能回溯为准。"
  }
  if ($row.K -eq '低维材料数据入库') {
    return "补充入库闭环：覆盖数据来源登记、采集批次管理、字段映射、格式转换、去重清洗、质量校验、入库审核、统计看板和问题回退，确保采集加工量、来源、版本和责任人可追溯。"
  }
  if ($row.K -eq '低维材料数据标准化') {
    return "补充标准化闭环：覆盖原始数据接收、标准模板匹配、单位/格式/图谱/表格规范化、质检规则执行、异常项修订、标准化数据发布和版本留痕。"
  }
  if ($row.K -eq '低维材料数据库') {
    return "补充数据库闭环：覆盖数据集目录、字段字典、关联关系、查询索引、详情展示、下载共享、质量标签、更新周期和审计记录，保证数据可查、可用、可验收。"
  }
  if ($row.K -eq '低维材料主题应用') {
    return "补充应用闭环：覆盖检索条件输入、结果筛选排序、详情查看、可视化分析、对比、导出/共享、权限校验和用户反馈，确保从查找到使用形成完整链路。"
  }
  if ($row.K -eq '低维材料标准体系') {
    return "补充标准闭环：覆盖标准目录、适用范围、字段规范、质量规则、验收指标、维护版本和引用关系，支撑后续采集、标准化、建库和应用。"
  }
  return "补充业务闭环：明确输入、处理规则、输出结果、质量校验、异常反馈、权限控制和验收口径，确保功能可执行、可追踪、可复核。"
}

function New-AddedRow(
  [string]$E, [string]$F, [string]$G,
  [string]$K, [string]$L, [string]$M, [string]$N,
  [string]$P
) {
  return @{
    B = '数据融合中枢'; C = '科学数据中心'; D = '低维材料主题库';
    E = $E; F = $F; G = $G;
    H = '数据融合中枢'; I = '科学数据中心'; J = '低维材料主题库';
    K = $K; L = $L; M = $M; N = $N; O = '是（已补充）'; P = $P;
  }
}

$sourceZip = [System.IO.Compression.ZipFile]::OpenRead($Source)
try {
  $sheetText = Get-EntryText $sourceZip 'xl/worksheets/sheet1.xml'
  $sharedText = Get-EntryText $sourceZip 'xl/sharedStrings.xml'
  $sharedStrings = @()
  if ($sharedText) {
    $sharedXml = [xml]$sharedText
    foreach ($si in $sharedXml.DocumentElement.ChildNodes) {
      $sharedStrings += (($si.SelectNodes('.//*[local-name()="t"]') | ForEach-Object { $_.InnerText }) -join '')
    }
  }

  $sheetXml = [xml]$sheetText
  $rows = $sheetXml.SelectNodes('//*[local-name()="sheetData"]/*[local-name()="row"]')
  $matrix = @()
  foreach ($r in $rows) {
    $row = @{}
    foreach ($cell in ($r.ChildNodes | Where-Object { $_.LocalName -eq 'c' })) {
      $row[(Get-ColIndex $cell.GetAttribute('r'))] = Get-CellValue $cell $sharedStrings
    }
    $matrix += ,$row
  }

  $dataRows = New-Object System.Collections.Generic.List[hashtable]
  $carry = @{ B=''; C=''; D=''; E=''; F=''; G='' }
  for ($ri = 3; $ri -lt $matrix.Count; $ri++) {
    $row = $matrix[$ri]
    foreach ($key in @('B','C','D','E','F','G')) {
      $idx = [int][char]$key - [int][char]'A' + 1
      $value = [string]$row[$idx]
      if (-not [string]::IsNullOrWhiteSpace($value)) { $carry[$key] = $value }
    }
    if (-not [string]::IsNullOrWhiteSpace([string]$row[7]) -and [string]::IsNullOrWhiteSpace([string]$row[6])) {
      $carry.F = '/'
    }
    $item = @{
      B=$carry.B; C=$carry.C; D=$carry.D; E=$carry.E; F=$carry.F; G=$carry.G;
      H=[string]$row[8]; I=[string]$row[9]; J=[string]$row[10]; K=[string]$row[11]; L=[string]$row[12]; M=[string]$row[13]; N=[string]$row[14]; O=[string]$row[15]; P=''
    }
    if ([string]::IsNullOrWhiteSpace($item.F)) { $item.F = '/' }
    if ([string]::IsNullOrWhiteSpace($item.M)) { $item.M = '/' }
    $item.P = New-Supplement $item
    if ($item.O -like '否*' -or $item.O -like '大部分满足*') {
      $item.O = '是（已补充）'
    }
    $dataRows.Add($item)

    if (($ri + 1) -eq 25) {
      $g = $carry.G
      $dataRows.Add((New-AddedRow '低维材料数据入库' '/' $g '低维材料数据入库' '机器学习力场数据采集加工处理' '数据资源加工' '对机器学习力场原始数据进行去重、字段映射、单位统一、格式转换、异常值识别和标签标准化，形成可直接用于模型训练的训练集、验证集和测试集，并记录来源、计算方法、版本、质量标签及处理日志。' '补齐机器学习力场数据从采集、录入到加工质检的闭环。'))
      $dataRows.Add((New-AddedRow '低维材料数据入库' '/' $g '低维材料数据入库' '催化材料数据采集加工处理' '数据资源采集' '采集催化材料元素特征、结构特征、单原子催化剂、二元合金、晶界、体系特征及反应路线等数据，记录来源库、文献、计算任务、采集批次和数据授权信息，支撑不少于34920条催化材料数据采集加工要求。' '补齐催化材料数据来源登记和采集批次管理。'))
      $dataRows.Add((New-AddedRow '低维材料数据入库' '/' $g '低维材料数据入库' '催化材料数据采集加工处理' '数据资源录入' '提供催化材料结构文件、吸附构型、反应条件、吸附能、反应能垒、活性/选择性/稳定性指标等录入模板，支持批量导入、字段校验、重复检查、必填项提示和录入审核。' '补齐催化材料数据结构化录入和审核。'))
      $dataRows.Add((New-AddedRow '低维材料数据入库' '/' $g '低维材料数据入库' '催化材料数据采集加工处理' '数据资源加工' '对催化材料数据开展格式标准化、单位换算、结构文件解析、特征生成、异常值识别、图谱/图片规范化和质量分级，输出可入库的数据表、结构文件、特征文件和质检报告。' '补齐催化材料清洗加工、质检和成果输出。'))
      $dataRows.Add((New-AddedRow '低维材料数据入库' '/' $g '低维材料数据入库' '催化材料数据采集加工处理' '数据安全等级' '按照公开数据、内部加工数据、受限共享数据等等级对催化材料数据进行分类管理，绑定访问权限、下载审批、脱敏规则和操作审计，确保数据共享与安全管控同步落地。' '补齐催化材料数据安全分级与权限审计。'))
    }

    if (($ri + 1) -eq 66) {
      $g = $carry.G
      $dataRows.Add((New-AddedRow '低维材料主题应用' '电解质材料数据应用' $g '低维材料主题应用' '电解质材料数据应用' '化学名称检索' '支持按中文名、英文名、别名及缩写检索有机电解液、固态有机电解质和固态无机电解质，返回基础信息、结构信息、物性数据、计算数据和安全信息。' '补齐电解质材料按名称查询入口。'))
      $dataRows.Add((New-AddedRow '低维材料主题应用' '电解质材料数据应用' $g '低维材料主题应用' '电解质材料数据应用' '分子式检索' '支持按分子式、组成元素和化学计量比检索电解质材料，提供模糊匹配、精确匹配、结果筛选、详情查看和导出能力。' '补齐电解质材料按分子式查询入口。'))
      $dataRows.Add((New-AddedRow '低维材料主题应用' '电解质材料数据应用' $g '低维材料主题应用' '电解质材料数据应用' '分子编号检索' '支持按材料编号、CAS号、内部数据编号和计算任务编号定位电解质材料条目，关联展示来源、版本、质检状态和相关数据集。' '补齐电解质材料按编号追踪入口。'))
      $dataRows.Add((New-AddedRow '低维材料主题应用' '电解质材料数据应用' $g '低维材料主题应用' '电解质材料数据应用' '关键词检索' '支持围绕电解质类型、晶体结构、官能团、应用场景、安全属性和文献关键词进行组合检索，并提供高亮、筛选和排序。' '补齐电解质材料关键词检索能力。'))
      $dataRows.Add((New-AddedRow '低维材料主题应用' '电解质材料数据应用' $g '低维材料主题应用' '电解质材料数据应用' '材料性质检索' '支持按熔点、沸点、电导率、介电常数、HOMO、LUMO、溶剂化能、带隙、玻璃化转变温度等性质范围筛选，并支持多条件组合与结果对比。' '补齐电解质材料性质筛选和对比。'))
      $dataRows.Add((New-AddedRow '低维材料主题应用' '电解质材料数据应用' $g '低维材料主题应用' '电解质材料数据应用' '电解质材料数据共享' '支持按权限下载电解质材料结构文件、表格数据、图谱数据和计算结果，提供申请审批、引用信息、下载记录、共享范围控制和数据使用反馈。' '补齐电解质材料数据共享闭环。'))
    }
  }

  for ($i = 0; $i -lt $dataRows.Count; $i++) {
    $dataRows[$i].A = [string]($i + 1)
  }

  $rowXml = New-Object System.Collections.Generic.List[string]
  $rowXml.Add('<row r="1" spans="1:16"><c r="A1" s="4" t="inlineStr"><is><t xml:space="preserve">需求与原型比对</t></is></c></row>')
  $rowXml.Add('<row r="2" spans="1:16"><c r="B2" s="7" t="inlineStr"><is><t xml:space="preserve">招标文件</t></is></c><c r="H2" s="8" t="inlineStr"><is><t xml:space="preserve">需求规格说明书</t></is></c></row>')
  $headers = @('编号','一级功能','二级功能','三级功能','四级功能','五级功能','招标需求描述','一级功能','二级功能','三级功能','四级功能','五级功能','六级功能','需规功能描述','是否通过','业务闭环补充说明')
  $headerCells = New-Object System.Collections.Generic.List[string]
  for ($i = 0; $i -lt $headers.Count; $i++) {
    $style = if ($i -eq 0) { '10' } elseif ($i -lt 7) { '11' } else { '12' }
    $headerCells.Add((New-CellXml 3 ($i + 1) $headers[$i] $style))
  }
  $rowXml.Add("<row r=`"3`" spans=`"1:16`">$($headerCells -join '')</row>")

  $excelRow = 4
  foreach ($r in $dataRows) {
    $values = @($r.A,$r.B,$r.C,$r.D,$r.E,$r.F,$r.G,$r.H,$r.I,$r.J,$r.K,$r.L,$r.M,$r.N,$r.O,$r.P)
    $rowXml.Add((New-RowXml $excelRow $values))
    $excelRow++
  }
  $lastRow = $excelRow - 1
  $newSheetData = "<sheetData>$($rowXml -join '')</sheetData>"

  $sheetText = [regex]::Replace($sheetText, '<dimension ref="[^"]+"\/>', "<dimension ref=`"A1:P$lastRow`"/>")
  $sheetText = [regex]::Replace($sheetText, '<cols>.*?</cols>', '<cols><col min="1" max="1" width="6.62962962962963" style="2" customWidth="1"/><col min="2" max="6" width="15.6296296296296" style="2" customWidth="1"/><col min="7" max="7" width="30.6296296296296" style="2" customWidth="1"/><col min="8" max="13" width="15.6296296296296" style="2" customWidth="1"/><col min="14" max="14" width="50.6296296296296" style="3" customWidth="1"/><col min="15" max="15" width="19.4074074074074" style="2" customWidth="1"/><col min="16" max="16" width="42" style="3" customWidth="1"/><col min="17" max="16384" width="8.73148148148148" style="3"/></cols>', 'Singleline')
  $sheetText = [regex]::Replace($sheetText, '<sheetData>.*?</sheetData>', $newSheetData, 'Singleline')
  $mergeBlock = '<mergeCells count="3"><mergeCell ref="A1:P1"/><mergeCell ref="B2:G2"/><mergeCell ref="H2:P2"/></mergeCells>'
  $sheetText = [regex]::Replace($sheetText, '<mergeCells count="[^"]+">.*?</mergeCells>', $mergeBlock, 'Singleline')

  if (Test-Path -LiteralPath $Output) { Remove-Item -LiteralPath $Output -Force }
} finally {
  $sourceZip.Dispose()
}

$inZip = [System.IO.Compression.ZipFile]::OpenRead($Source)
$outZip = [System.IO.Compression.ZipFile]::Open($Output, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($entry in $inZip.Entries) {
    $newEntry = $outZip.CreateEntry($entry.FullName, [System.IO.Compression.CompressionLevel]::Optimal)
    $outStream = $newEntry.Open()
    try {
      if ($entry.FullName -eq 'xl/worksheets/sheet1.xml') {
        $writer = [System.IO.StreamWriter]::new($outStream, [System.Text.UTF8Encoding]::new($false))
        try { $writer.Write($sheetText) } finally { $writer.Dispose() }
      } else {
        $inStream = $entry.Open()
        try { $inStream.CopyTo($outStream) } finally { $inStream.Dispose() }
      }
    } finally {
      $outStream.Dispose()
    }
  }
} finally {
  $inZip.Dispose()
  $outZip.Dispose()
}

Write-Output "已生成：$Output"
