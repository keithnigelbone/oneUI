import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcEthernet = forwardRef<SVGSVGElement, IconComponentProps>(function IcEthernet(
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
            d="M8 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2m4 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-7.59 1 3.3-3.29a1.004 1.004 0 1 0-1.42-1.42l-4 4a1 1 0 0 0 0 1.42l4 4a1 1 0 0 0 1.639-.325 1 1 0 0 0-.22-1.095zm17.3-.71-4-4a1.004 1.004 0 1 0-1.42 1.42l3.3 3.29-3.3 3.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l4-4a1 1 0 0 0 0-1.42M17 12a1 1 0 1 0-2 0 1 1 0 0 0 2 0"
          />
    </svg>
  );
});

IcEthernet.displayName = 'IcEthernet';
