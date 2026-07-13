import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAlignHorizontalCenters = forwardRef<SVGSVGElement, IconComponentProps>(function IcAlignHorizontalCenters(
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
            d="M17 7h-4V3c0-.55-.45-1-1-1s-1 .45-1 1v4H7c-1.66 0-3 1.34-3 3v4c0 1.66 1.34 3 3 3h4v4c0 .55.45 1 1 1s1-.45 1-1v-4h4c1.66 0 3-1.34 3-3v-4c0-1.66-1.34-3-3-3"
          />
    </svg>
  );
});

IcAlignHorizontalCenters.displayName = 'IcAlignHorizontalCenters';
