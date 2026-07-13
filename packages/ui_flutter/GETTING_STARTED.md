# `ui_flutter` — Getting started

Flutter peer of `@oneui/ui-native`. Components read **pre-resolved brand snapshots** — same JSON as Convex `nativeTheme:getNativeThemeSnapshot` and RN `buildNativeTheme`.

**Production apps do not need Convex.** Convex is for One UI Studio live preview only (`package:ui_flutter/oneui_convex.dart`).

---

## Install

### Monorepo path dependency

```yaml
dependencies:
  ui_flutter:
    path: ../packages/ui_flutter
```

### Published package (when released)

Same Azure Artifacts / internal feed pattern as `@oneui/ui-native` — pin `ui_flutter: 0.1.0-alpha.1`.

```bash
flutter pub get
```

Load Jio icons once at startup:

```dart
await JioIconCatalog.instance.ensureLoaded();
```

---

## Minimal usage (bundled Jio default)

The package ships **`default_jio_light_mobile_default.json`** and **`default_jio_dark_mobile_default.json`** (regenerated from `defaultJioBrandData.json` — same source as RN).

```dart
import 'package:flutter/material.dart';
import 'package:ui_flutter/ui_flutter.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await JioIconCatalog.instance.ensureLoaded();
  await ensureOneUiBrandDefaultsLoaded();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: OneUiBrandProvider(
        mode: 'light',
        platformId: 'S',
        density: 'default',
        child: OneUiButton(
          variant: OneUiButtonVariant.bold,
          onPressed: () {},
          label: 'Continue',
        ),
      ),
    );
  }
}
```

---

## `OneUiBrandProvider` props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `brand` | `String?` / `OneUiBrandData?` / `NativeThemeSnapshot?` | bundled Jio | Brand slug, offline JSON, or explicit snapshot |
| `theme` | `String?` | `null` | Sub-brand slug (`jiomart`) when `brand` is a parent slug |
| `mode` | `light` / `dark` / `dim` | `light` | Colour scheme (`dim` → dark) |
| `density` | `compact` / `default` / `open` | `default` | Spacing density |
| `platformId` | `String` | `S` | Breakpoint id for dimensions |
| `nativeThemePlatform` | `mobile` / `tablet` / `desktop` | `mobile` | CDN snapshot key |
| `snapshot` | `NativeThemeSnapshot?` | — | Bypass slug resolution |
| `loading` | `Widget?` | empty | Shown if default assets not loaded yet |

---

## Multi-brand with CDN (pure Dart prefetch)

Same CDN URLs and `oneui.brands.json` as React Native. **Prefetch is 100% Dart** — no npm.

### 1. `oneui.brands.json` in your app root

```json
{
  "cdnUrl": "https://myjiostatic.cdn.jio.com/JDS/ReactNative",
  "brands": {
    "jio": { "subBrands": ["jiomart"] },
    "tira": "latest"
  }
}
```

### 2. Prefetch + bake

```bash
dart run ui_flutter:oneui_sync_brands
```

- **Prefetch (Dart)** — downloads `brand-data/*/latest.json` → `.oneui_cached/`
- **Bake (CI / monorepo)** — TS `buildNativeTheme` → `assets/brand_data/cdn/*.json`

Prefetch only:

```bash
dart run ui_flutter:oneui_prefetch
```

### 3. Load in `main()`

```dart
await ensureOneUiBrandDefaultsLoaded(loadCdnManifest: true);
```

### 4. List available brands / themes (picker UI)

After the manifest loads, use `listOneUiCdnBrandSlugs()`, `listOneUiCdnBrandVariants('jio')`, and `listOneUiCdnBrandModes()` from `oneui_brands_catalog.dart` — see `apps/flutter_sample/lib/theme_switcher_bar.dart`.

### 5. Use string slugs

```dart
OneUiBrandProvider(
  brand: 'jio',
  theme: 'jiomart',
  mode: 'light',
  child: MyApp(),
)
```

If a slug is missing, the provider falls back to the **bundled Jio default** (same as RN).

---

## JioType Variable (bundled Jio typography)

