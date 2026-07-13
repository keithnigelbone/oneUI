import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcForward1 = forwardRef<SVGSVGElement, IconComponentProps>(function IcForward1(
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
            d="m14.71 11.29-7-7a1.004 1.004 0 1 0-1.42 1.42l6.3 6.29-6.3 6.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l7-7a1 1 0 0 0 0-1.42m5 0-7-7a1.004 1.004 0 1 0-1.42 1.42l6.3 6.29-6.3 6.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l7-7a1 1 0 0 0 0-1.42"
          />
    </svg>
  );
});

IcForward1.displayName = 'IcForward1';
