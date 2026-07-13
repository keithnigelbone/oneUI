import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDining = forwardRef<SVGSVGElement, IconComponentProps>(function IcDining(
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
            d="M3 16h18a1 1 0 0 0 1-1 10 10 0 0 0-9-9.95 1 1 0 0 0-2 0A10 10 0 0 0 2 15a1 1 0 0 0 1 1m18 2H3a1 1 0 0 0 0 2h18a1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcDining.displayName = 'IcDining';
