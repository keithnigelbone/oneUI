// Monorepo-aware Metro config for Expo. Tells Metro to watch the workspace
// root (so changes in `packages/*` hot-reload) and to resolve modules from
// both the app and the workspace root `node_modules` (since pnpm hoists
// dependencies).
const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Force singletons for React/React Native: in this monorepo the platform app
// uses react@19.2.x (tldraw constraint) while the mobile app uses react@19.1.x
// (Expo SDK 54 constraint). Without this redirect, shared packages imported
// by the mobile app would pull react from the workspace root (19.2.x) and
// produce "Invalid hook call" / two-copies-of-React errors at runtime.
// `extraNodeModules` is only a fallback — `resolveRequest` intercepts
// resolution before Metro's hierarchical lookup escapes into the workspace
// root, so transitive imports from `@oneui/*` packages resolve to the
// mobile app's local copies.
const SINGLETON_MODULES = new Set(['react', 'react-dom', 'react-native']);
const upstreamResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (SINGLETON_MODULES.has(moduleName)) {
    return context.resolveRequest(
      { ...context, originModulePath: path.join(projectRoot, 'index.ts') },
      moduleName,
      platform,
    );
  }
  return (upstreamResolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

// pnpm symlinks workspace packages — disable the heuristic that follows them
// only when the parent dir is in `nodeModulesPaths`.
config.resolver.disableHierarchicalLookup = false;

// Honor `exports` maps in package.json — required so Metro can resolve
// subpaths like `@oneui/shared/engine`, `@oneui/ui/components/Button/shared`,
// etc. (Default off in Metro 0.81; on by default in newer Metro.)
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
