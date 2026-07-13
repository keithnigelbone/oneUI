# CDN delivery & consumer parity (One UI)

**All planning and runbooks for the CDN + tarball consumer pipeline live in this folder.**  
Executable helpers stay under `cdn-release-full-pipeline/cdn-poc/` (`serve.ts`, `bake-jio-fallback.ts`).

| Doc | Purpose |
|-----|---------|
| **[`PLAN-v3-clean.md`](./PLAN-v3-clean.md)** | v3 “clean PR” architecture: `build-brand-css`, `cdn-dist/` layout, `@oneui/vite-plugin`, `BrandProvider`, scope rules. |
| **[`visual-parity-and-release-plan.md`](./visual-parity-and-release-plan.md)** | Roadmap: Storybook ↔ tarball+CDN visual parity, CDN artefact validation, single-command release (`pack:all` / `pack:release`). |

**Quick commands (repo root)**

| Command | Role |
|---------|------|
| `pnpm build:brand-css` | Fill `cdn-dist/brands/<slug>/` (CSS + JSON sidecars). |
| `pnpm cdn:serve` | Static server for local `cdn-dist/` (see `cdn-release-full-pipeline/cdn-poc/serve.ts`). |
| `pnpm pack:all` | Foundation → brand CSS → jio bootstrap → **tarballs** in `release/`. |
| `pnpm pack:release` | **Tarballs only** (requires `foundation.css` + package builds). |

**Consumer parity lab:** keep a small Vite app **outside this monorepo** (copy [`../oneui.brands.json.example`](../oneui.brands.json.example), wire `@oneui/ui` + `@oneui/vite-plugin` per [`PLAN-v3-clean.md`](./PLAN-v3-clean.md)). Nothing under `apps/` is required for the CDN pipeline itself.
