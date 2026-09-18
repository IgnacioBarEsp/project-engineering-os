---
name: Obsidian Precision Studio
colors:
  surface: '#0f131d'
  surface-dim: '#0f131d'
  surface-bright: '#353944'
  surface-container-lowest: '#0a0e18'
  surface-container-low: '#171b26'
  surface-container: '#1c1f2a'
  surface-container-high: '#262a35'
  surface-container-highest: '#313540'
  on-surface: '#dfe2f1'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dfe2f1'
  inverse-on-surface: '#2c303b'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00885d'
  on-tertiary-container: '#000703'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0f131d'
  on-background: '#dfe2f1'
  surface-variant: '#313540'
typography:
  display-xl:
    fontFamily: Geist
    fontSize: 3.5rem
    fontWeight: '600'
    lineHeight: 4rem
    letterSpacing: -0.04em
  display-xl-mobile:
    fontFamily: Geist
    fontSize: 2.25rem
    fontWeight: '600'
    lineHeight: 2.75rem
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Geist
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: 2.5rem
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 1.25rem
    fontWeight: '500'
    lineHeight: 1.75rem
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Geist
    fontSize: 1rem
    fontWeight: '500'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
  body-md:
    fontFamily: Geist
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-sm:
    fontFamily: Geist
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1.25rem
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 0.8125rem
    fontWeight: '500'
    lineHeight: 1.25rem
    letterSpacing: -0.01em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 0.6875rem
    fontWeight: '400'
    lineHeight: 1rem
    letterSpacing: 0.02em
  code-inline:
    fontFamily: JetBrains Mono
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.375rem
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-md: 1.5rem
  gutter-lg: 2rem
  margin: 1rem
  margin-md: 2rem
  margin-lg: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The design system delivers an elite, distraction-free environment engineered for technical focus, system observability, and high-velocity development. It bridges raw engineering power with refined architectural elegance, speaking directly to systems architects, staff engineers, and infrastructure leads.

The aesthetic fuses **Modern Technical Minimalism** with **Refined Dark Glassmorphism**:
- Deep obsidian foundations anchor the interface, eliminating eye fatigue during prolonged low-light sessions.
- Precision glass overlays and semi-translucent surfaces expose layered depth without relying on decorative clutter.
- Luminous electric accents deliver functional hierarchy and immediate telemetry feedback.
- Strict typographic discipline keeps visual weight predictable and code-centric.

## Colors
The palette is built on deep carbon and obsidian planes, lit by high-chroma electric accents.

- **Obsidian Neutrals**: Base canvas at `#0B0F19`, transitioning to elevated workspace planes at `#111827`, `#1E293B`, and `#334155`. Soft text scales from primary `#F8FAFC` to muted `#94A3B8` and structural border `#1E293B` or semi-transparent `rgba(255, 255, 255, 0.08)`.
- **Primary Electric Indigo (`#6366F1`)**: The cognitive engine. Governs key execution triggers, active states, pipeline runs, and selection halos.
- **Secondary Cyan (`#06B6D4`)**: Telemetry and data stream accent. Directs attention to metrics, logs, query parameters, and variable definitions.
- **Tertiary Emerald Glow (`#10B981`)**: The heartbeat of operational uptime. Applied to active containers, passing test suites, zero-latency badges, and live deployment statuses.
- **Subdued Warning & Error**: Amber (`#F59E0B`) and Crimson (`#EF4444`) are restricted strictly to telemetry alerts and failing states, isolated to avoid visual pollution.

## Typography
Typography balances crisp legibility and technical identity.

- **Primary Interface (Geist)**: Chosen for its neutral, engineered geometric proportions and exceptional low-contrast legibility. Headings carry subtle negative tracking (`-0.02em` to `-0.04em`) to establish tight visual structure without appearing aggressive.
- **Monospace Telemetry (JetBrains Mono)**: Reserved for data grids, badges, runtime indicators, hash addresses, endpoints, and code blocks.
- **Rules of Hierarchy**:
  - Never mix monospaced body text into long-form reading contexts.
  - Section headers must remain strictly medium to semibold; avoid ultra-heavy weights to keep the workspace lightweight.
  - All status chips, timestamp labels, and environment tags must enforce monospaced styling.

## Layout & Spacing
The layout follows a high-density, flexible workbench structure that adjusts fluidly from single-pane mobile diagnostics to multi-column command centers.

- **Grid Framework**: Fluid 12-column foundation anchored by fixed utility sidebars (e.g., collapsible 280px navigation or 360px inspector rails).
- **Rhythm**: Spacing is calculated on an exact 4px base (`0.25rem`), favoring compact internal padding (`space-xs` and `space-sm`) inside interactive cards to preserve screen estate for logs and visual graphs.
- **Breakpoints & Adaptability**:
  - **Mobile (<768px)**: Canvas stacks to a single column; secondary inspection panels collapse into bottom drawers; margin set to `margin` (1rem).
  - **Tablet (768px - 1024px)**: 6-column presentation with drawer-based code viewers; gutter set to `gutter-md` (1.5rem).
  - **Desktop (>1024px)**: Full multi-pane orchestration, split view editors, and fluid metric dashboards with `margin-lg` (3rem) exterior breathing room.

