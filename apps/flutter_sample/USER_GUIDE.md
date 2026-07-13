# One UI Flutter — User Guide (Beginner Friendly)

This guide explains how to use the **One UI Flutter library** (`ui_flutter`) from the perspective of an app developer — using the **external sample app** (`apps/flutter_sample`) as the reference.

You do **not** need to know how the design system is built internally. You only need to know how to install the package, wrap your app, pick components, use icons, and switch brands.

---

## What is this library?

**`ui_flutter`** is a Flutter package that gives you ready-made UI components styled with the **One UI / Jio design system**.

Think of it like this:

- **Without One UI:** You style buttons, inputs, and icons yourself (colors, fonts, spacing).
- **With One UI:** You use pre-built widgets (`OneUiButton`, `OneUiInput`, `OneUiIcon`, …) and they automatically follow brand colors, typography, spacing, and accessibility rules.

The sample app (`flutter_sample`) is a small login screen that shows how a real consumer app would use the library.

---

## What does the library offer?

### 1. Ready-made components

You get Flutter widgets that match the web and React Native One UI components.

| Component | What it is | Example use |
|-----------|------------|-------------|
| `OneUiButton` | Primary action button | Sign in, Submit |
| `OneUiIconButton` | Icon-only button | Settings, Close |
| `OneUiIcon` | Standalone icon | Info icon, search icon in input |
| `OneUiIconContained` | Icon inside a tinted circle/square | Profile actions |
| `OneUiText` | Typography (headline, body, label) | Page titles, descriptions |
| `OneUiInput` / `OneUiInputField` | Text fields | Email, password |
| `OneUiCheckbox` / `OneUiCheckboxField` | Checkbox | “Remember me” |
| `OneUiRadio` / `OneUiRadioField` | Radio buttons | Sign-in method picker |
| `OneUiChip` / `OneUiChipGroup` | Selectable chips | Account type, theme picker |
| `OneUiAvatar` | User avatar | Profile picture / initials |
| `OneUiBadge` / `OneUiCounterBadge` / `OneUiIndicatorBadge` | Status badges | “Verified”, notification dot |
| `OneUiDivider` | Section divider | “or continue with email” |
| `OneUiSurface` | Colored background container | Cards, hero sections |
| `OneUiBrandLogo` / `OneUiLogo` | Brand logo | App header |
| `OneUiBottomNavigation` | Bottom nav bar | App shell |
| `OneUiCircularProgressIndicator` / `OneUiLoadingSpinner` | Loading states | Submit in progress |
| `OneUiImage` | Image with design tokens | Product photos |

The sample login screen uses: **Button, Icon, IconButton, Avatar, Badge, Chip, Divider, Input, InputField, Radio, Checkbox, Logo, Text, Surface**.

More components exist in the package; the sample shows the most common form/login patterns.

### 2. Brand theming (colors, fonts, spacing)

Every component reads **design tokens** from the active brand:

- **Colors** — primary, secondary, positive, negative, etc.
- **Typography** — JioType Variable font, headline/body/label sizes
- **Spacing** — consistent gaps (not random pixel values)
- **Surfaces** — background levels (subtle, bold, elevated, …)

You do not hard-code `#0066FF` or `fontSize: 16`. The brand snapshot supplies those values.

### 3. Icons (Jio icon catalog)

Hundreds of **semantic icon names** (`heart`, `search`, `settings`, …) map to SVG icons shipped with the package.

### 4. Multi-brand support

You can ship **Jio** by default and optionally add **sub-brands** (e.g. JioMart) or other brands (e.g. Tira) from CDN snapshots.

### 5. Accessibility built in

Components support screen readers via `semanticsLabel`, decorative vs meaningful icons, disabled states, etc.

---

## What can you build with it?

- Login / signup flows (shown in the sample)
- Settings screens with forms and toggles
- Dashboards with badges, avatars, chips
- Apps that must look like **Jio / JioMart / other Jio brands**
- Apps that need **light and dark mode** with one prop change
- Apps that share UI with **React Native** or **web** One UI (same tokens, same components)

---

## How to get started (3 steps)

### Step 1 — Add the package

In your `pubspec.yaml`:

```yaml
dependencies:
  ui_flutter:
    path: ../packages/ui_flutter   # monorepo dev
    # OR for external apps:
    # path: vendor/ui_flutter      # extracted from tarball
```

Run:

```bash
flutter pub get
```

### Step 2 — Load icons and brand data in `main()`

