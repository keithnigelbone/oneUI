import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcNetwork = forwardRef<SVGSVGElement, IconComponentProps>(function IcNetwork(
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
            d="M19 15h-1v-2a2 2 0 0 0-2-2h-3V9h1a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1v2H8a2 2 0 0 0-2 2v2H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H8v-2h8v2h-1a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2"
          />
    </svg>
  );
});

IcNetwork.displayName = 'IcNetwork';
