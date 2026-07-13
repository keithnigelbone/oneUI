import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCallDids = forwardRef<SVGSVGElement, IconComponentProps>(function IcCallDids(
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
            d="M14 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2m0 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2M9 3H7.6a1.93 1.93 0 0 0-1.2.4C5.28 4.28 3 6.71 3 12s2.28 7.72 3.4 8.6a1.93 1.93 0 0 0 1.2.4H9a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2H8a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h1a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m5 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2m3 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2m3 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-3-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcCallDids.displayName = 'IcCallDids';
