import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMoonWaxing26Cresent = forwardRef<SVGSVGElement, IconComponentProps>(function IcMoonWaxing26Cresent(
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
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2M4 12c0-4.4 3.57-7.98 7.97-8C14.41 5.82 16 8.72 16 12s-1.59 6.18-4.03 8C7.57 19.98 4 16.4 4 12"
          />
    </svg>
  );
});

IcMoonWaxing26Cresent.displayName = 'IcMoonWaxing26Cresent';
