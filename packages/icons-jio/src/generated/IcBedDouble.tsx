import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBedDouble = forwardRef<SVGSVGElement, IconComponentProps>(function IcBedDouble(
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
            d="M6 9a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2h2V9a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2h2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4h2zm14 3H4a2 2 0 0 0-2 2v5a1 1 0 1 0 2 0v-1h16v1a1 1 0 0 0 2 0v-5a2 2 0 0 0-2-2"
          />
    </svg>
  );
});

IcBedDouble.displayName = 'IcBedDouble';
