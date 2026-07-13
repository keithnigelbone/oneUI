# Phase F — Skill Writer: Locked Execution Plan

> **For the fresh-context session executing this plan:** Phases A–E of the OneUI design.md integration are already done (audit, exporter, lint script, agent priming, multi-brand committed exports). Their code lives in the working tree on the parent branch. This document is the locked specification for **Phase F** — an LLM-assisted skill writer plus GitHub-side sync. Decisions are baked in; do not re-litigate them. If you find a concrete tension that blocks execution, raise it; otherwise execute the build sequence as written.

---

## Decisions baked in (do not re-debate)

- **Helper modes shipping in v1:** Draft + Review (no Refine).
- **UI placement:** Inline AI controls in the skill editor (no side panel, no separate page).
- **Budget model:** Platform-managed via the existing `ANTHROPIC_API_KEY`. **No** token-usage tracking, **no** banner, **no** budget context, **no** per-month caps. Drop entirely.
- **Auto-sync:** GitHub Action on cron (every 6h) + a "Sync now" button on the DCA config page that triggers `workflow_dispatch`.
- **Draft button guard:** Strict — disabled until `name` + `category` + ≥1 `applicableContexts` are set. Tooltip on disabled state explains the requirement. No conversational fallback.
- **Validation timing:** `validateSkill` (pure) runs on every keystroke. Save is blocked when any error-level issue exists (client guard + server guard, both required). Warnings render but don't block. Claude review is on-demand via the Review button only.
- **Few-shot source for Draft + Review:** `compositionSkills.getTopRated({ brandId, limit: 5 })` filtered to `positiveRatings > 0`. If fewer than 3 results, supplement with `DEFAULT_SKILLS` until we have 5 total. Cold-start brands get pure DEFAULT_SKILLS.
- **Sync card placement:** New `FoundationCard` titled "Sync to repository" on the DCA config page (`agents/design-composition/page.tsx`), positioned directly below the existing "Export DESIGN.md" card.

---

## Architecture

Phase F adds three pieces on top of the existing DCA infrastructure:

1. **`SkillWriterPanel` + `IssuePanel`** mounted inside each skill card on the skills page. Provides Draft (with strict guard), live validation feedback, and an on-demand "Review with Claude" button.
2. **Three API routes** (`/api/skills/draft`, `/api/skills/review`, `/api/skills/sync`) that handle the server-side AI calls + GitHub commit.
3. **GitHub Action** (`sync-designmd.yml`) for cron + `workflow_dispatch` triggered sync, plus a "Sync to repository" card on the DCA config page.

`validateSkill` is a pure function in `packages/shared/src/engine/compositionValidator.ts` (alongside the existing `validateComposition`). Used client-side on every keystroke and server-side as a guard in `/api/skills/draft`.

---

## Component design

### `validateSkill(draft: string): SkillValidationResult`

Located in `packages/shared/src/engine/compositionValidator.ts`. Add as a named export alongside the existing AST validator — do **not** modify `validateComposition`.

```ts
export interface SkillIssue {
  level: 'error' | 'warning';
  code: string;     // machine tag, e.g. 'MISSING_PLACEHOLDER'
  message: string;  // human-readable
}
export interface SkillValidationResult {
  valid: boolean;   // false iff any error-level issue exists
  issues: SkillIssue[];
}
export function validateSkill(draft: string): SkillValidationResult;
```

**Rules (deterministic, no Claude):**

| Code | Level | Condition |
|---|---|---|
| `EMPTY_DRAFT` | error | draft is blank after trim |
| `MISSING_BRAND_PLACEHOLDER` | error | `{brand}` not present |
| `HARDCODED_HEX` | error | any `#[0-9a-fA-F]{3,6}` literal |
| `HARDCODED_PX` | warning | bare px value not inside `var()` |
| `MISSING_SURFACE_GUIDANCE` | warning | no mention of `surface` or `Surface` |
| `EXCESSIVE_LENGTH` | warning | draft > 2000 characters |

### `SkillWriterPanel`

`apps/platform/src/app/(platform)/(studio)/agents/design-composition/skills/SkillWriterPanel.tsx`

