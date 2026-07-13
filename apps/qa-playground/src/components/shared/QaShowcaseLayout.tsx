'use client';

import type { ReactNode } from 'react';
import { useId } from 'react';
import styles from '../../styles/qa.module.css';

/** Wraps dense scenario blocks; use `scrollable` for very tall matrices (Button). */
export function QaApiSectionBody({
  children,
  scrollable,
  scrollableRegionLabel,
}: {
  children: ReactNode;
  scrollable?: boolean;
  /** When `scrollable`, used with `tabIndex={0}` for keyboard scroll + axe `scrollable-region-focusable`. */
  scrollableRegionLabel?: string;
}) {
  return (
    <div
      className={[styles.apiSectionBody, scrollable ? styles.apiSectionBodyScrollable : '']
        .filter(Boolean)
        .join(' ')}
      {...(scrollable
        ? {
            tabIndex: 0,
            role: 'region' as const,
            'aria-label': scrollableRegionLabel ?? 'Scrollable scenarios',
          }
        : {})}
    >
      {children}
    </div>
  );
}

/** Outer shell for every component QA page — same root `<div>` as `button/ButtonQaShowcase.tsx`. */
export function QaShowcaseRoot({
  children,
  layout = 'default',
}: {
  children: ReactNode;
  /** `centered` — horizontal centering for sandbox strips (Button matrix). */
  layout?: 'default' | 'centered';
}) {
  return (
    <div
      className={
        layout === 'centered'
          ? `${styles.buttonShowcase} ${styles.buttonShowcaseCentered}`
          : styles.buttonShowcase
      }
    >
      {children}
    </div>
  );
}

/**
 * One titled band (`storyVariantSection` + title + sandbox). Same DOM as each `<section>`
 * in {@link ../button/ButtonQaShowcase}.
 *
 * Pick **one** layout: `centerContent` | `flexRow` | optional `overflow` for standard sandbox.
 */
export function QaStoryBand({
  id,
  title,
  lead,
  children,
  centerContent,
  flexRow,
  overflow,
}: {
  /** Optional anchor for e2e / axe scoping */
  id?: string;
  title: string;
  children: ReactNode;
  /** Intro copy above the grey sandbox (keeps matrices from stretching around text-only rows). */
  lead?: ReactNode;
  /** Default strip — centered preview */
  centerContent?: boolean;
  /** Scenario chip row (`storySandboxFlex`) */
  flexRow?: boolean;
  /** Adds `storySandboxOverflow` on standard sandbox */
  overflow?: boolean;
}) {
  const reactId = useId();
  const headingId = id ? `${id}__title` : `qa-story-title-${reactId.replace(/:/g, '')}`;
  let body: ReactNode;
  if (flexRow) {
    body = (
      <div className={styles.storySandbox}>
        <div className={styles.storySandboxFlex}>{children}</div>
      </div>
    );
  } else if (centerContent) {
    body = (
      <div className={`${styles.storySandbox} ${styles.storySandboxCompact}`}>
        <div className={styles.storySandboxCenter}>{children}</div>
      </div>
    );
  } else {
    body = (
      <div
        className={
          overflow ? `${styles.storySandbox} ${styles.storySandboxOverflow}` : styles.storySandbox
        }
      >
        {children}
      </div>
    );
  }

  return (
    <section
      id={id}
      {...(id ? { 'data-section': id } : {})}
      role="region"
      aria-labelledby={headingId}
      className={styles.storyVariantSection}
    >
      <h3 id={headingId} className={styles.storyVariantTitle}>
        {title}
      </h3>
      {lead ? <p className={styles.storySectionLead}>{lead}</p> : null}
      {body}
    </section>
  );
}
