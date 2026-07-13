# External Integrations

**Analysis Date:** 2026-05-29

## Backend — Convex (Primary)

**Service:** Convex realtime database — single source of truth for all brand data

**SDK/Client:**
- `convex` ^1.39.1 (all consumers)
- `ConvexHttpClient` used in server-side routes (`apps/platform/src/lib/rag.ts`, Figma OAuth callback)
- `ConvexReactClient` used in React apps via `ConvexProvider`

**Connection:**
- Env var: `NEXT_PUBLIC_CONVEX_URL` (web platform)
- Env var: `STORYBOOK_CONVEX_URL` (Storybook)
- Env var: `EXPO_PUBLIC_CONVEX_URL` (mobile/Expo)

**Package:** `packages/convex/` (`@oneui/convex`) — wraps generated API, schema definitions, and query/mutation functions

**Offline mode:** Storybook supports `STORYBOOK_OFFLINE=1` which skips Convex and loads brand data from `@jds/kb-core/dist/brands/<slug>.json` static JSON files

**Key Convex tables** (from `convex/schema.ts`):
- `brands` — brand identity, OkLCH palette params, status
- `tokens` — design token values per brand/mode
- `tokenOverrides` — per-brand component token overrides
- `syncHistory` — Figma sync audit log
- `foundations` — typed foundation configs (color, surface, typography, etc.)
- `typographyV2Configs` — V2 relational typography config
- `componentRecipeSelections` — component recipe decision key-value pairs
- `vectorEntries` — RAG embedding vectors for knowledge ingestion

**Query architecture:** `getBrandOverviewData` returns all foundation data in a single query (color scales, surfaces, typography, preset, appearance config, platforms). Never split into per-component queries. All consumers read from `FoundationDataContext`.

---

## AI / LLM Providers

**Anthropic Claude (Primary AI):**
- SDK: `@ai-sdk/anthropic` ^3.0.54 via Vercel AI SDK
- Env var: `ANTHROPIC_API_KEY`
- Model: `claude-sonnet-4-6` (constant in `packages/shared/src/agent/models.ts`)
- Used in:
  - `/api/agent/executors/home.ts` — home design chat
  - `/api/agent/executors/design.ts` — design composition agent
  - `/api/agent/executors/voice.ts` — voice/tone agent
  - `/api/agent/executors/build.ts` — build agent
  - `/api/chat/route.ts` — legacy alias → home executor
  - `/api/composition/skills/generate-from-brief/route.ts` — skill generation
  - `/api/composition/critique/route.ts` — composition critique
- Pattern: `streamText()` with Vercel AI SDK, `convertToModelMessages()` for history

**OpenAI (Embeddings/RAG):**
- SDK: direct REST via Vercel AI SDK / `openai` package
- Env var: `OPENAI_API_KEY`
- Model: `text-embedding-3-small` (1536 dimensions)
- Used in: `apps/platform/src/lib/rag.ts` for RAG knowledge retrieval
- Also used by `scripts/ingest-knowledge.ts` and `scripts/embed-composition.ts`

---

## Figma Integration

**Type:** OAuth 2.0 — optional feature for token sync from Figma files

**Auth flow:**
- `GET /api/auth/figma/route.ts` — initiates OAuth redirect
- `GET /api/auth/figma/callback/route.ts` — exchanges code for tokens, stores encrypted in Convex

**Env vars:**
- `FIGMA_CLIENT_ID`
- `FIGMA_CLIENT_SECRET`
- `FIGMA_REDIRECT_URI` (defaults to `http://localhost:3000/api/auth/figma/callback`)
- `ENCRYPTION_KEY` — AES key for encrypting stored Figma access tokens (generate with `openssl rand -hex 32`)

**Hooks:**
- `apps/platform/src/hooks/useFigmaConnection.ts`
- `apps/platform/src/hooks/useFigmaSync.ts`

**Token schema fields:** `figmaId`, `figmaKey`, `source: 'figma'` on `tokens` table

---

## Supabase

**Usage:** Optional — smoke/theme test scripts only (`apps/platform/src/`)

**Env vars:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**SDK:** `@supabase/supabase-js` ^2.101.1 (in `apps/platform/package.json`)

---

## Authentication

**Type:** Custom password gate — no external auth provider

**Implementation:** `apps/platform/src/middleware.ts` — Next.js middleware checks `oneui_auth` cookie against `SITE_PASSWORD` env var (defaults to `'oneui2026'`)

**Public paths bypass:** `/auth`, `/api/auth`, `/api/voice/sdk`

**Figma OAuth:** Separate token-based auth stored encrypted in Convex (see Figma section above)

---

## CI/CD

**Platform Hosting:** Vercel

**Config:** `vercel.json` at repo root:
```json
{
  "framework": "nextjs",
  "installCommand": "npm i -g pnpm@9.15.9 && pnpm install",
  "buildCommand": "pnpm --filter @oneui/platform build",
  "outputDirectory": "apps/platform/.next"
}
```

**Vercel Project:** `prj_8T7tKdforPPNBQrIPDNc2N92zqkF` (Org: `team_iQbMZt1u7Ln98G5yHzGkz6Ux`)

**CI Workflows** (`.github/workflows/`):

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `quality-gates.yml` | PR/push to `main` | Full design-system gate: literals, tokens, a11y, typechecks, lint, unit tests, perf benchmark |
| `deploy-vercel.yml` | PR/push to `main`, manual | Build + deploy to Vercel (preview or production) |
| `deploy-storybook.yml` | Push to `main` (packages changed) | Build + deploy Storybook to GitHub Pages |
| `release.yml` | Push to `main`, manual | Changesets version PR or publish to Azure DevOps Artifacts |
| `sync-designmd.yml` | Push to `main` | Sync DesignMD exports |
| `voice-eval-l1.yml` | PR touching voice engine files | Run tone guard eval tests |
| `voice-eval-l2.yml` | — | Extended voice evaluation |

