import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcChevronRight = forwardRef<SVGSVGElement, IconComponentProps>(function IcChevronRight(
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
            d="M10 17a1 1 0 0 1-1.006-1 1 1 0 0 1 .296-.71l3.3-3.29-3.3-3.29a1.004 1.004 0 0 1 1.42-1.42l4 4a1 1 0 0 1 .219 1.095 1 1 0 0 1-.22.325l-4 4A1 1 0 0 1 10 17"
          />
    </svg>
  );
});

IcChevronRight.displayName = 'IcChevronRight';
