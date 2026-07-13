import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTableLayout = forwardRef<SVGSVGElement, IconComponentProps>(function IcTableLayout(
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
            d="M8 3H6C4.34 3 3 4.34 3 6v2h5zM10 21h8c1.66 0 3-1.34 3-3v-8H10zM21 8V6c0-1.66-1.34-3-3-3h-8v5zM3 10v8c0 1.66 1.34 3 3 3h2V10z"
          />
    </svg>
  );
});

IcTableLayout.displayName = 'IcTableLayout';
