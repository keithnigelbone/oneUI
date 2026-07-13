import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSmileySatisfied = forwardRef<SVGSVGElement, IconComponentProps>(function IcSmileySatisfied(
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
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M7 9.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m9.24 6.74a6 6 0 0 1-8.48 0 1 1 0 0 1 1.41-1.41 4.1 4.1 0 0 0 5.66 0 1 1 0 0 1 1.41 1.41M15.5 11a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
          />
    </svg>
  );
});

IcSmileySatisfied.displayName = 'IcSmileySatisfied';
