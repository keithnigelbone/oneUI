'use client';

import { useState, type ReactNode } from 'react';
import { PaginationDots } from '@oneui/ui/components/PaginationDots';
import type { PaginationDotsAppearance, PaginationDotsProps } from '@oneui/ui/components/PaginationDots';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

const FIGMA_APPEARANCES = [
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
] as const satisfies readonly PaginationDotsAppearance[];

type ComboRow = { caption: string; props: PaginationDotsProps };

const COMBO_MATRIX: ComboRow[] = [
  { caption: 'pageCount 5 · loop false · page 3', props: { pageCount: 5, defaultActiveIndex: 2, loop: false } },
  { caption: 'pageCount 12 · loop true · page 6', props: { pageCount: 12, defaultActiveIndex: 5, loop: true } },
  { caption: 'pageCount 2 · loop true', props: { pageCount: 2, defaultActiveIndex: 0, loop: true } },
  { caption: 'appearance sparkle', props: { pageCount: 8, defaultActiveIndex: 3, appearance: 'sparkle' } },
  { caption: 'readOnly · parent drives index', props: { pageCount: 8, defaultActiveIndex: 2, readOnly: true } },
];

/** Caption on top (Label XS), dots below — matches Pagination QA layout. */
function DotsScenarioRow({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className={styles.scenarioLabeledCellWide}>
      <span className={styles.scenarioCellCaption}>{caption}</span>
      <div className={styles.scenarioWidePreviewWrap}>{children}</div>
    </div>
  );
}

function PaginationDotsControlledDemo() {
  const [activeIndex, setActiveIndex] = useState(2);
  const pageCount = 8;
  return (
    <DotsScenarioRow
      caption={`Figma currentPage: ${activeIndex + 1} — code activeIndex: ${activeIndex} (0-based)`}
    >
      <PaginationDots
        data-testid="pagination-dots-controlled"
        pageCount={pageCount}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
        loop={false}
        aria-label="Controlled pagination dots QA"
      />
    </DotsScenarioRow>
  );
}

/**
 * PaginationDots QA playground — `currentPage` / code-only props.
 * Figma `pageCount` × `loop` matrix lives on the **Figma Validation** tab.
 */
