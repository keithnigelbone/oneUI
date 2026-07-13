/**
 * publishConfig.ts
 *
 * Source of truth for "what gets renamed to what" at publish time. Source
 * package.json files stay `@oneui/*` so the monorepo, Storybook, and apps/*
 * keep working through pnpm workspace links unchanged. The staging script
 * (`stagePackage.ts`) reads this config to produce tarballs with the renamed
 * names — the source repo is never mutated.
 *
 * Add a new publishable package by:
 *   1. Adding an entry to `PUBLISHABLE_PACKAGES`.
 *   2. Adding its rename to `NAME_MAP`.
 *   3. Making sure its source package.json has `private: false` (so pnpm pack
 *      doesn't refuse) and a sensible `files`/`publishConfig`.
 */

/**
 * Source workspace name → published package name.
 *
 * Used in two places by `stagePackage.ts`:
 *   - rewrites the `name` field of the staged package.json
 *   - rewrites any `@oneui/*` references inside `dependencies` /
 *     `peerDependencies` to the matching `@jds4/*` name
 */
export const NAME_MAP: Record<string, string> = {
  '@oneui/ui': '@jds4/oneui-react',
  '@oneui/vite-plugin': '@jds4/oneui-vite-plugin',
  '@oneui/icons-jio': '@jds4/oneui-icons-jio',
  '@oneui/webpack-plugin': '@jds4/oneui-webpack-plugin',
  '@oneui/next-plugin': '@jds4/oneui-next-plugin',
  '@oneui/esbuild-plugin': '@jds4/oneui-esbuild-plugin',
  '@oneui/init': '@jds4/oneui-init',
};

export interface PublishablePackage {
  /** Source workspace package name as it appears in package.json. */
  sourceName: string;
  /** Source directory relative to repo root. */
  packageDir: string;
  /**
   * Workspace dependencies that are INLINED into the published package's
   * `dist/` at build time and therefore must be stripped from the staged
   * package.json's `dependencies`. The runtime consumer never installs them.
   */
  bundleWorkspaceDeps: string[];
  /**
   * Extra files/folders (relative to packageDir) to copy into the staging
   * directory alongside `dist/`. Anything listed here must also appear in
   * the source package.json's `files` field — staging is a faithful mirror
   * of what npm pack would have included.
   */
  extraFiles: string[];
}

/**
 * Packages this monorepo publishes. Listed in dependency-graph order
 * (publish a package only after the ones it depends on are published).
 *
 * The staging script tolerates missing packageDirs — useful while new
 * packages (e.g. the init CLI) are still being scaffolded. Each entry is
 * activated as the corresponding `packages/<name>/` directory lands.
 */
export const PUBLISHABLE_PACKAGES: PublishablePackage[] = [
  {
    sourceName: '@oneui/ui',
    packageDir: 'packages/ui',
    // shared + tokens are inlined into dist/ by vite.config.ts (no longer
    // externalized as of Phase B). Their workspace:* entries in the source
    // package.json exist for pnpm + Storybook resolution and must NOT appear
    // in the published artifact.
    bundleWorkspaceDeps: ['@oneui/shared', '@oneui/tokens'],
    extraFiles: ['cdn-bootstrap'],
  },
  {
    sourceName: '@oneui/vite-plugin',
    packageDir: 'packages/vite-plugin',
    // @oneui/shared/cdn is bundled into dist/ by tsup so end users don't
    // need a separate install. Strip the workspace:* dep from the staged
    // manifest.
    bundleWorkspaceDeps: ['@oneui/shared'],
    extraFiles: [],
  },
  {
    sourceName: '@oneui/icons-jio',
    packageDir: 'packages/icons-jio',
    // Icons register via the global registry on import. The package is fully
    // standalone and has no workspace dependencies.
    bundleWorkspaceDeps: [],
    extraFiles: [],
  },
  {
    sourceName: '@oneui/webpack-plugin',
    packageDir: 'packages/webpack-plugin',
    // @oneui/shared/cdn is bundled into dist/ by tsup. webpack-virtual-modules
    // remains a regular runtime dep, kept as-is in the published manifest.
    bundleWorkspaceDeps: ['@oneui/shared'],
    extraFiles: [],
  },
  {
    sourceName: '@oneui/next-plugin',
    packageDir: 'packages/next-plugin',
    // next-plugin depends on @oneui/webpack-plugin (workspace:*). The staging
    // script rewrites this to `@jds4/oneui-webpack-plugin` at the mapped semver.
    bundleWorkspaceDeps: [],
    extraFiles: [],
  },
  {
    sourceName: '@oneui/esbuild-plugin',
    packageDir: 'packages/esbuild-plugin',
    // @oneui/shared/cdn is bundled into dist/ by tsup. esbuild stays a
    // consumer-supplied peer dependency.
    bundleWorkspaceDeps: ['@oneui/shared'],
    extraFiles: [],
  },
  {
    sourceName: '@oneui/init',
    packageDir: 'packages/init',
    // CLI has no workspace deps — it shells out to npm/pnpm/yarn to install
    // OneUI packages at the consumer's invocation time, not at build time.
    bundleWorkspaceDeps: [],
    extraFiles: [],
  },
];

/**
 * Resolve a source `@oneui/*` reference to its published `@jds4/*` name.
 * Returns the input untouched for anything not in the map (third-party
 * deps, public packages, etc.).
 */
export function mapName(sourceName: string): string {
  return NAME_MAP[sourceName] ?? sourceName;
}
