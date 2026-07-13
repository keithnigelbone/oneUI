/**
 * Static wizard data aligned with Jio Banner Builder CreateSection fallbacks.
 */

import type { SocialPlatform } from './types';

export interface OfflineFormatOption {
  id: string;
  label: string;
  description: string;
}

/** Banner Builder ASSET_FORMATS / FormatStep defaults */
export const OFFLINE_FORMAT_OPTIONS: OfflineFormatOption[] = [
  {
    id: 'social-post',
    label: 'Social Post',
    description: 'Images for social media platforms',
  },
  {
    id: 'banner',
    label: 'Banner',
    description: 'Web and app promotional banners',
  },
  {
    id: 'instore-graphic',
    label: 'Instore Graphic',
    description: 'Print-ready graphics for physical stores',
  },
  {
    id: 'promotional-email',
    label: 'Promotional Email',
    description: 'Email marketing visuals and headers',
  },
];

export interface OfflinePlatformOption {
  id: string;
  label: string;
  /** Maps to Create / Experience social platform for dimensions + Convex */
  socialPlatform: SocialPlatform;
}

/** Banner Builder PlatformStep / PlatformContext defaults — mapped to social platforms */
export const OFFLINE_PLATFORM_OPTIONS: OfflinePlatformOption[] = [
  { id: 'web', label: 'Web', socialPlatform: 'facebook' },
  { id: 'app', label: 'App', socialPlatform: 'instagram' },
  { id: 'tv', label: 'TV', socialPlatform: 'youtube' },
];

export function getFormatByLabelOrId(value: string): OfflineFormatOption | undefined {
  const t = value.trim().toLowerCase();
  return OFFLINE_FORMAT_OPTIONS.find(
    (f) => f.id === t || f.label.toLowerCase() === t || t.includes(f.id.replace(/-/g, ' '))
  );
}

export function getOfflinePlatformByLabelOrId(value: string): OfflinePlatformOption | undefined {
  const t = value.trim().toLowerCase();
  return OFFLINE_PLATFORM_OPTIONS.find(
    (p) => p.id === t || p.label.toLowerCase() === t
  );
}

/** Default image slot prompt hints per format (token-only layouts still use slots) */
/** Joins multi-select clarification answers (must match parser in offline-wizard-engine). */
export const OFFLINE_MULTI_ANSWER_JOIN = '|||';

export const OFFLINE_FORMAT_IMAGE_PROMPTS: Record<string, string> = {
  'social-post': 'Bold lifestyle photography matching the campaign headline, bright and social-first',
  banner: 'Wide hero photograph with clear focal subject for web banner placement',
  'instore-graphic': 'High-impact retail visual, product-forward, print-ready composition',
  'promotional-email': 'Clean email header image, minimal clutter, strong single subject',
};
