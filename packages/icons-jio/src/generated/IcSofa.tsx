import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSofa = forwardRef<SVGSVGElement, IconComponentProps>(function IcSofa(
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
            d="M19 7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v5h14zm2 2a1 1 0 0 0-1 1v3H4v-3a1 1 0 0 0-2 0v6a1 1 0 0 0 1 1h1v1a1 1 0 1 0 2 0v-1h12v1a1 1 0 0 0 2 0v-1h1a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcSofa.displayName = 'IcSofa';
