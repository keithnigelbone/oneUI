# One UI Flutter external sample

Consumer-style app that depends on the **packaged** `ui_flutter` tarball (not the monorepo path). Includes a login screen demonstrating Button, Icon, IconButton, Avatar, Divider, Input, InputField, Radio, Checkbox, and Logo.

## 1. Vendor the package tarball

From the monorepo, the release artifact lives at `packages/ui_flutter/ui_flutter-0.1.0-alpha.1.tar.gz`.

```bash
cd apps/flutter_sample
chmod +x tool/setup_vendor.sh
./tool/setup_vendor.sh
```

This extracts into `vendor/ui_flutter/`. In a real external repo you would copy the `.tar.gz` from Azure Artifacts (or your registry) and extract the same way.

## 2. Platform scaffolding (first time only)

`android/` and `ios/` are **gitignored** (same as `qa-playground-flutter`). Scripts create them automatically on first mobile run/build:

```bash
bash scripts/ensure_mobile_platforms.sh
# or: flutter create . --project-name flutter_sample --platforms=android,ios
```

## 3. Run

### Web (Chrome)

```bash
pnpm flutter:sample:web    # http://localhost:5200
```

### Mobile (iOS Simulator / Android emulator / physical device)

Same pattern as QA Playground integration tests — `flutter run` builds and installs a debug native app:

```bash
pnpm flutter:sample:mobile
# or with explicit device:
bash scripts/run_dev_mobile.sh emulator-5554
bash scripts/run_dev_mobile.sh "iPhone 17 Pro"
```

Boot emulators first if needed:

```bash
flutter emulators --launch apple_ios_simulator
flutter emulators --launch Pixel_9_Pro_XL
```

Uses `.env.local` from repo root for Convex (`--dart-define-from-file`). On Android emulators, `localhost` in `CONVEX_URL` is rewritten to `10.0.2.2`.

### Build APK / iOS (without running tests)

Integration tests use the same Gradle / Xcode pipeline implicitly. To produce installable artifacts:

```bash
# Debug APK → build/app/outputs/flutter-apk/app-debug.apk
pnpm flutter:sample:apk

# Release APK
pnpm flutter:sample:apk:release

# Install debug APK on a connected device
bash scripts/build_apk.sh debug install emulator-5554

# iOS simulator debug build → build/ios/iphonesimulator/Runner.app
pnpm flutter:sample:ios

# iOS device release bundle (unsigned; open Xcode to sign)
pnpm flutter:sample:ios:release

# Run on iOS simulator after build
bash scripts/build_ios.sh debug run "iPhone 17 Pro"
```

From repo root (generic):

```bash
pnpm flutter:sample:vendor   # extract tarball + pub get
pnpm flutter:sample            # flutter run (auto device)
```

## Monorepo path dependency (developers only)

To iterate on `packages/ui_flutter` directly, temporarily change `pubspec.yaml`:

```yaml
ui_flutter:
  path: ../../packages/ui_flutter
```

## Jio theme switcher

The sample uses **Jio only** (`OneUiBrandProvider.brand: 'jio'`). The bar above the login screen lists every sub-theme baked from CDN:

| Control | Maps to | CDN source |
|---------|---------|------------|
| **Sub-brand** | `OneUiBrandProvider.theme` | `jio/latest.json` (Base) or `jio/sub-brands/<slug>/latest.json` |
| **Colour scheme** | `OneUiBrandProvider.mode` | `light` / `dark` snapshots |

Currently on CDN: **Base** + **JioMart**. Add more slugs under `subBrands` in `oneui.brands.json`, then re-run `pnpm flutter:sync-cdn-cache`.

### Bake CDN snapshots

```bash
pnpm flutter:sync-cdn-cache
```

`main()` loads the baked manifest:

```dart
await ensureOneUiBrandDefaultsLoaded(loadCdnManifest: true);
```

`oneui.brands.json`:

```json
{
  "cdnUrl": "https://myjiostatic.cdn.jio.com/JDS/ReactNative",
  "brands": {
    "jio": { "subBrands": ["jiomart"] }
  }
}
```

## Brand-only UI policy

This sample avoids Material **colours**, **icons**, and **fonts** for product UI:

| Area | Sample approach |
|------|-----------------|
| **Colours / surfaces** | `OneUiBrandProvider` + `OneUiSurface(mode: 'default')` — page fill from brand tokens |
| **Typography** | `OneUiText`, `OneUiButton.label`, chip/radio labels — bundled **JioType Variable** via brand snapshot |
| **Icons** | `OneUiIcon` / `OneUiIconButton` semantic names → **Jio SVG catalog** (`assets/jio-icons-data.json` in `ui_flutter`, loaded in `main()`) |
| **Spacing** | `getSpacingTokenPx` from `OneUiScope` — not hard-coded px |
| **Shell** | `MaterialApp` is transparent scaffolding only (required by Flutter); no `ThemeData` colour scheme |

### Known gaps (package / platform)

| Gap | Status |
|-----|--------|
| **Material Icons fallback** in `ui_flutter` when `JioIconCatalog` is not loaded (`semantic_icon_material.dart`) | Mitigated: `await JioIconCatalog.instance.ensureLoaded()` in `main()` |
| **`google_fonts`** in `ui_flutter` for non-Jio curated font IDs (Inter, Roboto, …) | Jio default uses bundled **JioType Variable** — no network font fetch |
| **Logo SVG** without CDN prefetch | Sample uses bundled **Jio mark** via [OneUiBrandLogo] (`assets/jio-logo.svg` in `ui_flutter`) |
| **`OneUiLogo` package fallback** (`kOneUiLogoFallbackSvg`) embeds `sans-serif` | Package-level; avoid by supplying `svgContent` or brand logo from cache |
| **`OneUiIndicatorBadgeOverlay.hostSide`** | Pixel size for layout math — overlay API gap (not Material) |
| **Flutter platform chrome** | Status bar, launcher icons — OS-level, outside One UI tokens |
