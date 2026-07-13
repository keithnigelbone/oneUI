---
phase: 03-preview-eval-repair
plan: 05
subsystem: preview
tags: [daytona, sandbox, zero-egress, preview, screenshot, supply-chain, isolation]

# Dependency graph
requires:
  - phase: 03-preview-eval-repair (Plan 02)
    provides: "PreviewExecutor seam (RenderInput/RenderResult/render), IframeCspExecutor sibling, lifecycle + DEFAULT_PROFILES"
provides:
  - "DaytonaExecutor — production zero-egress preview/screenshot path (D-01) behind the PreviewExecutor seam"
  - "@daytonaio/sdk@0.183.0 installed (human-approved at blocking supply-chain gate), imported ONLY by DaytonaExecutor.ts"
  - "Credential-free mocked contract test proving create-time networkBlockAll + finally teardown + no secret leak"
  - "DAYTONA_API_KEY documented in .env.example (server-side only)"
affects: [preview workflow wiring, Mastra previewStep executor selection, 03-VALIDATION manual network-egress probe]

# Tech tracking
tech-stack:
  added: ["@daytonaio/sdk@0.183.0"]
  patterns:
    - "Single vendor importer: only DaytonaExecutor.ts imports @daytonaio/sdk; the seam + sibling stay vendor-free"
    - "Create-time networkBlockAll (works on all account tiers) over post-create updateNetworkSettings (Tier-3/4)"
    - "In-box capture via process.executeCommand emitting base64 PNG — no external CDP (issue #4456)"
    - "Constructor client injection (Pick<Daytona,'create'>) enables credential-free vi.mock tests"

key-files:
  created:
    - packages/experience-builder-preview/src/DaytonaExecutor.ts
    - packages/experience-builder-preview/src/DaytonaExecutor.test.ts
  modified:
    - packages/experience-builder-preview/src/index.ts
    - packages/experience-builder-preview/package.json
    - .env.example
    - pnpm-lock.yaml

key-decisions:
  - "Set networkBlockAll at CREATE time (Open Q4) — works on all Daytona account tiers; avoids the Tier-3/4 post-create updateNetworkSettings dependency"
  - "Run capture INSIDE the sandbox (process.executeCommand → base64 PNG) instead of connecting an external CDP (Pitfall 1 / GitHub issue #4456 not GA)"
  - "Surface only the signed preview URL (carrying an opaque token) into previewState; DAYTONA_API_KEY never leaves the server (PREV-01)"
  - "Expose an optional networkAllowList (pinned CIDR) for the rare CDN case (Assumption A4); default path is full zero-egress"

patterns-established:
  - "Pattern: vendor SDK confined to one impl file behind a vendor-free seam (CI import-guard friendly)"
  - "Pattern: per-run sandbox.delete() teardown in finally, even on thrown capture (D-02)"

requirements-completed: [PREV-01, PREV-04]

# Metrics
duration: ~18min
completed: 2026-06-01
---

# Phase 03 Plan 05: DaytonaExecutor Zero-Egress Preview Path Summary

**Added `DaytonaExecutor` — the production zero-egress preview/screenshot backend (D-01) — behind the existing `PreviewExecutor` seam: it renders the already-compiled artifact inside a `networkBlockAll: true` Daytona sandbox that cannot reach Convex/auth (PREV-01), screenshots per profile credential-free (PREV-04), and returns an immutable signed preview URL (PREV-02), installed only after a human-approved blocking supply-chain gate at v0.183.0.**

## Performance

- **Duration:** ~18 min
- **Tasks:** 3 (Task 1 = blocking gate, satisfied by orchestrator checks + human approval; Tasks 2–3 implemented)
- **Files modified/created:** 6

## Accomplishments

