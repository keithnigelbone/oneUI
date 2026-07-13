'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@oneui/ui/components/Button';
import { Pagination } from '@oneui/ui/components/Pagination';
import type { PaginationProps } from '@oneui/ui/components/Pagination';
import rtStyles from './pagination-realtime.module.css';
import {
  CHECKOUT_STEPS,
  FILTER_TASK_TOTALS,
  getArticlesForPage,
  getFeedRowsForPage,
  getProductCardsForPage,
  getSearchResultsForPage,
  getTableRowsForPage,
  getTasksForFilterPage,
} from './paginationTestData';
import { sanitizePaginationProps } from './safePaginationProps';
import styles from '../../styles/qa.module.css';

function QaPagination(props: PaginationProps) {
  return <Pagination {...sanitizePaginationProps(props)} />;
}

const liveMetaStyle = {
  margin: '0 0 var(--Spacing-2)',
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Body-S-FontSize)',
  lineHeight: 'var(--Body-S-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Low)',
  color: 'var(--Text-Medium)',
} as const;

const filterRowStyle = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: 'var(--Spacing-2)',
  marginBottom: 'var(--Spacing-3)',
};

function RealTimeScenarioShell({
  caption,
  meta,
  metaTestId,
  pageTestId,
  page,
  footer,
}: {
  caption: string;
  meta: string;
  metaTestId: string;
  pageTestId: string;
  page: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className={styles.scenarioLabeledCellWide}>
      <span className={styles.scenarioCellCaption}>{caption}</span>
      <p style={liveMetaStyle} data-testid={metaTestId}>
        {meta}
      </p>
      <div className={rtStyles.page} data-testid={pageTestId}>
        {page}
        <div className={rtStyles.footer}>{footer}</div>
      </div>
    </div>
  );
}

function sharedNavProps(overrides?: Partial<PaginationProps>): Partial<PaginationProps> {
  return {
    siblingCount: 1,
    boundaryCount: 1,
    showPrevNext: true,
    size: 'M',
    attention: 'medium',
    ...overrides,
  };
}

function TablePageBody({ page, pageSize, totalItems }: { page: number; pageSize: number; totalItems: number }) {
  const rows = getTableRowsForPage(page, pageSize, totalItems);
  return (
    <table className={rtStyles.table} data-testid="pagination-realtime-table-data">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Status</th>
          <th scope="col">Updated</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} data-testid={row.id}>
            <td>{row.name}</td>
            <td>{row.status}</td>
            <td>{row.updated}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SearchResultsPageBody({ page }: { page: number }) {
  const results = getSearchResultsForPage(page);
  return (
    <ul className={rtStyles.list} data-testid="pagination-realtime-search-data">
      {results.map((row) => (
        <li key={row.id} className={rtStyles.listItem} data-testid={row.id}>
          <p className={rtStyles.listTitle}>{row.title}</p>
          <p className={rtStyles.listMeta}>
            {row.category} · {row.snippet}
          </p>
        </li>
      ))}
    </ul>
  );
}

function ProductGridPageBody({ page }: { page: number }) {
  const cards = getProductCardsForPage(page);
  return (
    <div className={rtStyles.grid} data-testid="pagination-realtime-catalog-data">
      {cards.map((card) => (
        <article key={card.id} className={rtStyles.card} data-testid={card.id}>
          <span className={rtStyles.cardTag}>{card.tag}</span>
          <p className={rtStyles.listTitle}>{card.title}</p>
          <p className={rtStyles.cardPrice}>{card.price}</p>
        </article>
      ))}
    </div>
  );
}

function ArticleListPageBody({ page }: { page: number }) {
  const articles = getArticlesForPage(page);
  return (
    <ul className={rtStyles.list} data-testid="pagination-realtime-compact-data">
      {articles.map((row) => (
        <li key={row.id} className={rtStyles.listItem} data-testid={row.id}>
          <p className={rtStyles.listTitle}>{row.headline}</p>
          <p className={rtStyles.listMeta}>{row.readTime}</p>
        </li>
      ))}
    </ul>
  );
}

function CheckoutStepPageBody({ page }: { page: number }) {
  const step = CHECKOUT_STEPS[page - 1] ?? CHECKOUT_STEPS[0]!;
  return (
    <section className={rtStyles.stepPanel} data-testid="pagination-realtime-few-data">
      <h3 className={rtStyles.stepTitle}>{step.title}</h3>
      <p className={rtStyles.stepBody}>{step.body}</p>
    </section>
  );
}

function TaskListPageBody({
  filter,
  page,
}: {
  filter: 'all' | 'active' | 'archived';
  page: number;
}) {
  const tasks = getTasksForFilterPage(filter, page);
  return (
    <ul className={rtStyles.list} data-testid="pagination-realtime-filter-data">
      {tasks.map((task) => (
        <li key={task.id} className={rtStyles.listItem} data-testid={task.id}>
          <p className={rtStyles.listTitle}>{task.title}</p>
          <p className={rtStyles.listMeta}>
            {task.owner} · {task.state}
          </p>
        </li>
      ))}
    </ul>
  );
}

function FeedPageBody({ page, totalPages }: { page: number; totalPages: number }) {
  const rows = getFeedRowsForPage(page, totalPages);
  return (
    <ul className={rtStyles.list} data-testid="pagination-realtime-dynamic-data">
      {rows.map((row) => (
        <li key={row.id} className={rtStyles.listItem} data-testid={row.id}>
          <p className={rtStyles.listTitle}>{row.label}</p>
          <p className={rtStyles.listMeta}>{row.detail}</p>
        </li>
      ))}
    </ul>
  );
}

/** Data table / list footer — page size × total items. */
export function PaginationTableListDemo() {
  const pageSize = 10;
  const totalItems = 247;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const [page, setPage] = useState(1);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <RealTimeScenarioShell
      caption="Table / list footer (controlled page + range label)"
      meta={`Showing ${start}–${end} of ${totalItems} · page ${page} of ${totalPages}`}
      metaTestId="pagination-realtime-table-meta"
      pageTestId="pagination-realtime-table-page"
      page={<TablePageBody page={page} pageSize={pageSize} totalItems={totalItems} />}
      footer={
        <QaPagination
          {...sharedNavProps()}
          totalPages={totalPages}
          page={page}
          onPageChange={setPage}
          showFirstLast
          aria-label="Table list pagination"
          data-testid="pagination-realtime-table"
        />
      }
    />
  );
}

