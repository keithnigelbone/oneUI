import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBrightness = forwardRef<SVGSVGElement, IconComponentProps>(function IcBrightness(
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
            d="m7.05 15.54-.71.7a1.004 1.004 0 0 0 1.42 1.42l.7-.71a1 1 0 1 0-1.41-1.41M7 12a1 1 0 0 0-1-1H5a1 1 0 0 0 0 2h1a1 1 0 0 0 1-1m10-3.54.71-.7a1.004 1.004 0 1 0-1.42-1.42l-.7.71A1 1 0 1 0 17 8.46M12 7a1 1 0 0 0 1-1V5a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1M7.05 8.46a1 1 0 1 0 1.41-1.41l-.7-.71a1.004 1.004 0 1 0-1.42 1.42zM12 17a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0v-1a1 1 0 0 0-1-1m7-6h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2m-2 4.54A1.033 1.033 0 0 0 15.54 17l.7.71a1.004 1.004 0 1 0 1.42-1.42zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8"
          />
    </svg>
  );
});

IcBrightness.displayName = 'IcBrightness';
