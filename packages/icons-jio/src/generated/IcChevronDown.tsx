import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcChevronDown = forwardRef<SVGSVGElement, IconComponentProps>(function IcChevronDown(
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
            d="M12 15a1 1 0 0 1-.71-.29l-4-4a1.004 1.004 0 1 1 1.42-1.42l3.29 3.3 3.29-3.3a1.004 1.004 0 1 1 1.42 1.42l-4 4A1 1 0 0 1 12 15"
          />
    </svg>
  );
});

IcChevronDown.displayName = 'IcChevronDown';
