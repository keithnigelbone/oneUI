import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFort = forwardRef<SVGSVGElement, IconComponentProps>(function IcFort(
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
            d="M19 10h-.21a4.32 4.32 0 0 0-.16-3.21C17.94 5.4 16.45 4.47 14.2 4a5.2 5.2 0 0 1-1.6-.82l-.09-.05a.2.2 0 0 1-.07 0h-.54a.7.7 0 0 0-.14 0h-.13l-.08.05h-.09A4.55 4.55 0 0 1 9.81 4c-2.24.42-3.74 1.34-4.43 2.72A4.36 4.36 0 0 0 5.21 10H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h5v-4a2 2 0 1 1 4 0v4h5a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2"
          />
    </svg>
  );
});

IcFort.displayName = 'IcFort';
