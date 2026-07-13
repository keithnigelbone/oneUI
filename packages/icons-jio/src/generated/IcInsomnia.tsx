import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcInsomnia = forwardRef<SVGSVGElement, IconComponentProps>(function IcInsomnia(
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
            d="M7 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4m1 1H4V5a1 1 0 0 0-2 0v14a1 1 0 1 0 2 0v-1h16v1a1 1 0 0 0 2 0v-4H11a3 3 0 0 1-3-3m11-4h-6a3 3 0 0 0-3 3v1a1 1 0 0 0 1 1h11v-2a3 3 0 0 0-3-3"
          />
    </svg>
  );
});

IcInsomnia.displayName = 'IcInsomnia';
