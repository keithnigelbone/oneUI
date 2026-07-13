import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcChevronLeftCircle = forwardRef<SVGSVGElement, IconComponentProps>(function IcChevronLeftCircle(
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
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m2.21 13.29a1.002 1.002 0 0 1-.325 1.639 1 1 0 0 1-1.095-.219l-4-4a1 1 0 0 1 0-1.42l4-4a1.003 1.003 0 1 1 1.42 1.42L10.91 12z"
          />
    </svg>
  );
});

IcChevronLeftCircle.displayName = 'IcChevronLeftCircle';
