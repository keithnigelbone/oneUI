/**
 * colorScales.ts
 *
 * Convex queries and mutations for OkLCH color scale management.
 * Implements 25-step color scale generation with:
 * - Base chroma lock (no color exceeds base chroma)
 * - Auto-detect base position from input color lightness
 * - Step 100 = pure black, Step 2500 = pure white
 * - Chroma fade at extremes (L<10, L>90)
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireBrandRole, requireBrandRoleForDoc, canReadBrand } from './lib/auth';

/**
 * 25-step color scale (100-2500)
 */
const SCALE_STEPS = [
  100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
  1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000,
  2100, 2200, 2300, 2400, 2500,
] as const;

type ScaleStep = (typeof SCALE_STEPS)[number];

/**
 * Lightness values for each step (Jio Design System)
 */
const STEP_LIGHTNESS: Record<ScaleStep, number> = {
  100: 0,      // Pure black
  200: 4,
  300: 8.5,
  400: 12.5,
  500: 16.5,
  600: 21,
  700: 25,
  800: 29,
  900: 33.5,
  1000: 37.5,
  1100: 41.5,
  1200: 46,
  1300: 50,    // Mid-point
  1400: 54,
  1500: 58.5,
  1600: 62.5,
  1700: 66.5,
  1800: 71,
  1900: 75,
  2000: 79,
  2100: 83.5,
  2200: 87.5,
  2300: 91.5,
  2400: 96,
  2500: 100,   // Pure white
};

/**
 * Find closest step for a given lightness
 */
function findClosestStep(lightness: number): ScaleStep {
  let closest: ScaleStep = 1300;
  let minDiff = Infinity;

  for (const step of SCALE_STEPS) {
    const stepLightness = STEP_LIGHTNESS[step];
    const diff = Math.abs(stepLightness - lightness);
    if (diff < minDiff) {
      minDiff = diff;
      closest = step;
    }
  }

  return closest;
}

/**
 * Convert hex to OkLCH (simplified conversion)
 */
function hexToOklch(hex: string): { l: number; c: number; h: number } {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
  const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
  const b = parseInt(cleanHex.slice(4, 6), 16) / 255;

  // Convert to linear RGB
  const linearR = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const linearG = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const linearB = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  // Convert to XYZ (D65)
  const x = 0.4124564 * linearR + 0.3575761 * linearG + 0.1804375 * linearB;
  const y = 0.2126729 * linearR + 0.7151522 * linearG + 0.0721750 * linearB;
  const z = 0.0193339 * linearR + 0.1191920 * linearG + 0.9503041 * linearB;

  // Convert to OkLab
  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bLab = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  const c = Math.sqrt(a * a + bLab * bLab);
  let h = Math.atan2(bLab, a) * (180 / Math.PI);
  if (h < 0) h += 360;

  return { l: L * 100, c, h };
}

/**
 * Convert OkLCH to hex
 */
function oklchToHex(l: number, c: number, h: number): string {
  const L = l / 100;
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const bLab = c * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * bLab;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * bLab;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * bLab;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  let linearR = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  let linearG = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  let linearB = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  linearR = Math.max(0, Math.min(1, linearR));
  linearG = Math.max(0, Math.min(1, linearG));
  linearB = Math.max(0, Math.min(1, linearB));

  const toSrgb = (v: number) => v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  const toHex = (v: number) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0');

  return `#${toHex(toSrgb(linearR))}${toHex(toSrgb(linearG))}${toHex(toSrgb(linearB))}`.toUpperCase();
}

/**
 * Check if color is in sRGB gamut
 */
function isInGamut(l: number, c: number, h: number): boolean {
  const hex = oklchToHex(l, c, h);
  const back = hexToOklch(hex);
  return Math.abs(back.c - c) < 0.01;
}

/**
 * Find max chroma at lightness/hue within gamut
 */
