import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBabyBottle = forwardRef<SVGSVGElement, IconComponentProps>(function IcBabyBottle(
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
            d="M19 9h-1.44v-.33a2.23 2.23 0 0 0-2.23-2.23h-1.11V4.22a2.22 2.22 0 0 0-4.44 0v2.22H8.67a2.23 2.23 0 0 0-2.23 2.23V9H5a1 1 0 0 0 0 2h14a1 1 0 0 0 0-2M6.44 19.78A2.23 2.23 0 0 0 8.67 22h6.66a2.23 2.23 0 0 0 2.23-2.22V13H6.44z"
          />
    </svg>
  );
});

IcBabyBottle.displayName = 'IcBabyBottle';
