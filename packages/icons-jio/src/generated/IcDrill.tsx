import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDrill = forwardRef<SVGSVGElement, IconComponentProps>(function IcDrill(
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
            d="M5 7H3a1 1 0 0 0 0 2h2a2 2 0 0 0 2 2h2V5H7a2 2 0 0 0-2 2m14.3 4.77A4 4 0 0 0 18 4h-5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1.28l1.33 4H14a2 2 0 0 0 0 4h4.38a2.62 2.62 0 0 0 2.38-3.71z"
          />
    </svg>
  );
});

IcDrill.displayName = 'IcDrill';
