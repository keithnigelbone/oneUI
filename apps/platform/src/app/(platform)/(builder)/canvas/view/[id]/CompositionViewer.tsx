/**
 * CompositionViewer.tsx
 *
 * Read-only viewer for saved compositions.
 * Shows code output + composition metadata.
 */

'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import styles from './viewer.module.css';

interface CompositionViewerProps {
  compositionId: string;
}

export default function CompositionViewer({ compositionId }: CompositionViewerProps) {
  const composition = useQuery(
    api.compositions.get,
    { id: compositionId as Id<'compositions'> },
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!composition?.generatedCode) return;
    try {
      await navigator.clipboard.writeText(composition.generatedCode);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = composition.generatedCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [composition?.generatedCode]);

  if (composition === undefined) {
    return <div className={styles.loading}>Loading composition...</div>;
  }

  if (composition === null) {
    return <div className={styles.error}>Composition not found</div>;
  }

  return (
    <div className={styles.page} data-full-bleed>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{composition.name}</h1>
          <span className={styles.meta}>
            {composition.status} · {new Date(composition.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className={styles.headerActions}>
          {composition.generatedCode && (
            <button className={styles.copyButton} onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          )}
          <a className={styles.editLink} href="/canvas">
            Open in Canvas
          </a>
        </div>
      </div>

      <div className={styles.content}>
        {composition.generatedCode ? (
          <pre className={styles.codeBlock}>
            <code>{composition.generatedCode}</code>
          </pre>
        ) : (
          <div className={styles.empty}>No generated code available</div>
        )}
      </div>

      {composition.description && (
        <div className={styles.description}>{composition.description}</div>
      )}
    </div>
  );
}
