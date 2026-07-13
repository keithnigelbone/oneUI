import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcServerCloud = forwardRef<SVGSVGElement, IconComponentProps>(function IcServerCloud(
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
            d="M19 9a2 2 0 0 0-1.75 1.05A.94.94 0 0 0 16 11a2 2 0 0 0 0 4h4a2 2 0 0 0 1-3.74q.015-.13 0-.26a2 2 0 0 0-2-2M5.5 11h6.59A6 6 0 0 1 18 6h3.65a3.49 3.49 0 0 0-3.15-2h-13a3.5 3.5 0 1 0 0 7m4-4.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2m-4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2m6.59 6.5H5.5a3.5 3.5 0 1 0 0 7h13a3.49 3.49 0 0 0 3.15-2H18a6 6 0 0 1-5.91-5M5.5 17.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcServerCloud.displayName = 'IcServerCloud';
