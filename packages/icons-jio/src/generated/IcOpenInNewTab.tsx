import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcOpenInNewTab = forwardRef<SVGSVGElement, IconComponentProps>(function IcOpenInNewTab(
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
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m0 8a1 1 0 0 1-2 0V9.41l-4.29 4.3a1.002 1.002 0 0 1-1.639-.325 1 1 0 0 1 .219-1.095L14.59 8H13a1 1 0 1 1 0-2h4a1 1 0 0 1 1 1z"
          />
    </svg>
  );
});

IcOpenInNewTab.displayName = 'IcOpenInNewTab';
