import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDefault = forwardRef<SVGSVGElement, IconComponentProps>(function IcDefault(
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
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2M4 12c0-4.41 3.59-8 8-8 1.85 0 3.54.63 4.9 1.69L5.69 16.9A8 8 0 0 1 4 12m8 8c-1.85 0-3.54-.63-4.9-1.69L18.31 7.1A8 8 0 0 1 20 12c0 4.41-3.59 8-8 8"
          />
    </svg>
  );
});

IcDefault.displayName = 'IcDefault';
