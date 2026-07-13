import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWaterBottle = forwardRef<SVGSVGElement, IconComponentProps>(function IcWaterBottle(
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
            d="M10 5h4a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1m7 8a2 2 0 0 0-2-2 2 2 0 0 0 0-4H9a2 2 0 1 0 0 4 2 2 0 1 0 0 4 2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2 2 2 0 0 0 2-2"
          />
    </svg>
  );
});

IcWaterBottle.displayName = 'IcWaterBottle';
