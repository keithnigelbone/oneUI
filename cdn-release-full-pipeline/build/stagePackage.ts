/**
 * stagePackage.ts
 *
 * Per-package staging logic for the publish flow. For each publishable
 * source package, produces a staging directory under `release/staging/<slug>/`
 * that looks exactly like the package npm would publish — except with:
 *
 *   - `name` rewritten via NAME_MAP (e.g. `@oneui/ui` → `@jds4/oneui-react`)
 *   - inlined workspace deps stripped from `dependencies`
 *   - remaining `@oneui/*` deps rewritten to their `@jds4/*` mapped names
 *   - `devDependencies`, `scripts`, `private` stripped (irrelevant to consumers)
 *   - `publishConfig` flattened in (its main/module/types/exports take over)
 *
 * Source package.json files are NEVER modified.
 *
 * Output: `release/tarballs/<scope>-<slug>-<version>.tgz`.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, cpSync, statSync, readdirSync, renameSync, lstatSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, posix, relative, resolve, sep } from 'node:path';
import { execSync } from 'node:child_process';
import { mapName, NAME_MAP, type PublishablePackage } from './publishConfig';
import { ALLOWED_COMPONENTS } from './componentAllowlist';

export interface StagedTarball {
  /** Mapped npm name, e.g. `@jds4/oneui-react`. */
  publishedName: string;
  /** Version from the source package.json (Changesets will have bumped it). */
  version: string;
  /** Absolute path to the produced `.tgz`. */
  tarballPath: string;
  /** Size in bytes. */
  bytes: number;
  /** Truncated sha256 for the release notes table. */
  sha256: string;
}

interface SourcePackageJson {
  name: string;
  version: string;
  private?: boolean;
  type?: string;
  sideEffects?: unknown;
  main?: string;
  module?: string;
  types?: string;
  exports?: unknown;
  files?: string[];
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, unknown>;
  devDependencies?: Record<string, string>;
  publishConfig?: Partial<SourcePackageJson> & { exports?: unknown };
  [key: string]: unknown;
}

function sha256Truncated(file: string): string {
  return createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 16);
}

/** Recursively collect every file under `dir` whose extension matches one of `exts`. */
function walkFiles(dir: string, exts: string[]): string[] {
  const out: string[] = [];
  function recurse(d: string): void {
    for (const entry of readdirSync(d)) {
      const full = join(d, entry);
      const stat = lstatSync(full);
      if (stat.isDirectory()) {
        recurse(full);
      } else if (stat.isFile() && exts.some((ext) => entry.endsWith(ext))) {
        out.push(full);
      }
    }
  }
  if (existsSync(dir)) recurse(dir);
  return out;
}

/**
 * Rewrite `@oneui/*` import / require strings inside compiled JS and type
 * declarations to their `@jds4/oneui-*` mapped names. Necessary because
 * source code uses workspace package names but the published artifact must
 * reference the renamed packages so consumers can resolve them.
 *
 * Bundled deps (those in `bundleWorkspaceDeps`) are guaranteed to be inlined
 * in `dist/` and should NOT appear as import strings — if they do, the
 * Vite/tsup build leaked them out and the consumer's install will fail.
 * This function warns loudly in that case.
 */
