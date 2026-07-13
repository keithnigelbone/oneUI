'use client';

import { Logo } from '@oneui/ui/components/Logo';
import { Avatar } from '@oneui/ui/components/Avatar';
import { Icon } from '@oneui/ui/components/Icon';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Surface } from '@oneui/ui/components/Surface';
import { WebHeader } from '@oneui/ui/components/WebHeader';
import { useBrandLogo } from '@oneui/ui/contexts/BrandLogoContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BrandControls } from './BrandControls';
import styles from './DocsShell.module.css';

export interface DocsTree {
  name: string;
  children?: DocsTreeNode[];
}

export type DocsTreeNode = DocsPageNode | DocsFolderNode | DocsSeparatorNode;

export interface DocsTocItem {
  title: string;
  url: string;
  depth?: number;
}

export interface DocsPageNode {
  type?: 'page';
  name: string;
  url: string;
  external?: boolean;
}

export interface DocsFolderNode {
  type?: 'folder';
  name: string;
  children?: DocsTreeNode[];
  index?: DocsPageNode;
}

export interface DocsSeparatorNode {
  type: 'separator';
  name: string;
}

interface DocsSearchItem {
  title: string;
  url: string;
  group: string;
}

export function DocsShell({ children, tree }: { children: ReactNode; tree: DocsTree }) {
  const { brandName, logoSvg } = useBrandLogo();
  const pathname = usePathname() ?? '/docs';
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const activeSection = getActiveSection(pathname);
  const searchItems = useMemo(() => collectSearchItems(tree.children ?? []), [tree]);
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return searchItems
      .filter((item) => {
        const haystack = `${item.title} ${item.group} ${item.url}`.toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 8);
  }, [searchItems, searchQuery]);

  useEffect(() => {
    setSearchQuery('');
    setSettingsOpen(false);
  }, [pathname]);

  const handleSearchSubmit = useCallback(
    (value: string) => {
      const query = value.trim().toLowerCase();
      if (!query) return;

      const firstMatch = searchItems.find((item) => {
        const haystack = `${item.title} ${item.group} ${item.url}`.toLowerCase();
        return haystack.includes(query);
      });

      if (firstMatch) {
        router.push(firstMatch.url);
      }
    },
    [router, searchItems],
  );
  const handleNavClick = useCallback(
    (url: string) => (event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
      if (pathname !== url) {
        router.push(url);
      }
    },
    [pathname, router],
  );
  const toggleSettings = useCallback(() => {
    setSettingsOpen((open) => !open);
  }, []);

  return (
    <div className={styles.shell}>
      <div className={styles.headerFrame}>
        <WebHeader variant="default" aria-label="OneUI documentation header">
          <WebHeader.PrimaryNav
            activeValue={activeSection}
            end={<DocsHeaderActions onToggle={toggleSettings} />}
            avatar={
              <Avatar
                alt="Nuno Azevedo"
                appearance="neutral"
                attention="low"
                fallback="NA"
                size="s"
              />
            }
            logo={
              <Link className={styles.brandLockup} href="/docs" aria-label="OneUI design system docs home">
                <Logo
                  alt={brandName ?? 'OneUI'}
                  fallback={<span className={styles.logoFallback}>O</span>}
                  size="xl"
                  svgContent={logoSvg}
                  variant="mark"
                />
              </Link>
            }
            searchAriaLabel="Search documentation"
            searchInput="middle"
            searchPlaceholder="Search docs"
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={handleSearchSubmit}
          >
            <WebHeader.Item
              value="overview"
              href="/docs"
              active={activeSection === 'overview'}
              attention="medium"
              onClick={handleNavClick('/docs')}
            >
              Overview
            </WebHeader.Item>
            <WebHeader.Item
              value="getting-started"
              href="/docs/getting-started/installation"
              active={activeSection === 'getting-started'}
              attention="medium"
              onClick={handleNavClick('/docs/getting-started/installation')}
            >
              Getting Started
            </WebHeader.Item>
            <WebHeader.Item
              value="guides"
              href="/docs/guides/surface-context"
              active={activeSection === 'guides'}
              attention="medium"
              onClick={handleNavClick('/docs/guides/surface-context')}
            >
              Guides
            </WebHeader.Item>
            <WebHeader.Item
              value="components"
              href="/docs/components"
              active={activeSection === 'components'}
              attention="medium"
              onClick={handleNavClick('/docs/components')}
            >
              Components
            </WebHeader.Item>
            <WebHeader.Item
              value="releases"
              href="/docs/releases/jio-web-alpha"
              active={activeSection === 'releases'}
              attention="medium"
              onClick={handleNavClick('/docs/releases/jio-web-alpha')}
            >
              Releases
            </WebHeader.Item>
          </WebHeader.PrimaryNav>
        </WebHeader>
        {settingsOpen ? (
          <Surface mode="elevated" className={styles.settingsPanel} role="dialog" aria-label="Documentation preview settings">
            <p className={styles.settingsTitle}>Preview settings</p>
            <BrandControls variant="menu" />
          </Surface>
        ) : null}
        {searchQuery.trim() ? (
          <div className={styles.searchPanel}>
            {searchResults.length > 0 ? (
              <ul className={styles.searchList} aria-label="Search results">
                {searchResults.map((result) => (
                  <li key={result.url}>
                    <Link className={styles.searchResult} href={result.url}>
                      <span className={styles.searchResultTitle}>{result.title}</span>
                      <span className={styles.searchResultGroup}>{result.group}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.searchEmpty}>No docs found.</p>
            )}
          </div>
        ) : null}
      </div>
      <div className={styles.body}>
        <aside className={styles.sidebar} aria-label="Documentation navigation">
          <nav className={styles.nav}>{renderNavigation(tree.children ?? [])}</nav>
        </aside>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}

function DocsHeaderActions({ onToggle }: { onToggle: () => void }) {
  return (
    <div className={styles.headerActions}>
      <IconButton
        appearance="neutral"
        aria-label="Open documentation settings"
        icon={<Icon icon="settings" />}
        size="s"
        variant="subtle"
        onPress={onToggle}
      />
    </div>
  );
}

export function DocsArticle({
  children,
  description,
  title,
  toc,
}: {
  children: ReactNode;
  description?: string;
  title: string;
  toc?: DocsTocItem[];
}) {
  return (
    <>
      <article className={styles.article}>
        <header className={styles.articleHeader}>
          <h1 className={styles.articleTitle}>{title}</h1>
          {description ? <p className={styles.articleDescription}>{description}</p> : null}
        </header>
        <div className={styles.content}>{children}</div>
      </article>
      {toc && toc.length > 0 ? (
        <aside className={styles.toc} aria-label="On this page">
          <p className={styles.tocTitle}>On this page</p>
          <nav className={styles.tocNav}>
            {toc.map((item) => (
              <a
                className={`${styles.tocLink} ${item.depth === 3 ? styles.tocLinkNested : ''}`}
                href={item.url}
                key={item.url}
              >
                {item.title}
              </a>
            ))}
          </nav>
        </aside>
      ) : null}
    </>
  );
}

function renderNavigation(nodes: DocsTreeNode[]) {
  return nodes.map((node) => <NavigationNode key={getNodeKey(node)} node={node} />);
}

function NavigationNode({ node }: { node: DocsTreeNode }) {
  const pathname = usePathname() ?? '/docs';

  if (node.type === 'separator') {
    return <p className={styles.navGroupLabel}>{node.name}</p>;
  }

  if ('url' in node) {
    const active = pathname === node.url || pathname.startsWith(`${node.url}/`);
    return (
      <Link
        className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
        href={node.url}
        target={node.external ? '_blank' : undefined}
        rel={node.external ? 'noreferrer noopener' : undefined}
      >
        {node.name}
      </Link>
    );
  }

  return (
    <div className={styles.navGroup}>
      <p className={styles.navGroupLabel}>{node.name}</p>
      {node.index ? <NavigationNode node={node.index} /> : null}
      {renderNavigation(node.children ?? [])}
    </div>
  );
}

function getNodeKey(node: DocsTreeNode) {
  if ('url' in node) return node.url;
  return `${node.type ?? 'folder'}-${node.name}`;
}

function getActiveSection(pathname: string) {
  if (pathname.startsWith('/docs/getting-started')) return 'getting-started';
  if (pathname.startsWith('/docs/guides')) return 'guides';
  if (pathname.startsWith('/docs/components')) return 'components';
  if (pathname.startsWith('/docs/releases')) return 'releases';
  return 'overview';
}

function collectSearchItems(nodes: DocsTreeNode[], group = 'Docs'): DocsSearchItem[] {
  return nodes.flatMap((node): DocsSearchItem[] => {
    if (node.type === 'separator') return [];

    if ('url' in node) {
      return [{ title: node.name, url: node.url, group }];
    }

    const nextGroup = node.name || group;
    return [
      ...(node.index ? [{ title: node.index.name, url: node.index.url, group: nextGroup }] : []),
      ...collectSearchItems(node.children ?? [], nextGroup),
    ];
  });
}
