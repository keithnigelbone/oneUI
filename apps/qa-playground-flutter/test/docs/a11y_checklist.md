# Flutter component accessibility checklist (WCAG 2.1 AA)

Use for every new component folder under `test/components/{name}/`.

## P0 — Must pass before ship

- [ ] Control has an accessible name (`Semantics.label` or equivalent)
- [ ] Role/state matches APG pattern (button, checkbox, radio, text field, …)
- [ ] Disabled controls are not activatable and expose disabled semantics
- [ ] Hidden controls (`aria-hidden`) are excluded from semantics tree

## P1 — WCAG fixable in widget tests

- [ ] Label override order documented (`semanticsLabel` > `ariaLabel` > visible text)
- [ ] Invalid state forwarded where applicable (`aria-invalid`)
- [ ] Description linked (`aria-describedby` / `describedBy`)
- [ ] Loading/busy state announced (hint or enabled=false)
- [ ] Group semantics (checkbox/radio groups, chip groups)

## P2 — Manual / device only

- [ ] VoiceOver / TalkBack spot check on real device
- [ ] Keyboard focus order (desktop)
- [ ] Touch target ≥ 44×44 (layout assertion where feasible)
- [ ] Color contrast (engine/token responsibility — verify on default + Surface)

## Test naming

Prefix groups and tests:

- `[smoke]` — renders without crash
- `[fn]` — functional behaviour
- `[a11y]` — accessibility resolver or semantics
- `[catalog]` — Storybook nav parity

## References

- [Native a11y audit](../../../docs/native-a11y-audit/README.md)
- [Surface context](../../../docs/surface-context-awareness.md)
- RN QA: `apps/qa-playground/native/tests/`
- Web QA: `apps/qa-playground/e2e/*-accessibility.spec.ts`
