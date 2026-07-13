/**
 * AssetDetailPanel — Slide-in panel showing full-size asset preview with post configurations
 */

'use client';

import { useCallback, useState } from 'react';
import { Button } from '@oneui/ui/components/Button';
import { IconButton } from '@oneui/ui/components/IconButton';
import type { CampaignAsset } from '../lib/types';
import { PLATFORMS } from '../lib/social-platforms';
import { isJioRibbon, type RibbonDataV1 } from '../lib/ribbon-schema';
import styles from './AssetDetailPanel.module.css';

interface AssetDetailPanelProps {
  asset: CampaignAsset;
  onClose: () => void;
  onDownload: (asset: CampaignAsset) => void;
  onGenerateImage?: (assetId: string, slotId: string, prompt: string) => void;
  onEditDesign?: (assetId: string) => void;
  /** Called when the user changes ribbon positioning/variant controls */
  onRibbonUpdate?: (data: RibbonDataV1) => void;
}

// ---------------------------------------------------------------------------
// Ribbon Controls
// ---------------------------------------------------------------------------

interface RibbonControlsProps {
  ribbon: RibbonDataV1;
  canvasWidth: number;
  canvasHeight: number;
  onChange: (data: RibbonDataV1) => void;
}

type RibbonOrientation = 'horizontal' | 'vertical';
type RibbonPlacement = 'left' | 'center' | 'right' | 'top' | 'bottom';

const DIRECTION_TABS: { value: RibbonOrientation | undefined; label: string }[] = [
  { value: undefined, label: 'Auto' },
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
];

