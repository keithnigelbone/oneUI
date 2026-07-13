import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { exportCode } from './code';

describe('exportCode (EXP-01 / D-12)', () => {
  it('returns the EXACT persisted code string verbatim (no transformation)', () => {
    const tsx = [
      "import { Button } from '@oneui/ui';",
      'export default function Artifact() {',
      '  return <Button variant="bold">Buy now</Button>;',
      '}',
    ].join('\n');
    const css = ':root { --Primary-Bold: oklch(0.6 0.2 250); }';

    const out = exportCode({ compiledBundle: { code: tsx }, css });

    // Verbatim — the output contains the input code exactly.
    expect(out.code).toBe(tsx);
    expect(out.code).toContain("import { Button } from '@oneui/ui';");
    expect(out.css).toBe(css);
  });

  it('bundles the resolved Jio CSS alongside the persisted code', () => {
    const out = exportCode({
      compiledBundle: { code: 'export default () => null;' },
      css: '.x { color: var(--Text-High); }',
    });
    expect(out.code).toBe('export default () => null;');
    expect(out.css).toBe('.x { color: var(--Text-High); }');
  });

  it('ignores compile metadata (it is opaque to the emitter)', () => {
    const out = exportCode({
      compiledBundle: { code: 'const a = 1;', meta: { compiledAt: 123 } },
      css: '',
    });
    expect(out.code).toBe('const a = 1;');
    expect(out.css).toBe('');
  });

  it('never re-generates: code.ts imports no compiler/generator', () => {
    // D-12: code export is a READ of the persisted bundle, never a re-run of the
    // generator/compiler. Assert the source file imports none of them.
    const src = readFileSync(
      fileURLToPath(new URL('./code.ts', import.meta.url)),
      'utf8',
    );
    // Strip line + block comments so the rule prose ("no re-generation") doesn't
    // trip the assertion — only real import statements are checked.
    const codeOnly = src
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    expect(codeOnly).not.toMatch(/from\s+['"][^'"]*compiler/);
    expect(codeOnly).not.toMatch(/from\s+['"][^'"]*irGenerator/);
    expect(codeOnly).not.toMatch(/experience-builder-agents/);
    expect(codeOnly).not.toMatch(/\bgenerate[A-Z]\w*\s*\(/);
  });
});
