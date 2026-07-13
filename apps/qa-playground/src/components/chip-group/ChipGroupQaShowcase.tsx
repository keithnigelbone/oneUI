'use client';

/**
 * ChipGroup QA playground — Figma API sections, containerType mismatch flag,
 * events, and combination matrix.
 *
 * ─── Figma API table ────────────────────────────────────────────────────────
 * | Property      | Figma values   | Code prop      | Status                |
 * |---------------|----------------|----------------|-----------------------|
 * | size          | S · M · L      | size?: 's'|'m'|'l' | ✅ Match (case only) |
 * | containerType | inline · wrap  | wrap?: boolean | ⚠️ MISMATCH           |
 * ────────────────────────────────────────────────────────────────────────────
 *
 * containerType mismatch details:
 *   Figma `inline`  → code `wrap={false}` → DOM `data-wrap="false"`
 *   Figma `wrap`    → code `wrap={true}` (default) → DOM: no data-wrap attr
 *   Action: Figma should rename to `wrap` or code should expose `containerType`.
 */

import type { ReactNode } from 'react';
import { Chip } from '@oneui/ui/components/Chip';
import { ChipGroup } from '@oneui/ui/components/ChipGroup';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

const DEMO_CHIPS = [
  { value: 'chip-0', label: 'Label' },
  { value: 'chip-1', label: 'Label' },
  { value: 'chip-2', label: 'Label' },
  { value: 'chip-3', label: 'Label' },
  { value: 'chip-4', label: 'Label' },
] as const;

/** Stable console contract for Playwright (`e2e/chip-group-qa.spec.ts` event tests). */
function logChipGroupQaEvent(testId: string, event: string, payload: Record<string, unknown>) {
  console.log(`[chip-group-qa] ${event} ${JSON.stringify({ testId, ...payload })}`);
}

function ChipGroupBand({
  id,
  title,
  lead,
  overflow,
  children,
}: {
  id: string;
  title: string;
  lead?: ReactNode;
  overflow?: boolean;
  children: ReactNode;
}) {
  return (
    <QaStoryBand id={id} title={title} lead={lead} overflow={overflow}>
      <QaApiSectionBody>{children}</QaApiSectionBody>
    </QaStoryBand>
  );
}

/**
 * ChipGroup QA showcase — covers the two Figma API table properties
 * (size, containerType) plus events and combinations.
 */
