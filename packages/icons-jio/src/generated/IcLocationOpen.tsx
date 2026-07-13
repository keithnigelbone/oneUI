import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcLocationOpen = forwardRef<SVGSVGElement, IconComponentProps>(function IcLocationOpen(
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
            d="M17.66 4.34A8 8 0 0 0 4 10c0 5 5.94 10.8 6.62 11.45a2 2 0 0 0 2.76 0C14.06 20.8 20 15 20 10a8 8 0 0 0-2.34-5.66M12 16a6 6 0 1 1 0-12 6 6 0 0 1 0 12"
          />
    </svg>
  );
});

IcLocationOpen.displayName = 'IcLocationOpen';
