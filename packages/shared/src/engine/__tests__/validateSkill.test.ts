import { describe, it, expect } from 'vitest';
import { validateSkill } from '../compositionValidator';

const CLEAN_DRAFT = `Generate a {brand} login screen.
Use Surface mode="default" for the page; the form sits on the default surface.
Spacing: var(--Spacing-4) between fields, var(--Spacing-4-5) between sections.
One primary CTA per screen.`;

describe('validateSkill', () => {
  it('returns valid:true with zero issues for a clean draft', () => {
    const result = validateSkill(CLEAN_DRAFT);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('flags EMPTY_DRAFT (error) for blank input and short-circuits', () => {
    const result = validateSkill('   \n\t  ');
    expect(result.valid).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].code).toBe('EMPTY_DRAFT');
    expect(result.issues[0].level).toBe('error');
  });

  it('flags MISSING_BRAND_PLACEHOLDER (error) when {brand} is absent', () => {
    const draft = 'Generate a login screen using Surface mode="default" with var(--Spacing-4).';
    const result = validateSkill(draft);
    expect(result.valid).toBe(false);
    expect(result.issues.map((i) => i.code)).toContain('MISSING_BRAND_PLACEHOLDER');
  });

  it('flags HARDCODED_HEX (error) when a hex literal is present', () => {
    const draft = `Generate a {brand} hero with surface bold.
Background: #FF5733. Use var(--Spacing-4-5).`;
    const result = validateSkill(draft);
    expect(result.valid).toBe(false);
    const codes = result.issues.map((i) => i.code);
    expect(codes).toContain('HARDCODED_HEX');
  });

  it('does NOT flag HARDCODED_PX when px appears only inside var() fallbacks', () => {
    const draft = `Generate a {brand} screen on the default surface.
Spacing: var(--Spacing-4).`;
    const result = validateSkill(draft);
    expect(result.issues.map((i) => i.code)).not.toContain('HARDCODED_PX');
  });

  it('flags HARDCODED_PX (warning) when a bare px value appears outside var()', () => {
    const draft = `Generate a {brand} screen on the default surface.
Padding: 16px around the form.`;
    const result = validateSkill(draft);
    const issue = result.issues.find((i) => i.code === 'HARDCODED_PX');
    expect(issue).toBeDefined();
    expect(issue!.level).toBe('warning');
    // Warnings do NOT block validity.
    expect(result.valid).toBe(true);
  });

  it('flags MISSING_SURFACE_GUIDANCE (warning) when neither surface nor Surface appears', () => {
    const draft = `Generate a {brand} settings screen with toggles and a save button.
Use var(--Spacing-4) between rows.`;
    const result = validateSkill(draft);
    const codes = result.issues.map((i) => i.code);
    expect(codes).toContain('MISSING_SURFACE_GUIDANCE');
    expect(result.valid).toBe(true); // warning only
  });

  it('flags EXCESSIVE_LENGTH (warning) when draft exceeds 2000 chars', () => {
    const draft = `Generate a {brand} surface-aware screen. ${'lorem ipsum '.repeat(200)}`;
    expect(draft.length).toBeGreaterThan(2000);
    const result = validateSkill(draft);
    const issue = result.issues.find((i) => i.code === 'EXCESSIVE_LENGTH');
    expect(issue).toBeDefined();
    expect(issue!.level).toBe('warning');
    expect(result.valid).toBe(true); // warning only
  });

  it('reports multiple issues simultaneously when present', () => {
    // Missing {brand} (error) + missing surface (warning) + bare px (warning)
    const draft = 'Generate a settings page. Padding: 24px around content.';
    const result = validateSkill(draft);
    const codes = result.issues.map((i) => i.code);
    expect(codes).toEqual(
      expect.arrayContaining(['MISSING_BRAND_PLACEHOLDER', 'MISSING_SURFACE_GUIDANCE', 'HARDCODED_PX']),
    );
    // Has an error → invalid.
    expect(result.valid).toBe(false);
  });

  it('valid:true when only warning-level issues exist', () => {
    // Has {brand}, has surface guidance — but uses bare px (warning).
    const draft = `Generate a {brand} screen on the default surface.\nPadding: 8px around content.`;
    const result = validateSkill(draft);
    expect(result.issues.some((i) => i.level === 'warning')).toBe(true);
    expect(result.issues.some((i) => i.level === 'error')).toBe(false);
    expect(result.valid).toBe(true);
  });

  it('valid:false when any error coexists with warnings', () => {
    // Mixed: missing {brand} (error) + bare px (warning) + missing surface (warning).
    const draft = 'Generate a settings page. Padding: 8px.';
    const result = validateSkill(draft);
    expect(result.issues.some((i) => i.level === 'error')).toBe(true);
    expect(result.issues.some((i) => i.level === 'warning')).toBe(true);
    expect(result.valid).toBe(false);
  });
});