export function PaginationDotsQaShowcase() {
  return (
    <QaShowcaseRoot layout="centered">
      <QaStoryBand id="pagination-dots-qa-default" title="Default (PaginationDots.stories Default)" centerContent>
        <QaApiSectionBody>
          <PaginationDots
            data-testid="pagination-dots-default"
            pageCount={8}
            defaultActiveIndex={0}
            loop={false}
            appearance="primary"
            aria-label="Pagination dots QA default"
          />
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="pagination-dots-qa-current-page" title="1 currentPage (Figma code-only → activeIndex)" overflow>
        <p className={styles.storySectionLeadCompact}>
          Figma labels <code>currentPage</code> under “Code only”; code uses <code>activeIndex</code> (controlled) or{' '}
          <code>defaultActiveIndex</code> (uncontrolled initial). Values are <strong>0-based indices</strong>, not
          1-based page numbers — display as <code>currentPage = activeIndex + 1</code> ⚠️.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            <DotsScenarioRow caption="defaultActiveIndex: 0 (uncontrolled)">
              <PaginationDots
                data-testid="pagination-dots-uncontrolled-0"
                pageCount={5}
                defaultActiveIndex={0}
                loop={false}
                aria-label="defaultActiveIndex 0"
              />
            </DotsScenarioRow>
            <DotsScenarioRow caption="defaultActiveIndex: 2 (uncontrolled)">
              <PaginationDots
                data-testid="pagination-dots-uncontrolled-2"
                pageCount={5}
                defaultActiveIndex={2}
                loop={false}
                aria-label="defaultActiveIndex 2"
              />
            </DotsScenarioRow>
            <PaginationDotsControlledDemo />
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="pagination-dots-qa-code-only" title="2 Code-only props (not in Figma API table)" overflow>
        <p className={styles.storySectionLeadCompact}>
          From <code>PaginationDots.shared.ts</code> / Storybook — absent from the Figma component-property table ⚠️.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            <DotsScenarioRow caption="appearance: primary (default)">
              <PaginationDots
                pageCount={5}
                defaultActiveIndex={2}
                appearance="primary"
                aria-label="appearance primary"
              />
            </DotsScenarioRow>
            <DotsScenarioRow caption="appearance: sparkle">
              <PaginationDots
                data-testid="pagination-dots-appearance-sparkle"
                pageCount={5}
                defaultActiveIndex={2}
                appearance="sparkle"
                aria-label="appearance sparkle"
              />
            </DotsScenarioRow>
            <DotsScenarioRow caption="readOnly: true — role=status, non-interactive">
              <PaginationDots
                data-testid="pagination-dots-readonly"
                pageCount={8}
                defaultActiveIndex={2}
                readOnly
                aria-label="Read-only pagination dots"
              />
            </DotsScenarioRow>
            <p className={styles.storySectionLeadCompact}>
              <code>onActiveIndexChange</code> — wired in band 2 controlled demo ⚠️
            </p>
            {/* TODO: Figma documents single size M only — PaginationDotsSize deprecated; no size prop on component */}
            <DotsScenarioRow caption="size — Figma only M; no public size prop in code">
              <span className={styles.scenarioCellCaption}>
                <code>PaginationDotsSize</code> deprecated in shared types ⚠️
              </span>
            </DotsScenarioRow>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="pagination-dots-qa-appearance-strip" title="3 Appearance strip (Storybook Appearances)" overflow>
        <p className={styles.storySectionLeadCompact}>
          Same roles as <code>PaginationDots.showcase.tsx</code> Appearances — <code>brand-bg</code> included in code ⚠️.
        </p>
        <QaApiSectionBody scrollable scrollableRegionLabel="PaginationDots appearance rows">
          <div className={styles.scenarioStackWide}>
            {FIGMA_APPEARANCES.map((appearance) => (
              <DotsScenarioRow key={appearance} caption={`appearance: ${appearance}`}>
                <PaginationDots
                  pageCount={5}
                  defaultActiveIndex={2}
                  appearance={appearance}
                  aria-label={`appearance ${appearance}`}
                />
              </DotsScenarioRow>
            ))}
            <DotsScenarioRow caption="appearance: brand-bg">
              <PaginationDots
                pageCount={5}
                defaultActiveIndex={2}
                appearance="brand-bg"
                aria-label="appearance brand-bg"
              />
            </DotsScenarioRow>
            <DotsScenarioRow caption="appearance: auto → resolves primary">
              <PaginationDots pageCount={5} defaultActiveIndex={2} appearance="auto" aria-label="appearance auto" />
            </DotsScenarioRow>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="pagination-dots-qa-degenerate" title="4 Degenerate counts (Storybook)" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            <DotsScenarioRow caption="pageCount: 0 (count=0)">
              <PaginationDots data-testid="pagination-dots-empty" pageCount={0} aria-label="Empty count" />
            </DotsScenarioRow>
            <DotsScenarioRow caption="pageCount: 1">
              <PaginationDots data-testid="pagination-dots-single" pageCount={1} aria-label="Single dot" />
            </DotsScenarioRow>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="pagination-dots-qa-combos" title="5 Combination matrix" overflow>
        <p className={styles.storySectionLeadCompact}>
          Representative <code>pageCount</code> + <code>loop</code> + code-only mixes — one row each.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            {COMBO_MATRIX.map((row, index) => (
              <DotsScenarioRow key={row.caption} caption={row.caption}>
                <PaginationDots
                  data-testid={
                    row.caption === 'pageCount 2 · loop true'
                      ? 'pagination-dots-loop-true'
                      : `pagination-dots-combo-${index}`
                  }
                  {...row.props}
                  aria-label={row.caption}
                />
              </DotsScenarioRow>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
