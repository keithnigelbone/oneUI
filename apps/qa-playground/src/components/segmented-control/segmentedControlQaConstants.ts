/**
 * SegmentedControl Figma validation matrix counts.
 * Kept in plain `.ts` so Playwright can import without CSS Modules.
 */

/** attention × trackEmphasis × shape × disabled × size × type (36 rows × 6 cols) */
export const SEGMENTED_CONTROL_VARIANT_MATRIX_COUNT = 3 * 3 * 2 * 2 * 3 * 2;

/** size × attention */
export const SEGMENTED_CONTROL_SIZE_ATTENTION_MATRIX_COUNT = 3 * 3;
