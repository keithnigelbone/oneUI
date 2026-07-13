/**
 * requestPanel.test.tsx (jsdom)
 *
 * Behavioural coverage for the docked request panel (INPUT-01..04, D-02/D-03/D-04):
 *
 *   - INPUT-01 / D-02: brand options render from the (mocked) real Convex
 *     `brands.list` query.
 *   - INPUT-02 / INPUT-03 / D-03: selecting an artifact type updates the
 *     output-profile options to EXACTLY `getValidProfilesForType(type)`, and an
 *     invalid type/profile pairing is never offered.
 *   - D-04: editing brand / type / profile / prompt persists onto the selected
 *     prompt card's props via `editor.updateShape`.
 *   - INPUT-04: the Run CTA invokes the run flow.
 *
 * The heavy Base UI `Select` / `InputField` Jio components are mocked to thin,
 * deterministic test doubles that expose their `options` + `onChange` — so the
 * test exercises the PANEL'S real option-derivation + persistence logic (the
 * behaviour under contract) without depending on Base UI portal/keyboard
 * internals, which are brittle in jsdom. `convex/react` + `@oneui/convex` are
 * mocked the same way the existing `useBrandsCatalog` test mocks them.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  getValidProfilesForType,
  type ArtifactType,
} from '@oneui/experience-builder-core';

// ---------------------------------------------------------------------------
// Convex mocks (mirror useBrandsCatalog.test.ts strategy)
// ---------------------------------------------------------------------------

const brandsQueryResult: { current: unknown } = { current: undefined };
// The panel now issues TWO distinct useQuery calls (brands.list + the dependent
// sub-brand getByParentBrand). Branch by query ref so each gets its own result.
// `subBrandArg` captures the second arg of the sub-brand query so a test can
// assert it is `'skip'` until a brand is chosen (D-02).
const subBrandsQueryResult: { current: unknown } = { current: undefined };
const subBrandArg: { current: unknown } = { current: undefined };

vi.mock('convex/react', () => ({
  useQuery: (ref: string, arg?: unknown) => {
    if (ref === 'getByParentBrand') {
      subBrandArg.current = arg;
      // A skipped dependent query never resolves data.
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
// Jio component test doubles — thin, deterministic, expose options + onChange.
// ---------------------------------------------------------------------------

vi.mock('@oneui/ui-internal/components/Select/Select', () => ({
  Select: ({
    value,
    onChange,
    options,
    'aria-label': ariaLabel,
  }: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    'aria-label'?: string;
  }) => (
    <select
      aria-label={ariaLabel}
      data-testid={`select-${ariaLabel}`}
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

vi.mock('@oneui/ui-internal/components/InputField', () => ({
  InputField: ({
    value,
    onChange,
    label,
    'data-testid': dataTestId,
  }: {
    value: string;
    onChange: (v: string) => void;
    label?: string;
    'data-testid'?: string;
  }) => (
    <input
      aria-label={label}
      data-testid={dataTestId}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock('@oneui/ui-internal/components/Button/Button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    'data-testid': dataTestId,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    'data-testid'?: string;
  }) => (
    <button data-testid={dataTestId} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

// Imported AFTER the mocks so the panel picks up the doubles.
import { RequestPanel } from '../_panels/RequestPanel';
import {
  PROMPT_CARD_SHAPE_TYPE,
  type PromptCardShape,
} from '../_canvas/shapes/PromptCardShape';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makePrompt(overrides: Partial<PromptCardShape['props']> = {}): PromptCardShape {
  return {
    id: 'shape:prompt-1',
    type: PROMPT_CARD_SHAPE_TYPE,
    x: 0,
    y: 0,
    rotation: 0,
    index: 'a1',
    parentId: 'page:1',
    isLocked: false,
    opacity: 1,
    meta: {},
    typeName: 'shape',
    props: {
      w: 320,
      h: 200,
      prompt: 'a hero landing page',
      brandId: 'brand-jio',
      artifactType: 'web-ui',
      outputProfile: 'web-desktop',
      runStatus: 'idle',
      ...overrides,
    },
  } as unknown as PromptCardShape;
}

function makeEditor(prompt: PromptCardShape) {
  const updateShape = vi.fn(
    (shape: { id: string; props?: Record<string, unknown> }) => {
      if (shape.id === prompt.id && shape.props) {
        prompt.props = { ...prompt.props, ...shape.props } as PromptCardShape['props'];
      }
    },
  );
  return { editor: { updateShape } as never, updateShape };
}

const BRANDS = [
  { _id: 'brand-jio', name: 'Jio' },
  { _id: 'brand-jiomart', name: 'JioMart' },
];

const SUB_BRANDS = [
  { _id: 'sub-1', name: 'Jio Diwali' },
  { _id: 'sub-2', name: 'Jio Cricket' },
];

beforeEach(() => {
  brandsQueryResult.current = BRANDS;
  subBrandsQueryResult.current = undefined;
  subBrandArg.current = undefined;
});

// ---------------------------------------------------------------------------
// INPUT-01 / D-02 — brand options from the real Convex query
// ---------------------------------------------------------------------------

describe('RequestPanel brand options (INPUT-01 / D-02)', () => {
  it('renders one option per brand from the brands.list query', () => {
    const prompt = makePrompt();
    const { editor } = makeEditor(prompt);
    render(
      <RequestPanel editor={editor} selectedPrompt={prompt} onRun={vi.fn()} />,
    );
    const brandSelect = screen.getByTestId('select-Brand') as HTMLSelectElement;
    const labels = Array.from(brandSelect.options).map((o) => o.textContent);
    expect(labels).toEqual(['Jio', 'JioMart']);
  });

  it('shows the empty state when no prompt card is selected', () => {
    render(<RequestPanel editor={null} selectedPrompt={null} onRun={vi.fn()} />);
    expect(screen.getByTestId('request-panel-empty')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// INPUT-01 / D-02 — dependent sub-brand Select
// ---------------------------------------------------------------------------

describe('RequestPanel sub-brand options (INPUT-01 / D-02)', () => {
  it('renders the dependent sub-brand Select with "(Parent brand only)" first', () => {
    const prompt = makePrompt();
    const { editor } = makeEditor(prompt);
    render(
      <RequestPanel editor={editor} selectedPrompt={prompt} onRun={vi.fn()} />,
    );
    const subSelect = screen.getByTestId('select-Sub-brand') as HTMLSelectElement;
    expect(subSelect).toBeTruthy();
    expect(subSelect.options[0].textContent).toBe('(Parent brand only)');
    expect(subSelect.options[0].value).toBe('');
  });

  it('skips the query (empty + only the default option) until a brand is chosen', () => {
    const prompt = makePrompt({ brandId: '' });
    const { editor } = makeEditor(prompt);
    // Even if sub-brand data existed, a brand-less card must not query for it.
    subBrandsQueryResult.current = SUB_BRANDS;
    render(
      <RequestPanel editor={editor} selectedPrompt={prompt} onRun={vi.fn()} />,
    );
    const subSelect = screen.getByTestId('select-Sub-brand') as HTMLSelectElement;
    // Only the default option — no sub-brands fetched.
    expect(Array.from(subSelect.options).map((o) => o.value)).toEqual(['']);
    // The dependent query was passed 'skip' (D-02 gating).
    expect(subBrandArg.current).toBe('skip');
  });

  it('skips the query when brandId is stale/unknown (not a real brand _id)', () => {
    // Regression: a card persisted with a placeholder/stale brandId like 'jio'
    // (NOT a Convex Id<'brands'>) must NOT be passed to getByParentBrand, whose
    // v.id('brands') validator would throw an ArgumentValidationError and crash
    // the entire canvas. The dependent query stays 'skip' until the id resolves
    // against the live brands.list.
    const prompt = makePrompt({ brandId: 'jio' });
    const { editor } = makeEditor(prompt);
    subBrandsQueryResult.current = SUB_BRANDS;
    render(
      <RequestPanel editor={editor} selectedPrompt={prompt} onRun={vi.fn()} />,
    );
    const subSelect = screen.getByTestId('select-Sub-brand') as HTMLSelectElement;
    expect(Array.from(subSelect.options).map((o) => o.value)).toEqual(['']);
    expect(subBrandArg.current).toBe('skip');
  });

  it('populates from getByParentBrand once a brand is selected', () => {
    const prompt = makePrompt({ brandId: 'brand-jio' });
    const { editor } = makeEditor(prompt);
    subBrandsQueryResult.current = SUB_BRANDS;
    render(
      <RequestPanel editor={editor} selectedPrompt={prompt} onRun={vi.fn()} />,
    );
    const subSelect = screen.getByTestId('select-Sub-brand') as HTMLSelectElement;
    const labels = Array.from(subSelect.options).map((o) => o.textContent);
    expect(labels).toEqual(['(Parent brand only)', 'Jio Diwali', 'Jio Cricket']);
    // The dependent query received the parent brand id, not 'skip'.
    expect(subBrandArg.current).toEqual({ parentBrandId: 'brand-jio' });
  });

  it('persists a sub-brand selection onto the prompt card', () => {
    const prompt = makePrompt({ brandId: 'brand-jio' });
    const { editor, updateShape } = makeEditor(prompt);
    subBrandsQueryResult.current = SUB_BRANDS;
    render(
      <RequestPanel editor={editor} selectedPrompt={prompt} onRun={vi.fn()} />,
    );
    fireEvent.change(screen.getByTestId('select-Sub-brand'), {
      target: { value: 'sub-1' },
    });
    expect(updateShape).toHaveBeenCalledWith({
      id: prompt.id,
      type: PROMPT_CARD_SHAPE_TYPE,
      props: { subBrandConfigId: 'sub-1' },
    });
  });

  it('clears the prop (undefined) when "(Parent brand only)" is chosen', () => {
    const prompt = makePrompt({ brandId: 'brand-jio', subBrandConfigId: 'sub-1' });
    const { editor, updateShape } = makeEditor(prompt);
    subBrandsQueryResult.current = SUB_BRANDS;
    render(
      <RequestPanel editor={editor} selectedPrompt={prompt} onRun={vi.fn()} />,
    );
    fireEvent.change(screen.getByTestId('select-Sub-brand'), {
      target: { value: '' },
    });
    expect(updateShape).toHaveBeenCalledWith({
      id: prompt.id,
      type: PROMPT_CARD_SHAPE_TYPE,
      props: { subBrandConfigId: undefined },
    });
  });
});

// ---------------------------------------------------------------------------
// INPUT-02 / INPUT-03 / D-03 — type → profile filtering
// ---------------------------------------------------------------------------

describe('RequestPanel type → profile filtering (INPUT-02/03 / D-03)', () => {
  it('output-profile options match getValidProfilesForType for the selected type', () => {
    const prompt = makePrompt({ artifactType: 'web-ui', outputProfile: 'web-desktop' });
    const { editor } = makeEditor(prompt);
    render(
      <RequestPanel editor={editor} selectedPrompt={prompt} onRun={vi.fn()} />,
    );
    const profileSelect = screen.getByTestId('select-Output profile') as HTMLSelectElement;
    const offered = Array.from(profileSelect.options).map((o) => o.value);
    const expected = getValidProfilesForType('web-ui').map((p) => p.id);
    expect(offered).toEqual(expected);
  });

  it('does NOT offer a profile that is invalid for the selected type', () => {
    const prompt = makePrompt({ artifactType: 'slide', outputProfile: 'slide-16x9' });
    const { editor } = makeEditor(prompt);
    render(
      <RequestPanel editor={editor} selectedPrompt={prompt} onRun={vi.fn()} />,
    );
    const profileSelect = screen.getByTestId('select-Output profile') as HTMLSelectElement;
    const offered = Array.from(profileSelect.options).map((o) => o.value);
    // 'web-desktop' is valid for web-ui, never for slide → must not appear.
    expect(offered).not.toContain('web-desktop');
    expect(offered).toEqual(getValidProfilesForType('slide').map((p) => p.id));
  });

  it('changing the artifact type snaps the profile to a valid one for the new type', () => {
    const prompt = makePrompt({ artifactType: 'web-ui', outputProfile: 'web-desktop' });
    const { editor, updateShape } = makeEditor(prompt);
    render(
      <RequestPanel editor={editor} selectedPrompt={prompt} onRun={vi.fn()} />,
    );
    const typeSelect = screen.getByTestId('select-Artifact type') as HTMLSelectElement;
    fireEvent.change(typeSelect, { target: { value: 'slide' as ArtifactType } });

    // The type is persisted, and the now-invalid web-desktop profile is
    // replaced with the first valid slide profile.
    const typeCalls = updateShape.mock.calls.map((c) => c[0].props);
    expect(typeCalls).toContainEqual({ artifactType: 'slide' });
    const firstValidSlide = getValidProfilesForType('slide')[0].id;
    expect(typeCalls).toContainEqual({ outputProfile: firstValidSlide });
  });
});

// ---------------------------------------------------------------------------
// D-04 — edits persist onto the selected card's props
// ---------------------------------------------------------------------------

describe('RequestPanel persistence (D-04)', () => {
  it('persists brand selection onto the prompt card', () => {
    const prompt = makePrompt();
    const { editor, updateShape } = makeEditor(prompt);
    render(
      <RequestPanel editor={editor} selectedPrompt={prompt} onRun={vi.fn()} />,
    );
    fireEvent.change(screen.getByTestId('select-Brand'), {
      target: { value: 'brand-jiomart' },
    });
    expect(updateShape).toHaveBeenCalledWith({
      id: prompt.id,
      type: PROMPT_CARD_SHAPE_TYPE,
      props: { brandId: 'brand-jiomart' },
    });
  });

  it('persists prompt-text edits onto the prompt card', () => {
    const prompt = makePrompt();
    const { editor, updateShape } = makeEditor(prompt);
    render(
      <RequestPanel editor={editor} selectedPrompt={prompt} onRun={vi.fn()} />,
    );
    fireEvent.change(screen.getByTestId('request-prompt'), {
      target: { value: 'a checkout flow' },
    });
    expect(updateShape).toHaveBeenCalledWith({
      id: prompt.id,
      type: PROMPT_CARD_SHAPE_TYPE,
      props: { prompt: 'a checkout flow' },
    });
  });
});

// ---------------------------------------------------------------------------
// INPUT-04 — the Run CTA invokes the run flow
// ---------------------------------------------------------------------------

describe('RequestPanel Run CTA (INPUT-04)', () => {
  it('invokes onRun when the Run generation button is clicked', () => {
    const prompt = makePrompt();
    const { editor } = makeEditor(prompt);
    const onRun = vi.fn();
    render(
      <RequestPanel editor={editor} selectedPrompt={prompt} onRun={onRun} />,
    );
    fireEvent.click(screen.getByTestId('request-run'));
    expect(onRun).toHaveBeenCalledTimes(1);
  });

  it('disables the Run CTA when the prompt is empty (no run intent)', () => {
    const prompt = makePrompt({ prompt: '' });
    const { editor } = makeEditor(prompt);
    render(
      <RequestPanel editor={editor} selectedPrompt={prompt} onRun={vi.fn()} />,
    );
    expect((screen.getByTestId('request-run') as HTMLButtonElement).disabled).toBe(true);
  });
});
