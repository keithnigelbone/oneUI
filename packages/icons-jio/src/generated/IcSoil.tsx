import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSoil = forwardRef<SVGSVGElement, IconComponentProps>(function IcSoil(
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
            d="M21 4a5.7 5.7 0 0 0-2.66.59A3.8 3.8 0 0 1 16.5 5a3.84 3.84 0 0 1-1.85-.41A5.66 5.66 0 0 0 12 4a5.7 5.7 0 0 0-2.66.59A3.8 3.8 0 0 1 7.5 5a3.84 3.84 0 0 1-1.85-.41A5.6 5.6 0 0 0 3 4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcSoil.displayName = 'IcSoil';
