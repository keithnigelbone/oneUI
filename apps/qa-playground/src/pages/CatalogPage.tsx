import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ComponentCategory } from '@oneui/shared';
import { Button } from '@oneui/ui/components/Button';
import { Chip } from '@oneui/ui/components/Chip';
import { ChipGroup } from '@oneui/ui/components/ChipGroup';
import { CounterBadge } from '@oneui/ui/components/CounterBadge';
import { Icon } from '@oneui/ui/components/Icon';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Input } from '@oneui/ui/components/Input';
import { CatalogCardStabilityBadge } from '@/components/catalog/CatalogCardStabilityBadge';
import { CatalogCardThumb } from '@/components/catalog/CatalogCardThumb';
import { QA_CATALOG_ENTRIES } from '@/catalog/registry';
import { storybookPlaygroundPath } from '@/storybook/qaStorybookNav';
import { CATEGORY_FILTER_LABEL } from '@/lib/qa/types';
import {
  CATEGORY_SECTION_BLURB,
  CATEGORY_SECTION_ORDER,
  groupQACatalogByCategory,
} from '@/lib/qa/categoryCatalog';
import { CATALOG_CATEGORY_ACCENT } from '@/lib/qa/catalogCategoryMeta';
import { filterQACatalogList } from '@/lib/qa/catalog';
import {
  countCatalogByTestStability,
  type ComponentTestStabilityFilter,
  resolveCatalogEntryStability,
} from '@/lib/qa/componentTestStability';
import { useCatalogTestStability } from '@/lib/qa/useCatalogTestStability';
import styles from '@/styles/catalog.module.css';

type CategoryFilter = ComponentCategory | 'all';

