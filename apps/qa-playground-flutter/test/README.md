# QA test layout

All Flutter component QA tests live in this app — **not** in `packages/ui_flutter/test/`.

```
test/
├── support/           Shared harnesses (no *_test.dart)
├── components/        One folder per component
├── suites/            Smoke + regression entry points
└── docs/              Test plans and checklists
```

See [`../FLUTTER-TESTING-FRAMEWORK.md`](../FLUTTER-TESTING-FRAMEWORK.md) for full conventions.
