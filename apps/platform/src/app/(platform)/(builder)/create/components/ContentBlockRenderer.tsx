'use client';

import styles from './ContentBlockRenderer.module.css';

/**
 * Renders stored Content Block JSON for preview (schema evolves — v0 is key/value friendly).
 */
export function ContentBlockRenderer({ data }: { data: unknown }) {
  if (data === null || data === undefined) {
    return <p className={styles.muted}>No Content Block data</p>;
  }

  if (typeof data === 'object' && !Array.isArray(data)) {
    const entries = Object.entries(data as Record<string, unknown>);
    return (
      <div className={styles.block} data-part="content-block">
        <div className={styles.label}>Content Block</div>
        <ul className={styles.list}>
          {entries.map(([k, v]) => (
            <li key={k} className={styles.item}>
              <span className={styles.key}>{k}</span>
              <span className={styles.val}>{String(v)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return <pre className={styles.pre}>{JSON.stringify(data, null, 2)}</pre>;
}
