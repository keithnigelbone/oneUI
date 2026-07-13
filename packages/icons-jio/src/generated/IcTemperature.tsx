import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTemperature = forwardRef<SVGSVGElement, IconComponentProps>(function IcTemperature(
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
            d="M16 14V6a4 4 0 1 0-8 0v8a4.94 4.94 0 0 0-1 3 5 5 0 1 0 10 0 4.94 4.94 0 0 0-1-3m-4 5a2 2 0 0 1-2-2 2 2 0 0 1 1-1.72V8a1 1 0 0 1 2 0v7.28A2 2 0 0 1 14 17a2 2 0 0 1-2 2"
          />
    </svg>
  );
});

IcTemperature.displayName = 'IcTemperature';
