---
name: Project Engineering OS Companion
description: Preparación local, verificable y bajo control de la persona.
colors:
  obsidian: "#0B0F19"
  card: "#121826"
  raised: "#1C2436"
  indigo: "#6366F1"
  indigo-light: "#818CF8"
  cyan: "#06B6D4"
  emerald: "#10B981"
  text: "#F8FAFC"
  secondary: "#94A3B8"
typography:
  display:
    fontFamily: "Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.15
  body:
    fontFamily: "Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  mono:
    fontFamily: "Consolas, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  compact: "4px"
  control: "8px"
  card: "12px"
spacing:
  unit: "4px"
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
components:
  app-shell:
    backgroundColor: "{colors.obsidian}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.compact}"
    padding: "0"
  content-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.card}"
    padding: "24px"
---

# Companion design system

The Companion is a local project-preparation application, not a dashboard that can declare success from a
decorative badge. Its visual language is calm, dense enough to finish a task, and explicit about what has
been checked. The Stitch prototype informed the palette; it is not a source of product claims or controls.
This document describes the Companion renderer. The neutral CLI and generated project assets retain their
own contracts.

## Source of truth

- `apps/companion/ui/tokens.css` owns every literal hexadecimal color. Other styles use variables.
- `app.css` imports ordered cascade layers: tokens, layout, components, pages. Local ES modules render the
  interface without a framework or build step; the `peos://` asset list is exact.
- The route table supplies breadcrumb, active navigation destination, and one of four wizard steps.
  `ACTIONS` and `ROW_ACTIONS` supply each operation's only interface label.
- The interface must never infer “ready” from appearance. The service's verified state and specific
  qualifiers are the only basis for a ready claim.

## Color and typography

Obsidian `#0B0F19` is the canvas; `#121826` and `#1C2436` distinguish cards and raised surfaces.
Indigo identifies the primary action and current location. Cyan is supporting information; emerald,
amber and red are reserved for actual status. Body text uses the system sans-serif stack at 16 px,
with tabular paths and compact labels in a local monospace stack. On a dark surface, normal text and
interactive labels must reach WCAG AA 4.5:1. Do not communicate state by color alone.

The whole client viewport shares a local indigo/cyan background, including the header, wizard, menus
and dialogs, as explicitly requested by the maintainer on 2026-09-29. It is not clipped to a content
column or rebuilt per route. Benefit accents use indigo, cyan and violet, not success green. Benefits
describe implemented capabilities, not unmeasured improvements in an AI's answer quality or efficiency.
Keep the primary copy and actions first in reading order, with the benefits beside them on wide windows
and below the actions on compact windows. Decorative surfaces never intercept pointer events.

## Layout and controls

The window is a two-row grid: a 56 px header, then one scrollable main pane. At desktop widths the
four-step assistant has a persistent 168 px rail; a container query changes it to a horizontal step strip
under 900 px of content width. The action footer is a sibling of animated content, stays in document flow,
and sticks to the bottom of that scroller. It must never be fixed under an animated transform. Content
width is capped at 1120 px with a responsive gutter. Lists and cards can form two columns from 720 px
and one below it. Text and controls wrap without horizontal page overflow.

Primary controls have a clear label and at least a 44 px target; secondary controls are quieter, not
disabled-looking. Keyboard focus remains visible. The action bar leaves enough scroll padding for
focused controls. A modal restores focus to its opener. Personal content is rendered as text and marked
`data-content="person"`; it is never interpreted as HTML. Glossary terms open their own definition.

## Motion, feedback, and resources

Movement should show a transition or processing state, never imply work completed before the service
confirms it. Respect reduced motion. The shared ambient background is visual identity, never activity or
status. No status pulse, fake window lights, glass blur, decorative environment
status, remote fonts, emoji icons, or network assets. Local SVG icons carry the Lucide ISC notice.
Long operations report progress and can be cancelled at safe boundaries. Errors explain what was not
changed and what the person can do next.

### Motion and waiting contract (#149)

The source tokens are `--dur-fast:120ms`, `--dur-base:200ms`, `--dur-slow:280ms` and
`--ease-out:cubic-bezier(0.23,1,0.32,1)`. No ease-in, duration above 300 ms, persistent transformed
screen container or status pulse. Decorative ambient/illumination exceptions are defined separately below;
they do not change interaction-state or navigation timing.
Press uses scale(.97); the first eight project rows enter with 40 ms
stagger (0–280 ms delay, 200 ms duration). Indigo-to-cyan text belongs only to Inicio and the final title.
Disabled controls retain readable colors, with opacity 1.

The shared background uses viewport-fixed body pseudo-elements, with no descendants and no transform on
a layout ancestor. Its only continuous animation is `app-ambient-flow`, a twenty-second linear alternate
opacity crossfade on `body::after`. The base gradient remains present, so it never blinks. No other loop
is permitted. Reduced motion leaves both fields static, with no active
animation or transition. Menu/dialog surfaces remain legible; the same backdrop continues behind them.
The Inicio benefit list keeps its finite 280 ms opacity entrance. Text never moves continuously.

The maintainer approved the continuous-background composition and then requested finite illumination.
`--dur-sheen:900ms` is reserved for one left-to-right pass on `.hero-gradient` at entry and on an enabled
`button.primary::after` at hover or keyboard-visible focus. Inicio accents only Project Engineering OS,
not its preceding word con. The existing final title uses the same restrained accent; other headings,
terms, secondary actions, warnings and destructive controls do not. The button overlay has no pointer
events, never changes its box/text/focus ring, and is absent while disabled. Reduced motion removes both
passes, retaining their normal readable colors. This narrow finite exception does not permit long
button-state transitions, arbitrary animations or new repeating effects.

Destination and project-segment changes use same-document View Transitions where available, with the
rail's own stable transition identity. Commit precedes animation completion; controls become interactive
only after completion or skip, because Chromium snapshots are not the live controls. In reduced-motion
or unsupported engines, the exact same destination commits immediately without that API. Forms and
progress do not trigger navigation animation. A stale transition callback cannot replace a newer screen.

Project skeletons appear at 300 ms and become an actionable error at 10 s. Known project names may remain,
never an old readiness badge. Other indeterminate activity waits 1 s; real completed/total events show
their actual values immediately. At 10 s, stage text and Detener remain visible. Wizard activity lives in
the action footer; outside the wizard it is in normal flow, not an overlay.

Success notices are plain-text polite status messages, at most two, for 4 s. Errors remain in an explicit
panel. A copy control says Copiado for 2 s only after IPC confirms success; a refusal/transport failure
does not display a success notice. These durations do not replace manual reader evidence.

## Verification

For every changed screen, run real-browser journeys at 1180, 1024, 768 and 480 px, with ordinary and
reduced motion. Measure reachable controls, breadcrumb/step agreement, contrast, names, keyboard focus,
copy outcomes, no horizontal overflow, no CSP errors, and exact closed-set assets. Deliberate mutations
must be detected by the property they target; a timeout or renderer exception is not a pass.
