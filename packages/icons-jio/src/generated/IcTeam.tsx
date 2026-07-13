import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTeam = forwardRef<SVGSVGElement, IconComponentProps>(function IcTeam(
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
            d="M7 11a3 3 0 0 0 .69-.09A5.48 5.48 0 0 1 7.1 5H7a3 3 0 1 0 0 6m5 0a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m5 0a3 3 0 0 0 0-6h-.1a5.48 5.48 0 0 1-.59 5.9 3 3 0 0 0 .69.1m-5 1a6 6 0 0 0-6 6 2 2 0 0 0 2 2h8a2 2 0 0 0 2-2 6 6 0 0 0-6-6m5.31 0A8 8 0 0 1 20 18a4 4 0 0 1-.14 1H20a2 2 0 0 0 2-2 5 5 0 0 0-4.69-5M6.69 12A5 5 0 0 0 2 17a2 2 0 0 0 2 2h.14A4 4 0 0 1 4 18a8 8 0 0 1 2.69-6"
          />
    </svg>
  );
});

IcTeam.displayName = 'IcTeam';
