import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcGift = forwardRef<SVGSVGElement, IconComponentProps>(function IcGift(
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
            d="M5 18a3 3 0 0 0 3 3h3v-8H5zM20 7h-1.18A3 3 0 0 0 16 3h-2a3 3 0 0 0-2 .78A3 3 0 0 0 10 3H8a3 3 0 0 0-2.82 4H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1m-9 0H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1zm5 0h-3V6a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2m-3 14h3a3 3 0 0 0 3-3v-5h-6z"
          />
    </svg>
  );
});

IcGift.displayName = 'IcGift';