/** Search / catalog — many pages, windowed ellipsis. */
export function PaginationSearchResultsDemo() {
  const totalPages = 48;
  const [page, setPage] = useState(24);

  return (
    <RealTimeScenarioShell
      caption="Search results (large result set)"
      meta={`Results for “design system” · page ${page} of ${totalPages}`}
      metaTestId="pagination-realtime-search-meta"
      pageTestId="pagination-realtime-search-page"
      page={<SearchResultsPageBody page={page} />}
      footer={
        <QaPagination
          {...sharedNavProps()}
          totalPages={totalPages}
          page={page}
          onPageChange={setPage}
          showFirstLast
          aria-label="Search results pagination"
          data-testid="pagination-realtime-search"
        />
      }
    />
  );
}

/** E‑commerce grid — medium catalog, default window. */
export function PaginationProductCatalogDemo() {
  const totalPages = 16;
  const [page, setPage] = useState(1);

  return (
    <RealTimeScenarioShell
      caption="Product catalog / grid"
      meta={`Page ${page} of ${totalPages} · 6 products on this page`}
      metaTestId="pagination-realtime-catalog-meta"
      pageTestId="pagination-realtime-catalog-page"
      page={<ProductGridPageBody page={page} />}
      footer={
        <QaPagination
          {...sharedNavProps({ attention: 'high' })}
          totalPages={totalPages}
          page={page}
          onPageChange={setPage}
          showFirstLast
          aria-label="Product catalog pagination"
          data-testid="pagination-realtime-catalog"
        />
      }
    />
  );
}

/** Mobile-style — prev/next only, no first/last jump. */
export function PaginationCompactMobileDemo() {
  const totalPages = 12;
  const [page, setPage] = useState(6);

  return (
    <RealTimeScenarioShell
      caption="Compact bar (prev / next only)"
      meta={`Page ${page} of ${totalPages} · first/last hidden`}
      metaTestId="pagination-realtime-compact-meta"
      pageTestId="pagination-realtime-compact-page"
      page={<ArticleListPageBody page={page} />}
      footer={
        <QaPagination
          {...sharedNavProps({ size: 'S' })}
          totalPages={totalPages}
          page={page}
          onPageChange={setPage}
          showFirstLast={false}
          aria-label="Compact pagination"
          data-testid="pagination-realtime-compact"
        />
      }
    />
  );
}

