import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPairing = forwardRef<SVGSVGElement, IconComponentProps>(function IcPairing(
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
            d="M8 12a1 1 0 0 0 1 1h6a1 1 0 0 0 0-2H9a1 1 0 0 0-1 1m2 4H8a4 4 0 1 1 0-8h2a1 1 0 1 0 0-2H8a6 6 0 1 0 0 12h2a1 1 0 0 0 0-2m6-10h-2a1 1 0 1 0 0 2h2a4 4 0 1 1 0 8h-2a1 1 0 0 0 0 2h2a6 6 0 1 0 0-12"
          />
    </svg>
  );
});

IcPairing.displayName = 'IcPairing';
