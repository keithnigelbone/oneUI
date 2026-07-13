import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcVeg = forwardRef<SVGSVGElement, IconComponentProps>(function IcVeg(
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
            d="M12 7.5c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5M18 3H6C4.35 3 3 4.35 3 6v12c0 1.65 1.35 3 3 3h12c1.65 0 3-1.35 3-3V6c0-1.65-1.35-3-3-3m1 15c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1z"
          />
    </svg>
  );
});

IcVeg.displayName = 'IcVeg';
