import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAux35 = forwardRef<SVGSVGElement, IconComponentProps>(function IcAux35(
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
            d="M13 3a1 1 0 0 0-2 0v1h2zm1 5h-1V6h-2v2h-1a2 2 0 0 0-2 2v5a4 4 0 0 0 3 3.86V21a1 1 0 0 0 2 0v-2.14A4 4 0 0 0 16 15v-5a2 2 0 0 0-2-2"
          />
    </svg>
  );
});

IcAux35.displayName = 'IcAux35';
