import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWaterBottleReuseable = forwardRef<SVGSVGElement, IconComponentProps>(function IcWaterBottleReuseable(
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
            d="M7 11.27a.93.93 0 0 0 .46.84 1 1 0 0 1 0 1.78.93.93 0 0 0-.46.84V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-5.27a.93.93 0 0 0-.46-.84 1 1 0 0 1 0-1.78.93.93 0 0 0 .46-.84V10H7zM15 5h-1V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v2H9a2 2 0 0 0-2 2v1h10V7a2 2 0 0 0-2-2"
          />
    </svg>
  );
});

IcWaterBottleReuseable.displayName = 'IcWaterBottleReuseable';
