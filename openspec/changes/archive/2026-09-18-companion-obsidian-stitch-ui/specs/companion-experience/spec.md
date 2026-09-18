# companion-experience Specification Delta

## Purpose
Incorporate Obsidian Precision Studio and Stitch design tokens into the production Companion interface and Windows packaging.

## ADDED Requirements

### Requirement: Obsidian Precision Studio theme and responsive topbar navigation
The Companion application SHALL display a dark obsidian theme (#0B0F19 background, #121826 surface card, #6366F1 indigo accents, #06B6D4 cyan and #10B981 emerald highlights), an integrated topbar navigation header with responsive pills and brand icon, action cards on the home screen, and a dark multi-size native Windows icon.

#### Scenario: User launches the application
- **WHEN** the Companion desktop application starts
- **THEN** the initial window background SHALL be #0B0F19 without white or light flickering
- **AND** the topbar header SHALL render the SVG brand icon, status indicator, and navigation pills

#### Scenario: User navigates on various viewports
- **WHEN** the user resizes the window down to 240px or expands up to 1180px
- **THEN** all controls, cards, and textual content SHALL remain accessible without horizontal overflow or clipped actions
- **AND** color contrast SHALL satisfy WCAG AA/AAA thresholds across all interactive elements
