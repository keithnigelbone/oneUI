import type { BugStatus } from './types';

/** Statuses available in bulk update dropdowns. */
export const BULK_STATUS_TARGETS = [
  'Assigned',
  'In Progress',
  'Ready to Test',
  'Closed',
  'Reopened',
  'On Hold',
] as const;

export type BulkStatusTarget = (typeof BULK_STATUS_TARGETS)[number];

const READY_TO_TEST_ALIASES = new Set(['Ready to Test', 'Ready to test']);

function normalizeStatus(status: BugStatus): string {
  return status.trim();
}

/** Allowed single-bug transitions per workflow spec. */
export function getAllowedStatusTargets(current: BugStatus): string[] {
  const status = normalizeStatus(current);
  const targets = new Set<string>();

  if (status === 'New') targets.add('Assigned');
  if (status === 'Assigned') targets.add('In Progress');
  if (status === 'In Progress') targets.add('Ready to Test');
  if (READY_TO_TEST_ALIASES.has(status)) targets.add('Closed');

  targets.add('Reopened');
  targets.add('On Hold');

  if (targets.size === 2 && status !== '—') {
    return [...targets];
  }

  return [...targets];
}

export function canTransitionTo(current: BugStatus, next: BugStatus): boolean {
  if (normalizeStatus(current) === normalizeStatus(next)) return false;
  return getAllowedStatusTargets(current).includes(next);
}