```dart
import 'package:flutter/material.dart';
import 'package:ui_flutter/ui_flutter.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load Jio SVG icon catalog (required for OneUiIcon)
  await JioIconCatalog.instance.ensureLoaded();

  // Load bundled Jio brand (and optional CDN brands)
  await ensureOneUiBrandDefaultsLoaded(loadCdnManifest: true);

  runApp(const MyApp());
}
```

**Why both calls?**

- `JioIconCatalog` → loads `jio-icons-data.json` so icons render correctly.
- `ensureOneUiBrandDefaultsLoaded` → loads color/font/spacing snapshots so components look on-brand.

### Step 3 — Wrap your app with `OneUiBrandProvider`

```dart
class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: OneUiBrandProvider(
        brand: 'jio',           // brand slug (optional — defaults to bundled Jio)
        theme: null,            // sub-brand: null = base Jio, 'jiomart' = JioMart
        mode: 'light',          // 'light' | 'dark' | 'dim'
        platformId: 'S-360',    // phone layout breakpoints
        density: 'default',     // 'compact' | 'default' | 'open'
        child: OneUiSurface(
          mode: 'default',      // page background
          child: Scaffold(
            backgroundColor: Colors.transparent,
            body: YourScreen(),
          ),
        ),
      ),
    );
  }
}
```

**Important:** `MaterialApp` is still required by Flutter, but the sample keeps it **transparent** — all real colors come from One UI, not Material `ThemeData`.

---

## How to use components

Import once:

```dart
import 'package:ui_flutter/ui_flutter.dart';
```

### Button

```dart
OneUiButton(
  variant: OneUiButtonVariant.bold,   // high attention (filled)
  label: 'Sign in',
  fullWidth: true,
  onPressed: () { /* your logic */ },
)

OneUiButton(
  variant: OneUiButtonVariant.ghost,  // low attention (text only)
  label: 'Create an account',
  onPressed: () {},
)
```

**Variants:** `bold` (filled), `subtle` (tinted), `ghost` (transparent).

### Text

```dart
OneUiText(
  text: 'Welcome back',
  variant: OneUiTextVariant.headline,
  size: 'm',
)

OneUiText(
  text: 'Sign in to continue',
  variant: OneUiTextVariant.body,
  size: 's',
)
```

Use `OneUiText` instead of raw Flutter `Text` so font family, size, and color follow the brand.

### Input fields

```dart
OneUiInputField(
  label: 'Email',
  placeholder: 'you@example.com',
  fullWidth: true,
  required: true,
  type: 'email',
  start: const OneUiIcon(icon: 'search', size: '4'),
)
```

### Checkbox and radio

```dart
OneUiCheckboxField(
  label: 'Remember me on this device',
  checked: rememberMe,
  onCheckedChange: (value) => setState(() => rememberMe = value),
)

OneUiRadioField(
  label: 'Sign-in method',
  defaultValue: 'email',
  onValueChange: (value) => setState(() => method = value),
  children: [
    OneUiRadio(label: 'Email', value: 'email'),
    OneUiRadio(label: 'Mobile number', value: 'mobile'),
  ],
)
```

### Chips (multi-select or single-select)

```dart
OneUiChipGroup(
  defaultValue: ['personal'],
  multiple: true,
  onValueChange: (values) => setState(() => tags = values),
  children: [
    OneUiChip(value: 'personal', child: 'Personal'),
    OneUiChip(value: 'work', child: 'Work'),
  ],
)
```

### Avatar and badge

```dart
OneUiAvatar(
  content: OneUiAvatarContent.text,
  size: 'l',
  alt: 'AK',   // shows initials
)

OneUiBadge(
  attention: 'high',
  appearance: 'positive',
  start: const OneUiIcon(icon: 'checkCircle', size: '3'),
  child: 'Verified',
  semanticsLabel: 'Verified account',
)
```

### Logo

```dart
OneUiBrandLogo(
  size: OneUiLogoSize.l,
  alt: 'Jio',
)
```

### Spacing (use tokens, not magic numbers)

```dart
final scope = OneUiScope.of(context);
final gap = getSpacingTokenPx(
  spacingName: '4',                    // token name, e.g. Spacing-4
  platform: scope.platformId,
  density: scope.density,
  platformsConfig: scope.platformsFoundationConfig,
);

SizedBox(height: gap);
```

The sample app uses this pattern everywhere instead of `SizedBox(height: 16)`.

### Surfaces (colored sections)

When you put components on a **non-white / tinted / dark** background, wrap them in `OneUiSurface`:

```dart
OneUiSurface(
  mode: 'bold',    // strong brand-colored background
  child: OneUiButton(
    variant: OneUiButtonVariant.ghost,
    label: 'Still readable',
    onPressed: () {},
  ),
)
```

