# Card: Web (`@oneui/ui`) vs Native (`@oneui/ui-native`) — Parity Guide

This document compares the **React (web)** and **React Native** Card implementations, explains how surface context and interactive states are handled on both platforms, and lists every intentional difference.

**Primary sources**

| Area | Web | Native |
|------|-----|--------|
| Component | `packages/ui/src/components/Card/Card.tsx` | `packages/ui-native/src/components/Card/Card.native.tsx` |
| Layout / static visuals | `packages/ui/src/components/Card/Card.module.css` | `packages/ui-native/src/components/Card/Card.styles.native.ts` |
| Shared props / state | `packages/ui/src/components/Card/Card.shared.ts` | `packages/ui-native/src/components/Card/interface.ts` (manually aligned) |
| Theme / surface | Injected CSS + `[data-surface]` | `packages/ui-native/src/theme/SurfaceContext.tsx` |

---

## 1. Executive summary

| Topic | Status | Notes |
|-------|--------|--------|
| **Prop contract** | **Aligned** | `surface`, `appearance`, `interactive`, `children` are parity. `as` is web-only. |
| **Surface context** | **Aligned** | Web: `[data-surface]` via `<Surface>`. Native: `SurfaceContext` via `<Surface>`. |
| **Appearances** | **Aligned** | Both support role remapping when `surface` is present. |
| **Interactive state** | **Aligned** | Web: `:hover` lift to `Elevation-2`. Native: `Pressable` lift to `Elevation-2` on press. |
| **Static visuals** | **Aligned** | Padding (`4-5`), gap (`3-5`), and radius (`Shape-0`) match web defaults. |
| **Accessibility** | **Aligned** | Web: `role` and `tabIndex`. Native: `accessibilityRole` ('button' vs 'summary') and `accessibilityState`. |

---

## 2. Token mapping (web CSS → native)

| Property | Web CSS Variable | Native Token | Default |
|----------|------------------|--------------|---------|
| Padding | `--Card-padding` | `tokens.spacing['4-5']` | `18px` (L) |
| Gap | `--Card-gap` | `tokens.spacing['3-5']` | `14px` (S) |
| Radius | `--Card-borderRadius` | `tokens.shape['0']` | `0px` |
| Stroke | `--Card-borderWidth` | `tokens.stroke.M` | `1px` |
| Fill | `--Card-backgroundColor` | `role.surfaces.main` | `Surface-Main` |
| Stroke Color | `--Card-borderColor` | `role.content.strokeLow` | `Neutral-Stroke-Low` |
| Shadow (Idle) | `--Card-boxShadow` | `elevation['0']` | `Elevation-0` (None) |
| Shadow (Hover) | `--Card-boxShadowHover` | `elevation['2']` | `Elevation-2` |

---

## 3. Implementation differences

### 3.1 Primitives

- **Web**: Uses a generic `div` (or `as` element).
- **Native**: Uses `View` for static cards and `Pressable` for interactive cards.

### 3.2 Hover vs Press

- **Web**: Interactive cards lift on `:hover` and have a focus halo on `:focus-visible`.
- **Native**: Interactive cards lift on press (`activeOpacity` / `elevation` change). There is no "hover" on touch devices.

### 3.3 Surface nesting

- Both platforms correctly handle nesting. If a `Card` is placed inside a `Surface mode="bold"`, its `backgroundColor` and `borderColor` will adapt based on the brand's token resolution for that surface.
- If a `Card` itself has a `surface` prop, it acts as a new surface boundary for its children.

---

## 4. Showcase map

| Web story | Native showcase section | Status |
|-----------|-------------------------|--------|
| `Default` | `CardDefault` | **Aligned** |
| `Interactive` | `CardInteractive` | **Aligned** (Press vs Hover) |
| `SubtleSurface` | `CardSurfaceModes` (Subtle) | **Aligned** |
| `ElevatedSurface` | `CardSurfaceModes` (Elevated) | **Aligned** |
| `BoldSurface` | `CardSurfaceModes` (Bold) | **Aligned** |
| `SecondaryRole` | `CardAppearances` | **Aligned** |
| `As article` | _intentionally skipped_ | **Web-only** (semantic tags) |
| `NestedOnBold` | `CardNestedOnBold` | **Aligned** |
