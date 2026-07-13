/**
 * SkeletonItem.tsx
 *
 * Generic loading placeholder — infers size from children or explicit width/height.
 * Public API: width?, height?, children? only (see PRD §4).
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './Skeleton.module.css';
import {
  SKELETON_ITEM_TYPE,
  buildExplicitSkeletonStyle,
  hasExplicitSkeletonSize,
  isZeroSize,
  readMeasureTargetSize,
  type SkeletonItemProps,
} from './Skeleton.shared';

function SkeletonItemComponent({ width, height, children }: SkeletonItemProps) {
  const measureRef = useRef<HTMLSpanElement>(null);
  const explicitSize = hasExplicitSkeletonSize(width, height);
  const [measuredSize, setMeasuredSize] = useState<{ width: number; height: number } | null>(null);
  const [usesFallback, setUsesFallback] = useState(!explicitSize && children == null);

  useEffect(() => {
    if (explicitSize || children == null) {
      setMeasuredSize(null);
      setUsesFallback(!explicitSize && children == null);
      return;
    }

    const node = measureRef.current;
    if (!node) return;

    const updateSize = () => {
      const { width: nextWidth, height: nextHeight } = readMeasureTargetSize(node);
      if (isZeroSize(nextWidth, nextHeight)) {
        setMeasuredSize(null);
        setUsesFallback(true);
        return;
      }

      setMeasuredSize({ width: nextWidth, height: nextHeight });
      setUsesFallback(false);
    };

    updateSize();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        updateSize();
      });

      observer.observe(node);
      return () => observer.disconnect();
    }

    return undefined;
  }, [children, explicitSize, height, width]);

  const explicitStyle = buildExplicitSkeletonStyle(width, height);
  const inferredStyle =
    !explicitSize && measuredSize
      ? {
          width: `${measuredSize.width}px`,
          height: `${measuredSize.height}px`,
        }
      : undefined;

  return (
    <span
      className={styles.item}
      style={explicitStyle ?? inferredStyle}
      data-fallback={usesFallback ? 'true' : undefined}
      aria-hidden="true"
    >
      {!explicitSize && children != null ? (
        <span ref={measureRef} className={styles.measure} aria-hidden="true">
          {children}
        </span>
      ) : null}
      <span className={styles.shimmer} aria-hidden="true" />
    </span>
  );
}

SkeletonItemComponent.displayName = 'SkeletonItem';
(SkeletonItemComponent as typeof SkeletonItemComponent & { [SKELETON_ITEM_TYPE]: true })[
  SKELETON_ITEM_TYPE
] = true;

export const SkeletonItem = SkeletonItemComponent;

export function isSkeletonItemElement(
  child: React.ReactNode,
): child is React.ReactElement<SkeletonItemProps> {
  return (
    React.isValidElement(child) &&
    typeof child.type === 'function' &&
    (child.type as { [SKELETON_ITEM_TYPE]?: boolean })[SKELETON_ITEM_TYPE] === true
  );
}