function findMaxChroma(lightness: number, hue: number): number {
  let low = 0;
  let high = 0.4;

  while (high - low > 0.001) {
    const mid = (low + high) / 2;
    if (isInGamut(lightness, mid, hue)) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return low * 0.95;
}

/**
 * Calculate chroma with base lock and fade zones
 */
function calculateChroma(
  step: ScaleStep,
  baseStep: ScaleStep,
  baseChroma: number,
  baseLightness: number,
  hue: number
): number {
  const stepLightness = STEP_LIGHTNESS[step];

  if (step === baseStep) return baseChroma;

  const maxChromaAtStep = findMaxChroma(stepLightness, hue);
  const maxChromaAtBase = findMaxChroma(baseLightness, hue);
  const chromaRatio = maxChromaAtBase > 0 ? baseChroma / maxChromaAtBase : 0;

  let targetChroma = Math.min(maxChromaAtStep * chromaRatio, baseChroma);

  // Fade at extremes
  if (stepLightness < 10) {
    targetChroma *= stepLightness / 10;
  } else if (stepLightness > 90) {
    targetChroma *= (100 - stepLightness) / 10;
  }

  return Math.min(targetChroma, baseChroma);
}

/**
 * Calculate hue with minimal shift
 */
function calculateHue(step: ScaleStep, baseHue: number): number {
  const lightness = STEP_LIGHTNESS[step];
  let adjustedHue = baseHue;

  if (lightness < 20) {
    adjustedHue += 2;
  } else if (lightness > 80) {
    adjustedHue -= 2;
  }

  return ((adjustedHue % 360) + 360) % 360;
}

type LockedBaseOklch = { l: number; c: number; h: number };

/**
 * Generate a single color step. When `lockedBase` is provided, the base step
 * is written from the locked OkLCH triple verbatim instead of re-parsing
 * `baseColor`. This mirrors the client-side engine in
 * packages/shared/src/utils/colorScale.
 */
function generateStep(
  step: ScaleStep,
  baseStep: ScaleStep,
  baseChroma: number,
  baseLightness: number,
  hue: number,
  baseColor: string,
  lockedBase?: LockedBaseOklch
) {
  const lightness = STEP_LIGHTNESS[step];
  const isBase = step === baseStep;

  // Pure black
  if (step === 100) {
    return {
      step,
      lightness: 0,
      chroma: 0,
      hue,
      oklch: 'oklch(0% 0 0)',
      hex: '#000000',
      isBase: false,
    };
  }

  // Pure white
  if (step === 2500) {
    return {
      step,
      lightness: 100,
      chroma: 0,
      hue,
      oklch: 'oklch(100% 0 0)',
      hex: '#FFFFFF',
      isBase: false,
    };
  }

  // Base step unchanged
  if (isBase) {
    if (lockedBase) {
      const hex = oklchToHex(lockedBase.l, lockedBase.c, lockedBase.h);
      return {
        step,
        lightness: Math.round(lockedBase.l * 10) / 10,
        chroma: Math.round(lockedBase.c * 1000) / 1000,
        hue: Math.round(lockedBase.h * 10) / 10,
        oklch: `oklch(${lockedBase.l.toFixed(1)}% ${lockedBase.c.toFixed(3)} ${lockedBase.h.toFixed(1)})`,
        hex,
        isBase: true,
      };
    }
    const oklch = hexToOklch(baseColor);
    return {
      step,
      lightness: oklch.l,
      chroma: oklch.c,
      hue: oklch.h,
      oklch: `oklch(${oklch.l.toFixed(1)}% ${oklch.c.toFixed(3)} ${oklch.h.toFixed(1)})`,
      hex: baseColor.toUpperCase(),
      isBase: true,
    };
  }

  const chroma = calculateChroma(step, baseStep, baseChroma, baseLightness, hue);
  const stepHue = calculateHue(step, hue);
  const hex = oklchToHex(lightness, chroma, stepHue);

  return {
    step,
    lightness,
    chroma: Math.round(chroma * 1000) / 1000,
    hue: Math.round(stepHue * 10) / 10,
    oklch: `oklch(${lightness}% ${chroma.toFixed(3)} ${stepHue.toFixed(1)})`,
    hex,
    isBase: false,
  };
}

interface GenerateFullScaleOptions {
  lockBase?: boolean;
  lockedBaseOklch?: LockedBaseOklch;
}

/**
 * Generate full 25-step scale from base color.
 *
 * When `options.lockBase` is true, the base step is pinned to the locked
 * OkLCH snapshot and the config carries the lock through. The non-base
 * chroma cap is clamped to `lockedBaseOklch.c` so step chromas never exceed
 * the locked value.
 */
function generateFullScale(
  name: string,
  baseColor: string,
  options?: GenerateFullScaleOptions,
) {
  const locked = options?.lockBase === true && options.lockedBaseOklch
    ? options.lockedBaseOklch
    : undefined;

  const oklch = locked ?? hexToOklch(baseColor);
  const baseLightness = oklch.l;
  const baseChroma = oklch.c;
  const hue = oklch.h;
  const baseStep = findClosestStep(baseLightness);
  const resolvedBaseColor = locked
    ? oklchToHex(locked.l, locked.c, locked.h)
    : baseColor.toUpperCase();

  const steps = SCALE_STEPS.map((step) =>
    generateStep(step, baseStep, baseChroma, baseLightness, hue, resolvedBaseColor, locked)
  );

  return {
    config: {
      name,
      baseColor: resolvedBaseColor,
      hue,
      chroma: baseChroma,
      baseStep,
      baseLightness,
      lockBase: options?.lockBase === true ? true : undefined,
      lockedBaseOklch: locked ? { ...locked } : undefined,
    },
    steps,
  };
}

/**
 * Get all color scales for a brand
 */
export const list = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return [];
    return await ctx.db
      .query('colorScales')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();
  },
});

