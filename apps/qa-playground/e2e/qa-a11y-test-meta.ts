import type { TestInfo } from '@playwright/test';

export const QA_ANNOTATION_BAND = 'qa-band';
export const QA_ANNOTATION_BUG = 'qa-bug';

/** Attach showcase band / bug id for QA report ingest (not shown in test title). */
export function qaAnnotate(testInfo: TestInfo, meta: { band?: string; bugId?: string }): void {
  if (meta.band) {
    testInfo.annotations.push({ type: QA_ANNOTATION_BAND, description: meta.band });
  }
  if (meta.bugId) {
    testInfo.annotations.push({ type: QA_ANNOTATION_BUG, description: meta.bugId });
  }
}

export function readQaAnnotation(
  annotations: Array<{ type?: string; description?: string }> | undefined,
  type: string,
): string | undefined {
  return annotations?.find((a) => a.type === type)?.description;
}
