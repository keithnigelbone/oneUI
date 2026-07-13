# OneUI Flutter — QA Testing Framework

> **QA Policy:** All component functional and accessibility tests live under `apps/qa-playground-flutter/`. QA does not modify source files in `packages/ui_flutter/` — bug fixes in dev files are raised as separate issues.

---

## Overview

| Layer | Tool | What it validates |
|-------|------|-------------------|
| **Unit (a11y resolvers)** | `flutter_test` `test()` | Label fallback, `get*AccessibilityProps`, state resolution |
| **Widget functional** | `flutter_test` `testWidgets()` | Tap, toggle, disabled, controlled state, slots |
| **Widget a11y** | `flutter_test` + `ensureSemantics()` | Semantics role, name, checked/enabled, actions |
| **Catalog** | `flutter_test` `test()` | Storybook nav parity with web |

No simulator required — all tests run headless via `flutter test`.

---

## Repository structure

```
apps/qa-playground-flutter/
├── test/
│   ├── support/
│   │   ├── pump_one_ui_app.dart           ← OneUiScope + brand shell
│   │   ├── test_widgets_all_platforms.dart
│   │   ├── semantics_helpers.dart
│   │   └── components/
│   │       └── checkbox_harness.dart      ← per-component helpers
│   │
│   ├── components/                        ← one folder per component
│   │   ├── checkbox/
│   │   │   ├── checkbox_functional_test.dart
│   │   │   ├── checkbox_a11y_test.dart
│   │   │   └── checkbox_story_catalog_test.dart
│   │   ├── button/
│   │   └── …
│   │
│   ├── suites/
│   │   ├── smoke_all_components_test.dart
│   │   └── a11y_regression_test.dart
│   │
│   └── docs/
│       ├── checkbox_test_plan.md
│       └── a11y_checklist.md
│
├── test-results/
│   ├── flutter-all.json
│   ├── flutter-report.html
│   └── components/
│       └── checkbox.json
│
├── scripts/
│   ├── run_all_with_report.sh
│   └── run_component.sh
│
└── tool/
    └── generate_html_report.dart
```

Developer-owned tests stay in `packages/ui_flutter/test/` (engine, parity, resolvers).

---

## Test tiers

### Tier 1 — Smoke `[smoke]`

Component renders without crashing; core props accepted.

### Tier 2 — Functional `[fn]`

Prop-to-output mapping, callbacks, controlled/uncontrolled state.

### Tier 3 — Accessibility `[a11y]`

- Pure: `get*AccessibilityProps`, label chains
- Widget: `SemanticsFlag`, `SemanticsAction`, platform loop via `testWidgetsAllPlatforms`

### Tier 4 — Catalog `[catalog]`

Storybook nav order matches web `*.stories.tsx`.

---

## File naming

| Pattern | Required |
|---------|----------|
| `{component}_functional_test.dart` | Yes |
| `{component}_a11y_test.dart` | Yes |
| `{component}_story_catalog_test.dart` | Optional |

Harness files: `test/support/components/{component}_harness.dart` (no `_test` suffix).

---

## Parity workflow (per component)

1. Read web `apps/qa-playground/e2e/{component}-qa.spec.ts` and `*-accessibility.spec.ts`
2. Read RN `apps/qa-playground/native/tests/{Component}/`
3. Read dev parity doc `docs/parity/*-flutter-parity.md` if present
4. Implement QA tests here — do not duplicate dev engine tests
5. Run `bash scripts/run_component.sh {slug}` and attach HTML report

---

## Platform coverage

`testWidgetsAllPlatforms` runs each widget test on:

- Android
- iOS
- Linux (desktop semantics proxy)

---

## Reports

```bash
bash scripts/run_all_with_report.sh
open test-results/flutter-report.html
```

JSON output compatible with future dashboard ingest (same pattern as RN `native-all.json`).

---

## Related docs

- [test/docs/a11y_checklist.md](test/docs/a11y_checklist.md)
- [Native QA framework](../qa-playground/native/NATIVE-TESTING-FRAMEWORK.md)
- [Web QA playground](../qa-playground/README.md)
- [Flutter parity pass](../../docs/parity/flutter-component-parity-pass.md)
