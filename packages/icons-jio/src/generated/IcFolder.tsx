import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFolder = forwardRef<SVGSVGElement, IconComponentProps>(function IcFolder(
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
            d="M19 20H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4.17a3 3 0 0 1 2.12.88L12.41 6H19a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3"
          />
    </svg>
  );
});

IcFolder.displayName = 'IcFolder';
