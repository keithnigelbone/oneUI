'use client';

import { useState, type ReactNode } from 'react';
import { Pagination } from '@oneui/ui/components/Pagination';
import type { PaginationAttention, PaginationProps, PaginationSize } from '@oneui/ui/components/Pagination';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import { PaginationRealTimeScenarios } from './PaginationRealTimeScenarios';
import { sanitizePaginationProps } from './safePaginationProps';
import styles from '../../styles/qa.module.css';

const appearanceRowLabelStyle = {
  minWidth: 'var(--Spacing-24)',
  flexShrink: 0,
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-S-FontSize)',
  lineHeight: 'var(--Label-S-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Medium)',
  color: 'var(--Text-Medium)',
} as const;

/** Figma S / M / L — same as `Pagination.stories.tsx` argTypes. */
const FIGMA_SIZES = ['S', 'M', 'L'] as const satisfies readonly PaginationSize[];

/** Figma attention — maps to selected-page chip fill (high→bold, medium→subtle, low→ghost). */
const FIGMA_ATTENTIONS = ['high', 'medium', 'low'] as const satisfies readonly PaginationAttention[];

/** Windowed demo: mirrors design spec (page 6 of 11 with ellipses). */
const QA_TOTAL_PAGES = 11;
const QA_DEFAULT_PAGE = 6;

/** Storybook defaults — always pass explicit finite counts to avoid NaN in windowing math. */
const QA_SIBLING_COUNT = 1;
const QA_BOUNDARY_COUNT = 1;

type FirstLastFigma = { firstPage: boolean; lastPage: boolean; showFirstLast: boolean; caption: string };

const FIGMA_FIRST_LAST: FirstLastFigma[] = [
  {
    firstPage: false,
    lastPage: false,
    showFirstLast: false,
    caption: 'firstPage: false · lastPage: false → showFirstLast: false',
  },
  {
    firstPage: true,
    lastPage: true,
    showFirstLast: true,
    caption: 'firstPage: true · lastPage: true → showFirstLast: true',
  },
];

type ComboRow = { caption: string; props: PaginationProps };

const COMBO_MATRIX: ComboRow[] = [
  {
    caption: 'M · high · first/last on',
    props: {
      totalPages: QA_TOTAL_PAGES,
      defaultPage: QA_DEFAULT_PAGE,
      size: 'M',
      attention: 'high',
      showFirstLast: true,
      siblingCount: QA_SIBLING_COUNT,
      boundaryCount: QA_BOUNDARY_COUNT,
    },
  },
  {
    caption: 'S · medium · first/last on',
    props: {
      totalPages: QA_TOTAL_PAGES,
      defaultPage: 5,
      size: 'S',
      attention: 'medium',
      showFirstLast: true,
      siblingCount: QA_SIBLING_COUNT,
      boundaryCount: QA_BOUNDARY_COUNT,
    },
  },
  {
    caption: 'L · low · first/last off',
    props: {
      totalPages: QA_TOTAL_PAGES,
      defaultPage: 4,
      size: 'L',
      attention: 'low',
      showFirstLast: false,
      siblingCount: QA_SIBLING_COUNT,
      boundaryCount: QA_BOUNDARY_COUNT,
    },
  },
];

function QaPagination(props: PaginationProps) {
  return <Pagination {...sanitizePaginationProps(props)} />;
}

/** Caption on top (small), navigator below in a horizontal-scroll shell. */
function PaginationScenarioRow({
  caption,
  captionTestId,
  children,
}: {
  caption?: string;
  captionTestId?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.scenarioLabeledCellWide}>
      {caption ? (
        <span className={styles.scenarioCellCaption} {...(captionTestId ? { 'data-testid': captionTestId } : {})}>
          {caption}
        </span>
      ) : null}
      <div className={styles.scenarioWidePreviewWrap}>{children}</div>
    </div>
  );
}

function PaginationControlledDemo() {
  const [page, setPage] = useState(3);
  return (
    <PaginationScenarioRow caption={`page: ${page}`} captionTestId="pagination-controlled-caption">
      <QaPagination
        totalPages={10}
        page={page}
        onPageChange={setPage}
        showFirstLast
        showPrevNext
        siblingCount={QA_SIBLING_COUNT}
        boundaryCount={QA_BOUNDARY_COUNT}
        aria-label="Controlled pagination QA"
        data-testid="pagination-controlled"
      />
    </PaginationScenarioRow>
  );
}

