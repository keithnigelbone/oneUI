# Changesets

This directory is managed by [Changesets](https://github.com/changesets/changesets).

## Adding a changeset

```bash
pnpm changeset
```

Follow the prompts to describe your change and select which packages are affected.

## Releasing

Version packages:
```bash
pnpm changeset version
```

Publish to npm:
```bash
pnpm changeset publish
```
