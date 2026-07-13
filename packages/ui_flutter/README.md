# One UI — `ui_flutter`

Flutter component library for the One UI design system. Parity with `@oneui/ui-native` and web `buildNativeTheme`.

## Consumer quick start

```dart
import 'package:ui_flutter/ui_flutter.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await JioIconCatalog.instance.ensureLoaded();
  await ensureOneUiBrandDefaultsLoaded();
  runApp(
    MaterialApp(
      home: OneUiBrandProvider(
        mode: 'light',
        child: OneUiButton(
          variant: OneUiButtonVariant.bold,
          onPressed: () {},
          child: const Text('Continue'),
        ),
      ),
    ),
  );
}
```

**No Convex required** for production — bundled Jio brand ships in `assets/brand_data/`.

Full guide: [GETTING_STARTED.md](GETTING_STARTED.md)

## Install

```yaml
dependencies:
  ui_flutter:
    path: ../packages/ui_flutter
```

## API surface

| Import | Use |
|--------|-----|
| `package:ui_flutter/ui_flutter.dart` | Components, `OneUiBrandProvider`, offline/CDN brand |
| `package:ui_flutter/oneui_convex.dart` | One UI Studio — `OneUiBrandScope` + Convex HTTP |
| `package:ui_flutter/storybook.dart` | Internal foundations gallery only |

## Multi-brand (CDN)

**Dart prefetch** — same URLs as RN, no npm:

```bash
dart run ui_flutter:oneui_sync_brands    # prefetch + bake
dart run ui_flutter:oneui_prefetch       # download only
```

```dart
await ensureOneUiBrandDefaultsLoaded(loadCdnManifest: true);
OneUiBrandProvider(brand: 'tira', mode: 'light', child: MyApp());
```

See [GETTING_STARTED.md](GETTING_STARTED.md) for **baked assets (recommended)** vs runtime raw-JSON (not recommended).

## Regenerate default brand

```bash
pnpm --filter @oneui/ui-native run generate:default-brand
pnpm flutter:generate-default-brand
```

## Layout

| Area | Purpose |
|------|---------|
| `lib/widgets/` | Public components |
| `lib/brand/` | `OneUiBrandProvider`, CDN cache, default Jio snapshot |
| `lib/theme/` | `OneUiScope`, surface context |
| `lib/engine/` | Surface resolution + token parsers |
| `lib/convex/` | Optional Convex HTTP (Studio) |
| `assets/brand_data/` | Bundled + CDN-generated `NativeThemeSnapshot` JSON |

## Sample app

`apps/flutter_sample` — run with `pnpm flutter:sample`.

## Fonts & icons

- **JioType Variable** — `fonts/` (bundled)
- **Jio icons** — `assets/jio-icons-data.json` + `JioIconCatalog`