**Secrets required in GitHub Actions:**
- `VERCEL_TOKEN` — Vercel CLI authentication
- `NEXT_PUBLIC_CONVEX_URL` — Convex deployment URL (used by `designmd:export:check`)
- `AZURE_DEVOPS_PAT` — PAT for publishing to Azure DevOps Artifacts feed

---

## Package Registry

**Release target:** Azure DevOps Artifacts — `JIO-DS-ONE-UI` feed

**Registry URL:** `https://jio-dsp.pkgs.visualstudio.com/_packaging/JIO-DS-ONE-UI/npm/registry/`

**Package scope:** `@jds4/*`

**Tooling:** `@changesets/cli` for versioning; custom `scripts/pack-release.ts` for tarball packing

---

## Visual Testing

**Chromatic:**
- Package: `chromatic` ^16.7.0 + `@chromatic-com/storybook` ^5.1.2
- Used for Storybook visual regression (snapshots on PR)
- Run: `pnpm chromatic` (referenced in CLAUDE.md quality gates)

**Applitools:**
- Package: `@applitools/eyes-playwright` ^1.47.2 (in `apps/button-figma-validation/`)
- Used for Figma component parity visual testing
- Run: `pnpm test:button:applitools`

---

## Sandboxed Code Execution

**CodeSandbox Sandpack:**
- Package: `@codesandbox/sandpack-react` ^2.20.0 (in platform app)
- Used for the in-platform component code playground/sandbox
- Built output copied to `apps/platform/public/sandpack/` (`oneui-playground.mjs`, `oneui-playground.css`)

---

## Storybook Addons & External Integrations

**Storybook 10.4 addons** (`apps/storybook/package.json`):
- `@storybook/addon-a11y` — axe accessibility audit in Storybook UI
- `@storybook/addon-docs` — component documentation pages
- `@storybook/addon-themes` — theme switching toolbar
- `@storybook/addon-mcp` ^0.5.0 — Storybook MCP server integration
- `@storybook/addon-vitest` ^10.3.5 — Vitest browser test runner integration
- `@github-ui/storybook-addon-performance-panel` — performance panel
- `@chromatic-com/storybook` — Chromatic addon for visual regression

**Comparison libraries** (Storybook devDeps only — not used in production):
- `@mui/material`, `@mantine/core`, `@radix-ui/*` — side-by-side component comparisons in stories

---

## Domain-Specific Data Sources

**`@jds/kb-core`** (`packages/kb-core/`):
- Static brand JSON bundles used when Convex is unavailable (`STORYBOOK_OFFLINE=1`)
- Contains brand foundations, visual signatures, component knowledge

**Google Design.md (`@google/design.md` ^0.1.1):**
- Present in root devDependencies
- Used by `scripts/lint-designmd.ts`, `scripts/generate-design-md.ts`
- Format for structured component documentation exported from Convex

---

## Environment Variables Summary

| Variable | Required | Consumer | Purpose |
|----------|----------|----------|---------|
| `NEXT_PUBLIC_CONVEX_URL` | Yes | Platform, Storybook, scripts | Convex deployment URL |
| `STORYBOOK_CONVEX_URL` | Dev | Storybook | Separate Storybook Convex URL |
| `EXPO_PUBLIC_CONVEX_URL` | Mobile | `apps/mobile` | Mobile Convex URL |
| `ANTHROPIC_API_KEY` | Yes | Platform API routes | Claude LLM access |
| `OPENAI_API_KEY` | Yes | RAG, knowledge ingestion | Embeddings |
| `FIGMA_CLIENT_ID` | Optional | `/api/auth/figma/*` | Figma OAuth client |
| `FIGMA_CLIENT_SECRET` | Optional | `/api/auth/figma/callback` | Figma OAuth secret |
| `FIGMA_REDIRECT_URI` | Optional | `/api/auth/figma/*` | OAuth redirect URL |
| `ENCRYPTION_KEY` | Optional | Figma token storage | AES encryption key for Figma tokens |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Smoke scripts | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Smoke scripts | Supabase anon key |
| `SITE_PASSWORD` | Optional | Middleware | Platform access gate (defaults to `oneui2026`) |
| `NEXT_PUBLIC_USER_NAME` | Optional | Platform UI | Greeting personalisation |
| `STORYBOOK_OFFLINE` | Optional | Storybook | Skip Convex, use static JSON |
| `STORYBOOK_OFFLINE_BRAND` | Optional | Storybook | Brand slug for offline mode |

**Secrets in CI** (GitHub Actions secrets, not in `.env`):
- `VERCEL_TOKEN`
- `AZURE_DEVOPS_PAT`
- `NEXT_PUBLIC_CONVEX_URL` (available as CI secret for `designmd:export:check`)

---

## Webhooks & Callbacks

**Incoming:**
- `GET /api/auth/figma/callback` — Figma OAuth redirect
- `GET/POST /api/voice/sdk` — public Voice SDK endpoint (exempt from auth gate)

**Outgoing:**
- Convex realtime subscriptions (WebSocket, persistent)
- Anthropic API (HTTPS streaming via Vercel AI SDK)
- OpenAI Embeddings API (HTTPS, server-side only)
- Figma REST API (token exchange at OAuth callback time)

---

*Integration audit: 2026-05-29*
