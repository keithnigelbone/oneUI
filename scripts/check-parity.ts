#!/usr/bin/env node
/**
 * Quality Gate: Web ↔ React Native Parity
 *
 * Verifies that:
 * 1. Both platforms implement the same set of components (file presence).
 * 2. Native implementations import prop types from the shared module
 *    (`@oneui/ui/components/<Name>/shared` or `<Name>.shared`).
 * 3. Every type name imported from that shared specifier is actually
 *    exported by the shared file — catches prop union drift between platforms.
 *
 * Uses ts-morph for AST-based import parsing (no regex heuristics).
 *
 * Usage: pnpm check:parity
 */

import { globSync } from 'glob';
import { existsSync } from 'fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project } from 'ts-morph';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');

interface ParityCheck {
  component: string;
  webExists: boolean;
  nativeExists: boolean;
  webFile?: string;
  nativeFile?: string;
  match: boolean;
}

interface SharedImportIssue {
  component: string;
  nativeFile: string;
  kind: 'missing-shared-import' | 'unknown-export';
  detail: string;
}

function getComponentDir(filePath: string): string {
  const parts = filePath.replace(/\\/g, '/').split('/');
  return parts[parts.length - 2];
}

function checkFilePresence(): ParityCheck[] {
  const webComponents = new Map<string, string>();
  const nativeComponents = new Map<string, string>();

  const webFiles = globSync('packages/ui/src/components/*/*.tsx', { cwd: REPO_ROOT });
  webFiles.forEach((file) => {
    if (file.includes('.stories.') || file.includes('.test.')) return;
    const dir = getComponentDir(file);
    webComponents.set(dir, file);
  });

  const nativeFiles = globSync('packages/ui-native/src/components/*/*.native.tsx', { cwd: REPO_ROOT });
  nativeFiles.forEach((file) => {
    const dir = getComponentDir(file);
    nativeComponents.set(dir, file);
  });

  const results: ParityCheck[] = [];
  const allComponents = new Set([...webComponents.keys(), ...nativeComponents.keys()]);

  allComponents.forEach((component) => {
    const webExists = webComponents.has(component);
    const nativeExists = nativeComponents.has(component);
    results.push({
      component,
      webExists,
      nativeExists,
      webFile: webComponents.get(component),
      nativeFile: nativeComponents.get(component),
      match: webExists && nativeExists,
    });
  });

  return results;
}

function sharedSpecifiers(componentDir: string): string[] {
  return [
    `@oneui/ui/components/${componentDir}/shared`,
    `@oneui/ui/components/${componentDir}/${componentDir}.shared`,
  ];
}

function resolveSharedFilePath(componentDir: string): string | null {
  const candidates = [
    resolve(REPO_ROOT, `packages/ui/src/components/${componentDir}/${componentDir}.shared.ts`),
    resolve(REPO_ROOT, `packages/ui/src/components/${componentDir}/index.shared.ts`),
    resolve(REPO_ROOT, `packages/ui/src/components/${componentDir}/shared.ts`),
  ];
  return candidates.find((p) => existsSync(p)) ?? null;
}

function checkSharedImports(
  parityResults: ParityCheck[],
  project: Project,
): SharedImportIssue[] {
  const issues: SharedImportIssue[] = [];

  for (const result of parityResults) {
    if (!result.match) continue;
    if (!result.nativeFile || !result.webFile) continue;

    const componentDir = result.component;
    const acceptedSpecifiers = sharedSpecifiers(componentDir);
    const nativeFilePath = resolve(REPO_ROOT, result.nativeFile);

    const nativeSF = project.addSourceFileAtPathIfExists(nativeFilePath);
    if (!nativeSF) continue;

    const sharedImports = nativeSF.getImportDeclarations().filter((imp) => {
      const spec = imp.getModuleSpecifierValue();
      return acceptedSpecifiers.includes(spec);
    });

    if (sharedImports.length === 0) {
      issues.push({
        component: componentDir,
        nativeFile: result.nativeFile,
        kind: 'missing-shared-import',
        detail:
          `No import from shared module. Expected one of:\n` +
          acceptedSpecifiers.map((s) => `    "${s}"`).join('\n'),
      });
      continue;
    }

    const sharedFilePath = resolveSharedFilePath(componentDir);
    if (!sharedFilePath) continue;

    const sharedSF = project.addSourceFileAtPathIfExists(sharedFilePath);
    if (!sharedSF) continue;

    const sharedExports = new Set<string>();
    sharedSF.getExportedDeclarations().forEach((_, name) => {
      sharedExports.add(name);
    });
    // index.shared.ts re-exports — also walk its own `export { … } from` chains
    sharedSF.getExportDeclarations().forEach((decl) => {
      decl.getNamedExports().forEach((named) => {
        sharedExports.add(named.getName());
      });
    });

    for (const imp of sharedImports) {
      const namedImports = imp.getNamedImports();
      for (const ni of namedImports) {
        const importedName = ni.getName();
        if (!sharedExports.has(importedName)) {
          issues.push({
            component: componentDir,
            nativeFile: result.nativeFile,
            kind: 'unknown-export',
            detail:
              `"${importedName}" is imported from "${imp.getModuleSpecifierValue()}" ` +
              `but is NOT exported by the shared file.\n` +
              `    Shared file: ${sharedFilePath.replace(REPO_ROOT + '/', '')}`,
          });
        }
      }
    }
  }

  return issues;
}

function main() {
  const presenceResults = checkFilePresence();
  const presenceMismatches = presenceResults.filter((r) => !r.match);

  const project = new Project({
    tsConfigFilePath: resolve(REPO_ROOT, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
    skipFileDependencyResolution: true,
  });

  const sharedIssues = checkSharedImports(presenceResults, project);

  const webCount = presenceResults.filter((r) => r.webExists).length;
  const nativeCount = presenceResults.filter((r) => r.nativeExists).length;
  const bothCount = presenceResults.filter((r) => r.match).length;

  console.log('Platform Parity Check\n');
  console.log(`  Total component directories scanned : ${presenceResults.length}`);
  console.log(`  Web implementations                 : ${webCount}`);
  console.log(`  Native implementations              : ${nativeCount}`);
  console.log(`  Both platforms present              : ${bothCount}`);

  const totalIssues = presenceMismatches.length + sharedIssues.length;

  if (totalIssues === 0) {
    console.log('\nPlatform parity check PASSED');
    return;
  }

  console.error(`\nPlatform parity check FAILED — ${totalIssues} issue(s) found\n`);

  if (presenceMismatches.length > 0) {
    console.error('--- File-presence mismatches ---\n');
    presenceMismatches.forEach((m) => {
      if (!m.webExists) {
        console.error(`  MISSING WEB    ${m.component}`);
        console.error(`    Expected: packages/ui/src/components/${m.component}/${m.component}.tsx`);
      } else {
        console.error(`  MISSING NATIVE ${m.component}`);
        console.error(`    Expected: packages/ui-native/src/components/${m.component}/${m.component}.native.tsx`);
      }
    });
  }

  if (sharedIssues.length > 0) {
    console.error('\n--- Shared-type import issues ---\n');
    sharedIssues.forEach((issue) => {
      console.error(`  ${issue.kind === 'missing-shared-import' ? 'MISSING SHARED IMPORT' : 'UNKNOWN EXPORT'}  ${issue.component}`);
      console.error(`    File: ${issue.nativeFile}`);
      console.error(`    ${issue.detail}\n`);
    });
  }

  console.error('Fix: Native files must import prop types from the shared module so');
  console.error('     prop unions stay in sync across platforms.');

  process.exit(1);
}

main();
