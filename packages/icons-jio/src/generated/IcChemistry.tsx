import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcChemistry = forwardRef<SVGSVGElement, IconComponentProps>(function IcChemistry(
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
            d="M20.64 17.25 16 9.21V5h1a1 1 0 1 0 0-2H7a1 1 0 0 0 0 2h1v4.21l-4.64 8a2.44 2.44 0 0 0 0 2.5A2.47 2.47 0 0 0 5.52 21h13a2.47 2.47 0 0 0 2.484-2.506 2.44 2.44 0 0 0-.364-1.244M12.5 16a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m3 2.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcChemistry.displayName = 'IcChemistry';
