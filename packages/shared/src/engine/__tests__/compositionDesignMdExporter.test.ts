import { describe, it, expect } from 'vitest';
import { serializeBrandToDesignMd } from '../compositionDesignMdExporter';

const JIO_BRAND = {
  name: 'Jio',
  slug: 'jio',
  description: 'India digital-life platform.',
  primaryHue: 220,
  primaryChroma: 0.17,
  secondaryHue: 240,
  secondaryChroma: 0.02,
};

describe('serializeBrandToDesignMd', () => {
  it('emits a YAML front-matter block followed by markdown body', () => {
    const out = serializeBrandToDesignMd({ brand: JIO_BRAND });
    expect(out).toMatch(/^---\n/);
    const frontMatterEnd = out.indexOf('\n---\n');
    expect(frontMatterEnd).toBeGreaterThan(0);
    const body = out.slice(frontMatterEnd + 5).trimStart();
    expect(body).toMatch(/^## Overview\n/);
  });

  it('includes all required YAML token sections', () => {
    const out = serializeBrandToDesignMd({ brand: JIO_BRAND });
    const yaml = out.slice(0, out.indexOf('\n---\n'));
    expect(yaml).toContain('colors:');
    expect(yaml).toContain('typography:');
    expect(yaml).toContain('rounded:');
    expect(yaml).toContain('spacing:');
    expect(yaml).toContain('components:');
  });

  it('emits the 8 canonical markdown sections in order', () => {
    const out = serializeBrandToDesignMd({ brand: JIO_BRAND });
    const canonical = [
      '## Overview',
      '## Colors',
      '## Typography',
      '## Layout',
      '## Elevation & Depth',
      '## Shapes',
      '## Components',
      "## Do's and Don'ts",
    ];
    let cursor = 0;
    for (const heading of canonical) {
      const idx = out.indexOf(heading, cursor);
      expect(idx, `section "${heading}" missing or out of order`).toBeGreaterThan(cursor);
      cursor = idx;
    }
  });

  it('emits OneUI extension sections after the canonical block', () => {
    const out = serializeBrandToDesignMd({ brand: JIO_BRAND });
    const donts = out.indexOf("## Do's and Don'ts");
    expect(out.indexOf('## Surfaces')).toBeGreaterThan(donts);
    expect(out.indexOf('## Surface Context')).toBeGreaterThan(donts);
    expect(out.indexOf('## Attention Hierarchy')).toBeGreaterThan(donts);
  });

  it('omits the ## Contexts section when no defaultContext is passed', () => {
    const out = serializeBrandToDesignMd({ brand: JIO_BRAND });
    expect(out).not.toContain('## Contexts');
  });

  it('emits the ## Contexts section when defaultContext is passed', () => {
    const out = serializeBrandToDesignMd({
      brand: JIO_BRAND,
      defaultContext: 'mobile-app',
    });
    expect(out).toContain('## Contexts');
    expect(out).toContain('**mobile-app**');
  });

  it('emits numeric 4/8/16/24/32/48 px spacing keys', () => {
    const out = serializeBrandToDesignMd({ brand: JIO_BRAND });
    expect(out).toMatch(/spacing:\n\s+1: 4px/);
    expect(out).toMatch(/\n\s+2: 8px/);
    expect(out).toMatch(/\n\s+4: 16px/);
    expect(out).toMatch(/\n\s+6: 24px/);
    expect(out).toMatch(/\n\s+8: 32px/);
    expect(out).toMatch(/\n\s+12: 48px/);
  });

  it('emits conventional 4/8/16/24/32 px rounded keys plus pill', () => {
    const out = serializeBrandToDesignMd({ brand: JIO_BRAND });
    expect(out).toMatch(/rounded:\n\s+none: 0px\n\s+sm: 4px/);
    expect(out).toMatch(/\n\s+pill: 9999px/);
  });

  it('emits token references that resolve against the front-matter', () => {
    const out = serializeBrandToDesignMd({ brand: JIO_BRAND });
    const yaml = out.slice(0, out.indexOf('\n---\n'));
    // Extract every `{ns.key}` reference from yaml
    const refs = Array.from(yaml.matchAll(/\{([a-z0-9-]+)\.([a-z0-9-]+)\}/gi));
    expect(refs.length).toBeGreaterThan(0);
    for (const [, ns, key] of refs) {
      // Ensure the ns section exists and contains the key
      const nsBlockRegex = new RegExp(`^${ns}:([\\s\\S]*?)(?=\\n[a-z]|\\n---)`, 'm');
      const match = yaml.match(nsBlockRegex);
      expect(match, `namespace "${ns}" block not found`).not.toBeNull();
      expect(match![1], `key "${key}" not found in "${ns}"`).toContain(`${key}:`);
    }
  });

  it('produces valid hex colors in the colors block (no NaN, no cyan drift)', () => {
    const out = serializeBrandToDesignMd({ brand: JIO_BRAND });
    const colorsBlock = out.match(/colors:([\s\S]*?)typography:/)?.[1] ?? '';
    const hexes = Array.from(colorsBlock.matchAll(/"(#[0-9A-Fa-f]{6})"/g)).map((m) => m[1]);
    expect(hexes.length).toBeGreaterThan(0);
    for (const hex of hexes) {
      expect(hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(hex.toLowerCase()).not.toBe('#00f7ff'); // regression: old chroma-not-tapered cyan
    }
  });

  it('merges rule content into the corresponding section', () => {
    const out = serializeBrandToDesignMd({
      brand: JIO_BRAND,
      rules: [
        {
          sectionId: 'surface-application',
          title: 'Surface',
          content: 'SURFACE_RULE_MARKER_12345',
          priority: 5,
          scope: 'base',
          isActive: true,
          version: 1,
        },
      ],
    });
    const surfaceCtxIdx = out.indexOf('## Surface Context');
    const attentionIdx = out.indexOf('## Attention Hierarchy');
    expect(surfaceCtxIdx).toBeGreaterThan(0);
    const surfaceCtxBlock = out.slice(surfaceCtxIdx, attentionIdx);
    expect(surfaceCtxBlock).toContain('SURFACE_RULE_MARKER_12345');
  });

  it('ignores inactive rules', () => {
    const out = serializeBrandToDesignMd({
      brand: JIO_BRAND,
      rules: [
        {
          sectionId: 'surface-application',
          title: 'Surface',
          content: 'INACTIVE_SHOULD_NOT_APPEAR',
          priority: 5,
          scope: 'base',
          isActive: false,
          version: 1,
        },
      ],
    });
    expect(out).not.toContain('INACTIVE_SHOULD_NOT_APPEAR');
  });

  it('handles null colorConfig by falling back to hue/chroma derivation', () => {
    const out = serializeBrandToDesignMd({
      brand: JIO_BRAND,
      colorConfig: null,
      presetSelection: null,
    });
    expect(out).toMatch(/primary: "#[0-9A-Fa-f]{6}"/);
    expect(out).toMatch(/primary-subtle: "#[0-9A-Fa-f]{6}"/);
  });

  it('escapes YAML-unsafe characters in brand description', () => {
    const out = serializeBrandToDesignMd({
      brand: {
        ...JIO_BRAND,
        description: 'Contains a : colon and "quotes" and a #hash',
      },
    });
    const descLine = out.match(/^description: (.+)$/m);
    expect(descLine).not.toBeNull();
    // Must be double-quoted or survive a YAML round-trip intact.
    expect(descLine![1]).toMatch(/^".*"$/);
  });

  it('emits an oneui-version extension key for downstream detection', () => {
    const out = serializeBrandToDesignMd({ brand: JIO_BRAND, oneuiVersion: '1' });
    expect(out).toMatch(/^oneui-version: 1$/m);
  });

  it('omits the ## Skills section when no skills are passed', () => {
    const out = serializeBrandToDesignMd({ brand: JIO_BRAND });
    expect(out).not.toContain('## Skills');
  });

  it('emits a ## Skills section with one subsection per active skill', () => {
    const out = serializeBrandToDesignMd({
      brand: JIO_BRAND,
      skills: [
        {
          skillId: 'jio-product-grid',
          name: 'Jio Product Grid',
          description: 'E-commerce product listing for mobile and web.',
          category: 'screen',
          applicableContexts: ['mobile-app', 'web-app'],
          archetype: 'product-listing',
          vertical: 'e-commerce',
          attentionPattern: 'Hero image carries; price is the second voice; CTA is medium-attention.',
          dosDonts: [
            'Do let the product image be the boundary; no border on `default` cards.',
            "Don't compete: one CTA per card.",
          ],
        },
        {
          skillId: 'jio-finance-dashboard',
          name: 'Jio Finance Dashboard',
          description: 'Data-dense financial dashboard layout.',
          category: 'screen',
          applicableContexts: ['web-app'],
          vertical: 'finance',
        },
      ],
    });
    expect(out).toContain('## Skills');
    expect(out).toContain('### Jio Product Grid');
    expect(out).toContain('### Jio Finance Dashboard');
    expect(out).toContain('**id:** `jio-product-grid`');
    expect(out).toContain('**vertical:** e-commerce');
    expect(out).toContain('**archetype:** product-listing');
    expect(out).toContain('**contexts:** mobile-app, web-app');
    expect(out).toContain('**Attention pattern:**');
    expect(out).toContain("**Do / Don't:**");
    expect(out).toContain('one CTA per card');
  });

  it('places ## Skills after canonical sections but the file remains valid', () => {
    const out = serializeBrandToDesignMd({
      brand: JIO_BRAND,
      skills: [
        {
          skillId: 'foo',
          name: 'Foo',
          description: 'Test skill.',
          category: 'pattern',
          applicableContexts: ['mobile-app'],
        },
      ],
    });
    const donts = out.indexOf("## Do's and Don'ts");
    const skillsIdx = out.indexOf('## Skills');
    expect(skillsIdx).toBeGreaterThan(donts);
    // YAML front-matter is unchanged; closing `---` still present.
    expect(out).toMatch(/^---\n[\s\S]+\n---\n/);
  });
});
