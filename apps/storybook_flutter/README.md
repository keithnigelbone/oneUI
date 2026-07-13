# Storybook (Flutter)

One UI **Flutter** gallery — same foundation areas as web `apps/storybook` (Typography, Dimensions, Density, Surfaces, Appearance, Strokes), plus **Components → Actions → Button** (`OneUiButton`).

## Requirements

- [Flutter SDK](https://docs.flutter.dev/get-started/install) (Dart 3.5+)
- Repo-root **`.env.local`** with Convex URL (see root `.env.example`). Recognised keys (first match wins): `STORYBOOK_CONVEX_URL`, `CONVEX_URL`, `VITE_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_URL` — same spirit as web Storybook.
- Enough **free disk space** on your system volume so Flutter can write under `$TMPDIR` (often `/var/folders/...`). If the drive is essentially full (~hundreds of MB free), builds fail with **`No space left on device (errno 28)`** when generating `web_plugin_registrant.dart` and similar.

## JioType Variable fonts

Bundled **`JioTypeVar.ttf`** / **`JioTypeVar-Italic.ttf`** live in **`packages/ui_flutter/fonts/`** and are registered in **`packages/ui_flutter/pubspec.yaml`** under the family **`JioType Variable`** (aligned with `@oneui/shared` `fonts.ts` and web `/fonts/JioTypeVar.ttf`). This app lists **`ui_flutter` as a path dependency**, so those fonts ship with Storybook automatically — **`apps/storybook_flutter/pubspec.yaml` does not list them again** (Flutter does not allow font asset paths outside a package directory, and duplicating the same family could conflict).

Commit the **`.ttf` files** with the repo; if they disappear locally, restore from the official JioType Variable delivery **`ot_var/`** (same files as web).

**Typography wiring:** Storybook **`ThemeData.fontFamily`** tracks `nativeTheme.typography` (`fontFamilies.primary`). When Convex omits that field, **`fontFamilyPrimaryOrBundled`** falls back to **`JioType Variable`** so chrome + components do not silently use the OS sans (`NativeTypographySnapshot`, **`OneUiButton`**). Brand-specific body fonts (e.g. Tira) still win when the snapshot includes **`fontFamilies.primary`**.

**Button corner radius (Tira capsule):** The capsule is a **default, not an override**. **`maybeApplyRetailTiraCapsuleButtons`** in **`@oneui/shared`** forces **`--Button-borderRadius`** / **`--IconButton-borderRadius`** to **`var(--Shape-Pill)`** for Tira slugs **only when no explicit Actions shape decision exists** — a persisted `shapeLanguage` (theme), recipe, or manual `borderRadius` decision now WINS and is left untouched. Both **`buildAllComponentCSS`** (web) and **`nativeTheme:getNativeThemeSnapshot`** (Flutter) collect the set of CSS components with an explicit radius decision and pass it as `skipCssComponents`, so Storybook (web + Flutter) and the platform stay in sync. Flutter Storybook also runs **`normalizeStorybookTiraRetailCapsuleButtons`** when pointed at an older Convex deploy. For other brands, compare DevTools **`--_btn-radius`** vs Flutter **Convex coverage** note.

## How Convex URL is resolved (standard Flutter practice)

1. **`String.fromEnvironment(...)`** — values injected at compile time via **`--dart-define`** or **`--dart-define-from-file`**. This is the [recommended Flutter approach](https://docs.flutter.dev/deployment/flavors#using-dart-defines) for environment-specific config in builds.
2. **Desktop / mobile (Dart VM)** — if no defines are set, the app tries to read the same **`.env.local`** files as `apps/storybook/.storybook/main.ts` (repo root, `apps/storybook`, etc.). That is a **dev convenience** only; browsers cannot read arbitrary paths for web.

## Run (from monorepo root)

Using pnpm (paths and `dart-define-from-file` are wrapped for you):

```bash
pnpm install                    # if you have not already
pnpm storybook:flutter          # Desktop/mobile VM — can read repo `.env.local` at runtime
pnpm storybook:flutter:web      # Chrome — **required** for brands: injects `../../.env.local` (web cannot read disk)
```

**If the brand dropdown only shows “No brand” in Chrome:** you almost certainly launched without Convex defines. Use `pnpm storybook:flutter:web`, or `flutter run -d chrome --dart-define-from-file=../../.env.local`. The toolbar now shows an explanatory hint when the URL is missing.

When **No brand** is selected, Flutter Storybook still provides **`designSystem`** (manifest-only `--Button-*` from `buildAllComponentCustomPropertiesFlat(empty)` in `storybook_unbranded_button_map.dart`) and baseline **label typography** resolved from dimension tables — matching web Storybook behaviour where bundled CSS resolves the Button without `BrandStyleInjector` (`apps/storybook/.storybook/preview.ts`).

When a **brand is selected**, the canvas normally uses Convex `nativeTheme:getNativeThemeSnapshot.designSystem` verbatim. Some retail brands persist **Actions → outline** emphasis: **High** maps to `transparent` `--Button-backgroundColor-bold` and visible chrome from CSS `::after` only. For **Flutter docs parity** with brands on **solid** emphasis (filled High), `lib/storybook_design_system_normalize.dart` strips outline-only bold tokens when the persisted bold fill is **transparent**, so `OneUiButton` resolves **role/palette** fills like Jio/Swadesh — **Flutter-only**; Convex and web Storybook are unchanged.

## OneUI components only (no Material UI widgets)

Flutter Storybook and sample apps must use **`@oneui/ui_flutter`** primitives for product UI — not Material equivalents (`CircularProgressIndicator`, `ElevatedButton`, etc.). **Button** / **IconButton** loading states use **`OneUiCircularProgressIndicator`** via **`OneUiLoadingSpinner`** (same as web `Button.tsx` / `IconButton.tsx`). Storybook chrome may still use **`MaterialApp`**, **`Scaffold`**, and **`IconButton`** for gallery shell controls only.

## Accessibility panel (parity with web Storybook)

Toolbar **Accessibility** (♿) opens a bottom sheet with the same **Violations / Passes / Inconclusive / Notes** breakdown as React **`@storybook/addon-a11y`**.

- **Flutter web:** runs **axe-core** (WCAG 2.0/2.1 A + AA tags), with **`aria-command-name`** disabled to match `packages/ui/src/test-utils/a11y.ts` (Base UI focus-guard quirk). Requires loading the script from **jsDelivr** (dev network).
- **Mobile & desktop:** axe does not apply to the embedding; the sheet still runs **semantics-tree** checks (`button-name`, `image-alt`) and explains how to pair with **Semantics Debugger**.

Toolbar **article** icon toggles **`MaterialApp.showSemanticsDebugger`** (yellow overlay) on **all** platforms — use it like Storybook’s DOM inspector for `flt-semantics` / assistive tech labels.

After changing `@oneui/ui` Button manifest / registry defaults, regenerate (Node 18+):

```bash
pnpm export:flutter-storybook-unbranded-button-map
```

Re-run whenever `@oneui/ui` manifest defaults move so **`storybook_unbranded_button_map.dart`** stays aligned with **`buildAllComponentCustomPropertiesFlat(empty)`**.

## Run (from this directory)

```bash
cd apps/storybook_flutter
flutter pub get

# VM targets — can pick up repo .env.local at runtime when cwd is this folder
flutter run -d macos            # or ios / android / windows / linux

# Web — must pass defines (browsers cannot read .env.local from disk)
flutter run -d chrome --dart-define-from-file=../../.env.local
```

Optional explicit defines (any platform):

```bash
flutter run --dart-define=NEXT_PUBLIC_CONVEX_URL=https://YOUR_DEPLOYMENT.convex.cloud
```

## Brands dropdown is empty but Convex URL is correct

`brands:list` returns **HTTP success** with **`value: []`** when this deployment’s **`brands` table has no rows** (typical for a new **development** Convex project). The Flutter app **is** talking to Convex; there is simply nothing to list.

**Fix:** seed default brands once (only runs when the table is empty):

1. **Convex Dashboard** → your deployment → **Functions** → run public mutation **`brands:seedDefaultBrands`** (no args), **or**
2. **CLI** from `packages/convex` (with Node 18+):  
   `npx convex run brands:seedDefaultBrands`

Then reload Storybook. For a full studio dataset you may sync from another deployment instead of seeding defaults.

## UI behaviour

The app title is **Storybook**. The **left rail** lists foundations (including **Dimensions** sub-items). The **toolbar** mirrors web: brand (Convex), platform **Web** (label-only today — effective V2 platform / Convex `mobile|tablet|desktop` comes from the **breakpoint** width and responsive story column), density (**Compact / Default / Open**), and theme.

## Mobile & tablet (iOS / Android emulator or device)

The same codebase runs as Flutter **web**, **desktop VM**, **iOS**, and **Android**. Foundations and **`OneUiButton`** use **`OneUiScope` + `OneUiSurfaceBootstrap`** identical on every target — nothing in `packages/ui_flutter` is web-gated beyond normal Flutter embedding differences.

What to expect:

- **Responsive** mode maps the story **canvas width** → breakpoint ids such as **`S`** / **`M`** the same way the web iframe width drives `[data-Breakpoint]`, then Convex `nativeTheme` gets **`mobile` / `tablet` / `desktop`** via **`nativeThemePlatformArgFromV2Id`**. On a phone emulator the column is narrow → **`mobile`** tokens, matching RN/web small viewports.
- **Convex**: pass **`CONVEX_URL`** (or equivalents) via **`--dart-define-from-file`** for iOS/Android when you launch from Xcode or `flutter run` without reading repo `.env.local` (VM auto-read varies by cwd). **`pnpm storybook:flutter`** remains the simplest dev entry for desktop; for simulators prefer  
  `flutter run -d ios --dart-define-from-file=../../.env.local`  
  after `cd apps/storybook_flutter`.
- **Android**: **INTERNET** is declared in **`android/app/src/main/AndroidManifest.xml`** so **release/profile** builds can call Convex — not only debug.
- **Accessibility**:Semantics-based checks run on **all** platforms; **axe-core** loads only on **Flutter web** (needs `dart:html` + CDN). Toggle **Semantics Debugger** (toolbar article icon) on iOS/Android the same as web.
- **Typography**: **JioType Variable** is bundled. Other slot fonts use **`google_fonts`** at runtime — the emulator/host needs network (or cached fonts) for those families to match web.

## Package

- Implementation: `packages/ui_flutter`
- Brand engine on device: see `packages/ui_flutter/lib/engine/theme_strategy.md` (JSON from TypeScript `buildNativeTheme` — recommended).
