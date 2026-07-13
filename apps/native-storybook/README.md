# OneUI Storybook (React Native SDK)

On-device Storybook for **`@oneui/ui-native`** — the React Native SDK of the Jio
OneUI design system. It compiles to a real **APK / IPA** so developers,
designers, and leadership can install the app and browse every component, its
variants, sizes, states, and surface behaviour — with live **brand / theme /
density** switching from the toolbar.

- **31 components, 284 stories** — generated 1:1 from each component's
  `*.showcase.native.tsx` peer in `packages/ui-native`.
- **Live foundation switching** — brand, light/dark/dim, and compact/default/open
  density, applied to every story via the global decorator.
- **Zero backend dependency** — ships with the bundled Jio brand snapshot, so it
  builds and runs with just `pnpm install` + a device.

---

## Run locally (development)

```bash
pnpm install                       # from repo root
pnpm --filter @oneui/native-storybook ios       # or: android
```

`expo start` auto-runs the Storybook story indexer (via `withStorybook` in
`metro.config.js`), so new/changed stories are picked up on reload.

## Regenerating stories

Stories are generated from the SDK's showcase files. After editing any
`packages/ui-native/src/components/*/**.showcase.native.tsx`:

```bash
pnpm --filter @oneui/native-storybook generate:stories
```

This rewrites `stories/*.stories.tsx` (one file per component, one story per
showcase export).

## Quality gates

```bash
pnpm --filter @oneui/native-storybook typecheck
```

---

## Building the shareable APK / IPA (EAS)

These produce installable binaries you can hand to anyone.

**One-time setup:**

```bash
npm i -g eas-cli
eas login                          # your Expo account
eas build:configure               # links the project (writes the EAS projectId)
```

**Android — internal-distribution APK (no store needed):**

```bash
pnpm --filter @oneui/native-storybook build:android:preview
```

EAS returns a download URL; the `.apk` installs directly on any Android device
(enable "install from unknown sources").

**iOS — IPA:**

```bash
pnpm --filter @oneui/native-storybook build:ios:preview
```

iOS distribution requires an Apple Developer account. EAS will prompt to manage
signing credentials. For internal sharing without the App Store, use
**ad-hoc** distribution (register tester device UDIDs) or **TestFlight**. To
run only on the iOS Simulator (no Apple account), use the
`preview-simulator` profile:

```bash
eas build --platform ios --profile preview-simulator
```

The build profiles live in [`eas.json`](./eas.json).

### Local builds (no EAS cloud)

```bash
# Android APK locally (requires Android SDK + JDK)
npx expo run:android --variant release

# iOS locally (requires Xcode on macOS)
npx expo run:ios --configuration Release
```

---

## Enabling the full multi-brand matrix (optional)

By default the toolbar offers the bundled **Jio** brand. To let designers switch
across every Jio brand/variant, generate the offline snapshots (needs a Convex
URL in `.env.local`) and point the registry at them — see the header comment in
[`src/brand-data/brands.ts`](./src/brand-data/brands.ts).

---

## How it fits together

| Piece | Role |
| --- | --- |
| `App.tsx` | Boots fonts + JDS icons once, then renders the Storybook UI |
| `.rnstorybook/main.ts` | Story globs + on-device addons |
| `.rnstorybook/preview.tsx` | Global decorator: wraps every story in `OneUIBrandProvider` on a light page; locked to light mode |
| `.rnstorybook/CustomUI.tsx` | Bespoke OneUI-branded shell — indigo app bar, searchable categorized component drawer, breadcrumb, prev/next stepping |
| `.rnstorybook/index.tsx` | Storybook UI root (`getStorybookUI`) — light branded theme + `CustomUIComponent` |
| `stories/*.stories.tsx` | Generated; one per component |
| `scripts/generate-stories.mjs` | Generator (showcase → CSF) |
| `src/brand-data/brands.ts` | Offline brand registry |
| `metro.config.js` | Monorepo + React-singleton resolution + `withStorybook` |
| `eas.json` | APK / IPA build profiles |