export function ChipGroupQaShowcase() {
  return (
    <QaShowcaseRoot layout="centered">

      {/* ── Default ────────────────────────────────────────────────────── */}
      <ChipGroupBand id="chip-group-qa-default" title="Default">
        <div data-testid="chip-group-default">
          <ChipGroup aria-label="Default chip group">
            {DEMO_CHIPS.map(({ value, label }) => (
              <Chip key={value} value={value}>{label}</Chip>
            ))}
          </ChipGroup>
        </div>
      </ChipGroupBand>

      {/* ── 1. size ────────────────────────────────────────────────────── */}
      <ChipGroupBand
        id="chip-group-qa-size"
        title="1 size (M · S · L)"
        lead={
          <>
            Figma <code>size</code>: S · M · L — maps directly to code{' '}
            <code>size=&quot;s&quot;</code> / <code>&quot;m&quot;</code> / <code>&quot;l&quot;</code>{' '}
            (lowercase). Size is propagated from ChipGroup context to every child Chip.{' '}
            First chip in each group is pre-selected so sizing differences are visible.
          </>
        }
      >
        <div className={styles.scenarioFlexRow}>
          {(['m', 's', 'l'] as const).map((size) => (
            <div key={size} className={styles.scenarioLabeledCell}>
              <div data-testid={`chip-group-size-${size}`}>
                <ChipGroup
                  size={size}
                  defaultValue={['chip-0']}
                  aria-label={`Size ${size.toUpperCase()} group`}
                >
                  {DEMO_CHIPS.map(({ value, label }) => (
                    <Chip key={value} value={value}>{label}</Chip>
                  ))}
                </ChipGroup>
              </div>
              <span className={styles.scenarioCellCaption}>{`size: ${size.toUpperCase()}`}</span>
            </div>
          ))}
        </div>
      </ChipGroupBand>

      {/* ── 2. containerType ───────────────────────────────────────────── */}
      <ChipGroupBand
        id="chip-group-qa-container-type"
        title="2 containerType (inline · wrap)"
      >
        <div className={styles.scenarioFlexRow}>
          {/* Figma inline → wrap=false */}
          <div className={styles.scenarioLabeledCell}>
            <div
              data-testid="chip-group-container-inline"
              style={{ maxWidth: '220px', overflow: 'hidden' }}
            >
              <ChipGroup
                wrap={false}
                defaultValue={['chip-0']}
                aria-label="Inline container chip group"
              >
                {DEMO_CHIPS.map(({ value, label }) => (
                  <Chip key={value} value={value}>{label}</Chip>
                ))}
              </ChipGroup>
            </div>
            <span className={styles.scenarioCellCaption}>
              containerType: <strong>inline</strong>
              <br />
              <code>wrap=&#123;false&#125;</code>
            </span>
          </div>

          {/* Figma wrap → wrap=true (default) */}
          <div className={styles.scenarioLabeledCell}>
            <div
              data-testid="chip-group-container-wrap"
              style={{ maxWidth: '130px' }}
            >
              <ChipGroup
                wrap={true}
                defaultValue={['chip-0']}
                aria-label="Wrap container chip group"
              >
                {DEMO_CHIPS.map(({ value, label }) => (
                  <Chip key={value} value={value}>{label}</Chip>
                ))}
              </ChipGroup>
            </div>
            <span className={styles.scenarioCellCaption}>
              containerType: <strong>wrap</strong>
              <br />
              <code>wrap=&#123;true&#125;</code>
            </span>
          </div>
        </div>
      </ChipGroupBand>

      {/* ── 3. Events (console) ────────────────────────────────────────── */}
      <ChipGroupBand
        id="chip-group-qa-events"
        title="3 Events (console)"
        lead={
          <>
            <code>onValueChange(values: string[])</code> fires on every selection change.
            Console contract:{' '}
            <code>[chip-group-qa] valueChange &#123;&quot;testId&quot;,&quot;values&quot;:[...]&#125;</code>.
            The group uses <code>multiple</code> so any number of chips can be selected.
            Verified by Playwright console listener in <code>chip-group-qa.spec.ts</code>.
          </>
        }
      >
        <div data-testid="chip-group-events">
          <ChipGroup
            multiple
            aria-label="Events chip group"
            onValueChange={(values) =>
              logChipGroupQaEvent('chip-group-events', 'valueChange', { values })
            }
          >
            {DEMO_CHIPS.map(({ value, label }, i) => (
              <Chip key={value} value={value} data-testid={`chip-group-event-chip-${i}`}>
                {label}
              </Chip>
            ))}
          </ChipGroup>
        </div>
      </ChipGroupBand>

      {/* ── 4. Combinations — all Figma API values ──────────────────────── */}
      <ChipGroupBand
        id="chip-group-qa-combos"
        title="4 Combinations (size × containerType)"
        lead="Full cross-product of both Figma API props: size (M · S · L) × containerType (inline · wrap)."
        overflow
      >
        <div className={styles.scenarioFlexRow}>
          {(['m', 's', 'l'] as const).flatMap((size) =>
            ([false, true] as const).map((wrap) => {
              const container = wrap ? 'wrap' : 'inline';
              const testId = `chip-group-combo-${size}-${container}`;
              return (
                <div key={testId} className={styles.scenarioLabeledCell}>
                  <div
                    data-testid={testId}
                    style={!wrap ? { maxWidth: '180px', overflow: 'hidden' } : { maxWidth: '110px' }}
                  >
                    <ChipGroup
                      size={size}
                      wrap={wrap}
                      defaultValue={['chip-0']}
                      aria-label={`${size.toUpperCase()} ${container}`}
                    >
                      {DEMO_CHIPS.slice(0, 3).map(({ value, label }) => (
                        <Chip key={value} value={value}>{label}</Chip>
                      ))}
                    </ChipGroup>
                  </div>
                  <span className={styles.scenarioCellCaption}>
                    {`${size.toUpperCase()} · ${container}`}
                  </span>
                </div>
              );
            }),
          )}
        </div>
      </ChipGroupBand>

    </QaShowcaseRoot>
  );
}
