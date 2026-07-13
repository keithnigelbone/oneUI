import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcApartmentComplex = forwardRef<SVGSVGElement, IconComponentProps>(function IcApartmentComplex(
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
            d="M20 3H8a1 1 0 0 0 0 2v2H4a1 1 0 0 0 0 2v10a2 2 0 0 0 2 2h6.5v-5h3v5H18a2 2 0 0 0 2-2V5a1 1 0 1 0 0-2M8 17H6v-2h2zm0-4H6v-2h2zm5 0h-2v-2h2zm0-4h-2V7h2zm4 4h-2v-2h2zm0-4h-2V7h2z"
          />
    </svg>
  );
});

IcApartmentComplex.displayName = 'IcApartmentComplex';
