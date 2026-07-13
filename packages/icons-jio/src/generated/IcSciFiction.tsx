import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSciFiction = forwardRef<SVGSVGElement, IconComponentProps>(function IcSciFiction(
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
            d="M20 8a1 1 0 0 0-1 1v5h-2a2 2 0 0 0-1.18-1.82l-1.9-7.53A2 2 0 0 0 12 3a2 2 0 0 0-1.92 1.65l-1.9 7.53A2 2 0 0 0 7 14H5V9a1 1 0 0 0-2 0v9a1 1 0 0 0 .07.35v.08a.81.81 0 0 0 .4.41l4 2A1 1 0 0 0 8 21h8a1 1 0 0 0 .42-.1l4-2a.8.8 0 0 0 .4-.41.3.3 0 0 0 0-.08A1 1 0 0 0 21 18V9a1 1 0 0 0-1-1M4 6a1 1 0 0 0 1-1V4a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1m16-3a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0V4a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcSciFiction.displayName = 'IcSciFiction';
