/**
 * Skeleton.shared.ts
 * Shared types and sizing helpers for SkeletonItem / SkeletonGroup.
 */

import type { CSSProperties, ReactNode } from 'react';

/** CSS length accepted by SkeletonItem width/height. */
export type SkeletonLength = number | string;

export interface SkeletonItemProps {
  /** Explicit width — when set, sizing ignores children. */
  width?: SkeletonLength;
  /** Explicit height — when set, sizing ignores children. */
  height?: SkeletonLength;
  /** Content used for natural size inference when width/height are omitted. */
  children?: ReactNode;
}

export interface SkeletonGroupProps {
  /** Direct SkeletonItem children only — stagger is computed automatically. */
  children: ReactNode;
}

/** Marker for dev-only child validation (not part of public API). */
export const SKELETON_ITEM_TYPE = Symbol.for('oneui.SkeletonItem');

export function hasExplicitSkeletonSize(
  width?: SkeletonLength,
  height?: SkeletonLength,
): boolean {
  return normalizeSkeletonLength(width) != null || normalizeSkeletonLength(height) != null;
}

/** Coerce Storybook / string inputs into a valid CSS length. */
export function normalizeSkeletonLength(
  value: SkeletonLength | undefined | null,
): SkeletonLength | undefined {
  if (value == null) return undefined;

  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : undefined;
  }

  let trimmed = value.trim();
  if (!trimmed) return undefined;

  // Storybook object control sometimes serializes as "{200}".
  const braceMatch = trimmed.match(/^\{([^}]+)\}$/);
  if (braceMatch) {
    trimmed = braceMatch[1].trim();
  }

  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const num = Number(trimmed);
    return Number.isFinite(num) && num > 0 ? num : undefined;
  }

  if (
    /^-?\d+(\.\d+)?(px|rem|em|%|vh|vw|ch|lh|vmin|vmax)$/.test(trimmed) ||
    trimmed.startsWith('var(') ||
    trimmed.startsWith('calc(')
  ) {
    return trimmed;
  }

  return undefined;
}

export function toCssLength(value: SkeletonLength | undefined): string | undefined {
  const normalized = normalizeSkeletonLength(value);
  if (normalized == null) return undefined;
  return typeof normalized === 'number' ? `${normalized}px` : normalized;
}

export function buildExplicitSkeletonStyle(
  width?: SkeletonLength,
  height?: SkeletonLength,
): CSSProperties | undefined {
  const normalizedWidth = normalizeSkeletonLength(width);
  const normalizedHeight = normalizeSkeletonLength(height);

  if (normalizedWidth == null && normalizedHeight == null) return undefined;

  const style: CSSProperties = {};

  if (normalizedWidth != null) {
    style.width = toCssLength(normalizedWidth);
  } else {
    style.width = 'var(--Skeleton-fallbackWidth, var(--Spacing-40))';
  }

  if (normalizedHeight != null) {
    style.height = toCssLength(normalizedHeight);
  } else {
    style.height = 'var(--Skeleton-fallbackHeight, var(--Spacing-5))';
  }

  return style;
}

export function isZeroSize(width: number, height: number): boolean {
  return width <= 0 || height <= 0;
}

export function readMeasureTargetSize(node: HTMLElement): { width: number; height: number } {
  const target =
    node.firstElementChild instanceof HTMLElement ? node.firstElementChild : node;

  const styleWidth = parseCssPixel(target.style.width);
  const styleHeight = parseCssPixel(target.style.height);
  if (styleWidth > 0 && styleHeight > 0) {
    return { width: styleWidth, height: styleHeight };
  }

  const rect = target.getBoundingClientRect();

  return {
    width: target.offsetWidth || rect.width,
    height: target.offsetHeight || rect.height,
  };
}

function parseCssPixel(value: string): number {
  if (!value) return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
