#!/usr/bin/env node
/**
 * Flutter parity slice — verifies Input family widgets, exports, and Storybook stories.
 *
 * Usage: pnpm check:parity:flutter
 */

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const FLUTTER = resolve(REPO_ROOT, 'packages/ui_flutter');

interface Check {
  id: string;
  ok: boolean;
  detail: string;
}

function mustExistAt(fullPath: string, label: string): Check {
  const ok = existsSync(fullPath);
  return {
    id: label,
    ok,
    detail: ok ? 'present' : `missing file: ${label}`,
  };
}

function mustExist(relPath: string): Check {
  return mustExistAt(resolve(FLUTTER, relPath), relPath);
}

function fileIncludes(relPath: string, needle: string, label: string): Check {
  const full = resolve(FLUTTER, relPath);
  if (!existsSync(full)) {
    return { id: label, ok: false, detail: `missing ${relPath}` };
  }
  const text = readFileSync(full, 'utf8');
  const ok = text.includes(needle);
  return {
    id: label,
    ok,
    detail: ok ? `found "${needle}"` : `expected "${needle}" in ${relPath}`,
  };
}

function main() {
  const checks: Check[] = [
    mustExist('lib/widgets/one_ui_input.dart'),
    mustExist('lib/widgets/one_ui_input_feedback.dart'),
    mustExist('lib/widgets/one_ui_input_dynamic_text.dart'),
    mustExist('lib/engine/input_feedback_resolve.dart'),
    mustExist('lib/foundations/input_field_showcase.dart'),
    mustExistAt(resolve(REPO_ROOT, 'docs/parity/input-flutter-parity.md'), 'docs/parity/input-flutter-parity.md'),

    fileIncludes('lib/ui_flutter.dart', 'one_ui_input.dart', 'export OneUiInput'),
    fileIncludes('lib/ui_flutter.dart', 'one_ui_input_feedback.dart', 'export OneUiInputFeedback'),
    fileIncludes('lib/ui_flutter.dart', 'one_ui_input_dynamic_text.dart', 'export OneUiInputDynamicText'),

    fileIncludes('lib/widgets/one_ui_input_feedback.dart', 'SemanticsRole.alert', 'feedback alert role'),
    fileIncludes('lib/widgets/one_ui_input_feedback.dart', 'iconSizePx', 'feedback iconSizePx'),
    fileIncludes('lib/widgets/one_ui_input.dart', 'validationResult', 'input validationResult'),
    fileIncludes('lib/widgets/one_ui_input.dart', 'controlsNodes', 'input controlsNodes'),
    fileIncludes('lib/widgets/one_ui_aria_described_by.dart', 'composeOneUiAriaDescribedBy', 'compose describedBy'),
    fileIncludes('lib/widgets/one_ui_input_field_a11y.dart', 'resolveOneUiInputFieldDescribedBy', 'field describedBy'),
    fileIncludes('lib/widgets/one_ui_web_aria_described_by.dart', 'OneUiWebAriaDescribedByBinder', 'web describedBy binder'),
    fileIncludes('lib/widgets/one_ui_input_a11y.dart', 'oneUiParseAriaDescribedByNodeIds', 'describedBy parser'),

    fileIncludes('lib/foundations/input_story_catalog.dart', 'fullComposition', 'story fullComposition'),
    fileIncludes('lib/foundations/input_story_catalog.dart', 'search', 'story search'),
    fileIncludes('lib/foundations/input_story_catalog.dart', 'inputSurfaceContext', 'story inputSurfaceContext'),
    fileIncludes('lib/foundations/input_internals_story_catalog.dart', 'surfaceContext', 'internals surfaceContext'),

    fileIncludes('lib/widgets/one_ui_input_types.dart', 'OneUiInputSize.xs', 'xs size tier'),
    fileIncludes('lib/engine/input_size_resolve.dart', '6:', 'f6 input metrics'),
  ];

  const failed = checks.filter((c) => !c.ok);

  console.log('Flutter Input parity slice\n');
  console.log(`  Checks run : ${checks.length}`);
  console.log(`  Passed     : ${checks.length - failed.length}`);

  if (failed.length === 0) {
    console.log('\nFlutter parity slice PASSED');
    return;
  }

  console.error(`\nFlutter parity slice FAILED — ${failed.length} issue(s)\n`);
  for (const f of failed) {
    console.error(`  ✗ ${f.id}`);
    console.error(`    ${f.detail}`);
  }
  process.exit(1);
}

main();
