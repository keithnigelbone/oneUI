import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDvdPlayer = forwardRef<SVGSVGElement, IconComponentProps>(function IcDvdPlayer(
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
            d="M19 14H5a3 3 0 0 0 0 6h14a3 3 0 0 0 0-6m-8 4H5a1 1 0 0 1 0-2h6a1 1 0 0 1 0 2m4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8m0-5a1 1 0 1 1 0 2 1 1 0 0 1 0-2"
          />
    </svg>
  );
});

IcDvdPlayer.displayName = 'IcDvdPlayer';
