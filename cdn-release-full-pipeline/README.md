# CDN + tarball release pipeline

Everything for the **v3 CDN delivery** and **`pnpm pack:*`** flow lives here:

| Path | Contents |
|------|----------|
| **`docs/`** | Plans, parity roadmap, index (`README.md` inside that folder — start there). |
| **`build/`** | Node scripts: foundation CSS, brand CSS → `cdn-dist/`, tarball prep (`pack-release.ts`), orchestrator (`build-all.ts`), CSS-stub loaders for Node. |
| **`cdn-poc/`** | Local static server for `cdn-dist/`, Jio fallback bake into `packages/ui/cdn-bootstrap/jio.ts`. |
| **`oneui.brands.json.example`** | Sample consumer config for Vite + `@oneui/vite-plugin`. |

**Root `package.json` scripts** (`build:foundation`, `build:brand-css`, `pack:release`, `pack:all`, `cdn:serve`, `cdn:bake-jio`) invoke files under this directory.

Runtime pieces (**`packages/vite-plugin`**, **`BrandProvider`**, **`cdn-bootstrap`**) stay under `packages/` — they ship with the library, not as scripts.
