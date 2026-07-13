import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFoyer = forwardRef<SVGSVGElement, IconComponentProps>(function IcFoyer(
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
            d="M20 15a1 1 0 0 0-1 1v3H5v-3a1 1 0 1 0-2 0v4a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1m-2-6A6 6 0 1 0 6 9v9h12zm-3 3a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcFoyer.displayName = 'IcFoyer';
