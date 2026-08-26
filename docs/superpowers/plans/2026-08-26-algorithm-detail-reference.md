# 算法详情截图式布局 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 保持现有左侧菜单栏不变，将数据应用算法的算法详情主体改为参考图中的精简文档布局。

**Architecture:** 继续使用单文件 `low-dim-materials.html` 的现有页面路由与算法数据源，复用统一算法文档生成逻辑输出标题、简介、功能特点、适用场景、API 示例和请求参数。算法详情仍通过现有 `algorithm-doc-detail` 页面打开，不改导航 DOM，仅移除详情页旧的页头和冗余文档区。

**Tech Stack:** HTML、CSS、原生 JavaScript、Playwright 验收脚本

**Spec:** 用户于 2026-08-26 确认的截图式算法详情方案（左侧菜单栏保持不变）

## Global Constraints

- 左侧菜单栏的分组、菜单项、文字和宽度保持不变。
- 原有算法数据、路由和复制代码能力保留。
- 截图之外的旧页头、返回按钮、基本信息、输出结果等内容暂不展示，不删除底层数据逻辑。

---

### Task 1: 添加算法详情页面验收检查

**Files:**
- Create: `scripts/verify-algorithm-detail-reference.cjs`

- [x] 验证当前页面不满足截图式精简布局。
- [x] 修改后验证菜单不变、主体结构和隐藏项符合要求。

### Task 2: 重构算法详情主体

**Files:**
- Modify: `low-dim-materials.html`

- [x] 统一生成截图所需的算法详情内容。
- [x] 将独立算法详情页切换为统一文档容器。
- [x] 添加页面范围样式并保持响应式布局。

### Task 3: 浏览器与语法验证

**Files:**
- Test: `scripts/verify-algorithm-detail-reference.cjs`

- [x] 运行 Playwright 验收脚本。
- [x] 检查页面脚本语法和控制台错误。
- [x] 查看最终差异，确认未改动左侧菜单定义。

