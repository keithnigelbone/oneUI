import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAlignVerticalCenters = forwardRef<SVGSVGElement, IconComponentProps>(function IcAlignVerticalCenters(
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
            d="M21 11h-4V7c0-1.66-1.34-3-3-3h-4C8.34 4 7 5.34 7 7v4H3c-.55 0-1 .45-1 1s.45 1 1 1h4v4c0 1.66 1.34 3 3 3h4c1.66 0 3-1.34 3-3v-4h4c.55 0 1-.45 1-1s-.45-1-1-1"
          />
    </svg>
  );
});

IcAlignVerticalCenters.displayName = 'IcAlignVerticalCenters';
