---
name: Seldom
description: Midnight Field — dark-first app UI
colors:
  surface-base: "#080b12"
  surface-raised: "#0f141f"
  surface-overlay: "#151c2b"
  surface-elevated: "#1c2638"
  accent: "#0d9488"
  accent-muted: "#2dd4bf"
  accent-hover: "#14b8a6"
  brand: "#fbbf24"
  brand-muted: "#fcd34d"
  text-primary: "#eef2f8"
  text-secondary: "#94a3b8"
  text-tertiary: "#8898ae"
  border: "rgba(148, 163, 184, 0.1)"
  success: "#34c759"
  warning: "#e6b800"
  danger: "#e54d4d"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Figtree, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: "Figtree, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Figtree, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Figtree, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.3
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  panel: "2px"
spacing:
  panel-padding: "16px"
  panel-header-y: "12px"
  grid-gap: "10px"
  shell-padding: "12px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-secondary:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  panel:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.panel-padding}"
---

# Design System: Seldom — Midnight Field

## Overview

Seldom’s default visual world is **Midnight Field**: deep blue-black surfaces, teal accents for action and focus, amber for the brand mark, and a subtle atmospheric gradient on the canvas. Theme customizability is preserved — Classic, Sunset, Ocean, and custom palettes still remap tokens via `src/config/themePalettes.ts`.

Source of truth: `src/styles/globals.css`, `src/components/ui/*`. Dark default; light via `[data-theme="light"]`.

## Typography

| Role | Font | Usage |
|------|------|-------|
| Body / UI | **Figtree** (`--font-sans`) | Labels, body copy, nav, forms |
| Display | **Bricolage Grotesque** (`--font-display`) | Page titles, panel headers, modals, brand wordmark |

Panel headers use display type at `text-sm`, semibold, sentence case — no uppercase micro-labels. Minimum readable size is `text-xs` (12px).

## Panels (Scoreboard ledger)

Dashboard sections use flat **ledger panels** — not rounded cards:

- **Top rule:** 2px accent bar tinted from the panel’s nav bookmark color (38% opacity); defaults to teal elsewhere
- **Surface:** flat `--color-surface-raised`, 2px corner radius, no gradient or hover glow
- **Header:** title row with a small dash before the label (72% bookmark tint); title text picks up an 18% bookmark mix; thin bottom rule separates header from body
- **Modals/auth** keep larger `--radius-lg` / `--radius-xl` — ledger treatment is for in-app sections only

## Colors

Token prefix: `--color-*`.

- **Accent** (teal): buttons, focus rings, selection, active nav rail
- **Brand** (amber): logo mark, auth screens, sidebar glow
- **Surfaces**: layered blue-black (`base` → `raised` → `overlay` → `elevated`)
- **Nav bookmarks**: palette gradient stops cycle per sidebar tab (Classic: teal → amber → coral)

## Layout

- Sidebar: 240px (`w-60`), vertical gradient wash
- Main padding: `p-3 md:p-4`
- Dashboard grid: 2 columns → 3 at 1024px; gap 10px; max-width 1600px
- Tab pages: `--panel-min-height: 12rem`; scroll on `AdaptiveScrollRegion`

## Elevation & Depth

Panels use a flat top accent rule. Modals use `--color-scrim` backdrop with blur.

## Shapes

`--radius-sm` 8px · `--radius-md` 12px · `--radius-lg` 16px · `--radius-xl` 20px

Brand mark uses `--radius-lg`.

## Components

| Component | File | Notes |
|-----------|------|-------|
| Button | `Button.tsx` | primary glow + press scale; secondary / ghost |
| Panel | `Panel.tsx` | display header, optional `scrollCap`, optional `accentNavId` for bookmark-tinted ledger accents |
| Card | `Card.tsx` | optional `glass` |
| Input | `Input.tsx` | raised surface, teal focus ring |
| Sidebar | `Sidebar.tsx`, `SidebarNav.tsx` | gradient rail, bookmark underscore, active left bar |
| Modal | `Modal.tsx` | scrim backdrop, display title |
