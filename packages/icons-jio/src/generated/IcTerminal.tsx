import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTerminal = forwardRef<SVGSVGElement, IconComponentProps>(function IcTerminal(
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
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3M9.71 9.71l-2 2a1 1 0 0 1-1.639-.325 1 1 0 0 1 .219-1.095L7.59 9l-1.3-1.29a1.004 1.004 0 0 1 1.42-1.42l2 2a1 1 0 0 1 0 1.42M17 12h-4a1 1 0 0 1 0-2h4a1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcTerminal.displayName = 'IcTerminal';
