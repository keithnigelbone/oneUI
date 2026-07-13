'use client';

import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ButtonQaShowcase } from '@/components/button/ButtonQaShowcase';
import styles from '@/styles/qa.module.css';

const FIGMA_URL =
  'https://www.figma.com/design/mH1yPtRJzZSNCS0kX737t6/%E2%9D%96--Backup-2026-05-04--OneUI-Components?node-id=2459-24856&m=dev';

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
 * Figma `2459:24856` is the **Container** around the large Button variant grid (`Grid` +
 * `ComponentBGCell`). The exported MCP tree is mostly empty cells; the **authoritative variant
 * matrix** for this file is the same Button library as the parent frame — rendered here via
 * {@link ButtonQaShowcase} (full width canvas).
 */
export function FigmaPipelineContainer245924856Page() {
  return (
    <div className={`${styles.wrap} ${styles.wrapFullBleed}`}>
      <nav className={styles.catalogNav} aria-label="Breadcrumb">
        <Link to="/" className={styles.catalogBackLink}>
          ← Catalog
        </Link>
      </nav>

      <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
        <h1 style={pageTitle}>Figma pipeline — Container / Button matrix (node 2459:24856)</h1>
        <p style={intro}>
          This node wraps the Button spec <strong>Grid</strong> in Figma. The page below is the same
          <strong> Button QA canvas</strong> used for design parity (sizes, attention, icons, full width,
          multi-accent). Source:{' '}
          <a href={FIGMA_URL} style={{ color: 'var(--Primary-TintedA11y)' }}>
            Open in Figma
          </a>
          .
        </p>
      </header>

      <ButtonQaShowcase />
    </div>
  );
}
