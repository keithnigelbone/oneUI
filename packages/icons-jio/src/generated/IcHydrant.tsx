import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHydrant = forwardRef<SVGSVGElement, IconComponentProps>(function IcHydrant(
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
            d="M20 11h-1a1 1 0 0 0-1-1h-1V8a1 1 0 1 0 0-2h-.1a5 5 0 0 0-9.8 0H7a1 1 0 1 0 0 2v2H6a1 1 0 0 0-1 1H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1 1h1v5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-5h1a1 1 0 0 0 1-1h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1m-8 4a2 2 0 1 1 0-4 2 2 0 0 1 0 4"
          />
    </svg>
  );
});

IcHydrant.displayName = 'IcHydrant';
