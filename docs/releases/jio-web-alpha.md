# Jio Web Alpha Release Runbook

This runbook defines the first publishable OneUI alpha: web-only components,
validated with the Jio brand. React Native parity, platform-app adoption, and
multi-brand authoring workflows are explicitly outside this alpha gate.

## Scope

- Packages: `@oneui/ui`, `@oneui/tokens`, and `@oneui/shared`.
- Platform: React web only.
- Brand: Jio only for release validation.
- Component source of truth: `packages/ui/src/registry/jioAlphaCatalog.ts`.
- Brand source of truth: `docs/exports/jio.DESIGN.md` plus the Convex Jio brand
  record used by Storybook.

The package remains multi-brand-safe: component code must use role-explicit
tokens and `Surface` context rather than Jio-specific values. The alpha release
only promises that the Jio brand path has been validated.

## Component Surface

Alpha-supported components are listed in
`packages/ui/src/registry/jioAlphaCatalog.ts`. Import them through path-based
package exports:

```ts
import { Button } from '@oneui/ui/components/Button';
import { Surface } from '@oneui/ui/components/Surface';
import { useBrandCSS } from '@oneui/ui/hooks/useBrandCSS';
```

Components listed as experimental or internal in the catalog are not part of
the supported alpha contract, even if they are exported elsewhere for current
monorepo usage.

## Package Consumption

Load token CSS in the documented cascade order before rendering components:

```ts
import '@oneui/tokens/css/layers';
import '@oneui/tokens/css/dimensions/scale';
import '@oneui/tokens/css/dimensions/grid';
import '@oneui/tokens/css/typography';
import '@oneui/tokens/css';
import '@oneui/tokens/css/semantic';
import '@oneui/tokens/css/light';
import '@oneui/tokens/css/dark';
import '@oneui/tokens/css/density/compact';
import '@oneui/tokens/css/density/open';
import '@oneui/tokens/css/materials';
import '@oneui/ui/styles';
```

For the Jio alpha, prefer runtime brand CSS injection from the brand engine.
Do not import `@oneui/tokens/css/brands` together with injected brand CSS; those
static sub-brand sheets are a separate compatibility path and can double-source
brand overrides.

## Jio Storybook Validation

Storybook must run with a Convex deployment that contains the canonical Jio
brand record:

```bash
STORYBOOK_CONVEX_URL=<convex-url> pnpm build:storybook
```

`apps/storybook/.storybook/main.ts` requires a Convex URL, and
`apps/storybook/.storybook/preview.ts` only applies brand CSS when both Convex
and a selected brand are available. Do not use Storybook background presets to
validate surface context; use stories that wrap components in `<Surface>`.

Validate these states before cutting the alpha:

- Jio selected in Storybook, light theme, default density.
- Jio selected in Storybook, dark theme, default density.
- `Surface` examples for `default`, `subtle`, and `bold`.
- Focus halo around buttons, icon buttons, tabs, chips, and form controls.
- Jio icon loader and icon fallback behaviour.
- Carousel controls and slide content on image surfaces.

## Alpha QA Gate

Run the same release bar as the design-system CI workflow:

```bash
pnpm check:literals
pnpm validate:tokens
pnpm check:ai-vocab
pnpm check:metadata
pnpm check:support-matrix
pnpm check:jio-alpha-catalog
pnpm check:machine-docs-fresh
pnpm check:layers
pnpm check:oneui-barrel
pnpm typecheck
pnpm lint
pnpm test:a11y
pnpm --filter @oneui/shared test -- --run
pnpm --filter @oneui/ui test -- --run
pnpm bench:pipeline --iterations=300
pnpm check:perf --tolerance=25
pnpm build:storybook
```

`pnpm check:parity` is a known web-alpha waiver because React Native is not in
scope for this release. Visual regression is manual for alpha unless a Chromatic
or equivalent workflow is added before release.

## Release Decision

The Jio web alpha can be cut when:

- `pnpm --filter @oneui/ui build` produces path-importable `dist` output.
- The support matrix passes for every story-bearing component.
- The Jio alpha catalog passes and includes generated docs for every alpha
  component.
- Storybook builds with Jio brand data and the manual visual checklist is clean.
- QA command output is captured in the release notes, including explicit waivers.
