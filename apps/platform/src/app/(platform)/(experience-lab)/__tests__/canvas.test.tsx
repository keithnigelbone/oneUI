/**
 * canvas.test.tsx (jsdom)
 *
 * Chat-first canvas coverage (Plan 03 / Wave 2). The Lab is now left chat +
 * right canvas (D-13); both docks (RequestPanel / RunInspectorPanel) are retired.
 * The canvas no longer owns the run POST — the CHAT hook drives generation and
 * invokes the canvas placement callbacks on a terminal run frame (D-12). So this
 * suite exercises the canvas's two placement callbacks directly:
 *
 *   - LAB-01 / CANVAS-01: the Lab route/page module renders (mounts a loader
 *     boundary) without touching the existing Builder.
 *   - CANVAS-04 / D-07: `placeArtifact(result)` produces a linked artifact card
 *     inside a "Run #N" frame.
 *   - CANVAS-04 / pending: `beginArtifact()` produces a visible pending artifact
 *     immediately, then `placeArtifact(result, pendingId)` updates it in place.
 *   - FND-03 / REG-03 short-circuit: `flipToGapState(gapEvent, result)` flips the
 *     foundation-profile / component-reference card to its gap state and creates
 *     ZERO artifact cards.
 *
 * tldraw is DOM-heavy and brittle to boot in jsdom, so the placement callbacks
 * are exercised against a lightweight in-memory fake editor that implements
 * exactly the Editor surface the reducer uses. The reducer drives the REAL
 * shape-type constants + the REAL `RunResultFrame` / `ExperienceBuilderEvent`
 * contracts, so the card-creation / gap-short-circuit logic under test is the
 * production code path; only the canvas-coordinate rendering is stubbed.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ExperienceBuilderEventT } from '@oneui/experience-builder-core';

// The chat pane (rendered synchronously by the shell) reads Convex brands via
// `useQuery`. Mock `convex/react` + `@oneui/convex` so the page-render smoke
// test does not require a live Convex client (mirrors composerControlStrip.test).
vi.mock('convex/react', () => ({
  useQuery: () => undefined,
}));
vi.mock('@oneui/convex', () => ({
  api: {
    brands: { list: 'list' },
    subBrandConfigs: { getByParentBrand: 'getByParentBrand' },
  },
}));

import { useExperienceLabRun } from '../_canvas/useExperienceLabRun';
import { ARTIFACT_CARD_SHAPE_TYPE } from '../_canvas/shapes/ArtifactCardShape';
import { FOUNDATION_PROFILE_CARD_SHAPE_TYPE } from '../_canvas/shapes/FoundationProfileCardShape';
import { COMPONENT_REFERENCE_CARD_SHAPE_TYPE } from '../_canvas/shapes/ComponentReferenceCardShape';
import type { RunResultFrame } from '../_canvas/runStream';
import LabPage from '../lab/page';
// Wave 0 (04.2-01) RED scaffold for AGENT-03. The "How this was built" trace
// card render helper is NOT implemented yet, so this resolves to `undefined`
// today and the assertions fail for the right reason — the contract Plan 05
// Task 3 drives to GREEN.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import * as ArtifactCardModule from '../_canvas/shapes/ArtifactCardShape';

/**
 * The to-be-added pure trace-card render helper (AGENT-03). It takes the
 * persisted `agentTrace` and renders an expandable "How this was built"
 * disclosure (native <button aria-expanded aria-controls> like RunDetail). It
 * renders NOTHING when `agentTrace` is undefined (backward-compatible). Pure /
 * editor-context-free so it is unit-renderable in jsdom. `undefined` in RED.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HowThisWasBuilt: any = (ArtifactCardModule as Record<string, unknown>).HowThisWasBuilt;

// ---------------------------------------------------------------------------
// Lightweight in-memory fake of the tldraw Editor surface the reducer touches.
// ---------------------------------------------------------------------------

interface FakeShape {
  id: string;
  type: string;
  x: number;
  y: number;
  props: Record<string, unknown>;
  parentId?: string;
}

function createFakeEditor(initial: FakeShape[] = []) {
  const shapes = new Map<string, FakeShape>();
  for (const s of initial) shapes.set(s.id, s);

  return {
    _shapes: shapes,
    getShape: (id: string) => shapes.get(id),
    getCurrentPageShapes: () => Array.from(shapes.values()),
    getSelectedShapeIds: () => [],
    createShape: (shape: FakeShape) => {
      shapes.set(shape.id, { ...shape });
    },
    updateShape: (shape: { id: string; props?: Record<string, unknown> }) => {
      const existing = shapes.get(shape.id);
      if (existing) existing.props = { ...existing.props, ...(shape.props ?? {}) };
    },
    deleteShapes: (ids: string[]) => {
      for (const id of ids) shapes.delete(id);
    },
    reparentShapes: (ids: string[], parentId: string) => {
      for (const id of ids) {
        const s = shapes.get(id);
        if (s) s.parentId = parentId;
      }
    },
    // unused-by-reducer surface stubs (keep the cast honest)
    select: vi.fn(),
    getViewportPageBounds: () => ({ x: 0, y: 0, w: 1000, h: 800 }),
    markEventAsHandled: vi.fn(),
    getEditingShapeId: () => null,
    setEditingShape: vi.fn(),
  };
}

// A minimal valid IR for the artifact card (matches JioExperienceIR shape).
const VALID_IR = {
  version: 1 as const,
  artifactType: 'web-ui' as const,
  targetProfile: 'web-desktop' as const,
  brandId: 'jio',
  foundationRefs: [],
  sections: [{ id: 's1', name: 'hero', instances: [{ id: 'i1', type: 'Button' }] }],
  componentInstances: [{ id: 'i1', type: 'Button' }],
  content: {},
  a11yRequirements: { wcagLevel: 'AA' as const },
  validationStatus: 'valid' as const,
};

// ---------------------------------------------------------------------------
// LAB-01 / CANVAS-01 — route/page renders
// ---------------------------------------------------------------------------

describe('Experience Lab route (LAB-01 / CANVAS-01)', () => {
  it('the /lab page module renders without throwing (mounts the loader boundary)', () => {
    // The page dynamic-imports the shell with ssr:false, so synchronously it
    // shows the PageLoader fallback. Rendering must not throw and must not
    // touch the existing Builder.
    const { container } = render(<LabPage />);
    expect(container).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// CANVAS-04 / D-07 — placeArtifact → artifact card inside a Run #N frame
// ---------------------------------------------------------------------------

describe('valid run placement (CANVAS-04 / D-07)', () => {
  it('beginArtifact creates a pending card immediately and placeArtifact updates it in place', () => {
    const editor = createFakeEditor();
    const { result } = renderHook(() => useExperienceLabRun(editor as never));

    let pendingId: string | null = null;
    act(() => {
      pendingId = result.current.canvasCallbacks.beginArtifact();
    });

    expect(pendingId).toBeTruthy();
    let all = editor.getCurrentPageShapes();
    let artifacts = all.filter((s) => s.type === ARTIFACT_CARD_SHAPE_TYPE);
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0].props.ir).toBeNull();
    expect(artifacts[0].props.previewUrl).toBe('');
    expect(artifacts[0].props.w).toBe(360);
    expect(artifacts[0].props.h).toBe(320);

    const resultFrame: RunResultFrame = {
      kind: 'result',
      outcome: 'artifact',
      ir: VALID_IR as never,
      previewUrl: '/internal/render-ast?token=opaque-token',
      previewVerification: {
        theme: 'light',
        screenshotAvailable: true,
        nonBlank: true,
        rawBrowserDefaultsDetected: false,
        consoleIssues: [],
        cssVariables: [{ name: '--Surface-Main', status: 'passed', value: 'var(--Surface-Main)' }],
      },
    };
    act(() => {
      result.current.canvasCallbacks.placeArtifact(resultFrame, pendingId);
    });

    all = editor.getCurrentPageShapes();
    artifacts = all.filter((s) => s.type === ARTIFACT_CARD_SHAPE_TYPE);
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0].id).toBe(pendingId);
    expect((artifacts[0].props.ir as { artifactType: string }).artifactType).toBe('web-ui');
    expect(artifacts[0].props.previewUrl).toBe('/internal/render-ast?token=opaque-token');
    expect(artifacts[0].props.lifecycle).toBe('thumbnail');
    expect(artifacts[0].props.previewVerification).toMatchObject({
      screenshotAvailable: true,
      nonBlank: true,
    });
  });

  it('placeArtifact creates a linked artifact card inside a Run #N frame', () => {
    const editor = createFakeEditor();
    const { result } = renderHook(() => useExperienceLabRun(editor as never));

    const resultFrame: RunResultFrame = { kind: 'result', outcome: 'artifact', ir: VALID_IR as never };
    act(() => {
      result.current.canvasCallbacks.placeArtifact(resultFrame);
    });

    const all = editor.getCurrentPageShapes();
    const frames = all.filter((s) => s.type === 'frame');
    const artifacts = all.filter((s) => s.type === ARTIFACT_CARD_SHAPE_TYPE);

    expect(frames).toHaveLength(1);
    expect(frames[0].props.name).toBe('Run #1');
    expect(frames[0].props.w).toBe(360);
    expect(frames[0].props.h).toBe(320);
    expect(artifacts).toHaveLength(1);
    // The artifact is parented to the run frame (spatial lineage).
    expect(artifacts[0].parentId).toBe(frames[0].id);
    // It carries the validated IR (structured JSON, never markup).
    expect((artifacts[0].props.ir as { artifactType: string }).artifactType).toBe('web-ui');
  });

  it('numbers successive runs Run #1, Run #2 (auto-arrange, D-03)', () => {
    const editor = createFakeEditor();
    const { result } = renderHook(() => useExperienceLabRun(editor as never));
    const frame: RunResultFrame = { kind: 'result', outcome: 'artifact', ir: VALID_IR as never };
    act(() => {
      result.current.canvasCallbacks.placeArtifact(frame);
      result.current.canvasCallbacks.placeArtifact(frame);
    });
    const names = editor
      .getCurrentPageShapes()
      .filter((s) => s.type === 'frame')
      .map((s) => s.props.name);
    expect(names).toEqual(['Run #1', 'Run #2']);
  });
});

// ---------------------------------------------------------------------------
// FND-03 short-circuit — foundation gap flips card, NO artifact
// ---------------------------------------------------------------------------

describe('foundation gap short-circuit (FND-03)', () => {
  it('removes the pending artifact run before placing the foundation gap card', () => {
    const editor = createFakeEditor();
    const { result } = renderHook(() => useExperienceLabRun(editor as never));

    let pendingId: string | null = null;
    act(() => {
      pendingId = result.current.canvasCallbacks.beginArtifact();
    });

    const gap: ExperienceBuilderEventT = {
      type: 'gap',
      runId: 'r2',
      foundationGap: {
        artifactType: 'web-ui',
        outputProfile: 'web-desktop',
        reason: 'Generation stopped before a shippable preview was produced.',
      },
      at: 2,
    };

    act(() => {
      result.current.canvasCallbacks.flipToGapState(
        gap,
        { kind: 'result', outcome: 'gap' },
        pendingId,
      );
    });

    const all = editor.getCurrentPageShapes();
    expect(all.filter((s) => s.type === ARTIFACT_CARD_SHAPE_TYPE)).toHaveLength(0);
    expect(all.filter((s) => s.type === 'frame')).toHaveLength(0);
    expect(all.filter((s) => s.type === FOUNDATION_PROFILE_CARD_SHAPE_TYPE)).toHaveLength(1);
  });

  it('flipToGapState flips a foundation-profile card to gap state and creates ZERO artifact cards', () => {
    const editor = createFakeEditor();
    const { result } = renderHook(() => useExperienceLabRun(editor as never));

    const gap: ExperienceBuilderEventT = {
      type: 'gap',
      runId: 'r2',
      foundationGap: {
        artifactType: 'social-post',
        outputProfile: 'ig-square',
        reason: 'No Jio foundation profile is defined for social-post → ig-square.',
      },
      at: 2,
    };
    act(() => {
      result.current.canvasCallbacks.flipToGapState(gap, { kind: 'result', outcome: 'gap' });
    });

    const all = editor.getCurrentPageShapes();
    const gapCards = all.filter((s) => s.type === FOUNDATION_PROFILE_CARD_SHAPE_TYPE);
    const artifacts = all.filter((s) => s.type === ARTIFACT_CARD_SHAPE_TYPE);

    expect(gapCards).toHaveLength(1);
    expect(gapCards[0].props.state).toBe('gap');
    expect(gapCards[0].props.artifactType).toBe('social-post');
    // Short-circuit: NO artifact card produced on a gap.
    expect(artifacts).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// REG-03 short-circuit — component gap flips card, NO artifact
// ---------------------------------------------------------------------------

describe('component gap short-circuit (REG-03)', () => {
  it('flipToGapState flips a component-reference card to gap state and creates ZERO artifact cards', () => {
    const editor = createFakeEditor();
    const { result } = renderHook(() => useExperienceLabRun(editor as never));

    const gap: ExperienceBuilderEventT = {
      type: 'gap',
      runId: 'r3',
      componentGap: {
        componentType: 'FancyHeroBanner',
        reason: '"FancyHeroBanner" isn\'t a Storybook-approved Jio component.',
      },
      at: 2,
    };
    act(() => {
      result.current.canvasCallbacks.flipToGapState(gap, { kind: 'result', outcome: 'gap' });
    });

    const all = editor.getCurrentPageShapes();
    const gapCards = all.filter((s) => s.type === COMPONENT_REFERENCE_CARD_SHAPE_TYPE);
    const artifacts = all.filter((s) => s.type === ARTIFACT_CARD_SHAPE_TYPE);

    expect(gapCards).toHaveLength(1);
    expect(gapCards[0].props.state).toBe('gap');
    expect(gapCards[0].props.componentId).toBe('FancyHeroBanner');
    expect(artifacts).toHaveLength(0);
  });
});

// ===========================================================================
// Wave 0 (04.2-01) RED — "How this was built" trace card (AGENT-03 / D-06d).
//
// PINS the contract Plan 05 Task 3 drives to GREEN: given an `agentTrace`
// (planner output, design recs, ToV recs, registry matches, validation result,
// eval score), the artifact card renders an EXPANDABLE "How this was built"
// disclosure surfacing those trace fields; a card with NO agentTrace renders
// without the disclosure (backward-compatible). The trace renders as React text
// only — never dangerouslySetInnerHTML (T-04.2-01b markup-safety).
//
// These MUST fail now: the `HowThisWasBuilt` helper + the `agentTrace` prop do
// not exist yet.
// ===========================================================================

/** A structured agent trace as it will be persisted (NO secrets — text only). */
const AGENT_TRACE = {
  planner: { sections: ['hero', 'features', 'cta'], primaryCTA: 'Get started' },
  designRecs: [{ sectionId: 'hero', surfaceMode: 'bold', components: ['Surface', 'Button'] }],
  toneRecs: [{ sectionId: 'hero', headline: 'Unlimited 5G for less', toneScore: 88 }],
  registryMatches: ['Surface', 'Button'],
  validation: { passed: true },
  evaluation: { composite: 4.2 },
};

