import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSwitch = forwardRef<SVGSVGElement, IconComponentProps>(function IcSwitch(
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
            d="M19 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3M8 15a1 1 0 1 1-2 0V9a1 1 0 0 1 2 0zm10 0a1 1 0 0 1-2 0V9a1 1 0 0 1 2 0z"
          />
    </svg>
  );
});

IcSwitch.displayName = 'IcSwitch';
