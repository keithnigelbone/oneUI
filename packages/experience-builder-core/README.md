# @oneui/experience-builder-core

Framework-agnostic contracts for the **Jio AI Experience Builder Lab** — an isolated workspace where AI composes, validates, critiques, repairs, and exports design-system-native experiences using **only** real Jio Design System foundations, multi-brand tokens, Jio CSS, and Storybook-approved Jio components.

This package is the frozen contract layer (the canonical **Jio Experience IR**, the output-profile table, the foundation/component/validation/event contracts, and the IR↔AST mapper). It is pure TypeScript + Zod — it runs in Node, the browser, or a worker, and has no React dependency.

> **Core value:** AI cannot bypass the Jio Design System. Every generated artifact is provably composed from real Jio foundations, Jio CSS, and Storybook-approved Jio components — no Tailwind, no external visual kits, no invented components, no arbitrary values when a Jio token/foundation value exists. Missing pieces emit a typed Jio system **gap report** instead of being invented.

---

## Isolation model — "isolation by package, reuse by contract"

The Lab lives **inside** a mature monorepo that already ships a production Experience Builder (`ExperienceCanvas` / the `(builder)` route). The Lab must never modify or break that existing Builder. Isolation is structural:

### The Lab surface

| Package / route | Role |
|-----------------|------|
| `packages/experience-builder-core` | Frozen contracts: markup-free IR (Zod), 13-member card-kind model, output-profile table, foundation/component/validation/event contracts, IR↔AST mapper, JSON-patch. |
| `packages/experience-builder-registry` | Read-only adapter over the Jio component registry (allowlist source of truth). |
| `packages/experience-builder-validation` | AST-based validator (structural, never regex) enforcing the Jio allowlist. |
| `packages/experience-builder-agents` | Mastra workflow orchestration (the single app-side Mastra touchpoint). |
| `packages/experience-builder-preview` | **Stub in P1.** Separate-origin preview hosting (built P3). See `../experience-builder-preview/PREVIEW-DECISION.md`. |
| `packages/experience-builder-export` | **Stub in P1.** Artifact export (built P4/P5). |
| `apps/platform/.../(experience-lab)` | The isolated Lab route at `/lab` — passthrough layout, scoped tldraw canvas, docked request + run-inspector panels, Node run route. |

### MUST NOT TOUCH (read-only references)

The Lab treats the following as **read-only contracts** — it may mirror their *patterns*, but never import, edit, re-mount, or reorder them:

- `apps/platform/src/design-tools/ExperienceCanvas/**` — the existing Builder canvas + its tldraw store singleton.
- `apps/platform/src/app/(platform)/(builder)/**` — the existing Builder route.
- `FoundationStyleProvider` — the brand-CSS injection provider. The Lab route's passthrough layout never wraps, reorders, or re-mounts it.

The dependency arrow is **one-way**: the Lab may depend on public `@oneui/*` APIs; the existing Builder may **never** depend on any `experience-builder-*` package or the `(experience-lab)` route.

### Enforcement gates

Three cooperating gates keep the isolation honest (all wired into `pnpm ci:gates`):

1. **eslint Lab↔Builder boundary** (`eslint.config.mjs`, both directions):
   - The existing Builder tree may not import `@oneui/experience-builder-*`.
   - The Lab packages + `(experience-lab)` route may not deep-import `(builder)` / `ExperienceCanvas` internals.
   - The `@oneui/ui` **barrel** is forbidden everywhere — use deep paths (`@oneui/ui/components/<Name>` in packages, `@oneui/ui-internal/components/<Name>` in `apps/platform`).
2. **`pnpm check:single-ai`** — asserts at most one `ai@6.x` resolves inside the Lab dependency subtree (guards against Mastra pulling a second `ai` copy that would silently break streaming/structured output).
3. **`pnpm smoke:builder`** — the LAB-03 runtime gate: asserts the existing `(builder)` canvas route still boots (route + `CanvasContent` parse cleanly and expose a route component) **and** that the Builder tree imports zero Lab code (one-way isolation intact).

---

## How to run the Lab

```bash
pnpm install              # link all experience-builder-* packages
pnpm dev                  # start the platform dev server (apps/platform)
# then open the Lab at:
#   http://localhost:3000/lab
```

The `/lab` route boots an isolated tldraw canvas. Add a prompt card, configure it in the docked **Request** panel (brand from the real Convex `brands.list` query, artifact type, type-filtered output profile, prompt), and click **Run generation**. The **Run inspector** panel streams the `ExperienceBuilderEvent` timeline; a valid run drops a structured-IR artifact card inside a "Run #N" frame, while a foundation/component gap short-circuits to a typed gap-report card (no artifact is invented).

### Tests + gates per package

```bash
pnpm --filter @oneui/experience-builder-core test
pnpm --filter @oneui/experience-builder-validation test
pnpm --filter @oneui/experience-builder-agents test
pnpm --filter @oneui/platform test          # Lab route + canvas + panel jsdom tests
pnpm smoke:builder                          # LAB-03 isolation gate
pnpm check:single-ai                        # single ai@6 in the Lab subtree
pnpm ci:gates                               # the full gate chain (includes both above)
```

---

## Hard constraints (inherited from the project)

- **Jio DS components + Jio CSS only** — for the Lab UI *and* all generated artifacts. No Tailwind, no external visual kits.
- **Mastra owns orchestration**; the Vercel AI SDK is the model layer only.
- **The Jio Experience IR is canonical** — never raw JSX as the source of truth. The IR carries no markup-bearing fields (no `tag`/`rawHtml`/`dangerouslySetInnerHTML`). Compile IR → React + Jio CSS with approved imports only.
- **Uncovered output profiles return a typed gap report, never invented dimensions** — see `FOUNDATION-COVERAGE.md`.
- **Sandboxed previews run isolated** (separate origin + CSP) — see `../experience-builder-preview/PREVIEW-DECISION.md`.

## Further reading

- `FOUNDATION-COVERAGE.md` — which output profiles Jio foundations actually DEFINE vs ASSUME (FND-01 audit).
- `../experience-builder-preview/PREVIEW-DECISION.md` — the separate-origin preview hosting decision.
- `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md` — full project context (GSD-managed).
