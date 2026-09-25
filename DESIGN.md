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
confirms it. Respect reduced motion. No idle pulse, fake window lights, glass blur, decorative environment
status, remote fonts, emoji icons, or network assets. Local SVG icons carry the Lucide ISC notice.
Long operations report progress and can be cancelled at safe boundaries. Errors explain what was not
changed and what the person can do next.

## Verification

For every changed screen, run real-browser journeys at 1180, 1024, 768 and 480 px, with ordinary and
reduced motion. Measure reachable controls, breadcrumb/step agreement, contrast, names, keyboard focus,
copy outcomes, no horizontal overflow, no CSP errors, and exact closed-set assets. Deliberate mutations
must be detected by the property they target; a timeout or renderer exception is not a pass.
