import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWalkingAids = forwardRef<SVGSVGElement, IconComponentProps>(function IcWalkingAids(
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
            d="M16 3h-1a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1H8a4 4 0 0 0-4 4v11.28A2 2 0 0 0 3 20a2 2 0 0 0 4 0 2 2 0 0 0-1-1.72V16h12v5a1 1 0 0 0 2 0V7a4 4 0 0 0-4-4m-5 11H6v-3h5zm7 0h-5v-3h5zm0-5H6V7a2 2 0 0 1 2-2h1a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1h1a2 2 0 0 1 2 2z"
          />
    </svg>
  );
});

IcWalkingAids.displayName = 'IcWalkingAids';
