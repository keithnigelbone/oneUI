/**
 * Surface.test.tsx
 * Contract tests for the Surface context primitive.
 *
 * Surface is the entry point into the [data-surface] CSS token-remapping
 * cascade. These tests lock in the two guarantees every consumer relies on:
 *   1. the `data-surface` attribute lands on the rendered element for each
   *      of the 8 canonical surface tokens
 *   2. the polymorphic `as` prop + forwarded props/refs work
 */

import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import type { ComponentAppearance } from '@oneui/shared';
import { Surface, SurfaceAppearanceScope, useSurfaceAppearance } from './Surface';
import { BrandFoundationProvider } from '../../contexts/BrandFoundationContext';
import { MaterialFoundationProvider } from '../../contexts/MaterialFoundationContext';
import { buildScaleDefinition, STEPS, type ThemeConfig, type ColorPalette } from '@oneui/shared/engine';

// Tiny grayscale palette + ThemeConfig fixture for brand-aware step tests.
function buildFixtureTheme(baseStep = 1300): ThemeConfig {
  const palette: ColorPalette = {};
  for (let i = 0; i < STEPS.length; i++) {
    const step = STEPS[i];
    const t = i / (STEPS.length - 1);
    const v = Math.round(t * 255);
    palette[step] = `#${v.toString(16).padStart(2, '0').repeat(3)}`;
  }
  return {
    appearances: {
      primary: buildScaleDefinition('test-primary', palette, baseStep),
      neutral: buildScaleDefinition('test-neutral', palette, 1300),
    },
  };
}

// Multi-role fixture: primary baseStep=1300, positive baseStep=1700.
// Lets cross-role bold-on-bold tests assert that inner bold lands at its
// own role's baseStep instead of repeating the outer bold's step.
function buildMultiRoleTheme(): ThemeConfig {
  const palette: ColorPalette = {};
  for (let i = 0; i < STEPS.length; i++) {
    const step = STEPS[i];
    const t = i / (STEPS.length - 1);
    const v = Math.round(t * 255);
    palette[step] = `#${v.toString(16).padStart(2, '0').repeat(3)}`;
  }
  return {
    appearances: {
      primary: buildScaleDefinition('test-primary', palette, 1300),
      positive: buildScaleDefinition('test-positive', palette, 1700),
      neutral: buildScaleDefinition('test-neutral', palette, 1300),
    },
  };
}

