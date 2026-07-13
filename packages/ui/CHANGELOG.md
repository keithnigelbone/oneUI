# @jds4/oneui-react — Changelog

All notable consumer-facing changes to the published React package.

## [0.1.0-alpha.10] — 2026-06-26

### Fixed

- **Duplicate React / invalid hook call** — `react` and `react-dom` are peer dependencies only; the library no longer bundles its own React copy.
- **Next.js / Webpack brand resolution** — `BrandProvider` loads brands via `@jds4/oneui-react/brand-loader` (build-time safe default; plugins override with CDN manifests). Fixes staging leaks and improves compatibility with `transpilePackages`.
- **Jio baked fallback path** — CDN bootstrap loader uses package-relative paths so published tarballs resolve correctly.

### Added

- `registerIcons` prop on `BrandProvider` (default `true`). Set `registerIcons={false}` when using direct icon component imports and no semantic `<Icon icon="…" />` resolution.
- `@jds4/oneui-react/brand-loader` export — preferred alias for the plugin-generated brand manifest (same shape as legacy `virtual:oneui-brands`).
- `@jds4/oneui-icons-jio` category chunks — internal packaging only; public `/register` API unchanged.

### Changed

- **Recommended for Next.js:** `transpilePackages: ['@jds4/oneui-react']` in `next.config.js`.

### Migration from alpha.9

**Most apps:** bump `@jds4/oneui-react` to `0.1.0-alpha.10`. Ensure `react` and `react-dom` are direct app dependencies.

**No import rewrites** required for `BrandProvider`, plugins, `virtual:oneui-brands`, or component import paths.

See README § [Upgrading from alpha.9 → alpha.10](./README.md#upgrading-from-010-alpha9--010-alpha10).

## [0.1.0-alpha.9] and earlier

Pre-release alphas. Treat each bump as potentially breaking until `1.0.0`; always check the version you are upgrading from.