## Elevation & Depth
Depth is established through translucent atmospheric layers, frosted backdrops, and inner edge reflections rather than heavy drop shadows.

- **Surface Level 0 (Base Canvas)**: Flat `#0B0F19`, light-absorbing, no blur.
- **Surface Level 1 (Panels & Canvases)**: `#111827` at 70% opacity with `backdrop-filter: blur(12px)`. Outlined with a top-weighted border of `rgba(255, 255, 255, 0.08)` to simulate an overhead technical light source.
- **Surface Level 2 (Modals, Hovered Cards, Menus)**: `#1E293B` at 85% opacity with `backdrop-filter: blur(16px)`. Border opacity shifts to `rgba(255, 255, 255, 0.14)`. Accompanied by a diffuse ambient shadow: `0 12px 32px -4px rgba(0, 0, 0, 0.5)`.
- **Luminous Glows**: Interactive elements under focus or critical success states emit subtle localized drop glows:
  - Indigo Glow: `0 0 20px -4px rgba(99, 102, 241, 0.35)`
  - Cyan Glow: `0 0 16px -4px rgba(6, 182, 212, 0.30)`
  - Emerald Pulse: `0 0 12px -2px rgba(16, 185, 129, 0.40)`

## Shapes
The system employs a controlled, soft corner geometry (Level 1) to convey precision and structural reliability.

- Standard buttons, inputs, metrics panels, and chips carry an outer radius of `0.25rem` (4px).
- Larger layout surfaces, elevated glass panels, and modal containers scale to `0.5rem` (8px).
- Floating toast notifications and action badges never exceed `0.75rem` (12px). Pill-shaped shapes are strictly prohibited except for binary status indicator dots.
- Every rounded boundary must preserve sharp, 1px anti-aliased hairline borders (`rgba(255, 255, 255, 0.08)`) to maintain physical definition against deep backdrops.

## Components

### Buttons
- **Primary**: Solid Electric Indigo (`#6366F1`) with text in pure white (`#FFFFFF`). On hover, shifts to `#4F46E5` with an indigo ambient glow (`0 0 16px rgba(99, 102, 241, 0.4)`). Active state applies a slight scale down (`0.98`).
- **Secondary Glass**: Frosted translucent surface (`rgba(255, 255, 255, 0.04)`) with hairline border (`rgba(255, 255, 255, 0.1)`). Hover triggers `rgba(255, 255, 255, 0.08)` and crisp white text.
- **Ghost & Terminal**: Borderless transparent background, text in `#94A3B8`. Hover introduces background `#111827` and cyan text tint.

### Chips & Telemetry Badges
- Constructed exclusively with `JetBrains Mono` at `label-sm`.
- Micro-pill or `0.25rem` rounded corners.
- Backgrounds use low-opacity tinted fills (`rgba(color, 0.12)`) paired with matching colored borders (`rgba(color, 0.25)`).
- Live statuses feature an inner emerald dot (`#10B981`) emitting a soft CSS pulse animation.

### Cards & Panels
- Translucent container with glassmorphic backing: `background: rgba(17, 24, 39, 0.7); backdrop-filter: blur(12px)`.
- Surrounded by an exact `1px solid rgba(255, 255, 255, 0.08)` boundary.
- Hoverable cards transition their border to `rgba(99, 102, 241, 0.3)` or `rgba(6, 182, 212, 0.3)` with subtle translation along the Y-axis (-2px).

### Input Fields & Search Bars
- Background set to deep `#0B0F19` inset with `1px solid rgba(255, 255, 255, 0.1)`.
- Text styled in `Geist` (`body-md`), with placeholder values in `#64748B`.
- Focus state removes default browser rings, applying a 1px border of `#6366F1` accompanied by an indigo shadow halo (`0 0 0 3px rgba(99, 102, 241, 0.15)`).
- Includes optional right-aligned keyboard shortcut badges (e.g., `⌘K`) rendered in JetBrains Mono.

### Checkboxes & Radio Controls
- Base state: Hairline square (`0.25rem` radius for checkboxes, circular for radios) with background `rgba(255, 255, 255, 0.04)` and border `rgba(255, 255, 255, 0.2)`.
- Checked state: `#6366F1` background with crisp white iconography and an indigo ambient trace.

### Lists & Data Tables
- Row dividers styled with `1px solid rgba(255, 255, 255, 0.04)`.
- Alternating subtle background states avoided; relies instead on hover highlighting (`rgba(255, 255, 255, 0.02)`).
- Dense vertical padding (`space-sm`) to maximize visible information density while maintaining line readability.

### Code Snippets & Terminal Blocks
- Deep carbon background (`#070A10`), distinct from workspace canvas.
- Syntax highlighting keyed strictly to primary indigo, cyan, emerald, and muted amber.
- Header strip includes file path in JetBrains Mono with 1-click clipboard feedback action.