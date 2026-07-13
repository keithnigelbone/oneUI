import { describe, it, expect } from 'vitest';
import { validateBrandCSS, validateBrandCSSSignature } from '../validateBrandCSS';

// Minimal valid CSS that satisfies all required tokens
const VALID_CSS = `
  --Surface-Default: #ffffff;
  --Surface-Bold: #333333;
  --Text-High: #111111;
  --Text-OnBold-High: #ffffff;
`;

describe('validateBrandCSS', () => {
  describe('required token presence', () => {
    it('passes when all 4 required tokens are present', () => {
      const result = validateBrandCSS(VALID_CSS);
      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
      expect(result.warnings).toEqual([]);
      expect(result.cssSize).toBeGreaterThan(0);
    });

    it('fails when required tokens are missing', () => {
      const css = `--Surface-Default: #fff;`;
      const result = validateBrandCSS(css);
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('--Surface-Bold');
      expect(result.missing).toContain('--Text-High');
      expect(result.missing).toContain('--Text-OnBold-High');
      expect(result.missing).not.toContain('--Surface-Default');
    });

    it('reports all 4 required tokens when CSS is empty', () => {
      const result = validateBrandCSS('');
      expect(result.valid).toBe(false);
      expect(result.missing).toHaveLength(4);
      expect(result.tokenCount).toBe(0);
      expect(result.warnings).toEqual([]);
      expect(result.cssSize).toBe(0);
    });

    it('reports all 4 required tokens when CSS is whitespace', () => {
      const result = validateBrandCSS('   \n  \n  ');
      expect(result.valid).toBe(false);
      expect(result.missing).toHaveLength(4);
    });
  });

  describe('CSS value validity', () => {
    it('accepts hex colors (3, 6, 8 digits)', () => {
      const css = `
        --Surface-Default: #fff;
        --Surface-Bold: #333333;
        --Text-High: #11111180;
        --Text-OnBold-High: #ffffff;
      `;
      const result = validateBrandCSS(css);
      expect(result.invalidValues).toEqual([]);
    });

    it('accepts rgb/rgba values', () => {
      const css = `
        --Surface-Default: rgb(255, 255, 255);
        --Surface-Bold: rgba(0, 0, 0, 0.8);
        --Text-High: #111;
        --Text-OnBold-High: #fff;
      `;
      const result = validateBrandCSS(css);
      expect(result.invalidValues).toEqual([]);
    });

    it('accepts oklch values', () => {
      const css = `
        --Surface-Default: oklch(0.95 0.02 250);
        --Surface-Bold: oklch(0.3 0.15 270);
        --Text-High: #111;
        --Text-OnBold-High: #fff;
      `;
      const result = validateBrandCSS(css);
      expect(result.invalidValues).toEqual([]);
    });

    it('accepts numeric values with units', () => {
      const css = `
        --Surface-Default: #fff;
        --Surface-Bold: #333;
        --Text-High: #111;
        --Text-OnBold-High: #fff;
        --Typography-Font-Size: 16px;
        --Typography-Weight-Bold: 700;
      `;
      const result = validateBrandCSS(css);
      expect(result.invalidValues).toEqual([]);
    });

    it('accepts CSS variable references', () => {
      const css = `
        --Surface-Default: var(--base-white);
        --Surface-Bold: #333;
        --Text-High: #111;
        --Text-OnBold-High: #fff;
      `;
      const result = validateBrandCSS(css);
      expect(result.invalidValues).toEqual([]);
    });

    it('accepts font family names', () => {
      const css = `
        --Surface-Default: #fff;
        --Surface-Bold: #333;
        --Text-High: #111;
        --Text-OnBold-High: #fff;
        --Typography-Font-Family: Inter, sans-serif;
      `;
      const result = validateBrandCSS(css);
      expect(result.invalidValues).toEqual([]);
    });

    it('accepts transparent and CSS keywords', () => {
      const css = `
        --Surface-Default: transparent;
        --Surface-Bold: #333;
        --Text-High: inherit;
        --Text-OnBold-High: #fff;
      `;
      const result = validateBrandCSS(css);
      expect(result.invalidValues).toEqual([]);
    });

    it('rejects empty values', () => {
      const css = `
        --Surface-Default: ;
        --Surface-Bold: #333;
        --Text-High: #111;
        --Text-OnBold-High: #fff;
      `;
      const result = validateBrandCSS(css);
      expect(result.valid).toBe(false);
      expect(result.invalidValues.length).toBeGreaterThan(0);
    });
  });

  describe('duplicate detection', () => {
    it('detects duplicate declarations', () => {
      const css = `
        --Surface-Default: #fff;
        --Surface-Bold: #333;
        --Surface-Bold: #444;
        --Text-High: #111;
        --Text-OnBold-High: #fff;
      `;
      const result = validateBrandCSS(css);
      expect(result.duplicates).toContain('--Surface-Bold');
    });

    it('reports no duplicates when all are unique', () => {
      const result = validateBrandCSS(VALID_CSS);
      expect(result.duplicates).toEqual([]);
    });
  });

  describe('interdependency validation', () => {
    it('passes when Surface-Bold has Text-OnBold-High', () => {
      const result = validateBrandCSS(VALID_CSS);
      expect(result.interdependencyViolations).toEqual([]);
    });

    it('fails when Surface-Bold exists without Text-OnBold-High', () => {
      const css = `
        --Surface-Default: #fff;
        --Surface-Bold: #333;
        --Text-High: #111;
      `;
      const result = validateBrandCSS(css);
      expect(result.valid).toBe(false);
      expect(result.interdependencyViolations.length).toBeGreaterThan(0);
      expect(result.interdependencyViolations[0]).toContain('--Surface-Bold');
      expect(result.interdependencyViolations[0]).toContain('--Text-OnBold-High');
    });

    it('fails when Primary-Bold exists without Primary-Bold-High', () => {
      const css = `
        --Surface-Default: #fff;
        --Surface-Bold: #333;
        --Text-High: #111;
        --Text-OnBold-High: #fff;
        --Primary-Bold: #ff5500;
      `;
      const result = validateBrandCSS(css);
      expect(result.valid).toBe(false);
      expect(result.interdependencyViolations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('--Primary-Bold'),
        ])
      );
    });
  });

  describe('token counting', () => {
    it('counts unique properties', () => {
      const result = validateBrandCSS(VALID_CSS);
      expect(result.tokenCount).toBe(4);
    });

    it('counts duplicates only once', () => {
      const css = `
        --Surface-Default: #fff;
        --Surface-Default: #eee;
        --Surface-Bold: #333;
        --Text-High: #111;
        --Text-OnBold-High: #fff;
      `;
      const result = validateBrandCSS(css);
      expect(result.tokenCount).toBe(4); // 4 unique properties
    });

    it('returns 0 for empty CSS', () => {
      const result = validateBrandCSS('');
      expect(result.tokenCount).toBe(0);
    });
  });

  describe('size and token count warnings', () => {
    it('returns no warnings for small CSS', () => {
      const result = validateBrandCSS(VALID_CSS);
      expect(result.warnings).toEqual([]);
      expect(result.cssSize).toBe(VALID_CSS.length);
    });

    it('warns when CSS exceeds 50KB', () => {
      // Build CSS that exceeds 50KB: required tokens + padding tokens
      const lines = [
        '--Surface-Default: #ffffff;',
        '--Surface-Bold: #333333;',
        '--Text-High: #111111;',
        '--Text-OnBold-High: #ffffff;',
      ];
      for (let i = 0; i < 1500; i++) {
        lines.push(`--Custom-Token-Padded-${String(i).padStart(4, '0')}: #aabbcc;`);
      }
      const bigCSS = lines.join('\n');
      const result = validateBrandCSS(bigCSS);
      expect(result.cssSize).toBeGreaterThan(50 * 1024);
      expect(result.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining('exceeds recommended limit of 50KB')])
      );
    });

    it('warns when token count exceeds 800', () => {
      const lines = [
        '--Surface-Default: #ffffff;',
        '--Surface-Bold: #333333;',
        '--Text-High: #111111;',
        '--Text-OnBold-High: #ffffff;',
      ];
      for (let i = 0; i < 800; i++) {
        lines.push(`--Tok-${i}: #aabb00;`);
      }
      const manyTokenCSS = lines.join('\n');
      const result = validateBrandCSS(manyTokenCSS);
      expect(result.tokenCount).toBeGreaterThan(800);
      expect(result.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining('exceeds recommended limit of 800')])
      );
    });

    it('does not warn when within limits', () => {
      const result = validateBrandCSS(VALID_CSS);
      expect(result.warnings).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('ignores comments', () => {
      const css = `
        /* Surface tokens */
        --Surface-Default: #fff;
        --Surface-Bold: #333;
        // Text tokens
        --Text-High: #111;
        --Text-OnBold-High: #fff;
      `;
      const result = validateBrandCSS(css);
      expect(result.valid).toBe(true);
    });

    it('handles semicolons at end of declarations', () => {
      const css = `
        --Surface-Default: #fff;
        --Surface-Bold: #333;
        --Text-High: #111;
        --Text-OnBold-High: #fff;
      `;
      const result = validateBrandCSS(css);
      expect(result.valid).toBe(true);
    });

    it('ignores non-custom-property lines', () => {
      const css = `
        background: red;
        --Surface-Default: #fff;
        --Surface-Bold: #333;
        --Text-High: #111;
        --Text-OnBold-High: #fff;
      `;
      const result = validateBrandCSS(css);
      expect(result.valid).toBe(true);
    });
  });
});

