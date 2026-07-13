# Component Adoption Readiness

Use this checklist before inviting external teams to test OneUI components.
It captures the rules that make components portable across brands, surfaces,
Storybook, and product apps.

For the Jio web alpha release, the supported component list is defined in
`packages/ui/src/registry/jioAlphaCatalog.ts`. Treat components outside that
catalog as experimental unless a release note explicitly graduates them.

## Surface Context

- Wrap any non-default container in `<Surface mode="...">`. Do not validate
  context awareness with Storybook Backgrounds; they tint the canvas but do not
  create a `data-surface` ancestor.
- Prefer `default`, `subtle`, and `bold` in adopter examples. They cover the
  common contrast cases without teaching every surface mode at once.
- Inside a Surface, keep child styling generic: `appearance`, `attention`,
  `start`, and `end` props should do the work. Avoid manual color overrides in
  adoption fixtures.

## Slots

- Public content slots are `start` and `end`. Use them for icons, badges,
  avatars, or short supporting content next to the main label.
- Directional layout slots are `leading`, `center`, and `trailing`, and only
  belong on composite chrome such as headers or toolbars.
- Primitive internals use `partProps`, not `slotProps`. These are for Base UI
  part-level overrides and should not be presented as content slots.
- Slotted child components keep their own semantics. If a slotted child is
  meaningful or interactive, give that child its own `appearance` and accessible
  name instead of relying on the parent.

## Accessibility Gate

Run the focused adoption suite before release:

```bash
pnpm test:a11y
```

The suite covers the patterns most likely to regress during adoption:
icon-only actions, icon-only tabs, searchable selects, segmented controls,
switches, dialogs, chips without visible text, pagination dots, and tooltip
trigger pairings.

Adopter examples must follow these rules:

- Icon-only controls require an explicit accessible name on the control itself.
- Tooltip text does not replace `aria-label`.
- Dialog examples include a title and, when useful, a description.
- Switches and segmented controls are either visibly labeled or named with ARIA.

## Storybook Fixtures

- Each release-candidate component needs a canonical adoption fixture that uses
  real `<Surface>` containers, multiple appearances, and real slotted children.
- Use component stories such as Button `Surface Context` and Tabs `Adoption
  Matrix` as the source of truth for contrast and slot behaviour.
- Validate with a brand selected in Storybook when reviewing multi-accent or
  generated brand CSS behaviour.

## Performance Budgets

Run the brand CSS harness before adoption milestones:

```bash
pnpm bench:pipeline
pnpm check:perf
```

The harness enforces payload budgets for root CSS, surface-context CSS, the
complete injected stylesheet, and the number of Storybook brand style channels.
Breaches are adoption-readiness issues because every brand switch replaces the
complete stylesheet text.

## Release Readiness

A component is ready for tester adoption when:

- `pnpm test:a11y`, `pnpm check:metadata`, `pnpm check:machine-docs-fresh`, and
  `pnpm check:perf` are clean or intentionally waived with evidence.
- Its public slots use the canonical vocabulary.
- Its Storybook adoption fixture demonstrates `Surface` context, appearance,
  attention or variant, and real slotted children.
- Generated docs do not mention deprecated slot names.
