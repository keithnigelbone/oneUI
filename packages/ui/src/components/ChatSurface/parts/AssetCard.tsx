/**
 * AssetCard.tsx
 *
 * Inline renderer for `data-asset` parts emitted during Build chats.
 * Handles image / video / doc / audio with a minimal metadata footer.
 * Uses a consistent 16:9 media frame so mixed asset types line up in
 * the transcript without layout jumps.
 */

'use client';

import React from 'react';
import styles from './AssetCard.module.css';
import type { AssetPart } from './parts.shared';

export interface AssetCardProps {
  part: AssetPart;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function AssetCard({ part }: AssetCardProps) {
  const { kind, url, name, mimeType, sizeBytes } = part.data;
  const displayName = name ?? 'Untitled asset';

  return (
    <figure className={styles.root} aria-label={`${kind}: ${displayName}`}>
      <div className={styles.mediaFrame}>
        {kind === 'image' && (
          <img
            className={styles.image}
            src={url}
            alt={displayName}
            loading="lazy"
            decoding="async"
          />
        )}
        {kind === 'video' && (
          <video
            className={styles.video}
            src={url}
            controls
            preload="metadata"
            aria-label={displayName}
          />
        )}
        {kind === 'audio' && (
          <div className={styles.audioPlaceholder}>
            <audio className={styles.audio} src={url} controls aria-label={displayName} />
          </div>
        )}
        {kind === 'doc' && (
          <div className={styles.docPlaceholder}>{mimeType ?? 'Document'}</div>
        )}
      </div>
      <figcaption className={styles.meta}>
        <span className={styles.name}>{displayName}</span>
        {typeof sizeBytes === 'number' && (
          <span className={styles.size}>{formatBytes(sizeBytes)}</span>
        )}
      </figcaption>
    </figure>
  );
}