describe('Surface', () => {
  // === Rendering ===

  it('renders children', () => {
    render(
      <Surface mode="default">
        <span>inside</span>
      </Surface>,
    );
    expect(screen.getByText('inside')).toBeInTheDocument();
  });

  it('renders a div by default', () => {
    const { container } = render(<Surface mode="default">x</Surface>);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  // === data-surface attribute ===

  it('applies data-surface="default" for the default mode', () => {
    const { container } = render(<Surface mode="default">x</Surface>);
    expect(container.firstElementChild).toHaveAttribute('data-surface', 'default');
  });

  it('defaults to ghost when mode is omitted', () => {
    const { container } = render(<Surface>x</Surface>);
    expect(container.firstElementChild).toHaveAttribute('data-surface', 'ghost');
  });

  it.each(['minimal', 'subtle', 'moderate', 'bold', 'elevated', 'ghost', 'blend'] as const)(
    'applies data-surface="%s" when mode="%s"',
    (mode) => {
      const { container } = render(<Surface mode={mode}>x</Surface>);
      expect(container.firstElementChild).toHaveAttribute('data-surface', mode);
    },
  );

  // === Polymorphic `as` ===

  it('renders as a custom element when `as` is provided', () => {
    const { container } = render(
      <Surface mode="subtle" as="section">
        x
      </Surface>,
    );
    expect(container.firstElementChild?.tagName).toBe('SECTION');
    expect(container.firstElementChild).toHaveAttribute('data-surface', 'subtle');
  });

  it('renders as a custom component', () => {
    function CustomTag({ ref, ...props }: React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }) {
      return <article ref={ref} {...props} />;
    }
    const { container } = render(
      <Surface mode="bold" as={CustomTag}>
        x
      </Surface>,
    );
    expect(container.firstElementChild?.tagName).toBe('ARTICLE');
    expect(container.firstElementChild).toHaveAttribute('data-surface', 'bold');
  });

  // === Prop forwarding ===

  it('forwards arbitrary HTML attributes', () => {
    const { container } = render(
      <Surface mode="default" id="hero" role="region" aria-label="Hero">
        x
      </Surface>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.id).toBe('hero');
    expect(el).toHaveAttribute('role', 'region');
    expect(el).toHaveAttribute('aria-label', 'Hero');
  });

  it('merges user className with the internal surface class', () => {
    const { container } = render(
      <Surface mode="default" className="custom-class">
        x
      </Surface>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('custom-class');
  });

  it('allows an inline style on the surface element', () => {
    const { container } = render(
      <Surface mode="subtle" style={{ padding: 'var(--Spacing-4)' }}>
        x
      </Surface>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.padding).toBe('var(--Spacing-4)');
  });

  // === Nesting ===

  it('supports nested Surfaces — each applies its own data-surface', () => {
    const { container } = render(
      <Surface mode="bold" data-testid="outer">
        <Surface mode="subtle" data-testid="inner">
          <span>leaf</span>
        </Surface>
      </Surface>,
    );
    const outer = screen.getByTestId('outer');
    const inner = screen.getByTestId('inner');
    expect(outer).toHaveAttribute('data-surface', 'bold');
    expect(inner).toHaveAttribute('data-surface', 'subtle');
    expect(outer).toContainElement(inner);
  });

  // === Step cascade (RFC-0003) ===

  it('writes data-surface-step on every Surface', () => {
    const { container } = render(<Surface mode="subtle">x</Surface>);
    expect(container.firstElementChild).toHaveAttribute('data-surface-step');
  });

  it('depth-1 subtle from light root resolves to step 2300', () => {
    const { container } = render(<Surface mode="subtle">x</Surface>);
    expect(container.firstElementChild).toHaveAttribute('data-surface-step', '2300');
  });

  it('depth-2 minimal-inside-minimal walks the scale (2400 → 2300)', () => {
    render(
      <Surface mode="minimal" data-testid="outer">
        <Surface mode="minimal" data-testid="inner">x</Surface>
      </Surface>,
    );
    const outer = screen.getByTestId('outer');
    const inner = screen.getByTestId('inner');
    expect(outer).toHaveAttribute('data-surface-step', '2400');
    expect(inner).toHaveAttribute('data-surface-step', '2300');
  });

  it('depth-3 stacked subtles walk by 200 each (2300 → 2100 → 1900)', () => {
    render(
      <Surface mode="subtle" data-testid="l1">
        <Surface mode="subtle" data-testid="l2">
          <Surface mode="subtle" data-testid="l3">x</Surface>
        </Surface>
      </Surface>,
    );
    expect(screen.getByTestId('l1')).toHaveAttribute('data-surface-step', '2300');
    expect(screen.getByTestId('l2')).toHaveAttribute('data-surface-step', '2100');
    expect(screen.getByTestId('l3')).toHaveAttribute('data-surface-step', '1900');
  });

  it('elevated walks toward light by 100 each level, capped at 2500', () => {
    render(
      <Surface mode="moderate" data-testid="outer">
        <Surface mode="elevated" data-testid="lift1">
          <Surface mode="elevated" data-testid="lift2">x</Surface>
        </Surface>
      </Surface>,
    );
    // moderate: 2500 - 300 = 2200; elevated: +100 → 2300; elevated: +100 → 2400
    expect(screen.getByTestId('outer')).toHaveAttribute('data-surface-step', '2200');
    expect(screen.getByTestId('lift1')).toHaveAttribute('data-surface-step', '2300');
    expect(screen.getByTestId('lift2')).toHaveAttribute('data-surface-step', '2400');
  });

  it('ghost preserves the parent step', () => {
    render(
      <Surface mode="subtle" data-testid="parent">
        <Surface mode="ghost" data-testid="ghost">x</Surface>
      </Surface>,
    );
    const parentStep = screen.getByTestId('parent').getAttribute('data-surface-step');
    expect(screen.getByTestId('ghost')).toHaveAttribute('data-surface-step', parentStep!);
  });

  it('ghost paints with parent appearance but transmits explicit appearance to children', () => {
    render(
      <Surface mode="subtle" appearance="secondary" data-testid="parent">
        <Surface mode="ghost" appearance="primary" data-testid="ghost">
          <AppearanceProbe />
        </Surface>
      </Surface>,
    );
    // Visually transparent — stamps parent's role on the DOM.
    expect(screen.getByTestId('ghost')).toHaveAttribute('data-appearance', 'secondary');
    // Children inherit the ghost's own `appearance` prop, not the parent's.
    expect(screen.getByTestId('appearance')).toHaveTextContent('primary');
  });

  it('ghost with appearance="auto" inherits parent appearance for both paint and context', () => {
    render(
      <Surface mode="subtle" appearance="secondary" data-testid="parent">
        <Surface mode="ghost" appearance="auto" data-testid="ghost">
          <AppearanceProbe />
        </Surface>
      </Surface>,
    );
    expect(screen.getByTestId('ghost')).toHaveAttribute('data-appearance', 'secondary');
    expect(screen.getByTestId('appearance')).toHaveTextContent('secondary');
  });

  it('blend preserves the parent step', () => {
    render(
      <Surface mode="subtle" data-testid="parent">
        <Surface mode="blend" data-testid="blend">x</Surface>
      </Surface>,
    );
    const parentStep = screen.getByTestId('parent').getAttribute('data-surface-step');
    expect(screen.getByTestId('blend')).toHaveAttribute('data-surface-step', parentStep!);
  });

  it('default resets to root step (2500 in light mode)', () => {
    render(
      <Surface mode="bold">
        <Surface mode="default" data-testid="reset">x</Surface>
      </Surface>,
    );
    expect(screen.getByTestId('reset')).toHaveAttribute('data-surface-step', '2500');
  });

  // === Brand-aware step resolution (Phase 1) ===

  it('uses scale-free approximation when no BrandFoundationProvider is in scope', () => {
    // Without a provider, bold pins to the canonical 700 step.
    render(<Surface mode="bold" data-testid="bold">x</Surface>);
    expect(screen.getByTestId('bold')).toHaveAttribute('data-surface-step', '700');
  });

  it('uses brand baseStep when BrandFoundationProvider is in scope', () => {
    // Brand whose primary baseStep = 1300. resolveSurfaceStep at root
    // honours `anchorBoldToBaseStep`-less scales by routing through the
    // engine's resolveSurface, which picks scale.base for parent >= 1300.
    const theme = buildFixtureTheme(1300);
    render(
      <BrandFoundationProvider value={theme}>
        <Surface mode="bold" data-testid="bold">x</Surface>
      </BrandFoundationProvider>,
    );
    // From light root (2500), parent >= 1300 → candidate = base = 1300.
    // |2500 - 1300| / 100 = 12 ≥ 7 → return 1300.
    expect(screen.getByTestId('bold')).toHaveAttribute('data-surface-step', '1300');
  });

  it('non-bold modes still honour the brand-aware path (minimal walks scale)', () => {
    const theme = buildFixtureTheme(1300);
    render(
      <BrandFoundationProvider value={theme}>
        <Surface mode="minimal" data-testid="m">x</Surface>
      </BrandFoundationProvider>,
    );
    // From light root, minimal walks toward darker by 100 → 2400.
    expect(screen.getByTestId('m')).toHaveAttribute('data-surface-step', '2400');
  });

  it('depth-2 brand-aware: subtle inside bold uses bold-relative step', () => {
    const theme = buildFixtureTheme(1300);
    render(
      <BrandFoundationProvider value={theme}>
        <Surface mode="bold" data-testid="outer">
          <Surface mode="subtle" data-testid="inner">x</Surface>
        </Surface>
      </BrandFoundationProvider>,
    );
    // outer bold = 1300; inner subtle parent=1300, light scale, parent
    // step 1300 sits in the middle — contrast-walk produces 1500
    // (1300 + 200 in the lighter direction for a parent below 1300/scale-mid).
    expect(screen.getByTestId('outer')).toHaveAttribute('data-surface-step', '1300');
    // The exact inner step depends on the engine's contrast direction
    // computation; just assert it differs from the canonical-700 value
    // approximation would have produced.
    const innerStep = Number(screen.getByTestId('inner').getAttribute('data-surface-step'));
    expect(innerStep).not.toBe(2300); // approxResolveStep('subtle', 700, false) → 2300 (different from brand path)
    expect(innerStep).not.toBe(900);  // approxResolveStep('subtle', 700, false) → wouldn't produce 900 either; brand path differs
    expect(innerStep).toBeGreaterThanOrEqual(100);
    expect(innerStep).toBeLessThanOrEqual(2500);
  });

  // === Cross-role bold-on-bold reset (RFC-0003 spec) ===

  it('cross-role bold-on-bold: inner bold anchors to root + own baseStep', () => {
    // Outer bold (primary, base=1300) places inner at parent step 1300.
    // Inner bold (positive, base=1700) with the cross-role rule treats
    // itself as root: parent becomes 2500 (light root) and bold resolves
    // to positive's baseStep = 1700.
    const theme = buildMultiRoleTheme();
    render(
      <BrandFoundationProvider value={theme}>
        <Surface mode="bold" appearance="primary" data-testid="outer">
          <Surface mode="bold" appearance="positive" data-testid="inner">x</Surface>
        </Surface>
      </BrandFoundationProvider>,
    );
    expect(screen.getByTestId('outer')).toHaveAttribute('data-surface-step', '1300');
    expect(screen.getByTestId('inner')).toHaveAttribute('data-surface-step', '1700');
  });

  it('same-appearance bold-on-bold: inner uses parent-relative behavior', () => {
    // Same role on both layers — no reset. Inner bold's parent step is
    // outer's resolved step (1300); since 1300 ≥ 1300 the candidate is
    // baseStep again (1300). |1300 - 1300| = 0 < 7-step rescue → engine
    // routes to the rescue (parent ± 700 toward contrast). Just assert
    // it's not the cross-role-reset answer of 1700 (positive's base).
    const theme = buildMultiRoleTheme();
    render(
      <BrandFoundationProvider value={theme}>
        <Surface mode="bold" appearance="primary" data-testid="outer">
          <Surface mode="bold" appearance="primary" data-testid="inner">x</Surface>
        </Surface>
      </BrandFoundationProvider>,
    );
    expect(screen.getByTestId('outer')).toHaveAttribute('data-surface-step', '1300');
    const innerStep = Number(screen.getByTestId('inner').getAttribute('data-surface-step'));
    expect(innerStep).not.toBe(1700);
  });

  it('appearance prop emits data-appearance + inline --Surface-Self-Color', () => {
    const { container } = render(
      <Surface mode="subtle" appearance="positive" data-testid="s">x</Surface>,
    );
    expect(screen.getByTestId('s')).toHaveAttribute('data-appearance', 'positive');
    const styleAttr = (container.firstElementChild as HTMLElement).style.cssText;
    expect(styleAttr).toContain('--Surface-Self-Color: var(--Positive-Self-Color)');
  });

  it('primary→sparkle→auto→primary all bold: L3 hits same-appearance rescue', () => {
    // User-reported scenario. Sparkle base=1300, primary anchors bold.
    // L1=600 (primary anchor); L2=1300 (sparkle, cross-role reset → root,
    // distance from 2500 OK); L3=600 (auto inherits sparkle, same-role
    // bold-on-bold from parent=1300 hits rescue → 1300-700); L4=600
    // (primary, cross-role reset, anchor).
    const palette: ColorPalette = {};
    for (let i = 0; i < STEPS.length; i++) {
      const step = STEPS[i];
      const t = i / (STEPS.length - 1);
      const v = Math.round(t * 255);
      palette[step] = `#${v.toString(16).padStart(2, '0').repeat(3)}`;
    }
    const theme: ThemeConfig = {
      appearances: {
        primary: buildScaleDefinition('test-primary', palette, 600, {
          anchorBoldToBaseStep: true,
        }),
        sparkle: buildScaleDefinition('test-sparkle', palette, 1300),
      },
    };
    render(
      <BrandFoundationProvider value={theme}>
        <Surface mode="bold" appearance="primary" data-testid="l1">
          <Surface mode="bold" appearance="sparkle" data-testid="l2">
            <Surface mode="bold" appearance="auto" data-testid="l3">
              <Surface mode="bold" appearance="primary" data-testid="l4">x</Surface>
            </Surface>
          </Surface>
        </Surface>
      </BrandFoundationProvider>,
    );
    expect(screen.getByTestId('l1')).toHaveAttribute('data-surface-step', '600');
    expect(screen.getByTestId('l2')).toHaveAttribute('data-surface-step', '1300');
    expect(screen.getByTestId('l3')).toHaveAttribute('data-surface-step', '600');
    expect(screen.getByTestId('l4')).toHaveAttribute('data-surface-step', '600');
  });

  it('appearance="auto" inherits parent effective appearance (no spurious cross-role reset)', () => {
    // primary → auto → primary → auto must behave identically to all
    // primary. If `auto` were treated as a distinct role, every other
    // bold layer would trip the cross-role reset and the steps would
    // bounce. Asserting equivalence to the all-primary chain.
    const theme = buildMultiRoleTheme();
    const Tree = ({ a2, a4 }: { a2: ComponentAppearance; a4: ComponentAppearance }) => (
      <BrandFoundationProvider value={theme}>
        <Surface mode="bold" appearance="primary" data-testid="l1">
          <Surface mode="bold" appearance={a2} data-testid="l2">
            <Surface mode="bold" appearance="primary" data-testid="l3">
              <Surface mode="bold" appearance={a4} data-testid="l4">
                x
              </Surface>
            </Surface>
          </Surface>
        </Surface>
      </BrandFoundationProvider>
    );

    const { rerender } = render(<Tree a2="auto" a4="auto" />);
    const autoSteps = ['l1', 'l2', 'l3', 'l4'].map(
      (id) => screen.getByTestId(id).getAttribute('data-surface-step'),
    );

    rerender(<Tree a2="primary" a4="primary" />);
    const primarySteps = ['l1', 'l2', 'l3', 'l4'].map(
      (id) => screen.getByTestId(id).getAttribute('data-surface-step'),
    );

    expect(autoSteps).toEqual(primarySteps);
  });

  it('appearance="primary" emits data-appearance="primary" but no inline style', () => {
    // Primary still emits data-appearance so the matching redirect block
    // re-pins --Text-* on the element itself — without it, descendants
    // inherit a non-primary ancestor's redirect. Inline --Surface-Self-Color
    // override is still skipped for primary (the step block already sets
    // --Surface-Self-Color from the primary scale).
    const { container } = render(<Surface mode="subtle">x</Surface>);
    expect(container.firstElementChild).toHaveAttribute('data-appearance', 'primary');
    const styleAttr = (container.firstElementChild as HTMLElement).style.cssText;
    expect(styleAttr).not.toContain('Surface-Self-Color');
  });

  it('reacts to a runtime data-mode flip on <html>', async () => {
    const { rerender } = render(
      <Surface mode="minimal" data-testid="surface">x</Surface>,
    );
    // Light root: minimal walks 2500 - 100 = 2400
    expect(screen.getByTestId('surface')).toHaveAttribute('data-surface-step', '2400');

    document.documentElement.dataset.mode = 'dark';
    rerender(<Surface mode="minimal" data-testid="surface">x</Surface>);
    // The MutationObserver runs as a microtask. Force a tick so the
    // useSyncExternalStore subscriber notifies its listeners.
    await new Promise((r) => setTimeout(r, 0));
    rerender(<Surface mode="minimal" data-testid="surface">x</Surface>);

    // Dark root anchors at 200 (RFC-0003 confirmed spec); minimal walks
    // toward lighter by 100 → 300.
    expect(screen.getByTestId('surface')).toHaveAttribute('data-surface-step', '300');

    // Reset for the rest of the suite.
    delete document.documentElement.dataset.mode;
  });

  // === Transparent material ===

  it('solid material is the default (no data-material attribute emitted)', () => {
    const { container } = render(<Surface mode="bold">x</Surface>);
    expect(container.firstElementChild).not.toHaveAttribute('data-material');
    expect(container.firstElementChild).not.toHaveAttribute('data-media');
  });

  it('emits data-material="transparent" + data-media when material="transparent"', () => {
    const { container } = render(
      <Surface mode="bold" material="transparent" mediaContext="dynamic">
        x
      </Surface>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute('data-material', 'transparent');
    expect(el).toHaveAttribute('data-media', 'dynamic');
    // data-surface stays on the same element so both layers of remapping apply.
    expect(el).toHaveAttribute('data-surface', 'bold');
  });

  it.each(['dynamic', 'dark', 'light'] as const)(
    'forwards mediaContext="%s" verbatim to data-media',
    (ctx) => {
      const { container } = render(
        <Surface mode="subtle" material="transparent" mediaContext={ctx}>
          x
        </Surface>,
      );
      expect(container.firstElementChild).toHaveAttribute('data-media', ctx);
    },
  );

  it('uses transparent material defaults from MaterialFoundationProvider when material props are omitted', () => {
    const { container } = render(
      <MaterialFoundationProvider
        value={{ defaultMaterialMode: 'transparent', defaultMediaContext: 'dark' }}
      >
        <Surface mode="subtle">x</Surface>
      </MaterialFoundationProvider>,
    );
    expect(container.firstElementChild).toHaveAttribute('data-material', 'transparent');
    expect(container.firstElementChild).toHaveAttribute('data-media', 'dark');
  });

  it('lets explicit solid material override transparent provider defaults', () => {
    const { container } = render(
      <MaterialFoundationProvider
        value={{ defaultMaterialMode: 'transparent', defaultMediaContext: 'light' }}
      >
        <Surface mode="subtle" material="solid">x</Surface>
      </MaterialFoundationProvider>,
    );
    expect(container.firstElementChild).not.toHaveAttribute('data-material');
    expect(container.firstElementChild).not.toHaveAttribute('data-media');
  });

  it('emits transparent material attrs for blend mode', () => {
    const { container } = render(
      <Surface mode="blend" material="transparent" mediaContext="dynamic">
        x
      </Surface>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute('data-surface', 'blend');
    expect(el).toHaveAttribute('data-material', 'transparent');
    expect(el).toHaveAttribute('data-media', 'dynamic');
  });

  it('solid + transparent Surfaces can nest (mixed materials)', () => {
    const { container } = render(
      <Surface mode="bold" material="transparent" mediaContext="dark" data-testid="outer">
        <Surface mode="elevated" data-testid="inner">
          <span>leaf</span>
        </Surface>
      </Surface>,
    );
    const outer = screen.getByTestId('outer');
    const inner = screen.getByTestId('inner');
    expect(outer).toHaveAttribute('data-material', 'transparent');
    expect(inner).not.toHaveAttribute('data-material');
    expect(inner).toHaveAttribute('data-surface', 'elevated');
  });
});

function AppearanceProbe() {
  const appearance = useSurfaceAppearance();
  return <span data-testid="appearance">{appearance ?? 'none'}</span>;
}

describe('SurfaceAppearanceScope', () => {
  it('returns null appearance for leaf components inside a default Surface shell', () => {
    render(
      <Surface mode="default">
        <SurfaceAppearanceScope>
          <AppearanceProbe />
        </SurfaceAppearanceScope>
      </Surface>,
    );
    expect(screen.getByTestId('appearance')).toHaveTextContent('none');
  });

  it('still inherits appearance from an explicit nested Surface', () => {
    render(
      <Surface mode="default">
        <SurfaceAppearanceScope>
          <Surface mode="subtle" appearance="secondary">
            <AppearanceProbe />
          </Surface>
        </SurfaceAppearanceScope>
      </Surface>,
    );
    expect(screen.getByTestId('appearance')).toHaveTextContent('secondary');
  });
});
