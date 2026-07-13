import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcChevronUp = forwardRef<SVGSVGElement, IconComponentProps>(function IcChevronUp(
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
            d="M16 15a1 1 0 0 1-.71-.29L12 11.41l-3.29 3.3a1.004 1.004 0 0 1-1.42-1.42l4-4a1 1 0 0 1 1.42 0l4 4A1.001 1.001 0 0 1 16 15"
          />
    </svg>
  );
});

IcChevronUp.displayName = 'IcChevronUp';
