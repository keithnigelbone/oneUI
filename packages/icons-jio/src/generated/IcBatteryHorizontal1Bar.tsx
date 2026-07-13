import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBatteryHorizontal1Bar = forwardRef<SVGSVGElement, IconComponentProps>(function IcBatteryHorizontal1Bar(
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
            d="M20 8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2m0 6h-1a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v1a1 1 0 0 0 1 1h1zM7.5 9h-1a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-5a.5.5 0 0 0-.5-.5"
          />
    </svg>
  );
});

IcBatteryHorizontal1Bar.displayName = 'IcBatteryHorizontal1Bar';
