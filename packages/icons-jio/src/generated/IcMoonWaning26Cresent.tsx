import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMoonWaning26Cresent = forwardRef<SVGSVGElement, IconComponentProps>(function IcMoonWaning26Cresent(
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
            d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10m8-10c0 4.4-3.57 7.98-7.97 8C9.59 18.18 8 15.28 8 12s1.59-6.18 4.03-8c4.4.02 7.97 3.6 7.97 8"
          />
    </svg>
  );
});

IcMoonWaning26Cresent.displayName = 'IcMoonWaning26Cresent';
