import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMilk = forwardRef<SVGSVGElement, IconComponentProps>(function IcMilk(
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
            d="M16.83 6.41 15.6 5.19A2 2 0 0 0 16 4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2 2 2 0 0 0 .4 1.19L7.17 6.41A4 4 0 0 0 6 9.24V19a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9.24a4 4 0 0 0-1.17-2.83M16 10c-3.71.23-4.29 1.71-8 1.94v-2.7a2 2 0 0 1 .59-1.41L10.41 6h3.18l1.82 1.83A2 2 0 0 1 16 9.24z"
          />
    </svg>
  );
});

IcMilk.displayName = 'IcMilk';
