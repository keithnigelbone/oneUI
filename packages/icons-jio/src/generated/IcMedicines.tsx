import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMedicines = forwardRef<SVGSVGElement, IconComponentProps>(function IcMedicines(
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
            d="M4 7h1v1a1 1 0 1 0 2 0V7h1a1 1 0 0 0 0-2H7V4a1 1 0 0 0-2 0v1H4a1 1 0 0 0 0 2m16-2a4.44 4.44 0 0 0-6.43-.42l-4 3.6 6.29 6.29 3.71-3.36A4.44 4.44 0 0 0 20 5M4.4 12.89a4.44 4.44 0 1 0 6 6.53l4-3.6-6.29-6.29z"
          />
    </svg>
  );
});

IcMedicines.displayName = 'IcMedicines';
