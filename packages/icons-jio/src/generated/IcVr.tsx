import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcVr = forwardRef<SVGSVGElement, IconComponentProps>(function IcVr(
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
            d="M20.83 6.17A4 4 0 0 0 18 5H6a4 4 0 0 0-4 4v6a4 4 0 0 0 4 4h2.8a1.93 1.93 0 0 0 .94-.24 2 2 0 0 0 .72-.65l.71-1.06a1 1 0 0 1 1.66 0l.71 1.06a2 2 0 0 0 .72.65c.288.159.611.241.94.24H18a4 4 0 0 0 4-4V9a4 4 0 0 0-1.17-2.83M9.41 13.41A2 2 0 0 1 8 14a2 2 0 1 1 2-2 2 2 0 0 1-.59 1.41m8 0A2 2 0 0 1 16 14a2 2 0 1 1 2-2 2 2 0 0 1-.59 1.41"
          />
    </svg>
  );
});

IcVr.displayName = 'IcVr';
