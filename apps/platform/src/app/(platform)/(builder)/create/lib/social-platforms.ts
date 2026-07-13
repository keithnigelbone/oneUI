/**
 * Social platform definitions and asset dimension matrix.
 */

import type { AssetDimension, SocialPlatform } from './types';

export interface PlatformInfo {
  id: SocialPlatform;
  label: string;
  color: string;
}

export const PLATFORMS: PlatformInfo[] = [
  { id: 'instagram', label: 'Instagram', color: 'var(--Sparkle-Bold, #E1306C)' },
  { id: 'facebook', label: 'Facebook', color: 'var(--Primary-Bold, #1877F2)' },
  { id: 'youtube', label: 'YouTube', color: 'var(--Negative-Bold, #FF0000)' },
  { id: 'tiktok', label: 'TikTok', color: 'var(--Text-High, #000000)' },
  { id: 'linkedin', label: 'LinkedIn', color: 'var(--Informative-Bold, #0A66C2)' },
  { id: 'twitter', label: 'X (Twitter)', color: 'var(--Text-High, #000000)' },
];

export const ASSET_DIMENSIONS: AssetDimension[] = [
  // Instagram
  { name: 'IG Post Square', width: 1080, height: 1080, platform: 'instagram', category: 'post' },
  { name: 'IG Post Portrait', width: 1080, height: 1350, platform: 'instagram', category: 'post' },
  { name: 'IG Story / Reels', width: 1080, height: 1920, platform: 'instagram', category: 'story' },
  { name: 'IG Carousel', width: 1080, height: 1080, platform: 'instagram', category: 'post' },

  // Facebook
  { name: 'FB Post', width: 1200, height: 630, platform: 'facebook', category: 'post' },
  { name: 'FB Cover', width: 820, height: 312, platform: 'facebook', category: 'cover' },
  { name: 'FB Story', width: 1080, height: 1920, platform: 'facebook', category: 'story' },
  { name: 'FB Ad', width: 1200, height: 628, platform: 'facebook', category: 'ad' },

  // YouTube
  { name: 'YT Thumbnail', width: 1280, height: 720, platform: 'youtube', category: 'thumbnail' },
  { name: 'YT Banner', width: 2560, height: 1440, platform: 'youtube', category: 'banner' },
  { name: 'YT Shorts', width: 1080, height: 1920, platform: 'youtube', category: 'video' },

  // TikTok
  { name: 'TikTok Cover', width: 1080, height: 1920, platform: 'tiktok', category: 'video' },
  { name: 'TikTok Profile', width: 200, height: 200, platform: 'tiktok', category: 'profile' },

  // LinkedIn
  { name: 'LI Post', width: 1200, height: 627, platform: 'linkedin', category: 'post' },
  { name: 'LI Banner', width: 1584, height: 396, platform: 'linkedin', category: 'banner' },
  { name: 'LI Article Cover', width: 1200, height: 644, platform: 'linkedin', category: 'cover' },

  // X/Twitter
  { name: 'X Post', width: 1200, height: 675, platform: 'twitter', category: 'post' },
  { name: 'X Header', width: 1500, height: 500, platform: 'twitter', category: 'banner' },
  { name: 'X In-Stream', width: 1600, height: 900, platform: 'twitter', category: 'video' },
];

/** Get dimensions for a specific platform */
export function getDimensionsForPlatform(platform: SocialPlatform): AssetDimension[] {
  return ASSET_DIMENSIONS.filter(d => d.platform === platform);
}

/** Get a dimension by its name (used by Claude tools) — supports fuzzy matching */
export function getDimensionByName(name: string): AssetDimension | undefined {
  const exact = ASSET_DIMENSIONS.find(d => d.name === name);
  if (exact) return exact;

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const normalized = normalize(name);
  const fuzzy = ASSET_DIMENSIONS.find(d => normalize(d.name) === normalized);
  if (fuzzy) return fuzzy;

  return ASSET_DIMENSIONS.find(d => {
    const dn = normalize(d.name);
    return dn.startsWith(normalized) || normalized.startsWith(dn);
  });
}

/** Get all available dimension names as a formatted string for prompts */
export function getDimensionNamesForPrompt(platforms: SocialPlatform[]): string {
  return ASSET_DIMENSIONS
    .filter(d => platforms.includes(d.platform))
    .map(d => `- ${d.name} (${d.width}×${d.height})`)
    .join('\n');
}

/** Hero/default dimension for each platform — used for creative-first flow */
export const HERO_DIMENSIONS: Record<SocialPlatform, string> = {
  instagram: 'IG Post Portrait',
  facebook: 'FB Post',
  youtube: 'YT Thumbnail',
  tiktok: 'TikTok Cover',
  linkedin: 'LI Post',
  twitter: 'X Post',
};
