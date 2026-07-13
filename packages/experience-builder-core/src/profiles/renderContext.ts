import { z } from 'zod';
import type { OutputProfile } from './outputProfileTable';

export const RenderPlatformSchema = z.enum(['S', 'M', 'L']);
export type RenderPlatform = z.infer<typeof RenderPlatformSchema>;

export const RenderDensitySchema = z.enum(['compact', 'default', 'open']);
export type RenderDensity = z.infer<typeof RenderDensitySchema>;

const OUTPUT_PROFILE_PLATFORM: Record<OutputProfile, RenderPlatform> = {
  'web-desktop': 'L',
  'web-mobile': 'S',
  'web-responsive': 'L',
  'app-phone': 'S',
  'app-tablet': 'M',
  'dashboard-desktop': 'L',
  'dashboard-wide': 'L',
  'ig-square': 'S',
  'ig-portrait': 'S',
  'ig-story': 'S',
  'ig-carousel': 'S',
  'billboard-landscape': 'L',
  'digital-portrait': 'L',
  'slide-16x9': 'L',
  'slide-4x3': 'L',
  'image-freeform': 'L',
};

export function normalizeRenderDensity(value: unknown): RenderDensity {
  if (value === 'compact') return 'compact';
  if (value === 'open' || value === 'editorial') return 'open';
  return 'default';
}

/**
 * Coerce a legacy `<Letter>-<width>` breakpoint id (as stored on older specs) to
 * the unified S/M/L model by resolving its width suffix on the canonical ladder.
 * Returns null when `value` isn't a legacy-shaped id. No hardcoded legacy ids.
 */
function coerceLegacyPlatform(value: string): RenderPlatform | null {
  const match = /^[A-Z]+-(\d+)$/.exec(value);
  if (!match) return null;
  return renderPlatformForViewportWidth(parseInt(match[1], 10));
}

export function normalizeRenderPlatform(value: unknown): RenderPlatform {
  const parsedPlatform = RenderPlatformSchema.safeParse(value);
  if (parsedPlatform.success) return parsedPlatform.data;

  if (typeof value === 'string') {
    const coerced = coerceLegacyPlatform(value);
    if (coerced) return coerced;
  }

  const parsedProfile = z.enum([
    'web-desktop',
    'web-mobile',
    'web-responsive',
    'app-phone',
    'app-tablet',
    'dashboard-desktop',
    'dashboard-wide',
    'ig-square',
    'ig-portrait',
    'ig-story',
    'ig-carousel',
    'billboard-landscape',
    'digital-portrait',
    'slide-16x9',
    'slide-4x3',
    'image-freeform',
  ]).safeParse(value);
  if (parsedProfile.success) return OUTPUT_PROFILE_PLATFORM[parsedProfile.data];

  return 'L';
}

export function renderPlatformForViewportWidth(width: number): RenderPlatform {
  if (!Number.isFinite(width) || width <= 0) return 'L';
  if (width <= 619) return 'S';
  if (width <= 990) return 'M';
  return 'L';
}

export function renderPlatformForOutputProfile(profile: OutputProfile): RenderPlatform {
  return OUTPUT_PROFILE_PLATFORM[profile];
}
