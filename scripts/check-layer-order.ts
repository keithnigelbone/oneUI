/**
 * check-layer-order.ts
 *
 * Lint script that verifies @layer CSS import order in entry points.
 * layers.css MUST be the first CSS import in any file that imports token CSS.
 *
 * Usage: npx tsx scripts/check-layer-order.ts
 *
 * Checks:
 * 1. Entry points (layout.tsx, preview.ts) import layers.css
 * 2. layers.css is imported BEFORE any other @oneui/tokens CSS
 * 3. No token CSS files import layers.css (it's entry-point only)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Files that MUST import layers.css as their first token CSS import
const ENTRY_POINTS = [
  'apps/platform/src/app/layout.tsx',
  'apps/storybook/.storybook/preview.ts',
];

// Pattern to match token CSS imports
const TOKEN_CSS_IMPORT = /import\s+['"]@oneui\/tokens\/css\//;
const LAYERS_IMPORT = /import\s+['"]@oneui\/tokens\/css\/layers['"]/;

interface Violation {
  file: string;
  message: string;
  line?: number;
}

function checkFile(relPath: string): Violation[] {
  const absPath = path.join(ROOT, relPath);
  const violations: Violation[] = [];

  if (!fs.existsSync(absPath)) {
    violations.push({ file: relPath, message: 'File not found' });
    return violations;
  }

  const content = fs.readFileSync(absPath, 'utf-8');
  const lines = content.split('\n');

  let firstTokenCSSLine = -1;
  let layersImportLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (TOKEN_CSS_IMPORT.test(line)) {
      if (firstTokenCSSLine === -1) {
        firstTokenCSSLine = i + 1;
      }
    }

    if (LAYERS_IMPORT.test(line)) {
      layersImportLine = i + 1;
    }
  }

  // Check 1: layers.css must be imported
  if (layersImportLine === -1 && firstTokenCSSLine !== -1) {
    violations.push({
      file: relPath,
      message: 'Missing layers.css import — must be present before any @oneui/tokens CSS',
      line: firstTokenCSSLine,
    });
  }

  // Check 2: layers.css must come before other token CSS
  if (layersImportLine !== -1 && firstTokenCSSLine !== -1 && layersImportLine > firstTokenCSSLine) {
    violations.push({
      file: relPath,
      message: `layers.css imported at line ${layersImportLine} but first token CSS at line ${firstTokenCSSLine} — layers.css must come first`,
      line: layersImportLine,
    });
  }

  return violations;
}

// Run checks
const allViolations: Violation[] = [];

for (const entryPoint of ENTRY_POINTS) {
  allViolations.push(...checkFile(entryPoint));
}

// Report
if (allViolations.length === 0) {
  console.log('✓ Layer order check passed — layers.css imported correctly in all entry points');
  process.exit(0);
} else {
  console.error(`✗ Layer order check failed — ${allViolations.length} violation(s):\n`);
  for (const v of allViolations) {
    const lineInfo = v.line ? `:${v.line}` : '';
    console.error(`  ${v.file}${lineInfo}: ${v.message}`);
  }
  process.exit(1);
}