The package ships **`JioTypeVar.ttf`** registered as **`JioType Variable`** in `pubspec.yaml`. When the **Jio** brand loads (bundled default or CDN `jio` slug), typography resolves to this family automatically:

1. **Snapshot primary** — `fontFamilies.primary` values like `JioType Var` are normalized to `JioType Variable`.
2. **Static RN cuts** — per-size `fontFamily` entries such as `JioType-Medium` (with `weightViaFontFamily: true`) map to `JioType Variable` + the correct `fontWeight` axis.
3. **Components** — `OneUiText`, buttons, inputs, etc. call `resolveOneUiTextTypographyStyle`, which applies `applyJioVariableFontFallback` before paint.

No extra setup is required in consumer apps — the font travels with the `ui_flutter` dependency. Non-Jio brands continue to use `google_fonts` when the snapshot references a Google Font id.

```dart
// main.dart — bundled Jio default already uses JioType Variable
await ensureOneUiBrandDefaultsLoaded();

OneUiBrandProvider(
  mode: 'light',
  child: const OneUiText('Hello', role: 'body', size: 'M'),
)
```

To verify in tests: `fontFamilyPrimaryOrBundled` on the default snapshot equals `kJioTypeVariableFontFamily` (`'JioType Variable'`).

---

## Surface system

Wrap tinted regions in `OneUiSurface` — never set raw `backgroundColor` on a `Container` around One UI components.

```dart
OneUiSurface(
  mode: 'bold',
  child: OneUiButton(
    variant: OneUiButtonVariant.subtle,
    onPressed: () {},
    child: const Text('Readable on bold'),
  ),
)
```

Modes: `default` · `ghost` · `minimal` · `subtle` · `moderate` · `bold` · `elevated`.

---

## One UI Studio / Convex (optional)

```dart
import 'package:ui_flutter/oneui_convex.dart';

OneUiBrandScope(
  convexUrl: convexUrl,
  brandId: brandId,
  theme: 'light',
  density: 'default',
  platformId: 'S',
  child: MyApp(),
)
```

---

## Regenerate bundled default brand

When Jio foundations change:

```bash
pnpm --filter @oneui/ui-native run generate:default-brand
pnpm flutter:generate-default-brand
```

---

## Sample app

```bash
pnpm flutter:sample
```

See `apps/flutter_sample/`.

---

## Package layout

| Path | Purpose |
| --- | --- |
| `lib/ui_flutter.dart` | **Consumer API** — components + `OneUiBrandProvider` |
| `lib/oneui_convex.dart` | Studio / live Convex loading |
| `lib/storybook.dart` | Internal foundations gallery |
| `bin/oneui_prefetch.dart` | Dart CDN download CLI |
| `bin/oneui_sync_brands.dart` | Prefetch + bake pipeline |
| `lib/cdn/` | URL builders + prefetch implementation |
| `assets/brand_data/` | Bundled + CDN-generated snapshots |

---

## Baked assets vs raw JSON on device (recommended model)

| Approach | What happens | Performance | Standard? | OneUI recommendation |
| --- | --- | --- | --- | --- |
| **C — Baked snapshots** (default) | CDN recipe JSON → bake once in CI → ship `NativeThemeSnapshot` in app assets | **Best** — parse JSON once, O(1) token reads | Yes (token codegen pattern) | **Use this** |
| **C+ — Baked + OTA snapshots** | Same as C, but app downloads **pre-baked** snapshot JSON at runtime | Excellent — no engine on device | Common for remote config | Future CDN enhancement |
| **B — Raw JSON on device** | App downloads `foundation` JSON and runs full color engine on phone | **Worst** — CPU spike, jank risk, large Dart port | Rare | **Avoid** unless you port `buildNativeTheme` to Dart |

**What runs in Dart today**

- **At runtime (always):** surface cascade, component colors, typography from snapshot — this *is* your theme logic on device.
- **At build time (today):** turning CDN `foundation` JSON into a snapshot uses the shared TS engine once — not on the user's phone.

Dart prefetch replaces only the **download** step. It does not change runtime performance.

---

## Versioning

Follows semver aligned with `@oneui/ui-native`. Pin exact versions during alpha.
