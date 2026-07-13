import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTimelapse = forwardRef<SVGSVGElement, IconComponentProps>(function IcTimelapse(
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
            d="M12 6v6l-5 3.33A6 6 0 1 0 12 6m0-4a10 10 0 1 0 0 20 10 10 0 0 0 0-20m0 18a8 8 0 1 1 0-16.001A8 8 0 0 1 12 20"
          />
    </svg>
  );
});

IcTimelapse.displayName = 'IcTimelapse';
