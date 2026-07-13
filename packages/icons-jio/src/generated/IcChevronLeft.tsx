import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcChevronLeft = forwardRef<SVGSVGElement, IconComponentProps>(function IcChevronLeft(
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
            d="M14 17a1 1 0 0 1-.71-.29l-4-4a1 1 0 0 1 0-1.42l4-4a1.005 1.005 0 0 1 1.42 1.42L11.41 12l3.3 3.29a1 1 0 0 1 .219 1.095 1 1 0 0 1-.93.615"
          />
    </svg>
  );
});

IcChevronLeft.displayName = 'IcChevronLeft';