/**
 * Get a single color scale by ID
 */
export const get = query({
  args: { id: v.id('colorScales') },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) return null;
    // Read-scoped: authenticated non-members get null (anonymous tooling passes).
    if (!(await canReadBrand(ctx, doc.brandId))) return null;
    return doc;
  },
});

/**
 * Get a color scale by brand and name
 */
export const getByName = query({
  args: {
    brandId: v.id('brands'),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return null;
    return await ctx.db
      .query('colorScales')
      .withIndex('by_brand_name', (q) =>
        q.eq('brandId', args.brandId).eq('name', args.name)
      )
      .first();
  },
});

/**
 * Convex validator for the locked OkLCH snapshot. Kept as a const so the
 * same shape is reused across create + update mutations.
 */
const lockedBaseOklchValidator = v.object({
  l: v.number(),
  c: v.number(),
  h: v.number(),
});

/**
 * Create a new color scale from a base color.
 *
 * Defaults new scales to `lockBase: true`, snapshotting the hex's OkLCH
 * triple. Callers can pass `lockBase: false` to opt into the organic /
 * unlocked slider flow, or provide their own `lockedBaseOklch` (e.g. when
 * restoring from a client-side state that has a canonical snapshot).
 */
export const create = mutation({
  args: {
    brandId: v.id('brands'),
    name: v.string(),
    baseColor: v.string(), // Hex color
    lockBase: v.optional(v.boolean()),
    lockedBaseOklch: v.optional(lockedBaseOklchValidator),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');

    // Validate hex color format
    if (!/^#[0-9A-Fa-f]{6}$/.test(args.baseColor)) {
      throw new Error('Base color must be a valid hex color (e.g., #FF5500)');
    }

    // Check if scale name already exists for this brand
    const existing = await ctx.db
      .query('colorScales')
      .withIndex('by_brand_name', (q) =>
        q.eq('brandId', args.brandId).eq('name', args.name)
      )
      .first();

    if (existing) {
      throw new Error(`Color scale '${args.name}' already exists for this brand`);
    }

    // Default new scales to locked. Capture lockedBaseOklch from the hex if
    // the client hasn't already computed it.
    const lockBase = args.lockBase ?? true;
    const lockedBaseOklch = lockBase
      ? args.lockedBaseOklch ?? hexToOklch(args.baseColor)
      : undefined;

    const { config, steps } = generateFullScale(args.name, args.baseColor, {
      lockBase,
      lockedBaseOklch,
    });

    const now = Date.now();

    const scaleId = await ctx.db.insert('colorScales', {
      brandId: args.brandId,
      name: config.name,
      baseColor: config.baseColor,
      hue: config.hue,
      chroma: config.chroma,
      baseStep: config.baseStep,
      baseLightness: config.baseLightness,
      lockBase,
      lockedBaseOklch,
      steps,
      createdAt: now,
      updatedAt: now,
    });

    return scaleId;
  },
});

