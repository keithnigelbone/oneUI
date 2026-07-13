import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcStop = forwardRef<SVGSVGElement, IconComponentProps>(function IcStop(
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
            d="M16.84 4H7.16A3.16 3.16 0 0 0 4 7.16v9.68A3.16 3.16 0 0 0 7.16 20h9.68A3.16 3.16 0 0 0 20 16.84V7.16A3.16 3.16 0 0 0 16.84 4"
          />
    </svg>
  );
});

IcStop.displayName = 'IcStop';
