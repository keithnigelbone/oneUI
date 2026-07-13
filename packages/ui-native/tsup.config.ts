import { defineConfig } from 'tsup';

/**
 * Build config for `@oneui/ui-native`.
 *
 * Three published entry points:
 *
 *   dist/index.mjs   — all components + full theme runtime  (main consumer entry)
 *   dist/theme.mjs   — theme runtime only (for apps building custom component trees)
 *   dist/icons.mjs   — icon system (IconProvider, Icon, loaders)
 *
 * The `react-native` export condition resolves to the compiled .mjs bundle.
 * @oneui/shared and @oneui/tokens are inlined by noExternal, so the bundle is
 * fully self-contained for any Metro version.
 *
 * What is intentionally EXCLUDED:
 *   - *.showcase.native.tsx   → sample app / demo screens only
 *   - *.test.ts / *.test.tsx  → test files
 *   - ButtonPreview.native.tsx → internal storybook preview
 *   - *ShowcaseGlyphs.tsx      → SVG glyphs only used by showcases
 *
 * Externals (declared as peerDependencies, zero bytes in bundle):
 *   react, react-native, react-native-svg
 *
 * @oneui/shared and @oneui/tokens are BUNDLED (not external).
 * They are internal monorepo packages with no npm registry presence,
 * so listing them as runtime dependencies would produce workspace:*
 * specs in the publish manifest that npm cannot resolve.
 * Bundling them keeps the tarball fully self-contained.
 */
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    // Public theme entry is the curated subset (theme/public.ts), NOT the full
    // internal barrel (theme/index.ts) — see Phase 4–6 API cleanup.
    theme: 'src/theme/public.ts',
    icons: 'src/components/Icon/icons.ts',
    // Advanced component-authoring helpers (slots, typography→TextStyle).
    internal: 'src/internal.ts',
  },

  // Dual output:
  //   .cjs → consumed by Metro/React Native (the `react-native` + `require`
  //          export conditions). CJS keeps `require('.oneui-cached')` as a
  //          native require() that Metro's static analyzer can detect — ESM
  //          would wrap it in a shim (en(...)) Metro can't see, silently
  //          dropping brand resolution back to Jio. So RN MUST resolve to .cjs.
  //   .mjs → consumed by `import` (web bundlers, Node ESM). Enables real
  //          tree-shaking now that sideEffects:false is declared. The .mjs
  //          bundle is never the `react-native` target, so the Metro shim
  //          concern does not apply to it.
  format: ['cjs', 'esm'],

  // .cjs for CommonJS, .mjs for ESM — explicit extensions so the export-map
  // conditions and tooling can target each format unambiguously.
  outExtension: ({ format }) => ({ js: format === 'cjs' ? '.cjs' : '.mjs' }),

  // DTS is intentionally disabled here.
  //
  // The root tsconfig has `incremental: true`, which trips tsup's DTS worker
  // with TS5074 regardless of `dts.tsconfig` overrides.  Types are generated
  // as a separate step via `pnpm build:dts` → `tsc -p tsconfig.build.json
  // --emitDeclarationOnly`.  That config does not extend the root, so the
  // incremental flag is never seen.
  dts: false,

  // Output goes directly to the root monorepo dist — no local packages/ui-native/dist/.
  // The monorepo resolves @oneui/ui-native via tsconfig `paths` → source, so the
  // local dist is never consumed inside the repo.  External consumers install from
  // the root dist/packages/ui-native/ artefact produced here.
  clean: true,
  outDir: '../../dist/packages/ui-native',

  // Entry-level code splitting keeps each entry self-contained.
  // @oneui/shared and @oneui/tokens are inlined (not on npm).
  // Only true peer deps (react, react-native, react-native-svg) stay external.
  splitting: false,
  treeshake: true,
  // Minify reduces index.mjs ~420 KB → ~200 KB and theme.mjs ~160 KB → ~80 KB.
  // Sourcemaps are kept for debugging but live only in dist/ — never shipped
  // inside the tgz (there is no `files` field in the workspace package.json
  // and the postbuild script does not copy *.map files into the publish output).
  minify: true,
  sourcemap: true,
  // 'node' tells esbuild that `require` is always available in the target runtime
  // (React Native / Metro provides it natively).  With 'neutral', esbuild wraps
  // every require() in a shim function `en(...)`.  Metro's static analyzer only
  // recognises literal require("...") calls — it never sees en(".oneui-cached") as
  // a dependency, so the module is absent from the bundle and resolution silently
  // falls back to DEFAULT_JIO_BRAND_DATA at runtime.  'node' emits the call as a
  // native require(".oneui-cached") which Metro picks up during static analysis.
  platform: 'node',
  target: 'es2022',

  // `external` adds to the default (all node_modules are external).
  // True peers stay external — they must be provided by the consumer app.
  // `.oneui-cached` is no longer required inside the bundle: the registration
  // pattern means the consumer's own code imports '.oneui-cached' directly,
  // which Metro can statically detect without any config changes.
  external: [
    'react',
    'react-native',
    'react-native-svg',
    /^react-native\//,
  ],

  // `noExternal` opts specific node_modules INTO the bundle.
  // @oneui/shared and @oneui/tokens are internal monorepo packages with no
  // npm registry presence. Bundling them keeps the published tarball fully
  // self-contained — no workspace:* resolution required by consumers.
  // @oneui/icons-jio-native is a peer dep (not bundled) — exclude it from the
  // noExternal pattern so it stays as a runtime require() in the consumer app.
  noExternal: [/^@oneui\/(?!icons-jio-native)/],

  esbuildOptions(options) {
    // Automatic JSX runtime (react/jsx-runtime) — no manual React import needed.
    options.jsx = 'automatic';
  },
});
