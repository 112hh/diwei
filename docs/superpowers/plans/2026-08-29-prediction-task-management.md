# 预测任务管理页面复刻 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 将低维材料数据库分析预测中的“预测任务管理”页按参考图复刻为浅灰背景、四张统计卡片、紧凑筛选区、任务表格与分页的管理界面。

**Architecture:** 当前项目为单页静态 HTML 应用，预测任务管理页面由 `low-dim-materials.html` 中的渲染函数动态注入。保留既有数据与事件处理逻辑，改造该渲染函数输出结构，并增加仅作用于 `#page-prediction-tasks` 的样式，避免影响其他页面。

**Tech Stack:** HTML, CSS, vanilla JavaScript, existing static page runtime, Playwright screenshot verification.

**Spec:** 用户提供的预测任务管理参考图（2026-08-29 对话附件）。

## Global Constraints

- 不改变其他模块页面的业务逻辑。
- 保留查询、重置、查看结果、查看日志、重试、取消、新建任务等现有交互。
- 页面视觉目标为参考图的蓝色主色、浅灰页面底色、白色卡片、细边框、紧凑表格和中文管理后台风格。
- 兼容桌面宽度，并在窄屏下允许表格横向滚动。

### Task 1: 识别现有预测任务管理渲染入口

**Files:**
- Modify: `low-dim-materials.html`（仅在预测任务管理 override 脚本与其页面样式范围内）
- Create: `docs/superpowers/plans/2026-08-29-prediction-task-management.md`

- [x] 确认页面入口、数据数组、筛选状态、事件委托和现有 CSS 类。
- [x] 启动页面并获取当前 `prediction-tasks` 视觉基线截图。

### Task 2: 重构页面结构以匹配参考图

**Files:**
- Modify: `low-dim-materials.html` 的 `renderPredictionTaskManagementPage` 函数。

- [x] 增加面包屑、标题区、带图标的“新建预测任务”按钮。
- [x] 增加四张统计卡片：全部任务、运行中、已完成、失败/已取消。
- [x] 重构筛选区为搜索框、两个下拉框、日期范围输入、查询/重置按钮和快捷筛选标签。
- [x] 调整任务表格字段与示例数据展示，使其适合参考图中的任务名称、材料信息、算法名称、状态、创建人、创建时间、耗时和操作列。
- [x] 增加底部记录数与分页控件，保留现有事件绑定所需的 `data-*` 属性。

### Task 3: 增加页面专属视觉样式

**Files:**
- Modify: `low-dim-materials.html`，在页面末尾增加 `prediction-task-reference-layout` 样式块。

- [x] 按参考图设置页面背景、标题层级、卡片圆角、边框、阴影、色彩和间距。
- [x] 设置统计数字、状态标签、操作链接、头像、表头和分页的视觉层次。
- [x] 设置 1440px 桌面布局与窄屏表格横向滚动。
- [x] 添加键盘焦点与按钮禁用态，不以颜色作为唯一状态传达方式。

### Task 4: 运行验证与视觉修正

**Files:**
- Create: `artifacts/prediction-task-management-final.png`
- Create: `artifacts/prediction-task-management-final.html`

- [x] 启动静态页面并导航到 `prediction-tasks`。
- [x] 用 Playwright 等待页面稳定后截图，并检查页面无明显控制台错误。
- [x] 验证查询、重置、快捷筛选、取消/重试和分页按钮仍能触发。
- [x] 根据截图对齐参考图中的布局差异并再次截图。