function rewriteImportsInStagingDir(stagingDir: string, pkg: PublishablePackage): void {
  // Cover ESM, CJS, source maps embedded as base64 are skipped (.map files
  // are content, not import-bearing). Type declaration files use `from '...'`
  // syntax too and must be rewritten so consumer typecheck doesn't break.
  const files = walkFiles(stagingDir, ['.mjs', '.cjs', '.js', '.d.ts', '.d.cts', '.d.mts']);

  const escape = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const fromPattern = (src: string): RegExp =>
    // Matches: from 'X', from "X", require('X'), require("X"), import('X')
    // Also matches subpath imports: 'X/subpath'. The negative lookahead on
    // anything other than `/`, `'`, or `"` after the package name prevents
    // partial matches like `@oneui/uiless` accidentally hitting `@oneui/ui`.
    new RegExp(
      `((?:from|require|import)\\s*\\(?\\s*['"])${escape(src)}(?=[/'"])`,
      'g',
    );

  let totalRewrites = 0;
  for (const file of files) {
    let content = readFileSync(file, 'utf8');
    let changed = false;
    for (const [source, mapped] of Object.entries(NAME_MAP)) {
      const re = fromPattern(source);
      const replaced = content.replace(re, `$1${mapped}`);
      if (replaced !== content) {
        const hits = (content.match(re) ?? []).length;
        totalRewrites += hits;
        content = replaced;
        changed = true;
      }
    }
    if (changed) writeFileSync(file, content);
  }

  if (totalRewrites > 0) {
    console.log(`  ↻ rewrote ${totalRewrites} import string(s) in ${pkg.sourceName}/dist/`);
  }

  // Targeted leak check: a package declared in `bundleWorkspaceDeps` was
  // supposed to be inlined by the build (no externalization). If we still see
  // it as an import in dist/, the build leaked it and the consumer's install
  // will fail at runtime. Other residual @oneui/* matches (template literals,
  // JSDoc samples, log prefixes) are common false positives and ignored.
  for (const bundled of pkg.bundleWorkspaceDeps) {
    const escaped = bundled.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const leakPattern = new RegExp(
      `(?:from|require|import)\\s*\\(?\\s*['"]${escaped}(?=[/'"])`,
      'g',
    );
    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      const matches = content.match(leakPattern);
      if (matches && matches.length > 0) {
        console.warn(
          `  ⚠ ${pkg.sourceName}: bundled dep "${bundled}" still imported in `
          + `${file.replace(stagingDir, '')} (${matches.length}× — build did not inline).`,
        );
      }
    }
  }
}

/**
 * Discover bundled workspace packages whose source modules were inlined by
 * Vite's preserveModules build into staging/dist/packages/pkgname/src.
 * Returns each pkg's name (slug only, no scope prefix) plus the absolute
 * path to its staged src root.
 *
 * Data-driven — anything that ends up under dist/packages/ with a src/
 * subdirectory is treated as a bundled pkg, so new workspace deps
 * participate automatically without the rewriter or dts emitter needing
 * to be told about them.
 */
function discoverBundledPackages(stagingDir: string): Array<{ name: string; srcDir: string }> {
  const pkgsRoot = join(stagingDir, 'dist', 'packages');
  if (!existsSync(pkgsRoot)) return [];
  const out: Array<{ name: string; srcDir: string }> = [];
  for (const entry of readdirSync(pkgsRoot)) {
    const srcDir = join(pkgsRoot, entry, 'src');
    if (existsSync(srcDir) && statSync(srcDir).isDirectory()) {
      out.push({ name: entry, srcDir });
    }
  }
  return out;
}

/**
 * Path-aware rewriter that fixes vite-plugin-dts-emitted import paths in
 * dist d.ts files. The plugin's include: ['src'] config means it never emits
 * declarations for @oneui/shared (or any other bundled workspace pkg), AND
 * when it sees from '@oneui/shared' it follows pnpm's workspace symlink to
 * the monorepo source and writes a relative path like '../../shared/src'
 * computed from that source location — not from where the published package
 * will actually live.
 *
 * Once the matching declarations have been emitted into
 * <staging>/dist/packages/<pkg>/src/ (see emitBundledDtsViaTsc), this
 * function rewrites each leaked (../)+<pkg>/src reference to a relative
 * path that points at those staged declarations from each d.ts file's
 * actual location.
 *
 * Scoped to packages discovered under dist/packages/ so it only touches
 * imports that map to a bundled pkg with a real on-disk destination.
 */
