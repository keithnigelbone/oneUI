# Slider QA tests

| File | Layer | Status |
|------|-------|--------|
| `slider_functional_test.dart` | Functional `[fn]` + smoke (drag, keyboard, tooltip, steps, size, disabled/readOnly) | pass |
| `slider_a11y_test.dart` | Resolver `[a11y]` + widget semantics (slider role, readOnly, range, keyboard nudge) | pass |
| `slider_figma_parity_test.dart` | `[figma]` — size S/M/L, appearance, orientation, knobStyle, fill geometry | pass |
| `slider_visual_regression_test.dart` | `[visual]` SLDR-VIS-001–008 geometry + layout metrics | pass |
| `slider_platform_test.dart` | `[platform]` mobile vs web/desktop slider semantics | pass |
| `slider_story_catalog_test.dart` | `[catalog]` Storybook nav-order parity with web `Slider.stories.tsx` | pass |
| `slider_regression_test.dart` | Parity proofs + meta (burn-down scaffold) | pass |
| `slider_motion_test.dart` | Knob scale duration + subtleMotion + tooltip auto/drag | pass |
| `slider_golden_test.dart` | Visual regression — light (knobStyle×size, appearances, range, steps) | **21 baselines** |
| `slider_golden_dark_test.dart` | Visual regression — dark mode | **5 baselines** |
| `slider_golden_surface_test.dart` | Visual regression — Surface context | **4 baselines** |
| `../../../integration_test/slider_e2e_test.dart` | On-device E2E (drag, sizes, knob styles, range, keyboard, appearances, disabled/readOnly, surface, dark, semantics) | E2E |

**Package line coverage** (`one_ui_slider.dart`): **98.1%** (≥ 90% gate).

> Golden PNGs are regression baselines against the Jio fixture — not automatic Figma certification.

## Figma vs React discrepancies

| Topic | Figma | React / Flutter |
|-------|-------|-----------------|
| **Size** | S / M / L (`size` prop) | React web: single fixed layout (~328×24). **Flutter + RN:** `size: 's' \| 'm' \| 'l'` (default `'m'`). Size `m` matches React token manifest; `s`/`l` scale via RN `SLIDER_SIZES` spacing keys. |
| **Slots** | Start/end slot enum in the design spec | `ReactNode` slots (`start` / `end`). Flutter uses `Widget?` slots with the same API. |
| **Range value** | Dual-thumb range in Figma matrices | React `number \| number[]`; Flutter `Object?` / `defaultValue` with list detection for range mode. |
| **Tooltip** | Figma tooltip variants | React `showTooltip: auto \| always \| never`; Flutter matches string union. |

## Quick run

```bash
cd apps/qa-playground-flutter

flutter test test/components/slider/slider_functional_test.dart \
  test/components/slider/slider_a11y_test.dart \
  test/components/slider/slider_figma_parity_test.dart \
  test/components/slider/slider_platform_test.dart \
  test/components/slider/slider_story_catalog_test.dart \
  test/components/slider/slider_regression_test.dart

# Generate goldens (requires Jio Convex fixture + network):
flutter test --update-goldens \
  test/components/slider/slider_golden_test.dart \
  test/components/slider/slider_golden_dark_test.dart \
  test/components/slider/slider_golden_surface_test.dart

# On-device E2E (requires booted emulator / simulator):
pnpm qa:flutter:e2e:report:all -- slider
# Or single device:
flutter test integration_test/slider_e2e_test.dart -d <device-id>
```
