/**
 * composerContextMenu.test.tsx
 *
 * The composer context-menu (CHAT-03) collapses the run-origin selectors
 * behind a single summary trigger that opens a popover. These tests verify the
 * trigger summarises the resolved context, falls back to a "set context" prompt
 * when no real brand is resolved, and that the popover body still hosts the
 * Selects (the strip logic is reused verbatim).
 *
 * Convex + Select are mocked exactly as in composerControlStrip.test.tsx; the
 * Popover is mocked to render trigger + content inline so the test asserts wiring
 * without portal/positioning concerns.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { type ArtifactType, type OutputProfile } from '@oneui/experience-builder-core';

const brandsQueryResult: { current: unknown } = { current: undefined };
const subBrandsQueryResult: { current: unknown } = { current: undefined };

vi.mock('convex/react', () => ({
  useQuery: (ref: string, arg?: unknown) => {
    if (ref === 'getByParentBrand') return arg === 'skip' ? undefined : subBrandsQueryResult.current;
    return brandsQueryResult.current;
  },
}));

vi.mock('@oneui/convex', () => ({
  api: {
    brands: { list: 'list' },
    subBrandConfigs: { getByParentBrand: 'getByParentBrand' },
  },
}));

vi.mock('@oneui/ui-internal/components/Select/Select', () => ({
  Select: ({
    onChange,
    options,
    'aria-label': ariaLabel,
  }: {
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    'aria-label'?: string;
  }) => (
    <select
      aria-label={ariaLabel}
      data-testid={`select-${ariaLabel}`}
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

// Render the popover trigger + content inline (no portal) so wiring is assertable.
vi.mock('@oneui/ui-internal/components/Popover/Popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children, ...props }: { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
  PopoverPortal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { ComposerContextMenu } from '../_chat/ComposerContextMenu';

const BRANDS = [
  { _id: 'brand-jio', name: 'Jio' },
  { _id: 'brand-jiomart', name: 'JioMart' },
];

type Value = {
  brandId: string;
  subBrandConfigId?: string;
  artifactType: ArtifactType;
  outputProfile: OutputProfile;
};

function makeValue(overrides: Partial<Value> = {}): Value {
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
});

describe('ComposerContextMenu (CHAT-03)', () => {
  it('summarises the resolved context on the trigger', () => {
    render(<ComposerContextMenu value={makeValue()} onChange={vi.fn()} />);
    const trigger = screen.getByTestId('composer-context-trigger');
    expect(trigger.textContent).toContain('Jio');
    expect(trigger.textContent).toContain('Web UI');
    expect(trigger.textContent).toContain('Desktop');
    expect(trigger.getAttribute('data-incomplete')).toBeNull();
  });

  it('prompts to set context + flags incomplete when no real brand is resolved', () => {
    render(<ComposerContextMenu value={makeValue({ brandId: '' })} onChange={vi.fn()} />);
    const trigger = screen.getByTestId('composer-context-trigger');
    expect(trigger.textContent).toContain('Set generation context');
    expect(trigger.getAttribute('data-incomplete')).toBe('true');
  });

  it('hosts the selectors in the popover body', () => {
    render(<ComposerContextMenu value={makeValue()} onChange={vi.fn()} />);
    expect(screen.getByTestId('select-Brand')).toBeTruthy();
    expect(screen.getByTestId('select-Sub-brand')).toBeTruthy();
    expect(screen.getByTestId('select-Artifact type')).toBeTruthy();
    expect(screen.getByTestId('select-Output profile')).toBeTruthy();
    expect(screen.getByTestId('select-Image source')).toBeTruthy();
  });
});
