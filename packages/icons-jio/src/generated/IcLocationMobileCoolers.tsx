import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcLocationMobileCoolers = forwardRef<SVGSVGElement, IconComponentProps>(function IcLocationMobileCoolers(
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
            d="M17 13a1 1 0 0 0 .71-.29C18 12.37 21 9.34 21 6.8A3.93 3.93 0 0 0 17 3a3.93 3.93 0 0 0-4 3.8c0 2.54 3 5.57 3.29 5.91A1 1 0 0 0 17 13m-1-6a1 1 0 1 1 2 0 1 1 0 0 1-2 0m1 8a1 1 0 0 0-1 1v2h-3a1 1 0 1 0 0 2h3a2 2 0 0 0 2-2v-2a1 1 0 0 0-1-1M11 4H8a2 2 0 0 0-2 2v1a1 1 0 0 0 2 0V6h3a1 1 0 1 0 0-2M8 9H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2M6.5 19a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcLocationMobileCoolers.displayName = 'IcLocationMobileCoolers';
