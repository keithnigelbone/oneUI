/**
 * canvasPersistence.ts
 *
 * tldraw v5 persistence + future sync metadata for the isolated Experience Lab
 * canvas. This file is intentionally pure so it can be shared by the client
 * canvas, tests, and the eventual sync server registration code.
 */

export const DEFAULT_EXPERIENCE_LAB_CANVAS_DOCUMENT_ID = 'oneui-experience-lab-default';

export const LAB_TLDRAW_STORAGE_VERSION = 1;

/**
 * Every custom shape type the Lab registers with `<Tldraw />`. tldraw sync must
 * register the same shape utilities server-side/client-side before documents
 * containing these records can collaborate safely.
 */
export const LAB_TLDRAW_CUSTOM_SHAPE_TYPES = [
  'frame',
  'exp-lab-prompt',
  'exp-lab-artifact',
  'exp-lab-foundation-profile',
  'exp-lab-component-reference',
  'exp-lab-generic-placeholder',
] as const;

/**
 * Domain records planned for v5 custom store records. These stay outside shape
 * props so agent presence, review decisions, and provenance can synchronize
 * independently from visual layout.
 */
export const LAB_TLDRAW_CUSTOM_RECORD_TYPES = [
  'oneui.agentPresence',
  'oneui.reviewStatus',
  'oneui.provenance',
] as const;

export interface LabTldrawSyncSchemaContract {
  tldrawMajorVersion: 5;
  storageVersion: typeof LAB_TLDRAW_STORAGE_VERSION;
  customShapeTypes: typeof LAB_TLDRAW_CUSTOM_SHAPE_TYPES;
  customRecordTypes: typeof LAB_TLDRAW_CUSTOM_RECORD_TYPES;
}

export const LAB_TLDRAW_SYNC_SCHEMA_CONTRACT: LabTldrawSyncSchemaContract = {
  tldrawMajorVersion: 5,
  storageVersion: LAB_TLDRAW_STORAGE_VERSION,
  customShapeTypes: LAB_TLDRAW_CUSTOM_SHAPE_TYPES,
  customRecordTypes: LAB_TLDRAW_CUSTOM_RECORD_TYPES,
};

export interface AgentPresenceRecord {
  type: 'oneui.agentPresence';
  id: string;
  runId: string;
  agent: 'planner' | 'design' | 'tone' | 'evaluator' | 'compiler' | 'preview';
  label: string;
  color: string;
  nodeIds: string[];
  updatedAt: number;
}

export interface ReviewStatusRecord {
  type: 'oneui.reviewStatus';
  id: string;
  targetId: string;
  status: 'draft' | 'needs-review' | 'approved' | 'rejected';
  updatedAt: number;
}

export interface ProvenanceRecord {
  type: 'oneui.provenance';
  id: string;
  runId: string;
  artifactId?: string;
  versionId?: string;
  storybookRefs: string[];
  validationPassed: boolean;
  updatedAt: number;
}

export type LabCanvasDomainRecord =
  | AgentPresenceRecord
  | ReviewStatusRecord
  | ProvenanceRecord;

export function normalizeCanvasDocumentId(value: string | null | undefined): string {
  const normalized = (value ?? DEFAULT_EXPERIENCE_LAB_CANVAS_DOCUMENT_ID)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || DEFAULT_EXPERIENCE_LAB_CANVAS_DOCUMENT_ID;
}

export function buildExperienceLabPersistenceKey(documentId?: string | null): string {
  return [
    'oneui',
    'experience-lab',
    'tldraw',
    `v${LAB_TLDRAW_STORAGE_VERSION}`,
    normalizeCanvasDocumentId(documentId),
  ].join(':');
}

export function buildExperienceLabSessionId(documentId?: string | null): string {
  return `oneui-experience-lab:${normalizeCanvasDocumentId(documentId)}:local-session`;
}
