import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcArea = forwardRef<SVGSVGElement, IconComponentProps>(function IcArea(
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
            d="M18 3H6a3 3 0 0 0-1.29.3l16 16c.193-.406.292-.85.29-1.3V6a3 3 0 0 0-3-3M3 6v12a3 3 0 0 0 3 3h12a3 3 0 0 0 1.29-.3l-16-16A3 3 0 0 0 3 6"
          />
    </svg>
  );
});

IcArea.displayName = 'IcArea';
