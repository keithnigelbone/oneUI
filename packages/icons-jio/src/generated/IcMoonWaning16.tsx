import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMoonWaning16 = forwardRef<SVGSVGElement, IconComponentProps>(function IcMoonWaning16(
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
            d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10m8-10c0 4.41-3.59 8-8 8-.85 0-1.67-.14-2.44-.38C7.39 17.79 6 15.07 6 12s1.39-5.78 3.56-7.62C10.33 4.13 11.15 4 12 4c4.41 0 8 3.59 8 8"
          />
    </svg>
  );
});

IcMoonWaning16.displayName = 'IcMoonWaning16';
