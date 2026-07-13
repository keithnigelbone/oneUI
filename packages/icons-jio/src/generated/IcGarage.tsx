import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcGarage = forwardRef<SVGSVGElement, IconComponentProps>(function IcGarage(
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
            d="M7 21h10v-2H7zm0-4h10v-2H7zm0-4h10v-2H7zm13.06-5.32-7-4.38a2 2 0 0 0-2.12 0l-7 4.38A2 2 0 0 0 3 9.38V19a2 2 0 0 0 2 2V10.5A1.5 1.5 0 0 1 6.5 9h11a1.5 1.5 0 0 1 1.5 1.5V21a2 2 0 0 0 2-2V9.38a2 2 0 0 0-.94-1.7"
          />
    </svg>
  );
});

IcGarage.displayName = 'IcGarage';
