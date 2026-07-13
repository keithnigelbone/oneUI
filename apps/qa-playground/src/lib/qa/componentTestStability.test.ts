import { describe, expect, it } from 'vitest';
import {
  getComponentTestStability,
  getTotalTestCount,
  hasPlaywrightTestCoverage,
  resolveCatalogEntryStability,
} from './componentTestStability';
import type { QAPlaywrightRunResponse } from './types';

const reportWithPassingTests: QAPlaywrightRunResponse = {
  ok: true,
  message: 'ok',
  suites: {
    functional: { suite: 'functional', passed: 2, failed: 0, skipped: 0, logs: [], errors: [] },
    accessibility: { suite: 'accessibility', passed: 1, failed: 0, skipped: 0, logs: [], errors: [] },
  },
};

const reportWithFailures: QAPlaywrightRunResponse = {
  ok: false,
  message: 'failures',
  suites: {
    functional: { suite: 'functional', passed: 1, failed: 1, skipped: 0, logs: [], errors: [] },
  },
};

describe('componentTestStability', () => {
  it('treats slugs without Playwright bundles as under-development', () => {
    expect(getComponentTestStability('agent-pulse', null)).toBe('under-development');
    expect(hasPlaywrightTestCoverage('agent-pulse', reportWithPassingTests)).toBe(false);
  });

  it('treats missing or empty reports as under-development', () => {
    expect(getComponentTestStability('button', null)).toBe('under-development');
    expect(getComponentTestStability('button', { ok: true, message: 'empty', suites: {} })).toBe(
      'under-development',
    );
    expect(getTotalTestCount({ ok: true, message: 'empty', suites: {} })).toBe(0);
  });

  it('marks zero-failure ingested reports as stable', () => {
    expect(getComponentTestStability('button', reportWithPassingTests)).toBe('stable');
  });

  it('marks reports with failures as unstable', () => {
    expect(getComponentTestStability('button', reportWithFailures)).toBe('unstable');
  });

  it('defaults unknown Playwright slugs to under-development in the catalog index', () => {
    const index = new Map<string, 'stable' | 'unstable' | 'under-development'>();
    expect(resolveCatalogEntryStability('button', index)).toBe('under-development');
    expect(resolveCatalogEntryStability('agent-pulse', index)).toBe('under-development');
  });
});
