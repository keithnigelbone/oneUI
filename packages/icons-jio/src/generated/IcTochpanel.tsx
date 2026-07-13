import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTochpanel = forwardRef<SVGSVGElement, IconComponentProps>(function IcTochpanel(
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
            d="M18 3H6a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h4v1a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-1h2a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m1 12a1 1 0 0 1-1 1h-2l.81-2.8v-.15a2 2 0 0 0-1.6-2.21L12 10.18V8a1 1 0 0 0-2 0v4.13l-1.45-1A1 1 0 0 0 7.2 12.6L9.75 16H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1z"
          />
    </svg>
  );
});

IcTochpanel.displayName = 'IcTochpanel';