Client component. Props: `skill: CompositionSkillDoc`. Owns a `draft` string state initialised from `skill.systemPromptTemplate`. `useMemo(() => validateSkill(draft), [draft])` → live issues. Renders the textarea + `<IssuePanel>` + Save + "Review with Claude" buttons. Save is disabled when `!result.valid || saving`. Review is always enabled.

### `IssuePanel`

`apps/platform/src/app/(platform)/(studio)/agents/design-composition/skills/IssuePanel.tsx`

Client component. Props: `issues: SkillIssue[]`. Renders nothing when empty. Error badges use `<Badge appearance="negative">`, warnings use `<Badge appearance="warning">`. Reused by Claude review feedback rendering.

### Sync card

Added to `apps/platform/src/app/(platform)/(studio)/agents/design-composition/page.tsx`, directly after the existing Export DESIGN.md `FoundationCard`. Contains a "Sync to GitHub" button that calls `/api/skills/sync` (which itself triggers `workflow_dispatch`). No GitHub token entered by the user — the action runs with `${{ secrets.GITHUB_TOKEN }}` server-side.

---

## Data flow

### Draft save

Browser textarea keystroke → `validateSkill(draft)` (pure, in-component) → if `valid: true`, Save button enabled → click → POST `/api/skills/draft` with `{ skillConvexId, draft }` → route re-runs `validateSkill` server-side, rejects 400 on any error → calls `fetchMutation(api.compositionSkills.update, …)` via `ConvexHttpClient` → Convex patches row + increments `version` + schedules re-embed.

### Claude review

Browser "Review with Claude" → POST `/api/skills/review` with `{ draft, brandId, category }` → route fetches `getTopRated({ brandId, limit: 5 })` from Convex, filters to `positiveRatings > 0`; if fewer than 3 results, supplements with `DEFAULT_SKILLS` until 5 total → builds few-shot review prompt → `generateText` with `claude-sonnet-4-6` (`@ai-sdk/anthropic`) → returns `{ feedback: string, suggestions: string[] }` → rendered inline in the panel.

### GitHub sync

Browser "Sync to GitHub" on the DCA config page → POST `/api/skills/sync` → route hits the GitHub REST endpoint `POST /repos/{owner}/{repo}/actions/workflows/sync-designmd.yml/dispatches` with `{ ref: 'main' }` using a server-side PAT from env (`GITHUB_PAT`). Returns `{ queued: true }`.

The GitHub Action `sync-designmd.yml` runs on `workflow_dispatch` AND on a 6-hour cron. It executes `pnpm designmd:export:all` against production Convex (using `secrets.CONVEX_URL`), commits any changed files in `docs/exports/*.DESIGN.md` to `main` via `stefanzweifel/git-auto-commit-action@v5`.

---

## Implementation map

### Files to create

| Path | Purpose | Est. LOC |
|---|---|---|
| `apps/platform/src/app/(platform)/(studio)/agents/design-composition/skills/SkillWriterPanel.tsx` | Draft editor with live validation + review button | ~140 |
| `apps/platform/src/app/(platform)/(studio)/agents/design-composition/skills/IssuePanel.tsx` | Issue display | ~40 |
| `apps/platform/src/app/api/skills/draft/route.ts` | Convex patch via HTTP, server-side validation guard | ~50 |
| `apps/platform/src/app/api/skills/review/route.ts` | Claude review with tiered few-shot | ~90 |
| `apps/platform/src/app/api/skills/sync/route.ts` | GitHub `workflow_dispatch` trigger | ~50 |
| `.github/workflows/sync-designmd.yml` | Cron + workflow_dispatch sync action | ~40 |
| `packages/shared/src/engine/__tests__/validateSkill.test.ts` | Unit tests for the validator | ~80 |

### Files to modify

| Path | Change |
|---|---|
| `convex/schema.ts` | Add `positiveRatings: v.optional(v.number())` to `compositionSkills` table |
| `convex/compositionSkills.ts` | Add `getTopRated` query (sort by `positiveRatings ?? 0` desc, limit param) |
| `convex/compositionFeedback.ts` | Increment `positiveRatings` on the related skill when a positive feedback record is inserted |
| `packages/shared/src/engine/compositionValidator.ts` | Add `validateSkill` named export; do not touch `validateComposition` |
| `packages/shared/src/engine/index.ts` | Re-export `validateSkill`, `SkillIssue`, `SkillValidationResult` |
| `apps/platform/src/app/(platform)/(studio)/agents/design-composition/skills/page.tsx` | Replace inline prompt-template editor with `<SkillWriterPanel skill={skill} />` |
| `apps/platform/src/app/(platform)/(studio)/agents/design-composition/page.tsx` | Insert "Sync to repository" `FoundationCard` directly below existing "Export DESIGN.md" card |

