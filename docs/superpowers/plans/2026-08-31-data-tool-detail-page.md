# 数据工具开发详情页统一展示 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将数据工具开发的查看详情页调整为与数据应用算法详情页一致的文档化展示结构。

**Architecture:** 复用现有算法详情页的视觉类名与布局结构，在工具详情渲染函数中生成工具专属的标题、功能特点、适用场景、API 调用示例、请求参数和返回结果；保留工具原有的下载与返回列表交互。

**Tech Stack:** 单文件 HTML、原生 JavaScript、现有 CSS 组件样式。

**Spec:** 用户提供的截图及“仿照数据应用算法的查看详情展示内容修改数据工具开发查看详情页面”的需求。

## Global Constraints

- 保留数据工具自身的业务内容，不改变工具列表、下载和使用手册行为。
- 详情页采用与数据应用算法一致的卡片、代码块和参数表结构。
- 修改后必须通过静态结构检查，并在浏览器中验证详情页展示与复制代码交互。

### Task 1: 统一工具详情页结构

**Files:**
- Modify: `C:\Users\Windows\Desktop\diwei\low-dim-materials.html`

- [ ] 替换工具详情渲染函数，复用算法详情页的文档结构。
- [ ] 增加工具 API 示例、请求参数表、返回结果表和使用说明区块。
- [ ] 增加工具详情页代码复制交互。
- [ ] 添加工具页面作用域样式，确保视觉与算法详情页一致。

### Task 2: 验证

**Files:**
- Test: `C:\Users\Windows\Desktop\diwei\low-dim-materials.html`

- [ ] 运行 HTML/脚本结构检查。
- [ ] 启动本地静态预览并进入数据工具开发详情页。
- [ ] 检查标题、代码块、请求参数、返回结果和复制代码按钮。
