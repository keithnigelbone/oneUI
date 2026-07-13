/**
 * versionTimeline.test.tsx (jsdom)
 *
 * Coverage for the Phase 3 closed-loop canvas surface (Plan 06):
 *
 *   - CANVAS-06 / PREV-03 / RC2: the artifact card's `PreviewRegion` renders a
 *     real-DOM `<iframe>` whose sandbox is strict in the `live` lifecycle:
 *     `sandbox="allow-scripts"` and never `allow-same-origin`, even when old
 *     persisted shape data still carries `previewSameOrigin={true}`. The
 *     `thumbnail` lifecycle renders the `_storage` thumbnail image (NOT an
 *     iframe).
 *   - VER-02: `VersionTimelinePanel` with a mocked `getArtifactHistory` renders
 *     one timeline entry per version, in `parentVersionId` lineage order.
 *   - CANVAS-05 / D-14: sibling cards sharing a `variantGroupId` are associated
 *     with the variant frame (the `VariantGroupFrameShapeUtil` extend + label).
 *   - LAB-03 isolation: no `(builder)` import crept into the new/modified Lab
 *     files (mirrors the existing Lab isolation discipline).
 *
 * tldraw is DOM-heavy and brittle in jsdom, so CANVAS-06 is exercised against
 * the EXPORTED `PreviewRegion` (the unit that performs the lifecycle render),
 * not a fully booted canvas — the production lifecycle/iframe code path under
 * test is real; only the tldraw shell is omitted. `convex/react` is mocked the
 * same way `requestPanel.test.tsx` mocks it.
 */

import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Convex mock (mirror requestPanel.test.tsx) — drive getArtifactHistory.
// ---------------------------------------------------------------------------

const historyQueryResult: { current: unknown } = { current: undefined };

vi.mock('convex/react', () => ({
  useQuery: (ref: string, arg?: unknown) => {
    if (ref === 'getArtifactHistory') {
      return arg === 'skip' ? undefined : historyQueryResult.current;
    }
    return undefined;
  },
}));

vi.mock('@oneui/convex', () => ({
  api: {
    experienceRuns: { getArtifactHistory: 'getArtifactHistory' },
  },
}));

import { PreviewRegion, asLifecycle } from '../_canvas/shapes/ArtifactCardShape';
import {
  VariantGroupFrameShapeUtil,
  VARIANT_GROUP_FRAME_LABEL,
} from '../_canvas/frames/VariantGroupFrame';
import { VersionTimelinePanel } from '../_panels/VersionTimelinePanel';

// ---------------------------------------------------------------------------
// CANVAS-06 / PREV-03 — live-iframe lifecycle
// ---------------------------------------------------------------------------

describe('artifact card preview lifecycle (CANVAS-06 / PREV-03)', () => {
  it('UNTRUSTED path (previewSameOrigin=false): strict sandbox, allow-scripts and NOT allow-same-origin', () => {
    // The untrusted Daytona/compiled-bundle path keeps credential isolation:
    // scripts only, NO allow-same-origin (PREV-01).
    render(
      <PreviewRegion
        lifecycle="live"
        previewUrl="https://preview.example/r?t=opaque-token"
        previewSameOrigin={false}
        thumbnailUrl=""
        shapeId="shape:artifact-1"
      />,
    );

    const iframe = screen.getByTestId('artifact-preview-iframe-shape:artifact-1');
    expect(iframe.tagName).toBe('IFRAME');
    expect(iframe.getAttribute('src')).toBe('https://preview.example/r?t=opaque-token');
    const sandbox = iframe.getAttribute('sandbox') ?? '';
    expect(sandbox).toContain('allow-scripts');
    // PREV-01: credential isolation — same-origin escalation is forbidden.
    expect(sandbox).not.toContain('allow-same-origin');
  });

  it('legacy first-party AST marker (previewSameOrigin=true): sandbox still excludes allow-same-origin', () => {
    // The first-party AST-render route now mounts its own brand/icon context, so
    // iframe sandboxing stays strict even for persisted same-origin markers.
    render(
      <PreviewRegion
        lifecycle="live"
        previewUrl="/internal/render-ast?token=opaque-token"
        previewSameOrigin={true}
        thumbnailUrl=""
        shapeId="shape:artifact-trusted"
      />,
    );

    const iframe = screen.getByTestId('artifact-preview-iframe-shape:artifact-trusted');
    expect(iframe.tagName).toBe('IFRAME');
    const sandbox = iframe.getAttribute('sandbox') ?? '';
    expect(sandbox).toContain('allow-scripts');
    expect(sandbox).not.toContain('allow-same-origin');
  });

  it('renders the thumbnail image (NOT an iframe) in the thumbnail lifecycle', () => {
    render(
      <PreviewRegion
        lifecycle="thumbnail"
        previewUrl="https://preview.example/r?t=opaque-token"
        previewSameOrigin={false}
        thumbnailUrl="https://convex.example/storage/thumb.png"
        shapeId="shape:artifact-2"
      />,
    );

    const img = screen.getByTestId('artifact-preview-thumbnail-shape:artifact-2');
    expect(img.tagName).toBe('IMG');
    expect(img.getAttribute('src')).toBe('https://convex.example/storage/thumb.png');
    // No iframe in the cheap thumbnail state (PREV-03 keeps the canvas light).
    expect(
      screen.queryByTestId('artifact-preview-iframe-shape:artifact-2'),
    ).toBeNull();
  });

  it('narrows arbitrary lifecycle strings to the typed union with a thumbnail default', () => {
    expect(asLifecycle('live')).toBe('live');
    expect(asLifecycle('lightweight')).toBe('lightweight');
    expect(asLifecycle('thumbnail')).toBe('thumbnail');
    expect(asLifecycle('garbage')).toBe('thumbnail');
  });
});

