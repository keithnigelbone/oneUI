# Jio Web Alpha QA Evidence — 2026-04-26

This record captures the local release-readiness pass for the web-only Jio alpha.
It should be refreshed before publishing an alpha package.

## Passed

- `pnpm --filter @oneui/ui build`
- `pnpm check:jio-alpha-catalog`
- `pnpm check:support-matrix`
- `pnpm check:machine-docs-fresh`
- `pnpm check:metadata`
- `pnpm check:literals`
- `pnpm validate:tokens`
- `pnpm check:ai-vocab`
- `pnpm check:layers`
- `pnpm check:oneui-barrel`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test:a11y`
- `pnpm --filter @oneui/shared test -- --run`
- `pnpm --filter @oneui/ui test -- --run`
- `pnpm bench:pipeline --iterations=300`
- `pnpm check:perf --tolerance=25`
- `pnpm build:storybook`
- `pnpm check:legacy-tokens`
- `pnpm lint:designmd`

## Warnings

- `pnpm check:machine-docs-fresh` reports existing generator warnings for
  `Carousel`, `Container`, `Grid`, and `Surface` shared prop interface discovery,
  but exits successfully and confirms no generated-doc drift.
- `pnpm test:a11y` and `pnpm --filter @oneui/ui test -- --run` emit jsdom/Base UI
  warnings around canvas, computed style, and act wrappers. The suites pass.
- `pnpm lint:designmd` exits successfully with existing fixture warnings for
  non-Jio fixture contrast and unused token references.

## Waived For Web Alpha

- `pnpm check:parity` fails because React Native implementations are not in the
  Jio web alpha scope. The observed run found 67 web components and 2 native
  component folders, so this remains a tracked post-alpha parity workstream.

## Blocked By Environment

- `pnpm designmd:export:check` did not run in this shell because
  `NEXT_PUBLIC_CONVEX_URL` / `CONVEX_URL` was not set. Run it in CI or a local
  shell with the canonical Convex deployment before publishing.

## Manual Visual QA Required

Before publishing, validate the Storybook build with the canonical Jio brand:

- Jio selected by default in the Storybook toolbar.
- Light and dark themes.
- Default, subtle, and bold `Surface` examples.
- Focus halo on alpha interactive components.
- Carousel slide content and controls over image surfaces.
- Jio icon loader and fallback behavior.
