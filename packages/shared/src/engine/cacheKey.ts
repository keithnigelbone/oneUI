/**
 * cacheKey.ts
 *
 * Generates deterministic hash strings for brand CSS cache invalidation.
 * The hash represents the input data (color config + appearance config)
 * so the client can check if cached CSS is still fresh.
 *
 * Framework-agnostic — usable from server-side, CLI, or browser.
 */

/**
 * Generate a deterministic hash for brand CSS input data.
 * Uses a simple but effective string-based hash (djb2 algorithm).
 *
 * @param colorConfig Brand color configuration
 * @param appearanceConfig Multi-accent appearance configuration
 * @param typographyConfig Typography configuration
 * @param motionConfig Motion foundation configuration
 * @returns Hash string for cache comparison
 */
export function computeInputHash(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  colorConfig: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appearanceConfig: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typographyConfig?: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  motionConfig?: any,
): string {
  const input = JSON.stringify({
    color: colorConfig ?? null,
    appearance: appearanceConfig ?? null,
    typography: typographyConfig ?? null,
    motion: motionConfig ?? null,
  });

  return djb2Hash(input);
}

/**
 * Generate a lightweight motion fingerprint that only captures load-bearing fields.
 *
 * Unlike computeInputHash, this skips interactionPatterns and transitionPatterns
 * (which are editor-preview metadata — not consumed by the brand CSS pipeline).
 * This keeps the React memo hash path cheap even when the motion editor edits
 * pattern specs that don't affect compiled CSS.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function computeMotionFingerprint(motionConfig: any): string {
  if (!motionConfig) return 'null';
  // Only baseDuration + easings affect the 37 CSS tokens emitted by generateMotionCSS.
  const input = JSON.stringify({
    baseDuration: motionConfig.baseDuration ?? null,
    easings: motionConfig.easings ?? null,
  });
  return djb2Hash(input);
}

/**
 * Hash Convex `elevationConfigs` row for native theme cache invalidation.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function computeElevationFingerprint(elevationConfig: any): string {
  if (!elevationConfig?.levels) return 'null';
  const input = JSON.stringify(elevationConfig.levels);
  return djb2Hash(input);
}

/**
 * DJB2 hash — fast, simple, deterministic string hash.
 * Returns hex string.
 */
function djb2Hash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16);
}
