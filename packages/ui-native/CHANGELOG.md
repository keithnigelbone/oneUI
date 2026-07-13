# Changelog — @oneui/ui-native

All notable changes to this package are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/); this package follows semver
(pre-1.0: minor = additive, and breaking changes are allowed but called out).

## [Unreleased]

Production-readiness pass (packaging + API + KB integrity).

### Added

- **4 components promoted to public**: `Switch`, `PaginationDots`, `Progress`,
  `Container` (previously built but unreachable).
- **Dual ESM + CJS build.** `import` resolves to tree-shakeable `.mjs`; the
  `react-native` condition stays on `.cjs` for Metro. `sideEffects: false` is
  now meaningful for web/bundler consumers.
- **`@oneui/ui-native/internal` entry** for advanced component-authoring helpers
  (slot contexts, `typographyToTextStyle` / `mergeTypographyTextStyle`).
  Explicitly **not** semver-stable.
- **AgentPulse** now has an official KB entry (status `stable`) + usage doc.
- Usage docs for `Modal`, `Tabs`, `Tooltip`, `TouchSlider`.
- Package metadata: `author`, `homepage`, `repository`, `bugs`, `engines`.
- Required peer dep `react-native-svg` documented in GETTING_STARTED.
- Release gates: `check:exports`, `check:version`, `check:docs`, `check:readme`
  (aggregated as `check:release`, wired into `build` + CI).

### Changed

- **`./theme` now exposes a curated public API.** Component-authoring resolvers
  are no longer re-exported from it.
- README component table + `AI_KNOWLEDGE_BASE.md` are generated from the source
  of truth and can no longer drift.
- Version unified to `0.1.0-alpha.1` (was `0.1.0-alpha-test.1`); KB version
  constants stripped of `-wip`.

### Removed (BREAKING)

- The following were removed from the public API (they remain package-internal):
  `useComponentRecipe`, `useComponentTheme`, `ComponentThemeProvider`,
  `resolveRecipeBorderRadius`, `resolveNativeContextRoles`,
  `buildStaticWeightFamilyMap`, `mergeStaticWeightFamilyConfig`.
  - **Migration:** these were component-internal plumbing with no documented use.
    If you depended on one, import from `@oneui/ui-native/internal` where it was
    relocated, or open an issue — most have no supported public replacement.
- Slot contexts (`SlotParentAppearanceProvider`, `useSlotParentAppearance`,
  `ComponentSlotIconContext`, `useComponentSlotIconContext`) and
  `typographyToTextStyle` / `mergeTypographyTextStyle` moved from the root entry
  to `@oneui/ui-native/internal`.
  - **Migration:** change `from '@oneui/ui-native'` →
    `from '@oneui/ui-native/internal'` for these symbols.

### Gated (not yet public)

- `LinkButton`, `Spinner`, `Separator` are implementation-complete but gated
  (KB status `planned`); their types and docs are excluded from the published
  artifact until promoted.

## [0.1.0-alpha.5] - 2026-07-02

Version bump only — no functional changes in this package. Released to keep
`@oneui/create-native-app`'s scaffolded templates pinned to a matching set of
versions alongside `@oneui/native-cdn@0.1.0-alpha.4` (bundled default
brand-data fallback for CDN 404s) and `@oneui/create-native-app@0.1.0-alpha.3`.
