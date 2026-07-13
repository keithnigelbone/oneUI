# Typography: customized Display/Headline brands lose the L-group step-up at render

> Tracking note surfaced during review of PR #369. File as a GitHub issue with the
> command at the bottom (the agent could not publish it directly).

## Summary

The L-breakpoint-group step-up for **Display** and **Headline** (large screens grow
one tier) is emitted as static CSS in `packages/tokens/src/css/typography/typography.css`
under `@layer base`, keyed on `[data-Breakpoint="L"]`.

When a brand **customizes** a Display/Headline base step, the brand CSS injection
pipeline emits a `:root` override in `@layer brand` (via `generateTypographyCSSV2`
in `packages/shared/src/utils/typography/v2.ts`). `@layer brand` **outranks**
`@layer base`, so the brand's `:root` value pins **every** viewport to the base
step — the large-screen step-up is silently lost.

The editor preview computes the effective step with `applyBreakpointGroupBump`
(`getEffectiveFStepForPlatform`), so **the editor shows the bump but the real
render does not** → editor↔render divergence for any brand that customizes
Display/Headline.

Default (non-customized) brands are unaffected — they fall through to the static
`typography.css` and render the bump correctly.

## Where it's documented in code

A `TODO(typography/L-group-bump)` block in `packages/shared/src/utils/typography/v2.ts`
(`generateTypographyCSSV2`) describes this exact gap. This note tracks closing it.

## Proposed fix

For the two `BREAKPOINT_BUMP_ROLES` (`display`, `headline`), `generateTypographyCSSV2`
should ALSO emit a viewport-scoped block:

```css
[data-Breakpoint="L"] {
  /* per customized size: applyBreakpointGroupBump(role, size, fStep, 'L') */
}
```

so a customized base step still steps up on the L group, matching both
`typography.css` and the editor preview. Non-customized brands remain unaffected.

## Acceptance criteria

- A brand that customizes `Display-L` (or any Display/Headline size) renders the
  L-group step-up at viewport ≥ 991px, matching the editor preview.
- Default brands are unchanged.
- Add a unit test in the shared package asserting the bumped declaration is present
  for a customized Display/Headline config and absent for flat roles.

## References

- `packages/shared/src/utils/typography/v2.ts` — `generateTypographyCSSV2` (TODO block)
- `packages/shared/src/data/typography-roles.ts` — `applyBreakpointGroupBump`,
  `L_GROUP_FSTEP_DELTA`, `BREAKPOINT_BUMP_ROLES`
- `packages/tokens/src/css/typography/typography.css` — static L-group block
- Surfaced during review of PR #369.
