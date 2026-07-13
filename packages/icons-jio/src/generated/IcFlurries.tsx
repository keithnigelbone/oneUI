import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFlurries = forwardRef<SVGSVGElement, IconComponentProps>(function IcFlurries(
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
            d="M19.44 8.38c.03-.21.06-.42.06-.63C19.5 5.13 17.37 3 14.75 3c-1.64 0-3.08.83-3.93 2.09A3.7 3.7 0 0 0 10 5a3.98 3.98 0 0 0-3.86 3.01C6.09 8.01 6.05 8 6 8c-1.66 0-3 1.34-3 3s1.34 3 3 3h12c1.66 0 3-1.34 3-3 0-1.13-.64-2.11-1.56-2.62M12 17c-.97 0-1.75.78-1.75 1.75s.78 1.75 1.75 1.75 1.75-.78 1.75-1.75S12.97 17 12 17m5-1.5c-.97 0-1.75.78-1.75 1.75S16.03 19 17 19s1.75-.78 1.75-1.75-.78-1.75-1.75-1.75m-10 0c-.97 0-1.75.78-1.75 1.75S6.03 19 7 19s1.75-.78 1.75-1.75S7.97 15.5 7 15.5"
          />
    </svg>
  );
});

IcFlurries.displayName = 'IcFlurries';
