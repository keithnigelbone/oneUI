import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcLayout = forwardRef<SVGSVGElement, IconComponentProps>(function IcLayout(
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
            d="M3 18c0 1.66 1.34 3 3 3h8V10H3zM18 3H6C4.34 3 3 4.34 3 6v2h18V6c0-1.66-1.34-3-3-3m-2 18h2c1.66 0 3-1.34 3-3v-8h-5z"
          />
    </svg>
  );
});

IcLayout.displayName = 'IcLayout';
