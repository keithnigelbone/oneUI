# Component QA canvases (`src/components/`)

Every catalog component has **its own folder** named by registry **`meta.slug`** (kebab-case):

```text
components/
  registerComponentShowcases.ts    # Imports every *QaShowcase + BY_SLUG map
  shared/
    ScenarioGridQaShowcase.tsx    # Default mount (Default band + grouped scenarios)
  catalog/
    CatalogCardThumb.tsx
  button/
    ButtonQaShowcase.tsx        # Custom showcase (hand-authored)
  checkbox/
    CheckboxQaShowcase.tsx      # Thin wrapper → ScenarioGridQaShowcase
  …                             # One folder per slug from ALL_COMPONENT_METAS
```

- **Button** uses a bespoke `ButtonQaShowcase` (library showcase imports).
- **All other slugs** use a generated `<Name>QaShowcase.tsx` that renders `<ScenarioGridQaShowcase slug="…" />` — same section shell as Button.

## Regenerate folders + registry

When `ALL_COMPONENT_METAS` gains a new component, run from repo root:

```bash
pnpm --filter @oneui/qa-playground generate:component-showcases
```

That rewrites `registerComponentShowcases.ts` and adds or updates `components/<slug>/<Name>QaShowcase.tsx` files (Button is skipped — edit `button/ButtonQaShowcase.tsx` by hand).

## Not here

- **`packages/ui/**/\*.showcase.tsx`** — Storybook/library showcases, not this app.
