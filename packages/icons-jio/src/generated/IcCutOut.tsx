import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCutOut = forwardRef<SVGSVGElement, IconComponentProps>(function IcCutOut(
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
            d="M11 5h2a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2m-7 9a1 1 0 0 0 1-1v-2a1 1 0 1 0-2 0v2a1 1 0 0 0 1 1m9 5h-2a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2m3.6-3.8L12.34 12l4.26-3.2a1 1 0 0 0-1.2-1.6l-4.72 3.55-3-2.26q.242-.164.45-.37a3 3 0 1 0-3.71.42L9 12l-4.59 3.46q-.289.18-.53.42a3 3 0 0 0 0 4.24 3 3 0 0 0 4.24 0 3 3 0 0 0-.45-4.61l3-2.26 4.73 3.55a1 1 0 0 0 1.2-1.6M6.71 6.71a1.004 1.004 0 1 1-1.42-1.42 1.004 1.004 0 0 1 1.42 1.42m0 12a1.004 1.004 0 1 1-1.42-1.42 1.004 1.004 0 0 1 1.42 1.42M18 3h-1a1 1 0 1 0 0 2h1a1 1 0 0 1 1 1v1a1 1 0 0 0 2 0V6a3 3 0 0 0-3-3m2 13a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1h-1a1 1 0 0 0 0 2h1a3 3 0 0 0 3-3v-1a1 1 0 0 0-1-1m0-6a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcCutOut.displayName = 'IcCutOut';
