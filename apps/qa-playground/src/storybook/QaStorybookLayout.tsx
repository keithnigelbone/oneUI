'use client';

import { useMemo, useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Input } from '@oneui/ui/components/Input';
import { Icon } from '@oneui/ui/components/Icon';
import { QaStorybookThemeToggle } from './QaStorybookThemeToggle';
import { filterStorybookNav } from './qaStorybookNav';
import styles from './qa-storybook.module.css';

const UI_VERSION = 'v0.1.0-alpha.10';

function navLinkClass(isActive: boolean) {
  return [styles.navLink, isActive ? styles.navLinkActive : ''].filter(Boolean).join(' ');
}

export function QaStorybookLayout() {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const navGroups = useMemo(() => filterStorybookNav(query), [query]);

  return (
    <div className={styles.shell} data-testid="qa-storybook-shell">
      <header className={styles.topBar}>
        <div className={styles.brandLockup}>
          <p className={styles.brandMark}>OneUI</p>
          <span className={styles.brandDivider} aria-hidden />
          <p className={styles.brandSubtitle}>QA Playground</p>
        </div>

        <div className={styles.searchWrap}>
          <Input
            shape="pill"
            size={10}
            attention="medium"
            appearance="neutral"
            placeholder="Search components…"
            aria-label="Search components"
            value={query}
            onChange={setQuery}
            start={<Icon icon="search" size="4" emphasis="low" aria-hidden />}
          />
        </div>

        <div className={styles.topBarEnd}>
          <QaStorybookThemeToggle />
          <span className={styles.frameworkBadge}>React</span>
          <span className={styles.versionBadge}>{UI_VERSION}</span>
        </div>
      </header>

      <div className={styles.body}>
        <nav className={styles.sidebar} aria-label="Storybook navigation">
          {navGroups.map((group) => (
            <div key={group.id} className={styles.navGroup}>
              <p className={styles.navGroupLabel}>{group.label}</p>
              {group.items.map((item) => {
                const to =
                  group.id === 'overview'
                    ? item.slug
                      ? `/storybook/${item.slug}`
                      : '/storybook/dashboard'
                    : `/storybook/${item.slug}`;

                const isActive =
                  group.id === 'overview' && item.slug === ''
                    ? location.pathname === '/storybook/dashboard'
                    : location.pathname === to;

                return (
                  <NavLink
                    key={`${group.id}-${item.slug || 'dashboard'}`}
                    to={to}
                    className={navLinkClass(isActive)}
                    end={group.id === 'overview' && item.slug === ''}
                  >
                    <span className={styles.navLinkInner}>
                      <Icon
                        icon={item.icon}
                        size="4"
                        emphasis={isActive ? 'high' : 'medium'}
                        aria-hidden
                        className={styles.navLinkIcon}
                      />
                      <span className={styles.navLinkLabel}>{item.label}</span>
                    </span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
