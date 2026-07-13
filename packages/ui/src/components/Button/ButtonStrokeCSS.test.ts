// @vitest-environment node

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('Button stroke CSS', () => {
  it('draws material image strokes on the same edge as the Button stroke width', () => {
    const css = readFileSync(resolve(__dirname, 'Button.module.css'), 'utf8');
    const buttonBlock = css.match(/\.button\s\{[\s\S]*?\n\}/)?.[0] ?? '';
    const beforeBlock = css.match(/\.button::before\s\{[\s\S]*?\n\}/)?.[0] ?? '';

    expect(buttonBlock).toContain('box-sizing: border-box');
    expect(beforeBlock).toContain('inset: var(--Spacing-0)');
    expect(beforeBlock).toContain('padding: var(--_btn-bw, var(--Spacing-0))');
  });

  it('keeps variant stroke width out of layout so state changes do not shift buttons', () => {
    const css = readFileSync(resolve(__dirname, 'Button.module.css'), 'utf8');
    const boldBlock = css.match(/\.bold\s\{[\s\S]*?\n\}/)?.[0] ?? '';
    const subtleBlock = css.match(/\.subtle\s\{[\s\S]*?\n\}/)?.[0] ?? '';
    const ghostBlock = css.match(/\.ghost\s\{[\s\S]*?\n\}/)?.[0] ?? '';

    expect(boldBlock).toContain('border: 0 solid transparent');
    expect(subtleBlock).toContain('border: 0 solid transparent');
    expect(ghostBlock).toContain('border: 0 solid transparent');
    expect(ghostBlock).toContain('border-left-width: var(--Spacing-0)');
    expect(ghostBlock).toContain('border-right-width: var(--Spacing-0)');
  });

  it('state selectors can suppress CSS-only decoration strokes', () => {
    const css = readFileSync(resolve(__dirname, 'Button.module.css'), 'utf8');
    const hoverBlock = css.match(/\.bold:hover:not\(\.disabled\),[\s\S]*?\n\}/)?.[0] ?? '';
    const pressedBlock = css.match(/\.bold:active:not\(\.disabled\),[\s\S]*?\n\}/)?.[0] ?? '';

    expect(hoverBlock).toContain('--Button-cssDecorationInsetStrokeWidth-bold-hover');
    expect(hoverBlock).toContain('--Button-cssDecorationUnderlineWidth-bold-hover');
    expect(pressedBlock).toContain('--Button-cssDecorationInsetStrokeWidth-bold-pressed');
    expect(pressedBlock).toContain('--Button-cssDecorationUnderlineWidth-bold-pressed');
  });
});
