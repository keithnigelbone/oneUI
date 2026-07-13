import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTest = forwardRef<SVGSVGElement, IconComponentProps>(function IcTest(
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
            d="M18.5 2h-13a1.5 1.5 0 0 0 0 3H6v11a6 6 0 1 0 12 0V5h.5a1.5 1.5 0 0 0 0-3M16 10H8V5h8z"
          />
    </svg>
  );
});

IcTest.displayName = 'IcTest';
