import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBookmark = forwardRef<SVGSVGElement, IconComponentProps>(function IcBookmark(
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
            d="M17 2H7a3 3 0 0 0-3 3v15a2 2 0 0 0 3 1.73l5-2.88 5 2.88a2 2 0 0 0 1 .27 2 2 0 0 0 1.732-1.001A2 2 0 0 0 20 20V5a3 3 0 0 0-3-3"
          />
    </svg>
  );
});

IcBookmark.displayName = 'IcBookmark';
