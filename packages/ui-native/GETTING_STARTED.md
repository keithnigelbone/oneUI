# @oneui/ui-native

OneUI Studio React Native component library.

## Install

Both packages are published to the **JIO-DS-OneUI-Native** Azure Artifacts feed. Configure your registry first (one-time):

Add the following to `.npmrc` in your project root:

```ini
@oneui:registry=https://jio-dsp.pkgs.visualstudio.com/_packaging/JIO-DS-OneUI-Native%40Local/npm/registry/
always-auth=true

; begin auth token
//jio-dsp.pkgs.visualstudio.com/_packaging/JIO-DS-OneUI-Native%40Local/npm/registry/:username=JIO-DSP
//jio-dsp.pkgs.visualstudio.com/_packaging/JIO-DS-OneUI-Native%40Local/npm/registry/:_password=password
//jio-dsp.pkgs.visualstudio.com/_packaging/JIO-DS-OneUI-Native%40Local/npm/registry/:email=npm requires email to be set but doesn't use the value
//jio-dsp.pkgs.visualstudio.com/_packaging/JIO-DS-OneUI-Native%40Local/npm/:username=JIO-DSP
//jio-dsp.pkgs.visualstudio.com/_packaging/JIO-DS-OneUI-Native%40Local/npm/:_password=password
//jio-dsp.pkgs.visualstudio.com/_packaging/JIO-DS-OneUI-Native%40Local/npm/:email=npm requires email to be set but doesn't use the value
; end auth token

strict-ssl=false
legacy-peer-deps=true
```

Then install:

```bash
npm install @oneui/ui-native @oneui/native-cdn
npm install @jds/core-icons--react-native   # Jio icon glyphs
```

### Required peer dependencies

Install these in your app (they are declared as peers, not bundled):

```bash
npm install react react-native react-native-svg
```

`react-native-svg` (>=15) is **required** — `Icon`, `Spinner`,
`CircularProgressIndicator`, and `Logo` render through it; a missing install
surfaces as a native render error. `react` (^18.3 || ^19) and `react-native`
(>=0.76) are the usual app peers.

> Metallic materials are an **optional** add-on (`@oneui/ui-native-materials`,
> needs `expo-linear-gradient`). Without it, metallic roles fall back to solid
> Bold tokens — see § Materials below.

| Package             | Version         | Artifacts link                                                                                                                                      |
| ------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@oneui/ui-native`  | `0.1.0-alpha.5` | [view on feed](https://jio-dsp.visualstudio.com/AI%20Prototypes/_artifacts/feed/JIO-DS-OneUI-Native/Npm/@oneui%2Fui-native/overview/0.1.0-alpha.5)  |
| `@oneui/native-cdn` | `0.1.0-alpha.4` | [view on feed](https://jio-dsp.visualstudio.com/AI%20Prototypes/_artifacts/feed/JIO-DS-OneUI-Native/Npm/@oneui%2Fnative-cdn/overview/0.1.0-alpha.4) |

`@oneui/native-cdn` is required to fetch brand and theme data from the CDN and cache it locally for use with `<OneUIBrandProvider>`.

---

## Minimal usage

No brand config needed. The library ships a bundled Jio default snapshot that is used when `brand` is omitted:

```tsx
import * as JdsIcons from '@jds/core-icons--react-native';
import { initJdsJioIcons } from '@oneui/ui-native/icons';
import { OneUIBrandProvider, Button } from '@oneui/ui-native';

initJdsJioIcons(JdsIcons); // once, before first <Icon />

export default function App() {
  return (
    <OneUIBrandProvider mode="light">
      <Button attention="high" onPress={() => {}}>
        Hello, OneUI
      </Button>
    </OneUIBrandProvider>
  );
}
```

Wrap with `GestureHandlerRootView` + `SafeAreaProvider` in production apps. Load brand fonts via `expo-font` before rendering text.

---

## `<OneUIBrandProvider>` props

| Prop              | Type                               | Default     | Description                                                                     |
| ----------------- | ---------------------------------- | ----------- | ------------------------------------------------------------------------------- |
| `brand`           | `BrandData \| string \| undefined` | Jio default | Brand data — object, string slug (from prefetch cache), or omit for default Jio |
| `theme`           | `ThemeData \| string \| null`      | `null`      | Sub-brand accent delta — object or string slug                                  |
| `mode`            | `'light' \| 'dark' \| 'dim'`       | `'light'`   | Color scheme. `'dim'` maps to `'dark'` internally                               |
| `density`         | `'compact' \| 'default' \| 'open'` | `'default'` | Spacing density — shifts dimension f-steps                                      |
| `language`        | `string`                           | `'en'`      | App UI language; drives default script typography                               |
| `loadingFallback` | `ReactNode`                        | `null`      | Rendered while brand data is resolving                                          |
| `children`        | `ReactNode`                        | —           | Required                                                                        |

---

## With brand data

### Option 1 — CDN prefetch (recommended, offline-first)

Prefetch brand data into `node_modules/.oneui-cached` using `@oneui/native-cdn`:

```bash
npx oneui-native-cdn prefetch
```

Add the import to your app entry file (`app/_layout.tsx` or `App.tsx`) so Metro includes the cache in the bundle:

```ts
// app/_layout.tsx
import '.oneui-cached';
// ... rest of your layout
```

Then reference brands by slug — no network call needed on device:

```tsx
import { OneUIBrandProvider } from '@oneui/ui-native';

