# RFC 0001 — Slot Naming Convention

Status: **Accepted** (2026-04-20)
Owner: Design System team
Drivers: [Design System Audit 2026-04-20](../design-system-audit-2026-04-20.md) (finding #4), [Strategic Response](../../.claude/plans/pasted-text-1-930-tender-ocean.md) P0-4

## Problem

The word "slot" is overloaded across the design system. It refers to three different concepts, and its public-facing vocabulary drifts between very similar components:

| Observed name       | Component example                 | Actual meaning          |
| ------------------- | --------------------------------- | ----------------------- |
| `start` / `end`     | `Input`, `ListItem`               | Content slot (ReactNode) |
| `startSlot` / `endSlot` | `TouchSlider`, `ChatComposer`  | Content slot (ReactNode) |
| `leading` / `trailing` | `TopBar`                        | Directional composite slot |
| `centerSlot` / `rightSlot` | internal nav                | Directional composite slot |
| `slots`             | `Stepper` (previously), Base UI   | Base UI internal part overrides (`ElementType`) |
| `slotProps`         | `Stepper`, `Button`, etc.         | Base UI internal part HTML props |

This makes the system harder to teach, harder to document, and harder to scale across tooling (editor, AI context, Storybook autodocs).

## Decision

Three buckets of API, each with a single name.

### 1. Public content slots → `start` / `end`

Simple, symmetric content regions default to `start` and `end`. They accept `ReactNode` and sit at either side of the component's primary content.

```tsx
<Input start={<SearchIcon />} end={<ClearButton />} />
<ListItem start={<Avatar />} end={<Chevron />} />
<Button start={<Icon />}>Save</Button>
```

**Rules:**
- Name is always bare: `start`, `end`. **Never** `startSlot`, `endSlot`, `startIcon`, `endIcon`.
- Additional slots at the same tier use suffixes: `start2`, `end2` (precedent: `Input`).
- A prop declared `ReactNode` whose name matches `start`, `end`, `start\d+`, `end\d+`, `leading`, `trailing`, or `*Slot` **must** be declared in the component's `meta.slots[]`. Enforced by `pnpm check:metadata`.

### 2. Directional composite slots → `leading` / `trailing`

Composite layout components (navigation bars, app headers, toolbars) where the slot participates in a three-part layout **may** use `leading` / `center` / `trailing`. Use these **only** when directionality is the real semantic — if the component has two symmetric content regions, use `start` / `end` instead.

```tsx
<TopBar
  leading={<MenuButton />}
  center={<Title />}
  trailing={<AvatarMenu />}
/>
```

**Rules:**
- Use `leading` / `center` / `trailing` as a group. Do not mix with `start` / `end` in the same component.
- Never use `left` / `right` — they do not reverse under RTL.

### 3. Primitive internal overrides → `parts` / `partProps`

Base UI internal element overrides (the React element used for a primitive part, or the HTML props forwarded to it) are renamed from `slots` / `slotProps` to `parts` / `partProps`. This frees the word "slot" for concept 1 and matches the vocabulary Radix, HeadlessUI, and Base UI itself converged on in their guidelines.

```tsx
<Dropdown
  parts={{ trigger: CustomButton }}
  partProps={{ trigger: { 'aria-label': 'Open menu' } }}
/>
```

**Rules:**
- `parts` is optional. Components that never expose internal overrides simply omit it.
- `partProps` keys mirror `parts` keys.
- The rename is a breaking change — see migration plan below.

## Migration plan

### Phase A — land the convention (this RFC)
- Merge RFC into `docs/rfcs/0001-slot-naming.md`.
- Link from `CLAUDE.md` so agents reference it.
- Land `scripts/check-metadata.ts` (already shipped in Phase 0). The script surfaces existing drift but does not yet block CI.

### Phase B — fix current drift (next 2 weeks)
Three components have active drift as of 2026-04-20:

| Component    | Drift                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------ |
| `TouchSlider`| Props `startSlot` / `endSlot` → rename to `start` / `end`; update `meta.slots[]`.                |
| `Tabs`       | Meta lists `activateOnFocus`, `loopFocus`, `disabled`, `start`, `end` that do not exist on props. Either add to props or remove from meta. |
| `WebHeader`  | Meta lists 6 props + 3 slots not in props. Decide real public surface; align.                    |

Each is its own PR. Each ships a codemod for in-repo consumers if a rename is involved.

### Phase C — rename `slots` → `parts` (next 4-6 weeks)
- Write a `jscodeshift` codemod: `slots` → `parts`, `slotProps` → `partProps`. Run across `packages/ui` + `apps/platform`.
- Update the `ComponentMeta` schema in `packages/shared` so `slots` unambiguously refers to content slots and `parts` refers to primitive overrides.
- Keep a deprecation alias (`slots` → `parts`) for one minor release; emit dev-mode warn.

### Phase D — enable CI gate
- Once all drift is cleared, add `pnpm check:metadata` to the CI pipeline. Merges that introduce new drift block.

## Non-goals

- Renaming `className` / `style` / `ref` — these are canonical React names and remain.
- Changing `data-*` attributes on rendered DOM. Attributes like `data-surface`, `data-appearance` are a separate system.
- Forcing every component to accept slots. A single-purpose primitive (e.g., `Divider`) has no content slots and should not declare any.

## Enforcement

- **TypeScript** — props interfaces define the contract. The interface is authoritative.
- **`pnpm check:metadata`** — gates `meta.props[]` and `meta.slots[]` against the props interface. Run locally; wired into CI after Phase C.
- **Code review** — reviewers reject new props named `*Slot` (outside an approved exception) and new components that overload the word `slots` for primitive overrides.

## References

- Design System Audit 2026-04-20 (finding #4)
- Strategic Response Plan (P0-4)
- `packages/shared/src/types/componentMeta.ts` — `SlotDescriptor` type
- `scripts/check-metadata.ts` — drift detector
