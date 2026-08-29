# 低维材料预测任务流程优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 优化低维材料算法页的“发起预测”弹窗，并打通提交任务中间页、预测结果页和返回列表的交互流程。

**Architecture:** 当前项目是单文件静态 HTML 应用，页面、样式和脚本均集中在 `low-dim-materials.html`。沿用现有状态对象、页面路由和预测结果渲染函数，只补齐预测任务弹窗的信息层级、状态页文案/视觉和按钮跳转，不引入新依赖或后端接口。

**Tech Stack:** HTML、CSS、原生 JavaScript、现有内联页面路由与状态管理。

**Spec:** 用户确认的参考图风格与交互需求（本对话）。

## Global Constraints

- 保留现有未提交修改，不覆盖 MLFF 页面相关改动。
- 复用现有 CSS 变量、按钮样式和 `openPredictionPage` 路由。
- 提交任务后默认进入“预测处理中”中间页；“查看预测结果”进入当前材料的预测结果页；“返回列表”回到算法列表。
- 弹窗必须在桌面和窄屏下可用，必填字段需有校验提示。
- 不新增第三方依赖。

### Task 1: 现状基线与回归检查

**Files:**
- Inspect: `low-dim-materials.html`
- Test: `scripts/verify-mlff-red-fields-20260829.js`

- [x] 记录当前工作区差异，确认只在现有预测流程相关位置增量修改。
- [x] 执行已有静态检查，确保基线可运行。
- [x] 梳理预测弹窗 DOM、提交处理函数、处理中页面和结果页之间的现有状态字段。

### Task 2: 优化预测任务弹窗

**Files:**
- Modify: `low-dim-materials.html`（预测任务弹窗模板、交互脚本、弹窗 scoped CSS）
- Test: 新增 `scripts/verify-prediction-flow-20260829.js`

- [x] 为弹窗建立失败检查：关键标题、材料信息卡、算法分组、参数配置、任务描述、确认按钮和校验文案必须存在。
- [x] 运行检查确认失败或基线缺口。
- [x] 按参考图重排弹窗：顶部任务标题与关闭按钮；待预测材料信息卡；任务名称输入；算法分类与算法选择；计算参数；任务描述；底部预计耗时、取消、确认发起。
- [x] 补充必填校验、算法状态提示和选中态，确保确认按钮触发真实提交处理。
- [x] 保持已有数据绑定和算法选项兼容，不改变现有预测结果数据结构。
- [x] 运行静态检查确认弹窗结构与校验通过。

### Task 3: 完善提交中间页与结果页跳转

**Files:**
- Modify: `low-dim-materials.html`（`page-prediction-pending`、提交事件和返回事件）
- Test: `scripts/verify-prediction-flow-20260829.js`

- [x] 为处理中页面建立失败检查：处理中提示、耐心等待文案、任务摘要、查看结果按钮、返回列表按钮必须存在。
- [x] 运行检查确认缺口。
- [x] 优化处理中页面为独立的状态反馈卡，突出“正在调用算法预测结果”和预计等待时间。
- [x] 提交任务后保存当前任务上下文，进入处理中页面。
- [x] “查看预测结果”调用现有预测结果页并保持材料/算法上下文；“返回列表”恢复算法列表。
- [x] 检查浏览器后退、关闭弹窗和重复提交等边界行为。
- [x] 运行静态检查确认通过。

### Task 4: 浏览器端端到端验证

**Files:**
- Create: `scripts/verify-prediction-flow-browser.js`
- Create: `artifacts/prediction-flow-verify.png`

- [x] 使用项目已有本地页面启动方式运行应用。
- [x] 通过浏览器点击至少一个“发起预测”按钮，确认弹窗打开且字段可操作。
- [x] 验证提交后进入处理中页，点击查看结果进入结果页，点击返回列表返回算法列表。
- [x] 截取弹窗或流程页面截图，检查布局无溢出、按钮可见、中文文案正确。
- [x] 保存验证结果并记录失败项；若有问题，回到对应任务修复后重新验证。

### Task 5: 最终差异与完成前核验

**Files:**
- Inspect: `low-dim-materials.html`
- Inspect: `scripts/verify-prediction-flow-20260829.js`
- Inspect: `scripts/verify-prediction-flow-browser.js`

- [x] 重新运行全部相关检查。
- [x] 查看最终 diff，确认没有误改用户已有 MLFF 变更或生成无关文件。
- [x] 仅在检查输出明确通过后报告完成情况，并列出修改文件与验证方式。

