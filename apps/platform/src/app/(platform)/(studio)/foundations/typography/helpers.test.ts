import { describe, expect, it } from 'vitest';
import {
  addTypographyScriptRow,
  applyTypographyScriptPatch,
  removeTypographyScriptRow,
  setTypographyScriptPreset,
} from './scriptSupport';

describe('typography foundation script helpers', () => {
  it('builds the autosave payload shape for a core script edit', () => {
    const next = applyTypographyScriptPatch({}, 'devanagari', {
      enabled: false,
      uiFontId: 'noto-sans-devanagari-ui',
      readingFontId: 'noto-sans-devanagari-ui',
      lineHeightMode: 'reading',
    });

    expect(next.scriptSupport?.preset).toBe('custom');
    expect(next.scriptSupport?.scripts?.devanagari).toMatchObject({
      enabled: false,
      uiFontId: 'noto-sans-devanagari-ui',
      readingFontId: 'noto-sans-devanagari-ui',
      lineHeightMode: 'reading',
    });
  });

  it('drops custom deltas when switching back to a preset line-height profile', () => {
    const next = applyTypographyScriptPatch(
      {
        scriptSupport: {
          preset: 'custom',
          scripts: {
            devanagari: {
              lineHeightMode: 'custom',
              lineHeightDeltas: { body: 2 },
            },
          },
        },
      },
      'devanagari',
      { lineHeightMode: 'ui' },
    );

    expect(next.scriptSupport?.scripts?.devanagari?.lineHeightMode).toBe('ui');
    expect(next.scriptSupport?.scripts?.devanagari?.lineHeightDeltas).toBeUndefined();
  });

  it('adds and removes custom script rows without changing the foundation type', () => {
    const added = addTypographyScriptRow({}, 'custom-script-1');

    expect(added.scriptSupport?.preset).toBe('custom');
    expect(added.scriptSupport?.scripts?.['custom-script-1']).toMatchObject({
      label: 'Custom Script',
      cssName: 'CustomScript',
      enabled: true,
      uiFontId: 'noto-sans',
      readingFontId: 'noto-sans',
      lineHeightMode: 'ui',
    });

    const removed = removeTypographyScriptRow(added, 'custom-script-1');
    expect(removed.scriptSupport?.scripts?.['custom-script-1']).toBeUndefined();
  });

  it('materializes core script defaults when switching to custom preset', () => {
    const next = setTypographyScriptPreset({
      scriptSupport: {
        scripts: {
          devanagari: {
            uiFontId: 'noto-sans-devanagari-ui',
            readingFontId: 'noto-sans-devanagari',
          },
        },
      },
    }, 'custom');

    expect(next.scriptSupport?.preset).toBe('custom');
    expect(next.scriptSupport?.scripts?.devanagari).toMatchObject({
      enabled: true,
      uiFontId: 'noto-sans-devanagari-ui',
      readingFontId: 'noto-sans-devanagari',
      lineHeightMode: 'ui',
    });
  });
});
