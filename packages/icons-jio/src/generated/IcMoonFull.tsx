import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMoonFull = forwardRef<SVGSVGElement, IconComponentProps>(function IcMoonFull(
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
            d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10"
          />
    </svg>
  );
});

IcMoonFull.displayName = 'IcMoonFull';
