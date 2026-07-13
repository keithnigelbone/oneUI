import { describe, expect, it } from 'vitest';
import {
  DEFAULT_EXPERIENCE_LAB_CANVAS_DOCUMENT_ID,
  LAB_TLDRAW_CUSTOM_RECORD_TYPES,
  LAB_TLDRAW_CUSTOM_SHAPE_TYPES,
  LAB_TLDRAW_SYNC_SCHEMA_CONTRACT,
  buildExperienceLabPersistenceKey,
  buildExperienceLabSessionId,
  normalizeCanvasDocumentId,
  type AgentPresenceRecord,
  type ProvenanceRecord,
  type ReviewStatusRecord,
} from './canvasPersistence';

describe('Experience Lab tldraw persistence contract', () => {
  it('builds deterministic v5 storage keys from normalized document ids', () => {
    expect(normalizeCanvasDocumentId(' Jio Main Lab / Desktop ')).toBe('jio-main-lab-desktop');
    expect(normalizeCanvasDocumentId('')).toBe(DEFAULT_EXPERIENCE_LAB_CANVAS_DOCUMENT_ID);
    expect(buildExperienceLabPersistenceKey(' Jio Main Lab / Desktop ')).toBe(
      'oneui:experience-lab:tldraw:v1:jio-main-lab-desktop',
    );
    expect(buildExperienceLabSessionId(' Jio Main Lab / Desktop ')).toBe(
      'oneui-experience-lab:jio-main-lab-desktop:local-session',
    );
  });

  it('declares every custom shape type required by tldraw sync', () => {
    expect(LAB_TLDRAW_SYNC_SCHEMA_CONTRACT.tldrawMajorVersion).toBe(5);
    expect(LAB_TLDRAW_SYNC_SCHEMA_CONTRACT.customShapeTypes).toBe(LAB_TLDRAW_CUSTOM_SHAPE_TYPES);
    expect(LAB_TLDRAW_CUSTOM_SHAPE_TYPES).toEqual(
      expect.arrayContaining([
        'frame',
        'exp-lab-prompt',
        'exp-lab-artifact',
        'exp-lab-foundation-profile',
        'exp-lab-component-reference',
        'exp-lab-generic-placeholder',
      ]),
    );
  });

  it('reserves custom record types for presence, review status, and provenance', () => {
    expect(LAB_TLDRAW_CUSTOM_RECORD_TYPES).toEqual([
      'oneui.agentPresence',
      'oneui.reviewStatus',
      'oneui.provenance',
    ]);

    const presence: AgentPresenceRecord = {
      type: 'oneui.agentPresence',
      id: 'presence-1',
      runId: 'run-1',
      agent: 'design',
      label: 'Design advisor',
      color: 'sparkle',
      nodeIds: ['hero'],
      updatedAt: 1,
    };
    const review: ReviewStatusRecord = {
      type: 'oneui.reviewStatus',
      id: 'review-1',
      targetId: 'artifact-1',
      status: 'needs-review',
      updatedAt: 1,
    };
    const provenance: ProvenanceRecord = {
      type: 'oneui.provenance',
      id: 'provenance-1',
      runId: 'run-1',
      storybookRefs: ['Components/Navigation/WebHeader/Default'],
      validationPassed: true,
      updatedAt: 1,
    };

    expect(presence.nodeIds).toEqual(['hero']);
    expect(review.status).toBe('needs-review');
    expect(provenance.validationPassed).toBe(true);
  });
});
