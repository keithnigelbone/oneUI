import { describe, expect, it } from 'vitest';
import {
  repairGeneratedCompositionCode,
  validateCompositionCode,
} from '../compositionCodeValidator';
import {
  PLAYGROUND_IMAGE_FALLBACK_SRC,
  PLAYGROUND_IMAGE_URLS,
} from '../playgroundImageAssets';

describe('validateCompositionCode', () => {
  describe('parse + structural checks', () => {
    it('passes a clean composition', () => {
      const code = `
import { Surface, Button } from '@oneui/playground';

export default function App() {
  return (
    <Surface mode="default" as="main">
      <Button appearance="primary">Continue</Button>
    </Surface>
  );
}
`;
      const result = validateCompositionCode(code);
      expect(result.valid).toBe(true);
      expect(result.score).toBe(100);
      expect(result.issues).toHaveLength(0);
    });

    it('reports parse failure as a single error issue (not throw)', () => {
      const result = validateCompositionCode('export default function App() { return <Surface');
      expect(result.valid).toBe(false);
      expect(result.score).toBe(0);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].id).toBe('parse-failure');
      expect(result.issues[0].severity).toBe('error');
    });

    it('flags missing default export', () => {
      const code = `
import { Surface } from '@oneui/playground';
export function App() { return <Surface mode="default" />; }
`;
      const result = validateCompositionCode(code);
      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.id === 'missing-default-export')).toBe(true);
    });
  });

  describe('import allowlist', () => {
    it('accepts react and @oneui/playground', () => {
      const code = `
import { useState } from 'react';
import { Surface, Button } from '@oneui/playground';

export default function App() {
  const [count, setCount] = useState(0);
  return <Surface mode="default"><Button>{count}</Button></Surface>;
}
`;
      const result = validateCompositionCode(code);
      expect(result.valid).toBe(true);
    });

    it('rejects disallowed imports (lucide-react, framer-motion, …)', () => {
      const code = `
import { Heart } from 'lucide-react';
import { Surface } from '@oneui/playground';

export default function App() {
  return <Surface mode="default"><Heart /></Surface>;
}
`;
      const result = validateCompositionCode(code);
      expect(result.valid).toBe(false);
      const banned = result.issues.find((i) => i.id === 'banned-import');
      expect(banned).toBeDefined();
      expect(banned?.message).toContain('lucide-react');
    });
  });

  describe('JSX tag allowlist', () => {
    it('accepts known playground components', () => {
      const code = `
import { Surface, Tabs, TabItem, BottomNavItem } from '@oneui/playground';

export default function App() {
  return (
    <Surface mode="default">
      <Tabs><TabItem value="a" /></Tabs>
      <BottomNavItem value="home" />
    </Surface>
  );
}
`;
      const result = validateCompositionCode(code);
      expect(result.valid).toBe(true);
    });

    it('rejects unknown PascalCase components', () => {
      const code = `
import { Surface } from '@oneui/playground';

export default function App() {
  return <Surface mode="default"><MysteryWidget /></Surface>;
}
`;
      const result = validateCompositionCode(code);
      expect(result.valid).toBe(false);
      const unknown = result.issues.find((i) => i.id === 'unknown-component');
      expect(unknown?.message).toContain('MysteryWidget');
    });

    it('does not flag lowercase HTML tags', () => {
      const code = `
import { Surface } from '@oneui/playground';

export default function App() {
  return <Surface mode="default"><div><span>hi</span></div></Surface>;
}
`;
      const result = validateCompositionCode(code);
      expect(result.valid).toBe(true);
    });
  });

  describe('Surface mode literal check', () => {
    it('accepts valid surface modes', () => {
      const modes = ['default', 'ghost', 'minimal', 'subtle', 'moderate', 'bold', 'elevated', 'blend'];
      for (const mode of modes) {
        const code = `
import { Surface } from '@oneui/playground';
export default function App() { return <Surface mode="${mode}" />; }
`;
        const result = validateCompositionCode(code);
        expect(result.valid, `mode=${mode}`).toBe(true);
      }
    });

    it('rejects invalid surface modes', () => {
      const code = `
import { Surface } from '@oneui/playground';
export default function App() { return <Surface mode="hyper" />; }
`;
      const result = validateCompositionCode(code);
      expect(result.valid).toBe(false);
      expect(result.issues.find((i) => i.id === 'invalid-surface-mode')).toBeDefined();
    });
  });

  describe('inline style literals (warnings)', () => {
    it('warns on raw hex colour in inline style', () => {
      const code = `
import { Surface } from '@oneui/playground';
export default function App() {
  return <Surface mode="default" style={{ color: '#ff0000' }} />;
}
`;
      const result = validateCompositionCode(code);
      expect(result.valid).toBe(false);
      const warning = result.issues.find((i) => i.id === 'inline-raw-colour');
      expect(warning).toBeDefined();
      expect(warning?.severity).toBe('error');
    });

    it('accepts var(--Token) as the inline value', () => {
      const code = `
import { Surface } from '@oneui/playground';
export default function App() {
  return <Surface mode="default" style={{ color: 'var(--Text-High)', fontSize: 'var(--Body-M-FontSize)' }} />;
}
`;
      const result = validateCompositionCode(code);
      const colourIssues = result.issues.filter(
        (i) => i.id === 'inline-raw-colour' || i.id === 'inline-raw-dimension',
      );
      expect(colourIssues).toHaveLength(0);
    });

    it('warns on raw px font-size', () => {
      const code = `
import { Surface } from '@oneui/playground';
export default function App() {
  return <Surface mode="default" style={{ fontSize: '24px' }} />;
}
`;
      const result = validateCompositionCode(code);
      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.id === 'inline-raw-dimension')).toBe(true);
    });
  });

  describe('Icon name check', () => {
    it('accepts known semantic icon names', () => {
      const code = `
import { Surface, Icon } from '@oneui/playground';
export default function App() { return <Surface mode="default"><Icon name="search" /></Surface>; }
`;
      const result = validateCompositionCode(code);
      expect(result.issues.filter((i) => i.id === 'unknown-icon-name')).toHaveLength(0);
    });

    it('warns on unknown icon names (kebab-case typo, invented name)', () => {
      const code = `
import { Surface, Icon } from '@oneui/playground';
export default function App() { return <Surface mode="default"><Icon name="shopping-cart" /></Surface>; }
`;
      const result = validateCompositionCode(code);
      const issue = result.issues.find((i) => i.id === 'unknown-icon-name');
      expect(issue).toBeDefined();
      expect(issue?.severity).toBe('error');
    });

    it('rejects inline svg icons so brand icon sets stay active', () => {
      const code = `
import { Surface } from '@oneui/playground';
export default function App() { return <Surface mode="default"><svg viewBox="0 0 12 12" /></Surface>; }
`;
      const result = validateCompositionCode(code);
      const issue = result.issues.find((i) => i.id === 'raw-svg-icon');
      expect(issue).toBeDefined();
      expect(issue?.severity).toBe('error');
    });
  });

  describe('strict render gate checks', () => {
    it('requires the app to return a root Surface', () => {
      const code = `
import { Button } from '@oneui/playground';
export default function App() { return <Button>Continue</Button>; }
`;
      const result = validateCompositionCode(code);
      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.id === 'missing-root-surface')).toBe(true);
    });

    it('rejects numeric React style values', () => {
      const code = `
import { Surface } from '@oneui/playground';
export default function App() {
  return <Surface mode="default" style={{ padding: 24 }} />;
}
`;
      const result = validateCompositionCode(code);
      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.id === 'raw-style-number')).toBe(true);
    });

    it('rejects numeric-looking style strings', () => {
      const code = `
import { Surface } from '@oneui/playground';
export default function App() {
  return <Surface mode="default" style={{ opacity: '0.8' }} />;
}
`;
      const result = validateCompositionCode(code);
      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.id === 'raw-style-number')).toBe(true);
    });

    it('rejects legacy token references', () => {
      const code = `
import { Surface } from '@oneui/playground';
export default function App() {
  return <Surface mode="default"><p style={{ fontFamily: 'var(--Typography-Font-Primary)', fontSize: 'var(--Typography-Size-M)', lineHeight: 'var(--Body-M-LineHeight)' }}>Copy</p></Surface>;
}
`;
      const result = validateCompositionCode(code);
      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.id === 'legacy-token')).toBe(true);
    });

    it('rejects section-level div layout', () => {
      const code = `
import { Surface } from '@oneui/playground';
export default function App() {
  return <Surface mode="default"><div style={{ display: 'flex', gap: 'var(--Spacing-4)' }} /></Surface>;
}
`;
      const result = validateCompositionCode(code);
      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.id === 'section-div-layout')).toBe(true);
    });

    it('rejects manual background containers around interactive children', () => {
      const code = `
import { Surface, Button } from '@oneui/playground';
export default function App() {
  return <Surface mode="default"><section style={{ background: 'var(--Primary-Bold)' }}><Button>Go</Button></section></Surface>;
}
`;
      const result = validateCompositionCode(code);
      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.id === 'manual-background-container')).toBe(true);
    });

    it('requires typography line-height and primary font family when fontSize is set', () => {
      const code = `
import { Surface } from '@oneui/playground';
export default function App() {
  return <Surface mode="default"><h1 style={{ fontSize: 'var(--Headline-L-FontSize)' }}>Title</h1></Surface>;
}
`;
      const result = validateCompositionCode(code);
      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.id === 'missing-typography-line-height')).toBe(true);
      expect(result.issues.some((i) => i.id === 'missing-typography-family')).toBe(true);
    });

    it('rejects broken image placeholders and missing alt text', () => {
      const code = `
import { Surface, Image } from '@oneui/playground';
export default function App() {
  return <Surface mode="default"><Image src="placeholder.jpg" /></Surface>;
}
`;
      const result = validateCompositionCode(code);
      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.id === 'broken-image-src')).toBe(true);
      expect(result.issues.some((i) => i.id === 'missing-image-alt')).toBe(true);
    });

    it('accepts local playground image assets', () => {
      const code = `
import { Surface, Image } from '@oneui/playground';
export default function App() {
  return <Surface mode="default"><Image src="${PLAYGROUND_IMAGE_URLS[0]}" alt="Featured product" /></Surface>;
}
`;
      const result = validateCompositionCode(code);
      expect(result.valid).toBe(true);
      expect(result.issues.some((i) => i.id === 'broken-image-src')).toBe(false);
    });

    it('rejects remote image URLs', () => {
      const code = `
import { Surface, Image } from '@oneui/playground';
export default function App() {
  return <Surface mode="default"><Image src="https://picsum.photos/seed/grocery1/600/400" alt="Remote product" /></Surface>;
}
`;
      const result = validateCompositionCode(code);
      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.id === 'broken-image-src')).toBe(true);
    });

    it('rejects unknown local image URLs', () => {
      const code = `
import { Surface, Image } from '@oneui/playground';
export default function App() {
  return <Surface mode="default"><Image src="/playground-assets/images/missing.svg" alt="Missing product" /></Surface>;
}
`;
      const result = validateCompositionCode(code);
      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.id === 'broken-image-src')).toBe(true);
    });

    it('rejects fullWidth on components that do not support it', () => {
      const code = `
import { Surface, Input } from '@oneui/playground';
export default function App() {
  return <Surface mode="default"><Input fullWidth placeholder="Email" /></Surface>;
}
`;
      const result = validateCompositionCode(code);
      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.id === 'unsupported-full-width')).toBe(true);
    });
  });

  describe('scoring', () => {
    it('deducts 25 per error and 5 per warning', () => {
      const code = `
import { Heart } from 'lucide-react';
export default function App() {
  return <Heart style={{ color: '#fff' }} />;
}
`;
      const result = validateCompositionCode(code);
      expect(result.score).toBeLessThanOrEqual(25);
    });
  });

  describe('repairGeneratedCompositionCode', () => {
    it('normalizes common legacy aliases before validation', () => {
      const code = `
import { Surface } from '@oneui/playground';
export default function App() {
  return <Surface mode="default"><p style={{ color: 'var(--Text-High)', fontFamily: 'var(--Typography-Font-Primary)', fontSize: 'var(--Body-M-FontSize)', lineHeight: 'var(--Body-M-LineHeight)' }}>Copy</p></Surface>;
}
`;
      const repaired = repairGeneratedCompositionCode(code);
      expect(repaired.changed).toBe(true);
      expect(repaired.code).toContain('var(--Primary-High)');
      expect(validateCompositionCode(repaired.code).valid).toBe(true);
    });

    it('normalizes V4 role aliases before validation', () => {
      const code = `
import { Surface } from '@oneui/playground';
export default function App() {
  return (
    <Surface mode="default">
      <p style={{ color: 'var(--Primary-FG-Bold-High)', fontFamily: 'var(--Typography-Font-Primary)', fontSize: 'var(--Body-M-FontSize)', lineHeight: 'var(--Body-M-LineHeight)' }}>Copy</p>
      <p style={{ color: 'var(--Brand-Bg-Default-Accent-A11y)', fontFamily: 'var(--Typography-Font-Primary)', fontSize: 'var(--Body-S-FontSize)', lineHeight: 'var(--Body-S-LineHeight)' }}>More</p>
    </Surface>
  );
}
`;
      const repaired = repairGeneratedCompositionCode(code);
      expect(repaired.changed).toBe(true);
      expect(repaired.code).toContain('var(--Primary-Bold-High)');
      expect(repaired.code).toContain('var(--Brand-Bg-TintedA11y)');
      expect(validateCompositionCode(repaired.code).valid).toBe(true);
    });

    it('repairs generated Image placeholders and missing alt text', () => {
      const code = `
import { Surface, Image } from '@oneui/playground';
export default function App() {
  return <Surface mode="default"><Image src="placeholder.jpg" /></Surface>;
}
`;
      const repaired = repairGeneratedCompositionCode(code);
      expect(repaired.changed).toBe(true);
      expect(repaired.code).toContain(PLAYGROUND_IMAGE_FALLBACK_SRC);
      expect(repaired.code).toContain('alt="Generated composition image"');
      expect(validateCompositionCode(repaired.code).valid).toBe(true);
    });

    it('repairs remote, unknown, and empty image sources to a deterministic local asset', () => {
      const cases = [
        'https://picsum.photos/seed/grocery1/600/400',
        '/playground-assets/images/missing.svg',
        '',
      ];
      for (const src of cases) {
        const code = `
import { Surface, Image } from '@oneui/playground';
export default function App() {
  return <Surface mode="default"><Image src="${src}" alt="Generated image" /></Surface>;
}
`;
        const repaired = repairGeneratedCompositionCode(code);
        expect(repaired.changed, src || 'empty-src').toBe(true);
        expect(repaired.code, src || 'empty-src').toContain(PLAYGROUND_IMAGE_FALLBACK_SRC);
        expect(validateCompositionCode(repaired.code).valid, src || 'empty-src').toBe(true);
      }
    });

    it('converts raw section layout containers to OneUI layout primitives', () => {
      const code = `
import { Surface } from '@oneui/playground';
export default function App() {
  return (
    <Surface mode="default">
      <div style={{ display: 'flex', gap: 'var(--Spacing-4)' }}>
        <p style={{ margin: 0, fontFamily: 'var(--Typography-Font-Primary)', fontSize: 'var(--Body-M-FontSize)', lineHeight: 'var(--Body-M-LineHeight)' }}>Copy</p>
      </div>
    </Surface>
  );
}
`;
      const repaired = repairGeneratedCompositionCode(code);
      expect(repaired.changed).toBe(true);
      expect(repaired.code).toContain('Container');
      expect(repaired.code).not.toContain('<div style={{ display:');
      expect(validateCompositionCode(repaired.code).valid).toBe(true);
    });

    it('converts manual background containers around controls to Surface context', () => {
      const code = `
import { Surface, Button } from '@oneui/playground';
export default function App() {
  return (
    <Surface mode="default">
      <section style={{ background: 'var(--Primary-Bold)', padding: 'var(--Spacing-5)' }}>
        <Button appearance="primary">Continue</Button>
      </section>
    </Surface>
  );
}
`;
      const repaired = repairGeneratedCompositionCode(code);
      expect(repaired.changed).toBe(true);
      expect(repaired.code).toContain('<Surface');
      expect(repaired.code).toContain('mode="bold"');
      expect(repaired.code).not.toContain("background: 'var(--Primary-Bold)'");
      expect(validateCompositionCode(repaired.code).valid).toBe(true);
    });

    it('repairs unitless numeric flex styles that strict validation blocks', () => {
      const code = `
import { Surface, Container } from '@oneui/playground';
export default function App() {
  return <Surface mode="default"><Container style={{ flex: 1 }} /></Surface>;
}
`;
      const repaired = repairGeneratedCompositionCode(code);
      expect(repaired.changed).toBe(true);
      expect(repaired.code).toContain("flex: \"1 1 var(--Spacing-0)\"");
      expect(validateCompositionCode(repaired.code).valid).toBe(true);
    });

    it('removes unitless numeric style props instead of stringifying them', () => {
      const code = `
import { Surface, Container } from '@oneui/playground';
export default function App() {
  return <Surface mode="default"><Container style={{ flexGrow: 1, opacity: 0.85, gap: 'var(--Spacing-4)' }} /></Surface>;
}
`;
      const repaired = repairGeneratedCompositionCode(code);
      expect(repaired.changed).toBe(true);
      expect(repaired.code).not.toContain('flexGrow');
      expect(repaired.code).not.toContain('opacity');
      expect(repaired.code).toContain("gap: 'var(--Spacing-4)'");
      expect(validateCompositionCode(repaired.code).valid).toBe(true);
    });

    it('tokenizes common raw dimension strings and shadow colours from model output', () => {
      const code = `
import { Surface, Container } from '@oneui/playground';
export default function App() {
  return (
    <Surface mode="default">
      <Container style={{ maxWidth: '390px', minWidth: '160px', height: '180px', zIndex: "10", boxShadow: '0 var(--Spacing-1) var(--Spacing-3) rgba(0,0,0,0.08)' }} />
    </Surface>
  );
}
`;
      const repaired = repairGeneratedCompositionCode(code);
      expect(repaired.changed).toBe(true);
      expect(repaired.code).not.toContain('390px');
      expect(repaired.code).not.toContain('160px');
      expect(repaired.code).not.toContain('180px');
      expect(repaired.code).not.toContain('rgba');
      expect(repaired.code).not.toContain('zIndex');
      expect(repaired.code).toContain('var(--Elevation-2)');
      expect(validateCompositionCode(repaired.code).valid).toBe(true);
    });

    it('tokenizes raw colour gradients before strict validation', () => {
      const code = `
import { Surface, Container } from '@oneui/playground';
export default function App() {
  return (
    <Surface mode="default">
      <Container style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)' }} />
    </Surface>
  );
}
`;
      const repaired = repairGeneratedCompositionCode(code);
      expect(repaired.changed).toBe(true);
      expect(repaired.code).not.toContain('rgba');
      expect(repaired.code).toContain('linear-gradient(to top, var(--Neutral-Bold) 0%, transparent 100%)');
      expect(validateCompositionCode(repaired.code).valid).toBe(true);
    });

    it('removes unsupported fullWidth props before rendering', () => {
      const code = `
import { Surface, Input } from '@oneui/playground';
export default function App() {
  return <Surface mode="default"><Input fullWidth placeholder="Email" /></Surface>;
}
`;
      const repaired = repairGeneratedCompositionCode(code);
      expect(repaired.changed).toBe(true);
      expect(repaired.code).not.toContain('fullWidth');
      expect(validateCompositionCode(repaired.code).valid).toBe(true);
    });
  });
});
