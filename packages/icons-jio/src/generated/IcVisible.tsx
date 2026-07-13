import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcVisible = forwardRef<SVGSVGElement, IconComponentProps>(function IcVisible(
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
            d="M21.69 10.74A10.87 10.87 0 0 0 12 5a10.87 10.87 0 0 0-9.69 5.74 2.74 2.74 0 0 0 0 2.52A10.87 10.87 0 0 0 12 19a10.87 10.87 0 0 0 9.69-5.74 2.74 2.74 0 0 0 0-2.52m-9.1 4.2a3 3 0 1 1-1.183-5.881 3 3 0 0 1 1.183 5.881"
          />
    </svg>
  );
});

IcVisible.displayName = 'IcVisible';
