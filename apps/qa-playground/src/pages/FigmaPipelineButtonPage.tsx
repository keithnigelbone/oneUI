'use client';

import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ButtonQaShowcase } from '@/components/button/ButtonQaShowcase';
import styles from '@/styles/qa.module.css';

const FIGMA_URL =
  'https://www.figma.com/design/mH1yPtRJzZSNCS0kX737t6/%E2%9D%96--Backup-2026-05-04--OneUI-Components?node-id=2459-24854&m=dev';

const intro: CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Body-S-FontSize)',
  lineHeight: 'var(--Body-S-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Low)',
  color: 'var(--Text-Medium)',
  maxWidth: 'var(--Grid-MaxWidth)',
};

const pageTitle: CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Headline-L-FontSize)',
  lineHeight: 'var(--Headline-L-LineHeight)',
  fontWeight: 'var(--Headline-L-FontWeight)',
  color: 'var(--Text-High)',
  margin: 0,
};

/**
 * Mirrors the Figma **Button** documentation frame (`2459:24854`) using the same QA canvas as
 * `/c/button` — sizes, attention, slots, full width, appearances — not a reduced 3×3 grid.
 */
export function FigmaPipelineButtonPage() {
  return (
    <div className={`${styles.wrap} ${styles.wrapFullBleed}`}>
      <nav className={styles.catalogNav} aria-label="Breadcrumb">
        <Link to="/" className={styles.catalogBackLink}>
          ← Catalog
        </Link>
      </nav>

      <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
        <h1 style={pageTitle}>Figma pipeline — Button (node 2459:24854)</h1>
        <p style={intro}>
          Live matrix matches the component QA canvas (same sections as the Figma Button library view).
          Source:{' '}
          <a href={FIGMA_URL} style={{ color: 'var(--Primary-TintedA11y)' }}>
            Open in Figma
          </a>
          . Each band is a <code>role=&quot;region&quot;</code> for screenshots; Playwright targets stable
          anchors like <code>#button-qa-button-attention</code> for computed-style checks.
        </p>
      </header>

      <ButtonQaShowcase />
    </div>
  );
}
