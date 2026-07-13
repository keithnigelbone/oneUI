import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRadio = forwardRef<SVGSVGElement, IconComponentProps>(function IcRadio(
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
            d="M20 6a1.5 1.5 0 1 0-1.23-2.36l-13 2.94A3.49 3.49 0 0 0 3 10v8a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3h-5l6-1.37A1.46 1.46 0 0 0 20 6m-7 8a3 3 0 1 1-5.999 0A3 3 0 0 1 13 14"
          />
    </svg>
  );
});

IcRadio.displayName = 'IcRadio';
