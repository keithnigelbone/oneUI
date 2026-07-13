import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSmsReceive = forwardRef<SVGSVGElement, IconComponentProps>(function IcSmsReceive(
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
            d="M15 4H9a7 7 0 0 0-1 13.92V20a1.5 1.5 0 0 0 2.4 1.2l4.27-3.2H15a7 7 0 0 0 0-14m2.71 5.71L15.41 12H16a1 1 0 0 1 0 2h-3a1 1 0 0 1-.38-.08 1 1 0 0 1-.54-.54A1 1 0 0 1 12 13v-3a1 1 0 1 1 2 0v.59l2.29-2.3a1.004 1.004 0 0 1 1.42 1.42"
          />
    </svg>
  );
});

IcSmsReceive.displayName = 'IcSmsReceive';
