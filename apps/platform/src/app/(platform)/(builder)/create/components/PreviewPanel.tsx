/**
 * PreviewPanel — Right panel with platform filters and asset grid
 */

'use client';

import type { CampaignAsset, SocialPlatform } from '../lib/types';
import { PLATFORMS } from '../lib/social-platforms';
import { ToggleGroup } from '@oneui/ui/components/ToggleGroup';
import { AssetCard } from './AssetCard';
import styles from './PreviewPanel.module.css';

interface PreviewPanelProps {
  assets: CampaignAsset[];
  allAssets: CampaignAsset[];
  activePlatform: SocialPlatform | 'all';
  onPlatformFilter: (platform: SocialPlatform | 'all') => void;
  onDownload?: (asset: CampaignAsset) => void;
  onAssetClick?: (asset: CampaignAsset) => void;
  onEditAsset?: (asset: CampaignAsset) => void;
  onDeleteAsset?: (asset: CampaignAsset) => void;
}

export function PreviewPanel({
  assets,
  allAssets,
  activePlatform,
  onPlatformFilter,
  onDownload,
  onAssetClick,
  onEditAsset,
  onDeleteAsset,
}: PreviewPanelProps) {
  // Only show platform filters that have assets
  const activePlatforms = new Set(allAssets.map(a => a.dimension.platform));
  const visiblePlatforms = PLATFORMS.filter(p => activePlatforms.has(p.id));

  return (
    <div className={styles.panel}>
      {visiblePlatforms.length > 0 && (
        <div className={styles.header}>
          <ToggleGroup
              value={[activePlatform]}
              onValueChange={(values) => onPlatformFilter((values[0] as SocialPlatform | 'all') ?? 'all')}
              variant="subtool"
            >
              <ToggleGroup.Item value="all">All</ToggleGroup.Item>
              {visiblePlatforms.map(p => (
                <ToggleGroup.Item key={p.id} value={p.id}>{p.label}</ToggleGroup.Item>
              ))}
            </ToggleGroup>
          <span className={styles.assetCount}>
            {assets.length} asset{assets.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {assets.length > 0 ? (
        <div className={styles.grid}>
          {assets.map(asset => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onDownload={onDownload}
              onClick={onAssetClick}
              onEdit={onEditAsset}
              onDelete={onDeleteAsset}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyGrid}>
          {allAssets.length === 0
            ? 'Assets will appear here as they are generated'
            : 'No assets for this platform'}
        </div>
      )}
    </div>
  );
}
