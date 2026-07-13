import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSecurityCameraBall = forwardRef<SVGSVGElement, IconComponentProps>(function IcSecurityCameraBall(
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
            d="M17.64 8.34a8 8 0 0 0-10.1-1 8 8 0 0 0-1.21 12.3 7.9 7.9 0 0 0 4.1 2.19 8 8 0 0 0 7.21-13.5zm-3.53 7.78a3 3 0 0 1-4.89-1 3 3 0 0 1 3.92-3.92 3 3 0 0 1 1 4.89zM12 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2M7.25 4.49c.095.1.211.175.34.22a.9.9 0 0 0 .4.07.9.9 0 0 0 .4-.09 10 10 0 0 1 7.28 0 1 1 0 0 0 .36.07 1 1 0 0 0 .63-.24.94.94 0 0 0 .34-.58 1 1 0 0 0-.61-1.11 11.93 11.93 0 0 0-8.72 0 .9.9 0 0 0-.36.17.9.9 0 0 0-.25.33.9.9 0 0 0-.1.39 1 1 0 0 0 .04.43q.091.195.25.34"
          />
    </svg>
  );
});

IcSecurityCameraBall.displayName = 'IcSecurityCameraBall';