**Modes:** `default`, `ghost`, `minimal`, `subtle`, `moderate`, `bold`, `elevated`.

Without `OneUiSurface`, buttons and icons on colored backgrounds may have wrong contrast.

---

## How to use icons

### Basic icon (semantic name)

```dart
OneUiIcon(
  icon: 'search',    // Jio semantic name
  size: '4',         // design-system size token
)
```

Common names: `heart`, `settings`, `info`, `checkCircle`, `link`, `search`, …

Load the catalog in `main()` first:

```dart
await JioIconCatalog.instance.ensureLoaded();
```

### Icon inside a button

```dart
OneUiIconButton(
  icon: 'settings',
  semanticsLabel: 'Settings',   // required for screen readers
  variant: OneUiIconButtonVariant.ghost,
  onPressed: () {},
)
```

### Icon with color role

```dart
OneUiIcon(
  icon: 'info',
  size: '4',
  appearance: 'informative',   // tints icon with brand role
  emphasis: OneUiIconEmphasis.high,
)
```

**Appearances:** `primary`, `secondary`, `neutral`, `positive`, `negative`, `warning`, `informative`, `sparkle`, `brand-bg`, or `auto`.

### Icon in a slot (inside Badge, Input, Button)

```dart
OneUiBadge(
  start: const OneUiIcon(
    icon: 'checkCircle',
    size: '3',
    excludeFromSemantics: true,   // parent badge already has a label
  ),
  child: 'Verified',
)
```

### Custom icon (your own Widget)

```dart
OneUiIcon(
  icon: MyCustomSvgWidget(),
  size: '5',
)
```

### Network icon (URL)

```dart
OneUiIcon(
  icon: 'https://example.com/icon.svg',
  size: '5',
)
```

### Accessibility

| Goal | What to do |
|------|------------|
| Decorative icon (next to text) | Omit `semanticsLabel`, or set `excludeFromSemantics: true` |
| Meaningful icon (standalone) | Set `semanticsLabel: 'Settings'` |

---

## How to switch brands

There are **three levels** of brand switching:

### Level 1 — Light / dark mode (easiest)

Change `mode` on `OneUiBrandProvider`:

```dart
OneUiBrandProvider(
  mode: 'dark',   // or 'light' or 'dim'
  child: MyApp(),
)
```

The sample app’s **Colour scheme** chips do exactly this.

### Level 2 — Sub-brand within Jio (e.g. Jio → JioMart)

Use the `theme` prop:

```dart
OneUiBrandProvider(
  brand: 'jio',
  theme: null,        // base Jio
  mode: 'light',
  child: MyApp(),
)

// OR

OneUiBrandProvider(
  brand: 'jio',
  theme: 'jiomart',   // JioMart sub-brand
  mode: 'light',
  child: MyApp(),
)
```

The sample app’s **Sub-brand** chips call this via `ThemeSwitcherBar`.

When the user picks a new theme, the sample rebuilds `OneUiBrandProvider` with a new `key` so colors refresh immediately.

### Level 3 — Different parent brand (e.g. Jio → Tira)

```dart
OneUiBrandProvider(
  brand: 'tira',
  mode: 'light',
  child: MyApp(),
)
```

You must **prefetch and bake** that brand’s snapshots first (see below).

### Building a theme picker UI

After loading CDN manifest:

```dart
await ensureOneUiBrandDefaultsLoaded(loadCdnManifest: true);

// List sub-brands for Jio
final variants = listOneUiCdnBrandVariants('jio', mode: 'light');

// List light/dark modes available
final modes = listOneUiCdnBrandModes(brandSlug: 'jio', themeProp: null);
```

See `apps/flutter_sample/lib/theme_switcher_bar.dart` for a full working example.

---

## Where does brand data come from?

Brand data is **not** fetched from Convex in production apps. It comes from **pre-baked JSON snapshots** bundled in the app (or downloaded ahead of time).

### Data flow (simple view)

```
One UI Studio (design tool)
        ↓
Brand foundations saved / published
        ↓
CDN JSON files  (e.g. jio/latest.json, jio/sub-brands/jiomart/latest.json)
        ↓
Build step: prefetch + bake  (oneui_sync_brands)
        ↓
App assets: assets/brand_data/cdn/*.json
        ↓
main(): ensureOneUiBrandDefaultsLoaded()
        ↓
OneUiBrandProvider reads snapshot → components get colors/fonts/spacing
```

### Three sources (in order of fallback)