export function CatalogPage() {
  const navigate = useNavigate();
  const entries = QA_CATALOG_ENTRIES;
  const searchRef = useRef<HTMLInputElement>(null);
  const { stabilityBySlug } = useCatalogTestStability();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [testStability, setTestStability] = useState<ComponentTestStabilityFilter>('all');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filtered = useMemo(
    () => filterQACatalogList(entries, query, category, testStability, stabilityBySlug),
    [entries, query, category, testStability, stabilityBySlug],
  );

  const groupedSections = useMemo(() => groupQACatalogByCategory(filtered), [filtered]);

  const categoriesPresent = useMemo(() => {
    const set = new Set<ComponentCategory>();
    for (const row of entries) {
      set.add(row.category);
    }
    return CATEGORY_SECTION_ORDER.filter((c) => set.has(c));
  }, [entries]);

  const countByCategory = useMemo(() => {
    const m = new Map<ComponentCategory, number>();
    for (const e of entries) {
      m.set(e.category, (m.get(e.category) ?? 0) + 1);
    }
    return m;
  }, [entries]);

  const allSlugs = useMemo(() => entries.map((e) => e.slug), [entries]);

  const testStabilityCounts = useMemo(
    () => countCatalogByTestStability(allSlugs, stabilityBySlug),
    [allSlugs, stabilityBySlug],
  );

  const categoryChipValue = useMemo(() => [category], [category]);
  const testStabilityChipValue = useMemo(() => [testStability], [testStability]);

  const hasActiveFilters =
    query.trim().length > 0 || category !== 'all' || testStability !== 'all';

  useEffect(() => {
    if (category === 'all') return;
    document.getElementById(`catalog-section-${category}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [category]);

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroBar}>
          <p className={styles.eyebrow}>QA Playground</p>
          <div className={styles.heroActions}>
            <Button variant="bold" size={8} appearance="primary" onClick={() => navigate('/demo/jio')}>
              Sample App Demo
            </Button>
            <Button
              variant="subtle"
              size={8}
              appearance="primary"
              onClick={() => navigate('/tools/performance')}
            >
              Performance Metrics
            </Button>
            <Button
              variant="subtle"
              size={8}
              appearance="primary"
              onClick={() => navigate(storybookPlaygroundPath())}
            >
              QA Playground Storybook
            </Button>
            <a
              href="/qa-reports/dashboard/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.externalLink}
            >
              Playwright Bug dashboard
              <Icon icon="externalLink" size="3.5" emphasis="low" aria-hidden />
            </a>
            <Button
              variant="subtle"
              size={8}
              appearance="neutral"
              className={styles.notionDashboardBtn}
              onClick={() => navigate('/qa/dashboard')}
              start={
                <img
                  src="/assets/notion-logo.png"
                  alt=""
                  aria-hidden
                  className={styles.notionLogo}
                />
              }
            >
              QA-Dashboard (Notion)
            </Button>
          </div>
        </div>

        <div className={styles.heroMain}>
          <h1 className={styles.title}>OneUI Components</h1>
          <p className={styles.lead}>
            Explore every registry component with live previews, scenario matrices, and linked test
            reports.
          </p>
        </div>

        <div className={styles.statRow} aria-label="Catalog summary">
          <div className={styles.stat}>
            <span className={styles.statValue}>{entries.length}</span>
            <span className={styles.statLabel}>Components</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{categoriesPresent.length}</span>
            <span className={styles.statLabel}>Categories</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{testStabilityCounts.stable}</span>
            <span className={styles.statLabel}>Stable</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{testStabilityCounts.unstable}</span>
            <span className={styles.statLabel}>Unstable</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{testStabilityCounts.underDevelopment}</span>
            <span className={styles.statLabel}>Under development</span>
          </div>
        </div>

        <div className={styles.searchPanel}>
          <Input
            ref={searchRef}
            shape="pill"
            size={12}
            attention="medium"
            appearance="secondary"
            placeholder="Search components by name or slug…"
            value={query}
            onChange={setQuery}
            aria-label="Search components"
            start={<Icon icon="search" size="4" emphasis="low" aria-hidden />}
            end={
              query ? (
                <IconButton
                  attention="low"
                  size={10}
                  appearance="secondary"
                  icon="close"
                  aria-label="Clear search"
                  onClick={() => setQuery('')}
                />
              ) : undefined
            }
          />
          <kbd className={styles.searchShortcut} aria-hidden>
            ⌘K
          </kbd>
        </div>
      </header>

      <div className={styles.filterPanel} aria-label="Catalog filters">
        <div className={styles.filterRow}>
          <span className={styles.filterLabel} id="catalog-category-label">
            Category
          </span>
          <ChipGroup
            value={categoryChipValue}
            onValueChange={(next) => setCategory((next[0] ?? 'all') as CategoryFilter)}
            aria-labelledby="catalog-category-label"
            className={styles.filterChips}
          >
            <Chip
              value="all"
              attention="medium"
              size="m"
              end={
                <CounterBadge
                  value={testStabilityCounts.total}
                  size="s"
                  showZero
                  aria-label={`${testStabilityCounts.total} components`}
                />
              }
            >
              All
            </Chip>
            {categoriesPresent.map((c) => (
              <Chip
                key={c}
                value={c}
                attention="medium"
                size="m"
                end={
                  <CounterBadge
                    value={countByCategory.get(c) ?? 0}
                    size="s"
                    appearance="primary"
                    showZero
                    aria-label={`${countByCategory.get(c) ?? 0} ${CATEGORY_FILTER_LABEL[c]} components`}
                  />
                }
              >
                {CATEGORY_FILTER_LABEL[c]}
              </Chip>
            ))}
          </ChipGroup>
        </div>

        <div className={styles.filterRow}>
          <span className={styles.filterLabel} id="catalog-status-label">
            Component Status
          </span>
          <ChipGroup
            value={testStabilityChipValue}
            onValueChange={(next) =>
              setTestStability((next[0] ?? 'all') as ComponentTestStabilityFilter)
            }
            aria-labelledby="catalog-status-label"
            className={styles.filterChips}
          >
            <Chip value="all" attention="medium" size="m" appearance="auto">
              All
            </Chip>
            <Chip
              value="stable"
              attention="medium"
              size="m"
              appearance="auto"
              end={
                <CounterBadge
                  value={testStabilityCounts.stable}
                  size="s"
                  appearance="positive"
                  showZero
                  aria-label={`${testStabilityCounts.stable} stable`}
                />
              }
            >
              Stable
            </Chip>
            <Chip
              value="unstable"
              attention="medium"
              size="m"
              appearance="auto"
              end={
                <CounterBadge
                  value={testStabilityCounts.unstable}
                  size="s"
                  appearance="negative"
                  showZero
                  aria-label={`${testStabilityCounts.unstable} unstable`}
                />
              }
            >
              Unstable
            </Chip>
            <Chip
              value="under-development"
              attention="medium"
              size="m"
              appearance="auto"
              end={
                <CounterBadge
                  value={testStabilityCounts.underDevelopment}
                  size="s"
                  appearance="warning"
                  showZero
                  aria-label={`${testStabilityCounts.underDevelopment} under development`}
                />
              }
            >
              Under development
            </Chip>
          </ChipGroup>
        </div>
      </div>

      <div className={styles.main}>
        {hasActiveFilters ? (
          <p className={styles.resultsBanner} aria-live="polite">
            Showing <strong>{filtered.length}</strong> of {entries.length} components
            {query.trim() ? (
              <>
                {' '}
                matching &ldquo;{query.trim()}&rdquo;
              </>
            ) : null}
          </p>
        ) : null}

        {groupedSections.map(({ category: cat, items }) => (
          <section
            key={cat}
            id={`catalog-section-${cat}`}
            className={styles.section}
            data-category={cat}
          >
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <span
                  className={styles.sectionAccent}
                  style={{ background: CATALOG_CATEGORY_ACCENT[cat] }}
                  aria-hidden
                />
                <div className={styles.sectionTitleBlock}>
                  <h2 className={styles.sectionTitle}>{CATEGORY_FILTER_LABEL[cat]}</h2>
                  <p className={styles.sectionBlurb}>{CATEGORY_SECTION_BLURB[cat]}</p>
                </div>
              </div>
              <span className={styles.sectionCount}>
                {items.length} {items.length === 1 ? 'component' : 'components'}
              </span>
            </div>

            <div className={styles.cardGrid}>
              {items.map((row) => {
                const stability = resolveCatalogEntryStability(row.slug, stabilityBySlug);
                return (
                  <Link key={row.slug} to={`/c/${row.slug}`} className={styles.card}>
                    <CatalogCardStabilityBadge stability={stability} />
                    <div className={styles.cardPreview}>
                      <CatalogCardThumb meta={row.meta} />
                    </div>
                    <div className={styles.cardFooter}>
                      <div className={styles.cardMeta}>
                        <p className={styles.cardName}>{row.displayName}</p>
                        <p className={styles.cardSlug}>{row.slug}</p>
                      </div>
                      <span className={styles.cardArrow} aria-hidden>
                        <Icon icon="chevronRight" size="4" emphasis="low" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        {filtered.length === 0 ? (
          <div className={styles.empty} role="status">
            <p className={styles.emptyTitle}>No components found</p>
            <p className={styles.emptyHint}>
              Adjust your search or filters, or reset to browse the full library.
            </p>
            <Button
              variant="subtle"
              size={10}
              appearance="primary"
              onClick={() => {
                setQuery('');
                setCategory('all');
                setTestStability('all');
              }}
            >
              Reset filters
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
