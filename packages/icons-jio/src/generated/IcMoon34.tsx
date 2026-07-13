import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMoon34 = forwardRef<SVGSVGElement, IconComponentProps>(function IcMoon34(
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
            d="M12 2c-1.38 0-2.7.28-3.89.79a9.6 9.6 0 0 0-2.47 1.5c-1.98 1.63-3.31 4-3.59 6.69-.03.34-.05.68-.05 1.02 0 5.52 4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18V4c4.41 0 8 3.59 8 8s-3.59 8-8 8"
          />
    </svg>
  );
});

IcMoon34.displayName = 'IcMoon34';
