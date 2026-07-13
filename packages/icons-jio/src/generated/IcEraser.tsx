import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcEraser = forwardRef<SVGSVGElement, IconComponentProps>(function IcEraser(
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
            d="m15.41 16 5.3-5.29a1 1 0 0 0 .219-1.095 1 1 0 0 0-.22-.325l-6-6a1 1 0 0 0-1.42 0L7.38 9.21 14.17 16zM20 18h-6.67L6 10.62l-2.71 2.67a1 1 0 0 0 0 1.42l5 5A1 1 0 0 0 9 20h11a1 1 0 1 0 0-2"
          />
    </svg>
  );
});

IcEraser.displayName = 'IcEraser';