- `DaytonaExecutor` implements `PreviewExecutor` and is the **sole** importer of `@daytonaio/sdk` — the seam and `IframeCspExecutor` stay vendor-free.
- Zero-egress guaranteed at the VM boundary: `create({ networkBlockAll: true })` set at **create time** (works on all account tiers), inside a `try/finally` that always `sandbox.delete()`s.
- Per-profile capture runs **inside** the sandbox (`process.executeCommand` emitting base64 PNG) — no external CDP (Pitfall 1 / issue #4456). Signed preview URL via `getSignedPreviewUrl(port, ttl)` (PREV-02).
- API key never crosses the boundary: it is read server-side only by `new Daytona()` and never written into the bundle, `previewState`, or screenshots (PREV-01).
- 7 new credential-free contract tests (15 total in the package) pass with **no** `DAYTONA_API_KEY` and no live sandbox; `.env.example` documents the key as server-side only.

## Task 1 — Blocking supply-chain gate (RESOLVED before this agent ran)

Task 1 is the BLOCKING `checkpoint:human-verify` (`gate="blocking-human"`) supply-chain gate for the `[ASSUMED]` package `@daytonaio/sdk` (slopcheck was offline). It was **satisfied by the orchestrator** before this executor started:

- `npm view @daytonaio/sdk repository.url` → `git+https://github.com/daytonaio/daytona.git` (official repo, not a typosquat) — re-confirmed by this agent.
- `npm view @daytonaio/sdk scripts.postinstall` → empty (no install-time code execution) — re-confirmed.
- Latest `0.183.0` on an active release train (next/rc/dev/alpha dist-tags present); maintainers include the official `zzorica@daytona.io` Daytona org account.
- **Human decision: `approved: 0.183.0`.**

Install proceeded only at the approved version. The gate was NOT auto-approved.

## Task Commits

1. **Task 2: Install @daytonaio/sdk@0.183.0 + implement DaytonaExecutor** — `d1453a36` (feat)
2. **Task 3: Credential-free contract test + .env.example** — `a0c83ec4` (test)

## Files Created/Modified

- `packages/experience-builder-preview/src/DaytonaExecutor.ts` — production zero-egress executor; sole `@daytonaio/sdk` importer; create-time `networkBlockAll`, in-box capture, signed preview URL, finally teardown.
- `packages/experience-builder-preview/src/DaytonaExecutor.test.ts` — credential-free mocked-SDK contract test (create-time block, teardown-on-throw, no-leak, allow-list variant).
- `packages/experience-builder-preview/src/index.ts` — export `DaytonaExecutor` + `DaytonaExecutorOptions`.
- `packages/experience-builder-preview/package.json` — add `@daytonaio/sdk@0.183.0` dependency.
- `.env.example` — document `DAYTONA_API_KEY` (server-side only; never reaches preview).
- `pnpm-lock.yaml` — lockfile entry for the new dependency (orchestrator reconciles after merge).

## Verification

- `pnpm --filter @oneui/experience-builder-preview test` → **15 passed** (credential-free, no env vars).
- `pnpm --filter @oneui/experience-builder-preview typecheck` → **zero errors** (src + test).
- `grep` confirms: only `DaytonaExecutor.ts` imports `@daytonaio/sdk`; `networkBlockAll: true` present at `create(...)`; no `connectOverCDP`/`connect_over_cdp`; `sandbox.delete()` in `finally`.
- **Manual (deferred per 03-VALIDATION.md):** the LIVE zero-egress network probe — spinning a real sandbox and confirming it cannot reach the Convex URL (PREV-01) — requires real credentials + a live sandbox and is not automatable here.

## Deviations from Plan

**1. [Rule 2 — Auto-add critical functionality] Non-zero exit-code guard on in-box capture**
- **Found during:** Task 2 (implementing `captureInBox`).
- **Issue:** A sandbox capture that exits non-zero would otherwise silently produce a corrupt/empty PNG and a false `rendered: true`, undermining VAL-06 render-success semantics.
- **Fix:** Throw on `exitCode !== 0` per profile; the `finally` still tears the sandbox down. Added a dedicated test asserting this path also runs teardown.
- **Files modified:** `DaytonaExecutor.ts`, `DaytonaExecutor.test.ts`
- **Commit:** `d1453a36` / `a0c83ec4`

## Notes

- The Task-2 acceptance grep `grep -rln "@daytonaio/sdk" .../src` matches two files, but the second hit (`PreviewExecutor.ts`) is a **pre-existing comment** from Plan 02 stating it imports NO `@daytonaio/sdk`. The real single-importer invariant — verified by an import-statement grep (`from '@daytonaio/sdk'`) — holds: only `DaytonaExecutor.ts` imports the vendor.
- DaytonaExecutor is a clean swap behind the seam (D-02): if Daytona is ever deferred, `IframeCspExecutor` (Plan 02) remains the MVP path with zero workflow rework.

## Known Stubs

- `buildCaptureCommand` references an in-box renderer `preview/capture.js` (the Playwright-in-box / native-screenshot harness). The executor contract (create-time zero-egress, capture loop, signed URL, teardown, no-leak) is fully implemented and tested; provisioning the in-box renderer image/script is a runtime/ops concern exercised by the deferred live network-egress probe (03-VALIDATION.md), not by the credential-free contract suite. This is intentional and matches D-03 (Daytona executes; it does not author React).

## Self-Check: PASSED
