import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMoonWaxing56 = forwardRef<SVGSVGElement, IconComponentProps>(function IcMoonWaxing56(
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
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2M4 12c0-3.56 2.34-6.58 5.56-7.62C7.39 6.21 6 8.93 6 12s1.39 5.78 3.56 7.62C6.34 18.58 4 15.56 4 12"
          />
    </svg>
  );
});

IcMoonWaxing56.displayName = 'IcMoonWaxing56';
