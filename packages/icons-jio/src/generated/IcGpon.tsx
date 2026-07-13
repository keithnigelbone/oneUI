import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcGpon = forwardRef<SVGSVGElement, IconComponentProps>(function IcGpon(
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
            d="M18.5 13a2.7 2.7 0 0 0-.7.11l-4.7-5.37a2.5 2.5 0 1 0-2.2 0l-4.7 5.37a2.7 2.7 0 0 0-.7-.11A2.5 2.5 0 1 0 8 15.5c0-.383-.093-.76-.27-1.1L11 10.66v5.55a2.5 2.5 0 1 0 2 0v-5.55l3.27 3.74a2.4 2.4 0 0 0-.27 1.1 2.5 2.5 0 1 0 2.5-2.5"
          />
    </svg>
  );
});

IcGpon.displayName = 'IcGpon';
