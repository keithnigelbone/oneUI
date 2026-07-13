import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcLogout = forwardRef<SVGSVGElement, IconComponentProps>(function IcLogout(
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
            d="M17.87 3.91a1 1 0 0 0-1.58.966 1 1 0 0 0 .4.654 8 8 0 1 1-9.38 0 1.002 1.002 0 0 0-1.18-1.62 10 10 0 1 0 11.74 0M12 8a1 1 0 0 0 1-1V3a1 1 0 0 0-2 0v4a1 1 0 0 0 1 1"
          />
    </svg>
  );
});

IcLogout.displayName = 'IcLogout';
