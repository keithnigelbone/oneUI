/**
 * composerControlStrip.test.tsx (jsdom)
 *
 * Behavioural coverage for the chat composer control strip (CHAT-03, D-07).
 * The strip lifts the brand / sub-brand / artifact-type / output-profile
 * selectors out of the retired `RequestPanel`, but as a CONTROLLED component:
 * it holds no tldraw shape, only the lifted React `value`/`onChange` contract.
 *
 *   - CHAT-03 (Test 1): `Select`s render with options derived from the
 *     (mocked) real Convex queries + `ARTIFACT_TYPES` + `getValidProfilesForType`.
 *   - CHAT-03 (Test 2, Pitfall 4): with an unresolved/stale brandId, the
 *     dependent `getByParentBrand` query is passed `'skip'` (never a raw id) so
 *     `v.id('brands')` never throws an ArgumentValidationError that would crash
 *     the canvas; the sub-brand Select shows the "Select a brand first"
 *     placeholder.
 *   - CHAT-03 (Test 3, auto-snap): changing the artifact type to one whose valid
 *     profiles exclude the current profile fires `onChange` to snap the profile
 *     to the first valid profile for the new type.
 *
 * The heavy Base UI `Select` Jio component is mocked to a thin, deterministic
 * test double that exposes its `options` + `onChange` (mirrors the RequestPanel
 * test strategy) so the test exercises the strip's real option-derivation +
 * lift-to-onChange logic without depending on Base UI portal/keyboard internals.
 * `convex/react` + `@oneui/convex` are mocked the same way.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  getValidProfilesForType,
  type ArtifactType,
  type OutputProfile,
} from '@oneui/experience-builder-core';

// ---------------------------------------------------------------------------
// Convex mocks (mirror requestPanel.test.tsx strategy)
// ---------------------------------------------------------------------------

const brandsQueryResult: { current: unknown } = { current: undefined };
const subBrandsQueryResult: { current: unknown } = { current: undefined };
const subBrandArg: { current: unknown } = { current: undefined };

vi.mock('convex/react', () => ({
  useQuery: (ref: string, arg?: unknown) => {
    if (ref === 'getByParentBrand') {
      subBrandArg.current = arg;
      return arg === 'skip' ? undefined : subBrandsQueryResult.current;
    }
    return brandsQueryResult.current;
  },
}));

vi.mock('@oneui/convex', () => ({
  api: {
    brands: { list: 'list' },
    subBrandConfigs: { getByParentBrand: 'getByParentBrand' },
  },
}));

// ---------------------------------------------------------------------------
// Jio component test double — thin Select exposing options + onChange.
// ---------------------------------------------------------------------------

vi.mock('@oneui/ui-internal/components/Select/Select', () => ({
  Select: ({
    value,
    onChange,
    options,
    placeholder,
    'aria-label': ariaLabel,
  }: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    'aria-label'?: string;
  }) => (
    <select
      aria-label={ariaLabel}
      data-testid={`select-${ariaLabel}`}
      data-placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));

// Imported AFTER the mocks so the strip picks up the doubles.
import { ComposerControlStrip } from '../_chat/ComposerControlStrip';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const BRANDS = [
  { _id: 'brand-jio', name: 'Jio' },
  { _id: 'brand-jiomart', name: 'JioMart' },
];

const SUB_BRANDS = [
  { _id: 'sub-1', name: 'Jio Diwali' },
  { _id: 'sub-2', name: 'Jio Cricket' },
];

type StripValue = {
  brandId: string;
  subBrandConfigId?: string;
  artifactType: ArtifactType;
  outputProfile: OutputProfile;
};

function makeValue(overrides: Partial<StripValue> = {}): StripValue {
  return {
    brandId: 'brand-jio',
    artifactType: 'web-ui',
    outputProfile: 'web-desktop',
    ...overrides,
  };
}

beforeEach(() => {
  brandsQueryResult.current = BRANDS;
  subBrandsQueryResult.current = undefined;
  subBrandArg.current = undefined;
});

// ---------------------------------------------------------------------------
// Test 1 — selectors render from the mocked queries + core helpers
// ---------------------------------------------------------------------------

describe('ComposerControlStrip selectors (CHAT-03)', () => {
  it('renders the context Selects', () => {
    render(<ComposerControlStrip value={makeValue()} onChange={vi.fn()} />);
    expect(screen.getByTestId('select-Brand')).toBeTruthy();
    expect(screen.getByTestId('select-Sub-brand')).toBeTruthy();
    expect(screen.getByTestId('select-Artifact type')).toBeTruthy();
    expect(screen.getByTestId('select-Output profile')).toBeTruthy();
    expect(screen.getByTestId('select-Image source')).toBeTruthy();
  });

  it('renders one brand option per brand from the brands.list query', () => {
    render(<ComposerControlStrip value={makeValue()} onChange={vi.fn()} />);
    const brandSelect = screen.getByTestId('select-Brand') as HTMLSelectElement;
    const labels = Array.from(brandSelect.options).map((o) => o.textContent);
    expect(labels).toEqual(['Jio', 'JioMart']);
  });

  it('output-profile options match getValidProfilesForType for the selected type', () => {
    render(
      <ComposerControlStrip
        value={makeValue({ artifactType: 'web-ui', outputProfile: 'web-desktop' })}
        onChange={vi.fn()}
      />,
    );
    const profileSelect = screen.getByTestId('select-Output profile') as HTMLSelectElement;
    const offered = Array.from(profileSelect.options).map((o) => o.value);
    expect(offered).toEqual(getValidProfilesForType('web-ui').map((p) => p.id));
  });
});

// ---------------------------------------------------------------------------
// Test 2 — sub-brand skip-gate (Pitfall 4)
// ---------------------------------------------------------------------------

describe('ComposerControlStrip sub-brand skip-gate (CHAT-03 / Pitfall 4)', () => {
  it('skips the query (passes "skip") and shows the "Select a brand first" placeholder when no brand chosen', () => {
    subBrandsQueryResult.current = SUB_BRANDS; // even if data exists, must not fetch
    render(
      <ComposerControlStrip value={makeValue({ brandId: '' })} onChange={vi.fn()} />,
    );
    const subSelect = screen.getByTestId('select-Sub-brand') as HTMLSelectElement;
    // Only the default "(Parent brand only)" option — no sub-brands fetched.
    expect(Array.from(subSelect.options).map((o) => o.value)).toEqual(['']);
    expect(subBrandArg.current).toBe('skip');
    expect(subSelect.getAttribute('data-placeholder')).toBe('Select a brand first');
  });

  it('skips the query when brandId is stale/unknown (not a real brand _id)', () => {
    // Regression (02.1): a stale placeholder brandId like 'jio' (NOT a Convex
    // Id<'brands'>) must NOT reach getByParentBrand, whose v.id('brands')
    // validator would crash the canvas.
    subBrandsQueryResult.current = SUB_BRANDS;
    render(
      <ComposerControlStrip value={makeValue({ brandId: 'jio' })} onChange={vi.fn()} />,
    );
    const subSelect = screen.getByTestId('select-Sub-brand') as HTMLSelectElement;
    expect(Array.from(subSelect.options).map((o) => o.value)).toEqual(['']);
    expect(subBrandArg.current).toBe('skip');
  });

  it('populates from getByParentBrand once a resolved brand is selected', () => {
    subBrandsQueryResult.current = SUB_BRANDS;
    render(
      <ComposerControlStrip
        value={makeValue({ brandId: 'brand-jio' })}
        onChange={vi.fn()}
      />,
    );
    const subSelect = screen.getByTestId('select-Sub-brand') as HTMLSelectElement;
    const labels = Array.from(subSelect.options).map((o) => o.textContent);
    expect(labels).toEqual(['(Parent brand only)', 'Jio Diwali', 'Jio Cricket']);
    expect(subBrandArg.current).toEqual({ parentBrandId: 'brand-jio' });
  });
});

// ---------------------------------------------------------------------------
// Test 3 — type-change auto-snaps an invalid profile
// ---------------------------------------------------------------------------

describe('ComposerControlStrip type/profile auto-snap (CHAT-03)', () => {
  it('snaps the profile to the first valid one when the new type excludes the current profile', () => {
    const onChange = vi.fn();
    render(
      <ComposerControlStrip
        value={makeValue({ artifactType: 'web-ui', outputProfile: 'web-desktop' })}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByTestId('select-Artifact type'), {
      target: { value: 'slide' as ArtifactType },
    });
    // The single onChange carries BOTH the new type and the snapped profile.
    const firstValidSlide = getValidProfilesForType('slide')[0].id;
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        artifactType: 'slide',
        outputProfile: firstValidSlide,
      }),
    );
  });

  it('keeps the current profile when it is still valid for the new type', () => {
    const onChange = vi.fn();
    // web-desktop is valid for both web-ui and dashboard.
    const validForDashboard = getValidProfilesForType('dashboard').map((p) => p.id);
    const sharedProfile = validForDashboard.includes('web-desktop')
      ? 'web-desktop'
      : validForDashboard[0];
    render(
      <ComposerControlStrip
        value={makeValue({ artifactType: 'web-ui', outputProfile: sharedProfile })}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByTestId('select-Artifact type'), {
      target: { value: 'dashboard' as ArtifactType },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ artifactType: 'dashboard', outputProfile: sharedProfile }),
    );
  });
});

// ---------------------------------------------------------------------------
// Controlled lift — selections call onChange, never a tldraw write
// ---------------------------------------------------------------------------

describe('ComposerControlStrip controlled lift (CHAT-03 / D-07)', () => {
  it('lifts a brand selection through onChange', () => {
    const onChange = vi.fn();
    render(<ComposerControlStrip value={makeValue()} onChange={onChange} />);
    fireEvent.change(screen.getByTestId('select-Brand'), {
      target: { value: 'brand-jiomart' },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ brandId: 'brand-jiomart' }),
    );
  });

  it('lifts a sub-brand selection and clears it to undefined on "(Parent brand only)"', () => {
    subBrandsQueryResult.current = SUB_BRANDS;
    const onChange = vi.fn();
    render(
      <ComposerControlStrip
        value={makeValue({ brandId: 'brand-jio', subBrandConfigId: 'sub-1' })}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByTestId('select-Sub-brand'), {
      target: { value: '' },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ subBrandConfigId: undefined }),
    );
  });
});
