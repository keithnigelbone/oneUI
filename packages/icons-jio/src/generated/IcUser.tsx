import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcUser = forwardRef<SVGSVGElement, IconComponentProps>(function IcUser(
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
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m0 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6m0 14a8 8 0 0 1-6.54-3.41C6.46 15.08 9 14 12 14s5.54 1.08 6.54 2.59A8 8 0 0 1 12 20"
          />
    </svg>
  );
});

IcUser.displayName = 'IcUser';
