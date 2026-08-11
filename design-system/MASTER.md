# UI Design System Master

This file is the source of truth for every page in this project.

Sources:

- Lanhu project: `设计规范（官方）`
- Local reference: `UI设计规范文档.docx`
- Reference screen: `codex-clipboard-2a9f0168-b656-452d-8cc6-9ea7c54c8b53.png`

When adding or editing a page, reuse the tokens and component rules in
`assets/ui-design-system.css`. Page-specific CSS must stay narrow and must not
redefine the shared brand, spacing, typography, radius, shadow, or component
states.

## Product Language

- Product: B-end scientific data and low-dimensional materials workspace.
- Layout: fixed header + left sider + dense content work area.
- Tone: quiet, precise, light, and work-focused.
- Surfaces: white component surfaces on a neutral light-gray page background.
- Emphasis: blue is reserved for the current route and primary actions.
- Avoid decorative gradients, oversized rounded cards, glass blobs, emoji icons,
  and marketing-style hero composition in application pages.

## Color Tokens

Brand:

- Primary: `#1677FF`
- Hover: `#4096FF`
- Active: `#0958D9`
- Light/selected: `#E6F4FF`

Semantic:

- Success: `#52C41A`
- Warning: `#FAAD14`
- Warning icon: `#FA8C16`
- Danger: `#FF4D4F`

Text:

- Title: `#1A1A2E`
- Primary: `#262626`
- Secondary: `#595959`
- Tertiary: `#666666`
- Muted and placeholder: `#8C8C8C`
- Disabled: `#BFBFBF`

Surfaces:

- Page: `#F5F7FA`
- Component: `#FFFFFF`
- Hover: `#F5F5F5`
- Table header: `#F5F5F5`
- Border: `#D9D9D9`
- Light border: `#E8E8E8`
- Divider: `#F0F0F0`

## Layout And Spacing

- Header: `56-64px`; project default is `64px`.
- Sider: `200-256px`; project default is `256px`.
- Collapsed sider: `64px`.
- Secondary header: `48px`.
- Content padding: `16-24px`; use `24px` for the main work area.
- Spacing scale: `4 / 8 / 12 / 16 / 24 / 32 / 48px`.
- Keep a clear 8px rhythm between controls and content blocks.

## Typography

- Font stack: system UI, PingFang SC, Microsoft YaHei, Segoe UI, Arial.
- Body: `14px`, line-height `1.5`.
- Caption: `12px`.
- H3: `14px`, weight `500-600`.
- H2: `16px`, weight `600`.
- H1: `18px`, weight `600-700`.
- Display: `20-24px`, weight `600`.
- Letter spacing is `0`; do not use compressed tracking.

## Components

Buttons:

- Large/medium/small heights: `40 / 32 / 24px`.
- Primary: blue background with white text.
- Default: white background with `#D9D9D9` border.
- Link and text actions remain visually subordinate.
- Radius: `4px`.

Inputs:

- Height: `32-36px`.
- Radius: `4px`.
- Focus ring: `0 0 0 2px rgba(22,119,255,0.2)`.
- Every field has a visible label; placeholders are not labels.

Tables:

- Header height: `40-48px`.
- Row height: `40-44px`.
- Header background: `#F5F5F5`.
- Hover background: `#FAFAFA`.
- Selected background: `#E6F4FF`.
- Pagination is right aligned and includes total, page controls, and page size.

Tabs:

- Default height: `32px`.
- Active text: `#1677FF`.
- Active state uses an underline or `#E6F4FF` background.

Navigation:

- Level 1 item height: `44-48px`.
- Level 2 item height: `36-40px`.
- Icons sit on the left and use the Lanhu asset set.
- Active state uses blue text plus a light blue background.

Cards, drawers, and modals:

- Cards/drawers: `8-12px` radius.
- Modal/popover: `4-6px` radius.
- Modal width: `520-560px`.
- Mask: `rgba(0,0,0,0.45)`.
- Use the shared shadow scale only when the layer needs elevation.

## Icon Policy

Icons must come from exported/cut assets in the Lanhu UI design. Do not use
emoji, text abbreviations such as `DB` or `EL`, guessed logo paths, or a second
icon family. Store imported assets under `assets/lanhu-icons/` and register
each asset in `assets/lanhu-icons/manifest.json` with its source board and
intended usage.

Until a Lanhu asset is available, leave the icon slot empty or use an existing
project asset already mapped in the manifest. Do not create a replacement icon
just to fill the space.

## Implementation Rules

- Use semantic CSS variables from `assets/ui-design-system.css`.
- Do not hardcode a token value inside a component when a shared token exists.
- Keep page overrides close to the page feature and avoid global `!important`
  rules in new code.
- Respect keyboard focus, visible labels, reduced motion, and minimum 44px
  interactive hit areas for icon-only controls.
- Validate desktop and narrow layouts before delivery.
