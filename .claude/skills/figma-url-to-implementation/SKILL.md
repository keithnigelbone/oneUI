---
name: figma-url-to-implementation
description: >
  End-to-end agent workflow from a Figma design URL: extract requirements (MCP + REST),
  create or extend OneUI components (scaffold + token-only implementation), then match
  implementation using Storybook, Playwright, and figma-parity checks. Use when the user
  wants components built from Figma or a single pipeline from URL → code → validation.
metadata:
  author: OneUI Studio
  version: 1.0.0
  category: workflow
---

# Figma URL → implementation → match

The platform **QA validation hub** (**OneUI QA Agent** — `ValidationRunner` under Agents → Validation) assumes the component **already exists**. It pulls **Figma REST** geometry/typography where possible and surfaces **figma parity** checks — it does **not** author `packages/ui/src/components/**` by itself.

To make an agent behave as **URL → requirements → create → match**, run these phases **in order**.

---

## Phase 1 — Requirements from the Figma URL

1. **Parse** `figma.com/design/:fileKey/...?node-id=…` → `fileKey`, canonical node id (`-` → `:`). Same rules as `parseFigmaUrl.ts`.
2. **Figma MCP** (rich semantics): `get_design_context`, `get_metadata`, optional `get_variable_defs`, `get_screenshot` for a pinned reference PNG under `packages/ui/src/__tests__/<Component>/` when needed.
3. **Figma REST** (numbers for parity): same token as `FIGMA_ACCESS_TOKEN` / `FIGMA_TOKEN`; server-side extraction lives in `extractFigmaImplementationSpec.ts` (used by analyze + `pnpm generate:figma-parity-fixture`). Prefer a **node-id for the component instance**, not only the outer frame, so fills/radius/typography align with what `[role="status"]` / root selectors actually compute.

**Output of this phase:** a short spec (variants, sizes, roles, typography, spacing, radius, states) — **no literals** in final CSS; map intentions to **tokens** and **`<Surface>`** per `surface-context` and `design-composition` skills.

---

## Phase 2 — Create or update the implementation

- **New component:** `pnpm scaffold:component` from repo root, then implement **`Component.tsx`** + **`Component.module.css`** using Base UI primitives, **token-only** CSS, shared appearance types from `@oneui/shared`, and Storybook stories under `packages/ui/src/components/<Name>/`.
- **Existing component:** adjust props/CSS/stories to satisfy the Phase 1 spec.

Do **not** skip: `pnpm check:literals`, `pnpm validate:tokens`, Storybook coverage for the variants you care about.

---

## Phase 3 — Match implementation to Figma

1. **Storybook** at `http://localhost:6006`.
2. **Validation hub:** analyze with the same Figma URL + component slug — review **figmaParity** check list (computed CSS expectations).
3. **Fixture-driven parity tests:** `pnpm generate:figma-parity-fixture <Slug> "<figma url>"` seeds `figma-parity.fixture.json`. **Running Functional suites from the validation hub** rewrites that JSON from Figma REST immediately before Playwright so expectations track the pasted URL.
4. **Broader QA:** run Visual / Functional / Accessibility suites from the hub or `runSuites`; follow **`mcp-component-validation`** for MCP-driven screenshot diff and audits.

**Green outcome:** stories reflect Figma variants; Playwright + optional pixel diff pass; parity checks either pass or are intentionally trimmed (e.g. skip raw RGB vs `oklch()` until you add tolerance or compare resolved colors).

---

## Split of responsibilities

| Step | Mechanism |
|------|-----------|
| Requirements | **You (agent)** using Figma MCP + REST + repo rules |
| Code | **You (agent)** editing scaffolded OneUI component files |
| Orchestrated verify | **Platform** analyze API + Playwright under `packages/ui/src/__tests__/` |

There is **no single automated job** today that writes component source from a URL alone; this skill defines how an agent **simulates** that product behavior as a ordered routine.