**Estimated total: ~490 new LOC + ~60 modifications ≈ 550 LOC.**

---

## Build sequence

Each phase has explicit acceptance criteria. Run `pnpm typecheck` and `pnpm test` after every phase. Stop and report if a phase's "Done when:" can't be satisfied.

### Phase 1 — Convex layer

- [ ] Add `positiveRatings: v.optional(v.number())` to the `compositionSkills` table in `convex/schema.ts`.
- [ ] Add `getTopRated` query to `convex/compositionSkills.ts`: takes `{ brandId, limit?: number }`, fetches all active skills for the brand, sorts by `(s.positiveRatings ?? 0)` descending, returns top `limit ?? 5`.
- [ ] In `convex/compositionFeedback.ts`: after a positive-feedback insert with `skillId`, look up the skill and `ctx.db.patch(skill._id, { positiveRatings: (skill.positiveRatings ?? 0) + 1 })`.
- [ ] Run `npx convex dev` — confirm schema pushes without error.

**Done when:** `getTopRated` returns an array (empty for cold-start brands is fine); positive feedback insertion increments the counter; existing rows continue to behave correctly with `positiveRatings: undefined`.
**Verified by:** `pnpm typecheck` zero errors; manual Convex dashboard query confirms.

### Phase 2 — `validateSkill` + tests

- [ ] Add `validateSkill` to `packages/shared/src/engine/compositionValidator.ts` as a named export. Do not modify the existing `validateComposition`.
- [ ] Re-export from `packages/shared/src/engine/index.ts` (`validateSkill`, `SkillIssue`, `SkillValidationResult`).
- [ ] Write unit tests in `packages/shared/src/engine/__tests__/validateSkill.test.ts` covering each rule from the table above + a clean draft.

**Done when:** All six validation rules trigger correctly; clean drafts return `valid: true` with zero issues.
**Verified by:** `pnpm --filter @oneui/shared test -- --run validateSkill` — all tests pass.

### Phase 3 — API routes

All three live under `apps/platform/src/app/api/skills/`. Mirror the existing executor pattern from `apps/platform/src/app/api/agent/executors/design.ts` for AI SDK + Convex HTTP usage.

- [ ] `/api/skills/draft/route.ts`: POST handler. Body: `{ skillConvexId: string, draft: string }`. Re-runs `validateSkill` server-side — 400 if any error-level issue exists (server guard). Calls `api.compositionSkills.update` via `ConvexHttpClient`. Returns `{ ok: true, version: number }`.
- [ ] `/api/skills/review/route.ts`: POST handler. Body: `{ draft: string, brandId: Id<'brands'>, category: string }`. Fetches `getTopRated({ brandId, limit: 5 })`, filters `positiveRatings > 0`, supplements with `DEFAULT_SKILLS` if fewer than 3. Builds few-shot prompt. Calls `generateText` with `claude-sonnet-4-6` (`CLAUDE_MODEL` constant from `@oneui/shared/agent`). Returns `{ feedback: string, suggestions: string[] }`.
- [ ] `/api/skills/sync/route.ts`: POST handler. Body: `{}`. Reads `GITHUB_PAT` env var. Calls `POST /repos/{owner}/{repo}/actions/workflows/sync-designmd.yml/dispatches` with `{ ref: 'main' }`. Owner/repo are hardcoded constants. Returns `{ queued: true }` on success or `{ error }` on failure. **Never log the PAT.**

**Done when:** All three routes respond correctly to valid + invalid inputs; the draft route's server guard catches the same errors the client guard catches.
**Verified by:** `pnpm typecheck` clean; manual smoke tests via curl on local dev.

### Phase 4 — UI + GitHub Action

