import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcStamp = forwardRef<SVGSVGElement, IconComponentProps>(function IcStamp(
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
            d="M19 20H5a1 1 0 0 0 0 2h14a1 1 0 0 0 0-2m-1-7h-2a3 3 0 0 1-3-3v-.14a4 4 0 1 0-2 0V10a3 3 0 0 1-3 3H6a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2"
          />
    </svg>
  );
});

IcStamp.displayName = 'IcStamp';