| Source | When used | Location |
|--------|-----------|----------|
| **Bundled Jio default** | Always available, no network | `packages/ui_flutter/assets/brand_data/default_jio_*.json` |
| **CDN baked snapshots** | After you run sync + ship assets | `assets/brand_data/cdn/` in `ui_flutter` |
| **Explicit snapshot** | Advanced / custom apps | You pass `snapshot:` to `OneUiBrandProvider` |

If a brand slug is missing, the library **falls back to bundled Jio default** (same as React Native).

### CDN URL

Configured in `oneui.brands.json` at your app root:

```json
{
  "cdnUrl": "https://myjiostatic.cdn.jio.com/JDS/ReactNative",
  "brands": {
    "jio": { "subBrands": ["jiomart"] }
  }
}
```

### How to add more brands / sub-brands

1. Add the brand slug to `oneui.brands.json`.
2. Run prefetch + bake (from monorepo root):

   ```bash
   pnpm flutter:sync-cdn-cache
   ```

   Or in your app:

   ```bash
   dart run ui_flutter:oneui_sync_brands
   ```

3. In `main()`, load with CDN manifest:

   ```dart
   await ensureOneUiBrandDefaultsLoaded(loadCdnManifest: true);
   ```

4. Use the slug in `OneUiBrandProvider(brand: 'your-brand', ...)`.

### Optional: live brand from One UI Studio (Convex)

For **internal preview tools only** — not for production consumer apps:

```dart
import 'package:ui_flutter/oneui_convex.dart';

OneUiBrandScope(
  convexUrl: convexUrl,
  brandId: brandId,
  child: MyApp(),
)
```

Production apps should use **offline/CDN snapshots**, not Convex.

---

## What the sample app demonstrates

Location: `apps/flutter_sample/`

| File | Purpose |
|------|---------|
| `lib/main.dart` | Startup, brand provider, theme state |
| `lib/login_screen.dart` | Full login UI with many components |
| `lib/theme_switcher_bar.dart` | Sub-brand + light/dark picker |
| `oneui.brands.json` | Which CDN brands to sync |

Run the sample:

```bash
cd apps/flutter_sample
flutter pub get
flutter run
```

Or from repo root:

```bash
pnpm flutter:sample
```

---

## Rules of thumb (avoid common mistakes)

1. **Always call `JioIconCatalog.instance.ensureLoaded()` in `main()`** — otherwise icons may fall back to Material icons.
2. **Always wrap your app in `OneUiBrandProvider`** — otherwise components have no brand colors.
3. **Use `OneUiText`, not raw `Text`** — for correct typography tokens.
4. **Use `OneUiSurface` on tinted backgrounds** — not `Container(color: ...)`.
5. **Use spacing tokens** — `getSpacingTokenPx(...)`, not hard-coded `16.0`.
6. **Do not rely on Material `ThemeData` colors** — One UI owns the visual layer.
7. **Prefetch brands at build time** — do not run the full color engine on the user’s phone at runtime.

---

## Quick reference — `OneUiBrandProvider` props

| Prop | Values | What it controls |
|------|--------|------------------|
| `brand` | `'jio'`, `'tira'`, … | Which brand snapshot to load |
| `theme` | `null`, `'jiomart'`, … | Sub-brand under a parent brand |
| `mode` | `'light'`, `'dark'`, `'dim'` | Color scheme |
| `density` | `'compact'`, `'default'`, `'open'` | Tighter or looser spacing |
| `platformId` | `'S-360'`, `'L-1440'`, … | Responsive dimension breakpoints |
| `snapshot` | `NativeThemeSnapshot` | Bypass slug lookup (advanced) |

---

## Learn more

| Document | Content |
|----------|---------|
| `apps/flutter_sample/README.md` | Setup, vendor tarball, theme switcher |
| `packages/ui_flutter/GETTING_STARTED.md` | Full technical getting started |
| `packages/ui_flutter/README.md` | Package overview and API imports |

---

## Glossary

| Term | Meaning |
|------|---------|
| **Brand** | A visual identity (Jio, Tira, JioMart, …) with its own colors and fonts |
| **Snapshot** | A JSON file with all resolved tokens for one brand + mode + platform |
| **Semantic icon** | A string name like `'search'` that maps to an SVG in the Jio catalog |
| **Surface** | A background container that makes child components adapt their colors |
| **Token** | A named design value (`Spacing-4`, `Primary-Bold`, …) |
| **CDN** | Remote server where brand JSON files are published |
| **Convex** | One UI Studio backend — optional, for live preview only |