export function PaginationQaShowcase() {
  return (
    <QaShowcaseRoot layout="default">
      <QaStoryBand id="pagination-qa-default" title="Default (Pagination.stories Default)" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioWidePreviewWrap}>
            <QaPagination
              totalPages={10}
              defaultPage={5}
              siblingCount={QA_SIBLING_COUNT}
              boundaryCount={QA_BOUNDARY_COUNT}
              showPrevNext
              aria-label="Pagination QA default"
              data-testid="pagination-default"
            />
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="pagination-qa-size" title="1 Size (S · M · L)" overflow>
        <p className={styles.storySectionLeadCompact}>
          Figma API: <code>size</code> — component property. Code accepts uppercase <code>S</code>/<code>M</code>/<code>L</code>{' '}
          and lowercase <code>s</code>/<code>m</code>/<code>l</code> (normalized in <code>Pagination.shared.ts</code>) ⚠️.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            {FIGMA_SIZES.map((size) => (
              <PaginationScenarioRow key={size} caption={`size: ${size}`}>
                <QaPagination
                  totalPages={QA_TOTAL_PAGES}
                  defaultPage={QA_DEFAULT_PAGE}
                  size={size}
                  attention="medium"
                  showFirstLast
                  showPrevNext
                  siblingCount={QA_SIBLING_COUNT}
                  boundaryCount={QA_BOUNDARY_COUNT}
                  aria-label={`Pagination size ${size}`}
                  data-testid={`pagination-size-${size}`}
                />
              </PaginationScenarioRow>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="pagination-qa-attention" title="2 Attention (high · medium · low)" overflow>
        <p className={styles.storySectionLeadCompact}>
          Figma API: <code>attention</code> — selected-page chip prominence. Nav arrows stay low attention.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            {FIGMA_ATTENTIONS.map((attention) => (
              <div
                key={attention}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--Spacing-5)', flexWrap: 'wrap', width: '100%' }}
              >
                <span style={appearanceRowLabelStyle}>{attention}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={styles.scenarioWidePreviewWrap}>
                    <QaPagination
                      totalPages={QA_TOTAL_PAGES}
                      defaultPage={QA_DEFAULT_PAGE}
                      attention={attention}
                      size="M"
                      showFirstLast
                      showPrevNext
                      siblingCount={QA_SIBLING_COUNT}
                      boundaryCount={QA_BOUNDARY_COUNT}
                      aria-label={`Pagination attention ${attention}`}
                      data-testid={`pagination-attention-${attention}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="pagination-qa-first-last" title="3 firstPage · lastPage (Figma → showFirstLast)" overflow>
        <p className={styles.storySectionLeadCompact}>
          Figma <code>firstPage</code> / <code>lastPage</code> map to code <code>showFirstLast</code> (both jump buttons on or off).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            {FIGMA_FIRST_LAST.map(({ firstPage, lastPage, showFirstLast, caption }) => (
              <PaginationScenarioRow key={caption} caption={caption}>
                <QaPagination
                  totalPages={QA_TOTAL_PAGES}
                  defaultPage={QA_DEFAULT_PAGE}
                  showFirstLast={showFirstLast}
                  showPrevNext
                  size="M"
                  attention="medium"
                  siblingCount={QA_SIBLING_COUNT}
                  boundaryCount={QA_BOUNDARY_COUNT}
                  aria-label={`Pagination firstPage ${String(firstPage)} lastPage ${String(lastPage)}`}
                  data-testid={`pagination-first-${firstPage}-last-${lastPage}`}
                />
              </PaginationScenarioRow>
            ))}
          </div>
        </QaApiSectionBody>
        <p className={styles.storySectionLeadCompact}>
          Unsupported Figma-only pairs: <code>firstPage: true · lastPage: false</code> and{' '}
          <code>firstPage: false · lastPage: true</code>.
        </p>
      </QaStoryBand>

      <QaStoryBand id="pagination-qa-matrix" title="4 Design matrix (size × attention · firstPage & lastPage true)" overflow>
        <p className={styles.storySectionLeadCompact}>
          All sizes × attention levels with <code>showFirstLast</code> (matches <code>Pagination.showcase.tsx</code> matrix).
        </p>
        <QaApiSectionBody scrollable scrollableRegionLabel="Pagination size × attention matrix">
          <div className={styles.scenarioStackWide}>
            {FIGMA_ATTENTIONS.map((attention) => (
              <div key={attention} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)', width: '100%' }}>
                <span style={appearanceRowLabelStyle}>{`attention: ${attention}`}</span>
                {FIGMA_SIZES.map((size) => (
                  <PaginationScenarioRow key={`${attention}-${size}`} caption={`size: ${size}`}>
                    <QaPagination
                      totalPages={12}
                      defaultPage={4}
                      attention={attention}
                      size={size}
                      showFirstLast
                      showPrevNext
                      siblingCount={QA_SIBLING_COUNT}
                      boundaryCount={QA_BOUNDARY_COUNT}
                      aria-label={`Matrix ${attention} ${size}`}
                      data-testid={`pagination-matrix-${attention}-${size}`}
                    />
                  </PaginationScenarioRow>
                ))}
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="pagination-qa-e2e" title="E2E — controlled, edges, ellipsis, large count" overflow>
        <p className={styles.storySectionLeadCompact}>
          Playwright scenarios: <code>pagination-controlled</code>, first/last edge, ellipsis, <code>siblingCount</code>.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            <PaginationControlledDemo />
            <PaginationScenarioRow caption="defaultPage: 1 — previous disabled">
              <QaPagination
                totalPages={10}
                defaultPage={1}
                showFirstLast
                showPrevNext
                siblingCount={QA_SIBLING_COUNT}
                boundaryCount={QA_BOUNDARY_COUNT}
                aria-label="First page edge"
                data-testid="pagination-edge-first"
              />
            </PaginationScenarioRow>
            <PaginationScenarioRow caption="defaultPage: 10 — next disabled">
              <QaPagination
                totalPages={10}
                defaultPage={10}
                showFirstLast
                showPrevNext
                siblingCount={QA_SIBLING_COUNT}
                boundaryCount={QA_BOUNDARY_COUNT}
                aria-label="Last page edge"
                data-testid="pagination-edge-last"
              />
            </PaginationScenarioRow>
            <PaginationScenarioRow caption="totalPages: 20 — ellipsis window">
              <QaPagination
                totalPages={20}
                defaultPage={10}
                showFirstLast
                showPrevNext
                siblingCount={QA_SIBLING_COUNT}
                boundaryCount={QA_BOUNDARY_COUNT}
                aria-label="Ellipsis window"
                data-testid="pagination-ellipsis"
              />
            </PaginationScenarioRow>
            <PaginationScenarioRow caption="totalPages: 50 — large count layout">
              <QaPagination
                totalPages={50}
                defaultPage={25}
                showFirstLast
                showPrevNext
                siblingCount={QA_SIBLING_COUNT}
                boundaryCount={QA_BOUNDARY_COUNT}
                aria-label="Large page count"
                data-testid="pagination-large-count"
              />
            </PaginationScenarioRow>
            <PaginationScenarioRow caption="siblingCount: 2">
              <QaPagination
                totalPages={12}
                defaultPage={6}
                showFirstLast
                showPrevNext
                siblingCount={2}
                boundaryCount={QA_BOUNDARY_COUNT}
                aria-label="siblingCount 2"
                data-testid="pagination-sibling-2"
              />
            </PaginationScenarioRow>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="pagination-qa-code-only" title="5 Code-only props (not in Figma API table)" overflow>
        <p className={styles.storySectionLeadCompact}>
          Props in code / Storybook but not in the Figma API table ⚠️. Safe <code>siblingCount</code> / <code>boundaryCount</code> defaults.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            <PaginationScenarioRow caption="siblingCount: 1 · boundaryCount: 1 ⚠️">
              <QaPagination
                totalPages={5}
                defaultPage={3}
                siblingCount={QA_SIBLING_COUNT}
                boundaryCount={QA_BOUNDARY_COUNT}
                showPrevNext
                aria-label="Compact total — standard windowing"
                data-testid="pagination-code-sibling-boundary"
              />
            </PaginationScenarioRow>
            <PaginationScenarioRow caption="showPrevNext: false ⚠️">
              <QaPagination
                totalPages={12}
                defaultPage={4}
                showPrevNext={false}
                showFirstLast
                siblingCount={QA_SIBLING_COUNT}
                boundaryCount={QA_BOUNDARY_COUNT}
                aria-label="No prev/next arrows"
                data-testid="pagination-code-no-prev-next"
              />
            </PaginationScenarioRow>
            <PaginationScenarioRow caption="appearance: positive ⚠️">
              <QaPagination
                totalPages={12}
                defaultPage={4}
                appearance="positive"
                attention="high"
                showFirstLast
                showPrevNext
                siblingCount={QA_SIBLING_COUNT}
                boundaryCount={QA_BOUNDARY_COUNT}
                aria-label="appearance positive"
                data-testid="pagination-code-appearance"
              />
            </PaginationScenarioRow>
            <PaginationScenarioRow caption="disabled: true ⚠️">
              <QaPagination
                totalPages={10}
                defaultPage={4}
                disabled
                showFirstLast
                showPrevNext
                siblingCount={QA_SIBLING_COUNT}
                boundaryCount={QA_BOUNDARY_COUNT}
                aria-label="Disabled pagination"
                data-testid="pagination-code-disabled"
              />
            </PaginationScenarioRow>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="pagination-qa-realtime" title="7 Real-time scenarios" overflow>
        <p className={styles.storySectionLeadCompact}>
          Controlled <code>page</code> / <code>onPageChange</code> patterns used in products — table footers, search,
          filters, compact mobile bars, and dynamic totals after fetch. Live labels update as you paginate.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            <PaginationRealTimeScenarios />
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="pagination-qa-combos" title="8 Combination matrix" overflow>
        <p className={styles.storySectionLeadCompact}>
          Representative prop combinations — one full-width row each (avoids multi-column overlap).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            {COMBO_MATRIX.map((row, index) => (
              <PaginationScenarioRow key={row.caption} caption={row.caption}>
                <QaPagination
                  {...row.props}
                  showPrevNext
                  aria-label={row.caption}
                  data-testid={`pagination-combo-${index}`}
                />
              </PaginationScenarioRow>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
