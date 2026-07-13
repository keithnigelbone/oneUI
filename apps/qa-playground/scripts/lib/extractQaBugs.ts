/**
 * Deduplicates Playwright failures into PM-readable bug rows for the QA dashboard.
 */
import type { FailedTestRow } from './aggregatePlaywrightDashboard';
import { summarizeAxeFailureMessage } from './axe-plain-language';

export type BugPriority = 'critical' | 'high' | 'medium' | 'low';
export type BugEffort = 'xs' | 's' | 'm' | 'l';

export type QaBugEntry = {
  /** Sequential display id (BUG-001) assigned after sort. */
  displayId: string;
  /** Canonical tracked id when known (e.g. BUG-TOUCHSLIDER-001). */
  canonicalId?: string;
  title: string;
  component: string;
  slug: string;
  category: string;
  priority: BugPriority;
  wcag: string;
  effort: BugEffort;
  testCount: number;
};

export type QaBugSummary = {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  componentsHit: number;
};

export type QaBugReport = {
  summary: QaBugSummary;
  bugs: QaBugEntry[];
};

type BugMeta = {
  title: string;
  category: string;
  priority: BugPriority;
  wcag: string;
  effort: BugEffort;
};

const PRIORITY_RANK: Record<BugPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const BUG_ID_RE = /BUG-[A-Z0-9-]+-\d+/;

/** Known defects tracked in QA specs — plain-English titles for PM dashboard. */
const KNOWN_BUGS: Record<string, BugMeta> = {
  'BUG-TOUCHSLIDER-001': {
    title: 'Screen readers cannot tell what each slider controls because the draggable control has no label',
    category: 'form label',
    priority: 'critical',
    wcag: '1.3.1',
    effort: 's',
  },
  'BUG-ICONBUTTON-001': {
    title: 'Icon-only button has no name, so screen readers only announce “button”',
    category: 'screen reader',
    priority: 'critical',
    wcag: '4.1.2',
    effort: 'xs',
  },
  'BUG-SINGLETEXT-001': {
    title: 'Loading text button has no accessible name for screen readers',
    category: 'screen reader',
    priority: 'critical',
    wcag: '4.1.2',
    effort: 'xs',
  },
  'BUG-IMAGE-001': {
    title: 'Disabled clickable image is not announced as a disabled button',
    category: 'screen reader',
    priority: 'critical',
    wcag: '4.1.2',
    effort: 's',
  },
  'BUG-MODAL-003': {
    title: 'Footer Cancel and Save buttons are missing, so users cannot close or confirm the dialog',
    category: 'keyboard access',
    priority: 'critical',
    wcag: '2.1.1',
    effort: 'm',
  },
  'BUG-INPUT-001': {
    title: 'Error state field does not tell screen readers the value is invalid',
    category: 'screen reader',
    priority: 'high',
    wcag: '4.1.2',
    effort: 'xs',
  },
  'BUG-IDT-001': {
    title: 'Disabled row text is too faint to read against its background',
    category: 'color contrast',
    priority: 'high',
    wcag: '1.4.3',
    effort: 's',
  },
  'BUG-MODAL-006': {
    title: 'Escape key does not close the dialog when backdrop click is turned off',
    category: 'keyboard access',
    priority: 'high',
    wcag: '2.1.2',
    effort: 'xs',
  },
  'BUG-MODAL-004': {
    title: 'Colour appearance setting is not applied to the dialog panel',
    category: 'visual',
    priority: 'medium',
    wcag: '1.4.1',
    effort: 'm',
  },
  'BUG-MODAL-002': {
    title: 'Scroll dividers do not update correctly when modal content is scrolled',
    category: 'visual',
    priority: 'medium',
    wcag: '1.3.2',
    effort: 's',
  },
};

type PatternRule = {
  key: string;
  canonicalId?: string;
  slugs?: string[];
  match: (row: FailedTestRow, hay: string) => boolean;
  meta: BugMeta;
};

