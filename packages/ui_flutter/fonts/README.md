# Bundled fonts (Flutter)

This folder mirrors the web app's `/public/fonts/` story: curated brand assets ship with the package so Storybook and components resolve the same **`fontFamily`** strings as Convex / `packages/shared` (`fonts.ts`).

## JioType Variable (`jiotype-var`)

| File | Role |
|------|------|
| `JioTypeVar.ttf` | Upright variable font (matches web `JioTypeVar.ttf`) |
| `JioTypeVar-Italic.ttf` | Italic face for `FontStyle.italic` |

**Pubspec `family`:** `JioType Variable` — must stay aligned with `getFontById('jiotype-var')?.name` in `@oneui/shared` and with any `fontFamily` emitted in native typography JSON.

**Source:** official JioType Variable delivery (`ot_var/`). Replace these files when the brand package is updated; run `flutter pub get` in consuming apps after changes.
