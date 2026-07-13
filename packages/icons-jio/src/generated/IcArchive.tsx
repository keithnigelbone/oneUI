import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcArchive = forwardRef<SVGSVGElement, IconComponentProps>(function IcArchive(
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
            d="M20 3H4a2 2 0 0 0-2 2v1a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V5a2 2 0 0 0-2-2M4 18a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V9H4zm6-6h4a1 1 0 0 1 0 2h-4a1 1 0 0 1 0-2"
          />
    </svg>
  );
});

IcArchive.displayName = 'IcArchive';
