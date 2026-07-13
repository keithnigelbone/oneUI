import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMoonWaxing16 = forwardRef<SVGSVGElement, IconComponentProps>(function IcMoonWaxing16(
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
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2M4 12c0-4.41 3.59-8 8-8 .85 0 1.67.14 2.44.38C16.61 6.21 18 8.93 18 12s-1.39 5.78-3.56 7.62c-.77.25-1.59.38-2.44.38-4.41 0-8-3.59-8-8"
          />
    </svg>
  );
});

IcMoonWaxing16.displayName = 'IcMoonWaxing16';