describe('"How this was built" trace card (AGENT-03 / RED)', () => {
  it('exports a HowThisWasBuilt render helper — RED: not yet implemented', () => {
    expect(typeof HowThisWasBuilt).toBe('function');
  });

  it('renders an expandable "How this was built" disclosure surfacing the trace fields', () => {
    const { getByText, getByRole } = render(<HowThisWasBuilt agentTrace={AGENT_TRACE} />);

    // A native disclosure button (keyboard-operable, aria-expanded/aria-controls).
    const toggle = getByText(/how this was built/i);
    expect(toggle).toBeTruthy();
    const button = getByRole('button', { name: /how this was built/i });
    expect(button.getAttribute('aria-expanded')).toBeDefined();
    expect(button.getAttribute('aria-controls')).toBeTruthy();

    // Expand → the trace fields surface as plain React text.
    fireEvent.click(button);
    expect(getByText(/Get started/)).toBeTruthy(); // planner primaryCTA
    expect(getByText(/Unlimited 5G for less/)).toBeTruthy(); // ToV headline
    expect(getByText(/Surface/)).toBeTruthy(); // registry match / design rec
  });

  it('renders the trace as React text only — NO dangerouslySetInnerHTML (T-04.2-01b)', () => {
    const trace = {
      ...AGENT_TRACE,
      toneRecs: [{ sectionId: 'hero', headline: '<img src=x onerror=alert(1)>', toneScore: 1 }],
    };
    const { container } = render(<HowThisWasBuilt agentTrace={trace} />);
    fireEvent.click(screen.getByText(/how this was built/i));
    // The markup-bearing string must be escaped text, never injected HTML.
    expect(container.querySelector('img')).toBeNull();
    expect(container.innerHTML).not.toContain('onerror=');
  });

  it('renders NOTHING when agentTrace is undefined (backward-compatible)', () => {
    const { container } = render(<HowThisWasBuilt agentTrace={undefined} />);
    expect(container.querySelector('button')).toBeNull();
    expect(screen.queryByText(/how this was built/i)).toBeNull();
  });
});
