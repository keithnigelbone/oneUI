#!/usr/bin/env node
/**
 * check-jio-alpha-catalog.ts
 *
 * Verifies that the Jio web alpha catalog stays aligned with component
 * artifacts used by docs, Storybook, and AI tooling.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COMPONENT_META_REGISTRY } from '../packages/ui/src/registry/metaRegistry';
import {
  JIO_WEB_ALPHA_COMPONENTS,
  JIO_WEB_ALPHA_COMPONENT_NAMES,
} from '../packages/ui/src/registry/jioAlphaCatalog';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');
const COMPONENT_REGISTRY_PATH = resolve(
  REPO_ROOT,
  'packages/ui/src/registry/componentRegistry.ts',
);

function pathExists(relativePath: string): boolean {
  return existsSync(resolve(REPO_ROOT, relativePath));
}

function loadSlugMapSource(): string {
  return readFileSync(COMPONENT_REGISTRY_PATH, 'utf8');
}

function hasSlugEntry(source: string, name: string, slug: string): boolean {
  return source.includes(`'${slug}': '${name}'`);
}

function toFolderFromImportPath(importPath: string): string {
  return importPath.split('/').pop() ?? importPath;
}

function main(): number {
  const errors: string[] = [];
  const names = new Set<string>();
  const slugSource = loadSlugMapSource();

  for (const name of JIO_WEB_ALPHA_COMPONENT_NAMES) {
    if (names.has(name)) {
      errors.push(`Duplicate alpha catalog entry: ${name}`);
    }
    names.add(name);
  }

  for (const entry of JIO_WEB_ALPHA_COMPONENTS) {
    const meta = COMPONENT_META_REGISTRY[entry.name];

    if (!meta) {
      errors.push(`${entry.name}: missing COMPONENT_META_REGISTRY entry`);
    }

    if (!entry.importPath) {
      errors.push(`${entry.name}: missing importPath`);
    } else {
      const folder = toFolderFromImportPath(entry.importPath);
      const sourceIndex = `packages/ui/src/components/${folder}/index.ts`;
      if (!pathExists(sourceIndex)) {
        errors.push(`${entry.name}: importPath points to missing ${sourceIndex}`);
      }
    }

    if (!entry.storyPath || !pathExists(entry.storyPath)) {
      errors.push(`${entry.name}: missing Storybook story at ${entry.storyPath ?? '(unset)'}`);
    }

    if (!entry.docsPath || !pathExists(entry.docsPath)) {
      errors.push(`${entry.name}: missing generated docs at ${entry.docsPath ?? '(unset)'}`);
    }

    if (meta && !hasSlugEntry(slugSource, entry.name, meta.slug)) {
      errors.push(`${entry.name}: missing slug map entry for '${meta.slug}'`);
    }

    if (meta && meta.surfaceAware !== entry.surfaceAware) {
      errors.push(
        `${entry.name}: catalog surfaceAware=${entry.surfaceAware} but meta surfaceAware=${meta.surfaceAware}`,
      );
    }

    if (meta && meta.multiAccent !== entry.multiAccent) {
      errors.push(
        `${entry.name}: catalog multiAccent=${entry.multiAccent} but meta multiAccent=${meta.multiAccent}`,
      );
    }
  }

  if (errors.length > 0) {
    console.error(`check:jio-alpha-catalog: FAIL — ${errors.length} issue(s)\n`);
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    return 1;
  }

  console.log(
    `check:jio-alpha-catalog: OK — ${JIO_WEB_ALPHA_COMPONENTS.length} alpha component(s) aligned.`,
  );
  return 0;
}

process.exit(main());
