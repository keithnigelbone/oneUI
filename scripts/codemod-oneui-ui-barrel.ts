/**
 * codemod-oneui-ui-barrel.ts
 *
 * Rewrites every `from '@oneui/ui'` import statement in the monorepo into a
 * path-based import matching the export's origin inside `packages/ui/src/index.ts`.
 *
 * Motivation: the `@oneui/ui` barrel is 998 lines / 152 exports, which forces
 * `next.config.js` to keep `experimental.optimizePackageImports` disabled —
 * barrel analysis OOMs Vercel's 8GB builder. Path-based imports let Turbopack /
 * SWC tree-shake at the file level and re-enable the optimization.
 *
 * Run: `pnpm exec tsx scripts/codemod-oneui-ui-barrel.ts [--check] [--dry]`
 *   --check  exit code 1 if any `@oneui/ui` barrel import remains.
 *   --dry    print the changes but do not save files.
 */

import { Project, ImportDeclaration, QuoteKind } from 'ts-morph';
import * as path from 'node:path';
import { execSync } from 'node:child_process';

const repoRoot = path.resolve(__dirname, '..');
const barrelPath = path.resolve(repoRoot, 'packages/ui/src/index.ts');

interface ExportOrigin {
  /** Subpath-style import target, e.g. `@oneui/ui/components/Button`. */
  importPath: string;
}

type ExportMap = Map<string, ExportOrigin>;

/**
 * Convert a relative specifier found inside the barrel (e.g. `./components/Button`)
 * into a public subpath import that `packages/ui/package.json` exposes.
 */
function barrelSpecifierToPublicSubpath(specifier: string): string | null {
  if (!specifier.startsWith('./')) return null;
  const trimmed = specifier.slice(2);
  if (trimmed.startsWith('components/')) {
    const parts = trimmed.split('/');
    if (parts.length === 2) {
      return `@oneui/ui/${parts[0]}/${parts[1]}`;
    }
    if (parts[1] === 'Foundations' && parts.length === 3) {
      return `@oneui/ui/components/Foundations/${parts[2]}`;
    }
    if (parts[1] === 'Brand' && parts.length === 3) {
      return `@oneui/ui/components/Brand/${parts[2]}`;
    }
    if (parts[1] === 'ComponentTokenEditor' && parts.length >= 3 && parts[2] === 'utils') {
      return `@oneui/ui/components/ComponentTokenEditor/utils/${parts.slice(3).join('/')}`;
    }
    return `@oneui/ui/components/${parts[1]}`;
  }
  if (trimmed.startsWith('hooks/')) return `@oneui/ui/${trimmed}`;
  if (trimmed.startsWith('utils/')) return `@oneui/ui/${trimmed}`;
  if (trimmed.startsWith('registry/')) return `@oneui/ui/${trimmed}`;
  if (trimmed.startsWith('icons/')) return `@oneui/ui/${trimmed}`;
  if (trimmed.startsWith('contexts/')) return `@oneui/ui/${trimmed}`;
  if (trimmed === 'engine' || trimmed.startsWith('engine/')) return `@oneui/ui/${trimmed}`;
  if (trimmed === 'runtime' || trimmed.startsWith('runtime/')) return `@oneui/ui/${trimmed}`;
  return null;
}

function buildExportMap(project: Project): ExportMap {
  const map: ExportMap = new Map();
  const barrel = project.getSourceFileOrThrow(barrelPath);

  for (const decl of barrel.getExportDeclarations()) {
    const moduleSpecifier = decl.getModuleSpecifierValue();
    if (!moduleSpecifier) continue;
    let importPath: string | null;
    if (moduleSpecifier === '@oneui/shared') {
      importPath = '@oneui/shared';
    } else {
      importPath = barrelSpecifierToPublicSubpath(moduleSpecifier);
    }
    if (!importPath) continue;
    for (const spec of decl.getNamedExports()) {
      const alias = spec.getAliasNode()?.getText() ?? spec.getName();
      map.set(alias, { importPath });
    }
  }

  return map;
}

interface RewriteOutcome {
  filesChanged: number;
  importsRewritten: number;
  unresolved: Array<{ file: string; specifier: string }>;
}

function rewriteImportsIn(
  project: Project,
  exportMap: ExportMap,
  candidatePaths: string[],
  saveAfter: boolean,
): RewriteOutcome {
  const outcome: RewriteOutcome = { filesChanged: 0, importsRewritten: 0, unresolved: [] };

  for (const filePath of candidatePaths) {
    if (filePath === barrelPath) continue;
    const sourceFile = project.getSourceFile(filePath);
    if (!sourceFile) continue;

    const barrelImports = sourceFile
      .getImportDeclarations()
      .filter((d) => d.getModuleSpecifierValue() === '@oneui/ui');

    if (barrelImports.length === 0) continue;

    let changedThisFile = false;

    for (const imp of barrelImports) {
      const rewrite = rewriteOne(imp, exportMap);
      if (rewrite.kind === 'rewritten') {
        outcome.importsRewritten += rewrite.newImports;
        changedThisFile = true;
      } else if (rewrite.kind === 'unresolved') {
        outcome.unresolved.push({ file: filePath, specifier: rewrite.specifier });
      }
    }

    if (changedThisFile) outcome.filesChanged += 1;
  }

  if (saveAfter) project.saveSync();

  return outcome;
}

