import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBlocked = forwardRef<SVGSVGElement, IconComponentProps>(function IcBlocked(
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
            d="M12 2a10 10 0 0 0-7.74 16.33L18.33 4.26A10 10 0 0 0 12 2m7.74 3.67L5.67 19.74A10 10 0 0 0 19.74 5.67"
          />
    </svg>
  );
});

IcBlocked.displayName = 'IcBlocked';
