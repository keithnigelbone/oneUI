import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcApartment = forwardRef<SVGSVGElement, IconComponentProps>(function IcApartment(
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
            d="M20 3H4a1 1 0 0 0 0 2v14a2 2 0 0 0 2 2h4v-5h4v5h4a2 2 0 0 0 2-2V5a1 1 0 1 0 0-2M9 13H7v-2h2zm0-4H7V7h2zm4 4h-2v-2h2zm0-4h-2V7h2zm4 4h-2v-2h2zm0-4h-2V7h2z"
          />
    </svg>
  );
});

IcApartment.displayName = 'IcApartment';
