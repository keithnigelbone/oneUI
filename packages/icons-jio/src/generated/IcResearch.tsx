import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcResearch = forwardRef<SVGSVGElement, IconComponentProps>(function IcResearch(
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
            d="M19 2H5a1 1 0 0 0 0 2h1v12a6 6 0 1 0 12 0V4h1a1 1 0 1 0 0-2m-8.25 11.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5M13.5 17a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
          />
    </svg>
  );
});

IcResearch.displayName = 'IcResearch';
