import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcGamingControllers = forwardRef<SVGSVGElement, IconComponentProps>(function IcGamingControllers(
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
            d="M21.7 8.53a5.94 5.94 0 0 0-5.53-4H8a6 6 0 0 0-6 5.83c-.09 3.39 2.56 9.17 5.83 9.17 2.17 0 2.06-3.29 2.91-3.8a2.52 2.52 0 0 1 2.53 0c1 .57.74 3.8 3.29 3.8s5.24-5.64 5.44-8.61a5.7 5.7 0 0 0-.3-2.39m-12 2.68a1 1 0 0 1-.7.29H8v1a1 1 0 0 1-.29.71 1 1 0 0 1-.71.29 1 1 0 0 1-1-1v-1H5a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 1.384-.926 1 1 0 0 1 .326.216A1 1 0 0 1 8 8.5v1h1a1 1 0 0 1 .71 1.71zm6 0a1 1 0 0 1-1.26.12.9.9 0 0 1-.37-.45 1 1 0 0 1-.07-.58 1 1 0 0 1 .648-.741 1 1 0 0 1 1.332.94 1 1 0 0 1-.27.71zm.59-3.42A1 1 0 0 1 17 7.5a1 1 0 0 1 .93.62 1 1 0 0 1 .07.58 1 1 0 0 1-.78.78 1 1 0 0 1-.58-.06 1 1 0 0 1-.45-.36A1 1 0 0 1 16 8.5a1 1 0 0 1 .3-.71zm1.41 5.42a1 1 0 0 1-1.26.12.9.9 0 0 1-.37-.45 1 1 0 0 1-.07-.58 1 1 0 0 1 .648-.741 1 1 0 0 1 1.332.94 1 1 0 0 1-.27.71zm2-2a1 1 0 0 1-1.26.12.9.9 0 0 1-.37-.45 1 1 0 0 1-.07-.58 1 1 0 0 1 .648-.741 1 1 0 0 1 1.332.94 1 1 0 0 1-.27.71z"
          />
    </svg>
  );
});

IcGamingControllers.displayName = 'IcGamingControllers';
