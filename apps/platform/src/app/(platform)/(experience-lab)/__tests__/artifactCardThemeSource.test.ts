import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Experience Lab artifact loading theme wiring', () => {
  it('uses solid primary Surface context and root-only fill tokens for the loader', () => {
    const shapeSource = readFileSync(
      join(__dirname, '../_canvas/shapes/ArtifactCardShape.tsx'),
      'utf8'
    );
    const cssSource = readFileSync(
      join(__dirname, '../_canvas/shapes/ArtifactCardShape.module.css'),
      'utf8'
    );

    expect(shapeSource).toContain('mode="subtle"');
    expect(shapeSource).toContain('material="solid"');
    expect(shapeSource).toContain('appearance="primary"');
    expect(shapeSource).toContain(
      "appearance={status === 'preview-error' ? 'negative' : 'primary'}"
    );
    expect(shapeSource).not.toContain("'--Surface-Self-Color'");

    expect(cssSource).toContain('--Primary-Fill-Subtle');
    expect(cssSource).toContain('--Primary-Fill-Bold');
    expect(cssSource).toContain('--Secondary-Fill-Bold');
    expect(cssSource).toContain('--Sparkle-Fill-Bold');
    expect(cssSource).not.toContain('--_ai-dot-active: var(--Primary-Bold');
    expect(cssSource).not.toContain('--_ai-dot-rest: var(--Primary-Subtle');
  });

  it('keeps long canvas card content scrollable inside tldraw', () => {
    const chromeSource = readFileSync(join(__dirname, '../_canvas/shapes/cardChrome.ts'), 'utf8');
    const artifactSource = readFileSync(
      join(__dirname, '../_canvas/shapes/ArtifactCardShape.tsx'),
      'utf8'
    );
    const foundationSource = readFileSync(
      join(__dirname, '../_canvas/shapes/FoundationProfileCardShape.tsx'),
      'utf8'
    );

    expect(chromeSource).toContain("overflow: 'auto'");
    expect(chromeSource).toContain("overscrollBehavior: 'contain'");
    expect(chromeSource).toContain('stopCanvasWheel');
    expect(artifactSource).toContain('onWheel={stopCanvasWheel}');
    expect(foundationSource).toContain('onWheel={stopCanvasWheel}');
  });
});
