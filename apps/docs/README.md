# OneUI Docs

FumaDocs Core/MDX documentation app for the OneUI design system.

## Development

```bash
pnpm docs
```

The docs app is a standalone Next app under `apps/docs`. It uses FumaDocs for content loading and a custom OneUI shell for rendering, so it does not use FumaDocs UI or Tailwind.

## Environment

Set `NEXT_PUBLIC_CONVEX_URL` to enable live brand switching:

```bash
NEXT_PUBLIC_CONVEX_URL=<convex-url> pnpm docs
```

If the variable is missing, the site still renders with base tokens and shows a setup message in the brand controls.

## Component Pages

Component pages are generated from `packages/ui/src/registry/jioAlphaCatalog.ts` and `docs/components/generated/*.docs.json`:

```bash
pnpm docs:components
```

Generated pages are committed because they define the public alpha documentation surface.
