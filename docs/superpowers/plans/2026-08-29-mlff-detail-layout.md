# 机器学习力场详情页面改造实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在现有机器学习力场详情页面中，按需求重排基础信息、分子结构、小体系结构和大体系结构的字段与结构图布局，同时保留现有系统风格和下载能力。

**Architecture:** 继续使用当前单文件静态应用的渲染函数与事件代理机制，不引入新依赖。通过替换 MLFF 详情页的渲染函数、补充结构字段映射和样式覆盖，实现四个详情子页面的一致双栏布局；下载入口继续复用现有 `triggerMlffDownload`。

**Tech Stack:** HTML、CSS、原生 JavaScript、现有 3D/结构渲染和下载工具。

**Spec:** 用户 2026-08-29 确认的机器学习力场详情页面调整需求。

## Global Constraints

- 保持当前系统的蓝白配色、卡片、导航树和按钮风格。
- 基础信息页必须保留 3D 结构图下方的相关文件下载。
- 分子结构页必须左信息右 3D 图，图下提供 PDB 下载。
- 小体系/大体系页必须左侧体系信息、右侧结构图，图下展示结构参数。
- 大体系页必须提供完整结构图像下载，并展示图片名称、格式和完整结构描述。
- 对缺少真实数据的字段展示“未记录”，不伪造不可用的真实计算结果。

---

### Task 1: 调整 MLFF 详情页渲染结构

**Files:**
- Modify: `C:/Users/Windows/Desktop/diwei/low-dim-materials.html` MLFF 详情渲染函数区域（约 63666-63894 行）

- [ ] 替换基础信息页字段集合，确保包含材料编号、材料中文名称、英文名称、化学式、数据集类型、体系规模、体系类型、电荷、多极矩、极化率、色散系数。
- [ ] 维持 3D 结构图与下载卡片在同一右侧区域，增加参数力场包/PDB/XML 等相关文件入口。
- [ ] 将分子结构页调整为左侧分子字段信息、右侧 3D 结构图，图下提供明确的 PDB 下载按钮。
- [ ] 将小体系结构页调整为左侧体系名称/类型/原子总数/分子数/力场类型，右侧结构图及图下结构参数。
- [ ] 将大体系结构页调整为左侧同类体系信息，右侧结构图、结构参数、完整结构图像下载及图片元信息。

### Task 2: 补充可复用的数据/展示辅助函数与样式

**Files:**
- Modify: `C:/Users/Windows/Desktop/diwei/low-dim-materials.html` MLFF 详情样式和辅助函数区域

- [ ] 增加安全字段读取、数量统计、结构参数和下载元信息的复用逻辑。
- [ ] 增加大体系图像下载能力，使用当前浏览器端下载模式生成 SVG/PNG 可用的结构图文件。
- [ ] 增加响应式双栏布局，保证窄屏下自动堆叠。

### Task 3: 验证页面行为

**Files:**
- Test/Verify: `C:/Users/Windows/Desktop/diwei/low-dim-materials.html`

- [ ] 使用本地浏览器打开页面并进入 MLFF 详情。
- [ ] 分别验证基础信息、分子结构、小体系结构、大体系结构四个导航项的布局和字段文案。
- [ ] 验证 PDB、结构文件和完整结构图像下载按钮可触发。
- [ ] 运行 HTML/JavaScript 基础语法检查与页面截图检查。