// ---------------------------------------------------------------------------
// VER-02 — per-card version timeline
// ---------------------------------------------------------------------------

describe('version timeline panel (VER-02)', () => {
  it('renders one entry per version in parentVersionId lineage order', () => {
    // Out-of-creation-order on purpose: v2 (child of v1) is listed first, to
    // prove the panel orders by lineage, not array order.
    historyQueryResult.current = {
      artifact: { _id: 'artifact-1' },
      versions: [
        {
          _id: 'v2',
          parentVersionId: 'v1',
          createdAt: 200,
          validation: { passed: false },
          evaluation: { composite: 0.42, objectivePass: false },
        },
        {
          _id: 'v1',
          parentVersionId: undefined,
          createdAt: 100,
          validation: { passed: true },
          evaluation: { composite: 0.81, objectivePass: true },
        },
      ],
    };

    render(
      <VersionTimelinePanel
        artifactId={'artifact-1' as never}
      />,
    );

    const entries = screen.getAllByTestId('version-timeline-entry');
    expect(entries).toHaveLength(2);
    // Lineage order: root (v1) first, then its child (v2).
    expect(entries[0].textContent).toContain('Version 1');
    expect(entries[0].textContent).toContain('valid');
    expect(entries[0].textContent).toContain('0.81');
    expect(entries[1].textContent).toContain('Version 2');
    expect(entries[1].textContent).toContain('blocked');
    expect(entries[1].textContent).toContain('0.42');
  });

  it('renders the empty state when no artifact is focused (skip query)', () => {
    historyQueryResult.current = undefined;
    render(<VersionTimelinePanel />);
    expect(screen.getByTestId('version-timeline-empty')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// CANVAS-05 / D-14 — variant grouping
// ---------------------------------------------------------------------------

describe('variant grouping (CANVAS-05 / D-14)', () => {
  it('exposes a FrameShapeUtil-derived variant frame with a "Variant Group" label', () => {
    // The variant frame extends tldraw's built-in frame util (the same base the
    // run-group frame extends) so sibling cards sharing a variantGroupId cluster
    // inside ONE labeled frame.
    expect(VARIANT_GROUP_FRAME_LABEL).toBe('Variant Group');
    expect(typeof VariantGroupFrameShapeUtil).toBe('function');
    // It overrides `component` (the body-fill patch) without redefining `type`,
    // so it stays a `'frame'`-type util (LAB-03: no Builder util imported).
    expect(
      Object.prototype.hasOwnProperty.call(
        VariantGroupFrameShapeUtil.prototype,
        'component',
      ),
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// LAB-03 isolation — no (builder) import in the Phase 3 Lab files
// ---------------------------------------------------------------------------

describe('Lab isolation (LAB-03)', () => {
  const LAB_FILES = [
    '_canvas/shapes/ArtifactCardShape.tsx',
    '_canvas/frames/VariantGroupFrame.tsx',
    '_panels/VersionTimelinePanel.tsx',
    '_canvas/runStream.ts',
    '_canvas/useExperienceLabRun.ts',
  ];

  it('no Phase 3 Lab file imports from the existing (builder) route', () => {
    const labRoot = join(__dirname, '..');
    for (const rel of LAB_FILES) {
      const src = readFileSync(join(labRoot, rel), 'utf8');
      // An import statement that references the `(builder)` segment.
      expect(/from\s+['"][^'"]*\(builder\)/.test(src)).toBe(false);
      // No Builder shape utils imported by name (the isolation invariant).
      expect(/import[^;]*OneUI\w*ShapeUtil/.test(src)).toBe(false);
    }
  });
});
