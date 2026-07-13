import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSewingMachine = forwardRef<SVGSVGElement, IconComponentProps>(function IcSewingMachine(
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
            d="M18 3H7a3 3 0 0 0-3 3v3a2 2 0 0 0 2 2v1a1 1 0 1 0 2 0v-1a2 2 0 0 0 2-2h3a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H6a3 3 0 0 0-3 3v2a1 1 0 0 0 1 1h1a1 1 0 1 0 2 0h10a1 1 0 0 0 2 0h1a1 1 0 0 0 1-1V6a3 3 0 0 0-3-3"
          />
    </svg>
  );
});

IcSewingMachine.displayName = 'IcSewingMachine';