/**
 * Update a color scale's base color (regenerates all 25 steps).
 *
 * When `lockBase` is passed, it wins. When omitted, the existing persisted
 * `lockBase` flag is preserved so partial updates from the client don't
 * silently flip the scale's lock state.
 *
 * When locked (either pre-existing or newly enabled), the lockedBaseOklch
 * is re-snapshotted from the new `baseColor` hex — typing a fresh brand hex
 * while locked pins the CURRENT choice, not the historical one.
 */
export const update = mutation({
  args: {
    id: v.id('colorScales'),
    baseColor: v.string(),
    lockBase: v.optional(v.boolean()),
    lockedBaseOklch: v.optional(lockedBaseOklchValidator),
  },
  handler: async (ctx, args) => {
    const { doc: scale } = await requireBrandRoleForDoc(ctx, 'colorScales', args.id, 'editor');

    // Validate hex color format
    if (!/^#[0-9A-Fa-f]{6}$/.test(args.baseColor)) {
      throw new Error('Base color must be a valid hex color (e.g., #FF5500)');
    }

    const lockBase = args.lockBase ?? scale.lockBase ?? false;
    const lockedBaseOklch = lockBase
      ? args.lockedBaseOklch ?? hexToOklch(args.baseColor)
      : undefined;

    // Regenerate scale with new base color (and the current lock state)
    const { config, steps } = generateFullScale(scale.name, args.baseColor, {
      lockBase,
      lockedBaseOklch,
    });

    await ctx.db.patch(args.id, {
      baseColor: config.baseColor,
      hue: config.hue,
      chroma: config.chroma,
      baseStep: config.baseStep,
      baseLightness: config.baseLightness,
      // Store the boolean explicitly (incl. `false`) so toggling the lock OFF
      // actually persists. patch() with `undefined` would keep the prior value
      // and leave the scale locked in the DB even though the client unlocked.
      lockBase,
      lockedBaseOklch,
      steps,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Rename a color scale
 */
export const rename = mutation({
  args: {
    id: v.id('colorScales'),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const { doc: scale } = await requireBrandRoleForDoc(ctx, 'colorScales', args.id, 'editor');

    // Check if new name already exists for this brand
    const existing = await ctx.db
      .query('colorScales')
      .withIndex('by_brand_name', (q) =>
        q.eq('brandId', scale.brandId).eq('name', args.name)
      )
      .first();

    if (existing && existing._id !== args.id) {
      throw new Error(`Color scale '${args.name}' already exists for this brand`);
    }

    await ctx.db.patch(args.id, {
      name: args.name,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Delete a color scale
 */
export const remove = mutation({
  args: { id: v.id('colorScales') },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'colorScales', args.id, 'editor');

    await ctx.db.delete(args.id);
    return args.id;
  },
});

/**
 * Generate a preview of a color scale without saving
 */
export const preview = query({
  args: {
    baseColor: v.string(),
    lockBase: v.optional(v.boolean()),
    lockedBaseOklch: v.optional(lockedBaseOklchValidator),
  },
  handler: async (_ctx, args) => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(args.baseColor)) {
      throw new Error('Base color must be a valid hex color (e.g., #FF5500)');
    }

    const lockBase = args.lockBase ?? false;
    const lockedBaseOklch = lockBase
      ? args.lockedBaseOklch ?? hexToOklch(args.baseColor)
      : undefined;

    return generateFullScale('preview', args.baseColor, { lockBase, lockedBaseOklch });
  },
});

/**
 * Clone all color scales from one brand to another
 */
export const cloneForBrand = mutation({
  args: {
    sourceBrandId: v.id('brands'),
    targetBrandId: v.id('brands'),
  },
  handler: async (ctx, args) => {
    if (args.sourceBrandId === args.targetBrandId) {
      throw new Error('Source and target brand cannot be the same');
    }
    // Writing cloned scales into the target brand requires editor there.
    await requireBrandRole(ctx, args.targetBrandId, 'editor');

    const sourceScales = await ctx.db
      .query('colorScales')
      .withIndex('by_brand', (q) => q.eq('brandId', args.sourceBrandId))
      .collect();

    const now = Date.now();
    const clonedIds: string[] = [];

    for (const scale of sourceScales) {
      const existing = await ctx.db
        .query('colorScales')
        .withIndex('by_brand_name', (q) =>
          q.eq('brandId', args.targetBrandId).eq('name', scale.name)
        )
        .first();

      if (!existing) {
        const newId = await ctx.db.insert('colorScales', {
          brandId: args.targetBrandId,
          name: scale.name,
          baseColor: scale.baseColor,
          hue: scale.hue,
          chroma: scale.chroma,
          baseStep: scale.baseStep,
          baseLightness: scale.baseLightness,
          lockBase: scale.lockBase,
          lockedBaseOklch: scale.lockedBaseOklch,
          steps: scale.steps,
          createdAt: now,
          updatedAt: now,
        });
        clonedIds.push(newId);
      }
    }

    return {
      clonedCount: clonedIds.length,
      clonedIds,
    };
  },
});

/**
 * Batch create default color scales for a brand
 */
export const createDefaults = mutation({
  args: {
    brandId: v.id('brands'),
    primaryColor: v.string(),    // Hex color for primary
    secondaryColor: v.optional(v.string()),  // Hex color for secondary
    neutralColor: v.optional(v.string()),    // Hex color for neutral
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');

    const now = Date.now();
    const createdIds: string[] = [];

    // Generate primary oklch for complementary calculation if needed
    const primaryOklch = hexToOklch(args.primaryColor);

    // Default scales to create
    const defaultScales = [
      { name: 'primary', baseColor: args.primaryColor },
      {
        name: 'secondary',
        baseColor: args.secondaryColor ||
          oklchToHex(primaryOklch.l, primaryOklch.c * 0.8, (primaryOklch.h + 180) % 360),
      },
      {
        name: 'neutral',
        baseColor: args.neutralColor || '#808080',
      },
      { name: 'success', baseColor: '#22C55E' }, // Green
      { name: 'warning', baseColor: '#EAB308' }, // Amber
      { name: 'error', baseColor: '#EF4444' },   // Red
      { name: 'info', baseColor: '#3B82F6' },    // Blue
    ];

    for (const scale of defaultScales) {
      const existing = await ctx.db
        .query('colorScales')
        .withIndex('by_brand_name', (q) =>
          q.eq('brandId', args.brandId).eq('name', scale.name)
        )
        .first();

      if (!existing) {
        // Defaults for seeded scales follow the same policy as `create`:
        // locked by default, snapshotting the hex's OkLCH.
        const lockedBaseOklch = hexToOklch(scale.baseColor);
        const { config, steps } = generateFullScale(scale.name, scale.baseColor, {
          lockBase: true,
          lockedBaseOklch,
        });
        const newId = await ctx.db.insert('colorScales', {
          brandId: args.brandId,
          name: config.name,
          baseColor: config.baseColor,
          hue: config.hue,
          chroma: config.chroma,
          baseStep: config.baseStep,
          baseLightness: config.baseLightness,
          lockBase: true,
          lockedBaseOklch,
          steps,
          createdAt: now,
          updatedAt: now,
        });
        createdIds.push(newId);
      }
    }

    return {
      createdCount: createdIds.length,
      createdIds,
    };
  },
});
