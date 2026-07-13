import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcArrowBack = forwardRef<SVGSVGElement, IconComponentProps>(function IcArrowBack(
  { size = 24, width, height, color = 'currentColor', className, style, ...props },
  ref,
) {
  const dim = width ?? height ?? size;
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={width ?? dim}
      height={height ?? dim}
      color={color}
      className={className}
      style={style}
      {...props}
    >
      <path
            fill="currentColor"
            d="m2.29 12.71 6 6a1.004 1.004 0 1 0 1.42-1.42L5.41 13H21a1 1 0 1 0 0-2H5.41l4.3-4.29a1 1 0 0 0 0-1.42 1 1 0 0 0-1.42 0l-6 6a1 1 0 0 0 0 1.42"
          />
    </svg>
  );
});

IcArrowBack.displayName = 'IcArrowBack';
