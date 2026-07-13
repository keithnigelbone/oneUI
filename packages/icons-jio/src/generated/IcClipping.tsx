import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcClipping = forwardRef<SVGSVGElement, IconComponentProps>(function IcClipping(
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
            d="M5 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4m1-2V9a1 1 0 0 0-2 0v6a1 1 0 1 0 2 0m13-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4m-1 2v6a1 1 0 0 0 2 0V9a1 1 0 0 0-2 0m1 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4M15 4H9a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2M5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4m10 15H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcClipping.displayName = 'IcClipping';
