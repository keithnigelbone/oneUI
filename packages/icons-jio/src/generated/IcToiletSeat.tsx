import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcToiletSeat = forwardRef<SVGSVGElement, IconComponentProps>(function IcToiletSeat(
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
            d="M8 4c0-1.1-.9-2-2-2s-2 .9-2 2v8h4zm10 6h-6c-1.1 0-2 .9-2 2h10c0-1.1-.9-2-2-2m-4 4H4v1c0 3.87 3.13 7 7 7h3c.55 0 1-.45 1-1v-1h1c2.21 0 4-1.79 4-4v-2z"
          />
    </svg>
  );
});

IcToiletSeat.displayName = 'IcToiletSeat';
