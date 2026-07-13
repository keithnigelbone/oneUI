# OneUI Native Components Sample

Minimal Expo app: **component registry list** + **detail showcases** only (no tokens/foundations drawer). On launch it opens **Button** detail via the stack `initialRouteName` + `initialParams`.

## Setup

1. From repo root: `pnpm install`

   **Jio icons** — vendored as [`vendor/jds-core-icons--react-native-0.0.5.tgz`](./vendor/jds-core-icons--react-native-0.0.5.tgz) (no Azure registry required). To refresh after upgrading the upstream package: `npm pack` from an installed `@jds/core-icons--react-native@0.0.5` and replace the tgz.
2. Create `apps/native-components-sample/.env.local`:

   ```bash
   EXPO_PUBLIC_CONVEX_URL=https://<your-deployment>.convex.cloud
   ```

   Use the same Convex URL as `apps/native-sample` if you already have one.

   Export offline brand snapshots (required for theme loading — the app reads
   `brand-data/*.json` instead of live Convex for foundation + component overrides):

   ```bash
   pnpm --filter @oneui/native-components-sample export:brands
   ```

   This writes trimmed JSON under `brand-data/` and regenerates
   `src/brand-data/offlineBrandData.generated.ts` for Metro static imports.

   In the app header, **Brand data** toggles between **Offline JSON** (exported
   snapshots) and **Convex (live)**. The choice is persisted across launches.

3. Run:

   ```bash
   pnpm --filter @oneui/native-components-sample dev
   ```

## Layout

- `src/screens/components/ComponentsStack.tsx` — native stack; default screen is **Detail** (`id: button`).
- `src/screens/components/ComponentsListScreen.tsx` — sectioned list from `nativeRegistry.ts`.
- `src/screens/components/ComponentDetailScreen.tsx` — showcase dispatcher (copied from `native-sample`, trimmed imports only by path).
- `src/showcase/IconShowcase.tsx` — Icon demos using `@jds/core-icons--react-native` + `@oneui/ui-native/icons` (`icon={…}` only; no `IconProvider` / `iconSet`).
- `src/components/ComponentsChrome.tsx` — header with **‹ Components** back from detail to list.

Brand theme pipeline matches `native-sample` (`PageContext`, `useActiveBrand`, `useNativeTheme`, `foundationToNativeTheme`).
