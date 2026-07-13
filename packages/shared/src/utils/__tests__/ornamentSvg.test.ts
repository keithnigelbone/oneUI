import { describe, expect, it } from 'vitest';
import { extractSvgContent, generateOrnamentCSSProperties, getClosedFillPath, getOpenStrokePath } from '../ornamentSvg';

describe('generateOrnamentCSSProperties', () => {
  it('does not globally flatten button radius when emitting ornament CSS vars', () => {
    const props = generateOrnamentCSSProperties(
      'Button',
      '<svg viewBox="0 0 10 20"><path d="M0 0H10V20H0Z" /></svg>',
      0.5,
      true,
      'edges',
    );

    expect(props).toMatchObject({
      '--Button-ornament-width-left':
        'calc(var(--_btn-min-h, var(--Button-minHeight, var(--Spacing-10))) * 0.5 * var(--Button-ornamentHeightScale, 1))',
      '--Button-ornament-width-right':
        'calc(var(--_btn-min-h, var(--Button-minHeight, var(--Spacing-10))) * 0.5 * var(--Button-ornamentHeightScale, 1))',
      '--Button-ornament-border-left': '0px',
      '--Button-ornament-border-right': '0px',
    });
    expect(props).not.toHaveProperty('--Button-ornament-radius-left');
    expect(props).not.toHaveProperty('--Button-ornament-radius-right');
  });

  it('strips source paint so Button controls ornament fill and stroke', () => {
    const extracted = extractSvgContent(`
      <svg viewBox="0 0 10 20">
        <style>.outline { fill: none; stroke: #c00; stroke-width: 2; }</style>
        <path
          class="outline"
          fill="none"
          stroke="#c00"
          stroke-width="2"
          style="fill: none; stroke: #c00; stroke-width: 2; transform: translateX(1px)"
          d="M0 0H10V20H0Z"
        />
      </svg>
    `);

    expect(extracted?.innerMarkup).not.toContain('<style');
    expect(extracted?.innerMarkup).not.toContain('class=');
    expect(extracted?.innerMarkup).not.toContain('fill=');
    expect(extracted?.innerMarkup).not.toContain('stroke=');
    expect(extracted?.innerMarkup).not.toContain('stroke-width');
    expect(extracted?.innerMarkup).not.toContain('fill:');
    expect(extracted?.innerMarkup).not.toContain('stroke:');
    expect(extracted?.innerMarkup).toContain('transform: translateX(1px);');
    expect(extracted?.innerMarkup).toContain('d="M0 0H10V20H0Z"');
  });
});

describe('ornament path extraction', () => {
  const simpleSvg = '<svg viewBox="0 0 10 20"><path d="M0 0 H10 V20 H0 Z" /></svg>';
  const officialLikeSvg = `<svg viewBox="0 0 40 56">
    <mask id="m"><path d="M0 56 H12 Z"/></mask>
    <path d="M12 RING Z" mask="url(#m)"/>
  </svg>`;

  it('keeps closing commands for fill masks', () => {
    expect(getClosedFillPath(simpleSvg)).toBe('M0 0 H10 V20 H0 Z');
  });

  it('prefers the mask silhouette for solid fill caps', () => {
    expect(getClosedFillPath(officialLikeSvg)).toBe('M0 56 H12 Z');
  });

  it('appends Z when fallback path is not closed', () => {
    const openSvg = '<svg viewBox="0 0 10 20"><path d="M0 0 H10 V20 H0" /></svg>';
    expect(getClosedFillPath(openSvg)).toBe('M0 0 H10 V20 H0 Z');
  });

  it('strips closing commands for open stroke outlines', () => {
    expect(getOpenStrokePath(simpleSvg)).toBe('M0 0 H10 V20 H0');
  });
});