type RewriteResult =
  | { kind: 'rewritten'; newImports: number }
  | { kind: 'unresolved'; specifier: string }
  | { kind: 'noop' };

function rewriteOne(imp: ImportDeclaration, exportMap: ExportMap): RewriteResult {
  const named = imp.getNamedImports();
  const defaultImport = imp.getDefaultImport();
  const namespaceImport = imp.getNamespaceImport();
  const isTypeOnly = imp.isTypeOnly();

  if (defaultImport || namespaceImport || named.length === 0) {
    return { kind: 'unresolved', specifier: imp.getText() };
  }

  const groups = new Map<string, Array<{ name: string; alias?: string; isTypeOnly: boolean }>>();
  for (const spec of named) {
    const name = spec.getNameNode().getText();
    const alias = spec.getAliasNode()?.getText();
    const origin = exportMap.get(alias ?? name);
    if (!origin) {
      return { kind: 'unresolved', specifier: name };
    }
    const arr = groups.get(origin.importPath) ?? [];
    arr.push({ name, alias, isTypeOnly: spec.isTypeOnly() });
    groups.set(origin.importPath, arr);
  }

  const sourceFile = imp.getSourceFile();
  const sortedGroups = Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));

  // Mutate the original import in-place with the FIRST group's data so that
  // any leading trivia (docblocks, line comments) attached to the original
  // import statement is preserved. Then insert the remaining groups
  // immediately after, so they cluster together.
  const [firstPath, firstSpecs] = sortedGroups[0];
  imp.removeNamedImports();
  imp.setModuleSpecifier(firstPath);
  imp.addNamedImports(
    firstSpecs.map((s) => ({ name: s.name, alias: s.alias, isTypeOnly: s.isTypeOnly })),
  );

  let inserted = 0;
  const impIndex = imp.getChildIndex();
  for (let i = 1; i < sortedGroups.length; i++) {
    const [importPath, specs] = sortedGroups[i];
    sourceFile.insertImportDeclaration(impIndex + 1 + inserted, {
      moduleSpecifier: importPath,
      isTypeOnly,
      namedImports: specs.map((s) => ({ name: s.name, alias: s.alias, isTypeOnly: s.isTypeOnly })),
    });
    inserted += 1;
  }

  return { kind: 'rewritten', newImports: sortedGroups.length };
}

/** Find candidate files containing `from '@oneui/ui'` literally. Uses git
 * grep — fast, available everywhere, respects .gitignore. */
function findCandidateFiles(): string[] {
  try {
    const out = execSync(
      `git -C "${repoRoot}" grep -l --untracked --extended-regexp "from ['\\"]@oneui/ui['\\"]" -- '*.ts' '*.tsx' ':(exclude)**/node_modules/**' ':(exclude)**/dist/**' ':(exclude)**/.next/**' ':(exclude)**/generated/**'`,
      { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 },
    );
    return out
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((rel) => path.resolve(repoRoot, rel));
  } catch (e: any) {
    // git-grep exits 1 when no matches found.
    if (e.status === 1) return [];
    throw e;
  }
}

function main() {
  const args = new Set(process.argv.slice(2));
  const check = args.has('--check');
  const dry = args.has('--dry');

  const candidates = findCandidateFiles();
  console.log(`[codemod] candidates: ${candidates.length} files`);

  if (candidates.length === 0) {
    console.log('[codemod] no `@oneui/ui` barrel imports found — nothing to do.');
    return;
  }

  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      jsx: 4 as any /* preserve */,
      allowJs: false,
    },
    manipulationSettings: {
      quoteKind: QuoteKind.Single,
    },
  });

  project.addSourceFileAtPath(barrelPath);
  for (const c of candidates) project.addSourceFileAtPath(c);

  const exportMap = buildExportMap(project);
  if (exportMap.size === 0) {
    console.error('No exports discovered in @oneui/ui barrel — aborting.');
    process.exit(2);
  }

  const outcome = rewriteImportsIn(project, exportMap, candidates, !check && !dry);

  if (outcome.unresolved.length > 0) {
    console.error('Unresolved imports (please fix manually):');
    for (const u of outcome.unresolved) console.error(`  ${u.file}: ${u.specifier}`);
  }

  console.log(
    `[codemod] files changed: ${outcome.filesChanged}, imports rewritten: ${outcome.importsRewritten}` +
      (dry ? ' (dry run — no files saved)' : '') +
      (check ? ' (check mode)' : ''),
  );

  if (check && outcome.filesChanged > 0) {
    console.error('Barrel imports still present — run `pnpm codemod:oneui-barrel` to fix.');
    process.exit(1);
  }
  if (outcome.unresolved.length > 0 && !dry) process.exit(3);
}

if (require.main === module) {
  main();
}

export { buildExportMap, rewriteImportsIn };
