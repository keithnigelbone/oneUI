import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcNetworkDish = forwardRef<SVGSVGElement, IconComponentProps>(function IcNetworkDish(
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
            d="M15.94 8.47Q16 8.24 16 8a2 2 0 0 0-2-2q-.24 0-.47.06L9.77 2.29a1 1 0 0 0-1.42 0 8 8 0 0 0-1.69 8.86 2.94 2.94 0 0 0 .42 4.13L5.31 20H5a1 1 0 0 0 0 2h8a1 1 0 1 0 0-2h-.54l-1.6-4.66a8 8 0 0 0 8.85-1.69 1 1 0 0 0 0-1.42zM7.44 20 9 16l1.38 4zM14 4a4 4 0 0 1 4 4 1 1 0 0 0 2 0 6 6 0 0 0-6-6 1 1 0 1 0 0 2"
          />
    </svg>
  );
});

IcNetworkDish.displayName = 'IcNetworkDish';
