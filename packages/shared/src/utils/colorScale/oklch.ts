/**
 * colorScale/oklch.ts
 *
 * Pure OkLCH ↔ hex conversion + sRGB gamut helpers. No dependencies on the
 * rest of the colorScale module — safe to import from anywhere that just
 * needs to convert colours.
 */

/**
 * Convert hex colour to OkLCH components.
 *
 * Uses the standard sRGB → linear RGB → XYZ (D65) → OkLab → OkLCH pipeline.
 * For higher accuracy in product code prefer a dedicated colour library
 * (`culori`); this implementation is good enough for scale generation where
 * we round to 0.1% precision anyway.
 */
export function hexToOklch(hex: string): { l: number; c: number; h: number } {
  const cleanHex = hex.replace('#', '');

  const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
  const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
  const b = parseInt(cleanHex.slice(4, 6), 16) / 255;

  const linearR = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const linearG = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const linearB = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  const x = 0.4124564 * linearR + 0.3575761 * linearG + 0.1804375 * linearB;
  const y = 0.2126729 * linearR + 0.7151522 * linearG + 0.072175 * linearB;
  const z = 0.0193339 * linearR + 0.119192 * linearG + 0.9503041 * linearB;

  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.633851707 * z);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bLab = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const c = Math.sqrt(a * a + bLab * bLab);
  let h = Math.atan2(bLab, a) * (180 / Math.PI);
  if (h < 0) h += 360;

  return { l: L * 100, c, h };
}

/** Convert OkLCH (L in 0-100) to a hex colour string. */
export function oklchToHex(l: number, c: number, h: number): string {
  const L = l / 100;

  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const bLab = c * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * bLab;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * bLab;
  const s_ = L - 0.0894841775 * a - 1.291485548 * bLab;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  let linearR = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  let linearG = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  let linearB = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  linearR = Math.max(0, Math.min(1, linearR));
  linearG = Math.max(0, Math.min(1, linearG));
  linearB = Math.max(0, Math.min(1, linearB));

  const r = linearR <= 0.0031308 ? 12.92 * linearR : 1.055 * Math.pow(linearR, 1 / 2.4) - 0.055;
  const g = linearG <= 0.0031308 ? 12.92 * linearG : 1.055 * Math.pow(linearG, 1 / 2.4) - 0.055;
  const b = linearB <= 0.0031308 ? 12.92 * linearB : 1.055 * Math.pow(linearB, 1 / 2.4) - 0.055;

  const toHex = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    const hex = Math.round(clamped * 255).toString(16).padStart(2, '0');
    return hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/** Check if a colour is within sRGB gamut (re-projects through hex round-trip). */
export function isInGamut(l: number, c: number, h: number): boolean {
  const hex = oklchToHex(l, c, h);
  const back = hexToOklch(hex);
  return Math.abs(back.c - c) < 0.01;
}

const MAX_CHROMA_CACHE_LIMIT = 5000;
const MAX_CHROMA_CACHE = new Map<string, number>();

/**
 * Find maximum chroma at a given lightness and hue that's within sRGB gamut.
 * Uses binary search; the returned value is multiplied by 0.95 to leave a
 * stability margin.
 */
export function findMaxChromaInGamut(lightness: number, hue: number, precision = 0.001): number {
  const cacheKey = `${lightness.toFixed(4)}:${hue.toFixed(4)}:${precision}`;
  const cached = MAX_CHROMA_CACHE.get(cacheKey);
  if (cached !== undefined) return cached;

  let low = 0;
  let high = 0.4;

  while (high - low > precision) {
    const mid = (low + high) / 2;
    if (isInGamut(lightness, mid, hue)) {
      low = mid;
    } else {
      high = mid;
    }
  }

  const result = low * 0.95;
  if (MAX_CHROMA_CACHE.size >= MAX_CHROMA_CACHE_LIMIT) {
    MAX_CHROMA_CACHE.clear();
  }
  MAX_CHROMA_CACHE.set(cacheKey, result);
  return result;
}


/** Parse an OkLCH string back to its component values. */
export function parseOkLCH(oklch: string): {
  lightness: number;
  chroma: number;
  hue: number;
} | null {
  const match = oklch.match(
    /oklch\((\d+(?:\.\d+)?)[%\s]+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\)/,
  );

  if (!match) return null;

  return {
    lightness: parseFloat(match[1]),
    chroma: parseFloat(match[2]),
    hue: parseFloat(match[3]),
  };
}

/** Format OkLCH values into a CSS string. */
export function toOkLCH(lightness: number, chroma: number, hue: number): string {
  return `oklch(${Math.round(lightness)}% ${chroma.toFixed(3)} ${hue.toFixed(1)})`;
}
