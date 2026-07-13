import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcGoogleLens = forwardRef<SVGSVGElement, IconComponentProps>(function IcGoogleLens(
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
            d="M18.5 16a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h7a1 1 0 0 0 0-2H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v7a1 1 0 0 0 2 0V6a3 3 0 0 0-3-3m-6 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8"
          />
    </svg>
  );
});

IcGoogleLens.displayName = 'IcGoogleLens';