const PATTERN_RULES: PatternRule[] = [
  {
    key: 'touch-slider:label',
    canonicalId: 'BUG-TOUCHSLIDER-001',
    slugs: ['touch-slider'],
    match: (_r, hay) =>
      hay.includes('form element has a label') ||
      hay.includes('label rule') ||
      hay.includes('accessible name readout'),
    meta: KNOWN_BUGS['BUG-TOUCHSLIDER-001'],
  },
  {
    key: 'button:loading-name',
    slugs: ['button'],
    match: (_r, hay) =>
      hay.includes('btn-loading') ||
      hay.includes('loading') && (hay.includes('button-name') || hay.includes('accessible name')),
    meta: {
      title: 'When loading, the button name disappears from screen readers',
      category: 'screen reader',
      priority: 'critical',
      wcag: '4.1.2',
      effort: 's',
    },
  },
  {
    key: 'icon-button:no-name',
    canonicalId: 'BUG-ICONBUTTON-001',
    slugs: ['icon-button'],
    match: (_r, hay) => hay.includes('button-name') || hay.includes('accessible name'),
    meta: KNOWN_BUGS['BUG-ICONBUTTON-001'],
  },
  {
    key: 'single-text-button:no-name',
    canonicalId: 'BUG-SINGLETEXT-001',
    slugs: ['single-text-button'],
    match: (_r, hay) => hay.includes('button-name') || hay.includes('accessible name'),
    meta: KNOWN_BUGS['BUG-SINGLETEXT-001'],
  },
  {
    key: 'image:disabled-button',
    canonicalId: 'BUG-IMAGE-001',
    slugs: ['image'],
    match: (_r, hay) => hay.includes('disabled') && hay.includes('button'),
    meta: KNOWN_BUGS['BUG-IMAGE-001'],
  },
  {
    key: 'input:aria-invalid',
    canonicalId: 'BUG-INPUT-001',
    slugs: ['input'],
    match: (_r, hay) => hay.includes('aria-invalid') || hay.includes('input-error'),
    meta: KNOWN_BUGS['BUG-INPUT-001'],
  },
  {
    key: 'input-dynamic-text:contrast',
    canonicalId: 'BUG-IDT-001',
    slugs: ['input-dynamic-text'],
    match: (_r, hay) => hay.includes('color-contrast') || hay.includes('idt-disabled'),
    meta: KNOWN_BUGS['BUG-IDT-001'],
  },
  {
    key: 'modal:footer-missing',
    canonicalId: 'BUG-MODAL-003',
    slugs: ['modal'],
    match: (_r, hay) =>
      hay.includes('bug-modal-003') ||
      hay.includes('cancel') ||
      hay.includes('footer action') ||
      hay.includes('footer must render'),
    meta: KNOWN_BUGS['BUG-MODAL-003'],
  },
  {
    key: 'modal:appearance',
    canonicalId: 'BUG-MODAL-004',
    slugs: ['modal'],
    match: (_r, hay) => hay.includes('bug-modal-004') || hay.includes('data-appearance'),
    meta: KNOWN_BUGS['BUG-MODAL-004'],
  },
  {
    key: 'modal:escape',
    canonicalId: 'BUG-MODAL-006',
    slugs: ['modal'],
    match: (_r, hay) => hay.includes('bug-modal-006') || (hay.includes('escape') && hay.includes('dismissible')),
    meta: KNOWN_BUGS['BUG-MODAL-006'],
  },
  {
    key: 'modal:scroll-dividers',
    canonicalId: 'BUG-MODAL-002',
    slugs: ['modal'],
    match: (_r, hay) => hay.includes('bug-modal-002') || hay.includes('onscroll') || hay.includes('divider'),
    meta: KNOWN_BUGS['BUG-MODAL-002'],
  },
  {
    key: 'modal:focus-trap',
    slugs: ['modal'],
    match: (_r, hay) => hay.includes('focus trap') || hay.includes('remain trapped'),
    meta: {
      title: 'Keyboard focus can leave the open dialog instead of staying inside it',
      category: 'keyboard access',
      priority: 'high',
      wcag: '2.4.3',
      effort: 'm',
    },
  },
  {
    key: 'modal:contrast',
    slugs: ['modal'],
    match: (_r, hay) => hay.includes('color-contrast') || hay.includes('minimum contrast'),
    meta: {
      title: 'Dialog preview text does not have enough colour contrast',
      category: 'color contrast',
      priority: 'high',
      wcag: '1.4.3',
      effort: 's',
    },
  },
  {
    key: 'modal:max-height',
    slugs: ['modal'],
    match: (_r, hay) => hay.includes('maxheight') || hay.includes('scrollable modal'),
    meta: {
      title: 'Scrollable dialog max height is not applied',
      category: 'visual',
      priority: 'medium',
      wcag: '1.4.10',
      effort: 's',
    },
  },
  {
    key: 'tooltip:interaction',
    slugs: ['tooltip'],
    match: (_r, hay) =>
      hay.includes('timeout') ||
      hay.includes('trigger=click') ||
      hay.includes('trigger=hover') ||
      hay.includes('escape closes') ||
      hay.includes('click outside'),
    meta: {
      title: 'Click or hover tooltips do not open and close reliably',
      category: 'interaction',
      priority: 'high',
      wcag: '1.4.13',
      effort: 'm',
    },
  },
  {
    key: 'tooltip:keyboard-trap',
    slugs: ['tooltip'],
    match: (_r, hay) => hay.includes('keyboard trap') || hay.includes('tab should advance'),
    meta: {
      title: 'Keyboard users get stuck — Tab does not move focus past the tooltip trigger',
      category: 'keyboard access',
      priority: 'high',
      wcag: '2.1.2',
      effort: 's',
    },
  },
  {
    key: 'tooltip:figma-grid',
    slugs: ['tooltip'],
    match: (_r, hay) => hay.includes('figma') && (hay.includes('attached') || hay.includes('position=')),
    meta: {
      title: 'Figma validation tooltip examples do not render when triggered',
      category: 'interaction',
      priority: 'medium',
      wcag: '1.4.13',
      effort: 'm',
    },
  },
  {
    key: 'tooltip:reflow',
    slugs: ['tooltip'],
    match: (_r, hay) => hay.includes('320px') || hay.includes('horizontal scroll'),
    meta: {
      title: 'Tooltip showcase overflows horizontally on a small phone screen',
      category: 'visual',
      priority: 'medium',
      wcag: '1.4.10',
      effort: 's',
    },
  },
  {
    key: 'tabs:contrast',
    slugs: ['tabs'],
    match: (_r, hay) => hay.includes('color-contrast') || hay.includes('minimum contrast'),
    meta: {
      title: 'Selected tab label text does not have enough colour contrast',
      category: 'color contrast',
      priority: 'high',
      wcag: '1.4.3',
      effort: 's',
    },
  },
  {
    key: 'stepper:value',
    slugs: ['stepper'],
    match: (_r, hay) =>
      hay.includes('tohavevalue') ||
      hay.includes('increment') ||
      hay.includes('decrement') ||
      hay.includes('arrow up') ||
      hay.includes('arrow down'),
    meta: {
      title: 'Plus, minus, and arrow keys do not change the stepper number value',
      category: 'keyboard access',
      priority: 'high',
      wcag: '2.1.1',
      effort: 'm',
    },
  },
  {
    key: 'stepper:required',
    slugs: ['stepper'],
    match: (_r, hay) => hay.includes('aria-required') || hay.includes('required field'),
    meta: {
      title: 'Required stepper field does not announce that input is required',
      category: 'screen reader',
      priority: 'medium',
      wcag: '3.3.2',
      effort: 'xs',
    },
  },
  {
    key: 'stepper:readonly',
    slugs: ['stepper'],
    match: (_r, hay) => hay.includes('readonly') && hay.includes('timeout'),
    meta: {
      title: 'Read-only stepper still accepts typing when it should not',
      category: 'keyboard access',
      priority: 'medium',
      wcag: '2.1.1',
      effort: 's',
    },
  },
  {
    key: 'divider:label',
    slugs: ['divider'],
    match: (_r, hay) =>
      hay.includes('label text') ||
      hay.includes('getbytext') ||
      (hay.includes('divider') && hay.includes('section')),
    meta: {
      title: 'Label text inside dividers is not visible',
      category: 'visual',
      priority: 'high',
      wcag: '1.3.1',
      effort: 's',
    },
  },
  {
    key: 'divider:icon',
    slugs: ['divider'],
    match: (_r, hay) => hay.includes('svg') || hay.includes('icon slot'),
    meta: {
      title: 'Icon content is missing from divider examples',
      category: 'visual',
      priority: 'high',
      wcag: '1.1.1',
      effort: 's',
    },
  },
  {
    key: 'divider:focus',
    slugs: ['divider'],
    match: (_r, hay) => hay.includes('keyboard trap') || hay.includes('focus should move'),
    meta: {
      title: 'Tab barely moves focus through divider examples',
      category: 'keyboard access',
      priority: 'medium',
      wcag: '2.4.3',
      effort: 'xs',
    },
  },
  {
    key: 'radio:contrast',
    slugs: ['radio'],
    match: (_r, hay) => hay.includes('color-contrast') || hay.includes('minimum contrast'),
    meta: {
      title: 'Some radio options do not have enough colour contrast',
      category: 'color contrast',
      priority: 'high',
      wcag: '1.4.3',
      effort: 's',
    },
  },
  {
    key: 'radio:icon-alt',
    slugs: ['radio'],
    match: (_r, hay) =>
      hay.includes('role-img') ||
      hay.includes('role="img"') ||
      (hay.includes('svg') && hay.includes('aria')) ||
      hay.includes('role-img-alt'),
    meta: {
      title: 'Icon inside radio is not hidden or named for screen readers',
      category: 'screen reader',
      priority: 'high',
      wcag: '1.1.1',
      effort: 'xs',
    },
  },
  {
    key: 'radio:readonly',
    slugs: ['radio'],
    match: (_r, hay) => hay.includes('aria-readonly') || hay.includes('read-only'),
    meta: {
      title: 'Read-only radio group does not tell assistive tech it cannot be changed',
      category: 'screen reader',
      priority: 'high',
      wcag: '4.1.2',
      effort: 'xs',
    },
  },
  {
    key: 'radio:home-end',
    slugs: ['radio'],
    match: (_r, hay) => hay.includes('home') || hay.includes('end'),
    meta: {
      title: 'Home and End keys do not jump to the first and last radio option',
      category: 'keyboard access',
      priority: 'high',
      wcag: '2.1.1',
      effort: 's',
    },
  },
  {
    key: 'radio:accent-colour',
    slugs: ['radio'],
    match: (_r, hay) => hay.includes('accent') || hay.includes('distinct'),
    meta: {
      title: 'Different accent colours look the same when a radio is selected',
      category: 'visual',
      priority: 'medium',
      wcag: '1.4.1',
      effort: 's',
    },
  },
  {
    key: 'switch:icon-alt',
    slugs: ['switch'],
    match: (_r, hay) => hay.includes('role-img') || hay.includes('role="img"'),
    meta: {
      title: 'Internal switch icon is exposed to screen readers without a label',
      category: 'screen reader',
      priority: 'high',
      wcag: '1.1.1',
      effort: 'xs',
    },
  },
  {
    key: 'switch:colours',
    slugs: ['switch'],
    match: (_r, hay) => hay.includes('distinct') || hay.includes('computed rgb'),
    meta: {
      title: 'Primary and negative off-state track colours look identical',
      category: 'visual',
      priority: 'medium',
      wcag: '1.4.1',
      effort: 's',
    },
  },
  {
    key: 'counter-badge:dot-only',
    slugs: ['counter-badge'],
    match: (_r, hay) => hay.includes('dot-only') || hay.includes('numerals'),
    meta: {
      title: 'Extra-small high-attention badge shows a number when design expects a dot only',
      category: 'visual',
      priority: 'medium',
      wcag: '1.4.1',
      effort: 's',
    },
  },
  {
    key: 'counter-badge:status-name',
    slugs: ['counter-badge'],
    match: (_r, hay) => hay.includes('role=status') || hay.includes("role='status'"),
    meta: {
      title: 'Status badge region has no name for screen readers',
      category: 'screen reader',
      priority: 'high',
      wcag: '4.1.2',
      effort: 'xs',
    },
  },
  {
    key: 'chip:fill',
    slugs: ['chip'],
    match: (_r, hay) =>
      hay.includes('transparent') || hay.includes('selected fill') || hay.includes('fill changes'),
    meta: {
      title: 'Selected chip does not show a visible fill change',
      category: 'visual',
      priority: 'medium',
      wcag: '1.4.11',
      effort: 's',
    },
  },
  {
    key: 'chip:focus',
    slugs: ['chip'],
    match: (_r, hay) => hay.includes('keyboard trap') || hay.includes('focus should move'),
    meta: {
      title: 'Tab key only reaches one focus target in the chip group',
      category: 'keyboard access',
      priority: 'medium',
      wcag: '2.4.3',
      effort: 'xs',
    },
  },
  {
    key: 'checkbox:accent',
    slugs: ['checkbox'],
    match: (_r, hay) => hay.includes('accent') && hay.includes('fill'),
    meta: {
      title: 'Primary and sparkle checked colours look the same',
      category: 'visual',
      priority: 'medium',
      wcag: '1.4.1',
      effort: 's',
    },
  },
  {
    key: 'icon:colours',
    slugs: ['icon'],
    match: (_r, hay) => hay.includes('distinct') || hay.includes('rgb(0, 0, 0)'),
    meta: {
      title: 'Colour roles (primary, secondary, etc.) all render the same black icon',
      category: 'visual',
      priority: 'medium',
      wcag: '1.4.1',
      effort: 'm',
    },
  },
  {
    key: 'input:appearance-shell',
    slugs: ['input'],
    match: (_r, hay) => hay.includes('shell background') || hay.includes('transparent'),
    meta: {
      title: 'Appearance variants have transparent input backgrounds',
      category: 'visual',
      priority: 'medium',
      wcag: '1.4.11',
      effort: 's',
    },
  },
  {
    key: 'input:cursor-keys',
    slugs: ['input'],
    match: (_r, hay) => (hay.includes('home') || hay.includes('end')) && hay.includes('input'),
    meta: {
      title: 'Home and End keys do not move the text cursor to start and end',
      category: 'keyboard access',
      priority: 'medium',
      wcag: '2.1.1',
      effort: 'xs',
    },
  },
  {
    key: 'pagination:fill',
    slugs: ['pagination'],
    match: (_r, hay) => hay.includes('transparent fill') || hay.includes('attention="low"'),
    meta: {
      title: 'Low-attention selected page chip has no visible fill',
      category: 'visual',
      priority: 'medium',
      wcag: '1.4.11',
      effort: 's',
    },
  },
  {
    key: 'pagination-dots:fill',
    slugs: ['pagination-dots'],
    match: (_r, hay) =>
      hay.includes('transparent fill') ||
      hay.includes('active dot') ||
      hay.includes('distinct fills'),
    meta: {
      title: 'Active page dot has no visible fill colour',
      category: 'visual',
      priority: 'medium',
      wcag: '1.4.11',
      effort: 's',
    },
  },
  {
    key: 'radio:keyboard-trap',
    slugs: ['radio'],
    match: (_r, hay) => hay.includes('tab cycle') || hay.includes('expect(received).not.toBe'),
    meta: {
      title: 'Tab key does not move focus correctly through the radio group',
      category: 'keyboard access',
      priority: 'medium',
      wcag: '2.4.3',
      effort: 's',
    },
  },
  {
    key: 'stepper:focus',
    slugs: ['stepper'],
    match: (_r, hay) => hay.includes('tab should move focus') || hay.includes('distinct elements'),
    meta: {
      title: 'Tab key does not move focus through stepper controls correctly',
      category: 'keyboard access',
      priority: 'high',
      wcag: '2.4.3',
      effort: 'xs',
    },
  },
  {
    key: 'input:backspace',
    slugs: ['input'],
    match: (_r, hay) => hay.includes('backspace') || hay.includes('tohavevalue'),
    meta: {
      title: 'Backspace and delete keys do not edit the input value correctly',
      category: 'keyboard access',
      priority: 'high',
      wcag: '2.1.1',
      effort: 's',
    },
  },
  {
    key: 'slider:aria-range',
    slugs: ['slider'],
    match: (_r, hay) => hay.includes('aria-valuemin') || hay.includes('aria-valuemax'),
    meta: {
      title: 'Slider minimum and maximum are not exposed to assistive tech',
      category: 'screen reader',
      priority: 'medium',
      wcag: '4.1.2',
      effort: 'xs',
    },
  },
];

