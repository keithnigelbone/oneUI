/**
 * Visual-signature matching thresholds — single source of truth.
 *
 * Consumers import these constants directly (no copy-paste, no
 * per-consumer override). The two-stage matching pipeline:
 *
 *   1. pHash pre-filter      cheap, runs against every known signature
 *      Hamming distance ≤ PHASH_HAMMING_THRESHOLD considered a candidate.
 *   2. SSIM confirm          expensive, runs only on candidates
 *      structural similarity ≥ SSIM_MATCH_THRESHOLD confirms identity.
 *
 * Tuning notes:
 *
 * PHASH_HAMMING_THRESHOLD = 5 (out of 64 bits)
 *   Empirically, sub-pixel anti-alias differences against the same render
 *   produce 0–2 bits of disagreement. Crop / translate / minor anti-alias
 *   changes against the same component variant top out around 4 bits.
 *   Setting at 5 catches the long tail without admitting genuinely
 *   different components (which typically diverge ≥ 18 bits in our chassis).
 *
 * SSIM_MATCH_THRESHOLD = 0.92
 *   Common Storybook chassis renders against themselves SSIM in the 0.97+
 *   band. Small density / theme variants stay > 0.92. Going lower admits
 *   noise; going higher (0.95) rejects legitimate matches across density
 *   changes that downstream consumers want to fuse.
 */

export const PHASH_HAMMING_THRESHOLD = 5;

export const SSIM_MATCH_THRESHOLD = 0.92;
