/**
 * Shared Playwright JSON reporter walk for QA ingest scripts.
 * Maps describe chains and test title prefixes to Accessibility / Functional tabs.
 */

export type PwSpec = {
  title?: string;
  tests?: PwTest[];
};

export type PwSuite = {
  title?: string;
  suites?: PwSuite[];
  specs?: PwSpec[];
  tests?: PwTest[];
};

export type PwTestResult = {
  status?: string;
  duration?: number;
  error?: { message?: string };
};

export type PwTest = {
  title?: string;
  results?: PwTestResult[];
  annotations?: Array<{ type?: string; description?: string }>;
};

/** Playwright appends one entry per attempt; the last result is the final outcome. */
function pickLatestResult(results: PwTestResult[] | undefined): PwTestResult | undefined {
  if (!results?.length) return undefined;
  return results[results.length - 1];
}

export type CollectedRow = {
  group: string;
  name: string;
  status: string;
  durationMs?: number;
  error?: string;
  bugId?: string;
  componentBand?: string;
};

const BUG_ID_RE = /(?:\[|\()(BUG-[A-Z0-9-]+-\d+)(?:\]|\))/;
const SECTION_BAND_RE = /component band "([^"]+)"/;
const SECTION_BAND_RE_ALT = /section "([^"]+)"/;

const QA_ANNOTATION_BAND = 'qa-band';
const QA_ANNOTATION_BUG = 'qa-bug';

function readAnnotation(
  annotations: Array<{ type?: string; description?: string }> | undefined,
  type: string,
): string | undefined {
  return annotations?.find((a) => a.type === type)?.description;
}

export function extractBugId(title: string): string | undefined {
  return title.match(BUG_ID_RE)?.[1];
}

export function extractComponentBand(title: string): string | undefined {
  return title.match(SECTION_BAND_RE)?.[1] ?? title.match(SECTION_BAND_RE_ALT)?.[1];
}

export function resolveSuiteGroup(chain: string[], caseTitle: string): string {
  const accessibilityDescribe = chain.find(
    (x) => x === 'Accessibility' || x.startsWith('Accessibility —') || x.startsWith('Accessibility '),
  );
  if (accessibilityDescribe) return 'Accessibility';

  const functionalDescribe = chain.find(
    (x) => x === 'Functional' || x.startsWith('Functional —') || x.startsWith('Functional '),
  );
  if (functionalDescribe) return 'Functional';

  const t = caseTitle.trim();
  if (t.startsWith('[a11y]') || t.includes('[BUG-')) return 'Accessibility';
  if (t.startsWith('[fn]') || t.startsWith('[figma]')) return 'Functional';
  if (chain.some((x) => x.startsWith('Figma matrix') || x.startsWith('Figma validation'))) {
    return 'Functional';
  }
  return chain.at(-1) ?? 'other';
}

function resolveRowMeta(
  title: string,
  annotations?: Array<{ type?: string; description?: string }>,
): { bugId?: string; componentBand?: string } {
  return {
    bugId: extractBugId(title) ?? readAnnotation(annotations, QA_ANNOTATION_BUG),
    componentBand:
      extractComponentBand(title) ?? readAnnotation(annotations, QA_ANNOTATION_BAND),
  };
}

export function walkPlaywrightSuites(suites: PwSuite[] | undefined, ancestors: string[]): CollectedRow[] {
  if (!suites?.length) return [];
  const rows: CollectedRow[] = [];
  for (const s of suites) {
    const title = typeof s.title === 'string' ? s.title : '';
    const chain = title ? [...ancestors, title] : [...ancestors];
    if (s.suites?.length) {
      rows.push(...walkPlaywrightSuites(s.suites, chain));
    }

    if (s.specs?.length) {
      for (const spec of s.specs) {
        const specTitle = typeof spec.title === 'string' ? spec.title : '';
        const group = resolveSuiteGroup(chain, specTitle);
        for (const t of spec.tests ?? []) {
          const r = pickLatestResult(t.results);
          const status = (r?.status as string | undefined) ?? 'unknown';
          const durationMs = typeof r?.duration === 'number' ? r.duration : undefined;
          const error = r?.error?.message;
          const meta = resolveRowMeta(specTitle, t.annotations);
          rows.push({
            group,
            name: specTitle,
            status,
            durationMs,
            error,
            ...meta,
          });
        }
      }
    }

    if (s.tests?.length) {
      for (const t of s.tests) {
        const testTitle = typeof t.title === 'string' ? t.title : '';
        const group = resolveSuiteGroup(chain, testTitle);
        const r = pickLatestResult(t.results);
        const status = (r?.status as string | undefined) ?? 'unknown';
        const durationMs = typeof r?.duration === 'number' ? r.duration : undefined;
        const error = r?.error?.message;
        const meta = resolveRowMeta(testTitle, t.annotations);
        rows.push({
          group,
          name: testTitle,
          status,
          durationMs,
          error,
          ...meta,
        });
      }
    }
  }
  return rows;
}
