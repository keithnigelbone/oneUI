import { describe, it, expect } from 'vitest';
import { wrapCSSForInjection } from '../wrapCSS';

const SAMPLE_CSS = '--Surface-Bold: #333;\n  --Text-High: #111;';

describe('wrapCSSForInjection', () => {
  describe('mode: none', () => {
    it('returns empty string', () => {
      expect(wrapCSSForInjection(SAMPLE_CSS, 'none')).toBe('');
    });
  });

  describe('mode: global', () => {
    it('wraps in @layer brand with :root selector', () => {
      const result = wrapCSSForInjection(SAMPLE_CSS, 'global');
      expect(result).toContain('@layer brand');
      expect(result).toContain(':root');
      expect(result).toContain(SAMPLE_CSS);
    });

    it('produces valid nested CSS structure', () => {
      const result = wrapCSSForInjection(SAMPLE_CSS, 'global');
      expect(result).toBe(`@layer brand {\n  :root {\n    ${SAMPLE_CSS}\n  }\n}`);
    });
  });

  describe('mode: scoped', () => {
    it('wraps in @layer brand with [data-brand-scope] selector', () => {
      const result = wrapCSSForInjection(SAMPLE_CSS, 'scoped');
      expect(result).toContain('@layer brand');
      expect(result).toContain('[data-brand-scope]');
      expect(result).toContain(SAMPLE_CSS);
    });

    it('produces valid nested CSS structure', () => {
      const result = wrapCSSForInjection(SAMPLE_CSS, 'scoped');
      expect(result).toBe(`@layer brand {\n  [data-brand-scope] {\n    ${SAMPLE_CSS}\n  }\n}`);
    });

    it('does not contain :root', () => {
      const result = wrapCSSForInjection(SAMPLE_CSS, 'scoped');
      expect(result).not.toContain(':root');
    });
  });

  describe('edge cases', () => {
    it('returns empty string for empty CSS regardless of mode', () => {
      expect(wrapCSSForInjection('', 'global')).toBe('');
      expect(wrapCSSForInjection('', 'scoped')).toBe('');
      expect(wrapCSSForInjection('', 'none')).toBe('');
    });

    it('returns empty string for falsy CSS', () => {
      expect(wrapCSSForInjection(null as unknown as string, 'global')).toBe('');
      expect(wrapCSSForInjection(undefined as unknown as string, 'global')).toBe('');
    });

    it('returns empty string for unknown mode', () => {
      expect(wrapCSSForInjection(SAMPLE_CSS, 'unknown' as any)).toBe('');
    });
  });

  describe('additionalBlocks scoping', () => {
    const SURFACE_BLOCK = `[data-surface="bold"] {\n  --Text-High: #fff;\n}`;
    const PLATFORM_BLOCK = `[data-Breakpoint="S"] {\n  --Spacing-4: 16px;\n}`;

    it('global mode appends additional blocks unchanged', () => {
      const result = wrapCSSForInjection(SAMPLE_CSS, 'global', SURFACE_BLOCK);
      expect(result).toContain(SURFACE_BLOCK);
      expect(result).toContain(':root');
    });

    it('scoped mode descendant-scopes [data-surface] selectors under [data-brand-scope]', () => {
      const result = wrapCSSForInjection(SAMPLE_CSS, 'scoped', SURFACE_BLOCK);
      expect(result).toContain('[data-brand-scope] [data-surface="bold"]');
      expect(result).not.toMatch(/^\s*\[data-surface="bold"\]/m);
    });

    it('scoped mode descendant-scopes [data-Breakpoint] selectors', () => {
      const result = wrapCSSForInjection(SAMPLE_CSS, 'scoped', PLATFORM_BLOCK);
      expect(result).toContain('[data-brand-scope] [data-Breakpoint="S"]');
    });

    it('scoped mode handles a mix of surface + platform blocks', () => {
      const blocks = `${SURFACE_BLOCK}\n${PLATFORM_BLOCK}`;
      const result = wrapCSSForInjection(SAMPLE_CSS, 'scoped', blocks);
      expect(result).toContain('[data-brand-scope] [data-surface="bold"]');
      expect(result).toContain('[data-brand-scope] [data-Breakpoint="S"]');
    });
  });

  // Guard: catches the failure mode where a future emitter adds a new
  // top-level selector form (e.g. `.material-transparent`, `@container`,
  // `[data-some-new-attr]`) that wrapCSSForInjection does not know how to
  // descendant-scope. In scoped mode, any unscoped global selector would leak
  // out of the brand scope and bleed into the host page.
  describe('scoped mode: no unscoped global selectors leak through', () => {
    function topLevelSelectors(css: string): string[] {
      // Strip @layer wrapper; find every `<selector> {` at indent <= 2.
      // This captures the set of selectors that sit directly inside @layer brand.
      const stripped = css
        .replace(/@layer brand\s*\{/, '')
        .replace(/\}\s*$/, '');
      const selectors: string[] = [];
      const re = /(^|\n)([^\n{}]+?)\s*\{/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(stripped)) !== null) {
        const sel = m[2].trim();
        // Skip nested rules inside descendant-scoped blocks (those have leading
        // whitespace > 2 chars in the prettified output, but here we keep it
        // simple and rely on the wrapper's known shape).
        if (sel.startsWith('--')) continue; // declaration, not a selector
        selectors.push(sel);
      }
      return selectors;
    }

    it('all top-level selectors begin with [data-brand-scope]', () => {
      // Mix root + every currently-supported additional-block kind.
      const additional = [
        '[data-surface="bold"] {\n  --Text-High: #fff;\n}',
        '[data-surface="subtle"] {\n  --Text-High: #222;\n}',
        '[data-Breakpoint="S"] {\n  --Spacing-4: 16px;\n}',
      ].join('\n');

      const result = wrapCSSForInjection(SAMPLE_CSS, 'scoped', additional);
      const selectors = topLevelSelectors(result);

      // Every selector emitted directly inside @layer brand in scoped mode
      // MUST start with [data-brand-scope]. If you're adding a new emitter
      // and this fails, teach wrapCSSForInjection how to descendant-scope
      // your new selector form before shipping.
      for (const sel of selectors) {
        expect(sel).toMatch(/^\[data-brand-scope\]/);
      }
    });
  });
});
