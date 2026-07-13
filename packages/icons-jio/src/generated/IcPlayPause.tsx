import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPlayPause = forwardRef<SVGSVGElement, IconComponentProps>(function IcPlayPause(
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
            d="M11.27 10.52 5 5.69a1.86 1.86 0 0 0-3 1.48v9.66a1.86 1.86 0 0 0 3 1.48l6.27-4.83a1.87 1.87 0 0 0 0-2.96M15.5 6A1.5 1.5 0 0 0 14 7.5v9a1.5 1.5 0 0 0 3 0v-9A1.5 1.5 0 0 0 15.5 6m5 0A1.5 1.5 0 0 0 19 7.5v9a1.5 1.5 0 0 0 3 0v-9A1.5 1.5 0 0 0 20.5 6"
          />
    </svg>
  );
});

IcPlayPause.displayName = 'IcPlayPause';