<OneUIBrandProvider brand="jio" theme="jiomart" mode="light">
  {children}
</OneUIBrandProvider>;
```

If a slug is not found in the cache the provider silently falls back to the bundled Jio default.

See [`@oneui/native-cdn` docs](../native-cdn/README.md) for config, CLI flags, and resilience behaviour.

### Option 2 — Offline JSON

Pass brand JSON directly — useful when you manage your own brand data files:

```tsx
import jioBrandData from './brand-data/Jio/latest.json';
import jiomartThemeData from './brand-data/jio/sub-brands/jiomart/latest.json';
import { OneUIBrandProvider, type BrandData, type ThemeData } from '@oneui/ui-native';

<OneUIBrandProvider
  brand={jioBrandData as BrandData}
  theme={jiomartThemeData as ThemeData}
  mode="light"
>
  {children}
</OneUIBrandProvider>;
```

The `BrandData` shape is `{ foundation, components? }`. The `ThemeData` shape is `{ themeData, colorScales? }`.

---

## Surface system (the most important rule)

OneUI is built around context-aware Surfaces. **Never** put a background colour on a raw `<View>` containing OneUI components — wrap with `<Surface mode="...">` instead so components inside re-resolve their tokens against the surface step.

```tsx
// Correct — descendants pick up role tokens for this surface.
<Surface mode="bold">
  <Button attention="high">Stays distinguishable</Button>
  <Button attention="medium">Tinted fill, readable text</Button>
  <Button attention="low">Readable text, no fill</Button>
</Surface>

// Wrong — no Surface context = no token remapping.
<View style={{ backgroundColor: '#E53935' }}>
  <Button attention="low">Broken: low contrast</Button>
</View>
```

Surface modes: `default` · `ghost` · `minimal` · `subtle` · `moderate` · `bold` · `elevated`.

---

## Materials (optional — metallic surfaces)

For brands that use metallic gradients (e.g. Tira gold), install the materials package and register the renderer once at app startup. Without this step, `<Surface mode="bold">`, `<Button attention="high">`, and `<Logo material="gold" />` fall back to the role's solid Bold token — the app still works, it just doesn't shimmer.

```bash
npm install @oneui/ui-native-materials
```

Register the renderer in your app entry file, next to `initJdsJioIcons`:

```tsx
// App.tsx (or app/_layout.tsx)
import { initOneUIMaterials } from '@oneui/ui-native-materials';
initOneUIMaterials(); // top-level, once — registers expo-linear-gradient renderer
```

After registration, any role the active brand assigns to a metallic preset automatically renders the gradient:

```tsx
// Tira assigns primary → gold: this Surface renders a gold gradient fill.
// Jio has no assignment: this Surface renders a solid primary Bold token.
<Surface mode="bold" appearance="primary">
  <Button attention="high">Adapts automatically</Button>
</Surface>

// Direct override: always use a specific metallic fill regardless of brand assignments.
<MetallicView type="gold" style={{ padding: 16, borderRadius: 8 }}>
  <Text style={{ color: getMetallicTextColor('gold') }}>Static gold surface</Text>
</MetallicView>

// Logo with metallic paint injected into the SVG <defs>:
<Logo
  material="gold"
  materialTarget="fill-stroke"
  svgContent={brandLogoSvg}
  alt="Brand mark"
  size="m"
/>
```

> **Note:** The `material` prop on `<Surface>` defaults to `'auto'`. Set `material="none"` to always use solid fills regardless of brand configuration.

---

## Icons

`@oneui/ui-native` does not bundle the Jio icon package. Register it once at app startup:

```tsx
import * as JdsIcons from '@jds/core-icons--react-native';
import { initJdsJioIcons } from '@oneui/ui-native/icons';

initJdsJioIcons(JdsIcons);
```

Pass icons to components via the `icon` prop using the imported symbol directly:

```tsx
import { IcAdd, IcClose } from '@jds/core-icons--react-native';
import { Button, Icon } from '@oneui/ui-native';

<Button start={<Icon icon={IcAdd} />} attention="high">Add</Button>
<Icon icon={IcClose} />
```

Components that embed icons (Checkbox, Button loading, IconButton) render correctly only when an icon set is registered.

---

## Versioning & releases

Versions follow semver. Packages are published to the [JIO-DS-OneUI-Native](https://jio-dsp.visualstudio.com/AI%20Prototypes/_artifacts/feed/JIO-DS-OneUI-Native) Azure Artifacts feed. Pin exact versions in `package.json` for reproducible installs during the alpha phase.
