/**
 * perfMarks.ts
 *
 * Dev-only startup timing instrumentation for the platform shell.
 *
 * Records named marks against the navigation-start origin and prints a
 * single summary table when the app-ready handshake completes, answering
 * "what dominates cold load: route compile, Convex data, or the preloader?"
 *
 * All functions are no-ops in production builds and on the server.
 */

const enabled =
  process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && !!window.performance;

const MARK_PREFIX = 'oneui:';

const seen = new Set<string>();

/** Record a startup mark once (repeat calls with the same name are ignored). */
export function perfMark(name: string): void {
  if (!enabled || seen.has(name)) return;
  seen.add(name);
  performance.mark(`${MARK_PREFIX}${name}`);
}

let reported = false;

/**
 * Print the startup timing table. Called once when `oneui:app-ready` fires;
 * safe to call repeatedly.
 */
export function reportAppReady(): void {
  if (!enabled || reported) return;
  reported = true;
  perfMark('app-ready');

  const rows = performance
    .getEntriesByType('mark')
    .filter((entry) => entry.name.startsWith(MARK_PREFIX))
    .sort((a, b) => a.startTime - b.startTime)
    .map((entry) => ({
      mark: entry.name.slice(MARK_PREFIX.length),
      'ms from nav-start': Math.round(entry.startTime),
    }));

  // eslint-disable-next-line no-console
  console.groupCollapsed(
    `[perf] app-ready in ${rows[rows.length - 1]?.['ms from nav-start'] ?? '?'}ms — startup marks`,
  );
  // eslint-disable-next-line no-console
  console.table(rows);
  // eslint-disable-next-line no-console
  console.groupEnd();
}
