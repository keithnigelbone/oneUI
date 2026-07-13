import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHairDresser = forwardRef<SVGSVGElement, IconComponentProps>(function IcHairDresser(
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
            d="M21.58 6.19a1 1 0 0 0-.9-.14l-4.22 1.41-.46 3.66a1 1 0 0 1-.15.42l3.52-1A3.69 3.69 0 0 0 22 7a1 1 0 0 0-.42-.81m-8.8 9.06.27-2.65 1.4-.71a1 1 0 0 0 .54-.77l1-8A1 1 0 0 0 15 2a3.19 3.19 0 0 0-3.19 2.89l-.6 5.91-2.77.81A3.49 3.49 0 1 0 9 13.53l2-.59-.21 2.13a3.52 3.52 0 1 0 2 .18zM5.5 15a1.5 1.5 0 1 1 0-2.999A1.5 1.5 0 0 1 5.5 15m6 5a1.5 1.5 0 1 1 0-2.999 1.5 1.5 0 0 1 0 2.999"
          />
    </svg>
  );
});

IcHairDresser.displayName = 'IcHairDresser';
