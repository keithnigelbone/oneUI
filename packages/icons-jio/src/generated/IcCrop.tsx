import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCrop = forwardRef<SVGSVGElement, IconComponentProps>(function IcCrop(
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
            d="M17 14a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1H7V3a1 1 0 0 0-2 0v2H3a1 1 0 0 0 0 2h14zm4 3H7v-7a1 1 0 0 0-2 0v8a1 1 0 0 0 1 1h11v2a1 1 0 0 0 2 0v-2h2a1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcCrop.displayName = 'IcCrop';
