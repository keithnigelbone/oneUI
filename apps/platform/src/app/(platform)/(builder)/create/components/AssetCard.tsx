/**
 * AssetCard — Individual asset preview card with status, dimensions, and actions.
 * Hover overlay shows edit + delete icons in the top-right corner.
 */

'use client';

import { Button } from '@oneui/ui/components/Button';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Spinner } from '@oneui/ui/components/Spinner';
import type { CampaignAsset } from '../lib/types';
import { PLATFORMS } from '../lib/social-platforms';
import styles from './AssetCard.module.css';

interface AssetCardProps {
  asset: CampaignAsset;
  onDownload?: (asset: CampaignAsset) => void;
  onClick?: (asset: CampaignAsset) => void;
  onEdit?: (asset: CampaignAsset) => void;
  onDelete?: (asset: CampaignAsset) => void;
}

export function AssetCard({ asset, onDownload, onClick, onEdit, onDelete }: AssetCardProps) {
  const { dimension, capturedImageUrl, status, name } = asset;
  const aspectRatio = dimension.width / dimension.height;
  const platformInfo = PLATFORMS.find(p => p.id === dimension.platform);
  const isReady = status === 'ready' && capturedImageUrl;
  const isProcessing = status === 'generating' || status === 'rendering' || status === 'capturing';
  const isError = status === 'error';

  return (
    <div
      className={styles.card}
      onClick={() => onClick?.(asset)}
      style={{ cursor: onClick ? 'pointer' : undefined }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(asset); } } : undefined}
    >
      <div
        className={styles.preview}
        style={{ '--asset-aspect-ratio': aspectRatio } as React.CSSProperties}
      >
        {capturedImageUrl && (
          <img
            className={styles.previewImage}
            src={capturedImageUrl}
            alt={name}
            draggable={false}
          />
        )}
        {isProcessing && (
          <div className={styles.statusOverlay}>
            <Spinner size="L" label="Processing asset" />
          </div>
        )}
        {isError && (
          <div className={styles.statusOverlay}>
            <span className={styles.errorText}>{asset.error || 'Capture failed'}</span>
          </div>
        )}

        {/* Hover actions — top-right edit + delete */}
        {(onEdit || onDelete) && (
          <div className={styles.hoverActions} onClick={(e) => e.stopPropagation()}>
            {onEdit && (
              <IconButton
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                }
                attention="low"
                appearance="neutral"
                size="small"
                aria-label="Edit design"
                onPress={() => onEdit(asset)}
              />
            )}
            {onDelete && (
              <IconButton
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                }
                attention="low"
                size="small"
                appearance="negative"
                aria-label="Delete asset"
                onPress={() => onDelete(asset)}
              />
            )}
          </div>
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.assetName}>{name || dimension.name}</div>
        <div className={styles.assetMeta}>
          {platformInfo && (
            <span className={styles.platformBadge}>{platformInfo.label}</span>
          )}
          <span className={styles.dimension}>
            {dimension.width} x {dimension.height}
          </span>
        </div>
      </div>

      {isReady && onDownload && (
        <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
          <Button
            attention="medium"
            size="small"
            onPress={() => onDownload(asset)}
          >
            Download PNG
          </Button>
        </div>
      )}
    </div>
  );
}
