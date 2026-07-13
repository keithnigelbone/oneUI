import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPassbook = forwardRef<SVGSVGElement, IconComponentProps>(function IcPassbook(
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
            d="M17 2H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3m-5 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6m3 12H9a1 1 0 0 1 0-2h6a1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcPassbook.displayName = 'IcPassbook';
