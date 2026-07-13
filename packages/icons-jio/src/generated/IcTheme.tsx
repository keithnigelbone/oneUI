import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTheme = forwardRef<SVGSVGElement, IconComponentProps>(function IcTheme(
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
            d="M19 2h-8a3 3 0 0 0-3 3v3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-3h3a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3m-5 17a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1z"
          />
    </svg>
  );
});

IcTheme.displayName = 'IcTheme';
