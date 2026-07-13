import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcGas = forwardRef<SVGSVGElement, IconComponentProps>(function IcGas(
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
            d="M16 6V4a1 1 0 1 0 0-2H8a1 1 0 0 0 0 2v2a3 3 0 0 0-3 3v8a3 3 0 0 0 2 2.82A1 1 0 0 0 7 20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2q.008-.09 0-.18A3 3 0 0 0 19 17V9a3 3 0 0 0-3-3m-3 0h-2a1 1 0 1 1 0-2h2a1 1 0 1 1 0 2"
          />
    </svg>
  );
});

IcGas.displayName = 'IcGas';
