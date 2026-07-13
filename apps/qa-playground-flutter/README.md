# OneUI Flutter QA Playground

Standalone workspace for the **testing team**: browsable component catalog (like React `pnpm qa-playground`) plus `flutter_test` functional and accessibility suites for `@oneui/ui_flutter`.

Mirrors:

- **Web UI:** `apps/qa-playground/` (`pnpm qa-playground`)
- **Web tests:** `apps/qa-playground/e2e/`
- **RN tests:** `apps/qa-playground/native/tests/`

## Policy

**QA owns everything under `apps/qa-playground-flutter/`.** Do not add or move tests into `packages/ui_flutter/test/`.

## Quick start

```bash
# Browsable QA playground (Flutter web, port 5190)
pnpm qa-playground:flutter

# Run all tests + HTML report
pnpm qa:flutter:report

# One component
pnpm qa:flutter:component -- checkbox
```

Open in browser: **http://localhost:5190**

React QA playground uses port **5180** (`pnpm qa-playground`); Flutter uses **5190** — different apps, different ports.

## What you get

| Layer | Location |
|-------|----------|
| **Catalog UI** | `lib/pages/catalog_page.dart` — search, category filters, component cards |
| **Component detail** | `lib/pages/component_detail_page.dart` — live preview + functional/a11y report tabs |
| **Tests** | `test/components/{slug}/` |
| **HTML reports** | `test-results/` → synced to `web/qa-reports/` for the web app |

## Structure

```
apps/qa-playground-flutter/
├── lib/                      Flutter web app (QA catalog + detail)
├── test/                     flutter_test suites (QA-owned)
├── web/qa-reports/           Synced JSON/HTML reports (gitignored artefacts)
├── scripts/
│   ├── run_dev_web.sh        pnpm qa-playground:flutter
│   ├── run_all_with_report.sh
│   ├── sync_reports_to_web.sh
│   └── generate-html-report.mts
└── test-results/             Generated during test runs
```

## Commands

From repo root:

```bash
pnpm qa-playground:flutter      # catalog UI (Flutter web)
pnpm qa:flutter:test            # all QA tests
pnpm qa:flutter:report          # tests + JSON + HTML + sync to web/
pnpm qa:flutter:report:html     # report + open flutter-report.html
pnpm qa:flutter:component -- checkbox
```

## Adding a component

1. Add catalog entry in `lib/catalog/qa_catalog.dart`
2. Wire live preview in `lib/showcases/qa_component_preview.dart`
3. Add `test/components/{slug}/` with `{slug}_functional_test.dart` and `{slug}_a11y_test.dart`
4. Copy conventions from `test/components/checkbox/`

## Reference components

**Checkbox** and **Button** are fully implemented — use as templates.

## Reports

After `pnpm qa:flutter:report`, reports are copied to `web/qa-reports/` so the catalog UI can load `flutter-summary.json` and link to HTML reports.

See [`FLUTTER-TESTING-FRAMEWORK.md`](FLUTTER-TESTING-FRAMEWORK.md) for test tiers and naming.
