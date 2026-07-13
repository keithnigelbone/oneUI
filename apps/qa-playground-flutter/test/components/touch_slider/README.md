# TouchSlider QA tests

| File | Layer | Status |
|------|-------|--------|
| `touch_slider_functional_test.dart` | Functional `[fn]` + smoke (render, drag, keyboard, commit, controlled, testId) | pass |
| `touch_slider_a11y_test.dart` | Resolver `[a11y]` + widget semantics | pass |
| `touch_slider_figma_parity_test.dart` | `[figma]` — progressStyle / appearance / orientation API | pass |
| `touch_slider_platform_test.dart` | `[platform]` mobile vs web/desktop semantics | pass |
| `touch_slider_story_catalog_test.dart` | `[catalog]` Storybook nav-order parity | pass |
| `touch_slider_regression_test.dart` | Parity proofs + meta (TSL- prefix burn-down scaffold) | pass |
| `touch_slider_visual_regression_test.dart` | Resolver + painted fill span (`TSL-VIS-001`–`008`) | pass |
| `touch_slider_motion_test.dart` | Fill animation duration + subtleMotion + drag zero | pass |
| `touch_slider_golden_test.dart` | Visual regression — light Figma matrix + appearance grid | pass |
| `touch_slider_golden_dark_test.dart` | Visual regression — dark appearance grid + sharp endpoints | pass |
| `touch_slider_golden_surface_test.dart` | Visual regression — Surface context (`auto` × subtle/bold) | pass |

**Golden baselines:** 27 PNGs (15 light + 7 dark + 4 surface + 1 legacy default overlap).
**Package line coverage** (`one_ui_touch_slider.dart`): **91.9%** (≥ 90% gate).

| `../../../integration_test/touch_slider_e2e_test.dart` | On-device E2E (drag H/V, progressStyle, keyboard, appearances, disabled/readOnly, surface, dark, semantics, testId) | E2E |

## Figma vs React discrepancies

| Topic | Figma | React / Flutter |
|-------|-------|-----------------|
| **readOnly → disabled** | Figma lists read-only as a distinct state | Web maps `readOnly` to `disabled` on the underlying slider (`TouchSlider.tsx`). Flutter `resolveOneUiTouchSliderState` sets `isDisabled: disabled \|\| readOnly`. |
| **number[] types** | Range / multi-value variants in some Figma explorations | React `TouchSlider` is **single-thumb only** — `number[]` types in shared typings are unused. Flutter matches single `double` value. |
| **Slots** | Slot position enum matrix in Figma | React `start` slot as `ReactNode`. Flutter `Widget? start` only (no `end` slot on TouchSlider). |
| **Progress style** | Rounded vs sharp caps in Figma | React `progressStyle: rounded \| sharp`; Flutter matches. |
| **Vertical fill** | Bottom-up fill (0=bottom, 100=top) | Flutter uses RN/Figma **width-growing model**: fill anchored at start (bottom for vertical), `AnimatedPositioned` extent = `touchSliderFillExtentPx`. At 50% the painted fill spans exactly half the track. |

> **Note:** Golden PNGs are **regression baselines** against the Jio fixture — they catch visual drift, not automatic Figma certification. Manual Chromatic / design review still required for Figma sign-off.

## Quick run

```bash
cd apps/qa-playground-flutter

flutter test test/components/touch_slider/

flutter test --update-goldens \
  test/components/touch_slider/touch_slider_golden_test.dart \
  test/components/touch_slider/touch_slider_golden_dark_test.dart \
  test/components/touch_slider/touch_slider_golden_surface_test.dart

# On-device E2E (emulator / simulator required):
pnpm qa:flutter:e2e:report:all -- touch-slider
```
