import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDocumentary = forwardRef<SVGSVGElement, IconComponentProps>(function IcDocumentary(
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
            d="M21 20h-3a10 10 0 1 0-6 2h9a1 1 0 0 0 0-2M6 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4m6 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4m-1-8a1 1 0 1 1 2 0 1 1 0 0 1-2 0m1-4a2 2 0 1 1 0-4 2 2 0 0 1 0 4m4 4a2 2 0 1 1 4 0 2 2 0 0 1-4 0"
          />
    </svg>
  );
});

IcDocumentary.displayName = 'IcDocumentary';
