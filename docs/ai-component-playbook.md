# AI Component Playbook

Use this playbook when an AI agent composes UI with OneUI components for the Jio
web alpha. The goal is predictable, token-safe component output that can move to
other brands later.

## Required Context

Agents should load these sources before generating component code:

- `packages/ui/src/registry/jioAlphaCatalog.ts` for the supported alpha surface.
- `docs/components/generated/*.docs.json` for component props, slots, recipes,
  and examples.
- `packages/shared/src/agent/knowledgeSources.ts` for core invariants.
- `docs/exports/jio.DESIGN.md` for the Jio brand layer.
- `docs/component-adoption-readiness.md` for release-quality fixtures.

If a requested component is not in `JIO_WEB_ALPHA_COMPONENTS`, ask whether to use
an alpha-supported alternative or proceed with an experimental component.

## Import Rules

Use path-based imports:

```ts
import { Button } from '@oneui/ui/components/Button';
import { Surface } from '@oneui/ui/components/Surface';
```

Do not import from the `@oneui/ui` root barrel in generated app code. The root
barrel exists for compatibility, but alpha adoption should exercise published
subpath exports.

## Surface Rules

Use `<Surface mode="...">` for any non-default background that contains
interactive or text content.

```tsx
<Surface mode="bold">
  <Button variant="bold">Primary action</Button>
  <Button variant="ghost" appearance="neutral">Secondary action</Button>
</Surface>
```

Do not generate a raw `div` with `background`, `backgroundColor`, or legacy
surface aliases around components. Children will not receive `[data-surface]`
token remapping and may fail contrast.

## Token Rules

- Use role-explicit tokens such as `--Primary-Bold`, `--Primary-Subtle`,
  `--Primary-TintedA11y`, and `--Primary-Bold-High`.
- Use role typography tokens such as `--Body-M-FontSize` and
  `--Label-S-LineHeight`.
- Do not author legacy `--{Role}-FG-*`, `--{Role}-BG-*`, `--Surface-Bold`,
  `--Text-High`, `--Typography-Size-*`, or `--Typography-Weight-*` tokens.
- Do not hardcode colors, spacing, font sizes, radii, or shadows.

## Jio Defaults

For alpha examples, use Jio through the runtime brand CSS path. The generated UI
should be portable: choose `appearance`, `variant`, `size`, and `Surface` modes
instead of Jio-specific CSS values.

Recommended attention mapping:

- High attention: `Button variant="bold" appearance="primary"`.
- Medium attention: `Button variant="subtle"`.
- Low attention: `Button variant="ghost" appearance="neutral"`.

Use `Surface mode="bold"` rarely: hero sections, branded calls to action, or
editorial carousel slides. Most layouts should remain on `default` surfaces.

## Slots And Accessibility

- Use `start` and `end` for inline content slots.
- Use `leading`, `center`, and `trailing` only for composite chrome such as
  headers.
- Give icon-only controls an explicit `aria-label`.
- Tooltip content does not replace an accessible name.
- Dialog examples require a title.

## Validation

Generated component output should pass:

```bash
pnpm check:ai-vocab
pnpm check:jio-alpha-catalog
pnpm check:metadata
pnpm test:a11y
```

For alpha release candidates, also run the full QA gate in
`docs/releases/jio-web-alpha.md`.
