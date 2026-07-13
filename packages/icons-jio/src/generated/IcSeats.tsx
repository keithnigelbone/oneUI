import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSeats = forwardRef<SVGSVGElement, IconComponentProps>(function IcSeats(
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
            d="M17.65 2.07a3 3 0 0 0-3.58 2.28L13.48 7H12a4 4 0 0 0-4 4H7a3 3 0 0 0 0 6h3v2H7a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2h-3v-2h3a3 3 0 0 0 2.93-2.35l2-9a3 3 0 0 0-2.28-3.58M10 11a2 2 0 0 1 2-2h1l-.45 2z"
          />
    </svg>
  );
});

IcSeats.displayName = 'IcSeats';
