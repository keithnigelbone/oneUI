import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTarget = forwardRef<SVGSVGElement, IconComponentProps>(function IcTarget(
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
            d="M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4m0-4a6 6 0 1 0 0 12 6 6 0 0 0 0-12m0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8m0-14a10 10 0 1 0 0 20 10 10 0 0 0 0-20m0 18a8 8 0 1 1 0-16.001A8 8 0 0 1 12 20"
          />
    </svg>
  );
});

IcTarget.displayName = 'IcTarget';
