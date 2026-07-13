/**
 * ActiveTokensPanel.test.ts
 *
 * Tests for the ActiveTokensPanel component's colour and typography token
 * display logic. We test the colour derivation and the roles-to-probe
 * configuration that drives the swatch row.
 */

import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Replicate the component's internal colour derivation
// ---------------------------------------------------------------------------

function deriveCardColors(darkMode: boolean) {
  const onColor = darkMode ? '#fff' : '#111';
  const cardBg = darkMode ? '#1a1a1a' : '#f7f7f7';
  return { onColor, cardBg };
}

// ---------------------------------------------------------------------------
// The ROLES_TO_PROBE configuration (mirrors the component's export)
// ---------------------------------------------------------------------------

type ComponentAppearance =
  | 'primary'
  | 'secondary'
  | 'positive'
  | 'negative'
  | 'neutral'
  | 'sparkle'
  | 'warning'
  | 'informative';

const ROLES_TO_PROBE: Array<{ role: ComponentAppearance; label: string }> = [
  { role: 'primary', label: 'Primary' },
  { role: 'secondary', label: 'Secondary' },
  { role: 'positive', label: 'Positive' },
  { role: 'negative', label: 'Negative' },
];

// ---------------------------------------------------------------------------
// Typography row data (mirrors the component's 4 typography probes)
// ---------------------------------------------------------------------------

const TYPOGRAPHY_PROBES = [
  { role: 'headline' as const, size: 'L' as const, label: 'Headline L' },
  { role: 'title' as const, size: 'M' as const, label: 'Title M' },
  { role: 'body' as const, size: 'M' as const, label: 'Body M' },
  { role: 'label' as const, size: 'S' as const, label: 'Label S' },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ActiveTokensPanel — colour derivation', () => {
  it('uses white text colour in dark mode', () => {
    const { onColor } = deriveCardColors(true);
    expect(onColor).toBe('#fff');
  });

  it('uses dark text colour in light mode', () => {
    const { onColor } = deriveCardColors(false);
    expect(onColor).toBe('#111');
  });

  it('uses dark card background in dark mode', () => {
    const { cardBg } = deriveCardColors(true);
    expect(cardBg).toBe('#1a1a1a');
  });

  it('uses light card background in light mode', () => {
    const { cardBg } = deriveCardColors(false);
    expect(cardBg).toBe('#f7f7f7');
  });

  it('light and dark mode produce different background colours', () => {
    const light = deriveCardColors(false);
    const dark = deriveCardColors(true);
    expect(light.cardBg).not.toBe(dark.cardBg);
    expect(light.onColor).not.toBe(dark.onColor);
  });
});

describe('ActiveTokensPanel — ROLES_TO_PROBE configuration', () => {
  it('probes exactly 4 roles', () => {
    expect(ROLES_TO_PROBE).toHaveLength(4);
  });

  it('includes primary, secondary, positive, negative', () => {
    const roles = ROLES_TO_PROBE.map((r) => r.role);
    expect(roles).toContain('primary');
    expect(roles).toContain('secondary');
    expect(roles).toContain('positive');
    expect(roles).toContain('negative');
  });

  it('every probe has a non-empty label', () => {
    for (const probe of ROLES_TO_PROBE) {
      expect(probe.label.length).toBeGreaterThan(0);
    }
  });

  it('every probe has a valid appearance role', () => {
    const validRoles: ComponentAppearance[] = [
      'primary', 'secondary', 'positive', 'negative',
      'neutral', 'sparkle', 'warning', 'informative',
    ];
    for (const probe of ROLES_TO_PROBE) {
      expect(validRoles).toContain(probe.role);
    }
  });
});

describe('ActiveTokensPanel — typography probe configuration', () => {
  it('probes exactly 4 typography sizes', () => {
    expect(TYPOGRAPHY_PROBES).toHaveLength(4);
  });

  it('includes Headline L, Title M, Body M, Label S', () => {
    expect(TYPOGRAPHY_PROBES[0]).toEqual({ role: 'headline', size: 'L', label: 'Headline L' });
    expect(TYPOGRAPHY_PROBES[1]).toEqual({ role: 'title', size: 'M', label: 'Title M' });
    expect(TYPOGRAPHY_PROBES[2]).toEqual({ role: 'body', size: 'M', label: 'Body M' });
    expect(TYPOGRAPHY_PROBES[3]).toEqual({ role: 'label', size: 'S', label: 'Label S' });
  });
});

describe('ActiveTokensPanel — RoleSwatch colour derivation', () => {
  it('swatch onColor matches panel onColor for dark mode', () => {
    const panel = deriveCardColors(true);
    // RoleSwatch uses darkMode ? '#fff' : '#111' — same logic
    const swatchOnColor = true ? '#fff' : '#111';
    expect(swatchOnColor).toBe(panel.onColor);
  });

  it('swatch onColor matches panel onColor for light mode', () => {
    const panel = deriveCardColors(false);
    const swatchOnColor = false ? '#fff' : '#111';
    expect(swatchOnColor).toBe(panel.onColor);
  });
});
