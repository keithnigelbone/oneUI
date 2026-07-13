# Sub-brand accents × theme scope

> Short doc explaining a deliberately asymmetric piece of the brand CSS pipeline. If you're about to "fix" `FoundationStyleProvider.tsx:158` by removing the `themeScope === 'global'` gate, read this first.

## The two data paths

`FoundationStyleProvider` exposes the editing brand to the app through two distinct paths, and they apply sub-brand accent overrides at different points on purpose.

| Path | Where it goes | Sub-brand accents applied? |
| --- | --- | --- |
| `foundationData` (drives `useBrandCSS` → `<style id="oneui-foundation-tokens">`) | The global injected CSS for the whole page. Platform chrome, nav, everything. | **Only in Brand Theme (`themeScope === 'global'`).** |
| `contextData` (exposed via `useFoundationData()`) | Showcase / foundation pages feed it to `useSurfaceTokenVarsNew`, which returns inline-style CSS vars that wrap each preview. | **Always** — regardless of theme scope. |

## Why the asymmetry

**Default Theme** (`themeScope === 'preview'`) injects the **platform brand** (One UI Theme). Its purpose is to render the tool's chrome in a consistent, brand-neutral shell while the designer edits a different brand. Overlaying the editing brand's sub-brand accents onto the platform brand's foundation would:

- Corrupt the platform chrome — nav, sidebars, dialogs would pick up the designer's sub-brand colours.
- Defeat the "clean, consistent tool UI" property Default Theme exists to provide.
- Mix two semantically unrelated foundations (platform brand identity + editing brand's sub-brand overrides).

**Brand Theme** (`themeScope === 'global'`) injects the **editing brand**. Applying its sub-brand accents is correct and desired — the designer wants to see the sub-brand live everywhere, including the chrome.

Showcase pages still need to preview editing brand + sub-brand colours regardless of theme scope. They do this via the **context data** path: wrap preview containers in inline vars from `useSurfaceTokenVarsNew`, and descendants inherit correctly. The platform chrome around the preview stays on the platform brand. The preview itself renders the editing brand.

## If a showcase page isn't picking up sub-brand changes in Default Theme

The fix is at the showcase, not in `FoundationStyleProvider`. Check:

1. Does the page call `useFoundationData()` (not a duplicate `useQuery`)?
2. Does it pass that data to `useSurfaceTokenVarsNew`?
3. Does it spread the returned `surfaceVars` onto a preview wrapper as inline `style`?

Missing any of these three steps will cause the preview's descendants to fall back to the injected platform brand — which in Default Theme does not have the editing brand's sub-brand accents.

## Reference

- Code: `apps/platform/src/components/FoundationStyleProvider.tsx` — the two comment blocks at the `foundationData` and `contextData` memos describe the split in situ.
- Hook: `packages/ui/src/hooks/useSurfaceTokenVarsNew.ts` — resolves foundation data to inline-style CSS vars.
- Context: `useFoundationData()` exported from `FoundationStyleProvider.tsx`.

If you need both "clean platform chrome" AND "automatic sub-brand in showcase pages without any wrapping", the architectural change is a scoped injection — emit editing-brand CSS inside a `[data-brand-scope="editing"]` selector so showcase pages opt in without computing inline vars. That's a larger refactor tracked separately.
