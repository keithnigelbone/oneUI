import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTennis = forwardRef<SVGSVGElement, IconComponentProps>(function IcTennis(
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
            d="M12 2A10 10 0 0 0 2 12a10 10 0 0 1 10 10 10 10 0 0 0 10-10A10 10 0 0 1 12 2m9.8 8A10 10 0 0 0 14 2.2a8 8 0 0 0 7.8 7.8M2.2 14a10 10 0 0 0 7.8 7.8A8 8 0 0 0 2.2 14"
          />
    </svg>
  );
});

IcTennis.displayName = 'IcTennis';