/** Short flows — settings, checkout steps. */
export function PaginationFewPagesDemo() {
  const totalPages = 4;
  const [page, setPage] = useState(2);

  return (
    <RealTimeScenarioShell
      caption="Few pages (settings · checkout)"
      meta={`Step ${page} of ${totalPages}`}
      metaTestId="pagination-realtime-few-meta"
      pageTestId="pagination-realtime-few-page"
      page={<CheckoutStepPageBody page={page} />}
      footer={
        <QaPagination
          {...sharedNavProps()}
          totalPages={totalPages}
          page={page}
          onPageChange={setPage}
          showFirstLast={false}
          aria-label="Few pages pagination"
          data-testid="pagination-realtime-few"
        />
      }
    />
  );
}

type ResultFilter = 'all' | 'active' | 'archived';

const FILTER_TASKS_PER_PAGE = 5;

function filterTotalPages(filter: ResultFilter): number {
  return Math.max(1, Math.ceil(FILTER_TASK_TOTALS[filter] / FILTER_TASKS_PER_PAGE));
}

/** Filter change resets to page 1 — typical list UX. */
export function PaginationFilterResetDemo() {
  const [filter, setFilter] = useState<ResultFilter>('all');
  const [page, setPage] = useState(1);
  const totalPages = filterTotalPages(filter);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <RealTimeScenarioShell
      caption="Filter changes reset page"
      meta={`Filter: ${filter} · page ${page} of ${totalPages}`}
      metaTestId="pagination-realtime-filter-meta"
      pageTestId="pagination-realtime-filter-page"
      page={
        <>
          <div style={filterRowStyle}>
            {(['all', 'active', 'archived'] as const).map((key) => (
              <Button
                key={key}
                type="button"
                variant={filter === key ? 'subtle' : 'ghost'}
                size="s"
                onClick={() => setFilter(key)}
                data-testid={`pagination-realtime-filter-${key}`}
              >
                {key}
              </Button>
            ))}
          </div>
          <TaskListPageBody filter={filter} page={page} />
        </>
      }
      footer={
        <QaPagination
          {...sharedNavProps()}
          totalPages={totalPages}
          page={page}
          onPageChange={setPage}
          showFirstLast
          aria-label="Filtered list pagination"
          data-testid="pagination-realtime-filter"
        />
      }
    />
  );
}

/** Simulates API returning a new total page count. */
export function PaginationDynamicTotalDemo() {
  const presets = [
    { label: '10 pages', total: 10 },
    { label: '50 pages', total: 50 },
    { label: '120 pages', total: 120 },
  ] as const;
  const [totalPages, setTotalPages] = useState(10);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <RealTimeScenarioShell
      caption="Dynamic total pages (API / fetch)"
      meta={`Loaded ${totalPages} pages · current page ${page}`}
      metaTestId="pagination-realtime-dynamic-meta"
      pageTestId="pagination-realtime-dynamic-page"
      page={
        <>
          <div style={filterRowStyle}>
            {presets.map(({ label, total }) => (
              <Button
                key={label}
                type="button"
                variant={totalPages === total ? 'subtle' : 'ghost'}
                size="s"
                onClick={() => {
                  setTotalPages(total);
                  setPage(1);
                }}
                data-testid={`pagination-realtime-dynamic-${total}`}
              >
                {label}
              </Button>
            ))}
          </div>
          <FeedPageBody page={page} totalPages={totalPages} />
        </>
      }
      footer={
        <QaPagination
          {...sharedNavProps()}
          totalPages={totalPages}
          page={page}
          onPageChange={setPage}
          showFirstLast
          aria-label="Dynamic total pagination"
          data-testid="pagination-realtime-dynamic"
        />
      }
    />
  );
}

export function PaginationRealTimeScenarios() {
  return (
    <>
      <PaginationTableListDemo />
      <PaginationSearchResultsDemo />
      <PaginationProductCatalogDemo />
      <PaginationCompactMobileDemo />
      <PaginationFewPagesDemo />
      <PaginationFilterResetDemo />
      <PaginationDynamicTotalDemo />
    </>
  );
}
