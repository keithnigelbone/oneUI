import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSmartFridge = forwardRef<SVGSVGElement, IconComponentProps>(function IcSmartFridge(
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
            d="M5 19a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-7H5zm2-4a1 1 0 1 1 2 0v4a1 1 0 1 1-2 0zm9-13H8a3 3 0 0 0-3 3v5h14V5a3 3 0 0 0-3-3M9 7a1 1 0 0 1-2 0V5a1 1 0 0 1 2 0z"
          />
    </svg>
  );
});

IcSmartFridge.displayName = 'IcSmartFridge';