describe('validateBrandCSSSignature', () => {
  it('passes for raw CSS containing the required tokens (no wrapping required)', () => {
    // The signature runs on the pre-wrap payload — tokens only, no :root.
    const result = validateBrandCSSSignature(VALID_CSS);
    expect(result.valid).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('passes for a wrapped stylesheet too', () => {
    const wrapped = `:root { ${VALID_CSS} }`;
    expect(validateBrandCSSSignature(wrapped).valid).toBe(true);
  });

  it('fails with reason "empty" for an empty string', () => {
    const result = validateBrandCSSSignature('');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('empty');
  });

  it('fails with reason "missing-token" when a required token is absent', () => {
    const css = `
      --Surface-Default: #fff;
      --Surface-Bold: #333;
      --Text-High: #111;
    `;
    const result = validateBrandCSSSignature(css);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('missing-token');
    expect(result.missingToken).toBe('--Text-OnBold-High');
  });

  it('is a fast path — passes without parsing values', () => {
    // Even if the value string is nonsense, signature check still passes as
    // long as required tokens appear somewhere. Full validation runs in dev.
    const css = `
      --Surface-Default: not-a-real-value;
      --Surface-Bold: !!!;
      --Text-High: 42;
      --Text-OnBold-High: hello world;
    `;
    expect(validateBrandCSSSignature(css).valid).toBe(true);
    // Full validator would reject this
    expect(validateBrandCSS(css).valid).toBe(false);
  });
});