- [ ] Create `IssuePanel.tsx`. Renders nothing for empty issues. Reuses existing `Badge` component for severity rendering.
- [ ] Create `SkillWriterPanel.tsx`. Owns `draft` state + `useMemo` validation. Strict-guard the Save button on `!result.valid || saving`. Strict-guard the Draft button on `!skill.name || !skill.category || (skill.applicableContexts ?? []).length === 0`. Tooltip on disabled Draft explains the requirement. Review button is always enabled, calls `/api/skills/review`, renders response in `<IssuePanel>` (or a dedicated section).
- [ ] In `agents/design-composition/skills/page.tsx`: replace the inline prompt-template editor block (~30 lines around the textarea) with `<SkillWriterPanel skill={skill} />`. Drop any local `editingId`/`editContent` state that only served the inline editor.
- [ ] In `agents/design-composition/page.tsx`: insert a new `FoundationCard` titled "Sync to repository" directly under the existing "Export DESIGN.md" card. Contains description + a `<Button attention="high">Sync to GitHub</Button>` that POSTs to `/api/skills/sync`. Inline status (loading, success, error).
- [ ] Create `.github/workflows/sync-designmd.yml`:
    ```yaml
    name: Sync DESIGN.md exports
    on:
      schedule: [{ cron: '0 */6 * * *' }]
      workflow_dispatch:
    jobs:
      sync:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: pnpm/action-setup@v3
          - uses: actions/setup-node@v4
            with: { node-version: '20', cache: 'pnpm' }
          - run: pnpm install --frozen-lockfile
          - run: pnpm designmd:export:all
            env:
              NEXT_PUBLIC_CONVEX_URL: ${{ secrets.CONVEX_URL }}
          - uses: stefanzweifel/git-auto-commit-action@v5
            with:
              commit_message: 'chore(designmd): sync DESIGN.md exports [skip ci]'
              file_pattern: 'docs/exports/*.DESIGN.md'
    ```
- [ ] Add `CONVEX_URL` to GitHub Actions repo secrets. Add `GITHUB_PAT` (with `actions:write` scope) to the platform's env vars (Vercel or `.env.local`).

**Done when:** Skills page renders `SkillWriterPanel` per skill card; Save is blocked with a red badge when validation fails; Sync card renders below Export on the config page; clicking Sync queues a workflow run; workflow runs successfully end-to-end on cron and manual dispatch.
**Verified by:** `pnpm typecheck`, `pnpm test`, `pnpm check:literals` all pass; manual walkthrough on a Jio skill; GitHub Action run completes.

---

## Critical details

- **Strict draft guard, dual layer.** Client UX gate AND server-side `validateSkill` re-run in `/api/skills/draft`. Both are required.
- **Auto-validate on save.** `validateSkill` runs on every keystroke (pure, no debounce needed). The `IssuePanel` is rendered below the textarea unconditionally; it just renders nothing when empty.
- **Tiered few-shot is canonical.** Always combine top-rated brand skills with `DEFAULT_SKILLS` until 5 total. Never under-fill.
- **No token tracking.** Do not add tracking tables, banners, env vars, or usage queries. The platform absorbs cost via `ANTHROPIC_API_KEY`.
- **GitHub PAT never logged.** Sync route reads from env, never echoes back, never persists.
- **Path notes:** Convex code is mounted at both `/convex/` and `/packages/convex/convex/` (same content). The plan uses `/convex/` paths for brevity; either resolves correctly.
- **Branch:** Cut `feat/phase-f-skill-writer` from whichever branch carries Phases A–E. The fresh session should NOT modify Phases A–E artifacts; everything Phase F is additive.

---

## Acceptance — top-level

Phase F is done when:

1. A designer can open any skill on the DCA skills page, see live validation feedback as they type.
2. Clicking "Draft with AI" with all required fields filled streams a Claude-generated draft into the textarea.
3. Clicking "Review with Claude" returns a structured feedback list rendered in the IssuePanel.
4. Saving a skill with any error-level issue is blocked at both the client and server layers.
5. Clicking "Sync to GitHub" on the DCA config page triggers a workflow_dispatch run that commits updated `docs/exports/*.DESIGN.md` files within ~3 minutes.
6. The cron-driven sync (every 6h) runs successfully without manual intervention.
7. `pnpm typecheck`, `pnpm test`, `pnpm check:literals`, `pnpm lint:designmd` all pass.