function rewriteDtsRelativeToBundledPackages(stagingDir: string, pkg: PublishablePackage): void {
  const bundled = discoverBundledPackages(stagingDir);
  if (bundled.length === 0) return;

  const distRoot = join(stagingDir, 'dist');
  if (!existsSync(distRoot)) return;

  const files = walkFiles(distRoot, ['.d.ts', '.d.cts', '.d.mts']);

  // Build one regex per bundled pkg matching imports of the form
  //   from '../../pkg/src'
  //   from '../../pkg/src/subpath'
  //   require('../../pkg/src') / import('../../pkg/src')
  // Group 1 captures the quote/prefix, group 2 the trailing subpath.
  // Pre-escape pkg names defensively so future names with regex
  // metacharacters (e.g. dots) do not break the match.
  const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = bundled.map(({ name }) => {
    const escaped = escapeRegex(name);
    return {
      name,
      re: new RegExp(
        '((?:from|require|import)\\s*\\(?\\s*[\'"])(?:\\.\\./)+' + escaped + '/src(/[^\'"]*)?(?=[\'"])',
        'g',
      ),
    };
  });

  let totalRewrites = 0;
  for (const file of files) {
    let content = readFileSync(file, 'utf8');
    let changed = false;
    for (const { name, re } of patterns) {
      const dest = join(distRoot, 'packages', name, 'src');
      content = content.replace(re, (_match, prefix: string, sub: string | undefined) => {
        // Compute a posix-style relative path from the d.ts file's dir to the
        // staged shared/src/<sub> location. Always prefix with './' for clarity.
        let rel = relative(dirname(file), dest + (sub ?? ''));
        rel = rel.split(sep).join(posix.sep);
        if (!rel.startsWith('.')) rel = `./${rel}`;
        totalRewrites += 1;
        changed = true;
        return `${prefix}${rel}`;
      });
    }
    if (changed) writeFileSync(file, content);
  }

  if (totalRewrites > 0) {
    console.log(`  ↻ rewrote ${totalRewrites} d.ts path(s) in ${pkg.sourceName}/dist/ to point at bundled package roots`);
  }
}

/**
 * Emit .d.ts declarations for each bundled workspace pkg into
 * staging/dist/packages/pkgname/src so they sit side-by-side with the
 * .mjs / .cjs files Vite produced via preserveModules. Without this step,
 * consumer TypeScript cannot resolve types for re-exports from bundled
 * pkgs even after the path rewriter — the destination directory has
 * runtime files but no declarations.
 *
 * Uses a one-shot tsc invocation per pkg with explicit compiler flags so
 * the emitted declarations match what the source was authored against.
 */
