import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import type { StorybookConfig } from '@storybook/react-vite';
import { mergeAlias } from 'vite';

// Monorepo root — Vite needs fs.allow to serve files from packages/*
const MONOREPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
// apps/storybook — second home for .env.local (main loads root first, then this)
const STORYBOOK_APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Parse KEY=VAL lines into process.env; does not overwrite keys already set. */
loadEnvLocalFromFile(resolve(MONOREPO_ROOT, '.env.local'));
loadEnvLocalFromFile(resolve(STORYBOOK_APP_ROOT, '.env.local'));

// Storybook always opts into WIP transparent material — blocked in the published
// `@oneui/ui` tarball but required for Surface transparent stories/inspectors.
process.env.ONEUI_EXPERIMENTAL_MATERIAL_TRANSPARENT = 'true';

function loadEnvLocalFromFile(filePath: string) {
  if (!existsSync(filePath)) return;
  const source = readFileSync(filePath, 'utf8');
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    const value = rawValue.replace(/^['"]|['"]$/g, '');
    process.env[key] = value;
  }
}

// STORYBOOK_OFFLINE=1 — sandboxed mode for the visual-signature CI job and
// any future Convex-less consumer. The runtime side loads brand foundations
// from @jds/kb-core's snapshotted JSON instead of a live Convex deployment.
// See preview.ts for the offline brand provider.
const OFFLINE_MODE = process.env.STORYBOOK_OFFLINE === '1';

// Resolve the offline brand snapshot HERE (Node / config-time) so the browser
// preview never imports @jds/kb-core — whose brand discovery pulls in `node:fs`
// / `__dirname` and breaks the Vite/Storybook bundle. We read the snapshot JSON
// and inject it as a string into the preview env; preview.ts just parses it.
const OFFLINE_BRAND_SLUG = process.env.STORYBOOK_OFFLINE_BRAND ?? 'jio-mobile';
let offlineBrandJson = '';
if (OFFLINE_MODE) {
  const brandSnapshot = resolve(
    MONOREPO_ROOT,
    'packages/kb-core/dist/brands',
    `${OFFLINE_BRAND_SLUG}.json`,
  );
  if (existsSync(brandSnapshot)) {
    offlineBrandJson = readFileSync(brandSnapshot, 'utf8');
  } else {
    // eslint-disable-next-line no-console
    console.warn(
      `[storybook] STORYBOOK_OFFLINE: brand snapshot not found at ${brandSnapshot}. ` +
        'Storybook will run without brand styling. Generate it via OneUI ' +
        'scripts/snapshot-brands.ts before the offline/CI run.',
    );
  }
}

const CONVEX_URL = OFFLINE_MODE
  ? null
  : (process.env.STORYBOOK_CONVEX_URL ??
    process.env.VITE_CONVEX_URL ??
    process.env.NEXT_PUBLIC_CONVEX_URL);

if (!OFFLINE_MODE && !CONVEX_URL) {
  throw new Error(
    'STORYBOOK_CONVEX_URL is required. Set it (or VITE_CONVEX_URL / NEXT_PUBLIC_CONVEX_URL) ' +
      'in .env.local so Storybook can reach a Convex deployment. See .env.example. ' +
      'For sandboxed CI runs (visual-signature generation, snapshots), set STORYBOOK_OFFLINE=1 ' +
      'and the brand will be loaded from @jds/kb-core/brands/<slug>.json instead.',
  );
}

const config: StorybookConfig = {
  stories: [
    '../../../packages/ui/src/**/*.mdx',
    '../../../packages/ui/src/**/*.stories.tsx',
    '../src/**/*.stories.tsx',
  ],

  staticDirs: ['../public'],

  addons: [
    // Performance panel retains per-story samples in memory and noticeably
    // increases Storybook RSS during long sessions. Opt in with STORYBOOK_PERF=1.
    ...(process.env.STORYBOOK_PERF === '1'
      ? [getAbsolutePath('@github-ui/storybook-addon-performance-panel')]
      : []),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-themes'),
    getAbsolutePath('@storybook/addon-docs'),
    {
      name: getAbsolutePath('@storybook/addon-mcp'),
      options: {
        toolsets: {
          dev: true,
          docs: true,
        },
      },
    },
  ],

  // Storybook 10 renamed / removed the `experimentalComponentsManifest` flag;
  // the feature is now on by default. Cast to any for forward-compat.
  features: {
    experimentalComponentsManifest: true,
  } as any,

  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },

  // Inject Convex URL + offline flag into the manager build via globals.
  // The manager uses its own bundler (not Vite), so import.meta.env and
  // process.env may not work there. In offline mode CONVEX_URL is null.
  managerHead: (head) => `
    ${head}
    <script>
      var __CONVEX_URL__ = ${JSON.stringify(CONVEX_URL)};
      var __STORYBOOK_OFFLINE__ = ${OFFLINE_MODE ? 'true' : 'false'};
      var __STORYBOOK_OFFLINE_BRAND__ = ${JSON.stringify(process.env.STORYBOOK_OFFLINE_BRAND ?? 'jio-mobile')};
    </script>
  `,

  // Also expose for the preview build (Vite-bundled, uses import.meta.env)
  env: (config) => ({
    ...config,
    CONVEX_URL: CONVEX_URL ?? '',
    VITE_CONVEX_URL: CONVEX_URL ?? '',
    STORYBOOK_OFFLINE: OFFLINE_MODE ? '1' : '0',
    STORYBOOK_OFFLINE_BRAND: process.env.STORYBOOK_OFFLINE_BRAND ?? 'jio-mobile',
    ONEUI_EXPERIMENTAL_MATERIAL_TRANSPARENT: 'true',
    // Raw brand snapshot JSON (resolved above in Node). Browser-safe: avoids
    // importing @jds/kb-core (node:fs) in the preview bundle.
    STORYBOOK_OFFLINE_BRAND_JSON: offlineBrandJson,
  }),

  viteFinal: async (config, { configType }) => {
    // Standard production `react-dom/client` does not run Profiler instrumentation.
    // `Tools/Performance` then records zero samples → every stat floors to MIN_DURATION_MS (0.05ms).
    // Use the official profiling entry only for static (`storybook build`) output.
    // React 19: alias `react-dom/client` (not `react-dom$`) — see facebook/react#32992.
    const useReactDomProfiling = configType === 'PRODUCTION';

    return {
      ...config,
      // Allow Vite to serve files from the entire monorepo (stories, packages, tokens).
      // Without this, Storybook 10's Vite server returns 404 for files outside apps/storybook/.
      server: {
        ...config.server,
        fs: {
          ...config.server?.fs,
          allow: [...(config.server?.fs?.allow ?? []), MONOREPO_ROOT],
        },
      },
      resolve: {
        ...config.resolve,
        dedupe: Array.from(new Set([...(config.resolve?.dedupe ?? []), 'react', 'react-dom'])),
        alias: mergeAlias(
          config.resolve?.alias,
          [
            // Bulletproof transparent-material gate — `define` alone is not
            // reliable for workspace `featureFlags.ts` (see featureFlags.storybook.ts).
            {
              find: /\/packages\/ui\/src\/featureFlags\.ts$/,
              replacement: resolve(MONOREPO_ROOT, 'packages/ui/src/featureFlags.storybook.ts'),
            },
            ...(OFFLINE_MODE
              ? [
                  {
                    find: '@jds/kb-core',
                    replacement: resolve(MONOREPO_ROOT, 'packages/kb-core/src/index.ts'),
                  },
                ]
              : []),
            ...(useReactDomProfiling
              ? [{ find: 'react-dom/client', replacement: 'react-dom/profiling' }]
              : []),
          ]
        ),
      },
      // Inject Convex URL into the preview build via Vite's define.
      // The env() function above doesn't reliably expose vars to import.meta.env
      // in all Storybook+Vite versions, so we use define as the guaranteed path.
      define: {
        ...config.define,
        'import.meta.env.VITE_CONVEX_URL': JSON.stringify(CONVEX_URL),
        'import.meta.env.CONVEX_URL': JSON.stringify(CONVEX_URL),
        'import.meta.env.STORYBOOK_CONVEX_URL': JSON.stringify(CONVEX_URL),
        'import.meta.env.ONEUI_EXPERIMENTAL_MATERIAL_TRANSPARENT': JSON.stringify('true'),
        // Compile-time gate — preview.ts drops the kb-core chunk when false.
        __STORYBOOK_OFFLINE_BUILD__: JSON.stringify(OFFLINE_MODE ? 'true' : 'false'),
        // WIP `<Surface material="transparent">` — ON in Storybook only. The published
        // `@oneui/ui` tarball bakes this to '' (see packages/ui/vite.config.ts + featureFlags.ts).
        'process.env.ONEUI_EXPERIMENTAL_MATERIAL_TRANSPARENT': JSON.stringify('true'),
      },
      optimizeDeps: {
        ...config.optimizeDeps,
        // Workspace packages must not be pre-bundled without the defines above —
        // otherwise MATERIAL_TRANSPARENT_ENABLED stays false in cached deps.
        exclude: [
          ...(config.optimizeDeps?.exclude ?? []),
          '@oneui/ui',
          '@oneui/shared',
        ],
        esbuildOptions: {
          ...config.optimizeDeps?.esbuildOptions,
          define: {
            ...config.optimizeDeps?.esbuildOptions?.define,
            'process.env.ONEUI_EXPERIMENTAL_MATERIAL_TRANSPARENT': JSON.stringify('true'),
            'import.meta.env.ONEUI_EXPERIMENTAL_MATERIAL_TRANSPARENT': JSON.stringify('true'),
          },
        },
      },
      css: {
        modules: {
          localsConvention: 'camelCase',
        },
      },
      build: {
        ...config.build,
        rollupOptions: {
          ...config.build?.rollupOptions,
          onwarn(warning, warn) {
            if (
              warning.code === 'MODULE_LEVEL_DIRECTIVE' ||
              warning.code === 'SOURCEMAP_ERROR'
            ) {
              return;
            }
            warn(warning);
          },
        },
      },
    };
  },
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
