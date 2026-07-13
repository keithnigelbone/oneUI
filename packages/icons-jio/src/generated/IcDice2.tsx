import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDice2 = forwardRef<SVGSVGElement, IconComponentProps>(function IcDice2(
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
            d="M16 6V5a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h1v-5a5 5 0 0 1 5-5zm3 2h-8a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3m-6.5 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
          />
    </svg>
  );
});

IcDice2.displayName = 'IcDice2';