const VERTICAL_PLACEMENT_TABS: { value: RibbonPlacement; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

const HORIZONTAL_PLACEMENT_TABS: { value: RibbonPlacement; label: string }[] = [
  { value: 'top', label: 'Top' },
  { value: 'center', label: 'Center' },
  { value: 'bottom', label: 'Bottom' },
];

function RibbonControls({ ribbon, canvasWidth, canvasHeight, onChange }: RibbonControlsProps) {
  const effectiveOrientation = getEffectiveOrientation(ribbon, canvasWidth, canvasHeight);
  const placementTabs = effectiveOrientation === 'vertical' ? VERTICAL_PLACEMENT_TABS : HORIZONTAL_PLACEMENT_TABS;

  const setOrientation = useCallback(
    (orientation: RibbonOrientation | undefined) => {
      onChange({ ...ribbon, orientation, placement: undefined });
    },
    [ribbon, onChange],
  );

  const setPlacement = useCallback(
    (placement: RibbonPlacement) => onChange({ ...ribbon, placement }),
    [ribbon, onChange],
  );

  return (
    <div className={styles.configGroup}>
      <h3 className={styles.configLabel}>Ribbon</h3>

      {/* Direction tabs */}
      <div className={styles.ribbonRow}>
        <span className={styles.ribbonRowLabel}>Direction</span>
        <div className={styles.tabGroup}>
          {DIRECTION_TABS.map(({ value, label }) => (
            <button
              key={label}
              type="button"
              className={styles.tabItem}
              data-active={ribbon.orientation === value}
              onClick={() => setOrientation(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Placement tabs — options update based on effective direction */}
      <div className={styles.ribbonRow}>
        <span className={styles.ribbonRowLabel}>Position</span>
        <div className={styles.tabGroup}>
          {placementTabs.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={styles.tabItem}
              data-active={ribbon.placement === value || (!ribbon.placement && value === (effectiveOrientation === 'vertical' ? 'right' : 'bottom'))}
              onClick={() => setPlacement(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Derive effective ribbon orientation from explicit prop or canvas dimensions */
function getEffectiveOrientation(
  ribbon: RibbonDataV1,
  canvasWidth: number,
  canvasHeight: number,
): 'horizontal' | 'vertical' {
  if (ribbon.orientation) return ribbon.orientation;
  return canvasWidth > canvasHeight ? 'vertical' : 'horizontal';
}

export function AssetDetailPanel({
  asset,
  onClose,
  onDownload,
  onGenerateImage,
  onEditDesign,
  onRibbonUpdate,
}: AssetDetailPanelProps) {
  const { dimension, capturedImageUrl, status, name, imageSlots } = asset;
  const platformInfo = PLATFORMS.find(p => p.id === dimension.platform);
  const isReady = status === 'ready' && capturedImageUrl;

  const ribbonData = isJioRibbon(asset.ribbonData) ? asset.ribbonData : null;

  // Caption editing state
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');

  const handleCopyCaption = useCallback(() => {
    const fullText = [caption, hashtags].filter(Boolean).join('\n\n');
    if (fullText) navigator.clipboard.writeText(fullText);
  }, [caption, hashtags]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <h2 className={styles.title}>{name}</h2>
            <div className={styles.meta}>
              {platformInfo && (
                <span className={styles.platformBadge}>{platformInfo.label}</span>
              )}
              <span className={styles.dimensionText}>
                {dimension.width} x {dimension.height}
              </span>
              <span className={styles.categoryBadge}>{dimension.category}</span>
            </div>
          </div>
          <IconButton
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
            attention="low"
            appearance="neutral"
            size="small"
            aria-label="Close"
            onPress={onClose}
          />
        </div>

        <div className={styles.content}>
          {/* Large preview */}
          <div className={styles.previewSection}>
            <div
              className={styles.previewContainer}
              style={{
                '--detail-aspect-ratio': `${dimension.width} / ${dimension.height}`,
              } as React.CSSProperties}
            >
              {capturedImageUrl ? (
                <img
                  className={styles.previewImage}
                  src={capturedImageUrl}
                  alt={name}
                  draggable={false}
                />
              ) : (
                <div className={styles.previewPlaceholder}>
                  {status === 'error'
                    ? asset.error || 'Capture failed'
                    : 'Generating preview...'}
                </div>
              )}
            </div>
          </div>

          {/* Configuration sidebar */}
          <div className={styles.configSection}>
            {/* Ribbon Positioning */}
            {ribbonData && onRibbonUpdate && (
              <RibbonControls
                ribbon={ribbonData}
                canvasWidth={dimension.width}
                canvasHeight={dimension.height}
                onChange={onRibbonUpdate}
              />
            )}

            {/* Image Slots */}
            {imageSlots.length > 0 && (
              <div className={styles.configGroup}>
                <h3 className={styles.configLabel}>Image Slots</h3>
                {imageSlots.map(slot => (
                  <div key={slot.id} className={styles.slotItem}>
                    <div className={styles.slotInfo}>
                      <span className={styles.slotPrompt}>{slot.prompt}</span>
                      <span
                        className={`${styles.slotStatus} ${
                          slot.status === 'ready'
                            ? styles.slotStatusReady
                            : slot.status === 'error'
                              ? styles.slotStatusError
                              : ''
                        }`}
                      >
                        {slot.status}
                      </span>
                    </div>
                    {slot.status === 'pending' && onGenerateImage && (
                      <Button
                        attention="medium"
                        size="small"
                        onPress={() => onGenerateImage(asset.id, slot.id, slot.prompt)}
                      >
                        Generate
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Post Caption */}
            <div className={styles.configGroup}>
              <h3 className={styles.configLabel}>Post Caption</h3>
              <textarea
                className={styles.captionInput}
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Write your post caption..."
                rows={4}
              />
            </div>

            {/* Hashtags */}
            <div className={styles.configGroup}>
              <h3 className={styles.configLabel}>Hashtags</h3>
              <textarea
                className={styles.captionInput}
                value={hashtags}
                onChange={e => setHashtags(e.target.value)}
                placeholder="#brand #campaign #social"
                rows={2}
              />
            </div>

            {/* Schedule */}
            <div className={styles.configGroup}>
              <h3 className={styles.configLabel}>Schedule</h3>
              <input
                type="datetime-local"
                className={styles.dateInput}
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className={styles.actionGroup}>
              {isReady && onEditDesign && (
                <Button
                  attention="medium"
                  onPress={() => onEditDesign(asset.id)}
                >
                  Edit Design
                </Button>
              )}
              {(caption || hashtags) && (
                <Button attention="medium" onPress={handleCopyCaption}>
                  Copy Caption
                </Button>
              )}
              {isReady && (
                <Button
                  attention="high"
                  onPress={() => onDownload(asset)}
                >
                  Download PNG
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
