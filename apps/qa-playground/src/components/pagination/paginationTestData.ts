/** Deterministic QA fixtures for Pagination real-time scenario pages. */

export type TableRow = {
  id: string;
  name: string;
  status: 'Active' | 'Pending' | 'Shipped';
  updated: string;
};

export type SearchResultRow = {
  id: string;
  title: string;
  snippet: string;
  category: string;
};

export type ProductCard = {
  id: string;
  title: string;
  price: string;
  tag: string;
};

export type ArticleRow = {
  id: string;
  headline: string;
  readTime: string;
};

export type TaskRow = {
  id: string;
  title: string;
  owner: string;
  state: 'active' | 'archived';
};

export type FeedRow = {
  id: string;
  label: string;
  detail: string;
};

const TABLE_STATUSES: TableRow['status'][] = ['Active', 'Pending', 'Shipped'];

export function getTableRowsForPage(page: number, pageSize: number, totalItems: number): TableRow[] {
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const rows: TableRow[] = [];
  for (let i = startIndex; i < endIndex; i += 1) {
    const day = String((i % 28) + 1).padStart(2, '0');
    rows.push({
      id: `table-row-${i + 1}`,
      name: `Order #${10420 + i}`,
      status: TABLE_STATUSES[i % TABLE_STATUSES.length]!,
      updated: `2026-05-${day}`,
    });
  }
  return rows;
}

const SEARCH_TITLES = [
  'Pagination patterns in design systems',
  'Accessible page navigation with ARIA',
  'Windowed page lists and ellipses',
  'Controlled vs uncontrolled page state',
  'Mobile compact pagination bars',
] as const;

export function getSearchResultsForPage(page: number, perPage = 5): SearchResultRow[] {
  return Array.from({ length: perPage }, (_, offset) => {
    const index = (page - 1) * perPage + offset;
    const title = SEARCH_TITLES[index % SEARCH_TITLES.length]!;
    return {
      id: `search-result-${index + 1}`,
      title: `${title} (${index + 1})`,
      snippet: 'OneUI Pagination — prev/next, first/last, and numbered pages with ellipsis gaps.',
      category: index % 2 === 0 ? 'Docs' : 'Components',
    };
  });
}

const PRODUCT_NAMES = [
  'Fiber broadband plan',
  'Smart set-top box',
  'Cloud storage 500 GB',
  'Mobile unlimited 5G',
  'Home security camera',
  'Music streaming annual',
] as const;

export function getProductCardsForPage(page: number, perPage = 6): ProductCard[] {
  return Array.from({ length: perPage }, (_, offset) => {
    const index = (page - 1) * perPage + offset;
    const name = PRODUCT_NAMES[index % PRODUCT_NAMES.length]!;
    return {
      id: `product-${index + 1}`,
      title: name,
      price: `₹${(499 + (index % 7) * 150).toLocaleString('en-IN')}`,
      tag: index % 3 === 0 ? 'Bestseller' : 'New',
    };
  });
}

export function getArticlesForPage(page: number, perPage = 3): ArticleRow[] {
  return Array.from({ length: perPage }, (_, offset) => {
    const index = (page - 1) * perPage + offset;
    return {
      id: `article-${index + 1}`,
      headline: `News digest · story ${index + 1}`,
      readTime: `${3 + (index % 4)} min read`,
    };
  });
}

export const CHECKOUT_STEPS = [
  { id: 'checkout-shipping', title: 'Shipping', body: 'Enter delivery address and preferred slot.' },
  { id: 'checkout-payment', title: 'Payment', body: 'Choose UPI, card, or wallet. Amount updates on next step.' },
  { id: 'checkout-review', title: 'Review', body: 'Confirm items, taxes, and discounts before placing the order.' },
  { id: 'checkout-confirm', title: 'Confirm', body: 'Order placed — share receipt and track shipment status.' },
] as const;

/** Item counts aligned with real-time filter demo page totals (5 per page). */
export const FILTER_TASK_TOTALS: Record<'all' | 'active' | 'archived', number> = {
  all: 150,
  active: 60,
  archived: 40,
};

const TASK_TITLE_PREFIX: Record<'all' | 'active' | 'archived', string> = {
  all: 'Backlog item',
  active: 'In progress',
  archived: 'Archived task',
};

export function getTasksForFilterPage(
  filter: 'all' | 'active' | 'archived',
  page: number,
  perPage = 5,
): TaskRow[] {
  const total = FILTER_TASK_TOTALS[filter];
  const startIndex = (page - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, total);
  const rows: TaskRow[] = [];
  for (let i = startIndex; i < endIndex; i += 1) {
    rows.push({
      id: `${filter}-task-${i + 1}`,
      title: `${TASK_TITLE_PREFIX[filter]} #${i + 1}`,
      owner: ['Priya', 'Alex', 'Sam', 'Jordan'][i % 4]!,
      state: filter === 'archived' ? 'archived' : 'active',
    });
  }
  return rows;
}

export function getFeedRowsForPage(page: number, totalPages: number, perPage = 4): FeedRow[] {
  return Array.from({ length: perPage }, (_, offset) => {
    const index = (page - 1) * perPage + offset;
    return {
      id: `feed-${index + 1}`,
      label: `Activity batch ${index + 1}`,
      detail: `Page ${page} of ${totalPages} · synthetic API page payload`,
    };
  });
}
