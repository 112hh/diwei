# 低维材料缺失字段样式与页面调整实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 按需求完善二维材料、电解质材料和有机光电材料页面中的缺失字段标红、字段命名、外部数据关联列表和数据来源展示。

**Architecture:** 继续在现有单文件静态应用 `low-dim-materials.html` 中修改页面模板、样式和数据配置；优先复用已有字段渲染类名与页面状态切换逻辑，不进行大规模重构。通过现有 Playwright 验证脚本和新增针对需求的静态/页面断言验证。

**Tech Stack:** HTML、CSS、原生 JavaScript、Playwright、Node.js。

**Spec:** 用户 2026-08-28 提供的低维材料主题应用页面改造需求。

## Global Constraints

- 只修改 `C:\Users\Windows\Desktop\diwei` 项目内文件。
- 缺失字段使用红色字体，不改变数据内容与现有业务流程。
- 电解质图谱信息字段统一使用“图”后缀。
- 有机光电材料删除“数据来源”展示。

### Task 1: 定位现有页面与字段渲染点

**Files:**
- Inspect: `C:\Users\Windows\Desktop\diwei\low-dim-materials.html`
- Inspect: `C:\Users\Windows\Desktop\diwei\scripts\verify-*.cjs`

- [ ] 搜索三个应用的列表表头、详情字段、图谱字段和外部关联列表。
- [ ] 记录现有 CSS 类名、数据属性和渲染函数，确定最小修改范围。

### Task 2: 二维材料字段标红

**Files:**
- Modify: `C:\Users\Windows\Desktop\diwei\low-dim-materials.html`

- [ ] 为列表表头“密度、晶胞体积、元素组成、数据来源”增加缺失字段红色样式。
- [ ] 为详情页原子结构图、原子坐标、晶格夹角、能带图、态密度图、磁矩、磁转变温度、声子谱、声子态密度、反位缺陷增加红色样式。

### Task 3: 电解质材料页面调整

**Files:**
- Modify: `C:\Users\Windows\Desktop\diwei\low-dim-materials.html`

- [ ] 将列表“性状、安全等级”表头标红。
- [ ] 将详情中的晶系、晶胞参数、空间群和计算信息全部字段标红。
- [ ] 将图谱信息中的字段名称统一补“图”后缀。
- [ ] 调整外部数据关联页面：同元素不同结构材料检索结果置顶，删除来源列，新增参考文献列，操作列仅保留下载。

### Task 4: 有机光电材料页面调整

**Files:**
- Modify: `C:\Users\Windows\Desktop\diwei\low-dim-materials.html`

- [ ] 将详情中的 3D 分子结构图、相对分子质量、CAS 号、InChIKey、SMILES、类别 Family、含杂原子/检索命中标红。
- [ ] 删除有机光电材料“数据来源”字段。
- [ ] 将表征图谱全部字段标红。

### Task 5: 验证

**Files:**
- Create: `C:\Users\Windows\Desktop\diwei\scripts\verify-missing-fields-20260828.cjs`

- [ ] 添加静态断言检查关键字段/列/文字。
- [ ] 使用 Chrome + Playwright 验证页面可加载、三类页面可切换、详情和关联列表存在且结构符合需求。
- [ ] 运行现有相关验证脚本，确认无回归。