function isVisualCategoryBug(meta: BugMeta): boolean {
  return meta.category === 'visual';
}

function isDeferredContrastFailure(hay: string): boolean {
  return (
    hay.includes('color-contrast') ||
    hay.includes('colour contrast') ||
    hay.includes('color contrast') ||
    hay.includes('minimum contrast') ||
    hay.includes('foreground and background') ||
    hay.includes('idt-disabled')
  );
}

function isColorContrastBug(meta: BugMeta, hay: string): boolean {
  return meta.category === 'color contrast' || isDeferredContrastFailure(hay);
}
function stripAnsi(text: string): string {
  return text.replace(/\u001b\[[0-9;]*m/g, '');
}

function extractCanonicalId(row: FailedTestRow): string | undefined {
  const fromName = row.name.match(BUG_ID_RE)?.[0];
  if (fromName) return fromName;
  const fromError = stripAnsi(row.error ?? '').match(BUG_ID_RE)?.[0];
  return fromError;
}

function inferGenericMeta(row: FailedTestRow, hay: string): BugMeta {
  const plain = summarizeAxeFailureMessage(stripAnsi(row.error ?? ''));
  const title =
    plain ??
    row.name
      .replace(/^\[(fn|a11y)\]\s*/, '')
      .replace(/BUG-[A-Z0-9-]+-\d+[:\s—-]*/gi, '')
      .slice(0, 120);

  if (hay.includes('color-contrast') || hay.includes('minimum contrast')) {
    return {
      title: plain ?? row.name.slice(0, 120),
      category: 'deferred',
      priority: 'low',
      wcag: '1.4.3',
      effort: 's',
    };
  }
  if (hay.includes('button-name') || hay.includes('accessible name')) {
    return {
      title: plain ?? 'Control has no accessible name for screen readers',
      category: 'screen reader',
      priority: 'critical',
      wcag: '4.1.2',
      effort: 'xs',
    };
  }
  if (hay.includes('label') && hay.includes('form')) {
    return {
      title: plain ?? 'Form control is missing a visible or programmatic label',
      category: 'form label',
      priority: 'critical',
      wcag: '1.3.1',
      effort: 's',
    };
  }
  if (hay.includes('timeout')) {
    return {
      title: 'Interaction did not respond in time during automated testing',
      category: 'interaction',
      priority: 'high',
      wcag: '2.1.1',
      effort: 'm',
    };
  }

  return {
    title,
    category: row.suite === 'accessibility' ? 'screen reader' : 'interaction',
    priority: row.suite === 'accessibility' ? 'high' : 'medium',
    wcag: row.suite === 'accessibility' ? '4.1.2' : '2.1.1',
    effort: 's',
  };
}

function resolveBugKey(row: FailedTestRow): { bucketKey: string; meta: BugMeta; canonicalId?: string } {
  const hay = `${row.name} ${stripAnsi(row.error ?? '')}`.toLowerCase();
  const canonicalFromRow = extractCanonicalId(row);

  if (canonicalFromRow && KNOWN_BUGS[canonicalFromRow]) {
    return {
      bucketKey: canonicalFromRow,
      canonicalId: canonicalFromRow,
      meta: KNOWN_BUGS[canonicalFromRow],
    };
  }

  for (const rule of PATTERN_RULES) {
    if (rule.slugs && !rule.slugs.includes(row.slug)) continue;
    if (rule.match(row, hay)) {
      return {
        bucketKey: rule.canonicalId ?? `${row.slug}:${rule.key}`,
        canonicalId: rule.canonicalId,
        meta: rule.meta,
      };
    }
  }

  if (canonicalFromRow) {
    return {
      bucketKey: canonicalFromRow,
      canonicalId: canonicalFromRow,
      meta: inferGenericMeta(row, hay),
    };
  }

  const meta = inferGenericMeta(row, hay);
  return {
    bucketKey: `${row.slug}:${meta.category}:${meta.priority}`,
    meta,
  };
}

export function extractQaBugs(failedTests: FailedTestRow[]): QaBugReport {
  const buckets = new Map<
    string,
    {
      meta: BugMeta;
      canonicalId?: string;
      slug: string;
      component: string;
      testCount: number;
    }
  >();

  for (const row of failedTests) {
    const hay = `${row.name} ${stripAnsi(row.error ?? '')}`.toLowerCase();
    if (isDeferredContrastFailure(hay)) continue;
    const { bucketKey, meta, canonicalId } = resolveBugKey(row);
    if (isColorContrastBug(meta, hay)) continue;
    if (isVisualCategoryBug(meta)) continue;
    const existing = buckets.get(bucketKey);
    if (existing) {
      existing.testCount += 1;
    } else {
      buckets.set(bucketKey, {
        meta,
        canonicalId,
        slug: row.slug,
        component: row.component,
        testCount: 1,
      });
    }
  }

  const mergedBuckets = new Map<
    string,
    {
      meta: BugMeta;
      canonicalId?: string;
      slug: string;
      component: string;
      testCount: number;
    }
  >();

  for (const [bucketKey, bucket] of buckets) {
    const mergeKey = bucket.canonicalId ?? bucketKey;
    const existing = mergedBuckets.get(mergeKey);
    if (existing) {
      existing.testCount += bucket.testCount;
    } else {
      mergedBuckets.set(mergeKey, { ...bucket });
    }
  }

  const bugs: QaBugEntry[] = [...mergedBuckets.values()]
    .map(({ meta, canonicalId, slug, component, testCount }) => ({
      displayId: '',
      canonicalId,
      title: meta.title,
      component,
      slug,
      category: meta.category,
      priority: meta.priority,
      wcag: meta.wcag,
      effort: meta.effort,
      testCount,
    }))
    .filter((bug) => bug.category !== 'color contrast' && bug.category !== 'deferred' && bug.category !== 'visual')
    .sort((a, b) => {
      const pr = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (pr !== 0) return pr;
      return a.component.localeCompare(b.component) || a.title.localeCompare(b.title);
    });

  bugs.forEach((bug, index) => {
    bug.displayId = `BUG-${String(index + 1).padStart(3, '0')}`;
  });

  const summary: QaBugSummary = {
    total: bugs.length,
    critical: bugs.filter((b) => b.priority === 'critical').length,
    high: bugs.filter((b) => b.priority === 'high').length,
    medium: bugs.filter((b) => b.priority === 'medium').length,
    low: bugs.filter((b) => b.priority === 'low').length,
    componentsHit: new Set(bugs.map((b) => b.slug)).size,
  };

  return { summary, bugs };
}
