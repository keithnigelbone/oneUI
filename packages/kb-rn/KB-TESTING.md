# Testing the RN Knowledge Base (for JDS developers)

Everything below runs **in this repo**, with no external tooling and no network.
(The in-IDE experience is delivered by an MCP-compatible coding agent you
*install as a plugin* — see step 4 — never by cloning anything.)

## 1. Is the KB correct + in sync? (the gates)

```bash
pnpm --filter @jds/kb-core test          # schema, composition compiler, graph builder (47)
pnpm --filter @jds/kb-rn  build          # 35 metas + manifest + kb-graph.json (182 nodes / 631 edges)
pnpm --filter @jds/kb-rn  verify:tokens  # 0 errors — token claims match each component's impl
pnpm --filter @jds/kb-rn  kb:check       # "in sync" — metas match @oneui/ui-native source
pnpm --filter @jds/kb-rn  test           # 75
```

## 2. See the power (one command, in this repo)

```bash
pnpm --filter @jds/kb-rn kb:demo
```
Prints the savings spectrum against the real `@oneui/ui-native` source:

| Scenario | Read source | KB | Saving |
|---|---|---|---|
| Discover the library | ~230k tok | ~160 tok (roster+graph) | **~100%** |
| One component's contract | ~6.8k tok | ~200 tok (lean card) | **~97%** |
| Build a 5-component feature | ~43k tok | ~900 tok | **~98%** |

Plus what source-reading can't cheaply give at all: valid children per slot,
figma-key → component, find-by-intent, machine-readable rules, and a KB that
**can't go stale** (`kb:check`).

## 3. The KB stays in sync when you change a component

```bash
# edit a prop in packages/ui-native/src/components/Button/interface.ts
pnpm --filter @jds/kb-rn kb:check   # ❌ "DRIFT Button: source changed…"
# update packages/kb-rn/src/components/JDSButton.ts to match, then:
pnpm --filter @jds/kb-rn kb:bless   # ✅ records the reconciliation
```
A component PR that changes props without updating its meta goes red. (Wire
`build + verify:tokens + kb:check + test` into CI on a runner-equipped host.)

## 4. Use it from your IDE (via an MCP plugin)

The KB ships stable `dist/` artifacts — `manifest.json`, `kb-graph.json`,
`components.json`, and per-component prop/composition schemas — that **any
MCP-compatible coding agent** can consume to expose design-system query tools
(`kb_*` — minimal-context / component / compose / resolve-figma / search /
rules) to Claude / Cursor / Codex / Windsurf. Then ask: *"what can go inside a
Card?"*, *"build a JDS checkbox field"*, *"what JDS rules apply?"* and the agent
answers from the KB, not by reading source.

> Today `@jds/kb-*` isn't published yet, so the agent resolves this KB from the
> repo checkout / `ONEUI_STUDIO_PATH`. After JFrog publish it's zero-setup.

## Acceptance checklist
- [ ] Gates (1) all green. [ ] `kb:demo` (2) shows the savings spectrum.
- [ ] Editing a component reds `kb:check` until re-blessed (3).
- [ ] With an MCP plugin, the `kb_*` tools answer design-system questions in your IDE (4).