function emitBundledDtsViaTsc(stagingDir: string, repoRoot: string, pkg: PublishablePackage): void {
  const bundled = discoverBundledPackages(stagingDir);
  if (bundled.length === 0) return;

  for (const { name, srcDir } of bundled) {
    // Source pkg dir is wherever the workspace symlink points — assume the
    // standard packages/name/ layout (matches every workspace pkg today).
    const sourcePkgDir = resolve(repoRoot, 'packages', name);
    const sourceSrcDir = join(sourcePkgDir, 'src');
    if (!existsSync(sourceSrcDir)) {
      console.warn(
        `  ⚠ ${pkg.sourceName}: bundled pkg "${name}" has dist/packages/${name}/src in staging `
        + `but no matching source at ${sourceSrcDir} — cannot emit declarations`,
      );
      continue;
    }

    // Write a one-shot tsconfig into the staging dir. Using a tsconfig (rather
    // than CLI file-globs) is more portable than relying on bash globstar and
    // lets tsc do its own include resolution. We force noEmit:false because
    // most package tsconfigs default to noEmit:true for editor use.
    const tmpTsconfigPath = join(stagingDir, `.tsconfig.${name}.json`);
    const tmpTsconfig = {
      compilerOptions: {
        declaration: true,
        emitDeclarationOnly: true,
        declarationMap: false,
        noEmit: false,
        composite: false,
        incremental: false,
        rootDir: sourceSrcDir,
        outDir: srcDir,
        module: 'ESNext',
        moduleResolution: 'bundler',
        target: 'ES2022',
        jsx: 'react-jsx',
        esModuleInterop: true,
        skipLibCheck: true,
        resolveJsonModule: true,
        allowSyntheticDefaultImports: true,
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      },
      include: [join(sourceSrcDir, '**/*.ts'), join(sourceSrcDir, '**/*.tsx')],
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.stories.tsx'],
    };
    writeFileSync(tmpTsconfigPath, JSON.stringify(tmpTsconfig, null, 2));

    try {
      execSync(`pnpm exec tsc -p "${tmpTsconfigPath}"`, {
        cwd: repoRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch {
      // tsc returns non-zero when there are type errors but it still emits.
      // We tolerate that — pre-existing errors in shared shouldn't block
      // publishing. The assertion gate downstream is what guarantees the
      // emitted declarations are leak-free.
      console.warn(`  ⚠ ${pkg.sourceName}: tsc reported errors emitting d.ts for "${name}" (declarations still produced)`);
    } finally {
      rmSync(tmpTsconfigPath, { force: true });
    }

    const emitted = walkFiles(srcDir, ['.d.ts']).length;
    console.log(`  ↻ ${pkg.sourceName}: emitted ${emitted} .d.ts file(s) for bundled pkg "${name}"`);
  }
}

/**
 * Hard gate for alpha.10 brand-loader dist artifacts on @oneui/ui tarballs.
 */
function assertUiBrandLoaderArtifacts(stagingDir: string, publishedName: string): void {
  const distRoot = join(stagingDir, 'dist');
  const required = [
    'brand-loader.mjs',
    'cdn-bootstrap/jio.mjs',
    'cdn-bootstrap/jio-loader.mjs',
  ];
  const missing = required.filter((rel) => !existsSync(join(distRoot, rel)));
  if (missing.length > 0) {
    throw new Error(
      `[stage] ${publishedName}: missing required dist artifact(s): ${missing.join(', ')}. `
      + 'Build @oneui/ui (brand-loader + cdn-bootstrap entries) before staging.',
    );
  }

  const leaked: string[] = [];
  for (const file of walkFiles(distRoot, ['.mjs', '.cjs', '.js'])) {
    const content = readFileSync(file, 'utf8');
    if (content.includes('packages/ui/cdn-bootstrap')) {
      leaked.push(relative(stagingDir, file));
    }
  }
  if (leaked.length > 0) {
    throw new Error(
      `[stage] ${publishedName}: dist leaks monorepo cdn-bootstrap path in: ${leaked.join(', ')}`,
    );
  }
}

/**
 * Post-stage validation gate. Scans every `.d.ts` under the staged dist for
 * references that escape the published tarball — either bare workspace
 * specifiers (`from '@oneui/...'`) or relative paths that walk above the
 * file's own `dist/` root (`from '../../<something>/src'`).
 *
 * Either kind of leak means the published types are broken: workspace
 * specifiers can't resolve in a consumer's node_modules, and relative paths
 * that escape dist/ point at nothing once installed.
 *
 * This gate is the load-bearing safeguard. The rewriter handles known cases;
 * the gate ensures regressions surface as build failures, not customer bug
 * reports.
 */
function assertNoLeakedWorkspaceRefs(stagingDir: string, pkg: PublishablePackage): void {
  const distRoot = join(stagingDir, 'dist');
  if (!existsSync(distRoot)) return;

  const files = walkFiles(distRoot, ['.d.ts', '.d.cts', '.d.mts']);

  interface Leak { file: string; line: number; spec: string; reason: string }
  const leaks: Leak[] = [];

  // Match real declaration-style import/export statements only. Anchored to
  // start-of-line (after optional whitespace, NO leading "*" so JSDoc-block
  // example code is skipped). The [^;=]*? gap before "from" prevents matches
  // inside string-typed const initializers like
  //     export declare const X = "import ... from '...'";
  // because such lines contain "=" before reaching the inner quoted spec.
  // Two forms:
  //   ^ (ws) import|export <stuff without ;=> from '<spec>'
  //   ^ (ws) export * from '<spec>'   (handled by the same pattern)
  const declRe = /^[ \t]*(?:import|export)\b[^;=`\n]*?\bfrom\s*['"]([^'"]+)['"]/gm;

  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    let m: RegExpExecArray | null;
    while ((m = declRe.exec(content)) !== null) {
      const spec = m[1];
      // Recover line number for the error message
      const line = content.slice(0, m.index).split('\n').length;

      if (spec.startsWith('@oneui/')) {
        leaks.push({ file, line, spec, reason: 'bare workspace specifier' });
        continue;
      }
      if (spec.startsWith('.')) {
        const resolved = resolve(dirname(file), spec);
        const rel = relative(distRoot, resolved);
        if (rel.startsWith('..') || rel === '..' || (sep === '\\' && rel.startsWith('..\\'))) {
          leaks.push({ file, line, spec, reason: 'relative path escapes dist/' });
        }
      }
    }
  }

  if (leaks.length === 0) return;

  const lines: string[] = [
    `\n✗ ${pkg.sourceName}: found ${leaks.length} leaked reference(s) in emitted declarations:\n`,
  ];
  for (const l of leaks.slice(0, 20)) {
    const rel = l.file.replace(stagingDir + sep, '');
    lines.push(`    ${rel}:${l.line}  →  ${l.spec}   [${l.reason}]`);
  }
  if (leaks.length > 20) {
    lines.push(`    … and ${leaks.length - 20} more`);
  }
  lines.push(
    '',
    '  Bundled workspace packages must not appear in published .d.ts files,',
    '  and relative paths must not escape the package\'s own dist/.',
    '',
    '  To resolve, one of:',
    '    • rewrite the import during staging (see rewriteDtsRelativeToBundledPackages)',
    '    • emit declarations for the bundled package (see emitBundledDtsViaTsc)',
    '    • replace the workspace specifier in source with a relative path',
    '',
  );
  throw new Error(lines.join('\n'));
}

/**
 * Rewrite a deps object: drop bundled workspace deps; rename `@oneui/*` →
 * `@jds4/*`; convert `workspace:*` to a real semver range pinned to the
 * staged version so the published artifact is installable from outside
 * the workspace.
 */
function rewriteDeps(
  deps: Record<string, string> | undefined,
  bundleWorkspaceDeps: string[],
  stagedVersion: string,
): Record<string, string> | undefined {
  if (!deps) return undefined;
  const out: Record<string, string> = {};
  for (const [name, range] of Object.entries(deps)) {
    if (bundleWorkspaceDeps.includes(name)) continue; // inlined, must not appear
    const newName = mapName(name);
    let newRange = range;
    if (range.startsWith('workspace:')) {
      // Pin to the version we're cutting now — cross-package releases ship
      // as a coherent set. (Changesets bumps in lockstep when packages are
      // linked; if not linked, this still produces a working artifact for
      // the version that was actually built.)
      newRange = `^${stagedVersion}`;
    }
    out[newName] = newRange;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * Build the staged package.json: source data + NAME_MAP rewrites +
 * publishConfig flatten. Source repo untouched.
 */
function buildStagedManifest(source: SourcePackageJson, pkg: PublishablePackage): SourcePackageJson {
  const publishedName = mapName(source.name);
  const stagedVersion = source.version;

  // Start from a shallow clone so we can mutate freely.
  const staged: SourcePackageJson = { ...source };

  // Apply publishConfig overrides first (main, module, types, exports come
  // from publishConfig if present — that's the whole reason it exists).
  if (source.publishConfig) {
    for (const [key, value] of Object.entries(source.publishConfig)) {
      (staged as Record<string, unknown>)[key] = value;
    }
  }

  staged.name = publishedName;
  // Strip artefacts irrelevant to consumers
  delete staged.private;
  delete staged.scripts;
  delete staged.devDependencies;
  delete staged.publishConfig;

  staged.dependencies = rewriteDeps(staged.dependencies, pkg.bundleWorkspaceDeps, stagedVersion);
  staged.peerDependencies = rewriteDeps(staged.peerDependencies, [], stagedVersion);
  // peerDependenciesMeta key names are package names too — rewrite if present
  if (staged.peerDependenciesMeta) {
    const meta: Record<string, unknown> = {};
    for (const [name, val] of Object.entries(staged.peerDependenciesMeta)) {
      meta[mapName(name)] = val;
    }
    staged.peerDependenciesMeta = meta;
  }

  return staged;
}

/**
 * Replace the wildcard `"./components/*"` entry in the staged `exports`
 * map with one explicit subpath per allowlisted component. This is the
 * hard gate on deep-path imports — anything not listed becomes
 * unresolvable for consumers regardless of what files end up in dist/.
 *
 * Mirrors the shape of the wildcard entry (types/import/require) for each
 * allowlisted component name. Leaves all other exports entries (`.`,
 * `./styles`, `./hooks/*`, `./icons/*`, etc.) untouched.
 *
 * Only invoked for `@oneui/ui`. Idempotent (replaces only the wildcard;
 * if it has already been expanded, the new map overwrites with the same
 * explicit shape).
 */
function rewriteComponentsExports(staged: SourcePackageJson, publishedName: string): void {
  if (!staged.exports || typeof staged.exports !== 'object') return;
  const exportsMap = staged.exports as Record<string, unknown>;

  // Capture the wildcard's conditions before deleting it so we mirror its
  // exact shape per-component (types/import/require, or whatever else is
  // declared at publish time).
  const wildcardKey = './components/*';
  const wildcardValue = exportsMap[wildcardKey];
  if (wildcardValue === undefined) {
    console.warn(
      `  ⚠ ${publishedName}: no "${wildcardKey}" entry in publishConfig.exports — `
      + 'cannot rewrite into explicit allowlist. Leaving exports map untouched.',
    );
    return;
  }
  delete exportsMap[wildcardKey];

  // Subpath import for shared parts that some components expose
  // (e.g. `@oneui/ui/components/Foo/shared`). Mirror it per-component
  // only if the source had a `./components/*/shared` wildcard so we
  // don't invent a public surface that wasn't there before.
  const sharedWildcardKey = './components/*/shared';
  const sharedWildcardValue = exportsMap[sharedWildcardKey];
  if (sharedWildcardValue !== undefined) delete exportsMap[sharedWildcardKey];

  const expandValue = (template: unknown, componentName: string): unknown => {
    if (typeof template === 'string') return template.replace(/\*/g, componentName);
    if (template && typeof template === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(template as Record<string, unknown>)) {
        out[k] = expandValue(v, componentName);
      }
      return out;
    }
    return template;
  };

  for (const name of ALLOWED_COMPONENTS) {
    exportsMap[`./components/${name}`] = expandValue(wildcardValue, name);
    if (sharedWildcardValue !== undefined) {
      exportsMap[`./components/${name}/shared`] = expandValue(sharedWildcardValue, name);
    }
  }

  console.log(
    `  ↻ ${publishedName}: expanded "./components/*" → ${ALLOWED_COMPONENTS.length} explicit subpath entries`,
  );
}

/**
 * Point the staged root entry (`.` export + top-level main/module/types) at
 * the released-only barrel `dist/index.public.*` instead of the full dev
 * barrel `dist/index.*`. The full barrel re-exports every component
 * (including WIP ones), which defeated the `./components/*` allowlist gate
 * for root imports (`import { Foo } from '@jds4/oneui-react'`).
 *
 * `src/index.public.ts` is generated by `scripts/generate-public-barrel.ts`
 * from the allowlist in `packages/ui/src/registry/releasedComponents.ts` —
 * it keeps every non-component export (providers, hooks, icons, registry,
 * engine, runtime, utils) untouched.
 *
 * Only invoked for `@oneui/ui`. The full `dist/index.*` files still ship in
 * the tarball (other dist modules import them relatively) but are no longer
 * reachable through the exports map.
 */
function rewriteRootEntryToPublicBarrel(staged: SourcePackageJson, publishedName: string): void {
  const toPublic = (p: string): string => p.replace(/\/index\.(mjs|cjs|d\.ts)$/, '/index.public.$1');

  for (const field of ['main', 'module', 'types'] as const) {
    const value = staged[field];
    if (typeof value === 'string') staged[field] = toPublic(value);
  }

  if (!staged.exports || typeof staged.exports !== 'object') return;
  const exportsMap = staged.exports as Record<string, unknown>;
  const rootEntry = exportsMap['.'];
  if (rootEntry === undefined) {
    console.warn(`  ⚠ ${publishedName}: no "." entry in publishConfig.exports — root barrel not rewritten.`);
    return;
  }

  const rewrite = (node: unknown): unknown => {
    if (typeof node === 'string') return toPublic(node);
    if (node && typeof node === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) out[k] = rewrite(v);
      return out;
    }
    return node;
  };
  exportsMap['.'] = rewrite(rootEntry);

  console.log(`  ↻ ${publishedName}: root export "." now resolves to dist/index.public.* (released-only barrel)`);
}

/**
 * Stage one publishable package and produce a `.tgz` in the release dir.
 * Returns metadata describing the produced tarball (for the summary table).
 *
 * Tolerates missing packageDir — returns null with a warning, so the
 * caller can keep going while new packages are still scaffolded.
 */
export function stagePackage(
  pkg: PublishablePackage,
  repoRoot: string,
  releaseDir: string,
): StagedTarball | null {
  const pkgRoot = resolve(repoRoot, pkg.packageDir);
  const sourcePackageJsonPath = join(pkgRoot, 'package.json');

  if (!existsSync(sourcePackageJsonPath)) {
    console.warn(`  ⚠ skipping ${pkg.sourceName} — ${pkg.packageDir}/package.json not found (package not scaffolded yet)`);
    return null;
  }

  const source = JSON.parse(readFileSync(sourcePackageJsonPath, 'utf8')) as SourcePackageJson;
  const staged = buildStagedManifest(source, pkg);
  const publishedName = staged.name;

  // For @oneui/ui only: replace the wildcard "./components/*" entry with
  // one explicit subpath per allowlisted component. Hard gate on deep-path
  // imports — anything not on the allowlist becomes unresolvable.
  if (pkg.sourceName === '@oneui/ui') {
    rewriteComponentsExports(staged, publishedName);
    rewriteRootEntryToPublicBarrel(staged, publishedName);
  }

  // Slug for filesystem use: strip leading @ and replace / with -
  const slug = publishedName.replace(/^@/, '').replace(/\//g, '-');
  const stagingDir = join(releaseDir, 'staging', slug);

  if (existsSync(stagingDir)) rmSync(stagingDir, { recursive: true });
  mkdirSync(stagingDir, { recursive: true });

  // Mirror the `files` field — copy each listed file/dir from source.
  // Falls back to copying `dist/` only if no files field is declared.
  const filesToCopy = staged.files ?? ['dist'];
  for (const entry of filesToCopy) {
    const src = join(pkgRoot, entry);
    if (!existsSync(src)) {
      console.warn(`  ⚠ ${publishedName}: declared files entry "${entry}" missing in ${pkgRoot}`);
      continue;
    }
    cpSync(src, join(stagingDir, entry), { recursive: true });
  }

  // For @oneui/ui: rewriteRootEntryToPublicBarrel repointed the root export
  // (`.`, main, module, types) at dist/index.public.*. If the build never
  // emitted those files (e.g. a TypeScript error in index.public.ts, or the
  // extra Vite entry was dropped), the published tarball would ship a broken
  // root import — and, worse, a root that no longer gates WIP components.
  // Fail the stage loudly rather than publish a silently broken artifact.
  if (pkg.sourceName === '@oneui/ui') {
    const required = ['index.public.mjs', 'index.public.cjs', 'index.public.d.ts'];
    const missing = required.filter((f) => !existsSync(join(stagingDir, 'dist', f)));
    if (missing.length > 0) {
      throw new Error(
        `[stage] ${publishedName}: root export points at dist/index.public.* but `
        + `${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} missing from the build. `
        + 'Build @oneui/ui (Vite must emit the index.public entry) before staging.',
      );
    }
    assertUiBrandLoaderArtifacts(stagingDir, publishedName);
  }

  // Copy README and LICENSE if present (npm pack would have included them
  // automatically but we're packing from a staging dir, not the source).
  for (const aux of ['README.md', 'LICENSE', 'LICENSE.md']) {
    const auxSrc = join(pkgRoot, aux);
    if (existsSync(auxSrc)) cpSync(auxSrc, join(stagingDir, aux));
  }

  // Defensive: extraFiles is for things outside the package.json `files`
  // declaration. Today these should already be covered by `files`, but
  // the field exists so we can stage assets that don't belong in npm pack's
  // default capture.
  for (const extra of pkg.extraFiles) {
    if (filesToCopy.includes(extra)) continue;
    const src = join(pkgRoot, extra);
    if (!existsSync(src)) continue;
    cpSync(src, join(stagingDir, extra), { recursive: true });
  }

  writeFileSync(
    join(stagingDir, 'package.json'),
    `${JSON.stringify(staged, null, 2)}\n`,
  );

  // Rewrite `from '@oneui/*'` import strings in compiled output to the
  // mapped `@jds4/*` names. Required for any package whose build externalizes
  // a workspace dep (e.g. icons-jio externalizes @oneui/ui and uses
  // setJioIconLoader at runtime). Idempotent for packages that have no
  // external workspace deps in their dist.
  rewriteImportsInStagingDir(stagingDir, pkg);

  // For bundled workspace deps (those whose source modules were inlined by
  // vite preserveModules into `dist/packages/<pkg>/src/`): emit matching
  // `.d.ts` declarations alongside the .mjs/.cjs files, then rewrite leaked
  // `(../)+<pkg>/src` import paths in dist/**.d.ts to point at those staged
  // declarations. Without these two steps the published types are broken
  // for any consumer running `skipLibCheck: false`.
  emitBundledDtsViaTsc(stagingDir, repoRoot, pkg);
  rewriteDtsRelativeToBundledPackages(stagingDir, pkg);

  // Hard gate: fail the build if any .d.ts under dist/ still references a
  // bare workspace specifier or escapes the dist/ root. This catches future
  // regressions (e.g. someone adds `import type { X } from '@oneui/tokens'`
  // inside shared) at build time instead of at customer install time.
  assertNoLeakedWorkspaceRefs(stagingDir, pkg);

  // Use `npm pack` (not `pnpm pack`) — pnpm pack ignores `workspace:*`
  // resolution rules but also handles edge cases that npm doesn't; npm is
  // more predictable for our pre-rewritten manifests.
  const tarballsDir = join(releaseDir, 'tarballs');
  mkdirSync(tarballsDir, { recursive: true });
  execSync('npm pack --silent', { cwd: stagingDir, stdio: ['ignore', 'pipe', 'inherit'] });

  // npm pack writes <scope>-<slug>-<version>.tgz into cwd
  const produced = readdirSync(stagingDir).find((f) => f.endsWith('.tgz'));
  if (!produced) {
    throw new Error(`[stage] ${publishedName}: npm pack did not produce a tarball in ${stagingDir}`);
  }
  const finalPath = join(tarballsDir, produced);
  renameSync(join(stagingDir, produced), finalPath);

  return {
    publishedName,
    version: staged.version,
    tarballPath: finalPath,
    bytes: statSync(finalPath).size,
    sha256: sha256Truncated(finalPath),
  };
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export function printSummary(staged: StagedTarball[]): void {
  if (staged.length === 0) {
    console.log('\n(no tarballs produced)');
    return;
  }
  const nameWidth = Math.max(...staged.map((s) => s.publishedName.length));
  const versionWidth = Math.max(...staged.map((s) => s.version.length));
  console.log('\n→ Release artefacts:');
  for (const s of staged) {
    console.log(
      `   ${s.publishedName.padEnd(nameWidth)}  ${s.version.padEnd(versionWidth)}  `
      + `${formatBytes(s.bytes).padStart(10)}  sha256:${s.sha256}`,
    );
  }
  console.log(`\n→ ${staged.length} tarball(s) at ${resolve(staged[0].tarballPath, '..')}/`);
}
