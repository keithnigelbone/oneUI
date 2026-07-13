import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcIntersection = forwardRef<SVGSVGElement, IconComponentProps>(function IcIntersection(
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
            d="M15 5a6.9 6.9 0 0 0-3 .69A6.9 6.9 0 0 0 9 5a7 7 0 0 0 0 14 6.9 6.9 0 0 0 3-.69 6.9 6.9 0 0 0 3 .69 7 7 0 1 0 0-14m-5 11.9q-.495.095-1 .1a5 5 0 1 1 1-9.9 7 7 0 0 0 0 9.8m5 .1a5.6 5.6 0 0 1-1-.1 7 7 0 0 0 0-9.8 5 5 0 1 1 1 9.9"
          />
    </svg>
  );
});

IcIntersection.displayName = 'IcIntersection';
