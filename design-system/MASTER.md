# UI Design System Master

Source: `UI设计规范文档.docx`

This project now uses `assets/ui-design-system.css` as the shared UI preset. Future page edits and new content should reuse these tokens and component rules first, then add only page-specific overrides when truly needed.

## Product Style

- Product type: B-end admin management system for low-dimensional materials.
- Visual language: reference-image style, ice-blue workspace, translucent topbar/sidebar, white glass-like content panels, bright blue primary actions.
- Primary color: `#1F63FF`; hover `#2F73FF`; active `#1856E6`; selected background `#EAF2FF`.
- Page background: `linear-gradient(118deg, #CFE3FF 0%, #EAF4FF 48%, #D8E9FF 100%)`.
- Shell surfaces: topbar `rgba(207,226,255,.86)`, sidebar `rgba(216,233,255,.72)`, content work area `rgba(238,246,255,.58)`.
- Component surfaces: cards/panels/tables use `rgba(255,255,255,.90-.92)` with light blue borders.

## Core Tokens

- Font family: `-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif`.
- Text: title `#1F2D3D`, primary `#25364D`, body `#34445C`, secondary `#526276`, muted `#7D8DA6`, disabled `#BFBFBF`.
- Borders: standard `#D7E4F8`, light `rgba(223,232,246,.92)`, divider `#E8EEF7`.
- Spacing: 8px grid; use `4, 8, 12, 16, 24, 32, 48px`.
- Radius: buttons/inputs `4px`, popovers/cards `6px`, larger cards/drawers `8-12px`, badges/pills `9999px`.
- Shadows: main cards are mostly shadowless; dropdowns/modals may use soft blue-gray elevation only when layering needs it.

## Layout Rules

- Header height: `64px`.
- Sider width: `clamp(300px, 20vw, 360px)`, collapsed `72px`.
- Content padding: `16px` for the reference-image compact admin layout.
- Use T-layout for admin pages: Header + Sider + Content.
- Keep content surfaces white/translucent on the ice-blue workspace background.

## Component Rules

- Buttons: primary is `#1F63FF` with white text; default is translucent white with `#D7E4F8` border; selected tabs/chips use `#EAF2FF`.
- Inputs: height `32-36px`, radius `4px`, translucent white background, focus ring `0 0 0 2px rgba(31,99,255,0.16)`.
- Tables: header background `rgba(245,249,255,.88)`, row hover `#F8FBFF`, selected row `#EAF2FF`.
- Forms: labels `13-14px`, field gaps `20-24px`, section gaps `32-40px`, multi-column gap `24-32px`.
- Modals: width around `520px`, radius `6px`, mask `rgba(0,0,0,0.45)`, header/body/footer spacing from the spec.
- Tabs: 32px height, selected text `#1F63FF`, underline or `#EAF2FF` selected background.
- Empty states: neutral gray or blue brand 3D-style visual, text uses `#999999` or `#595959`.

## Implementation Rules

- New styles should use variables from `assets/ui-design-system.css`.
- Do not introduce one-off raw colors when a token exists.
- The only broad decorative treatment should be the shared ice-blue page gradient; do not add extra gradient orbs/blobs.
- New cards, panels, tables, buttons, inputs, tags, modals, drawers, and navigation states should inherit the shared CSS classes before adding page-specific rules.
- Page-specific overrides should stay narrow and documented near the affected feature.
